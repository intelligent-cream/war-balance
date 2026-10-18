# Türkiye: prices of what it buys from Russia (research 2026-10, round 5)

Gathered 2026-10-18. Output: [`turkey_prices.json`](turkey_prices.json). **No person has reviewed it yet.**

## Why this file exists

The map turns Türkiye's payments to Russia into volumes by dividing by a price index. It also counts the extra money Russia got from higher prices (the war-time windfall). Türkiye is currently skipped from its own measured prices (`PRICES_SKIP = {"TUR"}` in `pipeline/build_data.py`), for two reasons:

- Turkish customs hide the partner for crude oil and natural gas (HS 2709, 2711 21, 2711 11). Even the world total of these headings is hidden. Only the chapter total (HS 27 from Russia) is published.
- The index measured from that chapter total (3.3 for crude and gas together in 2022, [`prices.json`](prices.json)) conflicted with the modelled gas price in [`gas_prices.json`](gas_prices.json) (index 1.75-1.87, from an oil-price formula).

This file builds the index again from sources that do not need the hidden lines, then checks it against the chapter total.

## Main result

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 (Jan-Aug) |
|---|---|---|---|---|---|---|
| Crude (EUR/t CIF) | 434 | 553 | 442 | 471 | 371 | 458 |
| Crude index | 1.10 | **1.41** (1.37-1.54) | 1.13 | 1.20 | 0.95 | 1.17 |
| Pipeline gas (EUR/MWh) | 17.1 | **99.5** | 37.9 | 35.1 | 36.3 | 39.6 |
| Pipeline gas index | 0.92 | **5.33** (3.63-6.65) | 2.03 | 1.88 | 1.94 | 2.12 |
| Products index (customs, unchanged) | 1.08 | 1.93 | 1.52 | 1.47 | 1.27 | 1.65 |
| Coal index (customs, unchanged) | 1.04 | 2.29 | 1.38 | 1.17 | 1.01 | 1.16 |
| **All fossil fuels (`fossil_all`)** | 1.01 | **2.80** (2.41-3.13) | 1.53 | 1.44 | 1.28 | 1.59 |
| Fuel share of payments | 0.49 | 0.71 | 0.66 | 0.73 | 0.70 | 0.75 |
| Fuel windfall, EUR bn | 0.1 | 25.8 | 9.7 | 8.9 | 5.6 | 6.4 |

Base for every index: Türkiye's own average 2018-2021 (crude EUR 393/t, pipeline gas EUR 18.7/MWh). Fuel windfall 2022-2026: **EUR 56.3 bn** (fuel only); with non-fuel goods, as in `prices.json`, 67.6 bn (54.0-81.2).

**Short answer to the old conflict:** the measured value was right and the oil formula was wrong. From 2022 Türkiye paid hub-linked prices for most of its Russian gas.

## Data used

| What | Source | Note |
|---|---|---|
| Russian gas volumes to Türkiye, per year | EPDK natural gas reports 2022, 2023, 2024, 2025 | 26.3 bcm (2021), 21.6, 21.3, 21.6, 21.2 (2025) |
| Spot pipeline gas from Russia | EPDK Table 2.8 / 2.9 | 0 (2021), **6.32 bcm (2022)**, 4.47, 5.65, 5.49 |
| Russian LNG to Türkiye | EPDK spot LNG tables | 0.19 / 0.79 / 0.50 bcm (2022-2024) |
| Russian crude to Türkiye | EPDK oil reports; Russian export customs 2018-2020; CREA 2021 and 2026 | 12.0 / 10.7 / 16.9 / 15.2 Mt (2022-2025) |
| Crude price | Russian MinFin Urals (prices.json benchmarks) + Black Sea freight | freight is an estimate (EUR 8/t pre-war, 25 in 2022, 12-17 after) |
| Gas contract terms | OIES Insight 113 (2022), Columbia CGEP (2024), OSW (2023), ICIS (2020) | see below |
| Hub and oil prices | FRED/IMF TTF and Brent, monthly, in EUR | same data as `gas_prices.json` |
| Check: value of the hidden lines | Turkish customs via UN Comtrade: HS 27 from Russia minus all visible headings | the chapter total by partner is published, only the split is hidden |

