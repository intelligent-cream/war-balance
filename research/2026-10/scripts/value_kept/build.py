# ruff: noqa
"""Round 6 research script for value_kept.json (value kept = OECD TiVA domestic value added share; genuinely extra).
Moved into the repository in round 13 (audit M8). Inputs: research/2026-10/raw/oecd_tiva/. Order: exposure.py, build.py,
compare.py, finalize.py. Round 13 keeps value_kept.json's genuinely extra factors; the value kept is replaced by
net_gain_sellers.json (scripts/net_gain_sellers.py).

Round 29 (audit 29, item 1): the list of economies comes from gaps/energy.json (the same 231 economies as the map and
gaps-input.json), no longer from site/data.json, so this research step does not read the pipeline's own output.
exposure.py, compare.py and finalize.py still read site/data.json, but only for the "comparison_top15" and
"sanity_checks" sections of value_kept.json (a report on the round-6 map); build_data.py reads only the per-country
factors, which this script writes from the TiVA downloads."""

import csv, collections, json, math

B = str(__import__("pathlib").Path(__file__).resolve().parent) + "/"
ISO = sorted(
    json.load(open(str(__import__("pathlib").Path(__file__).resolve().parents[2] / "gaps" / "energy.json")))[
        "countries"
    ]
)
tiva = collections.defaultdict(dict)
RAW = str(__import__("pathlib").Path(__file__).resolve().parents[2] / "raw" / "oecd_tiva") + "/"
for f in ("dva.csv", "dva2.csv"):
    for r in csv.DictReader(open(RAW + f)):
        tiva[(r["REF_AREA"], r["ACTIVITY"])][int(r["TIME_PERIOD"])] = float(r["OBS_VALUE"]) / 100
COVER = sorted({a for a, _ in tiva if len(a) == 3 and a not in ("W_O", "WXD", "EU15", "G20")})


def stat(area, act):
    s = tiva.get((area, act))
    if not s:
        return None
    c = (s[2021] + s[2022]) / 2
    return {"low": min(s.values()), "central": c, "high": max(s.values())}


def mean_areas(areas, act):
    v = [stat(a, act) for a in areas if stat(a, act)]
    return {k: sum(x[k] for x in v) / len(v) for k in ("low", "central", "high")}


REG = {
    "cee_balkans": (
        ["EU28XEU15"],
        "TiVA aggregate EU28XEU15 (central and eastern EU members)",
        "ALB BIH MKD MNE SRB MDA".split(),
    ),
    "micro_europe": (
        ["LUX", "MLT", "ISL", "CYP"],
        "mean of LUX, MLT, ISL, CYP (small open European economies)",
        "AND MCO SMR LIE VAT GIB FRO GRL".split(),
    ),
    "cis": (["KAZ", "BLR", "UKR"], "mean of KAZ, BLR, UKR", "ARM GEO AZE KGZ TJK UZB TKM MNG".split()),
    "oil_me_africa": (["SAU"], "Saudi Arabia (oil exporter)", "KWT QAT OMN IRQ IRN LBY DZA GNQ GAB COG".split()),
    "other_me": (["JOR", "EGY"], "mean of JOR, EGY", "BHR LBN PSE SYR YEM".split()),
    "africa": (
        ["ZAF", "NGA", "EGY", "MAR", "TUN", "CIV", "CMR", "SEN", "AGO", "COD"],
        "mean of 10 African TiVA countries",
        "BDI BEN BFA BWA CAF CPV COM DJI ERI ESH ETH GHA GIN GMB GNB KEN LBR LSO MDG MLI MOZ MRT MUS MWI NAM NER RWA SDN SLE SOM SSD SWZ TCD TGO TZA UGA ZMB ZWE SYC SHN".split(),
    ),
    "latam": (
        ["ARG", "BRA", "CHL", "COL", "CRI", "MEX", "PER"],
        "mean of 7 Latin American TiVA countries",
        "BOL ECU PRY URY VEN GTM HND SLV NIC PAN DOM CUB JAM TTO GUY SUR BLZ HTI".split(),
    ),
    "small_island": (
        ["MLT", "CYP", "ISL", "NZL"],
        "mean of MLT, CYP, ISL, NZL (island economies), range widened",
        "ABW AIA ATG BHS BRB BES BLM BMU CUW CYM DMA GRD KNA LCA MSR SXM TCA VCT VGB FJI PNG SLB VUT WSM TON KIR TUV NRU FSM MHL PLW COK NIU TKL NCL PYF WLF ASM GUM MNP ATA ATF BVT CCK CXR FLK IOT NFK PCN SGS SPM UMI MDV".split(),
    ),
    "south_asia": (["IND", "PAK", "BGD"], "mean of IND, PAK, BGD", "AFG BTN LKA NPL TLS".split()),
    "east_asia_other": (["CHN", "HKG"], "mean of CHN, HKG", "MAC PRK".split()),
}
proxy = {}
for k, (areas, label, members) in REG.items():
    for m in members:
        proxy[m] = (areas, label)


