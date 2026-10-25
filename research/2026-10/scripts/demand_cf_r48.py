"""Round 48: an "observed demand" no-war model for purchases from Russia ("paid", to_rus).

    no-war purchases of product p in year t = [the country's imports of p from ALL suppliers in year t, in volume,
    corrected to no-war prices] x [its pre-war Russian share of p] (valued at no-war prices by the site, as now)

Steps (from the repository root):

  python3 -I research/2026-10/scripts/demand_cf_r48.py fetch   # downloads (untrusted data) into the scratchpad, writes
                                                               # small extracts to research/2026-10/raw/demand_cf_r48/
  python3 -I research/2026-10/scripts/demand_cf_r48.py run     # back-tests + application, writes
                                                               # research/2026-10/gaps/demand_cf_r48.json and
                                                               # <scratch>/site_patch_r48.json (for the site model run)

fetch: CEPII BACI HS92 (1995-2024 release, Etalab 2.0) through the OEC API (no key): every importer's imports from
all suppliers by HS2 (value) and for the fuel headings 2701, 2709, 2710, 2711 (value and tonnes); Russia's exports by
importer for the same fuel headings (value and tonnes); world trade by HS4 (value and tonnes, for unit-value price
indices). Eurostat: energy imports by partner (country of origin) for gas, crude oil, oil products and coal, annual
and monthly; gas supply (inland consumption, imports) monthly; heating degree days annual and monthly.

run: reads only committed raw files (research/2026-10/raw/oec_baci_r44, cf_models_r47, demand_cf_r48) and committed
gaps files; rule fixed in RULE below (written before the results); rolling origins 2005-2016, horizons H1-H5 (H5 at
8/12, the site's cumulative error), era-calibrated 90% bands, placebo coverage (war moved to 2014 and 2018).
"""

import gzip
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw" / "demand_cf_r48"
RAW44 = R / "raw" / "oec_baci_r44"
RAW47 = R / "raw" / "cf_models_r47"
GAPS = R / "gaps"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r48")
DL = SCRATCH / "dl"

OEC = "https://oec.world/api/olap-proxy/data.jsonrecords"
CUBE = "trade_i_baci_a_92"
ESTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
BACI_YEARS = list(range(2001, 2025))
FUEL_HS4 = (2701, 2709, 2710, 2711)
GROUP_HS4_QTY = {10, 31, 72, 73, 74, 75, 76, 27}  # chapters with world unit-value indices
GROUPS = ("fuel", "cereal", "fert", "metal", "other")


def group_of(hs2: int) -> str:
    return {27: "fuel", 10: "cereal", 31: "fert"}.get(hs2, "metal" if 72 <= hs2 <= 76 else "other")


# --------------------------------------------------------------------------------------------------------------------
# fetch
# --------------------------------------------------------------------------------------------------------------------


def get(url: str, tries: int = 4) -> bytes:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except Exception as e:  # network retry
            if i == tries - 1:
                raise
            print("retry", url[:140], e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise RuntimeError


def oec_cached(name: str, params: dict) -> dict:
    f = DL / f"{name}.json"
    if not f.exists():
        f.write_bytes(get(OEC + "?" + urllib.parse.urlencode(params)))
    return json.loads(f.read_text())


def iso_of(oec_id: str) -> str | None:
    s = str(oec_id)[-3:].upper()
    return s if s.isalpha() and len(s) == 3 else None


def jsonstat_rows(d: dict) -> list[tuple[dict, float]]:
    """Flatten a Eurostat JSON-stat 2.0 response into (labels by dimension, value) rows."""
    ids, sizes = d["id"], d["size"]
    cats = []
    for k in ids:
        idx = d["dimension"][k]["category"]["index"]
        inv = {v: c for c, v in idx.items()} if isinstance(idx, dict) else dict(enumerate(idx))
        cats.append(inv)
    out = []
    for pos, v in d["value"].items():
        p = int(pos)
        lab = {}
        for k, n, inv in zip(reversed(ids), reversed(sizes), reversed(cats)):
            lab[k] = inv[p % n]
            p //= n
        out.append((lab, float(v)))
    return out


def estat(name: str, dataset: str, params: list[tuple[str, str]]) -> list[tuple[dict, float]]:
    f = DL / f"estat_{name}.json"
    url = ESTAT + dataset + "?" + urllib.parse.urlencode([("format", "JSON"), ("lang", "en"), *params])
    if not f.exists():
        f.write_bytes(get(url))
    return jsonstat_rows(json.loads(f.read_text())), url


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    DL.mkdir(parents=True, exist_ok=True)
    today = time.strftime("%Y-%m-%d")
    meta = {
        "source": "CEPII BACI HS92 (HS6 REV. 1992, 1995-2024 release) via the OEC API, no key; licence Etalab 2.0",
        "url": OEC + "?cube=" + CUBE,
        "retrieved": today,
    }
    agg: dict[tuple, float] = {}
    fuel_imp, fuel_rus, world4 = [], [], []
    for y in BACI_YEARS:
        d = oec_cached(
            f"imp_hs2_{y}",
            {"cube": CUBE, "drilldowns": "Year,Importer Country,HS2", "measures": "Trade Value", "Year": y},
        )
        for r in d["data"]:
            iso = iso_of(r["Importer Country ID"])
            v = float(r["Trade Value"] or 0)
            if iso and v > 0:
                g = group_of(int(r["HS2 ID"]) % 100)
                agg[(y, iso, g)] = agg.get((y, iso, g), 0.0) + v
        hs4p = ",".join(str(50000 + h) for h in FUEL_HS4)
        d = oec_cached(
            f"imp_fuel_{y}",
            {
                "cube": CUBE,
                "drilldowns": "Year,Importer Country,HS4",
                "measures": "Trade Value,Quantity",
                "HS4": hs4p,
                "Year": y,
            },
        )
        for r in d["data"]:
            iso = iso_of(r["Importer Country ID"])
            if iso:
                fuel_imp.append(
                    [
                        y,
                        iso,
                        int(r["HS4 ID"]) % 10000,
                        round(float(r["Trade Value"] or 0)),
                        round(float(r["Quantity"] or 0), 1),
                    ]
                )
        d = oec_cached(
            f"rus_fuel_{y}",
            {
                "cube": CUBE,
                "drilldowns": "Year,Importer Country,HS4",
                "measures": "Trade Value,Quantity",
                "HS4": hs4p,
                "Exporter Country": "eurus",
                "Year": y,
            },
        )
        for r in d["data"]:
            iso = iso_of(r["Importer Country ID"])
            if iso:
                fuel_rus.append(
                    [
                        y,
                        iso,
                        int(r["HS4 ID"]) % 10000,
                        round(float(r["Trade Value"] or 0)),
                        round(float(r["Quantity"] or 0), 1),
                    ]
                )
        d = oec_cached(
            f"world_hs4_{y}", {"cube": CUBE, "drilldowns": "Year,HS4", "measures": "Trade Value,Quantity", "Year": y}
        )
        for r in d["data"]:
            h = int(r["HS4 ID"]) % 10000
            if h // 100 in GROUP_HS4_QTY:
                world4.append([y, h, round(float(r["Trade Value"] or 0)), round(float(r["Quantity"] or 0), 1)])
        print(y, len(agg), len(fuel_imp), len(fuel_rus), len(world4), file=sys.stderr)
    rows = [[y, iso, g, round(v)] for (y, iso, g), v in sorted(agg.items())]
    with gzip.open(RAW / "baci_imports_groups_all_suppliers_2001_2024.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "what": "imports from all suppliers (BACI reconciled, USD) by importer and product group: fuel HS27, "
                "cereal HS10, fert HS31, metal HS72-76, other (all other chapters)",
                "columns": ["year", "importer", "group", "usd"],
                "rows": rows,
            },
            fh,
        )
    with gzip.open(RAW / "baci_fuel_hs4_2001_2024.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "what": "HS 2701, 2709, 2710, 2711: imports from all suppliers (imports) and Russia's exports (rus) by importer; value USD and tonnes",
                "columns": ["year", "importer", "hs4", "usd", "tonnes"],
                "imports": fuel_imp,
                "rus": fuel_rus,
            },
            fh,
        )
    with gzip.open(RAW / "baci_world_hs4q_2001_2024.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "what": "world trade by HS4 (value USD, tonnes), chapters 10, 27, 31, 72-76",
                "columns": ["year", "hs4", "usd", "tonnes"],
                "rows": world4,
            },
            fh,
        )
    # Eurostat energy statistics (origin basis: energy imports by partner are by country of origin)
    eu = {}
    specs = {
        "gas_ti_a": ("nrg_ti_gas", [("siec", "G3000"), ("unit", "TJ_GCV"), ("partner", "TOTAL"), ("partner", "RU")]),
        "oil_ti_a": (
            "nrg_ti_oil",
            [
                ("siec", "O4100_TOT"),
                ("siec", "O4600"),
                ("siec", "O4000XBIO"),
                ("unit", "THS_T"),
                ("partner", "TOTAL"),
                ("partner", "RU"),
            ],
        ),
        "coal_ti_a": (
            "nrg_ti_sff",
            [("siec", "C0000X0350-0370"), ("unit", "THS_T"), ("partner", "TOTAL"), ("partner", "RU")],
        ),
        "gas_ti_m": (
            "nrg_ti_gasm",
            [
                ("siec", "G3000"),
                ("unit", "TJ_GCV"),
                ("partner", "TOTAL"),
                ("partner", "RU"),
                ("sinceTimePeriod", "2019-01"),
            ],
        ),
        "oil_ti_m": (
            "nrg_ti_oilm",
            [
                ("siec", "O4100_TOT"),
                ("unit", "THS_T"),
                ("partner", "TOTAL"),
                ("partner", "RU"),
                ("sinceTimePeriod", "2019-01"),
            ],
        ),
        "gas_cb_m": (
            "nrg_cb_gasm",
            [
                ("nrg_bal", "IC_OBS"),
                ("nrg_bal", "IMP"),
                ("unit", "TJ_GCV"),
                ("siec", "G3000"),
                ("sinceTimePeriod", "2010-01"),
            ],
        ),
        "gas_cb_a": ("nrg_cb_gas", [("nrg_bal", "IC_OBS"), ("nrg_bal", "IMP"), ("unit", "TJ_GCV"), ("siec", "G3000")]),
        "hdd_a": ("nrg_chdd_a", [("indic_nrg", "HDD"), ("unit", "NR")]),
        "hdd_m": ("nrg_chdd_m", [("indic_nrg", "HDD"), ("unit", "NR"), ("sinceTimePeriod", "2010-01")]),
    }
    for name, (ds, params) in specs.items():
        try:
            rows, url = estat(name, ds, params)
        except Exception as e:  # noqa: BLE001
            print("eurostat miss", name, e, file=sys.stderr)
            continue
        keep = []
        for lab, v in rows:
            key = [lab.get(k) for k in ("geo", "siec", "partner", "nrg_bal", "time")]
            keep.append([*key, v])
        eu[name] = {
            "dataset": ds,
            "url": url,
            "columns": ["geo", "siec", "partner", "nrg_bal", "time", "value"],
            "rows": keep,
        }
        print(name, len(keep), file=sys.stderr)
    with gzip.open(RAW / "eurostat_energy_2026-10-25.json.gz", "wt") as fh:
        json.dump({"source": "Eurostat energy statistics (API, JSON-stat)", "retrieved": today, "datasets": eu}, fh)


