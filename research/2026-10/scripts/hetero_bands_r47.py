"""Round 47 (owner: "I think we can make better prediction models"): heteroskedastic, pooled no-war bands for purchases
from Russia ("paid", to_rus). The band's width depends on features of each country's pre-origin series, estimated on all
countries together, instead of one band per size class.

Pre-registered (gaps/hetero_bands_r47-notes.md, written before the results):

  data      Russia's exports to each site country, CEPII BACI 2001-2021, real by goods group (own_bands_r46.load_series).
  windows   origins 2006-2016; level held flat from the origin (median of o-2..o where the 3-year average is under
            EUR 1bn, as build_data.py small_flow_base); cumulative error log(sum w*actual / sum w*level), H1..H5 and
            H5_2026_8of12 (w = 1, 1, 1, 1, 8/12).
  features  (at the origin) log volatility (std of yearly log growth over the last 5-8 years), log level (3-year
            average, EUR at 2021 prices), fuel share (HS27, 3 years), near-zero years (< 10% of the window mean, last 9
            years), former-Soviet neighbour or Mongolia. Partner GDP volatility: not usable (GDP committed from 2008).
  new band  scale = exp(OLS of log(|e| + 0.02) on the features, horizon fixed effects, pooled); z = e / scale;
            band = [q05, q95] of z per size class and horizon x scale x K.
  old band  [q05, q95] of e per size class and horizon x K (the size-class band rebuilt on the same data).
  K         per method, the smallest K with leave-era-out coverage of H5_2026_8of12 >= 90% (eras 2006-09, 2010-12,
            2013-16; each era banded by a fit on the other two).
  rule      accept only if (1) overall leave-era-out coverage 88-92% at H5_2026_8of12 and over all horizons pooled,
            (2) every size class >= 85% and (3) every volatility tercile >= 85% on both, (4) the mean width ratio
            (new / size-class, 2022-2026, before placebo scaling) < 1 over the currently uncertain countries on the
            size-class band, (5) 2014 placebo ranked paid coverage >= 87% with the new bands (x1).

Site mapping: each country's size-class band (to_rus_cf.json / cf_bands.json) changed per side by new/old ratio of the log
bounds (as own_bands_r46.py). The placebo scale (CB_SCALE_PAID 0.81) is re-derived for the new bands with
pipeline/placebo.py (read only), not stacked.

Inputs (committed): raw/oec_baci_r44/*, raw/imf_imts_placebo/*, gaps/to_rus_cf.json, gaps/cf_bands.json,
gaps/counterfactual.json, site/data.json, site/index.html, site/detail.json, pipeline/placebo.py,
scripts/own_bands_r46.py (loaders, site model call).
Run from the repository root: python3 -I research/2026-10/scripts/hetero_bands_r47.py
Writes research/2026-10/gaps/hetero_bands_r47.json.
"""

import gzip
import importlib.util
import itertools
import json
import math
import statistics
import tempfile
from pathlib import Path

import numpy as np

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw"
GAPS = R / "gaps"
OUT = GAPS / "hetero_bands_r47.json"

HS = ["H1", "H2", "H3", "H4", "H5", "H5_2026_8of12"]
W = [1, 1, 1, 1, 1]
W8 = [1, 1, 1, 1, 8 / 12]
ORIGINS = range(2006, 2017)
ERAS = {"E1_2006_09": range(2006, 2010), "E2_2010_12": range(2010, 2013), "E3_2013_16": range(2013, 2017)}
NEIGHBOURS = {"ARM", "AZE", "BLR", "GEO", "KAZ", "KGZ", "MDA", "MNG", "TJK", "TKM", "UZB"}
SMALL_FLOW_EUR_BN = 1.0
EPS = 0.02
H5I = HS.index("H5_2026_8of12")
CB_SCALE_PAID = 0.81
FEATURES = ["const", "log_vol", "log_level", "fuel_share", "near_zero_years", "neighbour"]


def module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


R46 = module("own_bands_r46_ro", R / "scripts" / "own_bands_r46.py")


def load_json(p: Path):
    return json.loads(gzip.decompress(p.read_bytes()) if p.suffix == ".gz" else p.read_text())


def era_of(o: int) -> str:
    return next(k for k, r in ERAS.items() if o in r)


def size_class(eur_bn: float) -> str:
    return "S" if eur_bn < 0.1 else "M" if eur_bn < 1.0 else "L"


