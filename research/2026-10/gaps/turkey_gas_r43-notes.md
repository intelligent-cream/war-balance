# Türkiye: Russian gas and crude from the regulator (EPDK), and an own no-war band (round 43)

Data file: `research/2026-10/gaps/turkey_gas_r43.json`. Generated 2026-10-24.
Built by [`scripts/turkey_gas_r43.py`](../scripts/turkey_gas_r43.py) from the raw files that [`pipeline/fetch/epdk_entsog.py`](../../../pipeline/fetch/epdk_entsog.py) writes to `raw/epdk/`. Run from the repository root: `python3 -I research/2026-10/scripts/turkey_gas_r43.py`.

This file is a proposal. The build does not read it yet. It moves no money and changes no central value. If it is applied, it narrows the "expected without the war" band of Türkiye's purchases from Russia (`to_rus`), and it corrects two of the crude figures behind laundered oil.

## Summary

- **EPDK's gas figures are the same numbers Eurostat has for Türkiye.** Eurostat's `nrg_ti_gas` (geo TR, partner RU) equals EPDK to within rounding in every year 2005–2024. Eurostat's crude from Russia also equals EPDK's. Türkiye reports the regulator's figures to Eurostat.
  - So EPDK is not a second measurement next to Eurostat, which `fuel_volume_cf.json` already used for Türkiye.
  - It is a second measurement next to customs. Turkish customs hide the partner for crude and gas.
  - For crude, it is also a second measurement next to CREA/Kpler.
- **Russian gas, million Sm³ (EPDK):**
  - 2005–2013: 17,524, 19,316, 22,762, 23,159, 19,473, 17,576, 25,406, 26,491, 26,212;
  - 2014–2021: 26,975, 26,783, 24,540, 28,690, 23,642, 15,196, 16,178, 26,343;
  - 2022–2025: 21,575, 21,340, 21,572, 21,160;
  - January–August 2026: 12,137, which is 17% below January–August 2025 (14,576).
  - After the war the volume was 0.80–0.82 × 2021, inside the 2005–2021 range (15.2–28.7 bcm).
- **Own band for `to_rus`, 2022–2026: 0.843–1.421.** Türkiye now gets 0.652–1.500: the generic band for large flows, 0.570–1.617, scaled by 0.81 in the build. The own band is 32% narrower. Almost all of the narrowing is on the low side.
  - The band uses the `cf_bands.json` B2 method on a composite series. Gas, crude, products and coal from Russia are measured as volumes and combined with Türkiye's other imports from Russia, using its fuel share of 0.533 (as `fuel_volume_cf.json` does).
  - **Coverage just passes the B2 rule.**
    - Leave-window-out: 12/15. The 80% threshold is met exactly.
    - Out of time: 24/25.
    - The only failing test window is 2007, which covers 2008–2012: the financial crisis and Türkiye's 2009–2010 dip in gas.
  - **A band on gas alone fails.** It covers only 13/25 out of time, because gas from Russia fell by 36% in 2019 as Türkiye turned to LNG and Azeri gas.
- **Crude, EPDK against the site:**
  - EPDK and CREA agree to within 2% in 2023–2025.
  - CREA is 7.5% higher in 2022 (12.9 against 12.0 Mt) and 6.6% higher in January–August 2026 (6.24 against 5.85 Mt).
  - **The Russian share of Türkiye's crude used for laundered oil is off in two years:**
    - 2019: the site uses 0.20, EPDK measures 0.336;
    - 2026: the site uses 0.45, EPDK measures 0.269 for January–August.
    - Both EPDK values are outside the site's range. In the other years EPDK lies inside the range.

## 1. Gas (EPDK)

| | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| from Russia, million Sm³ | 26,975 | 26,783 | 24,540 | 28,690 | 23,642 | 15,196 | 16,178 | 26,343 | 21,575 | 21,340 | 21,572 | 21,160 | 12,137 |
| all sources | 49,262 | 48,427 | 46,352 | 55,250 | 50,282 | 45,211 | 48,126 | 58,704 | 54,662 | 50,484 | 52,213 | 58,337 | 36,528 |
| Russian share | 55% | 55% | 53% | 52% | 47% | 34% | 34% | 45% | 39% | 42% | 41% | 36% | 33% |
| spot pipeline gas from Russia | | | | | | | 12 | 0 | 6,322 | 4,471 | 5,652 | 5,488 | 2,970 |

- **Sources:**
  - 2005–2013: the 2014 report, Table 2.1.
  - 2014–2024: the 2024 report, Table 2.2.
  - Spot pipeline gas 2020–2024: Table 2.9.
  - 2025: the annex of the 2025 Gelişim Raporu, Table 4. The Russian total is spot plus long-term over all twelve months.
  - 2026: the annex of the August 2026 monthly report, Table 4.
