# Captive energy buyers: a narrower band for their energy purchases from Russia? (round 53)

Data file: `research/2026-10/gaps/captive_bands_r53.json`. Script: `research/2026-10/scripts/captive_bands_r53.py`.

## The rule (written 2026-10-25 22:05 UTC, before any back-test result was computed)

**Captive flow.** A country × energy product (HS 2701 coal, 2709 crude, 2710 oil products, 2711 gas) is captive when:
1. Russia's share of the country's imports of that product is **at least 70%**. For the 2022-2026 use this is the 2017-2021 average. In the back-test it is the average of the four years up to the origin (o−3..o), so no window is picked because of its own future.
2. **The product could not reach the country by sea.** Either the country is landlocked (UN LLDC list plus the landlocked European countries), or the product is gas and the country had no LNG import terminal feeding its grid in that year.
3. The flow averaged at least **EUR 10 m a year** at fixed 2019-2021 unit values.

**Data.** Eurostat energy imports by country of origin (gas TJ, crude and oil products kt, coal kt) for the countries Eurostat covers. Elsewhere, CEPII BACI: Russia's exports to the country in tonnes, with shares measured on value. Each country uses one data set. Products are added at round 8's fixed unit values: crude EUR 370/t, products 420/t, gas EUR 4.67/GJ, coal 60/t. A BACI tonnage counts only if its unit value is within ×1/3 to ×3 of the world unit value. A Eurostat zero between positive years counts as missing.

**Unit of test.** A country's captive energy basket at an origin, in volume. The centre is **held flat** at the origin year, as the site's to_rus centre is. The error is the site's cumulative error, H1-H5, with the fifth year at 8/12. Band origins are 2005-2016; 2017 is used only for the 2018 placebo. Ukraine and Russia are left out; Belarus is included.

**Band.** Era-calibrated 90% band: the 5th-95th percentile × K, with eras 2005-09, 2010-12 and 2013-16. This is the round 7/48 method.

**The pooled captive band replaces the general band for those flows only if all of these hold:**
- (a) Its 2022-2026 (H5) band is **narrower in log width** than the current site band for those flows. That is the generic band for large purchases × CB_SCALE_PAID, **0.652-1.500**, the band almost every captive country carries.
- (b) **Coverage.** With bands built from the other two eras × K, H5 coverage is at least 80% at **each** origin 2005-2016 and at least 90% pooled.
- (c) **Placebo.** With the war moved to 2014 (origin 2013, H5, trained on origins ≤ 2008) and to 2018 (origin 2017, H4, trained on ≤ 2013), the band covers at least 90%.
- (d) **Centre.** It stays held flat. This round changes only the range.

**Per country, only if the pooled rule passes:**
- the country has at least 6 H5 windows;
- the pooled band covers at least 80% of them;
- the band rebuilt without the country also covers at least 80% of them;
- its combined 2022-2026 band (next paragraph) is narrower than its current one.

**Application ("paid" is all goods).**
- W = the captive products' share of the country's 2021 purchases from Russia (BACI value). Each year it is raised by the no-war fuel price factor in the expected path, as in round 44's Japan LNG split.
- The combined half-width per side is √((W·a)² + ((1−W)·b)² + 2ρ·W(1−W)·a·b). Here a is the captive energy band, b is the country's current band (before the strike adjustment of rounds 51-52), and ρ = 0.26, the owner's value for the fuel/non-fuel correlation.
- The strike widening is then added back unchanged.
- The yearly bands are scaled per side by the same factor.

**Stress cases reported:** the 2006 and 2009 gas crises (Ukraine transit) and the 2014 shock.

**Diagnostics (pass nothing):** the value-deflated variant, gas/oil/mixed groups, Eurostat/BACI split, without Belarus, and the look-ahead variant (the 2017-2021 captive list applied to every origin).

(Results below this line were added after the run.)

## Verdict: the idea fails. No country changes

