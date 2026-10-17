# Trade with Russia and Ukraine, 2021-2025 (goods, EUR bn)

Data file: `research/trade.json` (233 economies, ISO3 keys, M49->ISO3 map included).
Built by `scripts/build_trade.py` + `scripts/add_notes.py` from raw downloads in `research/raw/trade/`.

## Sources
- UN Comtrade public preview API, annual HS, cmdCode TOTAL (and HS4 for dual-use), customsCode C00 / motCode 0 / partner2 0, `primaryValue` (imports CIF, exports FOB). Retrieved 2026-10-17.
  - `p643_{M,X}_{year}.json`, `p804_{M,X}_{year}.json`: all reporters vs Russia / Ukraine.
  - `r804_{M,X}_{year}.json`: Ukraine's own report by partner (2021-2024; 2025 empty).
  - `r643_{M,X}_2021.json`: Russia's own 2021 report (mirror fallback for 2021 only).
  - `dualuse/du_{hs4}_{year}.json`: exports to Russia by HS4 heading, all reporters, 2021/2023/2024/2025.
- ECB SDW `EXR.A.USD.EUR.SP00.A` annual average (USD per EUR): 2021 1.18274, 2022 1.05305, 2023 1.08127, 2024 1.08238, 2025 1.12998.
- Eurostat was not needed: Comtrade already carries 2025 for all EU27 members.

## Method
- Reporter's own figure first. Fallback (mirror=true) = partner's report: Russia's 2021 report, Ukraine's 2021-2024 reports.
- Russia publishes no partner detail after 2021, so trade with Russia 2022+ is always what the non-Russian country reports. No fallback exists.
- Certainty "A" for everything (official reported customs data). Missing = null, never estimated.

## Coverage (number of economies with a non-null value)
| indicator | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|
| imports_from_RUS | 201 (38 mirror) | 163 | 156 | 140 | 116 |
| exports_to_RUS | 220 (75 mirror) | 142 | 134 | 126 | 104 |
| imports_from_UKR | 200 (37 mirror) | 195 (34) | 199 (38) | 197 (53) | 121 |
| exports_to_UKR | 216 (72 mirror) | 213 (82) | 215 (91) | 212 (94) | 103 |

## Main gaps
- Non-reporters vs Russia: Belarus (none since 2022), UAE (2024-25), Iran, Vietnam, Mongolia, Tajikistan (2024-25), Uzbekistan (2025), Bangladesh, Turkmenistan, Syria, Cuba, Algeria (2022-23, 2025), many small African states after 2021. Taiwan (code 490) through 2024 only.
- Ukraine's own 2025 report is not in Comtrade yet, so 2025 Ukraine flows exist only where the partner reported.
- 2025 is still incomplete for about 40% of reporters.
- Hong Kong's imports from Russia jump to EUR 11.6bn in 2025. That is the reported figure. Its composition was not checked (it may be precious metals).

## Dual-use (CHP proxy)
HS4 proxy: 8411, 8471, 8473, 8482, 8483, 8486, 8504, 8517, 8525, 8526, 8529, 8532, 8533, 8536, 8537, 8541, 8542, 8548, 8803, 8807, 9013, 9014. HS 8708 is excluded from the total and reported separately. The CHP list is defined at HS6, so this HS4 proxy is an upper bound that includes civilian goods. 112 economies have values. Exports to Russia, EUR bn:

| ISO3 | 2021 | 2023 | 2024 | 2025 | latest_year |
|---|---|---|---|---|---|
| CHN | 9.96 | 11.73 | 11.06 | 9.01 | 2025 |
| HKG | 3.36 | 1.79 | 0.83 | 0.87 | 2025 |
| TUR | 0.07 | 0.41 | 0.20 | 0.11 | 2025 |
| ARE | 0.67 | 2.59 | n/a | n/a | 2023 |
| KAZ | 0.09 | 0.55 | 0.44 | 0.38 | 2025 |
| KGZ | 0.00 | 0.06 | 0.03 | 0.11 | 2025 |
| ARM | 0.01 | 0.60 | 0.65 | 0.79 | 2025 |
| GEO | 0.00 | 0.00 | 0.00 | 0.00 | 2025 |
| UZB | 0.02 | 0.05 | 0.03 | n/a | 2024 |
| IND | 0.41 | 0.34 | 0.83 | 0.43 | 2025 |
| MYS | 0.13 | 0.15 | 0.36 | 0.03 | 2025 |
| THA | 0.04 | 0.18 | 0.20 | 0.16 | 2025 |
| SRB | 0.02 | 0.03 | 0.01 | 0.01 | 2025 |
| DEU | 1.65 | 0.06 | 0.01 | 0.01 | 2025 |
| USA | 0.47 | 0.03 | 0.01 | 0.01 | 2025 |


## Largest importers from Russia (2024), EUR bn
| ISO3 | imp RUS 2021 | imp RUS 2024 | imp RUS 2025 | exp RUS 2021 | exp RUS 2024 | exp RUS 2025 |
|---|---|---|---|---|---|---|
| CHN | 67.30 | 120.00 | 109.74 | 56.81 | 106.50 | 91.56 |
| IND | 7.35 | 62.04 | 55.63 | 2.82 | 4.47 | 3.98 |
| TUR | 24.48 | 40.67 | 37.50 | 4.88 | 7.91 | 5.95 |
| KAZ | 14.89 | 16.86 | 17.29 | 5.93 | 8.82 | 7.30 |
| BRA | 5.27 | 11.28 | 9.10 | 1.34 | 1.34 | 1.35 |
| ARM | 1.51 | 8.54 | 4.16 | 0.67 | 2.90 | 2.58 |
| UZB | 4.52 | 7.12 | n/a | 1.44 | 2.76 | n/a |
| KOR | 14.67 | 6.35 | 6.10 | 8.44 | 4.18 | 3.58 |
| HKG | 1.18 | 5.94 | 11.61 | 4.20 | 1.38 | 1.46 |
| EGY | 3.03 | 5.55 | 4.60 | 0.41 | 0.56 | 0.72 |
| JPN | 11.93 | 5.25 | 4.89 | 6.64 | 2.00 | 2.17 |
| HUN | 3.61 | 5.07 | 4.69 | 1.75 | 0.90 | 0.82 |
| SVK | 5.57 | 4.36 | 3.74 | 1.34 | 0.22 | 0.20 |
| TWN | 4.24 | 4.21 | n/a | 1.12 | 0.55 | n/a |
| FRA | 10.48 | 4.11 | 4.04 | 6.46 | 2.04 | 1.89 |
