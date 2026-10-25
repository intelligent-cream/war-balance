# EAEU mutual-trade statistics against the site's trade with Russia (round 44)

File: `eaeu_r44.json`, generated 2026-10-25. Values are EUR bn at the customs layer (the layer of `trade_full.json`, `narrow.json` `trade_layer` and `refresh_2026.json`), converted at the `trade_full.json` rates. National figures are also given in million USD as published. Nothing in `pipeline/build_data.py` or `site/` was changed.

Raw extract: `research/2026-10/raw/eaeu_r44/eaeu_r44_2026-10-25.json`, written by `pipeline/fetch/eaeu_r44.py` (standard library only for parsing; the xlsx, pdf and html downloads sit beside it and are git-ignored).

## Summary

| Question | Answer |
|---|---|
| Does the EEC still publish mutual trade by member pair? | **No.** Every EEC mutual-trade product ends at January 2022 or at 2021. |
| Does the EEC still publish Russia's reported flows? | **No**, not after 2021. |
| Are the national figures a second measurement? | **No.** BNS (Kazakhstan), NSC (Kyrgyzstan) and Armstat compile the figures they also send to UN Comtrade and the IMF. Same family, `trade`. |
| Higher evidence letter? | **No.** No new official family. |
| Narrower ranges? | Armenia 2026 only: official instead of press-based. Kazakhstan already uses these data. |
| Central changes? | **Kyrgyzstan**: the site is 18–30% too low on imports from Russia for 2024–2026. Its customs-layer purchases from Russia rise by about EUR 1.15bn over 2022–2026, about 8% of GDP, toward Russia. Armenia and Kazakhstan: under 0.5% of GDP. Belarus: nothing new. |

## 1. EEC statistics: status on 2026-10-25

`eec.eaeunion.org` is reachable, but the server resets about one connection in three, so retry. Section "Статистика внешней и взаимной торговли":

| Product | Latest period |
|---|---|
| Statistical tables, mutual trade (`tradestat/tables/intra/`) | annual 2011–2021, then **January 2022** only |
| Time series, mutual trade (`time_series/vzaimnaya-torgovlya-...`), annual, cumulative and monthly; geographic structure by member pair (USD) | **2015–2021** |
| Express information on external and mutual trade | January 2022 |
| Analytical reviews | January 2022 |
| Statistical bulletins | 2021 |
| Report on the state of mutual trade | 2021 (council order of October 2022) |
| Brief socio-economic indicators of the EAEU (monthly, 2022–2025) | no trade section at all |
| Express information on payments for exports and imports between members (2025, Payments table 1Q2026) | currency shares only, no values; "Банк России временно приостанавливает публикацию данных" |

The previous finding in `narrow-notes.md` §7 is confirmed: the EEC has published no member-pair trade since January 2022.

The 2015–2021 pair tables are still useful. They carry each member's own figures and Russia's own figures side by side:

- **Each member's own figures** are identical to `trade_full.json` for Kazakhstan, Belarus and Kyrgyzstan in 2019 and 2021. Armenia's imports appear there by trading country, not by origin.
- **Russia's mirror ratio** is Russia's exports to the partner divided by the partner's imports from Russia:

  | Partner | 2019 | 2020 | 2021 |
  |---|---|---|---|
  | Kazakhstan | 1.00 | 1.02 | 1.05 |
  | Kyrgyzstan | 1.11 | 1.10 | 1.13 |
  | Belarus | 0.99 | 1.03 | 1.00 |
  | Armenia, by trading country | 1.03 | 1.02 | 0.95 |

  For Kyrgyzstan in 2020, `actuals_r7` has 1.34. That ratio was measured against Comtrade's low 2020 figure (see §3).

## 2. National offices

