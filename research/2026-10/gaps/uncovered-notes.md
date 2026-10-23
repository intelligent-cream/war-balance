# Flows the map does not yet count: services, hidden channels, undisclosed aid, private donations

File: `uncovered.json`. Values are EUR bn per year for 2022 to 2026 (2026 covers January to August), plus a 2021 baseline for services. Every value has a low, central and high figure, meant as a ~90% range. Gathered 2026-10-17. Not yet reviewed by a person.

Dollars are converted at ECB yearly averages (USD per EUR): 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300, 2026 1.1629.

## 1. Services trade with Russia (`services`)

For each of 199 economies:
- `sold_to_rus`: money earned from Russia. This includes what Russian tourists spend in the country.
- `bought_from_rus`: money paid to Russia.

**Sources**
- Eurostat `bop_its6_det`, partner RU, 2019–2025. Covers the EU, EFTA, candidate countries and Türkiye. 2025 is provisional.
- OECD-WTO BaTiS, 2019–2024: the countries' own reported series ("N") and the balanced estimate ("B").
- Bank of Russia balance of payments, by year and by quarter up to Q2 2026.

**Method**
- **Countries that report their own figures:** central is the reported figure. Low = min(0.9 × reported, BaTiS balanced). High = max(1.15 × reported, min(balanced, 2 × reported)).
- **Countries that do not report** (China, UAE, India, Kazakhstan, Belarus and others): central is the BaTiS balanced figure, with a range of ×0.6 to ×1.5. Certainty C.
- **2025 without data:** the 2024 value times Russia's own growth by flow, measured in USD. Russian travel imports grew 27%, other services imports 7% and services exports 9%.
- **January–August 2026:** the 2025 value times a factor of 0.66–0.71. The factor is the first-half 2026 figure plus two-thirds of Q3 2025, scaled by first-half growth. The range is widened by ×0.8 and ×1.25.
- **Russia's totals are much larger than the sum over countries.** In 2024 Russia records EUR 75bn of services imports but only about EUR 38bn is allocated to countries. The gap is mostly the jump in Russians' travel spending abroad, from USD 11.4bn in 2021 to 49.2bn in 2025, which BaTiS allocates only in part. The gap is listed in `unallocated_rus_residual_eur_bn`. It is spread over the countries' high bounds only, by their share of travel credits, capped at each country's central value.
- **Türkiye:** central is the mean of Turkey's reported figure and the BaTiS balanced figure. Turkey reports EUR 3.0bn of services exports to Russia for 2023, but about 6.3m Russian visitors at roughly USD 0.9–1.0k each imply more than USD 6bn of travel spending alone.
- **Ukraine (overridden):** Ukraine banned trade with Russia in 2022. From 2022 the only flow is Gazprom's gas transit fees, about USD 0.8–1.2bn a year, which ended on 31 Dec 2024. The BaTiS values for Ukraine are model artefacts. The residual was computed before this override, so it is about EUR 1.5–2.5bn a year too small for 2022–2024.

**Results**

Sum over all countries (central, with low–high range):

| | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|
| sold to Russia | 48.3 (36.6–85.9) | 40.3 (29.2–86.3) | 38.3 (26.5–85.3) | 39.2 (22.7–98.9) | 25.8 (12.0–76.8) |
| bought from Russia | 35.0 (24.8–60.4) | 26.8 (18.3–49.3) | 27.0 (18.2–51.7) | 27.6 (15.5–60.7) | 18.4 (8.3–48.8) |

Largest central totals for 2022–2026:
- **Sold to Russia:** Türkiye 19.8, China 14.6, Belarus 9.4, UAE 8.3, USA 7.0, India 6.8, Switzerland 6.4, Kazakhstan 5.9.
- **Bought from Russia:** China 24.0, Kazakhstan 6.9, India 6.9, Belarus 6.9, Singapore 5.4, Germany 4.9, UAE 4.6.

EU countries fall sharply. Germany's sales to Russia drop from 2.9 (2021) to 0.4 (2025).

**Greek tankers carrying Russian oil (`GRC.oil_shipping_earned`, not included in `sold_to_rus`)**
- From July 2023 to mid-2026: the FT found Greek owners earned at least USD 3.8bn.
- 2022 and the first half of 2023 are modelled (certainty D) as crude volume × Greek share × freight rate.
- Central estimates by year: EUR 2.3bn (2022), 2.3 (2023), 1.0 (2024), 1.2 (2025) and 0.9 (2026).
- This money goes to Greek owners, not to Russia. If CREA values Russian oil at delivered prices, this freight is already inside the fossil-fuel payments on the map. Check that before adding it.

## 2. Hidden payment channels (`hidden_channels`, certainty D)

Only money that does not show up anywhere in the map's goods data is added.

- **UAE gold, 2024–2026:** Swissaid reports 66 t (USD 5.4bn) in 2024. For 2024–2025 the map uses an IMF estimate of UAE imports from Russia that is too small to hold this gold. Central is half the 2024 value, carried forward with the gold price.
- **Kyrgyzstan:** partner countries record about 52 t (2024) and 16 t (2023) more gold from Kyrgyzstan than Kyrgyzstan reports exporting. The share of Russian origin is unknown, so the range is 0% / 25% / 75% of that gap.
- **Hong Kong, 2026 correction:** Hong Kong reports 99.7 t (USD 14.5bn) of Russian gold for January–July 2026. The map's 2026 goods figure repeats the 2025 rate, which leaves out about USD 9.6bn (7.5–11.5).
- **China, Türkiye, Kazakhstan, Armenia and India:** high-band margin only. Their reported gold is already in goods trade.
- **Switzerland:** 0. Its imports of Russian-origin gold are refined pre-sanction stock.

