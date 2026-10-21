# Loans and guarantees: what they are really worth to Ukraine

Data: [`loans_value.json`](loans_value.json). Roadmap items 20 (economic value of loans) and 25 (multilateral support).

## The question

The map counts every loan and loan guarantee in the Kiel tracker at **face value** in the net shift. A loan has to be paid back, though, so EUR 1 lent is worth less than EUR 1 given. What Ukraine really gains is the **grant element**: the face value minus the present value of what Ukraine pays back (interest and principal), discounted at the rate Ukraine would otherwise have to pay to borrow.

- A 0% loan over 35 years is worth almost as much as a grant.
- A 5-year loan at a market rate is worth almost nothing.

Two things decide the answer:

1. **The loan's terms**: interest rate, maturity, grace period, and who pays the interest.
2. **The counterfactual rate**: what Ukraine would pay otherwise. Would the loan have happened anyway?

## Round 12: what the gift is, and the measured rates

Round 5 discounted every loan at a flat 10% (6–7% low, 13–15% high), a judgement. Round 12 replaced it with measured
rates and measured expected losses, on the owner's decisions. The values per loan item are made by
[`pipeline/loan_rates.py`](../../../pipeline/loan_rates.py), which rewrites this file's `ge` (and the new `cost`) for
every item from the existing terms; each item keeps its round-5 value as `ge_round5`. The method page is
[docs/method/loans.md](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-loans).

**How the owner decided.**

1. First choice: **opportunity cost at the real war rate**, the market yield Ukraine faced in the year of payout,
   wartime included (30–60% in 2022–2023). That is what the market would have charged, so it is consistent.
2. Caveat, raised by the owner: a wartime yield is a *promised* yield, and most of it is **compensation for expected
   default**. Bondholders did lose (37% of face, about 60% of present value in 2024). Official lenders did not bear that
   risk in the same way: the IMF and World Bank are paid first, EU loans were left out of both debt deals, and the
   bilateral lenders only deferred payments. At the war yield, long loans become near-full gifts (MFA+ 2023: 0.997).
3. Final method: **gift = (A) cheaper interest + (B) the default risk the lender really carries.** A discounts Ukraine's
   repayments at its **normal rate** (2021); B is the measured **expected loss** of the lender's creditor class. The
   war yield stays as the **high** end, because it is what the market would have charged.

**Per loan item:** gift = 1 − PV(Ukraine's repayments under the loan's terms, at the normal rate) × (1 − expected loss).

| scenario | discount rate | expected loss | EU interest subsidy to |
|---|---|---|---|
| low | normal rate, 6.7% | 0 for every official lender (no standstill either) | 2027 |
| central | normal rate, 6.7% | the class's measured loss (below) | 2034 |
| high | promised war yield of the payout year | 0 (the yield already prices default) | the loan's life |

**The rates.** All are semi-annual bond yields turned into annual rates (the grant element discounts once a year).

| year of payout | low and central | high (promised war yield) | how measured |
|---|---|---|---|
| 2022 | 6.7% | 38.3% | ICU Weekly Insight bond prices, 24 weeks from 7 March, turned into yields |
| 2023 | 6.7% | 40.3% | as above, 39 weeks |
| 2024 | 6.7% | 23.6% | ICU prices to March 2024 (old bonds, 9 weeks) and Eavex yields from 28 October (new bonds, 10 weeks) |
| 2025 | 6.7% | 16.7% | Eavex Fixed Income Weekly, the highest yield of the 2034, 2035 and 2036 bonds each week, 52 weeks |
| 2026 | 6.7% | 14.7% | as above, 44 weeks to 19 October |

