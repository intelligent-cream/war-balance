# Energy gaps, part 2: gas by final user, price indices, fuel mix, hub resale (research 2026-10)

Gathered 2026-10-17. The output is `energy2.json`. **No person has reviewed it yet.**

- Values have low / central / high ranges, meant as ~90% intervals.
- Years run 2019-2025, plus 2026 January-August.
- Each country entry has a `sources` list (name, URL, date) and a `reasoning` text.
- Scripts are in `working/scripts-energy2/`:
  - `build.py` writes the JSON.
  - `jsonstat.py` is a JSON-stat parser.
  - `indices.py` makes `annual_indices.json`.
  - Also there: `show_*.py` and `fetch_comtrade.py`.
- Hub figures are hand-assembled in `working/hub_resale.json` from the downloads listed below.
- Raw downloads are in `working/raw/energy2/` (eurostat, comtrade, fred, web). The CREA files from the first energy run are reused from `working/raw/energy/`.

## 1. Transit gas → gas by country of final use (`transit_gas`)
**Problem.** CREA assigns pipeline gas to the country where it enters the EU or a non-EU country. Examples: Germany for Nord Stream, Slovakia for the Ukraine route, Bulgaria and Turkey for TurkStream.

**Fix.** Eurostat `nrg_ti_gas` records imports by country of *origin* and leaves out pure transit, so it is effectively final use. Two checks confirm this:
- Germany's 55.4 bcm from Russia in 2021 is ~56% of its consumption, which matches the government figure of ~55%.
- Czechia reports its own 8.7 bcm as Russian, so that volume is not also counted in Germany.

**Coverage.** EU27 plus Serbia, Bosnia, North Macedonia, Moldova, Switzerland and Turkey (33 countries). Pipeline and LNG are combined, in bcm and EUR bn.

**2019-2024.**
- The central value is Eurostat, partner RU.
- Ranges are ±8% for 2019-21, ±12% for 2022 and ±15% for 2023-24.
- A range is widened to include the country's own customs figure (Comtrade 271111+271121) when that figure is within 0.5-2x.
- The high end is capped at the larger of consumption and imports, x1.05.

**Special cases:**
- **Austria.** Eurostat records all its imports as "origin not specified". Estimate = consumption x Russian share (~80% before the war) and CREA. 2023 averaged ~65%; late 2023 reached 98%.
- **Switzerland.** Eurostat does not cover it. Estimate = 3.2-3.4 bcm x 43-50% (VSG, Pictet), giving ~1.45 bcm/yr before the war.
- **Moldova.** Central value is right-bank Moldova only. Transnistria's unpaid Gazprom gas is in the high case.
- **Slovakia and Hungary.** Central = Russia + 50% of "not specified".
- **Greece.** Greek customs report 20-240% more than Eurostat; customs set the high case.
- **Hungary 2024.** Eurostat's 4.06 bcm is out of line with customs (7.24) and CREA (5.87), so the central value is 5.0.

**2025 and 2026 Jan-Aug** (no annual Eurostat data yet):
- Eurostat monthly data are used where they match the annual totals for 2023-24: ES, NL, PT, TR, FI, SE.
- Otherwise, Comtrade 2025 x the Eurostat/Comtrade ratio for 2023-24.
- Otherwise, CREA x the ratio of CREA to the Eurostat-based level.
- Named overrides:
  - Hungary: 6.3 bcm own use. Szijjártó said 8-8.5 bcm arrived, with ~2 bcm passed on to Slovakia.
  - Slovakia: 2.6 bcm.
  - Bulgaria: about 0. Its CREA volume is a transit artefact.
  - Austria and Czechia: about 0 after transit through Ukraine ended on 1 Jan 2025.
  - Belgium: Eurostat's monthly figures included LNG later transshipped, until the ban on 26 Mar 2025.

**Valuation.**
- Volume x the country's own Comtrade unit value for gas from Russia. Where that is missing (DE, AT, PL, TR), the Europe-wide pipeline or LNG unit value is used.
- Turkey uses CREA's modelled price.
- 2026 = the 2025 price x CREA's price change: x1.30 for pipeline gas, x1.06 for LNG, in EUR terms.
- The price range is ±12%.
- European pipeline unit values (EUR/m3): 0.20 (2019), 0.13 (2020), 0.32 (2021), 0.97 (2022), 0.50 (2023), 0.37 (2024), 0.38 (2025).