| Country | Source and status | Data on Russia |
|---|---|---|
| Kazakhstan | stat.gov.kz (BNS), reachable | "Main indicators of foreign trade by country" (xlsx; this year's and last year's January–August); annual express releases with partner shares to 0.1 pp. EAEU trade comes from form 1-TS, a statistical survey. Other partners come from customs. |
| Kyrgyzstan | stat.gov.kg, reachable. The old `www.stat.kg` serves a certificate for another host. | "Mutual trade of goods with EAEU states" (xlsx; table 1 by member, thousand USD). Imports are recorded by country of dispatch. The data come from forms 1-VT and 1-V plus surveys of individuals at the Kazakh border. Revised "refined totals" are published each July. There is also a monthly express release of EAEU totals. |
| Armenia | armstat.am, reachable | Database by country (annual to 2025: exports, imports by origin, imports by trading country). Monthly report chapter 4.1.1 (January–August 2026). |
| Belarus | belstat.gov.by times out; dataportal.belstat.gov.by is reachable | The portal's foreign-trade API lists partner detail for **2006–2021** only. |
| Russia | — | Rosstat and the FCS publish no partner detail since 2022. |

## 3. Comparison with what the site uses

National figures against the site's customs-layer central (`trade_full` after `narrow` and `refresh_2026`). The diff is the national figure minus the site's, in % of the site's.

**Kyrgyzstan, imports from Russia (`to_rus`)**

| Year | NSC, m USD | NSC, EUR bn | Site, EUR bn (low–high) | Diff | Comtrade, m USD |
|---|---|---|---|---|---|
| 2019 | 1,404.3 | 1.254 | 1.254 (1.09–1.45) | 0% | |
| 2020 | 1,319.9 | 1.156 | 0.954 (0.83–1.15) | **+21%** | 1,089.8 |
| 2021 | 1,911.5 | 1.616 | 1.616 | 0% | |
| 2022 | 2,406.0 | 2.285 | 2.284 | 0% | |
| 2023 | 2,282.8 | 2.111 | 2.104 | +0.4% | |
| 2024 | 2,739.8 | 2.531 | 2.134 (1.85–2.46) | **+18.6%** | 2,309.7 |
| 2025 | 3,366.8 | 2.980 | 2.297 (1.99–2.65) | **+29.7%** | 2,595.8 |
| 2026 Jan–Aug | 2,370.4 (first release) | 2.039 | 1.657 (1.59–1.72) | **+23%** | |

**Kyrgyzstan, exports to Russia (`from_rus`)**

| Year | NSC, m USD | Diff against the site | Comtrade, m USD |
|---|---|---|---|
| 2020 | 257.3 | +18% | 217.5 |
| 2021–2023 | 393.3 / 1,069.7 / 823.7 | 0–0.3% | |
| 2024 | 1,151.7 | +18% | 976.1 |
| 2025 | 738.5 | **+50%** | 493.3 |
| 2026 Jan–Aug | 423.6 | +24% | |

**Why Comtrade is lower: the vintage.**
- The NSC revises EAEU trade upward each July, using late reports and survey estimates:
  - 2025 EAEU imports: from USD 4,772m (February 2026) to 5,466m (+14.5%).
  - 2025 EAEU exports: from 1,152m to 1,323m (+14.8%).
  - January–August 2025: imports +21.7%, exports +26.3%.
- Comtrade agrees with the NSC to 0–0.4% for 2021–2023 but not for 2020, 2024 and 2025. A dispatch-versus-origin difference would show in every year, so the likely cause is that Comtrade holds an early or partial submission for those years. I found no partner-level first release to prove it.
- The NSC's 2025 turnover with Russia is USD 4.11bn. That is between Comtrade (3.09bn) and Russian officials' figure (above 5bn).
- The 2026 January–August figure is a first release. On the 2025 pattern it will rise by about 15–25% next July.

**Kazakhstan.** BNS equals Comtrade.
- 2019–2021 via the EEC: 0.0%.
- 2023 and 2024 from the annual releases: −0.3% to +0.1%.
- 2025: BNS is 1.3–1.4% below Comtrade. Imports are 29.7% of USD 64,847m = 19.26bn against 19.54bn. Exports are 8.14bn against 8.25bn. This is within the `actuals_r7` band.
- January–August 2026: imports USD 13,198.6m and exports 5,127.4m. `refresh_2026.json` already has these to 0.1%; it derived them from shares.