# ---------------------------------------------------------------- data
def load():
    real_a, real_b, nom_a, _ = R46.load_series()
    baci = load_json(RAW / "oec_baci_r44" / "rus_exports_partner_hs2_2001_2021.json.gz")
    fuel: dict[str, dict[int, float]] = {}
    for y, iso, hs2, v in baci["rows"]:
        if hs2 == 27:
            fuel.setdefault(iso, {})[y] = fuel.get(iso, {}).get(y, 0.0) + v
    usd21 = load_json(RAW / "ecb_placebo" / "EXR_USD_annual_2008_2021_2026-10-24.json")["annual"]["2021"]
    return real_a, real_b, nom_a, fuel, usd21


def features(s: dict, nom: dict, fuel: dict, o: int, usd21: float):
    """features known at origin o (USD at 2021 prices -> EUR bn)."""
    yrs = [y for y in range(max(2001, o - 8), o + 1)]
    if len(yrs) < 6 or any(y not in s for y in yrs):
        return None
    vals = [s[y] for y in yrs]
    m = statistics.mean(vals)
    if m <= 0:
        return None
    floor = 0.01 * m
    lg = [math.log(max(v, floor)) for v in vals]
    vol = statistics.stdev([b - a for a, b in itertools.pairwise(lg)])
    lvl = statistics.mean(s[y] for y in (o - 2, o - 1, o)) / usd21 / 1e9
    if lvl <= 0:
        return None
    nt = sum(nom.get(y, 0.0) for y in (o - 2, o - 1, o))
    fs = sum(fuel.get(y, 0.0) for y in (o - 2, o - 1, o)) / nt if nt > 0 else 0.0
    nz = sum(v < 0.1 * m for v in vals)
    return {"vol": vol, "level_eur_bn": lvl, "fuel_share": fs, "near_zero_years": nz}


def xrow(f: dict, iso: str):
    return [1.0, math.log(f["vol"] + EPS), math.log(f["level_eur_bn"]), f["fuel_share"], f["near_zero_years"],
            1.0 if iso in NEIGHBOURS else 0.0]  # fmt: skip


def level_at(s: dict, o: int, usd21: float):
    avg = statistics.mean(s.get(y, 0.0) for y in (o - 2, o - 1, o)) / usd21 / 1e9
    if avg < SMALL_FLOW_EUR_BN:
        b = statistics.median(s.get(y, 0.0) for y in (o - 2, o - 1, o))
    else:
        b = s.get(o, 0.0)
    return b if b > 0 else None


def cum_errors(s: dict, o: int, b: float):
    ys = [s.get(o + i + 1) for i in range(5)]
    if any(y is None for y in ys):
        return None
    out = []
    for h in range(1, 6):
        out.append(sum(ys[:h]) / (h * b))
    out.append(sum(w * y for w, y in zip(W8, ys)) / (sum(W8) * b))
    return [math.log(min(max(r, 1e-3), 1e3)) for r in out]


def build_windows(real: dict, real_a: dict, nom_a: dict, fuel: dict, usd21: float, isos: set, origins=ORIGINS):
    """windows of series `real` (A or B); features always from A (Russia's exports, the long history)."""
    out = []
    for iso in sorted(isos):
        s, sa = real.get(iso), real_a.get(iso)
        if not s or not sa:
            continue
        for o in origins:
            f = features(sa, nom_a.get(iso, {}), fuel.get(iso, {}), o, usd21)
            b = level_at(s, o, usd21) if f else None
            e = cum_errors(s, o, b) if b else None
            if e is None:
                continue
            size = size_class(statistics.mean(sa.get(y, 0.0) for y in range(o - 3, o + 1)) / usd21 / 1e9)
            out.append({"iso": iso, "o": o, "era": era_of(o), "size": size, "f": f, "x": xrow(f, iso), "e": e})
    return out


# ---------------------------------------------------------------- models
def fit(train: list, hetero: bool):
    beta = None
    if hetero:
        X = np.array([w["x"] for w in train])
        E = np.array([w["e"] for w in train])
        n, k = X.shape
        rows, ys = [], []
        for h in range(len(HS)):
            d = np.zeros((n, len(HS) - 1))
            if h:
                d[:, h - 1] = 1.0
            rows.append(np.hstack([X, d]))
            ys.append(np.log(np.abs(E[:, h]) + EPS))
        beta = np.linalg.lstsq(np.vstack(rows), np.concatenate(ys), rcond=None)[0][:k]
    q = {}
    for size in "SML":
        sel = [w for w in train if w["size"] == size]
        if not sel:
            continue
        sc = np.array([scale(beta, w["x"]) for w in sel])
        z = np.array([w["e"] for w in sel]) / sc[:, None]
        q[size] = (np.quantile(z, 0.05, axis=0), np.quantile(z, 0.95, axis=0), len(sel))
    return {"beta": beta, "q": q}


