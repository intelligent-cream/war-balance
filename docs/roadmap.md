# Roadmap: round 5

The work list for the next data round, agreed on 2026-10-18. Each item links to the limitation or method page it
changes. Status is updated as items are done; the [changelog](changelog.md) records what each finished item changed.

## Research

| # | item | what changes | status |
|---|---|---|---|
| 1 | Ukraine's own arms purchases abroad (also with donor cash, e.g. Dutch money for US weapons, the Czech ammunition initiative) | the seller's profit counts as money flowing back | to do |
| 2 | Turkey's prices from Russian export data and tanker tracking | Turkey's payments to Russia and windfall | to do |
| 3 | Belarus's re-exports to Russia moved to the countries that made the goods | Belarus, China, Türkiye, EU | to do |
| 4 | A Belarus-specific counterfactual tested on its own 2008–2021 history | Belarus's range | to do |
| 5 | Laundered oil per EU country from per-country studies | EU members, fuel hubs | to do |
| 6 | Shadow-fleet ownership and control | shipping profit by country | to do |
| 7 | Refugee costs for more hosts; Poland's 2022 count | refugee hosts | to do |
| 8 | Newer 2026 trade data | fewer `*` estimates | to do |
| 17 | Russian arms sales to other countries, against pre-war | new part: money to Russia | to do |
| 18 | Exit payments and forced discounts of companies leaving Russia | new part: money to Russia, by home country | to do |
| 19 | Rosatom nuclear projects abroad: check whether payments are in trade or services; add if not | money to Russia | to do |
| 20 | Loans at their economic value: only the saving against what Ukraine would otherwise pay to borrow counts | aid from lenders | to do |
| 21 | Refugees at net cost: hosting cost minus taxes and contributions of working refugees | refugee hosts | to do |
| 22 | Latest Kiel tracker release for 2026 aid | 2026 aid | to do |
| 23 | Donated weapons at market value (value to Ukraine), not replacement or book value | military aid | to do |
| 24 | Profits Russian-owned companies abroad send home (and trusteeships that stopped them) | money to Russia, by host country | to do |
| 25 | World Bank, IMF, EBRD and EIB support credited to members by shareholding, valued as in 20 | aid | to do |
| 26 | Interest and repayments on Russia's state loans to other countries | money to Russia | to do |
| 27 | Pledged versus delivered aid: count delivered or firmly allocated aid only | aid | to do |

## Code

| # | item | status |
|---|---|---|
| 9 | Shared error between parts that come from the same data (totals' ranges) | to do |
| 10 | Baltic and Finnish transit passed on to the final buyers | to do |
| 11 | One base year for all price indices | to do |
| 12 | Range lines in the country breakdown on phones | to do |
| 13 | Split `data.json` so phones load faster | to do |
| 14 | Chart label overlaps on narrow screens | to do |
| 15 | Translate the status line, source names and notes from the data | to do |
| 16 | Docs: record deliberate choices (actual figures as model inputs; 90% ranges as tested) | to do |

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
