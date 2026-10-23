# Russia's net gain per euro of exports (research 2026-10)

Gathered on 2026-10-18. The output is [`net_gain_russia.json`](net_gain_russia.json). **No one has reviewed this yet.**

## What it is
- Aid is a gift. Each euro is worth one euro to the receiver.
- A purchase from Russia is an exchange. Russia gets the money but gives up goods that cost real resources to make.
- This file gives the part of each export euro that Russia actually gains. That part is the economic rent.
- **Net gain share** = (taxes the Russian state collects on the good + operating profit above a normal return) ÷ FOB price.
- The same thing, put another way: (FOB price − real costs − normal return) ÷ FOB price.
- Real costs are wages, materials, transport inside Russia and depreciation. They are not counted as gain.
- The normal return is **11.4% a year after tax, in nominal US dollars on book capital** since round 14b (10.4–12.4%): the sellers' rule, 5% real (4–6%) plus Russia's country risk premium (3.90%, Damodaran, January 2026), plus 2.5% expected USD inflation, because the capital measures are book values. It is also not counted as gain. Until round 14 it was 9% (8–10%), about 2.4 points too little ([round 14b](#round-14b-the-sellers-normal-return-and-measured-capital)).
- Every share lies between 0 and 1. When profits fall below a normal return, the share is set at or near 0.
- LNG profit that goes to foreign partners (Total, CNPC, Silk Road Fund, Japanese stakes) is left out.
- The shares are taken at **actual prices**. The project counts the wartime price premium separately at 100%. Do not apply these shares to that premium a second time.

## Central values (share of FOB value)

Since round 14b, with the round-14 value in brackets (the round-11 sector groups as the map used them):

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|
| crude oil | 0.62 (0.69) | 0.62 (0.68) | 0.57 (0.64) | 0.58 (0.65) | 0.45 (0.53) | 0.55 (0.61) |
| oil products | 0.52 (0.61) | 0.58 (0.65) | 0.54 (0.62) | 0.51 (0.59) | 0.38 (0.47) | 0.52 (0.59) |
| pipeline gas | 0.55 (0.60) | 0.82 (0.84) | 0.66 (0.69) | 0.56 (0.60) | 0.50 (0.54) | 0.53 (0.57) |
| LNG | 0.31 (0.35) | 0.52 (0.54) | 0.44 (0.47) | 0.31 (0.36) | 0.33 (0.37) | 0.31 (0.35) |
| coal | 0.27 (0.30) | 0.41 (0.44) | 0.17 (0.20) | 0.03 (0.06) | 0.02 (0.02) | 0.02 (0.04) |
| fertilisers | 0.26 (0.28) | 0.32 (0.34) | 0.25 (0.27) | 0.19 (0.21) | 0.22 (0.24) | 0.27 (0.29) |
| iron & steel | 0.28 (0.31) | 0.11 (0.13) | 0.12 (0.14) | 0.10 (0.12) | 0.04 (0.06) | 0.04 (0.06) |
| aluminium | 0.12 (0.17) | 0.03 (0.04) | 0.02 (0.02) | 0.05 (0.05) | 0.02 (0.02) | 0.02 (0.07) |
| nickel/copper/PGM (+diamonds) | 0.40 (0.43) | 0.34 (0.37) | 0.26 (0.29) | 0.21 (0.24) | 0.23 (0.26) | 0.28 (0.31) |
| wood | 0.10 (0.14) | 0.04 (0.05) | 0.03 (0.04) | 0.06 (0.06) | 0.02 (0.02) | 0.02 (0.02) |
| grain & food | 0.11 (0.14) | 0.11 (0.13) | 0.10 (0.13) | 0.10 (0.11) | 0.09 (0.10) | 0.10 (0.10) |
| chemicals & plastics | 0.11 (0.16) | 0.10 (0.16) | 0.06 (0.08) | 0.06 (0.07) | 0.06 (0.07) | 0.06 (0.07) |
| other manufactured | 0.03 (0.03) | 0.03 (0.04) | 0.03 (0.04) | 0.03 (0.04) | 0.04 (0.04) | 0.04 (0.04) |
| **non-fuel average** | 0.17 (0.20) | 0.14 (0.17) | 0.12 (0.13) | 0.10 (0.12) | 0.10 (0.11) | 0.11 (0.13) |
| services | 0.03 (0.03) | 0.03 (0.04) | 0.03 (0.04) | 0.03 (0.03) | 0.04 (0.04) | 0.04 (0.04) |
| arms | 0.04 (0.04) | 0.04 (0.04) | 0.04 (0.04) | 0.05 (0.05) | 0.05 (0.05) | 0.05 (0.05) |
| gold | 0.37 (0.39) | 0.31 (0.33) | 0.38 (0.40) | 0.47 (0.49) | 0.56 (0.58) | 0.64 (0.66) |

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
  | normal return (since round 14b: 11.4% × about 91 USD of capital per barrel a year, from Rosneft's balance sheet; until round 14: 9% × 65 = 6) | 10.4 |
  | **total** | **27.4** |

  Rosneft reports a lifting cost of about 3 USD/boe.
- **Rent** = 64.2 − 27.4 = 36.8 USD/bbl. **Share = 36.8 ÷ 64.2 = 0.57** (0.64 until round 14).
- **Check on the state's part:**
  - MET on oil was RUB 7.79 trn (2023). Divided by 85.2 RUB/USD and 3.85 bn bbl produced, that is **23.7 USD/bbl**.
  - NDD adds about 4.3 USD/bbl (estimated, about RUB 1.4 trn).
  - The crude export duty, at 1/6 of its old level, adds about 1.9 USD/bbl.
  - The state's take is about **29.9 USD/bbl = 0.47**.
  - The other **6.9 USD/bbl (0.11)** is company profit above a normal return (11.3, 0.18 until round 14). That fits Rosneft's 2023 EBIT, which was about 13–14 USD/boe before a normal return of about 6.
- **Range: 0.40–0.70** (0.53–0.71 until round 14). The low case uses Urals only, costs of 28 and 12.4% on 115 USD of capital (Damodaran's emerging-market E&P ratio); the high case costs of 19 and 10.4% on 65 USD.

## Worked example 2: fertilisers, 2023
- PhosAgro's EBITDA margin was about **31%**. Acron's was in the low 30s.
- Add back taxes booked inside EBITDA, about **+5 pp**:
  - the new fertiliser export duty (7–10% on the export share, about 4 pp);
  - the MET uplift (about 1 pp).
- Subtract depreciation, about **−7 pp**.
- Subtract the normal return: 9% × capital of about 1.0× revenue = **−9 pp** (round 14b: 11.4% × 0.98, PhosAgro's 2023 operating capital, = −11.2 pp).
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
- Company margins for 2021–2023 (PhosAgro, Nornickel, Rusal, Severstal, MMK, NLMK, Acron) were from memory of annual releases, ±2 pp. **Round 13 (audit):** PhosAgro's were fetched from its 2023 annual report: revenue RUB 440.3bn and EBITDA RUB 183.0bn in 2023 (41.6%; adjusted 38.2%), adjusted 46.9% in 2022, depreciation 6.7% of revenue. The 2023 "about 31%" above was wrong: with the adjusted margin the 2023 fertiliser share is 38.2 + 5 − 6.7 − 9 = **0.27 (0.20–0.34)**, not 0.20, now in the JSON; 2022 (0.34) is confirmed. Nornickel's 52% (2022) and 48% (2023) EBITDA margins were found by search, quoting its 2023 annual report, but the page was not opened. Rusal, Severstal, MMK and NLMK margins no longer matter: steel and aluminium use official sector data since round 11. Acron's (part of fertilisers in 2021) remain unverified, so the 2021 fertiliser share is a rough indication (D).
- The non-fuel mix for 2022, 2023 and 2026, and every split within a group. Examples are fertilisers inside chemicals, and gold, PGMs/diamonds, steel, aluminium, copper and nickel inside metals. Diamonds are included in nonferrous.
- The foreign-ownership cut applies only to LNG. Foreign stakes in crude (ONGC/Indian partners at Vankor, BP's frozen Rosneft stake) are small and are ignored.
- Services, arms and other manufactured goods are judgement, with wide bands.

## Certainty
- **B** for crude, products and pipeline gas. The tax side rests on Finance Ministry MET totals and company results.
- **C** for everything else; fertilisers 2021 **D** (Acron's margin not verified).
- On the map, every part that multiplies the modelled no-war level by these shares is at best **C** (round 13, `docs/method/ranges.md`).
- The audit notes that the oil "state take" check (0.47 in 2023) uses gross MET and leaves out the damper netted from budget revenue (oil and gas revenue RUB 8.82trn in 2023). The net take is nearer 0.39. The rent share itself is cost-based and does not change.

## Round 14b: the sellers' normal return and measured capital

Raised by the owner after the round-14 consistency check. The sellers' rule (5% real after tax, 4–6%, plus the
country risk premium, [`net_gain_sellers-notes.md`](net_gain_sellers-notes.md) section 6) now applies to Russia too.

- **Rate.** Russia's premium is 3.90% (Damodaran, *Country Default Spreads and Risk Premiums*, January 2026; fetched,
  `country_risk_r14.json`, raw copy listed in `raw/MANIFEST.json`). Every capital measure below is a **book value**, so
  the real rate gets 2.5% expected USD inflation (the US 10-year breakeven, 2.3–2.5%): **11.4%** (10.4% in the high
  case, 12.4% in the low case), after tax. Replacement-cost capital would pair with the real 8.9%; book capital in
  roubles at historical cost is lower than replacement cost, so the nominal rate is the matching one.
- **How each group was recomputed.** The round-11 sector groups (services, arms, manufactured, wood, food, chemicals,
  steel, aluminium) were rerun with their own inputs (FNS/Rosstat profitability and return on assets by activity, CBR
  service weights, duties, company margins) at r = 11.4% / (1 − profit tax) on the pre-tax margin, the capital being
  margin / return on assets (Rosstat). The hand-built groups: new = old + (9% × the builder's capital − r × measured
  capital) / price where the builder recorded its capital (crude 65 USD/bbl, products 1.08 t of crude at that capital,
  pipeline gas 5 EUR/MWh ÷ 9%, fertilisers 1.0× revenue); otherwise new = old − (r − 9%) × measured capital. LNG: only
  the Russian part of the surplus (profit tax + 60% after tax) falls. Coal keeps the builder's floor (0.02 central, MET
  and duties).
- **Capital per unit of revenue (book), low-share case / central / high-share case:**

  | group | capital | source |
  |---|---|---|
  | crude oil | 115 / 91 / 65 USD per barrel a year (1.74 / 1.38 / builder's ×66 USD) | Rosneft summary IFRS 2024: PP&E RUB 12,639bn and 13,936bn over total revenues 9,163bn and 10,139bn (2023, 2024) = 1.38; Rosstat oil and gas extraction (margin / return on assets) 1.43–1.94 in 2021–2024; Damodaran emerging-market oil and gas production 1.74 |
  | oil products | 1,072 / 850 / 515 USD per tonne | the same ratios on the 2023–2024 product price; high case the builder's crude chain |
  | pipeline gas | 56 EUR per MWh a year in all cases | **builder's capital kept**: Gazprom's IFRS statements (gazprom.com) could not be fetched (connection refused, HTTP 503) |
  | LNG | 102 / 79 / 79 EUR per MWh a year | Novatek FY2023 release: non-current assets RUB 2,656.9bn over total revenues 1,371.5bn = 1.94 (includes its LNG joint-venture stakes), on the 2023 LNG price; low case Yamal LNG's USD 27bn capex over 16.5 Mt a year |
  | coal | 1.58 / 1.32 / 0.95 × revenue | Rosstat coal mining (margin / return on assets) 1.14, 1.24, 1.58 in 2021–2023 (2024–2025 not published: losses); Damodaran emerging-market coal 0.95 |
  | fertilisers | 1.04 / 0.98 / 0.70 | PhosAgro 2023 statement of financial position: non-current assets 358.4 + receivables 66.4 + inventories 48.5 − payables 42.7 = RUB 430.6bn over revenue 440.3bn = 0.98; PP&E alone 0.70; Damodaran basic chemicals 1.04 |
  | nickel/copper/PGM | 1.28 / 1.10 / 0.71 | Nornickel 2023 annual report, IFRS 2021–2023: PP&E + inventories + receivables − payables over revenue 0.78, 1.23, 1.28; Damodaran metals and mining 0.71 |
  | gold | 0.72 in all cases | **closest measured ratio**: Damodaran emerging-market precious metals (Polyus's balance sheet was not in its results release) |
  | steel (company method) | 0.85 | **industry ratio**: Damodaran emerging-market steel, replacing 1.0 (judgement); Severstal's and NLMK's statements were not reached |
  | aluminium | 1.1 | Rusal 2024 balance sheet (round 11, unchanged) |
  | services, arms, manufactured, wood, food, chemicals, steel (sector method) | margin / return on assets per activity, 0.3–3 | FNS/Rosstat by OKVED-2 activity, 2021–2025 (round 11, unchanged) |

- **Effect on the map** (this step, together with Ukraine's file): Estonia −1.27, Lithuania −1.12 (both from Russia's lower gain shares on what they stopped buying; Ukraine's file barely touches them: round 15 correction), Libya +0.86, Yemen
  +0.75, Finland −0.67, Tunisia +0.66 (net, % of a year's GDP). The method band's "normal return" alternative loads
  `net_gain_russia_r14.json`, the round-14 file kept unchanged.
- **Scripts:** This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
