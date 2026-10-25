# /// script
# dependencies = ["requests>=2.31", "py7zr>=0.21"]
# ///
"""Round 44 energy near-misses (gaps/energy_r44.json): official evidence for Czechia's pre-war purchases from Russia,
Malta's tanker ownership and Türkiye's hidden gas price.

Writes to research/2026-10/raw/energy_r44/ (retrieval date in each name):
  eurostat_cz_ru_<date>.json     Eurostat nrg_ti_oil (crude, O4100_TOT, kt) and nrg_ti_gas (G3000, million m3), geo CZ,
      partner RU and TOTAL, 2015 onward (the energy-balance import volumes Czechia reports by origin)
  comtrade_cze_tur_<date>.json   UN Comtrade public preview, imports from Russia (643): Czechia (203) 2017-2025 TOTAL,
      27, 2709, 2711; Türkiye (792) 2022-2023 TOTAL, 27, 2709, 2711 (to show which headings Turkish customs hide)
  unctad_fleet_owners_<date>.json UNCTADstat US.FleetBeneficialOwners (bulk 7z, all ship types): dead-weight tonnes and
      ships by country of beneficial ownership (World, Malta, Greece, Cyprus, Russia), summed over flags, and the
      Malta-flagged fleet by owner; the archive itself is not kept
  sources_<date>.json            HTTP status, size and SHA-256 of each document consulted (MERO press releases, EPDK
      2024 gas report, BOTAŞ and Transport Malta pages), nothing else from them

Downloads are untrusted data: JSON is parsed with json, the UNCTAD archive is opened with py7zr and read as CSV text.
Run: uv run pipeline/fetch/energy_r44.py
"""

from __future__ import annotations

import csv
import hashlib
import io
import tempfile
import time
from collections import defaultdict
from pathlib import Path

import py7zr
from _common import TODAY, get, jsonstat_rows, out_dir, report, write_json

EUROSTAT = "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/{ds}"
COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
UNCTAD = "https://unctadstat-api.unctad.org/bulkdownload/US.FleetBeneficialOwners/US_FleetBeneficialOwners"
DOCS = {
    "mero_2025-04-17_non_russian_oil": "https://mero.cz/wp-content/uploads/2025/04/2025-04-17-tz-cesko-je-poprve-v-historii-zasobovano-vyhradne-neruskou-ropou.pdf",
    "mero_2025-10_druzba_60_years": "https://mero.cz/wp-content/uploads/2025/10/tz-pred-sedesati-lety-odstartoval-v-cesku-provoz-ropovodu-druzba-mero-cr-nyni-pracuje-na-scenarich-jeho-dalsiho-vyuzitiprilohy.pdf",
    "epdk_gas_report_2024": "https://www.epdk.gov.tr/Detay/DownloadDocument?id=di3gdUtTWpM%3D",
    "botas_annual_reports_page": "https://www.botas.gov.tr/Sayfa/faaliyet-raporlari/815",
    "transport_malta_registry_statistics": "https://www.transport.gov.mt/maritime/ship-and-yacht-registry/statistics-15",
}
OWNERS = ("World", "Malta", "Greece", "Cyprus", "Russian Federation")


def eurostat() -> dict:
    out = {}
    for ds, params in (
        ("nrg_ti_oil", {"geo": "CZ", "partner": ["RU", "TOTAL"], "siec": "O4100_TOT", "unit": "THS_T"}),
        ("nrg_ti_gas", {"geo": "CZ", "partner": ["RU", "TOTAL"], "siec": "G3000", "unit": "MIO_M3"}),
    ):
        r = get(EUROSTAT.format(ds=ds), {**params, "sinceTimePeriod": "2015"})
        cols, rows = jsonstat_rows(r.json()) if r.status_code == 200 else ([], [])
        out[ds] = {"url": r.url, "http": r.status_code, "columns": cols, "rows": rows}
    return out


def comtrade() -> dict:
    out = {}
    for rep, years, cmds in (
        ("203", range(2017, 2026), "TOTAL,27,2709,2711"),
        ("792", (2022, 2023), "TOTAL,27,2709,2711"),
    ):
        for y in years:
            q = {"reporterCode": rep, "period": y, "partnerCode": "643", "flowCode": "M", "cmdCode": cmds}
            r = get(COMTRADE, q, pause=1.5)
            data = r.json().get("data", []) if r.status_code == 200 else []
            out[f"{rep}_{y}"] = {
                "http": r.status_code,
                "rows": [
                    {"cmd": d["cmdCode"], "usd": d["primaryValue"], "net_kg": d.get("netWgt")}
                    for d in data
                    if d.get("customsCode") in (None, "C00") and d.get("motCode") in (None, 0)
                ],
            }
    return out


def unctad() -> dict:
    r = get(UNCTAD, timeout=300)
    if r.status_code != 200:
        return {"http": r.status_code}
    with tempfile.TemporaryDirectory() as td:
        arc = Path(td) / "a.7z"
        arc.write_bytes(r.content)
        with py7zr.SevenZipFile(arc) as z:
            z.extractall(td)
        name = next(p for p in Path(td).iterdir() if p.suffix == ".csv")
        text = name.read_text(encoding="utf-8-sig")
    by_owner, malta_flag = defaultdict(lambda: [0.0, 0]), {}
    for row in csv.DictReader(io.StringIO(text)):
        own, y = row["BeneficialOwnership Label"], row["Year"]
        dwt, n = float(row["Dead weight tons in thousands"] or 0), int(row["Number of ships"] or 0)
        if own in OWNERS:
            by_owner[(y, own)][0] += dwt
            by_owner[(y, own)][1] += n
        if row["FlagOfRegistration Label"] == "Malta" and own in OWNERS:
            malta_flag[f"{y}|{own}"] = [dwt, n]
    return {
        "url": UNCTAD,
        "http": 200,
        "sha256_archive": hashlib.sha256(r.content).hexdigest(),
        "note": "sums over every flag row, so 'World' includes regional flag aggregates; use ratios between owners",
        "by_owner_kdwt_ships": {f"{y}|{o}": [round(v[0], 3), v[1]] for (y, o), v in sorted(by_owner.items())},
        "malta_flag_by_owner_kdwt_ships": malta_flag,
    }


def sources() -> dict:
    out = {}
    for k, u in DOCS.items():
        try:
            r = get(u, tries=2, timeout=90, ok=(200, 403, 404))
            out[k] = {
                "url": u,
                "http": r.status_code,
                "bytes": len(r.content),
                "sha256": hashlib.sha256(r.content).hexdigest(),
            }
        except Exception as e:  # noqa: BLE001 - record the failure, keep going
            out[k] = {"url": u, "error": type(e).__name__}
        time.sleep(1)
    return out


def main() -> None:
    od = out_dir("energy_r44")
    report(write_json(od / f"eurostat_cz_ru_{TODAY}.json", eurostat()))
    report(write_json(od / f"comtrade_cze_tur_{TODAY}.json", comtrade()))
    report(write_json(od / f"unctad_fleet_owners_{TODAY}.json", unctad()))
    report(write_json(od / f"sources_{TODAY}.json", sources()))


if __name__ == "__main__":
    main()
