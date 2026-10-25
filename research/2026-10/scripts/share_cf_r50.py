"""Round 50: can we PREDICT the buyer's share of Russia's exports? A share model for purchases from Russia ("paid").

    no-war purchases(c, p, t) = Russia's NO-WAR exportable supply of p in t (pre-war trend + capacity planned before
    2022, as a range; NOT the war-time actual) x predicted share(c, p, t) x the site's no-war price

The share model (pooled per product and data set, three estimated parameters, strictly out of sample):

    log share(c,p,t) / share(c,p,o) = b1 * h * g_share + b2 * h * g_demand + b3 * dlog relprice(o->t) + infra(c,p,o,t)

  g_share   own trend of c's share of Russia's exports of p (log-linear slope over o-3..o)
  g_demand  c's import volume trend of p (all suppliers) minus the world's (o-3..o)
  relprice  delivered unit value of Russian p in c over the unit value of c's imports of p from everyone else (BACI);
            realised in the back-test (SHR), held at the origin (SHR0); in the war years it is held at the pre-war
            differential (sanction-era discounts are war effects), so only SHR0 can be applied
  infra     planned capacity known at the origin (FID / intergovernmental agreement before the origin): new Russian
            routes and gas contracts to c, and c's own diversification terminals (table INFRA), in volume

Steps (from the repository root):

  python3 -I research/2026-10/scripts/share_cf_r50.py fetch
      downloads (untrusted data) into the scratchpad and writes small extracts with URL and retrieval date to
      research/2026-10/raw/share_cf_r50/ (BACI fuel headings 1995-2000, to train the model before the first origin;
      the curated supply and infrastructure tables with their sources)
  python3 -I research/2026-10/scripts/share_cf_r50.py run [--site DIR]
      back-tests + application; writes research/2026-10/gaps/share_cf_r50.json and <scratch>/site_patch_r50.json
  python3 -I research/2026-10/scripts/share_cf_r50.py merge <before_after.json>
      adds the site model's before/after (scratchpad r50/ba.mjs) to the gaps file

Round 49's script (supply_cf_r49.py, which carries round 48's loaders and its demand model D) is imported, not
copied: the cases, the current rule (CUR), plain flat (M0), round 48's D and round 49's SUP are its own, so all models
are scored on exactly the same cases.
"""

import gzip
import importlib.util
import json
import math
import sys
import time
import urllib.parse
from pathlib import Path

import numpy as np

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw" / "share_cf_r50"
GAPS = R / "gaps"
SCRATCH = Path("/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r50")
DL = SCRATCH / "dl"

_spec = importlib.util.spec_from_file_location("s49", Path(__file__).resolve().parent / "supply_cf_r49.py")
s49 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(s49)

OEC = s49.OEC
CUBE = s49.CUBE
HS4_OF = s49.HS4_OF
FUELS = s49.FUELS
EARLY_YEARS = list(range(1995, 2001))

# --------------------------------------------------------------------------------------------------------------------
# the rule (fixed in this file before any result was computed, 2026-10-25; copied to the notes)
# --------------------------------------------------------------------------------------------------------------------

RULE = {
    "written": "2026-10-25, before any back-test result was computed",
    "candidate": "SHR: no-war purchases(c,p,t) = Russia's no-war supply of p (back-test: Russia's total forecast at the "
    "origin, its log-linear trend over the ten years to the origin damped by 0.5) x predicted share(c,p,t). Share model: "
    "log share(t)/share(o) = b1*h*g_share + b2*h*g_demand + b3*dlog relprice(o->t) + infra(c,p,o,t); b1, b2 in [0,1], "
    "b3 in [-5,1], least squares without constant, pooled over buyers per product and data set, on M and L flows, "
    "y winsorised at +-1.5, trends at +-0.5 a year; fitted ONLY on pairs (o', o'+h) with o'+h <= origin (training from "
    "1998, BACI 1995-2000 added for this); under 30 training pairs: prior b = (0.5, 0.5, 0)",
    "drivers": {
        "g_share": "slope of log share of Russia's exports of p over o-3..o (BACI: c's deflated value over Russia's "
        "deflated total; Eurostat: c's volume from Russia over Russia's total in BACI tonnes, or deflated value for gas)",
        "g_demand": "slope of log c's imports of p from all suppliers (Eurostat volume; BACI tonnes if the unit value is "
        "sane in every window year, else deflated value) minus slope of log world imports of p in tonnes, o-3..o",
        "relprice": "log(unit value of Russian p delivered to c / unit value of c's imports of p from all others), "
        "BACI; SHR uses the realised change o->t (known in the back-test, NOT in the war years: there it is held at the "
        "pre-war differential); SHR0 refits the model without it and holds it at the origin",
        "infra": "log(1 + sum over events known at the origin of net_factor x allocated capacity change o->t / c's "
        "volume from Russia at o), floored at log(0.1); events and net factors are in INFRA (1.0 for gas pipelines and "
        "LNG with named long-term buyers and no prior Russian flow on that route, 0.5 otherwise: new routes partly "
        "displace rail/sea flows, terminals run below nameplate); diffuse events allocated to the buyer group by imports "
        "of p from all suppliers at the origin",
        "policy": "EU diversification after 2014 and the Third Energy Package enter only through the infrastructure they "
        "financed (Klaipeda, Swinoujscie, Krk, Balticconnector, Baltic Pipe, IGB): a policy dummy cannot be estimated "
        "out of sample before 2014 (no pre-origin variation)",
        "not_available": "Urals-Brent and ESPO-Dubai differentials and route freight for 2001-2021 (Argus/Platts are "
        "paid; Minfin's Urals series and the IEA/OPEC pages refuse the connection from here): replaced by BACI unit "
        "values, which are near-FOB (BACI removes CIF margins), so freight is not in the price term",
    },
    "variants": {
        "SHR": "judged model (owner's specification): supply forecast x share model with the realised price term",
        "SHR0": "same without the price term (refitted): the version that can be applied in the war years",
        "SHRa / SHRa0": "diagnostic: the share model x Russia's ACTUAL total (isolates the share part; used for the "
        "out-of-sample share-drift decomposition); never proposed",
    },
    "reference": "CUR, the current site rule (for M and L flows: origin year held flat; identical to M0 in these cells). "
    "Reported next to it: M0 (plain flat), D (round 48 demand model), SUP (round 49 supply model), as published",
    "error": "the site's cumulative error: log(sum w*actual / sum w*predicted) over H = 1..5 years, w = 1 except 8/12 "
    "for the fifth year; per origin the mean over H1-H5 of the median absolute error",
    "accept_if_all": [
        (
            "accuracy: SHR's error at least 15% lower than CUR's at EVERY rolling origin 2005-2016 (12 origins, incl. 2008 "
            "and 2013/2014), at least 5 cases at each origin"
        ),
        (
            "band: SHR's era-calibrated 90% band for the five-year sum (H5; eras 2005-09, 2010-12, 2013-16; its own "
            "back-test errors) not wider in log width than CUR's"
        ),
        (
            "placebo: SHR's band, built only from earlier origins, covers at least 90% of the errors with the war moved to "
            "2014 (origin 2013, H5; training origins up to 2008) and to 2018 (origin 2017, H4; up to 2013); under 10 "
            "placebo cases the product pooled over sizes"
        ),
        (
            "application consistency: because the war-time application cannot use the realised price term, a cell is "
            "proposed only if SHR0 passes the same three tests too; a cell where SHR passes and SHR0 fails is reported as "
            "'passes only with information the war-time application cannot have' and not proposed"
        ),
    ],
    "scope": "products crude (2709), oil products (2710), gas (2711; pipeline and LNG), coal (2701); size L (product "
    "flow over EUR 1bn a year, 4-year average to the origin; on Eurostat, as in rounds 48/49, the country total's size). "
    "Mid-size (M) cells of a product are judged under the rule only if that product's L cell passes on that data set; "
    "otherwise M results are diagnostic. Fuels are judged on Eurostat energy imports by country of origin for European "
    "reporters and on BACI elsewhere; a cell applies to a country only on the data set that covers it",
    "no_narrow_pass": "a cell that fails narrowly fails; the rule is not changed after the results",
    "decomposition": "share drift = log(share(t)/share(o)) of M and L flows, origins 2005-2016; explained out of sample "
    "= 1 - var(residual)/var(drift) and 1 - mean(residual^2)/mean(drift^2), residual = drift - predicted share change",
    "war_time": "Russia's no-war supply index (2021 = 1, low / central / high, sources in SUPPLY) x the share factor "
    "exp(predicted share change) from the SHR0 fit at origin 2021 (drivers 2018-2021, price term 0, infrastructure "
    "planned before 2022: Power of Siberia contract ramp for China, Baltic Pipe for Poland, IGB for Bulgaria); gas "
    "split into pipeline and LNG with the site's own 2018-2021 mix; hubs (r48 list) keep the current method; the "
    "laundered line and re-exports are untouched; prices are the site's no-war paths (no windfall double count)",
    "bands": "the site's cumulative band rescaled by the ratio of SHR0's back-tested country-total band to CUR's (per "
    "size class and horizon, as rounds 48/49), then widened by the supply range (low / high supply index)",
    "proposal": "passing cells only, non-hub countries with purchases of EUR 0.1bn a year or more",
    "diagnostic": "SHR0 on every in-scope cell (fuels, product flow L; and M only if L passes), non-hub countries",
}

