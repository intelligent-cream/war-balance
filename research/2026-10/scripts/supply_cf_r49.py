"""Round 49: a supply-side allocation no-war model for purchases from Russia ("paid", to_rus).

    no-war purchases of country c, product p, year t = [Russia's ACTUAL total exports of p in year t to all
    destinations, in volume] x [c's pre-war share of Russia's exports of p] (valued at no-war prices by the site)

Steps (from the repository root):

  python3 -I research/2026-10/scripts/supply_cf_r49.py fetch [--r48 DIR]
      downloads (untrusted data) into the scratchpad and writes small extracts with URL and retrieval date to
      research/2026-10/raw/supply_cf_r49/
  python3 -I research/2026-10/scripts/supply_cf_r49.py run [--r48 DIR] [--site DIR]
      back-tests + application; writes research/2026-10/gaps/supply_cf_r49.json and <scratch>/site_patch_r49.json
  python3 -I research/2026-10/scripts/supply_cf_r49.py merge <before_after.json>
      adds the site model's before/after (scratchpad r49/ba.mjs) to the gaps file

Inputs: research/2026-10/raw/oec_baci_r44 (Russia's exports by partner and HS2, 2001-2021; FRED; WEO vintages),
raw/cf_models_r47 (WEO country vintages), round 48's raw/demand_cf_r48 (BACI fuel headings by importer with tonnes,
importers' imports from all suppliers, world HS4 values and tonnes, Eurostat energy imports by origin; on the round-48
branch until it is merged: pass --r48 <dir with those four files>), raw/crea_api (CREA tracked volumes 2021-2026) and
this round's raw/supply_cf_r49 (Russia's exports to the world by HS4 with tonnes 2001-2024, Russia's exports by
partner and HS2 2021-2024, Russia's own customs reports via UN Comtrade 2001-2021).

The loaders and the round-48 demand model (D) are copied from research/2026-10/scripts/demand_cf_r48.py (round 48), so
D is evaluated on the very same cases; its numbers are checked against demand_cf_r48.json.
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
RAW = R / "raw" / "supply_cf_r49"
RAW44 = R / "raw" / "oec_baci_r44"
RAW47 = R / "raw" / "cf_models_r47"
RAW48_DEFAULT = R / "raw" / "demand_cf_r48"
CREA = R / "raw" / "crea_api"
GAPS = R / "gaps"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r49")
DL = SCRATCH / "dl"

OEC = "https://oec.world/api/olap-proxy/data.jsonrecords"
CUBE = "trade_i_baci_a_92"
COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
PSD = "https://apps.fas.usda.gov/psdonline/downloads/psd_grains_pulses_csv.zip"
GROUPS = ("fuel", "cereal", "fert", "metal", "other")


def group_of(hs2: int) -> str:
    return {27: "fuel", 10: "cereal", 31: "fert"}.get(hs2, "metal" if 72 <= hs2 <= 76 else "other")


def arg(name: str, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def raw48() -> Path:
    return Path(arg("--r48") or RAW48_DEFAULT)


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


def cached(name: str, url: str) -> dict:
    f = DL / f"{name}.json"
    if not f.exists():
        f.write_bytes(get(url))
        time.sleep(0.5)
    return json.loads(f.read_text())


def iso_of(oec_id: str) -> str | None:
    s = str(oec_id)[-3:].upper()
    return s if s.isalpha() and len(s) == 3 else None


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    DL.mkdir(parents=True, exist_ok=True)
    today = time.strftime("%Y-%m-%d")
    meta = {
        "source": "CEPII BACI HS92 (HS6 REV. 1992, 1995-2024 release) via the OEC API, no key; licence Etalab 2.0",
        "retrieved": today,
    }
    # 1. Russia's exports to the world by HS4: value and tonnes, 2001-2024 (volume indices of Russia's total)
    rows = []
    url0 = None
    for y in range(2001, 2025):
        p = {"cube": CUBE, "drilldowns": "Year,HS4", "measures": "Trade Value,Quantity", "Exporter Country": "eurus"}
        url = OEC + "?" + urllib.parse.urlencode({**p, "Year": y})
        url0 = url0 or url
        for r in cached(f"rus_world_hs4_{y}", url)["data"]:
            rows.append(
                [y, int(r["HS4 ID"]) % 10000, round(float(r["Trade Value"] or 0)), round(float(r["Quantity"] or 0), 1)]
            )
        print("hs4", y, len(rows), file=sys.stderr)
    with gzip.open(RAW / "baci_rus_world_hs4q_2001_2024.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "url": url0.replace("Year=2001", "Year=<2001..2024>"),
                "what": "Russia's exports to all destinations by HS4 heading: value (USD) and tonnes",
                "columns": ["year", "hs4", "usd", "tonnes"],
                "rows": rows,
            },
            fh,
        )
    # 2. Russia's exports by importer and HS2, 2021-2024 (2021 to check against round 44's 2001-2021 extract)
    rows = []
    url0 = None
    for y in range(2021, 2025):
        p = {
            "cube": CUBE,
            "drilldowns": "Year,Importer Country,HS2",
            "measures": "Trade Value",
            "Exporter Country": "eurus",
        }
        url = OEC + "?" + urllib.parse.urlencode({**p, "Year": y})
        url0 = url0 or url
        for r in cached(f"rus_partner_hs2_{y}", url)["data"]:
            iso = iso_of(r["Importer Country ID"])
            v = float(r["Trade Value"] or 0)
            if iso and v > 0:
                rows.append([y, iso, int(r["HS2 ID"]) % 100, round(v)])
        print("hs2", y, len(rows), file=sys.stderr)
    with gzip.open(RAW / "baci_rus_partner_hs2_2021_2024.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "url": url0.replace("Year=2021", "Year=<2021..2024>"),
                "what": "Russia's exports by importer and HS2 chapter, value USD (BACI reconciled; mirror data in the war years)",
                "columns": ["year", "importer", "hs2", "usd"],
                "rows": rows,
            },
            fh,
        )
    # 3. Russia's own customs reports: exports to the World by HS2 (AG2) and the four fuel headings, 2001-2021
    rows = []
    for y in range(2001, 2022):
        for cmd in ("AG2", "2709,2710,2711,2701"):
            q = {"reporterCode": 643, "period": y, "partnerCode": 0, "flowCode": "X", "cmdCode": cmd}
            url = COMTRADE + "?" + urllib.parse.urlencode(q)
            try:
                d = cached(f"ct_rus_{y}_{cmd[:4]}", url)
            except Exception as e:  # noqa: BLE001
                print("comtrade miss", y, cmd, e, file=sys.stderr)
                continue
            for r in d.get("data") or []:
                if r.get("partnerCode") == 0 and r.get("flowCode") == "X" and (r.get("motCode") in (0, None)):
                    if r.get("customsCode") not in ("C00", None) or r.get("partner2Code") not in (0, None):
                        continue
                    rows.append([y, r["cmdCode"], r.get("primaryValue"), r.get("netWgt")])
        print("comtrade", y, len(rows), file=sys.stderr)
    # 4. USDA FAS PSD: Russia's grain exports (wheat, barley, corn) by marketing year (July/June), 1000 t
    zf = DL / "psd_grains_pulses_csv.zip"
    if not zf.exists():
        zf.write_bytes(get(PSD))
    import csv
    import io
    import zipfile

    with zipfile.ZipFile(zf) as z:
        reader = csv.DictReader(io.TextIOWrapper(z.open(z.namelist()[0]), "utf-8"))
        grain = [
            [x["Commodity_Description"], int(x["Market_Year"]), float(x["Value"])]
            for x in reader
            if x["Country_Name"] == "Russia"
            and x["Attribute_Description"] == "Exports"
            and x["Commodity_Description"] in ("Wheat", "Barley", "Corn")
            and int(x["Market_Year"]) >= 2000
        ]
    (RAW / f"usda_psd_russia_grain_exports_{today}.json").write_text(
        json.dumps(
            {
                "source": "USDA FAS Production, Supply and Distribution (PSD) online, grains and pulses bulk CSV",
                "url": PSD,
                "retrieved": today,
                "what": "Russia's exports of wheat, barley and corn by local marketing year (July/June; the year it "
                "starts), 1000 metric tons; the latest years are USDA estimates and projections",
                "columns": ["commodity", "market_year", "kt"],
                "rows": grain,
            }
        )
    )
    (RAW / f"comtrade_rus_reported_exports_2001_2021_{today}.json").write_text(
        json.dumps(
            {
                "source": "UN Comtrade public preview API (no key): reporter Russian Federation (643), partner World, "
                "exports, HS as reported, annual",
                "url": COMTRADE + "?reporterCode=643&period=<2001..2021>&partnerCode=0&flowCode=X&cmdCode=AG2 (and "
                "cmdCode=2709,2710,2711,2701)",
                "retrieved": today,
                "columns": ["year", "cmd", "usd", "net_weight_kg"],
                "rows": rows,
            }
        )
    )


# --------------------------------------------------------------------------------------------------------------------
# the rule (fixed in this file before any result was computed, 2026-10-25; copied to the notes)
# --------------------------------------------------------------------------------------------------------------------

RULE = {
    "written": "2026-10-25, before any back-test result was computed",
    "candidate": "SUP: no-war purchases(c, p, t) = Russia's actual total exports of p to all destinations in t (volume) x "
    "c's pre-war share of Russia's exports of p. Back-test: start level x T(p,t)/T(p,o), T = the BACI sum over every "
    "importer of Russia's exports of p, deflated by the same world unit-value index as the case's actual (so on BACI "
    "the error is exactly the drift of c's value share); on Eurostat physical volumes T is Russia's total in BACI "
    "tonnes (crude, oil products, coal; unit value within x1/3-x3 of the world's) and deflated value for gas",
    "observed_total": "the observed total of year t is used in the back-test for year t, because it is observed at "
    "computation time in the war years too",
    "reference": "CUR, the current site rule: origin year held flat where the country's purchases from Russia are EUR "
    "0.1bn a year or more (round 47), else the median of the last three years x the round-47 small-flow bias factor "
    "(cf_models_r47.json). SUP uses the same start (origin share; for small countries the median of the last three "
    "years' shares) and, for small countries, its own bias factor measured the same way (median cumulative error over "
    "the S country cases, origins 2005-2016 pooled; for the placebo only the training origins). Also reported: M0 "
    "(plain flat) and D (round 48's demand model, exactly as published)",
    "error": "the site's cumulative error: log(sum w*actual / sum w*predicted) over H = 1..5 years, w = 1 except 8/12 "
    "for the fifth year; per origin the mean over H1-H5 of the median absolute error",
    "accept_if_all": [
        (
            "accuracy: SUP's error at least 15% lower than CUR's at EVERY rolling origin 2005-2016 (12 origins, incl. "
            "2008 and 2013/2014), at least 5 cases at each origin"
        ),
        (
            "band: SUP's era-calibrated 90% band for the five-year sum (H5; eras 2005-09, 2010-12, 2013-16) not wider "
            "in log width than CUR's"
        ),
        (
            "placebo: SUP's band, built only from earlier origins, covers at least 90% of the errors for the war moved "
            "to 2014 (origin 2013, H5; training origins up to 2008) and to 2018 (origin 2017, H4; up to 2013); under "
            "10 placebo cases: the product pooled over sizes"
        ),
    ],
    "cells": "product x size class of the product flow (S < EUR 0.1bn, M 0.1-1bn, L > 1bn, 4-year average; flows under "
    "EUR 10m left out). Products: crude 2709, oil products 2710, gas 2711, coal 2701, cereals HS10, fertilisers 31, "
    "metals 72-76, other goods. Fuels judged on Eurostat energy imports by country of origin for European reporters, "
    "BACI elsewhere; other goods on BACI (as round 48)",
    "secondary": "SUPT (the total from Russia's own log-linear trend over the ten years to the origin; no war-time "
    "information) is judged by the same rule and reported; it is proposed only if SUP fails and SUPT passes",
    "diagnostics_only": "SUPrep (Russia's own customs totals, UN Comtrade), SUPq (tonnes instead of deflated value, "
    "BACI fuels), COMB (geometric mean of the supply-side ratio and round 48's buyer-side ratio, lambda 0.5)",
    "no_narrow_pass": "a cell that fails narrowly fails; the rule is not changed after the results",
    "war_time_totals": "crude: observed; oil products: observed 2022-2023, held at 2023 from 2024 (refinery strikes, "
    "export bans); gas: current method (Russia's own cut); coal: observed (flagged); cereals, fertilisers: observed; "
    "metals, other goods: current method in the proposal (sanctions-shaped totals; gold through hubs), model only in "
    "the diagnostic",
    "hubs": "ARM, GEO, KAZ, KGZ, UZB, TUR, AZE, MNG, TJK, SRB, ARE, BLR, HKG keep the current method in both variants",
    "proposal": "passing cells x valid-total products x non-hub countries with purchases of EUR 0.1bn a year or more",
    "diagnostic": "SUP on every product except gas (and the rest of HS 27), every non-hub country",
}

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
VALID_TOTAL = {"crude", "products", "coal", "cereal", "fert"}  # war-time totals accepted (see RULE)
DIAG_PRODUCTS = {"crude", "products", "coal", "cereal", "fert", "metal", "other"}
HUBS = {"ARM", "GEO", "KAZ", "KGZ", "UZB", "TUR", "AZE", "MNG", "TJK", "SRB", "ARE", "BLR", "HKG"}
MODELS = ("M0", "CUR", "SUP", "SUPT", "D", "COMB", "SUPrep", "SUPq")
BIASED = ("SUP", "SUPT", "COMB", "SUPrep", "SUPq")  # get their own small-country bias factor (CUR: round 47's)
LAMBDA = 0.5
EU_GEO = {
    "AT": "AUT", "BE": "BEL", "BG": "BGR", "CY": "CYP", "CZ": "CZE", "DE": "DEU", "DK": "DNK", "EE": "EST",
    "EL": "GRC", "ES": "ESP", "FI": "FIN", "FR": "FRA", "HR": "HRV", "HU": "HUN", "IE": "IRL", "IT": "ITA",
    "LT": "LTU", "LU": "LUX", "LV": "LVA", "MT": "MLT", "NL": "NLD", "PL": "POL", "PT": "PRT", "RO": "ROU",
    "SE": "SWE", "SI": "SVN", "SK": "SVK", "UK": "GBR", "NO": "NOR", "RS": "SRB", "MK": "MKD", "BA": "BIH",
    "AL": "ALB", "ME": "MNE", "MD": "MDA", "TR": "TUR", "GE": "GEO", "XK": "XKX", "IS": "ISL", "CH": "CHE",
}  # fmt: skip
# round 48's elasticities (central) for D's price correction, copied
ELASTICITY_CENTRAL = {"gas": 0.20, "crude": 0.05, "products": 0.05, "coal": 0.10}


def q(a, p):
    return float(np.quantile(np.array(a), p)) if len(a) else float("nan")


# ---- loaders copied from demand_cf_r48.py (round 48) ---------------------------------------------------------------


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
    with gzip.open(raw48() / "baci_imports_groups_all_suppliers_2001_2024.json.gz", "rt") as fh:
        d = json.load(fh)
    imp_g: dict = {}
    for y, iso, g, v in d["rows"]:
        imp_g.setdefault(iso, {}).setdefault(y, dict.fromkeys(GROUPS, 0.0))[g] += v
    with gzip.open(raw48() / "baci_fuel_hs4_2001_2024.json.gz", "rt") as fh:
        d = json.load(fh)
    imp_f: dict = {}
    rus_f: dict = {}
    for tgt, rows in ((imp_f, d["imports"]), (rus_f, d["rus"])):
        for y, iso, h, v, t in rows:
            tgt.setdefault(iso, {}).setdefault(y, {})[h] = (float(v), float(t))
    with gzip.open(raw48() / "baci_world_hs4q_2001_2024.json.gz", "rt") as fh:
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
    wuv = {p: {y: w4[y][h][0] / w4[y][h][1] for y in years if h in w4.get(y, {})} for p, h in HS4_OF.items()}
    return rus_g, rus_f, imp_g, imp_f, price, usd_per_eur, wuv


def nominal(iso: str, y: int, p: str, g_src: dict, f_src: dict) -> float:
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
        a, b = self.sane_tonnes(iso, o, p), self.sane_tonnes(iso, t, p)
        if a and b:
            return b / a
        vo, vt = self.imp(iso, o, p), self.imp(iso, t, p)
        if vo <= 0 or vt < 0 or t not in self.price[p] or o not in self.price[p]:
            return None
        return (vt / self.price[p][t]) / (vo / self.price[p][o])


def oil_paths():
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


def price_corr(p: str, o: int, t: int, oil_real, oil_exp) -> float:
    if p not in ELASTICITY_CENTRAL:
        return 1.0
    return (oil_real[t] / oil_exp[o]["path"][t]) ** ELASTICITY_CENTRAL[p]


def size_of(avg_eur: float) -> str:
    return "S" if avg_eur < 0.1e9 else "M" if avg_eur < 1e9 else "L"


def load_eurostat() -> dict:
    with gzip.open(raw48() / "eurostat_energy_2026-10-25.json.gz", "rt") as fh:
        return json.load(fh)["datasets"]


def eurostat_annual(es: dict) -> dict:
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
    for d in out.values():
        if "_oil_all" in d and "crude" in d:
            d["products"] = {
                pt: {y: max(0.0, v - d["crude"].get(pt, {}).get(y, 0.0)) for y, v in s.items()}
                for pt, s in d["_oil_all"].items()
            }
        d.pop("_oil_all", None)
    return out


# ---- Russia's totals ------------------------------------------------------------------------------------------------


class Totals:
    """Russia's total exports of each product to all destinations: BACI sums over importers (nominal USD), tonnes for
    the fuel headings, Russia's own customs reports (Comtrade), and for 2021-2024 the new extracts."""

    def __init__(self, B: Baci) -> None:
        self.B = B
        self.val: dict[str, dict[int, float]] = {p: {} for p in PRODUCTS}
        self.ton: dict[str, dict[int, float]] = {p: {} for p in FUELS}
        isos = set(B.rus_g) | set(B.rus_f)
        for y in range(2001, 2022):
            for p in PRODUCTS:
                self.val[p][y] = sum(B.rus(i, y, p) for i in isos)
        for y in range(2001, 2025):
            for p, h in HS4_OF.items():
                self.ton[p][y] = sum(B.rus_f.get(i, {}).get(y, {}).get(h, (0, 0))[1] for i in isos)
        # Russia's exports to the world by HS4 (this round's extract): values and tonnes 2001-2024
        with gzip.open(RAW / "baci_rus_world_hs4q_2001_2024.json.gz", "rt") as fh:
            d = json.load(fh)
        self.w4: dict[int, dict[int, tuple[float, float]]] = {}
        for y, h, v, t in d["rows"]:
            self.w4.setdefault(y, {})[h] = (float(v), float(t))
        # war years by partner (BACI mirror-reconciled), for the nonfuel groups and a check of 2021
        with gzip.open(RAW / "baci_rus_partner_hs2_2021_2024.json.gz", "rt") as fh:
            d = json.load(fh)
        self.part: dict[int, dict[str, dict[str, float]]] = {}
        for y, iso, hs2, v in d["rows"]:
            g = self.part.setdefault(y, {}).setdefault(iso, dict.fromkeys(GROUPS, 0.0))
            g[group_of(hs2)] += v
        for y in range(2022, 2025):
            for p in ("cereal", "fert", "metal", "other"):
                self.val[p][y] = sum(g[p] for g in self.part[y].values())
            for p, h in HS4_OF.items():
                self.val[p][y] = sum(B.rus_f.get(i, {}).get(y, {}).get(h, (0, 0))[0] for i in isos)
        # Russia's own customs reports
        f = sorted(RAW.glob("comtrade_rus_reported_exports_2001_2021_*.json"))
        self.rep: dict[str, dict[int, float]] = {p: {} for p in PRODUCTS}
        self.rep_ton: dict[str, dict[int, float]] = {p: {} for p in FUELS}
        if f:
            d = json.loads(f[-1].read_text())
            hs2v: dict[int, dict[int, float]] = {}
            hs4v: dict[int, dict[int, float]] = {}
            for y, cmd, v, wgt in d["rows"]:
                if len(cmd) == 4 and wgt:
                    pp = {h: k for k, h in HS4_OF.items()}.get(int(cmd))
                    if pp:
                        self.rep_ton[pp][y] = float(wgt)
                if v is None:
                    continue
                (hs2v if len(cmd) == 2 else hs4v).setdefault(y, {})[int(cmd)] = float(v)
            for y, chap in hs2v.items():
                g = dict.fromkeys(GROUPS, 0.0)
                for c, v in chap.items():
                    if c == 99:
                        continue
                    g[group_of(c)] += v
                for p in ("cereal", "fert", "metal", "other"):
                    self.rep[p][y] = g[p]
                for p, h in HS4_OF.items():
                    # Russia's customs report pipeline gas as confidential from 2016 (2711 falls from USD 63bn in
                    # 2014 to 4bn in 2016): gas is left out of the reported totals from then on
                    if h in hs4v.get(y, {}) and not (p == "gas" and y >= 2016):
                        self.rep[p][y] = hs4v[y][h]
                self.rep["fuel_rest"][y] = max(0.0, g["fuel"] - sum(hs4v.get(y, {}).get(h, 0) for h in HS4_OF.values()))

    def real(self, p: str, y: int, o: int) -> float | None:
        v = self.val[p].get(y)
        P = self.B.price[p]
        return v / P[y] * P[o] if v and y in P and o in P else None

    def rep_real(self, p: str, y: int, o: int) -> float | None:
        v = self.rep[p].get(y)
        P = self.B.price[p]
        return v / P[y] * P[o] if v and y in P and o in P else None

    def tonnes_ok(self, p: str, y: int) -> float | None:
        """Russia's total tonnes of a fuel heading where its unit value is within x1/3-x3 of the world's."""
        t = self.ton.get(p, {}).get(y)
        v = sum(self.B.rus_f.get(i, {}).get(y, {}).get(HS4_OF[p], (0, 0))[0] for i in self.B.rus_f) if t else 0
        w = self.B.wuv[p].get(y)
        if not t or not v or not w or not 1 / 3 <= (v / t) / w <= 3:
            return None
        return t

    def own_uv_index(self, p: str, years: list[int]) -> dict[int, float]:
        sel = self._sel(p)
        return fisher_chain(
            {y: {h: x for h, x in self.w4.get(y, {}).items() if sel(h) and x[1] > 0} for y in years}, years
        )

    @staticmethod
    def _sel(p: str):
        return {
            "cereal": lambda h: h // 100 == 10,
            "fert": lambda h: h // 100 == 31,
            "metal": lambda h: 72 <= h // 100 <= 76,
            "other": lambda h: h // 100 not in (10, 27, 31, 72, 73, 74, 75, 76),
        }[p]

    def own_volume_index(self, p: str, years: list[int]) -> dict[int, float]:
        """Russia's own export volume (Fisher quantity index over its HS4 headings: value / Fisher unit-value index)."""
        sel = self._sel(p)
        uv = self.own_uv_index(p, years)
        val = {y: sum(x[0] for h, x in self.w4.get(y, {}).items() if sel(h)) for y in years}
        return {y: val[y] / uv[y] / (val[years[0]] / uv[years[0]]) for y in years}


