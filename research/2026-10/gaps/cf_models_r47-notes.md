# New centre models for "expected without the war" (round 47)

## Rule (written before any result was computed)

A candidate replaces "2021 held flat" (M0, the current method with the 2019-2021 median start for flows under EUR 1bn) only if all three hold:

1. **Accuracy.** Its error is at least 15% lower than M0's at **every** rolling origin 2005-2016. The 12 origins include the three classic tests (data to 2007, 2012 and 2016). The error is the mean over horizons 1-5 of the median absolute cumulative log error, which is the site's cumulative error with the fifth year at 8/12.
2. **Size classes.** It is not worse than M0 in any size class (S, M, L), both pooled and at each classic origin.
3. **Bands.** Its era-calibrated 90% band for the five-year sum (the site's cumulative-band method, as in `to_rus_cf.json` and round 44) is not wider than M0's in any size class.

- The 2013 origin (forecasting 2014-2018, the Russia shock) is reported on its own.
- The looser reading (at least 15% only at the three classic origins) is reported for information. It does not decide anything.
- A model that only fixes the small-buyer centre bias is reported as a finding, a possible bias correction. It is not proposed as a replacement.
- The candidates were fixed before the results: M0_last, M0_med3, MOM12, MOMH2, POOL, POOLr, FC, FCm and ENS (see Models).

## Result

**No model passes, for either flow. "2021 held flat" stays. No band, no centre and no chance changes.** The site model was therefore not rerun: there is nothing to patch.

Data file: `research/2026-10/gaps/cf_models_r47.json`. Script: `research/2026-10/scripts/cf_models_r47.py`.
- `python3 -I research/2026-10/scripts/cf_models_r47.py run` reads only committed raw files and takes about 5 minutes.
- `... fetch` downloads the new extracts again.

### Purchases from Russia (`to_rus`): gain over M0 at each rolling origin

The gain is 1 − error/error of M0. M0's error is the mean median absolute cumulative log error over H1-H5. 1,554 country-origin cases.

| origin | n | M0 error | M0_last | M0_med3 | MOM12 | MOMH2 | POOL | POOLr | FC | FCm | ENS |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 2005 | 117 | 0.330 | +14% | −4% | **+20%** | **+24%** | −1% | −2% | 0 | 0 | 0 |
| 2006 | 119 | 0.364 | +6% | +3% | +13% | **+17%** | +12% | +9% | 0 | 0 | 0 |
| **2007** | 120 | 0.302 | +3% | −3% | **+16%** | +14% | +5% | +2% | 0 | 0 | 0 |
| 2008 | 124 | 0.292 | +8% | −11% | +4% | −12% | −6% | +9% | −10% | −10% | −1% |
| 2009 | 127 | 0.288 | −16% | −4% | −13% | −5% | −0% | +1% | +6% | +6% | +1% |
| 2010 | 126 | 0.310 | +4% | −4% | +8% | +7% | −2% | −1% | +3% | +3% | +2% |
| 2011 | 129 | 0.336 | **+17%** | −3% | **+19%** | +15% | +7% | +4% | +10% | +1% | +3% |
| **2012** | 134 | 0.323 | **+20%** | −6% | **+21%** | +11% | +6% | +8% | +9% | +13% | +5% |
| 2013 (shock) | 137 | 0.315 | +8% | +2% | +3% | −1% | +3% | +3% | +4% | +6% | +3% |
| 2014 | 137 | 0.311 | +13% | −11% | +10% | **+17%** | −3% | −3% | +13% | +10% | +1% |
| 2015 | 141 | 0.281 | +5% | −3% | +5% | +7% | +2% | −1% | +9% | +9% | +3% |
| **2016** | 143 | 0.263 | +8% | −8% | +10% | +7% | +8% | +4% | +10% | +7% | +10% |
| origins ≥15% | | | 2/12 | 0/12 | 4/12 | 3/12 | 0/12 | 0/12 | 0/12 | 0/12 | 0/12 |
| worse than M0 in a size class | | | yes (S 2007 −31%) | yes | yes (S 2007 −22%) | yes | yes (L) | yes (L) | yes (L 2012 −9%) | yes (L) | yes (L) |
| H5 band not wider (S/M/L) | | | yes | no (L ×1.35) | yes | yes | no (L ×1.17) | no | yes | yes | yes |

FC, FCm and ENS show 0 at 2005-2007 because no WEO country vintage exists for those origins, so they fall back to M0. That alone fails the every-origin rule. They also never reach 15% at any later origin.

- **Best candidate: MOM12** (the latest 12 months, Feb–Jan, from the IMF monthly reports).
  - It gains 16%, 21% and 10% in the classic tests, so even the looser reading fails (2016).
  - It reaches 15% at only 4 of 12 origins. It loses 13% at the 2009 origin, where the latest months were the 2008 peak.
  - It is worse for small buyers in 2007 (−22%).
  - Bootstrap 90% interval of the gain: +3% to +28% (2007), +9% to +28% (2012), −5% to +22% (2016).
- **The 2013 origin (Russia shock, 2014-2018):** every model is within −1% to +8% of M0. None sees the shock.
- **Large flows (L):** nothing beats M0. MOM12 gives +2% pooled, and the pooled-trend and forecast models are 4-8% worse. This is where most of the money is.

### Sales to Russia (`from_rus`), secondary

Here the reference is still flat, although the site uses the nowcast `lin` (+18% over flat, with realised post-2021 inputs). 1,237 cases.

| model | origins ≥15% | classic 2007 / 2012 / 2016 | 2013 | worst origin |
|---|---|---|---|---|
| M0_last | 4/12 | +40% / +14% / −8% | +2% | −13% |
| MOM12 | 7/12 | +40% / +17% / −1% | +1% | −12% |
| MOMH2 | 6/12 | +36% / +7% / +4% | −5% | −5% |
| POOL = POOLr | 2/12 | −12% / −50% / −55% | −21% | −100% (2008) |
| FC | 3/12 | 0 / −86% / +19% | −74% | −86% |
| FCm | 3/12 | 0 / −73% / +28% | −55% | −73% |
| ENS | 1/12 | 0 / −46% / −2% | −22% | −53% |

- None passes. POOL and POOLr are identical here, because both use size × region cells for this flow.
- The trend and forecast models fail badly. Russia's import boom of 2005-2008 sets the fitted weights: the elasticity on Russian GDP sits at the cap of 3. That boom then reverses in 2009 and 2014.
- Momentum helps in boom origins and fails at the turning points.

## Findings (not proposals)

1. **The median start hurts mid-size buyers.**
   - Holding the origin year for everyone (M0_last) is 13% more accurate than the site's 2019-2021 median start for M flows, pooled over all origins.
   - The median 5-year error drops from +0.27 to +0.09 (2007), from +0.28 to +0.18 (2012), and from +0.02 to +0.02 (2016).
   - The M band is narrower too (×0.75 width).
   - For S flows the median start is better in 2007 (M0_last −31%) but worse in 2016 (+25%).
   - It fails the rule as a replacement (2009 origin −16%, S 2007). The `small_flow_base` choice is worth a look for M-size countries only: e.g. Peru ×1.32 and Colombia ×1.63 in 2026 would move with an origin-year start.
2. **The small-buyer centre bias is real and partly fixable, but not under the rule.**
   - M0's median 5-year cumulative error for S flows is +0.23 / +0.62 / +0.41 (2007 / 2012 / 2016), which confirms round 44.
   - The pooled trend (POOL) cuts it to +0.05 / +0.46 / +0.32.
   - The GDP-forecast model (FC) cuts it to +0.23 (no vintage) / +0.39 / +0.21.
   - Neither gains more than 10% in accuracy for S. Both are worse for large flows.
   - A bias correction for S flows only (for example the FC drift) could be a separate, narrower question. It is not proposed here.
3. **Pre-war forecasts point up for 2022-2026, but this is not tested evidence.** With the October 2021 WEO, FC would put many large buyers well above 2021 by 2026 (China ×1.48, India ×1.64, Germany ×1.16). FC was never 15% better at any origin and is 9% worse for large flows in the 2012 test.
4. **Russia's own pre-war outlook was not reachable.** economy.gov.ru (the September 2021 scenario) resets the connection from here. The Bank of Russia's site is reachable, but a single 2021 forecast cannot be back-tested, and no comparable Russian vintages for the 2005-2016 origins were found. So it was not used. The IMF WEO Russia series (GDP; export volume from the 2011 vintage) stood in for it. The fitted weight on Russia's export volume for `to_rus` is about 0 at every origin up to 2016, and 0.56 at 2021.

## Models (fixed before the results)

All models start from M0's level unless stated otherwise. Fitted pieces use only pairs whose target year is no later than the origin.

| key | model |
|---|---|
| M0 | 2021 held flat. Median of the last three years for flows under EUR 1bn (current method) |
| M0_last / M0_med3 | origin year for every size / median start for every size (the start-rule comparison) |
| MOM12 | the origin-year level × (Feb o to Jan o+1) / (calendar o), from IMF IMTS monthly own reports; the fuel share is deflated by monthly Brent. For 2022 this is Feb 2021 to Jan 2022. M0 where months are missing (90 of 1,554 cases) |
| MOMH2 | the same with the second half of the year annualised |
| POOL | growth = b1·r_c·(own 4-year trend − cell trend) + b2·cell trend. r_c = τ²/(τ²+s_c²) (James–Stein). Cells: size × fuel-heavy. b1 and b2 lie in [0,1] and are fitted on pre-origin pairs (b1 0.16-0.49, b2 0.21-1.0) |
| POOLr | the same with cells size × region (6 regions) |
| FC | log growth = e1·partner real GDP growth + e2·Russian real GDP growth, cumulated from the WEO vintage of the origin year (Oct; Apr 2011). e1 is 1.4-2.0 and e2 is 0 for `to_rus` |
| FCm | partner import volume + Russia's export volume (`from_rus`: partner GDP + Russia's import volume), from vintages from 2011 on |
| ENS | median of M0, POOL and FC, year by year |

