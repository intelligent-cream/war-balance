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
| Aid to Ukraine | Kiel Institute allocations (bilateral), loans repaid from frozen Russian assets left out | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#aid) |
| Share of EU-level aid | EU institutions' aid split over members by EU budget share | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#eu-level-aid) |
| Hosting refugees | government budgets where reported, else a calibrated model; donor-paid part taken off | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#refugees) |
| Extra purchases from Ukraine | rise above the expected level, each year on its own, full value | Ukraine | [trade.md](trade.md) |
| Less (or more) paid to Russia | expected minus actual goods imports from Russia, at pre-war prices | either | [trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md) |
| Extra paid because of war-time prices (windfall) | payments for Russian fuel minus the same volume at pre-war prices | Russia | [prices.md](prices.md#war-time-windfall) |
| Russian oil bought via other countries (laundered oil) | Russian crude inside fuel refined elsewhere, above its pre-war level | Russia | [energy-and-laundered-oil.md](energy-and-laundered-oil.md#laundered-oil) |
| Profit lost on sales to Russia given up / profit on extra sales | expected minus actual exports to Russia, × 20% margin | either | [trade.md](trade.md#profit-not-revenue) |
| Less (or more) tax paid in Russia by companies | profit tax + half of other taxes, against 2018–2021 | either | [services-shipping-companies.md](services-shipping-companies.md#company-taxes) |
| Weapons and troops sent to Russia | North Korea, Iran, Belarus, China's unrecorded part | Russia | [aid-refugees-military.md](aid-refugees-military.md#military-support-to-russia) |
| Less (or more) paid to Russia for services | expected minus actual services imports | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Profit lost on services to Russia given up (e.g. tourism) | expected minus actual services exports, × 20% | either | [services-shipping-companies.md](services-shipping-companies.md#services) |
| Profit from shipping and insuring Russian oil | profit share of freight, insurance and ship sales, against 2019–2021 | either | [services-shipping-companies.md](services-shipping-companies.md#shipping) |
| Gold and hidden payments to Russia | gold and channels missing from customs data | Russia | [trade.md](trade.md#gold-and-hidden-channels) |
| Undisclosed military aid | beyond what Kiel records | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Private donations | national donation totals, GDP model elsewhere | Ukraine | [aid-refugees-military.md](aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| Flowing back (optional, on by default) | own aid spent with own industry, others' aid spent here, extra sales to Ukraine, each × 20% profit | subtracted | [aid-refugees-military.md](aid-refugees-military.md#flowback) |

Not a part of its own, but built into the parts above:

- **Energy premium and oil discount** belong to the *cost* view (below), not the net shift ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#energy-premium-and-oil-discount)).
- **Residual gap**: sales to Russia missing from partners' data are added to the country of origin inside "sold to Russia" ([trade.md](trade.md#residual-gap)).
- **Re-export hubs, transit gas, hub resale, Baltic pass-through, freight**: these move value between countries before the parts are computed ([trade.md](trade.md), [energy-and-laundered-oil.md](energy-and-laundered-oil.md)).
- **Sanctions label**: which share of a cut was required by sanctions is shown as a label and does not change totals ([trade.md](trade.md#sanctions-mandated-or-own-choice)).

## The cost view

"Cost carried" is a second lens: what the country gave up, not where money went. Parts (`costParts` in `calc()`): aid with loans at grant equivalent (30% of face value, `LOAN_GRANT_ELEMENT`), refugee hosting, undisclosed aid, private donations, the extra price paid to replace Russian energy, profit lost on sales to Russia (goods and services, 20%), import tariffs dropped for Ukraine (4% of purchases from Ukraine, EU, UK and Canada only), minus discounts gained on Russian oil, and minus flowback profit.

## The other lenses

- **To Ukraine**: aid + refugees + purchases from Ukraine (totals, not changes).
- **To Russia**: payments for goods, laundered oil, company taxes, weapons, services and hidden channels (totals).
- **Doing more or less than expected**: an AI-guessed incentive layer, kept apart from the data ([incentives.md](incentives.md)).

## Rules that apply everywhere

- **No country is rewarded for missing data.** Gaps are filled with estimates with wide ranges, never left at zero ([`gaps.md`](../../research/2026-10/gaps.md) lists per country what is reported or estimated).
- **Counted where used.** Gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them, Hong Kong's Russian gold partly at mainland China.
- **Counted once.** [`check_data.py`](../../pipeline/check_data.py) tests for double counting ([pipeline.md](../reference/pipeline.md#checks)).
- **Rankings** leave out economies under EUR 5bn GDP and countries whose likely range crosses zero (`MIN_GDP_RANK` and `rankList()` in [`site/index.html`](../../site/index.html)).

## A worked reading

Germany, 2022–August 2026: about +4.8% of a year's GDP toward Ukraine (likely range 3.1% to 7.3%, EUR 207bn on a 2024 GDP of EUR 4,329bn). In EUR bn, the largest parts are:

| part | middle (range) |
|---|---|
| Less paid to Russia (volume at pre-war prices, against 2021 held flat) | +110.7 (42.9 to 213.5) |
| Hosting refugees | +46.7 (35.9 to 54.4) |
| Aid to Ukraine (bilateral, Kiel) | +30.8 (26.2 to 35.5) |
| Share of EU-level aid | +18.7 (15.9 to 21.5) |
| Profit lost on sales to Russia given up (20% of the fall) | +17.7 (3.6 to 44.9) |
| Extra paid to Russia because of war-time prices (mostly 2022 gas) | −29.2 (−33.6 to −25.9) |
| Own aid spent with its own defence industry (flowback, 20%) | −2.4 (−4.3 to −1.0) |

The wide range comes almost entirely from "less paid to Russia": the expected no-war level of Germany's purchases is uncertain (see [counterfactual.md](counterfactual.md)), and the total takes the weakest certainty letter of its parts (D). The "How it works" view on the map ([`views2.js`](../../site/views2.js)) builds this waterfall live for Germany, Poland, the US, Hungary, India and China.

## See also

- [counterfactual.md](counterfactual.md), [prices.md](prices.md), [ranges.md](ranges.md): the three ingredients of every trade part
- [reference/pipeline.md](../reference/pipeline.md): how the parts are built into `site/data.json`
- [limitations.md](../limitations.md): what the method does not capture
- [Research log by round](../../research/2026-10/README.md)
- [Documentation index](../README.md)
