# Counterfactual bands: 2022-2026 sums, neighbours' own bands, Moldova (round 6, B1-B3)

Data file: `research/2026-10/gaps/cf_bands.json`. Generated 2026-10-18. Not yet reviewed by a person.
Scripts: scratch folder `r6/cf_bands/`. They run in this order: `b1.py` (cumulative bands), `calib.py` (held-out calibration), `b2.py` (neighbours), `b3.py` (Moldova), `assemble.py` (JSON). Downloads are in `r6/cf_bands/dl/`.

This file moves no money. It changes how wide the "expected without the war" ranges are. For Moldova it also changes the expected level a little, from 1.00 to 0.973 × 2021.

## Summary

- **B1: adding the yearly bands was close to right.** The directly measured 90% band for the 2022-2026 total is about as wide as the current sum of yearly bands once it is made to hold out of sample. The width ratio is 0.8-1.2, and 0.98-1.14 for payments to Russia.
  - The reason: a country-flow's errors in different years are strongly correlated. The mean correlation between years is 0.6-0.7 for goods and 0.3-0.4 for services. A flow that is above the forecast in year 2 is usually still above it in year 5.
  - Measured only in sample, the cumulative bands look 10-35% narrower. But they cover only 84%, 63% and 85% of the held-out test, so they are too narrow. With a log-scale factor K = 1.2, coverage is 90% (2008 test) and 89% (2016 test).
  - **So B1 does not narrow the map much.** The direct rule is still cleaner and should replace the yearly sum. It narrows `from_rus` large flows (×0.79), `sell_ukr` medium and large flows (×0.80-0.88) and services (×0.85-0.93). It widens `buy_ukr` large flows (×1.56).
  - **"Paid to Russia" stays about as wide.** Its width comes from the size of each year's error and from the other range parts (see "What really makes the ranges wide").
- **B2: own bands help only for a few neighbours.** They are used for Mongolia (to_rus, from_rus), Yemen (to_rus), Tajikistan (from_rus) and Moldova (to_rus, via B3).
  - Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan and Armenia: their own history gives bands that are **wider on the high side** than the generic band. Their imports from Russia grew strongly in 2002-2021. The rule keeps the generic band, but the builder should know it is probably too narrow on the high side for them.
  - Georgia: its own band would be narrower, but it fails its own back-test, because of the 2006-2013 Russian embargo and the 2008 war.
- **B3: Moldova.** Three things inflated its range: Transnistria's gas, a gas recording break in the customs data, and the generic band for medium flows.
  - Fixed, the "paid to Russia" part goes from **+14.6% of GDP (−15.2% to +68.9%)** to **+14.2% (+9.8% to +23.2%)**. Positive means less money to Russia than expected.

## B1. The 2022-2026 total measured directly

**Rule now.** In `site/index.html` `spread()`, each year's band (`bmul_lo`, `bmul_hi`) is applied to that year's expected level, and the gaps are **added** over the years. This treats every year's error as perfectly correlated.

**What was measured.** The data is the back-tests of `counterfactual.json`: origins 2007, 2012 and 2016, the chosen model per flow, and the random walk for hubs, Belarus and non-reporters. For each test and country-flow:

> cumulative ratio m_H = Σ_{h≤H} w_h · actual_h / Σ_{h≤H} w_h · predicted_h (real levels), H = 1…5, with w = 1 except 2026 = 8/12.

- **Missing target years** (2014-2015 in the 2013 test; 2020 in the 2016 test) are filled by interpolating that case's log error between its neighbouring years. Two variants check this: available years only, and the 2016 test with the real 2020 (COVID) values. Both give nearly the same bands (in the JSON).
- **Percentiles.** The 5th, 50th and 95th percentiles of log m_H are taken per flow × size class. The thin-cell rule is the same as in `counterfactual.json`.
- **Calibration.** The log percentiles are then multiplied by **K = 1.2**, set so that bands from two tests cover 90% of the third (`calib.py`).

**Cumulative 90% band for 2022-2026 (2026 at 8/12), multiplier on the summed central expected level**

