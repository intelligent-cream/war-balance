"""Round 53: a contract baseline for pipeline-gas buyers of Russian gas (research only; nothing here is read by the build).

    python3 -I research/2026-10/scripts/gas_contracts_r53.py digitize   # needs Pillow + numpy (raw PNGs -> evidence json)
    python3 -I research/2026-10/scripts/gas_contracts_r53.py run        # back-test + site patch (stdlib only)
    python3 -I research/2026-10/scripts/gas_contracts_r53.py merge <before_after.json>

`run` reads committed files only: round 48's Eurostat extract (raw/demand_cf_r48/), the hand-checked Cedigaz contract
snapshots below (evidence in raw/gas_contracts_r53/), energy2.json (the site's final-use gas volumes), site/data.json
(the current to_rus series) and pipeline/build_data.py (fuel split and no-war prices, imported read-only). It writes
research/2026-10/gaps/gas_contracts_r53.json and, with a scratch path as second argument, the site patch for the
before/after run on the site's own model.
"""

from __future__ import annotations

import gzip
import json
import math
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RES = ROOT / "research/2026-10"
RAW = RES / "raw/gas_contracts_r53"
OUT = RES / "gaps/gas_contracts_r53.json"

RULE = """Written 2026-10-25 before any back-test result was computed (same text in gas_contracts_r53-notes.md).
Actual: Eurostat nrg_ti_gas imports from RU (TJ GCV), countries with real Russian imports reported (not AT, DK, HR, UK).
Contracts known at origin: Cedigaz snapshots published by CRS R42405 - vintage 2014 (June 2014) for origins 2014-2017,
vintage 2018 (October 2018) for origins 2018-2020; origins 2010-2013 not evaluated (no dated snapshot; a look-ahead
sensitivity with vintage 2014 is reported apart and does not count).
Models: F = A(o) held flat. K1 = A(o) x ACQ(t)/ACQ(o) (F where ACQ(o)=0; renewal at the last ACQ where expired).
K3 = mean_{o-2..o} A/ACQ x ACQ(t) (same fallbacks). KB = [0.8, 1.1] x ACQ(t) at 37.1 PJ/bcm (coverage only).
Error e = ln(sum pred / sum actual) over o+1..o+H, H = 1..5, t <= 2021.
Pass (each of K1, K3): (1) median |e| <= 0.85 x F's at every origin 2014-2020 and every H available there; (2) pooled
5-95% band of e no wider than F's at every H; (3) leave-one-origin-out coverage >= 85% at every H.
Site: gas share of to_rus (fossil_share x gas mix) gets the contract path and band, the rest keeps its band, combined
with rho 0.26 as contract_lng(); the 2025 end of Ukrainian transit is a separate forced loss (2024 route volume less
2025-26 rerouted Russian volume, at the no-war price)."""

PJ_PER_BCM = 37.1  # Bruegel: 40 bcm ~ 412 TWh (GCV) -> 37.1 PJ per bcm
TOP, FLEX = 0.8, 1.1
GEO = {"BG": "Bulgaria", "CZ": "Czechia", "DE": "Germany", "EL": "Greece", "FI": "Finland", "FR": "France",
       "HU": "Hungary", "IT": "Italy", "LT": "Lithuania", "LV": "Latvia", "NL": "Netherlands", "PL": "Poland",
       "RO": "Romania", "SK": "Slovakia", "SI": "Slovenia", "TR": "Turkey"}  # fmt: skip
EXCLUDED_GEO = {"AT": "Eurostat reports 0 from RU (confidential / not specified) while ~7 bcm/yr arrived",
                "DK": "0 from RU in Eurostat; Orsted took delivery in Germany",
                "HR": "0 from RU in Eurostat from 2011; PPD's gas came via Austria/Hungary hubs",
                "UK": "0 or missing in Eurostat; contracts were hub deliveries"}  # fmt: skip