# --------------------------------------------------------------------------------------------------------------------
# run: the rule (fixed in this file before any result was computed, 2026-10-25; copied to the notes)
# --------------------------------------------------------------------------------------------------------------------

RULE = {
    "written": "2026-10-25, before any back-test result was computed",
    "unit": "product x size class. Products: crude (HS 2709), oil products (2710), gas (2711), coal (2701), cereals "
    "(HS 10), fertilisers (31), metals (72-76), other goods. Size class of the product flow from Russia: the 4-year "
    "average to the origin in EUR, S under 0.1bn, M 0.1-1bn, L over 1bn; flows under EUR 10 m left out. The rest of "
    "HS 27 (coke, bitumen, electricity...) is never a candidate: it stays held flat",
    "candidate": "D: the product's start level (origin year) x the importer's imports of the product from all "
    "suppliers in year t over the origin year (tonnes for the four fuel headings where the unit value is sane, "
    "else value deflated by the world unit-value index; other goods by value deflated by their world index) x the "
    "price correction (realised / expected crude price)^|elasticity| (central elasticity; expected = the IMF WEO "
    "October vintage of the origin year, no-change for the 2005-2007 origins, which have no vintage). D0 (no price "
    "correction) is a diagnostic only",
    "reference": "M0: the product's origin-year level held flat (real)",
    "error": "the site's cumulative error: log(sum w*actual / sum w*predicted) over H = 1..5 years, w = 1 except 8/12 "
    "for the fifth year; per origin, the mean over H1-H5 of the median absolute error",
    "accept_if_all": [
        (
            "accuracy: D's error is at least 15% lower than M0's at EVERY rolling origin 2005-2016 (12 origins, including "
            "the 2008 crash and the 2013/2014 Russia-shock origins), with at least 5 cases at each origin; a cell with "
            "fewer cases at any origin fails (not enough evidence)"
        ),
        (
            "band: D's era-calibrated 90% band for the five-year sum (H5; the to_rus_cf.json method: 5th-95th percentile "
            "x K, K the smallest factor for which two eras cover at least 90% of the third; eras 2005-09, 2010-12, "
            "2013-16) is not wider (in log width) than M0's"
        ),
        (
            "placebo: D's band (built only from origins whose windows end before the placebo window, with the cell's K) "
            "covers at least 90% of the placebo errors for the war moved to 2014 (origin 2013, H5, 2014-2018; training "
            "origins up to 2008) and to 2018 (origin 2017, H4, 2018-2021; training origins up to 2013); where a cell has "
            "fewer than 10 placebo cases, the product's cases pooled over size classes are used"
        ),
    ],
    "data_sets": "the four fuels are judged on Eurostat energy imports by country of origin (physical units, pipeline "
    "gas included) for the European reporters, and on CEPII BACI elsewhere; the other goods on BACI everywhere. A "
    "product passes for a country only on the data set that covers that country",
    "application": "a passing product replaces 'held flat' for that product inside the country's expected path; the "
    "others keep the current method. Small flows (country total under EUR 0.1bn a year) keep the current method in "
    "the proposal. The diagnostic variant applies D to every candidate product of every country",
    "multiple_testing": "8 products x 3 size classes x 2 data sets for fuels; a chance pass is possible; every cell "
    "is reported",
}

# elasticities of import demand to the price (magnitudes; demand = observed x (actual / no-war price)^e), fixed from
# the literature before the data estimate; the data estimate (2002-2021 BACI volumes, the 2008-09 and 2014-16 price
# shocks) is reported next to them as a check
ELASTICITY = {
    "gas": {"low": 0.10, "central": 0.20, "high": 0.30},
    "crude": {"low": 0.02, "central": 0.05, "high": 0.10},
    "products": {"low": 0.02, "central": 0.05, "high": 0.10},
    "coal": {"low": 0.05, "central": 0.10, "high": 0.20},
}
ELASTICITY_SOURCES = [
    (
        "Labandeira, Labeaga and Lopez-Otero (2017), A meta-analysis on the price elasticity of energy demand, Energy "
        "Policy 102: short-run natural gas -0.18, oil/fuels -0.07 to -0.13 (gasoline, diesel), long-run several times larger"
    ),
    (
        "Ruhnau, Stiewe, Muessel and Hirth (2023), Natural gas savings in Germany during the 2022 energy crisis, Nature "
        "Energy 8: weather- and activity-adjusted demand fell 11% (industry) and 6% (small consumers) in Aug-Dec 2022, "
        "the industry part largely a price response"
    ),
    (
        "McWilliams and Zachmann (Bruegel, 2022-2023), European natural gas demand tracker: EU demand Aug 2022-Mar 2023 "
        "about 17-19% below 2017-2021 (temperature-adjusted about 13-15%), above the 15% voluntary target (Council "
        "Regulation (EU) 2022/1369)"
    ),
    (
        "IEA Gas Market Report Q1-2023: EU natural gas demand -13% in 2022; Hamilton (2009) and Caldara, Cavallo and "
        "Iacoviello (2019, J. Monetary Economics): short-run oil demand elasticity about -0.05 to -0.15"
    ),
    (
        "IMF World Economic Outlook October 2022, chapter 1 annex (energy demand response): short-run gas and power "
        "elasticities -0.1 to -0.3 across EU economies"
    ),
]

ORIGINS = list(range(2005, 2017))
ERAS = {"2005-09": range(2005, 2010), "2010-12": range(2010, 2013), "2013-16": range(2013, 2017)}
PLACEBOS = {"war_2014": (2013, 5, 2008), "war_2018": (2017, 4, 2013)}  # origin, horizon, last training origin
W5 = (1.0, 1.0, 1.0, 1.0, 8 / 12)
EXCLUDE = {"UKR", "BLR", "RUS"}
MIN_EUR = 0.01e9
RULE_GAIN = 0.15
FUELS = ("crude", "products", "gas", "coal")
HS4_OF = {"crude": 2709, "products": 2710, "gas": 2711, "coal": 2701}
NONFUEL = ("cereal", "fert", "metal", "other")
PRODUCTS = (*FUELS, "fuel_rest", *NONFUEL)
CANDIDATES = (*FUELS, *NONFUEL)
SIZES = ("S", "M", "L")
EU_GEO = {
    "AT": "AUT", "BE": "BEL", "BG": "BGR", "CY": "CYP", "CZ": "CZE", "DE": "DEU", "DK": "DNK", "EE": "EST",
    "EL": "GRC", "ES": "ESP", "FI": "FIN", "FR": "FRA", "HR": "HRV", "HU": "HUN", "IE": "IRL", "IT": "ITA",
    "LT": "LTU", "LU": "LUX", "LV": "LVA", "MT": "MLT", "NL": "NLD", "PL": "POL", "PT": "PRT", "RO": "ROU",
    "SE": "SWE", "SI": "SVN", "SK": "SVK", "UK": "GBR", "NO": "NOR", "RS": "SRB", "MK": "MKD", "BA": "BIH",
    "AL": "ALB", "ME": "MNE", "MD": "MDA", "TR": "TUR", "GE": "GEO", "XK": "XKX", "IS": "ISL", "CH": "CHE",
}  # fmt: skip
EU27 = {
    "AUT", "BEL", "BGR", "CYP", "CZE", "DEU", "DNK", "EST", "GRC", "ESP", "FIN", "FRA", "HRV", "HUN", "IRL", "ITA",
    "LTU", "LUX", "LVA", "MLT", "NLD", "POL", "PRT", "ROU", "SWE", "SVN", "SVK",
}  # fmt: skip


def q(a, p):
    return float(np.quantile(np.array(a), p)) if len(a) else float("nan")


def fisher_chain(by: dict[int, dict[int, tuple[float, float]]], years: list[int]) -> dict[int, float]:
    """Fisher chained unit-value index over HS4 headings (value, tonnes); pairs moving more than x4 dropped."""
    idx = {years[0]: 1.0}
    for y in years[1:]:
        a, b = by.get(y - 1, {}), by.get(y, {})
        nl = dl = np_ = dp = 0.0
        for k in set(a) & set(b):
            if min(a[k][1], b[k][1]) <= 0:
                continue
            p0, p1 = a[k][0] / a[k][1], b[k][0] / b[k][1]
            if not 0.25 <= p1 / p0 <= 4:
                continue
            nl += p1 * a[k][1]
            dl += a[k][0]
            np_ += b[k][0]
            dp += p0 * b[k][1]
        idx[y] = idx[y - 1] * math.sqrt((nl / dl) * (np_ / dp)) if dl and dp else idx[y - 1]
    return idx


