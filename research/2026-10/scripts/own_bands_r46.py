"""Round 46 (owner: "start on 1"): own no-war bands for purchases from Russia ("paid to Russia", to_rus) of the countries
whose direction is uncertain mainly because of the generic band, tested with the cf_bands.json B2 rule unchanged.

For each candidate (the numbers whose chance could reach 95% with a narrower paid band, from the round-46 blocker
analysis of the current site model; listed in CANDIDATES):

  series  A: Russia's exports to the country (CEPII BACI HS92, reconciled, by HS2, 2001-2021), the long mirror history;
          B: the country's own customs report of imports from Russia (IMF IMTS, 2008-2021), the counterfactual's own
             kind of series. Both in real terms: per goods group (fuel HS27, cereals HS10, fertilisers HS31, metals
             HS72-76) deflated by a chained Fisher unit-value index of Russia's exports to the world (BACI HS4 values and
             tonnes); other goods by the US import price index excluding fuels (FRED IREXFUELS); B with A's implicit
             deflator of the same year.
  centre  the level held flat from the origin, as the method does: the origin year, or the median of the last three
          years where the site starts the country from the 2019-2021 median (small flows, build_data.py small_flow_base).
  B2      as cf_bands.json B2 / turkey_gas_r43.py b2_variant: per-year errors 1-5 years ahead, rolling origins 2005-2020,
          all years kept, pooled over A and B as error / sqrt(h/3); 5th-95th percentile widened halfway to the
          block-bootstrap (by origin) 10%/90% bounds; per-year band exp(q sqrt(h/3)); cumulative band = the generic
          cumulative band of the country's size class scaled per side by the own/generic ratio of the log bounds.
  rule    (unchanged) used only if (1) the 2022-2026 cumulative band is at least 10% narrower than the band the site
          builds now (generic x CB_SCALE_PAID 0.81), (2) leave-window-out coverage >= 80% (12/15: test origins 2007,
          2012, 2016, training without any overlapping window), (3) out of time >= 80% (trained on errors ending by
          2013, scored on origins 2014-2020, 25 errors), (4) >= 90% of the country's own 5-year windows inside
          (fuel_volume_cf.json safeguard, as Türkiye in round 43). Checks (2)-(4) must hold on series A and, where the
          country reports to the IMF, also on series B (B has no 2007 test window). At least 15 usable years of A.

Then: the new chance of each number with the site's own model (site/index.html, via node, the accepted country's
to_rus.cb replaced by the own band, unscaled), and a placebo check with pipeline/placebo.py's own functions (read only):
the 2014 and 2018 runs and rolling placebo windows (base years 2011-2017) with the own bands in place.

Inputs (committed): raw/oec_baci_r44/*, raw/imf_imts_placebo/*, gaps/to_rus_cf.json, gaps/cf_bands.json,
gaps/counterfactual.json, site/data.json, site/index.html and site/detail.json (model, read only), pipeline/placebo.py.
Run from the repository root: python3 -I research/2026-10/scripts/own_bands_r46.py
Writes research/2026-10/gaps/own_bands_r46.json.
"""

import gzip
import importlib.util
import json
import math
import random
import shutil
import statistics
import subprocess
import tempfile
from pathlib import Path

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw"
GAPS = R / "gaps"
OUT = GAPS / "own_bands_r46.json"

