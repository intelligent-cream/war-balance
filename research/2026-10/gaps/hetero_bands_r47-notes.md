# Pooled no-war bands that depend on how steady each buyer is (round 47)

## The rule (written before any result was computed)

**Idea.** The size-class band gives every buyer of the same size the same range. Instead, the band could depend on things known about each buyer before the forecast starts, estimated on all countries together. Steady buyers would get narrower bands and erratic ones wider, with the same coverage overall and in each group.

**Method (fixed in advance).**
- Data: Russia's exports to each country on the site, 2001-2021 (CEPII BACI), made real by goods group exactly as round 46 did.
- Back-test windows: origins 2006-2016, every country. The level is held flat from the origin, or from the median of the last three years where purchases were under EUR 1bn a year (as the site does). The error is the site's cumulative error, log(Σ w·actual / Σ w·level), for 1-5 years and for 2022-2026 with 2026 at 8/12.
- Features known at the origin:
  - the series' own volatility (standard deviation of yearly log growth, last 5-8 years);
  - its size (log level);
  - its fuel share;
  - the number of near-zero years;
  - whether it is a former-Soviet neighbour or Mongolia.

  The partner's GDP volatility was dropped: the repository has GDP only from 2008. No distance data are committed either, so the neighbour flag stands in for distance.
- New band: a pooled regression predicts each window's error scale from these features. The errors are divided by that scale, and the 5th and 95th percentiles are taken per size class and horizon. The band is these percentiles × the scale × K.
- Old band, rebuilt on the same data: the 5th and 95th percentiles of the raw errors per size class and horizon, × K.
- K: for each method, the smallest K at which the leave-era-out coverage of the 2022-2026-style window reaches 90%. Each era is banded by a fit on the other two. The eras are origins 2006-09, 2010-12 and 2013-16, as in to_rus_cf.
- Applied to the site: each country's size-class band is changed per side by the ratio of its new band to the rebuilt old band. The ratio is taken on the log bounds, as round 46 did.

**Accepted only if all of these hold.**
1. Leave-era-out coverage overall is 88-92%. This must hold for the 2022-2026 window and for all horizons pooled.
2. Every size class (S, M, L) covers at least 85%, on both counts.
3. Every volatility tercile covers at least 85%, on both counts.
4. The new 2022-2026 band is narrower on average for the countries that are uncertain now. These are ranked countries on the size-class band whose net or Russia number is not "certain". Widths are compared before the placebo scaling.
5. In the 2014 placebo (pipeline/placebo.py, Russia shock), ranked "paid" coverage with the new bands is at least 87%, before any rescaling.

**Also reported, but not part of the rule:**
- coverage in each era;
- a check on the countries' own customs reports (IMF);
- a real-time check (trained only on windows already finished at the origin);
- the placebo scale re-derived for the new bands, in place of ×0.81.

## Result: rejected

Data file: `research/2026-10/gaps/hetero_bands_r47.json`. Script: [`scripts/hetero_bands_r47.py`](../scripts/hetero_bands_r47.py), run from the repository root with `python3 -I research/2026-10/scripts/hetero_bands_r47.py`. It reads committed files only. The build does not read the output, and nothing on the site changes.

**The new bands pass the back-test, but fail two of the five checks.**
- **Check 4 fails.** For the 92 uncertain countries, the new band is no narrower on average: the mean width ratio is 1.002. The median is 0.84, and 55 of 92 get narrower, but a few erratic buyers get much wider bands (Bermuda ×7.7, Brunei ×4.5, Trinidad ×4.3).
- **Check 5 fails.** In the 2014 placebo (the Russia shock), the new bands cover 86.4% of ranked countries for "paid", against 91.8% for the size-class bands at the same ×1. There are 20 misses below zero, against 12.
- **The reason.** Buyers that looked steady before 2014 were hit by the Russia shock just as hard. A calm past does not protect against a shock that starts in Russia. Round 46 found the same for single countries.

**The placebo scale makes it worse.** Re-derived the same way (the smallest factor at which 2014 ranked "paid" coverage reaches 90%), the new bands need **×1.25**. The size-class bands need ×0.81: the procedure reproduces the site's factor exactly.

