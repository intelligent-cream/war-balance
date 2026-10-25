# "Paid to Russia": a supply-side allocation no-war model (round 49)

Data file: `research/2026-10/gaps/supply_cf_r49.json`. Script: `research/2026-10/scripts/supply_cf_r49.py`. Page for the owner: https://claude.ai/artifact/Gb545NCjb6wztGETszaGA6 (private).

- `python3 -I research/2026-10/scripts/supply_cf_r49.py fetch` downloads into the scratchpad and writes the extracts in `raw/supply_cf_r49/` (each with URL and retrieval date 2026-10-25; not yet in `raw/MANIFEST.json`): Russia's exports to the world by HS4 with tonnes 2001-2024 and by partner and HS2 2021-2024 (CEPII BACI via OEC), Russia's own customs reports 2001-2021 (UN Comtrade), Russia's grain exports (USDA PSD).
- `... run [--r48 DIR]` reads committed raw files only, about 50 seconds. It needs round 48's `raw/demand_cf_r48/` (still on the round-48 branch; until it is merged pass `--r48 <dir>` with those four files). The round-48 loaders and its model D are copied into the script; D's median gains reproduce round 48's exactly (crude L +11.9%, gas M +20.2%, other L +39.3%, fertilisers M +23.7%).
- The site before/after was computed with the site's own `calc()` on `site/data.json` of 2026-10-25, round 47 live (scratchpad `r49/ba.mjs`), then added with `... merge <file>`.

**Nothing here is read by the build, and no number on the site changes.**

## Rule (written 2026-10-25 before any back-test result was computed; the same rule is in the script as `RULE`)

**Candidate SUP (supply-side allocation).** For country c, product p and year t:

no-war purchases(c, p, t) = Russia's actual total exports of p to all destinations in year t, in volume × c's pre-war share of Russia's exports of p (valued at the site's no-war price, as now).

