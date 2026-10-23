# /// script
# dependencies = ["requests>=2.31"]
# ///
"""UNHCR Refugee Data Finder API (api.unhcr.org/population/v1, no key): people from Ukraine by country of asylum.

One query per year (end-year stock; the mid-year figures appear in the API only when UNHCR publishes them, usually
Oct-Nov), all countries of asylum, limit 1000 per page. A year that UNHCR has not published yet comes back empty and is
reported as such.

Writes research/2026-10/raw/unhcr/population_coo_UKR_<first>-<last>_<date>.json with {"<year>": [items...]} in the
API's own fields (refugees, asylum_seekers, oip, ...; note the API mixes numbers and strings).

Run: uv run pipeline/fetch/unhcr.py [--years 2021-2026]
"""

from __future__ import annotations

import argparse
import datetime as dt

from _common import TODAY, get, out_dir, report, write_json

API = "https://api.unhcr.org/population/v1/population/"


def num(v) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return 0


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default=f"2021-{dt.date.today().year}")
    a = ap.parse_args()
    y0, _, y1 = a.years.partition("-")
    years = list(range(int(y0), int(y1 or y0) + 1))
    od = out_dir("unhcr")
    out, summary = {"retrieved": TODAY, "query": {"coo": "UKR", "coa_all": True}}, []
    for y in years:
        items, page = [], 1
        while True:
            r = get(API, {"year": y, "coo": "UKR", "coa_all": "true", "limit": 1000, "page": page})
            r.raise_for_status()
            d = r.json()
            items += d.get("items") or []
            if page >= (d.get("maxPages") or 0):
                break
            page += 1
        out[str(y)] = items
        ref = sum(num(i.get("refugees")) for i in items)
        oip = sum(num(i.get("oip")) for i in items)
        summary.append(f"{y}: {len(items)} countries, refugees {ref:,}, other in need {oip:,}" if items
                       else f"{y}: not published yet")  # fmt: skip
    p = write_json(od / f"population_coo_UKR_{years[0]}-{years[-1]}_{TODAY}.json", out)
    report(p)
    for s in summary:
        print("   ", s)


if __name__ == "__main__":
    main()
