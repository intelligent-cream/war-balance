# /// script
# dependencies = ["requests>=2.31"]
# ///
"""UN OCHA Financial Tracking Service (FTS): humanitarian funding flows to Ukraine, one file per year.

The public API is api.hpc.tools/v1/public/fts/flow (no key; the fts.unocha.org/api/... pattern returns 404). Each
response page holds up to 1000 flows plus `incoming` / `outgoing` / `internal` totals; the script follows `nextLink`.

Writes research/2026-10/raw/fts/fts_flows_UKR_<year>_<date>.json.gz with {"incoming", "outgoing", "internal",
"flows"} (every flow as FTS sends it; funding by donor = sum of amountUSD over flows whose sourceObjects name the
donor, flowType "Standard", status "paid" / "commitment"). Years default to 2022 to the current year.

Run: uv run pipeline/fetch/fts.py [--years 2022-2026]
"""

from __future__ import annotations

import argparse
import datetime as dt

from _common import TODAY, get, out_dir, report, write_json

API = "https://api.hpc.tools/v1/public/fts/flow"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default=f"2022-{dt.date.today().year}")
    a = ap.parse_args()
    y0, _, y1 = a.years.partition("-")
    od = out_dir("fts")
    print("UN OCHA FTS, flows with destination Ukraine")
    for y in range(int(y0), int(y1 or y0) + 1):
        url, params, flows, head = API, {"countryISO3": "UKR", "year": y}, [], None
        while url:
            r = get(url, params, timeout=300)
            r.raise_for_status()
            d = r.json()
            head = head or {k: d["data"].get(k) for k in ("incoming", "outgoing", "internal")}
            flows += d["data"].get("flows") or []
            url, params = (d.get("meta") or {}).get("nextLink"), None
        p = write_json(od / f"fts_flows_UKR_{y}_{TODAY}.json.gz", {"query": {"countryISO3": "UKR", "year": y},
                                                                    "retrieved": TODAY, **head, "flows": flows})  # fmt: skip
        inc = head.get("incoming") or {}
        report(p, f"{y}: {len(flows)} flows; incoming funding USD {inc.get('fundingTotal', 0) / 1e9:.2f} bn, "
                  f"pledges USD {inc.get('pledgeTotal', 0) / 1e9:.3f} bn")  # fmt: skip


if __name__ == "__main__":
    main()
