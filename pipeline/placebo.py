"""Placebo test of the likely ranges (round 42): the method rerun as if the war had started in 2018 (and in 2014).

The site states that a trade part's likely range covers about 90% "by judgement". This script measures it. For a year
in which no war started, the true war effect is zero, so a well-calibrated 90% range should contain zero for about 90%
of countries. For every country it rebuilds, from the committed raw downloads only, the two trade parts that carry
most of the width of the uncertain countries' net ranges:

  paid  purchases from Russia (to_rus): the pre-war level held flat (the method's rule), at Russia's net gain share;
  sold  sales to Russia (from_rus): held flat, because the method's linear nowcast cannot be refitted from the
        repository (its coefficients and inputs are not committed); counted at the value kept (c.vk), as on the site.

Each part's change and likely range are worked out as site/index.html spread() does (base, actual values and price
level ranges, the cumulative 90% no-war band of the summed expected level, the base and actual values correlated 0.5,
all in quadrature), the two parts are combined as total() does (correlation 0.2), and the result is divided by the
placebo GDP. The share of countries whose range contains zero is the measured coverage.

Placebos (the method's own setting shifted back; see SETTINGS):
  2018: base year 2017, pre-war window 2015-2017 (prices of 2015-2017 = 1), summed 2018-2021 (4 years, band H4).
  2014: base year 2013, window 2011-2013, summed 2014-2017 (the Russia-side shock: oil halved, the rouble crashed).

Inputs: research/2026-10/raw/*_placebo/ (pipeline/fetch/placebo_raw.py), the bands in research/2026-10/gaps/ and, for
each country's data ranges, gain shares and value kept, the committed site/data.json (the 2021 values, read only).
Writes research/2026-10/gaps/placebo_r42.json. Changes nothing the site uses.

Run: cd pipeline && uv run placebo.py
"""

from __future__ import annotations

import gzip
import json
import math
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "2026-10" / "raw"
GAPS = ROOT / "research" / "2026-10" / "gaps"
OUT = GAPS / "placebo_r42.json"

SETTINGS = {
    "2018": {"base": 2017, "window": [2015, 2016, 2017], "size_window": [2014, 2015, 2016, 2017],
             "years": [2018, 2019, 2020, 2021], "gdp_years": [2018, 2019, 2020]},
    "2014": {"base": 2013, "window": [2011, 2012, 2013], "size_window": [2010, 2011, 2012, 2013],
             "years": [2014, 2015, 2016, 2017], "gdp_years": [2014, 2015, 2016]},
}  # fmt: skip
SMALL_FLOW_EUR_BN = 1.0  # build_data.py: purchases under EUR 1bn a year start from the median of the window
RANKED_GDP_EUR_BN = 5.0  # the site's ranking threshold
PARTY_TO_WAR = {"BLR", "PRK"}
RHO_PAID_SOLD = 0.2  # site/index.html RHO "paid|sold"
# the ten importers whose customs omit Russian pipeline gas: deflated without gas (trend3-notes.md), and their customs
# value here has no gas either
GAS_HIDDEN = {"DEU", "AUT", "POL", "NLD", "FRA", "HUN", "CHE", "FIN", "BEL", "TUR"}
ASIA_LNG = {"JPN", "KOR", "TWN", "CHN", "IND"}  # gas priced with the Japan LNG series, others with EU gas
# Power of Siberia (agreed 2014): deliveries began December 2019; the method puts the contracted ramp-up into China's
# no-war path. Its pre-2022 contracted volumes are not in a raw file; Gazprom's reported deliveries (bcm) stand in
POS_BCM = {2019: 0.33, 2020: 4.1, 2021: 10.39}
MMBTU_PER_M3 = 0.0353
# site/index.html REGION_OF (anything not listed is Asia & Pacific)
REGIONS = {
    "eu": "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE",
    "eur": "ALB AND ARM AZE BIH BLR CHE FRO GBR GEO GIB GGY IMN ISL JEY LIE MCO MDA MKD MNE NOR SMR SRB TUR UKR VAT XKX",
    "am": "ABW AIA ARG ATG BES BHS BLM BLZ BMU BOL BRA BRB BVT CAN CHL COL CRI CUB CUW CYM DMA DOM ECU FLK GRD GRL GTM "
    "GUY HND HTI JAM KNA LCA MAF MEX MSR NIC PAN PER PRI PRY SGS SLV SPM SUR SXM TCA TTO UMI URY USA VCT VEN VGB VIR",
    "mea": "AGO ARE ATF BDI BEN BFA BHR BWA CAF CIV CMR COD COG COM CPV DJI DZA EGY ERI ESH ETH GAB GHA GIN GMB GNB GNQ "
    "IRN IRQ ISR JOR KEN KWT LBN LBR LBY LSO MAR MDG MLI MOZ MRT MUS MWI MYT NAM NER NGA OMN PSE QAT REU RWA SAU SDN "
    "SEN SHN SLE SOM SSD STP SWZ SYC SYR TCD TGO TUN TZA UGA YEM ZAF ZMB ZWE",
}
REGION_OF = {i: r for r, s in REGIONS.items() for i in s.split()}
H = {1: "H1", 2: "H2", 3: "H3", 4: "H4"}


