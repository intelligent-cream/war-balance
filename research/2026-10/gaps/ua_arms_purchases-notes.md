# Ukraine's arms purchases abroad: money flowing back to sellers (2026-10-18)

Data file: `ua_arms_purchases.json` (same folder). Roadmap item 1. **Not yet reviewed by a person.**

## 1. What this flow is

The map already counts three kinds of "money flowing back" ([flowback](https://warbalance.org/#view=how&sec=m-aid-refugees-military-flowback)):

- a donor's own aid spent with its own industry;
- NATO PURL purchases from US stocks;
- EU-level military aid spent with EU industry.

This file adds the missing piece: **weapons and ammunition sold to Ukraine, or to a go-between for Ukraine, by a country that did not pay for them itself.** It is listed per **seller** country and year. The buyer can be:

- Ukraine's own budget (which donors' budget support helps to finance);
- another donor's earmarked cash, for example:
  - the Czech-led ammunition initiative;
  - German money for US Patriots;
  - Danish money for Swedish CV90s;
- US aid money spent outside the US: Pakistani shells, Korean shells, Bulgarian ammunition in 2022.

Values are **gross sales** (revenue). The builder should count 20% of them (range 0.5–1.5×) as profit for the seller, the same rule as `sell_ukr`. The one exception is the Czech brokers' commission (`broker_margin_profit`), which is already profit.

The "Danish model" (donor money paid to Ukrainian factories) stays in Ukraine. It creates no flowback abroad and is not in this file.

## 2. Data found

| Source | What it gives | Used for |
|---|---|---|
| Czech MIT annual arms-trade reports (via [Ekonomický deník](https://ekonomickydenik.cz/ceske-firmy-vojensky-material-112-miliard/), [Seznam Zprávy](https://www.seznamzpravy.cz/clanek/domaci-zivot-v-cesku-vyvoz-vojenskeho-materialu-z-cr-loni-mezirocne-stoupl-o-86-procent-282612), [Radio Prague](https://english.radio.cz/node/8821924)) | Used licences to Ukraine: CZK 12.8bn (2022), >20bn (2023), 47.1bn (2024), 50.7bn (2025) | CZE (A/B) |
| Czech government and CSG on the ammunition initiative ([LIGA 1](https://news.liga.net/en/politics/news/ukraine-has-already-received-13-million-shells-from-the-czech-republic-by-the-end-of-2025-their-number-will-reach-18-million), [LIGA 2](https://news.liga.net/en/politics/news/the-arms-giant-disclosed-how-many-shells-ukraine-received-under-the-czech-initiative-and-their-cost), [Grosswald](https://www.grosswald.org/czech-led-ukraine-ammunition-initiative-donor-base-halves-2026-flow-down-44-percent/)) | 1.5m rounds (2024), 1.8m (2025), about 1.0m contracted for 2026. EUR 4–4.5bn for 2024–25. Foreign donors gave CZK 93.3bn; Czechia's own share is about 2%. | Initiative total |
| [RFE/RL Schemes investigation](https://www.rferl.org/a/schemes-investigation-czech-ammo-ukraine/33406541.html) | Brokers' commission 5–13%. 2024 donors: DEU USD 650m, NLD 283m, BEL 227m. Turkish M107 offer at EUR 2,500 a round. | Broker margin |
| [Kyiv Post](https://www.kyivpost.com/post/30533), [Defence Ukraine](https://www.defenceukraine.com/en/references/czech-ammunition-initiative/) | Greek army stocks sold for USD 156m. Named origins: South Korea, Türkiye, South Africa, India, the Balkans. | GRC; origin guess |
| Polish MFA report 2023 ([Defence24](https://defence24.com/industry/poland-increases-arms-exports-ukraine-and-whats-next-commentary)) | Actual sales to Ukraine EUR 1.419bn, 81% of all Polish arms exports, donations excluded | POL (B) |
| Bulgarian Ministry of Economy ([Novinite](https://www.novinite.com/articles/239281/Bulgaria), [Novinite UNROCA](https://www.novinite.com/view_news.php?id=238879), [Sofia Globe](https://sofiaglobe.com/2022/03/08/upward-curve-for-bulgarias-exports-of-military-products/)) | Exports and transfers EUR 1.654 / 2.168 / 2.831bn (2022–24) and about 2.5bn (2025), against roughly 0.6bn a year before the war. Direct sales to Ukraine only 0 / 0.013 / 0.156bn. | BGR (C) |
| FT via [Ukrinform](https://ukrinform.net/rubric-ato/3877795-ukraine-received-eur-800-million-worth-of-ammunition-from-serbia-through-intermediaries-ft.html) | EUR 800m of Serbian ammunition reached Ukraine through US, Spanish and Czech buyers over 2–3 years | SRB (C) |
| [The Intercept](https://theintercept.com/2023/09/17/pakistan-ukraine-arms-imf/), [Soch Fact Check](https://www.sochfactcheck.com/pakistani-government-officials-falsely-deny-selling-arms-to-ukraine) | Pakistani shells sold to the US government, 2022–23: USD 364m in contracts, about 900m reported | PAK (D) |
| [Defense One / Import Genius](https://www.defenseone.com/business/2023/11/import-records-illuminate-ukraines-desperate-hunt-third-party-arms-and-ammo/391686/) | Ukrainian import records, July 2023: USD 346m of ammunition. Bulgaria >90m, Romania 22m, Türkiye 22m, Czechia 20m. | ROU, TUR, BGR checks |
| Kiel UST R31 item sheet (`procurement_location`) | Donor aid bought from a third country's industry | USA, SWE, DEU, NOR, NLD, BEL and others |
| UN Comtrade API, exports to Ukraine, HS 93 / 8710 / 8806 | Customs-recorded arms exports. POL USD 0.85–2.5bn a year; SVK, ROU, TUR, USA smaller; CZE almost none. | Overlap with trade |
| Ukraine MoD ([82% domestic](https://mod.gov.ua/en/news/share-of-ukrainian-manufacturers-in-military-procurement-rises-to-82)), [Kyiv Independent](https://kyivindependent.com/ukraines-defense-procurement-shifts-to-domestic-suppliers-rising-to-71-from-last-years-44/) | Defence Procurement Agency (DPA) 2024 budget UAH 306bn with 54% imported. 2025: about UAH 430bn domestic, 18% imported. | Cross-check only |
| DSCA notices ([ERAM](https://www.dsca.mil/Press-Media/Major-Arms-Sales/Article-Display/Article/4289280/ukraine-air-delivered-munitions), [spare parts](https://www.dsca.mil/Press-Media/Major-Arms-Sales/Article-Display/Article/4399552/ukraine-class-ix-spare-parts)) | US sales paid by Ukraine or partners. Values are ceilings. | USA |

**Not usable:**
- **EU COARM reports.** The PDFs (ST-16605-2023, ST-16016-2024) only carry re-transfer and brokering annexes. The per-destination tables are in the online Qlik database, which cannot be scripted. Some states also hold back Ukraine data for security reasons.
- **SIPRI TIVs.** These are not money, so they were not converted.

## 3. How the numbers were built

All values are in EUR bn, low / central / high. Script: `build.py`.

1. **Czechia**
   - Start from the MIT used licences to Ukraine.
   - Subtract Czech in-kind aid (Kiel).
   - What remains is Czech-made or Czech-exported goods paid for by Ukraine, by donors through the initiative (about 45% of initiative value goes through Czech licences) and by donors bilaterally.
   - 2026 Jan–Aug is a guess: 0.5 / 0.9 / 1.4.
2. **Ammunition initiative, third-country part**
   - Total value: 1.9 (2024), 2.4 (2025), 0.8 (2026 Jan–Aug).
   - 55% (40–70%) is shipped directly from producers outside Czechia.
   - Bulgarian, Serbian, Slovak and Greek rounds (44% of that part) are already inside those sellers' own lines.
   - The rest, net of the Czech commission, is split by an **educated guess**: TUR 35%, ZAF 20%, KOR 10%, IND 8%, BIH 7%, PAK 5%, unknown 15% (not allocated).
   - Low is ×0.5 and high is ×1.8 (certainty D).
   - The Czech brokers' commission (8%, range 5–13%) on that part is reported as profit: 0.22 (0.08–0.57) over 2024–26.
3. **Poland**
   - 2023: MFA figure.
   - Other years: Comtrade HS93+8710 exports to Ukraine. The 2023 Comtrade value, 1.35, matches the MFA figure.
4. **Bulgaria**
   - Rise in total defence exports over a pre-war level of 0.8 (0.6–1.0), × 75% (50–90%) reaching Ukraine, minus Bulgaria's own 2022 aid.
   - 2022 high: 2.4, from Defense Express.
5. **Slovakia, Romania**
   - Comtrade arms exports to Ukraine, minus donations: Romania's Patriot in 2024, a possible Slovak S-300 in 2022.
   - Slovakia also gets Zuzana-2 howitzers paid by Denmark, Germany and Norway.
   - Romania 2022–23 comes from import records.
6. **USA**
   - Kiel-coded non-PURL purchases in the US:
     - German Patriots from Raytheon: EUR 3.47bn, allocated 2026 (60% assumed paid in Jan–Aug);
     - Norway 0.95;
     - Canada 0.18 (NASAMS).
   - Plus Ukraine-paid DSCA cases (about 0.15 a year) and Comtrade commercial arms.
7. **Serbia, Pakistan, Korea, Türkiye**: investigative figures and own estimates, spread over years (C–D).
8. **Kiel-coded third-country purchases**: Danish money spent in Sweden and Germany; French money in the Netherlands; US and UK money in Belgium; and so on.
9. **already_in_trade**
   - Formula: min(Comtrade HS93+8710 exports to Ukraine, rise of the seller's total exports to Ukraine over 2021 in `trade_full.json`). This part is already in `sell_ukr`.
   - **add_to_map_gross** = gross − already_in_trade.
   - 2026 Comtrade values are 2025 × 8/12.

## 4. Results: biggest sellers (add_to_map gross, EUR bn, 2022 – Aug 2026)

| Seller | low | central | high | cert. | main content | paid by |
|---|---|---|---|---|---|---|
| CZE | 4.6 | 5.7 | 7.0 | B | Czech-exported ammunition and refurbished equipment (+0.22 broker profit) | Ukraine budget (2022–23), initiative donors, DNK/NLD |
| BGR | 2.6 | 5.0 | 8.8 | C | ammunition and launchers via Poland, Czechia, Romania, US, UK | US and UK aid (2022), Ukraine, initiative donors |
| USA | 1.9 | 4.1 | 7.1 | C | German Patriots, Norwegian and Canadian buys, Ukraine-paid FMS | DEU, NOR, CAN aid budgets, Ukraine |
| TUR | 0.4 | 1.5 | 3.5 | D | Bayraktar, ammunition, Ada corvette, initiative rounds | Ukraine, initiative donors |
| SRB | 0.5 | 1.1 | 1.9 | C | ammunition via US, Spanish and Czech buyers | US aid, donors, Ukraine |
| PAK | 0.4 | 0.6 | 1.1 | D | 155mm shells to the US (2022–23) | US aid |
| SWE | 0.4 | 0.5 | 0.7 | C | CV90 and other items paid by Denmark | DNK |
| KOR | 0.1 | 0.3 | 1.0 | D | shells to the US, initiative rounds | US, initiative donors |
| ROU | 0.2 | 0.3 | 1.0 | C | ammunition (2022–23; 2024–25 already in trade) | Ukraine |
| DEU / NLD / ZAF | 0.2 | 0.3 | 0.4–0.8 | C/D | other donors' buys; South African rounds via the initiative | DNK, NLD, NOR, FRA; initiative donors |
| POL | 0 | 0.07 | 2.1 | B | gross 6.9, but almost all already in Comtrade / `sell_ukr` | Ukraine (some US FMF and EU money) |
| SVK | 0 | 0.1 | 0.7 | C | gross 1.4, almost all already in Comtrade | Ukraine, DNK/DEU/NOR |

Sum of add_to_map central: about EUR 21bn gross. At 20%, that is about **EUR 4.2bn of profit flowing back** to sellers. In the map this works like `sell_ukr`: it lowers the seller's net shift toward Ukraine. For countries with no aid of their own (SRB, PAK, ZAF, IND, BIH), it is a small pure gain from the war.

Yearly profile, central: 2022 ≈ 2.2, 2023 ≈ 3.9, 2024 ≈ 5.6, 2025 ≈ 5.3, 2026 Jan–Aug ≈ 4.1. The 2026 figure is driven by the German Patriot purchase.

## 5. What is guessed (certainty D or wide ranges)

- **Initiative origin split.** No government publishes it. The names come from 2024 press reports quoting unnamed officials.
- **Türkiye.** The number of Bayraktars Ukraine paid for, and the size of its Turkish ammunition purchases, are not public. Comtrade (USD 20–150m a year) is a floor.
- **Pakistan and Korea.** Neither government confirms the sales. Prices are not public.
- **Bulgaria.** The share of the export rise that reached Ukraine (50–90%), and the pre-war baseline.
- **2026 Jan–Aug** for CZE, the initiative and SVK; timing of the German Patriot payments.
- **Ukraine's own foreign purchases** (2.5 / 3.5 / 3.4 / 2.0 / 1.2 for 2022–26 Jan–Aug) are a cross-check only, not added. Seller-side lines paid by Ukraine add up to roughly the same, so no residual was allocated.

## 6. Overlaps and how they are avoided

- **Seller's own aid.** Subtracted (CZE, SVK, ROU, BGR) or excluded by the source (Polish MFA). It earns own-industry flowback in `flowback2.json`.
- **Donor own-industry shares (`flowback2.json`).** Aid a donor spends in a third country counts there as "not own" and is credited to nobody. This file credits it to the seller, so nothing is counted twice.
  - **Do not** also credit Kiel's rows "procured in Czechia" (Denmark 1.33, Netherlands 0.41). They are inside the CZE and initiative lines.
- **PURL and EU-level aid** are excluded. That includes Kiel's 2026 rows EU→Sweden 2.5 and EU→EEA/EFTA 1.96. The UK's Thales Belfast missiles (coded "France" by Kiel) count as UK own industry in flowback2 and are excluded here.
- **Trade (`sell_ukr`)**
  - Removed via `already_in_trade`. This is why Poland (gross 6.9) and Slovakia (1.4) add almost nothing.
  - Remaining risk: Bulgarian goods re-exported by Polish or Romanian traders may appear in POL/ROU customs exports to Ukraine as well as in BGR here (an estimated 10–30% of BGR).
- **US aid.** CSIS's 86–90% covers US aid spent in the US. The part spent abroad (PAK, KOR, SRB, BGR in 2022) is outside that share.
- **Not allocated (memo only):**
  - US aid spent with other foreign suppliers: about EUR 3–5bn.
  - Donor aid bought abroad with no coded location: EUR 3–11bn.

## 7. Notes for the builder

1. Count **20% of `add_to_map_gross_eur_bn`** as flowback to the seller. Add `CZE.broker_margin_profit` directly.
2. **Check `sell_ukr` for donors.** `memo.comtrade_arms_exports_to_UKR_eur_bn` shows customs-recorded arms exports to Ukraine by donors:
   - CAN armoured vehicles 0.04–0.27 a year;
   - ESP, ITA, AUS, HRV, NOR, GBR ammunition.

   These are probably donated aid recorded at the border. If they lift `sell_ukr`, those donors get flowback twice (own-industry share plus `sell_ukr`). This is a pre-existing issue, not created by this file.
3. GRC is a stock sale: almost the whole USD 156m is income for the Greek state, so 20% understates it.
4. Not included: donors' purchases to **replace** donated stock for their own forces, such as Polish K2/K9 tanks and howitzers from Korea. These are war-induced but are not sales for Ukraine.

## 8. Open questions

- The COARM online database (per member state, licences and exports to Ukraine, 2022–24) would firm up CZE, POL, BGR, SVK and ROU, and add other EU sellers.
- Czech MIT reports by year with seller breakdown, and the 2023 Ukraine figure (">CZK 20bn" is approximate).
- A Czech government breakdown of initiative rounds by origin country.
- Ukraine's Ministry of Finance or DPA data on foreign contracts by country. The USD 10.6bn of prepaid but undelivered foreign contracts (Sept 2026) suggests large foreign orders not yet delivered.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
