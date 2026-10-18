# Method overview: one scale for every flow

The map asks one question per country: since the full-scale invasion, how much money and support has the country moved toward Ukraine, and how much toward Russia, compared with what it would have done without the war? Every flow we can find (aid, refugee hosting, trade, energy, services, shipping, company taxes, weapons, hidden channels) is turned into the same unit: a change against the expected no-war level, at pre-war prices, summed over 2022 to the chosen year (2026 = January–August), as a percentage of one year's GDP. This page defines that scale and lists every part, each with a link to the page that explains it in detail.

## The core idea in four steps

1. **Change, not totals.** A country that bought EUR 20bn of Russian oil every year before the war and still does has shifted nothing; one that stopped has shifted EUR 20bn a year. Trade parts are therefore measured against an *expected* level: what the country would have traded without the war. How that is predicted is the subject of [counterfactual.md](counterfactual.md).
2. **At pre-war prices.** Fuel prices doubled or more in 2022. Paying twice as much for the same oil is not a shift in behaviour, so traded values are divided by a price level (`pidx`, 2019–2021 = 1) before they are compared ([prices.md](prices.md)). The extra money Russia earned from the higher prices is counted separately, as the war-time windfall.
3. **Summed 2022 up to the chosen year.** The map adds the yearly changes. 2026 counts eight months (`FRAC = 8/12`).
4. **As % of one year's GDP.** The total is divided by the country's 2024 GDP (World Bank WDI, in [`other.json`](../../research/2026-10/other.json); gaps from [`residual.json`](../../research/2026-10/gaps/residual.json)). Per person and total euros are alternative measures on the map. Code: `scaled()` in [`site/index.html`](../../site/index.html).

For one traded flow, one year:

```
change_i = base × FRAC_i × bmul_i  −  value_i / pidx_i
```

Positive means less than expected. Whether that counts toward Ukraine or Russia depends on the flow (paying Russia less is toward Ukraine; buying from Ukraine more is toward Ukraine). The site's `calc(c, y)` in [`site/index.html`](../../site/index.html) computes every part with a middle value and a likely range; [ranges.md](ranges.md) explains the ranges.

## Every part of the net shift

The parts below are what the country panel's waterfall shows (`shiftParts` and `backParts` in `calc()`). "Toward" says which way a positive amount points.