# blocker analysis on the current model (round 46): uncertain numbers whose chance would reach 95% with a narrower paid
# no-war band, with the factor f the as-built band must shrink to (fNw); plus the countries the owner's list named
# that cannot reach 95% with any paid band (f = None), tested for completeness
CANDIDATES = {
    "MLT": {"net": 0.879},
    "COL": {"net": 0.791, "rus": 0.679},
    "JOR": {"net": 0.773, "rus": 0.766},
    "PYF": {"rus": 0.643},
    "CMR": {"rus": 0.543, "net": 0.490},
    "MEX": {"net": 0.509, "rus": None},
    "GEO": {"rus": 0.508, "net": 0.383},
    "NAM": {"net": 0.484, "rus": 0.473},
    "AGO": {"net": 0.476, "rus": 0.419},
    "SEN": {"net": 0.429, "rus": 0.426},
    "KEN": {"net": 0.379, "rus": 0.370},
    "BGR": {"rus": 0.359},
    "RWA": {"rus": 0.350, "net": 0.230},
    "BFA": {"net": 0.316, "rus": 0.313},
    "MOZ": {"rus": 0.237, "net": 0.232},
    "NER": {"rus": 0.197, "net": 0.186},
    "URY": {"rus": 0.140, "net": 0.139},
    "VEN": {"rus": 0.135},
    "ZMB": {"rus": 0.131, "net": 0.128},
    "SRB": {"rus": 0.127, "net": None},
    "AFG": {"net": 0.122},
    "UGA": {"rus": 0.102, "net": 0.097},
    "BWA": {"rus": 0.057, "net": None},
    "PHL": {"net": None, "rus": None},
    "LBN": {"net": None, "rus": None},
    "BRN": {"net": None, "rus": None},
    "DOM": {"net": None, "rus": None},
    "PER": {"net": None, "rus": None},
    "HRV": {"rus": None},
    "BEL": {"rus": None},
}
GROUPS = ("fuel", "cereal", "fert", "metal", "other")
YEARS = list(range(2001, 2022))
ORIGINS = range(2005, 2021)
TESTS = (2007, 2012, 2016)
HS = ["H1", "H2", "H3", "H4", "H5", "H5_2026_8of12"]
W5 = [1, 1, 1, 1, 8 / 12]
CB_SCALE_PAID = 0.81  # pipeline/build_data.py
MIN_YEARS = 15
SEED = 46


def group_of(hs2: int) -> str:
    return {27: "fuel", 10: "cereal", 31: "fert"}.get(hs2, "metal" if 72 <= hs2 <= 76 else "other")


def load_json(p: Path):
    return json.loads(gzip.decompress(p.read_bytes()) if p.suffix == ".gz" else p.read_text())


# ---------------------------------------------------------------- series
def load_series():
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
                if not 0.25 <= p1 / p0 <= 4:  # quantity-unit breaks
                    continue
                nl += p1 * a[k][1]
                dl += a[k][0]
                np_ += b[k][0]
                dp += p0 * b[k][1]
            idx[y] = idx[y - 1] * math.sqrt((nl / dl) * (np_ / dp))
        prices[g] = idx
    fred = load_json(RAW / "oec_baci_r44" / "fred.json")["series"]["IREXFUELS"]
    prices["other"] = {y: statistics.mean(v for k, v in fred.items() if k.startswith(f"{y}-")) for y in YEARS}
    real_a, nom_a = {}, {}
    for iso, by in nom.items():
        real_a[iso] = {y: sum(by[y][g] * prices[g][2021] / prices[g][y] for g in GROUPS) for y in by}
        nom_a[iso] = {y: sum(by[y].values()) for y in by}
    imts = load_json(RAW / "imf_imts_placebo" / "IMTS_RUS_annual_2008_2021_2026-10-24.json.gz")
    ci = {c: i for i, c in enumerate(imts["columns"])}
    own: dict[str, dict[int, float]] = {}
    for r in imts["rows"]:
        if r[ci["INDICATOR"]] == "MG_CIF_USD" and r[ci["COUNTERPART_COUNTRY"]] == "RUS" and r[ci["OBS_VALUE"]]:
            own.setdefault(r[ci["COUNTRY"]], {})[int(r[ci["TIME_PERIOD"]])] = float(r[ci["OBS_VALUE"]])
    real_b = {}
    for iso, by in own.items():
        if iso in nom_a:
            real_b[iso] = {y: v * real_a[iso][y] / nom_a[iso][y] for y, v in by.items() if nom_a[iso].get(y) and v > 0}
    return real_a, real_b, nom_a, prices


