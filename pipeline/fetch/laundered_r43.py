# /// script
# dependencies = ["requests>=2.31", "openpyxl>=3.1"]
# ///
"""Round 43, laundered oil: the downloads behind research/2026-10/gaps/laundered_r43.json.

Writes small files (retrieval date in each name) under research/2026-10/raw/<source>_laund/:
  eurostat_laund/  nrg_bal_c (oil balance of Cyprus and Malta: imports, maritime bunkers, inland use);
                   nrg_ti_oil (their oil imports by country of last consignment, kt, siec O4000);
                   nrg_ti_oil crude imports from Russia and in total for every EU member (refiners' Russian share)
  comext_laund/    DS-045409 HS 2710 imports and exports of Cyprus and Malta by partner (EUR, 100 kg)
  comtrade_laund/  UN Comtrade monthly 2026: crude (HS 2709) imports from Russia and the world of India, China, Korea,
                   Singapore, Malaysia and Türkiye; fuel (HS 2710) imports by partner of the measured buyers
  aps_laund/       Australian Petroleum Statistics (DCCEEW, CC BY 4.0): product imports by source country, A$m and ML,
                   calendar years from 2019 (extracted from the monthly workbook, which is not kept)
  eia_laund/       EIA: US imports of crude oil and products from Russia, and US refinery crude input (kb/d, annual)
  epdk_laund/      EPDK (Türkiye) annual oil market reports 2019-2025: crude imports from Russia and in total (tonnes)
  ecb_laund/       ECB monthly EUR/AUD reference rates

Downloads are untrusted data: run this script with `python -I` (it adds only its own folder to sys.path).
Run: python -I pipeline/fetch/laundered_r43.py [--only eurostat,comext,comtrade,aps,eia,epdk,ecb]
"""

from __future__ import annotations

import argparse
import csv
import html
import io
import re
import sys
import tempfile
import time
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _common import TODAY, get, jsonstat_rows, out_dir, report, write_json

ESTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/"
COMEXT = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409"
COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/M/HS"
CKAN = "https://data.gov.au/data/api/3/action/package_show?id=australian-petroleum-statistics"
EIA_IMP = "https://www.eia.gov/dnav/pet/pet_move_impcus_a2_nus_ep00_im0_mbblpd_a.htm"
EIA_RUNS = "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=MCRRIUS2&f=A"
EPDK = "https://www.epdk.gov.tr/Detay/DownloadDocument"
# EPDK "Petrol Piyasası Sektör Raporu" (Word, English edition) per year; 2025: "Gelişim Raporu" (PDF)
EPDK_IDS = {"2019": "1AyLO71b1fI=", "2020": "W+pUFJFZDHw=", "2021": "7h+MYU854qs=", "2022": "zfTpcPymxMk=",
            "2023": "A2Bza6vGyaQ=", "2024": "NXPHGFPfzlQ=", "2025": "r3ZhHh4OpEY="}  # fmt: skip
ECB = "https://data-api.ecb.europa.eu/service/data/EXR/M.AUD.EUR.SP00.A"
EU = ["AT", "BE", "BG", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "HR", "HU", "IE", "IT", "LT", "LV", "NL", "PL",
      "PT", "RO", "SE", "SI", "SK", "EU27_2020", "UK", "NO"]  # fmt: skip
REFINERS = "699,156,410,702,458,792"  # India, China, Korea, Singapore, Malaysia, Türkiye
BUYERS = "608,598,152,554,586,710,242"  # Philippines, PNG, Chile, New Zealand, Pakistan, South Africa, Fiji
MONTHS = [f"2026{m:02d}" for m in range(1, 9)]


def _estat(name: str, params: list[tuple[str, str]]) -> dict:
    r = get(ESTAT + name, params, timeout=300)
    r.raise_for_status()
    d = r.json()
    cols, rows = jsonstat_rows(d)
    return {
        "dataset": name,
        "updated": d.get("updated"),
        "url": r.url,
        "retrieved": TODAY,
        "columns": cols,
        "rows": rows,
    }


