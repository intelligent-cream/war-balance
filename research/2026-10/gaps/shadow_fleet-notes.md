# Who really owns and controls the tankers carrying Russian oil

File: `shadow_fleet.json`. Gathered 2026-10-18. Not yet reviewed by a person. Ranges are meant as about 90%.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

KSE chart readings are reused from `refine/work_kse_annual.json`, which round 4 read off the chart geometry of the KSE September 2026 tracker.

## What this is

Russia sells about 5.6–6.1 million barrels a day of crude and oil products by sea. Someone owns the tankers that carry them and earns the freight. [`shipping.json`](shipping-notes.md) already counts that freight. Its weakest point was **who** earns it.

Many shadow tankers are run by companies registered in Dubai, Hong Kong, Mumbai or the Seychelles. Some of these are genuine local businesses. Many are fronts for Sovcomflot (Russia's state tanker company) or other Russian owners.

This file replaces the country split of shipping freight with a split by **beneficial owner or commercial controller**. The rules:
- A front company counts for whoever is behind it, not for where it is registered.
- Russian-owned and Russian-controlled tankers count for **Russia itself**. They earn nothing for any foreign country.
- Two fleets are kept apart:
  - **Mainstream fleet** (KSE "white"): tankers with any link to a price-cap country, meaning owned, managed or flagged there, or insured by an International Group P&I club. Most are Greek-owned and legally carry oil under the price cap.
  - **Shadow fleet**: everything else.

All values are **gross** freight in EUR bn, not profit. The pipeline still applies `SHIPPING_PROFIT` (20/35/50%) and the services overlap. 2026 covers January to August and is not annualised. USD is converted at the same ECB yearly rates as `shipping.json`: 1.1827 (2021), 1.0530 (2022), 1.0813 (2023), 1.0824 (2024), 1.1300 (2025) and 1.1629 (2026).

## Data found

| source | what it gives |
|---|---|
| [KSE Shadow Fleet Tracker, Sep 2026](https://sanctions.kse.ua/wp-content/uploads/2026/10/KSE_Shadow_Fleer_Tracker_SEP26.pdf) | monthly shadow vs white volumes, Apr 2022–Aug 2026; shadow volume by country of ship/commercial manager and of registered owner |
| [KSE Russian Oil Tracker](https://institute.kse.ua/wp-content/uploads/2026/10/rot_eng_september_2026.pdf), 37 monthly issues | shadow share of crude and of products separately; top-10 ship managers each month (names and country) |
| [KSE, Assessing Russia's Shadow Fleet (Jun 2024)](https://sanctions.kse.ua/wp-content/uploads/2024/06/Global-Shadow-Fleet-June-2024.pdf) and [OFAC jy2121 (23 Feb 2024)](https://home.treasury.gov/news/press-releases/jy2121) | Sun Ship Management and SCF Management (Dubai) are Sovcomflot property; Stream, Fornax and later Nova, Dreamer, Greenlight and others took over ex-Sovcomflot tankers |
| [Lloyd's List (Sep 2022)](https://www.lloydslist.com/LL1142145/Greeks-shipping-half-of-Russian-crude), [Lloyd's List (Nov 2022)](https://www.lloydslist.com/LL1142763/Russia-postsanctions-tanker-tonnage-challenge-exposed-as-Greece-owners-ship-42-of-crude-in-October) | Greek-owned tankers carried 50% of oil shipments in Aug 2022 (a third in Aug 2021) and 42% of crude in Oct 2022 |
| [S&P Global via Hellenic Shipping News (Mar 2024)](https://www.hellenicshippingnews.com/greek-operators-regain-share-in-russian-crude-exports-despite-tighter-sanctions/), [S&P whitepaper (Dec 2023)](https://www.spglobal.com/market-intelligence/en/news-insights/research/russian-shipping-and-trade-sanctions-risk-analysis) | G7-linked tankers carried 52% of crude in May 2023, 30% in Jan 2024 and 33% in Feb 2024; Greek operators carried 11.5m and 16.6m bbl in Jan and Feb 2024; Greeks carried "20% or more" of crude in late 2023 |
| [Kpler via PGJ/Reuters (Jul 2025)](https://pgjonline.com/news/2025/july/greek-tankers-to-keep-moving-russian-oil-despite-new-eu-sanctions) | Greek beneficial owners: 34% of all volumes, 33% of crude and 51% of fuel oil, Jan–Jul 2025 |
| Windward ([Jun 2025](https://windward.ai/blog/greek-shipowners-fill-russias-tonnage-void-to-blunt-sanctions-impact/), [Sep 2025](https://windward.ai/blog/greek-tankers-cut-russian-crude-liftings-as-lower-eu-and-uk-price-cap-bites/), [Nov 2025](https://windward.ai/blog/greece-owned-tankers-exit-russia-crude-trades-ahead-of-u-s-sanctions-deadline/)) | Greek share of crude: 27% (Jun), 20% (Jul), 16% (Aug), under 5% (early Nov 2025); in Jun 2025, 43% of clean products |
| [FT via GreekReporter (Jul 2026)](https://greekreporter.com/2026/07/07/greek-shipping-companies-russian-oil/) | Greek firms earned USD 3.8bn from 389m priced barrels of crude between mid-2023 and mid-2026; a further 153m barrels had no price data |
| [Brookings (Feb 2025)](https://www.brookings.edu/articles/where-did-russias-shadow-fleet-come-from/) | shadow ships were about 6% of departures before the war |

Not reached: Lloyd's List Intelligence and S&P full datasets (paywalled), and Equasis studies with country-level earnings. The CREA tracker gives counts, not volume by owner country.

## How the numbers were built

**1. Mainstream vs shadow, by segment.** KSE's combined shadow share is 23% (Apr–Dec 2022), 43% (2023), 63% (2024), 55% (2025) and 58% (Jan–Aug 2026). Jan–Mar 2022 is set at 7% and 2021 at 6%. The products shadow share comes from the monthly KSE statements:

| year | products shadow share |
|---|---|
| 2022 | 12% |
| 2023 | 34% |
| 2024 | 41% |
| 2025 | 25% |
| 2026 | 30% |

Crude is the residual, with crude 58% of barrels: 7%, 23%, 49%, 79%, 76% and 78% for 2021 to 2026.

**2. Greek owners**, as a share of each segment's barrels. These are evidence-based, certainty B:

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| crude | 31% | 40% | 28% | 13% | 22% | 9% |
| products | 28% | 38% | 33% | 33% | 36% | 27% |

Check against the FT: the model gives Greek crude freight of about USD 1.65bn a year from mid-2023 to mid-2026. The FT figure, scaled to all barrels, is about USD 1.8bn a year.

**3. Other mainstream owners** share what is left of the white segment. This is an educated split based on the pre-war fleet and on who appears in the KSE top-10 tables:
- Turkey: Beks, Beşiktaş, Tokyo Gemi, Sand and Cape in products.
- Kuwait: AMPTC.
- Cyprus, Malta, Singapore, Oman and the UAE (Onex).
- Indian and Chinese owners with IG insurance.
- Russian owners that were still IG-insured in 2021 and 2022. Sovcomflot made up about a third of the non-Greek white fleet before the war.

**4. Shadow fleet: from manager country to real controller.** The KSE manager-country volumes are mapped to controllers as follows:

| KSE manager country | counted as foreign | rest goes to Russia because |
|---|---|---|
| Russia | 0% | Russian managers (South Fleet, Invest Fleet, Idas, SCF TM) |
| UAE | 15 / 20 / 25 / 32 / 20% (2022–26) | Sovcomflot chain: named chain managers carried 57–89% of UAE-managed volume ([refine](refine-notes.md#1-who-controls-the-shadow-fleet)) |
| "China" (KSE includes Hong Kong) | mainland 55% of it × 80%; Hong Kong 45% × 65% | some Sovcomflot tankers sit in Hong Kong shells (Comitana, Insania, Vimena, Anchorstar) |
| India | 45–55% | Gatik (2022–23) was suspected of a Rosneft link; later Indian firms are technical managers for unknown owners |
| Singapore | 80% | some fronts |
| Seychelles, Marshall Islands, unknown | 50%, spread over the hubs: UAE 37, Hong Kong 21, China 16, India 16, Vietnam 5, Malaysia 5 | opaque single-ship shells, judged half Russian |
| other | Türkiye 18, Vietnam 12, Azerbaijan 8, Malaysia 6, Oman 6, Indonesia 4, Georgia 3, Egypt 3, Saudi Arabia 2; opaque 13 | Russian fronts in Panama, Gabon and similar: 25% |

**5. Freight.** The crude pool is multiplied by the crude share and the products pool by the products share. Pools are from `shipping.json`, but the 2026 crude pool is USD 11.0bn instead of 9.7bn, as in `refine.json`.

Chinese and Hong Kong shadow crude mostly runs short-haul from Kozmino to China. It is counted at 0.6× the average freight per barrel, and the total pool is kept unchanged.

LNG is the Arc7 fleet on long charters. It is kept exactly as in `shipping.json` and included in `freight`.

**Ranges.** The share uncertainty depends on certainty: B ×0.8–1.25, C ×0.55–1.7, D ×0.35–2.4. It is combined with pool uncertainty (about ×0.7–1.4) as independent log errors.

## Results

Share of Russian seaborne crude and product barrels, by controller country (central):

| controller | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| **Russia (own and controlled)** | 24.6% | 25.8% | 25.3% | 31.1% | 25.7% | 30.4% |
| Greece (all mainstream) | 29.7% | 39.2% | 30.1% | 21.4% | 27.9% | 16.6% |
| China (mainland) | 3.4% | 2.8% | 5.2% | 9.0% | 8.4% | 11.8% |
| Hong Kong | 2.5% | 2.2% | 3.7% | 6.7% | 6.5% | 8.3% |
| UAE (real UAE control) | 2.7% | 4.2% | 7.6% | 8.9% | 7.8% | 5.7% |
| Türkiye | 3.9% | 4.9% | 6.4% | 5.3% | 5.8% | 6.6% |
| India | 1.5% | 2.1% | 4.8% | 4.0% | 4.5% | 4.7% |
| Cyprus | 4.3% | 3.2% | 2.5% | 1.4% | 1.4% | 2.2% |
| Singapore | 3.5% | 2.6% | 2.1% | 1.4% | 1.2% | 1.8% |
| Malta | 2.2% | 1.7% | 1.7% | 1.0% | 1.1% | 1.6% |
| mainstream fleet, all owners | 94% | 81% | 58% | 37% | 45% | 42% |
| Greek share of the mainstream fleet | 32% | 48% | 52% | 58% | 62% | 39% |
| Russian share of the shadow fleet | 30% | 70% | 58% | 49% | 46% | 51% |

Gross freight, EUR bn, central. The 2022–26 total includes Jan–Aug 2026. The last two columns show what the pipeline uses now: `shipping.json` freight on its own, then after the `refine.json` scale and the ×1.065 factor for 2026.

| country | 2022 | 2023 | 2024 | 2025 | 2026 | 2022–26 (range) | baseline per year | shipping.json | pipeline now |
|---|---|---|---|---|---|---|---|---|---|
| Greece | 5.31 | 4.67 | 2.47 | 2.86 | 1.91 | 17.2 (11.9–23.8) | 1.51 | 14.1 | 14.2 |
| China | 0.59 | 0.91 | 1.00 | 0.81 | 1.38 | 4.7 (2.4–8.4) | 0.31 | 5.2 | 4.1 |
| UAE | 0.54 | 1.15 | 1.08 | 0.81 | 0.76 | 4.3 (2.3–7.8) | 0.12 | 8.0 | 1.7 |
| Türkiye | 0.59 | 0.89 | 0.57 | 0.50 | 0.69 | 3.2 (1.7–5.8) | 0.18 | 3.1 | 3.1 |
| Hong Kong | 0.26 | 0.46 | 0.58 | 0.47 | 0.85 | 2.6 (1.4–4.7) | 0.12 | 4.1 | 2.8 |
| India | 0.28 | 0.75 | 0.48 | 0.46 | 0.68 | 2.6 (1.4–4.7) | 0.07 | 4.0 | 1.6 |
| Cyprus | 0.41 | 0.37 | 0.15 | 0.11 | 0.25 | 1.3 (0.7–2.3) | 0.19 | 1.6 | 1.6 |
| Singapore | 0.34 | 0.32 | 0.16 | 0.10 | 0.22 | 1.1 (0.6–2.1) | 0.16 | 1.3 | 1.3 |
| Malta | 0.22 | 0.24 | 0.10 | 0.08 | 0.17 | 0.8 (0.4–1.5) | 0.10 | 0.9 | 0.9 |
| Vietnam | 0.04 | 0.17 | 0.21 | 0.16 | 0.16 | 0.7 (0.3–1.8) | 0.01 | 1.2 | 1.2 |
| Kuwait (AMPTC) | 0.10 | 0.20 | 0.11 | 0.13 | 0.16 | 0.7 (0.2–1.7) | 0.03 | 0 | 0 |
| Oman | 0.04 | 0.19 | 0.14 | 0.12 | 0.16 | 0.7 (0.2–1.6) | 0.00 | 0.4 | 0.4 |
| **Russia (not counted for anyone abroad)** | 3.62 | 4.20 | 4.10 | 3.04 | 4.87 | 19.8 | 1.30 | – | – |

All foreign countries together: EUR 46.0bn gross over 2022–26. That compares with 50.4bn in `shipping.json` and about 38.6bn in the pipeline today.

## What changes against shipping.json

**What `shipping.json` assumed.** It used hand-set owner shares per year (`CRUDE` and `PRODUCTS` tables):
- The UAE got 13–17% of crude and 10–15% of products from 2023, with 45% of UAE tonnage already judged Russian.
- India got 8–10% of crude, and Hong Kong and China 6–12% each.
- Greece got 17% of crude in 2024 and 8% in 2026, and products at 18% (2024–25) and 10% (2026).
- A Russian pool of 18–28%.

Round 4 (`refine.json` `shipping_control`) then cut the UAE to 0.08–0.31× and India to 0.17–0.62×, in the pipeline only.

**What changes here:**
1. **One consistent split from measured volumes.** The shares now add up to 100% of barrels each year. They follow KSE's manager volumes and the white/shadow split, not a factor applied on top. The UAE ends between the two earlier versions:
   - EUR 4.3bn: higher than refine's 1.7bn, because the UAE now also gets its part of the opaque Seychelles and unknown owners, and UAE firms in the mainstream products trade.
   - Lower than `shipping.json`'s 8.0bn.
2. **India and Hong Kong fall** compared with `shipping.json` (4.0 → 2.6 and 4.1 → 2.6). India is still above refine.
3. **Greece rises from 14.1 to 17.2.** There are two reasons:
   - 2022 was higher than assumed (Lloyd's List: 50% of oil shipments in Aug 2022).
   - Greek owners kept about a third of product trades after leaving crude: 33–36% in 2024–25 and 27% in 2026, against 18% and 10% before. KSE shows Greek firms holding 6–9 of the top-10 product shipper spots every month from 2024 to mid-2026, and Kpler gives 51% of fuel oil.
4. **New small earners:** Kuwait (AMPTC, owned by several Arab states, based in Kuwait), Indonesia and Azerbaijan. Azerbaijani-registered owners carried 4–7% of shadow volume in KSE's owner chart. They sit in "other" managers here, at 8%.
5. **The Russian pool is larger:** 25–31% of barrels, and EUR 3–4.9bn a year gross, against 2.5–3.4bn in `shipping.json`.

## How the builder should use it

- Replace `countries.ISO3.freight` and the freight part of `baseline_2019_2021` from `shipping.json` with the values in this file.
- Then **drop** the `refine.json` `shipping_control` scaling and the 2026 ×1.065 factor in `apply_shipping()`. Both are already inside these numbers.
- Scale the owner-following `insurance_finance` by `freight_scale_vs_shipping_json`.
- Leave ship sales, registry, P&I by insurer, the profit factors and the overlap shares as they are.
- `replacement_share_tables` gives the new crude and products shares in the format of `build.py`, as an alternative way to rebuild.

## What is guessed

- **The Russian share of opaque owners (50%, plausibly 25–80%).** This is the biggest lever for the UAE, Hong Kong, China and India. At 80%, the UAE would fall by about 15% (to 3.7) and India by about 10%.
- **The mainland/Hong Kong split** of KSE "China" managers (55/45), and their foreign shares (80% and 65%).
- **The non-Greek mainstream split** and the "other" shadow managers (Vietnam, Oman, Azerbaijan, Indonesia). All are certainty D.
- **The products shadow share for 2022 and 2026** (12% and 30%). KSE gives no clean statement for these years.
- **2021** is not covered by KSE. The pre-war structure is taken from Lloyd's List (Greeks a third) and the pre-war fleet. The baseline is EUR 3.3bn of foreign freight in 2021.

## Overlaps

- This file **replaces** the freight allocation in `shipping.json` and should never be added to it.
- **Ship sales** stay in `shipping.json`. An ex-Greek tanker now run by a UAE front counts here for its controller, often Russia, and its sale premium counts for the seller. Nothing is counted twice.
- The **services overlap** (`uncovered.json` `sold_to_rus`) and the **CIF overlap** with fossil-fuel payments are unchanged, and still apply per country through `overlap_share_with_services_sold_to_rus`.
- `uncovered.json` `GRC.oil_shipping_earned` stays replaced.
- **Insurance by insurer country** is not re-estimated here.

## Open questions

- Lloyd's List Intelligence or Kpler beneficial-owner data by year would raise the Greek and Turkish shares to certainty A or B.
- Products shadow shares by manager country are not given separately by KSE, so one manager mix is used for both crude and products.
- Some 2026 Greek product voyages may breach the unrevised price cap (KSE, Aug 2026). That changes legality, not who earns the freight.
