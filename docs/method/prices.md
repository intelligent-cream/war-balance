# Prices: volumes, not values, and the war-time windfall

Russian gas cost Hungary 7.6 times its pre-war price in 2022. A country that kept buying the same amount of gas paid far more, but it did not change its behaviour; a country that halved its purchases paid about the same money, but it did change. So the map compares **volumes**: each traded value is divided by its price level against before the war (`pidx`, 2019–2021 = 1) before it is set against the expected level. The extra money Russia earned because its fuel cost more is not lost: it is counted as a part of its own, the **war-time windfall**, toward Russia. This page explains where the price levels come from, how each country gets its own index, and how the windfall is computed.

## Why volumes

```
change_i = base × FRAC_i × bmul_i − value_i / pidx_i
```

If `pidx` were left out, a price spike would look like a rise in purchases (more paid to Russia) and a later price fall like a cut. With it, the comparison is between the expected volume and the actual volume, both valued at pre-war prices. The site applies it in `actV = (i, v, p) => v / p` inside `calc()` in [`site/index.html`](../../site/index.html). Up to round 3 this was the whole story, and price spikes simply did not count; since round 4 the windfall part puts the price effect on Russian fuel back in, separately and visibly.

## Which index each flow uses

Set by [build_data.py `price_indices()`](../../pipeline/build_data.py), with low and high variants (`pidx_lo`, `pidx_hi`):

| flow in `data.json` | index | source |
|---|---|---|
| `to_rus` (bought from Russia) | the country's own composite of fuel and non-fuel prices (below) | [`prices.json`](../../research/2026-10/gaps/prices.json), [`gas_prices.json`](../../research/2026-10/gaps/gas_prices.json), [`energy2.json`](../../research/2026-10/gaps/energy2.json) `price_index` |
| `from_rus`, `buy_ukr`, `sell_ukr` | Eurostat non-fuel goods import price index | `energy2.json` `price_index.non_fuel_goods` |
| `svc_bought`, `svc_sold`, `shipping` | euro-area services HICP | `energy2.json` `price_index.services` |
| `company` (taxes) | none: compared in money | |
| laundered oil | none: compared in money (higher prices count) | |

Exceptions: [`narrow.json`](../../research/2026-10/gaps/narrow.json) can set its own `pidx`, applied by `apply_narrow()` (no longer for Turkey's `to_rus`, which uses `turkey_prices.json` since round 5). [`check_data.py`](../../pipeline/check_data.py) check 12 verifies that every benchmark index averages 1 over 2019–2021 and that every `to_rus` series has a price level.

## The composite index for payments to Russia

For `to_rus`, a country's price level mixes what it bought before the war:

1. **Fuel price level**, `fuel_index()`:
   - its **own customs unit values** (value ÷ quantity of imports from Russia, 2018–2021 = 1) where measured, from [`prices.json`](../../research/2026-10/gaps/prices.json) (`index.fossil_all`, 102 countries; Eurostat Comext monthly for EU members, UN Comtrade elsewhere);
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

## Gas prices per country

Gas was priced very differently from country to country. [`gas_prices.json`](../../research/2026-10/gaps/gas_prices.json) ([notes](../../research/2026-10/gaps/gas_prices-notes.md)) gives the realised Russian gas price per country and year, for 50 countries:

- **Customs unit values** (A): Eurostat Comext and UN Comtrade, HS 271121 (pipeline) and 271111 (LNG).
- **Customs value ÷ external volume** (B): China's Power of Siberia, French LNG.
- **Peer customs** (B): Germany, Austria, Finland, Switzerland and others hide Russian gas in customs; they get the volume-weighted price of Czechia, Slovakia and Italy, whose contracts were also hub-indexed.
- **Published contract prices** (B): Belarus (USD 127–128.5 per 1,000 m³), Moldova, Armenia.
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

On the map it is the part "Extra paid to Russia because of war-time prices" (`neg(sum3(T.windfall))` in `calc()`), or "Paid Russia less than no-war prices" where the total is negative.

Rules:

- **Fuel only.** The price rise of non-fuel goods is mostly general inflation, so it is left out.
- **Only money flowing to Russia.** Higher prices on goods *sold to* Russia do not count in the seller's favour.
- **On top of volume.** A country that cut volumes still gets the windfall on what it kept buying. Germany: −15.5bn (−23.5 to −7.3), almost all in 2022 (−29.2bn against 2019–2021 prices).

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
- **2026**: the Strait of Hormuz closure was not caused by this war, so the no-war price in 2026 is the actual world
  price (Brent, diesel, TTF, JKM, Newcastle). Only Russia-specific price gaps count that year.
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

## A note on index bases

Every price index on the map is 2019–2021 = 1. `energy2.json` and `gas_prices.json` are on that base already; the own customs indices in `prices.json` are measured against 2018–2021 and rebased in `own_index()` (round 5). For flows that use the counterfactual the base cancels (the pre-war level is `years[0] / pidx[0]`), but the war-time windfall depends on it: measured against 2019–2021 prices it is about 5–7% larger than against 2018–2021, because 2018 had higher oil prices (Hungary −6.7% → −7.0% of GDP).

## See also

- [ranges.md](ranges.md): how `pidx_lo` and `pidx_hi` enter the likely range
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, laundered oil, energy premium and discount
- [counterfactual.md](counterfactual.md): the expected level the volumes are compared with
- Research notes: [prices-notes.md](../../research/2026-10/gaps/prices-notes.md), [gas_prices-notes.md](../../research/2026-10/gaps/gas_prices-notes.md), [energy2-notes.md](../../research/2026-10/gaps/energy2-notes.md)
- [Documentation index](../README.md)
