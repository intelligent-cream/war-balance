# Refresh 2026: actual Jan–Aug 2026 trade, latest Kiel release, pledged vs delivered aid

File: [`refresh_2026.json`](refresh_2026.json). Gathered 2026-10-18 for roadmap items 8, 22 and 27. Not yet reviewed by a person.
EUR bn, nominal. 2026 means January–August 2026 and is **not annualised**. Comtrade's dollar values are converted month by month with ECB reference rates (mean for Jan–Aug 2026: 1.1629 USD per EUR).

## 1. Trade in 2026 (item 8)

### What was wrong
For 2026, `trade_full.json` had either real Jan–Aug data (EU27, from Eurostat) or a projection:
- IMF monthly data for Jan–Jun, scaled up to Jan–Aug, for most other countries;
- for 81 importers, 2025 × 8/12 × typical growth.

Two problems with this:
- **Kazakhstan.** The IMF monthly series behind its figures are flat: the same value every month from mid-2025 to June 2026, even though they are marked "reported". They are a fill-in, not data.
- **India.** India's Russian imports jumped in April–July 2026. A projection from January–June misses this.

### What was done
- **UN Comtrade monthly (public preview API).** Each economy's own customs report, HS TOTAL, against Russia (643) and Ukraine (804), for 2025-01 to 2026-08. One request per month covers all reporters, because the API allows one period per call but many reporters.
  - Comtrade's 2025 monthly sums match `trade_full.json` 2025 within 1% for every reporter except Israel. So the new 2026 figures sit on the same level as the existing series.
  - Only country-flows with at least 7 published months of 2026 are used. Where August is missing, it is the middle value of three extrapolations from the same series in 2025: from July, from the May–July average, and from Jan–Jul. Seasonal ratios are capped at 2. A missing month in the middle of the year is the average of the months either side.
