# No-war counterfactual, version 3: 2018-2021 baseline, back-tested methods, error-based ranges

Data file: `research/2026-10/gaps/trend3.json`. Generated 2026-10-18. Not yet reviewed by a person.
Scripts: `working/trend3/scripts/`. They run in this order: `data.py` (inputs), `models.py` (methods), `backtest.py`, `build.py` (decision, ranges, output), then `compare.py` (range widths and country tables). Raw downloads are in `working/trend3/raw/`. The Comtrade downloads from `working/trend/raw/` are reused.

## Summary

- **The baseline is now the 2018-2021 average.** Multipliers for 2022-2026 are relative to it, in real terms (volume at 2018-2021 prices).
- **No model-based forecast clearly beat a simple rule.** The share models, the gravity panel, shrinkage and the ensemble all lost to it.
  - The simple rule is the **last pre-war year (2021) held flat**: a random walk, expressed relative to the 2018-2021 average.
  - Over 1-5 years ahead (the map's 2022-2026 horizon), it lowers the median absolute log error by **22-31%** against the flat 2018-2021 average.
  - The current damped trend lowers it by only 1-21%.
  - Bias: the random walk is nearly unbiased (+0.06). The flat average is biased low (+0.21).
- **Chosen methods:**
  - `to_rus`, `from_rus`, `sell_ukr` and `svc_sold`: the 2021 level (random walk).
  - `buy_ukr`: a damped-Holt variant, nearly the same thing (smoothed 2021 level plus 0.3 × the damped trend).
  - `svc_bought`: the share model. Its error is within 0.015 log of the random walk's.
  - The flat baseline was kept for no flow type.
- **The current damped trend adds error** for Russia flows and services. It helps only for Ukraine flows, and the random walk does as well there.
- **Ranges are honest 90% predictive intervals**, taken from the back-test error distribution. They are **much wider than the bands now on the map** (median 2026 high/low ×8.3 against ×1.5). The current bands covered only slope and deflator uncertainty, not forecast error.
- **Against an honest interval for the current method**, built the same way, the new intervals are narrower:
  - by 22% in log width for large flows (above EUR 1 bn): high/low ×4.7 → ×3.3
  - by 24% for mid-size flows: ×8.9 → ×5.2
  - by 15% value-weighted: ×5.2 → ×4.0
- **Typical 2026 interval for a large flow:** 0.48 to 1.62 × the central value (2022: 0.71 to 1.28).

## 1. Data

**Goods** (UN Comtrade public preview, HS TOTAL, 2000-2021):
- Same series as `trend.json`: each economy's own report, with missing years from Russia's or Ukraine's mirror report, scaled by the pair's ratio.
- EUR at ECB rates, then deflated:
  - imports from Russia with the 2019-2021 fuel-mix index
  - other flows with the non-fuel goods index (`energy2.json` central for 2019-2021, back-cast before that)
- Two changes from `trend.json`:
  1. **Deflator for gas-hidden importers.** For the ten importers whose customs omit Russian pipeline gas (DEU, AUT, POL, NLD, FRA, HUN, CHE, FIN, BEL, TUR), imports from Russia are now deflated with the fuel-mix index without gas. The old index included the 2021 gas price spike, which pushed Germany's 2021 real imports about 12% too low.
  2. **Reporting-break repair.** A reported year that is more than ×1.8 away from the partner's mirror report is replaced by the mirror value × the pair's usual own/mirror ratio. This applies only when the neighbouring years agree with the mirror report. 69 country-years are repaired, among them Belarus 2021 for imports from Russia and exports to Ukraine, where Belarus's own 2021 report halved.

**Services:**
- OECD-WTO BaTiS balanced series, partner Russia, total services 2005-2021. Newly downloaded; it was 2010 onwards before.
- Converted to EUR and deflated with the euro-area services HICP (2000-2025, newly downloaded).
- BaTiS travel 2012-2021 is used for the COVID adjustment.

**IMF WEO vintages** (country real GDP growth and trade volumes; aggregates for world and CIS trade volumes and the APSP oil price):
- **April 2008**: the earliest vintage available. It has no country trade volumes, so the CIS aggregate stands in for Russia and Ukraine.
- **October 2012**
- **October 2021**: the last vintage before the war.
- Read from the DBnomics mirror of the IMF WEO databases. imf.org refused direct downloads.

**Distance:** great-circle distance from Moscow or Kyiv to each partner's representative point.

## 2. Methods tested

All methods predict log(value in year Y / average over the 4 base years). They use only data up to the last pre-origin year and the WEO vintage of that origin.

| key | method |
|---|---|
| `flat` | flat 4-year average (multiplier 1) |
| `trend` | current method: own log-linear trend over the last ≤10 years, same window rules (break and shock tests, one outlier) and damping (half-life 3 years, cap ±10%/yr) as `trend.json` |
| `share` | (a) partner's share of the hub's total (Russia's or Ukraine's total imports or exports in that direction) held at the base level; hub total from its last actual level, grown with the WEO volume forecast of the vintage. Beyond the WEO trade horizon: hub GDP growth × the vintage's trade/GDP growth ratio |
| `share_tt` | (a) variant: share held, hub total on its own damped pre-war trend |
| `gravity` | (b) pooled growth panel per flow type across all partners: Δlog flow = a + b1 Δlog partner GDP + b2 Δlog hub GDP + b3 Δlog oil price + b4 log distance. Huber-robust, weighted by log size, with a ridge prior pulling towards unit GDP elasticities. Projected with the vintage's GDP and oil forecasts |
| `shrink` | (c) w × the damped trend, w per flow type × size class chosen on back-test error (empirical Bayes); weights from the other origin |
| `ensemble` | (d) stacked ensemble: non-negative weights summing to 1 on `flat_last`, `holt`, `share`, `share_tt` and `gravity`, fitted on the other origin's errors |
| `flat_last` | last pre-war year held flat (random walk), relative to the base average |
| `holt` | damped-Holt type: exponentially smoothed last level plus w × the damped trend after the last year; (α, w) per flow type, fitted on the other origin |

The pure unit-elasticity gravity (`grav_unit`) and the share-trend variant were also run (`working/trend3/bt.log`). Neither came close.

## 3. Back-test design

| origin | data to | base | WEO vintage | targets (years ahead) |
|---|---|---|---|---|
| 2008 | 2007 | 2004-2007 (services 2005-2007) | April 2008 | 2008-2013 (1-6) |
| 2013 | 2012 | 2009-2012 | October 2012 | 2013, 2016-2019 (1, 4-7) |

- **Exclusions:**
  - 2014-2015 (Crimea and Donbas war, sanctions) are excluded.
  - 2020 is never reached.
  - **Ukraine flows are excluded from the 2013 origin**, because post-2014 Ukrainian trade is itself a war outcome. With them included, flat would win: 0.43 against 0.55 for the trend on `buy_ukr` (sensitivity in `bt.log`).
  - The 2009 crisis is kept. It is a non-war shock of the kind a no-war 2022-2026 could also have had.
- **Sample:** country-flows with a base of at least EUR 10 m, all base years positive and at least 4 fitted years (3 for services at the 2008 origin, where the trend reduces to flat). Russia-Ukraine bilateral flows are excluded.
  - 4,074 country-flow-years over 1-5 years ahead; 3,390 over 4-7 years ahead.
- **Size classes** by base: S below EUR 0.1 bn, M 0.1-1 bn, L above 1 bn.
- **Out-of-sample discipline:** every fitted weight is estimated on the other origin, or on other countries for Ukraine flows, which have one origin. This covers shrinkage w, the Holt (α, w) and the stack weights. The scores are therefore out-of-sample.

### Results: median absolute log error / median bias (actual − predicted)

**4-7 years ahead** (the requested summary):

| flow | flat | trend | share | share_tt | gravity | shrink | ensemble | **flat_last** | holt | n |
|---|---|---|---|---|---|---|---|---|---|---|
| to_rus | 0.51 / +0.26 | 0.49 / +0.03 | 0.45 / −0.08 | 0.46 / −0.02 | 0.48 / −0.21 | 0.49 / +0.14 | 0.45 / +0.02 | 0.44 / +0.14 | 0.42 / +0.11 | 860 |
| from_rus | 0.51 / +0.24 | 0.49 / −0.14 | 0.64 / −0.59 | 0.50 / −0.17 | 0.73 / −0.70 | 0.56 / −0.08 | 0.45 / −0.08 | **0.41** / −0.02 | 0.55 / −0.05 | 652 |
| buy_ukr | 0.53 / +0.23 | **0.41** / −0.07 | 0.46 / −0.23 | 0.42 / −0.16 | 0.53 / −0.41 | 0.41 / +0.00 | 0.43 / −0.04 | 0.46 / +0.15 | 0.44 / +0.12 | 315 |
| sell_ukr | 0.52 / +0.33 | 0.32 / −0.05 | 0.76 / −0.76 | 0.32 / −0.07 | 0.64 / −0.63 | 0.40 / +0.05 | 0.33 / −0.07 | **0.32** / +0.01 | 0.37 / +0.05 | 195 |
| svc_bought | 0.38 / +0.22 | 0.38 / +0.08 | 0.32 / −0.14 | **0.30** / −0.09 | 0.39 / −0.27 | 0.38 / +0.22 | 0.36 / −0.04 | 0.31 / +0.08 | 0.32 / +0.09 | 713 |
| svc_sold | 0.40 / +0.28 | 0.39 / +0.06 | 0.42 / −0.38 | 0.32 / −0.09 | 0.41 / −0.37 | 0.40 / +0.28 | 0.45 / −0.18 | **0.32** / +0.11 | 0.34 / +0.12 | 655 |
| all | 0.46 / +0.25 | 0.42 / +0.00 | 0.46 / −0.31 | 0.39 / −0.09 | 0.49 / −0.38 | 0.45 / +0.15 | 0.42 / −0.06 | **0.37** / +0.09 | 0.40 / +0.09 | 3,390 |

**1-5 years ahead** (the decision metric; it matches 2022-2026):

| flow | flat | trend | share | share_tt | gravity | shrink | ensemble | flat_last | holt | best gain vs flat |
|---|---|---|---|---|---|---|---|---|---|---|
| to_rus | 0.41 | 0.39 | 0.39 | 0.39 | 0.39 | 0.40 | 0.36 | **0.32** | 0.33 | 22% |
| from_rus | 0.43 | 0.34 | 0.46 | 0.35 | 0.42 | 0.42 | 0.33 | **0.30** | 0.43 | 29% |
| buy_ukr | 0.49 | 0.41 | 0.41 | 0.40 | 0.44 | 0.41 | 0.39 | 0.39 | **0.38** | 23% |
| sell_ukr | 0.45 | 0.36 | 0.65 | 0.35 | 0.52 | 0.37 | 0.36 | **0.35** | 0.35 | 23% |
| svc_bought | 0.27 | 0.26 | **0.18** | 0.18 | 0.21 | 0.27 | 0.22 | 0.20 | 0.20 | 32% |
| svc_sold | 0.29 | 0.28 | 0.28 | 0.21 | 0.25 | 0.29 | 0.24 | **0.20** | 0.22 | 31% |
| all | 0.35 | 0.32 | 0.34 | 0.30 | 0.34 | 0.34 | 0.30 | **0.27** | 0.29 | |

Errors by size class (4-7 years ahead) are in `backtest_by_size_h4_7`; by origin in `backtest_by_origin_h4_7`. The main patterns:

- **Large flows:** the flat average and the random walk are about equally good (`to_rus` L 0.23 / 0.23; `from_rus` L 0.39 / 0.33). The trend is worse (0.27 / 0.47).
- **Share and gravity** are biased strongly downward for Russia flows (−0.6 to −0.8 for `from_rus`). The WEO forecasts of the time were too optimistic: April 2008 expected the CIS boom to continue, and October 2012 missed the 2014-2016 oil crash. The fitted gravity coefficients were unstable at the 2008 origin, where five years of near-constant Russian growth cannot identify the hub-GDP and oil effects.
- **The two origins disagree on common shocks.** `from_rus` errors under the flat average have median bias +0.62 at the 2008 origin (boom) and −0.05 at the 2013 origin. Methods that extrapolate growth (trend, share) win one origin and lose the other. Only the random walk is good in both.
- **Bootstrap uncertainty:** 90% interval of the gain of `flat_last` over flat at 1-5 years ahead, clustered by country:
  - `to_rus` +12…+30%
  - `from_rus` +23…+37%
  - `buy_ukr` +6…+27%
  - `sell_ukr` +4…+32%
  - `svc_bought` +21…+32%
  - `svc_sold` +27…+36%

## 4. Decision rule and choice

For each flow type, the best candidate by median absolute log error over 1-5 years ahead is used if two conditions hold:
- it is at least 20% below the flat 2018-2021 baseline;
- it is not worse than flat over 4-7 years ahead.

Otherwise the flat baseline would be used, with a range widened to cover the trend.

| flow | best | gain vs flat, 1-5 y | gain vs flat, 4-7 y | chosen |
|---|---|---|---|---|
| to_rus | flat_last | 22% | 13% | flat_last |
| from_rus | flat_last | 29% | 19% | flat_last |
| buy_ukr | holt (α 0.8, w 0.3) | 23% | 17% | holt |
| sell_ukr | flat_last | 23% | 39% | flat_last |
| svc_bought | share | 32% | 16% | share |
| svc_sold | flat_last | 31% | 20% | flat_last |

**Why 1-5 years ahead.** The map's 2022-2026 are 1-5 years after the last pre-war year. Over 4-7 years ahead the gains are smaller (13-39%), and only `sell_ukr` and `svc_sold` reach 20% there. Under a strict 4-7-year rule, `to_rus`, `from_rus`, `buy_ukr` (best: trend 22%) and `svc_bought` would fall back to flat. The random walk would still be the better central for every flow except `buy_ukr`.

**Near-ties.** For `buy_ukr` and `svc_bought`, the chosen method beats the random walk by less than 0.015 log, which is within noise:
- `buy_ukr`: 2021 level alone ×1.48 for China against holt ×1.52.
- `svc_bought`: the share model gives every country Russia's WEO export-volume path (×1.04 in 2022, about ×1.17 in 2026), times its COVID-adjusted 2021/base ratio.

If one method is preferred throughout, `flat_last` costs almost nothing.

**The prediction is dropped where it adds error.** The damped trend is no longer used anywhere. Where it helped (Ukraine flows), the random walk captures the same pre-war growth through the 2021 level.

## 5. Ranges

For the chosen method, the back-test log errors e (actual − predicted) are pooled over origins and horizons 1-7:

1. **Horizon scale.** g(h) is fitted to the median |e| by horizon: g ∝ h^0.48, so g(1) = 0.56 and g(5) = 1.21, relative to the all-horizon median. This gives `horizon_scale` from 2022 to 2026: 0.56, 0.78, 0.94, 1.08, 1.21.
2. **Quantiles.** The 5th, 50th and 95th percentiles of e/g(h) are taken per flow type × size class × volatility class.
   - The volatility class splits each cell at its median robust SD of the series' own yearly log changes over the fit window. Stable series get narrower ranges.
   - A cell with fewer than 60 errors borrows from M+L, then from the flow group.
3. **Multipliers.** low = central × exp(q05 × g(h)) and high = central × exp(q95 × g(h)). The quantiles are in `error_quantiles`.
4. **Central.** The method's value, not bias-corrected. Median errors are small for large flows (−0.13 to +0.07). Small export markets of Russia (`to_rus` S/M) have q50 of +0.2 to +0.3: those markets tended to grow, so the central sits low inside their range.
5. **Services.** The 2021 travel shortfall closes at the UNWTO world pace (49% of the gap open in 2022, 17% in 2023, 1% in 2024). The low end uses a 1.5× slower recovery and the high end a 2× faster one, on top of the error quantiles.
6. **Validation.** Cross-origin coverage of the 90% interval, with quantiles from one origin scored on the other:

   | flow | 2008 origin | 2013 origin |
   |---|---|---|
   | to_rus | 0.90 | 0.89 |
   | from_rus | 0.76 | 0.82 |
   | svc_bought | 0.96 | 0.67 |
   | svc_sold | 0.91 | 0.71 |

   The intervals are not too wide. If anything they are too narrow when a regime shift hits a whole flow type, as with Russian imports.

**Width compared with now** (median log(high/low) in 2026, flows of at least EUR 10 m):

| | published band now (`trend.json`, `trend2.json`) | current method, honest 90% back-test interval | new |
|---|---|---|---|
| L (> EUR 1 bn) | ×1.40 | ×4.66 | **×3.31** |
| M (0.1-1 bn) | ×1.51 | ×8.86 | **×5.21** |
| S (< 0.1 bn) | ×1.69 | ×41 | **×30** |
| all, median | ×1.51 | ×9.11 | **×8.29** |
| all, value-weighted | | ×5.22 | **×4.04** |

By flow (all sizes, median), the new interval against the current method's honest interval:
- narrower: `from_rus` −21%, `to_rus` −17%, `sell_ukr` −17%, `svc_sold` −15%, `svc_bought` −7%
- wider: `buy_ukr` +8%. Its single back-test origin is a boom, so its upper tail is long (q95 up to ×4-5 by 2026). This upper tail is probably overstated for 2022-2026.

## 6. Output

`countries[ISO3][flow]`:
- `base_2018_2021`: the 2018-2021 average of nominal EUR, in bn. `central` is the series used in the model. `low` and `high` span the own-report and partner-report averages (goods: partner report adjusted by the generic CIF/FOB ratio; services: BaTiS balanced, own report, and Russia's report).
- `multiplier`: real, 2022-2026, low/central/high.
- `method`, `note`, `size_class`, `volatility` (lo/hi).
- `pidx_2018_2021`: the mean 2018-2021 price index of the flow, on the `energy2.json` scale (2019-2021 = 1).

**Nominal counterfactual:** base central × multiplier × price index(Y) / `pidx_2018_2021`.
- Price index(Y) comes from `energy2.json` `price_index`: the fuel-mix index for imports from Russia, `non_fuel_goods` for other goods, `services` for services.
- For the ten gas-hidden importers, `pidx_2018_2021` refers to the fuel mix without gas. Customs base and multiplier exclude pipeline gas, which the map adds separately.
- Nominal and real 2018-2021 averages differ by the covariance of price and volume. For goods flows above EUR 0.1 bn the gap has a median of 0.3% and a 90th percentile of 2%, reaching 13% for a few small, erratic fuel flows.

**Coverage:** 233 economies, 1,278 country-flows.
- 780 use `flat_last`, 199 `share`, 192 `holt`.
- 107 are flat: too few non-zero years, or a zero in 2018-2021. Their range comes from the flat back-test errors and is widened to include the trend.
- Flows under EUR 10 m were below the back-test floor. They use the S-class errors, and their ranges are probably too narrow; the note says so.

Top-level keys:
- `backtest` (4-7 years ahead, as requested), `backtest_h1_5`, `backtest_by_size_h4_7`, `backtest_by_origin_h4_7`
- `decision`, `chosen`, `error_quantiles`, `horizon_scale`, `coverage_cross_origin`, `methods`, `sources`

## 7. Countries asked about: multiplier for 2026, central (low-high)

| Country | to_rus | from_rus | buy_ukr | sell_ukr | svc_bought | svc_sold |
|---|---|---|---|---|---|---|
| CHN | **1.09** (0.54–1.75) | **1.17** (0.56–1.86) | **1.52** (0.66–5.44) | **1.14** (0.29–2.26) | **1.22** (0.68–2.07) | **1.28** (0.84–2.00) |
| IND | **1.14** (0.38–1.98) | **1.13** (0.54–1.79) | **1.06** (0.46–3.80) | **1.06** (0.51–2.66) | **1.12** (0.57–2.00) | **1.42** (0.94–3.05) |
| TUR | **1.15** (0.57–1.85) | **1.20** (0.58–1.91) | **1.29** (0.56–4.62) | **1.24** (0.32–2.45) | **1.14** (0.58–2.04) | **1.25** (0.82–1.95) |
| DEU | **0.98** (0.48–1.58) | **1.00** (0.48–1.58) | **1.11** (0.48–3.95) | **1.07** (0.28–2.12) | **1.18** (0.66–2.01) | **1.09** (0.72–1.71) |
| USA | **1.21** (0.60–1.95) | **1.01** (0.48–1.60) | **1.24** (0.54–4.44) | **1.03** (0.27–2.04) | **1.17** (0.65–1.99) | **0.99** (0.66–1.55) |
| KAZ | **1.11** (0.55–1.79) | **1.15** (0.55–1.82) | **0.77** (0.33–3.09) | **0.69** (0.33–1.73) | **1.23** (0.69–2.10) | **1.32** (0.87–2.07) |
| ARE | **1.32** (0.44–2.29) | **1.30** (0.45–3.17) | **1.03** (0.45–4.14) | **1.24** (0.60–3.10) | **1.16** (0.59–2.07) | **1.21** (0.79–1.88) |
| HUN | **0.97** (0.48–1.57) | **0.99** (0.47–1.57) | **1.09** (0.47–3.89) | **1.20** (0.31–2.37) | **1.15** (0.58–2.05) | **1.29** (0.85–2.76) |
| BRA | **1.38** (0.46–2.40) | **0.93** (0.45–1.48) | **1.60** (0.74–7.84) | **1.45** (0.70–3.63) | **1.18** (0.60–2.11) | **0.88** (0.58–1.89) |

Base, 2018-2021 average, EUR bn nominal:

| Country | to_rus | from_rus | buy_ukr | sell_ukr | svc_bought | svc_sold |
|---|---|---|---|---|---|---|
| CHN | 55.67 | 46.52 | 5.38 | 6.61 | 4.23 | 2.55 |
| IND | 5.97 | 2.40 | 1.96 | 0.39 | 0.87 | 0.78 |
| TUR | 19.99 | 3.91 | 2.71 | 1.91 | 0.97 | 4.18 |
| DEU | 21.83 | 26.14 | 2.81 | 4.91 | 2.77 | 3.94 |
| USA | 20.13 | 5.12 | 1.33 | 1.99 | 2.66 | 4.18 |
| KAZ | 12.73 | 4.96 | 0.28 | 0.58 | 1.65 | 1.01 |
| ARE | 2.29 | 0.91 | 0.52 | 0.17 | 0.97 | 1.26 |
| HUN | 3.44 | 1.69 | 1.55 | 2.22 | 0.22 | 0.26 |
| BRA | 3.63 | 1.38 | 0.10 | 0.13 | 0.18 | 0.19 |

(DEU, HUN and TUR `to_rus` are customs-recorded imports without pipeline gas.)

**Changes against the current trend multipliers (2026):**
- **China, imports from Russia:** ×1.09 instead of ×1.41. In real terms, 2021 was only 9% above the 2018-2021 average, and the back-test does not support carrying China's 2012-2021 growth forward. More of China's 2022-2026 rise therefore counts as war-related.
- **Value-weighted 2026 central** over all partners: imports from Russia ×1.07 (current trend recomputed on the same base: ×1.18), exports to Russia ×1.07 (×1.22), Ukraine flows ×1.13-1.18 (×1.28-1.35), services ×1.18 (×1.21-1.38).
- **USA, exports to Russia:** ×1.01 instead of ×0.76. **Brazil, exports to Russia:** ×0.93 instead of ×0.72. The pre-war decline is no longer extrapolated, because the 2021 level had stabilised.
- **Services sold:** TUR ×1.25, ARE ×1.21, HUN ×1.29, KAZ ×1.32. These sit well below the trend-plus-rebound values in `trend2.json` (ARE ×2.00, HUN ×2.12), which carried strong post-2016 travel trends forward.

## 8. Caveats

- **Only two origins.** Errors within an origin are correlated through common shocks (2009, the 2014-2016 oil crash), so the effective sample is much smaller than the n shown.
- **Ukraine flows have one origin**, a boom (2004-2007 → 2008-2013). Their fitted weights are cross-validated across countries, not across time.
- **The 2021 level is a single year.**
  - Reporting breaks are repaired only when isolated and confirmed by the partner's report.
  - The 2021 commodity-price surge in Ukraine's exports (grain, oils, steel) is only partly removed by the generic non-fuel deflator, so `buy_ukr` levels may be overstated in real terms.
  - Fuel prices are removed by the fuel-mix deflator.
- **Services:**
  - The 2021 level of travel is replaced by 2019 and recovers at the UNWTO pace.
  - Egypt `svc_sold` keeps the policy-level treatment from `trend2.json`: the flight ban ran Nov 2015 to Aug 2021, and the travel level is the geometric mean of 2021 annualised and 2012-2014. Result: ×7.6 (5.0-16.2) on a small base.
  - BaTiS balanced values for non-reporters are model estimates.
- **Inputs not re-verified in this session:**
  - The April 2008 WEO has country GDP but no country trade volumes. The CIS aggregate (2008-2009) was used, extended with GDP growth × the trade/GDP growth ratio.
  - The WEO numbers come from the DBnomics mirror, not from imf.org.
- **The `holt` and `share` choices are near-ties with `flat_last`.** If the map should use one rule throughout, use `flat_last`: the 2021 real level relative to the 2018-2021 average, for goods directly and for services after the travel adjustment. It can be recomputed from the scripts.
