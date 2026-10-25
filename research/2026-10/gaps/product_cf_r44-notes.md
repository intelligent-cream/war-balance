# "Paid to Russia": can a product-level no-war model narrow the band? (round 44)

Data file: `research/2026-10/gaps/product_cf_r44.json`. Script: `research/2026-10/scripts/product_cf_r44.py` (`python3 -I research/2026-10/scripts/product_cf_r44.py run` from the repository root; it reads only the files in `research/2026-10/raw/oec_baci_r44/` and the committed gaps files, and runs offline in about 10 seconds. `... fetch` downloads again).

This file moves no money and changes no band. It answers one question: can splitting purchases from Russia by product beat "2021 held flat" by enough to narrow the no-war band, which makes up about 77% of the variance of the "paid" range of the 78 uncertain countries?

## Summary

- **No. None of the product models passes the rule, and none gives a narrower band at the same coverage.** The rule was fixed in advance: at least 15% more accurate in each of the three tests. The current band stays as it is (generic size-class band ×0.81).
- **M1, each product group held flat, is the same model as M0.** At the base year's prices, the sum of the product groups held flat is the total held flat. The two differ only through the start rule:
  - for large flows the result is identical (gain 0% in every test);
  - for small and mid-size flows, taking the median of each group's own three years (instead of the median of the total) is **worse**: −4% to −12% accuracy, and a band about twice as wide for small flows. Lumpy groups (a wheat cargo in two of three years) get a median of zero, so the start is too low.
- **M2 (fuel and fertiliser follow world indices known at the base year) does no better.** It uses the IMF WEO October vintage of the base year: the world goods import volume forecast, and the crude price path with a price elasticity fitted on earlier years. Gains are −12% to +9% depending on test and size class, with no class above 15% in all three tests.
  - Its era-calibrated band looks 7-11% narrower for large and mid-size flows (×0.93 and ×0.89). But the spread of its errors itself is not narrower (×1.02 and ×1.05 before calibration). The difference comes from the calibration factor stepping down, not from better forecasts. For small flows its band is wider (×1.9).
- **Even perfect knowledge of Russia's supply by product does not pass.** As a check, two "oracle" models (not allowed for 2022-2026) move each flow by Russia's actual later exports to all other partners, as a total or product by product. The best one gains −7%, +2% and +12% overall. Product detail adds nothing over the total oracle for small and mid-size flows.
- **Why it fails** (the same reason the fuel split failed in rounds 7 and 8): the swings are in what each buyer takes from Russia, product by product, and the product parts move independently of each other.
  - Correlation between the fuel part's error and the rest: 0.01 (small), 0.02 (mid-size), 0.04 (large).
  - The error variance is spread across groups. For small buyers: fuel 36%, other goods 24%, cereals 15%, fertilisers 13%, metals 13%.
  - Holding each part flat or moving it with a world index cannot remove swings that are specific to one buyer.

## Data

- **Trade:** CEPII BACI HS92 (the 1995-2024 release, licence Etalab 2.0) through the OEC API (`oec.world`, no key): Russia's exports to each of 221 importers by HS2 chapter, 2001-2021, as reconciled FOB values in USD.
  - Committed extract: `raw/oec_baci_r44/rus_exports_partner_hs2_2001_2021.json.gz` (1.2 MB, year × importer × HS2).
  - Full API responses were kept outside the repository.
  - Russia's total exports in this series, for checking: USD 350bn (2007), 515bn (2012), 303bn (2016), 502bn (2021). The fuel share is 53-68%.
- **Product groups:** fuel (HS 27), cereals (HS 10), fertilisers (HS 31), metals (HS 72-76), other.
- **Prices:**
  - Fuel, cereals, fertilisers and metals: Fisher chained unit-value indices of Russia's exports to the world by HS4, from BACI quantities (`rus_exports_world_hs4q_2001_2021.json.gz`). HS4 pairs whose unit value moved more than ×4 in a year are dropped as unit breaks.
  - Other goods: US import prices excluding fuels (FRED `IREXFUELS`).
  - The fuel index follows crude: 2.84 (2007), 4.01 (2013), 2.37 (2015), 3.11 (2021), with 2001 = 1.
- **Size classes:** the 4-year average at the origin in EUR (FRED `AEXUSEU`), with the same limits as the site: S under EUR 0.1bn, M 0.1-1bn, L over 1bn. Flows under EUR 10 m are left out. Ukraine and Belarus are excluded.
- **IMF WEO vintages** (DBnomics `WEOAGG`): world goods import volume growth (`TMG_RPCH`) and the APSP crude price (`POILAPSP`), from the October vintage of each origin year.
  - 2011-10 is missing, so April 2011 is used.
  - Vintages before 2012 carry only two forecast years. Later years repeat the last forecast growth and hold the last price.
  - There is no vintage for the 2007 origin, so M2 = M1 there. A variant uses April 2008 (gain −3%).

