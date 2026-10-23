# Round 4a: company tax split and 2018-2020 history, China's refining of Russian crude, EU refiners, pre-war laundered oil

Gathered 2026-10-18. Output: `round4a.json`. **No person has reviewed it yet.**
Values are in EUR bn, nominal, converted at ECB annual average rates. Ranges are low / central / high, meant as ~90% intervals.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## 1. Taxes paid in Russia by foreign companies

### (a) Profit tax and other taxes, 2021-2025 (`taxes.split`)
- **Profit tax** is taken unchanged from `companies_all.json`.
- **Other taxes** (VAT, excise, payroll, property, customs, exit taxes) = all taxes minus profit tax.
- The range for other taxes combines the all-tax and profit-tax ranges. It assumes a correlation of 0.6, because the all-tax estimate is half built on profit-tax shares. The range is log-normal and at least ±10%.
- All 113 home countries with non-zero taxes are given, the same scope as `companies_all.json` (still foreign-owned).

**Totals and the owner's measure (profit tax + half of other taxes)** (`taxes.split_totals`):

| | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Profit tax | 4.57 | 5.67 | 5.20 | 4.31 | 3.47 |
| Other taxes | 17.3 (15.4-19.2) | 12.4 (9.5-15.2) | 12.2 (10.2-14.3) | 11.5 (9.4-13.5) | 10.0 (8.0-12.0) |
| **Owner measure** | **13.2 (11.9-14.6)** | **11.9 (9.8-13.9)** | **11.3 (9.7-13.0)** | **10.0 (8.5-11.6)** | **8.5 (6.9-10.1)** |
| Owner measure / all taxes | 0.60 | 0.66 | 0.65 | 0.64 | 0.63 |

**Top 25 home countries, profit tax / other taxes (central):**

| country | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| USA | 1.01 / 3.60 | 1.28 / 2.62 | 1.21 / 2.60 | 0.92 / 2.30 | 0.74 / 2.02 |
| DEU | 0.83 / 2.97 | 0.82 / 1.70 | 0.69 / 1.51 | 0.45 / 1.13 | 0.36 / 0.99 |
| FRA | 0.45 / 1.73 | 0.39 / 1.27 | 0.39 / 1.16 | 0.42 / 1.17 | 0.33 / 1.02 |
| GBR | 0.29 / 1.13 | 0.38 / 0.78 | 0.20 / 0.51 | 0.15 / 0.43 | 0.11 / 0.33 |
| JPN | 0.28 / 1.10 | 0.30 / 0.56 | 0.16 / 0.32 | 0.10 / 0.27 | 0.08 / 0.25 |
| CHE | 0.24 / 1.04 | 0.39 / 0.85 | 0.31 / 0.95 | 0.27 / 0.90 | 0.22 / 0.80 |
| KOR | 0.18 / 0.88 | 0.18 / 0.41 | 0.10 / 0.21 | 0.11 / 0.23 | 0.09 / 0.21 |
| SWE | 0.21 / 0.75 | 0.15 / 0.32 | 0.08 / 0.16 | 0.04 / 0.11 | 0.03 / 0.08 |
| NLD | 0.18 / 0.65 | 0.24 / 0.55 | 0.17 / 0.43 | 0.11 / 0.34 | 0.08 / 0.26 |
| ITA | 0.15 / 0.49 | 0.23 / 0.41 | 0.26 / 0.46 | 0.25 / 0.48 | 0.21 / 0.44 |
| AUT | 0.12 / 0.35 | 0.34 / 0.42 | 0.54 / 0.66 | 0.44 / 0.65 | 0.37 / 0.60 |
| CHN | 0.06 / 0.38 | 0.27 / 0.65 | 0.45 / 1.51 | 0.48 / 1.57 | 0.40 / 1.44 |
| FIN | 0.06 / 0.32 | 0.05 / 0.17 | 0.02 / 0.09 | 0.08 / 0.17 | 0.06 / 0.14 |
| TUR | 0.07 / 0.27 | 0.11 / 0.27 | 0.13 / 0.35 | 0.09 / 0.30 | 0.07 / 0.26 |
| POL | 0.06 / 0.25 | 0.06 / 0.16 | 0.03 / 0.08 | 0.01 / 0.04 | 0.01 / 0.03 |
| DNK | 0.07 / 0.24 | 0.08 / 0.16 | 0.06 / 0.13 | 0.03 / 0.09 | 0.02 / 0.07 |
| GRC | 0.04 / 0.14 | 0.05 / 0.14 | 0.05 / 0.15 | 0.04 / 0.15 | 0.04 / 0.14 |
| NOR | 0.02 / 0.10 | 0.02 / 0.06 | 0.01 / 0.04 | 0.01 / 0.05 | 0.01 / 0.02 |
| IRL | 0.02 / 0.08 | 0.02 / 0.05 | 0.01 / 0.04 | 0.00 / 0.01 | 0.00 / 0.01 |
| ESP | 0.02 / 0.07 | 0.02 / 0.05 | 0.01 / 0.04 | 0.00 / 0.01 | 0.00 / 0.01 |
| CAN | 0.02 / 0.07 | 0.02 / 0.05 | 0.01 / 0.04 | 0.01 / 0.04 | 0.01 / 0.03 |
| ZAF | 0.02 / 0.07 | 0.02 / 0.06 | 0.02 / 0.06 | 0.02 / 0.08 | 0.02 / 0.07 |
| CZE | 0.01 / 0.05 | 0.01 / 0.03 | 0.01 / 0.02 | 0.00 / 0.01 | 0.00 / 0.01 |
| BEL | 0.01 / 0.04 | 0.01 / 0.03 | 0.01 / 0.02 | 0.00 / 0.01 | 0.00 / 0.01 |
| BLR | 0.01 / 0.04 | 0.02 / 0.05 | 0.02 / 0.06 | 0.02 / 0.08 | 0.02 / 0.07 |

