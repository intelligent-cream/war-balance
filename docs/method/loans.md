# Loans: what a loan is really worth (round 12)

About EUR 96.5bn of the aid in the Kiel tracker is loans and loan guarantees (2022 to August 2026, not counting the
loans repaid from frozen Russian assets). A loan has to be paid back, so EUR 1 lent is worth less than EUR 1 given.
This page explains how the map values each loan, for Ukraine's gain (the net shift) and for the lender's cost (the
cost view). Round 12 replaced the flat 10% discount rate of round 5 with measured rates and measured expected losses,
on the owner's decision ([decision log](../decision-log.md#round-12-data-precision-19-october)).

Code: [`pipeline/loan_rates.py`](../../pipeline/loan_rates.py) (rates, losses, values per loan item) and
`apply_loans_value()` in [`build_data.py`](../../pipeline/build_data.py). Data:
[`loans_value.json`](../../research/2026-10/gaps/loans_value.json)
([notes](../../research/2026-10/gaps/loans_value-notes.md)); raw downloads in
[`raw/loan_rates`](../../research/2026-10/raw/loan_rates/).

## The two parts of the gift

The gift in a loan is the face value minus what the lender's claim is worth. It has two parts.

- **A. Cheaper interest.** Ukraine pays back less, or later, than it would on its own borrowing. The repayments are
  discounted at Ukraine's **normal rate**: what it paid on its US dollar bonds in 2021, before the war (6.875% in April,
  6.30% in July; 6.7% a year as the mean). Interest the EU budget or EU members pay for Ukraine counts here, because it
  lowers what Ukraine pays.
- **B. Default risk the lender really carries.** If the lender may not be repaid in full, the part it expects to lose
  is also a gift. This is the **expected loss** of the lender's creditor class, measured from what happened to each
  class (below).

