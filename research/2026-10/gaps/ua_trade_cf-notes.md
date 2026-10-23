# Trade with Ukraine without the war: more evidence for the counterfactual (round 6, C6)

Data file: `research/2026-10/gaps/ua_trade_cf.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes. It reuses the round-4 inputs, features and models of `counterfactual.json`.

This file moves no money by itself. It replaces the **expected (no-war) level** of two flows in
[`counterfactual.json`](counterfactual.json): what each country bought from Ukraine (`buy_ukr`) and sold to Ukraine (`sell_ukr`).

## Summary

- **Decision: both flows go back to "2021 held flat" (the random walk).** Round 4 used a linear nowcast (`lin`) for
  `buy_ukr` and a random forest (`rf`) for `sell_ukr`, on two back-tests. With 10-13 back-tests, neither passes the rule.
- **Why the round-4 models lose.** Two reasons:
  1. **The back-test fed them real commodity prices; the map feeds them a forecast.** For 2022-2026 the map uses the IMF's
     October 2021 price forecast (realised prices were raised by the war). Scored the same way, with the forecast made at each
     origin, their gains roughly halve. For example, `sell_ukr` `rf` falls from +18% to +10%.
  2. **The two round-4 tests were favourable ones.** Over 10 origins, `lin` for `buy_ukr` gains +4% on average and is worse at
     2 origins. `rf` for `sell_ukr` gains +6% and is worse at 4 origins, by up to 34%.
- **`sell_ukr` is a near miss.** A simple share model passes on all evidence except one origin:
  - the model (`sh_last`) holds 2021's share of the country's exports to everyone else, and grows it with those exports;
  - over 13 origins it gains +20% on average, and is worse at one origin only, by 0.8% (2008);
  - it is never worse in 13 analogue tests (smallest gain +5%).

  The rule says "no test worse", so it is not chosen. Its numbers are in the JSON per country as `alternative_sh_last`, for the
  owner to decide.
- **Ukraine-side controls.** The IMF's pre-war forecast of Ukraine's GDP helps `sell_ukr` a lot when the forecast was right
  (2016-2018 origins, +35-54%). It hurts when the forecast was wrong (2011: −18%), and helps `buy_ukr` only slightly. World
  prices of Ukraine's main exports add little.
- **Analogues.** The same models predict other countries' trade with Poland, Romania, Türkiye, Bulgaria and Hungary well
  (+12-38%). They predict trade with Kazakhstan and Georgia no better than the random walk. Ukraine, a commodity-driven and
  shock-prone partner, behaves like the second group for `buy_ukr`.
- **Effect on the expected level** (sum 2022 to August 2026, EUR bn at 2018-2021 prices, all countries):
  - `buy_ukr`: 277.2 → 271.6 (−2%);
  - `sell_ukr`: 253.7 → 232.2 (−8%). With the `sh_last` alternative it would be 250.5.
- **The ranges are now measured on 13 origins instead of 2.**
  - They are narrower for `buy_ukr`: medium flows in 2026 go from ×12.5 to ×9.3 (high over low).
  - They are wider for `sell_ukr`: medium flows go from ×5.1 to ×8.0. The round-4 random-forest band was too narrow: with the
    map's price inputs it covered 85% of the new origins, not 90%.

## 1. What was tested

The round-4 setup is unchanged: same series (UN Comtrade, own report with mirror gaps filled, deflated with the non-fuel goods
index), same features, same models, same decision rule. Only the evidence is new.

**Decision rule** (round 4, fixed before the results). The eligible model with the lowest mean error is used only if one of two
conditions holds:
- it beats the random walk by at least 15% in every test;
- or it beats it by at least 15% on average, with no test worse.

Otherwise the random walk is used. The error is the median absolute log error, 1-5 years ahead. Here **each origin is a test**.

| evidence | origins (last data year L) | targets | n (country-flow-years) |
|---|---|---|---|
| (1) Rolling origins, Ukraine | 2004-2012; 2016-2019 | up to 2013 (2014 and later is the war); up to 2021 without 2020 (COVID) | buy 3,301, sell 2,160 (10 fitted origins) |
| (2) Analogues | 2007-2019 | to 2021 without 2020 | about 30,000 per direction |
| (3) Ukraine-side controls | as (1) | as (1) | as (1) |

- **Fitted models** (`lin`, `rf`, `gbm`) are trained only on year pairs that end by L, as in round 4. Before 2007 there are too
  few such pairs (L = 2006: 369 one-year pairs), so these models are scored from L = 2007. Round 4's "2008 test" is L = 2007;
  its "2016 test" is L = 2016.
- **Eligible models** are those whose 2022-2026 inputs exist without using war outcomes:
  - the rule-based models;
  - the `_fc` versions of the fitted models: commodity features from the IMF WEO path at the origin, as the map does with the
    October 2021 WEO.

  The round-4 scoring with realised prices is shown, but it does not count.
- **Ukraine-side controls** come from the WEO vintage at the origin (October of L; April 2011 and April 2008 where October is
  missing on DBnomics; none before 2007):
  - `_g_fc`: Ukraine's real GDP forecast;
  - `_ua_fc`: the GDP forecast plus a Ukraine export-price index. The index weights are cereals 0.33, vegetable oil 0.17, iron
    ore 0.17 and steel 0.33, from the 2021 export structure: ferrous metals USD 14.0bn, grain 12.4bn, ores 7.1bn, sunflower
    oil 6.4bn ([State Customs Service via GolosUA](https://gol.ua/en/imports-of-goods-from-ukraine-in-2021-amounted-to-73-3-bln-while-exports-set-a-record-of-68-24-bln/),
    [USDA FAS](https://www.fas.usda.gov/sites/default/files/2022-04/Ukraine-Factsheet-April2022.pdf)).
  - The WEO has no steel price, so steel uses the metals index. Before 2014 the WEO's commodity paths run only one year
    ahead, so they are held flat after that.
  - `_oracle`: realised GDP and prices. This is a ceiling, not usable in production.
- **Analogues** use IMF Direction of Trade Statistics (via DBnomics): every reporter's imports from and exports to the partner,
  in EUR, deflated the same way. The models are trained on the Russia and Ukraine pairs only, so the analogue flows are pure
  out-of-sample tests of the model class. The partner's WEO GDP forecast takes the place of Ukraine's.

## 2. Rolling origins on Ukraine's own history

Gain against the random walk per origin (+ = better). Eligible models only, plus round 4's realised-price scoring for comparison.

**Bought from Ukraine (`buy_ukr`)**

| L | n | rw error | sh_last | vol | lin (round 4) | lin_fc | rf_fc | lin_g_fc | rf_ua_fc |
|---|---|---|---|---|---|---|---|---|---|
| 2004 | 490 | 0.44 | +11% | +11% | – | – | – | – | – |
| 2005 | 510 | 0.39 | +12% | +10% | – | – | – | – | – |
| 2006 | 545 | 0.43 | +12% | +12% | – | – | – | – | – |
| 2007 | 525 | 0.39 | +4% | +6% | +8% | +9% | +2% | +8% | +3% |
| 2008 | 565 | 0.46 | +4% | +4% | +4% | +1% | −5% | −3% | −6% |
| 2009 | 448 | 0.47 | +22% | +19% | +26% | +17% | +27% | +22% | +29% |
| 2010 | 330 | 0.35 | +9% | +10% | +3% | 0% | +2% | +9% | +10% |
| 2011 | 226 | 0.33 | +1% | +6% | +4% | +4% | +10% | −3% | +1% |
| 2012 | 111 | 0.22 | −9% | −4% | +16% | +9% | +15% | +2% | +12% |
| 2016 | 430 | 0.43 | +21% | +18% | +28% | +22% | +21% | +29% | +26% |
| 2017 | 328 | 0.28 | +11% | +15% | +11% | +2% | −1% | +9% | +9% |
| 2018 | 226 | 0.21 | −4% | −1% | −4% | −16% | −15% | −3% | −3% |
| 2019 | 112 | 0.28 | +11% | +6% | +18% | −5% | −10% | +14% | +7% |
| **mean, 2007-2019** | | | **+7%** | **+8%** | +12% | **+4%** | **+5%** | **+8.5%** | **+9%** |

**Sold to Ukraine (`sell_ukr`)**

| L | n | rw error | sh_last | vol | rf (round 4) | rf_fc | lin_fc | lin_g_fc | lin_ua_fc |
|---|---|---|---|---|---|---|---|---|---|
| 2004 | 299 | 0.63 | +39% | +27% | – | – | – | – | – |
| 2005 | 318 | 0.45 | +31% | +17% | – | – | – | – | – |
| 2006 | 323 | 0.35 | +14% | +6% | – | – | – | – | – |
| 2007 | 323 | 0.35 | +11% | +6% | +9% | +9% | +4% | −2% | +7% |
| 2008 | 340 | 0.39 | **−0.8%** | −2% | −34% | −34% | −12% | −14% | +14% |
| 2009 | 280 | 0.43 | +36% | +28% | +47% | +45% | +21% | +50% | +50% |
| 2010 | 219 | 0.29 | +35% | +22% | +27% | −3% | −4% | +31% | +37% |
| 2011 | 154 | 0.19 | +7% | +24% | −1% | +2% | +17% | +4% | **−18%** |
| 2012 | 74 | 0.15 | +17% | +26% | −11% | −1% | −2% | +9% | +5% |
| 2016 | 312 | 0.37 | +34% | +26% | +40% | +37% | +35% | +53% | +54% |
| 2017 | 228 | 0.25 | +21% | +18% | +22% | +7% | +16% | +39% | +43% |
| 2018 | 154 | 0.24 | +17% | +18% | +23% | +4% | +6% | +27% | +35% |
| 2019 | 76 | 0.16 | +2% | −17% | +19% | −9% | −35% | +8% | +10% |
| **mean, 2007-2019** | | | **+18%** (13 origins: +20%) | +15% | +14% | **+6%** | **+5%** | **+20.5%** | **+24%** |

- **Pooled over all fitted origins** (one error over all cases), with the country-clustered bootstrap 90% interval:
  - `buy_ukr`: `sh_last` +11% (7-16%), `lin_fc` +8% (4-11%), `rf_ua_fc` +12%;
  - `sell_ukr`: `sh_last` +20% (15-25%), `rf_fc` +10% (5-16%), `lin_ua_fc` +28% (23-34%).
- **Large flows** (base above EUR 1bn) are where the money is:
  - `sell_ukr` `rf_fc` loses badly at L = 2007, 2008 and 2011 (−67%, −47%, −34%). Every model loses for large flows at 2007,
    because Turkmen gas sales to Ukraine ended in 2009.
  - `buy_ukr` `lin_fc` loses at 2007, 2008 and 2010.
- **Sensitivity.**
  - **Without the 2013 targets** (Russia's mid-2013 customs blockade of Ukraine; Euromaidan from November), `sell_ukr` passes
    with `lin_ua_fc` (+30%, worst +3%) and `sh_last` (+19%, worst +2%). `buy_ukr` still fails.
  - **With 2020 included**, nothing changes.
  - The main specification keeps 2013, because round 4 set the war exclusion at 2014-2015.

**Applying the rule** (10 fitted origins, or 13 for the rule-based models):

| flow | best eligible | mean gain | worst origin | origins worse | passes |
|---|---|---|---|---|---|
| buy_ukr | rf_ua_fc / lin_g_fc / vol | +9% / +8.5% / +8% | −6% / −3% / −4% | 2 / 3 / 2 | no |
| sell_ukr | lin_ua_fc | +24% | −18% (2011) | 1 | no |
| sell_ukr | sh_last | +18% (+20% over 13) | −0.8% (2008) | 1 | no (by 0.8%) |
| sell_ukr | rf_fc (round 4, map inputs) | +6% | −34% | 4 | no |

On round 4's own two tests with the map's price inputs, the round-4 choices still pass: `buy_ukr` `lin_fc` +15.5%, `sell_ukr`
`rf_fc` +23%. Round 4 was right on its evidence; the evidence was thin.

## 3. Analogues: trade with Ukraine-like partners

Mean gain against the random walk over 13 origins (2007-2019), all partners pooled, and the number of origins where the model
was worse:

| model | buy from partner | worse | sell to partner | worse |
|---|---|---|---|---|
| sh_last | +17% | 0 | **+17%** | 0 |
| vol | +15% | 0 | +13% | 0 |
| lin_fc (round-4 class) | +11% | 2 | +9% | 3 |
| rf_fc (round-4 class) | +12% | 1 | +9% | 2 |
| lin_g_fc (+ partner GDP forecast) | **+22%** | 0 | +11% | 2 |

Per partner (mean gain of `sh_last`, buy / sell): Poland +23 / +26%, Romania +12 / +22%, Türkiye +24 / +12%,
Bulgaria +18 / +20%, Hungary +15 / +19%, Moldova +11 / +24%, Kazakhstan +2 / +6%, Georgia −1 / +6%.

- **The model class transfers to steady partners, not to volatile ones.** Kazakhstan's trade moves with the oil price.
  Georgia's was hit by the Russian embargo and the 2008 war.
- On its own history, Ukraine's `buy_ukr` looks like Kazakhstan and Georgia: +4 to +9% gains. Its `sell_ukr` looks like the
  steady group: +18-24%.
- `sh_last` passes the rule on the analogues in both directions. It is the only model that does so for "sell".

## 4. Ukraine-side controls: do they help?

| control | buy_ukr pooled | sell_ukr pooled | comment |
|---|---|---|---|
| none (`lin_fc`) | +8% | +6% | the map's current inputs |
| + WEO forecast of Ukraine's GDP (`lin_g_fc`) | +10% | +25% | wins from 2016-2019 (forecasts right), loses 2008 (forecast 4-5% a year, actual −15% in 2009) |
| + GDP forecast and export-price index (`lin_ua_fc`) | +13% | +28% | prices add little on top of GDP; −18% at 2011, when the WEO expected 4-5% and Ukraine stagnated |
| realised GDP and prices (`_oracle`, not usable) | +7% | +19% | scores below the forecast versions: the gain comes mostly from the forecasts' steady upward drift, not from knowing Ukraine's real path |

**Not used, because it is too fragile.** The October 2021 WEO expected Ukraine to grow 3.4-4.0% a year in 2022-2026
(+17% in logs by 2026). With the fitted coefficient of about 1.9, the GDP term alone would raise the expected sales to Ukraine
by about ×1.4 by 2026. That would rest on a single country forecast, and that kind of forecast failed in 2011-2012.

## 5. The new 2022-2026 multipliers and ranges

Per country in `countries[ISO3].buy_ukr / sell_ukr`, in the same structure as `counterfactual.json`:
- `multiplier_vs_2021` and `eur_bn_at_2018_2021_prices`, each with low / central / high;
- `size_class`, `method`, `cumulative_band` (as in `cf_bands.json`) and `previous_round4`;
- `alternative_sh_last` for `sell_ukr`.

The central is 1.00 for every country.

**Yearly 90% interval.** The random walk's errors over all 13 origins are scaled by horizon (g(h) ∝ h^0.33 for buy,
h^0.38 for sell). The 5th and 95th percentiles are taken per size class, with the thin-cell rule of round 4. Median 2026
interval, flows of at least EUR 10 m:

| flow / size | new (rw) | round 4 | n |
|---|---|---|---|
| buy_ukr L | 0.46-2.67 (×5.8) | 0.35-2.11 (×6.1) | 15 |
| buy_ukr M | 0.36-3.30 (×9.3) | 0.26-3.33 (×12.5) | 58 |
| sell_ukr L | 0.20-2.54 (×12.9) | 0.20-2.03 (×10.2) | 12 |
| sell_ukr M | 0.37-2.93 (×8.0) | 0.38-2.02 (×5.1) | 37 |

**Cumulative band** for the 2022-August 2026 sum: a multiplier on the summed central level, as in `cf_bands.json`, with
log-scale factor K.

| flow / size | 1 year | 2022-2026 (8/12) | K |
|---|---|---|---|
| buy_ukr M | 0.43-2.19 | 0.51-3.10 | 1.2 |
| buy_ukr L | 0.45-2.06 | 0.50-2.96 | 1.2 |
| sell_ukr M | 0.40-2.04 | 0.46-2.94 | 1.4 |
| sell_ukr L | 0.39-1.89 | 0.45-2.84 | 1.4 |

- **Honesty check.** Percentiles from one era (2004-2012 or 2016-2019) were scored on the other:
  - yearly bands: `buy_ukr` covers 92% and 83%, `sell_ukr` 97% and 69%;
  - cumulative bands at K = 1.2: `buy_ukr` covers 89-91%. `sell_ukr` covers only 74-84%, so K = 1.4 is used for it, which
    gives 77-88%.
  - The 2008-2009 collapse of Ukraine's imports cannot be predicted from 2016-2019 data. The published bands pool both eras.
  - The round-4 random-forest quantiles, scored with the map's inputs on the new origins, cover 85%. They were slightly too
    narrow.
- **The random walk is biased low.** The median actual was above the held level by +0.1 to +0.4 log in most origins (below it at 2008 and 2012): trade
  with Ukraine tended to grow. The bands are asymmetric because of this (median cumulative ratio ×1.2), but the central stays
  at 1.00, as the rule requires.

**Biggest changes in the expected level** (sum 2022 to August 2026, EUR bn at 2018-2021 prices; − = lower expected level than
round 4):

| country | flow | 2021 level | round 4 | new (rw) | change | sh_last alternative | round-4 2026 multiplier |
|---|---|---|---|---|---|---|---|
| CHN | sell_ukr | 7.53 | 39.2 | 35.1 | −4.0 | 37.0 | 1.10 |
| CHN | buy_ukr | 7.93 | 33.1 | 37.0 | +3.9 | – | 0.86 |
| DEU | sell_ukr | 5.25 | 26.7 | 24.5 | −2.2 | 25.1 | 1.06 |
| USA | sell_ukr | 2.05 | 11.8 | 9.6 | −2.2 | 11.1 | 1.24 |
| POL | sell_ukr | 5.72 | 28.7 | 26.7 | −2.0 | 31.9 | 1.08 |
| IRQ | buy_ukr | 0.65 | 4.7 | 3.0 | −1.7 | – | 1.70 |
| IND | buy_ukr | 2.11 | 11.4 | 9.8 | −1.5 | – | 1.16 |
| ITA | sell_ukr | 2.02 | 10.9 | 9.4 | −1.5 | 10.3 | 1.15 |
| FRA | sell_ukr | 1.17 | 6.4 | 5.5 | −1.0 | 6.0 | 1.17 |
| CZE | sell_ukr | 1.30 | 7.0 | 6.1 | −1.0 | 6.9 | 1.16 |

## 6. What is estimated or guessed

- **Export-price weights.** Rounded from the 2021 structure. The steel price is proxied by iron ore and the metals index.
- **WEO vintages.** The 2007 origin uses April 2008 and the 2011 origin uses April 2011, as October is missing on DBnomics.
  Before 2014 the WEO's commodity paths reach only one year ahead and are held flat after it.
- **Analogue data.** DOTS includes IMF estimates for non-reporters. Rest-of-world trade still excludes Russia, Ukraine and
  Belarus rather than the analogue partner. This error is small except for the partner's neighbours.

## 7. Overlaps

- **No money moves here.** Use these `buy_ukr`/`sell_ukr` entries **instead of** those in `counterfactual.json`, never on top.
- **`cf_bands.json` (B1)** has generic cumulative bands built on round-4 errors (`lin`/`rf` cells). `build_data.py` uses an
  entry's own `cumulative_band` first, so the per-country bands here win; with `method` starting "2021 level held", `obj.cf`
  becomes `rw`. `cf_bands.json` has no per-country `buy_ukr`/`sell_ukr` entries. Trade levels (`trade_full.json`) are untouched.

## 8. Open questions for the owner

1. **Accept the 0.8% tie for `sell_ukr`?** If yes, use `alternative_sh_last`: best record on Ukraine's history and the
   analogues, no forecast needed, expected level 8% above the random walk (China, Germany, Poland, USA move most).
2. **Tolerate ties in the rule** (e.g. "no test worse by more than 2%"), fixed before results in future rounds?
3. **Correct the random walk's known upward drift** for trade with Ukraine? Not tested against the rule.
