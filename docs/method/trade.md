# Goods trade with Russia and Ukraine

Goods trade is the largest part of the map for most countries: what each country bought from and sold to Russia and Ukraine, 2019 to August 2026. This page covers where the numbers come from (UN Comtrade, IMF, Eurostat, mirror data, official statements for non-reporters), how the pipeline moves value to the country where it really belongs (re-export hubs, the Baltic pass-through, Hong Kong gold, Russia's unexplained imports), why freight is taken out of import values, why sales count as profit rather than revenue, and how the sanctions label splits a cut into "required" and "own choice". Energy-specific steps (transit gas, laundered oil) are on [energy-and-laundered-oil.md](energy-and-laundered-oil.md).

## Sources and filling order

Base file: [`trade_full.json`](../../research/2026-10/gaps/trade_full.json) ([notes](../../research/2026-10/gaps/trade_full-notes.md)), 233 economies, four flows (`imports_from_RUS`, `exports_to_RUS`, `imports_from_UKR`, `exports_to_UKR`), 2019–2025 plus 2026 January–August. It extends the first-round [`trade.json`](../../research/2026-10/trade.json) ([notes](../../research/2026-10/trade-notes.md)).

Values are taken in this order, and the `basis` field records which was used:

1. **reported**: the country's own customs report (UN Comtrade; Eurostat Comext for EU 2024–2026), certainty A;
2. **mirror**: Russia's or Ukraine's report on the same flow, divided by the median mirror/reported ratio (imports from Russia 0.847, exports to Russia 1.320, imports from Ukraine 0.810, exports to Ukraine 1.388; these reflect CIF/FOB valuation and origin attribution), certainty B;
3. **imf**: IMF IMTS, spliced to the Comtrade level; rejected when its implied growth is outside the 5–95th percentile of reporters (65 values rejected), certainty B;
4. **estimated**: interpolation or the median growth of reporting countries, certainty C.

Russia publishes no partner detail after 2021, so trade with Russia from 2022 is always what the other country reports. 2026 uses Comext January–August for the EU, IMF monthly data elsewhere, and otherwise the 2025 rate × 8/12 (marked `*`, see [ranges.md](ranges.md#2026-and-the--mark)).

In the pipeline ([build_data.py `build()`](../../pipeline/build_data.py), first section) better data replace these values at customs level, so every later step applies to them too:

- [`narrow.json`](../../research/2026-10/gaps/narrow.json) ([notes](../../research/2026-10/gaps/narrow-notes.md)): official statistics for countries with the widest ranges (Belarus Union State and Belstat totals, Kazakhstan, Kyrgyzstan, Armenia, Uzbekistan, Georgia, Turkey, Moldova and others);
- [`round4b.json`](../../research/2026-10/gaps/round4b.json) ([notes](../../research/2026-10/gaps/round4b-notes.md)) for the UAE: its customs totals, which equal the official non-oil trade with Russia (USD 20.4bn in 2025); applied after `narrow.json`.

**Non-reporters.** [`nonreport.json`](../../research/2026-10/gaps/nonreport.json) ([notes](../../research/2026-10/gaps/nonreport-notes.md)) corrects 21 partners that do not report (Libya, Venezuela, Syria, Turkmenistan, Tajikistan, Afghanistan, Cuba, Sudan, Yemen, North Korea, Iran, Lebanon and others) with tanker tracking (CREA, Kpler), official statements and partner customs. Only the **paid share** of Russian supplies counts as money to Russia (`paid_share`); supplies on credit, as aid or barter are Russian support, not payments.

## The pre-war level and the comparison

The trade loop stores `base` (initially the 2019–2021 average) and `base_range` (the extremes of the 2019–2021 average and the low/high baselines). For every flow in [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json), [build_data.py `counterfactual()`](../../pipeline/build_data.py) then resets `base` to 2021 at pre-war prices and sets the expected path `bmul`. Details: [counterfactual.md](counterfactual.md).

How the four flows enter the net shift (`calc()` in [`site/index.html`](../../site/index.html)):

| flow | part | counted as |
|---|---|---|
| `to_rus` | Less / more paid to Russia | full change in volume at pre-war prices |
| `from_rus` | Profit lost on sales given up / profit on extra sales | change × 20% margin |
| `buy_ukr` | Extra purchases from Ukraine | rise above expected, each year, full value; a fall is not held against a country |
| `sell_ukr` | Extra sales to Ukraine | rise above expected, × 20%, subtracted as flowback |

## Profit, not revenue

Selling EUR 10bn less to Russia does not cost the seller EUR 10bn: the goods would have cost money to make. Since round 4, sales given up and extra sales (goods and services) count as the seller's **profit**, `META.lost_margin = 0.2` (about 20%), the same share used for flowback. `profit3()` in `calc()` applies it with a range of 0.5× to 1.5× the margin. The audit had shown why this matters: Cyprus at +30% of GDP and Lithuania at +45% came from sales and services counted at gross revenue ([audit2-notes.md §5](../../research/2026-10/gaps/audit2-notes.md)). In the cost view, the same 20% is the "profit lost on sales to Russia".

## Re-export hubs

Goods made in China or the EU and sold on to Russia through Armenia or the UAE should count for the country that made them, not for the hub. [build_data.py `apply_reexports()`](../../pipeline/build_data.py) uses [`reexports.json`](../../research/2026-10/gaps/reexports.json) ([notes](../../research/2026-10/gaps/reexports-notes.md)) for 11 hubs: UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan, Georgia, Uzbekistan, Azerbaijan, Serbia, Mongolia, Tajikistan.

- **Goods to Russia**: the re-exported part of the hub's exports to Russia moves to the origin countries (`origin_shares`; "EU27" split by members' own sales to Russia). The hub keeps its trading margin (goods 5–20%, UAE 3–15%; an educated guess).
- **Russian goods passed on** (gold and diamonds mostly): move from the hub's payments to Russia to the first buyers (`destination_shares`; UAE gold buyers from importers' records: Hong Kong 30%, India 19%, Switzerland 15%, Turkey 14%). Gold margin 0.3–6%.
- **Measured shares** ([`refine.json`](../../research/2026-10/gaps/refine.json), [notes](../../research/2026-10/gaps/refine-notes.md)) replace the first guesses: Armenia 0.86–0.92, Kazakhstan 0.77–0.84, Kyrgyzstan 0.60–0.77, Turkey 0.31–0.36, Uzbekistan 0.61–0.83, Azerbaijan 0.36–0.43, Serbia 0.37–0.48.
- **UAE 2024–2026** re-exports and gold passed on are raised to match its customs totals (`round4b.json`).
- **The pre-war level moves the same way**: `reexports_to_RUS_baseline_2019_2021` comes out of the hub's base and into the origins'; since the counterfactual starts from 2021, the pre-war re-exports are also taken out of the hubs' 2021 values.

Hubs are labelled on the map (`hub` field). Their trade keeps the 2021 level as the counterfactual ([counterfactual.md](counterfactual.md#6-which-model-is-used-for-which-flow)). **Not yet moved**: Belarus's re-exports to Russia (goods from China, Turkey and the EU inside its official exports, EUR 0.3–1.9bn a year by `round4b.json`), see [limitations.md](../limitations.md).

## Baltic and Finnish pass-through

Before the war much of the Baltic states' trade with Russia was transit: Estonia's oil entrepôt at Muuga, Latvian steel, Lithuanian re-exports (85–90% of its sales to Russia). Counting that as "given up" made Lithuania +45% of GDP. [build_data.py `baltic_transit()`](../../pipeline/build_data.py), from [`audit2.json`](../../research/2026-10/gaps/audit2.json) question 6:

- takes the unprocessed transit share out of the imports from Russia of Estonia, Latvia, Lithuania and Finland, before and after the war alike;
- takes re-exports out of their sales to Russia (Lithuania 0.85, Estonia 0.39, Latvia 0.45, Finland 0.10) and gives them to the EU members that made the goods, by their own sales to Russia; a 7% margin stays;
- leaves crude refined in Lithuania and Finland (real processing).

## Residual gap

Russia's own customs record more imports than its partners report selling: EUR 29–46bn a year in 2022–2025 ([`residual.json`](../../research/2026-10/gaps/residual.json), [notes §2](../../research/2026-10/gaps/residual-notes.md)). [build_data.py `apply_residual()`](../../pipeline/build_data.py) splits it:

| component (EUR bn) | 2022 | 2023 | 2024 | 2025 | where it goes |
|---|---|---|---|---|---|
| CIF/FOB valuation | 13.3 | 14.5 | 14.3 | 13.6 | not allocated |
| unrecorded transit via Kyrgyzstan | 3.2 | 5.8 | 6.7 | 8.6 | country of origin |
| unrecorded transit via Kazakhstan | 0.6 | 1.1 | 4.2 | 2.9 | country of origin |
| residual, pro rata | 11.3 | 15.7 | 14.9 | 20.7 | each country by its reported sales; hubs pass their re-exported share on to origins |

**Belarus is excluded**: it reports its full trade with Russia through Union State totals, so its pro-rata share is spread over the other countries ([`round4b.json`](../../research/2026-10/gaps/round4b.json) §3). The structural pre-war gap (about EUR 6bn a year) is no longer added to 2022–2026 only (audit 2, question 4). The added value is in `from_rus`, certainty at best C, and its 2026 is estimated (`est26`).

## Hong Kong gold

98% of Hong Kong's imports from Russia are precious metals. The share passed on to mainland China (0.57 in 2022 falling to 0.37 in 2025, from Hong Kong's own gold trade in `refine.json`) counts for China; only the rise above the pre-war level is treated as gold in transit. Hong Kong is labelled a gold transit hub. Code: the end of `apply_residual()`.

## Gold and hidden channels

"Gold and hidden payments to Russia" holds money that appears nowhere in customs data ([`uncovered.json`](../../research/2026-10/gaps/uncovered.json) `hidden_channels`, [notes §2](../../research/2026-10/gaps/uncovered-notes.md), certainty D): Kyrgyzstan's gold gap (partners record 16–52 t a year more than Kyrgyzstan exports; 0/25/75% assumed Russian), Hong Kong's 2026 gold, and high-band margins for China, Turkey, Kazakhstan, Armenia and India. UAE gold is in its customs data and is zero here (audit 2). Kyrgyzstan's hidden gold is passed on to the buyers of Kyrgyz gold ([`kgz_gold.json`](../../research/2026-10/gaps/kgz_gold.json), UN Comtrade HS 7108 imports from Kyrgyzstan 2023–2024: Switzerland 37%, China 33% with Hong Kong, UK 15%, UAE 11%); Kyrgyzstan keeps 5%. Crypto and payment agents are not added: they mostly pay for trade that customs already record, and no source splits them by country.

## Freight: CIF to FOB

Import values include freight and insurance (CIF). That part is paid to shippers and insurers, and is counted for them in [shipping](services-shipping-companies.md#shipping) and services, not for Russia. [build_data.py `remove_freight()`](../../pipeline/build_data.py) takes `CIF_SHARE = 3.5% / 5.5% / 7.5%` (low/middle/high) out of every country's payments to Russia, yearly values and baseline alike, except for the share priced at the Russian border (pipeline gas and crude, electricity, overland trade; `BORDER_PRICED` from audit 2, question 7).

## Smaller corrections

- **Denmark** sales to Russia sit between Danish and Eurostat data (×1.34, range 0.98–1.9), baseline scaled the same way (`apply_audit()`, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md)).
- **Data artefacts** in small countries (`fix_artefacts()`, `round4b.json` §4): Lebanon's baseline leaves out 2019 (fuel bought for smuggling into Syria); Mauritania's pre-war "Russian" fuel was traders' origin labels; Saint Lucia's and Bonaire's Russian fuel went to storage terminals; Botswana's rough diamonds were bought for resale; Seychelles shipping managers are fronts; Malta's suppressed services data are filled; Gibraltar keeps a 10% margin on bunker fuel ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#hub-resale-chain)).
- **Dual-use goods** are inside recorded sales to Russia and are not added again (China's recorded dual-use exports EUR 4.5–5.8bn a year; [`china_military-notes.md`](../../research/2026-10/gaps/china_military-notes.md)).

## Sanctions-mandated or own choice

A label only; totals do not change. [`sanctions_share.json`](../../research/2026-10/gaps/sanctions_share.json) ([notes](../../research/2026-10/gaps/sanctions_share-notes.md)) estimates, for 42 economies applying EU-style or own sanctions, which share of each cut was required by bans (parsed from 19 consolidated versions of [Regulation (EU) 833/2014](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0833) and national regimes). The pipeline (end of `build()`) sums the mandated euros over the years and divides by the map's own fall: `sanctions[flow] = {mandated, gas}`, where `gas` is the share of the import fall that was natural gas. Gas was not sanctioned before 2026, but much of the gas cut was Russia's (Gazprom's cut-offs in 2022) or the end of Ukrainian transit (1 January 2025), not the buyer's choice; the panel says so (`sanctionNote()` in [`site/index.html`](../../site/index.html)).

## See also

- [counterfactual.md](counterfactual.md): the expected level for each flow
- [prices.md](prices.md): the price levels used for goods
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, fuel hubs, refiners
- [aid-refugees-military.md](aid-refugees-military.md#flowback): flowback and sales to Ukraine
- [reference/sources.md](../reference/sources.md#trade): trade data sources
- [Documentation index](../README.md)
