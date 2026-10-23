# Realised Russian import prices and windfall (research 2026-10)

Gathered 2026-10-18. The output is `prices.json`. **No person has reviewed it yet.**

## What it is for
The map compares each country's payments to Russia at pre-war prices. Until now each country's price index came from Europe-wide or world benchmarks (`energy2.json` `price_index`) weighted by its import mix. Those benchmark bands are wide; for example, coal in 2022 runs from 2.2x to 4.5x. This file replaces them with **realised import unit values**: what each country actually paid Russia per tonne (or per MWh for gas), from its own customs data, compared with its own 2018-2021 average.

It also adds a **windfall** part, per country and year:

windfall = paid − at_base_prices = paid − volume × the country's 2018-2021 average unit value

This is the extra money Russia received because prices were above the pre-war level.

- **Coverage:** 102 countries and territories with Russian fuel purchases in 2018-2026. That includes all 90 largest importers from Russia, except Iran, Turkmenistan, Peru, Colombia, Gibraltar and Tanzania, which have no usable fuel quantity data.
- **Years:** 2018-2025 calendar years; 2026 = January-August.
- **Units:** levels are EUR/t for crude, oil products, diesel, fuel oil and coal, and EUR/MWh GCV for LNG and pipeline gas. Paid, at-base and windfall values are EUR bn, nominal. USD is converted at ECB annual averages (2018: 1.1810).

## Structure of `prices.json`
Each entry in `countries.<ISO3>` holds:

| Field | Contents |
|---|---|
| `index.<fuel>.<year>` | `{low, central, high}`, price relative to the country's own 2018-2021 average (= 1). Fuels: `crude`, `products`, `diesel` and `fuel_oil` (EU members only, from CN8), `coal`, `lng`, `pipeline_gas`. |
| `index.fossil_all` | Implied fossil index = fossil paid ÷ (the same volumes at base prices). It is volume-weighted, so it moves with the fuel mix. |
| `index.non_fuel_goods` | Non-fuel goods index (see the non-fuel section below). |
| `index.crude_gas_customs_residual` | Türkiye only (see the Türkiye section below). |
| `levels` | Unit values per year, with ranges. |
| `base_2018_2021` | The base value, the base years used and the base error. |
| `basis.<fuel>.<year>` | Which method was used that year. "(no purchases this year: hypothetical price)" marks filled years without purchases. |
| `certainty` | Per fuel: A = at least 90% of 2022-2026 purchases (by value) priced with the country's own customs unit values; B = at least 50%, or a `gas_prices.json` estimate; C = mostly benchmark × ratio. |
| `mix_2018_2021` | Value shares of imports from Russia in 2018-2021 by part, plus `non_fuel_detail` (shares of non-fuel imports). |
| `paid`, `at_base_prices`, `windfall` | `{year: {low, central, high}}`, EUR bn. |
| `windfall_2022_2026` | Sum of the 2022-2026 windfall. Low and high are summed as fully correlated. |
| `windfall_parts.<part>.<year>` | `{low, central, high, paid}`. Parts: crude, products, coal, lng, pipeline_gas, other_fossil, crude_gas_hidden, non_fuel_goods. |
| `sources`, `note` | Sources used, and a short note on data quality. |

The top level also holds:

- **`benchmarks`:** CREA, MinFin, Brent, Newcastle and ULSD levels and indices for 2018-2026; pooled customs unit values; global median customs/benchmark ratios; non-fuel product indices; and the "other goods" index.
- **`band_width_comparison`:** band widths before and after for the 15 biggest buyers.

## Method

### 1. Customs unit values (value ÷ quantity, imports from Russia)
- **EU members.** Source: Eurostat Comext DS-045409, monthly, 2018-01 to 2026-08, EUR and 100 kg.
  - Codes: HS 2709, 2710, 271012, 271019, 2701, 271111 and 271121, plus CN8 for diesel/gasoil (27101943-48) and fuel oil (27101962-68).
  - 2026 is observed, not extrapolated. Comtrade is kept as a second source. Where the two differ by more than the base error, the range widens by half the difference (cap ±15%).
- **Other countries.** Source: UN Comtrade public preview, annual 2018-2025, 99 reporters, CIF values in USD.
  - Monthly Comtrade for January-August 2026 where published: India, Brazil, Japan, Egypt, Indonesia, Malaysia, Georgia, Armenia, Uzbekistan, Kazakhstan, Serbia, Bosnia, North Macedonia, Moldova, Saudi Arabia, Singapore, Thailand, Israel and Argentina.
  - 2026 values from part of the year are scaled to January-August with that destination's CREA monthly tonnage profile.
