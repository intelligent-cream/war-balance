"""Round 58: Russia's oil and gas income, 2019-2026 (research only, for a "Russia's oil and gas income" page).

Series built here:
  (a) federal budget oil and gas revenues ("нефтегазовые доходы"), monthly, RUB and EUR (and USD) at the monthly
      average of the Bank of Russia's official daily rates (the ECB stopped its RUB reference rate on 2 March 2022);
  (b) total federal budget revenue and the oil and gas share;
  (c) fossil-fuel export revenue estimates: CREA Russia Fossil Tracker (monthly, EUR, from 2021), IEA Oil Market
      Report export revenues (a few months, via TASS), Bank of Russia balance-of-payments energy exports (to 2021 only);
  (d) defence spending for context: the federal budget "Национальная оборона" section (executed to 2021, then
      budget-law plans) and SIPRI's military expenditure (broader definition).

Modes:
  fetch   downloads Minfin's open-data CSVs (monthly and yearly budget execution), the Bank of Russia's EUR and USD
          daily rates and SIPRI's Milex workbook into a temporary directory, and keeps only short extracts (the
          columns used) with address and date under research/2026-10/raw/russia_revenue_r58/. It also writes the
          web-page extracts read on 2026-10-27 (WEB_EXTRACTS below; these pages were read with a fetch tool, not by
          this script, and are kept as quoted figures with their addresses).
  run     (default) reads only those extracts plus the CREA monthly file already in the repository
          (raw/crea_api/counter_month_country_fuel_2026-10-23.json.gz) and writes
          research/2026-10/gaps/russia_revenue_r58.json.

Run from the repository root: python3 -I research/2026-10/scripts/russia_revenue_r58.py [fetch|run]
Downloads are untrusted data: they are parsed as CSV/XML/XLSX text only and never executed.
"""

import csv
import datetime
import gzip
import json
import re
import subprocess
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

R = Path(__file__).resolve().parent.parent
RAW = R / "raw" / "russia_revenue_r58"
CREA_FILE = R / "raw" / "crea_api" / "counter_month_country_fuel_2026-10-23.json.gz"
OUT = R / "gaps" / "russia_revenue_r58.json"
YEARS = range(2019, 2027)

MINFIN_MONTH = "https://minfin.gov.ru/opendata/7710168360-fedbud_month/data-20261009T0100-structure-20210312T0100.csv"
MINFIN_YEAR = "https://minfin.gov.ru/OpenData/7710168360-fedbud_year/data-20260505T0100-structure-20220211T0100.csv"
CBR_RATES = "https://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=01/01/2019&date_req2=27/10/2026&VAL_NM_RQ={code}"
CBR_CODES = {"EUR": "R01239", "USD": "R01235"}
SIPRI_XLSX = "https://www.sipri.org/sites/default/files/SIPRI-Milex-data-1949-2025.xlsx"

MONTHS_RU = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
]  # fmt: skip

# Columns kept from Minfin's CSVs (headers exactly as published)
MONTH_COLS = ["Год", "Месяц", "Доходы, всего", "Нефтегазовые доходы", "Ненефтегазовые доходы", "Расходы, всего",
              "Расходы на национальную оборону"]  # fmt: skip
YEAR_COLS = ["Период", "Доходы, всего", "Нефтегазовые доходы", "Ненефтегазовые доходы", "Расходы, всего",
             "Расходы на национальную оборону"]  # fmt: skip
SIPRI_SHEETS = ["Local currency calendar years", "Current US$", "Share of GDP", "Share of Govt. spending"]

