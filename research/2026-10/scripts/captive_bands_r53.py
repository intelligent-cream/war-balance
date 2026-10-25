"""Round 53 (owner: "check 1"): a no-war band for the ENERGY purchases of "captive energy buyers".

Hypothesis: countries whose fuel or gas from Russia had essentially one realistic supplier before the war (landlocked,
or pipeline-bound gas with no LNG terminal) bought steadier energy volumes from Russia than general trade moves, so a
band measured only on those captive energy flows, back-tested on rolling origins 2005-2016, is narrower than the
general band the site uses for the whole of "paid" (to_rus). Non-energy purchases keep the current band.

Steps (from the repository root):

  python3 -I research/2026-10/scripts/captive_bands_r53.py run
      back-tests + application; reads only committed raw files (research/2026-10/raw/demand_cf_r48, oec_baci_r44,
      share_cf_r50) and site/data.json; writes research/2026-10/gaps/captive_bands_r53.json and
      <scratch>/site_patch_r53.json (the patched to_rus fields for the site's own model)
  node <scratch>/ba.mjs
      runs the site's own model (site/index.html, site/data.json) before and after the patch; writes
      <scratch>/before_after_r53.json
  python3 -I research/2026-10/scripts/captive_bands_r53.py merge
      adds the before/after (range width in % of GDP, chance and group of the net and of Russia's earnings) to the JSON

No download: every input is an extract committed by rounds 44, 48 and 50 (CEPII BACI via the OEC API; Eurostat energy
imports by country of origin), so research/2026-10/raw/captive_bands_r53/ only holds the route table's sources.
Round 48's script (demand_cf_r48.py: its BACI and Eurostat loaders, cumulative error, era calibration and placebo) is
imported, not copied, so the error and the calibration are exactly the ones used by rounds 48-50.
"""

import importlib.util
import json
import math
import sys
from pathlib import Path

import numpy as np

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
GAPS = R / "gaps"
RAWDIR = R / "raw" / "captive_bands_r53"
SITE = ROOT / "site"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r53")

_spec = importlib.util.spec_from_file_location("d48", Path(__file__).resolve().parent / "demand_cf_r48.py")
d48 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(d48)

# --------------------------------------------------------------------------------------------------------------------
# the rule (fixed in this file before any back-test result was computed, 2026-10-25 22:05 UTC; copied to the notes)
# --------------------------------------------------------------------------------------------------------------------
RULE = {
    "written": "2026-10-25 22:05 UTC, before any back-test result was computed",
    "captive_flow": (
        "a country x energy product (HS 2701 coal, 2709 crude, 2710 oil products, 2711 gas) is CAPTIVE when (1) Russia's "
        "share of the country's imports of that product is >= 70%, averaged over the reference years (2017-2021 for the "
        "2022-2026 application; the four years to the origin, o-3..o, in the back-test, so no window is selected on its "
        "own future), (2) the product could not reach the country by sea: the country is landlocked (UN LLDC list), or "
        "the product is natural gas and the country had no LNG import terminal feeding its grid in that year, and (3) the "
        "flow averaged at least EUR 10 m a year over the reference years at fixed 2019-2021 unit values"
    ),
    "data_sets": (
        "shares and volumes from Eurostat energy imports by country of origin (gas TJ GCV, crude and oil products kt, "
        "coal kt) for the countries Eurostat covers (EU, Western Balkans, Moldova, Georgia, Turkiye, Norway, UK); CEPII "
        "BACI elsewhere (Russia's exports to the country in tonnes; shares on value). One data set per country. Fixed "
        "2019-2021 unit values to add products (round 8): crude EUR 370/t, products 420/t, pipeline gas EUR 4.67/GJ "
        "(249/t in BACI tonnes at 53.4 GJ/t), coal 60/t. BACI tonnes are used only when the unit value is within x1/3-x3 "
        "of the world unit value of the heading that year (else missing). Eurostat exact zeros between positive years "
        "are missing (round 8 cleaning)"
    ),
    "unit_of_test": (
        "a country's captive energy basket at an origin o (the sum of its captive products at o), in volume at fixed "
        "unit values; the centre is HELD FLAT at the origin year (as the site's to_rus centre); the error is the site's "
        "cumulative error log(sum w x actual / sum w x predicted), H = 1..5, w = 1 except 8/12 for the fifth year. "
        "Origins 2005-2016 for the band; 2017 only for the 2018 placebo. Ukraine and Russia are left out; Belarus is in"
    ),
    "band": (
        "era-calibrated 90% band (round 7/48 method: 5th-95th percentile of the pooled errors x K, K the smallest factor "
        ">= 0.5 at which bands from two eras cover >= 90% of the third; eras 2005-09, 2010-12, 2013-16), per horizon"
    ),
    "accept_pooled_if_all": [
        (
            "(a) narrower: the H5 captive band's log width is smaller than the current site band for those flows: the "
            "generic band of large purchases x CB_SCALE_PAID (0.652-1.500 for 2022-2026), the band almost every "
            "captive country carries"
        ),
        (
            "(b) coverage: leave-era-out (band from the other two eras x K) coverage of the H5 errors >= 80% at EACH "
            "origin 2005-2016 and >= 90% pooled"
        ),
        (
            "(c) placebo: the band built only from origins whose windows end before the placebo window (x K) covers "
            ">= 90% of the captive windows for the war moved to 2014 (origin 2013, H5, trained on origins <= 2008) and "
            "to 2018 (origin 2017, H4, trained on origins <= 2013)"
        ),
        "(d) centre: held flat (the current site centre); this round changes only the range, never the centre",
    ],
    "accept_country_if_all": (
        "the pooled rule passes, and the country has >= 6 H5 windows, the pooled band covers >= 80% of them, and the band "
        "rebuilt without the country (leave-country-out, recalibrated) also covers >= 80% of them; and its combined "
        "2022-2026 band (below) is narrower than its current site band. Countries with fewer windows are reported, not "
        "changed"
    ),
    "application": (
        "'paid' is all goods. Per country, W = the captive products' share of its 2021 purchases from Russia (BACI "
        "value), raised each year by the no-war fuel price factor the site's expected path carries (as round 44's "
        "Japan LNG split: w_t = s (b_t - (1 - f)) / f / b_t, f = the HS 27 share of 2021 purchases); the cumulative band "
        "is the combination of the captive energy band (share W) and the country's current band for the rest (1 - W): "
        "half-width = sqrt((W a)^2 + ((1 - W) b)^2 + 2 rho W (1 - W) a b), rho = 0.26 (the owner's value for fuel / "
        "non-fuel errors, round 8 / round 44). The current band before the round 51-52 strike adjustment is combined, "
        "then the strike widening is added back unchanged. The yearly bands (bmul_lo/hi) are scaled by the same factor "
        "per side as the 2022-2026 band"
    ),
    "stress_cases": "the 2006 and 2009 gas crises (Ukraine transit) and the 2014 shock are reported: errors of the "
    "windows that contain them, single-year errors for 2006, 2009 and 2014, and the origin coverage",
    "multiple_testing": "one pooled test plus per-country checks; per product and per group (gas, oil) cells are "
    "reported as diagnostics, not used to pass anything",
}

