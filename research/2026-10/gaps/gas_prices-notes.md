# Country-specific Russian gas prices (research 2026-10)

Gathered 2026-10-17/18. The output is `gas_prices.json`.

## What it is for
The map deflates trade with Russia to pre-war prices. Until now gas used one Europe-wide index (`energy2.json` `price_index.pipeline_gas` and `lng`). This file gives, for each country that bought Russian pipeline gas or LNG in 2019-2026, the realised import price per year (EUR/MWh, gross calorific value; low/central/high) and an index against that country's own 2019-2021 average. To use it, divide the country's nominal Russian-gas value by `index_vs_2019_2021.pipeline` (or `.lng`). Years are calendar years; 2026 = January-August.

- 50 countries/territories: 23 EU members (Croatia = LNG 2021 only; Cyprus, Denmark, Ireland and Malta bought no Russian gas by origin and are omitted), SRB, BIH, MKD, MDA, TUR, CHE, ARM, AZE, BLR, KAZ, KGZ, UZB, GEO, CHN, JPN, KOR, IND, TWN, GBR, plus occasional LNG buyers (SGP, PAK, KWT, THA, BGD, IDN, BRA, VNM).
- `null` means no purchase that year (or, for Moldova 2024-2026, unpaid Transnistrian gas). Where energy2's high case shows volume but no customs price exists, a "gap fill" with the peer hub benchmark is used and named in `basis_by_year`.
- Each record has `contract`, `certainty` (A-D), `sources`, `reasoning`, `basis_by_year` (which method was used each year) and `base_2019_2021_eur_mwh`.
- `europe_reference` holds the energy2 indices, TTF, Brent, the oil-formula parameters, the peer hub benchmark and a volume-weighted re-aggregation of this file's prices.

## Method
1. **Customs unit values (certainty A).** Value ÷ quantity of imports from Russia, HS 271121 (pipeline) and 271111 (LNG):
   - EU members: Eurostat Comext DS-045409, monthly, EUR and 100 kg, 2019-01 to 2026-08. 2026 is therefore observed, not extrapolated.
   - Others: UN Comtrade (annual 2019-2025; monthly 2026 where published: SRB, BIH, MKD, ARM, KAZ, KGZ, UZB, JPN). USD converted at ECB annual averages.
   - Where both sources exist, the one with the larger quantity is central. If both are large (≥300 kt and ≥30% of the other) and differ by more than 15%, the mean is used (Slovakia 2020-2022 and 2025, Greece 2019). The other source sets the range.
   - Comtrade quantities flagged as estimated are not used (France LNG, China pipeline, Taiwan 2022+, Kazakhstan 2021-22, Georgia).
   - Energy content: 1 t = 15.2 MWh GCV (≈54.7 MJ/kg for Russian lean gas); 1 m3 = 10.55 kWh. energy2 used 0.73 kg/m3 × 10.55 kWh/m3 = 14.45 MWh/t, so its EUR/MWh levels are ~5% higher. **Indices are unaffected.**
   - Ranges: ±3% (≥300 kt), ±8% (30-300 kt), ±15% (<30 kt), widened to the other customs source, plus ±4% conversion error on price levels (not on indices).
