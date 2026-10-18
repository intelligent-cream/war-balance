# Second audit: seven open questions (2026-10-18)

This audit follows up the open questions in `audit-notes.md`. It checks `site/data.json` (generated 2026-10-18, sha256 prefix `9e86583f36b8f928`; a rebuild gave the identical file) against UN Comtrade, Eurostat, CREA, Kiel and national sources.

Details, machine-readable corrections (per country, series and year, with low/central/high) and sources are in `audit2.json`. Scripts are in `working/audit2/`:
- `patches.py` applies each correction to a copy of `data.json`.
- `q6shares.py` computes the Baltic and Finnish shares.
- `build_audit2.py` writes the JSON file.

**How effects were measured.** Each correction was applied to a copy of `data.json`. The page's own `calc(c, 2026)` was then run for every country.
- Effects are the change in the central shift for 2022 to Aug 2026. They are in EUR bn at pre-war prices, as the map shows them.
- Positive means more toward Ukraine.
- Nominal amounts are given in the text.

## Answers

### 1. UAE gold: no triple count, but the Armenian route is not passed on
- **Customs record the shipping country.** UAE customs record gold by the country it was shipped from, not by its origin.
  - In 2023 the UAE reported 40.9 t (USD 2.58bn) from Armenia, beside 40.6 t (USD 2.52bn) from Russia.
  - Swissaid lists 2024 separately: 66 t from Russia and 78 t from Armenia.
  - Hong Kong records gold the same way: 7.8 t from Armenia in 2023, against Armenia's own 7.4 t to Hong Kong.
  - Armenian-routed gold is therefore not inside the UAE's imports from Russia, and hidden UAE gold is 0 in 2022–2025. No central value counts the same gold twice.
- **Correction (a): pass on the Armenian-routed gold.** This gold (EUR 7.6bn central, 2022–26) stays with the UAE in full. Yet the UAE re-exports 84–91% of its direct Russian gold (re-exports of Russian goods against 96.4 t and 40.6 t imported in 2022 and 2023).
  - Passing it on at 0.6/0.85/0.95 moves EUR 6.4bn (1.7–12.3) to the UAE's gold buyers: Hong Kong 2.1, India 1.3, Switzerland 1.1, Turkey 1.0 and Saudi Arabia 0.6.
- **Correction (b): drop hidden UAE gold for 2026.** The 2026 value (1.8, high 5.5) rests on the argument dropped for 2024–25, and Russian gold moved to Hong Kong in 2025–26. Set it to 0 (0–1.5).
- **Map effect:** UAE +7.3. Hong Kong −1.8, India −1.1, Turkey −0.8, Switzerland −0.8.
- **Not resolved:** official UAE–Russia non-oil trade was USD 20.4bn in 2025, against about USD 12bn of trade in the map. 2025 may be under-counted (0 to +EUR 7bn).

### 2. Russian fuel delivered to the UAE: missing, EUR 13.3bn in 2022–26
- **What is missing.** CREA has 5.6 (2022), 6.1 (2023), 2.1 (2024), 1.6 (2025) and 0.2 (2026), almost all oil products.
  - UAE customs record 0.27 and 1.07 of HS 27 from Russia in 2022–2023. 2024–25 are not reported.
  - `laundered` is fuel refined from Russian crude in other countries, mainly India, so it does not hold these products.
  - The max(customs, fossil) rule only runs for pipeline-gas countries, and hub resale only moves `laundered`.
- **Correction.** Add fossil minus customs HS 27 to the UAE, net of resale.
  - The resale share is 0.30/0.42/0.65, from UAE re-export records. Bunkers stay with the hub, as elsewhere in the method.
  - The UAE keeps EUR 8.1bn (3.9–11.6). Its 2021 level (0.74) goes into the baseline at 2019–2021 prices.
  - EUR 5.6bn is resold, of which 4.7 goes to named customers by `hub_buyers.json` shares. The low end is 0, because buyers that record origin may already hold it.
- **Map effect:** UAE −3.3, Korea −0.3, Iraq −0.3, Singapore −0.2.

