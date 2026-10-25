"""Round 53: better official sources for the data part of "bought from Russia" (T.paid) in 12 thin-data countries.

Reads the extracts kept under research/2026-10/raw/data_gaps_r53/ (INSD Burkina Faso quarterly notes and yearbook,
Mongolia NSO PxWeb tables, DEPS Brunei monthly releases, UN Comtrade totals), turns them into proposed replacements of
the trade-layer inputs the builder uses (EUR bn, current prices, low/central/high), and writes
research/2026-10/gaps/data_gaps_r53.json.

With --loader <path to the site loader load.mjs> it also measures the effect on the site's net number for 2026 by
patching c.T.paid (c/l/h) for the affected years, scaled from the trade layer exactly as the builder scales it (the
paid share, the CIF/FOB factor and any other year factor are kept: only the trade value and its own band change).

Run: python -I research/2026-10/scripts/data_gaps_r53.py [--loader .../load.mjs]
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "research/2026-10/raw/data_gaps_r53"
GAPS = ROOT / "research/2026-10/gaps"
OUT = GAPS / "data_gaps_r53.json"
XOF_PER_EUR = 655.957  # fixed parity
YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
ISOS = ["BFA", "SYR", "LBY", "BRN", "LBN", "YEM", "TKM", "TJK", "MNG", "KGZ", "ARM", "GEO"]


def num(s: str) -> float:
    """French-format number: '1 234,5' -> 1234.5."""
    return float(s.replace(" ", "").replace(" ", "").replace(",", "."))


def insd_russia_row(path: Path) -> list[float]:
    """Numbers of the 'RUSSIE' row of Tableau 1.6 (imports by country, CIF, bn FCFA) in an INSD quarterly note."""
    for line in path.read_text(encoding="utf-8").splitlines():
        if re.match(r"\s*RUSSIE\b", line):
            return [num(x) for x in re.findall(r"-?\s?\d+,\d", line)]
    raise ValueError(f"no RUSSIE row in {path.name}")


def bfa() -> dict:
    """Burkina Faso: INSD 2025 (four quarters) and January-June 2026, in place of the IMF 2025 and the 2026 rule."""
    t4 = insd_russia_row(RAW / "bfa/SCE_2025_T4.txt")  # 4T24 1T25 2T25 3T25 4T25 trim% annual% cum2024 cum2025
    t2 = insd_russia_row(RAW / "bfa/SCE_2T2026.txt")  # 2T25 3T25 4T25 1T26 2T26 trim% annual% cumH1-25 cumH1-26
    q25, cum24, cum25 = t4[1:5], t4[7], t4[8]
    assert abs(sum(q25) - cum25) < 0.3, (q25, cum25)
    h1_25, h1_26 = t2[7], t2[8]
    trade = json.loads((GAPS / "trade_full.json").read_text())["countries"]["BFA"]["imports_from_RUS"]
    # the reported years' own margin (trade_full rule for BFA's own report), as ratios to the central value
    r24 = trade["2024"]
    lo_r, hi_r = r24["low"] / r24["central"], r24["high"] / r24["central"]

    def eur(x):
        return x / XOF_PER_EUR

    y25 = {"central": eur(cum25), "low": eur(cum25) * lo_r, "high": eur(cum25) * hi_r}
    # 2026 = January-August: H1 measured; July-August = 2/3 of Q3 2025 x the H1 2026/2025 growth, 0.6-1.4 of that
    g = h1_26 / h1_25
    ja = 2 / 3 * t4[3] * g
    c26 = h1_26 + ja
    y26 = {"central": eur(c26), "low": eur((h1_26 + 0.6 * ja) * lo_r), "high": eur((h1_26 + 1.4 * ja) * hi_r)}
    check24 = eur(cum24) / r24["central"]
    # option: the measured part at +-10% (INSD = Comtrade; trade_full's +-22/28% is half the gap to Russia's mirror)
    alt = {
        "2025": {"low": eur(cum25) * 0.9, "central": eur(cum25), "high": eur(cum25) * 1.1},
        "2026": {"low": eur(0.9 * h1_26 + 0.6 * ja), "central": eur(c26), "high": eur(1.1 * h1_26 + 1.4 * ja)},
    }
    for y in ("2022", "2023", "2024"):
        alt[y] = {"low": trade[y]["central"] * 0.9, "central": trade[y]["central"], "high": trade[y]["central"] * 1.1}
    return {
        "flow": "imports_from_RUS",
        "replaces": "nonreport.json BFA imports_from_RUS 2025 (IMF, kept from trade_full) and 2026 (IMF monthly x rule)",
        "old": {y: {k: round(trade[y][k], 4) for k in ("low", "central", "high")} for y in ("2025", "2026")},
        "new": {"2025": {k: round(v, 4) for k, v in y25.items()}, "2026": {k: round(v, 4) for k, v in y26.items()}},
        "inputs_bn_fcfa": {
            "quarters_2025": q25,
            "cum_2024": cum24,
            "cum_2025": cum25,
            "h1_2025": h1_25,
            "h1_2026": h1_26,
            "q3_2025": t4[3],
            "jul_aug_2026_est": round(ja, 1),
        },
        "new_margin10": {y: {k: round(v, 4) for k, v in alt[y].items()} for y in sorted(alt)},
        "old_2022_2024": {
            y: {k: round(trade[y][k], 4) for k in ("low", "central", "high")} for y in ("2022", "2023", "2024")
        },
        "check": f"INSD 2024 cumulative / Comtrade 2024 (BFA report) = {check24:.4f}: the same customs data",
        "band": "the reported years' own margin (2024 ratio low/central, high/central) on the measured part; "
        "July-August 2026 0.6-1.4 x its estimate",
        "certainty": "A (2025), B (2026)",
    }


def pxweb_values(path: Path) -> dict[str, dict[str, float]]:
    d = json.loads(path.read_text())
    cdim, ydim = d["id"]
    clab = d["dimension"][cdim]["category"]["label"]
    cidx = d["dimension"][cdim]["category"]["index"]
    ylab = d["dimension"][ydim]["category"]["label"]
    yidx = d["dimension"][ydim]["category"]["index"]
    ny = len(yidx)
    out: dict[str, dict[str, float]] = {}
    for ck, ci in cidx.items():
        out[clab[ck].strip()] = {ylab[yk]: d["value"][ci * ny + yi] for yk, yi in yidx.items()}
    return out


def mng() -> dict:
    """Mongolia: NSO imports from / exports to Russia by year (USD thousand), 2019-2025."""
    fx = json.loads((GAPS / "trade_full.json").read_text())["fx"]["USD_per_EUR"]
    imp = pxweb_values(RAW / "mng/DT_NSO_1400_010V3.px.json")["Russian Federation"]
    exp = pxweb_values(RAW / "mng/DT_NSO_1400_006V3.px.json")["Russian Federation"]
    tl = json.loads((GAPS / "narrow.json").read_text())["countries"]["MNG"]["to_rus"]["trade_layer"]
    tf = json.loads((GAPS / "trade_full.json").read_text())["countries"]["MNG"]
    eur = {y: imp[y] / 1e6 / fx[y] for y in ("2019", "2020", "2021", "2022", "2023", "2024", "2025")}
    new = {
        y: {"low": round(eur[y] * 0.95, 4), "central": round(eur[y], 4), "high": round(eur[y] * 1.05, 4)}
        for y in ("2024", "2025")
    }
    check = {
        y: round(eur[y] / tf["imports_from_RUS"][y]["central"], 4) for y in ("2019", "2020", "2021", "2022", "2023")
    }
    return {
        "flow": "imports_from_RUS",
        "replaces": "narrow.json MNG to_rus trade_layer 2024-2025 (Russian-side turnover / Trading Economics share)",
        "old": {y: tl[y] for y in ("2024", "2025")},
        "new": new,
        "nso_usd_m": {
            "imports_from_RUS": {y: round(imp[y] / 1e3, 1) for y in sorted(imp) if y >= "2019"},
            "exports_to_RUS": {y: round(exp[y] / 1e3, 1) for y in sorted(exp) if y >= "2019"},
        },
        "exports_to_RUS_eur_bn_new": {y: round(exp[y] / 1e6 / fx[y], 4) for y in ("2024", "2025")},
        "exports_to_RUS_old": {
            y: {k: round(tf["exports_to_RUS"][y][k], 4) for k in ("low", "central", "high")} for y in ("2024", "2025")
        },
        "check": f"NSO / Comtrade (MNG's own report) 2019-2023: {check} - the same customs data",
        "band": "+-5%, as actuals_r7 set for Mongolia's own-report years 2019-2023",
        "certainty": "A",
    }


def brn() -> dict:
    """Brunei: DEPS monthly releases name the top three import sources; Russia is never one of them in 2026."""
    rows = {}
    for mon in ("JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL"):
        txt = (RAW / f"brn/IMTS_{mon}2026_PR.txt").read_text(encoding="utf-8")
        m = re.search(r"rakan dagangan import adalah dari (.+?)Komoditi", txt, re.DOTALL)
        para = " ".join(m.group(1).split()) if m else ""
        shares = [float(x) for x in re.findall(r"(\d+\.\d) peratus", para)]
        rows[mon] = {
            "top3_text": para,
            "third_share_pct": shares[2] if len(shares) > 2 else None,
            "russia_named": "Rusia" in para or "Russia" in para,
        }
    return {
        "months": rows,
        "use": "upper bound only: Russia below the third source each month; Hengyi's crude "
        "arrives booked to Malaysia (54-70% of imports April-July 2026), so customs origin cannot settle the "
        "Russian share; no change proposed",
    }


def tajstat_row(path: Path, first: str = "Россия") -> list[float]:
    """Numbers of the first 'Россия' row of the country table (USD thousand) in a Tajstat monthly report."""
    txt = path.read_text(encoding="utf-8")
    i = txt.index("Внешнеторговый оборот со странами")
    for line in txt[i:].splitlines():
        if line.strip().startswith(first):
            return [num(x) for x in re.findall(r"\d[\d ]*,\d", line)]
    raise ValueError(path.name)


def tjk() -> dict:
    """Tajikistan: Tajstat's own country tables (USD), 2020-2025 and January-August 2026."""
    fx = json.loads((GAPS / "trade_full.json").read_text())["fx"]["USD_per_EUR"]
    fx["2026"] = fx["2026_JanAug"]
    usd = {"imports_from_RUS": {}, "exports_to_RUS": {}}
    # yearbook 'Foreign economic activity 2025': imports/exports by country 2020-2024, USD m
    yb = (RAW / "tjk/sbornik-ves-za-2025-g.txt").read_text(encoding="utf-8").splitlines()
    rows = [ln for ln in yb if re.match(r"\s*Россия\s+\d", ln)]
    imp_row = next(r for r in rows if "1585,7" in r)  # imports, 2020-2024 with shares
    exp_row = next(r for r in rows if "88,2" in r and "134,7" in r and "4,1" in r)
    for row, key in ((imp_row, "imports_from_RUS"), (exp_row, "exports_to_RUS")):
        v = [num(x) for x in re.findall(r"\d+,\d", row)][0::2]
        usd[key].update({str(2020 + i): v[i] for i in range(5)})
    # December 2025 and August 2026 monthly reports: exports, imports (USD thousand)
    d25 = tajstat_row(RAW / "tjk/dekabr-2025-doklad-rusi.txt")  # export, import, share, growth
    usd["exports_to_RUS"]["2025"], usd["imports_from_RUS"]["2025"] = d25[0] / 1e3, d25[1] / 1e3
    a26 = [
        num(x)
        for x in re.findall(
            r"\d[\d ]*,\d",
            next(
                ln
                for ln in (RAW / "tjk/8-2026-russkij-variant.txt").read_text(encoding="utf-8").splitlines()
                if re.match(r"\s*Россия\s+1676510", ln)
            ),
        )
    ]  # turnover, growth %, export, import
    usd["exports_to_RUS"]["2026"], usd["imports_from_RUS"]["2026"] = a26[2] / 1e3, a26[3] / 1e3
    old = json.loads((GAPS / "actuals_r7.json").read_text())["countries"]["TJK"]["to_rus"]["inputs"][
        "nonreport.json:countries.TJK.imports_from_RUS"
    ]
    tf = json.loads((GAPS / "trade_full.json").read_text())["countries"]["TJK"]

    def eur(y, k):
        return usd[k][y] / fx[y] / 1e3

    new = {
        y: {
            "low": round(eur(y, "imports_from_RUS") * 0.95, 4),
            "central": round(eur(y, "imports_from_RUS"), 4),
            "high": round(eur(y, "imports_from_RUS") * 1.05, 4),
        }
        for y in ("2023", "2024", "2025", "2026")
    }
    nr = json.loads((GAPS / "nonreport.json").read_text())["countries"]["TJK"]["exports_to_RUS"]
    exp_old = {y: {k: nr[y][k] for k in ("low", "central", "high")} for y in ("2023", "2024", "2025", "2026")}
    exp_new = {
        y: {
            "low": round(eur(y, "exports_to_RUS") * 0.9, 4),
            "central": round(eur(y, "exports_to_RUS"), 4),
            "high": round(eur(y, "exports_to_RUS") * 1.1, 4),
        }
        for y in ("2023", "2024", "2025", "2026")
    }
    check = {
        y: round(eur(y, "imports_from_RUS") / tf["imports_from_RUS"][y]["central"], 3)
        for y in ("2020", "2021", "2022", "2023")
    }
    return {
        "flow": "imports_from_RUS",
        "replaces": "actuals_r7.json TJK imports_from_RUS 2023-2026 (turnover from press statements minus exports)",
        "old": {y: old[y] for y in new},
        "new": new,
        "tajstat_usd_m": {k: {y: round(v, 1) for y, v in sorted(d.items())} for k, d in usd.items()},
        "exports_to_RUS": {"old": exp_old, "new": exp_new},
        "check": f"Tajstat / Comtrade (TJK report): {check} - 2020-2022 identical; Tajstat revised 2023 up from the "
        "USD 0.90bn sent to Comtrade to 1.58bn",
        "band": "+-5% imports (own customs, land border); +-10% exports (small flow)",
        "certainty": "A",
    }