# Pages read on 2026-10-27 with a web fetch tool (summarised by that tool, figures quoted). Kept as extracts.
WEB_EXTRACTS = {
    "cbr_export_energy_2021.txt": (
        "https://cbr.ru/statistics/macro_itm/external_sector/etg/export_energy/",
        (
            "Bank of Russia, 'Экспорт энергетических товаров' (last updated 07.11.2024; no data after 2021 on the page).\n"
            "Экспорт сырой нефти в 2021 году вырос в 1,5 раза, или на 38,4 млрд долларов США, до 111,0 млрд долларов США.\n"
            "Экспорт нефтепродуктов в 2021 году увеличился в 1,5 раза, или на 24,6 млрд долларов США, до 70,0 млрд.\n"
            "Экспорт природного газа в 2021 году стал больше в 2,2 раза, или на 29,8 млрд долларов США, составив 55,5 млрд.\n"
            "LNG: exports rose by USD 0.6bn (9%) (2021 level not stated).\n"
            "Доля четырех основных энергетических товаров в совокупном объеме российского экспорта товаров составила 49% "
            "(годом ранее - 45%)."
        ),
    ),
    "tass_2026-10-14_iea_september.txt": (
        "https://tass.com/economy/2202067",
        (
            "TASS, 14 Oct 2026, citing the IEA Oil Market Report: September 2026 Russian oil and products export revenue "
            "$17.67 bn (+$3.6 bn m/m); crude $14.5 bn, products $3.16 bn; exports 6.52 mb/d (-10 kb/d); $4.32 bn higher "
            "than September 2025. Urals FOB Primorsk +$28.29 to $94.3/bbl."
        ),
    ),
    "tass_2026-09-11_iea_august.txt": (
        "https://tass.com/economy/2186003",
        (
            "TASS, 11 Sep 2026, citing the IEA: August 2026 revenues increased by $330 mln month-on-month to $13.87 bln; "
            "crude $11.28 bn, products $2.59 bn; exports 6.44 mb/d (-410 kb/d); $320 mn higher than August 2025. "
            "Urals FOB Primorsk $62.02/bbl (+$8.84)."
        ),
    ),
    "tass_2026-08-12_iea_july.txt": (
        "https://tass.com/economy/2171847",
        (
            "TASS, 12 Aug 2026, citing the IEA: July 2026 export revenue $13.76 bn, down nearly $2 bn (12.5%) m/m; crude "
            "$11.11 bn (-$1.11 bn), products $2.64 bn (-$0.86 bn); 6.97 mb/d (-630 kb/d); $720 mn lower than July 2025. "
            "Urals FOB Primorsk $57.18/bbl (-$3.97)."
        ),
    ),
    "crea_2026-10_september_analysis.txt": (
        "https://energyandcleanair.org/september-2026-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/",
        (
            "CREA, September 2026 monthly analysis (page dated 16/20 Oct 2026): Russia's fossil fuel export revenues were "
            "broadly unchanged month-on-month at EUR 625 mn per day, despite a 6% decrease in export volumes. Crude 339 "
            "(-8%), products 83 (+6%), LNG 75 (+68%), pipeline gas 71 (+8%), coal 58 (-12%) EUR mn/day. Russia's mineral "
            "extraction tax (MET) receipts from crude oil reached 688 billion rubles in September."
        ),
    ),
    "kommersant_2023-11-18_budget_2024.txt": (
        "https://www.kommersant.ru/doc/6348808",
        (
            "Kommersant, 18.11.2023, 'Бюджет России на 2024-2026 годы: главные цифры': national defence 2024 rises "
            "'с 4,64 трлн до 10,78 трлн руб.' against last year's plan for 2024; 2024 defence spending is 68,2% higher than "
            "in the 2023 budget (implies about 6,4 трлн руб. for 2023: 10,78 / 1,682; derived, not stated)."
        ),
    ),
    "zona_2024-11-21_budget_2025.txt": (
        "https://zona.media/news/2024/11/21/byudzet",
        (
            "Mediazona, 21 Nov 2024: the Duma approved the 2025-2027 budget; national defence 13,5 трлн руб. in 2025, "
            "12,8 трлн in 2026, 13,1 трлн in 2027 (as read via a search summary)."
        ),
    ),
    "tj_2025-12-01_budget_2026.txt": (
        "https://t-j.ru/news/budget-2026-approved/",
        (
            "T-Zh, 01.12.2025 (law signed 28 Nov 2025): 'Изначально предполагалось, что на нее [национальную оборону] "
            "потратят 12,9 трлн рублей, или 29% всего бюджета.' Spending 44,1 трлн, revenue 40,3 трлн, deficit 3,8 трлн."
        ),
    ),
    "sipri_2026-04_factsheet.txt": (
        "https://www.sipri.org/sites/default/files/2026-04/2604_milex_2025.pdf",
        (
            "SIPRI fact sheet, April 2026: Russia increased its military spending by 5.9 per cent in 2025 to an estimated "
            "$190 billion, or 7.5 per cent of its GDP (as read via a search summary; the workbook extract has the series)."
        ),
    ),
}

