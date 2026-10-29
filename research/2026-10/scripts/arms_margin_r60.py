"""Round 60: the seller's gain on weapons sold to Russia (Iran, North Korea, Belarus, China), per supplier and item.

The site counts paid deliveries to Russia at "net gain x genuinely extra" (pipeline/build_data.py,
apply_military_payment). Today every new-production item takes the OECD median net gain on weapons (0.051), which is
the excess profit of a Western arms maker selling at market prices. This script proposes item-level gain rates from
price-versus-cost evidence (leaked Alabuga contract, Shahed unit costs, North Korean shell prices) and recomputes what
each supplier's counted amount would become, with the pipeline's own formula and quadrature bands.

Research only: reads research/2026-10/gaps/{military_rus_r6, military_payment_r13, north_korea_r24, value_kept,
net_gain_sellers}.json; writes research/2026-10/gaps/arms_margin_r60.json. Nothing in the pipeline reads it.

Run (from the repository root, isolated mode; pages are downloads and are read as data only):
  python -I research/2026-10/scripts/arms_margin_r60.py extract <directory with the downloaded .html pages>
  python -I research/2026-10/scripts/arms_margin_r60.py build
"""

import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
R = ROOT / "research" / "2026-10"
GAPS = R / "gaps"
RAW = R / "raw" / "arms_margin_r60"
OUT = GAPS / "arms_margin_r60.json"
RETRIEVED = "2026-10-29"
YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
BANDS = ("low", "central", "high")

# downloaded page -> (url, regex of the passages kept in the extract)
PAGES = {
    "twz": (
        "https://www.twz.com/news-features/what-does-a-shahed-136-really-cost",
        r"\$375,000|48\.800|165,500|quite realistic|L-550 costs|13,580|two million grams",
    ),
    "defone": (
        "https://www.defenseone.com/threats/2024/02/russia-may-be-trying-build-10000-attack-drones-year-use-ukraine/394015/",
        r"six times|10 percent of components",
    ),
    "militarnyi": (
        "https://militarnyi.com/en/news/the-cost-of-shahed-136-for-russia-has-been-reported/",
        r"193|1\.75|48[.,]8|localization|localisation",
    ),
    "statewatch": (
        "https://statewatch.org.ua/en/publications/novynu/sanktsii/russia-pays-iran-for-drones-with-gold-bars/",
        r"104 million|1\.79 tons|more than 2 tons|dirhams",
    ),
    "aljaz": (
        "https://www.aljazeera.com/news/2025/9/18/north-korea-getting-a-raw-deal-on-support-for-russias-war-report",
        r"less than \$1bn|\$457m",
    ),
    "kyivpost": ("https://www.kyivpost.com/post/41325", r"Low-Range Estimate|\$1\.72 billion and"),
    "rhm": (
        "https://www.rheinmetall.com/en/media/news-watch/news/2025/03/2025-03-12-rheinmetall-financial-figures-fiscal-year-2024",
        r"Operating result almost doubled|operating margin of|28\.4",
    ),
}

