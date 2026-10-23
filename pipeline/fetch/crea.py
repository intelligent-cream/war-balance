# /// script
# dependencies = ["requests>=2.31"]
# ///
"""CREA Russia Fossil Tracker (api.russiafossiltracker.com, no key): the queries behind crea.json and the shipping split.

Writes to research/2026-10/raw/crea_api/ (retrieval date in each name):
  counter_year_country_fuel_2021on_<date>.json.gz        calendar years from 2021-01-01, by destination and
      commodity group (split_gas_oil), EUR and USD: the query crea-notes.md calls counter_year_country_fuel_2021on.csv
  counter_year_country_fuel_from20220224_<date>.json.gz  the same from the invasion date (2022-02-24)
  counter_month_country_fuel_<date>.json.gz              monthly, by destination and commodity group (for 2026 YTD)
  price_default_<date>.json.gz                           /v0/price, default scenario, from 2021-01-01
  departure_by_ownership_<date>.json.gz                  daily departures of Russian crude and products by tanker
      ownership / insurance ('Shadow' vs G7+ tankers, tonnes): not used by the site yet (sources audit, section 1)
  counter_last_<date>.json                               the live counter (latest date in the data)

CSV responses are converted to {"columns": [...], "rows": [[...]]} and gzipped (raw *.csv.gz is git-ignored).
Run: uv run pipeline/fetch/crea.py [--to YYYY-MM-DD]
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import io

from _common import TODAY, get, out_dir, report, write_json

API = "https://api.russiafossiltracker.com"


def csv_table(text: str) -> dict:
    rd = list(csv.reader(io.StringIO(text)))
    return {"columns": rd[0], "rows": rd[1:]} if rd else {"columns": [], "rows": []}


def fetch_csv(path: str, params: dict) -> dict:
    r = get(API + path, {**params, "format": "csv"}, timeout=600)
    r.raise_for_status()
    t = csv_table(r.text)
    t["url"] = r.url
    t["retrieved"] = TODAY
    return t


def total(t: dict, col: str = "value_eur", where=None) -> float:
    i = t["columns"].index(col)
    s = 0.0
    for row in t["rows"]:
        if where and not where(dict(zip(t["columns"], row))):
            continue
        try:
            s += float(row[i])
        except (ValueError, IndexError):
            pass
    return s


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--to", default=(dt.date.today() - dt.timedelta(days=1)).isoformat())
    a = ap.parse_args()
    od = out_dir("crea_api")
    common = {"aggregate_by": "year,destination_iso2,destination_country,commodity_group",
              "commodity_grouping": "split_gas_oil", "currency": "EUR,USD", "date_to": a.to}  # fmt: skip
    print(f"CREA Russia Fossil Tracker, data to {a.to}")

    t = fetch_csv("/v0/counter", {**common, "date_from": "2021-01-01"})
    p = write_json(od / f"counter_year_country_fuel_2021on_{TODAY}.json.gz", t)
    yc = next((c for c in ("year", "date") if c in t["columns"]), None)
    yi = t["columns"].index(yc) if yc else None
    by_year: dict[str, float] = {}
    if yi is not None:
        vi = t["columns"].index("value_eur")
        for row in t["rows"]:
            try:
                by_year[row[yi][:4]] = by_year.get(row[yi][:4], 0.0) + float(row[vi])
            except ValueError:
                pass
    report(
        p,
        f"{len(t['rows'])} rows; EUR bn by year: "
        + ", ".join(f"{y} {v / 1e9:.1f}" for y, v in sorted(by_year.items())),
    )

    t = fetch_csv("/v0/counter", {**common, "date_from": "2022-02-24"})
    p = write_json(od / f"counter_year_country_fuel_from20220224_{TODAY}.json.gz", t)
    report(p, f"{len(t['rows'])} rows; total since 2022-02-24 EUR {total(t) / 1e9:.1f} bn")

    t = fetch_csv("/v0/counter", {**common, "aggregate_by": "month,destination_iso2,destination_country,commodity_group",
                                  "date_from": "2021-01-01"})  # fmt: skip
    report(write_json(od / f"counter_month_country_fuel_{TODAY}.json.gz", t), f"{len(t['rows'])} rows")

    t = fetch_csv("/v0/price", {"date_from": "2021-01-01", "date_to": a.to, "scenario": "default"})
    report(write_json(od / f"price_default_{TODAY}.json.gz", t), f"{len(t['rows'])} rows")

    t = fetch_csv("/v0/chart/departure_by_ownership",
                  {"departure_date_from": "2022-01-01", "date_to": a.to, "aggregate_by": "month",
                   "commodity_origin_iso2": "RU"})  # fmt: skip
    report(write_json(od / f"departure_by_ownership_{TODAY}.json.gz", t), f"{len(t['rows'])} rows")

    r = get(API + "/v0/counter_last", {"format": "json"})
    r.raise_for_status()
    report(write_json(od / f"counter_last_{TODAY}.json", r.json()))


if __name__ == "__main__":
    main()