- **Plausibility checks:**
  - Unit values outside 0.6-1.6× (coal 0.5-2.2×) the matching Russian export benchmark are rejected. In those years the customs *value* is kept and the volume = value ÷ filled price.
  - Comtrade quantities flagged as *estimated* are replaced by CREA tonnes when that moves the unit value much closer to the normal customs/benchmark ratio (8 cases: TWN, EGY, NGA, ISR, LBN, TUN).
  - Estimated quantities that put the unit value more than 25% off the country's own reported-quantity pattern are rejected. Example: China coal 2023, where the customs quantity of 69 Mt is implausibly low against 192 EUR/t.
- **Error per year** (meant as ~90% half-width):
  - Base: ±3% (Comext) or ±4% (Comtrade).
  - Small quantities add +3% (100 kt-1 Mt), +7% (10-100 kt) or +12% (<10 kt).
  - Estimated quantity +3%; quantity replaced by CREA tonnes +4%; 2026 months missing +2%.

### 2. Filling years without usable customs prices (oil and coal)
Level = benchmark × the country's own median customs/benchmark ratio in the same regime (pre-war 2018-2021 or post-war 2022-2026).

**Benchmarks:**
- crude: CREA Urals, or CREA ESPO for Pacific buyers;
- diesel, fuel oil and the oil-product basket: CREA modelled Russian prices;
- coal: CREA, with 2018-2020 from pooled customs.

**Where the country has no customs ratio in that regime:**
- it has a ratio in the other regime: that ratio × the median post/pre shift of all other buyers;
- it has no customs prices at all: the all-buyer pre-war ratio × the median shift.

**Error:** the dispersion of the country's ratios, plus half the gap between independent benchmarks (CREA Urals vs MinFin Urals; CREA diesel vs NY Harbor ULSD), plus, for cross-regime fills, the P10-P90 spread of the shift across buyers. The shift spread is crude ±12%, products ±18%, diesel ±5%, fuel oil ±7% and coal ±20%.

**Key empirical result:** realised import prices rose more than CREA's FOB benchmarks. Customs unit values divided by CREA Urals were 1.03 pre-war and 1.15 post-war (median of buyers; 1.12× shift). Coal moved from 0.91 to 1.08, products from 1.02 to 1.16. CREA-based indices therefore *understate* how much buyers paid relative to pre-war. A main reason is the jump in CIF freight and insurance on longer post-war routes.

### 3. Gas
- **Levels:** `gas_prices.json` (EUR/MWh, 2019-2026) for its 50 countries. Its levels include a ±4% energy-conversion error, which is removed for the index.
- **2018:** own customs 2018/2019 unit-value ratio × the 2019 level, otherwise the pooled Russian-export ratio.
- **Countries outside `gas_prices.json`:** own customs (1 t = 15.2 MWh).
- **Volumes:**
  - transit countries: `energy2.json` final-use bcm (× 10.55 TWh/bcm), minus customs LNG;
  - other countries: customs, otherwise CREA tonnes (pipeline 14.71 MWh/t).
- **Buyers with no purchases before 2022** (Uzbekistan pipeline gas; LNG for Türkiye, Brazil and Italy): base = own post-war price × (European Russian-gas unit value 2019-2021 ÷ the same post-war years), ±20%.

### 4. Index
- Base = mean of the country's 2018-2021 levels in years with purchases. Fuels known only from CREA (which starts in 2021) and hidden in customs use all four years.
- Index error = √(year error² + base error²). The base error is the root-sum-square of the year errors divided by n.
- Index ranges exclude errors that are common to all years, such as the CIF/FOB definition and energy conversion, because they cancel.

### 5. Windfall
- **Per fuel and year:** W = paid − V × base. The error is √((W·e_V)² + (V·P·e_P)² + (V·base·e_base)²).
- **Paid and volume:**
  - customs value and quantity where available;
  - otherwise CREA tonnes × filled price;
  - non-reporting years: the last customs volume carried forward (±18-35%), but only if the reporter did not keep reporting without that fuel. Used for Belarus 2022-2026, Uzbekistan 2025-26, the UAE 2024-25 and some small reporters.