# Proposed gain per euro of the delivered value (price minus the seller's full cost, as a share of the price): the same
# concept as net_gain_sellers.json (profit above a normal return plus taxes), estimated from price and cost evidence
# because none of these suppliers is in OECD STAN. "stock_blend" = outdated share x gain on outdated + rest x gain on rest.
PROPOSED = {
    "IRN": {
        "drones_direct_2022_23": {
            "rate": {"low": 0.45, "central": 0.7, "high": 0.85},
            "basis": "price USD 150k (model; 50-290k) vs Iranian unit cost about USD 50k (TWZ: 'quite realistic'; "
            "engine alone USD 12-17k; sanctions procurement premium); low = cost 80k on price 150k",
        },
        "alabuga_contract_drones_licence": {
            "rate": {"low": 0.6, "central": 0.8, "high": 0.9},
            "basis": "USD 1.75bn for licence, technology, equipment, software and a per-unit 'licensing and component "
            "fee' of USD 193k (Defense One: six times the drone's estimated cost; about 10% of components from abroad); "
            "the plan was full localisation with minimal Iranian components (Russian unit cost USD 48.8k). Iran's own "
            "costs (early kits, engines, equipment, engineers) judged USD 0.2-0.6bn of 1.75bn",
        },
        "missiles_ballistic_and_sam": {
            "rate": {"low": 0.15, "central": 0.35, "high": 0.6},
            "basis": "no unit cost or price is public (Fath-360, Fateh-110). A state monopoly selling to a buyer with "
            "few alternatives: at least a Western ammunition maker's operating margin in a seller's market "
            "(Rheinmetall Weapon & Ammunition 28.4% in 2024, 29% in 2025; low 0.15 = typical defence operating "
            "margin), centre a third, high if the price was near Russian prices for comparable missiles",
        },
        "ammunition": {
            "rate": {"low": 0.15, "central": 0.35, "high": 0.6},
            "basis": "as missiles: largely shells from Iran's stocks; no outdated-share evidence, so no stock blend",
        },
    },
    "PRK": {
        "artillery_ammunition": {
            "stock_blend": {
                "outdated_share": {"low": 0.3, "central": 0.5, "high": 0.6},
                "gain_on_outdated": {"low": 0.7, "central": 0.9, "high": 1.0},
                "gain_on_rest": {"low": 0.15, "central": 0.35, "high": 0.6},
            },
            "basis": "outdated half unchanged (military_payment_r13). The rest is valued at Russian procurement "
            "prices (USD 400/800/1,100 per round) but produced by a state monopoly with near-zero wages; the price "
            "estimates for North Korean shells start at USD 150-300 (Guseinova, low case), so a cost of 250-500 on a "
            "price of 800 gives 0.4-0.7; centre set lower (0.35) because steel, explosives and propellant are "
            "imported or scarce and the stock must be replaced at that cost",
        },
        "artillery_systems": {"same_as": "artillery_ammunition", "basis": "treated as stock, as in round 13"},
        "ballistic_missiles": {
            "rate": {"low": 0.15, "central": 0.35, "high": 0.6},
            "basis": "KN-23/24, new production valued at USD 1.5/2.5/3.5m; no cost evidence; as Iran's missiles",
        },
    },
}


# The site's own model (index.html calc() and chance(), site/data.json generated 2026-10-27) run with Iran's and North
# Korea's military_rus years / years_lo / years_hi / years_paid replaced by this file's series (scratchpad loader,
# not part of this script). Net = the site's net position, 2022 to Aug 2026, % of 2024 GDP; chance = probability of
# the side shown.
EFFECT = {
    "how": "site model (calc, chance) on site/data.json of 2026-10-27, military_rus series replaced; full-value 'alt' "
    "series unchanged",
    "IRN": {
        "current": {"mil_eur_bn": -0.108, "net_pct_gdp": -0.03, "chance_net_russia": 0.837, "uncertain": True},
        "proposed": {"mil_eur_bn": -1.227, "net_pct_gdp": -0.29, "chance_net_russia": 0.995, "uncertain": False},
        "proposed_extra_09": {
            "mil_eur_bn": -1.840,
            "net_pct_gdp": -0.44,
            "chance_net_russia": 0.999,
            "uncertain": False,
        },
    },
    "PRK": {
        "current": {"mil_eur_bn": -3.333, "net_pct_gdp": -11.34, "chance_net_russia": 0.999, "uncertain": False},
        "proposed": {"mil_eur_bn": -4.203, "net_pct_gdp": -14.28, "chance_net_russia": 0.999, "uncertain": False},
        "proposed_extra_09": {
            "mil_eur_bn": -5.867,
            "net_pct_gdp": -19.91,
            "chance_net_russia": 0.999,
            "uncertain": False,
        },
    },
}


def load(p: Path) -> dict:
    return json.loads(p.read_text(encoding="utf-8"))


def page_text(p: Path) -> str:
    t = p.read_text(encoding="utf-8", errors="replace")
    t = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", t)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    return re.sub(r"\s+", " ", t)


