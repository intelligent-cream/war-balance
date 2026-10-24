"""Round 43: Türkiye's Russian gas and crude from the regulator's own reports (EPDK), and a no-war band for Türkiye's
imports from Russia ("paid to Russia", to_rus) back-tested on Türkiye's own history, built the way cf_bands.json
builds own bands (B2) and combined with other goods by fuel share as fuel_volume_cf.json does.

Inputs (written by pipeline/fetch/epdk_entsog.py): raw/epdk/epdk_gas_imports_*.json, epdk_oil_imports_*.json,
tur_context_*.json (Eurostat nrg_ti_* TR<RU, Comtrade TUR<RUS TOTAL and HS 27, FRED IREXFUELS); gaps/to_rus_cf.json
(the generic band Türkiye has now), gaps/fuel_volume_cf.json (its fuel share and the round-8 test), gaps/hub_buyers.json
and gaps/laundered_r39.json (the crude figures the site uses now), site/data.json (Türkiye's current band).

Run from the repository root: python3 -I research/2026-10/scripts/turkey_gas_r43.py
Writes research/2026-10/gaps/turkey_gas_r43.json.
"""

import json
import math
import random
from pathlib import Path

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw" / "epdk"
GAPS = R / "gaps"


def latest(pattern: str) -> Path:
    return max(RAW.glob(pattern))


def num(s):
    s = (s or "").strip()
    if not s:
        return None
    s = s.replace(".", "").replace(",", ".") if "," in s else s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


gas_raw = json.loads(latest("epdk_gas_imports_*.json").read_text())
oil_raw = json.loads(latest("epdk_oil_imports_*.json").read_text())
ctx = json.loads(latest("tur_context_*.json").read_text())

# ---------------------------------------------------------------- EPDK gas, million Sm3
gas = {}
t14 = gas_raw["tables"]["2014"]["rows"]
hdr = [c.strip() for c in t14[0]]
for r in t14[1:]:
    if r and r[0].strip().isdigit():
        gas[int(r[0])] = {"russia": num(r[hdr.index("Rusya")]), "total": num(r[hdr.index("Toplam")])}
t24 = gas_raw["tables"]["2024"]["rows"]
years24 = [int(c) for c in t24[0][1:] if c.strip().isdigit()]
for r in t24[2:]:
    name = r[0].strip()
    if name in ("Rusya", "Genel Toplam"):
        for y, v in zip(years24, r[1 : 1 + len(years24)]):
            gas.setdefault(y, {})["russia" if name == "Rusya" else "total"] = num(v)
spot = {}
for r in gas_raw["tables"]["2024_spot"]["rows"][2:]:
    if r and r[0].strip().isdigit():
        spot[int(r[0])] = num(r[1])
monthly = {}
for key, year in (("2025_monthly_by_type_country", 2025), ("2026-08_monthly_by_type_country", 2026)):
    t = gas_raw["tables"][key]
    ru_s = (t.get("spot") or {}).get("Rusya Federasyonu", {"months": {}, "total": 0})
    ru_l = (t.get("long_term") or {}).get("Rusya Federasyonu", {"months": {}, "total": 0})
    months = list(t["total"]["months"])
    monthly[year] = {
        "months": months,
        "russia_spot_mcm": [round(ru_s["months"].get(m, 0) / 1e6, 1) for m in months],
        "russia_long_term_mcm": [round(ru_l["months"].get(m, 0) / 1e6, 1) for m in months],
        "all_sources_mcm": [round(t["total"]["months"][m] / 1e6, 1) for m in months],
    }
    gas.setdefault(year, {})
    gas[year]["russia"] = round((ru_s["total"] + ru_l["total"]) / 1e6, 1)
    gas[year]["total"] = round(t["total"]["year"] / 1e6, 1)
    gas[year]["months"] = len(months)
m25 = monthly[2025]
jan_aug_2025 = sum(m25["russia_spot_mcm"][:8]) + sum(m25["russia_long_term_mcm"][:8])
jan_aug_2026 = gas[2026]["russia"]

# Eurostat (what Türkiye reports to Eurostat): gas, crude, products, coal from Russia
es = {}
for ds, d in ctx["eurostat"].items():
    c = d["columns"]
    for row in d["rows"]:
        rec = dict(zip(c, row))
        es[(ds, rec["siec"], rec["partner"], rec["unit"], int(rec["time"]))] = rec["value"]
gas_es_mcm = {y: es.get(("nrg_ti_gas", "G3000", "RU", "MIO_M3", y)) for y in range(2004, 2025)}
gas_es_tj = {y: es.get(("nrg_ti_gas", "G3000", "RU", "TJ_GCV", y)) for y in range(2004, 2025)}
crude_es = {y: es.get(("nrg_ti_oil", "O4100_TOT", "RU", "THS_T", y)) for y in range(2004, 2025)}
prod_es = {y: es.get(("nrg_ti_oil", "O4600", "RU", "THS_T", y)) for y in range(2004, 2025)}
coal_es = {y: es.get(("nrg_ti_sff", "C0000X0350-0370", "RU", "THS_T", y)) for y in range(2004, 2025)}
epdk_vs_eurostat_gas = {
    y: round(gas[y]["russia"] / gas_es_mcm[y], 4) for y in range(2005, 2025) if gas_es_mcm.get(y) and y in gas
}

