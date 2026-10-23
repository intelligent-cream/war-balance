# /// script
# dependencies = ["requests>=2.31"]
# ///
"""State Statistics Service of Ukraine (Ukrstat): Ukraine's own goods trade by partner country, via the SDMX API of
the new site stat.gov.ua (the old ukrstat.gov.ua serves an expired TLS certificate, and customs.gov.ua answers 403
to scripts).

Two dataflows (agency SSSU), CSV, all partners:
  DF_EXTERNAL_TRADE_OF_GOODS_BY_PARTNER_COUNTRIES   annual, exports / imports by partner (country of destination,
      origin, consignment and "trading country"), USD thousand; at 2026-10-23 this runs to 2024 only
      (UPDATED 19.08.2025, NEXT_UPDATE 24.06.2026 not met)
  DF_EXTERNAL_TRADE_OF_GOODS_M_Q                    monthly, goods by country, cumulative from January
      (TRADE_BREAKDOWN BY_GOODS_BY_COUNTRY, GOODS 000000000000 = total), USD thousand; at 2026-10-23 this holds
      Jan-Jul, Jan-Aug and Jan-Sep 2025 only (UPDATED 19.11.2025)
Ukraine's own full-year 2025 report by partner is therefore not in Ukrstat's API either; the IMF IMTS pull
(imf_imts.py, COUNTRY=UKR) carries it.

Writes research/2026-10/raw/ukrstat/ukrstat_trade_by_partner_<date>.json.gz with {"<dataflow>": {"columns", "rows"}}
(the long note columns are dropped).

Run: uv run pipeline/fetch/ukrstat.py
"""

from __future__ import annotations

import csv
import io

from _common import TODAY, get, out_dir, report, write_json

API = "https://stat.gov.ua/sdmx/workspaces/default:integration/registry/sdmx/2.1/data/{flow}/{key}"
CSV = {"Accept": "application/vnd.sdmx.data+csv;version=1.0.0"}
DROP = {"DATAFLOW", "NOTES_DS", "NOTES_TS", "NOTES_OBS", "TERRITORIAL_COVERAGE", "FREQUENCIES", "DSS_TYPE",
        "DYNAMICS", "MAIN_INDICATORS", "DSS_CODE"}  # fmt: skip
QUERIES = [
    ("DF_EXTERNAL_TRADE_OF_GOODS_BY_PARTNER_COUNTRIES", "all"),
    ("DF_EXTERNAL_TRADE_OF_GOODS_M_Q", "BY_GOODS_BY_COUNTRY.EXP_GOODS.UA00000000000000000.._T.000000000000._T._T...M"),
    ("DF_EXTERNAL_TRADE_OF_GOODS_M_Q", "BY_GOODS_BY_COUNTRY.IMP_GOODS.UA00000000000000000.._T.000000000000._T._T...M"),
]


def main() -> None:
    od = out_dir("ukrstat")
    out: dict = {"source": "stat.gov.ua SDMX 2.1 (SSSU)", "retrieved": TODAY}
    for flow, key in QUERIES:
        r = get(API.format(flow=flow, key=key), headers=CSV, timeout=900)
        r.raise_for_status()
        rd = list(csv.DictReader(io.StringIO(r.text)))
        cols = [c for c in (rd[0].keys() if rd else []) if c not in DROP]
        t = out.setdefault(flow, {"queries": [], "columns": cols, "rows": []})
        t["queries"].append(key)
        t["rows"] += [[row[c] for c in cols] for row in rd]
        periods = sorted({row["TIME_PERIOD"] for row in rd})
        upd = sorted({row.get("UPDATED", "") for row in rd})
        print(f"  {flow} {key[:40]}: {len(rd)} observations, periods {periods[0] if periods else '-'} to "
              f"{periods[-1] if periods else '-'}, updated {', '.join(upd)}")  # fmt: skip
    report(write_json(od / f"ukrstat_trade_by_partner_{TODAY}.json.gz", out))


if __name__ == "__main__":
    main()
