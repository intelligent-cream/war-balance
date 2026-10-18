# Company taxes in Russia, round 6: company-level revision (`company_taxes_r6.json`)

Roadmap item C7. This file replaces the company-tax inputs the builder reads today:
[`companies_all.json`](companies_all.json) and [`round4a.json`](round4a.json) `taxes.split` /
`history_2018_2020_split`. It keeps the same scope and the same per-country layout and adds company-level evidence.
It is not an extra flow on top of them.

## What the flow is

These are taxes that Russian subsidiaries of foreign companies pay to the Russian state while they are still
foreign-owned. They are attributed to the home country of the owner. The map counts the **owner measure**: profit
tax in full plus half of the other taxes. VAT, excise and payroll taxes are largely carried by Russian customers
and staff. The pre-war level is the 2018–2021 average. The change against it, grown at the pre-war trend, is what
the map shows. "Less tax paid in Russia" counts toward Ukraine; "more" counts toward Russia.

Units are EUR bn, nominal. For 2026 the file gives **January–August amounts, not annualised**, so the builder
should not multiply them by 8/12 again.

## What was wrong or thin in the current series

The current series rests on one source family: KSE Institute and B4Ukraine country charts, with an allocation for
everyone else. Checking it against company data showed six problems:

1. **2024 is largely carried forward.** Only 43 of the 100 largest foreign firms filed 2024 accounts. KSE marks its
   2024 list "estimates based on previous years' data", and Chery, Philip Morris, JTI, Mars, Mondelez and Haval have
   identical 2023 and 2024 values ([B4U24 p.8](https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf)).
2. **2025 is a share model.** It applies 2024 country shares to KSE's preliminary 2025 total. Company results show
   the stayers' taxes went up in 2025: the profit-tax rate rose from 20% to 25% and the rouble strengthened.
3. **Austria 2022 was interpolated.** It was set at EUR 0.34bn, but Raiffeisen alone reported EUR 0.56bn of income
   tax in Russia that year.
4. **Japan Tobacco International sits under Switzerland** in KSE's country tables: Japan's 2023 figure is USD 168m,
   below JTI's 182m alone. The owner is Japan Tobacco Inc. in Tokyo, so under the map's owner rule JTI belongs to
   Japan.
5. **Seized companies are still counted for their old owners.** Unipro (Uniper, Germany) and Fortum PJSC (Finland)
   have been under Rosimushchestvo management since decree 302 of 25 April 2023. KSE still lists Uniper with
   USD 107m of 2024 profit tax, and Finland's 2024 USD 124m is mostly Fortum.
6. **OTP is missing from Hungary's 2021 figure.** KSE gives Hungary USD 4m, while its own company chart gives OTP
   USD 30m.

## Data found

