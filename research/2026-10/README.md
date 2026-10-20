# Research round 2026-10

First real data for the map, gathered on 2026-10-17 by six research agents. **Not yet reviewed by a person.**
`pipeline/build_data.py` turns these files into `site/data.json`.

| file | contents | main source | certainty |
|------|----------|-------------|-----------|
| `kiel.json` | aid per donor (military, financial, humanitarian), loans, pledged vs delivered, by year; EU institutions | Kiel Institute Ukraine Support Tracker, Release 31 (data to 2026-08-31) | A–B |
| `trade.json` | imports from / exports to Russia and Ukraine, 233 economies, 2021–2025 | UN Comtrade (partner data where Russia stopped reporting) | A |
| `crea.json` | fossil fuel payments to Russia per buyer, 2021 to 2026-10-16; laundered oil; oil discount gains | CREA Russia Fossil Tracker API; ICRA, Banque de France, Reuters | B (C for laundered oil and discounts) |
| `flowback.json` | share of aid spent in the donor's own industry; NATO PURL payments to the US; Danish model | CSIS, Kiel Policy Brief 203, Ukrainian government | B for the US, C (modelled) for others |
| `companies.json` | profit tax paid in Russia by foreign companies, by home country, 2021–2024 | KSE Institute via B4Ukraine reports, KSE digest 80 | B |
| `other.json` | military support to Russia (North Korea, Iran), volunteers and fighters, refugees, population and GDP | INSS, KIDA, Bloomberg, Eurostat, UNHCR, World Bank | D for military and people, A for the rest |

Each `*-notes.md` file has the method, caveats and gaps.

