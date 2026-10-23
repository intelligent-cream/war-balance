# Narrowing the actual values, bases and price levels (round 7)

File: `actuals_r7.json`, generated 2026-10-18. Not yet reviewed by a person. Nothing in `pipeline/`, `site/` or `docs/` was changed.

## How the values were made

- **Layer.** `years`, `base` and `pidx` in the JSON are the final series, as `site/data.json` would carry them. They come from running a copy of the current builder with the input changes listed under each entry's `inputs`.
- **What the builder should take.** The builder should take the `inputs`, not the final values, so that re-exports, freight removal and the Brunei refinery step are not applied twice.
- **Before and after.** Each entry also has the old values and the width of the 2022–2026 total in % of GDP, before and after. The width is split into actual values (`al`/`ah`), base (`bl`/`bh`) and price (`pl`/`ph`). My reproduction of the site's `spread()` matches the widths in the task table exactly.
- **Scripts.** This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## Results (width of the 2022–2026 total, % of GDP, low / high)

| Country, series | Part | Before | After | Central change |
|---|---|---|---|---|
| Armenia `to_rus` | actual values | 16.5 / 7.5 | **6.4 / 4.7** | −6.6 → −5.6 |
| Tajikistan `to_rus` | actual values | 8.6 / 11.2 | **5.0 / 6.5** | −10.9 → −14.3 |
| | base | 5.5 / 5.2 | 4.7 / 3.9 | |
| Brunei `to_rus` | actual values | 12.1 / 12.4 | **8.7 / 6.7** | −0.3 → +2.4 |
| | base | 12.9 / 13.2 | **8.9 / 7.7** | |
| Belarus `to_rus` | price | 7.3 / 10.8 | **7.0 / 6.4** | −2.8 → −0.7 |
| | actual values, base | about unchanged | | |
| Kyrgyzstan `to_rus` | actual values | 8.3 / 6.9 | 7.4 / 3.4 | unchanged |
| | base | 7.1 / 8.8 | **3.7 / 7.8** | |
| Yemen `to_rus` | base | 6.6 / 13.8 | **3.5 / 5.0** | unchanged |
| Syria `to_rus` | base | 5.0 / 8.2 | 4.3 / 6.3 | unchanged |
| Mongolia `to_rus` | actual values | 4.2 / 3.8 | 3.8 / 3.5 | unchanged |
| | base | 4.0 / 4.6 | 3.3 / 3.6 | |
| Kazakhstan `to_rus` | actual values | 2.6 / 2.4 | 1.9 / 1.5 | unchanged |
| | base | 3.4 / 4.0 | 2.3 / 3.1 | |
| Kazakhstan `from_rus` | actual values | 4.6 / 6.6 | 3.6 / 5.6 | unchanged |
| | base | 1.7 / 2.1 | 0.8 / 1.2 | |

**Totals stay wide.** The country totals narrow less than these parts, because the counterfactual (`bmul`, `cb`) is now the largest width for most of these countries: Belarus 24/35, Kyrgyzstan 15/28, Tajikistan 12/23. That is outside this task.

## Country by country

### Armenia: gold passed on (A)

- **Cause of the width.** The width came from `reexports.json`, which took 64–95% of Armenia's own HS 71 imports from Russia as passed on (2024: EUR 4.09–6.38bn).
- **Armstat (via Comtrade).** HS 71 imports from Russia were USD 0.40bn (2022), 2.26bn (2023), 6.99bn (2024) and 2.39bn (2025).
  - HS 71 exports exceed HS 71 imports from all origins in every year 2019–2025: 2024 exports were 8.05 against 7.37 imported, and 2025 exports were 2.85 against 2.61.
  - Retention above about 5% therefore has no support. The passed-on share is now 95–100% (central 98%) of the HS 71 value.
  - The margin kept by Armenia (0.5–6%) is unchanged.
- **2026 (January–August).** Comtrade gives HS 71 for January–March and May only, because the API quota blocked April and August.
  - In those four months HS 71 is 25.6% of imports from Russia (12–44% by month).
  - Applied to the January–August total in `refresh_2026.json` with an 18–33% range, this gives EUR 0.27–0.52bn passed on. The old range was 0.23–2.40.
  - Refetch April and August when the quota allows.
- **Overlap.**
  - `narrow.json`'s customs total (trade_layer) is kept.
  - Only `reexports.json` `hubs.ARM.reexports_from_RUS` changes.
  - The extra gold passed on goes to the buyers through the existing destination shares, per year (central): UAE +0.06 to +0.18, China +0.02 to +0.04, Hong Kong +0.01 to +0.03 EUR bn.
  - The possible double count with UAE customs (narrow.json finding 9) is not addressed here.

### Brunei: refinery residual (B)

