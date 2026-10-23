# Energy gaps: switching cost, oil discount gain, laundered oil (research 2026-10)

Gathered 2026-10-17. Output: `energy.json` (231 countries, the same list as the "Energy switching cost" section of `gaps-input.json`). Values in EUR bn, low / central / high (meant as ~90% intervals), years 2022-2025 plus 2026 Jan-Aug.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What replaces what
`pipeline/build_data.py` modelled the switching cost as 25% of the value of Russian fuel no longer bought (`ENERGY_PREMIUM_SHARE`). It also spread the published discount and laundered-oil totals over years with fixed weights. This file replaces all three with volume x price-gap estimates for every country.

## Data
- **CREA Russia Fossil Tracker API**: monthly tonnes, EUR and USD by destination (130 destinations) and commodity, Jan 2021-Aug 2026 (`/v0/counter`), plus daily modelled Russian export prices (`/v0/price`). CREA fits Russian prices to Eurostat/Comtrade import unit values, so its gas price is a realised contract price, not TTF. Pipeline gas tonnes use density 0.717 kg/m3 (CREA methodology).
- **Benchmarks (FRED)**: Brent daily (EIA DCOILBRENTEU), NY Harbor ULSD daily (DDFUELNYH), and from the IMF monthly series TTF (PNGASEUUSDM), Japan LNG (PNGASJPUSDM) and Newcastle coal (PCOALAUUSDM). The IMF series end in July 2026, so August = July.
- **Eurostat** nrg_ti_gas / nrg_ti_sff / nrg_ti_oil (EU27 imports from RU and TOTAL, 2021-2024): replacement shares.
- **UN Comtrade** (public preview):
  - HS 27/2701/2709/2710/2711 imports from Russia, all reporters, 2021-2025.
  - Russia-reported 2021 exports by partner (mirror).
  - HS 2710 exports by partner of India, Turkey, China and the UAE (UAE only for 2022-23).
  - HS 2709 imports of India and China.
- **Calibration**:
  - Oil discount: ICRA (India), Banque de France (China), Reuters (Turkey).
  - Laundered oil: CREA refining-loophole reports for G7+ (8.5 / 9.0 / 7.2 EUR bn), CREA per-country windows (USA, GBR, FRA, ITA, NLD, AUS), and CREA via Novaya Gazeta (EU Jan-May 2026 EUR 0.929 bn).
  - Turkey crude total of 31 Mt in 2023: EPDK via Trend.
  - Uniper FY2022 results, as a cross-check.

## Method (short)
1. **Switching cost** = displaced volume x replacement share x per-tonne premium, by fuel.
   - *Displaced volume* is the volume bought in 2021 minus the volume bought in the year, counted only when positive.
   - *Replacement share* comes from Eurostat EU27: the rise in non-Russian imports divided by the fall in Russian imports.
     - Gas: 1.0 in 2022 (capped), 0.885 in 2023, 0.635 in 2024 onward.
     - Coal: 1.0, then 0.758, then 0.257.
     - Oil: 1.0 throughout.
     - The low case is lower (0.75x for gas, 0.5x for coal, 0.9 for oil). The high case is 1.0, which values demand reduction at the same premium as replaced volumes.
   - *Per-tonne premium*:
     - Crude and coal:
       - Low: the pre-war structural gap, (1 - k) x benchmark, where k is the Russian/benchmark price ratio in 2021 (0.948 for crude, 0.934 for coal).
       - High: the benchmark minus the actual Russian realised price, i.e. the full discount forgone.
       - Central: the midpoint.
     - Products: low is the same as crude; high uses the Russian 2021 product basket scaled with ULSD.
     - Gas and LNG:
       - Central and high: TTF minus the Russian realised contract price.
       - Low: Japan oil-indexed LNG minus the Russian price.
   - For the 130 CREA destinations, each month's premium is weighted by how much was displaced that month. This catches the mid-2022 gas cut-off, which happened at peak TTF.
2. **Oil discount gain**:
   - The gross FOB discount is crude tonnes x (Brent - CREA realised price for that destination) plus products tonnes x (ULSD-scaled 2021 relation - realised price), counted monthly from March 2022.
   - Published estimates come out at 0.49-0.84 of this gross figure. They are net of freight and compare with other suppliers' delivered prices.
   - Central = gross x 0.671 (the median of five published windows), low x 0.493, high = full gross.
3. **Laundered oil**:
   - Model: each refiner country's (IN, TR, CN, AE) HS 2710 exports to the destination x the Russian share of that refiner's crude.
     - India 15% in 2022, 38% in 2023-24, 34% in 2025.
     - China 17-20%.
     - Turkey 35-54%.
     - UAE: Russian products imported / UAE product exports.
   - The model is 1.5-1.9x CREA's G7+ figures, because CREA counts only named refineries. Central = model x 0.699, low x 0.53, high x 1.0.
   - Where CREA published a country value, the central is averaged with that value.
   - 2026 = 2025 x 8/12 x ULSD ratio x the refiners' Russian-intake ratio. EU members also get a ban factor of 0.332, calibrated to Jan-May 2026 (EUR 0.929 bn).