- The Russian total includes Russian spot LNG (497 million Sm³ in 2024). It also includes TurkStream line 1 and Blue Stream. TurkStream's European string, which goes on to Bulgaria, is not counted.
- `turkey_prices.json` and `energy2.json` `transit_gas` TUR already use these volumes for 2022–2026. They agree.

## 2. Crude and products (EPDK) against the site

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|---|---|
| Russian crude, Mt (EPDK) | 10.45 | 3.27 | 5.42 | 12.00 | 10.71 | 16.94 | 15.23 | 5.85 |
| all crude imports, Mt | 31.07 | 29.37 | 31.42 | 33.49 | 31.40 | 30.02 | 31.94 | 21.74 |
| **Russian share of crude (EPDK)** | **0.336** | 0.111 | 0.173 | 0.358 | 0.341 | 0.564 | 0.477 | **0.269** |
| site: `laundered_r39.json` TUR share (range) | **0.20 (0.13–0.27)** | 0.10 (0.05–0.15) | 0.15 (0.08–0.22) | 0.416 (0.33–0.50) | 0.351 (0.28–0.42) | 0.54 (0.43–0.65) | 0.486 (0.39–0.58) | **0.45 (0.36–0.54)** |
| site: `hub_buyers.json` `turkey_refining` Mt (CREA) | – | – | – | 12.90 (+7.5%) | 10.89 (+1.7%) | 16.75 (−1.1%) | 15.06 (−1.1%) | 6.24 (+6.6%) |
| site: `energy.json` TUR crude Mt | – | – | 6.34 (+17%) | 12.90 | 10.89 | 16.75 | 15.06 | 6.24 |
| Russian diesel, Mt (EPDK) | 3.95 | 3.78 | 3.71 | 4.06 | 10.20 | 11.35 | 11.59 | 5.30 |
| Russian share of all oil imports | 35% | 21% | 24% | 41% | 51% | 66% | 60% | 41% |

- **Sources:**
  - 2018–2024: the annual oil market reports, Table 2.1.1, "imports by country" (2018 is in the JSON too: 1.90 Mt, 9%).
  - 2025: the December 2025 monthly report, Table 2.1.2, January–December. It equals the 2025 Gelişim Raporu PDF table for crude.
  - 2026: the August 2026 monthly annex, Table 2, cumulative January–August.
- **Agreement with CREA.** Within 2% in 2023–2025, so the 2024 check in the verification notes holds (16.94 against 16.75 Mt). CREA is higher in 2022 and 2026.
- **2019.** EPDK's 10.45 Mt matches the remark in `turkey_prices-notes.md` that Russia's export customs (8.2 Mt) miss about 4 Mt that Turkish origin data show. Some of the crude was sold through traders. The share of 0.20 in `laundered_r39.json` came from Russia's export side.
- **2026.** Russian crude fell to 27% of Türkiye's crude in January–August. Kazakhstan, Iraq, Guyana, the US and Norway made up the rest. This fits the EU's crude-origin rule for products from 21 January 2026, and `hub_buyers.json` already cuts Türkiye's export share to 0.10. But the laundered-oil share 0.45 was not updated.

## 3. The no-war band for Türkiye's purchases from Russia

### What Türkiye gets now

- `to_rus` is size class L with the generic band from `to_rus_cf.json`: 0.570–1.617 for 2022–2026.
- The build scales it around 1 by `CB_SCALE_PAID = 0.81` (the round-43 placebo), which gives `cb` H5 = **0.652–1.500** in `site/data.json`.
- Yearly band from 2022 to 2026: 0.66–1.44 widening to 0.35–1.99.
- `fuel_volume_cf.json` (round 8) tested Türkiye in the "other" (seaborne) group and found 0.66–1.66. That band was not narrower than today's, so Türkiye was kept on the generic band.

### Series

- **Fuel.** A volume index at fixed 2019–2021 unit values, with the weights of `fuel_volume_cf.json`:
  - gas: EPDK volumes × Eurostat's GCV per Sm³ × EUR 4.67/GJ;
  - crude (= EPDK): EUR 370/t;
  - products (Eurostat O4600): EUR 420/t;
  - coal (Eurostat): EUR 60/t.
  - Gas was 38% of this fuel value in 2019–2021, or about 20% of everything Türkiye bought from Russia.
