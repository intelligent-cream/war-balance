"""Checks on site/data.json: no double counting, ordered ranges, and totals that match the published sources.

Run after build_data.py: uv run python pipeline/check_data.py
Prints PASS / WARN / FAIL per check and exits non-zero on any FAIL.
"""

from __future__ import annotations

import itertools
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "2026-10"
data = json.loads((ROOT / "site" / "data.json").read_text())
countries = data["countries"]
kiel = json.loads((RESEARCH / "kiel.json").read_text())
results: list[tuple[str, str, str]] = []
# round 29 (audit 29): in CI (CHECK_DATA_STRICT=1, set by .github/workflows/checks.yml) the checks that need node or
# Playwright (29, 30, 32) FAIL when those are missing, instead of warning "not checked"
STRICT = os.environ.get("CHECK_DATA_STRICT") == "1"


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
# share_cards.mjs (site/c/, not in git): checked when present; the script must not print the old fixed qualifier.
# Round 54: the words are on the country pages now (site/country/<slug>/, seo_pages.mjs; c/<iso>.html sends there)
_sc = (ROOT / "pipeline" / "share_cards.mjs").read_text() + (ROOT / "pipeline" / "seo_pages.mjs").read_text()
_pages = sorted((ROOT / "site" / "country").glob("*/index.html")) if (ROOT / "site" / "country").exists() else []
_old_pages = sorted((ROOT / "site" / "c").glob("*.html")) if (ROOT / "site" / "c").exists() else []
_bad = []
for _p in _pages:
    _desc = _p.read_text()
    _m_iso = re.search(r'<body data-iso="([A-Z]{3})"', _desc)
    _iso = _m_iso.group(1) if _m_iso else _p.parent.name
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
    else "site/country/ not generated (run node pipeline/share_cards.mjs)",
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
    check("ranking marks uncertain directions", not STRICT, "node not found: not checked", warn_only=not STRICT)
    check("docs figures match data.json", not STRICT, "node not found: not checked", warn_only=not STRICT)
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
        r"uncertain\(m\.c, y, hq\)|rankGroup\(m\.c, y, hq\)", _views_js
    )
    _unc_n = {
        q: sum(1 for c in _m["countries"].values() if c[q + "Unc"] and c["gdp"] >= 5) for q in ("ua", "rus", "net")
    }
    check(
        "ranking marks uncertain directions",
        not _wrong and len(_calls) >= 3 and "uncertain(r.c, y, q)" in _html,
        f"rule mismatches: {_wrong[:6] or 'none'}; direction uncertain (GDP >= EUR 5bn): {_unc_n}",
    )
    # 30. round 15 (review 4, H4): every figure tagged in the docs matches the map (check_docs_numbers.py); since round 23
    # the docs are the site's own text, site/content/
    _bad, _n = cdn.check(_m)
    check("docs figures match data.json", not _bad and _n > 0, f"{_n} tagged figures; differing: {_bad[:4] or 'none'}")
    # 38. round 24b (owner, 22 October 2026): business with Russia is shown in two lines, "Paid Russia less / more by"
    # and "Earned less / more from Russia by"; they add up to business with Russia in every country
    _split = [
        k
        for k, c in _m["countries"].items()
        if abs(c["rusPaidEur"] + c["rusEarnedEur"] - c["rusEur"]) > 1e-3 + 1e-4 * abs(c["rusEur"])
    ]
    check(
        "the two business lines add up to business with Russia",
        not _split,
        f"{len(_m['countries'])} countries; paid + earned differs: {_split[:6] or 'none'}",
    )
    # 39. round 24b (owner, 22 October 2026): Belarus is a party to the war (with Russia): its own map category, never
    # ranked, and in no leaning or uncertain list; a party has no leaning
    _party = sorted(k for k, c in _m["countries"].items() if c["party"])
    _plean = [f"{k}.{q}" for k in _party for q in ("ua", "rus", "net") if _m["countries"][k][q + "Lean"]]
    _rank_src = _html[_html.index("function rankList") :][:3000]
    check(
        "a party to the war (Belarus, North Korea) is not ranked and in no list",
        _party == ["BLR", "PRK"]
        and not _plean
        and "PARTY_TO_WAR" in _rank_src
        and "PARTY_TO_WAR.has" in _views_js
        and "Party to the war (with Russia)" in _html,
        f"parties: {_party}; leaning: {_plean or 'none'}",
    )
    # 42. round 29 (owner, 23 October 2026: "in the ranking we have the uncertainty there"): the Ranking view ranks
    # leaning and uncertain directions too, faded and labelled, with a key; parties to the war are listed under it
    # (browser_check.mjs checks the rows against Node)
    check(
        "the ranking shows leaning and uncertain rows in their own groups, and lists the parties under it",
        all(x in _views_js for x in ('" rk-" + m.st', 'class="rk-gh', 'class="rk-key"', "chipGroup(party"))
        and '"leaning: at least a 65% chance of that direction"' not in _html,
        "row classes rk-lean / rk-unc, five group headings (round 38), a key; party chips",
    )
    # 43. round 29 (owner: "show the Kiel numbers next to the real ones and explain the difference in short"): the aid card
    # and the support tile show Kiel's own figure next to the amount counted, wherever Kiel has the country
    _kiel_n = sum(
        1
        for c in data["countries"].values()
        if (c.get("aid") or {}).get("cats") and "kiel" in ((c.get("aid") or {}).get("src") or [])
    )
    check(
        "Kiel's own aid figure is shown next to ours",
        "function kielLine" in _html and _html.count("kielLine(c,") >= 2 and _kiel_n > 30,
        f"{_kiel_n} countries in Kiel get the line in the aid card and the support tile",
    )