def load_baci():
    years = list(range(2001, 2025))
    with gzip.open(RAW44 / "rus_exports_partner_hs2_2001_2021.json.gz", "rt") as fh:
        d = json.load(fh)
    rus_g: dict = {}
    for y, iso, hs2, v in d["rows"]:
        g = rus_g.setdefault(iso, {}).setdefault(y, dict.fromkeys(GROUPS, 0.0))
        g[group_of(hs2)] += v
    with gzip.open(RAW / "baci_imports_groups_all_suppliers_2001_2024.json.gz", "rt") as fh:
        d = json.load(fh)
    imp_g: dict = {}
    for y, iso, g, v in d["rows"]:
        imp_g.setdefault(iso, {}).setdefault(y, dict.fromkeys(GROUPS, 0.0))[g] += v
    with gzip.open(RAW / "baci_fuel_hs4_2001_2024.json.gz", "rt") as fh:
        d = json.load(fh)
    imp_f: dict = {}
    rus_f: dict = {}
    for tgt, rows in ((imp_f, d["imports"]), (rus_f, d["rus"])):
        for y, iso, h, v, t in rows:
            tgt.setdefault(iso, {}).setdefault(y, {})[h] = (float(v), float(t))
    with gzip.open(RAW / "baci_world_hs4q_2001_2024.json.gz", "rt") as fh:
        d = json.load(fh)
    w4: dict = {}
    for y, h, v, t in d["rows"]:
        if v > 0 and t > 0:
            w4.setdefault(y, {})[h] = (float(v), float(t))
    price: dict[str, dict[int, float]] = {}
    for p, h in HS4_OF.items():
        price[p] = fisher_chain({y: {h: w4[y][h]} for y in years if h in w4.get(y, {})}, years)
    sel = {
        "fuel_rest": lambda h: h // 100 == 27 and h not in HS4_OF.values(),
        "cereal": lambda h: h // 100 == 10,
        "fert": lambda h: h // 100 == 31,
        "metal": lambda h: 72 <= h // 100 <= 76,
    }
    for p, f in sel.items():
        price[p] = fisher_chain({y: {h: x for h, x in w4.get(y, {}).items() if f(h)} for y in years}, years)
    fred = json.loads((RAW44 / "fred.json").read_text())["series"]
    other = {}
    for y in years:
        vals = [v for k, v in fred["IREXFUELS"].items() if k.startswith(f"{y}-")]
        if vals:
            other[y] = sum(vals) / len(vals)
    price["other"] = {y: v / other[2001] for y, v in other.items()}
    usd_per_eur = {int(k[:4]): v for k, v in fred["AEXUSEU"].items()}
    usd_per_eur.setdefault(2025, usd_per_eur[max(usd_per_eur)])
    # world unit value (USD per tonne) by fuel heading and year, for the tonnes sanity check
    wuv = {p: {y: w4[y][h][0] / w4[y][h][1] for y in years if h in w4.get(y, {})} for p, h in HS4_OF.items()}
    return rus_g, rus_f, imp_g, imp_f, price, usd_per_eur, wuv


def nominal(iso: str, y: int, p: str, g_src: dict, f_src: dict) -> float:
    """Nominal USD of product p (one importer, one year) from a group table and a fuel-heading table."""
    gy = g_src.get(iso, {}).get(y)
    fy = f_src.get(iso, {}).get(y, {})
    if p in HS4_OF:
        return fy.get(HS4_OF[p], (0.0, 0.0))[0]
    if p == "fuel_rest":
        if not gy:
            return 0.0
        return max(0.0, gy["fuel"] - sum(fy.get(h, (0.0, 0.0))[0] for h in HS4_OF.values()))
    return gy[p] if gy else 0.0


class Baci:
    def __init__(self) -> None:
        self.rus_g, self.rus_f, self.imp_g, self.imp_f, self.price, self.eur, self.wuv = load_baci()

    def rus(self, iso, y, p):
        return nominal(iso, y, p, self.rus_g, self.rus_f)

    def imp(self, iso, y, p):
        return nominal(iso, y, p, self.imp_g, self.imp_f)

    def sane_tonnes(self, iso, y, p) -> float | None:
        if p not in HS4_OF:
            return None
        v, t = self.imp_f.get(iso, {}).get(y, {}).get(HS4_OF[p], (0.0, 0.0))
        w = self.wuv[p].get(y)
        if t <= 0 or v <= 0 or not w:
            return None
        return t if 1 / 3 <= (v / t) / w <= 3 else None

    def volume_ratio(self, iso, p, o, t) -> float | None:
        """The importer's imports of p from all suppliers in t over o, in volume (tonnes when sane in both years,
        else value deflated by the world unit-value index)."""
        a, b = self.sane_tonnes(iso, o, p), self.sane_tonnes(iso, t, p)
        if a and b:
            return b / a
        vo, vt = self.imp(iso, o, p), self.imp(iso, t, p)
        if vo <= 0 or vt < 0 or t not in self.price[p] or o not in self.price[p]:
            return None
        return (vt / self.price[p][t]) / (vo / self.price[p][o])


def oil_paths():
    """Realised APSP crude (latest pre-war vintage, 2021-10) and the expected path at each origin (October WEO
    vintage of the origin year; April 2011 for the missing 2011-10; no-change before 2008, no vintage)."""
    weo = json.loads((RAW44 / "weo_vintages.json").read_text())["vintages"]
    real = {int(k): v for k, v in weo["2021-10"]["001.POILAPSP.us_dollars"].items()}
    exp = {}
    for o in range(2002, 2018):
        v = next((x for x in (f"{o}-10", f"{o}-04") if x in weo and weo[x].get("001.POILAPSP.us_dollars")), None)
        path, last = {}, real[o]
        oil = weo[v]["001.POILAPSP.us_dollars"] if v else {}
        for t in range(o + 1, o + 6):
            last = oil.get(str(t), last) if v else real[o]
            path[t] = last
        exp[o] = {"vintage": v or "none (no-change)", "path": path}
    return real, exp


def price_corr(p: str, o: int, t: int, oil_real, oil_exp, band: str = "central") -> float:
    if p not in ELASTICITY:
        return 1.0
    return (oil_real[t] / oil_exp[o]["path"][t]) ** ELASTICITY[p][band]


def cum_err(actual: dict[int, float], pred: dict[int, float], o: int, last: int = 2021) -> dict[str, float]:
    out = {}
    for H in range(1, 6):
        ts = [o + h for h in range(1, H + 1)]
        if ts[-1] > last or any(t not in pred or t not in actual for t in ts):
            break
        ws = [W5[h - 1] if H == 5 else 1.0 for h in range(1, H + 1)]
        a = sum(w * actual[t] for t, w in zip(ts, ws))
        b = sum(w * pred[t] for t, w in zip(ts, ws))
        if a <= 0 or b <= 0:
            break
        out[f"H{H}"] = math.log(a / b)
    return out


def size_of(avg_eur: float) -> str:
    return "S" if avg_eur < 0.1e9 else "M" if avg_eur < 1e9 else "L"


# --------------------------------------------------------------------------------------------------------------------
# back-test cases
# --------------------------------------------------------------------------------------------------------------------


def baci_product_cases(B: Baci, oil_real, oil_exp) -> list[dict]:
    """One case per importer, product and origin (2005-2017): errors of M0 (held flat), D and D0."""
    cases = []
    for iso in B.rus_g:
        if iso in EXCLUDE:
            continue
        for o in range(2005, 2018):
            win = [o - 3, o - 2, o - 1, o]
            for p in PRODUCTS:
                vals = [B.rus(iso, y, p) for y in win]
                if min(vals) <= 0 or B.imp(iso, o, p) <= 0:
                    continue
                avg = sum(v / B.eur[y] for v, y in zip(vals, win)) / 4
                if avg < MIN_EUR:
                    continue
                P = B.price[p]
                actual = {t: B.rus(iso, t, p) / P[t] * P[o] for t in range(o + 1, min(o + 5, 2021) + 1)}
                pred: dict[str, dict[int, float]] = {"M0": {}, "D": {}, "D0": {}}
                for t in actual:
                    vr = B.volume_ratio(iso, p, o, t)
                    if vr is None:
                        break
                    pred["M0"][t] = vals[-1]
                    pred["D0"][t] = vals[-1] * vr
                    pred["D"][t] = vals[-1] * vr * price_corr(p, o, t, oil_real, oil_exp)
                errs = {m: cum_err(actual, pred[m], o) for m in pred}
                if errs["M0"]:
                    cases.append({"iso": iso, "o": o, "p": p, "size": size_of(avg), "avg_eur": avg, "errs": errs})
    return cases


