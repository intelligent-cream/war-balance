# Refugee hosting cost per host country, 2022 – Aug 2026

Data: `refugees.json`, generated 2026-10-17. **Not yet reviewed by a person.**
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What changed versus the current model
The old model split Kiel's EU total (EUR 163.1bn, 2022–2025) by *today's* refugee count × income.
The new model:
- uses **person-years per calendar year**. EU/EFTA come from Eurostat monthly stocks. Everyone else comes from UNHCR end-year counts with a ramp.
- uses **reported national budgets** where they exist (DEU, POL, CZE, NLD, CHE; certainty B).
- otherwise uses **person-years × k × GDP per head**, with k calibrated on those budgets (certainty C).

## Counts
- EU/EFTA: Eurostat `migr_asytpsm` (UA citizens, monthly, Mar 2022 – Sep 2026). End-year is the December stock, and 2026 is the latest month.
  - Germany has no data before Aug 2022. Those months are back-filled with the EU ramp.
- Others: UNHCR population API (refugees + asylum seekers), end-2022 to end-2025. UNHCR has no 2026 data yet.
  - 2022 person-years = end-2022 × 0.713 (EU ramp).
  - 2026 Jan–Aug = end-2025 × 0.673.
- USA: Uniting for Ukraine plus border parole. Counts are 115k / 200k / 270k / 260k / 250k (2022–2026); the last two are assumptions because the programme was paused in Jan 2025. Sources: DHS 158k by Sep 2023; Ukraine Task Force ~240k U4U to Dec 2024 + 30–35k border parole.
- Canada: CUAET arrivals. Counts are 140k / 225k / 300k / 240k / 240k. Sources: ~167k by Feb 2023; 298,128 by Apr 2024; >304k by Mar 2025. UNHCR shows 173k at end-2025.
- Poland: the "1.5m" figure is not in the data. Eurostat peaked at 1.37m (Sep 2022), then fell to 0.96m by Dec 2022 after PESEL clean-up.

## Reported figures (EUR bn; FX = ECB annual averages)
| | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) | scope |
|---|---|---|---|---|---|---|
| DEU federal | 5.5 | 8.8 | 8.3* | 8.0* | 5.3* | Drs. 20/13346 (2022–23); Bürgergeld 6.3 (2024), 5.99 (2025); KPB 217 total 34.6 to mid-2026 |
| POL Aid Fund | PLN 13.87 | 14.78 | 10.12 | 7.93 | plan PLN 1.08 for the full year | fund only |
| CZE MPSV gross | CZK 25.0 | 22.0 | 15.5 | ~15.4* | scaled | benefits, health, education, housing |
| NLD central government | 1.53 | 3.58 | 2.99 | 2.66 | 1.85 | NJN 2022, MN 2024, JV 2024, budget 2025–26 |
| CHE | rule: CHF 1,500/month × person-years | | | | | federal lump sum only |
| IRL accommodation (floor) | 0.448 | n/a | 1.165 | 0.719 | 0.40 | accommodation only |
| GBR Homes for Ukraine (floor) | £2.1bn by Sep 2023 in total | | | | | tariff + thank-you payments |

\* derived values; see each country's `note` in `refugees.json`.

Ranges for reported countries:
- **Comprehensive scope** (CZE, NLD): central = reported value.
  - CZE high = ×1.9, the OECD-2022 ratio.
  - NLD range = ×0.9 to ×1.3.
- **Partial scope** (DEU, POL, CHE): low = reported value; high = reported × the scope gap shown by broad estimates; central = geometric mean of low and high.
  - DEU high = ×1.55: Kiel's Germany figure vs federal spending (1.53), and OECD's 2022 figure vs federal (1.24).
  - POL high = ×3.0: OECD 2.8, Kiel 3.0, and the Council for Cooperation with Ukraine 3.1.
  - CHE high = ×1.5: an assumption to cover canton and commune costs.

## Calibration
k = cost per person-year ÷ GDP per head. Sixteen points, from DEU, POL, CZE and NLD for 2022–2025:
- Range: 0.055 (Czechia 2024–25) to 0.60 (Netherlands 2023); median 0.14.
- Log-normal fit: **k = 0.048 / 0.152 / 0.485** (low / central / high, ~90% interval).
- At EU-average income (~EUR 38k per head), that is about EUR 1,800 / 5,800 / 18,400 per person-year.

Cross-checks:
- Kiel's EU total implies k = 0.288, or EUR 10,850 per person-year.
- OECD's 2022 first-year figures imply k = 0.21–0.40.
- Our EU-27 total for 2022–2025 is **EUR 101bn (65–197)**, against Kiel's 163.1bn. National budget outturns (CZ, PL fund, DE federal) come out 2–3× below the Kiel/OECD modelled figures. Kiel's per-country refugee numbers are modelled, not reported.

## Caveats and open items
- Costs are gross. Refugees' tax and social contributions are not netted out (Czech MPSV reports a net surplus since 2024).
- k uses 2024 GDP per head for every year. Ireland's GDP per head is inflated by multinationals.
- The US central (EUR 11bn over 2022–26) is uncertain. Kiel shows the US at 0. The low bound is EUR 2.6bn.
- Moldova's response is mostly donor-funded (UNHCR plan: >USD 785m in 2022–25). There is a double-count risk with donors' humanitarian aid.
- Russia is excluded: UNHCR showed 1.28m (2022) and 1.23m (2023) based on Russian data, then 5.5k. Many were forcibly transferred.
- Not found:
  - the full OECD IMO 2022 per-country table (OECD site blocked);
  - Kiel's per-country refugee sheet;
  - national figures for ESP, ITA, FRA, AUT, SVK, ROU, LTU and the Nordics (all modelled, C);
  - Moldova's own budget.
- Cross-check only: OECD DAC in-donor refugee costs (all nationalities, first year), in `raw/refugees/dac1_idrc.csv`.