def eurostat() -> None:
    od = out_dir("eurostat_laund")
    print("Eurostat energy: Cyprus and Malta oil balance and imports by partner; EU crude imports from Russia")
    bal = [("geo", g) for g in ("CY", "MT")] + [("siec", "O4000XBIO"), ("unit", "KTOE"), ("sinceTimePeriod", "2019")]
    bal += [("nrg_bal", b) for b in ("IMP", "GAE", "INTMARB", "INTAVI", "GIC", "FC_E", "FC_TRA_E", "TI_EHG_E")]
    p = write_json(od / f"nrg_bal_c_CY_MT_{TODAY}.json", _estat("nrg_bal_c", bal))
    report(p)
    ti = [("geo", "CY"), ("geo", "MT"), ("siec", "O4000"), ("unit", "THS_T"), ("sinceTimePeriod", "2019")]
    p = write_json(od / f"nrg_ti_oil_CY_MT_O4000_{TODAY}.json", _estat("nrg_ti_oil", ti))
    report(p)
    cr = [("geo", g) for g in EU] + [("siec", "O4100_TOT"), ("unit", "THS_T"), ("partner", "RU"), ("partner", "TOTAL")]
    p = write_json(od / f"nrg_ti_oil_crude_RU_{TODAY}.json", _estat("nrg_ti_oil", cr + [("sinceTimePeriod", "2019")]))
    report(p)


def comext() -> None:
    od = out_dir("comext_laund")
    print("Eurostat Comext DS-045409: HS 2710 of Cyprus and Malta by partner")
    params = [("format", "JSON"), ("lang", "en"), ("freq", "A"), ("sinceTimePeriod", "2019"), ("reporter", "CY"),
              ("reporter", "MT"), ("product", "2710"), ("flow", "1"), ("flow", "2"),
              ("indicators", "VALUE_IN_EUROS"), ("indicators", "QUANTITY_IN_100KG")]  # fmt: skip
    r = get(COMEXT, params, timeout=300)
    r.raise_for_status()
    d = r.json()
    cols, rows = jsonstat_rows(d)
    out = {"dataset": "DS-045409", "updated": d.get("updated"), "retrieved": TODAY, "columns": cols, "rows": rows}
    report(write_json(od / f"DS-045409_A_CY_MT_2710_{TODAY}.json", out))


def _comtrade(params: dict) -> dict:
    p = {**params, "customsCode": "C00", "motCode": "0", "partner2Code": "0"}
    for _ in range(8):
        r = get(COMTRADE, p, pause=3.0, tries=8)
        m = re.search(r"replenished in (\d+):(\d+):(\d+)", r.text) if r.status_code == 403 else None
        if not m:
            break
        wait = int(m[1]) * 3600 + int(m[2]) * 60 + int(m[3]) + 10
        print(f"  quota exhausted; waiting {wait // 60} min", flush=True)
        time.sleep(wait)
    r.raise_for_status()
    keep = ("period", "reporterCode", "partnerCode", "flowCode", "cmdCode", "primaryValue", "netWgt")
    return {"params": p, "rows": [{k: x.get(k) for k in keep} for x in r.json().get("data") or []]}


def comtrade() -> None:
    od = out_dir("comtrade_laund")
    print("UN Comtrade monthly 2026: refiners' crude imports from Russia; buyers' fuel imports by partner")
    crude = [_comtrade({"reporterCode": REFINERS, "period": m, "flowCode": "M", "cmdCode": "2709",
                        "partnerCode": "0,643"}) for m in MONTHS]  # fmt: skip
    p = write_json(od / f"monthly_2026_2709_refiners_{TODAY}.json.gz", {"retrieved": TODAY, "queries": crude})
    report(p, f"{sum(len(q['rows']) for q in crude)} rows")
    fuel = [_comtrade({"reporterCode": BUYERS, "period": m, "flowCode": "M", "cmdCode": "2710"}) for m in MONTHS]
    p = write_json(od / f"monthly_2026_2710_buyers_{TODAY}.json.gz", {"retrieved": TODAY, "queries": fuel})
    report(p, f"{sum(len(q['rows']) for q in fuel)} rows")