ORIGINS = s49.ORIGINS
SIZES_SCOPE = ("L", "M")
SUPPLY_DAMP = 0.5
TRAIN_FROM = 1998
MIN_TRAIN = 30
PRIOR = (0.5, 0.5, 0.0)
NEW_MODELS = ("SHR", "SHR0", "SHRa", "SHRa0")
APAC = {"CHN", "JPN", "KOR", "TWN", "PHL", "THA", "SGP", "MYS", "IDN", "VNM", "AUS", "NZL"}
EU_LNG = {"FRA", "ESP", "BEL", "NLD", "GBR", "PRT", "ITA", "GRC", "POL", "LTU"}
BCM_TJ = 38_200.0  # TJ (gross calorific value) per bcm of Russian pipeline gas
BCM_T = 0.72e6  # tonnes of natural gas per bcm
LNG_MT_BCM = 1.36  # bcm per Mt of LNG

# Infrastructure known in advance. cap: capacity path by year in Mt (crude, products) or bcm (gas, LNG converted to
# bcm); a year missing from the path takes the last earlier value (0 before the first). known: year of the FID or
# intergovernmental agreement (an event enters a forecast from origin o only if known <= o). to: a buyer, or a group
# with allocation by imports of the product from all suppliers at the origin. sign: +1 new Russian route/contract,
# -1 the buyer's own diversification. net: share of the capacity that changes Russia's flow to the buyer.
INFRA = [
    {"id": "sakhalin1_dekastri", "p": "crude", "to": {"APAC": 1.0}, "cap": {2006: 3.0, 2007: 12.0}, "known": 2001,
     "sign": 1, "net": 0.5, "src": "ExxonMobil/Sakhalin-1 FID Oct 2001; De-Kastri terminal 250 kb/d from Oct 2006"},
    {"id": "espo1_kozmino", "p": "crude", "to": {"APAC": 1.0}, "cap": {2010: 15.0}, "known": 2004,
     "sign": 1, "net": 0.5, "src": "Government order 1737-r of 31 Dec 2004 (ESPO); Kozmino rail-sea 15 Mt/y, Dec 2009"},
    {"id": "espo_china_spur", "p": "crude", "to": {"CHN": 1.0}, "cap": {2011: 15.0}, "known": 2009,
     "sign": 1, "net": 0.5, "src": "Russia-China loan-for-oil agreement Feb 2009, 15 Mt/y for 20 years from 2011"},
    {"id": "espo2_kozmino", "p": "crude", "to": {"APAC": 1.0}, "cap": {2013: 15.0}, "known": 2009,
     "sign": 1, "net": 0.5, "src": "ESPO-2 Skovorodino-Kozmino built 2009-2012, Kozmino 15 -> 30 Mt/y (Transneft)"},
    {"id": "kazakh_transit_china", "p": "crude", "to": {"CHN": 1.0}, "cap": {2014: 7.0}, "known": 2013,
     "sign": 1, "net": 0.5, "src": "Rosneft-CNPC agreement June 2013: +7 Mt/y via Kazakhstan from 2014"},
    {"id": "espo_china_2nd_line", "p": "crude", "to": {"CHN": 1.0}, "cap": {2018: 15.0}, "known": 2013,
     "sign": 1, "net": 0.5, "src": "Rosneft-CNPC 2013 contract; Mohe-Daqing second line from 1 Jan 2018 (+15 Mt/y)"},
    {"id": "sever_primorsk", "p": "products", "to": {"LVA": 1.0}, "cap": {2008: 8.4, 2013: 15.0}, "known": 2006,
     "sign": -1, "net": 0.5, "src": "Transnefteprodukt 'Sever' diesel pipeline to Primorsk (2008, 8.4 Mt; 15 Mt "
     "2013), diverting diesel from Ventspils"},
    {"id": "blue_stream", "p": "gas", "to": {"TUR": 1.0}, "known": 1997, "sign": 1, "net": 1.0,
     "cap": {2003: 2.0, 2004: 4.0, 2005: 6.0, 2006: 8.0, 2007: 10.0, 2008: 12.0, 2009: 14.0, 2010: 16.0},
     "src": "Gazprom-Botas contract 1997, plateau 16 bcm/y; linear contract ramp 2003-2010"},
    {"id": "sakhalin2_lng", "p": "gas", "to": {"JPN": 0.62, "KOR": 0.16, "APAC": 0.22}, "known": 2003, "sign": 1,
     "net": 1.0, "cap": {2009: 6.5, 2010: 13.0}, "src": "Sakhalin-2 FID May 2003, 9.6 Mt/y (13 bcm) LNG from 2009; "
     "long-term sales: Japanese buyers ~62%, KOGAS 1.5 Mt/y"},
    {"id": "yamal_lng", "p": "gas", "to": {"EU_LNG": 0.6, "CHN": 0.18, "APAC": 0.22}, "known": 2013, "sign": 1,
     "net": 0.5, "cap": {2018: 13.5, 2019: 22.4}, "src": "Yamal LNG FID Dec 2013, 16.5 Mt/y (3 trains, 2017-2018); "
     "CNPC 3 Mt/y contract; most cargoes marketed to Europe"},
    {"id": "power_of_siberia", "p": "gas", "to": {"CHN": 1.0}, "known": 2014, "sign": 1, "net": 1.0,
     "cap": {2020: 5.0, 2021: 10.0, 2022: 15.0, 2023: 22.0, 2024: 30.0, 2025: 38.0},
     "src": "Gazprom-CNPC contract 21 May 2014, 38 bcm/y for 30 years; start 2 Dec 2019; ramp per Gazprom plans"},
    {"id": "klaipeda_lng", "p": "gas", "to": {"LTU": 1.0}, "cap": {2015: 4.0}, "known": 2012, "sign": -1, "net": 0.5,
     "src": "Lithuanian government decision and Hoegh FSRU charter 2012; start Dec 2014, 4 bcm/y"},
    {"id": "swinoujscie_lng", "p": "gas", "to": {"POL": 1.0}, "cap": {2016: 5.0}, "known": 2010, "sign": -1,
     "net": 0.5, "src": "Polskie LNG construction contract 2010; commercial operation June 2016, 5 bcm/y"},
    {"id": "balticconnector", "p": "gas", "to": {"FIN": 1.0}, "cap": {2020: 2.6}, "known": 2016, "sign": -1,
     "net": 0.5, "src": "Gasum/Elering FID Oct 2016 (EU CEF); start Jan 2020"},
    {"id": "krk_lng", "p": "gas", "to": {"HRV": 1.0}, "cap": {2021: 2.6}, "known": 2019, "sign": -1, "net": 0.5,
     "src": "LNG Hrvatska FID Jan 2019; start Jan 2021, 2.6 bcm/y"},
    {"id": "baltic_pipe", "p": "gas", "to": {"POL": 1.0}, "cap": {2022: 2.5, 2023: 10.0}, "known": 2018, "sign": -1,
     "net": 0.5, "src": "Gaz-System/Energinet FID Nov 2018; start Oct 2022, 10 bcm/y (war-time application only)"},
    {"id": "igb", "p": "gas", "to": {"BGR": 1.0}, "cap": {2022: 0.5, 2023: 1.0}, "known": 2019, "sign": -1, "net": 1.0,
     "src": "ICGB FID Dec 2019; Bulgargaz-SOCAR contract 1 bcm/y via IGB from 2021/22 (war-time application only)"},
]  # fmt: skip

