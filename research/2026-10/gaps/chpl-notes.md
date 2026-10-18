# War-critical goods sold to Russia (Common High Priority List)

Data file: `research/2026-10/gaps/chpl.json`. Generated 2026-10-18.
Unit: EUR bn, current prices, converted with the ECB rates in `trade_full.json`. 2026 covers January–August only.
Scripts and raw downloads are in the scratchpad (`r7/chpl/`): `fetch3.py` (Comtrade), `eu.py` (Comext), `assemble.py`, `build.py` and `write_out.py`.

**Purpose.** This is a display marker only, with no change to any total. Every euro in it is already counted in `exports_to_RUS` in `trade_full.json`, or in the residual and re-export layers. It answers one question: how much of what a country sold to Russia was the kind of goods Russia's weapons need.

## 1. The list

The **Common High Priority List** (CHPL) is shared by the EU, the US, the UK and Japan. The current version, of 23 February 2024, has **50 HS-6 codes** (BIS and EU pages; the full list is in `codes` in the JSON).

| Tier | What | Codes |
|---|---|---|
| 1 | Integrated circuits | 854231, 854232, 854233, 854239 |
| 2 | Other electronics: network gear, GNSS and radio navigation, tantalum and ceramic capacitors, electrical parts | 851762, 852691, 853221, 853224, 854800 |
| 3.A | Other electronic parts: computer processors, power converters, cameras, antennas, radio and radar parts, connectors, diodes, transistors, other semiconductors, crystals | 16 codes |
| 3.B | Mechanical and optical parts: bearings, aircraft and UAV parts, sights and optics, navigation instruments | 9 codes |
| 4.A | Making and testing electronics: semiconductor equipment, printed circuits, signal generators, oscilloscopes and meters | 11 codes |
| 4.B | CNC machine tools and their parts | 845710, 845811, 845891, 845961, 846693 |

**How the list changed:**
- May 2023: the first joint list (US/EU/UK/Japan guidance on the highest-priority HS codes).
- 23 June 2023: the EU's first full list.
- September 2023: 45 codes. Seven codes were added, including bearings and navigation antennas, and tier 3 was split into 3.A and 3.B.
- 23 February 2024: 50 codes. The five CNC codes were added as tier 4.B.

I found no later change, as of October 2026. The separate EU "economically critical goods" list (February 2025) is a different list.

The JSON applies the 2024 list to all years, so the years compare like for like. The JSON key `by_tier` uses tiers 1–4; `by_subtier` keeps 3.A/3.B and 4.A/4.B.

## 2. Bottom line

All shippers combined (central, EUR bn):

| 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|
| 10.4 | 8.3 | 11.1 | 8.9 | 7.8 | 5.6 |

Russia's CHPL imports fell in 2022, came back in 2023, then slid again. What changed most is **who ships**:
- Before the war, EU states shipped EUR 3.8bn.
- In 2023 the EU shipped EUR 0.08bn, while China and Hong Kong shipped about EUR 8.3bn, three-quarters of the total.

### Top 15 shipping countries, 2022–2026 (Jan–Aug)

Central values in EUR bn. The sum shows the low–high range in brackets.

| # | ISO3 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 J–A | Sum 2022–26 | Change vs 2021 | Certainty |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CHN | 3.31 | 4.03 | 6.12 | 5.16 | 4.67 | 3.56 | **23.55** (18.6-31.8) | +8.09 | B |
| 2 | HKG | 1.23 | 1.28 | 2.21 | 1.42 | 1.58 | 0.97 | **7.46** (2.7-11.3) | +1.71 | C |
| 3 | ARE | 0.06 | 0.19 | 0.49 | 0.44 | 0.44 | 0.28 | **1.83** (1.0-3.6) | +1.53 | C |
| 4 | BLR | 0.14 | 0.29 | 0.28 | 0.30 | 0.31 | 0.24 | **1.43** (0.5-3.2) | +0.78 | D (guess) |
| 5 | IND | 0.05 | 0.07 | 0.22 | 0.67 | 0.26 | 0.17 | **1.39** (1.0-2.4) | +1.14 | B |
| 6 | TUR | 0.03 | 0.30 | 0.70 | 0.21 | 0.10 | 0.06 | **1.36** (0.5-2.0) | +1.22 | C |
| 7 | KAZ | 0.05 | 0.29 | 0.27 | 0.21 | 0.17 | 0.10 | **1.04** (0.9-2.1) | +0.80 | C |
| 8 | MYS | 0.10 | 0.14 | 0.20 | 0.21 | 0.04 | 0.03 | **0.61** (0.5-1.1) | +0.12 | B |
| 9 | THA | 0.01 | 0.01 | 0.11 | 0.11 | 0.10 | 0.07 | **0.41** (0.3-0.7) | +0.35 | B |
| 10 | TWN | 0.34 | 0.19 | 0.12 | 0.04 | 0.02 | 0.01 | **0.38** (0.2-0.7) | -1.20 | D (guess) |
| 11 | DEU | 0.86 | 0.22 | 0.03 | 0.01 | 0.02 | 0.01 | **0.28** (0.3-0.9) | -3.73 | A |
| 12 | KOR | 0.18 | 0.13 | 0.12 | 0.01 | 0.00 | 0.00 | **0.27** (0.3-1.1) | -0.58 | B |
| 13 | ARM | 0.00 | 0.09 | 0.07 | 0.01 | 0.00 | 0.00 | **0.18** (0.2-0.4) | +0.16 | C |
| 14 | ISR | 0.04 | 0.11 | 0.02 | 0.01 | 0.01 | 0.00 | **0.15** (0.1-0.3) | -0.03 | B |
| 15 | NLD | 0.82 | 0.13 | 0.01 | 0.00 | 0.01 | 0.00 | **0.15** (0.1-0.5) | -3.67 | A |

