# Round 59: support for Ukraine split by type (military, financial, humanitarian, refugees)

File: `gaps/mil_split_r59.json`, built by `scripts/mil_split_r59.py` (`python -I ... build`). Research only; the pipeline
does not read it. It is meant for pages that answer "military aid to Ukraine by country".

## What it is

For each country, the site's support for Ukraine (the `uaEur` figure of `pipeline/site_numbers.mjs`, 24 Jan 2022 to
31 Aug 2026, EUR bn, central values) is split into parts that add back to it exactly:

    military + financial + humanitarian + refugees + eu_share + other + flowback = total_site

- **military**: the country's own (bilateral) military aid as the site counts it: Kiel allocations (the UK's ERA loan,
  which Russia's frozen assets repay, left out), donated weapons at market value (`weapons_value.json`), minus what was
  not yet delivered by August 2026 (`military_delivered.json`), military guarantees at gift value (`loans_value.json`; only
  France and Sweden have any), plus the undisclosed-aid estimate (`undisclosed`: Germany 1.7, France 1.0, Italy 0.35,
  Greece 0.1). Each step is in `military_parts`; `military_range` is the site's low and high for these steps.
- **financial**: budget support, loans and guarantees at their gift value to Ukraine (G7 ERA loans left out), plus the
  shareholding share of new IMF, World Bank and EBRD lending.
- **humanitarian**: Kiel's humanitarian allocations; for countries outside Kiel, `aid_gaps.json` (UN OCHA FTS and
  government reports).
- **refugees**: the site's refugee hosting part (net of reimbursements and the host's gain on refugees' work).
- **eu_share**: the member's share of EU-level aid (the site's own part), split in `eu_share_split`.
- **other**: private donations and extra purchases from Ukraine, which the site's total also counts. Without them the
  five requested parts would not add up to the site's total.
- **flowback**: money flowing back to the donor's economy (negative), with its parts in `flowback_parts`.
- **kiel_military**: Kiel Release 31's bilateral military allocation as published; `kiel_military_eu_share`: the member's
  share of the EU's military allocation by Kiel's EU allocation shares.

Kiel's categories give the mix inside the site's aid; the site's yearly amounts (2022 to August 2026) give the level. The
two differ by under EUR 1m for every donor (`years_vs_categories_residual_*`), spread over the categories in proportion.

## Reconciliation

Every country rebuilds the site's figures: the bilateral split rebuilds the site's "Aid to Ukraine" part, the EU split
the "Share of EU-level aid" part, and the sum of all parts the site's total. The largest difference is EUR 1.5m (Latvia,
rounding). All countries, EUR bn:

| part | EUR bn |
|---|---:|
| military (own) | 124.57 |
| financial | 43.95 |
| humanitarian | 23.56 |
| refugees | 104.26 |
| share of EU-level aid | 50.56 |
| other (private donations 10.49, purchases from Ukraine 0.38) | 10.87 |
| flowback | −9.55 |
| **site total** | **348.22** |

The bilateral aid part over all countries is EUR 187.21bn, the "Map" total of the table in
`site/content/method/aid-refugees-military.md` (187.22).

From Kiel's military allocations to the site's military figure, all countries: Kiel 177.01 → UK ERA loan −2.65 → weapons
at market value −24.69 → not yet delivered −28.11 → military guarantees at gift value −0.23 → undisclosed estimates
+3.15 → 124.57 (plus 0.26 from the EU-level share).

## Top military donors (own bilateral military aid, 2022 to August 2026)

| donor | site military, EUR bn | likely range | % of GDP | Kiel military | site total support | military share of it | quality |
|---|---:|---|---:|---:|---:|---:|:-:|
| United States | 47.41 | 36.9–66.1 | 0.18 | 64.62 | 82.52 | 57% | C |
| Germany | 21.88 | 16.4–32.5 | 0.52 | 25.00 | 74.67 | 29% | B |
| United Kingdom | 9.01 | 6.6–12.0 | 0.28 | 16.18 | 18.42 | 49% | C |
| Denmark | 7.88 | 5.9–10.1 | 2.06 | 10.54 | 11.22 | 70% | C |
| Netherlands | 7.07 | 5.0–9.3 | 0.67 | 9.36 | 22.86 | 31% | C |
| Sweden | 4.76 | 3.0–8.0 | 0.87 | 9.28 | 8.80 | 54% | C |
| Norway | 4.37 | 2.6–7.1 | 0.87 | 7.46 | 12.80 | 34% | C |
| Canada | 4.33 | 3.2–6.6 | 0.21 | 5.82 | 8.78 | 49% | C |
| France | 3.96 | 1.8–8.9 | 0.14 | 6.23 | 16.86 | 24% | C |
| Italy | 2.60 | 1.5–4.6 | 0.12 | 3.00 | 12.64 | 21% | C |
| Poland | 2.39 | 1.6–3.6 | 0.32 | 4.45 | 13.79 | 17% | C |
| Finland | 2.30 | 1.8–3.0 | 0.85 | 3.34 | 5.28 | 44% | C |

By share of GDP (economies over EUR 5bn of GDP; cumulative aid over one year's GDP, the site's convention): Denmark
2.06%, Estonia 1.26%, Lithuania 0.97%, Sweden 0.87%, Norway 0.87%, Finland 0.85%, Latvia 0.72%, Netherlands 0.67%,
Germany 0.52%, North Macedonia 0.41% (EUR 60m, from government statements, outside Kiel), Poland 0.32%, United Kingdom
0.28%.

Steps per donor (EUR bn):

