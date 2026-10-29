# Kosovo on the map (round 60)

File: `kosovo_r60.json`. Read by `_r60_replace()` in `pipeline/build_data.py`. Checked: 29 October 2026.

## Why it was missing

`build_data.py` keys every country by its ISO 3166 numeric code (`iso_numeric()`), and Kosovo has none (nor a UN M49 code), so it was dropped although its GDP and population were already in `other.json` and `gdp_avg_r15.json` (World Bank WDI) and its services trade with Russia in the BaTiS-based files (under BaTiS's code `XKV`). Kosovo now has the key `XKX` (the World Bank and IMF code) as both `iso3` and `n`; `load()` reads `XKV` as `XKX`.

**Map geometry.** `site/countries-50m.json` and `site/countries-lite.json` hold Kosovo as a polygon with no `id` (`properties.name` "Kosovo"). The map links data by `id`, so the geometry needs `id: "XKX"` (or `site/index.html` must set it, as it already does for Somaliland and Northern Cyprus) before Kosovo is coloured.

## Goods trade (Kosovo Agency of Statistics)

ASKdata, External trade, yearly table `tab02.px` (export and import by partner country, 2019–2025) and monthly tables `07_imp_country.px` / `06_exp_country.px` (January–August 2026), thousand EUR, retrieved 29 October 2026 through the PxWeb API (`https://askdata.rks-gov.net/api/v1/en/ASKdata/External%20trade/`).

| EUR m | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|---|---|---|
| imports from Russia | 38.4 | 46.5 | 51.3 | 25.3 | 1.36 | 0.20 | 0.04 | 0.03 |
| exports to Russia | 0 | 0.02 | 0.04 | 0.00 | 0 | 0 | 0 | 0 |
| imports from Ukraine | 22.5 | 19.0 | 36.7 | 16.9 | 32.1 | 16.2 | 20.9 | 6.1 |
| exports to Ukraine | 0.02 | 0.07 | 0.06 | 0.51 | 0.20 | 0.09 | 0.12 | 0.12 |

Kosovo bought EUR 38–51m a year from Russia before the war and almost nothing from 2023, after its government banned goods from Russia and Belarus (16 May 2022). It never sold more than EUR 35,000 a year to Russia. Russia does not recognise Kosovo and reports no trade with it, so there is no mirror check, and Russian goods arriving through Serbia or North Macedonia with another origin are not seen. Band ×0.78–1.28, as for other reported own statistics in `trade_full.json`. The product mix is not split by partner in ASKdata, so Russia's net gain uses the generic pre-war mix.

**Expected without the war.** No model was fitted for Kosovo; Montenegro's entries in `counterfactual.json` and `ua_trade_cf.json` are used (same region, same size class): 2021 held flat with the generic band of its size class (multipliers, method and class only).

## Aid to Ukraine

Not in the Kiel tracker. Documented: EUR 100,000 of humanitarian aid, "the first tranche", by government decision in 2022 (The Geopost); the same meeting widened the sanctions. The EU rule-of-law mission's (EULEX) vehicles donated from Pristina are EU money, not Kosovo's. High end allows for unrecorded small donations.

## Sanctions

Added to `sanctions_r58.json` (see its notes): own government decisions of 25 February and 16 May 2022 following EU and US measures; not in the EU's alignment statements; not on Russia's unfriendly list (Russia does not recognise Kosovo).

## Refugees

UNHCR publishes no separate count of refugees from Ukraine in Kosovo (its statistics list Kosovo under Serbia, S/RES/1244); no hosting cost is entered.

## Result (2022 to August 2026)

Kosovo cut Russia's earnings from trade by about 1.1% of its GDP (EUR 0.11bn, likely about 0 to 0.58bn), almost all from goods it stopped buying; support for Ukraine is about zero. Lean toward Ukraine, not certain.