# Hand-checked snapshots (bcm/yr), from the machine digitisation in raw/gas_contracts_r53/cedigaz_vintages_digitised.json
# and visual reading of the two figures (crs_r42405_*_fig*.png). Years missing in the machine pass (columns crossed by
# chart labels) are read from the neighbouring years where the band is flat. About +-0.5 bcm.
VINTAGES = {
    2014: {"years": (2010, 2030), "src": "Cedigaz, Long-Term Gas and LNG Supply Database, Pipelines in Europe, updated June 2014 (CRS R42405, 5 Nov 2015, fig. 3)",
           "c": {"Austria": [(2010, 2027, 6.8)], "Bulgaria": [(2012, 2022, 3.0)], "Czechia": [(2010, 2016, 9.4), (2017, 2030, 8.9)],
                 "Denmark": [(2011, 2030, 1.9)], "Finland": [(2010, 2027, 6.1)], "France": [(2010, 2013, 10.5), (2014, 2030, 14.3)],
                 "Germany": [(2010, 2010, 55.9), (2011, 2030, 53.0)], "Greece": [(2010, 2026, 3.0)], "Hungary": [(2010, 2015, 8.0)],
                 "Italy": [(2010, 2025, 28.3), (2026, 2030, 23.2)], "Lithuania": [(2010, 2015, 3.2)], "Netherlands": [(2010, 2021, 4.4)],
                 "Poland": [(2010, 2022, 10.2)], "Romania": [(2010, 2030, 4.1)], "Slovakia": [(2010, 2028, 6.5)],
                 "Slovenia": [(2010, 2015, 0.8)],
                 "Turkey": [(2010, 2011, 24.2), (2012, 2022, 30.2), (2023, 2026, 22.1), (2027, 2027, 9.5), (2028, 2030, 6.0)]}},
    2018: {"years": (2015, 2035), "src": "Cedigaz, Pipeline Supply Contracts Database, updated October 2018 (CRS R42405, 26 Feb 2020, fig. 5)",
           "c": {"Austria": [(2015, 2035, 6.7)], "Bulgaria": [(2015, 2022, 3.0)], "Croatia": [(2015, 2027, 1.0)],
                 "Czechia": [(2015, 2035, 9.1)], "Denmark": [(2015, 2031, 1.9)], "Finland": [(2015, 2027, 6.0)],
                 "France": [(2015, 2031, 10.6)], "Germany": [(2015, 2019, 45.2), (2020, 2031, 49.0), (2032, 2034, 25.0), (2035, 2035, 24.0)],
                 "Greece": [(2015, 2026, 3.0)], "Hungary": [(2015, 2017, 6.0)],
                 "Italy": [(2015, 2020, 28.3), (2021, 2025, 26.3), (2026, 2035, 23.4)], "Latvia": [(2015, 2017, 1.8)],
                 "Lithuania": [(2015, 2015, 3.35)], "Netherlands": [(2015, 2022, 4.1)], "Poland": [(2015, 2022, 10.3)],
                 "Romania": [(2015, 2030, 6.7)], "Slovakia": [(2015, 2028, 6.6)], "Slovenia": [(2015, 2015, 1.0)],
                 "Turkey": [(2015, 2021, 30.5), (2022, 2026, 21.8), (2027, 2035, 6.0)], "UK": [(2015, 2021, 4.2)]}},
}  # fmt: skip


def acq(v: int, country: str, y: int) -> float:
    for a, b, q in VINTAGES[v]["c"].get(country, []):
        if a <= y <= b:
            return q
    return 0.0


def last_acq(v: int, country: str, upto: int) -> float:
    for y in range(upto, VINTAGES[v]["years"][0] - 1, -1):
        if acq(v, country, y) > 0:
            return acq(v, country, y)
    return 0.0


