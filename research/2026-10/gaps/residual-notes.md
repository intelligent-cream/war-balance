# Residual gaps: missing GDP and population, the shortfall in exports to Russia, Hong Kong, territories

Data file: `research/2026-10/gaps/residual.json`. Retrieved 2026-10-17.
Scripts: `working/scripts-gdp2/` (`hubs2.py`, `gap.py`, `hk.py`, `build_residual.py`, `snaama_gdp.py`, `fb.py`).
Raw downloads: `working/raw/gdp2/` (UNSD AMA xlsx, UN WPP 2024 csv, World Bank and IMF API, CIA Factbook JSON, Comtrade previews).
All values have low/central/high bounds, roughly a 90% range.

## 1. Population and GDP (2024; EUR bn at 1.08238 USD/EUR)

This covers the 31 `data.json` entries that have no `gdp`. Reading the table:
- Population is in thousands; GDP is in EUR bn.
- The ranges reflect how far apart the sources are.

| ISO3 | pop k (low-high) | GDP EUR bn (low-high) | basis |
|---|---|---|---|
| CUB | 9,900 (8,620-10,980) | 21.1 (9.4-47.1) | See the Cuba note below |
| SYR | 24,670 (22,500-25,500) | 19.8 (15.2-24.0) | World Bank USD 21.4bn; UNSD 17.3 |
| ERI | 3,540 (3,300-6,420) | 2.08 (1.66-2.68) | UNSD 1.92 and Factbook 2.54 USD bn; no census |
| GIB | 38.2 (32.7-39.3) | 3.59 (3.37-4.02) | HMGoG FY23/24 GBP 2.90bn, FY24/25 3.09bn |
| GUM | 160 (154-170) | 6.93 (6.47-7.48) | BEA 2022 USD 6.91bn, extrapolated (BEA paused the series) |
| ASM | 47 (43-50) | 0.86 (0.79-0.94) | BEA 2022 USD 0.87bn, extrapolated |
| MNP | 45 (43-51) | 1.02 (0.88-1.15) | BEA 2022 USD 1.10bn, flat |
| VGB | 39.5 (35.6-41.5) | 1.69 (1.52-1.86) | UNSD 2024 |
| AIA | 15.8 (14.6-19.4) | 0.42 (0.38-0.44) | UNSD 2024, Factbook |
| MSR | 4.5 (4.4-5.5) | 0.077 (0.070-0.083) | UNSD 2024, Factbook |
| COK | 14.0 (12.5-15.0) | 0.38 (0.35-0.41) | UNSD 2024, Factbook |
| NIU | 1.7 (1.6-1.85) | 0.025 (0.022-0.027) | Statistics Niue FY2023 NZ$42.2m |
| SPM | 5.8 (5.0-6.0) | 0.28 (0.24-0.32) | IEDOM 2015 EUR 240m, rolled forward |
| ESH | 590 (550-660) | 4.55 (3.6-5.6) | HCP regional GDP per head of the two southern regions x population |
| FLK | 3.5 (3.3-3.7) | 0.34 (0.21-0.37) | FIG national accounts 2024 (about GBP 288m) |
| SHN | 5.3 (4.9-5.6) | 0.057 (0.050-0.071) | SHG GBP 40.4m, plus Ascension and Tristan |
| BES | 31.7 (30.0-32.5) | 0.85 (0.80-0.91) | CBS 2023 USD 871m, +5.6% |
| BLM | 11.0 (10.5-11.3) | 1.01 (0.90-1.12) | IEDOM GDP per head EUR 90.1k (2023) |
| WLF | 11.3 (11.0-11.6) | 0.21 (0.19-0.24) | IEOM 2019 EUR 189m |
| TKL | 2.5 (2.4-2.6) | 0.014 (0.011-0.018) | Factbook 2017 USD 12.7m, rolled forward |
| NFK | 2.2 (1.7-2.3) | 0.093 (0.085-0.101) | NIRC FY2023 GTP A$146.7m |
| CXR | 1.7 (1.5-1.9) | 0.067 (0.043-0.098) | Old A$71m; Norfolk's GTP per head as the central |
| CCK | 0.6 | 0.021 (0.015-0.030) | A$40-85k per head x 593 residents |
| PCN | 0.04 | 0.0035 (0.001-0.005) | Order of magnitude (public spending) |
| VAT | 0.5 (0.45-0.8) | 0.5 (0.25-1.3) | Proxy: value added in Vatican City / Holy See budget |
| ATA, BVT, UMI | 0 | 0 | No permanent population; % of GDP undefined |
| ATF, SGS, IOT | 0 | 0.03, 0.008, 0.004 | Fishing licences and administration (order of magnitude) |