- **Other fossil** (customs HS 27 minus the four fuels: coke, petcoke, bitumen, electricity): products index, +10% error.
- **Non-fuel goods:** paid = total imports from Russia (`trade_full.json`; 2018 from Comtrade TOTAL) minus customs HS 27. Windfall = paid × (1 − 1/index).
  - 2026, and any year where an estimated fuel value would leave non-fuel below half of the previous year: the previous year × 8/12, ±30%. This applies to India 2026.
- **Country totals:** the parts are added in quadrature for each year.

### 6. Non-fuel goods index (new)
**Product indices** cover nitrogen, potash and mixed fertilisers, iron and steel (HS 72), aluminium (7601), nickel (7502), copper (74), PGMs (7110), gold (7108), iron ore, wheat, barley, maize, rapeseed, sunflower oil, sawnwood and logs, pulp, fish and uranium/radioactive (2844).
- **Method:** a matched panel of all reporters' customs unit values from Russia. Each country's UV relative to its own 2018-2021 mean, weighted by base-period value.
- **Error:** the weighted dispersion across reporters, plus 2%.
- **Years without a customs panel:** previous year × world price change. Sources: IMF/FRED commodity prices, US PPI for fertilisers, and the NBP gold fixing in EUR for gold (±4%).

**Country index:**
- Weights = the country's 2018-2021 non-fuel imports from Russia by product.
- The country's own relative is used where the product is large (base ≥ EUR 200 m and the year ≥ EUR 50 m) and within 0.5-2× of the panel.
- The uncovered share ("other goods", e.g. machinery and chemicals) follows the euro-area industrial import price index excluding energy (`energy2.json` `non_fuel_goods`; 2018 set to 0.98 ± 0.02), +3% for mix difference.

**Notable product movements (central, vs 2018-2021):**
- Nitrogen fertiliser 2.48 (2022), 1.73 (2026).
- Gold 2.86 (2026); PGMs 0.65-0.78 (2024-26).
- Aluminium 1.58 and copper 1.89 (2026).
- Wheat 1.71 (2022), 1.25 (2026); logs below 1 throughout.

### 7. Türkiye (special case)
Türkiye's customs hide the partner for crude and natural gas, but HS 27 from Russia is reported.

- **Paid** = customs HS 27 from Russia minus visible codes (2701, 2710, 2711): EUR 29 bn in 2022. Volumes come from CREA (crude) and energy2 (gas).
- **Same volumes at base prices** = (volumes × 2018-2021 levels) × 0.80. The 0.80 is the 2021 ratio of the customs residual to the modelled value.
- **2026** = modelled value × the 2025 ratio (1.18).
- **Result:** implied crude+gas index of **3.3 in 2022** (1.6-1.8 in 2023-26). That is far above the oil-formula gas price in `gas_prices.json` (1.75). It is consistent with reports that BOTAŞ paid very high Gazprom prices in 2022, and the residual also contains LPG and other hidden HS 27 items.
- **Ranges:** ±5% on the customs residual and ±15% on the base.

## Band width before vs after (15 biggest buyers)
Width = (high − low) ÷ central of the country's composite price index, using the same `energy2.json` 2019-2021 fuel-mix weights. Before = `energy2.json` benchmark indices; after = this file. Where this file has no index for a part, energy2's is used.

| Country | 2022 before | 2022 after | mean 2022-26 before | mean 2022-26 after | coal 2022 before/after | crude 2022 before/after |
|---|---|---|---|---|---|---|
| CHN | 38% | 9% | 26% | 11% | 106% / 9% | 38% / 9% |
| IND | 40% | 11% | 23% | 10% | 106% / 9% | 38% / 9% |
| TUR | 41% | 21% | 25% | 22% | 106% / 9% | 38% / 32% |
| BLR | 28% | 14% | 18% | 14% | 106% / 30% | 38% / 12% |
| KAZ | 18% | 17% | 11% | 14% | 106% / 33% | 38% / 17% |
| BRA | 29% | 7% | 14% | 9% | 106% / 9% | 38% / 24% |
| DEU | 45% | 36% | 30% | 26% | 106% / 7% | 38% / 7% |
| ITA | 45% | 14% | 30% | 18% | 106% / 30% | 38% / 28% |
| KOR | 52% | 10% | 31% | 17% | 106% / 9% | 38% / 9% |
| JPN | 50% | 10% | 29% | 14% | 106% / 9% | 38% / 9% |
| NLD | 44% | 23% | 31% | 16% | 106% / 10% | 38% / 10% |
| FRA | 44% | 25% | 30% | 22% | 106% / 8% | 38% / 7% |
| HKG | 23% | 10% | 12% | 10% | 106% / 15% | - |
| ARE | 15% | 13% | 9% | 12% | 106% / 16% | 38% / 18% |
| UZB | 16% | 12% | 10% | 12% | - | 38% / 26% |