def latest(folder: str, pattern: str) -> Path:
    files = sorted((RAW / folder).glob(pattern))
    if not files:
        raise SystemExit(f"missing raw file {folder}/{pattern}: run uv run pipeline/fetch/placebo_raw.py")
    return files[-1]


def load_json(p: Path):
    return json.loads(gzip.decompress(p.read_bytes()) if p.suffix == ".gz" else p.read_text())


# ---------------------------------------------------------------- inputs


def load_inputs() -> dict:
    usd = {int(y): v for y, v in load_json(latest("ecb_placebo", "EXR_USD_annual_*.json"))["annual"].items()}
    imts = load_json(latest("imf_imts_placebo", "IMTS_RUS_annual_*.json.gz"))
    ci = {c: i for i, c in enumerate(imts["columns"])}
    own, mirror = {}, {}
    for r in imts["rows"]:
        if not r[ci["OBS_VALUE"]]:
            continue
        y, v = int(r[ci["TIME_PERIOD"]]), float(r[ci["OBS_VALUE"]]) / usd[int(r[ci["TIME_PERIOD"]])] / 1e9
        c, p, ind = r[ci["COUNTRY"]], r[ci["COUNTERPART_COUNTRY"]], r[ci["INDICATOR"]]
        if p == "RUS" and c != "RUS":
            own[(c, "to_rus" if ind == "MG_CIF_USD" else "from_rus", y)] = v
        elif c == "RUS":  # Russia's exports to p are p's purchases from Russia (the mirror)
            mirror[(p, "to_rus" if ind == "XG_FOB_USD" else "from_rus", y)] = v
    wb = load_json(latest("worldbank_placebo", "NY.GDP.MKTP.CD_*.json"))[1]
    gdp = {(r["countryiso3code"], int(r["date"])): r["value"] / usd[int(r["date"])] / 1e9
           for r in wb if r["value"] and r["countryiso3code"]}  # fmt: skip
    fred = load_json(latest("fred_placebo", "commodities_monthly_*.json"))["series"]
    ann = {k: {y: statistics.mean(v for m, v in s.items() if int(m[:4]) == y) / usd[y] for y in usd}
           for k, s in fred.items()}  # fmt: skip
    nf = {int(y): v for y, v in load_json(latest("eurostat_placebo", "sts_inpi_a_EA20_*.json"))["annual"].items()}
    data = json.loads((ROOT / "site" / "data.json").read_text())
    return {"own": own, "mirror": mirror, "gdp": gdp, "prices": ann, "nonfuel": nf, "usd": usd, "data": data,
            "mix": json.loads((GAPS / "energy2.json").read_text())["fuel_mix_2019_2021"],
            "bands": load_bands(), "files": sorted({str(p.relative_to(RAW)) for p in (
                latest("ecb_placebo", "*.json"), latest("imf_imts_placebo", "*.json.gz"),
                latest("worldbank_placebo", "*.json"), latest("fred_placebo", "*.json"),
                latest("eurostat_placebo", "*.json"))})}  # fmt: skip


