"""Round 59: what each country bought from Russia, split by fuel, 2022 to the site's data month (August 2026).

The site's "Paid to Russia" line (T.paid = to_rus.years in site/data.json, EUR bn, current prices, 2026 = January to
August) is one number per country and year. This script splits it into crude oil, oil products, pipeline gas, LNG,
coal and other goods so that pages can answer "who buys Russian oil, gas, LNG", "Russian oil exports by country" or
"India's Russian oil imports", and the parts add up exactly to the site's total.

How (all inputs are already in the repository; nothing is downloaded):
  1. The starting split is the importers' own customs records by fuel (research/2026-10/gaps/prices.json
     windfall_parts "paid": Eurostat Comext for EU members, UN Comtrade for the others; CIF; pipeline gas of the
     European transit countries by country of final use, from energy2.json and gas_prices.json). Türkiye's customs hide
     the partner for crude and gas: the hidden HS 27 residual is split in proportion to two independent values, gas =
     EPDK's Russian gas volume (turkey_gas_r43.json) x Türkiye's researched Russian gas price (gas_prices.json) and
     crude = CREA's tracked Russian crude to Türkiye; the residual is 1.7x their sum in 2022 (BOTAŞ's high 2022
     prices, LPG and other hidden HS 27 codes) and 1.0-1.1x from 2023.
     Countries outside prices.json (1% of the total) take their fuel from the CREA fossil fuel tracker (Kpler-based
     shipments x CREA prices), capped at the total; with no tracker record either, everything is "other goods".
  2. The build (pipeline/build_data.py build()) is run in memory, read-only, with every step that changes to_rus
     traced. Each change is put on the part it concerns: the Russian crude in fuel that refiners (India, Türkiye,
     China, EU refiners, Brunei) export is charged to the final buyers as "laundered oil" (a separate line), so it comes
     off the refiner's crude; gold and other goods passed on by hubs (re-exports, Hong Kong gold, the UAE's Armenian
     gold) are "other"; Russian fuel resold by the UAE is products; the freight and insurance taken out to get to the
     Russian border (FOB) is taken off each part by its own factor (oil: the importer's ITIC margin and the war-time
     freight surge; other parts: the ITIC margin), scaled to the build's own total change.
  3. Whatever is left between the customs parts and the site's total is "other goods" (non-fuel is the remainder).
     The reconciliation gaps are reported.

Writes research/2026-10/gaps/fuel_split_r59.json and two extracts under research/2026-10/raw/fuel_split_r59/.
Run from the repository root: python3 -I research/2026-10/scripts/fuel_split_r59.py
The build is imported from pipeline/ without writing bytecode or any file there.
"""

import datetime
import gzip
import inspect
import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
R = ROOT / "research" / "2026-10"
GAPS = R / "gaps"
RAW = R / "raw" / "fuel_split_r59"
OUT = GAPS / "fuel_split_r59.json"
SITE = ROOT / "site" / "data.json"
YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
FUELS = ("crude", "products", "pipeline_gas", "lng", "coal")
PARTS = FUELS + ("other",)
CREA_FUEL = {
    "Crude oil": "crude",
    "Oil products and chemicals": "products",
    "Pipeline gas": "pipeline_gas",
    "LNG": "lng",
    "Coal": "coal",
}
CREA_FILE = R / "raw" / "crea_api" / "counter_month_country_fuel_2026-10-23.json.gz"
MWH_PER_MCM = 10_550.0  # build_data.py MWH_PER_BCM / 1000

# which part each traced build step changes (see the module docstring); "prop" spreads a change over the parts in
# proportion to their size, "freight" uses the per-part CIF->FOB factors, "audit2" splits gold (other) and fuel
STEP_RULE = {
    "reassign_laundered_oil": "prop",
    "apply_laundered_eu": "prop",
    "apply_laundered_r6": {"TUR": "products", "BRN": "crude"},
    "apply_assumptions_r11_laundered": "crude",
    "inline_before_eu_refiner_exports": "crude",  # India / Türkiye / China refining deduction inside build()
    "eu_refiner_exports": "crude",
    "apply_laundered_r39": "crude",
    "apply_reexports": "other",
    "apply_residual": "other",
    "apply_relocants": "other",
    "apply_brunei_r6": "crude",
    "uae_fuel_net": "products",
    "remove_freight": "freight",
    "apply_audit2": "audit2",
}
STEP_GROUP = {  # how the step is reported in "adjustments"
    "apply_laundered_r6": "fuel_passed_on_to_final_buyers",
    "apply_assumptions_r11_laundered": "fuel_passed_on_to_final_buyers",
    "inline_before_eu_refiner_exports": "fuel_passed_on_to_final_buyers",
    "eu_refiner_exports": "fuel_passed_on_to_final_buyers",
    "apply_laundered_r39": "fuel_passed_on_to_final_buyers",
    "apply_brunei_r6": "fuel_passed_on_to_final_buyers",
    "apply_reexports": "hub_goods_reassigned",
    "apply_residual": "hub_goods_reassigned",
    "apply_audit2": "audit2_uae_gold_and_fuel",
    "uae_fuel_net": "audit2_uae_gold_and_fuel",
    "remove_freight": "freight_to_fob",
}
# split error (relative, ~90%) by the basis of a part, on top of the site's own band for the total
SPLIT_ERR = {"A": 0.03, "B": 0.08, "C": 0.15, "tracker": 0.20, "residual": 0.25, "estimate": 0.40}
ADJ_ERR = 0.25  # share of the modelled reassignments (refining, hubs, audit) carried as error on the part they hit