2. **Customs value ÷ external volume (B).** China pipeline (Chinese customs value ÷ Gazprom's annual Power of Siberia volume), France LNG (French customs value ÷ Kpler cargo tonnes via CREA, averaged with peer LNG prices), Taiwan 2022-2024.
3. **Peer customs under the same contract type (B).** Germany, Austria, Finland, Switzerland, Luxembourg and the pipeline parts of the Netherlands, France and Belgium hide Russian gas in customs. Their Gazprom Export contracts were renegotiated to hub indexation (2010-2020), so they get the kt-weighted customs unit value of Czechia, Slovakia and Italy ("peer hub benchmark", ±12-17%). Germany is the mean of this benchmark and the BAFA border price (all origins).
4. **Published contract prices (B).** Belarus ($127 → $128.5/1000 m3, frozen; settled in roubles from 2023), Moldova 2020 ($148.9), China 2019 launch price ($212.2). Armenia's customs reproduce the published $165.
5. **Contract-structure models (C).** Used where neither customs nor published prices exist:
   - Oil formula: price = k × the 9-month Brent average (EUR/bbl) lagged one month. This is the 6-9 month effective lag typical of Gazprom oil-indexed contracts. The range adds a 6-month average lagged 3 months.
   - k is calibrated on Serbian and Bosnian customs (both 100% oil-indexed contracts): median 0.418 EUR/MWh per EUR/bbl, P10-P90 0.381-0.474.
   - **Turkey:** mean of the oil formula with k × 1.08 and CREA's modelled Turkey price. Range from a 10% deeper discount to k × 1.12.
   - **Poland 2019-2022:** 50/50 blend of the hub benchmark and the oil formula (k × 1.1), reflecting the 2020 Yamal arbitration formula.
   - **China 2026:** oil formula recalibrated on China's 2022-2025 customs (k = 0.295).
   - **Korea, China LNG and Taiwan 2026:** scaled from 2025 with the change in Japan's Russian-LNG unit value, the Japan LNG import price and CREA LNG prices.
   - **Occasional LNG buyers:** CREA's modelled cargo price (±15%).
6. **Assumed or swap prices (D).** Georgia (customs value but no quantity; assumed $185-300/1000 m3) and Kazakhstan (swap settlement values of 2-9 EUR/MWh).
7. **Index.** Central = price ÷ mean of the country's own 2019-2021 central prices. Where the country had no 2019-2021 purchases, `base_note` says what was used: Uzbekistan uses its 2024 USD price at 2019-2021 exchange rates; otherwise the first year with purchases (Italy LNG, Kuwait, Turkey LNG and others). The index range carries that year's source uncertainty and a reduced base uncertainty.

## Index results (central; full ranges in the JSON)
| Country | Type | Cert. | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|---|---|---|---|
| ARM | pipeline | A | 1.02 | 1.00 | 0.97 | 1.13 | 1.11 | 1.12 | 1.07 | 1.04 |
| AUT | pipeline | B | 0.86 | 0.57 | 1.57 | 4.85 | 2.42 | 1.82 | 1.93 | 2.38 |
| AZE | pipeline | B | 1.00 | – | – | 1.06 | 1.00 | 1.03 | – | – |
| BEL | pipeline | B | 0.86 | 0.57 | 1.57 | 4.42 | 2.76 | – | – | – |
| BEL | lng | B | 1.02 | 0.79 | 1.19 | 5.71 | 2.46 | 1.79 | 2.08 | 2.12 |
| BGD | lng | C | – | – | 1.00 | – | – | – | – | – |
| BGR | pipeline | B | 1.00 | 0.57 | 1.44 | 3.92 | 2.26 | 1.42 | 1.52 | 1.68 |
| BIH | pipeline | A | 1.10 | 1.04 | 0.85 | 1.27 | 1.34 | 1.26 | 1.13 | 1.08 |
| BLR | pipeline | B | 1.02 | 1.00 | 0.98 | 1.10 | 1.07 | 1.07 | 1.02 | 0.99 |
| BRA | lng | C | – | – | – | – | 1.00 | – | – | – |
| CHE | pipeline | C | 0.86 | 0.57 | 1.57 | 4.85 | 2.42 | 1.82 | 1.94 | 2.38 |
| CHN | pipeline | B | 1.18 | 1.06 | 0.76 | 1.52 | 1.63 | 1.49 | 1.34 | 1.21 |
| CHN | lng | B | 0.99 | 0.73 | 1.27 | 2.42 | 1.47 | 1.37 | 1.10 | 1.36 |
| CZE | pipeline | A | 0.82 | 0.55 | 1.63 | 4.95 | 2.62 | 2.23 | 2.08 | 2.55 |
| DEU | pipeline | B | 0.87 | 0.63 | 1.50 | 4.58 | – | – | – | – |
| ESP | lng | A | 0.80 | 0.65 | 1.55 | 4.13 | 2.06 | 1.69 | 1.73 | 1.88 |
| EST | pipeline | B | 1.08 | 0.52 | 1.40 | 3.40 | – | – | – | – |
| EST | lng | B | 0.69 | 0.45 | 1.85 | 4.40 | 1.22 | 0.97 | – | – |
| FIN | pipeline | B | 0.86 | 0.57 | 1.57 | 4.85 | – | – | – | – |
| FIN | lng | B | 0.94 | 0.85 | 1.20 | 1.59 | 1.31 | 1.24 | – | – |
| FRA | pipeline | B | 0.86 | 0.57 | 1.57 | 4.85 | – | – | – | – |
| FRA | lng | B | 0.78 | 0.63 | 1.60 | 3.69 | 2.13 | 1.61 | 1.67 | 1.73 |
| GBR | lng | A | 0.82 | 0.66 | 1.52 | 4.42 | – | – | – | – |
| GEO | pipeline | D | 1.01 | 0.99 | – | 1.74 | – | – | – | – |
| GRC | pipeline | A | 1.09 | 0.46 | 1.45 | 4.98 | 1.52 | 1.28 | 1.47 | 1.70 |
| GRC | lng | A | 1.28 | 0.72 | – | 7.19 | 2.06 | 1.84 | – | – |
| HRV | lng | B | – | – | 1.00 | – | – | – | – | – |
| HUN | pipeline | A | 0.96 | 0.56 | 1.48 | 7.56 | 2.84 | 1.89 | 2.24 | 2.43 |
| IDN | lng | C | – | – | 1.00 | 2.00 | – | – | – | – |
| IND | lng | B | 1.59 | 0.42 | 0.99 | 1.33 | 1.76 | 1.61 | – | – |
| ITA | pipeline | A | 0.86 | 0.56 | 1.58 | 4.87 | 2.49 | 1.66 | 1.98 | 2.34 |
| ITA | lng | A | – | – | – | 1.00 | 0.63 | 0.49 | 0.36 | – |
| JPN | lng | A | 1.08 | 0.84 | 1.09 | 1.77 | 1.56 | 1.47 | 1.27 | 1.19 |
| KAZ | pipeline | D | 1.33 | 0.90 | 0.77 | 0.77 | 0.65 | 2.51 | 2.04 | 2.67 |
| KGZ | pipeline | B | 1.02 | 1.00 | 0.97 | 1.02 | 1.06 | 1.13 | 1.20 | 1.19 |
| KOR | lng | A | 1.02 | 0.79 | 1.19 | 1.68 | 1.39 | 1.27 | 1.11 | 1.26 |
| KWT | lng | C | – | – | – | 1.00 | 0.72 | 0.62 | – | – |
| LTU | pipeline | A | 1.06 | 0.41 | 1.53 | 4.50 | – | – | – | – |
| LTU | lng | A | 0.66 | 0.46 | 1.88 | 4.63 | 1.41 | 1.19 | 1.37 | – |
| LUX | pipeline | C | 0.86 | 0.57 | 1.57 | – | – | – | – | – |
| LVA | pipeline | A | 0.77 | 0.47 | 1.76 | 6.24 | – | – | – | – |
| MDA | pipeline | B | 1.07 | 0.67 | 1.26 | 3.84 | 5.12 | – | – | – |
| MKD | pipeline | A | 1.04 | 0.89 | 1.07 | 4.70 | 2.74 | 1.67 | 1.93 | 1.51 |
| NLD | pipeline | B | 0.86 | 0.57 | 1.57 | 4.85 | – | – | – | 1.65 |
| NLD | lng | B | 0.67 | 0.54 | 1.80 | 3.52 | 3.30 | 1.68 | 1.66 | 1.50 |
| PAK | lng | B | – | 1.00 | – | – | – | – | – | – |
| POL | pipeline | C | 1.02 | 0.75 | 1.23 | 3.10 | – | – | – | – |
| PRT | lng | A | 1.09 | 0.67 | 1.24 | 2.04 | 2.19 | 1.50 | 1.56 | 1.45 |
| ROU | pipeline | B | 1.31 | 0.90 | 0.79 | 1.68 | – | – | – | – |
| SGP | lng | B | – | – | 1.00 | 2.41 | 1.48 | – | – | – |
| SRB | pipeline | A | 1.26 | 0.97 | 0.77 | 1.77 | 2.02 | 1.57 | 1.48 | 1.42 |
| SVK | pipeline | A | 0.90 | 0.62 | 1.49 | 4.90 | 2.34 | 1.86 | 1.92 | 2.38 |
| SVN | pipeline | B | 0.98 | 0.67 | 1.35 | 5.42 | 3.13 | 2.42 | 2.44 | – |
| SWE | lng | B | 1.07 | 0.73 | 1.20 | 1.47 | 1.18 | 1.10 | – | – |
| THA | lng | C | – | – | – | 1.00 | – | – | – | – |
| TUR | pipeline | C | 1.11 | 0.86 | 1.03 | 1.87 | 1.47 | 1.35 | 1.20 | 1.31 |
| TUR | lng | C | – | – | – | 1.00 | 0.81 | 0.62 | – | – |
| TWN | lng | B | 1.00 | 0.74 | 1.26 | 1.61 | 1.39 | 1.60 | 1.16 | 1.30 |
| UZB | pipeline | B | – | – | – | – | 1.06 | 1.06 | 1.02 | 0.99 |
| VNM | lng | C | – | – | – | – | – | – | 1.00 | – |
| Europe-wide (energy2) pipeline | | | 0.93 | 0.60 | 1.47 | 4.51 | 2.32 | 1.71 | 1.78 | 2.31 |
| Europe-wide (energy2) LNG | | | 0.88 | 0.68 | 1.45 | 3.72 | 2.14 | 1.58 | 1.76 | 1.87 |
| TTF | | | 0.59 | 0.41 | 2.00 | 5.29 | 1.77 | 1.49 | 1.56 | 1.92 |
| This file, volume-weighted Europe | pipeline | | 0.92 | 0.64 | 1.44 | 4.21 | 2.09 | 1.68 | 1.60 | 1.76 |
| This file, volume-weighted Europe | lng | | 0.78 | 0.63 | 1.59 | 3.87 | 2.15 | 1.60 | 1.69 | 1.73 |

## Main findings
- **The single Europe-wide index is a fair average but wrong for most individual countries.** In 2022 the index ranges from about 1.1 (Belarus, Armenia) and 1.5-1.9 (China, Turkey, Serbia, Japan) to 4.6-5.0 (hub-indexed Central Europe) and 7.6 (Hungary). The Europe-wide value is 4.5.
- **Hungary is the opposite of the brief's assumption.** Its customs unit values follow TTF with a short lag. Hungary paid 128 EUR/MWh in 2022, the highest of any large buyer, after a low 2019-2021 base of 16.9. This fits reports that the 2021 MVM contract tracks TTF with a ~2-month lag and that MVM stocked up at summer-2022 prices. No oil cap is visible in the data. Using the Europe-wide 4.5 for Hungary in 2022 overstates its pre-war-price volume by ~68%.
- **Serbia and Bosnia (oil-indexed) peaked at only 1.8 and 1.3.** Deflating their 2022 imports with the Europe-wide index understates real volume by a factor of 2.5-3.5.
- **Slovakia, Austria, Italy, Germany and Czechia (hub-indexed) are close to the Europe-wide index in 2022** (4.6-5.0 vs 4.5).
- **2026 differs from energy2.** Comext January-August 2026 shows hub-indexed buyers at ~2.4 and Hungary at 2.4. The volume-weighted European index is 1.76, against energy2's 2.31, which was the 2025 price × 1.30 from CREA. The new figure is observed.
- **Turkey (modelled) peaks at 1.9** (range 1.0-2.9). Because Turkey carries the largest Russian pipeline volume after 2022, this one assumption moves the European aggregate most.
- **Political prices are flat in USD.** Belarus, Armenia and Kyrgyzstan sit between 1.0 and 1.2 every year; their EUR indices move only with USD/EUR.
- **China's Power of Siberia price is oil-linked, low and lagged:** $145/1000 m3 in 2021, $257 in 2022, $284 in 2023, $259 in 2024, $243 in 2025. Index peak 1.6 in 2023.
- **Moldova** switched from a lagged far-abroad formula to a TTF/oil formula in late 2021. It peaks at 5.1 in 2023 (a few weeks of purchases at ~$1,000/1000 m3), then stops.

## Weakest assumptions (in order of impact)
1. **Turkey.** No observed price (Turkish customs suppress gas). The oil formula and CREA disagree by up to 40% in 2022. Deferred payments are treated as price-neutral; if they hid an effective discount, Turkey's index is lower still.
2. **Germany, Austria, Poland, Finland, Switzerland.** These are priced from peer customs (CZE/SVK/ITA) and the German all-origin border price, not their own data. Poland's post-arbitration formula weights are unknown (2022 range 1.0-6.3).
3. **Slovak and Czech customs conflicts.** National (Comtrade) and Comext values differ by up to 60% (Slovakia 2022: 76 vs 121 EUR/MWh). The mean is used, but this also drives the peer benchmark for Germany and Austria.
4. **China pipeline.** Unit values use Gazprom's announced annual volumes (customs tonnes are imputed). 2026 is modelled.
5. **Belarus 2023-2026.** The rouble-settled price and the 2026 continuation of $128.5 are assumed.
6. **Energy content.** The 15.2 MWh/t factor affects absolute EUR/MWh (±4%) but not the indices.
7. **Small LNG buyers and Kazakhstan.** Bases are often a single later year, or swap values. Treat these indices as indicative.

## Files
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
