"""Round 59: Russia's federal budget balance and the National Wealth Fund, 2019-2026 (research only).

Extends round 58 (russia_revenue_r58: oil and gas and total federal revenue, defence context) with:
  - federal budget total expenditure and balance (deficit -/surplus +), monthly and yearly, RUB and EUR;
  - the balance and expenditure as % of GDP (Rosstat nominal GDP as republished by the World Bank, WDI
    NY.GDP.MKTP.CN; 2026 = Minfin's September 2026 estimate implied by "7.345 trn = 3.2% of GDP");
  - National Wealth Fund (NWF / ФНБ) total and liquid assets, month by month (Minfin);
  - the 2026 budget law (426-FZ) and later official estimates and plans (labelled "plan", not "execution").

Modes:
  fetch   downloads Minfin's open-data CSVs (fedbud_month, fedbud_year), Minfin's NWF workbook and the World Bank
          GDP series into a temporary directory and keeps only short extracts (the rows/columns used) with address
          and date under research/2026-10/raw/russia_deficit_r59/. It also writes the web-page extracts read on
          2026-10-27 (WEB_EXTRACTS; figures quoted with their addresses).
  run     (default) reads only those extracts plus round 58's Bank of Russia EUR rate extract
          (raw/russia_revenue_r58/cbr_eur_rub_daily.csv, read only) and writes gaps/russia_deficit_r59.json.

Run from the repository root: python3 -I research/2026-10/scripts/russia_deficit_r59.py [fetch|run]
Downloads are untrusted data: they are parsed as CSV/XLSX/JSON values only and never executed.
"""

import csv
import datetime
import json
import subprocess
import sys
import tempfile
from collections import defaultdict
from pathlib import Path

R = Path(__file__).resolve().parent.parent
RAW = R / "raw" / "russia_deficit_r59"
EUR_FILE = R / "raw" / "russia_revenue_r58" / "cbr_eur_rub_daily.csv"
OUT = R / "gaps" / "russia_deficit_r59.json"
YEARS = range(2019, 2027)
TODAY_READ = "2026-10-27"

MINFIN_MONTH = "https://minfin.gov.ru/opendata/7710168360-fedbud_month/data-20261009T0100-structure-20210312T0100.csv"
MINFIN_YEAR = "https://minfin.gov.ru/OpenData/7710168360-fedbud_year/data-20260505T0100-structure-20220211T0100.csv"
MINFIN_NWF = "https://minfin.gov.ru/common/upload/library/2026/10/main/Dannye_20261001.xlsx"
MINFIN_NWF_PAGE = "https://minfin.gov.ru/ru/statistics/fonds/fnb/"
WB_GDP = "https://api.worldbank.org/v2/country/RUS/indicator/NY.GDP.MKTP.CN?format=json&date=2018:2026"
CBR_EUR = "https://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=01/01/2019&date_req2=27/10/2026&VAL_NM_RQ=R01239"

MONTHS_RU = [
    "январь", "февраль", "март", "апрель", "май", "июнь",
    "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
]  # fmt: skip

# Columns kept from Minfin's CSVs (headers exactly as published; RUB bn, cumulative from January in fedbud_month)
# (Debt service, "Расходы на обслуживание ... долга", is blank from 2022 like the defence line, so it is not kept.)
REV, EXP, BAL, NONOIL = "Доходы, всего", "Расходы, всего", "Дефицит (-)/Профицит (+)", "Ненефтегазовый дефицит"
MONTH_COLS = ["Год", "Месяц", REV, EXP, BAL, NONOIL]
YEAR_COLS = ["Период", REV, EXP, BAL, NONOIL]

