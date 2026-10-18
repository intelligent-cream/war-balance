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
- `build_data.py` writes `site/data.json` (compact JSON, about 1.4 MB) and regenerates [`research/2026-10/gaps.md`](../../research/2026-10/gaps.md) (`write_gaps_report()`), and prints the number of entries and sources.
- [`share_cards.mjs`](../../pipeline/share_cards.mjs) needs Node 18+ and Playwright. It serves `site/`, opens the map in Chromium and renders one 1200×630 preview card per country (`site/share/<iso>.png`), a page per country (`site/c/<iso>.html`) whose link preview shows that card, and a world card. It uses the map's own calculations, so cards always match the map. Both output folders are git-ignored.
- **Deploy**: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) runs on pushes to `main`: installs Playwright 1.48.2, runs `share_cards.mjs` and publishes `site/` to GitHub Pages. It does not rebuild `data.json`; the committed file is what goes live.

## Build order

`build()` runs these steps in order. Inline sections are part of `build()`; named functions are defined further down in [`build_data.py`](../../pipeline/build_data.py). The method page for each step is linked.

| # | step | what it does | method |
|---|---|---|---|
| 1 | customs layer (inline) | loads `trade_full.json`; puts `narrow.json` official data, then the UAE's own customs totals (`round4b.json`), in at customs level | [trade](../method/trade.md#sources-and-filling-order) |
| 2 | population and GDP (inline) | `other.json`: 2024 GDP and population | [overview](../method/overview.md) |
| 3 | trade (inline) | four flows per country with ranges, certainty from `basis`, `base` (2019–2021 average) and `base_range`; `est26` where 2026 is estimated | [trade](../method/trade.md) |
| 4 | non-reporters (inline) | `nonreport.json`; only the paid share of Russian supplies counts | [trade](../method/trade.md#sources-and-filling-order) |
| 5 | aid (inline) | Kiel donors, ERA loans out, EU-level aid split by budget share, `aid_gaps.json` for the rest | [aid](../method/aid-refugees-military.md#aid) |
| 6 | refugees (inline) | `refugees.json`, minus donor-paid shares (`flowback2.json`) | [aid](../method/aid-refugees-military.md#refugees) |
| 7 | energy (inline) | premium and discount; transit gas swap at own gas prices; max(customs, fossil) for pipeline-gas countries; laundered oil with the EU correction | [energy](../method/energy-and-laundered-oil.md) |
| 8 | `reassign_laundered_oil()` | hub resale chain (`pass_on()`), crude content, GDP cap, pre-war laundered level through the same chain, Gibraltar margin | [energy](../method/energy-and-laundered-oil.md#hub-resale-chain) |
| 9 | refiners (inline) | exported crude of Turkey, India, China out of their own payments | [energy](../method/energy-and-laundered-oil.md#refiners-counted-once) |
| 10 | company taxes (inline) | `companies_all.json`, then profit tax + half of other taxes and the 2018–2021 base (`round4a.json`) | [companies](../method/services-shipping-companies.md#company-taxes) |
| 11 | services, hidden, undisclosed, private (inline) | `uncovered.json`; Kyrgyz hidden gold passed to its buyers (`kgz_gold.json`) | [services](../method/services-shipping-companies.md#services), [trade](../method/trade.md#gold-and-hidden-channels) |
| 12 | flowback (inline) | own-industry shares, PURL, EU-level military aid by SIPRI share | [flowback](../method/aid-refugees-military.md#flowback) |
| 13 | military support to Russia (inline) | North Korea, Iran, Belarus; China's unrecorded part; people counts | [military](../method/aid-refugees-military.md#military-support-to-russia) |
| 14 | `apply_shipping()` | tanker income as profit, overlap with services removed | [shipping](../method/services-shipping-companies.md#shipping) |
| 15 | `apply_reexports()` | hub re-exports to origin countries, Russian goods to final buyers | [trade](../method/trade.md#re-export-hubs) |
| 16 | `apply_residual()` | missing GDP; residual exports gap by origin (Belarus excluded); Hong Kong gold to China | [trade](../method/trade.md#residual-gap) |
| 17 | `apply_audit()` | EU Support Loan guarantors, Denmark, refugee budgets for 27 hosts | [aid](../method/aid-refugees-military.md) |
| 18 | `fix_artefacts()` | Lebanon, Mauritania, Saint Lucia, Bonaire, Botswana, Seychelles, Malta | [trade](../method/trade.md#smaller-corrections) |
| 19 | `baltic_transit()` | Baltic and Finnish pass-through out; re-exports to EU makers | [trade](../method/trade.md#baltic-and-finnish-pass-through) |
| 20 | incentives, sanctions labels (inline) | copy `incentives.json`; `sanctions` shares from `sanctions_share.json` | [incentives](../method/incentives.md), [trade](../method/trade.md#sanctions-mandated-or-own-choice) |
| 21 | `remove_freight()` | CIF to FOB on payments to Russia, except border-priced shares | [trade](../method/trade.md#freight-cif-to-fob) |
| 22 | `price_indices()` | `pidx` per flow | [prices](../method/prices.md) |
| 23 | `apply_narrow()` | narrow.json values, bases and price levels not entered at step 1 | [trade](../method/trade.md) |
| 24 | `apply_audit2(..., "values")` | UAE gold and fuel, France's undisclosed aid, Russia's import-statistics gap | [trade](../method/trade.md) |
| 25 | `uae_fuel_net()` | UAE fuel addition net of what UAE customs record | [energy](../method/energy-and-laundered-oil.md#payments-to-russia-for-fuel) |
| 26 | `war_windfall()` | price windfall on Russian fuel | [prices](../method/prices.md#war-time-windfall) |
| 27 | `pre_war_trends()` | `trend.json` and `trend2.json` multipliers (all flows) | [counterfactual](../method/counterfactual.md) |
| 28 | `counterfactual()` | back-tested multipliers and 2021 base for covered flows; replaces step 27 there | [counterfactual](../method/counterfactual.md) |
| 29 | `apply_audit2(..., "trends")` | audit-2 trend-window fixes, only for flows without a counterfactual | [counterfactual](../method/counterfactual.md) |
| 30 | final pass (inline) | every baseline inside its range; `coverage()` per part; status banner; sources | [ranges](../method/ranges.md) |

## data.json in brief

Top level: `generated`, `data_to` (2026-08-31), `years` (2021–2026), `frac` (`[1, 1, 1, 1, 1, 0.6667]`), `meta` (`tariff_rate` 0.04, `lost_margin` 0.2), `status_html`, `sources` (id → name, url, date, note), `countries` (by ISO3), `included_in` (territories shown with another country's figures: Liechtenstein, Monaco, Isle of Man, Puerto Rico, US Virgin Islands, Saint Martin).

Per country: `n` (numeric ISO for the map shapes), `iso3`, `name`, `pop`, `gdp`, optional `hub` and `tariff_waiver`, `coverage`, and series objects:

| key | content |
|---|---|
| `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` | goods trade; `to_rus` also holds `laundered*`, `paid_share` |
| `svc_bought`, `svc_sold`, `shipping` | services and tanker income |
| `aid` | `years`, `cats`, `loans_face`, `loans_grant_eq`, `era_excluded`, `pledged_open`, `eu_years`, `eu_share`, `refugee_years*`, `refugee_cert` |
| `energy` | `premium*`, `discount*` |
| `laund` | laundered oil with its pre-war level and growth |
| `company` | `taxes*`, `staying`, `left`, `base_2018_2021` |
| `windfall`, `military_rus`, `hidden`, `undisclosed`, `private` | yearly triples |
| `flowback` | `own*`, `purl_in*`, `purl_out`, `cert_own` |
| `people`, `incentive`, `sanctions` | counts, AI scores, sanctions labels |

Common fields inside a series:

| field | meaning |
|---|---|
| `years`, `years_lo`, `years_hi` | middle, low, high per year 2021–2026, EUR bn (2026 = January–August) |
| `base`, `base_range` | pre-war level at pre-war prices, and its range |
| `base_2019_2021_avg` | the old 2019–2021 average, kept where `counterfactual()` reset `base` to 2021 |
| `pidx`, `pidx_lo`, `pidx_hi` | price level per year, 2019–2021 = 1 ([prices](../method/prices.md)) |
| `bmul`, `bmul_lo`, `bmul_hi` | expected path against `base`, 1 = flat ([counterfactual](../method/counterfactual.md)) |
| `cf` | which counterfactual model: `lin`, `rf` or `rw` |
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
| 6 | PURL paid ≈ received by the US | WARN |
| 7 | Hong Kong gold not double counted | FAIL |
| 8 | undisclosed aid plausible next to Kiel military aid | WARN |
| 9 | payments to Russia cover CREA fossil fuel (≥ 80%) | WARN |
| 11 | Moldova refugee cost adjusted for donor funding | WARN |
| 12 | price levels set against 2019–2021 | FAIL |
| 13 | transit gas counted where used | FAIL |
| 14 | re-export shares add up to one | WARN |
| 15 | refined exports counted once (Turkey, India) | FAIL |
| 16 | every baseline inside its range | FAIL |
| 17 | aid categories add up to aid (within 5%) | WARN |
| 18 | no negative laundered oil | FAIL |

## See also

- [research-files.md](research-files.md): every research input and the step that uses it
- [sources.md](sources.md): the external sources behind them
- [method/overview.md](../method/overview.md): what the site does with `data.json`
- [Documentation index](../README.md)
