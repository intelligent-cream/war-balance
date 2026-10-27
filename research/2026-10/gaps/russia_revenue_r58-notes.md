# Russia's oil and gas income, 2019 – September 2026 (research, round 58)

Gathered on 2026-10-27. The data is in [`russia_revenue_r58.json`](russia_revenue_r58.json), built by [`scripts/russia_revenue_r58.py`](../scripts/russia_revenue_r58.py) (`fetch` keeps the extracts, `run` builds the JSON). Extracts with their address and date are in `raw/russia_revenue_r58/`. CREA comes from the copy already in the repository (`raw/crea_api/counter_month_country_fuel_2026-10-23.json.gz`). This is research only: nothing in `pipeline/` or `site/` reads it. **No one has reviewed it yet.**

## What is covered

| series | period | source | type |
|---|---|---|---|
| (a) federal budget oil and gas revenue ("нефтегазовые доходы"), monthly, RUB / EUR / USD | 2019-01 – **2026-09** | Minfin open data `fedbud_month` (data of 2026-10-09), fetched directly from minfin.gov.ru | official |
| (b) total federal revenue and the oil and gas share, monthly and yearly | same | same; years checked against Minfin `fedbud_year` | official |
| exchange rates | 2019-01 – 2026-10 | Bank of Russia official daily EUR and USD rates, simple monthly average | official |
| (c) CREA fossil-fuel export revenue, EUR, monthly, by fuel | 2021-01 – 2026-09 (October 2026 partial, to 22 Oct) | CREA Russia Fossil Tracker API | research |
| (c) IEA oil export revenue, USD | Jul–Sep 2026, plus Jun 2026 and Jul–Sep 2025 worked back from the stated changes | IEA Oil Market Report as reported by TASS | news citing IEA |
| (c) Bank of Russia balance-of-payments energy exports, USD | 2021 (2020 worked back) | cbr.ru "Экспорт энергетических товаров" | official |
| (d) "National defence" budget section | executed 2019–2021; budget-law plans 2023 (approximate), 2024–2026 | Minfin `fedbud_year`; Kommersant, Mediazona, T-Zh | official / news |
| (d) SIPRI military expenditure | 2019–2025 | SIPRI Milex workbook, April 2026 | research |

**Access.** minfin.gov.ru gave HTTP 503 on the first try and dropped the connection once later, but the open-data CSVs downloaded directly on 2026-10-27. **No mirror or news copy was needed for the budget series.** web.archive.org, budget.gov.ru, roskazna.gov.ru and economy.gov.ru could not be reached from here. iea.org returned 403, so IEA figures come from TASS. One CBR page refused the script and was read with a web-fetch tool instead.

## Headline figures (federal budget, Minfin)

| year | oil & gas revenue, RUB trn | EUR bn | USD bn | total revenue, RUB trn | oil & gas share |
|---|---|---|---|---|---|
| 2019 | 7.92 | 109.5 | 122.6 | 20.19 | 39.3% |
| 2020 | 5.24 | 64.6 | 73.4 | 18.72 | 28.0% |
| 2021 | 9.06 | 104.5 | 123.1 | 25.29 | 35.8% |
| 2022 | 11.59 | 161.9 | 169.5 | 27.82 | 41.6% |
| 2023 | 8.82 | 94.4 | 101.9 | 29.12 | 30.3% |
| 2024 | 11.13 | 111.3 | 120.5 | 36.71 | 30.3% |
| 2025 | 8.48 | 89.9 | 101.1 | 37.28 | 22.7% |
| 2026 Jan–Sep | 5.47 | 60.8 | 70.5 | 29.64 | 18.5% |

USD values are in the JSON (`og_rev_usd`). Euro and dollar totals are sums of the monthly conversions.

- In January–September 2026 oil and gas revenue was RUB 5.47 trn, 17.2% less than in January–September 2025 (RUB 6.61 trn).
- The latest month is **September 2026**: RUB 452.4bn (€4.6bn), 12.3% of that month's revenue. August 2026, at RUB 424.0bn, was the lowest month since January 2026.
- The highest month in the period was April 2022, with RUB 1.81 trn.
- Months jump because the additional income tax (НДД) is paid quarterly, in March/April, July and October. Damper payments to refiners are netted against the revenue and can make single months very low.

**CREA export revenue (all fossil fuels, EUR bn, calendar year):**

| year | total | without coal | budget oil & gas ÷ CREA without coal |
|---|---|---|---|
| 2021 | 237.3 | 216.0 | 0.48 |
| 2022 | 375.6 | 339.7 | 0.48 |
| 2023 | 244.8 | 220.9 | 0.43 |
| 2024 | 236.0 | 218.5 | 0.51 |
| 2025 | 193.3 | 175.8 | 0.51 |
| 2026 Jan–Sep | 160.2 | 145.4 | 0.42 |

**Defence, for context.**

