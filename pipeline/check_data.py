"""Checks on site/data.json: no double counting, ordered ranges, and totals that match the published sources.

Run after build_data.py: uv run python pipeline/check_data.py
Prints PASS / WARN / FAIL per check and exits non-zero on any FAIL.
"""

from __future__ import annotations

import json
import re
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
# seizure or exit payment in company_flows.json has it in "taken", and calc() in index.html adds "taken" to the cost
# parts only, never to the parts of the net or either headline number. Round 19: the site no longer shows a cost view
# (the owner removed it); "taken" is a marker, and the cost parts feed only the full data download
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
    f"in the net: {_in_tot[:6] or 'none'}; missing from 'taken': {_missing[:6] or 'none'}; "
    f"{sum(len(c.get('taken') or []) for c in countries.values())} taken parts, none in the totals",
)

# 26. round 15 (raised by the owner): refugees hosted on the aggressor side are not support for Ukraine. Russia has no
# entry at all; Belarus's hosting cost is a label (ref_excluded), with no refugee part in any total
_blr = countries.get("BLR") or {}
_blr_ref = sum((_blr.get("aid") or {}).get("refugee_years") or [])
check(
    "no refugee credit for Russia or Belarus",
    "RUS" not in countries and abs(_blr_ref) < 1e-9 and bool(_blr.get("ref_excluded")),
    f"RUS entry: {'RUS' in countries}; Belarus refugee part {_blr_ref:.4f}; label: {bool(_blr.get('ref_excluded'))}",
)

# 27. round 15 (review 4, M1): % of GDP divides by the average 2022-2024 GDP (gdp_avg_r15.json); 2024 is kept for the
# method band
_avg = json.loads((RESEARCH / "gaps" / "gdp_avg_r15.json").read_text())["countries"]
_off = [
    k for k, d in _avg.items() if k in countries and abs(countries[k]["gdp"] - d["gdp_eur_bn_avg_2022_2024"]) > 1e-6
]
check(
    "GDP denominator is the 2022-2024 average",
    not _off and all(countries[k].get("gdp_2024") for k in _avg if k in countries),
    f"{len(_avg)} countries with the average; differing: {_off[:6] or 'none'}",
)

# 28. round 15 (review 4, M2): China's no-war path carries the contracted Power of Siberia ramp-up
_pos = ((countries.get("CHN") or {}).get("to_rus") or {}).get("pos_contracted_bmul_add") or []
check(
    "Power of Siberia contracted path in China's no-war imports", len(_pos) == 6 and _pos[4] > 0, f"bmul added: {_pos}"
)

# 29 and 30 use the map's own model (node): the ranking rule and the figures quoted in the docs
import check_docs_numbers as cdn  # noqa: E402

_m = cdn.model()
if _m is None:
    check("ranking leaves out uncertain directions", True, "node not found: not checked", warn_only=True)
    check("docs figures match data.json", True, "node not found: not checked", warn_only=True)
else:
    # 29. round 15 (review 4, H3; approved by the owner): a country is ranked on a headline number only if neither its
    # likely range nor any method-band alternative changes the sign; uncertain() must agree with that rule written out
    # again (site_numbers.mjs), and every headline ranking must pass its number to rankList(). Round 19 (owner): the
    # "Top lists" panel is gone; its net ranking is the Ranking view (views.js), which must leave out the same countries
    # (uncertain(m.c, y, hq) for the number the drawer shows), and the Ukraine and Russia panels keep their lists
    _wrong = [
        f"{k}.{q}"
        for k, c in _m["countries"].items()
        for q in ("ua", "rus", "net")
        if c[q + "Unc"] == c[q + "SameSign"]
    ]
    _views_js = (ROOT / "site" / "views.js").read_text()
    _calls = re.findall(r'rankList\([^\n]*?"(ua|rus|net)"(?:\)|, \{)', _html) + re.findall(
        r"uncertain\(m\.c, y, hq\)", _views_js
    )
    _unc_n = {
        q: sum(1 for c in _m["countries"].values() if c[q + "Unc"] and c["gdp"] >= 5) for q in ("ua", "rus", "net")
    }
    check(
        "ranking leaves out uncertain directions",
        not _wrong and len(_calls) >= 3 and "uncertain(r.c, y, q)" in _html,
        f"rule mismatches: {_wrong[:6] or 'none'}; direction uncertain (GDP >= EUR 5bn): {_unc_n}",
    )
    # 30. round 15 (review 4, H4): every figure tagged in the docs matches the map (check_docs_numbers.py)
    _bad, _n = cdn.check(_m)
    check("docs figures match data.json", not _bad and _n > 0, f"{_n} tagged figures; differing: {_bad[:4] or 'none'}")

