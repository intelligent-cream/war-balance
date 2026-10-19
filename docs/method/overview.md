# Method overview: one scale for every flow

The map gives every country **two numbers** for the time since the full-scale invasion, compared with what it would have done without the war:

- **Support for Ukraine**: aid (loans counted as gifts), refugee hosting, purchases from Ukraine at Ukraine's net gain, minus money flowing back from the war effort. These are things done for Ukraine.
- **Change in payments to Russia**: less or more paid to Russia, the war-time price windfall, fuel made from Russian crude elsewhere, sales to Russia, company taxes, weapons sent and the rest. This includes cuts Russia made itself (gas Gazprom cut off, the end of gas transit through Ukraine), which the panel labels. It is not money moved to Ukraine. Migrants' wages sent home from Russia are in neither number: since round 13b they are a marker ([below](#markers-outside-the-totals)).

The map colours their sum, the net (round 13; before, only the net was shown and it was called "toward Ukraine" or "toward Russia"). Every flow we can find (aid, refugee hosting, trade, energy, services, shipping, company taxes, weapons, hidden channels) is turned into the same unit: a change against the expected no-war level, in volumes at pre-war or no-war prices, summed over 2022 to the chosen year (2026 = January–August), as a percentage of **one** year's GDP (2024). It is a total for the whole period, not a yearly rate. This page defines that scale and lists every part, each with a link to the page that explains it in detail.

## The core idea in four steps

1. **Change, not totals.** A country that bought EUR 20bn of Russian oil every year before the war and still does has shifted nothing; one that stopped has shifted EUR 20bn a year. Trade parts are therefore measured against an *expected* level: what the country would have traded without the war. How that is predicted is the subject of [counterfactual.md](counterfactual.md).
2. **At pre-war prices.** Fuel prices doubled or more in 2022. Paying twice as much for the same oil is not a shift in behaviour, so traded values are divided by a price level (`pidx`, 2019–2021 = 1) before they are compared ([prices.md](prices.md)). The extra money Russia earned from the higher prices is counted separately, as the war-time windfall.
3. **Summed 2022 up to the chosen year.** The map adds the yearly changes. 2026 counts eight months (`FRAC = 8/12`).
4. **As % of one year's GDP.** The total is divided by the country's 2024 GDP (World Bank WDI, in [`other.json`](../../research/2026-10/other.json); gaps from [`residual.json`](../../research/2026-10/gaps/residual.json)). It is **not a yearly rate**: over 2022 to August 2026 (about 4.7 years) divide by 4.7 for an average year; the panel shows that line (round 13). Per person and total euros are alternative measures on the map. Code: `scaled()` in [`site/index.html`](../../site/index.html).

**Units, plainly (round 13 audit).** Trade parts are volumes valued at pre-war (2019–2021) prices, fuel at the prices a no-war market expected; aid, refugee costs, taxes and the windfall are money of each year; the denominator is nominal 2024 GDP. Prices rose about 15–20% for non-fuel goods since 2019–2021, so trade parts are somewhat understated next to aid. Re-inflating every volume part to 2024 prices would change every part and is left for a later round; the mix is stated here and on the map.

For one traded flow, one year:

```
change_i = base × FRAC_i × bmul_i  −  value_i / pidx_i
```

Positive means less than expected. Whether that counts toward Ukraine or Russia depends on the flow (paying Russia less is toward Ukraine; buying from Ukraine more is toward Ukraine). The site's `calc(c, y)` in [`site/index.html`](../../site/index.html) computes every part with a middle value and a likely range; [ranges.md](ranges.md) explains the ranges.

## Every part of the net shift

The parts below are what the country panel's waterfall shows (`shiftParts` and `backParts` in `calc()`). "Toward" says which way a positive amount points; "number" says which of the two headline numbers it belongs to (U = support for Ukraine, R = change in payments to Russia; `UA_PARTS` in `calc()`).

