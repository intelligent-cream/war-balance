"""Net gain per euro of sales for sellers other than Russia and Ukraine (round 13): research/2026-10/gaps/net_gain_sellers.json.

The same concept as net_gain_russia.json and net_gain_ukraine.json: taxes on production plus profit above a normal
return, as a share of output. From the OECD STAN database (2025 edition), by country and industry:

    gain = (other taxes less subsidies on production D29X39 + net operating surplus and mixed income B2A3N
            - the labour part of mixed income (self-employed x compensation per employee)
            - normal return x net capital stock at current replacement cost N11NA) / output P1

Profit tax is paid out of the operating surplus, so it is inside the gain. Central: the mean of 2021-2023 (the years
STAN has during the war) at a 9% normal return, as for Russia; low: the lowest year of 2019-2023 at 10%; high: the
highest at 8%. Each share is kept between 0 and 1. Economies outside STAN take the OECD median of the same industry
group (marked "oecd_median"). Raw downloads: research/2026-10/raw/oecd_stan/ (fetched 2026-10-19 from
https://sdmx.oecd.org/public/rest/data/OECD.STI.PIE,DSD_STAN@DF_STAN_2025,1.0/...).

Run from the repository root: python3 research/2026-10/scripts/net_gain_sellers.py
"""

from __future__ import annotations

import csv
import json
import statistics
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "research/2026-10/raw/oecd_stan"
OUT = ROOT / "research/2026-10/gaps/net_gain_sellers.json"
R = {"central": 0.09, "low": 0.10, "high": 0.08}  # normal return before tax, as in net_gain_russia.json
CENTRAL_YEARS, RANGE_YEARS = (2021, 2022, 2023), (2019, 2020, 2021, 2022, 2023)
# industry groups per kind of earning (the same industries value_kept.json used, but the seller's own industry only)
GROUPS = {
    "goods": ["C"],  # sales to Russia and other goods (manufacturing)
    "weapons": ["C252", "C303", "C304", "C26"],  # weapons and ammunition, aircraft, military vehicles, electronics
    "weapons_fallback": ["C25", "C26", "C28", "C30"],  # where STAN has no 3-digit defence industries
    "fuel": ["C19"],  # refined petroleum (fuel sold to Ukraine)
    "services": ["I", "GTN"],  # accommodation and food; business services
    "shipping": ["H50"],  # water transport
    "insurance": ["K65"],
    "finance": ["K"],  # payment agents' fees
}
PARENT = {"C252": "C25", "C303": "C30", "C304": "C30"}

data: dict[tuple[str, str], dict[tuple[str, int], float]] = defaultdict(dict)
for name in ("stan_flows.csv", "stan_capital.csv", "stan_persons.csv"):
    with open(RAW / name) as fh:
        rows = list(csv.DictReader(fh))
    for x in rows:
        if x["OBS_VALUE"] == "":
            continue
        # UNIT_MULT differs between measures (persons in thousands, money in millions)
        v = float(x["OBS_VALUE"]) * 10 ** int(x["UNIT_MULT"] or 0)
        data[(x["REF_AREA"], x["ACTIVITY"])][(x["MEASURE"], int(x["TIME_PERIOD"]))] = v


def clamp(v: float) -> float:
    return min(1.0, max(0.0, v))


def ratio(c: str, a: str, num: str, y: int) -> float | None:
    d = data.get((c, a), {})
    p, v = d.get(("P1", y)), d.get((num, y))
    return v / p if p and v is not None else None


def k_over_p(a: str, y: int) -> float | None:
    """Median net capital stock per unit of output of an industry, over the economies that report it."""
    v = [r for c in {k[0] for k in data} if (r := ratio(c, a, "N11NA", y)) is not None and r > 0]
    return statistics.median(v) if v else None


def share(c: str, a: str, y: int, r: float) -> tuple[float, dict] | None:
    d = data.get((c, a), {})
    p = d.get(("P1", y))
    if not p:
        return None
    tax = d.get(("D29X39", y), 0.0)
    nos, how = d.get(("B2A3N", y)), "net operating surplus"
    if nos is None:
        gos, cfc = d.get(("B2A3G", y)), d.get(("P51C", y))
        if gos is None:
            return None
        if cfc is None:  # 3-digit defence industries: depreciation per unit of output of the parent industry
            pr = ratio(c, PARENT.get(a, a), "P51C", y)
            if pr is None:
                return None
            cfc, how = pr * p, "gross surplus less parent industry's depreciation ratio"
        nos = gos - cfc
    sal, emp, slf, d1 = (d.get((m, y)) for m in ("SAL", "EMP", "SELF", "D1"))
    if slf is None and emp is not None and sal is not None:
        slf = emp - sal
    mixed = slf * d1 / sal if slf and d1 and sal else 0.0
    k, kb = d.get(("N11NA", y)), "own net capital stock"
    if k is None:
        kr = ratio(c, PARENT[a], "N11NA", y) if a in PARENT else None
        kb = "parent industry's capital per unit of output" if kr else "OECD median capital per unit of output"
        kr = kr or k_over_p(PARENT.get(a, a), y) or 0.0
        k = kr * p
    # tiny 3-digit industries with implausible accounts (taxes or surplus larger than output) are left out
    if abs(tax) > 0.5 * p or abs(nos) > p or mixed > p:
        return None
    g = (tax + nos - mixed - r * k) / p
    return g, {
        "tax": tax / p,
        "surplus": nos / p,
        "mixed_labour": mixed / p,
        "capital": k / p,
        "surplus_basis": how,
        "capital_basis": kb,
    }