# Russia's no-war exportable supply, 2021 = 1, for 2022..2026 (low, central, high). Every number dated before 2022.
SUPPLY = {
    "crude": {
        "low": [1.00, 1.00, 1.00, 1.00, 1.00],
        "central": [1.04, 1.07, 1.07, 1.07, 1.07],
        "high": [1.08, 1.13, 1.15, 1.15, 1.15],
        "basis": "crude exports = output - refinery runs (runs flat at ~280 Mt). 2021: exports 231.6 Mt (customs), "
        "output 10.5 mb/d incl. condensate. OPEC+ (18 July 2021): +0.4 mb/d a month for the group from Aug 2021 to "
        "Sep 2022, Russia's baseline 11.0 -> 11.5 mb/d from May 2022, so Russia's required crude output rises ~0.9 "
        "mb/d from the 2021 average by Sep 2022. Energy Strategy 2035 (April 2020): output 11.15-11.25 mb/d to 2024, "
        "flat to falling to 2035. Low: output stuck at 2021 (capacity limits seen in late 2021). Central: half of the "
        "OPEC+ room is produced (about +0.45 mb/d, +4% output, +7-8% exports). High: OPEC+ path fully met, Strategy's "
        "upper bound",
    },
    "products": {
        "low": [0.97, 0.95, 0.93, 0.92, 0.91],
        "central": [1.00, 1.00, 0.99, 0.98, 0.98],
        "high": [1.02, 1.03, 1.03, 1.03, 1.03],
        "basis": "refinery runs flat (~280 Mt, 2019-2021); the tax manoeuvre (2019-2024, law of Aug 2018) lowers the "
        "export of fuel oil while the damper and the 2011 modernisation agreements raise light products. Energy "
        "Strategy 2035: fuel exports 'rise considerably', fuel oil falls. Range around flat",
    },
    "coal": {
        "low": [1.01, 1.02, 1.03, 1.04, 1.05],
        "central": [1.025, 1.05, 1.08, 1.10, 1.13],
        "high": [1.04, 1.08, 1.12, 1.17, 1.22],
        "basis": "Coal programme 2035 (government order 1582-r, 13 June 2020): exports 2035 +22% (conservative) to +86% "
        "(optimistic) on 2018 (bpb Russland-Analysen 386). 2018 210 Mt, 2021 ~223 Mt (BACI tonnes 222.5). From 2021 "
        "that is ~+1% a year (low) to ~+4% a year (high); the Eastern Polygon rail expansion (phase 2, 2019-2024) is "
        "the main constraint",
    },
    "gas_pipe": {
        "low": [1.00, 1.00, 1.00, 1.00, 1.00],
        "central": [1.05, 1.05, 1.05, 1.05, 1.05],
        "high": [1.14, 1.14, 1.14, 1.14, 1.14],
        "basis": "pipeline gas to Europe and Turkey (Gazprom far abroad excluding China): 2021 ~175 bcm (185.1 incl. "
        "10.4 to China). Gazprom's own 2021 guidance 175-183 bcm (April 2021). Low: 2021 level (spot sales held back "
        "in 2021). Central: 183 bcm (the top of Gazprom's 2021 target, demand-limited). High: 2019 level (~199 bcm) "
        "with Nord Stream 2 in service (the Nord Stream 2 range: on an origin basis it re-routes rather than adds; "
        "its value is the capacity to return to 2018-2019 volumes). China's pipeline gas is the Power of Siberia "
        "contract ramp (INFRA), not this index",
    },
    "lng": {
        "low": [1.05, 1.05, 1.16, 1.39, 1.61],
        "central": [1.05, 1.16, 1.39, 1.61, 1.72],
        "high": [1.08, 1.20, 1.42, 1.64, 1.75],
        "basis": "2021 LNG exports ~29.6 Mt (Yamal, Sakhalin-2, Vysotsk). Planned before 2022: Portovaya 1.5 Mt/y (2022); "
        "Arctic LNG 2, three 6.6 Mt/y trains in 2023, 2024, 2025 (Novatek, May 2021; half a year in the start year). "
        "Low: each train one year late. High: plus Yamal debottlenecking (+1 Mt/y)",
    },
}  # fmt: skip

SOURCES = [
    {"what": "OPEC+ 19th ONOMM, 18 July 2021: +0.4 mb/d a month from Aug 2021; baselines for Saudi Arabia and Russia "
     "11.0 -> 11.5 mb/d from May 2022", "url": "https://www.eia.gov/todayinenergy/detail.php?id=48956",
     "also": "https://www.qcintel.com/article/opec-agrees-to-production-hike-after-baseline-output-compromise-1177.html"},
    {"what": "Energy Strategy of Russia to 2035 (government order 1523-r, 9 June 2020; adopted April 2020): gas output "
     "795-820 bcm (2024), LNG 46-65 Mt (2024), 80-140 Mt (2035); oil output ~11.15-11.25 mb/d to 2024",
     "url": "https://www.enerdata.net/publications/daily-energy-news/russia-adopts-final-version-its-new-energy-strategy-2035.html",
     "also": "https://www.bpb.de/themen/europa/russland-analysen/2020/308763/analyse-russlands-energiestrategie-bis-zum-jahr-2035-business-as-usual/"},
    {"what": "Coal programme to 2035 (government order 1582-r, 13 June 2020): output 485 (conservative) to 668 Mt "
     "(optimistic) in 2035; exports +22% to +86% on 2018", "url": "https://jamestown.org/?p=86838"},
    {"what": "Power of Siberia: 10.39 bcm in 2021, ~15 bcm planned for 2022, 38 bcm/y design (contract 2014)",
     "url": "https://www.energyintel.com/00000185-348a-d599-a1ef-35fa6b130000",
     "also": "https://spglobal.com/commodity-insights/en/news-research/latest-news/natural-gas/121521-gazproms-gas-supply-via-power-of-siberia-pipeline-continue-above-contract-levels"},
    {"what": "Arctic LNG 2: 3 x 6.6 Mt/y; Novatek (May 2021) trains in 2023, 2024, 2025",
     "url": "https://www.spglobal.com/energy/en/news-research/latest-news/natural-gas/051721-russias-novatek-brings-forward-start-date-for-arctic-lng-2s-third-train-to-2025"},
    {"what": "Gazprom far-abroad exports 185.1 bcm in 2021 (incl. China); 2021 Europe guidance 175-183 bcm",
     "url": "https://worldoil.com/news/2022/1/3/gazprom-misses-2021-gas-export-targets-straining-european-markets/",
     "also": "https://www.spglobal.com/commodityinsights/en/market-insights/latest-news/natural-gas/042921-gazprom-sees-2021-european-gas-exports-in-range-of-175-183-bcm-burmistrova"},
    {"what": "Russia's crude exports 2021, 231.6 Mt (Russia's customs report via UN Comtrade, HS 2709 net weight)",
     "url": "raw/supply_cf_r49/comtrade_rus_reported_exports_2001_2021_2026-10-25.json"},
]  # fmt: skip

