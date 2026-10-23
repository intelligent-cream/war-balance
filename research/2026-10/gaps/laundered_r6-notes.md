# Laundered oil, round 6: Brunei's refinery and Turkish relabelling ports (roadmap C2)

Gathered 2026-10-18. Output: [`laundered_r6.json`](laundered_r6.json). EUR bn, nominal, low / central / high; 2026 = January–August, not annualised. USD at ECB yearly averages (2019 1.120, 2020 1.142, 2021 1.183, 2022 1.053, 2023 1.081, 2024 1.082, 2025 1.13, 2026 1.16).
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What the two flows are

1. **Brunei (Hengyi, Pulau Muara Besar).** A Chinese-owned refinery that began running in late 2019. Since 2024 it has run more and more Russian crude: 37% in 2025 and 72% in January–July 2026, per CREA. It sells most of its diesel and jet fuel to Australia, and the rest to Singapore, Malaysia, Viet Nam and other Asia-Pacific buyers. The money Russia earns on that crude is counted for the country that buys the fuel. The model's list of refiners (India, Türkiye, China, UAE) leaves Brunei out.
2. **Turkish ports without refineries (Ceyhan, Marmara Ereğlisi, Mersin; the Dörtyol/Hatay terminals fall inside the Ceyhan–İskenderun area).** These ports import Russian diesel and other products (82–92% of their imports), store and blend them, and re-export them. Most go to the EU, where customs record them under non-Russian origins (Iraq, Turkmenistan, Kazakhstan, Azerbaijan, Türkiye, or "not specified"). This fuel is not refined: it *is* Russian product. Russia earned the whole product value, so this channel is valued at the Russian product price, not at the crude content.

## Data found

