# Pre-war trends for services, company taxes and shipping (2012-2021 → 2022-2026)

Data file: `research/2026-10/gaps/trend2.json`. Generated 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What it is for

This file extends the trend method in `trend.json` (goods trade) to the flows that still use a flat 2019-2021 baseline:

- `svc_sold`: services sold to Russia (tourism, transport, business services), including what Russian tourists spend in the country
- `svc_bought`: services bought from Russia
- `company`: taxes paid in Russia by Russian subsidiaries of companies based in each country
- `shipping`: tanker shipping, insurance and registry income on Russian oil and LNG

The output has the same shape as `trend.json`:

**counterfactual real value(Y) = 2019-2021 real average × multiplier(Y)**

Multiply by the year's price index for a nominal value. For services that is `energy2.json` `price_index.services`.

Coverage:
- services: 199 economies × 2 flows. 58 of the 398 series are reliable. Of the 56 series with a 2019-2021 base of at least EUR 0.5 bn, 14 are reliable.
- company taxes: 43 home countries, plus a global trend. 14 of the countries are reliable.
- shipping: one global volume trend, repeated for the 43 countries in `shipping.json`.

### Read this first: the map's services and company baselines are 2021, not 2019-2021

In `pipeline/build_data.py`:
- the services `base` is the 2021 value from `uncovered.json`
- the company series also starts in 2021

For travel, 2021 was a COVID year. Thailand's 2021 travel income from Russia was about 2% of its trend, and Finland's about 7%.

To apply these multipliers to a 2021 base, use:

**multiplier vs 2021 = multiplier / `base_2021_over_2019_2021`**

Examples:
- Thailand `svc_sold`: 3.28 / 0.112, about ×29 by 2026.
- Turkey `svc_sold`: 1.11 / 0.94 = 1.18.

For company taxes, `trend_2021_over_2019_2021` (central 1.045) does the same job. The cleaner fix is to move the map's services baseline to 2019-2021, or to 2019 alone. Either way the COVID handling below matters more than the trend itself.

## Method

### 1. Services

**Data.** OECD-WTO BaTiS, partner Russia, 2010-2021, total services (S) and travel (SD), in USD.
- The **balanced** series (B) is the central series. It is the only one that covers every country and every year, and it reconciles the two sides' reports.
- Two other sources are refitted on the same years. The band covers their slopes (source uncertainty):
  - **Own report.** Eurostat `bop_its6_det`, partner RU, for the EU, EFTA, candidates and Türkiye. Elsewhere, BaTiS own-report values that are not imputed.
  - **Russia's report by partner.** This is the Bank of Russia's figure, available through BaTiS. For travel, Russia's travel imports by country are the proxy for Russian tourist spending per destination.
- Flag `source_sensitive`: an own or Russian slope differs from the balanced slope by more than 0.10 log. Applied to 105 series.

**Real terms.**
- USD is converted to EUR at ECB annual averages, then deflated with the euro-area services HICP (Eurostat `prc_hicp_aind`, SERV), rescaled to 2019-2021 = 1.
- For 2019-2021 this matches `energy2.json` `price_index.services` exactly (0.989 / 0.998 / 1.013).
- Back to 2012 the index runs 0.899 (2012), 0.911, 0.923, 0.937, 0.947, 0.960, 0.974 (2018).
- **Deflator sensitivity:** each series is refitted in real USD with the US services CPI. The shift is added to the band, as in `trend.json`.

**Two components, because COVID hit travel much harder:**
- **Travel** is fitted on 2012-2019 only, leaving out 2020-2021.
- **Other services** (total minus travel) are fitted on 2012-2021 without 2020.
- Window choice follows `trend.json`:
  - **Break test.** If 2012-2013 sit more than 0.20 log off the post-2016 line (|t| > 2), only the post-2014 regime is used: 2016-2019 for travel, or 2016-2021 without 2020 for other services.
  - **Shock test.** Otherwise, if 2014-2015 are significantly below the line through the other years, they are left out.
  - **Default.** Otherwise all years are used.
  - In all cases one gross outlier (more than 0.40 log and more than 3 SD) may be dropped.
- The post-2014 travel window has only 4 points, so those series are flagged `few_points` and are unreliable.

