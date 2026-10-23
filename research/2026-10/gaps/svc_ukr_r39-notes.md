# Extra services sold to Ukraine: the services twin of `sell_ukr` (round 39)

File: `svc_ukr_r39.json` (same folder). Generated 2026-10-23. **Not yet reviewed by a person.** The file is a research input only: `build_data.py` does not read it yet. The research scripts and raw downloads are not in the repository. The JSON keeps the extracts, and the sources are listed below.

Raised by the round-39 gap audit (Ukraine side, item 1). Today `sell_ukr` covers goods only, and the services part (`svc_sold`, `uncovered.json`) covers Russia only. Two flows were therefore missing from the money flowing back:
- transport and other services sold to Ukraine;
- Ukrainian money spent abroad by refugees.

## Bottom line

- **Gross extra 2022 to August 2026: about EUR 26bn.**
  - Travel (Ukrainian money spent abroad): 23.1bn.
  - Non-travel services: +2.7bn summed with signs over all countries. That is 10.1bn of rises against 7.4bn of falls.
- **Money flowing back, at the seller's net gain × genuinely extra: EUR 0.96bn worldwide (likely 0.03 to 3.7).** This is smaller than the audit's 1.5–3bn, for three reasons:
  - Refugees' spending counts at the refugee-spending factors. These are the same ones the map already uses for hosting money: about 0.02 for most hosts and 0.07 for Poland.
  - Germany, Czechia and Austria earn little above a normal return in retail and accommodation.
  - The fall in spending by Ukrainian seasonal workers offsets part of the rise. Men of military age cannot leave, so seasonal workers' spending in Poland and Czechia fell.
- **Poland is the only country that moves visibly: EUR 0.44bn (0 to 1.41), 0.058% of GDP (0 to 0.19).**
- **Moldova** (0.074%) and **Montenegro** (0.078%) are next as a share of GDP. Then come Bulgaria 0.031%, Romania 0.016%, Georgia and North Macedonia about 0.015%.
- **All others are below 0.012% of GDP.** No ranking should change except perhaps Poland's by a few hundredths of a point.

## 1. Data (all checked by download on 2026-10-23)

**Eurostat `bop_its6_det`, partner UA**
- Coverage: EU, EFTA, candidate countries and Türkiye; credits and debits; EUR m; 2013–2024.
- Only the total `S` exists for partner UA. Requests for SC, SD and the other items return no values.
- 2025 is not published for UA. The dataset was last updated 2026-04-16.
- Confidential cells are filled from the EU27 total minus the published members:
  - 2022: EUR 970.1m for Ireland and Finland together. Finland is interpolated at 50, so Ireland is 920.
  - 2023: 111.2m for Finland and Malta together. Malta is set at 11, so Finland is 100.
- The audit's figures are confirmed. EU27 credits:

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|---|
| EU27 credits (EUR bn) | 8.66 | 6.36 | 7.85 | 14.19 | 12.46 | 11.12 |

  - The 2019–21 median is 7.85bn, not 7.8bn as the audit rounded.
  - EU27 debits (what the EU bought from Ukraine) rose only from 3.84bn to 3.89 / 4.09 / 4.50bn.

**OECD-WTO BaTiS, exports to UKR** (USD m, converted at ECB yearly averages)
- The reported series (N) is used for the UK (ONS), the US (BEA) and others.
- The final/balanced series (F/B) is used where nothing is reported. Those countries get certainty D.
- The split by service type is **modelled for every country** (OBS_STATUS I, methods ME/IE). It is used only to:
  - separate travel from the rest;
  - take out government services (SL) and maintenance and repair (SB).
- BaTiS's 2024 totals for Poland, Czechia and Romania are model values (Poland: USD 6.1bn against Eurostat's EUR 3.27bn), so they are not used.
- Ukraine's imports by partner in BaTiS are also modelled (e.g. Germany USD 1–2m a year). They are not usable as a mirror.

**National Bank of Ukraine** (the mirror). Ukraine's services imports by type:
- in EUR, from `BOP_y_EUR_en.xlsx` (annual to 2025) and `BOP_q_EUR_en.xlsx` (quarterly to Q2 2026);
- `Trade_y_en.xlsx`, USD: table 2.4 computer services by partner, table 2.5 travel by country group. NBU does **not** split travel by country for 2022–2024.