# Rows of Minfin's NWF table ("Таблица по ФНБ"), matched by their row number label (№ п/п)
NWF_ROWS = {
    "1": "start_rub_bn",
    "1.1.": "inflows_rub_bn",
    "1.2.": "withdrawals_rub_bn",
    "1.3.": "fx_revaluation_rub_bn",
    "2": "end_rub_bn",
    "2.1.": "end_share_gdp_minfin",
    "3.1.": "end_usd_bn",
    "4.1.": "cbr_usd_bn",
    "4.2.": "cbr_eur_bn",
    "4.3.": "cbr_gbp_bn",
    "4.5.": "cbr_cny_bn",
    "4.6.": "cbr_gold_tonnes",
    "4.7.": "cbr_rub_bn",
    "5": "other_assets_rub_bn",
    "5.1.": "other_assets_in_rub_bn",
    "5.2.": "other_assets_in_fx_rub_bn",
}

# Pages read on 2026-10-27 (curl or a web-fetch tool); figures quoted, kept as extracts with their addresses.
WEB_EXTRACTS = {
    "law_426fz_2025-11-28_art1.txt": (
        "https://www.zakonrf.info/doc-39055062/st1/",
        (
            "Federal Law of 28.11.2025 N 426-FZ 'О федеральном бюджете на 2026 год и на плановый период 2027 и 2028 "
            "годов', Article 1 (text as shown by zakonrf.info; Duma 20.11.2025, Federation Council 26.11.2025):\n"
            "1. ... исходя из прогнозируемого объема валового внутреннего продукта в размере 235 067 млрд. рублей и уровня "
            "инфляции, не превышающего 4,0 процента: 1) прогнозируемый общий объем доходов ... 40 283 269 170,5 тыс. "
            "рублей; 2) общий объем расходов ... 44 069 704 164,5 тыс. рублей; 3) верхний предел государственного "
            "внутреннего долга на 1 января 2027 года 37 436 192 859,5 тыс. рублей; ... 5) дефицит федерального бюджета "
            "в сумме 3 786 434 994,0 тыс. рублей.\n"
            "2. 2027 and 2028: GDP 255 498 and 276 346 млрд. рублей; revenue 42 910 384 343,8 and 45 869 367 238,3 тыс. "
            "рублей; expenditure 46 096 121 279,5 and 49 383 232 652,8 тыс. рублей; deficit 3 185 736 935,7 and "
            "3 513 865 414,5 тыс. рублей.\n"
            "Cross-check: consultant.ru review 'Сформирован федеральный бюджет на 2026 год ...' (01.01.2026) gives the same "
            "GDP of 235 067 млрд рублей (https://www.consultant.ru/document/cons_doc_LAW_522525/)."
        ),
    ),
    "interfax_2026-07-15_plan_45trn.txt": (
        "https://www.interfax.ru/business/1103530",
        (
            "Interfax, 15 Jul 2026, 'Минфин увеличил план по расходам бюджета-2026 на 1 трлн рублей с ростом "
            "дефицита': расходы ... могут составить 45,11 трлн рублей по сравнению с 44,07 трлн рублей, заложенными в "
            "законе ... Уточненный план по расходам отражен в сервисе 'Электронный бюджет' по состоянию на 13 июля. "
            "Прогноз по доходам остается прежним - 40,283 трлн рублей. ... планируемый дефицит составляет 4,828 трлн "
            "рублей. Законом ... дефицит предусмотрен на уровне 3,786 трлн рублей, или 1,6% ВВП. Власти в этом году "
            "отказались от весеннего раунда поправок в федеральный бюджет ... В январе-июне бюджет, по предварительным "
            "данным, был исполнен с дефицитом в размере 5,731 трлн рублей, или 2,5% ВВП."
        ),
    ),
    "interfax_2026-09-30_draft_2027_2029.txt": (
        "https://www.interfax.ru/business/1119496",
        (
            "Interfax, 30 Sep 2026, 'Правительство внесло в Госдуму проект бюджета РФ на трехлетку': 2027 расходы 48,8 "
            "трлн, доходы 43,3 трлн; 2028 и 2029 расходы 50,9 и 53,9 трлн, доходы 45,8 и 48,6 трлн. ... Основные "
            "характеристики ... исходя из ... ВВП в 2027 году 248,323 трлн рублей, в 2028 году - 263,724 трлн, в 2029 - "
            "281,674 трлн. Минфин РФ повысил оценку дефицита федерального бюджета в 2026 году до 7,345 трлн рублей, или "
            "3,2% ВВП, с 3,786 трлн рублей, или 1,6% ВВП, предусмотренных законом. Дефицит 2027 - 5,443 трлн (2,2% ВВП); "
            "2028 - 5,12 трлн (1,9%); 2029 - 5,245 трлн (1,9%). Первичный структурный дефицит в 2026 году 4,265 трлн "
            "рублей (1,8% ВВП). ... в следующую трехлетку ФНБ не будет использоваться для финансирования дефицита "
            "бюджета."
        ),
    ),
    "kommersant_2026-10_draft_2027.txt": (
        "https://www.kommersant.ru/doc/8991082",
        (
            "Kommersant (V. Visloguzov), 'Бюджет на 2027-2029 годы: дефицит 2,2% ВВП' (early Oct 2026): доходы бюджета "
            "2027 года должны вырасти на 5% к ожидаемым в 2026 году (до 43,3 трлн руб.). Расходы ... на 0,4% (до 48,8 "
            "трлн руб.). ... ожидается, что в этом году итоговые траты превысят изначально заложенные в закон сразу на 3,5 "
            "трлн руб. ... дефицит бюджета 2027 года 2,2% ВВП, или 5,5 трлн руб. (после ожидаемых в 2026-м 3,2% ВВП, или "
            "7,3 трлн руб.) ... чистое размещение госбумаг должно составить 6,5 трлн руб. Изъятий из ФНБ в 2027-м не "
            "планируется, и к концу объем фонда должен вырасти на 1,1 трлн руб."
        ),
    ),
    "fontanka_2026-09-23_siluanov_nwf.txt": (
        "https://www.fontanka.ru/2026/09/23/76657572/",
        (
            "Fontanka, 23 Sep 2026, quoting Finance Minister Anton Siluanov: по итогам 2026 года Фонд национального "
            "благосостояния (ФНБ) рассчитывают пополнить на 600 млрд — 1 трлн рублей, а его ликвидная часть к концу года "
            "может составить около 5 трлн рублей."
        ),
    ),
    "akm_2026-04-03_nwf_1apr.txt": (
        "https://www.akm.ru/news/obem_fnb_na_1_aprelya_sostavil_13_414_trln_rub/",
        (
            "AK&M, 03.04.2026, citing Minfin: Объем ФНБ на 1 апреля 2026 года составил 13.414 трлн руб. или 5.7% ВВП, "
            "прогнозируемого на 2026 год в соответствии с законом о бюджете ... На отдельных счетах ... в Банке России "
            "размещено: 185.211 млрд китайских юаней; 145348.4 кг золота в обезличенной форме; 2.936 млрд руб. ... Объем "
            "ликвидных активов ФНБ по состоянию на 1 апреля 2026 года составил эквивалент 3.889 трлн руб. или $47.84 млрд "
            "(1.7% ВВП ...). [Used to check that liquid assets = total minus 'иные разрешенные активы'.]"
        ),
    ),
    "checks_nwf_liquid_search_summaries.txt": (
        "https://ru.themoscowtimes.com/2026/10/07/likvidnye-rezervy-rf-umenshilis-v-sentyabre-do-16-vvp-a208031",
        (
            "Search-result summaries (not opened) of Minfin's monthly NWF releases: 'По состоянию на 1 октября 2025 года "
            "объем ликвидных активов ФНБ (средства на банковских счетах в Банке России) составил эквивалент 4.165 трлн "
            "руб. или $50.259 млрд (1.9% ВВП ...)'; The Moscow Times, 2026-10-07 (this URL), headline 'Ликвидные "
            "резервы РФ уменьшились в сентябре до 1,6% ВВП'. [Consistency checks only; pages not opened.]"
        ),
    ),
}

