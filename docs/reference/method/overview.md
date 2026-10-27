# Method overview: one scale for every flow: technical reference

Developer reference for the method page [Method overview: one scale for every flow](https://warbalance.org/#view=how&sec=m-overview). It keeps every parameter, research file, function name and formula behind that page, as the page stood before it was shortened for readers (round 38). The site's page explains the same method in plain words; when the two differ, the code and the research files decide.


The map gives every country **two numbers** for the time since the full-scale invasion, compared with what it would have done without the war, and their sum, the **net**:

- **Support for Ukraine**: aid (loans counted as gifts), refugee hosting, purchases from Ukraine at Ukraine's net gain, minus money flowing back from the war effort. These are things done for Ukraine.
- **Russia's earnings from trade**: how much less (positive, toward Ukraine) or more (negative, toward Russia) Russia earned from the country than without the war, and what the country earned from selling to Russia. **Earnings means what really stays with them: taxes and profit above a normal return, not the full price paid; it includes war-time prices.** It covers less or more paid to Russia, the war-time price windfall, fuel made from Russian crude elsewhere, sales to Russia, company taxes, weapons sent and the rest. This includes cuts Russia made itself (gas Gazprom cut off, the end of gas transit through Ukraine), which the panel labels. It is not money moved to Ukraine. Migrants' wages sent home from Russia are in neither number: they are a marker ([below](https://warbalance.org/#view=how&sec=m-overview-markers-outside-the-totals)).

The map opens with the **net** (the default map colour, ranking and share-card headline), always with a warning that it adds two different things, help given to Ukraine and the change in what Russia earns from trade, and that much of what one country stopped paying, Russia sold to others. Its two parts are maps of their own: **support for Ukraine**, and **Russia's earnings from trade**, with the world total in its title. The net also includes a third line, Russian money frozen (the return Russia lost on its frozen reserves), which is not a payment. Worldwide, Russia's net gain on goods and fuel over 2022–August 2026, against the level expected without the war, fell by EUR 353.4bn<!-- n:WORLD.less --> from buyers who cut and rose by EUR 216.4bn<!-- n:WORLD.more --> from buyers who bought more: in total EUR 137.1bn<!-- n:WORLD.net --> less. These are Russia's net gains (its taxes plus profit above a normal return), not payments. Every flow we can find (aid, refugee hosting, trade, energy, services, shipping, company taxes, weapons, hidden channels) is turned into the same unit: a change against the expected no-war level, measured in volumes and valued at each year's prices, summed over 2022 to the chosen year (2026 = January–August), as a percentage of **one** year's GDP (the average of 2022–2024). It is a total for the whole period, not a yearly rate. This page defines that scale and lists every part, each with a link to the page that explains it in detail.

## The core idea in four steps

1. **Change, not totals.** A country that bought the same volume of Russian oil every year before the war and still does has shifted nothing in volume; one that stopped has shifted that volume. (If it paid war-time prices for the same volume, the extra Russia earned is counted separately, as the war-time price windfall.) Trade parts are therefore measured against an *expected* level: what the country would have traded without the war. How that is predicted is the subject of [counterfactual.md](https://warbalance.org/#view=how&sec=m-counterfactual).
2. **Volumes, valued at each year's prices.** Fuel prices doubled or more in 2022. Paying twice as much for the same oil is not a shift in behaviour, so traded values are divided by a price level (`pidx`, 2019–2021 = 1) before they are compared ([prices.md](https://warbalance.org/#view=how&sec=m-prices)). The change in volume is then valued at that year's prices, so every part is in current euros like aid; fuel at the prices a no-war market expected. The extra money Russia earned from the higher prices is counted separately, as the war-time windfall. <span class="incode">In the code: `cur`</span>
3. **Summed 2022 up to the chosen year.** The map adds the yearly changes. 2026 counts eight months. <span class="incode">In the code: `FRAC = 8/12`</span>
4. **As % of one year's GDP.** The total is divided by the country's average nominal GDP over 2022–2024 in euros (World Bank WDI, or IMF WEO where the 2024 figure comes from it, each year at its ECB rate: [`gdp_avg_r15.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/gdp_avg_r15.json); the 2024 GDP alone is kept in [`other.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/other.json) and in the method band; gaps from [`residual.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/residual.json)). The average matters where a currency collapsed: Nigeria's 2024 GDP was a third of its 2022 GDP in euros, so its +0.81% against 2024 is +0.44%<!-- n:NGA.net --> against the average. It is **not a yearly rate**: over 2022 to August 2026 (about 4.7 years) divide by 4.7 for an average year; the panel shows that line. Total euros is the alternative measure on the map (Filters → Measure). Code: `scaled()` in [`site/index.html`](https://github.com/intelligent-cream/war-balance/blob/main/site/index.html).

**One rule for what counts (owner, round 52).** A country's figure reflects its own choices and the foreseeable answers to them. Things forced on it that it did not choose — Ukraine's strikes on Russian refineries, Russia's sudden export bans — count neither for it nor against it. Counted as choices or foreseeable answers: embargoes, sanctions, the price cap, switching suppliers, Russia's 2022 gas cut-off, Russia's counter-sanctions and import bans on "unfriendly" countries, and the war-time prices paid by buyers who kept buying (the windfall). Not counted: the supply losses in [Forced losses of Russian supply](counterfactual.md#forced-losses-of-russian-supply-round-52) (strikes, the 2023 export ban, the 2026 Druzhba halt), applied by `strike_supply()` in `build_data.py`.

**Units, plainly.** Every part is in euros of each year, like aid: trade is measured in volumes and each year's change is valued at that year's prices (other goods at their own price level, fuel at the prices a no-war market expected); aid, refugee costs, taxes and the windfall are money of each year. The denominator is nominal GDP, the average of 2022–2024.

For one traded flow, one year:

```
change_i = base × FRAC_i × bmul_i  −  value_i / pidx_i
```

Positive means less than expected. Whether that counts toward Ukraine or Russia depends on the flow (paying Russia less is toward Ukraine; buying from Ukraine more is toward Ukraine). The site's `calc(c, y)` in [`site/index.html`](https://github.com/intelligent-cream/war-balance/blob/main/site/index.html) computes every part with a middle value and a likely range; [ranges.md](https://warbalance.org/#view=how&sec=m-ranges) explains the ranges.

## Every part of the net shift

The parts below are what the country panel's "What makes up the number" shows (`shiftParts` and `backParts` in the code). "Toward" says which way a positive amount points; "number" says which of the two headline numbers it belongs to (U = support for Ukraine, R = Russia's earnings from trade; `UA_PARTS` in `calc()`). The return Russia lost on its frozen reserves is neither: it is a line of its own, added to the net only. <span class="incode">In the code: `OWN_LINE`</span>

| part on the map | how it is counted | toward | page |
|---|---|---|---|
| Aid to Ukraine (U; labelled "Kiel, adjusted": the panel shows Kiel's own figure next to it, for example Poland's EUR 9.2bn with loans at their full amount, EUR 2.95bn<!-- n:POL.part_aid --> here) | Kiel Institute allocations (bilateral), loans repaid from frozen Russian assets left out; loans at their economic value, donated weapons at market value, military aid counted when delivered | Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-aid) |
| Share of EU-level aid | EU institutions' aid split over members by EU budget share | Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-eu-level-aid) |
| Hosting refugees | what all levels of government spend on refugees from Ukraine (budgets where reported, else a calibrated model), donor-paid part taken off, minus the host's own gain on refugees' work | Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-refugees) |
| Extra purchases from Ukraine (U) | rise above the expected level, the years summed with their signs and only the total floored at zero, × Ukraine's net gain | Ukraine | [trade.md](https://warbalance.org/#view=how&sec=m-trade) |
| Less (or more) paid to Russia | expected minus actual goods imports from Russia (small flows from their 2019–2021 median at pre-war prices); fuel and gold at the prices a no-war market expected, other goods at pre-war prices; × Russia's net gain on that mix of goods | either | [trade.md](https://warbalance.org/#view=how&sec=m-trade), [energy-and-laundered-oil.md](https://warbalance.org/#view=how&sec=m-energy-and-laundered-oil) |
| Extra paid because of war-time prices (windfall) | payments for Russian fuel minus the same volume at no-war prices, × Russia's net gain on that extra price (1 for oil and pipeline gas, about 0.7 for LNG, at most the coal rent for coal); negative where Russia sold below them | either | [prices.md](https://warbalance.org/#view=how&sec=m-prices-war-time-windfall) |
| Russian oil bought via other countries (laundered oil) | Russian crude inside fuel refined elsewhere, EU refiners included (measured share per refiner and year), in volumes at the no-war crude price against its pre-war level, both ways, × Russia's net gain on crude; charged to the buyer of the fuel | either | [energy-and-laundered-oil.md](https://warbalance.org/#view=how&sec=m-energy-and-laundered-oil-laundered-oil) |
| Income lost on sales to Russia given up / income from extra sales | expected minus actual exports to Russia, × the seller's net gain × genuinely extra | either | [trade.md](https://warbalance.org/#view=how&sec=m-trade-profit-not-revenue) |
| Less (or more) tax paid in Russia by companies | profit tax + half of other taxes, against 2018–2021 | either | [services-shipping-companies.md](https://warbalance.org/#view=how&sec=m-services-shipping-companies-company-taxes) |
| Weapons and troops sent to Russia | North Korea, Iran, Belarus, China's unrecorded part; what Russia paid for, also in kind, at the seller's net gain, the rest in full; troops' pay in full | Russia | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-military-support-to-russia) |
| Less (or more) paid to Russia for services | expected minus actual services imports, × Russia's net gain on services | either | [services-shipping-companies.md](https://warbalance.org/#view=how&sec=m-services-shipping-companies-services) |
| Income lost on services to Russia given up (e.g. tourism) | expected minus actual services exports, × the seller's net gain × genuinely extra | either | [services-shipping-companies.md](https://warbalance.org/#view=how&sec=m-services-shipping-companies-services) |
| Income from shipping and insuring Russian oil | freight and insurance against 2019–2021, × the shipper's or insurer's net gain × genuinely extra; ship sales at their price premium | either | [services-shipping-companies.md](https://warbalance.org/#view=how&sec=m-services-shipping-companies-shipping) |
| Gold and hidden payments to Russia | gold and channels missing from customs data, × Russia's net gain on gold | Russia | [trade.md](https://warbalance.org/#view=how&sec=m-trade-gold-and-hidden-channels) |
| Undisclosed military aid | beyond what Kiel records | Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations) |
| Private donations | national donation totals, GDP model elsewhere | Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations) |
| Weapons bought from Russia | payments against the expected level, outside customs data, × Russia's net gain on arms | either | [russia-state-and-companies.md](https://warbalance.org/#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia) |
| Nuclear projects and state loans from Russia | own payments for Rosatom construction, loan repayments against schedule, customs over-counts removed | either | [russia-state-and-companies.md](https://warbalance.org/#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia) |
| Profits sent to Russia by Russian-owned companies here | oil, gas, banks and telecoms, and metals, mining and chemicals plants such as Aughinish Alumina in Ireland, against 2019–2021; trusteeships count the other way | either | [russia-state-and-companies.md](https://warbalance.org/#view=how&sec=m-russia-state-and-companies-russian-owned-companies-abroad) |
| Russian money frozen (own line, net only) | yearly return the frozen central-bank reserves would have earned (rates per currency and year); Euroclear and Clearstream a third to the host, two thirds to all EU members | Ukraine | [russia-state-and-companies.md](https://warbalance.org/#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves) |
| Fees earned settling Russia's trade (payment agents) | fees kept by residents of the agent's country, against 2021, × the financial industry's net gain × genuinely extra | Russia | [trade.md](https://warbalance.org/#view=how&sec=m-trade-payment-agents) |
| Share of new IMF, World Bank and EBRD lending | rise over pre-war own-risk lending, at economic value, by shareholding | Ukraine | [loans.md](https://warbalance.org/#view=how&sec=m-loans-new-lending-by-the-imf-and-world-bank) |
| Flowing back (U; optional, on by default) | every euro for Ukraine followed to the economy where it was spent (own and others' aid incl. stock replacement, arms Ukraine bought, energy, relief and rebuilding) and extra sales to Ukraine, × the seller's net gain × genuinely extra; also refugee hosting spent in the host's own economy, × services' net gain × genuinely extra ([refugee spending](https://warbalance.org/#view=how&sec=m-aid-refugees-military-refugee-spending-flowing-back)) | subtracted from support for Ukraine | [aid-refugees-military.md](https://warbalance.org/#view=how&sec=m-aid-refugees-military-flowback) |

Not a part of its own, but built into the parts above:

- **Energy premium and oil discount** belong to the *cost* view (below; not shown on the site, in the full data download), not the net shift ([energy-and-laundered-oil.md](https://warbalance.org/#view=how&sec=m-energy-and-laundered-oil-energy-premium-and-oil-discount)).
- **Taken by Russia**: assets Russia seized and forced exit costs (the forced discount and the exit fee) are a sacrifice, not money the country chose to move. They are not in the net shift or either headline number: a marker on the map (layer "Taken by Russia") and a column in the full data download ([russia-state-and-companies.md](https://warbalance.org/#view=how&sec=m-russia-state-and-companies-taken-by-russia-not-in-the-totals)).
- **Residual gap**: sales to Russia missing from partners' data are added to the country of origin inside "sold to Russia" ([trade.md](https://warbalance.org/#view=how&sec=m-trade-residual-gap)).
- **Re-export hubs, transit gas, hub resale, Baltic pass-through, freight**: these move value between countries before the parts are computed ([trade.md](https://warbalance.org/#view=how&sec=m-trade), [energy-and-laundered-oil.md](https://warbalance.org/#view=how&sec=m-energy-and-laundered-oil)).
- **Sanctions label**: which share of a cut was required by sanctions is shown as a label and does not change totals ([trade.md](https://warbalance.org/#view=how&sec=m-trade-sanctions-mandated-or-own-choice)).
- **Markers outside the totals**: see [below](https://warbalance.org/#view=how&sec=m-overview-markers-outside-the-totals).
- **Cut by Russia label**: the part of "less paid to Russia" that is gas Russia cut off itself (Poland and Bulgaria from 27 April 2022, Finland 21 May, the Netherlands 31 May, Denmark 1 June, Germany from June, Latvia 30 July, France's Engie 1 September and Moldova from October 2022, Austria's OMV 16 November 2024) or that stopped when Ukraine ended gas transit on 1 January 2025 (Slovakia, Italy). The first year counts from the cut date. For a cut after 2022, only the gas the country still bought the year before the cut counts as cut off by Russia; the rest of its fall from the pre-war level was its own earlier choice. Italy, for example, had already cut its Russian gas from about 29 bcm in 2021 to 3–6 bcm in 2023–2024, so only about a twentieth of its fall is labelled as cut by Russia. A label inside the second number; totals do not change. Data: `sanctions_share.json` `gas_part` in those years (Poland's from final-use volumes, as its customs book the gas under other headings), dates in `RUSSIA_GAS_CUT` in `build_data.py`, evidence in `sources_r11.json` `gas_cuts`. It is printed only where Russia cut the country's gas.

## Markers outside the totals

Three things are shown on the map and in the panel but added to no total, because the money is already counted elsewhere
or is not a country's choice:

- **Critical goods** (◆): sales to Russia of goods its weapons need; the money is already inside Russia's earnings
  from trade ([trade.md](https://warbalance.org/#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker)). Large
  sellers also get the tag "Sold Russia goods its weapons need" ([tags](https://warbalance.org/#view=how&sec=m-tags)).
- **Wages from Russia** (△): the change in migrants' remittances from Russia against the expected level, as
  % of GDP since 2022, with "depends on wages earned in Russia" where migrants sent at least 1% of GDP a year. They are
  not in the totals: they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's
  home; the real gain over the alternatives is small and hard to measure; and they would dominate the bottom of the
  ranking (Tajikistan would be about −40% of GDP, almost all remittances; without them it is −0.39%<!-- n:TJK.net -->
  and Uzbekistan −4.11%<!-- n:UZB.net -->) ([trade.md](https://warbalance.org/#view=how&sec=m-trade-remittances-and-relocants),
  [decisions](../../changelog-full.md#cl-why-remittances-from-russia)). The CSV and JSON downloads carry it in columns marked "not in totals".
- **Taken by Russia** (above).

## One rule for every seller

Every sale, whoever the seller, counts the same way:

> **every sale counts at the seller's net gain × the share that is genuinely extra**

- **Net gain** = (other taxes on production − subsidies + net operating surplus − the labour part of mixed income − a normal return on the net capital stock: 5% a year above inflation after tax plus the country's risk premium, 4–6% in the low and high cases) ÷ output, by country and industry, from the OECD STAN database (2025 edition), 2021–2023 ([`net_gain_sellers.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers.json), [notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md), script [`net_gain_sellers.py`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/scripts/net_gain_sellers.py)). Profit tax is paid out of the surplus, so it is inside. The normal return is the same as Russia's. The 38 economies in STAN use their own figures; every other economy uses the OECD median of the industry, labelled as such.
- **Genuinely extra** is the share of a sale that would not exist without it ([`value_kept.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/value_kept.json), [notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/value_kept-notes.md)): weapons 0.6 by default, the US 0.70 with 155mm output up from 14,000 to about 40,000 rounds a month; sales lost to Russia 0.20–0.45, because many firms found other buyers; extra sales to Russia 0.40–0.60; extra fuel sales to Ukraine 0.20; tourism lost 0.30; shadow shipping 0.65. It measures additionality, not value.
- It applies to sales to Russia and to Ukraine, money flowing back (own and others' aid spent at home, arms Ukraine bought), services, shipping and insurance, payment agents and paid weapons sent to Russia.
- Aid, refugee hosting, money not paid (unpaid weapons), taxes and profits paid to Russia, and the return denied on frozen reserves keep their full value.

Manufacturing earns little above a normal return on its capital, as Russia's "other manufactured goods" do. So US weapons sold for Ukraine count at about 0.036 of their value, and **Russia's own payments** are at Russia's net gain like every other sale.

**Weapons sent to Russia** ([`military_payment_r13.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_payment_r13.json), [notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_payment_r13-notes.md)): paid deliveries are sales, also when Russia paid in kind (technology, components, fuel, food: INSS puts in-kind payment at 80–96% of North Korea's compensation). They count at the seller's net gain × genuinely extra; North Korea's outdated stock (about half, per Ukraine's intelligence) at 0.9 of its price, since it had no other use. Unpaid deliveries (Belarus's army stocks, no payment found) count in full. Troops' pay counts in full (it goes to the North Korean state, and the soldiers' alternative pay is close to nothing).

**The windfall** counts at Russia's net gain on the extra price: costs do not rise with the price, so that is all of it for crude, products and pipeline gas, the profit tax plus Russia's 60% of the profit after tax for LNG (0.68–0.74), and at most the coal rent for coal.

## The net-gain rule

Aid is a gift: Ukraine gets EUR 1 and gives nothing back, so aid counts at full value. Trade is an exchange: the
seller gets EUR 1 but gives up goods that cost workers, fuel, machines and materials to make. To put both on one scale,
trade counts at the **seller's net gain**: the taxes the seller's state collects on the sale plus profit above a normal
return on capital, as a share of the export price. Wages, materials, transport, depreciation and a normal return are
real costs and do not count. It is the same rule for every seller ([above](https://warbalance.org/#view=how&sec=m-overview-one-rule-for-every-seller)).
The suggestion came from a reader on Reddit.

**Russia's net gain per euro** ([`net_gain_russia.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_russia.json),
[notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_russia-notes.md)), central values:

| what Russia sells | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| crude oil | 0.62 | 0.62 | 0.57 | 0.58 | 0.45 | 0.55 |
| oil products | 0.52 | 0.58 | 0.54 | 0.51 | 0.38 | 0.52 |
| pipeline gas | 0.55 | 0.82 | 0.66 | 0.56 | 0.50 | 0.53 |
| LNG (Russian owners' part) | 0.31 | 0.52 | 0.44 | 0.31 | 0.33 | 0.31 |
| coal | 0.27 | 0.41 | 0.17 | 0.03 | 0.02 | 0.02 |
| all other goods (weighted) | 0.17 | 0.14 | 0.12 | 0.10 | 0.10 | 0.11 |
| services | 0.026 | 0.029 | 0.032 | 0.030 | 0.036 | 0.036 |
| arms | 0.043 | 0.039 | 0.045 | 0.049 | 0.050 | 0.050 |
| gold | 0.37 | 0.31 | 0.38 | 0.47 | 0.56 | 0.64 |

Services, arms and the other goods use official sector profitability (Rosstat by activity), export duties collected and company results ([decisions](../../changelog-full.md#cl-r11)).

Russia's normal return follows the sellers' rule: 5% a year above inflation after tax (4–6%) plus Russia's risk premium (3.9%), on book capital as a nominal US dollar rate (+2.5% expected inflation): 11.4% a year. Capital per unit of revenue is measured for every product group (company balance sheets, Rosstat, Damodaran's emerging-market industry data). Crude in 2023, for example: Russia sold at 64.2 USD a barrel FOB; real costs were 27.4 USD (lifting 4, pipelines and
ports 5, depreciation 6.5, overhead 1.5, and a normal return of 10.4: 11.4% on 91 USD of capital per
barrel, from Rosneft's balance sheet), so the net gain is 0.57, of which the state took 0.47 in taxes (Finance
Ministry totals). Each country's payments get the gain of what it bought: <span class="incode">In the code: `apply_net_gain()`</span>

- **expected without the war**: the 2019–2021 customs share of fuel in its purchases from Russia, split over crude,
  products, pipeline gas, LNG and coal as the fuel tracker records them in 2021;
- **bought each year**: that fuel share moved by the tracker's change in fuel volume against all payments in volume
  since 2021, with that year's split, all at constant 2019–2021 prices, so price changes (counted as the war-time
  premium) do not move the mix, and 2021 matches the expected mix exactly. `check_data.py` tests that the same volumes
  give the same gain;
- **fuel a refiner passes on** (India, Türkiye, China) counts at the gain on crude, the same as for its buyers;
- **gold** counts at the gain on gold: gold the UAE and Hong Kong pass on to their buyers, and Hong Kong's own rise
  since before the war (all of it precious metals: UN Comtrade shows Hong Kong's HS 71 imports from Russia rising more
  than its total in every year; see [trade](https://warbalance.org/#view=how&sec=m-trade-hong-kong-gold)); everything the UAE passes on is
  treated as gold. The gold in the payments is deflated with the gold price index, not the country's pre-war mix
  (Hong Kong's was half palladium, whose price fell while gold's rose to 2.7 times its 2019–2021 level);
- **Moldova's gas** comes from its own customs, since Transnistria's unpaid gas is not counted;
- the Rosatom customs over-count taken out of Türkiye's and Egypt's payments is rescaled to the same gain.

Gold and hidden payments stay in money in `data.json` (for the gross trade flows, an option in Filters) and are weighted
in the map; weapons bought from Russia are stored already at Russia's gain on arms.

**Ukraine's net gain per euro** ([`net_gain_ukraine.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_ukraine.json),
[notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_ukraine-notes.md)): about 0.10 before the war, 0.033 in 2022,
0.025 in 2023, 0.036 in 2024 and 0.055 in 2025, weighted by the buyer's own mix of goods for its 12 largest buyers. It
is low because war-time logistics (Danube ports, rail, insurance) take much of the price, and because investors in
Ukraine need a high return: the normal return is 5% real plus Ukraine's country risk premium (15.5%), 23% nominal after
tax, so what is left is mostly taxes; grain was 0.015 in 2023.

**What counts in full:** aid, refugee hosting, taxes companies pay in Russia, profits sent to Russia,
unpaid weapons and the return on frozen reserves. The extra paid because of war-time fuel prices counts at Russia's
net gain on it, which is all of it for oil and pipeline gas.

## Two numbers

The two headline numbers are shown everywhere (map tooltip, panel, ranking, share cards and downloads), with the net as
their sum:

- **support for Ukraine**: aid, EU share, refugees, extra purchases from Ukraine, donations, multilateral lending,
  minus money flowing back from the war effort into the country's economy;
- **Russia's earnings from trade**: everything else. A positive value means the country cut Russia's earnings
  against the level without the war; sentences say it in words ("cut Russia's earnings from trade by €65.8bn (1.6% of
  GDP)"), and its two sides say who kept what ("Russia kept … less", "… kept … less from selling to Russia").

A negative support for Ukraine is shown as its real number and means **net earning from the war effort**, not money
toward Russia. On the map a country whose net is negative mainly because of that is **grey**, not orange. Support
below zero is grey on the support map too.

## The cost view

**The site does not show this view**: `calc()` still works it out, and the full data download (How it works → [Download the data](https://warbalance.org/#view=how&sec=data) → "Full data (CSV)") keeps it as `cost_to_the_country_eur_bn_not_shown_on_the_site` ([decisions](../../changelog-full.md#cl-r19)). What follows describes the model.

"Cost to the country" is what the war cost the country itself, after gains such as cheaper Russian oil or business won back; what the country gave up, not where money went. Parts: <span class="incode">In the code: `costParts` in `calc()`</span>

- aid with loans at the lender's cost: per loan item, the loan's terms and the expected loss of its creditor class, discounted at the lender's own funding rate, with a low and high value per country. The net shift uses the value to Ukraine instead ([loans](https://warbalance.org/#view=how&sec=m-loans-the-cost-view));
- donated weapons at their recorded value;
- refugee hosting;
- undisclosed aid and private donations;
- the extra price paid to replace Russian energy;
- income lost on sales to Russia, goods and services, at the seller's net gain × genuinely extra ([one rule](https://warbalance.org/#view=how&sec=m-overview-one-rule-for-every-seller));
- import tariffs dropped for Ukraine (EU, UK and Canada only: about 0.2% of purchases from Ukraine, the average of the EU's 0.3% in June 2022 to June 2025, the UK's 0.2% and Canada's 1%);
- minus discounts gained on Russian oil;
- minus money flowing back, at the seller's net gain × genuinely extra.

## Gross flows

The map shows changes, not gross totals: gross totals include normal trade and measure something different. The gross flows are still shown in each country's panel (the small charts, such as "Paid to Russia" and "Bought from Ukraine"), in the downloads (aid, refugees, paid to Russia) and in the gross trade flows (an option in Filters). Links with `lens=ukr` open support for Ukraine, `lens=rus` Russia's earnings from trade.

## How the map shows it

**One colour rule** applies everywhere: blue toward Ukraine, orange toward Russia, grey no clear change, support below
zero and a net that is mainly earning from the war effort. A number whose direction is not certain takes a faded
colour of its leaning direction. **Money streams** show the map's two numbers in euros (support for Ukraine to Kyiv;
how much more a country paid Russia than without the war to Moscow), never gross trade. **What's counted** lets a
reader switch parts off: `calc()` drops the parts in `OFF` in `live()`, so every total, band and grade follows, and the
page says "Custom mix, not the official figures"; with every switch on, `calc()` is unchanged. Every part in a
country's panel opens its method: how it is calculated, why, the country's sources and links to the method page and the
[trace](https://warbalance.org/#view=how&sec=flows-h).

## Rules that apply everywhere

- **No country is rewarded for missing data.** Gaps are filled with estimates with wide ranges, never left at zero ([`gaps.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps.md) lists per country what is reported or estimated).
- **Counted where used.** Gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them, Hong Kong's Russian gold partly at mainland China.
- **Counted once.** [`check_data.py`](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/check_data.py) tests for double counting ([pipeline.md](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/pipeline.md#checks)).
- **Rankings** leave out economies under EUR 5bn GDP (`MIN_GDP_RANK`). A number whose direction is not certain (the likely range **or any method-band alternative** gives it the other sign; `uncertain()` in [`site/index.html`](https://github.com/intelligent-cream/war-balance/blob/main/site/index.html)) stays in the ranking, faded and labelled: **"leaning"** toward Ukraine or Russia when the chance of its middle value's sign is at least 65% under a two-piece normal on its likely range (`leaning()`), **"uncertain"** below that. The map shows such countries in a faded colour of their leaning direction. Among the 163<!-- n:WORLD.nBig --> economies above EUR 5bn, 84<!-- n:WORLD.uncUa --> are not certain on support for Ukraine, 97<!-- n:WORLD.uncRus --> on Russia's earnings from trade and 88<!-- n:WORLD.uncNet --> on the net, of which 50<!-- n:WORLD.leanNet --> lean one way (the map's ⓘ counts them live; Türkiye, Kyrgyzstan, Hong Kong and the UAE lean toward Russia). Each of the three numbers has its own map and ranking.
- **Parties to the war** are listed under the ranking, not ranked, with their own category on the map; their numbers are in their panels. **Belarus**: Russia invaded Ukraine from its territory (UN General Assembly resolution ES-11/1, EU Council Regulation 2022/355). **North Korea**: its troops fought for Russia against Ukraine in the Kursk region from late 2024, which it confirmed in April 2025, and it supplied Russia with shells and missiles ([MSMT/2025/1, 29 May 2025](https://msmt.info/api/file/download/18858)). <span class="incode">In the code: `PARTY_TO_WAR`</span>

## No data

A trade part counts only where the country has its **own observation for the war years**:

| Part | Counts as observed |
|---|---|
| Purchases from and sales to Russia, purchases from and sales to Ukraine | a figure the country or its partners report for at least one of 2022-2025 (UN Comtrade, Eurostat, own or mirror); or a country-specific post-war record from the research: non-reporters' trade from tanker tracking and official statements, hubs' records of what they bought from the country and sold on to Russia, national statistics, gas by country of use, the Power of Siberia, Hong Kong's gold, refinery-specific research |
| Fuel made from Russian crude (bought via other countries) | the country's own customs records of fuel imports by origin, refiners' reported fuel exports to it, or refinery-specific research |

**Not an observation:** the pre-war trend carried forward, Russia's import gap split by countries' shares, and fuel
reached only through EU refiners' 2021 export shares. A part with no observation counts as zero (with the war-time price
part that rests on the same purchases) and is named under the trade section as "No data". A country with nothing
observed at all is hatched on the map as "No data", with no tags, no ranking and no leaning. Where a part mixes observed
and allocated pieces, the whole part stays (the pieces are not kept apart in the data). A year missing after observed
years (mostly 2025, the customs lag) is still filled from the country's own observed path. Every part removed:
[`no_data_effects.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/no_data_effects.md).
<span class="incode">In the code: `mark_no_data()` in `build_data.py`, `c.no_data` in `calc()`</span>

## A worked reading

Germany, 2022–August 2026: **supported Ukraine with 1.79%<!-- n:DEU.ua -->** of a year's GDP (EUR 74.7bn<!-- n:DEU.uaEur -->: gave 76.1<!-- n:DEU.uaGave -->, earned back 1.39<!-- n:DEU.uaBackEur -->; certainty C) and **cut Russia's earnings from trade by 1.74%<!-- n:DEU.rus -->** (EUR 72.6bn<!-- n:DEU.rusEur -->: Russia's net gain from Germany fell that much against the level expected without the war; of which EUR 21.9bn<!-- n:DEU.rusCut --> is gas Russia cut off itself; certainty C). With Russian money frozen (EUR 5.3bn<!-- n:DEU.frozenEur -->), the net is **toward Ukraine by 3.65%<!-- n:DEU.net -->** (likely 2.63%<!-- n:DEU.netLo --> to 4.99%<!-- n:DEU.netHi --> toward Ukraine, certainty C; EUR 152.5bn<!-- n:DEU.netEur --> on an average 2022–2024 GDP of EUR 4,179bn). An average year is about 0.7%. For 2022–2025 alone the net is +2.94%<!-- n:DEU.net2025 -->: 2026 adds a lot because fuel prices rose with the Hormuz crisis; valued at 2025 prices, the cut in Russia's earnings from trade is 1.62%<!-- n:DEU.alt_p26.rus --> instead of 1.74%<!-- n:DEU.rus --> ([prices](https://warbalance.org/#view=how&sec=m-prices-2026-and-the-hormuz-crisis)). What Russia took from German companies (seizures EUR 9.5bn, forced exits EUR 2.4bn) is not in either number; it is a marker on the map and a column in the full data download. In EUR bn, the largest parts are:

| part | middle (likely range) |
|---|---|
| Bought less from Russia (volume against the expected level, valued at each year's prices, at Russia's net gain) | 69.9<!-- n:DEU.part_paid --> (31.9<!-- n:DEU.part_paidLo --> to 116.6<!-- n:DEU.part_paidHi -->) toward Ukraine |
| Hosting refugees | 35.5<!-- n:DEU.part_ref --> (32.1<!-- n:DEU.part_refLo --> to 54.2<!-- n:DEU.part_refHi -->) toward Ukraine |
| Aid: weapons, money, loans (Kiel, adjusted) | 25.9<!-- n:DEU.part_aid --> (22.1<!-- n:DEU.part_aidLo --> to 32.6<!-- n:DEU.part_aidHi -->) toward Ukraine |
| Its share of EU aid | 11.6<!-- n:DEU.part_euaid --> (8.4<!-- n:DEU.part_euaidLo --> to 17.3<!-- n:DEU.part_euaidHi -->) toward Ukraine |
| Its firms pay Russia less tax | 5.4<!-- n:DEU.part_tax --> (1.9<!-- n:DEU.part_taxLo --> to 10.5<!-- n:DEU.part_taxHi -->) toward Ukraine |
| Less Russian oil via other countries | 4.3<!-- n:DEU.part_laund --> (2.3<!-- n:DEU.part_laundLo --> to 6.4<!-- n:DEU.part_laundHi -->) toward Ukraine |
| Russian money frozen (return Russia lost on its reserves) | 3.1<!-- n:DEU.part_frozen --> (2.1<!-- n:DEU.part_frozenLo --> to 3.8<!-- n:DEU.part_frozenHi -->) toward Ukraine |
| Paid Russia war-time fuel prices (mostly 2022 gas) | 16.5<!-- n:DEU.part_windfall abs --> (1.3<!-- n:DEU.part_windfallHi abs --> to 29.3<!-- n:DEU.part_windfallLo abs -->) toward Russia |

Kiel's own figure for Germany's aid is EUR 49.5bn; 25.9 is counted here because donated weapons are at their market value, loans at their gift value rather than their full amount, and military aid counts when delivered. Sales to Russia given up are 1.0<!-- n:DEU.part_sold --> toward Ukraine: German manufacturing earns about 3% above a normal return of 5% a year above inflation. The wide range comes almost entirely from "bought less from Russia": the expected no-war level of Germany's purchases is uncertain (see [counterfactual.md](https://warbalance.org/#view=how&sec=m-counterfactual)). The total is graded C: most of it rests on modelled parts (C), little on rough indications (D) ([ranges.md](https://warbalance.org/#view=how&sec=m-ranges-certainty-letters)). The method band (net 3.13%<!-- n:DEU.netBandLo --> to 3.81%<!-- n:DEU.netBandHi --> toward Ukraine: loans at the war-time yield, laundered oil, the normal return, without the gas Russia cut off, redirected trade by commodity, refugees at gross or at one common cost, 2026 at 2025 prices and 2024 GDP) is shown next to the range; without the gas Russia cut off itself gives the low end.