def level(s: dict, o: int, small: bool):
    """the centre held flat from origin o: the origin year, or the median of o-2..o (small flows)."""
    if small:
        xs = [s.get(y) for y in (o - 2, o - 1, o)]
        return statistics.median(xs) if all(x and x > 0 for x in xs) else None
    return s.get(o) if s.get(o) and s[o] > 0 else None


def yearly_errors(s: dict, small: bool):
    pts = []
    for o in ORIGINS:
        b = level(s, o, small)
        if not b:
            continue
        for h in range(1, 6):
            if o + h <= 2021 and s.get(o + h, 0) > 0:
                pts.append((o, h, math.log(s[o + h] / b)))
    return pts


def own_windows(s: dict, small: bool):
    """the country's own cumulative 2022-2026-like windows (H5 with the last year at 8/12), origins 2005-2016."""
    out = {}
    for o in range(2005, 2017):
        b = level(s, o, small)
        ys = [s.get(o + i + 1) for i in range(5)]
        if b and all(y is not None for y in ys):
            out[o] = sum(w * y for w, y in zip(W5, ys)) / (sum(W5) * b)
    return out


# ---------------------------------------------------------------- B2
def qtl(xs, p):
    xs = sorted(xs)
    if len(xs) == 1:
        return xs[0]
    k = (len(xs) - 1) * p
    f = math.floor(k)
    return xs[f] + (xs[min(f + 1, len(xs) - 1)] - xs[f]) * (k - f)


def fit(sel, rng, nboot=1000):
    z: dict[int, list[float]] = {}
    for o, h, v in sel:
        z.setdefault(o, []).append(v / math.sqrt(h / 3))
    flat = [x for xs in z.values() for x in xs]
    lo, hi = qtl(flat, 0.05), qtl(flat, 0.95)
    bl, bh = [], []
    origins = list(z)
    for _ in range(nboot):
        smp = [x for o in (rng.choice(origins) for _ in origins) for x in z[o]]
        bl.append(qtl(smp, 0.05))
        bh.append(qtl(smp, 0.95))
    return (
        min(0.0, lo + 0.5 * (min(qtl(bl, 0.1), lo) - lo)),
        max(0.0, hi + 0.5 * (max(qtl(bh, 0.9), hi) - hi)),
        (lo, qtl(flat, 0.5), hi),
    )


def inside(lo, hi, h, v):
    return lo * math.sqrt(h / 3) <= v <= hi * math.sqrt(h / 3)


def checks(pa, pb, rng):
    """leave-window-out and out of time on each series, the band fitted on both series pooled (as B2)."""
    pooled = pa + pb
    res = {}
    for name, pts in (("A_mirror_baci", pa), ("B_own_imf", pb)):
        if not pts:
            res[name] = None
            continue
        lwo, lh, ln = {}, 0, 0
        for t in TESTS:
            tests = [(h, v) for o, h, v in pts if o == t]
            if not tests:
                continue
            tl, th, _ = fit([(o, h, v) for o, h, v in pooled if o + h < t or o > t + 5], rng, 400)
            k = sum(inside(tl, th, h, v) for h, v in tests)
            lwo[str(t)] = f"{k}/{len(tests)}"
            lh += k
            ln += len(tests)
        ol, oh, _ = fit([(o, h, v) for o, h, v in pooled if o + h <= 2013], rng, 400)
        oot = [(o, h, v) for o, h, v in pts if o >= 2014]
        miss = [f"{o}+{h}: x{math.exp(v):.2f}" for o, h, v in oot if not inside(ol, oh, h, v)]
        ok = len(oot) - len(miss)
        res[name] = {
            "leave_window_out": {"hits": lwo, "total": f"{lh}/{ln}", "rate": round(lh / ln, 3) if ln else None},
            "out_of_time_train_to_2013_test_origins_2014_2020": {
                "hits": f"{ok}/{len(oot)}",
                "rate": round(ok / len(oot), 3) if oot else None,
                "misses": miss,
            },
        }
    return res


def mband(lo, hi):
    return {"low": round(math.exp(lo), 3), "central": 1.0, "high": round(math.exp(hi), 3)}


