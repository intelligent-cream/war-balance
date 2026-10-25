# /// script
# dependencies = ["requests>=2.31"]
# ///
"""Trade of the EAEU members (Kazakhstan, Kyrgyzstan, Armenia, Belarus) with Russia from the Eurasian Economic
Commission (EEC) and the national statistics offices (round 44; research/2026-10/gaps/eaeu_r44-notes.md).

Inside the EAEU there is no customs border, so these flows come from statistical forms (Kazakhstan 1-TS, Kyrgyzstan
1-VT and 1-V plus border surveys), not customs declarations. They are the same records the members send to UN
Comtrade and the IMF, so they are the source family "trade", not a second measurement.

What it fetches (all checked from the sandbox on 2026-10-25, none needs a key):
  EEC  eec.eaeunion.org/comission/department/dep_stat/tradestat/...  status pages (the latest period each one offers:
       mutual-trade tables end at January 2022, time series at 2021) and the 2015-2021 member-pair tables
       ("Internal Trade Geo structure", exports and imports, USD), which also carry Russia's own figures
  KGZ  stat.gov.kg: "Mutual trade of goods of the Kyrgyz Republic with EAEU states" (xlsx, one per year, table 1:
       turnover, exports, imports by member, thousand USD; the July editions are the revised "refined totals"), and
       the monthly express release "Export-import operations" (EAEU totals, first and revised vintages)
  KAZ  stat.gov.kz: "Main indicators of foreign trade of Kazakhstan by country" (xlsx, current period and the same
       period a year earlier, thousand USD)
  ARM  armstat.am foreign-trade database by country (HTML query: exports, imports by origin, imports by trading
       country, thousand USD, annual), and the Jan-<month> chapter 4.1.1 of the monthly socio-economic report (PDF;
       parsed with pdftotext when it is installed)
  BLR  dataportal.belstat.gov.by foreign-trade API: the list of years with partner detail (ends 2021)

Downloads are untrusted data: they go to research/2026-10/raw/eaeu_r44/src_<date>/ and are parsed here with the
standard library only (zip + XML for xlsx). Writes research/2026-10/raw/eaeu_r44/eaeu_r44_<date>.json.

Run: uv run pipeline/fetch/eaeu_r44.py
"""

from __future__ import annotations

import html
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path
from urllib.parse import urljoin

import requests
from _common import TODAY, get, out_dir, report, write_json

EEC = "https://eec.eaeunion.org"
EEC_STAT = EEC + "/comission/department/dep_stat"
EEC_PAGES = {
    "intra_tables": EEC_STAT + "/tradestat/tables/intra/",
    "time_series_mutual": EEC_STAT + "/tradestat/time_series/vzaimnaya-torgovlya-tovarami-dinamicheskie-ryady",
    "express_trade": EEC_STAT + "/union_stat/current_stat/tradestat/express/",
    "analytical_reviews": EEC_STAT + "/union_stat/current_stat/tradestat/analytical_reviews/",
    "bulletins": EEC_STAT + "/union_stat/current_stat/tradestat/statistical_compilations/",
    "mutual_trade_report": EEC_STAT + "/tradestat/analytics/tradereport.php",
}
EEC_GEO = {
    "imports": EEC + "/upload/files/dep_stat/tradestat/time-series/Internal%20Trade%20Geo%20structure_Import_(year%20data).xlsx",
    "exports": EEC + "/upload/files/dep_stat/tradestat/time-series/Internal%20Trade%20Geo%20structure_Export_(year%20data).xlsx",
}  # fmt: skip
KG = "https://stat.gov.kg"
KG_PUB = KG + "/ru/publications/vzaimnaya-torgovlya-tovarami-kyrgyzskoj-respubliki-s-gosudarstvami-chlenami-evrazijskogo-ekonomicheskogo-soyuza/"  # fmt: skip
KG_TRADE = KG + "/ru/statistics/vneshneekonomicheskaya-deyatelnost/"
KZ = "https://stat.gov.kz"
KZ_PAGE = KZ + "/ru/industries/economy/foreign-market/"
ARM = "https://www.armstat.am"
BELSTAT_YEARS = (
    "https://dataportal.belstat.gov.by/osids-public-api/foreignTradeStatistic/foreignTradeStatisticGetYearList"
)
MEMBERS = {"АРМЕНИЯ": "ARM", "БЕЛАРУСЬ": "BLR", "КАЗАХСТАН": "KAZ", "КЫРГЫЗСТАН": "KGZ", "РОССИЯ": "RUS"}
ERRORS = (requests.RequestException, ValueError, KeyError, IndexError, StopIteration, zipfile.BadZipFile, ET.ParseError)
NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
RID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"


def num(x) -> float | None:
    try:
        return float(str(x).replace("\xa0", "").replace(" ", "").replace(",", "."))
    except ValueError:
        return None


