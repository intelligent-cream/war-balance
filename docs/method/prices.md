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

Exceptions: [`narrow.json`](../../research/2026-10/gaps/narrow.json) can set its own `pidx` (Turkey's `to_rus`), applied by `apply_narrow()`. [`check_data.py`](../../pipeline/check_data.py) check 12 verifies that every benchmark index averages 1 over 2019–2021 and that every `to_rus` series has a price level.

## The composite index for payments to Russia

For `to_rus`, a country's price level mixes what it bought before the war:

1. **Fuel price level**, `fuel_index()`:
   - its **own customs unit values** (value ÷ quantity of imports from Russia, 2018–2021 = 1) where measured, from [`prices.json`](../../research/2026-10/gaps/prices.json) (`index.fossil_all`, 102 countries; Eurostat Comext monthly for EU members, UN Comtrade elsewhere);
   - otherwise its pre-war fuel mix (crude, products, gas, coal; `energy2.json` `fuel_mix_2019_2021`, or the import-weighted average outside the 60 largest buyers, `import_mix()`) weighted over benchmark indices: Urals, Russian oil products, the country's own gas index (`gas_index()`, below) and coal.
2. **Non-fuel price level**: the country's own non-fuel index from `prices.json` where measured, else the Eurostat non-fuel index.
3. **Weights**: fuel's share of pre-war imports from Russia (`fossil_share()`: the measured 2018–2021 mix in `prices.json`, else the `energy2.json` mix). Where `prices.json` measures what share of each year's payments was fuel (`fuel_share_year()`), that yearly share is used instead, as a harmonic mean: `pidx = 1 / (s/fuel + (1 − s)/nonfuel)`. India is the reason: it bought mostly crude after 2022, so its pre-war mix (43% fuel) understated both its price level and its windfall (India −4.6% → −5.1% of GDP after this fix).

**Turkey is the exception** (`PRICES_SKIP`): its customs hide the partner for crude and gas, and its measured index (3.3 in 2022) conflicts with `gas_prices.json` (1.75). It keeps the benchmark-based index until a person reviews it ([prices-notes.md, "Weakest data"](../../research/2026-10/gaps/prices-notes.md); [limitations.md](../limitations.md)).

The effect of own prices on band width (composite index, 2022, from `prices.json` `band_width_comparison`):

| country | benchmark band | own-price band |
|---|---|---|
| China | 38% | 9% |
| India | 40% | 11% |
| Korea | 52% | 10% |
| Germany | 45% | 36% (gas prices confidential) |
| Turkey | 41% | 21% (benchmark kept) |

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
windfall_i = to_rus.years_i × fuel_share_i × (1 − 1 / fuel_index_i)
```

- `fuel_share_i` is fuel's share of that year's payments: measured from customs where `prices.json` has it (`fuel_share_year()`), otherwise the pre-war share moved to that year's prices, `fs × fuel / (fs × fuel + (1 − fs) × nonfuel)`.
- `(1 − 1/fuel_index)` is the part of the fuel payment above the same volume at pre-war prices.
- The low value uses the low fuel price level, the high value the high one; the three are re-sorted each year because the fuel share moves with the price too.
- Certainty C, source id `windfall`.

On the map it is the part "Extra paid to Russia because of war-time prices", always toward Russia (`neg(sum3(T.windfall))` in `calc()`).

Rules:

- **Fuel only.** The price rise of non-fuel goods is mostly general inflation, so it is left out.
- **Only money flowing to Russia.** Higher prices on goods *sold to* Russia do not count in the seller's favour.
- **On top of volume.** A country that cut volumes still gets the windfall on what it kept buying. Germany: −29.2bn (−33.6 to −25.9), almost all in 2022.

`prices.json` computes its own windfall too (all 102 countries EUR 601bn for 2022–2026, 486–716, including non-fuel goods); the map's part uses fuel only and the map's own payments series, so the two differ.

## A note on index bases

`energy2.json` indices are 2019–2021 = 1; `prices.json` and `gas_prices.json` indices are relative to each country's own 2018–2021 (or 2019–2021) average. For flows that use the counterfactual, the pre-war level is `years[0] / pidx[0]` (2021 at 2021's price level), so only the ratio between 2021 and later years matters and the base-period difference cancels ([counterfactual.md](counterfactual.md#1-what-expected-without-the-war-means)).

## See also

- [ranges.md](ranges.md): how `pidx_lo` and `pidx_hi` enter the likely range
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, laundered oil, energy premium and discount
- [counterfactual.md](counterfactual.md): the expected level the volumes are compared with
- Research notes: [prices-notes.md](../../research/2026-10/gaps/prices-notes.md), [gas_prices-notes.md](../../research/2026-10/gaps/gas_prices-notes.md), [energy2-notes.md](../../research/2026-10/gaps/energy2-notes.md)
- [Documentation index](../README.md)
