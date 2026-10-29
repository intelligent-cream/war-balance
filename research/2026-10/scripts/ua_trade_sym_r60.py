"""Round 60: purchases from Ukraine counted both ways, with Ukraine's own war-caused supply loss taken out.

Owner decision (round 60): buying less from Ukraine than without the war counts against a country, as buying more
already counts for it. What Ukraine could not export because of the war (blocked ports, occupied land, Mariupol's
steel works, power cuts) is forced on the buyer and counts neither way. So the expected (no-war) purchase of each
buyer is scaled, product group by product group, by what Ukraine actually managed to export:

    expected(c, t) = 2021 purchases of c (the site's base, 2021 held flat) x sum_p w(c, p) x R(p, t)
    R(p, t)        = Ukraine's exports of group p to all destinations in year t / in 2021 (EUR at current prices)
    w(c, p)        = group p's share of Ukraine's 2021 exports to c (Ukraine's own customs report, UN Comtrade)

In the site's volume terms (bmul, at pre-war prices) the supply factor is q(c, t) = pidx(c, 2021) x sum_p w R(p, t) /
pidx(c, t). Shortfall = actual - expected (negative = toward Russia), valued at Ukraine's net gain per euro (the
site's buy_ukr gain weights), signed and summed over 2022 to August 2026 (no floor).

Steps (from the repository root):

  python3 -I research/2026-10/scripts/ua_trade_sym_r60.py fetch
      downloads (untrusted data) into the scratchpad and writes small extracts with URL and retrieval date to
      research/2026-10/raw/ua_trade_sym_r60/
  python3 -I research/2026-10/scripts/ua_trade_sym_r60.py run
      reads the extracts, research/2026-10/gaps/net_gain_ukraine.json and site/data.json; writes
      research/2026-10/gaps/ua_trade_sym_r60.json and <scratch>/r60/patch.json (supply factors for the site model)
  python3 -I research/2026-10/scripts/ua_trade_sym_r60.py merge <before_after.json>
      adds the site model's before/after per country (scratchpad r60/ba.mjs, the site's own calc()) to the gaps file
"""

import gzip
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw" / "ua_trade_sym_r60"
GAPS = R / "gaps"
SITE = ROOT / "site"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r60")
DL = SCRATCH / "dl"
OUT = GAPS / "ua_trade_sym_r60.json"

COMTRADE = "https://comtradeapi.un.org/public/v1/preview/C/A/HS"
COMTRADE_M = "https://comtradeapi.un.org/public/v1/preview/C/M/HS"
PARTNERS = "https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json"
COMEXT = "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409"
ECB = "https://data-api.ecb.europa.eu/service/data/EXR/M.USD.EUR.SP00.A?startPeriod=2021-01&endPeriod=2026-08&format=csvdata"

YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
CT_YEARS = [2021, 2022, 2023, 2024]
GROUPS = (
    "grain",
    "oilseeds",
    "food_other",
    "iron_ore",
    "steel",
    "metals_other",
    "wood",
    "machinery",
    "chemicals",
    "other",
)
# the five countries with national measures on Ukrainian farm goods after the EU-wide measure ended (15 Sep 2023)
BAN5 = {"PL": "POL", "HU": "HUN", "SK": "SVK", "RO": "ROU", "BG": "BGR"}
BAN_PRODUCTS = ["TOTAL", "10", "12", "15", "1001", "1005", "1205", "1206", "2306", "04", "17", "11"]
# land neighbours that took the rerouted exports while the sea ports were blocked (route variant)
NEIGHBOURS = {"POL", "HUN", "SVK", "ROU", "MDA"}


