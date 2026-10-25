# "Paid to Russia": can we predict the buyer's share? A share model (round 50)

Data file: `research/2026-10/gaps/share_cf_r50.json`. Script: `research/2026-10/scripts/share_cf_r50.py`. Page for the owner: https://claude.ai/artifact/6kmXi8J1QfoGs1nt4RAB1b (private).

- `python3 -I research/2026-10/scripts/share_cf_r50.py fetch` downloads into the scratchpad and writes `raw/share_cf_r50/`. Each file carries its URL and the retrieval date (2026-10-25). They are not yet in `raw/MANIFEST.json`.
  - `baci_fuel_hs4_1995_2000.json.gz`: BACI fuel headings for 1995-2000, the training years.
  - `supply_infra_sources_2026-10-25.json`: the curated supply and infrastructure tables with their source URLs.
- `... run` reads committed raw files only and takes about 45 seconds. It imports round 49's script, which uses round 48's `raw/demand_cf_r48/` (present on this branch). Round 49's SUP is reproduced exactly: median gain against CUR is crude L −3.6%, coal M +8.9% and oil products L −3.5%.
- The site before/after was computed with the site's own `calc()` on `site/data.json` of 2026-10-25, round 47 live (scratchpad `r50/ba.mjs`, a copy of round 49's). It was then added with `... merge <file>`.

**Nothing here is read by the build, and no number on the site changes.**

## Rule (written 2026-10-25 before any back-test result was computed; the same rule is in the script as `RULE`)

**Why this round.** Round 49 found that Russia's own export total explains about 1% of the error of "2021 held flat". Nearly all of it is the drift of each buyer's share. The owner asked whether the share can be predicted.

**Candidate SHR.** For country c, product p and year t:

no-war purchases(c, p, t) = Russia's **no-war** exportable supply of p in t × predicted share(c, p, t) × the site's no-war price.

**A. Russia's no-war supply.** This is the pre-war trend plus capacity planned before 2022, given as a range. It is **not** the war-time actual: strike losses, sanctions and embargoes are war effects and stay counted as such.
- In the back-test the supply is Russia's total as forecast at the origin: its log-linear trend over the ten years to the origin, damped by 0.5. Round 49 found the undamped trend overshoots.
- In the war years it is the index in `SUPPLY`, with sources in `raw/share_cf_r50/supply_infra_sources_2026-10-25.json`.

**B. Share model.** It has three estimated parameters, pooled over buyers per product and data set:

log share(t)/share(o) = b1·h·g_share + b2·h·g_demand + b3·Δlog relprice(o→t) + infra(c, p, o, t)

- **g_share** is the slope of log share over o−3..o.
  - BACI: c's deflated value over Russia's deflated total.
  - Eurostat: c's volume over Russia's total in BACI tonnes, or deflated value for gas.
- **g_demand** is the slope of c's import volume of p from all suppliers, minus the slope of world import tonnes, over o−3..o.
- **relprice** is the unit value of Russian p delivered to c over the unit value of c's imports of p from everyone else (BACI).
  - SHR uses the realised change. It is known in the back-test, but **not in the war years**: there it is held at the pre-war differential, because sanction-era discounts are war effects.
  - So the price term can help only in the back-test. **SHR0** is the same model refitted without the price term.
