# China's military and military-relevant support to Russia

Data file: `research/2026-10/gaps/china_military.json`. Generated 2026-10-18 (data retrieved 2026-10-17).
Scripts: `working/chinamil/` (`fetch.py` and `fetch_m.py` for Comtrade HS-6, `fetch_hs4.py` for HS-4, `build.py` for the numbers, `write_json.py` for the output).
Unit: EUR bn, current prices, ECB annual average USD/EUR. 2026 = Jan-Aug. Ranges are roughly 90%.

## Bottom line

| EUR bn | 2022 | 2023 | 2024 | 2025 | 2026 (Jan-Aug) | certainty |
|---|---|---|---|---|---|---|
| **Uncounted total, may be ADDED as `military_rus`** | **0.17** (0.12-0.46) | **0.26** (0.19-0.65) | **0.28** (0.22-0.64) | **0.33** (0.27-0.72) | **0.24** (0.20-0.53) | D |
| Recorded dual-use, China + Hong Kong (already in trade, display only) | 4.49 (4.10-5.54) | 5.84 (5.34-7.70) | 5.04 (4.53-6.67) | 4.85 (4.19-6.44) | 3.00 (2.14-4.90) | B |
| of which above the 2021 level (central) | 0.14 | 1.49 | 0.69 | 0.50 | 0.22 | B |
| Finished military items, total value (mostly in trade) | 0.08 (0.02-0.29) | 0.23 (0.07-0.56) | 0.37 (0.14-0.83) | 0.53 (0.22-1.24) | 0.43 (0.17-1.03) | C/D |
| Intelligence, training and technical services (all uncounted) | 0.03 (0.005-0.11) | 0.05 (0.01-0.17) | 0.07 (0.02-0.23) | 0.11 (0.03-0.31) | 0.09 (0.02-0.26) | D |

Compared with the other suppliers on the map (central, 2024): North Korea 4.3, Iran 1.1, Belarus 0.08. China's *added* amount is small because almost all of its help is sold as trade and is already on the map.

The uncounted total is the sum of three parts:
- finished military items that no customs office records: 15% (5-30%) of the finished-item value;
- dual-use goods smuggled past both customs systems: 3% (0-10%) of recorded dual-use;
- intelligence and services.

Central values are sums of the most likely values. Low and high values are the 5th and 95th percentiles of a Monte Carlo simulation. The distribution is skewed to the right: Monte Carlo medians run 0.26-0.47.

## 1a. Dual-use goods on the Common High Priority list (recorded)

**Method.** I pulled China's (reporter 156) and Hong Kong's (344) own reported exports to Russia from the UN Comtrade public preview API, for 2019-2025.
- The list has 51 HS-6 codes, taken from the US/EU/UK/Japan list as reproduced by HSBC (2024).
- Hong Kong is also covered monthly for 2025 to Jul 2026. China's monthly HS data are not in Comtrade.
- For comparison, I also pulled China's exports to Kazakhstan, Kyrgyzstan and the world.

USD bn:

| | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| China, CHP list | 3.63 | 3.86 | 5.25 | 4.63 | 4.38 |
| Hong Kong, CHP list | 1.40 | 0.68 | 0.83 | 0.53 | 0.61 |
| China, drone and munitions codes outside the list (motors, engines, fibre optics, 8806, nitrocellulose) | 0.12 | 0.18 | 0.24 | 0.29 | 0.49 |
| China, machine tools 8456-8466 outside the list (high case only) | | 0.50 | 1.12 | 0.92 | 0.87 |
| China, CHP list to Kazakhstan + Kyrgyzstan | 0.92 | 0.86 | 1.39 | 1.67 | 1.29 |

- **Largest codes** (China, 2025): routers and switches 851762 (0.71); static converters 850440 (0.64); computers 847150 (0.48); radio and camera modules 852589 (0.30); computer units 847180 (0.28); semiconductor-making machines 848620 (0.27); connectors 853690 (0.19); radar and transmission parts 852990 (0.18); machining centres 845710 (0.16).
- **Hong Kong** carries the integrated circuits (854231 and 854239), which are probably Western or Taiwanese chips routed through it. KSE reaches the same conclusion.
- **Cross-checks:**
  - OSW/MERICS: Chinese dual-use exports were above USD 4bn in 2024 and 2025, and USD 1.9bn in H1 2025.
  - KSE Q2 2026: China supplies 75-85% of Russia's CHP imports.
  - US officials: about 90% of microelectronics and about 70% of USD 0.9bn of machine tools in Q4 2023. That implies about USD 2.5bn a year of machine tools from China. China records USD 1.6bn for 2023, so the high case adds the machine tools outside the list.
  - Telegraph (Jan 2026): at least USD 10.3bn since 2022, including CNC tools of at least USD 3.1bn. That is consistent with the cumulative central plus the high case.
