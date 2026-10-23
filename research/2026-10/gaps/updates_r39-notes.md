# Round 39 source updates: what is new against the values the repo uses (retrieved 2026-10-23)

Nothing in the data files was changed. This note lists the newer releases that were fetched, where the raw copies are, and how they differ from what the repository uses today. The fetch scripts are in `pipeline/fetch/` (see its README).

## 1. KSE Russian Oil Tracker: August and September 2026 issues are out

Raw files (PDFs are git-ignored, so they are listed in the manifest only):
- `raw/kse_rot/ROT_August-2026.pdf`: https://sanctions.kse.ua/wp-content/uploads/2026/09/ROT_August-2026.pdf (681,015 bytes)
- `raw/kse_rot/rot_eng_september_2026.pdf`: https://institute.kse.ua/wp-content/uploads/2026/10/rot_eng_september_2026.pdf (924,236 bytes)
- `raw/kse_rot/ROT_July-2026.pdf`: the issue the repo cites, kept for comparison (676,501 bytes)

What the repo uses: `gaps/shipping.json` names the source "KSE Institute Russian Oil Tracker, July 2026 (268 tankers, 56% shadow; seaborne crude+products ~5.3 mb/d)" on every country, and `gaps/shipping-notes.md` lines 31 and 59 repeat these figures. `gaps/shadow_fleet.json` already uses the KSE Shadow Fleet Tracker for September 2026 and the ROT series to September 2026, so it is not affected.

Headline figures by issue (each issue reports the previous month):

| | July 2026 issue (June data) | August 2026 issue (July data) | September 2026 issue (August data) |
|---|---|---|---|
| crude + products exports | 7.7 mb/d (+390 kb/d) | 5.3 mb/d (−638 kb/d); crude 4.2, products 1.0 (record low) | 4.9 mb/d seaborne (−318 kb/d); crude 3.8, products 1.1 |
| oil export revenue | USD 15.8bn | USD 13.8bn | USD 13.9bn |
| IG P&I-insured share: crude / products | 35% / 73% | 32% / 77% | 28% / 71% |
| IG-insured share of all oil exports (chart title) | 45% | 41% | 38% |
| loaded shadow tankers that left Russian ports | 180 (94% over 15 years old) | 154 (93%) | 168 (92%) |
| Urals FOB | about USD 61/bbl | about USD 57/bbl | about USD 66/bbl |
| KSE 2026 revenue forecast (base case) | USD 191bn | USD 182bn | USD 193bn |

Differences from the repo:
- **"~5.3 mb/d" is the August issue's figure for July**, not the July issue's. The July issue gives 7.7 mb/d for June. The source label is therefore misdated. The volume used is the right order of magnitude for July–August (5.3 and 4.9 mb/d).
- **"268 tankers, 56% shadow" is not a headline statement in the July issue.** "268" appears there only as a table value (an "Apr 25" row). "56%" appears among chart labels. The nearest headline measure is the share of exports *not* on IG-insured tankers: 55% in June, 59% in July and 62% in August. If "56% shadow" is meant as this share, it is now 59–62%.
- Suggested change (not made): cite the September 2026 issue in `shipping.json`, saying "4.9 mb/d seaborne in Aug 2026; 62% of exports on non-IG tankers". The freight numbers do not change, because `shipping.json` gets its volumes from CREA and its yearly owner shares from the KSE Shadow Fleet Tracker.

## 2. Ukraine's own 2025 trade by partner

- **UN Comtrade**: still not filed. `r804` 2025 returns 0 rows for both M and X (`raw/comtrade_api/comtrade_annual_total_2026-10-23.json.gz`). Ukraine's 2026 monthly reports are not in Comtrade either.
- **Ukrstat**: the old site ukrstat.gov.ua serves an expired TLS certificate and could not be read. The new site's SDMX API (stat.gov.ua, agency SSSU) works. Raw file: `raw/ukrstat/ukrstat_trade_by_partner_2026-10-23.json.gz`.
  - The annual by-partner dataflow (`DF_EXTERNAL_TRADE_OF_GOODS_BY_PARTNER_COUNTRIES`) runs only to **2024**. It was last updated 19.08.2025, and its stated next update of 24.06.2026 has not happened.
  - The monthly by-country flow (`DF_EXTERNAL_TRADE_OF_GOODS_M_Q`, cumulative from January) holds only **Jan–Sep 2025**, updated 19.11.2025. Totals: exports USD 29.57bn, imports USD 60.19bn.
  - Ukrstat has **no full-year 2025 by partner** in machine-readable form.