def r(x: float, n: int = 4) -> float:
    return round(x + 0.0, n)


# ---------------------------------------------------------------------------------------------------- inputs


def crea_by_country_year() -> tuple[dict, dict, dict]:
    """CREA monthly value by destination and fuel -> EUR bn per ISO3, calendar year, 2026 = January-August."""
    import pycountry  # system package the build itself uses

    with gzip.open(CREA_FILE) as fh:
        d = json.loads(fh.read())
    col = {c: i for i, c in enumerate(d["columns"])}
    out: dict[str, dict] = {}
    world: dict[str, dict] = {str(y): dict.fromkeys(FUELS, 0.0) for y in YEARS}
    unmapped: dict[str, float] = {}
    for row in d["rows"]:
        month, iso2, fuel = row[col["month"]], row[col["destination_iso2"]], CREA_FUEL.get(row[col["commodity_group"]])
        y = int(month[:4])
        if fuel is None or y not in YEARS or (y == 2026 and int(month[5:7]) > 8):
            continue
        v = float(row[col["value_eur"]] or 0) / 1e9
        world[str(y)][fuel] += v
        c = pycountry.countries.get(alpha_2=iso2) if iso2 and len(iso2) == 2 else None
        iso3 = c.alpha_3 if c else {"XK": "XKX"}.get(iso2)
        if not iso3:
            key = f"{iso2}|{row[col['destination_country']]}"
            unmapped[key] = unmapped.get(key, 0.0) + v
            continue
        out.setdefault(iso3, {}).setdefault(str(y), dict.fromkeys(FUELS, 0.0))[fuel] += v
    meta = {"url": d["url"], "retrieved": d["retrieved"], "repository_copy": str(CREA_FILE.relative_to(ROOT))}
    return out, {"world": world, "unmapped": unmapped}, meta


