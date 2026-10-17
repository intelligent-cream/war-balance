# Re-exports through transit hubs (to and from Russia)

Data file: `research/2026-10/gaps/reexports.json`. Retrieved 2026-10-17. Unit: EUR bn, current prices, ECB annual average USD/EUR rates. Ranges are roughly 90%.
Scripts: `working/scripts-reexport/` (`ct.py` fetcher, `f2.py` to `f4.py` downloads, `analyze.py` model, `build.py` assembly, `finalize.py` metadata and output).
Raw downloads: `working/raw/reexport/` (about 330 UN Comtrade preview files, Comtrade partner reference).

## What the numbers mean

- **reexports_to_RUS** is the part of a hub's *recorded* exports to Russia (already inside `trade_full.json` exports_to_RUS) that was made somewhere else.
  - The map should move this value, less the hub margin, to the origin countries in `origin_shares`.
  - `reexports_to_RUS_baseline_2019_2021` is the pre-war level, for the change view.
- **reexports_from_RUS** is Russian goods that the hub bought and passed on: gold and diamonds (HS71), and Georgian fuel (HS27).
  - The map should move this value, less the margin, from the hub's imports from Russia to the first onward buyers in `destination_shares`.
- **hub_margin_share** is the share of re-export value that stays in the hub.
  - Goods: 5-20% (UAE 3-15%).
  - Gold and diamonds: 0.3-6%.
  - Fuel: 3-12%.
  - This is an educated guess with no direct source. Wholesale gross margins are about 5-20% of sales. Pure pass-through traders sit at the low end; intermediaries taking sanctions risk sit at the high end. Bullion dealing and refining margins are around 1-3%. residual.json used the same 5-20%.

## Method

1. **Hubs that flag re-exports** (UAE, Georgia): the official flag in UN Comtrade (flowCode RX, partner Russia) is used directly.
   - UAE: USD 1.145bn (2021), 2.388bn (2022) and 4.213bn (2023), which is 94% of its exports to Russia. The UAE Ministry of Economy's AED 9bn for 2022 confirms it.
   - UAE 2024-25 are not in Comtrade. They come from the Ministry of Foreign Trade's non-oil trade with Russia (USD 11.5bn in 2024, 20.4bn in 2025) times a re-export share of 22-38%, the range seen in 2022-23.
   - Georgia's direct re-exports to Russia are tiny: USD 28-105m. Its USD 2bn car re-export trade goes to KGZ, KAZ, ARM and AZE, so it is not counted here (see overlap).
2. **All other hubs**: a matched-trade method on HS2 chapters, using UN Comtrade preview data for 2019-2025.
   - It covers manufactured chapters only: 28-40, 42-43, 61-70, 73 and 82-96.
   - Matched increase = min(increase in exports to Russia over the 2019-21 average, increase in imports from non-Russian partners).
   - This is multiplied by a hub-specific share that is a genuine re-export:
     - ARM 0.87 (0.70-1.0). Calibrated on the Armenian finance ministry: re-exports gave 187 of 215 percentage points of export growth to Russia in H1 2023.
     - KGZ 0.9.
     - KAZ, AZE 0.75.
     - MNG, TJK 0.8.
     - TUR 0.4 (0.2-0.6). From S&P Global: 30-50% of Turkey's high-priority shipments to Russia were of foreign origin.
     - UZB, SRB 0.4.
   - Low bound: the cap is 0.75x the import increase. High bound: the cap is 1.5x, and there is no cap where the hub under-records imports (KAZ, KGZ, MNG, TJK).
   - A baseline level of re-exports is added.
   - Kazakhstan 2022 uses the 2023 ratios, because Comtrade's KAZ import data for 2021-22 are incomplete.
3. **Origin shares**: the increase in the hub's HS84/85/87/90 imports by customs country of origin over 2021 (2019 for KAZ). This is blended with the 2021 structure for the baseline part.
4. **Onward Russian goods** = min(increase in HS71 or HS27 imports from Russia, increase in exports of the same chapter to non-Russian partners) x a pass-through share.
   - Destinations come from the increase in those exports by partner. Only the first onward hop is captured.