ENERGY = ("crude", "products", "gas", "coal")
HS4_OF = d48.HS4_OF
# fixed 2019-2021 unit values (round 8): EUR per t, and EUR per TJ GCV for Eurostat gas
UV_T = {"crude": 370.0, "products": 420.0, "gas": 4.67 * 53.4, "coal": 60.0}
UV_EUROSTAT = {"crude": 370.0e3, "products": 420.0e3, "gas": 4.67e3, "coal": 60.0e3}  # per kt, per TJ
SHARE_MIN = 0.70
MIN_EUR = 10e6
ORIGINS = list(range(2005, 2017))
ERAS = d48.ERAS
PLACEBOS = d48.PLACEBOS
W5 = d48.W5
EXCLUDE = {"UKR", "RUS"}
RHO = 0.26
CB_SCALE_PAID = 0.81
# UN-OHRLLS list of landlocked developing countries plus the landlocked European countries (Europe and Asia only matter)
LANDLOCKED = {
    "AFG", "ARM", "AZE", "BLR", "BOL", "BWA", "BFA", "BDI", "CAF", "TCD", "ETH", "KAZ", "KGZ", "LAO", "LSO", "MWI",
    "MLI", "MDA", "MNG", "NPL", "NER", "MKD", "PRY", "RWA", "SSD", "SWZ", "TJK", "TKM", "UGA", "UZB", "ZMB", "ZWE",
    "AUT", "CZE", "HUN", "SVK", "SRB", "CHE", "LIE", "LUX", "AND", "SMR", "VAT", "XKX",
}  # fmt: skip
# LNG import terminals feeding the grid, first year of operation (GIIGNL annual reports; see raw/captive_bands_r53)
LNG_FROM = {
    "BEL": 1987, "ESP": 1969, "FRA": 1972, "ITA": 1971, "PRT": 2004, "GBR": 1964, "GRC": 2000, "TUR": 1994,
    "NLD": 2011, "LTU": 2014, "POL": 2016, "MLT": 2017, "HRV": 2021, "JPN": 1969, "KOR": 1986, "CHN": 2006,
    "IND": 2004, "TWN": 1990, "USA": 1971, "MEX": 2006, "ARG": 2008, "BRA": 2009, "CHL": 2009, "ISR": 2013,
    "EGY": 2015, "JOR": 2015, "PAK": 2015, "THA": 2011, "SGP": 2013, "MYS": 2013, "IDN": 2012, "ARE": 2010,
    "KWT": 2009, "DOM": 2003, "PRI": 2000, "CAN": 2009, "COL": 2016, "JAM": 2016, "BGD": 2018, "PAN": 2018,
    "SWE": 2011, "FIN": 2022, "EST": 2022, "LVA": 2030, "BGR": 2030, "ROU": 2030, "DEU": 2022, "IRL": 2030,
    "SRB": 2030, "BIH": 2030, "MKD": 2030, "MDA": 2030, "GEO": 2030, "ARM": 2030, "ALB": 2030, "MNE": 2030,
    "NOR": 2030, "DNK": 2030, "SVN": 2030, "CYP": 2030,
}  # fmt: skip
# the site's generic band for large purchases from Russia (to_rus_cf.json, size L) before x CB_SCALE_PAID
GENERIC_L = {
    "H1": (0.66, 1.436), "H2": (0.601, 1.483), "H3": (0.604, 1.535), "H4": (0.588, 1.56), "H5": (0.57, 1.617),
}  # fmt: skip