def run_build_traced() -> dict:
    """Run build() in memory with the to_rus changes of every step recorded (nothing is written)."""
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(ROOT / "pipeline"))
    import build_data as B

    state: dict = {"depth": 0, "last": None, "events": [], "first": None, "S0": None, "probe": {}}

    def snap(countries: dict) -> dict[str, list[float]]:
        return {i: list((c.get("to_rus") or {}).get("years") or []) for i, c in countries.items()}

    def diff(a: dict, b: dict) -> dict[str, list[float]]:
        out = {}
        for i in set(a) | set(b):
            x, y = a.get(i) or [0.0] * 6, b.get(i) or [0.0] * 6
            d = [p - q for p, q in zip(x, y)]
            if any(abs(v) > 1e-9 for v in d):
                out[i] = d
        return out

    names = [
        n
        for n, f in vars(B).items()
        if inspect.isfunction(f)
        and f.__module__ == "build_data"
        and list(inspect.signature(f).parameters)[:1] == ["countries"]
    ]
    for n in names:
        f = getattr(B, n)

        def wrapped(*a, __f=f, __n=n, **k):
            countries = a[0]
            top = state["depth"] == 0 and isinstance(countries, dict)
            if top:
                now = snap(countries)
                if state["first"] is None:
                    state["first"] = (__n, now)
                elif d := diff(now, state["last"]):
                    state["events"].append(("inline_before_" + __n, d))
            state["depth"] += 1
            try:
                res = __f(*a, **k)
            finally:
                state["depth"] -= 1
            if top:
                after = snap(countries)
                if d := diff(after, now):
                    state["events"].append((__n, d))
                state["last"] = after
            return res

        setattr(B, n, wrapped)

    orig_add = B.Sources.add

    def add(self, sid, *a, **k):
        if sid == "transit_gas" and state["S0"] is None:
            state["S0"] = snap(sys._getframe(1).f_locals["countries"])
        return orig_add(self, sid, *a, **k)

    B.Sources.add = add
    orig_fi = B.fuel_index

    def fuel_index(iso3, band):
        fr = sys._getframe(1)
        if fr.f_code.co_name == "build" and band == "central" and iso3 not in state["probe"]:
            loc = fr.f_locals
            s0 = state["S0"].get(iso3) or [0.0] * 6
            if loc.get("tg"):
                pre = [max(0.0, t - c) + g for t, c, g in zip(s0, loc["cyears"], loc["gas"]["years"])]
            else:
                pre = s0
            state["probe"][iso3] = [max(0.0, p - q) for p, q in zip(loc["tr"]["years"], pre)]
        return orig_fi(iso3, band)

    B.fuel_index = fuel_index
    data = B.build()
    final = {i: c["to_rus"] for i, c in data["countries"].items() if c.get("to_rus")}
    if d := diff({i: v["years"] for i, v in final.items()}, state["last"]):
        state["events"].append(("inline_after_last_step", d))
    freight = {}
    for iso3 in final:
        cif = B.CIF_BY_IMPORTER.get(iso3, B.CIF_SHARE)[1]
        bp = B.BORDER_PRICED.get(iso3, {})
        fy = {}
        for y in YEARS:
            base = 1 - cif * (1 - bp.get(str(y), 0.0))
            fy[y] = {
                "crude": base * B.fob_factor(iso3, "crude", y),
                "products": base * B.fob_factor(iso3, "products", y),
                "other": base,
            }
        freight[iso3] = fy
    audit2 = {}
    for q in B.AUDIT2["questions"]:
        if q["id"] not in ("Q1", "Q2"):
            continue
        for x in q["corrections"]:
            if x.get("series") == "to_rus" and x["field"] == "years":
                k = (x["country"], int(x["year"]))
                audit2.setdefault(k, {"other": 0.0, "products": 0.0})
                audit2[k]["other" if q["id"] == "Q1" else "products"] += x["central"]
    return {
        "first_step": state["first"][0],
        "S1": state["first"][1],
        "events": state["events"],
        "max_probe": state["probe"],
        "final": final,
        "freight": freight,
        "audit2": audit2,
        "data_to": data["data_to"],
        "names": {i: c.get("name") for i, c in data["countries"].items()},
        "laund": {
            i: (c.get("laund") or {}).get("years") or (c.get("to_rus") or {}).get("laundered")
            for i, c in data["countries"].items()
        },
    }


# ---------------------------------------------------------------------------------------------------- bookkeeping


def spread(comp: dict, delta: float, keys=PARTS) -> None:
    """Add delta over the given parts in proportion to their (positive) size; evenly if all are zero."""
    pos = {k: max(0.0, comp[k]) for k in keys}
    tot = sum(pos.values())
    if tot <= 0:
        comp["other"] += delta
        return
    for k in keys:
        comp[k] += delta * pos[k] / tot


def put(comp: dict, part: str, delta: float, log: list, step: str) -> None:
    """Add delta to one part; what would push it below zero is spread over the other parts (and logged)."""
    comp[part] += delta
    if comp[part] < -1e-9:
        over = comp[part]
        comp[part] = 0.0
        spread(comp, over, tuple(k for k in PARTS if k != part))
        log.append({"step": step, "part": part, "overflow_eur_bn": r(over)})