# ---------------------------------------------------------------- EPDK crude and products
PRODUCT_COLS = ["Benzin Türleri", "Motorin Türleri", "Fuel Oil Türleri", "Havacılık Yakıtları", "Denizcilik Yakıtları",
                "Diğer Ürünler"]  # fmt: skip
crude = {}
for key, t in oil_raw["imports_by_country"].items():
    ru = t["by_country"].get("Rusya Federasyonu") or {}
    tot = t["by_country"].get("Toplam") or {}
    crude[key] = {
        "russian_crude_mt": round((ru.get("Ham Petrol") or 0) / 1e6, 3),
        "all_crude_mt": round((tot.get("Ham Petrol") or 0) / 1e6, 3),
        "russian_share_of_crude": round((ru.get("Ham Petrol") or 0) / tot["Ham Petrol"], 4) if tot.get("Ham Petrol") else None,
        "russian_diesel_mt": round((ru.get("Motorin Türleri") or 0) / 1e6, 3),
        "russian_products_mt": round(sum(ru.get(c) or 0 for c in PRODUCT_COLS) / 1e6, 3),
        "russian_share_of_all_oil_imports": round((ru.get("Toplam") or 0) / tot["Toplam"], 4) if tot.get("Toplam") else None,
        "period": "Jan-Aug" if "jan_08" in key else "year",
    }  # fmt: skip
hb = json.loads((GAPS / "hub_buyers.json").read_text())["turkey_refining"]["by_year"]
l39 = json.loads((GAPS / "laundered_r39.json").read_text())["origin_russian_share_used"]
l39_a = l39.get("A", l39) if isinstance(l39, dict) else {}
energy = json.loads((GAPS / "energy.json").read_text())["countries"]["TUR"]["fossil_from_russia_by_fuel_mt"]
crude_cmp = {}
for y in range(2019, 2027):
    k = "2026_jan_08" if y == 2026 else str(y)
    e = crude.get(k)
    if not e:
        continue
    site_mt = (hb.get(str(y)) or {}).get("russian_crude_mt")
    share = l39_a.get(f"TUR|{y}")
    crude_cmp[str(y)] = {
        "epdk_russian_crude_mt": e["russian_crude_mt"],
        "site_hub_buyers_turkey_refining_mt": site_mt,
        "site_vs_epdk": round(site_mt / e["russian_crude_mt"] - 1, 3) if site_mt else None,
        "energy_json_crude_mt": (energy.get(str(y)) or {}).get("crude"),
        "epdk_russian_share_of_crude": e["russian_share_of_crude"],
        "laundered_r39_share_used": share[0] if share else None,
        "laundered_r39_share_range": [share[1], share[2]] if share else None,
        "epdk_share_inside_r39_range": (share[1] <= e["russian_share_of_crude"] <= share[2]) if share else None,
        "period": e["period"],
    }

# ---------------------------------------------------------------- volumes and real values for the back-test
# fuel volume index at fixed 2019-2021 unit values, as fuel_volume_cf.json (EUR): crude 370/t, products 420/t,
# pipeline gas 4.67/GJ GCV, coal 60/t. Gas from EPDK (million Sm3) at Eurostat's own GCV per Sm3 of that year.
gcv = {y: gas_es_tj[y] / gas_es_mcm[y] for y in gas_es_tj if gas_es_tj.get(y) and gas_es_mcm.get(y)}  # TJ per mcm
YRS = range(2005, 2022)
fuel_parts = {}
for y in YRS:
    g = gas[y]["russia"] * gcv[y] * 4670
    fuel_parts[y] = {"gas": g, "crude": crude_es[y] * 1e3 * 370, "products": prod_es[y] * 1e3 * 420,
                     "coal": (coal_es[y] or 0) * 1e3 * 60}  # fmt: skip
fuel = {y: sum(p.values()) for y, p in fuel_parts.items()}
gasv = {y: gas[y]["russia"] for y in YRS}
ct = {}
for per, cmd, val, _ in ctx["comtrade"]["rows"]:
    if cmd:
        ct.setdefault(int(per), {})[cmd] = val
defl = {int(k): v for k, v in ctx["fred"]["IREXFUELS"]["annual"].items()}
nonfuel = {y: (ct[y]["TOTAL"] - ct[y]["27"]) / defl[y] for y in YRS}
fd = json.loads((GAPS / "fuel_volume_cf.json").read_text())["countries"]["TUR"]
S_FUEL = fd["fuel_share"]  # 0.533, energy2.json fossil share 2019-2021
gas_share_of_fuel_2019_2021 = sum(fuel_parts[y]["gas"] for y in (2019, 2020, 2021)) / sum(
    fuel[y] for y in (2019, 2020, 2021)
)

