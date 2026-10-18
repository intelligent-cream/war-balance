# Narrowing the widest ranges (Russia side)

File: `narrow.json`, generated 2026-10-18. Values are EUR bn per year for 2021–2026 (2026 = January–August), with a 2019–2021 base. Each series has low, central and high values, a certainty letter and sources. Not yet reviewed by a person.

## What the values are

- **Layer.** Each series is the final series as the map compares it, the same layer as `site/data.json` (`to_rus`, `from_rus`, `svc_bought`, `svc_sold`, `hidden`, `military_rus`). Pipeline adjustments I did not re-examine are kept at their current values. These are re-export pass-through, the residual of missing partner exports, and freight (CIF) removal. They were carried over as the difference between the builder's value and `trade_full.json`, band by band.
- **`trade_layer`.** Where the change starts at customs level, the entry also has a `trade_layer` object: the corrected `trade_full.json` values (imports_from_RUS or exports_to_RUS, before any adjustment). The builder can take these instead of the final values, so nothing is applied twice.
- **Reference run.** The reference is a run of the current builder on the current research files with the base-range fix described below (`working/narrow/build_patched.py`, run with FIX=1).
- **Turkey's price index.** `TUR.to_rus` also carries `pidx`, `pidx_lo` and `pidx_hi`.
- **Scripts.**
  - `working/narrow/build_narrow.py` assembles the file.
  - `working/narrow/calc.py` reproduces the site's `calc()` for the Russia-side parts, optionally with this file overlaid.
  - `working/narrow/compare.py` gives the widths below.
  - `working/narrow/ct.py` and `ctbatch.py` fetch Comtrade.
  - The downloads are in `working/narrow/dl/`.

## Structural findings

1. **Base-range bug for pipeline-gas countries.** This is the largest single cause of width.
   - For countries in `PIPELINE_GAS`, the builder sets `base_range[0] = min(customs low, fossil_2021_low / f21_high)`. The fossil-fuel value is only part of total imports from Russia, so the minimum drags the low base down to the fuel value alone:
     - Kazakhstan: 0
     - Belarus: 3.8
     - Uzbekistan: 0.23
     - Georgia: 0.12
     - Turkey: 8.5
   - The low end of the "less paid" range then compares 2022–2026 imports with an almost empty baseline.
   - The fix is `max(...)` instead of `min(...)`: imports are at least the fuel value. The `max()` on the high end is right as it is.
   - The fix alone cuts the width of payments to Russia:

     | Country | Before | After the fix |
     |---|---|---|
     | Kazakhstan | 98 | 41 |
     | Belarus | 158 | 115 |
     | Uzbekistan | 37 | 21 |
     | Turkey | 207 | 155 |
     | Kyrgyzstan | 11 | 7 |
     | Armenia | 20 | 16 |
     | Georgia | 6 | 3 |
     | Moldova | 12 | 10 |

   - **Recommend fixing it in the builder.** All base values in this file for these countries come from the fixed run.
2. **The trend multiplier is not used by the site.**
   - The builder writes `bmul`, `bmul_lo` and `bmul_hi`. The site's `delta3()` uses `base × FRAC` only.
   - The quoted widths match the site without `bmul`. With it they would be 10–20% larger (Belarus 290% of GDP instead of 259%).
   - Either wire it in (and accept wider ranges) or drop it from the data.
3. **The site widens the base with the 2021 year's own range.** `triple()` uses `[min(base_range[0], l[0], m), max(base_range[1], h[0], m)]`, so narrowing `base_range` does nothing unless the 2021 year range is narrowed too. This file always bounds both.
4. **Shared errors are treated as independent.**
   - The low end of each part uses the low base with the high actual value. When base and years come from the same reporting source, a level error moves both together, so this overstates width.
   - One example is the Cyprus–Russia mirror asymmetry: the Bank of Russia records about 1.5 times what Cyprus reports.
   - A correlated treatment (a common scale factor) would be more honest than independent extremes.