# ---- contracts as of end-2021, per site country (bcm/yr). `kind`: running | new_smaller | expiry (no renewal
# evidence by end-2021) | non_renewal (announced before 2022) | none (no long-term contract found) ----
S = {  # sources (raw extract or URL), cited by key
    "cedigaz18": "raw/gas_contracts_r53/crs_r42405_2020-02-26_fig5_cedigaz_2018.png (Cedigaz Oct 2018 via CRS R42405)",
    "bruegel24": "raw/gas_contracts_r53/bruegel_2024_transit_end.txt (https://www.bruegel.org/analysis/end-russian-gas-transit-ukraine-and-options-eu)",
    "omv": "raw/gas_contracts_r53/worldpipelines_2018-06_omv_2040.txt; raw/gas_contracts_r53/omv_2024-12_termination.txt",
    "spp": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [SPP]; raw/gas_contracts_r53/interfax_2025-06_spp_2028.txt",
    "mvm": "raw/gas_contracts_r53/tass_2021-09_hungary.txt (https://tass.com/economy/1342991)",
    "pgnig": "raw/gas_contracts_r53/notesfrompoland_2019-11_pgnig.txt; raw/gas_contracts_r53/crs_r42405_2020-02-26_text.txt",
    "bg": "raw/gas_contracts_r53/novinite_bulgaria_top80.txt; raw/gas_contracts_r53/search_summaries_2026-10-25.txt",
    "depa": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [DEPA]",
    "srb": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Serbia]; raw/gas_contracts_r53/kyivindependent_serbia.txt",
    "mda": "raw/gas_contracts_r53/interfax_2021-11_moldova_5yr.txt; raw/gas_contracts_r53/aljazeera_2021-11_moldova_3bcm.txt",
    "gasum": "raw/gas_contracts_r53/tass_2023-05_gasum_termination.txt",
    "gasterra": "raw/gas_contracts_r53/aljazeera_2022-05_gasterra.txt",
    "geoplin": "raw/gas_contracts_r53/energyindustryreview_2018-04_slovenia.txt",
    "ppd": "raw/gas_contracts_r53/energynomics_2017-09_croatia_ppd.txt",
    "tur": "raw/gas_contracts_r53/argus_2021_turkey_contracts.txt; raw/gas_contracts_r53/tass_2025-12_botas_21p75.txt; search_summaries [Turkiye]",
    "engie": "raw/gas_contracts_r53/hellenicshipping_2022-03_engie.txt; fuel_volume_cf.json contracts (Gazprom, Dec 2008)",
    "eni": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Eni]",
    "uniper": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Uniper]; fuel_volume_cf.json contracts (Gazprom, Aug 2006)",
    "cz": "fuel_volume_cf.json contracts (RWE Transgas 9 bcm/yr, ToP 90%, to 2035)",
    "orsted": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Orsted]",
    "eesti": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Eesti Gaas]",
    "lv": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Latvia]",
    "transit": "raw/gas_contracts_r53/expro_2025-01_transit_2024.txt; raw/gas_contracts_r53/crs_r42405_2020-02-26_text.txt (2019 transit deal: 40 bcm/yr 2021-2024)",
    "at_after": "raw/gas_contracts_r53/search_summaries_2026-10-25.txt [Austria after 16 Nov 2024]",
}
CONTRACTS = {
    "DEU": {"kind": "running", "acq": 49.0, "top": 0.85, "end": "2031-2036", "buyers": "Uniper ~24 bcm/yr to 2035/36 (Nord Stream part 2036), SEFE/Wingas, RWE, VNG, EnBW, Shell Energy (1.2)", "src": ["cedigaz18", "uniper", "orsted"], "cert": "B"},
    "ITA": {"kind": "running", "acq": 26.3, "top": None, "end": "2034-2035 (Eni); Cedigaz shows 26.3 to 2025, 23.4 from 2026", "step": {2026: 23.4 / 26.3}, "buyers": "Eni (>20 bcm/yr), Edison, Gazprom direct sales", "src": ["cedigaz18", "eni"], "cert": "B"},
    "AUT": {"kind": "running", "acq": 6.0, "top": 0.96, "end": "2040 (extended June 2018)", "buyers": "OMV (62 TWh/yr per Bruegel; 6.7 bcm Cedigaz)", "src": ["omv", "bruegel24", "cedigaz18"], "cert": "A", "transit": True},
    "CZE": {"kind": "running", "acq": 9.0, "top": 0.9, "end": "2035", "buyers": "RWE Transgas / innogy", "src": ["cz", "cedigaz18"], "cert": "B"},
    "SVK": {"kind": "running", "acq": 6.3, "top": None, "end": "2028", "buyers": "SPP (67 TWh/yr per Bruegel)", "src": ["spp", "bruegel24"], "cert": "A", "transit": True},
    "HUN": {"kind": "new_smaller", "acq": 4.5, "top": None, "end": "2036 (15 years from 1 Oct 2021)", "buyers": "MVM CEEnergy, two contracts (3.5 via Serbia, 1.0 via Austria)", "src": ["mvm", "bruegel24"], "cert": "A"},
    "POL": {"kind": "non_renewal", "acq": 10.2, "top": 0.85, "end": "31 Dec 2022; PGNiG notified non-renewal 15 Nov 2019", "buyers": "PGNiG (Yamal)", "src": ["pgnig"], "cert": "A"},
    "BGR": {"kind": "expiry", "acq": 2.9, "top": 0.8, "end": "31 Dec 2022; no decision before the war", "buyers": "Bulgargaz", "src": ["bg"], "cert": "A", "alt_low": 0.0},
    "GRC": {"kind": "new_smaller", "acq": 2.0, "acq_prev": 3.0, "top": None, "end": "2026 (2 bcm/yr, signed January 2022; earlier extension 2.5-3 bcm/yr to 2026)", "buyers": "DEPA", "src": ["depa", "cedigaz18"], "cert": "B"},
    "SRB": {"kind": "expiry", "acq": None, "top": None, "end": "31 Dec 2021, extended to May 2022 while a new deal was negotiated (signed May 2022)", "buyers": "Srbijagas", "src": ["srb"], "cert": "B", "alt_low": 0.8},
    "MDA": {"kind": "running", "acq": 3.0, "top": None, "end": "31 Oct 2026 (5 years from 1 Nov 2021; ~3 bcm/yr incl. Transnistria)", "buyers": "Moldovagaz", "src": ["mda"], "cert": "A", "note": "right bank only in the site (own band); contract has no right-bank quantity"},
    "FIN": {"kind": "running", "acq": None, "top": None, "end": "2031", "buyers": "Gasum (ACQ not published; Cedigaz 6 bcm looks like a maximum)", "src": ["gasum", "cedigaz18"], "cert": "B"},
    "NLD": {"kind": "expiry", "acq": 4.1, "top": None, "end": "1 Oct 2022 (GasTerra); other shippers' Russian gas at TTF has no contract here", "buyers": "GasTerra", "src": ["gasterra", "cedigaz18"], "cert": "B", "alt_low": 0.0, "partial": True},
    "FRA": {"kind": "running", "acq": 10.6, "top": None, "end": "2030 (Engie)", "buyers": "Engie (~121 TWh in 2021)", "src": ["engie", "cedigaz18"], "cert": "B"},
    "SVN": {"kind": "expiry", "acq": 0.6, "top": None, "end": "1 Jan 2023 (Geoplin, 0.6 bcm/yr from 2018)", "buyers": "Geoplin", "src": ["geoplin"], "cert": "A", "alt_low": 0.0},
    "ROU": {"kind": "running", "acq": 6.7, "top": None, "end": "2030 (Cedigaz; buyers not named)", "buyers": "not named", "src": ["cedigaz18"], "cert": "C"},
    "TUR": {"kind": "expiry", "acq": 30.5, "top": 0.8, "end": "8 of 14 bcm/yr of TurkStream contracts ended 2021 (talks open); Blue Stream 16 bcm/yr and Botas 5.75 to end-2025", "buyers": "Botas, Enerco, Bosphorus Gaz, Bati Hatti, Avrasya, Kibar, Akfel, Shell", "src": ["tur", "cedigaz18"], "cert": "B", "face": {2022: 21.8 / 30.5, 2023: 21.8 / 30.5, 2024: 21.8 / 30.5, 2025: 21.8 / 30.5, 2026: 6.0 / 30.5}},
    "HRV": {"kind": "running", "acq": 1.0, "top": None, "end": "31 Dec 2027 (PPD)", "buyers": "PPD", "src": ["ppd"], "cert": "A", "note": "no pipeline gas in the site's Croatian mix (Russian gas reached Croatia via hubs); nothing to change"},
    "DNK": {"kind": "running", "acq": 1.2, "top": None, "end": "2030 (reported; not verified)", "buyers": "Orsted", "src": ["orsted"], "cert": "C", "note": "no gas in the site's Danish mix; nothing to change"},
    "EST": {"kind": "none", "end": "Eesti Gaas contract ended 2015; short-term purchases after", "src": ["eesti"], "cert": "B"},
    "LVA": {"kind": "none", "end": "Latvijas Gaze: Cedigaz 2018 shows the contract ending 2017; later terms not public (gap)", "src": ["lv", "cedigaz18"], "cert": "C"},
    "LTU": {"kind": "none", "end": "Lietuvos Dujos contract ended 2015 (Cedigaz); later only short-term/Achema (gap)", "src": ["cedigaz18"], "cert": "C"},
    "BIH": {"kind": "none", "end": "small TurkStream supply via Serbia; contract terms not found (gap)", "src": [], "cert": "D"},
    "MKD": {"kind": "none", "end": "small; contract terms not found (gap)", "src": [], "cert": "D"},
    "CHE": {"kind": "none", "end": "no direct Gazprom contract (hub purchases)", "src": [], "cert": "B"},
    "CHN": {"kind": "already", "end": "Power of Siberia 38 bcm/yr ramp already in the site (power_of_siberia())", "src": [], "cert": "A"},
}  # fmt: skip

