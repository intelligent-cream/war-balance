# No-war counterfactual, version 4: nowcasting with realised non-war predictors

Data file: `research/2026-10/gaps/counterfactual.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes. The steps were: downloads; inputs; models, three back-tests and the 2022-2026 predictions; tables, decision and bootstrap; intervals and per-country output; the JSON. The bilateral series, deflators and IMF WEO vintages are those of `trend3.json` (see `trend3-notes.md`).

## Summary

- **The idea works for one flow type.** It is to predict each flow from what really happened in 2022-2026 to things the war did not directly cause: the country's trade with everyone else, its GDP, and commodity prices.
  - **Exports to Russia (`from_rus`):** a pooled linear nowcast beats the 2021 level (random walk) in all three back-tests. The gains are 20%, 11% and 22% (mean 17.7%), and the clustered bootstrap keeps all three above zero.
  - It also clearly beats the random walk for large flows: median error 0.16 against 0.22, 0.21 against 0.28, and 0.10 against 0.22.
- **Ukraine flows also pass the rule, on weaker evidence.**
  - `buy_ukr`: linear nowcast, +18%.
  - `sell_ukr`: random forest, +25%.
  - Only two tests count, because the 2013 origin is excluded for Ukraine. The gain in the 2008 test is small (+8%, +9%), and its bootstrap interval includes zero.
  - For large flows the model lost in the 2008 test.
- **Imports from Russia (`to_rus`) and both service flows stay on the random walk.**
  - `to_rus`: nothing reaches the 15% bar. The best is the country's realised GDP growth applied to the 2021 level, +5%, +6% and +9% in the three tests: consistent but small.
  - Services: the linear nowcast gains 27-35% in the 2008 test and 17-29% in the 2016 test, but is 0-7% worse in the 2013 test.
- **Why the 2013 test is the hard one.** In 2014-2016 the shock came from Russia itself: the oil price halved, the rouble lost half its value, and Russia banned EU food imports.
  - Predictors from the partner side (its trade with others, its GDP) cannot see that. Holding the partner's share of its own trade fixed made errors 20-40% worse there.
  - The only predictors that helped in every test were on Russia's side: Russia's realised trade with all its other partners, with gains of 18-40%.
  - Those cannot be used for 2022-2026: the war reshaped all of Russia's trade, and its realised trade with China, India and Türkiye is itself the war outcome.
- **Machine learning did not beat simple models.** Gradient-boosted trees and random forests, trained only on pre-origin years, were about as good as the linear model in the 2016 test and worse in the other two.
  - A boosted-tree model also trained on later years (`gbm_xo`, not eligible) was the best for `to_rus`, at +10%, still below the bar.
- **Product detail did not help.** Shares held by HS chapter or split into fuel and non-fuel were no better than shares of total trade. They were worse in the 2013 test.
- **The intervals are honest 90% back-test intervals.** They are narrower than the random walk's where the nowcast is used:
  - `from_rus` large flows: high/low ×2.8 against ×3.9 in 2026.
  - `from_rus` mid-size: ×5.0 against ×6.2.
  - `sell_ukr` mid-size: ×5.1 against ×6.9.
  - `buy_ukr` large: ×6.1 against ×6.6.
  - Elsewhere they equal the random walk's: `to_rus` large ×4.1, services ×3.0-3.5.
- **Typical 2026 result:** central close to the 2021 level.
  - Value-weighted 2026 central against 2021: `to_rus` ×1.00, `from_rus` ×1.03, `buy_ukr` ×1.00, `sell_ukr` ×1.08.
  - Services: `svc_bought` ×1.12 and `svc_sold` ×1.31. The services rise is the 2021 travel shortfall closing.

## 1. Data

**Bilateral flows.** The same real series as `trend3.json`:
- goods 2000-2021 from UN Comtrade, each economy's own report with the partner's report filling gaps, reporting breaks repaired;
- services 2005-2021 from the OECD-WTO BaTiS balanced series.

All in EUR and deflated: imports from Russia with the fuel-mix index (without gas for the ten gas-hidden importers), other goods with the non-fuel goods index, services with euro-area services HICP. For 2022-2026 the same indices come from `energy2.json` `price_index`, linked at 2021.

**Realised predictors** (new downloads):
- **The country's trade with the rest of the world.** UN Comtrade public preview, annual 2000-2025:
  - HS TOTAL and HS 27 (fuel) by reporter;
  - partners world, Russia, Belarus, and Ukraine (Ukraine for 2022-2025; earlier from the `trend` downloads);
  - both directions.
  - "Rest of world" means world minus Russia, Ukraine and Belarus.
  - Coverage: about 170-180 reporters a year up to 2023, 147 in 2024 and 121 in 2025.
- **By HS chapter**, for the 60 largest partners on each side:
  - Russia's 24 largest export chapters in 2019 plus TOTAL, for imports from Russia;
  - Russia's 24 largest import chapters plus TOTAL, for exports to Russia;
  - partners world and Russia, 2003-2025.
- **World Bank WDI:**
  - real GDP (NY.GDP.MKTP.KD);
  - real imports and exports of goods and services (NE.IMP/NE.EXP.GNFS.KD);
  - services imports and exports in USD (BM/BX.GSR.NFSV.CD), the "rest of world" for the service flows after subtracting the BaTiS flow with Russia;
  - 2000-2025.
- **Commodity prices:** World Bank Pink Sheet annual (crude oil average, European gas, Australian coal, and the base metals, fertiliser, grains, food and non-energy indices), converted to EUR.
- **Political alignment:** Bailey-Strezhnev-Voeten UN General Assembly ideal points (Harvard Dataverse, June 2024 release). Features are the distance to Russia (Ukraine) at the last pre-origin year and its change over the previous five years. Post-origin values are never used.
- **For the 2022-2026 commodity features only:** the IMF WEO October 2021 (pre-war) oil, energy and non-fuel price paths. See section 5.

## 2. Models

All models predict the log real level of the flow in year t, made at origin L (the last data year). The realised predictors for year t are allowed, as they will be for 2022-2026.

| key | model |
|---|---|
| `rw` | random walk: the year-L level held flat (2021 for the counterfactual) |
| `sh_last` | the flow's share of the country's same-direction trade with the rest of the world held at its year-L level, × realised rest-of-world trade |
| `sh_avg` | the same with the 4-year average share (L-3 to L) |
| `sh_fuel` | imports from Russia: fuel (HS 27) and non-fuel shares held separately; other goods flows: share of non-fuel rest-of-world trade |
| `sh_hs` | share held per HS chapter (24 chapters + rest), summed (60 largest partners; others fall back to `rw`) |
| `elastic` | pooled elasticity of the flow to real rest-of-world trade, fitted on pre-origin year pairs |
| `gdp` | the year-L level × the country's realised real GDP growth |
| `vol` | the year-L level × the country's realised real import (or export) volume growth |
| `lin` | pooled robust linear model (Huber) on 14 features: real and nominal rest-of-world trade growth, its fuel and non-fuel parts, GDP and volume growth, oil, metals, fertiliser and grain prices, own momentum (1-year and 3-year), UN voting distance and drift, horizon. Fitted on pre-origin year pairs |
| `rf` | random forest on 25 features (the above plus gas, coal, food and non-energy prices, share, size, flow type, EU and sanctioning-country flags, change in the flow's price index). Fitted on pre-origin year pairs |
| `gbm` | gradient-boosted trees, absolute-error loss, same 25 features. Fitted on pre-origin year pairs |
| `gbm_xo` | as `gbm`, fitted on all year pairs outside the test window, including later years. A diagnostic of what more training history would give; not eligible |
| `hub_donor` | the year-L level × Russia's (Ukraine's) realised trade of the same type with countries that did not sanction Russia in 2022, excluding the country itself |
| `hub_all` | the same with all other partners |
| `elastic_hub`, `gbm_hub` | `elastic` and `gbm` with the hub-side growth added (and hub GDP for `gbm_hub`) |

**Pre-origin year pairs.** These are all (origin o, target t) pairs with o < t ≤ min(o+5, L):
- the flow at least EUR 10 m in o-3 to o;
- pairs spanning 2014-2015 excluded (the war);
- 27,249 pairs over 2005-2021 in all.

For the 2008 test only 1,114 pairs exist, with horizons 1-2. The machine-learning models are therefore weakest there.

**Hub-side models are tested but not eligible.** Their 2022-2026 inputs are the war outcome itself: Russia's trade with every partner was reshaped after February 2022.

## 3. Back-test design

| test | data to | targets (years ahead) | excluded |
|---|---|---|---|
| T2008 | 2007 | 2008-2012 (1-5) | none |
| T2013 | 2012 | 2013, 2016, 2017 (1, 4, 5) | 2014-2015 (Crimea, Donbas, sanctions); Ukraine flows (post-2014 Ukrainian trade is a war outcome) |
| T2016 | 2016 | 2017-2019, 2021 (1-3, 5); services 2017-2019 | 2020 (COVID); for services also 2021, when travel was still closed |

- **Sample:** country-flows with a base (L-3 to L average) of at least EUR 10 m, all base years positive and the target year positive. Russia-Ukraine bilateral flows are excluded. 6,385 country-flow-years in all.
- **Fallback:** where a model's predictor is missing (the country did not report trade with the world that year, or is outside the HS sample), that case uses the random walk. This is what production would do. Coverage is in `backtest_where_predictor_exists`.
- **Size classes** by base: S below EUR 0.1 bn, M 0.1-1 bn, L above 1 bn.
- **Decision rule** (as specified), per flow type: the eligible model with the lowest mean median absolute log error over the tests, 1-5 years ahead, is used if one of two conditions holds:
  - it beats the random walk by at least 15% in every test;
  - or by at least 15% on average, with no test worse.

  Otherwise the random walk is used.

## 4. Results

The model with the lowest error in each row, among the eligible ones, is in bold.


**T2008** (median absolute log error; bias = median actual − predicted in brackets)

| flow | n | rw | sh_last | sh_avg | sh_fuel | sh_hs | elastic | gdp | vol | lin | rf | gbm | gbm_xo | hub_donor | hub_all | elastic_hub | gbm_hub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| to_rus | 579 | 0.308 (+0.04) | 0.312 (+0.03) | 0.326 (+0.04) | 0.328 (-0.04) | 0.307 (-0.02) | 0.336 (+0.08) | **0.294 (-0.03)** | 0.302 (-0.01) | 0.316 (-0.14) | 0.304 (+0.03) | 0.303 (-0.01) | 0.282 (-0.03) | 0.316 (-0.02) | 0.313 (+0.03) | 0.340 (+0.05) | 0.331 (-0.13) |
| from_rus | 440 | 0.292 (+0.16) | 0.232 (+0.05) | 0.331 (+0.19) | **0.225 (+0.07)** | 0.245 (+0.03) | 0.258 (-0.11) | 0.269 (+0.10) | 0.261 (+0.12) | 0.234 (-0.06) | 0.237 (+0.08) | 0.247 (-0.02) | 0.247 (+0.09) | 0.243 (+0.04) | 0.240 (+0.07) | 0.220 (-0.00) | 0.263 (-0.12) |
| buy_ukr | 525 | 0.394 (+0.14) | 0.379 (+0.02) | 0.390 (-0.06) | 0.390 (+0.03) | 0.394 (+0.14) | 0.364 (+0.06) | 0.365 (+0.04) | 0.371 (+0.08) | **0.361 (-0.11)** | 0.388 (+0.05) | 0.365 (+0.00) | 0.360 (-0.02) | 0.366 (-0.16) | 0.347 (-0.09) | 0.364 (+0.07) | 0.398 (-0.13) |
| sell_ukr | 323 | 0.345 (-0.04) | **0.309 (-0.16)** | 0.324 (+0.05) | 0.315 (-0.14) | 0.345 (-0.04) | 0.401 (-0.34) | 0.321 (-0.08) | 0.326 (-0.10) | 0.354 (-0.26) | 0.314 (-0.17) | 0.370 (-0.26) | 0.328 (-0.18) | 0.259 (-0.02) | 0.254 (+0.03) | 0.273 (-0.12) | 0.421 (-0.32) |
| svc_bought | 495 | 0.179 (+0.14) | 0.169 (+0.03) | 0.165 (+0.04) | 0.179 (+0.14) | 0.179 (+0.14) | 0.179 (+0.14) | 0.157 (+0.07) | 0.155 (+0.09) | **0.132 (-0.03)** | 0.194 (-0.11) | 0.160 (-0.08) | 0.205 (+0.16) | 0.125 (-0.04) | 0.122 (-0.01) | 0.179 (+0.14) | 0.143 (-0.07) |
| svc_sold | 425 | 0.199 (+0.14) | 0.148 (+0.07) | 0.161 (+0.09) | 0.199 (+0.14) | 0.199 (+0.14) | 0.199 (+0.14) | 0.164 (+0.10) | 0.172 (+0.11) | **0.130 (-0.01)** | 0.190 (-0.09) | 0.166 (-0.07) | 0.227 (+0.19) | 0.122 (-0.06) | 0.119 (-0.01) | 0.199 (+0.14) | 0.166 (-0.11) |
| ALL | 2787 | 0.273 (+0.11) | 0.241 (+0.03) | 0.271 (+0.06) | 0.254 (+0.06) | 0.265 (+0.09) | 0.267 (+0.05) | 0.246 (+0.05) | 0.246 (+0.07) | **0.232 (-0.07)** | 0.254 (-0.04) | 0.246 (-0.06) | 0.264 (+0.08) | 0.224 (-0.05) | 0.214 (-0.00) | 0.253 (+0.07) | 0.260 (-0.12) |

**T2013** (median absolute log error; bias = median actual − predicted in brackets)

| flow | n | rw | sh_last | sh_avg | sh_fuel | sh_hs | elastic | gdp | vol | lin | rf | gbm | gbm_xo | hub_donor | hub_all | elastic_hub | gbm_hub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| to_rus | 384 | 0.355 (+0.07) | 0.460 (-0.11) | 0.447 (-0.02) | 0.363 (-0.02) | 0.340 (+0.08) | 0.416 (-0.08) | **0.335 (+0.01)** | 0.374 (-0.00) | 0.406 (+0.14) | 0.391 (+0.13) | 0.380 (+0.09) | 0.351 (+0.11) | 0.401 (-0.01) | 0.368 (+0.05) | 0.430 (-0.06) | 0.358 (+0.06) |
| from_rus | 291 | 0.303 (-0.14) | 0.377 (-0.19) | 0.313 (-0.12) | 0.375 (-0.22) | 0.394 (-0.20) | 0.380 (-0.25) | 0.357 (-0.26) | 0.365 (-0.25) | **0.269 (+0.03)** | 0.310 (-0.09) | 0.334 (-0.16) | 0.296 (-0.11) | 0.277 (-0.12) | 0.225 (+0.02) | 0.307 (-0.15) | 0.339 (-0.18) |
| svc_bought | 312 | **0.222 (-0.09)** | 0.276 (-0.18) | 0.302 (-0.17) | 0.222 (-0.09) | 0.222 (-0.09) | 0.260 (-0.16) | 0.256 (-0.17) | 0.270 (-0.16) | 0.238 (-0.00) | 0.264 (-0.07) | 0.232 (-0.06) | 0.234 (-0.03) | 0.247 (-0.14) | 0.232 (-0.06) | 0.228 (-0.11) | 0.254 (-0.13) |
| svc_sold | 300 | **0.213 (-0.04)** | 0.250 (-0.16) | 0.268 (-0.11) | 0.213 (-0.04) | 0.213 (-0.04) | 0.259 (-0.19) | 0.227 (-0.12) | 0.266 (-0.11) | 0.214 (+0.06) | 0.234 (-0.02) | 0.241 (-0.03) | 0.217 (+0.02) | 0.215 (-0.00) | 0.199 (-0.03) | 0.195 (-0.02) | 0.210 (-0.09) |
| ALL | 1287 | **0.270 (-0.04)** | 0.327 (-0.15) | 0.325 (-0.11) | 0.281 (-0.08) | 0.282 (-0.06) | 0.313 (-0.16) | 0.295 (-0.13) | 0.304 (-0.11) | 0.273 (+0.06) | 0.288 (-0.01) | 0.289 (-0.03) | 0.266 (+0.00) | 0.277 (-0.08) | 0.254 (-0.01) | 0.263 (-0.08) | 0.283 (-0.08) |

**T2016** (median absolute log error; bias = median actual − predicted in brackets)

| flow | n | rw | sh_last | sh_avg | sh_fuel | sh_hs | elastic | gdp | vol | lin | rf | gbm | gbm_xo | hub_donor | hub_all | elastic_hub | gbm_hub |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| to_rus | 547 | 0.306 (+0.14) | 0.313 (+0.14) | 0.354 (-0.02) | 0.294 (+0.08) | 0.273 (+0.08) | 0.283 (+0.11) | 0.280 (+0.06) | 0.256 (+0.02) | 0.249 (+0.02) | 0.255 (+0.11) | **0.243 (+0.09)** | 0.243 (+0.09) | 0.268 (-0.07) | 0.249 (-0.03) | 0.265 (+0.08) | 0.250 (+0.08) |
| from_rus | 380 | 0.254 (+0.18) | 0.190 (+0.06) | 0.269 (-0.15) | 0.198 (+0.08) | 0.197 (+0.08) | 0.195 (-0.02) | 0.205 (+0.12) | 0.200 (+0.09) | 0.199 (-0.05) | **0.175 (+0.03)** | 0.187 (-0.06) | 0.187 (-0.06) | 0.197 (-0.07) | 0.180 (-0.03) | 0.197 (-0.03) | 0.179 (-0.03) |
| buy_ukr | 430 | 0.432 (+0.35) | 0.339 (+0.20) | 0.334 (+0.09) | 0.351 (+0.22) | 0.432 (+0.35) | 0.386 (+0.27) | 0.384 (+0.27) | 0.355 (+0.22) | 0.310 (+0.11) | **0.308 (+0.16)** | 0.315 (+0.15) | 0.315 (+0.15) | 0.317 (+0.14) | 0.304 (+0.07) | 0.366 (+0.26) | 0.301 (+0.13) |
| sell_ukr | 312 | 0.369 (+0.31) | 0.244 (+0.14) | 0.220 (+0.01) | 0.249 (+0.17) | 0.369 (+0.31) | 0.254 (+0.16) | 0.303 (+0.25) | 0.275 (+0.21) | **0.194 (+0.07)** | 0.221 (+0.11) | 0.202 (+0.06) | 0.202 (+0.06) | 0.181 (-0.04) | 0.171 (-0.02) | 0.180 (+0.04) | 0.181 (+0.03) |
| svc_bought | 333 | 0.190 (+0.12) | 0.146 (+0.04) | 0.200 (-0.08) | 0.190 (+0.12) | 0.190 (+0.12) | 0.147 (+0.05) | 0.149 (+0.07) | 0.141 (+0.04) | **0.134 (-0.09)** | 0.136 (+0.01) | 0.139 (-0.01) | 0.139 (-0.01) | 0.143 (-0.01) | 0.138 (-0.00) | 0.147 (+0.05) | 0.133 (-0.00) |
| svc_sold | 309 | 0.178 (+0.13) | 0.127 (+0.04) | 0.198 (-0.13) | 0.178 (+0.13) | 0.178 (+0.13) | 0.132 (-0.04) | 0.139 (+0.07) | **0.124 (+0.04)** | 0.147 (-0.08) | 0.134 (-0.02) | 0.152 (-0.07) | 0.152 (-0.07) | 0.186 (-0.15) | 0.129 (-0.04) | 0.143 (-0.06) | 0.130 (-0.05) |
| ALL | 2311 | 0.273 (+0.19) | 0.222 (+0.10) | 0.265 (-0.06) | 0.236 (+0.13) | 0.257 (+0.16) | 0.227 (+0.07) | 0.243 (+0.13) | 0.218 (+0.09) | **0.201 (-0.02)** | 0.206 (+0.06) | 0.204 (+0.01) | 0.204 (+0.01) | 0.211 (-0.05) | 0.192 (-0.02) | 0.212 (+0.04) | 0.194 (+0.02) |

**Gain against the random walk** (1 − MAE/MAE_rw), by test

| flow | sh_last | sh_hs | gdp | vol | lin | rf | gbm | hub_all |
|---|---|---|---|---|---|---|---|---|
| to_rus | -1% / -30% / -2% | +1% / +4% / +11% | +5% / +6% / +9% | +2% / -5% / +16% | -2% / -15% / +19% | +2% / -10% / +17% | +2% / -7% / +21% | -2% / -4% / +19% |
| from_rus | +21% / -24% / +25% | +16% / -30% / +22% | +8% / -18% / +19% | +11% / -20% / +21% | +20% / +11% / +22% | +19% / -2% / +31% | +15% / -10% / +26% | +18% / +26% / +29% |
| buy_ukr | +4% / +21% | +0% / +0% | +7% / +11% | +6% / +18% | +8% / +28% | +1% / +29% | +7% / +27% | +12% / +30% |
| sell_ukr | +11% / +34% | +0% / +0% | +7% / +18% | +6% / +26% | -2% / +47% | +9% / +40% | -7% / +45% | +27% / +54% |
| svc_bought | +6% / -24% / +23% | +0% / +0% / +0% | +12% / -15% / +22% | +13% / -21% / +26% | +27% / -7% / +29% | -8% / -19% / +28% | +11% / -4% / +27% | +32% / -4% / +28% |
| svc_sold | +26% / -17% / +29% | +0% / +0% / +0% | +18% / -7% / +22% | +14% / -25% / +30% | +35% / -0% / +17% | +4% / -10% / +25% | +16% / -14% / +14% | +40% / +6% / +27% |

**By size class** (chosen or best alternative vs rw; MAE, three tests)

| flow/size | T2008 rw → model | T2013 rw → model | T2016 rw → model |
|---|---|---|---|
| to_rus/S (gdp) | 0.51 → 0.50 (n 189) | 0.60 → 0.59 (n 108) | 0.49 → 0.48 (n 163) |
| to_rus/M (gdp) | 0.38 → 0.32 (n 210) | 0.44 → 0.41 (n 153) | 0.35 → 0.34 (n 200) |
| to_rus/L (gdp) | 0.17 → 0.16 (n 180) | 0.17 → 0.19 (n 123) | 0.20 → 0.15 (n 184) |
| from_rus/S (lin) | 0.47 → 0.40 (n 165) | 0.51 → 0.50 (n 90) | 0.38 → 0.40 (n 88) |
| from_rus/M (lin) | 0.27 → 0.19 (n 160) | 0.23 → 0.21 (n 117) | 0.26 → 0.22 (n 172) |
| from_rus/L (lin) | 0.22 → 0.16 (n 115) | 0.28 → 0.21 (n 84) | 0.22 → 0.10 (n 120) |
| buy_ukr/S (lin) | 0.58 → 0.53 (n 255) | – | 0.55 → 0.47 (n 190) |
| buy_ukr/M (lin) | 0.33 → 0.30 (n 250) | – | 0.39 → 0.23 (n 200) |
| buy_ukr/L (lin) | 0.14 → 0.21 (n 20) | – | 0.28 → 0.16 (n 40) |
| sell_ukr/S (rf) | 0.44 → 0.43 (n 143) | – | 0.48 → 0.37 (n 156) |
| sell_ukr/M (rf) | 0.32 → 0.26 (n 155) | – | 0.28 → 0.14 (n 120) |
| sell_ukr/L (rf) | 0.21 → 0.36 (n 25) | – | 0.34 → 0.16 (n 36) |
| svc_bought/S (lin) | 0.20 → 0.16 (n 285) | 0.31 → 0.32 (n 153) | 0.20 → 0.14 (n 159) |
| svc_bought/M (lin) | 0.16 → 0.10 (n 185) | 0.16 → 0.18 (n 129) | 0.19 → 0.14 (n 141) |
| svc_bought/L (lin) | 0.18 → 0.08 (n 25) | 0.13 → 0.18 (n 30) | 0.08 → 0.13 (n 33) |
| svc_sold/S (lin) | 0.20 → 0.18 (n 200) | 0.29 → 0.27 (n 135) | 0.22 → 0.14 (n 135) |
| svc_sold/M (lin) | 0.20 → 0.12 (n 170) | 0.16 → 0.18 (n 117) | 0.15 → 0.17 (n 114) |
| svc_sold/L (lin) | 0.19 → 0.08 (n 55) | 0.19 → 0.18 (n 48) | 0.16 → 0.14 (n 60) |


**Bootstrap check.** 90% interval of the gain over the random walk, resampling countries within each test:

| flow (model) | T2008 | T2013 | T2016 |
|---|---|---|---|
| from_rus (lin) | +8% to +34% | +2% to +23% | +2% to +38% |
| buy_ukr (lin) | −1% to +18% | – | +18% to +38% |
| sell_ukr (rf) | −9% to +23% | – | +28% to +47% |
| to_rus (gdp, best alternative) | −1% to +14% | −11% to +14% | +1% to +15% |
| svc_bought (lin, best alternative) | +17% to +37% | −19% to +8% | +6% to +39% |
| svc_sold (lin, best alternative) | +27% to +40% | −17% to +11% | +3% to +31% |

**COVID sensitivity.** With 2020 (and 2021 for services) included in the 2016 test, the ranking is unchanged:
- `from_rus`: rw 0.249, lin 0.200
- `buy_ukr`: 0.420 against 0.315
- `sell_ukr`: 0.387 against rf 0.267
- `to_rus`: 0.317 against lin 0.265
- services: rw about 0.21, nowcasts 0.17-0.20

## 5. Choice and the 2022-2026 counterfactual

| flow | chosen | gain vs rw (mean; by test) | best alternative if rw |
|---|---|---|---|
| to_rus | **rw** (2021 level) | – | gdp +6% (5/6/9%) |
| from_rus | **lin** | **+17.7%** (20/11/22%) | |
| buy_ukr | **lin** | **+18.2%** (8/28%) | |
| sell_ukr | **rf** | **+24.6%** (9/40%) | |
| svc_bought | **rw** + travel recovery | – | lin +16% (27/−7/29%) |
| svc_sold | **rw** + travel recovery | – | lin +17% (35/−0.5/17%) |

**Making the chosen models usable for 2022-2026.** Four adjustments keep war effects out of the inputs.

1. **Commodity prices.**
   - Realised 2022 prices were themselves raised by the war. Fed into the model, they would put part of the war's price shock into the "no-war" path; the 2022 oil price alone would add about +0.1 log to exports to Russia.
   - The commodity features for 2022-2026 therefore follow the IMF WEO October 2021 (pre-war) path: oil for oil, energy for gas and coal, non-fuel for metals, fertiliser, grains and food. They are converted at actual EUR/USD rates.
   - The back-test used realised prices, so this adds forecast error that the intervals do not contain.
2. **Sourcing switches.** The country's trade with the rest of the world excluding Russia, Ukraine and Belarus rises when it replaces Russian supplies, and falls when it switches towards Russia (as India did with oil). Total trade including Russia has the opposite problem.
   - The models were run with both inputs. The central value is midway, and the range covers both.
   - The difference is tiny for most countries: median 0.002 log, at most about 0.1 for the Baltic states, Moldova and Georgia.
3. **Re-export hubs and Belarus.** For ARM, GEO, KAZ, KGZ, UZB, TUR, AZE, MNG, TJK, SRB, ARE (the hubs listed in `reexports.json`) and BLR, the trade with the rest of the world was itself reshaped by trade with Russia passing through.
   - These keep the 2021 level and the random-walk range.
4. **Missing years.** 2026 (January-August) has no annual partner data yet, and some reporters lack 2024 or 2025. The last available year's real multiplier is carried forward, and the note says so.
   - Countries with no rest-of-world data for 2022-2026 at all keep the 2021 level.

**Services on the random walk.** The 2021 level is depressed in travel.
- As in `trend3.json`, the 2021 travel shortfall against 2019 (in real terms) is added back as it closes at the UNWTO world pace: 49% of the gap still open in 2022, 17% in 2023, 1% in 2024, closed from 2025.
- The intervals are the random walk's back-test errors.

**Result counts:**
- 229 economies and 1,229 country-flows;
- `lin` 305, `rf` 149, `rw` 775 (including hubs and non-reporters).

## 6. Why the winner works, in plain language

The random walk assumes trade with Russia in, say, 2010 equals trade in 2007. It is badly biased in years when everyone's trade is growing (median under-prediction +0.16 log for exports to Russia from the 2007 origin, +0.18 from 2016). The nowcast fixes that bias with two things the country's own records show.

- **Growth carries over.** If a country's exports to everyone else rose 20% in real terms, its exports to Russia most likely rose too, by about half as much. The pooled coefficient on real rest-of-world trade growth is 0.51. Real GDP growth adds 0.40 per unit, and import or export volume 0.15.
  - Where the country's trade with others rose by more than 10%, the median error for exports to Russia falls from 0.41 to 0.25 (2008 test) and from 0.27 to 0.22 (2016 test).
- **Spikes fade.** A flow that jumped in the last year or three tends to fall back. The coefficient on last year's growth is −0.16, and on the 3-year average growth −0.28.
  - This is what makes the model narrower than the random walk for large flows: a 2021 surge is not fully carried forward.
- **Commodity prices.** A higher oil price lifts Russia's import capacity (+0.19 per log unit). Higher grain prices lift the value of Ukraine's trade (+0.36).
  - In the 2013 test, the oil collapse is the one Russia-side shock the model can see. That is why it alone among the partner-side models was not worse there for exports to Russia.
- **Voting distance** in the UN General Assembly matters little (−0.03 per unit, effect of one standard deviation −0.015). Pre-war political drift does not predict trade drift once trade itself is known.

**Why the same does not work for imports from Russia.** What a country buys from Russia (oil, gas, metals, fertiliser) depends on Russian supply and on prices more than on the buyer's own trade growth. In the back-test, the buyer's trade with others explained almost nothing. Product detail did not fix it: holding Russia's share chapter by chapter gained 1%, 4% and 11%.

## 7. Intervals

- **Construction.**
  - For the chosen model (or the random walk), the back-test errors (actual − predicted) are pooled over the three tests.
  - They are divided by a horizon scale g(h) ∝ h^0.50 (lin), h^0.43 (rf), h^0.48 (rw), fitted to the median absolute error by horizon.
  - The 5th, 50th and 95th percentiles are taken per flow type × size class.
- **Thin cells.**
  - A cell with fewer than 60 errors uses the pooled M+L class (S: all sizes).
  - A cell with 60-99 errors averages its own percentiles with the pooled ones. This applies to the large-flow cells for Ukraine flows. In `sell_ukr` large flows, the end of Turkmen gas sales to Ukraine in 2009 alone otherwise sets the lower tail.
- **Formula.** low = central × exp(q05 × g(h)) and high = central × exp(q95 × g(h)), then widened by half the sourcing-switch difference.
- **Held-out coverage** (percentiles from two tests, scored on the third):

  | model | T2008 | T2013 | T2016 |
  |---|---|---|---|
  | lin | 0.90 | 0.77 | 0.90 |
  | rf | 0.88 | 0.79 | 0.91 |
  | rw | 0.87 | 0.78 | 0.87 |

  Intervals are about right in normal periods and too narrow when a Russia-side shock hits a whole flow type, as in 2014-2016.

**Interval width in 2026: median high/low, flows of at least EUR 10 m, chosen method against the random walk**

| flow/size | chosen | random walk | n |
|---|---|---|---|
| to_rus/S | ×123.14 | ×123.29 | 37 |
| to_rus/M | ×23.72 | ×23.71 | 53 |
| to_rus/L | ×4.12 | ×4.11 | 59 |
| from_rus/S | ×109.71 | ×110.16 | 28 |
| from_rus/M | ×4.98 | ×6.15 | 40 |
| from_rus/L | ×2.82 | ×3.85 | 34 |
| buy_ukr/S | ×137.25 | ×148.12 | 44 |
| buy_ukr/M | ×12.49 | ×13.24 | 58 |
| buy_ukr/L | ×6.1 | ×6.58 | 15 |
| sell_ukr/S | ×27.79 | ×51.2 | 36 |
| sell_ukr/M | ×5.07 | ×6.9 | 37 |
| sell_ukr/L | ×10.19 | ×11.19 | 12 |
| svc_bought/S | ×7.17 | ×7.17 | 49 |
| svc_bought/M | ×3.51 | ×3.51 | 49 |
| svc_bought/L | ×3.04 | ×3.04 | 11 |
| svc_sold/S | ×6.21 | ×6.21 | 44 |
| svc_sold/M | ×3.34 | ×3.34 | 40 |
| svc_sold/L | ×3.11 | ×3.11 | 19 |


**Against `trend3.json`.**
- For a large flow, trend3's typical 2026 interval was ×0.48 to ×1.62 of the central (high/low ×3.3).
- Here, for large flows:
  - `from_rus` (nowcast): ×2.8
  - `to_rus` (random walk, scored on three tests including the 2016 one): ×4.1
- The 2016 test adds the 2017-2021 growth period, which widens the random-walk upper tail.

## 8. Countries asked about: 2026 multiplier on the 2021 level, central (low-high), real terms at 2018-2021 prices

| Country | to_rus | from_rus | buy_ukr | sell_ukr | svc_bought | svc_sold |
|---|---|---|---|---|---|---|
| CHN | **1.00** (0.47–1.91) | **1.02** (0.55–1.57) | **0.86** (0.30–1.82) | **1.10** (0.20–1.98) | **1.20** (0.73–2.22) | **1.21** (0.85–2.63) |
| IND | **1.00** (0.47–1.91) | **1.10** (0.60–1.70) | **1.16** (0.40–2.49) | **1.23** (0.44–2.21) | **1.03** (0.57–2.02) | **1.54** (0.98–3.26) |
| TUR | **1.00** (0.47–1.91) | **1.00** (0.48–1.86) | **1.00** (0.48–3.15) | **1.00** (0.20–2.30) | **1.03** (0.57–2.02) | **1.44** (1.00–3.12) |
| DEU | **1.00** (0.47–1.91) | **0.99** (0.54–1.52) | **0.99** (0.35–2.10) | **1.06** (0.19–1.91) | **1.11** (0.68–2.06) | **1.16** (0.81–2.53) |
| USA | **1.00** (0.47–1.91) | **1.03** (0.56–1.59) | **0.99** (0.34–2.08) | **1.24** (0.22–2.23) | **1.09** (0.67–2.02) | **1.13** (0.79–2.45) |
| KAZ | **1.00** (0.47–1.91) | **1.00** (0.48–1.86) | **1.00** (0.35–4.61) | **1.00** (0.37–2.53) | **1.26** (0.77–2.33) | **1.21** (0.85–2.64) |
| ARE | **1.00** (0.47–1.91) | **1.00** (0.48–1.86) | **1.00** (0.35–4.61) | **1.00** (0.37–2.53) | **1.05** (0.58–2.05) | **1.36** (0.95–2.95) |
| HUN | **1.00** (0.47–1.91) | **1.04** (0.57–1.61) | **0.99** (0.34–2.08) | **1.02** (0.18–1.84) | **1.05** (0.58–2.05) | **1.51** (0.96–3.20) |
| BRA | **1.00** (0.47–1.91) | **1.14** (0.62–1.75) | **0.83** (0.21–2.60) | **1.11** (0.39–1.99) | **1.05** (0.58–2.05) | **1.07** (0.68–2.26) |

TUR, KAZ and ARE are re-export hubs, so their goods flows keep the 2021 level. The service multipliers above 1 are the 2021 travel shortfall closing (TUR, HUN, IND, ARE) plus the random walk.

2021 level (EUR bn, nominal) / 2026 central (EUR bn at 2018-2021 prices):

| Country | to_rus | from_rus | buy_ukr | sell_ukr | svc_bought | svc_sold |
|---|---|---|---|---|---|---|
| CHN | 67.30 / 60.97 | 56.81 / 55.48 | 8.26 / 6.85 | 7.85 / 8.30 | 3.73 / 4.38 | 2.75 / 3.26 |
| IND | 7.35 / 6.78 | 2.82 / 2.99 | 2.20 / 2.45 | 0.43 / 0.51 | 0.92 / 0.93 | 0.73 / 1.11 |
| TUR | 24.48 / 22.82 | 4.88 / 4.68 | 3.83 / 3.67 | 2.45 / 2.35 | 0.97 / 0.98 | 3.71 / 5.23 |
| DEU | 23.14 / 21.22 | 27.18 / 25.71 | 3.11 / 2.96 | 5.47 / 5.56 | 2.57 / 2.80 | 3.77 / 4.31 |
| USA | 26.01 / 24.21 | 5.40 / 5.35 | 1.68 / 1.59 | 2.14 / 2.55 | 2.82 / 3.02 | 3.77 / 4.16 |
| KAZ | 14.89 / 14.06 | 5.93 / 5.69 | 0.25 / 0.24 | 0.42 / 0.40 | 1.69 / 2.08 | 1.13 / 1.34 |
| ARE | 3.14 / 3.00 | 1.23 / 1.18 | 0.54 / 0.52 | 0.22 / 0.22 | 0.94 / 0.97 | 1.14 / 1.52 |
| HUN | 3.61 / 3.31 | 1.75 / 1.75 | 1.81 / 1.71 | 2.76 / 2.71 | 0.18 / 0.18 | 0.22 / 0.33 |
| BRA | 5.27 / 4.97 | 1.34 / 1.46 | 0.19 / 0.15 | 0.19 / 0.20 | 0.18 / 0.18 | 0.16 / 0.17 |

The second number is lower than the first even at multiplier 1.00, because 2021 prices were above the 2018-2021 average (fuel above all). DEU, HUN and TUR `to_rus` are customs-recorded imports without pipeline gas.

**Against `trend3.json`** (2026 multipliers there are relative to the 2018-2021 average, so only the direction compares):
- Imports from Russia now hold the 2021 level everywhere, the same rule as trend3.
- For exports to Russia, the nowcast puts China at 1.02 × 2021 and the USA at 1.03. Brazil is at 1.14, India 1.10, Germany 0.99. Germany's 2021 surge partly fades, while its exports to others held up.

## 9. Output

`countries[ISO3][flow]`:
- `level_2021`: 2021 nominal EUR bn. `central` is the series used in the model; `low` and `high` span the own and partner reports.
- `level_2021_at_2018_2021_prices`: the 2021 level revalued at the flow's 2018-2021 average price.
- `multiplier_vs_2021`: 2022-2026, low/central/high, in real terms.
- `eur_bn_at_2018_2021_prices`: the two above multiplied.
- `method`: the method, with any note (hub, carried years, travel recovery).
- `size_class`.

Top-level keys:
- the requested `backtest` (test → flow → model → `mae_log`, `bias`, `n`), `chosen`, `features_used` and `notes`;
- `backtest_by_size`, `backtest_incl_covid_T2016`, `backtest_where_predictor_exists`, `gains_vs_rw`, `bootstrap_gain_90`, `decision_rule`;
- `interval_width_2026_high_over_low`, `error_quantiles`, `horizon_scale`, `coverage_cross_test_90`;
- `models`, `tests`, `units`, `sources`.

## 10. Caveats

- **Three origins, correlated errors.** Common shocks (2009, 2014-2016, the 2017-2021 upswing) make the effective sample far smaller than n. The 15% gains for the Ukraine flows rest on two tests, one of them (2016) a recovery from Ukraine's 2014-2015 collapse.
- **No clean Russia-side control exists for 2022-2026.** The back-test shows Russia-side shocks are what the partner-side models miss. The counterfactual therefore says nothing about a no-war path of Russia's own economy beyond the pre-war commodity-price path. A no-war 2022-2026 with a Russian recession or boom would fall outside the centrals: the 2013 test's coverage of 0.77-0.79 is the honest warning.
- **Commodity prices for 2022-2026** come from the October 2021 WEO, not realised prices. This is a forecast, and its error is not in the back-test intervals.
- **Inputs touched by the war.** The country's own trade, GDP and import volume in 2022-2026 are realised values, and the war affected them too: energy prices in Europe, refugees, sanctions compliance. The sourcing-switch bound covers only redirection, not lower total demand. For the EU and Ukraine's neighbours, the central may therefore sit slightly below a true no-war path.
- **2025 and 2026 partner data are incomplete.** 121 reporters had 2025 annual data. 2026 is carried from 2025 in real terms for everyone.
- **HS-chapter data** was downloaded only for the 60 largest partners on each side and 24 chapters plus a remainder. A full HS2 download was beyond the API quota. Product detail did not help in the tests where it was available.
- **Services' rest of world** comes from WDI balance-of-payments totals. BaTiS bilateral values for non-reporters are model estimates.
