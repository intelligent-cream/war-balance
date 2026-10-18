# Roadmap

The work list for each data round. Round 6 is planned below; round 5 is done. Each item links to the limitation or method page it
changes. Status is updated as items are done; the [changelog](changelog.md) records what each finished item changed.

## Round 6 (planned 2026-10-18)

The main change of this round is a fairer way to count money that comes back from the war effort. The rest narrows
the ranges and closes data gaps.

### A. Two balances and one money rule (the main change)

**Principle.** Every country gets two balances:

- **with Ukraine**: what it gave (aid, refugees, extra purchases from Ukraine, donations) minus what it earned from the
  war effort (money spent in its economy for Ukraine, by anyone);
- **with Russia**: the change in money going to and coming from Russia.

The headline adds the two. A negative Ukraine balance is shown as its real number and means **net earning from the war
effort**, not money toward Russia.

**One rule for all money.** Money a country *pays out* (aid, payments to Russia) counts at full value: it leaves the
economy. Money a country *earns* (from the war effort, or from Russia) counts at the **value kept in its economy** (the
domestic share of the sale, from OECD trade-in-value-added data) **× how much of it is genuinely extra** (business that
would not exist otherwise: high for weapons production expanded for the war, lower for sales lost to Russia where firms
found other buyers). Both with ranges. This replaces the flat 20% profit used so far for flowback, sales to Russia,
services to Russia and shipping. The profit-only figures stay in the docs as a check.

