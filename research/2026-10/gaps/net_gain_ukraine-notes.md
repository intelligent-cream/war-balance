# Ukraine's net gain on its exports (`net_gain_ukraine.json`)

Generated 2026-10-18. Not yet reviewed by a person. Scripts and downloads are in the scratch folder
`/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/netgain/`
(`mix.py`, `buyer.py`, `model.py`, `build.py`, `write.py`, `dl/`).

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
- **Normal return:** 10% a year before profit tax, in nominal US dollars, on capital employed. The low case uses 12%,
  the high case 8%. **Round 14 label:** the formula applies (1 − 18%) to the profit above it, so the rate actually
  subtracted is **8.2% after tax** (6.6–9.8%), on book capital, about 5.8% real. Damodaran's country risk premium for
  Ukraine (15.5%, January 2026) on top of the sellers' 5% real would mean about 20.5% real: this file's gain shares are
  high on that rule. Not recomputed in round 14 (see `net_gain_sellers-notes.md`, section 6).
- **Whole Ukrainian chain.** Materials made in Ukraine carry Ukrainian taxes and profit. So grain counts the
  farm and the trader. Sunflower oil counts the farm, the crusher and the duty. Steel counts the mill and the
  Ukrainian iron ore it uses.
- **Spread of firms.** When the average firm breaks even, some firms still make money and pay profit tax.
  The model therefore averages over a spread of firm margins (see `inputs.model`).
- 2026 means January–August.

## Central values (share of FOB)

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| grain | 0.19 | 0.03 | 0.025 | 0.055 | 0.12 | 0.08 |
| oilseeds & oil | 0.24 | 0.06 | 0.05 | 0.12 | 0.22 | 0.17 |
| other food | 0.09 | 0.06 | 0.07 | 0.08 | 0.08 | 0.08 |
| iron ore | 0.43 | 0.24 | 0.09 | 0.08 | 0.07 | 0.07 |
| iron & steel | 0.18 | 0.07 | 0.03 | 0.03 | 0.03 | 0.03 |
| other metals | 0.10 | 0.05 | 0.04 | 0.05 | 0.05 | 0.05 |
| wood & furniture | 0.08 | 0.05 | 0.05 | 0.06 | 0.06 | 0.06 |
| machinery & electrical | 0.04 | 0.03 | 0.03 | 0.035 | 0.035 | 0.035 |
| chemicals | 0.10 | 0.04 | 0.03 | 0.04 | 0.04 | 0.04 |
| other goods | 0.08 | 0.05 | 0.05 | 0.05 | 0.05 | 0.05 |
| **average (export mix)** | **0.18** | **0.06** | **0.045** | **0.07** | **0.105** | **0.09** |

Low–high ranges for the average: 2021 0.11–0.25; 2022 0.03–0.12; 2023 0.02–0.09; 2024 0.03–0.13;
2025 0.06–0.17; 2026 0.04–0.15. The low and high cases move all inputs together, so they are wide.

**Main message.** Before the war, about a fifth of each export euro was a net gain. In 2022–2023 it fell to about
5%. Farm and steel profits disappeared, and logistics costs took most of the price. It recovered to about 10% in
2025, when farm prices rose. Even then, 90% of the price paid for extra purchases covers real costs. It is not a gift.

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

- **Capital intensity.** Farms 0.9 × sales, traders 0.3, crushers 0.35, mines 1.2, mills 0.8. These are judgement.
- **Farm/FOB ratios after 2021** are taken from USDA. 2026 is a guess.
- **Effective farm profit tax of 10%.** This reflects the mix of profit-tax payers and single-tax farms.
- **Six groups are judgement values:** other food, other metals, wood, machinery, chemicals, other. They are
  anchored on Ukrstat industry profitability and the low-margin, tolling-style work of wiring-harness plants.
- **No Ukrstat profitability yet for 2025 and 2026.** Those years rest on company and analyst data.
- **The 2026 mix** is built from Jan–Aug totals and first-half shares.
- **Labour taxes are left out on purpose** because they are part of wages. Counting them would add roughly
  3–6 points in most groups.
- Certainty: **C** overall. The 2021–24 mix and the Ukrstat anchors are B. The six judgement groups are C/D.
