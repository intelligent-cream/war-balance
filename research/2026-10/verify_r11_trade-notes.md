# Verification r11: trade, fossil fuels and crude prices against primary sources

Done 2026-10-19. Results: `verify_r11_trade.json` (843 checks). Raw responses: `raw/comtrade/`, `raw/eurostat/`, `raw/crea/` (and `raw/crea/minfin_press/`).
A check is `yes` if it is within 3%, `close` if within 15%, and `no` otherwise. Every primary number in the JSON was downloaded today. None was estimated.

## Bottom line
I found no fabricated numbers. Every trade, fossil and price input I checked can be traced to the source it cites, to the decimal. Where independent sources disagree, the cause is a known difference in statistical concept, not the project's arithmetic. One limit applies: matching the project's own source shows faithful transcription, not that the source itself is right.

## 1. Goods trade (trade_full.json)
- **UN Comtrade public preview** covered 38 reporters: 24 EU members, plus USA, GBR, CHN, IND, TUR, JPN, KOR, KAZ, BRA, ARE, CHE, NOR, AUS and HKG.
  - I checked 2021, 2023 and 2024, with all four flows (imports from and exports to Russia and Ukraine).
  - **452 of 452 values match exactly** after conversion at the ECB annual rates.
  - Examples: China's 2024 imports from Russia are USD 129.9bn, or EUR 120.0bn. India's 2023 imports are USD 67.1bn, or EUR 62.0bn. Germany's 2021 imports are USD 27.4bn, or EUR 23.1bn.
  - For these countries the project uses reported values without adjustment. The mirror ratios and the CIF/FOB step apply only where a country does not report, so no adjustment was needed to compare like with like.
- **UAE 2024**: Comtrade returns no report. This matches the project's note. The project uses IMF data or an estimate here, so there was nothing to compare.
- **Eurostat Comext (DS-045409, annual, EUR)** is an independent check for 27 EU reporters.
  - For the Russia flows, 85 values are `yes`, 29 `close` and 48 `no`.
  - The EU27 sums are close: imports from Russia are 152.0 (ours) vs 163.6 (Eurostat) in 2021, 49.3 vs 50.8 in 2023, and 35.7 vs 36.3 in 2024.
  - Single countries differ a lot. Netherlands 2021: 18.5 vs 26.5. Austria 2023: 0.36 vs 3.67. Germany 2023: 3.9 vs 2.4. Czechia 2021: 5.9 vs 3.0. Estonia exports 2024: 0.95 vs 0.43.
  - The likely reason is that Comtrade carries national-concept data and Comext uses the EU "community concept". The two differ in four ways:
    - quasi-transit through Dutch and Belgian ports, which inflates NL and BE in Comext;
    - goods cleared in one member state but bound for another, which makes DE higher and CZ and SK lower in Comext;
    - Austria hides the partner for its Russian gas in national data;
    - small reporters such as LUX and CYP.
  - The project uses one source (Comtrade) consistently for 2019-25. It splices 2026 Comext to the Comtrade level (for example DEU x1.709), which handles the gap. For the NL/BE hubs, national-concept figures are arguably the better measure of what the country itself buys. Still, a reader comparing with Eurostat will see these gaps, so the project should say this on the map.

## 2. Fossil fuels (energy.json `fossil_from_russia`)
- **CREA Russia Fossil Tracker** (`/v0/counter`, sum of oil, gas and coal at default pricing): I checked the 15 largest buyers for 2022-2024.
  - **45 of 45 values match to within 0.001.** China is 75.3, 79.3 and 79.8; India 26.3, 44.3 and 46.4; Türkiye 31.9, 31.8 and 33.6 (EUR bn).
  - The project value is CREA's figure itself, so this confirms transcription only.
- **Independent cross-check, Comtrade HS 27 imports from Russia, 2023:**
  - BRA, HUN, KOR and SVK agree within 4%.
  - CHN (0.91) is `close`.
  - IND (0.82) and JPN (0.82) are `no`: CREA is lower. CREA values fuel FOB at Russia, while importers report CIF. Freight on long routes during the shadow-fleet period explains most of the gap.
  - TUR (1.14) is `close`: CREA is higher, probably because CREA assigns TurkStream transit gas to Türkiye (the project's energy-notes says so).
  - These gaps come from the concept used, not from errors. But the CREA figure is a model, and India's CIF payments for 2023 were about EUR 10bn higher.

## 3. Russian crude prices (crude_content.json inputs)
- **CREA daily price API**, annual means for 2021-2025: Urals 67.69, 77.78, 60.13, 65.51 and 54.23. ESPO 70.11, 81.54, 73.91, 74.66 and 64.94. **All 10 match the project** (67.7/77.8/60.1/65.5/54.2 and 70.1/81.5/73.9/74.7/64.9).
- **Russian MinFin Urals averages:**
  - 2022 (76.09) and 2023 (62.99) are confirmed exactly by TASS, which quotes MinFin's Telegram channel.
  - For 2024 (project 67.85), I could find only a rounded secondary figure: "68 USD" on investfuture.ru, citing the Bank of Russia. That is consistent but not exact.
  - minfin.gov.ru returned 503 and economy.gov.ru reset the connection, so the official monthly series was not retrieved.
  - I did not verify 2021 (69.0) or 2025 (55.62).
- MinFin's price is a tax reference price, a different concept from CREA's FOB. MinFin is above CREA in 2023-24 and below it in 2022. The project uses CREA as its central value, which fits its FOB definition.

## Not done
- No Eurostat check for non-EU countries (it has none).
- The official MinFin 2024 figure was not retrieved, and 2021 and 2025 were not checked.
- CREA's own modelling was not audited.
