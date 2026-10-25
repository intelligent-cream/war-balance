# Expected without the war: the counterfactual models

Every trade number on the map is a change against what a country would have bought from or sold to Russia and Ukraine **if there had been no war**. That level cannot be observed, so it is predicted, with models tested on past years. The short answer: for most flows the best prediction is **2021 held flat**; only sales to Russia are predicted better by a model that uses the country's trade with everyone else.

Details for developers: [the full model tables, formulas and research files](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/counterfactual.md).

## 1. What "expected without the war" means

<figure class="md-fig" style="margin:0 0 14px" role="img" aria-label="Schematic chart: purchases from Russia fall after 2022 while the expected no-war level stays near 2021 inside a shaded band; the gap between them is what counts">
<svg viewBox="0 0 400 190" width="100%" style="max-width:440px;height:auto;display:block" font-size="11">
<line x1="30" y1="160" x2="390" y2="160" style="stroke:var(--line)"/>
<polygon points="168,52 380,36 380,104 168,72" style="fill:var(--mid);opacity:.55"/>
<polygon points="168,62 210,62 250,112 290,128 330,132 380,136 380,70 168,62" style="fill:var(--ukr);opacity:.22"/>
<polyline points="40,70 85,66 125,64 168,62" style="fill:none;stroke:var(--ink);stroke-width:2.5"/>
<polyline points="168,62 380,70" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-dasharray:6 4"/>
<polyline points="168,62 210,62 250,112 290,128 330,132 380,136" style="fill:none;stroke:var(--rus);stroke-width:2.5"/>
<line x1="168" y1="24" x2="168" y2="160" style="stroke:var(--ink-soft);stroke-dasharray:2 3"/>
<text x="168" y="18" text-anchor="middle" style="fill:var(--ink-soft)">2022</text>
<text x="40" y="176" style="fill:var(--ink-soft)">2019</text>
<text x="360" y="176" style="fill:var(--ink-soft)">2026</text>
<text x="244" y="30" style="fill:var(--ink)">expected without the war</text>
<text x="300" y="152" style="fill:var(--rus-text)">actual</text>
<text x="288" y="96" text-anchor="middle" font-weight="700" style="fill:var(--ink)">this gap counts</text>
</svg>
<figcaption class="key">Schematic. Dashed: the expected level, with its tested range (grey). Orange: what the country actually bought. The shaded gap, summed over the years, is the change on the map.</figcaption>
</figure>

For each flow and year from 2022, the map compares the **expected volume** (the pre-war level, usually 2021, moved by the model's prediction) with the **actual volume** (the year's money divided by its price level). The difference is valued at that year's prices and summed. A good counterfactual must not use anything the war caused, such as Russia's own trade after 2022 or realised 2022 energy prices.

## 2. Four generations of models

The project tried four generations: a flat 2019–2021 average (biased low, because trade usually grows), each country's own damped trend (too narrow, and fitted on the rebound after the 2014 crash), nine statistical methods (only "2021 held flat" did well in every test), and finally 16 models that use the country's trade with others and its GDP.

## 3. The 16 models of generation 4

They range from "2021 held flat" through share and GDP models to machine learning. Models that use Russia's own trade after 2022 were not allowed: that trade is the war's outcome. The full list is in the developer reference.

## 4. The three back-tests, and why 2013 matters

Each model predicted years it had not seen: 2008–2012 from 2007, 2013–2017 from 2012, and 2017–2021 from 2016. The **2013 test is the hard one**: in 2014–2016 the shock came from Russia itself (the oil price halved, the rouble lost half its value), which partner-side data cannot see. It warns how wrong a prediction can be when Russia's own economy moves.

## 5. Results and the decision rule

The rule, fixed before the results: a model replaces "2021 held flat" only if it is at least 15% more accurate in every test (or on average, worse in none). Only the model for **sales to Russia** passed (about 18% better). A linear model and a random forest looked better for trade with Ukraine on two tests, but not with more tests.

