# Round 11: primary data for the "people" assumptions

Data: `assumptions_r11_people.json`, generated 2026-10-19 (31 proposals). **Not yet reviewed by a person. Nothing
in `site/` or `pipeline/` was changed.** Downloads and scripts are in the session scratchpad (`r11p/dl/`,
`r11p/scripts/build.py`).

Amounts are EUR bn unless stated otherwise; 2026 means January to August. FX: ECB annual averages. "Data" means the
number comes from a primary or official figure; "judgement" means a rule chosen where no figure exists. Sources
marked *[search-result snippet; page not opened]* in the JSON were seen only as search excerpts.

## Summary: old vs new

| item | country | old | new | basis |
|---|---|---|---|---|
| refugee gross | ROU 2023 | 0.16 | 0.24 (0.20-0.32) | data: RON 973m paid or owed for Jan-Jul 2023 |
| refugee gross | BGR 2022 | 0.22 | 0.30 (0.27-0.40) | data: BGN 523m to hotels by 31 Oct 2022 |
| refugee gross | HUN 2022-26 | 0.51 | 0.18 (x0.6 to x1.5) | data: government all-in total of about HUF 100bn |
| refugee gross | BEL 2022 / 2023 | 0.28 / 0.42 | 0.40 / 0.55 | data (partial): EUR 372m 2023 budget for the living wage alone |
| refugee gross | LVA 2023-26 | 0.05 / 0.04 / 0.03 / 0.015 | 0.06 / 0.06 / 0.065 / 0.04 | data: EUR 65m 2025 budget line |
| refugee gross | EST 2022 | 0.05 | 0.06 (0.045-0.10) | data: EUR 62.7m planned 2022 |
| refugee floors | IRL, GBR, GEO | - | floors only, centrals kept | data |
| refugee check | 24 European hosts 2022 | - | OECD Table 4.1 as a high-bound check | model (OECD) |
| remittance share | TJK | 0.88 (0.80-0.93) | 0.88 (0.80-0.97) | data: mirror ratio 2019-21 = 0.88 |
| remittance share | BLR | 0.45 (0.30-0.60) | 0.40 (0.30-0.50) | data: mirror ratio 2019-21 = 0.40 |
| remittances from Russia | MDA 2024 / 2025 / 2026 | 0.092 / 0.080 / 0.043 | 0.07 / 0.018 / 0.008 | data: BNM CIS remittances |
| private donations | AUT 2022 | 0.074 | 0.11 | data |
| private donations | CZE 2022 | 0.096 | 0.19 | data |
| private donations | DNK 2022 | 0.059 | 0.13 | data |
| private donations | FIN 2022 / 2023 | 0.041 / 0.005 | 0.06 / 0.008 | data (Red Cross floor) |
| private donations | LTU 2023 / 2025 | 0.006 / 0.004 | 0.02 / 0.006 | data |
| private donations | JPN 2022 | 0.58 | 0.15 (0.09-0.30) | data: documented JPY 10.8bn |
| private donations | LVA, EST 2022 | - | low bounds raised | data |
| HK onward share | 2022-25 | 0.57 / 0.55 / 0.48 / 0.37 | unchanged (re-verified) | data |
| HK onward share | 2026 | 0.372 (2025 carried) | 0.675 (0.52-0.88) | data: Comtrade Jan-May 2026 |
| CIF share | constant | 0.055 (0.035-0.075) | 0.065 (0.045-0.09), better per importer | data: OECD ITIC |
| CIF share | gold (HS 7108) | 0.055 | 0.005 (0.001-0.02) | data: ITIC reported value for Türkiye |

## 1. Refugee hosting costs for hosts without a full budget figure

**OECD International Migration Outlook 2022, Table 4.1.** The OECD PDF downloaded directly (the HTML site still
returns 403). It gives a first-year (10 months of 2022) modelled cost for 27 European hosts, EUR 26.8bn in total.
It is a standard-cost model (living costs, marginal schooling, health) on end-April 2022 stocks, not budgets, and the
OECD itself says the Hungary, Slovakia and Romania caseloads are overstated. Use it as a check and as a floor for the
high bound of C-rated hosts. It is above our 2022 centrals for Austria (0.59 vs 0.35), Belgium (0.59 vs 0.28),
Lithuania (0.22 vs 0.05), Estonia (0.17 vs 0.05), Portugal (0.17 vs 0.05) and Italy (0.74 vs 0.60). It is below our
budget-based values for Ireland, the Netherlands, Norway, Switzerland and the UK. The full table is in the JSON.

