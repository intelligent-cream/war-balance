# Refugee hosting: net cost after refugees' taxes (2022 – Aug 2026)

Data: `refugees_net.json`, generated 2026-10-18. **Not yet reviewed by a person.**
Scripts: `scratchpad/r5/refugees_net/scripts/{build,assemble}.py`. Roadmap items 7 (more budget data, check Poland) and 21 (net cost).

## What this adds
The map counts the cost of hosting refugees from Ukraine as a shift toward Ukraine. Until now that cost has been **gross**. But many refugees work, and they pay income tax, social contributions and VAT. Without the war, neither the costs nor those taxes would exist, so the war's effect on a host's budget is the **net**:

> net cost = gross public cost − taxes and contributions paid by refugees (+ VAT and excise on their spending)

Units: EUR bn per calendar year, 2026 = January–August (not annualised), low/central/high (~90%). PLN and CZK are converted at the same ECB annual averages as `refugees.json`.

## Headline
| | gross, map now | gross, this file | revenue | net | net, floored |
|---|---|---|---|---|---|
| All hosts, 2022–26 (sum of centrals) | 137.5 | 123.6 | 61.2 | 62.4 | 66.4 |

- Revenue offsets about half of gross hosting costs over 2022–26. The share rises from about 20% in 2022 to more than 60% in 2025.
- **Net can be negative.** Czechia, Canada, Slovakia, Romania, Portugal, Estonia, Lithuania, Latvia and Moldova have negative central totals: for their budgets, hosting paid for itself. The UK, the USA and Spain turn negative from 2025.
- Poland's gross falls from 24.0 to 10.8 because the earlier figures mixed in non-refugee spending. See the Poland check below.

## Biggest countries (EUR bn, 2022–26 total, central with range)
| ISO3 | gross now | gross | revenue (range) | net (range) | net floored | revenue basis | cert. |
|---|---|---|---|---|---|---|---|
| DEU | 46.7 | 46.7 | 17.2 (11.8–24.2) | 29.5 (16.5 to 39.1) | 29.5 | official counts × modelled wage | B-C |
| NLD | 12.6 | 12.6 | 2.7 (1.9–3.5) | 9.9 (8.4 to 12.0) | 9.9 | modelled | C |
| POL | 24.0 | **10.8** | 7.6 (5.2–12.0) | 3.2 (−1.7 to 7.7) | 3.2 | official, adjusted | B |
| CHE | 6.6 | 6.6 | 1.0 (0.7–1.4) | 5.6 (4.5 to 7.3) | 5.6 | modelled | C |
| GBR | 6.5 | 6.5 | 3.9 (2.7–5.1) | 2.6 (0.2 to 6.1) | 2.6 | modelled | C |
| IRL | 6.5 | 6.5 | 1.7 (1.2–2.2) | 4.8 (3.6 to 5.9) | 4.8 | modelled | C |
| NOR | 4.5 | 4.5 | 1.3 (0.9–1.7) | 3.3 (1.8 to 5.2) | 3.3 | modelled | C |
| USA | 3.7 | 3.7 | 2.8 (2.0–3.6) | 0.9 (−0.7 to 2.9) | 0.9 | modelled (federal only) | C |
| CZE | 3.6 | 3.6 | 4.5 (3.7–5.3) | **−0.9** (−1.9 to 0.6) | 0 | official (MPSV) | A-B |
| CAN | 2.4 | 2.4 | 4.3 (3.0–5.7) | **−2.0** (−3.6 to 0.1) | 0 | modelled | C |
| DNK | 1.9 | 1.9 | 1.0 | 0.9 | 0.9 | modelled | D |
| ESP | 1.9 | 1.9 | 1.9 | 0.0 (−0.6 to 1.7) | 0.0 | modelled | C |
| FRA | 1.8 | 1.8 | 0.8 | 1.0 | 1.0 | modelled | C |
| SVK | 0.5 | 0.5 | 0.9 | −0.4 | 0 | modelled | C |
| BGR | 0.9 | **0.4** | 0.4 | 0.06 | 0.06 | modelled | D |

The yearly values for every country are in the JSON. Examples:
- Germany: 5.9 / 8.4 / 6.9 / 5.4 / 2.9.
- Poland: 2.4 / 1.0 / 0.3 / 0.0 / −0.4.
- Czechia: 0.7 / −0.1 / −0.3 / −0.7 / −0.6.

## Revenue: what is official and what is modelled
**Official (ministry figures)**
- **Czechia (A-B).** Source: Labour Ministry (MPSV) balance and the revenue table annexed to its FOI reply.
  - Revenue: CZK 11.1bn (2022), 19.4bn (2023), 25.2bn (2024), 15.0bn (H1 2025). Q3 2025 added 8.2bn; full-year 2025 is extrapolated to about 31.6bn.
  - Contributions come from ČSSZ pension-record data. They cover only Ukrainians first insured after 24 Feb 2022, so earlier labour migrants are excluded.
  - PIT, VAT, excise, energy tax and CIT are modelled by MPSV. The method is conservative: VAT is based on the spending of the poorest fifth of households.
  - MPSV's own expenditure was 25.0 / 22.0 / 15.5 / about 15.5bn, so its balance turned positive in 2024 (+9.7bn) and reached +11.7bn for Q1–Q3 2025. That expenditure includes some aid delivered inside Ukraine. For gross, we keep round4b's figures.