## 6. Which model is used for which flow

| flow | expected level | why |
|---|---|---|
| Sales to Russia | a model on the country's exports to everyone else | clearly better in all three tests |
| Purchases from Russia | 2021 held flat | depends on Russian supply, which partner data cannot see |
| Trade with Ukraine | 2021 held flat | no model passed with more tests |
| Services | 2021 flat plus the travel recovery from COVID | 2021 was a COVID year for travel |
| Re-export hubs and Belarus | 2021 held flat | their trade was reshaped by goods passing to Russia |
| Company taxes, shipping, laundered oil | pre-war trends | not covered by the back-tests |

Commodity prices in the models follow the IMF forecast of October 2021, the last before the war, not realised prices.

## 7. How the prediction's error enters the ranges

The expected level is never treated as exact. Its range comes from the models' own errors in the back-tests: a 90% band, wider for small flows and longer horizons (for a large flow over 2022–2026, roughly ×0.6 to ×1.6). In the 2013 test, when the shock came from Russia, these bands covered only 77–79% of outcomes instead of 90%; this is listed under [limitations](#view=how&sec=limitations).

### Belarus

Belarus's imports from Russia (about EUR 18bn a year) are steadier than the average partner's, so they get a narrower band of their own (×0.72–1.44). Even so the range is wide enough to cross zero: its net is −3.60%<!-- n:BLR.net --> of GDP, likely −13.26%<!-- n:BLR.netLo --> to +7.34%<!-- n:BLR.netHi -->. Belarus is a party to the war and not ranked.

### Trade with Ukraine

Tested on Ukraine's own 2004–2021 trade and eight similar partners, the models' gains roughly halved and they lost in several years, so both purchases from and sales to Ukraine hold 2021 flat.

### Russia's neighbours and Moldova

Each of Russia's neighbours was tested on its own history. Mongolia, Yemen, Tajikistan and Moldova get their own, narrower bands where those still covered the test years. Moldova's gas for Transnistria is not counted: Transnistria never paid for it.

### Imports from Russia

Five ways to narrow the range for "paid to Russia" were tested; only a band re-measured year by year passed (large flows ×0.57–1.62).

### Small flows start from the 2019 to 2021 median

A small flow from Russia swings from year to year (one cargo more or less). Where purchases were under EUR 1bn a year, the no-war level starts from the **median** of 2019, 2020 and 2021, so one unusual year cannot set it. Exceptions keep 2021 where 2019–2020 do not describe the country (Brunei's refinery opened in late 2019, New Zealand's closed in 2022; Syria's pre-war data are only Russia's own reports).

### Pipeline fuel buyers

Buyers whose Russian fuel came mainly by pipeline had steady volumes, so seven countries get narrower bands (Germany ×0.74–1.31, Hungary, Slovakia, Czechia, Poland, Finland, North Macedonia). Poland had decided in 2019 to end its Yamal gas contract in 2022, so its no-war path drops that gas from 2023.

### Power of Siberia

China's no-war path includes the gas the Power of Siberia contract (2014) already foresaw: 15.4 bcm in 2022 rising to 38 bcm. Only deliveries beyond that count as war-driven. China raised Russia's earnings from trade by 0.74%<!-- n:CHN.rus abs --> of GDP.

### Japan's Sakhalin-2 LNG

LNG is about a quarter of what Japan bought from Russia. Its no-war band comes from Japanese buyers' long-term Sakhalin-2 contracts (about 5 Mt a year): the floor is the contracted volume, the top the pre-war maximum. The rest of Japan's purchases keeps the generic band. The middle value does not change.

### Deliberate choices

- **Actual figures as inputs.** The models use each country's actual 2022–2026 GDP and trade with others. If a country's economy shrank because of the war, it would have traded less with Russia anyway; that is not a choice to credit or blame.
- **Ranges as tested.** They are not widened for Russia-side shocks: stretching every range for a rare shock would blur the result more than it adds.