# --------------------------------------------------------------------------------------------------------------------
# fetch
# --------------------------------------------------------------------------------------------------------------------


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    DL.mkdir(parents=True, exist_ok=True)
    today = time.strftime("%Y-%m-%d")
    hs4p = ",".join(str(50000 + h) for h in HS4_OF.values())
    imp, rus, world = [], [], []
    urls = {}
    for y in EARLY_YEARS:
        specs = {
            "imports": {"cube": CUBE, "drilldowns": "Year,Importer Country,HS4", "measures": "Trade Value,Quantity",
                        "HS4": hs4p, "Year": y},
            "rus": {"cube": CUBE, "drilldowns": "Year,Importer Country,HS4", "measures": "Trade Value,Quantity",
                    "HS4": hs4p, "Exporter Country": "eurus", "Year": y},
            "world": {"cube": CUBE, "drilldowns": "Year,HS4", "measures": "Trade Value,Quantity", "HS4": hs4p,
                      "Year": y},
        }  # fmt: skip
        for k, prm in specs.items():
            url = OEC + "?" + urllib.parse.urlencode(prm)
            urls.setdefault(k, url.replace(f"Year={y}", "Year=<1995..2000>"))
            f = DL / f"{k}_{y}.json"
            if not f.exists():
                f.write_bytes(s49.get(url))
                time.sleep(0.5)
            for r in json.loads(f.read_text())["data"]:
                h = int(r["HS4 ID"]) % 10000
                v, t = round(float(r["Trade Value"] or 0)), round(float(r["Quantity"] or 0), 1)
                if k == "world":
                    world.append([y, h, v, t])
                    continue
                iso = s49.iso_of(r["Importer Country ID"])
                if iso:
                    (imp if k == "imports" else rus).append([y, iso, h, v, t])
        print(y, len(imp), len(rus), len(world), file=sys.stderr)
    with gzip.open(RAW / "baci_fuel_hs4_1995_2000.json.gz", "wt") as fh:
        json.dump(
            {
                "source": "CEPII BACI HS92 (HS6 REV. 1992, 1995-2024 release) via the OEC API, no key; licence Etalab 2.0",
                "retrieved": today,
                "urls": urls,
                "what": "HS 2701, 2709, 2710, 2711, 1995-2000 (training years before round 48's 2001-2024 extract): "
                "imports from all suppliers (imports) and Russia's exports (rus) by importer, and the world (world); "
                "value USD and tonnes",
                "columns": ["year", "importer", "hs4", "usd", "tonnes"],
                "imports": imp,
                "rus": rus,
                "world": world,
            },
            fh,
        )
    (RAW / f"supply_infra_sources_{today}.json").write_text(
        json.dumps(
            {
                "what": "curated tables (not downloaded): Russia's no-war exportable supply 2022-2026 (2021 = 1) and the "
                "infrastructure known in advance, with the sources they rest on. Primary pages (IEA, OPEC, Minenergo, "
                "government.ru, Gazprom) refuse the connection from this environment (HTTP 403 / reset, 2026-10-25); "
                "the figures were checked against the secondary reports listed, all dated before 2022 except where "
                "they report a pre-2022 plan",
                "retrieved": today,
                "supply": SUPPLY,
                "infrastructure": INFRA,
                "sources": SOURCES,
            },
            indent=1,
        )
    )


# --------------------------------------------------------------------------------------------------------------------
# panel: BACI fuel headings 1995-2024 (this round's 1995-2000 extract + round 48's 2001-2024)
# --------------------------------------------------------------------------------------------------------------------

P_OF = {h: p for p, h in HS4_OF.items()}
YEARS_ALL = list(range(1995, 2025))


def slope(ys: list[int], vals: list[float]) -> float | None:
    if len(ys) < 3 or any(v is None or v <= 0 for v in vals):
        return None
    x = np.array(ys, float) - ys[-1]
    return float(np.polyfit(x, np.log(np.array(vals, float)), 1)[0])


class Panel:
    def __init__(self) -> None:
        self.rus: dict = {}
        self.imp: dict = {}
        self.world: dict = {}
        with gzip.open(s49.raw48() / "baci_fuel_hs4_2001_2024.json.gz", "rt") as fh:
            d48 = json.load(fh)
        with gzip.open(RAW / "baci_fuel_hs4_1995_2000.json.gz", "rt") as fh:
            d50 = json.load(fh)
        for d in (d50, d48):
            for tgt, key in ((self.rus, "rus"), (self.imp, "imports")):
                for y, iso, h, v, t in d[key]:
                    if h in P_OF:
                        tgt.setdefault(iso, {}).setdefault(y, {})[P_OF[h]] = (float(v), float(t))
        for y, h, v, t in d50["world"]:
            if h in P_OF:
                self.world.setdefault(y, {})[P_OF[h]] = (float(v), float(t))
        with gzip.open(s49.raw48() / "baci_world_hs4q_2001_2024.json.gz", "rt") as fh:
            for y, h, v, t in json.load(fh)["rows"]:
                if h in P_OF:
                    self.world.setdefault(y, {})[P_OF[h]] = (float(v), float(t))
        self.P = {
            p: s49.fisher_chain({y: {0: self.world[y][p]} for y in YEARS_ALL if p in self.world.get(y, {})}, YEARS_ALL)
            for p in FUELS
        }
        self.wuv = {p: {y: self.world[y][p][0] / self.world[y][p][1] for y in YEARS_ALL} for p in FUELS}
        self.Tnom = {p: {y: sum(self.rus[i].get(y, {}).get(p, (0, 0))[0] for i in self.rus) for y in YEARS_ALL}
                     for p in FUELS}  # fmt: skip
        self.Tton = {p: {y: sum(self.rus[i].get(y, {}).get(p, (0, 0))[1] for i in self.rus) for y in YEARS_ALL}
                     for p in FUELS}  # fmt: skip

    def sane(self, v: float, t: float, p: str, y: int) -> bool:
        return t > 0 and v > 0 and 1 / 3 <= (v / t) / self.wuv[p][y] <= 3

    def rv(self, iso, p, y) -> tuple[float, float]:
        return self.rus.get(iso, {}).get(y, {}).get(p, (0.0, 0.0))

    def iv(self, iso, p, y) -> tuple[float, float]:
        return self.imp.get(iso, {}).get(y, {}).get(p, (0.0, 0.0))

    def treal(self, p, y, o) -> float:
        return self.Tnom[p][y] / self.P[p][y] * self.P[p][o]

    def ttons_ok(self, p, y) -> float | None:
        return self.Tton[p][y] if self.sane(self.Tnom[p][y], self.Tton[p][y], p, y) else None

    def rus_real(self, iso, p, y, o) -> float:
        return self.rv(iso, p, y)[0] / self.P[p][y] * self.P[p][o]

    def rus_phys(self, iso, p, y) -> float:
        v, t = self.rv(iso, p, y)
        return t if self.sane(v, t, p, y) else v / self.wuv[p][y]

    def imp_vol(self, iso, p, ys) -> list[float] | None:
        vt = [self.iv(iso, p, y) for y in ys]
        if all(self.sane(v, t, p, y) for (v, t), y in zip(vt, ys)):
            return [t for _, t in vt]
        if all(v > 0 for v, _ in vt):
            return [v / self.P[p][y] for (v, _), y in zip(vt, ys)]
        return None

    def relp(self, iso, p, y) -> float | None:
        rv, rt = self.rv(iso, p, y)
        iv, it = self.iv(iso, p, y)
        ov, ot = iv - rv, it - rt
        if rv <= 0 or rt <= 0 or ov <= 0 or ot <= 0 or not self.sane(rv, rt, p, y) or not self.sane(ov, ot, p, y):
            return None
        return math.log((rv / rt) / (ov / ot))

    def world_ton(self, p, y) -> float:
        return self.world[y][p][1]


def cap_at(e: dict, y: int) -> float:
    ks = [k for k in e["cap"] if k <= y]
    return e["cap"][max(ks)] if ks else 0.0


def alloc(Pn: Panel, e: dict, iso: str, p: str, o: int) -> float:
    a = 0.0
    for k, w in e["to"].items():
        if k == iso:
            a += w
        elif k in ("APAC", "EU_LNG"):
            grp = APAC if k == "APAC" else EU_LNG
            if iso in grp:
                tot = sum(Pn.iv(i, p, o)[0] for i in grp)
                a += w * Pn.iv(iso, p, o)[0] / tot if tot else 0.0
    return a


# events whose effect the site already carries in the war-time no-war level (applied there only, not in the back-test):
# Poland's no-war gas already drops from 2023 with the end of the Yamal contract (site counterfactual), which Baltic
# Pipe replaced; counting Baltic Pipe again would double the cut (found after the first diagnostic run)
SITE_ALREADY = {("POL", "baltic_pipe")}


def infra(
    Pn: Panel, iso: str, p: str, o: int, t: int, base_phys: float, unit: str, skip: set | None = None
) -> tuple[float, list[str]]:
    """log(1 + net capacity change o->t allocated to iso / iso's volume from Russia at o); unit 't' (BACI tonnes),
    'ths_t' (Eurostat thousand tonnes) or 'tj' (Eurostat gas)."""
    add, used = 0.0, []
    for e in INFRA:
        if e["p"] != p or e["known"] > o or (skip and (iso, e["id"]) in skip):
            continue
        dc = cap_at(e, t) - cap_at(e, o)
        a = alloc(Pn, e, iso, p, o)
        if not dc or not a:
            continue
        if p == "gas":
            conv = {"t": BCM_T, "tj": BCM_TJ}[unit]
        else:
            conv = {"t": 1e6, "ths_t": 1e3}[unit]
        add += e["sign"] * e["net"] * dc * a * conv
        used.append(e["id"])
    if not used or base_phys <= 0:
        return 0.0, used
    return math.log(max(0.1, 1 + add / base_phys)), used


# --------------------------------------------------------------------------------------------------------------------
# features and training pairs
# --------------------------------------------------------------------------------------------------------------------