def vk(iso, act, widen=0.0):
    if iso in COVER and stat(iso, act):
        s = stat(iso, act)
        src = f"OECD TiVA 2025, {iso} {act}"
    else:
        areas, label = proxy.get(iso, (["W_O"], "TiVA rest of world"))
        s = mean_areas(areas, act)
        src = f"regional proxy: {label} ({act})"
        widen += 0.07
    return {
        "low": max(0.05, s["low"] - 0.03 - widen),
        "central": s["central"],
        "high": min(0.98, s["high"] + 0.03 + widen),
    }, src


def blend(parts):  # parts: list of (weight, triple)
    return {k: sum(w * t[k] for w, t in parts) for k in ("low", "central", "high")}


def clip(t):
    return {k: round(min(1, max(0, v)), 3) for k, v in t.items()}


def product(v, x):
    c = v["central"] * x["central"]
    lo = c * math.exp(-math.sqrt(math.log(v["central"] / v["low"]) ** 2 + math.log(x["central"] / x["low"]) ** 2))
    hi = c * math.exp(math.sqrt(math.log(v["high"] / v["central"]) ** 2 + math.log(x["high"] / x["central"]) ** 2))
    return {"low": round(lo, 3), "central": round(c, 3), "high": round(min(hi, v["high"] * x["high"], 1), 3)}


T = lambda l, c, h: {"low": l, "central": c, "high": h}

# ---------- weapons: value kept ----------
WEAP_ACTS = ["C25", "C26", "C28", "C302T309"]
# defence-specific overrides (central, low, high) with reasons; applied instead of the TiVA proxy
WEAP_OVR = {
    "USA": (
        T(0.85, 0.90, 0.94),
        "DFARS domestic-content rule (65% minimum 2024-28, most major munitions far above), TiVA USA C25/C26/C302T309 87-95%",
    ),
    "CZE": (
        T(0.40, 0.55, 0.70),
        "Czech-exported ammunition includes refurbished foreign stocks and foreign-made shells passing through Czech firms (CSG: own production, partner production abroad and bought stockpiles); TiVA CZE metals/machinery ~58%",
    ),
    "TUR": (
        T(0.60, 0.72, 0.82),
        "official local-content claim 82-83% (SSB, 2024-25), engines/electronics imported (MEF); TiVA TUR proxies ~66%",
    ),
    "KOR": (
        T(0.62, 0.72, 0.82),
        "DAPA target 70-90% component localisation, core components ~65% (2025); TiVA KOR proxies ~70%",
    ),
    "ISR": (T(0.65, 0.78, 0.88), "large domestic defence sector; TiVA ISR C26 85%"),
    "FRA": (T(0.65, 0.75, 0.85), "sovereign supply chains (Nexter/KNDS, MBDA, Thales); TiVA FRA proxies ~70%"),
    "GBR": (T(0.62, 0.75, 0.85), "TiVA GBR proxies ~78%; some US content (e.g. NLAW parts, Starstreak)"),
    "DEU": (T(0.62, 0.72, 0.82), "TiVA DEU proxies ~70%; Rheinmetall/KMW/Diehl largely domestic or EU supply chains"),
    "SWE": (T(0.55, 0.68, 0.80), "TiVA SWE C302T309 81% but CV90/Archer/Gripen use foreign engines and parts"),
    "NOR": (T(0.50, 0.63, 0.75), "NASAMS uses US AMRAAM missiles: Kongsberg share of the system value lower"),
    "BGR": (
        T(0.55, 0.68, 0.80),
        "ammunition from domestic plants (VMZ, Arsenal) with imported propellant/explosive inputs; TiVA BGR C25 53% is below a defence plant with own powder production",
    ),
    "SRB": (T(0.55, 0.68, 0.80), "ammunition from domestic plants (Krusik, Sloboda, PPU) with some imported inputs"),
    "POL": (
        T(0.55, 0.66, 0.78),
        "PGZ (Krab, Piorun, ammunition) with imported chassis parts/engines; TiVA POL proxies ~56%",
    ),
    "SVK": (T(0.45, 0.58, 0.70), "ZVS/MSM ammunition and Zuzana howitzers; MSM also trades foreign stocks"),
    "ITA": (T(0.60, 0.72, 0.82), "Leonardo/MBDA Italia; TiVA ITA proxies ~72%"),
    "ESP": (T(0.55, 0.68, 0.80), "Rheinmetall Expal (155mm) with domestic powder; TiVA ESP proxies ~69%"),
    "FIN": (T(0.55, 0.66, 0.78), "Patria, Nammo Lapua; TiVA FIN proxies ~62%"),
    "CAN": (T(0.55, 0.65, 0.75), "GDLS-Canada LAVs (US powerpacks), TiVA CAN proxies ~66%"),
    "AUS": (T(0.55, 0.68, 0.80), "Bushmaster (Thales Australia), TiVA AUS ~77%"),
    "JPN": (T(0.70, 0.80, 0.88), "highly domestic defence supply chain"),
    "ZAF": (T(0.55, 0.68, 0.80), "Rheinmetall Denel Munition, domestic plants"),
    "PAK": (T(0.55, 0.68, 0.80), "POF ammunition, domestic plants"),
}