def industry(c: str, a: str) -> dict | None:
    mid = [s for y in CENTRAL_YEARS if (s := share(c, a, y, R["central"]))]
    if not mid:
        return None
    lo = [s[0] for y in RANGE_YEARS if (s := share(c, a, y, R["low"]))]
    hi = [s[0] for y in RANGE_YEARS if (s := share(c, a, y, R["high"]))]
    cen = clamp(statistics.mean(s[0] for s in mid))
    det = {k: round(statistics.mean(s[1][k] for s in mid), 4) for k in ("tax", "surplus", "mixed_labour", "capital")}
    return {
        "low": round(min(cen, clamp(min(lo))), 4),
        "central": round(cen, 4),
        "high": round(max(cen, clamp(max(hi))), 4),
        "years": [y for y in CENTRAL_YEARS if share(c, a, y, R["central"])],
        "per_unit_of_output": det,
        "basis": mid[-1][1]["surplus_basis"] + "; " + mid[-1][1]["capital_basis"],
    }


countries = sorted({k[0] for k in data})
out: dict[str, dict] = {}
for c in countries:
    ind = {a: v for a in sorted({a for g in GROUPS.values() for a in g}) if (v := industry(c, a))}
    grp = {}
    for g, acts in GROUPS.items():
        if g == "weapons_fallback":
            continue
        use = [a for a in acts if a in ind]
        if g == "weapons" and len([a for a in use if a != "C26"]) == 0:
            use = [a for a in GROUPS["weapons_fallback"] if a in ind]
        if not use:
            continue
        grp[g] = {b: round(statistics.mean(ind[a][b] for a in use), 4) for b in ("low", "central", "high")}
        grp[g]["industries"] = use
        grp[g]["basis"] = "own"
    out[c] = {"groups": grp, "industries": ind}
median = {}
for g in GROUPS:
    if g == "weapons_fallback":
        continue
    v = sorted(out[c]["groups"][g]["central"] for c in countries if g in out[c]["groups"])
    q = statistics.quantiles(v, n=4) if len(v) >= 4 else [min(v), statistics.median(v), max(v)]
    median[g] = {
        "low": round(max(0.0, q[0]), 4),
        "central": round(statistics.median(v), 4),
        "high": round(q[2], 4),
        "n": len(v),
    }
res = {
    "generated": "2026-10-19",
    "meta": {
        "what": "Net gain per euro of sales for every seller other than Russia and Ukraine: other taxes on production plus profit above a normal return, as a share of output, by industry group (round 13 audit: one valuation rule for every seller)",
        "formula": "(D29X39 + B2A3N - SELF x D1/SAL - r x N11NA) / P1; B2A3N = B2A3G - P51C where only gross surplus is published",
        "normal_return": R,
        "years": {"central": list(CENTRAL_YEARS), "range": list(RANGE_YEARS)},
        "groups": {k: v for k, v in GROUPS.items()},
        "use": "multiply a gross sale by the group share and by value_kept.json's 'genuinely extra' factor; economies outside STAN take oecd_median",
        "script": "research/2026-10/scripts/net_gain_sellers.py",
    },
    "oecd_median": median,
    "countries": out,
    "sources": [
        {
            "name": "OECD STAN Database for Structural Analysis, 2025 edition (DSD_STAN@DF_STAN_2025): output, other taxes less subsidies on production, operating surplus and mixed income, consumption of fixed capital, compensation of employees, net capital stock, employees and self-employed by industry",
            "url": "https://sdmx.oecd.org/public/rest/data/OECD.STI.PIE,DSD_STAN@DF_STAN_2025,1.0/A..C+C19+C25+C252+C26+C28+C30+C303+C304+H50+I+GTN+K+K65+_T.P1+D29X39+B2A3N+B2A3G+P51C+D1.V.XDC?startPeriod=2017&endPeriod=2024&format=csv",
            "date": "retrieved 2026-10-19",
        }
    ],
}
OUT.write_text(json.dumps(res, indent=1) + "\n")
print("countries", len(out))
for g, m in median.items():
    print(g, m)
for c in ("USA", "DEU", "GBR", "FRA", "POL", "CZE", "KOR", "TUR", "GRC", "NOR", "DNK", "CYP", "FIN", "JPN"):
    if c in out:
        print(c, {g: v["central"] for g, v in out[c]["groups"].items()})
