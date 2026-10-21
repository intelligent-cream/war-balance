# Value kept and genuinely extra (round 6, steps A3 and A4)

Data file: `value_kept.json` (same folder). Scripts: [`../scripts/value_kept/`](../scripts/value_kept/) (`exposure.py`, `build.py`, `compare.py`, `finalize.py`; moved into the repository in round 13 from an unpublished working folder, audit M8). Downloads: [`../raw/oecd_tiva/`](../raw/oecd_tiva/) (TiVA extracts `dva.csv`, `dva2.csv`; Ukraine's imports by partner `ua_m_*.json`). **Not yet reviewed by a person.**

**Round 13:** the value kept is no longer used on the map. Every seller's earnings now count at its **net gain** (taxes plus profit above a normal return, [`net_gain_sellers.json`](net_gain_sellers.json)) × the **genuinely extra** share from this file, the same rule as for Russia and Ukraine. The products in this file are kept in `data.json` as `vk_old` for the method band.

## 1. What this is

Until now, money a country *earns* counted as a flat profit of 20% of the sale (range 0.5–1.5×). Shipping used
35% (20–50%). That applied to flowback, extra sales to Ukraine, sales to Russia given up or added, services sold to Russia,
and shipping Russian oil. The round-6 rule ([roadmap A](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how)) replaces it with:

> **counted share = value kept in the economy × share that is genuinely extra**

- **Value kept** is the share of a sale that is domestic value added: wages, profits and domestic suppliers' value
  added, but not imported parts and materials. It is wider than profit, so it is usually 0.5–0.9.
- **Genuinely extra** is the share of that value added that would not exist without the war-related sale. It is high
  when a factory was expanded for the war. It is low when firms simply sold the same goods to someone else.

The file gives a factor for every map country (231 ISO3) and seven flow types, each as `{low, central, high}`:
`flowback_weapons`, `flowback_other`, `sales_to_russia_lost`, `sales_to_russia_extra`, `sales_to_ukraine_extra`,
`services_to_russia` (with `product_when_more` for countries that sold more) and `shipping`. Every entry has a
`product` field: multiply a **gross** EUR flow by it.

## 2. Value kept (A3)

**Source.** OECD Trade in Value Added (TiVA), 2025 edition, which is the latest release. Its indicator EXGR_DVA, in % of gross
exports, is the domestic value added content of exports, by country and industry, with World as the counterpart. It covers 76 economies,
2018–2022. It was downloaded through OECD's SDMX service (`DSD_TIVA_MAINSH@DF_MAINSH`).
- Central value: the mean of 2021 and 2022.
- Range: the min and max over 2018–2022, widened by 0.03.

| flow | TiVA industry used |
|---|---|
| weapons | mean of fabricated metals (C25), electronics (C26), machinery (C28), other transport incl. military vehicles and aircraft (C302T309), widened ±0.10–0.12; defence evidence overrides for 22 producers |
| other flowback | manufacturing (C) |
| sales to/from Russia | goods: industry excl. construction (BTE) |
| extra sales to Ukraine | fuel share × refined petroleum (C19) + rest × BTE |
| services | mean of accommodation and food (I) and business services (GTN) |
| shipping | water transport (H50) |

**Weapons overrides.** TiVA has no defence industry, so for the main producers the proxy is replaced by evidence:
- **USA 0.90 (0.85–0.94).** The DFARS rule requires 65% domestic content in 2024–28, and most munitions are far above that. TiVA's US proxies are 87–95%.
- **Western European primes 0.68–0.75.** Germany, France, the UK and Italy have sovereign supply chains. The Draghi report found that 78% of EU procurement went outside the EU, but that is about buyers, not producers' inputs.
- **Korea 0.72.** DAPA targets 70–90% local components, and core parts are about 65% local.
- **Türkiye 0.72.** The official claim is 82–83%, but engines and electronics are imported.
- **Norway 0.63.** NASAMS fires US missiles.
- **Bulgarian and Serbian ammunition 0.68.**
- **Czechia 0.55 (0.40–0.70).** Czech-exported rounds include refurbished foreign stocks and partner production abroad. CSG itself names three sources: own plants, partners abroad and bought stockpiles.

**Countries outside TiVA** use a regional proxy, ±0.07 wider. The proxy is named in `value_kept_src`.

| proxy group | used for |
|---|---|
| TiVA CEE aggregate | the Balkans and Moldova |
| mean of KAZ, BLR, UKR | the Caucasus, Central Asia and Mongolia |
| SAU | oil exporters |
| mean of JOR, EGY | the rest of the Middle East |
| mean of 10 African economies | the rest of Africa |
| mean of 7 Latin American economies | the rest of Latin America |
| island economies (MLT, CYP, ISL, NZL) | small islands and territories |

**Fuel in extra sales to Ukraine.** UN Comtrade records Ukraine's imports by partner. The 2021→2023 rise from these
countries was mostly fuel (HS 27):
- Greece and Lithuania: 90%;
- Poland, Slovakia and Romania: 67–69%;
- Türkiye: 25%;
- Bulgaria: 17%.

Refining imported crude keeps little value: Greece's C19 value kept is 0.19, Lithuania's 0.09 and Poland's 0.48. Other countries
are assumed to be 10–15% fuel (D).

## 3. Genuinely extra (A4)

| flow | low / central / high | evidence |
|---|---|---|
| weapons, default | 0.40 / 0.60 / 0.80 | war-driven capacity growth; the low end allows for displaced buyers and crowding-out at full employment |
| weapons, USA | 0.50 / 0.70 / 0.85 | 155mm output rose from ~14,000/month (2022) to ~40,000 (mid-2025), and ~36,000 in March 2026 (Pentagon IG). GMLRS, Javelin and PAC-3 lines expanded with Ukraine money. Some displacement: Taiwan's USD 18.7bn backlog was partly blamed on Ukraine, though contested |
| weapons, Germany | 0.45 / 0.65 / 0.85 | Rheinmetall went to ~700,000 rounds/yr in 2025 (Expal 450,000; Unterlüß 350,000 planned); Gepard and IRIS-T lines restarted |
| weapons, Czechia | 0.55 / 0.75 / 0.90 | brokering and refurbishing stocks that would otherwise have sat idle; plant expansions |
| weapons, Bulgaria | 0.50 / 0.70 / 0.85 | defence exports rose from ~0.6bn/yr to 1.7–2.8bn; plants moved to three shifts |
| other flowback | 0.25 / 0.45 / 0.65 | civilian goods with mixed spare capacity; generators and transformers were scarce |
| Russia sales lost (share **not** redirected), large exporters | 0.20 / 0.35 / 0.55 | Haidar (2017): two-thirds of sanctioned Iranian exports were redirected. Machinery and car markets were supply-constrained in 2022–23 |
| …Finland | 0.15 / 0.30 / 0.50 | VATT (2023): the turnover of former Russia exporters was almost unchanged. Bank of Finland (2024): limited effect on manufacturing |
| …Baltics | 0.25 / 0.45 / 0.65 | small, Russia-dependent firms; border trade |
| …commodity exporters | 0.10 / 0.20 / 0.40 | food and fruit are fungible on world markets |
| …default | 0.25 / 0.40 / 0.60 | Crozet & Hinz: large losses after 2014, mostly in goods that were not targeted |
| extra sales to Russia, China | 0.40 / 0.60 / 0.80 | car exports to Russia went from 0.16m units (2022) to ~1.2m (2024), out of under-used capacity. When Russia raised fees, sales fell 58% (2025) and went partly to Mexico and the UAE |
| …Türkiye | 0.25 / 0.45 / 0.65 | the economy was at capacity in 2022–23 |
| …Belarus | 0.20 / 0.40 / 0.60 | it lost EU and Ukrainian markets (potash, fuel, wood) and sent that output to Russia instead |
| …Central Asia and Caucasus (own production) | 0.40 / 0.60 / 0.80 | small economies with spare capacity |
| …default | 0.30 / 0.50 / 0.70 | |
| extra sales to Ukraine | fuel 0.10 / 0.20 / 0.40; other goods 0.25 / 0.45 / 0.65 | refineries ran flat out in 2022–23, so extra diesel for Ukraine displaced other buyers |
| services lost, tourism default | 0.15 / 0.30 / 0.50 | Cyprus lost ~0.8m Russian visitors, yet 2023 arrivals reached 97% of the 2019 record |
| …border shopping (FIN, Baltics, NOR); business/financial services (CYP, CHE, GBR, LUX, MLT…) | 0.30 / 0.50 / 0.70 | hard to replace locally; client books lost |
| services gained (GEO, ARM 0.70; KAZ, KGZ, UZB, ARE 0.60; default 0.50) | | relocants and tourists in small economies with spare capacity |
| shipping, mainstream owners | 0.25 / 0.45 / 0.65 | without the war the same tankers carry other cargo. The extra is the freight premium: Baltic–India Aframax ~USD 20m/voyage in 2022 vs ~5m in Jan 2025 |
| shipping, shadow-fleet controllers (ARE, HKG, IND, CHN, TUR…) | 0.45 / 0.65 / 0.85 | old tankers that would otherwise have been scrapped |

## 4. Products for selected countries (central: value kept × extra = product)

| ISO3 | weapons | other flowback | Russia lost | Russia extra | Ukraine extra | services | shipping |
|---|---|---|---|---|---|---|---|
| USA | 0.90×0.70=0.63 | 0.87×0.45=0.39 | 0.87×0.35=0.31 | 0.87×0.50=0.44 | 0.86×0.43=0.37 | 0.96×0.30=0.29 | 0.83×0.45=0.37 |
| DEU | 0.72×0.65=0.47 | 0.70×0.45=0.32 | 0.70×0.35=0.25 | 0.70×0.50=0.35 | 0.67×0.44=0.29 | 0.84×0.30=0.25 | 0.66×0.45=0.30 |
| GBR | 0.75×0.60=0.45 | 0.70×0.45=0.32 | 0.71×0.35=0.25 | 0.71×0.50=0.36 | 0.68×0.44=0.30 | 0.88×0.50=0.44 | 0.79×0.45=0.36 |
| FRA | 0.75×0.60=0.45 | 0.66×0.45=0.30 | 0.66×0.35=0.23 | 0.66×0.50=0.33 | 0.63×0.43=0.27 | 0.84×0.30=0.25 | 0.81×0.45=0.36 |
| CZE | 0.55×0.75=0.41 | 0.51×0.45=0.23 | 0.52×0.40=0.21 | 0.52×0.50=0.26 | 0.50×0.43=0.21 | 0.79×0.30=0.24 | – |
| BGR | 0.68×0.70=0.48 | 0.52×0.45=0.23 | 0.53×0.40=0.21 | 0.53×0.50=0.27 | 0.51×0.42=0.21 | 0.82×0.30=0.25 | 0.65×0.45=0.29 |
| POL | 0.66×0.60=0.40 | 0.58×0.45=0.26 | 0.59×0.40=0.23 | 0.59×0.50=0.29 | 0.51×0.29=0.15 | 0.81×0.30=0.24 | 0.61×0.45=0.28 |
| KOR | 0.72×0.60=0.43 | 0.62×0.45=0.28 | 0.62×0.35=0.22 | 0.62×0.50=0.31 | 0.58×0.44=0.26 | 0.77×0.30=0.23 | 0.54×0.45=0.24 |
| TUR | 0.72×0.60=0.43 | 0.65×0.45=0.29 | 0.66×0.40=0.26 | 0.66×0.45=0.29 | 0.60×0.41=0.24 | 0.89×0.30=0.27 | 0.84×0.65=0.55 |
| CHN | 0.80×0.60=0.48 | 0.81×0.45=0.36 | 0.81×0.40=0.32 | 0.81×0.60=0.48 | 0.78×0.43=0.34 | 0.93×0.30=0.28 | 0.81×0.65=0.53 |
| BLR | 0.57×0.60=0.34 | 0.60×0.45=0.27 | 0.61×0.40=0.24 | 0.61×0.40=0.24 | 0.59×0.43=0.25 | 0.79×0.30=0.24 | – |
| FIN | 0.66×0.60=0.40 | 0.60×0.45=0.27 | 0.61×0.30=0.18 | 0.61×0.50=0.30 | 0.58×0.44=0.25 | 0.78×0.50=0.39 | – |
| GRC | 0.70×0.60=0.42 | 0.46×0.45=0.20 | 0.47×0.40=0.19 | 0.47×0.50=0.23 | 0.21×0.26=0.05 | 0.72×0.30=0.22 | 0.40×0.45=0.18 |
| CYP | 0.60×0.60=0.36 | 0.61×0.45=0.28 | 0.61×0.40=0.24 | 0.61×0.50=0.30 | 0.62×0.42=0.26 | 0.62×0.45=0.28 | 0.43×0.45=0.20 |
| ARE | 0.51×0.60=0.30 | 0.52×0.45=0.23 | 0.72×0.40=0.29 | 0.72×0.50=0.36 | 0.70×0.43=0.30 | 0.68×0.30=0.20 | 0.51×0.65=0.33 |

The full table and the low/high values are in the JSON. Low/high of the product combine the two ranges as independent
errors in log space.

## 5. Against the current 0.2: the 15 most affected countries

All values are EUR bn over 2022–2026, central. The gross flows are recomputed roughly from `site/data.json`.
- "Earned from war effort" is flowback plus extra sales to Ukraine.
- In the Russia trade columns, + = toward Ukraine (sales given up) and − = toward Russia (extra sales, shipping earnings).

| ISO3 | earned, old 0.2 | earned, new | Russia trade, old | Russia trade, new | weighted factor old → new |
|---|---|---|---|---|---|
| CHN | 0 | 0 | −36.8 | −88.6 | 0.20 → 0.48 |
| DEU | 4.0 | 8.4 | +19.9 | +24.6 | 0.20 → 0.28 |
| USA | 13.3 | 42.0 | +6.3 | +9.5 | 0.20 → 0.52 |
| POL | 4.4 | 3.8 | +5.3 | +6.3 | 0.20 → 0.21 |
| FRA | 1.6 | 3.5 | +7.4 | +8.9 | 0.20 → 0.28 |
| BLR | 0 | 0 | −7.2 | −9.6 | 0.20 → 0.27 |
| NLD | 0.4 | 0.7 | +5.9 | +7.6 | 0.20 → 0.26 |
| CZE | 1.9 | 3.5 | +3.8 | +4.1 | 0.20 → 0.27 |
| ITA | 0.6 | 1.4 | +5.1 | +6.1 | 0.20 → 0.26 |
| GBR | 1.8 | 4.0 | +3.3 | +5.3 | 0.20 → 0.36 |
| GRC | 0.5 | 0.2 | −3.6 | −1.6 | 0.31 → 0.17 |
| TUR | 0.8 | 1.2 | −4.1 | −7.1 | 0.21 → 0.37 |
| FIN | 0.4 | 0.7 | +3.6 | +4.4 | 0.20 → 0.26 |
| JPN | 0 | 0 | +3.4 | +4.7 | 0.20 → 0.27 |
| KOR | 0.1 | 0.2 | +2.9 | +3.3 | 0.20 → 0.22 |

What changes:
- **The US earns back about three times more**: 0.63 instead of 0.2 on ~EUR 67bn of flowback, about EUR 42bn instead of 13bn. That is 0.15% of US GDP.
- **China's gain from extra sales to Russia more than doubles** (−37 → −89bn, about −0.3% of GDP), because value kept is high and China's spare capacity makes the sales largely extra.
- **Greece falls**: its shipping counts 0.18 instead of 0.35, and its extra sales to Ukraine are fuel at 0.05.
- **Poland stays about the same**: its extra sales to Ukraine are mostly fuel (0.15), while its weapons count 0.40.
- **Belarus moves slightly further toward Russia** (+0.6% of GDP).

## 6. Sanity checks

- **US weapons: 0.63 (0.45–0.77).** This is inside the expected 0.5–0.7.
- **Germany 0.47 and Bulgaria 0.48 are lower than the US.** They have more imported inputs.
- **Czechia: 0.41.** Its value kept is low but its extra share is high.
- **Lost sales to Russia: products of 0.17–0.32.** These stay close to the old 0.2 for economies that redirect easily (Finland 0.18) and are higher for large exporters (0.23–0.31). The Russia balance moves only moderately.
- **Every product is at most its value kept.** The extremes are Turkish and Chinese shadow shipping (0.55, 0.53), US weapons (0.63), and fuel-heavy sales to Ukraine (Greece and Lithuania 0.05).

## 7. What is guessed

- **All extra factors are C–D.** They are judgement calls built on sector evidence; there is no per-country measurement. Weapons for the US, Germany, Czechia and Bulgaria rest on capacity data (C). Lost Russian sales rest on Haidar, Crozet & Hinz and the Finnish studies (C). Shadow versus mainstream shipping is a two-group split (D).
- **Value kept is B for the 76 TiVA economies and C for regional proxies.** Defence overrides are C. TiVA's latest year is 2022.
- **Fuel shares** come from UN Comtrade (B) for 12 countries and are assumed (D) for the rest.

## 8. Overlaps and how to apply

- **This file holds only factors, no EUR flows.** It **replaces** `META.lost_margin` in `profit3()` and the flowback margin in `calc()`. It also replaces `SHIPPING_PROFIT["freight"]`. Never apply it on top of them.
- **Shipping.** `data.json` shipping is stored as profit. Divide by 0.35 (central; 0.2 and 0.5 for the ends) to get gross freight, then multiply by `shipping.product`. Ship-sale premiums and registry fees keep their current treatment. Insurance can use 0.85 × the shipping extra share.
- **Czech brokers' commission** (`ua_arms_purchases.json` `broker_margin_profit`) is already value added. Apply only an extra share (~0.75).
- **Re-export hubs** (ARE, ARM, KAZ, KGZ, GEO, UZB, AZE, SRB, TUR, MNG, TJK, BLR). The margin a hub keeps is value added, so use 0.85 (0.75–0.95) × the extra share for that part. Re-exports moved to the origin countries take the origin's factors. Hong Kong's lost sales to Russia are mostly re-exports, so the 0.33 product may be too high there.
- **Direction of sales to Russia.** Pick `sales_to_russia_lost` or `sales_to_russia_extra` by the sign of the change, per year or over the total. For services, pick `product` or `product_when_more`.
- **The cost view's "profit lost on sales to Russia"** can use the same products. The profit-only (0.2) figures stay in the docs as a check (roadmap A).
- **Stock replacement (A2) and the all-money ledger (A1)** define which flows exist. This file only prices them.

## 9. Open questions

- **Value kept for defence.** Firm-level domestic-content data, such as the DoD Section 835 report or EDIP studies, would firm it up.
- **Ukraine's imports in 2025–26.** Fuel shares for those years.
- **Irish aircraft leasing.** Services lost to Russia (EUR ~12bn gross) are mostly leasing, with aircraft seized. That is an asset loss outside this rule.
- **Macro crowding-out.** Whether it should lower the US and German weapons factors further for 2022–23, when unemployment was at record lows.