def site_scaled(lo: float, hi: float) -> tuple[float, float]:
    return 1 - (1 - lo) * CB_SCALE_PAID, 1 + (hi - 1) * CB_SCALE_PAID


def route_captive(iso: str, p: str, y: int) -> bool:
    if iso in LANDLOCKED:
        return True
    return p == "gas" and LNG_FROM.get(iso, 2030) > y


# --------------------------------------------------------------------------------------------------------------------
# series
# --------------------------------------------------------------------------------------------------------------------


# correction after the first run (documented in the notes; the as-written result is kept as a diagnostic): round 8's
# cleaning also set to missing a run of exact zeros to the end of a series after a steady positive series while the
# total from all origins goes on (Austria's gas origin from 2009, Croatia's from 2011: confidentiality, not a stop)
CLEAN_TRAILING = True


def clean_zeros(s: dict[int, float], tot: dict[int, float] | None = None) -> dict[int, float]:
    """Round 8: an exact zero between positive years is a confidentiality artefact (missing); with CLEAN_TRAILING, so is
    a run of zeros to the end after at least three positive years while the total stays positive."""
    ys = sorted(s)
    out = dict(s)
    for i, y in enumerate(ys):
        if s[y] == 0 and any(s[x] > 0 for x in ys[:i]) and any(s[x] > 0 for x in ys[i + 1 :]):
            out.pop(y)
    if CLEAN_TRAILING and tot is not None:
        pos = [y for y in ys if s[y] > 0]
        if len(pos) >= 3 and all(s[y] == 0 for y in ys if y > pos[-1]):
            for y in ys:
                if y > pos[-1] and (tot.get(y) or 0) > 0:
                    out.pop(y, None)
    return out


def build_series(B, ea) -> dict:
    """{iso: {"data": "eurostat"|"baci", p: {"vol": {y: EUR at fixed uv}, "share": {y: Russian share}}}}"""
    out: dict = {}
    covered = set(ea)
    for iso, prods in ea.items():
        if iso in EXCLUDE:
            continue
        c = out.setdefault(iso, {"data": "eurostat"})
        for p in ENERGY:
            d = prods.get(p)
            if not d:
                continue
            tot = d.get("TOTAL", {})
            ru = clean_zeros({y: v for y, v in d.get("RU", {}).items() if v is not None}, tot)
            vol = {y: v * UV_EUROSTAT[p] for y, v in ru.items()}
            share = {y: ru[y] / tot[y] for y in ru if tot.get(y)}
            c[p] = {"vol": vol, "share": share}
    for iso in B.rus_f:
        if iso in covered or iso in EXCLUDE:
            continue
        c = out.setdefault(iso, {"data": "baci"})
        for p, h in HS4_OF.items():
            vol, share = {}, {}
            for y in range(2001, 2025):
                v, t = B.rus_f.get(iso, {}).get(y, {}).get(h, (0.0, 0.0))
                tot = B.imp_f.get(iso, {}).get(y, {}).get(h, (0.0, 0.0))[0]
                if tot > 0:
                    share[y] = min(1.0, v / tot)
                if v <= 0:
                    vol[y] = 0.0
                    continue
                w = B.wuv[p].get(y)
                if t > 0 and w and 1 / 3 <= (v / t) / w <= 3:
                    vol[y] = t * UV_T[p]
            if any(vol.values()):
                c[p] = {"vol": vol, "share": share}
    return out


def value_series(B, iso: str, p: str, o: int) -> dict[int, float]:
    """Variant: BACI value of Russia's exports of p to iso, deflated by the world unit-value index (origin prices)."""
    P = B.price[p]
    return {
        y: B.rus_f.get(iso, {}).get(y, {}).get(HS4_OF[p], (0.0, 0.0))[0] / P[y] * P[o] / B.eur[y]
        for y in range(2001, 2022)
        if y in P and y in B.eur
    }


def captive_at(c: dict, iso: str, years: list[int]) -> dict[str, float]:
    """Captive products over the reference years, with their average fixed-uv value."""
    out = {}
    for p in ENERGY:
        d = c.get(p)
        if not d or not all(route_captive(iso, p, y) for y in years):
            continue
        vals = [d["vol"].get(y) for y in years]
        shs = [d["share"].get(y) for y in years]
        if any(v is None or v <= 0 for v in vals) or any(s is None for s in shs):
            continue
        if sum(shs) / len(shs) >= SHARE_MIN and sum(vals) / len(vals) >= MIN_EUR:
            out[p] = sum(vals) / len(vals)
    return out