W5 = [1, 1, 1, 1, 8 / 12]


def cum_ratio(series, o, h, w=None):
    w = w or [1] * h
    return sum(wi * series[o + i + 1] for i, wi in enumerate(w[:h])) / (sum(w[:h]) * series[o])


HS = ["H1", "H2", "H3", "H4", "H5", "H5_2026_8of12"]


def windows(kind):
    """log cumulative errors per horizon key: {H: {origin: log ratio}} (2021 held flat = random walk)."""
    out = {h: {} for h in HS}
    for i, hk in enumerate(HS):
        h = min(i + 1, 5)
        w = W5 if hk == "H5_2026_8of12" else None
        for o in range(2005, 2022 - h):
            if kind == "gas":
                r = cum_ratio(gasv, o, h, w)
            elif kind == "fuel":
                r = cum_ratio(fuel, o, h, w)
            elif kind == "nonfuel":
                r = cum_ratio(nonfuel, o, h, w)
            else:
                r = S_FUEL * cum_ratio(fuel, o, h, w) + (1 - S_FUEL) * cum_ratio(nonfuel, o, h, w)
            out[hk][o] = math.log(r)
    return out


def yearly_windows(kind):
    """log per-year errors h = 1..5 years after the origin (for multiplier_vs_2021)."""
    out = {}
    for h in range(1, 6):
        out[h] = {}
        for o in range(2005, 2022 - h):
            if kind == "gas":
                r = gasv[o + h] / gasv[o]
            else:
                r = S_FUEL * fuel[o + h] / fuel[o] + (1 - S_FUEL) * nonfuel[o + h] / nonfuel[o]
            out[h][o] = math.log(r)
    return out


def q(xs, p):
    xs = sorted(xs)
    if len(xs) == 1:
        return xs[0]
    k = (len(xs) - 1) * p
    f = math.floor(k)
    return xs[f] + (xs[min(f + 1, len(xs) - 1)] - xs[f]) * (k - f)


def band(errs: dict, rng: random.Random, nboot: int = 2000):
    """5th-95th percentile of the log errors, widened halfway to the block-bootstrap (by origin) 10%/90% bounds of
    those percentiles (cf_bands.json B2)."""
    xs = list(errs.values())
    lo, hi = q(xs, 0.05), q(xs, 0.95)
    bl, bh = [], []
    origins = list(errs)
    for _ in range(nboot):
        s = [errs[rng.choice(origins)] for _ in origins]
        bl.append(q(s, 0.05))
        bh.append(q(s, 0.95))
    blo, bhi = q(bl, 0.10), q(bh, 0.90)
    # the central (2021 held flat, log 0) always lies inside the band, so that a factor K widens both sides
    wlo, whi = min(0.0, lo + 0.5 * (min(blo, lo) - lo)), max(0.0, hi + 0.5 * (max(bhi, hi) - hi))
    return wlo, whi, (lo, hi), (blo, bhi)


def era_k(win: dict, rng: random.Random):
    """Smallest K >= 1 (step 0.05) such that bands from two eras of origins, x K, cover >= 90% of the third era's
    windows (all horizons pooled); eras 2005-09, 2010-13, 2014-20."""
    eras = {"E1": range(2005, 2010), "E2": range(2010, 2014), "E3": range(2014, 2021)}
    cover = {}
    for k in [1 + 0.05 * i for i in range(40)]:
        ok = True
        cover = {}
        for e, yrs in eras.items():
            hits = n = 0
            for hk in HS[:5]:
                train = {o: v for o, v in win[hk].items() if o not in yrs}
                test = {o: v for o, v in win[hk].items() if o in yrs}
                if len(train) < 3 or not test:
                    continue
                lo, hi = min(0.0, q(list(train.values()), 0.05)) * k, max(0.0, q(list(train.values()), 0.95)) * k
                hits += sum(lo <= v <= hi for v in test.values())
                n += len(test)
            cover[e] = round(hits / n, 3) if n else None
            ok &= (hits / n >= 0.9) if n else True
        if ok:
            return round(k, 2), cover
    return None, cover