**New national figures**
- **Romania.** By 16 Aug 2023 the 50/20 scheme had paid RON 1,251.8m: RON 591.2m for 2022 and RON 660.6m in 2023.
  IGSU also reported EUR 63.7m (RON 312.2m) of arrears for Apr-Jul 2023.
  - 2023: 660.6 + 312.2 = RON 972.8m = EUR 0.197bn up to July, plus an estimated 0.03-0.08 for Aug-Dec under the
    lower lump sums. That gives 0.24, against 0.16 now.
  - About EUR 0.4bn was reimbursed from EU POCU funds (OG 25/2023), so flag it as `eu_funded`.
- **Bulgaria.** BGN 523m (EUR 0.267bn) was paid to hoteliers by 31 Oct 2022, about BGN 300m of it from EU funds
  (Tourism Minister, via Sofia Globe). The 2022 value becomes 0.30. No outturn was found for 2023-26.
- **Hungary.** The government says it spent "nearly HUF 100bn" in 1,000 days on aid to Ukraine and refugees
  together (Budapest Times, 25 Nov 2024). That is about EUR 0.25bn for everything, while our refugee-only gross for
  2022-24 is already 0.28. The proposal is 0.18 for 2022-26.
- **Belgium.** An MP quoted the 2023 budget for the living wage paid to temporary-protection holders at EUR 372m.
  That one line is 89% of our total 2023 gross. The proposal raises 2023 to 0.55 and 2022 to 0.40.
- **Latvia.** The 2025 state budget has EUR 65m for the Ukrainian Civilians Support Law. Welfare spending alone was
  about EUR 125m from Feb 2022 to Feb 2026. Current values are about half of this.
- **Estonia.** The 2022 plan was EUR 62.7m (housing 44.3m, rent 17m, goods 1.4m). This is a plan, not an outturn.
- **Ireland.** Accommodation cost EUR 0.515bn (2022) and EUR 1.49bn (2023), figures given to the Public Accounts
  Committee as reported in the press. The page itself sits behind a bot wall, and the figures confirm the 2023
  central of 2.0.
- **UK.** The ODA-eligible Ukraine costs (ICAI) were GBP 742m (2022) and 645m (2023), which is EUR 0.87bn and 0.74bn.
  NAO counts GBP 2.1bn by Sep 2023. Both are floors; the centrals stand.
- **Moldova.** Its own emergency allocations were only MDL 62.2m in 2023 (Ministry of Finance). Hosting is mostly
  donor-funded through UNHCR. Unchanged.
- **Georgia.** Documented 2022 spending is about GEL 17m: Tbilisi hotels GEL 14m and the IDP Agency GEL 2.8m. This is
  a floor, seen only in search snippets.

**Not found:** Ukrainian-specific outturns for Türkiye, Austria, Sweden, Denmark, Finland and Norway. Sweden has a
reported 2023 forecast of SEK 7bn more for municipalities and regions (the SVT page was blocked). For Slovakia, the
EUR ~130m of accommodation contributions in round4b remains the only figure. The UNHCR RRP is donor money, not host
cost, so it was not used.

## 2. Remittances from Russia

- **The Bank of Russia stopped country splits after 2021.** Its cross-border transfers page (updated 07.11.2024)
  lists country tables only to 2021. The 2022 payment-systems file has Q1 totals only, and the Russia-Belarus
  bilateral BoP stops at 2021. There is no 2022+ source on the sending side.
- **Tajikistan.** Bank of Russia outflows divided by Tajik WDI inflows give 0.88 pooled over 2019-21 (the current
  central, now backed by data) and 1.00 pooled over 2014-21. Single years range from 0.58 to 1.27. Keep 0.88 and
  raise the high to 0.97. The National Bank of Tajikistan publishes no country split.
- **Belarus.** Mirror shares are 0.43, 0.41 and 0.36 (2019-21), 0.40 pooled. Change the share from 0.45 to 0.40. All
  Belarus values scale by 0.889, so the 2022-26 change goes from +0.84 to about +0.74. NBRB could not be reached
  (timeouts).