- **The band is wider, not narrower.** Measured only on captive energy flows (206 five-year windows, 21 countries, origins 2005-2016), the 2022-2026 band is **0.567-1.755**. The current site band is **0.652-1.500**, so the captive band is **1.36× wider** in log terms. It is even wider than the unscaled generic band for large flows (0.57-1.62).
- **It fails three of the four tests:**
  - (a) it is not narrower;
  - (b) leave-era-out coverage is 92.7% pooled, but only **77.8% at the 2012 origin**;
  - (c) the placebo with the war moved to 2014 covers only **84%** (the 2018 placebo covers 95%).
  - (d) the centre stays held flat. The median five-year error is −3%, so flat is about right.
- **Every variant also fails (a).** That includes gas only, Eurostat only, without Belarus, value-deflated, large flows only (post hoc), and the look-ahead list (which flatters by construction).
- **Why.** "One supplier" fixes who sells, not how much is bought. Captive volumes still moved with:
  - demand and weather, and the 2009 recession: gas fell to ×0.46-0.76 of 2008 in Romania, North Macedonia, Estonia, Serbia and Bulgaria;
  - domestic output, where imports are only the residual: Romania's gas imports went ×0.39 in 2014, then ×8 from 2015; Kazakhstan's fuel imports went ×0.26 in 2014;
  - Belarus's oil-supply disputes;
  - single refinery or contract events: Mongolia's products ×1.3-1.6, Tajikistan's ×2.4 in 2014, North Macedonia's gas growth ×1.7-2.0.
- **The current site band slightly under-covers these flows.** It covers only 88% of the captive windows, not 90%. If anything, it is a little narrow for energy on its own.
- **What does work.** Round 8's pipeline baskets (Druzhba crude plus pipeline gas, flows of EUR 0.3 bn or more) remain the narrow case. The share criterion does not pick out the same thing.
  - It lets in residual importers: Romania, Kazakhstan, and Lithuania before its LNG terminal.
  - It lets in rail-borne products for Central Asia and Mongolia, which round 8 had already found unusable.
  - Steady single countries do exist (Slovakia 0.91-1.04, Hungary 0.88-1.04, Bulgaria 0.80-1.16 on their own windows), and Slovakia, Hungary and Czechia already carry round 8's band.

## Band comparison (2022-2026, H5 with 2026 at 8/12; multiplier on the summed expected level)

| set | band | windows | countries | log width vs site band | site band's coverage of these windows | fails |
|---|---|---|---|---|---|---|
| **captive energy, pooled (the rule)** | **0.567-1.755** (K 1.23) | 206 | 21 | **1.36** | 0.88 | a, b (2012: 0.78), c (2014: 0.84) |
| current site band (generic L × 0.81) | 0.652-1.500 | – | – | 1.00 | – | – |
| unscaled generic L (to_rus_cf) | 0.570-1.617 | – | – | 1.25 | – | – |
| gas only | 0.518-1.611 | 119 | 13 | 1.36 | 0.89 | a |
| oil (crude/products) only | 0.594-2.106 | 37 | 5 | 1.52 | 0.87 | a, b, c |
| mixed baskets | 0.403-2.316 | 50 | 5 | 2.10 | 0.86 | a, b, c |
| Eurostat countries | 0.470-1.857 | 142 | 14 | 1.65 | 0.90 | a |
| BACI countries | 0.553-2.231 | 64 | 7 | 1.67 | 0.83 | a, b, c |
| without Belarus | 0.566-1.665 | 194 | 20 | 1.30 | 0.88 | a, b, c |
| value deflated by world unit value (not volume) | 0.337-3.369 | 212 | 22 | 2.76 | 0.73 | a, b, c |
| post hoc: flows ≥ EUR 300 m at origin | 0.554-1.534 | 146 | 16 | 1.22 | 0.90 | a, c |
| look-ahead: 2017-2021 list at every origin | 0.698-1.757 | 187 | 17 | 1.11 | 0.91 | a, c |
| as written (no trailing-zero cleaning) | 0.512-1.750 | 213 | 22 | 1.47 | 0.85 | a, c |

Captive band by horizon: H1 0.615-1.491, H2 0.661-1.711, H3 0.614-1.790, H4 0.575-1.801, H5 0.567-1.755.

## Per country (back-test windows, H5)