- **Cause of the width.** Round 6 (`laundered_r6.json`) ranged the Russian crude intake and the crude passed on to fuel buyers independently, although both are the same Russian share of Hengyi's crude times a value. The low end therefore fell to 0 in most years and in the base.
- **The fix.** Apply one share to (crude imports − crude content of fuel exports). The export value (±10%) and CRUDE_CONTENT (0.42–0.60) keep their ranges.
- **2021 share.** Brunei's own customs record 1.74 Mt of 6.85 Mt of crude imports (25%) as Russian. CREA's 8% stays as the low end, so the share is 0.10–0.26 with a central of 0.20 (was 0.17).
- **Effect on the central.** It moves from −0.3% to +2.4% of GDP ("less paid"), because the 2021 base rises from 0.53 to 0.62.
- **2026.** One share (0.42/0.70/0.82) is used on both sides; round 6 used 0.68 for one side and 0.72 for the other. The guessed January–August crude bill carries ±12%.
- **Unchanged.** The deduction counted for the fuel buyers (Australia, Singapore and others) is unchanged.
- **Replaces.** `option_b_residual_kept_by_brunei_eur_bn` only. `narrow.json`'s Brunei values were already superseded by round 6.

### Tajikistan: own totals now agree with the Russian side (B)

- **The sources agree.**
  - 2025: the Tajik minister (TASS) and the Russian MinEcon both give a turnover of USD 2.47bn.
  - 2024: about 1.98bn (2025 ÷ 1.248; Interfax gives 1.9bn).
  - 2023: about 1.7bn. The Russian trade representative's January–October 2024 figure of 1.618bn at +19.1% implies about 1.63bn for 2023.
  - January–August 2026: 1.68bn.
- **Imports.** Minus exports to Russia (USD 0.10–0.14bn a year), imports are 1.53, 1.86, 2.36 and 1.58bn (January–August 2026), ±6%.
  - Centrals rise 2–18% compared with `nonreport.json`.
  - The 2023 Comtrade report (0.90bn) contradicts both sides and is no longer the low end.
- **2021 price level.** The 2021 fuel price band (0.95–1.35) was the benchmark × a fixed own ratio in every year 2019–2021. That ratio cancels in the 2021 index, so the band is now ±3%. This narrows the base.

### Belarus: price of Russian crude and gas (B for the price index)

- **The crude price.** Belarus buys Russian crude at a Urals-linked netback: the Urals quotation minus the Russian export duty, plus a small premium (Interfax, 2020).
- **What was wrong.** The builder priced it with the general Urals band, whose 2022 high (1.92) is close to Brent.
- **The netback in EUR.** Urals annual averages minus the duty, which the tax manoeuvre phased out by 2024, give an index of 1.20, 1.55, 1.31, 1.47 and 1.20 for 2021–2025. 2026 is the builder's Urals index × 1.183 (no duty).
  - Band −6%/+5% (2026 ±8%).
  - I took the Urals averages (MinFin) and the duty path from the formula and the tax-manoeuvre coefficients, not from a downloaded table. 2024–2025 are the least certain, about ±3%. Please check these against MinFin before using them.
- **Gas.** Gas is a fixed contract price of USD 128.5 per thousand m³, so its index is known to ±2%.
- **Side effects.**
  - The central price index rises 2–6%. The volume bought is then lower, so "more paid" falls from 2.8% to 0.7% of GDP.
  - The fuel windfall rises by EUR 0.3–0.6bn a year, because the end of the export duty counts as a price rise. That part is a pre-war policy (the tax manoeuvre), not a war effect. The builder could keep the old base for the windfall, or take the duty out of it.
- **Not narrowed.**
  - The split of the known Belarus–Russia turnover between the two directions: no official exports-to-Russia figure for 2022–2025 was found.
  - The non-fuel price band.

### Kazakhstan, Kyrgyzstan, Mongolia: customs margins (A)

- **Cause of the width.** `trade_full.json` sets the margin on own reports at half the gap to Russia's mirror, measured against the world median ratio of 0.847. That ratio reflects sea freight and origin attribution. For land-border and EAEU partners the expected ratio is about 1.0, so the margins were inflated.
- **Russia's own 2019–2021 reports** (exports to the partner ÷ the partner's imports from Russia):

  | Partner | 2019 | 2020 | 2021 |
  |---|---|---|---|
  | Kazakhstan | 1.00 | 1.02 | 1.05 |
  | Mongolia | 1.00 | 0.99 | 0.93 |
  | Belarus | 0.99 | 0.97 | 0.98 |
  | Armenia | 1.14 | 1.13 | 1.06 |
  | Kyrgyzstan | 1.11 | 1.34 | 1.13 |
  | Tajikistan | 0.94 | 0.85 | 0.87 |

  Exports side: Kazakhstan 1.01–1.02.
