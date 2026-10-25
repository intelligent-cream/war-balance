"""Round 47 (owner: "I think we can make better prediction models"): new CENTRE models for the no-war level of purchases
from Russia ("paid to Russia", to_rus) and, secondarily, sales to Russia (from_rus), tested against "2021 held flat"
with the project's rule, using only information available at the forecast origin.

  python3 -I research/2026-10/scripts/cf_models_r47.py fetch   # downloads (untrusted data), writes small extracts
  python3 -I research/2026-10/scripts/cf_models_r47.py run     # back-tests, writes gaps/cf_models_r47.json

fetch writes to research/2026-10/raw/cf_models_r47/ (source URL and date in each file):
  imts_monthly_rus_2003_2018.json.gz  IMF IMTS monthly, every reporter's imports from Russia (MG_CIF_USD) and exports to
                                      Russia (XG_FOB_USD), 2003-01..2018-12 (2019+ is in raw/imf_imts/)
  weo_country_vintages.json.gz        IMF WEO vintages via DBnomics (IMF/WEO:<vintage>): real GDP growth (NGDP_RPCH) of
                                      every country, and import volume (TM_RPCH) / Russia's export volume (TX_RPCH) where
                                      the vintage has them (2011-04 onward)
  baci_rus_imports_by_exporter_2001_2021.json.gz  CEPII BACI HS92 via the OEC API: Russia's imports from each exporter
                                      (total, USD), for sales to Russia
  brent_monthly.json                  FRED POILBREUSDM (IMF primary commodity prices), monthly Brent USD/bbl

run reads only committed raw files (raw/oec_baci_r44/*, raw/imf_imts/*, raw/cf_models_r47/*, gaps/counterfactual.json,
gaps/cf_bands.json, site/data.json read only) and writes research/2026-10/gaps/cf_models_r47.json.
"""

import csv
import gzip
import io
import json
import math
import statistics
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

import numpy as np

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw"
OWN = RAW / "cf_models_r47"
GAPS = R / "gaps"
OUT = GAPS / "cf_models_r47.json"

YEARS = list(range(2001, 2022))
GROUPS = ("fuel", "cereal", "fert", "metal", "other")
ORIGINS = list(range(2005, 2017))  # rolling origins as round 44
TESTS = (2007, 2012, 2016)  # the three classic back-tests (data to 2007, 2012, 2016)
SHOCK_ORIGIN = 2013  # forecasting 2014-2018: the Russia-side shock (oil halved, rouble, food ban)
W5 = (1.0, 1.0, 1.0, 1.0, 8 / 12)  # the site's H5: 2026 counts 8 of 12 months
EXCLUDE = {"UKR", "BLR", "RUS"}
MIN_EUR = 0.01e9
RULE_GAIN = 0.15
ERAS = {"2005-09": range(2005, 2010), "2010-12": range(2010, 2013), "2013-16": range(2013, 2017)}
WEO_VINTAGES = ["2008-04", "2008-10", "2009-10", "2010-10", "2011-04"] + [f"{y}-10" for y in range(2012, 2022)]
SEED = 47

# coarse regions for the pooled-trend cells (Asia-Pacific is the default)
REGIONS = {
    "Europe": "ALB AND AUT BEL BGR BIH CHE CYP CZE DEU DNK ESP EST FIN FRA FRO GBR GIB GRC GRL HRV HUN IRL ISL ITA LIE "
    "LTU LUX LVA MCO MDA MKD MLT MNE NLD NOR POL PRT ROU SMR SRB SVK SVN SWE TUR VAT XKX",
    "CIS": "ARM AZE GEO KAZ KGZ TJK TKM UZB MNG",
    "MENA": "ARE BHR DZA EGY IRN IRQ ISR JOR KWT LBN LBY MAR OMN PSE QAT SAU SDN SYR TUN YEM",
    "SSA": "AGO BDI BEN BFA BWA CAF CIV CMR COD COG COM CPV DJI ERI ETH GAB GHA GIN GMB GNB GNQ KEN LBR LSO MDG MLI MOZ "
    "MRT MUS MWI NAM NER NGA RWA SEN SLE SOM SSD STP SWZ SYC TCD TGO TZA UGA ZAF ZMB ZWE ESH SHN",
    "Americas": "ABW AIA ARG ATG BHS BLZ BMU BOL BRA BRB CAN CHL COL CRI CUB CUW CYM DMA DOM ECU GRD GTM GUY HND HTI JAM "
    "KNA LCA MEX MSR NIC PAN PER PRY SLV SUR TCA TTO URY USA VCT VEN VGB SXM SPM BES",
}
REGION_OF = {iso: r for r, s in REGIONS.items() for iso in s.split()}


def region(iso: str) -> str:
    return REGION_OF.get(iso, "AsiaPac")


