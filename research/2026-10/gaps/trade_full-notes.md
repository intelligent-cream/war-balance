# Trade with Russia and Ukraine, filled to 2019-2026 with ranges (EUR bn)

Data file: `research/2026-10/gaps/trade_full.json` (233 economies; four flows: `imports_from_RUS`, `exports_to_RUS`, `imports_from_UKR`, `exports_to_UKR`).
Each country, flow and year (2019-2025, plus `2026` = Jan-Aug 2026) has `{low, central, high, basis, src}`. Every flow also has `2026_annualized` and `baseline` (2021 central, 2019-21 average, 2019-21 trend to 2022).
`basis`: `reported` (own customs report), `mirror` (Russia's or Ukraine's report on the same flow), `imf` (IMF IMTS, which can be partner-derived or an IMF staff estimate), or `estimated`.
Retrieved 2026-10-17. Scripts: `working/scripts-trade2/` (`load.py`, `build.py`, `finalize.py`, `parse_imf.py`). Raw downloads: `working/raw/trade2/`.

## Sources
- **UN Comtrade public preview**: 2019-2020 newly downloaded for all reporters against Russia (643) and Ukraine (804), plus Russia's and Ukraine's own reports. 2021-2025 reuse the files behind `trade.json`.
- **IMF IMTS** (api.imf.org SDMX, `IMF.STA,IMTS`, published 2026-10-01): annual 2019-2025 and monthly 2024-01 to 2026-06 for all countries against RUS and UKR, plus UKR and RUS as reporter by partner. This gives Ukraine's own 2025/2026 data by partner (SSSU), because Ukrstat's site has an expired TLS certificate.
- **Eurostat Comext DS-045409**: monthly data for the 27 EU reporters against RU and UA, 2024-01 to 2026-08.
- **ECB EXR** annual and monthly rates. The task's rates are confirmed. The Jan-Aug 2026 average is 1.16285.
- **Russia FCS aggregates** (from press reports, because customs.gov.ru cannot be reached), in USD bn:

| | 2022 | 2023 | 2024 | 2025 | Jan-Jul 2026 |
|---|---|---|---|---|---|
| exports | 592.5 | 425.1 | 434.5 | 418.3 | 263.4 |
| imports | 255.3 | 285.1 | 282.8 | 279.0 | 174.2 |

- **Belarus**: official turnover statements (neg.by, pravo.by, Interfax, rg.ru).
- **Uzbekistan**: national statistics as reported by TASS and kun.uz.

## Method (short)
Values are chosen in this order: reported, then mirror, then IMF, then estimated.
- **Mirror** values are divided by the median mirror/reported ratio measured for that flow:

  - imports from RUS: 0.847
  - exports to RUS: 1.320
  - imports from UKR: 0.810
  - exports to UKR: 1.388

  These ratios reflect CIF/FOB valuation plus country-of-origin attribution.
- **IMF** values are spliced to the Comtrade level. An IMF value is rejected when the growth it implies falls outside the 5-95th percentile of reporting countries' growth. This happened 65 times. The full list is in the JSON under `rejected_imf_values`. Examples: UAE exports to Russia 2024-25, Venezuela, Saint Lucia, Chad and Sierra Leone.
- **Gaps** are filled by geometric interpolation, or else by the nearest known year times the median growth of reporting countries (those above USD 50m). The range comes from the 5th and 95th percentiles of that growth.
- **Margins** (log-symmetric, about a 90% interval):
  - reported: half the country's own mirror gap, between 3% and 25%. The range is widened toward the IMF value where the two differ.
  - mirror: between 10% and 60%.
  - IMF: at least 15%; at least 40% for IMF staff estimates.
  - estimated: percentile ranges of the growth ratio.
- **2026 (Jan-Aug)** uses the best available source:
  - EU27: Comext Jan-Aug, spliced to the Comtrade 2025 level.
  - Others: IMF monthly Jan-Jun times that series' own 2025 Jan-Aug/Jan-Jun ratio. The margin adds the back-tested extrapolation error (90th percentile 0.14-0.22 log).
  - No monthly data: 2025 x 8/12 x median growth of measured countries, with the 5-95th percentile range.
  - Belarus: 2025 x 8/12 x 1.20 (official figure of about +20% in H1 2026), range 1.08-1.27.

## Totals across all economies (EUR bn, central (low-high); 2026 = Jan-Aug)
| flow | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|---|---|
| imports_from_RUS | 378 (333-435) | 299 (260-343) | 440 (382-505) | 579 (516-654) | 427 (384-482) | 410 (368-464) | 381 (339-440) | 271 (206-369) |
| exports_to_RUS | 206 (178-241) | 190 (164-222) | 228 (197-266) | 214 (186-248) | 226 (200-260) | 221 (192-255) | 201 (175-233) | 143 (116-181) |
| imports_from_UKR | 52 (46-58) | 49 (43-55) | 64 (57-72) | 51 (45-57) | 44 (38-49) | 47 (41-52) | 41 (36-47) | 27 (22-32) |
| exports_to_UKR | 50 (40-63) | 46 (37-58) | 59 (48-75) | 45 (36-56) | 50 (41-62) | 56 (46-69) | 63 (52-78) | 45 (35-57) |

**Check against FCS.** Partners' imports from Russia come to 1.02-1.09 times Russia's reported exports, which is plausible for CIF against FOB. Partners' exports to Russia cover only 0.81-0.88 of Russia's reported imports. That leaves USD 30-50bn a year unattributed, which points to transit, parallel imports and origin attribution. The totals were not rescaled to FCS, so the country values for `exports_to_RUS` probably understate the true flows somewhat.