def load_bands() -> dict:
    """The no-war bands as build_data.py counterfactual() assigns them: cf_bands.json's cumulative bands, the
    re-measured to_rus size-class bands (to_rus_cf.json), the pipeline fuel buyers' bands (fuel_volume_cf.json),
    the neighbours' own bands (cf_bands.json countries) and Belarus's own yearly band (belarus.json)."""
    cb = json.loads((GAPS / "cf_bands.json").read_text())
    table = cb["cumulative_bands"]
    for d in json.loads((GAPS / "to_rus_cf.json").read_text())["countries"].values():
        for t in ("chosen", "rw"):
            if f"to_rus/{d['size_class']}" in table[t]:
                table[t][f"to_rus/{d['size_class']}"] = d["cumulative_band"]
    own = {}
    for iso3, d in json.loads((GAPS / "fuel_volume_cf.json").read_text())["countries"].items():
        if d.get("status") == "new":
            own[(iso3, "to_rus")] = d["cumulative_band"]
    for iso3, flows in cb["countries"].items():
        for key, d in flows.items():
            own[(iso3, key)] = d["cumulative_band"]
    blr = json.loads((GAPS / "belarus.json").read_text())["countries"]["BLR"]["counterfactual"]["to_rus"]
    return {"table": table, "own": own, "blr_yearly": [blr["multiplier_vs_2021"][str(y)] for y in range(2022, 2027)]}


# ---------------------------------------------------------------- price levels


def price_index(inp: dict, iso3: str, flow: str, window: list[int], years: list[int]) -> dict[int, float]:
    """The flow's price level per year, the window's mean = 1, in EUR: purchases from Russia with the fixed-weight
    fuel-mix index (energy2.json's 2019-2021 mix; without gas for the gas-hidden importers), everything else with the
    euro-area import price index of industrial goods excluding energy (energy2.json's non_fuel_goods source)."""
    nf = inp["nonfuel"]
    comps = {"nonfuel": nf}
    weights = {"nonfuel": 1.0}
    if flow == "to_rus":
        m = inp["mix"].get(iso3) or default_mix(inp)
        P = inp["prices"]
        gas = P["PNGASJPUSDM"] if iso3 in ASIA_LNG else P["PNGASEUUSDM"]
        comps.update({"crude": P["POILBREUSDM"], "products": P["POILBREUSDM"], "gas": gas,
                      "coal": P["PCOALAUUSDM"], "other_fossil": P["POILBREUSDM"]})  # fmt: skip
        fs = m.get("fossil_share") or 0.0
        weights = {k: fs * (m.get(k) or 0.0) for k in ("crude", "products", "gas", "coal", "other_fossil")}
        weights["nonfuel"] = 1.0 - fs
        if iso3 in GAS_HIDDEN:
            weights["gas"] = 0.0
        tot = sum(weights.values()) or 1.0
        weights = {k: w / tot for k, w in weights.items()}
    rel = {
        k: {y: s[y] / statistics.mean(s[w] for w in window) for y in set(window) | set(years)} for k, s in comps.items()
    }
    return {y: sum(w * rel[k][y] for k, w in weights.items()) for y in set(window) | set(years)}


_DEFAULT_MIX: dict = {}