# Ukraine transit end (1 Jan 2025): would-have 2025-26 Russian volume via Ukraine (bcm/yr, [low, central, high]) and
# Russian volume that still arrived by other routes (site final-use volumes, energy2.json; 2026 = Jan-Aug annualised)
TRANSIT = {
    "SVK": {"would": "v2024", "why": "all of Slovakia's 2024 Russian gas came via Ukraine (13.5 bcm entered Slovakia, Expro); rerouted via TurkStream/Hungary in 2025-26"},
    "AUT": {"would": "v2024x0.85", "why": "after Gazprom's 16 Nov 2024 halt to OMV (OMV then terminated, its own choice) Russian gas kept reaching Austria at Baumgarten in 'slightly smaller volumes' (OSW), flows 10-20% lower"},
    "ITA": {"would": "v2024", "why": "Eni and others kept taking Russian gas via Tarvisio in 2024"},
    "CZE": {"would": "v2024", "low0": True, "why": "2024 Russian gas via Slovakia; the Czech government wanted to end it, so the low end is 0"},
    "HUN": {"would": "none", "why": "2025 Russian volume (TurkStream) above 2024: nothing lost"},
    "MDA": {"would": "none", "why": "right bank bought no Russian gas from 2023; Transnistria is not in the site's Moldova figure"},
    "SVN": {"would": "none", "why": "no Russian gas in 2023-24"},
}  # fmt: skip
TRANSIT_BAND = 0.15  # +-15% on the would-have level (judgement, stated)


def load_eurostat() -> dict[str, dict[int, float]]:
    with gzip.open(RES / "raw/demand_cf_r48/eurostat_energy_2026-10-25.json.gz") as f:
        d = json.load(f)
    out: dict[str, dict[int, float]] = {}
    for g, _s, p, _b, y, v in d["datasets"]["gas_ti_a"]["rows"]:
        if p == "RU" and v is not None and g in GEO:
            out.setdefault(GEO[g], {})[int(y)] = v / 1000.0  # PJ
    return out


def predict(model: str, A: dict[int, float], v: int, c: str, o: int, t: int) -> float | None:
    a0 = A.get(o)
    if not a0:
        return None
    if model == "F":
        return a0
    q0 = acq(v, c, o)
    qt = acq(v, c, t) or last_acq(v, c, t)
    if model == "K1":
        return a0 if q0 <= 0 or qt <= 0 else a0 * qt / q0
    if model == "K3":
        ks = [o - 2, o - 1, o]
        if any(acq(v, c, k) <= 0 or A.get(k) is None for k in ks) or qt <= 0:
            return a0
        return statistics.mean(A[k] / acq(v, c, k) for k in ks) * qt
    raise ValueError(model)


def backtest(A: dict[str, dict[int, float]], origins: list[int], vint: dict[int, int]) -> list[dict]:
    rows = []
    for o in origins:
        v = vint[o]
        for c, a in A.items():
            for H in range(1, 6):
                ts = list(range(o + 1, o + H + 1))
                if ts[-1] > 2021 or any(a.get(t) is None for t in ts):
                    continue
                act = sum(a[t] for t in ts)
                if act <= 0 or not a.get(o):
                    continue
                r = {"origin": o, "country": c, "H": H, "vintage": v, "actual_pj": round(act, 2)}
                for m in ("F", "K1", "K3"):
                    p = sum(predict(m, a, v, c, o, t) for t in ts)
                    r[m] = round(math.log(p / act), 5)
                q = [acq(v, c, t) for t in ts]
                if all(x > 0 for x in q):
                    lo, hi = TOP * sum(q) * PJ_PER_BCM, FLEX * sum(q) * PJ_PER_BCM
                    r["KB_in"] = lo <= act <= hi
                    r["actual_over_acq"] = round(act / (sum(q) * PJ_PER_BCM), 3)
                rows.append(r)
    return rows


