# Refugee hosting: actual spending minus the host's real gain on refugees' work (round 24b)

Data: [`refugees_gain.json`](refugees_gain.json) (the rule's parameters, sources and the research run's table). The build applies the rule in `pipeline/build_data.py` `apply_refugees_gain()`. Inputs:
- [`refugees_net.json`](refugees_net.json) (gross spending, person-years, model inputs; its tax revenue is no longer subtracted);
- [`net_gain_sellers.json`](net_gain_sellers.json) (industry net gain);
- OECD STAN raw files in [`raw/oecd_stan/`](../raw/oecd_stan/) (output and labour cost);
- [`flowback2.json`](flowback2.json) (donor-paid shares).

**Decision (the owner, 22 October 2026, audit 24 D H1):** count what governments actually spent on refugees, minus donor-paid shares, minus only the host's real gain on refugees' work, under the one-seller rule; no subtraction of refugees' taxes and no floor at zero. **Poland:** the OECD median margins at central, Poland's own STAN margins as the range end (open question 1 below, option c with b at central). The other open questions stay open (VAT: not counted, as the rule says; Kiel's modelled costs: not used; person-years per 1,000 residents: not added).

**Read only via the press:** Czechia's MPSV balance (Radio Prague headline; the page returned 403) and the Kiel Institute's 8 October 2026 Germany analysis (via Börsen-Zeitung). Neither is an input; both are cross-checks.

## The proposed rule (exact)
```
counted_y = gross_y × (1 − donor_share) − gain_y          (no floor)
gain_y    = wagebill_y × Σ_s share_s × ng_s × (P1/L)_s × extra
```
- **gross_y.** Actual public spending on refugees, all levels of government. These are today's `refugees_net.json` gross values with `REFUGEE_SCOPE` (Germany, Poland 2022), i.e. `aid.refugee_gross_years` before the donor share. The **donor share** stays as now (`flowback2.json`).
- **wagebill_y.** Refugees' gross earnings:
  - Germany: BA counts above the Feb-2022 level × €2,300/month (1,900–2,800), plus minijobs.
  - Czechia: MPSV earnings per working-age refugee as a share of the average wage (9 / 17 / 22% for 2022–24, then 24 / 25%).
  - Poland: 60–78% employed × 60% of the average wage.
  - Everyone else: the existing `revenue_model_inputs` (person-years × 0.62 × employment rate × 0.5 × average wage).
- **share_s.** Industries refugees work in:
  - The Netherlands is **measured**: CBS, 1 Nov 2025, Table 4. M–N business services (mostly agencies) 50%, trade/transport/hospitality 31%, industry 7%.
  - Germany, Poland and Czechia are **ranked** by BA, ZUS and MPSV; the shares are judged.
  - Others use a default pattern close to the Dutch and German ones.
- **ng_s.** `net_gain_sellers.json` industries, i.e. taxes on production plus profit above a normal return, per euro of output: C (manufacturing, also agriculture), GTNXL (business services, transport, construction, other), G47 (retail), I (hospitality).
  - Health and social work (Q) counts 0, because it is mostly public.
  - **Ireland takes the OECD median.** Its STAN margins reflect multinational profit booking (the same treatment as Greek shipping).
- **P1/L.** OECD STAN 2021–23 output per euro of labour cost, with labour cost = D1 × EMP/SAL (the self-employed paid as employees, as in `net_gain_sellers`). This converts "gain per euro of output" into "gain per euro of refugees' wages".
- **extra.** 0.5 (0.3–0.8), judged. Arguments for a higher value: record vacancies in 2022–23, and no measurable displacement of natives in Czechia ([IZA DP 16965](https://www.iza.org/publications/dp/16965)). Argument for a lower value: part of refugee work replaces no-war labour migration (Poland, Czechia).
- **Dropped:** the subtraction of refugees' income tax, contributions and VAT (the old "revenue").
  - Under the one-seller rule, wages and the taxes on them are the worker's income, not the host's gain. The project already excludes remittances on that ground.
  - Contributions buy the refugees' own pensions and care.
  - VAT is paid out of the refugees' own income.
- **No floor.** At central, no host goes negative. A negative year, if any, would now be a real host gain, not a tax artefact.
- **Unchanged:**
  - refugee-spending flowback (`refsp`), which now applies to the larger counted cost (included in the effect below);
  - Belarus's exclusion.
- **Method band:** "refugees at gross cost" stays as the high end; "net of refugees' taxes" (the old rule) can become a band alternative.

## Old vs proposed, 25 hosts (research run before the build; Poland at its own margins, which the build no longer uses at central) (EUR bn, 2022 – Aug 2026; points of one year's GDP)
| host | gross own (cert.) | refugees' taxes (old offset) | old counted [range] | refugees' wage bill | host gain per € wage | host gain (range) | **new counted** [range] | Δ support & net | net now → new |
|---|---|---|---|---|---|---|---|---|---|
| DEU | 36.87 (B) | 17.19 | 19.68 [11.66, 42.56] | 21.4 | 0.132 | 1.41 (0.24–3.83) | **35.46** [24.54, 42.77] | +0.37 | +3.21 → +3.58 |
| POL | 12.53 (B) | 7.59 | 4.94 [0.00, 14.36] | 26.2 | 0.717 | 9.38 (3.81–18.88) | **3.15** [−8.49, 12.71] | −0.22 | +4.39 → +4.17 |
| CZE | 3.35 (A-B) | 4.49 | 0.00 [0.00, 1.05] | 4.4 | 0.097 | 0.21 (0.03–0.81) | **3.13** [2.03, 4.49] | **+1.01** | +1.57 → +2.58 |
| GBR | 6.51 (B) | 3.95 | 2.56 [0.00, 7.04] | 9.7 | 0.165 | 0.80 (0.17–1.92) | **5.71** [2.64, 9.59] | +0.10 | +1.42 → +1.52 |
| ESP | 1.90 (B) | 1.85 | 0.05 [0.00, 2.15] | 2.2 | 0.155 | 0.17 | **1.73** [1.11, 3.41] | +0.11 | +0.97 → +1.08 |
| ITA | 1.43 (C) | 1.19 | 0.24 | 1.3 | 0.139 | 0.09 | **1.34** [0.75, 2.28] | +0.05 | +1.60 → +1.66 |
| NLD | 12.61 (A-B) | 2.72 | 9.89 [7.81, 12.62] | 4.8 | 0.324 | 0.78 (0.28–1.75) | **11.83** [9.60, 14.22] | +0.18 | +5.04 → +5.21 |
| FRA | 1.83 (B) | 0.81 | 1.02 | 1.1 | 0.045 | 0.03 | **1.80** | +0.03 | +1.53 → +1.56 |
| ROU | 0.47 (B-C) | 0.72 | 0.00 | 0.7 | 0.135 | 0.05 | **0.42** [0.18, 0.75] | +0.13 | +2.63 → +2.76 |
| SVK | 0.44 (C) | 0.93 | 0.00 | 1.1 | 0.158 | 0.08 | **0.36** [0.05, 0.78] | +0.29 | +0.12 → +0.41 |
| MDA | 0.07 (C; 80% donor-paid) | 0.11 | 0.00 | 0.4 | 0.135 | 0.03 | **0.04** | +0.26 | +6.56 → +6.82 |
| LTU | 0.22 (B-C) | 0.32 | 0.00 | 1.2 | 0.285 | 0.18 | **0.04** [−0.32, 0.47] | +0.06 | +11.80 → +11.86 |
| LVA | 0.28 (B-C) | 0.27 | 0.00 | 0.4 | 0.084 | 0.01 | **0.26** | +0.66 | +4.72 → +5.38 |
| EST | 0.24 (C) | 0.40 | 0.00 | 0.6 | 0.093 | 0.03 | **0.21** | +0.56 | +10.34 → +10.89 |
| IRL | 6.45 (A-B) | 1.69 | 4.76 | 3.2 | 0.135 (OECD median) | 0.21 | **6.24** [4.83, 7.38] | +0.27 | +1.45 → +1.72 |
| AUT | 1.88 (C) | 1.48 | 0.41 | 1.7 | 0.054 | 0.05 | **1.83** | +0.30 | +0.21 → +0.51 |
| CHE | 6.63 (B) | 1.05 | 5.58 | 2.2 | 0.130 | 0.14 | **6.49** | +0.10 | +0.76 → +0.86 |
| BEL | 2.03 (C) | 1.21 | 0.82 | 1.3 | 0.044 | 0.03 | **2.00** | +0.20 | +2.81 → +3.00 |
| SWE | 1.57 (C) | 0.73 | 0.84 | 0.8 | 0.212 | 0.09 | **1.48** | +0.12 | +3.58 → +3.70 |
| NOR | 4.54 (B-C) | 1.26 | 3.28 | 1.5 | 0.170 | 0.13 | **4.41** | +0.22 | +3.08 → +3.30 |
| DNK | 1.95 (C) | 1.03 | 0.92 | 2.0 | 0.228 | 0.23 | **1.73** | +0.21 | +4.44 → +4.65 |
| FIN | 1.59 (C) | 0.86 | 0.73 | 1.0 | 0.128 | 0.07 | **1.52** | +0.29 | +7.88 → +8.17 |
| BGR | 0.35 (C) | 0.37 | 0.00 | 0.5 | 0.135 | 0.03 | **0.32** | +0.33 | +2.91 → +3.24 |
| CAN | 2.38 (B-C) | 4.35 | 0.00 | 9.6 | 0.119 | 0.57 | **1.81** [−0.35, 3.71] | +0.09 | +0.48 → +0.57 |
| USA | 3.69 (B; federal only) | 2.84 | 0.85 | 12.8 | 0.277 | 1.77 | **1.92** [−1.30, 4.91] | +0.00 | +0.51 → +0.52 |
| **25 hosts** | **111.8** | **59.4** | **56.6** | | | **16.6** | **95.2** | | |

The Δ column applies `(new − old) × (1 − refugee_back_f)` and is approximate. The net's range changes too: the CZE range now stays above zero on refugees, and its likely range was −0.94 to +4.26.

## Reading
- **The audit's expected effects are confirmed.**
  - Czechia +1.0 point; its net is now 2.6% and its range should no longer cross zero. The audit estimated +1.1.
  - Germany +0.37 (audit +0.4).
  - Netherlands +0.18 (audit +0.26).
- **Central and Eastern European hosts gain the most:** Latvia +0.66, Estonia +0.56, Bulgaria +0.33, Austria +0.30, Slovakia +0.29, Moldova +0.26.
- **Poland is the exception, and the open issue.**
  - Its STAN margins are high: retail 0.29 and business services 0.18 of output above a normal return. Its output per euro of labour is also high, so the host's gain per euro of refugees' wages is 0.72. That is 5× Germany's.
  - With a large refugee workforce (wage bill €26bn), the computed gain (€9.4bn) is larger than the taxes it replaces (€7.6bn), and Poland's counted hosting *falls* from 4.9 to 3.2.
  - With the OECD median margins (the Ireland treatment), Poland would be **10.6 [4.8, 16.2], +0.70 points**.
  - The result rests on Polish STAN margins that `net_gain_sellers-notes.md` already flags as high (services 0.181).
  - I recommend the owner decide this explicitly. Options: (a) use Poland's own margins (consistent with every other Polish part); (b) use the OECD median for refugee work, because refugees work mostly through agencies and in low-margin jobs, not at the average Polish margin; (c) put (a) and (b) as the range.
- **US and Canada.** The large wage bills give larger gains (US 1.8, Canada 0.6), but the US gross is federal only, so the effect is about 0.

## Gross spending: what was checked
The rule uses today's gross values. Cross-checks:
- **Germany.**
  - Kiel's analysis (8 Oct 2026) finds €35.9bn of German civilian "support" was spent inside Germany to mid-2026: Bürgergeld €27.45bn, Länder and municipal accommodation €7.15bn, plus other items ([Börsen-Zeitung](https://www.boersen-zeitung.de/konjunktur-politik/deutsche-ukrainehilfe-weniger-generoes-als-von-berlin-deklariert)). The model's gross own cost is 36.9 to Aug 2026, so it matches.
  - The government list at 31 Mar 2025: BMAS €18.64bn, BMF €7.88bn (lump sums to Länder and municipalities, BImA housing), BMI €1.06bn ([Bundesregierung PDF, pp. 2–7](https://www.bundesregierung.de/resource/blob/975228/2201464/5f307970470d06878af4f84fff956613e84/liste-ukr-bilaterale-hilfe-data.pdf?download=1)). This is federal only.
- **Czechia.** MPSV balance (press): CZK 62.5bn spent and CZK 55.5bn in refugees' taxes ([Radio Prague](https://english.radio.cz/node/8843622); the page itself returned 403). The model's 3.35 EUR bn (~CZK 82bn) also includes education and health.
- **Kiel, Feb 2026:** EU members spent €163.1bn in 2022–25 ([EPRS PE 775834, Fig. 6](https://www.europarl.europa.eu/RegData/etudes/BRIE/2025/775834/EPRS_BRI(2025)775834_EN.pdf)), against the model's ~€124–140bn for all hosts to Aug 2026.
  - Kiel's figures are **modelled** (counts × per-capita costs), not budgets. For the first ~16 months, Kiel's per-country numbers (POL 12.0, DEU ~11, CZE 2.94, ESP 2.24, FRA 2.04, ROU 1.26, CHE 1.16, ITA 1.15 EUR bn; [Gwara Media, 4 Jul 2023](https://gwaramedia.com/en/eu-countries-spent-over-e43-billion-on-ukrainian-refugees/)) are far above the budget-based gross for Spain, France, Romania and Italy.
  - **Proposal:** keep budget figures central. Where Kiel is higher, use Kiel as the high end of gross for the modelled hosts (Spain, France, Romania, Italy, Belgium, Austria, Sweden, Denmark, Finland). The Kiel per-country table is in the tracker's refugee-cost dataset, which is not in the R31 workbook; request it from Kiel.
- **No Kiel October 2026 refugee analysis** across countries was found. The 8 Oct 2026 paper covers Germany only.

## Employment and industries (sources)
- **Germany.** 321k Ukrainians in contributory jobs in Nov 2025, +264k on Feb 2022; 53k minijobs; employment rate 37%. Main sectors: other business services including temporary agency work, manufacturing, trade, and health and social work ([BA, Arbeitsmarkt kompakt, 30 Jan 2026, p. 4](https://statistik.arbeitsagentur.de/DE/Statischer-Content/Statistiken/Themen-im-Fokus/Migration/Personen-nach-Staatsangehoerigkeiten/Generische-Publikationen/AM-kompakt-Auswirkungen-Fluchtmigration-Ukraine-Arbeitsmarkt.pdf)). IAB counts 398,575 in May 2026 (39.1%).
- **Netherlands.** 62% of refugees aged 15–64 are employees; industry shares as above; 37% agency workers ([CBS, 1 Nov 2025 tables](https://www.cbs.nl/-/media/_excel/2026/06/november2025---oekraensevluchtelingen---werknemers.xlsx)).
- **Poland.** About 78% of working-age Ukrainians employed ([PAP](https://biznes.pap.pl/wiadomosci/gospodarka/poland-sees-approx-78-pct-working-age-ukrainians-employed)). ZUS: among all foreigners, a third work in industry, transport and logistics, and an eighth in construction ([EC migrant integration portal](https://migrant-integration.ec.europa.eu/news/poland-almost-13-million-foreigners-work-legally-poland_en)).
- **Czechia.** 150,300 refugees working in Jan 2024; most often in manufacturing, construction, services and transport ([EC portal](https://migrant-integration.ec.europa.eu/news/czech-republic-employment-and-perception-people-displaced-ukraine_en); [Interfax](https://interfax.com/newsroom/top-stories/79308/)).
- **Employment rates, 2023:** from ~66% (Lithuania) to ~17% (Belgium) ([OECD–EMN](https://emn.fi/wp-content/uploads/Ave-Lauren_OECD_EMNFinland_2024_v2.pdf)).

## Confidence
- **The rule:** high; it is consistent with the one-seller rule.
- **The gain:**
  - medium for the Netherlands (measured sectors);
  - low to medium elsewhere (judged sector shares);
  - **low for Poland**, where the margin choice moves the result by about 1 point.
- **Gross:** unchanged from today, B/C for most hosts.

## Open questions
1. Poland's margins: own STAN margins (3.2) or the OECD median (10.6)? Or show both as the range?
2. Should VAT on refugees' consumption count as a host gain? The one-seller rule says no, since it is a tax on their own income's spending. Counting it would add back the VAT/excise part of the old offset (modelled at 3% of GDP per head per person-year, 2–4%), a large share of the old €59bn.
3. Should Kiel's modelled per-country costs be the high end of gross where they exceed budgets?
4. Add the non-money line "refugee person-years per 1,000 residents" (audit New perspective 2). `refugees.json` `person_years` already has the data.