def default_mix(inp: dict) -> dict:
    """Countries outside energy2.json's 60-odd importers: the value-weighted mix of those listed."""
    if not _DEFAULT_MIX:
        mx = [m for m in inp["mix"].values() if isinstance(m, dict) and m.get("imports_from_rus_2019_2021_eur_bn")]
        w = sum(m["imports_from_rus_2019_2021_eur_bn"] for m in mx)
        fs = sum(m["imports_from_rus_2019_2021_eur_bn"] * m["fossil_share"] for m in mx) / w
        _DEFAULT_MIX["fossil_share"] = fs
        for k in ("crude", "products", "gas", "coal", "other_fossil"):
            _DEFAULT_MIX[k] = sum(m["imports_from_rus_2019_2021_eur_bn"] * m["fossil_share"] * (m.get(k) or 0)
                                  for m in mx) / (w * fs)  # fmt: skip
    return _DEFAULT_MIX


# ---------------------------------------------------------------- the site's arithmetic


def ratios(obj: dict | None, key: str, defaults: tuple[float, float]) -> tuple[float, float]:
    """A country's 2021 range as factors on its central value (years_lo/years_hi or pidx_lo/pidx_hi)."""
    try:
        c, lo, hi = obj[key][0], obj[key + "_lo"][0], obj[key + "_hi"][0]
        if c and c > 0:
            return min(1.0, lo / c), max(1.0, hi / c)
    except (KeyError, TypeError, IndexError):
        pass
    return defaults


def spread(t: dict, band_scale: float = 1.0) -> tuple[float, float, float]:
    """site/index.html spread() for one trade series, held-flat expected path (q = 1), each year's volume valued at
    that year's price level (t.cur), weighted by a gain share when t has one (t.g = [low, central, high])."""
    n = len(t["c"])
    g = t.get("g") or (1.0, 1.0, 1.0)
    mid = se = bl = bh = al = ah = pl = ph = ql = qh = gl = gh = 0.0
    for i in range(n):
        k = t["cur"][i] * g[1]
        e0 = t["m"] * t["add"][i]
        e, a = e0 * k, t["c"][i] / t["p"][i] * k
        mid += e - a
        se += e
        bl += e - (t["b"][0] + t["m"] * (t["add"][i] - 1)) * k
        bh += (t["b"][1] + t["m"] * (t["add"][i] - 1)) * k - e
        al += t["h"][i] / t["p"][i] * k - a
        ah += a - t["l"][i] / t["p"][i] * k
        pl += t["c"][i] / t["pl"][i] * k - a
        ph += a - t["c"][i] / t["ph"][i] * k
        if t.get("yearly"):  # Belarus: its own yearly band, summed over the years (no cumulative band)
            ql += e * (1 - t["yearly"][i][0])
            qh += e * (t["yearly"][i][1] - 1)
        v0 = (e0 - t["c"][i] / t["p"][i]) * t["cur"][i]
        v, lo_, hi_ = v0 * g[1], v0 * g[0], v0 * g[2]
        gl += v - min(v, lo_, hi_)
        gh += max(v, lo_, hi_) - v
    if t.get("cb"):
        ql, qh = (1 - t["cb"][0]) * se, (t["cb"][1] - 1) * se
    ql, qh = ql * band_scale, qh * band_scale
    lo = math.sqrt(max(0.0, bl * bl + al * al - bl * al) + pl * pl + ql * ql + gl * gl)
    hi = math.sqrt(max(0.0, bh * bh + ah * ah - bh * ah) + ph * ph + qh * qh + gh * gh)
    return mid, mid - lo, mid + hi


def earned3(r: tuple[float, float, float], f: list[float]) -> tuple[float, float, float]:
    """site/index.html earned3(): sales count at the value kept x the share genuinely extra (c.vk, low/central/high)."""
    return r[0] * f[1], r[1] * (f[0] if r[1] >= 0 else f[2]), r[2] * (f[2] if r[2] >= 0 else f[0])


