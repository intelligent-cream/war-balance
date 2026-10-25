# Russian-owned firms in Angola and Iraq: official and company evidence (round 44)

Output: [`rusfirms_r44.json`](rusfirms_r44.json), generated 2026-10-25. Raw extracts: [`../raw/eiti_r44/`](../raw/eiti_r44/).

- Units: EUR bn nominal, low / central / high (~90% range). 2026 = January–August, not annualised.
- Same method as [`company_flows`](company_flows-notes.md) and [`russian_owned_r10`](russian_owned_r10-notes.md): change = paid that year minus the 2019–2021 average (× 8/12 for 2026). A positive change means more money went to Russia.
- FX: USD per EUR as in r10. RUB per EUR 72.5 (2019), 82.45 (2020), 87.19 (2021), 90.5 (May 2025). KZT per EUR 499 (2023), 508 (2024).

## Short answer
| | old sum 2022–26, toward Ukraine (lo, hi) | new sum (lo, hi) | chance net, old → new | chance Russia's earnings, old → new |
|---|---|---|---|---|
| Angola | +0.171 (−0.235, +0.325) | **+0.048 (+0.018, +0.089)** | 86.2% → **91.4%** UA | 87.5% → **91.6%** UA |
| Iraq | −0.111 (−1.091, +0.869) | **+0.018 (−0.195, +0.159)** | 81.4% → **89.7%** RU | 82.0% → **89.1%** RU |
| Iraq, alt. A (with Rosneft's Kurdistan pipeline) | | +0.49 (+0.07, +0.94) | 81.4% → 50.7% RU | 82.0% → 52.2% RU |

- **Angola:** the r10 "high case" really happened. In May 2025 Alrosa received RUB 19.0bn in cash for its blocked Catoca dividend claims. It is booked apart from the share price. So 2025 goes from 0 to EUR 0.21bn paid. The pre-war base goes up from 0.037 to 0.055 a year (audited cash flows). Over 2022–2026 this nets out close to the pre-war rate, and the range shrinks about 8-fold.
- **Iraq:** the Iraq EITI reports give Lukoil's and Gazprom Neft's remuneration and the 35% tax paid on it. Profit after tax is only about USD 80–140m a year, and it barely changes after 2022. The ±EUR 1bn range drops to about ±0.18.
- After the change, rusfirms is no longer what holds either country back. For Angola its share of the variance toward zero falls from 0.86 to 0.03; for Iraq from 0.79 to 0.07. What remains is laundered oil (laund) and the oil price paid to Russia (paid). Halving either range would take Angola past 95%. For Iraq it would take net to 92–95%.
- Neither country becomes "sure" from this change alone.

## Angola: Alrosa ← Catoca (41%)
**Sources (company, audited):**
- [Alrosa IFRS 2021](https://www.alrosa.ru/upload/iblock/01f/IFRS-Consolidated-Statements-for-Q412M-2021.pdf)
- [MD&A Q4 2020](https://www.alrosa.ru/upload/iblock/0cb/MDA-release-Q412M-2020-ENG.pdf)
- [Alrosa IFRS 2025, "disclosed with exceptions"](https://www.alrosa.ru/upload/iblock/716/4qtpyyo2q8ggbhcpysfxhauxoolmzuww/ALROSA%20IFRS%202025%20ENG%20with%20exception.pdf)

alrosa.ru refuses curl through the proxy (403). The PDFs were fetched with WebFetch and parsed with pdftotext.

| year | evidence | paid, EUR bn |
|---|---|---|
| 2019 | not found; FY2018 dividend at the then 32.8% stake, RUB 2–4.5bn (estimate) | 0.041 (0.028–0.062) |
| 2020 | cash flow "dividends received from associates" RUB 6,071m (Q4: RUB 4.5bn of FY2019 dividend) | 0.074 |
| 2021 | same line, RUB 4,454m (FY2020 dividend declared June 2021: RUB 4,841m gross, 484m tax) | 0.051 |
| 2022–24 | FY2021–23 dividends (USD 100m, 85m, 134.4m) declared but **not paid**; provision RUB 10,340m in 2024 (IFRS 2025 note 5.2) | 0 |
| 2025 | sale closed 26 May 2025: RUB 15,942m for the 41% stake (capital, not counted) **plus RUB 19,019m cash for "assignment of rights of claim to receivables for dividends"** (note 5.3, cash-flow line) | **0.210** (0.205–0.216) |
| 2026 | stake sold | 0 |

- **Pre-war average:** 0.055 (0.050–0.063). The r10 guess was 0.037.
- **Change toward Russia:** −0.055 in each year 2022–2024, +0.155 in 2025, −0.037 in 2026. The sum is −0.048, i.e. +0.048 toward Ukraine.
- The RUB 19.0bn is about 73% of the USD 322m declared (gross), so the claims were sold at a discount.
- The buyer of the claims is not named. It is probably the share buyer, Taadeen (Oman), or Endiama. The money ultimately comes from Catoca's Angolan dividends, so the host stays Angola.
- If someone argued the RUB 19bn was really part of the sale price (capital), the sum would be +0.26 toward Ukraine. The filing books it as dividend claims, separately from the price, so this is not used.
- Certainty B: audited cash flows plus the 2025 filing; only 2019 is estimated.
- Angola's EITI 2022 and 2023 report pages on eiti.org have no files to download. The Endiama site returned 500. EITI Angola covers oil much more than diamonds, and it would not show dividends to a foreign owner. Not used.

## Iraq: Lukoil West Qurna-2 (75%) and Gazprom Neft Badra (30%)
**Sources (official):** Iraq EITI reports, reconciled by the Ministry of Oil's contracts directorate (PCLD) with the companies and SOMO.
- [2023 report](https://eiti.org/document/25590): DOCX, published 30 Dec 2025, with [data XLS](https://eiti.org/document/25597)
- [2022 report](https://eiti.org/document/25352): Arabic PDF
- [2021 report](https://eiti.org/sites/default/files/2024-01/Iraq%202021%20EITI%20Report.pdf)

The 2019 and 2020 reports have no files on eiti.org, and ieiti.org.iq was refused by the proxy.

**Contract terms**, from the EITI 2023 contract table and [Lukoil's project page](https://lukoil.com/Business/Upstream/Overseas/WestQurna-2):

| field | contractor shares | fee | |
|---|---|---|---|
| West Qurna-2 | Lukoil 75%, North Oil Co. 25% (state partner) | USD 1.15/bbl (Mishrif), 3.65 (Yamama) | |
| Badra | Gazprom Neft 30%, Kogas 22.5%, Petronas 15%, TPAO 7.5%, OEC 25% | USD 5.5/bbl | contract amended 22 May 2025 |

- Cost-recovery barrels repay costs. They are not profit.
- The remuneration fee is the profit, taxed at 35%.

**What the reports show (USD m):**

| | Lukoil remuneration | Lukoil 35% tax | GPN remuneration | GPN tax | Lukoil cost recovery | liftings, Lukoil / GPN |
|---|---|---|---|---|---|---|
| 2021 | not published (company non-compliant); production WQ2 146.0 Mbbl, Badra 12.86 Mbbl | | | | | 938.8 / 237.6 |
| 2022 | 126.25 (+42.08 to North Oil) | 44.19 | **0** (carried forward: cost-recovery ceiling) | – | 493.9 | 678.1 / 33.4 |
| 2023 | 178.69 (+59.56 to North Oil) | 62.54 | 33.18 (incl. catch-up) | 11.61 | 617.4 | 674.2 / 155.9 |

The tax is exactly 35% of the company's own share, which confirms the figures exclude the state partner.

**Profit after tax** (Lukoil + Gazprom Neft):

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026* |
|---|---|---|---|---|---|---|---|---|
| USD m | 103 | 92 | 96 | 82.1 | 137.7 | 104 | 75 | 10 |
| EUR bn | 0.092 | 0.081 | 0.081 | 0.078 | 0.127 | 0.096 | 0.066 | 0.009 |
| change vs pre-war | | | | −0.007 | +0.043 | +0.012 | −0.018 | −0.048 |

\* January–August.

- 2019–2021 = fee × production. Lukoil's 2022 remuneration, at similar output, matches this to within 1%. Gazprom Neft is the less certain part (±50%).
- 2024: estimated from 2022–2023 and about 460 kb/d.
- 2025: Lukoil was paid until roughly Q3. It declared force majeure after the October 2025 US and UK sanctions. Gazprom Neft, US-sanctioned since January 2025, received little.
- 2026: Iraq handed West Qurna-2 to Basra Oil Co. in February 2026, under an "amicable settlement" of outstanding invoices. The amount was not disclosed and the final decision was still pending in April 2026 ([World Oil](https://www.worldoil.com/news/2026/2/23/iraq-shifts-460-000-bpd-west-qurna-2-from-lukoil-to-basra-oil/), press). The high case (USD 75m) allows for a settlement that pays the Q4 2025 remuneration.
- Pre-war average: 0.085 (0.067–0.102). The sum of changes is −0.018 (lo −0.16, hi +0.20). The old company_flows figures were 0.233 pre-war and +0.111.
- These are upper bounds on what was "sent to Russia". The remuneration is paid in crude, sold by Lukoil's trading arm abroad, and since 2022 much of Lukoil International's cash has stayed abroad. Lowering post-war years for that would make the change more negative (toward Ukraine). The range already covers most of it.
- Certainty C: 2022–2023 are official, the other years are modelled.

**Why the old range was so wide.** company_flows spread Lukoil's 2021 foreign EBITDA over its host countries and applied ±0.9 × the pre-war level each year. That gave ±EUR 0.2bn a year. The official remuneration fixes both the level and the fact that it barely moves with oil prices: the fee is a fixed number of dollars per barrel.

### Alternative A: Rosneft's Kurdistan pipeline (KPC, 60%, 49% from Nov 2025)
- **Evidence:** KRG payments to KPC under the pipeline concession were USD 644m in 2019, and 179m, 85m and 191m in Q1–Q3 2020 (KRG/Deloitte reviews hosted at [api.eiti.org](https://api.eiti.org/sites/default/files/attachments/krg_mnr_oil_production_export_consumption_and_revenue_report_2019.pdf), official). They were USD 129m in Q1 2023 (Iraq EITI 2023, table 50).
- The pipeline was shut from 25 March 2023 to 27 September 2025.
- Rosneft sold 11% to DEX Capital in November 2025 ([Iraq Oil Report](https://www.iraqoilreport.com/news/rosneft-partially-divests-from-kurdistans-export-pipeline-47406), press).
- If Rosneft's cash is taken as 0.5 (0.3–0.8) of its share, its income falls by about EUR 0.47bn against 2019–2021, and Iraq drops to about 51%.
- **Not recommended.** The closure came from the ICC arbitration (Iraq v Turkey, filed in 2014) and the Baghdad–Erbil dispute. It would have happened without the war, so the no-war baseline has it too. Tariffs also include capital recovery on Rosneft's USD 1.8bn investment of 2017.
- company_flows names "Rosneft Kurdistan" in its note but did not model the closure. Its 2023–2024 values (0.30 a year, above pre-war) are wrong in either reading.
- If the owner prefers the plain "vs 2019–2021" rule, use alternative A, at certainty D, and expect Iraq's net lean to become a coin-flip.

## Other countries with rusfirms parts
- **Kazakhstan (official lead).** The [Kazakhstan EITI 2023–2024 report](https://eiti.org/document/26214) lists dividends paid to the state share (Kazatomprom) of Uranium One's 50/50 joint ventures: Karatau KZT 48.6bn (2023) and 58.8bn (2024), Akbastau 57.2bn (2024). Uranium One's equal share is EUR 0.10bn (2023, Karatau alone) and **EUR 0.23bn (2024, two joint ventures)**.
  - That is already above r10's 2024 guess for *all* of Uranium One (central 0.18). South Inkai (U1 70%), Khorasan and Zarechnoye (sold December 2024) come on top.
  - The pre-war base is not in the 2019, 2020–21 or 2022 EITI reports.
  - Kazatomprom's annual reports ("dividends received from joint ventures") would give both the pre-war base and the U1 share. Not done here.
  - Interim suggestion: raise r10 KAZ 2024 paid to 0.23 / 0.29 / 0.36 and 2023 to 0.10 / 0.16 / 0.25, keep the pre-war level, certainty C for those years. It moves KAZ toward Russia by about +0.1. KAZ's rusfirms range (−3.2 to +1.8) is dominated by Lukoil/KPO in company_flows, so the effect on the chance is small.
- **Uzbekistan, Egypt:** eiti.org returns "Not found" for both country pages. EITI shows payments to governments, not dividends to foreign owners, so it would bound but not measure Lukoil's remittances (UZB, EGY) or Rosneft's (Zohr). Not done.
- **Armenia:** EITI covers mining only. The Russian-owned firms counted there (Gazprom Armenia, banks, the railway) are outside its scope.
- **Venezuela, Mozambique:** no rusfirms part on the site. Venezuela is not in EITI. Rosneft's Mozambique blocks are exploration only.

## Proposed build changes
The integrator applies these; this round edited no pipeline or site files.

1. Register the source `rusfirms_r44` in `apply_company_flows`: "Iraq EITI 2021–2023 (PCLD remuneration and tax tables) and Alrosa IFRS 2021/2025 (Catoca dividends)", url `https://eiti.org/document/25590`, date 2026-10-25, note "see research/2026-10/gaps/rusfirms_r44-notes.md".
2. After the r10 merge, **replace** (do not add) `profits_change_vs_prewar` and `profits_certainty` for:
   - `hosts["AGO"]` with `rusfirms_r44.countries.AGO`, certainty B. AGO's only input today is r10. Keep `_r10` so the r10 source stays cited, and add `rusfirms_r44`.
   - `hosts["IRQ"]` with `rusfirms_r44.countries.IRQ`, certainty C. This replaces the company_flows Lukoil/GPN/Rosneft-Kurdistan block. Exit, discount and seizure fields, if any, are unchanged.
   - In code: `r44 = load(GAPS/"rusfirms_r44.json")["countries"]`, then for each iso3 in r44, set `hosts[iso3] = {**hosts.get(iso3, {}), "profits_change_vs_prewar": r44[iso3]["profits_change_vs_prewar"], "profits_certainty": r44[iso3]["profits_certainty"], "_r44": True}`, and append the `rusfirms_r44` source id when `_r44` is set.
3. Method text, `site/content/method/russia-state-and-companies.md` ("Russian-owned companies abroad"): add one sentence. "Iraq (Lukoil, Gazprom Neft) uses the remuneration fees and the 35% tax in Iraq's EITI reports; Angola uses Alrosa's audited Catoca dividends, including RUB 19bn received in 2025 for the blocked dividends."
4. Optional (owner's call): put alternative A (with KPC) in METHOD_ALTS as "Kurdistan pipeline vs 2019–2021", using `alternatives.IRQ_A`.
5. Optional: the KAZ interim bump above, until Kazatomprom's joint-venture dividend data are pulled.

## Checks
- The patch was tested by editing the rusfirms extra in the loaded site data and rerunning `calc`, `chance` and `pSignMC` (scratchpad r43 `load.mjs`). Before patching, the scripts reproduce the site's numbers exactly (AGO 0.862 / 0.875, IRQ 0.814 / 0.820).
- The Iraq figures cross-check: tax = 0.35 × the company's remuneration in both 2022 and 2023, and the state partner's remuneration = 1/3 of Lukoil's (25/75) and 25/30 of Gazprom Neft's.
- The Alrosa figures cross-check: 2020–21 cash ≈ the declared dividends net of 10% withholding. The 2025 cash appears both in the investing cash flow and in other operating income.