def generic_for(size, iso, trc, cfb, cf):
    """the generic (unscaled) per-year and cumulative band the build gives this country's to_rus."""
    cls = next((d for d in trc.values() if d["size_class"] == size), None)
    if cls:
        return cls["multiplier_vs_2021"], cls["cumulative_band"]
    table = cfb["cumulative_bands"]
    cell = f"to_rus/{size}"
    return cf[iso]["to_rus"]["multiplier_vs_2021"], (table["rw"] if cell in table["rw"] else table["chosen"])[cell]


# ---------------------------------------------------------------- site model (node), read only
NODE = r"""
import { readFileSync } from "node:fs";
const SITE = process.argv[1], patch = JSON.parse(readFileSync(process.argv[2], "utf8"));
const html = readFileSync(SITE + "/index.html", "utf8");
const code = html.slice(html.indexOf("// ===== Model ====="), html.indexOf("function lensValue")).replace(/^let YEARS.*$/m, "").replace(/^let DATA.*$/m, "");
const D = JSON.parse(readFileSync(SITE + "/data.json", "utf8")), det = JSON.parse(readFileSync(SITE + "/detail.json", "utf8"));
const M = new Function("D", "t", `let YEARS = D.years, FRAC = D.frac, SRC = D.sources, META = D.meta; let DATA = {}, byIso = {}, INCLUDED = {};
  ${code}; return { normalise, uncertain, isNearZero, chance, LEAN, setData: (d, b) => { DATA = d; byIso = b; ALTS_READY = true; } };`)(D, s => s);
const data = {}, by = {};
for (const [k, c] of Object.entries(D.countries)) { c.alts = det.alts[k] || {}; M.normalise(c); data[c.n] = c; by[k] = c; }
M.setData(data, by);
const Y = 2026, out = {};
const level = (c, q) => !M.uncertain(c, Y, q) ? "certain" : M.isNearZero(c, Y, q) ? "near zero" : M.chance(c, Y, q).p >= M.LEAN.p ? "leaning" : "uncertain";
const show = (c, q) => { const ch = M.chance(c, Y, q); return { p: Math.round(ch.p * 1000) / 1000, side: ch.side, group: level(c, q) }; };
for (const [iso, cb] of Object.entries(patch)) {
  const c = by[iso], o = {};
  for (const q of ["net", "rus", "ua"]) o[q] = { old: show(c, q) };
  const cc = { ...c, _mb: undefined, to_rus: { ...c.to_rus, cb }, T: { ...c.T, paid: { ...c.T.paid, cb } } };
  for (const q of ["net", "rus", "ua"]) o[q].new = show(cc, q);
  out[iso] = o;
}
console.log(JSON.stringify(out));
"""


def site_chances(patch: dict, tmp: Path):
    node = shutil.which("node")
    if not node or not patch:
        return None
    pf = tmp / "own_bands_r46_patch.json"
    pf.write_text(json.dumps(patch))
    try:
        r = subprocess.run(
            [node, "--input-type=module", "-e", NODE, str(ROOT / "site"), str(pf)],
            capture_output=True,
            text=True,
            check=True,
            timeout=900,
        )
    finally:
        pf.unlink(missing_ok=True)
    return json.loads(r.stdout.strip().splitlines()[-1])


