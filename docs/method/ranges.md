# Ranges and certainty letters

Every number on the map has a middle value, a likely range and a certainty letter from A (reported) to D (rough indication). The likely range covers the uncertainty of the data and the models **given the method**; it is calibrated by judgement to about 90% (it mixes measured back-test bands with default widths per letter, combined as errors), not measured. How much the method choices move a result is the separate [method band](#the-method-band-round-13-widened-in-round-14). This page explains where each part's range comes from, how the site combines four sources of uncertainty for every traded flow without stacking worst cases, how parts add up to a total, how 2026 estimates are marked, and, just as important, what the ranges do not cover.

## Certainty letters

| letter | meaning | default range when the data give none |
|---|---|---|
| A | reported (official statistics, Kiel allocations) | ±5% |
| B | measured estimate (mirror data, documented figures) | ±15% |
| C | modelled estimate | ±35% |
| D | rough indication | ±70% |

Defaults are `RANGE` in [`site/index.html`](../../site/index.html); they are applied in `part()` only when a part's own low and high coincide. The four widths (±5%, ±15%, ±35%, ±70%) are a judgement, not a measured error ([decisions](../decisions.md#constants-and-rules-written-down-in-round-11)). Each research file assigns letters per value ([`gaps.md`](../../research/2026-10/gaps.md) shows per country which parts are reported or estimated).

**A total's letter (round 14, audit H4).** Until round 13 a total took the **weakest** letter of its parts, which made every total D or C and no longer separated Lithuania from Yemen. Since round 14 it says how much of the total rests on primary data (`gradeTotal()` in `site/index.html`), weighting each part by its absolute value:

| total | rule |
|---|---|
| A | at least 80% of it in parts graded A |
| B | at least half in parts graded A or B (primary data) |
| C | at least 75% in parts graded A to C |
| D | otherwise: more than a quarter rests on rough indications (D) |

In the round-14b build: 1 economy A, 6 B, 205 C, 19 D; among economies above EUR 5bn GDP 6 B, 149 C and 7 D. The letters no longer separated countries (review 4, H3), so round 15 replaced the rule for the headline numbers (below). `gradeTotal()` is kept for the cost view.

**Each headline number's letter (round 15, review 4 H3, approved by the owner).** Support for Ukraine, the change in payments to Russia and the net each get a letter from two things (`grade()` and `grades()` in `site/index.html`):

- **data**: the share of the number's absolute size (parts weighted by their absolute values) that rests on parts graded A or B (primary data), and the share on parts graded D (judgement); C parts (modelled from data) are the rest;
- **spread**: the width of the likely range and the method band together, from the lowest to the highest end, divided by the number's absolute value.

| letter | A–B share at least | D share at most | spread at most |
|---|---|---|---|
| A | 75% | 5% | 0.5 × the value |
| B | 50% | 15% | 1 × the value |
| C | – | 35% | 2.5 × the value |
| D | otherwise | | |

The thresholds are a judgement, chosen so that the letters separate countries. Trade parts built on the modelled no-war level are C by rule (below), so the change in payments to Russia is at best C. Distribution in the round-15 build (all 231 entries; economies above EUR 5bn GDP; those ranked):

| number | all | GDP ≥ EUR 5bn | ranked (direction certain) |
|---|---|---|---|
| support for Ukraine | 3 A, 19 B, 19 C, 190 D | 2 A, 19 B, 14 C, 128 D | 2 A, 19 B, 13 C, 29 D |
| change in payments to Russia | 64 C, 167 D | 55 C, 108 D | 45 C, 8 D |
| net | 1 A, 6 B, 59 C, 165 D | 6 B, 51 C, 106 D | 6 B, 42 C, 11 D |
| before (round 14b, the net) | 1 A, 6 B, 205 C, 19 D | 6 B, 149 C, 7 D | |

Most D letters belong to numbers close to zero, whose range is wide against their size (a country with almost no support for Ukraine, or almost no change in what it pays Russia). Examples: Germany B (support), C (payments), C (net); France A, C, C; Hungary B, C, C; North Korea D on its payments (weapons valued by judgement, a wide method band).

**Stacked models are at best C (round 13 audit).** A part built from a modelled no-war level *and* a modelled share (Russia's or Ukraine's net gain, a seller's net gain, genuinely extra, a price index) stacks two models, so it is at best C, a modelled estimate: less paid to Russia, extra purchases from Ukraine, sales to Russia, services bought and sold (`cRus`, `cTrade` and the `weakest([.., "C"])` calls in `calc()`). Until round 12 these were at best B. "Less paid to Russia" is the largest part for most top-ranked countries, so most headline letters are now C or D. Inputs quoted from memory and not fetched again are D (the 2021 fertiliser margin in `net_gain_russia-notes.md`; PhosAgro's 2022–2023 margins were fetched in round 13 and its 2023 share corrected from 0.20 to 0.27).

**Letters fixed in `calc()`.** Three parts do not take their letter from the data:

- **Gold and hidden payments** are always D. The data gives the UAE's hidden gold C, but every hidden channel rests on rough estimates of what customs miss, so the site keeps the lowest letter for all of them.
- **Russian oil bought via other countries** is always C. It is modelled for every buyer (the refiner's crude share, hub resale shares), so no buyer's figure is better than a modelled estimate.
- **Aid to Ukraine (Kiel, adjusted)** (round 16, review 5 L4): Kiel's figure is reported, but the part is adjusted by modelled factors (weapons at market value, loans as gifts). It takes Kiel's letter only where the adjustments are under 5% of it; under 25% at most B; otherwise at most C (`aidCert` in `calc()`).
- **Share of EU-level aid** is always B. The EU's own aid is reported (Kiel), but the split over members by budget share and the loans' economic value are estimates.

These are judgements; they change letters, not values ([decisions](../decisions.md#constants-and-rules-written-down-in-round-11)).

## Where a part's range comes from

Each series in `data.json` is a triple per year: `years`, `years_lo`, `years_hi`. The pipeline ([`build_data.py`](../../pipeline/build_data.py)) takes them from the research files, which build them from:

- **disagreement between sources**: a country's own customs report against its partner's mirror report ([`trade_full-notes.md`](../../research/2026-10/gaps/trade_full-notes.md): half the mirror gap, 3–25%, for reported values; 10–60% for mirror values);
- **Monte Carlo or percentile ranges** of a model (China's military support, the residual gap, gap-filled trade);
- **alternative assumptions** (resale shares, margins, own-industry shares, refugee cost per person).

Flows compared with a pre-war level carry three more triples: `base` with `base_range`, `pidx` with `pidx_lo`/`pidx_hi` ([prices.md](prices.md)), and `bmul` with `bmul_lo`/`bmul_hi` ([counterfactual.md](counterfactual.md)). `triple()` widens `base_range` to include 2021 alone at pre-war prices (`l[0]/ph[0]`, `h[0]/pl[0]`) and the middle base.

## Quadrature for traded flows: `spread()`

Inside `calc()`, `spread(t, ex, act)` computes the change against the expected level for one flow, summed over 2022 up to the chosen year, and its range. For each of four sources of uncertainty it sums, over the years, how far the total moves when only that input goes to its low or high end:

| term | input moved | low side | high side |
|---|---|---|---|
| `bl`, `bh` | pre-war level `base_range` | `e − ex(base_lo)` | `ex(base_hi) − e` |
| `al`, `ah` | actual values `years_hi` / `years_lo` | `act(high) − a` | `a − act(low)` |
| `pl`, `ph` | price level `pidx_lo` / `pidx_hi` | `act(p_lo) − a` | `a − act(p_hi)` |
| `ql`, `qh` | counterfactual `bmul_lo` / `bmul_hi` | `e − ex(q_lo)` | `ex(q_hi) − e` |
| `nl`, `nh` | no-war fuel price `nrl` / `nrh` (payments to Russia, round 7) | `e × (1 − nrl)` | `e × (nrh − 1)` |
| `gl`, `gh` | the seller's net-gain share, low and high (round 10, flows with `gain`) | how far the change moves at the low shares | how far it moves at the high shares |

They are then combined:

```
lo = sqrt(bl² + al² − bl·al + pl² + ql² + nl² + gl²)
hi = sqrt(bh² + ah² − bh·ah + ph² + qh² + nh² + gh²)
range = [mid − lo, mid + hi]
```

- **Baseline and actual values are correlated 0.5** (a judgement, not measured; [decisions](../decisions.md#constants-and-rules-written-down-in-round-11)), because they come from the same sources (the same customs office reports both 2021 and 2024). For a difference of two errors with correlation ρ, the variance is `σb² + σa² − 2ρ·σb·σa`; with ρ = 0.5 that is the `− bl·al` term.
- **Price, counterfactual, no-war price and net-gain terms are independent** of the others.
- **Errors are summed over the years first**, then combined: the same baseline applies every year, so its error does not average out over time.

**The expected total's own band (round 6).** For flows with a back-tested counterfactual, the trend term no longer adds
up the yearly bands. The back-tests measured the error of the *sum* over 1–5 years directly (per flow, size class and
model, calibrated so that two tests' bands cover 90% of the third), and `spread()` uses
`ql = (1 − low) × Σe` and `qh = (high − 1) × Σe`, where `Σe` is the expected total and `[low, high]` the measured band
for that number of years (`cb` in `data.json`; 2026 counted at 8 of 12 months). Because one flow's yearly errors are
strongly correlated (0.6–0.7 between years), the measured bands are about as wide as the old sum (×0.8–1.2), so most
ranges barely move. The yearly view and the "only the rise" parts keep the yearly bands. Belarus's imports from Russia
keep their own yearly band. Source: [`cf_bands.json`](../../research/2026-10/gaps/cf_bands.json)
([notes](../../research/2026-10/gaps/cf_bands-notes.md)).

Before round 4 the low end took the low baseline, the high actual value and the low price level all at once (stacked worst cases), which made ranges too wide in one way and ignored forecast error in another.

Variants:

- **"Only the rise"** parts (extra purchases from Ukraine, extra sales to Ukraine, laundered oil) use `above3()`: `spread()` on each year alone, counting only the positive part of each bound.
- **Income parts** (sales and services to Russia) are multiplied by the money rule's factor, the seller's net gain (taxes plus profit above a normal return, [`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json)) × genuinely extra (`c.vk` in `data.json`; until round 12 value kept × genuinely extra, kept as `vk_old`): `earned3()` uses the factor's low on the low side and its high on the high side. Money flowing back uses the same factors (weapons `fw`, other spending `fo`, extra sales to Ukraine `ux`); for US weapons that is about 3.6% of the money in round 14 ([overview](overview.md#the-net-gain-rule-round-10)).
- **Current euros (round 14).** Each year's change in volume is multiplied by that year's price level (`cur`), so trade parts are in the same euros as aid ([overview](overview.md#round-14-changes-to-the-rules)). The flat 20% margin with a 0.5–1.5× band is only a fallback for a country without `vk`; every country in the current data has `vk`.
- **Parts with no pre-war comparison** (aid, refugees, windfall, weapons, hidden channels) sum their yearly triples (`sum3()`).

## From parts to a total

`total(parts)` in `calc()` adds middle values and combines the parts' distances to their low and high ends as errors in quadrature (square root of the sum of squares), with correlations where errors are shared (`RHO` in `site/index.html`). Where the counterfactual's back-tests show the expected levels of two flows missing together, the correlation is measured (the median Spearman correlation of the back-test errors over the 2008, 2013 and 2016 tests, medium and large flows). Round 13 (audit) adds correlations for parts that share inputs, as judgements:

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

**Signs (round 14, audit M3).** The correlations are between the sizes of two parts (a common input such as Russia's gain share makes both larger). Where two parts have opposite signs (paid > 0 and laundered oil < 0 for the US, France, Australia, Romania and China), that moves the total in opposite directions, so `total()` multiplies the correlation by the product of the parts' signs.

The effect is small. In the current build (round 15) Germany's net range is +2.14%<!-- n:DEU.netLo --> to +4.63%<!-- n:DEU.netHi -->. The country panel shows each part's range as a thin line in the waterfall and the total's range in the headline ("Likely range ... to ...").

Rankings use these totals. Since round 15 (review 4, H3; approved by the owner) a country is ranked on a number only if **neither its likely range nor any method-band alternative changes that number's sign** (`uncertain()` in `site/index.html`); otherwise it is "direction uncertain": left out of that ranking, dotted on the map and marked in the panel, table, CSV and JSON. Economies under EUR 5bn GDP are left out too (`rankList()`, `MIN_GDP_RANK`). `check_data.py` recomputes the rule independently. Among economies above EUR 5bn, 100 are uncertain on support for Ukraine (nearly all with almost no support), 110 on the change in payments to Russia and 104 on the net; the list is in the round-15 log ([decision log](../decision-log.md#round-15-separate-maps-named-lists-and-a-stricter-ranking-19-october)).

## The method band (round 13, widened in round 14)

The likely range is **data and model uncertainty, given the method**. Method choices move some countries by more than that range, so the panel also shows a **method band**: each of the three headline numbers under each alternative method choice, one at a time (`methodBands()` in `site/index.html`; round 15 extends it from the net to all three numbers). Round 14 (audit H4) added the choices that moved results in rounds 13 and 14, and round 15 (review 4, H3, C1, M1, M4, M5) six more. Round 16 (review 5, approved by the owner) removed the superseded valuation rule (H5: the project replaced it in round 13, so it is not a reasonable alternative and no longer decides who is ranked), made redirected trade two-sided (H6) and added one common cost per refugee (H2):

| alternative | how it is computed | what it shows |
|---|---|---|
| war-time windfall at 100% | `calc(c, y, {windfall: "full"})`, `windfall.alt` | Russia's gain on the extra price |
| loans at the war-time yield | `calc(c, y, {loans: "war"})` | the loan discount rate |
| EU refiners keep the Russian crude in their fuel exports (until round 13) | data rebuilt with `refiner` (`METHOD_ALTERNATIVES` in `build_data.py`) | EU refiner treatment |
| laundered oil without the round-13b route rule | rebuilt with `laund_route` | the laundered-oil rule |
| laundered oil not counted | rebuilt with `laund_off` | the laundered-oil coverage |
| the mix of what was bought from tracker tonnes (until round 14) | rebuilt with `fuelmix` | the fuel-mix basis |
| fuel prices as customs (CIF) values, freight included (until round 14) | rebuilt with `freight` | the freight basis |
| sellers' normal return 9% nominal, services with real estate (round 13) | rebuilt with `normal_return` (`net_gain_sellers_r13.json`) | the normal return |
| **redirected trade** (round 15; both sides since round 16): what buyers who bought more took up is Russian supply redirected from buyers who cut (r = the smaller of the two world totals); it is counted once, half against each side: "less paid" × (less − r/2)/less = 0.70<!-- n:WORLD.ratio -->, "more paid" × (more − r/2)/more = 0.50, so the two still add up to the world's net change (2022–August 2026, at Russia's net gain: EUR 352.0bn<!-- n:WORLD.less --> from buyers who cut, 215.4bn<!-- n:WORLD.more --> from buyers who bought more). Round 15 scaled only the cutters, to the world net, which gave a world total of −94.7bn against the model's +132.1bn | `calc(c, y, {attrib: {less, more}})`, `worldPaid(y).ratio`, `.ratioMore` | much of what one buyer stopped paying, Russia sold to others; every country's figure otherwise assumes everyone else stayed unchanged (review 4, C1; review 5, H6) |
| **without the gas Russia cut off itself** (round 15) | `calc(c, y, {nocut: true})`: "less paid to Russia" without its cut share (`sanctions.to_rus.cut`) | the labelled cut taken out of the number |
| **without the war-time windfall** (round 15) | `calc(c, y, {windfall: "off"})` | the windfall counts at gain 1 on prices, not volumes (Hungary −0.86% instead of −6.07%) |
| **refugees at gross cost** (round 15) | `calc(c, y, {refGross: true})`, `aid.refugee_gross_years` | the host's cost before the taxes refugees pay |
| **refugees at one common cost** (round 16) | `calc(c, y, {refCommon: true})`, `aid.refugee_common_years`: each host's person-years × the hosts' average net cost per person-year | each host's actual cost against a common value per refugee ([refugees](aid-refugees-military.md#refugees)) |
| **2026 at 2025 prices** (round 15) | `calc(c, y, {p26: true})`: 2026's change in payments, laundered oil and windfall valued at 2025's fuel prices (`to_rus.p26`, `laund.p26`) | the Hormuz-crisis prices of 2026 ([prices](prices.md#2026-and-the-hormuz-crisis-round-15)) |
| **gold at its actual price** (round 16b, check 16 N5) | rebuilt with `gold_actual`: the change in the volume of gold valued at each year's gold price instead of the 2021 price held flat (`deflate_gold()`) | central banks' gold buying after Russia's reserves were frozen is widely linked to the war, so part of the gold price rise may be the war's ([prices](prices.md#gold-at-its-no-war-price-round-16)) |
| **2024 GDP** (round 15) | the number × average 2022–2024 GDP / 2024 GDP | the denominator (the default is the average since round 15) |

The rebuilt alternatives store, per country, only the fields they change (`detail.json` `alts`; since round 16 loaded with the data, before anything is drawn, and checked in a real browser by `pipeline/browser_check.mjs`); the site applies them to a copy of the country and recomputes. The band is the lowest and highest of the base and all alternatives; the panel lists the choices that move the net by at least 0.005% of GDP. It is not a probability range. Examples (round 16, the net): Germany 2.69%<!-- n:DEU.netBandLo --> to 3.62%<!-- n:DEU.netBandHi --> (redirected trade at the low end), Moldova 3.80%<!-- n:MDA.netBandLo --> to 9.05%<!-- n:MDA.netBandHi --> (redirected trade; without the windfall), Hungary −6.33%<!-- n:HUN.netBandLo --> to −0.55%<!-- n:HUN.netBandHi --> (without the windfall), North Korea −10.28%<!-- n:PRK.netBandLo --> to −10.16%<!-- n:PRK.netBandHi --> (round 15: to −29.97% under the old valuation rule, now removed), Yemen −5.62%<!-- n:YEM.netBandLo --> to −2.63%<!-- n:YEM.netBandHi -->.

## Average year

The headline is a total for 2022 to the chosen year against one year's GDP (the average of 2022–2024 since round 15). The panel adds "about X of GDP in an average year": the total divided by the number of years (4.7 for 2022 to August 2026). Since round 15 (review 4, L3) each of the two numbers shows its average year in the panel, and the share text, share-card titles and OG descriptions say "in total since 2022 (about X a year)", so they are not read as yearly figures like Kiel's.

## 2026 and the * mark

2026 counts January to August (`FRAC[5] = 8/12`, `DATA_TO = 2026-08-31`). Where no 2026 figures exist yet, the research files estimate them from the 2025 monthly rate, and the part's label carries a `*`. In `data.json` this is the `est26` flag:

- `company` (company taxes; 2026 estimated from 2025 and the first 2026 company reports);
- `from_rus` where the residual gap is added (its 2026 is estimated from 2025);
- `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` where the 2026 trade value itself is an estimate (`basis = estimated` in [`trade_full.json`](../../research/2026-10/gaps/trade_full.json), for example Belarus and Uzbekistan).

The site marks the parts "paid to Russia", "sold to Russia" and "company taxes" (`est` map in `part()`). Every period label reads "2026 year to date".

## What the ranges do not cover

- **Russia-side shocks.** The counterfactual intervals cover about 90% of outcomes in normal periods but only 77–79% in the 2013 back-test, when Russia's own economy moved ([counterfactual.md](counterfactual.md#7-how-the-predictions-error-enters-the-ranges)).
- **The method itself**: what counts as a shift, the valuation rule, the choice of GDP year (the average of 2022–2024 since round 15; 2024 is in the method band), counting gas where it is burned. These are choices, not uncertainties ([decisions](../decisions.md)); the method band shows the main ones, one at a time (not combined).
- **Other correlated errors across parts.** Only the correlations listed above are included; a shared source error (one KSE report behind all company taxes) is still treated as independent.
- **Correlated errors across countries.** Moving value between countries (re-exports, hub resale, the residual gap) shifts error from one country to another; each country's range is computed alone.
- **Unknown unknowns**: flows nobody has measured are not on the map. Crypto and payment agents appear only as the agents' fees; the trade they settle is already in customs ([trade.md](trade.md#payment-agents-round-6)).
- **Inputs touched by the war** in the counterfactual (realised trade and GDP in 2022–2026).

## See also

- [counterfactual.md](counterfactual.md): the `bmul` intervals
- [prices.md](prices.md): the `pidx` bands
- [overview.md](overview.md): the parts these ranges belong to
- [limitations.md](../limitations.md)
- [Documentation index](../README.md)
