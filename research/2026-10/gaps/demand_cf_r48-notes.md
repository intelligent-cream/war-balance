# "Paid to Russia": an observed-demand no-war model (round 48)

Data file: `research/2026-10/gaps/demand_cf_r48.json`. Script: `research/2026-10/scripts/demand_cf_r48.py`.

- `python3 -I research/2026-10/scripts/demand_cf_r48.py run [site_dir]` reads only committed raw files (`raw/demand_cf_r48/`, `raw/oec_baci_r44/`, `raw/cf_models_r47/`) and gaps files. It takes about 20 seconds.
- `... fetch` downloads again (OEC/BACI, Eurostat) into the scratchpad and rewrites the four extracts in `raw/demand_cf_r48/` (0.9 MB). Each extract carries its URL and the retrieval date (2026-10-25). They are not yet in `raw/MANIFEST.json`.
- The site before/after was computed with the site's own `calc()` on a copy of `site/data.json` from 2026-10-25 (scratchpad `r48/ba.mjs`), then added with `... merge <file>`.

**Nothing here is read by the build, and no number on the site changes.**

## Rule (written in the script before any result was computed)

The model **D** for one product: Russia's pre-war level of the product, times the country's imports of that product from **all** suppliers in year t over the start year, in volume. For fuels this is then corrected to the expected price: × (actual / expected crude price)^elasticity.

D replaces "held flat" (M0) for a **product × size class** only if all three tests pass:

1. **Accuracy.** D's error is at least 15% lower than M0's at **every** rolling origin from 2005 to 2016, with at least 5 cases at each origin.
   - The 12 origins include the 2008 crash and the 2013/2014 Russia shock.
   - The error is the site's cumulative error, H1 to H5, with the fifth year counted at 8/12.
2. **Band.** D's era-calibrated 90% band for the five-year sum is not wider than M0's.
3. **Placebo.** D's band covers at least 90% of the errors with the war moved to 2014 (2014-2018) and to 2018 (2018-2021). The band is built only from earlier origins.

**Products:** crude, oil products, gas, coal, cereals, fertilisers, metals and other goods. The rest of HS 27 always stays flat.

**Size classes** are set by the product flow from Russia: S is under EUR 0.1bn, M is 0.1-1bn, L is over 1bn.

**Data sets.** Fuels are judged on Eurostat imports by country of origin for European reporters. These are physical units and include pipeline gas. Everything else is judged on CEPII BACI. A product passes for a country only on the data set that covers that country.

**Price correction in the back-test.** The expected price is the IMF WEO October vintage of the origin year. The 2005-2007 origins have no vintage, so they use "no change". The correction uses the central elasticity. The run without price correction (D0) is a diagnostic only.

## Verdict: is it a good model?

**No. It does not pass in any cell, so the proposal changes nothing.**

It is a better *idea* than every level model tried before. Its errors are smaller on average, and for European pipeline gas they are much smaller. But it is not reliably better at every origin, and its narrower bands fail the Russia-shock placebo. The reasons:

