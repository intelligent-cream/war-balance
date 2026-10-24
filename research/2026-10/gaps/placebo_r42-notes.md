# Placebo test of the likely ranges (round 42)

Data file: `research/2026-10/gaps/placebo_r42.json`. Script: `pipeline/placebo.py` (`cd pipeline && uv run placebo.py`; reads only committed files, runs offline in a few seconds). Raw downloads: `pipeline/fetch/placebo_raw.py`, into `research/2026-10/raw/*_placebo/`. Test: `pipeline/tests/test_placebo.py`.

This file moves no money and changes no band. It measures how often the trade ranges are right.

## What was run

The site says a likely range covers "about 90%, by judgement". To measure it, the method was rerun as if the war had started in a year when it did not:

- **Placebo 2018:** base year 2017, pre-war window 2015-2017 (the method's 2019-2021 shifted back four years), changes summed over 2018-2021.
- **Placebo 2014:** base year 2013, window 2011-2013, summed over 2014-2017. This is the Russia-side shock: the oil price halved and the rouble lost half its value.

In a placebo the true war effect is zero. A 90% range should therefore contain zero for about 90% of countries.

For every country, the script rebuilds the two trade parts that make most of the width of the uncertain countries' net ranges:

- **paid** (purchases from Russia), counted at Russia's net gain share;
- **sold** (sales to Russia), counted at the value kept.

It then adds the two parts, as % of the placebo GDP (the mean of the first three placebo years).

The main figure is for the **ranked set**: economies above EUR 5bn of GDP, without Belarus and North Korea. That is about 150 economies.

### What is reproduced as on the site

- **Expected level, paid:** the base year held flat, at window prices. Where purchases were under EUR 1bn a year, it starts from the median of the window (`small_flow_base`).
  - China's no-war path includes the Power of Siberia gas delivered from December 2019, as the method includes the contracted ramp-up.
- **No-war bands:** the same 90% cumulative bands for the number of years summed (4 years: `H4`). They are taken from the same files:
  - the size-class bands (`cf_bands.json`, with `to_rus_cf.json` for large and mid-size purchases);
  - the pipeline buyers' bands (`fuel_volume_cf.json`);
  - the neighbours' own bands (Mongolia, Yemen, Tajikistan, Moldova);
  - Belarus's own yearly band.

  The size class comes from the four years before the placebo, with the same limits (EUR 0.1bn and 1bn).
- **Data ranges:** each country's own 2021 ranges for the actual values and the price level (`site/data.json`, `years_lo/hi` and `pidx_lo/hi`, as factors), applied to every placebo year. The site's median ranges are used where a country has none.
- **Arithmetic:** as `spread()` and `total()` in `site/index.html`:
  - the base and the actual values are correlated 0.5;
  - the price, no-war band and gain-share terms are independent, added in quadrature;
  - each year's change is valued at that year's price level;
  - paid and sold are combined with correlation 0.2.

### What is not reproduced exactly

1. **Sales to Russia are held flat, not nowcast.** The site's linear model for sales to Russia cannot be refitted from the repository: its coefficients, features and training data are not committed. So the base year is held flat, with the random-walk band that the site itself uses for flows held flat (hubs, non-reporters).
   - A variant gives sold the site's own band (the linear model's, which is narrower) around the same flat centre.
   - Coverage is the same in 2018 (85.8%) and slightly lower in 2014 (83.1% against 85.9%).
2. **Trade data.** IMF IMTS (the successor of DOTS) annual totals are used instead of the project's own Comtrade build:
   - the country's own report, with Russia's report as a fallback for countries that filed none (45 country-parts);
   - no freight removal, gas swap, re-export or resale adjustments.

   For the ten importers whose customs hide Russian pipeline gas (Germany, Austria, Poland and others), the series has no gas. Their deflator leaves gas out, as the method's back-tests did.
3. **Prices.** The fuel-mix index uses energy2.json's 2019-2021 fuel mix (the pre-placebo mix is not downloaded).
   - Crude, products and other fuels use Brent.
   - Gas uses the IMF EU gas price, or Japan LNG for East and South Asia.
   - Coal uses Australian coal.
   - Other goods use the euro-area import price index for industrial goods without energy, the source of the site's `non_fuel_goods` index.

   The site's own Urals, product and contract-gas series start in 2019.
4. **Gain share and value kept** are each country's 2021 values. There are no pre-2018 values.
5. **Left out:** the windfall line (the no-war price forecast) and the researched special cases. These are Moldova's gas split, Poland's Yamal contract, the refinery exceptions (Brunei, New Zealand) and Lebanon's researched level.

## Results