# Bank of Russia BOP energy exports, USD bn (2020 derived from the stated 2021 level minus the stated increase)
CBR_ENERGY_EXPORTS = {
    "2020": {"crude": round(111.0 - 38.4, 1), "products": round(70.0 - 24.6, 1), "natural_gas": round(55.5 - 29.8, 1)},
    "2021": {"crude": 111.0, "products": 70.0, "natural_gas": 55.5},
}

# IEA OMR (via TASS): USD bn per month; 2025 months derived from the stated year-on-year differences
IEA_REVENUE = {
    "2026-09": {"total": 17.67, "crude": 14.5, "products": 3.16, "src": "tass_2026-10-14_iea_september.txt"},
    "2026-08": {"total": 13.87, "crude": 11.28, "products": 2.59, "src": "tass_2026-09-11_iea_august.txt"},
    "2026-07": {"total": 13.76, "crude": 11.11, "products": 2.64, "src": "tass_2026-08-12_iea_july.txt"},
    "2026-06": {"total": round(13.76 + 1.97, 2), "derived": "July + ~1.97 (12.5% fall)",
                "src": "tass_2026-08-12_iea_july.txt"},
    "2025-09": {"total": round(17.67 - 4.32, 2), "derived": "Sep 2026 - 4.32", "src": "tass_2026-10-14_iea_september.txt"},
    "2025-08": {"total": round(13.87 - 0.32, 2), "derived": "Aug 2026 - 0.32", "src": "tass_2026-09-11_iea_august.txt"},
    "2025-07": {"total": round(13.76 + 0.72, 2), "derived": "Jul 2026 + 0.72", "src": "tass_2026-08-12_iea_july.txt"},
}  # fmt: skip

# National defence ("Национальная оборона") in the federal budget, RUB bn
DEFENCE_PLAN = {
    "2023": {"value": 6409, "kind": "approx. 2023 budget level implied by Kommersant's +68.2% for 2024 (derived)",
             "src": "kommersant_2023-11-18_budget_2024.txt"},
    "2024": {"value": 10780, "kind": "budget law as adopted (Nov 2023)", "src": "kommersant_2023-11-18_budget_2024.txt"},
    "2025": {"value": 13500, "kind": "budget law as adopted (Nov 2024)", "src": "zona_2024-11-21_budget_2025.txt"},
    "2026": {"value": 12900, "kind": "budget law as adopted (Nov 2025), before 2026 amendments",
             "src": "tj_2025-12-01_budget_2026.txt"},
}  # fmt: skip


def curl(url: str, dest: Path) -> str:
    r = subprocess.run(
        ["curl", "-sSL", "--max-time", "120", "-A", "Mozilla/5.0", "-o", str(dest), "-w", "%{http_code}", url],
        check=False,
        capture_output=True,
        text=True,
    )
    return r.stdout.strip()


