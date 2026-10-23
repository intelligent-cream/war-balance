# /// script
# dependencies = ["requests>=2.31"]
# ///
"""UN Comtrade: every reporter's goods trade with Russia (M49 643) and with Ukraine (804), at the detail trade.json uses.

Writes to research/2026-10/raw/comtrade_api/ (one gzipped JSON per family, retrieval date in the name):
  comtrade_annual_total_<date>.json.gz   annual, cmdCode TOTAL, 2019-2025 (default):
      p643_M/X, p804_M/X  all reporters' imports from / exports to Russia and Ukraine (one query per year and flow)
      r643_M/X, r804_M/X  Russia's and Ukraine's own reports by partner (the mirror fallback in trade.json)
  comtrade_annual_hs4_<date>.json.gz     annual exports to Russia by HS4 heading, all reporters: the 22 headings of
      trade.json's dual-use (CHP) proxy plus 8708 (reported separately)
  comtrade_monthly_<date>.json.gz        monthly, TOTAL, 2026 (default): p643/p804 M/X and r804 M/X, Jan to the
      latest month any reporter has filed

Query filters are those of trade.json: customsCode C00, motCode 0, partner2Code 0; the value is primaryValue in USD
(imports CIF, exports FOB). Rows keep only the fields the build needs (see COLS).

Access: the public preview API (comtradeapi.un.org/public/v1/preview, no key) returns at most 500 rows per query and
one period per query, and answers 429 when called fast; the script pauses between calls, backs off on 429, and splits
HS4 code lists until every query is under the cap. With a free subscription key in COMTRADE_KEY the full data API
(comtradeapi.un.org/data/v1/get, 100k rows) is used instead. Responses are cached per query in the system temp folder,
so an interrupted run resumes; `--no-cache` ignores the cache.

The preview API also has a call quota (about 40 calls per half hour from one address; it answers 403 "Out of call
volume quota ... replenished in HH:MM:SS"): the script waits and resumes, so a full run without a key takes 1-2 hours.

Run: uv run pipeline/fetch/comtrade.py [--years 2019-2025] [--hs4-years 2021-2025] [--months 2026]
                                        [--only total,hs4,monthly]
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import sys
import tempfile
import time
from pathlib import Path

from _common import TODAY, get, out_dir, report, write_json

PREVIEW = "https://comtradeapi.un.org/public/v1/preview/C/{freq}/HS"
FULL = "https://comtradeapi.un.org/data/v1/get/C/{freq}/HS"
CAP = 500  # preview row cap
FILTERS = {"customsCode": "C00", "motCode": "0", "partner2Code": "0"}
DUAL_USE = ["8411", "8471", "8473", "8482", "8483", "8486", "8504", "8517", "8525", "8526", "8529", "8532", "8533",
            "8536", "8537", "8541", "8542", "8548", "8803", "8807", "9013", "9014", "8708"]  # fmt: skip
COLS = ["period", "reporterCode", "partnerCode", "flowCode", "cmdCode", "classificationCode", "primaryValue",
        "cifvalue", "fobvalue", "netWgt", "isReported", "isAggregate", "isOriginalClassification"]  # fmt: skip

KEY = os.environ.get("COMTRADE_KEY")
CACHE = Path(tempfile.gettempdir()) / "war-balance-comtrade-cache"


def query(freq: str, params: dict, use_cache: bool) -> dict:
    p = {**params, **FILTERS}
    tag = hashlib.sha1(json.dumps([freq, p], sort_keys=True).encode()).hexdigest()[:16]
    cf = CACHE / f"{tag}.json"
    if use_cache and cf.exists():
        return json.loads(cf.read_text())
    if KEY:
        url, hdr, pause = FULL.format(freq=freq), {"Ocp-Apim-Subscription-Key": KEY}, 1.0
    else:
        url, hdr, pause = PREVIEW.format(freq=freq), None, 2.0
    for _ in range(12):
        r = get(url, p, headers=hdr, pause=pause, tries=8)
        # the preview API allows a limited number of calls per window and then answers 403 "Out of call volume
        # quota. Quota will be replenished in HH:MM:SS": wait that long and retry
        m = re.search(r"replenished in (\d+):(\d+):(\d+)", r.text) if r.status_code == 403 else None
        if not m:
            break
        wait = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) + 10
        print(f"  quota exhausted; waiting {wait // 60} min", flush=True)
        time.sleep(wait)
    try:
        d = r.json()
    except ValueError:
        d = {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
    if r.status_code != 200 and not d.get("error"):
        d["error"] = f"HTTP {r.status_code}"
    out = {"freq": freq, "params": p, "status": r.status_code, "error": d.get("error") or None,
           "rows": [[row.get(c) for c in COLS] for row in d.get("data") or []]}  # fmt: skip
    if r.status_code == 200:
        CACHE.mkdir(parents=True, exist_ok=True)
        cf.write_text(json.dumps(out))
    return out


def capped(q: dict) -> bool:
    return not KEY and len(q["rows"]) >= CAP


def years_arg(s: str) -> list[int]:
    a, _, b = s.partition("-")
    return list(range(int(a), int(b or a) + 1))


def bundle(queries: list[dict], what: str) -> dict:
    rows = [q2 for q in queries for q2 in q["rows"]]
    return {
        "source": "UN Comtrade " + ("data API (key)" if KEY else "public preview API (no key)"),
        "what": what,
        "retrieved": TODAY,
        "filters": FILTERS,
        "columns": COLS,
        "queries": [{k: q[k] for k in ("freq", "params", "status", "error")} | {"n": len(q["rows"])} for q in queries],
        "rows": rows,
    }


def run_total(years, use_cache):
    qs = []
    for y in years:
        for partner in ("643", "804"):
            for flow in ("M", "X"):
                qs.append(query("A", {"period": y, "partnerCode": partner, "flowCode": flow, "cmdCode": "TOTAL"},
                                use_cache))  # fmt: skip
                if capped(qs[-1]):
                    print(f"  WARNING: p{partner}_{flow}_{y} hit the {CAP}-row cap", file=sys.stderr)
        for reporter in ("643", "804") if y <= 2021 else ("804",):  # Russia files no partner detail after 2021
            for flow in ("M", "X"):
                qs.append(query("A", {"period": y, "reporterCode": reporter, "flowCode": flow, "cmdCode": "TOTAL"},
                                use_cache))  # fmt: skip
        n_new = 8 if y <= 2021 else 6
        parts = []
        for q in qs[-n_new:]:
            pp = q["params"]
            tag = "p" + pp["partnerCode"] if "partnerCode" in pp else "r" + pp["reporterCode"]
            parts.append(f"{tag}_{pp['flowCode']}={len(q['rows'])}")
        print(f"  {y}: " + ", ".join(parts), flush=True)
    return qs


def run_hs4(years, use_cache):
    qs = []
    for y in years:
        todo = [DUAL_USE[i : i + 3] for i in range(0, len(DUAL_USE), 3)]
        n = 0
        while todo:
            codes = todo.pop(0)
            q = query("A", {"period": y, "partnerCode": "643", "flowCode": "X", "cmdCode": ",".join(codes)}, use_cache)
            if capped(q) and len(codes) > 1:
                todo[:0] = [codes[: len(codes) // 2], codes[len(codes) // 2 :]]
                continue
            if capped(q):
                print(f"  WARNING: HS {codes[0]} {y} hit the {CAP}-row cap", file=sys.stderr)
            qs.append(q)
            n += len(q["rows"])
        print(f"  {y}: {n} reporter x heading rows", flush=True)
    return qs


def run_monthly(year, use_cache):
    qs = []
    last = dt.date.today().month if year == dt.date.today().year else 12
    for m in range(1, last + 1):
        per = f"{year}{m:02d}"
        got = []
        for partner in ("643", "804"):
            for flow in ("M", "X"):
                got.append(query("M", {"period": per, "partnerCode": partner, "flowCode": flow, "cmdCode": "TOTAL"},
                                 use_cache))  # fmt: skip
        for flow in ("M", "X"):
            got.append(query("M", {"period": per, "reporterCode": "804", "flowCode": flow, "cmdCode": "TOTAL"},
                             use_cache))  # fmt: skip
        qs += got
        if m > 1 and not any(g["rows"] for g in got[:4]):
            print(f"  {per}: nothing filed yet; later months skipped")
            break
        print(f"  {per}: reporters vs RUS M/X {len(got[0]['rows'])}/{len(got[1]['rows'])}, vs UKR M/X "
              f"{len(got[2]['rows'])}/{len(got[3]['rows'])}, Ukraine's own M/X {len(got[4]['rows'])}/{len(got[5]['rows'])}", flush=True)  # fmt: skip
    return qs


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="2019-2025")
    ap.add_argument("--hs4-years", default="2021-2025", help="trade.json uses 2021 and 2023-2025")
    ap.add_argument("--months", default=str(dt.date.today().year), help="year whose months to fetch")
    ap.add_argument("--only", default="total,hs4,monthly")
    ap.add_argument("--no-cache", action="store_true")
    a = ap.parse_args()
    use_cache = not a.no_cache
    years = years_arg(a.years)
    od = out_dir("comtrade_api")
    only = set(a.only.split(","))
    print(f"UN Comtrade ({'key' if KEY else 'preview, no key'}), years {years[0]}-{years[-1]}, cache {CACHE}")
    errors = 0
    if "total" in only:
        qs = run_total(years, use_cache)
        errors += sum(1 for q in qs if q["status"] != 200)
        report(write_json(od / f"comtrade_annual_total_{TODAY}.json.gz",
                          bundle(qs, "annual TOTAL: p643/p804 all reporters M/X; r643/r804 own reports by partner")))  # fmt: skip
    if "hs4" in only:
        qs = run_hs4(years_arg(a.hs4_years), use_cache)
        errors += sum(1 for q in qs if q["status"] != 200)
        report(
            write_json(
                od / f"comtrade_annual_hs4_{TODAY}.json.gz",
                bundle(qs, "annual exports to Russia (p643 X) by HS4, dual-use proxy headings + 8708"),
            )
        )
    if "monthly" in only:
        qs = run_monthly(int(a.months), use_cache)
        errors += sum(1 for q in qs if q["status"] != 200)
        report(
            write_json(
                od / f"comtrade_monthly_{a.months}_{TODAY}.json.gz",
                bundle(qs, f"monthly TOTAL {a.months}: p643/p804 M/X all reporters; r804 M/X"),
            )
        )
    if errors:
        print(f"{errors} queries failed (status != 200); rerun to retry them (successful ones are cached)")
        sys.exit(1)


if __name__ == "__main__":
    main()