def total(parts: list[tuple[float, float, float]], rho: float) -> tuple[float, float, float]:
    """site/index.html total() for two parts with one correlation."""
    v = sum(p[0] for p in parts)

    def sp(d):
        s2 = sum(d(p) ** 2 for p in parts)
        if len(parts) == 2:
            s2 += (
                2
                * rho
                * math.copysign(1, parts[0][0] or 1)
                * math.copysign(1, parts[1][0] or 1)
                * d(parts[0])
                * d(parts[1])
            )
        return math.sqrt(max(0.0, s2))

    return v, v - sp(lambda p: p[0] - p[1]), v + sp(lambda p: p[2] - p[0])


# ---------------------------------------------------------------- one placebo


def size_class(avg: float) -> str:
    return "S" if avg < 0.1 else "M" if avg < 1.0 else "L"


def series(inp: dict, iso3: str, flow: str, years: list[int]) -> tuple[dict[int, float], int] | None:
    """Own report, the partner's (Russia's) report where the country filed none; None if a year is missing."""
    out, nmir = {}, 0
    for y in years:
        v = inp["own"].get((iso3, flow, y))
        if v is None:
            v = inp["mirror"].get((iso3, flow, y))
            nmir += v is not None
        if v is None:
            return None
        out[y] = v
    return out, nmir


def band_for(inp: dict, iso3: str, flow: str, size: str, h: int, sold_band: str) -> tuple[list | None, str]:
    B = inp["bands"]
    if iso3 == "BLR" and flow == "to_rus":
        return None, "own yearly (belarus.json)"
    if (iso3, flow) in B["own"]:
        d = B["own"][(iso3, flow)][H[h]]
        return [d["low"], d["high"]], "own (" + (
            "fuel_volume_cf" if flow == "to_rus" and iso3 not in ("MNG", "YEM", "MDA") else "cf_bands"
        ) + ")"
    if flow == "to_rus":
        d = B["table"]["chosen"][f"to_rus/{size}"][H[h]]
        return [d["low"], d["high"]], f"to_rus/{size} ({'to_rus_cf' if size != 'S' else 'cf_bands'})"
    cf = ((inp["data"]["countries"].get(iso3) or {}).get("from_rus") or {}).get("cf")
    tab = "chosen" if sold_band == "site" and cf == "lin" else "rw"
    d = B["table"][tab][f"from_rus/{size}"][H[h]]
    return [d["low"], d["high"]], f"from_rus/{size} ({'lin' if tab == 'chosen' else 'rw'})"


def part(inp: dict, iso3: str, flow: str, s: dict, years: list[int], sold_band: str):
    win, base_y = s["window"], s["base"]
    need = sorted(set(win) | set(s["size_window"]) | set(years))
    got = series(inp, iso3, flow, need)
    if got is None:
        return None
    val, nmir = got
    if not any(val[y] for y in need):
        return None
    site = (inp["data"]["countries"].get(iso3) or {}).get(flow) or {}
    alo, ahi = ratios(site, "years", inp["dflt"][flow]["years"])
    plo, phi = ratios(site, "pidx", inp["dflt"][flow]["pidx"])
    p = price_index(inp, iso3, flow, win, years)
    real = {y: val[y] / p[y] for y in win}
    avg_nominal = statistics.mean(val[y] for y in win)
    base = real[base_y]
    small = flow == "to_rus" and avg_nominal < SMALL_FLOW_EUR_BN and iso3 != "MDA"
    if small:
        base = statistics.median(real.values())
    b0 = min(val[base_y] * alo / (p[base_y] * phi), base)
    b1 = max(val[base_y] * ahi / (p[base_y] * plo), base)
    size = size_class(statistics.mean(val[y] for y in s["size_window"]))
    cb, band_src = band_for(inp, iso3, flow, size, len(years), sold_band)
    add = [1.0] * len(years)
    if iso3 == "CHN" and flow == "to_rus" and base > 0:  # contracted Power of Siberia gas above the base year
        price = statistics.mean(inp["prices"]["PNGASJPUSDM"][w] for w in win)  # EUR/mmbtu at window prices
        add = [1.0 + (POS_BCM.get(y, 0) - POS_BCM.get(base_y, 0)) * MMBTU_PER_M3 * price / base for y in years]
    t = {"c": [val[y] for y in years], "l": [val[y] * alo for y in years], "h": [val[y] * ahi for y in years],
         "p": [p[y] for y in years], "pl": [p[y] * plo for y in years], "ph": [p[y] * phi for y in years],
         "cur": [p[y] for y in years], "m": base, "b": [b0, b1], "cb": cb, "add": add}  # fmt: skip
    if cb is None:
        t["yearly"] = [[m["low"], m["high"]] for m in inp["bands"]["blr_yearly"][: len(years)]]
    if flow == "to_rus":
        g = (site.get("gain") or {}).get("e")
        t["g"] = (g[0][0], g[1][0], g[2][0]) if g else inp["dflt"]["gain"]
    return {"t": t, "size": size, "band": cb, "band_src": band_src, "small_flow_median": small, "mirror_years": nmir,
            "base_eur_bn_window_prices": round(base, 5), "avg_nominal_eur_bn": round(avg_nominal, 5)}  # fmt: skip


