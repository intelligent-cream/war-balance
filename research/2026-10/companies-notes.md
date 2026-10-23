# Foreign companies in Russia by home country: research notes (2026-10-17)

## Sources (all downloaded to research/raw/companies/)
- KSE Institute, 80th digest (2026-07-10): https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf. Gives aggregate tables by KSE status for 2021-2025 (2025 is preliminary).
- B4Ukraine/KSE, "The Business of Staying" (2022 data, Jul 2023): https://b4ukraine.org/pdf/BusinessOfStaying.pdf, p.8 (top 8 countries).
- B4Ukraine/KSE, "Corporate Enablers" (2021 and 2023 data, Jan 2025): https://b4ukraine.org/pdf/B4U_Report_2025.pdf, pp.16-17 (22 countries), p.25 (top 20 taxpayers).
- B4Ukraine/KSE, "Corporate Complicity" (2024 data, Aug 2025): https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf, pp.12-14.
- KSE news (2024-09-26): 2021 profit is $18.4bn and 2021 income tax is $5.4bn.
- leave-russia.org homepage and /companies-that-exited filter counts, fetched 2026-10-17.
- ECB annual USD/EUR rates: 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300.

## Blocked
- On leave-russia.org, the filter and pager URLs return HTTP 500.
- The Power BI dashboards (/bi-analytics) return 403.
- SSRN and ResearchGate return 403. Because of this, KSE's full per-country tables (SSRN 4453963, 4961551, 5375884) could not be read.
- The API is paid (Patreon) and was not used.

## Definitions and caveats
- **Country taxes:** these are corporate profit tax only, excluding rebates. Companies that had already exited are excluded (as of each report's date).
- **Total taxes:** these include VAT, payroll, excise, customs, exit and property taxes. They exist only as all-company totals: 2021 $25.9bn, 2023 $21.6bn, 2024 at least $20bn, and more than $60bn cumulative for 2022-24.
- **Report vintages differ.** The 2022 country figures come from the Jul-2023 report, the 2021 and 2023 figures from the Jan-2025 report, and the 2024 figures from the Aug-2025 report. Year-on-year comparisons are therefore indicative only.
  - Example: the 2022 EU figures ($75.2bn revenue, $594M profit tax) are internally inconsistent, since DEU+FRA+NLD alone come to $630M.
- **Net profit by country** is not published, so it is recorded as null.
- **Company counts:** the full stay/leave/exited split is published only for USA (325/387/96) and DEU (248/135/74), both from B4U24. All other countries have:
  - the "% staying" figure as reported, and
  - leave-russia.org entry totals and exited counts. Entry totals include firms that have no Russian legal entity.
- **Classification issues in the source charts:**
  - JTI is listed under Japan, while the website lists it under Switzerland.
  - OTP Bank is shown with an Italian flag. I placed it under HUN.
  - Hellenic Bottling is listed under Greece.
- **Certainty is B** throughout: KSE estimates from RAS filings. For 2024, about half of the top-100 firms did not file, so KSE extrapolated their figures.

## Key totals (all foreign groups with financials, USD bn)
| | 2021 | 2022 | 2023 | 2024 | 2025p |
|---|---|---|---|---|---|
| Revenue | 320.4 | 246.4 | 198.5 | 201.0 | 200.8 |
| Net income | 18.4 | 15.2 | 16.1 | 19.5 | 11.5 |
| Profit tax | 5.4 | 6.27 | 6.41 | 5.68 | 5.04 |

## Profit tax by country (USD m; EUR values are in the JSON)
| | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|
| USA | 915.7 | 712 | 1,200 | 1,200 |
| DEU | 633.7 | 402 | 692.5 | 594 |
| FRA | 315.4 | 118 | 357.9 | 565 |
| CHN | 70.7 | 184 | 486.5 | 517 |
| AUT | 119.6 | - | 578.9 | 494 |
| CHE | 258.6 | 275 | 315.7 | 330 |
| GBR | 128.0 | 205 | 118.8 | 301 |
| ITA | 150.0 | - | 265.5 | 295 |
| NLD | 96.0 | 110 | 107.0 | 213 |
| JPN | 275.7 | 205 | 168.1 | 123 |

For 2024, the source also gives FIN 124, HUN 91, SWE 70, DNK 61 and GRC 50.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