# ---------------------------------------------------------------- placebo (pipeline/placebo.py functions, read only)
def placebo_check(own_cb: dict):
    spec = importlib.util.spec_from_file_location("placebo_ro", ROOT / "pipeline" / "placebo.py")
    pl = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(pl)
    inp = pl.load_inputs()
    inp["dflt"] = pl.defaults(inp["data"])
    for o in range(2011, 2018):  # rolling placebo windows: base year o, summed o+1..o+4 (band H4)
        pl.SETTINGS.setdefault(
            f"roll{o}",
            {"base": o, "window": [o - 2, o - 1, o], "size_window": [o - 3, o - 2, o - 1, o],
             "years": [o + 1, o + 2, o + 3, o + 4], "gdp_years": [o + 1, o + 2, o + 3]},
        )  # fmt: skip

    def run(with_own: bool):
        if with_own:
            for iso, cb in own_cb.items():
                inp["bands"]["own"][(iso, "to_rus")] = cb
        else:
            for iso in own_cb:
                inp["bands"]["own"].pop((iso, "to_rus"), None)
        out = {}
        for key in pl.SETTINGS:
            rows = pl.evaluate(inp, key, site_scale=True)
            ranked = [r for r in rows if r["ranked"]]
            out[key] = {
                "ranked_paid": pl.cov(ranked, "paid"),
                "ranked_trade": pl.cov(ranked, "trade"),
                "countries": {
                    r["iso3"]: {
                        "paid_contains_zero": r["paid"]["contains_zero"],
                        "trade_contains_zero": r["trade"]["contains_zero"],
                        "paid_pct_gdp": [r["paid"]["pct_gdp"], r["paid"]["lo"], r["paid"]["hi"]],
                        "band": r["paid"]["band"],
                        "band_src": r["paid"]["band_src"],
                    }
                    for r in rows
                    if r["iso3"] in own_cb and "paid" in r
                },
            }
        return out

    res = {"generic": run(False), "own": run(True)}
    res["per_country_windows_containing_zero"] = {
        iso: {
            which: f"{sum(v['countries'][iso]['paid_contains_zero'] for v in res[which].values() if iso in v['countries'])}"
            f"/{sum(iso in v['countries'] for v in res[which].values())}"
            for which in ("generic", "own")
        }
        for iso in own_cb
    }
    res["note"] = (
        "runs: the 2018 and 2014 placebos of placebo_r42.json and rolling placebo windows with base years 2011-2017 "
        "(summed 4 years, band H4), pipeline/placebo.py evaluate(site_scale=True) with the own H4 bands added to its own "
        "bands (unscaled, as the build would treat them). The own bands were fitted on data that include these years, "
        "so this is a sanity check, not an out-of-sample test."
    )
    return res