4. **Countries not in CREA**:
   - Volumes come from Comtrade importer net weights, falling back to value / CREA price, and to the Russia-reported 2021 mirror.
   - Missing years carry the last observed year. HS 2711 is treated as LPG.
   - The same per-tonne premiums and the global average discount are applied, with wider ranges (D).
   - Countries with no fossil trade with Russia at all get zero, with a small high bound on `fossil_from_russia`.

### Switching cost: top 15, EUR bn (central, low-high in brackets)

| country | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug | total (low-high) |
|---|---|---|---|---|---|---|
| DEU Germany | 15.21 | 5.73 | 3.30 | 4.61 | 5.62 | 34.5 (17.3-48.7) |
| ITA Italy | 9.01 | 2.80 | 1.46 | 2.37 | 2.90 | 18.5 (9.3-25.6) |
| NLD Netherlands | 2.10 | 2.91 | 1.94 | 1.57 | 2.79 | 11.3 (4.0-19.6) |
| USA United States | 2.22 | 1.59 | 1.02 | 1.01 | 1.99 | 7.8 (3.0-13.2) |
| POL Poland | 0.95 | 1.40 | 1.04 | 0.81 | 1.25 | 5.5 (1.9-9.6) |
| KOR South Korea | 1.65 | 1.07 | 0.72 | 0.59 | 1.15 | 5.2 (2.0-8.4) |
| FRA France | 1.73 | 0.99 | 0.55 | 0.68 | 1.08 | 5.0 (2.3-7.6) |
| GBR United Kingdom | 1.93 | 0.72 | 0.42 | 0.51 | 0.81 | 4.4 (2.0-6.6) |
| TUR Turkey | 2.22 | 0.55 | 0.14 | 0.41 | 0.74 | 4.1 (2.1-5.4) |
| FIN Finland | 1.22 | 0.73 | 0.47 | 0.45 | 0.60 | 3.5 (1.5-5.4) |
| ROU Romania | 0.80 | 0.69 | 0.48 | 0.43 | 0.71 | 3.1 (1.3-4.9) |
| CZE Czechia | 1.56 | 0.31 | 0.09 | 0.46 | 0.60 | 3.0 (1.5-4.1) |
| JPN Japan | 1.18 | 0.63 | 0.36 | 0.23 | 0.46 | 2.9 (0.8-5.6) |
| ESP Spain | 0.72 | 0.60 | 0.36 | 0.37 | 0.68 | 2.7 (1.0-4.7) |
| GRC Greece | 0.84 | 0.51 | 0.32 | 0.36 | 0.57 | 2.6 (1.1-4.0) |

### Oil discount gain: top 15, EUR bn (central, low-high in brackets)

| country | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug | total (low-high) |
|---|---|---|---|---|---|---|
| IND India | 4.34 | 9.71 | 6.77 | 4.57 | 8.40 | 33.8 (24.8-50.4) |
| CHN China | 7.00 | 6.30 | 3.77 | 1.90 | 5.96 | 24.9 (18.3-37.1) |
| TUR Turkey | 2.20 | 1.84 | 0.47 | 1.20 | 2.00 | 7.7 (5.7-11.5) |
| BLR Belarus | 1.34 | 1.22 | 0.88 | 0.55 | 1.01 | 5.0 (2.2-9.7) |
| NLD Netherlands | 2.12 | 0.07 | 0.00 | 0.00 | 0.00 | 2.2 (1.6-3.3) |
| DEU Germany | 1.80 | 0.09 | 0.00 | 0.00 | 0.00 | 1.9 (1.4-2.8) |
| SAU Saudi Arabia | 0.21 | 0.00 | 0.02 | 0.44 | 1.18 | 1.8 (1.4-2.7) |
| ITA Italy | 1.78 | 0.02 | 0.00 | 0.00 | 0.00 | 1.8 (1.3-2.7) |
| POL Poland | 1.28 | 0.10 | 0.00 | 0.00 | 0.00 | 1.4 (1.0-2.1) |
| BGR Bulgaria | 0.72 | 0.61 | 0.00 | 0.00 | 0.00 | 1.3 (1.0-2.0) |
| HUN Hungary | 0.41 | 0.25 | 0.24 | 0.11 | 0.03 | 1.0 (0.8-1.5) |
| SVK Slovakia | 0.40 | 0.25 | 0.20 | 0.12 | 0.05 | 1.0 (0.8-1.5) |
| KOR South Korea | 0.56 | 0.08 | 0.13 | 0.13 | 0.09 | 1.0 (0.7-1.5) |
| GRC Greece | 0.82 | 0.10 | 0.00 | 0.00 | 0.01 | 0.9 (0.7-1.4) |
| BRA Brazil | 0.15 | 0.11 | 0.00 | 0.00 | 0.67 | 0.9 (0.7-1.4) |

### Laundered oil: top 15, EUR bn (central, low-high in brackets)

