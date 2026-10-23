# /// script
# dependencies = ["requests>=2.31"]
# ///
"""Eurostat temporary protection (migr_asytpsm): beneficiaries of temporary protection at the end of each month,
Ukrainian citizens, all ages and both sexes, every reporting country, from 2022-03.

Writes research/2026-10/raw/eurostat_tp/migr_asytpsm_UA_<date>.json (the JSON-stat response as Eurostat sends it, the
same format as the migr_asytpsm_UA.json the checks read; that file is left alone) and prints the latest month and the
EU total. Eurostat updates the dataset monthly.

Run: uv run pipeline/fetch/eurostat_tp.py
"""

from __future__ import annotations

from _common import TODAY, get, jsonstat_rows, out_dir, report, write_json

API = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/migr_asytpsm"


def main() -> None:
    od = out_dir("eurostat_tp")
    r = get(API, {"format": "JSON", "lang": "EN", "citizen": "UA", "sex": "T", "age": "TOTAL",
                  "sinceTimePeriod": "2022-03"})  # fmt: skip
    r.raise_for_status()
    d = r.json()
    p = write_json(od / f"migr_asytpsm_UA_{TODAY}.json", d)
    cols, rows = jsonstat_rows(d)
    ci = {c: i for i, c in enumerate(cols)}
    vi = ci["value"]
    last = max(r[ci["time"]] for r in rows)
    n = sum(1 for r in rows if r[ci["time"]] == last)
    eu = sorted((r[ci["time"]], r[vi]) for r in rows if r[ci["geo"]] == "EU27_2020")
    report(p, f"{len(rows)} cells; latest month {last} ({n} countries so far); latest EU27 total {eu[-1][0]}: "
              f"{eu[-1][1]:,}; dataset updated {d.get('updated')}")  # fmt: skip


if __name__ == "__main__":
    main()
