# Limitations and open issues

The map is a research preview. Its figures were compiled with AI assistance from public sources and have not yet been reviewed line by line by a person. This page lists the known open issues, from the ones most likely to move a headline number to small display problems, says where each is documented, and explains how to report a correction. If you quote a figure, check its sources first (every number on the map links to them).

## Open issues in the numbers

| issue | effect | where documented |
|---|---|---|
| **Belarus's range still crosses zero** (−24% of GDP, likely range −58% to +19%), narrower since round 5 with a Belarus-specific band for its imports from Russia. It is left out of top lists. | Belarus | [counterfactual.md](method/counterfactual.md#belarus-round-5) |
| **2025–2026 partner data incomplete.** 121 reporters had 2025 annual data; 2026 is estimated from 2025 for many importers (marked `*`). | recent years | [ranges.md](method/ranges.md#2026-and-the--mark) |
| **Laundered oil: two channels missing.** Brunei's Hengyi refinery (Russian crude, sold to Australia) and Russian fuel relabelled in Turkish ports without refineries (EUR 3.1–3.3bn a year to the EU, mostly Greece) are not counted. | Australia, Greece | [energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| **Shadow-fleet control** (who owns UAE-, Indian- and Chinese-managed tankers) is the biggest guess in shipping. | UAE, India, China, Greece | [shipping-notes.md](../research/2026-10/gaps/shipping-notes.md) |
| **Hub margins and re-export shares** are educated guesses (goods 5–20%, gold 0.3–6%). | hubs and their suppliers | [trade.md](method/trade.md#re-export-hubs) |
| **Refugee costs** outside the 27 hosts with budgets are modelled; Poland's 2022 count may be low. | refugee hosts | [aid-refugees-military.md](method/aid-refugees-military.md#refugees) |
| **Military support to Russia** is a rough indication (D) everywhere. | North Korea, Iran, Belarus, China | [aid-refugees-military.md](method/aid-refugees-military.md#military-support-to-russia) |
| **Crypto and payment agents** are not counted: no source splits them by country. | Russia side, unknown size | [trade.md](method/trade.md#gold-and-hidden-channels) |
| **Aid that comes back through Ukraine's own arms purchases is not counted as flowback.** Flowback covers donors' own-industry orders, NATO PURL (US stocks) and EU-level aid spent with EU industry. It misses money Ukraine itself spends abroad on weapons: budget support or another donor's cash that ends up buying US, Czech, Turkish, Polish or South Korean arms (for example Dutch money used to buy US weapons, or the Czech ammunition initiative). The selling country's industry profits without it showing. | arms exporters (US, Czechia, Türkiye, Poland, South Korea) slightly too far toward Ukraine | [aid-refugees-military.md](method/aid-refugees-military.md#flowback) |
| **The AI-guessed incentive view** is not data. | that view only | [incentives.md](method/incentives.md) |

## Display issues


## Deliberate choices (not limitations)

- **The counterfactual uses actual 2022–2026 GDP and trade** as inputs, and **its ranges stay at the tested 90%** rather than being widened for Russia-side shocks. Both are explained in [counterfactual.md](method/counterfactual.md#deliberate-choices).
- **Baltic and Finnish transit is removed but not handed to the final buyers**, because the buyers already record those goods as imports from Russia ([trade.md](method/trade.md#baltic-and-finnish-pass-through)).

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