def xlsx_rows(path: Path) -> dict[str, list[list[str]]]:
    """Every sheet of an xlsx file as rows of cell strings (standard library only)."""
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(NS + "si"):
            shared.append("".join(t.text or "" for t in si.iter(NS + "t")))
    rels = {r.get("Id"): r.get("Target") for r in ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))}
    out = {}
    for sh in ET.fromstring(z.read("xl/workbook.xml")).iter(NS + "sheet"):
        target = rels[sh.get(RID)].lstrip("/")
        target = target if target.startswith("xl/") else "xl/" + target
        rows = []
        for r in ET.fromstring(z.read(target)).iter(NS + "row"):
            cells = {}
            for c in r.iter(NS + "c"):
                col = 0
                for ch in re.match(r"[A-Z]+", c.get("r")).group(0):
                    col = col * 26 + ord(ch) - 64
                v = c.find(NS + "v")
                if c.get("t") == "inlineStr":
                    cells[col - 1] = "".join(t.text or "" for t in c.iter(NS + "t"))
                elif v is not None:
                    cells[col - 1] = shared[int(v.text)] if c.get("t") == "s" else v.text
            if cells:
                rows.append([cells.get(i, "") for i in range(max(cells) + 1)])
        out[sh.get("name")] = rows
    return out


def links(page: str, base: str) -> list[tuple[str, str]]:
    """(absolute url, link text) for every anchor of an HTML page; base is the page's own URL."""
    res = []
    for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', page, re.DOTALL):
        text = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", m.group(2))).split())
        url = html.unescape(m.group(1))
        res.append((urljoin(base, url), text))
    return res


def fetch(url: str, dest: Path, **kw) -> Path:
    r = get(url, timeout=180, **kw)
    r.raise_for_status()
    dest.write_bytes(r.content)
    return dest


def eec(src: Path) -> dict:
    status = {}
    for key, url in EEC_PAGES.items():
        try:
            page = get(url, timeout=120).text
        except ERRORS as e:  # the EEC server resets some connections; record and go on
            status[key] = {"url": url, "error": str(e)[:200]}
            continue
        periods = sorted(set(re.findall(r"20[12]\d", " ".join(t for _, t in links(page, url)))))
        status[key] = {"url": url, "latest_year_linked": periods[-1] if periods else None,
                       "january_2022": "Январь 2022" in page or "январь 2022" in page.lower()}  # fmt: skip
    pairs: dict = {}
    for flow, url in EEC_GEO.items():
        rows = xlsx_rows(fetch(url, src / f"eec_geo_{flow}.xlsx"))["Лист1"]
        years = [int(float(y)) for y in rows[2][1:] if y]
        member_rows = [r for r in rows[3:] if (r[0] or "").strip().upper() in MEMBERS]
        # blocks of five rows: the reporting member's total, then its four partners
        for i in range(0, len(member_rows) - 4, 5):
            reporter = MEMBERS[member_rows[i][0].strip().upper()]
            for r in member_rows[i + 1 : i + 5]:
                vals = [num(v) for v in r[1 : len(years) + 1]]
                pairs.setdefault(flow, {}).setdefault(reporter, {})[MEMBERS[r[0].strip().upper()]] = dict(
                    zip(years, vals)
                )
    return {"status": status, "pairs_usd": pairs}


def kgz(src: Path) -> dict:
    page = get(KG_PUB, timeout=120).text
    out: dict = {"publications": {}, "express": {}}
    for url, text in links(page, KG_PUB):
        if not url.endswith(".xlsx") or "/" not in text:
            continue
        name = re.sub(r"[^\w.-]+", "_", text.split("/")[0].strip())
        rows = xlsx_rows(fetch(url, src / f"kgz_eaeu_{name}.xlsx"))
        t1 = next(v for k, v in rows.items() if k.startswith("таб.1"))
        hdr = next(r for r in t1 if len(r) > 2 and r[1] and str(r[1]).strip() not in ("",) and "ВСЕГО" not in r[0])
        rus = next(r for r in t1 if (r[0] or "").strip() == "Россия")
        tot = next(r for r in t1 if (r[0] or "").strip() == "ВСЕГО")
        out["publications"][text] = {
            "url": url,
            "columns": [str(c).strip() for c in hdr],
            "russia_thousand_usd": {"turnover": [num(rus[1]), num(rus[2])], "exports": [num(rus[5]), num(rus[6])],
                                    "imports": [num(rus[9]), num(rus[10])]},
            "eaeu_total_thousand_usd": {"exports": [num(tot[5]), num(tot[6])], "imports": [num(tot[9]), num(tot[10])]},
            "note": "pairs are [reporting period, same period a year earlier]",
        }  # fmt: skip
    trade = get(KG_TRADE, timeout=120).text
    for url, text in links(trade, KG_TRADE):
        if "/download/operational/" not in url or not re.search(r"январ\w*\s*-?\s*(декабр|август)", text):
            continue
        rows = xlsx_rows(fetch(url, src / f"kgz_op_{url.rstrip('/').split('/')[-1]}.xlsx"))["Вар-т на русс."]
        block = None
        for r in rows:
            head = (r[0] or "").strip()
            if re.match(r"^20\d\d", head):
                block = head[:4]
            elif head.startswith("Январь-") and block and len(r) > 9 and num(r[9]) is not None:
                # the first "January-..." row of a block holds the values; a later one holds growth rates
                out["express"].setdefault(text, {}).setdefault(block, {"eaeu_exports_musd": num(r[6]),
                                                                       "eaeu_imports_musd": num(r[9])})  # fmt: skip
    return out