def cases(S: dict, B, lookahead: dict | None = None) -> list[dict]:
    """One case per country and origin: the captive basket held flat at the origin year."""
    out = []
    for iso, c in S.items():
        for o in [*ORIGINS, 2017]:
            win = [o - 3, o - 2, o - 1, o]
            prods = captive_at(c, iso, win) if lookahead is None else lookahead.get(iso, {})
            prods = {p: v for p, v in prods.items() if c.get(p) and (c[p]["vol"].get(o) or 0) > 0}
            if not prods:
                continue
            last = min(o + 5, 2021)
            actual = {}
            for t in range(o + 1, last + 1):
                xs = [c[p]["vol"].get(t) for p in prods]
                if any(x is None for x in xs):
                    break
                actual[t] = sum(xs)
            start = sum(c[p]["vol"][o] for p in prods)
            errs = d48.cum_err(actual, {t: start for t in actual}, o)
            if not errs:
                continue
            single = {t: math.log(actual[t] / start) if actual[t] > 0 and start > 0 else None for t in actual}
            vact = {}
            for t in range(o + 1, last + 1):
                xs = [value_series(B, iso, p, o).get(t) for p in prods]
                if any(x is None for x in xs):
                    break
                vact[t] = sum(xs)
            v0 = sum(value_series(B, iso, p, o).get(o, 0.0) for p in prods)
            verrs = d48.cum_err(vact, {t: v0 for t in vact}, o) if v0 > 0 else {}
            out.append({
                "iso": iso, "o": o, "data": c["data"], "prods": sorted(prods), "start_eur_m": round(start / 1e6, 1),
                "errs": {"M0": errs}, "verrs": {"M0": verrs}, "single": single,
                "group": "gas" if set(prods) == {"gas"} else "oil" if set(prods) <= {"crude", "products"} else "mixed",
            })  # fmt: skip
    return out


# --------------------------------------------------------------------------------------------------------------------
# evaluation
# --------------------------------------------------------------------------------------------------------------------


def errs_at(rows, H, key="errs", omax=2016):
    return [r[key]["M0"][f"H{H}"] for r in rows if r["o"] <= omax and f"H{H}" in r[key]["M0"]]


def band(rows, H, key="errs") -> dict:
    b = d48.band_of([r for r in rows if r["o"] <= 2016], "M0", H, key=lambda r: r[key])
    return b


def leave_era_out(rows, H, K, key="errs") -> dict:
    by_era = {e: [r for r in rows if r["o"] in rg and f"H{H}" in r[key]["M0"]] for e, rg in ERAS.items()}
    per_o, hits, n = {}, 0, 0
    for e, test in by_era.items():
        train = [r[key]["M0"][f"H{H}"] for e2, rs in by_era.items() if e2 != e for r in rs]
        if len(train) < 5:
            continue
        lo, hi = K * d48.q(train, 0.05), K * d48.q(train, 0.95)
        for o in ERAS[e]:
            es = [r[key]["M0"][f"H{H}"] for r in test if r["o"] == o]
            if es:
                h = sum(lo <= x <= hi for x in es)
                per_o[str(o)] = {"n": len(es), "coverage": round(h / len(es), 3)}
                hits += h
                n += len(es)
    return {"per_origin": per_o, "pooled": round(hits / n, 3) if n else None, "n": n}


def coverage(es, lo, hi) -> float | None:
    return round(sum(math.log(lo) <= x <= math.log(hi) for x in es) / len(es), 3) if es else None


def judge_pooled(rows, key="errs") -> dict:
    b5 = band(rows, 5, key)
    if "band" not in b5:
        return {"PASS": False, "why_not": "too few windows", "band_H5": b5}
    K = b5["K"]
    site = site_scaled(*GENERIC_L["H5"])
    site_w = math.log(site[1]) - math.log(site[0])
    ok_a = b5["log_width"] < site_w
    leo = leave_era_out(rows, 5, K, key)
    ok_b = (leo["pooled"] or 0) >= 0.9 and all(v["coverage"] >= 0.8 for v in leo["per_origin"].values())
    ok_b = ok_b and len(leo["per_origin"]) == len(ORIGINS)
    plc = d48.placebo_cov(rows, "M0", K, key=lambda r: r[key])
    ok_c = all(v["coverage"] is not None and v["coverage"] >= 0.9 for v in plc.values())
    es = errs_at(rows, 5, key)
    why = []
    if not ok_a:
        why.append("(a) not narrower than the site band")
    if not ok_b:
        bad = [o for o, v in leo["per_origin"].items() if v["coverage"] < 0.8]
        miss = [str(o) for o in ORIGINS if str(o) not in leo["per_origin"]]
        why.append(
            f"(b) coverage: pooled {leo['pooled']}"
            + (f", origins under 80%: {','.join(bad)}" if bad else "")
            + (f", origins without windows: {','.join(miss)}" if miss else "")
        )
    if not ok_c:
        why.append("(c) placebo under 90%: " + ", ".join(f"{k} {v['coverage']}" for k, v in plc.items()))
    return {
        "n_windows_H5": len(es),
        "n_countries": len({r["iso"] for r in rows if r["o"] <= 2016 and "H5" in r[key]["M0"]}),
        "band_H5": {k: b5.get(k) for k in ("band", "K", "era_coverage", "n", "log_width")},
        "site_band_H5": [round(site[0], 4), round(site[1], 4)],
        "site_band_log_width": round(site_w, 4),
        "width_ratio_vs_site": round(b5["log_width"] / site_w, 3),
        "site_band_coverage_on_these_windows": coverage(es, *site),
        "median_error_H5": round(float(np.median(es)), 4) if es else None,
        "leave_era_out": leo,
        "placebo": plc,
        "pass_a_narrower": ok_a,
        "pass_b_coverage": ok_b,
        "pass_c_placebo": ok_c,
        "pass_d_centre": True,
        "PASS": ok_a and ok_b and ok_c,
        "why_not": "; ".join(why) or None,
    }


