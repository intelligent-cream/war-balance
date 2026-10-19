# R11 verification: aid, GDP and refugees against primary sources (2026-10-19)

The checks are in `verify_r11_aid.json`: 771 rows, each with ours / primary / source URL / match.
- `match` is `yes`, `close` or `no`. The extra value `unverified` means the primary source could not be retrieved, so no primary number is reported.
- Every "primary" value was read from a file downloaded today. None was estimated.

## 1. Aid: Kiel Ukraine Support Tracker
**The release exists.** The Kiel tracker page (kielinstitut.de) links `Ukraine_Support_Tracker__Release_31.xlsx`, dated 10/2026. Its ReadMe reads "31st release (covering January 24, 2022 to August 31, 2026)".
- Saved as `raw/kiel/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx` (13.3 MB).

**kiel.json vs the workbook:** all 42 Kiel donors were checked (489 comparisons).
- Fields compared:
  - financial, humanitarian and military allocations, total allocated and total committed, and the EU share of allocations (sheet `Country Summary (€)`);
  - calendar-year sums of `Allocations per Month`;
  - Loan + ERA from `Fig 8`.
- 485 match to rounding. The other 4 are documented choices, not errors:
  - EU_INST by year 2022/2023/2024 differs because kiel.json adds the EIB's monthly flows. The EIB is not in the EU row of the monthly sheet. The yearly differences sum to the EIB's 3.17bn, and the total of 99.77 agrees.
  - GBR `loans_face_value` is 2.68 against Fig 8's Loan of 0.03, because kiel.json adds the UK ERA loan (2.65), which Kiel codes as military.

**site/data.json `aid` vs the workbook:** 41 donors, with categories and yearly sum recomputed from the primary data. The pipeline's own documented method is: bilateral − own ERA loan + EU share × (EU aid − EU ERA 18.1bn).
- 124 match exactly and 34 are close (<2%). The close ones are EU members that receive the re-allocated 2026 Ukraine Support Loan share (+~0.5%), plus NOR and IND, which have small month-less amounts dropped by the pipeline.
- **6 are "no"**: CZE, HUN and SVK (financial category and yearly total). The site is lower by 0.07–0.16bn because the pipeline deliberately removes their share of the 2026 Ukraine Support Loan (audit item 9). This is a modelling choice and does not appear in Kiel's own per-country figures.
- **The site does not show Kiel's raw numbers.** For example, US 97.0 against Kiel's 115.4, and DEU 49.5 against Kiel's total including EU share of 53.5. ERA loans are excluded, so a reader comparing with Kiel's headline table will see gaps. Those gaps are intended, but they need to be explained on the site.

## 2. GDP (2024, EUR bn)
- World Bank WDI NY.GDP.MKTP.CD 2024 is saved at `raw/worldbank/NY.GDP.MKTP.CD_2024.json`. It was last updated 2026-10-08.
- The 40 largest economies and the 15 smallest with WB data were checked at 1.082 USD/EUR.
  - **All 55 match**, within 0.03% (the pipeline used 1.08238). TUV is "close" only because of 3-decimal rounding.
  - Across all 194 countries with a WB value, every one matches.
- Countries not in WB 2024 were checked against IMF WEO NGDPD (`raw/imf/weo_NGDPD_2024.json`). TWN, SSD, YEM and SMR match (<0.1%).
- **Unverified:** CUB, PRK, SYR and ERI, plus about 25 small territories. Neither WB nor IMF has 2024 values for them.

## 3. Refugees
**Counts.** Sources: Eurostat `migr_asytpsm` (`raw/eurostat_tp/`) and the UNHCR API for 2022–2025 (`raw/unhcr_verify/`). The top-10 hosts were checked: DEU, POL, CZE, GBR, USA, ESP, CAN, ROU, MDA and SVK.
- DEU, POL, CZE, ESP, ROU and SVK equal the Eurostat December stocks exactly, and the 2026 latest month also matches.
  - The "latest month" is 2026-08 for most countries but 2026-09 for POL, BEL and AUT.
- GBR and MDA equal UNHCR refugees + asylum seekers.
- **USA and CAN do not match UNHCR, by design.** Ours are programme-arrival estimates (US: 115k to 270k; CAN: 140k to 300k), while UNHCR shows US ~3k refugees plus up to 19k asylum seekers, and CAN 75k to 173k. Our programme numbers were not checked against DHS or IRCC here.

**Costs.**
- **Verified against primary sources:**
  - **DEU**: federal 5.5bn (2022) and 8.8bn (2023), from Bundestag Drs. 20/13346. The 34.6bn to mid-2026 comes from Kiel KPB 217.
  - **NLD**: 2022 is 1,528.4m from the Najaarsnota 2022. 2023 is 3,576m from Miljoenennota 2024 table 2.2.8, which is a budget estimate, not an outturn. 2024 JenV reception is 2,639.4m from Jaarverslag 2024.
  - **CHE**: CHF 1,500/month per person, from the SEM Programm S report 2024. This is the rate behind our rule.
  - **GBR**: NAO gives GBP 2.1bn to Sep 2023. This roughly equals our EUR 2.44bn floor for 2022–23, so it is graded close.
- **Not verified:**
  - **POL**: NIK (Incapsula) and BGK (403) are blocked. Our PLN figures equal those in the cited press article (Radio Spacja), not in a primary document.
  - **CZE**: MPSV was unreachable. The cited CTK/Brno Daily article gives 2024 aid as CZK **17.5bn**, against our 15.5bn. Its own total, 41.3bn since 2023, implies 15.5, so the article is probably wrong, but this needs the MPSV table.
- The downloaded budget documents are in `raw/refugee_budgets/`.

## Verdict
There is no sign of fabricated numbers in the aid, GDP and refugee-count inputs. Every checked value traces to the primary file. The remaining differences come from documented modelling choices:
- ERA excluded;
- the EIB added to EU years;
- the UK ERA counted as a loan;
- the CZE/HUN/SVK USL opt-out;
- US and Canadian programme counts.

The weak spots are the POL and CZE cost figures (secondary sources only) and the derived DEU 2024–26 split.