**How "change vs 2021" is defined:** the sum over 2022–2025 of (year − 2021), plus (2026 Jan–Aug − 8/12 of 2021).

Next in the ranking: Kyrgyzstan 0.08, Tajikistan 0.08, France 0.06, Italy 0.05, Japan 0.04, Serbia 0.04, Singapore 0.03 and Uzbekistan 0.02. 63 countries have non-zero values.

### Shape by tier (all shippers, central, EUR bn)

| Tier | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 J–A |
|---|---|---|---|---|---|---|
| 1 chips | 1.17 | 0.82 | 1.13 | 0.59 | 0.58 | 0.36 |
| 2 other electronics | 2.44 | 1.83 | 2.16 | 1.66 | 1.35 | 0.97 |
| 3 parts (3.A + 3.B) | 5.41 | 4.16 | 5.43 | 4.97 | 4.33 | 3.10 |
| 4 machines and tools | 1.38 | 1.45 | 2.41 | 1.68 | 1.55 | 1.15 |

- Tier 4, CNC and semiconductor equipment, is the only tier above its pre-war level. That matches KSE's finding for CNC machines.
- Chips (tier 1) now come mainly through Hong Kong: EUR 0.48bn in 2025, against China's own 0.06bn.

## 3. Method

1. **Own export records.** Each country's exports to Russia of the 50 codes:
   - 27 EU states: Eurostat Comext, annual for 2021–2025 and monthly for January–August 2026.
   - About 40 other reporters: UN Comtrade's public preview API, 2021–2025, with the codes batched into each call. China and Hong Kong for 2023–2025, and Hong Kong's monthly data to July 2026, are reused from the `china_military` run of 17 October.
   - For 2021, I mapped HS2017 codes onto their HS2022 successors:
     - 880330 → 880730
     - 854150 → 854159
     - 852580 → 852589
     - 854890 → 854800
   - 854149 has no clean old equivalent, so it is missing for 2021. It is small.
2. **2021 check.** Russia's own 2021 report of its CHPL imports (EUR 10.58bn) equals the partner sum plus Taiwan (EUR 10.06bn + ~0.5bn). KSE's pre-war figure, USD 1.04bn a month, is consistent. The 2021 central is therefore each country's own figure, with no adjustment.
3. **Calibration to Russian records (2023).** KSE and the Yermak-McFaul group used Russia's transaction-level customs data: USD 8.77bn in January–October 2023, for the 45 codes then listed, broken down by dispatch country. I annualised that (×1.2) and compared it with the partners' own records:

   | Group | Russian records / own records | Used |
   |---|---|---|
   | China | 1.25 | 1.25 |
   | Hong Kong | 2.96 | 2.96 |
   | Türkiye | 2.99 | 2.99 |
   | UAE | 1.59 | 1.59 |
   | Other non-EAEU (India, Malaysia, Thailand, Israel, Serbia, ...) | 2.0 | **1.3**, damped: part of KSE's "other" must be non-reporters |
   | EAEU (Kazakhstan, Kyrgyzstan, Armenia) | n/a: no customs border, so not in Russia's customs data | 1.0 |
   | EU / other coalition | 3.3 / 4.2 on tiny bases | 1.0; the residual is shown separately |

   - 2022 uses the midpoint between the 2021 and 2023 factors. 2024–2026 keep the 2023 factor. That is an **educated guess**, since there is no later Russian record by dispatch country.
   - **Low** = the country's own record (×0.95 for most).
   - **High** = an allowance for under-recording and false codes: Hong Kong and Türkiye ×4, the UAE ×2.5, EAEU ×2, China ×1.6, the EU ×3.3.