- **Poland (B).** Source: Ministry of Finance answer to interpellation 15498 (Apr 2026).
  - All Ukrainian citizens paid PLN 15.57bn (2022), 21.49bn (2023) and 26.69bn (2024): PIT, ZUS, NFZ, labour funds and estimated VAT.
  - This includes about 630k pre-war Ukrainian workers. We count only the change against a no-war path: 2021 revenue of about PLN 11.1bn, grown with Polish wages and +4% a year in headcount (low: +8%).
  - The result is about PLN 2.6 / 6.3 / 8.6bn for 2022–24, and is extrapolated for 2025–26.
  - High end = 30–50% of all-Ukrainian revenue, a refugee-share approach.
  - BGK's 15.1bn and TVN24's 18.7bn for 2024 cover all Ukrainians. Deloitte's 2022–23 modelled taxes (PLN 12–22bn) are larger than MF's own all-Ukrainian total and are not used.
- **Lithuania (B).** Social Security Ministry, via LRT: Ukrainians paid EUR 45m (2022), 95m (2023) and 65.2m (2024). 2025–26 are extrapolated.
- **Moldova (C).** Economic Council: about MDL 1.6bn since 2022, spread over the years.

**Official counts, modelled money**
- **Germany (B-C).**
  - Counts: Federal Employment Agency figures for Ukrainians in contributory jobs above the February 2022 level. Annual averages are about 35k / 100k / 165k / 240k / 290k, plus 20–60k extra minijobs. The latest data are 290k in July 2025 and 321k in November 2025.
  - Money per job: EUR 2,300 a month gross (range 1,900–2,800) × a 51% wedge (45–55%).
  - Indirect taxes: 2.5% of GDP per head per refugee person-year (1.5–4%).
  - Bürgergeld in the gross figure is an outturn, so benefits cut when refugees work are not counted twice.

**Modelled (everyone else; C where employment data exist, D where the employment rate is a guess)**
- Formula: revenue = person-years × 0.62 working-age share × employment rate × 0.5 (0.42–0.58) of the national average wage × total tax wedge (income tax + employee + employer contributions, about 67% of average wage) + person-years × 3% (2–4%) of GDP per head for VAT and excise.
- Employment rates:
  - EMN-OECD 2022–2024 table: AT 15/21/29%, BE 11/17/20%, CZ 35/48/66%, DE 19/25/30%, EE 42/54/59%, FI 22/22/24%, IE 27/35/45%, LV 30/30/35%, NL 44/55/55%, SK 23/29/40%.
  - OECD 2025 press figures for 2024: PL 78%, LT 72%, UK 69%, NO 31%, CH 28%, ES 17%. Spain conflicts with EMN's 36%, so 25% is used.
  - Later years add a few points.
  - Guesses (D): Italy, Sweden, Denmark, Romania, Bulgaria, Hungary, Greece, Croatia, Cyprus and others.
- Two scope corrections:
  - **USA:** federal income tax and payroll tax only (22%, no state sales tax), because round4b's USA gross covers federal spending only.
  - **Switzerland:** lower VAT share (1.8%).
- Calibration check against official data:
  - Czechia's indirect taxes are 2.9–3.7% of GDP per head per person-year, which supports the 3% assumption.
  - Czech earnings per working-age refugee are 9% (2022), 17% (2023) and 22% (2024) of the average wage; the model gives about 0.5 × employment rate, so 18–33%. That is in line or slightly high.
  - Slovakia: the government says Ukrainians (refugees and workers together) pay EUR 0.6bn a year, against our refugee-only 0.2bn.

## Item 7: more budget data for gross costs
**Poland check (2022).**
- Beneficiaries:
  - 1.74m PESEL UKR numbers were issued in 2022–23.
  - The Eurostat stock peaked at 1.37m (Sep 2022) and was 0.96m at end-2022 after the clean-up; that gives 0.91m person-years.
  - 474k people used collective accommodation in 2022, and there were 190.6k pupils at end-2022.
- Spending:
  - Aid Fund (Fundusz Pomocy, BGK) spending on Ukrainians was **PLN 11.3bn (2022), 8.9bn (2023), 8.1bn (2024)**, according to the MF in April 2026. NIK confirms more than 11bn for 2022.
  - The 13.87bn and 14.78bn quoted in the government's *Polska Pomoc Ukrainie 2022-2023* (and on radiospacja.pl, used in `refugees.json` and `round4b.json`) are **total** Fund spending, which also covers tasks outside Poland and food security.
  - 2022 items paid from the Fund: PLN 40/day host payments (3.94bn over 2022–23), collective accommodation (3.55bn over 2022–23), 500+ for refugee children 1.74bn, other family benefits 0.29bn, one-off PLN 300 (0.39bn), school support 1.59bn and health care.
  - Because 500+ was paid **from** the Fund, round4b's "Fund + 800+" low double-counts it.