def weapons_vk(iso):
    if iso in WEAP_OVR:
        t, why = WEAP_OVR[iso]
        return t, "defence-specific: " + why
    parts = [vk(iso, a)[0] for a in WEAP_ACTS]
    t = blend([(0.25, p) for p in parts])
    src = vk(iso, "C25")[1].replace("C25", "mean of C25, C26, C28, C302T309")
    # widen: TiVA has no defence industry
    return {
        "low": t["central"] - 0.12,
        "central": t["central"],
        "high": min(0.95, t["central"] + 0.10),
    }, src + "; widened because TiVA has no defence industry"


# ---------- weapons: genuinely extra ----------
X_WEAP = {
    "USA": (
        T(0.50, 0.70, 0.85),
        "US 155mm output ~14,000/month (2022) -> ~36,000-40,000 (2025-26); GMLRS, Javelin, PAC-3 lines expanded with Ukraine supplementals; some delivery delays for other buyers (Taiwan backlog USD 18.7bn, contested) and full employment 2022-23 lower the share",
    ),
    "DEU": (
        T(0.45, 0.65, 0.85),
        "Rheinmetall 155mm capacity from ~70,000 (2022, company statements) to ~700,000 (2025) rounds; IRIS-T and Gepard ammunition lines restarted; early deliveries displaced or delayed other buyers",
    ),
    "CZE": (
        T(0.55, 0.75, 0.90),
        "brokerage and refurbishment of stocks that would otherwise have been idle or scrapped; plant expansions (CSG, Explosia)",
    ),
    "BGR": (
        T(0.50, 0.70, 0.85),
        "defence exports EUR ~0.6bn/yr pre-war -> 1.7-2.8bn (2022-25); plants (VMZ, Arsenal) moved to 3-shift work; some prior buyers (Middle East, US Syria programmes) displaced",
    ),
    "SRB": (
        T(0.40, 0.60, 0.80),
        "sales via intermediaries filled spare capacity; some displacement of traditional buyers",
    ),
    "KOR": (
        T(0.40, 0.60, 0.80),
        "shells sold to the US to replenish its stocks; Korean plants also serving domestic and Polish orders",
    ),
    "TUR": (T(0.40, 0.60, 0.80), "MKE/Baykar sales; Turkish industry was expanding anyway for export markets"),
    "POL": (T(0.40, 0.60, 0.80), "Krab/Piorun lines expanded but also compete with Polish rearmament orders"),
    "NOR": (T(0.45, 0.65, 0.85), "NASAMS/Nammo lines expanded; long backlogs"),
}
X_WEAP_DEFAULT = (
    T(0.40, 0.60, 0.80),
    "default: war-driven capacity growth in Western defence industry (ammunition, air defence); low end allows for displaced other buyers and crowding-out at full employment",
)

