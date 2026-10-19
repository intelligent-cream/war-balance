# Decisions: every modelling choice, why it was made, and its evidence

The map combines published data with modelling choices. This page lists every choice that changes a number: what was
chosen, why, what the alternative was, and where the data and evidence are. Data and choices are kept apart on purpose.
A figure taken from a statistics office is **data**. A rule for combining figures is a **decision**, and a
**decision** can be argued with even when every input is right.

The project was built with AI assistance (Claude) under one person's direction. The author set the question and
decided the choices below, many of them proposed or refined with Claude; the research files were compiled by AI
research agents with web search. **None of the inputs has yet been
checked line by line by a person.** The verification status of each input is in
[`verify_r11_aid.json`](../research/2026-10/verify_r11_aid.json) and
[`verify_r11_trade.json`](../research/2026-10/verify_r11_trade.json); the exact primary link behind every source is in
[`sources_r11.json`](../research/2026-10/sources_r11.json). Corrections are welcome as a GitHub issue or on Reddit
(u/Intelligent-Cream-14).

## 1. The question and the unit

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Measure **money moved toward Ukraine or toward Russia because of the war**, per country, 2022 to August 2026 | Aid totals alone hide that some donors kept paying Russia for energy, and that some aid was spent in the donor's own economy | Count aid only (Kiel Institute does this, and it is the better source for aid alone) | [overview](method/overview.md#the-core-idea-in-four-steps) |
| Show the total as **% of one year's GDP** (2024) | Lets small and large economies be compared; per person and total euros are one click away | Total euros (favours large economies) | GDP: World Bank WDI, IMF WEO ([sources](reference/sources.md)) |
| Compare with **what would have happened without the war**, not with zero | Buying less from Russia than before is money Russia did not get; buying the same as before is not new support | Compare with 2021 levels only | [counterfactual](method/counterfactual.md) |

