# Aid to Ukraine: the 190 countries outside the Kiel tracker

File: `aid_gaps.json`. EUR bn per year, 2022 to 2026 (2026 covers January to August). Every year has low, central and high values, meant as a ~90% range. Gathered 2026-10-17. Not yet reviewed by a person.

## Method
1. **UN OCHA FTS.** We downloaded every incoming flow to Ukraine for 2022–2026 from `api.hpc.tools/v1/public/fts/flow?countryISO3=UKR&year=Y`. Note that `locationISO3` is rejected and the results come in pages of 200. Only government donors are kept. Low counts paid flows only. Central and high count paid flows plus commitments. Flows are deduplicated by id. Our flow-level sums match FTS's own `groupby=organization` totals.
2. **Documented aid outside FTS**, from official statements and news. Where a value is only partly known, it gets a range. In-kind cargo with no stated value is priced at 2–10k (EUR or USD) per tonne.
3. **Pledges where FTS shows only part of the delivery** (UAE USD 100m in 2022, Qatar USD 100m in 2023, the USD 100m humanitarian part of Saudi Arabia's USD 400m package). Central adds 50% of the part FTS does not show and high adds 100%, spread evenly over the delivery years.
4. **Margin for unrecorded small gifts.** Every high bound adds 0.002% of GDP for 2022, 0.0005% a year for 2023–2025 and 0.00033% for January to August 2026. In 2022 the documented non-Western small donors gave between 0.00003% of GDP (Colombia, Chile, Philippines) and 0.005% (Serbia). Timor-Leste (0.075%) is an outlier. Where GDP is unknown, the margin is a fixed EUR 50k for 2022 and EUR 10k for each later year. Uninhabited territories get 0. Belarus, North Korea, Iran and Syria are 0/0/0.
5. Dollar amounts are converted at ECB yearly averages (USD per EUR): 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300, 2026 1.1625.

## Results (EUR bn, low / central / high, sum over all 190)
2022 0.082 / 0.102 / 0.488 · 2023 0.319 / 0.367 / 0.513 · 2024 0.064 / 0.099 / 0.241 · 2025 0.031 / 0.057 / 0.184 · 2026 Jan–Aug 0.009 / 0.023 / 0.104.

Largest donors, with the 2022–2026 central total:
- Saudi Arabia 0.366 (A). This includes the USD 300m petroleum-products grant, which FTS records as paid in 2023.
- UAE 0.062 (B)
- Qatar 0.061 (B)
- North Macedonia 0.061 (B, military; EUR 60m over 12 packages, according to the President in Feb 2024)
- Azerbaijan 0.042 (B; more than USD 42–49m in total by 2025–26)
- Albania 0.016 (D, military, modelled)
- Montenegro 0.012 (B, military)
- Israel 0.012 (C)

## Certainty
Of the 190 countries, 13 are A, 7 are B, 4 are C and 166 are D. In 163 of the D cases there is no record anywhere, so the central value is 0 and only the high bound is above 0.

## Caveats
- FTS covers humanitarian aid only. Military aid from non-Kiel donors (North Macedonia, Montenegro, Albania) comes from official statements. Albania's value is modelled from Oryx-listed equipment. An unverified claim of USD 66.8m for Albania sits near our high bound.
- FTS assigns flows to the year the money is used, not the year it is paid. Three Saudi flows dated September 2026 are excluded. One UAE flow (USD 0.63m, a water project in Sinjar, Iraq) is miscoded as Ukraine and also excluded. One Saudi OCHA commitment in 2025 may duplicate a paid flow.
- Left out on purpose:
  - loan guarantees (Israel's USD 200m offer in 2023)
  - Grain from Ukraine purchases (Qatar USD 20m)
  - arms that reached Ukraine through commercial sales via other countries (Pakistan, Serbia)
  - Moroccan T-72 tanks, which the US and the Netherlands paid for
  - private and diaspora giving
  - unearmarked contributions to global pooled funds (CERF, UNHCR, UNICEF)
- Several pages could not be fetched (403 or 404 errors). For those, figures come from search-result snippets. The sources are listed for each country.
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
