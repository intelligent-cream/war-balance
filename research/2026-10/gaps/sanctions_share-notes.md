# How much of each country's cut in Russian trade did sanctions require?

File: `sanctions_share.json`. Gathered 2026-10-18. Not yet reviewed by a person.

The map credits countries for cutting trade with Russia. Part of each cut was required by bans and part was the country's own choice. This file estimates the required part (`mandated_share`) for each country, flow and year. Own choice is `1 - mandated_share`.

**Coverage:** 42 economies plus Liechtenstein:
- the EU27;
- countries that apply the EU's measures: Switzerland, Liechtenstein, Norway, Iceland, Montenegro, Albania, North Macedonia, Bosnia and Herzegovina, Moldova;
- countries with their own regimes: the UK, the US, Japan, Canada, Australia, New Zealand and Korea.

**Years:** 2022–2026. 2026 means January–August.

**Scripts:** This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes. The ban rules were read from the annexes of Regulation 833/2014 and applied to Comext and Comtrade trade data.

## Fields

Each flow has one entry per year. The flows are:
- `to_rus`: goods bought from Russia. On the map this is "less paid to Russia".
- `from_rus`: goods sold to Russia ("sales to Russia given up").
- `svc_bought` and `svc_sold`: services.

Each year entry has these fields:

| field | meaning |
|---|---|
| `mandated_share` {low, central, high} | Required (mandated) fall ÷ total fall, both measured at pre-war prices from customs data. Capped at 1. `null` when there was no fall. |
| `mandated_eurbn` | The required fall, in EUR bn at pre-war prices. |
| `fall_eurbn` | The total fall against the pre-war level in the same data. |
| `mandated_share_map` | `mandated_eurbn` ÷ the map's own fall, taken from `site/data.json` as built on 2026-10-18. That build includes the transit-gas, re-export and trend adjustments. **Use this one to split the map's numbers.** You can also recompute it as min(`mandated_eurbn`, map fall) ÷ map fall after any rebuild. |
| `gas_part` (`to_rus` only) | Share of the import fall that is natural gas. See "Own choice is not always a choice" below. |
| `travel_part` (services) | Share of the services fall that is travel. |
| `flag` | Marks capped shares and years with no fall. |

The `bans` list gives:
- every EU annex addition, by package, with its CN codes;
- the special provisions (exemptions, quotas, wind-downs);
- the national bans of the US, UK, Japan, Canada, Australia and New Zealand;
- the services, flight and tourism bans.

## Method: goods

**1. Bans from the legal text.** I downloaded 19 consolidated versions of Regulation (EU) 833/2014 from EUR-Lex, dated 2022-02-28 to 2026-07-24. The last one includes the 20th package (Regulation 2026/506, 23 April 2026) and the 21st (2026/1848, 23 July 2026).

From each version I parsed the CN codes in these annexes:
- import bans: Annexes XVII, XXI, XXII, XXV, XXVI, XXVII and XXXVIII-A;
- export bans: Annexes X, XI, XVI, XVIII, XX, XXIII (and XXIII-A to H), XXXV, XXXVII and XL.

Each code gets the date of the first version in which it appears, which tells me which package added it. Codes like "xxxx 00 00" are read as whole headings. Large items were then set by hand from the articles:

- **Coal:** new contracts banned from 9 April 2022; all imports from 10 August 2022.
- **Seaborne crude:** banned from 5 December 2022. **Oil products:** from 5 February 2023.
- **Pipeline crude exemption (Art. 3m(3)(d)):**
  - Germany and Poland until 23 June 2023, the date of the 11th package. Pipeline share of their Russian crude: Germany 60–80%, Poland 70–90% (assumed).
  - Czechia until 1 July 2025.
  - Hungary and Slovakia are still exempt.
- **Bulgaria:** derogation for seaborne crude and products until 31 December 2024. Bulgaria's own law stopped crude from 1 March 2024, so its 2024 cut is counted as own choice. The task brief said the derogation ended in 2023; the legal text says end-2024.
- **Croatia:** vacuum gas oil allowed until end-2025.
- **Gold:** banned from 22 July 2022. **Diamonds:** from 1 January 2024.
- **LPG and ferro-alloys:** existing contracts could run until 20 December 2024.
- **Platinum group metals:** only "ex 7110" counts (platinum, rhodium, iridium); palladium is not banned. From 25 July 2026.
- **Copper cathodes:** from 25 January 2027.
- **Quotas:** turned into a covered share against pre-war EU tonnage:

| goods | quota (EU-wide) |
|---|---|
| potash | 837,570 t/year |
| NPK fertilisers | 1,577,807 t/year |
| steel slabs | 3.75 Mt/year, falling to 2028 |
| billets | until March 2024 |
| 7224 90 | quota |
| carbon black and synthetic rubber | until June 2024 |
| pig iron and DRI | 2024–2025 |
| primary aluminium | 275,000 t, then 50,000 t, until end-2026 |
| ammonia | 688,000 t/year from April 2026 |

  The fertiliser quotas are about the size of pre-war imports, so they bind little.
- **LNG (Art. 3ra, 19th package):** short-term contracts banned from 25 April 2026, long-term contracts from 1 January 2027. In 2026, 5–25% of Russian LNG is assumed to be under short-term contracts. LNG volumes mostly stayed at or above the pre-war level, so this adds almost nothing.
- **Export bans of February–March 2022:** the dual-use and advanced-technology lists are control lists, not CN codes. I used a proxy: electronics, computers, telecoms, sensors, machine tools, aircraft and vessel headings, at 40–90% coverage. The later Annex XXIII listings of the same headings replace the proxy.
- **Luxury goods (Annex XVIII):** these have price thresholds, so they count at 30–70% coverage. Other partial ("ex") codes count at 70–100%.

**2. Timing.** A ban counts for the part of the year it was in force:
- low: from the end of the wind-down;
- central: midway between adoption and full application, because new contracts were banned at once;
- high: from adoption.

For crude and products, spot deals were allowed until the cut-off date. So their central date is three quarters of the way through the wind-down, and their high date is the midpoint.

**3. Trade data.**
- **EU members:** Eurostat Comext DS-045409 at CN8, imports and exports with Russia. Values and quantities annually for 2018–2025, plus monthly January–August 2026.
- **Other countries:** UN Comtrade at HS4 for 2018–2025. Their 2026 is 2025 scaled by the ratio of January–August 2026 to 2025 in `trade_full.json`. Comtrade values are converted to euros at ECB annual rates; 2018 uses 1.1810.

**4. Volumes at pre-war prices.** Each product's volume is quantity × its 2018–2021 unit value. Where quantities are missing or implausible, values are divided by the price change of the country's matched products in the same chapter.

Some trade is confidential: the total minus the CN8 sum. For Germany, Austria, Finland and Denmark this is pipeline gas, deflated with the gas price index in `gas_prices.json`.

**5. Required part, product by product.**

required = min(fall of that product, pre-war value × share of the year the ban was in force × share of the product the ban covers)

The total fall is summed over all products, gas included, and can be offset by products that grew. Per product, the fall of banned goods beyond what the ban covered, or before it applied, counts as own choice.

**6. Countries outside the EU.**
- **EU-aligned countries:** the EU coverage of each heading, weighted by EU trade, with these delays and implementation factors:

| country | delay | implementation factor |
|---|---|---|
| Switzerland, Liechtenstein | 14 days | 0.95–1 |
| Norway, Iceland | 30 days | 0.9–1 |
| Montenegro, Albania, North Macedonia | 60 days | 0.4–1 |
| Bosnia and Herzegovina | 90 days | 0–0.5 (Republika Srpska blocks implementation) |
| Moldova | 180 days | 0.05–0.5 |

- **US, UK, Japan, Canada, Australia, New Zealand:** their own import bans, listed in `bans`:
  - US: energy, seafood and alcohol, diamonds, gold; aluminium, copper and nickel from April 2024; uranium with waivers.
  - UK: steel, coal, oil, LNG, gold, revenue-generating goods, diamonds, metals.
  - Japan: alcohol, wood, part of machinery, gold, diamonds.
  - Canada: oil, gold, steel and aluminium, diamonds.
  - Australia: oil, gas and coal, gold.
  - New Zealand: oil and gold (uncertain).
- **Korea:** has no import bans, so its import share is 0.
- **Export bans outside the EU:** the EU coverage profile times a country factor:
  - UK 0.85–1.1, US 0.9–1.2, Japan 0.8–1.05, Korea 0.25–0.65;
  - plus national items: the US industry-sector rules for chapters 84, 85, 88 and 90; Japan's ban on cars over 1,900 cc (August 2023); Australia's alumina and bauxite ban.

