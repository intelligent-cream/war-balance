# /// script
# dependencies = ["requests>=2.31"]
# ///
"""ECB Data Portal (data-api.ecb.europa.eu, no key): euro reference exchange rates used to convert USD to EUR.

Writes research/2026-10/raw/ecb/EXR_<date>.json with
  annual   EXR.A.<cur>.EUR.SP00.A   annual averages from 2014 (USD, GBP, CHF, JPY, CNY, PLN, CZK, HUF, SEK, NOK, DKK,
           TRY, INR, KRW; RUB until the ECB stopped publishing it on 1 March 2022)
  monthly  EXR.M.<cur>.EUR.SP00.A   monthly averages from 2021-01 (same currencies)
as {"<freq>": {"<cur>": {"<period>": rate}}}, units of currency per EUR. The repo uses USD per EUR annual averages
(trade.json fx: 2021 1.18274 ... 2025 1.12998) and the 2026 mean of the monthly averages.

Run: uv run pipeline/fetch/ecb.py
"""

from __future__ import annotations

import csv
import io
import statistics

from _common import TODAY, get, out_dir, report, write_json

API = "https://data-api.ecb.europa.eu/service/data/EXR/{key}"
CUR = ["USD", "GBP", "CHF", "JPY", "CNY", "PLN", "CZK", "HUF", "SEK", "NOK", "DKK", "TRY", "INR", "KRW", "RUB"]


def fetch(freq: str, since: str) -> dict[str, dict[str, float]]:
    r = get(API.format(key=f"{freq}.{'+'.join(CUR)}.EUR.SP00.A"), {"format": "csvdata", "startPeriod": since})
    r.raise_for_status()
    out: dict[str, dict[str, float]] = {}
    for row in csv.DictReader(io.StringIO(r.text)):
        if row.get("OBS_VALUE"):
            out.setdefault(row["CURRENCY"], {})[row["TIME_PERIOD"]] = float(row["OBS_VALUE"])
    return out


def main() -> None:
    od = out_dir("ecb")
    a, m = fetch("A", "2014"), fetch("M", "2021-01")
    p = write_json(od / f"EXR_{TODAY}.json", {"source": "ECB EXR, SP00.A (average)", "retrieved": TODAY,
                                              "unit": "currency per EUR", "annual": a, "monthly": m})  # fmt: skip
    usd = a.get("USD", {})
    cur_year = max(k[:4] for k in m.get("USD", {"0000-00": 0}))
    ytd = [v for k, v in m.get("USD", {}).items() if k.startswith(cur_year)]
    report(
        p,
        "USD per EUR: "
        + ", ".join(f"{y} {usd[y]:.5f}" for y in sorted(usd) if y >= "2021")
        + (f"; {cur_year} mean of {len(ytd)} months {statistics.mean(ytd):.4f}" if ytd else ""),
    )


if __name__ == "__main__":
    main()
