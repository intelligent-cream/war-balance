# Follow the Money: Ukraine — documentation

[The map](https://intelligent-cream.github.io/follow-the-money-ukraine/) shows the net for every country since before the full-scale invasion, and its two parts: its **support for Ukraine**, and its **business with Russia** (how much less it paid Russia than without the war; below zero, how much more it paid Russia or earned from it). Each number is a total over 2022 to 2026 (2026 counts January to August, the latest data), as a percentage of one year's GDP (the average of 2022–2024; not a yearly rate), with a likely range and a source behind every part. This documentation explains how those numbers are made: the idea, the models that predict what would have happened without the war, every part of the calculation, the data pipeline, the sources and the known weaknesses. It is written for curious readers who are not economists, but it gives the formulas and links to the code for those who want to check.

Status: research preview. The research was compiled with AI assistance and has not yet been reviewed line by line by a person.

## What the map shows, in plain language

Think of each country as having two ledgers: money and support going toward Ukraine (aid, refugee hosting, buying Ukrainian goods) and money going toward Russia (buying its oil, gas and goods, selling it goods, taxes paid there, weapons). Before the war, most countries already traded with both. So the map does not count totals. It asks: **compared with what the country would have done without the war, how much more did it do for Ukraine, and how much less (or more) did it pay Russia?** The two are kept apart because paying Russia less, including when Russia itself cut off the gas, is not money given to Ukraine.

Since round 15 the map opens with their sum, and shows each part as a map of its own. Since round 17 (redesign) the map opens with nothing else on it but a one-row legend; since round 21 (polish) one header bar above it holds the site's name, the research-preview note (About opens the full text), the question with an ⓘ, and two buttons, **Highlights** (seven stories on the map) and **Filters**. Since round 19 Filters is a panel that stays open until it is closed (on the left on desktop, beside the country panel; a bottom sheet on phones that keeps its height or shrinks to a handle). Since round 22 the views (Map, Ranking, Sources) are tabs in the header bar. Filters holds, in order: what **the map shows**, the **measure**, the year and find a country; **More options** (round 21) folds what's counted, region, group, size and the map layers; then theme and language. Every filter is there: the views have none of their own and follow it live; since round 20 the ranking is as clean as the map, its title in the header line and its explanation in the ⓘ. One colour rule applies to every map: **blue toward Ukraine, orange toward Russia, grey no clear change** (including "too close to call"). Money streams show the same two numbers in euros: support for Ukraine to Kyiv, and how much more a country paid Russia than without the war to Moscow (thin solid lines since round 21: the 8 largest each way, 5 and thinner on phones; a switch in Filters). The views:

- **Net** (the default map, ranking and share card), always with a warning: it adds two different things, help given to Ukraine and reduced business with Russia.
- **Support for Ukraine**: aid, refugee hosting, buying Ukrainian goods, minus what the country earned back from the war effort. Belarus, a co-belligerent, hosted Ukrainian refugees too; that cost is shown as a label, not as support.
- **Business with Russia** ("Change in payments to Russia" until round 17, "Kept from Russia" until round 21): blue where the country paid Russia less than without the war, so **Russia's gain from the country fell**, orange where it paid more and Russia's gain **rose** (bought more, paid war-time prices for Russian fuel, bought Russian oil refined elsewhere, sold Russia goods, sent weapons), each counted at Russia's net gain. The map title gives the world total: Russia's net gain from buyers who cut fell by EUR 352.0bn<!-- n:WORLD.less -->, from buyers who bought more it rose by EUR 215.4bn<!-- n:WORLD.more -->, so much of what one country stopped paying, Russia sold to others.
- **Russian money frozen** (since round 16): the return Russia lost on its central-bank reserves frozen in the country. It is not a payment, so it is a line of its own, added to the net only.
- **Cost to the country** was a fourth view from round 15 to round 18. The owner removed it in round 19 to simplify the site; it is still in the full data download, labelled ([overview](method/overview.md#the-cost-view)).

The gross views "To Ukraine" and "To Russia" were removed in round 15: they include normal trade and measure something different. The gross flows are still in each country's panel (the small charts, such as "Bought from Ukraine"), in the table and downloads, and in the gross trade flows (an option in Filters since round 17).

Each number is a share of one year's GDP (the average of 2022–2024), so a small country that did a lot is not hidden behind a large one that did a little. A number whose likely range or method band crosses zero is too close to call: a faded colour of its leaning direction on the map, marked "direction uncertain" and left out of the rankings. Per person and total euros are one click away in Filters, and since round 19 a country's panel follows that choice: its big number, tiles and bars are then in euros, with % of GDP beside them. With **What's counted** in Filters a reader can leave parts out; every number then recomputes and the page says "Custom mix, not the official figures", with a button back to the official numbers (a custom mix cannot be shared).

## How to read a number

Suppose you open Poland. These are the figures in the current build (2022 to August 2026, round 16).

1. **Supported Ukraine with 1.29%<!-- n:POL.ua --> of a year's GDP**, likely range 0.54%<!-- n:POL.uaLo --> to 2.57%<!-- n:POL.uaHi -->, certainty C: over 2022 to August 2026, Poland's support for Ukraine equals about an eightieth of one year's economic output (its average 2022–2024 GDP, about EUR 753bn; so EUR 9.7bn<!-- n:POL.uaEur -->). It is a total for the whole period (about 4.7 years), not a yearly rate: an average year is about 0.27%. It is aid (Kiel Institute, adjusted: Kiel's own figure for Poland is EUR 5.9bn; with donated weapons at market value and loans at their gift to Ukraine it is EUR 3.2bn), its share of EU-level aid (about EUR 2.4bn) and refugee hosting at net cost (about EUR 4.9bn: the cost to all levels of government minus the taxes refugees pay; round 15 put Poland on the same definition as Germany, and round 16 applied the 2022 scope gap to 2022 only, where it was measured), minus the money that flowed back to its economy from the war effort, including the gain on refugee spending in Poland.
2. **Reduced business with Russia by 3.03%<!-- n:POL.rus --> of a year's GDP** (EUR 22.8bn<!-- n:POL.rusEur -->): Poland paid Russia that much less than without the war, mostly less bought from Russia, which includes EUR 4.1bn of gas Russia cut off itself from April 2022 (round 14 measures Poland's gas from volumes, as its customs book the gas under other headings). The fall in payments is measured in volumes, valued at each year's prices and counted at Russia's net gain (about EUR 22bn); the extra Poland paid for Russian fuel because of war-time prices (about EUR 1.8bn) is subtracted. Since round 22 every number is said as a verb and an amount: "reduced business with Russia by" (less paid to Russia) or "increased business with Russia by" (more paid to or earned from Russia); on charts and in the data a plus sign means reduced, a minus sign increased. The panel says it in words: "paid Russia €22.8bn (3.0% of GDP) less than without the war".
3. **Toward Ukraine by 4.39%<!-- n:POL.net --> of a year's GDP** (likely 2.51%<!-- n:POL.netLo --> to 7.53%<!-- n:POL.netHi -->): the sum of the two, plus Russian money frozen (EUR 0.55bn, Poland's share of the return Russia lost on reserves frozen in the EU; a line of its own since round 16). It adds help given to Ukraine and reduced business with Russia, two different things; it is the default map, always with that warning.
4. **"Compared with what?"**: for trade, the expected level without the war is predicted by a model tested on past years. For Poland's imports from Russia it is the 2021 level held flat ([counterfactual](method/counterfactual.md)).
5. **The likely range**: the uncertainty of the data and the models given the method (the price levels, the no-war prediction, the gain shares), calibrated by judgement to about 90%, not measured ([ranges](method/ranges.md)). The panel also shows a **method band** for each number: business with Russia is 1.56%<!-- n:POL.rusBandLo --> to 3.43%<!-- n:POL.rusBandHi --> under other method choices (the windfall in full or left out, loans at the war-time yield, EU refiners' exports, laundered oil, the fuel mix, freight, the normal return, the gas Russia cut off left out, redirected trade, refugees at gross cost or at one common cost per refugee, 2026 at 2025 prices and 2024 GDP). A country whose range or band crosses zero is "direction uncertain" and not ranked.
6. **Certainty C**: each number's letter weighs how much of it rests on primary data (A or B) and on judgement (D), and how wide its range and method band are against the value ([ranges](method/ranges.md#certainty-letters)). A = reported, B = measured estimate, C = modelled estimate, D = rough indication. What Russia took from Poland's companies on their way out (forced discounts and exit fees, EUR 0.2bn) is not in the totals since round 14b: it is a marker ("Taken by Russia").
7. **A `*` on a part**: its 2026 value is estimated from the 2025 rate.
8. **Each part opens its method** (since round 17): click a part in the panel for how it is calculated, why it is done this way (with links to its decisions), Poland's sources with their exact tables, and the method page and full trace. Since round 19 the panel ends with a **Sources** section listing every source used for Poland's figures, numbered, with their links; the list of all sources is in the Sources view and in [sources](reference/sources.md).

## Download the data

At the end of the Sources view: **Full data (CSV)** (every country, every number in € and % of GDP), **CSV with every
part** and **Full data (JSON)** (`site/data.json`). Since round 22 the Russia columns are named
`business_with_russia_reduced_*` (they were `kept_from_russia_*`): positive means the country reduced its business with
Russia (paid it less, or earned less from it, than without the war), negative means it increased it. The file names
start with `follow-the-money-ukraine_`.

## Sharing a view

The address in the browser keeps what you see, so you can copy it and share it.

- **The view and the choices in Filters**: for example `#view=rank&lens=payments&m=total` opens the ranking of business with Russia, in total euros.
  - `view`: `map`, `rank` or `sources`. How it works was a view until round 19; `view=how` now opens `sources`. Ukraine vs Russia and Table & data were views until round 20; `view=bubbles` opens `rank` and `view=table` opens `sources`. The old Top lists panel (`#c=RANKINGS`) opens `rank`.
  - `flow`: with `view=sources`, one money flow, e.g. `#view=sources&flow=loans` opens the Sources view at loans ([trace](trace.md)).
  - `lens`: `net` (the sum, the start: an address without `lens` opens it), `support` (support for Ukraine), or `payments` (business with Russia; `lens=kept` opens it too). Older links keep working: `lens=change` (the old net view) opens `net`, `lens=ukr` (the removed To Ukraine view) opens `support`, `lens=rus` (To Russia) opens `payments` and `lens=cost` (the cost to the country, removed in round 19) opens `net`.
  - `m`: `gdp` (% of GDP) or `total` (total euros). Per person was a choice until round 20; `m=pp` now opens `gdp`.
  - `y`: a year, 2021 to 2026.
  - `hl`: a highlight on the map (round 17): `world`, `armed`, `baltic`, `hungary`, `support`, `gascut` or `taken`, e.g. `#hl=baltic`.
- **A country**: `#AUS` opens Australia's panel. With a view it becomes `c=AUS`, e.g. `#view=rank&c=AUS`. `UKR` and `RUS` open the Ukraine and Russia panels.
- **Values left at their start are not written.** A plain `#AUS` is the map, the net, % of GDP, 2026. "What's counted" is never in the address: a link always opens the official numbers. An address with an unknown value falls back to the start.
- **A country's own page**: `c/aus.html` (lower-case code) is a page per country whose link preview shows that country's card and which opens the map on that country (`#AUS`). Use it to share a country on social media. These pages are made by `share_cards.mjs` when the site is published.

## Contents

### Method

| page | what it covers |
|---|---|
| [method/overview.md](method/overview.md) | the core idea and the full list of parts, each linked to its page; the cost to the country (a view until round 18, now in the full data download) and the removed gross views |
| [method/counterfactual.md](method/counterfactual.md) | **the models**: what "expected without the war" means, four generations of approaches, 16 models, three back-tests, the decision rule, which model is used for which flow, how its error widens the ranges, what was rejected, effect on headlines |
| [method/prices.md](method/prices.md) | why the map compares volumes; price indices per flow, own customs prices, gas prices per country, the war-time windfall |
| [method/ranges.md](method/ranges.md) | certainty letters, where ranges come from, the quadrature in `spread()`, 2026 `*` marks, what ranges do not cover |
| [method/trade.md](method/trade.md) | goods trade: sources, non-reporters, re-export hubs, Baltic transit, residual gap, Hong Kong gold, hidden channels, freight, profit not revenue, sanctions labels |
| [method/energy-and-laundered-oil.md](method/energy-and-laundered-oil.md) | transit gas, laundered oil and the hub resale chain, refiners, pre-war laundered oil, Turkey, energy premium and oil discount |
| [method/services-shipping-companies.md](method/services-shipping-companies.md) | services and tourism, tanker shipping as profit, company taxes in Russia |
| [method/russia-state-and-companies.md](method/russia-state-and-companies.md) | nuclear projects and state loans from Russia, Russian arms sales, company exits and Russian companies abroad (round 5) |
| [method/aid-refugees-military.md](method/aid-refugees-military.md) | Kiel aid, EU-level aid, ERA loans, undisclosed aid, private donations, refugees, military support to Russia, flowback |
| [method/loans.md](method/loans.md) | loans and guarantees: the two parts of the gift (cheaper interest, default risk the lender carries), measured rates and expected losses by creditor class, the range, the cost view, a worked example (round 12) |
| [method/incentives.md](method/incentives.md) | the AI-guessed "above or below expectation" view (removed from the map) |

### Data and pipeline (`reference/`)

| page | what it covers |
|---|---|
| [reference/pipeline.md](reference/pipeline.md) | how to build, the 51 build steps in order, the `data.json` schema, the checks |
| [reference/research-files.md](reference/research-files.md) | every research file, its notes, and which step and page use it |
| [reference/sources.md](reference/sources.md) | the main external sources by topic, with addresses |

### Tracing every number

| page | what it covers |
|---|---|
| [trace.md](trace.md) | every money flow on the map (loans, oil, refugees, weapons...) with its method, the decisions behind it, its sources and exact links, research files, raw data, code and what is judgement |
| [decisions.md](decisions.md) | every modelling choice, with its reasons and evidence |
| [decision-log.md](decision-log.md) | every decision in the order it was made |

### Status

| page | what it covers |
|---|---|
| [limitations.md](limitations.md) | known open issues and how to report corrections |
| [changelog.md](changelog.md) | research rounds 1–12 and the review fixes |

## Research notes, data and code

- **Research log by round**: [`research/2026-10/README.md`](../research/2026-10/README.md)
- **Per-country coverage** (reported, estimated, missing): [`research/2026-10/gaps.md`](../research/2026-10/gaps.md)
- **Key research notes**: [counterfactual](../research/2026-10/gaps/counterfactual-notes.md), [trend](../research/2026-10/gaps/trend-notes.md), [trend2](../research/2026-10/gaps/trend2-notes.md), [trend3](../research/2026-10/gaps/trend3-notes.md), [prices](../research/2026-10/gaps/prices-notes.md), [trade_full](../research/2026-10/gaps/trade_full-notes.md), [energy](../research/2026-10/gaps/energy-notes.md), [energy2](../research/2026-10/gaps/energy2-notes.md), [audit](../research/2026-10/gaps/audit-notes.md), [audit2](../research/2026-10/gaps/audit2-notes.md), [round4a](../research/2026-10/gaps/round4a-notes.md), [round4b](../research/2026-10/gaps/round4b-notes.md); all others in [research-files.md](reference/research-files.md)
- **The data the map reads**: [`site/data.json`](../site/data.json)
- **Code**: [`pipeline/build_data.py`](../pipeline/build_data.py) (build), [`pipeline/check_data.py`](../pipeline/check_data.py) (checks), [`pipeline/loan_rates.py`](../pipeline/loan_rates.py) (loan values from measured rates, round 12), [`pipeline/share_cards.mjs`](../pipeline/share_cards.mjs) (share images), [`site/index.html`](../site/index.html) (map and `calc()`), [`site/views.js`](../site/views.js) (ranking, bubbles), [`site/views2.js`](../site/views2.js) (table and downloads, round 19), [`site/i18n.js`](../site/i18n.js) (seven languages)
- **Older design notes** (partly superseded): [architecture](design/architecture.md), [concept](design/concept.md), [data ingestion](design/data-ingestion.md), [data model](design/data-model.md), [research process](design/research-process.md), [roadmap](design/roadmap.md), [website](design/website.md)

## Corrections and licence

Corrections are welcome: open a GitHub issue or message [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/) with the country, the figure and a source ([how](limitations.md#how-to-report-a-correction)). Code is MIT ([`LICENSE`](../LICENSE)); data and text, including this documentation, are CC BY 4.0 ([`LICENSE-DATA.md`](../LICENSE-DATA.md)).

## See also

- [Project README](../README.md)
- [The map](https://intelligent-cream.github.io/follow-the-money-ukraine/)
