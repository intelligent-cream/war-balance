# Ranges and certainty letters

Every number on the map has a middle value and a **likely range**; each part also has a **certainty letter** from A (reported) to D (rough indication), and each headline number the **chance of its direction**. The likely range covers the uncertainty of the data and models given the method; it aims at about 90% and has been **tested** (below: "How often the ranges are right"). How much the method choices themselves move a number is the separate **method band**.

Details for developers: [how each range is computed, term by term](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/ranges.md).

## Certainty letters

| letter | meaning | default range when the data give none |
|---|---|---|
| A | reported (official statistics, Kiel allocations) | ±5% |
| B | measured estimate (mirror data, documented figures) | ±15% |
| C | modelled estimate | ±35% |
| D | rough indication | ±70% |

A part's letter is also **capped by its sources** (round 42). Only the sources that measure the part count (not the method's own inputs such as price indices, the no-war models or the gain shares), and one statistical source used under several names counts once:

| a part can be at most | when its sources include |
|---|---|
| A | two official statistics or more |
| B | one official statistic, or two research or official reports |
| C | one research or official report |
| D | only press reports or this project's own estimates |

A part resting on press reports alone is marked **press only** in the panel; on this project's own estimates alone, **own estimate**. A trade part built on a modelled no-war level and a modelled gain share stacks two models, so it is at best C. Gold and hidden payments are always D; oil via other countries always C.

## How likely the direction is

The headline numbers (support for Ukraine, Russia's earnings from trade, the net) carry no letter. They say **how likely their direction is**: every part's likely range is simulated together, each as a skewed range, correlated where parts share inputs, and the share of outcomes on each side of zero is the chance.

| on the site | rule |
|---|---|
| very likely (certain) | at least a 95% chance of one direction, and every other method choice agrees |
| likely (leaning) | at least a 65% chance |
| near zero | not certain, and the likely range and method band stay within ±0.5% of a year's GDP |
| unclear | the rest |

The chance is of the more likely direction, which is usually that of the middle value. Where a middle value just above zero sits in a range that reaches mostly below it, the number leans the other way and says so, with its middle value. Each panel also says **what decides it**: the smallest change to one part that would flip the direction, for example "if Russia kept less from fuel and goods sold here were 1% smaller".

## Where a part's range comes from

- **Sources that disagree**: a country's own customs report against its partner's report on the same trade.
- **Model ranges**: simulations or tested error bands (China's military support, the no-war prediction).
- **Other reasonable assumptions**: resale shares, margins, refugee cost per person.

## How a traded flow's range is combined

A traded flow has four main sources of uncertainty: the pre-war level, the actual values, the price level and the no-war prediction (plus the no-war fuel price and the gain share). Each is moved to its low and high end alone, and the effects are combined as independent errors (square root of the sum of squares), with the pre-war level and the actual values treated as partly correlated (they come from the same customs offices). This avoids stacking every worst case at once, which would make ranges too wide.

## From parts to a total

Parts' ranges are combined the same way, with correlations where errors are shared (for example, all parts weighted by Russia's gain shares move together). The effect is small: Germany's net range is +2.58%<!-- n:DEU.netLo --> to +5.05%<!-- n:DEU.netHi -->.

A number's direction is **certain** when the simulation gives it at least a 95% chance and no method-band alternative has the other sign (round 42; before, the likely range had to stay on one side). Otherwise it **leans** toward Ukraine or Russia when one direction has at least a 65% chance, and is **uncertain** below that. When its likely range and its method band both stay within ±0.5% of a year's GDP it is **near zero**: the war moved little money either way. All stay in the ranking, in their own groups, and the country's panel says in one line why its number is not certain. Among the 163<!-- n:WORLD.nBig --> economies above EUR 5bn, 84<!-- n:WORLD.uncUa --> are not certain on support for Ukraine, 112<!-- n:WORLD.uncRus --> on Russia's earnings from trade and 102<!-- n:WORLD.uncNet --> on the net, of which 56<!-- n:WORLD.leanNet --> lean one way and 29<!-- n:WORLD.nearNet --> are near zero.

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

## How often the ranges are right

The ranges were tested by rerunning the method as if the war had started in **2018**, when the true effect is zero. For trade with Russia, which makes most of the width of the ranges, the range contained zero for **97%** of the 150 ranked economies. Moved to **2014**, when Russia's own economy was hit by the oil and rouble crash, it was **92%**. So the ranges cover about 90% or a little more. The weak spot: sales to Russia by countries that sell it little are covered less often (about 78%). The test reruns trade only (aid, refugees and the other parts did not exist before 2022), with IMF trade totals instead of the full customs build, and the bands were measured partly on these years, so it checks the whole chain rather than proving the bands out of sample. Details: `research/2026-10/gaps/placebo_r42-notes.md`; `pipeline/placebo.py` reruns it, and a test fails if the 2018 coverage drops below 80%.

## What the ranges do not cover

- **Russia-side shocks**: the no-war prediction's own bands covered only 77–79% when Russia's own economy moved ([counterfactual](#view=how&sec=m-counterfactual-7-how-the-predictions-error-enters-the-ranges)); with the other uncertainties added, trade ranges still held zero for 92% in the 2014 test, but 2022–2026 is a larger shock.
- **The method itself**: what counts, the valuation rule, the GDP year. The method band shows the main choices one at a time, not combined.
- **Errors shared across parts or countries** beyond the correlations included (one report behind all company taxes; value moved between countries by re-export rules).
- **Flows nobody has measured.**