Sum over countries (central, with range): 2022 0 (0–4.4), 2023 0.25 (0–5.0), 2024 3.4 (0–10.8), 2025 3.4 (0–13.5), 2026 10.7 (6.5–19.5). The country high bounds cannot be added up. Joint upper bounds are in `upper_bound`:
- **Bank of Russia net errors and omissions:** EUR 5.8bn (2022), 8.6 (2023), 8.9 (2024), 11.8 (2025) and about 10.0 (2026). The figure is negative in every year, which means unrecorded money left Russia.
- **Unrecorded gold:** EUR 6.2bn (2022), 5.1 (2023), 2.4 (2024), 8.7 (2025) and 2.9 (2026). This is exportable gold (at most about 250 t a year) minus the gold partners record, valued at the yearly average gold price.

**Not added: crypto and payment agents.** They mostly pay for trade that customs already records. No source gives volumes by country. The figures below show the scale (`crypto_and_payment_agents`):
- Garantex: more than USD 100bn of transfers from 2022 to 2025.
- A7A5 rouble stablecoin: more than USD 100bn of transfers, but only USD 17.3bn traded on exchanges, of which USD 6.1bn against USDT.
- Payments from Russian entities to Kyrgyzstan: USD 2.8bn in 2023.

## 3. Undisclosed military aid (`undisclosed_aid`)

These are amounts beyond Kiel Release 31.

- **Germany (D):** 0 through 2024, because the published totals are already in Kiel. 2025: 0 / 0.3 / 1.5. 2026: 0 / 1.5 / 4.0. The 2026 figure comes from EUR 11.6bn appropriated against the EUR 5.45bn of 2026 aid Kiel records.
- **Italy (C):** Kiel already counts EUR 3bn. The only addition is the 12th package and later decrees (2025 central 0.2, 2026 central 0.15).
- **France (C):** gap between Kiel's valuation and the Ministry of Defence's for 2022–23 (central 1.0 in total). Gap between France's reported total and Kiel's for 2024 (0.3 / 1.0 / 2.0).
- **Greece (D):** shells and other items kept confidential. Small amounts.
- **Bulgaria (D):** the secret 2022 deliveries were commercial sales, reportedly paid by the US and UK, so they are not Bulgarian aid. Central 0.
- **Türkiye (D):** commercial sales. Central 0.
- **USA:** intelligence and covert support has no value. Set to 0.

Sum over countries (central, with range): 2022 0.6 (0–2.1), 2023 0.5 (0–1.6), 2024 1.0 (0.3–2.8), 2025 0.7 (0–3.3), 2026 1.8 (0–5.1).

## 4. Private donations to Ukraine (`private_donations`)

**Anchors (2022)**
- Germany: DZI, about EUR 1bn early in the war, then EUR 73m in 2023 and EUR 55m in 2024 from individuals.
- UK: DEC appeal, more than GBP 400m, minus the government's GBP 25m match.
- Netherlands: Giro555, EUR 184.5m.
- Switzerland: Zewo, CHF 418m.
- France: Fondation de France, EUR 16m. No national total was found, so the range is wide.
- USA: Candid, more than USD 1.2bn of private gifts, plus small donors. Central USD 2.0bn.

**Other countries:** modelled as a share of GDP in 2022, by group:
- Western donors: 0.015%
- Central and Eastern Europe: 0.03%
- Baltic states: 0.06%
- Everyone else: 0, with a high band of 0.002%

Later years are a fraction of the 2022 level: about 0.13 (2023), 0.09 (2024), 0.08 (2025) and 0.05 (2026 Jan–Aug). These fractions follow the decline seen in the DZI and Fondation de France figures.

**Poland:** private help to refugees inside Poland is reported separately in `refugee_help_at_home`. The Polish Economic Institute estimated PLN 9–10bn for the first three months alone.

**Left out:**
- foreign government grants routed through Ukrainian funds (most of Come Back Alive's UAH 31bn in 2025)
- government-paid Starlink (SpaceX's own share is in the US figure)
- Ukrainians' giving at home

United24 (UAH 56bn by May 2025) and Come Back Alive have no full split by country. They are used only as a scale check.

Sum over countries (central, with range): 2022 7.9 (4.8–17.9), 2023 1.0 (0.4–4.3), 2024 0.7 (0.3–3.1), 2025 0.6 (0.2–2.9), 2026 0.4 (0.1–2.0). The largest totals for 2022–2026: USA 2.6, Germany 1.3, UK 0.8, Japan 0.8 (modelled), Switzerland 0.6.

## Caveats
- The BaTiS balanced series for 2022 onward relies on Russian figures that are modelled, because Russia stopped reporting by partner after 2021. For EU reporters it is often 2–7 times their own reported figure, so it is used only as a bound.
- The services residual is large and has not been assigned to countries. Who earns Russians' extra USD 30bn+ of travel spending is the biggest open question in this file.
- Several sources come from search-result snippets or secondary reports: the FT figures via GreekReporter and bne, and Swissaid via its press release. Hong Kong's 2026 gold figure comes from one secondary report, which matches the Comtrade 2025 value.
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