def comtrade_status() -> dict:
    out: dict[str, dict] = {}
    m49 = {
        "854": "BFA",
        "760": "SYR",
        "434": "LBY",
        "96": "BRN",
        "422": "LBN",
        "887": "YEM",
        "795": "TKM",
        "762": "TJK",
        "496": "MNG",
        "417": "KGZ",
        "51": "ARM",
        "268": "GEO",
    }
    for y in ("2023", "2024", "2025"):
        d = json.loads((RAW / f"comtrade/tot_{y}.json").read_text())
        for r in d.get("data", []):
            iso = m49[str(r["reporterCode"])]
            out.setdefault(iso, {})[f"{y}_{r['flowCode']}"] = round(r["primaryValue"] / 1e6, 1)
    return out


# per country: what the builder uses now, the best source found, and what to do (details in data_gaps_r53-notes.md)
SUMMARY = {
    "BFA": [
        "Comtrade (BFA's own report) 2019-2024, IMF 2025, IMF monthly x rule 2026",
        "INSD quarterly notes (identical to Comtrade for 2019-2024): 2025 and H1 2026 measured",
        "wire (A/B)",
    ],
    "SYR": [
        "Russia's mirror 2019-2021 (actuals_r7), IMF 2022-2024, CREA fuel + food 2025-2026; paid share 0.35-0.90",
        (
            "none official; wheat volumes (IKAR, Fastmarkets: ~1.4 Mt deal 2023, 0.3-0.67 Mt H2 2024) only confirm "
            "the IMF level; the paid share, not the trade data, is the width"
        ),
        "no change",
    ],
    "LBY": [
        "CREA (Kpler) Russian products x 0.75-1.0 + food 2022-2026",
        (
            "none official (no Libyan customs; NOC/Brega "
            "publish no origin); Kpler volumes via Attaqa (2.5 Mt 2023) agree with CREA"
        ),
        "no change",
    ],
    "BRN": [
        "actuals_r7 refinery residual (Russian share of Hengyi crude x crude bill - passed on)",
        (
            "DEPS monthly releases 2026: Russia never a top-3 source; crude arrives booked to Malaysia (54-70%), so "
            "customs origin cannot fix the Russian share"
        ),
        "no change",
    ],
    "LBN": [
        "Comtrade (LBN) to 2024, CREA fuel + non-fuel 2025, IMF 2026",
        "Lebanese Customs online statistics (blocked from here: TLS chain/503)",
        "owner download",
    ],
    "YEM": [
        "Russia's mirror 2019-2021 (actuals_r7), CREA fuel + food 2022-2026",
        "none official for Houthi ports (UNVIM reports volumes, not origin)",
        "no change",
    ],
    "TKM": [
        "Russia's mirror 2019-2021, Turkmen/Russian statements 2022-2026",
        "Russian ambassador: Jan-Oct 2025 +35% (confirms the +30-35% used); no published values",
        "no change",
    ],
    "TJK": [
        "actuals_r7: turnover statements minus exports 2023-2026",
        "Tajstat monthly reports and yearbook: imports/exports by country 2020-2025 and Jan-Aug 2026",
        "wire (A)",
    ],
    "MNG": [
        "Comtrade (MNG) 2019-2023, narrow.json (Russian-side turnover, TE share) 2024-2026",
        "NSO PxWeb (data.1212.mn) imports/exports by country 2005-2025",
        "wire (A)",
    ],
    "KGZ": ["Comtrade (KGZ) + Kyrgyz NSC (eaeu_r44)", "already the national source", "no change"],
    "ARM": [
        "Armstat via Comtrade, HS 71 netted (narrow/actuals_r7, eaeu_r44)",
        "already the national source",
        "no change",
    ],
    "GEO": ["Geostat via Comtrade", "already the national source", "no change"],
}