**COVID rebound.** The 2019-2021 base is far below where travel would have been without COVID.
- Counterfactual travel in year Y = mean(actual 2019, trend 2020, trend 2021) × damped trend(Y) × recovery(Y).
- Recovery closes the 2021 shortfall against trend at the world pace of tourism recovery. UNWTO international arrivals were about 31% of 2019 in 2021, 66% in 2022, 88% in 2023 and 99% in 2024. So 49% of the 2021 gap is still open in 2022, 17% in 2023, 1% in 2024 and none after.
- The low case recovers 1.5× slower and the high case 2× faster.
- The result is divided by the actual 2019-2021 travel average.
- For other services, only 2020 is replaced by its trend value.
- The two components are weighted by their actual 2019-2021 shares (`travel_share_2019_2021`).
- `multiplier_ex_covid` gives the damped trend alone, relative to a COVID-free 2019-2021 base. Use it if the baseline itself is moved off the COVID years.

**Damping** is the same as `trend.json`: half-life 3 years, cap ±10% a year, 2019-2021 anchored at 2020.
- For the trend part alone the 2026 maximum is ×1.41.
- Services multipliers can exceed this because of the COVID rebound.

**Special cases:**
- **Türkiye:** 2016 is left out (Russian flight and package-tour ban, Nov 2015 to mid-2016).
- **Egypt `svc_sold`:** Russian flights were banned from Nov 2015. Cairo reopened in Apr 2018 and the Red Sea resorts in Aug 2021. Egypt's travel series is a policy level, not a trend, so the counterfactual travel level is flat for 2022-2026:
  - low: 2021 annualised (the resort flights ran about 4.5 months), EUR 1.09 bn real
  - high: the 2012-2014 pre-ban level, EUR 1.90 bn
  - central: the geometric mean of the two
  - Against a 2019-2021 base of EUR 0.23 bn this gives ×6.5 (4.9-8.7). The series is unreliable.
- **Ukraine** is flagged `rus_ukr_bilateral` and is unreliable.

**Reliability.** `reliable` is false if any of these flags is set: `few_points` (fewer than 5 years), `small_base` (2019-2021 base below EUR 10 m), `noisy_fit` (residual SD above 0.30 log), `wide_band` (fit band wider than 0.20 log), `window_sensitive`, `source_sensitive` or `rus_ukr_bilateral`. As in `trend.json`, `sanctions_after_2014` (EU, US and others, plus Türkiye) makes a series unreliable only when it shows a 2014 break or shock.

Informational flags:
- `covid_rebound`: the no-COVID travel base is more than 1.15× the actual one
- `policy_break`
- `break_2014`
- `shock_2014_15`
- `outlier_dropped`

Flag counts (398 series): covid_rebound 297, break_2014 192, small_base 178, window_sensitive 169, wide_band 131, noisy_fit 118, few_points 114, source_sensitive 105, sanctions_after_2014 78, shock_2014_15 56, outlier_dropped 52, policy_break 3, rus_ukr_bilateral 2.

### 2. Company taxes paid in Russia

**No pre-2021 series of these taxes exists.** KSE and B4Ukraine start in 2021, and the Bank of Russia stopped publishing FDI by country in 2022. The trend is therefore built from proxies for 2015-2021, in real EUR deflated by the euro-area all-items HICP:

| proxy | 2015-2021 | 2016-2021 |
|---|---|---|
| Income payable on direct investment in Russia (Bank of Russia BoP: profits of foreign-owned firms) | +8.9%/yr | +7.8% |
| Inward FDI position, reported by Russia (IMF DIP) | +5.8% | +1.5% |
| Inward FDI position, reported by investor countries (IMF DIP, counterpart data) | +1.0% | +0.0% |
| Russian GDP in EUR | +2.4% | +2.6% |

- **Global trend:** central = mean of the four 2015-2021 slopes, **+4.5%/yr**. The band, −2.1% to +11.3%, is the range of all eight central slopes, widened by half the mean 90% sampling error.
- **2026 multiplier: 1.17 (0.93-1.41).** The year-by-year path is in `global.company`.
- **Per home country:** half the country's own FDI-position trend (the mean of the Russia-reported and partner-reported series) plus half the global trend. The band is the global band, extended to include the country's own slope.
- Unreliable when:
  - the two FDI sources disagree by more than 0.10 log
  - the country slope differs from the global one by more than 0.10 log
  - the residual SD is above 0.30
  - the country is a conduit (CYP, LUX, NLD, IRL, CHE, HKG, SGP and similar), because their FDI is largely Russian round-trip or holding capital
  - there is no FDI series, in which case the entry carries the global trend