| flow/size | model | 1 year | 3 years | **2022-2026** | current sum of yearly bands | width vs current | in-sample, uncalibrated | n |
|---|---|---|---|---|---|---|---|---|
| to_rus/S | rw | 0.22–5.32 | 0.26–7.86 | **0.30–8.21** | 0.20–7.14 | 1.14 | 0.37–5.78 | 114 |
| to_rus/M | rw | 0.40–2.61 | 0.41–2.98 | **0.42–3.51** | 0.33–3.47 | 0.98 | 0.49–2.85 | 143 |
| to_rus/L | rw | 0.67–1.51 | 0.58–1.59 | **0.61–1.74** | 0.57–1.63 | 1.07 | 0.66–1.58 | 123 |
| from_rus/M | lin | 0.61–1.69 | 0.59–1.72 | **0.58–1.76** | 0.53–1.71 | 1.01 | 0.63–1.61 | 114 |
| from_rus/L | lin | 0.91–1.31 | 0.74–1.26 | **0.71–1.28** | 0.65–1.37 | 0.79 | 0.75–1.23 | 81 |
| buy_ukr/M | lin | 0.47–2.01 | 0.47–2.45 | **0.30–2.53** | 0.38–2.36 | 1.13 | 0.37–2.17 | 100 |
| buy_ukr/L | lin | 0.48–1.97 | 0.48–2.43 | **0.38–2.35** | 0.47–1.74 | 1.56 | 0.45–2.04 | 114 (M+L) |
| sell_ukr/M | rf | 0.72–1.46 | 0.62–1.41 | **0.57–1.54** | 0.46–1.57 | 0.88 | 0.62–1.43 | 61 |
| sell_ukr/L | rf | 0.72–1.47 | 0.59–1.47 | **0.54–1.57** | 0.28–1.57 | 0.80 | 0.60–1.45 | 75 (M+L) |
| svc_bought/M | rw | 0.69–1.45 | 0.71–1.60 | **0.66–1.57** | 0.65–1.65 | 0.91 | 0.70–1.45 | 80 |
| svc_sold/M | rw | 0.85–1.53 | 0.74–1.51 | **0.69–1.58** | 0.72–1.76 | 0.85 | 0.74–1.47 | 73 |
| svc_sold/L | rw | 0.91–1.61 | 0.80–1.63 | **0.70–1.57** | 0.77–1.79 | 0.85 | 0.74–1.46 | 100 (M+L) |

- All 18 chosen-model cells plus the nine random-walk cells for goods (used by hubs) are in `cumulative_bands`, with horizons H1-H5 and H5_2026_8of12.
- Each cell also gives the bootstrap 80% interval of its bounds and the two variants.
- "Width vs current" = (high − low) / (current high − current low). "Shrink" per side is in `shrink_vs_current`.

**Held-out coverage of the 2022-2026 band.** Bands come from the other test(s) and are scored on the held-out one.

| | T2008 | T2013 | T2016 |
|---|---|---|---|
| cumulative band, K = 1.2 | 0.90 | 0.66 | 0.89 |
| cumulative band, uncalibrated | 0.84 | 0.63 | 0.85 |
| current sum of yearly bands | 0.97 | 0.91 | 0.93 |

- In the 2013 test (the 2014-2016 Russia-side shock) every band is too narrow. Services there score 34-44%, because only the 2008 test can train a 5-year services sum (the 2016 test has no 2020-2021 services targets).
- **The current sum over-covers slightly** (93-97% outside 2013), so it is a little too wide, but only by about 10%.

**How to apply.** In `spread()`:
- replace `ql += e - ex(i, t.m, t.ql[i])` and `qh += …` with `ql = (1 − band.low) · Σe_i` and `qh = (band.high − 1) · Σe_i`;
- here e_i = base × FRAC_i × bmul_i (central), and band = `cumulative_bands[model][flow/size][H]`, with H = the number of years summed (`H5_2026_8of12` for the full period);
- the model is `obj.cf` (rw, lin or rf); hubs, Belarus and non-reporters use the `rw` cells;
- the size class is `size_class` in `counterfactual.json` per country-flow.

The yearly bands stay for the single-year view (`spreadYear`, `above3`).

## What really makes the ranges wide