- **Other goods.** Türkiye's own customs report of imports from Russia, TOTAL minus HS 27 (Comtrade, USD), deflated by the US import price index excluding fuels (FRED IREXFUELS).
- **Composite.** R = 0.533 × fuel + 0.467 × other goods, where 0.533 is Türkiye's fuel share in `energy2.json`, as in `fuel_volume_cf.json`.
- **Back-test.** 2021 held flat (random walk). Rolling origins 2005–2020, horizons 1–5 years, targets up to 2021, with every year kept (2009, 2014–15 and 2020 included).

### Method (as `cf_bands.json` B2)

- Per-year errors are pooled as error / √(h/3), giving 70 errors. Take the 5th–95th percentile and widen it halfway to the block-bootstrap (by origin) 10%/90% bounds.
- The per-year band is exp(q·√(h/3)).
- The cumulative band is the generic cumulative band, scaled on each side by the own/generic ratio of the log bounds in the same year.
- **Checks:**
  - leave-window-out on the generic test origins 2007, 2012 and 2016 (15 errors);
  - out of time: trained on errors that end by 2013, scored on origins 2014–2020 (25 errors).
- **Rule:**
  - the band must be at least 10% narrower than the generic band as built;
  - both checks must reach at least 80%;
  - plus the `fuel_volume_cf.json` safeguard: at least 90% of the own 5-year windows of the map's own series must fall inside.

### Result

| | 2022 | 2023 | 2024 | 2025 | 2026 | 2022–2026 sum (2026 at 8/12) |
|---|---|---|---|---|---|---|
| **own (proposed)** | 0.867–1.251 | 0.817–1.373 | 0.780–1.474 | 0.751–1.566 | 0.726–1.651 | **0.843–1.421** |
| generic, yearly (`to_rus_cf.json` L) | 0.660–1.436 | 0.513–1.611 | 0.459–1.735 | 0.439–1.847 | 0.348–1.986 | 0.570–1.617 unscaled |
| generic as built (`cb`, ×0.81) | 0.725–1.353 | | | | | **0.652–1.500** |

- **Cumulative own band by horizon** (H1–H4, H5, H5_2026_8of12): 0.867–1.251, 0.857–1.299, 0.851–1.352, 0.831–1.384, 0.847–1.437, 0.843–1.421.
- **Width** against the generic band as built: ×0.68. Against the unscaled generic band: ×0.55.
- **Coverage:**
  - leave-window-out 12/15 (2007: 2/5, 2012: 5/5, 2016: 5/5);
  - out of time 24/25. The one miss is 2020 to 2021, ×1.38: a jump back in gas and other goods after COVID.
- **Safeguard.**
  - The map's own series, as listed in `fuel_volume_cf.json` for Türkiye's 5-year windows from origins 2005–2016 (0.844–1.29), has 12/12 inside.
  - The composite here has 11/12 inside. The 2008 window is ×0.825.
  - The generic band as built also covers all 12. It is not too narrow for Türkiye, only wider than its history needs.
- **Sensitivity** (2022–2026 band):

  | variant | band |
  |---|---|
  | fuel share 0.40 | 0.831–1.482 |
  | fuel share 0.65 | 0.852–1.387 |
  | other goods in nominal USD | 0.849–1.464 |

  All three stay at least 10% narrower than the band as built, with the same coverage.
- **Decision under the B2 rule: use.**
  - Certainty C, because the leave-window-out check passes only just.
  - It is in line with Mongolia (12/15), the B2 case that was accepted.

### Variants that fail (kept in the JSON for the record)

- **Gas alone** (`B2_gas_only`): 0.673–1.660 for 2022–2026. It covers 13/25 out of time and fails, because the 2019–2020 fall (15.2 bcm, from 23.6) is outside anything before 2014.
  - This is the "pipeline band" the audit asked about. Türkiye's own history does not support it on gas alone.
  - Türkiye was never a captive pipeline buyer: LNG terminals, Azeri gas and Iranian gas compete with Russian gas.
- **Direct percentiles of the cumulative windows per horizon** (`direct_cumulative_percentiles`): the composite gives 0.841–1.283, but it covers only 60/70 windows in sample.
  - No era factor K makes the 2005–09 era fit, because that era had growth followed by the 2009 crash.
  - With the smallest K that reaches 90% in sample and 80% held out (K = 2.3), the band is 0.672–1.773: wider than the band as built.
  - With 12–16 windows per horizon, these percentiles are too thin. B2's pooling over horizons is the better estimate.

### What it means for the map

Widths of this term alone, using `site/data.json` base × `bmul` × FRAC (EUR 113.0 bn summed over 2022–2026; GDP EUR 1,064 bn):

| | low side | high side |
|---|---|---|
| generic as built | EUR 39.3 bn (3.7% of GDP) | EUR 56.4 bn (5.3%) |
| own band | EUR 17.7 bn (1.7%) | EUR 47.5 bn (4.5%) |

