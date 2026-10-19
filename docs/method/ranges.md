# Ranges and certainty letters

Every number on the map has a middle value, a likely range (meant as about 90%) and a certainty letter from A (reported) to D (rough indication). This page explains where each part's range comes from, how the site combines four sources of uncertainty for every traded flow without stacking worst cases, how parts add up to a total, how 2026 estimates are marked, and, just as important, what the ranges do not cover.

## Certainty letters

| letter | meaning | default range when the data give none |
|---|---|---|
| A | reported (official statistics, Kiel allocations) | ±5% |
| B | measured estimate (mirror data, documented figures) | ±15% |
| C | modelled estimate | ±35% |
| D | rough indication | ±70% |

Defaults are `RANGE` in [`site/index.html`](../../site/index.html); they are applied in `part()` only when a part's own low and high coincide. The four widths (±5%, ±15%, ±35%, ±70%) are a judgement, not a measured error ([decisions](../decisions.md#constants-and-rules-written-down-in-round-11)). Each research file assigns letters per value ([`gaps.md`](../../research/2026-10/gaps.md) shows per country which parts are reported or estimated). A total takes the **weakest** letter of its parts (`weakest()`). Trade parts compared with a pre-war level are at best B, because the comparison itself assumes a no-war path (`cRus`, `cTrade` in `calc()`).

**Letters fixed in `calc()`.** Three parts do not take their letter from the data:

- **Gold and hidden payments** are always D. The data gives the UAE's hidden gold C, but every hidden channel rests on rough estimates of what customs miss, so the site keeps the lowest letter for all of them.
- **Russian oil bought via other countries** is always C. It is modelled for every buyer (the refiner's crude share, hub resale shares), so no buyer's figure is better than a modelled estimate.
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
- **Income parts** (sales and services to Russia) are multiplied by the money rule's factor, value kept × genuinely extra (`c.vk` in `data.json`, from [`value_kept.json`](../../research/2026-10/gaps/value_kept.json)): `earned3()` uses the factor's low on the low side and its high on the high side. Money flowing back uses the same factors (weapons `fw`, other spending `fo`, extra sales to Ukraine `ux`) ([overview](overview.md#the-money-rule-round-6)). The flat 20% margin with a 0.5–1.5× band is only a fallback for a country without `vk`; every country in the current data has `vk`.
- **Parts with no pre-war comparison** (aid, refugees, windfall, weapons, hidden channels) sum their yearly triples (`sum3()`).

## From parts to a total

`total(parts)` in `calc()` adds middle values and combines the parts' distances to their low and high ends as errors in quadrature (square root of the sum of squares), with one exception: where the counterfactual's back-tests show the expected levels of two flows missing together, their errors are correlated (`RHO` in `site/index.html`, the median Spearman correlation of the back-test errors over the 2008, 2013 and 2016 tests, medium and large flows):

| parts | correlation |
|---|---|
| services bought from and sold to Russia | 0.40 |
| paid to Russia (goods) and services bought | 0.25 |
| sales to Russia and services bought / sold | 0.20 |
| paid to Russia and services sold | 0.15 |
| all other pairs (e.g. goods bought vs sold: about 0) | 0 |

The effect is small. In the current build Germany's range is +2.55% to +5.23% with these correlations and +2.57% to +5.20% without them. The country panel shows each part's range as a thin line in the waterfall and the total's range in the headline ("Likely range ... to ...").

Rankings use these totals: countries whose likely range crosses zero are left out of top lists, as are economies under EUR 5bn GDP (`rankList()`, `MIN_GDP_RANK`).

## 2026 and the * mark

2026 counts January to August (`FRAC[5] = 8/12`, `DATA_TO = 2026-08-31`). Where no 2026 figures exist yet, the research files estimate them from the 2025 monthly rate, and the part's label carries a `*`. In `data.json` this is the `est26` flag:

- `company` (company taxes; 2026 estimated from 2025 and the first 2026 company reports);
- `from_rus` where the residual gap is added (its 2026 is estimated from 2025);
- `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` where the 2026 trade value itself is an estimate (`basis = estimated` in [`trade_full.json`](../../research/2026-10/gaps/trade_full.json), for example Belarus and Uzbekistan).

The site marks the parts "paid to Russia", "sold to Russia" and "company taxes" (`est` map in `part()`). Every period label reads "2026 year to date".

## What the ranges do not cover

- **Russia-side shocks.** The counterfactual intervals cover about 90% of outcomes in normal periods but only 77–79% in the 2013 back-test, when Russia's own economy moved ([counterfactual.md](counterfactual.md#7-how-the-predictions-error-enters-the-ranges)).
- **The method itself**: what counts as a shift, the money rule's factors, the net-gain rule, the choice of 2024 GDP, counting gas where it is burned. These are choices, not uncertainties ([decisions](../decisions.md)).
- **Other correlated errors across parts.** Only the measured counterfactual correlations are included; a shared source error (one KSE report behind all company taxes) is still treated as independent.
- **Correlated errors across countries.** Moving value between countries (re-exports, hub resale, the residual gap) shifts error from one country to another; each country's range is computed alone.
- **Unknown unknowns**: flows nobody has measured are not on the map. Crypto and payment agents appear only as the agents' fees; the trade they settle is already in customs ([trade.md](trade.md#payment-agents-round-6)).
- **Inputs touched by the war** in the counterfactual (realised trade and GDP in 2022–2026).

## See also

- [counterfactual.md](counterfactual.md): the `bmul` intervals
- [prices.md](prices.md): the `pidx` bands
- [overview.md](overview.md): the parts these ranges belong to
- [limitations.md](../limitations.md)
- [Documentation index](../README.md)
