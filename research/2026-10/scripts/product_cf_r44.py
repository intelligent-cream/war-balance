"""Round 44: can a product-level no-war model for purchases from Russia ("paid to Russia", to_rus) beat 2021 held flat
enough to narrow the no-war bands?

Two steps:

  python3 -I research/2026-10/scripts/product_cf_r44.py fetch   # downloads (untrusted data), writes small extracts
  python3 -I research/2026-10/scripts/product_cf_r44.py run     # back-tests, writes gaps/product_cf_r44.json

fetch: CEPII BACI HS92 (Etalab 2.0) through the OEC API (oec.world, no key): Russia's exports to every partner by HS2,
2001-2021, and Russia's exports to the world by HS4 with quantities (unit-value price indices for fuels, cereals,
fertilisers and metals). FRED: IREXFUELS (US import prices excluding fuels, the "other goods" deflator) and AEXUSEU
(USD per EUR, for the EUR size classes). DBnomics: IMF WEO October vintages (world goods import volume growth and the
APSP crude price path, as forecast in each vintage). Full OEC responses go to the scratchpad; only the HS2-by-year
extract and the small series are written to research/2026-10/raw/oec_baci_r44/.

run: models M0 (total held flat, the current method incl. the 2019-2021 median start for flows under EUR 1bn), M1
(product groups each held flat) and M2 (fuel and fertiliser follow indices known at the base year), rolling origins
2005-2016, horizons 1-5, the site's cumulative error, accuracy by test (origins 2007, 2012, 2016) and size class,
era-calibrated 90% bands, held-out (placebo-style) coverage, and the implied band factors.
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
RAW = R / "raw" / "oec_baci_r44"
GAPS = R / "gaps"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/oec_full")

YEARS = list(range(2001, 2022))
OEC = "https://oec.world/api/olap-proxy/data.jsonrecords"
CUBE = "trade_i_baci_a_92"
PRICED_CHAPTERS = {10, 27, 31, 72, 73, 74, 75, 76}
WEO_VINTAGES = [f"{y}-{m}" for y in range(2008, 2022) for m in ("04", "10")]


def get(url: str, tries: int = 4) -> bytes:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=180) as r:
                return r.read()
        except Exception as e:  # network retry
            if i == tries - 1:
                raise
            print("retry", url[:120], e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise RuntimeError


def oec(params: dict) -> dict:
    return json.loads(get(OEC + "?" + urllib.parse.urlencode(params)))


def fetch(weo_only: bool = False) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    SCRATCH.mkdir(parents=True, exist_ok=True)
    hs2_rows, hs4_rows = [], []
    for y in [] if weo_only else YEARS:
        f2 = SCRATCH / f"rus_partner_hs2_{y}.json"
        if not f2.exists():
            d = oec(
                {
                    "cube": CUBE,
                    "drilldowns": "Year,Importer Country,HS2",
                    "measures": "Trade Value",
                    "Exporter Country": "eurus",
                    "Year": y,
                }
            )
            f2.write_text(json.dumps(d))
        d = json.loads(f2.read_text())
        for r in d["data"]:
            iso = str(r["Importer Country ID"])[-3:].upper()
            hs2 = int(r["HS2 ID"]) % 100
            v = float(r["Trade Value"] or 0)
            if v > 0 and iso.isalpha() and len(iso) == 3:
                hs2_rows.append([y, iso, hs2, round(v)])
        f4 = SCRATCH / f"rus_world_hs4_{y}.json"
        if not f4.exists():
            d = oec(
                {
                    "cube": CUBE,
                    "drilldowns": "Year,HS4",
                    "measures": "Trade Value,Quantity",
                    "Exporter Country": "eurus",
                    "Year": y,
                }
            )
            f4.write_text(json.dumps(d))
        d = json.loads(f4.read_text())
        for r in d["data"]:
            hs4 = int(r["HS4 ID"]) % 10000
            if hs4 // 100 in PRICED_CHAPTERS:
                hs4_rows.append([y, hs4, round(float(r["Trade Value"] or 0)), round(float(r["Quantity"] or 0), 1)])
        print(y, len(hs2_rows), len(hs4_rows), file=sys.stderr)
    if not weo_only:
        write_extracts(hs2_rows, hs4_rows)
    fred_and_weo()


def write_extracts(hs2_rows, hs4_rows) -> None:
    meta = {
        "source": "CEPII BACI HS92 (HS6 REV. 1992, 1995-2024 release) via the OEC API, no key; licence Etalab 2.0",
        "url": OEC + "?cube=" + CUBE,
        "retrieved": time.strftime("%Y-%m-%d"),
    }
    with gzip.open(RAW / "rus_exports_partner_hs2_2001_2021.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "what": "Russia's exports (BACI reconciled FOB value, USD) to each importer by HS2 chapter",
                "columns": ["year", "importer_iso3", "hs2", "usd"],
                "rows": hs2_rows,
            },
            fh,
        )
    with gzip.open(RAW / "rus_exports_world_hs4q_2001_2021.json.gz", "wt") as fh:
        json.dump(
            {
                **meta,
                "what": "Russia's exports to the world by HS4 (value USD, quantity tonnes), chapters 10, 27, 31, 72-76",
                "columns": ["year", "hs4", "usd", "tonnes"],
                "rows": hs4_rows,
            },
            fh,
        )


def fred_and_weo() -> None:
    fred = {}
    for sid in ("IREXFUELS", "AEXUSEU"):
        txt = get(f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={sid}").decode()
        fred[sid] = {
            line.split(",")[0]: float(line.split(",")[1])
            for line in txt.splitlines()[1:]
            if line.count(",") == 1 and line.split(",")[1] not in ("", ".")
        }
    (RAW / "fred.json").write_text(
        json.dumps({"source": "FRED", "url": "https://fred.stlouisfed.org/graph/fredgraph.csv?id=<id>", "series": fred})
    )
    weo = {}
    for v in WEO_VINTAGES:
        weo[v] = {}
        for subj, key in (("TMG_RPCH", "001.TMG_RPCH.pcent_change"), ("POILAPSP", "001.POILAPSP.us_dollars")):
            # the world group is "001" or "1" and the unit code changes between vintages: search by subject
            url = f"https://api.db.nomics.world/v22/series/IMF/WEOAGG:{v}?limit=1000&observations=1&q={subj}"
            try:
                docs = json.loads(get(url))["series"]["docs"]
            except Exception as e:  # noqa: BLE001
                print("weo miss", v, subj, e, file=sys.stderr)
                continue
            for doc in docs:
                grp, sub = doc["series_code"].split(".")[:2]
                if grp.lstrip("0") == "1" and sub == subj:
                    weo[v][key] = {p: x for p, x in zip(doc["period"], doc["value"]) if isinstance(x, (int, float))}
                    weo[v][key + "_code"] = doc["series_code"]
    (RAW / "weo_vintages.json").write_text(
        json.dumps(
            {
                "source": "IMF World Economic Outlook vintages via DBnomics (WEOAGG)",
                "url": "https://api.db.nomics.world/v22/series/IMF/WEOAGG:<vintage>/<series>",
                "retrieved": time.strftime("%Y-%m-%d"),
                "vintages": weo,
            }
        )
    )


# ---------------------------------------------------------------------------------------------------------------
# run: back-tests
# ---------------------------------------------------------------------------------------------------------------

GROUPS = ("fuel", "cereal", "fert", "metal", "other")
ORIGINS = list(range(2005, 2017))
TESTS = (2007, 2012, 2016)
ERAS = {"2005-09": range(2005, 2010), "2010-12": range(2010, 2013), "2013-16": range(2013, 2017)}
W5 = (1.0, 1.0, 1.0, 1.0, 8 / 12)  # the site's H5: 2026 counts 8 of 12 months
EXCLUDE = {"UKR", "BLR", "RUS"}  # Ukraine (war from 2014), Belarus (own band), self
MIN_EUR = 0.01e9  # EUR 10 m 4-year average at the origin, as counterfactual.json
SITE_DROP = {2012: {2014, 2015}, 2016: {2020}}  # the site's back-test exclusions (variant)
RULE_GAIN = 0.15


def group_of(hs2: int) -> str:
    if hs2 == 27:
        return "fuel"
    if hs2 == 10:
        return "cereal"
    if hs2 == 31:
        return "fert"
    if 72 <= hs2 <= 76:
        return "metal"
    return "other"


def load_inputs():
    with gzip.open(RAW / "rus_exports_partner_hs2_2001_2021.json.gz", "rt") as fh:
        d = json.load(fh)
    nom: dict[str, dict[int, dict[str, float]]] = {}
    for y, iso, hs2, v in d["rows"]:
        g = nom.setdefault(iso, {}).setdefault(y, dict.fromkeys(GROUPS, 0.0))
        g[group_of(hs2)] += v
    with gzip.open(RAW / "rus_exports_world_hs4q_2001_2021.json.gz", "rt") as fh:
        q = json.load(fh)
    uv: dict[str, dict[int, dict[int, tuple[float, float]]]] = {}
    for y, hs4, v, t in q["rows"]:
        if v > 0 and t > 0:
            uv.setdefault(group_of(hs4 // 100), {}).setdefault(y, {})[hs4] = (v, t)
    prices: dict[str, dict[int, float]] = {}
    chain_log = {}
    for g, by in uv.items():
        idx = {YEARS[0]: 1.0}
        dropped = 0
        for y in YEARS[1:]:
            a, b = by.get(y - 1, {}), by.get(y, {})
            num_l = den_l = num_p = den_p = 0.0
            for k in set(a) & set(b):
                p0, p1 = a[k][0] / a[k][1], b[k][0] / b[k][1]
                if not 0.25 <= p1 / p0 <= 4:  # unit-value breaks (quantity unit changes), dropped
                    dropped += 1
                    continue
                num_l += p1 * a[k][1]
                den_l += a[k][0]
                num_p += b[k][0]
                den_p += p0 * b[k][1]
            idx[y] = idx[y - 1] * math.sqrt((num_l / den_l) * (num_p / den_p))
        prices[g] = idx
        chain_log[g] = {"dropped_hs4_year_pairs": dropped}
    fred = json.loads((RAW / "fred.json").read_text())["series"]
    other = {}
    for y in YEARS:
        vals = [v for k, v in fred["IREXFUELS"].items() if k.startswith(f"{y}-")]
        if len(vals) == 12:
            other[y] = sum(vals) / 12
    base = other[2002]
    prices["other"] = {y: v / base for y, v in other.items()}
    usd_per_eur = {int(k[:4]): v for k, v in fred["AEXUSEU"].items()}
    weo = json.loads((RAW / "weo_vintages.json").read_text())["vintages"]
    return nom, prices, chain_log, usd_per_eur, weo


def vintage_for(origin: int, weo: dict, allow_april_after: bool = False) -> str | None:
    """The October vintage of the origin year (as October 2021 for the map); 2011-10 is missing on DBnomics, so April
    2011 is used. None for origins before 2008 (no vintage on DBnomics), unless allow_april_after (variant: April of
    the following year, which already knows the origin year's outturn)."""
    for v in (f"{origin}-10", f"{origin}-04"):
        if v in weo and weo[v].get("001.TMG_RPCH.pcent_change"):
            return v
    if allow_april_after and f"{origin + 1}-04" in weo:
        return f"{origin + 1}-04"
    return None


def build_cases(nom, prices, usd_per_eur, weo, allow_april_after=False):
    """One case per importer and origin: real group levels (origin prices) for o-3..o+5 and the model paths."""
    cases = []
    oil_hist = {}  # realised APSP crude by year, as known in the latest vintage used only for pre-origin pairs
    for o in ORIGINS:
        for iso, by in nom.items():
            if iso in EXCLUDE:
                continue
            win = [o - 3, o - 2, o - 1, o]
            if any(sum(by.get(y, {}).values()) <= 0 for y in win):
                continue
            avg_eur = sum(sum(by[y].values()) / usd_per_eur[y] for y in win) / 4
            if avg_eur < MIN_EUR:
                continue
            size = "S" if avg_eur < 0.1e9 else "M" if avg_eur < 1e9 else "L"
            years = [y for y in range(o - 3, o + 6) if y <= 2021]
            real = {y: {g: by.get(y, {}).get(g, 0.0) * prices[g][o] / prices[g][y] for g in GROUPS} for y in years}
            # site-like target: total nominal deflated by a fixed-weight index with the importer's o-2..o group mix
            mix = {g: sum(by[y][g] for y in win[1:]) for g in GROUPS}
            tot = sum(mix.values())
            mix = {g: v / tot for g, v in mix.items()}
            dfl = {y: sum(mix[g] * prices[g][y] / prices[g][o] for g in GROUPS) for y in years}
            cases.append(
                {
                    "iso": iso,
                    "o": o,
                    "size": size,
                    "avg_eur": avg_eur,
                    "real": real,
                    "nom": {y: sum(by.get(y, {}).values()) for y in years},
                    "dfl": dfl,
                    "mix": mix,
                }
            )
    return cases, oil_hist


def fuel_price_beta(nom, prices, o: int) -> float:
    """Pooled elasticity of the fuel volume bought from Russia to Russia's fuel export price, fitted on pre-origin
    year pairs (o' < t' <= o, horizons 1-5): log fuel volume ratio on log price ratio, importers with fuel >= USD 10 m.
    Known at the origin."""
    xs, ys = [], []
    for iso, by in nom.items():
        if iso in EXCLUDE:
            continue
        for o2 in range(2002, o):
            f0 = by.get(o2, {}).get("fuel", 0.0)
            if f0 < 1e7:
                continue
            for t in range(o2 + 1, min(o2 + 5, o) + 1):
                f1 = by.get(t, {}).get("fuel", 0.0)
                if f1 <= 0:
                    continue
                pr = prices["fuel"][t] / prices["fuel"][o2]
                xs.append(math.log(pr))
                ys.append(math.log((f1 / prices["fuel"][t]) / (f0 / prices["fuel"][o2])))
    x, y = np.array(xs), np.array(ys)
    if len(x) < 30:
        return 0.0
    # Huber-ish robustness: trim the 5% largest absolute residuals once
    b = np.polyfit(x, y, 1)
    r = np.abs(y - np.polyval(b, x))
    keep = r <= np.quantile(r, 0.95)
    return float(np.polyfit(x[keep], y[keep], 1)[0])


def weo_paths(weo, o: int, allow_april_after: bool):
    v = vintage_for(o, weo, allow_april_after)
    if not v:
        return None, None, None
    vol = weo[v]["001.TMG_RPCH.pcent_change"]
    oil = weo[v].get("001.POILAPSP.us_dollars", {})
    vol_idx, oil_idx = {}, {}
    acc = 1.0
    # vintages before 2012 on DBnomics carry only two forecast years: later years repeat the last forecast growth
    # (volume) and hold the last forecast price (crude)
    last_g, last_p = 0.0, oil.get(str(o))
    for t in range(o + 1, o + 6):
        last_g = vol.get(str(t), last_g)
        acc *= 1 + last_g / 100
        vol_idx[t] = acc
        last_p = oil.get(str(t), last_p)
        if last_p and str(o) in oil:
            oil_idx[t] = last_p / oil[str(o)]
    return v, vol_idx, oil_idx


def predictions(c, betas, weo_cache):
    """Predicted real level (origin prices) per target year, per model."""
    o, real, size = c["o"], c["real"], c["size"]
    win3 = [o - 2, o - 1, o]
    small = size in ("S", "M")  # the map's median start applies under EUR 1bn a year
    tot = {y: sum(real[y].values()) for y in real}
    m0 = float(np.median([tot[y] for y in win3])) if small else tot[o]
    g_base = {g: (float(np.median([real[y][g] for y in win3])) if small else real[o][g]) for g in GROUPS}
    g_med = {g: float(np.median([real[y][g] for y in win3])) for g in GROUPS}
    m1 = sum(g_base.values())
    m1b = sum(g_med.values())
    _, vol_idx, oil_idx = weo_cache[o]
    out = {}
    for t in range(o + 1, o + 6):
        if t > 2021:
            break
        vi = vol_idx.get(t, 1.0) if vol_idx else 1.0
        pi = oil_idx.get(t) if oil_idx else None
        pr = pi ** betas[o] if pi else 1.0
        rest = m1 - g_base["fuel"] - g_base["fert"]
        out[t] = {
            "M0": m0,
            "M1": m1,
            "M1b": m1b,
            "M2v": rest + (g_base["fuel"] + g_base["fert"]) * vi,
            "M2p": m1 - g_base["fuel"] + g_base["fuel"] * pr,
            "M2": rest + g_base["fuel"] * vi * pr + g_base["fert"] * vi,
            # oracles (not eligible: use Russia's realised exports to everyone else after the origin, which for
            # 2022-2026 is the war outcome): the total, and each group, moved by Russia's realised real exports of it
            # to all other partners
            "O_total": m0 * world_growth(c["iso"], o, t, None),
            "O_groups": sum(g_base[g] * world_growth(c["iso"], o, t, g) for g in GROUPS),
        }
        # site-like target (fixed-weight deflator): M1's product-flat path expressed in that target's units needs the
        # realised relative prices; M0 there is the total held flat
        d = c["dfl"]
        out[t]["M1_sitelike"] = (
            sum(g_base[g] * PRICES[g][t] / PRICES[g][o] for g in GROUPS) / d[t] if d[t] else float("nan")
        )
    return out


MODELS = ("M0", "M1", "M1b", "M2v", "M2p", "M2", "O_total", "O_groups")
WORLD: dict = {}  # nominal USD by group and year, Russia's exports to all partners, and per partner (to subtract)


def world_growth(iso: str, o: int, t: int, g: str | None) -> float:
    gs = GROUPS if g is None else (g,)

    def real(y):
        return sum(
            (WORLD["all"][y][x] - WORLD["by"].get(iso, {}).get(y, {}).get(x, 0.0)) * PRICES[x][o] / PRICES[x][y]
            for x in gs
        )

    a, b = real(o), real(t)
    return b / a if a > 0 else 1.0


CANDIDATES = ("M1", "M1b", "M2")  # fixed in advance; M2v and M2p are M2's two parts, shown for diagnosis
PRICES: dict = {}


def cum_errors(c, pred, drop=frozenset()):
    """log(sum w*actual / sum w*predicted) for H = 1..5 (w = 1, except 8/12 at H5), per model; site-like target too."""
    o = c["o"]
    tot = {y: sum(c["real"][y].values()) for y in c["real"]}
    sitelike = {y: c["nom"][y] / c["dfl"][y] * 1.0 for y in c["real"]}  # nominal / fixed-weight index
    # in origin prices the site-like level at o equals the nominal at o
    res = {}
    for H in range(1, 6):
        ts = [o + h for h in range(1, H + 1)]
        if ts[-1] > 2021 or ts[-1] not in pred:
            break
        ws = [W5[h - 1] if H == 5 else 1.0 for h in range(1, H + 1)]
        keep = [(t, w) for t, w in zip(ts, ws) if t not in drop]
        if not keep:
            continue
        a = sum(w * tot[t] for t, w in keep)
        if a <= 0:
            continue
        e = {m: math.log(a / sum(w * pred[t][m] for t, w in keep)) for m in MODELS}
        a_s = sum(w * sitelike[t] for t, w in keep)
        small = c["size"] in ("S", "M")
        win3 = [o - 2, o - 1, o]
        m0s = float(np.median([sitelike[y] for y in win3])) if small else sitelike[o]
        if a_s > 0:
            e["M0_sitelike"] = math.log(a_s / (m0s * sum(w for _, w in keep)))
            e["M1_sitelike"] = math.log(a_s / sum(w * pred[t]["M1_sitelike"] for t, w in keep))
        res[f"H{H}"] = e
    return res


def q(a, p):
    return float(np.quantile(np.array(a), p)) if len(a) else float("nan")


def calibrate(errs_by_origin: dict[int, list[float]]):
    """Era calibration as to_rus_cf.json: the smallest K in 0.5..3 such that K x (q05, q95) of two eras covers >= 90%
    of the third, for every era. Returns K, the per-era coverage and the final band (all eras) in log units."""
    eras = {k: [e for o in r for e in errs_by_origin.get(o, [])] for k, r in ERAS.items()}
    for k100 in range(50, 301):
        K = k100 / 100
        cov = {}
        for k, test in eras.items():
            train = [e for k2, v in eras.items() if k2 != k for e in v]
            lo, hi = K * q(train, 0.05), K * q(train, 0.95)
            cov[k] = sum(lo <= e <= hi for e in test) / len(test) if test else float("nan")
        if all(v >= 0.9 for v in cov.values() if not math.isnan(v)):
            break
    allv = [e for v in eras.values() for e in v]
    lo, hi = K * q(allv, 0.05), K * q(allv, 0.95)
    return {"K": K, "era_coverage": {k: round(v, 3) for k, v in cov.items()}, "lo": lo, "hi": hi, "n": len(allv)}


def run() -> None:
    nom, prices, chain_log, usd_per_eur, weo = load_inputs()
    PRICES.update(prices)
    WORLD["by"] = nom
    WORLD["all"] = {y: {g: sum(by.get(y, {}).get(g, 0.0) for by in nom.values()) for g in GROUPS} for y in YEARS}
    cases, _ = build_cases(nom, prices, usd_per_eur, weo)
    out = {
        "generated": time.strftime("%Y-%m-%d"),
        "question": "Can a product-level no-war model for purchases from Russia (to_rus) beat 2021 held flat by >= 15% "
        "in every back-test, and narrow the band at the same coverage?",
        "rule": "a candidate (M1, M1b, M2; fixed in advance) replaces M0 only if its error (mean over H1-H5 of the median "
        "absolute cumulative log error) is >= 15% lower in each of the tests at origins 2007, 2012 and 2016; it narrows "
        "a band only if its era-calibrated 90% band is narrower than M0's built the same way",
        "data": {
            "trade": "CEPII BACI HS92 via OEC API: Russia's exports to each partner by HS2, 2001-2021 (USD, FOB)",
            "prices": "Fisher chained unit-value indices of Russia's exports to the world by HS4 (fuel HS27, cereals "
            "HS10, fertilisers HS31, metals HS72-76); other goods: FRED IREXFUELS (US import prices excluding fuels)",
            "weo": "IMF WEO October vintage of the origin year (DBnomics WEOAGG): world goods import volume growth "
            "(TMG_RPCH) and APSP crude price path (POILAPSP)",
            "price_index_levels": {g: {str(y): round(v, 4) for y, v in p.items()} for g, p in prices.items()},
            "unit_value_chain": chain_log,
        },
        "models": {
            "M0": "total held flat at the origin year (real, origin prices); flows under EUR 1bn a year (size S, M) "
            "start from the median of the three years to the origin, as the map's small_flow_base",
            "M1": "five product groups (fuel HS27, cereals HS10, fertilisers HS31, metals HS72-76, other), each held "
            "flat in real terms with the same start rule as M0 (identical to M0 for L flows: the sum of groups held "
            "flat at the origin year's prices is the total held flat)",
            "M1b": "each group from the median of its own three years to the origin, for all sizes",
            "M2v": "M1, with fuel and fertiliser volumes moved by the WEO world goods import volume forecast",
            "M2p": "M1, with fuel volume moved by (WEO crude price forecast / origin)^beta, beta the pooled elasticity "
            "of fuel volume to Russia's fuel export price on pre-origin pairs",
            "M2": "M2v and M2p together (fuel: volume x price response; fertiliser: volume; other groups flat). Origin "
            "2007 has no WEO vintage on DBnomics, so M2 = M1 there (variant: April 2008 vintage)",
            "O_total": "oracle, not eligible: the total moved by Russia's realised real exports to all other partners",
            "O_groups": "oracle, not eligible: each group moved by Russia's realised real exports of that group to all "
            "other partners (what product detail could add with perfect knowledge of Russia's supply)",
        },
    }
    betas, weo_cache = {}, {}
    for o in ORIGINS:
        betas[o] = fuel_price_beta(nom, prices, o)
        weo_cache[o] = weo_paths(weo, o, False)
    out["M2_inputs"] = {
        str(o): {
            "beta_fuel_price": round(betas[o], 3),
            "weo_vintage": weo_cache[o][0],
            "world_volume_index": {str(t): round(v, 3) for t, v in (weo_cache[o][1] or {}).items()},
            "oil_price_index": {str(t): round(v, 3) for t, v in (weo_cache[o][2] or {}).items()},
        }
        for o in ORIGINS
    }
    errs = []
    for c in cases:
        pred = predictions(c, betas, weo_cache)
        errs.append((c, cum_errors(c, pred), cum_errors(c, pred, SITE_DROP.get(c["o"], frozenset()))))
    # variant: April-after vintage for 2007
    wc2 = dict(weo_cache)
    wc2[2007] = weo_paths(weo, 2007, True)
    errs_apr = {(c["iso"], c["o"]): cum_errors(c, predictions(c, betas, wc2)) for c in cases if c["o"] == 2007}
    sizes = ("S", "M", "L", "all")
    allm = MODELS + ("M0_sitelike", "M1_sitelike")

    def sel(size, o=None):
        return [x for x in errs if (size == "all" or x[0]["size"] == size) and (o is None or x[0]["o"] == o)]

    # ---- accuracy at the three test origins
    acc = {}
    for variant, idx in (("all_years", 1), ("site_exclusions", 2)):
        acc[variant] = {}
        for size in sizes:
            acc[variant][size] = {}
            for o in TESTS:
                rows = sel(size, o)
                cell = {"n": len(rows)}
                for m in allm:
                    per_h = {}
                    for H in range(1, 6):
                        es = [x[idx][f"H{H}"][m] for x in rows if f"H{H}" in x[idx] and m in x[idx][f"H{H}"]]
                        if es:
                            per_h[f"H{H}"] = {
                                "mae": round(float(np.median(np.abs(es))), 4),
                                "bias": round(float(np.median(es)), 4),
                                "p05": round(q(es, 0.05), 4),
                                "p95": round(q(es, 0.95), 4),
                            }
                    if per_h:
                        cell[m] = {
                            "mean_mae_H1_H5": round(float(np.mean([v["mae"] for v in per_h.values()])), 4),
                            "by_H": per_h,
                        }
                for m in allm:
                    base = "M0_sitelike" if m.endswith("_sitelike") else "M0"
                    if m in cell and base in cell and m != base:
                        cell[m]["gain_vs_M0"] = round(1 - cell[m]["mean_mae_H1_H5"] / cell[base]["mean_mae_H1_H5"], 4)
                acc[variant][size][str(o)] = cell
    # April-2008 vintage variant for the 2007 test, all sizes
    rows = [x for x in errs if x[0]["o"] == 2007]
    v07 = {}
    for m in ("M0", "M2"):
        maes = []
        for H in range(1, 6):
            es = [errs_apr[(x[0]["iso"], 2007)][f"H{H}"][m] for x in rows if f"H{H}" in errs_apr[(x[0]["iso"], 2007)]]
            maes.append(float(np.median(np.abs(es))))
        v07[m] = round(float(np.mean(maes)), 4)
    v07["gain_vs_M0"] = round(1 - v07["M2"] / v07["M0"], 4)
    out["accuracy"] = acc
    out["accuracy_variant_2007_april2008_vintage"] = v07

    # bootstrap of the gain (countries resampled within each test), all sizes, all years
    rng = np.random.default_rng(44)
    boot = {}
    for m in CANDIDATES + ("M2v", "M2p", "O_total", "O_groups"):
        boot[m] = {}
        for o in TESTS:
            rows = sel("all", o)
            mat = np.array(
                [[x[1][f"H{H}"][m] if f"H{H}" in x[1] else np.nan for H in range(1, 6)] for x in rows], dtype=float
            )
            mat0 = np.array(
                [[x[1][f"H{H}"]["M0"] if f"H{H}" in x[1] else np.nan for H in range(1, 6)] for x in rows], dtype=float
            )
            gains = []
            for _ in range(500):
                ii = rng.integers(0, len(rows), len(rows))
                a = np.nanmean(np.nanmedian(np.abs(mat[ii]), axis=0))
                b = np.nanmean(np.nanmedian(np.abs(mat0[ii]), axis=0))
                gains.append(1 - a / b)
            boot[m][str(o)] = [round(q(gains, 0.05), 3), round(q(gains, 0.95), 3)]
    out["bootstrap_gain_90pct"] = boot

    # ---- decision
    dec = {}
    for size in sizes:
        dec[size] = {}
        for m in CANDIDATES:
            g = [acc["all_years"][size][str(o)].get(m, {}).get("gain_vs_M0") for o in TESTS]
            g2 = [acc["site_exclusions"][size][str(o)].get(m, {}).get("gain_vs_M0") for o in TESTS]
            dec[size][m] = {
                "gains_2007_2012_2016": g,
                "gains_site_exclusions": g2,
                "passes": all(x is not None and x >= RULE_GAIN for x in g)
                and all(x is not None and x >= RULE_GAIN for x in g2),
            }
    out["decision_by_size"] = dec

    # ---- bands: rolling origins 2005-2016, H5 (and H1-H4), era-calibrated per model and size
    bands = {}
    for size in ("S", "M", "L"):
        bands[size] = {}
        for m in MODELS:
            bands[size][m] = {}
            for H in range(1, 6):
                by_o = {}
                for x in sel(size):
                    if f"H{H}" in x[1]:
                        by_o.setdefault(x[0]["o"], []).append(x[1][f"H{H}"][m])
                cal = calibrate(by_o)
                raw_all = [e for v in by_o.values() for e in v]
                bands[size][m][f"H{H}"] = {
                    "K": cal["K"],
                    "era_coverage": cal["era_coverage"],
                    "n": cal["n"],
                    "band": [round(math.exp(cal["lo"]), 3), round(math.exp(cal["hi"]), 3)],
                    "log_width": round(cal["hi"] - cal["lo"], 4),
                    "uncalibrated_band": [round(math.exp(q(raw_all, 0.05)), 3), round(math.exp(q(raw_all, 0.95)), 3)],
                    "median_error": round(float(np.median(raw_all)), 4),
                }
            for H in range(1, 6):
                b0 = bands[size]["M0"][f"H{H}"]
                b = bands[size][m][f"H{H}"]
                b["width_ratio_vs_M0"] = round((b["band"][1] - b["band"][0]) / (b0["band"][1] - b0["band"][0]), 3)
                b["uncal_log_width_ratio_vs_M0"] = round(
                    math.log(b["uncalibrated_band"][1] / b["uncalibrated_band"][0])
                    / math.log(b0["uncalibrated_band"][1] / b0["uncalibrated_band"][0]),
                    3,
                )
    out["bands"] = bands

    # ---- placebo-style held-out coverage: windows of the placebos (origin 2013, sum 2014-2017; origin 2017 cannot be
    # scored to H4 inside 2021, so origin 2016 sum 2017-2020 is used), bands from origins whose window ends before it
    plac = {}
    for po, H, train_max in ((2013, 4, 2009), (2016, 4, 2012)):
        key = f"origin{po}_H{H}"
        plac[key] = {}
        for size in ("S", "M", "L", "all"):
            plac[key][size] = {}
            for m in MODELS:
                train = [x[1][f"H{H}"][m] for x in sel(size) if x[0]["o"] <= train_max and f"H{H}" in x[1]]
                test = [x[1][f"H{H}"][m] for x in sel(size, po) if f"H{H}" in x[1]]
                Kb = bands[size if size != "all" else "M"][m][f"H{H}"]["K"]
                lo, hi = q(train, 0.05), q(train, 0.95)
                plac[key][size][m] = {
                    "n_train": len(train),
                    "n_test": len(test),
                    "coverage_uncalibrated": round(sum(lo <= e <= hi for e in test) / len(test), 3) if test else None,
                    "coverage_K": round(sum(Kb * lo <= e <= Kb * hi for e in test) / len(test), 3) if test else None,
                    "band_K": [round(math.exp(Kb * lo), 3), round(math.exp(Kb * hi), 3)],
                }
    out["placebo_style_coverage"] = plac

    # ---- equal-coverage width: for each candidate, the band width needed to reach the same leave-era-out coverage as
    # M0's calibrated band (pooled), H5
    out["cases"] = {
        "n_cases": len(cases),
        "by_size": {s: sum(c["size"] == s for c in cases) for s in ("S", "M", "L")},
        "importers": len({c["iso"] for c in cases}),
        "origins": ORIGINS,
    }
    # fuel/other mix and its error share, M0, H5
    mixes = {}
    for size in ("S", "M", "L"):
        rows = [x for x in sel(size) if "H5" in x[1]]
        mixes[size] = {
            "median_fuel_share": round(float(np.median([x[0]["mix"]["fuel"] for x in rows])), 3) if rows else None,
            "median_other_share": round(float(np.median([x[0]["mix"]["other"] for x in rows])), 3) if rows else None,
        }
    out["mix_by_size"] = mixes
    for size in ("S", "M", "L"):
        rows = [x for x in sel(size) if "H5" in x[1]]
        for g in GROUPS:
            mixes[size][f"median_{g}_share"] = round(float(np.median([x[0]["mix"][g] for x in rows])), 3)
            mixes[size][f"mean_{g}_share"] = round(float(np.mean([x[0]["mix"][g] for x in rows])), 3)

    # where M0's 5-year error comes from: each group's contribution to the deviation of the H5 sum from the origin
    # level (origin-year base, additive), share of variance = cov(D_g, D) / var(D), D clipped to [-1, 3]
    decomp = {}
    for size in ("S", "M", "L"):
        dg = {g: [] for g in GROUPS}
        dt = []
        for c in [x[0] for x in sel(size) if "H5" in x[1]]:
            o = c["o"]
            base_tot = sum(c["real"][o].values())
            ws = W5
            ts = [o + h for h in range(1, 6)]
            dev = {
                g: sum(w * (c["real"][t][g] - c["real"][o][g]) for t, w in zip(ts, ws)) / (sum(ws) * base_tot)
                for g in GROUPS
            }
            tot = sum(dev.values())
            if -1 <= tot <= 3:
                dt.append(tot)
                for g in GROUPS:
                    dg[g].append(dev[g])
        v = float(np.var(dt))
        decomp[size] = {
            "n": len(dt),
            "variance_share": {g: round(float(np.cov(dg[g], dt)[0, 1]) / v, 3) for g in GROUPS},
            "corr_fuel_vs_rest": round(
                float(np.corrcoef(dg["fuel"], [a - b for a, b in zip(dt, dg["fuel"])])[0, 1]), 3
            ),
        }
    out["error_variance_by_group_M0_H5"] = decomp

    # the uncertain countries (r43 rows whose first part is "paid") and their current band
    cfj = json.loads((GAPS / "counterfactual.json").read_text())["countries"]
    r43 = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r43/out.json")
    unc = []
    if r43.exists():
        rows = json.loads(r43.read_text())["rows"]
        unc = sorted({r["iso"] for r in rows if r.get("parts") and r["parts"][0]["k"] == "paid"})
    cbj = json.loads((GAPS / "cf_bands.json").read_text())["cumulative_bands"]["chosen"]
    trc = json.loads((GAPS / "to_rus_cf.json").read_text())["countries"]
    cur = {"S": cbj["to_rus/S"]["H5_2026_8of12"]}
    for d in trc.values():
        cur.setdefault(d["size_class"], d["cumulative_band"]["H5_2026_8of12"])
    out["current_generic_band_H5"] = {
        s: {
            "band": [b["low"], b["high"]],
            "scaled_x0.81": [round(1 - (1 - b["low"]) * 0.81, 3), round(1 + (b["high"] - 1) * 0.81, 3)],
        }
        for s, b in cur.items()
    }
    sz = {i: ((cfj.get(i) or {}).get("to_rus") or {}).get("size_class") for i in unc}
    out["uncertain_countries"] = {
        "n": len(unc),
        "by_size_class": {str(s): sorted(i for i, v in sz.items() if v == s) for s in ("S", "M", "L", None)},
        "note": "size class of to_rus in counterfactual.json; current bands are the generic size-class bands x0.81",
    }
    (GAPS / "product_cf_r44.json").write_text(json.dumps(out, indent=1) + "\n")
    # console summary
    for size in sizes:
        line = [size]
        for o in TESTS:
            cell = acc["all_years"][size][str(o)]
            line.append(
                f"{o}: n{cell['n']} M0 {cell['M0']['mean_mae_H1_H5']:.3f} "
                + " ".join(f"{m} {cell[m].get('gain_vs_M0', 0):+.0%}" for m in MODELS[1:] if m in cell)
                + f" | site-like M1 {cell.get('M1_sitelike', {}).get('gain_vs_M0', 0):+.1%}"
            )
        print(" || ".join(line))
    for size in ("S", "M", "L"):
        print(
            size,
            {
                m: (bands[size][m]["H5"]["band"], bands[size][m]["H5"]["K"], bands[size][m]["H5"]["width_ratio_vs_M0"])
                for m in MODELS
            },
        )
    print("betas", {o: round(b, 2) for o, b in betas.items()})
    print("placebo", json.dumps(plac)[:1500])


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "fetch":
        fetch()
    elif cmd == "fetch-weo":
        fetch(weo_only=True)
    else:
        run()
