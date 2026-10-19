"""Checks on site/data.json: no double counting, ordered ranges, and totals that match the published sources.

Run after build_data.py: uv run python pipeline/check_data.py
Prints PASS / WARN / FAIL per check and exits non-zero on any FAIL.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "2026-10"
data = json.loads((ROOT / "site" / "data.json").read_text())
countries = data["countries"]
kiel = json.loads((RESEARCH / "kiel.json").read_text())
results: list[tuple[str, str, str]] = []


def check(name: str, ok: bool, detail: str, warn_only: bool = False) -> None:
    results.append(("PASS" if ok else "WARN" if warn_only else "FAIL", name, detail))


def total(series: list[float] | None) -> float:
    return sum(series or [])


# 1. EU-level aid is split once: members' EU shares add up to the EU institutions' total
eu_total = kiel["donors"]["EU_INST"]["total_allocated"] - (kiel["donors"]["EU_INST"].get("era_allocated") or 0)
eu_split = sum(total((c.get("aid") or {}).get("eu_years")) for c in countries.values())
check(
    "EU aid split adds up",
    abs(eu_split - eu_total) / eu_total < 0.02,
    f"members {eu_split:.1f} vs EU institutions {eu_total:.1f} EUR bn",
)

# 2. every country's aid comes from one source: Kiel or the gap research, never both
both = [c["iso3"] for c in countries.values() if {"kiel", "aid_gaps"} <= set((c.get("aid") or {}).get("src", []))]
check("aid counted from one source", not both, f"both Kiel and gap research: {both or 'none'}")

# 3. Kiel donors: our aid total matches Kiel's own total (incl. EU institutions, split over members)
ours = sum(
    total((c.get("aid") or {}).get("years"))
    for c in countries.values()
    if "kiel" in (c.get("aid") or {}).get("src", [])
)
# loans repaid from Russia's frozen assets (ERA) are left out of donors' aid
era_all = sum(d.get("era_allocated") or 0 for d in kiel["donors"].values())
kiel_total = kiel["aggregates"]["kiel_total_bilateral_allocated_incl_EU"] - era_all
check(
    "aid total matches Kiel",
    abs(ours - kiel_total) / kiel_total < 0.03,
    f"ours {ours:.1f} vs Kiel {kiel_total:.1f} EUR bn (Kiel donors not on the map, e.g. Taiwan, explain small gaps)",
    warn_only=True,
)

# 4. every range is ordered low <= middle <= high
bad = []
for c in countries.values():
    for key, obj in c.items():
        if not isinstance(obj, dict):
            continue
        for k, v in obj.items():
            if k.endswith("_lo") or k == "years_lo":
                mid_k = k[:-3]
                hi_k = mid_k + "_hi"
                if mid_k in obj and hi_k in obj:
                    # a single value (loans_grant_eq_lo) is checked as a range of one
                    rows = zip(*(x if isinstance(x, list) else [x] for x in (v, obj[mid_k], obj[hi_k])))
                    if mid_k == "refugee_years":  # floored on the running total: the running totals are ordered
                        run = [0.0, 0.0, 0.0]
                        rows = [tuple(run.__setitem__(i, run[i] + x) or run[i] for i, x in enumerate(t)) for t in rows]
                    for lo, mid, hi in rows:
                        if not (lo <= mid + 1e-6 and mid <= hi + 1e-6):
                            bad.append(f"{c['iso3']}.{key}.{mid_k}")
                            break
check("ranges ordered", not bad, f"out of order: {sorted(set(bad))[:12] or 'none'}")

# 5. loans repaid from frozen Russian assets (ERA) cost the lender nothing
LOANS = json.loads((ROOT / "research/2026-10/gaps/loans_value.json").read_text())["countries"]
era_bad = []
for iso3, d in kiel["donors"].items():
    c = countries.get(iso3)
    if not c or not d.get("era_allocated"):
        continue
    ge = (c.get("aid") or {}).get("loans_grant_eq") or 0
    own_loans = (d.get("loans_face_value") or 0) - d["era_allocated"]
    eu_ge = (
        ((c.get("aid") or {}).get("eu_share") or 0)
        * (kiel["donors"]["EU_INST"].get("loans_face_value", 0) - kiel["donors"]["EU_INST"].get("era_allocated", 0))
        * 0.26
    )
    # loans valued at their grant element (loans_value.json, round 5, which leaves ERA out) replace the flat factor;
    # 0.26 is LOAN_GRANT_ELEMENT in build_data.py (round 11, was 0.3)
    lv = (LOANS.get(iso3) or {}).get("loans_guarantees_economic_value")
    limit = sum((v or {}).get("central", 0) for v in lv.values()) if lv else max(0, own_loans) * 0.26 + eu_ge
    if ge > limit + 0.01:
        era_bad.append(iso3)
check("ERA loans not counted as a cost", not era_bad, f"too high: {era_bad or 'none'}")

# 6. the all-money ledger (round 6): money flowing back across all countries cannot exceed the money that reached
# Ukraine plus replacement purchases (each euro is assigned to one economy at most)
LEDGER = json.loads((ROOT / "research/2026-10/gaps/money_ledger.json").read_text())
reached = sum(v["total"] for v in LEDGER["top_level"]["sources"].values() if isinstance(v, dict) and "total" in v)
repl = sum(r["high"] for r in LEDGER["replacement"]["rows_buyer_seller_total_paid_by_aug_2026"].values())
back = sum(
    total((c.get("flowback") or {}).get(k)) for c in countries.values() for k in ("own", "purl_in", "arms", "othsp")
)
check(
    "flowback within the money that reached Ukraine",
    back <= reached + repl,
    f"flowing back {back:.1f} vs reached {reached:.1f} + replacement {repl:.1f} EUR bn",
)

# 7. Hong Kong gold is counted once (trade data), not again as a hidden channel
check(
    "Hong Kong gold not double counted",
    not countries.get("HKG", {}).get("hidden"),
    "HKG hidden channel present" if countries.get("HKG", {}).get("hidden") else "ok",
)

# 8. undisclosed military aid stays small next to what Kiel already counts
big = [
    c["iso3"]
    for c in countries.values()
    if total((c.get("undisclosed") or {}).get("years"))
    > 0.5 * ((c.get("aid") or {}).get("cats", {}).get("military") or 0) + 0.2
]
check(
    "undisclosed aid plausible next to Kiel",
    not big,
    f"larger than half of Kiel military aid: {big or 'none'}",
    warn_only=True,
)

# 9. fossil fuel payments: CREA's countries since the invasion vs our payments to Russia for the same countries
crea = json.loads((RESEARCH / "crea.json").read_text())
crea_c = {k: v.get("fossil_total_since_invasion") or 0 for k, v in crea["countries"].items()}
ours_c = sum(
    total((countries.get(k, {}).get("to_rus") or {}).get("years")[1:] if countries.get(k, {}).get("to_rus") else [])
    for k in crea_c
)
check(
    "payments to Russia cover CREA fossil fuel",
    ours_c >= 0.8 * sum(crea_c.values()),
    f"ours {ours_c:.0f} (all goods) vs CREA fossil {sum(crea_c.values()):.0f} EUR bn for the same countries",
    warn_only=True,
)

# 11. refugees hosted where donors paid: flag hosts whose refugee cost is large next to aid received (Moldova)
mda = countries.get("MDA", {}).get("aid", {})
check(
    "Moldova refugee cost adjusted for donor funding",
    "refugee_donor_share" in mda,
    "donor-funded share applied" if "refugee_donor_share" in mda else "not yet applied",
    warn_only=True,
)

# 12. changes against the pre-war level compare volumes: every traded flow carries a price level, 2019-2021 = 1
e2 = json.loads((RESEARCH / "gaps" / "energy2.json").read_text())
off = [
    k
    for k in ("urals", "products", "pipeline_gas", "lng", "coal", "non_fuel_goods", "services")
    if abs(sum(e2["price_index"][k][y]["central"] for y in ("2019", "2020", "2021")) / 3 - 1) > 0.03
]
missing = [c["iso3"] for c in countries.values() if c.get("to_rus") and "pidx" not in c["to_rus"]]
check(
    "price levels set against 2019-2021",
    not off and not missing,
    f"index off: {off or 'none'}; no price level: {missing[:8] or 'none'}",
)

# 13. transit gas: counted where it is used. Each user's payments to Russia include at least its final-use gas
tg = e2["transit_gas"]["countries"]
short = [
    i
    for i, d in tg.items()
    if i in countries
    and countries[i].get("to_rus")
    and countries[i]["to_rus"]["years"][0] + 0.01 < d["gas_from_rus_eur_bn"]["2021"]["central"]
]
check("transit gas counted where used", not short, f"payments below own gas use in 2021: {short or 'none'}")

# 14. re-exports through hubs: origin and destination shares add up to one, so no value is lost or doubled when moved
rx = json.loads((RESEARCH / "gaps" / "reexports.json").read_text())
off = [
    f"{h}.{k}"
    for h, d in rx["hubs"].items()
    for k in ("origin_shares", "destination_shares")
    if d.get(k) and abs(sum(v["central"] for v in d[k].values()) - 1) > 0.03
]
check("re-export shares add up", not off, f"not summing to 1: {off or 'none'}", warn_only=True)

# 15. refiners: Russian crude in exported fuel is counted once, at the buyers, not also at Turkey or India
miss = [
    i for i in ("TUR", "IND") if i in countries and "refining" not in (countries[i].get("to_rus") or {}).get("src", [])
]
check("refined exports counted once", not miss, f"refiner still counts exported crude: {miss or 'none'}")

# 16. every baseline lies inside its range, and no range bound comes from a projected trend
outside = [
    f"{c['iso3']}.{k}"
    for c in countries.values()
    for k, obj in c.items()
    if isinstance(obj, dict)
    and obj.get("base_range")
    and obj.get("base") is not None
    and not (obj["base_range"][0] - 1e-6 <= obj["base"] <= obj["base_range"][1] + 1e-6)
]
check("baselines inside their ranges", not outside, f"outside: {outside[:8] or 'none'}")

# 17. aid categories add up to aid (loans repaid from frozen Russian assets left out of both)
off = []
for c in countries.values():
    a = c.get("aid") or {}
    cats, yrs = sum((a.get("cats") or {}).values()), sum(a.get("years") or [])
    if "kiel" in a.get("src", []) and yrs > 1 and abs(cats - yrs) / yrs > 0.05:
        off.append(f"{c['iso3']} {cats:.1f}/{yrs:.1f}")
check("aid categories add up to aid", not off, f"off by more than 5%: {off[:8] or 'none'}", warn_only=True)

# 18. hub resale never takes out more laundered oil than a country bought
check(
    "no negative laundered oil",
    all(min((c.get("to_rus") or {}).get("laundered") or [0]) >= -1e-9 for c in countries.values()),
    "laundered oil >= 0 everywhere",
)

# 19. the fuel mix compares like with like (round 13 audit): a country that buys the same fuel volumes and the same
# other goods every year, at any prices, gets the same gain share on what it bought as on what was expected. Run on a
# synthetic copy of Hungary through the pipeline's own apply_net_gain, with a payments index unlike the no-war one
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_data as bd  # noqa: E402

_energy = json.loads((RESEARCH / "gaps" / "energy.json").read_text())
_t21 = _energy["countries"]["HUN"]["fossil_from_russia_by_fuel_mt"]["2021"]
_energy["countries"]["HUN"]["fossil_from_russia_by_fuel_mt"] = {str(y): dict(_t21) for y in bd.YEARS}
_load = bd.load
bd.load = lambda path: _energy if path.name == "energy.json" else _load(path)
# round 14 (C2): the bought mix comes from customs values per fuel at their own price levels, so the copy buys the same
# customs volumes every year too (2018-2026), valued at each year's price level of that part
_wp = bd.PRICES["HUN"]["windfall_parts"]
_saved_wp = {f: {y: dict(v) for y, v in by.items()} for f, by in _wp.items()}
for _f, _by in _wp.items():
    _v0 = (_by.get("2021") or {}).get("paid") or 0.0
    for _y in range(2018, 2027):
        _by.setdefault(str(_y), {})["paid"] = _v0 * bd._part_index("HUN", _f, _y)
_pre = [1.0, 2.1, 1.3, 1.2, 1.3, 1.1]
_syn = {"HUN": {"iso3": "HUN", "to_rus": {"years": [4.0 * p for p in _pre], "_pidx_pre": _pre, "pidx": [1.0] * 6}}}
bd.apply_net_gain(_syn, bd.Sources())
bd.load = _load
bd.PRICES["HUN"]["windfall_parts"] = _saved_wp
_g = _syn["HUN"]["to_rus"]["gain"]
_off = max(abs(a - e) for a, e in zip(_g["a"][1], _g["e"][1]))
check(
    "fuel mix at constant prices", _off < 1e-3, f"gain on what was bought vs expected, same volumes: off by {_off:.4f}"
)

# 20. remittances are a marker, not a part (round 13b): no country carries a "remit" part in its totals
in_totals = [c["iso3"] for c in countries.values() if any(x.get("k") == "remit" for x in c.get("extra") or [])]
check("remittances only as a marker", not in_totals, f"remittance part in the totals: {in_totals[:8] or 'none'}")

# 21. laundered oil through EU refiners (round 13b): every EU member's post-war route is measured (its own customs), so
# none is held at the expected level
held_eu = [
    c["iso3"] for c in countries.values() if (c.get("laund") or {}).get("eu_route_held") and c["iso3"] in bd.EU27
]
check("EU refiners' route measured for EU members", not held_eu, f"EU members held: {held_eu[:8] or 'none'}")

# 22. round 14 (C1): the net-gain step uses the same measured fuel share of pre-war imports as the price index and the
# windfall (fossil_share), not the 60-country average
off = [
    f"{c['iso3']} {c['to_rus']['gain'].get('fossil_share')} vs {bd.fossil_share(c['iso3']):.4f}"
    for c in countries.values()
    if (c.get("to_rus") or {}).get("gain")
    and abs(
        (c["to_rus"]["gain"].get("fossil_share") if c["to_rus"]["gain"].get("fossil_share") is not None else -9)
        - bd.fossil_share(c["iso3"])
    )
    > 1e-3
]
check("net gain uses the measured fuel share", not off, f"differs from fossil_share(): {off[:6] or 'none'}")

# 23. round 14 (C3): the windfall compares FOB with FOB. Own customs oil prices are CIF; with the war-time freight surge
# taken out, buyers' own crude prices move with the FOB Urals benchmark (the median war/pre-war ratio of own price to
# Urals is about 1; on CIF unit values it was about 1.12, prices-notes.md), and every own oil index sits at or below its
# CIF value in war years
import statistics  # noqa: E402

_u = bd.idx("urals", "central")
_ratios, _above = [], []
for _iso in bd.PRICES:
    _o = bd.own_index(_iso, "crude", "central")
    if not _o or not _o[0]:
        continue
    _ratios.append(sum(_o[i] / _u[i] for i in range(1, 5)) / 4 / (_o[0] / _u[0]))
    if any(bd.fob_factor(_iso, "crude", y) > 1 + 1e-9 for y in bd.YEARS):
        _above.append(_iso)
_med = statistics.median(_ratios)
check(
    "windfall on one price basis (FOB)",
    abs(_med - 1) < 0.06 and not _above,
    f"median war/pre-war ratio of own crude price to Urals FOB {_med:.3f} over {len(_ratios)} buyers; FOB above CIF: {_above[:6] or 'none'}",
)

# 24. round 14 (C4): the share pages and cards say "cut off by Russia" only where Russia cut the country's gas, and never
# "more paid" for a country whose negative second number is mostly earnings (North Korea). The pages are generated by
# share_cards.mjs (site/c/, not in git): checked when present; the script must not print the old fixed qualifier
_sc = (ROOT / "pipeline" / "share_cards.mjs").read_text()
_pages = sorted((ROOT / "site" / "c").glob("*.html")) if (ROOT / "site" / "c").exists() else []
_bad = []
for _p in _pages:
    _desc = _p.read_text()
    _iso = _p.stem.upper()
    _c = countries.get(_iso) or {}
    if "cut off by Russia" in _desc and not ((_c.get("sanctions") or {}).get("to_rus") or {}).get("cut_from"):
        _bad.append(_iso)
    if _iso == "PRK" and "more paid" in _desc:
        _bad.append("PRK more paid")
check(
    "share cards: 'cut off by Russia' only where it did",
    "incl. supplies Russia cut off" not in _sc and not _bad and bool(_pages),
    f"{len(_pages)} pages checked; wrong qualifier: {_bad[:8] or 'none'}"
    if _pages
    else "site/c/ not generated (run node pipeline/share_cards.mjs)",
    warn_only=not _pages,
)

# 25. round 14b (raised by the owner): what Russia took from companies (seizures, forced discounts and exit fees) is not
# in the totals. No country carries an "exits" or "seized" part among the parts of the net; every home country with a
# seizure or exit payment in company_flows.json has it in "taken" (the cost view), and calc() in index.html adds "taken"
# to the cost parts only, never to the parts of the net or either headline number
_cf = json.loads((ROOT / "research" / "2026-10" / "gaps" / "company_flows.json").read_text())["countries"]
_in_tot = [
    f"{c['iso3']} {x['k']}"
    for c in countries.values()
    for x in c.get("extra") or []
    if x.get("k") in ("exits", "seized")
]
_missing = []
for _iso, _d in _cf.items():
    if _iso not in countries:
        continue
    _has = {x["k"] for x in countries[_iso].get("taken") or []}
    _sz = any((v or {}).get("high") for v in (_d.get("seizure") or {}).values())
    _ex = any(
        (v or {}).get("high") for f in ("exit_contribution", "discount_transfer") for v in (_d.get(f) or {}).values()
    )
    if (_sz and "seized" not in _has) or (_ex and "exits" not in _has):
        _missing.append(_iso)
_html = (ROOT / "site" / "index.html").read_text()
_shift_block = _html[_html.index("const shiftParts = [") : _html.index("const sell3")]
_cost_block = _html[_html.index("const takenParts = ") : _html.index("const live = parts")]
_neg = [x["c"] for c in countries.values() for x in c.get("taken") or [] if sum(x["c"]) < 0]
check(
    "seizures and forced exits not in the totals",
    not _in_tot
    and not _missing
    and "taken" not in _shift_block
    and "c.taken" in _cost_block
    and "...takenParts" in _cost_block
    and not _neg,
    f"in the net: {_in_tot[:6] or 'none'}; missing from the cost view: {_missing[:6] or 'none'}; "
    f"{sum(len(c.get('taken') or []) for c in countries.values())} taken parts, all in the cost view",
)

width = max(len(n) for _, n, _ in results)
for status, name, detail in results:
    print(f"{status:4}  {name:<{width}}  {detail}")
sys.exit(1 if any(s == "FAIL" for s, _, _ in results) else 0)
