# Loans: what a loan is really worth

About EUR 96.5bn of the aid in the Kiel tracker is loans and loan guarantees (2022 to August 2026, not counting loans repaid from frozen Russian assets). A loan has to be paid back, so EUR 1 lent is worth less than EUR 1 given.

<figure class="md-fig" style="margin:0 0 14px" role="img" aria-label="Bar: of every euro lent to Ukraine, about 57 cents counts as a gift">
<svg viewBox="0 0 400 64" width="100%" style="max-width:440px;height:auto;display:block" font-size="11">
<text x="0" y="12" font-weight="700" style="fill:var(--ink)">EUR 1 lent to Ukraine, 2022–2026 (central)</text>
<rect x="0" y="22" width="228" height="26" style="fill:var(--ukr)"/>
<rect x="228" y="22" width="172" height="26" style="fill:var(--mid)"/>
<text x="8" y="39" style="fill:var(--on-accent)">gift to Ukraine: 57 cents</text>
<text x="236" y="39" style="fill:var(--ink)">to be repaid: 43 cents</text>
</svg>
</figure>

Details for developers: [cash flows, rates, sources and the evidence table](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/loans.md).

## The two parts of the gift

- **A. Cheaper interest.** Ukraine pays back less, or later, than on its own borrowing. Repayments are discounted at Ukraine's **normal rate**, what it paid on its dollar bonds in 2021 before the war: 6.7% a year. Interest the EU or its members pay for Ukraine counts here.
- **B. Default risk the lender really carries.** The part a lender expects to lose is also a gift: the **expected loss** of its class of lender, from what actually happened to each class.

So: gift = face value minus what Ukraine's repayments are worth, at 6.7%, after the expected loss.

## By loan type

| loan type | expected loss | gift per euro (central) |
|---|---|---|
| EU loans (MFA+ 2023, Ukraine Facility) | 9% | 0.66–0.67 |
| EU exceptional loans of 2022, repurposed EIB loans | 70% (the EU's own provisioning rate) | 0.80–0.89 |
| EU Ukraine Support Loan 2026 | about 95%: repaid only from reparations | 0.95 |
| World Bank and IMF-channel loans | 0: they are paid first | 0.20–0.31 |
| Bilateral loans (Japan, France, Germany, Canada, Korea) | 3–28%: payments deferred to 2030 | 0.29–0.63 |
| Guarantees for lending to Ukrainian firms | 10–40% (a judgement) | 0.25 |

In 2022 the G7 and Paris Club lenders suspended Ukraine's payments; in April 2026 payments up to 2030 were deferred to 2035–2039. A final debt treatment is still to come.

## Why the promised war yield overstates the gift

In 2022–2023 Ukraine's bonds traded at a promised yield of about 40% a year. At 40%, a 35-year loan is almost a full gift. But most of that yield was **compensation for expected default**, and bondholders did lose (a 37% cut in face value in 2024). Official lenders were in a different position: the IMF and World Bank are paid first, EU loans were left out of the debt deals, and bilateral lenders only deferred payments. So the central value uses the normal rate for time and each lender's own measured loss for risk; the war yield is the high end.

## The range

- **Low**: the normal rate, no expected loss.
- **Central**: the normal rate and each class's measured loss.
- **High**: the promised war yield of the year of payout (38% in 2022, 40% in 2023, 24%, 17% and 15% after).

## The cost view

What the lender gave up: the same terms and losses at the **lender's own funding rate** (the EU's 2.5–3.2%, national 10-year bond yields). Not shown on the site; kept in the full data download. The lenders' cost of the EUR 96.5bn is about EUR 34bn: EU members carry more, Japan, the UK and Canada less (World Bank guarantees cost them almost nothing).

## A worked example: EU MFA+ 2023, EUR 18bn

A 35-year loan repaid from 2033, with EU members paying the interest to 2034 (central). At 6.7%, Ukraine's repayments are worth 0.36 of face; after the EU's 9% expected loss, 0.33. The gift is 0.67 of face, EUR 12.1bn (low 9.3bn, high 17.9bn). The EU's own cost, at its 3.15% funding rate, is EUR 6.5bn.

## New lending by the IMF and World Bank

The rise in their own lending to Ukraine over 2019–2021 is credited to their members by shareholding. Both are paid first and lend close to Ukraine's normal rate, so their loans are worth little to Ukraine: the IMF part is EUR 1.2bn, the World Bank part 0.15bn.

## Evidence

Every number has a fetched source: Ukraine's 2021 bond sales, 72 weekly bond-price reports and 106 weekly yield tables, the debt-deal terms, and the EU's legal texts setting each loan's provisioning rate. The full table is in the developer reference.

## What is still judgement

- The EU's expected loss uses the provisioning rate it set per loan (70% or 9%), not an observed loss.
- The 2026 Support Loan's 0.80–1.00 depends on reparations.
- Guarantees for firms (10–40%); how the deferred bilateral debt is finally treated.
- The dollar rate of 6.7% is also used for euro and yen loans, which slightly overstates those gifts.
- Ukraine's 2021 rate already contains a default premium, so adding the expected loss partly counts the same risk twice. Either fix would move EU members by under 0.02 points of GDP.