## Models (fixed before the results)

All models predict the real level at the origin year's prices, product by product (deflated by the group price indices above).

| key | model |
|---|---|
| **M0** | total held flat (current method). Flows under EUR 1bn (S, M) start from the median of the three years to the origin, as `small_flow_base` |
| **M1** | the five groups each held flat, with the same start rule as M0 |
| **M1b** | each group from the median of its own three years, for all sizes |
| **M2** | fuel × WEO world import volume × (WEO crude path)^β; fertiliser × WEO world import volume; other groups flat. β is the pooled elasticity of fuel volume to Russia's fuel price, fitted on pre-origin pairs (0.31 in 2005, 0.11 in 2012, −0.05 in 2016) |
| M2v, M2p | M2's two parts on their own (diagnostic) |
| O_total, O_groups | oracles, not eligible: the total, or each group, moved by Russia's actual real exports of it to all other partners |

**Why M1 = M0.** For a large flow the M1 prediction for year t is Σ_g V_g,0 at base prices, which is the total at base prices, so it is the same number as M0. With the site's own target (the total deflated by one fixed-weight index), M1 differs only through realised relative prices: −5% to +2% (`M1_sitelike` in the JSON). So a product split can only help if the products are forecast differently (M2), or started differently (M1b).

## Back-test design

- **Rolling origins:** 2005-2016, horizons 1-5, targets up to 2021. That gives 1,556 importer-origin cases (S 486, M 581, L 489) from 149 importers.
- **Error:** the site's cumulative error, log(Σ w·actual / Σ w·predicted) for H1-H5, with w = 1, except 8/12 for the fifth year (as `H5_2026_8of12`).
- **Accuracy:** at the test origins 2007, 2012 and 2016, the median absolute cumulative log error, averaged over H1-H5.
  - Main run: all years kept.
  - Variant: the site's exclusions (2014-2015 for the 2012 origin, 2020 for 2016).
- **Bands:** as in `to_rus_cf.json`. The 5th-95th percentile × K, where K is the smallest factor for which bands from two eras cover at least 90% of the third. The eras are 2005-09, 2010-12 and 2013-16.
- **Placebo-style coverage:** H4 windows at origin 2013 (2014-2017, the Russia-shock placebo) and origin 2016 (2017-2020; a 2017 origin cannot reach H4 inside 2021). Bands come only from origins whose windows end before the placebo window: origins up to 2009 and up to 2012.

## Results

**Accuracy gain over M0** (all years kept; site exclusions in brackets where different). M0's error is the mean over H1-H5.

| size | test | n | M0 error | M1 | M1b | M2 | O_total | O_groups |
|---|---|---|---|---|---|---|---|---|
| S | 2007 | 41 | 0.480 | +4% | +4% | +4% | +2% | +5% |
| S | 2012 | 41 | 0.551 | −7% (−4%) | −7% | −0% (+6%) | +2% | −2% |
| S | 2016 | 47 | 0.558 | −8% (−4%) | −8% | −3% (−1%) | +10% | +3% |
| M | 2007 | 43 | 0.348 | −12% | −12% | −12% | +2% | −15% |
| M | 2012 | 53 | 0.390 | −4% (−9%) | −4% | +1% (−8%) | +10% | −4% |
| M | 2016 | 49 | 0.278 | −7% | −7% | −8% | +3% | +7% |
| L | 2007 | 36 | 0.184 | 0% | −5% | 0% | −3% | −2% |
| L | 2012 | 40 | 0.132 | 0% | −42% (−14%) | −11% (+5%) | −6% | −10% |
| L | 2016 | 47 | 0.136 | 0% | −35% (−28%) | +4% (+9%) | +13% | +24% |
| all | 2007 / 2012 / 2016 | 120 / 134 / 143 | 0.30 / 0.32 / 0.26 | −0% / +0% / −4% | −9% / −11% / −12% | −0% / +6% / −3% | −0% / +6% / +9% | −7% / +2% / +12% |

- **Bootstrap** (countries resampled, all sizes): M2's 90% interval of the gain is −10% to +4% (2007), −6% to +12% (2012) and −11% to +3% (2016). Every interval includes zero, and none comes near +15%.
- **Decision: no candidate passes** in any size class, in either variant (`decision_by_size`).

**2022-2026-style band (H5), era-calibrated 90%, multiplier on the central level**

