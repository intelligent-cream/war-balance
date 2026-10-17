# Kiel Ukraine Support Tracker: extraction notes

## Source
- Kiel Institute Ukraine Support Tracker, **Release 31** (published 8 Oct 2026). Data covers **24 Jan 2022 to 31 Aug 2026**.
  - Workbook: https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx
  - Local copy: `research/raw/kiel/UST_Release_31.xlsx`, with Dataset_Documentation.pdf, KPB_217.pdf, KWP_2218.pdf and others.
- Kiel Policy Brief 217 (Oct 2026), "How much aid has Germany given to Ukraine?". Used for German refugee spending.
- UNHCR Refugee Data Finder API (`year=2025, coo=UKR`). Used for refugees hosted (end-2025). Saved at `research/raw/unhcr/pop_2025.json`.
- EPRS briefing 775834. Used for the Kiel estimate of EU member-state refugee spending, EUR 163.1bn for 2022–2025, aggregate only.

## Method
- **Allocated and committed amounts by type**: taken from sheet `Country Summary (€)`, using Kiel's own aggregates as the documentation recommends. Summing the raw rows double-counts.
- **Loans and grants**: from `Fig 8. Financial Aid by type`.
  - `loans_face_value` = Loan + ERA Loan.
  - Guarantees and swap lines are not counted as loans.
  - `grants_share_of_financial` = Grant / financial total.
- **ERA**: Kiel classes the UK ERA loan (EUR 2.65bn allocated) as Military. It is inside the UK's `military_allocated`, and I added it to the UK's `loans_face_value`.
- **Allocations by year**: sums of the monthly columns in `Allocations per Month`, which run from Jan 2022 to Aug 2026, so 2026 covers January to August only.
  - For EU_INST I added the European Investment Bank (EIB) monthly flows, calculated from the main data.
  - `by_year_unassigned` is the total minus the sum of the years. It is 1.30bn for Italy, and about 0 for every other donor.
- **ERA per lender** (committed / allocated, EUR bn), taken from the `ERA Loan` rows of the main data:

  | Lender | Committed | Allocated |
  |---|---|---|
  | USA | 18.34 | 18.34 |
  | EU | 18.10 | 18.10 |
  | Canada | 3.33 | 3.26 |
  | UK | 2.71 | 2.65 |
  | Japan | 2.89 | 1.58 |

- **Certainty**:
  - A: values compiled from official sources.
  - B: either more than 25% of the donor's allocated value is "calculated with prices" by Kiel (in-kind weapons), or the figure is a secondary-source estimate. Each donor also has field-level grades in `certainty_fields`.

## Caveats
- **EU members**: figures are bilateral only and exclude each member's share of EU aid. Kiel's imputed EU share is given per member (`eu_share_allocated`, `eu_share_committed`, `total_incl_eu_share_*`). Use either bilateral + EU_INST or the totals including the EU share, never both.
- **EU_INST** is Kiel's "EU (Commission and Council)" row, which in the summary includes the EIB (3.17bn).
  - Kiel has not counted the European Peace Facility (EPF) since version 16.
  - Commitments include the coded parts of the EUR 90bn Ukraine Support Loan, so EUR 90.6bn of commitments are not yet allocated.
- **Germany**: Kiel's bilateral allocations are EUR 30.8bn, against EUR 100.9bn in Berlin's official "aid" figure. The official figure includes refugee costs, export guarantees and future commitments. See KPB 217.
- **Commitments versus allocations**: `pledged_not_delivered` uses Kiel commitments, which include multi-year frameworks. "Allocated" means delivered or contracted, which is not necessarily disbursed.
- **Fig 8 versus Country Summary**: the financial totals differ slightly for Denmark (0.115 vs 0.215) and Norway (1.946 vs 2.043). These are flagged in the notes.
- **Currency**: all values are nominal EUR, converted by Kiel.

## Not found / gaps
- **Per-country refugee costs**: not in Release 31, because Kiel excludes them from the dataset.
  - DEU = EUR 34.6bn. This is federal spending only, as of June 2026, from KPB 217. Certainty A, but partial in scope.
  - POL ≈ 29.3bn and CZE ≈ 8.0bn come only from a search snippet of a Komersant UA article that cites Kiel data to Aug 2025. The page is behind Cloudflare and could not be verified, so they are graded B. Please verify them.
  - All other countries are null.
  - The Kiel Feb 2026 per-country refugee chart (EPRS Fig. 6) exists only as an image. The Wayback Machine (older releases) was unreachable.
- **Not in Kiel's donor sample**: MDA, GEO, ISR, ARE, SAU, KAZ, ARM, AZE, BRA, MEX. Their aid fields are null; refugees hosted are included where UNHCR has them.
- **IMF and World Bank**: Kiel does not track them as donors, so they are null.
- **Committed amounts by year**: not extracted. Only allocations are given by year.