| donor | Kiel | ERA loan | market value | not yet delivered | guarantees | undisclosed | site |
|---|---:|---:|---:|---:|---:|---:|---:|
| United States | 64.62 | 0 | −7.01 | −10.20 | 0 | 0 | 47.41 |
| Germany | 25.00 | 0 | −0.49 | −4.33 | 0 | +1.70 | 21.88 |
| United Kingdom | 16.18 | −2.65 | −2.67 | −1.86 | 0 | 0 | 9.01 |
| Denmark | 10.54 | 0 | −0.68 | −1.98 | 0 | 0 | 7.88 |
| Netherlands | 9.36 | 0 | −1.31 | −0.97 | 0 | 0 | 7.07 |
| Sweden | 9.28 | 0 | −2.44 | −2.04 | −0.03 | 0 | 4.76 |
| Norway | 7.46 | 0 | −1.06 | −2.04 | 0 | 0 | 4.37 |
| Canada | 5.82 | 0 | −0.18 | −1.31 | 0 | 0 | 4.33 |
| France | 6.23 | 0 | −1.59 | −1.48 | −0.20 | +1.00 | 3.96 |
| Poland | 4.45 | 0 | −1.78 | −0.28 | 0 | 0 | 2.39 |

## How it differs from Kiel

- **Delivered, not allocated.** Kiel counts allocations (delivered or contracted). The site counts military aid when it
  is delivered, spread over a lead time by channel. The difference is largest where aid is bought from industry
  (United States, Germany, the Nordic countries) and for the EU-level military aid of 2026: of EUR 8.87bn allocated, the
  site credits about EUR 0.26bn as delivered by August 2026 (`eu_share_split.military`).
- **Weapons at market value.** Kiel uses the donors' own values or its price lists; the site uses what the equipment
  would fetch on the market. This lowers most donors' figures (old Soviet-era stock, replacement-cost valuations) and
  raises a few (Greece, shells).
- **ERA loans left out.** The UK's EUR 2.65bn ERA loan sits in Kiel's military category; the site leaves it out because
  Russia's immobilised assets repay it. The US, Canadian, Japanese and EU ERA loans are financial in Kiel and left out of
  financial here.
- **Loans at gift value** in financial aid, not at face value (Japan, Canada and the UK change most).
- **Undisclosed military aid** that Kiel does not record is added for four donors as an estimate (certainty C–D).
- **Refugee hosting, private donations and money flowing back** are not in Kiel's aid; they are separate parts here.

Kiel's own ranking (allocations) therefore stays the reference for "what was promised and contracted"; this file gives
the site's figure for "what reached Ukraine by August 2026, at what it is worth".

## Coverage

- 101 countries have some support in the site's total; 37 have military aid over EUR 1m.
- 41 rest on Kiel's categories, 25 on `aid_gaps.json` records (UN OCHA FTS and government reports), 35 have no aid
  record and only refugee hosting, private donations or purchases from Ukraine.
- Outside Kiel, only North Macedonia (EUR 60m), Albania (15m) and Montenegro (12m) have recorded military aid. The site
  records none for other countries, which does not mean none was given.
- `quality`: A 18, B 10, C 34, D 39. Most large military donors are C because the site's own adjustments (market value,
  delivery timing) move their figure by more than a quarter.

## Sources

- Kiel Institute, Ukraine Support Tracker Release 31 (8 October 2026, data to 31 August 2026), sheet
  "Country Summary (€)". Extract: `raw/mil_split_r59/kiel_r31_country_summary_eur.csv`, with the URL, retrieval date
  (2026-10-27) and the workbook's SHA-256. The workbook itself (13 MB) is not kept. Military, financial and humanitarian
  allocations in `kiel.json` match the extract for all 41 donors and the EU institutions (`kiel_extract_crosscheck_differences`
  is empty).
- The site's own model and data: `site/data.json` and `node pipeline/site_numbers.mjs` (round 58 build).
- `gaps/weapons_value.json`, `gaps/military_delivered.json`, `gaps/loans_value.json`, `gaps/aid_gaps.json`,
  the undisclosed-aid estimates (`gaps/uncovered.json`, `gaps/audit2.json`) and the refugee and flowback files they cite.

## Doubts

- **Delivery timing dominates.** "Not yet delivered" is a modelled lead time calibrated on the Pentagon's 57% delivered
  by March 2026. It removes EUR 28bn from bilateral military aid and almost all of the EU's 2026 military aid. The
  `military_range` high end is close to Kiel's full allocation.
- **EU-level military loans.** The gift adjustment of the EU's 2026 Ukraine Support Loan is split into military and
  financial by the EU's 2026 items (32.9% military) for every member. The loan's military window is guaranteed by 24
  members only, so Czechia's, Hungary's and Slovakia's EU military slices are slightly overstated (a few EUR million).
- **Kiel's categories inside a donor are allocation-based**; the site's yearly totals are the same amounts, so the mix is
  Kiel's. The site applies no separate delivery timing to financial or humanitarian aid.
- **Undisclosed military aid** (Germany, France, Italy, Greece) is an estimate; without it Germany's figure would be
  20.18 and France's 2.96.
- **% of GDP** divides aid over 2022 to August 2026 by one year's GDP (the site's `gdp` field). The period is 4.6 years, so a
  yearly average is a little over a fifth of these.
- **Flowback** is subtracted from the whole total, not from military aid alone; `flowback_parts.own_aid_spent_at_home`
  and `others_aid_spent_here` are the parts tied mostly to military aid.
- Small donors outside Kiel may have unrecorded military aid; their zero means "no record found".
