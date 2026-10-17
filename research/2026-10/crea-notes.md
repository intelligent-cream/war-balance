# CREA / fossil payments to Russia: method and gaps (retrieved 2026-10-17)

Output: `working/research/crea.json`
Build script: `working/scripts/build_crea.py`
Raw files: `.../research/raw/{crea,comtrade,minfin,ecb,fred}/`

## Data access
- The CREA tracker API is **not** on api.energyandcleanair.org: there `/v0/counter` returns 404 and `/v1/russia_counter` sits behind Cloudflare. It lives at **https://api.russiafossiltracker.com** (Swagger: `/swagger.json`). The useful endpoints are `/v0/counter` (aggregate_by year, destination_iso2 and commodity_group, `commodity_grouping=split_gas_oil`, format=csv), `/v0/counter_last` and `/v0/price`. Data runs from 2021-01-01 to 2026-10-16. Counter version v2 is based on Kpler trades, with pricing_scenario "default".
- Two queries were saved: calendar years from 2021 (`counter_year_country_fuel_2021on.csv`) and the period since 2022-02-24 (`counter_year_country_fuel_from20220224.csv`). Global and region aggregates are in `counter_global_year_fuel.csv` and `counter_region_year.csv`.

## Field definitions
- `fossil_2021`: CREA's estimate for 2021, using the same method as the later years so they can be compared (certainty B). `fossil_2021_comtrade_crosscheck` holds the UN Comtrade value the importer reported for HS 27 imports from Russia, converted to EUR at the 2021 ECB rate (certainty A). Belarus does not report to Comtrade, so its figure is Russia's reported exports to Belarus. The two sources differ a lot for gas: EU customs records do not attribute pipeline gas to Russian origin, and CREA prices gas at hub prices. For the EU in 2021, CREA gives €137.8 bn and the Comtrade sum (25 member states; Cyprus and Malta not fetched) is €107.3 bn.
- `fossil_by_year.2022` counts from 24 Feb 2022. `2022_calendar_full` is also given. `2026_ytd` runs to 2026-10-16, and the latest days are still being revised upward.
- `fossil_total_since_invasion` covers 24 Feb 2022 to 16 Oct 2026. `by_fuel` (crude, products, pipeline_gas, lng, coal) splits the same total.
- `laundered_oil` (C) is taken from CREA reports only, as a lower bound for part of the period. The measure differs by country:
  - USA, GBR and AUS: value of oil products refined from Russian crude.
  - NLD, FRA and ITA: value of the Russian crude used as input, for Dec 2022 to Dec 2023 only.
  - `laundered_oil_detail.windows` lists each period. "GROSS" figures are all products imported from refineries that run partly on Russian crude, and they are not counted in the headline value.
  - CREA's method assumes refinery feedstock is perfectly mixed, so the Russian share of crude intake is applied to product exports (Kpler data plus refinery output data).
- `oil_discount_gain` (C) uses only published third-party estimates:
  - India: ICRA, $13.0 bn for Apr 2022 to Feb 2024.
  - China: Banque de France, $10.6 bn for 2022 to H1 2023.
  - Turkey: Reuters, $2 bn for 2023.
  - Their methods and periods differ. All other countries are null.
- FX: ECB annual averages in USD per EUR: 2021 1.1827, 2022 1.0530, 2023 1.0813, 2024 1.0824, 2025 1.1300. For 2026 the mean of the Jan-Sep monthly averages is 1.1625.

## Global
- CREA calendar-year totals, all destinations, EUR bn: 2021 237.3, 2022 375.6, 2023 244.8, 2024 235.9, 2025 193.2, 2026 YTD 170.3. The total since the invasion is €1,166 bn. CREA's reports give invasion-year totals of €242 bn for year 3 and €193 bn for year 4.
- Russian federal budget, from MinFin xlsx, oil and gas share of revenue: 2021 35.8%, 2022 41.6%, 2023 30.3%, 2024 30.3%, 2025 22.7%, 2026 Jan-Sep 18.5% (preliminary).

## Gaps / caveats
1. CREA does not track rail or road deliveries, nor pipeline flows to CIS countries. Belarus, Kyrgyzstan, Armenia and Uzbekistan are therefore null. Kazakhstan and Azerbaijan values are close to zero and are lower bounds. The Comtrade cross-check gives an idea of their 2021 size.
2. Transit hubs (DE via Nord Stream, TR via TurkStream, SK, AT, HU) may include gas that was consumed further downstream.
3. Laundered oil has no consistent per-country series over time. A CREA G7+ partial sum is in `global` (8.5 + 9.0 + 7.2 = €24.7 bn for Dec 2022 to Feb 2026, with Jan-Feb 2024 missing). The EU ban took effect on 21 Jan 2026. CREA data reported by Novaya Gazeta still finds €929 mn reaching the EU in Jan-May 2026.
4. Oil discount gains could not be derived from CREA's own price series. The `/v0/price` crude price is a blended price, not Urals, so no consistent model was built.
5. KSE: only a cumulative loss estimate ($159 bn, Mar 2022 to Aug 2025) and projections were captured. No annual KSE revenue series.
6. 2026 values are inflated by the oil-price spike from the Hormuz crisis. Brent was about $126-130 in mid-Oct 2026, per FRED.