EFFECT_JS = r"""
import { readFileSync } from "node:fs";
const { M, by } = await import(process.argv[2]);
const P = JSON.parse(readFileSync(process.argv[3], "utf8"));
const Y = 2026, QS = ["net", "ua", "rus"];
const lvl = (c, q) => !M.uncertain(c, Y, q) ? "sure" : M.isNearZero(c, Y, q) ? "near" : M.chance(c, Y, q).p >= M.LEAN.p ? "lean" : "unc";
const head = (k, q) => ({ net: [k.shift, k.shiftLo, k.shiftHi], ua: [k.uaBal, k.uaLo, k.uaHi], rus: [k.rusBal, k.rusLo, k.rusHi] }[q]);
function stat(c) {
  const k = M.calc(c, Y), g = c.gdp / 100, o = {};
  for (const q of QS) { const [v, lo, hi] = head(k, q); o[q] = { level: lvl(c, q), p: +M.chance(c, Y, q).p.toFixed(3),
    v: +(v / g).toFixed(2), lo: +(lo / g).toFixed(2), hi: +(hi / g).toFixed(2), width: +((hi - lo) / g).toFixed(2) }; }
  return o;
}
function patchT(t, yrs) {
  const n = { ...t, c: [...t.c], l: [...t.l], h: [...t.h] };
  for (const [y, e] of Object.entries(yrs)) {
    const j = Number(y) - 2021, ro = e.old, rn = e.new;
    const r = rn.central / ro.central;
    // keep every non-trade factor of the band (paid share, CIF/FOB, ...) and swap the trade band
    const kl = (t.l[j] / t.c[j]) / (ro.low / ro.central), kh = (t.h[j] / t.c[j]) / (ro.high / ro.central);
    n.c[j] = t.c[j] * r; n.l[j] = n.c[j] * kl * (rn.low / rn.central); n.h[j] = n.c[j] * kh * (rn.high / rn.central);
  }
  return n;
}
const res = {};
for (const [name, sc] of Object.entries(P.scenarios)) {
  res[name] = {};
  for (const [iso, yrs] of Object.entries(sc)) {
    const c = by[iso]; if (!c) continue;
    const T = { ...c.T };
    if (yrs === "data0") T.paid = { ...c.T.paid, l: c.T.paid.c, h: c.T.paid.c };
    else for (const [part, py] of Object.entries(yrs)) T[part] = patchT(c.T[part], py);
    const cc = { ...c, T };
    res[name][iso] = { before: stat(c), after: stat(cc) };
  }
}
const base = {}; for (const iso of P.isos) base[iso] = stat(by[iso]);
console.log(JSON.stringify({ base, res }));
"""