**Armenia.** Armstat equals Comtrade for imports by origin (0.0–0.8%).
- **Exports to Russia.** Armstat's current figures are higher by 3.2% (2019), 11.3% (2020), 5.9% (2021) and 1.0–1.9% (2022–2024), and equal in 2025.
- **January–August 2026, official:**

  | Series | Armstat, m USD | Armstat, EUR bn | Site (`refresh_2026`, press-based) | Diff |
  |---|---|---|---|---|
  | Imports by origin | 1,939.2 | 1.668 | 1.576 | +5.8% |
  | Imports by dispatch | 2,026.5 | | | |
  | Exports | 1,651.8 | 1.420 | 1.390 | +2.2% |

- **Imports by trading country** are 2–12% above imports by origin (2021: 1.998 against 1.785bn; 2024: 9.43 against 9.24bn).

**Belarus.** The EEC's 2019–2021 values are identical to `trade_full.json`. Nothing official exists for 2022 onwards.

## 4. What it buys

- **Independence and letter.** None.
  - For EAEU partners the "customs data" in Comtrade and the IMF already are these statistical-survey figures. A different vintage of one office's statistic is not a second family.
  - Russia's own report would be a second measurement, but it stops in 2021, and its 2019–2021 values are the same in Comtrade r643 and the EEC.
  - So `evidence()` stays at one official family (B) for these parts.
- **Narrower actual values.**
  - Armenia 2026 can carry about ±3% instead of the press-based −8%/+8%.
  - Kazakhstan: nothing to gain.
  - Kyrgyzstan: no narrowing. The official figures lie above the site's high bound in 2024, 2025 and 2026, so the range has to move, not shrink.
- **Central values.** Customs layer, change in (years − 2019–2021 base) summed over 2022–2026, with 2026 at 8/12:

  | Part | Change, EUR bn | % of GDP | Direction |
  |---|---|---|---|
  | KGZ `to_rus` | +1.15 | +8.1 | More paid to Russia. The base rises 5% because of 2020; the years rise by 0.40 (2024), 0.68 (2025) and 0.38 (2026). |
  | KGZ `from_rus` | +0.39 reported, −0.52 residual: net −0.13 | −0.9 | Mostly the estimated unrecorded flow becomes recorded. |
  | ARM `to_rus` / `from_rus` | +0.09 / −0.04 | +0.4 / −0.2 | Stays near zero. |
  | KAZ | 0.00 | 0.0 | Stays near zero. |
  | BLR | — | — | Party to the war; no change. |

- **Kyrgyzstan's ranking.** It is at 91% on net and on Russia's earnings. The change moves it further toward Russia and does not flip it. The price index, `bmul` and re-export steps are applied after this layer and will scale the 8% somewhat.

## Proposed build changes

All values are in `eaeu_r44.json` → `proposals`, in the shape of the file they replace.

1. **New source id `eaeu_r44`.**
   - Add `SOURCE_TYPE["eaeu_r44"] = "data"` in `pipeline/build_data.py`, and register it with `src.add("eaeu_r44", ...)` using the name and URLs in `sources[0]`.
   - Add `SRC_FAMILY.eaeu_r44 = "trade"` in `site/index.html`. It is **not** a new family, so letters stay as they are.
   - Append `"eaeu_r44"` to `src` of `KGZ`, `ARM` and `KAZ` `to_rus`/`from_rus`.
