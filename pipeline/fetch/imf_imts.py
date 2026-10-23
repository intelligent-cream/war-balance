# /// script
# dependencies = ["requests>=2.31"]
# ///
"""IMF International Trade in Goods by partner (IMTS, the successor of DOTS), SDMX 2.1 at api.imf.org (no key).

Every country's exports (XG_FOB_USD) to and imports (MG_CIF_USD) from Russia and Ukraine, annual and monthly from 2019,
and Russia's and Ukraine's own series by partner. This is the fill used for non-reporters (Vietnam 2025 etc.). Note
that IMTS is partly partner-derived for countries that do not report (column DERIVATION_TYPE), so it is no better
than Comtrade mirror data for them.

Writes research/2026-10/raw/imf_imts/IMTS_RUS_UKR_<date>.json.gz as {"columns", "rows"} with the columns COUNTRY,
INDICATOR, COUNTERPART_COUNTRY, FREQUENCY, TIME_PERIOD, OBS_VALUE, SCALE, DERIVATION_TYPE, UPDATE_DATE (values are
in USD; SCALE is the display scale only).

Run: uv run pipeline/fetch/imf_imts.py [--since 2019]
"""

from __future__ import annotations

import argparse
import csv
import io

from _common import TODAY, get, out_dir, report, write_json

API = "https://api.imf.org/external/sdmx/2.1/data/IMF.STA,IMTS/{key}"
KEEP = ["COUNTRY", "INDICATOR", "COUNTERPART_COUNTRY", "FREQUENCY", "TIME_PERIOD", "OBS_VALUE", "SCALE",
        "DERIVATION_TYPE", "UPDATE_DATE"]  # fmt: skip
CSV = {"Accept": "application/vnd.sdmx.data+csv;version=1.0.0"}


def fetch(key: str, since: str) -> list[list[str]]:
    r = get(API.format(key=key), {"startPeriod": since}, headers=CSV, timeout=900)
    if r.status_code == 404:  # SDMX "no results"
        return []
    r.raise_for_status()
    rd = csv.DictReader(io.StringIO(r.text))
    return [[row.get(c) for c in KEEP] for row in rd]


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--since", default="2019")
    a = ap.parse_args()
    od = out_dir("imf_imts")
    rows, keys = [], []
    for freq in ("A", "M"):
        for key in (
            f".XG_FOB_USD+MG_CIF_USD.RUS+UKR.{freq}",  # every country vs Russia / Ukraine
            f"RUS+UKR.XG_FOB_USD+MG_CIF_USD..{freq}",
        ):  # Russia's and Ukraine's own series by partner
            got = fetch(key, a.since)
            keys.append({"key": key, "n": len(got)})
            rows += got
            print(f"  {key}: {len(got)} observations", flush=True)
    p = write_json(od / f"IMTS_RUS_UKR_{TODAY}.json.gz",
                   {"dataflow": "IMF.STA:IMTS(1.0.0)", "retrieved": TODAY, "since": a.since, "queries": keys,
                    "columns": KEEP, "rows": rows})  # fmt: skip
    ci = {c: i for i, c in enumerate(KEEP)}
    ann = [r for r in rows if r[ci["FREQUENCY"]] == "A" and r[ci["COUNTERPART_COUNTRY"]] == "RUS"
           and r[ci["INDICATOR"]] == "MG_CIF_USD" and r[ci["COUNTRY"]] not in ("RUS", "UKR")]  # fmt: skip
    last = max((r[ci["TIME_PERIOD"]] for r in ann), default="-")
    n = len({r[ci["COUNTRY"]] for r in ann if r[ci["TIME_PERIOD"]] == last})
    upd = max((r[ci["UPDATE_DATE"]] or "" for r in rows), default="")
    report(p, f"{len(rows)} observations; imports from Russia: {n} countries for {last}; updated {upd[:10]}")


if __name__ == "__main__":
    main()
