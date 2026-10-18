# Russia's net gain per euro of exports (research 2026-10)

Gathered on 2026-10-18. The output is [`net_gain_russia.json`](net_gain_russia.json). **No one has reviewed this yet.**

## What it is
- Aid is a gift. Each euro is worth one euro to the receiver.
- A purchase from Russia is an exchange. Russia gets the money but gives up goods that cost real resources to make.
- This file gives the part of each export euro that Russia actually gains. That part is the economic rent.
- **Net gain share** = (taxes the Russian state collects on the good + operating profit above a normal return) ÷ FOB price.
- The same thing, put another way: (FOB price − real costs − normal return) ÷ FOB price.
- Real costs are wages, materials, transport inside Russia and depreciation. They are not counted as gain.
- The normal return is **9% a year on capital employed** (range 8–10%). It is also not counted as gain.
- Every share lies between 0 and 1. When profits fall below a normal return, the share is set at or near 0.
- LNG profit that goes to foreign partners (Total, CNPC, Silk Road Fund, Japanese stakes) is left out.
- The shares are taken at **actual prices**. The project counts the wartime price premium separately at 100%. Do not apply these shares to that premium a second time.

## Central values (share of FOB value)

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| crude oil | 0.69 | 0.68 | 0.64 | 0.65 | 0.53 | 0.61 |
| oil products | 0.61 | 0.65 | 0.62 | 0.59 | 0.47 | 0.59 |
| pipeline gas | 0.60 | 0.84 | 0.69 | 0.60 | 0.54 | 0.57 |
| LNG | 0.35 | 0.54 | 0.47 | 0.36 | 0.37 | 0.35 |
| coal | 0.30 | 0.44 | 0.20 | 0.06 | 0.02 | 0.04 |
| fertilisers | 0.28 | 0.34 | 0.20 | 0.21 | 0.24 | 0.29 |
| iron & steel | 0.28 | 0.12 | 0.09 | 0.05 | 0.02 | 0.02 |
| aluminium | 0.14 | 0.05 | 0.02 | 0.04 | 0.02 | 0.07 |
| nickel/copper/PGM (+diamonds) | 0.43 | 0.37 | 0.29 | 0.24 | 0.26 | 0.31 |
| wood | 0.12 | 0.06 | 0.03 | 0.03 | 0.03 | 0.03 |
| grain & food | 0.18 | 0.22 | 0.18 | 0.14 | 0.12 | 0.12 |
| chemicals & plastics | 0.17 | 0.15 | 0.10 | 0.10 | 0.08 | 0.09 |
| other manufactured | 0.05 | 0.05 | 0.05 | 0.05 | 0.05 | 0.05 |
| **non-fuel average** | **0.20** | **0.18** | **0.14** | **0.12** | **0.11** | **0.13** |
| services | 0.08 | 0.08 | 0.08 | 0.08 | 0.08 | 0.08 |
| arms | 0.12 | 0.12 | 0.12 | 0.12 | 0.12 | 0.12 |
| gold | 0.39 | 0.33 | 0.40 | 0.49 | 0.58 | 0.66 |

Low and high values are in the JSON. They are roughly ±0.07–0.15 around the central value for fuels and ±0.05–0.08 for non-fuel goods.

## Worked example 1: crude oil, 2023
- **Price.** Urals FOB was 59.4 USD/bbl and ESPO FOB 73.1 (CREA, from `prices.json`). With a mix of 65% Urals and 35% ESPO, the price is **64.2 USD/bbl**.
- **Real costs**, in USD/bbl:

  | item | USD/bbl |
  |---|---|
  | lifting | 4 |
  | pipeline and port inside Russia | 5 |
  | depreciation | 6.5 |
  | overhead | 1.5 |
  | normal return (9% × about 65 USD of capital per barrel a year) | 6 |
  | **total** | **23** |

  Rosneft reports a lifting cost of about 3 USD/boe.
- **Rent** = 64.2 − 23 = 41.2 USD/bbl. **Share = 41.2 ÷ 64.2 = 0.64.**
- **Check on the state's part:**
  - MET on oil was RUB 7.79 trn (2023). Divided by 85.2 RUB/USD and 3.85 bn bbl produced, that is **23.7 USD/bbl**.
  - NDD adds about 4.3 USD/bbl (estimated, about RUB 1.4 trn).
  - The crude export duty, at 1/6 of its old level, adds about 1.9 USD/bbl.
  - The state's take is about **29.9 USD/bbl = 0.47**.
  - The other **11.3 USD/bbl (0.18)** is company profit above a normal return. That fits Rosneft's 2023 EBIT, which was about 13–14 USD/boe before a normal return of about 6.
- **Range: 0.53–0.71.** The low case uses Urals only and costs of 28. The high case uses costs of 19.

## Worked example 2: fertilisers, 2023
- PhosAgro's EBITDA margin was about **31%**. Acron's was in the low 30s.
- Add back taxes booked inside EBITDA, about **+5 pp**:
  - the new fertiliser export duty (7–10% on the export share, about 4 pp);
  - the MET uplift (about 1 pp).
- Subtract depreciation, about **−7 pp**.
- Subtract the normal return: 9% × capital of about 1.0× revenue = **−9 pp**.
- **Share = 31 + 5 − 7 − 9 = 20% → 0.20** (range 0.13–0.27).
- For comparison:
  - 2022: EBITDA margin about 44%, no duty, share 0.34.
  - 2025: margin 34.6% on RUB 198 bn / 574 bn, share 0.24.