- The low side is the chance that, without the war, Türkiye would have bought much less from Russia than in 2021. That would make "more paid to Russia" larger.
- Türkiye's own history says that chance is small. Over any five years from 2005 to 2021, its purchases from Russia (the composite) never added up to less than 0.83 × the starting year, even through 2009 and 2019–20.
- The central value does not move.

## Proposed build changes

1. **`research/2026-10/gaps/cf_bands.json`: add `countries.TUR.to_rus`.**
   - Copy it from `turkey_gas_r43.json` `band.proposed_cf_bands_entry["countries.TUR.to_rus"]`.
   - Keys: `level_2021`, `multiplier_vs_2021` (2022–2026), `cumulative_band` (H1–H5, H5_2026_8of12), `generic_multiplier_vs_2021_replaced`, `generic_cumulative_band_replaced`, `method`, `size_class` ("L"), `certainty` ("C"), `own_backtest`.
   - No code change is needed. `counterfactual()` puts TUR in `own`, which skips the `to_rus_cf.json` generic multipliers. It copies `multiplier_vs_2021`, `cumulative_band`, `method` and `size_class`. Because TUR is in `bands["countries"]`, `CB_SCALE_PAID` is not applied.
   - Expected effect:
     - `TUR.to_rus.cb[5]` from [0.6517, 1.4998] to [0.843, 1.421];
     - `bmul_lo` / `bmul_hi` 2022–2026 from 0.66–1.44 … 0.35–1.99 to 0.87–1.25 … 0.73–1.65 (× the price factor `energy_nowar` folds into `bmul`);
     - the counterfactual term's range from 3.7% / 5.3% of GDP to 1.7% / 4.5%.
   - Also update the `cf_bands` source label in `counterfactual()` ("own bands for Mongolia, Yemen, Tajikistan and Moldova") to add Türkiye.
   - Do not use `fuel_volume_cf.json` for this band. Its entries are not exempt from the 0.81 scaling, and its group test for TUR failed.
2. **`research/2026-10/gaps/laundered_r39.json` `origin_russian_share_used.A` and `.B`: set `TUR|2019` … `TUR|2026` to EPDK's measured shares.**
   - Values: 0.336, 0.111, 0.173, 0.358, 0.341, 0.564, 0.477, 0.269, with low and high at ×0.8 and ×1.2, the ±20% the file uses for Türkiye. They are in `crude_comparison_with_site.*.epdk_russian_share_of_crude`.
   - The buyers' series (`buyers.*.fuel_imports_and_russian_crude_by_year.*.russian_crude_eur_bn` and `by_origin_eur_m.TUR`) were computed with the old shares. Scale their TUR part by new/old.
   - Expected effect, small: the Turkish-origin Russian crude in the measured buyers moves by about +EUR 9.5m (2019), +4m (2021), −44m (2022, almost all South Africa), −3m (2026).
3. **`hub_buyers.json` `turkey_refining.by_year.*.russian_crude_mt`: use EPDK** (12.00, 10.71, 16.94, 15.23, 5.85), and scale `russian_crude_eur_bn`, `exported_crude_value_eur_bn` and `domestic_crude_value_eur_bn` by EPDK/CREA.
   - Expected effect: Türkiye's refiner deduction in 2022 falls by about 7% (exported crude value 2.335 to about 2.17 EUR bn), and in 2026 by about 6%. The other years move by under 2%.
   - Optional. CREA's figures are within the stated ranges except 2022.
4. **Not needed:** gas volumes in `turkey_prices.json` and `energy2.json` `transit_gas` TUR already equal EPDK (2026 = 12,137).

## Overlaps

- No new money flow. The band replaces the generic one for TUR `to_rus` only.
- The base, `base_range`, actuals and the central path (2021 held flat, × the no-war price factor) are unchanged.
- Laundered oil and refining (changes 2 and 3) only correct inputs that are already counted.

## Open questions

- **Accept a band whose leave-window-out coverage is exactly 80%?** B2 accepted Mongolia at the same level. If not, Türkiye keeps the generic band, which covers all its own windows anyway.
- **The 2021 base and contracts.** Part of Türkiye's Russian gas contracts expired at the end of 2021 (`fuel_volume_cf.json` `contracts`), and some were renewed. Russian gas then settled at about 21.5 bcm. Should the gas part of the central path be 0.82 × 2021, as with Poland's documented contract end? This was not done: renewals were open in 2021, and 2021 volumes are inside the band.
- **Blue Stream** (16 bcm a year) was contracted to the end of 2025. The extension terms for 2026 are not published. January–August 2026 is 17% below 2025.
