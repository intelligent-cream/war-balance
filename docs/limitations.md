# Limitations and open issues

The map is a research preview. Its figures were compiled with AI assistance from public sources and have not yet been reviewed line by line by a person. This page lists the known open issues, from the ones most likely to move a headline number to small display problems, says where each is documented, and explains how to report a correction. If you quote a figure, check its sources first (every number on the map links to them).

## Open issues in the numbers

| issue | effect | where documented |
|---|---|---|
| **Turkey's prices need a person's review.** Turkish customs hide the partner for crude and gas; the measured price index (3.3 in 2022) conflicts with the oil-formula gas price (1.75). Turkey keeps the benchmark-based index (`PRICES_SKIP`). | Turkey's "less/more paid to Russia" and windfall | [prices.md](method/prices.md#the-composite-index-for-payments-to-russia), [prices-notes.md](../research/2026-10/gaps/prices-notes.md) |
| **Belarus's range crosses zero** (−24% of GDP, likely range −76% to +49%). Its imports from Russia (about EUR 18bn a year) are held at the 2021 level, and the honest back-tested error of "2021 held flat" on a flow that large is very wide. It is left out of top lists. | Belarus | [counterfactual.md](method/counterfactual.md#9-effect-on-the-headline-numbers) |
| **Belarus's re-exports to Russia are not moved to their origins.** Goods from China, Turkey and the EU inside its official exports (EUR 0.3–1.9bn a year) stay with Belarus. | Belarus slightly too far toward Russia; China slightly too little | [round4b-notes.md](../research/2026-10/gaps/round4b-notes.md) §3 |
| **Counterfactual intervals are too narrow under Russia-side shocks.** They cover about 90% in normal periods but 77–79% in the 2013 back-test. | all trade parts | [counterfactual.md](method/counterfactual.md#7-how-the-predictions-error-enters-the-ranges) |
| **Counterfactual inputs touched by the war.** The nowcast uses each country's realised trade with others and GDP in 2022–2026, which the war also affected; for the EU and Ukraine's neighbours the expected level may sit slightly low. Commodity prices follow the October 2021 IMF forecast, whose error is not in the intervals. | exports to Russia, trade with Ukraine | [counterfactual-notes.md §10](../research/2026-10/gaps/counterfactual-notes.md) |
| **2025–2026 partner data incomplete.** 121 reporters had 2025 annual data; 2026 is estimated from 2025 for many importers (marked `*`). | recent years | [ranges.md](method/ranges.md#2026-and-the--mark) |
| **Laundered oil has no member-state data.** Values are modelled and scaled to one EU-wide Global Witness figure. | EU members, fuel hubs | [energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#laundered-oil) |
| **Shadow-fleet control** (who owns UAE-, Indian- and Chinese-managed tankers) is the biggest guess in shipping. | UAE, India, China, Greece | [shipping-notes.md](../research/2026-10/gaps/shipping-notes.md) |
| **Hub margins and re-export shares** are educated guesses (goods 5–20%, gold 0.3–6%). | hubs and their suppliers | [trade.md](method/trade.md#re-export-hubs) |
| **Baltic and Finnish transit**: imports that only passed through are taken out, but not given to the final buyers. | small | [trade.md](method/trade.md#baltic-and-finnish-pass-through) |
| **Refugee costs** outside the 27 hosts with budgets are modelled; Poland's 2022 count may be low. | refugee hosts | [aid-refugees-military.md](method/aid-refugees-military.md#refugees) |
| **Military support to Russia** is a rough indication (D) everywhere. | North Korea, Iran, Belarus, China | [aid-refugees-military.md](method/aid-refugees-military.md#military-support-to-russia) |
| **Crypto and payment agents** are not counted: no source splits them by country. | Russia side, unknown size | [trade.md](method/trade.md#gold-and-hidden-channels) |
| **Totals treat parts as independent**, which understates shared errors. | all ranges | [ranges.md](method/ranges.md#what-the-ranges-do-not-cover) |
| **Aid that comes back through Ukraine's own arms purchases is not counted as flowback.** Flowback covers donors' own-industry orders, NATO PURL (US stocks) and EU-level aid spent with EU industry. It misses money Ukraine itself spends abroad on weapons: budget support or another donor's cash that ends up buying US, Czech, Turkish, Polish or South Korean arms (for example Dutch money used to buy US weapons, or the Czech ammunition initiative). The selling country's industry profits without it showing. | arms exporters (US, Czechia, Türkiye, Poland, South Korea) slightly too far toward Ukraine | [aid-refugees-military.md](method/aid-refugees-military.md#flowback) |
| **The AI-guessed incentive view** is not data. | that view only | [incentives.md](method/incentives.md) |

## Display issues

- **`data.json` is about 1.4 MB**, all loaded at start; on slow phone connections the map takes a while to appear. Splitting per country is a possible fix.
- **Range lines look wrong on phones.** In the country panel's breakdown, each part's likely range (the thin line) is drawn much shorter than the numbers next to it, and sits apart from its bar. Example: United States, "Less tax paid in Russia by companies", range −€1.5bn to €8.6bn, drawn as a short stub. The scale or position of these lines on narrow screens needs fixing.
- **Small chart label overlaps**: in some waterfalls and rankings long part or country names can touch on narrow screens.
- Text from `data.json` (status banner, source names, notes) stays in English in all seven languages ([`site/i18n.js`](../site/i18n.js)).

## Older documents

The design notes in [`docs/design/`](design/architecture.md) describe an earlier plan (DuckDB warehouse, estimate cards, weekly automation) that was not built this way. Where they differ from this documentation, this documentation and the code are current.

## How to report a correction

Found a wrong number, a better source or a missing flow? Please send:

1. the country and the figure (as shown on the map, with the year setting),
2. what you think it should be,
3. a link to the source.

Open an issue on GitHub, or send a message to [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/). Corrections are listed in the commit history and in the [changelog](changelog.md).

## See also

- [changelog.md](changelog.md): what each round fixed
- [method/ranges.md](method/ranges.md): what the likely ranges cover
- [Research log by round](../research/2026-10/README.md)
- [Documentation index](README.md)