# 2026 plans and estimates, RUB bn. kind: law = enacted budget law; plan = in-year government plan (no new law);
# estimate = Minfin's expected outcome published with the next draft budget.
PLANS_2026 = [
    {"label": "Budget law 426-FZ (signed 28 Nov 2025)", "kind": "law", "date": "2025-11-28",
     "rev": 40283.269, "exp": 44069.704, "deficit": 3786.435, "gdp": 235067, "src": "law_426fz_2025-11-28_art1.txt"},
    {"label": "Updated spending plan in the 'Электронный бюджет' system, 13 Jul 2026 (no amending law; spring "
     "amendments were skipped)", "kind": "plan", "date": "2026-07-13", "rev": 40283.0, "exp": 45110.0,
     "deficit": 4828.0, "gdp": 235067, "src": "interfax_2026-07-15_plan_45trn.txt"},
    {"label": "Minfin estimate for 2026 published with the 2027-2029 draft budget (submitted 30 Sep 2026)",
     "kind": "estimate", "date": "2026-09-30", "rev": round(43300 / 1.05, 0), "exp": round(48800 / 1.004, 0),
     "deficit": 7345.0, "gdp": None, "deficit_pct_gdp_stated": 0.032,
     "note": "Deficit and % of GDP as stated (Interfax). Revenue and expenditure are back-calculated from "
     "Kommersant's '2027 revenue +5% to 43.3 trn' and 'expenditure +0.4% to 48.8 trn' (rounded inputs, about "
     "±0.1 trn); search summaries of other outlets give about 41.2 and 48.5 trn.",
     "src": "interfax_2026-09-30_draft_2027_2029.txt; kommersant_2026-10_draft_2027.txt"},
]  # fmt: skip