## Data and caveats

- **Series:**
  - `to_rus` is Russia's exports by partner (CEPII BACI, `raw/oec_baci_r44`), real by goods group, as in round 44.
  - `from_rus` is Russia's imports by exporter (BACI, new).
  - Neither is the site's Comtrade-plus-mirror series. The comparison is within one series.
  - Size classes, the EUR 10 m floor and the cumulative error are those of round 44.
- **New raw files** in `research/2026-10/raw/cf_models_r47/` (1.3 MB; each file carries its source URL and the retrieval date 2026-10-25):
  - IMF IMTS monthly 2003-2018;
  - WEO country vintages 2008-04 to 2021-10 via DBnomics. Trade volumes by country exist only from 2011-04; 2011-10 is missing;
  - BACI Russia imports by exporter;
  - FRED Brent monthly.

  They are not yet in `raw/MANIFEST.json`.
- **Momentum uses January of the first forecast year,** as the 2022 case would (January 2022 was pre-war).
- **Many models, one rule:** with 9 candidates and 12 origins, a chance pass was possible. None happened.
- The 2022-2026 central paths of every model are in the JSON, `flows.<flow>.diagnostic_2022_2026_central_vs_M0`. They are a diagnostic only, not a cf_bands entry.

## Applied after review (owner: "Fix that")

Both findings are now in the build (`pipeline/build_data.py`). Neither passed the replacement rule; both are applied as targeted corrections at the owner's request.

1. **Mid-size start rule.** Purchases of EUR 0.1–1bn a year start from 2021 (`MID_FLOW_EUR_BN`, 45 flows). The band is unchanged. Kenya and Peru keep the median start: their own bands were tested with it.
2. **Small-flow bias correction.** Flows under EUR 0.1bn a year (93 with a band) get their middle value raised by `bias_correction_small`: the median cumulative error of M0 for size S over all rolling origins 2005–2016, n = 485 per horizon. The cumulative factors are ×1.22, 1.33, 1.43, 1.49 and 1.57 (H1–H5).
   - The cumulative band is divided by the rise, so the expected level's range in euros is unchanged.
   - No middle had to be capped.

`pipeline/placebo.py` now applies the same rules. Coverage with the site's bands, before → after:

| placebo | trade | paid |
|---|---|---|
| 2018 | 0.960 → 0.967 | 0.960 → 0.966 |
| 2014 | 0.899 → 0.892 | 0.905 → 0.898 |
