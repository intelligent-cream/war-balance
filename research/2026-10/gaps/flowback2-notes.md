# Flowback gap-fill 2: own-industry shares, refugee donor funding, support for Russia (2026-10-17)

Data file: `flowback2.json` (same folder).
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
  - Kiel's item-level military aid was split by source, the own-industry shares were built from it, and UN refugee-plan (RRP) funding was summed by country.
- Certainty letters:
  - B = documented.
  - C = modelled, and Kiel coded where at least half of the value was sourced.
  - D = mostly assumption.

## 1. Own-industry share of military aid
**Method.** Kiel UST Release 31 codes each military item with fields for:
- source: stocks, procurement or PURL;
- stock location;
- procurement location;
- contractor.

From these I computed, per donor, the shares of:
- procurement in the donor country (domestic);
- own stocks;
- stocks bought from the US / PURL;
- procurement in Ukraine, the US or other countries;
- unknown or unspecified.

Formula: `own = [domestic + own_stocks × r + unknown × pu] / total`.
- `r` = the share of donated own-stock value that is refilled by orders to domestic industry.
- `pu` = the domestic share assumed for value with no coded source or location.
- Each country's `r` and `pu` ranges come with evidence in the `reasoning` field.

| Donor | Kiel mil. EUR bn | own share low / central / high | cert. | domestic proc. | own stocks | unknown |
|---|---|---|---|---|---|---|
| USA | 64.6 | 0.86 / 0.88 / 0.90 | B | (CSIS) | | |
| DEU | 25.0 | 0.40 / 0.50 / 0.59 | C | 0.14 | 0.16 | 0.44 |
| GBR | 16.2 | 0.44 / 0.62 / 0.74 | C | 0.13 (+0.12 Thales Belfast) | 0.36 | 0.31 |
| DNK | 10.5 | 0.14 / 0.20 / 0.28 | C | 0.10 | 0.08 | 0.47 |
| NLD | 9.4 | 0.11 / 0.17 / 0.27 | C | 0.08 | 0.23 | 0.41 |
| SWE | 9.3 | 0.54 / 0.64 / 0.73 | C | 0.24 | 0.41 | 0.19 |
| NOR | 7.5 | 0.21 / 0.28 / 0.35 | C | 0.14 | 0.10 | 0.33 |
| FRA | 6.2 | 0.70 / 0.82 / 0.90 | D | 0.10 | 0.22 | 0.61 |
| CAN | 5.8 | 0.35 / 0.43 / 0.51 | C | 0.26 | 0.08 | 0.41 |
| POL | 4.5 | 0.18 / 0.33 / 0.51 | D | 0 | 0.28 | 0.70 |
| FIN | 3.3 | 0.36 / 0.53 / 0.70 | D | 0.10 | 0.06 | 0.80 |
| ITA | 3.0 | 0.40 / 0.60 / 0.80 | D | 0 | 0.44 | 0.56 |
| BEL | 2.8 | 0.31 / 0.49 / 0.61 | D | 0.01 | 0.22 | 0.71 |
| ESP | 1.5 | 0.32 / 0.47 / 0.63 | C | 0.14 | 0.47 | 0.29 |
| LTU | 1.2 | 0.07 / 0.14 / 0.27 | D | 0.05 | 0.30 | 0.60 |
| AUS | 0.9 | 0.31 / 0.46 / 0.64 | C | 0.07 | 0.59 | 0.31 |
| EST | 0.9 | 0.15 / 0.26 / 0.40 | C | 0.11 | 0.66 | 0.21 |
| SVK | 0.7 | 0.02 / 0.10 / 0.25 | C | 0 | 0.99 | 0.01 |
| LVA | 0.65 | 0.12 / 0.20 / 0.30 | C | 0.11 | 0.62 | 0.13 |
| CZE | 0.58 | 0.56 / 0.61 / 0.68 | C | 0.52 | 0.41 | 0.07 |
| ROU | 0.41 | 0.00 / 0.04 / 0.13 | C | 0 | 0.87 (Patriot) | 0.01 |
| PRT | 0.38 | 0.07 / 0.15 / 0.28 | D | 0.03 | 0.19 | 0.66 |
| IRL | 0.31 | 0.00 / 0.03 / 0.10 | D | 0 | 0.02 | 0.98 |
| HRV | 0.28 | 0.04 / 0.13 / 0.26 | D | 0 | 0 | 0.87 |
| BGR | 0.25 | 0.19 / 0.37 / 0.56 | D | 0 | 0.01 | 0.92 |
| LUX | 0.24 | 0.00 / 0.01 / 0.06 | C | 0 | 0.32 | 0.43 |
| GRC | 0.17 | 0.09 / 0.22 / 0.40 | D | 0 | 0.22 | 0.66 |
| SVN | 0.16 | 0.00 / 0.01 / 0.07 | C | 0 | 0.42 | 0.03 |
| JPN | 0.08 | 0.01 / 0.05 / 0.18 | D | NATO CAP Trust Fund money | | |
| TUR | 0.07 | 0.50 / 0.75 / 0.90 | C | 0 | 1.00 | 0 |
| ISL | 0.06 | 0 / 0 / 0.01 | D | | | |
| NZL | 0.04 | 0 / 0.02 / 0.07 | D | | | |
| KOR | 0.015 | 0.10 / 0.22 / 0.35 | D | NATO CAP Trust Fund money | | |
| AUT | 0.003 | 0.30 / 0.60 / 0.90 | D | | | |