- **Moldova.** The BNM yearbook, quarterly reports and the 2025 annual report give BoP remittances from the CIS
  (USD m): 513.6 (2019), 339.9, 293.5, 443.0 (2022), 253.2 (2023). In EUR they are 130.7m (2024) and 31.6m (2025,
  1.9% of the total).
  - The map's bank-transfer series is about 0.57 of the BoP level, based on the 2019 and 2021 ratios.
  - The proposal is 0.07 for 2024, 0.018 for 2025 and 0.008 for 2026.
  - The 2022-23 CIS figures still include transfers from Ukraine, which rose with refugees, so only their high bounds
    move.

## 3. Private donations

Primary national or large-organisation totals now exist for nine countries. In seven of them the GDP model was too
low (AUT, CZE, DNK, FIN, LTU 2023/2025, and the floors for LVA and EST). In one it was too high (Japan, 4-7x).

| country | figure | EUR bn | model central |
|---|---|---|---|
| AUT | EUR 100m given in the first two months (Fundraising Verband) | 0.10+ | 0.074 |
| CZE | almost CZK 5bn in year one, including about CZK 1.2bn to the embassy's defence account | 0.20 | 0.096 |
| DNK | over DKK 1bn in year one | 0.134 | 0.059 |
| FIN | Red Cross EUR 39m (2022), 5m (2023) | floor | 0.041 / 0.005 |
| LTU | Radarom EUR 14m (2023), over 4.4m (2025) | 0.014 / 0.004 floors | 0.006 / 0.004 |
| JPN | Red Cross JPY 7.94bn + WFP JPY 1.9bn + AEON/UNICEF JPY 0.93bn | 0.078 documented | 0.58 |
| CAN | Red Cross CAD 121m private by Apr 2022 | 0.088 | 0.31 (kept) |

No national totals were found for the USA (Candid is worldwide: USD 2.14bn in grants and 1.20bn in pledges by Apr
2025), Poland, Sweden, Norway or Korea. The model's year-to-year decay (2023 = 0.13 × 2022) is too steep for the
Baltics, where anniversary campaigns recur.

## 4. Hong Kong gold passed on to mainland China

- **Re-verified.** Comtrade's Hong Kong HS 7108 data reproduce `refine.json` for 2022-25.
- **No Russian-origin series exists.** The C&SD trade service blocks "by country of origin and by HKHS commodity" for
  re-exports. A Russian-origin onward share is therefore not published; the fungible pass-through method stays.
- **2026.** Monthly Comtrade data for Jan-May 2026 give the following:
  - gross onward share 0.708 and net 0.641, so the central is 0.675;
  - low 0.52 and high 0.878, the mainland's share of HK gold exports.
  - Carrying 2025 forward (0.372) understates China's share for 2026.
  - HK imports of Russian gold were USD 9.47bn in Jan-May 2026.

## 5. CIF share of import values (OECD ITIC)

- **Source.** The ITIC data come from OECD SDMX (`OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1`, the `sti-public` endpoint).
  They give margins in % of CIF value, by importer, for imports from Russia, 2015-2024. Most values are
  gravity-model estimates; a few are reported.
- **Weighted average.** Weighted by the map's 2022-24 imports from Russia, the margin is **6.8%** (6.77 / 6.80 / 6.85
  for 2022-24), above the 5.5% central. Distant buyers are higher: China 6.4%, India 7.2%, Türkiye 8.6%, Korea 9.3%,
  Japan 8.7%, Brazil 9.7%. EU buyers sit at 3.5-7%.
- **Proposal.** Use per-importer values (table in the JSON). If one constant is kept, use 0.045 / 0.065 / 0.09.
- **Gold.** Türkiye's reported margin on gold from Russia is 0.1-0.2% in every year 2019-24. Use 0.005
  (0.001-0.02) for HS 7108 instead of 5.5%. ITIC's modelled 3-4% for gold is not credible.
- **Limits.** ITIC ends in 2024 and is mostly modelled, so it does not capture the 2022-23 shadow-fleet freight spike.
  The ranges stay wide.

## What was not possible
- **Russia's remittances by country after 2021:** not published by anyone.
- **Russian-origin gold re-exports from Hong Kong:** not published.
- **Belarus:** the NBRB site was unreachable.
- **OECD IMO later years:** no comparable per-country hosting-cost table was found.
- **Sweden, Denmark, Finland, Norway, Austria, Türkiye:** no Ukrainian-specific outturns found.
