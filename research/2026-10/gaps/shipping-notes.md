# Earnings from carrying, insuring and servicing Russian oil and LNG exports

File: `shipping.json`. Values are EUR bn per year, 2021 to 2026 (2026 covers January to August), plus a 2019–2021 baseline. Each value has a low, central and high figure, meant as a ~90% range. Gathered 2026-10-18..

Dollars are converted at ECB yearly averages (USD per EUR): 2019 1.1195, 2020 1.1422, 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300, 2026 1.1629.

**What is counted:** money earned by companies in each country for services sold to Russia's seaborne export trade in crude, oil products and LNG. The earner is the country of the owner or manager, the insurer, the lender or the registry, never the flag. There are four parts:
- `freight`
- `ship_sales`
- `insurance_finance`
- `registry`

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## Method

### 1. Freight

A yearly gross freight pool (USD bn) is split by the owner's or manager's country.

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|---|---|
| crude | 3.0 | 3.6 | 2.2 | 8.5 | 11.0 | 8.1 | 7.2 | 9.7 |
| products | 2.5 | 2.4 | 2.0 | 5.0 | 5.0 | 4.0 | 3.6 | 3.6 |
| LNG | 0.8 | 0.9 | 1.0 | 1.3 | 1.2 | 1.1 | 1.1 | 0.8 |

**Volumes** come from KSE Institute and CREA:
- seaborne crude about 3.3–3.5 mb/d
- products about 2.1–2.4 mb/d
- LNG about 30–33 Mt a year
- KSE gives about 5.3 mb/d of crude and products together in July 2026

**Freight rates** come from Reuters and Argus quotes for Baltic and Black Sea cargoes to India, per one-way voyage:

| period | quote |
|---|---|
| 2022 | about USD 20m (record) |
| April 2023 | USD 7.8m |
| October 2023 | Suezmax USD 27–30m |
| 2025 | USD 4.7–8m |
| March–April 2026 | USD 16–23m (Hormuz spike) |
| May 2026 | USD 13m |

TASS/IEF and Argus per-barrel quotes for Baltic to China:
- early 2023: about USD 18/bbl
- June 2023: USD 13/bbl
- from December 2023: USD 14.5/bbl

**How the crude pool is built:**
- Long-haul crude (about 70% of crude from 2023) is priced at USD 7–15/bbl.
- Short-haul ESPO crude from Kozmino and the remaining Europe and Turkey cargoes are priced at USD 2–4/bbl.
- Before the war almost all crude went on short European routes at USD 1.5–3/bbl.

**Splitting the pool by owner** uses yearly shares, set in the script and based on:
- CREA counts of shadow tankers and the G7+ share (crude 17% in January 2025, 42% in July 2025)
- S&P Global: Greek owners carried 20% or more of crude in December 2023
- Windward: Greek owners carried up to 40% in some months
- Global Witness: Greek, Maltese and Cypriot ships carried just over half of seaborne oil in May 2022
- KSE: 56% of tankers were shadow-fleet ships in July 2026

**Russian-owned and Russian-controlled tankers** form a separate Russian pool (`totals.russia_own_and_controlled`). This covers Sovcomflot and the fronts registered in the UAE, Hong Kong and similar places. The pool is not assigned to any foreign country. Of UAE-registered shadow tonnage, about 45% is judged Russian-controlled. This is an educated guess.

**Opaque owners** (2–5.5% of the pool) are spread over the shadow hubs, so that missing data never counts as zero:
- UAE 35%
- Hong Kong 20%
- China 15%
- India 15%
- Vietnam, Seychelles and Malaysia 5% each

`totals.of_which_opaque_owners_spread_to_hubs` gives the amount.

**LNG:** most of the pool is the Arc7 fleet on long charters to Yamal LNG:
- Dynagas (Greece): 5 ships
- Seapeak–China LNG: 6 ships. Seapeak was Teekay LNG (Canada) until 2022 and has been owned by Stonepeak (USA) since then.
- MOL–COSCO: 3 ships
- Sovcomflot: 1 ship

