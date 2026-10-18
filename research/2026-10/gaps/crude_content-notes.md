# Crude content of fuel refined from Russian crude

File: `crude_content.json`. Gathered 2026-10-18. Not yet reviewed by a person. Ranges are meant as about 90%.

## Question
A refiner (India, Türkiye, China, Brunei's Hengyi, other) exports fuel made from Russian crude. Of each euro a buyer pays for that fuel, how much went to Russia for the crude? The crude is valued at the FOB price Russia gets (Urals or ESPO after the discount). Freight, insurance and trader margins are left out, because the project counts them separately.

## Result (central, low-high)

| refiner | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|
| IND | 0.89 (0.81-0.96) | 0.66 (0.56-0.75) | 0.64 (0.54-0.76) | 0.75 (0.67-0.84) | 0.68 (0.60-0.81) | 0.64 (0.54-0.74) |
| TUR | 0.89 (0.82-0.95) | 0.67 (0.59-0.73) | 0.67 (0.58-0.75) | 0.78 (0.66-0.87) | 0.71 (0.64-0.80) | 0.67 (0.58-0.79) |
| CHN | 0.95 (0.91-0.97) | 0.72 (0.63-0.79) | 0.75 (0.63-0.86) | 0.82 (0.71-0.92) | 0.76 (0.64-0.89) | 0.75 (0.64-0.84) |
| BRN | 0.90 (0.79-0.97) | 0.66 (0.55-0.76) | 0.63 (0.54-0.77) | 0.74 (0.66-0.85) | 0.67 (0.59-0.82) | 0.63 (0.55-0.74) |
| other | 0.93 (0.84-0.97) | 0.69 (0.58-0.77) | 0.69 (0.58-0.80) | 0.79 (0.69-0.88) | 0.72 (0.62-0.84) | 0.69 (0.58-0.79) |

**Main finding.** The project's constant 0.42 / 0.50 / 0.60 is too low for a refiner's whole export basket. Every post-war central value here is 0.63-0.82. Before the war it was about 0.9, because there was no discount and refining margins were thin.

## Why it is above CREA's 0.494
CREA found EUR 4.2 bn of crude in EUR 8.5 bn of products (Dec 2022-Dec 2023). That ratio is roughly Urals FOB divided by the diesel price, tonne for tonne. Re-done with CREA's own prices it is 0.52 for 2023. Three things raise it:
- **Yield loss.** About 1.06 t of crude goes into each tonne of product (yield 0.94). Factor 1.06.
- **Crude mix.** India also buys ESPO, Sokol and Arctic grades, which sell above Urals. Factor about 1.05.
- **Export basket.** Refiners export gasoline, naphtha and fuel oil as well as diesel. These are cheaper than diesel. Factor 1.02-1.10.

If the project's fuel values are diesel and jet only (as in CREA's flows to the EU, US, UK and Australia), use `inputs.diesel_only_weight_based` instead. It gives 0.56-0.70 after 2022 (IND 0.59 in 2022-23, 0.65 in 2024, 0.64 in 2025, 0.61 in 2026).

## Two methods (central = their mean)
- **A, the requested definition (by weight).** Crude USD/t ÷ yield ÷ the refiner's HS 2710 export unit value (Comtrade, FOB).
- **B, by value.** Russian FOB crude USD/bbl ÷ the value of everything a barrel yields. That value = Dubai (Brent for Türkiye) + the Singapore complex refining margin + a premium for the refiner.
- A and B agree to within 0.03-0.08. B is a bit higher because exports are lighter than total output (LPG, petcoke and sulphur stay at home).

## Worked example: India 2023
- Urals FOB 60.1 and ESPO FOB 73.9 USD/bbl (CREA). The mix is 80% Urals → 62.9 USD/bbl.
- In tonnes: 0.8 × 60.1 × 7.3 + 0.2 × 73.9 × 7.4 = 351 + 109 = **460 USD/t of crude**.
- Yield 0.94, so one tonne of product needs 460 / 0.94 = **489 USD of crude**.
- India's HS 2710 exports in 2023: USD 84.96 bn for 103.7 Mt = **819 USD/t**.
- A = 489 / 819 = **0.60**.
- B: Dubai 82.1 + Singapore margin 6.3 + India premium 3 = 91.4 USD/bbl. 62.9 / 91.4 = **0.69**.
- Central = (0.60 + 0.69) / 2 = **0.64**.

## Main inputs
- **Urals FOB, USD/bbl (CREA):** 67.7, 77.8, 60.1, 65.5, 54.2, 67.3 (2021-2026 Jan-Aug).
- **Russian MinFin Urals:** 69.0, 76.09, 62.99, 67.85, 55.62. These are close to CREA except in 2022, when MinFin still used CIF quotes.
- **ESPO FOB, USD/bbl (CREA):** 70.1, 81.5, 73.9, 74.7, 64.9, 83.8.
- **Export unit values, USD/t (Comtrade HS 2710):**
  - IND: 612, 996, 819, 721, 673, ~900.
  - CHN: 539, 900, 770, 719, 679, ~840.
  - TUR: 590, 930, 689, 630, 589, ~740.
  - BRN: ~600, 983, 799, 716, 661, ~840.
- **Crude mix (Urals share):** IND 0.8, TUR 1.0, CHN 0.3, BRN 1.0, other 0.7.
- **Yield:** 0.94 (Brunei 0.95), range 0.92-0.97.
- **EUR/USD:** 1.1827, 1.053, 1.0813, 1.0824, 1.13, about 1.16. The ratio has no unit, so the exchange rate does not change it.

## Where sources disagree
- **The Urals level.** CREA FOB and MinFin differ by 1-3 USD/bbl. Indian customs show Russian crude landing at 74.6 (2023), 78.2 (2024) and 69.8 (2025) USD/bbl CIF. After freight that suggests a realised FOB at or a bit above CREA, so the high case uses up to 65 (2023) and 60 (2025).
- **"Urals 112 USD in April 2026."** CREA's April 2026 report cites this figure, but it includes freight. CREA's own FOB series has 94.8, and its tax estimate uses 93.
- **Singapore margins.** Krungsri, ICRA and Kiatnakin use different periods. I set calendar-year values by hand: 2.5, 11.5, 6.3, 4.0, 6.0 and about 13 for 2026 (−11 in March, 24.7 in Q2).

## What is estimated, not published
- 2026 unit values. Only India Mar-Jul 2026 is in Comtrade (USD 1,045/t). The rest is scaled with CREA diesel.
- Dubai for 2025-26, Brent for Jan-Feb 2026, the calendar-year Singapore margins, and the refiner premiums (India +3, Türkiye +2, China 0, Brunei and other +1 USD/bbl).
- The crude mixes (Urals vs ESPO) for each refiner, Hengyi's crude slate (Reuters: Urals and Arco cargoes), and the whole "other" basket.
- **China 2021.** Method A gives 1.01 because China's exports include cheap bunker fuel oil. The value is capped at 0.95.

## For the pipeline (not changed here)
`CRUDE_CONTENT = (0.42, 0.5, 0.6)` in `pipeline/build_data.py` probably understates the crude money in the refiners' fuel by about 25-50% after 2022. This holds only if the fuel values it multiplies are whole export baskets. For diesel- and jet-only flows the understatement is about 15-30%.