**Round 13 (2026-10-19):** after an independent economist and journalist audit, three new files ([`gaps/net_gain_sellers.json`](gaps/net_gain_sellers.json), [`gaps/remittances_r13.json`](gaps/remittances_r13.json), [`gaps/military_payment_r13.json`](gaps/military_payment_r13.json)), a corrected 2023 fertiliser share in `gaps/net_gain_russia.json`, research scripts in [`scripts/`](scripts/) and raw downloads in `raw/oecd_stan/`, `raw/oecd_tiva/` and `raw/comtrade_2710/`. What changed and why: [`docs/changelog.md`](../../docs/changelog.md#round-13) and [`docs/decisions.md`](../../docs/decisions.md#round-13-one-valuation-rule-for-every-seller).

**Round 14 (2026-10-19):** after a third independent audit, two new files ([`gaps/country_risk_r14.json`](gaps/country_risk_r14.json): Damodaran country risk premiums, January 2026; [`gaps/net_gain_sellers_r13.json`](gaps/net_gain_sellers_r13.json): the round-13 sellers' method kept for the method band), the sellers' normal return revised in [`scripts/net_gain_sellers.py`](scripts/net_gain_sellers.py) (5% real after tax plus the country premium; services without real estate), raw downloads in `raw/oecd_stan/stan_gtnxl_*.csv` and `raw/damodaran/` (listed), new sources in `sources_r11.json` (`gas_cuts`, `seizures`, `prices`, `dangote` and the normal-return literature), and notes updated in `gaps/net_gain_sellers-notes.md`, `gaps/net_gain_russia-notes.md`, `gaps/net_gain_ukraine-notes.md` and `gaps/military_payment_r13-notes.md`. What changed and why: [`docs/changelog.md`](../../docs/changelog.md#round-14) and [`docs/decisions.md`](../../docs/decisions.md#round-14-independent-audit-3).

**Round 14b (2026-10-19):** two owner changes. Seizures and forced exit costs (`company_flows.json`) leave the totals and count as a cost carried (no research file changes). Russia's and Ukraine's net-gain shares recomputed with the sellers' normal return (5% real + the country risk premium, on book capital as a nominal USD rate) and measured capital per group: [`gaps/net_gain_russia.json`](gaps/net_gain_russia.json) and [`gaps/net_gain_ukraine.json`](gaps/net_gain_ukraine.json) rewritten (the round-14 versions kept as `gaps/net_gain_russia_r14.json` and `gaps/net_gain_ukraine_r14.json` for the method band), notes updated, raw downloads listed in `raw/capital_r14b/` and `raw/damodaran/capexemerg.xls`, new links in `sources_r11.json`. What changed and why: [`docs/changelog.md`](../../docs/changelog.md#round-14b) and [`docs/decisions.md`](../../docs/decisions.md#round-14b-russias-and-ukraines-normal-return).

**Round 15 (2026-10-19):** after a fourth independent review, two new files ([`gaps/gdp_avg_r15.json`](gaps/gdp_avg_r15.json): GDP 2022–2024 and its average, built by [`scripts/gdp_avg_r15.py`](scripts/gdp_avg_r15.py) from `raw/worldbank/NY.GDP.MKTP.CD_2022_2024.json` and `raw/imf/`; [`gaps/power_of_siberia_r15.json`](gaps/power_of_siberia_r15.json): contracted gas deliveries to China), Ukraine's net-gain shares rerun with each year's country risk premium ([`gaps/net_gain_ukraine.json`](gaps/net_gain_ukraine.json) `normal_return_r15`; Damodaran's January 2022–2025 tables in `raw/damodaran/`, listed), a round-15 section in `gaps/refugees_net-notes.md` (one definition for every host), and the unverified Poland and Czechia refugee-cost snippets removed from `kiel.json`. What changed and why: [`docs/changelog.md`](../../docs/changelog.md#round-15) and [`docs/decisions.md`](../../docs/decisions.md#round-15-separate-maps-named-lists-and-comparable-numbers).

## Known gaps and caveats (round 1, superseded)

> These were the gaps after round 1. Later rounds closed most of them: missing parts no longer count as zero (round 2), own-industry shares were replaced by the all-money ledger (round 6), refugee costs come from budgets and net of refugees' taxes (rounds 4–5). The current open issues are in [docs/limitations.md](../../docs/limitations.md).

- EU-level aid (Commission, Council, EIB) is added to each member's aid by its share of EU budget contributions, as Kiel imputes it.
- Refugee hosting costs are modelled for every host country (C): Kiel's EU-wide total of EUR 163.1bn for 2022-2025 is split
  by refugees hosted x income per person (capped at 0.35-1.6x the EU average), and the same cost per refugee (about EUR 9,700
  a year at EU-average income) is used outside the EU. Reported figures are kept as cross-checks: Germany EUR 34.6bn (federal
  only, Kiel), Poland EUR 29.3bn and Czechia EUR 8.0bn (press report). Refugee counts are today's; Poland hosted many more
  in 2022, so its cost is likely too low. UNHCR's US count leaves out Uniting for Ukraine parolees.
- `gaps.md` lists, per country, which parts are reported, estimated or missing. Missing parts count as zero.
- Own-industry shares of military aid are modelled for every country except the US; countries without evidence get an assumed 40% (D).
- 2026 is January to August. Where a country has published 2026 trade it is used; otherwise 2026 is the 2025 rate for eight months, marked * on the map (81 importers, e.g. Belarus, Uzbekistan). Fossil payments in 2026 are CREA's actual figures, scaled to the end of August.
- Transit hubs (Germany, Netherlands, Turkey, Slovakia, Austria, Hungary) may include fuel used further downstream.
- Re-exports through hubs (Armenia, Kyrgyzstan, Georgia, Kazakhstan, the UAE and others) are moved to the countries that made the goods, but the shares are estimates. Kyrgyzstan's hidden gold payments are not yet passed on to the final buyers. Belarus publishes no trade data after 2021; its trade is estimated from official statements.
- North Korea's and Iran's supplies are mostly paid for by Russia; they are counted as military support to Russia (D), not as aid.

## Round 2: gaps filled, margins everywhere (2026-10-17)

Five more research agents filled every gap with an estimate and a low/middle/high range (files in `gaps/`):

| file | contents |
|------|----------|
| `gaps/aid_gaps.json` | aid from the 190 countries outside the Kiel tracker (UN OCHA FTS and government reports) |
| `gaps/refugees.json` | refugee hosting cost per country and year: national budgets for 5 countries, a calibrated model for the rest |
| `gaps/energy.json` | energy switching cost per fuel and month, oil discount gains, laundered oil, fossil fuel payments |
| `gaps/companies_all.json` | all taxes paid in Russia by still foreign-owned companies, per home country |
| `gaps/trade_full.json` | trade with Russia and Ukraine 2019 to Aug 2026 for 233 economies, with alternative pre-war baselines |

Method choices made in this round:
- Company taxes: all taxes (not only profit tax), counting only companies still foreign-owned; KSE's broader totals sit in the notes.
- Refugee costs: Kiel's per-country figures are modelled, not spending; national budgets are 2-3x lower, so the model is calibrated on budgets.
- Money flowing back counts only as profit (20%, the same share as profit lost on sales to Russia), in both the net shift and the cost: the goods sold still cost money to make.
- Ranges are about 90%; parts without a range from the data get a default by certainty letter; totals combine parts as independent errors.

## Attribution through middlemen (2026-10-17)
- Laundered oil is assigned to the final buyer: trading hubs (Singapore, Netherlands, Belgium, Greece, Malta) pass on the share
  they resell (estimated ranges) to their customers by their 2024 fuel export shares (`gaps/hub_exports_2024.json`), and only the
  Russian crude inside the fuel counts (60-75% of its value).
- Gold bought from Russia via Hong Kong (98% of its Russian imports are precious metals): the share passed on to mainland
  China (30-85%, middle 55%) counts for China; Hong Kong is labelled a gold transit hub.
- Missing sales to Russia (Russia's imports by origin minus partners' reported exports, EUR 29-46bn a year): valuation
  differences (EUR 13-15bn) stay unassigned; goods via Kyrgyzstan and Kazakhstan and the remainder are added to the country
  of origin (mostly China). Kyrgyzstan and Kazakhstan are labelled goods transit hubs.
- Also added from `gaps/uncovered.json`: services trade with Russia, gold and hidden channels (not Hong Kong, already in
  trade data), undisclosed military aid and private donations. Greek tanker earnings and crypto are left out to avoid
  double counting. GDP for Cuba, Syria, Eritrea and territories from `gaps/residual.json`.

## Round 3: prices, transit gas, hub resale, industry flowback (2026-10-17)

- **Pre-war prices.** Changes against the 2019-2021 level compare volumes. Each traded flow carries a price level per year (`pidx`, 2019-2021 = 1, with low and high): payments to Russia use the country's own 2019-2021 import mix (crude, products, gas, coal, other goods; UN Comtrade) with price indices for Urals, Russian oil products, Russian pipeline gas or LNG, coal and non-fuel goods; sales to Russia and trade with Ukraine use the Eurostat non-fuel import price index, services the euro-area services prices. The map divides actual values by the price level before comparing. Sources and ranges in `gaps/energy2.json` (`price_index`).
- **Transit gas.** Russian gas is counted where it is used (Eurostat imports by origin, ENTSOG, CREA; `gaps/energy2.json` `transit_gas`). For these 33 countries the gas recorded in customs data (UN Comtrade HS 2711, `gaps/customs_gas.json`) and in the fossil fuel tracker is replaced by final-use gas, both in the yearly values and in the pre-war baseline. The fossil tracker's 2021 value used as a baseline is brought to 2019-2021 prices.
- **Hub resale.** Resale shares of refined products for Singapore, the Netherlands, Belgium, Greece and Malta come from national energy balances (`hub_resale`). Fuel sold to ships in port (bunkers) has no buyer country and stays with the hub, except at the hub's low end. UAE, Togo, Turkey, India, Gibraltar and Panama have shares researched but no customer split yet, so they keep their fuel.
- **Own-industry flowback and refugees paid by donors** (`gaps/flowback2.json`): own-industry shares from Kiel item coding apply to bilateral military aid; EU-level military aid is credited to member arms industries by SIPRI production share; refugee costs paid by donors (UNHCR, EU) are taken off the host (Moldova most).
- **Re-exports through trade hubs** (`gaps/reexports.json`): for 11 hubs (UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan, Georgia, Uzbekistan, Azerbaijan, Serbia, Mongolia, Tajikistan) goods re-exported to Russia are moved from the hub's sales to Russia to the countries that made them (origin shares per hub), and Russian goods the hubs pass on (gold and diamonds mostly) to the final buyers; the hub keeps its trading margin (goods 3-20%, gold 0.3-6%, educated guesses). The pre-war re-export level is moved the same way. UAE and Georgia use their own re-export records; the other hubs rest on matched product trade and hub shares (certainty C-D). Not yet moved: the hubs' pro-rata part of the residual exports-to-Russia gap, and Turkey's fuel refined from Russian crude (kept out, it is processing, not re-export).
- **Headline measure**: totals for 2022 up to the chosen year, as % of one year's GDP (2024).
- **Tanker shipping** (`gaps/shipping.json`): freight, ship sales to the shadow fleet, insurance, finance and registry fees earned on Russian oil and LNG exports, by the country of the owner or manager, 2021-2026, against 2019-2021. The share already inside services trade with Russia (freight 5%, insurance 10-20%) is left out. Russian-controlled tankers are not given to any foreign country. Compared with the pre-war level at services prices, like other services sold to Russia.
- **Fuel hubs and refiners** (`gaps/hub_buyers.json`): customers of the UAE, India, Turkey, Togo, Gibraltar and Panama (fuel export shares 2022-2025) now receive the share these hubs resell. Turkey and India refine Russian crude and export part of the fuel; that part is already counted at the buyers as laundered oil (95-100%), so its crude value is taken out of Turkey's and India's own payments to Russia, which now cover only what they use themselves.
- **Pre-war trends** (`gaps/trend.json`): the counterfactual for trade with Russia and Ukraine follows each country's 2012-2021 real trend (years chosen per series around the 2014-15 break), continued with a 3-year half-life and capped at -10%..+10% a year (multiplier 0.68-1.41 by 2026), back-tested on 2002-2013. Stored as `bmul` per series; the map compares actual volumes with base x multiplier. Unreliable trends centre on the flat 2019-2021 level, and every range includes the flat level.
- **Gas prices per country** (`gaps/gas_prices.json`): the gas part of each country's price index uses its own realised Russian gas price (Eurostat Comext and Comtrade unit values, contract prices, oil formulas for Turkey and Poland) instead of the Europe-wide index. Hungary paid hub prices (7.6x in 2022), Serbia and Turkey oil-linked (1.8-1.9x), Belarus a fixed dollar price (1.1x). Countries without a researched price keep the Europe-wide index.
- **Freight counted once**: import values in customs data include freight and insurance (CIF, 3.5-7.5%). That part is paid to shippers and insurers, not to Russia, and is counted for them, so it is taken out of every country's payments to Russia (yearly values and baseline).
- **Shipping as profit**: shipping income counts only its profit share (freight 20-50%, insurance and finance 10-40%, ship sales as their price premium), not the gross revenue.
- **Audit corrections** (`gaps/audit.json`, 31 countries checked against independent sources; 167 parts ok, 5 adjusted, 92 unverifiable with worst-case ranges):
  - Gas booked by customs under other headings (Turkey, Poland, part of Germany) is no longer added a second time; Turkey's payments to Russia drop from EUR 220bn to 184.5bn.
  - Final-use gas is valued at each country's own Russian gas price; non-transit countries keep the gas their customs record (Greece).
  - G7 loans repaid from Russia's frozen assets (ERA: US 18.3, EU 18.1, Canada 3.3, UK 2.6, Japan 1.6) are left out of donors' aid: it is Russia's money.
  - The 2026 EU Ukraine Support Loan is split over the 24 members that guarantee it (not Czechia, Hungary, Slovakia).
  - Denmark's sales to Russia sit between Danish and Eurostat data; laundered oil bought by EU members is scaled to Global Witness's figure for Russian crude in EU imports (x0.62); Poland's refugee cost follows the government report (about EUR 24bn).
- **China's military support** (`gaps/china_military.json`): only what is not in recorded trade is added as weapons to Russia (unrecorded finished military items, satellite imagery and training, smuggled dual-use goods): EUR 0.2-0.3bn a year, certainty D. China's recorded dual-use exports (EUR 4.5-5.8bn a year, high-priority list items) are already counted in its sales to Russia and are not added again.
- **Trends for services, company taxes and shipping** (`gaps/trend2.json`): services compare with each country's pre-war trend (travel fitted on 2012-2019) plus the rebound from COVID, because the services baseline is 2021, a COVID year for travel (Thailand's Russian tourism income in 2021 was 11% of 2019-2021). Unreliable trends keep only the rebound; Egypt uses a level-based counterfactual (Russian flight ban 2015-2021). Company taxes follow foreign companies' pre-war growth in Russia (own country where reliable, else global +4.5% a year); shipping follows Russian seaborne export volumes (+3.9% a year).
- **Narrower ranges for 16 countries** (`gaps/narrow.json`): official statistics (Union State and Belstat totals for Belarus, National Bank of Georgia travel revenue, TÜİK and Russian tourist arrivals x spend for Turkey, stat.uz, Armstat gold), Brunei's ESPO crude revalued at market prices, North Korea from INSS munitions estimates, Tunisia's collapsed Russian tourism, UAE hidden gold set to zero where already in official trade. A builder bug that set the low baseline of pipeline-gas countries to their fuel value alone is fixed. Services for these countries use the 2019-2021 average as baseline. Bounds of fitted services multipliers are kept within 2.5x their middle value.
- **Better data for the big guesses** (`gaps/refine.json`): shadow tankers managed from the UAE, India, China and Hong Kong are mostly Sovcomflot's own chain (Russian state), so their freight stays with Russia (UAE freight x0.08-0.31 of the earlier model, from KSE monthly manager data and OFAC designations); re-export shares measured at product-heading level (Armenia 0.86-0.92, Kazakhstan 0.77-0.84, Kyrgyzstan 0.60-0.77, Turkey 0.31-0.36, Uzbekistan 0.61-0.83, Azerbaijan 0.36-0.43, Serbia 0.37-0.48); Togo's fuel buyers traced through African importers' records (Nigeria 32%); Hong Kong's onward gold share per year (0.57 in 2022 falling to 0.37 in 2025); UAE gold first buyers from importers' records (Hong Kong 30%, India 19%, Switzerland 15%, Turkey 14%).
- **Second audit** (`gaps/audit2.json`): the UAE passes on Armenian-routed Russian gold like its direct Russian gold, and 2026 hidden gold is zero; Russian fuel delivered to the UAE (missing from UAE customs) is added, net of resale; France's undisclosed aid already in Kiel since Release 16 is taken out; the structural pre-war gap in Russia's import statistics (about EUR 6bn a year) is no longer added to 2022-2026 sales only; trends fitted on the post-2016 rebound only (Kazakhstan, Montenegro and others) use the full 2012-2021 window; the freight cut skips imports priced at the border (pipeline gas and crude, electricity, overland trade). Pre-war Baltic and Finnish transit (question 6) is measured but not yet applied.

## Round 4 (2026-10-18)

- **War-time price windfall**: the extra money Russia earned because fuel cost more during the war (payments for Russian fuel minus the same volume at 2019-2021 prices) counts toward Russia for every country, on top of any change in volume. Non-fuel goods are left out (mostly general inflation). Only money flowing to Russia counts; higher prices on goods sold to Russia do not count in the seller's favour.
- **Profit, not revenue, on sales to Russia**: sales given up and extra sales (goods and services) count as the seller's profit (about 20%), as flowback and shipping do.
- **Baltic and Finnish pass-through trade** (audit 2, question 6) is taken out before and after the war; re-exports to Russia go to the EU makers.
- **Ranges** combine the baseline, actual values, price level and trend in quadrature (baseline and actual values correlated 0.5) instead of stacking worst cases.
- **2026** is labelled year to date (January to August); parts estimated from the 2025 monthly rate are marked with *.
- Better official data for the widest-range countries (narrow.json) enters at customs level.
- **Company taxes** (`gaps/round4a.json`): profit tax in full plus half of the other taxes (VAT, excise and payroll are largely paid by Russian customers and staff); baseline is the 2018-2021 average (2018-2020 carried back from 2021 with FDI income and Russian GDP indices).
- **China's refined exports**: the Russian crude inside fuel China exports is already fully in buyers' laundered oil, so it is taken out of China's own payments, as for Turkey and India. EU refiners' exports are not counted as laundered oil anywhere and stay with the refiner country.
- **Laundered oil before the war**: fuel refined from Russian crude reached buyers before 2022 too (EUR 3-5bn a year, mostly via China). Only the rise above each buyer's 2018-2021 level and its pre-war growth counts.
- **Exact prices** (`gaps/prices.json`): each country's price index for Russian fuel and non-fuel goods uses its own customs unit values (value / quantity, 2018-2021 = 1) where measured (102 countries); single-fuel bands shrink from 38-106% to about 7-10%. Fuel's share of pre-war imports uses the measured 2018-2021 mix. The war-time windfall uses the same prices. Turkey keeps benchmark-based prices until its hidden crude and gas prices are reviewed.
- **UAE trade** (`gaps/round4b.json`): UAE customs totals with Russia (which equal the official non-oil trade figures) replace the earlier estimate; 2024-2026 re-exports to Russia and Russian gold passed on are raised to match, and the CREA fuel addition only counts fuel UAE customs do not record.
- **Refugee costs** for 27 hosts come from government budgets and audit offices instead of the GDP-per-person model (US, Canada, Spain, Italy and others fall; Germany and Norway rise). Moldova's figures are its own costs, net of donors.
- **Belarus** reports its full trade with Russia, so its share of Russia's unexplained imports is spread over the other countries.
- **Artefacts**: Lebanon's baseline leaves out 2019 (fuel bought for smuggling); Mauritania's pre-war fuel was traders' origin labels; Saint Lucia's and Bonaire's Russian fuel went to storage terminals; Botswana's rough diamonds were bought for resale; Seychelles shipping managers are fronts; Malta's suppressed services data are filled.

### Counterfactual: back-tested models instead of trends

`gaps/counterfactual.json` (notes: `gaps/counterfactual-notes.md`) tested 16 ways to predict trade with Russia and Ukraine without the war. Back-tests started in 2008, 2013 and 2016 and predicted 1–5 years ahead. A model replaced "hold 2021 flat" only where it beat it by 15% in every test, or by 15% on average with no test worse.

- **Exports to Russia:** linear nowcast from the country's other trade, GDP, volumes, pre-war commodity price paths and momentum, about 18% more accurate.
- **Trade with Ukraine:** linear nowcast for purchases and a random forest for sales. The evidence is weaker: two tests only.
- **Imports from Russia and services:** 2021 held flat. Services add the travel recovery from COVID. No model passed, because these flows depend on Russia's side.
- **Re-export hubs and Belarus:** 2021 held flat.

`counterfactual()` in `build_data.py` applies this. For these flows:

- The pre-war level is 2021 at 2019–2021 prices. The old 2019–2021 average is kept as `base_2019_2021_avg`.
- `bmul` carries the back-tested 90% interval, so the expected path is never treated as exact.
- It replaces the trend.json and trend2.json trends, and the audit-2 Q5 trend corrections, for these flows.
- Company taxes, shipping and the few countries without a model keep their trends.

Effect on the map: middle values change little (Germany +4.8% to +4.7%, China −1.1% to −1.6%, Hungary −5.6% to −6.7%). Ranges are about 1.5–2 times wider.

### Review fixes (round 4 review)

- **UAE customs:** the round4b customs figures were overwritten by older narrow.json values, which pushed its payments to Russia to zero in 2025. They now apply after narrow.json. UAE: −0.5% → −1.5% of GDP.
- **Services counterfactual:** the travel recovery is sized on the model's own 2021 level. Where the map's 2021 is higher (little COVID dip in the map's source), the expected level now stops at the model's recovered level in euros. Montenegro: +10.8% → +5.4%.
- **War-time windfall and the payments price index:** these now use each year's actual fuel share of payments from own customs (`fuel_share_year()`, prices.json) instead of the pre-war mix. India: −4.6% → −5.1%.
- **Re-exports:** pre-war re-exports now also come out of the hubs' 2021 values, because the counterfactual starts from 2021.
- **Pre-war laundered oil:** this level now goes through the same hub pass-on chain as the yearly values (Singapore, its customers).
- **Laundered-oil GDP cap:** it now also applies to countries whose GDP comes from residual.json.
- **Gibraltar:** bunker fuel resold to passing ships. Gibraltar keeps a 10% (5–30%) margin, like other resellers. −18.9% → −1.4%.
- **Kyrgyzstan's hidden gold:** this is now passed on to the buyers of Kyrgyz gold (`gaps/kgz_gold.json`, UN Comtrade 2023–2024): Switzerland 37%, China 33% (Hong Kong's share included), UK 15%, UAE 11%. Kyrgyzstan keeps 5%. Kyrgyzstan: −30.5% → −15.1%.
- **audit2 range corrections:** each band's change now goes to that band.
- **2026 marking:** payments whose 2026 trade is estimated from 2025 are now marked *. Every period label shows "2026 year to date".
- **Method text:** it now describes profit (about 20%) on sales, the windfall and laundered oil, instead of "price spikes do not count".
- **Open:** Belarus's range crosses zero (−76% to +49%). It comes from the honest back-tested error of "2021 held flat", applied to an 18 bn/yr flow.
