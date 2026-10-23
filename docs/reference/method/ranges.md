# Ranges and certainty letters: technical reference

Developer reference for the method page [Ranges and certainty letters](https://warbalance.org/#view=how&sec=m-ranges). It keeps every parameter, research file, function name and formula behind that page, as the page stood before it was shortened for readers (round 38). The site's page explains the same method in plain words; when the two differ, the code and the research files decide.


Every number on the map has a middle value, a likely range and a certainty letter from A (reported) to D (rough indication). The likely range covers the uncertainty of the data and the models **given the method**; it is calibrated by judgement to about 90% (it mixes measured back-test bands with default widths per letter, combined as errors), not measured. How much the method choices move a result is the separate [method band](https://warbalance.org/#view=how&sec=m-ranges-the-method-band). This page explains where each part's range comes from, how the site combines four sources of uncertainty for every traded flow without stacking worst cases, how parts add up to a total, how 2026 estimates are marked, and, just as important, what the ranges do not cover.

## Certainty letters

| letter | meaning | default range when the data give none |
|---|---|---|
| A | reported (official statistics, Kiel allocations) | ±5% |
| B | measured estimate (mirror data, documented figures) | ±15% |
| C | modelled estimate | ±35% |
| D | rough indication | ±70% |

Defaults are `RANGE` in [`site/index.html`](https://github.com/intelligent-cream/war-balance/blob/main/site/index.html); they are applied in `part()` only when a part's own low and high coincide. The four widths (±5%, ±15%, ±35%, ±70%) are a judgement, not a measured error ([decisions](../../changelog-full.md#cl-r11)). Each research file assigns letters per value ([`gaps.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps.md) shows per country which parts are reported or estimated).

**A total's letter in the cost view.** The cost view (in the full data download only) grades a total by how much of it rests on primary data, weighting each part by its absolute value: <span class="incode">In the code: `gradeTotal()` in `site/index.html`</span>

| total | rule |
|---|---|
| A | at least 80% of it in parts graded A |
| B | at least half in parts graded A or B (primary data) |
| C | at least 75% in parts graded A to C |
| D | otherwise: more than a quarter rests on rough indications (D) |

**Each headline number's letter.** Support for Ukraine, Russia's earnings from trade and the net each get a letter from two things: <span class="incode">In the code: `grade()` and `grades()` in `site/index.html`</span>

- **data**: the share of the number's absolute size (parts weighted by their absolute values) that rests on parts graded A or B (primary data), and the share on parts graded D (judgement); C parts (modelled from data) are the rest;
- **spread**: the width of the likely range and the method band together, from the lowest to the highest end, divided by the number's absolute value.

| letter | A–B share at least | D share at most | spread at most |
|---|---|---|---|
| A | 75% | 5% | 0.5 × the value |
| B | 50% | 15% | 1 × the value |
| C | – | 35% | 2.5 × the value |
| D | otherwise | | |

The thresholds are a judgement, chosen so that the letters separate countries. Trade parts built on the modelled no-war level are C by rule (below), so Russia's earnings from trade is at best C. Distribution in the current build (all 228 economies with a GDP; those above EUR 5bn; those whose direction is certain):

| number | all | GDP ≥ EUR 5bn | GDP ≥ EUR 5bn, direction certain |
|---|---|---|---|
| support for Ukraine | 2 A, 7 B, 31 C, 188 D | 1 A, 7 B, 26 C, 129 D | 1 A, 7 B, 25 C, 35 D |
| Russia's earnings from trade | 64 C, 164 D | 51 C, 112 D | 40 C, 3 D |
| net | 1 A, 3 B, 66 C, 158 D | 3 B, 54 C, 106 D | 3 B, 45 C, 4 D |

Most D letters belong to numbers close to zero, whose range is wide against their size (a country with almost no support for Ukraine, or almost no change in what it pays Russia). Examples: Germany C (support), C (Russia's earnings from trade), C (net); France B, C, C; Hungary D, C, C.

**Stacked models are at best C.** A part built from a modelled no-war level *and* a modelled share (Russia's or Ukraine's net gain, a seller's net gain, genuinely extra, a price index) stacks two models, so it is at best C, a modelled estimate: less paid to Russia, extra purchases from Ukraine, sales to Russia, services bought and sold (`cRus`, `cTrade` and the `weakest([.., "C"])` calls in `calc()`). "Less paid to Russia" is the largest part for most top-ranked countries, so most headline letters are C or D. Inputs quoted from memory and not fetched again are D (the 2021 fertiliser margin in `net_gain_russia-notes.md`).

**Letters fixed in `calc()`.** Three parts do not take their letter from the data:

- **Gold and hidden payments** are always D. The data gives the UAE's hidden gold C, but every hidden channel rests on rough estimates of what customs miss, so the site keeps the lowest letter for all of them.
- **Russian oil bought via other countries** is always C. It is modelled for every buyer (the refiner's crude share, hub resale shares), so no buyer's figure is better than a modelled estimate.
- **Aid to Ukraine (Kiel, adjusted)**: Kiel's figure is reported, but the part is adjusted by modelled factors (weapons at market value, loans as gifts). It takes Kiel's letter only where the adjustments are under 5% of it; under 25% at most B; otherwise at most C. <span class="incode">In the code: `aidCert` in `calc()`</span>
- **Share of EU-level aid** is always B. The EU's own aid is reported (Kiel), but the split over members by budget share and the loans' economic value are estimates.

These are judgements; they change letters, not values ([decisions](../../changelog-full.md#cl-r11)).

## Where a part's range comes from

Each series in `data.json` is a triple per year: `years`, `years_lo`, `years_hi`. The pipeline ([`build_data.py`](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/build_data.py)) takes them from the research files, which build them from:

- **disagreement between sources**: a country's own customs report against its partner's mirror report ([`trade_full-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/trade_full-notes.md): half the mirror gap, 3–25%, for reported values; 10–60% for mirror values);
- **Monte Carlo or percentile ranges** of a model (China's military support, the residual gap, gap-filled trade);
- **alternative assumptions** (resale shares, margins, own-industry shares, refugee cost per person).

Flows compared with a pre-war level carry three more triples: `base` with `base_range`, `pidx` with `pidx_lo`/`pidx_hi` ([prices.md](https://warbalance.org/#view=how&sec=m-prices)), and `bmul` with `bmul_lo`/`bmul_hi` ([counterfactual.md](https://warbalance.org/#view=how&sec=m-counterfactual)). `triple()` widens `base_range` to include 2021 alone at pre-war prices and the middle base. <span class="incode">In the code: `l[0]/ph[0]`, `h[0]/pl[0]`</span>

## Quadrature for traded flows: `spread()`

Inside `calc()`, `spread(t, ex, act)` computes the change against the expected level for one flow, summed over 2022 up to the chosen year, and its range. For each of four sources of uncertainty it sums, over the years, how far the total moves when only that input goes to its low or high end:

| term | input moved | low side | high side |
|---|---|---|---|
| `bl`, `bh` | pre-war level `base_range` | `e − ex(base_lo)` | `ex(base_hi) − e` |
| `al`, `ah` | actual values `years_hi` / `years_lo` | `act(high) − a` | `a − act(low)` |
| `pl`, `ph` | price level `pidx_lo` / `pidx_hi` | `act(p_lo) − a` | `a − act(p_hi)` |
| `ql`, `qh` | counterfactual `bmul_lo` / `bmul_hi` | `e − ex(q_lo)` | `ex(q_hi) − e` |
| `nl`, `nh` | no-war fuel price `nrl` / `nrh` (payments to Russia) | `e × (1 − nrl)` | `e × (nrh − 1)` |
| `gl`, `gh` | the seller's net-gain share, low and high (flows with `gain`) | how far the change moves at the low shares | how far it moves at the high shares |

They are then combined:

```
lo = sqrt(bl² + al² − bl·al + pl² + ql² + nl² + gl²)
hi = sqrt(bh² + ah² − bh·ah + ph² + qh² + nh² + gh²)
range = [mid − lo, mid + hi]
```

- **Baseline and actual values are correlated 0.5** (a judgement, not measured; [decisions](../../changelog-full.md#cl-r11)), because they come from the same sources (the same customs office reports both 2021 and 2024). For a difference of two errors with correlation ρ, the variance is `σb² + σa² − 2ρ·σb·σa`; with ρ = 0.5 that is the `− bl·al` term.
- **Price, counterfactual, no-war price and net-gain terms are independent** of the others.
- **Errors are summed over the years first**, then combined: the same baseline applies every year, so its error does not average out over time.

**The expected total's own band.** For flows with a back-tested counterfactual, the trend term does not add
up the yearly bands. The back-tests measured the error of the *sum* over 1–5 years directly (per flow, size class and
model, calibrated so that two tests' bands cover 90% of the third), and `spread()` uses
`ql = (1 − low) × Σe` and `qh = (high − 1) × Σe`, where `Σe` is the expected total and `[low, high]` the measured band
for that number of years (`cb` in `data.json`; 2026 counted at 8 of 12 months). Because one flow's yearly errors are
strongly correlated (0.6–0.7 between years), the measured bands are about as wide as the sum of the yearly bands (×0.8–1.2). The yearly view and the "only the rise" parts keep the yearly bands. Belarus's imports from Russia
keep their own yearly band. Source: [`cf_bands.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/cf_bands.json)
([notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/cf_bands-notes.md)).

The low end does not take the low baseline, the high actual value and the low price level all at once (stacked worst cases): that would make ranges too wide in one way and ignore forecast error in another.

Variants:

- **"Only the rise"** parts (extra purchases from Ukraine, extra sales to Ukraine, laundered oil) use `above3()`: `spread()` on each year alone, counting only the positive part of each bound.
- **Income parts** (sales and services to Russia) are multiplied by the money rule's factor, the seller's net gain (taxes plus profit above a normal return, [`net_gain_sellers.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers.json)) × genuinely extra (`c.vk` in `data.json`): `earned3()` uses the factor's low on the low side and its high on the high side. Money flowing back uses the same factors (weapons `fw`, other spending `fo`, extra sales to Ukraine `ux`); for US weapons that is about 3.6% of the money ([overview](https://warbalance.org/#view=how&sec=m-overview-the-net-gain-rule)).
- **Current euros.** Each year's change in volume is multiplied by that year's price level, so trade parts are in the same euros as aid ([overview](https://warbalance.org/#view=how&sec=m-overview-the-core-idea-in-four-steps)). The flat 20% margin with a 0.5–1.5× band is only a fallback for a country without `vk`; every country in the current data has `vk`. <span class="incode">In the code: `cur`</span>
- **Parts with no pre-war comparison** (aid, refugees, windfall, weapons, hidden channels) sum their yearly triples. <span class="incode">In the code: `sum3()`</span>

## From parts to a total

`total(parts)` in `calc()` adds middle values and combines the parts' distances to their low and high ends as errors in quadrature (square root of the sum of squares), with correlations where errors are shared. Where the counterfactual's back-tests show the expected levels of two flows missing together, the correlation is measured (the median Spearman correlation of the back-test errors over the 2008, 2013 and 2016 tests, medium and large flows). Parts that share inputs get correlations as judgements: <span class="incode">In the code: `RHO` in `site/index.html`</span>

| parts | correlation |
|---|---|
| services bought from and sold to Russia | 0.40 |
| paid to Russia (goods) and services bought | 0.25 |
| sales to Russia and services bought / sold | 0.20 |
| paid to Russia and services sold | 0.15 |
| own aid and the share of EU-level aid (the EU share takes the aid's relative range by construction) | 1 |
| own aid and own aid spent at home (more aid, more flowback: the two errors offset in the total) | −0.5 |
| parts weighted by Russia's net-gain shares: paid, laundered oil, gold and hidden payments, weapons bought from Russia | 0.5 |
| flowback parts weighted by the same weapons gain: own aid spent at home, others' aid spent here, arms Ukraine bought | 0.5 |
| paid to Russia and sales to Russia (Russia-side shocks) | 0.2 |
| all other pairs | 0 |

**Signs.** The correlations are between the sizes of two parts (a common input such as Russia's gain share makes both larger). Where two parts have opposite signs (paid > 0 and laundered oil < 0 for the US, France, Australia, Romania and China), that moves the total in opposite directions, so `total()` multiplies the correlation by the product of the parts' signs.

The effect is small. In the current build Germany's net range is +2.38%<!-- n:DEU.netLo --> to +4.84%<!-- n:DEU.netHi -->. The country panel shows each part's range in its bar (solid to the low end, fading to the high end) and the total's range under the headline number ("likely ... to ...").

Rankings use these totals. A number's direction is **certain** only if **neither its likely range nor any method-band alternative changes its sign**. A number that is not certain **leans** toward Ukraine or Russia when the chance of its middle value's sign is at least 65%, worked out (round 39) by simulating its parts: each part a two-piece normal whose mode is its middle value and whose 5th and 95th percentiles are its range's ends, correlated as in `RHO` through a Gaussian copula, 4,000 draws from a fixed seed (`pSignMC()`); below that its direction is **uncertain**. A number that is not certain but whose likely range and method band both stay within ±0.5% of a year's GDP is **near zero** (`isNearZero()`). All stay in the ranking, each group under its own heading, in a faded colour on the map, and marked in the panel and the CSV and JSON downloads. Economies under EUR 5bn GDP are left out. `check_data.py` recomputes the rule independently. The share of method-band alternatives that agree is shown in the panel's explanation but does not decide the label. Among the 163<!-- n:WORLD.nBig --> economies above EUR 5bn, 95<!-- n:WORLD.uncUa --> are not certain on support for Ukraine (nearly all with almost no support), 119<!-- n:WORLD.uncRus --> on Russia's earnings from trade and 110<!-- n:WORLD.uncNet --> on the net, of which 66<!-- n:WORLD.leanNet --> lean one way; the map's ⓘ counts them live. Belarus and North Korea, parties to the war, are listed under the ranking, not ranked. <span class="incode">In the code: `uncertain()` in `site/index.html`; `rankList()`, `MIN_GDP_RANK`</span>

## The method band

The likely range is **data and model uncertainty, given the method**. Method choices move some countries by more than that range, so the panel also shows a **method band**: each of the three headline numbers under each alternative method choice, one at a time (`methodBands()` in `site/index.html`):

| alternative | how it is computed | what it shows |
|---|---|---|
| war-time windfall at 100% | `calc(c, y, {windfall: "full"})`, `windfall.alt` | Russia's gain on the extra price |
| loans at the war-time yield | `calc(c, y, {loans: "war"})` | the loan discount rate |
| EU refiners keep the Russian crude in their fuel exports | data rebuilt with `refiner` (`METHOD_ALTERNATIVES` in `build_data.py`) | EU refiner treatment |
| laundered oil without the route rule (buyers without a measured series) | rebuilt with `laund_route` | the laundered-oil rule |
| laundered oil: half of Russia's gain charged to the fuel buyer (round 39, replaces "not counted") | rebuilt with `laund_half` | who bears a redirected barrel |
| laundered oil modelled from refiners' exports and hub resale (round 38 method) for the 21 measured buyers | rebuilt with `laund_model` | the laundered-oil data |
| the mix of what was bought from tracker tonnes | rebuilt with `fuelmix` | the fuel-mix basis |
| fuel prices as customs (CIF) values, freight included | rebuilt with `freight` | the freight basis |
| sellers' normal return 9% nominal, services with real estate | rebuilt with `normal_return` (`net_gain_sellers_r13.json`) | the normal return |
| **redirected trade**: what buyers who bought more took up is Russian supply redirected from buyers who cut (r = the smaller of the two world totals); it is counted once, half against each side: "less paid" × (less − r/2)/less = 0.70<!-- n:WORLD.ratio -->, "more paid" × (more − r/2)/more = 0.50, so the two still add up to the world's net change (2022–August 2026, at Russia's net gain: EUR 351.9bn<!-- n:WORLD.less --> from buyers who cut, 215.4bn<!-- n:WORLD.more --> from buyers who bought more) | `calc(c, y, {attrib: {less, more}})`, `worldPaid(y).ratio`, `.ratioMore` | much of what one buyer stopped paying, Russia sold to others; every country's figure otherwise assumes everyone else stayed unchanged |
| **without the gas Russia cut off itself** | `calc(c, y, {nocut: true})`: "less paid to Russia" without its cut share (`sanctions.to_rus.cut`) | the labelled cut taken out of the number |
| **without the war-time windfall** | `calc(c, y, {windfall: "off"})` | the windfall counts at gain 1 on prices, not volumes (Hungary raised Russia's earnings from trade by 0.92%<!-- n:HUN.alt_windfall_off.rus abs --> of GDP instead of 6.14%<!-- n:HUN.rus abs -->) |
| **refugees at gross cost** | `calc(c, y, {refGross: true})`, `aid.refugee_gross_years` | the host's spending before its gain on refugees' work is taken off |
| **refugees at one common cost** | `calc(c, y, {refCommon: true})`, `aid.refugee_common_years`: each host's person-years × the hosts' average net cost per person-year | each host's actual cost against a common value per refugee ([refugees](https://warbalance.org/#view=how&sec=m-aid-refugees-military-refugees)) |
| **2026 at 2025 prices** | `calc(c, y, {p26: true})`: 2026's purchases from Russia, laundered oil and windfall valued at 2025's fuel prices (`to_rus.p26`, `laund.p26`) | the Hormuz-crisis prices of 2026 ([prices](https://warbalance.org/#view=how&sec=m-prices-2026-and-the-hormuz-crisis)) |
| **gold at its actual price** | rebuilt with `gold_actual`: the change in the volume of gold valued at each year's gold price instead of the 2021 price held flat (`deflate_gold()`) | central banks' gold buying after Russia's reserves were frozen is widely linked to the war, so part of the gold price rise may be the war's ([prices](https://warbalance.org/#view=how&sec=m-prices-gold-at-its-no-war-price)) |
| **North Korea paid only what was observed** | rebuilt with `nk_paid_observed`: the paid share of North Korea's deliveries 5-13% (USD 0.5-1.5bn observed flowing back, over a full value of about EUR 10bn; `north_korea_r24.json`) | how much of North Korea's deliveries Russia paid for ([military support to Russia](https://warbalance.org/#view=how&flow=mil)) |
| **no-war gas at early-2021 forward prices** | rebuilt with `gas_early2021`: TTF EUR 17.5/MWh for 2022-2025 in `nw()` (Cal-22 traded at EUR 16.7-18.1 in January-March 2021; `windfall_band_r24.json`) | the view that the late-2021 squeeze was war preparation ([war-time fuel prices](https://warbalance.org/#view=how&flow=windfall)) |
| **2024 GDP** | the number × average 2022–2024 GDP / 2024 GDP | the denominator (the default is the average of 2022–2024) |

The rebuilt alternatives store, per country, only the fields they change (`detail.json` `alts`; loaded with the data, before anything is drawn, and checked in a real browser by `pipeline/browser_check.mjs`); the site applies them to a copy of the country and recomputes. The band is the lowest and highest of the base and all alternatives; the panel lists the choices that move the net by at least 0.005% of GDP. It is not a probability range. Examples (the net): Germany 2.92%<!-- n:DEU.netBandLo --> to 3.84%<!-- n:DEU.netBandHi --> (redirected trade at the low end), Moldova 4.05%<!-- n:MDA.netBandLo --> to 9.90%<!-- n:MDA.netBandHi --> (redirected trade; without the windfall), Hungary −7.70%<!-- n:HUN.netBandLo --> to −0.50%<!-- n:HUN.netBandHi --> (without the windfall), North Korea −31.86%<!-- n:PRK.netBandLo --> to −11.21%<!-- n:PRK.netBandHi --> (the low end is the alternative in which Russia paid only what was observed flowing back to Pyongyang, so nearly all deliveries count at full value), Yemen −5.62%<!-- n:YEM.netBandLo --> to −2.63%<!-- n:YEM.netBandHi -->.

## Average year

The headline is a total for 2022 to the chosen year against one year's GDP (the average of 2022–2024). The panel adds "about X of GDP in an average year": the total divided by the number of years (4.7 for 2022 to August 2026). Each of the two numbers shows its average year in the panel, and the share text, share-card titles and OG descriptions say "in total since 2022 (about X a year)", so they are not read as yearly figures like Kiel's.

## 2026 and the * mark

2026 counts January to August. Where no 2026 figures exist yet, the research files estimate them from the 2025 monthly rate, and the part's label carries a `*`. In `data.json` this is the `est26` flag: <span class="incode">In the code: `FRAC[5] = 8/12`, `DATA_TO = 2026-08-31`</span>

- `company` (company taxes; 2026 estimated from 2025 and the first 2026 company reports);
- `from_rus` where the residual gap is added (its 2026 is estimated from 2025);
- `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` where the 2026 trade value itself is an estimate (`basis = estimated` in [`trade_full.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/trade_full.json), for example Belarus and Uzbekistan).

The site marks the parts "paid to Russia", "sold to Russia" and "company taxes" (`est` map in `part()`). Every period label reads "2026 year to date".

## What the ranges do not cover

- **Russia-side shocks.** The counterfactual intervals cover about 90% of outcomes in normal periods but only 77–79% in the 2013 back-test, when Russia's own economy moved ([counterfactual.md](https://warbalance.org/#view=how&sec=m-counterfactual-7-how-the-predictions-error-enters-the-ranges)).
- **The method itself**: what counts as a shift, the valuation rule, the choice of GDP year (the average of 2022–2024; 2024 is in the method band), counting gas where it is burned. These are choices, not uncertainties ([decisions](https://warbalance.org/#view=how&sec=changelog)); the method band shows the main ones, one at a time (not combined).
- **Other correlated errors across parts.** Only the correlations listed above are included; a shared source error (one KSE report behind all company taxes) is still treated as independent.
- **Correlated errors across countries.** Moving value between countries (re-exports, hub resale, the residual gap) shifts error from one country to another; each country's range is computed alone.
- **Unknown unknowns**: flows nobody has measured are not on the map. Crypto and payment agents appear only as the agents' fees; the trade they settle is already in customs ([trade.md](https://warbalance.org/#view=how&sec=m-trade-payment-agents)).
- **Inputs touched by the war** in the counterfactual (realised trade and GDP in 2022–2026).