5. **Services use 2021 alone as the base, not 2019–2021.** For tourism destinations 2021 was a COVID year. This file uses the 2019–2021 average for every services series it touches.
6. **The price-index bands are too wide in places.**
   - The 2022 coal band is 2.16–4.52 around a central of 2.22.
   - Turkey's own observed coal unit value from Russia (in EUR, 2019–21 = 1) is 2.44. Its oil products are 2.03, against a band of 1.66–2.39.
   - Turkey's Russian gas index (1.01–2.93 in 2022) and the crude band are now the main width for Turkey. Turkey suppresses crude and gas imports by partner, so they can't be observed.
7. **The EAEU pair data the plan relied on do not exist for 2022 onwards.**
   - The Eurasian Economic Commission stopped publishing mutual trade by member pair after January 2022. Its time series end in 2021.
   - Belstat also stopped publishing trade by country.
   - Kazakhstan, Kyrgyzstan and Armenia still publish their own trade with Russia: in Comtrade monthly up to mid-2026, and in national releases.
8. **Russian oil to the UAE is counted nowhere.** This means a central value is wrong.
   - UAE customs in Comtrade show only USD 0.28bn (2022) and 1.16bn (2023) of HS 27 from Russia, against CREA's EUR 5.6bn and 6.1bn of Russian fuel delivered to the UAE.
   - The `max(customs, fossil)` rule only applies to `PIPELINE_GAS` countries, so these products drop out of the map: they are neither UAE payments nor passed on to UAE customers.
   - The suggested treatment is fossil minus customs HS 27, minus the hub resale share (0.3–0.65) and bunkers. That adds about EUR 2–3bn a year to UAE payments in 2022–2023 and about 1bn in 2024–2025.
   - This is not in the values in this file.
9. **Possible double count of Russian gold through Armenia and the UAE.**
   - Armenia's Russian gold is passed on to the UAE (71%) by `reexports.json`.
   - UAE customs record imports by origin, so the same gold may already be in the UAE's "imports from Russia".
   - Check before trusting the UAE's `to_rus` range.
10. **Mixed definitions in the inputs.**
    - Uzbekistan's 2025 figures in `trade_full.json` are goods and services (see below).
    - Turkey's services by partner have no travel line (see below).

## Changes by country

Widths are the high minus low of each Russia-side part over 2022–2026, in EUR bn. The country total combines the parts as the site does and is shown as % of one year's GDP. "Before" is the current builder, "after" is with the fix and this file. Central values are shown as "less paid / sold" (negative = more paid to or sold to Russia).

| Country | Total width (% GDP) before → after | Main parts: width before → after (central before → after) |
|---|---|---|
| BLR | 259 → 74 | paid 158 → 42 (−5.6 → −4.1); sold 99 → 31 (−52.6 → −36.7); services paid 13 → 6 (−0.1 → −3.4); services sold 17 → 8 (0.0 → −5.0) |
| KGZ | 102 → 89 | paid 11 → 7; hidden 10 (unchanged) |
| ARM | 100 → 41 | paid 20 → 4; sold 12 → 7 |
| MDA | 72 → 24 | paid 12 → 3 (+2.3 → +1.8) |
| PRK | 57 → 27 | weapons 17 → 8 (−9.5 → −10.8) |
| BRN | 49 → 24 | paid 7 → 3 (+0.4 → +0.1) |
| TJK | 46 → 40 | services paid 4 → 2 |
| CYP | 43 → 21 | services sold 13 → 7 (+7.3 → +7.9); services paid 7 → 2 |
| KAZ | 41 → 20 | paid 98 → 37; services paid 19 → 12; services sold 13 → 10; sold 37 → 35 |
| UZB | 40 → 23 | paid 37 → 12; sold 23 → 20 (−6.9 → −6.0) |
| MNG | 39 → 24 | paid 8 → 5 (−2.4 → −1.7) |
| MNE | 36 → 11 | services sold 3 → 1 |
| TUN | 28 → 9 | services sold 13 → 1 (−0.9 → +0.5: the sign flips) |
| GEO | 26 → 17 | paid 6 → 2; services sold 4 → 3 (−0.6 → −1.6) |
| TUR | 17 → 12 | paid 207 → 148 (−54.1 → −50.2); services sold 53 → 23 (−6.5 → −12.4) |
| ARE | 13 → 12 | hidden 20 → 8 (−6.8 → −1.8); services 12 → 7 and 23 → 18; paid 51 → 47 |
| YEM, SYR | unchanged | `nonreport.json` already uses CREA and paid shares; I found nothing better |