def scale(beta, x) -> float:
    return 1.0 if beta is None else float(math.exp(np.dot(beta, x)))


def predict(model, x, size: str):
    """log bounds per horizon, before K."""
    lo, hi, _ = model["q"][size]
    s = scale(model["beta"], x)
    return lo * s, hi * s


def crossfit(ws: list, hetero: bool, test_ws: list | None = None):
    """leave-era-out: each era's windows (of test_ws, default ws) banded by a fit on the other eras of ws."""
    test_ws = ws if test_ws is None else test_ws
    out = [None] * len(test_ws)
    for era in ERAS:
        m = fit([w for w in ws if w["era"] != era], hetero)
        for i, w in enumerate(test_ws):
            if w["era"] == era and w["size"] in m["q"]:
                out[i] = predict(m, w["x"], w["size"])
    return out


def covered(e, b, K, hs):
    lo, hi = b
    return [K * lo[h] <= e[h] <= K * hi[h] for h in hs]


def coverage(ws, bands, K, hs, pred=lambda w: True):
    hits = [c for w, b in zip(ws, bands) if b is not None and pred(w) for c in covered(w["e"], b, K, hs)]
    return {"n": len(hits), "coverage": round(sum(hits) / len(hits), 3) if hits else None}


def pick_k(ws, bands):
    for k in np.arange(0.80, 3.0, 0.01):
        if coverage(ws, bands, k, [H5I])["coverage"] >= 0.90:
            return round(float(k), 2)
    return None


def table(ws, bands, K, terc):
    groups = {
        "overall": lambda w: True,
        **{f"size_{s}": (lambda w, s=s: w["size"] == s) for s in "SML"},
        **{f"vol_tercile_{i + 1}": (lambda w, i=i: terc(w) == i) for i in range(3)},
        **{f"era_{e}": (lambda w, e=e: w["era"] == e) for e in ERAS},
    }
    return {
        g: {
            "H5_2026_8of12": coverage(ws, bands, K, [H5I], p),
            "pooled_H1_H5_8of12": coverage(ws, bands, K, [0, 1, 2, 3, H5I], p),
        }
        for g, p in groups.items()
    }


def realtime(ws, hetero, K, terc):
    """real-time check: test origins 2011-2016, each horizon trained on windows whose targets end by the origin."""
    hits = {"overall": [], **{f"size_{s}": [] for s in "SML"}, **{f"vol_tercile_{i + 1}": [] for i in range(3)}}
    for o in range(2011, 2017):
        for hi_, h in enumerate([1, 2, 3, 4, 5, 5]):
            if hi_ == 4:
                continue
            tr = [w for w in ws if w["o"] + h <= o]
            if len(tr) < 100:
                continue
            m = fit(tr, hetero)
            for w in ws:
                if w["o"] != o or w["size"] not in m["q"]:
                    continue
                lo, hi = predict(m, w["x"], w["size"])
                c = K * lo[hi_] <= w["e"][hi_] <= K * hi[hi_]
                for g in ("overall", f"size_{w['size']}", f"vol_tercile_{terc(w) + 1}"):
                    hits[g].append(c)
    return {g: {"n": len(v), "coverage": round(sum(v) / len(v), 3) if v else None} for g, v in hits.items()}


# ---------------------------------------------------------------- site bands
def site_generic():
    trc = json.loads((GAPS / "to_rus_cf.json").read_text())["countries"]
    cfb = json.loads((GAPS / "cf_bands.json").read_text())
    gen = {"S": cfb["cumulative_bands"]["chosen"]["to_rus/S"]}
    for d in trc.values():
        gen.setdefault(d["size_class"], d["cumulative_band"])
    return gen


def ratio_band(model_h, model_g, x, size):
    """per-side ratio of log bounds, new / old (size-class), per horizon, with K applied to each."""
    (lo_h, hi_h), Kh = predict(model_h["m"], x, size), model_h["K"]
    (lo_g, hi_g), Kg = predict(model_g["m"], x, size), model_g["K"]
    return [(Kh * lo_h[i]) / (Kg * lo_g[i]) if lo_g[i] < 0 else 1.0 for i in range(len(HS))], [
        (Kh * hi_h[i]) / (Kg * hi_g[i]) if hi_g[i] > 0 else 1.0 for i in range(len(HS))
    ]