def evaluate(inp: dict, key: str, years: list[int] | None = None, sold_band: str = "rw", band_scale: float = 1.0):
    s = SETTINGS[key]
    years = years or s["years"]
    rows = []
    for iso3, c in sorted(inp["data"]["countries"].items()):
        if iso3 in ("RUS", "UKR"):
            continue
        gdps = [inp["gdp"].get((iso3, y)) for y in s["gdp_years"]]
        if not all(gdps):
            continue
        gdp = statistics.mean(gdps)
        pp = part(inp, iso3, "to_rus", s, years, sold_band)
        ps = part(inp, iso3, "from_rus", s, years, sold_band)
        if not pp and not ps:
            continue
        vk = (c.get("vk") or {}).get("rl") or [0.1, 0.2, 0.3]
        vkx = (c.get("vk") or {}).get("rx") or vk
        res = {}
        if pp:
            res["paid"] = spread(pp["t"], band_scale)
        if ps:
            r = spread(ps["t"], band_scale)
            res["sold"] = earned3(r, vk if r[0] >= 0 else vkx)
        pct = {k: tuple(100 * x / gdp for x in r) for k, r in res.items()}
        pct["trade"] = total(list(pct.values()), RHO_PAID_SOLD) if len(pct) == 2 else next(iter(pct.values()))
        comb = (pp["avg_nominal_eur_bn"] if pp else 0) + (ps["avg_nominal_eur_bn"] if ps else 0)
        row = {"iso3": iso3, "name": c.get("name"), "region": REGION_OF.get(iso3, "asia"), "gdp_eur_bn": round(gdp, 2),
               "ranked": gdp >= RANKED_GDP_EUR_BN and iso3 not in PARTY_TO_WAR,
               "size": "large" if comb >= 1.0 else "small", "trade_with_russia_eur_bn": round(comb, 4)}  # fmt: skip
        for k, r in pct.items():
            row[k] = {"pct_gdp": round(r[0], 4), "lo": round(r[1], 4), "hi": round(r[2], 4),
                      "contains_zero": r[1] <= 0 <= r[2], "needed_scale": round(needed(r), 3)}  # fmt: skip
        for k, p_ in (("paid", pp), ("sold", ps)):
            if p_:
                row[k].update({kk: p_[kk] for kk in ("size", "band", "band_src", "small_flow_median", "mirror_years",
                                                     "base_eur_bn_window_prices", "avg_nominal_eur_bn")})  # fmt: skip
        rows.append(row)
    return rows


