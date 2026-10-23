# Taxes paid in Russia by foreign companies, by home country, 2021-2025 (EUR bn)

Output: `companies_all.json`. It covers 231 countries/territories: the 208 gap countries plus the 23 countries already in `companies.json`. Each value has a low / central / high (~90%) range.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## Scope
**Definition used here:** taxes paid by Russian subsidiaries *while foreign-owned*.

KSE's headline totals and the B4U24 per-country 2024 figures also include taxes of subsidiaries that had already been sold to Russian owners (the KSE "exited" cohort of 565 groups). These amounts are removed here, using a time-weighted share `f` of the exited cohort that was still foreign-owned in each year:

| Year | f (central) | f (range) |
|---|---|---|
| 2022 | 0.80 | 0.65–0.90 |
| 2023 | 0.45 | 0.30–0.60 |
| 2024 | 0.25 | 0.10–0.35 |
| 2025 | 0.10 | 0.02–0.15 |

The exit timeline behind `f`:
- about 157 exits by end-2022
- 348 by end-2023
- 440 by Nov-2024
- 565 by Jul-2026

The KSE-basis (all statuses) values are kept in each country's `kse_basis_all_statuses` field.

## Totals (EUR bn, central [90% range])
| | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Profit tax, in scope | 4.57 [4.07-5.12] | 5.67 [4.87-6.52] | 5.20 [4.46-6.06] | 4.31 [3.61-5.06] | 3.47 [2.78-4.30] |
| All taxes, in scope | 21.9 [19.7-24.1] | 18.0 [14.8-21.3] | 17.4 [15.1-20.0] | 15.8 [13.8-18.6] | 13.5 [11.2-15.9] |
| Profit tax, KSE basis | 4.57 | 5.95 | 5.92 | 5.25 | 4.46 |
| All taxes, KSE basis | 21.9 | 19.0 | 20.0 | 19.4 | 17.5 |

**Inputs for the KSE all-tax totals (USD bn):**
- 2021: 25.9 (KSE 80th digest)
- 2022: 20.0, derived as 41.6 for 2022-23 minus 21.6 for 2023 (B4U23)
- 2023: 21.6 (B4U23)
- 2024: about 21. B4U24 says "at least 20"; ratio checks give 19.2-22.1.
- 2025: about 19.8. Not published; estimated from a revenue ratio (21.0) and a profit-tax ratio (18.6).

## Method
1. **Two components per country.**
   - N: groups that have not exited.
   - X: the exited cohort.
2. **N for 2021 and 2023.** B4U23 gives profit tax for 22 countries, excluding exited firms.
   - These 22 countries cover about 97% (2023) and about 90% (2021) of all non-exited profit tax.
   - Every other country was allocated from a small residual. Two keys were used and combined as a geometric mean:
     - leave-russia.org non-exited entries per country (fetched 2026-10-17)
     - IMF DIP counterpart-derived FDI stock in Russia (`SCC`; Russia-reported 2021 data where SCC is missing)
   - The rates were calibrated on the B4U23 EU residual for 2023: EU non-exited firms paid about USD 2.3bn, minus USD 2,259m for the listed EU countries, leaves about USD 41m (range 10-90).
   - Each unlisted country is capped below the 20th entry of the chart (Belarus, USD 20.5m).
3. **X for 2021 and 2023.** X equals the KSE total profit tax minus all N.
   - It is split by exited-cohort revenue: KSE Sep-2024 Figure 4 revenue including exited firms, minus B4U23 revenue excluding them.
   - Figure 4 was measured from bar pixels. China's 2023 profit of 1.33bn matches the report text.
   - For other countries, X is split by leave-russia.org exited counts.
4. **2022.** The country figure is the mean of two estimates, normalised to the KSE80 2022 totals:
   - interpolated 2021/2023 shares
   - B4U22 shares (preliminary data; its non-exited total was USD 2.9bn, against 6.27bn now)