def apply_ratio(gen_cb: dict, rl, rh):
    return {
        h: {"low": round(gen_cb[h]["low"] ** rl[i], 4), "central": 1.0, "high": round(gen_cb[h]["high"] ** rh[i], 4)}
        for i, h in enumerate(HS)
    }


def scaled_cb(cb: dict, f: float):
    return [None] + [
        [round(1 - (1 - cb[h]["low"]) * f, 4), round(1 + (cb[h]["high"] - 1) * f, 4)]
        for h in ("H1", "H2", "H3", "H4", "H5_2026_8of12")
    ]


# ---------------------------------------------------------------- placebo
def placebo(ratios_2013: dict | None, lam: float, pl, inp):
    """2014 (and 2018) placebo with the to_rus size-class band replaced by ratios (None = keep, scaled by lam)."""
    orig = pl._orig_band_for

    def band_for(inp_, iso3, flow, size, h, sold_band):
        cb, src = orig(inp_, iso3, flow, size, h, sold_band)
        if flow != "to_rus" or not src.startswith("to_rus/"):
            return cb, src
        rl, rh = (1.0, 1.0)
        if ratios_2013 is not None:
            if iso3 not in ratios_2013:
                return cb, src
            rl, rh = ratios_2013[iso3][size][h - 1]
        lo, hi = cb[0] ** rl, cb[1] ** rh
        return [1 - (1 - lo) * lam, 1 + (hi - 1) * lam], "own (hetero_r47)"

    pl.band_for = band_for
    try:
        out = {}
        for key in ("2014", "2018"):
            rows = [r for r in pl.evaluate(inp, key, site_scale=True) if r["ranked"]]
            out[key] = {"paid": pl.cov(rows, "paid"), "trade": pl.cov(rows, "trade")}
        return out
    finally:
        pl.band_for = orig


def lam_for(ratios_2013, pl, inp):
    lo, hi = 0.2, 2.5
    if placebo(ratios_2013, hi, pl, inp)["2014"]["paid"]["coverage"] < 0.90:
        return None
    for _ in range(14):
        mid = (lo + hi) / 2
        lo, hi = (lo, mid) if placebo(ratios_2013, mid, pl, inp)["2014"]["paid"]["coverage"] >= 0.90 else (mid, hi)
    return round(hi, 2)