def aps() -> None:
    import openpyxl

    od = out_dir("aps_laund")
    print("Australian Petroleum Statistics: product imports by source country")
    r = get(CKAN)
    r.raise_for_status()
    res = r.json()["result"]["resources"][0]
    x = get(res["url"], timeout=600)
    x.raise_for_status()
    with tempfile.TemporaryDirectory() as td:
        f = Path(td) / "aps.xlsx"
        f.write_bytes(x.content)
        wb = openpyxl.load_workbook(f, read_only=True, data_only=True)
        out = {"source": res["url"], "resource_name": res["name"], "last_modified": res.get("last_modified"),
               "licence": "CC BY 4.0", "retrieved": TODAY, "bytes": len(x.content),
               "note": "refined products excluding LPG and bitumen (HS 2710-like), calendar years; crude separately"}  # fmt: skip
        for sheet, unit in (("Imports value by country", "aud_m"), ("Imports volume by country", "ml")):
            rows = list(wb[sheet].iter_rows(values_only=True))
            ci = {c: i for i, c in enumerate(rows[0])}
            col = {
                k: next(c for c in rows[0] if c and c.startswith(k))
                for k in ("Total refined", "LPG", "Bitumen", "Crude")
            }
            prod: dict = {}
            crude: dict = {}
            months: dict = {}
            for row in rows[1:]:
                if not row[0] or not hasattr(row[0], "year") or row[0].year < 2019:
                    continue

                def num(k, row=row, ci=ci, col=col):
                    v = row[ci[col[k]]]
                    return float(str(v).replace(",", "")) if v not in (None, "") else 0.0

                y = str(row[0].year)
                months.setdefault(y, set()).add(row[0].month)
                v = num("Total refined") - num("LPG") - num("Bitumen")
                prod.setdefault(row[1], {})[y] = round(prod.get(row[1], {}).get(y, 0.0) + v, 2)
                crude.setdefault(row[1], {})[y] = round(crude.get(row[1], {}).get(y, 0.0) + num("Crude"), 2)
            out[unit] = {c: {y: v for y, v in by.items() if abs(v) > 0.05} for c, by in prod.items()}
            out[unit] = {c: by for c, by in out[unit].items() if by}
            out[unit + "_crude"] = {c: {y: v for y, v in by.items() if abs(v) > 0.05} for c, by in crude.items()}
            out[unit + "_crude"] = {c: by for c, by in out[unit + "_crude"].items() if by}
            out["months"] = {y: sorted(m) for y, m in months.items()}
    report(write_json(od / f"aps_imports_by_country_{TODAY}.json", out))


def _text(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s)))


def eia() -> None:
    od = out_dir("eia_laund")
    print("EIA: US imports from Russia and refinery crude input")
    t = _text(get(EIA_IMP).text)
    m = re.search(r"Russia ((?:[\d,]+ ){1,6})1973-(\d{4})", t)
    runs = _text(get(EIA_RUNS).text)
    r2020 = re.search(r"2020's ((?:[\d,]+ ){1,7})", runs)
    out = {"retrieved": TODAY, "imports_url": EIA_IMP, "runs_url": EIA_RUNS,
           "imports_from_russia_kbd_row": m.group(0) if m else None, "columns": "the page's six annual columns, 2020-2025",
           "refinery_crude_input_kbd_2020s": r2020.group(1).split() if r2020 else None}  # fmt: skip
    report(write_json(od / f"eia_us_russia_{TODAY}.json", out))


def _docx_text(b: bytes) -> str:
    x = zipfile.ZipFile(io.BytesIO(b)).read("word/document.xml").decode("utf8", "replace")
    t = re.sub(r"</w:tc>", " | ", re.sub(r"</w:p>", "\n", x))
    return " ".join(line.strip() for line in re.sub(r"<[^>]+>", "", t).split("\n") if line.strip())


def epdk() -> None:
    od = out_dir("epdk_laund")
    print("EPDK annual oil market reports: crude imports from Russia and in total")
    out = {"retrieved": TODAY, "unit": "tonnes", "years": {}}
    for y, i in EPDK_IDS.items():
        r = get(EPDK, {"id": i}, timeout=300)
        rec = {"url": r.url, "status": r.status_code, "bytes": len(r.content)}
        if r.content[:4] == b"PK\x03\x04":
            s = _docx_text(r.content)
            a = s.find("Russian Federation |")
            tot = re.search(r"Total \| ([\d\.,]+) \|", s[a:])
            rec["russian_crude"] = re.match(r"Russian Federation \| ([\d\.,]+)", s[a:]).group(1) if a >= 0 else None
            rec["total_crude"] = tot.group(1) if tot else None
        elif r.content[:4] == b"%PDF":
            rec["note"] = (
                "PDF (Gelişim Raporu 2025): Rusya Federasyonu 15.229.330,93 t of 31.937.774,46 t crude (Tablo 2.1, read with pdftotext)"
            )
        out["years"][y] = rec
    report(write_json(od / f"epdk_crude_imports_{TODAY}.json", out))


def ecb() -> None:
    od = out_dir("ecb_laund")
    print("ECB EUR/AUD monthly")
    r = get(ECB, {"startPeriod": "2019-01", "format": "csvdata"})
    r.raise_for_status()
    rows = [(x["TIME_PERIOD"], float(x["OBS_VALUE"])) for x in csv.DictReader(io.StringIO(r.text))]
    report(write_json(od / f"ecb_eur_aud_monthly_{TODAY}.json", {"retrieved": TODAY, "url": r.url, "rows": rows}))


STEPS = {"eurostat": eurostat, "comext": comext, "comtrade": comtrade, "aps": aps, "eia": eia, "epdk": epdk, "ecb": ecb}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=",".join(STEPS))
    for name in ap.parse_args().only.split(","):
        STEPS[name.strip()]()


if __name__ == "__main__":
    main()