# 31. round 15 (approved by the owner): the net is the view the map opens with, then its two parts; the gross "To
# Ukraine" and "To Russia" views are gone, and links to them open the nearest view. Round 17 (redesign, approved by the
# owner): the Filters drawer is closed on load (the page opens with the map, one header line, the legend and the
# Highlights and Filters buttons; round 33: the Highlights are gone, their place taken by the tags in Filters); the
# second number is "Kept from Russia" everywhere ("lens=kept" opens it too), and no page text says "change in payments
# to Russia" any more. Round 19 (the owner's interface changes):
# - three views of the map: the cost to the country is gone (lens=cost opens the net), with no cost wording left in the
#   page's text, and the quick buttons are gone;
# - the drawer opens with a Views list (Map, Ranking, Ukraine vs Russia, Table & data, Sources); How it works is no
#   longer a view (#view=how opens Sources) and the Top lists panel is gone (#c=RANKINGS opens the Ranking view);
# - the drawer is persistent: only its own controls close it (the Filters button, × and Escape), never a view switch, a
#   filter or a country, and its open state is kept in sessionStorage;
# - no view has filter controls of its own: every view reads the drawer.
# Round 20 (owner): only Map, Ranking and Sources remain (#view=bubbles opens Ranking, #view=table opens Sources, where
# the downloads now are); the ranking has no text of its own above the chart: the header line names it and its ⓘ explains it.
# Round 22 (owner): the views are tabs in the header bar (role="tablist"), not in the drawer
# and the second number is named "Business with Russia" (positive: reduced); lens=kept and lens=business open it too.
# Round 25 (owner, 22 October 2026): it is now "Trade with Russia", said as who kept what; lens=trade opens it too.
# Round 23 (owner): Sources is How it works again (view "how"; #view=sources and #view=table open it), and its
# long-form text comes from site/content/ (the method pages, the limitations and the changelog, which every flow's
# "Changes to this flow" reads); no link points at the documentation that used to be in docs/
# Round 41: the map bar repeats the three lenses on the map itself, so each lens is counted once
_buttons = list(dict.fromkeys(re.findall(r'<button data-lens="(\w+)"', _html)))
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
# round 22 (owner): the views are the page's main tabs in the header bar, no longer a block in the drawer
_tabs = re.search(r'<nav class="vtabs" role="tablist"[\s\S]*?</nav>', _html)
_dviews = re.findall(r'<button role="tab" data-view="(\w+)"', _tabs.group(0)) if _tabs else []
_views_in_drawer = bool(_drawer and "data-view=" in _drawer.group(0))
_views_const = re.search(r"const VIEWS = \[([^\]]*)\]", _html)
_views_list = re.findall(r'"(\w+)"', _views_const.group(1)) if _views_const else []
_old_view = re.search(r"const OLD_VIEW = \{([^}]*)\}", _html)
_old_view_map = dict(re.findall(r'(\w+): "(\w+)"', _old_view.group(1))) if _old_view else {}
_want_views = ["map", "rank", "how"]
_closers = [
    ln.strip()
    for ln in _site_text.splitlines()
    if re.search(r"\bcloseDrawer\(\)", ln) and not ln.strip().startswith("function")
]
_bad_close = [ln[:60] for ln in _closers if "fbtn" not in ln]
_view_filters = re.findall(r"filtersHtml|data-small|data-group=|data-quick", _views_src + _html)
check(
    "the map opens with the net; old views open the nearest one; the views are header tabs; the drawer stays open",
    _buttons == ["net", "support", "payments"]
    and bool(_start)
    and _start.group(1) == "net"
    and _old_map
    == {
        "change": "net",
        "ukr": "support",
        "rus": "payments",
        "kept": "payments",
        "business": "payments",
        "trade": "payments",
        "cost": "net",
    }
    and _lens_keys == _buttons
    and 'data-lens="cost"' not in _html
    and 'data-lens="ukr"' not in _html
    and 'data-lens="rus"' not in _html
    and '<button data-lens="payments" aria-pressed="false" data-i18n="Russia\'s earnings from trade">' in _html
    and re.search(r'<aside class="drawer" id="drawer"[^>]*\bhidden>', _html) is not None
    and 'id="hlbtn"' not in _html
    and bool(_drawer and 'id="tagfilters"' in _drawer.group(0))
    and 'id="fbtn"' in _html
    and not _old_name
    and not _cost_words
    and _dviews == _want_views
    and not _views_in_drawer
    and _views_list == _want_views
    and _old_view_map.get("sources") == "how"
    and _old_view_map.get("bubbles") == "rank"
    and _old_view_map.get("table") == "how"
    and "function renderHow" in _html
    and all((ROOT / "site" / "content" / f).is_file() for f in ("changelog.md", "limitations.md", "method/overview.md"))
    and not re.search(r"blob/main/docs/(?:method|decisions|decision-log|trace|limitations|changelog)", _site_text)
    and "renderBubbles" not in _views_src
    and "renderTable" not in _views_src
    and "function rankInfo" in _views_src
    and "dl-full" in _views_src
    and '"RANKINGS"' in _html
    and "closeMenu" not in _site_text
    and "sessionStorage" in _html
    and not _bad_close
    and len(_closers) >= 3
    and not _view_filters,
    f"lens buttons {_buttons}; start {_start.group(1) if _start else None}; old links {_old_map}; header tabs "
    f"{_dviews} (in the drawer too: {_views_in_drawer}); old views {_old_view_map}; drawer closed by {len(_closers)} controls (others: {_bad_close or 'none'}); "
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
    check(
        "browser shows the same numbers as Node",
        not STRICT,
        "node or Playwright not found: not checked",
        warn_only=not STRICT,
    )
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

# 37. round 24 (audit C; approved by the owner on 22 October 2026): every source the map cites has a type (its group in
# How it works) and 1-3 key documents shown under its name, or is this project's own model; the source's own link is
# never a bare homepage; the dead links audit C found are replaced (research/2026-10/link_fixes.json); the site no
# longer hides the documents in one "Exact tables and reports" fold
_types = {"data", "report", "press", "ours", "notes"}
_fixes = json.loads((ROOT / "research" / "2026-10" / "link_fixes.json").read_text())["fixes"]
_src_bad, _home, _dead = [], [], []
for _sid, _s in data["sources"].items():
    _keys = [lk for lk in _s.get("links") or [] if lk.get("key")]
    if _s.get("type") not in _types or not (1 <= len(_keys) <= 3 or _s.get("type") == "ours"):
        _src_bad.append(_sid)
    _u = _s.get("url") or ""
    if _u and _u.split("/", 3)[3:] in ([], [""]):
        _home.append(_sid)
    _dead += [_sid for lk in _s.get("links") or [] if lk["url"] in _fixes] + ([_sid] if _u in _fixes else [])
check(
    "every source has a type and key documents; no homepage or known dead link",
    not _src_bad
    and not _home
    and not _dead
    and "Exact tables and reports" not in _html
    and "function srcItem" in _html,
    f"{len(data['sources'])} sources; untyped or without key documents: {_src_bad[:5] or 'none'}; homepage as main "
    f"link: {_home[:5] or 'none'}; known dead links left: {sorted(set(_dead))[:5] or 'none'}",
)

# 40. round 24b (audit 24 D M4; the owner, 22 October 2026): military aid counts as delivered; the undelivered amount
# is never more than what was allocated, never below zero, and the slow lead times leave more undelivered than the
# central ones; Kiel's full allocation is the high end (no adjustment there)
_ud_bad = []
for _iso, _c in countries.items():
    _u = (_c.get("aid") or {}).get("undeliv")
    if not _u:
        continue
    _mil = ((_c.get("aid") or {}).get("cats") or {}).get("military", 0)
    _cc, _cl = list(itertools.accumulate(_u["c"])), list(itertools.accumulate(_u["l"]))
    if (
        any(v > 1e-6 or v < -_mil - 1e-6 for v in _cc + _cl)
        or any(v > 1e-9 for v in _u["h"])
        or any(lo > cc + 1e-4 for lo, cc in zip(_cl, _cc))
    ):
        _ud_bad.append(_iso)
_ud_n = sum(1 for _c in countries.values() if (_c.get("aid") or {}).get("undeliv"))
check(
    "military aid delivered is no more than allocated",
    _ud_n > 0 and not _ud_bad,
    f"{_ud_n} donors adjusted; undelivered above allocation, below zero or out of order: {_ud_bad[:6] or 'none'}",
)

# 41. round 24b (audit 24 D M5; the owner): the captive-buyer label was a label only. Round 26 (the owner, 22 October
# 2026: "everybody has alternatives... there's always a way") removed it; Hungary and Slovakia's "kept buying Russian
# pipeline oil (EU exemption)" label is a label only too: no number in the model reads it, and no captive label is left
_model_src = _html[_html.index("// ===== Model =====") : _html.index("function lensValue")]
_cap = sorted(k for k, c in countries.items() if c.get("captive"))
_pe = sorted(k for k, c in countries.items() if c.get("pipeline_exempt"))
check(
    "no captive label; the pipeline-exemption label changes no numbers",
    not _cap and _pe == ["HUN", "SVK"] and "pipeline_exempt" not in _model_src and ".captive" not in _html,
    f"captive labels: {_cap or 'none'}; pipeline exemption: {_pe}; read by the model: {'yes' if 'pipeline_exempt' in _model_src else 'no'}",
)

# 42. round 25 (owner, 22 October 2026: story tags, "then we back that up with the numbers"): every tag rule in
# storyTags() is in the table of site/content/method/tags.md with a source; a tag that states a figure from a data
# source links its sources (ref(...)) in its sentence; Belarus's "party" tag comes first (also checked in the browser,
# check 32)
_st = _html[_html.index("function storyTags(") :]
_st = _st[: _st.index("\nfunction tagsHtml(")]
_keys = sorted(set(re.findall(r'add\(\d+, "(\w+)"', _st)))
_tags_md = (ROOT / "site" / "content" / "method" / "tags.md").read_text()
_rows = {
    k: row for row in _tags_md.splitlines() if row.startswith("|") for k in re.findall(r"`(\w+)`", row.split("|")[1])
}
_undoc = [k for k in _keys if k not in _rows or not _rows[k].rstrip("|").split("|")[-1].strip()]
_data_tags = [
    "party",
    "gascut",
    "exempt",
    "sanct",
    "windfall",
    "discount",
    "hidden",
    "bought",
    "sold",
    "hub",
    "mil",
    "aid",
    "refugees",
    "rusfirms",
    "tax",
    "ship",
]


def _tag_call(key):
    # the add(...) statement of a tag, up to its closing ");" at the end of a line, with the line before it (a sentence
    # built beforehand, as for "aid")
    i = re.search(r"add\(\d+, \"" + key + '"', _st).start()
    j = _st.index(");\n", i)
    return _st[_st.rfind("\n", 0, _st.rfind("\n", 0, i)) : j]


_no_ref = [k for k in _data_tags if not re.search(r"add\(\d+, \"" + k + '"', _st) or "ref(" not in _tag_call(k)]
check(
    "every story tag is documented with a source, and data tags cite theirs",
    bool(_keys) and not _undoc and not _no_ref and 'add(100, "party"' in _st,
    f"{len(_keys)} tag rules; not in tags.md with a source: {_undoc or 'none'}; data tags without sources: {_no_ref or 'none'}",
)

# 47. round 33 (owner, 23 October 2026: "remove the highlights and use the tags in the filter section to get similar
# interesting insights but based on tags"): every tag filter in Filters (TAG_CAT in index.html) is a story tag rule
# (storyTags) in the table of tags.md, a tag with two versions ("bought", "sold", "aid", "orange") being two filters;
# no Highlights code is left. That picking tags changes no number is checked in the browser (check 32,
# browser_check.mjs part 5)
_tc = _html[_html.index("const TAG_CAT = {") :]
_tc = _tc[: _tc.index("\n};\n")]
_filters = re.findall(r"^  (\w+): \{ g: \"(?:why|did|sure)\"", _tc, re.M)
_base = {"bought_less": "bought", "bought_more": "bought", "sold_less": "sold", "sold_more": "sold"}
_base |= {"aid_top": "aid", "aid_major": "aid", "orange_fuel": "orange", "orange_sales": "orange"}
_unmatched = [f for f in _filters if _base.get(f, f) not in _keys or _base.get(f, f) not in _rows]
_untagged = [k for k in _keys if k not in {_base.get(f, f) for f in _filters}]
_hl_left = [x for x in ('id="hlbtn"', 'id="hlpanel"', "state.hl", "function renderChips", "const HL =") if x in _html]
check(
    "every tag filter is a documented story tag, and the Highlights are gone",
    len(_filters) >= 20 and not _unmatched and not _untagged and not _hl_left,
    f"{len(_filters)} tag filters for {len(_keys)} tag rules; not a documented rule: {_unmatched or 'none'}; "
    f"rules without a filter: {_untagged or 'none'}; Highlights left: {_hl_left or 'none'}",
)

# ---- outside benchmarks (round 29, audit 29 item 3; approved by the owner): hard checks, FAIL when out of tolerance.
# Checks 3 and 9 above compare totals loosely and only warn; these compare each input with its published source.
# Tolerances, with their reasons:
# Kiel Ukraine Support Tracker, Release 31 ("Country Summary (EUR)", research/2026-10/kiel.json): the model's aid input
# (aid.years before its own adjustments, less the EU share, plus the ERA loans it leaves out) must equal each donor's
# total_allocated. 1%: amounts without a month are spread over years and each year is rounded to 4 decimals, which moves
# a total by far less than 1%; a donor read from the wrong row or a lost year moves it by more
KIEL_TOL = 0.01
KIEL_TOP_DONORS = 20
# CREA Russia Fossil Tracker (research/2026-10/crea.json, calendar years, retrieved 2026-10-17) against the model's fossil
# payments input (gaps/energy.json fossil_from_russia, the same CREA API queried by month to 31 August 2026). Summed over
# the countries CREA reports in that year, 2021-2025 (2026 is left out: CREA's figure runs to 16 October, energy.json to
# August). 1%: both are the same CREA counter, so only rounding and CREA's later revisions of Kpler arrivals may differ
CREA_TOL = 0.01
CREA_YEARS = ("2021", "2022", "2023", "2024", "2025")
# Eurostat migr_asytpsm (beneficiaries of temporary protection, citizens of Ukraine, end of month; EU27_2020 aggregate;
# research/2026-10/raw/eurostat_tp/migr_asytpsm_UA.json) against the EU-27 refugee counts of the refugee input
# (gaps/refugees.json counts, end of year). 1%: Eurostat rounds each country to 5, and late revisions are small
REFUGEE_EU_TOL = 0.01

# 43. Kiel: the model's aid input matches Kiel's total for each of the top donors
_kd = {i: d for i, d in kiel["donors"].items() if i != "EU_INST" and d.get("total_allocated")}
_top = sorted(_kd, key=lambda i: -_kd[i]["total_allocated"])[:KIEL_TOP_DONORS]
_kiel_off = []
for _i in _top:
    _a = (countries.get(_i) or {}).get("aid") or {}
    _own = total(_a.get("years")) - total(_a.get("eu_years")) + (_a.get("era_excluded") or 0)
    if "kiel" not in _a.get("src", []) or abs(_own / _kd[_i]["total_allocated"] - 1) > KIEL_TOL:
        _kiel_off.append(f"{_i} {_own:.2f}/{_kd[_i]['total_allocated']:.2f}")
check(
    "aid input matches Kiel for the top donors",
    not _kiel_off,
    f"top {len(_top)} Kiel donors within {KIEL_TOL:.0%}; off: {_kiel_off or 'none'}",
)

# 44. CREA: fossil fuel payments by year in the model's input match CREA's published totals
_en = json.loads((RESEARCH / "gaps" / "energy.json").read_text())["countries"]
_crea_off, _crea_txt = [], []
for _y in CREA_YEARS:
    _key = {"2022": "2022_calendar_full"}.get(_y, _y)
    _cv = {
        k: (v.get("fossil_2021") if _y == "2021" else (v.get("fossil_by_year") or {}).get(_key))
        for k, v in crea["countries"].items()
    }
    _cv = {k: v for k, v in _cv.items() if v}
    _cr = sum(_cv.values())
    _ours = sum((((_en.get(k) or {}).get("fossil_from_russia") or {}).get(_y) or {}).get("central", 0) for k in _cv)
    _crea_txt.append(f"{_y} {_ours:.1f}/{_cr:.1f}")
    if not _cr or abs(_ours / _cr - 1) > CREA_TOL:
        _crea_off.append(_y)
check(
    "fossil payments input matches CREA by year",
    not _crea_off,
    f"ours/CREA EUR bn {', '.join(_crea_txt)} (within {CREA_TOL:.0%}); off: {_crea_off or 'none'}",
)

# 45. Eurostat: the EU-27 refugee counts of the refugee input match Eurostat's EU total, and the map carries them
_tp = json.loads((RESEARCH / "raw" / "eurostat_tp" / "migr_asytpsm_UA.json").read_text())
_geo, _tm = _tp["dimension"]["geo"]["category"]["index"], _tp["dimension"]["time"]["category"]["index"]
_refc = json.loads((RESEARCH / "gaps" / "refugees.json").read_text())["countries"]
_eu27 = bd.EU27
_ref_off, _ref_txt = [], []
for _y in ("2022", "2023", "2024", "2025"):
    _es = _tp["value"].get(str(_geo["EU27_2020"] * len(_tm) + _tm[f"{_y}-12"]))
    _in = sum(((_refc.get(k) or {}).get("counts") or {}).get(_y) or 0 for k in _eu27)
    _ref_txt.append(f"{_y} {_in / 1e6:.3f}/{(_es or 0) / 1e6:.3f}m")
    if not _es or abs(_in / _es - 1) > REFUGEE_EU_TOL:
        _ref_off.append(_y)
# the map's refugee count (people.refugees, the latest year of the input) sums to the input's EU-27 total
_latest = {
    k: next(((d.get("counts") or {})[y] for y in ("2026", "2025", "2024") if (d.get("counts") or {}).get(y)), 0)
    for k, d in _refc.items()
    if k in _eu27
}
_map = sum((((countries.get(k) or {}).get("people") or {}).get("refugees") or {}).get("count") or 0 for k in _eu27)
if abs(_map - sum(_latest.values())) > 0.001 * max(1, sum(_latest.values())):
    _ref_off.append("map count")
check(
    "EU refugee counts match Eurostat",
    not _ref_off,
    f"input/Eurostat end of year {', '.join(_ref_txt)} (within {REFUGEE_EU_TOL:.0%}); map EU-27 count "
    f"{_map / 1e6:.3f}m vs input {sum(_latest.values()) / 1e6:.3f}m; off: {_ref_off or 'none'}",
)

# 46. round 30 (the owner, 23 October 2026: the site moves to its own address): the site's address is in one place,
# pipeline/site_config.json; the map's head (canonical, og:url, og:image, the hreflang alternates), its SITE_URL, the
# CNAME file and every country page's canonical use it; no file in site/ still gives the old github.io address as the
# site's own (index.html keeps each once, in OLD_URLS, to recognise old links; round 32 adds followthemoneyukraine.org); robots.txt and sitemap.xml, written with
# the share cards, list the sitemap and every country page. Without the share cards (a local run) that half only warns,
# like check 24; in CI (strict) it fails.
_cfg = json.loads((ROOT / "pipeline" / "site_config.json").read_text())
_su, _ous = _cfg["site_url"], _cfg["old_urls"]
_bad = []
_need = [
    f'<link rel="canonical" href="{_su}">',
    f'<meta property="og:url" content="{_su}">',
    f'<meta property="og:image" content="{_su}share/world.png">',
    f'<link rel="alternate" hreflang="x-default" href="{_su}">',
    f'const SITE_URL = "{_su}", OLD_URLS = {json.dumps(_ous)};'.replace('","', '", "'),
]
_bad += [n[:50] for n in _need if n not in _html]
if (ROOT / "site" / "CNAME").read_text().strip() != _su.split("//")[1].strip("/"):
    _bad.append("CNAME")
for _f in [
    *(ROOT / "site").glob("*.html"),
    *(ROOT / "site").glob("*.js"),
    *(ROOT / "site").glob("*.json"),
    *(ROOT / "site" / "i18n").glob("*.js"),
    *(ROOT / "site" / "content").rglob("*.md"),
    *_pages,
]:
    _txt = _f.read_text()
    for _old in (u.rstrip("/") for u in _ous):
        _n = _txt.count(_old)
        if _n > (1 if _f.name == "index.html" else 0):
            _bad.append(f"{_f.name}: old address {_old} {_n}x")
# round 54: an old share link (c/<iso>.html) names its country page as canonical and sends the reader there
for _p in _old_pages:
    _t = _p.read_text()
    _to = re.search(r'<meta http-equiv="refresh" content="0; url=(/country/[\w-]+/)">', _t)
    if not _to or f'<link rel="canonical" href="{_su}{_to.group(1)[1:]}">' not in _t:
        _bad.append(f"c/{_p.name} not sent to its country page")
import seo_check  # noqa: E402

_robots, _smap = ROOT / "site" / "robots.txt", ROOT / "site" / "sitemap.xml"
_seo_missing = []
if _pages:
    if not _robots.exists() or f"Sitemap: {_su}sitemap.xml" not in _robots.read_text():
        _bad.append("robots.txt")
    # round 56: sitemap.xml is an index of one sitemap per language (seo_check.site_urls reads them all)
    _sm = "\n".join(f"<loc>{u}</loc>" for u in seo_check.site_urls(ROOT / "site", _su)) if _smap.exists() else ""
    # every country page is in it (check 48 names any missing), and the old share links are not
    if _sm.count(f"<loc>{_su}country/") < len(_pages) or f"<loc>{_su}c/" in _sm:
        _bad.append("sitemap: country pages missing or old c/ links listed")
else:
    _seo_missing.append("share cards, robots.txt and sitemap.xml not generated (run node pipeline/share_cards.mjs)")
check(
    "the site's own address is one setting, with robots.txt and a full sitemap",
    not _bad and not (_seo_missing and STRICT),
    f"site_url {_su}; {len(_pages)} country pages, {len(_old_pages)} old share links; "
    f"problems: {_bad or 'none'}{'; ' + _seo_missing[0] if _seo_missing else ''}",
    warn_only=bool(_seo_missing) and not _bad and not STRICT,
)

# 48. round 54 (findable pages, approved by the owner on 26 October 2026: "do the full SEO plan"): every country has its
# own page, and every page in sitemap.xml is a real one: it exists, names itself as canonical, has no meta refresh, keeps
# its title to 60 characters and its description to 155, and lists hreflang alternates that list it back. The number and
# the chance word in each English country page's title are the model's (a "too close to call" country is never titled
# as if it were certain), and the map's A–Z list links every country page. pipeline/seo_check.py; pages written by
# seo_pages.mjs with the share cards (not in git): without them a local run warns, CI (strict) fails.
# Round 55 (topic and group pages, owner: "similar pages loading the same thing"): every entry of
# pipeline/seo_topics.json is written, in the sitemap and linked from the home page's Topics list, and in each of its
# tables every country's net, support and trade figures and chance words are the model's; a group's totals add up.
# Round 56 (owner: "many many pages ... use what we have and show it in a new manner"): every country page and every
# topic, group, part, year and comparison page (pipeline/seo_families.json) and the Topics page in all seven languages,
# with the model's numbers in each language's format and the map's own chance words; sitemap.xml an index of one
# sitemap per language.
# Round 57 (owner: "fail if any hand-written text ... contains a claim that can go stale"): and the wording guard
# (seo_check.py wording_problems): every text field of seo_topics.json and seo_families.json and every phrase of the one
# translation table seo_i18n.mjs (and seo_templates.mjs), in all seven languages, holds no number, ranking, comparison,
# direction, certainty, trend or absolute word outside a placeholder or condition; each problem names the file, the
# entry or key, the language and the word. It reads the sources, so it runs with or without the generated pages.
# Round 57b (richer country pages, owner: "looks good, only the sources links should be real links"): on every country
# page in every language, each figure its sections and questions write is the model's (seo_country.mjs marks what each
# shows; seo_check.py check_dyn works it out again from site_numbers.mjs: amounts, parts, costs, years, trade before and
# after, loans, money flowing back, ranks by the map's rule), the neighbours' and similar countries' figures and chance
# words are the model's, the visible questions are the JSON-LD FAQPage word for word, and every source is a working
# link (a well-formed http(s) address, or a place on the page or the site that exists). The guard also reads the
# comparative words (smaller, higher, below, far more ...).
# Round 58 (explainers, search wording, pages for reuse): every generated page carries its cite line (with its own
# address) and links its Markdown version (index.md), which exists and writes no figure the page does not; llms-full.txt
# has every country's net and support as the model has them; the downloads page's links resolve and its countries CSV
# (the map's own export) has the model's net, support and trade for every country. The guard reads the explainers too.

try:
    _wording, _n_wording = seo_check.check_wording(ROOT, _node)
except RuntimeError as _err:  # a phrase table that does not load
    _wording, _n_wording = [f"seo_i18n.mjs did not load: {_err}"], 0
if not _node and STRICT:
    _wording.append("node not found: the phrases of seo_i18n.mjs were not read")
if not (ROOT / "site" / "country").exists():
    check(
        "findable pages: one per country, self canonical, short titles, true numbers",
        not STRICT and not _wording,
        "site/country/ not generated (run node pipeline/share_cards.mjs)"
        + (f"; wording: {_wording[:4]}" if _wording else f"; wording: {_n_wording} phrases, none stale"),
        warn_only=not STRICT and not _wording,
    )
else:
    # round 55: and every topic and group page of pipeline/seo_topics.json
    _topics = json.loads((ROOT / "pipeline" / "seo_topics.json").read_text())["pages"]
    _fam = json.loads((ROOT / "pipeline" / "seo_families.json").read_text())
    # round 58 (owner: "the ranking does not work and the numbers make no sense ... fix this type of stuff for all
    # pages"): and every table's own sanity (seo_check.check_sanity): each value inside its own range, the range low to
    # high in the value's sign, every figure of a cell signed by its measure's convention, shares of GDP and figures per
    # person that are the euros over GDP and population, chance words only where the map gives the measure a chance, no
    # column repeating the same words in every row, the rows in the order the note states, a group's totals its rows
    # added up, support + trade + frozen = net on the pages by year, the same figures in every language, a comparison's
    # countries in the order of its address, and the ranking pages' groups high to low
    try:
        _phr = seo_check.order_phrases(ROOT / "pipeline", _node) if _node else None
    except RuntimeError as _err:
        _phr, _wording = None, _wording + [f"seo_i18n.mjs order phrases did not load: {_err}"]
    _seo = seo_check.check_site(ROOT / "site", _su, _m, _topics, _fam, _phr)
    _seo["wording"] = _wording
    _seo_bad = {k: v for k, v in _seo.items() if v}
    _smf = ROOT / "site" / "sitemap.xml"
    _n_sm = len(seo_check.site_urls(ROOT / "site", _su)) if _smf.exists() else 0
    _n_fam = len(seo_check.family_pages(_m, _topics, _fam)) if _m else 0
    check(
        "findable pages: one per country, self canonical, short titles, true numbers",
        not _seo_bad and _m is not None,
        f"{_n_sm} pages in the sitemap, {len(_topics)} topic and group pages, {_n_fam} topic and family pages "
        f"in {len(seo_check.LANGS)} languages; {_n_wording} hand-written phrases read by the wording guard; problems: "
        + ("; ".join(f"{k}: {v[:4]}" for k, v in _seo_bad.items()) if _seo_bad else "none")
        + ("" if _m is not None else "; node not found: titles not checked"),
    )

# 49. round 60 (audit: the translated map apps called the site by another project's name): the site's name is "War
# Balance" in every language; no translation of the old name appears outside the one line that disowns it
_brand_bad = []
for _f in sorted((ROOT / "site" / "i18n").glob("*.js")):
    _t = _f.read_text()
    _m_b = re.search(r'^  "War Balance": "([^"]*)",?$', _t, re.M)
    if not _m_b or _m_b.group(1) != "War Balance":
        _brand_bad.append(f"{_f.name}: War Balance -> {_m_b.group(1) if _m_b else 'missing'}")
    for _old in (
        "Spur des Geldes",
        "Sigue el dinero",
        "Suivre l'argent",
        "Volg het geld",
        "Śladem pieniędzy",
        "Слідами грошей",
    ):
        if _old in _t:
            _brand_bad.append(f"{_f.name}: {_old}")
check("the site's name is War Balance in every language", not _brand_bad, f"problems: {_brand_bad or 'none'}")

# 50. round 60 (audit: ranges crossing zero labelled "very likely"; Russia's earnings from trade in two lines): a number
# the map calls very likely has its likely range on that side; and data.json's rusGain and ownGain (each line's
# cumulative middle value to the last year) are the model's two lines of Russia's earnings from trade, adding up to it
_cross, _split = [], []
if _m:
    for _iso, _c in _m["countries"].items():
        for _q in ("net", "ua", "rus"):
            if (
                not _c.get(_q + "Unc") and _c.get(_q + "Lo") is not None and _c[_q + "Lo"] * _c[_q + "Hi"] < 0
            ):  # (4 decimals: an end of 0.0000 is above zero)
                _cross.append(f"{_iso} {_q}")
        _dc = countries.get(_iso) or {}
        for _k, _mk in (("rusGain", "rusPaidEur"), ("ownGain", "rusEarnedEur")):
            _cum = ((_dc.get(_k) or {}).get("cum") or [None])[-1]
            if _cum is not None and _c.get(_mk) is not None and abs(_cum[0] - _c[_mk]) > 2e-3:
                _split.append(f"{_iso} {_k} {_cum[0]} vs {_c[_mk]}")
        if _c.get("rusPaidEur") is not None and abs(_c["rusPaidEur"] + _c["rusEarnedEur"] - _c["rusEur"]) > 2e-3:
            _split.append(f"{_iso} lines do not add up")
check(
    "very likely only with the likely range on that side; Russia's gain and own gain add up to the trade number",
    _m is not None and not _cross and not _split,
    f"very likely across zero: {_cross[:8] or 'none'}; gain split: {_split[:6] or 'none'}"
    + ("" if _m is not None else "; node not found: not checked"),
    warn_only=_m is None and not STRICT,
)

width = max(len(n) for _, n, _ in results)
for status, name, detail in results:
    print(f"{status:4}  {name:<{width}}  {detail}")
sys.exit(1 if any(s == "FAIL" for s, _, _ in results) else 0)
