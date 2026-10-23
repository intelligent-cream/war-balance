# Tajikistan: the share of remittances sent from Russia (round 39)

Data file: `remit_split_r39.json` (same folder). Generated 2026-10-23.

## What it replaces

The TJK `remittance_russia_share` proposal in `assumptions_r11_people.json`. `apply_assumptions_r11_people()` in `build_data.py` applies it to `remittances.json`.

It has the same item, the same shape and the same `old` (the 0.80 / 0.88 / 0.93 basis of `remittances.json`), so it can be swapped in directly. The pipeline scales TJK labour, the total from Russia and the expected level by new ÷ old.

| | low | central | high |
|---|---|---|---|
| remittances.json basis | 0.80 | 0.88 | 0.93 |
| round 11 (applied now) | 0.80 | 0.88 | 0.97 |
| **round 39** | **0.82** | **0.90** | **0.97** |

## Evidence

**1. The sending side, Bank of Russia, 2019–2021.** These are its last country tables. The [cross-border transfers page](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/) was updated on 7 Nov 2024 but has no country tables after 2021. The 2022 file has totals only.

| USD m | 2019 | 2020 | 2021 | pooled |
|---|---|---|---|---|
| Transfers from Russia to Tajikistan (CBR, file 33-rem) | 2,576 | 1,741 | 1,800 | 6,117 |
| Tajikistan, personal remittances (WDI) | 2,322 | 2,187 | 2,922 | 7,431 |
| ratio | 1.11 | 0.80 | 0.62 | **0.82** |

- Recomputed with the current WDI vintage, the pooled ratio is 0.82, not the 0.88 that round 11 reported. Single years range from 0.62 to 1.11.
- The CBR figures count only bank and money-transfer-system flows. Cash carried home and compensation of employees are missing, so 0.82 is a **floor** for Russia's share of the WDI total.
- **Check on Uzbekistan:** the CBR's 2021 outflow to Uzbekistan (USD 5.53bn) matches the Central Bank of Uzbekistan's "from Russia" figure (about 5.4bn, `remittances.json`). The CBR tables therefore do capture the transfer channel.

**2. Where Tajik migrants work.** The Ministry of Labour, Migration and Employment, via the [IOM DTM situation report for July–December 2024](https://dtm.iom.int/sites/g/files/tmzbdl1461/files/reports/TAJ_Migration%20Situation%20Report_ENG_0.pdf), reports:
- 604,259 of 618,097 labour migrants abroad (98%) were in Russia in September 2024, and 1% in Kazakhstan;
- transfers from Kazakhstan to Tajikistan were only USD 14.9m in 2024 (National Bank of Kazakhstan), about 0.3% of the total;
- the UN DESA stock of Tajik-born people abroad (including long-term emigrants) is 81% in Russia.

**3. No split since the war.** The National Bank of Tajikistan publishes no split by country, and IOM records that its 2024 data were unavailable. The Bank of Russia stopped country splits after 2021. The KNOMAD 2021 bilateral matrix (on knomad.org and in archive.org copies) could not be downloaded from here: the egress was blocked. That matrix is in any case modelled from migrant stocks, not observed.

**Reasoning.** The bank channel alone gives 0.82, and labour migration is 98% in Russia. The central is set at 0.90, with a range of 0.82–0.97. The high end stays at round 11's 0.97.

## Effect

| EUR bn, TJK, 2022–Aug 2026 | now (round 11) | round 39 |
|---|---|---|
| labour remittances from Russia (central) | 20.92 | 21.40 |
| change against the no-war level (central) | 9.36 | 9.58 (+0.21) |

The map counts this through the round 13 migrant-gain rule (`remittances_r13`), which scales with labour. Tajikistan's figure moves by about +2%. Before that rule the change is +0.21bn, or 1.6 points of its 2024 GDP (EUR 13.3bn) toward Russia; after the rule the shift is smaller. Certainty goes from **D to C**.

## Other Central Asian countries

No change is needed:
- Uzbekistan (Central Bank), Kyrgyzstan (National Bank) and Kazakhstan (National Bank) already publish official splits by country.
- Turkmenistan has no data.
