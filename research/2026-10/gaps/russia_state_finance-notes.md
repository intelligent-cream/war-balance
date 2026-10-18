# Rosatom abroad, nuclear fuel and Russia's state loans (research 2026-10, round 5)

Gathered on 2026-10-18. The output is [`russia_state_finance.json`](russia_state_finance.json). It covers roadmap items 19 (Rosatom projects abroad and nuclear fuel) and 26 (interest and principal paid to Russia on its state loans). Values are EUR bn, nominal, per year 2019–2026 (2026 = January–August, not annualised), each with low / central / high (~90%). USD is converted at ECB yearly averages: 2019 1.1195, 2020 1.1422, 2021 1.183, 2022 1.053, 2023 1.081, 2024 1.082, 2025 1.13, 2026 1.16. **No one has reviewed this yet.**

## What the flows are

- **Rosatom abroad.** Rosatom (through ASE, TVEL and Tenex) builds nuclear plants for other countries and sells them fuel and enrichment. Usually Russia also lends the buyer most of the money: Egypt 85%, Bangladesh 90%, Hungary 80%, India most of Kudankulam 3–4, Belarus 90%. Türkiye is different. Under the build-own-operate deal Rosatom owns Akkuyu and pays for it, and Türkiye pays only for electricity once the plant runs.
- **State loans.** Russia lends to governments, mostly through the Ministry of Finance with VEB as agent. The money comes back to Russia as interest and principal. New drawdowns go the other way, from Russia to the borrower.

## The accounting rule (how 19 and 26 fit together)

When a Russian state loan pays for Rosatom's work, Russian public money is paying a Russian company. Nothing reaches Russia from abroad until the loan is repaid. So:

**money to Russia = buyer's own-funds payments to Rosatom (`rosatom.to_add`) + principal and interest actually paid (`state_loans.repayments_to_russia`)**

- Drawdowns of project loans (Egypt, Bangladesh, Hungary, India, the Belarus NPP) must **not** be subtracted. The loan-financed work they pay for is already left out of `to_add`.
- Drawdowns of budget or refinancing loans are real money from Russia to the borrower. This applies mainly to Belarus since 2022, where Russia lends Minsk the money to repay Russia. They are given separately (`drawdowns_from_russia`) so the builder can net them.
- Some customs imports from Russia were paid with Russian money: loan-financed El Dabaa steel and equipment, and Rosatom's own imports for Akkuyu. Customs data, and so `trade_full.json`, count these as the buyer's payments to Russia. A **negative** `rosatom.customs_correction` takes them out.

## Step 1: what is already in the map

| flow | in the data? | where | to add |
|---|---|---|---|
| Enriched uranium, UF6 (HS 2844) | yes | `trade_full.json` imports_from_RUS (goods) | nothing |
| Fuel assemblies, reactor parts (HS 8401) for existing VVERs (CZE, SVK, HUN, FIN, BGR, ARM, IRN, CHN) | yes | same | nothing |
| Uranium price rise | yes | `prices.json` uranium/radioactive (2844) index | nothing |
| Rosatom construction **works and services** (Egypt, Bangladesh, Hungary, India, Iran, Uzbekistan) | **no** | services from Russia in `uncovered.json` are far too small: EGY 0.2, BGD 0.03–0.19, HUN 0.08–0.18 EUR bn/yr | own-funds share → `to_add` |
| Advance payments for Paks II equipment not yet delivered | **no** | sit in the financial account, not trade | in `to_add` (HUN) |
| Hanhikivi (Finland, cancelled 2022) payments to RAOS Project | yes | Finland's services imports from Russia, 0.36 (2021) → 0.16 (2024) | nothing |
| Loan-financed NPP equipment in customs | over-counted | EGY and IND in `trade_full`; BGD already halved by `nonreport.json` paid_share 0.5 | negative `customs_correction` (EGY, IND) |
| Akkuyu equipment imported by Rosatom's Turkish company | over-counted | Türkiye's imports in `trade_full` | negative `customs_correction` (TUR) |
| Interest and principal on Russian state loans | **no** | nowhere in the map | `state_loans` |

Fuel already in customs (HS 2844 + 8401 imports from Russia, EUR bn, UN Comtrade):

| buyer | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|
| USA | 0.54 | 0.52 | 0.57 | 0.81 | 1.12 | 0.60 | 0.94 |
| China | 0.37 | 0.09 | 0.12 | 0.58 | 0.56 | 1.12 | 1.47 |
| Korea | 0.18 | 0.20 | 0.21 | 0.18 | 0.32 | 0.60 | 0.29 |
| France | 0.03 | 0.00 | 0.09 | 0.36 | 0.41 | 0.06 | 0.20 |
| Sweden | 0.40 | 0.17 | 0.20 | 0 | 0 | 0 | 0 |
| Czechia | 0.11 | 0.11 | 0.12 | 0.10 | 0.29 | 0.32 | 0.11 |
| Slovakia | 0.05 | 0.05 | 0.05 | 0.06 | 0.19 | 0.12 | 0.16 |
| Hungary | 0.07 | 0.07 | 0.05 | 0.09 | 0.14 | 0.07 | 0.17 |