## How the other groups were built
- **Oil products.** One tonne of product needs 1.08 t of crude at upstream real cost, plus refining (55 USD/t) and logistics (40 USD/t). This is set against the CREA product basket price. The result is close to crude, because the per-tonne price of products is higher.
- **Pipeline gas.**
  - The price is the project's realised price across all buyers (`gas_prices.json`): 28.6, 83.7, 41.6, 33.5, 31.8 and 35.1 EUR/MWh for 2021–2026.
  - Real cost at the border is 11.5–15 EUR/MWh. The low case adds 5 EUR/MWh for Gazprom's idle export pipes and the capital of Power of Siberia.
  - The tax part is the 30% export duty, MET, and the extra MET charged to Gazprom in 2023–25.
- **LNG.**
  - FOB is the delivered price minus 2.5 EUR/MWh. Real cost is 15–17 EUR/MWh, mostly capital (Yamal LNG cost about USD 27 bn).
  - There is no MET or export duty. Profit tax is 20%, rising to 34% in 2023–25 and 25% in 2026.
  - Only 60% of the profit after tax counts as Russian (Novatek owns 50.1% of Yamal LNG).
- **Coal.** CREA FOB minus mining (about 40), rail and port (45–60), depreciation and the normal return. Rosstat reported a coal industry loss of RUB 112.6 bn in 2024. The Energy Ministry projected a loss of RUB 350 bn in 2025. The share is therefore about 0 from 2024.
- **Metals.** Built from company margins with the same formula:
  - Nornickel: margin 41% in 2025.
  - Rusal: 7.1% in 2025, recovering in H1 2026.
  - Severstal: 19% in 2025, the lowest since 2009.
- **Wood.** Segezha has had negative EBITDA since 2022.
- **Food.** The floating grain export duty takes about 7–20% of the price. Farm and fish profit above normal adds a little.
- **Chemicals.** Sibur-type margins plus cheap feedstock.
- **Gold.** Gold price (2026 about 4,550 USD/oz, from the `prices.json` gold index) against all-in sustaining cost excluding taxes plus a normal return. That cost runs from 1,100 USD/oz in 2021 to 1,550 in 2026. Polyus pulls the industry cost down.
- **Services and arms.** These are judgement, not data:
  - Most services (transport, travel, IT) earn about a normal return. The state rail operator earns little.
  - Arms export prices carry a premium and the Rosoboronexport commission, but manufacturing margins are thin.
- **Non-fuel average.** Each non-fuel group is weighted by its share of Russia's non-fuel goods exports in that year. Gold and arms are excluded. The weights (`non_fuel_mix`) are:
  - FTS group totals for 2021, 2024 and 2025 (IEP, Table 1). In 2025 these were: food 40.9, chemicals 33.6, wood 10.6, metals 74.7 and machinery 29.6 USD bn.
  - Estimated splits within each group.

## Where sources disagree
- **Tax price vs actual price.** The Finance Ministry taxes oil on a Urals price that was above CREA's FOB price. This was most marked in 2023, when discount caps applied. Using CREA FOB therefore makes the state's share slightly higher.
- **Budget data vs prices in 2026.** CREA puts Urals at about 67 USD/bbl for Jan–Aug 2026, partly because of the Iran-war spike. Yet oil and gas budget revenue fell 16.7% to RUB 5.0 trn. The reasons are:
  - a one-month tax lag;
  - a large damper (USD 10.6 bn);
  - a strong rouble;
  - deep discounts at the start of the year (the tax-base Urals price was 39 USD in December 2025).

  The 2026 crude share (0.61) therefore carries more uncertainty.
- **Gazprom made group losses in 2023–24, yet the gas share is high.** The losses come from regulated domestic sales, impairments and the extra MET. That extra MET is rent the state took, so it is not a cost. Export sales still carry a large rent. The low case allows for the idle capital.
- **Company accounts vs the model.** Rosneft's 2025 EBITDA (RUB 2.17 trn, net income only RUB 293 bn) shows almost no profit above a normal return. That fits a 2025 crude share made almost entirely of tax (0.53).
- **PhosAgro FY2025.** The 34.6% margin comes from an aggregator. The official 9M 2025 margin was 33.0%.

## What is estimated (not looked up)
- NDD totals for each year. Only quarterly hints were found (Q1 2023 RUB 211 bn, Q1 2024 RUB 587 bn).
- The cost structure per barrel, per MWh and per tonne. Each item is ±25%.
- Company margins for 2021–2023 (PhosAgro, Nornickel, Rusal, Severstal, MMK, NLMK, Acron) are from memory of annual releases, ±2 pp. They were not fetched again.
- The non-fuel mix for 2022, 2023 and 2026, and every split within a group. Examples are fertilisers inside chemicals, and gold, PGMs/diamonds, steel, aluminium, copper and nickel inside metals. Diamonds are included in nonferrous.
- The foreign-ownership cut applies only to LNG. Foreign stakes in crude (ONGC/Indian partners at Vankor, BP's frozen Rosneft stake) are small and are ignored.
- Services, arms and other manufactured goods are judgement, with wide bands.

## Certainty
- **B** for crude, products and pipeline gas. The tax side rests on Finance Ministry MET totals and company results.
- **C** for everything else.