# 31. round 15 (approved by the owner): the net is the view the map opens with, then its two parts; the gross "To
# Ukraine" and "To Russia" views are gone, and links to them open the nearest view. Round 17 (redesign, approved by the
# owner): the Filters drawer is closed on load (the page opens with the map, one header line, the legend and the
# Highlights and Filters buttons); the second number is "Kept from Russia" everywhere ("lens=kept" opens it too), and no
# page text says "change in payments to Russia" any more. Round 19 (the owner's interface changes):
# - three views of the map: the cost to the country is gone (lens=cost opens the net), with no cost wording left in the
#   page's text, and the quick buttons are gone;
# - the drawer opens with a Views list (Map, Ranking, Ukraine vs Russia, Table & data, Sources); How it works is no
#   longer a view (#view=how opens Sources) and the Top lists panel is gone (#c=RANKINGS opens the Ranking view);
# - the drawer is persistent: only its own controls close it (the Filters button, × and Escape), never a view switch, a
#   filter or a country, and its open state is kept in sessionStorage;
# - no view has filter controls of its own: every view reads the drawer
_buttons = re.findall(r'<button data-lens="(\w+)"', _html)
_start = re.search(r'const state = \{ lens: "(\w+)"', _html)
_old = re.search(r"const OLD_LENS = \{([^}]*)\}", _html)
_old_map = dict(re.findall(r'(\w+): "(\w+)"', _old.group(1))) if _old else {}
_lenses = re.search(r"const LENSES = \[([^\]]*)\]", _html)
_lens_keys = re.findall(r'"(\w+)"', _lenses.group(1)) if _lenses else []
_views_src = "".join((ROOT / "site" / f).read_text() for f in ("views.js", "views2.js"))
_site_text = _html + _views_src + _sc
_code_only = re.sub(r"(?m)^\s*//.*$", "", _site_text)
_old_name = re.findall(r"[Cc]hange in (?:its )?payments to Russia", _code_only)
_cost_words = re.findall(
    r"[Cc]ost to the country|cost view|Cost carried", re.sub(r"<!--[\s\S]*?-->|/\*[\s\S]*?\*/", "", _code_only)
)
_drawer = re.search(r'<aside class="drawer" id="drawer"[\s\S]*?</aside>', _html)
_dviews = (
    re.findall(
        r'<button data-view="(\w+)"', re.search(r'class="views dviews"[\s\S]*?</div>', _drawer.group(0)).group(0)
    )
    if _drawer
    else []
)
_views_const = re.search(r"const VIEWS = \[([^\]]*)\]", _html)
_views_list = re.findall(r'"(\w+)"', _views_const.group(1)) if _views_const else []
_old_view = re.search(r"const OLD_VIEW = \{([^}]*)\}", _html)
_old_view_map = dict(re.findall(r'(\w+): "(\w+)"', _old_view.group(1))) if _old_view else {}
_want_views = ["map", "rank", "bubbles", "table", "sources"]
_closers = [
    ln.strip()
    for ln in _site_text.splitlines()
    if re.search(r"\bcloseDrawer\(\)", ln) and not ln.strip().startswith("function")
]
_bad_close = [ln[:60] for ln in _closers if "fbtn" not in ln]
_view_filters = re.findall(r"filtersHtml|data-small|data-group=|data-quick", _views_src + _html)
check(
    "the map opens with the net; old views open the nearest one; the drawer lists the views and stays open",
    _buttons == ["net", "support", "payments"]
    and bool(_start)
    and _start.group(1) == "net"
    and _old_map == {"change": "net", "ukr": "support", "rus": "payments", "kept": "payments", "cost": "net"}
    and _lens_keys == _buttons
    and 'data-lens="cost"' not in _html
    and 'data-lens="ukr"' not in _html
    and 'data-lens="rus"' not in _html
    and '<button data-lens="payments" aria-pressed="false" data-i18n="Kept from Russia">' in _html
    and re.search(r'<aside class="drawer" id="drawer"[^>]*\bhidden>', _html) is not None
    and 'id="hlbtn"' in _html
    and 'id="fbtn"' in _html
    and not _old_name
    and not _cost_words
    and _dviews == _want_views
    and _views_list == _want_views
    and 'data-view="how"' not in _html
    and _old_view_map.get("how") == "sources"
    and '"RANKINGS"' in _html
    and "renderHow" not in _views_src
    and "closeMenu" not in _site_text
    and "sessionStorage" in _html
    and not _bad_close
    and len(_closers) >= 3
    and not _view_filters,
    f"lens buttons {_buttons}; start {_start.group(1) if _start else None}; old links {_old_map}; views in the drawer "
    f"{_dviews}; old views {_old_view_map}; drawer closed by {len(_closers)} controls (others: {_bad_close or 'none'}); "
    f"filter controls in views: {len(_view_filters)}; cost wording left: {len(_cost_words)}; "
    f"'change in payments to Russia' left: {len(_old_name)}",
)

# 32. round 16 (review 5, C2; approved by the owner): the page in a real browser shows the same bands, "direction
# uncertain" marks, rankings and grades as the model run in Node with every method-band alternative loaded (29 and 30
# run in Node only, where the alternatives are always there). pipeline/browser_check.mjs; needs Playwright
import shutil  # noqa: E402
import subprocess  # noqa: E402

