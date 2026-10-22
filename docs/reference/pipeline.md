# Building the data: pipeline, data.json and checks

Everything the map shows comes from one file, `site/data.json`, built by one script, [`pipeline/build_data.py`](../../pipeline/build_data.py), from the research files in [`research/2026-10/`](../../research/2026-10/README.md). The site then computes every part, range and total in the browser with `calc()` in [`site/index.html`](../../site/index.html). This page explains how to run the build, the order of the build steps (order matters: each step works on what earlier steps produced), the shape of `data.json`, and the checks that guard against double counting.

## How to build

```sh
./setup.sh                                  # uv sync + pre-commit hooks (run once, first)
uv run python pipeline/loan_rates.py        # only after changing a loan input: rewrites loans_value.json (round 12)
uv run python pipeline/build_data.py        # research/ -> site/data.json and research/2026-10/gaps.md
uv run python pipeline/check_data.py        # checks; exits non-zero on any FAIL
cd site && python3 -m http.server 8000      # open http://localhost:8000
node pipeline/share_cards.mjs               # optional: share images and a page per country
node pipeline/browser_check.mjs             # optional, also run by check_data.py (check 32): the page in a real browser matches the model
```

- [`setup.sh`](../../setup.sh) runs `uv sync` and `uv run pre-commit install`. The hooks ([`.pre-commit-config.yaml`](../../.pre-commit-config.yaml)) check whitespace, YAML and JSON, file size (2 MB) and run `ruff` and `ruff-format` (line length 120, [`pyproject.toml`](../../pyproject.toml)). Python 3.12+, one dependency: `pycountry`.
- `build_data.py` writes `site/data.json` (compact JSON, about 1.4 MB) and `site/detail.json` (the per-part coverage notes, loaded after the map), regenerates [`research/2026-10/gaps.md`](../../research/2026-10/gaps.md) (`write_gaps_report()`), and prints the number of entries and sources.
- [`share_cards.mjs`](../../pipeline/share_cards.mjs) needs Node 18+ and Playwright. It serves `site/`, opens the map in Chromium and renders one 1200×630 preview card per country (`site/share/<iso>.png`), a page per country (`site/c/<iso>.html`) whose link preview shows that card, and a world card. It uses the map's own calculations, so cards always match the map. Both output folders are git-ignored.
- **Deploy**: [`.github/workflows/pages.yml`](../../.github/workflows/pages.yml) runs on pushes to `main`: installs Playwright 1.48.2, runs `share_cards.mjs` and publishes `site/` to GitHub Pages. It does not rebuild `data.json`; the committed file is what goes live.

## Build order

`build()` runs these steps in order. Inline sections are part of `build()`; named functions are defined further down in [`build_data.py`](../../pipeline/build_data.py). The method page for each step is linked.

Two things apply to every step:

- **Round-7 actual values.** `load()` reads each research file through `_actuals_r7()`, which puts in the narrower values from `actuals_r7.json` for the inputs they replace. So they are applied once, before any step uses them ([trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-narrower-actual-values-round-7)).
- **Crude share of laundered fuel (round 9).** `crude_k(year, refiner)` gives the Russian crude per euro of fuel made from it (low, central, high), from `crude_content.json`. With no refiner it is the refiners' average, weighted by their fuel exports. It is used by `reassign_laundered_oil()` (step 8), the refiner step (step 11), `apply_laundered_eu()` (through `eu_k_factor()`) and `apply_brunei_r6()`, so buyers and refiners use the same ratio ([energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-valuing-and-capping)).

