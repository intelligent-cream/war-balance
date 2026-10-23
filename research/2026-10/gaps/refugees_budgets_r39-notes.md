# Refugee hosting costs from official budgets: Denmark, Sweden, Italy (round 39)

Data file: `refugees_budgets_r39.json` (same folder). Generated 2026-10-23.

## What it replaces

**The series.** `refugees_net.json` → `countries.{DNK,SWE,ITA}.gross`, which copies `round4b.json` `refugees`. The new values use the same `{year: {low, central, high}}` shape, in EUR bn, with 2026 covering January–August. `apply_refugees_net()` and `apply_refugees_gain()` read them unchanged.

**Why these three are D today.** The gross figures are C: a rate × caseload, from press, a 2022 bill annex and a forecast. The revenue and wage-bill inputs are D: employment rates were guessed. `refugee_cert` takes the weaker letter, so the result is D.

**Denmark's employment rate.** For Denmark the file also gives `employment_rate` for `revenue_model_inputs`, which `refugee_wage_bill()` reads.

## Denmark: 1.95 → 1.15 (EUR bn, 2022 – Aug 2026). Certainty: gross C, employment B

The total is built from two official parts:

**1. ODA-reported in-donor refugee costs (OECD DAC1, measure 1820).**
- Totals: USD 63m in 2021, then 357, 277, 180 and 177m in 2022–25.
- The rise over 2021 is almost all Ukrainians, since other asylum arrivals were low.
- These are the first-year, ODA-eligible costs that the Finance Act took out of the development budget.

**2. Municipal compensation through the block grant,** agreed by the government and KL (the municipalities' association):
- 2022: DKK 1.4bn for net extra costs of Ukrainians and COVID-19 together (Aftale om kommunernes økonomi for 2024). About 1.0bn is taken as the Ukraine part.
- 2023: DKK 0.9bn.
- 2024: DKK 0.9bn (Aftale … for 2025).
- 2025: no frame was found, so 0.75bn is judged.

**How the parts are combined:**
- Low = the larger of the two.
- Central = DAC + 70% of the municipal frame, which allows for some overlap.
- High = the sum × 1.3, for benefits after the first year and for regional health care.

| EUR bn | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) | total |
|---|---|---|---|---|---|---|
| old | 0.29 | 0.46 | 0.46 | 0.44 | 0.30 | 1.95 |
| new | 0.37 (0.28–0.54) | 0.28 (0.20–0.41) | 0.19 (0.12–0.30) | 0.17 (0.10–0.26) | 0.13 (0.06–0.22) | **1.15** |

- **Why lower than before.** The old figure (DKK 100k per person-year) came from the 2022 bill (L 145), drafted for 20,000 arrivals. Danish Ukrainians found work fast, and costs fell after the first year.
- **Employment** ([Statistics Denmark, 24 Feb 2025](https://www.dst.dk/da/Statistik/nyheder-analyser-publ/bagtal/2025/2025-02-24-Ukrainske-statsborgere)):
  - About one third of 18–64-year-olds were in wage employment in Q3 2022, and 58% (12,100 people) in Q3 2024.
  - New annual rates: 0.30, 0.48, 0.57, 0.60, 0.61 (old: 0.40, 0.55, 0.60, 0.62, 0.63).
- **Not found:** a national outturn of all Ukrainian costs. Questions to the Folketing (ft.dk) were blocked from here. The finance-act accounts (fm.dk §14) mix Ukrainian costs into general integration accounts.

## Sweden: 1.57 → 0.91. Certainty: gross B-C

**The Migration Agency's own outturn.** Its annual reports give the total cost of reception and support for people with temporary protection:

| SEK bn | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| total | ~2.0 + 0.5 one-off grant to municipalities | 1.87 | 1.53 | 0.49 |
| of which compensation to municipalities | 1.00 | 1.43 | 1.35 | |

- **From 2025 the costs move to municipal budgets.** Ukrainians who register as residents leave the Agency's system. Municipalities then receive the newly-arrived lump sums: payments "for nyanlända" rose from SEK 3.48bn to 4.49bn. SEK 0.8bn (0.3–1.0) of that is taken as Ukrainian.
- **Central = Agency outturn × 1.25,** for regional health care and other costs outside the Agency's line. The low end is the outturn itself.
- **High end:** the largest of the outturn × 1.7, the rise in Sweden's DAC in-donor refugee costs over 2021, and OECD's 2022 estimate (EUR 0.325bn).

| EUR bn | 2022 | 2023 | 2024 | 2025 | 2026 | total |
|---|---|---|---|---|---|---|
| old | 0.30 | 0.40 | 0.35 | 0.32 | 0.20 | 1.57 |
| new | 0.29 (0.24–0.40) | 0.20 (0.16–0.28) | 0.17 (0.13–0.23) | 0.15 (0.07–0.20) | 0.10 (0.04–0.15) | **0.91** |

- **2022 confirms the old figure.** From 2023 the old figures followed the Agency's July 2023 forecast of appropriation needs (SEK 3.5–4.5bn a year). Actual spending was about half of that.
- **Employment rate: no official figure found.** A non-representative survey (Beredskapslyftet, Jan 2025) gives 51%. The D-grade employment guess of 0.20–0.40 therefore remains.

## Italy: 1.43 → 1.58. Certainty: gross C (appropriations, not outturns)

The national appropriations in the Ukraine decree-laws, as summarised by the Chamber of Deputies research service (dossier D23016a on DL 16/2023):

- **2022: EUR 711m.**
  - Fondo emergenze: +348m (DL 21/2022), plus 10m first relief.
  - Government reception centres (CAS): 54.2 + 7.5 + 112.7m.
  - Contribution to the regions for health care: 152 + 27m.
- **2023: EUR 519m.**
  - Civil Protection: 49.6m diffuse reception and 40m maintenance contribution.
  - CAS: +137.9m.
  - SAI: +52.3m.
  - Health: 238.9m, of which 191.1m inside the national health fund.
- **2024–2026: no consolidated figure was found,** so the old values stay. For 2025 the Civil Protection ordinance caps its own part at EUR 36m, and the DL 201/2025 extension carries "no new burdens".

These are caps, not spending. Unused diffuse-reception places were reallocated in 2023, so the low end is set below them.

| EUR bn | 2022 | 2023 | 2024–26 | total |
|---|---|---|---|---|
| old | 0.60 | 0.40 | 0.43 | 1.43 |
| new | 0.65 (0.45–0.80) | 0.50 (0.38–0.60) | 0.43 (unchanged) | **1.58** |

- **EU funding** stays in `round4b.json` `eu_funded` (REACT-EU/CARE pre-financing), as now.
- **DAC refugee costs are not used for Italy:** they are dominated by Mediterranean arrivals (USD 1.5–1.8bn a year).
- **Employment rate:** no official figure for Ukrainians was found, so it remains D.

## Effect on the map (gross own cost, before the gain on refugees' work)

| | Denmark | Sweden | Italy |
|---|---|---|---|
| change, EUR bn | −0.80 | −0.66 | +0.15 |
| points of 2024 GDP | about −0.21 | about −0.12 | about +0.01 |

- Each of these is a shift toward Ukraine. The counted hosting value (`refugees_gain`) changes by about the same amounts, since the work-gain term is small (EUR 0.09–0.23bn).
- **Certainty:**
  - Denmark becomes C overall. Gross is C and employment is now B.
  - Sweden's gross becomes B-C. The revenue side keeps it at D until an official employment rate is found.
  - Italy stays C/D.