# ---------------------------------------------------------------------------------------------------------------
# fetch
# ---------------------------------------------------------------------------------------------------------------
def get(url: str, tries: int = 4, accept: str = "*/*") -> bytes:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0", "Accept": accept})
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except Exception as e:  # network retry
            if i == tries - 1:
                raise
            print("retry", url[:140], e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise RuntimeError


def fetch() -> None:
    OWN.mkdir(parents=True, exist_ok=True)
    today = time.strftime("%Y-%m-%d")
    # IMF IMTS monthly
    imts_url = (
        "https://api.imf.org/external/sdmx/2.1/data/IMF.STA,IMTS/.{ind}.RUS.M?startPeriod={y}-01&endPeriod={y}-12"
    )
    rows = []
    for y in range(2003, 2019):
        for ind in ("MG_CIF_USD", "XG_FOB_USD"):
            txt = get(imts_url.format(ind=ind, y=y), accept="application/vnd.sdmx.data+csv;version=1.0.0").decode()
            for r in csv.DictReader(io.StringIO(txt)):
                if r["OBS_VALUE"] not in ("", None) and r["COUNTERPART_COUNTRY"] == "RUS":
                    rows.append([r["COUNTRY"], ind, r["TIME_PERIOD"], float(r["OBS_VALUE"]), r["SCALE"]])
        print("imts", y, len(rows), file=sys.stderr)
    with gzip.open(OWN / "imts_monthly_rus_2003_2018.json.gz", "wt") as fh:
        json.dump(
            {
                "source": "IMF International Trade in Goods (IMTS), SDMX 2.1 API",
                "url": imts_url.replace("{ind}", "MG_CIF_USD+XG_FOB_USD").replace("{y}", "<year>"),
                "retrieved": today,
                "what": "monthly imports from Russia (MG_CIF_USD) and exports to Russia (XG_FOB_USD) as reported by each "
                "country, USD (OBS_VALUE x 10^SCALE as in the IMF file; only ratios within a country are used)",
                "columns": ["country", "indicator", "period", "value", "scale"],
                "rows": rows,
            },
            fh,
        )
    # WEO country vintages
    countries = sorted(
        json.loads(get("https://api.db.nomics.world/v22/datasets/IMF/WEO:2021-10"))["datasets"]["docs"][0][
            "dimensions_values_labels"
        ]["weo-country"]
    )
    weo = {}
    for v in WEO_VINTAGES:
        weo[v] = {}
        unit = "annual_pcent_change" if v < "2010-10" else "pcent_change"
        ids = [f"IMF/WEO:{v}/{c}.NGDP_RPCH.{unit}" for c in countries]
        ids += [f"IMF/WEO:{v}/{c}.TM_RPCH.{unit}" for c in countries]
        ids += [f"IMF/WEO:{v}/RUS.TX_RPCH.{unit}", f"IMF/WEO:{v}/RUS.TXG_RPCH.{unit}"]
        for i in range(0, len(ids), 50):
            url = "https://api.db.nomics.world/v22/series?observations=1&limit=1000&series_ids=" + urllib.parse.quote(
                ",".join(ids[i : i + 50]), safe="/:,"
            )
            for doc in json.loads(get(url))["series"]["docs"]:
                c, subj = doc["series_code"].split(".")[:2]
                weo[v].setdefault(subj, {})[c] = {
                    p: x for p, x in zip(doc["period"], doc["value"]) if isinstance(x, (int, float))
                }
        print("weo", v, {k: len(x) for k, x in weo[v].items()}, file=sys.stderr)
    with gzip.open(OWN / "weo_country_vintages.json.gz", "wt") as fh:
        json.dump(
            {
                "source": "IMF World Economic Outlook vintages via DBnomics (provider IMF, dataset WEO:<vintage>)",
                "url": "https://api.db.nomics.world/v22/series?series_ids=IMF/WEO:<vintage>/<ISO3>.<subject>.<unit>",
                "retrieved": today,
                "what": "NGDP_RPCH real GDP growth (%), TM_RPCH import volume growth of goods and services (%), "
                "TX_RPCH/TXG_RPCH Russia's export volume growth (%); history and forecasts as published in each vintage. "
                "Vintages before 2011-04 carry no trade volumes by country on DBnomics; 2011-10 is missing (2011-04 used)",
                "vintages": weo,
            },
            fh,
        )
    # BACI Russia's imports by exporter
    oec = "https://oec.world/api/olap-proxy/data.jsonrecords"
    brows = []
    for y in YEARS:
        p = {
            "cube": "trade_i_baci_a_92",
            "drilldowns": "Year,Exporter Country",
            "measures": "Trade Value",
            "Importer Country": "eurus",
            "Year": y,
        }
        for r in json.loads(get(oec + "?" + urllib.parse.urlencode(p)))["data"]:
            iso = str(r["Exporter Country ID"])[-3:].upper()
            v = float(r["Trade Value"] or 0)
            if v > 0 and iso.isalpha():
                brows.append([y, iso, round(v)])
    with gzip.open(OWN / "baci_rus_imports_by_exporter_2001_2021.json.gz", "wt") as fh:
        json.dump(
            {
                "source": "CEPII BACI HS92 (1995-2024 release) via the OEC API, no key; licence Etalab 2.0",
                "url": oec + "?cube=trade_i_baci_a_92&drilldowns=Year,Exporter+Country&Importer+Country=eurus",
                "retrieved": today,
                "what": "Russia's imports (BACI reconciled value, USD) from each exporter, all goods",
                "columns": ["year", "exporter_iso3", "usd"],
                "rows": brows,
            },
            fh,
        )
    txt = get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=POILBREUSDM").decode()
    brent = {
        ln.split(",")[0][:7]: float(ln.split(",")[1])
        for ln in txt.splitlines()[1:]
        if ln.count(",") == 1 and ln.split(",")[1] not in ("", ".") and "2002" < ln[:4] < "2023"
    }
    (OWN / "brent_monthly.json").write_text(
        json.dumps(
            {
                "source": "FRED POILBREUSDM (IMF Primary Commodity Prices, Brent, USD/bbl, monthly)",
                "url": "https://fred.stlouisfed.org/graph/fredgraph.csv?id=POILBREUSDM",
                "retrieved": today,
                "series": brent,
            }
        )
    )


# ---------------------------------------------------------------------------------------------------------------
# inputs
# ---------------------------------------------------------------------------------------------------------------
def group_of(hs2: int) -> str:
    return {27: "fuel", 10: "cereal", 31: "fert"}.get(hs2, "metal" if 72 <= hs2 <= 76 else "other")


def load_json(p: Path):
    return json.loads(gzip.decompress(p.read_bytes()) if p.suffix == ".gz" else p.read_text())


def load_inputs():
    """BACI to_rus by group (as product_cf_r44.py), group price indices, from_rus totals, monthly IMTS, WEO, Brent."""
    baci = load_json(RAW / "oec_baci_r44" / "rus_exports_partner_hs2_2001_2021.json.gz")
    nom: dict[str, dict[int, dict[str, float]]] = {}
    for y, iso, hs2, v in baci["rows"]:
        g = nom.setdefault(iso, {}).setdefault(y, dict.fromkeys(GROUPS, 0.0))
        g[group_of(hs2)] += v
    q = load_json(RAW / "oec_baci_r44" / "rus_exports_world_hs4q_2001_2021.json.gz")
    uv: dict[str, dict[int, dict[int, tuple[float, float]]]] = {}
    for y, hs4, v, t in q["rows"]:
        if v > 0 and t > 0:
            uv.setdefault(group_of(hs4 // 100), {}).setdefault(y, {})[hs4] = (v, t)
    prices = {}
    for g, by in uv.items():  # chained Fisher unit-value index (as product_cf_r44.py)
        idx = {YEARS[0]: 1.0}
        for y in YEARS[1:]:
            a, b = by.get(y - 1, {}), by.get(y, {})
            nl = dl = np_ = dp = 0.0
            for k in set(a) & set(b):
                p0, p1 = a[k][0] / a[k][1], b[k][0] / b[k][1]
                if not 0.25 <= p1 / p0 <= 4:
                    continue
                nl += p1 * a[k][1]
                dl += a[k][0]
                np_ += b[k][0]
                dp += p0 * b[k][1]
            idx[y] = idx[y - 1] * math.sqrt((nl / dl) * (np_ / dp))
        prices[g] = idx
    fred = load_json(RAW / "oec_baci_r44" / "fred.json")["series"]
    prices["other"] = {
        y: statistics.mean(v for k, v in fred["IREXFUELS"].items() if k.startswith(f"{y}-")) for y in YEARS
    }
    usd_per_eur = {int(k[:4]): v for k, v in fred["AEXUSEU"].items()}
    imp = load_json(OWN / "baci_rus_imports_by_exporter_2001_2021.json.gz")
    sales: dict[str, dict[int, float]] = {}
    for y, iso, v in imp["rows"]:
        sales.setdefault(iso, {})[y] = sales.get(iso, {}).get(y, 0.0) + v
    # monthly own reports: (country, indicator) -> {"YYYY-MM": usd}
    monthly: dict[tuple[str, str], dict[str, float]] = {}
    m1 = load_json(OWN / "imts_monthly_rus_2003_2018.json.gz")
    for c, ind, per, v, sc in m1["rows"]:
        monthly.setdefault((c, ind), {})[per.replace("-M", "-")] = v * 10 ** int(sc or 0)
    m2 = load_json(RAW / "imf_imts" / "IMTS_RUS_UKR_2026-10-23.json.gz")
    ci = {c: i for i, c in enumerate(m2["columns"])}
    for r in m2["rows"]:
        if r[ci["FREQUENCY"]] == "M" and r[ci["COUNTERPART_COUNTRY"]] == "RUS" and r[ci["OBS_VALUE"]] not in ("", None):
            per = r[ci["TIME_PERIOD"]].replace("-M", "-")
            monthly.setdefault((r[ci["COUNTRY"]], r[ci["INDICATOR"]]), {})[per] = float(r[ci["OBS_VALUE"]]) * 10 ** int(
                r[ci["SCALE"]] or 0
            )
    weo = load_json(OWN / "weo_country_vintages.json.gz")["vintages"]
    brent = load_json(OWN / "brent_monthly.json")["series"]
    return nom, prices, usd_per_eur, sales, monthly, weo, brent


# ---------------------------------------------------------------------------------------------------------------
# cases: one per country, flow and origin
# ---------------------------------------------------------------------------------------------------------------
def make_series(nom, prices, sales):
    """Real annual series per flow at fixed 2021 prices (for trends), plus per-origin-price totals for targets.
    to_rus: groups deflated by their indices; from_rus: total deflated by US import prices excluding fuels."""
    to_rus = {}
    for iso, by in nom.items():
        if iso in EXCLUDE:
            continue
        to_rus[iso] = {
            "groups": by,
            "fuel_share": {y: by[y]["fuel"] / sum(by[y].values()) if sum(by[y].values()) > 0 else 0.0 for y in by},
        }
    from_rus = {}
    for iso, by in sales.items():
        if iso in EXCLUDE:
            continue
        from_rus[iso] = {"total": by}
    return to_rus, from_rus


def real_at(flow: str, d: dict, prices, y: int, base: int) -> float:
    if y not in prices["other"]:  # after 2021: no data (2022-2026 paths need only the levels to 2021)
        return 0.0
    if flow == "to_rus":
        g = d["groups"].get(y)
        if not g:
            return 0.0
        return sum(g[k] * prices[k][base] / prices[k][y] for k in GROUPS)
    v = d["total"].get(y, 0.0)
    return v * prices["other"][base] / prices["other"][y]


def nominal(flow: str, d: dict, y: int) -> float:
    if flow == "to_rus":
        return sum(d["groups"].get(y, {}).values())
    return d["total"].get(y, 0.0)


def size_of(flow, d, o, usd_per_eur):
    win = [o - 3, o - 2, o - 1, o]
    if any(nominal(flow, d, y) <= 0 for y in win):
        return None
    avg = sum(nominal(flow, d, y) / usd_per_eur[y] for y in win) / 4
    if avg < MIN_EUR:
        return None
    return "S" if avg < 0.1e9 else "M" if avg < 1e9 else "L"


def start_level(real: dict, o: int, rule: str, size: str) -> float:
    med = statistics.median([real[o - 2], real[o - 1], real[o]])
    if rule == "site":  # the map: 2019-2021 median under EUR 1bn a year (S, M), 2021 otherwise
        return med if size in ("S", "M") else real[o]
    if rule == "last":
        return real[o]
    return med


def own_trend(real_fixed: dict, o: int):
    """OLS slope of the log real level over o-3..o and its sampling variance."""
    ys = [real_fixed.get(y, 0.0) for y in range(o - 3, o + 1)]
    if any(v <= 0 for v in ys):
        return None
    ly = [math.log(v) for v in ys]
    xs = [-1.5, -0.5, 0.5, 1.5]
    b = sum(x * yv for x, yv in zip(xs, ly)) / 5.0
    a = sum(ly) / 4
    rss = sum((yv - a - b * x) ** 2 for x, yv in zip(xs, ly))
    return b, rss / 2 / 5.0


# ---------------------------------------------------------------------------------------------------------------
# model pieces
# ---------------------------------------------------------------------------------------------------------------
def trimmed_ls(X: np.ndarray, y: np.ndarray, lo: list[float], hi: list[float]) -> list[float]:
    """least squares without intercept, the 5% largest absolute residuals dropped once, coefficients clipped."""
    if len(y) < 30:
        return [0.0] * len(lo)
    b = np.linalg.lstsq(X, y, rcond=None)[0]
    r = np.abs(y - X @ b)
    keep = r <= np.quantile(r, 0.95)
    b = np.linalg.lstsq(X[keep], y[keep], rcond=None)[0]
    return [float(min(max(v, lo[i]), hi[i])) for i, v in enumerate(b)]


def vintage_for(o: int, weo: dict, april_after: bool = False) -> str | None:
    if f"{o}-10" in weo:
        return f"{o}-10"
    if f"{o}-04" in weo:
        return f"{o}-04"
    if april_after and f"{o + 1}-04" in weo:
        return f"{o + 1}-04"
    return None


def cum_growth(series: dict | None, a: int, b: int) -> float | None:
    """sum of log(1 + g/100) over years a+1..b from a WEO series (history and forecasts); missing later forecast years
    repeat the last growth."""
    if not series:
        return None
    acc, last = 0.0, None
    for t in range(a + 1, b + 1):
        g = series.get(str(t), last)
        if g is None:
            return None
        last = g
        acc += math.log1p(max(g, -90) / 100)
    return acc


def latest12_ratio(monthly: dict, key: tuple, o: int, fuel_share: float, brent: dict, mode: str) -> float | None:
    """latest-information base relative to calendar year o, in real terms (fuel part deflated by monthly Brent):
    mode '12': Feb o..Jan o+1 / Jan..Dec o; mode 'H2': 2 x Jul..Dec o / Jan..Dec o."""
    s = monthly.get(key)
    if not s:
        return None
    cal = [f"{o}-{m:02d}" for m in range(1, 13)]
    win = cal[1:] + [f"{o + 1}-01"] if mode == "12" else cal[6:]
    if any(s.get(p) is None or s.get(p) < 0 for p in cal + win):
        return None
    bavg = statistics.mean(brent[p] for p in cal)

    def real(p):
        defl = fuel_share * brent[p] / bavg + (1 - fuel_share)
        return s[p] / defl

    a = sum(real(p) for p in cal)
    if a <= 0:
        return None
    r = sum(real(p) for p in win) * (2 if mode == "H2" else 1) / a
    return r if 0.05 < r < 20 else None


MODELS = ("M0", "M0_last", "M0_med3", "MOM12", "MOMH2", "POOL", "POOLr", "FC", "FCm", "ENS")
CANDIDATES = ("M0_last", "M0_med3", "MOM12", "MOMH2", "POOL", "POOLr", "FC", "FCm", "ENS")
DESC = {
    "M0": "2021 held flat, the current method: origin-year level, or the median of the last three years for flows under "
    "EUR 1bn a year (S, M), as the map's small_flow_base",
    "M0_last": "start rule: the origin-year level for all sizes ('2021 held')",
    "M0_med3": "start rule: the median of the last three years for all sizes ('2019-2021 median')",
    "MOM12": "momentum: the latest 12 months before the forecast date (Feb of the origin year to Jan of the next; for "
    "2022: Feb 2021-Jan 2022) from the country's monthly IMF IMTS report, as a ratio to its calendar origin year (real: "
    "fuel share deflated by monthly Brent), applied to the origin-year level; M0 where months are missing",
    "MOMH2": "momentum: the second half of the origin year annualised, as MOM12",
    "POOL": "partial pooling: per-year growth = b1 * r_c * (own 4-year trend - pooled cell trend) + b2 * pooled cell "
    "trend, applied h years from the M0 start; r_c = tau^2 / (tau^2 + s_c^2) (James-Stein reliability of the own trend, "
    "tau^2 the between-country trend variance in the cell); cells = size class x fuel-heavy (fuel >= 50% of purchases); "
    "b1, b2 in [0, 1] fitted on pre-origin back-test pairs (origins >= 2004, targets <= origin)",
    "POOLr": "as POOL with cells = size class x region (6 regions; cells under 8 countries use the size class)",
    "FC": "forecast-driven: log growth = e1 * cumulative partner real GDP growth + e2 * cumulative Russian real GDP "
    "growth, both from the IMF WEO vintage of the origin year (October; 2011: April); e1, e2 in [0, 3] fitted on "
    "pre-origin pairs with that vintage's history; no vintage before 2008 (origins 2005-2007 fall back to M0)",
    "FCm": "as FC with partner import volume (TM_RPCH) and Russia's export volume (TX_RPCH) from the WEO vintage; "
    "from_rus: partner GDP and Russia's import volume; only vintages from 2011-04 have them (earlier origins use FC)",
    "ENS": "median of M0, POOL and FC, year by year",
}


class Fitted:
    """per-origin fitted pieces for one flow: cell trends, POOL coefficients, FC elasticities."""

    def __init__(self):
        self.pool: dict = {}
        self.fc: dict = {}


def build(flow, series, prices, usd_per_eur, monthly, weo, brent, origins, max_year=2021):
    """cases (country x origin) with the real target path at origin prices and every model's prediction."""
    rus_key = "TX_RPCH" if flow == "to_rus" else "TM_RPCH"
    ind = "MG_CIF_USD" if flow == "to_rus" else "XG_FOB_USD"
    fixed = {iso: {y: real_at(flow, d, prices, y, 2021) for y in YEARS} for iso, d in series.items()}
    info: dict[int, dict] = {}  # per origin: iso -> (size, trend, s2, cell keys, fuel share)
    for o in range(2004, max(origins) + 1):
        info[o] = {}
        for iso, d in series.items():
            sz = size_of(flow, d, o, usd_per_eur)
            tr = own_trend(fixed[iso], o)
            if sz and tr:
                fs = (
                    statistics.mean(d["fuel_share"].get(y, 0.0) for y in (o - 2, o - 1, o)) if flow == "to_rus" else 0.0
                )
                cell = (sz, "fuel" if fs >= 0.5 else "nonfuel") if flow == "to_rus" else (sz, region(iso))
                info[o][iso] = {"size": sz, "g": tr[0], "s2": tr[1], "cell": cell, "cellr": (sz, region(iso)), "fs": fs}
        for ck in ("cell", "cellr"):
            cells: dict = {}
            for iso, x in info[o].items():
                cells.setdefault(x[ck], []).append(iso)
            for _key, members in cells.items():
                if len(members) < 8:  # thin cell: pool by size class
                    members = [i for i in info[o] if info[o][i]["size"] == info[o][members[0]]["size"]]
                gs = [info[o][i]["g"] for i in members]
                mu = statistics.mean(gs)
                tau2 = max(statistics.pvariance(gs) - statistics.mean(info[o][i]["s2"] for i in members), 1e-4)
                for i in [i for i in info[o] if info[o][i][ck] == _key]:
                    info[o][i][ck + "_mu"] = mu
                    info[o][i][ck + "_r"] = tau2 / (tau2 + info[o][i]["s2"])

    def yv(iso, o, h):  # realised log growth from the M0 start at origin o (fixed prices; ratios at o prices agree)
        sz = info[o][iso]["size"]
        b = start_level(fixed[iso], o, "site", sz)
        a = fixed[iso].get(o + h, 0.0)
        return math.log(a / b) if a > 0 and b > 0 else None

    fitted: dict[int, dict] = {}
    for o in origins:
        f = {}
        for ck in ("cell", "cellr"):
            X, Y = [], []
            for o2 in range(2004, o):
                for iso, x in info[o2].items():
                    for h in range(1, 6):
                        if o2 + h > o:
                            break
                        y = yv(iso, o2, h)
                        if y is None:
                            continue
                        X.append([h * x[ck + "_r"] * (x["g"] - x[ck + "_mu"]), h * x[ck + "_mu"]])
                        Y.append(y)
            f[ck] = trimmed_ls(np.array(X), np.array(Y), [0, 0], [1, 1]) if len(Y) >= 100 else [0.0, 0.0]
            f[ck + "_n"] = len(Y)
        for key, (pk, rk) in {"FC": ("NGDP_RPCH", "NGDP_RPCH"), "FCm": ("TM_RPCH", rus_key)}.items():
            v = vintage_for(o, weo)
            if key == "FCm" and flow == "from_rus":
                pk = "NGDP_RPCH"
            if v is None or pk not in weo[v] or rk not in weo[v] or "RUS" not in weo[v][rk]:
                f[key] = None
                continue
            X, Y = [], []
            rs = weo[v][rk]["RUS"]
            for o2 in range(2004, o):
                for iso in info[o2]:
                    ps = weo[v][pk].get(iso)
                    for h in range(1, 6):
                        if o2 + h > o:
                            break
                        y = yv(iso, o2, h)
                        xp, xr = cum_growth(ps, o2, o2 + h), cum_growth(rs, o2, o2 + h)
                        if y is None or xp is None or xr is None:
                            continue
                        X.append([xp, xr])
                        Y.append(y)
            f[key] = {"vintage": v, "coef": trimmed_ls(np.array(X), np.array(Y), [0, 0], [3, 3]), "n": len(Y)}
        fitted[o] = f

    cases = []
    for o in origins:
        for iso, x in info[o].items():
            d = series[iso]
            sz = x["size"]
            years = [y for y in range(o - 3, o + 6) if y <= max_year]
            real = {y: real_at(flow, d, prices, y, o) for y in years}
            if any(real[y] <= 0 for y in (o - 2, o - 1, o)):
                continue
            m0 = start_level(real, o, "site", sz)
            pred = {}
            fs = x["fs"]
            r12 = latest12_ratio(monthly, (iso, ind), o, fs, brent, "12")
            rh2 = latest12_ratio(monthly, (iso, ind), o, fs, brent, "H2")
            f = fitted[o]
            v = vintage_for(o, weo)
            for h in range(1, 6):
                t = o + h
                p = {
                    "M0": m0,
                    "M0_last": real[o],
                    "M0_med3": start_level(real, o, "med", sz),
                    "MOM12": real[o] * r12 if r12 else m0,
                    "MOMH2": real[o] * rh2 if rh2 else m0,
                }
                for key, ck in (("POOL", "cell"), ("POOLr", "cellr")):
                    b1, b2 = f[ck]
                    p[key] = m0 * math.exp(h * (b1 * x[ck + "_r"] * (x["g"] - x[ck + "_mu"]) + b2 * x[ck + "_mu"]))
                for key in ("FC", "FCm"):
                    fk = f[key] if f[key] else (f["FC"] if key == "FCm" else None)
                    if not fk:
                        p[key] = m0
                        continue
                    pk = "NGDP_RPCH" if (key == "FC" or flow == "from_rus") else "TM_RPCH"
                    rk = "NGDP_RPCH" if key == "FC" or not f[key] else rus_key
                    if key == "FCm" and not f[key]:
                        pk, rk = "NGDP_RPCH", "NGDP_RPCH"
                    vv = fk["vintage"]
                    xp = cum_growth(weo[vv][pk].get(iso), o, t)
                    xr = cum_growth(weo[vv][rk].get("RUS"), o, t)
                    e1, e2 = fk["coef"]
                    p[key] = m0 * math.exp(e1 * (xp or 0.0) + e2 * (xr or 0.0))
                p["ENS"] = statistics.median([p["M0"], p["POOL"], p["FC"]])
                pred[t] = p
            cases.append(
                {
                    "iso": iso,
                    "o": o,
                    "size": sz,
                    "real": real,
                    "pred": pred,
                    "has_monthly": bool(r12),
                    "has_weo": bool(v and iso in weo[v].get("NGDP_RPCH", {})),
                }
            )
    return cases, fitted, info


# ---------------------------------------------------------------------------------------------------------------
# scoring
# ---------------------------------------------------------------------------------------------------------------
def cum_errors(c):
    """the site's cumulative error log(sum w*actual / sum w*predicted), H1..H5 (w = 1, except 8/12 at H5)."""
    o, real, pred = c["o"], c["real"], c["pred"]
    res = {}
    for H in range(1, 6):
        ts = [o + h for h in range(1, H + 1)]
        if ts[-1] > 2021:
            break
        ws = [W5[h - 1] if H == 5 else 1.0 for h in range(1, H + 1)]
        a = sum(w * real[t] for t, w in zip(ts, ws))
        if a <= 0:
            continue
        res[f"H{H}"] = {m: math.log(a / sum(w * pred[t][m] for t, w in zip(ts, ws))) for m in MODELS}
    return res


def score(rows, m):
    """mean over H1..H5 of the median absolute cumulative log error, and the median signed error at the longest H."""
    maes, bias = [], None
    for H in range(1, 6):
        es = [r["e"][f"H{H}"][m] for r in rows if f"H{H}" in r["e"]]
        if es:
            maes.append(float(np.median(np.abs(es))))
            bias = float(np.median(es))
    return (float(np.mean(maes)) if maes else float("nan")), bias


def q(a, p):
    return float(np.quantile(np.array(a), p)) if len(a) else float("nan")


def calibrate(errs_by_origin: dict[int, list[float]]):
    """the site's (to_rus_cf.json / product_cf_r44.py) era-calibrated 90% band: smallest K so that K x (q05, q95) of
    two eras covers >= 90% of the third, for every era; band = K x (q05, q95) of all errors."""
    eras = {k: [e for o in r for e in errs_by_origin.get(o, [])] for k, r in ERAS.items()}
    K = 3.0
    for k100 in range(50, 301):
        K = k100 / 100
        ok = True
        for k, test in eras.items():
            train = [e for k2, v in eras.items() if k2 != k for e in v]
            if test and sum(K * q(train, 0.05) <= e <= K * q(train, 0.95) for e in test) / len(test) < 0.9:
                ok = False
                break
        if ok:
            break
    allv = [e for v in eras.values() for e in v]
    return K, K * q(allv, 0.05), K * q(allv, 0.95)


def evaluate(cases, flow):
    rows = [{"c": c, "e": cum_errors(c)} for c in cases]
    rows = [r for r in rows if r["e"]]
    out = {"n_cases": len(rows), "by_origin": {}, "by_size": {}, "classic_by_size": {}, "bands_H5": {}}
    for o in ORIGINS:
        sel = [r for r in rows if r["c"]["o"] == o]
        m0, b0 = score(sel, "M0")
        cell = {"n": len(sel), "M0": {"mae": round(m0, 4), "bias": round(b0, 4)}}
        for m in CANDIDATES:
            s, b = score(sel, m)
            cell[m] = {"mae": round(s, 4), "bias": round(b, 4), "gain": round(1 - s / m0, 4)}
        out["by_origin"][str(o)] = cell
    for sz in ("S", "M", "L"):
        sel = [r for r in rows if r["c"]["size"] == sz]
        m0, b0 = score(sel, "M0")
        cell = {"n": len(sel), "M0": {"mae": round(m0, 4), "bias_longest_H": round(b0, 4)}}
        for m in CANDIDATES:
            s, b = score(sel, m)
            cell[m] = {"mae": round(s, 4), "bias_longest_H": round(b, 4), "gain": round(1 - s / m0, 4)}
        # the small-buyer centre bias: median 5-year cumulative error per classic origin
        cell["median_H5_error_classic"] = {
            m: [
                round(float(np.median([r["e"]["H5"][m] for r in sel if r["c"]["o"] == o and "H5" in r["e"]])), 3)
                for o in TESTS
            ]
            for m in MODELS
        }
        out["by_size"][sz] = cell
        out["classic_by_size"][sz] = {}
        for o in TESTS:
            so = [r for r in sel if r["c"]["o"] == o]
            m0, _ = score(so, "M0")
            out["classic_by_size"][sz][str(o)] = {
                "n": len(so),
                "M0": round(m0, 4),
                **{m: round(1 - score(so, m)[0] / m0, 4) for m in CANDIDATES},
            }
        # bands: era-calibrated 90% band of the H5 cumulative error
        out["bands_H5"][sz] = {}
        for m in MODELS:
            by_o = {}
            for r in sel:
                if "H5" in r["e"]:
                    by_o.setdefault(r["c"]["o"], []).append(r["e"]["H5"][m])
            K, lo, hi = calibrate(by_o)
            out["bands_H5"][sz][m] = {"K": K, "band": [round(math.exp(lo), 3), round(math.exp(hi), 3)]}
        w0 = out["bands_H5"][sz]["M0"]["band"]
        for m in MODELS:
            b = out["bands_H5"][sz][m]["band"]
            out["bands_H5"][sz][m]["width_ratio_vs_M0"] = round((b[1] - b[0]) / (w0[1] - w0[0]), 3)
    # bootstrap of the gain at the classic origins (countries resampled)
    rng = np.random.default_rng(SEED)
    out["bootstrap_gain_90"] = {}
    for m in CANDIDATES:
        out["bootstrap_gain_90"][m] = {}
        for o in TESTS:
            sel = [r for r in rows if r["c"]["o"] == o]
            A = np.array([[r["e"].get(f"H{H}", {}).get(m, np.nan) for H in range(1, 6)] for r in sel])
            B = np.array([[r["e"].get(f"H{H}", {}).get("M0", np.nan) for H in range(1, 6)] for r in sel])
            gs = []
            for _ in range(400):
                ii = rng.integers(0, len(sel), len(sel))
                gs.append(1 - np.nanmean(np.nanmedian(np.abs(A[ii]), 0)) / np.nanmean(np.nanmedian(np.abs(B[ii]), 0)))
            out["bootstrap_gain_90"][m][str(o)] = [round(q(gs, 0.05), 3), round(q(gs, 0.95), 3)]
    # decision
    dec = {}
    for m in CANDIDATES:
        g_all = {o: out["by_origin"][str(o)][m]["gain"] for o in ORIGINS}
        g_cls = {o: g_all[o] for o in TESTS}
        size_ok = all(out["by_size"][s][m]["gain"] >= 0 for s in ("S", "M", "L")) and all(
            out["classic_by_size"][s][str(o)][m] >= 0 for s in ("S", "M", "L") for o in TESTS
        )
        band_ok = all(out["bands_H5"][s][m]["width_ratio_vs_M0"] <= 1.0 for s in ("S", "M", "L"))
        acc_ok = all(g >= RULE_GAIN for g in g_all.values())
        dec[m] = {
            "gain_every_origin_ge_15pct": acc_ok,
            "origins_ge_15pct": f"{sum(g >= RULE_GAIN for g in g_all.values())}/{len(g_all)}",
            "min_gain_any_origin": round(min(g_all.values()), 4),
            "gain_classic_2007_2012_2016": [g_cls[o] for o in TESTS],
            "classic_three_ge_15pct (looser reading)": all(g >= RULE_GAIN for g in g_cls.values()),
            "not_worse_in_any_size_class": size_ok,
            "band_not_wider_any_size_class": band_ok,
            "gain_shock_origin_2013": out["by_origin"][str(SHOCK_ORIGIN)][m]["gain"],
            "passes": acc_ok and size_ok and band_ok,
        }
    out["decision"] = dec
    out["coverage"] = {
        "cases_with_monthly_imts_at_origin": sum(r["c"]["has_monthly"] for r in rows),
        "cases_with_weo_vintage_country": sum(r["c"]["has_weo"] for r in rows),
    }
    return out


# ---------------------------------------------------------------------------------------------------------------
# 2022-2026 central paths (origin 2021): diagnostic for every model, the cf_bands format only for a passing model
# ---------------------------------------------------------------------------------------------------------------
def paths_2022(flow, series, prices, usd_per_eur, monthly, weo, brent):
    cases, fitted, _ = build(flow, series, prices, usd_per_eur, monthly, weo, brent, [2021], max_year=2026)
    out = {}
    for c in cases:
        m0 = c["pred"][2022]["M0"]
        out[c["iso"]] = {
            "size": c["size"],
            "monthly_feb21_jan22": c["has_monthly"],
            **{m: {str(t): round(c["pred"][t][m] / m0, 3) for t in range(2022, 2027)} for m in MODELS if m != "M0"},
        }
    f = fitted[2021]
    return out, {
        "POOL_b1_b2": f["cell"],
        "POOLr_b1_b2": f["cellr"],
        "FC": f["FC"],
        "FCm": f["FCm"],
    }


def run() -> None:
    nom, prices, usd_per_eur, sales, monthly, weo, brent = load_inputs()
    to_rus, from_rus = make_series(nom, prices, sales)
    for y in range(2022, 2027):
        usd_per_eur.setdefault(y, usd_per_eur[2021])
    res = {
        "generated": "2026-10-25",
        "round": 47,
        "status": "research; nothing here is read by the build",
        "question": "can a new centre model (partial pooling, latest pre-war months, pre-war forecast vintages, a small "
        "ensemble) beat '2021 held flat' for purchases from Russia (to_rus) and sales to Russia (from_rus)?",
        "rule_pre_registered": (
            "a candidate replaces M0 only if (1) its accuracy (mean over H1-H5 of the median absolute cumulative log error, "
            "the site's cumulative error with 2026 at 8/12) is at least 15% better than M0 at EVERY rolling origin "
            "2005-2016 (which include the classic 2007, 2012, 2016 tests); (2) it is not worse than M0 in any size class "
            "(S, M, L), pooled and at each classic origin; and (3) its era-calibrated 90% H5 band (the site's method) is "
            "not wider than M0's in any size class. The 2013 origin (2014-2018, Russia shock) is reported separately. A "
            "model that only reduces the small-buyer centre bias is reported as a finding, not proposed."
        ),
        "models": DESC,
        "data": {
            "to_rus": "Russia's exports to each partner, CEPII BACI HS92 by HS2 (raw/oec_baci_r44), real by goods group "
            "(Russian export unit-value indices; other goods: FRED IREXFUELS)",
            "from_rus": "Russia's imports from each partner, CEPII BACI HS92 totals (raw/cf_models_r47), deflated by "
            "FRED IREXFUELS",
            "monthly": "IMF IMTS monthly own reports 2003-2018 (raw/cf_models_r47) and 2019-2026 (raw/imf_imts)",
            "weo": "IMF WEO country vintages via DBnomics (raw/cf_models_r47), 2008-04..2021-10",
        },
        "flows": {},
    }
    for flow, series in (("to_rus", to_rus), ("from_rus", from_rus)):
        cases, fitted, _ = build(flow, series, prices, usd_per_eur, monthly, weo, brent, ORIGINS)
        ev = evaluate(cases, flow)
        ev["fitted"] = {
            str(o): {
                "POOL_b1_b2": [round(v, 3) for v in f["cell"]],
                "POOLr_b1_b2": [round(v, 3) for v in f["cellr"]],
                "POOL_training_pairs": f["cell_n"],
                "FC": f["FC"] and {**f["FC"], "coef": [round(v, 3) for v in f["FC"]["coef"]]},
                "FCm": f["FCm"] and {**f["FCm"], "coef": [round(v, 3) for v in f["FCm"]["coef"]]},
            }
            for o, f in fitted.items()
        }
        p22, f22 = paths_2022(flow, series, prices, usd_per_eur, monthly, weo, brent)
        ev["diagnostic_2022_2026_central_vs_M0"] = p22
        ev["fitted_2021_origin"] = f22
        ev["passing"] = [m for m, d in ev["decision"].items() if d["passes"]]
        res["flows"][flow] = ev
        print(flow, "n", ev["n_cases"], "passing", ev["passing"])
        print("  origin " + " ".join(f"{m:>8}" for m in CANDIDATES))
        for o in ORIGINS:
            cell = ev["by_origin"][str(o)]
            print(
                f"  {o} n{cell['n']:4d} M0 {cell['M0']['mae']:.3f} "
                + " ".join(f"{cell[m]['gain']:+8.1%}" for m in CANDIDATES)
            )
        for s in ("S", "M", "L"):
            cell = ev["by_size"][s]
            print(f"  {s} M0 {cell['M0']['mae']:.3f} " + " ".join(f"{cell[m]['gain']:+8.1%}" for m in CANDIDATES))
            print("    H5 median err (07/12/16):", {m: cell["median_H5_error_classic"][m] for m in MODELS})
            print("    band width ratio:", {m: ev["bands_H5"][s][m]["width_ratio_vs_M0"] for m in MODELS})
    OUT.write_text(json.dumps(res, indent=1) + "\n")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "fetch":
        fetch()
    else:
        run()