- **State Customs Service** (customs.gov.ua): answers 403 to scripts, and bts.customs.gov.ua cannot be reached through the proxy (502). Not fetched.
- **IMF IMTS** has Ukraine's own full-year 2025 by partner (`raw/imf_imts/IMTS_RUS_UKR_2026-10-23.json.gz`, COUNTRY=UKR). IMF marks the data DERIVATION_TYPE "M" (mixed-type data). At the 2025 ECB rate (1.12998):
  - world totals: exports EUR 35.7bn (USD 40.3bn), imports EUR 72.3bn (USD 81.7bn);
  - **it would fill 69 partners' `imports_from_UKR` 2025 (EUR 3.25bn in all) and 87 partners' `exports_to_UKR` 2025 (EUR 2.42bn)** that are null in `trade.json` today;
  - for partners where both exist, the two reports differ, as mirror data usually do:
    - partners report EUR 37.2bn of imports from Ukraine against Ukraine's 32.4bn of exports to them (114 partners);
    - partners report EUR 61.8bn of exports to Ukraine against Ukraine's 69.9bn of imports from them (102 partners);
    - the largest gap is China. China reports EUR 4.46bn of exports to Ukraine, while Ukraine reports EUR 16.3bn of imports from China. Ukraine records imports by country of origin, so the gap comes from origin versus consignment;
    - Poland: 13.38 (partner) against 6.99 (Ukraine); Germany: 9.42 against 5.93.
- Suggested use (not made): if these values are used, add them as `mirror=true` fallbacks for 2025, as for Ukraine's 2021–2024 report, with the source "IMF IMTS (Ukraine's own report, mixed-type)". Keep partner-reported values where they exist.

## 3. Euroclear Q3 2026: not published yet

- www.euroclear.com answers 403 (a Cloudflare bot block). The mirror cf.euroclear.com works.
- The press index fetched on 2026-10-23 (`raw/euroclear/press_index_2026-10-23.html`) ends at release mr-20, **H1 2026 (17 Jul 2026)**:
  - sanctioned Russian assets EUR 202bn of a EUR 241bn balance sheet at end-June 2026;
  - interest earned on them in H1 2026: EUR 2.3bn.
  - A copy is in `raw/euroclear/mr-20-euroclear-h1-2026-results_2026-10-23.html`.
- The Q3 2025 results came out on 24 Oct 2025, so the Q3 2026 results are probably due in the next days.
- `gaps/frozen_assets-notes.md` already uses 202 (Jun 2026) and 2.3 (H1 2026). **No change** until Q3 is out. Re-run the check with `curl -sS https://cf.euroclear.com/newsandinsights/en/press.html | grep -o 'press/2026/mr-[^"#]*'`.

## 4. Other differences found while fetching (no change made)

- **Comtrade annual totals** (`pipeline/fetch/build_trade_check.py`): 3,773 of 3,776 values in `trade.json` (2021–2025, four indicators plus the HS4 dual-use sums) match the new pull within 0.5%. The one change is Papua New Guinea's 2024 report, filed after 2026-10-17:
  - `exports_to_UKR` 2024 rises from 0.0005 (mirror) to 0.0299 EUR bn (own report);
  - `imports_from_UKR` and `imports_from_RUS` 2024 are new (0.0020 and 0.00004).
  - The 2025 reporter counts are unchanged: 116 / 104 against Russia and 121 / 103 against Ukraine.
- **Comtrade 2026 monthly** (`raw/comtrade_api/comtrade_monthly_2026_*.json.gz`): the number of reporters with imports from Russia is about 74 for each of Jan–Mar 2026, then 70 (Apr), 65 (May), 57 (Jun), 47 (Jul), 30 (Aug) and 2 (Sep). Ukraine has filed no 2026 month.
- **CREA** (`raw/crea_api/`, data to 2026-10-22), compared with `crea-notes.md` (data to 2026-10-16):

  | | crea-notes.md | new pull |
  |---|---|---|
  | 2024 | 235.9 | 236.0 |
  | 2025 | 193.2 | 193.3 |
  | 2026 YTD | 170.3 | 174.6 |
  | since 24 Feb 2022 | 1,166 | 1,170.7 |

  The 2021–2023 totals are unchanged (237.3, 375.6, 244.8). All values are EUR bn.
- **ECB**: the annual averages for 2021–2025 match `trade.json` exactly. The 2026 mean of the Jan–Sep monthly averages is **1.1616**, against the 1.1625 used in `crea-notes.md`, `aid_gaps.json` and `prices.json`. The Jan–Aug mean is 1.1629, which `shipping.json` / `shadow_fleet.json` use. The difference is 0.08%.
- **Eurostat temporary protection**: the dataset was updated on 2026-10-22, a week after the repo's copy (2026-10-15).
  - September 2026 values have arrived for CH 72,815, CY 27,095, DE 1,264,690, EE 30,950 and IE 120,115.
  - The EU27 total is still last available for August 2026 (4,363,955).
  - Earlier months are unchanged. The new copy is `raw/eurostat_tp/migr_asytpsm_UA_2026-10-23.json`; `migr_asytpsm_UA.json` is left alone.
- **UNHCR**: 2026 is still empty in the API.