5. **Gap years and 2026**:
   - MNG and TJK 2024-25, and UZB 2025, have no Comtrade HS data. They use the latest re-export share x `trade_full.json` totals.
   - 2026 Jan-Aug = the 2025 share x trade_full Jan-Aug 2026 (not annualized), with the range widened.

## Re-exports to Russia, EUR bn: central (low-high)

| hub | cert | base 2019-21 | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|---|---|
| ARM | C | 0.07 (0.04-0.11) | 1.02 (0.71-1.22) | 1.77 (1.30-2.07) | 1.39 (1.02-1.64) | 1.31 (0.99-1.53) | 0.77 (0.28-2.80) |
| GEO | B | 0.04 (0.04-0.06) | 0.10 (0.09-0.15) | 0.09 (0.08-0.14) | 0.03 (0.02-0.07) | 0.04 (0.04-0.08) | 0.03 (0.01-0.07) |
| KAZ | C | 0.25 (0.13-0.44) | 1.78 (1.15-3.12) | 2.50 (1.61-4.37) | 2.20 (1.41-4.26) | 1.82 (1.16-3.15) | 1.16 (0.48-2.90) |
| KGZ | C | 0.06 (0.04-0.08) | 0.43 (0.31-0.51) | 0.40 (0.29-0.50) | 0.34 (0.24-0.64) | 0.28 (0.20-0.34) | 0.19 (0.09-0.32) |
| UZB | D | 0.03 (0.01-0.05) | 0.11 (0.05-0.19) | 0.19 (0.09-0.31) | 0.15 (0.06-0.26) | 0.21 (0.08-0.42) | 0.14 (0.02-0.56) |
| TUR | D | 0.17 (0.06-0.34) | 1.37 (0.66-2.15) | 2.02 (0.98-3.12) | 1.32 (0.63-2.07) | 0.76 (0.35-1.22) | 0.44 (0.14-1.00) |
| AZE | D | 0.06 (0.03-0.09) | 0.13 (0.08-0.18) | 0.18 (0.10-0.30) | 0.19 (0.11-0.29) | 0.18 (0.11-0.25) | 0.13 (0.05-0.24) |
| MNG | D | 0.00 (0.00-0.00) | 0.04 (0.02-0.04) | 0.04 (0.02-0.04) | 0.04 (0.01-0.09) | 0.04 (0.01-0.08) | 0.03 (0.01-0.16) |
| TJK | D | 0.01 (0.00-0.01) | 0.01 (0.01-0.02) | 0.01 (0.01-0.06) | 0.01 (0.00-0.10) | 0.01 (0.00-0.12) | 0.01 (0.00-0.22) |
| SRB | D | 0.06 (0.02-0.12) | 0.17 (0.08-0.32) | 0.20 (0.09-0.36) | 0.14 (0.06-0.26) | 0.11 (0.05-0.21) | 0.07 (0.02-0.18) |
| ARE | B | 0.67 (0.57-0.74) | 2.27 (2.15-2.38) | 3.90 (3.70-4.09) | 3.19 (2.34-4.25) | 3.97 (2.71-6.86) | 2.65 (1.26-5.95) |

The 11 hubs together (central) total about EUR 7.4bn (2022), 11.3bn (2023), 9.0bn (2024) and 8.7bn (2025). The 2022-25 sum of lows is about 5.3-8.3bn, and the sum of highs about 10-15bn; summing bounds overstates the range.

The UAE, Kazakhstan, Armenia and Turkey make up about 90% of this. Measured against the 2019-21 baseline, the rise in re-exports covers a different share of each hub's extra exports to Russia:
- about 90-100% for the UAE
- 55-65% for ARM
- 50-70% for KAZ and KGZ
- 25-35% for TUR and AZE
- 5-15% for UZB

## Russian goods passed on, EUR bn: central (low-high) and first destination