In the back-test this is the start level × T(p, t) / T(p, o), where o is the origin and T is Russia's total exports of p to all importers (CEPII BACI, the sum over every importer of the same series the cases come from), deflated by the same world unit-value index as the case's actual value. So on BACI the error of SUP is exactly the drift of c's value share of Russia's exports. On Eurostat's physical volumes, T is Russia's total in BACI tonnes (crude, oil products, coal; unit value sanity-checked against the world's) and the deflated value for gas.

**The observed total is known at computation time.** In the back-test, T(p, t) is the actual total of year t, as it is observed in the war years too when the site is computed. This is the model's point: Russia's own supply shocks (2014 crude, coal) are in the observed total and leave the error.

**Reference CUR (the current site rule).** Origin year held flat for flows of EUR 0.1bn a year or more (country total, the round-47 mid-size rule), and for smaller countries the median of the last three years times the round-47 small-flow bias factor (cf_models_r47.json, cumulative ×1.22 … ×1.57 for H1-H5). SUP uses the same start (origin share, or for small countries the median of the last three years' shares), and for small countries its own bias factor measured the same way (median cumulative error of SUP over the S country cases, rolling origins 2005-2016 pooled; for the placebo only the training origins). M0 (plain flat, origin year) and the round-48 demand model D are reported next to it.

**SUP replaces CUR for a product × size class only if all three hold** (the round-48 rule, so the results are comparable):

1. **Accuracy.** SUP's error is at least 15% lower than CUR's at **every** rolling origin from 2005 to 2016 (12 origins, including the 2008 crash and the 2013/2014 Russia shock), with at least 5 cases at each origin. The error is the site's cumulative error: per origin, the mean over H1-H5 of the median absolute cumulative log error, the fifth year at 8/12.
2. **Band.** SUP's era-calibrated 90% band for the five-year sum (H5; eras 2005-09, 2010-12, 2013-16) is not wider in log width than CUR's.
3. **Placebo.** SUP's band, built only from earlier origins, covers at least 90% of the errors with the war moved to 2014 (origin 2013, H5) and to 2018 (origin 2017, H4). Below 10 placebo cases the product's cases pooled over sizes are used.

A cell that fails narrowly fails. The rule is not changed after the results.

**Cells.** Products: crude (HS 2709), oil products (2710), gas (2711), coal (2701), cereals (HS 10), fertilisers (31), metals (72-76), other goods. The rest of HS 27 always stays as now. Size class of the product flow from Russia (4-year average to the origin, EUR): S under 0.1bn, M 0.1-1bn, L over 1bn; flows under EUR 10 m left out. Fuels are judged on Eurostat energy imports by country of origin for European reporters and on BACI elsewhere; other goods on BACI everywhere (as round 48).

**Secondary candidates (judged by the same rule, reported, not proposed unless SUP itself fails and they pass):**
- SUPT: the total extrapolated from Russia's own pre-origin trend (log-linear fit on the ten years to the origin), so no war-time information at all.

**Diagnostics only (never proposed):**
- SUPrep: the total from Russia's own customs reports (UN Comtrade, reporter Russia, partner World) instead of the BACI sum (mirror and reconciled data), 2001-2021.
- SUPq: Russia's total in tonnes (fuels) instead of deflated value, on the BACI cases.
- COMB (flagged as a secondary diagnostic): the geometric mean of the supply-side ratio and the round-48 buyer-side ratio, i.e. the share's drift shrunk halfway toward the buyer-side signal (λ = 0.5, fixed).

### War-time application, product by product (decided before the back-test results, from what is known about 2022-2026)

| product | no-war total used in 2022-2026 | why |
|---|---|---|
| crude | observed total (BACI tonnes 2022-2024; CREA's tracked volumes chained on for 2025-2026) | Russia rerouted its crude to India, China and Türkiye and kept export volumes; its output is set by OPEC+ quotas. Caveat: the 2023-2024 voluntary cuts were announced as a response to the price cap, and refinery strikes pushed some barrels from products into crude. The OPEC+ path is a diagnostic only (no back-test possible: OPEC+ began in 2017) |
| oil products | observed total 2022-2023, then held at 2023 | the 2023 EU embargo was rerouted, but from 2024 drone strikes on Russian refineries and the gasoline export bans cut exports: a war outcome, not no-war supply |
| gas | **current method** | pipeline exports to Europe collapsed by Russia's own decision: the observed total is not a no-war total. BACI does not separate LNG from pipeline gas |
| coal | observed total (flagged) | the EU embargo (August 2022) and Japan's phase-out were met by rerouting to China, India and Türkiye; part of the 2024-2026 fall is the world price, part is sanctions on Russian producers |
| cereals, fertilisers | observed total | not sanctioned; exports held or rose; the total moves with harvests and Russia's pre-war export quotas and taxes (in force since 2021) |
| metals, other goods | **current method in the proposal** (model only in the diagnostic) | the total is shaped by the sanctions themselves: EU, UK and US import bans on steel, aluminium, copper, nickel, wood, cement, gold and diamonds; gold (HS 71) goes through transit hubs. Share × a sanctions-cut total would hide the war effect |

**Hubs keep the current method in both variants:** Armenia, Georgia, Kazakhstan, Kyrgyzstan, Uzbekistan, Türkiye, Azerbaijan, Mongolia, Tajikistan, Serbia, the UAE, Belarus and Hong Kong (round 48's list; counterfactual-notes.md: their trade was reshaped by goods passing to Russia).

**No double counting.** The share is Russia's direct share before the war. The laundered line (fuel refined from Russian crude in third countries) keeps its own 2021 baseline and is not touched. War-time re-routing changes the observed total only through Russia's volume, not through the shares.

**Bands.** The share drift that remains is the band: the cumulative bands are rescaled by the ratio of SUP's back-tested band to CUR's (per size class and horizon, country-total back-test), as in round 48.

**Proposal** = only the cells that pass, for products whose total is valid (table above), non-hub countries, country total of EUR 0.1bn a year or more (as round 48). **Diagnostic** = SUP on every product except gas, outside the hubs.

<!-- results below were added after the run -->

## Verdict: is it a good model?

**No. No product × size cell passes (0 of 35), so the proposal changes nothing.** The trend variant (SUPT) passes nowhere either, and so do the diagnostics.

It is about as accurate as the current rule, not better. The reason is in the data, and it overturns the diagnosis this round started from:

- **Russia's own total explains about 1% of the error of "held flat".** Across 5,070 product flows of mid-size and large buyers (H5, origins 2005-2016), the five-year error of flat splits into the change of Russia's total and the drift of the buyer's share. The total explains 0.8% of the variance overall and 7% for large flows. By product: crude 0.9%, oil products 0.8%, coal −0.5%, cereals 2.3%, fertilisers 3.3%, metals 1.5% (`error_decomposition_H5`).
- **Russia's export volumes were steady before the war.** Crude 230-270 Mt a year from 2004 to 2021. The 2014 shock was price, which the site handles separately. Coal grew steadily (82 Mt in 2005 to 222 Mt in 2021) but the buyers' shares moved far more.
- **So share × total ≈ held flat, plus noise.** Most of the error is buyer-specific share drift, which no supply-side total can see.

### Country totals (BACI; the model on every product except gas; origins 2005-2016)

Error = mean over origins of the per-origin error (H1-H5, median absolute cumulative log error). Bias = median five-year (H5) error, positive = too low.

| size | n | current: error | supply: error | demand (r48): error | combined (diag.): error | supply: bias | supply: origins ≥15% / worst | current H5 band | supply H5 band | supply placebo 2014 / 2018 |
|---|---|---|---|---|---|---|---|---|---|---|
| S | 482 | 0.470 | 0.466 (+1%) | 0.447 (+5%) | 0.434 (+8%) | +0.00 | 0/12, −27% | ×0.23-4.91 | ×0.29-4.63 | 90% / 91% |
| M | 575 | 0.322 | 0.308 (+4%) | 0.246 (+24%) | 0.271 (+16%) | +0.07 | 1/12, −16% | ×0.40-3.33 | ×0.33-3.13 | 92% / 98% |
| L | 490 | 0.148 | 0.141 (+5%) | 0.126 (+14%) | 0.127 (+14%) | −0.01 | 1/12, −10% | ×0.47-1.94 | ×0.44-1.72 | 98% / 96% |
| all | 1,547 | 0.281 | 0.265 (+6%) | 0.229 (+19%) | 0.242 (+14%) | +0.01 | 1/12, −3% | | | |

- The supply model removes the small-buyer bias (its own small-country shift is smaller: ×1.11 to ×1.34 cumulative, against round 47's ×1.22 to ×1.57) and its placebo coverage is fine. But it is not more accurate, which is the test that counts.
- The demand model (round 48) stays the better idea; the combined variant (λ = 0.5, a secondary diagnostic) lands between the two and does not pass any cell either (best: BACI coal M, 11 of 12 origins, worst +5%, but placebo 85%).
- The trend variant (SUPT, no war-time data) is worse than the current rule for large flows (error 0.213 against 0.148): extrapolating Russia's trend from the 2000s boom overshoots.

### Product × size cells (SUP against the current rule; `verdict_by_cell.SUP`)

| data | cell | n | origins ≥15% | worst | median | band | placebo 2014 / 2018 |
|---|---|---|---|---|---|---|---|
| BACI | crude M / L | 203 / 267 | 0 / 0 | −16% / −23% | +1% / −4% | ×0.96 / ×0.94 | 100% / 86%, 100% |
| BACI | oil products S / M / L | 347 / 377 / 161 | 0 / 1 / 2 | −5% / −11% / −21% | +1% / −1% / −4% | ×0.98 / ×1.01 / ×0.80 | 87-100% |
| BACI | coal S / M | 258 / 177 | 2 / 4 | −25% / −6% | −0% / +9% | ×1.13 / ×0.67 | 100% / 85% |
| BACI | cereals S / M | 345 / 92 | 2 / 3 | −59% / −102% | −10% / +6% | ×1.05 / ×0.47 | 96-100% |
| BACI | fertilisers S / M | 664 / 186 | 1 / 2 | −8% / −25% | +5% / −1% | ×0.93 / ×0.96 | 89-100% |
| BACI | metals S / M / L | 540 / 470 / 123 | 0 / 2 / 4 | −11% / −5% / −14% | +1% / +1% / +2% | ×0.87 / ×1.10 / ×0.97 | 88-100% |
| BACI | other goods S / M / L | 546 / 589 / 169 | 1 / 7 / 5 | −10% / −21% / −36% | +0% / +19% / +7% | ×0.96 / ×0.94 / ×0.81 | 85-96% |
| BACI | gas S / M / L | 113 / 166 / 51 | 0 / 3 / 3 | to −72% | −1% to +21% | ×0.80-1.62 | 40-100% |
| Eurostat | crude L | 261 | 1 | −28% (2014) | +0% | ×0.92 | 73% / 91% |
| Eurostat | oil products L | 296 | 2 | −24% | +7% | ×1.09 | 92% / 100% |
| Eurostat | coal L | 287 | 0 | −49% | −13% | ×1.05 | 91% / 100% |
| Eurostat | gas L | 219 | 0 | −358% | −50% | ×2.15 | 6% / 100% |

- **Closest to passing: BACI other goods M** (7 of 12 origins, median +19%, band ×0.94, placebo 93% / 96%); it fails at 2007 and 2011-2014. Other goods are anyway excluded from the proposal (sanctions-shaped total).
- **Crude L, the 2014 case:** the model was meant to fix it. It is 23% worse at the 2013 origin on BACI and 28% worse at 2014 on Eurostat: Russia's crude volume barely moved in 2014-2016, while some buyers' shares (Netherlands, Poland, Germany) fell by themselves.
- **European gas** is not meaningful: BACI misses most pipeline gas (USD 10.5bn of Russian gas exports in 2005 against 30.8bn in Russia's own customs report), so the "total" is mostly LNG. Russia's customs report gas as confidential from 2016, so the reported-total diagnostic cannot replace it.
- The full table, with the comparison against plain flat and the round-48 demand model, is `verdict_by_cell` and `comparisons_by_cell`. SUP against plain flat (M0) and against D is similar: around 0 against flat, and worse than D in most cells.

## War-time totals: what was used (`wartime_total_index`)

The pre-registered source, BACI 2022-2024, turned out to be incomplete: BACI's war-time data are mirror data, and importers that stop reporting drop out (Iran, Libya, Sudan, Bangladesh and Algeria for grain, 26% of Russia's 2021 grain exports by 2024). Raw BACI gives oil products 0.52 and grain 0.66 by 2024. **This was found and fixed before the site before/after was run; it does not touch the back-test or the rule.**

| product | 2022 | 2023 | 2024 | 2025 | 2026 | source |
|---|---|---|---|---|---|---|
| crude | 1.04 | 1.01 | 1.01 | 0.94 | 1.02 | 2021: Russia's customs report (231.6 Mt, Comtrade); 2022-2025 CREA (pipeline crude is in CREA only from January 2022); 2026: 9 months on 2025 |
| oil products | 0.88 | 0.85 | 0.85 (held) | 0.85 | 0.85 | CREA; held at 2023 from 2024 (observed 0.80, 0.74, 0.56) |
| coal | 0.94 | 0.96 | 0.84 | 0.91 | 0.97 | CREA |
| cereals | 1.11 | 1.41 | 1.30 | 1.17 | 1.14 | USDA PSD, wheat + barley + corn |
| fertilisers | 0.83 | 1.01 | 1.14 | held | held | BACI importers present in both years, Russia's own unit values |
| metals | 0.79 | 0.71 | 0.60 | held | held | same |
| other goods | 0.71 | 0.81 | 0.71 | held | held | same |

The OPEC+ quota path for crude was not computed: OPEC+ began in 2017 (no back-test possible) and no crude cell passes, so it could not change the proposal.

## Before/after on the site (`site_before_after`, `site_before_after_summary`)

**Proposal:** nothing passes, so **no country changes**. World no-war level 2022-2026: EUR 2,181bn (range 1,498-3,318); sum of "paid" 140.8bn.

**Diagnostic** (the model on every product except gas, outside the hubs; bands rescaled by the model's own back-tested bands):

- 184 countries patched; **31 change group or side** (52 numbers).
- World no-war level 2,181 → **2,007bn** (range 1,343-2,906); sum of "paid" 140.8 → **85.1bn**. Almost every no-war level falls, because Russia's war-time totals of oil products, metals and other goods fell. That fall is largely the sanctions themselves, so the diagnostic counts part of the war's effect as if it were no-war supply.
- Big buyers' no-war level 2022-2026: China 336 → 310bn, Germany 183 → 173bn, UK 114 → 91bn, USA 129 → 109bn, Italy 82 → 77bn, Japan 56 → 51bn, India 34 → 29bn; Türkiye unchanged (hub).
- **Become certain:** Djibouti (net and Russia's earnings).
- **Lose certain:** Bulgaria (net), Cameroon (Russia's), Colombia (both), Jordan (both), Japan (Russia's), French Polynesia (Russia's).
- Other moves: Algeria and Morocco from essentially zero to leaning Russia; Greece from essentially zero (Ukraine) to too close to call (Russia); Taiwan's net +0.74bn → +0.12bn.
- **Biggest movers on the net** (points of GDP): Moldova −1.18 (its own researched baseline), Estonia −1.00, Turkmenistan −0.91, Lebanon −0.77, Syria −0.73, Lithuania −0.53, Finland −0.50, Latvia −0.49, Greece −0.39, Gibraltar −0.38.

## Things that look wrong or fragile

- **The premise did not hold.** Russia's own supply moved little in volume before the war; what moved was each buyer's share. The supply model therefore cannot do better than flat in the back-test, and the remaining error (the band) is as wide as before.
- **The war-time total is itself a war outcome,** beyond gas: oil products (refinery strikes, export bans), metals and other goods (EU, UK and US bans). Share × that total shrinks the measured war effect (world "paid" −40% in the diagnostic). It also contradicts the site's own principle (counterfactual.md: no model may use Russia's own trade after 2022). For crude, cereals and fertilisers the total is cleaner, but those cells do not pass.
- **BACI war-time totals are incomplete** (mirror data, non-reporting importers). The replacement sources mix CREA (tracked shipments), USDA (marketing years averaged to calendar years) and a matched-importer index, each with its own coverage.
- **CREA's crude break** in January 2022 (pipeline crude added: 16.6 Mt in December 2021, 23.0 Mt in January 2022).
- **Gas cannot be tested properly** on BACI or Russia's own reports (see above). It keeps the current method in every variant.
- **The small-country bias shifts are in-sample** for both the current rule (round 47's published factor) and the supply model (its own); the placebo re-measures them on training origins only.
- **Size classes:** the product cells use the product flow's size (as round 48); the start rule uses the country total's size (as the site).
- **Moldova** moves most in the diagnostic, but its pre-war level is a researched baseline (right-bank gas and other goods), so the product weights from `prices.json` may not describe it.
- **Hubs:** excluded by design. Russia's war-time totals include goods sent through them, but the shares are pre-war, so nothing is counted twice; the laundered line keeps its own 2021 baseline.