Links: [EPDK gas reports](https://www.epdk.gov.tr/Detay/Icerik/3-0-94/dogal-gazyillik-sektor-raporu), [EPDK oil reports](https://www.epdk.gov.tr/Detay/Icerik/3-0-107/yillik-sektor-raporu), [CGEP commentary](https://www.energypolicy.columbia.edu/wp-content/uploads/2024/02/Russia-Gas-Exports-Commentary_CGEP_021624.pdf), [OSW commentary](https://www.osw.waw.pl/en/publikacje/osw-commentary/2023-03-10/turkeys-dream-a-hub-ankaras-wartime-gas-policy), [OIES Insight 113](https://www.oxfordenergy.org/wpcms/wp-content/uploads/2022/04/Insight-113-Turkeys-supply-demand-balance-and-renewal-of-its-LTCs.pdf), [ICIS TurkStream launch](https://www.icis.com/explore/resources/news/2020/01/08/10457879/official-turkstream-launch-opens-new-supply-corridor/), [UN Comtrade](https://comtradeapi.un.org/).

## How the numbers were built

### Crude
- Volume: EPDK crude imports from Russia. EPDK and CREA agree within 1-7%.
- Price: MinFin Urals plus freight from Novorossiysk to Turkish refineries.
- Range:
  - low = the lower of the two Urals series plus half the freight;
  - high = 1.15 × Urals. That is the median post-war customs/benchmark ratio of all buyers in `prices.json`. It is high for a short Black Sea route.
- Pre-war check: Russia's own export customs give USD 497, 451 and 339 per tonne to Türkiye in 2018-2020, close to Urals.
- Result: 2022 index 1.41, close to the old `prices.json` benchmark crude (1.50).

### Pipeline gas: what the contracts say
- **Before 2022: oil-indexed with a discount.** BOTAŞ had a 10.25% discount from 2016. ICIS reported a fixed price of about USD 225-230 per 1,000 m³ for TurkStream gas sold to Turkish importers in 2020, which is about EUR 18.9/MWh.
- **From 2022: largely hub-indexed.** CGEP (2024): "In 2021, Gazprom renegotiated its contracts with BOTAŞ to include a spot indexation, making them very expensive compared to previous oil-indexed contracts given the increase in spot prices observed in 2022 and 2023." OIES (April 2022) lists the BOTAŞ-Gazprom TurkStream/Kıyıköy contracts as about 70% TTF/Henry Hub and 30% oil. The PDF returned HTTP 403, so this figure comes from search abstracts and the CGEP citation.
- **Spot pipeline gas.** EPDK records 6.3 bcm of Russian gas bought by BOTAŞ on spot terms in 2022, then 4.5-5.7 bcm a year. Before 2022 there was none.
- **Debt.** OSW (March 2023) reports a BOTAŞ debt to Gazprom of about USD 20 bn after 2022. That is only possible if the 2022 gas bill was around USD 20-25 bn. With an oil formula the bill would have been about USD 7 bn.
- **Contrary evidence.** OSW also says almost three quarters of all Turkish gas imports in 2022 were 100% oil-linked. This counts all suppliers (Iran, Azerbaijan, Algeria LNG are oil-linked), and it fits poorly with a 70% hub share on Russian long-term gas. It is the reason for the wide low end of the range.

### Pipeline gas: the model
- **Long-term gas** (EPDK Russian volume minus spot minus LNG): price = h × TTF + (1 − h) × oil formula.
  - Oil formula = 0.418 × the 9-month Brent average lagged one month (the Serbian/Bosnian calibration in `gas_prices.json`) × a Turkish factor of 0.85.
  - The factor 0.85 is fitted on 2018, 2020 and 2021 (range 0.77-0.95). `gas_prices.json` used 1.08.
- **Spot gas**: 95% of TTF (range 85-100%).
- **Hub share h**: 0.70 (range 0.35-1.0) from 2022. Before 2022 the price is the oil formula only.

### Pipeline gas: the check against customs
Turkish customs publish HS 27 from Russia as a total. Take away all visible headings (coal, oil products, LPG, coke, petcoke), then crude (EPDK volume × Urals + freight) and LNG. What is left is the gas bill.

| EUR/MWh | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| Contract model (h = 0.7) | 17.1 (oil only) | 101.0 | 37.6 | 32.3 | 33.0 | 39.6 |
| Customs residual | 17.2 | 97.9 | 38.2 | 37.9 | 39.5 | – |
| TTF | 46.5 | 122.5 | 40.7 | 34.4 | 36.3 | 45.4 |
| Oil formula, Turkish factor | 17.1 | 29.4 | 29.4 | 27.1 | 23.8 | 22.1 |
| old `gas_prices.json` | 24.9 | 45.3 | 35.7 | 32.7 | 29.2 | 31.7 |

- The **central** value is the mean of the model and the residual (2022-2025); the model alone in 2026.
- The **range** takes the lowest and highest of the model variants and the residual variants (crude at 1.15 × Urals or at the low price, ±5% on customs).
- Solving the model for the hub share that matches customs gives h = 0.65 (2022) and 0.77 (2023), which fits the reported 70%.
- In 2024-2025 the residual sits slightly above TTF. Either Türkiye paid more for Russian crude than Urals + freight (with crude at 1.15 × Urals the residual matches TTF), or the contracts follow TTF with no oil component.

### Pipeline gas: the base, 2018-2021
| EUR/MWh | 2018 | 2019 | 2020 | 2021 |
|---|---|---|---|---|
| Customs residual | 17.8 | 31.4 (not used) | 17.7 | 17.2 |
| Oil formula × 0.85 | 19.6 | 21.1 | 16.4 | 17.1 |
| Reported TurkStream price | | | 18.9 | |
| **Used** | 18.7 | 21.1 | 18.0 | 17.1 |

- Base = EUR 18.7/MWh, with a range of 17.0-22.0 that enters the index range.
- 2019 is not used from customs. Russia's own export customs show 8.2 Mt of crude to Türkiye, but by Turkish origin data the residual implies about 4 Mt more. Crude sold through traders is the likely reason.
- The old `gas_prices.json` base (24.2) was about 30% higher. That made its index lower too.

### LNG, products, coal, other fossil, non-fuel
- **LNG:** EPDK Russian spot LNG × the CREA price; base = European Russian-LNG level (as in `prices.json`). EUR 0.1-0.35 bn a year, so it hardly matters.
- **Products and coal:** Turkish customs show the partner for these. The `prices.json` unit values are kept. CREA agrees: diesel 1.89 vs 1.93 (2022), coal 2.09 vs 2.29.
- **Other fossil** (LPG, coke, petcoke): customs values, products index. In `prices.json` these were inside the hidden residual. Here they are separate.
- **Non-fuel goods:** copied from `prices.json`.

## What the builder would see

The builder formulas were re-run on the current `site/data.json` (`builder_impact_estimate`): `fuel_index` from `fossil_all`, `fuel_share_year` from `windfall_parts`, the harmonic `pidx` and `war_windfall`.

| central | 2022 | 2023 | 2024 | 2025 | 2026 | 2022-26 |
|---|---|---|---|---|---|---|
| `to_rus` pidx now (narrow.json) | 1.54 | 1.31 | 1.27 | 1.17 | 1.29 | |
| pidx new | 2.22 | 1.41 | 1.35 | 1.22 | 1.48 | |
| map windfall now, EUR bn | 14.0 | 6.1 | 5.1 | 2.2 | 3.1 | 30.5 |
| map windfall new, EUR bn | 23.3 | 8.9 | 8.3 | 5.4 | 6.2 | **52.1** |
| purchases at pre-war prices / 2021, now | 1.52 | 1.37 | 1.36 | 1.40 | 0.80 (8 months) | |
| purchases at pre-war prices / 2021, new | 1.10 | 1.32 | 1.34 | 1.39 | 0.72 (8 months) | |

- **Windfall:** about +EUR 22 bn toward Russia over 2022-2026.
- **Volume:** the volume rise shrinks by about EUR 13 bn (rough; flat counterfactual, before FRAC and trend), which counts toward Ukraine.
- **Net:** roughly EUR 8 bn more toward Russia. Most of the change moves money from the volume part into the windfall part. The 2022 "volume jump" largely disappears: Türkiye paid much more, but did not buy much more.
- **Ranges:** the windfall range narrows. The current low end even goes negative in 2025.

## What is guessed (marked in the JSON `basis`)
- Black Sea freight on crude (EUR 8-25/t, ±50%).
- Hub share of the long-term contracts (0.70, range 0.35-1.0), and the spot price as a share of TTF.
- 2026: Russian gas volume (CREA tonnes scaled by the 2025 EPDK/CREA ratio, ±12%) and the 2026 contract terms. The contracts were extended for one year on terms that were not published, so 2026 relies on the model alone.
- Deferred payments are treated as price-neutral. If the 2022-2024 deferral and the discount Türkiye sought later turned into a price cut, the true 2023-2025 index is lower. The customs residual already includes whatever was invoiced.

## Overlaps
No new money flow. This file only prices payments that are already in `to_rus`. It **replaces** three inputs:
1. **`prices.json` `countries.TUR`.** Same fields. Read this entry instead and remove TUR from `PRICES_SKIP`.
2. **`narrow.json` `countries.TUR.to_rus.pidx/pidx_lo/pidx_hi`.** `apply_narrow()` runs after `price_indices()` and would overwrite the new index. Drop these three fields, or the change will not reach the map.
3. **`gas_prices.json` `countries.TUR.pipeline`.** `gas_prices_tur_replacement` is a drop-in: 2022 index vs 2019-2021 = 5.34. `gas_index("TUR")` also values Turkish final-use gas in the transit-gas swap ([energy2.json](energy2.json)), so that part changes too. Check it for size.

Not affected: laundered oil and Turkish refining (compared in money), and the audit's gas correction (`GAS_IN_CUSTOMS TUR = 1.0`).

The `windfall` field includes non-fuel goods, as in `prices.json`. The map uses fuel only (`windfall_fuel_only`).

## Open questions
- The OIES contract table could not be opened directly (HTTP 403). The 70/30 split rests on search abstracts plus CGEP. The customs check supports it independently.
- Gazprom does not publish its average price to Türkiye after 2021. If BOTAŞ financial statements (cost of purchased gas by source) can be obtained, they would close the remaining gap.
- 2026 Turkish customs by chapter (January-August) were not available through Comtrade's public preview. Once published, the same residual check can be run for 2026.