def head(url: str, today: str, code: str, what: str) -> str:
    return f"# URL: {url}\n# Fetched: {today}\n# HTTP: {code}\n# {what}\n"


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    today = datetime.datetime.now(datetime.UTC).date().isoformat()
    with tempfile.TemporaryDirectory() as tmp:
        t = Path(tmp)
        # Minfin monthly (cumulative from the start of each year) and yearly budget execution, RUB bn
        for url, cols, name in (
            (MINFIN_MONTH, MONTH_COLS, "minfin_fedbud_month_ytd.csv"),
            (MINFIN_YEAR, YEAR_COLS, "minfin_fedbud_year.csv"),
        ):
            dl = t / "minfin.csv"
            code = curl(url, dl)
            if code != "200":  # minfin.gov.ru is intermittently unreachable; keep the earlier extract
                print(name, "HTTP", code, "- kept the existing extract")
                continue
            rows = list(csv.reader(dl.open(encoding="utf-8-sig")))
            idx = [rows[0].index(c) for c in cols]
            with (RAW / name).open("w", encoding="utf-8", newline="") as f:
                f.write(head(url, today, code, "Minfin open data, RUB bn; columns kept: " + "; ".join(cols)))
                w = csv.writer(f)
                w.writerow(cols)
                for r in rows[1:]:
                    if r and r[0][:4].isdigit() and int(r[0][:4]) >= 2018:
                        w.writerow([r[i] for i in idx])
            print(name, code, len(rows))
        # Bank of Russia official daily rates
        for cur, cid in CBR_CODES.items():
            url = CBR_RATES.format(code=cid)
            dl = t / "cbr.xml"
            code = curl(url, dl)
            if code != "200":
                print(cur, "HTTP", code, "- kept the existing extract")
                continue
            txt = dl.read_bytes().decode("windows-1251")
            recs = re.findall(r'<Record Date="(\d\d)\.(\d\d)\.(\d{4})"[^>]*>.*?<VunitRate>([\d,]+)</VunitRate>', txt)
            with (RAW / f"cbr_{cur.lower()}_rub_daily.csv").open("w", encoding="utf-8") as f:
                f.write(head(url, today, code, f"Bank of Russia official RUB per 1 {cur}, by date the rate applies"))
                f.write("date,rub_per_unit\n")
                for d, m, y, v in recs:
                    f.write(f"{y}-{m}-{d},{v.replace(',', '.')}\n")
            print(cur, code, len(recs))
        # SIPRI Milex workbook: Russia rows only
        dl = t / "sipri.xlsx"
        code = curl(SIPRI_XLSX, dl)
        import openpyxl

        wb = openpyxl.load_workbook(dl, read_only=True, data_only=True)
        out = {"url": SIPRI_XLSX, "fetched": today, "http": code, "release": "SIPRI Milex, April 2026", "series": {}}
        for sn in SIPRI_SHEETS:
            hdr = None
            for r in wb[sn].iter_rows(values_only=True):
                if r and "Country" in r:
                    hdr = r
                if r and "Russia" in r and hdr:
                    out["series"][sn] = {
                        str(h): v for h, v in zip(hdr, r, strict=False) if isinstance(h, int) and 2015 <= h <= 2026
                    }
                    break
        (RAW / "sipri_russia_milex.json").write_text(json.dumps(out, indent=1) + "\n")
        print("sipri", code, list(out["series"]))
    for name, (url, body) in WEB_EXTRACTS.items():
        (RAW / name).write_text(
            f"URL: {url}\nRead: 2026-10-27 (web fetch tool; text summarised by the tool, figures quoted)\n\n{body}\n"
        )


def read_csv(name: str) -> list[dict]:
    lines = [ln for ln in (RAW / name).read_text(encoding="utf-8").splitlines() if not ln.startswith("#")]
    return list(csv.DictReader(lines))


def monthly_rates(cur: str) -> dict[str, float]:
    acc = defaultdict(list)
    for r in read_csv(f"cbr_{cur}_rub_daily.csv"):
        acc[r["date"][:7]].append(float(r["rub_per_unit"]))
    return {k: sum(v) / len(v) for k, v in acc.items()}


def num(s: str) -> float | None:
    s = (s or "").strip()
    return float(s) if s else None