### Belarus (B)

- **Base.**
  - Belstat's own 2019–2021 trade with Russia, from the EEC pair tables, is identical to the central values in `trade_full.json`. The IMF ±40% margin on those years is therefore wrong and is replaced by ±3%.
  - Imports from Russia, USD bn: 22.02, 16.52, 23.67. Exports to Russia: 13.69, 13.16, 16.38.
- **2022–2026: official totals.**

  | Year | Evidence |
  |---|---|
  | 2022 | Union State figures: Russia → Belarus USD 21.3bn, Belarus → Russia USD 22.0bn (Russian basis). Scaled ×1.03–1.05 to Belstat basis. |
  | 2023 | Goods turnover USD 39.8bn in January–October; exports to Russia about USD 25bn |
  | 2024 | Turnover above USD 37bn in January–September; goods and services USD 57.6bn less about USD 7bn of services |
  | 2025 | Goods USD 50.9–51.9bn (Russian side), or +37% on 2021 (Belarusian side); goods and services USD 62bn less USD 9bn of services |
  | 2026 | +12.5% in H1 |

  - The split between the two directions is the remaining uncertainty, about ±USD 1.5bn a year.
- **Sales to Russia.** The residual allocation to Belarus (EUR 1.7–3.2bn a year) is dropped, keeping a EUR 0.4bn high margin. Russia's own figure for imports from Belarus is below what Belarus reports exporting, so nothing is "missing". The 2022 central in `trade_full.json` (USD 25.1bn) was about USD 1.7bn too high.
- **Services.**
  - **The central was wrong.** Belarus–Russia services trade went from USD 4bn (2021) to USD 9bn (2025) according to First Deputy PM Snopkov. Belstat's 2021 figures by country are exports USD 2.80bn and imports USD 1.66bn.
  - 2025 services sold to Russia are about EUR 4.9bn, not 2.2bn. Services bought are about EUR 3.0bn, not 1.5bn. The old high bounds were close to the true level.
  - 2022–2024 are interpolated using Russia's share of Belarus's total services trade (NBRB totals), ±15%.

### Kazakhstan (A for payments, B for sales)

- **Base.** With the fix, the base low is 12.2 instead of 0.
- **2026.**
  - Purchases: official H1 2026 imports from Russia of USD 9.7bn (+14%), plus July–August 2025 × 1.14, giving USD 13.6bn ±3%. The previous range was EUR 8.7–13.9bn.
  - Sales: about USD 5.0bn ±5%.
- **Services.** The base and 2021 are bounded by Bank of Russia partner data for 2019–2021 (Russian exports to Kazakhstan USD 2.55, 1.96 and 2.36bn).
- **Not narrowed.** Sales to Russia still carry wide re-export and residual ranges (35). I found no official re-export series.

### Kyrgyzstan (A)

- Base fix.
- 2026 January–August: January–May monthly customs data (+17.6% year on year) plus June–August 2025 × 1.176 gives EUR 1.66bn ±4%. The old central of EUR 1.15bn was too low: five months alone are EUR 1.05bn.
- The hidden-gold item (0/25/75% of the gold mirror gap) is left unchanged. No better evidence was found.

### Armenia (A for payments, C for sales)