def baci_country_cases(B: Baci, oil_real, oil_exp) -> list[dict]:
    """One case per importer and origin: the total, real at origin prices, and each product's weight and D ratio, so
    the composite can be evaluated for any set of accepted products after the rule."""
    cases = []
    for iso in B.rus_g:
        if iso in EXCLUDE:
            continue
        for o in range(2005, 2018):
            win = [o - 3, o - 2, o - 1, o]
            tot = {y: sum(B.rus(iso, y, p) for p in PRODUCTS) for y in range(o - 3, min(o + 5, 2021) + 1)}
            if min(tot[y] for y in win) <= 0:
                continue
            avg = sum(tot[y] / B.eur[y] for y in win) / 4
            if avg < MIN_EUR:
                continue
            size = size_of(avg)
            real = {
                y: sum(B.rus(iso, y, p) * B.price[p][o] / B.price[p][y] for p in PRODUCTS)
                for y in range(o - 2, min(o + 5, 2021) + 1)
            }
            start = float(np.median([real[y] for y in (o - 2, o - 1, o)])) if size == "S" else real[o]
            prods = {}
            for p in PRODUCTS:
                vo = B.rus(iso, o, p)
                if vo <= 0:
                    continue
                pavg = sum(B.rus(iso, y, p) / B.eur[y] for y in win) / 4
                ratios = {}
                for t in range(o + 1, min(o + 5, 2021) + 1):
                    vr = B.volume_ratio(iso, p, o, t) if B.imp(iso, o, p) > 0 else None
                    if vr is None:
                        break
                    ratios[t] = vr * price_corr(p, o, t, oil_real, oil_exp)
                prods[p] = {"w": vo / tot[o], "size": size_of(pavg) if pavg >= MIN_EUR else None, "r": ratios}
            actual = {t: real[t] for t in range(o + 1, min(o + 5, 2021) + 1)}
            cases.append({"iso": iso, "o": o, "size": size, "start": start, "actual": actual, "prods": prods})
    return cases


def composite_errors(c: dict, active) -> dict[str, float]:
    """Errors of start x sum_p w_p x ratio_p (ratio 1 for products not active(p, size_p) or without data)."""
    pred = {}
    for t in c["actual"]:
        m = 0.0
        for p, d in c["prods"].items():
            r = d["r"].get(t) if (d["size"] and active(p, d["size"], c["iso"])) else None
            m += d["w"] * (r if r is not None else 1.0)
        m += 1.0 - sum(d["w"] for d in c["prods"].values())
        pred[t] = c["start"] * m
    return cum_err(c["actual"], pred, c["o"])


def load_eurostat() -> dict:
    with gzip.open(RAW / "eurostat_energy_2026-10-25.json.gz", "rt") as fh:
        return json.load(fh)["datasets"]


def eurostat_annual(es: dict) -> dict:
    """{iso3: {product: {"RU"|"TOTAL": {year: volume}}}} from the annual energy imports by country of origin; oil
    products = all oil (O4000XBIO) minus crude (O4100_TOT)."""
    out: dict = {}
    for name, siec_map in (
        ("gas_ti_a", {"G3000": "gas"}),
        ("oil_ti_a", {"O4100_TOT": "crude", "O4000XBIO": "_oil_all"}),
        ("coal_ti_a", {"C0000X0350-0370": "coal"}),
    ):
        for geo, siec, partner, _, tm, v in es[name]["rows"]:
            iso = EU_GEO.get(geo)
            if not iso or siec not in siec_map or v is None:
                continue
            out.setdefault(iso, {}).setdefault(siec_map[siec], {}).setdefault(partner, {})[int(tm)] = v
    for iso, d in out.items():
        if "_oil_all" in d and "crude" in d:
            d["products"] = {
                pt: {y: max(0.0, v - d["crude"].get(pt, {}).get(y, 0.0)) for y, v in s.items()}
                for pt, s in d["_oil_all"].items()
            }
        d.pop("_oil_all", None)
    return out


def eurostat_cases(ea: dict, B: Baci, oil_real, oil_exp, gic: dict | None = None) -> list[dict]:
    """Eurostat volumes by origin: Russia's volume held flat (M0) against Russia's pre-war share of the country's
    imports from all origins x those imports (D, D0). Size class: the country's total purchases from Russia (BACI).
    Gas also gets Dic (diagnostic, added after the first run): the share of inland consumption instead of imports,
    since a transit country's imports are not its demand."""
    cases = []
    gic = gic or {}
    for iso, prods in ea.items():
        for p, d in prods.items():
            ru, tot = d.get("RU", {}), d.get("TOTAL", {})
            for o in range(2005, 2018):
                win = [o - 3, o - 2, o - 1, o]
                if any(ru.get(y, 0) <= 0 for y in win) or tot.get(o, 0) <= 0:
                    continue
                tw = [sum(B.rus(iso, y, x) for x in PRODUCTS) / B.eur[y] for y in win]
                size = size_of(sum(tw) / 4)
                actual = {t: ru[t] for t in range(o + 1, min(o + 5, 2021) + 1) if t in ru}
                pred: dict[str, dict[int, float]] = {"M0": {}, "D": {}, "D0": {}}
                for t in actual:
                    if tot.get(t) is None:
                        break
                    pred["M0"][t] = ru[o]
                    pred["D0"][t] = ru[o] / tot[o] * tot[t]
                    pred["D"][t] = pred["D0"][t] * price_corr(p, o, t, oil_real, oil_exp)
                    ic = gic.get(iso, {})
                    if p == "gas" and ic.get(o) and ic.get(t):
                        pred.setdefault("Dic", {})[t] = ru[o] / ic[o] * ic[t] * price_corr(p, o, t, oil_real, oil_exp)
                errs = {m: cum_err(actual, pred[m], o) for m in pred}
                if errs["M0"]:
                    cases.append({"iso": iso, "o": o, "p": p, "size": size, "errs": errs, "share_o": ru[o] / tot[o]})
    return cases


# --------------------------------------------------------------------------------------------------------------------
# evaluation
# --------------------------------------------------------------------------------------------------------------------


def calibrate(by_origin: dict[int, list[float]]):
    eras = {k: [e for o in r for e in by_origin.get(o, [])] for k, r in ERAS.items()}
    K, cov = 3.0, {}
    for k100 in range(50, 301):
        K = k100 / 100
        cov = {}
        for k, test in eras.items():
            train = [e for k2, v in eras.items() if k2 != k for e in v]
            if not test or len(train) < 5:
                continue
            lo, hi = K * q(train, 0.05), K * q(train, 0.95)
            cov[k] = sum(lo <= e <= hi for e in test) / len(test)
        if all(v >= 0.9 for v in cov.values()):
            break
    allv = [e for v in eras.values() for e in v]
    return {
        "K": K,
        "era_coverage": {k: round(v, 3) for k, v in cov.items()},
        "lo": K * q(allv, 0.05),
        "hi": K * q(allv, 0.95),
        "n": len(allv),
    }


def acc_by_origin(rows: list[dict], models=("M0", "D", "D0"), key=lambda r: r["errs"]) -> dict:
    out = {}
    for o in sorted({r["o"] for r in rows}):
        rs = [r for r in rows if r["o"] == o]
        cell = {"n": len(rs)}
        for m in models:
            per_h = {}
            for H in range(1, 6):
                es = [key(r)[m][f"H{H}"] for r in rs if f"H{H}" in key(r).get(m, {})]
                if es:
                    per_h[f"H{H}"] = {
                        "mae": round(float(np.median(np.abs(es))), 4),
                        "bias": round(float(np.median(es)), 4),
                        "p05": round(q(es, 0.05), 4),
                        "p95": round(q(es, 0.95), 4),
                        "n": len(es),
                    }
            if per_h:
                cell[m] = {"err": round(float(np.mean([v["mae"] for v in per_h.values()])), 4), "by_H": per_h}
        for m in models:
            if m != "M0" and m in cell and "M0" in cell and cell["M0"]["err"] > 0:
                cell[m]["gain"] = round(1 - cell[m]["err"] / cell["M0"]["err"], 4)
        out[o] = cell
    return out


def band_of(rows: list[dict], m: str, H: int, key=lambda r: r["errs"], max_origin: int = 2016) -> dict:
    by_o: dict[int, list[float]] = {}
    for r in rows:
        if r["o"] <= max_origin and f"H{H}" in key(r).get(m, {}):
            by_o.setdefault(r["o"], []).append(key(r)[m][f"H{H}"])
    if sum(len(v) for v in by_o.values()) < 10:
        return {"n": sum(len(v) for v in by_o.values())}
    cal = calibrate(by_o)
    return {
        "K": cal["K"],
        "era_coverage": cal["era_coverage"],
        "n": cal["n"],
        "band": [round(math.exp(cal["lo"]), 3), round(math.exp(cal["hi"]), 3)],
        "log_lo": cal["lo"],
        "log_hi": cal["hi"],
        "log_width": round(cal["hi"] - cal["lo"], 4),
    }


def placebo_cov(rows: list[dict], m: str, K: float, key=lambda r: r["errs"]) -> dict:
    out = {}
    for name, (o, H, last) in PLACEBOS.items():
        train = [key(r)[m][f"H{H}"] for r in rows if r["o"] <= last and f"H{H}" in key(r).get(m, {})]
        test = [key(r)[m][f"H{H}"] for r in rows if r["o"] == o and f"H{H}" in key(r).get(m, {})]
        if len(train) < 10 or not test:
            out[name] = {"n": len(test), "coverage": None}
            continue
        lo, hi = K * q(train, 0.05), K * q(train, 0.95)
        out[name] = {
            "n": len(test),
            "coverage": round(sum(lo <= e <= hi for e in test) / len(test), 3),
            "band": [round(math.exp(lo), 3), round(math.exp(hi), 3)],
        }
    return out


