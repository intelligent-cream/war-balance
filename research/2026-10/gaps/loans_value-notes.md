# Loans and guarantees: what they are really worth to Ukraine

Data: [`loans_value.json`](loans_value.json). Roadmap items 20 (economic value of loans) and 25 (multilateral support).

## The question

The map counts every loan and loan guarantee in the Kiel tracker at **face value** in the net shift. A loan has to be paid back, though, so EUR 1 lent is worth less than EUR 1 given. What Ukraine really gains is the **grant element**: the face value minus the present value of what Ukraine pays back (interest and principal), discounted at the rate Ukraine would otherwise have to pay to borrow.

- A 0% loan over 35 years is worth almost as much as a grant.
- A 5-year loan at a market rate is worth almost nothing.

Two things decide the answer:

1. **The loan's terms**: interest rate, maturity, grace period, and who pays the interest.
2. **The counterfactual rate**: what Ukraine would pay otherwise. Would the loan have happened anyway?

## Would the loan have happened anyway? Ukraine's counterfactual rate

| Period | Market evidence | What it means |
|---|---|---|
| 2021 (pre-war) | USD 1.25bn 8-year Eurobond at 6.875% (Apr 2021), USD 500m tap at 6.30% (Jul 2021) ([bne](https://www.intellinews.com/ukraine-issued-a-1-25bn-eight-year-eurobond-on-april-26-to-high-demand-209139), [Interfax](https://en.interfax.com.ua/news/economic/758134.html)) | the normal peacetime rate: about 6.3–7% in USD |
| 2022–Aug 2024 | Eurobonds at 20–35 cents after the Aug 2022 payment freeze ([ICU 15 Aug 2022](https://icu.ua/download/4149/ICUWeeklyInsight-20220815-Eng.pdf)), and at 24–31 cents in Dec 2023 ([ICU/Kyiv Post](https://www.kyivpost.com/amp/post/25810)): yields of 30–60%+ | **no market access**: no private lender would have lent. The realistic alternative was no loan at all (money printing, unpaid salaries) |
| Sep 2024 onwards | Restructuring of USD 20.5bn into step-up A/B bonds ([White & Case](https://www.whitecase.com/insight-alert/ukraine-concludes-historic-restructuring-us205-billion-international-bonds)): spreads of 1,000–1,500bp in Nov 2024, yields below 15% in Jan 2025, YTM 11–16% in Jan 2026 ([ICU 26 Jan 2026](https://icu.ua/download/8460/ICUWeeklyInsight-20260126-Eng.pdf)) | a secondary-market price, still no new issuance |

**Choice.** The wartime spot yields of 30–60% are not used. They price a haircut on old bonds (the 2024 restructuring cut the face value by 37%), not the cost of 35-year money. Discounting a 35-year loan at 40% would make every loan a near-grant. The rates used, per year of disbursement:

| Scenario | 2022 | 2023 | 2024 | 2025 | 2026 | Basis |
|---|---|---|---|---|---|---|
| low | 7% | 7% | 6% | 6% | 6% | "Normal" peacetime rate: the 2021 Eurobonds; OECD DAC rates for lower-middle income (7%) and, from 2024, upper-middle income (6%) countries ([OECD](https://www.oecd.org/en/topics/sub-issues/oda-eligibility-and-conditions/official-development-assistance-definition.html)) |
| central | 10% | 10% | 10% | 10% | 10% | A judgement at the bottom of the post-restructuring yields. 10% was the OECD DAC's old flat rate for its grant-element test; it is not a current IMF or OECD standard (round 11 audit: the IMF's debt-limits policy uses a unified 5% rate, [IMF](https://www.imf.org/en/Topics/sovereign-debt/debt-limits-policy); the DAC uses 6–9% by income group since the 2018 data) |
| high | 15% | 15% | 14% | 13% | 13% | Post-restructuring yields of 11–16% |

The low end is the owner's question "at what rate to Ukraine normally". The high end treats the loan as money nobody else would have lent.

## Loan terms by lender

All values are from Kiel Release 31's own terms columns (`loan_mat`, `loan_int`, `loan_gra`) plus the legal texts. Grant elements are shown as low / central / high for a 2023 disbursement.

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

| Lender | Face in map | Economic value low / central / high |
|---|---|---|
| EU institutions (incl. EIB) | 72.7 | 35.3 / 54.0 / 63.2 |
| Japan | 10.2 | 2.0 / 4.4 / 6.0 |
| Canada | 5.1 | 1.5 / 2.2 / 2.9 |
| UK | 4.4 | 0.7 / 1.7 / 2.5 |
| France (bilateral) | 1.0 | 0.30 / 0.44 / 0.58 |
| Poland (swap line) | 0.88 | 0 / 0.01 / 0.03 |
| Spain (bilateral) | 0.67 | 0.16 / 0.29 / 0.38 |
| all lenders | 96.5 | about 40 / 64 / 77 |

EU institutions by year (face → central): 2022 9.5 → 6.5; 2023 18.1 → 14.4; 2024 14.8 → 10.9; 2025 15.3 → 9.1; 2026 15.0 → 13.1.

**By country**, with the EU share by Kiel's budget key and the Support Loan over its 24 guarantors. The adjustment is the change to the net shift (central, with the range):

| Country | Face in map | Economic value (central) | Adjustment |
|---|---|---|---|
| Japan | 10.2 | 4.4 | −5.8 (−8.2 to −4.1) |
| Germany (EU share) | 16.9 | 12.5 | −4.4 (−8.7 to −2.3) |
| France | 15.1 | 10.9 | −4.1 (−7.9 to −2.2) |
| Canada | 5.1 | 2.2 | −2.9 (−3.6 to −2.2) |
| Italy | 10.4 | 7.6 | −2.7 (−5.3 to −1.4) |
| UK | 4.4 | 1.7 | −2.7 (−3.7 to −2.0) |
| Spain | 7.3 | 5.2 | −2.1 (−3.9 to −1.2) |
| Poland (incl. swap) | 3.8 | 2.2 | −1.6 (−2.4 to −1.2) |
| Netherlands | 3.8 | 2.7 | −1.1 (−2.0 to −0.6) |
| Sweden | 2.8 | 1.9 | −0.8 (−1.5 to −0.5) |

The US has no loans outside ERA, so it is unchanged.

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

**Biggest multilateral credits (central, 2022–26):** US 0.66, Japan 0.27, Germany 0.25, China 0.23, France 0.21, UK 0.18, Italy 0.17, India 0.10, Spain 0.10, Canada 0.10. Countries such as China, India, Brazil and Saudi Arabia get a small credit toward Ukraine purely by the shareholding rule. The builder may prefer to show multilateral credit as its own small part, or to leave it out for members that voted against or abstained.

## What is guessed

- The discount rate itself. This is the big lever, shown in the three scenarios.
- Whether the EU interest subsidy continues after 2027.
- The value of the Ukraine Support Loan (0.8–1.0). It depends on whether reparations, or the immobilised Russian assets, ever repay it. If the assets do, it becomes Russia's money like ERA, and the map's ERA rule would then apply.
- Terms not published: Germany KfW, France's Feb 2022 project loans, Spain's and Latvia's loans, EIB pricing.
- Private-guarantee factors (10/25/40%).
- EBRD's grant element and the 2026 EBRD volume.
- IMF 2025 disbursements (about USD 0.9bn).
- The IBRD "high" case allows USD 0.15bn/yr of own-risk increase that may be hidden by differences between approval and disbursement dates.

## Overlaps

- This file **re-values** loans that are already in Kiel at face value. Apply `net_adjustment_vs_face`; never add the economic value on top.
- The ERA exclusion is as in the map.
- The Support-Loan 24-guarantor split is already in `eu_level_share`, so do not repeat `apply_audit()`'s shift for these numbers.
- World Bank, EIB and donor trust funds are not double-credited (see above).
- Canada's and the Netherlands' IMF Administered Account loans are bilateral loans in Kiel, not IMF purchases.
- Export-credit guarantees (UKEF/Urenco, Spain 2026, Sweden, France) help the donor's own exporters, and `flowback.json` does not cover them.

## Open questions / for the builder

1. **The cost view.** Replace the flat `LOAN_GRANT_ELEMENT = 0.3` with the per-country ratio economic value / face from this file. Kiel guarantees and the 8.37bn military Support Loan are currently counted at face even in the cost view.
2. **A possible Kiel gap.** The World Bank lists a USD 841m Canadian PEACE guarantee, while Kiel has only EUR 36.5m for Canada. If it is confirmed missing, Canada would gain about EUR 0.8bn × 0.41.
3. **Unexplained IDA flows.** IDS reports IDA disbursements to Ukraine of USD 4.8bn in 2024, probably donor money routed through IDA-administered instruments. It is not credited here.
4. **Pre-war baseline.** The map has no pre-war baseline for aid. EU MFA lending before the war (about EUR 0.4bn/yr) is worth about EUR 0.16bn/yr, and could be subtracted (`prewar_baseline`).