- **New bands, applied to own-report years with centrals kept.**
  - Kazakhstan imports: −4%/+6%. Exports: −4%/+5%.
  - Kyrgyzstan imports: −4%/+13%. This is asymmetric because Russia always records more. NBKR's figures, which match Comtrade, already include survey-based additions for unrecorded EAEU trade.
  - Mongolia imports, 2019–2023: ±5%. 2024–2026 still rest on press figures (`narrow.json`).
- **Replaces.** The low/high of `narrow.json`'s trade_layer for these series, and of the own-report years in `trade_full.json`.

### Yemen and Syria: pre-war level from Russia's own exports (B)

- **Russia's own exports.**
  - To Yemen: USD 250m, 238m and 234m in 2019–2021, which is stable.
  - To Syria: USD 300m, 183m and 594m.
  - These are what Russia was paid. Yemen's own 2019 report covers only the ports the Aden government controls.
- **New bands.** The generic mirror band (±80% for Yemen) is replaced by −12%/+20% for Yemen and −12%/+25% for Syria, for goods routed through neighbours. Yemen's 2019 now uses the mirror too (0.263 instead of 0.131).
- **Years 2022–2026 unchanged.**
  - **Yemen's central is probably too low.** Yemen entered Russia's top-10 wheat destinations in 2023 (Russian Grain Exporters Union, via search), which suggests well over 1 Mt. `nonreport.json` allows only EUR 0.12–0.18bn a year for wheat and food. I found no tonnage, so this is not fixed here. FAO GIEWS or Russian customs by destination would settle it.
  - For Syria, the paid share (0.35–0.90) remains the main width.

## Looked at, not narrowed

- **Armenia and Kyrgyzstan sales to Russia (`from_rus`).** The width is the re-export share and the residual.
  - NBKR's official re-exports (USD 150–170m a year to all destinations) cover only the customs re-export regime. Chinese goods cleared in Kyrgyzstan and sold on are ordinary exports, so that figure is only a lower bound.
  - The Russian side reports much larger turnover with Kyrgyzstan than Kyrgyzstan does: January–August 2025 USD 3.0bn against about 2.0bn; 2025 above 5bn against 3.1bn; January–May 2026 2.3bn against 1.4bn.
  - That supports a sizeable residual, not a narrower one.
- **Services (Kyrgyzstan, Tajikistan, Armenia).**
  - NBKR's balance of payments (2023 and 2024 reports) has goods by country but services only in total. Kyrgyz services exports rose from USD 0.52bn (2021) to 3.32bn (2024), so the total does not bound sales to Russia.
  - Partner tables were not found for Armenia and Tajikistan, and the Bank of Russia stopped them after 2021.
  - The BaTiS years stay as they are.
- **Belarus actual values and base.** These were already pinned by `narrow.json` to official turnover. The direction split remains about ±USD 1.5bn a year.
- **Mongolia 2024–2026.** The NSO site was unreachable, so these years were not changed.
- **Kazakhstan sales to Russia.** The re-export and residual parts were not changed.

## Recommendations for the builder

1. **Reported margins.** For EAEU and land-border partners, measure the reported margin against a mirror ratio of 1.0, not 0.847. This affects more countries than the four touched here.
2. **2021 price index.** Its band should not carry a level error that is common to 2019–2021. Where pre-war prices are benchmark × own ratio (Tajikistan here; probably others), only the benchmark's year-to-year error remains.
3. **Correlated ranges.** Apply one share to linked quantities instead of independent extremes, as done for Brunei. The same applies to Armenia's total imports and gold, which come from one dataset.
4. **Belarus windfall.** Decide whether the end of the export duty belongs in the windfall.

## Sources

- **UN Comtrade public preview API.**
  - Russia's 2019–2021 exports and imports with ARM, KGZ, KAZ, TJK, MNG, BLR, BRN, YEM and SYR.
  - Armenia's HS 71 and total trade 2019–2025, and monthly 2025–2026.
  - Brunei's HS 2709 imports by origin with tonnes (round-6 download).
- **National Bank of the Kyrgyz Republic.** Balance of payments for 2023 and 2024 (nbkr.kg/DOC/02092024/000000000062938.pdf, nbkr.kg/DOC/09072025/000000000064962.pdf).
- **Tajikistan:** TASS via investfuture.ru (2026-07-20), Interfax (2025-10-15), expert.ru (2024-08), alta.ru (2026).
- **Kyrgyzstan, Russian side:** investfuture.ru (Overchuk, January–May 2026), rg.ru (2026-08-06, Putin on 2025).
- **Belarus:** Interfax (2020-02-21) on oil pricing; `gas_prices.json`.
- **Yemen:** Russian Grain Exporters Union via osnmedia.ru and a moex.com review (Yemen in the top 10 in 2023).