| size | M0 | M1 | M1b | M2 | M2 width vs M0: calibrated / before calibration | K: M0 / M2 |
|---|---|---|---|---|---|---|
| S | 0.35-10.4 | 0.32-22.3 | 0.32-22.3 | 0.32-19.4 | ×1.90 / ×1.09 | 1.23 / 1.37 |
| M | 0.38-3.87 | 0.40-3.82 | 0.40-3.82 | 0.35-3.44 | ×0.89 / ×1.05 | 1.15 / 1.08 |
| L | 0.49-1.85 | 0.49-1.85 | 0.44-2.16 | 0.46-1.72 | ×0.93 / ×1.02 | 1.36 / 1.32 |

- M0's bands on these data are close to the site's: L 0.49-1.85 against 0.57-1.62 (`to_rus_cf`); M 0.38-3.87 against 0.47-3.19; S 0.35-10.4 against 0.30-8.21. The differences come from the data (BACI, unit-value deflators).
- The comparison that matters is within the same data.

**Placebo-style coverage of the H4 band** (out of sample; with the model's K, and uncalibrated in brackets)

| size | origin 2013 (2014-17): M0 | M1 | M2 | origin 2016 (2017-20): M0 | M1 | M2 |
|---|---|---|---|---|---|---|
| S | 95% (90%) | 98% (90%) | 98% (90%) | 91% (87%) | 96% (89%) | 96% (89%) |
| M | 90% (90%) | 88% (86%) | 90% (82%) | 96% (96%) | 96% (96%) | 96% (96%) |
| L | 96% (89%) | 96% (89%) | 96% (91%) | 98% (91%) | 98% (91%) | 98% (89%) |

- All models cover about 90% or more, so M0's band is honest on these data too.
- M2's large-flow placebo bands are slightly narrower: 0.39-1.67 against 0.37-1.80 (2013), and 0.43-1.67 against 0.44-1.82 (2016). Before calibration its coverage is the same or lower, consistent with the point above: the narrowing is in K, not in the errors.

## Implied band factor per size class

| size | uncertain countries | factor from this round |
|---|---|---|
| S | 21 (Benin, Bolivia, Cambodia, Uruguay, Zambia, ...) | **1.00** (product models are wider) |
| M | 33 (Colombia, Jordan, Rwanda, Kenya, Lebanon, Peru, Philippines, ...) | **1.00** (M2 ×0.89 after calibration, ×1.05 before; fails the accuracy rule) |
| L | 24 (Mexico, Mongolia, Kazakhstan, Thailand, Vietnam, ...) | **1.00** (M2 ×0.93 after calibration, ×1.02 before; fails the accuracy rule) |

The size classes are those of `counterfactual.json`. The full lists are in `uncertain_countries`.

**No cf_bands-style table and no build change are proposed.** If the builder wanted to use M2's calibrated ×0.89 or ×0.93 anyway, it would break the project's rule. The rule exists to stop narrowing on gains this small and this unstable (the bootstrap includes zero, and the uncalibrated spread is wider).

## What the data do show (for the builder)

- **Small and mid-size buyers' purchases from Russia grew faster than "held flat"** in these back-tests. The median 5-year cumulative error is +0.23 to +0.62 (log) for S and +0.02 to +0.28 for M.
  - The 2019-2021 median start makes the base lower still.
  - The band's high side carries this. It is a centre question, not a width question, and was not part of this brief.
- **Fuel and the rest move independently** (correlation about 0), as round 8 found on volumes. That is why a product split cannot narrow the total. The total is already steadier than its parts.
- **The per-product median start is harmful.** If a per-product start is ever considered (for example for lumpy cereal buyers), it should not be the per-group median.

## Caveats

- **Data.** The series is BACI (reconciled, FOB), deflated with Russian unit-value indices. It is not the site's Comtrade-plus-mirror series with the fuel-mix deflator. The comparison between models is within one series. Band factors are ratios, not new bands.
- **WEO vintages** before 2012 have only two forecast years, and there is none for 2007. With full five-year paths, M2 might differ, but the 2012 and 2016 tests (with full paths) also fail.
- **Countries are not independent.** Shared shocks (the 2009 and 2015 oil-price crashes) move many countries at once, so test-level gains are noisier than n suggests.
- **Several models were tested.** With M1, M1b and M2 (and two diagnostic parts), a chance pass would have been possible. None happened.

## Overlaps

- No money amounts and no band changes. Nothing here replaces `cf_bands.json`, `to_rus_cf.json`, `fuel_volume_cf.json` or `CB_SCALE_PAID`.
- New raw files in `research/2026-10/raw/oec_baci_r44/`: the HS2 extract (1.2 MB), the HS4 quantity extract (31 kB), `fred.json` and `weo_vintages.json`. They are not yet listed in `raw/MANIFEST.json` (left to the integrator).