def extract(src: Path) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    for name, (url, pat) in PAGES.items():
        f = src / f"{name}.html"
        if not f.exists():
            print("missing", f)
            continue
        t = page_text(f)
        seen, out = set(), []
        for m in re.finditer(pat, t, re.IGNORECASE):
            a, b = max(0, m.start() - 350), min(len(t), m.end() + 350)
            if any(abs(a - s) < 300 for s in seen):
                continue
            seen.add(a)
            out.append("..." + t[a:b] + "...")
        head = f"URL: {url}\nRetrieved: {RETRIEVED}\nPassages matching: {pat}\n\n"
        (RAW / f"{name}.txt").write_text(head + "\n\n".join(out) + "\n", encoding="utf-8")
        print(name, len(out))


def scaled_items() -> dict:
    """military_rus_r6 items, with North Korea's arms rescaled to north_korea_r24's full value (as the pipeline's
    military_rus_scaled)."""
    mr = load(GAPS / "military_rus_r6.json")["countries"]
    nk = load(GAPS / "north_korea_r24.json")
    items = mr["PRK"]["by_item_eur_bn"]
    arms = [k for k in items if k != "troops"]
    for b in BANDS:
        troops = sum(v.get(b, 0) for v in items["troops"].values())
        now = sum(v.get(b, 0) for k in arms for v in items[k].values())
        f = (nk["full_value_eur_bn"][b] - troops) / now
        for k in arms:
            for v in items[k].values():
                v[b] = v[b] * f
    return {iso: mr[iso]["by_item_eur_bn"] for iso in ("IRN", "PRK", "BLR")}


def gains(iso: str, m: dict, wg: dict, proposed: bool) -> dict:
    """gain rate per item and band"""
    out = {}
    sg = m.get("stock_gain")
    for name, kind in m["items"].items():
        if kind == "pay":
            continue
        p = PROPOSED.get(iso, {}).get(name) if proposed else None
        if p and "same_as" in p:
            p = PROPOSED[iso][p["same_as"]]
        r = {}
        for b in BANDS:
            if p and "rate" in p:
                r[b] = p["rate"][b]
            elif p and "stock_blend" in p:
                s = p["stock_blend"]
                r[b] = (
                    s["outdated_share"][b] * s["gain_on_outdated"][b]
                    + (1 - s["outdated_share"][b]) * s["gain_on_rest"][b]
                )
            elif kind == "stock" and sg:
                r[b] = sg["outdated_share"][b] * sg["gain_on_outdated"][b] + (1 - sg["outdated_share"][b]) * wg[b]
            else:
                r[b] = wg[b]
        out[name] = r
    return out


def counted(iso: str, items: dict, m: dict, g: dict, ex: dict) -> dict:
    """apply_military_payment's formula: per year central, quadrature low/high, and the paid (sold) part"""
    paid = m["paid"]
    res = {"years": [], "years_lo": [], "years_hi": [], "years_paid": [], "full": []}
    for y in YEARS:
        mid = lo2 = hi2 = sold = full = 0.0
        for name, kind in m["items"].items():
            v = (items.get(name) or {}).get(str(y)) or {}
            vc = v.get("central") or 0.0
            full += vc
            if kind == "pay":
                mid += vc
                sold += vc
                lo2 += (vc - (v.get("low") or vc)) ** 2
                hi2 += ((v.get("high") or vc) - vc) ** 2
                continue
            gg = g[name]

            def val(vv: float, pp: float, ga: float, ee: float) -> float:
                return vv * (pp * ga * ee + (1 - pp))

            f = val(vc, paid["central"], gg["central"], ex["central"])
            mid += f
            sold += vc * paid["central"] * gg["central"] * ex["central"]
            for alt in (
                val(v.get("low") or vc, paid["central"], gg["central"], ex["central"]),
                val(v.get("high") or vc, paid["central"], gg["central"], ex["central"]),
                val(vc, paid["low"], gg["central"], ex["central"]),
                val(vc, paid["high"], gg["central"], ex["central"]),
                val(vc, paid["central"], gg["low"], ex["low"]),
                val(vc, paid["central"], gg["high"], ex["high"]),
            ):
                d = alt - f
                if d < 0:
                    lo2 += d * d
                else:
                    hi2 += d * d
        res["years"].append(round(mid, 5))
        res["years_paid"].append(round(sold, 5))
        res["years_lo"].append(round(max(0.0, mid - math.sqrt(lo2)), 5))
        res["years_hi"].append(round(mid + math.sqrt(hi2), 5))
        res["full"].append(round(full, 5))
    res["total"] = {k: round(sum(res[k]), 4) for k in ("years", "years_lo", "years_hi", "years_paid", "full")}
    return res