| country | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug | total (low-high) |
|---|---|---|---|---|---|---|
| SGP Singapore | 1.46 | 2.60 | 2.84 | 1.62 | 1.74 | 10.3 (7.4-15.2) |
| NLD Netherlands | 1.36 | 2.63 | 2.94 | 2.43 | 0.86 | 10.2 (5.9-19.9) |
| ARE United Arab Emirates | 0.75 | 1.69 | 1.95 | 1.34 | 1.44 | 7.2 (5.1-10.7) |
| USA United States | 0.62 | 1.58 | 1.48 | 0.95 | 1.13 | 5.7 (4.3-8.9) |
| HKG Hong Kong | 0.72 | 0.91 | 1.04 | 0.83 | 0.94 | 4.4 (3.2-6.6) |
| AUS Australia | 0.52 | 0.96 | 1.06 | 0.68 | 0.99 | 4.2 (3.1-6.9) |
| ZAF South Africa | 0.62 | 0.96 | 0.90 | 0.43 | 0.47 | 3.4 (2.5-5.0) |
| TZA Tanzania | 0.23 | 0.56 | 0.76 | 0.57 | 0.62 | 2.7 (1.9-4.1) |
| TGO Togo | 0.45 | 0.82 | 0.51 | 0.39 | 0.43 | 2.6 (1.9-3.8) |
| MYS Malaysia | 0.30 | 0.55 | 0.80 | 0.42 | 0.46 | 2.5 (1.8-3.8) |
| GBR United Kingdom | 0.14 | 0.54 | 0.62 | 0.61 | 0.48 | 2.4 (1.6-3.6) |
| BGD Bangladesh | 0.33 | 0.53 | 0.50 | 0.29 | 0.32 | 2.0 (1.4-2.9) |
| CHN China | 0.22 | 0.33 | 0.33 | 0.51 | 0.55 | 1.9 (1.3-2.9) |
| KOR South Korea | 0.31 | 0.54 | 0.42 | 0.29 | 0.32 | 1.9 (1.4-2.8) |
| OMN Oman | 0.22 | 0.47 | 0.34 | 0.42 | 0.45 | 1.9 (1.3-2.8) |

### Prices (annual means, USD)

| year | Brent $/bbl | Russian crude $/bbl (CREA) | spread | TTF $/MMBtu | Russian pipeline $/MMBtu | Japan LNG | Newcastle coal $/t | Russian coal $/t |
|---|---|---|---|---|---|---|---|---|
| 2021 | 70.68 | 67.02 | 3.66 | 15.91 | 11.89 | 18.6 | 144.0 | 134.5 |
| 2022 | 100.78 | 81.33 | 19.45 | 37.52 | 22.5 | 33.3 | 384.2 | 215.8 |
| 2023 | 82.47 | 65.28 | 17.19 | 12.88 | 10.05 | 13.46 | 188.2 | 144.7 |
| 2024 | 80.53 | 68.25 | 12.27 | 10.89 | 9.06 | 11.71 | 143.6 | 121.8 |
| 2025 | 69.1 | 61.0 | 8.11 | 11.91 | 7.95 | 12.09 | 112.4 | 117.5 |
| 2026 | 90.66 | 68.4 | 22.26 | 15.42 | 8.78 | 16.62 | 136.6 | 129.2 |

## Totals, 2022 to Aug 2026, all countries (EUR bn)
- Switching cost: central 133 (59-205). Gas importers in 2022 dominate (Germany 15.2, Italy 9.0).
- Oil discount gain: central 101 (72-154). India 34, China 25, Turkey 8, Belarus 5 (D).
- Laundered oil: central 104 (74-161), summed over importers. Hubs (NLD, SGP, ARE, HKG) overlap with their customers, so **do not use the sum as a global total**. CREA's G7+ figures (about 7-9 per year) are the better aggregate.

## Caveats
- **Switching counterfactual.** The "Russian price" is ambiguous for oil. The discount exists partly because the coalition stopped buying, so the high case (full discount forgone) overstates the true counterfactual, while the low case (pre-war differential) understates freight and market tightness. Central = midpoint.
- **Gas.** TTF minus the Russian contract price is the main driver. Uniper alone booked EUR 13.2 bn of realised replacement cost in 2022, which suggests the German 2022 central (15.2) is, if anything, low.
- **Not counted.** Infrastructure capex (FSRUs) and household and industry support are not included.
- **Transit attribution.** CREA's ENTSOG-based attribution assigns transit gas to DEU, SVK, AUT, HUN and TUR. Austria shows almost no 2022 switching cost because its attributed Russian volume rose in 2022.
- **Comtrade gaps.** Coverage thins out in 2024-25 because many reporters are not yet in. Carried-forward years widen the ranges, and fossil_from_russia certainty is C or D there.
- **Belarus.** No reporting. The 2021 crude level (15.6 Mt) is assumed to continue, and Russian gas to Belarus is confidential and missing.
- **2026.** Includes the Hormuz-crisis price spike (Brent above USD 100 from March to May 2026). It also includes the EU ban on refined products made from Russian crude, which is handled with a calibrated factor (wide range).
- **Turkey.** Its crude share uses a constant 31 Mt total. Comtrade does not publish Turkey's crude imports by partner.
