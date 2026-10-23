# Ukraine's net gain on its exports (`net_gain_ukraine.json`)

Generated 2026-10-18.. This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What this is

Aid is a gift. Trade is an exchange. When a country buys an extra euro of goods from Ukraine, Ukraine gets
the euro but uses up wages, fuel, materials, transport and machines to make the goods. This file says how
much of that euro is a **net gain** for Ukraine. The map can then put extra purchases on the same scale as aid.

**Net gain share** = (taxes the state collects on making and exporting the good + operating profit above a
normal return on capital) ÷ the FOB export price.

- **Counted:** profit tax (18%), subsoil rent (e.g. iron ore royalty), export duties (sunflower seed,
  and soy/rapeseed from September 2025), land tax, the farm single tax and other non-labour production taxes,
  and profit above a normal return.
- **Not counted:** wages and the taxes on wages, materials, fuel, energy, logistics, depreciation, land lease
  paid to landowners, VAT (exports are zero-rated), and a normal return on capital.
- **Normal return:** since round 14b, **23.0% a year after tax, in nominal US dollars on book capital** (22.0% in the
  high case, 24.0% in the low case): the sellers' rule, 5% real (4–6%) plus Ukraine's country risk premium (15.54%,
  Damodaran, January 2026), plus 2.5% expected USD inflation, because the capital measures are book values. The stage
  formula subtracts it from the pre-tax margin as r / (1 − profit tax). Until round 14: 10% before tax, 8.2% after
  tax, about 15 points too little ([round 14b](#round-14b-the-sellers-normal-return-and-measured-capital)).
- **Whole Ukrainian chain.** Materials made in Ukraine carry Ukrainian taxes and profit. So grain counts the
  farm and the trader. Sunflower oil counts the farm, the crusher and the duty. Steel counts the mill and the
  Ukrainian iron ore it uses.
- **Spread of firms.** When the average firm breaks even, some firms still make money and pay profit tax.
  The model therefore averages over a spread of firm margins (see `inputs.model`).
- 2026 means January–August.

## Central values (share of FOB)

Since round 14b, with the round-14 value in brackets (the round-11 groups as the map used them):

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| grain | 0.089 (0.190) | 0.016 (0.031) | 0.015 (0.025) | 0.025 (0.055) | 0.047 (0.118) | 0.032 (0.078) |
| oilseeds & oil | 0.132 (0.240) | 0.035 (0.061) | 0.026 (0.051) | 0.052 (0.119) | 0.117 (0.216) | 0.083 (0.169) |
| other food | 0.034 (0.075) | 0.025 (0.042) | 0.029 (0.048) | 0.033 (0.065) | 0.033 (0.065) | 0.033 (0.065) |
| iron ore | 0.298 (0.432) | 0.135 (0.242) | 0.074 (0.093) | 0.069 (0.080) | 0.064 (0.068) | 0.063 (0.066) |
| iron & steel | 0.098 (0.184) | 0.043 (0.069) | 0.028 (0.032) | 0.028 (0.032) | 0.029 (0.034) | 0.028 (0.031) |
| other metals | 0.022 (0.034) | 0.016 (0.020) | 0.021 (0.033) | 0.023 (0.037) | 0.023 (0.037) | 0.023 (0.037) |
| wood & furniture | 0.031 (0.058) | 0.020 (0.026) | 0.026 (0.044) | 0.028 (0.050) | 0.028 (0.050) | 0.028 (0.050) |
| machinery & electrical | 0.018 (0.030) | 0.016 (0.023) | 0.021 (0.039) | 0.023 (0.044) | 0.023 (0.044) | 0.023 (0.044) |
| chemicals | 0.032 (0.071) | 0.016 (0.019) | 0.019 (0.027) | 0.020 (0.030) | 0.020 (0.030) | 0.020 (0.030) |
| other goods | 0.025 (0.050) | 0.017 (0.022) | 0.024 (0.045) | 0.026 (0.052) | 0.026 (0.052) | 0.026 (0.052) |
| **average (export mix)** | 0.098 (0.175) | 0.033 (0.055) | 0.025 (0.042) | 0.036 (0.069) | 0.055 (0.102) | 0.043 (0.084) |

Low–high ranges for the average are in the JSON (`average`). The low and high cases move all inputs together, so they are wide.

**Main message.** Since round 14b, before the war about a tenth of each export euro was a net gain (a fifth until
round 14). In 2022–2023 it fell to about 3%: farm and steel profits disappeared, and logistics costs took most of the
price. It recovered to about 5% in 2025, when farm prices rose. With Ukraine's country risk premium in the normal
return, what is left is mostly taxes: investors in Ukraine need a high return, so profit above it is rare. About 95%
of the price paid for extra purchases covers real costs, including that return. It is not a gift.

## Export mix (share of goods exports)

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| grain | 18.0% | 20.6% | 23.0% | 22.6% | 18.0% | 21.0% |
| oilseeds & oil | 15.6% | 23.7% | 26.1% | 24.4% | 24.1% | 23.5% |
| other food | 6.9% | 8.7% | 11.8% | 12.2% | 13.6% | 13.2% |
| iron ore | 10.3% | 6.6% | 4.9% | 6.7% | 5.6% | 4.5% |
| iron & steel | 21.8% | 12.6% | 9.8% | 9.7% | 10.6% | 8.8% |
| other metals | 1.4% | 1.3% | 1.4% | 1.3% | 1.4% | 1.3% |
| wood & furniture | 4.5% | 6.1% | 6.3% | 5.7% | 6.7% | 7.1% |
| machinery & electrical | 9.3% | 9.6% | 8.5% | 8.8% | 9.6% | 9.0% |
| chemicals | 5.8% | 4.0% | 3.4% | 3.2% | 3.2% | 3.2% |
| other | 6.3% | 6.8% | 5.1% | 5.5% | 7.1% | 8.5% |

2021–2024 come from UN Comtrade (Ukraine's own report). 2025 comes from State Customs figures quoted by the
Export Promotion Office. Some lines in 2025 are estimated. 2026 is built from customs totals and first-half shares,
so it is an estimate. Oilcake/meal (HS 2306) is in oilseeds. Iron ore is HS 2601.

`buyer_mix` gives the 2023–24 mix for the 12 largest buyers. Using it with the central values gives each buyer's
average net gain (`buyer_central_average`). For 2025 it ranges from 0.066 (Hungary, Moldova, Slovakia) to 0.146
(Netherlands). Buyers of grain and oil gain most from the 2025 farm recovery.

## Worked example 1: grain, 2023

Inputs. The farm price is 58% of FOB, which leaves a wide war spread (USDA: wheat farm $140, FOB $230).
The average farm margin is 0%: wheat was −1.8% (UkrAgroConsult) and Ukrstat agriculture was 12%. Farm capital is
0.9 × farm sales. Farm margins spread with a standard deviation (sd) of 10 points. The effective profit tax is
10% (many farms pay the land-based single tax). Other farm taxes are 1% of sales.

- Farm, other taxes: 0.58 × 1% = **0.0058**
- Farm, profit tax: the average of max(margin, 0) is 0.10 × 0.399 = 0.040. × 10% × 0.58 = **0.0023**
- Farm, profit above normal: the margin minus the normal return is 0 − 10% × 0.9 = −0.09. Its average
  positive part is −0.09 × 0.184 + 0.10 × 0.266 = 0.0100. × (1 − 0.10) × 0.58 = **0.0052**
- Trader/exporter: EBIT is 2.5% of FOB (sd 2 points). Capital is 0.30 × FOB. Profit tax: 0.18 × 0.026 =
  0.0047. Profit above normal: 0.82 × 0.0057 = 0.0047. Plus 0.002 other taxes. Total **0.0114**
- **Total: 0.025.** About 2.5 cents of each euro. The rest paid for seed, fertiliser, diesel, wages, land rent,
  trucks, rail, Danube barges and ports.

## Worked example 2: iron and steel, 2023

- Mill: the average EBIT is −2% of sales (Metinvest steel EBITDA margin 3%, minus depreciation; ArcelorMittal
  Kryvyi Rih made losses). sd is 6 points. Capital is 0.8 × sales.
  - Other production taxes (land, property, environment): **0.010**
  - Profit tax: 0.18 × 0.0153 = **0.0027**
  - Profit above normal: −0.02 − 0.08 = −0.10. Its average positive part is 0.0012. × 0.82 = **0.0010**
- Upstream Ukrainian iron ore: ore is about 20% of the steel price. Iron ore's own net gain in 2023 is 0.0925:
  rent 4.5% + other taxes 1% + profit tax 1.9% + excess 1.9%. So 0.20 × 0.0925 = **0.0185**
- **Total: 0.032.** In 2021 the same chain gives 0.18, with mill EBIT at 15% and iron ore at 0.43.

## Sources (main)

- **Ukrstat Statistical Yearbook 2024**, table 22.12. Operating profitability of agriculture: 40.3% in 2021,
  20.0% in 2022, 12.0% in 2023, 22.7% in 2024. Industry: 11.2%, 0.8%, 4.7%, 7.4%.
- **USDA AMS, Ukraine Grain Transportation (July 2026).** Farm and FOB prices for 2021–2025, and transport costs.
- **UkrAgroConsult (via Interfax), Latifundist, MAS Seeds.** Profitability by crop.
- **Kernel annual report FY2025.** Crushing EBITDA of $56 and $105 per tonne of oil. Grain export EBITDA of
  $37–40 per tonne. The new 10% duty on soy and rapeseed.
- **Ferrexpo results for 2023–2025.** EBITDA of $130m, $69m and $28m. Royalties are 7% of cash cost. Rail tariffs
  rose 70% in July 2022 and 36% in July 2026.
- **Metinvest results for 2023 and 2025.** Steel EBITDA margin of 3% in 2023. Group margin of 13% in 2024 and 11% in 2025.
- **UN Comtrade, State Customs (via export.gov.ua), Interfax-Ukraine.** The export mix.

## Where sources disagree

- **USDA farm prices.** In 2021 and 2025 the farm price is almost equal to FOB ($273 vs $275 for wheat). That
  cannot be right with $35–45 of costs between farm and port. It is probably VAT-inclusive or timed differently.
  The model uses farm/FOB ratios excluding VAT: 0.85 (2021), 0.55, 0.58, 0.75, 0.82, 0.80.
- **Ukrstat regional vs national tables.** Regional offices show 2024 agriculture at 15–27%. The national
  figure is 22.7%. The 2023 figure was 12.7% at first and 12.0% after revision. Only national figures are used.
- **Sunflower profitability in 2025.** UkrAgroConsult says about 48–50%. MAS Seeds says 106%. The central case
  uses a 33% margin on sales (about 50% profitability). The high case is closer to MAS.
- **Ferrexpo 2022 EBITDA.** It is only implied: a "5.9x fall" to $130m gives about $765m. It was not checked
  against the 2022 report.
- **Export totals.** Comtrade gives $65.9bn for 2021. Ukraine's official figure is $68.1bn. Shares are used, not levels.

## What is estimated

- **Capital intensity.** Until round 14 farms 0.9 × sales, traders 0.3, crushers 0.35, mines 1.2, mills 0.8, all judgement; measured since round 14b (below).
- **Farm/FOB ratios after 2021** are taken from USDA. 2026 is a guess.
- **Effective farm profit tax of 10%.** This reflects the mix of profit-tax payers and single-tax farms.
- **Six groups are judgement values:** other food, other metals, wood, machinery, chemicals, other. They are
  anchored on Ukrstat industry profitability and the low-margin, tolling-style work of wiring-harness plants.
- **No Ukrstat profitability yet for 2025 and 2026.** Those years rest on company and analyst data.
- **The 2026 mix** is built from Jan–Aug totals and first-half shares.
- **Labour taxes are left out on purpose** because they are part of wages. Counting them would add roughly
  3–6 points in most groups.
- Certainty: **C** overall. The 2021–24 mix and the Ukrstat anchors are B. The six judgement groups are C/D.

## Round 14b: the sellers' normal return and measured capital

Raised by the owner after the round-14 consistency check. The sellers' rule (5% real after tax, 4–6%, plus the
country risk premium, [`net_gain_sellers-notes.md`](net_gain_sellers-notes.md) section 6) now applies to Ukraine too.

- **Rate.** Ukraine's premium is 15.54% (Damodaran, January 2026; fetched, `country_risk_r14.json`). The capital
  measures are **book values**, so the real rate gets 2.5% expected USD inflation: **23.0% after tax** (22.0–24.0%),
  applied in the stage formula as r / (1 − profit tax) on the pre-tax margin (farms with the 10% effective tax: 25.6%;
  firms paying 18%: 28.1%). The January 2026 premium applies to every year, as the sellers' premiums do; a pre-war
  premium for 2021 is not in the research.
- **How each group was recomputed.** The four modelled groups (grain, oilseeds, iron ore, steel) and the six round-11
  groups were rerun with their own inputs (Ukrstat profitability, USDA prices, company margins) at the new rate and
  the measured capital below. This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
- **Capital per unit of stage revenue (book), low-share case / central / high-share case:**

  | stage or group | capital | source |
  |---|---|---|
  | farm (grain, oilseeds, other food, forestry) | 1.08 / 0.92 / 0.63 | Astarta 2024 (farming and sugar): PP&E 213 + right-of-use 120 + biological assets 67 + inventories 221 + receivables 76 − payables 29 = EUR 669m over revenue 612m = 1.08; Damodaran emerging-market farming 0.77 (central = the mean); Ukrstat agriculture fixed assets / sales 0.63 (2021), 0.87 (2020) |
  | grain trader | 0.47 / 0.38 / 0.30 | Damodaran emerging-market food wholesalers 0.38; Kernel FY2025 (whole group) 0.47; high case the round-10 judgement |
  | oilseed crusher | 0.64 / 0.47 / 0.35 | Kernel FY2025: PP&E 946 + right-of-use 246 + intangibles and goodwill 48 + inventories 363 + biological assets 231 + receivables and prepayments 470 − payables and advances 366 = USD 1,939m over revenue 4,115m = 0.47; Damodaran emerging-market food processing 0.64 |
  | iron ore mine | 1.41 / 1.01 / 0.70 | Ukrstat mining fixed assets / sales 1.01 (2021), 1.41 (2020); Ferrexpo PP&E / revenue 0.70 (2025), 0.78 (2024) |
  | steel mill | 0.87 / 0.85 / 0.62 | **industry ratio**: Damodaran emerging-market steel 0.85 (Metinvest's and ArcelorMittal Kryvyi Rih's balance sheets were not in the fetched documents); Ukrstat manufacturing fixed assets / sales 0.62 (2021), 0.87 (2020) |
  | other food, other metals, wood, machinery, chemicals, other | 0.64, 0.71, 1.05, 0.76, 0.93, 0.83 (× 1.25 / 1 / 0.75 in the cases) | **industry ratios**: Damodaran emerging-market invested capital / sales, weighted like the round-11 margins (food processing; metals and mining; paper and forest products, furniture; electrical equipment, machinery, electronics, auto parts, aerospace; basic chemicals, pharmaceuticals, rubber; apparel, shoes, building materials, paper, furniture). Replace the judgement 0.6–0.8 |
  | IT services | 0.34 (not used) | Damodaran emerging-market computer services 0.34; Ukrstat information and telecommunications fixed assets / sales 0.31 (2021). The file has no services group: purchases from Ukraine are goods |

  Ukrstat figures: *Statistical Yearbook of Ukraine 2022*, tables 14.1 (fixed assets by activity, book value at the end
  of the year), 15.8 (industrial sales) and 23.5 (sales by activity). Fixed assets leave out working capital, so they
  are the low end.
- **Effect.** Ukraine's average falls from 0.069 to 0.036 in 2024 and from 0.175 to 0.098 in 2021. On the map: Moldova
  −0.99 (support for Ukraine 0.41 → 0.22), Lebanon −0.56, Bulgaria −0.30, Slovakia −0.27 (with Russia's file). The
  method band's "normal return" alternative loads `net_gain_ukraine_r14.json`, the round-14 file kept unchanged.

## Round 15: the country risk premium per year

Raised by review 4, approved by the owner. Ukraine's premium is now each year's January value from Damodaran's tables, not January 2026 for every year: 6.43% (January 2022, `ctryprem21.xlsx`), 17.26% (January 2023, `ctryprem22.xlsx`), 17.55% (January 2024, `ctryprem23.xlsx`), 16.01% (January 2025, `ctryprem24.xlsx`) and 15.54% (January 2026). 2021 takes January 2022, the last table before the invasion. Archive index: [dataarchived.html](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/dataarchived.html) (file `ctryprem21` is dated 1/22); the files are in `raw/damodaran/` (listed in the manifest). The groups were rerun with the round-14b scripts and the yearly rate (`normal_return_r15` in the JSON; the research scripts are not in the repository). Ukraine's average gain share: 2021 0.098 → 0.138, 2022 0.033 → 0.043, 2023–2026 within 0.002. Effect on the map below 0.02 points of GDP everywhere (Slovakia +0.01, Bulgaria +0.01).