The rest is Sakhalin and transshipment carriers (Japan, Norway, Belgium, UK). Shares are the same before and after the invasion, so the LNG part changes little against the baseline.

**Gross freight is revenue, not profit.** About 60–75% is time-charter earnings. The rest pays for bunker fuel and port costs, often outside the owner's country.

### 2. Ship sales

This part covers second-hand tankers sold to shadow-fleet buyers, by seller country.

**Sources:**
- Follow the Money (February 2025): more than 230 tankers from European and US owners, more than USD 6bn. Greece about USD 4bn (127 ships), UK USD 590m (22 ships), Germany USD 190m, Euronav USD 135m.
- VesselsValue: Greek owners sold 60 tankers for USD 2.47bn between January 2022 and August 2023.
- Other Western countries and non-Western sellers (Singapore, Hong Kong, China, Japan, Korea, Taiwan, Türkiye, India) are educated guesses.

**Timing:** 38%, 37%, 17%, 6% and 2% of sales fall in 2022, 2023, 2024, 2025 and 2026. Greek sales are front-loaded a little more.

**What is counted:**
- **Central:** 40% of the sale price. This is the premium, since vintage tonnage roughly doubled in value.
- **Low:** 20% of the sale price, with values ×0.7.
- **High:** 80% of the sale price, with values ×1.5. This counts the full value for buyers that are clearly Russia-linked.

**Baseline:** none. There was no shadow-fleet demand before 2022. This is a real absence, not missing data.

### 3. Insurance, finance and management

**P&I and hull premiums:** tanker-equivalents in Russian trade times USD 0.45–0.6m per ship-year:
- 340–350 tanker-equivalents before the war
- 550 in 2022
- about 700 from 2023
- 470 for January–August 2026

These premiums are split by the insurer's country:

| | UK | Norway | other IG clubs | Russia | India, UAE, China |
|---|---|---|---|---|---|
| before the war | 45% | 20% | 20% | 10% | – |
| 2024 | 18% | 9% | 7% | 50% | 13% |
| 2026 | 10% | 5% | 4% | 60% | 17% |

The other IG clubs are in Sweden, Luxembourg, the US and Japan, and get equal parts. The UK and Norwegian shares stay above zero after the December 2022 bans because voyages under the price cap kept Western cover. The G7+ share was 36–55% of tankers in 2025.

**Other items**, which follow the owner shares:
- cargo insurance: 0.04% of export value
- third-party management fees: USD 0.18m per ship-year
- finance margin: 2–5% of freight

### 4. Registry fees

Fees are ship-years times USD 20–35k per ship-year, by flag share. Panama, Gabon, Cameroon, Comoros, Sierra Leone, Barbados and the Cook Islands rise with the shadow fleet. The Liberian and Marshall Islands registries are run by US companies (LISCR, IRI), so half of their fees are counted for the USA. The total is EUR 0.01–0.02bn a year, a negligible item.

### 5. Baseline

The baseline is the mean of 2019, 2020 and 2021 for freight, insurance and finance, and registry, with the same shares as before the war. 2021 is also given on its own. It was a very weak tanker year, so the 2021 value (EUR 3.6bn) sits below the 2019–2021 mean (EUR 4.3bn).

### Ranges

- **Country range:** the shared uncertainty of the pool (×0.65 to ×1.45) combined with uncertainty about the country's share, treated as independent log errors. Share uncertainty depends on certainty: B ×0.7–1.35, C ×0.5–1.8, D ×0.35–2.5 (×0.4–2.2 for the UAE, India, China and Hong Kong).
- **Totals:** the pool error is kept fully correlated, and the components are combined as independent errors.

## Results