def trend_total(T: Totals, p: str, o: int, t: int) -> float | None:
    """Russia's total of p (real at origin prices) extrapolated to t from a log-linear fit on o-10..o (from 2001)."""
    ys = [y for y in range(max(2001, o - 10), o + 1) if T.real(p, y, o)]
    if len(ys) < 5:
        return None
    X = np.array([[1.0, y - o] for y in ys])
    b = np.linalg.lstsq(X, np.array([math.log(T.real(p, y, o)) for y in ys]), rcond=None)[0]
    return math.exp(b[0] + b[1] * (t - o))


# --------------------------------------------------------------------------------------------------------------------
# back-test cases
# --------------------------------------------------------------------------------------------------------------------


def cum_err(actual: dict[int, float], pred: dict[int, float], o: int, mult=None, last: int = 2021) -> dict[str, float]:
    """The site's cumulative error per horizon; mult = yearly multipliers (h = 1..5) applied to pred (bias factor)."""
    out = {}
    for H in range(1, 6):
        ts = [o + h for h in range(1, H + 1)]
        if ts[-1] > last or any(t not in pred or t not in actual for t in ts):
            break
        ws = [W5[h - 1] if H == 5 else 1.0 for h in range(1, H + 1)]
        a = sum(w * actual[t] for t, w in zip(ts, ws))
        b = sum(w * pred[t] * (mult[t - o - 1] if mult else 1.0) for t, w in zip(ts, ws))
        if a <= 0 or b <= 0:
            break
        out[f"H{H}"] = math.log(a / b)
    return out


