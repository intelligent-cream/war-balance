# Audit of the 31 most-viewed countries (2026-10-18)

This is the first check of `site/data.json` against independent primary sources. Every part's 2022 to Aug 2026 total was compared with its source. The details, sources and worst-case ranges are in `audit.json`. This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

**Caveat:** `data.json` was rebuilt three times while the audit ran: the CIF-to-FOB freight cut, Turkey/India refining, gas price indices, pre-war trends and shipping all changed. The audit uses the version generated 2026-10-18 (sha256 prefix in `audit.json`). Import checks are converted from CIF to FOB (x0.945), as the pipeline now does.

## Verdicts
264 parts were checked: **167 ok**, **5 adjust** and **92 unverifiable** (each unverifiable part has a worst-case range).
- **Mostly ok:** aid, EU aid share, paid to Russia, sold to Russia, EU services, and company taxes for the KSE-reported countries.
- **Mostly unverifiable:** refugees outside the 5 countries with national budgets, laundered oil (no member-state split exists), non-EU services, hidden channels and shipping.

## Corrections, biggest first
1. **Turkey, paid to Russia: 220 → 184.5 (171.6-197.4), adjust.**
   - Final-use Russian gas (EUR 39.1bn for 2022-26) is added on top of Turkish customs totals that already contain it.
   - Turkish HS 27 imports from Russia were USD 39.7bn in 2022, yet HS 2711 shows only USD 0.15bn. The gas is in the total without a sub-heading label, so `customs_gas.json` misses it.
   - The 2019-2021 baseline has the same double count (about 4.3bn a year).
2. **Germany, paid to Russia: 59.9 (47.4-72.9), ok, but the central is about EUR 10bn high.**
   - The 2022 gas is valued at a Europe-wide EUR 92/MWh, giving EUR 25.2bn. CREA's German border value is EUR 19.3bn, and that figure even includes gas passed on to Czechia and Austria.
   - German customs already contain about EUR 2.3-3.5bn of unlabelled HS 27 (gas). The swap leaves it in.
   - Suggested: about 50 (45-56).
3. **Poland, refugees: 17.7 (9.0-34.3), ok, but the central is low.** The government report puts humanitarian and economic aid at PLN ~90bn for 2022-23 alone (about EUR 19bn). A central near EUR 24bn is more likely.
4. **Laundered oil, all EU members: unverifiable.**
   - Global Witness attributes 35m barrels of Russian crude to EU imports in 2023, worth about EUR 2.1bn. Our EU sum is EUR 3.4bn, about 1.6 times as much.
   - Member values are probably about 30-40% too high. Worst cases are in `audit.json`.
5. **Hungary, paid to Russia: 30.9 (25.2-39.5), ok, but about EUR 4bn high.** The 2022 final-use gas is EUR 12.3bn, against EUR 7.9bn in Hungarian customs and EUR 8.3bn at CREA.
6. **Canada and US refugees: unverifiable; the central is probably high.**
   - Both are modelled from GDP per head, giving 7.6 and 11.1 with 10-15x ranges.
   - The federal programme budgets (IRCC CUAET, ORR) would replace a model with a fact.
7. **Greece, paid to Russia: 10.3 (8.2-17.9), ok, but the central is low by about EUR 3-4bn.** Final-use gas (EUR 1.2bn in 2022) replaces EUR 4.1bn of Russian gas in Greek customs.
8. **Poland, paid to Russia: 21.7 (19.6-23.9), ok, with a double count of about EUR 2.6bn.** Yamal gas sits in Polish customs as confidential chapter 99 (EUR 2.8bn in 2022) and is added again as final-use gas.
9. **Czechia, Hungary and Slovakia, aid: adjust.**
   - The EU's 2026 Ukraine Support Loan disbursements (EUR 11.6bn in Kiel R31) are split over all 27 members, but these three do not guarantee the loan.
   - Corrected values: CZE 2.06 → 1.90, HUN 0.98 → 0.87, SVK 1.37 → 1.30. The removed slice belongs to the other 24 members (+3%).