## Key economies (EUR bn; r=reported, i=IMF, e=estimated)
| ISO3 | imp RUS 2021 | imp RUS 2025 | imp RUS 2026 Jan-Aug | exp RUS 2025 | exp RUS 2026 Jan-Aug |
|---|---|---|---|---|---|
| CHN | 67.3 (65.3-69.3) r | 109.7 (106.5-113.1) r | 81.5 (65.4-101.4) r | 91.6 (83.1-100.9) r | 69.8 (59.1-82.6) r |
| IND | 7.4 (6.6-8.2) r | 55.6 (50.0-61.9) r | 38.2 (30.0-48.7) r | 4.0 (3.9-4.1) r | 2.7 (2.3-3.0) r |
| TUR | 24.5 (23.6-25.4) r | 37.5 (36.1-38.9) r | 23.1 (18.5-28.8) r | 6.0 (5.5-6.4) r | 3.5 (3.0-4.1) r |
| KAZ | 14.9 (13.6-16.3) r | 17.3 (15.8-19.0) r | 11.0 (8.7-13.9) r | 7.3 (6.4-8.3) r | 4.6 (3.8-5.6) r |
| BLR | 20.0 (14.1-28.5) i | 22.8 (19.3-25.4) e | 17.7 (13.5-20.9) e | 25.7 (23.0-29.5) e | 19.9 (16.1-24.3) e |
| ARE | 3.1 (2.5-4.0) r | 7.2 (4.5-11.6) i | 4.3 (2.5-7.3) i | 3.7 (0.1-8.3) e | 2.4 (0.0-8.2) e |
| HKG | 1.2 (1.0-1.4) r | 11.6 (9.9-13.5) r | 17.9 (13.7-23.3) r | 1.5 (1.1-1.9) r | 1.1 (0.8-1.5) r |
| UZB | 4.5 (4.2-4.9) r | 7.5 (6.7-8.5) e | 4.9 (1.4-11.0) e | 4.0 (3.5-4.5) e | 2.5 (1.2-4.4) e |
| DEU | 23.1 (20.5-28.9) r | 1.5 (1.0-1.7) r | 0.9 (0.5-1.0) r | 7.1 (5.7-8.9) r | 4.6 (3.7-5.7) r |
| POL | 17.0 (16.5-17.5) r | 1.3 (1.2-1.4) r | 0.3 (0.3-0.3) r | 2.2 (1.7-2.8) r | 1.3 (1.0-1.6) r |
| USA | 26.0 (21.5-31.5) r | 3.6 (3.0-4.3) r | 1.9 (1.4-2.6) r | 0.5 (0.4-0.7) r | 0.3 (0.2-0.4) r |
| KOR | 14.7 (12.7-16.9) r | 6.1 (5.3-7.0) r | 4.3 (3.4-5.6) r | 3.6 (3.2-4.0) r | 2.0 (1.7-2.4) r |
| ARM | 1.5 (1.3-1.7) r | 4.2 (3.6-6.2) r | 1.6 (0.9-4.1) r | 2.6 (2.3-3.9) r | 1.5 (0.9-3.9) r |
| VNM | 1.9 (1.8-2.1) r | 2.2 (1.6-3.2) i | 1.6 (1.0-2.4) i | 2.1 (1.6-2.7) i | 1.3 (1.0-1.8) i |
| IRN | 1.4 (1.1-1.8) r | 1.0 (0.6-1.6) i | 0.5 (0.3-0.8) i | 0.5 (0.3-0.8) i | 0.3 (0.2-0.4) i |

## Special cases
- **Belarus**: Belarus's own Comtrade 2019-21 data leave out energy, so 2019-21 comes from IMF.
  - The IMF series for 2022-25 contradicts Belarusian statements, which report goods turnover of USD 54.7bn in 2025 and a Belarusian surplus with Russia. So 2022-25 is the reported turnover, split between exports at 50-58% and imports at 42-50%.
- **Uzbekistan**: IMF values from 2023 on are about 3.5 times the national data, so they were dropped.
  - 2025 comes from Uzbek national statistics (exports about USD 4.5bn, imports about USD 8.5bn).
- **UAE** has not reported since 2024. The IMF staff estimate for its exports to Russia (about USD 0.06bn) is implausible, so a growth-ratio estimate is used with a very wide range (EUR 0.05-8bn).
- **Russia-Ukraine bilateral, 2022 on**: only Ukraine's own report is used. The IMF Russia-as-reporter series is inconsistent with it.
- **Hong Kong** imports from Russia rise sharply: EUR 11.6bn in 2025 and about EUR 18bn in Jan-Aug 2026. These are reported values, probably precious metals; this was not checked.
- **Taiwan** has no IMF series, so 2025-26 are estimated.
- **40 country-flows** have no data in any source. They are set to 0, with the high bound at the 10th percentile of 2021 values. These are tiny territories.

## Gaps closed relative to `gaps-input.json`
- Every country and flow now has values for 2019-2026. Nothing is carried forward without a stated rule and range.
- Where `gaps-input` marked 2021 as "missing", 2021 is now mostly estimated by growth back from later years, or comes from IMF or mirror data. Tiny territories stay at about 0 with an upper bound.
- For entries marked "est" (later years missing), the 2025 values now come from IMF or mirror data in about half of cases, and from rule-based estimates in the rest.

## Limitations
- The Ukrstat site was not used: its TLS certificate has expired, so these figures come through IMF instead. Russia FCS data come from press reports, because the site could not be reached. China customs Jul-Aug 2026 was not fetched; those months are extrapolated from IMF data to June.
- The IMF fills for 2024-25 for Vietnam, Iran, Mongolia, Tajikistan, Turkmenistan, Algeria and Syria are often derived from partner data.
- Ranges for estimated small economies are wide by construction.