| # | function | what it does | explained in |
|---|---|---|---|
| 1 | customs layer (inline) | loads `trade_full.json`; puts `narrow.json` official data, actual January–August 2026 trade (`refresh_2026.json`) and the UAE's own customs totals (`round4b.json`) in at customs level | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-sources-and-filling-order) |
| 2 | population and GDP (inline) | `other.json`: 2024 GDP and population; at the end of the build `gdp_average()` replaces GDP with the 2022–2024 average (`gaps/gdp_avg_r15.json`, round 15) and keeps `gdp_2024` | [overview](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-overview) |
| 3 | trade (inline) | four flows per country with ranges, certainty from `basis`, `base` (2019–2021 average) and `base_range`; `est26` where 2026 is estimated | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade) |
| 4 | non-reporters (inline) | `nonreport.json`; only the paid share of Russian supplies counts | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-sources-and-filling-order) |
| 5 | aid (inline) | Kiel donors, ERA loans out, EU-level aid split by budget share, `aid_gaps.json` for the rest | [aid](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-aid) |
| 6 | refugees (inline) | `refugees.json`, minus donor-paid shares (`flowback2.json`) | [refugees](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-refugees) |
| 7 | energy (inline) | premium and discount; transit gas swap at own gas prices; max(customs, fossil) for pipeline-gas countries; laundered oil; GDP from `residual.json` for the cap | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil) |
| 8 | `reassign_laundered_oil()` | hub resale chain (`pass_on()`), crude share (`crude_k()`), GDP cap, pre-war laundered level through the same chain, Gibraltar margin | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-hub-resale-chain) |
| 9 | `apply_laundered_eu()` | laundered oil of EU members, the USA, the UK and Australia from customs records of fuel by origin (`laundered_eu.json`) | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 10 | `apply_laundered_r6()` | fuel from Brunei's refinery and fuel relabelled in Turkish ports added to the buyers, taken off Türkiye and Brunei (`laundered_r6.json`) | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 11 | refiners (inline), `eu_refiner_exports()` | exported crude of Turkey, India, China out of their own payments, at each refiner's `crude_k()`; EU refiners' exported crude charged to their 2021 buyers (round 13), held at the expected level from 2023 where the buyer's post-war route is not measured (round 13b) | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-refiners-counted-once) |
| 12 | company taxes (inline) | `companies_all.json`, then profit tax + half of other taxes and the 2018–2021 base (`round4a.json`); round-6 revision (`company_taxes_r6.json`) | [companies](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-services-shipping-companies-company-taxes) |
| 13 | services, hidden, undisclosed, private (inline) | `uncovered.json`; Kyrgyz hidden gold passed to its buyers (`kgz_gold.json`) | [services](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-services-shipping-companies-services), [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-gold-and-hidden-channels) |
| 14 | flowback (inline) | own-industry shares, PURL, EU-level military aid (later replaced by step 39, which also clears these steps' sources) | [flowback](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-flowback) |
| 15 | military support to Russia (inline) | North Korea, Iran, Belarus revalued (`military_rus_r6.json`); China's unrecorded part; people counts | [military](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-round-6-revision) |
| 16 | `apply_shipping()` | tanker income as profit, by who really controls each tanker (`shadow_fleet_r6.json`); overlap with services removed | [shipping](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-services-shipping-companies-shipping) |
| 17 | `apply_reexports()` | hub re-exports to origin countries, Russian goods to final buyers; Belarus re-exports (`belarus.json`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-re-export-hubs) |
| 18 | `apply_residual()` | missing GDP; residual exports gap by origin (Belarus excluded); Hong Kong gold to China | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-residual-gap) |
| 19 | `apply_audit()` | EU Support Loan guarantors, Denmark, refugee budgets for 27 hosts | [aid](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military) |
| 20 | `fix_artefacts()` | Lebanon, Mauritania, Saint Lucia, Bonaire, Botswana, Seychelles, Malta | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-smaller-corrections) |
| 21 | `baltic_transit()` | Baltic and Finnish pass-through out; re-exports to EU makers | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-baltic-and-finnish-pass-through) |
| 22 | sanctions labels (inline) | `sanctions` shares from `sanctions_share.json` and its source `sanctions_share`; `incentives.json` is no longer copied (round 11 audit) | [incentives](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-incentives), [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-sanctions-mandated-or-own-choice) |
| 23 | `remove_freight()` | CIF to FOB on payments to Russia, except border-priced shares; since round 14 also the war-time freight surge on the oil part (`payments_fob_factor()`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-freight-cif-to-fob), [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices-one-price-basis-fob-round-14) |
| 24 | `price_indices()` | `pidx` per flow | [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices) |
| 25 | `apply_narrow()` | narrow.json values, bases and price levels not entered at step 1; Türkiye priced from `turkey_prices.json` | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade) |
| 26 | `apply_brunei_r6()` | Brunei's payments to Russia = its true crude intake minus the crude passed on to its buyers (after step 25 sets its customs values) | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-per-country-values-for-the-eu-usa-uk-and-australia-round-5) |
| 27 | `apply_relocants()` | the share of travel credits spent by Russians who moved abroad comes out of services sold to Russia (`relocants.json`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-remittances-and-relocants-round-7) |
| 28 | `apply_audit2(..., "values")` | UAE gold and fuel, France's undisclosed aid, Russia's import-statistics gap | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade) |
| 29 | `uae_fuel_net()` | UAE fuel addition net of what UAE customs record | [energy](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-energy-and-laundered-oil-payments-to-russia-for-fuel) |
| 30 | `war_windfall()` | price windfall on Russian fuel, against no-war prices (`energy_nowar.json`) | [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices-war-time-windfall) |
| 31 | `pre_war_trends()` | `trend.json` and `trend2.json` multipliers (all flows) | [counterfactual](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-counterfactual) |
| 32 | `counterfactual()`, `power_of_siberia()` (round 15: China's contracted pipeline ramp-up) | back-tested multipliers and 2021 base for covered flows, cumulative bands (`cf_bands.json`, `ua_trade_cf.json`, `to_rus_cf.json`, `fuel_volume_cf.json`, `belarus.json`); replaces step 31 there | [counterfactual](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-counterfactual) |
| 33 | `apply_weapons_value()` | donated weapons at market value, stored as yearly corrections (`weapons_value.json`) | [aid](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-donated-weapons-at-market-value-round-5) |
| 34 | `apply_state_finance()` | Rosatom nuclear projects and Russia's state loans (`russia_state_finance.json`) | [Russia](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia) |
| 35 | `apply_company_flows()` | exit payments to Russia and profits sent home by Russian-owned companies abroad (`company_flows.json`; metals, mining and chemicals plants from `russian_owned_r10.json`) | [Russia](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-russia-state-and-companies-companies-leaving-russia) |
| 36 | `apply_refugees_net()`, `aggressor_refugees()` | refugee hosting at net cost: cost minus the taxes refugees pay (`refugees_net.json`); since round 15 every host on the all-government definition (`REFUGEE_SCOPE`) and Belarus's cost moved to the label `ref_excluded` | [refugees](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-refugees) |
| 37 | `apply_ua_arms_purchases()` | arms Ukraine bought abroad, as flowback to the seller (`ua_arms_purchases.json`) | [flowback](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-arms-ukraine-bought-abroad-round-5) |
| 38 | `apply_loans_value()` | loans and guarantees at their value to Ukraine and, for the cost view, at the lender's cost (`loans_value.json`, values per loan item from `loan_rates.py`, round 12) | [loans](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-loans) |
| 39 | `apply_money_ledger()` | every euro that reached Ukraine assigned to the economy where it was spent; replaces the earlier flowback (`money_ledger.json`) | [flowback](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-aid-refugees-military-round-6-the-all-money-ledger) |
| 40 | `apply_russian_arms()` | payments to Russia for Russian weapons against the no-war level (`russian_arms_exports.json`, `arms_r6.json`) | [Russia](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia) |
| 41 | `apply_payment_agents()` | fees kept by payment agents settling Russia's trade (`payment_channels.json`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-payment-agents-round-6) |
| 42 | `apply_frozen_reserves()` | the return Russia's frozen central-bank reserves would have earned (`frozen_assets.json`) | [Russia](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves-round-7) |
| 43 | `apply_remittances()` | migrant workers' remittances from Russia against the expected level, as a marker only since round 13b (`remittances.json`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-remittances-and-relocants-round-7) |
| 44 | `apply_chpl()` | sales of goods Russia's weapons need, as a marker only (`chpl.json`) | [trade](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker-round-7) |
| 45 | `apply_value_kept()` | since round 13 the seller's net gain (`net_gain_sellers.json`; round 14: 5% real normal return plus the country's risk premium) x genuinely extra, per kind of earning (`value_kept.json`); value kept x extra kept as `vk_old` | [overview](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-overview-the-net-gain-rule-round-10) |
| 46 | `apply_audit2(..., "trends")` | audit-2 trend-window fixes, only for flows without a counterfactual | [counterfactual](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-counterfactual) |
| 47 | `apply_nowar_prices()` | fuel volume change valued at no-war prices, so it and the windfall add up (`energy_nowar.json`) | [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices-no-war-prices-round-7) |
| 47b | `laundered_volumes()`, `current_euros()`, `deflate_gold()` | laundered oil as volumes; round 14: each flow's factor to current euros (`cur`); gold at the gold price | [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices-why-volumes) |
| 48 | `apply_net_gain()` | trade counts at the seller's net gain: weights per year for Russia's and Ukraine's gain (`net_gain_russia.json`, `net_gain_ukraine.json`); round 14: the measured fuel share and customs values per fuel for what was bought | [overview](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-overview-the-net-gain-rule-round-10), [prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices-the-mix-of-what-was-bought-round-14) |
| 49 | `attach_r11_sources()` | one source per round-11 proposals file, added to the series each file changed | [decisions](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=cl-r11) |
| 50 | `attach_input_sources()` | inputs that feed a part but were not cited by it: gas prices on payments to Russia and the windfall, tanker control on shipping (round 11 audit) | [sources](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how) |
| 51 | final pass (inline) | every baseline inside its range; `coverage()` per part; the exact primary links from `sources_r11.json` (`links`); `prune_sources()` drops sources no part cites; status banner | [ranges](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-ranges) |