### 3. Undisclosed military aid
- **Germany 1.8: no overlap.** The Kiel tracker (Release 31) allocates EUR 25.0bn of military aid.
  - Kiel's October 2026 brief traces EUR 22.7bn of budget military aid for 2022–25 and EUR 11.6bn appropriated for 2026. Kiel keeps those figures out of the tracker because disbursement is unknown.
  - The map's 1.8 (0.3 in 2025, 1.5 in 2026) lies between the tracker and Kiel's budget reading, which is up to EUR 9bn higher. Keep it.
- **France 2.3: overlap with Kiel.**
  - **2022–23 (1.0):** this part is the gap between Kiel's price-list valuation and France's official EUR 2.6bn. Kiel's research note says it adopted the official 2.6bn from Release 16 (April 2024), so Release 31 already contains it.
  - **2024:** France's ~EUR 3bn for 2024 includes about EUR 0.3bn from frozen Russian assets, and the map leaves Russia's money out elsewhere.
  - **Corrected values:** 0 / 0 / 0.7 / 0.2 / 0.1 for 2022–2026, total 1.0 (0–3.8). Map effect: France −1.3.

### 4. China's sales to Russia: the modules do not overlap, but the baseline misses the structural gap
- **The modules are separate.** Hub re-exports move value that the hubs record in their own exports to Russia, capped by their recorded imports. The transit part of the residual is goods that partners report selling to Kyrgyzstan and Kazakhstan, which those hubs never record as imports.
  - The two overlap only at the Kazakhstan and Kyrgyzstan high ends, where the import cap is dropped.
- **The baseline misses the structural gap.** Before the war, partner exports covered only 90.8–93.5% of Russia's imports. Freight explains 3.5–7.5 points of that.
  - The rest is a structural gap of about EUR 6bn a year. It sits in the pro-rata residual that is added to 2022–2026 sales, but never to the 2019–2021 baseline.
  - China receives about half of it, because non-coalition countries carry weight 1.
- **Correction.** Remove 5.6/6.9/6.5/5.7/3.8 (±3.5 a year) for 2022–2026 from the residual, pro rata. This takes EUR 28.5bn off sales to Russia, of which China 17.2, Kazakhstan 2.1 and Turkey 1.5.
- **Map effect:** China +14.9, Kazakhstan +1.8, Turkey +1.3.
- **Also found:** Belarus's EUR 9bn share of the residual vanishes when `narrow.json` replaces Belarus's sales with official totals.

### 5. Headline results
| Country | Map | Driver | Verdict | After all corrections |
|---|---|---|---|---|
| Kazakhstan | +6.6% | Less paid 13.9: imports from Russia rose (14.1 → 16.1), but the counterfactual grows 9.4% a year. That trend is fitted on 2016–2021 only, the rebound after the 2014–16 tenge crash; the full window gives +0.8%. | Artefact | −0.8% |
| Cyprus | +30% | Services given up 9.2. Cyprus's own BoP shows 2.3 a year before the war and 0.5 since 2023, after EU service bans. | Real fall, counted at gross revenue. Much of it was income from Russian capital booked in Cyprus. At a 20% margin the total would be about 9%. | +30% (method issue) |
| Montenegro | +14.5% | Services given up 0.79, although sales to Russia rose (0.16 → 0.35 in 2023). A COVID rebound of 1.8–2.8× puts the counterfactual at 0.46 a year, above the 2019 peak of about 0.30. | Artefact | +7.9% (cap at 2019) |
| Mauritania | +8% | 0.12–0.13 a year of Russian-origin fuel in 2019–20, while Russia recorded USD 1–2m. These were traders' cargoes; since 2022 the fuel comes via the UAE, Togo and India unlabelled. Fish sales did stop. | Mostly artefact | +7.7% |
| Lebanon | +8% | The 2019 baseline year precedes the financial collapse, which cut imports about 40%. With a 2020–21 baseline, "less paid" halves. | Mostly artefact | about +4% (estimate) |
| Lithuania | +45% | Less paid 14.9: crude for Mažeikiai, about 70% of whose output is exported. Sales given up 12.7: 85–90% were re-exports. | Partly artefact | +31% (+24% with refinery exports removed) |
| Estonia | +32% | Less paid 5.8: oil entrepôt through Muuga. Sales given up 1.9: 35–41% re-exports. | Partly artefact | +26% |