## Back-test coverage (leave-era-out)

There are 1,785 five-year windows from the site's countries, origins 2006-2016. By size: S 743, M 535, L 507. K = 1.01 for the size-class band and 1.02 for the new band.

Each cell is the 2022-2026-style window, then all horizons pooled.

| group | size-class band | new band |
|---|---|---|
| overall | 90.0 / 89.7 | 90.0 / 89.8 |
| S | 89.6 / 89.3 | 89.8 / 89.6 |
| M | 90.5 / 90.1 | 90.3 / 89.9 |
| L | 89.9 / 89.7 | 90.1 / 90.0 |
| steadiest third | 94.1 / 93.8 | 90.4 / 90.4 |
| middle third | 90.3 / 90.5 | 91.3 / 90.8 |
| most erratic third | 85.5 / **84.7** | 88.4 / 88.3 |
| era 2006-09 | 87.9 / 86.5 | 85.9 / 84.9 |
| era 2010-12 | 92.2 / 91.8 | 94.0 / 92.9 |
| era 2013-16 | 90.3 / 91.1 | 91.1 / 92.3 |

- **Inside the back-test, the new band is better.** The size-class band is too wide for steady buyers and too narrow for erratic ones. On the pooled horizons it would itself fail check 3 (84.7%). The new band evens this out.
- **It is worse in shock eras.** In 2006-09 (the 2008-09 crisis) it covers 85.9% against 87.9%. This is the same weakness the placebo shows.
- **Checks not in the rule:**
  - Countries' own customs reports (IMF, origins 2010-2016, 1,070 windows): 90.7% for the new band and 91.4% for the size-class band. Every group is at 89% or more.
  - Real-time check (trained only on finished windows, origins 2011-2016): 92.2% against 90.9%.
- **What sets the width.** Only volatility (coefficient +0.34 on log volatility) and size (−0.13 on log level) matter. Fuel share (−0.04) and the neighbour flag (0.00) add nothing. The number of near-zero years adds little (+0.03).

## Effect on the site's chances

These come from the site's own model (site/index.html via node). The new band replaces the size-class band for the 181 countries that use one; own bands are untouched. Counts are for ranked net and Russia numbers on those countries. 112 are "certain" now.

| variant | certain after | lost | gained |
|---|---|---|---|
| new band × 1.25 (the honest, re-derived scale) | 96 | 16 | 0 |
| new band × 1 (no placebo scaling) | 105 | 9 | 2 (Namibia net and Russia) |
| new band × 0.81 (stacking the old factor: **not valid**) | 115 | 3 | 6 |

- **With the honest scale, no number becomes certain.** 16 numbers lose certainty, among them Kyrgyzstan, Egypt, Malaysia, Nigeria, Fiji, Bulgaria (net) and Norway, Portugal, Romania and Cyprus (Russia).
- **Several of the ~70 uncertain numbers move between "uncertain", "leaning" and "near zero".** None reaches 95%.
- The ×0.81 row is shown only because it is the tempting mistake. It would make Namibia, Mozambique and Georgia (Russia) and France (Russia) certain, but it uses a factor fitted for different bands.

## Caveats

- The back-test uses Russia's export records (BACI), not the importers' own Comtrade series behind the site's band, which are not committed before 2019. The own-report check uses IMF data.
- **Small flows.** BACI's small-flow population includes micro-territories. Its rebuilt size-class S band (2022-2026 high side about ×31) is much wider than the site's (×8.2). Changing the site's band by the ratio of the two is therefore generous to typical small buyers (ratios 0.2-0.4). Correcting this would widen small buyers' bands. That makes check 4 worse, so the rejection stands either way.
- The placebo bands at origin 2013 come from a fit on all windows, so the placebo is in sample. The same holds for the size-class bands.

## Recommendation

Keep the size-class band and ×0.81. One finding is worth keeping: the size-class band is too wide for steady buyers and too narrow for erratic ones in calm years. In a Russia shock, though, the steady buyers' wider band is what keeps coverage at 90%. The two effects cancel out on the site.