LATER_YEARS = {
    "law_426fz": {
        "2027": {"rev": 42910.384, "exp": 46096.121, "deficit": 3185.737, "gdp": 255498},
        "2028": {"rev": 45869.367, "exp": 49383.233, "deficit": 3513.865, "gdp": 276346},
        "src": "law_426fz_2025-11-28_art1.txt",
    },
    "draft_2027_2029_submitted_2026-09-30": {
        "2027": {"rev": 43300, "exp": 48800, "deficit": 5443, "gdp": 248323, "deficit_pct_gdp_stated": 0.022},
        "2028": {"rev": 45800, "exp": 50900, "deficit": 5120, "gdp": 263724, "deficit_pct_gdp_stated": 0.019},
        "2029": {"rev": 48600, "exp": 53900, "deficit": 5245, "gdp": 281674, "deficit_pct_gdp_stated": 0.019},
        "status": "draft bill; first Duma reading scheduled for 29 Oct 2026 (Kommersant)",
        "src": "interfax_2026-09-30_draft_2027_2029.txt",
    },
}

# 2026 GDP: Minfin's September 2026 estimate is not published directly in what was read; it is implied by the
# stated 2026 deficit estimate (7.345 trn = 3.2% of GDP). 3.2% is rounded, so the implied GDP is 228.0-231.1 trn.
GDP_2026_IMPLIED = round(7345 / 0.032, 0)


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
            hdr = [h.replace("\n", " ").strip() for h in rows[0]]
            idx = [hdr.index(c) for c in cols]
            with (RAW / name).open("w", encoding="utf-8", newline="") as f:
                f.write(head(url, today, code, "Minfin open data, RUB bn; columns kept: " + "; ".join(cols)))
                w = csv.writer(f)
                w.writerow(cols)
                for r in rows[1:]:
                    if r and r[0][:4].isdigit() and int(r[0][:4]) >= 2018:
                        w.writerow([r[i] for i in idx])
            print(name, code, len(rows))
        # Minfin NWF workbook: one column per month (the column date is the month; values are end of month)
        dl = t / "nwf.xlsx"
        code = curl(MINFIN_NWF, dl)
        if code == "200":
            import openpyxl

            wb = openpyxl.load_workbook(dl, read_only=True, data_only=True)
            rows = list(wb.worksheets[0].iter_rows(values_only=True))
            hdr = next(r for r in rows if r and r[1] == "Показатель")
            cols = [j for j, d in enumerate(hdr) if isinstance(d, datetime.datetime) and d.year >= 2018]
            keep = {}
            for r in rows:
                lab = str(r[0]).strip() if r and r[0] is not None else ""
                if lab in NWF_ROWS and NWF_ROWS[lab] not in keep:
                    keep[NWF_ROWS[lab]] = r
            with (RAW / "minfin_nwf_monthly.csv").open("w", encoding="utf-8", newline="") as f:
                f.write(head(MINFIN_NWF, today, code, "Minfin 'Данные о движении средств и результатах управления "
                             "средствами ФНБ' (published 14.10.2026), RUB bn unless named; month = flows in the "
                             "month, end_* = as of the 1st of the next month; rows by № п/п: "
                             + "; ".join(f"{k}={v}" for k, v in NWF_ROWS.items())))  # fmt: skip
                w = csv.writer(f)
                w.writerow(["month", *NWF_ROWS.values()])
                for j in cols:
                    w.writerow([hdr[j].strftime("%Y-%m"), *[keep[k][j] for k in NWF_ROWS.values()]])
            print("nwf", code, len(cols))
        else:
            print("nwf HTTP", code, "- kept the existing extract")
        # World Bank WDI: GDP in current roubles (Rosstat figures)
        dl = t / "wb.json"
        code = curl(WB_GDP, dl)
        if code == "200":
            d = json.loads(dl.read_text())
            with (RAW / "worldbank_gdp_rub.csv").open("w", encoding="utf-8") as f:
                f.write(head(WB_GDP, today, code, f"World Bank WDI NY.GDP.MKTP.CN (Rosstat), current RUB; WDI "
                             f"lastupdated {d[0].get('lastupdated')}"))  # fmt: skip
                f.write("year,gdp_rub\n")
                for x in sorted(d[1], key=lambda x: x["date"]):
                    if x["value"] is not None:
                        f.write(f"{x['date']},{x['value']}\n")
            print("wb", code)
    for name, (url, body) in WEB_EXTRACTS.items():
        (RAW / name).write_text(f"URL: {url}\nRead: {TODAY_READ} (curl / web fetch tool; figures quoted)\n\n{body}\n")


