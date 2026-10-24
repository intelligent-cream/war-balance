# Round 11: checking the rough inputs (hubs, payment agents, shadow fleet, company taxes, laundered-oil cap)

Data file: `assumptions_r11_hubs.json` (27 proposals). Gathered on 2026-10-19.
Each proposal gives the old value, the new value, whether the basis is **data** or **judgement**, and its sources.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

Units: Mt is million tonnes and EUR bn is nominal. USD is converted at the ECB yearly averages used in the repo (2022 1.053, 2023 1.081, 2024 1.082).

## Summary: old → new

| item | country | old | new | basis |
|---|---|---|---|---|
| hub resale | NLD, BEL, GRC, SGP, TUR, IND, TGO, MLT | as in energy2.json | **unchanged** (2022–24 data confirm) | data |
| hub bunker share | ARE | 0.15 / 0.30 / 0.45 | **0.20 / 0.30 / 0.40** | data |
| hub resale | PAN | 0 / 0.01 / 0.10 | **0 / 0.05 / 0.35** | judgement on data |
| hub bunker share | PAN | 0.05 / 0.20 / 0.50 | **0.30 / 0.40 / 0.50** | judgement on data |
| hub resale | GIB | 0 / 0.02 / 0.10 | unchanged (no tonnage data exists) | judgement |
| bunkers in the central case | MLT, GIB | hub keeps 97–98% | **hub keeps 1 − resale − ½·bunker** (MLT 0.57) | judgement |
| agent fee × share, 2025 | all | 0.55 × 2.5% | 0.70 × 2.0% (+2%): **keep** | data |
| agent fees | KGZ, ARM | as is | unchanged; bank-profit cross-checks added | data |
| agent split by country | all | guess | unchanged: **no country data exists** | — |
| Greek freight | GRC | EUR 9.0bn (mid-2023 to mid-2026) | unchanged; consistent with FT ~EUR 4.9bn crude-only | data |
| shadow-fleet control shares | ARE, CHN, HKG, IND, opaque | r6 | unchanged: nothing newer reachable | — |
| company profit tax 2022 | BEL | 0.0118 (0.002–0.077) | **0.016 (0.012–0.035)** | data |
| company taxes | other allocated countries | allocation | unchanged: **no per-country figures found** | — |
| LAUNDERED_CAP | LBR | 1% / 2% of GDP | **0.25% / 0.85%** | data |
| LAUNDERED_CAP | TGO | 1% / 2% | **0.27% / 0.89%** | data |
| LAUNDERED_CAP | MLT | 1% / 2% (not binding) | **0.15% / 0.4%** | data |
| LAUNDERED_CAP | PAN | 1% / 2% (not binding) | **0.02% / 0.09%** | data |
| LAUNDERED_CAP | MHL | 1% / 2% | unchanged (data band 0.64–2.8%) | judgement |
| LAUNDERED_CAP | GIB | 1% / 2% | unchanged (no consumption data) | — |
| laundered oil, structural | LBR, MHL, PAN, MLT | GDP cap only | **drop partner records of bunkers to flag-state ships** | data |

## 1. Hub resale shares

The hub resale share is exports ÷ (imports + refinery output), from Eurostat `nrg_cb_oil` O4600, recomputed for the war years.

| hub | 2022 | 2023 | 2024 | current central | bunkers / supply |
|---|---|---|---|---|---|
| NLD | 106.39/143.81 = 0.740 | 0.754 | 0.730 | 0.74 | 0.08 |
| BEL | 24.64/54.05 = 0.456 | 0.484 | 0.483 | 0.48 | 0.13–0.15 |
| GRC | 17.69/35.03 = 0.505 | 0.507 | 0.491 | 0.50 | 0.06 |
| TUR | 8.89/61.16 = 0.145 | 0.138 | 0.136 | 0.20 | 0.01 |
| MLT | export/import 0.011 | 0.031 | 0.015 | 0.03 | bunkers/imports 0.81 each year |

The Eurostat figures are confirmed by UN Comtrade HS 2710 weights:
- **Netherlands:** exports/imports 1.84–2.18.
- **Türkiye:** exports/imports 0.66–0.71. This is the upper bound.
- **Singapore:** exports/imports 0.83–0.84 in 2023–24, just under the 0.87 high.
- **UAE:** re-exports/imports 0.45 (2022) and 0.38 (2023).
- **Togo:** re-exports/imports 0.50–0.94 in 2019–24, with a mean of 0.61.

