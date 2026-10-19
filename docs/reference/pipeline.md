# Building the data: pipeline, data.json and checks

Everything the map shows comes from one file, `site/data.json`, built by one script, [`pipeline/build_data.py`](../../pipeline/build_data.py), from the research files in [`research/2026-10/`](../../research/2026-10/README.md). The site then computes every part, range and total in the browser with `calc()` in [`site/index.html`](../../site/index.html). This page explains how to run the build, the order of the build steps (order matters: each step works on what earlier steps produced), the shape of `data.json`, and the checks that guard against double counting.

## How to build

```sh
./setup.sh                                  # uv sync + pre-commit hooks (run once, first)
uv run python pipeline/build_data.py        # research/ -> site/data.json and research/2026-10/gaps.md
uv run python pipeline/check_data.py        # checks; exits non-zero on any FAIL
cd site && python3 -m http.server 8000      # open http://localhost:8000
node pipeline/share_cards.mjs               # optional: share images and a page per country
```

- [`setup.sh`](../../setup.sh) runs `uv sync` and `uv run pre-commit install`. The hooks ([`.pre-commit-config.yaml`](../../.pre-commit-config.yaml)) check whitespace, YAML and JSON, file size (2 MB) and run `ruff` and `ruff-format` (line length 120, [`pyproject.toml`](../../pyproject.toml)). Python 3.12+, one dependency: `pycountry`.
- `build_data.py` writes `site/data.json` (compact JSON, about 1.4 MB) and `site/detail.json` (the per-part coverage notes, loaded after the map), regenerates [`research/2026-10/gaps.md`](../../research/2026-10/gaps.md) (`write_gaps_report()`), and prints the number of entries and sources.
- [`share_cards.mjs`](../../pipeline/share_cards.mjs) needs Node 18+ and Playwright. It serves `site/`, opens the map in Chromium and renders one 1200×630 preview card per country (`site/share/<iso>.png`), a page per country (`site/c/<iso>.html`) whose link preview shows that card, and a world card. It uses the map's own calculations, so cards always match the map. Both output folders are git-ignored.
- **Deploy**: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) runs on pushes to `main`: installs Playwright 1.48.2, runs `share_cards.mjs` and publishes `site/` to GitHub Pages. It does not rebuild `data.json`; the committed file is what goes live.

## Build order

`build()` runs these steps in order. Inline sections are part of `build()`; named functions are defined further down in [`build_data.py`](../../pipeline/build_data.py). The method page for each step is linked.

Two things apply to every step:

- **Round-7 actual values.** `load()` reads each research file through `_actuals_r7()`, which puts in the narrower values from `actuals_r7.json` for the inputs they replace. So they are applied once, before any step uses them ([trade](../method/trade.md#narrower-actual-values-round-7)).
- **Crude share of laundered fuel (round 9).** `crude_k(year, refiner)` gives the Russian crude per euro of fuel made from it (low, central, high), from `crude_content.json`. With no refiner it is the refiners' average, weighted by their fuel exports. It is used by `reassign_laundered_oil()` (step 8), the refiner step (step 11), `apply_laundered_eu()` (through `eu_k_factor()`) and `apply_brunei_r6()`, so buyers and refiners use the same ratio ([energy](../method/energy-and-laundered-oil.md#valuing-and-capping)).

| # | function | what it does | explained in |
|---|---|---|---|
| 1 | customs layer (inline) | loads `trade_full.json`; puts `narrow.json` official data, actual January–August 2026 trade (`refresh_2026.json`) and the UAE's own customs totals (`round4b.json`) in at customs level | [trade](../method/trade.md#sources-and-filling-order) |
| 2 | population and GDP (inline) | `other.json`: 2024 GDP and population | [overview](../method/overview.md) |
| 3 | trade (inline) | four flows per country with ranges, certainty from `basis`, `base` (2019–2021 average) and `base_range`; `est26` where 2026 is estimated | [trade](../method/trade.md) |
| 4 | non-reporters (inline) | `nonreport.json`; only the paid share of Russian supplies counts | [trade](../method/trade.md#sources-and-filling-order) |
| 5 | aid (inline) | Kiel donors, ERA loans out, EU-level aid split by budget share, `aid_gaps.json` for the rest | [aid](../method/aid-refugees-military.md#aid) |
| 6 | refugees (inline) | `refugees.json`, minus donor-paid shares (`flowback2.json`) | [refugees](../method/aid-refugees-military.md#refugees) |
| 7 | energy (inline) | premium and discount; transit gas swap at own gas prices; max(customs, fossil) for pipeline-gas countries; laundered oil; GDP from `residual.json` for the cap | [energy](../method/energy-and-laundered-oil.md) |
| 8 | `reassign_laundered_oil()` | hub resale chain (`pass_on()`), crude share (`crude_k()`), GDP cap, pre-war laundered level through the same chain, Gibraltar margin | [energy](../method/energy-and-laundered-oil.md#hub-resale-chain) |
| 9 | `apply_laundered_eu()` | laundered oil of EU members, the USA, the UK and Australia from customs records of fuel by origin (`laundered_eu.json`) | [energy](../method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 10 | `apply_laundered_r6()` | fuel from Brunei's refinery and fuel relabelled in Turkish ports added to the buyers, taken off Türkiye and Brunei (`laundered_r6.json`) | [energy](../method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 11 | refiners (inline) | exported crude of Turkey, India, China out of their own payments, at each refiner's `crude_k()` | [energy](../method/energy-and-laundered-oil.md#refiners-counted-once) |
| 12 | company taxes (inline) | `companies_all.json`, then profit tax + half of other taxes and the 2018–2021 base (`round4a.json`); round-6 revision (`company_taxes_r6.json`) | [companies](../method/services-shipping-companies.md#company-taxes) |
| 13 | services, hidden, undisclosed, private (inline) | `uncovered.json`; Kyrgyz hidden gold passed to its buyers (`kgz_gold.json`) | [services](../method/services-shipping-companies.md#services), [trade](../method/trade.md#gold-and-hidden-channels) |
| 14 | flowback (inline) | own-industry shares, PURL, EU-level military aid (later replaced by step 39, which also clears these steps' sources) | [flowback](../method/aid-refugees-military.md#flowback) |
| 15 | military support to Russia (inline) | North Korea, Iran, Belarus revalued (`military_rus_r6.json`); China's unrecorded part; people counts | [military](../method/aid-refugees-military.md#round-6-revision) |
| 16 | `apply_shipping()` | tanker income as profit, by who really controls each tanker (`shadow_fleet_r6.json`); overlap with services removed | [shipping](../method/services-shipping-companies.md#shipping) |
| 17 | `apply_reexports()` | hub re-exports to origin countries, Russian goods to final buyers; Belarus re-exports (`belarus.json`) | [trade](../method/trade.md#re-export-hubs) |
| 18 | `apply_residual()` | missing GDP; residual exports gap by origin (Belarus excluded); Hong Kong gold to China | [trade](../method/trade.md#residual-gap) |
| 19 | `apply_audit()` | EU Support Loan guarantors, Denmark, refugee budgets for 27 hosts | [aid](../method/aid-refugees-military.md) |
| 20 | `fix_artefacts()` | Lebanon, Mauritania, Saint Lucia, Bonaire, Botswana, Seychelles, Malta | [trade](../method/trade.md#smaller-corrections) |
| 21 | `baltic_transit()` | Baltic and Finnish pass-through out; re-exports to EU makers | [trade](../method/trade.md#baltic-and-finnish-pass-through) |
| 22 | sanctions labels (inline) | `sanctions` shares from `sanctions_share.json` and its source `sanctions_share`; `incentives.json` is no longer copied (round 11 audit) | [incentives](../method/incentives.md), [trade](../method/trade.md#sanctions-mandated-or-own-choice) |
| 23 | `remove_freight()` | CIF to FOB on payments to Russia, except border-priced shares | [trade](../method/trade.md#freight-cif-to-fob) |
| 24 | `price_indices()` | `pidx` per flow | [prices](../method/prices.md) |
| 25 | `apply_narrow()` | narrow.json values, bases and price levels not entered at step 1; Türkiye priced from `turkey_prices.json` | [trade](../method/trade.md) |
| 26 | `apply_brunei_r6()` | Brunei's payments to Russia = its true crude intake minus the crude passed on to its buyers (after step 25 sets its customs values) | [energy](../method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 27 | `apply_relocants()` | the share of travel credits spent by Russians who moved abroad comes out of services sold to Russia (`relocants.json`) | [trade](../method/trade.md#remittances-and-relocants-round-7) |
| 28 | `apply_audit2(..., "values")` | UAE gold and fuel, France's undisclosed aid, Russia's import-statistics gap | [trade](../method/trade.md) |
| 29 | `uae_fuel_net()` | UAE fuel addition net of what UAE customs record | [energy](../method/energy-and-laundered-oil.md#payments-to-russia-for-fuel) |
| 30 | `war_windfall()` | price windfall on Russian fuel, against no-war prices (`energy_nowar.json`) | [prices](../method/prices.md#war-time-windfall) |
| 31 | `pre_war_trends()` | `trend.json` and `trend2.json` multipliers (all flows) | [counterfactual](../method/counterfactual.md) |
| 32 | `counterfactual()` | back-tested multipliers and 2021 base for covered flows, cumulative bands (`cf_bands.json`, `ua_trade_cf.json`, `to_rus_cf.json`, `fuel_volume_cf.json`, `belarus.json`); replaces step 31 there | [counterfactual](../method/counterfactual.md) |
| 33 | `apply_weapons_value()` | donated weapons at market value, stored as yearly corrections (`weapons_value.json`) | [aid](../method/aid-refugees-military.md#donated-weapons-at-market-value-round-5) |
| 34 | `apply_state_finance()` | Rosatom nuclear projects and Russia's state loans (`russia_state_finance.json`) | [Russia](../method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) |
| 35 | `apply_company_flows()` | exit payments to Russia and profits sent home by Russian-owned companies abroad (`company_flows.json`; metals, mining and chemicals plants from `russian_owned_r10.json`) | [Russia](../method/russia-state-and-companies.md#companies-leaving-russia) |
| 36 | `apply_refugees_net()` | refugee hosting at net cost: cost minus the taxes refugees pay (`refugees_net.json`) | [refugees](../method/aid-refugees-military.md#refugees) |
| 37 | `apply_ua_arms_purchases()` | arms Ukraine bought abroad, as flowback to the seller (`ua_arms_purchases.json`) | [flowback](../method/aid-refugees-military.md#arms-ukraine-bought-abroad-round-5) |
| 38 | `apply_loans_value()` | loans and guarantees at their grant element (`loans_value.json`) | [aid](../method/aid-refugees-military.md#loans-at-their-economic-value-round-5) |
| 39 | `apply_money_ledger()` | every euro that reached Ukraine assigned to the economy where it was spent; replaces the earlier flowback (`money_ledger.json`) | [flowback](../method/aid-refugees-military.md#round-6-the-all-money-ledger) |
| 40 | `apply_russian_arms()` | payments to Russia for Russian weapons against the no-war level (`russian_arms_exports.json`, `arms_r6.json`) | [Russia](../method/russia-state-and-companies.md#weapons-bought-from-russia) |
| 41 | `apply_payment_agents()` | fees kept by payment agents settling Russia's trade (`payment_channels.json`) | [trade](../method/trade.md#payment-agents-round-6) |
| 42 | `apply_frozen_reserves()` | the return Russia's frozen central-bank reserves would have earned (`frozen_assets.json`) | [Russia](../method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| 43 | `apply_remittances()` | migrant workers' remittances from Russia, counted like services sold to Russia (`remittances.json`) | [trade](../method/trade.md#remittances-and-relocants-round-7) |
| 44 | `apply_chpl()` | sales of goods Russia's weapons need, as a marker only (`chpl.json`) | [trade](../method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7) |
| 45 | `apply_value_kept()` | value kept x genuinely extra, per kind of earning, in place of the flat 20% profit (`value_kept.json`) | [overview](../method/overview.md#the-money-rule-round-6) |
| 46 | `apply_audit2(..., "trends")` | audit-2 trend-window fixes, only for flows without a counterfactual | [counterfactual](../method/counterfactual.md) |
| 47 | `apply_nowar_prices()` | fuel volume change valued at no-war prices, so it and the windfall add up (`energy_nowar.json`) | [prices](../method/prices.md#no-war-prices-round-7) |
| 48 | `apply_net_gain()` | trade counts at the seller's net gain: weights per year for Russia's and Ukraine's gain (`net_gain_russia.json`, `net_gain_ukraine.json`) | [overview](../method/overview.md#the-net-gain-rule-round-10) |
| 49 | `attach_r11_sources()` | one source per round-11 proposals file, added to the series each file changed | [decisions](../decisions.md#assumptions-backed-by-data-round-11) |
| 50 | `attach_input_sources()` | inputs that feed a part but were not cited by it: gas prices on payments to Russia and the windfall, tanker control on shipping (round 11 audit) | [sources](sources.md) |
| 51 | final pass (inline) | every baseline inside its range; `coverage()` per part; the exact primary links from `sources_r11.json` (`links`); `prune_sources()` drops sources no part cites; status banner | [ranges](../method/ranges.md) |

## data.json in brief

Top level: `generated`, `data_to` (2026-08-31), `years` (2021–2026), `frac` (`[1, 1, 1, 1, 1, 0.6667]`), `meta` (`tariff_rate` 0.002, the round-11 weighted duty rate; `lost_margin` 0.2, only a fallback), `status_html`, `sources` (id → name, url, date, note, and `links`: the exact primary or secondary links from [`sources_r11.json`](../../research/2026-10/sources_r11.json), each `{title, url, kind}`; only sources that a part cites), `countries` (by ISO3), `included_in` (territories shown with another country's figures: Liechtenstein, Monaco, Isle of Man, Puerto Rico, US Virgin Islands, Saint Martin).

Per country: `n` (numeric ISO for the map shapes), `iso3`, `name`, `kind`, `pop`, `gdp`, optional `hub`, `tariff_waiver`, `eu_share` and `dual_use_note` (China), and series objects. The coverage notes per part are in `site/detail.json` (`coverage` by ISO3), not in `data.json`.

| key | content |
|---|---|
| `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` | goods trade; `to_rus` also holds `laundered*`, `paid_share`, `nowar_prices` and `nrl`/`nrh` (the no-war price's range, as factors on the expected path) |
| `to_rus.gain`, `buy_ukr.gain` | the seller's net gain per euro (round 10): weights per year as `[low, central, high]`; in `to_rus.gain`, `e` is for what was expected without the war (the 2019–2021 mix) and `a` for what was bought (that year's mix) |
| `to_rus.laund_gain`, `svc_bought.gain` | Russia's gain on crude in laundered fuel (`e` for the pre-war level, `a` for what was bought, with relabelled Russian products at the products gain) and on services, per year `[low, central, high]` |
| `svc_bought`, `svc_sold`, `shipping` | services and tanker income; `svc_sold.relocants_out` marks that relocants' spending was taken out |
| `aid` | `years`, `cats`, `loans_face`, `loans_grant_eq`, `loans_value_ukraine`, `loan_adj_own`, `loan_adj_eu`, `weapons_mv`, `era_excluded`, `pledged_open`, `eu_years`, `eu_share`, `eu_src` (sources of the EU-level aid part), `refugee_years*`, `refugee_gross`, `refugee_donor_share`, `refugee_cert`, `refugee_src` |
| `energy` | `premium*`, `discount*` |
| `laund` | laundered oil with its pre-war level and growth |
| `extra` | parts with no series of their own, each `{k, label, c, l, h, cert, src}` as yearly shifts toward Ukraine: `statefin`, `exits`, `rusfirms`, `multilat`, `rusarms`, `agents`, `frozen`, `remit` |
| `chpl` | sales to Russia of goods its weapons need: a marker, not in the totals |
| `vk` | value kept x genuinely extra, `[low, central, high]` per kind of earning (`fw`, `fo`, `rl`, `rx`, `ux`, `sl`, `sx`, `sh`) |
| `company` | `taxes*`, `staying`, `left`, `base_2018_2021` |
| `windfall` | price windfall on Russian fuel against no-war prices, yearly triple |
| `military_rus`, `hidden`, `undisclosed`, `private` | yearly triples, in money (`hidden.gain`: Russia's gain on gold per year, applied in the map) |
| `flowback` | from the all-money ledger: `own*`, `purl_in*`, `arms*`, `othsp*` (other spending), `purl_out`, `cert_own`, `arms_cert`, and sources `src`, `purl_src`, `arms_src` |
| `people`, `sanctions` | counts, sanctions labels (the AI-guessed `incentive` scores were dropped in round 11) |

Common fields inside a series:

| field | meaning |
|---|---|
| `years`, `years_lo`, `years_hi` | middle, low, high per year 2021–2026, EUR bn (2026 = January–August). Refugee hosting (`refugee_years*`) is floored on running totals, so in a single year the low can be above the middle (42 cases); every running total is ordered, which is what check 4 tests |
| `base`, `base_range` | pre-war level at pre-war prices, and its range |
| `base_2019_2021_avg` | the old 2019–2021 average, kept where `counterfactual()` reset `base` to 2021 |
| `pidx`, `pidx_lo`, `pidx_hi` | price level per year, 2019–2021 = 1 ([prices](../method/prices.md)) |
| `bmul`, `bmul_lo`, `bmul_hi` | expected path against `base`, 1 = flat ([counterfactual](../method/counterfactual.md)) |
| `cf` | which counterfactual model: `lin`, `rf` or `rw` |
| `cb` | cumulative no-war band per number of years summed, `[low, high]` multipliers ([counterfactual](../method/counterfactual.md)) |
| `est26` | 2026 estimated from 2025 (shown with `*`) |
| `cert`, `src` | certainty letter, source ids (keys of `sources`) |

## Checks

[`pipeline/check_data.py`](../../pipeline/check_data.py) prints PASS, WARN or FAIL per check; any FAIL exits non-zero. (Numbering in the file skips 10.)

| # | check | type |
|---|---|---|
| 1 | EU aid split adds up to the EU institutions' total (within 2%) | FAIL |
| 2 | aid from one source per country (Kiel or gap research) | FAIL |
| 3 | aid total matches Kiel (within 3%) | WARN |
| 4 | every range ordered low ≤ middle ≤ high | FAIL |
| 5 | ERA loans not counted as a cost | FAIL |
| 6 | money flowing back stays within the money that reached Ukraine plus replacement purchases (all-money ledger) | FAIL |
| 7 | Hong Kong gold not double counted | FAIL |
| 8 | undisclosed aid plausible next to Kiel military aid | WARN |
| 9 | payments to Russia cover CREA fossil fuel (≥ 80%) | WARN |
| 11 | Moldova refugee cost adjusted for donor funding | WARN |
| 12 | price levels set against 2019–2021 | FAIL |
| 13 | transit gas counted where used | FAIL |
| 14 | re-export shares add up to one | WARN |
| 15 | refined exports counted once (Turkey, India) | FAIL |
| 16 | every baseline inside its range, no range bound from a projected trend | FAIL |
| 17 | aid categories add up to aid (within 5%) | WARN |
| 18 | no negative laundered oil | FAIL |

## See also

- [research-files.md](research-files.md): every research input and the step that uses it
- [sources.md](sources.md): the external sources behind them
- [method/overview.md](../method/overview.md): what the site does with `data.json`
- [Documentation index](../README.md)