2. **`build()` overlay.** Put it after the `refresh_2026.json` loop and before the ARE (`R4B`) overlay. It works like the `narrow.json` overlay: merge `low`/`central`/`high`/`basis` per year into `trade["countries"][iso][field]`.
   - `trade_full.json:KGZ.imports_from_RUS`: years 2020, 2024, 2025 and 2026.
     - Central: the NSC figure.
     - Low: Comtrade's lower vintage (or 0.96 × the central, whichever is lower).
     - High: 1.13 × the central (Russia's mirror ratio).
     - 2026: high = 1.22 × the first release, for the expected July revision.
   - `trade_full.json:KGZ.exports_to_RUS`: the same years. Low as for imports; high = 1.05 × the central (2026: 1.26 × the first release).
   - `trade_full.json:ARM.exports_to_RUS` 2019–2024: Armstat's current centrals, with the existing band moved along. Optional; the effect is −0.2% of GDP.
   - These entries carry their own bands, so they must come after the `_actuals_r7` banding, which runs at load time. Otherwise the 0.96/1.13 band would be re-applied to the new centrals.
3. **2026 replacements**, in the same overlay or by editing `refresh_2026.json` in a later round:
   - `refresh_2026.json:ARM.imports_from_RUS.2026`: Armstat, low/central/high 1.6176 / 1.6676 / 1.7427. The high is imports by dispatch.
   - `refresh_2026.json:ARM.exports_to_RUS.2026`: 1.3779 / 1.4205 / 1.4631.
   - `refresh_2026.json:KAZ.*.2026`: exact BNS centrals 11.3502 and 4.4093, keeping the refresh band ratios. Cosmetic.
4. **Residual.** In `load()`, for example with a `_eaeu_r44` hook next to `_r39_replace` for `name == "residual.json"`, replace `exports_to_rus_gap.countries.KGZ` with `proposals["residual.json:exports_to_rus_gap.countries.KGZ"]`.
   - 2024: 0.86 → 0.70. 2025: 1.06 → 0.85. 2026 follows as 2025 × FRAC.
   - The residual was measured against Comtrade's partner sum, so without this the newly reported Kyrgyz exports would be counted twice.
   - `residual.json`'s Kyrgyz transit component also used Comtrade's lower Kyrgyz imports. Refined EAEU imports would shrink the "unrecorded transit via Kyrgyzstan" by about USD 0.5–0.9bn in 2025. That is left for the residual's owner.
5. **Optional: Armenia's high bound.** Use imports by trading country as the high of `ARM.imports_from_RUS`, years and base: `comparison.ARM.to_rus.<year>.national_trading_country_usd_m`. The money goes to the Russian seller whatever the goods' origin.
6. **Not to do.**
   - Do not treat BNS, NSC or Armstat as a second official family, and do not raise any letter.
   - Do not use the EEC for anything after 2021.

## Open points

- Kyrgyzstan: a first-release partner table, which would confirm that Comtrade holds an early vintage. Re-check Comtrade after the NSC's next submission, since Comtrade may be updated to the refined figures.
- Kazakhstan 2022 was not re-extracted from BNS. 2019–2021 and 2023–2025 all match Comtrade.
- Belarus 2022 onwards: no official partner data anywhere reachable. Union State and press figures remain the only source (`narrow.json`, `refresh_2026.json`).

## Sources

- **EEC Department of Statistics.**
  - `eec.eaeunion.org/comission/department/dep_stat/tradestat/` and its `tables/intra/`, `time_series/`, express, analytical reviews, bulletins and `analytics/tradereport.php` pages.
  - The 2015–2021 files `Internal Trade Geo structure_Import_(year data).xlsx` and `..._Export_(year data).xlsx`.
  - `union_stat/publications/express/express_inf.php` (brief indicators 2022–2025) and `union_stat/current_stat/payment_balance/platezhi-za-eksport-i-import-tovarov-i-uslug.php` (payments express 2025, `Payments_table_1Q2026.xlsx`).
- **NSC Kyrgyz Republic.**
  - `stat.gov.kg/ru/publications/vzaimnaya-torgovlya-tovarami-kyrgyzskoj-respubliki-s-gosudarstvami-chlenami-evrazijskogo-ekonomicheskogo-soyuza/`: editions of 24.02.2020 to 19.10.2026.
  - `stat.gov.kg/ru/statistics/download/operational/2037/` (January–December 2025), `/2138/` (January–August 2026) and `/1992/` (January–August 2025).
- **BNS Kazakhstan.**
  - `stat.gov.kz/api/iblock/element/518972/file/ru/` (by country, January–August 2026 and 2025).
  - Annual releases `.../publications/476016/`, `280982/` and `123068/` (2025, 2024, 2023).
- **Armstat.**
  - `armstat.am/ru/?nid=159` (database by country, Russia, 2019–2025).
  - `armstat.am/file/article/sv_08_26r_411.pdf` (January–August 2026, ch. 4.1.1).
- **Belstat.** `dataportal.belstat.gov.by/osids-public-api/foreignTradeStatistic/foreignTradeStatisticGetYearList`.
- **UN Comtrade.** Public preview API, reporter 417 (Kyrgyzstan), partner 643 (Russia), 2020, 2024 and 2025, TOTAL; queried 2026-10-25.