def main() -> None:
    prices = json.loads((GAPS / "prices.json").read_text())["countries"]
    gasp = json.loads((GAPS / "gas_prices.json").read_text())["countries"]
    tgas = json.loads((GAPS / "turkey_gas_r43.json").read_text())["gas_imports_from_russia_mcm"]
    crea, crea_world, crea_meta = crea_by_country_year()
    t = run_build_traced()
    site = json.loads(SITE.read_text())
    site_c = site["countries"]
    assert t["data_to"] == site["data_to"], (t["data_to"], site["data_to"])
    mism = {
        i: [r(a - b) for a, b in zip(v["years"], site_c[i]["to_rus"]["years"])]
        for i, v in t["final"].items()
        if i in site_c and any(abs(a - b) > 1e-4 for a, b in zip(v["years"], site_c[i]["to_rus"]["years"]))
    }

    countries_out: dict[str, dict] = {}
    turkey_split: dict[str, dict] = {}
    recon_rows = []
    overflow_log: dict[str, list] = {}
    for iso3, tr in sorted(t["final"].items()):
        if iso3 not in site_c:
            continue
        p = prices.get(iso3)
        cert = (p or {}).get("certainty") or {}
        s1 = t["S1"].get(iso3) or [0.0] * 6
        comps, gross, basis_all, tracker_all = [], [], [], []
        for i, y in enumerate(YEARS):
            ys = str(y)
            comp = dict.fromkeys(PARTS, 0.0)
            basis = {}
            g = dict.fromkeys(PARTS, 0.0)
            of_which_other_fossil = 0.0
            cr = (crea.get(iso3) or {}).get(ys) or dict.fromkeys(FUELS, 0.0)
            if p:
                wp = p["windfall_parts"]
                paid = {k: ((v.get(ys) or {}).get("paid") or 0.0) for k, v in wp.items()}
                for f in FUELS:
                    g[f] = paid.get(f, 0.0)
                g["products"] += paid.get("other_fossil", 0.0)
                of_which_other_fossil = paid.get("other_fossil", 0.0)
                g["other"] = paid.get("non_fuel_goods", 0.0)
                hidden = paid.get("crude_gas_hidden", 0.0)
                if hidden:
                    # Türkiye: the hidden customs value split in proportion to EPDK gas volume x Türkiye's Russian
                    # pipeline-gas price and CREA's tracked crude (the two independent measures of each part)
                    pr = ((gasp.get(iso3) or {}).get("pipeline") or {}).get(ys) or {}
                    gas = (tgas.get(ys) or 0.0) * MWH_PER_MCM * (pr.get("central") or 0.0) / 1e9
                    crude = cr["crude"]
                    k = hidden / (gas + crude) if gas + crude > 0 else 0.0
                    g["pipeline_gas"] += gas * k
                    g["crude"] += crude * k if gas + crude > 0 else hidden
                    turkey_split[ys] = {
                        "hidden": r(hidden),
                        "gas_epdk_x_price": r(gas),
                        "crude_crea": r(crude),
                        "k": r(k),
                    }
                    basis["pipeline_gas"] = (
                        "customs HS 27 with partner hidden, split: EPDK volume x gas_prices.json price"
                    )
                    basis["crude"] = "customs HS 27 with partner hidden, split: CREA tracked crude"
                for f in FUELS:
                    if f in basis:
                        continue
                    b = ((p.get("basis") or {}).get(f) or {}).get(ys) or ""
                    if not g[f]:
                        basis[f] = "none recorded"
                    elif b.startswith("customs"):
                        basis[f] = b
                    elif b.startswith("gas_prices.json"):
                        basis[f] = "volume (customs, or final use for transit countries) x " + b
                    else:
                        basis[f] = "customs value or tracker tonnes, price " + (b or "filled")
                basis["other"] = "customs total minus customs HS 27 (non-fuel goods)"
            else:
                for f in FUELS:
                    g[f] = cr[f]
                    basis[f] = "CREA tracker (Kpler shipments x CREA price)" if cr[f] else "none tracked"
                basis["other"] = "site total minus tracked fuel (remainder)"
            comp.update(g)
            # customs layer -> the site's value at the first traced step (gas by final use, partner corrections,
            # non-reporters' paid share, the larger of customs and tracked fuel)
            gap = s1[i] - sum(comp.values())
            mx = (t["max_probe"].get(iso3) or [0.0] * 6)[i]
            log = overflow_log.setdefault(iso3, [])
            tot_cr, lift = sum(cr.values()), 0.0
            if mx > 1e-9 and gap > 0 and tot_cr > 0:
                lift = min(mx, gap)
                for f in FUELS:
                    comp[f] += lift * cr[f] / tot_cr
                gap -= lift
            if not p and sum(comp[f] for f in FUELS) > s1[i]:
                # tracked fuel above the site's total: fuel scaled down to it
                k = s1[i] / sum(comp[f] for f in FUELS) if sum(comp[f] for f in FUELS) else 0.0
                for f in FUELS:
                    comp[f] *= k
                comp["other"] = 0.0
                gap = s1[i] - sum(comp.values())
            # a site value above the customs parts is goods the customs split does not show (other); below them,
            # the customs mix is kept and every part scaled down (the cause is not known part by part)
            if gap >= 0:
                put(comp, "other", gap, log, f"customs_layer_{y}")
            else:
                spread(comp, gap)
            adj = dict.fromkeys(PARTS, 0.0)  # absolute modelled reassignments per part (for the error)
            groups: dict[str, float] = {"customs_layer_to_site": s1[i] - sum(g.values()) - lift, "tracker_floor": lift}
            for step, d in t["events"]:
                v = (d.get(iso3) or [0.0] * 6)[i]
                if abs(v) < 1e-12:
                    continue
                rule = STEP_RULE.get(step, "prop")
                if isinstance(rule, dict):
                    rule = rule.get(iso3, "prop")
                grp = STEP_GROUP.get(step, "other_corrections")
                groups[grp] = groups.get(grp, 0.0) + v
                before = dict(comp)
                if rule == "prop":
                    spread(comp, v)
                elif rule == "freight":
                    fr = t["freight"][iso3][y]
                    pred = {k: comp[k] * (fr.get(k, fr["other"]) - 1) for k in PARTS}
                    ps = sum(pred.values())
                    if abs(ps) > 1e-12:
                        for k in PARTS:
                            comp[k] += v * pred[k] / ps
                    else:
                        spread(comp, v)
                elif rule == "audit2":
                    # the audit's own amounts (Q1 gold -> other, Q2 fuel -> products); what the build's floors at
                    # zero changed is spread in proportion
                    a = t["audit2"].get((iso3, y)) or {}
                    for k, x in a.items():
                        put(comp, k, x, log, step)
                    rest = v - sum(a.values())
                    if abs(rest) > 1e-12:
                        spread(comp, rest)
                else:
                    put(comp, rule, v, log, step)
                if rule != "freight":
                    for k in PARTS:
                        adj[k] += abs(comp[k] - before[k])
            total = tr["years"][i]
            assert abs(sum(comp.values()) - total) < 1e-6, (iso3, y, sum(comp.values()), total)
            comps.append((comp, adj, groups, of_which_other_fossil))
            gross.append(g)
            basis_all.append(basis)
            tracker_all.append(cr)
            recon_rows.append((iso3, y, s1[i] - sum(g.values()) - lift, sum(g.values()), total))

        years_out = {}
        for i, y in enumerate(YEARS):
            comp, adj, groups, oof = comps[i]
            c, lo, hi = tr["years"][i], tr["years_lo"][i], tr["years_hi"][i]
            el = (c - lo) / c if c > 0 else 0.0
            eh = (hi - c) / c if c > 0 else 0.0
            cell, fuel_err2 = {}, 0.0
            for f in FUELS:
                v = comp[f]
                b = basis_all[i][f]
                if not p:
                    key = "tracker"
                elif "partner hidden" in b:
                    key = "residual"
                else:
                    key = cert.get(f, "C") if b.startswith(("customs:", "volume")) else "C"
                es = SPLIT_ERR.get(key, SPLIT_ERR["C"]) * v
                ea = ADJ_ERR * adj[f]
                fuel_err2 += es**2 + ea**2
                cell[f] = {
                    "low": r(max(0.0, v - math.sqrt((v * el) ** 2 + es**2 + ea**2))),
                    "central": r(v),
                    "high": r(v + math.sqrt((v * eh) ** 2 + es**2 + ea**2)),
                }
            o = comp["other"]
            eo_l = math.sqrt((o * el) ** 2 + fuel_err2 + (ADJ_ERR * adj["other"]) ** 2)
            eo_h = math.sqrt((o * eh) ** 2 + fuel_err2 + (ADJ_ERR * adj["other"]) ** 2)
            cell["other"] = {"low": r(max(0.0, o - eo_l)), "central": r(o), "high": r(o + eo_h)}
            cell["total_site"] = {"low": r(lo), "central": r(c), "high": r(hi)}
            fuel_c = sum(comp[f] for f in FUELS)
            gfuel = sum(gross[i][f] for f in FUELS)
            if p:
                measured = sum(
                    gross[i][f]
                    for f in FUELS
                    if basis_all[i][f].startswith(("customs:", "volume")) and cert.get(f, "C") in "AB"
                )
                share = measured / gfuel if gfuel else 1.0
                q = "A" if share >= 0.9 else "B" if share >= 0.5 else "C"
                qtext = {
                    "A": "measured: own customs by fuel",
                    "B": "mostly measured: customs by fuel, some parts filled",
                    "C": "estimate: customs values with filled prices or hidden partner",
                }[q]
                if iso3 == "TUR":
                    q, qtext = (
                        "C",
                        "estimate: customs hide the partner for crude and gas; EPDK gas volume, crude residual",
                    )
            elif sum(tracker_all[i].values()) > 0:
                q, qtext = "C", "estimate: fuel from the CREA tracker (Kpler-based), other goods the remainder"
            else:
                q, qtext = "D", "no fuel split: no customs fuel record in prices.json and nothing tracked by CREA"
            srcs = ["site_to_rus", "build_trace"]
            if p:
                srcs.insert(0, "prices_customs")
                if any(b.startswith("volume") for b in basis_all[i].values()):
                    srcs.append("gas_final_use")
                if iso3 == "TUR":
                    srcs += ["epdk", "gas_prices"]
            else:
                srcs.insert(0, "crea_tracker")
            gr = {k: r(v) for k, v in gross[i].items()}
            gr["total"] = r(sum(gross[i].values()))
            gr["of_which_other_fossil_in_products"] = r(oof)
            ld = t["laund"].get(iso3)
            years_out[str(y)] = {
                **cell,
                "fuel_total": r(fuel_c),
                "fuel_share": r(fuel_c / c, 3) if c > 0 else None,
                "gross_customs": gr if p else None,
                "tracker_crea": {k: r(v) for k, v in tracker_all[i].items()},
                "adjustments_customs_to_site": {k: r(v) for k, v in groups.items() if abs(v) > 5e-5},
                "memo_russian_crude_in_fuel_bought_from_third_countries": r(ld[i]) if ld else None,
                "basis": basis_all[i],
                "sources": srcs,
                "quality": q,
                "quality_note": qtext,
                "partial_year": "January-August" if y == 2026 else None,
            }
        sums = {}
        for k in PARTS + ("total_site",):
            sums[k] = {b: r(sum(years_out[str(y)][k][b] for y in YEARS[1:])) for b in ("low", "central", "high")}
        countries_out[iso3] = {
            "name": t["names"].get(iso3) or iso3,
            "years": years_out,
            "sum_2022_2026": sums,
            "gross_customs_sum_2022_2026": {k: r(sum(gross[i][k] for i in range(1, 6))) for k in PARTS} if p else None,
            "overflow_log": [x for x in overflow_log.get(iso3, []) if abs(x["overflow_eur_bn"]) > 1e-3] or None,
        }

    # ---------------------------------------------------------------- world totals, top buyers, coverage, gaps
    world = {}
    for y in YEARS:
        ys = str(y)
        world[ys] = {
            "site_basis": {
                k: r(sum(c["years"][ys][k]["central"] for c in countries_out.values()), 3)
                for k in PARTS + ("total_site",)
            },
            "gross_customs_reporters": {
                k: r(sum((c["years"][ys]["gross_customs"] or {}).get(k, 0.0) for c in countries_out.values()), 3)
                for k in PARTS
            },
            "crea_all_destinations": {k: r(v, 3) for k, v in crea_world["world"][ys].items()},
        }
    top = {}
    for f in FUELS:
        site_rank = sorted(((c["sum_2022_2026"][f]["central"], i) for i, c in countries_out.items()), reverse=True)[:15]
        gross_rank = sorted(
            ((c["gross_customs_sum_2022_2026"] or {}).get(f, 0.0), i) for i, c in countries_out.items()
        )[::-1][:15]
        crea_rank = sorted(
            ((sum((crea.get(i) or {}).get(str(y), {}).get(f, 0.0) for y in YEARS[1:]), i) for i in crea),
            reverse=True,
        )[:15]
        top[f] = {
            "site_basis": [{"iso3": i, "eur_bn": r(v, 2)} for v, i in site_rank if v > 0],
            "gross_customs": [{"iso3": i, "eur_bn": r(v, 2)} for v, i in gross_rank if v > 0],
            "crea_tracker": [{"iso3": i, "eur_bn": r(v, 2)} for v, i in crea_rank if v > 0],
        }
    cov = {"A": 0.0, "B": 0.0, "C": 0.0, "D": 0.0}
    cov_n = {"A": set(), "B": set(), "C": set(), "D": set()}
    for i, c in countries_out.items():
        for y in YEARS[1:]:
            q = c["years"][str(y)]["quality"]
            cov[q] += c["years"][str(y)]["total_site"]["central"]
            cov_n[q].add(i)
    tot_cov = sum(cov.values())
    coverage = {
        q: {
            "share_of_site_total_2022_2026": r(v / tot_cov, 4),
            "eur_bn": r(v, 1),
            "countries_with_any_year": len(cov_n[q]),
        }
        for q, v in cov.items()
    }
    coverage_table = []
    for i, c in sorted(countries_out.items(), key=lambda kv: -kv[1]["sum_2022_2026"]["total_site"]["central"]):
        qs = [c["years"][str(y)]["quality"] for y in YEARS[1:]]
        coverage_table.append(
            {
                "iso3": i,
                "name": c["name"],
                "total_site_2022_2026": c["sum_2022_2026"]["total_site"]["central"],
                "fuel_2022_2026": r(sum(c["sum_2022_2026"][f]["central"] for f in FUELS), 3),
                "quality_by_year": dict(zip([str(y) for y in YEARS[1:]], qs)),
                "split": "measured" if set(qs) <= {"A", "B"} else "estimate" if "D" not in qs else "none",
            }
        )
    gaps = sorted(
        (
            {
                "iso3": i,
                "year": y,
                "customs_parts_total": r(gt, 3),
                "site_value_at_first_traced_step": r(gt + gp, 3),
                "gap": r(gp, 3),
                "treatment": "added to other" if gp > 0 else "all parts scaled down, customs mix kept",
                "site_total_final": r(tot, 3),
            }
            for i, y, gp, gt, tot in recon_rows
            if y >= 2022 and abs(gp) > 0.25
        ),
        key=lambda x: -abs(x["gap"]),
    )
    # adjustments world-wide (customs -> site), by group and year
    adj_world = {}
    for c in countries_out.values():
        for ys, cell in c["years"].items():
            for g, v in cell["adjustments_customs_to_site"].items():
                adj_world.setdefault(g, {}).setdefault(ys, 0.0)
                adj_world[g][ys] += v
    adj_world = {g: {y: r(v, 3) for y, v in sorted(d.items())} for g, d in adj_world.items()}

    now = datetime.datetime.now(datetime.UTC).date().isoformat()
    RAW.mkdir(parents=True, exist_ok=True)
    (RAW / "crea_year_country_fuel_2021_2026jan-aug.json").write_text(
        json.dumps(
            {
                "what": "CREA Russia Fossil Tracker: value of Russian fossil fuel by destination and fuel, EUR bn, "
                "calendar years 2021-2025 and January-August 2026, aggregated from the monthly repository copy",
                "url": crea_meta["url"],
                "retrieved": crea_meta["retrieved"],
                "aggregated": now,
                "from": crea_meta["repository_copy"],
                "basis": "Kpler-tracked shipments x CREA modelled prices (pricing_scenario default); destination = "
                "first discharge port or pipeline border, not customs origin",
                "world_by_fuel": {y: {k: r(v, 3) for k, v in d.items()} for y, d in crea_world["world"].items()},
                "unmapped_destinations_eur_bn": {k: r(v, 3) for k, v in sorted(crea_world["unmapped"].items())},
                "countries": {
                    i: {y: {k: r(v, 4) for k, v in d.items()} for y, d in sorted(by.items())}
                    for i, by in sorted(crea.items())
                },
            },
            indent=1,
        )
        + "\n"
    )
    (RAW / "build_trace_to_rus.json").write_text(
        json.dumps(
            {
                "what": "Changes to to_rus.years (EUR bn, central) made by each step of pipeline/build_data.py build(), "
                "recorded in memory by research/2026-10/scripts/fuel_split_r59.py; first = the value at the first "
                "traced step (after gas by final use and the tracker floor)",
                "url": "repository: pipeline/build_data.py (read-only import)",
                "date": now,
                "first_step": t["first_step"],
                "first": {i: [r(v) for v in s] for i, s in sorted(t["S1"].items()) if s},
                "steps": [
                    {"step": n, "changes": {i: [r(v) for v in d] for i, d in sorted(dd.items())}}
                    for n, dd in t["events"]
                ],
                "tracker_floor_added": {i: [r(v) for v in d] for i, d in sorted(t["max_probe"].items()) if any(d)},
            },
            indent=0,
        )
        + "\n"
    )

    out = {
        "generated": now,
        "round": 59,
        "status": "research proposal: not read by the build; no site number changes",
        "data_to": site["data_to"],
        "unit": "EUR bn, current prices; 2026 = January-August",
        "years": YEARS,
        "note_2021": "2021 is the pre-war reference year, kept for comparison",
        "parts": {
            "crude": "crude oil (HS 2709)",
            "products": "oil products (HS 2710) plus other fossil products in HS 27 (coke, petcoke, bitumen, "
            "electricity; of_which_other_fossil_in_products in gross_customs)",
            "pipeline_gas": "natural gas by pipeline (HS 271121; European transit countries by country of final use)",
            "lng": "liquefied natural gas (HS 271111)",
            "coal": "coal (HS 2701)",
            "other": "everything else bought from Russia (fertiliser, metals, grain, gold passed on by hubs...): the "
            "site's total minus the five fuels, so the parts add up exactly",
            "total_site": "the site's 'Paid to Russia' value (to_rus.years in site/data.json): FOB at the Russian "
            "border, after the build's reassignments (see method)",
            "gross_customs": "what the importer's customs record, CIF, before the site's reassignments: the figure to "
            "quote for 'X's imports of Russian crude' (prices.json windfall_parts paid)",
            "tracker_crea": "CREA fossil fuel tracker for the same destination and year (Kpler-based shipments x CREA "
            "prices, FOB-like, destination = first discharge or pipeline border): an independent cross-check",
            "memo_russian_crude_in_fuel_bought_from_third_countries": "the site's separate 'laundered oil' line "
            "(Russian crude inside fuel bought from India, Türkiye, China...): not part of total_site",
        },
        "method": [
            (
                "Start: importers' customs by fuel (prices.json windfall_parts 'paid'; Eurostat Comext for the EU, UN "
                "Comtrade otherwise; Türkiye's hidden crude+gas value split in proportion to EPDK gas volume x "
                "gas_prices.json price and CREA tracked crude). Countries outside prices.json: CREA tracker fuel, remainder other."
            ),
            (
                "Customs layer to site: the build's value at its first traced step (gas by final use, partner and "
                "non-reporter corrections, the floor at tracked fuel value) above the customs parts goes on 'other'; "
                "below them, every part is scaled down with the customs mix kept; "
                "where the floor at tracked fuel lifted the value, that lift goes on the fuels in CREA's mix."
            ),
            (
                "Each later build step is put on the part it concerns (refiners' exported crude -> crude; hubs' gold and "
                "goods -> other; UAE fuel -> products; freight -> each part by its own CIF->FOB factor, scaled to the "
                "step's total); steps with no fuel meaning are spread in proportion."
            ),
            (
                "Ranges: the site's own band for the total, combined with a split error by basis (customs A 3%, B 8%, "
                "C 15%; tracker 20%; Türkiye's hidden crude and gas 25%) and 25% of the modelled reassignments that hit a part; "
                "'other' carries the fuel errors since it is the remainder. Low and high are not additive across parts."
            ),
        ],
        "sources": {
            "prices_customs": {
                "name": "Importers' customs by fuel: Eurostat Comext DS-045409 (EU), UN Comtrade (others), via "
                "research/2026-10/gaps/prices.json",
                "url": "https://ec.europa.eu/eurostat/comext/newxtweb/; https://comtradeplus.un.org/",
                "date": "2026-10-18",
                "kind": "customs (measured)",
            },
            "gas_final_use": {
                "name": "Russian pipeline gas by country of final use (Eurostat nrg_ti_gas, ENTSOG, CREA) at "
                "researched prices: energy2.json, gas_prices.json",
                "url": "https://ec.europa.eu/eurostat/databrowser/view/nrg_ti_gas/default/table",
                "date": "2026-10",
                "kind": "statistics x price (measured volume, researched price)",
            },
            "crea_tracker": {
                "name": "CREA Russia Fossil Tracker, monthly by destination and fuel",
                "url": crea_meta["url"],
                "date": crea_meta["retrieved"],
                "kind": "tracking (Kpler shipments x CREA price model), not customs",
            },
            "epdk": {
                "name": "EPDK (Türkiye's energy regulator): Russian gas imports, via turkey_gas_r43.json",
                "url": "https://www.epdk.gov.tr/Detay/Icerik/3-0-95/dogal-gazaylik-sektor-raporu",
                "date": "2026-10-24",
                "kind": "official statistics (volume)",
            },
            "gas_prices": {
                "name": "Russian gas price per country: research/2026-10/gaps/gas_prices.json",
                "url": "research/2026-10/gaps/gas_prices-notes.md",
                "date": "2026-10",
                "kind": "research estimate",
            },
            "site_to_rus": {
                "name": "The site's 'Paid to Russia' (site/data.json to_rus.years)",
                "url": "site/data.json",
                "date": site.get("generated"),
                "kind": "site total",
            },
            "build_trace": {
                "name": "Changes made by pipeline/build_data.py, traced in memory",
                "url": "research/2026-10/raw/fuel_split_r59/build_trace_to_rus.json",
                "date": now,
                "kind": "reconciliation",
            },
        },
        "quality_scale": {
            "A": "measured: at least 90% of fuel value from own customs priced with own unit values (prices.json A/B)",
            "B": "mostly measured: at least 50%",
            "C": "estimate: customs values with filled prices, a hidden partner (Türkiye), or the CREA tracker",
            "D": "no fuel split available: all counted as other goods",
        },
        "check_site_match": {"countries_differing_from_site_data_json": mism or None},
        "coverage": coverage,
        "coverage_table": coverage_table,
        "world": world,
        "world_adjustments_customs_to_site": adj_world,
        "top_buyers_2022_2026": top,
        "reconciliation_gaps_over_0_25bn": gaps,
        "turkey_hidden_split": turkey_split,
        "countries": countries_out,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")) + "\n")
    print("wrote", OUT.relative_to(ROOT), "countries", len(countries_out), "site mismatches", len(mism))


if __name__ == "__main__":
    main()