- **Normal rate**: the mean of Ukraine's two 2021 US dollar bond sales, 6.875% on the new 8-year bond in April
  ([Ukrinform](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html))
  and 6.30% on its July tap ([Interfax-Ukraine](https://en.interfax.com.ua/news/economic/758134.html)). The owner asked
  for the rate in the loan's currency. No 2021 market yield of Ukraine's EUR 4.375% bond (due 2030) could be found, so
  the USD rate is used for every loan; this slightly overstates the gift on euro and yen loans. The low end uses the
  same rate: it strips out all war risk, which official lenders did not bear (the alternative, the post-restructuring
  yield, still holds the risk of a bond rated Ca/SD).
- **Old bonds (2022–March 2024)**: ICU states each week the range of prices of Ukraine's USD bonds. The lowest price is
  the longest bond (ICU's own statements: on 7 March 2022, 21–34 cents "corresponded to yields of 37–427%, depending on
  the maturity"; in April 2022, 35–46 cents = 24–80% and 33–43 cents = 26–88% for bonds due 2023–2033). Each week's
  lowest price is turned into a yield with a long bond: 6.75% semi-annual coupon, due 15 March 2033, fitted to those
  three ICU statements (it gives 35.8%, 23.5% and 24.7% against ICU's 37%, 24% and 26%). The 2022 August payment freeze
  is not modelled; after it, prices mainly reflect the expected recovery.
- **New bonds (from October 2024)**: Eavex's weekly table gives the price and yield to maturity of each restructured
  bond. The long Series A bonds (2034–2036) averaged 11.7% in October–December 2024, 16.2% in 2025 and 14.5% in 2026;
  the high end takes the highest of the three each week.
- 72 weekly ICU price ranges and 106 Eavex tables are in [`raw/loan_rates`](../raw/loan_rates/), with the address and
  checksum of each report.

**Expected loss by creditor class** (low / central / high; the high is used only in the cost view, since the high gift
uses the war yield):

| class | loans | expected loss | evidence |
|---|---|---|---|
| IMF | Canada via the IMF Administered Account | 0 / 0 / 0 | the IMF and World Bank are senior creditors ([Schlegl, Trebesch and Wright, NBER w25793](https://www.nber.org/papers/w25793): "multilateral institutions such as the IMF and World Bank are senior creditors"); Ukraine kept paying the IMF (USD 279.7m in February 2026, [Interfax](https://interfax.com/newsroom/top-stories/116503/)) |
| World Bank | IBRD loans backed by a donor's guarantee | 0 / 0 / 0 | as above; the guarantor pays only if Ukraine stops paying the IBRD. The gift is the IBRD rate's saving against the normal rate, credited to the guarantor as before |
| EU | MFA 2022, MFA+ 2023, Ukraine Facility, EIB | 0 / the EU's own provisioning rate per loan (Decision B: 70% for the 2022 exceptional MFA and the repurposed EIB ELM loans, 9% for the rest) / 70% | not in the 2024 bond restructuring (bonds only, [Government of Ukraine](https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha)) nor the bilateral standstill; serviced so far. Each loan's rate is the one in its legal text, see [Decision B](#decision-b-the-eus-own-provisioning-rate-per-loan-round-12). Provisioning is a prudent buffer, not an observed loss: a stand-in (certainty C) |
| Support Loan | EU Ukraine Support Loan 2026 | 0.80 / 0.95 / 1.00 (gift) | "a Ukraine Support Loan to be repaid by reparations due by Russia" ([Council 5738/26](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf)): the lender expects to lose almost all of it unless Russia pays |
| bilateral (Group of Creditors of Ukraine) | JICA, France, Italy, Germany KfW, the Netherlands, Korea Exim, Canada Sovereignty Bonds; other bilateral loans | central: the standstill in the cash flows; high: 60% | the MoU of 16 April 2026 ([Government of Ukraine](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy), [French Treasury](https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement)) defers payments due to February 2030 on debt paid out before 26 November 2025, with the interest capitalised, to equal instalments over 2035–2039 (members: Canada, France, Germany, Italy, Japan, Korea, the Netherlands, the UK, the US). At the normal rate this costs the lender 3–28% of the loan's value (JICA 6%, France 13%, Germany 13%, the Netherlands 14%, Canada's bonds 28%, Korea 3%). A "definitive debt treatment" is still to come ([IMF PR 26/66](https://www.imf.org/en/news/articles/2026/02/26/pr-26066-ukraine-imf-executive-board-approves-usd-8point1-billion-under-an-eff-arrangement)); the cost view's high end takes a loss like the bondholders' 60% present-value cut. No further haircut could be measured, so none is in the central value |
| guarantees for firms | EU Ukraine Investment Framework, UK Export Finance, Swedish, French, Austrian, Swiss, Canadian guarantees | 10% / 25% / 40% of face (gift) | **judgement**, unchanged: no war-risk guarantee premium could be measured (see Evidence) |
| swap line | Poland's NBP swap | 0 / 0.01 / 0.03 (gift) | repaid within months; judgement, unchanged |

Canada's and the Netherlands' loans through the IMF Administered Account: Canada's are treated as IMF loans (expected
loss 0), as the owner set out; the Netherlands' as a bilateral loan (in the owner's list of bilateral lenders, and the
Netherlands is a GCU member).

**The cost view** uses the same terms and expected losses, discounted at the lender's own funding rate: the EU's
reported cost of funding (Ukraine Facility 2.76%, MFA+ 3.15%, other MFA and EIB 2.54%, [Council
8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf)) and, for national lenders, the OECD
10-year government bond yield in the year of payout ([FRED](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01),
series `IRLTLT01xxM156N`, in `raw/loan_rates/fred`; Latvia, which has no series, uses the euro area's). IBRD guarantees
cost the guarantor its expected loss, 0. Each item has `cost` (low / central / high); each country
`loans_guarantees_lender_cost`. This replaces `LOAN_GRANT_ELEMENT` (26% of face) and answers open question 1 below.

## Loan terms by lender

All values are from Kiel Release 31's own terms columns (`loan_mat`, `loan_int`, `loan_gra`) plus the legal texts. The grant elements in this table are **round 5's** (10% central), low / central / high for a 2023 disbursement; the round-12 values per item are `ge` in the JSON (round 5's are `ge_round5`), and typical ones are on the [loans page](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how&sec=m-loans-by-loan-type).

| Lender / type | Face 2022–26 (EUR bn) | Terms | Grant element |
|---|---|---|---|
| EU emergency MFA 2022 (1.2) | 1.2 | 15y, EU funding cost about 1.25%, no subsidy | 0.52 / 0.67 / 0.80 |
| EU exceptional MFA Aug 2022 (1.0) | 1.0 | 25y, 10y grace, about 2% | 0.49 / 0.64 / 0.78 |
| EU exceptional MFA Oct–Dec 2022 (5.0) | 5.0 | 25y; interest paid by the EU budget in the MFF ([Decision 2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj) Art. 6) | 0.51 / 0.76 / 0.90 |
| EU MFA+ 2023 | 18.0 | 35y, repayment from 2033; interest paid by member states (GNI key) to end-2027 ([Commission](https://commission.europa.eu/strategy-and-policy/eu-budget/eu-borrower-investor-relations/mfa-programmes-including-ukraine_en), [ST-15232](https://data.consilium.europa.eu/doc/document/ST-15232-2022-ADD-1/en/pdf)) | 0.54 / 0.80 / 0.94 |
| EU Ukraine Facility loans 2024–26 | 25.6 | max 35y; borrowing-cost subsidy to 2027 ([Reg. 2024/792](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R0792) Art. 22–23) | 0.39–0.44 / 0.76–0.79 / 0.91–0.93 |
| EU Ukraine Support Loan 2026 | 11.6 (3.2 macro-financial + 8.37 defence window) | interest-free; repaid only if Russia pays reparations; interest paid by the EU budget, 24 members ([Liga](https://news.liga.net/en/economics/news/the-eu-has-agreed-on-90-billion-in-aid-for-ukraine), [Council](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf)) | 0.80 / 0.95 / 1.00 |
| EIB loans (in Kiel's EU row) | 3.0 | assumed about 25y, 5y grace, about 3% (cost-plus) | 0.36 / 0.52 / 0.68 |
| Japan JICA yen loans 2022 | 0.56 | 30y, 10y grace, 1% | 0.63 / 0.75 / 0.86 |
| Japan "guarantees": IBRD loans credit-enhanced by ADVANCE Ukraine | 9.6 | IBRD flexible loan, 25–33y, about 7y grace, SOFR path about 3.5% + about 1.2% spread ([World Bank](https://www.worldbank.org/en/brief/2026/04/13/world-bank-group-donor-financing-mechanisms-for-supporting-ukraine)) | 0.22 / 0.41 / 0.61 (0.13 at the 6% low from 2024) |
| UK guarantees on IBRD loans (PEACE, DPOs) | 3.9 | as above | as above |
| Canada via the IMF Administered Account 2022–24 | 4.7 | 10y, 4.5y grace, 1.5–1.69% | 0.33 / 0.45 / 0.60 |
| Canada Ukraine Sovereignty Bonds 2022 | 0.37 | 5y, 3.245% | 0.15 / 0.26 / 0.39 |
| France AFD/Treasury 2022 | 0.6 | 15y, 5y grace, 1.04% | 0.43 / 0.55 / 0.70 |
| Italy 2022 | 0.2 | 15y, 7.5y grace, 0% (HOME 2026: 30y, 0%) | 0.55 / 0.68 / 0.81 |
| Germany KfW SME credit 2022 | 0.3 | 15y, 5y grace; rate not public (1.5% assumed) | 0.39 / 0.53 / 0.68 |
| Netherlands 2022 | 0.2 | 10y, 4.5y grace, 3.64% | 0.20 / 0.34 / 0.51 |
| Korea Exim 2024 | 0.09 | 20y, 5y grace, 1% | 0.43 / 0.62 / 0.73 |
| Spain 2026 instruments for Spanish firms | 0.32 | tied export credit (assumed 15y, 3y grace, 2%) | 0.28 / 0.46 / 0.56 |
| Private-sector and export-credit guarantees (EU UIF 7.2, UKEF 0.47, Sweden, France, Spain/EBRD, Austria, Canada/EBRD) | about 8.6 | expected loss covered plus cheaper credit | 0.10 / 0.25 / 0.40 |
| Poland NBP swap line (USD 1bn) | 0.88 | liquidity line, repaid within months | 0 / 0.01 / 0.03 |
| ERA loans (US 18.3, EU 18.1, Canada 3.26, UK 2.65, Japan 1.58) | excluded | repaid from Russian assets | not counted, as in the map |

**EU interest subsidy after 2027.** The legal texts guarantee it only to end-2027. The MFA+ declaration says it "should be renewed".

- Low: Ukraine pays the EU funding cost (about 3%) from 2028.
- Central: the subsidy runs to 2034, through the next MFF.
- High: the subsidy runs for the loan's whole life.

**Guarantees.** For IBRD loans that exist only because a donor guarantees them (Japan, UK, Netherlands, Sweden, Denmark, Lithuania, Spain), the guarantor is credited with the grant element of the IBRD loan. Without the guarantee, IBRD's exposure limit would have ruled the loan out. The guarantor's own expected cost (the expected loss) is lower, since IBRD is a preferred creditor.

Other guarantees cover lending to Ukrainian firms: EU Ukraine Investment Framework, UK Export Finance (Urenco nuclear fuel), Swedish and French export credits. These are valued at 10/25/40% of face, which stands for the expected war-risk loss covered plus cheaper credit (certainty C–D).

## Sensitivity to the discount rate (disbursed in 2023)

| Loan type | 3% | 5% | 7% | 10% | 15% | 30% |
|---|---|---|---|---|---|---|
| EU MFA+ (subsidy to 2027 only) | 0.11 | 0.37 | 0.54 | 0.70 | 0.84 | 0.96 |
| EU MFA+ (subsidy for the loan's life) | 0.48 | 0.65 | 0.76 | 0.86 | 0.94 | 0.99 |
| IBRD loan enabled by a guarantee | 0 | 0.03 | 0.22 | 0.41 | 0.61 | 0.82 |
| IMF EFF (about 5%, 10y) | 0 | 0 | 0.11 | 0.25 | 0.43 | 0.71 |
| Canada via the IMF account | 0.11 | 0.23 | 0.33 | 0.45 | 0.60 | 0.83 |

At 3% (roughly the EU's own funding cost, i.e. the lender's view), an EU loan is worth little unless the interest is subsidised. In the lender's view, the real gift is the interest subsidy plus the default risk taken on. The IMF/World Bank convention of 5% would make IMF and IBRD loans worth about zero.

## Results: bilateral and EU loans and guarantees (EUR bn, 2022–2026)

Round 12 values; round 5's are in brackets where they help. Economic value is Ukraine's gain (net shift); lender's cost
is the cost view.

| Lender | Face in map | Economic value low / central / high | Lender's cost low / central / high |
|---|---|---|---|
| EU institutions (incl. EIB) | 72.7 | 36.2 / 49.4 / 66.8 (before Decision B: 47.3 central; round 5: 35.3 / 54.0 / 63.2) | 14.0 / 32.4 / 58.9 (before Decision B: 28.6) |
| Japan | 10.2 | 2.2 / 2.2 / 7.9 (2.0 / 4.4 / 6.0) | 0 / 0 / 0.3 |
| Canada | 5.1 | 1.5 / 1.6 / 4.2 (1.5 / 2.2 / 2.9) | 0.5 / 0.5 / 0.8 |
| UK | 4.4 | 0.8 / 0.9 / 3.2 (0.7 / 1.7 / 2.5) | 0.05 / 0.12 / 0.19 |
| France (bilateral) | 1.0 | 0.29 / 0.39 / 0.70 | 0.08 / 0.14 / 0.53 |
| Poland (swap line) | 0.88 | 0 / 0.01 / 0.03 | 0 / 0.01 / 0.03 |
| Spain (bilateral) | 0.67 | 0.17 / 0.19 / 0.45 | 0.06 / 0.07 / 0.28 |
| all lenders | 96.5 | about 42 / 55 / 85 (before Decision B: 53; round 5: 40 / 64 / 77) | about 15 / 34 / 62 (before Decision B: 30; round 11: 25 at 26% of face) |

EU institutions by year (face → central): 2022 9.5 → 7.5 (5.3 before Decision B); 2023 18.1 → 12.2; 2024 14.8 → 9.2; 2025 15.3 → 7.8; 2026
15.0 → 12.8.

**By country**, with the EU share by Kiel's budget key and the Support Loan over its 24 guarantors. The adjustment is the
change to the net shift (central, with the range):

| Country | Face in map | Economic value (central, range) | Adjustment | Lender's cost (central, range) |
|---|---|---|---|---|
| Japan | 10.2 | 2.2 (2.2–7.9) | −7.9 (−8.0 to −2.3) | 0.0 (0.0–0.3) |
| Germany (EU share) | 16.9 | 11.0 (8.4–15.6) | −5.9 (−8.5 to −1.4) | 6.6 (3.2–13.7) |
| France | 15.1 | 9.6 (7.3–13.7) | −5.5 (−7.7 to −1.4) | 5.7 (2.8–12.0) |
| Italy | 10.4 | 6.7 (5.1–9.5) | −3.7 (−5.2 to −0.9) | 4.1 (2.0–8.3) |
| Canada | 5.1 | 1.6 (1.5–4.2) | −3.5 (−3.6 to −0.9) | 0.5 (0.5–0.8) |
| UK | 4.4 | 0.9 (0.8–3.2) | −3.5 (−3.6 to −1.2) | 0.1 (0.0–0.2) |
| Spain | 7.3 | 4.5 (3.5–6.5) | −2.8 (−3.8 to −0.8) | 2.7 (1.3–5.7) |
| Poland (incl. swap) | 3.8 | 1.9 (1.5–2.7) | −1.9 (−2.3 to −1.1) | 1.2 (0.6–2.4) |
| Netherlands | 3.8 | 2.4 (1.8–3.5) | −1.4 (−2.0 to −0.3) | 1.4 (0.7–2.9) |
| Sweden | 2.8 | 1.7 (1.3–2.4) | −1.1 (−1.5 to −0.3) | 1.0 (0.5–2.0) |

The US has no loans outside ERA, so it is unchanged. Japan falls most: its IBRD guarantees save Ukraine only the gap
between the IBRD's rate (about 4.7%) and Ukraine's normal rate (6.7%), and cost Japan almost nothing.

## Multilateral lending (item 25)

**Already credited to donors in Kiel, so not credited again:**

- World Bank operations backed by donor guarantees: Japan's ADVANCE Ukraine (USD 12.5bn of promissory notes, USD 10.6bn of IBRD loans signed) and the UK, Netherlands, Sweden, Denmark, Lithuania and Spain guarantees.
- Donor trust funds: PEACE grants (US USD 26bn), URTF, FREE.
- F.O.R.T.I.S. (the US ERA money).
- EIB lending: it sits in Kiel's EU row. Source: [World Bank, financing mobilized, 30 Sep 2026](https://www.worldbank.org/en/brief/2026/05/31/world-bank-emergency-financing-package-for-ukraine).

**What is left** is the increase over the pre-war level (2019–21) of each institution's own-risk lending, × its grant element, credited to members by their share of capital. Ukraine, Russia and Belarus are excluded, because they did not choose this support. About 7% of IMF capital, held by small members, stays unassigned.

| Institution | Pre-war level | Wartime | Value 2022–26 (EUR bn) low / central / high |
|---|---|---|---|
| IMF | USD 0.93bn/yr purchases (2019–21) | 2.69 (2022), 4.46, 5.32, about 0.9 (2025), 2.2 (2026 to Jul) ([IDS](https://api.worldbank.org/v2/sources/6/country/UKR/series/DT.DIS.DIMF.CD/counterpart-area/WLD/time/all?format=json), [Govt of Ukraine](https://www.kmu.gov.ua/en/news/mvf-zatverdyv-pershyi-perehliad-novoi-prohramy-eff-ukraina-otrymaie-blyzko-690-mln-dolariv)); rate = SDR + margin + surcharges, about 5% (about 4% after the Nov 2024 reform, [NBU](https://bank.gov.ua/en/news/all/protsentni-plateji-ukrayini-za-kreditami-mvf-znizyatsya--fond-pereglyanuv-politiku-dodatkovih-styagnen)); EFF repaid in 4.5–10 years | 0.90 / 3.14 / 5.19 |
| World Bank | IBRD USD 0.75bn/yr | IBRD 2.15 / 4.89 / 4.85 (2022–24), but almost all of the increase is donor-guaranteed: own-risk lending stayed at about USD 0.4bn/yr. Only the USD 1bn "IDA on IBRD terms" (2022–23) counts | 0.16 / 0.31 / 0.73 |
| EBRD | EUR 1.1bn/yr | 1.7 / 2.1 / 2.4 / 2.9, plus about 2.0 in 2026; EUR 3.4bn of the 9.1bn is donor-backed ([EBRD](https://www.ebrd.com/home/news-and-events/news/2026/ebrd-2025-finance-for-ukraine-rises-to-a-record.html)); grant element 0.05/0.15/0.30 (market-based margins, but Ukrainian firms had no other access) | 0.06 / 0.36 / 1.01 |
| CEB | none (member since Jun 2023) | EUR 813m approved ([CEB](https://coebank.org/en/project-financing/ceb-and-ukraine/our-projects-in-ukraine/)); 60% disbursed, about half EU/Italian-guaranteed | 0.04 / 0.12 / 0.22 |
| NIB | none found | no NIB sovereign lending to Ukraine found; Nordic money goes through NEFCO and trust funds that are already in Kiel | 0 |

**Capital shares used** (approximate, rounded; `shares_used` in the JSON holds them after the exclusions):

| Country | IMF quota | IBRD | EBRD | CEB |
|---|---|---|---|---|
| USA | 17.4% | 16.9% | 10.0% | – |
| Japan | 6.5% | 7.7% | 8.5% | – |
| China | 6.4% | 6.0% | 0.1% | – |
| Germany, France, Italy | 5.6 / 4.2 / 3.2% | 4.3 / 3.9 / 2.6% | 8.5% each | 16.7% each |
| UK | 4.2% | 3.9% | 8.5% | – |
| EU + EIB | – | – | 6.0% (split by EU budget share) | – |

Sources: [IMF quotas](https://www.imf.org/en/About/executive-board/members-quotas), [IBRD voting table](https://thedocs.worldbank.org/en/doc/a16374a6cee037e274c5e932bf9f88c6-0330032021/original/IBRDCountryVotingTable.pdf), [EBRD shareholders](https://www.ebrd.com/shareholders-and-board-of-governors.html), CEB financial statements. Certainty B for the shares, C for the values.

**Round 12.** The IMF and World Bank values move with the new rates: each round-5 band is multiplied by the grant
element of a matching loan at the new rate over that at the round-5 rate (an IMF loan fitted to the sensitivity row
below: 10 years, 4 years' grace, 5%; and the IBRD terms). Both lend at close to Ukraine's normal rate, so at 6.7% their
loans are worth little: IMF 0.9 / 3.1 / 5.2 → 1.0 / 1.2 / 8.4; World Bank 0.16 / 0.31 / 0.73 → 0.14 / 0.15 / 1.04. The
round-5 values are kept as `value_by_year_round5`. EBRD and CEB use fixed factors that do not depend on the rate and are
unchanged.

**Biggest multilateral credits (central, 2022–26, round 12):** US 0.28, Germany 0.13, Japan 0.12, France 0.11, Italy
0.10, UK 0.09, China 0.09, Spain 0.06, Canada 0.05 (round 5: US 0.66, Japan 0.27, Germany 0.25, China 0.23, France 0.21,
UK 0.18, Italy 0.17, India 0.10, Spain 0.10, Canada 0.10). Countries such as China, India, Brazil and Saudi Arabia get a small credit toward Ukraine purely by the shareholding rule. The builder may prefer to show multilateral credit as its own small part, or to leave it out for members that voted against or abstained.

## What is guessed

- The EU's expected loss (the provisioning rate the EU set per loan, 70% high): a stand-in; no loss has happened.
- Whether the EU interest subsidy continues after 2027 (2027 / 2034 / the loan's life).
- The value of the Ukraine Support Loan (0.8–1.0). It depends on whether reparations, or the immobilised Russian assets,
  ever repay it. If the assets do, it becomes Russia's money like ERA, and the map's ERA rule would then apply.
- How the bilateral standstill repays (equal yearly instalments over 2035–2039; interest at the loan's rate in between),
  and whether a final treatment cuts the debt (the cost view's high end assumes 60%).
- The USD normal rate for euro and yen loans (no euro yield found).
- Terms not published: Germany KfW, France's Feb 2022 project loans, Spain's and Latvia's loans, EIB pricing.
- Private-guarantee factors (10/25/40%), the swap line and near-market DFI loans.
- EBRD's grant element and the 2026 EBRD volume; IMF 2025 disbursements (about USD 0.9bn).
- The IBRD "high" case allows USD 0.15bn/yr of own-risk increase that may be hidden by differences between approval and
  disbursement dates.

## Evidence

Every number in the loan tables has a fetched source, listed under `loans_value` in
[`sources_r11.json`](../sources_r11.json). Small pages and files are saved in [`raw/loan_rates`](../raw/loan_rates/)
(PDFs are listed with their checksum in [`MANIFEST.json`](../raw/MANIFEST.json)).

| what | number | source | status |
|---|---|---|---|
| normal rate | 6.875% (Apr 2021), 6.30% (Jul 2021) | [Ukrinform](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html), [Interfax-Ukraine](https://en.interfax.com.ua/news/economic/758134.html) | fetched |
| old bond prices and ICU's price-yield statements | 72 weeks, 2022–2024 | ICU Weekly Insight, e.g. [28 Mar 2022](https://icu.ua/download/4058/ICUWeeklyInsight-20220328-Eng.pdf), [15 Aug 2022](https://icu.ua/download/4149/ICUWeeklyInsight-20220815-Eng.pdf), [18 Dec 2023](https://icu.ua/download/4446/ICUWeeklyInsight-20231218-Eng.pdf) | fetched (all 72) |
| new bond yields | 106 weeks, Oct 2024–Oct 2026 | Eavex Fixed Income Weekly, e.g. [22 Dec 2025](https://www.eavex.com.ua/wp-content/uploads/2025/12/eavex-fi-weekly-dec-22.pdf); list of reports from the site's [media index](https://www.eavex.com.ua/wp-json/wp/v2/media?search=fi-weekly&per_page=100) | fetched (all 106) |
| 2024 restructuring | 37% of face; about 60% of present value at 14% | [Government of Ukraine, 4 Sep 2024](https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha) | fetched |
| bilateral standstill | to March 2027 (Dec 2023); to Feb 2030, repaid 2035–2039, interest capitalised (Apr 2026) | [Government of Ukraine, 21 Dec 2023](https://www.kmu.gov.ua/en/news/ukraina-pidpysala-zminy-do-memorandumu-pro-vzaiemorozuminnia-shchodo-pryzupynennia-vyplat-za-ofitsiynym-borhom-z-mizhnarodnymy-partneramy-u-g7-ta-paryzkomu-klubi), [17 Apr 2026](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy); [French Treasury](https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement) | fetched |
| definitive bilateral treatment still to come | – | [IMF PR 26/66](https://www.imf.org/en/news/articles/2026/02/26/pr-26066-ukraine-imf-executive-board-approves-usd-8point1-billion-under-an-eff-arrangement) | fetched (web fetch; the site blocks plain downloads) |
| seniority of the IMF and World Bank | – | [Schlegl, Trebesch and Wright, NBER w25793](https://www.nber.org/papers/w25793); the abstract also finds bilateral official debt "junior, or at least not senior" to private debt | fetched (abstract) |
| servicing record to the IMF | USD 279.7m repaid in February 2026 | [Interfax, 6 Mar 2026](https://interfax.com/newsroom/top-stories/116503/) | fetched |
| EU provisioning | 9% usual, 70% for Ukraine 2022 | [Legislative Observatory 2022/0213(COD)](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888) | fetched |
| Support Loan repaid from reparations | – | [Council 5738/26](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf) | fetched |
| lender funding rates | EU 2.54–3.15%; national 10-year yields | [Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf) (round 11); [FRED](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01) | fetched |

**Not verified, so not used for numbers:**

- a 2021 market yield of Ukraine's EUR bond: none found;
- war-risk guarantee premiums: a BDO guide says MIGA cover for Ukraine "is believed to be up to 1%", with no year or
  source; no DFC or Ukraine Investment Framework fee was found;
- the IMF's debt sustainability analysis and its treatment of official and commercial creditors, and Ukraine's full
  servicing record to the World Bank and the EU: the IMF's staff reports and the Ministry of Finance's pages block
  automated downloads;
- a bne IntelliNews report that Ukraine missed an IMF payment in January 2026 (the site blocks downloads; the Interfax
  report above shows Ukraine paying the IMF in February 2026);
- the bne IntelliNews page on the April 2021 bond (the source in round 5) blocks downloads; Ukrinform gives the same 6.875%.

## Overlaps

- This file **re-values** loans that are already in Kiel at face value. Apply `net_adjustment_vs_face`; never add the economic value on top.
- The ERA exclusion is as in the map.
- The Support-Loan 24-guarantor split is already in `eu_level_share`, so do not repeat `apply_audit()`'s shift for these numbers.
- World Bank, EIB and donor trust funds are not double-credited (see above).
- Canada's and the Netherlands' IMF Administered Account loans are bilateral loans in Kiel, not IMF purchases.
- Export-credit guarantees (UKEF/Urenco, Spain 2026, Sweden, France) help the donor's own exporters, and `flowback.json` does not cover them.

## Open questions / for the builder

1. **The cost view.** Done in round 12: each item has its lender's cost (`cost`), each country `loans_guarantees_lender_cost`, used by `apply_loans_value()` instead of `LOAN_GRANT_ELEMENT`.
2. **A possible Kiel gap.** The World Bank lists a USD 841m Canadian PEACE guarantee, while Kiel has only EUR 36.5m for Canada. If it is confirmed missing, Canada would gain about EUR 0.8bn × 0.41.
3. **Unexplained IDA flows.** IDS reports IDA disbursements to Ukraine of USD 4.8bn in 2024, probably donor money routed through IDA-administered instruments. It is not credited here.
4. **Pre-war baseline.** The map has no pre-war baseline for aid. EU MFA lending before the war (about EUR 0.4bn/yr) is worth about EUR 0.16bn/yr, and could be subtracted (`prewar_baseline`).

## Decision B: the EU's own provisioning rate per loan (round 12)

The owner chose the EU's own provisioning rate as the lender's expected loss for each EU loan, instead of the usual 9%
for all of them. In 2022 the EU judged 9% "not adequate" for Ukraine ([Legislative Observatory
2022/0213(COD)](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888)). Each legal text was fetched on
2026-10-19 from the Publications Office (`publications.europa.eu/resource/celex/<CELEX>`, the Official Journal text;
eur-lex.europa.eu blocks automated access) and read. The low (0) and the high (the war yield; 70% in the cost view) do
not change. Code: `EU_PROVISIONING` and `EU_PROVISIONING_ITEM` in `pipeline/loan_rates.py`.

| loan (Kiel ids) | face, EUR bn | legal text | what it says | central expected loss | gift (central), before → after | lender's cost (central), before → after |
|---|---|---|---|---|---|---|
| emergency MFA 2022 (EUF1_1, EUF1_2) | 1.2 | [Decision (EU) 2022/313](https://eur-lex.europa.eu/eli/dec/2022/313/oj); [Regulation (EU) 2021/947](https://eur-lex.europa.eu/eli/reg/2021/947/oj), Article 31(5) | loans "provisioned, where required, in accordance with Regulation (EU) 2021/947"; that sets "9 % for the Union's macro-financial assistance" | 9% | 0.55 → 0.55 | 0.235 → 0.235 |
| exceptional MFA, EUR 1bn (EUF3_1) | 1.0 | [Decision (EU) 2022/1201](https://eur-lex.europa.eu/eli/dec/2022/1201/oj), recital 13 and the operative text | "the provisioning rate of 70 % shall apply instead of the general rule" | **70%** | 0.522 → 0.842 | 0.160 → 0.723 |
| exceptional MFA, EUR 5bn (EUF4_1-3) | 5.0 | [Decision (EU) 2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj), Article 11 and recital 14 | "a provisioning rate of 70 % shall apply"; 9% paid in, the rest covered by member states' guarantees of up to 61% | **70%** | 0.654 → 0.886 | 0.318 → 0.775 |
| EIB: repurposed ELM loans (EIF3_1) | 1.59 | [Decision (EU) 2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj), recitals and the operative text on covered ELM liabilities | "applies a 70 % provisioning rate to the repurposed ELM loans of EUR 1,59 billion" | **70%** | 0.395 → 0.801 | 0.038 → 0.683 |
| other EIB loans (EIF1_1 and 2023-2025 items) | 1.45 | none found | the 70% covers ELM loans disbursed after 15 July 2022; these items could not be matched to it | 9% kept | 0.395 → 0.395 | unchanged |
| MFA+ 2023 (EUF5_1-11) | 18.0 | [Regulation (EU) 2022/2463](https://eur-lex.europa.eu/eli/reg/2022/2463/oj) | "No provisioning for the loans under this Regulation shall be constituted ... no provisioning rate ... shall be set" (budget headroom) | 9% kept | 0.674 → 0.674 | unchanged |
| Ukraine Facility loans 2024-2026 | 25.6 | [Regulation (EU) 2024/792](https://eur-lex.europa.eu/eli/reg/2024/792/oj) | the same: no provisioning, no rate (budget headroom). Its 70% rate is for the Ukraine Guarantee (Pillar II guarantees), not for these loans | 9% kept | unchanged | unchanged |
| Ukraine Support Loan 2026 | 11.6 | [Council 5738/26](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf) | "to be repaid by reparations due by Russia"; no provisioning rate | fixed gift 0.80 / 0.95 / 1.00, unchanged | unchanged | unchanged |

Why 9% is kept where the law sets no rate: MFA+ and the Ukraine Facility are backed by the EU budget's headroom, so the
EU set aside nothing for them and named no rate. No other EU rate applies to them, so the usual MFA rate (9%) stays as
the stand-in, as before.

Effect: EU-level loans are worth EUR 49.4bn to Ukraine instead of 47.3bn (low and high unchanged), and cost the EU
EUR 32.4bn instead of 28.6bn. All loans: 55bn instead of 53bn; lender's cost 34bn instead of 30bn. Only the 27 EU
members move, by +0.007 to +0.014 points of GDP (net shift) and +0.013 to +0.026 (cost view).

Not changed, but found: the Ukraine Facility's 70% provisioning rate for the Ukraine Guarantee (Pillar II) would apply to
the EU guarantees for lending to firms (class `guarantee_private`, Kiel EUF6_*, EUF10_1, EUF10_4, EUF7_6...), which keep
the judgement values 10% / 25% / 40%. Decision B covers loans only.