Totals across all foreign countries, EUR bn, central (low–high):

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| freight | – | 11.0 (7.1–15.9) | 12.8 (8.3–18.6) | 9.4 (6.1–13.6) | 8.2 (5.4–12.0) | 9.0 (5.9–13.1) |
| ship sales | – | 1.40 (0.49–4.2) | 1.31 (0.46–3.9) | 0.57 (0.20–1.7) | 0.19 (0.07–0.56) | 0.07 (0.02–0.20) |
| insurance and finance | – | 0.93 (0.51–1.68) | 0.82 (0.45–1.47) | 0.59 (0.33–1.07) | 0.56 (0.31–1.00) | 0.36 (0.20–0.65) |
| registry | – | 0.01 | 0.02 | 0.02 | 0.02 | 0.01 |
| **all foreign** | 3.6 (2.2–5.8) | **13.3 (9.3–19.0)** | **15.0 (10.4–21.3)** | **10.6 (7.3–15.0)** | **9.0 (6.1–12.8)** | **9.5 (6.3–13.5)** |

- **Baseline 2019–2021:** EUR 4.3bn a year (2.6–6.9).
- **Russian own and controlled tankers:** EUR 2.5–3.4bn a year, not assigned. Their baseline is EUR 1.6bn.
- **Gross freight pool for all owners:** EUR 14.1bn (2022), 15.9 (2023), 12.2 (2024), 10.5 (2025) and 12.1 (2026 Jan–Aug).

Largest countries, EUR bn central. The 2022–26 total includes 2026 Jan–Aug. The change is the 2022–26 total minus 4.67 years of the baseline.

| country | 2022 | 2023 | 2024 | 2025 | 2026 | 2022–26 | baseline per year | change | certainty |
|---|---|---|---|---|---|---|---|---|---|
| Greece | 5.05 | 5.25 | 2.46 | 2.34 | 1.18 | 16.3 | 1.36 | +9.9 | B |
| UAE | 0.82 | 1.99 | 1.98 | 1.56 | 2.07 | 8.4 | 0.07 | +8.1 | D |
| China | 0.86 | 1.19 | 1.05 | 1.01 | 1.53 | 5.6 | 0.35 | +4.0 | D |
| Hong Kong | 0.48 | 1.01 | 0.96 | 0.81 | 1.20 | 4.5 | 0.10 | +4.0 | D |
| India | 0.38 | 1.12 | 1.06 | 0.77 | 0.98 | 4.3 | 0.05 | +4.1 | D |
| Türkiye | 0.75 | 0.84 | 0.64 | 0.54 | 0.58 | 3.3 | 0.20 | +2.4 | C |
| Cyprus | 0.71 | 0.49 | 0.25 | 0.20 | 0.12 | 1.8 | 0.24 | +0.6 | C |
| Singapore | 0.56 | 0.45 | 0.30 | 0.18 | 0.15 | 1.6 | 0.19 | +0.8 | C |
| Vietnam | 0.05 | 0.26 | 0.30 | 0.26 | 0.37 | 1.2 | 0.00 | +1.2 | D |
| Japan | 0.37 | 0.25 | 0.20 | 0.17 | 0.11 | 1.1 | 0.19 | +0.2 | C |
| UK | 0.46 | 0.25 | 0.12 | 0.11 | 0.04 | 1.0 | 0.20 | 0.0 | C |
| Malta | 0.34 | 0.27 | 0.14 | 0.12 | 0.08 | 0.9 | 0.12 | +0.4 | C |
| Norway | 0.51 | 0.21 | 0.09 | 0.08 | 0.04 | 0.9 | 0.24 | −0.2 | C |

**Greece check against the FT.** The FT found USD 3.8bn for 389m priced barrels of crude between July 2023 and mid-2026, which is USD 9.8/bbl. A further 153m barrels had no price data. Scaled to all 542m barrels, that is about USD 1.8bn a year of crude freight. The model gives about USD 1.8bn a year for the same window.

**Difference from the earlier Greek estimate.** `uncovered.json` GRC.oil_shipping_earned covered crude only, with a central of EUR 2.3bn for 2022. This file adds products, LNG, ship sales and insurance, so Greece is higher here. This file replaces that item.

## Overlap and double counting

**Services in `uncovered.json` (`sold_to_rus`): mostly not inside, with a small overlap.**

Freight on Russian exports is paid by whoever charters the ship. That is mostly a non-resident: an Indian or Chinese refiner, or an offshore trader in Dubai or Hong Kong. So the freight never enters Russia's balance of payments, nor the carriers' services exports to Russia.

