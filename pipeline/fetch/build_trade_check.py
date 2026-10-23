# /// script
# dependencies = []
# ///
"""Rebuild trade.json's figures from the raw Comtrade pulls in research/2026-10/raw/comtrade_api/ and report where they
differ from research/2026-10/trade.json. Read-only: trade.json is never written.

The rules are those of trade-notes.md (the original build_trade.py is not in the repository):
  value       primaryValue (USD; imports CIF, exports FOB), cmdCode TOTAL, customsCode C00, motCode 0, partner2 0,
              divided by the ECB annual average USD per EUR (trade.json "fx") and by 1e9 -> EUR bn
  own report  imports_from_RUS = reporter's p643 M, exports_to_RUS = p643 X, imports_from_UKR = p804 M,
              exports_to_UKR = p804 X
  mirror      when the reporter itself did not report: Russia's own report (r643, 2021 only) or Ukraine's own report
              (r804, 2021-2024; 2025 is not in Comtrade), flow reversed; mirror[indicator][year] = true
  RUS entry   imports_from_UKR / exports_to_UKR: 2021 Russia's own report vs Ukraine, 2022+ Ukraine's report (mirror)
  UKR entry   trade with Russia = Ukraine's own report (p643 with reporter 804)
  M49 490     "Other Asia, nes" = TWN
  dual use    exports_to_RUS_dual_use[year] = sum of p643 X over the 22 HS4 headings (8708 excluded and given as
              hs8708_<year>); years 2021, 2023-2025; 0 (not null) when the reporter filed a total export to Russia
              but no row in these headings; latest = most recent of 2023-2025 with a reported total
Uses the newest dated file of each family unless --date is given.

Run: uv run pipeline/fetch/build_trade_check.py [--date 2026-10-23] [--tol 0.005] [--show 40]
Exit status 0 if every rebuilt value is within tolerance of trade.json, 1 otherwise.
"""

from __future__ import annotations

import argparse
import gzip
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
RAW = ROOT / "research" / "2026-10" / "raw" / "comtrade_api"
TRADE = ROOT / "research" / "2026-10" / "trade.json"
YEARS = ["2021", "2022", "2023", "2024", "2025"]
DUAL = ["8411", "8471", "8473", "8482", "8483", "8486", "8504", "8517", "8525", "8526", "8529", "8532", "8533", "8536",
        "8537", "8541", "8542", "8548", "8803", "8807", "9013", "9014"]  # fmt: skip
IND = {  # indicator: (partner, own flow, mirror flow)
    "imports_from_RUS": (643, "M", "X"),
    "exports_to_RUS": (643, "X", "M"),
    "imports_from_UKR": (804, "M", "X"),
    "exports_to_UKR": (804, "X", "M"),
}


def newest(prefix: str, date: str | None) -> Path | None:
    files = sorted(RAW.glob(f"{prefix}_*{date or ''}*.json.gz"))
    return files[-1] if files else None


