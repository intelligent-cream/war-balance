# Russia's federal budget balance and the National Wealth Fund, 2019 – September 2026 (research, round 59)

Gathered on 2026-10-27. The data is in [`russia_deficit_r59.json`](russia_deficit_r59.json), built by [`scripts/russia_deficit_r59.py`](../scripts/russia_deficit_r59.py). `fetch` keeps the extracts and `run` builds the JSON. Extracts, each with its address and date, are in `raw/russia_deficit_r59/`. Euro rates come from round 58's Bank of Russia extract (`raw/russia_revenue_r58/cbr_eur_rub_daily.csv`), which this round only reads. This round extends [`russia_revenue_r58`](russia_revenue_r58-notes.md), which covers revenue, the oil and gas share and defence. Defence is **not** repeated here: see `defence_yearly` in `russia_revenue_r58.json`. This is research only. Nothing in `pipeline/` or `site/` reads it. **No one has reviewed it yet.**

## What is covered

| series | period | source | type |
|---|---|---|---|
| Federal budget expenditure, revenue, balance and non-oil-gas balance, monthly, RUB and EUR | 2019-01 – **2026-09** | Minfin open data `fedbud_month` (data of 2026-10-09) | official, execution |
| Same, yearly | 2019–2025, plus 2026 Jan–Sep | sums of months, checked against Minfin `fedbud_year` | official, execution |
| GDP (nominal, RUB) | 2018–2025 | Rosstat, as republished in World Bank WDI `NY.GDP.MKTP.CN` (updated 2026-10-08) | official statistics |
| GDP 2026 | estimate | worked back from Minfin's "7.345 trn = 3.2% of GDP", about RUB 229.5 trn | derived |
| NWF (ФНБ) total and liquid assets, inflows and withdrawals, yuan and gold held | 1 Jan 2019 – **1 Oct 2026**, monthly | Minfin "Данные о движении средств … ФНБ" (`Dannye_20261001.xlsx`, published 14.10.2026) | official |
| 2026 budget law, the in-year plan, Minfin's September estimate, and the 2027–2029 law and draft | — | law 426-FZ, art. 1 (text via zakonrf.info); Interfax; Kommersant | law text / news citing Minfin |

**Access.** minfin.gov.ru and api.worldbank.org downloaded directly. rosstat.gov.ru failed TLS: its certificate chain is not trusted through this session's proxy, so Rosstat GDP comes through the World Bank copy. imf.org returned 403. government.ru, sozd.duma.gov.ru, budget.gov.ru and economy.gov.ru reset the connection. The law text was read on zakonrf.info, a private legal-database mirror, and checked against consultant.ru for the GDP assumption. Minfin's press-release pages render without their text when fetched, so the 2026 estimate and the 2027–2029 draft figures come from Interfax and Kommersant, which cite Minfin and the draft.

## Headline figures (execution, Minfin; GDP Rosstat)

Deficits are negative. Euro amounts are sums of monthly conversions at Bank of Russia monthly average rates.

| year | revenue, RUB trn | expenditure, RUB trn | expenditure, EUR bn | balance, RUB trn | balance, EUR bn | balance, % GDP | expenditure, % GDP | non-oil-gas balance, % GDP |
|---|---|---|---|---|---|---|---|---|
| 2019 | 20.19 | 18.21 | 252.9 | +1.97 | +26.5 | +1.8% | 16.6% | −5.4% |
| 2020 | 18.72 | 22.82 | 275.4 | −4.10 | −48.0 | −3.8% | 21.2% | −8.7% |
| 2021 | 25.29 | 24.76 | 285.9 | +0.52 | +5.5 | +0.4% | 18.4% | −6.3% |
| 2022 | 27.82 | 31.12 | 448.5 | −3.29 | −54.8 | −2.1% | 19.8% | −9.5% |
| 2023 | 29.12 | 32.35 | 354.0 | −3.23 | −40.4 | −1.9% | 18.6% | −6.9% |
| 2024 | 36.71 | 40.18 | 397.8 | −3.47 | −32.1 | −1.7% | 19.9% | −7.2% |
| 2025 | 37.28 | 42.91 | 455.8 | −5.63 | −59.0 | −2.6% | 20.0% | −6.6% |
| 2026 Jan–Sep | 29.64 | 34.83 | 384.1 | −5.19 | −57.9 | −2.3%* | 15.2%* | −4.6%* |