**Cross-check with FDI income** (`taxes.fdi_income_check`):
- Source: the Bank of Russia's direct investment income payable, which is after tax.
- Grossing it up at 20% (25% in 2025) implies profit tax from foreign direct investors of EUR 20.2bn (2021), 13.1, 8.7, 6.0 and 5.3bn (2022-2025).
- KSE in-scope profit tax as a share of that:
  - 23% in 2021. The rest is round-trip capital through Cyprus and similar places, plus resource joint ventures.
  - 43-72% in 2022-2025.
- KSE never exceeds the FDI-implied amount, so the two sources agree.
- FDI income cannot be split by home country. The Bank of Russia stopped publishing country data in 2022, and data by immediate investor are dominated by conduits.

### (b) 2018-2020 history (`taxes.history_2018_2020`, split in `history_2018_2020_split`)
**There is no tax series by home country before 2021.**
- KSE and B4Ukraine start in 2021, and KSE's tax base is 2021 company accounts.
- Rosstat publishes no FDI income by investor country.

Each country's 2021 profit tax and other taxes are therefore carried back with indices in nominal EUR (2021 = 1):

| index | 2018 | 2019 | 2020 |
|---|---|---|---|
| Direct investment income payable (Bank of Russia) | 0.62 | 0.78 | 0.58 |
| Russian GDP in EUR (World Bank, ECB) | 0.91 | 0.98 | 0.85 |
| **Profit tax** = geometric mean (low: income ×0.9; high: GDP ×1.1) | 0.75 (0.56-1.00) | 0.88 (0.71-1.08) | 0.70 (0.52-0.93) |
| **Other taxes** = GDP ratio (turnover and payroll based) | 0.91 (0.82-0.98) | 0.98 (0.88-1.06) | 0.85 (0.76-0.91) |

- **Country factor.** Each country moves by half of how its IMF DIP inward position changed relative to all countries. Both the Russia-reported and the counterpart series are used, and the factor is capped at 0.75-1.33. Examples for 2018: Japan 0.75, Turkey 0.84, China 0.89, Italy 1.04.
- Conduit jurisdictions (CYP, LUX, NLD, IRL, CHE, HKG, SGP and similar) use the global index only.
- Ranges combine the 2021 range, the index range and the country factor (log-normal).

**Totals, all taxes (sums of country centrals):**
- 2018: EUR 18.2bn
- 2019: 20.8bn
- 2020: 17.6bn
- for comparison, 2021: 21.9bn

Profit tax was 3.3, 4.0 and 3.2bn (2021: 4.6bn). The 2018-2021 average is about 0.90x 2021 for all taxes and about 0.83x 2021 for profit tax.