def pct(xs: list[float], p: float) -> float:
    xs = sorted(xs)
    k = (len(xs) - 1) * p
    f = math.floor(k)
    return xs[f] + (xs[min(f + 1, len(xs) - 1)] - xs[f]) * (k - f)


def evaluate(rows: list[dict]) -> dict:
    res: dict = {"by_origin": {}, "bands": {}, "loo_coverage": {}, "verdict": {}}
    origins = sorted({r["origin"] for r in rows})
    for o in origins:
        for H in range(1, 6):
            rs = [r for r in rows if r["origin"] == o and r["H"] == H]
            if not rs:
                continue
            res["by_origin"].setdefault(str(o), {})[f"H{H}"] = {
                "n": len(rs),
                **{m: round(statistics.median(abs(r[m]) for r in rs), 4) for m in ("F", "K1", "K3")},
            }
    for H in range(1, 6):
        rs = [r for r in rows if r["H"] == H]
        if len(rs) < 10:
            continue
        b = {}
        for m in ("F", "K1", "K3"):
            es = [r[m] for r in rs]
            b[m] = {
                "q05": round(pct(es, 0.05), 4),
                "q95": round(pct(es, 0.95), 4),
                "width": round(pct(es, 0.95) - pct(es, 0.05), 4),
                "median_abs": round(statistics.median(abs(e) for e in es), 4),
                "bias": round(statistics.median(es), 4),
            }
            hit = n = 0
            for o in origins:
                tr = [r[m] for r in rs if r["origin"] != o]
                te = [r[m] for r in rs if r["origin"] == o]
                if len(tr) < 10 or not te:
                    continue
                lo, hi = pct(tr, 0.05), pct(tr, 0.95)
                hit += sum(lo <= e <= hi for e in te)
                n += len(te)
            res["loo_coverage"].setdefault(f"H{H}", {})[m] = round(hit / n, 3) if n else None
        kb = [r["KB_in"] for r in rs if "KB_in" in r]
        b["KB"] = {
            "coverage": round(sum(kb) / len(kb), 3) if kb else None,
            "n": len(kb),
            "actual_over_acq_median": round(
                statistics.median(r["actual_over_acq"] for r in rs if "actual_over_acq" in r), 3
            ),
        }
        res["bands"][f"H{H}"] = {"n": len(rs), **b}
    for m in ("K1", "K3"):
        acc = [(o, h, d[m], d["F"]) for o, hs in res["by_origin"].items() for h, d in hs.items()]
        miss = [{"origin": o, "H": h, m: k, "F": f} for o, h, k, f in acc if not k <= 0.85 * f]
        wid = [h for h, d in res["bands"].items() if d[m]["width"] > d["F"]["width"]]
        cov = [h for h, d in res["loo_coverage"].items() if d[m] is not None and d[m] < 0.85]
        res["verdict"][m] = {
            "pass_accuracy": not miss,
            "cells": len(acc),
            "cells_15pct_better": len(acc) - len(miss),
            "misses": miss[:40],
            "pass_band_not_wider": not wid,
            "wider_at": wid,
            "pass_coverage": not cov,
            "coverage_below_85_at": cov,
            "PASS": not miss and not wid and not cov,
        }
    return res


# ---------------- site application ----------------
def site_inputs() -> tuple[dict, dict, object]:
    sys.path.insert(0, str(ROOT / "pipeline"))
    import build_data as bd  # read-only: fuel split, fossil share, no-war prices

    data = json.loads((ROOT / "site/data.json").read_text())
    e2 = json.loads((RES / "gaps/energy2.json").read_text())["transit_gas"]["countries"]
    return data, e2, bd


def contract_path(iso: str, vref: float, v21: float) -> tuple[list[float], list[float], list[float]]:
    """Gas volume path 2021-2026 relative to vref (the 2019-2021 average): central, low, high (contract-range only;
    the measured K1 error band is applied on top). Index 0 = 2021 (1.0)."""
    k = CONTRACTS[iso]
    g, lo, hi = [1.0] * 6, [1.0] * 6, [1.0] * 6
    for i, y in enumerate(range(2021, 2027)):
        if y == 2021:
            continue
        kind = k["kind"]
        if kind == "running":
            f = (k.get("step") or {}).get(y, 1.0)
            # a step down in the snapshot is treated as an expiry without renewal evidence: renewal central
            g[i], lo[i], hi[i] = 1.0, min(1.0, f), 1.0
        elif kind == "new_smaller":
            new = k["acq"] / (k["acq_prev"] if k.get("acq_prev") else vref)
            g[i], lo[i], hi[i] = min(1.0, new), min(1.0, new) * 0.8, 1.0
        elif kind == "non_renewal":
            g[i], lo[i], hi[i] = (1.0, 1.0, 1.0) if y <= 2022 else (0.0, 0.0, 0.4)
        elif kind == "expiry":
            if k.get("face"):  # partial expiry (Türkiye): renewal central, the face value as the low end
                g[i], lo[i], hi[i] = 1.0, k["face"][y], 1.0
            elif iso == "NLD":
                share = min(1.0, k["acq"] / max(v21, 1e-9))
                gone = share * (0.25 if y == 2022 else 1.0)
                g[i], lo[i], hi[i] = 1.0, 1.0 - gone, 1.0
            elif iso == "SRB":
                g[i], lo[i], hi[i] = 1.0, k["alt_low"], 1.0
            else:  # BGR, SVN: contract to end-2022
                g[i], lo[i], hi[i] = (1.0, 1.0, 1.0) if y <= 2022 else (1.0, k["alt_low"], 1.0)
    return g, lo, hi


