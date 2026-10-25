# Own no-war bands for purchases from Russia (round 46)

Data file: `research/2026-10/gaps/own_bands_r46.json`. Generated 2026-10-25.
Built by [`scripts/own_bands_r46.py`](../scripts/own_bands_r46.py) from committed raw files only. Run from the repository root: `python3 -I research/2026-10/scripts/own_bands_r46.py`.

This file is a proposal. The build does not read it yet. It changes no central value. It only narrows the "expected without the war" band of "paid to Russia" (`to_rus`) for the countries that pass.

## Summary

- **30 countries were tested. 3 pass the rule: Kenya, Peru and French Polynesia.** The other 27 keep the generic band.
- The candidates are the uncertain numbers that a narrower paid band might push to a 95% chance. They come from the blocker analysis rerun on the current model, plus the other countries on the owner's list.
- **No number changes direction.** The new chances, from the site's own model with the own band in place of the as-built band:

| country | number | old chance | old group | new chance | new group |
|---|---|---|---|---|---|
| French Polynesia | Russia | 92.4% | near zero | **95.5%** | **certain** |
| French Polynesia | net | 97.7% | certain | 99.3% | certain |
| Kenya | net | 87.6% | leaning | 91.1% | leaning |
| Kenya | Russia | 84.1% | leaning | 88.5% | leaning |
| Peru | net | 77.4% | leaning | 82.4% | near zero |
| Peru | Russia | 74.1% | leaning | 80.3% | near zero |

  - Only French Polynesia's Russia number becomes certain. Its purchases from Russia are tiny (about EUR 0.2m a year).
  - Kenya would have needed its band at ×0.37-0.38 of the as-built band to reach 95%. Its own band gives about ×0.66.
  - Peru moves from "leaning" to "near zero". Its narrower range now stays within 0.5% of GDP, which is the site's near-zero test.
  - The Ukraine numbers do not change.
- **The placebo check holds.**
  - In the 2014 run, ranked coverage is 90.5% for "paid" and 89.9% for trade, with or without the three own bands.
  - All three countries contain zero in all 9 placebo windows, both with the generic band and with their own band. The windows are the 2014 and 2018 runs plus rolling base years 2011-2017.

## Method

The rule is the `cf_bands.json` B2 rule, used for Mongolia, Yemen, Tajikistan and Moldova, and in round 43 for Türkiye. It is unchanged here.

- **Series.** There are two real series per country, as in B2: the long mirror and the country's own report.
  - **A** is Russia's exports to the country, 2001-2021 (CEPII BACI, reconciled values by HS2).
  - **B** is the country's own customs report of imports from Russia, 2008-2021 (IMF IMTS).
  - Both series are made real by goods group:
    - fuel, cereals, fertilisers and metals use chained unit-value indices of Russia's exports to the world;
    - other goods use US import prices excluding fuels.
- **Centre.** The level is held flat from the origin, as the site does.
  - For countries the site starts from the 2019-2021 median (`small_flow_base`), the back-test starts from the median of the last three years.
  - This applies to all three accepted countries.
- **Band.** Per-year errors 1-5 years ahead are taken from rolling origins 2005-2020, keeping every year. Both series are pooled.
  - The band is the 5th-95th percentile, widened halfway to the bootstrap bounds.
  - The cumulative band is the generic band, scaled per side by the own/generic ratio, as Türkiye's was.
- **Acceptance.** All of these must hold:
  1. the 2022-2026 band is at least 10% narrower than the band the site builds now (generic × 0.81);
  2. leave-window-out coverage is at least 80% (12/15);
  3. out-of-time coverage is at least 80% (20/25);
  4. at least 90% of the country's own 5-year windows fall inside the band;
  5. there are at least 15 usable years.
- **One stricter point than the precedents.** Checks 2-4 must hold on series A and also on series B where the country reports to the IMF. B has no 2007 test window, so it is scored out of 10.

## Results

As built = `site/data.json` `to_rus.cb[5]`. Own = the proposed 2022-2026 band (2026 at 8/12). Width = own width ÷ as-built width. Coverage is given as leave-window-out; out of time.

