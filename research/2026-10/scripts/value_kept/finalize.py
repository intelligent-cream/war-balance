# ruff: noqa
import json

B = str(__import__("pathlib").Path(__file__).resolve().parent) + "/"
T = json.load(open(B + "table.json"))
C = json.load(open(B + "compare.json"))
OUT = str(__import__("pathlib").Path(__file__).resolve().parents[2] / "gaps" / "value_kept.json")
cmp = []
for x in C[:15]:
    t = T[x["iso"]]
    P = lambda f, k="product": t[f][k]["central"]
    war_old = 0.2 * (x["fb"] + x["sell"])
    war_new = P("flowback_weapons") * x["fb"] + P("sales_to_ukraine_extra") * x["sell"]
    rus_old = (
        0.2 * (x["sold"] + x["svc"]) + x["ship"] * -1
    )  # toward Ukraine positive: lost sales positive, shipping earnings negative
    pl = P("sales_to_russia_lost") if x["sold"] > 0 else P("sales_to_russia_extra")
    ps = P("services_to_russia") if x["svc"] > 0 else P("services_to_russia", "product_when_more")
    rus_new = pl * x["sold"] + ps * x["svc"] - P("shipping") * x["ship"] / 0.35
    cmp.append(
        {
            "iso3": x["iso"],
            "gross_flowback_eur_bn": round(x["fb"], 2),
            "gross_extra_sales_to_ukraine_eur_bn": round(x["sell"], 2),
            "sales_to_russia_change_eur_bn (+ = less sold)": round(x["sold"], 2),
            "services_to_russia_change_eur_bn (+ = less sold)": round(x["svc"], 2),
            "shipping_profit_now_eur_bn": round(x["ship"], 2),
            "earned_from_war_effort_old_0.2": round(war_old, 2),
            "earned_from_war_effort_new": round(war_new, 2),
            "russia_trade_part_old (+ toward Ukraine)": round(rus_old, 2),
            "russia_trade_part_new (+ toward Ukraine)": round(rus_new, 2),
            "weighted_factor_old": round(
                x["old"] / (x["fb"] + x["sell"] + abs(x["sold"]) + abs(x["svc"]) + abs(x["ship"]) / 0.35), 3
            )
            if x["old"]
            else None,
            "weighted_factor_new": round(
                x["new"] / (x["fb"] + x["sell"] + abs(x["sold"]) + abs(x["svc"]) + abs(x["ship"]) / 0.35), 3
            )
            if x["new"]
            else None,
        }
    )
