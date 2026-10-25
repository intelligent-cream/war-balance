# /// script
# dependencies = ["requests>=2.31", "openpyxl>=3.1"]
# ///
"""EPDK (Türkiye's energy regulator, epdk.gov.tr) market reports and the ENTSOG Transparency Platform API (no key):
the second official measurements of Türkiye's Russian gas and crude and of the gas flows on TurkStream's European leg.

Writes to research/2026-10/raw/epdk/ (retrieval date in each name):
  epdk_gas_imports_<date>.json      natural gas imports by source country, million Sm3: annual 2005-2014 (2014 report,
      Table 2.1) and 2014-2024 (2024 report, Table 2.2), spot pipeline gas by country 2020-2024 (Table 2.9), and
      monthly imports by contract type (spot / long-term) and country for 2025 (2025 report annex, Table 4) and
      January-August 2026 (August 2026 monthly report annex, Table 4), in Sm3
  epdk_oil_imports_<date>.json      crude and product imports by country of origin, tonnes: 2018-2024 (annual
      reports, Table 2.1.1), 2025 (December 2025 monthly report, Table 2.1.2, January-December) and January-August 2026
      (August 2026 monthly report annex, Table 2)
  epdk_*_annex_<date>.xlsx          the three annex workbooks as downloaded (git-ignored, listed in MANIFEST.json)
The .docx reports (2-3 MB each) are not stored: only the extracted tables, with each document's address, size and
SHA-256, so that a re-download can be checked.

Writes to research/2026-10/raw/entsog/:
  entsog_physical_flow_monthly_<date>.json   daily "Physical Flow" (kWh/d, gas day 06:00-06:00) per point and
      direction from 2021-11-01 (the platform keeps a rolling five years; older dates answer "archived"), summed to
      calendar months in kWh, with the number of days reported and the flow-status counts

Also writes research/2026-10/raw/epdk/tur_context_<date>.json, the inputs of Türkiye's own no-war band besides EPDK
(gaps/turkey_gas_r43.json): Eurostat nrg_ti_gas / nrg_ti_oil / nrg_ti_sff, geo TR, partner RU (and TOTAL for gas),
2004 onward (Türkiye reports EPDK's figures to Eurostat, so gas and crude repeat EPDK; products and coal add to it);
UN Comtrade public preview, Türkiye's imports from Russia, TOTAL and HS 27, 2004-2021 (one call per year); FRED
IREXFUELS, US import price index excluding fuels, annual average (the non-fuel deflator).

Downloads are untrusted data: tables are read with zipfile + ElementTree (no macros, no external links) and openpyxl
in read-only, values-only mode; numbers are parsed from text and nothing else in the files is used.
Run: uv run pipeline/fetch/epdk_entsog.py [--to YYYY-MM-DD] [--skip-epdk] [--skip-entsog] [--skip-context]
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import io
import re
import urllib.parse
import zipfile
from collections import Counter, defaultdict
from xml.etree import ElementTree as ET

from _common import TODAY, get, jsonstat_rows, out_dir, report, write_bytes, write_json

EPDK = "https://www.epdk.gov.tr/Detay/DownloadDocument?id={id}"
ENTSOG = "https://transparency.entsog.eu/api/v1/operationalData"
EUROSTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{ds}"
COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
FRED = "https://fred.stlouisfed.org/graph/fredgraph.csv"
W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

# document ids from the report pages (gas: Detay/Icerik/3-0-94 annual, 3-0-95 monthly; oil: 3-0-107 annual, 3-0-104
# monthly), checked 2026-10-24
GAS_DOCX = {
    "2014": ("CmXljvG5hzY=", "2014 Doğal Gaz Piyasası Sektör Raporu", r"2005-2014 Yılları Doğal Gaz İthalat"),
    "2024": ("di3gdUtTWpM=", "2024 Yılı Doğal Gaz Piyasası Sektör Raporu", r"2014-2024 Yılları Doğal Gaz İthalat"),
    "2024_spot": ("di3gdUtTWpM=", "2024 Yılı Doğal Gaz Piyasası Sektör Raporu", r"Spot Boru Gazı Miktarları"),
}
GAS_XLSX = {
    "2025": ("kcdXT4G+vpI=", "2025 Yılı Doğal Gaz Piyasası Gelişim Raporu Ek"),
    "2026-08": ("lpbr67UztMQ=", "Doğal Gaz Piyasası Sektör Raporu Ağustos 2026 - Ek"),
}
OIL_DOCX = {
    "2018": ("8tLXe37G+YA=", "2018 Yılı Petrol Piyasası Sektör Raporu"),
    "2019": ("mBWzKsBr9Ds=", "2019 Yılı Petrol Piyasası Sektör Raporu"),
    "2020": ("tRaLJlNFifw=", "2020 Yılı Petrol Piyasası Sektör Raporu"),
    "2021": ("ILaKljYWr0Y=", "2021 Yılı Petrol Piyasası Sektör Raporu"),
    "2022": ("VB8jdtt417k=", "Petrol Piyasası Sektör Raporu_2022 Yılı"),
    "2023": ("wlX8O/UK6tg=", "2023 Yılı Petrol Piyasası Sektör Raporu"),
    "2024": ("GdR+2ReXbWA=", "2024 Yılı Petrol Piyasası Sektör Raporu"),
    "2025": ("z4dR8e3MWFA=", "2025 Yılı Petrol Piyasası Aralık Ayı Sektör Raporu (Ocak-Aralık table)"),
}
OIL_XLSX = {"2026-08": ("OUYHnZGsHBg=", "Petrol Piyasası Sektör Raporu Ağustos 2026 - Ek")}

# ENTSOG point-directions: (name, [candidate keys, first with data wins], what it measures)
POINTS = [
    ("strandzha2_tr_bg", ["bg-tso-0001itp-00549entry"], "TurkStream European leg into Bulgaria (TR>BG)"),
    ("strandzha1_tr_bg", ["bg-tso-0001itp-00041entry"], "Strandzha 1, Türkiye to Bulgaria (BOTAŞ deliveries)"),
    ("strandzha1_bg_tr", ["bg-tso-0001itp-00041exit"], "Strandzha 1, Bulgaria to Türkiye (old Trans-Balkan)"),
    ("kireevo_bg_rs", ["bg-tso-0001itp-00529exit"], "Bulgaria to Serbia (Balkan Stream / Gastrans)"),
    ("kalotina_bg_rs", ["bg-tso-0001itp-00134exit"], "Bulgaria to Serbia, old Kalotina point"),
    ("kulata_bg_gr", ["gr-tso-0001itp-00128entry", "bg-tso-0001itp-00128exit"], "Bulgaria to Greece (Sidirokastro)"),
    ("kulata_gr_bg", ["gr-tso-0001itp-00128exit", "bg-tso-0001itp-00128entry"], "Greece to Bulgaria (reverse)"),
    ("kyustendil_bg_mk", ["bg-tso-0001itp-00036exit"], "Bulgaria to North Macedonia"),
    ("negruvoda1_bg_ro", ["bg-tso-0001itp-00058exit"], "Bulgaria to Romania, Negru Voda I (Trans-Balkan)"),
    ("negruvoda1_ro_bg", ["bg-tso-0001itp-00058entry"], "Romania to Bulgaria, Negru Voda I"),
    ("negruvoda23_bg_ro", ["bg-tso-0001itp-00059exit"], "Bulgaria to Romania, Negru Voda II/III (transit)"),
    ("negruvoda23_ro_bg", ["bg-tso-0001itp-00059entry"], "Romania to Bulgaria, Negru Voda II/III"),
    ("ruse_bg_ro", ["bg-tso-0001itp-00153exit"], "Bulgaria to Romania, Ruse/Giurgiu"),
    ("ruse_ro_bg", ["bg-tso-0001itp-00153entry"], "Romania to Bulgaria, Ruse/Giurgiu"),
    ("komotini_tap_igb", ["bg-tso-0003itp-00275entry"], "TAP (Azeri gas) into IGB, Greece to Bulgaria"),
    ("komotini_desfa_igb", ["gr-tso-0001itp-00450exit"], "DESFA into IGB, Greece to Bulgaria"),
    ("komotini_igb_tap", ["bg-tso-0003itp-00275exit"], "IGB into TAP, Bulgaria to Greece (reverse)"),
    ("stara_zagora_igb_bg", ["bg-tso-0001itp-00276entry"], "IGB into the Bulgartransgaz grid (Stara Zagora)"),
    ("stara_zagora_bg_igb", ["bg-tso-0001itp-00276exit"], "Bulgartransgaz grid into IGB (Stara Zagora)"),
    ("chiren_withdrawal", ["bg-tso-0001ugs-00019entry"], "Bulgaria's Chiren storage, withdrawal into the grid"),
    ("chiren_injection", ["bg-tso-0001ugs-00019exit"], "Bulgaria's Chiren storage, injection from the grid"),
    ("horgos_rs_hu", ["hu-tso-0001itp-10013entry"], "Serbia to Hungary (TurkStream gas onward)"),
    ("horgos_hu_rs", ["hu-tso-0001itp-10013exit"], "Hungary to Serbia, Horgoš (reverse)"),
    ("kiskundorozsma_hu_rs", ["hu-tso-0001itp-00055exit"], "Hungary to Serbia, old Kiskundorozsma point"),
    ("bereg_ua_hu", ["hu-tso-0001itp-10006entry"], "Ukraine to Hungary (Russian transit until 2024)"),
    ("bereg_hu_ua", ["hu-tso-0001itp-10006exit"], "Hungary to Ukraine"),
    ("balassagyarmat_sk_hu", ["hu-tso-0001itp-00027entry"], "Slovakia to Hungary"),
    ("balassagyarmat_hu_sk", ["hu-tso-0001itp-00027exit"], "Hungary to Slovakia"),
    ("mosonmagyarovar_at_hu", ["hu-tso-0001itp-00043entry"], "Austria to Hungary"),
    ("mosonmagyarovar_hu_at", ["hu-tso-0001itp-00043exit"], "Hungary to Austria"),
    ("csanadpalota_ro_hu", ["hu-tso-0001itp-00032entry"], "Romania to Hungary"),
    ("csanadpalota_hu_ro", ["hu-tso-0001itp-00032exit"], "Hungary to Romania"),
    ("dravaszerdahely_hr_hu", ["hu-tso-0001itp-00011entry"], "Croatia to Hungary"),
    ("dravaszerdahely_hu_hr", ["hu-tso-0001itp-00011exit"], "Hungary to Croatia"),
    ("baumgarten_sk_at", ["sk-tso-0001itp-00168exit", "at-tso-0001itp-00168entry"], "Slovakia to Austria"),
    ("oberkappel_at_de", ["at-tso-0001itp-00140exit", "de-tso-0004itp-00140entry"], "Austria to Germany"),
    ("oberkappel_de_at", ["at-tso-0001itp-00140entry", "de-tso-0004itp-00140exit"], "Germany to Austria"),
    ("ueberackern_at_de", ["de-tso-0009itp-00019entry", "at-tso-0001itp-00019exit"], "Austria to Germany, ABG"),
    ("ueberackern_de_at", ["de-tso-0009itp-00019exit", "at-tso-0001itp-00019entry"], "Germany to Austria, ABG"),
    ("ueberackern2_at_de", ["de-tso-0010itp-00007entry", "at-tso-0001itp-00007exit"], "Austria to Germany, SUDAL"),
    ("ueberackern2_de_at", ["de-tso-0010itp-00007exit", "at-tso-0001itp-00007entry"], "Germany to Austria, SUDAL"),
    ("arnoldstein_at_it", ["it-tso-0001itp-00040entry", "at-tso-0003itp-00040exit"], "Austria to Italy (Tarvisio)"),
    ("arnoldstein_it_at", ["it-tso-0001itp-00040exit", "at-tso-0003itp-00040entry"], "Italy to Austria"),
    ("murfeld_at_si", ["si-tso-0001itp-00079entry", "at-tso-0001itp-00079exit"], "Austria to Slovenia"),
    ("murfeld_si_at", ["si-tso-0001itp-00079exit", "at-tso-0001itp-00079entry"], "Slovenia to Austria"),
]


def num(s: str) -> float | None:
    """Turkish number text ('16.944.443,28', '26.975', '41,32') to float; None when empty or not a number."""
    s = (s or "").strip().replace("\xa0", "").replace(" ", "")
    if not s or s in ("-", "–"):
        return None
    s = s.replace(".", "").replace(",", ".") if "," in s else s.replace(".", "")
    try:
        return float(s)
    except ValueError:
        return None


def epdk_get(doc_id: str) -> tuple[bytes, dict]:
    url = EPDK.format(id=urllib.parse.quote(doc_id, safe=""))
    r = get(url, timeout=300)
    r.raise_for_status()
    return r.content, {"url": url, "bytes": len(r.content), "sha256": hashlib.sha256(r.content).hexdigest()}


def docx_tables(data: bytes) -> list[dict]:
    """Every table of a .docx with the last three non-empty paragraphs before it (the caption), as text cells."""
    with zipfile.ZipFile(io.BytesIO(data)) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    body = root.find(W + "body")

    def text(el: ET.Element) -> str:
        return "".join(t.text or "" for t in el.iter(W + "t")).strip()

    out, caption = [], []
    for el in body if body is not None else []:
        if el.tag == W + "p":
            t = text(el)
            if t:
                caption = (caption + [t])[-3:]
        elif el.tag == W + "tbl":
            rows = [[text(tc) for tc in tr.findall(W + "tc")] for tr in el.iter(W + "tr")]
            out.append({"caption": " / ".join(caption), "rows": rows})
    return out


def first_table(tables: list[dict], pattern: str) -> dict:
    pat = re.compile(pattern, re.IGNORECASE)
    for t in tables:
        if pat.search(t["caption"].split(" / ")[-1]):
            return t
    raise RuntimeError(f"no table matching {pattern!r}")


def xlsx_rows(data: bytes, sheet_pattern: str) -> list[list]:
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    for ws in wb.worksheets:
        if re.search(sheet_pattern, ws.title):
            return [list(r) for r in ws.iter_rows(values_only=True)]
    raise RuntimeError(f"no sheet matching {sheet_pattern!r}")


def gas_by_type_country(rows: list[list]) -> dict:
    """EPDK annex 'Tablo-4': monthly Sm3 by contract type (Spot / Uzun Dönemli) and country."""
    out: dict = {}
    months: list[str] = []
    kind = None
    in_t4 = False
    for r in rows:
        cells = [c for c in r if c is not None]
        if not cells:
            continue
        first = str(cells[0]).strip()
        if first.startswith("Tablo-4"):
            in_t4 = True
            continue
        if not in_t4:
            continue
        if first == "Ocak":
            months = [str(c).strip() for c in cells]
            continue
        if first in ("Spot", "Uzun Dönemli İthalat Lisansı"):
            kind = "spot" if first == "Spot" else "long_term"
            continue
        if first == "Genel Toplam":
            vals = r[1 : 1 + len(months)]
            out["total"] = {"months": {m: float(v or 0) for m, v in zip(months, vals)}, "year": float(cells[-1])}
            break
        if kind:
            vals = r[1 : 1 + len(months)]
            out.setdefault(kind, {})[first] = {
                "months": {m: (float(v) if v is not None else 0.0) for m, v in zip(months, vals)},
                "total": float(cells[-1]),
            }
    return out


def oil_country_table(rows: list[list[str]]) -> dict:
    """Imports by country table (Tablo 2.1.1 / 2.1.2): {country: {product: tonnes}}."""
    header = [c.strip() for c in rows[0]]
    out = {}
    for r in rows[1:]:
        if not r or not r[0].strip():
            continue
        out[r[0].strip()] = {h: num(v) for h, v in zip(header[1:], r[1:])}
    return {"columns": header[1:], "by_country": out}


def fetch_epdk() -> None:
    od = out_dir("epdk")
    gas: dict = {"source": "EPDK Doğal Gaz Piyasası Sektör / Gelişim Raporu", "retrieved": TODAY,
                 "unit_annual": "million Sm3", "unit_monthly": "Sm3", "documents": {}, "tables": {}}  # fmt: skip
    cache: dict[str, tuple[bytes, dict]] = {}
    for key, (doc, title, pattern) in GAS_DOCX.items():
        if doc not in cache:
            cache[doc] = epdk_get(doc)
        data, info = cache[doc]
        gas["documents"][key] = {"title": title, **info}
        t = first_table(docx_tables(data), pattern)
        gas["tables"][key] = t
    for key, (doc, title) in GAS_XLSX.items():
        data, info = epdk_get(doc)
        p = write_bytes(od / f"epdk_gas_{key}_annex_{TODAY}.xlsx", data)
        gas["documents"][f"{key}_annex"] = {"title": title, "file": p.name, **info}
        gas["tables"][f"{key}_monthly_by_type_country"] = gas_by_type_country(xlsx_rows(data, r"Tablo 3-4"))
    p = write_json(od / f"epdk_gas_imports_{TODAY}.json", gas)
    ru = [r for r in gas["tables"]["2024"]["rows"] if r and r[0].strip() == "Rusya"]
    report(p, "Russia 2014-2024 (million Sm3): " + (", ".join(ru[0][1:12]) if ru else "row not found"))

    oil: dict = {"source": "EPDK Petrol Piyasası Sektör Raporu", "retrieved": TODAY, "unit": "tonnes",
                 "documents": {}, "imports_by_country": {}}  # fmt: skip
    for year, (doc, title) in OIL_DOCX.items():
        data, info = epdk_get(doc)
        oil["documents"][year] = {"title": title, **info}
        tables = docx_tables(data)
        pattern = r"Ocak-Aralık \d{4} Dönemi Ülkelere Göre İthalat" if year == "2025" else r"Ülkelere Göre İthalat"
        t = first_table(tables, pattern)
        oil["imports_by_country"][year] = {"caption": t["caption"], **oil_country_table(t["rows"])}
    for key, (doc, title) in OIL_XLSX.items():
        data, info = epdk_get(doc)
        p = write_bytes(od / f"epdk_oil_{key}_annex_{TODAY}.xlsx", data)
        oil["documents"][key] = {"title": title, "file": p.name, **info}
        rows = xlsx_rows(data, r"Tablo 2")
        i0 = next(i for i, r in enumerate(rows) if r and str(r[0] or "").startswith("Tablo 2"))
        ih = next(i for i in range(i0 + 1, len(rows)) if rows[i] and str(rows[i][0] or "").strip() == "Ülke")
        header = [str(c).strip() for c in rows[ih] if c is not None]
        by = {}
        for r in rows[ih + 1 :]:
            if not r or r[0] is None:
                break
            name = str(r[0]).strip()
            by[name] = {h: (float(v) if isinstance(v, (int, float)) else num(str(v or ""))) for h, v in zip(header[1:], r[1:])}  # fmt: skip
            if name == "Toplam":
                break
        oil["imports_by_country"][f"{key[:4]}_jan_{key[5:]}"] = {"caption": str(rows[i0][0]), "columns": header[1:],
                                                                 "by_country": by}  # fmt: skip
    p = write_json(od / f"epdk_oil_imports_{TODAY}.json", oil)
    summary = []
    for y, t in oil["imports_by_country"].items():
        ru = (t["by_country"].get("Rusya Federasyonu") or {}).get("Ham Petrol") or 0
        tot = (t["by_country"].get("Toplam") or {}).get("Ham Petrol") or 0
        summary.append(f"{y} {ru / 1e6:.2f}/{tot / 1e6:.2f} Mt")
    report(p, "Russian/total crude: " + "; ".join(summary))


def fetch_entsog(to: str) -> None:
    od = out_dir("entsog")
    start = "2021-11-01"
    res: dict = {"source": "ENTSOG Transparency Platform, operationalData, indicator Physical Flow, periodType day",
                 "url": ENTSOG, "retrieved": TODAY, "from": start, "to": to,
                 "unit": "kWh (sum of daily kWh/d over the gas days starting in the month)",
                 "note": "gas day 06:00-06:00 CET; months are assigned by the gas day's start date",
                 "points": {}}  # fmt: skip
    for name, keys, what in POINTS:
        entry = {"what": what, "tried": keys, "key": None, "monthly_kwh": {}, "days": {}, "flow_status": {}}
        for key in keys:
            params = {"indicator": "Physical Flow", "periodType": "day", "pointDirection": key, "from": start,
                      "to": to, "limit": -1, "timezone": "CET"}  # fmt: skip
            r = get(ENTSOG, params, ok=(200, 404), timeout=300)
            if r.status_code != 200:
                continue
            ops = [o for o in r.json().get("operationalData", []) if o.get("unit") == "kWh/d"]
            if not ops:
                continue
            mk: dict[str, float] = defaultdict(float)
            days: dict[str, set] = defaultdict(set)
            st: Counter = Counter()
            for o in ops:
                day = o["periodFrom"][:10]
                mk[day[:7]] += float(o.get("value") or 0)
                days[day[:7]].add(day)
                st[o.get("flowStatus") or "none"] += 1
            entry.update(key=key, operator=ops[0].get("operatorLabel"), point=ops[0].get("pointLabel"),
                         monthly_kwh={m: round(v) for m, v in sorted(mk.items())},
                         days={m: len(v) for m, v in sorted(days.items())}, flow_status=dict(st))  # fmt: skip
            break
        res["points"][name] = entry
    p = write_json(od / f"entsog_physical_flow_monthly_{TODAY}.json", res)
    lines = []
    for name in ("strandzha2_tr_bg", "kireevo_bg_rs", "horgos_rs_hu", "kulata_bg_gr", "baumgarten_sk_at"):
        mk = res["points"][name]["monthly_kwh"]
        yr = {y: sum(v for m, v in mk.items() if m.startswith(y)) / 1e9 for y in ("2022", "2023", "2024", "2025")}
        lines.append(f"{name} " + "/".join(f"{v:.0f}" for v in yr.values()))
    missing = [n for n, e in res["points"].items() if not e["key"]]
    report(p, "TWh 2022/23/24/25: " + "; ".join(lines) + (f"; no data: {', '.join(missing)}" if missing else ""))


def fetch_context() -> None:
    od = out_dir("epdk")
    res: dict = {"retrieved": TODAY, "eurostat": {}, "comtrade": {}, "fred": {}}
    es = {
        "nrg_ti_gas": {"geo": "TR", "partner": ["RU", "TOTAL"], "siec": "G3000", "unit": ["TJ_GCV", "MIO_M3"]},
        "nrg_ti_oil": {"geo": "TR", "partner": "RU", "siec": ["O4100_TOT", "O4600"], "unit": "THS_T"},
        "nrg_ti_sff": {"geo": "TR", "partner": "RU", "siec": "C0000X0350-0370", "unit": "THS_T"},
    }
    for ds, params in es.items():
        r = get(EUROSTAT.format(ds=ds), {**params, "sinceTimePeriod": "2004"})
        r.raise_for_status()
        cols, rows = jsonstat_rows(r.json())
        res["eurostat"][ds] = {"url": r.url, "columns": cols, "rows": rows}
    rows = []
    for y in range(2004, 2022):
        params = {"reporterCode": "792", "partnerCode": "643", "flowCode": "M", "cmdCode": "TOTAL,27", "period": y,
                  "customsCode": "C00", "motCode": "0", "partner2Code": "0"}  # fmt: skip
        r = get(COMTRADE, params, pause=2.0)
        data = r.json().get("data") if r.status_code == 200 else None
        for d in data or []:
            rows.append([d["period"], d["cmdCode"], d["primaryValue"], d.get("netWgt")])
        if data is None:
            rows.append([str(y), None, None, f"HTTP {r.status_code}"])
    res["comtrade"] = {"url": COMTRADE, "query": "reporter 792 (Türkiye), partner 643, flow M, TOTAL and 27, USD",
                       "columns": ["period", "cmdCode", "primaryValue_usd", "netWgt_kg"], "rows": rows}  # fmt: skip
    r = get(FRED, {"id": "IREXFUELS", "fq": "Annual", "fam": "avg"})
    r.raise_for_status()
    res["fred"]["IREXFUELS"] = {"url": r.url, "annual": {ln.split(",")[0][:4]: float(ln.split(",")[1])
                                                         for ln in r.text.splitlines()[1:] if ln.split(",")[1:2] != [""]}}  # fmt: skip
    p = write_json(od / f"tur_context_{TODAY}.json", res)
    bad = [x[0] for x in rows if x[1] is None]
    report(p, f"Comtrade years {2022 - 2004 - len(bad)}/18" + (f" (missing {', '.join(bad)})" if bad else ""))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--to", default=(dt.date.fromisoformat(TODAY) - dt.timedelta(days=1)).isoformat())
    ap.add_argument("--skip-epdk", action="store_true")
    ap.add_argument("--skip-entsog", action="store_true")
    ap.add_argument("--skip-context", action="store_true")
    a = ap.parse_args()
    if not a.skip_epdk:
        fetch_epdk()
    if not a.skip_entsog:
        fetch_entsog(a.to)
    if not a.skip_context:
        fetch_context()


if __name__ == "__main__":
    main()