Japan shows almost nothing. Bulgaria's VVER fuel is confidential at product level but sits inside its customs total. The 2022–2025 rise (US stockpiling before the 2024 import ban and its waivers; China, Korea, France) is therefore **already** counted as more money paid to Russia.

## Data found

- **World Bank International Debt Statistics (IDS)**, creditor = Russian Federation (counterpart 087). It gives public and publicly guaranteed bilateral loans plus Russian commercial-bank loans: drawdowns, principal, interest and stock per borrower. Years 2019–2024 are actuals; 2025+ are contractual projections. It covers low- and middle-income borrowers only, so not Hungary. Downloaded through the API on 2026-10-18 (IDS update of 2025-12-03).
- **UN Comtrade** public API: imports from Russia in HS 2844, 8401, 73, 84 and 85 for 2019–2025.
- **News and official statements** on Rooppur arrears and escrow, El Dabaa terms, Paks II drawdowns and prepayments, Belarus deferrals, and Rosneft's PDVSA prepayments. See `sources` in the JSON.
- **Not reached:** the Russian Ministry of Finance's own state-credit tables; Hungary's ÁKK drawdown series after 2021; the CBE's external debt by creditor; ERD flow tables for FY2025. Each would tighten a D or C series.

## How the numbers were built

**(19) `rosatom.to_add`, the buyer's own funds:**

| buyer | basis | certainty |
|---|---|---|
| Egypt | 15/85 × IDS drawdowns (range 8–30%) | C |
| Bangladesh | 10/90 × drawdowns (5–20%) | C |
| Hungary | 20% of Rosatom invoices | D |
| India | 20% × drawdowns (10–50%) | D |
| Iran (Bushehr 2–3) | educated guess | D |
| Uzbekistan (contract 2024) | educated guess | D |
| China | engineering services possibly missed by BaTiS only; the rest is in customs | D |
| Türkiye | 0; electricity purchases possible from 2026, high end only | B |

- **Hungary's invoices** were HUF 9.66bn a quarter in 2019, about EUR 0.12bn a year. They are raised for licensing and site works in 2022–24 and for the construction start in 2025–26.

**(19) `customs_correction`:**

| buyer | how | 2022–26 total |
|---|---|---|
| Egypt | −0.85 × the rise of HS 73/84/85 imports from Russia above 2019–21 (0.11 → 0.45–0.56 EUR bn in 2024–25, mainly HS 7308 structures) | −1.1 |
| Türkiye | −(HS 73+84+85 imports from Russia minus a 0.05 non-nuclear base): 0.02 (2019), 0.30 (2021), 0.97 (2024), 0.63 (2025) | −3.2 |
| India | flat −0.15 a year, so the change is about 0 | −0.7 |

**(26) `state_loans`:**

- **Main source.** IDS actuals 2019–2024 (±10%) and IDS projections for 2025–26 (2026 × 8/12, range 0.5–1.3×), with these overrides:

| borrower | override |
|---|---|
| Belarus | 2024–26 deferrals taken off (USD 0.8bn of 2024 payments to 2031–36; USD 0.25bn of principal to 2032–37) |
| Egypt | 2025–26 drawdowns guessed for peak construction; interest 0.40 / 0.33 USD bn; principal only from 15 Oct 2029 |
| Bangladesh | only money that **reached** Russia; payments since March 2022 sat in a Bangladesh Bank escrow account (USD 0.81–1.03bn by mid-2025); an OFAC licence (Aug 2025) allowed payment, but the transfer is not confirmed, so 2025 central is 0.5 USD bn |
| Viet Nam, Iraq | payments stopped from 2023 |
| Hungary | drawdowns = 80% of invoices; prepaid quickly, so principal ≈ drawdowns (low end half); D |
| Venezuela | state loan only, small; Rosneft's oil-repaid PDVSA prepayments (about USD 1.6bn in 2019, wound down by 2020) kept apart, because the schedule was set before 2019 and would distort the base |
| Cuba, Syria, Iran, Kyrgyzstan, Tajikistan, North Korea | about zero (written off, deferred or not serviced) |

- **Two views of the change.** `repayments_change_vs_2019_2021…` follows the map's usual rule. `deviation_from_schedule` treats the contractual schedule as the no-war counterfactual. **The second is recommended for (26).** Under the first, a loan that simply ends on schedule reads as a shift toward Ukraine: Indonesia, Azerbaijan, Sri Lanka, Venezuela–Rosneft, and India's lump repayment in 2019. Interest that rises because drawdowns pile up (Egypt, Bangladesh) reads as toward Russia. Neither is a war-time choice. The deviations that remain are deferrals (Belarus), stops (Viet Nam, Iraq), escrow (Bangladesh) and voluntary prepayment (Hungary).