**Cuba.** GDP in pesos is about CUP 1.22 trillion in 2024. This is derived from the official fiscal deficit of CUP 79.5bn, which is 6.5% of GDP.
- UNSD, the World Bank and the Factbook (USD 250-260bn) convert at 1 CUP = 1 USD, so their figures are meaningless here.
- At the official rate of 24 CUP/USD, GDP is USD 51bn. This is the high.
- At the 120 rate GDP is USD 10.2bn. This is the low; CEPAL's USD 12.1bn for 2025 matches this conversion.
- At the informal rate of about 320, GDP would be under USD 4bn. That is implausible, given goods imports of about USD 5-6.5bn (partner-reported exports to Cuba were USD 4.05bn in 2024, not counting Venezuela and Russia).
- The central is the geometric mean of the 24 and 120 conversions: USD 22.8bn, or EUR 21.1bn.
- Population: ONEI's 9.75m at end-2024 is the official figure. 10.98m in WPP and the World Bank ignores emigration since 2021. An independent estimate of 8.62m is the low.

**Population data in `data.json` that this changes.** The existing `pop` values (World Bank / WPP) differ from these for:
- CUB: 10.98m against 9.90m
- ERI: wide range
- GIB: 39.3k against 38.2k
- GUM: 167.8k against 160k

## 2. Exports to Russia: the undercount (EUR bn)

**Size of the gap.** Russia's FCS imports minus the sum of partner-reported exports in `trade_full.json`, in USD bn:

| | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| Gap | 30.2 | 40.3 | 43.8 | 52.1 |
| Partner/FCS ratio | 0.882 | 0.859 | 0.845 | 0.813 |

Before the war the ratio was 0.908-0.935 (2019-2021). The CIF/FOB difference plus about 3% of structural gap is therefore normal. The war-specific excess is about USD 10, 17, 21 and 30bn in 2022-2025.

**Where the gap comes from.** These are the components in `by_year`, as Monte Carlo medians in EUR bn:

| component | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| total | 28.7 (18-39) | 37.3 (25-49) | 40.5 (28-53) | 46.1 (35-57) |
| CIF/FOB (not allocated) | 13.3 | 14.5 | 14.3 | 13.6 |
| unrecorded transit via Kyrgyzstan | 3.2 | 5.8 | 6.7 | 8.6 |
| unrecorded transit via Kazakhstan | 0.6 | 1.1 | 4.2 | 2.9 |
| residual (pro rata) | 11.3 | 15.7 | 14.9 | 20.7 |

**Kyrgyzstan.** Partners report exports to KGZ (excluding Russia) of USD 10.2bn in 2021, 20.0bn in 2022, 28.1bn in 2023, 29.5bn in 2024 and about 33.7bn in 2025.
- KGZ's own reported imports (excluding Russia) were only 3.7, 7.4, 10.2, 9.6 and 9.4.
- The mirror gap therefore grew by USD 6.2, 11.4, 13.4 and 17.9bn over 2021.
- China is 61-65% of the increase. Korea (cars) is 6-14%; Georgia (used cars), Kazakhstan, Turkey and Germany are 2-6% each.
- KGZ's recorded exports to Russia stayed at USD 0.5-1.1bn, so these goods leave KGZ unrecorded. Part goes to Russia (assumed 30-80%), and the rest to Kazakhstan, Uzbekistan or unrecorded domestic use.

**Kazakhstan.** The mirror gap over its 2019 level is USD 2.4, 9.3 and 6.7bn in 2023-2025. China is 26-56% of the increase in partner exports. The share reaching Russia is taken as 25-75%.

**Other hubs.** Armenia, Georgia, Uzbekistan and Azerbaijan show no growing mirror gap. Armenia records its re-exports, which are already in `trade_full`. Tajikistan's gap (+USD 2.6bn) is mostly a destination, not transit. The UAE does not report. Russian officials put Russia-UAE turnover at about USD 10-11.5bn in 2024, which fits UAE exports to Russia of USD 3-4.5bn. That is close to `trade_full`, so the UAE adds little.

**China customs against the FCS.** Russia publishes no partner breakdown, so this comparison is impossible. China's own exports to Russia (USD 76, 111, 115 and 103bn) are fully in the partner sum. China's share of the gap comes through the hubs (as origin), plus its pro-rata share of the residual: under-invoicing, goods declared to third countries, and "cargo" schemes.

**Belarus and the EAEU.** The FCS total includes EAEU mutual trade. Belarus is in the partner sum through its official turnover, split 50-58% to exports. That split is uncertain, so Belarus receives its pro-rata share of the residual: EUR 1.7-3.2bn central.

**Parallel imports.** Russia books imports by country of origin, but the money goes to whoever sold the goods. Most parallel-import goods are recorded as partners' exports to the hubs or to Turkey or the UAE, and those are already counted. They add to the gap only when the hub leaves the re-export unrecorded, which is components 2-3.