- **National statistics** (2026 figures):

  | Country | Source | Period | Figures |
  |---|---|---|---|
  | Kazakhstan | [stat.gov.kz](https://stat.gov.kz/ru/industries/economy/foreign-market/publications/352894/) | Jan–Aug | Turnover with Russia USD 18,326m. Russia is 31% of imports (USD 42,570m) and 8.5% of exports (USD 60,389m). |
  | Uzbekistan | [stat.uz](https://stat.uz/ru/press-tsentr/novosti-goskomstata/70472-zbekistonning-tash-i-savdo-ajlanmasi-8-ojda-57-4-mlrd-dollarga-etdi-3), [Spot.uz](https://www.spot.uz/ru/2026/10/01/foreign-trade/) | Jan–Aug | Turnover with Russia USD 9.19bn (+9.7%). |
  | Armenia | Armstat via [Interfax/Investfuture](https://investfuture.ru/articles/v-yanvare-iyune-tovarooborot-armenii-s-rossiey-sokratilsya-na-20-9-do-2-630-mlrd-37514792) | Jan–Jun | Turnover with Russia USD 2.630bn (−20.9%). |
  | Belarus | Russian ministry (Alikhanov) via [Investfuture](https://investfuture.ru/articles/alihanov-tovarooborot-rossii-i-belorussii-vyros-na-14-5faf501db8a71d29) | Jan–Jul | Turnover with Russia USD 32.8bn (+14%). |

  How each is turned into imports and exports:
  - Uzbekistan's turnover is split using the export share in the national 2025 level, moved by the change in Comtrade's export share.
  - Armenia has no June or July data in Comtrade. June is Armstat's Jan–Jun turnover minus Comtrade's Jan–May; July is the average of June and August.
  - For Belarus, August is the Aug–Dec 2025 monthly average × 1.14. The split uses `trade_full`'s 2025 Belarus export share (0.53, range 0.50–0.58).

### Result: 106 country-flows in 32 economies, biggest changes

| Country | Flow | New Jan–Aug 2026 (low–high) | Was | Old basis | Source | Cert. |
|---|---|---|---|---|---|---|
| IND | imports_from_RUS | 48.31 (44.13–51.63) | 38.22 | reported | Comtrade (7 m) | B |
| BLR | exports_to_RUS | 17.64 (15.65–20.27) | 19.94 | estimated | Russian Ministry of Industry and Trade ( | C |
| BLR | imports_from_RUS | 15.65 (13.14–17.48) | 17.69 | estimated | Russian Ministry of Industry and Trade ( | C |
| HKG | imports_from_RUS | 19.00 (17.45–20.61) | 17.87 | reported | Comtrade (7 m) | B |
| IDN | imports_from_RUS | 2.58 (2.42–2.80) | 1.98 | reported | Comtrade (7 m) | B |
| BRA | imports_from_RUS | 6.81 (6.53–7.08) | 7.23 | reported | Comtrade (8 m) | A |
| UZB | exports_to_RUS | 2.92 (2.57–3.27) | 2.53 | estimated | National Statistics Committee of Uzbekis | B |
| KAZ | imports_from_RUS | 11.35 (10.89–11.80) | 10.96 | reported | Bureau of National Statistics of Kazakhs | A |
| JPN | imports_from_RUS | 3.52 (3.38–3.66) | 3.17 | reported | Comtrade (8 m) | A |
| CHE | exports_to_RUS | 1.42 (1.36–1.47) | 1.64 | reported | Comtrade (8 m) | A |
| USA | exports_to_UKR | 1.72 (1.57–1.93) | 1.51 | reported | Comtrade (7 m) | B |
| KAZ | exports_to_RUS | 4.41 (4.30–4.53) | 4.63 | reported | Bureau of National Statistics of Kazakhs | A |
| IND | imports_from_UKR | 0.41 (0.37–0.44) | 0.56 | reported | Comtrade (7 m) | B |
| BRA | exports_to_RUS | 1.02 (0.98–1.07) | 0.89 | reported | Comtrade (8 m) | A |
| ARM | exports_to_RUS | 1.39 (1.28–1.50) | 1.52 | reported | Statistical Committee of Armenia via Int | B |
| GBR | exports_to_UKR | 0.94 (0.90–0.99) | 1.07 | reported | Comtrade (7 m) | B |
| UZB | imports_from_RUS | 4.98 (4.48–5.48) | 4.86 | estimated | National Statistics Committee of Uzbekis | B |
| GBR | imports_from_RUS | 0.19 (0.18–0.20) | 0.31 | reported | Comtrade (7 m) | B |
| JPN | exports_to_RUS | 1.59 (1.52–1.65) | 1.48 | reported | Comtrade (8 m) | A |
| HKG | exports_to_RUS | 1.04 (0.97–1.11) | 1.12 | reported | Comtrade (7 m) | B |
| GBR | exports_to_RUS | 0.43 (0.40–0.46) | 0.36 | reported | Comtrade (7 m) | B |
| CHE | exports_to_UKR | 0.26 (0.25–0.27) | 0.32 | reported | Comtrade (8 m) | A |
| USA | imports_from_UKR | 0.88 (0.80–0.92) | 0.94 | reported | Comtrade (7 m) | B |
| MYS | exports_to_RUS | 0.44 (0.43–0.46) | 0.50 | reported | Comtrade (8 m) | A |

All 106 entries are in `countries` in `trade_full.json`'s per-country format (low / central / high, basis, src, period), plus `certainty`, `previous` (the value replaced) and `months_actual`.

### Readings to be careful with
- **India's imports from Russia: 48.3 against 38.2. This is the largest change.**
  - Monthly imports rose from USD 3–5bn (Jan–Mar) to USD 7.6–9.7bn (Apr–Jul) in India's own Comtrade report.
  - The IMF vintage that `trade_full` used has lower April–June values (7.2–7.5bn).
  - January–July alone is EUR 40.8bn. Payments to Russia count in full, so this moves India about EUR 10bn further toward Russia.
- **Belarus: about EUR 4.3bn less trade with Russia than the old estimate.** The old figure was 2025 × 8/12 × 1.20. Russia's own Jan–Jul figure implies about +14%, from a seasonally weaker first half.
  - The turnover comes from the Russian side, and Belstat publishes no partner data. Hence certainty C with a wide range.
  - The round-5 Belarus research may have better data. Prefer it if it uses Belarusian figures.
- **Kazakhstan:** imports from Russia 11.35 (was 10.96), exports 4.41 (was 4.63). Official national data, certainty A.
- **Uzbekistan:** stays at the national-statistics level (customs data in Comtrade is about 12% lower), as `trade_full` 2025 does. Imports 4.98, exports 2.92 (was 4.86 and 2.53). Imports from Ukraine now use Uzbekistan's own report rather than Ukraine's mirror figure.
- **Hong Kong:** 19.0 (was 17.9). Mostly gold. The pipeline already counts Hong Kong's 2026 gold inside trade and passes the mainland share to China. Do not add `uncovered.json`'s Hong Kong 2026 gold correction on top.
- **Israel:** Comtrade's monthly imports from Russia for 2025 add up to 2.08, against 0.32 in the annual report `trade_full` uses. Israel's annual series also jumps between 0.2 and 2.2 across years, probably because diamonds are recorded by country of origin in some reports and by country of consignment in others.
  - The 2026 value is therefore scaled to the annual level (× 0.15) and flagged. Open question.

### Not refreshed (no new data found)
- **No 2026 partner data beyond what `trade_full` already has:** Taiwan (the Ministry of Finance portal was unreachable), UAE exports to Russia, Turkmenistan, Syria, Tajikistan's exports, Iran, and Algeria's exports to Russia. They stay `estimated` or `imf`.
- **Fewer than 7 months in Comtrade:** Kyrgyzstan (5), Egypt (6), Saudi Arabia (4), Thailand (5), Singapore (3), Moldova (6), Argentina (6), South Africa (5). Not replaced, but spot checks suggest the current values may be off:
  - Saudi imports from Russia, Jan–Apr: 0.71, against 2.34 for Jan–Aug in `trade_full`. Probably too high.
  - Thailand, Jan–May: 0.47 (a spike in May), against 0.36. Probably too low.
  - Singapore, Jan–Mar: 1.08, against 2.39.

## 2. Latest Kiel release (item 22)

- **The latest release is Release 31,** published 8 October 2026, covering data to 31 August 2026. See the tracker page ("Update October 8, 2026") and the [workbook](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx). `kiel.json` already uses it, so no update is needed.
- **Checked:** I re-downloaded the workbook and rebuilt the yearly totals from the monthly sheets. Every donor's 2025 and 2026 total equals `kiel.json` `by_year`.
- **New: the split by type** (military / humanitarian / financial), from the military and humanitarian monthly sheets. Financial = total − military − humanitarian, because Kiel's own financial sheet stops at June 2026.

Bilateral allocations, EUR bn (EU members exclude their share of EU-level aid):

| Donor | 2025 total | mil | hum | fin | 2026 Jan–Aug total | mil | hum | fin |
|---|---|---|---|---|---|---|---|---|
| EU_INST | 35.12 | 0.00 | 0.29 | 34.83 | 15.88 | 8.87 | 0.32 | 6.68 |
| DEU | 9.37 | 9.01 | 0.30 | 0.06 | 5.45 | 4.99 | 0.46 | 0.00 |
| GBR | 5.79 | 5.44 | 0.31 | 0.04 | 3.52 | 1.91 | 0.21 | 1.40 |
| NOR | 4.68 | 3.63 | 0.39 | 0.66 | 2.59 | 1.82 | 0.59 | 0.18 |
| CAN | 5.36 | 2.02 | 0.07 | 3.26 | 1.18 | 1.12 | 0.05 | -0.00 |
| SWE | 4.42 | 3.71 | 0.34 | 0.37 | 2.01 | 1.34 | 0.30 | 0.37 |
| JPN | 0.70 | 0.00 | 0.23 | 0.47 | 3.89 | 0.01 | 0.03 | 3.84 |
| DNK | 3.04 | 2.51 | 0.53 | -0.00 | 0.87 | 0.69 | 0.08 | 0.10 |
| NLD | 2.84 | 2.53 | 0.30 | -0.00 | 0.81 | 0.75 | 0.06 | -0.00 |
| FRA | 2.40 | 2.19 | 0.20 | 0.00 | 0.34 | 0.27 | 0.07 | -0.00 |
| BEL | 1.42 | 1.14 | 0.28 | -0.00 | 0.12 | 0.12 | 0.00 | 0.00 |
| ESP | 0.83 | 0.61 | 0.21 | 0.00 | 0.42 | 0.10 | 0.00 | 0.32 |
| FIN | 0.73 | 0.69 | 0.03 | 0.00 | 0.36 | 0.31 | 0.05 | -0.00 |
| ITA | 0.53 | 0.32 | 0.21 | -0.00 | 0.21 | 0.00 | 0.15 | 0.07 |
| POL | 0.31 | 0.31 | 0.00 | -0.00 | 0.31 | 0.29 | 0.01 | 0.01 |
| CHE | 0.17 | 0.00 | 0.17 | 0.00 | 0.32 | 0.00 | 0.32 | 0.00 |
| USA | 0.48 | 0.48 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| IRL | 0.27 | 0.20 | 0.06 | 0.01 | 0.19 | 0.10 | 0.09 | -0.00 |
| LTU | 0.26 | 0.22 | 0.03 | 0.00 | 0.11 | 0.07 | 0.04 | 0.00 |
| CZE | 0.24 | 0.23 | 0.01 | 0.00 | 0.01 | 0.01 | 0.00 | 0.00 |
| EST | 0.18 | 0.16 | 0.01 | -0.00 | 0.02 | 0.02 | 0.00 | 0.00 |
| LVA | 0.10 | 0.09 | 0.01 | 0.00 | 0.07 | 0.07 | 0.01 | -0.00 |
| LUX | 0.06 | 0.04 | 0.02 | 0.00 | 0.03 | 0.03 | 0.01 | 0.00 |
| SVN | 0.05 | 0.04 | 0.01 | 0.00 | 0.05 | 0.05 | 0.00 | 0.00 |
| PRT | 0.08 | 0.08 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| HRV | 0.05 | 0.04 | 0.00 | 0.00 | 0.02 | 0.02 | 0.00 | -0.00 |
| AUT | 0.03 | 0.00 | 0.02 | 0.01 | 0.03 | 0.00 | 0.03 | 0.00 |
| AUS | 0.05 | 0.05 | 0.00 | 0.00 | 0.01 | 0.00 | 0.01 | 0.00 |
| ISL | 0.05 | 0.04 | 0.01 | 0.00 | 0.01 | 0.00 | 0.01 | 0.00 |
| ROU | 0.05 | 0.05 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

- **US:** after January 2025 there are almost no new allocations; 0 in 2026.
- **EU institutions in 2026:** 8.87 military, all from the defence part of the Ukraine Support Loan (June–July disbursements).
- **Japan 2026:** almost entirely financial: 1.58 from the frozen-asset (ERA) loan and 2.26 from World Bank guarantees.
- **Kiel's commitments in 2026:** the EU 90.3 and the Netherlands 10.3 are new commitments, not counted in the map.

## 3. Pledged vs allocated vs delivered (item 27)

### Kiel's three stages
Sources: the [Dataset Documentation](https://www.ifw-kiel.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Dataset_Documentation.pdf) (v1.1), the workbook ReadMe and the [Working Paper 2218](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/3ce24028-f1f9-4a1c-b456-2ef810d22188-KWP_2218_Trebesch_et_al_Ukraine_Support_Tracker.pdf).

| Stage | Kiel definition | In the map? |
|---|---|---|
| Commitment | A declaration of future support by a government: framework agreements, MoUs, security agreements, pledges at donor conferences. It is the official stance, not necessarily a legal obligation (Documentation p. 6). | No. Shown only as `pledged_open`. |
| Allocation | Aid "designated for a more specific purpose" that has "already been delivered or [is] specified for delivery": technical agreements, procurement contracts, project plans (p. 6). Kiel's primary metric. | **Yes.** All Kiel aid in the map is allocations. |
| Delivery / disbursement | Reported only where donors publish it: heavy-weapon deliveries, and budget-support disbursements from Ukraine's Ministry of Finance (Fig. 9) (p. 20). | No. Item-level delivery values are almost all empty for 2025–2026. |

Two more rules from Kiel matter here:
- **Loans** count at face value when allocated.
- **Guarantees** to international lenders that back loans to Ukraine count at the guaranteed amount; the lender's loan itself is not tracked (p. 12).

### Does the map count announcements? No, but allocation is not delivery
The map's Kiel figures contain no bare announcements. The open commitments (Germany 23.4, Norway 20.2, Netherlands 12.3, EU 90.6) are left out, which is correct.

For 2025–2026, though, three things inside "allocated" are not money delivered in that year:
1. **Guarantees at face value.** A guarantee costs nothing unless the loan defaults.
2. **Multi-year packages earmarked for 2027–2028.** Example: Denmark's packages XXVI and XXVII, 0.48 in 2025.
3. **Frozen-asset (ERA) loans removed from the wrong year** by the pipeline.

Corrected values exclude guarantees, earmarks for after 2026 and the ERA loan in the year it was actually paid. "Map as built" = Kiel `by_year` after `build_data.py`'s handling of ERA and of amounts without a date; it is bilateral only, without the EU share.

| Donor | Year | Map as built | Kiel allocated | ERA in year | Guarantees | Earmarked after 2026 | Corrected | Diff |
|---|---|---|---|---|---|---|---|---|
| BEL | 2025 | 1.42 | 1.42 | 0.00 | 0.00 | 0.07 | 1.35 | -0.07 |
| BEL | 2026 | 0.12 | 0.12 | 0.00 | 0.00 | 0.00 | 0.12 | +0.00 |
| CAN | 2025 | 2.10 | 5.36 | 3.26 | 0.00 | 0.00 | 2.10 | -0.00 |
| CAN | 2026 | 1.18 | 1.18 | 0.00 | 0.00 | 0.02 | 1.15 | -0.02 |
| DNK | 2025 | 3.04 | 3.04 | 0.00 | 0.00 | 0.48 | 2.56 | -0.48 |
| DNK | 2026 | 0.87 | 0.87 | 0.00 | 0.00 | 0.00 | 0.87 | +0.00 |
| EU_INST | 2025 | 17.03 | 35.12 | 18.10 | 5.24 | 0.00 | 11.78 | -5.24 |
| EU_INST | 2026 | 15.88 | 15.88 | 0.00 | 1.02 | 0.00 | 14.86 | -1.02 |
| FRA | 2025 | 2.50 | 2.40 | 0.00 | 0.00 | 0.00 | 2.40 | -0.10 |
| FRA | 2026 | 0.35 | 0.34 | 0.00 | 0.27 | 0.00 | 0.07 | -0.28 |
| JPN | 2025 | 0.00 | 0.70 | 0.00 | 0.47 | 0.00 | 0.23 | +0.23 |
| JPN | 2026 | 3.01 | 3.89 | 1.58 | 2.26 | 0.00 | 0.05 | -2.96 |
| NOR | 2025 | 4.68 | 4.68 | 0.00 | 0.00 | 0.05 | 4.63 | -0.05 |
| NOR | 2026 | 2.59 | 2.59 | 0.00 | 0.00 | 0.03 | 2.56 | -0.03 |
| SWE | 2025 | 4.42 | 4.42 | 0.00 | 0.05 | 0.00 | 4.38 | -0.05 |
| SWE | 2026 | 2.01 | 2.01 | 0.00 | 0.24 | 0.01 | 1.76 | -0.24 |
| CHE | 2025 | 0.17 | 0.17 | 0.00 | 0.00 | 0.04 | 0.13 | -0.04 |
| CHE | 2026 | 0.32 | 0.32 | 0.00 | 0.00 | 0.04 | 0.28 | -0.04 |
| GBR | 2025 | 3.14 | 5.79 | 1.78 | 0.00 | 0.00 | 4.01 | +0.87 |
| GBR | 2026 | 3.52 | 3.52 | 0.87 | 1.40 | 0.00 | 1.24 | -2.27 |

- **France 2025 (−0.10) and Italy:** the difference comes from the pipeline spreading Kiel amounts that have no month over the years. It is not a pledge.
- **EU institutions:** these corrections flow into each member's "share of EU-level aid" in proportion to its share.
- **Germany:** no pledge problem. Kiel's military allocations for 2022–2025 are 20.0bn, against 22.7bn the federal budget actually paid out ([Kiel, 8 Oct 2026](https://www.kielinstitut.de/media/news/ukraine-support-tracker-only-eur-417-billion-of-germanys-eur-100-billion-went-to-ukraine/)). Kiel is below the outlays, not above. Germany's EUR 22bn of future commitments are not counted anywhere.

### Other parts of the map with pledge-like items
- **`uncovered.json` undisclosed aid, Germany 2026 (0 / 1.5 / 4.0):** based on the FY2026 budget appropriation (EUR 11.6bn), and Kiel says the amount actually paid out is unknown. Keep it, but label it budget-based.
  - Its note compares Kiel's military total up to August 2026 (25.0) with the 2022–25 budget (22.7). Over the same years Kiel has 20.0.
- **`aid_gaps.json`:** central and high include UN OCHA FTS commitments. For 2025–2026 this adds at most 0.01 per country (Qatar, UAE).

### Pipeline issues found (for the builder)
1. **ERA year.** `build_data.py` removes ERA from 2025 first for every lender except the US.
   - Japan received its ERA loan in February and April 2026. Japan 2025 should be 0.70 (map: 0), and 2026 should be 2.31 (map: 3.01).
   - The UK's ERA loan was split 1.78 in 2025 and 0.87 in 2026. UK 2025 should be 4.01 (map: 3.14), and 2026 should be 2.64 (map: 3.52).
2. **ERA category.** Kiel codes the UK ERA loan as **military**, but the pipeline subtracts it from financial aid.
   - UK military should be 13.53, not 16.18, and UK financial should stay 5.15, not 2.50.
   - Flowback is calculated on military aid, so the UK's flowback is currently computed on 2.65bn too much.
3. **Guarantees.** Consider counting them at expected loss, or showing them only as a note. Loans are already treated similarly: at grant equivalent in the cost view.

## Overlaps
- **Trade:** the entries **replace** `trade_full.json`'s 2026 values for the same country-flows; never add them. Recompute `2026_annualized` after replacing.
  - EU27 are untouched.
  - Hong Kong: see above.
  - Belarus: defer to the Belarus file if it is better sourced.
- **Aid:** `aid_2025_2026` equals `kiel.json` (no new money). The donor flags are corrections to existing values.

## Open questions
- Israel's annual vs monthly Comtrade gap for imports from Russia.
- Saudi Arabia, Thailand and Singapore once more months are published in Comtrade (likely in November).
- Taiwan's Jan–Aug 2026 imports from Russia (Ministry of Finance trade database).
- Belarus: a Belarusian-side figure for Jan–Aug, and the split between imports and exports.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