def group_of(cmd: str) -> str:
    """Product group of an HS2 chapter or HS4 heading, as in net_gain_ukraine.json."""
    if cmd == "2306":
        return "oilseeds"
    if cmd == "2601":
        return "iron_ore"
    c = int(cmd[:2])
    if c == 10:
        return "grain"
    if c in (12, 15):
        return "oilseeds"
    if 1 <= c <= 24:
        return "food_other"
    if c in (72, 73):
        return "steel"
    if c == 26 or 74 <= c <= 83:
        return "metals_other"
    if c in (44, 94):
        return "wood"
    if 84 <= c <= 90:
        return "machinery"
    if 28 <= c <= 40:
        return "chemicals"
    return "other"


def get(url: str, tries: int = 4) -> bytes:
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0", "Accept": "*/*"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return r.read()
        except Exception as e:  # network retry
            if i == tries - 1:
                raise
            print("retry", url[:140], e, file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise RuntimeError


def cached(name: str, url: str) -> bytes:
    f = DL / name
    if not f.exists():
        f.write_bytes(get(url))
        time.sleep(1.0)
    return f.read_bytes()


def write_gz(path: Path, obj: dict) -> None:
    with gzip.open(path, "wt", encoding="utf-8") as f:
        json.dump(obj, f, separators=(",", ":"))


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    DL.mkdir(parents=True, exist_ok=True)
    today = time.strftime("%Y-%m-%d")
    # 1. Comtrade partner codes -> ISO3
    ref = json.loads(cached("partners.json", PARTNERS))["results"]
    codes = {str(r["PartnerCode"]): r.get("PartnerCodeIsoAlpha3") for r in ref if not r.get("isGroup")}
    (RAW / "comtrade_partner_codes.json").write_text(
        json.dumps({"url": PARTNERS, "retrieved": today, "m49_to_iso3": codes}, indent=0)
    )
    # 2. Ukraine's exports by partner and HS2 chapter (plus HS4 2306 oilcake, 2601 iron ore), 2021-2024, Ukraine's
    # own report (reporter 804). Partner 0 = World. Chapters batched three at a time (preview limit 500 rows)
    chapters = [f"{c:02d}" for c in range(1, 98) if c != 77]
    batches = [chapters[i : i + 3] for i in range(0, len(chapters), 3)] + [["2306", "2601"]]
    rows, queries = [], []
    for y in CT_YEARS:
        for b in batches:
            q = {"reporterCode": "804", "period": str(y), "flowCode": "X", "cmdCode": ",".join(b)}
            url = COMTRADE + "?" + urllib.parse.urlencode(q)
            d = json.loads(cached(f"ct_{y}_{'_'.join(b)}.json", url))
            n = 0
            for r in d.get("data") or []:
                if r.get("motCode") not in (0, None) or str(r.get("customsCode")) != "C00" or r.get("partner2Code"):
                    continue
                rows.append([y, r["partnerCode"], r["cmdCode"], r["primaryValue"]])
                n += 1
            queries.append({"url": url, "n": n})
            if n >= 500:
                print("warning: row limit hit", url, file=sys.stderr)
    write_gz(
        RAW / "comtrade_ua_exports_by_partner_hs2_2021_2024.json.gz",
        {
            "source": "UN Comtrade public preview API (no key); reporter Ukraine (804), flow X, all partners (0 = World)",
            "retrieved": today,
            "columns": ["year", "partner_m49", "cmd", "usd"],
            "queries": queries,
            "rows": rows,
        },
    )
    # 3. Ukraine's monthly exports to the world, 2021 (seasonal share of January-August); one period per call
    mon, urls = {}, []
    for m in range(1, 13):
        q = {"reporterCode": "804", "period": f"2021{m:02d}", "partnerCode": "0", "flowCode": "X", "cmdCode": "TOTAL"}
        url = COMTRADE_M + "?" + urllib.parse.urlencode(q)
        d = json.loads(cached(f"ct_monthly_2021{m:02d}.json", url))
        urls.append(url)
        for r in d.get("data") or []:
            if r.get("motCode") in (0, None) and not r.get("partner2Code"):
                mon[str(r["period"])] = r["primaryValue"]
    (RAW / "comtrade_ua_monthly_2021.json").write_text(
        json.dumps({"urls": urls, "retrieved": today, "what": "Ukraine's exports to World, USD, by month", "usd": mon})
    )
    # 4. Eurostat Comext: imports of the five countries with national bans from Ukraine, banned products
    ext = {
        "dataset": "DS-045409",
        "retrieved": today,
        "columns": ["freq", "reporter", "product", "indicator", "time", "value"],
        "urls": [],
        "rows": [],
    }
    for freq, times in (
        ("A", [str(y) for y in range(2019, 2026)]),
        ("M", [f"{y}-{m:02d}" for y in (2021, 2025, 2026) for m in range(1, 9)]),
    ):
        params = [("format", "JSON"), ("freq", freq), ("partner", "UA"), ("flow", "1")]
        params += [("reporter", r) for r in BAN5] + [("product", p) for p in BAN_PRODUCTS]
        params += [("indicators", "VALUE_IN_EUROS"), ("indicators", "QUANTITY_IN_100KG")] + [("time", t) for t in times]
        url = COMEXT + "?" + urllib.parse.urlencode(params)
        d = json.loads(cached(f"comext_{freq}.json", url))
        ext["urls"].append(url)
        dims = d["id"]
        idx = {k: {v: i for v, i in d["dimension"][k]["category"]["index"].items()} for k in dims}
        inv = {k: {i: v for v, i in idx[k].items()} for k in dims}
        size = d["size"]
        for flat, val in d["value"].items():
            n, pos = int(flat), {}
            for k, s in zip(reversed(dims), reversed(size)):
                pos[k] = inv[k][n % s]
                n //= s
            ext["rows"].append([freq, pos["reporter"], pos["product"], pos["indicators"], pos["time"], val])
    write_gz(RAW / "comext_ban5_imports_from_ua.json.gz", ext)
    # 5. ECB euro reference rate against the dollar, monthly
    csv = cached("ecb_usd.csv", ECB).decode()
    lines = [ln.split(",") for ln in csv.strip().splitlines()]
    h = lines[0]
    ti, vi = h.index("TIME_PERIOD"), h.index("OBS_VALUE")
    (RAW / "ecb_usd_monthly.json").write_text(
        json.dumps(
            {"url": ECB, "retrieved": today, "unit": "USD per EUR", "monthly": {r[ti]: float(r[vi]) for r in lines[1:]}}
        )
    )
    print("fetched", len(rows), "Comtrade rows,", len(ext["rows"]), "Comext rows")


# Ukraine's exports to the world, 2025 and January-August 2026, USD bn, and the product mix: the State Customs Service
# figures already used for net_gain_ukraine.json (see its mix_note; 2026 split estimated there, certainty C)
UA_TOTAL_2025, UA_TOTAL_2026_JA = 40.37, 26.70

RULE = (
    "Purchases from Ukraine count both ways. Expected = the buyer's 2021 purchases (the site's base, 2021 held flat) "
    "x, product group by group, Ukraine's actual exports to all destinations that year against 2021 (EUR, current "
    "prices): the buyer keeps its 2021 share of what Ukraine could actually sell. Buying more than that counts toward "
    "Ukraine, buying less toward Russia, at Ukraine's net gain per euro (the site's buy_ukr gain weights), signed and "
    "summed 2022 to August 2026 with no floor. Ukraine's own war-caused loss of exports (blocked ports, occupied land, "
    "Mariupol, power cuts) lowers the expected level and so counts neither way."
)
SOURCES = {
    "comtrade_ua": ["UN Comtrade, Ukraine's exports by partner and HS chapter 2021-2024 (reporter 804)", COMTRADE],
    "customs_ua": [
        (
            "State Customs Service of Ukraine via export.gov.ua and Interfax-Ukraine: exports 2025 and January-August "
            "2026 by product (as in research/2026-10/gaps/net_gain_ukraine.json mix_note)"
        ),
        "https://export.gov.ua/",
    ],
    "comext": ["Eurostat Comext DS-045409, imports from Ukraine of PL, HU, SK, RO, BG by product", COMEXT],
    "ecb": ["ECB euro reference rate, USD", ECB],
    "site": ["site/data.json buy_ukr (actual, base, pidx, gain), the site's own valuation", "site/data.json"],
    "bans_2023": [
        "Al Jazeera, 15 Sep 2023: Poland, Hungary, Slovakia keep national bans after the EU measure ends",
        "https://www.aljazeera.com/news/2023/9/15/poland-hungary-to-continue-ban-on-ukrainian-grain-after-eu-lifts-embargo",
    ],
    "bans_2026": [
        "TVP World, May 2026: Commission presses Poland, Hungary and Slovakia to lift Ukrainian grain bans",
        "https://tvpworld.com/93484811/-eu-urges-poland-hungary-slovakia-to-lift-ukraine-grain-import-bans",
    ],
    "romania_licences": [
        "Interfax, Oct 2023: Romania approves import licences for Ukrainian wheat, maize, sunflower seed, rapeseed",
        "https://interfax.com/newsroom/top-stories/95461/",
    ],
}
COUNTRY_NOTES = {
    "POL": "National ban on Ukrainian wheat, maize, rapeseed and sunflower seed since 16 Sep 2023 (still in force "
    "May 2026). Pre-war it bought almost none of them, so the ban costs little against the no-war level (four crops "
    "2024-2026: about EUR -0.10bn shortfall, -0.008bn at Ukraine's gain); it mostly removes the 2022-2023 surge.",
    "HUN": "National ban on 24 Ukrainian farm products since Sep 2023. Pre-war purchases of the banned crops were "
    "near zero, so the ban moves its figure by about 0.",
    "SVK": "National ban on wheat, maize, rapeseed, sunflower seed (and some other farm goods) since Sep 2023; "
    "pre-war purchases near zero.",
    "ROU": "Import licences since 13 Oct 2023 for wheat, maize, sunflower seed, rapeseed (processors only); "
    "imports of these stayed above their tiny 2021 level.",
    "BGR": "Ban until 15 Sep 2023, then lifted; four-crop purchases stayed above 2021.",
    "BLR": "Most of its shortfall is Ukraine's own embargo on trade with Belarus, an answer to Belarus hosting the "
    "invasion (counted here as a foreseeable answer to its own choice; neutralising it would remove EUR -0.16bn).",
    "CHN": "Largest charge: its share of Ukraine's grain and oilseeds fell after the Black Sea grain corridor ended "
    "(Jul 2023); part of that is shipping risk on the long route, a doubt (route variant: -0.34bn instead of -0.57bn).",
    "MDA": "Land neighbour: the route variant measures it against Ukraine's exports to the neighbours only.",
}


def load_json(p: Path) -> dict:
    if p.suffix == ".gz":
        with gzip.open(p, "rt", encoding="utf-8") as f:
            return json.load(f)
    return json.loads(p.read_text())


def fx_usd_per_eur() -> dict[str, float]:
    m = load_json(RAW / "ecb_usd_monthly.json")["monthly"]
    out = {}
    for y in YEARS:
        months = [f"{y}-{k:02d}" for k in range(1, 13 if y < 2026 else 9)]
        vals = [m[k] for k in months if k in m]
        out[str(y)] = sum(vals) / len(vals)
    return out


def ukraine_exports() -> tuple[dict, dict, dict]:
    """X[year][iso3][group] in USD (iso3 'WLD' = to all destinations), from Ukraine's own report 2021-2024."""
    codes = load_json(RAW / "comtrade_partner_codes.json")["m49_to_iso3"]
    d = load_json(RAW / "comtrade_ua_exports_by_partner_hs2_2021_2024.json.gz")
    x: dict = {}
    for y, partner, cmd, usd in d["rows"]:
        iso = "WLD" if partner == 0 else codes.get(str(partner))
        if not iso:
            continue
        g = group_of(cmd)
        cell = x.setdefault(y, {}).setdefault(iso, {k: 0.0 for k in GROUPS})
        if cmd in ("2306", "2601"):
            # the heading moves out of its chapter (23 -> oilseeds, 26 -> iron ore)
            cell[g] += usd
            cell[group_of(cmd[:2])] -= usd
        else:
            cell[g] += usd
    seas = load_json(RAW / "comtrade_ua_monthly_2021.json")["usd"]
    ja21 = sum(v for k, v in seas.items() if int(k[4:6]) <= 8)
    return x, {"ja_share_2021": ja21 / sum(seas.values())}, codes


def ratios(x: dict, extra: dict, ng: dict, fx: dict) -> dict:
    """R[variant][region][group][year]: exports in EUR against 2021. variant 'global' = to all destinations;
    'route' = to the land neighbours or to everyone else, by the buyer's region."""
    mix = ng["mix"]

    def eur(v, y):
        return v / fx[str(y)]

    world = {y: x[y]["WLD"] for y in CT_YEARS}
    nb = {y: {g: sum(x[y].get(i, {}).get(g, 0.0) for i in NEIGHBOURS) for g in GROUPS} for y in CT_YEARS}
    rest = {y: {g: world[y][g] - nb[y][g] for g in GROUPS} for y in CT_YEARS}
    tot21 = sum(world[2021].values())
    out: dict = {"global": {}, "route": {"nb": {}, "rest": {}}}
    for g in GROUPS:
        r = {}
        for y in CT_YEARS:
            r[str(y)] = eur(world[y][g], y) / eur(world[2021][g], 2021)
        # 2025: the Customs total split by the 2025 mix, against the 2021 Comtrade mix of the same note
        x25 = UA_TOTAL_2025 * 1e9 * mix["2025"][g]
        r["2025"] = eur(x25, 2025) / eur(tot21 * mix["2021"][g], 2021)
        # 2026: January-August at an annual rate, with 2021's seasonal share of January-August
        x26 = UA_TOTAL_2026_JA * 1e9 * mix["2026"][g] / extra["ja_share_2021"]
        r["2026"] = eur(x26, 2026) / eur(tot21 * mix["2021"][g], 2021)
        out["global"][g] = r
        for reg, src in (("nb", nb), ("rest", rest)):
            rr = {
                str(y): eur(src[y][g], y) / eur(src[2021][g], 2021) if src[2021][g] > 0 else r[str(y)] for y in CT_YEARS
            }
            for y in ("2025", "2026"):
                rr[y] = rr["2024"] * r[y] / r["2024"]
            out["route"][reg][g] = rr
    return out


def run() -> None:
    SCRATCH.mkdir(parents=True, exist_ok=True)
    ng = load_json(GAPS / "net_gain_ukraine.json")
    fx = fx_usd_per_eur()
    x, extra, _ = ukraine_exports()
    R_ = ratios(x, extra, ng, fx)
    D = load_json(SITE / "data.json")
    frac = D["frac"]
    world21 = x[2021]["WLD"]
    wmix = {g: v / sum(world21.values()) for g, v in world21.items()}
    countries, patch = {}, {}
    totals = {"actual": [0.0] * 6, "baseline": [0.0] * 6, "expected": [0.0] * 6}
    for iso, c in D["countries"].items():
        bu = c.get("buy_ukr")
        if not bu or not bu.get("base"):
            continue
        own = x[2021].get(iso)
        own_tot = sum(own.values()) if own else 0.0
        w = {g: own[g] / own_tot for g in GROUPS} if own_tot > 1e6 else dict(wmix)
        w = {g: max(0.0, v) for g, v in w.items()}
        sw = sum(w.values()) or 1.0
        w = {g: v / sw for g, v in w.items()}
        reg = "nb" if iso in NEIGHBOURS else "rest"
        base, pidx = bu["base"], bu.get("pidx") or [1.0] * 6
        bmul = bu.get("bmul") or [1.0] * 6
        A, Al, Ah = bu["years"], bu.get("years_lo") or bu["years"], bu.get("years_hi") or bu["years"]
        gain = bu.get("gain") or [[0.0] * 6] * 3
        rows, q = {}, {"global": [], "route": []}
        for i, y in enumerate(YEARS):
            S = {
                "global": sum(w[g] * R_["global"][g][str(y)] for g in GROUPS),
                "route": sum(w[g] * R_["route"][reg][g][str(y)] for g in GROUPS),
            }
            for v, qs in q.items():
                qs.append(round(pidx[0] * S[v] / pidx[i], 4) if i else 1.0)
            if not i:
                continue
            B = base * frac[i] * bmul[i] * pidx[i]
            E = {v: B * q[v][i] / bmul[i] for v in q}
            sh = A[i] - E["global"]
            combos = [(a - E[v]) * gain[k][i] for a in (Al[i], Ah[i]) for v in E for k in (0, 2)]
            rows[str(y)] = {
                "baseline": round(B, 5),
                "supply_factor": round(q["global"][i], 4),
                "supply_factor_route": round(q["route"][i], 4),
                "expected": round(E["global"], 5),
                "actual": round(A[i], 5),
                "shortfall": round(sh, 5),
                "gain_per_eur": gain[1][i],
                "value_at_gain": round(sh * gain[1][i], 5),
                "lo": round(min(combos), 5),
                "hi": round(max(combos), 5),
                "current_rule_vs_baseline": round((A[i] - B) * gain[1][i], 5),
            }
            totals["actual"][i] += A[i]
            totals["baseline"][i] += B
            totals["expected"][i] += E["global"]
        tv = sum(r["value_at_gain"] for r in rows.values())
        cur = sum(r["current_rule_vs_baseline"] for r in rows.values())
        countries[iso] = {
            "name": c.get("name_en") or c.get("name"),
            "mix_2021": {g: round(v, 4) for g, v in w.items()},
            "mix_source": "Ukraine's 2021 exports to it (UN Comtrade)" if own_tot > 1e6 else "Ukraine's world mix 2021",
            "region": reg,
            "notes": COUNTRY_NOTES.get(iso, ""),
            "sources": ["site", "comtrade_ua", "customs_ua", "ecb"]
            + (["comext", "bans_2023", "bans_2026"] if iso in ("POL", "HUN", "SVK") else [])
            + (["comext", "romania_licences"] if iso == "ROU" else [])
            + (["comext"] if iso == "BGR" else []),
            "years": rows,
            "total_2022_2026aug": {
                "actual": round(sum(r["actual"] for r in rows.values()), 4),
                "baseline": round(sum(r["baseline"] for r in rows.values()), 4),
                "expected": round(sum(r["expected"] for r in rows.values()), 4),
                "shortfall": round(sum(r["shortfall"] for r in rows.values()), 4),
                "value_at_gain": round(tv, 5),
                "current_part": round(max(0.0, cur), 5),
                "symmetric_without_supply_factor": round(cur, 5),
                "change_vs_current": round(tv - max(0.0, cur), 5),
            },
        }
        patch[iso] = q
    result = {
        "generated": time.strftime("%Y-%m-%d"),
        "units": "EUR bn at current prices (the site's 'cur' valuation); 2026 = January-August; value_at_gain = shortfall x "
        "Ukraine's net gain per euro (site buy_ukr gain, central); supply_factor = expected / baseline (real, the "
        "site's bmul multiplier); positive shortfall = bought more than expected (toward Ukraine), negative = less "
        "(toward Russia)",
        "fx_usd_per_eur": {k: round(v, 4) for k, v in fx.items()},
        "ukraine_export_ratio_vs_2021_eur": {
            v: (
                {g: {y: round(r, 4) for y, r in R_["global"][g].items()} for g in GROUPS}
                if v == "global"
                else {
                    reg: {g: {y: round(r, 4) for y, r in R_["route"][reg][g].items()} for g in GROUPS}
                    for reg in ("nb", "rest")
                }
            )
            for v in ("global", "route")
        },
        "ukraine_exports_usd_bn": {str(y): {g: round(x[y]["WLD"][g] / 1e9, 3) for g in GROUPS} for y in CT_YEARS},
        "ja_share_2021": round(extra["ja_share_2021"], 4),
        "world_totals_eur_bn": {k: [round(v, 3) for v in vals] for k, vals in totals.items()},
        "rule": RULE,
        "sources": SOURCES,
        "bans": bans(R_, ng),
        "countries": countries,
    }
    old = load_json(OUT) if OUT.exists() else {}
    for k in ("site_before_after", "site_before_after_summary"):
        if k in old:
            result[k] = old[k]
    OUT.write_text(json.dumps(result, indent=1, ensure_ascii=False) + "\n")
    (SCRATCH / "patch.json").write_text(json.dumps(patch))
    print("wrote", OUT, len(countries), "countries")


def bans(R_: dict, ng: dict) -> dict:
    """The five countries with national measures: imports from Ukraine of the four banned crops (wheat 1001, maize
    1005, rapeseed 1205, sunflower seed 1206) against their 2021 level x Ukraine's exports of the group."""
    d = load_json(RAW / "comext_ban5_imports_from_ua.json.gz")
    val: dict = {}
    for freq, rep, prod, ind, t, v in d["rows"]:
        if ind == "VALUE_IN_EUROS":
            val.setdefault(BAN5[rep], {}).setdefault(prod, {})[t] = v / 1e9
    gain = ng["groups"]
    out = {}
    for iso, prods in val.items():
        yrs = {}
        for y in range(2021, 2027):
            t = str(y) if y < 2026 else None
            row = {}
            for prod, grp in (("1001", "grain"), ("1005", "grain"), ("1205", "oilseeds"), ("1206", "oilseeds")):
                p = prods.get(prod, {})
                if y < 2026:
                    a, a21 = p.get(t, 0.0), p.get("2021", 0.0)
                    r = R_["global"][grp][str(y)]
                else:
                    a = sum(p.get(f"2026-{m:02d}", 0.0) for m in range(1, 9))
                    a21 = sum(p.get(f"2021-{m:02d}", 0.0) for m in range(1, 9))
                    r = R_["global"][grp]["2026"]
                e = a21 * r
                gc = gain[grp][str(y)]["central"]
                row[prod] = {"actual": round(a, 5), "expected": round(e, 5), "value_at_gain": round((a - e) * gc, 5)}
            tot = {k: round(sum(v[k] for v in row.values()), 5) for k in ("actual", "expected", "value_at_gain")}
            yrs[str(y)] = {
                "products": row,
                "four_crops": tot,
                "total_all_goods": round(
                    prods.get("TOTAL", {}).get(t, 0.0)
                    if t
                    else sum(prods.get("TOTAL", {}).get(f"2026-{m:02d}", 0.0) for m in range(1, 9)),
                    4,
                ),
                "grain_ch10": round(prods.get("10", {}).get(t, 0.0), 4) if t else None,
                "oilseeds_ch12": round(prods.get("12", {}).get(t, 0.0), 4) if t else None,
            }
        out[iso] = yrs
    return out


def merge(path: str) -> None:
    res = load_json(OUT)
    ba = json.loads(Path(path).read_text())
    res["site_before_after"] = ba["countries"]
    res["site_before_after_summary"] = ba["summary"]
    OUT.write_text(json.dumps(res, indent=1, ensure_ascii=False) + "\n")
    print("merged", len(ba["countries"]))


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "fetch":
        fetch()
    elif cmd == "run":
        run()
    elif cmd == "merge":
        merge(sys.argv[2])