## 2. Aid and the cost of hosting refugees

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Aid from the **Kiel Institute Ukraine Support Tracker** (bilateral allocations) | The most complete, item-level, peer-reviewed aid database | Pledges (overstate), national press releases (inconsistent) | [aid](method/aid-refugees-military.md#aid) |
| **EU-level aid** split over members by their share of the EU budget | Members pay for it; Kiel uses the same split | Leave it with "the EU" (hides members' share) | [EU-level aid](method/aid-refugees-military.md#eu-level-aid) |
| **Loans at their grant element** (10% discount rate, 6–15% range) | A loan that is repaid costs the lender less than a grant | Face value (overstates loans) | [loans](method/aid-refugees-military.md#loans-at-their-economic-value-round-5) |
| **Donated weapons at market value** (what they are worth to Ukraine), not the donor's book value | Old stock is often booked low or high; the value to Ukraine is what matters for the shift | Book value as reported | [weapons](method/aid-refugees-military.md#donated-weapons-at-market-value-round-5) |
| **Refugees at net cost**: hosting cost minus the taxes working refugees pay, floored at zero | Hosting is real support, but working refugees also pay taxes | Gross cost (overstates hosts with high employment) | [refugees](method/aid-refugees-military.md#refugees) |

## 3. Trade with Russia and Ukraine

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Trade from **customs data** (UN Comtrade, Eurostat), the reporter's own figures first, then partner (mirror) figures | Official, comparable across countries | Russian statistics (largely suspended since 2022) | [trade](method/trade.md#sources-and-filling-order) |
| **Purchases count at the seller's net gain**: Russia's taxes plus profit above a normal return, per product and year; the same for Ukraine | Aid is a gift; trade is an exchange, so only the seller's gain is comparable with aid (suggested by a reader) | Full price (treats trade like a gift) | [net-gain rule](method/overview.md#the-net-gain-rule-round-10) |
| **Sales to Russia count at the seller's income** (value kept × genuinely extra) | The seller gave up goods; only the extra income is a gain | Full sales value | [money rule](method/overview.md#the-money-rule-round-6) |
| **Freight taken out** of import values (CIF to FOB) | Freight is paid to shippers, not to Russia | Leave customs values as they are | [freight](method/trade.md#freight-cif-to-fob) |
| **Re-export hubs**: goods passed through the UAE, Armenia, Kazakhstan and others count for the country that made them | Otherwise the hub looks like the supplier | Count at the hub | [re-exports](method/trade.md#re-export-hubs) |

## 4. Energy

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| **War-time price premium counts in full**: payments minus the same volume at the prices markets expected before the invasion | The premium cost Russia nothing more to produce | Compare with 2019–2021 prices (overstates, prices were already rising) | [windfall](method/prices.md#war-time-windfall), [no-war prices](method/prices.md#no-war-prices-round-7) |
| **Gas counted where it is burned**, not where it crosses a border | Transit countries do not pay for gas they pass on | Customs data as recorded | [transit gas](method/energy-and-laundered-oil.md#transit-gas) |
| **Fuel refined from Russian crude** (e.g. Indian diesel) charged to the **final buyer**, at the measured share of the price that reaches Russia; the refiner keeps the rest and its discount profit | The buyer's demand creates the sale; the refiner chose the crude and keeps the discount | Charge the refiner; or ignore it | [laundered oil](method/energy-and-laundered-oil.md#laundered-oil), [crude share](method/energy-and-laundered-oil.md#valuing-and-capping) |

## 5. Money flowing back and Russia's state and companies

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| **Money flowing back**: aid spent in the donor's own economy (weapons built at home, replacing donated stock) is subtracted at value kept × genuinely extra | A donor's industry earns from it, so the donor's net cost is lower | Ignore it (overstates large arms producers) | [flowback](method/aid-refugees-military.md#flowback) |
| **Taxes companies still pay in Russia** count toward Russia (profit tax plus half of other taxes) | Taxes fund Russia's state | Leave out | [company taxes](method/services-shipping-companies.md#company-taxes) |
| **Profits Russian-owned companies abroad send home** count toward Russia | Money reaching Russian owners | Leave out | [Russian-owned companies](method/russia-state-and-companies.md#russian-owned-companies-abroad) |
| **The return Russia lost on its frozen reserves** counts toward Ukraine, for the holder countries | Holding them is a choice that denies Russia income | Count the frozen principal (it is not spent) | [frozen reserves](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| **Weapons and troops sent to Russia** (North Korea, Iran, Belarus) count toward Russia at market value | Direct military support | Leave out (no customs data) | [military support](method/aid-refugees-military.md#military-support-to-russia) |
| **Critical goods** (chips, machine tools) are a marker, not added | They are already inside the trade figures | Add them (counts twice) | [marker](method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7) |

## 6. Uncertainty

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Every part has a **likely range (about 90%)**, combined in quadrature | Most inputs are estimates; the no-war baseline is the biggest uncertainty | Single numbers (false precision) | [ranges](method/ranges.md) |
| A total takes the **weakest certainty letter** of its parts (A reported to D rough) | A total is only as reliable as its weakest part | Average letters | [certainty](method/ranges.md#certainty-letters) |
| Countries whose range crosses zero are **left out of top lists** | Even the direction is uncertain | Rank them anyway | [ranges](method/ranges.md) |
| **Nothing missing counts as zero**: gaps are estimated, with wide ranges | No country should rank well for having no data | Treat missing as zero | [README](README.md) |

## What is data and what is estimated

- **Reported data** (certainty A–B): aid (Kiel), customs trade, fossil fuel payments (CREA), GDP, refugee counts.
- **Estimates and models** (certainty C–D): the no-war baseline, net-gain shares, value kept, refugee costs outside
  27 hosts with budgets, laundered oil per buyer, shadow-fleet shipping, company taxes outside about 20 reporting
  countries, payment agents, remittance shares, military support to Russia, private donations, undisclosed aid.

Each part in a country's panel shows its certainty letter and numbered sources; the
[sources page](reference/sources.md) lists them, and [`sources_r11.json`](../research/2026-10/sources_r11.json)
gives the exact primary links.
