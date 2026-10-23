# /// script
# dependencies = []
# ///
"""Headline totals from the newest raw pulls, for the monthly fetch workflow to decide whether to open a pull
request. Prints JSON; with --compare OLD.json also prints which totals moved by more than --threshold (relative) and
exits 1 if any did (exit 0 = nothing moved, so no pull request is needed).

Totals (EUR bn unless stated):
  comtrade.<flow>.<year>   sum over reporters of the annual TOTAL with Russia / Ukraine (p643_M, p643_X, p804_M,
                           p804_X), and the reporter count
  comtrade_monthly.<flow>  latest month with data and its reporter count
  crea.<year>              CREA calendar-year payments to Russia, all destinations
  eurostat_tp.eu27         latest EU27 temporary-protection stock (persons) and its month
  comext.eu_imp_ru.<year>  EU27 imports from Russia (Comext, annual)
  ecb.usd.<year>           USD per EUR annual average

Run: uv run pipeline/fetch/totals.py [--compare old.json] [--threshold 0.01] [--out new.json]
"""

from __future__ import annotations

import argparse
import gzip
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
RAW = ROOT / "research" / "2026-10" / "raw"


def newest(sub: str, pattern: str) -> Path | None:
    files = sorted((RAW / sub).glob(pattern))
    return files[-1] if files else None


def load(p: Path):
    b = p.read_bytes()
    return json.loads(gzip.decompress(b) if p.suffix == ".gz" else b)


def totals() -> dict:
    out: dict = {}
    fx = {}
    if p := newest("ecb", "EXR_*.json"):
        fx = load(p)["annual"].get("USD", {})
        out["ecb.usd"] = {y: round(v, 5) for y, v in fx.items() if y >= "2019"}
    if p := newest("comtrade_api", "comtrade_annual_total_*.json.gz"):
        d = load(p)
        ci = {c: i for i, c in enumerate(d["columns"])}
        seen, agg = set(), {}
        for r in d["rows"]:
            per, rep, par, fl = str(r[ci["period"]]), r[ci["reporterCode"]], r[ci["partnerCode"]], r[ci["flowCode"]]
            # r643/r804 rows against other partners are not totals of p643/p804; overlaps are identical rows
            if par not in (643, 804) or (per, rep, par, fl) in seen:
                continue
            seen.add((per, rep, par, fl))
            if r[ci["primaryValue"]] is None or per not in fx:
                continue
            k = f"comtrade.p{par}_{fl}.{per}"
            a = agg.setdefault(k, [0.0, 0])
            a[0] += r[ci["primaryValue"]] / fx[per] / 1e9
            a[1] += 1
        out.update({k: {"eur_bn": round(v[0], 3), "reporters": v[1]} for k, v in sorted(agg.items())})
    if p := newest("comtrade_api", "comtrade_monthly_*.json.gz"):
        d = load(p)
        ci = {c: i for i, c in enumerate(d["columns"])}
        last: dict = {}
        for r in d["rows"]:
            if r[ci["reporterCode"]] in (643, 804):
                continue
            k = f"comtrade_monthly.p{r[ci['partnerCode']]}_{r[ci['flowCode']]}"
            last.setdefault(k, {}).setdefault(str(r[ci["period"]]), set()).add(r[ci["reporterCode"]])
        for k, m in sorted(last.items()):
            per = max(m)
            out[k] = {"latest": per, "reporters": len(m[per])}
    if p := newest("crea_api", "counter_year_country_fuel_2021on_*.json.gz"):
        d = load(p)
        yi, vi = d["columns"].index("year"), d["columns"].index("value_eur")
        agg = {}
        for r in d["rows"]:
            try:
                agg[r[yi][:4]] = agg.get(r[yi][:4], 0.0) + float(r[vi]) / 1e9
            except ValueError:
                pass
        out["crea"] = {y: round(v, 2) for y, v in sorted(agg.items())}
    if p := newest("eurostat_tp", "migr_asytpsm_UA_*.json"):
        d = load(p)
        geo = d["dimension"]["geo"]["category"]["index"]
        tim = d["dimension"]["time"]["category"]["index"]
        g, nt = geo.get("EU27_2020"), len(tim)
        best = None
        for t, i in sorted(tim.items(), key=lambda x: x[1]):
            v = d["value"].get(str(g * nt + i)) if g is not None else None
            if v is not None:
                best = (t, v)
        if best:
            out["eurostat_tp.eu27"] = {"month": best[0], "persons": best[1]}
    if p := newest("comext", "DS-045409_A_RU_UA_*.json.gz"):
        d = load(p)
        ci = {c: i for i, c in enumerate(d["columns"])}
        agg = {}
        for r in d["rows"]:
            if (r[ci["reporter"]], r[ci["partner"]], r[ci["product"]], r[ci["flow"]], r[ci["indicators"]]) == (
                "EU27_2020", "RU", "TOTAL", "1", "VALUE_IN_EUROS"):  # fmt: skip
                agg[str(r[ci["time"]])] = round(r[ci["value"]] / 1e9, 3)
        out["comext.eu_imp_ru"] = dict(sorted(agg.items()))
    return out


def flat(d: dict, pre: str = "") -> dict:
    o = {}
    for k, v in d.items():
        if isinstance(v, dict):
            o.update(flat(v, f"{pre}{k}."))
        else:
            o[pre + k] = v
    return o


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--compare")
    ap.add_argument("--threshold", type=float, default=0.01)
    ap.add_argument("--out")
    a = ap.parse_args()
    t = totals()
    s = json.dumps(t, indent=1, sort_keys=True)
    if a.out:
        Path(a.out).write_text(s + "\n")
    else:
        print(s)
    if a.compare:
        old = flat(json.loads(Path(a.compare).read_text())) if Path(a.compare).exists() else {}
        new = flat(t)
        moved = []
        for k, v in new.items():
            o = old.get(k)
            if isinstance(v, (int, float)) and isinstance(o, (int, float)):
                if abs(v - o) > a.threshold * max(abs(o), 1e-9):
                    moved.append(f"{k}: {o} -> {v}")
            elif o != v:
                moved.append(f"{k}: {o} -> {v}")
        print("\n".join(moved) if moved else "no total moved", file=sys.stderr)
        sys.exit(1 if moved else 0)


if __name__ == "__main__":
    main()