Coverage = share of countries whose likely range contains zero. The 90% interval in brackets is sampling error only, treating countries as independent. They are not independent, because they share shocks.

| | 2018 placebo | 2014 placebo (Russia shock) |
|---|---|---|
| **paid + sold, ranked economies** | **96.7%** (93-98%), n 150 | **91.9%** (87-95%), n 148 |
| paid alone | 97.3% | 91.8% |
| sold alone | 85.8% | 85.9% |
| small trade with Russia (< EUR 1bn a year) | 95.9% (n 98) | 90.1% (n 91) |
| large trade (≥ EUR 1bn) | 98.1% (n 52) | 94.7% (n 57) |
| all economies, also those below EUR 5bn | 93.9% (n 180) | 87.2% (n 179) |
| first two years only (2018-19; 2014-15) | 94.7% | 90.5% |

**By region** (ranked, paid + sold):

| region | 2018 placebo | 2014 placebo |
|---|---|---|
| EU | 100% (27) | 96% (27) |
| other Europe | 100% (13) | 100% (13) |
| Americas | 93% (27) | 96% (26) |
| Middle East and Africa | 96% (51) | 88% (51) |
| Asia and Pacific | 97% (32) | 87% (31) |

**By the part's own size class** (ranked):

| | S | M | L |
|---|---|---|---|
| paid, 2018 | 95% | 100% | 98% |
| paid, 2014 | 87% | 98% | 93% |
| sold, 2018 | 76% | 97% | 97% |
| sold, 2014 | 79% | 97% | 91% |

**Misses.**
- 2018: Brunei, Iraq, Gabon, the Bahamas and Bermuda.
  - Brunei's refinery opened in 2019, a real non-war break. The method already keeps it as an exception.
  - Bermuda is a range of almost zero width.
- 2014: twelve, all "more paid to Russia than expected": India, Egypt, Iraq, Syria, Malta, Namibia, Congo, Zambia, Myanmar, Papua New Guinea, the Bahamas and Brunei.
  - With Russian prices falling, buyers bought more volume. These are mostly small flows.

## What this means

- **For the trade parts, the ranges cover more than 90% in a normal period (about 97%) and about 92% in a Russia-shock period.** The "about 90%" on the site is therefore about right, and slightly cautious.
- **Purchases from Russia (paid) carry most of the width and over-cover in normal years.**
  - To bring the 2018 placebo to exactly 90%, the no-war band term would have to shrink to ×0.59 of its width (×0.81 for the 2014 placebo).
  - The whole range would have to shrink to ×0.70 (×0.88 for 2014).
- **Sales to Russia (sold) under-cover slightly, at about 86% in both placebos, all of it in small flows (76-79%).**
  - About 3-7% wider ranges would bring them to 90%.
  - Their weight in the net is small, because sales count only at the value kept (about 1% of the value).

### Recommendation (not applied)

- **Do not narrow the bands on this evidence.**
  - The Russia-shock placebo is close to 90%.
  - 2022-2026 is a larger shock than 2014.
  - The placebo windows are not out of sample (next section).
- If a change is wanted:
  - **paid** could narrow by up to about 20% (the 2014 figure, ×0.81 on the no-war band) and still cover 90% in a Russia shock;
  - **sold** for small flows should widen by about 5-10%.

## Caveats

- **Not out of sample.** The bands were measured on back-tests whose target years include 2013-2021:
  - the 2013 and 2016 tests;
  - the rolling origins 2005-2020 for purchases from Russia.

  The placebo years are therefore partly the bands' own training data. The placebo checks the whole chain (bands plus data, price and gain ranges, combined as the site does), not the bands alone. A truly held-out check needs a pre-2005 placebo, and partner data before 2005 are thin.
- **COVID 2020 is a real shock** in the 2018 placebo. Trade with Russia fell in 2020 for reasons that have nothing to do with a war. The bands for sales to Russia and services interpolated over 2020; the bands for purchases from Russia kept it.
  - Counting only 2018-2019 gives 94.7% instead of 96.7%, so COVID did not create the over-coverage.
- **Countries are not independent.** Shared shocks (oil prices, COVID, the rouble) move many countries at once. The true uncertainty of a coverage figure is wider than the binomial interval shown.
- **Only the trade parts are tested.** Support for Ukraine, company taxes, the windfall, laundered oil and the services parts have no placebo. The net ranges also carry those parts' ranges, so this measures the parts that make most of the width, not every number on the map.
- **2014 has a mild confound.** Some sanctions and counter-sanctions started in 2014. Those are a real effect, not zero, so the 2014 figure is a lower bound for a pure shock period.