Where own customs exist, single-fuel bands shrink to 7-10% (coal 2022: 106% → about 9%). The composites narrow less in three situations:
- **Germany, France, Netherlands, Türkiye and Kazakhstan:** gas dominates, and `gas_prices.json` gas bands stay wide (Germany 2022 pipeline gas 3.3-5.9×; customs are confidential).
- **Kazakhstan, the UAE and Uzbekistan:** mostly "other goods" with a ±9-12% band.
- **Türkiye:** the crude+gas residual carries ±16%.

## Windfall 2022-2026 (top 20, EUR bn)
| # | Country | Windfall 2022-2026 (low - **central** - high) | of which fossil | of which non-fuel | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|---|---|---|
| 1 | China (CHN) | 124.4 - **142.3** - 160.2 | 109.8 | 32.4 | 42.2 | 32.6 | 29.3 | 16.4 | 21.8 |
| 2 | Türkiye (TUR) | 61.3 - **71.1** - 80.9 | 59.7 | 11.4 | 30.8 | 12.4 | 11.8 | 8.2 | 7.9 |
| 3 | India (IND) | 50.2 - **60.5** - 70.8 | 53.8 | 6.7 | 14.1 | 12.6 | 13.3 | 6.0 | 14.5 |
| 4 | Germany (DEU) | 23.9 - **31.1** - 38.3 | 28.2 | 2.9 | 29.6 | 0.9 | 0.3 | 0.2 | 0.2 |
| 5 | Italy (ITA) | 17.1 - **19.5** - 21.9 | 17.9 | 1.6 | 17.0 | 1.2 | 0.9 | 0.2 | 0.2 |
| 6 | Hungary (HUN) | 14.8 - **16.8** - 18.8 | 16.6 | 0.2 | 10.6 | 2.4 | 1.2 | 1.4 | 1.2 |
| 7 | France (FRA) | 12.1 - **16.2** - 20.3 | 15.0 | 1.2 | 14.6 | 0.9 | 0.2 | 0.3 | 0.3 |
| 8 | Belarus (BLR) | 10.0 - **15.5** - 20.9 | 4.4 | 11.1 | 4.6 | 2.9 | 3.2 | 2.2 | 2.5 |
| 9 | Kazakhstan (KAZ) | 10.9 - **14.8** - 18.7 | 3.5 | 11.3 | 3.5 | 2.4 | 3.2 | 3.4 | 2.3 |
| 10 | Brazil (BRA) | 12.0 - **14.1** - 16.3 | 7.4 | 6.8 | 4.3 | 2.9 | 2.6 | 1.7 | 2.6 |
| 11 | Netherlands (NLD) | 11.7 - **13.2** - 14.7 | 12.0 | 1.2 | 10.6 | 2.1 | 0.3 | 0.2 | 0.0 |
| 12 | Rep. of Korea (KOR) | 9.1 - **10.9** - 12.6 | 8.7 | 2.1 | 6.0 | 2.5 | 0.9 | 0.6 | 0.9 |
| 13 | Japan (JPN) | 9.1 - **10.5** - 11.8 | 8.8 | 1.7 | 6.1 | 2.0 | 1.1 | 0.8 | 0.5 |
| 14 | Slovakia (SVK) | 6.5 - **9.5** - 12.5 | 9.3 | 0.2 | 5.2 | 1.5 | 1.3 | 0.8 | 0.7 |
| 15 | Belgium (BEL) | 8.1 - **9.1** - 10.1 | 7.9 | 1.1 | 5.7 | 1.3 | 0.5 | 0.9 | 0.7 |
| 16 | Spain (ESP) | 7.4 - **8.3** - 9.1 | 7.7 | 0.5 | 4.6 | 1.3 | 1.0 | 0.6 | 0.7 |
| 17 | Austria (AUT) | 5.6 - **8.0** - 10.5 | 7.9 | 0.2 | 5.7 | 1.4 | 0.9 | 0.0 | 0.0 |
| 18 | Czechia (CZE) | 6.7 - **7.7** - 8.7 | 7.1 | 0.6 | 6.0 | 0.6 | 0.9 | 0.2 | 0.0 |
| 19 | Poland (POL) | 5.2 - **6.7** - 8.2 | 4.8 | 1.9 | 6.0 | 0.2 | 0.1 | 0.2 | 0.1 |
| 20 | USA (USA) | 4.7 - **6.3** - 7.9 | 2.0 | 4.3 | 4.8 | 0.7 | 0.2 | 0.3 | 0.3 |