Travel imports (Ukrainians' card payments and cash withdrawals abroad), EUR bn:

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug* |
|---|---|---|---|---|---|---|---|---|
| travel, total | 7.61 | 4.12 | 5.29 | 18.92 | 14.55 | 12.06 | 10.36 | 6.17 |
| personal | 3.79 | 1.41 | 2.14 | 14.28 | 11.25 | 9.32 | 8.01 | 4.76 |
| business (mostly short-term workers) | 3.83 | 2.71 | 3.16 | 4.65 | 3.30 | 2.74 | 2.35 | 1.40 |
| non-travel, without government and repair | 5.63 | 4.70 | 5.99 | 5.85 | 6.70 | 8.33 | 9.16 | 6.51 |

\* 2026 Jan–Aug = Q1 + Q2 2026 + 2/3 of Q3 2025 × the H1 growth (travel 0.888, non-travel 1.109). This is the rule `uncovered.json` used.

Government goods and services imports rose from 0.88bn (2021) to 2.67bn (2022) and stay about 2.3bn. These are excluded.

**Other sources**
- **Czech National Bank, BoP Report 2022, footnote 20:** in Q1–Q3 2022 travel credits included spending by people with temporary protection, CZK 28bn+ above the 5-year average. From Q4 2022 this was moved to residents' consumption. This is the evidence that partners' travel credits can contain host-financed spending.
- **Refugee key:** NBU card data via [UCU/Forbes](https://lvbs.com.ua/en/news-en/takyh-bizhentsiv-yevropa-shhe-ne-bachyla-ukrayinski-pereselentsi-shhomisyatsya-vytrachayut-za-kordonom-2-mlrd-forbes/) (April 2022: USD 2bn a month; Poland, Germany and Czechia the main destinations). [VoxUkraine](https://voxukraine.org/en/ukrainian-migrants-spending-employment-and-impact-on-host-country-economies) gives Poland about 20%, Germany about 10% and Spain about 8% of card spending, March 2022 to March 2025. That page refuses scripted access (HTTP 403), so its shares come from a search summary (not verified).

## 2. Rules

**No-war expectation.** This is the project's services rule (services-shipping-companies.md). For trade with Ukraine, counterfactual.md also uses 2021 held flat.
- 2021 volume held flat, at the euro-area services price level (`energy2.json price_index.services`).
- For **travel only**: the 2021 COVID shortfall against 2019 closes at the UNWTO world pace (49% / 17% / 1% / 0 still open in 2022 / 23 / 24 / 25+).
- Range for non-travel: between 2019–21 flat, 2021 flat and a damped 2017–21 trend (3-year half-life, capped at ±10% a year).
- Range for travel: up to the 2019 level held.
- 2025 for partners: 2024 × Ukraine's own growth of that kind of import (NBU).
- 2026 Jan–Aug: 2025 × (Jan–Aug 2026 / 2025): travel 0.595, non-travel 0.710.

**Extra.** Actual minus expected, each year. The years are summed with their signs; only the total is floored at zero. This is `above3()`, the `sell_ukr` rule. Falls offset rises:
- Ukrainian seasonal workers in Poland and Czechia;
- less business bought from France, Hungary, Lithuania, the UK, Türkiye and Switzerland.

The two parts carry different factors, so they are netted after weighting.

**Travel: Ukrainian money only**
- World extra: NBU personal travel above expected was 11.1 / 7.4 / 5.0 / 3.5 / 1.7bn in 2022 to 2026 Jan–Aug, 28.6bn in all.
- It is allocated by the refugee key: UNHCR counts in `refugees.json` × intensity.
  - The intensity is 1 in Europe, Germany 0.5, Moldova 0.6 and 0.5 outside Europe (judgement).
  - Germany hosts about 20% of Ukrainian migrants but receives about 10% of their card spending, because benefits go into German accounts.
- Business travel (short-term workers) fell below expected from 2023: +1.0 / −0.8 / −1.7 / −2.2 / −1.7bn, −5.3bn in all.
  - This shortfall is allocated by a pre-war worker key: Poland 0.60, Czechia 0.12, Italy, Germany and Slovakia 0.04 each, Hungary and Lithuania 0.03 each, Spain, Portugal and Israel 0.02 each, and 4% by the refugee key.
  - The worker key is judgement (D), based on Poland's 1.3–1.6m declarations and permits a year for Ukrainians in 2018–21.
- Net world travel extra: 12.1 / 6.5 / 3.3 / 1.3 / −0.1bn, 23.1bn in all (likely 16.1 to 26.6).
- The travel recorded by the partner (modelled split) only widens the range; it is never the central.

**Non-travel**
- The exporter's own report, minus modelled travel, government (SL) and repair (SB).
- **The US** is an exception. BEA's total is USD 1.1bn in 2021 and 7.6 / 14.5 / 12.4bn in 2022–24 (EUR 7.2 / 13.4 / 11.4bn). It moves with security assistance (government and contractor services, Foreign Military Sales), and the split by type is imputed. So only Ukraine's computer-services imports from the US are used (NBU table 2.4: EUR 0.05bn in 2021, 0.30bn in 2025). The high end allows EUR 1bn a year of other private services. Certainty D.
- The low end is at most 0.45 × the central, because the partners' type split is modelled and part of a host's "non-travel" rise may be refugee spending.

**Shares.** These reuse the project's existing factors; no new parameters.

| part | net gain (`net_gain_sellers.json`) | genuinely extra (`value_kept.json`) | same as |
|---|---|---|---|
| travel | group `refugee_spending` (retail G47, accommodation and food I, rent without imputed rent): OECD median 0.047, Poland 0.161, Germany 0.048, Czechia 0.011 | `flowback_other.extra` 0.25 / 0.45 / 0.65 | `refugee_flowback()` |
| non-travel | group `services` (I + GTNXL): OECD median 0.040, Poland 0.181, US 0.109, Ireland 0.068 | `services_to_russia.extra_when_more` 0.30 / 0.50 / 0.70 | `svc_sold` when more is sold |

The two are combined as in `_gain_x_extra()`. Resulting central factors: Poland 0.073 (travel) and 0.091 (non-travel), Germany 0.022 and 0.019, Czechia 0.005 and 0.009, OECD-median hosts about 0.021 and 0.020.

## 3. Double counting

- **Refugee-hosting flowback** (government money): no overlap.
  - `refugee_flowback()` applies to host **government** spending.
  - The central travel figure is **only Ukrainian-issued cards**, i.e. Ukrainian money: savings, wages from Ukraine, Ukrainian pensions.
  - Host benefits are paid into host accounts and are not in the NBU card data.
  - Refugees' host wages are their own income, and the host's gain on their work is already subtracted.
  - Partners' travel credits *do* mix in host-financed spending wherever refugees were treated as non-residents (Czechia Q1–Q3 2022, CNB). That is why partners' travel is never used as the central.
- **Goods (`sell_ukr`):** no overlap.
  - `sell_ukr` is customs FOB values. Travellers' purchases are not in customs, and freight and port services on Ukrainian cargo lie outside FOB values.
  - Residual risk: card payments to foreign online shops that ship goods into Ukraine. Those goods show up in customs as postal imports (NBU revised these in 2026). The overlap is not separable and probably small.
- **The all-money ledger:**
  - Government services (SL) and repair (SB) are excluded. These cover embassies, donor-paid government services and the repair of weapons, which sits in the ledger's "weapons: equipment, services".
  - The US BEA total is not used.
  - Ukrainian pensions spent abroad by refugees are in the ledger as "spent in Ukraine", with no flowback, so they are counted once here.
- **Services with Russia:** `uncovered.json` covers partner RU only, so there is no overlap.
- **Remittances:** they are transfers, not services; not included.

## 4. Expected effect (money flowing back, 2022 to Aug 2026)

Top 15 by EUR. Gross extras are EUR bn summed 2022 to Aug 2026, central with the range in brackets. The factor columns are central. % of GDP uses `gdp_avg_r15.json`.

| | services exports to UA 2021 → 2022 / 23 / 24 (EUR bn) | travel extra, Ukrainian money | non-travel extra | factor T / N | **effect EUR bn** | **% of GDP** | cert. |
|---|---|---|---|---|---|---|---|
| Poland | 2.80 → 6.29 / 4.76 / 3.27 | 3.20 (−2.86 to 8.54) | 2.27 (0.42 to 3.65) | 0.073 / 0.091 | **0.44** (0–1.41) | **0.058** (0–0.19) | C |
| Germany | 0.40 → 0.43 / 0.63 / 0.82 | 3.45 (0.83 to 5.54) | 0.77 (0.02 to 1.28) | 0.022 / 0.019 | 0.09 (0.00–0.29) | 0.002 | C |
| Ireland | 0.81 → 0.92 / 1.41 / 1.13 | 0.61 | 1.17 (−0.65 to 2.70) | 0.038 / 0.034 | 0.06 (0–0.23) | 0.012 | C |
| USA | 0.96 → 7.20 / 13.37 / 11.42 (BEA, not used) | 0.62 | 0.76 (0 to 5.43) | 0.025 / 0.054 | 0.06 (0.00–0.45) | 0.000 | D |
| Romania | 0.07 → 1.03 / 0.85 / 0.67 | 0.95 | 1.57 (0.70 to 1.84) | 0.021 / 0.020 | 0.05 (0.01–0.13) | 0.016 | B |
| Netherlands | 0.24 → 0.23 / 0.33 / 0.33 | 0.76 | 0.29 | 0.030 / 0.041 | 0.03 | 0.003 | C |
| Spain | 0.12 → 0.05 / 0.04 / 0.05 | 1.20 | −0.19 | 0.036 / 0.051 | 0.03 | 0.002 | C |
| Bulgaria | 0.21 → 0.42 / 0.52 / 0.58 | 0.87 | 0.53 | 0.021 / 0.020 | 0.03 (0.00–0.08) | 0.031 | C |
| UK | 0.37 → 0.27 / 0.28 / 0.27 | 1.49 | −0.49 | 0.021 / 0.022 | 0.02 | 0.001 | C |
| Czechia | 0.51 → 1.57 / 0.89 / 1.14 | 2.08 (0.26 to 3.91) | 0.85 | 0.005 / 0.009 | 0.02 (0–0.12) | 0.006 | C |
| Canada | 0.15 → 0.16 / 0.19 / 0.20 | 0.69 | −0.10 | 0.021 / 0.020 | 0.01 | 0.001 | C |
| Slovakia | 0.08 → 0.12 / 0.09 / 0.12 | 0.55 | 0.07 | 0.016 / 0.043 | 0.01 (0–0.11) | 0.010 | C |
| Moldova | 0.03 → 0.08 / 0.05 / 0.06 | 0.49 | 0.05 | 0.021 / 0.020 | 0.01 | **0.074** (0.006–0.19) | C |
| Italy | 0.21 → 0.17 / 0.18 / 0.10 | 0.71 | −0.31 | 0.025 / 0.022 | 0.01 | 0.001 | C |
| Portugal | 0.04 → 0.24 / 0.10 / 0.10 | 0.23 | 0.05 | 0.041 / 0.024 | 0.01 | 0.004 | C |

The largest effects as a share of GDP are Montenegro 0.078% (D), Moldova 0.074%, Poland 0.058%, Bulgaria 0.031%, Romania 0.016%, North Macedonia 0.016% (D), Georgia 0.015% (D), Ireland 0.012% and Slovakia 0.010%.

Where the total nets to zero:
- Lithuania, Hungary and Türkiye: services sold to Ukraine fell more than refugees' spending rose. This is mostly Lithuanian and Hungarian transport and Turkish tourism.
- France: the effect is about 0, because its services net gain is 0.

**Certainty.** Romania is B on its part that matters (its own report, mostly transport and other services on the solidarity lanes). Countries that report their own data are C: the travel allocation is a key, and the type split is modelled. Countries with BaTiS-balanced data only, and the US, are D.

## 5. Open questions

1. **Polish travel after 2023.**
   - Poland's own total (3.27bn in 2024, against 2.80 in 2021 and 3.40 in 2019) implies little or no travel extra from 2024.
   - The refugee key gives Poland +0.7bn (2024) and +0.3bn (2025) net of the workers' shortfall.
   - The NBP methodology for refugees (resident or non-resident, and from when) could not be read: nbp.pl returns a bot wall.
   - This is the main driver of Poland's wide range (0 to 1.41bn).
2. **The pre-war worker key** (Poland 0.60, Czechia 0.12) is judgement. Polish and Czech data on the work spending of Ukrainian non-residents (NBP "compensation of employees" by country, CNB cross-border work) would firm it up.
3. **Eurostat 2025 for partner UA** has not been published. When it appears, it replaces the NBU-based 2025 projection. NBP and CNB might publish earlier.
4. **The partners' split by type is modelled (BaTiS).** Romania's +1bn a year should be split from BNR or INS data (transport, ports) to confirm that it is solidarity-lane transport rather than refugee travel. It counts the same way in either case (factor about 0.02).
5. **Ireland:**
   - Its 2022 value is derived from the EU27 residual. CSO could confirm it.
   - The 2017–21 trend (×7) puts most of Ireland's rise inside the no-war range.
   - Microsoft and AWS donated cloud services may appear as exports with a matching transfer, and those are not sales.
6. **US:**
   - BEA's Ukraine detail by type was not reachable; the API needs a key.
   - If BEA's 2022–24 jump also contains private services paid by Ukraine, the US high end (EUR 5.4bn gross) matters. At the US services factor of about 0.054 the effect would be at most about 0.3bn, still under 0.01% of US GDP.
7. **NBU card data:**
   - Whether it includes card payments to foreign e-commerce, which overlaps with postal goods.
   - NBU revised 2023–24 travel in 2025 and says the 2022–24 country split "will be revised". A country split from NBU would replace the refugee key.
8. **Purchases from Ukraine** (EU27 debits +0.7bn by 2024, mostly IT) would count at Ukraine's net gain as extra purchases. They are negligible and not included here.

## 6. How the builder could use it

- Add `svc_ukr` per country as a second `sell_ukr`-like part, either with two sub-series (travel, non-travel) or already weighted.
- Travel takes `aid.refugee_back_f`-style factors and non-travel takes `vk.sx`. The country rows carry both, in `shares.*.product_low_central_high`.
- Use the series in `countries.*.extra_eur_bn.*` (EUR bn, current prices, already net of the expected level), so `pidx` and `cur` are not applied again.
- Show it under "Flowing back from Ukraine" as "Extra services sold to Ukraine (transport, Ukrainians' spending)", source id `svc_ukr`.
