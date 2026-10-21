# Expected without the war: the counterfactual models

Every trade number on the map is a change against what a country would have bought from or sold to Russia and Ukraine **if there had been no war**. That expected level cannot be observed, so it has to be predicted. This page explains what the map predicts, which models were tried (four generations, 16 models in the last one), how they were tested on past years, which model is used for which flow and why, how the prediction's own error widens the map's ranges, and what changed in the headline numbers. The short version: for most flows the best prediction turned out to be "2021 held flat"; only exports to Russia (and, on weaker evidence, trade with Ukraine) are predicted better by a model that uses the country's trade with everyone else and its GDP.

Main files: [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json) with its notes [`counterfactual-notes.md`](../../research/2026-10/gaps/counterfactual-notes.md), applied by [build_data.py `counterfactual()`](../../pipeline/build_data.py), and used on the site by `triple()` and `spread()` in [`site/index.html`](../../site/index.html).

## 1. What "expected without the war" means

For one flow (say, Germany's exports to Russia) and one year *i* from 2022 to 2026, the map compares

```
expected_i = base × FRAC_i × bmul_i          (volume at pre-war prices)
actual_i   = value_i / pidx_i                (the year's money, divided by its price level)
change_i   = expected_i − actual_i           (positive = less than expected)
```

- `base` is the pre-war level at pre-war prices. For the flows covered by `counterfactual.json` it is **the 2021 value divided by the 2021 price level** (`years[0] / pidx[0]`); for small purchases from Russia (under EUR 1bn a year) it is the median of 2019, 2020 and 2021 at pre-war prices ([small flows](#small-flows-start-from-the-2019-to-2021-median-round-16-corrected-in-16b)), with 2021 alone kept as `base_2021`. For flows not covered (company taxes, shipping, laundered oil) see [section 6](#6-which-model-is-used-for-which-flow).
- `FRAC_i` is 1 for full years and 8/12 for 2026 (January–August).
- `bmul_i` is the counterfactual multiplier against the base (1 = flat), with `bmul_lo` and `bmul_hi` as its 90% interval.
- `pidx_i` is the flow's price level against 2019–2021 (see [prices.md](prices.md)).

The changes are summed over 2022 up to the chosen year and divided by one year's GDP (see [overview.md](overview.md)). The code is `exV`, `actV` and `spread()` inside `calc()` in [`site/index.html`](../../site/index.html).

A good counterfactual must not use anything the war caused. That rules out, for example, Russia's own trade with China or India after 2022, or realised 2022 energy prices. Section 8 lists what was rejected for that reason.

## 2. History: four generations

| generation | file and notes | idea | status |
|---|---|---|---|
| 1. Flat average | none (in `trade_full.json` baselines) | expected = the 2019–2021 average at pre-war prices, every year | rounds 1–3; still the starting `base` before `counterfactual()` runs |
| 2. Damped trends | [`trend.json`](../../research/2026-10/gaps/trend.json) ([notes](../../research/2026-10/gaps/trend-notes.md)), [`trend2.json`](../../research/2026-10/gaps/trend2.json) ([notes](../../research/2026-10/gaps/trend2-notes.md)) | each country's own 2012–2021 real trend, continued with a 3-year half-life and capped at ±10% a year (multiplier 0.68–1.41 by 2026); services, company taxes and shipping in `trend2.json` | round 3; applied by [build_data.py `pre_war_trends()`](../../pipeline/build_data.py); now used only for company taxes, shipping and flows without a counterfactual |
| 3. Back-tested methods | [`trend3.json`](../../research/2026-10/gaps/trend3.json) ([notes](../../research/2026-10/gaps/trend3-notes.md)) | nine methods scored on 2008 and 2013 origins against the flat average; **the random walk (2021 held flat) won** | research only, never wired into the pipeline; it set up generation 4 |
| 4. Nowcasts with realised non-war predictors | [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json) ([notes](../../research/2026-10/gaps/counterfactual-notes.md)) | 16 models scored on 2008, 2013 and 2016 origins against the random walk; a model replaces "2021 flat" only if it clearly wins | round 4; applied by [build_data.py `counterfactual()`](../../pipeline/build_data.py) |

**Why the flat average was dropped.** It is biased low: trade usually grows, so a 2019–2021 average predicts too little, and every fall looks larger than it was. In the trend3 back-test it had a median bias of +0.21 log (actual above predicted) and lost to the random walk by 22–31% on median absolute log error over 1–5 years ahead.

**Why the damped trends were dropped for trade.** The generation-2 back-test (fits on 2002–2007, scored on 2008 and 2010–2013, 291 flows above EUR 50 m) favoured damping over both flat and undamped trends:

| rule (trend.json back-test) | median abs. log error | median bias |
|---|---|---|
| flat baseline | 0.406 | +0.27 |
| undamped trend | 0.771 | −0.62 |
| undamped, capped ±10% | 0.360 | −0.08 |
| half-life 2 years, cap ±10% | 0.311 | +0.09 |
| **half-life 3 years, cap ±10% (chosen)** | **0.318** | **+0.05** |
| half-life 5 years, cap ±10% | 0.328 | +0.02 |

But that test covered a single boom period. The trend3 back-test, with two origins, showed the trend adds error for Russia flows and services, and the second audit ([audit2-notes.md](../../research/2026-10/gaps/audit2-notes.md), question 5) found 68 "reliable" trends fitted on 2016–2021 only, which measured the rebound from the 2014–2016 crash (Kazakhstan's imports from Russia were projected to grow 9.4% a year; the full window gives 0.8%). The ranges were also far too narrow: published bands of about ×1.5 (high/low in 2026) against ×8.3 for an honest back-tested interval.

**What generation 3 found** (1–5 years ahead, median absolute log error):

| flow | flat | trend | share | gravity | ensemble | **flat_last (random walk)** | holt |
|---|---|---|---|---|---|---|---|
| to_rus | 0.41 | 0.39 | 0.39 | 0.39 | 0.36 | **0.32** | 0.33 |
| from_rus | 0.43 | 0.34 | 0.46 | 0.42 | 0.33 | **0.30** | 0.43 |
| buy_ukr | 0.49 | 0.41 | 0.41 | 0.44 | 0.39 | 0.39 | **0.38** |
| sell_ukr | 0.45 | 0.36 | 0.65 | 0.52 | 0.36 | **0.35** | 0.35 |
| svc_bought | 0.27 | 0.26 | **0.18** | 0.21 | 0.22 | 0.20 | 0.20 |
| svc_sold | 0.29 | 0.28 | 0.28 | 0.25 | 0.24 | **0.20** | 0.22 |

The models that extrapolate growth (trend, share, gravity) win one origin and lose the other; only the random walk was good in both. Generation 4 therefore made the random walk the benchmark to beat.

## 3. The 16 models of generation 4

All predict the log real level of a flow in year *t* from data up to the origin year *L*. "Realised predictors" (the country's trade with others, GDP) for year *t* are allowed, because they will be known for 2022–2026 too.

| key | model | eligible |
|---|---|---|
| `rw` | random walk: the year-L level held flat (2021 for the map) | benchmark |
| `sh_last` | the flow's share of the country's same-direction trade with the rest of the world, held at year L, × realised rest-of-world trade | yes |
| `sh_avg` | the same with the 4-year average share | yes |
| `sh_fuel` | shares held separately for fuel (HS 27) and non-fuel | yes |
| `sh_hs` | share held per HS chapter (24 chapters + rest; 60 largest partners) | yes |
| `elastic` | pooled elasticity of the flow to real rest-of-world trade | yes |
| `gdp` | year-L level × realised real GDP growth | yes |
| `vol` | year-L level × realised import or export volume growth | yes |
| `lin` | pooled robust (Huber) linear model on 14 features: rest-of-world trade growth (real, nominal, fuel, non-fuel), GDP and volume growth, oil, metals, fertiliser and grain prices, 1- and 3-year momentum, UN voting distance and drift, horizon | yes |
| `rf` | random forest on 25 features (the above plus more prices, share, size, flow type, EU and sanctioning-country flags, price-index change) | yes |
| `gbm` | gradient-boosted trees, absolute-error loss, same 25 features | yes |
| `gbm_xo` | as `gbm`, also trained on years after the test window | no (diagnostic) |
| `hub_donor` | year-L level × Russia's (or Ukraine's) realised trade with non-sanctioning countries | no |
| `hub_all` | the same with all other partners | no |
| `elastic_hub`, `gbm_hub` | `elastic` and `gbm` with the hub-side growth added | no |

The hub-side models are not eligible: their 2022–2026 inputs are Russia's trade after the invasion, which is the war outcome itself.

## 4. The three back-tests, and why 2013 matters

| test | data to | years predicted (ahead) | left out |
|---|---|---|---|
| T2008 | 2007 | 2008–2012 (1–5) | nothing |
| T2013 | 2012 | 2013, 2016, 2017 (1, 4, 5) | 2014–2015 (Crimea, Donbas, sanctions); all Ukraine flows |
| T2016 | 2016 | 2017–2019, 2021 (1–3, 5) | 2020 (COVID); services also 2021 |

Sample: country-flows with a base of at least EUR 10 m, 6,385 country-flow-years in all, in size classes S (< EUR 0.1 bn), M (0.1–1 bn) and L (> 1 bn).

**Why the 2013 test is the hard one.** In 2014–2016 the shock came from Russia itself: the oil price halved, the rouble lost half its value and Russia banned EU food. Predictors from the partner's side (its trade with others, its GDP) cannot see such a shock. Only Russia-side predictors helped there, and those cannot be used for 2022–2026. So the 2013 test is the best available warning of how wrong a partner-side counterfactual can be when Russia's own economy moves. Ukraine flows are left out of the 2013 test because post-2014 Ukrainian trade is itself a war outcome.

## 5. Results and the decision rule

**Decision rule** (fixed before the results): per flow type, the eligible model with the lowest mean median absolute log error over 1–5 years ahead is used only if it beats the random walk by at least 15% in every test, or by at least 15% on average with no test worse. Otherwise the random walk is used.

**Gain against the random walk** (1 − MAE/MAE_rw), T2008 / T2013 / T2016:

| flow | sh_last | sh_hs | gdp | vol | lin | rf | gbm | hub_all (not eligible) |
|---|---|---|---|---|---|---|---|---|
| to_rus | −1 / −30 / −2% | +1 / +4 / +11% | +5 / +6 / +9% | +2 / −5 / +16% | −2 / −15 / +19% | +2 / −10 / +17% | +2 / −7 / +21% | −2 / −4 / +19% |
| from_rus | +21 / −24 / +25% | +16 / −30 / +22% | +8 / −18 / +19% | +11 / −20 / +21% | **+20 / +11 / +22%** | +19 / −2 / +31% | +15 / −10 / +26% | +18 / +26 / +29% |
| buy_ukr | +4 / – / +21% | 0 / – / 0% | +7 / – / +11% | +6 / – / +18% | **+8 / – / +28%** | +1 / – / +29% | +7 / – / +27% | +12 / – / +30% |
| sell_ukr | +11 / – / +34% | 0 / – / 0% | +7 / – / +18% | +6 / – / +26% | −2 / – / +47% | **+9 / – / +40%** | −7 / – / +45% | +27 / – / +54% |
| svc_bought | +6 / −24 / +23% | 0 / 0 / 0% | +12 / −15 / +22% | +13 / −21 / +26% | +27 / −7 / +29% | −8 / −19 / +28% | +11 / −4 / +27% | +32 / −4 / +28% |
| svc_sold | +26 / −17 / +29% | 0 / 0 / 0% | +18 / −7 / +22% | +14 / −25 / +30% | +35 / −0 / +17% | +4 / −10 / +25% | +16 / −14 / +14% | +40 / +6 / +27% |

Median absolute log error of the random walk and the chosen (or best) model, all sizes:

| flow | T2008 rw → model | T2013 rw → model | T2016 rw → model |
|---|---|---|---|
| to_rus (gdp, not chosen) | 0.308 → 0.294 | 0.355 → 0.335 | 0.306 → 0.280 |
| from_rus (lin) | 0.292 → 0.234 | 0.303 → 0.269 | 0.254 → 0.199 |
| buy_ukr (lin) | 0.394 → 0.361 | – | 0.432 → 0.310 |
| sell_ukr (rf) | 0.345 → 0.314 | – | 0.369 → 0.221 |
| svc_bought (lin, not chosen) | 0.179 → 0.132 | 0.222 → 0.238 | 0.190 → 0.134 |
| svc_sold (lin, not chosen) | 0.199 → 0.130 | 0.213 → 0.214 | 0.178 → 0.147 |

The full tables for all 16 models, by size class, with bias, a bootstrap check and a COVID sensitivity run are in [counterfactual-notes.md §4](../../research/2026-10/gaps/counterfactual-notes.md) and under `backtest`, `backtest_by_size`, `bootstrap_gain_90` and `backtest_incl_covid_T2016` in [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json).

**Outcome** (`chosen` in the JSON):

| flow | chosen | mean gain (by test) | note |
|---|---|---|---|
| to_rus (bought from Russia) | `rw` | – | best alternative `gdp` +6% (5/6/9%), below the bar |
| from_rus (sold to Russia) | `lin` | **+17.7%** (20/11/22%) | bootstrap interval above zero in all three tests |
| buy_ukr (bought from Ukraine) | `lin` | **+18.2%** (8/28%) | two tests only; 2008 interval includes zero |
| sell_ukr (sold to Ukraine) | `rf` | **+24.6%** (9/40%) | two tests only; lost for large flows in 2008 |
| buy_ukr, sell_ukr (round 6) | `rw` | 13 rolling origins: `lin` +4% (worse at 2 of 10), `rf` +6% (worse at 4 of 10) with the map's inputs; see section 7 |
| svc_bought, svc_sold | `rw` + travel recovery | – | `lin` wins 2008 and 2016 but is 0–7% worse in 2013 |

## 6. Which model is used for which flow

| flow on the map | expected level | why |
|---|---|---|
| Sold to Russia (`from_rus`) | linear nowcast (`lin`) | clear win in all three tests, about 18% more accurate. Growth in exports to everyone else carries over (coefficient 0.51), spikes fade (momentum −0.16 and −0.28), higher pre-war oil-price paths lift Russia's import capacity |
| Bought from / sold to Ukraine (`buy_ukr`, `sell_ukr`) | 2021 held flat (round 6; `lin` / random forest before) | with more back-tests neither model passes the rule; see below |
| Bought from Russia (`to_rus`) | 2021 held flat | what a country buys from Russia depends on Russian supply and prices, which partner-side data cannot see |
| Services (`svc_bought`, `svc_sold`) | 2021 held flat + travel recovery | 2021 was a COVID year for travel; the 2021 shortfall against 2019 closes at the UNWTO world pace (49% of the gap open in 2022, 17% in 2023, 1% in 2024, closed from 2025). The recovery is sized on the model's own 2021 level: where the map's 2021 is higher (its source shows little COVID dip), `counterfactual()` caps the expected level at the model's recovered level in euros (`eur_bn_at_2018_2021_prices`), so the recovery is not applied twice (Montenegro: +10.8% → +5.4% of GDP) |
| Re-export hubs and Belarus (ARM, GEO, KAZ, KGZ, UZB, TUR, AZE, MNG, TJK, SRB, ARE, BLR) | 2021 held flat | their trade with the rest of the world was itself reshaped by goods passing through to Russia (`HUBS_CF` in build_data.py) |
| Company taxes | `trend2.json` trend on a 2018–2021 base | not covered by the back-test; see [services-shipping-companies.md](services-shipping-companies.md) |
| Shipping | `trend2.json` Russian seaborne export volumes (+3.9% a year) | not covered by the back-test |
| Laundered oil | pre-war level 2018–2021 × its pre-war growth ([`round4a.json`](../../research/2026-10/gaps/round4a.json)) | see [energy-and-laundered-oil.md](energy-and-laundered-oil.md) |
| Countries missing from `counterfactual.json` | `trend.json` / `trend2.json` from `pre_war_trends()`, with the audit-2 window fixes | fallback |

Four adjustments keep war effects out of the model inputs for 2022–2026 ([notes §5](../../research/2026-10/gaps/counterfactual-notes.md)):

1. **Commodity prices** follow the IMF World Economic Outlook of October 2021 (the last pre-war forecast), not realised prices. Realised 2022 oil alone would add about +0.1 log to exports to Russia.
2. **Sourcing switches.** The model is run with rest-of-world trade both excluding and including Russia, Ukraine and Belarus; the central is midway and the range covers both (median difference 0.002 log, at most about 0.1 for the Baltic states, Moldova and Georgia).
3. **Hubs and Belarus** keep the 2021 level (above).
4. **Missing years.** 2026 has no annual partner data; the last available real multiplier is carried forward.

In `data.json` every covered flow carries `cf` (`lin`, `rf` or `rw`): the method `counterfactual.json` used for that country and flow. Flows held at 2021 for lack of rest-of-world data, and the trade hubs, are `rw`.

## 7. How the prediction's error enters the ranges

The multipliers carry the back-tested 90% interval, so the expected path is never treated as exact.

- **Construction** ([notes §7](../../research/2026-10/gaps/counterfactual-notes.md)): back-test errors (actual − predicted) of the chosen model are pooled over the three tests, divided by a horizon scale g(h) ∝ h^0.50 (`lin`), h^0.43 (`rf`), h^0.48 (`rw`), and their 5th, 50th and 95th percentiles taken per flow type × size class. Then `low = central × exp(q05 × g(h))` and `high = central × exp(q95 × g(h))`, widened by half the sourcing-switch difference.
- **In the pipeline**, `counterfactual()` writes `bmul`, `bmul_lo = min(low, central)` and `bmul_hi = max(high, central)` for 2022–2026 (2021 = 1); for services all three are scaled by the same cap factor as the central (section 6).
- **On the site**, `triple()` reads them as `q`, `ql`, `qh`, and `spread()` adds the trend term `ql`/`qh` in quadrature with the baseline, actual-value and price terms (see [ranges.md](ranges.md)).

Typical 2026 interval widths (median high/low, flows of at least EUR 10 m):

| flow / size | chosen | random walk |
|---|---|---|
| to_rus L | ×4.12 | ×4.11 |
| from_rus M / L | ×4.98 / ×2.82 | ×6.15 / ×3.85 |
| buy_ukr L | ×6.1 | ×6.58 |
| sell_ukr M | ×5.07 | ×6.9 |
| services M | ×3.3–3.5 | same |

**Coverage caveat.** Scored on held-out tests, the 90% intervals cover about 90% of outcomes in normal periods but only 77–79% in the 2013 test:

| model | T2008 | T2013 | T2016 |
|---|---|---|---|
| lin | 0.90 | 0.77 | 0.90 |
| rf | 0.88 | 0.79 | 0.91 |
| rw | 0.87 | 0.78 | 0.87 |

A no-war 2022–2026 with a Russian recession or boom would fall outside many intervals. This is listed in [limitations.md](../limitations.md).

### Belarus (round 5)

Belarus's imports from Russia (about EUR 18bn a year, a third crude and gas on negotiated terms) are much steadier
than the average partner's: its own 2002–2021 history gives a random-walk error of 0.11 against 0.17–0.28 for large
flows in the generic test. Its 90% band for 2026 is ×0.72–1.44 instead of ×0.47–1.91 (central still 1.00; a model on
Belarus's GDP failed the 2013 test with forecasts available at the time). Its exports to Russia keep the generic band,
which rests on far more errors. Belarus's range narrows from −79% to +51% of GDP to −58% to +19%; it still crosses
zero. [`belarus.json`](../../research/2026-10/gaps/belarus.json) ([notes](../../research/2026-10/gaps/belarus-notes.md)).

### Trade with Ukraine (round 6)

Round 4 chose a linear model for purchases from Ukraine and a random forest for sales to Ukraine on two back-tests.
Round 6 tested them on far more evidence ([`ua_trade_cf.json`](../../research/2026-10/gaps/ua_trade_cf.json),
[notes](../../research/2026-10/gaps/ua_trade_cf-notes.md)): rolling origins on Ukraine's own 2004–2021 trade, and
trade with eight analogue partners (Poland, Romania, Türkiye, Kazakhstan, Georgia, Moldova, Bulgaria, Hungary) from
IMF DOTS. Scored with the commodity-price *forecasts* the map actually feeds them (not realised prices), their gains
roughly halve (`lin` +8%, `rf` +10%) and they lose at several origins. Both flows now hold 2021 flat, with bands from
the random walk's own rolling errors and a measured cumulative band (2026 for large flows: purchases ×0.46–2.67, sales
×0.20–2.54).

A simple share model for sales to Ukraine (`sh_last`: 2021 share of the country's other exports) is 18–20% better on
average but 0.8% worse at one origin (2008), so it misses the rule by a hair; it is kept in the file as an alternative.
The effect on the map is small: Moldova +2.5 points of GDP, every other country under 0.2.

### Russia's neighbours and Moldova (round 6)

Each of Russia's neighbours was tested on its own 2005–2020 history (the counterfactual's series and Russia's mirror
report, 1–5 years ahead). An own band is used only where it is at least 10% narrower than the generic one and still
covers its held-out years:

| country, flow | 2022–2026 band of the expected total | generic band |
|---|---|---|
| Mongolia, payments to Russia | ×0.85–1.85 | ×0.61–1.74 (same width, moved up) |
| Mongolia, sales to Russia | ×0.66–2.62 | ×0.21–3.48 |
| Yemen, payments to Russia | ×0.58–2.19 | ×0.42–3.51 |
| Tajikistan, sales to Russia | ×0.41–2.59 | ×0.21–3.48 |
| Moldova, payments to Russia | ×0.85–1.44 | ×0.42–3.51 |

Kyrgyzstan, Armenia, Kazakhstan, Uzbekistan and Georgia, and Tajikistan's payments to Russia, keep the generic band:
their own history was no steadier, or too short to test.

**Moldova.** Its customs data hold the gas right-bank Moldova bought from Gazprom until December 2022. The gas research
added Transnistria's Gazprom gas in the high case. Transnistria never paid for that gas, and it ended on 1 January
2025, so it is support for Transnistria, not money to Russia. It is now left out of the baseline and the actual values
alike (also from the fossil-fuel floor used for pipeline-gas countries). The pre-war level is EUR 0.76bn at 2019–2021 prices (gas 0.25, other goods 0.51; 2019–2021 average as the low
alternative, 0.64). The expected path is 0.97 × 2021: right-bank gas at its 2019–2021 average volume. Moldova's
headline barely moves (+17.2% to +16.9% of GDP), but its range narrows from −14…+74% to +7…+35%.
[`cf_bands.json`](../../research/2026-10/gaps/cf_bands.json) ([notes](../../research/2026-10/gaps/cf_bands-notes.md)).

### Imports from Russia (round 7)

Five ways to narrow the band for "paid to Russia" were tested on back-tests
([`to_rus_cf.json`](../../research/2026-10/gaps/to_rus_cf.json),
[notes](../../research/2026-10/gaps/to_rus_cf-notes.md)): fuel and other goods modelled apart (an energy-balance model
for fuel), steady staples apart from one-off items, analogue partners, each country's own history, and the size-class
band re-measured on rolling origins 2005–2020. Only the last passed: calibrated by era (bands from two eras cover
90–94% of the third), it is a little narrower than before. Large flows 2022–2026: ×0.57–1.62 (was ×0.61–1.74);
mid-size: ×0.47–3.19 (was ×0.42–3.51). It applies to every country of those sizes without an own tested band
(Belarus, Moldova, Mongolia and Yemen keep theirs). For Armenia, Uzbekistan, Syria and Bosnia their own history
suggests the high side may be a little short (10 of 12 own windows covered). Splitting fuel from other goods did not help: the fuel part's error
is as large as the total's, and the two errors are almost uncorrelated. For Russia's neighbours as a group, the fuel
model predicts better (+26–32%) but raises the expected level by ×1.08–1.28 without narrowing the band; it is not used.

### Small flows start from the 2019 to 2021 median (round 16, corrected in 16b)

Raised by review 5 (M2), approved by the owner; corrected after check 16 (B1, N1), approved by the owner. A small flow
from Russia swings from year to year (one cargo more or less), so a single year is a noisy starting point. Cameroon's
2021 purchases from Russia (EUR 0.35bn at pre-war prices) were more than twice its 2019–2021 median (0.16bn), and the
"less paid" that followed put it above Switzerland, the US and Japan on the net.

**Rule.** Where purchases from Russia were under EUR 1bn a year in 2019–2021 (at 2019–2021 prices), the no-war path
starts from the **median** of 2019, 2020 and 2021, each at 2019–2021 prices, instead of 2021 alone; 2021 stays inside
the range (`base_range`). The median, not the mean, so that a single one-off year cannot set the level: Malta's own
customs record EUR 0.29bn of Russian fuel in 2019 and almost none after (it records hardly any of its bunker fuel), and
Israel's 2019 holds EUR 1.1bn of Russian crude while 2020–2021 hold none. 2021 is the map's own value (`years[0] /
pidx[0]`, as for every other flow); 2019 and 2020 are the yearly customs values brought to the build's adjusted level
(freight taken out, transit gas swapped for gas used, resale margins) and to 2021's price level of the flow
(`pre_price_levels()`). The three values are in `data.json` as `to_rus.base_years`, 2021 alone as `to_rus.base_2021`.
The threshold is the upper limit of the back-tests' small and medium size classes (S below EUR 0.1bn, M 0.1–1bn), the
flows whose back-tested errors are widest; the same models and bands then apply (`SMALL_FLOW_EUR_BN`, `small_flow`,
`small_flow_base()` in `build_data.py`). It is one rule, with no test on how far 2021 departs from the others, so no
country is singled out. 140 flows are under it.

**Exceptions: 2021 is kept** (2021 at 2019–2021 prices, as before round 16), each listed in `build_data.py`:

| flow | why | source |
|---|---|---|
| Brunei (`SMALL_FLOW_EXCLUDE`) | refinery opening: the Hengyi refinery at Pulau Muara Besar began operations in November 2019, so 2019 (EUR 0.6m) and 2020 are start-up years, not the pre-war level | [Brunei Ministry of Finance and Economy](https://www.business.gov.bn/mofe-expansion-of-hengyi-complex-will-be-significant-boost-to-brunei-economy/), fetched 20 October 2026 |
| New Zealand (`SMALL_FLOW_EXCLUDE`) | refinery closure: Marsden Point stopped refining on 31 March 2022 (closure voted in August 2021); its Russian crude and fuel of 2019–2020 (EUR 0.37bn and 0.22bn) fed a refinery that closed for reasons of its own, so the median would credit New Zealand for the closure | [Marsden Point Oil Refinery](https://en.wikipedia.org/wiki/Marsden_Point_Oil_Refinery), fetched 20 October 2026 |
| Syria (`SMALL_FLOW_MIRROR`) | pre-war figures are only Russia's own export reports, coded 100% as confidential (HS 99, which may include arms) in 2020 and 2021; the panel says the number is less reliable | UN Comtrade, Russia as reporter (check 16) |
| Mauritania, Botswana (`fix_artefacts()`) | the pre-war level is a single researched value (traders' origin labels; diamonds bought for resale), set as 2021 | [`round4b.json`](../../research/2026-10/gaps/round4b.json) |
| EU pipeline-gas buyers whose baseline is the 2021 fossil-fuel value | the fuel tracker's value is known from 2021 only, so there is no yearly series behind it | `PIPELINE_GAS` in `build_data.py` |

Lebanon keeps its researched pre-war level (the mean of 2018, 2020 and 2021, leaving out 2019's fuel bought for
smuggling into Syria), as in round 16. Moldova keeps its own researched baseline (below).

**What round 16 got wrong.** Round 16 took the "average" from `base` at the moment `counterfactual()` ran. For 28 flows
that field already held 2021 at 2021 prices (Brunei's refinery residual, set by `apply_brunei_r6()`, and the
single-value fixes), so the rule replaced 2021 at 2019–2021 prices with 2021 at 2021 prices: Brunei's no-war level was
inflated by exactly its 2021 oil price index (×1.35), with no averaging at all, and its payments went from +2.35% to
+5.04% of GDP. Only Brunei was material (Mauritania 0.05 points, the rest under 0.04). A properly averaged Brunei would
have been wrong the other way, because of the refinery's start-up years; hence the exception. Check 36 verifies that
every small-flow baseline is the median of its three yearly values and never equals 2021 at 2021 prices by
construction.

**Effect** (payments to Russia, % of a year's GDP; round 16 → round 16b): Brunei +5.04 → +2.35 (direction
uncertain), Malta +0.79 → +0.28, Syria −1.87 → −0.92, New Zealand +0.27 → +0.02, Israel +0.13 → −0.03, Cameroon
+0.36 → +0.19 (likely −0.12% to +1.52% on the net, direction uncertain), Latvia +3.22 → +3.07, Afghanistan −0.96 →
−0.82, Senegal −2.26 → −2.39, Tajikistan −0.76 → −0.87; all movers are in the [changelog](../changelog.md#round-16b).

### Pipeline fuel buyers (round 8)

Most of the width of "less paid to Russia" comes from not knowing what a country would have bought from Russia
without the war. That band was measured on trade values divided by price indices, over all kinds of goods. Round 8
measured fuel on **physical volumes** instead (tonnes of crude and products, terajoules of gas; Eurostat and UN
Comtrade, 2005–2021), with rolling back-tests calibrated by era as before
([`fuel_volume_cf.json`](../../research/2026-10/gaps/fuel_volume_cf.json),
[notes](../../research/2026-10/gaps/fuel_volume_cf-notes.md)):

- Buyers whose Russian fuel came mainly by **pipeline** (Druzhba crude plus pipeline gas, at least 60% of their fuel)
  had steady volumes: their 5-year fuel band is ×0.80–1.30. Seaborne fuel is as unsteady as before (×0.52–1.77), and so
  are other goods (×0.50–2.60).
- Combined by each country's fuel share, and checked against the country's own windows, seven countries get a
  narrower band for 2022–2026: Germany ×0.74–1.31 (was ×0.57–1.62), Hungary ×0.79–1.29, Slovakia ×0.84–1.29, Czechia
  ×0.79–1.48, Poland ×0.75–1.64, Finland ×0.66–1.61, North Macedonia ×0.47–1.64 (was ×0.47–3.19). The others keep
  their band: their fuel came by sea, or most of what they bought from Russia was other goods (Russia's neighbours).
- **Poland** had notified Gazprom in November 2019 that its Yamal contract would end in 2022. That decision came before
  the war, so its no-war path drops that gas from 2023 (×0.86 of 2021). Poland moves from +9.2% to +8.1% of GDP.
- Long-term contracts (Uniper, MVM, ČEZ take-or-pay) were used as checks: they all sit inside the new bands.

Effect on the total ranges (% of GDP): Germany 3.0…8.6 → 3.5…7.7, Hungary −9.8…+2.5 → −8.2…−0.1, Slovakia
−6.5…+16.0 → −3.8…+11.6, Czechia −1.4…+10.5 → −0.4…+9.6, North Macedonia −4.7…+11.4 → −4.7…+4.1.

### Power of Siberia (round 15)

Review 4 (M2), approved by the owner. China's imports from Russia keep 2021 flat (`cf: "rw"`), but the Power of Siberia pipeline was agreed in 2014 (a 30-year CNPC–Gazprom contract with a 38 bcm a year plateau) and has flowed since December 2019, so its ramp-up was expected without the war. China's no-war path now includes the **contracted** volume above the 2021 level (10.39 bcm): 15.4 bcm in 2022 (the actual delivery: the 2022 contractual quantity was not found, not verified), 22.0 in 2023 (Gazprom said the 22.7 delivered was 0.7 bcm above its obligation), 30.0 in 2024 (the initial plan; 31.12 delivered; the plan figure is from a search summary of an Interfax report, not verified), and the 38 bcm plateau in 2025 (38.84 delivered) and 2026 ([`power_of_siberia_r15.json`](../../research/2026-10/gaps/power_of_siberia_r15.json), with Interfax, TASS and Reuters sources). Only deliveries beyond that path, and the 44 bcm a year agreed in autumn 2025, count as war-driven. The extra volume is added to China's expected path at 2019–2021 prices (its pipeline-gas unit value, 15.2 EUR/MWh) before the no-war fuel price is applied (`power_of_siberia()` in `build_data.py`). Effect: China's kept from Russia −0.66% → −0.62%<!-- n:CHN.rus --> (the review estimated about −0.60%; the contracted path leaves out the deliveries above contract). TurkStream deliveries contracted in 2020–2021, which the review also named, are not yet treated this way.

### Deliberate choices

- **Actual figures as inputs.** The models use each country's actual 2022–2026 GDP and trade with others, although the war affected them too. The map asks how far a country went out of its way: if its economy shrank because of the war, it would have traded less with Russia anyway, and that is not a choice to credit or blame. (Decided in round 5; pre-war forecasts were considered and rejected.)
- **90% ranges as tested.** The ranges cover about 90% in normal periods (2008, 2016 tests) and 77–79% when the shock comes from Russia's side (2013 test). They are not widened for Russia-side shocks: the map already uses a real prediction instead of a flat 2021 level, and stretching every range for a rare shock would blur the result more than it adds honesty. (Decided in round 5.)

## 8. What was tried and rejected

| idea | result | why rejected |
|---|---|---|
| Flat 2019–2021 average (gen. 1) | biased low (+0.21), 22–31% worse than the random walk | replaced |
| Damped own trends (gen. 2) | helped only for Ukraine flows; window problems (2016–2021 rebounds) | replaced for trade and services |
| Share, gravity, shrinkage, ensemble, Holt (gen. 3) | share and gravity biased strongly downward for Russia flows (−0.6 to −0.8); none beat the random walk by the bar | rejected |
| Machine learning (`rf`, `gbm`, `gbm_xo`) | about as good as `lin` in 2016, worse in the other tests; `gbm_xo` (more history) best for `to_rus` at +10%, still below the bar | only `rf` for `sell_ukr` passes |
| Product detail (`sh_hs`, `sh_fuel`) | no better than total-trade shares; worse in 2013 (`sh_hs` +1/+4/+11% for `to_rus`) | rejected |
| UN voting distance (feature in `lin`, `rf`) | −0.03 per unit; one standard deviation moves the prediction by −0.015 | kept as a feature, negligible |
| Russia-side hub models (`hub_donor`, `hub_all`, `elastic_hub`, `gbm_hub`) | the only predictors that helped in every test (+18–40%) | inputs for 2022–2026 are the war outcome |
| Realised commodity prices | would put part of the 2022 price shock into the "no-war" path | replaced by the IMF WEO October 2021 path |

## 9. Effect on the headline numbers

Middle values change little; ranges become about 1.5–2 times wider. Shift toward Ukraine, 2022–August 2026, % of one year's GDP. "Before" is a build of the committed round-4 code with `counterfactual()` switched off (so `trend.json` / `trend2.json` and the audit-2 window fixes apply). "Round 4 (historical)" is the round-4 build with the counterfactual switched on and the round-4 review fixes (windfall from yearly fuel shares, services cap, UAE customs order and others, see the [research log](../../research/2026-10/README.md)). Both were computed with the site's own `calc()`. They show the counterfactual's own effect at the time. The round-11 column is that build, and the last column the current one, for comparison. It also holds every later change: the money rule (round 6), no-war prices (round 7), the net-gain rule (round 10) and the round-11 data, so the gap between the last two columns is not the counterfactual's effect.

| country | before (trend.json / trend2.json) | round 4 (historical, counterfactual.json) | round 11 build | current build (round 15, the net) |
|---|---|---|---|---|
| Germany | +4.9% (3.9 to 6.2) | +4.8% (3.1 to 7.3) | +3.7% (2.5 to 5.2) | +3.22%<!-- n:DEU.net --> |
| China | −1.2% (−1.8 to −0.7) | −1.6% (−2.4 to −0.5) | −1.6% (−2.3 to −0.9) | −0.62%<!-- n:CHN.net --> |
| Hungary | −5.7% (−8.1 to −3.1) | −6.7% (−10.4 to −1.7) | −4.1% (−6.4 to −1.4) | −5.77%<!-- n:HUN.net --> |
| Poland | +9.5% (7.7 to 12.2) | +10.0% (5.9 to 15.5) | +4.1% (2.2 to 7.0) | +4.39%<!-- n:POL.net --> |

Round 15 divides by the average 2022–2024 GDP; the earlier columns divide by 2024 GDP.

The round-4 log in [`research/2026-10/README.md`](../../research/2026-10/README.md) gives the counterfactual's own effect as Germany +4.8% → +4.7%, China −1.1% → −1.6%, Hungary −5.6% → −6.7%; the small differences to the table come from the review fixes made afterwards.

The widest case is Belarus. In round 4 it was −24% of GDP with a range of −76% to +49%. In the round-11 build it was −17.6% with a range of −38.6% to +3.6% (round 15: −2.78%<!-- n:BLR.net -->, range −10.90%<!-- n:BLR.netLo --> to +8.13%<!-- n:BLR.netHi -->, after the one valuation rule, the customs basis for what it bought and the average-GDP denominator). Its 2021 imports from Russia (about EUR 18bn a year) are held flat, and the honest random-walk error on a flow that large is still wide enough to cross zero ([limitations.md](../limitations.md)).

## See also

- [ranges.md](ranges.md): how the multiplier's interval combines with the other uncertainties
- [prices.md](prices.md): the price levels that turn values into volumes
- [trade.md](trade.md): the goods-trade series the counterfactual is applied to
- [services-shipping-companies.md](services-shipping-companies.md): the flows that still use `trend2.json`
- Research notes: [trend-notes.md](../../research/2026-10/gaps/trend-notes.md), [trend2-notes.md](../../research/2026-10/gaps/trend2-notes.md), [trend3-notes.md](../../research/2026-10/gaps/trend3-notes.md), [counterfactual-notes.md](../../research/2026-10/gaps/counterfactual-notes.md), [audit2-notes.md](../../research/2026-10/gaps/audit2-notes.md) (question 5)
- Code: [build_data.py `counterfactual()` and `pre_war_trends()`](../../pipeline/build_data.py), `triple()` and `calc()` in [site/index.html](../../site/index.html)
- [Documentation index](../README.md)