\* The 2026 shares divide nine months of figures by the **full-year** estimated GDP (about RUB 229.5 trn), which is Minfin's convention for in-year ratios. They are not annual rates.

- **Latest month: September 2026.** Expenditure was RUB 3.07 trn (€31.3bn) and the balance a surplus of RUB 614bn (€6.3bn). June, August and September 2026 each had a surplus. The cumulative deficit for 2026 peaked at RUB 6.40 trn after July. It stood at RUB 5.19 trn after September.
- **January–September comparison.** Expenditure was RUB 34.83 trn in 2026 against 30.42 trn in 2025 (+14.5%). The deficit was RUB 5.19 trn against 3.47 trn.
- **The largest single-month deficit** in the period was December 2022 (−RUB 4.04 trn). Spending is heavily weighted towards December in every year, and January is usually in deficit.
- **Yearly totals match Minfin's annual file** exactly for expenditure, and for the balance in all years except 2022 (−3,294.6 from the months against −3,295.0 annual, a rounding difference).

## 2026: law, plan and estimate (labelled; not execution)

| version | date | revenue | expenditure | deficit | deficit, % GDP | GDP assumed |
|---|---|---|---|---|---|---|
| **Budget law** 426-FZ, art. 1 | signed 28 Nov 2025 | 40.283 | 44.070 | 3.786 | 1.6% | 235.067 |
| **In-year plan**: "Электронный бюджет" spending plan, no amending law | 13 Jul 2026 (Interfax 15 Jul) | 40.283 | 45.11 | 4.828 | 2.1% (vs law GDP) | — |
| **Minfin estimate** published with the 2027–2029 draft | submitted 30 Sep 2026 | ≈41.2 | ≈48.6 | **7.345** | **3.2%** (stated) | ≈229.5 (implied) |
| *Execution, Jan–Sep* | Minfin data of 9 Oct 2026 | 29.64 | 34.83 | 5.19 | — | — |

All figures are RUB trn.

- The spring round of amendments to the budget law was skipped in 2026 (Interfax, 15 Jul 2026). A Budget Code amendment law signed on 26 June 2026 gave the government more room to change spending without amending the budget law (Interfax headline, and Finmarket as summarised by search).
- The estimate's revenue and expenditure are **worked back** from Kommersant's "2027 revenue +5% on the 2026 expectation, to 43.3 trn" and "expenditure +0.4%, to 48.8 trn". Search summaries of other outlets give about 41.2 and 48.5 trn. Only the deficit (7.345 trn, 3.2% of GDP) is quoted directly. Minfin also put the 2026 primary structural deficit at RUB 4.265 trn (1.8% of GDP).
- **2027–2029** are in the JSON (`plans.later_years`). Law 426-FZ planned 2027 and 2028 deficits of 3.19 and 3.51 trn. The draft submitted on 30 Sep 2026 has 5.44, 5.12 and 5.25 trn (2.2%, 1.9% and 1.9% of GDP) and expenditure of 48.8, 50.9 and 53.9 trn. It is a draft: the first Duma reading was scheduled for 29 Oct 2026.
- **Defence cross-reference** (round 58, not repeated here): the 2026 law planned about RUB 12.9 trn for "National defence" (T-Zh). Executed figures for 2022 onward are not in Minfin's tables. The debt-service line is also blank in the monthly file from 2022, so it is not included here.

## National Wealth Fund (Minfin)