**Totals** (33 countries, central):

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|---|---|
| bcm | 188 | 177 | 193 | 120 | 64 | 69 | 56 | 36 |
| EUR bn | 37 | 24 | 62 | 106 | 29 | 25 | 20 | 15 |

The main payers in 2025 are Turkey (6.5), France LNG (3.3), Hungary (2.6), Belgium (1.8), Spain (1.4), the Netherlands (1.1), Slovakia (1.0), Serbia (0.8) and Greece (0.7).

**Passed-on shares** (`passed_on_shares`, by period). These show where Russian gas entering each transit country physically ends up. Each share is the destination's final-use volume divided by the total entering:
- **DEU 2019-21:** DEU 0.67, NLD 0.12, FRA 0.07, CZE 0.07, AUT 0.02, CHE 0.02, BEL 0.02. Assumes 60% of Czech supply came via Germany.
- **SVK 2019-21:** ITA 0.69, AUT 0.12, SVK 0.11, CZE 0.08.
- **SVK 2023-24:** AUT 0.34, ITA 0.30, SVK 0.25, CZE 0.08, SVN 0.03.
- **AUT 2019-21:** ITA 0.81, AUT 0.19. **AUT 2023-24:** AUT 0.51, ITA 0.45.
- **HUN 2019-20:** SRB 0.18, BIH 0.02. **HUN 2025-26:** SVK 0.29.
- **SRB 2025-26:** HUN 0.55, SVK 0.22, SRB 0.21, BIH 0.02.
- **TUR 2025:** Turkey keeps 0.56 of physical entry; the rest goes into the European string. CREA already counts only Turkey's own imports as TUR.
- **BGR 2025:** HUN 0.38, SRB 0.16, SVK 0.16, GRC 0.12, Transnistria 0.10, unallocated 0.06.
- **BEL 2023-24:** 43% of Russian LNG was transshipped outside the EU, 39% stayed in Belgium, 13% went on to Germany.
- **CZE:** keeps 1.0, because CREA's Czech figure is already below Czechia's own reported use.

## 2. Price indices (`price_index`)
- Indices are EUR-based, with the 2019-2021 average = 1.00. 2026 is the January-August mean.
- Central values by year:

| Index | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|
| Urals | 1.12 | 0.72 | 1.15 | 1.43 | 1.15 | 1.24 | 0.97 | 1.21 |
| Russian products | 1.11 | 0.75 | 1.14 | 1.71 | 1.38 | 1.34 | 1.14 | 1.49 |
| Pipeline gas (realised contract prices) | 0.93 | 0.60 | 1.47 | 4.51 | 2.32 | 1.71 | 1.78 | 2.31 |
| LNG | 0.88 | 0.68 | 1.45 | 3.72 | 2.14 | 1.58 | 1.76 | 1.87 |
| Coal | 0.97 | 0.78 | 1.24 | 2.22 | 1.45 | 1.26 | 1.15 | 1.21 |
| Non-fuel goods | 0.99 | 0.98 | 1.04 | 1.16 | 1.16 | 1.15 | 1.15 | 1.18 |
| Services | 0.99 | 1.00 | 1.01 | 1.05 | 1.10 | 1.14 | 1.18 | 1.22 |

- What each series is:
  - **Urals:** Russian MinFin/MinEcon averages. 2026 is stepped from 2025 using CREA's Urals price.
  - **Russian products:** CREA's product export price. 2019-20 are back-cast from ULSD and the euro area refined-products import price index.
  - **Pipeline gas:** Comtrade unit values of Russian pipeline gas in Europe. TTF is given separately for reference; it reaches 4.8 in 2022.
  - **LNG:** Comtrade unit values of Russian LNG landed in Europe.
  - **Coal:** CREA's Russian coal price. 2019-20 are back-cast from the euro area coal import price index.
  - **Non-fuel goods:** Eurostat euro area import price index for industrial products excluding energy.
  - **Services:** euro area HICP services.
- Ranges come from alternative series, such as CREA vs MinFin vs Brent, or the EU27 vs euro area HICP.
- Also included: an all-items CPI index and the price levels behind each index.