- **infra** adds log(1 + net × allocated capacity change o→t / c's volume from Russia at o), floored at log 0.1. It counts only the events in `INFRA` whose FID or intergovernmental agreement predates the origin.
  - Net factor 1.0 applies to gas pipelines and LNG with named long-term buyers and no prior Russian flow on the route: Blue Stream, Sakhalin-2, Power of Siberia, IGB.
  - Net factor 0.5 applies otherwise: new crude routes partly displace rail or sea flows, and terminals run below nameplate.
  - Diffuse events are allocated to the buyer group by imports from all suppliers at the origin.
- **Policy** (EU diversification after 2014, the Third Energy Package) enters only through the infrastructure it financed: Klaipėda, Świnoujście, Krk, Balticconnector, Baltic Pipe and IGB. A policy dummy cannot be estimated out of sample before 2014.
- **Estimation.** Least squares without a constant, with b1, b2 in [0, 1] and b3 in [−5, 1].
  - It runs on M and L flows, with y winsorised at ±1.5 and trends at ±0.5 a year.
  - It is fitted **only on pairs that end at or before the origin** (o′ + h ≤ origin). BACI 1995–2000 was added so that the 2005 origin has training data; training pairs start from 1998.
  - With fewer than 30 pairs the prior b = (0.5, 0.5, 0) is used.
- **Not available for the back-test:**
  - Urals–Brent and ESPO–Dubai differentials and route freight for 2001–2021. Argus and Platts are paid, and Minfin's Urals series and the IEA, OPEC and Minenergo pages refuse the connection from here.
  - They are replaced by BACI unit values. These are close to FOB, so freight is not in the price term.
  - Historical vintages of capacity plans: in the back-test, supply is the damped trend.

**C. Unchanged.** Hubs, laundered oil and re-exports keep the treatment of rounds 48 and 49.

**Reference CUR** is the current site rule. For M and L flows it holds the origin year flat, the same as plain flat M0. M0, D (round 48's demand model) and SUP (round 49's supply model) are reported next to it, on exactly the same cases: round 49's script is imported.

**SHR replaces CUR for a product × size cell only if all hold:**

1. **Accuracy.** SHR's error is at least 15% lower than CUR's at **every** rolling origin from 2005 to 2016 (12 origins, including 2008 and 2014), with at least 5 cases at each origin.
   - The error is the site's cumulative error: per origin, the mean over H1–H5 of the median absolute cumulative log error, with the fifth year at 8/12.
2. **Band.** SHR's era-calibrated 90% band for the five-year sum (its own back-test errors; eras 2005–09, 2010–12, 2013–16) is not wider than CUR's.
3. **Placebo.** SHR's band, built only from earlier origins, covers at least 90% with the war moved to 2014 (origin 2013, H5) and to 2018 (origin 2017, H4). Below 10 cases the product's cases are pooled over sizes.
4. **Application consistency.** The war-time application cannot use the realised price term, so a cell is proposed only if **SHR0 passes the same three tests**.
   - A cell where SHR passes and SHR0 fails is reported as "passes only with information the war-time application cannot have".

A cell that fails narrowly fails, and the rule is not changed after the results.

**Scope.**
- **Products:** crude (2709), oil products (2710), gas (2711, pipeline and LNG) and coal (2701).
- **Size:** L, meaning a product flow over EUR 1bn a year (4-year average). On Eurostat it is the country total's size, as in rounds 48 and 49.
- **Mid-size cells** of a product are judged under the rule only if its L cell passes on that data set; otherwise they are a diagnostic.
- **Data sets:** fuels are judged on Eurostat (by country of origin) for European reporters and on BACI elsewhere.

**Decomposition** (out of sample). This measures how much of the share drift (log share(t)/share(o), M and L flows, origins 2005–2016) the predicted share change explains, as 1 − var(residual)/var(drift) and 1 − MSE(residual)/MSE(drift). It uses SHRa and SHRa0: the share model times Russia's actual total, which isolates the share part. These are diagnostics only.

**War-time application.**
- Supply index (2021 = 1, low / central / high) × the share factor from the SHR0 fit at origin 2021.
  - The drivers are 2018–2021, with the price term at 0.
  - Infrastructure planned before 2022 is included: the Power of Siberia contract ramp for China, Baltic Pipe for Poland and IGB for Bulgaria.
- Gas is split into pipeline and LNG with the site's 2018–2021 mix.
- Hubs keep the current method. Prices are the site's no-war paths, so there is no double counting with the windfall.
- **Bands:** the site's band, rescaled by SHR0's back-tested country-total band against CUR's (as rounds 48 and 49), and widened by the supply range.
- **Proposal** = passing cells only, in non-hub countries with purchases of EUR 0.1bn a year or more. **Diagnostic** = SHR0 on every in-scope cell.

<!-- results below were added after the run -->

## Verdict: can the share be predicted?

**No. No cell passes: 0 of 8 large cells, and 0 of 16 including mid-size. The proposal changes nothing.** Mid-size cells are diagnostics only, because no large cell passed.

The share model is about as accurate as the current rule, no better:

- **Out of sample it explains almost none of the share drift.** For large flows over five years (H5, origins 2005-2016), the explained share is 1 − var(residual)/var(drift):

  | data | crude | oil products | gas | coal | all four |
  |---|---|---|---|---|---|
  | BACI | 5% | 3% | 2% | 6% | **4%** |
  | Eurostat | −2% | −10% | −8% | −1% | **−6%** |

  A negative value means the prediction adds noise. SHR0 (no price) gives the same picture: 3% and −5%. Mid-size and large flows together: −3% (BACI) and −5% (Eurostat). Details are in `share_drift_explained_out_of_sample`.
- **Past share trends do not persist.** The weight on the buyer's own four-year share trend (b1) sits at its lower bound 0 at almost every origin for every product.
- **Demand helps only a little, in one place.** The weight on the buyer's relative demand trend (b2) is about 0.3 only for European crude. Elsewhere it is 0 to 0.17.
- **The price term has the wrong sign for crude.** b3 is +0.3 to +0.5: a higher Russian unit value goes with a higher value share. That points to grade and quality mix in BACI unit values, not to substitution. The term cannot be applied in the war years anyway, where the differential is held at its pre-war range.
- **Infrastructure known in advance touches few cases.** 17 events qualify (`infrastructure_cases_touched`): ESPO and Sakhalin-1 to Asia, ESPO and Kazakh transit to China, Sakhalin-2, Yamal LNG, Blue Stream, Klaipėda, Świnoujście, Balticconnector, and Sever to Primorsk against Latvia. They are not enough to move a cell.
- **Free signs do not rescue it (post-hoc diagnostic, added after the results, never proposed).** With mean reversion allowed, b1 is −0.1 to −0.25: a buyer whose share rose for four years tends to lose a little. The model then explains 4% (BACI, large) and −3% (Eurostat, large), and still passes no cell (`posthoc_free_signs`, `verdict_by_cell.SHRf0`).

**So the drift of a buyer's share of Russia's exports is, from pre-origin information, close to a random walk.** That is why every level model tried since round 44 fails the 15%-at-every-origin test. The round-48 demand model (D) sees part of it through the buyer's actual imports in the forecast years. D is better than the share model in every large cell, and it did not pass either.

## Back-test (large cells; mean error over the 12 origins; `comparisons_by_cell`, `verdict_by_cell`)

Error is the site's cumulative error: per origin, the mean over H1-H5 of the median absolute cumulative log error. CUR equals plain flat (M0) for these flows.

| data | cell | n | current (= flat) | share SHR | SHR0 | demand r48 | supply r49 | SHR origins ≥15% | SHR worst | SHR band | SHR placebo 2014 / 2018 | why it fails |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Eurostat | crude L | 261 | 0.137 | 0.153 | 0.151 | 0.118 | 0.140 | 2/12 | −52% (2008) | ×0.99 | 73% / 91% | accuracy, placebo |
| Eurostat | oil products L | 296 | 0.271 | 0.260 | 0.261 | 0.241 | 0.251 | 0/12 | −5% (2015) | ×1.04 | 92% / 100% | accuracy, band |
| Eurostat | gas L | 219 | 0.141 | 0.154 | 0.151 | 0.068 | 0.233 | 2/12 | −58% (2005) | ×0.89 | 82% / 100% | accuracy, placebo |
| Eurostat | coal L | 287 | 0.258 | 0.277 | 0.276 | 0.192 | 0.302 | 1/12 | −32% (2010) | ×1.16 | 87% / 100% | all three |
| BACI | crude L | 267 | 0.189 | 0.189 | 0.197 | 0.160 | 0.202 | 2/12 | −47% (2006) | ×1.14 | 95% / 100% | accuracy, band |
| BACI | oil products L | 161 | 0.219 | 0.227 | 0.233 | 0.187 | 0.228 | 1/12 | −39% (2005) | ×0.96 | 93% / 93% | accuracy |
| BACI | gas L | 51 | 0.222 | 0.241 | 0.233 | 0.201 | 0.251 | 0/12 | −23% (2016) | ×1.22 | 93% / 97% | accuracy, band |
| BACI | coal L | 25 | 0.374 | – | – | – | – | 0/12 | – | ×0.62 | 97% / 100% | fewer than 5 cases at every origin |

- **Country totals of large buyers** (BACI composite, model on their large fuel flows): current 0.148, SHR 0.145 (+2%), SHR0 0.149 (−1%), r48 demand 0.142 (+4%), r49 supply 0.152 (−3%). SHR is 15% better at 1 of 12 origins (worst −7%) and SHR0 at 0 (worst −10%). SHR0's placebo coverage is 98% / 96%. Mid-size country totals have no large fuel flow, so they are unchanged.
- **Mid-size cells** (diagnostic) are no better: BACI coal M is the best, with 4 of 12 origins and median +12%; BACI crude M has 2 of 12. Eurostat gas M SHR0 has median +24% and worst +13%, but has too few cases at most origins (1 of 12 origins counts at ≥15%). The full table is `verdict_by_cell`.
- Chart-ready rows (current, flat, D, SUP, SHR, SHR0, SHRa, SHRa0, free-sign SHRf0, per origin) are in `chart_rows`. Fitted coefficients by origin are in `coefficients_by_origin`.

## Russia's no-war supply (`supply_nowar_index_2022_2026`, sources in `supply_sources` and the raw file)

2021 = 1, central (low-high):

| | 2022 | 2023 | 2024 | 2025 | 2026 | basis |
|---|---|---|---|---|---|---|
| crude exports | 1.04 (1.00-1.08) | 1.07 (1.00-1.13) | 1.07 (1.00-1.15) | 1.07 | 1.07 | See note A |
| oil products | 1.00 (0.97-1.02) | 1.00 | 0.99 | 0.98 | 0.98 (0.91-1.03) | See note B |
| coal | 1.025 | 1.05 | 1.08 | 1.10 | 1.13 (1.05-1.22) | See note C |
| pipeline gas, Europe and Turkey | 1.05 (1.00-1.14) | 1.05 | 1.05 | 1.05 | 1.05 | See note D |
| LNG | 1.05 | 1.16 | 1.39 | 1.61 | 1.72 (1.61-1.75) | See note E |

**Notes to the table:**

- **A. Crude.** OPEC+ deal of 18 July 2021: +0.4 mb/d a month to September 2022, and Russia's baseline rises from 11.0 to 11.5 mb/d from May 2022. Energy Strategy 2035: 11.15-11.25 mb/d to 2024. Refinery runs are held flat. The central case produces half of the OPEC+ room.
- **B. Oil products.** Refinery runs are flat. The tax manoeuvre and the damper apply. The range is around flat.
- **C. Coal.** Coal programme 2035 (June 2020): exports +22% to +86% on 2018 by 2035, which is +1% to +4% a year. The Eastern Polygon is the constraint.
- **D. Pipeline gas.** 2021 was about 175 bcm. Gazprom's 2021 guidance was 175-183 bcm. The high case is the 2019 level with Nord Stream 2 in service (the Nord Stream 2 range).
- **E. LNG.** 2021 was 29.6 Mt. Portovaya adds 1.5 Mt in 2022. Arctic LNG 2 adds 3 × 6.6 Mt in 2023, 2024 and 2025 (Novatek, May 2021). The low case has each train one year late.

China's pipeline gas follows the Power of Siberia contract ramp (10 → 38 bcm, contract of 2014) as an infrastructure event, not this index.

## Before/after on the site (`site_before_after`, `site_before_after_summary`)

**Proposal:** nothing passes, so **no country changes**. The world no-war level for 2022-2026 is EUR 2,181bn (range 1,498-3,318). The sum of "paid" is 140.8bn.

**Diagnostic** (SHR0 × no-war supply on every large fuel flow, outside the hubs):

- **20 countries patched; 1 changes group.** Japan's Russia's earnings go from certain to near zero, at the 95% edge (p 0.951 → 0.950). No country becomes certain.
- **World no-war level:** 2,181 → **2,253bn** (range 1,416-3,602). **Sum of "paid":** 140.8 → **166.6bn**.
- **Big buyers' no-war level for 2022-2026** (EUR bn):
  - China 336 → 377 (Power of Siberia ramp, coal and crude supply);
  - Germany 183 → 190;
  - Netherlands 89 → 93;
  - Italy 82 → 85;
  - Japan 56 → 63 (Arctic LNG 2);
  - Poland 74 → 76;
  - Korea 70 → 72;
  - USA, UK and India almost unchanged.
- **Biggest movers on the net** (points of GDP): Hungary +0.25, Lithuania +0.25, Netherlands +0.19, Czechia +0.17, Poland +0.11, China +0.08, Germany +0.08, Italy +0.07.
- **The change comes almost entirely from Russia's planned supply, not from the share.** With b1 at 0, the share factors are about 1, except China's gas (Power of Siberia) and a few small trend and demand terms of a few percent.

## Things that look wrong or fragile

- **The supply index matters more than the share model.** Planned growth of Russia's crude (OPEC+ room), coal and LNG raises every big buyer's no-war level, and the sum of "paid" by 18%. These indices rest on secondary reports: the primary IEA, OPEC, Minenergo and government pages refused the connection. The OPEC+ "half the room" central case is a judgement.
- **Arctic LNG 2 is allocated pro rata to 2021 LNG buyers.** Japan's no-war gas then rises 72% by 2026 and Japan changes group. Who would have bought those cargoes was not known in 2021.
- **Poland's Baltic Pipe was excluded from the war-time application after the first diagnostic run.** The site already drops Poland's no-war gas from 2023 (end of the Yamal contract), and counting it again cut Poland's gas share factor to 0.53. This touches neither the back-test nor the rule. The code marks it as `SITE_ALREADY`.
- **The free-sign refit was added after the results.** It is a diagnostic only, and it also fails.
- **European gas has no clean Russian total.** BACI misses most pipeline gas, so the Eurostat gas share is measured against a deflated BACI value that is mostly LNG. Its drift and its "supply trend" are not meaningful; this is why r49's SUP is so bad there. BACI coal L has only 25 cases.
- **The infrastructure net factors are judgement, fixed before the results.** They are 1.0 for contracted gas with no prior flow and 0.5 otherwise. The allocation of diffuse events (Kozmino, Yamal LNG) uses imports at the origin.
- **Freight and benchmark differentials** (Urals–Brent, ESPO–Dubai) could not be had for 2001-2021. The price term is a BACI unit-value ratio, which mixes quality with price.
- **Hungary's "paid" changes sign** (−0.24 → +0.23bn) in the diagnostic, without a change of group.
- **Every figure must be recomputed at integration** if the site data change (round 47 live on 25 October 2026).
