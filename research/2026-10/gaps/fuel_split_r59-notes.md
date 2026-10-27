# What each country bought from Russia, by fuel (round 59)

Data file: `research/2026-10/gaps/fuel_split_r59.json`. Built by [`scripts/fuel_split_r59.py`](../scripts/fuel_split_r59.py). Run it from the repository root with `python3 -I research/2026-10/scripts/fuel_split_r59.py`. It takes about 3 seconds.

**Status.** This is a research proposal. The build does not read the file, and no number on the site changes. The file is meant to feed pages that answer "who buys Russian oil / gas / LNG", "Russian oil exports by country" and "India's Russian oil imports".

**Scope.** For every country with purchases from Russia (231), each year 2021–2026, it gives:
- **parts:** crude oil, oil products, pipeline gas, LNG, coal and other goods (EUR bn, current prices, with low–high ranges);
- **total:** the parts add up exactly to the site's "Paid to Russia" (`to_rus.years`, `T.paid` in the page);
- 2026 is January–August, the site's data month. 2021 is kept as the pre-war reference.

Nothing was downloaded. All inputs are already in the repository. The two extracts in `raw/fuel_split_r59/` are derived from repository files and carry the original URL and date.

## Three layers, and which one answers which question

| Layer (JSON field) | What it is | Use it for |
|---|---|---|
| `gross_customs` | What the importer's own customs record from Russia, by fuel. CIF, before any of the site's reassignments. Source: `prices.json` `windfall_parts.paid` (Eurostat Comext for EU members, UN Comtrade for the rest). | "India imported EUR X bn of Russian crude in 2024." This is the usual meaning of "imports of Russian oil". |
| `crude`, `products`, `pipeline_gas`, `lng`, `coal`, `other` (with `total_site`) | The site's own figure, split by fuel. FOB at the Russian border. The Russian crude that refiners export inside fuel is moved to the final buyers (the separate "laundered oil" line). Gold and goods passed on by hubs are moved to the first buyer. | Explaining the site's "Paid to Russia" number, and anything that must add up to it. |
| `tracker_crea` | CREA Russia Fossil Tracker: Kpler-tracked shipments × CREA's modelled Russian export prices. Destination = first discharge port or pipeline border. FOB-like. | An independent cross-check. Also a second source to name next to customs. |

`memo_russian_crude_in_fuel_bought_from_third_countries` holds the site's separate laundered-oil line, for context. It is **not** in `total_site`.

## Method

### 1. Starting split: customs by fuel
- **Parts.** Crude = HS 2709; products = HS 2710 plus other fossil HS 27 (coke, petcoke, bitumen, electricity; shown as `of_which_other_fossil_in_products`); LNG = 271111; pipeline gas = 271121; coal = 2701; other = customs total minus HS 27.
- **Pipeline gas in the European transit countries** is by country of final use (`energy2.json`), valued at the researched Russian gas price (`gas_prices.json`). This is the same rule as `prices.json` and the build.
- **Türkiye.** Its customs hide the partner for crude and gas, but they report the HS 27 residual from Russia (EUR 29.0 bn in 2022, 13.5–16.6 bn in 2023–2025). That residual is split in proportion to two independent values:
  - gas = EPDK's Russian gas volume (`turkey_gas_r43.json`) × Türkiye's Russian pipeline price (`gas_prices.json`);
  - crude = CREA's tracked crude to Türkiye.

  The residual is 1.68× the sum of the two in 2022, then 1.09–1.34× in 2023–2026 (`turkey_hidden_split`). The 2022 excess fits the reports of very high BOTAŞ prices that year, but it may also hold LPG and other hidden HS 27 codes. Both parts are scaled by the same factor.
- **Countries outside `prices.json`** take their fuel from the CREA tracker, capped at the site total, and "other" is the rest. Countries with no CREA record either have everything in "other" (quality D). Together these hold 1.2% of the site total. The largest are Iran (EUR 5.4 bn, tracker), Turkmenistan (4.3), Peru (1.6), Colombia (1.4) and Tanzania (1.2).

