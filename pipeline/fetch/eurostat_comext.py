# /// script
# dependencies = ["requests>=2.31"]
# ///
"""Eurostat Comext (dataset DS-045409, EU trade by HS2-4-6 and CN8): each EU member's trade with Russia and Ukraine.

Writes to research/2026-10/raw/comext/ (retrieval date in each name), one gzipped JSON per frequency:
  DS-045409_M_RU_UA_<date>.json.gz   monthly from 2019-01
  DS-045409_A_RU_UA_<date>.json.gz   annual from 2019
Reporters: the 27 members and EU27_2020; partners RU, UA; flows 1 (imports) and 2 (exports); products TOTAL, 27
(mineral fuels), 2701 (coal), 2709 (crude), 2710 (products), 2711 (gas), 7108 (gold) and the HS4 headings of the
dual-use proxy in trade.json; indicators VALUE_IN_EUROS and QUANTITY_IN_100KG. Rows are flattened from JSON-stat to
[freq, reporter, partner, product, flow, indicators, time, value]. Eurostat updates Comext about mid-month (t-2).

Run: uv run pipeline/fetch/eurostat_comext.py
"""

from __future__ import annotations

from _common import TODAY, get, jsonstat_rows, out_dir, report, write_json

API = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409"
EU = ["AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV",
      "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK", "EU27_2020"]  # fmt: skip
PRODUCTS = ["TOTAL", "27", "2701", "2709", "2710", "2711", "7108"]
DUAL_USE = ["8411", "8471", "8473", "8482", "8483", "8486", "8504", "8517", "8525", "8526", "8529", "8532", "8533",
            "8536", "8537", "8541", "8542", "8548", "8803", "8807", "9013", "9014", "8708"]  # fmt: skip


def fetch(freq: str, since: str, products: list[str]) -> tuple[dict, list[str], list[list]]:
    params = [("format", "JSON"), ("lang", "en"), ("freq", freq), ("sinceTimePeriod", since)]
    params += [("reporter", r) for r in EU] + [("partner", p) for p in ("RU", "UA")]
    params += [("product", p) for p in products] + [("flow", "1"), ("flow", "2")]
    params += [("indicators", "VALUE_IN_EUROS"), ("indicators", "QUANTITY_IN_100KG")]
    r = get(API, params, timeout=600)
    r.raise_for_status()
    d = r.json()
    cols, rows = jsonstat_rows(d)
    return d, cols, rows


def main() -> None:
    od = out_dir("comext")
    print("Eurostat Comext DS-045409, EU27 members vs RU/UA")
    for freq, since in (("M", "2019-01"), ("A", "2019")):
        rows, cols, meta, urls = [], None, None, []
        # split the product list so each response stays well under the API's size limit
        for chunk in (PRODUCTS, DUAL_USE[:12], DUAL_USE[12:]):
            d, cols, rr = fetch(freq, since, chunk)
            rows += rr
            meta = {k: d.get(k) for k in ("label", "source", "updated")}
            urls.append(chunk)
        out = {"dataset": "DS-045409", **meta, "retrieved": TODAY, "freq": freq, "since": since,
               "product_chunks": urls, "columns": cols, "rows": rows}  # fmt: skip
        p = write_json(od / f"DS-045409_{freq}_RU_UA_{TODAY}.json.gz", out)
        ci = {c: i for i, c in enumerate(cols)}
        last = max((r[ci["time"]] for r in rows if r[ci["product"]] == "TOTAL"), default="-")
        tot = sum(r[-1] for r in rows if r[ci["reporter"]] == "EU27_2020" and r[ci["product"]] == "TOTAL"
                  and r[ci["partner"]] == "RU" and r[ci["flow"]] == "1" and r[ci["indicators"]] == "VALUE_IN_EUROS"
                  and str(r[ci["time"]]).startswith(last[:4]))  # fmt: skip
        report(p, f"{len(rows)} cells, latest period {last}, EU27 imports from RU in {last[:4]}: EUR {tot / 1e9:.2f} bn"
                  f"{' (to ' + last + ')' if freq == 'M' else ''}; Comext updated {meta['updated']}")  # fmt: skip


if __name__ == "__main__":
    main()