def load_rows(path: Path) -> dict:
    d = json.loads(gzip.decompress(path.read_bytes()))
    ci = {c: i for i, c in enumerate(d["columns"])}
    out: dict = {}
    for r in d["rows"]:
        key = (str(r[ci["period"]]), r[ci["reporterCode"]], r[ci["partnerCode"]], r[ci["flowCode"]],
               str(r[ci["cmdCode"]]))  # fmt: skip
        v = r[ci["primaryValue"]]
        if v is not None:
            out.setdefault(key, v)  # overlapping queries return identical rows
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date")
    ap.add_argument("--tol", type=float, default=0.005, help="relative tolerance (default 0.5%%)")
    ap.add_argument("--abs", type=float, default=0.0005, help="absolute tolerance, EUR bn (default 0.0005)")
    ap.add_argument("--show", type=int, default=40)
    a = ap.parse_args()

    trade = json.loads(TRADE.read_text())
    fx = {y: float(v) for y, v in trade["fx"]["USD_per_EUR"].items()}
    m2i = {int(k): v for k, v in trade["m49_to_iso3"].items()}
    m2i[490] = "TWN"
    i2m = {v: k for k, v in m2i.items()}
    i2m["TWN"] = 490

    ft, fh = newest("comtrade_annual_total", a.date), newest("comtrade_annual_hs4", a.date)
    if not ft:
        sys.exit(f"no comtrade_annual_total_*.json.gz in {RAW.relative_to(ROOT)}; run pipeline/fetch/comtrade.py")
    tot = load_rows(ft)
    hs4 = load_rows(fh) if fh else {}
    print(f"raw: {ft.name}" + (f", {fh.name}" if fh else " (no HS4 file: dual-use not checked)"))

    def val(y, rep, par, flow, cmd="TOTAL"):
        v = tot.get((y, rep, par, flow, cmd)) if cmd == "TOTAL" else hs4.get((y, rep, par, flow, cmd))
        return None if v is None else v / fx[y] / 1e9

    rebuilt: dict = {}
    for iso, c in trade["countries"].items():
        m49 = i2m.get(iso) or (int(c["m49"]) if c.get("m49") else None)
        if m49 is None:
            continue
        e = rebuilt.setdefault(iso, {"mirror": {}})
        for ind, (par, fl, mfl) in IND.items():
            vals, mir = {}, {}
            for y in YEARS:
                if iso == "RUS" and par == 804:
                    if y == "2021":
                        v, m = val(y, 643, 804, fl), False
                    else:
                        v, m = val(y, 804, 643, mfl), True
                elif iso == "UKR" and par == 643:
                    v, m = val(y, 804, 643, fl), False
                else:
                    v, m = val(y, m49, par, fl), False
                    if v is None:
                        if par == 643 and y == "2021":
                            v, m = val(y, 643, m49, mfl), True
                        elif par == 804 and y <= "2024":
                            v, m = val(y, 804, m49, mfl), True
                        m = m and v is not None
                vals[y], mir[y] = v, m
            e[ind] = vals
            e["mirror"][ind] = mir
        if hs4:
            du = {}
            for y in ("2021", "2023", "2024", "2025"):
                parts = [val(y, m49, 643, "X", h) for h in DUAL]
                parts = [p for p in parts if p is not None]
                # a reporter that filed a total export to Russia but no row in these headings gets 0, not null
                filed = val(y, m49, 643, "X") is not None
                du[y] = sum(parts) if parts else (0.0 if filed else None)
                h = val(y, m49, 643, "X", "8708")
                du[f"hs8708_{y}"] = h if h is not None else (0.0 if filed else None)
            e["dual"] = du

    # compare
    diffs, n_cmp, n_same, missing_raw, missing_repo = [], 0, 0, 0, 0
    for iso, c in trade["countries"].items():
        e = rebuilt.get(iso)
        if not e:
            continue
        for ind in IND:
            for y in YEARS:
                old = (c.get(ind) or {}).get(y)
                new = e[ind].get(y)
                if old is None and new is None:
                    continue
                n_cmp += 1
                if old is None:
                    missing_repo += 1
                    diffs.append((abs(new), iso, ind, y, old, new, "new value (repo null)"))
                elif new is None:
                    missing_raw += 1
                    diffs.append((abs(old), iso, ind, y, old, new, "not in raw pull"))
                elif abs(new - old) <= max(a.abs, a.tol * abs(old)):
                    n_same += 1
                else:
                    diffs.append((abs(new - old), iso, ind, y, old, new, f"{(new - old) / old:+.1%}" if old else ""))
                om = bool(((c.get("mirror") or {}).get(ind) or {}).get(y))
                if old is not None and new is not None and om != e["mirror"][ind][y]:
                    diffs.append((0, iso, ind, y, old, new, f"mirror flag repo={om} rebuilt={e['mirror'][ind][y]}"))
        du_old = c.get("exports_to_RUS_dual_use") or {}
        if "dual" in e and du_old:
            for y in ("2021", "2023", "2024", "2025"):
                old, new = du_old.get(y), e["dual"].get(y)
                if old is None and new is None:
                    continue
                n_cmp += 1
                if old is not None and new is not None and abs(new - old) <= max(a.abs, a.tol * abs(old)):
                    n_same += 1
                else:
                    diffs.append((abs((new or 0) - (old or 0)), iso, "dual_use", y, old, new, "dual-use HS4 sum"))

    diffs.sort(reverse=True)
    print(f"compared {n_cmp} values: {n_same} match (within {a.tol:.1%} or EUR {a.abs * 1e3:.1f} mn), "
          f"{len([d for d in diffs if d[6] not in ('new value (repo null)', 'not in raw pull') and not d[6].startswith('mirror')])} differ, "
          f"{missing_repo} new in raw (null in repo), {missing_raw} in repo but not in raw, "
          f"{sum(1 for d in diffs if d[6].startswith('mirror'))} mirror-flag differences")  # fmt: skip
    if diffs:
        print(f"\nlargest {min(a.show, len(diffs))} differences (EUR bn):")
        print(f"  {'ISO3':4} {'indicator':17} {'year':4} {'trade.json':>11} {'rebuilt':>11}  note")
        for _, iso, ind, y, old, new, note in diffs[: a.show]:
            fmt = lambda v: "null" if v is None else f"{v:.6f}"  # noqa: E731
            print(f"  {iso:4} {ind:17} {y:4} {fmt(old):>11} {fmt(new):>11}  {note}")
    sys.exit(0 if not diffs else 1)


if __name__ == "__main__":
    main()