| source | what it gives | used for |
|---|---|---|
| [UN Comtrade](https://comtradeapi.un.org/) | Brunei's HS 2710 exports by partner, 2019–2025; partners' imports from Brunei (annual, plus monthly Jan–Aug 2026); Brunei's crude imports by origin | fuel by destination; crude bill |
| [CREA tracker API](https://api.russiafossiltracker.com/v0/counter?destination_iso2=BN&aggregate_by=destination_iso2,commodity,month) | Russian crude delivered directly to Brunei: 0.56 Mt (2021), 0.28, 0.23, 1.13, 1.54 Mt (2025), 1.88 Mt (Jan–Aug 2026) | low end of intake |
| CREA via [SMH/Head Topics](https://au.headtopics.com/news/majority-of-australian-fuel-from-key-refinery-traced-to-87992177), [AFUO](https://afuo.org.au/russian-blood-oil-is-still-flowing-into-australia-and-imports-from-one-asian-supplier-are-surging/) (Sep 2026) | Hengyi Russian crude: 5% (2022), 37% (2025), 72% (Jan–Jul 2026, peak 88% in Apr–Jun). 68% of the fuel sent to Australia in 2026 was Russian-derived, against 24% two years earlier. 2.6 Mt to Australia since 2022 | Russian share; check |
| [CREA, Fourth year](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) (Feb 2026) | Hengyi: 25% Russian in Mar 2024–Feb 2025, 60% in Mar 2025–Feb 2026; EUR 1.5 bn to sanctioning countries, 98% to Australia. Turkish ports, Feb 2025–Jan 2026: EUR 3.3 bn (6.7 Mt) to the EU; Greece 2.54, Cyprus 0.289, Bulgaria 0.179, Malta 0.104, Spain 0.092 | Brunei check; Turkish 2025 level and split |
| [KSE Institute](https://institute.kse.ua/wp-content/uploads/2026/06/kse_refining_loophole_eng_june_2026.pdf) (Jun 2026) | Kpler: Hengyi Russian crude 0.10 mb/d (Feb–Apr 2025), then 0.12 mb/d; 24%, 42% and 33% of feedstock; no exports to the EU | Brunei shares, 2026 |
| [CREA/CSD, A Kremlin pit stop](https://energyandcleanair.org/wp/wp-content/uploads/2024/05/CREA_CSD_A-Kremlin-pit-stop_The-EU-imported-EUR-3-bn-of-oil-products-from-Turkish-ports-handling-Russian-oil.pdf) (May 2024) | Feb 2023–Feb 2024: EU imported 5.16 Mt worth EUR 3.1 bn from the three ports. Ceyhan sent EUR 1.9 bn to the EU (92% of its imports Russian); Marmara Ereğlisi exported EUR 1.46 bn, a third to the EU; Mersin sent 0.84 Mt to the EU. Named buyers: MOH Corinth (Greece), Repsol Cartagena (Spain) | Turkish 2023 level |
| [Novaya Gazeta / CREA](https://novayagazeta.eu/en/articles/2026/06/24/the-billion-euro-loophole-en) (Jun 2026), CREA monthly reports for [April](https://energyandcleanair.org/april-2026-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/) and [August 2026](https://energyandcleanair.org/august-2026-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/) | 2026: EUR 929 mn Jan–May via Türkiye, India and Georgia; 36 of 49 cargoes left Turkish ports; Cyprus took the most | 2026 |
| [Eurostat Comext](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409) | Greek fuel imports labelled Iraq + Turkmenistan + Azerbaijan + Kazakhstan: 0.04 bn a year before the war, 1.59 (2023), 1.33 (2024), 1.57 (2025); Jan–Aug 2026 0.77 against 1.32 in Jan–Aug 2025 | member split; 2026 pace |

## How the numbers were built

### Brunei

1. **Fuel by destination.** Brunei's HS 2710 exports are almost all Hengyi's, because the small Seria refinery serves the home market. For each partner, the central value averages Brunei's reported exports with the partner's recorded imports (÷ 1.05 to remove freight). For 2026 the partners' monthly imports are used: Australia (June interpolated), Malaysia, Singapore (January–March, extended to August), Japan and the Philippines. Other partners are set to 2025 × 8/12 × 1.3 (prices were higher in 2026).
2. **× the Russian share of Hengyi's crude:**

   | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
   |---|---|---|---|---|---|---|
   | 0.10 (0.05–0.125) | 0.17 (0.08–0.25) | 0.05 (0.04–0.08) | 0.04 (0.03–0.06) | 0.22 (0.17–0.27) | 0.37 (0.28–0.50) | 0.68 (0.40–0.80) |

   Before the war, the 2021 share is uncertain: Brunei's customs give 25% (1.74 Mt of ESPO crude) and the CREA tracker gives 8%. The 2025 share is CREA's own calendar-year 37%. CREA's 60% for March 2025–February 2026 is used only as the high end.
3. **× CRUDE_CONTENT** (0.42 / 0.50 / 0.60), the ratio the builder already uses, so that buyers and refiner balance.
4. **Check.** These shares × Australia's recorded tonnes from Brunei give about 2.9 Mt of Russian-derived fuel from 2022 to July 2026. CREA gives 2.6 Mt, so this estimate is about 10% higher.

### Turkish ports

1. **EU purchases from the three ports (fuel value):**

   | | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
   |---|---|---|---|---|---|
   | value | 0.1 (0–0.3) | 2.6 (1.9–3.1) | 3.0 (2.3–3.6) | 3.3 (2.6–3.8) | 0.8 (0.3–1.4) |

   - 2022 is low because Russian products could still enter the EU directly until 5 February 2023.
   - 2023 is CREA/CSD's 3.1 bn over 13 months, cut to calendar 2023.
   - 2024 is interpolated (the Greek Comext labels were flat).
   - 2026 follows the Greek Comext pace, which was 0.44 of 2025.
2. **× money to Russia per euro: 0.756 (0.52–0.90).** This is the Russian share of the ports' supply (0.84; 0.65–0.90) × the Russian sale price relative to the EU purchase price (0.9; 0.8–1.0). For 2026 it is 0.6 (0.35–0.85).
3. **Split by member.** 2025 is from CREA. The other years use Comext and CREA/CSD's named buyers. Greece's share is 66–77%.
4. **Final consumer.** Greece resells 50% (the `energy2.json` hub share) to its customers in `hub_exports_2024.json`: Gibraltar, Lebanon, Ukraine, Libya, North Macedonia, Italy, Cyprus and others. Malta's share stays in Malta (bunkers).
5. **Overlap removed.** See below.

## Results: what to add per country (2022–2026, central, with range)

| country | channel | add 2022–2026 | range | certainty |
|---|---|---|---|---|
| Greece | Turkish ports (after 50% resale) | **2.39** | 1.11–3.65 | C |
| Singapore | Brunei (a hub: better passed on through `reassign_laundered_oil`) | 0.45 | 0.24–0.76 | C |
| Italy | Turkish ports, plus Greek resale | 0.42 | 0.18–0.68 | C |
| Australia | Brunei (replacement series minus the current one) | 0.42 | 0.06–1.09 | B |
| Cyprus | Turkish ports (net of laundered_eu's "not specified" value) | 0.38 | 0.04–0.81 | D |
| Spain | Turkish ports | 0.35 | 0.14–0.57 | C |
| Bulgaria | Turkish ports | 0.30 | 0.12–0.48 | C |
| Gibraltar, Lebanon, Ukraine, Libya, North Macedonia, Egypt | Greek resale | 0.12–0.23 each | | D |
| Malta | Turkish ports (bunkers) | 0.21 | 0.09–0.31 | D |
| Malaysia, Viet Nam | Brunei | 0.15, 0.14 | | C |
| Netherlands, Romania | Turkish ports | 0.14, 0.13 | | D |
| **Türkiye** | subtract its re-exported Russian products | **−7.28** | −3.64 to −10.91 | C |
| **Brunei** | subtract the exported Russian crude | **−1.99** | −1.03 to −3.34 | C |

Per year, Türkiye's subtraction is 0.08 (2022), 1.97 (2023), 2.27 (2024), 2.49 (2025) and 0.48 (2026). For Greece the additions are 0.03, 0.61, 0.74, 0.88 and 0.14.

**Australia.** Current `laundered_eu.json` (crude value): 0.25, 0.43, 0.57, 0.90, 0.35. The new total is the non-Brunei part plus Brunei: **0.29, 0.46, 0.73, 0.67, 0.77**.
- The current 2025 value comes from CREA's March 2025–February 2026 figure, which counts Hengyi at 60% Russian, about 0.49 of the 0.90. At 37%, Hengyi's part is 0.26, so 2025 goes **down** by 0.23.
- 2026 goes **up** by 0.42. Australia recorded USD 2.0 bn of fuel from Brunei in January–August 2026, at 68% Russian-derived. CREA's monthly cargo tracking catches only part of it: EUR 76 mn in April, against USD 226 mn in Australian customs.

These are levels. The map counts only the rise above the pre-war base:
- The Brunei channel had a small pre-war base, given as `brunei.prewar_base_2018_2021_fuel_value` (Australia about 0.06 bn of fuel a year, Singapore 0.09).
- The Turkish-port channel has a zero pre-war base. Before 2023 the EU bought Russian products directly, and that fall is already in the EU members' own payments.

## What the builder must take off the hubs

- **Türkiye.** Its payments to Russia include all its Russian product imports (CREA; `turkey_prices.json` keeps products at customs values). Subtract `subtract_reexported_russian_products_eur_bn`. This is the **gross** value at buyers, including the part already in `laundered_eu`, so the old double count also disappears. The refinery deduction (`hub_buyers.json` `turkey_refining`) is a separate flow and stays. Non-EU re-exports from the ports are not subtracted, because their buyers are unknown and the model's Turkey component partly covers them.
- **Brunei.** The deduction equals what the buyers are charged: 0.12, 0.07, 0.35, 0.52, 0.93 (2022–2026), with a pre-war average of 0.09. Brunei's customs record far less Russian crude than Kpler and CREA do (0.95 Mt against roughly 2.6–5 Mt in 2025), because cargoes moved ship-to-ship are labelled Malaysian. In 2025–26 the deduction is larger than Brunei's recorded Russian imports (0.47 and 0.37).
  - **Option B (recommended):** replace Brunei's crude from Russia with `true_russian_crude_intake_eur_bn` (0.26, 0.15, 0.84, 1.31, 1.90; pre-war average 0.29), then deduct. Brunei keeps 0.14, 0.08, 0.49, 0.78 and 0.97. That remainder is crude used for paraxylene and benzene sold to China, home use, and the gap between the crude price and CRUDE_CONTENT, the same treatment as Türkiye and India.
  - **Option A:** deduct from customs and floor at zero.

## What is guessed

- **Turkish ports:** the 2024 and 2026 values, the money-to-Russia factor, the member split outside 2025, and the share of port cargoes declared as Turkish origin (20% for Greece, 40% for other members). Iraqi-labelled fuel in Greece may be partly genuine Iraqi fuel oil, which is why the low end is wide.
- **Brunei:** the 2020–2021 shares, 2026 exports to buyers other than Australia, and the 2026 crude import value (2025 × 8/12 × 1.15).

## Overlaps

- **Brunei:** in no existing file except Australia's `laundered_eu` 2025–2026 values, which the replacement series handles.
- **Turkish ports:**
  - `hub_buyers.json` `turkey_refining.reexport_of_russian_products` (central 1.7–3.3 bn a year, never added) is the same flow and is **replaced** by this file.
  - `laundered_eu.json` counts the Turkish-labelled port cargoes (at TR share × k) and Cyprus's "not specified" imports. These are subtracted at the buyers: EUR 1.0 bn over 2022–2026, 0.37 of it in Cyprus.
  - EU direct imports of Russian products before February 2023 sit in `to_rus`, not here.
- **Not covered:** Georgia (Batumi, Kulevi) is a similar channel and is not quantified here.

## Open questions

- A CREA API key (`kpler_trade`) would give the ports' exports by buyer and year directly, and Hengyi's exports by buyer.
- Do the Iraqi, Turkmen and Kazakh labels in Greek imports belong to Turkish port cargoes? Greek customs could confirm this.
- Should Ukraine, as a buyer of Greek resale, be dropped?