def build() -> None:
    mp = load(GAPS / "military_payment_r13.json")["countries"]
    wg = load(GAPS / "net_gain_sellers.json")["oecd_median"]["weapons"]
    vk = load(GAPS / "value_kept.json")["countries"]
    items = scaled_items()
    out = {
        "generated": RETRIEVED,
        "meta": {
            "what": "Round 60 (research only): the seller's gain on weapons sold to Russia, by supplier and item, from "
            "price-versus-cost evidence, replacing the OECD median weapons gain (0.051; 0.027-0.100) for Iran and "
            "North Korea. Same concept as net_gain_sellers.json: price minus the seller's full cost incl. a normal "
            "return, as a share of the price",
            "formula": "counted = value x (paid x gain x extra + (1 - paid)); troops' pay in full (pipeline "
            "apply_military_payment, unchanged)",
            "extra": "value_kept.json flowback_weapons extra (0.4/0.6/0.8) kept; scenario 'extra_09' sets it to "
            "0.8/0.9/1.0 for Iran and North Korea, whose sales exist only because of the war",
            "script": "research/2026-10/scripts/arms_margin_r60.py",
        },
        "proposed": PROPOSED,
        "current_gain": {"weapons_oecd_median": wg, "PRK_stock": mp["PRK"].get("stock_gain")},
        "effect_site_model": EFFECT,
        "sources": [
            {"page": k, "url": u, "retrieved": RETRIEVED, "extract": f"research/2026-10/raw/arms_margin_r60/{k}.txt"}
            for k, (u, _) in PAGES.items()
        ],
        "countries": {},
    }
    for iso in ("IRN", "PRK", "BLR"):
        m = mp[iso]
        ex = ((vk.get(iso) or {}).get("flowback_weapons") or {}).get("extra") or {
            "low": 0.4,
            "central": 0.6,
            "high": 0.8,
        }
        g0, g1 = gains(iso, m, wg, False), gains(iso, m, wg, True)
        ex9 = {"low": 0.8, "central": 0.9, "high": 1.0}
        row = {
            "gain_current": g0,
            "gain_proposed": g1,
            "current": counted(iso, items[iso], m, g0, ex),
            "proposed": counted(iso, items[iso], m, g1, ex),
            "proposed_extra_09": counted(iso, items[iso], m, g1, ex9),
        }
        # value-weighted gain rate over the sold items (central)
        for k, g in (("weighted_gain_current", g0), ("weighted_gain_proposed", g1)):
            tot = sum((items[iso][n].get(str(y)) or {}).get("central", 0) for n in g for y in YEARS)
            row[k] = {
                b: round(
                    sum(g[n][b] * sum((items[iso][n].get(str(y)) or {}).get("central", 0) for y in YEARS) for n in g)
                    / tot,
                    4,
                )
                for b in BANDS
            }
        out["countries"][iso] = row
        c, p, p9 = row["current"]["total"], row["proposed"]["total"], row["proposed_extra_09"]["total"]
        print(
            iso,
            "full",
            c["full"],
            "counted now",
            c["years"],
            "proposed",
            p["years"],
            f"({p['years_lo']}-{p['years_hi']})",
            "extra0.9",
            p9["years"],
        )
    OUT.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")
    print("wrote", OUT)


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "extract":
        extract(Path(sys.argv[2]))
    elif len(sys.argv) >= 2 and sys.argv[1] == "build":
        build()
    else:
        sys.exit(__doc__)