def coverage(win: dict, rng: random.Random, k: float = 1.0):
    """cf_bands.json B2 checks. Leave-window-out: windows from origins 2007, 2012 and 2016 scored by bands built
    without any window whose years overlap them. Out of time: bands from windows ending by 2013, scored on origins
    2014-2020 (all horizons that end by 2021)."""
    lwo, lwo_origin = {}, {}
    for t in (2007, 2012, 2016):
        hits = n = hits_o = 0
        for i, hk in enumerate(HS[:5]):
            h = i + 1
            if t not in win[hk]:
                continue
            train = {o: v for o, v in win[hk].items() if o + h < t or o > t + h}
            lo, hi, _, _ = band(train, rng, 400)
            hits += lo * k <= win[hk][t] <= hi * k
            lo, hi, _, _ = band({o: v for o, v in win[hk].items() if o != t}, rng, 400)
            hits_o += lo * k <= win[hk][t] <= hi * k
            n += 1
        lwo[str(t)] = f"{hits}/{n}"
        lwo_origin[str(t)] = f"{hits_o}/{n}"
    hits = n = 0
    misses = []
    for i, hk in enumerate(HS[:5]):
        h = i + 1
        train = {o: v for o, v in win[hk].items() if o + h <= 2013}
        lo, hi, _, _ = band(train, rng, 400)
        lo, hi = lo * k, hi * k
        for o, v in win[hk].items():
            if o >= 2014:
                n += 1
                if lo <= v <= hi:
                    hits += 1
                else:
                    misses.append(f"{o}+{h}: x{math.exp(v):.2f} vs {math.exp(lo):.2f}-{math.exp(hi):.2f}")
    tot_lwo = [int(x.split("/")[0]) for x in lwo.values()], [int(x.split("/")[1]) for x in lwo.values()]
    return {
        "leave_window_out": {"hits": lwo, "rate": round(sum(tot_lwo[0]) / sum(tot_lwo[1]), 3),
                             "rule": "training windows exclude every window sharing a year with the test window"},
        "leave_origin_out": {"hits": lwo_origin, "rate": round(sum(int(x.split("/")[0]) for x in lwo_origin.values())
                                                                / sum(tot_lwo[1]), 3),
                             "rule": "only the test origin is left out (overlapping windows stay in training)"},
        "out_of_time_train_to_2013_test_origins_2014_2020": {"hits": f"{hits}/{n}", "rate": round(hits / n, 3),
                                                             "misses": misses},
        "in_sample_all_windows": None,
    }  # fmt: skip


def own_k(win: dict, rng: random.Random):
    """Smallest K >= 1 (step 0.05) at which the own band covers >= 90% of Türkiye's own windows in sample
    (fuel_volume_cf.json rule c) and >= 80% leave-window-out and out of time (cf_bands.json B2)."""
    full = {hk: band(win[hk], random.Random(1))[:2] for hk in HS[:5]}
    n = sum(len(win[hk]) for hk in HS[:5])
    for k in [1 + 0.05 * i for i in range(60)]:
        ins = sum(full[hk][0] * k <= v <= full[hk][1] * k for hk in HS[:5] for v in win[hk].values())
        if ins / n < 0.9:
            continue
        cov = coverage(win, random.Random(2), k)
        if (
            cov["leave_window_out"]["rate"] >= 0.8
            and cov["out_of_time_train_to_2013_test_origins_2014_2020"]["rate"] >= 0.8
        ):
            cov["in_sample_all_windows"] = f"{ins}/{n}"
            return round(k, 2), cov
    return None, None


def mband(lo, hi):
    return {"low": round(math.exp(lo), 3), "central": 1.0, "high": round(math.exp(hi), 3)}


rng = random.Random(43)
generic = json.loads((GAPS / "to_rus_cf.json").read_text())["countries"]
gen_L = next(d for d in generic.values() if d.get("size_class") == "L" and not d.get("fuel_split"))
CB_SCALE_PAID = 0.81  # pipeline/build_data.py: generic to_rus cumulative bands are scaled around 1 (round 43 placebo)
site_tur = json.loads((ROOT / "site" / "data.json").read_text())["countries"]["TUR"]["to_rus"]

results = {}
for kind in ("composite", "gas", "fuel", "nonfuel"):
    win = windows(kind)
    k, era_cov = era_k(win, rng)
    cb = {}
    detail = {}
    for hk in HS:
        lo, hi, raw, boot = band(win[hk], rng)
        lo, hi = lo * (k or 1), hi * (k or 1)
        cb[hk] = mband(lo, hi)
        detail[hk] = {"n": len(win[hk]), "q05_q95_raw": [round(math.exp(raw[0]), 3), round(math.exp(raw[1]), 3)],
                      "bootstrap_10_90": [round(math.exp(boot[0]), 3), round(math.exp(boot[1]), 3)]}  # fmt: skip
    ins = sum(cb[hk]["low"] <= math.exp(v) <= cb[hk]["high"] for hk in HS[:5] for v in win[hk].values())
    nin = sum(len(win[hk]) for hk in HS[:5])
    cov = coverage(win, rng)
    cov["in_sample_all_windows"] = f"{ins}/{nin}"
    k2, cov2 = own_k(win, rng)
    cal = None
    if k2:
        cal = {"K": k2, "coverage_at_K": cov2,
               "cumulative_band": {hk: mband(band(win[hk], random.Random(1))[0] * k2, band(win[hk], random.Random(1))[1] * k2) for hk in HS}}  # fmt: skip
        yw = yearly_windows(kind) if kind in ("composite", "gas") else None
        if yw:
            cal["multiplier_vs_2021"] = {str(2021 + h): mband(band(yw[h], random.Random(1))[0] * k2, band(yw[h], random.Random(1))[1] * k2) for h in range(1, 6)}  # fmt: skip
    res = {"cumulative_band": cb, "era_K": k, "era_coverage_at_K": era_cov, "detail": detail, "coverage": cov,
           "calibrated_on_own_coverage": cal,
           "windows_H5_2026_8of12": {str(o): round(math.exp(v), 3) for o, v in win["H5_2026_8of12"].items()}}  # fmt: skip
    if kind in ("composite", "gas"):
        yw = yearly_windows(kind)
        kk = k or 1
        res["multiplier_vs_2021"] = {}
        for h in range(1, 6):
            lo, hi, _, _ = band(yw[h], rng)
            res["multiplier_vs_2021"][str(2021 + h)] = mband(lo * kk, hi * kk)
    results[kind] = res


