# Prices: volumes, not values, and the war-time windfall

Russian gas cost Hungary 7.6 times its pre-war price in 2022. A country that kept buying the same amount of gas paid far more, but it did not change its behaviour; a country that halved its purchases paid about the same money, but it did change. So the map compares **volumes**: each traded value is divided by its price level against before the war (`pidx`, 2019–2021 = 1) before it is set against the expected level. The extra money Russia earned because its fuel cost more is not lost: it is counted as a part of its own, the **war-time windfall**, toward Russia. This page explains where the price levels come from, how each country gets its own index, and how the windfall is computed.

## Why volumes

```
change_i = base × FRAC_i × bmul_i − value_i / pidx_i
```

If `pidx` were left out, a price spike would look like a rise in purchases (more paid to Russia) and a later price fall like a cut. With it, the comparison is between the expected volume and the actual volume. **Round 14 (audit M5):** that change in volume is then valued at the year's prices, `change_i × cur_i`, so every trade part is in the same current euros as aid: other goods at their own price level (`cur = pidx`), fuel at the price a no-war market expected (already that year's euros, so its factor is 1), the gold share at the gold price. Until round 13 the change stayed at 2019–2021 prices for goods other than fuel, which understated trade parts against aid by about the rise in prices (15–40% by 2026). The site applies it in `actV = (i, v, p) => v / p` inside `calc()` in [`site/index.html`](../../site/index.html). Up to round 3 this was the whole story, and price spikes simply did not count; since round 4 the windfall part puts the price effect on Russian fuel back in, separately and visibly.

## Which index each flow uses

Set by [build_data.py `price_indices()`](../../pipeline/build_data.py), with low and high variants (`pidx_lo`, `pidx_hi`):

| flow in `data.json` | index | source |
|---|---|---|
| `to_rus` (bought from Russia) | the country's own composite of fuel and non-fuel prices (below) | [`prices.json`](../../research/2026-10/gaps/prices.json), [`gas_prices.json`](../../research/2026-10/gaps/gas_prices.json), [`energy2.json`](../../research/2026-10/gaps/energy2.json) `price_index` |
| `from_rus`, `buy_ukr`, `sell_ukr` | Eurostat non-fuel goods import price index | `energy2.json` `price_index.non_fuel_goods` |
| `svc_bought`, `svc_sold`, `shipping` | euro-area services HICP | `energy2.json` `price_index.services` |
| `company` (taxes) | none: compared in money | |
| laundered oil | since round 13 volumes: the Urals price paid over the no-war crude price (`laundered_volumes()`) | `energy2.json` `price_index.urals`, `energy_nowar.json` |

