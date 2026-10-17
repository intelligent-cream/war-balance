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

## Known gaps and caveats
- EU-level aid (Commission, Council, EIB) is added to each member's aid by its share of EU budget contributions, as Kiel imputes it.
- Refugee hosting costs are modelled for every host country (C): Kiel's EU-wide total of EUR 163.1bn for 2022-2025 is split
  by refugees hosted x income per person (capped at 0.35-1.6x the EU average), and the same cost per refugee (about EUR 9,700
  a year at EU-average income) is used outside the EU. Reported figures are kept as cross-checks: Germany EUR 34.6bn (federal
  only, Kiel), Poland EUR 29.3bn and Czechia EUR 8.0bn (press report). Refugee counts are today's; Poland hosted many more
  in 2022, so its cost is likely too low. UNHCR's US count leaves out Uniting for Ukraine parolees.
- `gaps.md` lists, per country, which parts are reported, estimated or missing. Missing parts count as zero.
- Own-industry shares of military aid are modelled for every country except the US; countries without evidence get an assumed 40% (D).
- Trade data stops in 2025; 2026 trade is the 2025 rate for eight months (estimate). Fossil payments in 2026 are CREA's actual figures, scaled to the end of August.
- Transit hubs (Germany, Netherlands, Turkey, Slovakia, Austria, Hungary) may include fuel used further downstream.
- Armenia, Kyrgyzstan, Georgia and the UAE rank high toward Russia because of re-exports; Belarus has no trade data after 2021.
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
- Money flowing back counts in full in the net shift, but only as profit (20%, the same share as profit lost on sales to Russia) in the cost.
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
