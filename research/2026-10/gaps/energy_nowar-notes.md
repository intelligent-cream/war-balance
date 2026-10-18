# No-war energy prices (round 7)

Data: [`energy_nowar.json`](energy_nowar.json). Not yet reviewed by a person.

## What changes

Until now the map compared fuel prices with the **2019–2021 average**. That average includes the COVID crash of 2020, and late 2021 already had very high gas prices, so "war-time prices" were measured against a level no market expected. The owner approved a switch to the prices a **no-war market expected**, using only information published before 24 February 2022.

The result in short: **the windfall roughly halves.** For all countries the war-time price windfall falls from EUR 455bn to about EUR 199bn (range 24–330) over 2022–2026. Oil gets almost no windfall: Russia's discount ate the extra. Gas still has a large windfall in 2022.

## 1. The no-war price path

### Sources (all from before the invasion)

| source | date | what it gives |
|---|---|---|
| IMF WEO | Oct 2021 | oil USD 65.7 (2021), 64.5 (2022) |
| IMF WEO Update | 25 Jan 2022 | oil USD 77.3 (2022), 71.3 (2023); futures: gas +58% in 2022, lower in 2023 |
| World Bank CMO | 21 Oct 2021 | oil, Europe gas, Japan LNG, Australian coal to 2025 (and 2030) |
| EIA STEO | Dec 2021, Jan 2022, Feb 2022 | Brent 2022: 70.1, 75.0, 83.0; 2023: 67.5, 68.5; diesel 225 / 206 c/gal |
| ECB/Eurosystem projections | Dec 2021 (futures to 25 Nov) | Brent 77.5 / 72.3 / 69.4 (2022–2024) |
| European Commission | Autumn 2021 / Winter 2022 | TTF 49.5 (2022), 30.6 (2023); Brent 78.9 / 72.3, then 84.4 / 77.4 (January futures) |
| ICE settlements (ENGIE EnergyScan) | Dec 2021 – 23 Feb 2022 | TTF Cal-22 and Cal-23, day by day |

IMF oil is the average of Brent, Dubai and WTI, about 2.5% below Brent; the World Bank's crude average is about 2% below. Both were scaled to Brent. The IEA's Oil Market Report also used futures, so it adds nothing new.

### How the path is chosen

- **Central** = the middle of the forecasts dated October 2021 to January 2022. For oil this is the median of eight forecasts. For gas and coal it is the mean of the institutional forecasts and the early/mid-January 2022 futures, because those two disagreed a lot.
- **Low** = the lowest pre-war source. These are mostly October 2021 forecasts, made before the gas squeeze of the fourth quarter.
- **High** = the mid-February 2022 futures.
- **Did the February curves hold a war premium? Yes.** TTF Cal-23 rose from about 43 EUR/MWh in mid-January to 52–56 in mid-February, and to 57–63 on 22–23 February. On 31 January ENGIE wrote "Growing risk premium at the TTF beyond WIN22", after US statements on Nord Stream 2. Brent rose about 10 USD between December and mid-February. February curves therefore set the top of the range, not the middle.
- **2025–2026** are past most pre-war horizons. They extend the World Bank path and the slope of the Nov 2021 and Jan 2022 futures curves (certainty D).
- **Currency**: every index is EUR-based at the **actual** USD/EUR rate, like `energy2.json`. The windfall then measures fuel prices, not the euro's fall in 2022. With the pre-war expected rate (1.13) the no-war index would be about 7% lower in 2022, and the windfall larger.

### Result: no-war index (central, low–high) against the actual index, 2019–2021 = 1