def read_csv(path: Path) -> list[dict]:
    lines = [ln for ln in path.read_text(encoding="utf-8").splitlines() if not ln.startswith("#")]
    return list(csv.DictReader(lines))


def num(s) -> float | None:
    # Minfin's workbook has a few text cells with footnote marks and spaces, e.g. "12 405,77³"
    s = str(s if s is not None else "").strip().rstrip("¹²³⁴⁵⁶⁷⁸⁹")
    s = s.replace("\xa0", "").replace(" ", "").replace(",", ".")
    return float(s) if s and s != "None" else None


def eur_rates() -> tuple[dict[str, float], list[tuple[str, float]]]:
    daily = sorted((r["date"], float(r["rub_per_unit"])) for r in read_csv(EUR_FILE))
    acc = defaultdict(list)
    for d, v in daily:
        acc[d[:7]].append(v)
    return {k: sum(v) / len(v) for k, v in acc.items()}, daily


def rate_on(daily: list[tuple[str, float]], date: str) -> float:
    prior = [v for d, v in daily if d <= date]
    return prior[-1] if prior else daily[0][1]  # 1 Jan 2019 precedes the extract: first rate of 2019 used


def run() -> None:
    eur_avg, eur_daily = eur_rates()
    gdp = {int(r["year"]): float(r["gdp_rub"]) / 1e9 for r in read_csv(RAW / "worldbank_gdp_rub.csv")}
    gdp_src = {y: "Rosstat via World Bank WDI NY.GDP.MKTP.CN" for y in gdp}
    if 2026 not in gdp:
        gdp[2026] = GDP_2026_IMPLIED
        gdp_src[2026] = "Minfin Sep 2026 estimate implied by 7.345 trn = 3.2% of GDP (derived; 228.0-231.1 trn)"
    # monthly from Minfin's cumulative figures
    ytd = defaultdict(dict)
    for r in read_csv(RAW / "minfin_fedbud_month_ytd.csv"):
        ytd[int(r["Год"])][MONTHS_RU.index(r["Месяц"].strip().lower()) + 1] = r
    monthly = []
    for y in YEARS:
        prev = dict.fromkeys((REV, EXP, BAL, NONOIL), 0.0)
        for m in range(1, 13):
            if m not in ytd[y]:
                continue
            r = ytd[y][m]
            cur = {k: num(r[k]) for k in prev}
            d = {k: cur[k] - prev[k] for k in prev}
            prev = cur
            ym = f"{y}-{m:02d}"
            fx = eur_avg[ym]
            monthly.append({
                "ym": ym,
                "rev_rub": round(d[REV], 1),
                "exp_rub": round(d[EXP], 1),
                "exp_eur": round(d[EXP] / fx, 3),
                "balance_rub": round(d[BAL], 1),
                "balance_eur": round(d[BAL] / fx, 3),
                "nonoil_balance_rub": round(d[NONOIL], 1),
                "balance_pct_annual_gdp": round(d[BAL] / gdp[y], 5),
                "ytd_exp_rub": round(cur[EXP], 1),
                "ytd_balance_rub": round(cur[BAL], 1),
                "ytd_balance_pct_gdp": round(cur[BAL] / gdp[y], 4),
                "eur_rub_avg": round(fx, 4),
                "src": "minfin_fedbud_month_ytd.csv (month = cumulative minus previous month)",
            })  # fmt: skip
    yr_file = {r["Период"]: r for r in read_csv(RAW / "minfin_fedbud_year.csv")}
    yearly = []
    for y in YEARS:
        ms = [x for x in monthly if x["ym"].startswith(str(y))]
        f = yr_file.get(str(y))
        exp = sum(x["exp_rub"] for x in ms)
        bal = sum(x["balance_rub"] for x in ms)
        rev = sum(x["rev_rub"] for x in ms)
        yearly.append({
            "year": y,
            "months": len(ms),
            "period": f"{y}-01..{ms[-1]['ym']}",
            "complete": len(ms) == 12,
            "status": "execution (Minfin)",
            "rev_rub": round(rev, 1),
            "exp_rub": round(exp, 1),
            "exp_eur": round(sum(x["exp_eur"] for x in ms), 2),
            "balance_rub": round(bal, 1),
            "balance_eur": round(sum(x["balance_eur"] for x in ms), 2),
            "nonoil_balance_rub": round(sum(x["nonoil_balance_rub"] for x in ms), 1),
            "gdp_rub_bn": round(gdp[y], 1),
            "gdp_src": gdp_src[y],
            "exp_pct_gdp": round(exp / gdp[y], 4),
            "balance_pct_gdp": round(bal / gdp[y], 4),
            "minfin_annual_exp_rub": round(num(f[EXP]), 1) if f else None,
            "minfin_annual_balance_rub": round(num(f[BAL]), 1) if f else None,
            "defence": "see gaps/russia_revenue_r58.json defence_yearly (not repeated here)",
            "src": "minfin_fedbud_month_ytd.csv; annual check minfin_fedbud_year.csv",
        })  # fmt: skip
    # NWF
    nwf = []
    for r in read_csv(RAW / "minfin_nwf_monthly.csv"):
        y, m = int(r["month"][:4]), int(r["month"][5:])
        asof = datetime.date(y + (m == 12), m % 12 + 1, 1).isoformat()
        if asof < "2019-01-01":
            continue
        total, other = num(r["end_rub_bn"]), num(r["other_assets_rub_bn"])
        liquid = total - other
        fx = rate_on(eur_daily, asof)
        g = gdp[int(asof[:4])] if asof[5:] != "01-01" else gdp[int(asof[:4]) - 1]
        nwf.append({
            "as_of": asof,
            "month_of_flows": r["month"],
            "total_rub_bn": round(total, 1),
            "liquid_rub_bn": round(liquid, 1),
            "liquid_eur_bn": round(liquid / fx, 2),
            "total_eur_bn": round(total / fx, 2),
            "total_usd_bn_minfin": num(r["end_usd_bn"]),
            "liquid_pct_gdp": round(liquid / g, 4),
            "total_pct_gdp_minfin": num(r["end_share_gdp_minfin"]),
            "inflows_rub_bn": num(r["inflows_rub_bn"]),
            "withdrawals_rub_bn": num(r["withdrawals_rub_bn"]),
            "fx_revaluation_rub_bn": num(r["fx_revaluation_rub_bn"]),
            "cbr_cny_bn": num(r["cbr_cny_bn"]),
            "cbr_gold_tonnes": num(r["cbr_gold_tonnes"]),
            "cbr_usd_bn": num(r["cbr_usd_bn"]),
            "cbr_eur_bn": num(r["cbr_eur_bn"]),
            "eur_rub_on_date": round(fx, 4),
            "src": "minfin_nwf_monthly.csv (liquid = total minus 'иные разрешенные активы', i.e. funds on accounts "
            "at the Bank of Russia)",
        })  # fmt: skip
    nwf_yearly = {}
    for y in YEARS:
        rows = [x for x in nwf if x["month_of_flows"].startswith(str(y))]
        if rows:
            nwf_yearly[str(y)] = {
                "withdrawals_rub_bn": round(sum(x["withdrawals_rub_bn"] or 0 for x in rows), 1),
                "inflows_rub_bn": round(sum(x["inflows_rub_bn"] or 0 for x in rows), 1),
                "end_as_of": rows[-1]["as_of"],
                "end_total_rub_bn": rows[-1]["total_rub_bn"],
                "end_liquid_rub_bn": rows[-1]["liquid_rub_bn"],
            }
    plans = {"2026": []}
    for p in PLANS_2026:
        q = dict(p)
        if q.get("gdp"):
            q["deficit_pct_gdp"] = round(q["deficit"] / q["gdp"], 4)
            q["exp_pct_gdp"] = round(q["exp"] / q["gdp"], 4)
        plans["2026"].append(q)
    ex26 = next(x for x in yearly if x["year"] == 2026)
    plans["2026_execution_to_date"] = {
        "period": ex26["period"],
        "exp_rub": ex26["exp_rub"],
        "balance_rub": ex26["balance_rub"],
        "exp_share_of_law": round(ex26["exp_rub"] / PLANS_2026[0]["exp"], 4),
        "exp_share_of_sep_estimate": round(ex26["exp_rub"] / PLANS_2026[2]["exp"], 4),
        "note": "Jan-Sep deficit already exceeds the full-year law deficit; ratios are descriptive, not forecasts.",
    }
    plans["later_years"] = LATER_YEARS
    plans["nwf_statements"] = [
        {"date": "2026-09-23", "who": "Finance Minister A. Siluanov (Fontanka)",
         "text": "NWF to be replenished by RUB 0.6-1 trn over 2026; liquid part about RUB 5 trn at end-2026 (statement)",
         "src": "fontanka_2026-09-23_siluanov_nwf.txt"},
        {"date": "2026-09-30", "who": "Government / draft 2027-2029 budget (Interfax, Kommersant)",
         "text": "NWF not to be used to finance the deficit in 2027-2029; no withdrawals planned in 2027 and the fund "
         "to grow by RUB 1.1 trn in 2027", "src": "interfax_2026-09-30_draft_2027_2029.txt"},
    ]  # fmt: skip
    src_list = [
        {"name": "Minfin, monthly federal budget execution (open data fedbud_month)", "url": MINFIN_MONTH,
         "date": "data 2026-10-09; fetched 2026-10-27", "type": "official (execution)",
         "extract": "raw/russia_deficit_r59/minfin_fedbud_month_ytd.csv"},
        {"name": "Minfin, yearly federal budget execution (open data fedbud_year)", "url": MINFIN_YEAR,
         "date": "data 2026-05-05; fetched 2026-10-27", "type": "official (execution)",
         "extract": "raw/russia_deficit_r59/minfin_fedbud_year.csv"},
        {"name": "Minfin, NWF movements and management results (Dannye_20261001.xlsx)", "url": MINFIN_NWF,
         "page": MINFIN_NWF_PAGE, "date": "published 2026-10-14; fetched 2026-10-27", "type": "official",
         "extract": "raw/russia_deficit_r59/minfin_nwf_monthly.csv"},
        {"name": "World Bank WDI, GDP current LCU (Rosstat)", "url": WB_GDP, "date": "WDI 2026-10-08; fetched "
         "2026-10-27", "type": "official statistics via WB", "extract": "raw/russia_deficit_r59/worldbank_gdp_rub.csv"},
        {"name": "Bank of Russia official EUR/RUB rates (round 58 extract, reused read-only)", "url": CBR_EUR,
         "date": "fetched 2026-10-27", "type": "official", "extract": "raw/russia_revenue_r58/cbr_eur_rub_daily.csv"},
        *[{"name": k.rsplit(".", 1)[0], "url": u, "date": f"read {TODAY_READ}",
           "type": "law text" if k.startswith("law") else "news / secondary",
           "extract": f"raw/russia_deficit_r59/{k}"} for k, (u, _) in WEB_EXTRACTS.items()],
    ]  # fmt: skip
    out = {
        "generated": datetime.datetime.now(datetime.UTC).date().isoformat(),
        "meta": {
            "what": "Russia's federal budget total expenditure and balance (monthly and yearly 2019 to the latest "
            "month), % of GDP, National Wealth Fund total and liquid assets, and the 2026 budget law, in-year plan "
            "and Minfin estimate. Research only; not wired into the build. Extends russia_revenue_r58 (revenue, "
            "oil and gas share, defence context).",
            "latest_budget_month": monthly[-1]["ym"],
            "latest_nwf_date": nwf[-1]["as_of"],
            "units": "RUB bn and EUR bn nominal; balance: deficit negative, surplus positive; shares as fractions",
            "fx": "Budget flows: simple monthly average of Bank of Russia official daily EUR rates; yearly EUR = sum of "
            "monthly conversions. NWF stocks: Bank of Russia EUR rate applying on the as-of date.",
            "gdp": "Rosstat annual nominal GDP as republished in World Bank WDI (2019-2025). 2026: GDP implied by "
            "Minfin's September 2026 estimate (7.345 trn = 3.2% of GDP), about 229.5 trn; the 2026 law assumed "
            "235.067 trn. Monthly balance_pct_annual_gdp = month / that year's GDP (not seasonally meaningful); "
            "ytd_balance_pct_gdp = cumulative / full-year GDP, Minfin's convention for in-year ratios.",
            "nwf_liquid": "Liquid assets = NWF funds on accounts at the Bank of Russia (yuan, gold, roubles; dollars, "
            "euros and pounds before they were sold off) = total volume minus 'иные разрешенные активы' (deposits "
            "at VEB, shares such as Sberbank and Aeroflot, bonds of companies). Matches Minfin's stated liquid "
            "volume on 1 Apr 2026 (3,889 bn) and 1 Oct 2025 (4,165 bn).",
            "labels": "monthly/yearly/nwf = execution or stock data; plans.* = law, in-year plan, estimate or draft, "
            "as labelled in 'kind'/'status'.",
        },
        "monthly": monthly,
        "yearly": yearly,
        "nwf": nwf,
        "nwf_yearly": nwf_yearly,
        "plans": plans,
        "sources": src_list,
    }
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n")
    print("wrote", OUT, "latest", monthly[-1]["ym"], "nwf", nwf[-1]["as_of"])
    for x in yearly:
        print(x["year"], x["period"], x["exp_rub"], x["balance_rub"], x["balance_eur"], x["balance_pct_gdp"],
              x["minfin_annual_balance_rub"], x["minfin_annual_exp_rub"])  # fmt: skip
    for y, v in nwf_yearly.items():
        print("nwf", y, v)


if __name__ == "__main__":
    {"fetch": fetch, "run": run}[sys.argv[1] if len(sys.argv) > 1 else "run"]()