| part on the map | how it is counted | toward | page |
|---|---|---|---|
| Aid to Ukraine | Kiel Institute allocations (bilateral), loans repaid from frozen Russian assets left out; loans at their economic value, donated weapons at market value | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#aid) |
| Share of EU-level aid | EU institutions' aid split over members by EU budget share | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#eu-level-aid) |
| Hosting refugees | net cost: budgets where reported, else a calibrated model, minus refugees' taxes; donor-paid part taken off; floored at zero per country | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#refugees) |
| Extra purchases from Ukraine | rise above the expected level, each year on its own, × Ukraine's net gain (round 10) | Ukraine | [trade.md](trade.md) |
| Less (or more) paid to Russia | expected minus actual goods imports from Russia; fuel at the prices a no-war market expected, other goods at pre-war prices; × Russia's net gain on that mix of goods (round 10) | either | [trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md) |
| Extra paid because of war-time prices (windfall) | payments for Russian fuel minus the same volume at no-war prices; negative where Russia sold below them | either | [prices.md](prices.md#war-time-windfall) |
| Russian oil bought via other countries (laundered oil) | Russian crude inside fuel refined elsewhere (measured share per refiner and year, round 9), above its pre-war level, × Russia's net gain on crude (round 10) | Russia | [energy-and-laundered-oil.md](energy-and-laundered-oil.md#laundered-oil) |
| Income lost on sales to Russia given up / income from extra sales | expected minus actual exports to Russia, × value kept × genuinely extra (the money rule) | either | [trade.md](trade.md#profit-not-revenue) |
| Less (or more) tax paid in Russia by companies | profit tax + half of other taxes, against 2018–2021 | either | [services-shipping-companies.md](services-shipping-companies.md#company-taxes) |
| Weapons and troops sent to Russia | North Korea, Iran, Belarus, China's unrecorded part | Russia | [aid-refugees-military.md](aid-refugees-military.md#military-support-to-russia) |
| Less (or more) paid to Russia for services | expected minus actual services imports, × Russia's net gain on services (round 10) | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Income lost on services to Russia given up (e.g. tourism) | expected minus actual services exports, × the money rule | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Income from shipping and insuring Russian oil | freight, insurance and ship sales against 2019–2021, × the money rule | either | [services-shipping-companies.md](services-shipping-companies.md#shipping) |
| Gold and hidden payments to Russia | gold and channels missing from customs data, × Russia's net gain on gold (round 10) | Russia | [trade.md](trade.md#gold-and-hidden-channels) |
| Undisclosed military aid | beyond what Kiel records | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Private donations | national donation totals, GDP model elsewhere | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Weapons bought from Russia | payments against the expected level, outside customs data, × Russia's net gain on arms (round 10) | either | [russia-state-and-companies.md](russia-state-and-companies.md#weapons-bought-from-russia) |
| Nuclear projects and state loans from Russia | own payments for Rosatom construction, loan repayments against schedule, customs over-counts removed | either | [russia-state-and-companies.md](russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) |
| Paid to Russia by companies leaving it | exit contribution and forced discount, by home country | Russia | [russia-state-and-companies.md](russia-state-and-companies.md#companies-leaving-russia) |
| Profits sent to Russia by Russian-owned companies here | oil, gas, banks and telecoms (round 5) and metals, mining and chemicals plants such as Aughinish Alumina in Ireland (round 10), against 2019–2021; trusteeships count the other way | either | [russia-state-and-companies.md](russia-state-and-companies.md#russian-owned-companies-abroad) |
| Return denied to Russia on its frozen reserves | yearly return the frozen central-bank reserves would have earned (rates per currency and year); Euroclear and Clearstream a third to the host, two thirds to all EU members | Ukraine | [russia-state-and-companies.md](russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| Wages earned working in Russia (migrants' remittances) | labour remittances against the expected level, × the money rule; relocants' transfers left out | either | [trade.md](trade.md#remittances-and-relocants-round-7) |
| Fees earned settling Russia's trade (payment agents) | fees kept by residents of the agent's country, against 2021 | Russia | [trade.md](trade.md#payment-agents-round-6) |
| Share of new IMF, World Bank and EBRD lending | rise over pre-war own-risk lending, at economic value, by shareholding | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#loans-at-their-economic-value-round-5) |
| Flowing back (optional, on by default) | every euro for Ukraine followed to the economy where it was spent (own and others' aid incl. stock replacement, arms Ukraine bought, energy, relief and rebuilding) and extra sales to Ukraine, × the money rule | subtracted from the balance with Ukraine | [aid-refugees-military.md](aid-refugees-military.md#flowback) |

Not a part of its own, but built into the parts above:

- **Energy premium and oil discount** belong to the *cost* view (below), not the net shift ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#energy-premium-and-oil-discount)).
- **Residual gap**: sales to Russia missing from partners' data are added to the country of origin inside "sold to Russia" ([trade.md](trade.md#residual-gap)).
- **Re-export hubs, transit gas, hub resale, Baltic pass-through, freight**: these move value between countries before the parts are computed ([trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md)).
- **Sanctions label**: which share of a cut was required by sanctions is shown as a label and does not change totals ([trade.md](trade.md#sanctions-mandated-or-own-choice)).

## The money rule (round 6)

Money a country **pays out** counts at full value: it leaves the economy (since round 10, payments to Russia count at
Russia's net gain on them; see [the net-gain rule](#the-net-gain-rule-round-10)). Money a country
**earns** (from Russia, or from the war effort for Ukraine) counts at the **value kept in its economy × how much of it
is genuinely extra**:

- **value kept**: the domestic value-added share of the sale (OECD Trade in Value Added, 2025 edition; for weapons,
  defence-industry evidence: US 0.90, Germany, France, UK, Italy 0.72–0.75, Czechia 0.55);
- **genuinely extra**: the share that would not exist without the sale (weapons 0.6 by default, US 0.70 with 155mm
  output up from 14,000 to about 40,000 rounds a month; sales lost to Russia 0.20–0.45 because many firms found other
  buyers; extra sales to Russia 0.40–0.60; extra fuel sales to Ukraine 0.20; tourism lost 0.30; shadow shipping 0.65).

So US weapons sold for Ukraine count at 0.63 (0.45–0.77), Germany's at 0.47, lost sales to Russia at 0.17–0.32,
Greek shipping at 0.17. This replaces the flat 20% profit used before for flowback, sales and services to Russia and
shipping. Factors per country and kind of earning: [`value_kept.json`](../../research/2026-10/gaps/value_kept.json)
([notes](../../research/2026-10/gaps/value_kept-notes.md)); `c.vk` in `data.json`; applied in `calc()`.

## The net-gain rule (round 10)

Aid is a gift: Ukraine gets EUR 1 and gives nothing back, so aid counts at full value. Trade is an exchange: the
seller gets EUR 1 but gives up goods that cost workers, fuel, machines and materials to make. To put both on one scale,
trade counts at the **seller's net gain**: the taxes the seller's state collects on the sale plus profit above a normal
return on capital (8–10% a year), as a share of the export price. Wages, materials, transport, depreciation and a normal
return are real costs and do not count. This is the same rule the map already used for sales *to* Russia (the money
rule above), now applied to the other side of each trade. The suggestion came from a reader on Reddit.

**Russia's net gain per euro** ([`net_gain_russia.json`](../../research/2026-10/gaps/net_gain_russia.json),
[notes](../../research/2026-10/gaps/net_gain_russia-notes.md)), central values:

| what Russia sells | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| crude oil | 0.69 | 0.68 | 0.64 | 0.65 | 0.53 | 0.61 |
| oil products | 0.61 | 0.65 | 0.62 | 0.59 | 0.47 | 0.59 |
| pipeline gas | 0.60 | 0.84 | 0.69 | 0.60 | 0.54 | 0.57 |
| LNG (Russian owners' part) | 0.35 | 0.54 | 0.47 | 0.36 | 0.37 | 0.35 |
| coal | 0.30 | 0.44 | 0.20 | 0.06 | 0.02 | 0.04 |
| all other goods (weighted) | 0.20 | 0.18 | 0.14 | 0.12 | 0.11 | 0.13 |
| services | 0.08 | 0.08 | 0.08 | 0.08 | 0.08 | 0.08 |
| arms | 0.12 | 0.12 | 0.12 | 0.12 | 0.12 | 0.12 |
| gold | 0.39 | 0.33 | 0.40 | 0.49 | 0.58 | 0.66 |

Crude in 2023, for example: Russia sold at 64.2 USD a barrel FOB; real costs were 23 USD (lifting 4, pipelines and
ports 5, depreciation 6.5, overhead 1.5, normal return 6), so the net gain is 0.64, of which the state took 0.47 in
taxes (Finance Ministry totals). Each country's payments get the gain of what it bought: the 2019–2021 customs mix
for what was expected without the war, and that mix moved by the fuel tracker's change in fuel since 2021 for what was
bought (`apply_net_gain()`; Moldova's gas from its own customs, since Transnistria's gas is not counted). Gold counts
at Russia's gain on gold: Hong Kong's purchases (98% precious metals) and the gold Hong Kong and the UAE pass on to
their buyers are tagged as gold.

**Ukraine's net gain per euro** ([`net_gain_ukraine.json`](../../research/2026-10/gaps/net_gain_ukraine.json),
[notes](../../research/2026-10/gaps/net_gain_ukraine-notes.md)): about 0.18 before the war, 0.06 in 2022, 0.045 in
2023, 0.07 in 2024 and 0.105 in 2025, weighted by the buyer's own mix of goods for its 12 largest buyers. It is low
because war-time logistics (Danube ports, rail, insurance) took much of the price; grain was 0.025 in 2023.

**What counts in full:** aid, refugee hosting, the extra paid because of war-time fuel prices (the premium cost Russia
nothing more to produce), taxes companies pay in Russia, profits sent to Russia, exit payments and the return on
frozen reserves. The *cost* view and the *To Ukraine* and *To Russia* views (money, not gain) do not change.

**Effect:** both sides shrink toward zero, most for countries whose score came from buying less from Russia: Lithuania
+27.8 → +14.9% of GDP, Estonia +23.2 → +9.4, Finland +16.3 → +9.0, Moldova +22.7 → +3.6, Germany +5.2 → +3.5, India
−5.2 → −2.9. Ranges narrow: the median width falls from 4.7 to 2.1 points, because the uncertain no-war level is now
multiplied by a smaller number.

## Two balances (round 6)

The headline adds two balances, shown as cards in each country panel:

- **with Ukraine**: aid, EU share, refugees, extra purchases from Ukraine, donations, multilateral lending, minus money
  flowing back from the war effort into the country's economy;
- **with Russia**: everything else.

A negative balance with Ukraine is shown as its real number and means **net earning from the war effort**, not money
toward Russia. On the map a country whose total is negative mainly because of that is **gold**, not orange; any other
country that earns more than it gives on the Ukraine side (blue overall, or orange mainly because of Russia) gets a thin
gold outline (threshold EUR 10m and 0.05% of GDP).

## The cost view

"Cost carried" is a second lens: what the country gave up, not where money went. Parts (`costParts` in `calc()`): aid with loans at the lender's grant equivalent (30% of face value, `LOAN_GRANT_ELEMENT`; the net shift uses their value to Ukraine instead), donated weapons at their recorded value, refugee hosting at net cost, refugee hosting, undisclosed aid, private donations, the extra price paid to replace Russian energy, profit lost on sales to Russia (goods and services, 20%), import tariffs dropped for Ukraine (4% of purchases from Ukraine, EU, UK and Canada only), minus discounts gained on Russian oil, and minus flowback profit.

## The other lenses

- **To Ukraine**: aid + refugees + purchases from Ukraine (totals, not changes).
- **To Russia**: payments for goods, laundered oil, company taxes, weapons, services and hidden channels (totals).

## Rules that apply everywhere

- **No country is rewarded for missing data.** Gaps are filled with estimates with wide ranges, never left at zero ([`gaps.md`](../../research/2026-10/gaps.md) lists per country what is reported or estimated).
- **Counted where used.** Gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them, Hong Kong's Russian gold partly at mainland China.
- **Counted once.** [`check_data.py`](../../pipeline/check_data.py) tests for double counting ([pipeline.md](../reference/pipeline.md#checks)).
- **Rankings** leave out economies under EUR 5bn GDP and countries whose likely range crosses zero (`MIN_GDP_RANK` and `rankList()` in [`site/index.html`](../../site/index.html)).

## A worked reading

Germany, 2022–August 2026: about +4.2% of a year's GDP toward Ukraine (likely range 2.6% to 7.2%, EUR 183bn on a 2024 GDP of EUR 4,329bn). Its balance with Ukraine is +68bn (gave 77.5, earned back 9.9) and its balance with Russia +116bn. In EUR bn, the largest parts are:

| part | middle (range) |
|---|---|
| Less paid to Russia (volume at pre-war prices, against the expected level) | +111.1 (47.0 to 227.5) |
| Aid to Ukraine (bilateral, Kiel) | +30.2 (28.6 to 32.5) |
| Hosting refugees (net cost) | +29.5 (11.7 to 42.6) |
| Income lost on sales to Russia given up (money rule) | +21.7 (5.8 to 54.6) |
| Share of EU-level aid | +14.4 (10.1 to 16.5) |
| Extra paid to Russia because of war-time prices (mostly 2022 gas) | −29.2 (−33.6 to −25.9) |
| Own aid spent in its own economy, incl. replacing donated stock (money rule) | −5.6 (−10.8 to −2.5) |

The wide range comes almost entirely from "less paid to Russia": the expected no-war level of Germany's purchases is uncertain (see [counterfactual.md](counterfactual.md)), and the total takes the weakest certainty letter of its parts (D). The "How it works" view on the map ([`views2.js`](../../site/views2.js)) builds this waterfall live for Germany, Poland, the US, Hungary, India and China.

## See also

- [counterfactual.md](counterfactual.md), [prices.md](prices.md), [ranges.md](ranges.md): the three ingredients of every trade part
- [reference/pipeline.md](../reference/pipeline.md): how the parts are built into `site/data.json`
- [limitations.md](../limitations.md): what the method does not capture
- [Research log by round](../../research/2026-10/README.md)
- [Documentation index](../README.md)