def run() -> None:
    eur, usd = monthly_rates("eur"), monthly_rates("usd")
    # (a)+(b) monthly from Minfin's cumulative figures
    ytd = defaultdict(dict)
    for r in read_csv("minfin_fedbud_month_ytd.csv"):
        ytd[int(r["Год"])][MONTHS_RU.index(r["Месяц"].strip().lower()) + 1] = r
    monthly = []
    for y in YEARS:
        prev = {"Доходы, всего": 0.0, "Нефтегазовые доходы": 0.0}
        for m in range(1, 13):
            if m not in ytd[y]:
                continue
            r = ytd[y][m]
            og = num(r["Нефтегазовые доходы"]) - prev["Нефтегазовые доходы"]
            tot = num(r["Доходы, всего"]) - prev["Доходы, всего"]
            prev = {k: num(r[k]) for k in prev}
            ym = f"{y}-{m:02d}"
            monthly.append({
                "ym": ym,
                "og_rev_rub": round(og, 1),
                "og_rev_eur": round(og / eur[ym], 3),
                "og_rev_usd": round(og / usd[ym], 3),
                "total_rev_rub": round(tot, 1),
                "total_rev_eur": round(tot / eur[ym], 3),
                "share": round(og / tot, 4),
                "eur_rub_avg": round(eur[ym], 4),
                "usd_rub_avg": round(usd[ym], 4),
                "src": "minfin_fedbud_month_ytd.csv (month = cumulative minus previous month)",
            })  # fmt: skip
    # yearly: sums of months, checked against Minfin's yearly file
    yr_file = {r["Период"]: r for r in read_csv("minfin_fedbud_year.csv")}
    yearly = {}
    for y in YEARS:
        ms = [x for x in monthly if x["ym"].startswith(str(y))]
        og = sum(x["og_rev_rub"] for x in ms)
        tot = sum(x["total_rev_rub"] for x in ms)
        f = yr_file.get(str(y))
        yearly[str(y)] = {
            "months": len(ms),
            "period": f"{y}-01..{ms[-1]['ym']}" if ms else None,
            "og_rev_rub": round(og, 1),
            "og_rev_eur": round(sum(x["og_rev_eur"] for x in ms), 2),
            "og_rev_usd": round(sum(x["og_rev_usd"] for x in ms), 2),
            "total_rev_rub": round(tot, 1),
            "total_rev_eur": round(sum(x["total_rev_eur"] for x in ms), 2),
            "share": round(og / tot, 4),
            "minfin_annual_og_rub": num(f["Нефтегазовые доходы"]) if f else None,
            "minfin_annual_total_rub": num(f["Доходы, всего"]) if f else None,
            "complete": len(ms) == 12,
        }
    # (c) CREA monthly export revenue, EUR bn, all destinations
    with gzip.open(CREA_FILE) as fh:
        d = json.load(fh)
    ci = {c: i for i, c in enumerate(d["columns"])}
    crea = defaultdict(lambda: defaultdict(float))
    for row in d["rows"]:
        if row[ci["pricing_scenario"]] != "default":
            continue
        crea[row[ci["month"]][:7]][row[ci["commodity_group"]]] += float(row[ci["value_eur"]] or 0) / 1e9
    crea_monthly = []
    for ym in sorted(crea):
        g = crea[ym]
        oilgas = sum(v for k, v in g.items() if k != "Coal")
        crea_monthly.append({
            "ym": ym,
            "total_eur_bn": round(sum(g.values()), 3),
            "oil_gas_eur_bn": round(oilgas, 3),
            "by_group_eur_bn": {k: round(v, 3) for k, v in sorted(g.items())},
            "partial": ym == "2026-10",
        })  # fmt: skip
    crea_yearly = {}
    for y in range(2021, 2027):
        ms = [x for x in crea_monthly if x["ym"].startswith(str(y)) and not x["partial"]]
        crea_yearly[str(y)] = {
            "months": len(ms),
            "total_eur_bn": round(sum(x["total_eur_bn"] for x in ms), 1),
            "oil_gas_eur_bn": round(sum(x["oil_gas_eur_bn"] for x in ms), 1),
        }
        # budget oil and gas revenue over CREA oil+gas export value, same months
        bm = {x["ym"]: x for x in monthly}
        both = [x for x in ms if x["ym"] in bm]
        if both:
            crea_yearly[str(y)]["budget_og_over_crea_oilgas"] = round(
                sum(bm[x["ym"]]["og_rev_eur"] for x in both) / sum(x["oil_gas_eur_bn"] for x in both), 3
            )
    # (d) defence
    sipri = json.loads((RAW / "sipri_russia_milex.json").read_text())["series"]
    defence = {}
    for y in YEARS:
        k = str(y)
        f = yr_file.get(k)
        executed = num(f["Расходы на национальную оборону"]) if f else None
        defence[k] = {
            "national_defence_executed_rub_bn": executed,
            "national_defence_plan_rub_bn": DEFENCE_PLAN.get(k, {}).get("value"),
            "plan_note": DEFENCE_PLAN.get(k, {}).get("kind"),
            "sipri_local_rub_bn": round(sipri["Local currency calendar years"][k] / 1e9, 1)
            if sipri["Local currency calendar years"].get(k)
            else None,
            "sipri_current_usd_bn": round(sipri["Current US$"][k] / 1e3, 1) if sipri["Current US$"].get(k) else None,
            "sipri_share_gdp": round(sipri["Share of GDP"][k], 4) if sipri["Share of GDP"].get(k) else None,
            "sipri_share_govt_spending": round(sipri["Share of Govt. spending"][k], 4)
            if sipri["Share of Govt. spending"].get(k)
            else None,
        }
        ref = defence[k]["national_defence_executed_rub_bn"] or defence[k]["national_defence_plan_rub_bn"]
        if ref and yearly[k]["complete"]:
            defence[k]["og_rev_over_national_defence"] = round(yearly[k]["og_rev_rub"] / ref, 3)
    latest = monthly[-1]["ym"]
    out = {
        "generated": datetime.datetime.now(datetime.UTC).date().isoformat(),
        "meta": {
            "what": "Russia's federal budget oil and gas revenues and total revenues (monthly and yearly, 2019 to the "
            "latest month), fossil-fuel export revenue estimates (CREA monthly; IEA and Bank of Russia points) and "
            "defence spending for context. Research only; not wired into the build.",
            "latest_budget_month": latest,
            "latest_crea_full_month": [x["ym"] for x in crea_monthly if not x["partial"]][-1],
            "units": "RUB bn, EUR bn, USD bn nominal; share = oil and gas revenue / total federal revenue",
            "fx": "Bank of Russia official daily rates, simple monthly average of the rates applying in the month "
            "(ECB has no RUB reference rate after 1 March 2022). Yearly EUR/USD = sum of monthly conversions.",
            "definition": "Minfin 'нефтегазовые доходы': mineral extraction tax on oil, gas and condensate, export "
            "duties on oil, products and gas, the additional income tax (НДД) and, since 2019, minus the "
            "'damper' payments to refiners and the reverse excise (they are netted in the oil MET). It is a "
            "budget (tax) concept, not export earnings: it includes tax on oil and gas sold at home and excludes "
            "companies' profits, profit tax and dividends (Gazprom/Rosneft dividends sit in non-oil-gas revenue).",
            "ytd_note": "Minfin publishes cumulative figures from the start of each year; a month is the difference "
            "between consecutive cumulative figures, so in-year revisions land in the month published.",
        },
        "monthly": monthly,
        "yearly": yearly,
        "crea_monthly_export_revenue": crea_monthly,
        "crea_yearly_export_revenue": crea_yearly,
        "iea_export_revenue_usd_bn": IEA_REVENUE,
        "cbr_bop_energy_exports_usd_bn": CBR_ENERGY_EXPORTS,
        "defence_yearly": defence,
        "sources": [
            {
                "name": "Minfin, monthly federal budget execution (open data fedbud_month)",
                "url": MINFIN_MONTH,
                "date": "data 2026-10-09; fetched 2026-10-27",
                "type": "official",
                "extract": "raw/russia_revenue_r58/minfin_fedbud_month_ytd.csv",
            },
            {
                "name": "Minfin, yearly federal budget execution (open data fedbud_year)",
                "url": MINFIN_YEAR,
                "date": "data 2026-05-05; fetched 2026-10-27",
                "type": "official",
                "extract": "raw/russia_revenue_r58/minfin_fedbud_year.csv",
            },
            {
                "name": "Minfin, oil and gas revenue page (Svedeniya_20261005.xlsx, additional oil and gas revenue)",
                "url": "https://minfin.gov.ru/ru/statistics/fedbud/oil",
                "date": "2026-10-05; seen 2026-10-27",
                "type": "official",
                "extract": None,
            },
            {
                "name": "Bank of Russia official EUR/RUB rates",
                "url": CBR_RATES.format(code="R01239"),
                "date": "fetched 2026-10-27",
                "type": "official",
                "extract": "raw/russia_revenue_r58/cbr_eur_rub_daily.csv",
            },
            {
                "name": "Bank of Russia official USD/RUB rates",
                "url": CBR_RATES.format(code="R01235"),
                "date": "fetched 2026-10-27",
                "type": "official",
                "extract": "raw/russia_revenue_r58/cbr_usd_rub_daily.csv",
            },
            {
                "name": "Bank of Russia, exports of energy goods (BOP)",
                "url": WEB_EXTRACTS["cbr_export_energy_2021.txt"][0],
                "date": "updated 2024-11-07; read 2026-10-27",
                "type": "official",
                "extract": "raw/russia_revenue_r58/cbr_export_energy_2021.txt",
            },
            {
                "name": "CREA Russia Fossil Tracker API, monthly by destination and fuel (repository copy)",
                "url": d["url"],
                "date": f"retrieved {d['retrieved']}",
                "type": "research (CREA)",
                "extract": "raw/crea_api/counter_month_country_fuel_2026-10-23.json.gz",
            },
            {
                "name": "CREA September 2026 monthly analysis",
                "url": WEB_EXTRACTS["crea_2026-10_september_analysis.txt"][0],
                "date": "2026-10-16/20; read 2026-10-27",
                "type": "research (CREA)",
                "extract": "raw/russia_revenue_r58/crea_2026-10_september_analysis.txt",
            },
            *[
                {
                    "name": f"IEA Oil Market Report via TASS ({k})",
                    "url": WEB_EXTRACTS[k][0],
                    "date": k.split("_")[1] + "; read 2026-10-27",
                    "type": "news citing IEA",
                    "extract": f"raw/russia_revenue_r58/{k}",
                }
                for k in (
                    "tass_2026-10-14_iea_september.txt",
                    "tass_2026-09-11_iea_august.txt",
                    "tass_2026-08-12_iea_july.txt",
                )
            ],
            {
                "name": "SIPRI Military Expenditure Database (April 2026)",
                "url": SIPRI_XLSX,
                "date": "2026-04; fetched 2026-10-27",
                "type": "research (SIPRI)",
                "extract": "raw/russia_revenue_r58/sipri_russia_milex.json",
            },
            *[
                {
                    "name": n,
                    "url": WEB_EXTRACTS[k][0],
                    "date": dt + "; read 2026-10-27",
                    "type": t,
                    "extract": f"raw/russia_revenue_r58/{k}",
                }
                for n, k, dt, t in (
                    (
                        "Kommersant, budget 2024-2026 main figures",
                        "kommersant_2023-11-18_budget_2024.txt",
                        "2023-11-18",
                        "news",
                    ),
                    ("Mediazona, budget 2025-2027 adopted", "zona_2024-11-21_budget_2025.txt", "2024-11-21", "news"),
                    ("T-Zh, budget 2026 adopted", "tj_2025-12-01_budget_2026.txt", "2025-12-01", "news"),
                    ("SIPRI fact sheet April 2026", "sipri_2026-04_factsheet.txt", "2026-04", "research (SIPRI)"),
                )
            ],
        ],
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print("wrote", OUT, "latest", latest)
    for y, v in yearly.items():
        print(y, v["period"], v["og_rev_rub"], v["og_rev_eur"], v["total_rev_rub"], v["share"],
              v["minfin_annual_og_rub"], crea_yearly.get(y))  # fmt: skip


if __name__ == "__main__":
    {"fetch": fetch, "run": run}[sys.argv[1] if len(sys.argv) > 1 else "run"]()