class Feat:
    """Drivers for one buyer, product and origin, on BACI ('baci') or Eurostat origin volumes ('es')."""

    def __init__(self, Pn: Panel, ea: dict) -> None:
        self.Pn, self.ea = Pn, ea
        # Eurostat: Russia's total in tonnes where sane in every year 1995-2021, else deflated value
        self.es_basis = {
            p: "tonnes" if p != "gas" and all(Pn.ttons_ok(p, y) for y in range(1995, 2022)) else "deflated value"
            for p in FUELS
        }
        self.cache: dict = {}

    def V(self, p: str, y: int, o: int) -> float | None:
        return self.Pn.ttons_ok(p, y) if self.es_basis[p] == "tonnes" else self.Pn.treal(p, y, o)

    def share(self, kind: str, iso: str, p: str, y: int, o: int) -> float | None:
        if kind == "baci":
            v = self.Pn.rus_real(iso, p, y, o)
            return v / self.Pn.treal(p, y, o) if v > 0 else None
        ru = self.ea.get(iso, {}).get(p, {}).get("RU", {}).get(y)
        V = self.V(p, y, o)
        return ru / V if ru and ru > 0 and V else None

    def get(self, kind: str, iso: str, p: str, o: int) -> dict | None:
        key = (kind, iso, p, o)
        if key in self.cache:
            return self.cache[key]
        Pn = self.Pn
        win = [o - 3, o - 2, o - 1, o]
        out = None
        if win[0] >= 1995:
            sh = [self.share(kind, iso, p, y, o) for y in win]
            g1 = slope(win, sh)
            if g1 is not None:
                wl = slope(win, [Pn.world_ton(p, y) for y in win])
                if kind == "baci":
                    m = Pn.imp_vol(iso, p, win)
                    base_phys = Pn.rus_phys(iso, p, o)
                    size_v = sum(Pn.rv(iso, p, y)[0] for y in win) / 4
                else:
                    tot = self.ea[iso][p].get("TOTAL", {})
                    m = [tot.get(y) for y in win]
                    base_phys = self.ea[iso][p]["RU"][o]
                    size_v = sum(self.ea[iso][p]["RU"][y] for y in win) / 4
                gm = slope(win, m) if m else None
                g2 = gm - wl if gm is not None and wl is not None else 0.0
                out = {"g1": float(np.clip(g1, -0.5, 0.5)), "g2": float(np.clip(g2, -0.5, 0.5)), "base": base_phys,
                       "size_v": size_v, "rp0": Pn.relp(iso, p, o), "sh0": sh[-1]}  # fmt: skip
        self.cache[key] = out
        return out

    def unit(self, kind: str, p: str) -> str:
        return "t" if kind == "baci" else ("tj" if p == "gas" else "ths_t")

    def z(self, kind: str, iso: str, p: str, o: int, t: int, f: dict) -> tuple[float, float, list[str]]:
        rp = self.Pn.relp(iso, p, t)
        z3 = float(np.clip(rp - f["rp0"], -1, 1)) if rp is not None and f["rp0"] is not None else 0.0
        z4, used = infra(self.Pn, iso, p, o, t, f["base"], self.unit(kind, p))
        return z3, z4, used


ES_MIN = {"crude": 200.0, "products": 200.0, "coal": 200.0, "gas": 25_000.0}  # thousand t / TJ a year (~EUR 0.1bn)


def training_rows(F: Feat, kind: str, p: str) -> list[tuple]:
    """(o', h, g1, g2, z3, z4, y) for every M/L flow and pair o' -> o'+h with o' >= TRAIN_FROM, o'+h <= 2021."""
    rows = []
    isos = (
        [i for i in F.Pn.rus if i not in s49.EXCLUDE]
        if kind == "baci"
        else [i for i in F.ea if p in F.ea[i] and i not in s49.EXCLUDE]
    )
    for iso in isos:
        for o in range(TRAIN_FROM, 2021):
            f = F.get(kind, iso, p, o)
            if not f:
                continue
            if (kind == "baci" and f["size_v"] < 0.11e9) or (kind == "es" and f["size_v"] < ES_MIN[p]):
                continue
            for h in range(1, 6):
                t = o + h
                if t > 2021:
                    break
                st = F.share(kind, iso, p, t, o)
                if not st:
                    continue
                z3, z4, _ = F.z(kind, iso, p, o, t, f)
                rows.append((o, h, f["g1"], f["g2"], z3, z4, math.log(st / f["sh0"])))
    return rows


BOUNDS = [(0.0, 1.0), (0.0, 1.0), (-5.0, 1.0)]
# post-hoc diagnostic only (added after the results, never proposed): free signs, so own-share trends may mean-revert
BOUNDS_FREE = [(-2.0, 2.0), (-2.0, 2.0), (-5.0, 5.0)]


def fit(rows: list[tuple], origin: int, price: bool, bounds=BOUNDS) -> dict:
    tr = [r for r in rows if r[0] + r[1] <= origin]
    k = 3 if price else 2
    if len(tr) < MIN_TRAIN:
        return {"b": list(PRIOR[:k]), "n": len(tr), "prior": True}
    A = np.array([[r[1] * r[2], r[1] * r[3], r[4]][:k] for r in tr])
    y = np.clip(np.array([r[6] - r[5] for r in tr]), -1.5, 1.5)
    fixed: dict[int, float] = {}
    b = np.zeros(k)
    for _ in range(k + 1):
        free = [j for j in range(k) if j not in fixed]
        yy = y - sum(A[:, j] * v for j, v in fixed.items()) if fixed else y
        sol = np.linalg.lstsq(A[:, free], yy, rcond=None)[0] if free else np.array([])
        b = np.zeros(k)
        for j, v in fixed.items():
            b[j] = v
        for j, v in zip(free, sol):
            b[j] = v
        out = [j for j in free if not bounds[j][0] <= b[j] <= bounds[j][1]]
        if not out:
            break
        for j in out:
            fixed[j] = float(np.clip(b[j], *bounds[j]))
    res = y - A @ b
    r2 = 1 - float(np.var(res)) / float(np.var(y)) if np.var(y) > 0 else None
    return {"b": [round(float(x), 4) for x in b], "n": len(tr), "prior": False, "r2_in_sample": r2}


class ShareModel:
    def __init__(self, F: Feat, bounds=BOUNDS, rows: dict | None = None) -> None:
        self.F = F
        self.bounds = bounds
        self.rows = rows or {(k, p): training_rows(F, k, p) for k in ("baci", "es") for p in FUELS}
        self.fits: dict = {}

    def coef(self, kind: str, p: str, origin: int, price: bool) -> list[float]:
        key = (kind, p, origin, price)
        if key not in self.fits:
            self.fits[key] = fit(self.rows[(kind, p)], origin, price, self.bounds)
        return self.fits[key]["b"]

    def dhat(self, kind, iso, p, o, t, price: bool, z3_override: float | None = None) -> tuple[float, list[str]] | None:
        f = self.F.get(kind, iso, p, o)
        if not f:
            return None
        b = self.coef(kind, p, o, price)
        z3, z4, used = self.F.z(kind, iso, p, o, t, f)
        if z3_override is not None:
            z3 = z3_override
        h = t - o
        d = b[0] * h * f["g1"] + b[1] * h * f["g2"] + (b[2] * z3 if price else 0.0) + z4
        return d, used


def supply_trend(Pn: Panel, F: Feat, kind: str, p: str, o: int) -> float:
    ys = list(range(max(1995, o - 9), o + 1))
    if kind == "es" and F.es_basis[p] == "tonnes":
        g = slope(ys, [Pn.ttons_ok(p, y) for y in ys])
    else:
        g = slope(ys, [Pn.treal(p, y, o) for y in ys])
    return g or 0.0


