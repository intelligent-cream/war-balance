# Ranges and certainty letters

Every number on the map has a middle value, a **likely range** and a **certainty letter** from A (reported) to D (rough indication). The likely range covers the uncertainty of the data and models given the method; it is set by judgement to about 90%, not measured. How much the method choices themselves move a number is the separate **method band**.

Details for developers: [how each range is computed, term by term](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/ranges.md).

## Certainty letters

| letter | meaning | default range when the data give none |
|---|---|---|
| A | reported (official statistics, Kiel allocations) | ±5% |
| B | measured estimate (mirror data, documented figures) | ±15% |
| C | modelled estimate | ±35% |
| D | rough indication | ±70% |

Each headline number's letter weighs two things: **how much of it rests on primary data** (parts graded A or B) or on rough indications (D), and **how wide** its range and method band are against its size.

| letter | A–B share at least | D share at most | spread at most |
|---|---|---|---|
| A | 75% | 5% | 0.5 × the value |
| B | 50% | 15% | 1 × the value |
| C | – | 35% | 2.5 × the value |
| D | otherwise | | |

The thresholds are a judgement, chosen so that the letters separate countries. A trade part built on a modelled no-war level and a modelled gain share stacks two models, so it is at best C; Russia's earnings from trade is therefore at best C. Most D letters belong to numbers close to zero, whose range is wide against their size. Examples: Germany C, C, C; France B, C, C; Hungary D, C, C (support, trade, net). Gold and hidden payments are always D; oil via other countries always C.

## Where a part's range comes from

- **Sources that disagree**: a country's own customs report against its partner's report on the same trade.
- **Model ranges**: simulations or tested error bands (China's military support, the no-war prediction).
- **Other reasonable assumptions**: resale shares, margins, refugee cost per person.

## How a traded flow's range is combined

A traded flow has four main sources of uncertainty: the pre-war level, the actual values, the price level and the no-war prediction (plus the no-war fuel price and the gain share). Each is moved to its low and high end alone, and the effects are combined as independent errors (square root of the sum of squares), with the pre-war level and the actual values treated as partly correlated (they come from the same customs offices). This avoids stacking every worst case at once, which would make ranges too wide.

## From parts to a total

Parts' ranges are combined the same way, with correlations where errors are shared (for example, all parts weighted by Russia's gain shares move together). The effect is small: Germany's net range is +2.58%<!-- n:DEU.netLo --> to +5.05%<!-- n:DEU.netHi -->.

A number's direction is **certain** only if neither its likely range nor any method-band alternative changes its sign. Otherwise it **leans** toward Ukraine or Russia when its direction has at least a 65% chance, worked out by simulating its parts (each a skewed range, correlated where they share inputs), and is **uncertain** below that. When its likely range and its method band both stay within ±0.5% of a year's GDP it is **near zero**: the war moved little money either way. All stay in the ranking, in their own groups, and the country's panel says in one line why its number is not certain. Among the 163<!-- n:WORLD.nBig --> economies above EUR 5bn, 96<!-- n:WORLD.uncUa --> are not certain on support for Ukraine, 114<!-- n:WORLD.uncRus --> on Russia's earnings from trade and 107<!-- n:WORLD.uncNet --> on the net, of which 62<!-- n:WORLD.leanNet --> lean one way and 35<!-- n:WORLD.nearNet --> are near zero.

## The method band

The likely range is uncertainty **given the method**. The method band shows each headline number under other reasonable choices, one at a time:

- the war-time windfall in full, or left out (Hungary raised Russia's earnings from trade by 1.35%<!-- n:HUN.alt_windfall_off.rus abs --> of GDP without it, instead of 6.57%<!-- n:HUN.rus abs -->);
- loans at the war-time yield;
- EU refiners keep the Russian crude in their fuel exports; laundered oil with a looser rule, or not counted;
- the fuel mix from tanker tonnes; fuel prices with freight; a higher normal return;
- **redirected trade**: much of what one buyer stopped paying, Russia sold to others ("less paid" × 0.70<!-- n:WORLD.ratio -->);
- without the gas Russia cut off itself;
- refugees at gross cost, or at one common cost per refugee;
- 2026 at 2025 prices; gold at its actual price; no-war gas at early-2021 prices;
- North Korea paid only what was observed flowing back;
- 2024 GDP instead of the 2022–2024 average.

The band is the lowest and highest of these; it is not a probability range. Examples (the net): Germany 3.13%<!-- n:DEU.netBandLo --> to 4.05%<!-- n:DEU.netBandHi -->, Moldova 3.96%<!-- n:MDA.netBandLo --> to 9.76%<!-- n:MDA.netBandHi -->, Hungary −8.09%<!-- n:HUN.netBandLo --> to −0.89%<!-- n:HUN.netBandHi -->, North Korea −31.86%<!-- n:PRK.netBandLo --> to −11.21%<!-- n:PRK.netBandHi -->.

## Average year

The headline is a total for 2022 to the chosen year against one year's GDP. The panel adds "about X in an average year": the total divided by 4.7 years for 2022 to August 2026.

## 2026 and the * mark

2026 counts January to August. Where no 2026 figures exist yet, they are estimated from the 2025 monthly rate and the part's label carries a `*` (company taxes, and trade where the 2026 value is an estimate, for example Belarus and Uzbekistan).

## What the ranges do not cover

- **Russia-side shocks**: the no-war prediction's bands covered only 77–79% when Russia's own economy moved ([counterfactual](#view=how&sec=m-counterfactual-7-how-the-predictions-error-enters-the-ranges)).
- **The method itself**: what counts, the valuation rule, the GDP year. The method band shows the main choices one at a time, not combined.
- **Errors shared across parts or countries** beyond the correlations included (one report behind all company taxes; value moved between countries by re-export rules).
- **Flows nobody has measured.**