- Pooled band coverage and leave-country-out coverage are in `per_country_backtest`.
- Below, the own 5-95% is the uncalibrated own quantile. The own calibrated band is in `diagnostics.per_country_own_band`.

| country | windows | products | median error | own 5-95% | pooled band covers | leave-country-out covers |
|---|---|---|---|---|---|---|
| SVK | 12 | crude, gas | 0.97 | 0.91-1.04 | 1.00 | 1.00 |
| HUN | 12 | crude, gas | 0.94 | 0.88-1.04 | 1.00 | 1.00 |
| BGR | 12 | gas | 1.02 | 0.80-1.16 | 1.00 | 1.00 |
| CZE | 12 | gas | 1.05 | 0.88-1.33 | 1.00 | 1.00 |
| FIN | 12 | gas | 0.87 | 0.75-0.99 | 1.00 | 1.00 |
| EST | 12 | gas | 0.85 | 0.71-0.99 | 1.00 | 1.00 |
| LVA | 12 | gas | 0.91 | 0.73-1.35 | 1.00 | 1.00 |
| SRB | 12 | crude, gas | 0.93 | 0.68-1.51 | 1.00 | 1.00 |
| POL | 8 | gas (to 2015) | 1.06 | 0.96-1.17 | 1.00 | 1.00 |
| LTU | 9 | gas (to 2013) | 0.93 | 0.61-1.08 | 1.00 | 0.89 |
| KGZ | 10 | products | 1.06 | 0.83-1.47 | 1.00 | 1.00 |
| MNG | 12 | products | 1.31 | 1.07-1.53 | 1.00 | 1.00 |
| BLR | 12 | crude, gas, products, coal | 0.98 | 0.82-2.58 | 0.83 | 0.83 |
| ARM | 6 | gas | 1.04 | – | 1.00 | 1.00 |
| KAZ | 12 | crude, products, coal | 0.81 | 0.36-1.30 | 0.83 | 0.67 |
| TJK | 9 | products | 0.82 | 0.64-2.13 | 0.78 | 0.67 |
| MKD | 12 | gas | 1.29 | 1.08-1.85 | 0.92 | 0.75 |
| ROU | 12 | gas | 0.68 | 0.41-3.39 | 0.50 | 0.42 |
| MDA, UZB, HRV | 4, 3, 1 | – | – | – | – | – |