| hub | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug | main destinations (central) |
|---|---|---|---|---|---|---|
| ARM | 0.28 (0.23-0.29) | 1.91 (1.43-2.01) | 6.06 (4.09-6.38) | 1.93 (1.28-2.04) | 0.74 (0.23-2.40) | ARE 71%, HKG 22%, CHN 6% |
| GEO | 0.07 (0.03-0.16) | 0.08 (0.03-0.17) | 0.07 (0.03-0.15) | 0.08 (0.03-0.18) | 0.06 (0.01-0.20) | TUR 44%, other 31%, EU27 19% |
| KAZ | 0.00 (0.00-0.00) | 0.00 (0.00-0.00) | 0.10 (0.04-0.20) | 0.24 (0.09-0.40) | 0.15 (0.04-0.38) | other 90%, ARE 6%, CHE 2% |
| TUR | 0.34 (0.17-0.51) | 0.00 (0.00-0.00) | 0.00 (0.00-0.00) | 0.00 (0.00-0.00) | 0.00 (0.00-0.00) | other 73%, EU27 18%, HKG 9% |
| ARE | 4.27 (2.67-5.34) | 2.13 (1.33-2.66) | 2.15 (0.83-4.35) | 2.57 (0.99-5.19) | 1.71 (0.46-4.50) | other 50%, TUR 32%, CHE 7% |

- **Armenia**: the 2024 gold peak (Armstat: precious stones and metals imports USD 7.4bn, exports USD 8bn; UAE took USD 5.2bn) collapsed in 2025.
- **UAE**: onward gold is consistent with Reuters (75.7 t, USD 4.3bn of Russian gold in Feb 2022-Mar 2023). Its destinations are a weak proxy: the increase in all UAE HS71 exports, of which "other" is mostly IRQ, QAT, OMN, USA and SGP.
- **Turkey**: refined products made from Russian crude are about USD 4bn a year matched. They are processing, not re-export, so they are reported separately in `processed_from_RUS_not_counted` and not counted.
- **KGZ, UZB, AZE, MNG, TJK, SRB**: none measurable. Their gold is domestic, and AZE/KAZ fuel trade is own production or substitution.

## Origin shares of re-exports to Russia (central)

| hub | CHN | DEU | USA | KOR | JPN | ITA | FRA | TUR | VNM | other |
|---|---|---|---|---|---|---|---|---|---|---|
| ARM | 24% | 6% | 8% | 3% | 6% | 2% | 1% | 2% | 27% | 22% |
| GEO | 11% | 10% | 26% | 1% | 8% | 2% | 1% | 12% | 1% | 29% |
| KAZ | 37% | 6% | 4% | 9% | 5% | 1% | 1% | 2% | 2% | 34% |
| KGZ | 62% | 4% | 5% | 7% | 3% | 1% | 0% | 2% | 1% | 14% |
| UZB | 58% | 2% | 2% | 9% | 2% | 1% | 1% | 2% | 0% | 23% |
| TUR | 23% | 15% | 4% | 3% | 2% | 5% | 7% | 0% | 2% | 40% |
| AZE | 43% | 7% | 4% | 5% | 5% | 3% | 1% | 8% | 1% | 22% |
| MNG | 40% | 1% | 3% | 5% | 31% | 0% | 2% | 1% | 1% | 17% |
| TJK | 35% | 11% | 4% | 5% | 12% | 2% | 1% | 3% | 0% | 25% |
| SRB | 24% | 13% | 4% | 2% | 2% | 5% | 4% | 6% | 1% | 41% |
| ARE | 42% | 5% | 11% | 2% | 7% | 1% | 2% | 1% | 4% | 26% |


- "Other" is mostly:
  - VNM (Samsung phones) for ARM
  - GBR, CZE, POL, ESP and NLD (EU and UK cars and machinery)
  - IND, MEX and THA (ARE)
  - See `origin_other_detail` per hub.