def b2_variant(kind: str, rng: random.Random):
    """cf_bands.json B2 literally: per-year random-walk errors 1-5 years ahead pooled over horizons as error / sqrt(h/3),
    5th-95th percentile widened halfway to the block-bootstrap (by origin) 10%/90% bounds; per-year band
    exp(q x sqrt(h/3)); the cumulative band is the generic cumulative band scaled per side by the own/generic ratio of
    the log bounds in the same year. Checks: leave-window-out (origins 2007, 2012, 2016; 15 per-year errors) and out
    of time (trained on errors ending by 2013, scored on origins 2014-2020; 25 errors)."""
    yw = yearly_windows(kind)
    pts = [(o, h, v) for h in yw for o, v in yw[h].items()]

    def fit(sel):
        z = {}
        for o, h, v in sel:
            z.setdefault(o, []).append(v / math.sqrt(h / 3))
        flat = [x for xs in z.values() for x in xs]
        lo, hi = q(flat, 0.05), q(flat, 0.95)
        bl, bh = [], []
        origins = list(z)
        for _ in range(1000):
            smp = [x for o in (rng.choice(origins) for _ in origins) for x in z[o]]
            bl.append(q(smp, 0.05))
            bh.append(q(smp, 0.95))
        return (
            min(0.0, lo + 0.5 * (min(q(bl, 0.1), lo) - lo)),
            max(0.0, hi + 0.5 * (max(q(bh, 0.9), hi) - hi)),
            (lo, hi),
        )

    lo, hi, raw = fit(pts)
    per_year = {str(2021 + h): mband(lo * math.sqrt(h / 3), hi * math.sqrt(h / 3)) for h in range(1, 6)}
    lwo = {}
    for t in (2007, 2012, 2016):
        tl, th, _ = fit([(o, h, v) for o, h, v in pts if o + h < t or o > t + 5])
        tests = [(h, v) for o, h, v in pts if o == t]
        lwo[str(t)] = f"{sum(tl * math.sqrt(h / 3) <= v <= th * math.sqrt(h / 3) for h, v in tests)}/{len(tests)}"
    ol, oh, _ = fit([(o, h, v) for o, h, v in pts if o + h <= 2013])
    oot = [(h, v) for o, h, v in pts if o >= 2014]
    oot_hits = sum(ol * math.sqrt(h / 3) <= v <= oh * math.sqrt(h / 3) for h, v in oot)
    gm, gc = gen_L["multiplier_vs_2021"], gen_L["cumulative_band"]
    cum = {}
    for i, hk in enumerate(HS):
        y = str(2022 + min(i, 4))
        rl = math.log(per_year[y]["low"]) / math.log(gm[y]["low"])
        rh = math.log(per_year[y]["high"]) / math.log(gm[y]["high"])
        cum[hk] = {"low": round(gc[hk]["low"] ** rl, 3), "central": 1.0, "high": round(gc[hk]["high"] ** rh, 3)}
    n_lwo = [int(x.split("/")[0]) for x in lwo.values()]
    return {
        "n_errors": len(pts),
        "q05_q50_q95_per_sqrt_h_over_3": [round(raw[0], 3), round(q([v / math.sqrt(h / 3) for _, h, v in pts], 0.5), 3), round(raw[1], 3)],
        "widened_bounds": [round(lo, 3), round(hi, 3)],
        "multiplier_vs_2021": per_year,
        "cumulative_band": cum,
        "coverage": {"leave_window_out_generic_tests": {"hits": lwo, "rate": round(sum(n_lwo) / 15, 3)},
                     "out_of_time_train_to_2013_test_origins_2014_2020": {"hits": f"{oot_hits}/{len(oot)}",
                                                                         "rate": round(oot_hits / len(oot), 3)}},
    }  # fmt: skip


b2 = {kind: b2_variant(kind, random.Random(7)) for kind in ("composite", "gas")}
# sensitivity of the proposed band: fuel share 0.40 / 0.65, other goods in nominal USD (no deflator)
sensitivity = {}
_s, _nf = S_FUEL, nonfuel
for label, sf, nf in (("fuel_share_0.40", 0.40, _nf), ("fuel_share_0.65", 0.65, _nf),
                      ("other_goods_nominal_usd", _s, {y: ct[y]["TOTAL"] - ct[y]["27"] for y in YRS})):  # fmt: skip
    S_FUEL, nonfuel = sf, nf
    v = b2_variant("composite", random.Random(7))
    sensitivity[label] = {"cumulative_H5_2026_8of12": v["cumulative_band"]["H5_2026_8of12"],
                          "per_year_2026": v["multiplier_vs_2021"]["2026"], "coverage": v["coverage"]}  # fmt: skip