| country | 2018 | 2019 | 2020 | 2021 (all taxes) |
|---|---|---|---|---|
| USA | 3.94 (2.95-5.25) | 4.30 (3.25-5.69) | 3.79 (2.85-5.04) | 4.61 |
| DEU | 3.25 (2.36-4.47) | 3.77 (2.75-5.18) | 3.12 (2.28-4.28) | 3.80 |
| FRA | 1.75 (1.23-2.47) | 2.05 (1.50-2.81) | 1.67 (1.19-2.34) | 2.18 |
| GBR | 0.96 (0.58-1.57) | 1.30 (0.88-1.92) | 1.10 (0.74-1.63) | 1.42 |
| JPN | 0.91 (0.59-1.39) | 1.10 (0.78-1.56) | 1.06 (0.80-1.40) | 1.38 |
| CHE | 1.12 (0.84-1.49) | 1.22 (0.93-1.62) | 1.04 (0.78-1.39) | 1.28 |
| KOR | 0.82 (0.55-1.22) | 0.98 (0.69-1.40) | 0.83 (0.58-1.20) | 1.05 |
| SWE | 1.01 (0.62-1.64) | 1.08 (0.68-1.72) | 0.82 (0.53-1.26) | 0.96 |
| NLD | 0.73 (0.51-1.04) | 0.79 (0.56-1.13) | 0.68 (0.47-0.97) | 0.83 |
| ITA | 0.57 (0.42-0.78) | 0.64 (0.47-0.87) | 0.55 (0.40-0.75) | 0.64 |
| CHN | 0.34 (0.19-0.64) | 0.38 (0.21-0.70) | 0.35 (0.19-0.63) | 0.44 |

**Caveats:**
- **Survivorship.** Firms that left before 2021 are missing, and firms that entered in 2019-2021 are carried back as if they had existed earlier.
- **What the indices track.** Direct investment income includes oil and round-trip profits, which is why it is only half of the profit index.
- **Overlap with the trend.** `trend2.json` already gives a pre-war growth trend for company taxes (+4.5% a year). If the baseline becomes 2018-2021, that trend should be refitted on these years, or dropped, so the growth is not counted twice.

## 2. China's fuel refined from Russian crude and exported (`china_refining`)

| | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|
| Product exports, Mt (HS 2710; 2026 customs via press) | 53.7 | 62.7 | 58.1 | 58.0 | 34.2 (30-36) |
| Product exports, EUR bn | 45.9 | 44.6 | 38.6 | 34.8 | 24.0 |
| Russian crude to China, Mt (CREA, seaborne + pipeline) | 87.8 | 107.0 | 108.5 | 100.7 | 77.5 |
| Refinery runs, Mt (NBS; 2025-26 estimated) | 676 | 735 | 708 | ~738 | ~463 |
| Russian share of runs | 13.0% | 14.6% | 15.3% | 13.6% | 16.7% |
| Russian crude in exported fuel, Mt | 5.6 (3.2-8.8) | 7.4 (4.2-11.5) | 7.2 (4.1-11.2) | 6.4 (3.6-10.2) | 4.6 (2.3-7.6) |
| **Exported crude value, EUR bn** | **3.27 (1.75-5.37)** | **3.56 (1.91-5.83)** | **3.56 (1.91-5.84)** | **2.72 (1.45-4.54)** | **2.20 (1.03-3.78)** |
| China component of laundered_oil (product value, net of ship registries) | 3.82 | 4.91 | 4.53 | 3.50 | 4.06 |
| **Share already counted at buyers** | **1.00 (0.53-1)** | **1.00 (0.52-1)** | **1.00 (0.53-1)** | **0.98 (0.50-1)** | **1.00 (0.37-1)** |

**Method:**
- Exported crude = product exports × Russian share of runs × exporter factor ÷ product yield × CREA value per tonne of Russian crude delivered to China.
  - Exporter factor: 0.75 (0.45-1.10).
  - Product yield: 0.93 t of product per t of crude (0.90-0.96).
