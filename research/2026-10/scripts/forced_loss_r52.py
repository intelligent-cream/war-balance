"""Round 52 (owner): forced losses of Russian supply that are not Ukraine's strikes, 2022-2026.

The owner's rule: "A country's figure reflects its own choices and the foreseeable answers to them. Things forced on it
that it did not choose - Ukraine's strikes on Russian refineries, Russia's sudden export bans - count neither for it
nor against it." Round 51 (strike_supply_r51.json) covers the strikes, and through their export pass-through the
Russian fuel export bans from March 2024, which answered strike-driven shortages. This file adds two more causes:

  export_ban_2023  Russia's ban on gasoline and diesel exports of 21 September 2023 (Government decree No. 1537),
                   lifted for diesel by pipeline from 6 October and for gasoline on 17 November 2023. It answered
                   domestic prices before the strike waves, so round 51 did not count it. Exempt: the other members of
                   the Eurasian Economic Union (Armenia, Belarus, Kazakhstan, Kyrgyzstan).
  druzhba_2026     the halt of the southern Druzhba pipeline to Hungary and Slovakia from 27 January to 22 April 2026,
                   after a Russian strike on the pipeline near Brody in Ukraine. Neither buyer chose it.

The build (pipeline/build_data.py strike_supply(), cause list FORCED_LOSS) lowers the no-war level of the buyers the
loss fell on, exactly as for the strikes: shift = actual - (baseline - lost).

What this script does:
  fetch   downloads the sources (curl, through the proxy) and keeps short text extracts with address and date under
          research/2026-10/raw/forced_loss_r52/ (the pages themselves are third-party and not kept).
  run     (default) works out the estimates from the figures below (each one cites its extract) and writes
          research/2026-10/gaps/forced_loss_r52.json.

Run from the repository root: python3 -I research/2026-10/scripts/forced_loss_r52.py [fetch|run]
Downloads are untrusted data: they are only read as text and never executed.
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
RAW = R / "raw" / "forced_loss_r52"
GAPS = R / "gaps"
BBL_PER_T = 7.45  # oil products, barrels per tonne (build_data.py BBL_PER_T_PRODUCTS; strike_supply_r51.py)

# (file, url, patterns kept in the extract)
SOURCES = [
    (
        "reuters_2023-09_diesel_first20days.txt",
        "https://www.hydrocarbonprocessing.com/news/2023/09/russia-cuts-september-seaborne-diesel-exports-to-meet-domestic-shortage/",
        [r"1\.7 million", r"30%", r"Sept\. 21|September 21"],
    ),
    (
        "reuters_2023-10_diesel_early_october.txt",
        "https://hydrocarbonprocessing.com/news/2023/10/russian-seaborne-diesel-exports-fell-by-20-in-early-october/",
        [r"1\.1 million", r"20%", r"ban"],
    ),
    (
        "reuters_2023-10_diesel_resumes.txt",
        "https://hydrocarbonprocessing.com/news/2023/10/russia-resumes-seaborne-diesel-exports-after-partially-lifting-ban/",
        [r"Oct\. 6|October 6", r"resum", r"Primorsk", r"pipeline"],
    ),
    (
        "reuters_2023-11_diesel_october.txt",
        "https://hydrocarbonprocessing.com/news/2023/11/russias-october-seaborne-diesel-exports-fall-on-ban-maintenance/",
        [r"million (?:metric )?tons", r"11%", r"maintenance"],
    ),
    (
        "reuters_2023-11_gasoline_ban_lifted.txt",
        "https://hydrocarbonprocessing.com/news/2023/11/russia-lifts-gasoline-export-ban-energy-ministry/",
        [r"Nov\. 17|November 17", r"lift", r"Sept\. 21|September 21"],
    ),
    (
        "reuters_daryo_2023-10_gasoline_rail.txt",
        "https://daryo.uz/en/2023/10/21/russias-gasoline-exports-plummet-by-80-in-october-impact-of-temporary-export-ban/",
        [r"80%", r"rail", r"tonnes|tons"],
    ),
    (
        "bloomberg_2023-12-20_fuel_exports.txt",
        "https://www.bnnbloomberg.ca/russia-ramps-up-fuel-exports-undermining-part-of-opec-pledge-1.2013878",
        [r"gasoline", r"51,000", r"barrels a day"],
    ),
    (
        "enerdata_2023-11_gasoline_ban_lifted.txt",
        "https://www.enerdata.net/publications/daily-energy-news/russia-lifts-its-ban-gasoline-exports-producers.html",
        [r"5\.76", r"43\.9", r"September", r"export"],
    ),
    (
        "armenpress_2024-02_ban_exemptions.txt",
        "https://armenpress.am/en/article/1131196",
        [r"September", r"Armenia, Belarus, Kazakhstan and Kyrgyzstan", r"except"],
    ),
    (
        "interfax_2023-09_resolution_1564.txt",
        "https://interfax.com/newsroom/top-stories/94866/",
        [r"1564", r"gas oil|gasoil", r"marine", r"South Ossetia|Abkhazia"],
    ),
    (
        "moscowtimes_2026-04-23_druzhba_resumed.txt",
        "https://www.themoscowtimes.com/2026/04/23/druzhba-oil-flow-to-slovakia-resumed-thursday-officials-say-a92580",
        [r"2 a\.m\.", r"13,500", r"119,000", r"January"],
    ),
    (
        "oenergetice_2026-04_mol_resumes.txt",
        "https://oenergetice.cz/en/oil/mol-resumes-receiving-oil-from-druzhba-after-three-months-with-flows-also-reaching-slovakia",
        [r"Fényeslitke|Fenyeslitke", r"three months", r"Budkovce", r"January"],
    ),
    (
        "intellinews_2026-06_druzhba_normal.txt",
        "https://www.intellinews.com/russian-oil-flows-through-druzhba-return-to-normal-as-hungary-and-slovakia-resume-russian-oil-and-gas-imports-446680/",
        [r"normal", r"May", r"below", r"tonnes|bpd|barrels"],
    ),
    (
        "pgj_2026-04_druzhba_resume.txt",
        "https://pgjonline.com/news/2026/april/druzhba-pipeline-oil-flows-resume-to-hungary-slovakia-after-outage",
        [r"resum", r"January", r"strike|attack"],
    ),
    (
        "wikipedia_2026_druzhba_dispute.txt",
        "https://en.wikipedia.org/wiki/2026_Druzhba_pipeline_dispute",
        [r"27 January", r"Brody", r"23 April", r"250,000", r"JANAF"],
    ),
    (
        "reuters_2024-07_lukoil_transit.txt",
        "https://www.hydrocarbonprocessing.com/news/2024/07/slovakia-hungary-say-ukraine-has-halted-lukoils-russian-oil-transit/",
        [r"Lukoil", r"tonnes|tons", r"bpd|barrels"],
    ),
]


def text_of(path: Path) -> str:
    s = path.read_text(encoding="utf-8", errors="replace")
    s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", s)
    s = html.unescape(re.sub(r"(?s)<[^>]+>", " ", s))
    return re.sub(r"\s+", " ", s)


def extract(s: str, patterns: list[str], width: int = 600) -> list[str]:
    out = []
    for p in patterns:
        for m in list(re.finditer(p, s))[:2]:
            out.append(s[max(0, m.start() - width // 3) : m.end() + width].strip())
    return out


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    today = datetime.date.today().isoformat()
    with tempfile.TemporaryDirectory() as tmp:
        for name, url, pats in SOURCES:
            dl = Path(tmp) / "doc.html"
            r = subprocess.run(
                ["curl", "-sSL", "--max-time", "60", "-A", "Mozilla/5.0", "-o", str(dl), "-w", "%{http_code}", url],
                check=False,
                capture_output=True,
                text=True,
            )
            code = r.stdout.strip()
            body = extract(text_of(dl), pats) if code == "200" and dl.exists() else []
            head = f"URL: {url}\nFetched: {today}\nHTTP: {code}\nExtract (short passages around the figures used):\n\n"
            (RAW / name).write_text(head + "\n\n---\n\n".join(body) + "\n")
            print(name, code, len(body))


# ------------------------------------------------------------------ the 2023 export ban (Mt, [low, central, high])
# 21 Sep - 17 Nov 2023 for gasoline (Reuters, 17 Nov 2023); diesel until seaborne ULSD resumed on 9 October (Reuters,
# 17 Oct 2023; the decree of 6 October allowed diesel by pipeline). Gas oils and marine fuel were taken out of the ban on
# 23 September (Interfax, resolution No. 1564)
BAN_DAYS = {"gasoline": 58, "diesel": 18}
BAN_EXEMPT = ["ARM", "BLR", "KAZ", "KGZ"]  # Reuters 17 Nov 2023, Armenpress, Enerdata: the other EAEU members only
# Gasoline: Russia exported about 5 Mt in 2023 (Enerdata; 4.8 Mt in 2022, Reuters via Daryo), about 0.42 Mt a month.
# During the ban rail exports fell about 80% (first half of October, Reuters via Daryo: about 37,000 t less in 15 days)
# and what still left Russian ports was mostly Belarusian gasoline (Belarus is a separate exporter). Seaborne gasoline
# in October was 51,000 b/d, less than a third of September's (Bloomberg/Vortexa, 20 Dec 2023, read via a search
# summary). So about 80% of Russia's own gasoline exports stopped for 58 days (the rest went to the exempt EAEU
# members): 0.42 x 58/30 x 0.8 = 0.65 Mt. Low 0.40: cargoes brought forward into early September and caught up after
# 17 November (Bloomberg: exports ramped up in December). High 0.85: a rate of 0.48 Mt a month (5.76 Mt in 2023,
# another reported figure) and a 90% cut
GASOLINE_LOST = (0.40, 0.65, 0.85)
# Diesel (ULSD): seaborne diesel and gasoil were 1.7 Mt in 1-20 September, already about 30% below August because of
# refinery maintenance (Reuters, 21 Sep 2023); 1.1 Mt in 1-15 October, 20% below the same days of September, "due to
# ongoing seasonal maintenance of refineries and a fuel export ban" (Reuters, 17 Oct 2023), about 0.28 Mt less;
# Primorsk, the ULSD outlet, -22% to 330,000 t; the whole of October 2.55 Mt, -11% on September, so September was about
# 2.87 Mt and its last ten days were not lower (cargoes already cleared for export could still leave, Interfax). The
# second half of October was back at the September rate. Central 0.25 Mt (most of the early-October fall); low 0.10
# (most of it maintenance); high 0.50 (the whole measured fall plus diesel by rail and truck, still banned after 6
# October, Reuters 17 Nov 2023)
DIESEL_LOST = (0.10, 0.25, 0.50)
PRODUCTS_EXPORTS_2023 = 2.97  # mb/d (IEA, strike_supply_r51.json): the denominator, as round 51


# ------------------------------------------------------------------ the 2026 Druzhba halt (days, [low, central, high])
# Flows stopped on 27 January 2026 after a Russian strike near Brody (Ukraine's foreign minister, via The Moscow Times,
# 16 Feb 2026; Wikipedia) and came back at 2 a.m. on 23 April (Slovak economy ministry, via The Moscow Times; MOL: crude
# received at Fenyeslitke and Budkovce that day, "after a hiatus of nearly three months"). 27 January - 22 April = 86
# days. Low 80: part of it may have been made up later in the year. High 92: the restart ran below pre-halt volumes
# into May (intellinews, via Reuters). Russian crude by sea through Croatia's Adria pipeline was not obtained (JANAF
# asked for EU and US permits per cargo; Croatia shipped non-Russian crude, which does not reduce the Russian loss).
# Slovakia: 13,500 t a day on restart, 119,000 t to the end of April (Fico), about 4.9 Mt a year; before the halt about
# 0.45 Mt a month each for Hungary and Slovakia (industry sources via Reuters, 18 Jul 2024), so 86 days is about 1.3 Mt
# each. January 2026 flows averaged 150,000 b/d against about 200,000 in early 2022-2025 (The Moscow Times, 16 Feb 2026).
DRUZHBA_DAYS = {"2026": (80, 86, 92)}
DRUZHBA_BUYERS = ["HUN", "SVK"]
# 2026 = January to August (the map's period): the build compares the lost days with the days the pipeline flowed
PERIOD_DAYS = {"2026": 243}


NOT_OPENED = {"bloomberg_2023-12-20_fuel_exports.txt", "intellinews_2026-06_druzhba_normal.txt"}


def run() -> None:
    lost_mt = [round(g + d, 2) for g, d in zip(GASOLINE_LOST, DIESEL_LOST)]
    lost_mbd = [v * BBL_PER_T / 365 for v in lost_mt]
    out = {
        "generated": "2026-10-25",
        "what": "Round 52 (owner): forced losses of Russian supply that are not Ukraine's strikes (those are strike_supply_r51.json), by cause, as [low, central, high]. Each cause lowers the no-war level of the buyers it fell on, as round 51 does for the strikes: shift = actual - (baseline - lost). Buyers under their own embargo for that product, and buyers a ban exempted, get nothing.",
        "rule": "A country's figure reflects its own choices and the foreseeable answers to them. Things forced on it that it did not choose - Ukraine's strikes on Russian refineries, Russia's sudden export bans - count neither for it nor against it.",
        "causes": {
            "export_ban_2023": {
                "what": "Russia's ban on gasoline and diesel exports (Government decree No. 1537 of 21 September 2023); diesel by pipeline allowed again from 6 October, gasoline from 17 November 2023. Not in round 51 (it answered domestic prices, before the strike waves); round 51's 2023 strike loss is 0 (capped), so nothing is counted twice. The bans from March 2024 are in round 51 (through the strike pass-through) and not here.",
                "kind": "seaborne",
                "fuel": "products",
                "years": {
                    "2023": {
                        "gasoline_mt": list(GASOLINE_LOST),
                        "diesel_mt": list(DIESEL_LOST),
                        "lost_mt": lost_mt,
                        "lost_mbd": [round(v, 4) for v in lost_mbd],
                        "per_tonne_exported": [round(v / PRODUCTS_EXPORTS_2023, 4) for v in lost_mbd],
                        "actual_exports_mbd": PRODUCTS_EXPORTS_2023,
                        "ban_days": BAN_DAYS,
                    }
                },
                "exempt": BAN_EXEMPT,
                "embargo_counts": True,
                "source": {
                    "sid": "forced_ban_r52",
                    "name": "Russia's 2023 gasoline and diesel export ban: decree No. 1537 (21 Sep 2023), exemptions and the export volumes lost (Reuters/LSEG, Bloomberg/Vortexa, Interfax, Enerdata)",
                    "note": "the no-war level of buyers the ban cut off is lowered by the fuel it kept from them; see research/2026-10/gaps/forced_loss_r52-notes.md",
                    "links": [1, 4, 5, 3, 9, 8],
                },
            },
            "druzhba_2026": {
                "what": "The southern Druzhba pipeline to Hungary and Slovakia stopped from 27 January to 22 April 2026 after a Russian strike near Brody in Ukraine. Neither buyer chose it. Days of flow lost, on the buyer's own crude purchases that year, compared with the days the pipeline flowed.",
                "kind": "pipeline",
                "fuel": "crude",
                "buyers": {b: {"days": {k: list(v) for k, v in DRUZHBA_DAYS.items()}} for b in DRUZHBA_BUYERS},
                "period_days": PERIOD_DAYS,
                "not_counted": "CZE (stopped Russian crude by its own choice in April 2025); POL and DEU (northern branch, stopped by choice in 2023); BLR (upstream of Brody).",
                "source": {
                    "sid": "forced_druzhba_r52",
                    "name": "Druzhba south halted 27 January - 23 April 2026 after a Russian strike near Brody (Slovak economy ministry, MOL, Ukraine's foreign ministry; via The Moscow Times, oenergetice.cz, intellinews)",
                    "note": "Hungary's and Slovakia's no-war level of crude is lowered by the 86 days of flow they lost; see research/2026-10/gaps/forced_loss_r52-notes.md",
                    "links": [10, 11, 13, 14],
                },
            },
        },
        "not_counted": {
            "lukoil_transit_2024": "Ukraine's sanctions stopped Lukoil's crude through Druzhba to Hungary and Slovakia from 18 July 2024; other Russian suppliers (Tatneft, Russneft) took over and MOL took title at the Belarus-Ukraine border from September. No measured loss of volume; not counted.",
            "gas_transit_2025": "Ukraine ended Russian gas transit on 1 January 2025 (Slovakia, Austria, Moldova). Already shown as gas Russia's supply stopped ('without the gas Russia cut off itself', RUSSIA_GAS_CUT); not a baseline change this round.",
            "food_bans": "Russia's grain export ban to the EAEU (March-June 2022), its sugar ban (March-August 2022) and its rice ban (from July 2023) are sudden export bans too; they fall on goods the build does not split by product, so they are not counted. Left for a decision.",
        },
        "sources": [
            {"name": n, "url": u, "extract": f"raw/forced_loss_r52/{n}"}
            | ({"verified": "search summary only (page blocked automated access)"} if n in NOT_OPENED else {})
            for n, u, _ in SOURCES
        ],
    }
    (GAPS / "forced_loss_r52.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print("ban 2023 Mt", lost_mt, "per tonne", out["causes"]["export_ban_2023"]["years"]["2023"]["per_tonne_exported"])
    print("druzhba 2026 days", DRUZHBA_DAYS)


if __name__ == "__main__":
    fetch() if sys.argv[1:] == ["fetch"] else run()