Port statistics agree with Eurostat's bunker figures. Rotterdam supplied 10.6 Mt, 9.9 Mt and 9.8 Mt of bunkers in 2022–24, against Eurostat INTMARB of 10.6–11.7 Mt.

**UAE bunkers (now verified).** Fujairah sold 7.49 Mt of bunkers in 2024 ([Engine](https://engine.online/news/fujairah-bunker-sales-grew-2-pc-in-2024-despite-weaker-vlsfo-demand-672b), FOIZ / S&P data) and about 7.4 Mt in 2023. Against 21–24 Mt of imports that is 0.31–0.35. Part of Fujairah's bunkers come from UAE refineries, so the central stays at 0.30 and the range narrows to 0.20–0.40.

**Panama.** The shares need a different basis:
- **Panama's own customs:** imports are only 2.7 Mt a year, and 94% of that comes from Panama's own free zones. This is fuel used in the country.
- **Partner-reported exports to Panama:** 13.5–16.2 Mt a year, of which:
  - USA 6.4–8.1 Mt;
  - China 3.0–3.4 Mt, which is flag-of-ship bunkers (see §5);
  - Ecuador 1.0–1.9 Mt.
- **Panama's bunker sales:** 5.24 Mt (2022), 4.9 Mt (2023) and about 5.1 Mt (2024), from AMP data via Seatrade and Ship & Bunker.

The model's Panama volume comes from the partner records. Excluding China, about 0.40–0.50 of it becomes bunkers and 0.21–0.26 domestic use. The remaining 0.25–0.40 is free-zone re-export or storage that no source splits. Proposed: bunkers 0.3/0.4/0.5, resale 0/0.05/0.35.

**Bunkers in the central case (Malta, Gibraltar).** Data show that 81% of Malta's imported products leave as bunkers for foreign ships, yet the builder keeps 97% at the hub in the central case. In the code, `HUB_BUNKER` is subtracted only in `years_lo`. Proposed: also subtract half of the central bunker share in the central case, for hubs where bunkers are more than 75% of imports. "Half" is a judgement.

**Gibraltar.** The Port Authority publishes bunker calls (5,084 in 2024) but not tonnes, and Gibraltar does not report to Comtrade. No change.

## 2. Payment agents

- **Fees and shares.** [Izvestia, 26 Jun 2025](https://iz.ru/en/node/1910577) quotes market participants:
  - the average fee fell from 5% to 2% in 2025, and to 1.5% for large batches;
  - fees were 4–7% in 2024;
  - intermediaries handle 70–80% of the payment market.

  For 2025 this gives 0.70 × 2% = 1.40% of imports, against the current 0.55 × 2.5% = 1.375%. The difference is 2%, so no change. The 2024 fee of 4% sits inside 4–7%.
- **Kyrgyzstan** (NBKR annual reports, tables 3.1.1.6 and 3.1.8):
  - Bank net profit was KGS 3.6bn (2021), 23.2bn (2022), 24.2bn (2023) and 31.1bn (2024).
  - The excess over 2021 is EUR 0.22bn, 0.22bn and 0.29bn a year.
  - Net non-interest income was KGS 7.1bn, 32.8bn, 23.6bn and 38.1bn over the same years.

  The current agent-fee central (0.07–0.25) sits below the bank excess and the high (0.19–0.63) above it, which leaves room for non-bank agents. No change.
- **Armenia** (UBA / bne / CivilNet):
  - Bank profit was USD 171m (2021), 581m (2022), 586m (2023) and about 923m (2024).
  - The excess over 2021 is EUR 0.39bn, 0.38bn and 0.70bn.
  - The agent central is 15–30% of that excess. No change.
- **No data by country.** No source gives agent volumes or commissions by country: Bank of Russia BoP, Finance Ministry letters, Reuters/Vedomosti and FinCEN's A7 material were checked. The country split stays a judgement.

## 3. Shadow fleet

The FT (7 Jul 2026, via [USM](https://en.usm.media/?p=195381)) estimates Greek owners' earnings from Russian crude since mid-2023:
- at least USD 3.8bn on 389m bbl priced, out of 542m bbl tracked;
- that is USD 9.8 a barrel, or about USD 5.3bn (EUR 4.9bn) when scaled to all 542m bbl;
- this is crude only, gross.

r6 gives Greece EUR 9.0bn of gross freight for the same window, crude and products together. The two match if products are about 45% of Greek freight.

On volume, 542m bbl over 36 months is about 15m bbl a month. Assuming Russian seaborne crude of about 100m bbl a month (a round figure, not from a source checked here), that is about 15% of crude. The r6 average for the window is about 18%. Both are within the r6 ranges, so no change.

No vessel-level beneficial-owner data (Lloyd's List Intelligence, S&P) was reachable. Nothing newer than the September 2026 KSE tracker was found.

## 4. Company taxes

- **Belgium 2022.** B4Ukraine/KSE ([The Business of Staying, July 2023](https://b4ukraine.org/pdf/BusinessOfStaying.pdf); earlier read via the Brussels Times) give USD 17m of profit tax for Belgian-HQ firms, which is EUR 16.1m. This replaces the allocated EUR 11.8m.
- **Other allocated countries.** No further per-country figures were found:
  - KSE's 2023 results report has its country charts only as images.
  - leave-russia.org country filters still return HTTP 500.
  - Euronews has country pieces only for Germany, Italy and France, which are already reported.
  - Follow the Money and the Kyiv Independent give only totals and Raiffeisen.

## 5. LAUNDERED_CAP

**Main finding.** China, and also Brazil, Greece and Singapore, report HS 2710 "exports" to the big flag registries. These are bunkers sold to ships flying those flags.

| registry | partner-reported exports to it | its own customs imports |
|---|---|---|
| Liberia | 4.9–5.3 Mt a year (China 3.6–4.1) | 0.27–0.33 Mt, 95–98% from Côte d'Ivoire |
| Marshall Islands | 2.9–4.0 Mt a year (China 1.8–2.4) | not reported; use is about 2,000 b/d |
| Panama | China 3.0–3.4 Mt | (see §1) |
| Malta | Türkiye 0.8, China 0.7–0.9 and India 0.2 Mt | none of these appear in Malta's customs |

Because China refines Russian crude, these records carry "laundered oil" to the registries. The cap was a patch for this. A structural fix would drop these partner records. Failing that, a cap based on fuel use:

**cap = fuel use × share made from Russian crude elsewhere × crude content (0.5 central / 0.6 high)**

| | fuel use (data) | share (judgement) | central cap | high cap | old |
|---|---|---|---|---|---|
| LBR | EUR 553m/yr (customs; EIA 4.6–4.9 kb/d agrees) | 4% / 10% (CIV supply: India+Türkiye 4–8%; CIV crude is Nigerian) | EUR 11m = 0.25% GDP | EUR 37m = 0.84% | 1%/2%, binding |
| TGO | 5.73m bbl (15,690 b/d) ≈ EUR 530m | 10% / 25% | EUR 26.5m = 0.27% | EUR 87.5m = 0.89% | 1%/2%, binding |
| MLT | own imports from India/UAE/Türkiye: USD 0.3m / 59.3m / 1.6m (2022/23/24) | × 0.5 → EUR 0.1m / 27.4m / 0.7m | 0.15% = EUR 35m | 0.4% = EUR 93m | not binding; current values EUR 76–128m are too high |
| PAN | EUR 2.6bn/yr, mainly US-origin via free zones | 1% / 4% | EUR 13m = 0.02% | EUR 72m = 0.09% | not binding; current values EUR 130–190m exceed the high |
| MHL | ~0.73m bbl ≈ EUR 68m (2014 est.) | 5% / 15% | EUR 1.7m = 0.64% | EUR 7.4m = 2.8% | 1%/2%: keep |
| GIB | no inland figure (power station on LNG) | — | — | — | keep (not reached) |

## Not found / blocked

- Gibraltar bunker tonnes.
- Inland oil consumption for Marshall Islands after 2014.
- Agent volumes by country.
- Vessel-level beneficial owners.
- Per-country company taxes beyond the about 20 reporting countries and Belgium 2022.
- The EIA international API (rate-limited with DEMO_KEY), so consumption for Liberia and Togo comes from Worldometers' EIA-based pages.