5. **2024.**
   - B4U24 per-country figures (all statuses) are used for 15 countries.
   - The remaining USD 655m is split into two groups:
     - EU: about USD 83m (EU total 2.64bn minus the listed top-10)
     - non-EU: the rest
   - Caps follow the B4U24 top-10 cut-offs: EU countries below USD 50m, non-EU below USD 123m.
6. **2025.** 2024 country shares multiplied by the KSE80 preliminary totals (N 3.80bn, X 1.25bn).
7. **All taxes** (VAT, payroll, property, excise, customs, exit taxes and profit tax). The estimate is the mean of two methods, then multiplied by the in-scope ratio:
   - the country's profit-tax share times the KSE all-tax total
   - the country's revenue share times the total, using KSE revenue for 15 countries
   - This raises China (car imports with customs duties and VAT on low profit) and Korea for 2021.
8. **Margins.** Log-normal intervals. They combine:
   - spread between methods (B4U22 vs interpolation; count key vs FDI key; profit-share vs revenue-share)
   - uncertainty in the totals
   - the range of `f`

## Certainty
- **B** (16 countries): reported by KSE/B4Ukraine in 2023 and 2024, or with direct chart constraints (KOR, TUR).
- **C** (7 countries): reported in some years only, namely FIN, POL, IND, ZAF, BLR, SVN and THA.
- **D**: allocated. This includes ESP, BEL, IRL, CAN, NOR, CZE, CYP, LUX, ARE, AUS, KAZ, HKG and SGP.
  - 114 territories have no KSE entry and no FDI position. They are set to 0.

## Caveats
- **Conduits.** Cyprus (USD 89-171bn of FDI), Luxembourg, Bermuda and similar jurisdictions mostly carry Russian round-trip capital. KSE assigns groups to their ultimate HQ, so FDI is not used as a key for conduits. Only KSE-tracked groups count.
- **Finland is inconsistent between reports.** It is absent from the B4U23 2023 top-20 (non-exited, below USD 20.5m), but B4U24 shows USD 124m for 2024 (all statuses). The 2021-23 range is therefore very wide.
- **Poland 2024** is forced down to about USD 10m by the B4U24 EU residual, against 24.8m (non-exited) in 2023.
- **Seized or temporarily managed assets** (Uniper/Unipro, Fortum, Danone, Carlsberg) follow KSE's status. Their taxes count as foreign as long as KSE lists them as leave or stay.
- **Excluded entries:** Ukrainian-HQ entries (31), plus Liechtenstein, Monaco and Puerto Rico, are not in the gap country list and are not reported.
- **Cross-check:** KSE told Euronews (2025-11-11) that Italian firms paid about USD 1.2bn in 2022-24 (about USD 400m a year; tax type not stated). That sits between this file's ITA profit tax (about USD 0.8bn in scope) and its all-taxes estimate.
- **Blocked sources:** SSRN full KSE country tables (403), leave-russia.org filtered views (500) and Power BI (403). The Bank of Russia stopped publishing FDI by country in 2022.
- **No national-press figures** for Spain, Canada, Belgium, Ireland, Australia and others were found.

## Sources
- B4U22: https://b4ukraine.org/pdf/BusinessOfStaying.pdf (2023-07)
- B4U23: https://b4ukraine.org/pdf/B4U_Report_2025.pdf (2025-01-13)
- B4U24: https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf (2025-08)
- KSE financial results 2023 (Figure 4): https://kse.ua/wp-content/uploads/2024/09/ENG_What-are-the-financial-results-of-foreign-business-in-Russia-in-2023_final.pdf
- KSE 80th digest: https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf
- leave-russia.org pages (/, /staying-companies, /leaving-companies, /companies-that-exited), fetched 2026-10-17
- IMF DIP: https://api.imf.org/external/sdmx/2.1/data/IMF.STA,DIP/RUS....A (fetched 2026-10-17)
- Euronews (es) 2025-11-11: https://es.euronews.com/2025/11/11/firmas-italianas-millones-euros-kremlin-invasion-ucrania
- ECB USD/EUR annual averages: 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300
