# Round 53: better sources for the data part of "bought from Russia" (12 thin-data countries)

Owner: "3 sounds good to research". Research only. Nothing in pipeline/, site/ or docs/ is changed.

Files:
- `data_gaps_r53.json`: the proposals, the evidence and the effects.
- `../scripts/data_gaps_r53.py`: run with `python -I`; `--loader <load.mjs>` measures the effects.
- `../raw/data_gaps_r53/<iso>/`: text extracts with their URLs and dates (`SOURCE.txt`). Each PDF's sha256 is kept and the PDF itself is dropped.

Units are EUR bn at current prices on the trade layer, which comes before the paid share and CIF/FOB. 2026 means January to August. Net effects are for the site's 2026 number as % of GDP; negative means towards Russia.

## Bottom line

1. **The data part cannot move any of the 12 countries to another group.** This is an upper bound: setting `T.paid` l = h = c for all 12 (a perfect data part) changes no group on any of the three numbers (net, ua, rus).
   - It narrows these net ranges: BFA 7.9→6.5, SYR 10.5→9.7, LBY 8.8→7.6, YEM 7.1→5.7, KGZ 17.9→17.5 (% of GDP).
   - For the rest the change is under 0.1pp.
   - On the side towards zero, which decides the chance, the no-war band of "paid" is the largest share for 11 of the 12 countries (not LBY, where gain is larger). The data part there is at most 0.09, except for LBY (0.34) and YEM (0.30), which are already sure.
   - So the data part mostly shapes the far side of the range, i.e. its width.
2. **Three official sources are better than what the builder now uses and can be wired now:** INSD Burkina Faso, Mongolia NSO and Tajstat. All three are the countries' own customs statistics.
   - They match Comtrade exactly in the years both cover, so they are the same series, only more complete.
   - Group changes: none.
   - Chance changes: BFA 0.922→0.931, MNG 0.776→0.790, TJK 0.584→0.584.
   - Width changes: BFA 7.89→7.33, MNG 18.54→18.57, TJK 8.81→8.80.