def apply_site(bt: dict, data: dict, e2: dict, bd) -> dict:
    FR = data["frac"]
    hs = ["H1", "H2", "H3", "H4", "H5"]
    # measured K1 band on gas volumes: actual/pred in [exp(-q95), exp(-q05)]
    kb = {h: (math.exp(-bt["bands"][h]["K1"]["q95"]), math.exp(-bt["bands"][h]["K1"]["q05"])) for h in hs}
    fb = {h: (math.exp(-bt["bands"][h]["F"]["q95"]), math.exp(-bt["bands"][h]["F"]["q05"])) for h in hs}
    rho = 0.26
    out, patch_c, patch_cb, patch_t, patch_central, patch_pol = {}, {}, {}, {}, {}, {}
    for iso, k in CONTRACTS.items():
        c = data["countries"].get(iso)
        tr = (c or {}).get("to_rus")
        rec = {"contract": {kk: vv for kk, vv in k.items() if kk not in ("face", "step")}}
        if not tr or not tr.get("cb") or not tr.get("bmul"):
            rec["status"] = "no to_rus series with a band in the site"
            out[iso] = rec
            continue
        mix, fs = bd.pre_war_fuel_split(iso), bd.fossil_share(iso)
        fuels = sum(mix.get(f) or 0.0 for f in ("crude", "products", "gas", "lng", "coal", "other_fossil")) or 1.0
        s = fs * (mix.get("gas") or 0.0) / fuels
        vol = (e2.get(iso) or {}).get("gas_from_rus_bcm") or {}
        v = {y: (vol.get(str(y)) or {}).get("central") for y in range(2019, 2027)}
        rec.update({"gas_share_of_base": round(s, 4), "fossil_share": round(fs, 4), "volumes_bcm_site": v})
        if s <= 0.005 or k["kind"] in ("none", "already") or not v.get(2021):
            rec["status"] = "unchanged: " + (
                "no gas in the mix"
                if s <= 0.005
                else "no long-term contract found"
                if k["kind"] == "none"
                else "already contract-based"
                if k["kind"] == "already"
                else "no gas volume"
            )
            out[iso] = rec
            continue
        vref = statistics.mean(v[y] for y in (2019, 2020, 2021) if v[y] is not None)
        g, lo, hi = contract_path(iso, vref, v[2021])
        strike = (tr.get("strike_lost") or [[0] * 6] * 3)[1]
        b_pre = [b + x for b, x in zip(tr["bmul"], strike)]
        w = [s * (b - (1 - fs)) / fs / b if b and fs else s for b in b_pre]
        gasv = [w[i] * b_pre[i] for i in range(6)]  # gas expected value at the held-flat volume, x base
        q = tr["bmul"]
        dq = [gasv[i] * (g[i] - 1.0) for i in range(6)]
        q_new = [round(max(0.0, q[i] + dq[i]), 4) for i in range(6)]
        cb_new, cb_fband = [None], [None]
        for h in range(1, 6):
            idx = range(1, h + 1)
            wt = [q_new[i] * FR[i] for i in idx]
            sg = sum(FR[i] * gasv[i] * g[i] for i in idx)
            W = sum(FR[i] * gasv[i] * g[i] for i in idx) / sum(wt) if sum(wt) else 0.0
            g_lo, g_hi = tr["cb"][h]
            for band, store in ((kb, cb_new), (fb, cb_fband)):
                if sg > 0:
                    L = band[hs[h - 1]][0] * sum(FR[i] * gasv[i] * lo[i] for i in idx) / sg
                    U = band[hs[h - 1]][1] * sum(FR[i] * gasv[i] * hi[i] for i in idx) / sg
                else:  # no expected gas (Poland after 2022 at H>1 still has 2022)
                    L, U = (
                        1.0,
                        1.0 + band[hs[h - 1]][1] * sum(FR[i] * gasv[i] * hi[i] for i in idx) / max(sum(wt), 1e-9),
                    )

                def comb(a: float, b: float, W: float = W) -> float:
                    return math.sqrt((W * a) ** 2 + ((1 - W) * b) ** 2 + 2 * rho * W * (1 - W) * a * b)

                store.append([round(1 - comb(1 - L, 1 - g_lo), 4), round(1 + comb(U - 1, g_hi - 1), 4)])
        base, br = tr["base"], tr["base_range"]
        rec.update(
            {
                "vref_bcm_2019_2021": round(vref, 3),
                "gas_path_central": [round(x, 3) for x in g],
                "gas_path_low": [round(x, 3) for x in lo],
                "gas_path_high": [round(x, 3) for x in hi],
                "bmul_before": q,
                "bmul_after": q_new,
                "cb_before": tr["cb"],
                "cb_after_K1band": cb_new,
                "cb_after_Fband_gas": cb_fband,
                "base_range_before": br,
                "base_range_gas_part_removed": [
                    round(base - (base - br[0]) * (1 - s), 5),
                    round(base + (br[1] - base) * (1 - s), 5),
                ],
            }
        )
        central = {
            "bmul": q_new,
            "bmul_lo": [round(max(0.0, a + d), 4) for a, d in zip(tr["bmul_lo"], dq)],
            "bmul_hi": [round(max(0.0, a + d), 4) for a, d in zip(tr["bmul_hi"], dq)],
        }
        patch_c[iso] = {**central, "cb": cb_new}
        patch_cb[iso] = {**patch_c[iso], "base_range": rec["base_range_gas_part_removed"]}
        if any(abs(d) > 1e-9 for d in dq):
            patch_central[iso] = central
            if iso == "POL":
                patch_pol[iso] = central
        # ---- Ukraine transit end as a forced loss (on the current site path, as strike_supply() does) ----
        t = TRANSIT.get(iso)
        if t and t["would"] != "none" and v.get(2024):
            would = v[2024] * (0.85 if t["would"] == "v2024x0.85" else 1.0)
            got = {2025: v.get(2025) or 0.0, 2026: (v.get(2026) or 0.0) / (8 / 12)}
            lost = [[0.0] * 6 for _ in range(3)]  # low, central, high, x base
            for i, y in ((4, 2025), (5, 2026)):
                for bnd, f in enumerate((1 - TRANSIT_BAND, 1.0, 1 + TRANSIT_BAND)):
                    wv = 0.0 if (bnd == 0 and t.get("low0")) else would * f
                    lost[bnd][i] = max(0.0, wv - got[y]) / vref * gasv[i]
            cur = tr.get("cur") or [1.0] * 6
            ge = (tr.get("gain") or {}).get("e")
            wgt = [FR[i] * cur[i] * (ge[1][i] if ge else 1.0) for i in range(6)]
            cb = [None]
            for h in range(1, 6):
                s0 = sum(wgt[i] * q[i] for i in range(1, h + 1))
                s1 = s0 - sum(wgt[i] * lost[1][i] for i in range(1, h + 1))
                lo_ = tr["cb"][h][0] * s0 - sum(wgt[i] * lost[2][i] for i in range(1, h + 1))
                hi_ = tr["cb"][h][1] * s0 - sum(wgt[i] * lost[0][i] for i in range(1, h + 1))
                cb.append([round(min(1.0, lo_ / s1), 4), round(max(1.0, hi_ / s1), 4)] if s1 > 0 else tr["cb"][h])
            patch_t[iso] = {
                "bmul": [round(max(0.0, a - x), 4) for a, x in zip(q, lost[1])],
                "bmul_lo": [round(max(0.0, a - x), 4) for a, x in zip(tr["bmul_lo"], lost[2])],
                "bmul_hi": [round(max(0.0, a - x), 4) for a, x in zip(tr["bmul_hi"], lost[0])],
                "cb": cb,
            }
            rec["transit_end"] = {
                "why": t["why"],
                "would_have_bcm": round(would, 3),
                "got_bcm_2025_2026ann": {k2: round(x, 3) for k2, x in got.items()},
                "lost_x_base_low_central_high": [[round(x, 4) for x in r] for r in lost],
                "lost_bcm_central": {
                    2025: round(max(0.0, would - got[2025]), 3),
                    2026: round(max(0.0, would - got[2026]), 3),
                },
            }
        elif t:
            rec["transit_end"] = {"why": t["why"], "lost": 0}
        rec["status"] = "changed"
        out[iso] = rec
    return {
        "countries": out,
        "patch": {
            "contract_full": patch_c,
            "contract_full_and_base_range": patch_cb,
            "contract_central_only": patch_central,
            "poland_only": patch_pol,
            "transit_forced": patch_t,
        },
        "k1_band": {h: [round(a, 4), round(b, 4)] for h, (a, b) in kb.items()},
        "f_band_gas": {h: [round(a, 4), round(b, 4)] for h, (a, b) in fb.items()},
    }