Exceptions: [`narrow.json`](../../research/2026-10/gaps/narrow.json) can set its own `pidx`, applied by `apply_narrow()` (no longer for Turkey's `to_rus`, which uses `turkey_prices.json` since round 5). [`check_data.py`](../../pipeline/check_data.py) check 12 verifies that every benchmark index averages 1 over 2019–2021 and that every `to_rus` series has a price level.

## The composite index for payments to Russia

For `to_rus`, a country's price level mixes what it bought before the war:

1. **Fuel price level**, `fuel_index()`:
   - its **own customs unit values** (value ÷ quantity of imports from Russia, 2018–2021 = 1) where measured, from [`prices.json`](../../research/2026-10/gaps/prices.json) (`index.fossil_all`, 102 countries; Eurostat Comext monthly for EU members, UN Comtrade elsewhere); since round 14 oil at the Russian port (below) and screened for outliers;
   - otherwise its pre-war fuel mix (crude, products, gas, coal; `energy2.json` `fuel_mix_2019_2021`, or the import-weighted average outside the 60 largest buyers, `import_mix()`) weighted over benchmark indices: Urals, Russian oil products, the country's own gas index (`gas_index()`, below) and coal.
2. **Non-fuel price level**: the country's own non-fuel index from `prices.json` where measured, else the Eurostat non-fuel index.
3. **Weights**: fuel's share of pre-war imports from Russia (`fossil_share()`: the measured 2018–2021 mix in `prices.json`, else the `energy2.json` mix). Where `prices.json` measures what share of each year's payments was fuel (`fuel_share_year()`), that yearly share is used instead, as a harmonic mean: `pidx = 1 / (s/fuel + (1 − s)/nonfuel)`. India is the reason: it bought mostly crude after 2022, so its pre-war mix (43% fuel) understated both its price level and its windfall (India −4.6% → −5.1% of GDP after this fix).

**Turkey** hides the partner for crude and gas in its customs. Since round 5 its prices come from [`turkey_prices.json`](../../research/2026-10/gaps/turkey_prices.json): Russian export prices, EPDK volumes and contract terms (gas about 70% hub-indexed), which confirmed the measured 2022 index of about 3 and replaced the oil-formula gas price (1.75) in `gas_prices.json` ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#turkey-a-special-case)). `PRICES_SKIP` is now empty.

The effect of own prices on band width (composite index, 2022, from `prices.json` `band_width_comparison`):

| country | benchmark band | own-price band |
|---|---|---|
| China | 38% | 9% |
| India | 40% | 11% |
| Korea | 52% | 10% |
| Germany | 45% | 36% (gas prices confidential) |
| Turkey | 41% | own index from contract terms (round 5) |

## One price basis: FOB (round 14)

Customs values and unit values are CIF: they include sea freight and insurance. The no-war benchmarks (Urals, Russian products) are FOB, at the Russian port. Until round 13 the windfall compared a buyer's CIF unit values with the FOB no-war price, so the war-time freight surge on longer routes counted as Russia's windfall (India: +EUR 10.7bn "extra paid", although Urals sold in 2022 at almost exactly its no-war price), and the same freight was credited again to tanker owners in the shipping part (audit C3).

Since round 14 oil is on one basis, FOB (`fob_factor()`, `payments_fob_factor()` in [`build_data.py`](../../pipeline/build_data.py)):

- **Measured freight.** The project's gross freight pool on Russian seaborne crude and products (USD bn per year, [`shipping-notes.md`](../../research/2026-10/gaps/shipping-notes.md) section 1: crude 3.0, 3.6, 2.2 in 2019–2021; 8.5, 11.0, 8.1, 7.2 in 2022–2025; 9.7 in January–August 2026) over the seaborne volumes the same notes use (crude 3.4 mb/d, products 2.25 mb/d) gives freight per barrel; against the Urals price and the Russian product price (`energy2.json` levels) it gives freight's share of the CIF value: crude about 3.9% in 2019–2021, 8–12% in 2022–2025, 14% in 2026.
- **Each importer.** Its pre-war freight share is its OECD ITIC margin (`CIF_BY_IMPORTER`, already taken off by `remove_freight()`); in each war year it is that margin times the change in the measured freight share (at most 35%). The excess comes off the oil part of its payments and off its own oil price index, so the volume is unchanged and the windfall compares FOB with the FOB no-war price. Border-priced supplies (`BORDER_PRICED`) and buyers supplied overland (Belarus, Kazakhstan, Kyrgyzstan, Tajikistan, Uzbekistan, Turkmenistan, Mongolia, Armenia, Azerbaijan, Afghanistan; a geographic judgement) have no sea freight. Coal and LNG keep CIF: there is no measured freight series for them.
- **Check.** Across the 61 buyers with their own crude prices, the median ratio of own crude price to Urals FOB, war years against 2021, is 0.98 after the change (on CIF values the notes measured 1.12): `check_data.py` check 23.
- **Effect.** India's windfall goes from +EUR 10.7bn extra paid to EUR 11.0bn paid below the no-war price (net −2.92% → −2.29% of GDP at that step), Türkiye −2.90 → −2.51, China −0.75 → −0.65. The method band keeps the CIF basis as an alternative ("freight").
- **What it leaves out.** Part of the freight went to Russia-linked traders and Sovcomflot. No evidence on that margin by buyer was found, so it is not shown separately.

## The mix of what was bought (round 14)

Russia's gain on what a country bought (`to_rus.gain`, `apply_net_gain()`) depends on how much of it was fuel. Two errors were found by the audit (C1, C2):

- **The fuel share before the war** came from `import_mix()`, which for 172 economies outside the 60 largest buyers is the 60-country average (57% fuel). Yemen's imports from Russia were 95% wheat. Since round 14 the step uses the measured 2018–2021 share, `fossil_share()`, the same as the price index and the windfall (`check_data.py` check 22), and the measured split over fuels from customs where it exists (`pre_war_fuel_split()`).
- **What was bought each year** came from the fuel tracker's tonnes, which for some buyers contradict customs (Uzbekistan's 2024 products 13 times 2021) and for 25 economies repeat the year before (2025 = 2024; Belarus 2021–2025 constant). Since round 14 the fuel share of what was bought comes from the country's own customs values per fuel, each deflated by its own price level (`customs_fuel_volumes()`), moved in odds against the pooled 2018–2021 share, so nothing is capped at 100% fuel. The tracker's tonnes only split the fuel share over fuels, except in copied years (`tracker_copied_years()`, published as `gain.tracker_copied`), where the customs split is used. How each year was measured is in `to_rus.gain.basis`.
- **Effect** (this step alone): Uzbekistan −6.3 → −3.2% of GDP, Belarus −5.0 → −2.0, Tunisia −7.5 → −5.1, Libya −3.7 → −6.6, Yemen −4.1 → −6.9 (its customs show mostly fuel bought in 2024–2025, against wheat before the war).