1. **The yearly random-walk error itself.** A medium-size flow held at 2021 is ×0.4-2.6 after one year. That is the evidence: trade with Russia moves a lot even without a war.
2. **Double counting with `base_range`.** For random-walk flows the back-test error already includes the chance that 2021 was an unusual year: every origin year is "a year", good or bad. Adding the 2019-2021 alternative baseline in quadrature counts that risk twice.
   - Suggestion: for flows with a counterfactual band, `base_range` should only hold the 2021 measurement range (own report against the partner's mirror report), not the 2019-2021 average.
3. **Data problems.** These are Moldova's (B3): ranges built from series that mix perimeters, like gas being in or out, or Transnistria being in or out.

## B2. Own bands for Russia's neighbours

**Method** (as `belarus.json`):
- Real series 2002-2021: the counterfactual's own series, plus Russia's mirror report as a second series, pooled.
- Random-walk errors 1-5 years ahead from rolling origins 2005-2020, with all years kept, 2009, 2014-15 and 2020 included.
- 5th-95th percentile of error / √(h/3), widened halfway to the block-bootstrap (by origin) 10%/90% bounds.
- The cumulative band is the B1 calibrated generic band, scaled per side by the own/generic ratio of the log bounds in the same year.
- **Used only when two conditions hold:**
  1. the 2022-2026 cumulative band is at least 10% narrower than the generic one;
  2. coverage holds on the country's own data: at least 80% leave-window-out on the three test windows, and at least 80% out of time (trained to 2013, scored on origins 2014-2020).

| country | flow | size | own 2026 (per year) | generic 2026 | own 2022-26 sum | generic 2022-26 sum | width ratio | own coverage (LWO; out of time) | used |
|---|---|---|---|---|---|---|---|---|---|
| MDA | to_rus | M | 0.32–4.67 | 0.21–5.08 | 0.53–3.29 | 0.42–3.51 | 0.90 | 14/15; 25/25 | via B3 |
| MDA | from_rus | M | 0.33–2.57 | 0.41–2.07 | 0.43–2.78 | 0.52–2.20 | 1.40 | 11/15; 24/25 | no |
| KGZ | to_rus | L | 0.76–2.71 | 0.47–1.91 | 0.84–2.34 | 0.61–1.74 | 1.33 | 14/15; 21/25 | no (wider) |
| TJK | to_rus | L | 0.79–2.79 | 0.47–1.91 | 0.86–2.39 | 0.61–1.74 | 1.36 | 13/15; 21/25 | no (wider) |
| TJK | from_rus | S | 0.16–3.04 | 0.04–4.29 | 0.41–2.59 | 0.21–3.48 | 0.67 | 15/15; 22/25 | **yes** |
| ARM | to_rus | L | 0.61–4.40 | 0.47–1.91 | 0.72–3.53 | 0.61–1.74 | 2.48 | 15/15; 25/25 | no (wider) |
| GEO | to_rus | M | 0.34–3.75 | 0.21–5.08 | 0.55–2.78 | 0.42–3.51 | 0.72 | 7/15; 25/25 | no (fails coverage) |
| MNG | to_rus | L | 0.77–2.07 | 0.47–1.91 | 0.85–1.85 | 0.61–1.74 | 0.89 | 12/15; 25/25 | **yes** |
| MNG | from_rus | S | 0.42–3.08 | 0.04–4.29 | 0.66–2.62 | 0.21–3.48 | 0.60 | 12/15; 24/25 | **yes** |
| KAZ | to_rus | L | 0.59–2.00 | 0.47–1.91 | 0.71–1.81 | 0.61–1.74 | 0.97 | 14/15; 25/25 | no (not 10% narrower) |
| UZB | to_rus | L | 0.76–2.30 | 0.47–1.91 | 0.84–2.03 | 0.61–1.74 | 1.05 | 15/15; 23/25 | no |
| TKM | to_rus | M | 0.24–5.35 | 0.21–5.08 | 0.45–3.65 | 0.42–3.51 | 1.04 | 12/15; 18/25 | no |
| YEM | to_rus | M | 0.38–2.77 | 0.21–5.08 | 0.58–2.19 | 0.42–3.51 | 0.52 | 13/15; 22/25 | **yes** |
| SYR | to_rus | M | 0.09–5.00 | 0.21–5.08 | 0.25–3.46 | 0.42–3.51 | 1.04 | 15/15; 25/25 | no |
| LBN | to_rus | M | 0.31–5.89 | 0.21–5.08 | 0.52–3.93 | 0.42–3.51 | 1.11 | 10/15; 22/25 | no |

The exports to Russia of KGZ, ARM, GEO, KAZ, UZB, TKM, YEM, SYR and LBN are all wider on their own data and keep the generic band (see `tested_not_used`).

**Effect on the map** ("paid to Russia" part, % of GDP, central and range; current → with own band):
- Mongolia: −5.5 (−19.4 to +14.1) → −5.5 (−12.3 to +20.9). Same width, moved up.
- Yemen: −7.1 (−18.8 to +24.5) → −7.1 (−17.0 to +11.5).
- Tajikistan's and Mongolia's sales to Russia (counted at profit) narrow by about 20%.

**Points for the builder:**
- Own errors are **skewed upward** for the growing Central Asian and Caucasus economies: the median own error is +14% to +20% per √(h/3). Holding 2021 flat probably sets their no-war level too low, and the generic band's high side is too short for KGZ, TJK, ARM, KAZ and UZB.
  - If applied, this would make their post-2022 rise in purchases from Russia look less war-driven (smaller "more paid to Russia").
  - It is not applied, because the rule keeps the generic band unless the own band is narrower. But it is worth stating in the method page.
- The Yemen, Syria and Lebanon series are short and conflict-ridden. Yemen's own band is used, Syria's and Lebanon's are not.
- IMF DOTS/IMTS was not downloaded separately. The two Comtrade-based series (own report with mirror, and Russia's mirror alone) are what IMF DOTS also uses for most of these countries.

## B3. Moldova: Transnistria, gas and the starting year

### What the data shows

1. **Moldova's customs data include the right bank's Gazprom gas in every year, but under different codes.** Comtrade, Moldova's imports from Russia:

   | year | TOTAL (USD m) | HS 2711 | HS 99 (confidential) | gas in TOTAL (USD m) |
   |---|---|---|---|---|
   | 2008 | 666 | 312 (885 kt) | 0.5 | 312 |
   | 2010 | 587 | 323 (861 kt) | 0.3 | 323 |
   | 2011 | 823 | 38 (LPG) | 392 | 392 |
   | 2015 | 536 | 14 | 259 | 259 |
   | 2019 | 693 | 10 | 247 | 247 |
   | 2020 | 604 | 4 | 162 | 162 |
   | 2021 | 1,054 | 370 (867 kt) | 0.8 | 370 |
   | 2022 | 1,145 | 704 (617 kt) | – | 704 |
   | 2023 | 322 | 81 | 0 | 81 |
   | 2025 | 220 | 0 | 0 | 0 |

   - In 2011-2015 and 2017-2020 the gas is hidden under HS 99. TOTAL is consistent, but `customs_gas.json` (HS 2711 only) shows almost no Moldovan gas before 2021.
   - The transit-gas swap in `build_data.py` subtracts customs gas and adds final-use gas. For 2019-2020 it therefore **counts the gas twice** in the 2019-2021 base (about +EUR 0.11bn a year on the average). It does no harm today only because the counterfactual resets the base to 2021.
2. **Transnistria is not in Moldova's customs data.** Its 2.6-2.9 bcm a year of Gazprom gas was never paid for. `narrow.json` removed it from the series.
   - But `site/data.json` still has it in the **high** values, because the energy transit-gas swap adds `energy2.json` `transit_gas` high back in:
     - `years_hi` 2022-2026 = 2.95, 3.13, 1.36, 0.92, 0.76, against narrow.json's 1.35, 0.37, 0.24, 0.24, 0.15;
     - `base_range` high = 1.41, from the mirror including Transnistria's gas.
   - The low end of the "less paid" range (−15% of GDP) comes mainly from the inflated `years_hi`. The `base_range` high adds about EUR 3bn to the high end.
3. **Is 2021 a fair starting point?**
   - **Gas: yes for the volume, no for the price.** The right bank bought 1.04, 1.06 and 1.20 bcm in 2019-2021; 2021 was cold and after COVID. The 2021 price was the Q4 spike (new TTF/oil contract from November 2021).
     - The map already uses 2021 at 2019-2021 prices, so the price is handled.
     - The volume is better taken as the 2019-2021 average: 0.92 × 2021.
   - **Non-gas goods: 2021 was high**, EUR 557m real against about 400m in 2019-2020, the year of Moldova's import boom. The rule holds 2021 flat; the 2019-2021 average (0.81 × 2021) is the low end of the base range.
   - The 2021 base at pre-war prices = gas 0.248 + non-gas 0.510 = **EUR 0.758bn**, against the map's 0.750, so the map's central base is right.
   - The 2019-2021 alternative is 0.641. It matches the map's `base_2019_2021_avg`, 0.642.

### Band

- **Non-gas** (67% of the base): Moldova's own 2002-2021 non-gas history, random walk. Own coverage is 15/15 leave-window-out and 25/25 out of time. The per-year band is ×0.83-1.37 in 2022 and ×0.65-2.03 in 2026.
- **Gas** (33%): central 0.92 × 2021 volume, range 0.78-1.10. This is an educated guess: right-bank use of 1.0-1.2 bcm, weather and efficiency. The same draw is used in every year.
- **Composite** by Monte Carlo, with non-gas errors correlated 0.7 between years:

| | 2022 | 2023 | 2024 | 2025 | 2026 | 2022-2026 sum |
|---|---|---|---|---|---|---|
| central × 2021 | 0.973 | 0.973 | 0.973 | 0.973 | 0.973 | 1.0 × summed central |
| range (new) | 0.86–1.23 | 0.82–1.36 | 0.79–1.47 | 0.76–1.58 | 0.74–1.67 | 0.85–1.44 |
| generic (old) | 0.49–2.11 | 0.37–2.84 | 0.30–3.56 | 0.25–4.30 | 0.21–5.08 | 0.42–3.51 |

### Recommendation for Moldova (`to_rus`)

1. **Actual values:** narrow.json's right-bank customs series, central and range. **Do not let the transit-gas swap re-add Transnistria's gas** in `years_hi`. The simplest fix: exclude MDA from the swap, because its customs TOTAL already contains the right-bank gas (as HS 2711 or HS 99).
2. **Base:** EUR 0.758bn at 2019-2021 prices (2021). `base_range` = 0.641–0.78 (2019-2021 average to 2021 +3%), not 0.537–1.415.
3. **Expected path:** `cf_bands.json` `countries.MDA.to_rus`: central 0.973 × 2021, the yearly band above, and the cumulative band 0.85–1.44.
4. **Transnistria stays out on both sides.** Its gas was a Russian subsidy to Transnistria, not a payment by Moldova. It cannot appear in the base (2021) if it is absent from the actuals.
   - Gas reaching Transnistria from February 2025 was financed through Russia. That is also not a Moldovan payment.
5. **Effect:** "paid to Russia" is +14.2% of GDP (+9.8% to +23.2%), against +14.6% (−15.2% to +68.9%). With only fixes 1-2 and the generic band: +14.2% (+2.0% to +65.5%). The band is the main lever.
6. **Certainty:** C, because the gas range is a guess.

**Open point.** From late 2022 the right bank bought most of its electricity from the Cuciurgan power plant (MGRES) in Transnistria. The plant is owned through a Russian state company's group and was fired by the free Russian gas. Before the war Moldova also bought most of its power there, so the change is small. This is not counted.

## Overlaps

- No money amounts. `countries{}` entries **replace** the `counterfactual.json` multipliers for those flows and add a `cumulative_band`; nothing is added.
- Belarus keeps `belarus.json`.
- Moldova's actual values stay as in `narrow.json`. `energy2.json` `transit_gas` (Transnistria in the high case) must not be swapped back into MDA `to_rus`.
- Laundered oil (`laund`) and Moldova's other parts are unchanged.

## Open questions

- Should the near-zero 2013-test coverage of the services bands be fixed by widening services, or accepted as a Russia-side-shock warning (as in `counterfactual.json`)?
- Should the upward skew of the Central Asian and Caucasus neighbours become a trend in their central path? It would need a back-test of its own; a damped trend failed for Belarus.
- Applying the `base_range` double-count fix to all random-walk flows would narrow many ranges more than B1 does. It needs a builder check across all countries.
