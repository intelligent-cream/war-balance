# The "above or below expectation" layer (AI guesses)

> **Removed from the map** (October 2026). The view was AI guesses, not data. This page and `incentives.json` are kept for the record. Since the round-11 audit the scores are no longer copied into `site/data.json`, and the fitting code (`fitExpectation()`) is gone from `site/views2.js`.

The map has one view that is **not built from data**: "Who went out of their way" compares what each country actually shifted with what two AI-guessed incentive scores would predict. It exists as a conversation starter: a small, far-away country that did a lot stands out against a large, threatened neighbour that did little. This page explains how the guesses were made, how the expected shift is fitted, and why the view must not be read as a finding. Nothing in this layer changes any number elsewhere on the map.

## What the scores are

File: [`research/2026-10/gaps/incentives.json`](../../research/2026-10/gaps/incentives.json) (label: "AI guesses, no real data"; there is no notes file). For each economy an AI model wrote down, **without searching for data**, two numbers:

| score | scale | meaning | anchors |
|---|---|---|---|
| `direction` | 0–10 | how far the country's political direction (values, alliances, governing model, foreign policy, 2022–2026) is from Russia's; how badly a Russian win would hurt what the country is trying to be | Belarus, North Korea ≈ 0–1; India 4; Germany, USA 8; Poland 9; Estonia 10 |
| `threat` | 0–100 | perceived likelihood, from the country's own point of view, that Russia attacks, invades or seriously coerces it within about ten years | China 2, India 5, USA 15, Germany 30, Poland 70, Estonia 85 |

Each entry also has `confidence` (low / medium / high, the model's own sense), `why` (a one-line reason) and an optional `capacity_note` (something that specially limits or enables support, such as "Taliban government under sanctions"). Territories are scored like the country they follow; Ukraine, Russia and uninhabited territories are left out. The pipeline copies these fields into `data.json` as `incentive` (end of [build_data.py `build()`](../../pipeline/build_data.py)).

The scores are **not measured, sourced or reviewed**. They are an informed impression, kept consistent through the fixed anchor countries.

## How the expected shift is fitted

Code: `fitExpectation()` and `renderExpect()` in [`site/views2.js`](../../site/views2.js).

1. Take every economy with a score and GDP of at least EUR 20bn (`EXPECT_MIN_GDP`; small economies have noisy trade data that would dominate a ranking of differences).
2. Its actual shift is the map's net shift for the chosen period as % of a year's GDP, clipped at ±30% so a few extremes do not set the line.
3. Fit by least squares: `expected = a + b × direction + g × threat`.
4. The difference `actual − expected` (in percentage points of GDP) ranks countries. The view shows up to 15 that did most above the line ("did more than their incentives predict") and up to 15 most below ("did less than predicted, or helped Russia"), among the countries in the selected group filter (all, EU, G7, NATO, BRICS, former Soviet Union; `eligible()` in [`views.js`](../../site/views.js)). The line itself is always fitted on all scored economies of at least EUR 20bn GDP, whatever the filter.

The fitted coefficients are printed on the page, so a reader can see how much each score matters for the chosen year.

## Caveats

- **The inputs are guesses.** A different model, or the same model on another day, could score a country differently; the confidence field is the model's own, not a statistical measure.
- **Two scores leave out most of what drives support**: wealth, fiscal space, distance, energy dependence, domestic politics, existing trade ties with Russia.
- **The actual shift has its own uncertainty** ([ranges.md](ranges.md)), which the fit ignores.
- **Linear in both scores**: threat may matter only above some level; direction and threat are correlated.
- **Circularity risk**: an AI asked about "direction away from Russia" in 2022–2026 may partly encode what countries did, which is the thing being explained.

Read the view as a prompt for questions ("why did this country do more than predicted?"), not as a verdict.

## See also

- [overview.md](overview.md#the-other-lenses): the other lenses on the map
- [limitations.md](../limitations.md)
- [Documentation index](../README.md)
