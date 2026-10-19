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

To follow one money flow (loans, oil, refugees, weapons...) from its sources through these decisions to the map, see
[trace.md](trace.md): one entry per flow, with links to the rows below. Why each flow is counted at all, and why this
way, is under [Why each money flow is counted](#why-each-money-flow-is-counted).

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
| **Loans at their gift to Ukraine**: cheaper interest, discounted at Ukraine's measured 2021 rate (6.7%), plus the default risk the lender really carries (the measured expected loss of its creditor class); range: no expected loss (low) to the promised war yield of the year of payout (high). Round 12, the owner's choice; round 5 used a flat 10% (a judgement) | A repaid loan is worth less than a grant. The owner first chose opportunity cost at the real war rate (30–60% in 2022–2023). But that yield is mostly compensation for expected default, which official lenders did not bear (the IMF and World Bank are paid first; EU loans were left out of both debt deals; bilateral lenders only deferred), so it overstates the gift. It is kept as the high end, since it is what the market would have charged | Face value (overstates loans); a flat 10%; the war yield as the central value (near-full gifts) | [loans](method/loans.md) |
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
| **Money flowing back**: aid spent in the donor's own economy (weapons built at home, replacing donated stock) is subtracted at the seller's net gain × genuinely extra (value kept until round 12) | A donor's industry earns from it, so the donor's net cost is lower | Ignore it (overstates large arms producers) | [flowback](method/aid-refugees-military.md#flowback) |
| **Taxes companies still pay in Russia** count toward Russia (profit tax plus half of other taxes) | Taxes fund Russia's state | Leave out | [company taxes](method/services-shipping-companies.md#company-taxes) |
| **Profits Russian-owned companies abroad send home** count toward Russia | Money reaching Russian owners | Leave out | [Russian-owned companies](method/russia-state-and-companies.md#russian-owned-companies-abroad) |
| **The return Russia lost on its frozen reserves** counts toward Ukraine, for the holder countries | Holding them is a choice that denies Russia income | Count the frozen principal (it is not spent) | [frozen reserves](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| **Weapons and troops sent to Russia** (North Korea, Iran, Belarus) count toward Russia: unpaid deliveries at market value, paid ones (also in kind) at the seller's net gain since round 13 | Direct military support; a paid delivery is a sale | Leave out (no customs data) | [military support](method/aid-refugees-military.md#military-support-to-russia) |
| **Critical goods** (chips, machine tools) are a marker, not added | They are already inside the trade figures | Add them (counts twice) | [marker](method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7) |

## 6. Uncertainty

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Every part has a **likely range (about 90%)**, combined in quadrature | Most inputs are estimates; the no-war baseline is the biggest uncertainty | Single numbers (false precision) | [ranges](method/ranges.md) |
| A total takes the **weakest certainty letter** of its parts (A reported to D rough) | A total is only as reliable as its weakest part | Average letters | [certainty](method/ranges.md#certainty-letters) |
| Countries whose range crosses zero are **left out of top lists** | Even the direction is uncertain | Rank them anyway | [ranges](method/ranges.md) |
| **Nothing missing counts as zero**: gaps are estimated, with wide ranges | No country should rank well for having no data | Treat missing as zero | [README](README.md) |

## Why each money flow is counted

Nine money flows on the map had no row here saying why they are counted, and why this way. The reasons below were
written down from what was actually said when each flow was added: in the method pages, the research notes, the code
comments, the commit history and the project conversation. Who raised each point follows the
[decision log](decision-log.md): **(owner)** is the project's author, **(proposed, accepted)** means Claude suggested it
and the owner agreed, **(audit)** an independent review, **(reader)** a Reddit commenter. Where no reason was given
for a choice, the row says **reason not recorded**; nothing has been filled in after the fact.

### Undisclosed military aid

Toward Ukraine, in the net shift and the cost view. Added in round 1–2 (commit `532eb77`); France corrected by the
second audit in round 3–4 (`3888f03`). Method: [undisclosed aid](method/aid-refugees-military.md#undisclosed-aid-and-private-donations).
Research: [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §3,
[audit2-notes](../research/2026-10/gaps/audit2-notes.md) §3. Log:
[round 1–2](decision-log.md#round-12-the-question-and-the-first-map-17-october),
[round 3–4](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count military aid that governments did not publish**, beyond what the Kiel tracker records | judgement: the values are estimates (certainty C–D) | Hidden help to Russia is estimated, so undisclosed weapons for Ukraine need the same treatment: "without both, the picture leans one way" (proposed, accepted). A known gap left at zero would reward missing data: "no country gets rewarded for no data" (owner) | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §3 |
| **Only amounts beyond Kiel Release 31**: Germany's 2025–2026 appropriations above what Kiel records, Italy's later decrees, France's 2024 gap, small Greek amounts | data where a budget or official total exists (Germany's EUR 11.6bn appropriated for 2026, France's official totals); judgement in the yearly split and the ranges | Anything Kiel already holds would count twice. France's 2022–23 gap was already in Kiel, which adopted France's official EUR 2.6bn in Release 16, so it was taken out (France −1.3bn); Germany's estimate was checked and does not overlap (audit) | [audit2-notes](../research/2026-10/gaps/audit2-notes.md) §3, `apply_audit2()` |
| **Left out**: US intelligence and covert support; Bulgaria's secret 2022 deliveries; Türkiye's deliveries; the frozen-asset part of France's 2024 total (about EUR 0.3bn) | judgement | Intelligence and covert support have no value to put on them; Bulgaria's and Türkiye's deliveries were commercial sales (Bulgaria's reportedly paid by the US and UK), not their aid; the map leaves Russia's own money out elsewhere | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §3, [audit2-notes](../research/2026-10/gaps/audit2-notes.md) §3 |
| **Check 8** warns when undisclosed aid exceeds half of a country's Kiel military aid | judgement | reason not recorded | [method](method/aid-refugees-military.md#undisclosed-aid-and-private-donations) |

### Energy switching cost and oil discount

Cost view only. Both added in round 1–2 (commit `532eb77`, research `energy.json`); the oil discount was corrected in
round 7 (`c765e84`). Method: [energy premium and oil discount](method/energy-and-laundered-oil.md#energy-premium-and-oil-discount),
[the cost view](method/overview.md#the-cost-view). Research: [energy-notes](../research/2026-10/gaps/energy-notes.md),
[energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) §3. Log:
[round 1–2](decision-log.md#round-12-the-question-and-the-first-map-17-october),
[round 7](decision-log.md#round-7-what-the-owner-asked-to-add-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **The extra price paid to replace Russian energy counts as a cost the country carried** | judgement (the rule) | Without it, a country that stopped buying Russian gas shows only "less money to Russia", not the price it paid (proposed). The owner asked for "how much does it cost the country to not buy Russian oil and buy alternatives ... the cost of sanctions ... the opportunity cost" (owner) | [log](decision-log.md#round-12-the-question-and-the-first-map-17-october) |
| **In the cost view only**, not in the net shift | judgement | The cost view is "what the country gave up, not where money went" | [overview](method/overview.md#the-cost-view) |
| **Displaced volume × replacement share × price gap**, per fuel and month: gas at TTF minus Russia's contract price; crude and coal at the midpoint of the pre-war price gap and the full discount forgone | data: CREA volumes and realised prices, Eurostat replacement shares, TTF, Brent and coal prices; judgement: the midpoint for crude and coal, the low-case replacement shares | Replaces a flat 25% of the value no longer bought; the owner asked for real values with margins of error (owner). Weighting by month catches the 2022 gas cut-off at peak prices. For oil the "Russian price" is ambiguous: the full discount forgone overstates the cost, the pre-war gap understates it, so the middle is the midpoint | [energy-notes](../research/2026-10/gaps/energy-notes.md), method and caveats |
| **The price gap is against the same year's Russian price, not the no-war price** (checked and kept in round 7) | judgement | That is the cost of choosing another supplier. Against the no-war price it would add the war-time price spike, which was paid to other suppliers and would have been paid without switching | [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) §3 |
| **The discount gained on Russian oil is subtracted** in the cost view | judgement (the rule) | India, China and Türkiye save money by buying cheap Russian oil: "a gain for them, the reverse of the switching cost Europe pays, so it belongs in their cost view" (proposed, accepted) | [log](decision-log.md#round-12-the-question-and-the-first-map-17-october) |
| **Discount = tonnes × (Brent − Russia's realised price) × 0.671**, from March 2022 | data: CREA realised prices, Brent; 0.671 is the median of published estimates (ICRA, Banque de France, Reuters) | Published estimates come out at 0.49–0.84 of the gross price gap, because they are net of freight and compare with other suppliers' delivered prices | [energy-notes](../research/2026-10/gaps/energy-notes.md), method §2 |
| **Without Russia's normal pre-war discount** (factors 0.56–0.79 a year) | data: Russian crude sold at 0.948 of Brent in 2021 | About 5% of the discount existed before the war and would have existed without it (proposed; the owner left the remaining energy questions to Claude's recommendation). India 33.8 → 24.1bn, China 24.9 → 18.1bn | [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) §3, `apply_nowar_prices()` |
| **Not counted twice with the windfall** | rule | The windfall covers what was still bought from Russia, the switching premium what was replaced. The discount gain and the windfall see the same discount in different views | [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) §3 |
| **Left out**: households' and industry's energy subsidies; new infrastructure such as floating LNG terminals | judgement | Subsidies "are costs of the war, not money toward Ukraine or Russia" (proposed, accepted, round 7). Infrastructure: reason not recorded | [energy-notes](../research/2026-10/gaps/energy-notes.md), caveats |

### Services and tourism

Both directions, in the net shift; income lost on services also in the cost view. Added in round 1–2 (commit
`532eb77`, research `uncovered.json`); pre-war trends in round 3 (`105f35e`); the money rule in round 6 (`eef967d`);
relocants' spending out in round 7 (`bca0255`); Russia's net gain in round 10 (`109b8eb`), measured in round 11
(`7079676`). Method: [services](method/services-shipping-companies.md#services). Research:
[uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §1,
[relocants-notes](../research/2026-10/gaps/relocants-notes.md),
[narrow-notes](../research/2026-10/gaps/narrow-notes.md). Log:
[round 1–2](decision-log.md#round-12-the-question-and-the-first-map-17-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count services traded with Russia** (transport, business services, tourism) both ways, against the expected no-war level, like goods | data: Eurostat, OECD-WTO BaTiS, Bank of Russia | Only goods were counted, so tourism and services sold to Russia were missing (proposed, accepted); gaps are estimated rather than left out (owner). Countries that stopped selling services to Russia move toward Ukraine; those that sell more, mainly to Russian tourists, move toward Russia | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §1 |
| **Bought from Russia: at Russia's net gain on services** (0.032–0.044 since round 11) | data: Rosstat profit and return on assets by activity | The rule for every purchase: aid is a gift, trade an exchange, so only the seller's gain compares with aid (reader, owner, round 10) | [net-gain rule](method/overview.md#the-net-gain-rule-round-10), [assumptions](#assumptions-backed-by-data-round-11) |
| **Sold to Russia: at value kept × genuinely extra** (tourism lost: genuinely extra 0.30) | data: OECD TiVA for value kept; judgement for genuinely extra | Gross sales had inflated Cyprus and Lithuania (audit, round 3–4); a flat 20% profit was arbitrary (proposed, round 6) | [money rule](method/overview.md#the-money-rule-round-6) |
| **Expected level: 2021 held, plus the travel recovery from COVID** at the UNWTO world pace, capped at the model's recovered level | judgement, tested | 2021 was a COVID year for travel; no model beat this in all three back-tests | [counterfactual](method/counterfactual.md#6-which-model-is-used-for-which-flow) |
| **Countries that do not report** (China, the UAE, India, Kazakhstan, Belarus) at BaTiS balanced values ×0.6–1.5; **Türkiye** at the mean of its own report and BaTiS | judgement | BaTiS from 2022 rests on modelled Russian figures. Türkiye's 6.3 million Russian visitors imply more travel income than it reports | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) §1 |
| **Left out**: relocants' living spending (round 7); Russia's travel imports that BaTiS does not assign to a country, which only widen the high ends | judgement | Relocants' spending is money leaving Russia, not income from it (proposed; the owner left it to Claude's recommendation). The unassigned travel spending has no country split | [relocants-notes](../research/2026-10/gaps/relocants-notes.md), [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md) caveats |

### Shipping Russian oil

Toward Russia when income rose, in the net shift. Research in round 1–2 (`1337385`), counted from `43f1c38`; profit
instead of revenue in `5734a4b`; freight by the real controller in round 5 (`308560d`); Russian shares from evidence
and freight at the money rule in round 6 (`eef967d`). Method: [shipping](method/services-shipping-companies.md#shipping).
Research: [shipping-notes](../research/2026-10/gaps/shipping-notes.md),
[shadow_fleet-notes](../research/2026-10/gaps/shadow_fleet-notes.md),
[shadow_fleet_r6-notes](../research/2026-10/gaps/shadow_fleet_r6-notes.md). Log:
[round 1–2](decision-log.md#round-12-the-question-and-the-first-map-17-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count income from carrying, insuring, financing and registering Russia's seaborne crude, product and LNG exports, and from selling tankers to the shadow fleet**, against 2019–2021 | judgement (the rule) | Money earned serving Russia's exports; Greek, Maltese and Cypriot owners earned large freight income and it was "probably the largest real flow still missing" (proposed, accepted). It is compared with its pre-war level like other services sold to Russia | [shipping-notes](../research/2026-10/gaps/shipping-notes.md) |
| **Counted for the country of the company that earns it** (owner or manager, insurer, lender, registry), never the flag; **freight by the real controller** since round 5; Russian-controlled tankers count for no country | data: KSE, CREA, S&P and Windward volumes by manager; judgement: the split by controller (opaque managers 60–65% Russian, 45–85%) | The money goes to the company, not the flag state. Who controls the tankers was "the biggest guess in shipping", so it was researched from sanctions lists and investigations (proposed, accepted) | `apply_shipping()`, [shadow_fleet_r6-notes](../research/2026-10/gaps/shadow_fleet_r6-notes.md) |
| **Profit, not revenue**: freight 20/35/50%, insurance and finance 10/25/40%, registry 30–70%, ship sales at their price premium; since round 6 freight at value kept × genuinely extra (Greek shipping 0.17) | judgement, based on tanker operating margins of 30–50% in the 2022–23 boom | "A Greek shipowner's €5bn of freight isn't €5bn gained" (proposed); "fix shipping and flowback as profit" (owner). Freight pays for fuel, port fees, crew and the ship itself | `SHIPPING_PROFIT` in [build_data.py](../pipeline/build_data.py), [money rule](method/overview.md#the-money-rule-round-6) |
| **Expected level**: 2019–2021 × Russia's seaborne export growth before the war (+3.9% a year) | data: `trend2.json` | A growing pre-war trend would have kept growing, and trends were to cover more flows than goods (owner) | [trend2-notes](../research/2026-10/gaps/trend2-notes.md) |
| **Left out**: the part already inside services sold to Russia (freight 5%, insurance and finance 10–20%); Greek tanker earnings in `uncovered.json`; freight inside import values | rule | Each would count the same money twice ("remove the shipping double count", owner); freight is paid to shippers, not to Russia (audit) | [shipping](method/services-shipping-companies.md#shipping), [freight](method/trade.md#freight-cif-to-fob) |

### Companies leaving Russia

Toward Russia, in the net shift, by the company's home country. Added in round 5 (commit `650e1ff`). Method:
[companies leaving Russia](method/russia-state-and-companies.md#companies-leaving-russia). Research:
[company_flows-notes](../research/2026-10/gaps/company_flows-notes.md) §1. Log:
[round 5](decision-log.md#round-5-values-at-their-real-worth-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count the exit contribution** paid to Russia's budget by foreign companies that sell out, by home country | data: Russia's budget line (RUB 116bn in 2023, 160bn in 2024); judgement: the split by home country, by the size of the businesses sold (certainty D for most) | Russia makes foreign companies pay an "exit contribution" to its budget to be allowed to sell: "that's money to Russia, by company home country" (proposed, accepted) | [company_flows-notes](../research/2026-10/gaps/company_flows-notes.md) §1 |
| **Count the forced discount**: the value handed to Russian buyers by sales at least 50–60% below valuation | judgement: a 2022 case list, later years from the contribution | Proposed together with the contribution as money to Russia and accepted (proposed, accepted). The research suggested counting only the contribution, since a discount goes to Russian buyers, not the state; why the discount was kept anyway: reason not recorded | [company_flows-notes](../research/2026-10/gaps/company_flows-notes.md) §1 and "Things the builder must decide or watch" |
| **No pre-war level**: each payment is its own change | data | None of these payments existed before the war | [company_flows-notes](../research/2026-10/gaps/company_flows-notes.md) §1 |
| **Left out: seizures** without payment (Wintershall Dea, Unipro, Fortum, Carlsberg, Danone, leased aircraft; about EUR 33bn) | judgement | Russia took these; "the owners had no choice" (proposed) | `apply_company_flows()` |
| **Left out: the Yandex (Netherlands) and Polymetal (Kazakhstan) discounts** | judgement | Their shareholders were mostly international, not Dutch or Kazakh | [method](method/russia-state-and-companies.md#companies-leaving-russia) |

### Remittances from Russia

Toward Russia when wages earned in Russia rose above the expected level, in the net shift. Research in round 7
(`ec6e00a`), on the map in `9a46dd5`; relocants' spending out in `bca0255`; Russia's share measured in round 11
(`7079676`). Method: [remittances and relocants](method/trade.md#remittances-and-relocants-round-7). Research:
[remittances-notes](../research/2026-10/gaps/remittances-notes.md),
[relocants-notes](../research/2026-10/gaps/relocants-notes.md). Log:
[round 7](decision-log.md#round-7-what-the-owner-asked-to-add-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count migrant workers' wages sent home from Russia**, against the expected no-war level | data: receiving central banks' transfers by origin, World Bank totals | They are "wages for labour sold to Russia's economy, so they work like services sold to Russia" (proposed); "should be taken into account" (owner). Most of the rise came from Russia's war economy pushing wages up | [remittances-notes](../research/2026-10/gaps/remittances-notes.md) §1 |
| **At value kept (0.97) × genuinely extra (0.55 when above expected, 0.40 when below)** | data for value kept; judgement for genuinely extra | Migrants "would mostly have worked there anyway", so only part of the money is new income (proposed) | [money rule](method/overview.md#the-money-rule-round-6) |
| **Round 13: at the migrant's net gain** instead: the war wage premium in full, the rest × the premium over the home wage × genuinely extra | data and judgement ([round 13](#round-13-one-valuation-rule-for-every-seller)) | wages pay for real work (audit, owner) | [remittances_r13-notes](../research/2026-10/gaps/remittances_r13-notes.md) |
| **Expected level**: the 2019 and 2021 average, grown at each country's pre-war trend | data and judgement | 2020 is left out because of COVID | [remittances-notes](../research/2026-10/gaps/remittances-notes.md) §4 |
| **Russia's share where no split by origin exists** (Tajikistan, Belarus): the mirror ratio of 2019–2021, the same in every year | data for the share; judgement in applying it to every year | Tajikistan's central bank does not publish transfers by country; why the same share holds every year: reason not recorded | [assumptions](#assumptions-backed-by-data-round-11), [limitations](limitations.md#open-issues-in-the-numbers) |
| **Left out: relocants' transfers** (about EUR 30bn of the 2022 surge) **and their living spending** | rule | It is money leaving Russia: counting it toward Russia would be the wrong sign, and counting it toward Ukraine would credit countries for something unrelated to Ukraine (proposed; the owner had asked whether counting it was "doing too much") | [remittances-notes](../research/2026-10/gaps/remittances-notes.md), [relocants-notes](../research/2026-10/gaps/relocants-notes.md) |
| **Russians working remotely for Russian employers left out; family support from long-settled communities counted as labour** | judgement | Family support "is still income from Russia's economy" (proposed). Remote workers: Claude suggested counting them as labour where data exist; why the research left them out: reason not recorded | [remittances-notes](../research/2026-10/gaps/remittances-notes.md) §8 |

### Rosatom and Russian state loans

Either direction, in the net shift. Added in round 5 (commit `650e1ff`); Belarus's deferrals left out in round 6
(`c8a69b8`). Method: [nuclear projects and state loans](method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia).
Research: [russia_state_finance-notes](../research/2026-10/gaps/russia_state_finance-notes.md). Log:
[round 5](decision-log.md#round-5-values-at-their-real-worth-18-october),
[round 6](decision-log.md#round-6-one-rule-for-money-two-balances-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count the buyer's own payments for Rosatom construction** (Egypt, Bangladesh, Hungary's Paks II, India, Iran, Uzbekistan) | data where projects report; judgement where they do not (certainty D) | Countries pay Rosatom to build nuclear plants, and that money goes to Russia but is "probably not in trade data" (proposed, accepted: "check that and if not it should be included"). The check found construction in neither goods nor services data | [russia_state_finance-notes](../research/2026-10/gaps/russia_state_finance-notes.md), step 1 |
| **Only the buyer's own share**; the loan-financed part and new drawdowns are left out | rule | A Russian state loan paying Rosatom is Russian money paying a Russian company; drawdowns pay for work that is not counted | `apply_state_finance()` |
| **Count interest and repayments on Russia's state loans, as the deviation from the pre-war schedule** | data: World Bank International Debt Statistics (Russia as creditor), actuals to 2024, contractual schedule after | Repayments are money to Russia (proposed, accepted). "A loan ending on schedule is not a war-time choice"; deferrals, stops, escrow and prepayments are. Arrears caused by sanctions on payment channels (Viet Nam, Iraq, Bangladesh) count, because the money did not reach Russia, with a note | [method](method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) |
| **Loan payments count in full**; the customs correction is rescaled to Russia's net gain | rule | The correction comes out of payments the map counts at Russia's net gain (round 10). Why loan payments are not at a net gain: reason not recorded | [method](method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) |
| **Customs over-counts removed**: Akkuyu equipment imported by Rosatom's own Turkish company; El Dabaa equipment, 85% loan-financed | data | They were paid with Russian money, not by the buyer | [russia_state_finance-notes](../research/2026-10/gaps/russia_state_finance-notes.md) |
| **Left out**: nuclear fuel and enrichment; Belarus's loan repayments; Rosatom's capital transfers into Türkiye | rule | Fuel is already in goods trade; Belarus's deferrals were granted by Russia and refinanced with new Russian loans, so they were not its choice (proposed, round 6); Rosatom's transfers into Türkiye are money from Russia, not to it | [method](method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia), [russia_state_finance-notes](../research/2026-10/gaps/russia_state_finance-notes.md) |

### Weapons bought from Russia

Either direction, in the net shift. Added in round 5 (commit `93716b5`); 18 more buyers and Iran counted once in
round 6 (`eef967d`); at Russia's net gain in round 10 (`109b8eb`), measured in round 11 (`7079676`). Method:
[weapons bought from Russia](method/russia-state-and-companies.md#weapons-bought-from-russia). Research:
[russian_arms_exports-notes](../research/2026-10/gaps/russian_arms_exports-notes.md),
[arms_r6-notes](../research/2026-10/gaps/arms_r6-notes.md),
[assumptions_r11_gain-notes](../research/2026-10/gaps/assumptions_r11_gain-notes.md). Log:
[round 5](decision-log.md#round-5-values-at-their-real-worth-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count payments to Russia for weapons, parts, licence kits, repairs and training**, against what the buyer would have paid without the war | data: SIPRI, Rosoboronexport and FSVTS statements, contract reporting; judgement: payment timing and the split by buyer (mostly D) | Buyers paid Russia billions for weapons that "often don't appear in customs data"; "buyers who cut purchases moved toward Ukraine, and those who kept buying sent money to Russia. This is probably the biggest missing piece" (proposed, accepted) | [russian_arms_exports-notes](../research/2026-10/gaps/russian_arms_exports-notes.md) |
| **Expected level without one-off contracts** (Türkiye's 2019 S-400) | judgement | One-off contracts inflate the 2019–2021 average: Türkiye would get +2.2bn instead of +0.3bn | [russian_arms_exports-notes](../research/2026-10/gaps/russian_arms_exports-notes.md) |
| **At Russia's net gain on arms** (0.039–0.050; high end 0.12) | data since round 11 (arms makers' margins, Rostec, Rosoboronexport); the high end is judgement | The rule for every purchase from Russia (reader, owner, round 10) | [assumptions](#assumptions-backed-by-data-round-11) |
| **Russia's own supply limits shown as a note, not taken off** (about 50% of the fall for India, 70% for China, 20% for Egypt) | judgement: the share is a guess from SIPRI and Rostec | Handled like the sanctions split, as a note (proposed). Subtracting the share was offered; why it was not taken: reason not recorded | [method](method/russia-state-and-companies.md#weapons-bought-from-russia) |
| **Russia's later claims of USD 14–15bn a year used only as the high end** | judgement | reason not recorded | [method](method/russia-state-and-companies.md#weapons-bought-from-russia) |
| **Taken off**: the small part inside customs (Algeria's 2024 radars); Iran's payments settled in drones and missiles (about 35%) | rule | Both are already counted, in trade or as weapons sent to Russia | [round 6](method/russia-state-and-companies.md#round-6) |

### Payment agents

Toward Russia, in the net shift. Added in round 6 (commit `27e2d37`); checked against data in round 11 (`26735a2`)
and kept. Method: [payment agents](method/trade.md#payment-agents-round-6). Research:
[payment_channels-notes](../research/2026-10/gaps/payment_channels-notes.md). Log:
[round 6](decision-log.md#round-6-one-rule-for-money-two-balances-18-october).

| decision | data or judgement | why | where |
|---|---|---|---|
| **Count the fees that agents in third countries earn for settling Russia's trade** outside normal banking | data: Bank of Russia balance of payments, Kyrgyz banks' extra profits; judgement: fee rates and the split by country (certainty D; C for Kyrgyzstan) | The fee is income earned by helping Russia trade around sanctions, like the profit on sales to Russia, and it is in neither customs values (Russian Finance Ministry and customs letters) nor services data (proposed; the owner asked to "dig deeper" after agents had been listed as not measurable) | [payment_channels-notes](../research/2026-10/gaps/payment_channels-notes.md) §1–2 |
| **Only the share kept by residents** (35–60%), **against 2021** | judgement | The rest belongs to Russian-owned networks | `apply_payment_agents()` |
| **Counted as it is**, not multiplied by a profit share | rule | A fee is already a margin | [payment_channels-notes](../research/2026-10/gaps/payment_channels-notes.md) §7 |
| **Left out**: payment volumes; crypto volumes; the 2022 transfers of people leaving Russia; Russia's export receipts held abroad; crypto mining and ransomware proceeds | rule | Volumes only route trade already counted; crypto has no country split; relocants' money is leaving Russia; held receipts are Russia's own claims; nobody chose to pay crime proceeds and they existed before the war. In round 1–2 agents were left out because they "mostly pay for trade that customs already record" (proposed) | [payment_channels-notes](../research/2026-10/gaps/payment_channels-notes.md) §1, §8 |

## Assumptions backed by data (round 11)

Round 11 checked the judgement values behind the rules above against data. The proposals are in four research files
([gain](../research/2026-10/gaps/assumptions_r11_gain-notes.md), [rules](../research/2026-10/gaps/assumptions_r11_rules-notes.md),
[hubs](../research/2026-10/gaps/assumptions_r11_hubs-notes.md), [people](../research/2026-10/gaps/assumptions_r11_people-notes.md)).
The research files keep their old values. `build_data.py` applies each proposals file in one step,
`apply_assumptions_r11_*()`, when the file it changes is loaded. A few are constants. No person has reviewed them yet.
Effects are on the headline (% of GDP, 2022 to August 2026, central), unless the cost view is named.

| assumption | old | new | basis | source | effect |
|---|---|---|---|---|---|
| Russia's net gain on services | 0.08 every year | 0.032–0.044 | data: Rosstat profit and return on assets by activity | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/) | whole gain file: Tajikistan −0.24, Armenia −0.18, Kyrgyzstan −0.14, Belarus +0.18, Estonia −0.19, Lithuania −0.11 |
| Russia's net gain on arms | 0.12 | 0.039–0.050 (high stays 0.12) | data: arms makers' margins, Rostec, Rosoboronexport | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/) | weapons bought from Russia count about 60% less (India EUR 0.52bn → 0.19bn) |
| Russia's net gain on food, wood, chemicals, steel, aluminium, other goods | judgement per group | sector profit plus export duties collected; food lower, steel higher | data (2026 repeats 2025) | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/), [Rusal](https://www1.hkexnews.hk/listedco/listconews/sehk/2024/0426/2024042604499.pdf) | the weighted average of other goods hardly moves: 0.200 → 0.197 (2021), 0.185 → 0.167 (2022), 0.133 → 0.130 (2026) |
| Ukraine's net gain on other food, other metals, wood, machinery, chemicals, other | judgement | 2021 from division profits; 2022–2026 from a proxy | data for 2021, judgement after | [Derzhstat](https://stat.gov.ua/sites/default/files/2023-08/%D0%A0%D0%B5%D0%BD%D1%82%20%D0%BE%D0%BF%D0%B5%D1%80%20%D1%82%D0%B0%20%D1%83%D1%81%D1%96%D1%94%D1%97%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%BF%D1%96%D0%B4%D0%BF%D1%80%20%D0%B7%D0%B0%20%D0%B2%D0%B8%D0%B4%20%D0%B5%D0%BA%D0%BE%D0%BD%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%B7%20%D1%80%D0%BE%D0%B7%D0%BF%D0%BE%D0%B4%20%D0%BD%D0%B0%20%D0%B2%D0%B5%D0%BB%20%D1%81%D0%B5%D1%80%D0%B5%D0%B4%20%D0%BC%D0%B0%D0%BB%D1%96%20%D0%BC%D1%96%D0%BA%D1%80%D0%BE%D0%BF%D1%96%D0%B4%202010%202021.zip) | Ukraine's average gain 0.182 → 0.175 (2021), 0.045 → 0.042 (2023); small |
| Lost sales to Russia, share not redirected | default 0.25/0.40/0.60, Finland 0.15/0.30/0.50, Baltic states 0.25/0.45/0.65 | 0.20/0.35/0.55, 0.10/0.25/0.45, 0.20/0.40/0.60 | judgement on firm-level studies | [IZA DP 16146](https://repec.iza.org/dp16146.pdf) | less credit for sales given up: Finland −0.14, Czechia −0.11, Moldova −0.11, Lithuania −0.09, Estonia −0.07 |
| Own-industry share of military aid where no evidence exists | 0.2/0.4/0.7 | 0/0.1/0.3 (Albania, North Macedonia, Montenegro only) | judgement | [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) | none: the money ledger already replaces this share |
| Where EU-level military aid is spent | SIPRI production shares × 0.78 (France 0.30, Germany 0.19...); in the ledger France 0.72bn, Germany 0.44bn, Italy 0.35bn | Sweden 0.28 (Gripen), all other members 0.03 by ASAP grants, about 0.7 to Ukraine's drone industry; all in 2026 | data (the 0.03 is judgement) | [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) | gross flowback 2026: France 0.97 → 0.31bn, Germany 0.63 → 0.27bn, Italy 0.48 → 0.15bn, Sweden 2.81 → 2.69bn; headline +0.01 at most |
| What a loan costs the lender (cost view) | 0.30 of face | 0.26 (0.09–0.47) | data (terms) and judgement (expected loss) | [Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf) | cost view only: Japan's loans EUR 3.05bn → 2.65bn. Replaced in round 12 by a cost per loan item ([loans](method/loans.md#the-cost-view)) |
| Import duties waived for Ukraine (cost view) | 4% for the EU, UK and Canada, every year | EU 0.3% from June 2022 to June 2025, UK 0.2%, Canada 1%; the map uses their weighted average, 0.2% | data | [OEIL 1702126](https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1702126) | cost view only: EU members about −0.1 point (Poland 2.08 → 1.96) |
| UAE share of fuel sold as bunkers | 0.15/0.30/0.45 | 0.20/0.30/0.40 | data: Fujairah bunker sales | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | low end of the UAE only; none on the headline |
| Panama resale and bunker shares | 0/0.01/0.10, bunkers 0.05/0.20/0.50 | 0/0.05/0.35, bunkers 0.30/0.40/0.50 | judgement on data | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=591&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | none: Panama has no laundered oil left after the next row |
| Partners' records of fuel "exports" to flag registries | counted as laundered oil bought by Liberia, the Marshall Islands, Panama, Malta | dropped: they are bunkers sold to ships under those flags; Malta keeps what its own customs record | data: own against partner customs | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?partnerCode=430&period=2024&flowCode=X&cmdCode=2710) | Panama +0.03; Liberia's and the Marshall Islands' laundered oil goes to zero |
| Malta's bunkers in the middle case | the hub keeps 97% | keeps 1 − resale − half the bunker share | judgement | [Eurostat](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_oil?format=JSON&siec=O4600&geo=MT&unit=THS_T&nrg_bal=IMP&nrg_bal=EXP&nrg_bal=INTMARB&nrg_bal=GID_OBS&nrg_bal=TO_RPI_RO&nrg_bal=FC_E) | Malta +0.28 with the next row |
| Laundered-oil cap per territory | 1% / 2% of GDP | from fuel use: Liberia 0.25%/0.85%, Togo 0.27%/0.89%, Malta 0.15%/0.4%, Panama 0.02%/0.09%; applied to the final values | data (volumes), judgement (shares) | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=470&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | Togo's laundered oil EUR 0.10bn → 0.03bn a year; Malta 0.06–0.09bn → 0.035bn |
| Belgian firms' profit tax in Russia, 2022 | EUR 11.8m (allocated) | EUR 16m (12–35m) | data | [Brussels Times](https://www.brusselstimes.com/590174/global-corporations-pay-3-5-billion-in-taxes-to-kremlin) | tiny |
| Refugee hosting cost, Romania 2023 | 0.16 | 0.24 (0.20–0.32) | data | [Presshub](https://www.presshub.ro/exclusiv-romania-datoreaza-refugiatilor-ucraineni-300-de-milioane-de-lei-in-schimb-ii-trimite-la-munca-282164/) | none: refugees' taxes still exceed the cost, so the net stays at zero |
| Refugee hosting cost, Bulgaria 2022 | 0.22 | 0.30 (0.27–0.40) gross, minus BGN 300m paid from EU funds | data | [Sofia Globe](https://sofiaglobe.com/?p=109602) | Bulgaria's own net cost falls to zero; −0.07 |
| Refugee hosting cost, Hungary 2022–2026 | 0.51 in total | 0.18 (the government's all-in total is about EUR 0.25bn) | data | [Budapest Times](https://www.budapesttimes.hu/hungary/the-biggest-relief-operation-of-hungary/) | net cost EUR 0.29bn → 0; −0.14 |
| Refugee hosting cost, Belgium 2022 / 2023 | 0.28 / 0.42 | 0.40 / 0.55 | data (one budget line) | [Brussels Times](https://www.brusselstimes.com/474292/we-cannot-afford-this-belgian-mp-condemns-colossal-ukrainian-refugee-aid) | net cost EUR 0.57bn → 0.82bn; +0.04 |
| Refugee hosting cost, Latvia 2023–2026, Estonia 2022, Georgia 2022 | Latvia 0.05/0.04/0.03/0.015, Estonia 0.05 | Latvia 0.06/0.06/0.065/0.04, Estonia 0.06, Georgia range 0.006–0.03 | data | [LSM](https://www.lsm.lv/raksts/zinas/latvija/21.11.2024-vel-uz-gadu-pagarina-atbalstu-ukrainas-begliem-latvija.a577249/), [ERR](https://www.err.ee/1608579985/riisalo-pogenikevoog-eestisse-hakkab-stabiliseeruma) | about none: these nets stay near zero |
| OECD's modelled 2022 cost as the lowest high bound | none | for hosts costed as refugees × a rate (Austria, Portugal) | judgement | [OECD IMO 2022](https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/10/international-migration-outlook-2022_140ace0e/30fe16d2-en.pdf) | ranges only |
| Russia's share of remittances, Tajikistan | 0.80/0.88/0.93 | 0.80/0.88/0.97 | data: mirror ratio 2019–2021 | [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/) | range only (low end −83.7 → −89.8) |
| Russia's share of remittances, Belarus | 0.30/0.45/0.60 | 0.30/0.40/0.50 | data: mirror ratio 2019–2021 | [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/) | Belarus's wages from Russia ×0.889; +0.07 |
| Moldova's transfers from Russia 2024–2026 | 0.092 / 0.080 / 0.043 | 0.07 / 0.018 / 0.008 | data: central bank, CIS remittances | [BNM](https://bnm.md/files/Anuar_CI_2023.pdf) | Moldova earns less from Russia: +0.32 (whole file) |
| Private donations, 2022 | Austria 0.074, Czechia 0.096, Denmark 0.059, Finland 0.041, Japan 0.58 | 0.11, 0.19, 0.13, 0.06, 0.15; also Finland and Lithuania 2023, Lithuania 2025, Latvia and Estonia low ends | data: national totals | [Japanese Red Cross](https://www.jrc.or.jp/about/publication/news/20230207_030624.html), [Seznam Zprávy](https://www.seznamzpravy.cz/clanek/fakta-jak-valka-na-ukrajine-zmenila-cesko-cesi-jsou-nejsolidarnejsi-v-historii-226309) | Japan −0.01, Czechia +0.03, Denmark +0.02 |
| Hong Kong gold passed on to the mainland, 2026 | 0.372 (2025 carried) | 0.675 (0.52–0.88) | data: Comtrade January–May 2026 | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode=344&period=202605&partnerCode=0,643,156&flowCode=M,X&cmdCode=7108) | Hong Kong +0.80 with the next two rows; China moves little |
| Freight share of import values (CIF to FOB) | 3.5%/5.5%/7.5% for every importer | OECD ITIC margin per importer for the 25 largest buyers (China 6.4%, India 7.2%, Türkiye 8.6%, Korea 9.3%), else 4.5%/6.5%/9% | data (mostly modelled by OECD) | [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015) | distant buyers pay Russia a little less: Türkiye +0.09, India +0.05 (whole file) |
| Freight share of gold | 5.5% | 0.1%/0.5%/2% | data: Türkiye's reported margin | [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015) | gold passed on by the UAE and Hong Kong keeps its full value |

**Left out, and why.**

- **Loans per class** (Japan's IBRD guarantees cost it about 0.05 of face, not 0.26). The map held one loan total per
  donor, not loans by class, so one value was used. Applied in round 12: each loan item now has its own lender's cost
  ([loans](method/loans.md#the-cost-view)).
- **Duties per country and period.** The map's cost view applies one rate to all three waivers. The weighted average
  keeps the 2022–2026 total right, but not the split between the EU, the UK and Canada, or by year.
- **Redirection fading after three years** (×0.7 for 2025–2026). It is optional in the proposal, and the money-rule
  factor is one value for all years.
- **Gibraltar's half bunker share.** Its fuel already counts at 10% for the same reason (bunkers paid by shipowners), so
  this would count the bunkers twice.
- **Romania's EU reimbursement.** Its donor-funded share already covers EU funds.
- **Gold freight for gold bought directly** (the UAE's own, Türkiye, Switzerland, India). The map does not separate it
  from other goods; only gold passed on by the UAE and Hong Kong is tagged.
- **The data-based use of Liberia, Panama and the Marshall Islands** (EUR 2–13m a year in the proposal). It is a cap, not
  a value; with the bunker records dropped, these registries keep no laundered oil.
- **Bahamas and other flag states.** Greece's records of exports to them look the same, but their own customs were not
  checked.
- **Confirmed and kept:** hub resale shares for the Netherlands, Belgium, Greece, Malta, Singapore, Türkiye, India,
  Togo and Gibraltar; payment-agent fees; Greek shadow-fleet freight; other company taxes; extra sales to Russia, weapons,
  tourism and shadow-shipping factors; refugee costs of Ireland, the UK and Moldova; Canadian and US donations; Hong
  Kong's 2022–2025 onward shares; the Marshall Islands' and Gibraltar's caps.

## Constants and rules written down in round 11

A traceability audit in round 11 found choices that change a number but were not on this page, and constants in the
code that no research file explains. They are listed here, labelled **data** (traced to a file or a source) or
**judgement** (a choice someone made, which can be argued with). None of the values was changed by the audit. Line
numbers are those of the round-11 audit version of [`build_data.py`](../pipeline/build_data.py) and
[`site/index.html`](../site/index.html).

### Decisions that were not written down

| decision | data or judgement | why | where |
|---|---|---|---|
| **Euroclear and Clearstream**: a third of the return denied on reserves they hold goes to the host (Belgium, Luxembourg), two thirds to all EU members by their share of EU-level aid | judgement (owner, round 7) | the freeze is an EU decision, but the host carries the legal risk. It moves Belgium by about 0.8 points of GDP | `HOST_SHARE`, build_data.py:2530; [frozen reserves](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| **Default ranges per certainty letter**: A ±5%, B ±15%, C ±35%, D ±70% | judgement | a part with no range of its own still needs one; the widths grow with how little was checked | `RANGE`, index.html:518; [ranges](method/ranges.md#certainty-letters) |
| **Baseline and actual values correlated 0.5** inside `spread()` | judgement | both come from the same statistics office, so their errors partly cancel; not measured | index.html:615; [ranges](method/ranges.md#quadrature-for-traded-flows-spread) |
| **Letters fixed in `calc()`**: gold and hidden payments always D, Russian oil bought via other countries always C, the share of EU-level aid always B | judgement | every buyer's value in these parts is modelled the same way | index.html:680, :687, :695; [ranges](method/ranges.md#certainty-letters) |
| **Laundered-oil cap of 1% (middle) and 2% (high) of GDP a year**, where fuel use is not measured | judgement | ship registries and storage points cannot use the fuel the model assigns them. Still applies to the Marshall Islands and Gibraltar | `LAUNDERED_CAP`, build_data.py:366; [energy](method/energy-and-laundered-oil.md#valuing-and-capping) |
| **Hub trading margins**: goods 5–20%, UAE 3–15%, gold 0.3–6%, Belarus 10%, Baltic states 7% | judgement ("an educated guess" in the research) | a hub that passes goods on keeps only its margin | [trade](method/trade.md#re-export-hubs), [reexports-notes](../research/2026-10/gaps/reexports-notes.md) |
| **Non-reporting partners: only the paid share counts** | data per country, judgement in the rule | Russian supplies given on credit or as aid are Russian support, not money to Russia | build_data.py:616; [nonreport-notes](../research/2026-10/gaps/nonreport-notes.md) |
| **Private donations where no national total exists**: 0.015% of GDP (Western donors), 0.03% (Central and Eastern Europe), 0.06% (Baltic states) for 2022 | judgement | scaled on the countries with national totals | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md); [aid](method/aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| **Countries with no aid record**: 0, with an upper bound of 0.002% of 2022 GDP (less in later years) | judgement | nobody is assumed to have given nothing for certain | [aid_gaps-notes](../research/2026-10/gaps/aid_gaps-notes.md) item 4 |
| **2026 no-war price = the actual world price** (the Hormuz closure) | judgement | the 2026 price spike came from the closure of the Strait of Hormuz, not from Russia's war. The research left this open: keeping the pre-invasion path would count the spike as windfall (over half of India's) | `NW_WORLD_2026`, build_data.py:1747; [prices](method/prices.md#no-war-prices-round-7), [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) open question 2 |
| **Gold colour and outline**: a country is gold when its total is negative mainly because it earned from the war effort; the outline needs at least EUR 10m and 0.05% of GDP | judgement (owner, round 6) | earning from supplying Ukraine is not money toward Russia; the threshold hides rounding noise | index.html:761–762; [overview](method/overview.md#two-balances-round-6) |
| **Rankings leave out economies under EUR 5bn GDP** | judgement | small economies' trade data are noisy and would fill the top of a % of GDP list | `MIN_GDP_RANK`, index.html:1530 |
| **Loan cost range in the cost view**: half to one and a half times the grant equivalent (13%–39% of face) | judgement; **data since round 12** | replaced by each country's own low and high lender's cost (`loans_grant_eq_lo`, `loans_grant_eq_hi`), from the expected losses per creditor class ([loans](method/loans.md#the-cost-view)); the half-to-one-and-a-half band is only a fallback | index.html:714 |
| **10% discount rate for loans** | judgement; **data since round 12** | replaced by Ukraine's measured 2021 rate (6.7%: its 6.875% and 6.30% bond sales) plus measured expected losses, with the promised war yield of each year as the high end (38% in 2022, 40% in 2023, 24%, 17%, 15% after; from 72 weekly ICU price reports and 106 weekly Eavex yield tables). The IMF's 5% and the old 10% are no longer used | [loans](method/loans.md), [loans_value-notes](../research/2026-10/gaps/loans_value-notes.md) |
| **One duty rate for all three waivers** (EU, UK, Canada), weighted by purchases | judgement | the map holds one rate (`META.tariff_rate`); see "Left out" above | `TARIFF_RATE_YEARS`, build_data.py:61 |
| **Refugee letters**: a grade such as "A-B" counts at its weaker letter; Poland's refugee part at most C | judgement (round 11 audit) | Poland's and Czechia's costs were checked only against press articles ([verify_r11_aid-notes](../research/2026-10/verify_r11_aid-notes.md)). Czechia A → B, Poland, Germany and Lithuania B → C; no total's letter or value changes | `REFUGEE_CERT_CAP`, build_data.py:2350 |

### Constants in the code

| file:line | constant | status | basis |
|---|---|---|---|
| build_data.py:323 | `EUR_PER_MT_2021`: crude 0.414, products 0.549, gas and LNG 0.583, coal 0.130 EUR bn per Mt | data | CREA's 2021 value for Germany by fuel ([`crea.json`](../research/2026-10/crea.json)) ÷ the tracker's 2021 tonnes ([`energy.json`](../research/2026-10/gaps/energy.json)): 9.065/21.935, 4.057/7.393, 18.177/31.167, 0.831/6.37 |
| build_data.py:345, :955 | China's fuel = crude value ÷ China's own crude share of its fuel exports per year (0.72, 0.75, 0.82, 0.76, 0.75 in 2022–2026) | **data** (round 12; was 0.70, a judgement) | `crude_k(y, "CHN")` in [`crude_content.json`](../research/2026-10/gaps/crude_content.json) ([notes](../research/2026-10/gaps/crude_content-notes.md)); see [round 12](#applied-in-round-12-data-precision) |
| build_data.py:3102 | `HK_METALS_SHARE`: 1.0 every year (the precious-metals share of Hong Kong's rise in imports from Russia) | **data** (round 12; was 0.98, not traced) | UN Comtrade, Hong Kong's imports from Russia, HS 71 and total, 2019–2025 ([raw/comtrade_hkg](../research/2026-10/raw/comtrade_hkg/)); see [round 12](#applied-in-round-12-data-precision) |
| build_data.py:1622, :1627 | `GAS_IN_CUSTOMS`: Türkiye 1.0, Poland 1.0; `GAS_UNLABELLED`: Germany EUR 2.3bn (2021), 3.5bn (2022), so a share of 0.14 and 0.15 | **data** (Germany since round 12; was 0.07, a judgement) | [audit-notes](../research/2026-10/gaps/audit-notes.md) items 1, 2 and 8 and the flags in [`audit.json`](../research/2026-10/gaps/audit.json); see [round 12](#applied-in-round-12-data-precision) |
| build_data.py:3103 | Gibraltar keeps 10% (5–30%) of its Russian fuel | judgement | a reseller's margin, as for other hubs; bunkers are paid by shipowners elsewhere |
| build_data.py:3124 | Malta's services bought from Russia 0.127, 0.133 (2021–2022), ±35% | data, band judgement | the map's own 2021–2022 values and the 2023–2026 fix in [`round4b.json`](../research/2026-10/gaps/round4b.json) `artefacts.MLT`; ±35% is the width of letter C |
| build_data.py:180 | Malta's own fuel imports, low ×0.76, high ×1.43 | judgement | the band of the model's laundered-oil values, applied to Malta's own customs figure |
| build_data.py:222 | Hungary's refugee cost, low ×0.6, high ×1.5 | data (proposal) | `range_factor` in [`assumptions_r11_people.json`](../research/2026-10/gaps/assumptions_r11_people.json) |
| build_data.py:2527 | `BEL_EUROCLEAR_TAX`: 2024 1.7, 2025 1.0, 2026 0.5 | 2024–2025 data, 2026 judgement | [frozen_assets-notes](../research/2026-10/gaps/frozen_assets-notes.md) item 3 (Belga); 2026 is "a guess" |
| build_data.py:2563 | frozen-reserve return, low end ×0.8 | judgement | Russia would have spent part of the reserves; the notes guess 10–30% |
| build_data.py:918 | EU laundered oil ×0.62 (0.5–0.8) | middle data, band judgement | 0.62 = 1 ÷ 1.6, Global Witness's 35m barrels against the model ([audit-notes](../research/2026-10/gaps/audit-notes.md) item 4); the Global Witness report itself is not linked |
| build_data.py:1752–1786 | `GAS_FORMULA`, `LNG_FORMULA` weights (Türkiye 0.7/0.3, Greece, Bulgaria, North Macedonia, Moldova 0.5/0.5, default 0.75/0.25, Taiwan and China LNG 0.5/0.5) | contract types data, mixed weights judgement | [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) section 2 and its note that the hub shares are "judgement calls"; Türkiye from [turkey_prices-notes](../research/2026-10/gaps/turkey_prices-notes.md) |
| build_data.py:1979 | services trend bounds kept within ×2.5 of the middle | judgement | tiny or noisy series give extreme fitted bounds |
| build_data.py:1991 | company-tax trend fallback 1.045 | data | `trend2.json` global central ([trend2-notes](../research/2026-10/gaps/trend2-notes.md)) |
| build_data.py:1669 | Belarus gas price ±2% (2019–2022), ±8% (2023–2025), ±15% (2026) | ±2%: judgement on a published dollar price; ±8% and ±15%: **data** (round 12; was ±2% for every year) | [`gas_prices-notes.md`](../research/2026-10/gaps/gas_prices-notes.md) (the range rule for customs prices); see [round 12](#applied-in-round-12-data-precision) |
| build_data.py:1673 | Tajikistan's 2021 price band ±3% | judgement | its 2021 band came from a fixed ratio that cancels in the index |
| build_data.py:2239 | `conduit` Kazakhstan 3.5, Netherlands 4.7 | data | Polymetal's transfer, EUR 3.5bn (1.7–6.0), and Yandex in [company_flows-notes](../research/2026-10/gaps/company_flows-notes.md); the notes' table rounds Kazakhstan to 3.6 |
| build_data.py:3062 | freight share per importer, low ×0.7, high ×1.4 | judgement (in the proposal) | the rule in [`assumptions_r11_people.json`](../research/2026-10/gaps/assumptions_r11_people.json) `CIF_SHARE` |
| build_data.py:76 | `USD_PER_EUR` 2022–2024 | data | ECB annual averages ([trade-notes](../research/2026-10/trade-notes.md)) |
| build_data.py:1611 | `MWH_PER_BCM = 10.55e6` | data | 10.55 kWh per m3, gross calorific value, as in `energy2.json` and `gas_prices.json` |
| build_data.py:3481 | UAE customs fuel taken off CREA's: 0.37, 0.62, 0.19 (2024–2026) | data | [round4b-notes](../research/2026-10/gaps/round4b-notes.md); 2026 is 0.19, not 0.26, because the addition cannot fall below zero |

### Proposals that would change numbers (not applied)

The audit found these values questionable. Six of its seven proposals were applied in round 12 (next section). This one
is left as it is until someone decides. The expected effect is a rough estimate.

| value | proposal | expected effect |
|---|---|---|
| one duty rate for the EU, UK and Canada (0.2%) | one rate per waiver | cost view only, tiny: the EU's purchases dominate the average, so EU members barely move (the split by year changes); the UK about the same; Canada's very small part about five times larger |

### Applied in round 12 (data precision)

Each value below was a judgement or untraced, and is now measured. Effects are on the headline (% of GDP, 2022 to
August 2026, central), measured with the site's own `calc()` before and after each change, one at a time.

| value | old | new | evidence | effect |
|---|---|---|---|---|
| loans: discount rate and default risk (net shift) | 10% for every loan (6–7% low, 13–15% high), a judgement | Ukraine's 2021 rate, 6.7%, plus the expected loss of the lender's class: IMF and World Bank 0, EU 9%, bilateral lenders the standstill (3–28% of value), Support Loan about 95%; low: no loss; high: the promised war yield of the year (38%, 40%, 24%, 17%, 15%) | 2021 bond sales ([Ukrinform](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html), [Interfax-Ukraine](https://en.interfax.com.ua/news/economic/758134.html)); weekly prices and yields (ICU, Eavex); standstill terms ([Government of Ukraine](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy)); seniority ([NBER w25793](https://www.nber.org/papers/w25793)); EU provisioning ([OEIL](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888)); all on the [loans page](method/loans.md#evidence) | loans worth EUR 53bn instead of 64bn (of 96.5bn face). Japan −0.06 points, Sweden, Finland −0.05, France, Spain, Italy, Belgium, Denmark, Latvia −0.05 to −0.04, Germany −0.04, Canada −0.03, UK −0.03; the US −0.001 |
| loans: the lender's cost (cost view) | 26% of face for every loan, range ×0.5–×1.5 | the same terms and expected losses at the lender's own funding rate, per loan item, with its own low and high | EU cost of funding ([Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf)); OECD 10-year yields ([FRED](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01)) | cost view: EU members up (Finland +0.07, Italy, France, Belgium +0.06, Germany +0.05); Japan −0.07, Canada −0.04, UK −0.03 |
| China's crude-to-fuel ratio | 0.70 (judgement) | China's own measured share per year, 0.72–0.82 | [`crude_content.json`](../research/2026-10/gaps/crude_content.json) | what is taken off China's own payments for the crude in its fuel exports now equals that crude's value: before, ÷ 0.70 × China's own ratio (0.72–0.82) took off up to 17% more. China −0.005 points (EUR −0.8bn). Its fuel buyers barely move (EUR +0.06bn in total, through the refiners' blended ratio; none by more than 0.006 points). The audit's proposal (India's ratio, 0.67) would have moved China the other way; China's own measured value is the closer one |
| Germany's gas already in customs | 0.07 (judgement) | 0.14 (2021) and 0.15 (2022), from EUR 2.3bn and 3.5bn ÷ German final-use Russian gas of EUR 16.6bn and 23.7bn | [audit-notes](../research/2026-10/gaps/audit-notes.md) item 2, [`audit.json`](../research/2026-10/gaps/audit.json) | Germany −0.04 points (EUR −1.7bn): payments to Russia fall by EUR 1.1bn (2021) and 1.8bn (2022), but the pre-war baseline falls more, so less was avoided |
| Belarus gas price band | ±2% every year (judgement) | ±2% to 2022, ±8% 2023–2025, ±15% 2026 | [gas_prices-notes](../research/2026-10/gaps/gas_prices-notes.md) | none visible: Belarus's range moves by 0.01 points |
| `HK_METALS_SHARE` | 0.98 (not traced) | 1.0 in every year: precious metals rose by more than all imports from Russia | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&partnerCode=643&period=2023&flowCode=M&cmdCode=TOTAL,71) (2019–2025, [raw/comtrade_hkg](../research/2026-10/raw/comtrade_hkg/)) | Hong Kong +0.08 points (EUR +0.3bn), China −0.002 |
| EU loans: expected loss (Decision B) | 9% for every EU loan (the usual MFA provisioning rate) | the provisioning rate the EU set for each loan: 70% for the exceptional MFA of 2022 (EUR 1bn and 5bn) and the EUR 1.59bn of repurposed EIB ELM loans; 9% for the emergency MFA (Regulation 2021/947 applies); 9% kept for MFA+ and the Ukraine Facility, whose regulations set no provisioning rate (budget headroom). The owner chose the EU's own rate as the lender's expected loss; the EU judged 9% not adequate for Ukraine in 2022 | [2022/313](https://eur-lex.europa.eu/eli/dec/2022/313/oj), [2021/947](https://eur-lex.europa.eu/eli/reg/2021/947/oj), [2022/1201](https://eur-lex.europa.eu/eli/dec/2022/1201/oj), [2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj), [2022/2463](https://eur-lex.europa.eu/eli/reg/2022/2463/oj), [2024/792](https://eur-lex.europa.eu/eli/reg/2024/792/oj), [Legislative Observatory 2022/0213(COD)](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888) | EU-level loans worth EUR 49.4bn to Ukraine instead of 47.3bn (lender's cost 32.4bn instead of 28.6bn). All 27 EU members up by 0.007 to 0.014 points (Finland, France +0.014, Italy, Belgium, Sweden, Denmark +0.013); cost view +0.013 to +0.026 |

## Round 13: one valuation rule for every seller

An independent review by an economist and a data journalist (19 October 2026, "audit") found three valuation rules mixed in the headline, a bug in the fuel mix, a wrong deflator for gold, unequal treatment of refiners, and framing and certainty that overstated the evidence. The owner approved every fix below. Each row says what is data and what is judgement. Effects are on the net, % of a year's GDP, for that step alone (all steps: [changelog](changelog.md#round-13)).

| decision | data or judgement | why | effect | where |
|---|---|---|---|---|
| **Fuel-mix bug fixed**: the volume of all payments in `apply_net_gain()` uses the payments index at 2019–2021 prices (`_pidx_pre`), as the tracker's fuel volumes do; a check tests that the same volumes give the same gain | data (a coding error) | the no-war index valued fuel at no-war prices, about twice the 2019–2021 level in 2022, so the fuel share of what was bought was understated (audit) | Hungary −4.1 → −5.5, Slovakia +1.3 → −0.1, India −2.3 → −2.8, Türkiye −3.3 → −3.9, Mongolia −4.7 → −6.5 | [overview](method/overview.md#the-net-gain-rule-round-10), `check_data.py` |
| **Gold at the gold price**: gold in the payments (tagged or Hong Kong's rise) is deflated with the gold index, rebased to 2019–2021 | data (prices.json gold index) | Hong Kong's pre-war index was half palladium, whose price fell while gold's rose 2.7 times (audit) | Hong Kong −4.2 → −1.9 | [trade](method/trade.md#hong-kong-gold) |
| **One rule for every seller**: every sale counts at the seller's net gain (taxes plus profit above a 9% return on capital, OECD STAN by country and industry) × genuinely extra; value kept (incl. wages) is dropped | data (OECD STAN 2025); judgement: the normal return (9%, the same as Russia's), manufacturing for goods sold to Russia, the OECD median for economies outside STAN | the same car counted ten times more when China sold it to Russia than when Russia sold it; the claim "the same rule" was not true (audit). "Genuinely extra" stays: it measures additionality, not value | Belarus −18.5 → −5.6, Kyrgyzstan −16.7 → −6.1, Armenia −10.1 → −2.4, Cyprus +6.1 → −0.3, Georgia −7.2 → −2.3, China −1.56 → −1.05, US +0.36 → +0.48 | [overview](method/overview.md#one-rule-for-every-seller-round-13), [net_gain_sellers-notes](../research/2026-10/gaps/net_gain_sellers-notes.md) |
| Shipping freight and insurance at the shippers' and insurers' net gain; ship-sale premiums and registry fees keep their shares | data (STAN H50, K65); judgement for premiums and fees (already rent) | the same rule | Greece's shipping part about 0 | [services](method/services-shipping-companies.md#shipping) |
| Payment agents' fees at the financial industry's net gain × genuinely extra | data (STAN K); judgement (extra 0.5) | a fee is a sale of a service to Russia | Kyrgyzstan's fees −0.7bn → about −0.07bn | [trade](method/trade.md#payment-agents-round-6) |
| **Remittances at the migrant's net gain**: the war wage premium in what migrants sent counts in full (as far as it shows in euros); the rest of the change × the premium over the home wage × genuinely extra | data: Rosstat wages (as reported), a 2021 survey of migrant pay, home wages (as reported); judgement: the 9% pre-war wage trend, 0.2 for countries without a home wage | wages pay for real work; only pay above what the same work earns elsewhere is a gain, and only its war-driven change counts (audit, owner) | Tajikistan −38.3 → −39.6, Uzbekistan −15.1 → −14.5, Kyrgyzstan −6.1 → −7.5, Moldova +6.1 → +5.4 | [remittances_r13-notes](../research/2026-10/gaps/remittances_r13-notes.md) |
| Tajikistan's remittance total kept at the World Bank's (USD 10.18bn in 2025); EFSD's 54.5% of GDP implies 9.6bn | data | the audit's "about 8.6bn" is not in the article it cites; the range covers EFSD's figure | none | [remittances_r13-notes](../research/2026-10/gaps/remittances_r13-notes.md#checking-the-totals) |
| **Weapons sent to Russia: paid or unpaid.** Paid (also in kind) = a sale at the seller's net gain × genuinely extra; unpaid = support in full. North Korea paid (INSS: in kind 80–96%), half its shells outdated stock at 0.9 of the price; Iran paid (contracts); Belarus unpaid (no payment found); China's unrecorded part sold by firms; troops' pay in full | data: INSS via Bloomberg and The Insider, NK News, Bloomberg via Militarnyi, HUR via Reuters; judgement: 0.9 on outdated stock, Belarus unpaid, the 0.8 ends | payment in kind is payment, so it is a sale; troops' pay follows the remittances rule (the soldiers' alternative pay is close to nothing) | North Korea −30.0 → −10.2, Iran −0.8 → 0.0 | [military_payment_r13-notes](../research/2026-10/gaps/military_payment_r13-notes.md) |
| **Windfall at Russia's net gain** on the extra price: 1 for oil and pipeline gas, the profit tax plus Russia's 60% of LNG profit (0.68–0.74), at most the coal rent for coal | data (net_gain_russia.json) | costs do not rise with the price; the audit asked for the windfall to count by the same rule as volumes | Japan and Spain lose about a fifth of their windfall; Hungary and Türkiye unchanged | [prices](method/prices.md#war-time-windfall) |
| Türkiye's no-war gas price keeps 0.7 hub (TTF) and 0.3 oil formula | data for "about 70% hub-indexed since 2021" (turkey_prices-notes); judgement in using it as the weights | the audit asked to source or label it. Sensitivity: 0.5/0.5 gives Türkiye −3.18, 0.9/0.1 gives −2.98 (central −3.08) | none | [prices](method/prices.md#war-time-windfall) |
| **Two numbers**: support for Ukraine and the change in payments to Russia, with the net as their sum, everywhere on the site; "less paid to Russia (incl. supplies Russia cut off)", never "toward Ukraine" | rule | most of the "toward Ukraine" score of Lithuania, Finland, the Netherlands and Germany was less paid to Russia, including gas Russia cut off itself (audit) | no number changes | [overview](method/overview.md) |
| **Cut by Russia label**: the gas part of "less paid to Russia" in years when Gazprom cut the supply (Poland, Bulgaria, Finland, the Netherlands, Denmark, Germany from 2022) or Ukraine's transit ended (Austria, Slovakia, Italy, Moldova from 2025) | data (sanctions_share.json gas_part); judgement in the list of countries and first years | it is not the country's choice (sanctions_share-notes) | a label: Germany EUR 24bn of 70bn | [overview](method/overview.md#every-part-of-the-net-shift) |
| **Stacked models at best C**: less paid to Russia, purchases from Ukraine, sales and services to and from Russia | rule | a modelled no-war level × a modelled share is a modelled estimate (audit) | letters only | [ranges](method/ranges.md#certainty-letters) |
| **Correlated errors**: aid and EU aid (1), aid and its own flowback (−0.5), parts sharing Russia's gain shares (0.5), flowback parts sharing the weapons gain (0.5), paid and sold (0.2) | judgement | parts that share inputs are not independent (audit) | ranges only | [ranges](method/ranges.md#from-parts-to-a-total) |
| **Method band** next to the 90% range: the net under the round-12 valuation rule, the windfall in full, loans at the war-time yield | rule | the range is parameter uncertainty given the method; method choices move some countries by a factor of two (audit) | display | [ranges](method/ranges.md#the-method-band-round-13) |
| PhosAgro's margins fetched: Russia's fertiliser gain share 2023 0.20 → 0.27; Acron's 2021 margin unverified (D) | data (PhosAgro annual report 2023) | "from memory" inputs must be fetched or graded down (audit) | small | [net_gain_russia-notes](../research/2026-10/gaps/net_gain_russia-notes.md) |
| Extra purchases from and sales to Ukraine: the yearly changes summed with their signs, only the total floored at zero | rule | flooring each year gave noisy series a positive value when the true change was 0 (audit) | tiny | [overview](method/overview.md#every-part-of-the-net-shift) |
| Yemen's 2023 non-fuel price index (0.68, its own customs unit value) replaced by the wheat index (1.30) | data | the only non-fuel index below 0.8; Yemen's imports from Russia are 99.6% wheat (audit §15) | Yemen −9.7 → −7.8 | `PRICE_OUTLIERS` in `build_data.py` |
| Yemen's GDP stays the IMF figure (USD 8.07bn for 2024); the Netherlands' 2026 index (0.63) and Tunisia's 2024 index (0.88) were checked and kept | data | Yemen's GDP matches the IMF WEO; the World Bank has none after 2018. The Netherlands' low 2026 index is LNG bought below the no-war (world) price, the method's own result, not an error | none | [limitations](limitations.md) |
| "Aid (Kiel)" relabelled "Aid to Ukraine (Kiel, adjusted: weapons at market value, loans as gifts)", with Kiel's own figure in the panel | rule | Poland's Kiel figure is EUR 5.89bn; the map shows 3.24bn after the write-downs (audit) | labels | [README](README.md#how-to-read-a-number) |
| Exact links instead of portal home pages (Kiel's Release 31 workbook, a Comtrade query, the MSMT report, the windfall's method notes); round-6 value-kept scripts moved into the repository | rule | a source should be one click from the figure (audit M8) | none | [sources_r11.json](../research/2026-10/sources_r11.json), [scripts](../research/2026-10/scripts/value_kept/) |

### Round 13: refiners and laundered oil

| decision | data or judgement | why | effect | where |
|---|---|---|---|---|
| **EU refiners treated like India's and Türkiye's**: the Russian crude in fuel they export is charged to the buyers, before and after the war; the refiner keeps what it used itself | data: round4a.json export shares, CREA crude tonnes, each refiner's UN Comtrade HS 2710 exports by partner (2021); judgement: fuel to Ukraine, bunkers and places off the map stays with the refiner | the same crude counted at the refiner only in the EU (audit) | Lithuania −2.5, the Netherlands −0.9, Finland −0.6 | [energy](method/energy-and-laundered-oil.md#refiners-counted-once) |
| **Laundered oil in volumes, both ways**: the crude at the no-war crude price against its pre-war level at 2019–2021 prices, falls counted too, at Russia's net gain on crude | rule | the only trade part in money and rises only; it mixed price and volume (audit) | Estonia +2.2, Latvia +2.7, Togo +6.8 (a fuel hub whose pre-war fuel held Russian crude); Nepal −1.6 → −1.8, Tanzania −2.0 → −2.2 | [energy](method/energy-and-laundered-oil.md#pre-war-laundered-oil) |

### Audit points kept, with the reason

- **Loans** (audit M4): Ukraine's 2021 rate (6.7%) already holds a default premium, so adding the creditor class's expected loss partly double counts; EU provisioning rates are prudence, not forecasts. The owner kept decision B and the 6.7% normal rate; effect on headlines 0.007–0.014 points. The method band shows loans at the war-time yield ([loans](method/loans.md#what-is-still-judgement)).
- **Frozen reserves** (M9): the return denied stays credited a third to the host, two thirds to EU members (owner, round 7). It is in the second number, labelled as the return Russia lost.
- **Constant prices against nominal aid** (M2): stated on the map and in [overview](method/overview.md#the-core-idea-in-four-steps); re-inflating all volumes to 2024 prices would change every part and is left for a later round.
- **Minimum GDP for rankings** (M5): kept at EUR 5bn; rankings say that countries whose range crosses zero are left out because the sign is uncertain.
- **The 2021 baseline for gas** (M6): kept; an alternative 2019–2021 futures path was not built this round.
- **Refugee costs** (M7): gross and net are not yet shown side by side; noted in [limitations](limitations.md).
- **Laundered oil for small buyers** (H3): the volume rule does not address fungibility (Nepal's diesel barely changes Russia's revenue); noted in [limitations](limitations.md).

## What is data and what is estimated

- **Reported data** (certainty A–B): aid (Kiel), customs trade, fossil fuel payments (CREA), GDP, refugee counts.
- **Estimates and models** (certainty C–D): the no-war baseline, net-gain shares, value kept, refugee costs outside
  27 hosts with budgets, laundered oil per buyer, shadow-fleet shipping, company taxes outside about 20 reporting
  countries, payment agents, remittance shares, military support to Russia, private donations, undisclosed aid.

Each part in a country's panel shows its certainty letter and numbered sources; the
[sources page](reference/sources.md) lists them, and [`sources_r11.json`](../research/2026-10/sources_r11.json)
gives the exact primary links.