- Customs origin is not brand origin. A Samsung phone counts as Vietnam, an iPhone as China.
- Weighted over all hubs (2023), the origin shares are:
  - China: about 35%.
  - Named coalition origins (DEU 7%, USA 7%, JPN 5%, KOR 4%, ITA 2%, FRA 2%): 28%.
  - Other EU and GBR inside "other": probably another 8-12%.
  - Vietnam: 7%.
- That puts coalition origins at roughly 35-40%. This fits KSE's finding that almost half of battlefield-goods imports in 2023 were coalition brands via third countries, since brand and origin differ.

## Overlap with residual.json (no double counting)

- **residual.json** gives origin countries the goods that are *missing* from partner-reported exports to Russia.
  - transit_KGZ: EUR 3.2, 5.8, 6.7 and 8.6bn in 2022-2025.
  - transit_KAZ: EUR 0.6, 1.1, 4.2 and 2.9bn.
  - These come from the rise in the gap between partners' exports to KGZ/KAZ and those hubs' own recorded imports. So they are neither in hub imports nor in hub exports to Russia.
- **This file** re-attributes value that *is* recorded in hub exports to Russia. The import cap uses recorded hub imports. The two are therefore disjoint and can be added.
- **Caveats**:
  1. The KAZ/KGZ high bounds drop the import cap, so do not add them to residual's highs.
  2. residual's pro-rata "residual" component (EUR 11-21bn a year) is spread over countries by reported exports to Russia, including hubs. When the map moves hub re-exports to origins, it should move the same share (`reexport_share_of_exports_to_RUS`) of the hub's pro-rata addition.
  3. Georgia's car re-exports to Central Asia are excluded here, because they are captured in KGZ/KAZ or in residual transit.
  4. Hong Kong's onward gold to mainland China is in residual.json and is not repeated.

## Sources (all accessed 2026-10-17)

- **UN Comtrade public preview API**. `https://comtradeapi.un.org/public/v1/preview/C/A/HS?...`
  - HS2 X/M with partner 0 and 643, 2019-2025.
  - RX flows for ARE and GEO.
  - Imports by origin for HS84, 85, 87 and 90.
  - Exports by destination for HS71 and HS27.
- **UAE**:
  - UAE Ministry of Economy via Gulf Today, 2023-09-01 (2022: re-exports AED 9bn).
  - UAE Ministry of Foreign Trade via Zawya, 2026-08 (non-oil trade AED 42.23bn in 2024 and USD 20.4bn in 2025).
  - Reuters via The New Arab, 2023-05-25 (Russian gold to UAE).
- **Armenia**:
  - Armenpress, 2023 (finance ministry: re-exports 187 of 215 percentage points).
  - ARKA, 2025-02-06 (Armstat 2024 trade).
  - The Insider/Hetq (Russian gold via Armenia).
- **Georgia**: IDFI, 2025-07-30 (car re-exports).
- **Turkey**: S&P Global Market Intelligence, 2024-07-22 (Turkish-origin share of high-priority shipments 71% to 50%).
- **Cross-hub studies**:
  - EBRD "Eurasian roundabout" (Chupilkin, Javorcik, Plekhanov), 2023-02-24.
  - Brookings (R. Brooks), 2024-09-12.
  - KSE Institute, 2024-01 (critical components).
  - Belga on E. Dor, 2023.
  - RFE/RL on Kyrgyz re-exports, 2023.
- Full URLs are in the JSON `sources` per hub.

## Limitations

- HS2 matching cannot separate domestic production inside a chapter. The hub shares are judgement and are documented per hub.
  - TUR, UZB, AZE, MNG, TJK and SRB are certainty D.
- The UAE 2024-26 values rest on ministerial non-oil trade totals, not a flagged re-export series.
- Destination shares are first hop only. Armenian gold goes to the UAE and then on to CHE, IND, HKG and TUR.
- No Bruegel, Free Russia Foundation or Silk Road Briefing figure could be used quantitatively; none was found with hub-level re-export values.