**Liquid assets** are the NWF's funds on accounts at the Bank of Russia: yuan, gold and roubles, plus dollars, euros and pounds before they were run down. They equal the total minus "иные разрешенные активы" (VEB deposits, Sberbank and Aeroflot shares, company bonds). This matches Minfin's stated liquid figures on 1 Apr 2026 (RUB 3,889bn) and 1 Oct 2025 (RUB 4,165bn) exactly. Euro values use the Bank of Russia rate on the as-of date.

| as of | total, RUB bn | liquid, RUB bn | liquid, EUR bn | liquid, % GDP | withdrawals in the preceding year, RUB bn | yuan, bn | gold, t |
|---|---|---|---|---|---|---|---|
| 1 Jan 2019 | 4,036 | 2,356 | 30.6 | 2.3% (2018 GDP) | — | 0 | 0 |
| 1 Jan 2020 | 7,773 | 6,138 | 88.5 | 5.6% | 5 | 0 | 0 |
| 1 Jan 2021 | 13,546 | 8,658 | 95.4 | 8.0% | 294 | 0 | 0 |
| 1 Jan 2022 | 13,565 | 8,433 | 100.3 | 6.3% | 14 | 226.7 | 405.7 |
| 1 Mar 2022 | 12,935 | 9,738 | 93.2 | — | — | 226.8 | 405.7 |
| 1 Jan 2023 | 10,435 | 6,133 | 81.1 | 3.9% | 2,975 | 309.7 | 554.9 |
| 1 Jan 2024 | 11,965 | 5,012 | 50.5 | 2.9% | 3,461 | 227.3 | 359.0 |
| 1 Jan 2025 | 11,880 | 3,810 | 35.9 | 1.9% | 1,300 | 164.0 | 187.8 |
| 1 Jan 2026 | 13,415 | 4,085 | 44.4 | 1.9% | 0 | 209.2 | 160.2 |
| **1 Oct 2026** | **12,985** | **3,800** | **40.1** | 1.7%** | 459 (Jan–Sep 2026) | 184.4 | 131.7 |

\*\* 2026 liquid assets are divided by the estimated 2026 GDP of about 229.5 trn. Against the law's GDP (235.067 trn) the figure is 1.6%, the share reported by The Moscow Times on 7 Oct 2026.

- **Trend.** Liquid assets peaked at RUB 11.1 trn on 1 Apr 2020. They were about RUB 8.4–9.7 trn in early 2022 and fell to RUB 3.8 trn by 1 Oct 2026. The low since 2022 was RUB 2.84 trn (€31.9bn) on 1 Jun 2025. In euros the fall is from about €100bn (1 Jan 2022) to €40bn (1 Oct 2026). The total fund stayed between RUB 10.4 and 13.6 trn because non-liquid holdings rose from RUB 5.1 trn (1 Jan 2022) to RUB 9.2 trn (1 Oct 2026).
- **Withdrawals ("изъятия")** were RUB 2.97 trn in 2022, 3.46 trn in 2023, 1.30 trn in 2024 (all in December), none in 2025, and RUB 459bn in January–March 2026. Minfin's table does not say what each withdrawal was for. The 2027–2029 draft says the NWF will not be used to finance the deficit in 2027–2029 (Interfax). Kommersant says the fund is planned to grow by RUB 1.1 trn in 2027.
- **Statement, not data.** On 23 Sep 2026 Finance Minister Siluanov said the NWF would be replenished by RUB 0.6–1 trn over 2026 and that its liquid part could be about RUB 5 trn at the end of 2026 (Fontanka).
- **Currency mix at the Bank of Russia.** Dollar holdings went to zero by 1 Aug 2021. Euro holdings were €38.6bn on 1 Mar 2022, €51.6bn on 1 Jun 2022, €10.5bn on 1 Jan 2023 and zero from 1 Jan 2024. Gold peaked at 555 t on 1 Jan 2023 and was 132 t on 1 Oct 2026. Yuan holdings were 184 bn on 1 Oct 2026.