Switzerland gives no military aid, so its own share is null.

**EU institutions.** 0.70 / 0.78 / 0.88 of EU military aid goes to EU/EEA industry; the rest goes to Ukraine. A member state's EU share counts as "own" only in proportion to its share of EU/EEA arms production. Rough SIPRI-based shares:

| FRA | DEU | ITA | SWE | CZE | ESP | POL | NOR |
|---|---|---|---|---|---|---|---|
| 0.39 | 0.24 | 0.19 | 0.06 | 0.04 | 0.035 | 0.03 | 0.02 |

**Main changes vs `flowback.json`:**
- **DEU 0.65 → 0.50.** Kiel codes EUR 3.2bn of Patriot purchases from Raytheon as procurement in the US.
- **POL 0.70 → 0.33.** The donated Soviet stocks are being replaced mainly with Korean and US equipment.
- **CZE 0.35 → 0.61.** This counts the Czech budget only; the ammunition initiative appears in other donors' figures.
- **JPN and KOR: low.** Most of their "military" aid is money paid into the NATO CAP Trust Fund.
- **BEL 0.49.** The government says two-thirds of its 2025 package goes to Belgian firms.

**Caveats:**
- Kiel's procurement location is a lower bound on precision. For example, the Thales LMM missiles for the UK are coded as "France" but are built in Belfast; I recoded them.
- Stocks that are never replaced (Soviet-era equipment) generate no new spending.

## 2. Donor funding of refugee hosting
Sources:
- UN refugee-plan funding: OCHA FTS flows to the Ukraine RRPs for 2022–2025, by destination country.
- Additional EU and other donor money from national reporting.

| Host | donor share low / central / high | key figures |
|---|---|---|
| MDA | 0.60 / 0.80 / 0.95 | Donor money (EUR bn), shown below. Moldova's own budget: about MDL 387m (EUR ~19m) by July 2022. |
| POL | 0.02 / 0.06 / 0.15 | UN USD ~0.61bn; EU emergency fund EUR 145m; CARE / REACT-EU / FAST-CARE ≈ EUR 1.6bn is re-programmed cohesion money; EIB EUR 2bn is a loan. |
| ROU | 0.08 / 0.20 / 0.45 | UN USD ~0.23bn; EUR 39m reimbursed for the 50/20 scheme; EUR 450m CARE advance, mostly not used for refugees (OCCRP/Context.ro). |
| SVK | 0.06 / 0.15 / 0.35 | UN USD ~0.13bn; EU-reimbursed accommodation allowance May 2023–Apr 2025, about EUR 0.08–0.15bn. |
| CZE | 0.02 / 0.06 / 0.12 | UN USD ~50m; EU emergency fund EUR 27m; REACT-EU ~EUR 17m; CARE EUR 283m is cohesion money. |
| BGR | 0.05 / 0.17 / 0.35 | Of BGN 523m spent on hotels in 2022, BGN ~300m came from EU programmes; UN USD ~17m. |
| GEO | 0.05 / 0.15 / 0.35 | The state budget pays the monthly allowance; donors fund UNICEF/UNHCR/NGO work (D). |
| ARM | 0.10 / 0.30 / 0.60 | Tiny caseload, no data (D). |