# ---------------------------------------------------------------- main
def main():
    real_a, real_b, _, _ = load_series()
    trc = json.loads((GAPS / "to_rus_cf.json").read_text())["countries"]
    cfb = json.loads((GAPS / "cf_bands.json").read_text())
    cf = json.loads((GAPS / "counterfactual.json").read_text())["countries"]
    site = json.loads((ROOT / "site" / "data.json").read_text())["countries"]
    results, patch, own_h4 = {}, {}, {}
    for iso, need in CANDIDATES.items():
        rng = random.Random(SEED)
        tr = site[iso]["to_rus"]
        small = bool(tr.get("small_flow"))
        size = cf[iso]["to_rus"]["size_class"]
        built = tr["cb"]
        row = {
            "name": site[iso].get("name"),
            "size_class": size,
            "small_flow_median_start": small,
            "needed_factor_on_paid_band": need,
            "band_as_built_H5_2026_8of12": built[5],
        }
        sa = {y: v for y, v in real_a.get(iso, {}).items() if v > 0}
        sb = real_b.get(iso, {})
        nyears = sum(1 for y in range(2002, 2022) if sa.get(y))
        row["usable_years"] = {"A_mirror_baci_2002_2021": nyears, "B_own_imf_2008_2021": len(sb)}
        if nyears < MIN_YEARS:
            row["status"] = "rejected"
            row["reason"] = f"history too short: {nyears} usable years of Russia's exports to it (need {MIN_YEARS})"
            results[iso] = row
            continue
        pa, pb = yearly_errors(sa, small), yearly_errors(sb, small) if len(sb) >= 8 else []
        lo, hi, raw = fit(pa + pb, rng)
        per_year = {str(2021 + h): mband(lo * math.sqrt(h / 3), hi * math.sqrt(h / 3)) for h in range(1, 6)}
        gm, gc = generic_for(size, iso, trc, cfb, cf)
        cum = {}
        for i, hk in enumerate(HS):
            y = str(2022 + min(i, 4))
            rl = math.log(per_year[y]["low"]) / math.log(gm[y]["low"]) if per_year[y]["low"] < 1 else 0.0
            rh = math.log(per_year[y]["high"]) / math.log(gm[y]["high"]) if per_year[y]["high"] > 1 else 0.0
            cum[hk] = {"low": round(gc[hk]["low"] ** rl, 3), "central": 1.0, "high": round(gc[hk]["high"] ** rh, 3)}
        own5 = cum["H5_2026_8of12"]
        width = (own5["high"] - own5["low"]) / (built[5][1] - built[5][0])
        cov = checks(pa, pb, rng)
        safeguard = {}
        for name, s in (("A_mirror_baci", sa), ("B_own_imf", sb if pb else {})):
            w = own_windows(s, small)
            if w:
                k = sum(own5["low"] <= v <= own5["high"] for v in w.values())
                safeguard[name] = {
                    "inside": f"{k}/{len(w)}",
                    "rate": round(k / len(w), 3),
                    "windows": {str(o): round(v, 3) for o, v in w.items()},
                }
        fails = []
        if width > 0.9:
            fails.append(f"not 10% narrower than the band as built (width ratio {width:.2f})")
        for name, c in cov.items():
            if c is None:
                continue
            lr = c["leave_window_out"]["rate"]
            orate = c["out_of_time_train_to_2013_test_origins_2014_2020"]["rate"]
            if lr is not None and lr < 0.8:
                fails.append(f"leave-window-out {c['leave_window_out']['total']} on {name}")
            if orate is not None and orate < 0.8:
                fails.append(f"out of time {c['out_of_time_train_to_2013_test_origins_2014_2020']['hits']} on {name}")
        for name, s in safeguard.items():
            if s["rate"] < 0.9:
                fails.append(f"own 5-year windows inside {s['inside']} on {name}")
        row.update(
            {
                "n_errors": {"A": len(pa), "B": len(pb)},
                "q05_q50_q95_per_sqrt_h_over_3": [round(x, 3) for x in raw],
                "widened_bounds": [round(lo, 3), round(hi, 3)],
                "own_multiplier_vs_2021": per_year,
                "own_cumulative_band": cum,
                "width_ratio_vs_as_built": round(width, 3),
                "coverage": cov,
                "safeguard_own_windows": safeguard,
            }
        )
        row["status"] = "rejected" if fails else "accepted"
        row["reason"] = "; ".join(fails) if fails else "passes the B2 rule"
        if not fails and small:
            # sensitivity: the origin year held instead of the 2019-2021-style median start
            pa1, pb1 = yearly_errors(sa, False), yearly_errors(sb, False) if len(sb) >= 8 else []
            lo1, hi1, _ = fit(pa1 + pb1, random.Random(SEED))
            y26 = mband(lo1 * math.sqrt(5 / 3), hi1 * math.sqrt(5 / 3))
            c1 = {k: math.log(y26[k]) / math.log(gm["2026"][k]) if y26[k] != 1 else 0.0 for k in ("low", "high")}
            cb1 = {k: round(gc["H5_2026_8of12"][k] ** c1[k], 3) for k in ("low", "high")}
            row["sensitivity_origin_year_start"] = {
                "per_year_2026": y26,
                "cumulative_H5_2026_8of12": cb1,
                "width_ratio_vs_as_built": round((cb1["high"] - cb1["low"]) / (built[5][1] - built[5][0]), 3),
                "coverage": checks(pa1, pb1, random.Random(SEED)),
                "note": "not the method: the site starts this country from the 2019-2021 median (small_flow_base)",
            }
        if not fails:
            level21 = cf[iso]["to_rus"].get("level_2021")
            row["proposed_cf_bands_entry"] = {
                f"countries.{iso}.to_rus": {
                    "level_2021": level21,
                    "multiplier_vs_2021": per_year,
                    "cumulative_band": cum,
                    "generic_multiplier_vs_2021_replaced": gm,
                    "generic_cumulative_band_replaced": gc,
                    "method": (
                        "2021 level held (random walk"
                        + (", from the 2019-2021 median as small_flow_base" if small else "")
                        + "), country-specific interval: 5th-95th percentile of the country's own random-walk errors "
                        "1-5 years ahead (rolling origins 2005-2020, all years kept; Russia's exports to it (CEPII BACI, "
                        "2001-2021) and its own customs report (IMF IMTS, 2008-2021) pooled, real by goods group), "
                        "scaled by sqrt(h/3) and widened halfway to the block-bootstrap bounds, as cf_bands.json B2; "
                        "cumulative band = the generic cumulative band scaled per side by the own/generic ratio of the "
                        "log bounds in the same year; used because its 2022-2026 cumulative band is at least 10% "
                        "narrower than the band as built and its own held-out coverage holds (own_bands_r46.json)"
                    ),
                    "size_class": size,
                    "certainty": "C",
                    "own_backtest": {
                        "series": "A: Russia's exports to the country (CEPII BACI HS92, reconciled, 2001-2021); B: the "
                        "country's imports from Russia (IMF IMTS own report, 2008-2021); real by goods group",
                        "origins": "2005-2020",
                        "horizons": "1-5",
                        "n_errors": len(pa) + len(pb),
                        "q05_q50_q95_per_sqrt_h_over_3": [round(x, 3) for x in raw],
                        "bootstrap_widened_bounds": [round(lo, 3), round(hi, 3)],
                        "coverage": cov,
                        "safeguard": {k: v["inside"] for k, v in safeguard.items()},
                    },
                }
            }
            patch[iso] = [None] + [[cum[h]["low"], cum[h]["high"]] for h in ("H1", "H2", "H3", "H4", "H5_2026_8of12")]
            own_h4[iso] = cum
        results[iso] = row
        print(iso, row["status"], own5, "width", round(width, 2), row["reason"])

    with tempfile.TemporaryDirectory() as tmp:
        ch = site_chances(patch, Path(tmp))
    for iso, o in (ch or {}).items():
        results[iso]["chance"] = o
    plc = placebo_check(own_h4) if own_h4 else None
    out = {
        "generated": "2026-10-25",
        "round": 46,
        "status": "proposal (not yet read by the build)",
        "question": "own no-war bands for purchases from Russia (to_rus) of the uncertain countries, by the cf_bands.json "
        "B2 rule unchanged",
        "units": "multipliers in real terms, as cf_bands.json: cumulative_band = multiplier on the SUM over the horizon of "
        "the central expected level (H5_2026_8of12 = 2022-2026 with 2026 at 8/12); multiplier_vs_2021 = per-year ratio "
        "to the yearly central; band_as_built = site/data.json to_rus.cb[5] (generic x 0.81)",
        "rule": __doc__.split("rule    ")[1].split("\n\nThen:")[0].replace("\n          ", " "),
        "how_to_apply": "for each accepted ISO copy proposed_cf_bands_entry['countries.<ISO>.to_rus'] into "
        "cf_bands.json countries.<ISO>.to_rus; counterfactual() then replaces the generic multipliers and cumulative band "
        "and does not apply CB_SCALE_PAID (as Türkiye, round 43)",
        "countries": results,
        "accepted": [i for i, r in results.items() if r["status"] == "accepted"],
        "rejected": {i: r["reason"] for i, r in results.items() if r["status"] == "rejected"},
        "placebo_check": plc,
        "sources": [
            {
                "name": "CEPII BACI HS92 via the OEC API: Russia's exports by partner and HS2, and to the world by HS4 with "
                "tonnes, 2001-2021",
                "file": "raw/oec_baci_r44/",
            },
            {
                "name": "IMF IMTS: imports from Russia (MG_CIF_USD), own reports, 2008-2021",
                "file": "raw/imf_imts_placebo/IMTS_RUS_annual_2008_2021_2026-10-24.json.gz",
            },
            {"name": "FRED IREXFUELS (US import prices excluding fuels)", "file": "raw/oec_baci_r44/fred.json"},
        ],
    }
    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print("accepted", out["accepted"])


if __name__ == "__main__":
    main()