def add_share_preds(recs: list[dict], kind: str, SM: ShareModel, Pn: Panel, names=NEW_MODELS) -> int:
    n = 0
    F = SM.F
    for r in recs:
        p, o, iso = r["p"], r["o"], r["iso"]
        if p not in FUELS:
            continue
        ts = sorted(r["pred"]["CUR"])
        if not ts:
            continue
        start = r["pred"]["CUR"][ts[0]]
        gS = supply_trend(Pn, F, kind, p, o)
        n1, n0, na1, na0 = names
        for m in names:
            r["pred"][m] = {}
        if n1 == "SHR":
            r["infra"] = set()
        for t in ts:
            d1 = SM.dhat(kind, iso, p, o, t, True)
            d0 = SM.dhat(kind, iso, p, o, t, False)
            if d1 is None or d0 is None:
                continue
            if n1 == "SHR":
                r["infra"].update(d1[1])
            sf = math.exp(SUPPLY_DAMP * gS * (t - o))
            if kind == "baci":
                sa = Pn.treal(p, t, o) / Pn.treal(p, o, o)
            else:
                Vt, Vo = F.V(p, t, o), F.V(p, o, o)
                sa = Vt / Vo if Vt and Vo else None
            r["pred"][n1][t] = start * sf * math.exp(d1[0])
            r["pred"][n0][t] = start * sf * math.exp(d0[0])
            if sa:
                r["pred"][na1][t] = start * sa * math.exp(d1[0])
                r["pred"][na0][t] = start * sa * math.exp(d0[0])
        if n1 == "SHR":
            r["infra"] = sorted(r["infra"])
        n += 1
    return n


def decomposition(SM: ShareModel, kind: str, recs: list[dict]) -> dict:
    """Out-of-sample share drift explained: drift = log share(t)/share(o) of M/L flows (origins 2005-2016), against
    the predicted share change of SHR (realised price) and SHR0 (no price), each fitted on data to the origin."""
    out = {}
    F = SM.F
    for p in (*FUELS, "all"):
        for sz in ("L", "ML"):
            for Hs in ("H5", "all_H"):
                drift, r1, r0, nn = [], [], [], 0
                for r in recs:
                    if r["p"] not in FUELS or (p != "all" and r["p"] != p) or r["o"] > 2016:
                        continue
                    if r["size"] not in (("L",) if sz == "L" else ("L", "M")) or not r.get("cell_ok", True):
                        continue
                    o = r["o"]
                    f = F.get(kind, r["iso"], r["p"], o)
                    if not f:
                        continue
                    for t in sorted(r["actual"]):
                        if Hs == "H5" and t != o + 5:
                            continue
                        st = F.share(kind, r["iso"], r["p"], t, o)
                        d1 = SM.dhat(kind, r["iso"], r["p"], o, t, True)
                        d0 = SM.dhat(kind, r["iso"], r["p"], o, t, False)
                        if not st or d1 is None or d0 is None:
                            continue
                        y = math.log(st / f["sh0"])
                        drift.append(y)
                        r1.append(y - d1[0])
                        r0.append(y - d0[0])
                    nn += 1
                if len(drift) < 10:
                    continue
                dv = np.array(drift)
                out[f"{p}/{sz}/{Hs}"] = {
                    "n": len(drift),
                    "median_abs_drift": round(float(np.median(np.abs(dv))), 3),
                    "SHR": {"var_explained": round(1 - float(np.var(r1)) / float(np.var(dv)), 3),
                            "mse_explained": round(1 - float(np.mean(np.square(r1))) / float(np.mean(np.square(dv))), 3),
                            "median_abs_residual": round(float(np.median(np.abs(r1))), 3)},
                    "SHR0": {"var_explained": round(1 - float(np.var(r0)) / float(np.var(dv)), 3),
                             "mse_explained": round(1 - float(np.mean(np.square(r0))) / float(np.mean(np.square(dv))), 3),
                             "median_abs_residual": round(float(np.median(np.abs(r0))), 3)},
                }  # fmt: skip
    return out


# --------------------------------------------------------------------------------------------------------------------
# war-time application
# --------------------------------------------------------------------------------------------------------------------

YEARS = s49.YEARS
FRAC = s49.FRAC


def supply_index(p: str, lng_frac: float, iso: str, var: str) -> list[float]:
    """Russia's no-war supply index for 2021..2026 (2021 = 1)."""
    if p == "gas":
        pipe = [1.0] * 5 if iso == "CHN" else SUPPLY["gas_pipe"][var]  # China's pipeline gas: Power of Siberia (INFRA)
        return [1.0] + [(1 - lng_frac) * a + lng_frac * b for a, b in zip(pipe, SUPPLY["lng"][var])]
    return [1.0] + SUPPLY[p][var]


def share_factor(SM: ShareModel, kind: str, iso: str, p: str) -> dict | None:
    """exp(predicted share change 2021 -> t) from the SHR0 fit at origin 2021 (training pairs ending by 2021)."""
    F = SM.F
    f = F.get(kind, iso, p, 2021)
    if not f:
        return None
    b = SM.coef(kind, p, 2021, False)
    out, used_all = [1.0], set()
    parts = []
    for t in YEARS[1:]:
        h = t - 2021
        z4, used = infra(F.Pn, iso, p, 2021, t, f["base"], F.unit(kind, p), SITE_ALREADY)
        used_all.update(used)
        d = b[0] * h * f["g1"] + b[1] * h * f["g2"] + z4
        out.append(math.exp(d))
        parts.append([round(b[0] * h * f["g1"], 4), round(b[1] * h * f["g2"], 4), round(z4, 4)])
    return {"factor": [round(x, 4) for x in out], "g_share": round(f["g1"], 4), "g_demand": round(f["g2"], 4),
            "b": b, "parts_trend_demand_infra": parts, "infra": sorted(used_all), "data": kind}  # fmt: skip


def lng_fraction(iso: str, prices: dict) -> float:
    mx = (prices.get(iso) or {}).get("mix_2018_2021") or {}
    pg, lg = mx.get("pipeline_gas", 0) or 0, mx.get("lng", 0) or 0
    if pg + lg > 0:
        return lg / (pg + lg)
    return 0.0 if iso in s49.GAS_EUROPE else 1.0


# --------------------------------------------------------------------------------------------------------------------
# run
# --------------------------------------------------------------------------------------------------------------------

CMP_MODELS = ("CUR", "M0", "D", "SUP", "SHR", "SHR0", "SHRa", "SHRa0", "SHRf0")