### 2. From customs to the site's value at the first traced step
`build()` is run in memory, read-only. It is imported without writing bytecode. The output matches `site/data.json` for all 231 countries.

Before the first traced step, the build does three things:
- swaps customs gas for gas by final use;
- applies the partner, non-reporter (paid-share) and 2026 refresh corrections;
- for EU and pipeline-gas countries, takes the larger of customs and the tracker's fuel value ("tracker floor").

Any difference between the customs parts and that value is treated as follows:
- **Site value higher:** the excess goes to "other", except for the tracker-floor lift. That lift goes to the fuels in CREA's mix: EUR 1.8 bn in 2022, mostly Greece, Croatia, Latvia, Estonia, the Netherlands and Malta.
- **Site value lower:** every part is scaled down and the customs mix is kept, because the cause is not known part by part.

### 3. Each later build step, put on the part it concerns
| Build step | Part |
|---|---|
| Refiners' exported Russian crude moved to the final buyers: India, Türkiye and China inside `build()`; `eu_refiner_exports`, `apply_laundered_r39`, Brunei | crude |
| Türkiye's relabelled Russian fuel (`apply_laundered_r6`) | products |
| Re-exports and Hong Kong gold (`apply_reexports`, `apply_residual`) | other |
| Second audit (`apply_audit2`) | Q1 (UAE gold via Armenia) → other; Q2 (Russian fuel delivered to the UAE and resold) → products |
| `uae_fuel_net` | products |
| `remove_freight` | Each part by its own CIF→FOB factor, scaled to the step's actual total. Oil: the importer's ITIC margin × the war-time freight surge (`fob_factor`). Other parts: the ITIC margin. |
| Steps with no fuel meaning (`fix_artefacts`, `baltic_transit`, Brunei's narrow data) | spread in proportion |

### 4. Ranges
- **Fuel parts:** the site's own band for the total, combined in quadrature with:
  - a split error by basis: customs with own prices, A 3%, B 8%; customs with filled prices, C 15%; tracker 20%; Türkiye's hidden crude and gas 25%;
  - 25% of the modelled reassignments that hit the part.
- **"Other"** carries all the fuel errors, because it is the remainder.
- Low and high values are **not additive** across parts.

## Results

### World, by fuel, EUR bn

The tables below cover buyers on the map only. Russia's exports to unmapped destinations, bunkers and unknown buyers are left out.

**Site basis** (FOB; refiners' exported crude moved to the laundered line):

| Year | Crude | Products | Pipeline gas | LNG | Coal | Other goods | Total |
|---|---|---|---|---|---|---|---|
| 2022 | 114.6 | 78.9 | 101.0 | 27.2 | 36.9 | 193.5 | 552.0 |
| 2023 | 85.1 | 54.5 | 27.3 | 17.3 | 28.4 | 165.8 | 378.4 |
| 2024 | 94.9 | 48.4 | 27.7 | 15.8 | 20.4 | 156.3 | 363.5 |
| 2025 | 74.1 | 40.5 | 23.7 | 15.2 | 17.0 | 173.9 | 344.4 |
| 2026 Jan–Aug | 66.4 | 26.1 | 16.4 | 10.6 | 12.1 | 113.6 | 245.2 |
| **2022–2026** | **435.1** | **248.4** | **196.1** | **86.1** | **114.7** | **803.0** | **1,883.5** |

**Comparison, 2022–2026 totals:**

| Layer | Crude | Products | Pipeline gas | LNG | Coal | Other goods |
|---|---|---|---|---|---|---|
| Gross customs, 102 reporters, CIF | 604.8 | 281.8 | 211.6 | 94.1 | 123.0 | 814.3 |
| CREA, all destinations | 502.4 | 323.5 | 165.5 | 92.8 | 107.8 | – |

### How the world totals move from customs to the site (EUR bn, `world_adjustments_customs_to_site`)

| Year | Freight to FOB | Refiners' exported crude passed on | UAE gold and fuel (audit 2) | Customs layer | Other corrections |
|---|---|---|---|---|---|
| 2022 | −38.3 | −30.2 | +4.9 | −4.5 | −2.3 |
| 2023 | −37.1 | −21.3 | +4.6 | +6.1 | −0.8 |
| 2024 | −30.3 | −21.9 | +1.4 | −1.6 | −0.7 |
| 2025 | −28.2 | −16.7 | +0.7 | +7.1 | −0.5 |
| 2026 Jan–Aug | −27.9 | −10.2 | 0.0 | −3.1 | −0.3 |

Hub re-exports and Hong Kong gold net to zero world-wide: they move value between countries.

### Top buyers 2022–2026 (EUR bn): gross customs (CIF) / site basis / CREA tracker
- **Crude:** China 257.5 / 216.9 / 236.5; India 195.1 / 121.0 / 150.0; Türkiye 33.8 / 20.8 / 25.8 (estimate: hidden partner); Belarus 17.7 / 16.3 / not tracked; Netherlands 15.3 / 9.5 / 8.5; Germany 11.7 / 9.4 / 10.4; Slovakia 9.6 / 1.2 / 10.1 (most of Slovnaft's Russian crude leaves as exported fuel, counted at its buyers); Hungary 9.2 / 6.1 / 9.8.
- **Oil products:** Türkiye 44.5 / 32.5 / 60.7; China 29.6 / 28.3 / 28.6; Brazil 21.9 / 18.7 / 23.0; India 16.8 / 15.1 / 19.0; Singapore 13.2 / 12.4 / 18.0. The UAE ranks higher on site basis (12.0, after audit 2's fuel) than in its customs (5.4). Saudi Arabia (customs 6.3) and Egypt rank far higher on CREA (17.0, 8.6) than in their customs; see Doubts.
- **Pipeline gas:** Türkiye 48.0 / 43.9 / 38.2 (estimate); China 31.9 / 30.8 / 31.3; Germany 23.7 / 21.7 / 19.3 (2022 only); Hungary 20.9 / 20.2 / 18.2; Italy 18.5 / 17.8 / 11.2; Austria 11.1 / 10.6 / 10.7; Belarus 10.3 / 9.5 / not tracked; Slovakia 9.6 / 7.8 / 8.9.
- **LNG:** China 23.3 / 22.5 / 20.0; Japan 16.9 / 15.4 / 15.8; France 16.7 / 14.3 / 16.4; Spain 11.6 / 10.5 / 12.0; Belgium 8.5 / 7.6 / 12.9; Netherlands 6.8 / 6.4 / 4.4; South Korea 5.3 / 4.9 / 5.0.
- **Coal:** China 44.7 / 43.1 / 37.1; India 18.7 / 17.3 / 17.4; South Korea 15.2 / 13.8 / 13.7; Türkiye 13.4 / 12.2 / 14.2; Japan 4.5 / 4.1 / 2.8; Taiwan 4.1 / 3.8 / 4.0; Viet Nam 3.9 / 3.4 / 3.0.

The full lists (15 per fuel and basis) are in `top_buyers_2022_2026`.

### India (quality A, own customs via UN Comtrade; 2026 from Comtrade monthly)

| Year | Crude, gross customs (CIF) | CREA tracker | Site basis (FOB, after exported crude passed on) |
|---|---|---|---|
| 2022 | 24.2 | 18.7 | 15.4 |
| 2023 | 45.0 | 35.5 | 26.2 |
| 2024 | 48.7 | 38.4 | 31.2 |
| 2025 | 40.2 | 31.9 | 26.1 |
| 2026 Jan–Aug | 37.0 | 25.5 | 22.0 |

- **Coal:** 4.1, 4.3, 3.6, 3.6 and 3.0 (gross).
- **Products:** 2.6–4.6 a year.
- **Site total:** 29.4–45.4 a year.

Two things explain the gap between customs and the site:
- **Freight:** EUR 4–10 bn a year comes off.
- **Exported crude:** EUR 6–11 bn a year of Russian crude in India's fuel exports is counted at the buyers of that fuel.

The customs-to-CREA gap (customs about 1.2–1.45× the tracker) is CIF freight, Indian customs valuation, and CREA's price model.

## Coverage (share of the site's 2022–2026 total, by country-year)

| Quality | Meaning | Share | EUR bn |
|---|---|---|---|
| A | Measured: at least 90% of fuel value from own customs priced with own unit values | 63.3% | 1,192 |
| B | Mostly measured (at least 50%) | 8.0% | 151 |
| C | Estimate: filled prices, hidden partner (Türkiye), or CREA tracker only | 28.1% | 530 |
| D | No fuel split available; all in "other" | 0.6% | 11 |

**Measured in every year 2022–2026:** India, Kazakhstan, Brazil, Italy, France, Japan, Hungary, the Netherlands, Belgium, Czechia, Spain, Singapore, Greece, Switzerland, Slovakia, Austria, Indonesia, Armenia, Finland, Malaysia and others (`coverage_table`, `split = "measured"`).

**Estimates**, the largest first:
- **China:** 2026 fuel values have filled prices; 2023 is B.
- **Türkiye:** hidden partner.
- **Belarus:** no customs reports. The last customs volume is carried forward at filled prices (C).
- **UAE:** fuel partly from the audit and the tracker.
- **Germany:** C only in 2024–2025, when its fuel was near zero.
- **Egypt, Taiwan, Mongolia, Algeria, Viet Nam:** filled prices.
- **Iran and Turkmenistan:** tracker only.

## Reconciliation gaps (customs parts vs the site's value at the first traced step)
These are listed in `reconciliation_gaps_over_0_25bn`: 133 country-years above EUR 0.25 bn. The main patterns:

- **Site lower than customs**, so all parts are scaled down:
  - France 2022 (−6.0) and Germany 2022 (−3.5): gas valued differently. `prices.json` uses final-use volumes × `gas_prices.json`; the build's own gas swap starts from customs totals that do not hold the gas.
  - Slovakia, every year (−0.4 to −1.8): its customs HS 27 plus the removed customs gas (`customs_gas.json`) exceed its customs total.
  - Switzerland 2024 (−2.9), Belgium 2022 (−1.6), Poland 2022 (−1.4), Belarus 2026 (−2.0).
  - Small importers whose `prices.json` fuel comes from CREA tonnes while their customs total is far lower: Myanmar, Ghana, Sudan, Morocco, Bangladesh and Brunei, EUR 0.7–1.5 bn each.

  Here the fuel figure on site basis is much smaller than the tracker shows. Either the site total misses fuel, or the tracker attributes cargoes that customs record from another origin.
- **Site higher than customs**, so the excess goes to "other":
  - UAE 2024–2026 (+1.2 to +5.5): its own customs totals (round4b), mostly gold, which the hub steps then move on.
  - Greece 2022–23 (+3.0, +0.8).
  - Algeria (+0.8 to +2.8 a year): customs record almost no Russian fuel, and the rest is grain and other goods.
  - Iran and Turkmenistan: tracker countries.
  - Kyrgyzstan and Tajikistan: national statistics above Comtrade.
- **Overflow** (a reassignment larger than the part it hits):
  - UAE: EUR 0.73 bn of round-39 crude relief exceeded its crude, and was spread over its other parts.
  - Croatia, Romania and Brunei: under EUR 0.04 bn each.

## Doubts
1. **"Other" is a remainder, not a measurement.** Where the site total and customs disagree, the gap lands there (when positive) or scales every part (when negative). Read `other` together with `adjustments_customs_to_site`.
2. **Site-basis fuel is not "imports".** It is FOB and excludes the Russian crude that refiners re-export. India's site-basis crude (EUR 121 bn, 2022–2026) is well below its customs figure (EUR 195 bn). Pages should quote `gross_customs` for "India's imports of Russian oil" and keep site-basis values for the site's own balance.
3. **Türkiye's crude and gas are an estimate.** The 2022 split depends on whether the 1.68× excess is gas price (BOTAŞ) or crude/LPG. Under the alternative "gas at EPDK × price, crude = rest", 2022 gross crude would be 18.7 instead of 11.6, and gas 10.3 instead of 17.4. Türkiye's products: customs show 44.5 for 2022–2026, CREA 60.7. CREA counts cargoes discharged in Turkish ports, some of them for re-export.
4. **Products in the Gulf and Egypt.**
   - Customs of the UAE, Saudi Arabia and Egypt show far less Russian fuel than CREA: customs/CREA = 0.44, 0.37 and 0.29.
   - Likely causes: origin labelling by traders, storage and re-export, and the UAE's customs gaps that audit 2 already fills for the UAE.
   - Saudi Arabia's and Egypt's site-basis products follow their customs and may be low.
5. **Belarus.** The crude series (EUR 2.5–4.7 bn a year) is the last reported customs volume carried forward. Belarus does not report and CREA does not track its pipeline crude.
6. **The freight split mirrors the build.** The build applies the importer's ITIC margin to pipeline gas too, on the non-border-priced share, so pipeline gas loses a few percent as well.
7. **2026 is January–August.** For several countries (China among them) it uses filled prices and partial-year scaling. CREA's latest months may still be revised upward.
8. **The script imports `pipeline/build_data.py` and follows its step names.** If a step is renamed, it falls back to "spread in proportion" and still adds up exactly, but the attribution should then be checked. The script asserts that the parts sum to `to_rus.years`, and that the build's `data_to` equals the site's.

## Neutral phrasing (for pages)
- **Say what was bought and who measured it.** For example: "India's customs recorded EUR 48.7 bn of crude oil imported from Russia in 2024." Or: "CREA's tracker, based on Kpler ship data, estimates EUR 38.4 bn." Name the record (customs, regulator, tracker), not an intention.
- **Use "bought from Russia", "imports from Russia" or "payments for Russian fuel".** Avoid "funded the war", "bankrolled" and "propping up". The site's balance already says what the money means.
- **Mark the basis every time.** Customs = CIF, by country of origin. Site = FOB at the Russian border. Tracker = shipments × modelled price, by discharge port. Also mark "2026 = January–August".
- **"Laundered oil".** Prefer "fuel refined from Russian crude in third countries" in page text. Keep the site's term only where the method page defines it. Do not imply that the refiner or the buyer broke a rule: the EU's ban on such fuel applies only from 21 January 2026 (18th sanctions package), and most other buyers face no such rule.
- **Pipeline gas in transit countries is "gas used in [country]"**, not "gas that crossed [country]".
- **Estimates should say so.** For quality C or D, write "estimated"; for Türkiye, "customs do not name the supplier for crude and gas". Do not rank Türkiye's crude against measured buyers without that caveat.
- **Rankings should name the period and basis.** For example: "largest buyers of Russian crude, 2022–August 2026, by their own customs records (CIF)".
- **Do not add `memo_russian_crude_in_fuel_bought_from_third_countries` to the parts.** It is a separate line on the site.

## Files
- `research/2026-10/gaps/fuel_split_r59.json`. The country entries are keyed by ISO3 and hold:
  - `years.<YYYY>`, with the parts, `total_site`, `gross_customs`, `tracker_crea`, `adjustments_customs_to_site`, `basis`, `sources`, `quality` and the memo;
  - `sum_2022_2026`;
  - `gross_customs_sum_2022_2026`;
  - `overflow_log`.

  Top-level sections: `world`, `world_adjustments_customs_to_site`, `top_buyers_2022_2026`, `coverage`, `coverage_table`, `reconciliation_gaps_over_0_25bn`, `turkey_hidden_split`, `sources` and `check_site_match`.
- `research/2026-10/raw/fuel_split_r59/crea_year_country_fuel_2021_2026jan-aug.json` is CREA aggregated to calendar years. Source URL: `https://api.russiafossiltracker.com/v0/counter?aggregate_by=month,destination_iso2,destination_country,commodity_group&commodity_grouping=split_gas_oil&currency=EUR,USD&date_from=2021-01-01&date_to=2026-10-22&format=csv`, retrieved 2026-10-23, from the repository copy `raw/crea_api/`.
- `research/2026-10/raw/fuel_split_r59/build_trace_to_rus.json` holds every build step's change to `to_rus`, per country and year.