def effects(loader: Path, proposals: dict) -> dict:
    """Patch c.T.paid in the site loader and report before/after for each scenario."""
    pr = {iso: proposals[iso]["proposal"] for iso in ("BFA", "MNG", "TJK")}
    sc_a = {iso: {"paid": p["new_by_year"]} for iso, p in pr.items()}
    # option B: BFA's measured years at +-10% (bfa()["new_margin10"])
    bp = pr["BFA"]
    old = {**bp["old_2022_2024"], **bp["old"]}
    bfa_b = {y: {"old": old[y], "new": v} for y, v in bp["new_margin10"].items()}
    # sales to Russia (approximate: the builder's re-export/residual layers are scaled with the trade value)
    mx = pr["MNG"]
    sold = {
        "MNG": {
            y: {
                "old": mx["exports_to_RUS_old"][y],
                "new": {
                    "low": mx["exports_to_RUS_eur_bn_new"][y] * 0.95,
                    "central": mx["exports_to_RUS_eur_bn_new"][y],
                    "high": mx["exports_to_RUS_eur_bn_new"][y] * 1.05,
                },
            }
            for y in ("2024", "2025")
        },
        "TJK": {
            y: {"old": pr["TJK"]["exports_to_RUS"]["old"][y], "new": pr["TJK"]["exports_to_RUS"]["new"][y]}
            for y in ("2023", "2024", "2025", "2026")
        },
    }
    sc_a2 = {iso: {**v, **({"soldRus": sold[iso]} if iso in sold else {})} for iso, v in sc_a.items()}
    scen = {
        "A_wire_now_paid": sc_a,
        "A2_plus_sold_to_russia": sc_a2,
        "B_bfa_margin_10pct": {"BFA": {"paid": bfa_b}},
        "U_data_part_zero_upper_bound": {iso: "data0" for iso in ISOS},
    }
    with tempfile.TemporaryDirectory() as td:
        js, pj = Path(td) / "eff.mjs", Path(td) / "p.json"
        js.write_text(EFFECT_JS)
        pj.write_text(json.dumps({"scenarios": scen, "isos": ISOS}))
        out = subprocess.run(
            ["node", str(js), str(loader.resolve()), str(pj)], capture_output=True, text=True, check=True
        )
    return json.loads(out.stdout)