def run(patch_path: str | None) -> None:
    A = load_eurostat()
    main_origins = list(range(2014, 2021))
    vint = {o: 2014 if o < 2018 else 2018 for o in main_origins}
    rows = backtest(A, main_origins, vint)
    bt = evaluate(rows)
    look = evaluate(backtest(A, [2011, 2012, 2013], dict.fromkeys((2011, 2012, 2013), 2014)))
    data, e2, bd = site_inputs()
    site = apply_site(bt, data, e2, bd)
    res = {
        "generated": "2026-10-25",
        "what": "Round 53: contract baseline for pipeline-gas buyers of Russian gas. Contracts as of end-2021, a pre-registered back-test of contract-based predictions against 'held flat' (2014-2020 origins), the site patch it implies and the 2025 Ukrainian transit end as a forced loss. Research only; nothing here is read by the build.",
        "status": "proposal; not applied",
        "rule": RULE,
        "units": "Eurostat volumes in PJ (GCV); contracts in bcm/yr; site multipliers x the to_rus base (2021 at 2019-2021 prices)",
        "vintages": {
            str(k): {
                "src": v["src"],
                "years": v["years"],
                "bcm_per_year": {
                    c: {str(y): acq(k, c, y) for y in range(v["years"][0], v["years"][1] + 1)} for c in v["c"]
                },
            }
            for k, v in VINTAGES.items()
        },
        "excluded_from_backtest": EXCLUDED_GEO,
        "backtest": {"origins": main_origins, "vintage_by_origin": vint, **bt, "cases": rows},
        "lookahead_sensitivity_2011_2013": {k: look[k] for k in ("by_origin", "bands", "verdict")},
        "contracts_end_2021": CONTRACTS,
        "sources": S,
        "transit": TRANSIT,
        "site": {k: site[k] for k in ("countries", "k1_band", "f_band_gas")},
    }
    OUT.write_text(json.dumps(res, indent=1, default=str))
    if patch_path:
        Path(patch_path).write_text(json.dumps(site["patch"]))
    for m in ("K1", "K3"):
        vd = bt["verdict"][m]
        print(
            m,
            "PASS" if vd["PASS"] else "FAIL",
            {
                k: vd[k]
                for k in (
                    "cells",
                    "cells_15pct_better",
                    "pass_band_not_wider",
                    "wider_at",
                    "pass_coverage",
                    "coverage_below_85_at",
                )
            },
        )
    for h, d in bt["bands"].items():
        print(
            h,
            d["n"],
            {m: (d[m]["median_abs"], d[m]["width"]) for m in ("F", "K1", "K3")},
            "KB",
            d["KB"],
            "LOO",
            bt["loo_coverage"][h],
        )
    for o, hs in bt["by_origin"].items():
        print(o, {h: (d["n"], d["F"], d["K1"], d["K3"]) for h, d in hs.items()})


