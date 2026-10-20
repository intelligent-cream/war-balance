# Method overview: one scale for every flow

The map gives every country **two numbers** for the time since the full-scale invasion, compared with what it would have done without the war, and their sum, the **net**:

- **Support for Ukraine**: aid (loans counted as gifts), refugee hosting, purchases from Ukraine at Ukraine's net gain, minus money flowing back from the war effort. These are things done for Ukraine.
- **Kept from Russia** (called "kept from Russia" until round 17): how much less (positive) or more (negative) the country paid Russia than without the war: less or more paid to Russia, the war-time price windfall, fuel made from Russian crude elsewhere, sales to Russia, company taxes, weapons sent and the rest. This includes cuts Russia made itself (gas Gazprom cut off, the end of gas transit through Ukraine), which the panel labels. It is not money moved to Ukraine. Migrants' wages sent home from Russia are in neither number: since round 13b they are a marker ([below](#markers-outside-the-totals)).

Since round 15 (approved by the owner) the map opens with the **net** (the default map colour, ranking and share-card headline), always with a warning that it adds two different things, help given to Ukraine and money kept from Russia, and that much of what one country stopped paying, Russia sold to others. Its two parts are maps of their own: **support for Ukraine**, and **kept from Russia** ("Russia's gain from this country fell" / "rose" since round 16), with the world total in its title. Since round 16 the net also includes a third line, Russian money frozen (the return Russia lost on its frozen reserves), which is not a payment. A fourth view is the [cost to the country](#the-cost-view). Worldwide, Russia's net gain on goods and fuel over 2022–August 2026, against the level expected without the war, fell by EUR 352.0bn<!-- n:WORLD.less --> from buyers who cut and rose by EUR 215.4bn<!-- n:WORLD.more --> from buyers who bought more: in total EUR 136.6bn<!-- n:WORLD.net --> less. These are Russia's net gains (its taxes plus profit above a normal return), not payments. (Round 13 to 14b coloured the map by the net; review 4 in round 15 briefly made support for Ukraine the default, before the owner chose the net with its two parts; before round 13 only the net was shown, called "toward Ukraine" or "toward Russia".) Every flow we can find (aid, refugee hosting, trade, energy, services, shipping, company taxes, weapons, hidden channels) is turned into the same unit: a change against the expected no-war level, measured in volumes and valued at each year's prices, summed over 2022 to the chosen year (2026 = January–August), as a percentage of **one** year's GDP (since round 15 the average of 2022–2024). It is a total for the whole period, not a yearly rate. This page defines that scale and lists every part, each with a link to the page that explains it in detail.

## The core idea in four steps

1. **Change, not totals.** A country that bought EUR 20bn of Russian oil every year before the war and still does has shifted nothing; one that stopped has shifted EUR 20bn a year. Trade parts are therefore measured against an *expected* level: what the country would have traded without the war. How that is predicted is the subject of [counterfactual.md](counterfactual.md).
2. **Volumes, valued at each year's prices.** Fuel prices doubled or more in 2022. Paying twice as much for the same oil is not a shift in behaviour, so traded values are divided by a price level (`pidx`, 2019–2021 = 1) before they are compared ([prices.md](prices.md)). Since round 14 the change in volume is then valued at that year's prices (`cur`), so every part is in current euros like aid; fuel at the prices a no-war market expected. The extra money Russia earned from the higher prices is counted separately, as the war-time windfall.
3. **Summed 2022 up to the chosen year.** The map adds the yearly changes. 2026 counts eight months (`FRAC = 8/12`).
4. **As % of one year's GDP.** The total is divided by the country's average nominal GDP over 2022–2024 in euros (round 15, review 4 M1: World Bank WDI, or IMF WEO where the 2024 figure came from it, each year at its ECB rate: [`gdp_avg_r15.json`](../../research/2026-10/gaps/gdp_avg_r15.json); until round 14 the 2024 GDP alone, which is kept in [`other.json`](../../research/2026-10/other.json) and in the method band; gaps from [`residual.json`](../../research/2026-10/gaps/residual.json)). The average matters where a currency collapsed: Nigeria's 2024 GDP was a third of its 2022 GDP in euros, so its +0.81% against 2024 is +0.44%<!-- n:NGA.net --> against the average. It is **not a yearly rate**: over 2022 to August 2026 (about 4.7 years) divide by 4.7 for an average year; the panel shows that line (round 13). Per person and total euros are alternative measures on the map. Code: `scaled()` in [`site/index.html`](../../site/index.html).

**Units, plainly (round 13 audit; updated in rounds 14 and 15).** Since round 14 every part is in euros of each year, like aid: trade is measured in volumes and each year's change is valued at that year's prices (other goods at their own price level, fuel at the prices a no-war market expected); aid, refugee costs, taxes and the windfall are money of each year. The denominator is nominal GDP, the average of 2022–2024 since round 15. (Until round 14 trade parts were at pre-war prices and somewhat understated next to aid; round 14 re-inflated them.)

For one traded flow, one year:

```
change_i = base × FRAC_i × bmul_i  −  value_i / pidx_i
```

Positive means less than expected. Whether that counts toward Ukraine or Russia depends on the flow (paying Russia less is toward Ukraine; buying from Ukraine more is toward Ukraine). The site's `calc(c, y)` in [`site/index.html`](../../site/index.html) computes every part with a middle value and a likely range; [ranges.md](ranges.md) explains the ranges.

## Every part of the net shift

The parts below are what the country panel's waterfall shows (`shiftParts` and `backParts` in `calc()`). "Toward" says which way a positive amount points; "number" says which of the two headline numbers it belongs to (U = support for Ukraine, R = kept from Russia; `UA_PARTS` in `calc()`). Since round 16 the return Russia lost on its frozen reserves is neither: it is a line of its own, added to the net only (`OWN_LINE`).

| part on the map | how it is counted | toward | page |
|---|---|---|---|
| Aid to Ukraine (U; labelled "Kiel, adjusted" since round 13: Poland's Kiel figure is EUR 5.89bn, 3.24bn on the map) | Kiel Institute allocations (bilateral), loans repaid from frozen Russian assets left out; loans at their economic value, donated weapons at market value | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#aid) |
| Share of EU-level aid | EU institutions' aid split over members by EU budget share | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#eu-level-aid) |
| Hosting refugees | net cost: budgets where reported, else a calibrated model, minus refugees' taxes; donor-paid part taken off; floored at zero per country | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#refugees) |
| Extra purchases from Ukraine (U) | rise above the expected level, the years summed with their signs and only the total floored at zero (round 13), × Ukraine's net gain (round 10) | Ukraine | [trade.md](trade.md) |
| Less (or more) paid to Russia | expected minus actual goods imports from Russia (small flows from their 2019–2021 median at pre-war prices since round 16b); fuel and (since round 16) gold at the prices a no-war market expected, other goods at pre-war prices; × Russia's net gain on that mix of goods (round 10) | either | [trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md) |
| Extra paid because of war-time prices (windfall) | payments for Russian fuel minus the same volume at no-war prices, × Russia's net gain on that extra price (round 13: 1 for oil and pipeline gas, about 0.7 for LNG, at most the coal rent for coal); negative where Russia sold below them | either | [prices.md](prices.md#war-time-windfall) |
| Russian oil bought via other countries (laundered oil) | Russian crude inside fuel refined elsewhere, EU refiners included since round 13 (measured share per refiner and year, round 9), in volumes at the no-war crude price against its pre-war level, both ways (round 13), × Russia's net gain on crude (round 10) | either | [energy-and-laundered-oil.md](energy-and-laundered-oil.md#laundered-oil) |
| Income lost on sales to Russia given up / income from extra sales | expected minus actual exports to Russia, × the seller's net gain × genuinely extra (round 13; was value kept × genuinely extra) | either | [trade.md](trade.md#profit-not-revenue) |
| Less (or more) tax paid in Russia by companies | profit tax + half of other taxes, against 2018–2021 | either | [services-shipping-companies.md](services-shipping-companies.md#company-taxes) |
| Weapons and troops sent to Russia | North Korea, Iran, Belarus, China's unrecorded part; round 13: what Russia paid for, also in kind, at the seller's net gain, the rest in full; troops' pay in full | Russia | [aid-refugees-military.md](aid-refugees-military.md#military-support-to-russia) |
| Less (or more) paid to Russia for services | expected minus actual services imports, × Russia's net gain on services (round 10) | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Income lost on services to Russia given up (e.g. tourism) | expected minus actual services exports, × the seller's net gain × genuinely extra | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Income from shipping and insuring Russian oil | freight and insurance against 2019–2021, × the shipper's or insurer's net gain × genuinely extra; ship sales at their price premium | either | [services-shipping-companies.md](services-shipping-companies.md#shipping) |
| Gold and hidden payments to Russia | gold and channels missing from customs data, × Russia's net gain on gold (round 10) | Russia | [trade.md](trade.md#gold-and-hidden-channels) |
| Undisclosed military aid | beyond what Kiel records | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Private donations | national donation totals, GDP model elsewhere | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Weapons bought from Russia | payments against the expected level, outside customs data, × Russia's net gain on arms (round 10) | either | [russia-state-and-companies.md](russia-state-and-companies.md#weapons-bought-from-russia) |
| Nuclear projects and state loans from Russia | own payments for Rosatom construction, loan repayments against schedule, customs over-counts removed | either | [russia-state-and-companies.md](russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) |
| Profits sent to Russia by Russian-owned companies here | oil, gas, banks and telecoms (round 5) and metals, mining and chemicals plants such as Aughinish Alumina in Ireland (round 10), against 2019–2021; trusteeships count the other way | either | [russia-state-and-companies.md](russia-state-and-companies.md#russian-owned-companies-abroad) |
| Russian money frozen (own line, net only since round 16) | yearly return the frozen central-bank reserves would have earned (rates per currency and year); Euroclear and Clearstream a third to the host, two thirds to all EU members | Ukraine | [russia-state-and-companies.md](russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| Fees earned settling Russia's trade (payment agents) | fees kept by residents of the agent's country, against 2021, × the financial industry's net gain × genuinely extra (round 13) | Russia | [trade.md](trade.md#payment-agents-round-6) |
| Share of new IMF, World Bank and EBRD lending | rise over pre-war own-risk lending, at economic value, by shareholding | Ukraine | [loans.md](loans.md#new-lending-by-the-imf-and-world-bank) |
| Flowing back (U; optional, on by default) | every euro for Ukraine followed to the economy where it was spent (own and others' aid incl. stock replacement, arms Ukraine bought, energy, relief and rebuilding) and extra sales to Ukraine, × the seller's net gain × genuinely extra; since round 16 also refugee hosting spent in the host's own economy, × services' net gain × genuinely extra ([refugee spending](aid-refugees-military.md#refugee-spending-flowing-back-round-16)) | subtracted from support for Ukraine | [aid-refugees-military.md](aid-refugees-military.md#flowback) |

Not a part of its own, but built into the parts above:

- **Energy premium and oil discount** belong to the *cost* view (below), not the net shift ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#energy-premium-and-oil-discount)).
- **Taken by Russia** (round 14b, raised by the owner): assets Russia seized and forced exit costs (the forced discount and the exit fee) are a sacrifice, not money the country chose to move. They are in the *cost* view only, not in the net shift or either headline number ([russia-state-and-companies.md](russia-state-and-companies.md#round-14b-taken-by-russia-not-in-the-totals)).
- **Residual gap**: sales to Russia missing from partners' data are added to the country of origin inside "sold to Russia" ([trade.md](trade.md#residual-gap)).
- **Re-export hubs, transit gas, hub resale, Baltic pass-through, freight**: these move value between countries before the parts are computed ([trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md)).
- **Sanctions label**: which share of a cut was required by sanctions is shown as a label and does not change totals ([trade.md](trade.md#sanctions-mandated-or-own-choice)).
- **Markers outside the totals**: see [below](#markers-outside-the-totals).
- **Cut by Russia label** (round 13; completed in round 14): the part of "less paid to Russia" that is gas Russia cut off itself (Poland and Bulgaria from 27 April 2022, Finland 21 May, the Netherlands 31 May, Denmark 1 June, Germany from June, Latvia 30 July, France's Engie 1 September and Moldova from October 2022, Austria's OMV 16 November 2024) or that stopped when Ukraine ended gas transit on 1 January 2025 (Slovakia, Italy). The first year counts from the cut date. A label inside the second number; totals do not change. Data: `sanctions_share.json` `gas_part` in those years (Poland's from final-use volumes, as its customs book the gas under other headings), dates in `RUSSIA_GAS_CUT` in `build_data.py`, evidence in `sources_r11.json` `gas_cuts`. It is printed only where Russia cut the country's gas.

## Markers outside the totals

Two things are shown on the map and in the panel but added to no total, because the money is already counted elsewhere
or is not a country's choice:

- **Critical goods** (◆, round 7): sales to Russia of goods its weapons need; the money is already inside trade with
  Russia ([trade.md](trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7)).
- **Wages from Russia** (△, round 13b): the change in migrants' remittances from Russia against the expected level, as
  % of GDP since 2022, with "depends on wages earned in Russia" where migrants sent at least 1% of GDP a year. Until
  round 13 this was a part of the net ("wages earned working in Russia"); the owner took it out after the round-13
  audit: they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the
  real gain over the alternatives is small and hard to measure; and they would dominate the bottom of the ranking
  (Tajikistan −39.6% of GDP, almost all remittances). Tajikistan was then −0.8%, Uzbekistan −6.2% (round 15, against average 2022–2024 GDP: −0.87%<!-- n:TJK.net --> and −3.54%<!-- n:UZB.net -->)
  ([trade.md](trade.md#remittances-and-relocants-round-7), [decisions](../decisions.md#remittances-from-russia)). The
  table, CSV and JSON carry it in columns marked "not in totals".

## One rule for every seller (round 13)

Until round 12 the map used two different rules for sales: Russia's and Ukraine's sales counted at the seller's **net gain** (taxes plus profit above a normal return), everyone else's earnings at **value kept** (domestic value added, which includes wages) × genuinely extra. The same car counted about ten times more when China sold it to Russia than when Russia sold it. An independent audit (economist and journalist, 19 October 2026) found that this section's earlier claim, "the same rule", was not true. The owner approved one rule:

> **every sale counts at the seller's net gain × the share that is genuinely extra**

- **Net gain** = (other taxes on production − subsidies + net operating surplus − the labour part of mixed income − a normal return on the net capital stock: 9% nominal (8–10%) in round 13; since [round 14](#round-14-changes-to-the-rules) 5% a year above inflation after tax plus the country's risk premium (4–6%)) ÷ output, by country and industry, from the OECD STAN database (2025 edition), 2021–2023 ([`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json), [notes](../../research/2026-10/gaps/net_gain_sellers-notes.md), script [`net_gain_sellers.py`](../../research/2026-10/scripts/net_gain_sellers.py)). Profit tax is paid out of the surplus, so it is inside. The normal return is the same as Russia's. The 38 economies in STAN use their own figures; every other economy uses the OECD median of the industry, labelled as such.
- **Genuinely extra** stays as in round 6 ([`value_kept.json`](../../research/2026-10/gaps/value_kept.json)): it measures additionality, not value.
- It applies to sales to Russia and to Ukraine, money flowing back (own and others' aid spent at home, arms Ukraine bought), services, shipping and insurance, payment agents and paid weapons sent to Russia. Migrants' pay followed the same idea until round 13b (below); it is now a marker.
- Aid, refugee hosting, money not paid (unpaid weapons), taxes and profits paid to Russia, and the return denied on frozen reserves keep their full value.

Round 13 values (at 9%); the current values (5% real plus risk premium, services without real estate) are in [`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json) and [round 14](#round-14-changes-to-the-rules).

| what the seller sells | industry | OECD median net gain (25th–75th percentile) |
|---|---|---|
| goods sold to Russia, other flowback | manufacturing (C) | 0.013 (0–0.040) |
| weapons flowback, paid weapons | weapons and ammunition, aircraft, military vehicles, electronics | 0.037 (0.020–0.079) |
| fuel sold to Ukraine | refined petroleum (C19) | 0.018 (0–0.049) |
| services | accommodation and food; business services | 0.002 (0–0.026) |
| shipping | water transport (H50) | 0 (0–0.045) |
| insurance | K65 | 0.155 (0.104–0.265) |
| payment agents | finance (K) | 0.196 (0.134–0.281) |

Manufacturing earns little above a normal return on its capital, as Russia's "other manufactured goods" (0.05) do. So in round 13 US weapons sold for Ukraine counted at 0.032 × 0.70 = 0.02 of their value (was 0.63; about 0.036 since round 14), China's extra sales to Russia at 0.013 × 0.60 = 0.008 (was 0.485), Greek shipping at 0 (was 0.17). **Russia's own payments are unchanged**: they were already at net gain.

**Migrants' pay** (round 13 only; a [marker](#markers-outside-the-totals) since round 13b) ([`remittances_r13.json`](../../research/2026-10/gaps/remittances_r13.json), [notes](../../research/2026-10/gaps/remittances_r13-notes.md)): wages pay for real work, so only the pay above what the same work earns elsewhere is a gain, and only its war-driven change counts. The war wage premium (Russian wages above their pre-war trend: 5% in 2022 rising to 19% in 2025) counts in full as far as it shows in euros; the rest of the change counts × the premium over the home wage (Tajikistan 0.62, Uzbekistan and Kyrgyzstan 0.41) × genuinely extra. Tajikistan stays about −40% of GDP: its migrants' pay rose far above the no-war level, and a 2022–2026 total against one year's GDP adds up five years of that.

**Weapons sent to Russia** ([`military_payment_r13.json`](../../research/2026-10/gaps/military_payment_r13.json), [notes](../../research/2026-10/gaps/military_payment_r13-notes.md)): paid deliveries are sales, also when Russia paid in kind (technology, components, fuel, food: INSS puts in-kind payment at 80–96% of North Korea's compensation). They count at the seller's net gain × genuinely extra; North Korea's outdated stock (about half, per Ukraine's intelligence) at 0.9 of its price, since it had no other use. Unpaid deliveries (Belarus's army stocks, no payment found) count in full. Troops' pay counts in full (it goes to the North Korean state, and the soldiers' alternative pay is close to nothing). North Korea: −30.0% → −10.2% of GDP.

**The windfall** counts at Russia's net gain on the extra price: costs do not rise with the price, so that is all of it for crude, products and pipeline gas, the profit tax plus Russia's 60% of the profit after tax for LNG (0.68–0.74), and at most the coal rent for coal.

**Effect of the rule on its own** (round 13, net % of GDP, before the other round-13 steps): Belarus −18.5 → −5.6, Kyrgyzstan −16.7 → −6.1, Armenia −10.1 → −2.4, Cyprus +6.1 → −0.3, Georgia −7.2 → −2.3, Uzbekistan −18.1 → −15.1, China −1.56 → −1.05, the US +0.36 → +0.48; Lithuania (−1.8), Estonia (−1.7) and Finland (−1.2) lose credit for sales to Russia given up. The paid-weapons split then moved North Korea −30.0 → −10.2 and the remittance rule Kyrgyzstan −6.1 → −7.5 (undone in round 13b, when remittances became a marker). All steps: [changelog](../changelog.md).

## The money rule (round 6)

*Superseded in round 13 by [one rule for every seller](#one-rule-for-every-seller-round-13): value kept is replaced by the seller's net gain; genuinely extra stays. The products below are kept as `vk_old` for the method band.*

Money a country **pays out** counts at full value: it leaves the economy (since round 10, payments to Russia count at
Russia's net gain on them; see [the net-gain rule](#the-net-gain-rule-round-10)). Money a country
**earns** (from Russia, or from the war effort for Ukraine) counts at the **value kept in its economy × how much of it
is genuinely extra**:

- **value kept**: the domestic value-added share of the sale (OECD Trade in Value Added, 2025 edition; for weapons,
  defence-industry evidence: US 0.90, Germany, France, UK, Italy 0.72–0.75, Czechia 0.55);
- **genuinely extra**: the share that would not exist without the sale (weapons 0.6 by default, US 0.70 with 155mm
  output up from 14,000 to about 40,000 rounds a month; sales lost to Russia 0.20–0.45 because many firms found other
  buyers; extra sales to Russia 0.40–0.60; extra fuel sales to Ukraine 0.20; tourism lost 0.30; shadow shipping 0.65).

(Superseded: since round 13 the first factor is the seller's net gain, not value kept; see [the net-gain rule](#the-net-gain-rule-round-10) and [round 14](#round-14-changes-to-the-rules). In round 14 US weapons flowback counts at about 3.6% of the money, not 63%.) Until round 12, US weapons sold for Ukraine counted at 0.63 (0.45–0.77), Germany's at 0.47, lost sales to Russia at 0.17–0.32,
Greek shipping at 0.17. This replaces the flat 20% profit used before for flowback, sales and services to Russia and
shipping. Factors per country and kind of earning: [`value_kept.json`](../../research/2026-10/gaps/value_kept.json)
([notes](../../research/2026-10/gaps/value_kept-notes.md)); `c.vk` in `data.json`; applied in `calc()`.

## The net-gain rule (round 10)

Aid is a gift: Ukraine gets EUR 1 and gives nothing back, so aid counts at full value. Trade is an exchange: the
seller gets EUR 1 but gives up goods that cost workers, fuel, machines and materials to make. To put both on one scale,
trade counts at the **seller's net gain**: the taxes the seller's state collects on the sale plus profit above a normal
return on capital (8–10% a year), as a share of the export price. Wages, materials, transport, depreciation and a normal
return are real costs and do not count. Round 10 called this "the same rule the map already used for sales *to* Russia";
it was not (sales to Russia counted at value kept, which includes wages). Since round 13 it is: see
[one rule for every seller](#one-rule-for-every-seller-round-13). The suggestion came from a reader on Reddit.

**Russia's net gain per euro** ([`net_gain_russia.json`](../../research/2026-10/gaps/net_gain_russia.json),
[notes](../../research/2026-10/gaps/net_gain_russia-notes.md)), central values:

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

Since round 11, services, arms and the other goods use official sector profitability (Rosstat by activity), export duties collected and company results instead of judgement ([decisions](../decisions.md#assumptions-backed-by-data-round-11)).

Crude in 2023, for example: Russia sold at 64.2 USD a barrel FOB; real costs were 27.4 USD (lifting 4, pipelines and
ports 5, depreciation 6.5, overhead 1.5, and since round 14b a normal return of 10.4: 11.4% on 91 USD of capital per
barrel, from Rosneft's balance sheet), so the net gain is 0.57, of which the state took 0.47 in taxes (Finance
Ministry totals). Each country's payments get the gain of what it bought (`apply_net_gain()`):

- **expected without the war**: the 2019–2021 customs share of fuel in its purchases from Russia, split over crude,
  products, pipeline gas, LNG and coal as the fuel tracker records them in 2021;
- **bought each year**: that fuel share moved by the tracker's change in fuel volume against all payments in volume
  since 2021, with that year's split, all at constant 2019–2021 prices, so price changes (counted as the war-time
  premium) do not move the mix, and 2021 matches the expected mix exactly. Round 13 fixed a bug here: the volume of
  all payments was divided by the payments index *after* it had been set to no-war fuel prices, which understated the
  fuel share from 2022 (Hungary's 2022 gain on what it bought: 0.44, now 0.66; Hungary −4.1 → −5.5% of GDP, Slovakia
  +1.3 → −0.1, India −2.3 → −2.8). `check_data.py` now tests that the same volumes give the same gain;
- **fuel a refiner passed on** (India, Türkiye, China) counts at the gain on crude, the same as for its buyers;
- **gold** counts at the gain on gold: gold the UAE and Hong Kong pass on to their buyers, and Hong Kong's own rise
  since before the war (all of it precious metals: UN Comtrade shows Hong Kong's HS 71 imports from Russia rising more
  than its total in every year, round 12; see [trade](trade.md#hong-kong-gold)); everything the UAE passes on is
  treated as gold. Round 13: the gold in the payments is deflated with the gold price index, not the country's
  pre-war mix (Hong Kong's was half palladium, whose price fell while gold's rose to 2.7 times its 2019–2021 level),
  which had made Hong Kong's volume of gold 1.3–3 times too large (Hong Kong −4.2 → −1.9% before the round-13 rule,
  −2.4% after it);
- **Moldova's gas** comes from its own customs, since Transnistria's unpaid gas is not counted;
- the Rosatom customs over-count taken out of Türkiye's and Egypt's payments is rescaled to the same gain.

Gold and hidden payments stay in money in `data.json` (for the *To Russia* view, removed in round 15, and the gross trade flows, an option in Filters since round 17) and are weighted
in the map; weapons bought from Russia are stored already at Russia's gain on arms.

**Ukraine's net gain per euro** ([`net_gain_ukraine.json`](../../research/2026-10/gaps/net_gain_ukraine.json),
[notes](../../research/2026-10/gaps/net_gain_ukraine-notes.md)): since round 14b about 0.10 before the war, 0.033 in 2022,
0.025 in 2023, 0.036 in 2024 and 0.055 in 2025 (until round 14: 0.18, 0.06, 0.045, 0.07, 0.105), weighted by the
buyer's own mix of goods for its 12 largest buyers. It is low because war-time logistics (Danube ports, rail,
insurance) took much of the price, and because investors in Ukraine need a high return: since round 14b the normal
return is 5% real plus Ukraine's country risk premium (15.5%), 23% nominal after tax, so what is left is mostly taxes;
grain was 0.015 in 2023.

**What counts in full:** aid, refugee hosting, taxes companies pay in Russia, profits sent to Russia,
unpaid weapons and the return on frozen reserves. The extra paid because of war-time fuel prices counts at Russia's
net gain on it since round 13, which is all of it for oil and pipeline gas. The *cost* view and the *To Ukraine* and *To Russia* views (money, not gain; removed in round 15) do not change.

**Effect:** both sides shrink toward zero, most for countries whose score came from buying less from Russia: Lithuania
+27.8 → +14.8% of GDP, Estonia +23.2 → +9.6, Finland +16.3 → +9.3, Moldova +22.7 → +5.8, Germany +5.2 → +3.7, India
−5.2 → −2.4. Ranges narrow: the median width falls from 4.7 to 1.8 points, because the uncertain no-war level is now
multiplied by a smaller number.

## Two balances (round 6)

Since round 13 these two balances are the two headline numbers, shown everywhere (map tooltip, panel, ranking, share
cards, table and downloads), with the net as their sum:

- **support for Ukraine** (was "with Ukraine"): aid, EU share, refugees, extra purchases from Ukraine, donations,
  multilateral lending, minus money flowing back from the war effort into the country's economy;
- **kept from Russia** (was "with Russia", then "kept from Russia" until round 17): everything else. A
  positive value means the country paid Russia less than without the war; sentences say it in words ("paid Russia
  €65.8bn (1.6% of GDP) less than without the war"), never "toward Ukraine".

A negative balance with Ukraine is shown as its real number and means **net earning from the war effort**, not money
toward Russia. On the map a country whose net is negative mainly because of that is **grey**, not orange (gold with a
gold outline for smaller cases until round 17; the one colour rule of round 17 has no third hue). Support below zero is
grey on the support map too.

## The cost view

"Cost to the country" (called "cost carried" before round 15) is a fourth view: what it cost the country itself, after gains such as cheaper Russian oil or business won back; what the country gave up, not where money went. Parts (`costParts` in `calc()`):

- aid with loans at the lender's cost: per loan item, the loan's terms and the expected loss of its creditor class, discounted at the lender's own funding rate, with a low and high value per country (round 12; was 26% of face, `LOAN_GRANT_ELEMENT`, with a half-to-one-and-a-half band). The net shift uses the value to Ukraine instead ([loans](loans.md#the-cost-view));
- donated weapons at their recorded value;
- refugee hosting at net cost;
- undisclosed aid and private donations;
- the extra price paid to replace Russian energy;
- income lost on sales to Russia, goods and services, at the seller's net gain × genuinely extra ([one rule](#one-rule-for-every-seller-round-13));
- import tariffs dropped for Ukraine (EU, UK and Canada only: about 0.2% of purchases from Ukraine since round 11, the average of the EU's 0.3% in June 2022 to June 2025, the UK's 0.2% and Canada's 1%; was 4%);
- minus discounts gained on Russian oil;
- minus money flowing back, at the seller's net gain × genuinely extra.

## The other lenses

Until round 15 the map had two more views, **To Ukraine** (aid + refugees + purchases from Ukraine) and **To Russia** (payments for goods, laundered oil, company taxes, weapons, services and hidden channels). They were removed (owner, round 15): they are gross totals, not changes, so they include normal trade and measure something different from the four views. The gross flows are still shown in each country's panel (the small charts, such as "Paid to Russia" and "Bought from Ukraine"), in the table and downloads (aid, refugees, paid to Russia) and in the gross trade flows (an option in Filters since round 17). Old links with `lens=ukr` open support for Ukraine, `lens=rus` kept from Russia.

## Rules that apply everywhere

- **No country is rewarded for missing data.** Gaps are filled with estimates with wide ranges, never left at zero ([`gaps.md`](../../research/2026-10/gaps.md) lists per country what is reported or estimated).
- **Counted where used.** Gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them, Hong Kong's Russian gold partly at mainland China.
- **Counted once.** [`check_data.py`](../../pipeline/check_data.py) tests for double counting ([pipeline.md](../reference/pipeline.md#checks)).
- **Rankings** leave out economies under EUR 5bn GDP and, since round 15, countries whose direction is uncertain: the likely range **or any method-band alternative** gives the number the other sign (`MIN_GDP_RANK`, `uncertain()` and `rankList()` in [`site/index.html`](../../site/index.html)). The rule applies to all three rankings; the map shows such countries in grey, "too close to call" (dotted until round 17), and the panel marks them "direction uncertain". Among economies above EUR 5bn, 110 are uncertain on kept from Russia and 104 on the net (most of them small amounts near zero), among them Belarus, Türkiye, Kyrgyzstan, Georgia, Nepal and the UAE: that means the sign is uncertain, not that they are neutral. Each of the three numbers has its own map and ranking (round 15).

## A worked reading

Germany, 2022–August 2026 (round 15 build): **support for Ukraine +1.57%<!-- n:DEU.ua -->** of a year's GDP (EUR 71bn: gave 71.9, earned back 0.6; certainty B) and **kept from Russia +1.57%<!-- n:DEU.rus -->** (EUR 69bn: it paid Russia that much less than without the war; of which EUR 22bn is gas Russia cut off itself; certainty C). Their sum, the net, is **+3.22%<!-- n:DEU.net -->** (likely range 2.14%<!-- n:DEU.netLo --> to 4.63%<!-- n:DEU.netHi -->, certainty C; EUR 140bn on an average 2022–2024 GDP of EUR 4,179bn). An average year is about 0.7%. For 2022–2025 alone the net is +2.57%<!-- n:DEU.net2025 -->: 2026 adds a lot because fuel prices rose with the Hormuz crisis; valued at 2025 prices, 2026's kept from Russia makes it +1.46%<!-- n:DEU.alt_p26.rus --> instead of +1.65% ([prices](prices.md#2026-and-the-hormuz-crisis-round-15)). What Russia took from German companies (seizures EUR 9.5bn, forced exits EUR 2.4bn) is not in either number since round 14b; it is in the cost to the country. In EUR bn, the largest parts are:

| part | middle (range) |
|---|---|
| Less paid to Russia (volume against the expected level, valued at each year's prices, at Russia's net gain) | +69.9 (28.3 to 121.3) |
| Aid to Ukraine (Kiel, adjusted) | +30.2 (28.6 to 32.6) |
| Hosting refugees (net cost; all levels of government since round 15) | +25.1 (11.7 to 43.2) |
| Share of EU-level aid | +13.4 (10.3 to 17.3) |
| Less tax paid in Russia by companies | +5.4 (1.9 to 10.5) |
| Russian oil bought via other countries | +4.3 (2.3 to 6.4) |
| Russian money frozen (return Russia lost on its reserves) | +3.2 (2.1 to 3.8) |
| Extra paid to Russia because of war-time prices (mostly 2022 gas) | −16.5 (−24.3 to −10.1) |

Income lost on sales to Russia given up is +1.1 (was +21.7 under value kept): German manufacturing earned about 3% above a normal return of 5% a year above inflation. The wide range comes almost entirely from "less paid to Russia": the expected no-war level of Germany's purchases is uncertain (see [counterfactual.md](counterfactual.md)). The total is graded C: most of it rests on modelled parts (C), little on rough indications (D) ([ranges.md](ranges.md#certainty-letters)). The method band (net 2.69%<!-- n:DEU.netBandLo --> to 3.62%<!-- n:DEU.netBandHi -->: the net under the round-12 valuation rule, the windfall in full or left out, loans at the war-time yield, EU refiners' exports, laundered oil, the fuel mix, freight, the normal return, without the gas Russia cut off, redirected trade, refugees at gross cost, 2026 at 2025 prices and 2024 GDP) is shown next to the range; redirected trade (less paid to Russia × the world's net-to-gross ratio) gives the low end. The "How it works" view on the map ([`views2.js`](../../site/views2.js)) builds this waterfall live for Germany, Poland, the US, Hungary, India and China.

## Round 14 changes to the rules

- **Current euros (audit M5).** Every trade part is now in the same euros as aid. Changes are still measured in volumes, so that price swings are not counted as changes, but each year's change is valued at that year's prices (`cur` per flow in `data.json`, applied in `spread()`): other goods at their own price level, fuel at the price a no-war market expected (already that year's euros since round 7).
- **One price basis (audit C3).** Fuel prices and payments are at the Russian port (FOB). The war-time rise in sea freight is taken out of customs (CIF) values with the project's measured freight on Russian oil, so it is not counted as Russia's windfall; it went to shipowners, whom the shipping part already credits ([prices.md](prices.md#one-price-basis-fob-round-14)).
- **What was bought (audit C1, C2).** Russia's gain on what a country bought uses its own measured fuel share and its customs values per fuel, not a 60-country average or the fuel tracker's tonnes ([prices.md](prices.md#the-mix-of-what-was-bought-round-14)).
- **Normal return (audit M2).** Sellers' net gain subtracts 5% a year above inflation, after company tax, plus the country's risk premium (4–6% in the high and low cases), instead of 9% nominal ([net_gain_sellers-notes.md](../../research/2026-10/gaps/net_gain_sellers-notes.md), section 6).
- **Seizures (audit M4)** counted as money taken by Russia, on their own line (moved to the cost view in round 14b); **frozen reserves (M6)** are their own line, "Russian money frozen" ([russia-state-and-companies.md](russia-state-and-companies.md#assets-seized-by-russia-round-14)).

## Round 14b changes to the rules

- **Taken by Russia, not in the totals** (raised by the owner). Seizures (round 14, M4) and forced exit costs (round 5: the forced discount and the exit fee paid to Russia's budget) leave the net shift and both headline numbers and are counted in the cost to the country as a sacrifice, like the energy switching cost. The panel, table, CSV, JSON and a map marker show them apart ([russia-state-and-companies.md](russia-state-and-companies.md#round-14b-taken-by-russia-not-in-the-totals)).
- **Russia's and Ukraine's normal return** (raised by the owner, after the round-14 consistency check). Their net-gain shares now subtract the sellers' rule: 5% a year above inflation after tax (4–6%) plus the country's risk premium (Russia 3.9%, Ukraine 15.5%), on book capital as a nominal US dollar rate (+2.5% expected inflation): 11.4% for Russia (was 9%) and 23.0% for Ukraine (was 8.2% after tax). Capital per unit of revenue is now measured for every product group (company balance sheets, Rosstat and Ukrstat, Damodaran's emerging-market industry data). Russia's non-fuel average falls from about 0.13 to 0.11 in 2024, crude oil from 0.65 to 0.58; Ukraine's average from 0.07 to 0.04 ([net_gain_russia-notes.md](../../research/2026-10/gaps/net_gain_russia-notes.md), [net_gain_ukraine-notes.md](../../research/2026-10/gaps/net_gain_ukraine-notes.md)).

## Round 15 changes (review 4, approved by the owner)

- **Three maps** (C1): support for Ukraine and the money kept from Russia (with the world total) are separate maps, and the net, their sum, carries a warning. Review 4 made support for Ukraine the default; the owner then chose to **start with the net, then its two parts** (net, support for Ukraine, kept from Russia, cost to the country), and removed the gross To Ukraine and To Russia views ([above](#the-other-lenses)). "Cost carried" was renamed "Cost to the country". Old links with `lens=change` open the net, `lens=ukr` support for Ukraine, `lens=rus` the money kept from Russia ([decisions](../decisions.md#round-15-the-net-first-then-its-two-parts)).
- **Two named lists** (C2) replace "Who helps Russia the most": "Paid Russia more than before the war" (the payments map's negative end, with the note that fuel is fungible) and "Armed Russia" (weapons and troops at their full value, as information; [aid-refugees-military.md](aid-refugees-military.md#military-support-to-russia)).
- **Method band and ranking rule** (H3): six more alternatives (redirected trade, without the gas Russia cut off, refugees at gross cost, without the windfall, 2026 at 2025 prices, 2024 GDP); a country is ranked only if neither its likely range nor any alternative changes the sign ([ranges.md](ranges.md#the-method-band-round-13-widened-in-round-14)).
- **Grades** (H3): each headline number is graded by its share on A–B and D parts and by its spread ([ranges.md](ranges.md#certainty-letters)).
- **Words on cards and panels** (H2): the main part of a number is named whenever it is more than half of it, in either direction ("mostly the 2022 war-time price spike (EUR 9.9bn of EUR 11.6bn; its volumes barely changed)" for Hungary); every shared figure says it is a total since 2022 and gives the average year (L3).
- **Smaller fixes**: average 2022–2024 GDP (M1); the contracted Power of Siberia ramp-up in China's no-war path (M2, [counterfactual.md](counterfactual.md#power-of-siberia-round-15)); a 2026 note on the Hormuz crisis (M4); one refugee definition for every host (M5); Belarus's refugee hosting as a label and Russia never credited (raised by the owner); Nigeria's structural label on its card (L2); Ukraine's country risk premium per year.

## Round 16 changes (review 5, approved by the owner)

- **The net stays the default view and ranking** (the owner's decision), with its warning line. The net is now support for Ukraine plus the money kept from Russia plus **Russian money frozen**, a line of its own (H4).
- **"Russia's gain from this country rose"** replaces "Paid Russia more than before the war", with each entry's main cause; arms suppliers are on "Armed Russia" only (H3). The world totals are called **Russia's net gain** ("from buyers who cut −€355bn; from buyers who bought more +€215bn"), not payments.
- **Method band**: the superseded valuation rule removed (H5), redirected trade on both sides (H6), one common cost per refugee added (H2) ([ranges](ranges.md#the-method-band-round-13-widened-in-round-14)). It now loads before anything is drawn and is checked in a real browser (C2).
- **Numbers**: Poland's refugee scope factor in 2022 only (H1); refugee spending flowing back (M3); small flows from their 2019–2021 median at pre-war prices (M2; corrected in round 16b, [counterfactual](counterfactual.md#small-flows-start-from-the-2019-to-2021-median-round-16-corrected-in-16b)); Hong Kong keeps only the gold that stays there, gold at its no-war price (M1, M6, [trade](trade.md#hong-kong-gold)).
- **Labels and display**: "required by sanctions" from each country's actual stop date (M4); EU-level aid text without the European Peace Facility (L1); adjusted aid graded by its adjusted share (L4); colours set by economies of at least EUR 5bn (L3); ranges and the warning in shared text and on cards (M5). Every decision: [decisions](../decisions.md#round-16-review-5).

## Round 17: the map first

Round 17 (redesign, the owner's choice of prototype B) changed how the numbers are shown, not the numbers. The map
opens with only a header line, a one-row legend, the research-preview banner and two buttons (Highlights, Filters).
**One colour rule** applies everywhere: blue toward Ukraine, orange toward Russia, grey no clear change, including "too
close to call" (no dots), support below zero, a net that is mainly earning from the war effort and a gain in the cost
view. The second number is called **kept from Russia**. **Money streams** show the map's two numbers in euros (support
for Ukraine to Kyiv; how much more a country paid Russia than without the war, that is minus kept from Russia, to
Moscow), never gross trade. **What's counted** lets a reader switch parts off: `calc()` drops the parts in `OFF` in
`live()`, so every total, band and grade follows, and the page says "Custom mix, not the official figures"; with every
switch on, `calc()` is unchanged. Every part in a country's panel opens its method: how it is calculated, why, the
country's sources and links to the method page and the [trace](../trace.md). Decisions:
[round 17](../decisions.md#round-17-redesign).

## See also

- [loans.md](loans.md): loans at their value to Ukraine and at the lender's cost (round 12)
- [counterfactual.md](counterfactual.md), [prices.md](prices.md), [ranges.md](ranges.md): the three ingredients of every trade part
- [reference/pipeline.md](../reference/pipeline.md): how the parts are built into `site/data.json`
- [limitations.md](../limitations.md): what the method does not capture
- [Research log by round](../../research/2026-10/README.md)
- [Documentation index](../README.md)