## Fuel price screen (round 14)

Round 13 screened non-fuel unit values (Yemen's 2023 wheat). Since round 14 fuel unit values are screened too (`fuel_outliers()`): an own crude, products, diesel, fuel-oil or coal index more than 1/0.6 times off its benchmark (both 2019–2021 = 1, oil at FOB) in a war year is a data error and is replaced by the benchmark for that year; years filled from the country's own post-war ratio inherit the error and are replaced with it; the composite fuel index is rebuilt from the screened parts. Flagged: Nigeria's products 2023–2026 (customs value over CREA tonnes: 0.53 of the benchmark), coal for Hong Kong, Croatia, Morocco, Oman and Slovenia, Brazil's 2022 crude, Spain's 2023–2026 products, Hungary's diesel. The 0.6 band is a judgement.

## Gas prices per country

Gas was priced very differently from country to country. [`gas_prices.json`](../../research/2026-10/gaps/gas_prices.json) ([notes](../../research/2026-10/gaps/gas_prices-notes.md)) gives the realised Russian gas price per country and year, for 50 countries:

- **Customs unit values** (A): Eurostat Comext and UN Comtrade, HS 271121 (pipeline) and 271111 (LNG).
- **Customs value ÷ external volume** (B): China's Power of Siberia, French LNG.
- **Peer customs** (B): Germany, Austria, Finland, Switzerland and others hide Russian gas in customs; they get the volume-weighted price of Czechia, Slovakia and Italy, whose contracts were also hub-indexed.
- **Published contract prices** (B): Belarus (USD 127–128.5 per 1,000 m³), Moldova, Armenia. Belarus's band is ±2% where the price is published (2019–2022) and, since round 12, the research's ±8% for 2023–2025 and ±15% for 2026, when the price is settled in roubles and its continuation is assumed (was ±2% for every year).
- **Oil-formula models** (C): price = k × 9-month Brent average lagged one month, k calibrated on Serbian and Bosnian customs (0.418 EUR/MWh per EUR/bbl); used for Turkey and Poland 2019–2022.

Examples of the 2022 index: Hungary about 7 (hub prices), Austria 4.85, Bulgaria 3.92, Serbia and Turkey about 1.8–1.9 (oil-linked), Armenia 1.13, Belarus 1.1 (fixed dollar price). `gas_index()` uses the country's own series where researched and the Europe-wide index otherwise. The same prices value **final-use gas** in the transit-gas swap ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#transit-gas)).

## War-time windfall

[build_data.py `war_windfall()`](../../pipeline/build_data.py), per country and year from 2022:

```
windfall_i = to_rus.years_i × fuel_share_i × (1 − nowar_i / fuel_index_i)
```

`nowar_i` is the price level a no-war market expected for the fuels the country bought (round 7, next section): each fuel's forecast price, weighted by the volume bought (`nowar_ratio()`), so a premium the country paid over the market is not carried into it. Before round 7 it was 1, the 2019–2021 price.

- `fuel_share_i` is fuel's share of that year's payments: measured from customs where `prices.json` has it (`fuel_share_year()`), otherwise the pre-war share moved to that year's prices, `fs × fuel / (fs × fuel + (1 − fs) × nonfuel)`.
- `(1 − nowar/fuel_index)` is the part of the fuel payment above the same volume at no-war prices. It is negative where Russia sold below them (discounts, the price cap): less money to Russia.
- The low value uses the low fuel price level and the high no-war price, the high value the reverse; the three are re-sorted each year because the fuel share moves with the price too.
- Certainty C, source id `windfall`.
- **At Russia's net gain (round 13 audit).** The windfall counted at 100% while volumes counted at Russia's net gain. Now it is multiplied by Russia's net gain on the extra price (`windfall_gain()`). Russia's costs do not rise with the price, so the gain on the extra price is all of it for crude, products and pipeline gas (1.0). For LNG it is the profit tax (20% in 2022, 34% in 2023–2025, 25% in 2026) plus Russia's 60% of the profit after tax (0.68–0.74). For coal it is at most the rent Russia still made at the actual price (`net_gain_russia.json`), spread over the price rise. Weighted by what the country paid for each fuel. Hungary and Türkiye barely change (pipeline gas), Japan and Spain (LNG) lose about a fifth of their windfall. The full value is kept as `windfall.alt` for the method band.
- **Türkiye's no-war gas price** weights hub prices (TTF) 0.7 and the oil formula 0.3 (`GAS_FORMULA`), from its contracts: about 70% hub-indexed since 2021 ([turkey_prices-notes.md](../../research/2026-10/gaps/turkey_prices-notes.md)). The 0.7/0.3 split itself is a judgement on those contract terms; its sensitivity is in the [round-13 decisions](../decisions.md#round-13-one-valuation-rule-for-every-seller).

On the map it is the part "Extra paid to Russia because of war-time prices" (`neg(sum3(T.windfall))` in `calc()`), or "Paid Russia less than no-war prices" where the total is negative.

Rules:

- **Fuel only.** The price rise of non-fuel goods is mostly general inflation, so it is left out.
- **Only money flowing to Russia.** Higher prices on goods *sold to* Russia do not count in the seller's favour.
- **On top of volume.** A country that cut volumes still gets the windfall on what it kept buying. Germany (round 14): −16.5bn (−24.3 to −10.1), almost all in 2022.

`prices.json` computes its own windfall too (all 102 countries EUR 601bn for 2022–2026, 486–716, including non-fuel goods); the map's part uses fuel only and the map's own payments series, so the two differ.

## No-war prices (round 7)

Comparing with 2019–2021 prices overstated the windfall: that average includes the 2020 COVID crash, and prices were
already rising in late 2021. Since round 7 the map compares with the prices a **no-war market expected**, from sources
dated before the invasion only ([`energy_nowar.json`](../../research/2026-10/gaps/energy_nowar.json),
[notes](../../research/2026-10/gaps/energy_nowar-notes.md)):

- **Central**: the median (oil) or mean (gas, coal) of the IMF WEO (October 2021, January 2022), the World Bank
  Commodity Markets Outlook (October 2021), the EIA STEO (December 2021 to February 2022), ECB and European Commission
  projections, and futures from October 2021 to January 2022. **Low**: the lowest of them. **High**: the mid-February
  2022 futures, which already held some war-risk premium.
- **Contract formulas**: hub-indexed gas (Hungary, Slovakia, Austria and others) follows the no-war TTF path;
  oil-indexed contracts (Serbia, Bosnia, Power of Siberia) a 9-month oil formula; mixed contracts (Türkiye 70/30,
  Greece, Bulgaria, North Macedonia, Moldova 50/50) both; fixed-price buyers (Belarus, Armenia, Kyrgyzstan, Uzbekistan,
  Kazakhstan, Azerbaijan, Georgia) get no windfall on gas. Per-country customs prices per fuel where `prices.json`
  measures them, else the pre-war fuel mix.
- **2026**: the 2026 price spike came from the closure of the Strait of Hormuz, which Iran shut to tanker traffic. The
  IEA's August 2026 Oil Market Report names the closure as the main cause of the supply loss (as reported by
  [Kuwait Times, 12 August 2026](https://kuwaittimes.com/article/47998/world/iea-cuts-2026-oil-demand-forecast-again-as-hormuz-remains-shut/);
  the IEA's own page blocked automated access, so the primary report is not linked). Russia's war did not cause it, so
  the no-war price in 2026 is the actual world price (Brent, diesel, TTF, JKM, Newcastle), and only Russia-specific
  price gaps count that year. This is a decision, not a measured value: the research left open whether to keep the
  pre-invasion path instead, which would count the spike as windfall ([energy_nowar-notes.md](../../research/2026-10/gaps/energy_nowar-notes.md),
  open question 2; [decisions](../decisions.md#constants-and-rules-written-down-in-round-11)).
- **The change in volume** is valued at the same no-war prices, so the two parts add up exactly:
  `actual − expected payment = (volume change × no-war price) + (actual volume × (actual price − no-war price))`.
  In the builder (`apply_nowar_prices()`) the expected path takes the no-war price on its fuel share
  (`bmul × (fs × nowar + 1 − fs)`), and the price index of payments values the fuel part at the no-war price.
- **Oil discount gain** (cost view) no longer counts Russia's normal pre-war discount to Brent (about 5%): India
  34 → 24bn, China 25 → 18bn.
- **Exchange rate**: the actual euro–dollar rate, so the windfall measures commodity prices, not the euro's fall.
- **Ranges**: the windfall and the volume part share the no-war price, so its uncertainty cancels between them except on the expected volume. It is carried once, as factors on the expected path (`nrl`, `nrh` in `data.json`, a fifth term in `spread()`); the windfall's own range covers only the actual price.

Effect: the windfall falls from EUR 455bn to roughly a third across all countries (China 117 → about 28, India 55 →
about 10, Türkiye 54 → about 20, Germany 29 → about 16). Urals sold in 2022 at almost exactly its no-war price; gas in 2022 was still more
than twice its no-war level. Countries that cut Russian gas and oil gain most: a no-war market would have paid Russia
more for the same fuel.

### Gold at its no-war price (round 16)

Raised by review 5 (M6), approved by the owner. Fuel volumes are valued at the prices a no-war market expected, but
until round 15 a change in the volume of gold was valued at each year's actual gold price (index 2.86 in 2026 against
2019–2021), so a buyer's number grew with the gold price alone. Since round 16 the gold share of a country's payments
is still measured in volumes with the actual gold price, and the change is then valued at the **2021 gold price held
flat** (`GOLD_NOWAR` in `build_data.py`; `deflate_gold()` re-weights `cur`). That is a judgement: for an asset price
the expectation is no change, and gold futures price only the cost of carry. The gold price rise itself is not counted
as a windfall in the central figure. That too is a judgement, not a finding: the rise has several causes (interest
rates, demand for safe assets), and **central banks' gold buying after Russia's reserves were frozen in 2022 is widely
linked to the war**, so some share of the rise may be the war's. Because that share cannot be measured, the method band
has an alternative, **gold at its actual price** (`gold_actual`, round 16b, raised by check 16, N5): the change in the
volume of gold valued at each year's gold price. Hong Kong's change is in [trade](trade.md#hong-kong-gold).

## 2026 and the Hormuz crisis (round 15)

Raised by the owner. Fuel prices in 2026 are high partly because of the Hormuz crisis: after the strikes on Iran at the start of March 2026 the Strait of Hormuz was shut to tanker traffic, and Brent averaged 35% above its pre-crisis futures from March to August 2026, diesel about 59% and Asian LNG about 75% ([CREA, *What the Hormuz crisis has cost fossil-fuel importers, March to August 2026*](https://energyandcleanair.org/what-the-hormuz-crisis-has-cost-fossil-fuel-importers-march-to-august-2026/), fetched 19 October 2026; the IEA's August report names the closure as the main cause of the supply loss, [Kuwait Times](https://kuwaittimes.com/article/47998/world/iea-cuts-2026-oil-demand-forecast-again-as-hormuz-remains-shut/); an S&P Global factbox of 20 April 2026 on the strait being closed again was found but could not be fetched: not verified). This war did not cause it.

- **The money stays in.** It really reached Russia, and buyers who stopped buying would have paid those prices, so 2026's changes are valued at 2026's prices like every other year (and the 2026 no-war price is the actual world price, [above](#no-war-prices-round-7)).
- **It is made visible.** The panel shows a note on 2026 wherever valuing 2026 at 2025 prices would move business with Russia by at least 0.01% of GDP, with that value and the 2022–2025 figure (`hormuzNote()`); the cited source is CREA's analysis.
- **Method band "2026 at 2025 prices".** `calc(c, y, {p26: true})` values 2026's business with Russia at 2025's no-war fuel price level (`to_rus.p26` = 2025 ÷ 2026 of the country's fuel price multiplier), the Russian crude in fuel bought elsewhere at 2025's Brent (`laund.p26` = 1.191 ÷ 1.515 = 0.786) and 2026's windfall at the same factor as payments. Built in `apply_nowar_prices()` and `current_euros()`.
- **Germany as an example**: its net is +3.22%<!-- n:DEU.net --> for 2022–August 2026 and +2.57%<!-- n:DEU.net2025 --> for 2022–2025 alone (round-15 GDP average; the review measured 3.34% and 2.68% against 2024 GDP). With 2026 at 2025 prices its business with Russia is +1.46%<!-- n:DEU.alt_p26.rus --> instead of +1.57%<!-- n:DEU.rus -->.

## A note on index bases

Every price index on the map is 2019–2021 = 1. `energy2.json` and `gas_prices.json` are on that base already; the own customs indices in `prices.json` are measured against 2018–2021 and rebased in `own_index()` (round 5). For flows that use the counterfactual the base cancels (the pre-war level is `years[0] / pidx[0]`), but the war-time windfall depends on it: measured against 2019–2021 prices it is about 5–7% larger than against 2018–2021, because 2018 had higher oil prices (Hungary −6.7% → −7.0% of GDP).

## See also

- [ranges.md](ranges.md): how `pidx_lo` and `pidx_hi` enter the likely range
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, laundered oil, energy premium and discount
- [counterfactual.md](counterfactual.md): the expected level the volumes are compared with
- Research notes: [prices-notes.md](../../research/2026-10/gaps/prices-notes.md), [gas_prices-notes.md](../../research/2026-10/gaps/gas_prices-notes.md), [energy2-notes.md](../../research/2026-10/gaps/energy2-notes.md)
- [Documentation index](../README.md)