## 3. Fuel mix of 2019-2021 imports from Russia (`fuel_mix_2019_2021`)
- Covers the top 60 importers from Russia (ranked by `trade_full.json` 2019-21).
- Data are Comtrade HS TOTAL/27/2709/2710/2711/2701, imports from Russia, summed over 2019-2021. Algeria and Bangladesh use Russia's own export reports (mirror data). Taiwan = Comtrade code 490.
- Fields: `fossil_share` = HS 27 / TOTAL; crude, products, gas, coal and other_fossil are shares of HS 27.
- **Fix for hidden gas.** Customs in DEU, AUT, POL, NLD, FRA, HUN, CHE, FIN, BEL and TUR hide Russian gas. For these countries gas is set to the transit-gas estimate, taken first from the unallocated part of HS 27 and the rest added to HS 27 and TOTAL.
- **Turkey also hides crude by partner.** After gas, the remaining unallocated HS 27 (EUR 7.1 bn) is assigned to crude.
- Examples:

| Country | Fossil share | Crude | Products | Gas | Coal |
|---|---|---|---|---|---|
| DEU | 0.79 | 0.37 | 0.12 | 0.45 | 0.06 |
| ITA | 0.77 | 0.23 | 0.11 | 0.61 | 0.04 |
| CHN | 0.66 | 0.81 | 0.03 | 0.06 | 0.09 |
| USA | 0.58 | 0.24 | 0.76 | – | – |

## 4. Resale shares of laundered-oil hubs (`hub_resale`)
**Definition.** The share of *imported* refined products that is re-exported. Bunker fuel is not counted, but is given separately as `bunker_share`.
- Proportional (fungible) estimate = exports / (imports + refinery output).
- Upper bound = exports / imports.

**Shares:**

| Hub | Low / central / high | Prototype | Verdict |
|---|---|---|---|
| SGP | 0.45 / 0.56 / 0.87 | 0.5 / 0.7 / 0.9 | slightly high |
| NLD | 0.6 / 0.74 / 0.9 | 0.4 / 0.6 / 0.8 | too low |
| BEL | 0.35 / 0.48 / 0.75 | 0.3 / 0.5 / 0.7 | confirmed |
| GRC | 0.3 / 0.5 / 0.75 | 0.2 / 0.4 / 0.6 | slightly low |
| **MLT** | **0.01 / 0.03 / 0.25** | 0.1 / 0.2 / 0.4 | **too high** |
| ARE | 0.3 / 0.42 / 0.65 | – | new |
| GIB | 0 / 0.02 / 0.1 | – | new |
| PAN | 0 / 0.01 / 0.1 | – | new |
| TGO | 0.45 / 0.65 / 0.9 | – | new |
| TUR | 0.1 / 0.2 / 0.45 | – | new |
| IND | 0.05 / 0.15 / 0.36 | – | new |

**Evidence behind each figure:**
- **SGP:** EMA data for 2024: product imports 88 Mtoe, crude 50, product exports 77; bunkers 55 Mt. Bunker share is ~0.38.
- **NLD:** Eurostat oil balance, re-export share 0.71-0.76.
- **BEL:** Eurostat oil balance, 0.46-0.48.
- **GRC:** 0.49-0.59.
- **MLT:** Malta is a bunker hub: 75-83% of its imports go to ship bunkers.
- **ARE:** Comtrade re-exports / imports were 0.38-0.45.
- **GIB:** essentially only bunkering, ~4 Mt/yr.
- **PAN:** almost no exports; Canal bunkering is supplied from free-zone storage.
- **TGO:** re-exports / imports 0.46-0.93; Lomé supplies the Sahel.
- **TUR and IND:** both refine Russian crude rather than resell imported products.

**Choice for the model.** If bunkers sold to foreign ships should count as resale, add `bunker_share`. This matters most for Malta (~0.81), Gibraltar (~0.9) and Singapore (~0.38).

## Caveats
- Comtrade weights are converted at 0.73 kg/m3, which gives about ±5% in unit values.
- TurkStream European-string volumes:
  - 2024 is derived as 16.8 / 1.08.
  - 2026 Jan-Aug (~13 bcm) is extrapolated from monthly reports.
  - 2022-23 are not used.
- In the Bulgaria 2024 shares, 33% is "unallocated". This probably reflects Hungary's 2024 volume (Eurostat 4.1 vs customs 7.2 bcm).
- The Urals averages for 2019 ($63.59) and 2020 ($41.73) were not re-verified in this session. The MinFin January-November 2020 figure ($41.04) is consistent with them.
- I did not find a bunker figure for the UAE (Fujairah, ~7 Mt/yr); its bunker share is an educated guess.