**Allocation per country (`countries`).** The values are additions to `exports_to_RUS`. EUR bn, central:

| ISO3 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|
| CHN | 7.6 | 12.7 | 15.0 | 17.8 |
| BLR | 1.7 | 2.0 | 2.1 | 3.2 |
| KAZ | 0.7 | 1.0 | 1.5 | 1.6 |
| TUR | 0.7 | 1.1 | 1.2 | 1.1 |
| KGZ (hub margin) | 0.45 | 0.74 | 0.86 | 1.06 |
| KOR | 0.2 | 0.5 | 0.8 | 1.4 |

- Roughly 130 other countries receive smaller amounts.
- For China in 2025 the range is 11.5-24.1.
- Ranges are per country. The lows and highs do not add up to the range of the total.

**Caveats.**
- The FCS aggregates come from press reports. For 2022, USD 255.3bn is used; USD 259bn has also been cited.
- Kazakhstan's 2021-2022 import data in Comtrade are incomplete.
- Partners' 2025 Comtrade data are partial, and missing reporters were carried at their 2024 levels.
- The residual allocation rule (pro rata, with coalition countries weighted 0.25) is an assumption and is not observed.
- An alternative view that assigns transit to the hub country would move about EUR 4-11bn a year from CHN, KOR and others to KGZ and KAZ.

## 3. Hong Kong imports from Russia

**Composition.** By HS chapter, EUR bn:

| | 2021 | 2022 | 2023 | 2024 | 2025 | Jan-Jul 2026 |
|---|---|---|---|---|---|---|
| total | 1.19 | 1.87 | 7.64 | 5.94 | 11.61 | 15.0 |
| HS 71 share | 63% | 85% | 99% | 98% | 99% | 99.6% |
| gold 7108 | 0.07 | 0.55 | 4.82 | 4.29 | 9.25 | 14.0 |
| PGM 7110 | 0.63 | 0.96 | 2.12 | 0.75 | 1.29 | 0.22 |
| diamonds 7102 | 0.04 | 0.05 | 0.43 | 0.74 | 0.70 | 0.55 |

- Gold tonnage: 82 t in 2023, 58 t in 2024, 92 t in 2025 and 113 t in Jan-Jul 2026.
- The implied price in 2025 is USD 114/g, consistent with bullion.
- This is almost entirely precious metals and stones. The rise is gold.

**Transit to mainland China.** This is likely for the majority, but it is inferred, not observed.

| | 2023 | 2024 | 2025 | Jan-Jul 2026 |
|---|---|---|---|---|
| Russia's share of HK gold imports | 9% | 7% | 10% | 15% |
| Mainland share of HK gold exports | 83% | 60% | 58% | 83% |

- HK's gold imports exceeded its exports by USD 21bn in 2025, which went into vault stocks.
- Applying HK's average routing gives an onward share to the mainland of about 0.45-0.66. The JSON uses 0.55 (0.3-0.85).
- China's own customs show only USD 0.3-3.3bn of gold imported directly from Russia.

**Recommendation.** Keep the value as Hong Kong's (Hong Kong buyers pay Russia). Flag it as gold that is probably re-exported to China, and do not add it to China's figure as well.

## 4. Territories included in other countries' statistics

| ISO3 | Covered by | Evidence |
|---|---|---|
| LIE | CHE | BAZG: Liechtenstein is in the Swiss customs territory and trade statistics (1923 customs treaty) |
| MCO | FRA | IMSEE: French customs statistical territory includes Monaco (1963 customs union; EU customs territory) |
| IMN | GBR | HMRC: UK statistical territory = customs territory, including the Isle of Man (1979 Customs and Excise Agreement) |
| PRI | USA | US Census Guide sec. 2: customs territory = 50 states + DC + Puerto Rico |
| VIR | USA | US Census Guide sec. 2: statistics also cover the US Virgin Islands |
| MAF | FRA | EU outermost region and part of France, with no own trade statistics since 2008 (weaker evidence) |

**Comtrade check (2023).** No reporter records exports to partner codes 438, 492, 833, 630, 850 or 663. Neither Russia (2021) nor Ukraine (2023) records trade with them either. Saint-Barthélemy (652) does appear separately: France exported USD 213m to it. So BLM must stay its own entry, because it has been an OCT since 2012.

**Aid.** The Kiel tracker covers 41 donor governments and leaves out Liechtenstein, Monaco and the Isle of Man. Their small humanitarian aid (millions) is not inside the CHE, FRA or GBR figures, so treat it as uncovered.
- PRI, VIR and MAF have no foreign-aid budget of their own; US federal and French state aid covers them.
- `build_data.py` already maps these six through `INCLUDED_IN`.