def kaz(src: Path) -> dict:
    page = get(KZ_PAGE, timeout=120).text
    out = {}
    for url, text in links(page, KZ_PAGE):
        if "/api/iblock/element/" in url and "внешней торговли Республики Казахстан по странам" in text:
            rows = xlsx_rows(fetch(url, src / "kaz_by_country.xlsx"))
            for sheet, rs in rows.items():
                rus = next((r for r in rs if (r[0] or "").strip() == "Россия"), None)
                period = " ".join(str(c) for c in (rs[1] if len(rs) > 1 else []) if c).strip()
                if rus:
                    out[sheet] = {"title": text, "url": url, "period": period,
                                  "russia_thousand_usd": {"turnover": num(rus[1]), "exports": num(rus[3]),
                                                          "imports": num(rus[5])}}  # fmt: skip
    return out


def arm(src: Path) -> dict:
    years = range(2019, int(TODAY[:4]))
    q = "&".join(
        ["nid=159", "thid%5B%5D=643"] + [f"years%5B%5D={y}" for y in years] + ["submit=%D0%9F%D0%BE%D0%B8%D1%81%D0%BA"]
    )
    page = fetch(f"{ARM}/ru/?{q}", src / "armstat_russia_annual.html").read_text("utf-8", "replace")
    out: dict = {"annual_thousand_usd": {}}
    for row in re.findall(r"<tr.*?</tr>", page, re.DOTALL):
        cells = [" ".join(html.unescape(re.sub(r"<[^>]+>", "", c)).split()) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.DOTALL)]  # fmt: skip
        cells = [c for c in cells if c]
        if len(cells) == 6 and cells[0] == "Россия" and cells[2] == "Год":
            out["annual_thousand_usd"][cells[1]] = {"exports": num(cells[3]), "imports_origin": num(cells[4]),
                                                    "imports_trading_country": num(cells[5])}  # fmt: skip
    idx = get(f"{ARM}/ru/?nid=82", timeout=120).text
    latest = next(
        ((u, t) for u, t in links(idx, ARM + "/ru/") if t.startswith("Социально-экономическое положение")), None
    )
    if latest and shutil.which("pdftotext"):
        rep = get(latest[0], timeout=120).text
        pdf = next((u for u, _ in links(rep, latest[0]) if re.search(r"_r_411\.pdf$|r_411\.pdf$", u)), None)
        if pdf:
            p = fetch(pdf, src / "armstat_ch411.pdf")
            txt = subprocess.run(
                ["pdftotext", "-layout", str(p), "-"], check=False, capture_output=True, text=True
            ).stdout
            m = re.search(r"Российская Федерация\s*\n?\s*([\d ]+\.\d)\s+([\d ]+\.\d)\s+[\d.]+\s+([\d ]+\.\d)\s+([\d ]+\.\d)"
                          r"\s+[\d.]+\s+([\d ]+\.\d)\s+([\d ]+\.\d)", txt)  # fmt: skip
            if m:
                v = [num(x) for x in m.groups()]
                out["latest_months"] = {"report": latest[1], "pdf": pdf, "unit": "thousand USD, [previous year, this year]",
                                        "exports": v[0:2], "imports_dispatch": v[2:4], "imports_origin": v[4:6]}  # fmt: skip
    return out


def blr() -> dict:
    try:
        return {"partner_detail_years": get(BELSTAT_YEARS, timeout=60).json().get("years")}
    except ERRORS as e:
        return {"error": str(e)[:200]}


def main() -> None:
    od = out_dir("eaeu_r44")
    src = od / f"src_{TODAY}"
    src.mkdir(exist_ok=True)
    out = {"retrieved": TODAY, "unit_note": "values in USD (EEC) or thousand USD (national offices) as published"}
    for key, fn in (("eec", lambda: eec(src)), ("KGZ", lambda: kgz(src)), ("KAZ", lambda: kaz(src)),
                    ("ARM", lambda: arm(src)), ("BLR", blr)):  # fmt: skip
        try:
            out[key] = fn()
        except ERRORS as e:  # one unreachable office does not stop the others
            out[key] = {"error": f"{type(e).__name__}: {str(e)[:200]}"}
        print(f"  {key}: {'error ' + out[key]['error'] if 'error' in out[key] else 'ok'}")
    report(write_json(od / f"eaeu_r44_{TODAY}.json", out))


if __name__ == "__main__":
    main()