def yearly_mult(cum: dict[str, float]) -> list[float]:
    """Yearly multipliers whose cumulative factor over H years equals exp(cum[H]) (round 47's method)."""
    mult: list[float] = []
    for H in range(1, 6):
        ws = [W5[h - 1] if H == 5 else 1.0 for h in range(1, H + 1)]
        need = math.exp(cum.get(f"H{H}", 0.0)) * sum(ws) - sum(w * m for w, m in zip(ws[:-1], mult))
        mult.append(need / ws[-1])
    return mult


def country_sizes(B: Baci) -> dict[tuple[str, int], str]:
    out = {}
    for iso in B.rus_g:
        for o in range(2005, 2018):
            win = [o - 3, o - 2, o - 1, o]
            avg = sum(sum(B.rus(iso, y, p) for p in PRODUCTS) / B.eur[y] for y in win) / 4
            out[(iso, o)] = size_of(avg) if avg >= MIN_EUR else None
    return out


def baci_preds(B: Baci, T: Totals, csz: dict, oil_real, oil_exp) -> list[dict]:
    """One record per importer, product and origin 2005-2017 (every product with a positive origin value, for the
    composite; the product cells use those with all four window years positive and at least EUR 10m): the actual path
    (real at origin prices) and every model's unbiased predicted path."""
    out = []
    for iso in B.rus_g:
        if iso in EXCLUDE:
            continue
        for o in range(2005, 2018):
            cs = csz.get((iso, o))
            if not cs:
                continue
            win = [o - 3, o - 2, o - 1, o]
            for p in PRODUCTS:
                vals = [B.rus(iso, y, p) for y in win]
                if vals[-1] <= 0:
                    continue
                P = B.price[p]
                avg = sum(v / B.eur[y] for v, y in zip(vals, win)) / 4
                ts = list(range(o + 1, min(o + 5, 2021) + 1))
                actual = {t: B.rus(iso, t, p) / P[t] * P[o] for t in ts}
                real = {y: B.rus(iso, y, p) / P[y] * P[o] for y in (o - 2, o - 1, o)}
                Tr = {y: T.real(p, y, o) for y in range(o - 2, min(o + 5, 2021) + 1)}
                if any(not Tr[y] for y in Tr):
                    continue
                share = {y: real[y] / Tr[y] for y in (o - 2, o - 1, o)}
                small = cs == "S"
                start_cur = float(np.median(list(real.values()))) if small else real[o]
                sh0 = float(np.median(list(share.values()))) if small else share[o]
                pred: dict[str, dict[int, float]] = {m: {} for m in MODELS}
                tq = {y: T.tonnes_ok(p, y) for y in range(o, min(o + 5, 2021) + 1)} if p in HS4_OF else {}
                Trep = {y: T.rep_real(p, y, o) for y in range(o - 2, min(o + 5, 2021) + 1)}
                shr = (
                    (float(np.median([real[y] / Trep[y] for y in (o - 2, o - 1, o)])) if small else real[o] / Trep[o])
                    if all(Trep.get(y) for y in (o - 2, o - 1, o))
                    else None
                )
                for t in ts:
                    pred["M0"][t] = real[o]
                    pred["CUR"][t] = start_cur
                    pred["SUP"][t] = sh0 * Tr[t]
                    tt = trend_total(T, p, o, t)
                    if tt:
                        pred["SUPT"][t] = sh0 * tt
                    if shr is not None and Trep.get(t):
                        pred["SUPrep"][t] = shr * Trep[t]
                    if tq.get(o) and tq.get(t):
                        pred["SUPq"][t] = sh0 * Tr[o] * tq[t] / tq[o]
                    vr = B.volume_ratio(iso, p, o, t) if B.imp(iso, o, p) > 0 else None
                    if vr is not None:
                        dr = vr * price_corr(p, o, t, oil_real, oil_exp)
                        pred["D"][t] = real[o] * dr
                        pred["COMB"][t] = sh0 * Tr[o] * (Tr[t] / Tr[o]) ** (1 - LAMBDA) * dr**LAMBDA
                out.append(
                    {
                        "iso": iso,
                        "o": o,
                        "p": p,
                        "size": size_of(avg) if avg >= MIN_EUR else None,
                        "csize": cs,
                        "cell_ok": min(vals) > 0 and avg >= MIN_EUR and B.imp(iso, o, p) > 0,
                        "actual": actual,
                        "pred": pred,
                    }
                )
    return out