10. **Denmark, sold to Russia: 0.65 (0.62-1.00) → 0.87 (0.64-1.23), adjust.** Danish national data and Eurostat Comext (1.18) disagree. The figure should sit between them.

Other results:
- **Aid:** every Kiel donor matches Release 31 exactly.
- **EU services:** match Eurostat exactly.
- **Company taxes:** consistent with B4Ukraine/KSE. The US is 15.5 against a check of 12.5-17, and Germany 8.6 against 7.5-11.

## Implausible or double-counted on their face
- **Headline % of GDP:** Lithuania 43.7%, Estonia 29.2% and Finland 18.8%. The Netherlands, Poland, Slovakia and Czechia are at 9.6-10.8%.
  - These come from "less paid to Russia" and "sales given up", counted at full trade value and at pre-war prices.
  - Much of the pre-war trade in the Baltics and Finland was transit and re-export.
  - No expert would read 44% of GDP as money shifted toward Ukraine.
- **EU aid shares:** about 75% of the EU allocations split by budget share are loans, and another 7% are guarantees, all at face value. This includes ERA (EUR 18.1bn, repaid from Russian assets) and the Ukraine Support Loan.
  - US (18.3), UK, Canadian and Japanese aid also include their ERA loans in full.
- **Gas double counts:** customs that hide Russian gas without the HS 2711 label (Turkey, Poland, partly Germany) keep it when final-use gas is added.
- **UAE gold:** gold can appear up to three times, in customs imports, in hub pass-on and in hidden channels (central 6.8).
- **Greece shipping:** shipping (EUR 15.5bn) was added although the README said Greek tanker earnings were left out to avoid double counting, and Greek transport credits are already in services.
- **Refined fuel:** India's and Turkey's re-exported crude is now removed at the refiner, but Chinese and EU refiners are not treated the same way.
- **Undisclosed military aid:** Germany (1.8) and France (2.3) may overlap Kiel's own estimates.
- **Company taxes:** these include VAT, excise and payroll taxes that Russian customers and staff pay. Profit tax is about a third of the total.
- **China, sold to Russia:** about EUR 90bn above Chinese customs, from hub re-exports plus a residual import gap. The overlap between the two modules is untested.

## Sources (all retrieved 2026-10-17)
- **Kiel Ukraine Support Tracker, Release 31:** https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx
- **Eurostat Comext DS-045409 (trade with Russia, HS chapters and sub-headings):** https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409
- **UN Comtrade public API (reporter data, HS TOTAL/AG2/27/2711):** https://comtradeapi.un.org/public/v1/preview/C/A/HS
- **ECB annual EUR/USD rates (Eurostat ert_bil_eur_a):** https://ec.europa.eu/eurostat/databrowser/view/ert_bil_eur_a/default/table
- **CREA Russia Fossil Tracker API:** https://api.russiafossiltracker.com/v0/counter
- **Eurostat bop_its6_det (services):** https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table
- **UNHCR population API:** https://api.unhcr.org/population/v1/population/?coo=UKR&coa_all=true
- **B4Ukraine/KSE, 2024 taxes:** https://b4ukraine.org/whats-new/how-global-firms-bankrolled-russias-war-chest-in-2024
- **B4Ukraine/KSE, "The Business of Staying" (2022):** https://b4ukraine.org/pdf/BusinessOfStaying.pdf
- **Global Witness, EU laundered oil 2023:** https://www.globalwitness.org/en/campaigns/fossil-gas/eu-purchases-of-laundered-russian-oil-worth-an-estimated-11-billion-to-the-kremlin-in-2023/
- **CREA, UK fuel made from Russian crude:** https://energyandcleanair.org/wp/wp-content/uploads/2024/02/CREA_Press-Release_UK-Russian-oil_Analysis_02.2024.pdf
- **Polish government, support figures:** https://www.gov.pl/web/japonia/polands-support-1000-days-after-russias-aggression-against-ukraine