- **Fastest growth** is in drone inputs: small DC motors 850131 rose from USD 0.03bn (2021) to 0.18bn (2025), engines 840790 from 0.04bn to 0.14bn, and optical fibre 900110 from 0.02bn (2022) to 0.06bn. This matches the Washington Post on fibre-optic drones and WSJ: 3.3m motors from Shenzhen Kiosk for USD 83m. Nitrocellulose (391220) direct to Russia is only USD 6m (2023). The large volumes reported by Blinken and the Economist must travel under other codes, through third countries, or as finished powder.
- **2026.** Jan-Aug = 2025 x 0.64 (the Jan-Aug share of China's exports to Russia in `trade_full.json`) x 0.8-1.25. Hong Kong's Jan-Jul 2026 CHP exports (USD 0.324bn) equal Jan-Jul 2025 (0.325bn).
- **Why the increase over 2021 is small.** Russia's total CHP imports fell by more than half in value, while China took over the share coalition suppliers had held (KSE). China also charges about 300% over the world price (KSE, 2025). Recorded values therefore overstate the quantity, and the premium is money flowing from Russia to China.

**Overlap: 100%.** These are the same customs records that `trade_full.json` sums (HS TOTAL), so `from_rus` already contains them, though only the part above the pre-war level counts toward the shift. Transit through Central Asia is already credited to China as origin, in `residual.json` (Kyrgyz and Kazakh transit) or `reexports.json` (recorded re-exports). Hong Kong's CHP exports are in Hong Kong's own `exports_to_RUS`.

**Military weight flag: yes, for display only.** Dual-use goods are about 4-5% of China's recorded exports to Russia and 29-37% of Hong Kong's. Show them as "of which war-critical dual-use", and do not add them to `military_rus`. Not every CHP good goes to the military: routers and computers also serve civilian buyers. The flag marks goods that are war-critical, not goods proven to have gone to the army.

## 1b. Finished military items

| Item | Evidence | Value logic (USD) | Certainty |
|---|---|---|---|
| Garpiya-A1 engines (L550E type, Xiamen Limbach, then Beijing Xichao) | Reuters Sep 2024: 2,500+ Garpiyas Jul 2023-Jul 2024. Reuters Jul 2025: 6,000+ contracted for 2025, engines declared as "cooling units" | about 2,000-6,000 a year x 5-15k = 0.01-0.09bn | B on quantities, D on price |
| Geran-2 engines and navigation | WSJ Oct 2025: China is the main external supplier | 25-35k drones (2025) x 30-70% with Chinese engines x 3-10k = 0.02-0.25bn | C/D |
| Geran-3 turbojets (Telefly) | Euromaidan Press / Conflict Armament Research, 2026 | hundreds to a few thousand x 20-50k = 0.01-0.1bn | D |
| Garpiya-3 made in China | Reuters Sep 2024: seven Chinese-made drones (two G3) delivered; Kupol claimed it could mass-produce in China | small; no proof of serial delivery | C |
| Quadcopters, thermal sights, body armour, helmets, rifles | Politico 2023 (Norinco rifles, body armour, drone parts via Turkey and the UAE); Chinese direct 8806 exports to Russia only USD 10-20m a year, the rest via hubs | 0.05-0.4bn a year | D |

The totals are in the table at the top. They rise from about 0.08bn (2022) to 0.6bn (2025, central).

**Overlap: 85% (70-95%) is already in trade.**
- Reuters saw invoices and transport documents for the engines, and WSJ found the drone motors in customs data. These goods appear in China's exports to Russia, often under false HS codes. That changes which code they sit under, not whether their value is counted.
- Quadcopters and sights go mainly through Kyrgyzstan, Kazakhstan and the UAE, which `residual.json` and `reexports.json` already handle.
- The remaining 15% (5-30%) is assumed to move through state channels, hand carry, or kits that neither customs records. It enters the uncounted total as 0.01-0.08bn a year (central).

Not counted as military: Chinese trucks, cars, ATVs and motorcycles used at the front. They are civilian trade, already in `from_rus`, and impossible to split.

## 1c. Satellite imagery, intelligence and services

- **Documented.**
  - US Treasury sanctioned Spacety and Changsha Tianyi (Jan 2023) for imagery supplied to Wagner over Ukraine.
  - AFP: Wagner's contract with Beijing Yunze was worth USD 30m+ for two satellites and their images (2022).
  - The EU listed Chang Guang Satellite Technology (14th package, 2024).
  - In April 2024 the US said China was helping Russia with satellite and geospatial capabilities.
  - Ukrainian intelligence claimed in Oct 2025 that Chinese satellites support Russian strikes. That is a belligerent source.
  - Reuters (May 2026): about 200 Russian personnel were trained in drone warfare in China in late 2025, under a July 2025 agreement. Hundreds of Chinese personnel were to train in Russia.
  - Kupol developed the Garpiya-3 in China with local specialists (Reuters, 2024).
- **Valuation.** No price is public, so the value comes from benchmarks.
  - The Wagner deal set USD 30m as the price of one customer's capability.
  - A full national commercial imagery service is worth about USD 300m a year (the scale of US commercial imagery contracts). This sets the high end.
  - Training is valued at 200 personnel x USD 50-150k.
  - Central: USD 0.03bn (2022), 0.05bn (2023), 0.08bn (2024), 0.12bn (2025), 0.10bn (Jan-Aug 2026). High: 0.12-0.35bn a year.
- **Overlap: 0%.** These are services, outside goods trade, and they do not appear in the services data the map uses.

## 1d. Payment channels and banks (described, not valued)

- **Route of the money.** After the US secondary-sanctions order (EO 14114, Dec 2023), large Chinese banks rejected most direct payments from Russia in 2024. Payments moved to other channels:
  - VTB's Shanghai branch;
  - small regional and border banks; the EU listed Heihe and Suifenhe Rural Commercial Banks in its 18th package (Jul 2025), the first Chinese banks it has listed;
  - payment agents and netting schemes ("China track"), barter, and shells in Hong Kong and Central Asia;
  - crypto rails through Kyrgyzstan.
- **Why no value.** These channels settle trade that is already counted (recorded exports plus the residual). A separate flow would count the same goods twice. Agent commissions (an assumed few per cent) stay with intermediaries and are not counted either.

## 2. Overlap summary (what not to add)

| Item | Share already in trade | Where it is counted |
|---|---|---|
| Recorded dual-use (China, Hong Kong) | 100% | `trade_full.json` exports_to_RUS (CHN, HKG) |
| Dual-use via Kazakhstan and Kyrgyzstan, unrecorded | 100% | `residual.json`, China as origin |
| Dual-use via Armenia, the UAE, Turkey and others, recorded | 100% | `reexports.json`, origin share to China |
| Mis-declared or under-invoiced goods that Russia records | 100% | `residual.json` pro-rata share for China (EUR 7.6-17.8bn a year) |
| Finished military items | 85% (70-95%) | as above |
| Goods that escape both customs systems | 0% | added: 3% (0-10%) of recorded dual-use |
| Satellite imagery, training, engineering | 0% | added |
| Payments | n/a | not a flow |

## 3. Evidence quality and weakest assumptions

- **A:** none. China denies any military supply, and there is no official count.
- **B:** recorded dual-use from customs data. The open question is scope: which codes count as "military-relevant".
- **C/D:** finished items. The unit counts come from Reuters and WSJ documents; the unit prices are my assumptions.
- **D:** intelligence and the uncounted total.

**Weakest assumptions, in order of impact:**
1. **Share of finished items outside all customs records (5-30%).** No source measures it. If China ran a state-to-state channel of the North Korean kind, the true amount could be several times the high value. No Western government has claimed such deliveries: Blinken said in May 2024 that China, unlike North Korea and Iran, was not sending arms.
2. **Smuggled dual-use outside both customs systems (0-10%).** This assumes `residual.json` captures everything Russia's customs record. If Russia keeps classified military imports out of its published totals (not confirmed; The Insider reports that 180 high-tech categories were removed from the published data in 2025), this part could be larger.
3. **Price of intelligence.** This is a benchmark, not an observation. It is also unknown whether China gave imagery for free (a transfer) or sold it.
4. **Geran engine share and unit prices.**
5. **2026 China scaling.** It rests on 2025 x 0.8-1.25 because China's monthly HS data are not in Comtrade.

Not used: the CSIS and RUSI drone pieces, and the Silverado tracker. I found no CSIS or RUSI value series beyond the sources above. The Reuters reports cover the Garpiya and Chinese-made attack drones.