S_FUEL, nonfuel = _s, _nf
for kind, v in b2.items():
    print("B2", kind, v["cumulative_band"]["H5_2026_8of12"], v["multiplier_vs_2021"]["2026"], v["coverage"])

comp = results["composite"]
prop = b2["composite"]
own = prop["cumulative_band"]["H5_2026_8of12"]
gen = gen_L["cumulative_band"]["H5_2026_8of12"]
gen_scaled = {
    "low": round(1 - (1 - gen["low"]) * CB_SCALE_PAID, 4),
    "high": round(1 + (gen["high"] - 1) * CB_SCALE_PAID, 4),
}
width_ratio = (own["high"] - own["low"]) / (gen_scaled["high"] - gen_scaled["low"])
width_ratio_unscaled = (own["high"] - own["low"]) / (gen["high"] - gen["low"])
lwo_rate = prop["coverage"]["leave_window_out_generic_tests"]["rate"]
oot_rate = prop["coverage"]["out_of_time_train_to_2013_test_origins_2014_2020"]["rate"]
use = width_ratio <= 0.9 and lwo_rate >= 0.8 and oot_rate >= 0.8
# safeguard (fuel_volume_cf.json rule e): Türkiye's own 5-year windows of the map's own series (deflated value of all
# goods, as listed in fuel_volume_cf.json) and of the composite measured here must be >= 90% inside
map_w = fd["checks"]["own_windows_values"]
safeguard = {
    "map_series_own_windows_inside": f"{sum(own['low'] <= v <= own['high'] for v in map_w.values())}/{len(map_w)}",
    "composite_own_windows_inside": f"{sum(own['low'] <= v <= own['high'] for v in comp['windows_H5_2026_8of12'].values())}/{len(comp['windows_H5_2026_8of12'])}",
    "generic_as_built_map_series_inside": f"{sum(gen_scaled['low'] <= v <= gen_scaled['high'] for v in map_w.values())}/{len(map_w)}",
}  # fmt: skip

# effect on the map: width of the counterfactual term alone, % of GDP (site/data.json base x bmul x FRAC)
dj = json.loads((ROOT / "site" / "data.json").read_text())
tc = dj["countries"]["TUR"]
frac = dj["frac"]
exp_sum = sum(tc["to_rus"]["base"] * b * f for b, f in zip(tc["to_rus"]["bmul"][1:], frac[1:]))
gdp = tc["gdp"]
effect = {
    "expected_2022_2026_sum_eur_bn": round(exp_sum, 2),
    "gdp_eur_bn": gdp,
    "generic_as_built_low_high_eur_bn": [round((1 - gen_scaled["low"]) * exp_sum, 1), round((gen_scaled["high"] - 1) * exp_sum, 1)],
    "own_low_high_eur_bn": [round((1 - own["low"]) * exp_sum, 1), round((own["high"] - 1) * exp_sum, 1)],
    "generic_as_built_low_high_pct_gdp": [round(100 * (1 - gen_scaled["low"]) * exp_sum / gdp, 1), round(100 * (gen_scaled["high"] - 1) * exp_sum / gdp, 1)],
    "own_low_high_pct_gdp": [round(100 * (1 - own["low"]) * exp_sum / gdp, 1), round(100 * (own["high"] - 1) * exp_sum / gdp, 1)],
    "note": "low side = how much less Türkiye might have bought from Russia without the war (makes 'more paid to Russia' larger); high side = how much more. Base, actuals and the central path are unchanged.",
}  # fmt: skip
cf_tur = json.loads((GAPS / "counterfactual.json").read_text())["countries"]["TUR"]["to_rus"]
proposed_entry = {
    "level_2021": cf_tur["level_2021"],
    "multiplier_vs_2021": prop["multiplier_vs_2021"],
    "cumulative_band": prop["cumulative_band"],
    "generic_multiplier_vs_2021_replaced": gen_L["multiplier_vs_2021"],
    "generic_cumulative_band_replaced": gen_L["cumulative_band"],
    "method": "2021 level held (random walk), country-specific interval: 5th-95th percentile of Türkiye's own random-walk errors 1-5 years ahead (rolling origins 2005-2020, all years kept) on a composite of its fuel volumes from Russia (EPDK gas, crude and products, coal at fixed 2019-2021 unit values) and its other imports from Russia (deflated), combined by its fuel share 0.533, scaled by sqrt(h/3) and widened halfway to the block-bootstrap bounds, as cf_bands.json B2; cumulative band = the generic cumulative band scaled per side by the own/generic ratio of the log bounds in the same year; used because its 2022-2026 cumulative band is at least 10% narrower than the generic one and its own held-out coverage holds (turkey_gas_r43.json)",
    "size_class": "L",
    "certainty": "C",
    "own_backtest": {
        "series": "composite: 0.533 x fuel volume index (EPDK/Eurostat) + 0.467 x other goods (Comtrade, deflated by FRED IREXFUELS)",
        "origins": "2005-2020", "horizons": "1-5",
        "n_errors": prop["n_errors"],
        "q05_q50_q95_per_sqrt_h_over_3": prop["q05_q50_q95_per_sqrt_h_over_3"],
        "bootstrap_widened_bounds": prop["widened_bounds"],
        "coverage": prop["coverage"],
        "safeguard": safeguard,
    },
}  # fmt: skip

