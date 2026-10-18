# Research files: what each one holds and where it is used

All inputs of the map live in [`research/2026-10/`](../../research/2026-10/README.md): JSON files with the numbers (each value with low, central and high, a certainty letter and sources) and, next to almost every JSON file, a `*-notes.md` file with the method, the sources with retrieval dates, and the reasoning behind each educated guess. This page lists every file, what it contains, which build step reads it and which documentation page explains it. Paths like `working/...` in the notes refer to research scripts and raw downloads that are not published. None of the research files has been reviewed line by line by a person yet.

## Round 1 files (`research/2026-10/`)

| data | notes | contents | used by | explained in |
|---|---|---|---|---|
| [`kiel.json`](../../research/2026-10/kiel.json) | [kiel-notes.md](../../research/2026-10/kiel-notes.md) | Kiel Ukraine Support Tracker Release 31: aid per donor and year, loans, ERA, EU institutions | `build()` aid; `check_data.py` 1, 3, 5 | [aid](../method/aid-refugees-military.md#aid) |
| [`trade.json`](../../research/2026-10/trade.json) | [trade-notes.md](../../research/2026-10/trade-notes.md) | first trade download, 2021–2025, dual-use HS4 proxy | superseded by `trade_full.json`, not read by the pipeline | [trade](../method/trade.md) |
| [`crea.json`](../../research/2026-10/crea.json) | [crea-notes.md](../../research/2026-10/crea-notes.md) | CREA fossil payments per buyer, laundered-oil windows, discount estimates | `check_data.py` 9 | [energy](../method/energy-and-laundered-oil.md) |
| [`flowback.json`](../../research/2026-10/flowback.json) | [flowback-notes.md](../../research/2026-10/flowback-notes.md) | US own-industry share (CSIS), PURL payers and receipts | `build()` flowback | [flowback](../method/aid-refugees-military.md#flowback) |
| [`companies.json`](../../research/2026-10/companies.json) | [companies-notes.md](../../research/2026-10/companies-notes.md) | KSE profit tax by home country, company counts | `build()` company counts | [companies](../method/services-shipping-companies.md#company-taxes) |
| [`other.json`](../../research/2026-10/other.json) | [other-notes.md](../../research/2026-10/other-notes.md) | military support to Russia, people, population and GDP | `build()` GDP, military, people | [military](../method/aid-refugees-military.md#military-support-to-russia) |
| [`gaps-input.json`](../../research/2026-10/gaps-input.json) | | the gap list handed to the round-2 researchers | not read by the pipeline | [changelog](../changelog.md) |
| [`gaps.md`](../../research/2026-10/gaps.md) | | generated: per country, which parts are reported, estimated or missing | written by `write_gaps_report()` | [ranges](../method/ranges.md) |

## Gap files (`research/2026-10/gaps/`)

| data | notes | contents | used by | explained in |
|---|---|---|---|---|
| [`trade_full.json`](../../research/2026-10/gaps/trade_full.json) | [notes](../../research/2026-10/gaps/trade_full-notes.md) | trade 2019–Aug 2026, 233 economies, with ranges and basis | `build()` trade | [trade](../method/trade.md) |
| [`nonreport.json`](../../research/2026-10/gaps/nonreport.json) | [notes](../../research/2026-10/gaps/nonreport-notes.md) | 21 non-reporting partners, paid share | `build()` | [trade](../method/trade.md) |
| [`narrow.json`](../../research/2026-10/gaps/narrow.json) | [notes](../../research/2026-10/gaps/narrow-notes.md) | official statistics for 16 wide-range countries | `build()` step 1, `apply_narrow()` | [trade](../method/trade.md) |
| [`aid_gaps.json`](../../research/2026-10/gaps/aid_gaps.json) | [notes](../../research/2026-10/gaps/aid_gaps-notes.md) | aid from 190 non-Kiel countries | `build()` aid | [aid](../method/aid-refugees-military.md#aid) |
| [`refugees.json`](../../research/2026-10/gaps/refugees.json) | [notes](../../research/2026-10/gaps/refugees-notes.md) | refugee person-years and modelled cost | `build()` refugees | [refugees](../method/aid-refugees-military.md#refugees) |
| [`energy.json`](../../research/2026-10/gaps/energy.json) | [notes](../../research/2026-10/gaps/energy-notes.md) | switching cost, oil discount, laundered oil, fossil payments | `build()` energy | [energy](../method/energy-and-laundered-oil.md) |
| [`energy2.json`](../../research/2026-10/gaps/energy2.json) | [notes](../../research/2026-10/gaps/energy2-notes.md) | transit gas, price indices, fuel mix, hub resale shares | `build()` energy, `price_indices()`, `check_data.py` 12–13 | [energy](../method/energy-and-laundered-oil.md), [prices](../method/prices.md) |
| [`customs_gas.json`](../../research/2026-10/gaps/customs_gas.json) | (no notes file) | gas recorded in customs (HS 2711) | transit gas swap | [energy](../method/energy-and-laundered-oil.md#transit-gas) |
| [`gas_prices.json`](../../research/2026-10/gaps/gas_prices.json) | [notes](../../research/2026-10/gaps/gas_prices-notes.md) | Russian gas price per country and year | `gas_index()`, transit gas | [prices](../method/prices.md#gas-prices-per-country) |
| [`prices.json`](../../research/2026-10/gaps/prices.json) | [notes](../../research/2026-10/gaps/prices-notes.md) | own customs unit values, fuel mix, windfall | `fuel_index()`, `fuel_share_year()`, `war_windfall()` | [prices](../method/prices.md) |
| [`hub_exports_2024.json`](../../research/2026-10/gaps/hub_exports_2024.json) | (no notes file) | fuel customers of SGP, NLD, BEL, GRC, MLT | `reassign_laundered_oil()` | [energy](../method/energy-and-laundered-oil.md#hub-resale-chain) |
| [`hub_buyers.json`](../../research/2026-10/gaps/hub_buyers.json) | [notes](../../research/2026-10/gaps/hub_buyers-notes.md) | customers of UAE, India, Turkey, Togo, Gibraltar, Panama; Turkey and India refining | `reassign_laundered_oil()`, refiners | [energy](../method/energy-and-laundered-oil.md) |
| [`refine.json`](../../research/2026-10/gaps/refine.json) | [notes](../../research/2026-10/gaps/refine-notes.md) | shadow-fleet control, re-export shares, Togo buyers, gold routes | shipping, re-exports, residual | [trade](../method/trade.md#re-export-hubs) |
| [`companies_all.json`](../../research/2026-10/gaps/companies_all.json) | [notes](../../research/2026-10/gaps/companies_all-notes.md) | all taxes of foreign-owned companies, 231 countries | `build()` company | [companies](../method/services-shipping-companies.md#company-taxes) |
| [`uncovered.json`](../../research/2026-10/gaps/uncovered.json) | [notes](../../research/2026-10/gaps/uncovered-notes.md) | services, hidden channels, undisclosed aid, private donations | `build()` | [services](../method/services-shipping-companies.md), [aid](../method/aid-refugees-military.md) |
| [`kgz_gold.json`](../../research/2026-10/gaps/kgz_gold.json) | (description inside the file) | first buyers of Kyrgyz gold, HS 7108, 2023–2024 | `build()` hidden channels | [trade](../method/trade.md#gold-and-hidden-channels) |
| [`flowback2.json`](../../research/2026-10/gaps/flowback2.json) | [notes](../../research/2026-10/gaps/flowback2-notes.md) | own-industry shares, refugee donor funding, military support to Russia, people | `build()` | [flowback](../method/aid-refugees-military.md#flowback) |
| [`china_military.json`](../../research/2026-10/gaps/china_military.json) | [notes](../../research/2026-10/gaps/china_military-notes.md) | China's unrecorded military support, recorded dual-use | `build()` military | [military](../method/aid-refugees-military.md#military-support-to-russia) |
| [`shipping.json`](../../research/2026-10/gaps/shipping.json) | [notes](../../research/2026-10/gaps/shipping-notes.md) | tanker freight, ship sales, insurance, registry | `apply_shipping()` | [shipping](../method/services-shipping-companies.md#shipping) |
| [`reexports.json`](../../research/2026-10/gaps/reexports.json) | [notes](../../research/2026-10/gaps/reexports-notes.md) | 11 re-export hubs: shares, origins, destinations, margins | `apply_reexports()`, `apply_residual()`, `check_data.py` 14 | [trade](../method/trade.md#re-export-hubs) |
| [`residual.json`](../../research/2026-10/gaps/residual.json) | [notes](../../research/2026-10/gaps/residual-notes.md) | missing GDP, Russia's import gap, Hong Kong gold | `apply_residual()` | [trade](../method/trade.md#residual-gap) |
| [`audit.json`](../../research/2026-10/gaps/audit.json) | [notes](../../research/2026-10/gaps/audit-notes.md) | first audit of 31 countries | `apply_audit()` | [changelog](../changelog.md#round-3) |
| [`audit2.json`](../../research/2026-10/gaps/audit2.json) | [notes](../../research/2026-10/gaps/audit2-notes.md) | second audit, seven questions | `apply_audit2()`, `baltic_transit()`, `remove_freight()` | [trade](../method/trade.md) |
| [`sanctions_share.json`](../../research/2026-10/gaps/sanctions_share.json) | [notes](../../research/2026-10/gaps/sanctions_share-notes.md) | share of each cut required by sanctions | `build()` labels | [trade](../method/trade.md#sanctions-mandated-or-own-choice) |
| [`round4a.json`](../../research/2026-10/gaps/round4a.json) | [notes](../../research/2026-10/gaps/round4a-notes.md) | company tax split and history, China refining, EU refiners, pre-war laundered oil | `build()`, `reassign_laundered_oil()` | [companies](../method/services-shipping-companies.md#company-taxes), [energy](../method/energy-and-laundered-oil.md#pre-war-laundered-oil) |
| [`round4b.json`](../../research/2026-10/gaps/round4b.json) | [notes](../../research/2026-10/gaps/round4b-notes.md) | UAE trade, refugee budgets, Belarus, artefacts | `build()`, `apply_audit()`, `apply_reexports()` | [trade](../method/trade.md), [refugees](../method/aid-refugees-military.md#refugees) |
| [`incentives.json`](../../research/2026-10/gaps/incentives.json) | (method inside the file) | AI-guessed direction and threat scores | `build()` | [incentives](../method/incentives.md) |
| [`trend.json`](../../research/2026-10/gaps/trend.json) | [notes](../../research/2026-10/gaps/trend-notes.md) | damped pre-war goods trends | `pre_war_trends()` | [counterfactual](../method/counterfactual.md#2-history-four-generations) |
| [`trend2.json`](../../research/2026-10/gaps/trend2.json) | [notes](../../research/2026-10/gaps/trend2-notes.md) | trends for services, company taxes, shipping | `pre_war_trends()` | [counterfactual](../method/counterfactual.md) |
| [`trend3.json`](../../research/2026-10/gaps/trend3.json) | [notes](../../research/2026-10/gaps/trend3-notes.md) | back-test of nine methods; random walk wins | not read by the pipeline | [counterfactual](../method/counterfactual.md#2-history-four-generations) |
| [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json) | [notes](../../research/2026-10/gaps/counterfactual-notes.md) | 16 models, three back-tests, chosen multipliers | `counterfactual()` | [counterfactual](../method/counterfactual.md) |

## See also

- [pipeline.md](pipeline.md): the build order these files feed
- [sources.md](sources.md): the external sources, grouped by topic
- [Research log by round](../../research/2026-10/README.md)
- [Documentation index](../README.md)
