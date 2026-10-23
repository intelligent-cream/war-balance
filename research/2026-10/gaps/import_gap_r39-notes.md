# Russia's import gap: who the missing sales belong to (round 39)

Data file: `import_gap_r39.json` (same folder). Generated 2026-10-23.
Scratch work and scripts: `/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r39/weak/` (`scripts/gap2.py`, `scripts/gap_mc.py`, `out/`).

## What it replaces

`residual.json` → `exports_to_rus_gap.countries`, read by `apply_residual()` in `pipeline/build_data.py`. The new file has the same shape: `{ISO3: {year: {low, central, high}}}` in EUR bn for 2022–2025. The pipeline already sets 2026 to the 2025 rate × 8/12.

The yearly totals stay as they are. The CIF/FOB part, the Kyrgyz and Kazakh transit parts and the residual total all keep the values in `residual.json` `by_year`. Only the split of the **residual** part over countries changes. That part is EUR 11.3 / 15.7 / 14.9 / 20.7bn in 2022–2025.

Today that part is spread **pro rata** over countries' reported exports to Russia, with coalition countries weighted 0.25. China therefore takes 54–57% of it. Its total gap allocation is EUR 7.6 / 12.7 / 15.0 / 17.8bn.

## Why the pro-rata rule can be tested after all

`residual-notes.md` says no comparison with Russia's own figures is possible because Russia publishes no partner breakdown. That holds for single countries, but not for continents:

- **Russia's customs service (FCS) still publishes imports by continent of origin**, in its yearly release.
- **Russia records imports by country of origin.** Partners record exports by destination.
- So the gap for each continent shows **whose goods** reach Russia without being declared as exports to Russia.

| FCS imports, USD bn | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| Asia | 135.4 | 145.1 | 187.5 | 191.2 | 185.9 |
| Europe | 124.4 | 89.5 | 78.5 | 73.1 | 72.3 |
| Americas | 26.9 | 16.9 | 15.0 | 14.8 | 16.3 |
| Africa | 3.0 | 3.1 | 3.4 | 3.5 | 4.4 |