# the realised volume of Russian gas against the 2021 level (what the band is a band for, on the gas part)
realised_gas = {str(y): round(gas[y]["russia"] / gas[2021]["russia"], 3) for y in (2022, 2023, 2024, 2025)}
realised_gas["2026_jan_aug_vs_2025_jan_aug"] = round(jan_aug_2026 / jan_aug_2025, 3)

out = {
    "generated": "2026-10-24",
    "round": 43,
    "status": "proposal (not yet read by the build)",
    "units": {
        "gas": "million standard cubic metres (Sm3, EPDK); 1 bcm = 1,000 million Sm3",
        "crude": "million tonnes",
        "bands": "multipliers in real (volume) terms, as cf_bands.json: cumulative_band = multiplier on the SUM over the horizon of the central expected level (H5_2026_8of12 = 2022-2026 with 2026 at 8/12); multiplier_vs_2021 = per-year ratio to the yearly central (2021 held flat)",
    },
    "gas_imports_from_russia_mcm": {str(y): gas[y]["russia"] for y in sorted(gas)},
    "gas_imports_all_sources_mcm": {str(y): gas[y]["total"] for y in sorted(gas)},
    "gas_russian_share": {str(y): round(gas[y]["russia"] / gas[y]["total"], 4) for y in sorted(gas)},
    "gas_note": "2005-2013 from the 2014 report (Table 2.1), 2014-2024 from the 2024 report (Table 2.2), 2025 from the 2025 report annex (Table 4, spot + long-term, all twelve months), 2026 = January-August (August 2026 monthly report annex). Russian totals include pipeline gas (Blue Stream, TurkStream) and Russian spot LNG (497 million Sm3 in 2024).",
    "gas_spot_pipeline_from_russia_mcm": {str(y): v for y, v in sorted(spot.items())},
    "gas_monthly_2025_2026": monthly,
    "gas_2026_jan_aug_vs_2025_jan_aug": {
        "2025_jan_aug_mcm": round(jan_aug_2025, 1),
        "2026_jan_aug_mcm": jan_aug_2026,
        "ratio": realised_gas["2026_jan_aug_vs_2025_jan_aug"],
    },
    "gas_realised_vs_2021": realised_gas,
    "epdk_vs_eurostat_gas_ratio": epdk_vs_eurostat_gas,
    "epdk_vs_eurostat_note": "Eurostat nrg_ti_gas (geo TR, partner RU) equals EPDK to within rounding in every year 2005-2024, and Eurostat's crude from Russia equals EPDK's crude: Türkiye reports the regulator's figures to Eurostat. EPDK is therefore not a second measurement next to Eurostat (which fuel_volume_cf.json already used for TUR); it is a second measurement next to customs (Turkish customs hide the partner of crude and gas) and next to CREA/Kpler for crude.",
    "crude_and_products": crude,
    "crude_comparison_with_site": crude_cmp,
    "band": {
        "question": "a no-war band for Türkiye's imports from Russia (to_rus) measured on Türkiye's own history instead of the generic band of large flows",
        "series": "Russian gas volumes (EPDK, million Sm3, at Eurostat's GCV per Sm3, valued at EUR 4.67/GJ), crude and products (Eurostat = EPDK, EUR 370/t and 420/t) and coal (Eurostat, EUR 60/t) as a fixed-price fuel volume index (fuel_volume_cf.json weights); other goods = Türkiye's imports from Russia (Comtrade TOTAL minus HS 27, USD) deflated by the US import price index excluding fuels (FRED IREXFUELS). Composite R = s x fuel + (1 - s) x other goods with Türkiye's fuel share s = 0.533 (energy2.json, as fuel_volume_cf.json). 2021 held flat (random walk). Rolling origins 2005-2020, horizons 1-5, targets to 2021, all years kept (2009, 2014-15 and 2020 included).",
        "fuel_share": S_FUEL,
        "gas_share_of_fuel_2019_2021_at_fixed_prices": round(gas_share_of_fuel_2019_2021, 3),
        "gas_share_of_to_rus_2019_2021_approx": round(S_FUEL * gas_share_of_fuel_2019_2021, 3),
        "proposed_B2_composite": prop,
        "proposed_sensitivity": sensitivity,
        "B2_gas_only": b2["gas"],
        "direct_cumulative_percentiles": {
            "what": "variant: 5th-95th percentile of Türkiye's own cumulative windows per horizon (n = 12-16), widened halfway to the bootstrap bounds, era factor K as fuel_volume_cf.json; 'calibrated_on_own_coverage' = the smallest K reaching >= 90% in sample and >= 80% held out",
            "composite": comp,
            "gas_only": results["gas"],
            "fuel_only": results["fuel"],
            "nonfuel_only": results["nonfuel"],
        },
        "generic_now": {
            "source": "to_rus_cf.json size class L (cumulative), scaled around 1 by CB_SCALE_PAID = 0.81 in pipeline/build_data.py (round 43 placebo); own bands in cf_bands.json keep their width",
            "cumulative_band_unscaled": gen_L["cumulative_band"],
            "H5_2026_8of12_as_built": gen_scaled,
            "site_data_json_cb": site_tur.get("cb"),
            "multiplier_vs_2021": gen_L["multiplier_vs_2021"],
        },
        "fuel_volume_cf_round8_test": {
            "tested_band_2022_2026": fd.get("tested_band_2022_2026"),
            "status": fd.get("status"),
            "method": fd.get("method"),
        },
        "width_ratio_vs_generic_as_built": round(width_ratio, 3),
        "width_ratio_vs_generic_unscaled": round(width_ratio_unscaled, 3),
        "safeguard": safeguard,
        "decision_rule": "cf_bands.json B2: use the own band only if its 2022-2026 cumulative band is at least 10% narrower than the generic one Türkiye has now (as built, after the 0.81 scaling) and own coverage is at least 80% leave-window-out and at least 80% out of time; plus the fuel_volume_cf.json safeguard (>= 90% of the map series' own windows inside)",
        "use": use,
        "effect_on_map": effect,
        "proposed_cf_bands_entry": {"countries.TUR.to_rus": proposed_entry},
    },
    "sources": [
        {
            "name": "EPDK, Doğal Gaz Piyasası Sektör Raporu 2014 (Table 2.1) and 2024 (Tables 2.2, 2.9); Gelişim Raporu 2025 annex; Sektör Raporu Ağustos 2026 annex",
            "url": "https://www.epdk.gov.tr/Detay/Icerik/3-0-94/dogal-gazyillik-sektor-raporu",
            "retrieved": gas_raw["retrieved"],
        },
        {
            "name": "EPDK, Petrol Piyasası Sektör Raporu 2018-2024 (Table 2.1.1), Aralık 2025 (Table 2.1.2), Ağustos 2026 annex (Table 2)",
            "url": "https://www.epdk.gov.tr/Detay/Icerik/3-0-107/yillik-sektor-raporu",
            "retrieved": oil_raw["retrieved"],
        },
        {
            "name": "Eurostat nrg_ti_gas, nrg_ti_oil, nrg_ti_sff (geo TR, partner RU)",
            "url": ctx["eurostat"]["nrg_ti_gas"]["url"],
            "retrieved": ctx["retrieved"],
        },
        {
            "name": "UN Comtrade public preview, Türkiye's imports from Russia, TOTAL and HS 27, 2004-2021",
            "url": "https://comtradeapi.un.org/public/v1/preview/C/A/HS",
            "retrieved": ctx["retrieved"],
        },
        {
            "name": "FRED IREXFUELS (US import price index, all imports excluding fuels), annual average",
            "url": ctx["fred"]["IREXFUELS"]["url"],
            "retrieved": ctx["retrieved"],
        },
    ],
    "raw_files": [
        str(p.relative_to(R))
        for p in (latest("epdk_gas_imports_*.json"), latest("epdk_oil_imports_*.json"), latest("tur_context_*.json"))
    ],
}
(GAPS / "turkey_gas_r43.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print("safeguard", safeguard, "effect", effect)
print("own 2022-26:", own, "generic as built:", gen_scaled, "unscaled:", gen, "width ratio", round(width_ratio, 3),
      "LWO", lwo_rate, "OOT", oot_rate, "use", use)  # fmt: skip
print("sensitivity", {k: v["cumulative_H5_2026_8of12"] for k, v in sensitivity.items()})
for kind in ("composite", "gas", "fuel", "nonfuel"):
    c = results[kind]
    cal = c["calibrated_on_own_coverage"]
    print(
        kind,
        c["cumulative_band"]["H5_2026_8of12"],
        "era K",
        c["era_K"],
        c["era_coverage_at_K"],
        "cov",
        c["coverage"]["leave_window_out"]["rate"],
        c["coverage"]["out_of_time_train_to_2013_test_origins_2014_2020"]["rate"],
        c["coverage"]["in_sample_all_windows"],
        "| calibrated K",
        cal and cal["K"],
        cal and cal["cumulative_band"]["H5_2026_8of12"],
        cal and cal["coverage_at_K"]["leave_window_out"],
    )
