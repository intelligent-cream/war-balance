# Limitations and open issues

The map is a research preview. Its figures were compiled with AI assistance from public sources and have not yet been reviewed line by line by a person. This page lists the known open issues, from the ones most likely to move a headline number to small display problems, says where each is documented, and explains how to report a correction. If you quote a figure, check its sources first (every number on the map links to them).

## Open issues in the numbers

| issue | effect | where documented |
|---|---|---|
| **Belarus's range still crosses zero** (−29% of GDP, likely range −64% to +16%), narrower since round 5 with a Belarus-specific band for its imports from Russia. It is left out of top lists. | Belarus | [counterfactual.md](method/counterfactual.md#belarus-round-5) |
| **2025–2026 partner data incomplete.** 121 reporters had 2025 annual data; 2026 is estimated from 2025 for many importers (marked `*`). | recent years | [ranges.md](method/ranges.md#2026-and-the--mark) |
| **Hub margins and re-export shares** are educated guesses (goods 5–20%, gold 0.3–6%). | hubs and their suppliers | [trade.md](method/trade.md#re-export-hubs) |
| **Refugee costs** outside the 27 hosts with budgets are modelled; Poland's 2022 count may be low. | refugee hosts | [aid-refugees-military.md](method/aid-refugees-military.md#refugees) |
| **Military support to Russia** is a rough indication (D) for Belarus and China; North Korea and Iran are now C (round 6). | North Korea, Iran, Belarus, China | [aid-refugees-military.md](method/aid-refugees-military.md#military-support-to-russia) |
| **Refiners and buyers of laundered oil** are matched at one crude-to-fuel ratio (0.5, CREA); India's own refinery data suggest about 0.67, so a little of the crude may sit with the refiner rather than the buyer. | India, Türkiye, China and their buyers | [energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#refiners-counted-once) |
| **Aid spent on energy, relief and rebuilding** (round 6 ledger) may partly also appear in customs as extra sales to Ukraine (in-kind goods, energy equipment); only weapons are netted against customs so far. At the money rule's factors the overlap is small (Germany at most about EUR 0.7bn). | donors of in-kind goods | [aid-refugees-military.md](method/aid-refugees-military.md#flowback) |
| **Remittances for Tajikistan** (about −37% of GDP, range −83% to −10%) rest on World Bank totals and an assumed Russian share (0.88), certainty D; Belarus and Moldova also use an assumed share. | Tajikistan, Belarus, Moldova | [trade.md](method/trade.md#remittances-and-relocants-round-7) |
| **The no-war gas price** rests on late-2021 futures, which already held the autumn-2021 gas squeeze (partly Gazprom's); a lower path would raise the windfall for gas buyers. | gas buyers | [prices.md](method/prices.md#no-war-prices-round-7) |
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