_node = shutil.which("node")
_pw = (
    _node
    and subprocess.run([_node, "-e", "require('playwright')"], capture_output=True, cwd=ROOT / "pipeline").returncode
    == 0
)
if not _pw:
    check("browser shows the same numbers as Node", True, "node or Playwright not found: not checked", warn_only=True)
else:
    _r = subprocess.run([_node, str(ROOT / "pipeline" / "browser_check.mjs")], capture_output=True, text=True)
    _out = (_r.stdout or _r.stderr).strip().splitlines()
    check(
        "browser shows the same numbers as Node",
        _r.returncode == 0,
        "; ".join(x.strip() for x in _out[:3]) if _out else "no output",
    )

# 33. round 16 (review 5, M1): Hong Kong's Russian gold is counted once. Each year the share passed on to mainland
# China (refine.json hk_onward, charged to China) and the share exported elsewhere (hk_gold_r16.json, charged to those
# buyers) leave Hong Kong at most what it imported, and the destination shares add up to one
_hk = json.loads((RESEARCH / "gaps" / "hk_gold_r16.json").read_text())["years"]
_on = json.loads((RESEARCH / "gaps" / "refine.json").read_text())["hk_onward"]
_over = [y for y, d in _hk.items() if y in _on and _on[y]["central"] + d["exported_elsewhere_share"] > 1 + 1e-9]
_sums = [y for y, d in _hk.items() if abs(sum(d["destination_shares"].values()) - 1) > 0.01]
check(
    "Hong Kong gold counted once (China, other buyers, Hong Kong)",
    not _over and not _sums,
    f"years where onward + elsewhere > 1: {_over or 'none'}; destination shares not adding up: {_sums or 'none'}",
)

# 34. round 16 (review 5, H4): Russian money frozen is its own line, in the net only: not in the change in payments to
# Russia (its map, ranking and world total) or in support for Ukraine
_own = re.search(r"const OWN_LINE = new Set\(\[([^\]]*)\]\)", _html)
check(
    "Russian money frozen only in the net",
    bool(_own)
    and '"frozen"' in _own.group(1)
    and "shiftParts.filter(RUS_PART)" in _html
    and 'find(q => q.k === "paid")' in _html
    and not any(x.get("k") == "frozen" for c in countries.values() for x in c.get("taken") or []),
    f"own line: {_own.group(1) if _own else 'missing'}",
)

# 35. round 16 (raised by review 5, M3): the real gain subtracted from refugee spending in the host economy stays small
# (the owner's expectation: about 2-4% of the hosting cost counted)
_num = _den = 0.0
for c in countries.values():
    a = c.get("aid") or {}
    if a.get("refugee_back_f"):
        r = sum((a.get("refugee_years") or [0])[1:])
        _num, _den = _num + r * a["refugee_back_f"][1], _den + r
_rf = _num / _den if _den else 0.0
check("refugee spending flowing back is small", 0.01 <= _rf <= 0.05, f"weighted factor {_rf:.3f} of the hosting cost")

# 36. round 16b (check 16, B1): a small flow's no-war baseline is the median of its 2019, 2020 and 2021 values at
# 2019-2021 prices (base_years), never a 2021 value at 2021 prices by construction (round 16 copied that into the
# "average" for 28 flows, Brunei among them); the exceptions keep 2021 at 2019-2021 prices and are labelled
import build_data as _bd  # noqa: E402

_sf_bad, _sf_n = [], 0
for _iso, _c in countries.items():
    _t = _c.get("to_rus") or {}
    if _t.get("small_flow"):
        _sf_n += 1
        _by = _t.get("base_years") or []
        _p0 = (_t.get("pidx") or [1.0])[0]
        if (
            len(_by) != 3
            or abs(_t["base"] - sorted(_by)[1]) > 1e-5
            or abs(_by[2] - _t.get("base_2021", -1)) > 1e-5
            or (abs(_p0 - 1) > 0.01 and abs(_t["years"][0]) > 1e-3 and abs(_t["base"] - _t["years"][0]) < 1e-5)
            or _iso in _bd.SMALL_FLOW_EXCLUDE
            or _iso in _bd.SMALL_FLOW_MIRROR
        ):
            _sf_bad.append(_iso)
_kept = {
    k: (countries.get(k, {}).get("to_rus") or {}).get("small_flow_kept_2021")
    for k in (*_bd.SMALL_FLOW_EXCLUDE, *_bd.SMALL_FLOW_MIRROR)
}
check(
    "small-flow baselines are the 2019-2021 median at pre-war prices",
    _sf_n > 0 and not _sf_bad and all(_kept.values()),
    f"{_sf_n} small flows; not a median of base_years or equal to 2021 at 2021 prices: {_sf_bad[:6] or 'none'}; "
    f"2021 kept: {_kept}",
)

width = max(len(n) for _, n, _ in results)
for status, name, detail in results:
    print(f"{status:4}  {name:<{width}}  {detail}")
sys.exit(1 if any(s == "FAIL" for s, _, _ in results) else 0)