**General trend problem.** 68 trade series use a "reliable" trend fitted on 2016–2021 only.
- Where the 2012–13 level lies well above the post-2016 line, the fit measures a rebound from the 2014–16 crash, not a trend.
- Using the full-window rate instead moves China −35.7, Kazakhstan −21.7, Belarus −5.6, Uzbekistan −2.4 and Kyrgyzstan −1.4.

### 6. Pre-war transit and re-exports, Baltics and Finland
**Method.** Imports from Russia were split by heading (Comtrade, 2019–2021):
- Gas is left out, because the map already swaps it for final-use gas.
- Estonia's HS 27 entrepôt share is customs tonnes against Eurostat energy-balance imports from Russia (0.58/0.28/0.24). Energy statistics exclude transit. This is checked against Estonia's own HS 27 re-export ratio (0.51–0.55).
- Latvian steel comes from its export/import ratio (0.77–0.82). Latvia has had no steel mill since 2016.
- Refinery export shares come from Eurostat product exports against crude and product imports.

Shares of imports from Russia (low/central/high):

| | 2019 | 2020 | 2021 | 2019–21 | Processed and exported (extra) |
|---|---|---|---|---|---|
| Estonia | 0.26/0.30/0.41 | 0.15/0.24/0.39 | 0.14/0.23/0.38 | 0.18/0.26/0.40 | 0/0.035/0.07 |
| Latvia | 0.17/0.25/0.33 | 0.19/0.28/0.37 | 0.19/0.27/0.35 | 0.18/0.27/0.35 | 0 |
| Lithuania | 0.03/0.06/0.09 | 0.04/0.09/0.14 | 0.04/0.08/0.13 | 0.04/0.075/0.12 | 0.33/0.39/0.45 (refinery crude) |
| Finland | 0.003/0.013/0.033 | 0.004/0.014/0.037 | 0.004/0.015/0.039 | 0.004/0.014/0.036 | 0.27/0.32/0.38 (crude, nickel matte) |

**Recommendation.** Remove the unprocessed share from the baseline and from the yearly values, and give it to the final buyers.
- The processed share should follow the Turkey/India refiner rule only if pre-war laundered oil also gets a baseline.
- **Sales side.** This was not asked, but it is larger. Pre-war exports to Russia were largely re-exports, and the hub module does not cover EU members.
  - Shares: Lithuania 0.85 (0.80–0.90), Estonia 0.39 (0.35–0.45, its own re-export records), Latvia 0.45 (0.30–0.60, assumed), Finland 0.10 (0.05–0.20, assumed).
- **Map effect, imports only:** Estonia −1.5, Lithuania −1.1, Latvia −1.1, Finland −0.4.
- **Map effect with sales moved to EU makers:** Lithuania −11.1, Estonia −2.2, Finland −1.6, Latvia −1.5, Germany +4.4.

### 7. Freight cut on border-priced values
The 5.5% cut assumes freight is paid to non-Russian shippers. That is not so for:
- pipeline gas valued at the border;
- pipeline crude (Druzhba, ESPO);
- electricity;
- overland trade with neighbours, where pipelines and railways up to the border are Russian.

LNG and seaborne crude keep the cut.

Border-priced share of `to_rus`, central (2019–21, then 2022–26):

| Country | 2019–21 | 2022–26 |
|---|---|---|
| Hungary | 0.86 | 0.96–1.0 |
| Slovakia | 0.83 | 0.85–1.0 |
| Czechia | 0.73 | 0.89 falling to 0 |
| Austria | 0.63 | 0.84–0.88 until 2024 |
| Germany | 0.58 | 0.63 in 2022, then 0 |
| Italy | 0.48 | 0.21–0.62 |
| Poland | 0.42 | 0.41 in 2022 |
| China | 0.45 | 0.45 |

- Countries in `narrow.json` already skip the cut.
- **Map effect:** Germany +3.9, China −2.8, Italy +1.3, Poland +1.3.