def eurostat_preds(ea: dict, B: Baci, T: Totals, csz: dict, oil_real, oil_exp) -> list[dict]:
    """Eurostat volumes by origin (European reporters): Russia's volume to the country against each model."""
    out = []
    for iso, prods in ea.items():
        for p, d in prods.items():
            ru, tot = d.get("RU", {}), d.get("TOTAL", {})
            for o in range(2005, 2018):
                win = [o - 3, o - 2, o - 1, o]
                if any(ru.get(y, 0) <= 0 for y in win) or tot.get(o, 0) <= 0:
                    continue
                tw = [sum(B.rus(iso, y, x) for x in PRODUCTS) / B.eur[y] for y in win]
                size = size_of(sum(tw) / 4)
                small = size == "S"
                ts = [t for t in range(o + 1, min(o + 5, 2021) + 1) if t in ru]
                actual = {t: ru[t] for t in ts}
                # Russia's total: BACI tonnes (crude, products, coal) where sane in every year, else deflated value
                yrs = range(o - 2, min(o + 5, 2021) + 1)
                V = {y: T.tonnes_ok(p, y) for y in yrs} if p != "gas" else {}
                basis = "tonnes"
                if not V or any(not V[y] for y in yrs):
                    V = {y: T.real(p, y, o) for y in yrs}
                    basis = "deflated value"
                if any(not V[y] for y in yrs):
                    continue
                Vr = {y: T.rep_real(p, y, o) for y in yrs}
                share = {y: ru[y] / V[y] for y in (o - 2, o - 1, o)}
                start_cur = float(np.median([ru[y] for y in (o - 2, o - 1, o)])) if small else ru[o]
                sh0 = float(np.median(list(share.values()))) if small else share[o]
                pred: dict[str, dict[int, float]] = {m: {} for m in MODELS}
                for t in ts:
                    pred["M0"][t] = ru[o]
                    pred["CUR"][t] = start_cur
                    pred["SUP"][t] = sh0 * V[t]
                    tt = trend_total(T, p, o, t)
                    if tt and T.real(p, o, o):
                        pred["SUPT"][t] = sh0 * V[o] * tt / T.real(p, o, o)
                    if all(Vr.get(y) for y in (o, t)):
                        pred["SUPrep"][t] = sh0 * V[o] * Vr[t] / Vr[o]
                    if tot.get(t) is not None:
                        dr = tot[t] / tot[o] * price_corr(p, o, t, oil_real, oil_exp)
                        pred["D"][t] = ru[o] * dr
                        pred["COMB"][t] = sh0 * V[o] * (V[t] / V[o]) ** (1 - LAMBDA) * dr**LAMBDA
                out.append(
                    {"iso": iso, "o": o, "p": p, "size": size, "csize": size, "cell_ok": True, "actual": actual,
                     "pred": pred, "basis": basis}
                )  # fmt: skip
    return out


# --------------------------------------------------------------------------------------------------------------------
# errors with the small-country bias factors
# --------------------------------------------------------------------------------------------------------------------


class Errors:
    """Cumulative errors per record and model, with the small-country bias factor of each model for a given cut-off of
    the origins used to measure it (2016 for the accuracy and band tests, 2008 / 2013 for the placebos)."""

    def __init__(self, r47_cum: dict[str, float]) -> None:
        self.mult: dict[int, dict[str, list[float]]] = {}
        self.r47 = yearly_mult(r47_cum)

    def set_bias(self, cut: int, comp_cases: list[dict]) -> dict:
        m: dict[str, list[float]] = {"CUR": self.r47}
        meas = {}
        for mod in BIASED:
            es: dict[str, list[float]] = {}
            for c in comp_cases:
                if c["csize"] != "S" or c["o"] > cut:
                    continue
                e = cum_err(c["actual"], c["pred_unbiased"][mod], c["o"])
                for k, v in e.items():
                    es.setdefault(k, []).append(v)
            cum = {k: float(np.median(v)) for k, v in es.items() if v}
            meas[mod] = {k: round(v, 4) for k, v in cum.items()}
            m[mod] = yearly_mult(cum)
        # CUR's bias measured the same way (a check of round 47's published factor)
        es = {}
        for c in comp_cases:
            if c["csize"] == "S" and c["o"] <= cut:
                for k, v in cum_err(c["actual"], c["pred_unbiased"]["CUR"], c["o"]).items():
                    es.setdefault(k, []).append(v)
        meas["CUR_remeasured"] = {k: round(float(np.median(v)), 4) for k, v in es.items()}
        self.mult[cut] = m
        return meas

    def errs(self, rec: dict, cut: int = 2016) -> dict[str, dict[str, float]]:
        out = {}
        for mod, pr in rec["pred"].items():
            mm = self.mult[cut].get(mod) if rec["csize"] == "S" else None
            out[mod] = cum_err(rec["actual"], pr, rec["o"], mm)
        return out


def composite_cases(recs: list[dict], B: Baci, active_sets: dict) -> list[dict]:
    """Country totals: CUR on the total (the site's start rule); model m on the products in an active set, CUR's own
    product path elsewhere: pred = CURtotal x sum_p w_p x (pred_m,p / pred_CUR,p), w_p = CUR's product weights.
    Records are kept unbiased; the bias factors enter per product in comp_errs."""
    by: dict[tuple[str, int], list[dict]] = {}
    for r in recs:
        by.setdefault((r["iso"], r["o"]), []).append(r)
    out = []
    for (iso, o), rs in by.items():
        cs = rs[0]["csize"]
        ts = list(range(o + 1, min(o + 5, 2021) + 1))
        tot = {
            y: sum(B.rus(iso, y, p) / B.price[p][y] * B.price[p][o] for p in PRODUCTS) for y in range(o - 2, ts[-1] + 1)
        }
        if min(tot.values()) <= 0:
            continue
        start = float(np.median([tot[y] for y in (o - 2, o - 1, o)])) if cs == "S" else tot[o]
        curp = {r["p"]: r["pred"]["CUR"] for r in rs}
        den = {t: sum(v[t] for v in curp.values()) for t in ts}
        c = {
            "iso": iso,
            "o": o,
            "csize": cs,
            "actual": {t: tot[t] for t in ts},
            "start": start,
            "prods": rs,
            "den": den,
        }
        # unbiased "everywhere" paths, for measuring each model's small-country bias
        c["pred_unbiased"] = {}
        for mod in (*BIASED, "CUR"):
            pr = {}
            for t in ts:
                s = 0.0
                for r in rs:
                    m = r["pred"].get(mod, {}).get(t) if r["p"] in CANDIDATES else None
                    s += m if m is not None else r["pred"]["CUR"][t]
                pr[t] = start * s / den[t] if den[t] else start
            c["pred_unbiased"][mod] = pr
        out.append(c)
    return out


