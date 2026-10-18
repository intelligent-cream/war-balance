# Russian arms exports: payments to Russia for weapons, by buyer (roadmap item 17)

Data: [`russian_arms_exports.json`](russian_arms_exports.json). Generated 2026-10-18. EUR bn, nominal. 2026 = January–August, not annualised.

## What the flow is

Countries that buy Russian weapons, spare parts, licence kits, repairs and training pay Russia for them. That money is revenue for the Russian state and its defence industry. Before the war, Russia earned about USD 13–15bn a year this way. Since 2022 the amount has fallen sharply. Russia now keeps most of its output for its own army, sanctions hit production, and the US has pushed buyers away.

On the map this is a **new part: money paid to Russia for arms.** As with every other part, it is measured as a change against what the buyer would have paid without the war:

- paying less than expected counts toward Ukraine;
- paying more counts toward Russia (Iran, Saudi Arabia, Belarus).

This is the opposite direction to `military_to_russia` (Iran's drones, North Korea's shells, Belarus's ammunition sent *to* Russia, in `flowback2.json` and `other.json`). The two must not be mixed.

## Why customs data miss it

Weapons are almost never in customs statistics. I checked UN Comtrade (public API, 2026-10-18) for each big buyer's imports from Russia in HS 93 (arms), 88 (aircraft), 89 (ships), 8411 (jet engines), 8526 (radar), 8710 (tanks), 8805 (simulators) and 8906 (warships):

| buyer | what its customs show from Russia | conclusion |
|---|---|---|
| India | HS 93: USD 0–22m/yr; HS 88: 0.5–24m; HS 89: 6–35m (but 2020: HS 8906 USD 346m, one vessel); HS 8411: <5m | S-400, frigates and licence kits are not in Indian customs. Chapter 99 (unspecified, USD 0.25–0.92bn/yr) could hide a little: high case only |
| China | HS 8411 engines: USD 12–17m (2019–21) | **Russia's own data show USD 1.57 / 1.65 / 1.77bn of HS 8411 exports to China in 2019 / 2020 / 2021.** Military engines are missing from China's data |
| Algeria | no own report 2019–23; 2024 own report: HS 8805 USD 179m + HS 8526 USD 200m | small part inside, mainly 2024 |
| Egypt, Viet Nam, Myanmar, Iran | HS 8526 radar USD 80m (Egypt 2019), otherwise near zero | not in customs |
| Kazakhstan, Serbia | HS 8802 aircraft USD 60–220m/yr (Kazakhstan), USD 52–193m (Serbia 2019–21) | partly military |

Russia's own customs service leaves out deliveries made under military-technical cooperation. Only civil and dual-use lines, such as engines, show up.

**Result:** the buyers' imports from Russia in `trade_full.json` contain almost none of this flow. The series `in_customs` gives the part that is inside: in total about EUR 0.1–0.5bn a year, mostly Algeria 2024, Kazakhstan, Serbia and India 2020.

## Data found

### Russia's national totals (payments, USD bn)

| year | official or semi-official statement | central used |
|---|---|---|
| 2019 | ~15 (FSVTS; CRS R46937 says 2020 was "roughly level with 2019") | 15.05 |
| 2020 | >15 (CRS, citing official data) | 14.9 |
| 2021 | 14.6 (Shugaev, FSVTS, via [Defense News](https://www.defensenews.com/global/europe/2022/08/29/russia-forecasts-drop-in-arms-export-revenue/)); ~15 (Chemezov) | 14.75 |
| 2022 | 5.4 by late August, forecast 10.8 (Rosoboronexport, Aug 2022); ~7 (Chemezov, [Nov 2024](https://www1.ru/en/news/2024/11/26/zakryt-svoi-potrebnosti-rossiia-snizaet-obieem-eksporta-oruziia-i-voennoi-texniki-v-2024-godu.amp.html)) | 8.1 |
| 2023 | ~6 (Chemezov); contracts signed >12 ([Rosoboronexport](https://www.globalsecurity.org/wmd/library/news/russia/2024/02/russia-240205-sputnik01.htm)) | 6.8 |
| 2024 | 13.75 claimed ([Defense News, Feb 2026](https://www.defensenews.com/global/europe/2026/02/02/russia-claims-15-billion-in-2025-arms-exports-with-focus-on-africa/)); Chemezov: "lower than 2023"; exports "halved vs 2022" ([Nov 2025](https://ru.themoscowtimes.com/2025/11/18/glava-rosteha-konstatiroval-obval-eksporta-rossiiskogo-oruzhiya-vdvoe-a180382)) | 7.0 |
| 2025 | ">15 bn foreign-currency revenue" (Putin, 30 Jan 2026); Rosoboronexport: H1 2026 contracts of USD 13bn "equal all 2025 exports" ([Jamestown, Sep 2026](https://jamestown.org/rosoboronexports-international-arms-sales-status-uncertain/)) | 9.1 |
| 2026 Jan–Aug | order book >USD 60–65bn; Su-57 to Algeria, Su-35 to Iran | 6.6 |

Independent analysts (Defence24, Jamestown) doubt the 2024 and 2025 claims. Those claims are revenue and include advances on new contracts. I therefore used them as the high end and kept the central values well below them.

Jamestown and Arbat give "USD 3bn (2023) and under 1bn (2024)". **Those are SIPRI TIV labelled as dollars, not money, and they are not used.**

### SIPRI (volumes, used only for buyer shares)

From the fact sheets of [2021](https://www.sipri.org/sites/default/files/2022-03/fs_2203_at_2021.pdf), [2023](https://www.sipri.org/sites/default/files/2024-03/fs_2403_at_2023.pdf), [2024](https://www.sipri.org/sites/default/files/2025-03/fs_2503_at_2024.pdf) and [2025](https://www.sipri.org/sites/default/files/2026-03/fs_2603_at_2025.pdf):

- Russia's share of world deliveries: 19% (2017–21), 11% (2019–23), 7.8% (2020–24), 6.8% (2021–25), down 64%.
- Main recipients:

| period | main recipients (share of Russian deliveries) |
|---|---|
| 2017–21 | India 28%, China 21%, Egypt 13%, Algeria ~11% |
| 2020–24 | India 38%, China 17%, Kazakhstan 11% |
| 2021–25 | India 48%, China 13%, Belarus 13% |

- The decline started before the war: 2020–21 volumes were 22–73% below any year in 2000–19.
- Algeria is "secretive", and SIPRI may be low there.

### Contracts and payment reports

- **India:** the S-400 contract is worth USD 5.43bn (2018). Three of the five regiments arrived by 2023; the rest are due 2026–27 after a written delay notice ([Moscow Times, Aug 2024](https://ru.themoscowtimes.com/2024/08/23/rossiya-sorvala-kontrakti-napostavku-vooruzhenii-zagranitsu-namilliardi-dollarov-a140175)). More than USD 2bn of Indian payments were stuck for about a year, and Russia stopped extending credit on a pipeline of about USD 10bn in spares (Bloomberg, Apr 2023, via [BNN](https://www.bnnbloomberg.ca/russia-says-it-has-billions-of-indian-rupees-that-it-can-t-use-1.1916440) and [Kyiv Independent](https://kyivindependent.com/bloomberg-india-russia-arms-shipments-stalled)). India's payments to all foreign arms vendors were Rs 40,330 / 43,916 / 40,840 crore in FY2019-20 to FY2021-22, about USD 5.5–5.9bn a year (Lok Sabha, [via EastMojo](https://eastmojo.com/national-news/2023/02/04/rs-1-93-lakh-crore-military-equipment-imported-between-2017-18-and-2021-22-govt/)).
- **Viet Nam:** new Russian arms are paid by offsetting Viet Nam's profits from the Rusvietpetro oil venture, about USD 8bn over about 20 years. This comes from a leaked finance-ministry document (NYT 2023), and Rostec papers show it was implemented from 2024 ([AP, Sep 2025](https://www.news4jax.com/news/world/2025/09/19/ap-exclusive-russia-vietnam-using-energy-profits-to-avoid-possible-us-sanctions-for-arms-deals/)).
- **Iran:** leaked Rostec files show 48 Su-35 for about EUR 6bn, delivered 2026–28 ([Iran International](https://www.iranintl.com/en/202510069695)). The first 20 were reported complete by July 2026.
- **Algeria:** the Su-57E order is about USD 2bn for 14 aircraft, delivered from late 2025 ([Defense News](https://defensenews.com/global/europe/2026/02/10/russian-stealth-jets-have-arrived-in-north-africa-as-filmed-by-algerian-potato-farmer), [The Aviationist](https://theaviationist.com/2026/02/11/algerias-first-su-57e/)). Leaked files also show 14 Su-34.
- **Egypt:** the Su-35 order was abandoned under US CAATSA pressure.
- **Turkey:** the S-400 (USD 2.5bn) was delivered in 2019, a one-off.
- **Armenia:** it paid for arms that were never delivered (2023).

## How the numbers were built

1. **National total per year:** the central path in the table above.
2. **Split by buyer** using contract timing (advances, deliveries, stuck payments), SIPRI shares and the customs check. China's pre-war value rests on Russia's reported engine exports. A residual "ROW" (Africa, Syria, Laos, Latin America and others) closes the total and is **not assigned** to ISO3 codes.
3. **Ranges:** multipliers on the central value per country:

| countries | low × | high × |
|---|---|---|
| India | 0.6 | 1.5 |
| China | 0.5 | 1.6 |
| Algeria, Egypt and most D countries | 0.3–0.4 | 2.0–2.5 |

4. **Expected no-war payments (`expected_no_war_per_year`):** the pre-war 2019–21 average, adjusted for:
   - one-offs, such as Turkey's S-400 and the end of China's S-400 and Su-35 contracts;
   - the pre-war decline that SIPRI documents;
   - Iran's expected purchases after the 2020 end of the UN embargo (USD 0.2bn a year).

   The 2019–21 average is also given (`prewar_avg_2019_2021`, `change_vs_prewar_avg`), but it overstates the cut.
5. **Change:** `change_vs_expected` = expected − actual, with the range from baseline and actual half-ranges in quadrature. `change_vs_expected_ex_customs` takes out the part that already sits in `trade_full` and is the recommended value.
6. **Label:** `not_buyer_choice_share` estimates how much of the fall came from Russian supply limits or the pre-war trend rather than the buyer's choice. It is a guess from the SIPRI and Rostec explanations: India 0.5, China 0.7, Egypt 0.2, others about 0.6. Like `sanctions_share`, it is only a label.

USD to EUR uses ECB annual averages: 2019 1.1195, 2020 1.1422, 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300, 2026 Jan–Aug 1.1629.

## Results: biggest country effects, 2022–Aug 2026 (EUR bn)

| country | pre-war paid/yr | expected/yr | paid 2022–26 | change vs expected, ex customs (range) | direction | cert. |
|---|---|---|---|---|---|---|
| India | 3.86 | 3.18 | 10.2 | +4.3 (−1.9 to +10.7) | toward Ukraine (less paid) | C |
| China | 2.38 | 1.64 | 4.0 | +3.7 (−0.5 to +7.3) | toward Ukraine | C |
| Egypt | 1.45 | 0.82 | 0.8 | +2.8 (+0.7 to +5.6) | toward Ukraine | D |
| Iran | 0.01 | 0.18 | 3.3 | −2.5 (−5.3 to +0.3) | toward Russia (more paid) | D |
| Algeria | 1.62 | 1.46 | 5.0 | +2.3 (−3.8 to +5.8) | toward Ukraine | D |
| Rest of world (not attributed) | 0.87 | 0.91 | 3.0 | +1.3 (−3.8 to +4.3) | toward Ukraine | D |
| Iraq | 0.26 | 0.18 | 0.3 | +0.6 (+0.1 to +1.3) | toward Ukraine | D |
| Viet Nam | 0.44 | 0.46 | 1.5 | +0.6 (−1.2 to +2.2) | toward Ukraine | D |
| Myanmar | 0.23 | 0.27 | 0.8 | +0.5 (−0.5 to +1.3) | toward Ukraine | D |
| Saudi Arabia | 0.04 | 0.04 | 0.7 | −0.5 (−1.9 to +0.4) | toward Russia | D |
| Armenia | 0.12 | 0.11 | 0.1 | +0.4 (+0.05 to +0.8) | toward Ukraine | D |
| Belarus | 0.26 | 0.27 | 1.6 | −0.3 (−2.8 to +1.1) | toward Russia | D |
| Turkey | 0.50 | 0.09 | 0.1 | +0.3 (0 to +1.2); +2.2 against the 2019–21 average | toward Ukraine | C |

The total paid to Russia for arms in 2022–Aug 2026 is about EUR 34bn central. The sum of changes against the expected level is about EUR +14.5bn toward Ukraine, Against one year's GDP (rough 2024 GDP) most effects are below 0.1%. The larger ones are Armenia about +1.7%, Algeria about +1%, Egypt and Myanmar about +0.8%, Iran about −0.7%, and India and China about +0.1% and +0.02%.

## What is guessed

- The split of the national total by buyer has no official source. Russia publishes no buyer data. Every post-2021 country value apart from the contract anchors is an educated guess (D).
- The national totals for 2024–2026: official claims (13.75 and >15) against Rostec's own "lower than 2023" and Western scepticism.
- Belarus and Kazakhstan pay CSTO and Union State domestic prices, often on Russian credit. Payments are far below SIPRI volumes.
- Iran may pay partly in kind (oil, drones, missiles).
- Africa Corps deals are paid partly in mining rights and gold.
- `expected_no_war`: judgement on what pre-war pipelines would have delivered.

## Overlaps and how they are avoided

- **`trade_full.json`:** arms are almost wholly outside buyers' customs (see the table above). `in_customs` gives the inside part per year, and `change_vs_expected_ex_customs` removes it. China's engines appear only in Russia's export data, which `trade_full` uses only as a mirror for 2019–21 non-reporters (Algeria). That is why Algeria's mirror includes about USD 60–80m of such items.
- **`military_to_russia` (`flowback2.json`, `other.json`) and `china_military.json`:** these cover the other direction. If Iran's Su-35s are partly paid with drones, counting both double counts up to about EUR 1–2bn. The builder could cap Iran at the low case or net the two.
- **Services:** repair and training of Russian equipment could show up in partners' services imports from Russia. These are likely small, and India, China and Algeria are modelled there (BaTiS), not reported.
- **`companies_all.json`:** Viet Nam's Rusvietpetro offsets are dividends given up, not taxes, so there is no overlap.
- **`residual.json`:** it concerns Russia's imports, so there is no overlap.

## Things the builder must watch

1. **The fall is mostly supply-driven.** Rostec and SIPRI say Russia chose its own army first. Showing India or China as "shifting toward Ukraine" by EUR 4bn on this part should carry the `not_buyer_choice_share` label.
2. **Do not use the plain 2019–21 average for Turkey, China and Egypt.** One-off contracts (S-400, Su-35) inflate it. Turkey would get +2.2bn instead of +0.3bn.
3. **Rest of world (EUR 3bn paid)** is not split by country.
4. **2026 is eight months.** The expected level is prorated by 8/12.

## Open questions

- SIPRI's per-year recipient TIV tables could not be downloaded (the SIPRI database server reset connections). Only the fact sheets were used.
- Whether India's chapter-99 imports from Russia (up to USD 0.9bn in 2023) contain defence items.
- Whether the official 2025 figure includes Indian rupee balances converted late, which would shift India's payments between years.