| part on the map | how it is counted | toward | page |
|---|---|---|---|
| Aid to Ukraine (U; labelled "Kiel, adjusted" since round 13: Poland's Kiel figure is EUR 5.89bn, 3.24bn on the map) | Kiel Institute allocations (bilateral), loans repaid from frozen Russian assets left out; loans at their economic value, donated weapons at market value | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#aid) |
| Share of EU-level aid | EU institutions' aid split over members by EU budget share | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#eu-level-aid) |
| Hosting refugees | net cost: budgets where reported, else a calibrated model, minus refugees' taxes; donor-paid part taken off; floored at zero per country | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#refugees) |
| Extra purchases from Ukraine (U) | rise above the expected level, the years summed with their signs and only the total floored at zero (round 13), × Ukraine's net gain (round 10) | Ukraine | [trade.md](trade.md) |
| Less (or more) paid to Russia | expected minus actual goods imports from Russia; fuel at the prices a no-war market expected, other goods at pre-war prices; × Russia's net gain on that mix of goods (round 10) | either | [trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md) |
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
| Paid to Russia by companies leaving it | exit contribution and forced discount, by home country | Russia | [russia-state-and-companies.md](russia-state-and-companies.md#companies-leaving-russia) |
| Profits sent to Russia by Russian-owned companies here | oil, gas, banks and telecoms (round 5) and metals, mining and chemicals plants such as Aughinish Alumina in Ireland (round 10), against 2019–2021; trusteeships count the other way | either | [russia-state-and-companies.md](russia-state-and-companies.md#russian-owned-companies-abroad) |
| Return denied to Russia on its frozen reserves | yearly return the frozen central-bank reserves would have earned (rates per currency and year); Euroclear and Clearstream a third to the host, two thirds to all EU members | Ukraine | [russia-state-and-companies.md](russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| Fees earned settling Russia's trade (payment agents) | fees kept by residents of the agent's country, against 2021, × the financial industry's net gain × genuinely extra (round 13) | Russia | [trade.md](trade.md#payment-agents-round-6) |
| Share of new IMF, World Bank and EBRD lending | rise over pre-war own-risk lending, at economic value, by shareholding | Ukraine | [loans.md](loans.md#new-lending-by-the-imf-and-world-bank) |
| Flowing back (U; optional, on by default) | every euro for Ukraine followed to the economy where it was spent (own and others' aid incl. stock replacement, arms Ukraine bought, energy, relief and rebuilding) and extra sales to Ukraine, × the seller's net gain × genuinely extra | subtracted from support for Ukraine | [aid-refugees-military.md](aid-refugees-military.md#flowback) |

Not a part of its own, but built into the parts above:

- **Energy premium and oil discount** belong to the *cost* view (below), not the net shift ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#energy-premium-and-oil-discount)).
- **Residual gap**: sales to Russia missing from partners' data are added to the country of origin inside "sold to Russia" ([trade.md](trade.md#residual-gap)).
- **Re-export hubs, transit gas, hub resale, Baltic pass-through, freight**: these move value between countries before the parts are computed ([trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md)).
- **Sanctions label**: which share of a cut was required by sanctions is shown as a label and does not change totals ([trade.md](trade.md#sanctions-mandated-or-own-choice)).
- **Markers outside the totals**: see [below](#markers-outside-the-totals).
- **Cut by Russia label** (round 13): the part of "less paid to Russia" that is gas Russia cut off itself (Poland, Bulgaria, Finland, the Netherlands, Denmark and Germany from 2022) or that stopped when Ukraine ended gas transit on 1 January 2025 (Austria, Slovakia, Italy, Moldova). A label inside the second number; totals do not change. Data: `sanctions_share.json` `gas_part` in those years (`RUSSIA_GAS_CUT` in `build_data.py`).

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
  (Tajikistan −39.6% of GDP, almost all remittances). Tajikistan is now −0.8%, Uzbekistan −6.2%
  ([trade.md](trade.md#remittances-and-relocants-round-7), [decisions](../decisions.md#remittances-from-russia)). The
  table, CSV and JSON carry it in columns marked "not in totals".

## One rule for every seller (round 13)

Until round 12 the map used two different rules for sales: Russia's and Ukraine's sales counted at the seller's **net gain** (taxes plus profit above a normal return), everyone else's earnings at **value kept** (domestic value added, which includes wages) × genuinely extra. The same car counted about ten times more when China sold it to Russia than when Russia sold it. An independent audit (economist and journalist, 19 October 2026) found that this section's earlier claim, "the same rule", was not true. The owner approved one rule:

> **every sale counts at the seller's net gain × the share that is genuinely extra**

- **Net gain** = (other taxes on production − subsidies + net operating surplus − the labour part of mixed income − a normal return of 9% (8–10%) on the net capital stock) ÷ output, by country and industry, from the OECD STAN database (2025 edition), 2021–2023 ([`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json), [notes](../../research/2026-10/gaps/net_gain_sellers-notes.md), script [`net_gain_sellers.py`](../../research/2026-10/scripts/net_gain_sellers.py)). Profit tax is paid out of the surplus, so it is inside. The normal return is the same as Russia's. The 38 economies in STAN use their own figures; every other economy uses the OECD median of the industry, labelled as such.
- **Genuinely extra** stays as in round 6 ([`value_kept.json`](../../research/2026-10/gaps/value_kept.json)): it measures additionality, not value.
- It applies to sales to Russia and to Ukraine, money flowing back (own and others' aid spent at home, arms Ukraine bought), services, shipping and insurance, payment agents and paid weapons sent to Russia. Migrants' pay followed the same idea until round 13b (below); it is now a marker.
- Aid, refugee hosting, money not paid (unpaid weapons), taxes and profits paid to Russia, and the return denied on frozen reserves keep their full value.

| what the seller sells | industry | OECD median net gain (25th–75th percentile) |
|---|---|---|
| goods sold to Russia, other flowback | manufacturing (C) | 0.013 (0–0.040) |
| weapons flowback, paid weapons | weapons and ammunition, aircraft, military vehicles, electronics | 0.037 (0.020–0.079) |
| fuel sold to Ukraine | refined petroleum (C19) | 0.018 (0–0.049) |
| services | accommodation and food; business services | 0.002 (0–0.026) |
| shipping | water transport (H50) | 0 (0–0.045) |
| insurance | K65 | 0.155 (0.104–0.265) |
| payment agents | finance (K) | 0.196 (0.134–0.281) |

Manufacturing earns little above a normal return on its capital, as Russia's "other manufactured goods" (0.05) do. So US weapons sold for Ukraine now count at 0.032 × 0.70 = 0.02 of their value (was 0.63), China's extra sales to Russia at 0.013 × 0.60 = 0.008 (was 0.485), Greek shipping at 0 (was 0.17). **Russia's own payments are unchanged**: they were already at net gain.

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

So US weapons sold for Ukraine count at 0.63 (0.45–0.77), Germany's at 0.47, lost sales to Russia at 0.17–0.32,
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
| crude oil | 0.69 | 0.68 | 0.64 | 0.65 | 0.53 | 0.61 |
| oil products | 0.61 | 0.65 | 0.62 | 0.59 | 0.47 | 0.59 |
| pipeline gas | 0.60 | 0.84 | 0.69 | 0.60 | 0.54 | 0.57 |
| LNG (Russian owners' part) | 0.35 | 0.54 | 0.47 | 0.36 | 0.37 | 0.35 |
| coal | 0.30 | 0.44 | 0.20 | 0.06 | 0.02 | 0.04 |
| all other goods (weighted) | 0.20 | 0.17 | 0.13 | 0.12 | 0.11 | 0.13 |
| services | 0.032 | 0.035 | 0.043 | 0.034 | 0.044 | 0.044 |
| arms | 0.043 | 0.039 | 0.045 | 0.050 | 0.050 | 0.050 |
| gold | 0.39 | 0.33 | 0.40 | 0.49 | 0.58 | 0.66 |

Since round 11, services, arms and the other goods use official sector profitability (Rosstat by activity), export duties collected and company results instead of judgement ([decisions](../decisions.md#assumptions-backed-by-data-round-11)).

Crude in 2023, for example: Russia sold at 64.2 USD a barrel FOB; real costs were 23 USD (lifting 4, pipelines and
ports 5, depreciation 6.5, overhead 1.5, normal return 6), so the net gain is 0.64, of which the state took 0.47 in
taxes (Finance Ministry totals). Each country's payments get the gain of what it bought (`apply_net_gain()`):

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

Gold and hidden payments stay in money in `data.json` (for the *To Russia* view and the flow lines) and are weighted
in the map; weapons bought from Russia are stored already at Russia's gain on arms.

**Ukraine's net gain per euro** ([`net_gain_ukraine.json`](../../research/2026-10/gaps/net_gain_ukraine.json),
[notes](../../research/2026-10/gaps/net_gain_ukraine-notes.md)): about 0.18 before the war, 0.06 in 2022, 0.045 in
2023, 0.07 in 2024 and 0.105 in 2025, weighted by the buyer's own mix of goods for its 12 largest buyers. It is low
because war-time logistics (Danube ports, rail, insurance) took much of the price; grain was 0.025 in 2023.

**What counts in full:** aid, refugee hosting, taxes companies pay in Russia, profits sent to Russia, exit payments,
unpaid weapons and the return on frozen reserves. The extra paid because of war-time fuel prices counts at Russia's
net gain on it since round 13, which is all of it for oil and pipeline gas. The *cost* view and the *To Ukraine* and *To Russia* views (money, not gain) do not change.

**Effect:** both sides shrink toward zero, most for countries whose score came from buying less from Russia: Lithuania
+27.8 → +14.8% of GDP, Estonia +23.2 → +9.6, Finland +16.3 → +9.3, Moldova +22.7 → +5.8, Germany +5.2 → +3.7, India
−5.2 → −2.4. Ranges narrow: the median width falls from 4.7 to 1.8 points, because the uncertain no-war level is now
multiplied by a smaller number.

## Two balances (round 6)

Since round 13 these two balances are the two headline numbers, shown everywhere (map tooltip, panel, ranking, share
cards, table and downloads), with the net as their sum:

- **support for Ukraine** (was "with Ukraine"): aid, EU share, refugees, extra purchases from Ukraine, donations,
  multilateral lending, minus money flowing back from the war effort into the country's economy;
- **change in payments to Russia** (was "with Russia"): everything else. A positive value is worded "less paid to
  Russia (incl. supplies Russia cut off)", never "toward Ukraine".

A negative balance with Ukraine is shown as its real number and means **net earning from the war effort**, not money
toward Russia. On the map a country whose total is negative mainly because of that is **gold**, not orange; any other
country that earns more than it gives on the Ukraine side (blue overall, or orange mainly because of Russia) gets a thin
gold outline (threshold EUR 10m and 0.05% of GDP).

## The cost view

"Cost carried" is a second lens: what the country gave up, not where money went. Parts (`costParts` in `calc()`):

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

- **To Ukraine**: aid + refugees + purchases from Ukraine (totals, not changes).
- **To Russia**: payments for goods, laundered oil, company taxes, weapons, services and hidden channels (totals).

## Rules that apply everywhere

- **No country is rewarded for missing data.** Gaps are filled with estimates with wide ranges, never left at zero ([`gaps.md`](../../research/2026-10/gaps.md) lists per country what is reported or estimated).
- **Counted where used.** Gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them, Hong Kong's Russian gold partly at mainland China.
- **Counted once.** [`check_data.py`](../../pipeline/check_data.py) tests for double counting ([pipeline.md](../reference/pipeline.md#checks)).
- **Rankings** leave out economies under EUR 5bn GDP and countries whose likely range crosses zero (`MIN_GDP_RANK` and `rankList()` in [`site/index.html`](../../site/index.html)). Over 100 economies above that size are left out for a range crossing zero, among them Belarus, Kazakhstan, Armenia and the UAE: that means the sign is uncertain, not that they are neutral. The ranking view can rank the net or either of its two numbers (round 13).

## A worked reading

Germany, 2022–August 2026 (round 13 build): **+3.2%** of a year's GDP net (likely range 2.2% to 4.5%; EUR 140bn on a 2024 GDP of EUR 4,329bn). It is the sum of **support for Ukraine +1.8%** (EUR 76bn: gave 76.3, earned back 0.4) and **change in payments to Russia +1.5%** (EUR 65bn, less paid; of which EUR 24bn is gas Russia cut off itself). An average year is about 0.7%. In EUR bn, the largest parts are:

| part | middle (range) |
|---|---|
| Less paid to Russia (volume at pre-war prices, against the expected level, at Russia's net gain) | +70.5 (31.5 to 121.2) |
| Aid to Ukraine (Kiel, adjusted) | +30.2 (28.6 to 32.6) |
| Hosting refugees (net cost) | +29.5 (11.7 to 42.6) |
| Share of EU-level aid | +13.4 (10.3 to 17.3) |
| Less tax paid in Russia by companies | +5.4 (1.9 to 10.5) |
| Extra paid to Russia because of war-time prices (mostly 2022 gas) | −16.5 (−24.4 to −10.1) |
| Paid to Russia by companies leaving it | −2.4 (−7.2 to −0.7) |

Income lost on sales to Russia given up is now +0.4 (was +21.7 under value kept): German manufacturing earned about 1% above a normal return. The wide range comes almost entirely from "less paid to Russia": the expected no-war level of Germany's purchases is uncertain (see [counterfactual.md](counterfactual.md)), and the total takes the weakest certainty letter of its parts (D). The method band (the net under the round-12 valuation rule, the windfall in full or loans at the war-time yield) is shown next to the range. The "How it works" view on the map ([`views2.js`](../../site/views2.js)) builds this waterfall live for Germany, Poland, the US, Hungary, India and China.

## See also

- [loans.md](loans.md): loans at their value to Ukraine and at the lender's cost (round 12)
- [counterfactual.md](counterfactual.md), [prices.md](prices.md), [ranges.md](ranges.md): the three ingredients of every trade part
- [reference/pipeline.md](../reference/pipeline.md): how the parts are built into `site/data.json`
- [limitations.md](../limitations.md): what the method does not capture
- [Research log by round](../../research/2026-10/README.md)
- [Documentation index](../README.md)