# ---------- sales to Russia lost: share NOT redirected ----------
X_LOST = {
    "FIN": (
        T(0.15, 0.30, 0.50),
        "VATT (2023): turnover of Finnish firms that exported to Russia almost unchanged after 2022, exports redirected; Bank of Finland (2024): limited effect on most sectors; small, dependent firms hit",
    ),
    "EST": (T(0.25, 0.45, 0.65), "small, Russia-dependent firms and border trade; transit lost; harder to redirect"),
    "LVA": (T(0.25, 0.45, 0.65), "as Estonia"),
    "LTU": (T(0.25, 0.45, 0.65), "as Estonia (re-exports already removed by baltic_transit())"),
    "POL": (T(0.20, 0.40, 0.60), "food and machinery; partly redirected to EU and Ukraine"),
}
LARGE = "DEU FRA ITA NLD BEL AUT ESP CHE SWE DNK GBR USA JPN KOR CAN IRL NOR LUX".split()
COMMOD = "PRY BRA ARG ECU CHL NZL URY AUS ZAF PER COL CRI".split()
X_LOST_LARGE = (
    T(0.20, 0.35, 0.55),
    "large diversified exporters: Haidar (2017) finds two-thirds of sanctioned exports redirected; 2022-23 demand for machinery and cars was supply-constrained, so lost Russian orders were resold",
)
X_LOST_COMMOD = (
    T(0.10, 0.20, 0.40),
    "commodity exporters (food, fruit, meat): fungible goods resold on world markets at small discounts",
)
X_LOST_DEFAULT = (
    T(0.25, 0.40, 0.60),
    "default: about one-third to two-thirds redirected (Haidar 2017; Crozet & Hinz 2020 find large losses on non-targeted goods after 2014)",
)

# ---------- extra sales to Russia: additionality ----------
X_EXTRA = {
    "CHN": (
        T(0.40, 0.60, 0.80),
        "cars and machinery from under-used capacity (car exports to Russia 0.16m units 2022 -> ~1.2m 2024, then -58% in 2025 and partly sent to Mexico/UAE): demand-constrained economy, so largely additional, but some output would have been exported elsewhere",
    ),
    "TUR": (
        T(0.25, 0.45, 0.65),
        "economy at capacity with high inflation in 2022-23; part of the boom replaced other exports",
    ),
    "BLR": (
        T(0.20, 0.40, 0.60),
        "Belarus lost EU and Ukrainian markets (potash, oil products, wood) and sent output to Russia instead: much of the rise replaces lost sales elsewhere",
    ),
    "IND": (T(0.30, 0.50, 0.70), "pharmaceuticals, phones, machinery; partly new demand"),
    "KAZ": (T(0.40, 0.60, 0.80), "own production (after re-exports were moved): small economy with spare capacity"),
    "KGZ": (T(0.40, 0.60, 0.80), "as Kazakhstan; hub margin part see note"),
    "ARM": (T(0.40, 0.60, 0.80), "as Kazakhstan; hub margin part see note"),
    "GEO": (T(0.40, 0.60, 0.80), "as Kazakhstan"),
    "UZB": (T(0.40, 0.60, 0.80), "as Kazakhstan"),
}
X_EXTRA_DEFAULT = (
    T(0.30, 0.50, 0.70),
    "default: new demand from Russia replacing Western suppliers; half assumed additional",
)