def run() -> None:
    t0 = time.time()
    B = s49.Baci()
    T = s49.Totals(B)
    oil_real, oil_exp = s49.oil_paths()
    ea = s49.eurostat_annual(s49.load_eurostat())
    csz = s49.country_sizes(B)
    r47 = json.loads((GAPS / "cf_models_r47.json").read_text())["bias_correction_small"]["median_cumulative_log_error"]
    E = s49.Errors(r47)
    pr = s49.baci_preds(B, T, csz, oil_real, oil_exp)
    er = s49.eurostat_preds(ea, B, T, csz, oil_real, oil_exp)
    Pn = Panel()
    F = Feat(Pn, ea)
    SM = ShareModel(F)
    print("training rows", {f"{k}/{p}": len(v) for (k, p), v in SM.rows.items()}, round(time.time() - t0, 1),
          file=sys.stderr)  # fmt: skip
    nb = add_share_preds(pr, "baci", SM, Pn)
    ne = add_share_preds(er, "es", SM, Pn)
    SMf = ShareModel(F, BOUNDS_FREE, SM.rows)  # post-hoc diagnostic (free signs), never proposed
    free_names = ("SHRf", "SHRf0", "SHRfa", "SHRfa0")
    add_share_preds(pr, "baci", SMf, Pn, free_names)
    add_share_preds(er, "es", SMf, Pn, free_names)
    print("records", len(pr), len(er), "with SHR", nb, ne, round(time.time() - t0, 1), file=sys.stderr)
    comp = s49.composite_cases(pr, B, {})
    for cut in (2016, 2008, 2013):
        E.set_bias(cut, comp)
    for recs in (pr, er):
        for r in recs:
            r["e"] = E.errs(r, 2016)
            r["e_plc"] = {name: E.errs(r, last) for name, (_, _, last) in s49.PLACEBOS.items()}
    cells_b = [r for r in pr if r["cell_ok"] and r["size"] and r["p"] in FUELS]
    er_f = [r for r in er if r["p"] in FUELS]
    data_sets = (("BACI", cells_b), ("Eurostat_origin_volumes", er_f))

    # ---- the rule: SHR (and SHR0 for application consistency) against CUR, per product x size cell
    verdict: dict = {m: {n: {} for n, _ in data_sets} for m in ("SHR", "SHR0", "SHRa", "SHRa0", "SHRf", "SHRf0")}
    for model in verdict:
        for name, cases in data_sets:
            for p in FUELS:
                pooled = [c for c in cases if c["p"] == p and c["e"].get(model)]
                for s in SIZES_SCOPE:
                    rows = [c for c in pooled if c["size"] == s]
                    if rows:
                        verdict[model][name][f"{p}/{s}"] = s49.judge(rows, pooled, model)
    final: dict = {}
    for name, _ in data_sets:
        final[name] = {}
        for p in FUELS:
            for s in SIZES_SCOPE:
                key = f"{p}/{s}"
                v1, v0 = verdict["SHR"][name].get(key), verdict["SHR0"][name].get(key)
                if not v1:
                    continue
                under_rule = s == "L" or final[name].get(f"{p}/L", {}).get("proposed", False)
                st = {"under_rule": under_rule, "SHR_pass": v1["PASS"], "SHR0_pass": bool(v0 and v0["PASS"])}
                st["proposed"] = under_rule and st["SHR_pass"] and st["SHR0_pass"]
                if not under_rule:
                    st["why"] = "mid-size: diagnostic only (the product's L cell does not pass)"
                elif st["SHR_pass"] and not st["SHR0_pass"]:
                    st["why"] = (
                        "passes only with information the war-time application cannot have (SHR0 fails: "
                        + (v0["why_not"] if v0 else "no cases")
                        + ")"
                    )
                elif not st["SHR_pass"]:
                    st["why"] = v1["why_not"]
                final[name][key] = st
    passed = {n: sorted(k for k, v in d.items() if v["proposed"]) for n, d in final.items()}

    # ---- comparisons per cell: every model's error per origin (CUR / M0 / D / SUP / SHR / SHR0 / SHRa / SHRa0)
    cmp_cells: dict = {}
    for name, cases in data_sets:
        cmp_cells[name] = {}
        for p in FUELS:
            for s in (*SIZES_SCOPE, "S"):
                rows = [c for c in cases if c["p"] == p and c["size"] == s and c["o"] <= 2016]
                if not rows:
                    continue
                acc = s49.acc_by_origin(rows, CMP_MODELS)
                cell = {"n": len(rows), "by_origin": {str(o): {m: a[m]["err"] for m in CMP_MODELS if m in a} | {"n": a["n"]}
                                                      for o, a in acc.items()}}  # fmt: skip
                for m in CMP_MODELS[1:]:
                    g = [a[m]["gain"] for a in acc.values() if "gain" in a.get(m, {}) and a["n"] >= 5]
                    if g:
                        cell[m] = {"origins_ge_15pct": sum(x >= s49.RULE_GAIN for x in g), "of": len(g),
                                   "worst": round(min(g), 3), "median": round(float(np.median(g)), 3),
                                   "mean_error": round(float(np.mean([a[m]["err"] for a in acc.values() if m in a])), 4)}  # fmt: skip
                cell["CUR_mean_error"] = round(float(np.mean([a["CUR"]["err"] for a in acc.values() if "CUR" in a])), 4)
                cmp_cells[name][f"{p}/{s}"] = cell
    decomp = {"BACI": decomposition(SM, "baci", cells_b), "Eurostat_origin_volumes": decomposition(SM, "es", er_f)}
    decomp_free = {
        "BACI": decomposition(SMf, "baci", cells_b),
        "Eurostat_origin_volumes": decomposition(SMf, "es", er_f),
    }
    coefs_free = {
        f"{k}/{p}": {str(o): {"SHR": SMf.fits.get((k, p, o, True)), "SHR0": SMf.fits.get((k, p, o, False))}
                     for o in (2005, 2008, 2012, 2016)}
        for k in ("baci", "es") for p in FUELS
    }  # fmt: skip
    coefs = {f"{k}/{p}": {str(o): {"SHR": SM.fits.get((k, p, o, True)), "SHR0": SM.fits.get((k, p, o, False))}
                          for o in (*ORIGINS, 2017, 2021) if (k, p, o, True) in SM.fits or (k, p, o, False) in SM.fits}
             for k in ("baci", "es") for p in FUELS}  # fmt: skip
    print("judged", passed, round(time.time() - t0, 1), file=sys.stderr)

    # ---- country totals (BACI composite), for the band rescaling and the per-origin chart
    eu_cov = set(ea)

    def in_scope(p, s):
        return p in FUELS and (s == "L" or (s == "M" and any(k == f"{p}/L" for v in passed.values() for k in v)))

    def accepted(p, size_p, iso):
        if not in_scope(p, size_p):
            return False
        name = "Eurostat_origin_volumes" if iso in eu_cov else "BACI"
        return f"{p}/{size_p}" in passed[name]

    variants = {
        "PASS": ("SHR0", accepted),
        "DIAG": ("SHR0", lambda p, s, i: in_scope(p, s)),
        "DIAG_SHR": ("SHR", lambda p, s, i: in_scope(p, s)),
        "DIAG_D": ("D", lambda p, s, i: in_scope(p, s)),
        "DIAG_SUP": ("SUP", lambda p, s, i: in_scope(p, s)),
    }
    for c in comp:
        c["e"] = {"CUR": s49.comp_errs(c, E, "CUR", lambda p, s, i: False)}
        c["e_plc"] = {}
        for v, (mod, act) in variants.items():
            c["e"][v] = s49.comp_errs(c, E, mod, act)
        for name, (_, _, last) in s49.PLACEBOS.items():
            c["e_plc"][name] = {v: s49.comp_errs(c, E, mod, act, last) for v, (mod, act) in variants.items()}
    vnames = ("CUR", *variants)
    comp_res: dict = {"by_size_pooled": {}, "by_size_origin": {}, "bands": {}, "placebo": {}}
    rho: dict = {}
    for s in ("M", "L", "all"):
        rows = [c for c in comp if s == "all" or c["csize"] == s]
        comp_res["by_size_pooled"][s] = s49.summary(rows, vnames)
        comp_res["by_size_origin"][s] = {
            str(o): {m: [v.get("err"), v.get("gain")] for m, v in cell.items() if m != "n"} | {"n": cell["n"]}
            for o, cell in s49.acc_by_origin([c for c in rows if c["o"] <= 2016], vnames).items()
        }
        if s == "all":
            continue
        comp_res["bands"][s], rho[s] = {}, {}
        for m in vnames:
            comp_res["bands"][s][m] = {}
            for H in range(1, 6):
                b = s49.band_of(rows, m, H)
                comp_res["bands"][s][m][f"H{H}"] = {k: b.get(k) for k in ("band", "K", "n", "log_width")}
                b0 = s49.band_of(rows, "CUR", H)
                if m != "CUR" and "log_lo" in b and "log_lo" in b0:
                    rho[s].setdefault(m, {})[H] = (b["log_lo"] / b0["log_lo"], b["log_hi"] / b0["log_hi"])
            comp_res["placebo"].setdefault(s, {})[m] = s49.placebo_cov(rows, m, s49.band_of(rows, m, 5).get("K", 1.0))
    print("composite", round(time.time() - t0, 1), file=sys.stderr)

    # ---- application to the site's current data
    site = Path(s49.arg("--site") or ROOT / "site")
    D = json.loads((site / "data.json").read_text())
    nwi = json.loads((GAPS / "energy_nowar.json").read_text())["nowar_index"]
    prices = json.loads((GAPS / "prices.json").read_text())["countries"]
    e2 = json.loads((GAPS / "energy2.json").read_text())["fuel_mix_2019_2021"]
    patch: dict = {"proposal": {}, "diagnostic": {}}
    per_country = {}
    for iso, c in sorted(D["countries"].items()):
        tr = c.get("to_rus")
        if not tr or not tr.get("base") or not tr.get("bmul"):
            continue
        base = tr["base"]
        size_c = s49.size_of(base * 1e9)
        _fs, w, wsrc = s49.product_weights(iso, prices, e2, B)
        cur = tr.get("cur") or [1.0] * 6
        nwp = {}
        for p in w:
            if p in FUELS or p == "fuel_rest":
                bb = s49.NW_BENCH.get(p) or ("ttf" if iso in s49.GAS_EUROPE else "jkm")
                nwp[p] = [1.0] + [nwi[bb][str(y)]["actual" if y >= 2026 else "central"] for y in YEARS[1:]]
            else:
                nwp[p] = [1.0] * 6
        sizes_p = {p: s49.size_of(base * 1e9 * v) if base * v >= s49.MIN_EUR / 1e9 else None for p, v in w.items()}
        lf = lng_fraction(iso, prices)
        row = {"size": size_c, "base_eur_bn": base, "weights": {p: round(v, 4) for p, v in w.items() if v},
               "weights_source": wsrc, "product_size": {p: s for p, s in sizes_p.items() if s}, "hub": iso in s49.HUBS,
               "lng_fraction_of_gas": round(lf, 3)}  # fmt: skip
        factors = {}
        for p in FUELS:
            if not w.get(p) or not in_scope(p, sizes_p.get(p)):
                continue
            kind = "es" if iso in eu_cov and p in ea.get(iso, {}) else "baci"
            sf = share_factor(SM, kind, iso, p)
            if sf is None and kind == "es":
                sf = share_factor(SM, "baci", iso, p)
            if sf is None:
                continue
            sf["supply"] = {v: [round(x, 4) for x in supply_index(p, lf, iso, v)] for v in ("low", "central", "high")}
            factors[p] = sf
        row["factors"] = factors
        for var in ("proposal", "diagnostic"):
            if iso in s49.HUBS:
                row[var] = {"active": [], "changed": False, "why": "hub: current method"}
                continue
            if var == "proposal":
                act = {p for p in factors if size_c != "S" and accepted(p, sizes_p[p], iso)}
            else:
                act = set(factors)
            if not act:
                row[var] = {"active": [], "changed": False}
                continue
            Fv = {}
            for sv in ("low", "central", "high"):
                Fx = [1.0]
                for i in range(1, 6):
                    den = sum(w[p] * nwp[p][i] for p in w) or 1.0
                    num = sum(w[p] * nwp[p][i] * (factors[p]["supply"][sv][i] * factors[p]["factor"][i]
                                                  if p in act else 1.0) for p in w)  # fmt: skip
                    Fx.append(num / den)
                Fv[sv] = Fx
            Fc = Fv["central"]
            q0, ql0, qh0 = tr["bmul"], tr.get("bmul_lo") or tr["bmul"], tr.get("bmul_hi") or tr["bmul"]
            bm = [round(q0[i] * Fc[i], 4) for i in range(6)]
            r = rho.get(size_c, {}).get("PASS" if var == "proposal" else "DIAG", {})
            r1 = r.get(1, (1.0, 1.0))
            slo = [Fv["low"][i] / Fc[i] for i in range(6)]
            shi = [Fv["high"][i] / Fc[i] for i in range(6)]
            bl = [1.0] + [round(bm[i] * max(0.05, 1 - (1 - ql0[i] / q0[i]) * r1[0]) * slo[i], 4) for i in range(1, 6)]
            bh = [1.0] + [round(bm[i] * (1 + (qh0[i] / q0[i] - 1) * r1[1]) * shi[i], 4) for i in range(1, 6)]
            cb = [None]
            for n in range(1, 6):
                lo, hi = (tr.get("cb") or [None] * 6)[n] or [ql0[n] / q0[n], qh0[n] / q0[n]]
                rr = r.get(n, (1.0, 1.0))
                cb.append(
                    [round(max(0.05, 1 - (1 - lo) * rr[0]) * slo[n], 4), round((1 + (hi - 1) * rr[1]) * shi[n], 4)]
                )
            patch[var][iso] = {"bmul": bm, "bmul_lo": bl, "bmul_hi": bh, "cb": cb}
            E5 = [base * FRAC[i] * cur[i] for i in range(6)]
            row[var] = {
                "active": sorted(act),
                "changed": True,
                "F": {k: [round(x, 4) for x in v] for k, v in Fv.items()},
                "band_ratio_used_H1_H5": {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in r.items()},
                "nowar_2022_2026_eur_bn_before_after": [
                    round(sum(E5[i] * q0[i] for i in range(1, 6)), 4),
                    round(sum(E5[i] * bm[i] for i in range(1, 6)), 4),
                ],
            }
        per_country[iso] = row
    SCRATCH.mkdir(parents=True, exist_ok=True)
    (SCRATCH / "site_patch_r50.json").write_text(json.dumps(patch))
    print("application", len(per_country), round(time.time() - t0, 1), file=sys.stderr)

    # ---- check: round 49's SUP and round 48's D reproduced on the same cases (median gain against M0)
    repro = {}
    r49 = json.loads((GAPS / "supply_cf_r49.json").read_text())
    for key in ("crude/L", "coal/M", "products/L"):
        p, s = key.split("/")
        rows = [c for c in cells_b if c["p"] == p and c["size"] == s and c["o"] <= 2016]
        acc = s49.acc_by_origin(rows, ("CUR", "SUP"), "CUR")
        g = [acc[o]["SUP"]["gain"] for o in acc if "gain" in acc[o].get("SUP", {}) and acc[o]["n"] >= 5]
        repro[key] = {"r49_SUP_median_gain_vs_CUR": r49["verdict_by_cell"]["SUP"]["BACI"].get(key, {}).get("median_gain"),
                      "here": round(float(np.median(g)), 3) if g else None, "n_here": len(rows),
                      "n_r49": r49["verdict_by_cell"]["SUP"]["BACI"].get(key, {}).get("n_cases")}  # fmt: skip

    def chart(recs, data):
        out = []
        for p in FUELS:
            for s in SIZES_SCOPE:
                rows = [c for c in recs if c["p"] == p and c["size"] == s and c["o"] <= 2016]
                for o, cell in s49.acc_by_origin(rows, CMP_MODELS).items():
                    for m in CMP_MODELS:
                        if m in cell:
                            out.append([data, p, s, o, m, cell["n"], cell[m]["err"], cell[m].get("gain")])
        return out

    infra_hits: dict = {}
    for name, cases in data_sets:
        for r in cases:
            for e in r.get("infra", []):
                infra_hits.setdefault(name, {}).setdefault(e, set()).add(f"{r['iso']}/{r['p']}")
    out = {
        "generated": time.strftime("%Y-%m-%d"),
        "round": 50,
        "status": "research; nothing here is read by the build. Site figures computed on site/data.json of 2026-10-25 "
        "(round 47 live)",
        "question": "Can the buyer's share of Russia's exports be predicted (share model x Russia's no-war supply x "
        "no-war price) better than the current site rule?",
        "rule": RULE,
        "verdict_by_cell": verdict,
        "final_by_cell": final,
        "passed_cells": passed,
        "comparisons_by_cell": cmp_cells,
        "chart_rows": {
            "columns": ["data", "product", "size", "origin", "model", "n", "error", "gain_vs_CUR"],
            "rows": chart(cells_b, "BACI") + chart(er_f, "Eurostat_origin_volumes"),
        },
        "share_drift_explained_out_of_sample": decomp,
        "posthoc_free_signs": {
            "note": "added AFTER the results: the pre-registered bounds b1, b2 in [0, 1] sat at 0 at most origins, so "
            "the same model was refitted with free signs (mean reversion allowed). Diagnostic only, never proposed; "
            "judged cells are in verdict_by_cell.SHRf / SHRf0",
            "share_drift_explained_out_of_sample": decomp_free,
            "coefficients": coefs_free,
        },
        "coefficients_by_origin": coefs,
        "training_pairs": {f"{k}/{p}": len(v) for (k, p), v in SM.rows.items()},
        "eurostat_total_basis": F.es_basis,
        "composite_country_total": comp_res,
        "band_ratio_vs_CUR_log_lo_hi": {
            s: {m: {f"H{h}": [round(a, 3), round(b, 3)] for h, (a, b) in d.items()} for m, d in v.items()}
            for s, v in rho.items()
        },
        "supply_nowar_index_2022_2026": SUPPLY,
        "supply_sources": SOURCES,
        "infrastructure": INFRA,
        "infrastructure_cases_touched": {n: {e: sorted(v) for e, v in d.items()} for n, d in infra_hits.items()},
        "russia_fuel_tonnes_mt_baci_1995_2024": {
            p: {str(y): round(Pn.Tton[p][y] / 1e6, 1) for y in YEARS_ALL} for p in FUELS
        },
        "per_country": per_country,
        "reproduction_check_r49": repro,
    }
    prev = GAPS / "share_cf_r50.json"
    if prev.exists():
        old = json.loads(prev.read_text())
        for k in ("site_before_after", "site_before_after_summary"):
            if k in old:
                out[k] = old[k]
    prev.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":"), default=list))
    print("written", round(time.time() - t0, 1), file=sys.stderr)


def merge(path: str) -> None:
    res = json.loads(Path(path).read_text())
    f = GAPS / "share_cf_r50.json"
    out = json.loads(f.read_text())
    out["site_before_after"] = res["countries"]
    out["site_before_after_summary"] = res["summary"]
    f.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))


if __name__ == "__main__":
    cmd = sys.argv[1:2]
    if cmd == ["fetch"]:
        fetch()
    elif cmd == ["run"]:
        run()
    elif cmd == ["merge"]:
        merge(sys.argv[2])
    else:
        print(__doc__)