**Cross-check against Commission figures.** These figures are from Commission statements in 2023 as I remember them; I did not re-fetch them.

| | Commission | this file |
|---|---|---|
| import bans | about EUR 91bn of 2021 EU imports | EUR 98bn by June 2023 (60% of 2021 imports, including exempt pipeline crude), EUR 110bn by July 2026 |
| export bans | about EUR 44bn (49%) of 2021 exports by February 2023 | EUR 35bn central (31–40bn), 40%; 54bn (61%) by July 2026 |

So the export side may be about 10% too low in 2022–2023.

## Method: services

Source: Eurostat `bop_its6_det`, partner RU, by service type, 2018–2025. Missing types are filled with the EU27 mix.

The base is the 2018–2019 average, because 2020–2021 travel was hit by COVID. Yearly totals are the map's own series from `uncovered.json`, divided by the services price level.

Each type has an assumed covered share (low/central/high), applied from 2022 at 60% of a year for flight, road and port bans. Business-services bans count 25% in 2022 and 85% in 2023.

| type | sold to Russia (central) | bought from Russia (central) |
|---|---|---|
| travel | 0.40: EU airspace closed to Russian airlines, plus Russia's retaliatory ban on EU airlines. Finland, Estonia, Latvia, Lithuania and Poland: 0.15, rising to 0.2 after the 2023 entry ban on Russian-plated cars. In these five, visitors came overland and the national entry bans and border closures were own choice. | 0.45. 0.50 in 2026, with the EU ban on tourism services in Russia (19th package, from 1 January 2026). |
| transport | 0.50 | 0.75 (EU bans on Russian airlines, trucks and Russian-flagged ships) |
| other business services (Art. 5n: accounting, consulting, PR, legal, architecture, engineering, IT consultancy, advertising, market research) | 0.65 | 0.10 |
| telecom and computer | 0.35 (0.50 from 2025, with the enterprise-software bans) | 0.10 |
| financial | 0.50 | 0.50 |
| insurance | 0.40 | 0.30 |
| maintenance | 0.60 | 0.30 |
| construction | 0.25–0.40 | 0.20 |
| intellectual property | 0.05–0.15 | 0.05 |

Countries without the type breakdown use the EU27 mix and a factor on coverage:

| country | factor |
|---|---|
| UK | 1.0 |
| US | 0.9 |
| Canada | 0.85 |
| Japan | 0.8 |
| Australia | 0.7 |
| New Zealand | 0.6 |
| Korea | 0.1 |
| Western Balkans | 0.6 |
| Bosnia and Herzegovina | 0.15 |
| Moldova | 0.3 |

Russia's retaliatory flight ban is counted as required, as the task asks. It is not an EU obligation, so treat it as a separate category if you need one.

## Results (central `mandated_share`; 2023 and 2025)

| | goods bought 2023 / 2025 | goods sold 2023 / 2025 | services bought 2025 | services sold 2025 |
|---|---|---|---|---|
| DEU | 0.47 / 0.61 | 0.53 / 0.73 | 0.40 | 0.50 |
| HUN | 0.45 / 0.60 (2026: 0.26) | 0.53 / 0.68 | 0.25 | 0.62 |
| SVK | 0.30 / 0.29 | 0.56 / 0.76 | 0.51 | 0.50 |
| POL | 0.60 / 0.83 | 0.56 / 0.67 | 0.59 | 0.40 |
| ITA | 0.44 / 0.45 | 0.62 / 0.80 | 0.54 | 0.58 |
| NLD | 0.90 / 0.86 | 0.43 / 0.71 | 0.23 | 0.63 |
| FIN | 0.77 / 0.78 | 0.58 / 0.76 | 0.69 | 0.36 |
| LTU | 0.83 / 0.81 | 0.53 / 0.59 | 0.71 | 0.47 |
| FRA | 1.00 / 1.00 (capped) | 0.66 / 0.79 | 0.52 | 0.54 |
| AUT | 0.41 / 0.16 | 0.47 / 0.65 | 0.61 | 0.59 |
| GBR | 0.85 / 0.85 | 0.53 / 0.72 | 0.37 | 0.60 |
| USA | 0.75 / 0.75 | 0.49 / 0.59 | 0.45 | 0.58 |
| JPN | 0.04 / 0.03 (high 0.34) | 0.68 / 0.88 | 0.37 | 0.74 |

