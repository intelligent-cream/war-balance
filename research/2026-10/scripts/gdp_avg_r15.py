"""Round 15 (review 4, M1; approved by the owner): the GDP denominator is the average of 2022-2024 nominal GDP in euros,
not 2024 alone. Same sources as before: World Bank WDI NY.GDP.MKTP.CD for the countries whose 2024 GDP came from it,
IMF WEO (DataMapper NGDPD) for the four that came from the IMF; each year converted at that year's ECB average
(USD per EUR 1.053, 1.0813, 1.0824). Countries with another source (North Korea's Bank of Korea GNI, World Bank 2023
only, territories without data) keep their single-year figure.

Run from the repository root: python3 research/2026-10/scripts/gdp_avg_r15.py
Writes research/2026-10/gaps/gdp_avg_r15.json.
"""

import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent
USD_PER_EUR = {2022: 1.053, 2023: 1.0813, 2024: 1.0824}
YEARS = (2022, 2023, 2024)

pg = json.loads((R / "other.json").read_text())["population_gdp"]
wb_rows = json.loads((R / "raw" / "worldbank" / "NY.GDP.MKTP.CD_2022_2024.json").read_text())[1]
wb: dict[str, dict[int, float]] = {}
for r in wb_rows:
    if r["value"] is not None:
        wb.setdefault(r["countryiso3code"], {})[int(r["date"])] = r["value"] / 1e9
imf = json.loads((R / "raw" / "imf" / "weo_NGDPD_2024.json").read_text())["values"]["NGDPD"]

out = {}
for iso3, d in sorted(pg.items()):
    src = d.get("gdp_source") or ""
    if src.startswith("World Bank WDI NY.GDP.MKTP.CD 2024"):
        usd, name = wb.get(iso3, {}), "World Bank WDI NY.GDP.MKTP.CD"
    elif src.startswith("IMF WEO"):
        usd, name = {y: (imf.get(iso3) or {}).get(str(y)) for y in YEARS}, "IMF WEO (DataMapper NGDPD)"
        usd = {y: v for y, v in usd.items() if v is not None}
    else:
        continue
    if not all(y in usd for y in YEARS):
        continue
    eur = {y: usd[y] / USD_PER_EUR[y] for y in YEARS}
    out[iso3] = {
        "name": d["name"],
        "gdp_usd_bn": {str(y): round(usd[y], 3) for y in YEARS},
        "gdp_eur_bn": {str(y): round(eur[y], 3) for y in YEARS},
        "gdp_eur_bn_avg_2022_2024": round(sum(eur.values()) / 3, 3),
        "gdp_eur_bn_2024": d.get("gdp_eur_bn"),
        "source": f"{name}, 2022-2024, each year at the ECB average USD per EUR",
    }

doc = {
    "generated": "2026-10-19",
    "what": "Nominal GDP 2022-2024 in EUR bn and its average, the denominator of every % of GDP on the map since round 15 (review 4, M1). The numerator is a 2022-August 2026 total in each year's euros; one trough year (2024) as the denominator inflated economies whose currency collapsed (Nigeria, Egypt).",
    "fx_usd_per_eur": {str(y): v for y, v in USD_PER_EUR.items()},
    "raw": [
        "research/2026-10/raw/worldbank/NY.GDP.MKTP.CD_2022_2024.json (api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD?date=2022:2024, last updated 2026-10-08, fetched 2026-10-19)",
        "research/2026-10/raw/imf/weo_NGDPD_2024.json (imf.org/external/datamapper/api/v1/NGDPD, full series)",
    ],
    "kept_single_year": sorted(k for k in pg if k not in out),
    "countries": out,
}
(R / "gaps" / "gdp_avg_r15.json").write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
print(len(out), "countries;", "kept:", doc["kept_single_year"])