- Problems with round4b's central of PLN 33bn (EUR 7.0bn) for 2022:
  - It is 2.9× the Fund figure.
  - It rests on modelled OECD (EUR 8.4bn) and Kiel estimates.
  - It also rests on the government's PLN 90bn for 2022–23, which covers all humanitarian and economic help, not hosting alone.
- Recommendation: **2022 PLN 11.3 / 13.6 / 18.0bn (EUR 2.4 / 2.9 / 3.8bn)**.
  - Central = Fund × 1.2, for local-government and ministry spending outside the Fund.
  - Later years follow the same rule.
  - 2026: from January the extra school cost moved into the general education subsidy (+PLN 3.44bn a year), and the special act ended on 5 March 2026, giving PLN 3.6 / 4.5 / 6.0bn for Jan–Aug.
  - Poland 2022–26: **EUR 10.8bn (6.6–14.5) instead of 24.0bn**.

**New hosts with budget figures (replacing the k-model):**
- **Bulgaria:** by autumn 2023 about BGN 523m (EUR 267m) had been paid for hotel and state accommodation, about 300m of it from EU funds. This is followed by small programmes; the 2025 programme gives 60 days of accommodation, and only 2,732 vulnerable people are eligible for the whole period. Total: 0.22 / 0.11 / 0.05 / 0.03 / 0.015 = **EUR 0.42bn instead of 0.92bn** (C).
  - The EU-funded part is kept, as round4b does. Do not also apply the flowback2 donor share to this figure.
- **Croatia:** the Interior Ministry put the cost at EUR 19 per day per state-supported refugee. Only about 4,500 people were in state-funded housing by March 2024. Total: **EUR 0.19bn instead of 0.35bn** (C).
- Not found: Hungary, Greece, Cyprus, Slovenia, Luxembourg, Montenegro and Iceland remain modelled (together EUR 2.0bn gross).

## Should the map floor net cost at zero? Recommendation: yes, on the 2022–26 total
- **Use net cost, floored at zero on each country's 2022–26 total** (`net_floored`), in both the net-shift view and the cost view. Show gross and revenue in "More details" and put a negative total in a note ("hosting paid for itself for the budget: +X").
- Why net:
  - The method compares against a no-war world, and in that world neither the costs nor the taxes exist.
- Why floor:
  - A budget gain comes from refugees' own work. It is not money moved toward Russia, so on a single-axis map it must not read as a pro-Russia shift.
  - Revenue is mostly modelled.
  - Revenue includes pension contributions, which create future claims.
  - Revenue covers all levels of government, while several gross figures cover only central government (USA, Spain, France).
  - So negative values are less certain than positive ones.
- Why the total and not each year: flooring each year would keep early deficits and drop later surpluses. Czechia would show +0.69 instead of 0.
- Effect: all hosts go from 137.5 (map now) to 66.4 (floored net). Germany goes from 46.7 to 29.5 and Poland from 24.0 to 3.2.

## Overlaps
- **No other part counts refugees' taxes, wages or remittances**, so revenue is new.
- Gross is unchanged from round4b and refugees.json, except the POL, BGR and HRV revisions.
- Pre-war labour migrants are excluded: Poland uses the no-war path, and Czechia uses insurance that started after 24 Feb 2022.
- Germany's Bürgergeld is an outturn, so it is not counted twice.
- Poland's revised gross is Fund spending, without UN or NGO money, so no donor share should be taken off it.
- **Builder bug:**
  - `build_data.py` applies the flowback2 donor share (about lines 410–419), and then `apply_audit()` overwrites `refugee_years` for all round4b hosts (about lines 1495–1502).
  - For Moldova that is intended. For POL, ROU, SVK and CZE the donor share (6/20/15/6%) is silently dropped.
  - Decide whether to apply it after `apply_audit()`. If Poland's revised gross is adopted, do not apply it for POL.

## Guessed or weak
- Employment rates for Italy, Sweden, Denmark, Romania, Bulgaria, Hungary, Greece and the small hosts (D).
- The refugee wage ratio of 0.5 (0.42–0.58).
- Poland's no-war headcount trend (+4% a year; the range is 0–8%).
- Full-year 2025 and 2026 revenue for Czechia, Poland and Lithuania are extrapolated.
- German average Ukrainian earnings: no published figure, so EUR 2,300 a month is an estimate.

## Open questions
- Pull the BA Migrationsmonitor monthly series and IAB earnings for Ukrainians, which would make Germany B.
- Get the MPSV Feb 2026 release (full 2025), MF Poland's 2025 analysis (not yet done, per the MF), Irish CSO earnings of arrivals from Ukraine, and Dutch CBS figures on working Ukrainians.
- Re-run the k calibration in refugees.json with Poland's refugee-only Fund figures.