| fuel | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| Brent | 1.41 (1.22–1.63) / **1.87** | 1.30 (1.19–1.44) / **1.49** | 1.25 / **1.45** | 1.17 / **1.19** | 1.12 / **1.51** |
| Urals | 1.41 (1.18–1.64) / **1.43** | 1.30 (1.15–1.45) / **1.15** | 1.24 / **1.24** | 1.17 / **0.97** | 1.12 / **1.21** |
| Products incl. diesel/gasoil | 1.45 (1.19–1.83) / **1.71** | 1.31 / **1.38** | 1.26 / **1.34** | 1.18 / **1.14** | 1.13 / **1.49** |
| TTF | 2.57 (1.64–3.46) / **5.30** | 1.60 (1.20–2.42) / **1.76** | 1.30 / **1.49** | 1.15 / **1.57** | 1.09 / **1.96** |
| Russian pipeline gas, Europe | 2.27 (1.55–2.96) / **4.51** | 1.54 / **2.32** | 1.29 / **1.71** | 1.15 / **1.78** | 1.10 / **2.31** |
| Russian LNG, Europe | 2.57 / **3.72** | 1.60 / **2.14** | 1.30 / **1.58** | 1.15 / **1.76** | 1.09 / **1.87** |
| JKM (Asian spot LNG) | 2.20 (1.43–2.94) / **3.89** | 1.39 / **1.53** | 1.14 / **1.33** | 1.01 / **1.32** | 0.96 / **1.71** |
| Newcastle / API2 coal | 1.68 (1.42–2.29) / **4.39** | 1.29 / **2.09** | 1.13 / **1.60** | 0.99 / **1.20** | 0.92 / **1.41** |
| Russian coal | 1.68 / **2.22** | 1.29 / **1.45** | 1.13 / **1.26** | 0.99 / **1.15** | 0.92 / **1.21** |

In bold: the index the map uses now (`energy2.json`) or the same benchmark on the same base. All low/high values are in the JSON.

No-war levels, central: Brent 76.5 / 72.3 / 69.4 / 68.0 / 67.0 USD; Urals 0.98 × Brent; TTF 59 / 37 / 30 / 27 / 25 EUR/MWh; Newcastle 147 / 116 / 102 / 93 / 89 USD/t.

What this means:
- **Oil**: Urals in 2022 (USD 76) was almost exactly what the market expected for Urals without a war (USD 75). The high Brent price went to Russia's buyers as a discount, not to Russia. In 2023 and 2025 Urals was *below* the no-war path.
- **Gas**: 2022 is still far above the no-war path, by more than twice. From 2023 the gap is small for hub prices, but Russian pipeline gas stays above it.
- **Coal**: Russian coal was above the no-war path only in 2022–2023.
- **LPG** is priced off crude (index = Brent × 0.9–1.1). On the map it sits inside products and other fuels, so it needs no series of its own.
- **API2**: no free archive of early-2022 coal futures was found. API2 uses Newcastle with the pre-war ratio (0.81), and both are certainty D.

## 2. Contract prices

`gas_prices.json` already covers every country asked about: Hungary, Serbia, Slovakia, Austria, Türkiye (via `turkey_prices.json`), China, Belarus, Armenia, Kazakhstan, Uzbekistan and Moldova. No better actual series were found, so the actual prices are kept. What is new is the **no-war contract price**, worked out from each contract's formula:

- **hub-indexed** (Hungary since its Sept 2021 contract, Slovakia, Austria, Germany, Italy, Czechia, Poland after its 2020 arbitration award): the price moves with TTF;
- **oil-indexed, 9-month average lagged one month** (Serbia, Bosnia, China's Power of Siberia): the annual price is half last year's and half this year's oil price;
- **mixed** (Türkiye 70% hub / 30% oil since the 2021 renegotiation, which came before the war; Greece, Bulgaria, North Macedonia and Moldova 50/50);
- **fixed political prices** (Belarus USD 128.5, Armenia USD 165, Kyrgyzstan, Uzbekistan, Kazakhstan swaps): the no-war price is the actual price, so there is **no windfall**;
- **Asian LNG**: Japan and Korea (Sakhalin-2) are oil-indexed with a 3-month lag; China is half oil-indexed, half JKM.

The no-war price is the country's actual price × (formula at no-war inputs ÷ formula at actual inputs). This keeps each contract's own premium or discount.

| EUR/MWh | 2022 actual → no-war | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| Hungary (hub) | 128 → 62 | 48 → 44 | 32 → 28 | 38 → 28 |
| Slovakia (hub) | 99 → 48 | 47 → 43 | 38 → 33 | 39 → 28 |
| Austria (hub) | 97 → 47 | 49 → 44 | 37 → 32 | 39 → 28 |
| Türkiye (70/30) | 99 → 52 | 38 → 34 | 35 → 31 | 36 → 28 |
| Serbia (oil) | 34 → 29 | 39 → 32 | 30 → 26 | 29 → 26 |
| China, Power of Siberia (oil) | 23 → 20 | 25 → 20 | 23 → 20 | 20 → 19 |
| Moldova (50/50) | 71 → 41 | 95 → 82 | | |
| Belarus, Armenia, Uzbekistan (fixed) | no change | | | |

**Crude by buyer** (customs CIF, USD/bbl; discount to Brent):

| | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| India | 94.1 (−6.8) | 74.6 (−7.9) | 78.2 (−2.3) | 69.8 (+0.7) |
| China | 92.3 (−8.6) | 83.2 (+0.7) | 78.7 (−1.8) | 66.3 (−2.8) |
| Türkiye | 79.4 (−21.6) | 65.3 (−17.2) | 69.5 (−11.0) | 57.2 (−11.9) |

- India's and China's customs prices include freight, which rose sharply. Their CIF discount is therefore much smaller than the FOB discount in `energy.json`.
- Türkiye's price is MinFin Urals plus freight, so its discount is the full Urals discount.
- **ESPO** traded 4.5–6 USD above Dubai in late 2021, which is about Brent (Platts). The no-war ESPO price = Brent × 0.97–1.04. China's own customs index (`prices.json`) already captures ESPO better than any benchmark.
- India's CIF price is above Brent in 2026 (Jan–Aug). This drives its 2026 windfall and should be checked in `prices.json`.

## 3. Switching premium and oil discount (cost view)

**The switching premium does not need correcting.** `energy.json` measures it as replacement price minus the **same year's Russian realised price**, not against 2019–2021. That is the right comparison for the cost of choosing another supplier. Measuring it against the no-war price would add the war-time price spike on volumes no longer bought from Russia. That spike was paid to Norway, Qatar or the US, and would have been paid without switching, so it is not a cost of switching.

How it fits with the windfall: the two cover **different volumes**. The windfall covers what was still bought from Russia; the switching premium covers what was replaced. They do not overlap, and the general spike on non-Russian fuel stays out of both, as before.

**The oil discount gain does need a small correction.** It counts Brent minus the Russian price in full. But Russian crude sold about 5% below Brent even before the war (k = 0.948 in `energy.json`), and that part would have existed without the war. Net of it, the gain falls by 21–44% a year (factors 0.73, 0.75, 0.66, 0.56, 0.79 for 2022–2026). The total falls from EUR 100bn to 72bn: India 33.8 → 24.1, China 24.9 → 18.1, Türkiye 7.7 → 5.5. The values per country are in `switching_cost_r7`.

The new windfall and the discount gain look at the same discount from two sides, but in different views. The windfall (money toward Russia) is now smaller because Russia sold at a discount. The discount gain (cost carried) counts the same discount as the buyer's saving against the war-time market. Neither view counts it twice.

## 4. Formula for the builder

```
actual − expected = (V − E) × n  +  V × (p − n)
                    volume part     new windfall
V = A / p   (A = to_rus.years × fuel share of the year, p = fuel_index)
E = base × FRAC × bmul × fs          (expected fuel volume at 2019–2021 prices)
n = no-war fuel price level          (2019–2021 = 1; 1 in 2021)
windfall_new = A × (1 − n / p)       (was A × (1 − 1 / p))
```

The identity is exact for fuel; non-fuel goods stay as they are.

Steps for `build_data.py` and the site:

1. `nowar_fuel_index(iso3, band)`, using the same per-fuel shares as the current windfall code:
   - where `prices.json` has the year's fuel payments by fuel (`windfall_parts`): `n/p = Σ s_f × N_f / p_f`, where `p_f` is the own customs index or the benchmark;
   - for gas: `N/p = F(no-war) / F(actual)`, from the contract's formula;
   - otherwise: the pre-war mix, with the same weights as `fuel_index()`.
2. `war_windfall()`: `tr["years"][i] * fsy * (1 - n[i] / fuel[i])`. The low end takes the low `p` and the high `n`; keep the re-sorting.
3. Volume part at no-war prices:
   - actual side: `pidx_r7 = 1 / (fsy × n / fuel + (1 − fsy) / nonfuel)`;
   - expected side: `nmul = fs × n + (1 − fs)`. Keep it as its own field and multiply it in `exV()` in `calc()` (one line, clearer). Folding it into `bmul` also works without a site change.
4. `check_data.py`: add a check that windfall + fuel volume part = E × n − A for every country and year.

The volume part changes too. A country that cut its fuel purchases now gets the cut valued at no-war prices, so for gas in 2022 at up to 2.6 times the 2019–2021 price.

## 5. Effect on the windfall, 10 biggest fuel buyers (EUR bn, 2022–2026)

Central actual prices with the low–high no-war path; builder ranges will be wider.

| country | fuel paid | windfall now | windfall new (range) | change |
|---|---|---|---|---|
| China | 383.6 | 116.6 | 44.6 (−1.2 – 79.0) | −72.0 |
| India | 199.9 | 54.7 | 19.5 (−1.6 – 36.5) | −35.2 |
| Türkiye | 127.3 | 53.8 | 24.8 (5.3 – 38.7) | −28.9 |
| Germany | 45.0 | 29.2 | 15.8 (8.2 – 22.7) | −13.5 |
| Hungary | 29.8 | 17.0 | 7.6 (2.2 – 12.1) | −9.4 |
| Netherlands | 28.4 | 12.0 | 6.5 (1.9 – 10.2) | −5.5 |
| Italy | 28.3 | 17.5 | 9.7 (4.5 – 14.2) | −7.7 |
| France | 27.3 | 11.8 | 9.4 (4.2 – 13.7) | −2.4 |
| Belarus | 26.7 | 3.7 | 0.0 (−2.0 – 1.7) | −3.7 |
| Korea | 23.7 | 8.9 | 5.2 (1.0 – 7.6) | −3.7 |
| **top 10** | | **325.2** | **143.1 (22.6 – 236.6)** | **−182** |
| all countries | 1,260 | 455.1 | 199.1 (24.1 – 329.5) | −256 |

What drives it:
- **India and China**: in 2023 and 2025 they paid about the no-war price. Their remaining windfall comes mostly from 2022 and the 2026 Hormuz spike.
- **Germany, Hungary and Italy**: the 2022 gas spike remains, at about half its old size.

## Decisions for the owner

1. **Negative windfall.** In some years Russia sold below the no-war price: China 2025, Belarus, and low-end cases. Show these as negative ("Russia earned less because of war-time discounts"), or floor them at zero? The map now says "always toward Russia".
2. **2026 and the Hormuz spike.** Measured against a path fixed in early 2022, the 2026 Hormuz spike counts as windfall: it is over half of India's new total and a third of China's. Keep the ex-ante path, or cap 2026 at the 2025 gap, since the war did not cause the spike?
3. **Was the late-2021 gas squeeze part of the war?** The IEA said in January 2022 that Gazprom was holding back supply. If that squeeze counts as war preparation, the low end of the range (October 2021 forecasts, TTF 38 in 2022) is the better central value. That would raise the 2022 gas windfall by about a third.
4. **Currency.** Actual USD/EUR (chosen) or the pre-war expected 1.13 (adds about 7% to the 2022 windfall on dollar fuels)?
5. **Volume part at no-war prices.** This makes "less paid to Russia" larger for gas cutters in 2022. Germany's volume credit rises because its cut gas is now valued at about 2.2 × the pre-war price instead of 1. Accept this, or keep the volume part at 2019–2021 prices and change only the windfall? Keeping it breaks the exact identity.
6. **Oil discount gain**: apply the pre-war differential correction (−28%)?

## Weak spots

- Coal futures for early 2022 are approximate. API2 is derived from Newcastle.
- 2025–2026 are extrapolated (certainty D).
- The IMF October 2021 figures come from secondary reports: the IMF PDFs were blocked (HTTP 403/429).
- `energy.json` labels FRED `PNGASJPUSDM` as an oil-indexed Japan LNG price, but in 2022 it averages USD 33.3/MMBtu, close to JKM spot. That makes the low end of the gas switching premium too high. Check this separately.
- Hub shares in the mixed gas contracts (0.5, 0.7, 0.75 for the European benchmark) are judgement calls.

Scripts and downloads: the scratchpad folder `r7/energy_nowar/` (`scripts/nowar.py`, `scripts/assemble.py`, `raw/`).