- **Payments.**
  - Armstat's own data by HS chapter replace the separately ranged gold estimate. Payments = imports from Russia minus Russian HS 71 (gold and diamonds), of which 90–100% is passed on; 3% (0.5–10%) is retained.
  - Armenia's HS 71 exports are larger than its HS 71 imports from Russia every year.
  - HS 71 imports from Russia, USD bn: 0.40 (2022), 2.26 (2023), 6.99 (2024), 2.39 (2025).
  - Width falls from 20 to 4. The old range came from netting a ±8% customs margin against an independent ±25% gold estimate.
- **Sales.** 2025 is exact from monthly data (USD 2.92bn). For 2026 the re-export removal is bounded by the 2025 re-export share.

### Moldova (A)

- The transit-gas swap's high bound counted Transnistria's Gazprom gas: 2.6–2.9 bcm a year, worth EUR 2.6–3.1bn in 2022–2023 and up to 1.2bn afterwards. That gas was never paid for and ended on 1 January 2025, so it is support for Transnistria, not money to Russia.
- Moldova's customs data (right bank only, including the Gazprom gas it bought until December 2022) are used instead.
- 2026 is from January–June monthly data. The EUR 0.22bn in `trade_full.json` was too high; the new value is 0.14.

### Uzbekistan (B)

- **2025 central was wrong.** `trade_full.json` took the national statistics committee's partner table, which covers goods and services (exports USD 4,341.5m, imports USD 8,644.2m). Services are also counted separately.
- Goods only: imports USD 7.7–8.3bn, exports USD 3.45–3.85bn. The central for sales to Russia was about EUR 0.75bn too high.
- 2026: monthly customs data for January–July × 8/7, ±6%. The old range for purchases was EUR 1.35–11.0bn.

### Turkey

- **Payments.** Base fix (the old base low was 8.5 against reported imports of 20). Turkey-specific price index using observed coal and products unit values.
- **Services sold: the central was too low.**
  - Turkey's partner breakdown in Eurostat has no travel line, so Russian tourists were missing.
  - Fix: Turkey's reported non-travel services plus Russian arrivals × spend per trip. Arrivals are 7.02m (2019), 4.69m (2021), 5.23m, 6.31m, 6.72m and 6.90m (2022–2025), and about 3.8m in January–August 2026.
  - Spend per trip is anchored on the Bank of Russia's 2021 figure of USD 2,840m, which is USD 605 a trip.
  - Central 2023: EUR 7.2bn instead of 4.0bn. Width 53 → 23.

### UAE

- **Hidden gold.**
  - The UAE's official non-oil trade with Russia includes gold: USD 10.8bn (2022), 11.5bn (2024), 20.4bn (2025).
  - Imports plus exports in `trade_full.json` already match these totals, with room for the 66 t of 2024 gold. The hidden item double-counted it, so 2024–2025 are set to 0 (high 0.5). 2026 is unchanged.
- **2024 payments.** Pinned by the official total: USD 7.4bn (6.8–8.0) at customs level.
- **2025.** The +77.7% jump implies imports of about USD 15–16bn, mostly gold that is passed on. The pass-through needs recomputing, so 2025 is left as it was.
- See also findings 8 and 9 above (oil not counted; possible gold double count).

### Georgia (B)

- **Services sold: the central was too low.** The National Bank of Georgia's travel revenue from Russian visitors is USD 891m (2022), 938m (2023), about 850m (2024) and 694m (2025), plus about EUR 0.1bn of non-travel services. The old central was EUR 0.26–0.34bn.
- **Payments.** 2026 complete from Geostat (EUR 1.32bn ±3%).

### Cyprus (A), Montenegro (B), Tunisia (C)

- **Cyprus.**
  - Cyprus's own figures (Eurostat) for 2019–2025, range 0.9–1.35 times to allow part of the Bank of Russia's larger mirror figure.
  - The old high bounds added a share of Russia's unallocated travel spending. EU airspace has been closed to Russian flights since 2022, and Cyprus's travel credits from Russia are EUR 54–78m a year.