def judge(rows: list[dict], pooled: list[dict], model: str = "D") -> dict:
    """The rule for one cell (product x size class); pooled = the product's cases over all sizes (placebo fallback)."""
    acc = acc_by_origin([r for r in rows if r["o"] <= 2016], ("M0", model))
    gains = {o: acc.get(o, {}).get(model, {}).get("gain") for o in ORIGINS}
    ns = {o: acc.get(o, {}).get("n", 0) for o in ORIGINS}
    ok_acc = all(ns[o] >= 5 and gains[o] is not None and gains[o] >= RULE_GAIN for o in ORIGINS)
    b0, bd = band_of(rows, "M0", 5), band_of(rows, model, 5)
    ok_band = "log_width" in b0 and "log_width" in bd and bd["log_width"] <= b0["log_width"]
    K = bd.get("K", 1.0)
    plc = placebo_cov(rows, model, K)
    plc_src = "cell"
    if any((v["n"] or 0) < 10 for v in plc.values()):
        plc = placebo_cov(pooled, model, K)
        plc_src = "product pooled over sizes"
    ok_plc = all(v["coverage"] is not None and v["coverage"] >= 0.9 for v in plc.values())
    reasons = []
    if not ok_acc:
        lt5 = [o for o in ORIGINS if ns[o] < 5]
        bad = [o for o in ORIGINS if ns[o] >= 5 and (gains[o] is None or gains[o] < RULE_GAIN)]
        reasons.append(
            ("fewer than 5 cases at " + ",".join(map(str, lt5)) + "; " if lt5 else "")
            + (f"gain under 15% at {len(bad)} of 12 origins" if bad else "")
        )
    if not ok_band:
        reasons.append("band wider" if "log_width" in bd else "too few cases for a band")
    if not ok_plc:
        reasons.append("placebo coverage under 90%")
    valid = [g for o, g in gains.items() if g is not None and ns[o] >= 5]
    return {
        "n_cases": len(rows),
        "n_by_origin": {str(o): ns[o] for o in ORIGINS},
        "gain_by_origin": {str(o): gains[o] for o in ORIGINS},
        "origins_ge_15pct": sum(1 for g in valid if g >= RULE_GAIN),
        "worst_gain": round(min(valid), 3) if valid else None,
        "median_gain": round(float(np.median(valid)), 3) if valid else None,
        "band_H5_M0": {k: b0.get(k) for k in ("band", "K", "n", "log_width")},
        "band_H5_model": {k: bd.get(k) for k in ("band", "K", "n", "log_width")},
        "band_width_ratio_log": round(bd["log_width"] / b0["log_width"], 3)
        if ok_band or ("log_width" in bd and "log_width" in b0)
        else None,
        "placebo": plc,
        "placebo_basis": plc_src,
        "pass_accuracy": ok_acc,
        "pass_band": ok_band,
        "pass_placebo": ok_plc,
        "PASS": ok_acc and ok_band and ok_plc,
        "why_not": "; ".join(r for r in reasons if r) or None,
    }


# --------------------------------------------------------------------------------------------------------------------
# elasticity check on pre-war data, weather and the EU gas policy shortfall
# --------------------------------------------------------------------------------------------------------------------


def weo_gdp() -> dict[str, dict[int, float]]:
    with gzip.open(RAW47 / "weo_country_vintages.json.gz", "rt") as fh:
        v = json.load(fh)["vintages"]["2021-10"]["NGDP_RPCH"]
    return {iso: {int(y): g for y, g in s.items()} for iso, s in v.items()}


