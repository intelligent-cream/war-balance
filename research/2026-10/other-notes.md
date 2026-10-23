# other.json: research notes (2026-10-17)

## Method
- FX: ECB 2024 annual average is 1.08238 USD per EUR (ECB SDW EXR.A.USD.EUR.SP00.A, downloaded). 2023 fallbacks use 1.08127.
- Downloads are in research/raw/other/: wb_gdp.json, wb_pop.json, wb_countries.json, wb_gdp2023.json, imf_gdp.json, imf_pop.json, m49.html, unhcr_ukr*.json, eurostat_tp_ua.json, ecb_usd*.csv and kse_chp_q2_2026.pdf.
- This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.
- Certainty letters: A means reported, B means a measured estimate, C means modelled and D means a rough indication. Belligerent sources are tagged "BELLIGERENT" in source strings.

## A. Military support to Russia (all D)
| | basis | EUR bn low / central / high |
|---|---|---|
| PRK | INSS $7.67-14.4bn (Aug 2023-Dec 2025); FNF $9.8bn | 7.09 / 9.05 / 13.30 |
| PRK item model | shells 4m/6m/12m × $300/$500/$1,000; KN-23/24 100/150/190 × $1.5m/$2.25m/$3m; troops $0.62bn | 1.82 / 3.66 / 12.19 |
| IRN | Bloomberg >$4bn; $2.7bn missile contracts + $1.75bn Shahed/Alabuga contract + ~300k shells | 3.70 / 4.25 / null |
| BLR | only quantities: 131,582 t ammunition (Jan 2022-Feb 2023), ~5,000 t (2024), ≥94 T-72A | null |
| CHN | dual-use, commercial: 2024 >$4bn (MERICS) + H1 2025 $1.9bn (OSW) | 5.45 / null / null |

Most of these flows are sales or barter, not gifts. DPRK is paid in cash, food, oil and technology; Iran works under contracts; China under trade at a premium of about 300% (KSE).
DPRK artillery systems: about 120 Koksan SPGs and 120 240mm MLRS (Budanov). No unit price was found, so they carry no value.

## B. People
- DPRK troops for Russia: 11k (NIS), 14k (GUR) to 20k+ (INSS, four rotations). NIS puts casualties at about 6k killed and wounded (Feb 2026). About 2,300 died (BBC memorial analysis; Mediazona 2,304, Jul 2026).
- Other foreigners for Russia: 4.7-8k (Frontelligence, Jul 2025), about 10-20k (War on the Rocks) and >28k non-DPRK (GUR, Jun 2026, belligerent). GUR's country list is higher than its own total. The iStories leak gives the lower bounds.
- Volunteers for Ukraine: no independent breakdown by country exists. The per-country highs are Russian MoD claims from Mar 2024 (belligerent). Independent totals are 1.5-2k active (2023) and about 4k (later). Colombia has 2k-7k (the largest contingent now). Russian and Belarusian citizens are not counted.
- Refugees: for EU and EFTA countries the source is Eurostat temporary protection (Jun-Sep 2026; EU27 total 4.36m, Aug 2026). Everything else comes from UNHCR end-2025 (5.22m refugees globally). For Russia, UNHCR now shows only 5,488, compared with 1.23m at end-2023 based on Russian government data. That figure is disputed. US U4U parolees are not counted as refugees.

## C. Population and GDP
- 217 economies. The main source is World Bank WDI 2024 (the API worked on retry). IMF WEO fills TWN, SSD and SMR. WB 2023 fills GRL and IMN. PRK uses the Bank of Korea GNI estimate ($32.01bn).
- GDP is null for CUB, SYR, ERI and 7 small territories.

## D. Undisclosed aid to Ukraine
- No aggregate estimate exists.
- Italy's packages are classified: EUR 2.5-3bn+ (Bloomberg; Chief of Defence Staff).
- Germany has stopped itemising since Jun 2025, but totals are still published (Kiel: EUR 56.3bn traceable).
- France's figures differ because of valuation: Kiel's equipment estimate is EUR 0.64bn, the MoD's is 2.615bn, and the MoD's total is 3.8bn (2022-23).
- Bulgaria's secret 2022 supplies (about 1/3 of ammunition, up to 40% of diesel) were sold commercially. No value was found.