4. **2026 (January–August).**
   - The EU and Hong Kong use actual monthly data.
   - All others = 2025 × (the country's Jan–Aug 2026 / 2025 total exports to Russia in `trade_full.json`), with an extra ×0.8–1.25 on the range.
5. **Gap years.** Where a reporter has not yet sent a year to Comtrade (for example, the UAE for 2024–2025 and Uzbekistan for 2025), I took the last reported year × its total-export trend, with the range widened by ×0.7–1.4.

**Why Hong Kong and Türkiye are roughly tripled.** Hong Kong's trade statistics exclude transshipment cargo, and Hong Kong traders sell goods that ship from mainland warehouses. Russian customs still record Hong Kong as the dispatch country. Türkiye and the UAE show the same pattern on a smaller scale. The partner record is therefore a floor.

## 4. Country notes

- **China.**
  - Network gear 851762 (0.63), static converters 850440 (0.56), computers 847150 (0.42), cameras 852589 (0.27) and computer units 847180 (0.25), all in EUR bn reported for 2025. Tier 4 (CNC machines and equipment for making electronics) rose from 0.18 (2021) to about 1.2–1.5 (central).
  - KSE: China supplies 75–85% of Russia's CHPL imports and charges about 300% over world prices, so the value overstates the quantity.
  - In 2021 Russia recorded EUR 5.0bn of China-made CHPL goods, against EUR 3.3bn that China shipped itself. Before the war, a third of Chinese-made goods arrived via third countries.
- **Hong Kong.**
  - Carries the chips: processors 854231 and other ICs 854239.
  - Its own records show a fall since 2021, but Russian records show about 3× more.
  - Range 2.7–11.3 over 2022–2026: the widest of any major country.
  - Jan–Jul 2026 equals Jan–Jul 2025.
- **UAE.**
  - Own records show 0.31 in 2023 (CGCPS: USD 332m). Mostly aircraft and UAV parts 880730 and network gear.
  - 2024–2025 are estimated because the UAE has not reported to Comtrade.
  - CGCPS says UAE flows rose again in 2025, fed by China (China→UAE CHPL goods: USD 2.5bn in 2022, 3bn in 2025). The high case allows for this.
- **Türkiye.**
  - Peaked in 2023 (own records EUR 0.17bn on the 45 codes; FT: USD 158m in Jan–Sep 2023).
  - Fell after the US threatened secondary sanctions on banks (December 2023): EUR 0.21bn central in 2024 and 0.10bn in 2025.
- **India.**
  - 2024 jumps to 0.67, almost all processing units and servers (847150).
  - Also aircraft parts and CNC machines. 2025 is back to 0.26.
  - Treat as real but lumpy.
- **Kazakhstan, Kyrgyzstan, Armenia.**
  - Their own records only (EAEU; no Russian customs check), with the high case doubling them.
  - Kazakhstan's flows are cylindrical bearings and network gear. KSE names Kazakhstan the main EAEU route.
  - Armenia peaked in 2022.
  - Kyrgyzstan's real role sits mostly outside these codes and records: see `residual.json`, and the EU's April 2026 ban on exports of CNC and radio equipment to Kyrgyzstan.
- **Belarus (guess, D).**
  - 2021 own record 0.14 × growth of Belarus's total exports to Russia × 1.2 for re-exports.
  - Belarus's factory output for Russian weapons (optics such as Sosna-U sights) is partly under other codes. See `belarus.json`.
- **Taiwan (guess, D).**
  - Not in Comtrade. 2021: 60% of Russia's recorded Taiwan-origin CHPL imports (0.57).
  - 2023: the unexplained coalition residual in KSE's data (0.17).
  - Then near zero after Taiwan's 2024 machine-tool ban (Taiwan MOEA: USD 45m of machine tools in 2023).
- **EU and coalition states.**
  - Large in 2021 (Germany 0.86, Netherlands 0.82, Poland 0.42, Czechia 0.41), small in 2022, near zero from 2023.
  - Russian records show about EUR 0.17bn a year more "dispatched from EU territory" than EU states report. This is probably transit, postal parcels and licensed goods. It is not allocated to member states.
  - Korea (0.12 in 2023) and Israel (0.11 in 2022) stopped later than others.
- **Vietnam and Malaysia.** Large in 2021, then mostly re-routed via China and Hong Kong. Malaysia's 2022–2024 figures are mostly bearings.

## 5. Brand origin (separate split; `brand_origin` in the JSON)

This answers a different question: whose companies made the goods, whatever the route.
- It is an **overlapping view of the same money**. Never add it to the shipping figures.
- **Anchor**: KSE (Jan 2024), Russian customs data, Jan–Oct 2023. Producer headquarters:
  - US 25.5%, EU 6.1%, Taiwan 7.0%, other coalition 5.4%: coalition 43.9%;
  - China 41.0%, other 7.0%, unknown 8.0%.
- By country of manufacture, China is 63.1% and the coalition 20.9%: Western firms make much of it in China.
- Top brands: Intel, Huawei, Analog Devices, AMD, Texas Instruments, Lenovo, IBM, Dell, Hikvision and STMicro.

Central EUR bn:

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 J–A |
|---|---|---|---|---|---|---|
| Coalition-brand share | 62% | 52% | 48% | 38% | 33% | 33% |
| Coalition-brand value | 6.45 | 4.31 | 5.32 | 3.38 | 2.58 | 1.84 |
| of which US | 2.50 | 2.15 | 3.08 | 1.78 | 1.33 | 0.95 |
| of which Taiwan | 0.62 | 0.58 | 0.85 | 0.53 | 0.39 | 0.28 |
| of which Germany (guess) | 1.12 | 0.45 | 0.33 | 0.24 | 0.21 | 0.15 |
| China brands | 3.12 | 3.31 | 4.97 | 4.81 | 4.61 | 3.29 |

**Certainty:** 2023 is B. All other years are **educated guesses** (C for 2021–2022, D for 2024–2026).
- Evidence for a falling Western share after 2023:
  - China's share of shipments has risen (KSE Q2 2026).
  - The Insider (April 2025) found Western electronics via China down about 17-fold in 2024. Intel goods via third countries fell from USD 235m to USD 7m.
- Against that:
  - Russia has restricted customs data since spring 2024, so part of that fall is invisibility rather than a real cut.
  - KSE still sees Hong Kong carrying likely Western-made chips.
- The splits inside the EU and "other coalition" are guesses: Korea, Japan, Switzerland (KSE files STMicro there) and the UK.

## 6. Things the owner must decide

1. **Which shipping value to show.**
   - Central adjusts toward Russian customs records, which roughly triples Hong Kong and Türkiye.
   - Low is the country's own customs record.
   - Showing "own record" is the most defensible for naming a country. Central is closer to what reached Russia.
   - Suggestion: show the central value, with the low value in the tooltip.
2. **Absolute value or change vs 2021.**
   - The EU and Taiwan had large pre-war sales and now show large negative changes.
   - China, Hong Kong, the UAE, Türkiye, India and Kazakhstan show positive changes.
   - A marker based on change would highlight the new suppliers. One based on level would also flag pre-war sellers.
3. **Whether to show brand origin.** It moves blame toward the US, Taiwan and Germany, but the numbers for 2024–2026 are guesses. If shown, label it "made by companies based in" and keep it off the totals.
4. **Belarus and Taiwan** are guesses (D). Show them with a dashed or hatched marker, or leave them out.
5. **Consistency with `china_military.json`.** That file's "recorded dual-use" for China + Hong Kong (5.8 in 2023) uses own records plus drone codes outside the list. This file gives 8.3 for 2023 (central, calibrated) and 4.9 (own records). Pick one figure for the China tooltip.
6. **Price.** Russia pays China about 300% over world prices for these goods (KSE). Values therefore overstate the quantity of goods, and part of the money is profit for China rather than hardware for Russia.

## 7. Sources

All sources are listed with URLs in `sources` in the JSON:
- BIS CHPL page and the EU CHPL PDF and press release (February 2024);
- UN Comtrade preview API and Eurostat Comext DS-045409;
- KSE "Challenges of Export Controls Enforcement" (January 2024) and the KSE CHP Imports Tracker Q2 2026;
- CGCPS Sanction Evasion Report 2025–2026 (cross-check only; it contains unit errors);
- FT on Türkiye (via Turkish Minute and Kyiv Post);
- the Free Russia Foundation on the UAE;
- The Insider (April 2025);
- B4Ukraine/Corisk/NHC (April 2025);
- Taiwan MOEA on machine tools;
- Follow the Money on Russian customs data;
- RUSI "Silicon Lifeline" (2022; cited from memory).

I found no usable Silverado figures by country of origin; its 2023 work covers chips only.
