# Pre-war trends for the counterfactual baseline (2012-2021 → 2022-2026)

Data file: `research/2026-10/gaps/trend.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What it is for

The map's baseline is the 2019-2021 average at pre-war prices. This file gives, for each country and flow, a factor saying where pre-war trends alone would have taken that baseline by each year from 2022 to 2026:

**counterfactual real value(Y) = 2019-2021 real average × multiplier(Y).**

For a nominal counterfactual, multiply that result by the year's price index (`pidx`). A multiplier above 1 means part of the post-2022 rise would have happened anyway, as with China's imports from Russia. A multiplier below 1 means part of the drop was already under way, as with US exports to Russia.

Coverage: 231 economies, 893 country-flows. 188 of these are marked reliable. Among the 108 flows with a 2019-2021 base of at least EUR 1 bn, 63 are reliable.

Flow keys follow `site/data.json`:
- `to_rus` = imports from Russia
- `from_rus` = exports to Russia
- `buy_ukr` = imports from Ukraine
- `sell_ukr` = exports to Ukraine

## Method

1. **Data.** UN Comtrade public preview, HS TOTAL, annual values for 2012-2021, one period per call. The back-test also uses 2002-2013.
   - Each economy's own report is used where it exists.
   - Missing years come from Russia's or Ukraine's report on the same flow. These are scaled by the country's own median ratio between its report and the partner's over the overlapping years. With fewer than 3 overlapping years, the generic ratios from `trade_full.json` are used instead (0.847 / 1.320 / 0.810 / 1.388).
   - USD is converted to EUR with ECB annual averages. These run from 1.2848 USD per EUR (2012) to 1.1827 (2021).
2. **Real terms.**
   - *Imports from Russia* are deflated with a fixed-weight index. The weights are the country's 2019-2021 fuel mix from `energy2.json` (60 countries). Other countries get the import-weighted average mix: fossil share 57%, made up of crude 43%, products 23%, gas 24%, coal 9% and other 1%. European, CIS and Chinese gas uses the pipeline-gas index; elsewhere the LNG index applies.
   - *Other flows* use the non-fuel goods index.
   - For 2019-2021 the index values are `energy2.json` central.
   - 2012-2018 values are chained onto the 2019-2021 mean using these benchmarks, all in EUR: Brent (crude), ULSD NY Harbor (products), IMF EU gas price (pipeline gas), Japan LNG, and Newcastle coal.
   - For non-fuel goods the back-cast uses the geometric mean of two indices: the euro-area import price index for industrial products excluding energy, and the US non-fuel import price index converted to EUR. The second captures world dollar prices. The EUR fell from 1.33 to 1.11 USD in 2014-2015, so a pure EUR index would make every dollar-invoiced flow look about 1.4%/yr faster.
   - **Deflator sensitivity:** each series is refitted with (A) Eurostat import price indices for every component and (B) the US non-fuel index alone. The larger of the two shifts is added to the band.
3. **Hidden pipeline gas.** Ten importers' customs omit most Russian pipeline gas: DEU, AUT, POL, NLD, FRA, HUN, CHE, FIN, BEL and TUR. Germany records none in 2012-2021. Finland and Turkey stop recording it after 2014-2015.
   - For these countries the import trend has two parts. The first is the trend of customs imports minus HS 2711. The second is Gazprom's delivery volume trend to Europe and Turkey for 2012-2021 (+3.4%/yr).
   - The two are weighted by the 2019-2021 gas share in `energy2.json`. For example, Germany is 36% gas.
4. **Trend fit.** Ordinary least squares of log real value on year. The window is chosen per series:
   - **Break test.** A regression without 2014-2015 includes a dummy for 2012-2013. If 2012-2013 sit more than 0.20 log off the line (|t| > 2), only 2016-2021 is used. This is the post-Crimea regime, flag `break_2014`, and applies to 282 series.
   - **Shock test.** Otherwise, if 2014-2015 lie more than 0.10 log and more than 2 residual SD below the line through the other years, they are left out (flag `shock_2014_15`, 72 series).
   - **Default.** Otherwise all of 2012-2021 is used (491 series).
   - In all cases one gross outlier (more than 0.40 log and more than 3 SD) may be dropped. These are mostly reporting breaks, for example Belarus's halved 2021 report.
   - 2020 (COVID) is kept.
   - 48 series have fewer than 4 non-zero years. They get no fit: central g = 0, band ±10%.
   - Why the 2014-2015 shock was treated as a break: Crimea, sanctions, Russia's counter-embargo and the oil and ruble crash were not a passing dip for most Russia flows. Russian import demand reset to a lower level and grew from there. Ukraine's partners show the same pattern after the 2014-2015 Ukrainian collapse and the 2016 EU free-trade agreement (DCFTA). Leaving out only 2014-2015 would keep the high 2012-2013 levels and bias those trends downward.
5. **Band for g.** central ± √((t95 × SE)² + deflator shift²), roughly a 90% interval for the slope. The band is widened where needed to include the central slopes of the other two windows (window uncertainty). It is not an interval for year-to-year noise.
6. **Damping.** The trend is continued with a **half-life of 3 years** and a **cap of ±10% a year**:

   `m(Y) = exp(g0 + Σ_{y=2022..Y} g0·0.5^((y−2021)/H))`, with `g0 = clip(ln(1+g), ln 0.9, ln 1.1)`

   - The 2019-2021 average is anchored at 2020, so 2021 carries one year of full in-sample trend.
   - The largest possible 2026 multiplier is 1.414 and the smallest is 0.682.
   - **Why:** the same data were used for a back-test one cycle earlier. Trends were fitted on 2002-2007 and scored against 2008 and 2010-2013, relative to the 2005-2007 average. This covered 291 country-flows above EUR 50 m. Median absolute log errors:

     | rule | median abs. log error | median bias (actual − predicted) |
     |---|---|---|
     | flat baseline (no trend) | 0.406 | +0.27 (too low) |
     | undamped trend | 0.771 | −0.62 (far too high) |
     | undamped, capped ±10% | 0.360 | −0.08 |
     | H = 2, cap ±10% | 0.311 | +0.09 |
     | **H = 3, cap ±10% (chosen)** | **0.318** | **+0.05** |
     | H = 5, cap ±10% | 0.328 | +0.02 |

   - Some damped trend clearly beats both a flat baseline and an undamped trend. Between H = 2 and H = 5 the error barely changes. H = 3 sits in the middle of that range and has small bias. The 2002-2007 period was a Russian boom, with median trend growth of 21%/yr, so the back-test mainly tests the cap and the damping together.
   - The chosen rule matches the damped-trend forecasting literature (Gardner & McKenzie 1985). A typical annual damping factor of about 0.8 corresponds to a half-life of about 3 years.

## Flags and reliability

`reliable` is false if any of these flags is set: `few_points` (fewer than 6 years used), `small_base` (2019-2021 real base below EUR 10 m), `noisy_fit` (residual SD above 0.30 log), `wide_band` (fit band wider than 0.20 log), `window_sensitive` (2016-2021 and 2012-2021 slopes differ by more than 0.10 log), or `rus_ukr_bilateral`. It is also false for `sanctions_after_2014` when the series shows a 2014 break or shock. That flag covers Russia flows of the EU, USA, GBR, CAN, AUS, NOR, JPN, CHE, ISL, LIE, ALB, MNE and UKR (2014 sanctions or Russia's counter-embargo), plus Turkey (Russian sanctions 2015-2017).

Flags that are informational only:
- `break_2014` and `shock_2014_15`: which window was used.
- `recovery`: the 2021 level is still below 2012-2013, so post-2016 growth is partly catch-up.
- `mirror_heavy`: more than half the years come from partner data.
- `gas_hidden`
- `outlier_dropped`

Flag counts: noisy_fit 488, wide_band 466, window_sensitive 427, small_base 400, break_2014 282, mirror_heavy 204, outlier_dropped 141, recovery 130, few_points 111, sanctions_after_2014 76, shock_2014_15 72, gas_hidden 10.

**Suggested use:** apply the central multiplier where `reliable` is true. Where it is false, use 1.0 (a flat baseline) as central and keep the multiplier's low/high as the range. Either way, the trend-adjusted figure should be shown as an alternative baseline, not a replacement for it.

## The 20 biggest economies

Each cell shows: real trend g, central (low…high) → **multiplier for 2026**, central (low–high). ✗ = not reliable.

| Country | Imports from RUS | Exports to RUS | Imports from UKR | Exports to UKR |
|---|---|---|---|---|
| United States (USA) | +7.6% (+3…+12) → **1.30** (1.10–1.41) ✗ | -7.3% (-10…-4) → **0.76** (0.69–0.87) ✗ | +18.9% (+5…+31) → **1.41** (1.20–1.41) ✗ | +2.9% (-0…+11) → **1.11** (0.99–1.41) |
| China (CHN) | +12.5% (+11…+14) → **1.41** (1.41–1.41) | +8.7% (+3…+11) → **1.35** (1.13–1.41) | +35.0% (+12…+53) → **1.41** (1.41–1.41) ✗ | +13.4% (+2…+20) → **1.41** (1.07–1.41) |
| Germany (DEU) | +0.1% (-1…+2) → **1.00** (0.95–1.06) | +1.4% (-5…+6) → **1.05** (0.82–1.23) ✗ | +8.3% (+6…+10) → **1.33** (1.24–1.41) | +5.0% (-2…+9) → **1.19** (0.93–1.35) |
| Japan (JPN) | -3.0% (-5…-1) → **0.89** (0.83–0.97) | +4.5% (-5…+11) → **1.17** (0.82–1.41) ✗ | +5.1% (+0…+8) → **1.20** (1.01–1.34) | +9.6% (+1…+17) → **1.40** (1.02–1.41) |
| India (IND) | +2.9% (-5…+11) → **1.11** (0.83–1.41) | +9.7% (+4…+14) → **1.40** (1.17–1.41) | +1.3% (-1…+4) → **1.05** (0.95–1.15) | +9.7% (-0…+14) → **1.40** (1.00–1.41) |
| United Kingdom (GBR) | +37.0% (+10…+52) → **1.41** (1.41–1.41) ✗ | -2.6% (-11…+3) → **0.91** (0.68–1.10) ✗ | +19.8% (+9…+28) → **1.41** (1.35–1.41) | +5.5% (-2…+14) → **1.21** (0.91–1.41) |
| France (FRA) | +0.3% (-1…+2) → **1.01** (0.95–1.08) | +2.9% (-5…+6) → **1.11** (0.82–1.25) ✗ | +8.5% (+3…+14) → **1.34** (1.10–1.41) | +9.3% (+1…+12) → **1.38** (1.02–1.41) |
| Italy (ITA) | -1.0% (-2…+0) → **0.96** (0.92–1.02) | +0.4% (-5…+4) → **1.01** (0.84–1.16) ✗ | +1.4% (-2…+5) → **1.05** (0.94–1.18) | +11.2% (+0…+16) → **1.41** (1.01–1.41) |
| Canada (CAN) | +9.1% (+5…+13) → **1.37** (1.20–1.41) ✗ | +0.1% (-12…+4) → **1.00** (0.68–1.15) ✗ | +13.0% (+1…+20) → **1.41** (1.03–1.41) | -1.1% (-9…+4) → **0.96** (0.71–1.14) |
| Brazil (BRA) | +6.8% (+3…+15) → **1.27** (1.10–1.41) | -8.8% (-12…-6) → **0.72** (0.68–0.81) | +43.3% (-11…+73) → **1.41** (0.68–1.41) ✗ | +10.8% (-13…+21) → **1.41** (0.68–1.41) ✗ |
| South Korea (KOR) | +4.5% (-1…+10) → **1.17** (0.97–1.41) | +9.6% (-2…+17) → **1.40** (0.92–1.41) ✗ | -5.2% (-10…+0) → **0.82** (0.68–1.01) | +17.2% (-7…+21) → **1.41** (0.77–1.41) ✗ |
| Mexico (MEX) | +5.7% (+0…+9) → **1.22** (1.01–1.38) | +20.6% (+0…+28) → **1.41** (1.00–1.41) ✗ | -2.2% (-5…+1) → **0.92** (0.83–1.02) | +5.2% (-12…+26) → **1.20** (0.68–1.41) ✗ |
| Australia (AUS) | +4.2% (-13…+25) → **1.16** (0.68–1.41) ✗ | -14.2% (-19…-1) → **0.68** (0.68–0.98) ✗ | +26.1% (+8…+39) → **1.41** (1.31–1.41) ✗ | +3.8% (-7…+15) → **1.14** (0.78–1.41) ✗ |
| Spain (ESP) | +4.7% (-6…+17) → **1.18** (0.80–1.41) ✗ | +3.9% (-5…+8) → **1.15** (0.84–1.33) ✗ | +0.8% (-2…+4) → **1.03** (0.92–1.16) | +15.5% (+5…+23) → **1.41** (1.20–1.41) |
| Indonesia (IDN) | +0.0% (-10…+11) → **1.00** (0.69–1.41) ✗ | +3.2% (-2…+7) → **1.12** (0.94–1.27) | +6.5% (+1…+14) → **1.26** (1.05–1.41) | +0.5% (-11…+13) → **1.02** (0.68–1.41) ✗ |
| Turkey (TUR) | +2.5% (+1…+5) → **1.09** (1.03–1.21) ✗ | +21.4% (-3…+29) → **1.41** (0.89–1.41) ✗ | +5.4% (-3…+14) → **1.21** (0.88–1.41) | +14.2% (+3…+19) → **1.41** (1.12–1.41) |
| Saudi Arabia (SAU) | +11.8% (+0…+24) → **1.41** (1.01–1.41) ✗ | +36.3% (+10…+52) → **1.41** (1.40–1.41) ✗ | -5.1% (-8…+2) → **0.82** (0.73–1.08) | +11.4% (+2…+22) → **1.41** (1.08–1.41) ✗ |
| Netherlands (NLD) | -2.5% (-6…+1) → **0.91** (0.80–1.04) ✗ | +7.2% (-2…+12) → **1.29** (0.94–1.41) ✗ | +13.8% (+10…+17) → **1.41** (1.41–1.41) | +10.0% (-1…+14) → **1.41** (0.96–1.41) |
| Switzerland (CHE) | -11.2% (-18…-2) → **0.68** (0.68–0.92) ✗ | +10.4% (+1…+14) → **1.41** (1.04–1.41) ✗ | +2.1% (-2…+6) → **1.08** (0.93–1.25) | +18.6% (-3…+22) → **1.41** (0.91–1.41) ✗ |
| Poland (POL) | -0.8% (-3…+2) → **0.97** (0.91–1.09) ✗ | +5.3% (-2…+9) → **1.21** (0.94–1.38) ✗ | +14.1% (+7…+21) → **1.41** (1.27–1.41) | +9.0% (+3…+12) → **1.37** (1.09–1.41) |

## Countries asked about: full multipliers 2022-2026

| ISO3 | Flow | g central (low to high) | multiplier by year, central (low–high) | reliable | window |
|---|---|---|---|---|---|
| CHN | Imports from RUS | +12.5% (+10.8 to +14.2) | 2022: 1.19 (1.19–1.19), 2023: 1.26 (1.26–1.26), 2024: 1.32 (1.32–1.32), 2025: 1.37 (1.37–1.37), 2026: 1.41 (1.41–1.41) | yes | 2012-2021 all years |
| CHN | Exports to RUS | +8.7% (+3.5 to +11.1) | 2022: 1.16 (1.06–1.19), 2023: 1.22 (1.09–1.26), 2024: 1.28 (1.10–1.32), 2025: 1.32 (1.12–1.37), 2026: 1.35 (1.13–1.41) | yes | 2016-2021 (post-2014 regime) |
| CHN | Imports from UKR | +35.0% (+11.6 to +53.0) | 2022: 1.19 (1.19–1.19), 2023: 1.26 (1.26–1.26), 2024: 1.32 (1.32–1.32), 2025: 1.37 (1.37–1.37), 2026: 1.41 (1.41–1.41) | no | 2016-2021 (post-2014 regime) |
| CHN | Exports to UKR | +13.4% (+2.0 to +19.8) | 2022: 1.19 (1.04–1.19), 2023: 1.26 (1.05–1.26), 2024: 1.32 (1.06–1.32), 2025: 1.37 (1.07–1.37), 2026: 1.41 (1.07–1.41) | yes | 2016-2021 (post-2014 regime) |
| IND | Imports from RUS | +2.9% (-4.9 to +11.4) | 2022: 1.05 (0.91–1.19), 2023: 1.07 (0.89–1.26), 2024: 1.09 (0.86–1.32), 2025: 1.10 (0.85–1.37), 2026: 1.11 (0.83–1.41) | yes | 2016-2021 (post-2014 regime) |
| IND | Exports to RUS | +9.7% (+4.4 to +14.4) | 2022: 1.18 (1.08–1.19), 2023: 1.25 (1.11–1.26), 2024: 1.31 (1.13–1.32), 2025: 1.36 (1.15–1.37), 2026: 1.40 (1.17–1.41) | yes | 2016-2021 (post-2014 regime) |
| IND | Imports from UKR | +1.3% (-1.2 to +3.9) | 2022: 1.02 (0.98–1.07), 2023: 1.03 (0.97–1.10), 2024: 1.04 (0.96–1.12), 2025: 1.04 (0.96–1.14), 2026: 1.05 (0.95–1.15) | yes | 2012-2021 all years |
| IND | Exports to UKR | +9.7% (-0.1 to +14.0) | 2022: 1.18 (1.00–1.19), 2023: 1.25 (1.00–1.26), 2024: 1.31 (1.00–1.32), 2025: 1.36 (1.00–1.37), 2026: 1.40 (1.00–1.41) | yes | 2016-2021 (post-2014 regime) |
| TUR | Imports from RUS | +2.5% (+0.8 to +5.3) | 2022: 1.04 (1.01–1.10), 2023: 1.06 (1.02–1.13), 2024: 1.07 (1.02–1.16), 2025: 1.08 (1.03–1.19), 2026: 1.09 (1.03–1.21) | no | 2012-2021 all years |
| TUR | Exports to RUS | +21.4% (-3.1 to +29.3) | 2022: 1.19 (0.95–1.19), 2023: 1.26 (0.93–1.26), 2024: 1.32 (0.91–1.32), 2025: 1.37 (0.90–1.37), 2026: 1.41 (0.89–1.41) | no | 2016-2021 (post-2014 regime) |
| TUR | Imports from UKR | +5.4% (-3.4 to +14.5) | 2022: 1.10 (0.94–1.19), 2023: 1.14 (0.92–1.26), 2024: 1.17 (0.91–1.32), 2025: 1.19 (0.89–1.37), 2026: 1.21 (0.88–1.41) | yes | 2016-2021 (post-2014 regime) |
| TUR | Exports to UKR | +14.2% (+3.1 to +18.6) | 2022: 1.19 (1.06–1.19), 2023: 1.26 (1.08–1.26), 2024: 1.32 (1.09–1.32), 2025: 1.37 (1.10–1.37), 2026: 1.41 (1.12–1.41) | yes | 2016-2021 (post-2014 regime) |
| DEU | Imports from RUS | +0.1% (-1.3 to +1.7) | 2022: 1.00 (0.98–1.03), 2023: 1.00 (0.97–1.04), 2024: 1.00 (0.96–1.05), 2025: 1.00 (0.96–1.06), 2026: 1.00 (0.95–1.06) | yes | 2012-2021 all years |
| DEU | Exports to RUS | +1.4% (-5.2 to +5.9) | 2022: 1.02 (0.91–1.11), 2023: 1.03 (0.88–1.15), 2024: 1.04 (0.85–1.18), 2025: 1.05 (0.84–1.21), 2026: 1.05 (0.82–1.23) | no | 2016-2021 (post-2014 regime) |
| DEU | Imports from UKR | +8.3% (+6.2 to +10.4) | 2022: 1.15 (1.11–1.19), 2023: 1.21 (1.16–1.26), 2024: 1.26 (1.19–1.32), 2025: 1.30 (1.22–1.37), 2026: 1.33 (1.24–1.41) | yes | 2012-2021 all years |
| DEU | Exports to UKR | +5.0% (-2.1 to +8.6) | 2022: 1.09 (0.96–1.16), 2023: 1.12 (0.95–1.22), 2024: 1.15 (0.94–1.27), 2025: 1.18 (0.93–1.31), 2026: 1.19 (0.93–1.35) | yes | 2016-2021 (post-2014 regime) |
| USA | Imports from RUS | +7.6% (+2.5 to +11.6) | 2022: 1.14 (1.05–1.19), 2023: 1.19 (1.06–1.26), 2024: 1.24 (1.08–1.32), 2025: 1.27 (1.09–1.37), 2026: 1.30 (1.10–1.41) | no | 2016-2021 (post-2014 regime) |
| USA | Exports to RUS | -7.3% (-9.6 to -3.7) | 2022: 0.87 (0.83–0.94), 2023: 0.83 (0.78–0.91), 2024: 0.80 (0.74–0.90), 2025: 0.78 (0.71–0.88), 2026: 0.76 (0.69–0.87) | no | 2012-2021 all years |
| USA | Imports from UKR | +18.9% (+5.1 to +30.8) | 2022: 1.19 (1.09–1.19), 2023: 1.26 (1.13–1.26), 2024: 1.32 (1.16–1.32), 2025: 1.37 (1.18–1.37), 2026: 1.41 (1.20–1.41) | no | 2016-2021 (post-2014 regime) |
| USA | Exports to UKR | +2.9% (-0.3 to +11.3) | 2022: 1.05 (0.99–1.19), 2023: 1.07 (0.99–1.26), 2024: 1.09 (0.99–1.32), 2025: 1.10 (0.99–1.37), 2026: 1.11 (0.99–1.41) | yes | 2012-2021 without 2014-2015 |
| KAZ | Imports from RUS | +9.4% (+0.1 to +12.9) | 2022: 1.18 (1.00–1.19), 2023: 1.24 (1.00–1.26), 2024: 1.30 (1.00–1.32), 2025: 1.35 (1.00–1.37), 2026: 1.39 (1.00–1.41) | yes | 2016-2021 (post-2014 regime) |
| KAZ | Exports to RUS | +9.6% (+0.2 to +15.8) | 2022: 1.18 (1.00–1.19), 2023: 1.25 (1.00–1.26), 2024: 1.31 (1.01–1.32), 2025: 1.36 (1.01–1.37), 2026: 1.40 (1.01–1.41) | yes | 2016-2021 (post-2014 regime) |
| KAZ | Imports from UKR | -12.1% (-23.7 to -6.0) | 2022: 0.83 (0.83–0.90), 2023: 0.78 (0.78–0.86), 2024: 0.73 (0.73–0.84), 2025: 0.70 (0.70–0.81), 2026: 0.68 (0.68–0.80) | no | 2016-2021 (post-2014 regime) |
| KAZ | Exports to UKR | -16.4% (-19.8 to -12.9) | 2022: 0.83 (0.83–0.83), 2023: 0.78 (0.78–0.78), 2024: 0.73 (0.73–0.73), 2025: 0.70 (0.70–0.70), 2026: 0.68 (0.68–0.68) | yes | 2012-2021 all years |
| ARE | Imports from RUS | +9.6% (+3.9 to +19.0) | 2022: 1.18 (1.07–1.19), 2023: 1.25 (1.10–1.26), 2024: 1.31 (1.12–1.32), 2025: 1.35 (1.13–1.37), 2026: 1.39 (1.15–1.41) | yes | 2012-2021 all years |
| ARE | Exports to RUS | +12.3% (+5.4 to +19.8) | 2022: 1.19 (1.10–1.19), 2023: 1.26 (1.14–1.26), 2024: 1.32 (1.17–1.32), 2025: 1.37 (1.19–1.37), 2026: 1.41 (1.21–1.41) | no | 2012-2021 all years |
| ARE | Imports from UKR | +5.8% (-2.1 to +15.2) | 2022: 1.11 (0.96–1.19), 2023: 1.15 (0.95–1.26), 2024: 1.18 (0.94–1.32), 2025: 1.21 (0.93–1.37), 2026: 1.23 (0.93–1.41) | no | 2012-2021 all years |
| ARE | Exports to UKR | +16.6% (+7.9 to +27.4) | 2022: 1.19 (1.15–1.19), 2023: 1.26 (1.20–1.26), 2024: 1.32 (1.25–1.32), 2025: 1.37 (1.29–1.37), 2026: 1.41 (1.32–1.41) | no | 2012-2021 all years |
| BRA | Imports from RUS | +6.8% (+2.6 to +14.8) | 2022: 1.12 (1.05–1.19), 2023: 1.17 (1.06–1.26), 2024: 1.21 (1.08–1.32), 2025: 1.24 (1.09–1.37), 2026: 1.27 (1.10–1.41) | yes | 2012-2021 all years |
| BRA | Exports to RUS | -8.8% (-11.7 to -5.7) | 2022: 0.85 (0.83–0.90), 2023: 0.80 (0.78–0.87), 2024: 0.77 (0.73–0.84), 2025: 0.74 (0.70–0.82), 2026: 0.72 (0.68–0.81) | yes | 2012-2021 all years |
| BRA | Imports from UKR | +43.3% (-10.9 to +72.8) | 2022: 1.19 (0.83–1.19), 2023: 1.26 (0.78–1.26), 2024: 1.32 (0.73–1.32), 2025: 1.37 (0.70–1.37), 2026: 1.41 (0.68–1.41) | no | 2016-2021 (post-2014 regime) |
| BRA | Exports to UKR | +10.8% (-13.5 to +21.1) | 2022: 1.19 (0.83–1.19), 2023: 1.26 (0.78–1.26), 2024: 1.32 (0.73–1.32), 2025: 1.37 (0.70–1.37), 2026: 1.41 (0.68–1.41) | no | 2016-2021 (post-2014 regime) |
| HUN | Imports from RUS | -1.3% (-3.2 to +0.6) | 2022: 0.98 (0.94–1.01), 2023: 0.97 (0.92–1.01), 2024: 0.96 (0.91–1.02), 2025: 0.96 (0.90–1.02), 2026: 0.95 (0.89–1.02) | yes | 2012-2021 all years |
| HUN | Exports to RUS | +2.3% (-5.4 to +6.1) | 2022: 1.04 (0.90–1.11), 2023: 1.06 (0.87–1.15), 2024: 1.07 (0.85–1.19), 2025: 1.08 (0.83–1.22), 2026: 1.09 (0.82–1.24) | no | 2016-2021 (post-2014 regime) |
| HUN | Imports from UKR | +3.0% (-0.3 to +6.5) | 2022: 1.05 (0.99–1.12), 2023: 1.07 (0.99–1.17), 2024: 1.09 (0.99–1.20), 2025: 1.10 (0.99–1.23), 2026: 1.11 (0.99–1.26) | yes | 2012-2021 all years |
| HUN | Exports to UKR | +11.8% (+2.7 to +15.5) | 2022: 1.19 (1.05–1.19), 2023: 1.26 (1.07–1.26), 2024: 1.32 (1.08–1.32), 2025: 1.37 (1.09–1.37), 2026: 1.41 (1.10–1.41) | yes | 2016-2021 (post-2014 regime) |

## Things to know

- **China-Russia:** imports grew a real +12.5%/yr on every window, so the multiplier reaches the cap of 1.41 by 2026. China's exports to Russia show a 2014 break and grew +8.7%/yr after 2016 (1.36 in 2026). Even under the trend counterfactual, a large part of China's 2022-2026 increase remains.
- **India-Russia:** India's imports from Russia grew +10.9%/yr over 2012-2021, but only +2.9%/yr after 2016 because of the 2017 spike. The band is wide (2026: 0.83-1.41). A pre-war trend explains very little of India's 2022-2023 oil surge, which was roughly ×5-7 in value.
- **Germany:** the import trend is flat (+0.1%/yr). Non-gas imports fell −1.6%/yr while gas volumes rose +3.4%/yr. Exports to Russia shrank before 2016 and grew slowly after (+1.4%); the series is flagged for sanctions.
- **USA:** imports from Russia were rising after 2016 (+7.6%/yr, mostly oil products), but the series is flagged for sanctions. Exports to Russia were falling −7.3%/yr, so the 2026 multiplier is 0.76: about a quarter of the later drop was under way before the war.
- **GBR and CHE imports** from Russia include bullion (non-monetary gold and precious metals) and are not a goods-demand trend. Both are flagged unreliable.
- **Ukraine flows:** almost all partners show a 2014 break followed by fast 2016-2021 growth (DCFTA, recovery). Undamped, these trends would be extreme. With damping and the cap most stop at 1.2-1.41, and many are marked `recovery`.
- **Eurasian Economic Union partners (BLR, KAZ, ARM, KGZ):** reporting changed with the customs union (2010-2015). Belarus's 2021 imports from Russia were treated as an outlier.
- **Back-test accuracy:** in the back-test, individual country-flows were typically off by about 0.3 log (a factor of about 1.35) after 4-7 years. The low/high values cover slope, deflator and window uncertainty, not that forecast error.
- **Gazprom volumes:** 2015 and 2021 were checked against Gazprom and OSW. The other years come from Gazprom annual reports as remembered and have not been re-downloaded. Their trend has only a small effect, through the gas share of 10 importers.