| # | step | kind |
|---|---|---|
| A1 | **All-money ledger**: every euro that reached Ukraine (bilateral aid, EU and multilateral money, frozen-asset loans, private donations, Ukraine's own budget spent on weapons abroad), by what it paid for and the economy where it was spent; each euro assigned once | research |
| A2 | **Stock replacement**: purchases made to replace weapons given to Ukraine (e.g. the Netherlands buying new US systems), up to the donated value, not general rearmament | research |
| A3 | **Value kept**: domestic value-added share per seller and kind of good (OECD TiVA; defence industry studies) | research |
| A4 | **Genuinely extra**: for weapons (capacity built for the war, backlogs) and for sales to and from Russia (redirection to other buyers), per sector, with ranges | research |
| A5 | Builder: flowback from the ledger at value kept × extra; the same rule for sales to Russia, services to Russia and shipping; the Ukraine and Russia balances in `data.json` | code |
| A6 | Map: blue when the total is positive; orange when negative mainly because of Russia; **gold** when negative mainly because of earning from the war effort; a thin gold outline on blue countries whose Ukraine balance is negative; ochre flow lines from the war effort to earners | code |
| A7 | Country panel: two balance cards ("With Ukraine: gave X, earned back Y" and "With Russia"), then the total; How it works and docs explain the rule | code, docs |
| A8 | Comparison of every country before and after, shown to the owner before merging | check |

### B. Narrower, honest ranges

| # | step | kind |
|---|---|---|
| B1 | Measure the 90% range of the 2022–2026 total prediction error directly from the back-tests, instead of adding up yearly ranges | code |
| B2 | Own error bands for Russia's neighbours (Moldova, Kyrgyzstan, Tajikistan, Armenia, Georgia, Mongolia, Kazakhstan, Uzbekistan, Turkmenistan), tested on their own history | research |
| B3 | Moldova: Transnistria gas and whether 2021 is a fair starting point | research |
| B4 | Phone display: range as a pale band in the part's colour behind the bar; checked for readability in dark mode at phone width | code: done |

### C. Data gaps

| # | step | kind |
|---|---|---|
| C1 | A home for the EUR 3bn of Russian arms income with no known buyer | research |
| C2 | Laundered oil: Brunei's refinery (Russian crude, sold to Australia) and Russian fuel relabelled in Turkish ports | research |
| C3 | Shadow fleet: an evidence-based Russian share of tankers with opaque owners, per manager country | research |
| C4 | Iran: drones sent to Russia against Su-35s bought from Russia, counted once | research |
| C5 | Loan deferrals: Belarus counted net of Russia's new loans that repaid old ones; Viet Nam and Iraq labelled "blocked by sanctions, not the borrower's choice" | code: done |
| C6 | More evidence for the predictions of trade with Ukraine | research |
| C7 | Company taxes in Russia: richer data and more sources than KSE | research |
| C8 | Crypto and payment agents: any country split | done: agents' fees added ([trade.md](method/trade.md#payment-agents-round-6)) |
| C9 | Military support to Russia: more certainty (North Korea, Iran, Belarus, China) | done: North Korea and Iran now C ([aid-refugees-military.md](method/aid-refugees-military.md#round-6-revision)) |

### D. Finish

Integrate, update the docs and translations, a fresh review agent, the before/after comparison (A8), then merge into
`develop`. Nothing goes to `main` without the owner's "go live".

## Round 5 (done)

### Research

| # | item | what changes | status |
|---|---|---|---|
| 1 | Ukraine's own arms purchases abroad (also with donor cash, e.g. Dutch money for US weapons, the Czech ammunition initiative) | the seller's profit counts as money flowing back | done ([aid-refugees-military.md](method/aid-refugees-military.md#arms-ukraine-bought-abroad-round-5)) |
| 2 | Turkey's prices from Russian export data and tanker tracking | Turkey's payments to Russia and windfall | done ([energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#turkey-a-special-case)) |
| 3 | Belarus's re-exports to Russia moved to the countries that made the goods | Belarus, China, Türkiye, EU | done ([trade.md](method/trade.md#belarus-round-5)) |
| 4 | A Belarus-specific counterfactual tested on its own 2008–2021 history | Belarus's range | done for imports from Russia; range −58% to +19% ([counterfactual.md](method/counterfactual.md#belarus-round-5)) |
| 5 | Laundered oil per EU country from per-country studies | EU members, fuel hubs | done: customs-based per member ([energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#per-country-values-for-the-eu-usa-uk-and-australia-round-5)) |
| 6 | Shadow-fleet ownership and control | shipping profit by country | done: freight by real controller ([services-shipping-companies.md](method/services-shipping-companies.md#shipping)) |
| 7 | Refugee costs for more hosts; Poland's 2022 count | refugee hosts | done: Poland, Bulgaria, Croatia revised ([aid-refugees-military.md](method/aid-refugees-military.md#refugees)) |
| 8 | Newer 2026 trade data | fewer `*` estimates | done: 32 economies ([trade.md](method/trade.md#2026-refresh-round-5)) |
| 17 | Russian arms sales to other countries, against pre-war | new part: money to Russia | done ([russia-state-and-companies.md](method/russia-state-and-companies.md#weapons-bought-from-russia)) |
| 18 | Exit payments and forced discounts of companies leaving Russia | new part: money to Russia, by home country | done; seizures recorded, not counted ([russia-state-and-companies.md](method/russia-state-and-companies.md#companies-leaving-russia)) |
| 19 | Rosatom nuclear projects abroad: check whether payments are in trade or services; add if not | money to Russia | done: fuel already in trade; construction added ([russia-state-and-companies.md](method/russia-state-and-companies.md)) |
| 20 | Loans at their economic value: only the saving against what Ukraine would otherwise pay to borrow counts | aid from lenders | done ([aid-refugees-military.md](method/aid-refugees-military.md#loans-at-their-economic-value-round-5)) |
| 21 | Refugees at net cost: hosting cost minus taxes and contributions of working refugees | refugee hosts | done, floored at zero per country ([aid-refugees-military.md](method/aid-refugees-military.md#refugees)) |
| 22 | Latest Kiel tracker release for 2026 aid | 2026 aid | checked: release 31 is the latest and already used; ERA years fixed |
| 23 | Donated weapons at market value (value to Ukraine), not replacement or book value | military aid | done ([aid-refugees-military.md](method/aid-refugees-military.md#donated-weapons-at-market-value-round-5)) |
| 24 | Profits Russian-owned companies abroad send home (and trusteeships that stopped them) | money to Russia, by host country | done ([russia-state-and-companies.md](method/russia-state-and-companies.md#russian-owned-companies-abroad)) |
| 25 | World Bank, IMF, EBRD and EIB support credited to members by shareholding, valued as in 20 | aid | done ([aid-refugees-military.md](method/aid-refugees-military.md#loans-at-their-economic-value-round-5)) |
| 26 | Interest and repayments on Russia's state loans to other countries | money to Russia | done ([russia-state-and-companies.md](method/russia-state-and-companies.md)) |
| 27 | Pledged versus delivered aid: count delivered or firmly allocated aid only | aid | checked: the map counts allocations; guarantees now at economic value |

### Code

| # | item | status |
|---|---|---|
| 9 | Shared error between parts that come from the same data (totals' ranges) | done: measured correlations ([ranges.md](method/ranges.md#from-parts-to-a-total)) |
| 10 | Baltic and Finnish transit passed on to the final buyers | checked: buyers already record it; adding it would double count ([trade.md](method/trade.md#baltic-and-finnish-pass-through)) |
| 11 | One base year for all price indices | done: all 2019–2021 = 1 ([prices.md](method/prices.md#a-note-on-index-bases)) |
| 12 | Range lines in the country breakdown on phones | done: bars from zero, range lines with end marks |
| 13 | Split `data.json` so phones load faster | done: coverage notes load after the map (`detail.json`) |
| 14 | Chart label overlaps on narrow screens | done: bubble labels keep clear of the axis numbers |
| 15 | Translate the status line, source names and notes from the data | done: 135 data strings in all six languages (`tData()`) |
| 16 | Docs: record deliberate choices (actual figures as model inputs; 90% ranges as tested) | done ([counterfactual.md](method/counterfactual.md#deliberate-choices)) |

### Decided not to do

- **Wider ranges for Russia-side shocks.** The counterfactual's ranges stay at their tested 90% for normal periods.
  Stretching them for a rare Russia-side shock would blur the result more than it adds honesty, since the map already
  uses a real prediction rather than a flat 2021 level. See [method/counterfactual.md](method/counterfactual.md).
- **Pre-war forecasts as model inputs.** The counterfactual uses actual 2022–2026 GDP and trade: if a country's
  economy shrank because of the war, it would have traded less with Russia anyway, and that is not a choice the map
  should credit or blame.

## See also

- [limitations.md](limitations.md)
- [changelog.md](changelog.md)
- [Documentation index](README.md)