- **Executed "National defence" section:** RUB 3.00 trn (2019), 3.17 trn (2020) and 3.57 trn (2021). Minfin's tables leave the line blank from 2022.
- **Budget-law plans:** about 6.4 trn for 2023 (derived), 10.78 trn for 2024, 13.5 trn for 2025 and 12.9 trn for 2026.
- **SIPRI (broader definition):** RUB 4.2 trn in 2019, then 7.15 trn (2022), 9.3 trn (2023), 13.8 trn (2024) and 16.0 trn (2025). In 2025 that was $190bn, 7.5% of GDP.

## What a "Russia's oil and gas income" page can show neutrally

These are facts with dates, each with its source line:

1. **The budget series (a)/(b).** Monthly and yearly, in roubles with euros alongside. Label it "Minfin, data published 2026-10-09; euros at Bank of Russia monthly average rates". Show the share of federal revenue, which fell from 39% in 2019 and 42% in 2022 to 23% in 2025 and 18.5% in January–September 2026. Say plainly that roubles are the official unit and that euro values depend on the exchange rate. The monthly average moved between 59 (July 2022) and 114 (March 2022) roubles per euro over the period.
2. **Export earnings (c).** Show CREA's monthly series by fuel as the export-side view. Show the IEA's oil-only figures as a check and say which months they cover. Do not mix the two in one total.
3. **Defence (d).** Show it as context only, with a clear label on each figure: "executed" for 2019–2021, "budget law" for 2023–2026, and SIPRI as a separate, broader line. A sentence such as "in 2025 federal oil and gas revenue (RUB 8.5 trn) was smaller than the planned national-defence section (RUB 13.5 trn)" is factual. Do **not** say that oil money "pays for" the army: budget money is pooled and not earmarked.
4. **Searches such as "who funds the Russian military".** The neutral answer is the structure of federal revenue (oil and gas vs VAT, profit tax and other revenue) plus deficit financing. It is not a list of countries. Buyers pay companies, and the state taxes production and exports. The budget data cannot be split by buyer country.

### How this relates to the site's measure, and why it is not the same

The site ranks countries by how much more (or less) Russia **kept from its trade with each country** compared with no war. That is a per-buyer, counterfactual, trade-value measure. The budget series is different in several ways:

- **Unit:** taxes received by the federal state, not export earnings. Roughly 0.42–0.51 of CREA's oil and gas export value showed up as federal oil and gas revenue in the same year. That ratio is only a rough bridge: the tax also falls on oil and gas sold at home, and part of the export value stays with companies and flows on through profit tax and dividends, which Minfin books as non-oil-gas revenue.
- **Not per country:** there is no split by buyer.
- **No counterfactual:** these are actual levels. A change from 2021 mixes prices, the rouble, volumes and Russian tax-rule changes: the 2023 move to Brent-minus-discount taxation, damper changes, the 2023–2024 MET and НДД changes, and the one-off windfall levy, which Minfin counts as non-oil-gas.
- **Do not add or subtract** these figures against the per-country "kept" figures. The most the page can honestly say is that the site's per-country figures are one input to the export earnings, which in turn feed the budget. The site already has export-side data (CREA, `crea.json`, `prices.json`, `windfall_band_r24.json`).

## Doubts

- **IEA and CREA disagree for September 2026.** TASS, citing the IEA, has oil revenue up $3.6bn to $17.67bn and Urals up $28.29 to $94.3/bbl. CREA has crude revenue down 8% month on month (EUR 339mn a day). The TASS price numbers also do not add up (62.02 + 28.29 ≠ 94.3). The IEA figures were read only through TASS and should be checked against the OMR itself before use.
- **2023 national-defence plan (~RUB 6.41 trn)** is worked back from Kommersant's "+68.2%". It was not stated directly.
- **Executed national defence for 2022–2025 is not public in Minfin's tables.** Planned figures understate execution (2024 was amended during the year). SIPRI is the only consistent series.
- **Mediazona's 2025 figure (RUB 13.5 trn)** was read through a search summary, not the page itself.
- **Monthly figures are differences of cumulative ones.** Revisions land in the month published. The 2022 total from months (27,824.4) differs from Minfin's annual figure (27,824.0) by rounding only, and oil and gas revenue matches exactly.
- **Bank of Russia rates** are the official rates. In March–May 2022 they differed from offshore market rates, which affects euro values for those months.
- **CREA October 2026 is partial** (to 22 October) and the latest days are revised upward. CREA prices pipeline gas at hub prices.

## Gaps

- **CBR balance-of-payments energy exports** stop after 2021. CBR stopped publishing the fuel breakdown, and 2019 was not obtained. Total goods exports are still published but were not taken.
- **IEA:** only Jun–Sep 2026 and Jul–Sep 2025. Earlier months would need the OMR (403 here) or a monthly news trawl.
- **KSE oil export revenue estimates** were not fetched.
- **Minfin's "Сведения о формировании и использовании дополнительных нефтегазовых доходов"** (`Svedeniya_20261005.xlsx`, base vs additional oil and gas revenue under the fiscal rule) was seen but not parsed.
- **SIPRI 2026** does not exist yet (next release April 2027). The national-defence figure after the 2026 budget amendments was not found.