def comp_errs(c: dict, E: Errors, mod: str, active, cut: int = 2016) -> dict[str, float]:
    """Errors of the composite for model mod on the products where active(p, size_p, iso) holds."""
    ts = list(c["actual"])
    small = c["csize"] == "S"
    mc = E.mult[cut]["CUR"] if small else [1.0] * 5
    mm = E.mult[cut].get(mod) if small and mod in BIASED else [1.0] * 5
    pr = {}
    for t in ts:
        h = t - c["o"] - 1
        s = 0.0
        for r in c["prods"]:
            m = r["pred"].get(mod, {}).get(t) if mod != "CUR" and active(r["p"], r["size"], c["iso"]) else None
            s += m * mm[h] if m is not None else r["pred"]["CUR"][t] * mc[h]
        pr[t] = c["start"] * s / c["den"][t] if c["den"][t] else c["start"]
    return cum_err(c["actual"], pr, c["o"])


# --------------------------------------------------------------------------------------------------------------------
# evaluation (round 48's functions, with CUR as the reference)
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
    return {"K": K, "era_coverage": {k: round(v, 3) for k, v in cov.items()}, "lo": K * q(allv, 0.05),
            "hi": K * q(allv, 0.95), "n": len(allv)}  # fmt: skip


def acc_by_origin(rows: list[dict], models, ref: str = "CUR") -> dict:
    out = {}
    for o in sorted({r["o"] for r in rows}):
        rs = [r for r in rows if r["o"] == o]
        cell = {"n": len(rs)}
        for m in models:
            per_h = {}
            for H in range(1, 6):
                es = [r["e"][m][f"H{H}"] for r in rs if f"H{H}" in r["e"].get(m, {})]
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
            if m != ref and m in cell and ref in cell and cell[ref]["err"] > 0:
                cell[m]["gain"] = round(1 - cell[m]["err"] / cell[ref]["err"], 4)
        out[o] = cell
    return out


def band_of(rows: list[dict], m: str, H: int, max_origin: int = 2016) -> dict:
    by_o: dict[int, list[float]] = {}
    for r in rows:
        if r["o"] <= max_origin and f"H{H}" in r["e"].get(m, {}):
            by_o.setdefault(r["o"], []).append(r["e"][m][f"H{H}"])
    if sum(len(v) for v in by_o.values()) < 10:
        return {"n": sum(len(v) for v in by_o.values())}
    cal = calibrate(by_o)
    return {"K": cal["K"], "era_coverage": cal["era_coverage"], "n": cal["n"],
            "band": [round(math.exp(cal["lo"]), 3), round(math.exp(cal["hi"]), 3)], "log_lo": cal["lo"],
            "log_hi": cal["hi"], "log_width": round(cal["hi"] - cal["lo"], 4)}  # fmt: skip


def placebo_cov(rows: list[dict], m: str, K: float) -> dict:
    """rows carry r["e_plc"][name] = errors with the bias factor measured on that placebo's training origins."""
    out = {}
    for name, (o, H, last) in PLACEBOS.items():
        key = f"H{H}"
        train = [r["e_plc"][name][m][key] for r in rows if r["o"] <= last and key in r["e_plc"][name].get(m, {})]
        test = [r["e_plc"][name][m][key] for r in rows if r["o"] == o and key in r["e_plc"][name].get(m, {})]
        if len(train) < 10 or not test:
            out[name] = {"n": len(test), "coverage": None}
            continue
        lo, hi = K * q(train, 0.05), K * q(train, 0.95)
        out[name] = {"n": len(test), "coverage": round(sum(lo <= e <= hi for e in test) / len(test), 3),
                     "band": [round(math.exp(lo), 3), round(math.exp(hi), 3)]}  # fmt: skip
    return out


def judge(rows: list[dict], pooled: list[dict], model: str, ref: str = "CUR") -> dict:
    acc = acc_by_origin([r for r in rows if r["o"] <= 2016], (ref, model), ref)
    gains = {o: acc.get(o, {}).get(model, {}).get("gain") for o in ORIGINS}
    ns = {o: acc.get(o, {}).get("n", 0) for o in ORIGINS}
    ok_acc = all(ns[o] >= 5 and gains[o] is not None and gains[o] >= RULE_GAIN for o in ORIGINS)
    b0, bd = band_of(rows, ref, 5), band_of(rows, model, 5)
    ok_band = "log_width" in b0 and "log_width" in bd and bd["log_width"] <= b0["log_width"]
    K = bd.get("K", 1.0)
    plc = placebo_cov(rows, model, K)
    plc_src = "cell"
    if any((v["n"] or 0) < 10 for v in plc.values()):
        plc = placebo_cov(pooled, model, K)
        plc_src = "product pooled over sizes"
    ok_plc = all(v["coverage"] is not None and v["coverage"] >= 0.9 for v in plc.values())
    reasons = []
    valid = [g for o, g in gains.items() if g is not None and ns[o] >= 5]
    if not ok_acc:
        lt5 = [o for o in ORIGINS if ns[o] < 5]
        bad = [o for o in ORIGINS if ns[o] >= 5 and (gains[o] is None or gains[o] < RULE_GAIN)]
        reasons.append(
            ("fewer than 5 cases at " + ",".join(map(str, lt5)) + "; " if lt5 else "")
            + (f"gain under 15% at {len(bad)} of 12 origins (" + ",".join(map(str, bad)) + ")" if bad else "")
        )
    if not ok_band:
        reasons.append("band wider" if "log_width" in bd else "too few cases for a band")
    if not ok_plc:
        reasons.append("placebo coverage under 90%")
    return {
        "n_cases": len(rows),
        "n_by_origin": {str(o): ns[o] for o in ORIGINS},
        "gain_by_origin": {str(o): gains[o] for o in ORIGINS},
        "err_by_origin": {str(o): {m: acc.get(o, {}).get(m, {}).get("err") for m in (ref, model)} for o in ORIGINS},
        "origins_ge_15pct": sum(1 for g in valid if g >= RULE_GAIN),
        "worst_gain": round(min(valid), 3) if valid else None,
        "worst_origin": min(
            (o for o in ORIGINS if gains[o] is not None and ns[o] >= 5), key=lambda o: gains[o], default=None
        ),
        "median_gain": round(float(np.median(valid)), 3) if valid else None,
        "band_H5_ref": {k: b0.get(k) for k in ("band", "K", "n", "log_width")},
        "band_H5_model": {k: bd.get(k) for k in ("band", "K", "n", "log_width")},
        "band_width_ratio_log": round(bd["log_width"] / b0["log_width"], 3)
        if "log_width" in bd and "log_width" in b0
        else None,
        "placebo": plc,
        "placebo_basis": plc_src,
        "pass_accuracy": ok_acc,
        "pass_band": ok_band,
        "pass_placebo": ok_plc,
        "PASS": ok_acc and ok_band and ok_plc,
        "why_not": "; ".join(r for r in reasons if r) or None,
    }


def summary(rows: list[dict], models) -> dict:
    """Pooled over origins 2005-2016: error (mean over origins), bias and 5-95% spread of the H5 error."""
    rows = [r for r in rows if r["o"] <= 2016]
    acc = acc_by_origin(rows, models)
    out = {"n": len(rows)}
    for m in models:
        errs = [a[m]["err"] for a in acc.values() if m in a]
        h5 = [r["e"][m]["H5"] for r in rows if "H5" in r["e"].get(m, {})]
        if errs:
            out[m] = {
                "error": round(float(np.mean(errs)), 4),
                "bias_H5": round(float(np.median(h5)), 4) if h5 else None,
                "spread_H5": [round(q(h5, 0.05), 3), round(q(h5, 0.95), 3)] if h5 else None,
                "origins_beating_CUR_by_15pct": sum(
                    1 for a in acc.values() if a.get(m, {}).get("gain", -1) >= RULE_GAIN
                )
                if m != "CUR"
                else None,
                "worst_gain_vs_CUR": round(min(a[m]["gain"] for a in acc.values() if "gain" in a.get(m, {})), 3)
                if m != "CUR" and any("gain" in a.get(m, {}) for a in acc.values())
                else None,
            }
    return out