## Corrections ranked by size (sum of absolute map effects, EUR bn)
1. **Trend windows (Q5): 74.0.** China −35.7, Kazakhstan −21.7, Belarus −5.6.
2. **Baltic and Finnish re-exports and transit (Q6): 28.6.** Lithuania −11.1, Germany +4.4, Estonia −2.2. With refinery exports also removed, Lithuania −16.9 and Finland −11.6.
3. **Structural pre-war import gap (Q4): 23.7.** China +14.9.
4. **Armenian gold passed on and 2026 hidden gold (Q1): 12.6.** UAE +7.3.
5. **Freight cut skipped on border-priced imports (Q7): 12.2.** Germany +3.9, China −2.8.
6. **Russian fuel to the UAE (Q2): 6.6.** UAE −3.3.
7. **France's undisclosed aid (Q3): 1.3.**
8. **Montenegro services (Q5): 0.5.**

All corrections together: Kazakhstan +6.6% → −0.8%, Lithuania 45% → 31%, Estonia 32% → 26%, Latvia 21% → 17%, Montenegro 14.5% → 7.9%, UAE −2.0% → −1.1%, China −1.6% → −1.7%.

## Other problems found
- **`narrow.json` overwrites `to_rus`/`from_rus` last.** It runs after the freight cut, re-exports and residual.
  - The UAE, Kazakhstan, Armenia, Uzbekistan and others hold frozen copies of an earlier builder output, so upstream changes no longer reach them.
  - Belarus's official values are never cut for freight.
- **Belarus's residual (EUR 9bn) is assigned to no one** after the `narrow.json` override.
- **Negative baseline low:** `trade_full`'s linear `trend_2022` goes below zero for Mauritania (−0.007). Floor it at 0.
- **Laundered oil has no pre-war baseline.** All fuel made from Russian crude counts as new since 2022, although refiners in Lithuania, Finland, Belarus, India and Turkey exported it before the war.
- **Lost trade counts at gross value in the shift** but at 20% in the cost. This dominates Cyprus and Lithuania. The headline should at least be labelled as turnover.

## Sources (retrieved 2026-10-18 unless dated)
- **UN Comtrade public API:**
  - UAE, Hong Kong, Armenia gold (HS 7108): https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=643,51&flowCode=M&cmdCode=TOTAL,71,7108,27
  - Mauritania.
  - Baltic and Finnish imports from Russia by chapter.
  - Estonian re-exports.
- **Swissaid, UAE conflict gold (2025-11-04):** https://www.swissaid.ch/en/media/united-arab-emirates-more-than-ever-a-hub-for-conflict-gold/
- **Bloomberg via mining.com (2023-11-15):** https://www.mining.com/web/hong-kong-ousts-dubai-as-biggest-hub-for-russian-gold-trade/
- **Gulf Business, UAE–Russia non-oil trade (2026):** https://gulfbusiness.com/en/2025/trade/uae-russia-ink-trade-services-and-investment-pact/
- **CREA Russia Fossil Tracker API (2026-10-17):** https://api.russiafossiltracker.com/v0/counter
- **Kiel Institute, Germany's EUR 100bn (2026-10-08):** https://www.kielinstitut.de/media/news/ukraine-support-tracker-only-eur-417-billion-of-germanys-eur-100-billion-went-to-ukraine/
- **Kiel Institute, Ukraine Support Tracker research note, France benchmark (2024-06-05):** https://www.kielinstitut.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Ukraine_Support_Tracker_-_Research_Note.pdf
- **Public Sénat, France's 2024 aid (2024-10-15):** https://www.publicsenat.fr/actualites/international/ukraine-avec-le-degel-des-avoirs-russes-la-france-aura-accorde-pres-de-3-milliards-deuros-daides-en-2024-annonce-sebastien-lecornu
- **Eurostat oil imports and exports by partner:** https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_oil (and `nrg_te_oil`)
- **Baltic Times, Lithuanian-origin exports to Russia (2018):** https://www.baltictimes.com/lithuania_s_exports_to_russia_up_30_pct_in_2017__goods_of_lithuanian_origin_by_12_pct_y/y/
- **Nordea, Lithuania re-exports (2014):** https://corporate.nordea.com/api/research/attachment/7286
- **Statistics Lithuania, Business in Lithuania 2022:** https://osp.stat.gov.lt/verslas-lietuvoje-2022/prekyba
- **MONSTAT, tourist arrivals 2024:** https://monstat.org/uploads/files/TURIZAM/ukupno/2024/Arrivals%20and%20overnights%20of%20tourists%20total%202024.pdf