- **Own bands per country** (the owner's "separately per country where n allows"; a diagnostic only).
  - No country can pass on its own. The placebo needs 10 or more training windows, and a country has only 4 origins up to 2008.
  - The calibrated own bands with K up to 3 are often wide: Belarus 0.54-17, Romania 0.07-39.
  - The steady ones are Slovakia (0.82-1.08) and Hungary (0.69-1.11), which already carry round 8's band, and Bulgaria (0.60-1.41).

## Stress cases

- **2006 gas crisis** (origin 2005, single year).
  - No captive gas flow fell by more than 12% for the year (Austria ×0.89). It was a three-day cut.
  - Belarus's products+coal basket doubled (×2.16; a small, noisy basket).
  - The 16 H5 windows containing 2006 have a median error of ×1.00.
- **2009 gas crisis plus the recession** (origin 2008).
  - Romania ×0.46, North Macedonia ×0.66, Estonia ×0.68, Serbia ×0.71, Bulgaria ×0.76. The transit stop and the recession cannot be separated in annual data.
  - The 61 H5 windows containing 2009 have a median of ×0.95.
  - The 2005-2009 origins are covered at 86-100% (leave-era-out).
- **2014 shock** (origin 2013).
  - Kazakhstan ×0.26, Romania ×0.39, Latvia ×0.56, Czechia ×0.77, Estonia ×0.79; Tajikistan ×2.38, Serbia ×1.36.
  - The 89 H5 windows containing 2014 have a median of ×0.98, but the tails are wide.
  - The 2014 placebo covers 84%. The 2012 origin's windows (2013-2017) are the worst covered (78%).

## Site effect

**By the rule, nothing changes.** The pooled test fails, so `site_patch_r53.json` "rule" is empty: 0 group or side changes.

**Diagnostic only: what the owner's combination would do if forced on all 17 captive countries.**
- W is the captive share of 2021 purchases, raised by the no-war fuel price factor. ρ = 0.26. "Split only" combines the country's own current band with itself at the same W.
- **Caution.** Most of the narrowing below comes from splitting "paid" into two parts that are not perfectly correlated, not from steadier energy.
  - The general band was measured on total trade, so it already contains that diversification.
  - Against the split-only baseline, the captive energy band **widens every country except Bosnia** (column "vs split only" > 1).
  - So the narrowings are an artefact of the combination formula and should not be read as evidence.

| country | W | today's band | combined | log width ratio | split only | vs split only | paid range width, % GDP (before → forced) | net group (before → forced) | Russia's earnings group |
|---|---|---|---|---|---|---|---|---|---|
| ARM | 0.25 | 0.645-1.506 | 0.685-1.468 | 0.90 | 0.85 | 1.06 | 8.51 → 7.83 | leaning Russia 0.67 → 0.68 | leaning Russia 0.69 → 0.70 |
| BGR | 0.37 | 0.652-1.500 | 0.697-1.472 | 0.90 | 0.81 | 1.12 | 6.86 → 6.49 | certain Ukraine 0.95 → 0.96 | leaning Ukraine 0.90 → 0.92 |
| BIH | 0.26 | 0.571-2.774 (M) | 0.636-2.382 | 0.84 | 0.87 | 0.96 | 4.46 → 3.64 | leaning Ukraine 0.87 → 0.89 | leaning Ukraine 0.85 → 0.87 |
| BLR | 0.37 | 0.789-1.309 (own, yearly) | 0.766-1.381 | 1.16 | 0.81 | 1.43 | 19.00 → 22.42 | leaning Russia 0.78 → 0.74 | leaning Russia 0.78 → 0.74 |
| CZE | 0.56 | 0.831-1.390 (round 8) | 0.730-1.495 | 1.39 | 0.81 | 1.73 | 3.65 → 4.23 | certain Ukraine 0.97 → 0.97 | leaning Ukraine 0.83 → 0.81 |
| EST | 0.05 | 0.652-1.500 | 0.663-1.486 | 0.97 | 0.96 | 1.01 | 10.97 → 10.84 | certain Ukraine | certain Ukraine |
| FIN | 0.02 | 0.721-1.496 (round 8) | 0.723-1.491 | 0.99 | 0.99 | 1.00 | 6.54 → 6.51 | certain Ukraine | certain Ukraine |
| HUN | 0.48 | 0.820-1.239 (round 8) | 0.748-1.415 | 1.54 | 0.80 | 1.93 | 3.80 → 4.69 | certain Russia 0.97 → 0.96 | certain Russia 0.97 → 0.97 |
| KAZ | 0.04 | 0.648-1.503 | 0.657-1.492 | 0.98 | 0.97 | 1.00 | 4.15 → 4.06 | essentially zero | essentially zero |
| KGZ | 0.38 | 0.625-1.525 | 0.669-1.499 | 0.90 | 0.81 | 1.11 | 15.38 → 14.48 | certain Russia 0.97 → 0.98 | certain Russia 0.97 → 0.97 |
| LVA | 0.28 | 0.652-1.500 | 0.695-1.462 | 0.89 | 0.83 | 1.07 | 4.08 → 3.91 | certain Ukraine | certain Ukraine |
| MDA | 0.38 | 0.848-1.435 (own) | 0.789-1.443 | 1.15 | 0.82 | 1.40 | 9.32 → 9.60 | certain Ukraine 0.99 → 0.98 | certain Ukraine 0.98 → 0.98 |
| MKD | 0.71 | 0.574-1.521 (round 8) | 0.640-1.594 | 0.94 | 0.82 | 1.14 | 3.40 → 3.42 | leaning Russia 0.73 → 0.72 | leaning Russia 0.91 → 0.90 |
| MNG | 0.56 | 0.802-1.927 (own) | 0.689-1.708 | 1.03 | 0.85 | 1.22 | 17.65 → 15.87 | leaning Russia 0.78 → 0.83 | leaning Russia 0.76 → 0.83 |
| SRB | 0.32 | 0.652-1.500 | 0.696-1.465 | 0.89 | 0.82 | 1.09 | 4.63 → 4.35 | leaning Russia 0.82 → 0.84 | leaning Russia 0.82 → 0.84 |
| SVK | 0.88 | 0.857-1.247 (round 8) | 0.605-1.685 | 2.73 | 0.92 | 2.95 | 7.20 → 9.74 | too close to call 0.58 → 0.57 | too close to call 0.59 → 0.57 |
| TJK | 0.33 | 0.652-1.500 (own band only on sales) | 0.696-1.467 | 0.89 | 0.82 | 1.10 | 8.31 → 7.67 | too close to call 0.58 → 0.58 | too close to call 0.57 → 0.58 |

- **Even forced, no country changes group or side**, for either the net or Russia's earnings.
- The biggest width changes are widenings for the round 8 pipeline countries (Slovakia +2.5 points of GDP, Belarus +3.4) and narrowings for Mongolia (−1.8) and Kyrgyzstan (−0.9). The narrowings come from the split.

## What is doubtful

- **The route criterion is coarse.** "Landlocked, or gas without an LNG terminal" ignores interconnectors and alternative pipelines: Balticconnector, Iasi-Ungheni, HAG, Adria, IKL, Iran-Armenia. It therefore counts Romania, Croatia and Latvia's gas, and Hungarian crude in the early years.
  - A stricter route rule would drop some of the volatile flows (Romania), but also some steady ones.
  - A post-hoc check, which passes nothing, shows that dropping Romania brings the band close to the site's but not under it: 0.665-1.597 (×1.05) for all flows, still failing the 2014 placebo (78%), and 0.633-1.511 (×1.04) for gas alone. Even with the most volatile country removed by hand, captive energy is no steadier than the band the site already uses.
- **Correction after the first run.** The trailing-zero cleaning was added after the first run: Austria's gas origin is not reported from 2009, nor Croatia's from 2011, while total imports go on. This is round 8's cleaning, which my rule text had only half stated. The as-written result (0.512-1.750, ×1.47) fails the same way.
- **BACI tonnes for Central Asia and Mongolia.** HS 2711 mixes LPG and natural gas, and quantities are partly estimated by CEPII. Eurostat-only gives the same verdict (×1.65).
- **Overlapping windows.** The 12 overlapping five-year windows per country hold only about three independent observations. The per-country checks are weak, which is why the rule needed the pooled test first.
- **No electricity.** Electricity (HS 2716: Finland, the Baltics, Georgia) is not in the extracts and was not tested.
- **Belarus has no `cb` today.** Its range is the sum of its yearly own bands, so the forced variant compares against that sum (`site_effective_cb`).
- **The combination formula is fragile.** The owner's formula (energy band for the energy share, general band for the rest, ρ 0.26) narrows any band by up to about 20% from the split alone, whatever the energy band. Any future split of "paid" should give the rest a measured **non-energy** band (round 8: 0.50-2.60), not the general band. Otherwise it narrows without evidence. The same caution applies to round 44's Japan LNG split.

## Files

- `research/2026-10/gaps/captive_bands_r53.json`:
  - `rule`, `verdict`, `pooled` (all tests), `captive_band` (H1-H5);
  - `diagnostics`, `per_country_backtest`, `stress_cases`;
  - `application` (W, today's and combined bands, split-only ratios, why not applied);
  - `site_effect` (forced variant per country, rule variant empty), `windows` (every case).
- `research/2026-10/scripts/captive_bands_r53.py` (`run`, `merge`; python -I; ruff clean). It imports round 48's loaders.
- `research/2026-10/raw/captive_bands_r53/route_sources.json`: sources of the route table. No new downloads; the data are round 48's committed extracts (BACI via OEC, Eurostat), retrieved 2026-10-25.
- Site run: `<scratch>/r53/ba.mjs` (round 49's harness on `site_patch_r53.json`), output `<scratch>/r53/before_after_r53.json`.