Moldova donor money by year (EUR bn):

| | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| Central | 0.35 | 0.16 | 0.16 | 0.064 | 0.043 |
| Low (FTS only) | 0.28 | 0.13 | 0.13 | 0.05 | 0.026 |

Notes on Moldova:
- The central row scales the FTS year profile to UNHCR's ">USD 785m received 2022–25".
- Donor money exceeds the modelled host cost in `refugees.json` for 2022–24.
- About 31% of the plan's beneficiaries are vulnerable Moldovans, not refugees.
- **Rule:** Moldova's own cost ≈ modelled cost × (1 − donor_share). Do not also count the donor-funded part for Moldova.

## 3. Military support and people for Russia
**Totals (EUR bn):**

| Supplier | low / central / high | basis |
|---|---|---|
| PRK | 2.3 / 9.5 / 19.0 | 2023: 2.2 · 2024: 4.3 · 2025: 2.0 · 2026: 1.0 (central). INSS USD 7.7–14.4bn to end-2025, Friedrich Naumann Foundation (FNF) USD 9.8bn, KIDA-type ~USD 20bn as the high end; the low is an item floor. |
| IRN | 1.9 / 4.3 / 6.0 | Bloomberg (Jan 2026): USD 2.7bn of missiles plus the USD 1.75bn Shahed contract, plus about 300k shells; mostly 2022–24. |
| BLR | 0.5 / 1.2 / 3.0 | My valuation. 131.6 kt of ammunition (Jan 2022–Feb 2023) at USD 3k / 6k / 12k per tonne, plus later shipments, production and T-72As. |
| CHN | 5.45 / 9.0 / 18.0 | High-priority dual-use goods. These overlap the trade data and must not be added to it. The "beyond trade data" figure is null because no defensible estimate exists. |

North Korean workers in Russia (counted as people, not money):
- 15k (South Korea's NIS, Jun 2025).
- About 16–24k (multinational sanctions monitoring team, MSMT, 2026).
- Up to 25k in drone production (Ukrainian report).

**Volunteers for Ukraine.** Non-belligerent sources are preferred.

| Country | low / central / high | basis |
|---|---|---|
| COL | 2,000 / 4,500 / 7,000 | Colombian Foreign Ministry: 140 dead on Ukraine's side and 670 missing; Petro: 7,000 |
| GEO | 700 / 1,200 / 2,000 | |
| USA | 800 / 1,500 / 3,000 | |
| FIN | 60 / 100 / 150 | Finnish Foreign Ministry |
| HUN | 200 / 400 / 600 | |
| EST | 50 / 80 / 100 | |
| BLR | 450 / 1,000 / 2,000 | Flagged: citizens of a co-belligerent state |
| Total | 4,000 / 10,000 / 16,000 | Ukrainian figures, belligerent |

**Fighters for Russia** (adds to or updates `other.json`):

| Country | low / central / high | basis |
|---|---|---|
| PRK | 11,000 / 17,000 / 25,000 | NIS, INSS |
| KEN | 200 / 1,000 / 1,500 | Kenya's National Intelligence Service, Feb 2026 |
| NPL | 600 / 3,000 / 15,000 | |
| CUB | 1,000 / 3,000 / 20,000 | US cable; El País |
| IND | 126 / 202 / 300 | Indian Ministry of External Affairs |
| ZAF | 17 / 17 / 50 | South African presidency |

## Open items
- No government publishes a domestic share of its military aid; only the US (CSIS analysis) and Belgium (its 2025 package) come close. The DNK, NLD and NOR ranges rest on Kiel coding plus assumptions about backfill.
- The UN refugee-plan funding table for 2026 is not yet in FTS.
- Per-country EU AMIF/BMVI emergency allocations were not found beyond the 2022 tranche.
- Belarus and China valuations are indicative only (certainty D).