**Where these figures come from:**
- **2021:** Russia's own report to UN Comtrade (reporter 643), summed by UN M49 continent. Cyprus and Türkiye count as Asia.
- **2023:** FCS via [Interfax](https://www.interfax.ru/business/945632).
- **2022:** the 2023 level divided by the growth rates FCS gave in the same release.
- **2024:** FCS via [TASS/Mail.ru](https://finance.mail.ru/article/fts-polozhitelnoe-saldo-vneshney-torgovli-rf-vyroslo-za-2024-god-na-7-79-65042948/).
- **2025:** the FCS table via [Lognews](https://lognews.ru/fts-predostavila-otchet-po-tamozhennoy-statistike-vneshnetorgovyy-oborot-rossii-v-yanvare-dekabre).
- Each year's continents add up to the FCS total (285.1, 283.0 and 279.0).
- FCS's own release pages could not be reached from here, so these are press quotations of FCS. Certainty is C.

## Method

1. **Sum partner exports by continent.** Partner-reported exports to Russia come from `trade_full.json` (central values), summed by continent.
2. **Move hub re-exports to where the goods were made.** Hub re-exports to Russia (`reexports.json` × the `refine.json` shares, plus Belarus from `belarus.json`) move from the hub's continent to the origin continent. For example, German goods re-exported by Armenia or Türkiye count for Europe.
3. **Group the continents into three blocks:** Asia; the West (Europe and the Americas); and Africa with Oceania.
   - Europe and the Americas are combined because EU-reported exports carry US-made goods.
   - In 2021 the partners' figure for Europe exceeded FCS imports from Europe by 5%. The Americas' figure fell 52% short.
4. **Take known items off each block's gap:**
   - CIF/FOB: the share in `residual.json`, 3.5–7.5% of FCS imports. Asia's rate is set 0–30% higher, for sea freight.
   - The unrecorded transit through Kyrgyzstan and Kazakhstan, by origin (`origin_shares_of_hub_increase`). "OTHER" is split 30–70% to Asia.
5. **What is left, floored at zero, sets each block's share** of the residual. This uses 20,000 Monte Carlo draws over:
   - the FCS figures (±1%; ±2% in 2022);
   - Belarus's exports (±12%, since they are an estimate);
   - the partner sums (±2%);
   - the re-export moves (×0.5–1.5);
   - CIF/FOB and transit.
6. **Split each block's share over countries:**
   - **Asia:** pro rata, as now (coalition countries weighted 0.25).
   - **West:** by Russia's own 2021 imports by origin (Comtrade reporter 643, Belarus and Ukraine excluded). This is the pre-war mix of origins that parallel imports replace. Germany is 21%, the USA 13%, France and Italy 9% each.
   - **Africa and Oceania:** pro rata to reported exports.
7. **Two values stay as they are.** Belarus keeps its old value (the pipeline still spreads it over the others). Each country's transit part from `residual.json` is kept: its old value minus its reconstructed pro-rata part. That reconstruction matches the old values to within 1% for India, the USA and Belarus.

**Pre-war check (2021).** After re-export origins and CIF/FOB, the 2021 residual is almost entirely Asian, plus small amounts for Africa and Oceania. The old pro-rata rule, which puts most of it on China, therefore fits the **pre-war** pattern. It does not fit the war years.

## Result

| share of the residual | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| Asia | 0.49 (0–0.82) | 0.16 (0–0.44) | 0.16 (0–0.44) | 0.46 (0.18–0.64) |
| West (Europe + Americas) | 0.37 (0–0.76) | 0.71 (0.46–0.88) | 0.71 (0.45–0.87) | 0.44 (0.26–0.68) |
| Africa + Oceania | 0.14 | 0.12 | 0.13 | 0.11 |

From 2023 the gap on European goods jumped:
- Before the war, partners reported 5% *more* European goods than Russia recorded.
- In 2023–24, after re-exports are moved to their origin, they reported 8–9% *less*.
- Asia's ratio stayed close to its pre-war level until 2024. It fell only in 2025, to 0.81.

The war-specific part of the gap is therefore mostly Western-made goods that reach Russia unrecorded. These are parallel imports through hubs that do not record them as re-exports to Russia.

| EUR bn, central | 2022 | 2023 | 2024 | 2025 | 2022–25 |
|---|---|---|---|---|---|
| China, old → new | 7.6 → 5.5 | 12.7 → 5.7 | 15.0 → 8.0 | 17.8 → 12.3 | **53.0 → 31.5** |
| Germany | 0.4 → 0.9 | 0.5 → 2.3 | 0.6 → 2.3 | 0.5 → 1.9 | 2.0 → 7.4 |
| USA | 0.03 → 0.5 | 0.01 → 1.3 | 0.01 → 1.2 | 0.02 → 1.0 | 0.07 → 4.0 |
| Italy | 0.1 → 0.3 | 0.1 → 0.9 | 0.3 → 1.1 | 0.3 → 0.9 | 0.8 → 3.2 |
| France | 0.06 → 0.3 | 0.04 → 0.9 | 0.04 → 0.9 | 0.06 → 0.7 | 0.2 → 2.8 |
| EU27 | 1.3 → 2.9 | 1.2 → 7.5 | 1.5 → 7.4 | 1.5 → 6.1 | 5.5 → 23.9 |
| Türkiye | 0.7 → 0.4 | 1.1 → 0.4 | 1.2 → 0.7 | 1.1 → 0.8 | 4.1 → 2.2 |
| Kazakhstan | 0.7 → 0.4 | 1.0 → 0.4 | 1.5 → 0.9 | 1.6 → 1.2 | 4.8 → 3.0 |
| Egypt | 0.04 → 0.5 | 0.04 → 0.8 | 0.05 → 0.8 | 0.09 → 0.9 | 0.2 → 2.9 |

**Effect on the map:**
- About EUR 21.5bn over 2022–25 moves off China. Most of it goes to EU countries (+18bn), the USA (+4bn) and Britain (+1bn). Africa and Oceania get +6bn.
- China's sales to Russia (517 gross) fall by about 4%.
- Germany, Italy and France gain EUR 2.4–5.5bn each "sold to Russia". This is the parallel-import channel.
- **This is the reverse of the old rule's assumption** that coalition countries' exports are fully recorded.

## Caveats and certainty

- **Block shares: C.** They rest on official FCS aggregates quoted by the press. Belarus's partner figure (an estimate of EUR 23–25bn) moves the West gap one for one; ±12% is allowed for.
- **2022 is weak.** FCS 2022 is derived from 2023 growth rates, and the Asia/West split overlaps zero.
- **Split within the West: D.** Russia's 2021 origin mix is a proxy. Parallel imports may lean more towards cars, electronics and machinery, which would favour Germany, Japan (in Asia), Korea and the USA.
- **Africa and Oceania (12%):** FCS imports from Africa are double partners' figures in every year, including 2021. This is structural: fruit and cocoa are recorded by origin but shipped from Europe or the hubs. Splitting it pro rata to reported exports (Egypt, South Africa, Morocco) is a weak, D-grade proxy. Leaving this block out would give its share to the West.
- **Alternative if the owner prefers not to assign by country:** show the West part as an unassigned "Western goods, unrecorded" line. The audit also suggested this.
- **No new source split China itself.** GACC's exports to Russia already sit in the partner sum. The test only shows that, after the war began, the gap beyond transit is mostly not Chinese.
