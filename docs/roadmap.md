# Roadmap: round 5

The work list for the next data round, agreed on 2026-10-18. Each item links to the limitation or method page it
changes. Status is updated as items are done; the [changelog](changelog.md) records what each finished item changed.

## Research

| # | item | what changes | status |
|---|---|---|---|
| 1 | Ukraine's own arms purchases abroad (also with donor cash, e.g. Dutch money for US weapons, the Czech ammunition initiative) | the seller's profit counts as money flowing back | done ([aid-refugees-military.md](method/aid-refugees-military.md#arms-ukraine-bought-abroad-round-5)) |
| 2 | Turkey's prices from Russian export data and tanker tracking | Turkey's payments to Russia and windfall | done ([energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#turkey-a-special-case)) |
| 3 | Belarus's re-exports to Russia moved to the countries that made the goods | Belarus, China, Türkiye, EU | done ([trade.md](method/trade.md#belarus-round-5)) |
| 4 | A Belarus-specific counterfactual tested on its own 2008–2021 history | Belarus's range | done for imports from Russia; range −58% to +19% ([counterfactual.md](method/counterfactual.md#belarus-round-5)) |
| 5 | Laundered oil per EU country from per-country studies | EU members, fuel hubs | done: customs-based per member ([energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5)) |
| 6 | Shadow-fleet ownership and control | shipping profit by country | done: freight by real controller ([services-shipping-companies.md](method/services-shipping-companies.md#shipping)) |
| 7 | Refugee costs for more hosts; Poland's 2022 count | refugee hosts | done: Poland, Bulgaria, Croatia revised ([aid-refugees-military.md](method/aid-refugees-military.md#refugees)) |
| 8 | Newer 2026 trade data | fewer `*` estimates | done: 32 economies ([trade.md](method/trade.md#2026-refresh-round-5)) |
| 17 | Russian arms sales to other countries, against pre-war | new part: money to Russia | done ([russia-state-and-companies.md](method/russia-state-and-companies.md#weapons-bought-from-russia)) |
| 18 | Exit payments and forced discounts of companies leaving Russia | new part: money to Russia, by home country | done; seizures recorded, not counted ([russia-state-and-companies.md](method/russia-state-and-companies.md#companies-leaving-russia)) |
| 19 | Rosatom nuclear projects abroad: check whether payments are in trade or services; add if not | money to Russia | done: fuel already in trade; construction added ([russia-state-and-companies.md](method/russia-state-and-companies.md)) |
| 20 | Loans at their economic value: only the saving against what Ukraine would otherwise pay to borrow counts | aid from lenders | done ([aid-refugees-military.md](method/aid-refugees-military.md#loans-at-their-economic-value-round-5)) |
| 21 | Refugees at net cost: hosting cost minus taxes and contributions of working refugees | refugee hosts | done, floored at zero per country ([aid-refugees-military.md](method/aid-refugees-military.md#refugees)) |
| 22 | Latest Kiel tracker release for 2026 aid | 2026 aid | checked: release 31 is the latest and already used; ERA years fixed |
| 23 | Donated weapons at market value (value to Ukraine), not replacement or book value | military aid | done ([aid-refugees-military.md](method/aid-refugees-military.md#donated-weapons-at-market-value-round-5)) |
| 24 | Profits Russian-owned companies abroad send home (and trusteeships that stopped them) | money to Russia, by host country | done ([russia-state-and-companies.md](method/russia-state-and-companies.md#russian-owned-companies-abroad)) |
| 25 | World Bank, IMF, EBRD and EIB support credited to members by shareholding, valued as in 20 | aid | done ([aid-refugees-military.md](method/aid-refugees-military.md#loans-at-their-economic-value-round-5)) |
| 26 | Interest and repayments on Russia's state loans to other countries | money to Russia | done ([russia-state-and-companies.md](method/russia-state-and-companies.md)) |
| 27 | Pledged versus delivered aid: count delivered or firmly allocated aid only | aid | checked: the map counts allocations; guarantees now at economic value |

## Code

| # | item | status |
|---|---|---|
| 9 | Shared error between parts that come from the same data (totals' ranges) | done: measured correlations ([ranges.md](method/ranges.md#from-parts-to-a-total)) |
| 10 | Baltic and Finnish transit passed on to the final buyers | checked: buyers already record it; adding it would double count ([trade.md](method/trade.md#baltic-and-finnish-pass-through)) |
| 11 | One base year for all price indices | done: all 2019–2021 = 1 ([prices.md](method/prices.md#a-note-on-index-bases)) |
| 12 | Range lines in the country breakdown on phones | done: bars from zero, range lines with end marks |
| 13 | Split `data.json` so phones load faster | done: coverage notes load after the map (`detail.json`) |
| 14 | Chart label overlaps on narrow screens | done: bubble labels keep clear of the axis numbers |
| 15 | Translate the status line, source names and notes from the data | done: 135 data strings in all six languages (`tData()`) |
| 16 | Docs: record deliberate choices (actual figures as model inputs; 90% ranges as tested) | done ([counterfactual.md](method/counterfactual.md#deliberate-choices)) |

## Decided not to do

- **Wider ranges for Russia-side shocks.** The counterfactual's ranges stay at their tested 90% for normal periods.
  Stretching them for a rare Russia-side shock would blur the result more than it adds honesty, since the map already
  uses a real prediction rather than a flat 2021 level. See [method/counterfactual.md](method/counterfactual.md).
- **Pre-war forecasts as model inputs.** The counterfactual uses actual 2022–2026 GDP and trade: if a country's
  economy shrank because of the war, it would have traded less with Russia anyway, and that is not a choice the map
  should credit or blame.

## See also

- [limitations.md](limitations.md)
- [changelog.md](changelog.md)
- [Documentation index](README.md)