# ---------- services ----------
TOUR_BORDER = "FIN EST LVA LTU NOR".split()
FIN_SVC = "CYP CHE GBR LUX MLT IRL NLD AUT".split()
X_SVC_LOST = {
    "CYP": (
        T(0.25, 0.45, 0.65),
        "tourism: ~0.8m Russian visitors lost but 2023 arrivals 97% of the 2019 record (Poland, Israel, Romania); business/financial services to Russian clients only partly replaced",
    ),
    "GRC": (T(0.15, 0.30, 0.50), "tourism: record arrivals 2023-24 replaced Russian visitors"),
    "IRL": (
        T(0.15, 0.30, 0.50),
        "mostly aircraft leasing: lessors re-leased aircraft elsewhere in the post-COVID shortage (asset write-offs are not covered here)",
    ),
}
X_SVC_LOST_BORDER = (
    T(0.30, 0.50, 0.70),
    "border shopping and tourism by Russians (e.g. south-east Finland, Narva) not replaceable locally; transit services lost",
)
X_SVC_LOST_FIN = (
    T(0.30, 0.50, 0.70),
    "business and financial services to Russian clients: some staff and firms moved, demand only partly replaced",
)
X_SVC_LOST_DEFAULT = (
    T(0.15, 0.30, 0.50),
    "tourism and transport: 2022-24 post-COVID tourism boom left capacity full; Russian visitors largely replaced (Cyprus, Greece, Thailand evidence)",
)
X_SVC_EXTRA = {
    "GEO": (T(0.50, 0.70, 0.85), "relocants and visitors from Russia spending in a small economy with spare capacity"),
    "ARM": (T(0.50, 0.70, 0.85), "as Georgia; IT relocation"),
    "KGZ": (T(0.40, 0.60, 0.80), "as Georgia"),
    "KAZ": (T(0.40, 0.60, 0.80), "as Georgia"),
    "UZB": (T(0.40, 0.60, 0.80), "as Georgia"),
    "TUR": (
        T(0.30, 0.50, 0.70),
        "Russian tourists in 2022-23 filled hotels partly at the expense of others (capacity tight)",
    ),
    "ARE": (T(0.40, 0.60, 0.80), "Russian wealth, residents and tourists; Dubai capacity expanding"),
    "THA": (T(0.30, 0.50, 0.70), "Russian tourists during the post-COVID recovery"),
}
X_SVC_EXTRA_DEFAULT = (T(0.30, 0.50, 0.70), "default: half of extra Russian spending assumed additional")

# ---------- shipping ----------
SHADOW_CTRL = "ARE HKG IND CHN TUR SYC GEO AZE KWT OMN SAU VNM MYS IDN EGY".split()
X_SHIP_MAIN = (
    T(0.25, 0.45, 0.65),
    "mainstream (G7-linked) owners: without the war the same tankers would carry other cargo at normal rates; the extra is the freight premium from longer hauls and sanctions risk (Baltic-India Aframax ~USD 20m/voyage 2022 vs ~5m Jan 2025), high in 2022-23 and smaller later",
)
X_SHIP_SHADOW = (
    T(0.45, 0.65, 0.85),
    "shadow-fleet controllers: old tankers bought for the trade would otherwise have been scrapped or idle, so most of their earnings are extra",
)

# ---------- other flowback (non-weapons goods bought with aid) ----------
X_FB_OTHER = (
    T(0.25, 0.45, 0.65),
    "civilian goods (vehicles, generators, transformers, medical and humanitarian supplies): mixed spare capacity; generators/transformers were in shortage (displacement)",
)

# ---------- fuel share of extra sales to Ukraine (UN Comtrade, Ukraine imports by partner, HS27 share of the 2021->2023 rise) ----------
FUEL = {
    "POL": 0.67,
    "SVK": 0.67,
    "GRC": 0.90,
    "ROU": 0.69,
    "BGR": 0.17,
    "TUR": 0.25,
    "LTU": 0.90,
    "HUN": 0.50,
    "MDA": 0.45,
    "IND": 0.90,
    "LVA": 0.50,
    "NLD": 0.50,
}
X_SELL_FUEL = T(0.10, 0.20, 0.40)
X_SELL_OTHER = T(0.25, 0.45, 0.65)

