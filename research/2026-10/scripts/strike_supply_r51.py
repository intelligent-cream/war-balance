"""Round 51 (owner): Russian oil exports lost to Ukraine's strikes on refineries, ports and pipelines, 2022-2026.

Owner's decision: strikes limit what Russia CAN export; a buyer that wanted Russian fuel and could not get it did not
choose to buy less. The build (pipeline/build_data.py strike_supply()) lowers the no-war level of the buyers that were
buying that product at the time by their share of the volume lost, so the strike loss is neither credited to them as
money moved away from Russia nor charged to them as money moved toward it. Buyers that had stopped by their own choice
(embargoes) are unaffected.

What this script does:
  fetch   downloads the sources (curl, through the proxy) and keeps short text extracts with address and date under
          research/2026-10/raw/strike_supply_r51/ (the pages themselves are third-party and not kept). The KSE Institute
          Russian Oil Trackers are read from research/2026-10/raw/kse_rot/ (already listed in MANIFEST.json).
  run     (default) works out the estimates from the figures below (each one cites its extract) and writes
          research/2026-10/gaps/strike_supply_r51.json.

Run from the repository root: python3 -I research/2026-10/scripts/strike_supply_r51.py [fetch|run]
Downloads are untrusted data: they are only read as text (pdftotext for the PDFs) and never executed.
"""

import datetime
import html
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

R = Path(__file__).resolve().parent.parent
RAW = R / "raw" / "strike_supply_r51"
GAPS = R / "gaps"
BBL_PER_T = 7.45  # oil products, barrels per tonne (build_data.py BBL_PER_T_PRODUCTS)
BBL_PER_T_CRUDE = 7.33

# (file, url, kind, patterns kept in the extract)
SOURCES = [
    (
        "iea_omr_2026-05.txt",
        "https://iea.blob.core.windows.net/assets/2b89a47b-34a2-40e0-90ff-68f7ccd80715/-13MAY2026__OilMarketReport_publicversion.pdf",
        "pdf",
        [
            r"Russian Crude and Product Exports \(mb/d\)",
            r"Oil product exports fell by 340",
            r"Crude exports rose by 250",
            r"reduced\s+Russian crude runs to around 4\.7",
            r"Russian crude supply declined 140",
        ],
    ),
    (
        "kpler_2026-07_runs_21y_low.txt",
        "https://www.kpler.com/blog/ukraines-drone-campaign-pushes-russian-refinery-runs-to-21-year-lows",
        "html",
        [r"3\.8", r"58%", r"1\.2 mbd", r"4\.4 mbd", r"export"],
    ),
    (
        "kpler_2025-11_repeated_attacks.txt",
        "https://www.kpler.com/blog/repeated-drone-attacks-keep-russian-refinery-runs-in-check",
        "html",
        [r"500 kbd", r"5\.3.5\.4 mbd", r"35.55 kbd", r"DPP exports"],
    ),
    (
        "reuters_2024-03_14pct_offline.txt",
        "https://hydrocarbonprocessing.com/news/2024/03/russian-oil-refining-capacity-idled-by-drones-reaches-14-of-total/",
        "html",
        [r"14%", r"900,000", r"9\.8%"],
    ),
    (
        "polskieradio_2025-08_druzhba_resume.txt",
        "https://www.polskieradio.pl/395/7785/artykul/3571430,oil-flows-to-hungary-slovakia-resume-via-druzhba-pipeline-after-attack-outage",
        "html",
        [r"resum", r"Unecha", r"days"],
    ),
    (
        "meduza_2025-08-20_druzhba.txt",
        "https://meduza.io/en/news/2025/08/20/russian-oil-flows-to-hungary-restored-after-attack-on-druzhba-pipeline",
        "html",
        [r"restored", r"Nikolsk", r"halt"],
    ),
    (
        "aljazeera_2025-08-22_druzhba.txt",
        "https://www.aljazeera.com/news/2025/8/22/hungary-slovakia-fear-oil-cuts-after-ukrainian-attack-on-russian-pipeline",
        "html",
        [r"five days", r"Unecha", r"halt"],
    ),
    (
        "moscowtimes_2026-02-16_druzhba_halt.txt",
        "https://www.themoscowtimes.com/2026/02/16/oil-supplies-to-hungary-and-slovakia-halted-after-damage-to-druzhba-pipeline-a91964",
        "html",
        [r"January 27|Jan\. 27|27 January", r"Brody", r"Russian"],
    ),
    ("kyivpost_2026-02-23_kaleykino.txt", "https://www.kyivpost.com/post/70609", "html", [r"Kaleykino", r"Druzhba"]),
    (
        "wikipedia_fuel_crisis_2025_2026.txt",
        "https://en.wikipedia.org/wiki/2025%E2%80%932026_Russian_fuel_crisis",
        "html",
        [r"export ban", r"20%", r"3%", r"Ust-Luga", r"diesel exports"],
    ),
    (
        "oilprice_2026-09_fuel_exports_august.txt",
        "https://oilprice.com/Latest-Energy-News/World-News/Russian-Fuel-Exports-Rebound-in-August-But-Still-Down-50-From-Last-Year.html",
        "html",
        [r"4\.57", r"50%", r"16\.4%"],
    ),
    (
        "crea_2025-09_monthly.txt",
        "https://energyandcleanair.org/september-2025-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/",
        "html",
        [r"drone", r"13%", r"refiner"],
    ),
]
KSE = R / "raw" / "kse_rot"
KSE_PATTERNS = [
    r"Total Russian oil exports (?:de|in)creased",
    r"products exports collapse",
    r"refinery throughput",
    r"Crude runs dropped",
    r"products exports decline to the",
]