doc = {
    "generated": "2026-10-18",
    "meta": {
        "what": "Round 6 steps A3 (value kept) and A4 (genuinely extra): per country and flow type, the share of a sale's revenue that stays in the seller's economy as domestic value added (value_kept), times the share of that value added that would not exist without the war-related sale (extra). Their product replaces the flat 20% profit margin (META.lost_margin) and SHIPPING_PROFIT['freight'].",
        "units": "dimensionless shares of gross revenue (sales value), each {low, central, high}, ~90% range. Multiply a gross EUR flow by product.",
        "flow_types": {
            "flowback_weapons": "flowback.own, flowback.purl_in and flowback.arms (aid or Ukraine's money spent with the country's defence industry)",
            "flowback_other": "non-weapon goods bought with aid from the donor's own economy (A1 ledger, if split out)",
            "sales_to_russia_lost": "from_rus when the change is positive (sold less than expected)",
            "sales_to_russia_extra": "from_rus when negative (sold more than expected)",
            "sales_to_ukraine_extra": "sell_ukr rise above the expected level",
            "services_to_russia": "svc_sold; 'product' when sold less, 'product_when_more' when sold more",
            "shipping": "freight earned carrying Russian oil (gross freight; data.json stores profit at SHIPPING_PROFIT freight, divide by it first)",
        },
        "method": "value_kept: OECD TiVA 2025 edition, indicator EXGR_DVA in % of gross exports (domestic value added content of exports, counterpart World), central = mean of 2021 and 2022 (latest year), range = min/max over 2018-2022 widened by 0.03; industries: weapons = mean of C25, C26, C28, C302T309 widened, overridden by defence-industry evidence for 22 producers; goods = BTE; other flowback = C; services = mean of I and GTN; shipping = H50; fuel = C19. Countries outside TiVA's 76 economies use a regional proxy (+-0.07 wider). extra: evidence-based sector factors with country overrides (capacity ramp-ups for weapons, redirection studies for lost sales, overcapacity for extra sales, tourism recovery for services, freight premium for shipping). product: central = vk x extra; low/high combine the two log-ranges in quadrature (independent uncertainties), capped at vk_high x extra_high.",
        "certainty": "value_kept B for TiVA countries, C for regional proxies and defence overrides; extra C (sector evidence) to D (country guesses)",
        "fx": "not needed (shares)",
    },
    "sector_factors": {
        "flowback_weapons": {
            "value_kept": "0.55-0.90 by producer (US 0.90, Western Europe 0.68-0.75, CEE ammunition 0.55-0.68)",
            "extra": {
                "low": 0.40,
                "central": 0.60,
                "high": 0.80,
                "US": "0.50/0.70/0.85",
                "DEU": "0.45/0.65/0.85",
                "CZE": "0.55/0.75/0.90",
                "BGR": "0.50/0.70/0.85",
            },
        },
        "flowback_other": {
            "value_kept": "TiVA manufacturing (C)",
            "extra": {"low": 0.25, "central": 0.45, "high": 0.65},
        },
        "sales_to_russia_lost": {
            "value_kept": "TiVA goods (BTE)",
            "extra (not redirected)": {
                "large diversified exporters": "0.20/0.35/0.55",
                "commodity exporters": "0.10/0.20/0.40",
                "Finland": "0.15/0.30/0.50",
                "Baltics": "0.25/0.45/0.65",
                "default": "0.25/0.40/0.60",
            },
        },
        "sales_to_russia_extra": {
            "value_kept": "TiVA goods (BTE); hub margins 0.85",
            "extra": {
                "China": "0.40/0.60/0.80",
                "Türkiye": "0.25/0.45/0.65",
                "Belarus": "0.20/0.40/0.60",
                "Central Asia/Caucasus own production": "0.40/0.60/0.80",
                "default": "0.30/0.50/0.70",
            },
        },
        "sales_to_ukraine_extra": {
            "value_kept": "fuel share x C19 + rest x BTE",
            "extra": {"fuel": "0.10/0.20/0.40", "other goods": "0.25/0.45/0.65"},
        },
        "services_to_russia": {
            "value_kept": "mean of TiVA I and GTN",
            "extra when lost": {
                "tourism/transport default": "0.15/0.30/0.50",
                "border shopping (FIN, Baltics, NOR)": "0.30/0.50/0.70",
                "business/financial (CYP, CHE, GBR, LUX, MLT...)": "0.30/0.50/0.70",
            },
            "extra when more": {"Georgia/Armenia": "0.50/0.70/0.85", "default": "0.30/0.50/0.70"},
        },
        "shipping": {
            "value_kept": "TiVA H50 (Greece 0.40 adjusted)",
            "extra": {"mainstream owners": "0.25/0.45/0.65", "shadow-fleet controllers": "0.45/0.65/0.85"},
        },
    },
    "countries": T,
    "comparison_top15": {
        "note": "Gross flows are approximate central 2022-2026 sums recomputed from site/data.json (change against the expected level, without the range machinery of calc()); EUR bn. 'old' = 0.2 (shipping 0.35 of freight); 'new' = product central. Signs in the russia_trade columns: + = toward Ukraine (sales given up), - = toward Russia (extra sales, shipping earnings).",
        "rows": cmp,
    },
    "sanity_checks": [
        "US weapons product 0.63 (0.46-0.78): within the expected 0.5-0.7.",
        "Germany weapons 0.47 (0.33-0.63); Czechia 0.41 (low value kept because of re-exported and refurbished foreign stocks, high extra); Bulgaria 0.48.",
        "Product never exceeds value kept; highest products are US weapons (0.63) and Chinese shadow shipping (0.53); lowest are Greek extra sales to Ukraine (0.05, 90% fuel refined from imported crude) and commodity exporters' lost sales (~0.17).",
        "Sales to Russia lost: products 0.18-0.31 (close to the old 0.2 for redirect-friendly economies such as Finland 0.18, a bit higher for large exporters ~0.25-0.31); the change in the Russia balance is moderate.",
        "Extra sales to Russia: China 0.49, Türkiye 0.30, Belarus 0.24: China's earning from Russia more than doubles versus 0.2.",
        "Shipping falls for Greek owners (0.18 vs 0.35 now) because TiVA shows low domestic value added in Greek water transport and much of the freight would have been earned on other routes anyway; rises for shadow-fleet controllers (UAE 0.33, China 0.53, India 0.38).",
    ],
    "sources": [
        {
            "name": "OECD Trade in Value Added (TiVA) 2025 edition, Principal Indicators (shares), EXGR_DVA PT_EXGR, SDMX DSD_TIVA_MAINSH@DF_MAINSH 1.1",
            "url": "https://sdmx.oecd.org/sti-public/rest/data/OECD.STI.PIE,DSD_TIVA_MAINSH@DF_MAINSH,1.1/EXGR_DVA..BTE+C+C19+C25+C26+C28+C302T309+GTN+H50+I.W.PT_EXGR.A?startPeriod=2018&format=csv",
            "date": "retrieved 2026-10-18",
        },
        {
            "name": "UN Comtrade public API, Ukraine imports by partner, HS 27 and TOTAL, 2021/2023/2024",
            "url": "https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=804&period=2023&cmdCode=27,TOTAL&flowCode=M",
            "date": "retrieved 2026-10-18",
        },
        {
            "name": "DoD DFARS final rule on domestic content (65% 2024-28, 75% from 2029), Federal Register 89(32)",
            "url": "https://www.govinfo.gov/content/pkg/FR-2024-02-15/html/2024-01220.htm",
            "date": "2024-02-15",
        },
        {
            "name": "Defense Daily / Defense News: US Army 155mm ramp-up (14,000-14,500/month before 2022; 85,000 target by 2028)",
            "url": "https://www.defensenews.com/digital-show-dailies/2023/03/28/us-army-eyes-six-fold-production-boost-of-155mm-shells-used-in-ukraine/",
            "date": "2023-03-28",
        },
        {
            "name": "The Defense Post: US artillery shell production ~40,000/month mid-2025",
            "url": "https://thedefensepost.com/2025/06/19/us-artillery-shells-production/amp/",
            "date": "2025-06-19",
        },
        {
            "name": "Pentagon IG via CBS News/UkrNews: ~36,000 shells/month March 2026",
            "url": "https://ukranews.com/en/amp/news/1163285-us-unable-to-increase-production-of-155-mm-shells-to-100-000-per-month-in-two-years-cbs-news",
            "date": "2026",
        },
        {
            "name": "Rheinmetall Expal 450,000 rounds/yr; Rheinmetall group ~700,000 rounds (2025), Unterlüß 350,000",
            "url": "https://defence-industry.eu/rheinmetall-expal-munitions-reaches-450000-annual-output-of-155mm-shells/",
            "date": "2025",
        },
        {
            "name": "Army Technology: Rheinmetall Unterlüß ammunition plant",
            "url": "https://www.army-technology.com/news/rheinmetall-ammunition-factory-germany/",
            "date": "2025-08",
        },
        {
            "name": "LIGA.net / CSG: Czech initiative sourcing (own production, partner production abroad, bought stockpiles); 3.7m rounds",
            "url": "https://news.liga.net/en/amp/politics/news/the-arms-giant-disclosed-how-many-shells-ukraine-received-under-the-czech-initiative-and-their-cost",
            "date": "2025",
        },
        {
            "name": "Janes: South Korea parts localisation; Asia Economy: core component localisation 65%",
            "url": "https://janes.com/osint-insights/defence-news/industry/south-korea-increases-focus-on-parts-localisation",
            "date": "2022-2025",
        },
        {
            "name": "Hurriyet Daily News: Turkish defence local content 82-83% (official)",
            "url": "https://www.hurriyetdailynews.com/defense-industrys-local-content-at-83-pct-gorgun-227711",
            "date": "2025",
        },
        {
            "name": "Middle East Forum: Turkey's defence industry far from self-sufficient (engines)",
            "url": "https://www.meforum.org/turkeys-defense-industry-far-from-independent",
            "date": "2021",
        },
        {
            "name": "Draghi report on EU competitiveness (via Defense News): 78% of EU defence procurement June 2022-June 2023 from outside the EU, 63% US",
            "url": "https://defensenews.com/global/europe/2024/09/10/eu-told-to-hire-defense-commissioner-to-compete-with-us",
            "date": "2024-09-10",
        },
        {
            "name": "Taiwan arms backlog USD 18.7bn, Ukraine diversion cited (WSJ via Taiwan News) and contested (War on the Rocks)",
            "url": "https://www.taiwannews.com.tw/en/news/4733798",
            "date": "2022-11",
        },
        {
            "name": "War on the Rocks: The real reasons for Taiwan's arms backlog",
            "url": "https://warontherocks.com/?p=28091",
            "date": "2023",
        },
        {
            "name": "Haidar, J.I. (2017) Sanctions and export deflection: evidence from Iran, Economic Policy 32(90)",
            "url": "https://growthlab.hks.harvard.edu/publication/sanctions-and-export-deflection-evidence-from-iran/",
            "date": "2017-04",
        },
        {
            "name": "Crozet & Hinz (2016/2020) Collateral damage / Friendly fire: the trade impact of the Russia sanctions, CEPII WP 2016-16 / Economic Policy",
            "url": "https://cepii.fr/CEPII/en/publications/wp/BibTeX.asp?NoDoc=9213",
            "date": "2016",
        },
        {
            "name": "Crozet, Hinz, Stammann, Wanner (2021) Worth the pain? Firms' exporting behaviour to countries under sanctions, European Economic Review 134",
            "url": "https://ideas.repec.org/f/c/pwa654.html",
            "date": "2021",
        },
        {
            "name": "VATT Data Room (Toikka, Laasonen, Toivanen 2023): minor effects on Finnish firms that traded with Russia",
            "url": "https://vatt.fi/en/-/vatt-data-room-russian-invasion-of-ukraine-has-had-only-minor-economic-effects-on-finnish-firms-that-used-to-trade-with-russia",
            "date": "2023",
        },
        {
            "name": "Bank of Finland Bulletin (Simola 2024): collapse of trade with Russia had a limited effect on Finnish manufacturing",
            "url": "https://www.bofbulletin.fi/en/2024/3/the-collapse-of-trade-with-russia-has-had-a-limited-effect-on-finnish-manufacturing/",
            "date": "2024",
        },
        {
            "name": "CarNewsChina / Caixin: Chinese car exports to Russia 2023-2025",
            "url": "https://carnewschina.com/2025/11/17/chinese-auto-exports-to-russia-plummet-58-amid-policy-squeeze-and-market-cool-down/",
            "date": "2025-11-17",
        },
        {
            "name": "FastForward / KPMG Cyprus: arrivals 2023 at 97% of 2019 despite losing ~0.8m Russian visitors",
            "url": "https://fastforward.com.cy/business/cyprus-tourist-arrivals-surge-despite-loss-russian-market",
            "date": "2023",
        },
        {
            "name": "KPMG Cyprus hospitality newsletter June 2024",
            "url": "https://assets.kpmg.com/content/dam/kpmg/cy/pdf/2024/kpmg-cyprus-hospitality-newsletter-june-2024%20issue.pdf",
            "date": "2024-06",
        },
        {
            "name": "Argus Russian-origin freight assessments vs 'baseline' (sanctions premium); Baltic-India Aframax rates 2022 vs 2025 (Reuters via WorldPorts)",
            "url": "https://www.hellenicshippingnews.com/argus-launches-freight-rates-for-russian-crude-exports-to-india-and-china/",
            "date": "2025",
        },
        {
            "name": "WorldPorts: freight rates for Russian oil shipments to India",
            "url": "https://www.worldports.org/freight-rates-for-russian-oil-shipments-to-india-continue-to-climb",
            "date": "2025",
        },
    ],
    "overlaps": "This file holds factors only, no EUR flows, so it cannot double count by itself. It replaces META.lost_margin (0.2, x0.5-1.5) in profit3() and the flowback margin in calc(), and SHIPPING_PROFIT['freight'] in build_data.py. It must not be applied on top of them. Exceptions the builder must respect: (1) ua_arms_purchases.json CZE.broker_margin_profit is already a margin (value added): apply only an extra factor (0.75) or keep as is, not value_kept again. (2) Re-export hubs (trade.md): the trading margin a hub keeps is value added; apply 0.85 x extra to it, not the goods value_kept, and re-exports moved to origin countries take the origin's factors. (3) Shipping 'ship_sales' (price premium) and 'registry' keep SHIPPING_PROFIT; insurance_finance may use value_kept 0.85 (K sector) x the shipping extra. (4) The cost view's 'profit lost on sales to Russia' can use the same products. (5) Stock replacement (A2) and the ledger (A1) define the flows; this file only prices them.",
    "notes": "Value kept is wider than profit: it includes wages and domestic suppliers, which is why products for weapons (0.4-0.63) exceed 0.2. The extra factor is a firm/sector-level additionality; macro crowding-out at full employment is only in the low ends. TiVA's latest year is 2022; defence industries are not separate in TiVA, so weapons rely on proxies plus defence evidence (C). Ukraine-import fuel shares from UN Comtrade (B) apply to 12 countries; others assume 10-15% fuel (D). Country lists: 76 TiVA economies direct; others regional proxies listed in value_kept_src.",
}
json.dump(doc, open(OUT, "w"), indent=1, ensure_ascii=False)
for r in cmp:
    print(
        r["iso3"],
        r["earned_from_war_effort_old_0.2"],
        r["earned_from_war_effort_new"],
        r["russia_trade_part_old (+ toward Ukraine)"],
        r["russia_trade_part_new (+ toward Ukraine)"],
        r["weighted_factor_old"],
        r["weighted_factor_new"],
    )
for i in ["USA", "DEU", "CZE", "BGR", "ARE", "IND", "CHN", "GRC", "TUR", "FIN"]:
    print(
        i,
        {
            k: (v["product"]["low"], v["product"]["central"], v["product"]["high"])
            for k, v in T[i].items()
            if k in ("flowback_weapons", "shipping", "sales_to_russia_extra", "sales_to_russia_lost")
        },
    )