Evidence:
- **Russia's sea-freight imports:** they fell from USD 4.6bn (2021) to 2.8bn (2024 and 2025), while the foreign-owned freight estimated here rose to USD 10–14bn a year.
- **Greek transport exports to Russia (BaTiS):** they rose only from USD 0.18bn to 0.29–0.39bn a year in 2022–24. That is 4–8% of Greek earnings here.
- **Russia's insurance imports:** they fell from USD 1.2bn (2021) to under 0.15bn from 2023.

Share to remove from this file when `sold_to_rus` is also counted:

| part | share to remove (range) |
|---|---|
| freight | 5% (0–15%) |
| insurance and finance, 2021–2022 | 20% (5–40%) |
| insurance and finance, from 2023 | 10% (0–25%) |
| ship sales | 0% (0–10%, may sit in goods trade under HS 8901 when the buyer is a Russian resident) |
| registry | 0% |

The same shares are stored per country in `overlap_share_with_services_sold_to_rus`.

**`uncovered.json` GRC.oil_shipping_earned:** this file replaces it. Do not add both.

**Fossil-fuel payments in `crea.json`:**
- **Crude:** CREA values Urals free on board, so crude freight is not inside payments to Russia. Overlap 0%.
- **Products and LNG:** these are priced with Eurostat import unit values, which are CIF. An amount close to EU-route freight is probably embedded, about 30–60% of products and LNG freight, or 10–20% of all freight. This is a valuation issue in the fossil figures, and the cleaner fix is to trim CREA's product values.

## Weakest assumptions

1. **Who controls the shadow fleet.** The model treats about 45% of UAE-registered shadow tonnage as Russian-controlled, so it is left out of the UAE and other hubs. If that share were 20%, the UAE would rise by about 40%. If it were 70%, the UAE would roughly halve. The UAE, Hong Kong, India and China are all D.
2. **Freight per barrel by year,** especially 2022 and 2026. Quotes are snapshots per voyage and swing by a factor of 3 within a year. The pool range ×0.65–1.45 may be too narrow in spike years.
3. **The ship-sales premium share** (40%) is a judgement. Follow the Money gives no premium figure. Sales by non-Western sellers are guesses.
4. **Greek shares for 2022 to mid-2023** rest on press reports of shares, not on tonne-miles. The FT check covers only July 2023 onwards.
5. **Products shares** (Türkiye, Greece, the UAE) are weaker than crude shares, because there are fewer public tracker figures for product tankers.
6. **The "other shadow owners" split** (Vietnam, Seychelles, Malaysia, Oman and others) is an educated allocation of a 5–10% pool.
7. **Gross revenue is counted, not profit.** About 25–40% of freight pays for bunker fuel and port costs.

## Sources

- FT analysis via GreekReporter (7 Jul 2026) and bne IntelliNews: Greek owners earned USD 3.8bn from 389m priced barrels; 153m barrels had no price data.
- Follow the Money, "European shipowners keep Russia's shadow fleet afloat" (4 Feb 2025).
- VesselsValue via Mind.ua (Sep 2023).
- CREA monthly analysis, July 2025; CREA tracker methodology (19 May 2026).
- S&P Global Market Intelligence whitepapers (17 May 2023, 18 Dec 2023).
- Windward on Greek tanker liftings (2025).
- Global Witness via manueldelia.com (Jun 2022).
- KSE Institute Russian Oil Tracker, July and August 2026.
- Reuters freight quotes via Baird Maritime, WorldPorts and Hellenic Shipping News (2023–2026); TASS/IEF (Jul 2023); Bloomberg/Argus via Oilprice.com (2024).
- Shipping Telegraph on CREA's registered-owner counts (2024).
- Bank of Russia balance of payments, standard components (transport and insurance credits and debits, 2019–2025).
- OECD-WTO BaTiS transport exports to Russia (balanced series, 2019–2024).

Not reached directly: Kpler and Vortexa (behind paywalls; used only through CREA and Windward), Lloyd's List and TradeWinds (behind paywalls), Atlantic Council and Equasis-based studies (no country-level earnings found).