def bands_all_h(rows, K=None, key="errs") -> dict:
    out = {}
    for H in range(1, 6):
        es = errs_at(rows, H, key)
        if len(es) < 10:
            continue
        b = band(rows, H, key) if K is None else None
        k = K if K is not None else b["K"]
        out[f"H{H}"] = {
            "low": round(math.exp(k * d48.q(es, 0.05)), 4),
            "high": round(math.exp(k * d48.q(es, 0.95)), 4),
            "K": k,
            "n": len(es),
        }
    return out


def per_country(rows, pooled_band) -> dict:
    out = {}
    lo, hi = pooled_band
    for iso in sorted({r["iso"] for r in rows}):
        own = [r for r in rows if r["iso"] == iso and r["o"] <= 2016 and "H5" in r["errs"]["M0"]]
        if not own:
            continue
        es = [r["errs"]["M0"]["H5"] for r in own]
        rest = [r for r in rows if r["iso"] != iso]
        lco = band(rest, 5)
        lco_band = lco.get("band")
        d = {
            "n_windows_H5": len(es),
            "data": own[0]["data"],
            "products": sorted({p for r in own for p in r["prods"]}),
            "origins": [r["o"] for r in own],
            "errors_H5": [round(math.exp(x), 3) for x in es],
            "median_error_H5": round(math.exp(float(np.median(es))), 3),
            "pooled_band_coverage": coverage(es, lo, hi),
            "leave_country_out_band": lco_band,
            "leave_country_out_coverage": coverage(es, *lco_band) if lco_band else None,
            "own_q05_q95": [round(math.exp(d48.q(es, 0.05)), 3), round(math.exp(d48.q(es, 0.95)), 3)]
            if len(es) >= 8
            else None,
        }
        d["country_check"] = bool(
            len(es) >= 6 and (d["pooled_band_coverage"] or 0) >= 0.8 and (d["leave_country_out_coverage"] or 0) >= 0.8
        )
        out[iso] = d
    return out


def own_country(rows) -> dict:
    """Owner's 'separately per country where n allows' (a diagnostic: the pre-registered rule needs the pooled pass
    first): the country's own era-calibrated band, leave-era-out coverage of its own windows, placebo on its own
    windows (needs >= 10 training windows, so it cannot be measured on 4-9 origins up to 2008/2013)."""
    out = {}
    for iso in sorted({r["iso"] for r in rows}):
        own = [r for r in rows if r["iso"] == iso]
        n5 = sum(1 for r in own if r["o"] <= 2016 and "H5" in r["errs"]["M0"])
        eras = {e for e, rg in ERAS.items() for r in own if r["o"] in rg and "H5" in r["errs"]["M0"]}
        if n5 < 10 or len(eras) < 3:
            continue
        b = band(own, 5)
        if "band" not in b:
            continue
        leo = leave_era_out(own, 5, b["K"])
        plc = d48.placebo_cov(own, "M0", b["K"], key=lambda r: r["errs"])
        out[iso] = {
            "band_H5": b["band"],
            "K": b["K"],
            "n": b["n"],
            "log_width": b["log_width"],
            "leave_era_out_pooled": leo["pooled"],
            "placebo": {k: v["coverage"] for k, v in plc.items()},
            "passes_own_tests": bool((leo["pooled"] or 0) >= 0.9 and all(v["coverage"] is not None and v["coverage"] >= 0.9
                                                                          for v in plc.values())),
        }  # fmt: skip
    return out


def stress(rows) -> dict:
    out = {}
    stress_years = (
        (2006, "2006 gas crisis (Ukraine transit, January)"),
        (2009, "2009 gas crisis (Ukraine transit, January, two weeks)"),
        (2014, "2014 shock (Crimea, sanctions, rouble)"),
    )
    for yr, label in stress_years:
        one = [
            (r["iso"], r["group"], r["single"][yr])
            for r in rows
            if r["o"] == yr - 1 and r["single"].get(yr) is not None
        ]
        win = [r for r in rows if r["o"] <= 2016 and r["o"] < yr <= r["o"] + 5 and "H5" in r["errs"]["M0"]]
        out[str(yr)] = {
            "what": label,
            "single_year_vs_previous_year": sorted(
                [{"iso": i, "group": g, "ratio": round(math.exp(x), 3)} for i, g, x in one], key=lambda z: z["ratio"]
            ),
            "n_H5_windows_containing_it": len(win),
            "median_H5_error_of_those": round(math.exp(float(np.median([r["errs"]["M0"]["H5"] for r in win]))), 3)
            if win
            else None,
        }
    return out