- **Why an exporter factor.** Product export quotas are held by Sinopec, PetroChina, CNOOC, Sinochem and Zhejiang Petrochemical. Shandong independent refiners have no product export quotas and take a large part of seaborne Russian crude, and inland refineries in Xinjiang take pipeline crude.
- **Already counted.** The China component of `energy.json` laundered_oil is built as China's HS 2710 exports to each buyer × the Russian share of China's crude *imports* (17-20%) × the CREA calibration (0.53 / 0.699 / 1.0).
  - Exports to ship registries (Liberia, Panama, Marshall Islands, 12-16% of value) are taken out, because the builder's GDP cap removes them.
  - What remains equals or exceeds the product value actually made from Russian crude in every year. One reason is that the model uses the import share, not the run share.
  - Nothing new needs adding at buyers. A positive remainder appears only in the high case, at EUR 1.9-2.6bn of crude value.
- **Recommendation.** Treat China like Turkey and India in the `refiners` block of `pipeline/build_data.py`: deduct `exported_crude_value` from China's own payments to Russia. Following the existing convention:
  - central from `years`
  - high from `years_lo`
  - low from `years_hi`
- **Period.** 2022 is the calendar year, like Turkey's and India's entries. The share is compared on March-December, because the laundered series starts in March 2022.

## 2b. EU refiners on Russian crude (`eu_refiners`)
**Fuel from EU refiners is not counted at buyers.** The laundered-oil model has only four refiner countries (India, Turkey, China, UAE). So fuel refined from Russian crude at Schwedt, Leuna, ISAB Priolo, Rotterdam/Zeeland, Plock/Gdansk, Neftochim Burgas, Slovnaft, MOL Danube, Litvinov/Kralupy, Petrotel and other EU refineries, and sold to other countries, is not counted as laundered oil at any buyer.

- **No double count, so no deduction.** Each EU refiner country carries the full crude value in its own payments to Russia, including the part it exported.
- **Size of the exported part.** Calculated as CREA Russian crude value × refinery product export share, with rounded ranges from energy balances.

| | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|
| Exported crude value, EUR bn | 21.0 (15.6-26.9) | 3.4 (2.4-4.4) | 2.1 (1.6-2.6) | 1.9 (1.5-2.3) | 0.8 (0.7-1.0) |

- **Largest in 2022:** Netherlands 5.9, Italy 4.8 (ISAB), Slovakia 1.9, Germany 1.6, Poland 1.6, Bulgaria 1.4, Hungary 0.9, Romania 0.8.
- **From 2023:** only the Druzhba exemption (Slovakia, Hungary, Czechia to spring 2025) and Bulgaria (2023) remain.
- **Buyers.** Most went to other EU members and Switzerland. Ukraine also bought diesel from Slovnaft, MOL, Orlen and Neftochim, which the embargo exemptions allowed.
- **Recommendation: keep this with the refiner country.**
  - In 2022 most of it came before the embargo and stayed inside the EU.
  - There is no split of buyers by crude origin.
  - From 2023 the derogations limited exports. Bulgaria could export products from Russian crude only to Ukraine, and Slovakia's permission to export them to Czechia was time-limited.

## 3. Pre-war laundered oil, 2018-2021 (`laundered_prewar`)
**Method.** The formula is the same as the post-war model in `energy.json`:
- Inputs:
  - HS 2710 exports of China, India, Turkey and the UAE to each buyer (UN Comtrade, 2018-2021)
  - × the Russian share of the refiner's crude
  - × the same CREA calibration (0.53 / 0.699 / 1.0)
- **Units.** The values are at the same stage as `energy.json` laundered_oil: product value, before hub pass-on, the crude-content factor, the EU ×0.62 correction and the GDP cap. The builder must apply the same steps to the base as to the post-war values.

**Russian shares, 2018-2021:**

| refiner | Russian share | basis |
|---|---|---|
| China | 15.5% in every year | Comtrade crude imports, tonnes |
| India | 1.0%, 1.3%, 1.3%, 2.1% | Comtrade crude imports, tonnes |
| Turkey | 9%, 26%, 11%, 20% | Russian-reported crude exports, and CREA for 2021, divided by 31 Mt as in `energy.json`. 2019 peaks after Iran's sanctions waivers ended. |
| UAE | 0.3%, 0.4%, 2.1%, 1.7% | Russian product imports / product exports |

**Totals (central):**