def needed(r: tuple[float, float, float]) -> float:
    """How many times wider the range would have to be (both sides) to reach zero; <= 1 when it contains zero."""
    v, lo, hi = r
    if lo <= 0 <= hi:
        return min(1.0, abs(v) / (v - lo) if v > 0 and v > lo else abs(v) / (hi - v) if v < 0 and hi > v else 0.0)
    return v / (v - lo) if v > 0 else -v / (hi - v) if hi > v else float("inf")


def cov(rows: list[dict], key: str = "trade", pred=lambda r: True) -> dict:
    sel = [r for r in rows if key in r and pred(r)]
    if not sel:
        return {"n": 0, "coverage": None}
    n, k = len(sel), sum(r[key]["contains_zero"] for r in sel)
    below = sum(r[key]["hi"] < 0 for r in sel)
    # Wilson 90% interval: sampling error only, as if countries were independent (they are not: shared shocks)
    z, p = 1.645, k / n
    c, w = (
        (p + z * z / (2 * n)) / (1 + z * z / n),
        z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n),
    )
    return {"n": n, "contains_zero": k, "coverage": round(p, 3), "wilson90": [round(c - w, 3), round(min(1.0, c + w), 3)],
            "miss_below_zero": below, "miss_above_zero": n - k - below}  # fmt: skip


def summary(rows: list[dict]) -> dict:
    ranked = [r for r in rows if r["ranked"]]
    out = {"ranked": {"trade": cov(ranked), "paid": cov(ranked, "paid"), "sold": cov(ranked, "sold")},
           "all": {"trade": cov(rows), "paid": cov(rows, "paid"), "sold": cov(rows, "sold")}}  # fmt: skip
    out["ranked_by_size"] = {s: cov(ranked, pred=lambda r, s=s: r["size"] == s) for s in ("small", "large")}
    out["ranked_by_region"] = {g: cov(ranked, pred=lambda r, g=g: r["region"] == g) for g in REGIONS.keys() | {"asia"}}
    out["ranked_by_part_size_class"] = {
        k: {s: cov(ranked, k, lambda r, k=k, s=s: r[k]["size"] == s) for s in "SML"} for k in ("paid", "sold")
    }
    z = sorted(r["trade"]["needed_scale"] for r in ranked)
    out["ranked_range_scale_for_90pct"] = round(z[math.ceil(0.9 * len(z)) - 1], 2) if z else None
    return out


def band_scale_for(inp: dict, key: str, target: float = 0.9) -> float | None:
    """The factor on the no-war band term alone (ql, qh) at which the ranked countries' coverage reaches target."""

    def c(lam):
        return cov([r for r in evaluate(inp, key, band_scale=lam) if r["ranked"]])["coverage"]

    lo, hi = 0.05, 1.0
    if c(lo) >= target:
        return lo
    while c(hi) < target:
        hi *= 2
        if hi > 64:
            return None
    for _ in range(14):
        mid = (lo + hi) / 2
        lo, hi = (lo, mid) if c(mid) >= target else (mid, hi)
    return round(hi, 2)


def defaults(data: dict) -> dict:
    """Median 2021 ranges across the site's countries, for a country whose own is missing."""
    out = {}
    for flow in ("to_rus", "from_rus"):
        objs = [c.get(flow) for c in data["countries"].values() if c.get(flow)]
        out[flow] = {}
        for key in ("years", "pidx"):
            rs = [ratios(o, key, (None, None)) for o in objs]
            rs = [r for r in rs if r[0] is not None]
            out[flow][key] = (statistics.median(r[0] for r in rs), statistics.median(r[1] for r in rs))
    gs = [c["to_rus"]["gain"]["e"] for c in data["countries"].values() if (c.get("to_rus") or {}).get("gain")]
    out["gain"] = tuple(statistics.median(g[b][0] for g in gs) for b in range(3))
    return out


