# No real alternative to Russian fuel: the captive-buyer label (round 24b)

Data: [`captive_buyers.json`](captive_buyers.json); attached in `pipeline/build_data.py` `apply_captive()` as `captive` on each labelled country; shown as a flag in the country panel. **A label only: no number changes** (check_data.py checks it).

**Decision (the owner, 22 October 2026, audit 24 D M5):** the criteria below; captive: Mongolia and Kyrgyzstan (refined fuels), Armenia (gas), Moldova (gas, 2022), Serbia (gas, 2022-2023), Bosnia and Herzegovina (gas); partly captive: Hungary and Slovakia (pipeline crude), shown too, with the reason. Belarus is not labelled (it is a party to the war).

Data: `t6_captive_buyers.json`. Comtrade shares: `_t6_comtrade_2021.json`, fetched 22 Oct 2026 from the UN Comtrade public API (`scripts/comtrade_fetch.sh`, raw files in `dl/comtrade/`). Research only. **This is a label only; no number changes.**

## Mirror of "cut by Russia"
`calc()` already labels the part of "less paid" for gas that Russia cut itself (`rusCut` = paid × `sanctions.to_rus.cut`). The captive label is its mirror. It attaches to the negative `paid` and `windfall` parts for the captive commodity: "Paid Russia more by X; of this, Y on fuel it had no practical alternative to (landlocked / single pipeline)."

## Objective criteria (all must hold)
1. **Dependence.**
   - Russia supplied at least 75% of the country's 2021 imports of the commodity: UN Comtrade HS 2709 crude, 2710 refined fuels, 2711 gas. Use national data where Comtrade books the transit country, e.g. gas through Bulgaria or Serbia.
   - Imports cover at least 50% of domestic consumption, so a country with its own production or refining is not captive.
2. **No practical alternative.** The country is landlocked, or pipeline-only for that commodity, **and** either:
   - (a) every non-Russian route's usable capacity is under 50% of the country's imports of it in that year; or
   - (b) the network and import monopoly is owned by a Russian state company (a Gazprom-owned grid).
3. **Period.** From 2022 until the first year an alternative meeting (a) is in service.

**Partly captive.** 1 holds, and an alternative exists but its capacity is officially contested (Adria for Hungary and Slovakia).

## Result
| country | status | commodity, years | dependence (Comtrade 2021, Russia's share) | alternative | money the label covers (model now) |
|---|---|---|---|---|---|
| **Mongolia** | captive | refined fuels, 2022–26 | 88.6%; Ministry 96.8% (2024), 97% (Apr 2026); no refinery ([IndraStra, Oct 2026](https://www.indrastra.com/2026/10/mongolias-fuel-crisis-when-third.html); [Moscow Times 2011](https://www.themoscowtimes.com/2011/06/23/mongolian-dependence-a-threat-a7803)) | landlocked; Chinese supply small, about 40% dearer | paid −0.27 + windfall −0.79 = **5.6 points** of its −5.5% |
| **Kyrgyzstan** | captive | refined fuels (gas: Gazprom Kyrgyzstan grid), 2022–26 | 93.7%; >90%, domestic refining ~5% ([Times of Central Asia](https://timesca.com/kyrgyzstan-seeks-alternative-fuel-suppliers-as-russian-export-restrictions-hit/)) | landlocked, EAEU; 2026 shortages when Russia restricted exports | **5.4 points** of −6.75% |
| **Armenia** | captive | gas, 2022–26 | 84.5% | single pipeline via Georgia, plus the Iran swap line; Gazprom owns the grid and the Armenian section of the Iran pipeline ([Gazprom Armenia](https://en.wikipedia.org/wiki/Gazprom_Armenia)) | windfall −0.09 (0.4 points) |
| **Moldova** | captive, 2022 only | gas | 88.7% | Gazprom only until Dec 2022, then Energocom buys on the EU market ([OSW, 8 Dec 2022](https://osw.waw.pl/en/publikacje/analyses/2022-12-08/moldova-diversifies-gas-import-sources)) | 2022 windfall share (−0.38 in total); coexists with "cut by Russia" |
| **Serbia** | captive, 2022–23 | gas | 81%; ~80% per WBIF | TurkStream via Bulgaria only, until the Bulgaria–Serbia interconnector (10 Dec 2023, 1.8 bcm ≈ 60% of needs) ([WBIF](https://wbif.eu/news-details/serbia-bulgaria-gas-pipeline-opened-diversify-energy-supplies)) | 2022–23 gas share of windfall −1.01 |
| **Bosnia and Herzegovina** | captive | gas | all piped via Serbia | single pipeline | about 0 (gas is small) |
| **Hungary** | partly captive | pipeline crude, 2022–26 | 59% (Comtrade), MOL reports ~80%+ | Adria/JANAF: JANAF says 14.4 Mt a year suffices; MOL says tests did not verify it ([Euronews fact check, 31 Mar 2026](https://euronews.com/my-europe/2026/03/31/fact-check-does-hungary-have-alternatives-to-the-druzhba-pipeline); [Reuters via MarketScreener](https://www.marketscreener.com/news/adriatic-pipeline-tests-fail-to-verify-stable-oil-supply-for-hungary-slovakia-mol-says-ce7d58d2d98afe27)) | crude share only. **Gas is not captive** (LNG via Krk, Romanian and Austrian links; the 2021 15-year Gazprom contract was a choice) |
| **Slovakia** | partly captive | pipeline crude | 95.4% | as Hungary | crude share only; gas not captive |

**Not captive**, against criteria 1 and 2:
- Tajikistan: fuels 87%, but rail routes via Uzbekistan, Turkmenistan and Kazakhstan exist (borderline).
- Kazakhstan and Uzbekistan: own production.
- North Macedonia: gas 69%, with a Greek route.
- Czechia: crude 49%; TAL/IKL, and it ended Druzhba imports in 2025.
- Austria: alternative routes; its contract is a choice.
- Georgia: Black Sea ports.
- **Belarus:** captive in fact, but it is a co-belligerent (audit H3), so it gets no buyer label.

## Expected effect
- No number changes.
- Mongolia's and Kyrgyzstan's "toward Russia" text would say that nearly all of it is fuel they had no practical alternative to.
- Hungary's text says its gas windfall is **not** captive.
- Serbia and Moldova carry the label for 2022–23 and 2022 only.

## Confidence
- **Criteria:** high, because they are mechanical.
- **Shares:** high where Comtrade is clean; lower for gas through transit countries (corrected with national sources).
- **Hungary and Slovakia:** medium. Adria's capacity is contested between JANAF and MOL.

## Open questions
1. Should "partly captive" (Hungary and Slovakia crude) be shown at all, or only full captives?
2. Should Tajikistan (87%, routes exist but are thin) be included? The criteria say no.
3. Pull the national energy balance (IEA) for imports as a share of consumption, to check criterion 1 for Tajikistan and Armenia's fuels.