- Entries are given for the 43 countries with at least EUR 10 m of 2021 taxes in `companies_all.json`. Others should use `global.company`.

**Caveats:**
- **2015 is the trough after the 2014-2015 ruble crash.** 2015-2021 growth is partly recovery: on 2012-2021, every proxy falls.
- **Direct-investment income moves with the oil price.** It also includes round-trip capital.
- **These are not the companies' own taxes.** Taxes paid by consumer-goods and industrial subsidiaries probably track Russian GDP in EUR (+2.4%) more closely than profits do.

### 3. Shipping income on Russian oil and LNG

**Data.** Russian seaport throughput by cargo from the Association of Commercial Sea Ports (ASOP) annual reports for 2013-2021.
- Each report gives that year's crude, product and LNG volumes plus the change on the year before. The series are chained from those changes, so later revisions and the addition of Crimean ports do not create jumps.
- Crude 2012 comes from the 2013 report.

| Mt | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 |
|---|---|---|---|---|---|---|---|---|---|
| crude | 206.8 | 186.5 | 201.5 | 227.2 | 252.5 | 255.5 | 276.2 | 235.0 | 238.1 |
| products | 123.6 | 141.5 | 146.7 | 141.3 | 142.0 | 145.4 | 150.2 | 142.8 | 146.7 |
| LNG | 11.0 | 12.2 | 12.8 | 13.5 | 14.7 | 23.1 | 32.8 | 32.5 | 32.3 |

**Method.**
- The three series are combined into a volume index, weighted by the 2019-2021 freight pool in `shipping.json`: crude 48%, products 38%, LNG 15%.
- The index is fitted like `trend.json`. No 2014 break was found, so all of 2013-2021 is used.
- Result: **+3.9%/yr** (SE 0.007 log, residual SD 0.05).
- Components: crude +3.3%, products +1.3%, LNG +17.5% (Yamal LNG started in Dec 2017).
- The band, +2.4% to +5.7%, covers:
  - leaving out Kazakh CPC transit crude, which is loaded at Novorossiysk and counted in Russian port crude: +3.4%
  - leaving out the 2020-2021 OPEC+ cut years: +5.7%
  - crude and products only: +2.4%
  - the other windows
- **Multiplier:** 2022 1.07, 2023 1.10, 2024 1.12, 2025 1.14, **2026 1.15 (1.09-1.22)**. Reliable.

This is a volume trend only. Freight rates, voyage lengths and owner-country shares stay at their 2019-2021 values. Pre-war cargoes were mostly short-haul to Europe. Ports also handle transit cargo (Kazakh, Belarusian), which the CPC sensitivity covers only for crude.

## Countries asked about (services)

Each cell shows: g central → **2026 multiplier**, central (low-high). The `ex-COVID` column is the trend alone, relative to a COVID-free base. ✗ = not reliable.

