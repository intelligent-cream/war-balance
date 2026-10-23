# "Paid to Russia": can the no-war band be narrower? (round 7)

Data file: `research/2026-10/gaps/to_rus_cf.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

This file moves no money and changes no central value. It only replaces the width of the "expected without the war" band for six countries.

## Summary

- **Most ideas failed.** Splitting off fuel, an energy-balance model, separating lumpy items, analogue partners and own-history bands do not give a band that is both narrower and still honest.
- **One thing works, modestly.** The size-class band was measured again on rolling origins 2005-2020 instead of three back-tests. It was then calibrated by era: bands from two eras must cover 90% of the third. The result is narrower:
  - large flows: 2022-2026 band **0.570-1.617** against 0.608-1.737 today, 7% narrower;
  - mid-size flows: **0.470-3.190** against 0.422-3.506, 12% narrower.
- **Used for six of the 13 countries:** Kyrgyzstan, Tajikistan, Kazakhstan and Slovakia (large), and Georgia and Senegal (mid-size). The other seven keep today's band.
- **The width is mostly real.** What a country buys from Russia changes a lot from year to year even without a war. The fuel part changes even more than the rest, and the parts do not move together. No model on the importer's side explains this.

## Effect on the map

These are widths of the counterfactual term alone, in % of GDP, low side / high side. "Today" is the table in the brief. "New" is the same basis scaled by the change in band. `site/data.json` was rebuilt at 14:00; with its new central path, the widths are 9-46% larger on both sides, and the JSON gives both bases.

| country | size | today's band 2022-26 | new band | today, % GDP | new, % GDP | status |
|---|---|---|---|---|---|---|
| Kyrgyzstan | L | 0.608-1.737 | 0.570-1.617 | 14.9 / 28.1 | 16.3 / 23.5 | new |
| Armenia | L | 0.608-1.737 | – | 10.3 / 19.4 | same | kept: fails own check |
| Tajikistan | L | 0.608-1.737 | 0.570-1.617 | 12.3 / 23.0 | 13.5 / 19.3 | new |
| Georgia | M | 0.422-3.506 | 0.470-3.190 | 6.5 / 28.0 | 6.0 / 24.5 | new |
| Mongolia | L (own band) | 0.846-1.854 | – | 4.7 / 26.0 | same | kept: new would be wider |
| Kazakhstan | L | 0.608-1.737 | 0.570-1.617 | 8.8 / 16.6 | 9.7 / 13.9 | new |
| Uzbekistan | L | 0.608-1.737 | – | 6.2 / 11.6 | same | kept: fails own check |
| Syria | M | 0.422-3.506 | – | 4.3 / 18.8 | same | kept: fails own check |
| Senegal | M | 0.422-3.506 | 0.470-3.190 | 3.8 / 16.3 | 3.5 / 14.2 | new |
| Congo | S | 0.300-8.212 | – | 1.6 / 16.9 | same | kept: new would be wider |
| Bosnia | M | 0.422-3.506 | – | 2.9 / 12.4 | same | kept: fails own check |
| Slovakia | L | 0.608-1.737 | 0.570-1.617 | 5.0 / 9.4 | 5.5 / 7.9 | new |
| Yemen | M (own band) | 0.578-2.193 | – | 5.0 / 14.1 | same | kept: new would be wider |

- For large flows, the high side narrows by 16% and the **low side widens by 10%**. The total width falls by 7%.
- The big ranges (Kyrgyzstan, Tajikistan, Georgia, Mongolia) stay big. Their width is the real volatility of a flow that is a large share of a small economy.

## How the new band was measured (ideas 4 + 5)

- **Data.** The counterfactual's own real series for every importer, 2002-2021. Origins run from 2005 to 2020, horizons 1-5 years, targets to 2021.
  - All years are kept, including 2009, 2014-15 and 2020. The three back-tests behind today's band interpolated over 2014-15 and 2020.
  - There are 480 five-year windows from 53 large importers, and 560 from 75 mid-size ones.
- **Size class.** The 4-year average level at the origin, with the same EUR 0.1bn and 1bn limits as before.
- **Error.** The 2022-2026-style cumulative error is log(Σ w·actual / Σ w·level at origin), with w = 1, 1, 1, 1, 8/12.
- **Calibration.** Origins are split into three eras: 2005-2009, 2010-2012 and 2013-2016. The 5th-95th percentile of two eras, times K, must cover at least 90% of the third era, for every era.
  - K = 1.1 for both L and M. Era coverage is 0.91 / 0.93 / 0.91 (L) and 0.90 / 0.93 / 0.94 (M).
- **Held-out check on today's three test windows** (origins 2007, 2012, 2016), with bands built without that window's era:
  - L: 34/36, 38/41 and 41/46;
  - M: 38/42, 47/51 and 46/50.
- **Per-country rule.** A country gets the new band only if all of these hold:
  - it is at least 5% narrower than today's;
  - it covers at least 90% of the country's own twelve 5-year windows;
  - it covers all three of the country's own test windows.
- **Why some fail.** Armenia (10/12), Uzbekistan (10/12, and its 2016 window of 1.66 is above 1.617), Syria (10/12) and Bosnia (10/12, 2007 window 3.28) have 5-year sums above the new high side. Today's band covers them better on that side.
- **Per-year bands.** These come from the same rolling data (K = 1.1) and are **wider** than today's in single years. For large flows, 2022 is 0.66-1.44 against 0.70-1.35. Only the 2022-2026 total narrows.
  - Rolling origins include more shock years. Single years are noisier than five-year sums.

**Point for the builder.** The rolling band is a size-class band. It would apply just as well to every large and mid-size country, not only these six. Applying it to six countries only follows the brief's rule. For consistency the builder may prefer to apply it to all L and M countries. Per-country checks were run only for the 13.

## Idea 1: fuel (HS 27) and other goods, energy-balance model

**Data.**
- Fuel share of imports from Russia: the importer's own Comtrade HS 27 / TOTAL. Where the importer did not report, Russia's mirror report by chapter (downloaded for the 13).
- Fuel volume: EIA international energy balances, 1980-2024. These are oil, gas and coal consumption and production, weighted by the fuel mix bought from Russia (`energy2.json`).
- Other goods: IMF WEO GDP forecasts of the origin's vintage (2008-04 to 2021-10, via DBnomics). Realised GDP was tested only as an upper bound.
- Fuel and other goods were deflated separately with the fuel-mix and non-fuel indices.

**Models.** All on the map's target (fixed-weight deflator):
- fuel follows consumption, other goods held;
- fuel follows net imports;
- other goods follow the WEO forecast;
- both;
- realised GDP (not usable: war-affected).

**Gains against 2021 held flat, origins 2007 / 2012 / 2016:**

| group | fuel by energy use | other goods by WEO | both | rule |
|---|---|---|---|---|
| all importers (400/300/450 cases) | +4% / −10% / +3% | +3% / −3% / +6% | +7% / −3% / +6% | fails |
| the 13 listed | +22% / −6% / +25% | +1% / −6% / +2% | +15% / −11% / +23% | fails |
| neighbours* (50/30/40) | +25% / +15% / +15% | +18% / +7% / +9% | **+32% / +26% / +26%** | passes |

\* Fixed in advance: Armenia, Azerbaijan, Belarus, Georgia, Kazakhstan, Kyrgyzstan, Moldova, Mongolia, Tajikistan, Turkmenistan and Uzbekistan (no Turkmen data in the cases).

**The fuel volume error is not small.** On rolling cases of large flows, 5 years ahead:
- fuel part 0.50-2.13;
- other goods 0.57-1.93;
- total 0.65-1.77.

The parts are almost uncorrelated (−0.02 to 0.12 at every size and horizon). The total is already steadier than either part, so combining part bands cannot beat the total band. The energy model does not shrink the fuel error, because the volatility is in Russia's share of supply, not in the importer's energy use.

**Neighbours: better centre, not a narrower band.** For the neighbour group, the energy + WEO model fixes the random walk's upward miss. The median 5-year error is ×1.04 against ×1.16. But its era-calibrated band is 0.70-1.66 around a higher centre:
- 2022-2026 sum ×1.08 (Kyrgyzstan), ×1.11 (Armenia), ×1.14 (Tajikistan, Kazakhstan), ×1.17 (Georgia), ×1.18 (Uzbekistan), ×1.28 (Mongolia);
- in multiples of 2021 the width is not smaller (Kyrgyzstan 1.13 against 1.13).

**Not used here** (the brief asks for narrower bands). It is a candidate central path for the neighbours. It would cut their "more paid to Russia" by roughly 8-28% of the 2021 level per year. It uses EIA consumption for 2022-2024 (then held), and that is mildly war-affected.

## Idea 2: lumpy items against staples

- **Lumpy chapters:** 84-89 (machinery, vehicles, aircraft, ships), 93 (arms), 71 (precious metals) and 99 (confidential).
- **Data:** own HS chapters for the 60 largest partners, plus Russia's mirror for the 13.
- **Models:**
  - the lumpy part at its 3-year average;
  - the lumpy part at its 3-year median, if lower;
  - trim any chapter above 1.5× its previous 3-year median.
- **Gains:** all importers +2% / +5% / −1% at best (3-year average). The 13: −23% / −2% / −6%. Neighbours: −7% / +11% / +3%. **Fails.**
- **Why.** In 2017-2021 lumpy items were 5-25% of the neighbours' imports from Russia, and 2021 was not unusual.
  - Kyrgyzstan's share was 0.09 against 0.06-0.07; Armenia's 0.15 against 0.11-0.17.
  - The big swings are in staples (fuel, grain).
  - Syria, Congo and Bosnia show high "lumpy" shares in Russia's mirror (Syria's 2020-2021 imports from Russia are almost all HS 99, confidential). They are unknowable, not one-offs that can be smoothed.

## Idea 3: analogue partners

- **Analogue paths.** The forecast is the median later change of the 10 importers whose 3-year path before the origin looked most alike, using pre-origin windows only.
  - All importers: −26% / −3% / +3%. Fails.
  - The 13: 0% / −26% / +28%. Fails.
  - Neighbours: +28% / +5% / +17%. Passes, but weaker than idea 1.
- **Synthetic control** with donors' realised changes cannot be used: every possible donor's 2022-2026 imports from Russia were changed by the war. In the back-test it gains 4-12% overall.
- **Analogue cells for the band** (size × fuel share at the origin, era-calibrated):
  - large high-fuel importers (Slovakia's cell): 0.636-1.488;
  - large mid-fuel importers (Kyrgyzstan, Armenia, Mongolia): 0.704-1.608;
  - large low-fuel importers (Kazakhstan, Uzbekistan): 0.373-2.356, much wider.
- **Not robust to the bin edges.** With edges 0.25/0.75, 0.35/0.65 or 0.5, Kyrgyzstan and Armenia move to a wide cell. Mongolia's cell becomes 0.676-1.712.
  - For Slovakia, the envelope over the four edge sets (0.636-1.495) fails the held-out test-window check in one variant.
  - So no country uses a cell band.
  - The fuel share does carry information: pipeline-fuel importers are steadier. The finding is worth a look with more data.

## Idea 4: each country's own history

- For every importer, its own 5-year cumulative errors were measured: origins 2005-2016, its own series plus Russia's mirror, as `cf_bands.json` B2.
- A pooled K was then sought so that two eras of a country's own errors cover 90% of its third era.
  - **No K up to 3 works:** coverage of the first era stays at 0.80-0.83.
- Restricted to countries whose own history looks narrower than the generic band (the case where an own band would be used), coverage of the held-out era is at most 0.70 in the first era and 0.86 in the third, for any K up to 3.
  - **A calm past is not a reliable sign of a calm future** for imports from Russia. Idea 4 fails.
- **Caveat on today's bands:** the own bands already in `cf_bands.json` for Mongolia and Yemen rest on this method. They do cover their own windows (12/12), so they stay. They are probably somewhat optimistic.

## Idea 5: is today's band calibrated for each country?

Coverage of each country's own 5-year windows by today's band (counterfactual series; both series in brackets):
- Kyrgyzstan 11/12 (22/24), Tajikistan 11/12 (22/24), Kazakhstan 12/12, Uzbekistan 12/12 (23/24), Slovakia 12/12;
- Armenia 10/12 (17/24);
- Georgia 12/12, Syria 10/12, Senegal 11/12 (17/24), Bosnia 11/12 (19/24);
- Mongolia 12/12, Yemen 12/12, Congo 8/12.

Every miss is on the **high** side, from fast-growing importers. Armenia, Congo and Senegal (on Russia's mirror) are probably too narrow above today. Nothing here suggests today's bands are too wide, except through the rolling re-measurement above.

## Overlaps

- No money amounts. Per-country entries replace `cb` (and the per-year band) of `to_rus` for six countries. They do not add to anything.
- The bands are multipliers on the summed central expected level. They apply unchanged on top of the no-war price factor that `energy_nowar.json` folded into `bmul`.
- Mongolia and Yemen keep `cf_bands.json`. Moldova and Belarus are not touched.

## Open questions

- Should the rolling band replace the three-test band for **all** large and mid-size countries, not only these six?
- Should the neighbours' central path use the energy + IMF-forecast model (passes the rule: +32%, +26%, +26%), even though it does not narrow the band?
- Armenia, Uzbekistan, Congo and Senegal: their history suggests today's high side is too short. Should it be widened?