def text_of(path: Path, kind: str) -> str:
    if kind == "pdf":
        s = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True).stdout
    else:
        s = path.read_text(encoding="utf-8", errors="replace")
        s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", s)
        s = html.unescape(re.sub(r"(?s)<[^>]+>", " ", s))
    return re.sub(r"[ \t]+", " ", s)


def extract(s: str, patterns: list[str], width: int = 700) -> list[str]:
    out = []
    for p in patterns:
        for m in list(re.finditer(p, s))[:3]:
            out.append(s[max(0, m.start() - width // 3) : m.end() + width].strip())
    return out


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    with tempfile.TemporaryDirectory() as tmp:
        for name, url, kind, pats in SOURCES:
            dl = Path(tmp) / ("doc.pdf" if kind == "pdf" else "doc.html")
            r = subprocess.run(
                ["curl", "-sSL", "-A", "Mozilla/5.0", "-o", str(dl), "-w", "%{http_code}", url],
                capture_output=True,
                text=True,
            )
            code = r.stdout.strip()
            body = extract(text_of(dl, kind), pats) if code == "200" and dl.exists() else []
            head = f"URL: {url}\nFetched: {today}\nHTTP: {code}\nExtract (short passages around the figures used):\n\n"
            (RAW / name).write_text(head + "\n\n---\n\n".join(body) + "\n")
            print(name, code, len(body))
    for pdf in sorted(KSE.glob("*.pdf")):
        body = extract(text_of(pdf, "pdf"), KSE_PATTERNS, 500)
        (RAW / f"kse_{pdf.stem}.txt").write_text(
            f"File: research/2026-10/raw/kse_rot/{pdf.name} (KSE Institute, Russian Oil Tracker; listed in MANIFEST.json)\n"
            f"Read: {today}\nExtract:\n\n" + "\n\n---\n\n".join(body) + "\n"
        )
        print(pdf.name, len(body))


# ------------------------------------------------------------------ the figures used (mb/d unless stated)
# Russia's oil product exports (IEA OMR 13 May 2026 table, sources IEA, Kpler, Argus; iea_omr_2026-05.txt), and 2021
# from the Federal Customs Service, 144.3 Mt (SeaNews 28 Feb 2022, read via a search summary: 144.3 x 7.45 / 365)
PRODUCTS_EXPORTS = {2021: round(144.3 * BBL_PER_T / 365, 2), 2022: 2.98, 2023: 2.97, 2024: 2.73, 2025: 2.58}
# 2026 by month: Jan-Apr IEA (table above); June 1.83 and July 1.40 (KSE ROT August 2026, IEA basis: "products exports
# collapse by 0.43 mb/d MoM ... to 1.4 mb/d"); August 1.30 (KSE ROT September 2026: "collapsed by 0.1 mb/d MoM and
# 1.29 mb/d YoY to 1.3 mb/d"); May not found on the IEA basis: 2.0 assumed, between April (2.15) and June (1.83)
PRODUCTS_2026 = {1: 2.81, 2: 2.44, 3: 2.50, 4: 2.15, 5: 2.0, 6: 1.83, 7: 1.40, 8: 1.30}
CRUDE_EXPORTS = {2022: 5.11, 2023: 4.91, 2024: 4.78, 2025: 4.78}
CRUDE_2026 = {1: 4.65, 2: 4.33, 3: 4.63, 4: 4.88, 5: 4.7, 6: 4.4, 7: 4.2, 8: 3.8}  # May-Aug: KSE/IEA text, rounded

# Refinery throughput lost to strikes (year average, mb/d), the step that carries the judgement:
#   2022: one export refinery hit (Novoshakhtinsk, June 2022), no measurable fall in runs or exports
#   2023: scattered hits (Tuapse, Afipsky, Ilsky, Volgograd); product exports flat (2.98 -> 2.97)
#   2024: the first wave, Jan-Jun: 14% of primary capacity (900 kb/d) idle at the end of March (Reuters via Hydrocarbon
#         Processing); most units back within 1-3 months; a year average of about 150 kb/d (90-250)
#   2025: Jan-Jul hits on Ryazan, Volgograd, Kstovo, Saratov (about 120 kb/d); from August runs ~500 kb/d below
#         pre-attack levels (Kpler, Nov 2025; Reuters: about 20% idle at the peak, refining down 3% over the year):
#         7/12 x 0.12 + 5/12 x 0.45 = 0.26 (0.18-0.33)
#   2026 (Jan-Aug): runs 4.7 in April (IEA), 3.8 in June and 3.7 in July (IEA, Kpler), against 5.3-5.4 before the
#         attacks (Kpler): about 0.85 below on average (0.75-0.95); the Hormuz crisis raised demand for Russian
#         barrels, so none of the fall is weaker demand
RUNS_LOST = {
    2022: (0.0, 0.0, 0.01),
    2023: (0.0, 0.015, 0.05),
    2024: (0.09, 0.15, 0.25),
    2025: (0.18, 0.26, 0.33),
    2026: (0.75, 0.85, 0.95),
}
# Export pass-through: tonnes of exports lost per tonne of throughput lost. Russia protects its home market (export
# bans on gasoline from March 2024, gasoline and jet from April 2026, diesel in summer 2026, all in response to the
# strike-driven shortages), so most of a throughput loss falls on exports, but not all: crude is exported instead,
# and secondary units kept clean products running (Kpler). Checked against the data: 2026 Jan-Aug product exports
# fell ~0.6 mb/d against early 2025 while runs fell ~0.85 (0.7); 2025 exports fell 0.15 while runs fell ~0.15-0.2
PASS_THROUGH = (0.5, 0.7, 1.0)
# never more than the whole fall of product exports against the pre-war level that year (plausible maximum)
NOWAR_PRODUCTS = 2.95  # mb/d, 2021-2022 level (144.3 Mt in 2021; 2.98 in 2022)

# Crude by sea: port strikes stopped loadings for days (Primorsk Sept 2025 and 23 Mar 2026; Ust-Luga about two weeks
# from 25 Mar 2026, Baltic loadings 1.5 -> 0.76 mb/d; Sheskharis -370 kb/d for a week in April 2026 and -58% m-o-m in
# August 2026 (CREA); Novorossiysk 2 days in Nov 2025). Net of rerouting and of the crude freed by idle refineries
# crude exports did not fall: 4.88 mb/d in April 2026, 4.4 in June, near records (IEA, KSE). Central 0; the high end
# is the gross volume of the outages, about 22 million barrels in 2026 (0.09 mb/d over Jan-Aug) and 1-2 million
# barrels in 2025
CRUDE_LOST = {2022: (0, 0, 0), 2023: (0, 0, 0), 2024: (0, 0, 0), 2025: (0, 0, 0.005), 2026: (0, 0, 0.09)}

# Druzhba south (Hungary, Slovakia): Ukrainian strikes on Nikolskoye (18 Aug 2025, about two days) and Unecha
# (21-22 Aug 2025, restart 28 Aug): about 8 days without flow. Stocks covered it; part may have been made up later.
# Days lost: 3 / 6 / 8. Czechia had stopped Russian crude by its own choice in April 2025: not affected. The halt of
# 27 Jan - 22 Apr 2026 followed a Russian strike on the pipeline in Ukraine (Brody) and is not a Ukrainian strike on
# Russia: not counted (the Kaleykino strike of 23 Feb 2026 fell within that halt and stopped nothing more)
DRUZHBA_DAYS = {"2025": (3, 6, 8)}


def run() -> None:
    p26 = sum(PRODUCTS_2026.values()) / len(PRODUCTS_2026)
    c26 = sum(CRUDE_2026.values()) / len(CRUDE_2026)
    prod = {**PRODUCTS_EXPORTS, 2026: round(p26, 3)}
    crude = {**CRUDE_EXPORTS, 2026: round(c26, 3)}
    days = {2022: 365, 2023: 365, 2024: 366, 2025: 365, 2026: 243}
    out_p, out_c = {}, {}
    for y in range(2022, 2027):
        lo_r, c_r, hi_r = RUNS_LOST[y]
        cap = max(0.0, NOWAR_PRODUCTS - prod[y])
        lost = [min(cap, lo_r * PASS_THROUGH[0]), min(cap, c_r * PASS_THROUGH[1]), min(cap, hi_r * PASS_THROUGH[2])]
        out_p[str(y)] = {
            "lost_mbd": [round(v, 3) for v in lost],
            "lost_mt": [round(v * days[y] / BBL_PER_T, 1) for v in lost],
            "share_of_nowar_exports": [round(v / NOWAR_PRODUCTS, 4) for v in lost],
            "per_tonne_exported": [round(v / prod[y], 4) for v in lost],
            "actual_exports_mbd": prod[y],
            "cap_mbd": round(cap, 3),
        }
        cl = CRUDE_LOST[y]
        out_c[str(y)] = {
            "lost_mbd": list(cl),
            "lost_mt": [round(v * days[y] / BBL_PER_T_CRUDE, 1) for v in cl],
            "share_of_nowar_exports": [round(v / 5.0, 4) for v in cl],
            "per_tonne_exported": [round(v / crude[y], 4) for v in cl],
            "actual_exports_mbd": crude[y],
        }
    out = {
        "generated": "2026-10-25",
        "what": "Round 51 (owner): Russian oil exports lost to Ukraine's strikes on refineries, ports and pipelines, by year and product, as [low, central, high]. 'per_tonne_exported' is the lost volume per tonne Russia actually exported that year: the build gives each buyer of that product (pro rata to what it actually bought, from its customs) that share of its own purchases as the volume strikes kept from it, valued at the no-war price, and lowers its no-war level by it, capped at its own no-war level of that product. Buyers under an embargo on that product get nothing. 2026 = January-August.",
        "unit": "mb/d (year average; 2026 Jan-Aug), Mt (that period), fractions",
        "seaborne": {"products": out_p, "crude": out_c},
        "pipeline": {
            "what": "Druzhba south: days of lost flow to the buyer from Ukrainian strikes on pumping stations in Russia, as [low, central, high]; applied to that buyer's crude purchases that year",
            "buyers": {"HUN": {"days": DRUZHBA_DAYS}, "SVK": {"days": DRUZHBA_DAYS}},
            "not_counted": "CZE (stopped Russian crude by its own choice in April 2025); the 27 Jan - 22 Apr 2026 halt (Russian strike on the pipeline at Brody in Ukraine)",
        },
        "embargo": {
            "what": "Buyers whose own embargo or sanctions stopped the product: the strike changed nothing for them, so their no-war level is not lowered",
            "products_from": 2023,
            "crude_from": 2023,
            "countries": "EU27 (Druzhba crude to Hungary and Slovakia exempt), GBR, USA, CAN, AUS, NZL, CHE, NOR, ISL",
        },
        "other_products": "Ammonia and fertiliser exports through ports: no strike-related loss found (the Togliatti-Odesa ammonia pipeline was shut by the war in February 2022, not by a strike; no measured loss at Taman). Not included. Gasoline export bans of 2023 (Sept-Nov, domestic prices before the strike waves) not counted; bans from March 2024 are counted through the pass-through (responses to strike-driven shortages).",
        "inputs": {
            "runs_lost_mbd": {str(k): v for k, v in RUNS_LOST.items()},
            "pass_through": PASS_THROUGH,
            "nowar_products_mbd": NOWAR_PRODUCTS,
            "products_2026_monthly_mbd": PRODUCTS_2026,
            "crude_2026_monthly_mbd": CRUDE_2026,
        },
        "sources": [
            {
                "name": "IEA Oil Market Report, 13 May 2026: Russian Crude and Product Exports table 2022-2026, port and refinery attack effects",
                "url": SOURCES[0][1],
                "date": "2026-05-13",
                "extract": "raw/strike_supply_r51/iea_omr_2026-05.txt",
            },
            {
                "name": "KSE Institute, Russian Oil Tracker, July, August and September 2026 (monthly exports and runs, IEA basis)",
                "url": "https://institute.kse.ua/wp-content/uploads/2026/10/rot_eng_september_2026.pdf",
                "date": "2026-10-01",
                "extract": "raw/strike_supply_r51/kse_*.txt",
            },
            {
                "name": "Kpler: Ukraine's drone campaign pushes Russian refinery runs to 21-year lows (July 2026)",
                "url": SOURCES[1][1],
                "date": "2026-07",
                "extract": "raw/strike_supply_r51/kpler_2026-07_runs_21y_low.txt",
            },
            {
                "name": "Kpler: Repeated drone attacks keep Russian refinery runs in check (18 Nov 2025)",
                "url": SOURCES[2][1],
                "date": "2025-11-18",
                "extract": "raw/strike_supply_r51/kpler_2025-11_repeated_attacks.txt",
            },
            {
                "name": "Reuters via Hydrocarbon Processing: Russian oil refining capacity idled by drones reaches 14% of total (March 2024)",
                "url": SOURCES[3][1],
                "date": "2024-03",
                "extract": "raw/strike_supply_r51/reuters_2024-03_14pct_offline.txt",
            },
            {
                "name": "Polskie Radio, Meduza, Al Jazeera: Druzhba flows to Hungary and Slovakia halted and resumed after strikes on Nikolskoye and Unecha (August 2025)",
                "url": SOURCES[4][1],
                "date": "2025-08",
                "extract": "raw/strike_supply_r51/polskieradio_2025-08_druzhba_resume.txt",
            },
            {
                "name": "The Moscow Times: Oil supplies to Hungary and Slovakia halted after damage to Druzhba pipeline (16 Feb 2026); Kyiv Post: Kaleykino strike (23 Feb 2026)",
                "url": SOURCES[7][1],
                "date": "2026-02-16",
                "extract": "raw/strike_supply_r51/moscowtimes_2026-02-16_druzhba_halt.txt",
            },
            {
                "name": "Wikipedia: 2025-2026 Russian fuel crisis (export bans, capacity offline)",
                "url": SOURCES[9][1],
                "date": "2026-10-25",
                "extract": "raw/strike_supply_r51/wikipedia_fuel_crisis_2025_2026.txt",
            },
            {
                "name": "Reuters via OilPrice: Russian fuel exports rebound in August but still down 50% from last year (Sept 2026)",
                "url": SOURCES[10][1],
                "date": "2026-09",
                "extract": "raw/strike_supply_r51/oilprice_2026-09_fuel_exports_august.txt",
            },
            {
                "name": "CREA: September 2025 monthly analysis of Russian fossil fuel exports (product exports -13% m-o-m after strikes)",
                "url": SOURCES[11][1],
                "date": "2025-10",
                "extract": "raw/strike_supply_r51/crea_2025-09_monthly.txt",
            },
            {
                "name": "Russian Federal Customs Service via SeaNews: oil product exports 144.3 Mt in 2021 (search summary; page not opened)",
                "url": "https://seanews.ru/en/2022/02/28/en-russian-oil-export-in-2021-products-up",
                "date": "2022-02-28",
                "verified": "search summary only",
            },
        ],
    }
    (GAPS / "strike_supply_r51.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    for y in range(2022, 2027):
        print(
            y,
            "products",
            out_p[str(y)]["lost_mt"],
            out_p[str(y)]["per_tonne_exported"],
            "crude",
            out_c[str(y)]["lost_mt"],
        )


if __name__ == "__main__":
    fetch() if sys.argv[1:] == ["fetch"] else run()