def by_year(p: dict) -> dict:
    return {y: {"old": p["old"][y], "new": p["new"][y]} for y in p["new"]}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--loader", type=Path, help="site loader load.mjs (measures effects when given)")
    a = ap.parse_args()
    b, m, t = bfa(), mng(), tjk()
    for x in (b, m, t):
        x["new_by_year"] = by_year(x)
    res: dict = {
        "generated": "2026-10-25",
        "round": 53,
        "unit": "EUR bn, current prices (trade layer, before paid share and CIF/FOB); 2026 = January-August",
        "question": "Can better official sources narrow the data part of purchases from Russia (and the 2019-2021 "
        "base) for BFA, SYR, LBY, BRN, LBN, YEM, TKM, TJK, MNG, KGZ, ARM, GEO?",
        "summary": {
            k: dict(zip(("current_source", "better_source", "action"), v, strict=True)) for k, v in SUMMARY.items()
        },
        "comtrade_totals_usd_m": comtrade_status(),
        "countries": {
            "BFA": {"proposal": b, "wire": True},
            "MNG": {"proposal": m, "wire": True},
            "TJK": {"proposal": t, "wire": True},
            "BRN": {"evidence": brn(), "wire": False},
        },
    }
    if a.loader:
        res["effects_2026"] = effects(a.loader, res["countries"])
    OUT.write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    print("wrote", OUT.relative_to(ROOT))


if __name__ == "__main__":
    main()