- **Montenegro.** Its own figures, 90% of them Russian travel, with a range of 0.9–1.25 times.
- **Tunisia: the central was wrong by an order of magnitude.**
  - The BaTiS model value was EUR 0.63bn rising to 1.07bn a year. Russian tourists fell from about 635,000 (2019) to about 10,000 (2022), about 17,000 (2024) and about 50,000 (2025).
  - Services sold to Russia are about EUR 0.02–0.04bn a year. The part flips from "extra services sold" to "services given up".

### North Korea (C)

- INSS (March 2026) puts revenue at USD 7.7–14.4bn for August 2023–December 2025, which is EUR 6.9–13.0bn. This is the narrowest well-sourced estimate. The higher figures from KIDA (over USD 20bn) and Bloomberg (USD 22bn) use higher unit prices or add other revenue.
- The split by year follows containers shipped: about 5,000 by the end of 2023, 15,809 by March 2025 and about 30,000 by early 2026.
- 2025 central: 5.1, up from 2.0, because deliveries were faster in 2025. 2026 is unchanged.

### Brunei (B)

- **Real, not an artefact.** Brunei's imports from Russia are 100% crude oil (HS 2709), Russian-origin ESPO for the Hengyi refinery, which started in late 2019. Russia's own records show almost nothing because cargoes are sold to traders and booked to other destinations.
- **But declared values are too high.** Brunei's values (USD 102–113/bbl in 2021–2023) are 20–40% above market.
- Values here are tonnes × 7.33 bbl/t × the yearly ESPO price at Kozmino, ±12%.
- The trend baseline (EUR 1.66bn, a line drawn through 0, 0.18 and 1.11) is dropped. The base is the 2019–2021 average, with the 2021 level as the high end.

### Mongolia (B)

- 2024–2026 replace IMF estimates (EUR 2.0–4.1bn).
  - 2024: Russian-side turnover above USD 1.4bn in January–July.
  - 2026: Russia's 27.6% share of January–September imports.
- The 2024 central falls from EUR 2.84bn to 2.40bn.

### Services bases bounded by the Bank of Russia

KAZ, KGZ, ARM, UZB, TJK, MNG, GEO (bought) and ARE:
- The years are unchanged (BaTiS).
- The base is the 2021 level brought to a 2019–2021 average using the Bank of Russia's partner profile (Table 3 of its 2021 services yearbook).
- The range spans that level and the Bank of Russia average ±8%. The 2021 year is bounded the same way.

## Not narrowed, and why

- **Yemen and Syria:** `nonreport.json` already uses CREA tanker data and paid shares.
- **Kyrgyzstan hidden gold:** no source on the Russian share of the gold mirror gap.
- **Kazakhstan, Armenia and UAE sales to Russia:** the re-export share remains an estimate. Only Armenia 2026 was bounded.
- **Belarus price index (11.8):** Belarus publishes no unit values for imports from Russia after 2021.
- **Turkey's crude and gas index:** suppressed by partner in Turkish customs.
- **Services years for Kazakhstan, Kyrgyzstan, Uzbekistan, Tajikistan and the UAE:** no partner data published after 2021 by either side.

## Sources

All sources are listed per series in `narrow.json`. The main ones:
- EEC mutual trade time series (pair tables 2015–2021); Belstat and NBRB foreign trade files.
- Bank of Russia, *External Trade in Services 2021*, Table 3.
- UN Comtrade public API (reporters' own monthly and annual data, with HS 27, 71, 2701, 2709 and 2710 detail).
- Uzbekistan's national statistics committee, January–December 2025 release.
- Eurostat `bop_its6_det`; MONSTAT; National Bank of Georgia via GBC and Transparency International Georgia.
- Turkey's Ministry of Culture and Tourism via GoTurkiye; UAE government statements on non-oil trade.
- INSS via NK News; Reuters/Open Source Centre via Militarnyi.
- Press reports of Union State, Belarusian and Kazakh official statements (Kommersant, TASS, Interfax, Rossiyskaya Gazeta, Inbusiness.kz).
