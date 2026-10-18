# Round 4b: UAE trade, refugee costs from budgets, Belarus, data artefacts

Data file: `round4b.json` (generated 2026-10-18). Amounts are EUR bn at ECB annual averages (as in `trade_full.json`).
2026 means January to August and is not annualised. Ranges are about 90%.
Scripts are in `working/round4b/`:
- `ct.sh`: UN Comtrade queries
- `partners_blr.py`: mirror test for Belarus
- `build_round4b.py`: assembles the JSON
- `artefact_fix.py` and `scan.js`: run the map's own `calc()` in a headless browser before and after the fixes

Nothing in `site/` or `pipeline/` was changed.

**Biggest changes against the map**
- **UAE 2025.**
  - Imports from Russia rise from EUR 7.2bn to 12.7bn, and exports to Russia from 3.7bn to 5.3bn.
  - Total trade now matches the official USD 20.4bn.
  - Most of the extra is gold, which the UAE passes on, so its own net payments rise much less.
- **Refugee costs, 27 hosts: EUR 133bn for 2022-26, against 155bn in the map.**
  - Lower: USA −7.4, Canada −5.2, Spain −2.6, Italy −1.6, UK −1.3, Slovakia −1.1, Austria −1.1, Romania −1.0.
  - Higher: Germany +2.0, Norway +1.0.
- **Belarus.**
  - Its pro-rata share of the residual is EUR 9.0bn over 2022-25 in total, not EUR 9bn a year. It is currently added on top of the official totals, and it should be zero.
  - Together with moving its recorded re-exports to their origins, Belarus's headline goes from −27.6% to −22.2% of GDP.
- **Artefacts.** Seven small countries change, five of them to near zero once transit terminals, a diamond pass-through, front companies and suppressed cells are handled:
  - Lebanon: 7.9% → 4.3%
  - Mauritania: 4.1% → 0.8%
  - Saint Lucia: −14.6% → 0
  - Bonaire: 7.4% → 0
  - Botswana: 2.8% → −0.1%
  - Seychelles: −10.4% → −0.8%
  - Malta: 4.2% → 2.5%

---

## 1. UAE trade with Russia, 2021-2026

**Why the map is short.** The Ministry's "non-oil trade" equals UAE customs trade with Russia. It includes the small HS 27 imports and gold.
- 2022: USD 8.19bn of imports + 2.59bn of exports = 10.78bn, against the official 10.8bn.
- 2023: 10.94bn, against about 11.0bn.
- 2024: 11.5bn (AED 42.23bn).
- 2025: 20.4bn.

