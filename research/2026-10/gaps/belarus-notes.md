# Belarus: re-exports to Russia and a Belarus-specific counterfactual

Data file: `research/2026-10/gaps/belarus.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
Units: EUR bn, nominal, ECB yearly average USD/EUR rates (2022 1.053, 2023 1.081, 2024 1.082, 2025 1.13, 2026 1.16). Ranges are roughly 90%.

This file covers roadmap items 3 and 4:

1. **Re-exports.** Some goods made elsewhere enter Belarus and are then sold to Russia inside Belarus's own recorded exports to Russia.
2. **Counterfactual.** The generic counterfactual holds 2021 flat and uses intervals back-tested on all countries. For Belarus that gives a range of −76% to +49% of GDP. This file replaces it with intervals back-tested on Belarus's own history.

---

## Part 1. Re-exports through Belarus to Russia

### What the flow is

Belarus imports cars, machinery, electronics and other goods from China, the EU, Turkey and others, and sells some of them on to Russia. Russia and Belarus share a customs union, so there is no customs border between them.

- When a Belarusian company makes the sale, the value is inside Belarus's official exports to Russia, which the map uses (EUR 22-24bn a year).
- The map should move that value, less a trading margin, to the country where the goods came from. This is the same treatment as the other hubs in `reexports.json`.

### Data found

Belarus stopped publishing trade by partner and product in 2022, and Russia's customs did too. Belarus's exports to Russia therefore cannot be split by product after 2021. The estimate works from the supply side: what partners report shipping to Belarus. This uses UN Comtrade, HS2 for 15 partners for 2019-2025, plus HS4 detail for China, Germany, Poland, Lithuania and Turkey.

USD bn, partners' reported exports to Belarus:

| | 2019-21 average | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| China, all goods | 2.20 | 3.28 | 5.84 | 6.58 | 7.20 |
| China, cars (HS 8703) | ~0.25 | 0.33 | 1.50 | 1.87 | 1.80 |
| China, machinery and electronics (HS 84/85/90), increase | | +0.52 | +1.49 | +1.79 | +2.30 |
| Germany + Poland + Lithuania, cars (HS 8703) | ~0.32 | 1.48 | 2.53 | 1.40 | 0.36 |
| EU-4, machinery and electronics (HS 84/85/90), change | | −0.99 | −0.91 | −1.00 | −1.21 |
| Turkey, all goods | 0.69 | 1.13 | 1.68 | 1.61 | 1.49 |
| UAE, electronics (HS 85) | 0.02 | 0.06 | 0.51 | n/a | n/a |

EU-4 is Germany, Poland, Lithuania and Italy.

**Supporting evidence**

- **Used cars.** Avtostat counts about 45,000 used cars a year entering Russia via Belarus in 2023 and 2024. In 2025 it counts 19,100 used and 17,100 new. In January-August 2026 it counts 16,400, mostly premium brands ([Nasha Niva/Avtostat](https://nashaniva.com/en/388158), [autonews.ru](https://www.autonews.ru/news/693aab0d9a79472bebd6701b)).
- **Belarus's own car market** was small: 14,843 new cars sold in 2022 ([Pozirk/BAA](https://pozirk.online/en/news/46736)).
- **Luxury cars.**
  - Western luxury cars reached Russia via Belarusian suppliers in 2022-2023 ([FT via Kyiv Independent](https://kyivindependent.com/ft-eu-seeks-to-stop-russian-imports-of-western-luxury-cars-via-belarus/)).
  - Lithuanian customs and railway found evasion schemes ([LRT 2023](https://www.lrt.lt/en/news-in-english/19/2118281/lithuanian-railway-co-detects-possible-sanctions-evasion-scheme-to-ship-luxury-cars-to-russia), [LRT 2024](https://www.lrt.lt/en/news-in-english/19/2307628/lithuania-s-customs-uncovers-sanction-evasion-scheme-for-car-exports-to-russia)).
  - Lithuania stopped letting cars over 1.9 litres go to Belarus in March 2024.
  - The EU's 14th package (June 2024) extended its anti-circumvention rules to Belarus ([Mayer Brown](https://www.mayerbrown.com/en/insights/publications/2024/07/eu-extends-sanctions-against-belarus-to-fight-circumvention)).
- **BelGee.** The Belarusian-Chinese plant assembles Geely cars from Chinese kits. It made about 60,000 cars in 2023 and over 90,000 in 2024, with 70-80% sold in Russia ([Interfax](https://interfax.com/newsroom/top-stories/96780/), [www1.ru](https://www1.ru/news/2025/01/08/bolsinstvo-avtomobilei-geely-i-belgee-byli-prodany-v-2024-godu-v-rossii-a-ne-v-belorussii.html)). This explains most of China's car-exports jump.
- **Corisk** (as reported by [Buro](https://buromedia.io/en/news/eksperty-cherez-belarus-prokhodit-tret-ot-tenevogo-eksporta-v-rossiyu)) claims more than EUR 10bn of "shadow exports" went through Belarus in 2022-2023. No method is published.
  - Belarus's imports from all non-Russian partners rose by only about USD 4.5bn by 2023 (excluding Ukraine; `round4b.json`).
  - That caps any re-export figure well below this claim, so it is used only as an outer bound.
- **No academic estimate found.** KSE, Bruegel, Kiel, wiiw and BEROC have no Belarus-specific re-export figure that could be located. OSW notes the shift to Chinese suppliers after Western embargoes ([OSW 533](https://osw.waw.pl/en/publikacje/osw-commentary/2023-08-18/towards-a-dependence-no-alternative-russias-increased-role)).

### How the numbers were built

1. **Increase per goods group.** For each group, the increase in partners' exports to Belarus over 2019-2021, in USD:
   - **A. EU cars** (HS 8703 from Germany, Poland, Lithuania, plus Italy's HS 87).
   - **B. Chinese cars** (HS 8703).
   - **C. Machinery, electronics and instruments** (HS 84, 85, 90). This is the net change across all partners, so the fall in EU supplies is subtracted first. Chinese machinery that only replaced German machinery for Belarus's own factories is therefore not counted. Other EU exporters are scaled in from their share of EU exports to Belarus (factor 0.43).
   - **D. Other manufactures** (HS 28-40, 42-43, 61-70, 73, 82-83, 91-96), net in the same way.
2. **Pass-on share**: the part of each increase that went on to Russia:

   | group | central | range | why |
   |---|---|---|---|
   | A. EU cars → Russia | 0.70 | 0.50-0.85 | car imports quadrupled while Belarus's own market was ~15-20k new cars; Avtostat ~45k used cars a year into Russia |
   | A. of which inside Belarus's **recorded** exports | 0.50 | 0.25-0.80 | many cars are moved by individuals registered in Belarus, not sold by Belarusian firms |
   | B. Chinese cars | 0.15 | 0.05-0.35 | most of it is BelGee kits (assembly = processing, stays Belarusian) and Belarus's booming Chinese-car retail |
   | C. Machinery, electronics | 0.45 | 0.25-0.65 | net of substitution; includes dual-use (CHPL-type) goods; part is inputs for Belarusian products sold to Russia (processing) |
   | D. Other manufactures | 0.25 | 0.10-0.40 | consumer goods, plastics, metal goods; Belarus's own demand grew too |
   | 2025 coverage uplift | ×1.10 | 1.00-1.25 | UAE, Vietnam, Uzbekistan and India had not yet reported 2025 |

3. **The cap does not bind.** The cap is the increase in Belarus's exports to Russia, about +EUR 8-10bn a year. The low bound uses all low shares, and the high bound all high shares.
4. **2026 January-August** = 2025 × 8/12 × 1.05. The factor 1.05 is Belarus's Jan-Aug 2026 exports to Russia against 8/12 of 2025. The range is widened.
5. **Pre-war baseline 2019-2021:** EUR 0.25bn (0.1-0.5), an educated guess.
   - Belarus's own 2019-21 exports to Russia show only small amounts in chapters it hardly makes: fruit (HS 08) USD 0.10-0.17bn, fish (HS 03) USD 0.11-0.14bn, and some cars and electronics.
   - Food re-exports peaked under Russia's 2014-2018 counter-sanctions.
6. **Hub margin:** 10% (5-20%), the same guess as `reexports.json`.

### Results

Re-exports inside Belarus's recorded exports to Russia, EUR bn:

| | baseline 2019-21 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|
| central | 0.25 | 0.57 | 1.75 | 1.22 | 0.79 | 0.55 |
| low-high | 0.1-0.5 | 0.21-1.07 | 0.73-3.10 | 0.51-2.19 | 0.33-1.57 | 0.13-1.54 |
| share of Belarus's exports to Russia | | 2.6% | 7.6% | 5.0% | 3.3% | |
| of which EU cars | | 0.40 | 0.73 | 0.36 | 0.04 | |
| of which Chinese cars | | 0.02 | 0.18 | 0.23 | 0.23 | |
| of which machinery, electronics | | 0.00 | 0.48 | 0.34 | 0.42 | |
| of which other manufactures | | 0.16 | 0.36 | 0.29 | 0.09 | |

**Certainty:** C for 2022-2024 and D for 2025-2026.

**Car transit outside Belarus's recorded exports**, in `reexports_unrecorded_car_transit`: EUR 0.40 / 0.73 / 0.36 / 0.04 (high 0.5) / 0.03bn.
- This is the other half of the EU-car pass-on.
- It must not be subtracted from Belarus. At most, it can be added to the origin countries' sales to Russia; see the overlaps section.

**Origin shares** (weighted over 2022-2025, central): China 45%, Germany 16%, Poland 15%, Lithuania 11%, Turkey 7%, UAE 2%, Italy 1%, other 3% (Armenia, Kazakhstan, Uzbekistan, Korea).
- The mix moves a lot over the years:

  | | China | Germany | Poland | Lithuania | Turkey | UAE |
  |---|---|---|---|---|---|---|
  | 2022 | 14% | 31% | 19% | 30% | 4% | |
  | 2023 | 35% | 18% | 18% | 13% | 7% | 6% |
  | 2024 | 51% | 16% | 15% | 5% | 8% | |
  | 2025 | 82% | | 4% | | 8% | |

  The builder should use `origin_shares_by_year` if possible.
- Origin is the exporter of record. A used German car sold by a Lithuanian dealer counts as Lithuania. Belarus's imports by country of origin are not published.

**Biggest effects** (change against the pre-war level, 2022-Aug 2026, central): re-export value moved from Belarus to the origin, net of Belarus's margin.

| origin | revenue moved, EUR bn | at profit (×0.2), EUR bn | direction for the origin |
|---|---|---|---|
| China | 1.63 | 0.33 | toward Russia |
| Germany | 0.48 | 0.10 | toward Russia |
| Poland | 0.46 | 0.09 | toward Russia |
| Lithuania | 0.32 | 0.06 | toward Russia |
| Turkey | 0.25 | 0.05 | toward Russia |
| UAE | 0.08 | 0.02 | toward Russia |
| Belarus (loses it) | −3.34 | −0.67 (≈ −0.9% of GDP) | less toward Russia |

### Against round4b.json

`round4b.json` had EUR 0.30/1.72/1.81/1.94/1.42bn, with China at 86%. It took 45% of China's whole increase, including the car jump. This file:
- treats most Chinese cars as BelGee assembly and Belarusian retail;
- adds EU cars, the big 2022-2023 channel;
- nets machinery against the fall in EU supply.

The total for 2022-2024 is similar (3.5 against 3.8). For 2025-2026 it is lower (1.3 against 3.4), because the EU-car channel closed and the Chinese increase is mostly processing and Belarus's own demand.

---

## Part 2. A Belarus-specific counterfactual

### The problem

The generic counterfactual holds Belarus's 2021 trade with Russia flat (random walk) and attaches the 90% error band of large flows across all countries. Imports from Russia are about EUR 18bn a year, and the band is ×0.70-1.35 in 2022, widening to ×0.47-1.91 in 2026. Added up, this spans about 118% of Belarus's GDP, so the headline range crosses zero.

### Data and back-test

- **Series.** Belarus-Russia goods trade 2002-2021 in EUR, deflated with the map's own price indices: fuel mix for imports from Russia, non-fuel goods for exports to Russia. This is the same series as `counterfactual.json`: Comtrade own report, with the 2021 import gap repaired from Russia's mirror.
- **Back-test.** Rolling origins 2007-2020, 1-5 years ahead: 60 errors per flow when all years are kept, or 36 when 2014-15 and 2020 are excluded as in the generic test. The three generic tests (2008, 2013, 2016 origins) are reported too.
- **Models tested:**
  - random walk;
  - 3-year average;
  - 5-year trend, plain and damped;
  - level × Belarus real GDP growth;
  - level × Russia real GDP growth;
  - oil-price elasticity fitted on Belarus;
  - a pooled linear model on oil, Belarus GDP and Russia GDP.
  - Russia's own imports was also tried. It is not eligible, because its 2022-26 values are war outcomes.

### Results

Median absolute log error, 1-5 years ahead:

| | random walk | 3-yr avg | Belarus GDP | Belarus GDP with the IMF forecast of the time | linear (oil, GDPs) | generic large-flow random walk |
|---|---|---|---|---|---|---|
| imports from Russia, rolling | **0.108** | 0.089 | 0.090 | – | 0.088 | 0.17-0.20 |
| imports, T2008 / T2013 / T2016 | 0.14 / 0.18 / 0.19 | | 0.06 / 0.16 / 0.15 | 0.08 / **0.22** / – | 0.05 / 0.08 / 0.12 | |
| exports to Russia, rolling | **0.172** | 0.153 | 0.142 | – | 0.160 | 0.22-0.28 |
| exports, T2008 / T2013 / T2016 | 0.28 / 0.14 / 0.14 | | 0.19 / 0.13 / 0.09 | 0.17 / **0.33** / – | | |

- **Errors are much smaller than the generic ones.** Belarus's imports from Russia are about half as volatile as the typical large flow. A third of their value is crude and gas on negotiated terms (contract crude volumes, gas fixed at about USD 128.5 per 1,000 m³), and the rest is steady industrial trade.
- **No model beats holding 2021 once only pre-war inputs are allowed.** With realised GDP, the GDP model passes the decision rule. With the IMF GDP forecast actually available at the origin, it is clearly worse in the 2013 test, because the 2015 crash was not foreseen. So the random walk is kept for both flows, as the generic rule would also decide.
- **What the pre-war path would change.** The IMF October 2021 path (Belarus +0.5% to +1.3% a year) would move the central by only +0.5% in 2022 to +5.4% in 2026.
- **Intervals.**
  1. Take the 5th-95th percentile of Belarus's own random-walk errors (all years), scaled by √(h/3).
  2. Widen them halfway to the block-bootstrap bounds, because 14 origins with overlapping errors make the tails uncertain.

  Scaled quantiles used: imports from Russia −0.254/+0.284; exports to Russia −0.423/+0.762.

### New multipliers vs 2021 (real), low-high (central 1.00)

| | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| **to_rus (imports from Russia), Belarus-specific** | 0.86-1.18 | 0.81-1.26 | 0.78-1.33 | 0.75-1.39 | 0.72-1.44 |
| to_rus, generic (replaced) | 0.70-1.35 | 0.61-1.52 | 0.55-1.66 | 0.50-1.79 | 0.47-1.91 |
| realised in the map | 0.92 | 1.00 | 1.04 | 1.10 | 1.10 |
| **from_rus (exports to Russia), Belarus-specific** | 0.78-1.55 | 0.71-1.86 | 0.66-2.14 | 0.61-2.41 | 0.58-2.67 |
| from_rus, generic (replaced) | 0.72-1.33 | 0.63-1.49 | 0.57-1.63 | 0.52-1.75 | 0.48-1.86 |
| realised in the map | 1.44 | 1.49 | 1.58 | 1.55 | 1.68 |

- **Imports from Russia:** the interval is about half as wide. Summed over 2022-2026, it spans 58% of GDP instead of 118%. The realised values all lie inside it, so the central change stays small.
- **Exports to Russia:** Belarus's own history does not justify a narrower interval.
  - The lower bound is higher, but the upper bound is higher too, because of the 2010-2013 boom (Customs Union, the 2011 devaluation).
  - This flow counts only at profit (×0.2), so its width matters about 5 times less. Summed, it spans 24% of GDP against 17% generic.
  - The builder may keep the generic from_rus band instead. Its tails rest on 319 errors rather than 60, and Belarus's evidence does not contradict its lower end.
- **Net result.** Belarus's headline range should narrow substantially, mainly through the import flow. The central is unchanged, because both centrals stay at 1.00.

### What is guessed or weak

- **Re-exports.**
  - All pass-on shares are judgements, though anchored on car counts, BelGee output and the EU-machinery decline.
  - The recorded/unrecorded split for cars is the weakest point.
  - Exporter-of-record origin is not brand origin.
- **Baseline 2019-2021** is an educated guess.
- **Counterfactual.**
  - It rests on 14 origins.
  - The intervals assume no Belarus-Russia oil or gas dispute bigger than those of 2010 and 2020 (both are in the sample).
  - The map's fuel-mix deflator for Belarus's imports uses world prices, while Belarus pays contract prices. In euro terms the difference is a few percent and is within the range.

## Overlaps

1. **round4b.json.** `belarus.residual_allocation.components.recorded_reexports_in_official_exports` is the same flow, and this file **replaces** it. Do not apply both. In `belarus_from_rus_change_central`, keep the removal of Belarus's pro-rata residual share and swap only the re-export part.
2. **reexports.json** has no Belarus hub entry, so there is no double counting. Belarus appears there only as a small onward destination of Armenian gold, which is a different flow.
3. **residual.json.** Belarus's pro-rata share is already re-spread. The unrecorded car transit sits outside both Belarus's recorded exports and partners' reported exports to Russia, so it can overlap with the pro-rata residual given to Germany, Poland, Lithuania and China. Add it only if the residual is not also raised for them; it is small.
4. **Origin countries' exports to Belarus** are not counted as Russia flows anywhere in the map, so moving re-exports to them adds new sales to Russia (at profit) without overlap.
5. **BelGee kit processing** is not counted (for information: about EUR 0.75-1.0bn a year of Chinese kit value in 2023-2025).
6. **counterfactual.json:** only BLR to_rus and from_rus are replaced. Ukraine and services flows are unchanged.

## Open questions

- Does Belstat's EAEU trade record cover cars that individuals re-register and move to Russia? This decides the 50% recorded share.
- Eurostat CN8 data on EU car exports to Belarus by value band would sharpen the EU-car channel. An investigative report cites EUR 1.5bn and then 1.7bn, consistent with the Comtrade figures here.
- 2025 partner data are still incomplete. The figure should be re-run in 2027.
- A Belarus-specific deflator for imports from Russia (contract crude and gas prices) would remove the remaining price noise from the to_rus back-test.