## Biggest values (EUR bn, 2022–Aug 2026)

| country | own funds to Rosatom (base/yr → 2022–26) | customs correction | repayments to Russia (base/yr → 2022–26) | drawdowns 2022–26 | recommended shift | direction |
|---|---|---|---|---|---|---|
| Türkiye | 0 → 0 (0–0.1) | −3.2 (−3.8 to −1.6) | 0.04 → 0.05 | 0.05 | −2.5 (−3.1 to −0.8) | toward Ukraine (removes an overcount) |
| Belarus | 0 | 0 | 0.93 → 6.2 (4.6–7.9) | 3.7 | −1.1 (−1.9 to −0.4) | toward Ukraine (deferrals); net of refinancing ~2.5 |
| Hungary | 0.02 → 0.27 (0.10–0.61) | 0 | 0.10 → 1.1 (0.2–2.5) | 1.1 | +0.8 (−0.3 to +2.6) | toward Russia |
| Viet Nam | – | – | 0.18 → 0.14 | 0 | −0.7 (−0.8 to −0.3) | toward Ukraine (stopped paying) |
| Bangladesh | 0.09 → 0.51 (0.23–1.17) | 0 (paid_share) | 0.15 → 1.1 (0.1–2.9) | 4.6 | −0.6 (−1.8 to +1.3) | unclear (escrow) |
| Egypt | 0.05 → 0.90 (0.41–2.28) | −1.1 (−1.3 to −0.4) | 0.01 → 0.8 (0.6–1.2) | 5.1 | −0.4 (−1.1 to +1.6) | unclear |
| Iraq | – | – | 0.09 → 0.06 | 0 | −0.4 (−0.4 to −0.1) | toward Ukraine (stopped) |
| Uzbekistan | 0.01 → 0.26 (0.04–0.90) | 0 | 0 → 0.4 | 0.6 | +0.2 (0 to +0.9) | toward Russia |
| India | 0.13 → 0.54 (0.27–1.81) | −0.7 (flat) | 0.44 → 1.5 (0.8–2.1) | 2.7 | −0.1 (−1.5 to +1.9) | about zero |
| Iran | 0.12 → 0.56 (0.14–1.87) | 0 | 0 | 0 | 0 (−0.4 to +1.3) | about zero |
| Serbia | – | – | 0.07 → 0.42 | 0.11 | 0 | as scheduled |

All of these are small against the map's other parts. Belarus's total repayments (EUR 6.2bn) are the largest gross flow.

## What is guessed

- **Hungary (D).** No ÁKK series after 2021. Invoice levels and the prepayment habit are extrapolated. US sanctions on Gazprombank (Nov 2024) disrupted payments, and the US lifted Paks-related restrictions in mid-2025.
- **Egypt 2025–26 drawdowns (C).** IDS shows only the undrawn balance (USD 10.9bn) as a projection.
- **Bangladesh 2025–26 (C).** Whether the escrow money was released is unconfirmed.
- **Iran, Uzbekistan, China own-funds payments (D).**
- **India customs correction (D).** Kudankulam equipment enters under India's national "project imports" heading 9801, which Comtrade does not break out.
- **Venezuela, Cuba (D).**

## Overlaps and double counting

1. **Fuel and enrichment** are in `trade_full.json` goods and `prices.json`. Nothing is added here.
2. **Services** (`uncovered.json`). Construction services from Russia that Eurostat or BaTiS record are far smaller than Rosatom's work. Low ends allow for partial overlap. Finland is fully covered there.
3. **`nonreport.json` paid_share** (BGD 0.5, CUB 0.35, SYR 0.65) already books (1 − paid_share) of Russian supplies as Russian credit. Do **not** also book `drawdowns_from_russia` for these countries as Russian support.
4. **(19) and (26).** Use `to_add` + `repayments_to_russia`. Never subtract project-loan drawdowns. `combined_to_russia` in the JSON does this per country, adding ranges linearly.
5. **Military credits** (IDN, AZE, VNM, IND) sit inside the IDS lines. The arms themselves are not in the map's trade, so there is no overlap.
6. **Belarus.** Military support (`other.json`, `round4b.json`) is a separate flow. Since 2022 Belarus's drawdowns are mostly refinancing, so the honest money flow is the net (repayments − drawdowns ≈ +2.5 EUR bn over 2022–26).

## Open questions

- Should (26) use the contractual schedule as its counterfactual? That is the recommendation here. Arrears and stops come from sanctions on payment channels rather than borrowers' choices, so the sanctions label could mark them.
- Russian MinFin state-credit reports and the CBE's creditor tables would firm up Egypt and Belarus. ÁKK monthly debt reports would firm up Hungary.
- Akkuyu electricity payments: check whether unit 1 began commercial sales in 2026.
- Rosatom's capital transfers into Türkiye (several USD bn in 2022) are money **from** Russia. They are not counted here.
