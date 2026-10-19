# Follow the Money: Ukrainian Aid — documentation

[The map](https://intelligent-cream.github.io/follow-the-money-ukraine/) shows two numbers for every country since before the full-scale invasion: its **support for Ukraine**, and the **change in its payments to Russia** (less or more paid to Russia, and what it earned from Russia), and their sum. Each number is a total over 2022 to 2026 (2026 counts January to August, the latest data), as a percentage of one year's GDP (not a yearly rate), with a likely range and a source behind every part. This documentation explains how those numbers are made: the idea, the models that predict what would have happened without the war, every part of the calculation, the data pipeline, the sources and the known weaknesses. It is written for curious readers who are not economists, but it gives the formulas and links to the code for those who want to check.

Status: research preview. The research was compiled with AI assistance and has not yet been reviewed line by line by a person.

## What the map shows, in plain language

Think of each country as having two ledgers: money and support going toward Ukraine (aid, refugee hosting, buying Ukrainian goods) and money going toward Russia (buying its oil, gas and goods, selling it goods, taxes paid there, weapons). Before the war, most countries already traded with both. So the map does not count totals. It asks: **compared with what the country would have done without the war, how much more did it do for Ukraine, and how much less (or more) did it pay Russia?** The two are kept apart because paying Russia less, including when Russia itself cut off the gas, is not money given to Ukraine.

- **Toward Ukraine** (blue on the map): it gave aid, hosted refugees, bought less from Russia than expected, gave up sales to Russia.
- **Toward Russia** (orange): it bought more from Russia than expected, sold Russia more, paid war-time prices for Russian fuel, bought Russian oil refined elsewhere, sent weapons.

The total is shown as a share of one year's GDP, so a small country that did a lot is not hidden behind a large one that did a little. Per person and total euros are one click away.

## How to read a number

Suppose the map shows **Poland: +3.6% of a year's GDP, likely range 2.2% to 6.2%, certainty D**. These are the figures in the current build (2022 to August 2026, round 13).

1. **+3.6%**: over 2022 to August 2026, the sum of Poland's two numbers equals about a twenty-eighth of one year's economic output (its 2024 GDP, about EUR 848bn; so about EUR 31bn). It is a total for the whole period, not a yearly rate: an average year is about 0.8%.
2. **Two numbers**: **support for Ukraine +1.0%** (EUR 8.5bn: aid, its share of EU-level aid, refugee hosting, purchases from Ukraine, minus money flowing back) and **change in payments to Russia +2.6%** (EUR 22bn: mostly less paid to Russia, which includes EUR 0.6bn of gas Russia cut off itself in April 2022). The plus sign means more support for Ukraine or less paid to Russia; a minus sign means more paid to or earned from Russia.
3. **What it is made of**: open Poland's panel. The waterfall shows each part. The largest is the fall in payments to Russia, measured in volumes at pre-war prices and counted at Russia's net gain (about EUR 21bn). Then come aid (Kiel Institute, adjusted: Kiel's own figure for Poland is EUR 5.9bn; with donated weapons at market value and loans at their gift to Ukraine it is EUR 3.2bn), its share of EU-level aid (about EUR 2.4bn) and refugee hosting at net cost (about EUR 3.2bn: the cost of hosting minus the taxes refugees pay). Subtracted are the extra Poland paid for Russian fuel because of war-time prices (about EUR 1.8bn) and the money that flowed back to its own economy from the war effort, mostly extra sales to Ukraine, counted at the seller's net gain × the share that is genuinely extra (about EUR 0.75bn) ([overview](method/overview.md)).
4. **"Compared with what?"**: for trade, the expected level without the war is predicted by a model tested on past years. For Poland's imports from Russia it is the 2021 level held flat ([counterfactual](method/counterfactual.md)).
5. **2.2% to 6.2%**: the likely range, about 90%, of the parameters given the method. It combines the uncertainty of the data, the price levels and the no-war prediction ([ranges](method/ranges.md)). Countries whose range crosses zero are left out of the top lists, because even the direction is uncertain. The panel also shows a **method band** (3.6% to 3.9% for Poland): the net under other method choices.
6. **Certainty D**: the weakest letter among the parts (for Poland, "Paid to Russia by companies leaving it", a rough indication). A = reported, B = measured estimate, C = modelled estimate, D = rough indication.
7. **A `*` on a part**: its 2026 value is estimated from the 2025 rate.
8. **Each part has numbered sources**: click them in the panel; the list is also in [sources](reference/sources.md).

## Sharing a view

The address in the browser keeps what you see, so you can copy it and share it.

- **The view and the buttons on top**: for example `#view=rank&lens=ukr&m=total` opens the ranking, toward Ukraine, in total euros.
  - `view`: `map`, `rank`, `bubbles`, `table`, `how` or `sources`.
  - `flow`: with `view=sources`, one money flow, e.g. `#view=sources&flow=loans` opens the Sources view at loans ([trace](trace.md)).
  - `lens`: `change` (change since before the war), `cost` (cost carried), `ukr` (to Ukraine) or `rus` (to Russia).
  - `m`: `gdp` (% of GDP), `pp` (per person) or `total` (total euros).
  - `y`: a year, 2021 to 2026.
- **A country**: `#AUS` opens Australia's panel. With a view it becomes `c=AUS`, e.g. `#view=rank&c=AUS`. `UKR` and `RUS` open the Ukraine and Russia panels.
- **Values left at their start are not written.** A plain `#AUS` is the map, change since before the war, % of GDP, 2026. An address with an unknown value falls back to the start.
- **A country's own page**: `c/aus.html` (lower-case code) is a page per country whose link preview shows that country's card and which opens the map on that country (`#AUS`). Use it to share a country on social media. These pages are made by `share_cards.mjs` when the site is published.

## Contents

### Method

| page | what it covers |
|---|---|
| [method/overview.md](method/overview.md) | the core idea and the full list of parts, each linked to its page; the cost view and other lenses |
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
- **Code**: [`pipeline/build_data.py`](../pipeline/build_data.py) (build), [`pipeline/check_data.py`](../pipeline/check_data.py) (checks), [`pipeline/loan_rates.py`](../pipeline/loan_rates.py) (loan values from measured rates, round 12), [`pipeline/share_cards.mjs`](../pipeline/share_cards.mjs) (share images), [`site/index.html`](../site/index.html) (map and `calc()`), [`site/views.js`](../site/views.js) (ranking, bubbles, table, downloads), [`site/views2.js`](../site/views2.js) (How it works), [`site/i18n.js`](../site/i18n.js) (seven languages)
- **Older design notes** (partly superseded): [architecture](design/architecture.md), [concept](design/concept.md), [data ingestion](design/data-ingestion.md), [data model](design/data-model.md), [research process](design/research-process.md), [roadmap](design/roadmap.md), [website](design/website.md)

## Corrections and licence

Corrections are welcome: open a GitHub issue or message [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/) with the country, the figure and a source ([how](limitations.md#how-to-report-a-correction)). Code is MIT ([`LICENSE`](../LICENSE)); data and text, including this documentation, are CC BY 4.0 ([`LICENSE-DATA.md`](../LICENSE-DATA.md)).

## See also

- [Project README](../README.md)
- [The map](https://intelligent-cream.github.io/follow-the-money-ukraine/)