# --------------------------------------------------------------------------------------------------------------------
# application to the site's to_rus
# --------------------------------------------------------------------------------------------------------------------


def comb(a: float, b: float, W: float) -> float:
    return math.sqrt((W * a) ** 2 + ((1 - W) * b) ** 2 + 2 * RHO * W * (1 - W) * a * b)


def site_effective_cb(tr: dict, frac: list[float]) -> list:
    """Belarus has no cb: its band is the sum of its yearly bands; the equivalent cumulative band per horizon."""
    q, ql, qh = tr["bmul"], tr["bmul_lo"], tr["bmul_hi"]
    cur = tr.get("cur") or [1.0] * len(q)
    out = [None]
    for h in range(1, len(q)):
        se = sum(frac[i] * q[i] * cur[i] for i in range(1, h + 1))
        lo = sum(frac[i] * (q[i] - ql[i]) * cur[i] for i in range(1, h + 1))
        hi = sum(frac[i] * (qh[i] - q[i]) * cur[i] for i in range(1, h + 1))
        out.append([round(1 - lo / se, 4), round(1 + hi / se, 4)])
    return out


def apply(S, B, cap_bands: dict, judged: dict, pc: dict) -> tuple[dict, dict]:
    D = json.loads((SITE / "data.json").read_text())
    frac = D["frac"]
    rows, patch = {}, {}
    for iso, c in S.items():
        prods = captive_at(c, iso, [2017, 2018, 2019, 2020, 2021])
        if not prods:
            continue
        site = D["countries"].get(iso) or {}
        tr = site.get("to_rus")
        tot21 = sum(B.rus_g.get(iso, {}).get(2021, {}).values())
        cap21 = sum(B.rus_f.get(iso, {}).get(2021, {}).get(HS4_OF[p], (0.0, 0.0))[0] for p in prods)
        fuel21 = (B.rus_g.get(iso, {}).get(2021) or {}).get("fuel", 0.0)
        s = cap21 / tot21 if tot21 else 0.0
        f = fuel21 / tot21 if tot21 else 0.0
        row = {
            "captive_products_2017_2021": {p: round(v / 1e6, 1) for p, v in prods.items()},
            "data": c["data"],
            "captive_share_of_2021_purchases": round(s, 3),
            "hs27_share_of_2021_purchases": round(f, 3),
            "route": "landlocked" if iso in LANDLOCKED else "gas, no LNG terminal",
        }
        rows[iso] = row
        if not tr or not tr.get("bmul") or not tr.get("base"):
            row["applied"] = False
            row["why_not"] = "no to_rus on the site"
            continue
        cb_now = tr.get("cb") or site_effective_cb(tr, frac)
        cb_gen = tr.get("cb_before_strikes") or cb_now
        q = tr["bmul"]
        w = [min(1.0, s * (b - (1 - f)) / f / b) if b and f else s for b in q]
        new = [None]
        for h in range(1, 6):
            wt = [q[i] * frac[i] for i in range(1, h + 1)]
            W = sum(x * w[i] for x, i in zip(wt, range(1, h + 1))) / sum(wt)
            cbh = cap_bands[f"H{h}"]
            g_lo, g_hi = cb_gen[h]
            lo = 1 - comb(1 - cbh["low"], 1 - g_lo, W)
            hi = 1 + comb(cbh["high"] - 1, g_hi - 1, W)
            lo += cb_now[h][0] - g_lo  # the strike widening (rounds 51-52) kept as it is
            hi += cb_now[h][1] - g_hi
            new.append([round(lo, 4), round(hi, 4)])
        row["W_2022_2026"] = round(
            sum(q[i] * frac[i] * w[i] for i in range(1, 6)) / sum(q[i] * frac[i] for i in range(1, 6)), 3
        )
        row["cb_now_2022_2026"] = cb_now[5]
        row["cb_combined_2022_2026"] = new[5]
        wn = math.log(cb_now[5][1]) - math.log(cb_now[5][0])
        wc = math.log(new[5][1]) - math.log(new[5][0])
        row["width_ratio_log"] = round(wc / wn, 3)
        # the same combination with the country's own current band in both parts: how much of the narrowing comes
        # only from splitting "paid" into two imperfectly correlated parts (rho 0.26), not from steadier energy
        W5_ = sum(q[i] * frac[i] * w[i] for i in range(1, 6)) / sum(q[i] * frac[i] for i in range(1, 6))
        g_lo, g_hi = cb_gen[5]
        so = [
            1 - comb(1 - g_lo, 1 - g_lo, W5_) + cb_now[5][0] - g_lo,
            1 + comb(g_hi - 1, g_hi - 1, W5_) + cb_now[5][1] - g_hi,
        ]
        row["width_ratio_log_split_only"] = round((math.log(so[1]) - math.log(so[0])) / wn, 3)
        row["width_ratio_log_vs_split_only"] = round(wc / (math.log(so[1]) - math.log(so[0])), 3)
        row["narrower"] = wc < wn
        row["has_own_band_today"] = (
            "own"
            if iso in ("MNG", "MDA", "TJK", "YEM", "TUR", "BLR")
            else ("round 8 fuel volume" if iso in ("DEU", "POL", "FIN", "HUN", "SVK", "CZE", "MKD") else "generic")
        )
        chk = pc.get(iso, {})
        row["country_windows_H5"] = chk.get("n_windows_H5", 0)
        row["country_check"] = chk.get("country_check", False)
        ok = judged["PASS"] and row["narrower"] and row["country_check"]
        row["applied"] = ok
        why = []
        if not judged["PASS"]:
            why.append("pooled rule failed")
        if not row["narrower"]:
            why.append("combined band not narrower than today's")
        if not row["country_check"]:
            why.append(
                "fewer than 6 own windows" if row["country_windows_H5"] < 6 else "own windows not covered >= 80%"
            )
        row["why_not"] = "; ".join(why) or None
        # the diagnostic variant patches every captive country whose combined band is narrower, rule or not, so the
        # site effect of the idea can be read even when the rule says no
        fields = {"cb": new}
        r_lo = (1 - new[5][0]) / (1 - cb_now[5][0]) if cb_now[5][0] < 1 else 1.0
        r_hi = (new[5][1] - 1) / (cb_now[5][1] - 1) if cb_now[5][1] > 1 else 1.0
        fields["bmul_lo"] = [round(b - (b - x) * r_lo, 4) for b, x in zip(q, tr["bmul_lo"])]
        fields["bmul_hi"] = [round(b + (x - b) * r_hi, 4) for b, x in zip(q, tr["bmul_hi"])]
        if ok:
            patch.setdefault("rule", {})[iso] = fields
        patch.setdefault("diagnostic_forced_all_captive", {})[iso] = fields
    patch.setdefault("rule", {})
    return rows, patch