| ISO | size | as built | own | width | A coverage | B coverage | own windows A / B | status |
|---|---|---|---|---|---|---|---|---|
| **PYF** | S | 0.43–6.84 | **0.70–3.03** | 0.36 | 14/15; 25/25 | 9/10; 25/25 | 12/12 / 7/7 | **accepted** |
| **KEN** | M | 0.57–2.77 | **0.90–2.36** | 0.66 | 13/15; 25/25 | 10/10; 25/25 | 12/12 / 7/7 | **accepted** |
| **PER** | M | 0.57–2.77 | **0.86–2.17** | 0.59 | 15/15; 20/25 | 10/10; 25/25 | 12/12 / 7/7 | **accepted** |
| COL | M | 0.57–2.77 | 0.70–2.23 | 0.70 | 12/15; 18/25 | 6/10; 17/25 | 12/12 / 7/7 | fails out of time (A and B), LWO on B |
| HRV | M | 0.57–2.77 | 0.57–1.79 | 0.55 | 11/15; 16/25 | 10/10; 19/25 | 10/12 / 6/9 | fails LWO, out of time, own windows |
| GEO | M | 0.57–2.77 | 0.60–2.28 | 0.76 | 5/15; 25/25 | 6/10; 25/25 | 9/12 / 7/7 | fails LWO (2008 war, embargo), as in round 6 |
| BEL | L | 0.65–1.50 | 0.79–1.53 | 0.88 | 11/15; 22/25 | 10/10; 19/25 | 12/12 / 8/9 | fails LWO (A), out of time (B), own windows (B) |
| URY | S | 0.43–6.84 | 0.32–3.57 | 0.51 | 14/15; 23/25 | 8/10; 20/25 | 11/12 / 6/7 | fails own windows on B (6/7) |
| SRB | L | 0.65–1.50 | 0.68–1.47 | 0.93 | 15/15; 16/25 | 9/10; 16/25 | 10/11 / 9/9 | not 10% narrower; out of time 16/25 |
| BGR | L | 0.65–1.50 | 0.77–1.59 | 0.97 | 15/15; 24/25 | 10/10; 24/25 | 11/12 / 9/9 | not 10% narrower |
| LBN | M | 0.57–2.77 | 0.52–2.68 | 0.98 | 12/15; 21/25 | 6/10; 21/25 | 12/12 / 9/9 | not narrower; LWO on B |
| JOR, MEX, SEN, PHL, UGA, AFG | | | | 1.1–2.5 | | | | own band wider than as built |
| CMR, NAM, AGO, RWA, BFA, DOM, VEN | | | | 1.9–4.1 | | | | own band wider; most also fail coverage |
| MLT, MOZ, NER, ZMB, BWA, BRN | | | | 7–2,285 | | | | tiny or erratic flows; own band far wider |

- **Too short.** All 30 have at least 16 usable years of series A. None was rejected on length.
- **Too volatile.** Most small African, Caribbean and Latin American buyers swing far more than the generic size-class band allows. Their own band is wider, sometimes many times wider (Brunei, Botswana, Zambia, Mozambique). The generic band is generous to them, not too wide.
- **Colombia, the closest miss.** Its own band is 30% narrower, but it covers only 18/25 (A) and 17/25 (B) out of time. The 2014-2020 errors were larger than anything before 2014.
- **Pipeline buyers (Bulgaria, Serbia).** Their own total band is not 10% narrower, and Serbia fails out of time. They would need the paid band at ×0.36 (Bulgaria) and ×0.13 (Serbia). Even a zero paid band leaves them at 96% and 95%. A Türkiye-style fuel-volume composite was not built: it could not plausibly reach those factors.

## Caveats for the builder

- **Kenya depends on the median start.** With the 2021 level held instead (not the method for Kenya), its band is 0.65–2.71. That is only 6.5% narrower than as built, which would fail rule 1.
  - The site uses the median start for Kenya, so the test matches the method. But the result is sensitive to that choice.
  - The JSON has this under `sensitivity_origin_year_start`.
- **Peru's out-of-time score on A is exactly 20/25,** the threshold. Mongolia and Türkiye were accepted at the threshold too.
  - With the 2021 level held instead, Peru passes more easily (23/25) with a wider band, 0.77–2.26.
- **French Polynesia** is a territory whose purchases from Russia are about EUR 0.2m a year. The band change is real by the rule but moves almost no money.
- **The placebo check is not out of sample.** The own bands were fitted on data that include the placebo years.
  - In the rolling run with base 2012, ranked coverage is 87.7% with or without the own bands. That gap was already there and is not caused by them.
- The fits pool A and B as B2 pooled the counterfactual series and Russia's mirror. IMF IMTS stands in for the counterfactual's Comtrade own report, which is not in the repository before 2019.

## How to apply

For each accepted ISO (KEN, PER, PYF), copy `countries.<ISO>.proposed_cf_bands_entry["countries.<ISO>.to_rus"]` into `cf_bands.json` `countries.<ISO>.to_rus`. It has the same keys as Türkiye's entry.

`counterfactual()` then replaces the generic multipliers and the cumulative band, and does not apply `CB_SCALE_PAID`. The expected `to_rus.cb[5]` values:

| ISO | cb[5] now | cb[5] new |
|---|---|---|
| KEN | [0.5707, 2.7739] | [0.895, 2.359] |
| PER | [0.5707, 2.7739] | [0.859, 2.168] |
| PYF | [0.433, 6.8417] | [0.70, 3.029] |

Also add the three countries to the `cf_bands` source label ("own bands for ...").
