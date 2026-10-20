# Power of Siberia: contracted deliveries in China's no-war path (round 15)

Data: `power_of_siberia_r15.json`, generated 2026-10-19. Raised by review 4 (M2), approved by the owner. **Not yet reviewed by a person.**

## Why

China's imports from Russia keep the 2021 level in the no-war path (`cf: "rw"`, the back-tested choice for imports from Russia). The Power of Siberia pipeline was agreed in 2014 (a 30-year CNPC–Gazprom contract, 38 bcm a year at plateau) and has delivered since December 2019, so its ramp-up from 10.39 bcm in 2021 to the plateau was expected without the war. Counting it as war-driven credited China with more payments to Russia than the war caused.

## Volumes (bcm a year)

| year | delivered | contracted (used) | basis |
|---|---|---|---|
| 2021 | 10.39 | – (the base) | Gazprom; `gas_prices.json` records 10.4 |
| 2022 | 15.4 | 15.4 | the 2022 contractual quantity was not found: the delivery is taken as contracted (**not verified**) |
| 2023 | 22.7 | 22.0 | Gazprom: 0.7 bcm (3.2%) above its contractual obligation (Reuters via [BusinessDay, 3 January 2024](https://www.businessday.co.za/bd/world/europe/2024-01-03-russian-gas-supply-to-china-reaches-record-daily-level/), fetched) |
| 2024 | 31.12 | 30.0 | the initial plan of 30 bcm, from a search summary of an Interfax report (**not verified**); 31.12 delivered ([Interfax, 13 January 2026](https://interfax.com/newsroom/top-stories/115552/), fetched) |
| 2025 | 38.84 | 38.0 | the contractual plateau, reached on 1 December 2024 ([Interfax, 13 January 2026](https://interfax.com/newsroom/top-stories/115552/)); 38.8 delivered, above contract ([Interfax, 28 April 2026](https://interfax.com/newsroom/top-stories/117354/)) |
| 2026 | – | 38.0 | the plateau (the map takes January–August); the agreement of autumn 2025 to raise it to 44 bcm ([TASS, 20 October 2025](https://tass.com/economy/2032425)) was made during the war and is not in the no-war path |

## How it enters the map

`power_of_siberia()` in `build_data.py`, right after `counterfactual()`: the contracted volume above 10.39 bcm, × 10.55 TWh per bcm × China's 2019–2021 pipeline-gas unit value (15.2 EUR/MWh, `gas_prices.json`), ÷ China's pre-war base, is added to its expected path (`bmul`, `bmul_lo`, `bmul_hi`: +0.015, +0.035, +0.059, +0.082, +0.082 for 2022–2026). `apply_nowar_prices()` then applies the no-war fuel price as for every year. The added path is in `to_rus.pos_contracted_bmul_add`; check 28 confirms it.

## Effect

China's change in payments to Russia −0.66% → −0.63% of GDP (about EUR 5bn less counted as war-driven, at Russia's gain). The review estimated about −0.60%; the contracted path leaves out the deliveries above contract (0.7, 1.1 and 0.8 bcm). TurkStream deliveries contracted in 2020–2021, which the review also mentioned, are not treated this way yet.