| source | what it gives | used for | certainty |
|---|---|---|---|
| [RBI Annual Financial Report 2022](https://www.rbinternational.com/content/dam/rbi/ho/investors/results-reports/annual-reports/rbi/2022%20Annual%20Financial%20Report%20-%20printer%20friendly.pdf.coredownload.pdf), note 51; [AR 2024](https://www.rbinternational.com/content/dam/rbi/ho/investors/results-reports/annual-reports/rbi/2025-02-25%202024%20RBI%20Annual%20Financial%20Report.pdf.coredownload.pdf), note 50 | country-by-country table (Austrian Banking Act §64): Russia income taxes EUR 117m (2021), 559m (2022), 464m (2023), 399m (2024) | AUT 2021–2024 | A |
| [RBI AR 2025 overview](https://www.lobbyregister.bundestag.de/media/27/b9/822300/RBI-Annual-Report-2025.pdf), [preliminary 2025](https://www.eqs-news.com/news/corporate/consolidated-profit-excluding-russia-above-1-4-billion-euros/495ce5d1-af8f-4a38-a51d-54726beb9790_en) | group tax 1,013 minus tax ex-Russia 521 = **492** for Russia in 2025 (Rasperia provisions are not deductible) | AUT 2025 | B |
| [RBI H1 2026](https://www.ots.at/presseaussendung/EQS_20260731_EQS0002/eqs-news-rbi-semi-annual-financial-report-2026-consolidated-profit-excl-russia-up-25), [RTTNews](https://www.rttnews.com/3673636/raiffeisen-bank-international-h1-net-income-surges.aspx) | group 1,256 minus ex-Russia 708 = 548 profit from Russia in H1; at 25% tax that is about 183, or 244 for January–August | AUT 2026 | C |
| [Interfax](https://interfax.com/newsroom/top-stories/109722/), [Finance Mail/Interfax](https://finance.mail.ru/article/rossijskij-biznes-unicredit-v-2025-godu-uvelichil-chistuyu-pribyl-na-41-69197795/) | UniCredit Russia net profit EUR 577m (2024) and 814m (2025); retail wind-down in H1 2026 | ITA 2025–2026 | B |
| [OTP investor presentation 4Q 2025](https://www.otpbank.hu/static/portal/sw/file/OTP_Bank_Inv_Pres_4Q2025.pdf), p.8 | OTP Bank Russia profit after tax HUF 137bn (2024) and 202bn (2025) | HUN 2025–2026 | B |
| [smart-lab (audit-it RAS)](https://smart-lab.ru/blog/1146924.php), [TAdviser](https://www.tadviser.ru/index.php/%D0%9A%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D1%8F:PepsiCo_Russia_(%D0%9F%D0%B5%D0%BF%D1%81%D0%B8%D0%BA%D0%BE_%D0%A5%D0%BE%D0%BB%D0%B4%D0%B8%D0%BD%D0%B3%D1%81)) | PepsiCo Holdings profit RUB 8.7bn (2021), 36.8bn, 34.6bn, 43.4bn, 46.5bn (2025) | USA check and 2025 | B |
| [B4U23 p.25](https://b4ukraine.org/pdf/B4U_Report_2025.pdf), [B4U24 p.8](https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf) | KSE top-20 taxpayers 2021, 2023, 2024 (all in the JSON) | anchors, JTI, Unipro | B |
| [Bundesbank Direktinvestitionsstatistiken, April 2025](https://www.bundesbank.de/resource/blob/957944/3f44e3b0af199f69ebcd49ea5887bc01/472B63F073F071307366337C94F8C870/2025-05-16-14-13-59-direktinvestitionsstatistiken-data.pdf) | reinvested earnings of German direct investors in Russia: EUR 1.49bn (2021), 2.32bn, 2.94bn, 3.11bn (2024) | DEU 2024–2026 | A (cross-check) |
| [The Insider (SPARK-Interfax)](https://theins.ru/inv/279306), 2025-03-04 | about RUB 0.5 trn of taxes in 2023 from 11.6k Western-owned firms; no country split | cross-check only | C |

**Checks that passed.** RBI's own tax (EUR 117m, 464m, 399m) matches KSE's company figures (USD 135m, 491m, 402m)
within 5–10%. PepsiCo's RAS-based tax for 2024 (EUR 0.108bn) matches KSE's figure (EUR 0.113bn). Where companies
file, KSE is reliable. Its weak points are the interpolated and carried-forward years.

**Blocked.** Russian registries returned 403, captcha or connection resets: Rusprofile, Checko, List-org,
bo.nalog.ru (GIR BO), pb.nalog.ru and audit-it. The FNS "taxes paid" open data could not be reached. SPARK is paid.
Company-level RAS data therefore come only through secondary sites.

## How the numbers were built (script: scratchpad `company_taxes_r6/scripts/build.py`)

The starting point is the current in-scope series: the KSE figures for non-exited firms, plus a time-weighted share
of the exited cohort. Each correction then replaces only the company inside it.

- **AUT**:
  - Raiffeisen's own Russian income tax replaces its KSE value. Other Austrian firms are KSE's Austrian total minus
    RBI: about EUR 0.07–0.09bn a year (2021 guessed at 0.05).
  - 2026 (January–August) is RBI 0.24 plus others 0.06.
  - 2018–2020 are scaled by the 2021 revision (×1.42).
- **ITA**:
  - UniCredit 2025: tax from net profit at 25%, multiplied by 0.66, the ratio of KSE cash tax to IFRS tax in
    2023–2024. Result: EUR 0.18bn (0.14–0.27).
  - UniCredit 2026 (January–August): EUR 0.06bn (0.03–0.12) with the retail wind-down. That is about the same as 2025 × 8/12, but with a wider range.
- **HUN**: OTP 2025 is EUR 0.16bn (profit after tax HUF 202bn, 25% rate). OTP 2026 (January–August) is 0.09bn.
  OTP's USD 26m is added to 2021, and 2018–2020 are scaled with it.
- **JPN / CHE**:
  - JTI's profit tax moves from Switzerland to Japan: EUR 0.11 (2021), 0.15, 0.17, 0.17, 0.14, 0.09 (2026).
  - Other taxes move in the same proportion.
  - 2018–2020 follow the Swiss history.
- **DEU**:
  - Unipro is removed from May 2023: EUR 0.05bn in 2023, 0.10bn in 2024, 0.08bn in 2025 and 0.05bn in
    January–August 2026. Other taxes of the same size are removed with it.
  - Then the Bundesbank check. With dividends blocked, after-tax profit is at least the reinvested earnings. EUR 3.1bn
    minus Unipro (about 0.28bn) implies at least EUR 0.71bn of profit tax in 2024, against 0.35bn from KSE.
  - The 2024 central is the geometric mean (0.50, range 0.33–0.74). The same factor (×1.42) is applied to 2025–2026.
  - In 2022–2023 the two sources agree.
- **FIN**: Fortum is removed from 2024 on: profit tax ×0.2, other taxes ×0.45. Finland's 2023 figure already
  excluded it.
- **USA 2025**:
  - The stayers (PMI, PepsiCo, Mars, Mondelez, P&G, Cargill, J&J) are about 0.6 of US profit tax.
  - Their 2025 tax is set ×1.35 (rate 25%, stronger rouble, rouble sales up 10–20%). The rest of the US is ×0.8.
  - The central is the mean of this and the KSE share method: 0.90 instead of 0.74, range 0.65–1.17.
- **CHN 2025–2026**: ×0.8 (low ×0.6). Chinese car brands' profits fell with the recycling fee and the shrinking car
  market. **Educated guess.**
- **FRA**: the low case excludes Lemana PRO (ex-Leroy Merlin, about EUR 0.12bn a year). It has been 99.9% held by
  UAE-registered Scenari Holding LP since 2023.
- **2026 for everyone else**: the 2025 value × 8/12. Russian profit-tax receipts in Q1 2026 were 98.8% of Q1 2025,
  and EUR/RUB was 93 against 94. The range is 0.75–1.15 on top of the 2025 range.

## Totals (EUR bn, central; sum of country centrals)

| | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) |
|---|---|---|---|---|---|---|
| Profit tax, r6 | 4.64 | 5.95 | 5.16 | 4.32 | 3.93 | 2.46 |
| Profit tax, current | 4.57 | 5.67 | 5.20 | 4.31 | 3.47 | 2.31 |
| Owner measure, r6 | 13.30 | 12.14 | 11.26 | 9.96 | 8.86 | 5.75 |
| Owner measure, current | 13.23 | 11.86 | 11.32 | 10.04 | 8.48 | 5.65 |

2025 is about 13% above KSE's preliminary in-scope total. KSE extrapolates non-filers from older data, while the
company reports for RBI, UniCredit, OTP and PepsiCo all show higher 2025 taxes.

## Biggest country effects, 2022–2026 (owner measure, EUR bn)

"Change" means the sum over 2022–2026 of the owner measure minus the 2018–2021 average grown at the global pre-war
company trend (`trend2.json`). The builder uses country trends where they are reliable, so its numbers will differ
a little. A minus sign means less tax went to Russia, so the effect points toward Ukraine.

| country | base 2018–21 | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) | change r6 | change current | cert. |
|---|---|---|---|---|---|---|---|---|---|
| DEU | 2.09 | 1.67 | 1.38 | 1.02 | 0.86 | 0.57 | −5.54 | −5.46 | B |
| CHN | 0.21 | 0.60 | 1.20 | 1.26 | 1.04 | 0.69 | +3.68 | +3.82 | B |
| USA | 2.50 | 2.59 | 2.51 | 2.07 | 1.91 | 1.28 | −2.79 | −3.06 | B |
| SWE | 0.58 | 0.31 | 0.16 | 0.09 | 0.07 | 0.04 | −2.39 | −2.39 | B |
| AUT | 0.30 | 0.84 | 0.88 | 0.80 | 0.88 | 0.50 | +2.33 | +1.96 | B |
| JPN | 0.99 | 0.90 | 0.75 | 0.69 | 0.59 | 0.40 | −1.89 | −2.00 | B |
| GBR | 0.71 | 0.77 | 0.46 | 0.37 | 0.27 | 0.18 | −1.68 | −1.68 | B |
| KOR | 0.53 | 0.38 | 0.21 | 0.22 | 0.19 | 0.13 | −1.67 | −1.67 | B |
| FRA | 1.14 | 1.02 | 0.97 | 1.00 | 0.84 | 0.56 | −1.58 | −1.58 | B |
| NLD | 0.45 | 0.52 | 0.38 | 0.28 | 0.21 | 0.14 | −0.86 | −0.86 | B |
| HUN | 0.03 | 0.08 | 0.16 | 0.23 | 0.29 | 0.18 | +0.76 | +0.72 | B |
| FIN | 0.21 | 0.13 | 0.07 | 0.05 | 0.05 | 0.03 | −0.75 | −0.49 | C |
| CHE | 0.35 | 0.49 | 0.36 | 0.27 | 0.12 | 0.08 | −0.34 | −0.24 | B |
| ITA | 0.36 | 0.44 | 0.49 | 0.49 | 0.51 | 0.28 | +0.29 | +0.21 | B |

The largest revisions are Austria (+0.37, toward Russia: Raiffeisen), Finland (−0.26: Fortum seized), Switzerland
(−0.10) and Japan (+0.10: JTI moved), the USA (+0.27: 2025 stayers), Italy (+0.09) and Hungary (+0.04). Germany's
two corrections, Unipro out and the Bundesbank uplift, roughly cancel (−0.08).

## What is guessed

The following are educated guesses:

- The CHN 2025–2026 factor.
- The US stayers' 2025 factor (1.35) and their 0.6 share.
- JTI 2022 (interpolated) and 2025 (follows the Swiss path).
- "Other Austrian firms" in 2021–2022.
- UniCredit 2026.
- Unipro's other taxes (set equal to its profit tax).
- Fortum's share of Finland.

Each of these has a wider range. Certainty letters are those of `companies_all.json`, except Austria (B), which is
now anchored on RBI's official figures.

## Overlaps

- **Replaces** `companies_all.json` and `round4a.json` `taxes` (split and history). Do not add the two together.
- **Exits** ([`company_flows.json`](company_flows.json)): exit contributions, discounts and seizures are counted
  there.
  - Here the taxes stop when a company is sold (KSE's exited-cohort weight f) or seized (Unipro and Fortum removed
    from May 2023).
  - Carlsberg/Baltika and Danone Russia, seized in July 2023 and sold in 2024, are in KSE's exited cohort with
    f = 0.45 (2023) and 0.25 (2024), close to their real ½ and ~0. No tax is added for seized assets, and no
    seizure value is counted here.
- **Dividends** of Russian-owned firms abroad (`company_flows` item 24) are a separate flow.
- **Banks**: the bank taxes here are not counted elsewhere as taxes.

## For the builder

- Read `countries[ISO3]`:
  - `profit_tax`, `other_taxes`, `all_taxes` and `owner_measure`, by year 2018–2026 as {low, central, high};
  - `base_2018_2021` for the pre-war level;
  - `certainty` and `basis`.
- **2026 is January–August already.** Do not apply `FRAC[5]` again.
- **2018–2020 are included per country.** `history_2018_2020_split` is no longer needed.
- The global growth trend applies as before. The `comparison` field is for checking only.
- The labels "KSE country figures" / "allocated" still hold. Add "company reports" for AUT, ITA, HUN and JPN.

## Open questions

- Japanese (BoJ), Austrian (OeNB) and Italian national data on direct-investment income from Russia were not found
  in usable form.
- Bundesbank 2025 reinvested earnings will come in the April 2026 edition. That edition was not found online.
- JTI and Philip Morris RAS accounts for 2024–2025 could not be reached because the Russian registries are blocked.
- Whether Lemana PRO and Auchan Russia are still French-controlled.
- A KSE country table with final 2025 data was not published by October 2026.