def ols(X: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """OLS with one trimming pass (the 5% largest absolute residuals dropped) and heteroskedasticity-robust (HC1)
    standard errors."""
    b = np.linalg.lstsq(X, y, rcond=None)[0]
    r = np.abs(y - X @ b)
    k = r <= np.quantile(r, 0.95)
    X, y = X[k], y[k]
    b = np.linalg.lstsq(X, y, rcond=None)[0]
    e = y - X @ b
    XtXi = np.linalg.inv(X.T @ X)
    V = XtXi @ (X.T * e**2) @ X @ XtXi * len(y) / (len(y) - X.shape[1])
    return b, np.sqrt(np.diag(V))


def gic_series(es: dict) -> dict:
    gic: dict = {}
    for geo, _, _, bal, tm, v in es["gas_cb_a"]["rows"]:
        iso = EU_GEO.get(geo) or ("EU27" if geo == "EU27_2020" else None)
        if iso and bal == "IC_OBS" and v:
            gic.setdefault(iso, {})[int(tm)] = v
    return gic


def elasticity_check(B: Baci, gic_all: dict, hdd: dict) -> dict:
    """Short-run (annual) price elasticity of import volumes, 2002-2021: dlog tonnes of imports from all suppliers
    on dlog world unit value of the heading and dlog real GDP (WEO October 2021), pooled over importers with at least
    USD 100 m of the heading; the same on the shock years only (2008-09 and 2014-16). For European gas also the gross
    inland consumption (Eurostat) with heating degree days. A check against the literature values, not the inputs."""
    gdp = weo_gdp()
    out = {}
    shock = {2008, 2009, 2014, 2015, 2016}
    for p in FUELS:
        rows = {"all": [], "shock_years": []}
        for iso in B.imp_f:
            for y in range(2002, 2022):
                a, b = B.sane_tonnes(iso, y - 1, p), B.sane_tonnes(iso, y, p)
                g = gdp.get(iso, {}).get(y)
                if not a or not b or g is None or B.imp(iso, y - 1, p) < 1e8:
                    continue
                pr = math.log(B.wuv[p][y] / B.wuv[p][y - 1])
                row = [1.0, pr, math.log(1 + g / 100), math.log(b / a)]
                rows["all"].append(row)
                if y in shock:
                    rows["shock_years"].append(row)
        res = {}
        for k, rr in rows.items():
            if len(rr) < 30:
                continue
            M = np.array(rr)
            bb, se = ols(M[:, :3], M[:, 3])
            res[k] = {
                "price": round(float(bb[1]), 3),
                "se": round(float(se[1]), 3),
                "gdp": round(float(bb[2]), 3),
                "n": len(rr),
            }
        out[p] = {"BACI_imports_tonnes": res, "literature_range_used": ELASTICITY[p]}
    # European gas: gross inland consumption on the world LNG/gas unit value, HDD and GDP
    rr = []
    for iso, gic in gic_all.items():
        if iso == "EU27":
            continue
        for y in range(2002, 2022):
            if (
                gic.get(y, 0) <= 0
                or gic.get(y - 1, 0) <= 0
                or iso not in hdd
                or y not in hdd[iso]
                or y - 1 not in hdd[iso]
            ):
                continue
            g = gdp.get(iso, {}).get(y)
            if g is None:
                continue
            rr.append(
                [
                    1.0,
                    math.log(B.wuv["gas"][y] / B.wuv["gas"][y - 1]),
                    math.log(hdd[iso][y] / hdd[iso][y - 1]),
                    math.log(1 + g / 100),
                    math.log(gic[y] / gic[y - 1]),
                ]
            )
    if len(rr) > 30:
        M = np.array(rr)
        bb, se = ols(M[:, :4], M[:, 4])
        out["gas"]["Eurostat_inland_consumption"] = {
            "price": round(float(bb[1]), 3),
            "se": round(float(se[1]), 3),
            "hdd": round(float(bb[2]), 3),
            "gdp": round(float(bb[3]), 3),
            "n": len(rr),
            "note": "price = world gas unit value (BACI HS 2711): oil-indexed contracts until about 2015, so a "
            "noisy proxy of what users paid",
        }
    return out


def hdd_series(es: dict) -> tuple[dict, dict]:
    ann, mon = {}, {}
    for geo, _, _, _, tm, v in es["hdd_a"]["rows"]:
        iso = EU_GEO.get(geo) or ("EU27" if geo == "EU27_2020" else None)
        if iso and v:
            ann.setdefault(iso, {})[int(tm)] = v
    for geo, _, _, _, tm, v in es["hdd_m"]["rows"]:
        iso = EU_GEO.get(geo) or ("EU27" if geo == "EU27_2020" else None)
        if iso and v is not None:
            mon.setdefault(iso, {})[tm] = v
    return ann, mon


def gas_policy_shortfall(es: dict, hdd: dict, nwi: dict) -> dict:
    """Gas demand that disappeared in 2022-2025 beyond weather, the pre-war trend and the price (central
    elasticity): log(actual gross inland consumption) - log(expected), expected from a 2010-2021 fit of log GIC on
    log HDD and a linear trend, per country and for the EU; the price part is -e x log(TTF actual / no-war). What
    remains (negative = a further cut) is the 'policy shortfall' (EU saving target, fuel switching, demand destroyed
    for good). Weather is used here only: the no-war world had the same winters, so the observed volumes are NOT
    corrected to normal weather (that would count a mild winter as war)."""
    out = {}
    for iso, s in gic_series(es).items():
        h = hdd.get(iso)
        yrs = [y for y in range(2010, 2022) if s.get(y) and h and h.get(y)]
        if len(yrs) < 10 or not all(s.get(y) and h.get(y) for y in range(2022, 2025)):
            continue
        X = np.array([[1.0, math.log(h[y]), y - 2015] for y in yrs])
        yv = np.array([math.log(s[y]) for y in yrs])
        b = np.linalg.lstsq(X, yv, rcond=None)[0]
        res = {}
        for y in range(2022, 2026):
            if not s.get(y) or not h.get(y):
                continue
            r = math.log(s[y]) - float(np.array([1.0, math.log(h[y]), y - 2015]) @ b)
            if abs(r) > 0.7:  # an incomplete year in the extract (Hungary and Slovakia 2025): left out
                continue
            ratio = nwi["ttf"][str(y)]["actual"] / nwi["ttf"][str(y)]["central"]
            price = -ELASTICITY["gas"]["central"] * math.log(ratio)
            res[str(y)] = {
                "beyond_weather_trend": round(r, 4),
                "price_part": round(price, 4),
                "policy_shortfall": round(r - price, 4),
            }
        out[iso] = {"hdd_coef": round(float(b[1]), 3), "trend": round(float(b[2]), 4), "years": res}
    return out


# --------------------------------------------------------------------------------------------------------------------
# application to 2022-2026
# --------------------------------------------------------------------------------------------------------------------

YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
# the re-export hubs and Belarus (counterfactual-notes.md, section 3): their imports from all suppliers were reshaped by
# goods passing to Russia, so observed demand is itself a war outcome; they keep the current method in both variants.
# Hong Kong too: a gold transit hub (build_data.py TRANSIT_HUBS), its imports of gold from all suppliers are not demand
HUBS = {"ARM", "GEO", "KAZ", "KGZ", "UZB", "TUR", "AZE", "MNG", "TJK", "SRB", "ARE", "BLR", "HKG"}
# a product whose imports from all suppliers moved by more than x3 either way in a year against 2021 is a data break
# (unit change, missing reporter, BACI's 2024 coverage) or a war-shaped flow, not no-war demand: kept flat
RATIO_GUARD = (1 / 3, 3.0)
FRAC = [1, 1, 1, 1, 1, 8 / 12]
GAS_EUROPE = set(EU_GEO.values())
NW_BENCH = {
    "crude": "brent",
    "products": "diesel_gasoil_products",
    "coal": "newcastle",
    "fuel_rest": "diesel_gasoil_products",
}
NONFUEL_MAP = {"fertiliser": "fert", "wheat": "cereal", "maize": "cereal", "iron_steel": "metal",
               "aluminium": "metal", "copper": "metal", "nickel": "metal"}  # fmt: skip


def product_weights(iso: str, prices: dict, e2: dict, B: Baci) -> tuple[float, dict[str, float], str]:
    """Pre-war mix of purchases from Russia: fuel share and the weights of each product within fuel and within
    other goods (the site's prices.json mix_2018_2021, else energy2.json's fuel mix and BACI 2019-2021)."""
    mx = (prices.get(iso) or {}).get("mix_2018_2021")
    w: dict[str, float] = {}
    if mx and mx.get("non_fuel_goods") is not None:
        fs = 1 - mx["non_fuel_goods"]
        f = {"crude": mx.get("crude", 0), "products": mx.get("products", 0),
             "gas": mx.get("pipeline_gas", 0) + mx.get("lng", 0), "coal": mx.get("coal", 0),
             "fuel_rest": mx.get("other_fossil", 0)}  # fmt: skip
        nd = mx.get("non_fuel_detail") or {}
        n = dict.fromkeys(NONFUEL, 0.0)
        for k, v in nd.items():
            n[NONFUEL_MAP.get(k, "other")] += v
        src = "prices.json mix_2018_2021"
    else:
        m = e2.get(iso)
        if m:
            fs = m["fossil_share"]
            f = {k: m.get(k, 0) for k in ("crude", "products", "gas", "coal")}
            f["fuel_rest"] = m.get("other_fossil", 0)
            src = "energy2.json fuel mix; BACI 2019-2021 for other goods"
        else:
            tot = {p: sum(B.rus(iso, y, p) for y in (2019, 2020, 2021)) for p in PRODUCTS}
            s = sum(tot.values())
            if not s:
                return 0.0, {}, "no data"
            fs = sum(tot[p] for p in (*FUELS, "fuel_rest")) / s
            f = {p: tot[p] for p in (*FUELS, "fuel_rest")}
            src = "BACI 2019-2021"
        n = {p: sum(B.rus(iso, y, p) for y in (2019, 2020, 2021)) for p in NONFUEL}
    sf, sn = sum(f.values()), sum(n.values())
    for p, v in f.items():
        w[p] = fs * v / sf if sf else 0.0
    for p, v in n.items():
        w[p] = (1 - fs) * v / sn if sn else 0.0
    if not sf:
        fs = 0.0
    if not sn and sf:
        fs = 1.0
    return fs, w, src


def eurostat_monthly(es: dict) -> dict:
    out: dict = {}
    for name, p in (("gas_ti_m", "gas"), ("oil_ti_m", "crude")):
        for geo, _, partner, _, tm, v in es[name]["rows"]:
            iso = EU_GEO.get(geo)
            if iso and partner == "TOTAL" and v is not None:
                out.setdefault(iso, {}).setdefault(p, {})[tm] = v
    return out


def gic_monthly(es: dict) -> dict:
    out: dict = {}
    for geo, _, _, bal, tm, v in es["gas_cb_m"]["rows"]:
        iso = EU_GEO.get(geo)
        if iso and bal == "IC_OBS" and v is not None:
            out.setdefault(iso, {})[tm] = v
    return out


def chain_months(base_ratio: float, mm: dict, y: int, ref: int) -> tuple[float | None, int]:
    months = [f"{y}-{m:02d}" for m in range(1, 13) if f"{y}-{m:02d}" in mm and f"{ref}-{m:02d}" in mm]
    den = sum(mm[f"{ref}-{k[5:]}"] for k in months)
    if len(months) < 6 or den <= 0:
        return None, 0
    return base_ratio * sum(mm[k] for k in months) / den, len(months)


def demand_ratios(
    iso: str, B: Baci, ea: dict, em: dict, gic: dict | None = None, gicm: dict | None = None
) -> dict[str, dict]:
    """Imports of each product from all suppliers in 2022-2026 over 2021, in volume, and where they come from. European
    gas: inland consumption (Eurostat), because 2022-2023 imports include storage refilling and re-routed transit
    (Austria's gas imports x2.6 in 2022), which are not demand."""
    out = {}
    ic, icm = (gic or {}).get(iso, {}), (gicm or {}).get(iso, {})
    for p in PRODUCTS:
        r, src = {}, None
        if p == "gas" and ic.get(2021) and all(ic.get(y) for y in (2022, 2023, 2024)):
            for y in (2022, 2023, 2024):
                r[y] = ic[y] / ic[2021]
            src = "Eurostat gas inland consumption"
            v25, _n25 = chain_months(r[2024], icm, 2025, 2024)
            r[2025] = (
                ic[2025] / ic[2021] if ic.get(2025) and abs(math.log(ic[2025] / ic[2024])) < 0.5 else (v25 or r[2024])
            )
            v26, n26 = chain_months(r[2025], icm, 2026, 2025)
            r[2026] = v26 or r[2025]
            src += f"; 2026: {n26} months on the same months of 2025" if v26 else "; 2026 held at 2025"
            out[p] = {"ratio": r, "source": src}
            continue
        eu = ea.get(iso, {}).get(p, {}).get("TOTAL", {}) if p in FUELS else {}
        if eu.get(2021, 0) > 0 and all(eu.get(y) is not None for y in (2022, 2023, 2024)):
            src = "Eurostat energy imports, all origins"
            for y in (2022, 2023, 2024):
                r[y] = eu[y] / eu[2021]
            mm = em.get(iso, {}).get(p, {})
            for y in (2025, 2026):
                # the monthly series is not on the annual basis for every country (Germany): the change on the same
                # months of 2024 is chained onto the annual 2024 ratio
                months = [f"{y}-{m:02d}" for m in range(1, 13) if f"{y}-{m:02d}" in mm and f"2024-{m:02d}" in mm]
                if len(months) >= 6 and sum(mm[f"2024-{k[5:]}"] for k in months) > 0:
                    r[y] = r[2024] * sum(mm[k] for k in months) / sum(mm[f"2024-{k[5:]}"] for k in months)
                    src += f"; {y}: {len(months)} months on the same months of 2024 (Eurostat monthly)"
                else:
                    r[y] = r[y - 1]
                    src += f"; {y} held at {y - 1}"
        elif B.imp(iso, 2021, p) > 0:
            vals = {y: B.volume_ratio(iso, p, 2021, y) for y in (2022, 2023, 2024)}
            if all(v is not None and v > 0 for v in vals.values()):
                r = dict(vals)
                r[2025] = r[2026] = r[2024]
                src = "BACI (tonnes where sane, else deflated value); 2025-2026 held at 2024"
        out[p] = {"ratio": r, "source": src}
    return out


def price_factor(p: str, iso: str, y: int, nwi: dict, nw_band: str, e_band: str) -> float:
    """(actual / no-war price)^e for a fuel; 1 for other goods and for 2026 (no-war = actual by the site's decision)."""
    if p not in ELASTICITY or y >= 2026:
        return 1.0
    bench = NW_BENCH.get(p) or ("ttf" if iso in GAS_EUROPE else "jkm")
    s = nwi[bench][str(y)]
    nw = 17.5 / 23.133 if nw_band == "early2021" and bench == "ttf" else s["low" if nw_band == "early2021" else nw_band]
    return (s["actual"] / nw) ** ELASTICITY[p][e_band]


def no_war_index(p, iso, y, ratios, nwi, scen, shortfall):
    r = ratios[p]["ratio"].get(y)
    if r is None:
        return None
    nwb, eb, pol = scen
    f = r * price_factor(p, iso, y, nwi, nwb, eb)
    if pol and p == "gas" and y < 2026:
        sf = (shortfall.get(iso) or shortfall.get("EU27") or {}).get("years", {})
        yy = str(min(y, 2025)) if str(min(y, 2025)) in sf else (max(sf) if sf else None)
        if yy and iso in GAS_EUROPE:
            f *= math.exp(-min(0.0, sf[yy]["policy_shortfall"]))
    return f


SCENARIOS = {
    "central": ("central", "central", False),  # Jan-2022 forwards, central elasticity, price explains all
    "low": ("high", "low", False),  # Feb-2022 futures (higher no-war price), low elasticity: least correction
    "high": ("low", "high", True),  # Oct-2021 forecasts, high elasticity, plus the measured policy shortfall
    "tail_early2021": ("early2021", "high", True),  # early-2021 forwards (gas), the low tail: reported only
}


def chart_rows(cases: list[dict], data: str) -> list[dict]:
    """Chart-ready rows: data set, product, size, origin, model, n, error (mean over H1-H5 of the median absolute
    cumulative log error), bias and 5th/95th percentiles of the H5 error, gain over M0."""
    out = []
    for p in sorted({c["p"] for c in cases}):
        for s in (*SIZES, "all"):
            rows = [c for c in cases if c["p"] == p and (s == "all" or c["size"] == s)]
            for o, cell in acc_by_origin(rows).items():
                for m in ("M0", "D", "D0"):
                    if m not in cell:
                        continue
                    h5 = cell[m]["by_H"].get("H5", {})
                    out.append(
                        {
                            "data": data,
                            "product": p,
                            "size": s,
                            "origin": o,
                            "model": m,
                            "n": cell["n"],
                            "error": cell[m]["err"],
                            "gain_vs_M0": cell[m].get("gain"),
                            "bias_H5": h5.get("bias"),
                            "p05_H5": h5.get("p05"),
                            "p95_H5": h5.get("p95"),
                        }
                    )
    return out


def compact(rows: list[dict]) -> dict:
    cols = list(rows[0]) if rows else []
    return {"columns": cols, "rows": [[r[c] for c in cols] for r in rows]}


def summary_by_size(cases: list[dict], key=lambda r: r["errs"], models=("M0", "D", "D0")) -> dict:
    """Pooled over origins 2005-2016: per size, mean error over origins, bias and spread of the H5 error."""
    out = {}
    for s in (*SIZES, "all"):
        rows = [c for c in cases if c["o"] <= 2016 and (s == "all" or c["size"] == s)]
        if not rows:
            continue
        acc = acc_by_origin(rows, models, key)
        cell = {"n": len(rows)}
        for m in models:
            errs = [a[m]["err"] for a in acc.values() if m in a]
            h5 = [key(r)[m]["H5"] for r in rows if "H5" in key(r).get(m, {})]
            if errs:
                cell[m] = {
                    "mean_error_over_origins": round(float(np.mean(errs)), 4),
                    "bias_H5_median": round(float(np.median(h5)), 4) if h5 else None,
                    "spread_H5_p05_p95": [round(q(h5, 0.05), 3), round(q(h5, 0.95), 3)] if h5 else None,
                    "origins_beating_M0_by_15pct": sum(
                        1 for a in acc.values() if a.get(m, {}).get("gain", -1) >= RULE_GAIN
                    ),
                }
        out[s] = cell
    return out


def run(site_dir: str | None = None) -> None:
    t0 = time.time()
    B = Baci()
    oil_real, oil_exp = oil_paths()
    es = load_eurostat()
    ea = eurostat_annual(es)
    em = eurostat_monthly(es)
    hdd, _ = hdd_series(es)
    nwi = json.loads((GAPS / "energy_nowar.json").read_text())["nowar_index"]
    pc = baci_product_cases(B, oil_real, oil_exp)
    gic, gicm = gic_series(es), gic_monthly(es)
    ec = eurostat_cases(ea, B, oil_real, oil_exp, gic)
    print("cases", len(pc), len(ec), round(time.time() - t0, 1), file=sys.stderr)

    # ---- the rule, per product x size class, on each data set
    verdict: dict = {"BACI": {}, "Eurostat_origin_volumes": {}}
    diag_d0: dict = {"BACI": {}, "Eurostat_origin_volumes": {}}
    for name, cases, prods in (("BACI", pc, CANDIDATES), ("Eurostat_origin_volumes", ec, FUELS)):
        for p in prods:
            pooled = [c for c in cases if c["p"] == p]
            for s in SIZES:
                rows = [c for c in pooled if c["size"] == s]
                if not rows:
                    continue
                verdict[name][f"{p}/{s}"] = judge(rows, pooled, "D")
                j0 = judge(rows, pooled, "D0")
                diag_d0[name][f"{p}/{s}"] = {
                    k: j0[k]
                    for k in (
                        "origins_ge_15pct",
                        "worst_gain",
                        "median_gain",
                        "band_width_ratio_log",
                        "placebo",
                        "PASS",
                        "why_not",
                    )
                }
    for s_ in SIZES:
        rows = [c for c in ec if c["p"] == "gas" and c["size"] == s_ and "Dic" in c["errs"]]
        if rows:
            j = judge(rows, [c for c in ec if c["p"] == "gas" and "Dic" in c["errs"]], "Dic")
            diag_d0.setdefault("Eurostat_gas_share_of_inland_consumption_Dic", {})[f"gas/{s_}"] = {
                k: j[k]
                for k in (
                    "n_cases",
                    "gain_by_origin",
                    "origins_ge_15pct",
                    "worst_gain",
                    "median_gain",
                    "band_width_ratio_log",
                    "placebo",
                    "PASS",
                    "why_not",
                )
            }
    passed = {name: sorted(k for k, v in d.items() if v["PASS"]) for name, d in verdict.items()}
    eu_cov = set(ea)

    def accepted(p: str, size_p: str | None, size_c: str, iso: str) -> bool:
        if p not in CANDIDATES or not size_p:
            return False
        if p in FUELS and iso in eu_cov:
            return f"{p}/{size_c}" in passed["Eurostat_origin_volumes"]
        return f"{p}/{size_p}" in passed["BACI"]

    # ---- the country total (composite): held flat (site start rule) against D on accepted products / everywhere
    cc = baci_country_cases(B, oil_real, oil_exp)
    for c in cc:
        c["errs"] = {
            "M0": composite_errors(c, lambda p, s, i: False),
            "PASS": composite_errors(c, lambda p, s, i, c=c: accepted(p, s, c["size"], i)),
            "ALL": composite_errors(c, lambda p, s, i: p in CANDIDATES),
        }
    comp = {
        "accuracy_by_size_pooled": summary_by_size(cc, models=("M0", "PASS", "ALL")),
        "by_size_origin": {},
        "bands": {},
        "placebo": {},
    }
    rho: dict = {}
    for s in SIZES:
        rows = [c for c in cc if c["size"] == s]
        comp["by_size_origin"][s] = {
            str(o): {m: (v.get("err"), v.get("gain")) for m, v in cell.items() if m != "n"} | {"n": cell["n"]}
            for o, cell in acc_by_origin([c for c in rows if c["o"] <= 2016], ("M0", "PASS", "ALL")).items()
        }
        comp["bands"][s] = {}
        rho[s] = {}
        for m in ("M0", "PASS", "ALL"):
            comp["bands"][s][m] = {}
            for H in range(1, 6):
                b = band_of(rows, m, H)
                comp["bands"][s][m][f"H{H}"] = {k: b.get(k) for k in ("band", "K", "n", "log_width", "era_coverage")}
                if m == "M0":
                    continue
                b0 = band_of(rows, "M0", H)
                if "log_lo" in b and "log_lo" in b0:
                    rho[s].setdefault(m, {})[H] = (b["log_lo"] / b0["log_lo"], b["log_hi"] / b0["log_hi"])
            comp["placebo"].setdefault(s, {})[m] = placebo_cov(rows, m, band_of(rows, m, 5).get("K", 1.0))
    comp["band_ratio_vs_M0_log_lo_hi"] = {
        s: {m: {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in d.items()} for m, d in v.items()}
        for s, v in rho.items()
    }
    print("composite done", round(time.time() - t0, 1), file=sys.stderr)

    # ---- elasticities and the EU gas policy shortfall
    ela = elasticity_check(B, gic_series(es), hdd)
    short = gas_policy_shortfall(es, hdd, nwi)

    # ---- application to the site's current data
    site = Path(site_dir) if site_dir else ROOT / "site"
    D = json.loads((site / "data.json").read_text())
    prices = json.loads((GAPS / "prices.json").read_text())["countries"]
    e2 = json.loads((GAPS / "energy2.json").read_text())["fuel_mix_2019_2021"]
    patch: dict = {"proposal": {}, "everywhere": {}}
    per_country = {}
    for iso, c in sorted(D["countries"].items()):
        tr = c.get("to_rus")
        if not tr or not tr.get("base") or not tr.get("bmul"):
            continue
        base = tr["base"]
        size_c = size_of(base * 1e9)
        fs, w, wsrc = product_weights(iso, prices, e2, B)
        ratios = demand_ratios(iso, B, ea, em, gic, gicm)
        bias = tr.get("bias_mult") or [1.0] * 6
        cur = tr.get("cur") or [1.0] * 6
        # value weights at each year's no-war prices (fuel) and 2019-2021 prices (other goods), as the site's bmul
        nwp = {}
        for p in w:
            if p in FUELS or p == "fuel_rest":
                b = NW_BENCH.get(p) or ("ttf" if iso in GAS_EUROPE else "jkm")
                nwp[p] = [1.0] + [nwi[b][str(y)]["actual" if y >= 2026 else "central"] for y in YEARS[1:]]
            else:
                nwp[p] = [1.0] * 6
        sizes_p = {p: size_of(base * 1e9 * v) if base * v >= MIN_EUR / 1e9 else None for p, v in w.items()}
        idx = {
            sc: {p: [1.0] + [no_war_index(p, iso, y, ratios, nwi, spec, short) for y in YEARS[1:]] for p in w}
            for sc, spec in SCENARIOS.items()
        }
        row = {
            "size": size_c,
            "base_eur_bn": base,
            "fuel_share": round(fs, 3),
            "weights": {p: round(v, 4) for p, v in w.items() if v},
            "weights_source": wsrc,
            "product_size": {p: s for p, s in sizes_p.items() if s},
            "demand_index_vs_2021": {
                p: {str(y): round(v, 3) for y, v in r["ratio"].items()}
                for p, r in ratios.items()
                if r["source"] and w.get(p)
            },
            "demand_source": {p: r["source"] for p, r in ratios.items() if r["source"] and w.get(p)},
            "no_war_demand_index_central": {
                p: [round(x, 3) if x is not None else None for x in v]
                for p, v in idx["central"].items()
                if w.get(p) and ratios[p]["source"]
            },
            "laundered_2021_eur_bn": (tr.get("laundered") or [0])[0],
        }
        for var in ("proposal", "everywhere"):
            if var == "proposal":
                act = {p for p in w if size_c != "S" and accepted(p, sizes_p[p], size_c, iso)}
            else:
                act = {p for p in w if p in CANDIDATES}
            act = {p for p in act if all(x is not None for x in idx["central"][p][1:])}
            guarded = sorted(
                p for p in act if any(not RATIO_GUARD[0] <= x <= RATIO_GUARD[1] for x in ratios[p]["ratio"].values())
            )
            act -= set(guarded)
            if iso in HUBS:
                guarded, act = sorted(act | set(guarded)), set()
            row.setdefault("kept_flat_by_guard", {})[var] = guarded
            F = {}
            for sc in SCENARIOS:
                F[sc] = [1.0]
                for i in range(1, 6):
                    den = sum(w[p] * nwp[p][i] for p in w) or 1.0
                    num = sum(w[p] * nwp[p][i] * ((idx[sc][p][i] / bias[i]) if p in act else 1.0) for p in w)
                    F[sc].append(num / den)
            if not act:
                row[var] = {"active": [], "changed": False, "hub": iso in HUBS}
                continue
            q0, ql0, qh0 = tr["bmul"], tr.get("bmul_lo") or tr["bmul"], tr.get("bmul_hi") or tr["bmul"]
            bm = [round(q0[i] * F["central"][i], 4) for i in range(6)]
            r = rho.get(size_c, {}).get("PASS" if var == "proposal" else "ALL", {})
            r1 = r.get(1, (1.0, 1.0))
            bl, bh = [1.0], [1.0]
            for i in range(1, 6):
                lo_rel = (1 - ql0[i] / q0[i]) * r1[0] if q0[i] else 0
                hi_rel = (qh0[i] / q0[i] - 1) * r1[1] if q0[i] else 0
                dl = max(0.0, 1 - F["low"][i] / F["central"][i])
                dh = max(0.0, F["high"][i] / F["central"][i] - 1)
                bl.append(round(bm[i] * max(0.05, 1 - math.hypot(lo_rel, dl)), 4))
                bh.append(round(bm[i] * (1 + math.hypot(hi_rel, dh)), 4))
            E = [base * FRAC[i] * bm[i] * cur[i] for i in range(6)]
            cb = [None]
            for n in range(1, 6):
                lo, hi = (tr.get("cb") or [None] * 6)[n] or [ql0[n] / q0[n], qh0[n] / q0[n]]
                rr = r.get(n, (1.0, 1.0))
                se = sum(E[1 : n + 1])
                dl = max(0.0, 1 - sum(E[i] * F["low"][i] / F["central"][i] for i in range(1, n + 1)) / se)
                dh = max(0.0, sum(E[i] * F["high"][i] / F["central"][i] for i in range(1, n + 1)) / se - 1)
                cb.append(
                    [
                        round(max(0.05, 1 - math.hypot((1 - lo) * rr[0], dl)), 4),
                        round(1 + math.hypot((hi - 1) * rr[1], dh), 4),
                    ]
                )
            patch[var][iso] = {"bmul": bm, "bmul_lo": bl, "bmul_hi": bh, "cb": cb}
            row[var] = {
                "active": sorted(act),
                "changed": True,
                "F_central": [round(x, 4) for x in F["central"]],
                "F_low": [round(x, 4) for x in F["low"]],
                "F_high": [round(x, 4) for x in F["high"]],
                "F_tail_early2021": [round(x, 4) for x in F["tail_early2021"]],
                "band_ratio_used_H1_H5": {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in r.items()},
            }
        per_country[iso] = row
    SCRATCH.mkdir(parents=True, exist_ok=True)
    (SCRATCH / "site_patch_r48.json").write_text(json.dumps(patch))
    print("application done", len(per_country), round(time.time() - t0, 1), file=sys.stderr)

    out = {
        "generated": time.strftime("%Y-%m-%d"),
        "round": 48,
        "status": "research; nothing here is read by the build. The site figures were computed on the site data of "
        "2026-10-25 (before the parallel mid-size start and small-buyer bias fixes land) and must be recomputed at "
        "integration",
        "design_notes": {
            "weather": "the observed volumes are NOT corrected to normal weather: the no-war world had the same winters, "
            "so correcting a mild winter upward would count weather as war. Heating degree days are used to separate "
            "weather from price and policy in the EU gas shortfall (eu_gas_policy_shortfall)",
            "trend": "observed demand already carries the pre-war trend (renewables, efficiency) and the actual "
            "economy; nothing is added. A war-driven change of trend (REPowerEU) is the policy part, carried as range",
            "double_counting": "the price correction covers only the volume that disappeared (demand at no-war prices "
            "minus observed); the windfall line is the price on actual volumes, so the two do not overlap. The site's "
            "expected path keeps valuing fuel at the no-war price (bmul x mul), unchanged",
            "laundered_oil": "the share is Russia's direct share (exporter or country of origin = Russia) before the "
            "war; fuel made from Russian crude in third countries was not in it, and has its own no-war baseline in the "
            "laundered part, so share x total does not count it twice. War-time totals include laundered fuel as "
            "demand, which is right: it is demand the direct share would have served. per_country_inputs gives the "
            "laundered 2021 level next to the direct flow",
            "origin": "Eurostat energy imports are by country of origin (rerouted Russian fuel stays Russian); BACI is "
            "by exporter (consignment); Hong Kong's origin data cover gold only, and Hong Kong keeps the current "
            "method (gold transit hub)",
            "hubs": "ARM, GEO, KAZ, KGZ, UZB, TUR, AZE, MNG, TJK, SRB, ARE, BLR and HKG keep the current method: their "
            "imports from all suppliers were reshaped by goods passing to Russia (Armenia's other goods x3.5, "
            "Azerbaijan's crude x22 by 2024)",
            "guard": "added after the first diagnostic run, for the 2022-2026 application only (the back-test is "
            "unchanged): a product whose imports from all suppliers moved more than x3 either way against 2021 keeps "
            "held flat (data breaks: Mongolia's products x0.05 in BACI 2024, Algeria's gas, Lebanon's coal); European "
            "gas uses inland consumption, not imports (Austria's gas imports x2.6 in 2022 were storage and transit)",
            "years_2025_2026": "BACI ends in 2024: outside Eurostat's monthly energy data, 2025-2026 hold the 2024 "
            "demand index",
        },
        "question": "Does an observed-demand model (the country's imports of each product from all suppliers x its "
        "pre-war Russian share, corrected to no-war prices) predict purchases from Russia better than 2021 held flat?",
        "rule": RULE,
        "verdict_by_cell": verdict,
        "passed_cells": passed,
        "diagnostic_D0_no_price_correction": diag_d0,
        "backtest_summary_by_product_size": {
            "BACI": {p: summary_by_size([c for c in pc if c["p"] == p]) for p in PRODUCTS},
            "Eurostat_origin_volumes": {p: summary_by_size([c for c in ec if c["p"] == p]) for p in FUELS},
        },
        "backtest_chart_rows": compact(chart_rows(pc, "BACI") + chart_rows(ec, "Eurostat_origin_volumes")),
        "composite_country_total": comp,
        "price_paths_backtest": {
            str(o): {"vintage": v["vintage"], "path": {str(t): round(x, 2) for t, x in v["path"].items()}}
            for o, v in oil_exp.items()
        },
        "elasticities": {"used": ELASTICITY, "sources": ELASTICITY_SOURCES, "data_check_2002_2021": ela},
        "eu_gas_policy_shortfall": short,
        "scenarios": {
            k: {"no_war_price": a, "elasticity": b, "policy_shortfall_added_back": c}
            for k, (a, b, c) in SCENARIOS.items()
        },
        "per_country_inputs": per_country,
        "data": {
            "baci": "CEPII BACI HS92 via OEC API: raw/demand_cf_r48/baci_*.json.gz (imports from all suppliers by group "
            "and fuel heading; Russia's exports by importer and fuel heading; world HS4 values and tonnes); Russia's "
            "exports by importer and HS2: raw/oec_baci_r44",
            "eurostat": "raw/demand_cf_r48/eurostat_energy_2026-10-25.json.gz: nrg_ti_gas, nrg_ti_oil, nrg_ti_sff "
            "(imports by country of origin), nrg_ti_gasm, nrg_ti_oilm, nrg_cb_gas, nrg_cb_gasm, nrg_chdd_a, nrg_chdd_m",
            "prices": "world unit-value indices from BACI (Fisher chained by HS4); other goods FRED IREXFUELS; "
            "back-test price paths IMF WEO October vintages (raw/oec_baci_r44/weo_vintages.json); no-war paths "
            "gaps/energy_nowar.json",
            "gdp": "IMF WEO October 2021 vintage (raw/cf_models_r47/weo_country_vintages.json.gz)",
        },
    }
    prev = GAPS / "demand_cf_r48.json"
    if prev.exists():  # keep the site-model results of an earlier merge
        old = json.loads(prev.read_text())
        for k in ("site_before_after", "site_before_after_summary"):
            if k in old:
                out[k] = old[k]
    prev.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("written", round(time.time() - t0, 1), file=sys.stderr)


def merge(path: str) -> None:
    """Add the site model's before/after results (from the scratchpad Node run) to the gaps file."""
    res = json.loads(Path(path).read_text())
    f = GAPS / "demand_cf_r48.json"
    out = json.loads(f.read_text())
    out["site_before_after"] = res["countries"]
    out["site_before_after_summary"] = res["summary"]
    f.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    cmd = sys.argv[1:2]
    if cmd == ["fetch"]:
        fetch()
    elif cmd == ["run"]:
        run(sys.argv[2] if len(sys.argv) > 2 else None)
    elif cmd == ["merge"]:
        merge(sys.argv[2])
    else:
        print(__doc__)