The map's trade layer reaches USD 12.3bn for 2025 (EUR 7.2 + 3.7bn) from two estimates:
- an IMF staff estimate for imports (USD 8.1bn);
- the 2023 export level carried forward (the IMF's USD 0.06bn was rejected as an outlier).

**Estimate.** UAE customs basis, EUR bn, central. Ranges are in the JSON.

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 (Jan-Aug) |
|---|---|---|---|---|---|---|
| **Imports from Russia (to_rus)** | 3.14 | 7.78 | 5.97 | 7.21 (6.5-7.9) | 12.74 (11.4-14.1) | 5.85 (3.4-8.2) |
| gold | 0.29 | 5.09 | 2.33 | 4.99 | 9.20 | 3.87 |
| precious stones and PGM | 1.55 | 1.66 | 1.70 | 1.29 | 1.59 | 0.86 |
| fuel recorded by UAE customs | 0.08 | 0.27 | 1.07 | 0.37 | 0.62 | 0.26 |
| other goods | 1.23 | 0.76 | 0.86 | 0.55 | 1.33 | 0.86 |
| **Exports to Russia (from_rus)** | 1.23 | 2.46 | 4.15 | 3.42 (2.7-4.2) | 5.31 (4.0-6.6) | 3.61 (2.4-4.8) |
| re-exports (moved to origins) | 0.96 | 2.27 | 3.89 | 3.19 | 4.78 | 3.27 |
| national exports | 0.26 | 0.19 | 0.26 | 0.23 | 0.53 | 0.34 |
| *map trade layer: to_rus / from_rus* | | 7.78 / 2.46 | 5.96 / 4.15 | 6.03 / 3.71 | 7.20 / 3.71 | 4.29 / 2.36 |

**Gold in tonnes:** 96 (2022), 41 (2023), 66 (2024, Swissaid), about 95 (73-114) for 2025, and about 33 (15-52) for Jan-Aug 2026.

**How 2025 is split.** The USD 8.9bn rise over 2024 is split using four anchors:
1. Gold prices rose about 44% in USD.
2. The Armenian route collapsed in 2025. In 2024 it carried 78 t of Russian gold to the UAE. Armenia's exports fell 36%, and precious-metal re-exports to the UAE fell about 60%. The gold went more directly.
3. Russian-side turnover was USD 8.9bn for Jan-Sep 2025, and about 12bn for the year according to the UAE embassy in Moscow. It appears to leave out gold, and it includes Russian fuel that UAE customs miss. That implies UAE exports to Russia of about USD 5-7bn.
4. Russia's exportable gold is about 220-260 t. Hong Kong (92 t) and mainland China (25 t) take about half of that.

For Jan-Aug 2026, Russian gold moved to Hong Kong (99.7 t by July), so UAE gold falls.

**Keeping the other modules consistent**
- **Re-exports (`reexports.json`).**
  - 2022-2024 agree (EUR 3.19bn in 2024 in both).
  - Raise `reexports_to_RUS` to 4.78 for 2025 (from 3.97) and to 3.27 for 2026 (from 2.65). Move the extra with the same origin shares.
- **Russian goods the UAE passes on (`reexports_from_RUS`).** These should rise to about EUR 5.3bn (2024), 9.8bn (2025) and 4.3bn (2026), because the UAE passes on 84-91% of its Russian gold and stones. The first buyers are Hong Kong, India, Switzerland and Turkey. The UAE's own net payments to Russia therefore rise by only about EUR 0.2-0.6bn a year. The gold buyers gain most of the change.
- **CREA fuel.**
  - CREA's fuel delivered to the UAE (0.8/5.6/6.1/2.1/1.6/0.2) is the total.
  - The audit2 addition must be CREA minus the customs-recorded fuel above, floored at zero: 0.73/5.35/4.98/1.77/0.98/0.00.
  - audit2 assumed no customs fuel for 2024-2026, so its addition falls by 0.37, 0.62 and 0.19 in those years.
- **Hidden UAE gold** stays at zero for 2022-2026. The gold is now in the trade layer.
- **Not checked:** Armenia's 2025-2026 Russian gold in the map, given the collapse of the Armenian route.

**Certainty.**
- 2021-2023: A (customs records).
- 2024: B.
- 2025: total A, split C.
- 2026: C.

---

## 2. Refugee hosting costs from government data

**Method.** The figures are gross public spending by the host government on Ukrainians, per calendar year.
- Where a budget outturn exists, it is used: USA, Germany, Poland, Czechia, the UK, Spain, Ireland, Netherlands, Switzerland, France, Lithuania, Latvia and Romania.
- Where only programme parameters exist, cost = benefit or reception rates × Eurostat or UNHCR person-years (from `refugees.json`), and the certainty is C.
- Person-years are unchanged from `refugees.json`.

**EUR bn, central.**

| ISO3 | 2022 | 2023 | 2024 | 2025 | 2026 | 2022-26 | map now | cert. |
|---|---|---|---|---|---|---|---|---|
| USA | 0.52 | 1.25 | 1.05 | 0.64 | 0.23 | 3.69 | 11.09 | B |
| CAN | 0.51 | 0.75 | 0.54 | 0.37 | 0.21 | 2.38 | 7.55 | B-C |
| DEU | 7.00 | 11.20 | 10.90 | 10.60 | 7.00 | 46.70 | 44.74 | B |
| POL | 7.00 | 7.50 | 4.50 | 3.40 | 1.60 | 24.00 | 23.99 | B |
| CZE | 1.14 | 0.72 | 0.69 | 0.62 | 0.39 | 3.56 | 3.39 | A-B |
| GBR | 1.64 | 1.95 | 1.36 | 0.99 | 0.57 | 6.51 | 7.82 | B |
| ESP | 0.62 | 0.45 | 0.36 | 0.30 | 0.17 | 1.90 | 4.47 | B |
| ITA | 0.60 | 0.40 | 0.25 | 0.12 | 0.06 | 1.43 | 3.01 | C |
| NLD | 1.53 | 3.58 | 2.99 | 2.66 | 1.85 | 12.61 | 12.61 | A-B |
| IRL | 1.00 | 2.00 | 1.75 | 1.10 | 0.60 | 6.45 | 6.67 | A-B |
| AUT | 0.35 | 0.47 | 0.43 | 0.39 | 0.24 | 1.88 | 2.96 | C |
| BEL | 0.28 | 0.42 | 0.42 | 0.40 | 0.26 | 1.78 | 2.71 | C |
| SWE | 0.30 | 0.40 | 0.35 | 0.32 | 0.20 | 1.57 | 1.55 | C |
| NOR | 0.65 | 1.10 | 1.20 | 1.03 | 0.56 | 4.54 | 3.49 | B-C |
| DNK | 0.29 | 0.46 | 0.46 | 0.44 | 0.30 | 1.95 | 1.63 | C |
| FIN | 0.18 | 0.37 | 0.38 | 0.40 | 0.26 | 1.59 | 1.97 | C |
| SVK | 0.15 | 0.15 | 0.10 | 0.08 | 0.04 | 0.52 | 1.64 | C |
| ROU | 0.15 | 0.16 | 0.09 | 0.07 | 0.04 | 0.51 | 1.52 | B-C |
| MDA | 0.02 | 0.015 | 0.015 | 0.012 | 0.006 | 0.07 | 0.12 | C |
| LTU | 0.05 | 0.06 | 0.05 | 0.04 | 0.02 | 0.22 | 1.09 | B-C |
| LVA | 0.05 | 0.05 | 0.04 | 0.03 | 0.015 | 0.18 | 0.56 | B-C |
| EST | 0.05 | 0.06 | 0.05 | 0.045 | 0.025 | 0.23 | 0.66 | C |
| PRT | 0.05 | 0.07 | 0.06 | 0.06 | 0.035 | 0.28 | 0.94 | C |
| CHE | 0.93 | 1.45 | 1.50 | 1.61 | 1.14 | 6.63 | 6.63 | B |
| FRA | 0.63 | 0.45 | 0.33 | 0.27 | 0.15 | 1.83 | 1.67 | B |
| JPN | 0.008 | 0.010 | 0.008 | 0.006 | 0.003 | 0.04 | 0.05 | C |
| AUS | 0.02 | 0.05 | 0.04 | 0.03 | 0.02 | 0.16 | 0.16 | C |
| **Total** | 25.7 | 35.6 | 29.9 | 26.0 | 16.0 | **133.2** | **154.7** | |

**Main findings**
- **USA.**
  - GAO counts USD 3.78bn of Ukraine-supplemental money for ORR. Of that, only USD 1.79bn was allocated on the Ukrainian caseload; the rest served other populations.
  - Mainstream benefits (Medicaid, SNAP, SSI) for parolees are estimated at USD 0.15-0.65bn a year.
  - The map's model is three times this.
- **Canada.** CUAET holders mostly work. Federal spending is about CAD 1.3bn in total (CUTAI CAD 0.79bn), plus provincial health, schooling and social assistance.
- **UK.**
  - Homes for Ukraine cost GBP 2.1bn by September 2023 (NAO). Spending peaked in 2023 and fell with lower tariffs and fewer hosts; the tariff falls to GBP 3,300 from 2027.
  - The map's model keeps rising.
- **Spain** spent EUR 1.43bn in 2022-24, including EUR 237m of EU funds (Ministry of Inclusion). That is far below the model.
- **Italy** spent EUR 428m in 2022, plus extensions. Most Ukrainians stayed with family, and EUR 0.45bn of EU pre-financing was received.
- **Norway's** per-refugee cost is high because of the five-year integration grant (NOK 10.7bn proposed for 2022, NOK 6bn more in 2023). The model is too low.
- **Germany.**
  - The low end is the federal outturn (5.5 and 8.8 in 2022 and 2023; then Bürgergeld of 6.3 plus lump sums).
  - The central value adds Länder and municipal costs of about EUR 1.5-2.6bn a year.
- **Poland.**
  - Low = Aid Fund plus 800+ child benefit.
  - High = the government's PLN 90bn for 2022-23.
  - The 2022-26 total stays at EUR 24bn, but 2026 rises from 1.0 to 1.6.
- **Baltics, Slovakia and Romania.** Their state allocations are far below the model: Lithuania EUR 114m of state support by mid-2024; Slovakia about EUR 130m of accommodation contributions; Romania's 50/20 programme RON 592m in 2022.
- **Moldova.** These are its own costs. Donor-funded costs are already excluded, so the donor share in `flowback2.json` must not be applied on top.

**EU funding (`eu_funded`).** Five channels paid part of host costs:
- CARE and FAST-CARE: re-use of 2014-2020 cohesion funds;
- the EUR 3.4bn REACT-EU pre-financing of April 2022;
- AMIF and BMVI emergency aid and reallocations;
- the ESF.

Named EU shares, 2022-24:

| country | EU funds | channels |
|---|---|---|
| Spain | about EUR 0.24bn | AMIF + ESF |
| Italy | about EUR 0.45bn | REACT-EU |
| Poland | about EUR 0.9bn | REACT-EU and AMIF |
| Romania | about EUR 0.2bn | 50/20 claims |
| Slovakia | about EUR 0.15bn | accommodation contributions |
| Czechia | about EUR 0.2bn | |
| France | small | |

How to use them depends on how the map counts EU spending:
- The Kiel EU-institutions line in the map covers aid to Ukraine, not refugee spending inside the EU. If that stays so, keep the gross host cost.
- If EU refugee spending is ever added to EU-level aid (spread by budget share), subtract `eu_funded` from the host.

**Caveats**
- Health and school costs are in the national figures for some countries (Ireland, Czechia partly) and not others (Spain, France). The high ends cover the gap.
- Austria, Belgium, Sweden, Denmark, Finland, Estonia and Portugal have no published Ukrainian-specific outturn; their values are rate × caseload estimates.

---

## 3. Belarus

### (a) Belarus's share of Russia's import gap

**The premise needs one correction.** Belarus's pro-rata share is EUR 1.7/2.0/2.1/3.2bn for 2022-2025, or EUR 9.0bn in total, not EUR 9bn a year. Commit 72ff61c made the narrowed official data enter at customs level, so the residual now applies after it. Since then this share is added on top of Belarus's official totals in `site/data.json`:
- Belarus's sales to Russia in the map: EUR 23.9 / 25.1 / 26.4 / 27.1 / 18.9bn;
- official totals: EUR 22.2 / 23.1 / 24.3 / 23.9 / 16.8bn.

**Where the gap would come from**
1. **Belarus's own exports missed by partner data: about zero.** The map does not use partner data for Belarus. It uses Union State, Belstat/NBRB and Russian-side totals, which cover all of Belarus's exports to Russia. Classified military deliveries are possible (high end EUR 0.5bn a year), but Russia's FCS also leaves out such goods.
2. **Unrecorded EAEU transit: about zero.** This uses the same test as for Kyrgyzstan, in USD bn:

   | | 2021 | 2022 | 2023 | 2024 |
   |---|---|---|---|---|
   | Partners' reported exports to Belarus, excluding Russia | 15.1 | 12.8 | 18.1 | 16.6 |
   | Belarus's non-Russian goods imports (NBRB FOB imports less official imports from Russia) | 16.1 | 14.9 | 18.6 | 20.2 |

   After about 5% for freight (CIF/FOB), Belarus records as much as or more than partners say they sent. There is no growing mirror gap. 2025 partner data are incomplete.
3. **Valuation: slightly negative.** Belarus-basis totals are 3-5% above Russian-basis totals. Examples: the 2022 Union State figure scaled by 1.03-1.05, and 2025 at about USD 54.9bn on the Belarusian side against 50.9-51.9bn on the Russian side. Russia's FCS therefore books less from Belarus than the partner sum holds, so Belarus's own part of the gap is about −EUR 0.8bn a year.

**Allocation**
- **Belarus's residual: 0**, with a range of −1.2 to +1.0 a year.
- **Release to others:** EUR 2.5/2.8/2.9/4.1/2.7bn for 2022-2026. This is Belarus's current share plus the valuation offset, re-spread by the residual rule (mostly China, Kazakhstan and Turkey). A cleaner alternative is to recompute the residual with Belarus's official exports: `trade_full`'s split had Belarus EUR 1.6bn above the official value in 2022, which understated the residual.

**Re-exports inside Belarus's official exports.** This is the same question as for the other hubs. Belarus's official exports to Russia include goods it imported:
- China's exports to Belarus were USD 2.7bn in 2021, then 3.3, 5.8, 6.6 and 7.2bn in 2022-2025 (cars, electronics, machinery).
- Turkey's grew, and in 2023 Poland's and Lithuania's did too.

About 45% (35-60%) of China's increase and 30% of the others' are taken as passed on to Russia: EUR 0.30/1.72/1.81/1.94/1.42bn. Origins: China 86%, Turkey 9%, EU 5%. These should move to the origin countries, and Belarus keeps a margin.

**Effect on Belarus's sales to Russia (central):** −2.0/−3.6/−3.8/−5.0/−3.5. Belarus's headline 2022-26 goes from −27.6% of GDP to −22.2%.

### (b) Belarus's imports from Russia

USD bn, Belarus basis:

| | total | crude | gas | other goods | crude, Mt |
|---|---|---|---|---|---|
| 2019 | 21.6 | 6.58 | 2.74 | 12.2 | 18.2 |
| 2020 | 16.3 | 3.44 | 2.53 | 10.3 | ~13 (+3 Mt non-Russian) |
| 2021 | 23.7 | 6.70 | ~2.5 | 14.4 | 15.6 |
| 2022 | 22.4 | 4.6 | 2.4 | 15.3 | 10.5 (9.5-12) |
| 2023 | 23.0 | 5.3 | 2.5 | 15.1 | 14 |
| 2024 | 24.0 | 6.3 | 2.6 | 15.0 | 15 |
| 2025 | 25.0 | 5.4 | 2.6 | 16.9 | 14.5 |
| 2026 Jan-Aug | 18.1 | 3.3 | 1.7 | 13.0 | 9.5 |

- **Crude** is bought at the Belarusian contract price: Urals-linked, discounted and duty-free (about USD 350-440 per tonne).
- **Gas** is at the frozen USD 128.5 per 1,000 m³, settled in roubles from 2023.
- Crude and gas together are a third of imports. The rest is metals, cars and parts, chemicals, food, electricity and coal.

**Processed and re-exported.** The share of refined crude that leaves Belarus as products, by mass:

| | share | product exports, Mt | main destinations |
|---|---|---|---|
| 2019 | 0.61 (0.56-0.66) | 11.5 | UK 43%, Ukraine 29%, Netherlands 11%, Poland/Baltics 6% |
| 2020 | 0.56 | 9.5 | Ukraine 37%, UK 34%, Netherlands 15% |
| 2021 | 0.52 | 9.0 | Ukraine 40% (USD 2.3bn), EU/UK before the sanctions of June 2021 25%, via Russian ports 22% |
| 2022 | 0.47 | 5.6 | via Russian ports 55%, Ukraine Jan-Feb 19%, Russian domestic market 18% |
| 2023 | 0.53 | 8.5 | via Russian ports 72%, Russia 12% |
| 2024 | 0.53 | 8.8 | via Russian ports 72%, Russia 14% |
| 2025 | 0.52 | 8.3 | via Russian ports 65%, Russia 22% |
| 2026 Jan-Aug | 0.51 | 5.5 | via Russian ports 55%, Russia 32% (petrol to Russia ×13 in Jan-May) |

**Consequence for the map.** From 2023, importers record almost no oil products from Belarus (USD 0.10-0.15bn a year). Cargoes loaded at Ust-Luga and St Petersburg are booked as Russian, both by buyers and by CREA. Buyers' "payments to Russia" for these products partly reach Belarus as a processing margin; only the crude value reaches Russia. This is about 5-6 Mt a year, or USD 3-3.5bn.

---

## 4. Artefacts

The headline is the shift for 2022-2026 as a share of 2024 GDP. It was computed with the map's `calc()` on the current `site/data.json`, and again with the fixes in `artefact_fix.py`.

| ISO3 | problem | fix | headline before → after |
|---|---|---|---|
| LBN | 2019 imports from Russia (USD 1.34bn, fuel 1.19bn) were inflated by subsidised fuel smuggled to Syria before the collapse | baseline = mean of 2018, 2020 and 2021: EUR 0.48bn (0.42-0.55) instead of 0.66 | 7.9% → 4.3% |
| MRT | pre-war "Russian" fuel (USD 0.12bn a year) was traders' cargoes labelled by origin; Russia recorded USD 1-2m | to_rus baseline = Russia's export records ×1.1 (EUR 0.021bn); origin-labelled cargoes treated as oil bought via others, before (EUR 0.065bn) and after the war (0.07/0.06/0.03/0.03/0.015 via the UAE, Togo and India) | 4.1% → 0.8% |
| LCA | one Russian mirror record of USD 0.285bn of crude in 2021 to the Cul de Sac storage terminal, carried forward to 2025 | to_rus and price extra set to 0; transit terminal | −14.6% → 0% |
| BES | a 2019 mirror record of USD 0.064bn of fuel oil to the BOPEC terminal, extended by estimates | same as Saint Lucia | 7.4% → 0% |
| BWA | pre-war imports were Russian rough diamonds for resale (USD 0.11-0.17bn) | pass the stones on; Botswana keeps a 5% margin | 2.8% → −0.1% |
| SYC | shadow-tanker managers incorporated in the Seychelles get the freight profit | keep 20% (5-50%) as for UAE managers; the rest goes to the Russian-controlled pool | −10.4% → −0.8% |
| MLT | services bought from Russia fall 98% in 2023 (suppressed cells), and a COVID-rebound multiplier is applied to non-travel services | 2023-26 = 0.08/0.07/0.06/0.04; no rebound | 4.2% → 2.5% |

**Lebanon values (USD bn)**

| | 2018 | 2019 | 2020 | 2021 |
|---|---|---|---|---|
| Imports from Russia | 0.567 | 1.344 | 0.517 | 0.609 |
| Sales to Russia | 0.005 | 0.008 | 0.007 | 0.012 |

Services each way are about EUR 0.02bn (2019-2021 mean). No partner breakdown is published for 2018.

**Mauritania.** Fish sales to Russia (USD 0.161, 0.095 and 0.051bn in 2019-2021) did stop. But Russia itself recorded only USD 1.5-1.9m of fish imports from Mauritania, so this was mostly catch by Russian-operated trawlers sold on elsewhere. The loss is real but small; only the profit share counts.

**Also seen, not proposed**
- Tunisia (−11%): a real supplier switch (Russia's share of its fuel imports went from 4% to 60%), not a re-export hub.
- Gambia (−5%): the same, smaller.
- Kyrgyzstan, Armenia and Georgia are already handled as hubs.
- Cyprus: margin method, as audit2 found.

**Other issue.** `trade_full`'s linear `trend_2022` is negative for Mauritania's sales. It should be floored at zero, as audit2 also says.