def main() -> None:
    inp = load_inputs()
    inp["dflt"] = defaults(inp["data"])
    result = {
        "generated": "2026-10-24",
        "what": "Placebo test of the likely ranges of the two trade parts (paid: purchases from Russia; sold: sales to "
        "Russia) and their sum: the method rerun as if the war had started in 2018 (and in 2014). The truth is zero, "
        "so coverage = the share of countries whose likely range contains zero.",
        "settings": {
            "placebos": SETTINGS,
            "expected_level": "paid: base year held flat at window prices; median of the window where purchases were "
            "under EUR 1bn a year (as build_data.py small_flow_base). sold: base year held flat (the method's linear "
            "nowcast is not reproducible from the repository).",
            "bands": "cumulative 90% no-war bands for the number of years summed (H4; H2 in the short variant): "
            "cf_bands.json, with to_rus L/M from to_rus_cf.json, pipeline buyers from fuel_volume_cf.json, own bands "
            "for MNG/YEM/TJK/MDA from cf_bands.json countries, Belarus's yearly band from belarus.json; size class "
            "from the 4-year average before the placebo (S < 0.1, M 0.1-1, L > 1 EUR bn). sold: the random-walk band "
            "(matching the held-flat centre); variant 'site band' uses the lin band where the site uses the nowcast.",
            "data_ranges": "each country's 2021 actual-value and price-level ranges in site/data.json (years_lo/hi, "
            "pidx_lo/hi as factors on the central value), applied to every placebo year; site medians where missing",
            "prices": "fixed-weight fuel-mix index (energy2.json 2019-2021 mix; gas left out for the ten gas-hidden "
            "importers) from IMF commodity prices in EUR (Brent for crude, products and other fuels; EU gas, or Japan "
            "LNG for JPN/KOR/TWN/CHN/IND; Australian coal); other goods: Eurostat EA import prices, industrial goods "
            "excluding energy. Window mean = 1. Each year's change is valued at that year's price level.",
            "weights": "paid at Russia's net gain share (site/data.json to_rus.gain, its 2021 value, with its range); "
            "sold at the value kept (c.vk rl/rx), as earned3()",
            "combination": "site/index.html spread(): base and actual values correlated 0.5, price, no-war band and "
            "gain-share terms independent, square root of the sum of squares; paid and sold combined with "
            "correlation 0.2 (RHO paid|sold) as total()",
            "ranked": f"placebo GDP (mean of the first three placebo years) >= EUR {RANKED_GDP_EUR_BN:.0f}bn, "
            "excluding Belarus and North Korea (parties to the war)",
            "size": "large = purchases plus sales with Russia >= EUR 1bn a year in the pre-war window, else small",
            "raw_files": inp["files"],
            "site_data_generated": inp["data"].get("generated"),
        },
        "placebos": {},
    }
    for key in SETTINGS:
        rows = evaluate(inp, key)
        s = summary(rows)
        short = SETTINGS[key]["years"][:2]
        s["variant_sold_site_band"] = {
            k: cov([r for r in evaluate(inp, key, sold_band="site") if r["ranked"]], k) for k in ("trade", "sold")
        }
        s["variant_first_two_years"] = {
            "years": short,
            **{
                k: cov([r for r in evaluate(inp, key, years=short) if r["ranked"]], k)
                for k in ("trade", "paid", "sold")
            },
        }
        s["nowar_band_scale_for_90pct"] = band_scale_for(inp, key)
        result["placebos"][key] = {"summary": s, "countries": rows}
        print(f"placebo {key}: ranked trade coverage {s['ranked']['trade']['coverage']} (n {s['ranked']['trade']['n']}), "
              f"paid {s['ranked']['paid']['coverage']}, sold {s['ranked']['sold']['coverage']}; "
              f"no-war band x{s['nowar_band_scale_for_90pct']} for 90%")  # fmt: skip
    OUT.write_text(json.dumps(result, indent=1, ensure_ascii=False) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