3. **Option B for Burkina Faso (owner's decision):** count BFA's own customs years at ±10% rather than trade_full's ±22/28%. That margin is half the gap to Russia's mirror, and the gap comes from Russian fuel being booked to traders, not from Burkina's measurement. BFA's width would fall to 6.69 and its chance rise to 0.936, still lean.
4. **SYR, LBY, YEM, TKM:** no official source exists. What could be checked (wheat deal volumes, Kpler volumes, the Russian ambassador's growth figure) confirms the current centrals and does not justify narrower bands.
5. **BRN:** DEPS confirms the crude arrives booked to Malaysia, so customs data cannot settle Russia's share.
6. **LBN:** needs a manual download (instructions below). Its data part is near zero in the decomposition anyway.
7. **KGZ, ARM, GEO:** the national sources (Kyrgyz NSC via eaeu_r44, Armstat, Geostat via Comtrade) are already used. No gain is possible.

## Current decomposition of the "paid" range (2026, net)

Shares of the paid part's variance (`r43/blk.mjs` method), given as low side / high side. The side towards zero of the net is the high side when the net is negative (BFA, SYR, LBY, YEM, TJK, MNG, KGZ, ARM, GEO) and the low side when it is positive (BRN, LBN, TKM).

| iso | net (lo, hi) % GDP | group, p | no-war | data | price | gain | base |
|---|---|---|---|---|---|---|---|
| BFA | -3.90 (-7.09, 0.80) | lean 0.922 | .14/.80 | .67/.09 | .03/.01 | .11/.07 | -.16/-.04 |
| SYR | -1.01 (-5.04, 5.42) | unc 0.631 | .18/.82 | .50/-.01 | 0/.01 | .04/.01 | -.26/.01 |
| LBY | -6.61 (-10.52, -1.73) | sure 0.988 | .01/.14 | .41/.34 | .17/.06 | .41/.45 | -.05/-.05 |
| BRN | 3.09 (-1.93, 8.39) | lean 0.849 | .39/.69 | .06/-.06 | .02/.01 | .11/.10 | -.06/.09 |
| LBN | 2.68 (-1.54, 13.72) | lean 0.872 | .66/.96 | -.05/-.01 | .01/0 | .18/.01 | .11/.03 |
| YEM | -5.16 (-8.46, -1.40) | sure 0.993 | .05/.33 | .61/.30 | .11/.05 | .21/.28 | -.11/-.09 |
| TKM | 1.53 (-0.90, 7.64) | lean 0.822 | .52/.92 | -.13/-.02 | 0/0 | .10/0 | .24/.07 |
| TJK | -0.39 (-4.29, 4.52) | unc 0.584 | .79/.92 | -.04/0 | .03/.01 | .06/.01 | .06/0 |
| MNG | -6.37 (-10.71, 7.82) | lean 0.776 | .63/.98 | 0/0 | .13/.01 | .05/0 | 0/0 |
| KGZ | -10.01 (-18.67, -0.76) | sure 0.972 | .68/.84 | .15/-.02 | .05/.02 | .06/.04 | -.07/.03 |
| ARM | -0.13 (-8.83, 5.04) | lean 0.672 | .82/.94 | .05/0 | .01/.01 | .06/.01 | -.03/0 |
| GEO | -3.71 (-6.23, 2.88) | lean 0.824 | .61/.95 | .04/.01 | .04/0 | .29/.03 | -.02/0 |

The "data" column measures `T.paid` l/h, so it also holds the paid-share band; for SYR the paid share (0.35-0.90) is most of it. Upper bound with data = 0: no group changes (`effects_2026.U_data_part_zero_upper_bound`). The 2019-2021 base band (b → m) changes no group either; its largest effect is TKM p 0.822→0.849.

## Per country

| iso | current source (builder) | better source found | proposed new values (trade layer, EUR bn) | evidence | effect (net 2026) |
|---|---|---|---|---|---|
| **BFA** | Comtrade (BFA's own report) 2019-24 at ±22/28%; **2025 IMF 0.709 [0.389, 1.292]**; **2026 IMF monthly x rule 0.501 [0.265, 0.948]** | **INSD quarterly notes**, table 1.6 (imports by country, CIF, bn FCFA). 2025 = 94.2+128.7+156.8+157.3 = **537.1**. H1 2026 = **242.7** (Q1 91.4, Q2 151.3; H1 2025 222.9). INSD 2024 = 455.9 = Comtrade x 1.001, and the yearbook's 2019-21 (196.8, 166.3, 131.0) equal Comtrade, so it is the same data. 96% of the 2024 imports are HS 27 fuel and 2% HS 36 explosives | **2025: 0.819 [0.638, 1.051]** (own-report margin). **2026: 0.544 [0.369, 0.787]**: H1 measured, Jul-Aug = 2/3 x Q3 2025 x H1 growth 1.089 = 113.8bn FCFA, at 0.6-1.4x. Option B: all own-report years ±10% | A (2025), B (2026) | lean 0.922→**0.931**; width 7.89→**7.33**; mid -3.90→-4.09. Option B: 0.936, width 6.69 |
| **MNG** | Comtrade 2019-23 (±5%); **2024 narrow.json 2.402 [2.217, 2.633], 2025 2.212 [1.947, 2.478]** (Russian-side turnover and a Trading Economics share) | **NSO PxWeb DT_NSO_1400_010V3 / 006V3** (data.1212.mn), imports/exports by country 2005-2025, USD k. Imports from Russia: 1,729.9 (2019), 1,400.0, 1,955.2, 2,611.5, 2,386.3, **2,824.8 (2024)**, **2,785.5 (2025)**. Equals Comtrade 2019-23 to 0-1.6% | **2024: 2.610 [2.479, 2.740]; 2025: 2.465 [2.342, 2.588]**: +9% and +11% on the centrals, ±5%. Sales to Russia 2024 USD 100.7m (EUR 0.093 vs IMF 0.116), 2025 60.7m (0.054 vs 0.108). 2026 (narrow's share method) unchanged | A | lean 0.776→**0.790**; width 18.54→18.57; mid -6.37→-6.93 (more money to Russia). Narrow's 2024 cut (2.84→2.40) went too far: the official 2.61 lies between the two |
| **TJK** | actuals_r7 2023-26: turnover statements minus exports. 1.415, 1.719, **2.089**, 1.359 (±6%) | **Tajstat**. "Foreign economic activity 2025" yearbook for 2020-24; monthly "socio-economic situation" reports for Jan-Dec 2025 and Jan-Aug 2026. Imports from Russia (USD m): 932.6, 1,280.5, 1,585.7, **1,580.3 (2023)**, **1,885.6**, **2,232.0 (2025)**, **1,570.3 (Jan-Aug 2026)**. Exports to Russia: 134.7, 96.2, **240.5 (2025)**, 106.2 (Jan-Aug 2026). 2020-22 equal Comtrade; Tajstat revised 2023 up from the USD 0.90bn sent to Comtrade | **1.462, 1.742, 1.975, 1.350** at ±5%. Sales to Russia 2025 **0.213** (was 0.10), 2026 0.091 (was 0.07) | A | unc 0.584→0.584; width 8.81→8.80; mid -0.39→-0.36 (−0.38 with sales to Russia) |
| SYR | Russia's mirror 2019-21 (actuals_r7 band -12/+25%); IMF 2022-24 widened to 0.30-0.80; CREA + food 2025-26; paid share 0.35/0.65/0.90 | None official: no Syrian customs, and Russia stopped publishing by partner. Wheat: a ~1.4 Mt deal (Nov 2023, Syrian ministry); IKAR 0.3 Mt Jul-mid-Dec 2024; Fastmarkets 0.67 Mt 2024/25 until Assad fell. At USD 250-300/t delivered that is USD 0.35-0.45bn a year, consistent with IMF's ~EUR 0.5bn | Keep. The width is the paid share (credit/aid), which no trade source settles | C | data x0 would still leave it unc |
| LBY | CREA (Kpler) products x 0.75-1.0 + food EUR 0.2-0.3bn | None official: no Libyan customs, and NOC/Brega publish no origin. Kpler volumes via Attaqa (2.5 Mt in 2023) x ~EUR 860/t ≈ CREA's 2.16bn. The open question is discharge vs ship-to-ship/onward smuggling, which only Kpler port-call data could settle (paid) | Keep. Optional: narrow the 0.75-1.0 factor to 0.85-1.0 if a Kpler port-level extract confirms discharge | C/D | already sure; data x0 gives width 8.8→7.6 |
| BRN | Refinery residual (actuals_r7): Russian share of Hengyi crude x crude bill minus crude passed on | DEPS monthly IMTS releases Jan-Jul 2026 (Aug not yet out). Russia is never among the top 3 import sources, while Malaysia is 54-70% (Apr-Jul) with "mineral fuels", i.e. ship-to-ship crude booked to Malaysia. Customs origin cannot settle the Russian share. Comtrade 2025 (BRN): USD 532m from Russia | Keep. The Russian share stays a CREA/KSE input | B (negative result) | data x0: p 0.849→0.857, no group change |
| LBN | Comtrade (LBN) to 2024; 2025 CREA 0.32 + 0.13 non-fuel = 0.45 [0.30, 0.60]; 2026 IMF | Lebanese Customs online statistics, by country and HS, monthly. Could not be reached from here (TLS chain error, then HTTP 503) | Owner download, below | — | data part ≈ 0 in the decomposition: no effect expected |
| YEM | Russia's mirror 2019-21 (actuals_r7); CREA fuel + food 2022-26 | None official: Aden customs do not cover Hodeidah. UNVIM monthly reports give volumes discharged at Hodeidah, not origin. The UN Panel of Experts names cargoes but publishes no totals | Keep | C | already sure |
| TKM | Russia's mirror 2019-21; Turkmen/Russian statements 2022-26 (+30-35% in 2025) | Russian ambassador Volynkin (16 Jan 2026): Jan-Oct 2025 turnover **+35%**. This confirms the 2025 growth used; no values are published | Keep | C | — |
| KGZ | Comtrade (KGZ) + Kyrgyz NSC (eaeu_r44) | Already the national source; Comtrade 2025 (USD 2,595.8m) = trade_full | — | A | — |
| ARM | Armstat via Comtrade with HS 71 netted (actuals_r7, eaeu_r44) | Already the national source | — | A | — |
| GEO | Geostat via Comtrade | Already the national source; Comtrade 2025 (USD 1,939.4m) = trade_full | — | A | — |

Group counts: no group changes in any scenario (A, A2, B, U), so the site's counts of sure/lean/near-zero/uncertain stay as they are.

## Wiring (if the owner approves)

Each change replaces one input file's values; centrals and bands are in `data_gaps_r53.json` → `countries.<iso>.proposal.new`.
- **BFA:** `nonreport.json` BFA `imports_from_RUS` 2025 and 2026 (`basis: "INSD"`). Option B would also set the reported years 2019-2024 to ±10% in trade_full/nonreport.
- **MNG:** `narrow.json` MNG `to_rus.trade_layer` 2024 and 2025. Then the `narrow.json` `years` for those years scale by the same ratio, or the builder recomputes them. `actuals_r7` MNG lists 2024-2025 as unchanged.
- **TJK:** `actuals_r7.json` TJK `inputs` for `imports_from_RUS` 2023-2026. Also `nonreport.json` TJK `exports_to_RUS` 2024-2026.
- **Sources:** "INSD Burkina Faso, Statistiques du commerce extérieur (quarterly)", "Mongolia NSO, imports/exports by country (data.1212.mn)", "Tajstat, socio-economic situation (monthly) and foreign economic activity yearbook".

## Owner downloads (blocked from here)

**Lebanon, Lebanese Customs (2025 and Jan-Aug 2026 imports from Russia by HS chapter)**
1. Open https://www.customs.gov.lb from a normal connection. From here the site gave a TLS certificate-chain error and then HTTP 503.
2. Menu "Statistics" → "Trade Statistics" (sometimes listed as "Imports/Exports statistics"). I could not check the exact labels.
3. Choose Imports, Country "Russian Federation", years 2025 and 2026 (monthly if offered), grouped by HS chapter (2-digit).
4. Export to Excel/CSV (or save the page as HTML) and put it in `research/2026-10/raw/data_gaps_r53/lbn/` with the date.
5. Repeat with Exports for sales to Russia. What it settles: whether 2025 is the IMF's EUR 0.16bn or CREA's ≥0.32bn of fuel (now 0.45 [0.30, 0.60]).

**Mongolia, 2026 monthly by country (optional; replaces narrow's Russia-share method for Jan-Aug 2026)**
- NSO's open API has country tables by year only, so this one needs Mongolian Customs.
- Go to https://customs.gov.mn → "Статистик" → monthly foreign-trade bulletin "Гадаад худалдааны барааны бүтэц, улсаар" for August 2026 (cumulative).
- Save the PDF/XLSX to `raw/data_gaps_r53/mng/`.

**Kpler port-call extract for Libya, Yemen and Syria (paid)**
- Only needed if the owner wants the LBY 0.75-1.0 discharge factor narrowed.
- CREA's public API already gives the totals.

## Doubts

- BFA's own-report margin: trade_full's ±22/28% rule (half the mirror gap, capped 25%) is generic. Option B's ±10% is a judgement: Burkina's fuel comes through Lomé/Tema/Abidjan, so the declared origin "Russia" could hide some non-Russian product, and the reverse is also possible. Hence option B is left to the owner.
- BFA 2026 July-August is an estimate (0.6-1.4x). INSD's Q3 2026 note, due about December, will replace it.
- MNG: the NSO figures raise purchases by 9-11%, which moves MNG further towards Russia. Narrow.json's Russian-side figure (USD ~2.4bn for 2024) was the turnover, not Mongolia's CIF imports.
- TJK: the official 2025 figure (USD 2.23bn) is between Rahmon's "almost +20%" (≈2.1bn of imports) and the minister's 2.47bn turnover; the actuals_r7 central came from the latter. The net effect is negligible.
- Sales to Russia: the patches scale the builder's re-export/residual layers with the trade value, so their effect is approximate. Both are below 0.02pp of GDP.
- All effects come from patching `c.T.paid` (and `c.T.soldRus`) in the loader. The builder's counterfactual, which uses the 2019-2021 base and the pre-war trend, is unchanged because no 2019-2021 value changes.