out = {}
for iso in ISO:
    r = {}

    def put(flow, v, vs, x, xs, note=None):
        v, x = clip(v), clip(x)
        d = {"value_kept": v, "value_kept_src": vs, "extra": x, "extra_why": xs, "product": product(v, x)}
        if note:
            d["note"] = note
        r[flow] = d

    wv, ws = weapons_vk(iso)
    xw, xws = X_WEAP.get(iso, X_WEAP_DEFAULT)
    put("flowback_weapons", wv, ws, xw, xws)
    mv, ms = vk(iso, "C")
    put("flowback_other", mv, ms, X_FB_OTHER[0], X_FB_OTHER[1])
    gv, gs = vk(iso, "BTE")
    xl, xls = X_LOST.get(iso) or (X_LOST_LARGE if iso in LARGE else X_LOST_COMMOD if iso in COMMOD else X_LOST_DEFAULT)
    put("sales_to_russia_lost", gv, gs, xl, xls)
    xe, xes = X_EXTRA.get(iso, X_EXTRA_DEFAULT)
    note = None
    if iso in ("ARE", "ARM", "KAZ", "TUR", "KGZ", "GEO", "UZB", "AZE", "SRB", "MNG", "TJK", "BLR"):
        note = "re-export hub: the trading margin the hub keeps (5-20%) is already value added; apply value_kept 0.85 (0.75-0.95, wholesale trade G) x extra to that margin part, not this goods value_kept"
    put("sales_to_russia_extra", gv, gs, xe, xes, note)
    f = FUEL.get(iso, 0.1 if iso in COVER else 0.15)
    fv, fs = vk(iso, "C19")
    sv = blend([(f, fv), (1 - f, gv)])
    prod_c = f * fv["central"] * X_SELL_FUEL["central"] + (1 - f) * gv["central"] * X_SELL_OTHER["central"]
    xs_c = prod_c / sv["central"]
    xs_l = (f * fv["low"] * X_SELL_FUEL["low"] + (1 - f) * gv["low"] * X_SELL_OTHER["low"]) / sv["low"]
    xs_h = (f * fv["high"] * X_SELL_FUEL["high"] + (1 - f) * gv["high"] * X_SELL_OTHER["high"]) / sv["high"]
    put(
        "sales_to_ukraine_extra",
        sv,
        f"fuel share {f:.2f} at {fs.split(',')[-1].strip() if 'TiVA 2025' in fs else fs}; rest at goods (BTE) value kept",
        T(xs_l, xs_c, xs_h),
        f"fuel (refineries ran at capacity in 2022-23; extra diesel for Ukraine displaced other buyers) 0.2 (0.1-0.4); other goods 0.45 (0.25-0.65), weighted by value kept; fuel share {'UN Comtrade (B)' if iso in FUEL else 'assumed (D)'}",
    )
    iv, _ = vk(iso, "I")
    nv, ns = vk(iso, "GTN")
    svv = blend([(0.5, iv), (0.5, nv)])
    ssrc = ns.replace("GTN", "mean of I (accommodation, food) and GTN (business services)")
    if iso in TOUR_BORDER:
        xl = X_SVC_LOST_BORDER
    elif iso in X_SVC_LOST:
        xl = X_SVC_LOST[iso]
    elif iso in FIN_SVC:
        xl = X_SVC_LOST_FIN
    else:
        xl = X_SVC_LOST_DEFAULT
    xe = X_SVC_EXTRA.get(iso, X_SVC_EXTRA_DEFAULT)
    put(
        "services_to_russia",
        svv,
        ssrc,
        xl[0],
        xl[1],
        f"when the country sold MORE services to Russia use extra_when_more instead",
    )
    r["services_to_russia"]["extra_when_more"] = clip(xe[0])
    r["services_to_russia"]["extra_when_more_why"] = xe[1]
    r["services_to_russia"]["product_when_more"] = product(clip(svv), clip(xe[0]))
    hv, hs = vk(iso, "H50", widen=0.08)
    if iso == "GRC":
        hv = T(0.28, 0.40, 0.60)
        hs = "OECD TiVA 2025 GRC H50 = 0.34 (2021-22); raised to 0.40 and widened: Greek owners keep much of the profit and management abroad-registered but Greece-run (shipping receipts in Greek balance of payments)"
    put(
        "shipping",
        hv,
        hs,
        *(X_SHIP_SHADOW if iso in SHADOW_CTRL else X_SHIP_MAIN),
        note="applies to gross freight revenue; data.json shipping is already profit at SHIPPING_PROFIT freight (0.2/0.35/0.5): divide by that first. Ship sales (price premium) and registry fees keep their current treatment",
    )
    out[iso] = r

json.dump(out, open(B + "table.json", "w"), indent=1)
for i in ["USA", "DEU", "POL", "CHN", "GRC", "CZE", "FIN", "CYP", "BLR", "KGZ"]:
    print(i, {k: v["product"]["central"] for k, v in out[i].items()})