| ISO3 | flow | travel share | g | 2026 multiplier | ex-COVID 2026 | 2021 / 2019-21 | reliable |
|---|---|---|---|---|---|---|---|
| TUR | sold | 52% | −3.8% | **1.11** (0.78-1.64) | 0.87 (0.70-1.09) | 0.94 | yes |
| TUR | bought | 4% | −8.2% | **0.79** (0.68-1.03) | 0.74 (0.68-0.89) | 1.04 | yes |
| ARE | sold | 55% | +11.6% | **2.00** (1.09-2.92) | 1.29 (0.94-1.35) | 0.95 | ✗ |
| ARE | bought | 7% | +8.8% | **1.48** (1.22-1.74) | 1.33 (1.17-1.41) | 0.98 | yes |
| EGY | sold | 75% | (level) | **6.55** (4.86-8.65) | n/a | 2.11 | ✗ |
| EGY | bought | 15% | +6.9% | **1.40** (0.97-2.25) | 1.33 (1.05-1.41) | 1.22 | ✗ |
| CYP | sold | 14% | −0.2% | **1.14** (0.91-1.55) | 1.00 (0.86-1.23) | 0.93 | yes |
| CYP | bought | 4% | +7.5% | **1.41** (1.09-1.72) | 1.28 (1.06-1.41) | 1.03 | ✗ |
| THA | sold | 87% | +10.2% | **3.28** (1.38-5.05) | 1.38 (0.82-1.39) | 0.11 | ✗ |
| THA | bought | 12% | +5.1% | **1.48** (1.15-1.93) | 1.21 (1.02-1.41) | 0.90 | yes |
| GEO | sold | 71% | +7.4% | **3.08** (2.21-4.04) | 1.33 (1.17-1.41) | 0.57 | ✗ |
| GEO | bought | 19% | −0.7% | **1.30** (0.93-1.66) | 1.05 (0.82-1.19) | 0.90 | ✗ |
| DEU | sold | 12% | +1.2% | **1.22** (1.05-1.54) | 1.05 (0.94-1.27) | 0.98 | ✗ |
| DEU | bought | 6% | +0.7% | **1.19** (0.97-1.43) | 1.05 (0.91-1.18) | 0.95 | yes |
| FIN | sold | 47% | +3.2% | **2.05** (0.99-2.73) | 1.20 (0.72-1.35) | 0.62 | ✗ |
| FIN | bought | 12% | −5.2% | **0.96** (0.78-1.29) | 0.82 (0.72-1.00) | 0.89 | ✗ |
| CHN | sold | 10% | +13.4% | **1.45** (1.34-1.59) | 1.32 (1.29-1.35) | 1.01 | yes |
| CHN | bought | 9% | +0.2% | **1.23** (0.97-1.82) | 1.04 (0.86-1.41) | 0.90 | ✗ |

Notes on these:
- **Türkiye:** Russian travel spending fell in real EUR from 2012-2013 to 2019, even though arrivals rose from 3.6 m (2012) to 7.0 m (2019). The ruble halved in 2014-2015, so spending per visitor fell. The 2026 multiplier above 1 comes from the COVID rebound (×1.37 on travel). Turkey's own report is almost flat at USD 2.6-3.8 bn, while the balanced series follows Russia's report. Only the balanced and Russian slopes enter here; Eurostat has too few Turkish years by partner.
- **UAE, Thailand, Georgia:** travel grew fast in the post-2014 regime (+13% to +21%/yr), so the trend part reaches the cap. Most of the multiplier is the COVID rebound. All three have few points and wide bands.
- **Finland:** the travel trend after 2016 is moderate (+7.8%). Its large multiplier comes from 2021 travel being only 7% of trend: the border was closed.
- **China:** services sold to Russia (mostly non-travel) grew +15%/yr. Bought-from-Russia has a 2014 break and disagreeing sources.
- **Germany:** both flows are flat after 2016. Sales to Russia rely on the 4-point post-2014 travel window, so they are unreliable.

## Things to know

- **The COVID rebound is the biggest number in most services multipliers.** It is a statement about how far tourism would have recovered in a world without the war. The UNWTO world pace is a reasonable default, but Russian outbound travel probably recovered faster to destinations that stayed open in 2021 (Türkiye, Egypt, UAE), and those got their own 2021 ratio. Consider showing `multiplier_ex_covid` alongside, or moving the services baseline to 2019.
- **Russians' travel spending abroad rose from USD 11.4 bn (2021) to 49.2 bn (2025).** `uncovered.json` notes that most of this rise is unallocated by country. A pre-war trend plus a COVID rebound explains part of it: Russia's own travel imports were USD 36 bn in 2019. Even so, the counterfactual stays well below the 2025 actual.
- **BaTiS balanced values for countries without their own report are model estimates.** UAE, China and Kazakhstan are examples. Their trends are only as good as BaTiS's Russian-side allocation.
- **Company taxes rest on proxies.** The four proxies agree on the sign for 2015-2021 (all positive) but range from +1% to +9% a year. Use `global.company` unless a country entry is reliable.
- **Shipping** uses volumes only. The post-2022 rise in shipping income is driven by long-haul routes and freight rates, which a pre-war volume trend cannot explain.
- **Back-test.** `trend.json`'s back-test showed that individual damped trends are typically off by about 0.3 log after 4-7 years. The low/high values here cover slope, deflator, window, source and (for travel) recovery-pace uncertainty, not that forecast error.
- **Approximate figures:** the CPC Kazakh transit volumes are approximate apart from 2015 and 2020, but they are used only in the shipping sensitivity. The UNWTO recovery ratios are rounded.