## How a page can show this neutrally

1. **Budget balance.** Show it yearly in roubles, with euros and % of GDP alongside. Label it "Minfin execution data of 9 Oct 2026; GDP Rosstat; euros at Bank of Russia monthly averages". Show 2026 as "January–September" and, separately, Minfin's full-year estimate, labelled "estimate (Sep 2026)".
2. **Plans against execution.** A small table (law → July plan → September estimate → execution to date) states the facts. For example: "The 2026 law set a deficit of RUB 3.79 trn (1.6% of GDP). In September 2026 Minfin estimated RUB 7.35 trn (3.2%). By the end of September the cumulative deficit was RUB 5.19 trn."
3. **NWF.** Show liquid assets as a line in RUB and EUR, with withdrawals as bars. The label should say that liquid means funds at the Bank of Russia, and that the remaining NWF assets are mostly domestic investments.
4. **Avoid** causal shorthand such as "oil pays for the war" or "the war drained the fund". Expenditure is pooled, the NWF table does not label what withdrawals were for, and deficits are financed mainly by domestic borrowing (OFZ). If defence is shown, use round 58's labelled figures and put them next to these as context only. The site's per-country "kept" figures are a different measure and should not be added to or set against these (see round 58).

## Doubts

- **2026 GDP is derived.** 7.345 / 0.032 gives 229.5 trn. Because 3.2% is rounded, the range is 228.0–231.1 trn. The law assumed 235.067 trn. Any 2026 % of GDP figure moves by about ±0.03 percentage points within that range, and by about 0.05 points if the law's GDP is used instead.
- **The 2026 estimate's revenue and expenditure** (≈41.2 and ≈48.6 trn) are back-calculated from rounded percentages, and the two do not quite add up to the deficit (41.24 + 7.345 = 48.58). Kommersant also says 2026 spending will exceed the law "by 3.5 trn", which would mean about 47.6 trn, against the ≈48.6 trn implied by its own +0.4% figure. The difference was not resolved. The official explanatory note to the 2027–2029 draft was not read (sozd.duma.gov.ru was unreachable).
- **Law text** was read on zakonrf.info, which labels the law "as amended 26.06.2026" in search results. Article 1 there still shows the original figures, consistent with Interfax's report that the spring amendments were skipped. It was not checked on pravo.gov.ru.
- **Monthly figures are differences of cumulative ones.** Revisions land in the month published. The H1 2026 deficit is −5,748.7 in the current data against Minfin's preliminary −5,731 (Interfax).
- **World Bank GDP equals Rosstat's** published figures. 2024 and 2025 may still be revised by Rosstat.
- **NWF liquid assets in 2022.** Funds held at the Bank of Russia in euros and pounds stayed in Minfin's liquid total after the February 2022 restrictions on the Bank of Russia's assets. How usable they were is not stated in the table. "Liquid" here follows Minfin's definition.
- **NWF % of GDP** in Minfin's table (`total_pct_gdp_minfin`) uses the GDP forecast in the budget law. The derived `liquid_pct_gdp` uses Rosstat GDP for the year of the as-of date (the previous year for 1 January dates), so the two are not on the same basis.
- **EUR rate for 1 Jan 2019:** round 58's rate extract starts on 10 Jan 2019, so that one NWF conversion uses the 10 Jan rate.

## Gaps

- Rosstat's own GDP files, IMF WEO and the Ministry of Economy forecast could not be reached. The 2026 GDP comes only from Minfin's ratio.
- The explanatory note to the 2027–2029 draft budget, with the official 2026 estimate table, was not read. Neither was a pravo.gov.ru copy of 426-FZ.
- Deficit financing (OFZ net borrowing, change in balances) is in the Minfin monthly file but was not extracted. Debt service and executed defence spending are blank from 2022.
- Minfin's monthly NWF press releases, which give the stated liquid volume, were checked for only two dates.
