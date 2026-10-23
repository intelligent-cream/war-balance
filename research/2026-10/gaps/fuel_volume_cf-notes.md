# "Paid to Russia": a narrower no-war band from physical fuel volumes? (round 8)

Data file: `research/2026-10/gaps/fuel_volume_cf.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

This file moves no money and changes no central value. It only replaces the width of the "expected without the war" band of `to_rus`, for seven countries.

## Summary

- **The hypothesis holds for pipeline buyers and fails for seaborne buyers.**
- Measured on physical volumes, the fuel bought from Russia by countries tied to it by pipeline (gas pipelines, Druzhba crude) is much steadier than the generic band. Their 2022-2026 band is **0.80-1.30**. The generic band for large flows is 0.57-1.62.
- Fuel bought by sea, by rail or as LNG is not steadier: **0.52-1.77**. That is as wide as the generic band, or wider.
- Goods other than fuel are very unsteady: **0.50-2.60**. They move only weakly with fuel (correlation 0.10 overall, 0.26 among pipeline buyers).
- **New band for seven countries:** Germany, Poland, Hungary, Slovakia, Czechia (pipeline group), Finland (other group) and North Macedonia (pipeline group, low certainty).
- **The other 26 keep today's band.** Their tested band was not narrower, or it failed a check.
- **Poland has a documented different path.** Its Yamal gas contract ended in 2022, and PGNiG gave notice in November 2019 that it would not renew. It is given as `central_alternative` (total ×0.859 from 2023) and is not applied.

## Effect on the map

These are widths of this term alone, in % of GDP, low side / high side. They use the same basis as the brief: `site/data.json` base × central path × (1 − low) or (high − 1), divided by GDP.

| country | group | today's band 2022-26 | new band | today, % GDP | new, % GDP | status |
|---|---|---|---|---|---|---|
| Germany | pipeline | 0.570-1.617 | **0.738-1.314** | 1.8 / 2.5 | **1.1 / 1.3** | new (B) |
| Italy | pipeline | 0.570-1.617 | – | 1.7 / 2.4 | same | kept: misses its 2007 test window |
| Netherlands | other | 0.570-1.617 | – | 4.3 / 6.2 | same | kept: tested band wider (×1.05) |
| Poland | pipeline | 0.570-1.617 | **0.754-1.640** | 4.2 / 6.0 | **2.4 / 6.2** | new (B); high side slightly longer |
| Finland | other | 0.570-1.617 | **0.655-1.612** | 6.8 / 9.7 | **5.5 / 9.7** | new (C) |
| Lithuania | other | 0.570-1.617 | – | 10.9 / 15.6 | same | kept: not narrower (×1.00) |
| Latvia | pipeline | 0.570-1.617 | – | 5.2 / 7.4 | same | kept: wider (fuel is only 32% of its imports) |
| Estonia | other | 0.570-1.617 | – | 8.5 / 12.2 | same | kept: ×0.96, and the band built without Estonia covers 10/12 |
| Hungary | pipeline | 0.570-1.617 | **0.785-1.287** | 4.3 / 6.1 | **2.1 / 2.9** | new (B) |
| Slovakia | pipeline | 0.570-1.617 | **0.836-1.287** | 7.5 / 10.7 | **2.8 / 5.0** | new (B) |
| Czechia | pipeline | 0.570-1.617 | **0.791-1.481** | 3.6 / 5.2 | **1.7 / 4.0** | new (B) |
| Bulgaria | other | 0.570-1.617 | – | 5.4 / 7.8 | same | kept: wider (×1.05) |
| Austria | pipeline | 0.570-1.617 | – | 1.4 / 2.0 | same | kept: no gas origin data after 2008 |
| Greece, Romania, Belgium, France, Spain, Türkiye | other | 0.570-1.617 | – | see JSON | same | kept: tested band wider |
| Belarus | pipeline | 0.789-1.310 | – | 24.9 / 36.6 | same | kept: tested band ×3.9 wider |
| Kazakhstan | other | 0.570-1.617 | – | 10.0 / 14.4 | same | kept: fuel is 9% of its imports; wider |
| Kyrgyzstan | other | 0.570-1.617 | – | 18.4 / 26.4 | same | kept: wider (×1.25) |
| Georgia, Armenia, Mongolia, Serbia, Bosnia, Moldova | – | today's | – | see JSON | same | kept |
| North Macedonia | pipeline | 0.470-3.190 | **0.474-1.643** | 2.8 / 11.6 | **2.8 / 3.4** | new (C) |
| China, India, Japan, Korea | other (LNG/sea) | 0.570-1.617 | – | see JSON | same | kept |

- In the brief's table, the big narrowing is in **Slovakia** (7.5/10.7 → 2.8/5.0), **Hungary** (4.3/6.1 → 2.1/2.9), **Germany** and **Poland's low side**.
- **Belarus, Kazakhstan, Kyrgyzstan, Lithuania and the Netherlands keep their wide ranges.** Belarus's and Kazakhstan's imports from Russia are mostly not fuel. Lithuania and the Netherlands buy their fuel by sea.

## 1. Physical volumes (task 1)

- **Eurostat** imports by partner = Russia, 1990-2024, used 2005-2021:
  - `nrg_ti_gas` (TJ GCV);
  - `nrg_ti_oil` (crude O4100_TOT and products O4600, kt);
  - `nrg_ti_sff` (solid fossil fuels, kt).
  - It covers all EU members, Norway, the UK (to 2019), Türkiye, the Western Balkans, Moldova, Georgia and Ukraine.
- **UN Comtrade** net weight of HS 2709/2710/2711/2701 imports from Russia, 2005-2021: Belarus, Kazakhstan, Kyrgyzstan, Armenia, Mongolia, China, India, Japan, Korea, Georgia, Serbia, North Macedonia, Bosnia, Moldova, Türkiye, Ukraine.
  - Russia's own exports of the same codes to every partner (mirror) fill the gaps.
  - Gas in kg is converted at 53.4 GJ per tonne.
- **Cleaning** (all listed in `coverage`):
  - An exact zero between positive years, or zeros at the end after a steady series, is treated as a confidentiality artefact and set to missing. Cases: Belgium gas 2011-16, Bulgaria crude 2020-21, Austria gas from 2009.
  - A Eurostat zero is replaced where Comtrade shows a material flow (Serbia and North Macedonia crude in the 2000s).
  - Comtrade years are spliced in only when the overlap factor is 0.5-2. Moldova's and Bosnia's early gas and products failed this test and stay missing.
  - Belarus's 2021 gas is missing: it withheld the data.
- **Fuel volume index per country:** each fuel's volume is valued at a fixed 2019-2021 unit value:
  - crude EUR 370/t, products EUR 420/t;
  - pipeline gas EUR 4.67/GJ, coal EUR 60/t.
  - The result is a volume index at constant prices. These weights reproduce Germany's 2019-2021 fuel mix in `energy2.json` to within a few points.
- **Coverage:** 33 of the 33 listed countries have at least one fuel series.
  - 28 have 8 or more measured five-year fuel windows.
  - Too few: Austria and Bosnia (none; Austria's gas origin is not reported), Belgium and Latvia (6, gaps), Moldova (7).

## 2. Rolling back-tests on volumes (task 2)

**Set-up.**
- Same as round 7: 2021 is held flat.
- Origins 2005-2016, horizons 1-5 years, targets up to 2021.
- The cumulative error is log(Σ w·volume / Σ w·volume at origin), with w = 1, 1, 1, 1, 8/12.
- Eras: 2005-09, 2010-12, 2013-16. K is the smallest K ≥ 1 for which the 5th-95th percentile of two eras, times K, covers ≥ 90% of the third era. No shrinking (round 7 allowed K < 1).
- Only fuel flows of at least EUR 0.3 bn a year at the origin count (the size-L analogue).

**Groups, fixed in advance by infrastructure.**
- A window is "pipeline" if pipeline gas plus Druzhba crude is at least 60% of the fuel value at its origin year.
- LNG-only buyers: Spain, Portugal, UK, Japan, Korea, India, China, Ireland, Malta, Cyprus.
- Druzhba crude: Germany, Poland, Czechia, Slovakia, Hungary, Belarus.
- For the 2022-2026 band, a country's group comes from its 2019-2021 mix (`energy2.json`).

**Fuel-volume band, 2022-2026 (H5 with 2026 at 8/12):**

| group | band | K | windows | countries |
|---|---|---|---|---|
| pipeline | **0.801-1.302** | 1.65 | 88 | 11 |
| other (sea, rail, LNG) | 0.516-1.774 | 1.20 | 247 | 30 |
| all | 0.526-1.762 | 1.25 | 335 | 38 |
| generic band of large flows today (value / price index, all goods) | 0.570-1.617 | 1.1 | 480 | 53 |

**By kind of series** (each fuel separately, flows ≥ EUR 0.1 bn):
- **Druzhba crude** 0.72-1.24: the steadiest. Slovakia's crude from Russia was 5.1-6.1 Mt in every year 2005-2021.
- **Pipeline gas** 0.51-1.78 for all flows; 0.77-1.59 for flows of EUR 1 bn or more.
- **Seaborne crude** 0.31-2.27.
- **Seaborne products** 0.30-3.80.
- **Coal** 0.51-2.30.
- **Rail products** (Central Asia, Mongolia): not usable (four countries, 47 windows, unstable).

**Reading.**
- Single pipeline-gas flows are not that steady: weather, storage and statistical breaks all move them.
- But a pipeline buyer's whole fuel basket, crude plus gas, is steady: 88 windows mostly within ±20%.
- The pipeline group is calibrated in every era (coverage 0.97 / 0.92 / 1.00).
- Its widest misses are Belarus (2010 oil dispute: ×1.43; 2012: ×0.78) and Armenia. Political supply disputes are the real risk inside this group.

## 3. Contracts and infrastructure (task 3)

The full list with sources is in `contracts`. The main points:

- **Poland (PGNiG, Yamal):**
  - 10.2 bcm/yr, take-or-pay 8.7 bcm (85%), ended 31 Dec 2022;
  - non-renewal notified 15 Nov 2019; Baltic Pipe (10 bcm) planned from Oct 2022.
  - This is the one documented pre-war change of path: `central_alternative`, total ×0.859 of 2021 from 2023 (2022-26 sum ×0.889).
  - Orlen's crude contracts with Rosneft (to Jan 2023) and Tatneft (to end-2024) were in force.
- **Hungary (MVM):**
  - up to 4.5 bcm/yr for 15 years from 1 Oct 2021, about 0.62 of Hungary's 2021 gas from Russia.
  - If Hungary had bought only that, the total would be about 0.84 of 2021, inside the new low side (0.785).
  - Hungary in fact bought more (over 5.5 bcm in 2023). The contract is not a ceiling.
- **Czechia (RWE Transgas/innogy):** 9 bcm/yr to 2035, take-or-pay 90%, about 0.93 of the 2021 volume. It is a soft floor: an arbitration award allowed lower uptake.
- **Germany (Uniper):** about 24 bcm/yr to 2035/36. Take-or-pay is only about 0.36 of Germany's 2021 volume, so it does not bind.
- **Nord Stream 2:** never flowed (certification suspended 16 Nov 2021). It was a new route for gas already contracted, not new demand, so the 2021-held volume is unchanged.
- **OMV** (to 2040, take-or-pay reportedly 96%), **Eni** (to 2035), **Engie** (to 2030) and **SPP** (to 2034): long-term contracts covering 2022-2026. No volumes were found for them.
- **Bulgargaz:** up to 2.9 bcm, ended 2022, with no documented pre-war decision to stop. If not renewed, the total would be about 0.76 of 2021 from 2023. Not used.
- **BOTAŞ:** Blue Stream 16 bcm/yr to end-2025. Part of the TurkStream contracts expired in 2021. 2026 was not contracted.
- **Belarus:**
  - gas by yearly protocol (18.8 bcm in 2020, 19.8 bcm in 2021; the 2022 price was fixed on 1 Dec 2021);
  - crude in a government range of 18-24 Mt/yr, with 2021 at the low end (Naftan cut off in H2 2021).
- **Druzhba refineries:** Leuna (about 10 Mt/yr), Schwedt (Rosneft), MOL Danube and Slovnaft (14.2 Mt capacity, mostly Druzhba), and Litvínov/Kralupy (about half Druzhba).

**Use in the band.** The contracts support a steady pipeline volume and the low sides found. Where documented, the take-or-pay floors (Czechia 0.93, Poland 0.85 for 2022 only) are above the new low sides. The floors were used as checks, not to set bands: most volumes are not published, and buyers resell.

## 4. Fuel and non-fuel combined (task 4)

- **Non-fuel goods** = imports from Russia × (1 − HS 27 share) ÷ the non-fuel price index, over all importers with at least EUR 0.1 bn.
  - The band is 0.495-2.597 (K 1.75, 450 windows): wider than the generic band of all goods.
- **Correlation** of the fuel and non-fuel 5-year errors:
  - Pearson 0.10 overall, 0.26 in the pipeline group, 0.08 in the other group;
  - Spearman 0.16 / 0.31 / 0.13.
- **Combining.** For each country, every window of its group with both errors is recombined with the country's own fuel share s (from `energy2.json`): R = s·fuel + (1 − s)·non-fuel.
  - This uses the measured joint behaviour, correlation included, rather than a formula.
  - The 5th-95th percentile × K (era-calibrated again) gives `cumulative_band`. Per-year multipliers are built the same way.
- **Safeguard.** The country's own windows of the map's own series (deflated value of all goods) must also be at least 90% inside. If not, the band is widened to cover them.
  - This widened Germany's low side from 0.834 to 0.738. Germany's customs value fell in 2006-07 windows when gas reporting changed.
  - It widened Hungary's from 0.836 to 0.785, and North Macedonia's from 0.753 to 0.474.

**Who gains.** Only buyers with a high fuel share in the pipeline group:
- Slovakia and Hungary (0.87), Germany (0.79), Czechia (0.70), Poland (0.63).
- Where fuel is a small share (Latvia 0.32, Belarus 0.32, Kazakhstan 0.09, Moldova 0.25), the unsteady non-fuel part dominates. Their combined band is wider than today's.

## 5. Decision (task 5)

A country gets the new band only if all of these hold:
- (a) it is at least 5% narrower;
- (b) it is era-calibrated;
- (c) it covers at least 90% of its own windows (at least 8 measured) and all three of its test windows (origins 2007, 2012, 2016);
- (d) the band built without the country also covers at least 90% of its windows (new this round, against circularity);
- (e) the safeguard in section 4 is met.

All seven new countries cover 11 or 12 of their 12 own windows, both on volumes and on the map's series. Poland misses its 2005 window (×1.85, a non-fuel jump).

| country | own windows | test windows (2007/2012/2016) | band without the country | K |
|---|---|---|---|---|
| Germany | 12/12 | 0.86 / 1.12 / 0.94 | 0.848-1.323, 11/12 | 1.25 |
| Poland | 11/12 | 1.21 / 0.90 / 1.10 | 0.751-1.558, 11/12 | 1.8 |
| Finland | 12/12 | 0.92 / 1.01 / 1.21 | 0.651-1.630, 12/12 | 1.15 |
| Hungary | 12/12 | 0.95 / 0.91 / 1.07 | 0.833-1.349, 12/12 | 1.35 |
| Slovakia | 12/12 | 0.94 / 1.02 / 1.01 | 0.825-1.312, 12/12 | 1.35 |
| Czechia | 12/12 | 1.08 / 0.98 / 1.14 | 0.760-1.522, 12/12 | 1.6 |
| North Macedonia | 12/12 | 0.77 / 0.80 / 1.00 | 0.753-1.643, 11/12 | 1.8 |

**Main reasons for keeping today's band:**
- Italy fails its 2007 test window (0.79). Most of its old windows were seaborne-crude windows.
- Austria has no gas origin data.
- Bulgaria's 2016 window cannot be measured (crude confidential).
- Seaborne buyers (Netherlands, Lithuania, Greece, France, Spain, Romania, Türkiye, Korea, Japan, China, India) are not narrower.
- Low-fuel neighbours (Belarus, Kazakhstan, Kyrgyzstan, Armenia, Moldova, Georgia, Mongolia) are wider or fail their own windows.

## Certainty

- **B: Germany, Poland, Hungary, Slovakia, Czechia.** Eurostat volumes, a large and calibrated group, and a contract record that fits.
- **C: Finland.** Its band comes from the wide "other" group. It narrows mainly because its fuel share and non-fuel errors are moderate.
- **C: North Macedonia.** A small flow; its Comtrade-spliced crude in the 2000s (refinery closed in 2013); the safeguard set its low side.
- The per-year multipliers are wider than the cumulative ones (single years are noisier), as in round 7.

## What this does not cover

- The bands are for **volumes**. The map's no-war price path and its range (`energy_nowar.json`, nrl/nrh) are separate and unchanged.
- **Belarus:** today's band (0.789-1.310, `narrow.json`) covers 10 of its 11 volume-composite windows. **Moldova:** today's band (0.848-1.435) covers only 3 of 7. Moldova's fuel is steady, but its non-fuel imports from Russia swing widely. Today's Moldova band is probably too narrow on volumes. This was not changed here.
- India's own windows (rapid growth after 2016) lie outside every band tested. Its today's band is probably too narrow on the high side.
- Comtrade HS 2711 mixes natural gas with LPG for the Central Asian neighbours.

## Open questions

- Should the builder apply Poland's `central_alternative` (Yamal non-renewal, documented in 2019)? It would lower Poland's 2023-2026 no-war level by 14%, so "less paid to Russia" would shrink for Poland.
- Should the pipeline-group band also be used for Italy and Austria? They fail only on data (Italy's old seaborne windows, Austria's missing gas origin), not on evidence of volatility.
- Should Moldova's and India's bands be widened, given their own windows?