**All 102 countries, 2022-2026:** EUR 601 bn (486-716).
- By part: crude 142, pipeline gas 104, products 77, coal 46, Türkiye crude+gas 41, LNG 34, other fossil 9, non-fuel goods 148.
- By year: 2022 EUR 276 bn, 2023 109, 2024 91, 2025 54, 2026 (Jan-Aug) 71.
- **Base-period check:** the 2018-2021 windfall sums to about +9 bn (2020: −66 bn). That is close to zero, as it should be by construction.

## Checks
- **Realised levels vs benchmarks:**
  - India's crude unit value is 1.59× its base in 2022 and 1.10× in 2025.
  - The 2026 monthly Comtrade data show Russian crude landing in India at $112-123/bbl in April-June 2026, above Brent during the March-May price spike. The 2026 index for India is therefore 1.49.
  - China crude: 1.60 (2022) and 1.07 (2025).
- **Coal 2022 (central, against each buyer's own base):** CHN 2.10, IND 2.15, KOR 2.35, TUR 2.29, JPN 2.94, DEU 3.15. These replace the old 2.2-4.5× benchmark band.
- **Pipeline gas 2022:** HUN 7.0, ITA 4.8 and SVK 4.7 (Comext, A). China 1.7 and Belarus 1.1 (contract prices).
- **Pooled customs crude price** (all reporters, EUR/t): 434 (2018), 427 (2021), 616 (2022), 527 (2023), 439 (2025). CREA Urals: 425, 418, 531, 403, 350.

## Weakest data
1. **Türkiye crude and gas.** The partner is hidden. Paid is a customs residual, which is good, but at-base prices rest on CREA crude and energy2 gas volumes and a single calibration year (2021, factor 0.80, ±15%). The 2022 index of 3.3 conflicts with `gas_prices.json` and needs review.
2. **Belarus.** There is no customs since 2021 (crude since 2020). Crude, products and coal volumes are carried forward (±30-35%), and the crude price is benchmark-only (C). Belarus pays a Russian domestic-linked price, which a Urals benchmark only approximates. Non-fuel goods (EUR 11 bn of its windfall) rest on the euro-area "other goods" index.
3. **Pipeline gas in Germany, France, the Netherlands, Austria and Kazakhstan.** These levels are taken unchanged from `gas_prices.json` (peer and model prices, ±25-30% in 2022). Kazakhstan's swap prices (2-8 EUR/MWh) make its index erratic.
4. **China 2026.** Comtrade has no Chinese monthly data and GACS was not queried. The 2026 levels are 2025 customs ratios × CREA prices, and volumes are CREA (±8-20%).
5. **UAE, Vietnam, Mongolia, Egypt and Saudi Arabia.** Reporting gaps in 2024-25 or estimated quantities mean much of their crude and products is grade C.
6. **Non-fuel "other goods"** (25-80% of non-fuel imports for many countries). These follow the euro-area import price index excluding energy, not Russian prices. Kazakhstan's and Belarus's windfalls are mostly this.
7. **Non-fuel products after reporters dropped out** (gold 2023+, barley, rapeseed, sawnwood, pulp 2023+). These are world prices chained from the last customs year, ±20-35%.
8. **Diesel and fuel oil.** These are split only for EU members (CN8). Elsewhere `products` (HS 2710) mixes naphtha, diesel and fuel oil, so a change in composition moves the unit value.
9. **National statistics for China, India and Türkiye** were not queried directly. The Comtrade records are those countries' own customs reports. CREA/Argus discount reporting enters only through CREA prices.
10. **EU "Russian-origin" crude after the embargo** (Netherlands, Germany 2023-26). This is small and probably CPC/Kazakh blend recorded as Russian. It is kept as reported.

## Files
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
