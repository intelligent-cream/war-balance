# /// script
# dependencies = ["requests>=2.31"]
# ///
"""Raw inputs for the placebo test (pipeline/placebo.py, round 42): the method rerun as if the war had started in 2018
(and in 2014), so every input stops at 2021.

Writes, one folder per source, the retrieval date in each file name:
  imf_imts_placebo/IMTS_RUS_annual_2008_2021_<date>.json.gz   every country's goods exports to (XG_FOB_USD) and
      imports from (MG_CIF_USD) Russia, annual, plus Russia's own series by partner (the mirror); USD
  worldbank_placebo/NY.GDP.MKTP.CD_2008_2021_<date>.json      GDP in current USD, all economies (World Bank WDI)
  ecb_placebo/EXR_USD_annual_2008_2021_<date>.json            ECB reference rate, USD per EUR, annual average
  fred_placebo/commodities_monthly_2008_2021_<date>.json      IMF primary commodity prices via FRED (Brent, natural
      gas EU and Japan LNG, Australian coal), monthly USD
  eurostat_placebo/sts_inpi_a_EA20_2008_2021_<date>.json      euro-area import price index, industrial products
      excluding energy (CPA_B_C_X_MIG_NRG), annual, 2021 = 100 (the non-fuel goods deflator of energy2.json)

Run: uv run pipeline/fetch/placebo_raw.py
"""

from __future__ import annotations

import csv
import io

from _common import TODAY, get, out_dir, report, write_json

START, END = 2008, 2021
IMTS = "https://api.imf.org/external/sdmx/2.1/data/IMF.STA,IMTS/{key}"
KEEP = ["COUNTRY", "INDICATOR", "COUNTERPART_COUNTRY", "FREQUENCY", "TIME_PERIOD", "OBS_VALUE", "DERIVATION_TYPE",
        "UPDATE_DATE"]  # fmt: skip
FRED = ["POILBREUSDM", "PNGASEUUSDM", "PNGASJPUSDM", "PCOALAUUSDM"]


def imts() -> None:
    rows, keys = [], []
    for key in (".XG_FOB_USD+MG_CIF_USD.RUS.A", "RUS.XG_FOB_USD+MG_CIF_USD..A"):
        r = get(IMTS.format(key=key), {"startPeriod": START, "endPeriod": END},
                headers={"Accept": "application/vnd.sdmx.data+csv;version=1.0.0"}, timeout=900)  # fmt: skip
        r.raise_for_status()
        got = [[row.get(c) for c in KEEP] for row in csv.DictReader(io.StringIO(r.text))]
        keys.append({"key": key, "n": len(got)})
        rows += got
    p = write_json(out_dir("imf_imts_placebo") / f"IMTS_RUS_annual_{START}_{END}_{TODAY}.json.gz",
                   {"dataflow": "IMF.STA:IMTS(1.0.0)", "url": IMTS, "retrieved": TODAY, "unit": "USD",
                    "queries": keys, "columns": KEEP, "rows": rows})  # fmt: skip
    report(p, f"{len(rows)} observations")


def worldbank() -> None:
    url = "https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD"
    r = get(url, {"date": f"{START}:{END}", "format": "json", "per_page": 20000})
    r.raise_for_status()
    p = write_json(out_dir("worldbank_placebo") / f"NY.GDP.MKTP.CD_{START}_{END}_{TODAY}.json", r.json())
    report(p)


def ecb() -> None:
    url = "https://data-api.ecb.europa.eu/service/data/EXR/A.USD.EUR.SP00.A"
    r = get(url, {"startPeriod": START, "endPeriod": END, "format": "csvdata"})
    r.raise_for_status()
    annual = {row["TIME_PERIOD"]: float(row["OBS_VALUE"]) for row in csv.DictReader(io.StringIO(r.text))}
    p = write_json(out_dir("ecb_placebo") / f"EXR_USD_annual_{START}_{END}_{TODAY}.json",
                   {"source": "ECB EXR A.USD.EUR.SP00.A", "url": url, "retrieved": TODAY, "unit": "USD per EUR",
                    "annual": annual})  # fmt: skip
    report(p)


def fred() -> None:
    series = {}
    for sid in FRED:
        r = get("https://fred.stlouisfed.org/graph/fredgraph.csv", {"id": sid})
        r.raise_for_status()
        rd = csv.reader(io.StringIO(r.text))
        next(rd)
        series[sid] = {d[:7]: float(v) for d, v in rd if v not in ("", ".") and START <= int(d[:4]) <= END}
    p = write_json(out_dir("fred_placebo") / f"commodities_monthly_{START}_{END}_{TODAY}.json",
                   {"source": "IMF Primary Commodity Prices via FRED", "url": "https://fred.stlouisfed.org/graph/fredgraph.csv?id=<id>",
                    "retrieved": TODAY, "unit": "USD (per bbl, per mmbtu, per t)", "series": series})  # fmt: skip
    report(p)


def eurostat() -> None:
    url = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inpi_a"
    r = get(url, {"format": "JSON", "geo": "EA20", "unit": "I21", "indic_bt": "PRC_IMP",
                  "cpa2_1": "CPA_B_C_X_MIG_NRG", "sinceTimePeriod": START, "untilTimePeriod": END})  # fmt: skip
    r.raise_for_status()
    d = r.json()
    times = d["dimension"]["time"]["category"]["index"]
    annual = {t: d["value"][str(i)] for t, i in times.items() if str(i) in d["value"]}
    p = write_json(out_dir("eurostat_placebo") / f"sts_inpi_a_EA20_{START}_{END}_{TODAY}.json",
                   {"source": "Eurostat sts_inpi_a, EA20, PRC_IMP, CPA_B_C_X_MIG_NRG, I21", "url": url,
                    "retrieved": TODAY, "unit": "index 2021 = 100", "annual": annual, "updated": d.get("updated")})  # fmt: skip
    report(p)


def main() -> None:
    imts()
    worldbank()
    ecb()
    fred()
    eurostat()


if __name__ == "__main__":
    main()