| | 2018 | 2019 | 2020 | 2021 |
|---|---|---|---|---|
| All refiners | 3.8 | 5.2 | 2.9 | 4.5 |
| China | 3.3 | 3.7 | 2.4 | 3.0 |
| India | 0.26 | 0.34 | 0.21 | 0.67 |
| Turkey | 0.25 | 1.15 | 0.23 | 0.77 |

- **Post-war comparison.** Post-war central values are 16-30bn a year (India 7.7-20.1, China 4.0-5.6, Turkey 2.9-4.8). Most of the rise is India.
- **China barely rose.** China's part is close to its pre-war level. So for buyers supplied mainly by China, the pre-war base is a large part of today's value: Hong Kong, Singapore, the Philippines, Panama, Korea and Malaysia.

| buyer | base 2018-2021 (low-high) | g, a year (low to high) | 2023 laundered_oil, energy.json |
|---|---|---|---|
| SGP | 0.732 (0.485-1.179) | +1.3% (-4.0 to +6.5) | 2.60 |
| HKG | 0.514 (0.343-0.824) | +1.9% (-3.1 to +6.9) | 0.91 |
| PHL | 0.281 (0.188-0.451) | +9.6% (0 to +10) | 0.40 |
| AUS | 0.178 (0.118-0.286) | +6.1% (0 to +10) | 0.96 |
| KOR | 0.153 (0.101-0.245) | +4.7% (-0.3 to +9.7) | 0.54 |
| PAN | 0.147 (0.097-0.236) | +6.5% (0 to +10) | 0.25 |
| NLD | 0.131 (0.079-0.225) | +10% (0 to +10) | 2.63 |
| MYS | 0.128 (0.085-0.205) | +8.8% (0 to +10) | 0.55 |
| LBR | 0.110 (0.073-0.178) | +10% (-1.5 to +10) | 0.32 |
| BGD | 0.099 (0.065-0.158) | +8.1% (0 to +10) | 0.53 |
| USA | 0.098 (0.063-0.163) | 0.0% (-6.7 to +6.7) | 1.58 |
| VNM | 0.081 (0.054-0.130) | -6.1% (-10 to +7.8) | 0.12 |
| ARE | 0.080 (0.051-0.134) | +5.4% (0 to +10) | 1.69 |
| GBR | 0.061 (0.040-0.100) | -4.2% (-10 to +7.5) | 0.54 |

All 97 buyers with a base of at least EUR 1m are in the JSON.

**Fields in the JSON:**
- `base_2018_2021`: the nominal mean for 2018-2021.
- `base_2018_2021_at_2019_2021_prices`: volumes revalued at each refiner's 2019-2021 export unit value. Use this one if the map compares at constant prices.
- `g`: the log-linear 2018-2021 slope of the constant-price series.
  - It is shrunk 70% toward the pooled slope (+5.8% a year) and capped at ±10% a year.
  - Low and high = central ∓ the larger of 5 points and half the distance to the country's own slope. The range always includes zero.
  - Apply the same 3-year half-life damping as `trend.json` when extending g to 2022-2026.

## Weakest assumptions
1. **Company taxes before 2021 come from macro indices, not company data.** There are no KSE back-data. Country differences rest only on FDI positions, at half weight. The profit-tax index is wide (2018: 0.56-1.00 of 2021).
2. **China's exporter factor, 0.75 (0.45-1.10).** This is the Russian share in export-quota refineries compared with the national run share. It is a judgement from who holds quotas and who buys Russian crude. The conclusion that fuel is "already counted" holds unless the factor is above about 1.0 while the calibration is at its low end.
3. **China's 2025-2026 refinery runs and 2026 exports** are estimates from monthly press reports. Product scopes conflict for Jan-Aug 2026 (34.2 Mt broad against 13.6 Mt for Jan-Jul in a narrower scope).
4. **EU refinery export shares** are rounded ranges, not refinery-level sales.
5. **Pre-war growth rates** rest on four noisy years (the 2020 oil-price crash and Turkey's 2019 spike), are shrunk hard, and often hit the ±10% cap. Turkey's pre-war Russian crude volumes come from Russian mirror data (2.1-8.2 Mt) and carry ±30%.
6. **The post-war laundered model's own China share** (import share 17-20%) is higher than the run share (13-17%). The pre-war base uses the same import-share convention (15.5%), so the comparison is like for like.