# --------------------------------------------------------------------------------------------------------------------
# war-time totals (2021 = 1)
# --------------------------------------------------------------------------------------------------------------------

YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
FRAC = [1, 1, 1, 1, 1, 8 / 12]
CREA_GROUP = {"crude": "Crude oil", "products": "Oil products and chemicals", "coal": "Coal", "lng": "LNG",
              "pipeline_gas": "Pipeline gas"}  # fmt: skip
NW_BENCH = {"crude": "brent", "products": "diesel_gasoil_products", "coal": "newcastle",
            "fuel_rest": "diesel_gasoil_products"}  # fmt: skip
NONFUEL_MAP = {"fertiliser": "fert", "wheat": "cereal", "maize": "cereal", "iron_steel": "metal",
               "aluminium": "metal", "copper": "metal", "nickel": "metal"}  # fmt: skip
GAS_EUROPE = set(EU_GEO.values())


def crea_volumes() -> dict:
    """CREA tracked volumes (tonnes) by commodity group and month, 2021-2026 (raw/crea_api)."""
    f = max(CREA.glob("counter_month_country_fuel_*.json.gz"))
    with gzip.open(f, "rt") as fh:
        d = json.load(fh)
    cols = d["columns"]
    i_m = cols.index("month") if "month" in cols else cols.index("date") if "date" in cols else 0
    i_g, i_t = cols.index("commodity_group"), cols.index("value_tonne")
    out: dict = {}
    for r in d["rows"]:
        g, m, t = r[i_g], str(r[i_m])[:7], float(r[i_t] or 0)
        out.setdefault(g, {})[m] = out.setdefault(g, {}).get(m, 0.0) + t
    return {"months": out, "file": f.name, "url": d.get("url"), "retrieved": d.get("retrieved")}


def psd_grain() -> dict[int, float]:
    """Russia's grain exports (wheat + barley + corn, kt) by calendar year: half of the marketing year that ends in it
    and half of the one that starts in it (USDA PSD)."""
    f = max(RAW.glob("usda_psd_russia_grain_exports_*.json"))
    my: dict[int, float] = {}
    for _c, y, v in json.loads(f.read_text())["rows"]:
        my[y] = my.get(y, 0.0) + v
    return {y: 0.5 * my[y - 1] + 0.5 * my[y] for y in my if y - 1 in my}


def matched_index(T: Totals, p: str, y: int) -> float:
    """BACI's war-time data are mirror data: importers that stop reporting drop out of Russia's total (Iran, Libya,
    Sudan, Bangladesh and Algeria for cereals). Value index over the importers present in both 2021 and y (any group),
    divided by Russia's own unit-value index of the group."""
    both = set(T.part[2021]) & set(T.part[y])
    a = sum(T.part[2021][i][p] for i in both)
    b = sum(T.part[y][i][p] for i in both)
    uv = T.own_uv_index(p, list(range(2021, y + 1)))
    return b / a / uv[y] if a else 1.0


def wartime_index(T: Totals, crea: dict) -> dict:
    """Russia's total export volume by product, 2021 = 1, 2021-2026: as used (see notes) and the alternatives."""
    cm = crea["months"]

    def crea_ratio(g: str, y: int, ref: int) -> tuple[float | None, int]:
        ms = [
            f"{y}-{m:02d}"
            for m in range(1, 13)
            if f"{y}-{m:02d}" in cm.get(g, {}) and f"{ref}-{m:02d}" in cm.get(g, {})
        ]
        if y == 2026:  # October 2026 is partial in the extract (to 22 October)
            ms = [m for m in ms if m <= "2026-09"]
        den = sum(cm[g][f"{ref}-{m[5:]}"] for m in ms)
        return (sum(cm[g][m] for m in ms) / den if den and len(ms) >= 6 else None), len(ms)

    baci_raw: dict[str, dict[int, float]] = {}
    for p in ("crude", "products", "coal", "gas"):
        baci_raw[p] = {y: T.ton[p][y] / T.ton[p][2021] for y in (2021, 2022, 2023, 2024)}
    yrs = list(range(2021, 2025))
    for p in ("cereal", "fert", "metal", "other"):
        vi = T.own_volume_index(p, yrs)
        baci_raw[p] = {y: vi[y] for y in yrs}
    used: dict[str, dict[int, float]] = {}
    src: dict[str, str] = {}
    # crude: CREA's tracked volumes from 2022 (pipeline crude is in CREA only from January 2022: Dec 2021 16.6 Mt,
    # Jan 2022 23.0 Mt), 2021 from Russia's own customs report (UN Comtrade, HS 2709 net weight)
    cy = {y: sum(v for m, v in cm[CREA_GROUP["crude"]].items() if m.startswith(str(y))) for y in range(2022, 2026)}
    c21 = T.rep_ton.get("crude", {}).get(2021) / 1000  # kg -> tonnes
    used["crude"] = {2021: 1.0} | {y: cy[y] / c21 for y in range(2022, 2026)}
    r26, n26 = crea_ratio(CREA_GROUP["crude"], 2026, 2025)
    used["crude"][2026] = used["crude"][2025] * (r26 or 1.0)
    src["crude"] = (
        f"2021: Russia's customs report, HS 2709, {c21 / 1e6:.1f} Mt (UN Comtrade); 2022-2025: CREA tracked volumes "
        f"(seaborne and pipeline); 2026: {n26} months of CREA on the same months of 2025"
    )
    for p in ("products", "coal"):
        g = CREA_GROUP[p]
        used[p] = {2021: 1.0}
        for y in range(2022, 2027):
            r, _n = crea_ratio(g, y, y - 1)
            used[p][y] = used[p][y - 1] * (r or 1.0)
        src[p] = "CREA tracked volumes, each year on the same months of the year before (2026: 9 months)"
    used["products_observed"] = dict(used["products"])
    for y in (2024, 2025, 2026):  # refinery strikes and export bans from 2024: held at 2023 (RULE war_time_totals)
        used["products"][y] = used["products"][2023]
    src["products"] += "; held at 2023 from 2024 (refinery strikes, export bans)"
    gr = psd_grain()
    used["cereal"] = {y: gr[y] / gr[2021] for y in YEARS if y in gr}
    src["cereal"] = (
        "USDA PSD, Russia's wheat + barley + corn exports, calendar years as the mean of two marketing years"
    )
    for p in ("fert", "metal", "other"):
        used[p] = {2021: 1.0} | {y: matched_index(T, p, y) for y in (2022, 2023, 2024)}
        used[p][2025] = used[p][2026] = used[p][2024]
        src[p] = (
            "BACI (mirror data), importers present in both 2021 and the year, over Russia's own unit-value index; "
            "2025-2026 held at 2024"
        )
    used["gas"] = baci_raw["gas"] | {2025: baci_raw["gas"][2024], 2026: baci_raw["gas"][2024]}
    src["gas"] = "not used (current method); BACI tonnes, mostly LNG"
    check = {}
    for p in ("crude", "products", "coal"):
        check[p] = {
            f"{y}/{y - 1}": {
                "BACI": round(T.ton[p][y] / T.ton[p][y - 1], 3),
                "CREA": round(crea_ratio(CREA_GROUP[p], y, y - 1)[0] or 0, 3),
            }
            for y in (2022, 2023, 2024)
        }
    return {
        "used": used,
        "source": src,
        "baci_raw_index": baci_raw,
        "baci_vs_crea_year_on_year": check,
        "note": "BACI's war-time totals are mirror data and miss importers that stopped reporting; they were the "
        "pre-registered source and are kept here for comparison (baci_raw_index)",
    }


def wartime_trend(T: Totals) -> dict:
    """SUPT's no-war total: Russia's own 2011-2021 log-linear trend (real), 2021 = 1."""
    out = {}
    for p in CANDIDATES:
        b = trend_total(T, p, 2021, 2021)
        if b:
            out[p] = {y: trend_total(T, p, 2021, y) / b for y in YEARS}
    return out


def product_weights(iso: str, prices: dict, e2: dict, B: Baci) -> tuple[float, dict[str, float], str]:
    """Pre-war mix of purchases from Russia (copied from round 48)."""
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
    return fs, w, src


def chart_rows(recs: list[dict], data: str, models=("CUR", "M0", "SUP", "SUPT", "D", "COMB")) -> list[list]:
    out = []
    for p in sorted({c["p"] for c in recs}):
        for s in (*SIZES, "all"):
            rows = [c for c in recs if c["p"] == p and (s == "all" or c["size"] == s) and c["o"] <= 2016]
            for o, cell in acc_by_origin(rows, models).items():
                for m in models:
                    if m in cell:
                        out.append([data, p, s, o, m, cell["n"], cell[m]["err"], cell[m].get("gain")])
    return out


# --------------------------------------------------------------------------------------------------------------------
# run
# --------------------------------------------------------------------------------------------------------------------