# --------------------------------------------------------------------------------------------------------------------


def run() -> None:
    B = d48.Baci()
    ea = d48.eurostat_annual(d48.load_eurostat())
    S = build_series(B, ea)
    rows = cases(S, B)
    j = judge_pooled(rows)
    cap_bands = bands_all_h(rows, K=j["band_H5"]["K"]) if j.get("band_H5", {}).get("K") else {}
    pooled_h5 = (cap_bands["H5"]["low"], cap_bands["H5"]["high"])
    diag = {
        "value_deflated_variant": judge_pooled(rows, key="verrs"),
        "by_group": {g: judge_pooled([r for r in rows if r["group"] == g]) for g in ("gas", "oil", "mixed")},
        "by_data_set": {s: judge_pooled([r for r in rows if r["data"] == s]) for s in ("eurostat", "baci")},
        "without_belarus": judge_pooled([r for r in rows if r["iso"] != "BLR"]),
    }
    # look-ahead variant (diagnostic): the 2017-2021 captive list applied to every origin, as if captivity were known
    la = {iso: captive_at(c, iso, [2017, 2018, 2019, 2020, 2021]) for iso, c in S.items()}
    la = {k: v for k, v in la.items() if v}
    diag["lookahead_2017_2021_list"] = judge_pooled(cases(S, B, lookahead=la))
    diag["post_hoc_large_flows_ge_eur_300m_at_origin"] = judge_pooled([r for r in rows if r["start_eur_m"] >= 300])
    diag["per_country_own_band"] = own_country(rows)
    global CLEAN_TRAILING
    CLEAN_TRAILING = False
    diag["as_written_without_trailing_zero_cleaning"] = judge_pooled(cases(build_series(B, ea), B))
    CLEAN_TRAILING = True
    pc = per_country(rows, pooled_h5)
    app, patch = apply(S, B, cap_bands, j, pc)
    # per-origin listing of the windows (compact)
    win = [
        {"iso": r["iso"], "o": r["o"], "prods": r["prods"], "group": r["group"], "start_eur_m": r["start_eur_m"],
         **{h: round(math.exp(v), 3) for h, v in r["errs"]["M0"].items()}}
        for r in rows
    ]  # fmt: skip
    out = {
        "generated": "2026-10-25",
        "meta": {
            "what": "Round 53: is a band measured only on captive energy flows (Russia >= 70% of the product's imports, "
            "no sea route) narrower than the site's general band for 'paid', and does it hold out of sample?",
            "units": "multipliers on the summed expected (held-flat) level; H1-H5, H5 with the fifth year at 8/12 "
            "(the site's 2022-2026 with 2026 at 8 of 12 months)",
            "script": "research/2026-10/scripts/captive_bands_r53.py",
        },
        "rule": RULE,
        "verdict": None,
        "pooled": j,
        "captive_band": cap_bands,
        "diagnostics": diag,
        "per_country_backtest": pc,
        "stress_cases": stress(rows),
        "application": app,
        "windows": win,
        "sources": [
            {
                "name": "CEPII BACI HS92 (1995-2024 release) via the OEC API: HS 2701/2709/2710/2711 imports from all "
                "suppliers and Russia's exports by importer, value and tonnes (round 48 extract)",
                "url": "https://oec.world/api/olap-proxy/data.jsonrecords?cube=trade_i_baci_a_92",
                "file": "research/2026-10/raw/demand_cf_r48/baci_fuel_hs4_2001_2024.json.gz",
                "date": "2026-10-25",
            },
            {
                "name": "Eurostat nrg_ti_gas, nrg_ti_oil, nrg_ti_sff: imports by partner (RU, TOTAL), annual (round 48)",
                "url": "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_gas",
                "file": "research/2026-10/raw/demand_cf_r48/eurostat_energy_2026-10-25.json.gz",
                "date": "2026-10-25",
            },
            {
                "name": "Route table: UN-OHRLLS landlocked developing countries; GIIGNL annual reports (LNG import "
                "terminals by start year)",
                "url": "https://www.un.org/ohrlls/content/list-lldcs ; https://giignl.org/document/giignl-annual-report/",
                "file": "research/2026-10/raw/captive_bands_r53/route_sources.json",
                "date": "2026-10-25",
            },
            {
                "name": "site/data.json (to_rus cb, bmul) and the site's own model in site/index.html",
                "url": "site/",
                "date": "2026-10-25",
            },
        ],
    }
    GAPS.joinpath("captive_bands_r53.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    SCRATCH.mkdir(parents=True, exist_ok=True)
    (SCRATCH / "site_patch_r53.json").write_text(json.dumps(patch))
    print(json.dumps({k: j[k] for k in j if k not in ("leave_era_out",)}, indent=1))
    print(json.dumps(j["leave_era_out"]))
    print("captive band", json.dumps(cap_bands))
    for k, v in diag.items():
        if k == "per_country_own_band":
            continue
        if "band_H5" in v:
            print("diag", k, v["band_H5"].get("band"), v.get("width_ratio_vs_site"), v.get("PASS"), v.get("why_not"))
        else:
            for k2, v2 in v.items():
                print("diag", k, k2, v2.get("band_H5", {}).get("band"), v2.get("width_ratio_vs_site"), v2.get("PASS"),
                      v2.get("why_not"))  # fmt: skip
    for iso, d in pc.items():
        print("country", iso, d["n_windows_H5"], d["products"], d["median_error_H5"], d["pooled_band_coverage"],
              d["leave_country_out_coverage"], d["own_q05_q95"], d["country_check"])  # fmt: skip
    for iso, d in app.items():
        print("apply", iso, json.dumps(d))


def merge() -> None:
    f = GAPS / "captive_bands_r53.json"
    out = json.loads(f.read_text())
    ba = json.loads((SCRATCH / "before_after_r53.json").read_text())
    patch = json.loads((SCRATCH / "site_patch_r53.json").read_text())
    eff = {"summary": {k: {kk: v[kk] for kk in ("countries_patched", "n_changes", "group_or_side_changes",
                                                 "world_before", "world_after")} for k, v in ba["summary"].items()},
           "countries": {}}  # fmt: skip
    for iso in patch.get("diagnostic_forced_all_captive", {}):
        r = ba["countries"].get(iso) or {}
        b, a = r.get("before"), r.get("diagnostic_forced_all_captive")
        if not b or not a or not b.get("gdp"):
            continue
        g = b["gdp"]

        def pct(x: list, g: float = g) -> list:
            return [round(v / g * 100, 2) for v in x]

        eff["countries"][iso] = {
            "gdp_eur_bn": g,
            "paid_pct_gdp_before": pct(b["paid"]),
            "paid_pct_gdp_forced": pct(a["paid"]),
            "paid_range_width_pct_gdp": [round((b["paid"][2] - b["paid"][1]) / g * 100, 2),
                                         round((a["paid"][2] - a["paid"][1]) / g * 100, 2)],
            "net_pct_gdp_before": pct(b["net"]),
            "net_pct_gdp_forced": pct(a["net"]),
            "net_chance": [b["net_chance"], a["net_chance"]],
            "rus_chance": [b["rus_chance"], a["rus_chance"]],
            "applied_by_rule": iso in patch.get("rule", {}),
        }  # fmt: skip
    out["site_effect"] = eff
    out["verdict"] = (
        "FAILS. The captive energy band (0.567-1.755 for 2022-2026, 206 windows, 21 countries) is 1.36x WIDER in log "
        "terms than the site's current band (0.652-1.500), misses 80% coverage at the 2012 origin and covers 84% in "
        "the 2014 placebo. No country is changed. Captive energy purchases were not steadier than general trade: "
        "price-insensitive supply, yes, but volumes moved with demand, transit crises, domestic output (Romania, "
        "Kazakhstan), Belarus's oil disputes and refinery events. Combining the band by energy share would narrow "
        "most countries only through the split itself (two imperfectly correlated parts); measured against that "
        "split-only baseline the captive band widens every country but Bosnia"
    )
    f.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    {"run": run, "merge": merge}[sys.argv[1] if len(sys.argv) > 1 else "run"]()