Readings:
- **2022 is low for everyone.** Most bans began late in the year, so cuts in 2022 were mostly own choice. Examples: Germany's goods bought 0.16, Finland 0.33.
- **Germany:** the crude and products bans explain about EUR 13bn a year of a EUR 26bn fall. Almost all of the rest is gas (about a third of the fall) and unbanned goods.
- **Hungary and Slovakia:** pipeline crude is exempt, so their required share of purchases is low. Hungary: 0.45–0.76 in 2023–2025 but 0.26 in 2026. Slovakia: about 0.3. Their required cuts are mostly coal, oil products, synthetic rubber and carbon black. Their gas purchases barely fell.
- **Japan:** has no legal ban on Russian crude or coal; its oil and coal phase-out is a G7 political commitment. So almost all of its cut in purchases is own choice. The high case counts the price cap.
- **Korea:** cut purchases by EUR 31bn over 2022–2026 with no import bans.
- **France, Belgium, Spain, Greece and Croatia:** banned goods fell by more than the total, because LNG and other purchases from Russia grew. Their whole net cut is therefore labelled required (capped at 1).

**Most own choice beyond the bans.** 2022–2026 total, all four flows, EUR bn at pre-war prices, customs basis:

| country | own choice | total fall | own share |
|---|---|---|---|
| Germany | 90 | 209 | 43% |
| Korea | 39 | 46 | 85% |
| US | 38 | 112 | 34% |
| Italy | 36 | 74 | 49% |
| Japan | 34 | 48 | 72% |
| Poland | 26 | 79 | 33% |
| Netherlands | 26 | 103 | 25% |
| UK | 22 | 88 | 25% |
| Finland | 15 | 47 | 32% |
| Lithuania | 13 | 35 | 37% |

The highest own shares, among countries with a fall above EUR 3bn, are Korea, Japan, Canada (56%), Austria (55%), Norway (52%), Slovakia and Hungary (51%), and Italy (49%).

## Own choice is not always a choice

Gas was not sanctioned before April 2026. The LNG ban, and the separate regulation phasing out Russian gas adopted in January 2026, start to bite only in 2027. So gas cuts fall under "own choice". Much of that gas was not chosen:
- Gazprom cut supplies to Poland and Bulgaria (April 2022), Finland (May 2022), the Netherlands and Denmark (May–June 2022) and Germany (Nord Stream, from June and fully from 31 August 2022), and to Austria's OMV (November 2024).
- Ukraine ended gas transit on 1 January 2025, which hit Slovakia, Austria and Italy.

`gas_part` shows how much of each import fall is gas. Examples:
- Germany: about 0.31 in 2023–2026;
- Italy: about 0.5;
- Austria: 0.77 in 2025–2026;
- Hungary: about 0.5.

For Poland, gas is recorded under other customs headings (see `audit.json`), so its `gas_part` is understated.

If the map wants a third label ("cut by Russia or by transit"), the gas part is the place to start.

Pre-ban stockpiling and anticipation are counted as own choice. These include buyers that stopped Russian crude in 2022 before the ban, and Germany's and Poland's halt of pipeline crude before June 2023.

## Weakest assumptions

1. **Pipeline share of German and Polish crude** (60–80% and 70–90%). Comext has no transport mode. This drives Germany's and Poland's 2023 share.
2. **Services coverage factors** are judgement, not data. Ranges are ±0.2 per type. The airspace effect on Russians' travel to the EU is the biggest single guess.
3. **Export bans of 2022.** The dual-use proxy and the luxury price thresholds make the export side about 10% lower than the Commission's own coverage figure.
4. **Countries outside the EU** are matched only at HS4. Their export coverage borrows the EU profile with a factor. New Zealand's and the Western Balkans' bans are uncertain. Bosnia and Moldova barely implement the bans.
5. **Gas and confidential trade.** Gas deflated with a price index can turn a small fall negative (Hungary, Austria in 2022). Confidential trade in the Netherlands is treated as non-gas.
6. **2026 outside the EU** repeats the 2025 product mix.
7. **Australia's** alumina exports to Russia seem to be missing or confidential in Comtrade, so its export share is uncertain.
8. **Liechtenstein** copies Switzerland. **Swiss** Comtrade data show rising purchases in 2022–2023 (gold), hence no share for those years.
9. **Capping at 1** hides the case where a country increased unbanned purchases. Use `mandated_eurbn` together with the map's fall when that matters.