# ---------------------------------------------------------------- main
def main():
    real_a, real_b, nom_a, fuel, usd21 = load()
    site = json.loads((ROOT / "site" / "data.json").read_text())["countries"]
    cf = json.loads((GAPS / "counterfactual.json").read_text())["countries"]
    isos = set(site) - {"RUS", "UKR"}
    ws = build_windows(real_a, real_a, nom_a, fuel, usd21, isos)
    vols = sorted(w["f"]["vol"] for w in ws)
    cuts = (vols[len(vols) // 3], vols[2 * len(vols) // 3])

    def terc(w):
        v = w["f"]["vol"]
        return 0 if v < cuts[0] else 1 if v < cuts[1] else 2

    res, models = {}, {}
    for name, het in (("size_class", False), ("hetero", True)):
        bands = crossfit(ws, het)
        K = pick_k(ws, bands)
        res[name] = {"K": K, "leave_era_out": table(ws, bands, K, terc), "realtime": realtime(ws, het, K, terc)}
        full = fit(ws, het)
        models[name] = {"m": full, "K": K}
        res[name]["full_fit"] = {
            "beta": dict(zip(FEATURES, [round(float(b), 4) for b in full["beta"]])) if het else None,
            "quantiles_per_size": {
                s: {"q05": [round(float(v), 4) for v in lo], "q95": [round(float(v), 4) for v in hi], "n": n}
                for s, (lo, hi, n) in full["q"].items()
            },
        }
        # check on the countries' own customs reports (IMF), features from A, origins 2008-2016
        wb = build_windows(real_b, real_a, nom_a, fuel, usd21, isos, range(2010, 2017))
        bb = crossfit(ws, het, wb)
        res[name]["own_reports_imf"] = table(wb, bb, K, terc)
        print(name, "K", K, json.dumps(res[name]["leave_era_out"]))

    # ---- 2022-2026 bands per country (origin 2021)
    gen = site_generic()
    countries, patch_built, ratios_2021 = {}, {}, {}
    for iso in sorted(isos):
        tr = site[iso].get("to_rus") or {}
        size = (cf.get(iso, {}).get("to_rus") or {}).get("size_class")
        cb = tr.get("cb")
        on_generic = bool(cb and size in gen and abs(cb[5][0] - scaled_cb(gen[size], CB_SCALE_PAID)[5][0]) < 1e-3)
        sa = real_a.get(iso)
        f = features(sa, nom_a.get(iso, {}), fuel.get(iso, {}), 2021, usd21) if sa else None
        row = {"name": site[iso].get("name"), "size_class": size, "on_size_class_band": on_generic,
               "band_as_built_H5_2026_8of12": cb[5] if cb else None}  # fmt: skip
        if f and size in gen:
            x = xrow(f, iso)
            rl, rh = ratio_band(models["hetero"], models["size_class"], x, size)
            new = apply_ratio(gen[size], rl, rh)
            g5 = gen[size]["H5_2026_8of12"]
            row.update({
                "features_2021": {k: round(v, 4) for k, v in f.items()},
                "predicted_scale_vs_class": round(scale(models["hetero"]["m"]["beta"], x), 3),
                "size_class_band_unscaled": {h: [gen[size][h]["low"], gen[size][h]["high"]] for h in HS},
                "hetero_cumulative_band": new,
                "width_ratio_H5_2026_8of12": round((new["H5_2026_8of12"]["high"] - new["H5_2026_8of12"]["low"])
                                                   / (g5["high"] - g5["low"]), 3),
            })  # fmt: skip
            ratios_2021[iso] = (rl, rh)
            if on_generic:
                patch_built[iso] = cb
        countries[iso] = row

    # ---- placebo (pipeline/placebo.py, read only)
    pl = module("placebo_ro", ROOT / "pipeline" / "placebo.py")
    pl._orig_band_for = pl.band_for
    inp = pl.load_inputs()
    inp["dflt"] = pl.defaults(inp["data"])
    r13 = {}
    for iso in isos:
        sa = real_a.get(iso)
        f = features(sa, nom_a.get(iso, {}), fuel.get(iso, {}), 2013, usd21) if sa else None
        if f:
            x = xrow(f, iso)
            r13[iso] = {}
            for s in "SML":
                rl, rh = ratio_band(models["hetero"], models["size_class"], x, s)
                r13[iso][s] = [(rl[i], rh[i]) for i in range(4)]
    plc = {
        "as_built_size_class_x0.81": placebo(None, CB_SCALE_PAID, pl, inp),
        "size_class_x1": placebo(None, 1.0, pl, inp),
        "hetero_x1": placebo(r13, 1.0, pl, inp),
    }
    lam_g, lam_h = lam_for(None, pl, inp), lam_for(r13, pl, inp)
    plc["rederived_scale_size_class"] = lam_g
    plc["rederived_scale_hetero"] = lam_h
    if lam_h:
        plc[f"hetero_x{lam_h}"] = placebo(r13, lam_h, pl, inp)
    print("placebo", json.dumps(plc, default=lambda o: o.item()))

    # ---- site model: old and new chances (hetero x rederived scale; also x1 and x0.81 variants)
    out_ch = {}
    variants = {"hetero_x_rederived": lam_h or 1.0, "hetero_x1": 1.0, "hetero_x0.81_stacked_not_valid": CB_SCALE_PAID}
    for vname, lam in variants.items():
        patch = {iso: scaled_cb(countries[iso]["hetero_cumulative_band"], lam) for iso in patch_built}
        with tempfile.TemporaryDirectory() as tmp:
            out_ch[vname] = R46.site_chances(patch, Path(tmp))
    ranked = {i for i, c in site.items() if (c.get("gdp") or 0) >= 5 and i not in ("BLR", "PRK", "RUS", "UKR")}
    base = out_ch["hetero_x_rederived"]
    uncertain_now = sorted(
        i for i in patch_built if i in ranked and any(base[i][q]["old"]["group"] != "certain" for q in ("net", "rus"))
    )
    wr = [countries[i]["width_ratio_H5_2026_8of12"] for i in uncertain_now]
    wr_all = [countries[i]["width_ratio_H5_2026_8of12"] for i in patch_built]
    trans = {}
    for vname, ch in out_ch.items():
        moves, counts = [], {}
        for iso in sorted(ch):
            if iso not in ranked:
                continue
            for q in ("net", "rus"):
                o, n = ch[iso][q]["old"], ch[iso][q]["new"]
                counts[(o["group"], n["group"])] = counts.get((o["group"], n["group"]), 0) + 1
                if o["group"] != n["group"]:
                    moves.append({"iso": iso, "number": q, "old": o, "new": n})
        trans[vname] = {"moves": moves, "group_transitions": {f"{a} -> {b}": v for (a, b), v in sorted(counts.items())}}
        for iso, o in ch.items():
            countries[iso].setdefault("chance", {})[vname] = {q: o[q] for q in ("net", "rus")}

    # ---- the rule
    L = res["hetero"]["leave_era_out"]
    checks = {}
    for cnt in ("H5_2026_8of12", "pooled_H1_H5_8of12"):
        checks[f"1_overall_88_92_{cnt}"] = 0.88 <= L["overall"][cnt]["coverage"] <= 0.92
        checks[f"2_size_classes_ge_85_{cnt}"] = all(L[f"size_{s}"][cnt]["coverage"] >= 0.85 for s in "SML")
        checks[f"3_vol_terciles_ge_85_{cnt}"] = all(L[f"vol_tercile_{i}"][cnt]["coverage"] >= 0.85 for i in (1, 2, 3))
    checks["4_narrower_for_uncertain"] = statistics.mean(wr) < 1 if wr else False
    checks["5_placebo_2014_paid_ge_87"] = plc["hetero_x1"]["2014"]["paid"]["coverage"] >= 0.87
    checks = {k: bool(v) for k, v in checks.items()}
    passed = all(checks.values())
    print("checks", checks, "PASS" if passed else "FAIL")

    result = {
        "generated": "2026-10-25",
        "round": 47,
        "status": "accepted: proposal (not yet read by the build)" if passed else "rejected by the pre-registered rule",
        "question": "heteroskedastic, pooled no-war bands for purchases from Russia (to_rus): band width from "
        "pre-origin features of each country's series, estimated on all countries together",
        "rule": __doc__.split("Pre-registered")[1].split("Site mapping:")[0].strip(),
        "checks": checks,
        "passed": passed,
        "volatility_tercile_cuts": [round(c, 4) for c in cuts],
        "n_windows": {"A_baci": len(ws), "by_size": {s: sum(w["size"] == s for w in ws) for s in "SML"}},
        "backtest": res,
        "uncertain_now_on_size_class_band": uncertain_now,
        "width_ratio_H5_2026_8of12": {
            "mean_uncertain_now": round(statistics.mean(wr), 3) if wr else None,
            "median_uncertain_now": round(statistics.median(wr), 3) if wr else None,
            "mean_all_on_size_class_band": round(statistics.mean(wr_all), 3),
            "n_narrower_uncertain": sum(r < 1 for r in wr),
            "n_uncertain": len(wr),
        },
        "placebo": plc,
        "cb_scale_paid_note": "CB_SCALE_PAID (0.81) was fitted on the size-class bands in the 2014 placebo. The new "
        "bands need their own factor, re-derived the same way (smallest factor at which 2014 ranked paid coverage "
        "reaches 90%), applied instead of 0.81, not on top of it. rederived_scale_size_class checks that the procedure "
        "gives about 0.81 for the bands as built.",
        "site_effect": trans,
        "countries": countries,
        "units": "multipliers in real terms on the SUM of the central expected level over the horizon "
        "(H5_2026_8of12 = 2022-2026 with 2026 at 8/12), unscaled (before the placebo factor); "
        "band_as_built = site/data.json to_rus.cb[5] (size-class band x 0.81 or an own band)",
        "how_to_apply": "only if passed: for each country with on_size_class_band, replace the size-class "
        "cumulative band with hetero_cumulative_band and use placebo.rederived_scale_hetero in place of CB_SCALE_PAID "
        "for these countries; own bands (cf_bands.json, fuel_volume_cf.json, Belarus) are untouched",
        "sources": [
            {
                "name": "CEPII BACI HS92 via the OEC API: Russia's exports by partner and HS2, 2001-2021",
                "file": "raw/oec_baci_r44/",
            },
            {
                "name": "IMF IMTS: imports from Russia, own reports, 2008-2021",
                "file": "raw/imf_imts_placebo/IMTS_RUS_annual_2008_2021_2026-10-24.json.gz",
            },
            {"name": "ECB EUR/USD 2021 (level in EUR)", "file": "raw/ecb_placebo/"},
        ],
    }
    OUT.write_text(json.dumps(result, indent=1, ensure_ascii=False, default=lambda o: o.item()) + "\n")
    print("wrote", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
