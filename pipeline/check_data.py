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
                    rows = zip(v, obj[mid_k], obj[hi_k])
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
        * 0.3
    )
    # loans valued at their grant element (loans_value.json, round 5, which leaves ERA out) replace the flat 0.3
    lv = (LOANS.get(iso3) or {}).get("loans_guarantees_economic_value")
    limit = sum((v or {}).get("central", 0) for v in lv.values()) if lv else max(0, own_loans) * 0.3 + eu_ge
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

width = max(len(n) for _, n, _ in results)
for status, name, detail in results:
    print(f"{status:4}  {name:<{width}}  {detail}")
sys.exit(1 if any(s == "FAIL" for s, _, _ in results) else 0)