- **The share is not stable enough.** Observed demand removes the importer's own demand swings, but most of the error is Russia's share moving. Russia's share fell by itself after 2014 (crude to the Netherlands, Poland and Germany) and rose by itself for coal. A model that sees only the importer cannot see this, and this was the reason every earlier round failed.
- **The price leg costs accuracy.** In the back-test the correction adds the forecast error of the oil price to every fuel. D0 (no correction) beats D almost everywhere. But the war-time version needs the correction, so D is the honest candidate.
- **Data artefacts in the war years.** In the hubs, imports from all suppliers are themselves a war outcome: Armenia's other goods ×3.5, Azerbaijan's crude ×22 and Kazakhstan's crude ×58 in 2023. Gas imports in Europe include storage refilling and transit: Austria's ×2.6 in 2022. And BACI has breaks (Mongolia's oil products ×0.05 in 2024). Each of these needs a guard, and each guard is a judgement call.

**Closest miss: European gas, large buyers (Eurostat, origin basis, 219 cases).**

- D is better at 11 of 12 origins, with a median gain of +53%. The worst origin is 2005 at +12%, where the oil price forecast was "no change" before the 2008 spike.
- Its band is ×0.84 the width of M0's.
- Placebo coverage is 82% for 2014 (17 countries) and 94% for 2018.
- Without the price correction (D0) it passes accuracy at all 12 origins (worst +39%) and the band test (×0.95). It then misses the 2014 placebo by one country (88%).
- Measured against inland consumption instead of imports, the gas model does worse (worst +2%, band ×1.18).

If the owner wants a targeted exception, this is the only candidate. It would need a new rule for gas without the price leg. That would be a decision taken after seeing the results, which is the overfitting the rule is meant to stop.

## Back-test on pre-war data (does it "just run very accurately"?)

Error = mean over origins 2005-2016 of the per-origin error (H1-H5, median absolute cumulative log error). Bias and spread are of the five-year (H5) error: log(actual / predicted), so positive means the model was too low. "Origins ≥15%" counts the origins where the model beat flat by at least 15%.

**Country totals (BACI, the site's start rule; D on every product).**

| size | n | flat: error | flat: bias | flat: 5-95% | D: error | D: bias | D: 5-95% | origins ≥15% | worst origin |
|---|---|---|---|---|---|---|---|---|---|
| S | 486 | 0.54 | +0.47 | −0.85 to +1.90 | 0.53 | +0.37 | −0.99 to +1.88 | 1/12 | −55% (2009) |
| M | 581 | 0.32 | +0.16 | −0.86 to +1.09 | 0.25 | +0.06 | −0.72 to +0.94 | 8/12 | +2% (2015) |
| L | 489 | 0.15 | +0.05 | −0.53 to +0.47 | 0.13 | +0.02 | −0.39 to +0.41 | 6/12 | −10% (2013) |

- **Bands.** For large flows D's H5 band is 0.68-1.52 against 0.49-1.86 for flat; for mid-size flows 0.45-2.83 against 0.39-3.36.
- **Placebo.** D's coverage is 84% (2014) and 88% (2018) for L, and 84% (2014) for M. Flat's bands cover 88-96%.
- **So the bands are narrower, but too narrow in a Russia shock.** It runs more accurately on average, but not "very accurately in general".

**Products** (D against flat; `verdict_by_cell`; chart-ready rows in `backtest_chart_rows`; bias and spread in `backtest_summary_by_product_size`).

| data | product / size | n | origins ≥15% | worst origin | median | band vs flat | placebo 2014 / 2018 |
|---|---|---|---|---|---|---|---|
| Eurostat | gas L | 219 | 11/12 | +12% | +53% | ×0.84 | 82% / 94% |
| Eurostat | crude L | 261 | 8/12 | −34% | +20% | ×1.28 | 82% / 86% |
| Eurostat | coal L | 287 | 9/12 | −12% | +26% | ×1.26 | 100% / 100% |
| Eurostat | products L | 296 | 4/12 | −2% | +9% | ×0.93 | 92% / 100% |
| BACI | other goods L | 169 | 11/12 | −28% (2011) | +39% | ×0.74 | 94% / 94% |
| BACI | fertilisers M | 186 | 11/12 | −0% (2005) | +24% | ×0.95 | 94% / 100% |
| BACI | crude M / L | 203 / 267 | 8 / 6 of 12 | −2% / −15% | +27% / +12% | ×0.73 / ×0.87 | ≥90% |
| BACI | gas M | 166 | 8/12 | −33% | +20% | ×0.49 | 91% / 100% |
| BACI | metals S / M / L | 540 / 470 / 123 | 5 / 6 / 4 of 12 | −6% / −3% / −73% | +13% / +11% / +5% | ×0.89 / ×0.91 / ×0.82 | 79-100% |
| BACI | small flows (S), any product | 22-664 | 0-9 of 12 | +1% to −33% | +5% to +28% | ×0.78 to ×1.12 | 80-100% |

BACI's gas cells are mostly LNG and Asian buyers. BACI misses pipeline gas: Germany's Russian gas is about zero there. That is why Europe's fuels are judged on Eurostat.

## Elasticities and policy (`elasticities`, `eu_gas_policy_shortfall`)

**Used** (magnitudes, low / central / high): gas 0.10 / 0.20 / 0.30, crude 0.02 / 0.05 / 0.10, products 0.02 / 0.05 / 0.10, coal 0.05 / 0.10 / 0.20. Other goods: 0.

**Sources:**
- Labandeira et al. 2017 (meta-analysis; short-run gas −0.18);
- Ruhnau et al. 2023 (Nature Energy; German gas 2022: industry −11%, small consumers −6%);
- Bruegel's gas demand tracker (EU −13 to −15% temperature-adjusted, Aug 2022-Mar 2023);
- IEA (EU gas −13% in 2022);
- Hamilton 2009 and Caldara et al. 2019 (oil about −0.05 to −0.15);
- IMF WEO October 2022.

**Check on pre-war data (2002-2021, annual changes):**
- BACI import tonnes, gas: −0.09 (all years, se 0.03) and −0.15 (shock years 2008-09 and 2014-16, se 0.05).
- Crude: −0.02 (not significant).
- Products and coal: +0.08 and +0.15. Prices and demand move together, so these regressions cannot identify an elasticity.
- European gas consumption against the world gas unit value (oil-indexed then): −0.02.

The data support the low end of the gas range at most. The central 0.2 rests on the 2022 studies.

**EU gas demand beyond weather (HDD) and the 2010-2021 trend:** −8% (2022), −16% (2023), −12% (2024), −19% (2025).
- The price at the central elasticity explains −14%, −2%, −3% and −6%.
- The rest is the "policy shortfall": +6% in 2022 (price over-explains), then −14%, −10% and −12%. This is the saving target, fuel switching and demand lost for good.
- It enters only the high end of the range ("price + measured policy shortfall"). The low end is "price explains all".

**Weather.** Volumes are deliberately not corrected to normal weather. The no-war world had the same winters, so correcting a mild winter upward would count weather as war. Heating degree days are used only to separate weather from price and policy above.

## Before/after on the site (`site_before_after`, `site_before_after_summary`)

**Proposal** (products that pass): none pass, so **no country changes**. All numbers are as now.

**Diagnostic: D on every product of every country**, except the hubs (Armenia, Georgia, Kazakhstan, Kyrgyzstan, Uzbekistan, Türkiye, Azerbaijan, Mongolia, Tajikistan, Serbia, the UAE, Belarus and Hong Kong) and products behind a data guard. The bands use D's own back-test bands, which failed the placebo, plus the elasticity, no-war price and policy range.

- **184 countries patched. 39 countries change group or side** on the net or on Russia's earnings (64 numbers).
- **Become certain:** Bulgaria (Russia's earnings), Cameroon (net), Djibouti (Russia's), France (Russia's), Italy (Russia's), Mexico (net), North Macedonia (Russia's).
- **Lose certain:** Cyprus (Russia's), Malta (net), Malaysia (both), French Polynesia (Russia's).
- **Most of the other moves are tiny numbers** crossing the 0.1%-of-GDP "essentially zero" line (Mali, Kuwait, El Salvador, Gibraltar...).
- **Biggest movers on the net** (points of GDP):
  - Brunei −2.09 (crude imports −20 to −33%);
  - Lebanon −1.57 (fuel imports −48% by 2024);
  - Bulgaria +1.47 (crude imports +50-71%);
  - Burkina Faso +0.84 (oil product imports +28-59%);
  - Estonia −0.78;
  - Hungary −0.58 (gas use −15 to −24%, and crude imports −23% in 2025 and −60% in 2026).

  Hungary's 2025-2026 crude fall is the Druzhba outages, a war effect. Observed demand takes it as if there had been no war (see below).
- **Big buyers:** the no-war level for 2022-2026 moves:
  - China 336 → 353bn;
  - Germany 183 → 174bn;
  - Italy 82 → 78bn;
  - UK 114 → 130bn (oil product imports +70%, refinery closures);
  - Poland 74 → 79bn;
  - India 34 → 37bn.
- **World total:** the no-war total is almost unchanged (2,181 → 2,188bn). The sum of "paid" moves 140.8 → 139.8bn.

These figures use the site data of 25 October 2026. The parallel fix (mid-size start rule, small-buyer bias) lands before release, so **every figure must be recomputed at integration**.

## Things that look wrong or fragile

- **The hubs' observed demand is a war outcome.** Without the hub exclusion the diagnostic would move Armenia +8 points of GDP, Azerbaijan +7, Kyrgyzstan +6 and Belarus −15 (BACI has no Belarus data after 2021).
- **BACI breaks:**
  - China's gas tonnes in 2016 (384 Mt);
  - Mongolia's oil products and fertiliser in 2024 (×0.05);
  - Algeria's gas in 2024;
  - Malaysia's crude ×2.5. This passes the ×3 guard, but is likely ship-to-ship transfers of sanctioned crude.
- **The ×3 guard and the use of gas consumption in Europe were added after the first diagnostic run.** They touch only the 2022-2026 application, not the back-test or the rule.
- **War-caused supply cuts enter observed demand.** Hungary's crude imports fell 60% in 2026 (Druzhba outages). D reads this as lower no-war demand, which is wrong. Observed demand is only clean where the war changed prices, not physical supply.
- **Eurostat gas consumption for 2025 is incomplete** for Hungary and Slovakia (−99%); those years are dropped.
- **2025-2026 hold the 2024 demand index** outside Eurostat's monthly energy data, because BACI ends in 2024.
- **The diagnostic's certainty gains are not earned.** France, Italy and Bulgaria become certain mainly because D's own bands are narrower, and those bands cover only 84-88% in the placebo.
- **Poland:** the Yamal end (no-war gas dropped from 2023) is kept by multiplying. Under D, Poland's gas would otherwise come back with its consumption.