def run() -> None:
    t0 = time.time()
    B = Baci()
    T = Totals(B)
    oil_real, oil_exp = oil_paths()
    ea = eurostat_annual(load_eurostat())
    csz = country_sizes(B)
    r47 = json.loads((GAPS / "cf_models_r47.json").read_text())["bias_correction_small"]["median_cumulative_log_error"]
    E = Errors(r47)
    pr = baci_preds(B, T, csz, oil_real, oil_exp)
    er = eurostat_preds(ea, B, T, csz, oil_real, oil_exp)
    print("records", len(pr), len(er), round(time.time() - t0, 1), file=sys.stderr)
    comp = composite_cases(pr, B, {})
    bias_meas = {cut: E.set_bias(cut, comp) for cut in (2016, 2008, 2013)}
    for recs in (pr, er):
        for r in recs:
            r["e"] = E.errs(r, 2016)
            r["e_plc"] = {name: E.errs(r, last) for name, (_, _, last) in PLACEBOS.items()}
    print("errors", round(time.time() - t0, 1), file=sys.stderr)

    # ---- the rule, per product x size class, on each data set (SUP; SUPT secondary; diagnostics reported)
    cells_b = [r for r in pr if r["cell_ok"] and r["size"]]

    # ---- how much of flat's error is Russia's own total? (M/L countries, H5; flat error = total change + share drift)
    decomp = {}
    for p in (*CANDIDATES, "all", "all_L"):
        rows = [
            c
            for c in cells_b
            if (p in ("all", "all_L") or c["p"] == p)
            and c["csize"] != "S"
            and c["o"] <= 2016
            and (p != "all_L" or c["size"] == "L")
        ]
        ef = np.array([c["e"]["M0"]["H5"] for c in rows if "H5" in c["e"]["M0"] and "H5" in c["e"]["SUP"]])
        es = np.array([c["e"]["SUP"]["H5"] for c in rows if "H5" in c["e"]["M0"] and "H5" in c["e"]["SUP"]])
        if len(ef) < 10:
            continue
        et = ef - es  # log change of Russia's total (cumulative, H5)
        decomp[p] = {
            "n": len(ef),
            "median_abs_flat_error": round(float(np.median(np.abs(ef))), 3),
            "median_abs_total_change": round(float(np.median(np.abs(et))), 3),
            "median_abs_share_drift": round(float(np.median(np.abs(es))), 3),
            "var_flat": round(float(np.var(ef)), 4),
            "var_total": round(float(np.var(et)), 4),
            "var_share": round(float(np.var(es)), 4),
            "corr_total_share": round(float(np.corrcoef(et, es)[0, 1]), 3),
            "share_of_flat_variance_explained_by_total": round(float(1 - np.var(es) / np.var(ef)), 3),
        }
    verdict: dict = {}
    for model in ("SUP", "SUPT", "COMB", "SUPrep", "SUPq"):
        verdict[model] = {"BACI": {}, "Eurostat_origin_volumes": {}}
        for name, cases, prods in (("BACI", cells_b, CANDIDATES), ("Eurostat_origin_volumes", er, FUELS)):
            for p in prods:
                if model == "SUPq" and (p not in FUELS or name != "BACI"):
                    continue
                pooled = [c for c in cases if c["p"] == p and model in c["e"] and c["e"][model]]
                for s in SIZES:
                    rows = [c for c in pooled if c["size"] == s]
                    if rows:
                        verdict[model][name][f"{p}/{s}"] = judge(rows, pooled, model)
    # SUP and D against plain flat (M0) and SUP against D, for information
    vs_other = {"BACI": {}, "Eurostat_origin_volumes": {}}
    for name, cases, prods in (("BACI", cells_b, CANDIDATES), ("Eurostat_origin_volumes", er, FUELS)):
        for p in prods:
            for s in SIZES:
                rows = [c for c in cases if c["p"] == p and c["size"] == s and c["o"] <= 2016]
                if not rows:
                    continue
                cell = {}
                for model, ref in (("SUP", "M0"), ("D", "M0"), ("SUP", "D"), ("D", "CUR"), ("M0", "CUR")):
                    acc = acc_by_origin(rows, (ref, model), ref)
                    g = [acc[o][model].get("gain") for o in acc if model in acc[o] and acc[o]["n"] >= 5]
                    g = [x for x in g if x is not None]
                    if g:
                        cell[f"{model}_vs_{ref}"] = {"origins_ge_15pct": sum(x >= RULE_GAIN for x in g), "of": len(g),
                                                     "worst": round(min(g), 3), "median": round(float(np.median(g)), 3)}  # fmt: skip
                vs_other[name][f"{p}/{s}"] = cell
    passed = {m: {n: sorted(k for k, v in d.items() if v["PASS"]) for n, d in v.items()} for m, v in verdict.items()}
    prop_model = "SUP"
    if not any(passed["SUP"].values()) and any(passed["SUPT"].values()):
        prop_model = "SUPT"
    eu_cov = set(ea)

    def accepted(p: str, size_p: str | None, iso: str, size_c: str | None = None, model: str = "SUP") -> bool:
        if p not in CANDIDATES or not size_p:
            return False
        if p in FUELS and iso in eu_cov:
            return f"{p}/{size_c or size_p}" in passed[model]["Eurostat_origin_volumes"]
        return f"{p}/{size_p}" in passed[model]["BACI"]

    # ---- country totals (composite): CUR against the model on passing / all-but-gas products
    comp_res: dict = {"by_size_pooled": {}, "by_size_origin": {}, "bands": {}, "placebo": {}}
    variants = {
        "PASS": ("SUP", lambda p, s, i: p in VALID_TOTAL and accepted(p, s, i, model=prop_model)),
        "DIAG": ("SUP", lambda p, s, i: p in DIAG_PRODUCTS),
        "SUPT_DIAG": ("SUPT", lambda p, s, i: p in DIAG_PRODUCTS),
        "D_ALL": ("D", lambda p, s, i: p in CANDIDATES),
        "COMB_DIAG": ("COMB", lambda p, s, i: p in DIAG_PRODUCTS),
        "M0": ("M0", lambda p, s, i: True),
    }
    for c in comp:
        c["e"] = {"CUR": comp_errs(c, E, "CUR", lambda p, s, i: False)}
        c["e_plc"] = {}
        for v, (mod, act) in variants.items():
            c["e"][v] = comp_errs(c, E, mod, act)
        for name, (_, _, last) in PLACEBOS.items():
            c["e_plc"][name] = {v: comp_errs(c, E, mod, act, last) for v, (mod, act) in variants.items()}
    vnames = ("CUR", *variants)
    rho: dict = {}
    for s in (*SIZES, "all"):
        rows = [c for c in comp if s == "all" or c["csize"] == s]
        comp_res["by_size_pooled"][s] = summary(rows, vnames)
        comp_res["by_size_origin"][s] = {
            str(o): {m: [v.get("err"), v.get("gain")] for m, v in cell.items() if m != "n"} | {"n": cell["n"]}
            for o, cell in acc_by_origin([c for c in rows if c["o"] <= 2016], vnames).items()
        }
        if s == "all":
            continue
        comp_res["bands"][s], rho[s] = {}, {}
        for m in vnames:
            comp_res["bands"][s][m] = {}
            for H in range(1, 6):
                b = band_of(rows, m, H)
                comp_res["bands"][s][m][f"H{H}"] = {
                    k: b.get(k) for k in ("band", "K", "n", "log_width", "era_coverage")
                }
                b0 = band_of(rows, "CUR", H)
                if m != "CUR" and "log_lo" in b and "log_lo" in b0:
                    rho[s].setdefault(m, {})[H] = (b["log_lo"] / b0["log_lo"], b["log_hi"] / b0["log_hi"])
            comp_res["placebo"].setdefault(s, {})[m] = placebo_cov(rows, m, band_of(rows, m, 5).get("K", 1.0))
    comp_res["band_ratio_vs_CUR_log_lo_hi"] = {
        s: {m: {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in d.items()} for m, d in v.items()}
        for s, v in rho.items()
    }
    print("composite", round(time.time() - t0, 1), file=sys.stderr)

    # ---- war-time totals and the application to the site's current data
    crea = crea_volumes()
    wt = wartime_index(T, crea)
    wtt = wartime_trend(T)
    site = Path(arg("--site") or ROOT / "site")
    D = json.loads((site / "data.json").read_text())
    nwi = json.loads((GAPS / "energy_nowar.json").read_text())["nowar_index"]
    prices = json.loads((GAPS / "prices.json").read_text())["countries"]
    e2 = json.loads((GAPS / "energy2.json").read_text())["fuel_mix_2019_2021"]
    sup_mult = E.mult[2016]["SUP"]
    patch: dict = {"proposal": {}, "diagnostic": {}}
    per_country = {}
    for iso, c in sorted(D["countries"].items()):
        tr = c.get("to_rus")
        if not tr or not tr.get("base") or not tr.get("bmul"):
            continue
        base = tr["base"]
        size_c = size_of(base * 1e9)
        fs, w, wsrc = product_weights(iso, prices, e2, B)
        bias = tr.get("bias_mult") or [1.0] * 6
        cur = tr.get("cur") or [1.0] * 6
        nwp = {}
        for p in w:
            if p in FUELS or p == "fuel_rest":
                bb = NW_BENCH.get(p) or ("ttf" if iso in GAS_EUROPE else "jkm")
                nwp[p] = [1.0] + [nwi[bb][str(y)]["actual" if y >= 2026 else "central"] for y in YEARS[1:]]
            else:
                nwp[p] = [1.0] * 6
        sizes_p = {p: size_of(base * 1e9 * v) if base * v >= MIN_EUR / 1e9 else None for p, v in w.items()}
        row = {
            "size": size_c,
            "base_eur_bn": base,
            "fuel_share": round(fs, 3),
            "weights": {p: round(v, 4) for p, v in w.items() if v},
            "weights_source": wsrc,
            "product_size": {p: s for p, s in sizes_p.items() if s},
            "hub": iso in HUBS,
        }
        for var in ("proposal", "diagnostic"):
            if iso in HUBS:
                row[var] = {"active": [], "changed": False, "why": "hub: current method"}
                continue
            if var == "proposal":
                act = {
                    p
                    for p in w
                    if size_c != "S" and p in VALID_TOTAL and accepted(p, sizes_p[p], iso, size_c, prop_model)
                }
            else:
                act = {p for p in w if p in DIAG_PRODUCTS and w[p] > 0}
            idx_src = wt["used"] if prop_model == "SUP" or var == "diagnostic" else wtt
            F = [1.0]
            for i in range(1, 6):
                y = YEARS[i]
                den = sum(w[p] * nwp[p][i] for p in w) or 1.0
                num = 0.0
                for p in w:
                    if p in act:
                        own = sup_mult[i - 1] if size_c == "S" and tr.get("bias_mult") else 1.0
                        num += w[p] * nwp[p][i] * idx_src[p][y] * own / bias[i]
                    else:
                        num += w[p] * nwp[p][i]
                F.append(num / den)
            if not act:
                row[var] = {"active": [], "changed": False}
                continue
            q0, ql0, qh0 = tr["bmul"], tr.get("bmul_lo") or tr["bmul"], tr.get("bmul_hi") or tr["bmul"]
            bm = [round(q0[i] * F[i], 4) for i in range(6)]
            r = rho.get(size_c, {}).get("PASS" if var == "proposal" else "DIAG", {})
            r1 = r.get(1, (1.0, 1.0))
            bl = [1.0] + [round(bm[i] * max(0.05, 1 - (1 - ql0[i] / q0[i]) * r1[0]), 4) for i in range(1, 6)]
            bh = [1.0] + [round(bm[i] * (1 + (qh0[i] / q0[i] - 1) * r1[1]), 4) for i in range(1, 6)]
            cb = [None]
            for n in range(1, 6):
                lo, hi = (tr.get("cb") or [None] * 6)[n] or [ql0[n] / q0[n], qh0[n] / q0[n]]
                rr = r.get(n, (1.0, 1.0))
                cb.append([round(max(0.05, 1 - (1 - lo) * rr[0]), 4), round(1 + (hi - 1) * rr[1], 4)])
            patch[var][iso] = {"bmul": bm, "bmul_lo": bl, "bmul_hi": bh, "cb": cb}
            E5 = [base * FRAC[i] * cur[i] for i in range(6)]
            row[var] = {
                "active": sorted(act),
                "changed": True,
                "F": [round(x, 4) for x in F],
                "band_ratio_used_H1_H5": {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in r.items()},
                "nowar_2022_2026_eur_bn_before_after": [
                    round(sum(E5[i] * q0[i] for i in range(1, 6)), 4),
                    round(sum(E5[i] * bm[i] for i in range(1, 6)), 4),
                ],
            }
        per_country[iso] = row
    SCRATCH.mkdir(parents=True, exist_ok=True)
    (SCRATCH / "site_patch_r49.json").write_text(json.dumps(patch))
    print("application", len(per_country), round(time.time() - t0, 1), file=sys.stderr)

    # ---- check: round 48's D reproduced on the same cases (D against M0, BACI cells)
    r48 = None
    f48 = GAPS / "demand_cf_r48.json"
    alt = Path(arg("--r48json") or "")
    for f in (f48, alt):
        if f and f.is_file():
            r48 = json.loads(f.read_text())
            break
    repro = {}
    if r48:
        for key in ("crude/L", "gas/M", "other/L", "fert/M", "coal/L"):
            v = r48["verdict_by_cell"]["BACI"].get(key)
            p, s = key.split("/")
            rows = [c for c in cells_b if c["p"] == p and c["size"] == s and c["o"] <= 2016]
            acc = acc_by_origin(rows, ("M0", "D"), "M0")
            g = [acc[o]["D"]["gain"] for o in acc if "gain" in acc[o].get("D", {}) and acc[o]["n"] >= 5]
            if v:
                repro[key] = {"r48_median_gain": v.get("median_gain"), "here": round(float(np.median(g)), 3) if g else None,
                              "r48_n": v.get("n_cases"), "here_n": len(rows)}  # fmt: skip

    def tot_series(p):
        return {str(y): round(T.val[p].get(y, 0) / 1e9, 2) for y in range(2001, 2025) if T.val[p].get(y)}

    out = {
        "generated": time.strftime("%Y-%m-%d"),
        "round": 49,
        "status": "research; nothing here is read by the build. Site figures computed on site/data.json of 2026-10-25 "
        "(round 47 live)",
        "question": "Does a supply-side allocation model (Russia's actual total exports of each product x the country's "
        "pre-war share) predict purchases from Russia better than the current site rule?",
        "rule": RULE,
        "proposal_model": prop_model,
        "verdict_by_cell": verdict,
        "passed_cells": passed,
        "comparisons_by_cell": vs_other,
        "summary_by_product_size": {
            "BACI": {
                p: {
                    s: summary([c for c in cells_b if c["p"] == p and (s == "all" or c["size"] == s)], MODELS)
                    for s in (*SIZES, "all")
                }
                for p in CANDIDATES
            },
            "Eurostat_origin_volumes": {
                p: {
                    s: summary([c for c in er if c["p"] == p and (s == "all" or c["size"] == s)], MODELS)
                    for s in (*SIZES, "all")
                }
                for p in FUELS
            },
        },
        "chart_rows": {
            "columns": ["data", "product", "size", "origin", "model", "n", "error", "gain_vs_CUR"],
            "rows": chart_rows(cells_b, "BACI") + chart_rows(er, "Eurostat_origin_volumes"),
        },
        "composite_country_total": comp_res,
        "error_decomposition_H5": decomp,
        "small_country_bias": {
            "cumulative_log_error_by_cut": {str(k): v for k, v in bias_meas.items()},
            "yearly_multipliers_used": {
                str(k): {m: [round(x, 4) for x in v] for m, v in d.items()} for k, d in E.mult.items()
            },
            "round47_published": r47,
        },
        "russia_totals_usd_bn_baci": {p: tot_series(p) for p in PRODUCTS},
        "russia_totals_usd_bn_reported": {
            p: {str(y): round(v / 1e9, 2) for y, v in T.rep[p].items()} for p in PRODUCTS
        },
        "russia_fuel_tonnes_mt_baci": {p: {str(y): round(v / 1e6, 1) for y, v in T.ton[p].items()} for p in FUELS},
        "wartime_total_index": wt,
        "wartime_trend_index_SUPT": {p: {str(y): round(v, 4) for y, v in d.items()} for p, d in wtt.items()},
        "crea_source": {k: crea[k] for k in ("file", "url", "retrieved")},
        "per_country": per_country,
        "r48_reproduction_check": repro,
        "eurostat_total_basis": {f"{c['iso']}/{c['p']}": c["basis"] for c in er if c["o"] == 2016},
    }
    prev = GAPS / "supply_cf_r49.json"
    if prev.exists():
        old = json.loads(prev.read_text())
        for k in ("site_before_after", "site_before_after_summary"):
            if k in old:
                out[k] = old[k]
    prev.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("written", round(time.time() - t0, 1), file=sys.stderr)


def merge(path: str) -> None:
    res = json.loads(Path(path).read_text())
    f = GAPS / "supply_cf_r49.json"
    out = json.loads(f.read_text())
    out["site_before_after"] = res["countries"]
    out["site_before_after_summary"] = res["summary"]
    f.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    cmd = sys.argv[1:2]
    if cmd == ["fetch"]:
        fetch()
    elif cmd == ["run"]:
        run()
    elif cmd == ["merge"]:
        merge(sys.argv[2])
    else:
        print(__doc__)