So for each loan item: **gift = face × (1 − PV of Ukraine's repayments at 6.7% × (1 − expected loss))**.

No 2021 market yield of Ukraine's euro bond could be found, so 6.7% is used for loans in every currency. That
overstates the gift a little on euro and yen loans, where normal rates were lower.

## By loan type

Central values for a loan paid out in the year shown. "Gift" is the share of face value that counts toward Ukraine.

| loan type | creditor class | expected loss | evidence | gift (round 5, 10%) | gift now (central) |
|---|---|---|---|---|---|
| EU MFA+ 2023 (35 years, interest paid by members to 2027) | EU | 9% | not restructured; serviced. Its regulation sets no provisioning rate (budget headroom, [2022/2463](https://eur-lex.europa.eu/eli/reg/2022/2463/oj)), so the EU's usual 9% is kept | 0.80 | 0.67 |
| EU Ukraine Facility loans 2024–2026 | EU | 9% | as above: no provisioning rate set ([2024/792](https://eur-lex.europa.eu/eli/reg/2024/792/oj)) | 0.79 | 0.66 (2024) |
| EU emergency MFA 2022 (EUR 1.2bn) | EU | 9% | provisioned under [Regulation 2021/947](https://eur-lex.europa.eu/eli/reg/2021/947/oj), Article 31(5): 9% ([2022/313](https://eur-lex.europa.eu/eli/dec/2022/313/oj)) | 0.67 | 0.55 |
| EU exceptional MFA 2022 (EUR 1bn and EUR 5bn) | EU | **70%** | the EU set a 70% provisioning rate for these loans ([2022/1201](https://eur-lex.europa.eu/eli/dec/2022/1201/oj), [2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj)); it judged 9% "not adequate" | 0.64–0.77 | 0.84–0.89 (was 0.52–0.65 at 9%) |
| EIB loans: the EUR 1.59bn of repurposed ELM loans, 2022 | EU | **70%** | [2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj) "applies a 70 % provisioning rate to the repurposed ELM loans of EUR 1,59 billion" | 0.52 | 0.80 (was 0.40) |
| other EIB loans | EU | 9% | no provisioning rate of their own was found | 0.52 | 0.40 |
| EU Ukraine Support Loan 2026 | repaid only from reparations | about 0.95 | the legal text: "to be repaid by reparations due by Russia" | 0.95 | 0.95 (0.80–1.00) |
| IBRD loans backed by Japan, the UK, Sweden, Spain, Denmark, the Netherlands, Lithuania | World Bank | 0 | the World Bank is a senior creditor; it is paid first | 0.41 | 0.20 |
| Canada's loans through the IMF Administered Account | IMF | 0 | the IMF is a senior creditor; Ukraine keeps paying it | 0.44–0.45 | 0.30–0.31 |
| Japan JICA yen loans 2022 | bilateral (GCU) | 6% (the standstill) | Group of Creditors of Ukraine: payments deferred to 2030 | 0.75 | 0.63 |
| France Treasury, Germany KfW, Netherlands, Canada Sovereignty Bonds 2022 | bilateral (GCU) | 13–28% (the standstill) | as above | 0.26–0.55 | 0.29–0.48 |
| Korea Exim 2024 | bilateral (GCU) | 3% (the standstill) | as above | 0.62 | 0.49 |
| guarantees for lending to Ukrainian firms | the risk covered | 10% / 25% / 40% of face | **judgement**: no published war-risk premium was found to measure it | 0.25 | 0.25 |
| Poland's central-bank swap line | none | about 0 | repaid within months | 0.01 | 0.01 |

**The bilateral standstill.** In July 2022 the Group of Creditors of Ukraine (Canada, France, Germany, Italy, Japan,
Korea, the Netherlands, the UK and the US) suspended Ukraine's payments. The suspension was extended in December 2023
(to March 2027) and again on 16 April 2026: payments due up to February 2030, on debt paid out before 26 November 2025,
are deferred with the interest added to the debt, and repaid in equal instalments over 2035–2039. The map moves those
payments in each loan's cash flows. At Ukraine's normal rate, the delay costs the lender 3–28% of the loan's value,
more for loans with higher interest and earlier repayments. A final debt treatment is still to come; it is not measured,
so it is not in the central value (the cost view's high end allows for it, below).

## Why the promised war yield overstates the gift

In 2022 and 2023 Ukraine's long bonds traded at 15–50 cents per dollar: a promised yield of about 40% a year. The owner's
first idea was to discount loans at that rate, since it is what the market would have charged. At 40%, a 35-year loan
is almost a full gift (MFA+ 2023: 0.997).

But most of a 40% yield is **compensation for expected default**, not the price of time. Bond buyers expected to lose
much of their money, and they did: in September 2024 Ukraine cut its bonds' face value by 37%, a cut of about 60% in
present value at 14%. If Ukraine had borrowed at 40%, it would also have defaulted and paid back less. Official lenders
were in a different position: the IMF and World Bank are paid first; the EU's loans were left out of both debt
deals; the bilateral lenders only deferred payments. Charging their loans the bondholders' default compensation would
count a default risk they did not carry. So the central value splits the two: the normal rate for the time value (A),
and each class's own measured loss for the risk (B).

## The range

- **Low:** Ukraine's normal rate, and no expected loss for any official lender (no standstill either).
- **Central:** the normal rate, and each class's measured expected loss.
- **High:** the full promised war yield of the year the loan was paid out, as the owner first proposed. It already
  prices default, so no loss is added. The interest subsidies run for the loan's whole life.

The promised war yield is the yield of Ukraine's longest US dollar bonds, averaged over the year:

| year | promised yield | how it is measured | weeks |
|---|---|---|---|
| 2021 (normal rate) | 6.7% | the two 2021 bond sales (6.875%, 6.30%) | 2 issues |
| 2022 | 38.3% | ICU's weekly bond prices (from 7 March), turned into the yield of a long bond | 24 |
| 2023 | 40.3% | as above | 39 |
| 2024 | 23.6% | ICU's prices to March (old bonds) and Eavex's yields from October (new bonds) | 19 |
| 2025 | 16.7% | Eavex: the highest yield of the 2034–2036 bonds each week | 52 |
| 2026 | 14.7% | as above, to 19 October | 44 |

ICU reports prices, not yields, for the old bonds. The map turns each week's lowest price (the longest bond, as ICU's
own statements show) into a yield, using a long bond with a 6.75% coupon due in 2033. That bond reproduces ICU's own
price-yield statements within 1.5 points (21 cents = 37% in March 2022: 35.8%; 35 cents = 24%: 23.5%; 33 cents = 26%:
24.7%). The new bonds' yields averaged 11.7% (October–December 2024), 16.2% (2025) and 14.5% (2026); the yields of
the highest of the three long bonds give the high end above. Yields are semi-annual bond yields turned into annual
rates.

## The cost view

The cost view asks what the lender gave up. It now uses the same loan terms and the same expected losses, discounted at
the **lender's own funding rate** instead of Ukraine's:

- **EU loans:** the EU's reported cost of funding (Ukraine Facility 2.76%, MFA+ 3.15%, other MFA 2.54%; Council
  document 8202/26).
- **National loans:** the lender's 10-year government bond yield in the year of payout (OECD, through FRED).
- **IBRD guarantees:** the guarantor pays only if Ukraine stops paying the World Bank, which has not happened: 0.

The range uses the same expected losses at 0 (low), central and high: for EU loans the central is the provisioning
rate the EU set for that loan (70% for the 2022 exceptional MFA and the repurposed EIB loans, 9% otherwise) and the
high is 70%; bilateral lenders 60% high
(a final treatment like the bondholders' 60% present-value cut). This replaces the flat 26% of face
(`LOAN_GRANT_ELEMENT`) and its half-to-one-and-a-half band.

Over 2022–2026 the lender's cost of EUR 96.5bn of loans is about EUR 34bn (15–62); at 26% it was EUR 25bn. EU members
carry more (their EU loans cost about 45% of face, the Support Loan 95%); Japan, the UK and Canada carry less, because
IBRD guarantees and IMF-account loans cost the lender almost nothing.

## A worked example: EU MFA+ 2023, EUR 18bn

A 35-year loan, repaid from 2033, at the EU's funding cost (about 3%). EU members pay the interest to 2027 (low), to
2034 (central) or for the loan's life (high).

| | discount rate | interest paid for Ukraine to | expected loss | value of Ukraine's repayments | gift share | gift EUR bn |
|---|---|---|---|---|---|---|
| round 5 (old) | 10% | 2034 | 0 | 0.20 | 0.80 | 14.3 |
| low | 6.7% | 2027 | 0 | 0.48 | 0.52 | 9.3 |
| central | 6.7% | 2034 | 9% | 0.36 × 0.91 = 0.33 | 0.67 (A 0.64 + B 0.03) | 12.1 |
| high | 40.3% (2023 war yield) | the loan's life | 0 | 0.003 | 1.00 | 17.9 |
| lender's cost (central) | 3.15% | 2034 | 9% | 0.70 × 0.91 = 0.64 | 0.36 | 6.5 |

## New lending by the IMF and World Bank

The rise in the IMF's and World Bank's own lending to Ukraine over 2019–2021 is credited to their members by
shareholding, as its own part ("Share of new IMF, World Bank and EBRD lending"). Both are paid first and lend at close
to Ukraine's normal rate, so at 6.7% their loans are worth little to Ukraine: the IMF part falls from EUR 3.1bn
(round 5, at 10%) to 1.2bn (1.0–8.4), the World Bank part from 0.31bn to 0.15bn. Each round-5 band is moved by the
grant element of a matching loan at the new rate (an IMF loan of about 5% over 10 years, and the IBRD terms). The EBRD
and CEB parts use fixed factors that do not depend on the rate and are unchanged.

## Evidence

Every number above has a fetched source, also listed under `loans_value` in
[`sources_r11.json`](../../research/2026-10/sources_r11.json). Pages and small files are saved in
[`raw/loan_rates`](../../research/2026-10/raw/loan_rates/) (large PDFs are listed with their checksum in
[`MANIFEST.json`](../../research/2026-10/raw/MANIFEST.json)).

| what | number | source |
|---|---|---|
| normal rate, April 2021 | 6.875% | [Ukrinform, 27 Apr 2021](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html) |
| normal rate, July 2021 | 6.30% | [Interfax-Ukraine, 22 Jul 2021](https://en.interfax.com.ua/news/economic/758134.html) |
| bond prices 2022–2024 | 72 weekly price ranges | ICU Weekly Insight, e.g. [28 Mar 2022](https://icu.ua/download/4058/ICUWeeklyInsight-20220328-Eng.pdf) (21–34 cents = 37–427%), [18 Dec 2023](https://icu.ua/download/4446/ICUWeeklyInsight-20231218-Eng.pdf); all in `icu_weekly_eurobond_prices.json` |
| new bonds' yields 2024–2026 | 106 weekly tables | Eavex Capital Fixed Income Weekly, e.g. [22 Dec 2025](https://www.eavex.com.ua/wp-content/uploads/2025/12/eavex-fi-weekly-dec-22.pdf); all in `eavex_weekly_eurobond_ytm.json` |
| bondholders' loss in 2024 | 37% of face, about 60% of present value at 14% | [Government of Ukraine, 4 Sep 2024](https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha) |
| bilateral standstill terms | deferred to Feb 2030, interest capitalised, repaid 2035–2039 | [Government of Ukraine, 17 Apr 2026](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy); [French Treasury, 17 Apr 2026](https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement) (debt covered, members); [Government of Ukraine, 21 Dec 2023](https://www.kmu.gov.ua/en/news/ukraina-pidpysala-zminy-do-memorandumu-pro-vzaiemorozuminnia-shchodo-pryzupynennia-vyplat-za-ofitsiynym-borhom-z-mizhnarodnymy-partneramy-u-g7-ta-paryzkomu-klubi) (earlier extension to March 2027) |
| a final bilateral treatment is still to come | – | [IMF press release 26/66, 26 Feb 2026](https://www.imf.org/en/news/articles/2026/02/26/pr-26066-ukraine-imf-executive-board-approves-usd-8point1-billion-under-an-eff-arrangement) |
| IMF and World Bank are senior creditors | – | [Schlegl, Trebesch and Wright, NBER w25793](https://www.nber.org/papers/w25793) |
| Ukraine keeps paying the IMF | USD 279.7m in February 2026 | [Interfax, 6 Mar 2026](https://interfax.com/newsroom/top-stories/116503/) |
| EU provisioning for MFA loans | 9% normally; 70% for Ukraine in 2022 | [Legislative Observatory 2022/0213(COD)](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888) |
| the 2026 loan is repaid only from reparations | – | [Council document 5738/26](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf) |
| EU funding cost | 2.54–3.15% | [Council document 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf) (round 11) |
| lenders' bond yields | yearly means | [FRED, OECD 10-year yields](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01) (same series for each lender) |

**Not verified, so not used for numbers:**

- a 2021 market yield of Ukraine's EUR 4.375% bond (none found);
- war-risk guarantee premiums: a BDO guide says the cost of MIGA cover for Ukraine "is believed to be up to 1%", with
  no year or source; no premium for DFC or the EU Ukraine Investment Framework was found;
- Ukraine's full servicing record to the World Bank and the EU (no debt statistics page could be fetched; the IMF's
  staff reports block automated downloads);
- a report (bne IntelliNews) that Ukraine missed an IMF payment in January 2026; the site blocks downloads, and the
  NBU-based Interfax report above shows payments to the IMF in February 2026.

## What is still judgement

- The EU's expected loss uses the provisioning rate the EU set for each loan as a stand-in (70% for the 2022
  exceptional MFA and the repurposed EIB loans, 9% for the rest): no loss has happened. MFA+ and the Ukraine Facility
  have no provisioning rate of their own (they rest on budget headroom), so they keep the usual 9%. Decision B,
  round 12, the owner's choice ([decision log](../decision-log.md#round-12-data-precision-19-october)).
- The Ukraine Support Loan's 0.80 / 0.95 / 1.00: whether reparations, or the frozen Russian assets, ever repay it.
- Guarantees for lending to firms (10% / 25% / 40%), the swap line, near-market DFI loans.
- How the standstill repays (equal yearly instalments over 2035–2039, interest at the loan's rate in between).
- The USD normal rate for euro and yen loans.

**The audit's critique (round 13, documented, not changed).** An independent audit (19 October 2026) argues two points:

1. Ukraine's 2021 USD yield of 6.7% already contains a default premium of about 5 points over US Treasuries, so adding the creditor class's expected loss on top partly counts the same risk twice; for senior IMF and World Bank loans, discounting at 6.7% creates a gift the lender does not bear. The audit suggests a risk-free rate plus a normal spread in the loan's currency, with expected-loss scenarios on top.
2. The EU's provisioning rates (70%) are budget prudence, not loss forecasts; they should be the high case, not the central.

Effect on the headline is small (EU members +0.007 to +0.014 points of GDP). The owner kept decision B (provisioning rates as expected losses) and the 6.7% normal rate; both critiques are recorded in [decisions](../decisions.md#round-13-one-valuation-rule-for-every-seller). The method band on the map shows the result with loans at the war-time yield instead.

## See also

- [Aid, refugees, military support and flowback](aid-refugees-military.md#loans-at-their-economic-value-round-5)
- [Method overview: the cost view](overview.md#the-cost-view)
- [Decisions](../decisions.md#2-aid-and-the-cost-of-hosting-refugees)
- [Documentation index](../README.md)