## data.json in brief

Top level: `generated`, `data_to` (2026-08-31), `years` (2021–2026), `frac` (`[1, 1, 1, 1, 1, 0.6667]`), `meta` (`tariff_rate` 0.002, the round-11 weighted duty rate; `lost_margin` 0.2, only a fallback), `status_html`, `sources` (id → name, url, date, note, and `links`: the exact primary or secondary links from [`sources_r11.json`](../../research/2026-10/sources_r11.json), each `{title, url, kind}`; only sources that a part cites), `countries` (by ISO3), `included_in` (territories shown with another country's figures: Liechtenstein, Monaco, Isle of Man, Puerto Rico, US Virgin Islands, Saint Martin).

Per country: `n` (numeric ISO for the map shapes), `iso3`, `name`, `kind`, `pop`, `gdp`, optional `hub`, `tariff_waiver`, `eu_share` and `dual_use_note` (China), and series objects. The coverage notes per part are in `site/detail.json` (`coverage` by ISO3), not in `data.json`.

| key | content |
|---|---|
| `to_rus`, `from_rus`, `buy_ukr`, `sell_ukr` | goods trade; `to_rus` also holds `laundered*`, `paid_share`, `nowar_prices` and `nrl`/`nrh` (the no-war price's range, as factors on the expected path) |
| `to_rus.gain`, `buy_ukr.gain` | the seller's net gain per euro (round 10): weights per year as `[low, central, high]`; in `to_rus.gain`, `e` is for what was expected without the war (the 2019–2021 mix) and `a` for what was bought (that year's mix) |
| `to_rus.laund_gain`, `svc_bought.gain` | Russia's gain on crude in laundered fuel (`e` for the pre-war level, `a` for what was bought, with relabelled Russian products at the products gain) and on services, per year `[low, central, high]` |
| `svc_bought`, `svc_sold`, `shipping` | services and tanker income; `svc_sold.relocants_out` marks that relocants' spending was taken out |
| `aid` | `years`, `cats`, `loans_face`, `loans_grant_eq` (with `loans_grant_eq_lo`, `loans_grant_eq_hi` since round 12), `loans_value_ukraine`, `loan_adj_own`, `loan_adj_eu`, `weapons_mv`, `era_excluded`, `pledged_open`, `eu_years`, `eu_share`, `eu_src` (sources of the EU-level aid part), `refugee_years*`, `refugee_gross`, `refugee_donor_share`, `refugee_cert`, `refugee_src` |
| `energy` | `premium*`, `discount*` |
| `laund` | laundered oil with its pre-war level and growth; since round 13 in volumes (`pidx`: the Urals price over the no-war crude price; `bmul` includes the no-war crude price), and `eu_refined` lists the EU refiners whose fuel it bought; `eu_route_held` (round 13b) marks a buyer whose post-war route is not measured, so the EU-refined route's 2023–2026 values are held at the expected level |
| `extra` | parts with no series of their own, each `{k, label, c, l, h, cert, src}` as yearly shifts toward Ukraine: `statefin`, `exits`, `rusfirms`, `multilat`, `rusarms`, `agents`, `frozen`, `remit`; `alt` (round 13) holds the central series under the old rule for `agents` and `remit` |
| `chpl` | sales to Russia of goods its weapons need: a marker, not in the totals |
| `remit` | migrants' remittances from Russia (round 13b): a marker, not in the totals; `years*` the change against the expected level, `sent` what migrants sent from Russia, per year |
| `vk` | net gain x genuinely extra (round 13; value kept x genuinely extra before), `[low, central, high]` per kind of earning (`fw`, `fo`, `rl`, `rx`, `ux`, `sl`, `sx`, `sh`, `ag` payment agents, `in` insurance) |
| `vk_old`, `ng_own` | the round-6 products (value kept x genuinely extra), for the method band; whether the country has its own OECD STAN figures |
| `company` | `taxes*`, `staying`, `left`, `base_2018_2021` |
| `windfall` | price windfall on Russian fuel against no-war prices, yearly triple, at Russia's net gain on the extra price (`gain` per year; `alt` the full value) |
| `military_rus`, `hidden`, `undisclosed`, `private` | yearly triples, in money (`hidden.gain`: Russia's gain on gold per year, applied in the map); `military_rus` since round 13 paid deliveries at the seller's net gain, `alt` the full value |
| `flowback` | from the all-money ledger: `own*`, `purl_in*`, `arms*`, `othsp*` (other spending), `purl_out`, `cert_own`, `arms_cert`, and sources `src`, `purl_src`, `arms_src` |
| `people`, `sanctions` | counts, sanctions labels (`mandated`, `gas`, and since round 13 `cut`: gas Russia cut off itself or that stopped with the end of transit; since round 14 `cut_from`, the date of the cut) (the AI-guessed `incentive` scores were dropped in round 11) |
| `to_rus.gain` | Russia's gain per euro, `e` (expected) and `a` (bought), `[low, central, high]` per year; since round 14 `fossil_share` (the measured pre-war fuel share used), `basis` (customs, tracker or pre-war mix, per year) and `tracker_copied` (tracker years that repeat the year before) |
| `extra` | parts without a series: `frozen`, `rusfirms`, `statefin`, `rusarms`, `agents`... as yearly shifts toward Ukraine `c`, `l`, `h` (`exits` until round 14, `seized` in round 14) |
| `taken` | round 14b: what Russia took from the country's companies, `exits` (forced discount and exit fee) and `seized`, yearly `c`, `l`, `h`, positive = taken; in the cost view only, not in the net or either headline number |

Common fields inside a series:

| field | meaning |
|---|---|
| `years`, `years_lo`, `years_hi` | middle, low, high per year 2021–2026, EUR bn (2026 = January–August). Refugee hosting (`refugee_years*`) is floored on running totals, so in a single year the low can be above the middle (42 cases); every running total is ordered, which is what check 4 tests |
| `base`, `base_range` | pre-war level at pre-war prices, and its range |
| `base_2021`, `base_years` | `to_rus` under the small-flow rule: 2021 at pre-war prices, and 2019, 2020, 2021 at pre-war prices, whose median is `base` (round 16b; `small_flow`). `small_flow_kept_2021` (`refinery` or `mirror`) marks the exceptions that keep 2021; `base_researched` a researched pre-war level kept (Lebanon) |
| `pidx`, `pidx_lo`, `pidx_hi` | price level per year, 2019–2021 = 1 ([prices](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-prices)) |
| `bmul`, `bmul_lo`, `bmul_hi` | expected path against `base`, 1 = flat ([counterfactual](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-counterfactual)) |
| `cf` | which counterfactual model: `lin`, `rf` or `rw` |
| `cb` | cumulative no-war band per number of years summed, `[low, high]` multipliers ([counterfactual](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-counterfactual)) |
| `est26` | 2026 estimated from 2025 (shown with `*`) |
| `cur` | round 14: the factor that values each year's change in volume at that year's prices (current euros, like aid) |
| `cert`, `src` | certainty letter, source ids (keys of `sources`) |

`site/detail.json` holds the data-coverage notes (`coverage`) and, since round 14, the method band's rebuilt alternatives (`alts`: per country and alternative, the fields that change; `alt_labels`), built by `method_alternatives()`, which reruns `build()` once per entry of `METHOD_ALTERNATIVES`.

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
| 19 | fuel mix at constant prices (round 13; since round 14 the copy buys the same customs volumes too) | FAIL |
| 20 | remittances only as a marker, in no total (round 13b) | FAIL |
| 21 | EU refiners' route measured for EU members: none held (round 13b) | FAIL |
| 22 | the net-gain step uses the measured fuel share, `fossil_share()` (round 14, audit C1) | FAIL |
| 23 | the windfall compares FOB with FOB: the median war/pre-war ratio of own crude prices to Urals FOB is within 0.94–1.06, and no FOB factor exceeds 1 (round 14, audit C3) | FAIL |
| 24 | share cards say "cut off by Russia" only where Russia cut the country's gas, and North Korea's never says "more paid" (round 14, audit C4); WARN when `site/c/` has not been generated | FAIL |
| 25 | seizures and forced exits not in the totals, only in the cost view (round 14b) | FAIL |
| 26 | no refugee credit for Russia (no entry) or Belarus (its hosting only as the label `ref_excluded`) (round 15) | FAIL |
| 27 | % of GDP divides by the average 2022–2024 GDP (`gdp_avg_r15.json`); `gdp_2024` kept (round 15) | FAIL |
| 28 | China's no-war imports carry the contracted Power of Siberia ramp-up (round 15) | FAIL |
| 29 | ranking rule: `uncertain()` agrees with the rule written out again in `site_numbers.mjs` (range and every method-band alternative keep the sign) for every country and number, and every headline ranking passes its number to `rankList()` (round 15); WARN without node | FAIL |
| 30 | figures tagged in the docs (`<!-- n:ISO.quantity -->`) match the map's model on `data.json` (`check_docs_numbers.py`, round 15); WARN without node | FAIL |
| 31 | the map opens with the net; the views are net, support, payments and cost, in that order, each with a ranking; no To Ukraine or To Russia button; old links `lens=change`, `ukr` and `rus` open the net, support and payments (round 15) | FAIL |
| 32 | the page in a real browser (Chromium via Playwright) shows the same method bands, "direction uncertain" flags, grades, Ranking-view countries and dotted map countries as the Node model with every method-band alternative loaded (`browser_check.mjs`, round 16, review 5 C2); WARN without node or Playwright | FAIL |
| 33 | Hong Kong's Russian gold counted once: the share passed to mainland China plus the share exported elsewhere never exceed what Hong Kong imported, and the destination shares add up to one (`hk_gold_r16.json`, round 16) | FAIL |
| 34 | Russian money frozen only in the net: `OWN_LINE` holds `frozen`, trade with Russia is built from `RUS_PART`, and the world total from the `paid` part only (round 16) | FAIL |
| 35 | refugee spending flowing back stays small: the hosting-weighted factor is between 1% and 5% (round 16) | FAIL |

**Figures in the docs (round 15).** A headline figure quoted in the site's long-form text (`site/content/`, round 23) is followed by a tag naming the country and quantity, for example `+1.89%<!-- n:POL.ua -->` (support for Ukraine), `n:DEU.net2025` (the net for 2022–2025), `n:DEU.alt_p26.rus` (a method-band alternative) or `n:WORLD.less`. [`pipeline/check_docs_numbers.py`](../../pipeline/check_docs_numbers.py) computes every quantity with the map's own model ([`pipeline/site_numbers.mjs`](../../pipeline/site_numbers.mjs), which runs the "Model" section of `site/index.html` in node) and fails when a tagged figure differs by more than half a unit of its last digit. Run it on its own with `uv run python pipeline/check_docs_numbers.py`; `check_data.py` runs it as check 30. Tag every new headline figure you write.

**The browser check (round 16).** Review 5 found that the live page computed the "direction uncertain" marks, the rankings and the grades before `detail.json` (the method band's rebuilt alternatives) had loaded, and kept them, while checks 29 and 30 run in Node where the alternatives are always there. [`pipeline/browser_check.mjs`](../../pipeline/browser_check.mjs) serves `site/` locally (delaying `detail.json` by 1.5 s, as on a slow line), opens the page in Chromium as a reader does, waits until it marks itself ready (`body[data-ready]`), and compares with [`site_numbers.mjs`](../../pipeline/site_numbers.mjs): for every economy the band and flag of each headline number and its letter, then, for the net, support and payments views, the countries in the Ranking view and the countries marked uncertain on the map (grey since round 17, dotted before), and that the small economies take the lightest colour of their direction, or the neutral grey when their direction is uncertain. It exits 1 on any difference. Run it after `build_data.py` with `node pipeline/browser_check.mjs` (needs Node 18+ and Playwright: `npm i -g playwright` and a Chromium, or `PLAYWRIGHT_CHROMIUM=/path/to/chrome`); `SITE_DIR=/path/to/site` checks another copy, for example an older build. `check_data.py` runs it as check 32 when Playwright is installed. On the round-15 page it reports 115 mismatches.

## See also

- [research-files.md](research-files.md): every research input and the step that uses it
- [site.md](site.md): the site's files, addresses and content
- [How it works](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how): the method, the sources, the limitations and the changelog
