# /// script
# dependencies = ["requests>=2.31"]
# ///
"""Japan's imports from Russia by HS code, from the Ministry of Finance trade statistics (Trade Statistics of Japan,
customs; published as CSV files on e-Stat, statistics code 00350300, "Commodity by Country (Import)"), plus the
UN Comtrade public preview of the same flow as a cross-check. Round 44 (research/2026-10/gaps/japan_lng_r44.json).

Writes to research/2026-10/raw/japan_r44/ (retrieval date in each name):
  mof_imports_from_russia_<date>.json.gz   for each year 2014-2026: per 9-digit HS code, Japan's imports from Russia
      (country code 224): quantity 1 and 2 with units, value in thousand yen, for the year (2026: the months published so
      far) and by month; the e-Stat file id, size and SHA-256 of each section file read; totals by HS chapter
  comtrade_jpn_from_rus_<date>.json     UN Comtrade public preview, reporter Japan (392), partner Russia (643), imports,
      HS TOTAL, 2701, 2709, 2710, 271111 and a few non-fuel codes, 2014-2025, value in USD and net weight in kg

The 21 section files per year (about 0.1-3 MB each, all countries) are read in memory and not stored: only the Russia
rows are kept. Downloads are untrusted data: the CSVs are parsed with the csv module as text, numbers are parsed from
text, and nothing else in the files is used.
Run: uv run pipeline/fetch/japan_r44.py [--from 2014] [--to 2026] [--skip-comtrade]
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import io
import re
import time

from _common import TODAY, get, out_dir, report, write_json

ESTAT = "https://www.e-stat.go.jp"
# Commodity by Country, Import (toukei 00350300, tstat 000001013141, tclass1 000001013180, tclass2 000001013182)
LIST = (
    ESTAT + "/en/stat-search/files?page=1&layout=datalist&data=1&metadata=1&cycle=1&toukei=00350300"
    "&tstat=000001013141&tclass1=000001013180&tclass2=000001013182&cycle_facet=cycle&tclass3val=0"
    "&year={y}0&month={m}&result_back=1"
)
RUSSIA = "224"  # Japan's customs country code for Russia
CT = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
CT_CODES = "TOTAL,2701,2709,2710,271111,0303,0306,7601,7110"
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def num(s: str) -> float:
    s = (s or "").strip().replace(",", "")
    return float(s) if re.fullmatch(r"-?\d+(\.\d+)?", s) else 0.0


def year_files(y: int) -> tuple[list[tuple[str, str]], str]:
    """(statInfId, title) of the section files for year y: the full year (month code 24101212), or for the current
    year the latest month published (month codes tried from December back)."""
    for m in ["24101212"] + [f"230709{k:02d}" for k in range(12, 0, -1)]:
        r = get(LIST.format(y=y, m=m), timeout=90)
        if r.status_code != 200:
            continue
        html = r.text
        ids = re.findall(r"file-download\?statInfId=(\d{12})&(?:amp;)?fileKind=1", html)
        titles = re.findall(
            r"((?:\d{4}(?:/\d{2})?\. )?Commodity by Country \(Import[^)]*\) Section [IVX]+ Chapter [\d-]+)", html
        )
        if ids and titles and (str(y) in titles[0] or f"Monthly {y}" in html):
            return list(zip(dict.fromkeys(ids), titles)), m
    return [], ""


def fetch_mof(y0: int, y1: int) -> dict:
    out = {}
    for y in range(y0, y1 + 1):
        files, mcode = year_files(y)
        rows, meta = {}, []
        for fid, title in files:
            r = get(f"{ESTAT}/en/stat-search/file-download", params={"statInfId": fid, "fileKind": 1}, timeout=180)
            if r.status_code != 200:
                meta.append({"id": fid, "title": title, "status": r.status_code})
                continue
            raw = r.content
            meta.append({"id": fid, "title": title, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()})
            text = raw.decode("utf-8", errors="replace")
            for rec in csv.DictReader(io.StringIO(text)):
                if (rec.get("Country") or "").strip() != RUSSIA:
                    continue
                hs = (rec.get("HS") or "").strip().strip("'")
                rows[hs] = {
                    "unit1": (rec.get("Unit1") or "").strip(),
                    "unit2": (rec.get("Unit2") or "").strip(),
                    "q1": num(rec.get("Quantity1-Year")),
                    "q2": num(rec.get("Quantity2-Year")),
                    "value_kjpy": num(rec.get("Value-Year")),
                    "monthly_q2": [num(rec.get(f"Quantity2-{m}")) for m in MONTHS],
                    "monthly_value_kjpy": [num(rec.get(f"Value-{m}")) for m in MONTHS],
                }
            time.sleep(0.5)
        chap = {}
        for hs, d in rows.items():
            chap[hs[:2]] = chap.get(hs[:2], 0.0) + d["value_kjpy"]
        out[str(y)] = {"month_code": mcode, "files": meta, "by_chapter_value_kjpy": chap, "rows": rows}
        print(y, len(files), "files", len(rows), "Russia rows", round(sum(chap.values()) / 1e6, 1), "bn JPY")
    return out


def fetch_comtrade(y0: int, y1: int) -> dict:
    out = {}
    for y in range(y0, min(y1, 2025) + 1):
        r = get(CT, params={"reporterCode": 392, "partnerCode": 643, "period": y, "cmdCode": CT_CODES, "flowCode": "M"})
        data = (r.json().get("data") or []) if r.status_code == 200 else []
        out[str(y)] = {
            d["cmdCode"]: {"usd": d.get("primaryValue"), "net_kg": d.get("netWgt")} for d in data if d.get("cmdCode")
        }
        time.sleep(2)
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="y0", type=int, default=2014)
    ap.add_argument("--to", dest="y1", type=int, default=2026)
    ap.add_argument("--skip-comtrade", action="store_true")
    a = ap.parse_args()
    d = out_dir("japan_r44")
    mof = {
        "source": "Ministry of Finance, Trade Statistics of Japan, Commodity by Country (Import), via e-Stat files",
        "url": ESTAT + "/en/stat-search/files?toukei=00350300&tstat=000001013141&tclass1=000001013180",
        "country_code": RUSSIA,
        "units": "value in thousand JPY; LNG (2711.11) quantity 2 in tonnes (MT)",
        "retrieved": TODAY,
        "years": fetch_mof(a.y0, a.y1),
    }
    p = write_json(d / f"mof_imports_from_russia_{TODAY}.json.gz", mof)
    report(p, "MoF imports from Russia by HS9")
    if not a.skip_comtrade:
        ct = {
            "source": "UN Comtrade public preview",
            "url": CT,
            "retrieved": TODAY,
            "years": fetch_comtrade(a.y0, a.y1),
        }
        p = write_json(d / f"comtrade_jpn_from_rus_{TODAY}.json", ct)
        report(p, "Comtrade cross-check")


if __name__ == "__main__":
    main()