def merge(path: str) -> None:
    res = json.loads(OUT.read_text())
    ba = json.loads(Path(path).read_text())
    # keep only the countries some variant changes (the run covers every country with purchases from Russia)
    ba["countries"] = {
        i: r
        for i, r in ba["countries"].items()
        if any(json.dumps(r[v]) != json.dumps(r["before"]) for v in r if v != "before")
    }
    for s in ba["summary"].values():
        s["biggest_movers_net_pct_gdp"] = [
            m for m in s["biggest_movers_net_pct_gdp"] if m["d_net_pct_gdp"] or m["d_nowar_eur_bn"]
        ]
    res["site_before_after"] = ba
    OUT.write_text(json.dumps(res, indent=1, default=str))


def digitize() -> None:  # evidence only; needs Pillow and numpy (not used by `run`)
    import numpy as np
    from PIL import Image

    ev = json.loads((RAW / "cedigaz_vintages_digitised.json").read_text())
    files = {
        "2014": "crs_r42405_2015-11-05_fig3_cedigaz_2014.png",
        "2018": "crs_r42405_2020-02-26_fig5_cedigaz_2018.png",
    }
    for v, f in files.items():
        cal, pal = ev["sources"][v]["calibration"], ev["palettes"][v]
        x0 = cal.get("x_2010_px", cal.get("x_2015_px"))
        y1, y2 = (2010, 2030) if v == "2014" else (2015, 2035)
        a = np.asarray(Image.open(RAW / f).convert("RGB")).astype(int)
        res: dict[str, dict[int, list[float]]] = {n: {} for n, _ in pal}
        for yr in range(y1, y2 + 1):
            for off in range(-12, 13, 2):
                x = round(x0 + cal["px_per_year"] * (yr - y1)) + off + (8 if yr == y1 else 0) - (8 if yr == y2 else 0)
                runs: list[list] = []
                for y in range(cal["y_zero_px"] - 1, 250, -1):
                    col = a[y, x]
                    if runs and np.abs(runs[-1][0] - col).max() <= 18:
                        runs[-1][1] += 1
                        runs[-1][2] = y
                    else:
                        runs.append([col, 1, y])
                k, prev, got, bad = 0, 0.0, {}, False
                for col, n, ytop in runs:
                    if n < 2:
                        continue
                    if col.min() >= 240 and n > 30:
                        break
                    j = next(
                        (
                            j
                            for j in range(k, len(pal))
                            if np.abs(np.array(pal[j][1]) - col).max() <= (20 if v == "2014" else 22)
                        ),
                        None,
                    )
                    if j is None:
                        bad = True
                        continue
                    top = (cal["y_zero_px"] - ytop) / cal["px_per_bcm"]
                    got[pal[j][0]] = got.get(pal[j][0], 0.0) + top - prev
                    prev, k = top, j
                if not bad:
                    for n, _ in pal:
                        res[n].setdefault(yr, []).append(got.get(n, 0.0))
        print(
            v, {n: {y: round(float(np.median(x)), 1) for y, x in d.items() if np.median(x) > 0} for n, d in res.items()}
        )


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "run":
        run(sys.argv[2] if len(sys.argv) > 2 else None)
    elif cmd == "merge":
        merge(sys.argv[2])
    elif cmd == "digitize":
        digitize()
    else:
        raise SystemExit(__doc__)
