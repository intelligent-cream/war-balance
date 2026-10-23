# Hub buyers and Turkey's refining of Russian crude (research 2026-10)

Gathered 2026-10-18. Output: `hub_buyers.json`. **No person has reviewed it yet.**
Values are in EUR bn, nominal, converted at the ECB annual average EUR/USD (2022 1.053, 2023 1.0813, 2024 1.0824, 2025 1.13, 2026 1.1616). Ranges are low / central / high, meant as ~90% intervals.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## 1. Customers of six hubs (`hubs`)
These are shares of each hub's refined-product exports (HS 2710) by value, averaged over 2022-2025.
- Sales to Russia are dropped, because they are a round trip.
- For each hub, the central shares of the top 25 destinations plus "other" sum to 1. Low and high are bounds per destination and do not sum to 1.
- Some destinations are hubs themselves (NLD, SGP, ARE, IND, TGO). They are listed as they are; chaining them is left to the pipeline.

| hub | basis | top destinations (central %) | certainty |
|---|---|---|---|
| ARE | Importers' data (mirror), plus the UAE's own named flows for countries that rarely report | KOR 8.5, IRQ 7.0, SGP 6.0, JPN 5.9, PAK 5.0, ZAF 4.8, CHN 4.5, KEN 4.3, SAU 4.0, GBR 3.4; other 19 | C |
| IND | India's own report for 2022-25; mirror data used for the ranges | NLD 16.8, ARE 9.2, SGP 7.0, USA 6.7, AUS 5.0, ZAF 4.2, TGO 3.8, TZA 3.6, OMN 2.4, CHN 2.4 | B |
| TUR | Turkey's own report for 2022-25; mirror data used for the ranges | GRC 9.3, NLD 8.6, CYP 7.6, ROU 6.9, ITA 5.2, GBR 5.0, LBN 4.9, SGP 3.9, MLT 3.5, USA 3.5 (EU27 50-57% a year) | B |
| TGO | 50% mirror data, 50% a prior based on reporting of ship-to-ship transfers | NGA 17.8, AGO 17.1, CIV 10.0, GHA 9.1, ZAF 5.4, BEN 5.2, BFA 4.1, COG 3.9, COD 3.6, MLI 3.4 | D |
| GIB | 60% mirror data, 40% prior (Gibraltar does not report) | MAR 22, ESP 15, FRA 10, SAU 10, PRT 7, NLD 7 | D |
| PAN | 70% mirror data, 30% Panama's own exports and re-exports | GHA 12, CRI 11, VEN 11, ECU 9.5, NIC 6, DOM 5, COL 5 | D |

Notes per hub:
- **UAE.**
  - The UAE reports 70% (2022) and 84% (2023) of its product exports as "areas not specified", and it has not published 2024-25.
  - Mirror totals were USD 64, 56, 50 and 40 bn for 2022-2025.
  - Iraq and Djibouti barely report imports from the UAE. For them, the UAE's own figure is used (Iraq about USD 4 bn a year).
  - Fujairah bunker sales have no buyer country and are not included.
- **India.**
  - Importers' data cover only 55-60% of what India reports. The Netherlands records far less from India than India records sending there, so the Netherlands' low bound is wide.
  - This split is for India's resale of *imported* products only.
- **Togo.**
  - India reports USD 2-5 bn a year of exports to Togo. Togo, however, reports only USD 0.15-0.2 bn of imports and USD 0.1-0.2 bn of exports.
  - Lomé is a ship-to-ship transfer point: the fuel moves on without clearing Togolese customs. Importers name Togo as the origin for only USD 0.7-1.8 bn.
  - The prior assumes:
    - Nigeria was the main buyer before the Dangote refinery started.
    - Ghana and Benin take part of it.
    - Burkina Faso, Niger and Mali are supplied by road.
    - Côte d'Ivoire, Cameroon and Angola take smaller amounts.
- **Gibraltar and Panama.**
  - Both are mostly bunker ports, with resale shares of only 0-0.1.
  - Their importers' data show single cargoes rather than a stable pattern, so the split matters little and the ranges are very wide.

## 2. Turkey's refining of Russian crude (`turkey_refining`)
| | 2022 | 2023 | 2024 | 2025 | 2026 Jan-Aug |
|---|---|---|---|---|---|
| Russian crude, Mt (CREA) | 12.9 | 10.9 | 16.8 | 15.1 | 6.2 |
| (a) Russian crude value | 6.87 | 4.33 | 7.13 | 5.36 | 2.05 |
| Products made from it (value) | 10.6 | 6.4 | 9.1 | 7.3 | 4.5 |
| (b) export share, central (low-high) | 0.34 (0.22-0.50) | 0.35 (0.22-0.50) | 0.33 (0.21-0.48) | 0.29 (0.18-0.45) | 0.10 (0.04-0.25) |
| Exported products (value) | 3.60 (2.3-5.5) | 2.26 (1.4-3.3) | 2.99 (1.8-4.5) | 2.12 (1.3-3.4) | 0.45 (0.2-1.1) |
| (c) crude value used in Turkey | 4.53 | 2.81 | 4.78 | 3.81 | 1.85 |
| Turkey part of laundered_oil already counted at buyers | 2.92 | 3.03 | 4.77 | 3.64 | 1.43 |
| Share of exports already counted, central | 97% (2022 compared Mar-Dec) | 100% | 100% | 100% | 100% |
| **New, uncounted** (low / central / high) | 0 / 0.08 / 2.3 | 0 / 0 / 1.0 | 0 / 0 / 0.9 | 0 / 0 / 0.6 | 0 / 0 / 0.5 |

Method:
- **(a) Crude value.** CREA's tonnes and value of Russian crude delivered to Turkey (±8%), assuming crude imported = crude refined.
  - Cross-check: Reuters and Kpler put Turkey's crude imports at 669 kb/d in Jan-Oct 2025, 47% of it Russian, which is about 15.7 Mt.
- **Product value.** Crude tonnes x 0.90/0.93/0.96 t of product per t of crude x Turkey's own export unit value (USD 930, 689, 630 and 589 per t for 2022-2025).
  - For 2026, the 2025 unit value is scaled by the NY Harbor diesel price ratio (x1.51).
- **(b) Export share.** Refinery export ratios weighted by each refinery's Russian crude intake.
  - STAR took about 8 Mt of Russian crude in 2022, and Russian crude was over 90% of its intake in 2024-25. It exported about 35-45% of its output: 2.3 Mt to the EU in 2022, and the EU took over 75% of its seaborne exports in Q1 2024 (Global Witness/Kpler).
  - Tüpraş sold about 20-27% of its 30 Mt sales abroad. It cut Russian crude from early 2025.
  - Cross-check with the national balance: product exports of 14-22 Mt / (refinery output of about 37 Mt + product imports of 20-33 Mt) gives 0.25-0.31.
  - 2026: STAR switched to non-Russian crude from December 2025, and Tüpraş kept Russian crude at one refinery for the home market, so both keep access to the EU under its ban from 21 Jan 2026. The share is therefore low, and the 2026 buyers are non-EU (`destinations.2026_non_eu`: GBR 10.7, LBN 10.4, SGP 8.4, USA 7.6, UKR 6.6, ARE 6.0, CHE 5.9).
- **Destinations.** Turkey's own HS 2710 export split, the same as `hubs.TUR`. Ukraine (3%) also buys Turkish fuel.

**Overlap with `energy.json` laundered_oil.**
- The laundered model already has a Turkey component for every buyer: Turkey's HS 2710 exports to that buyer x Turkey's national Russian crude share (35-54%) x the CREA calibration factor (0.53/0.699/1.0).
- Rebuilt per destination here, that component is as large as the refining estimate or larger in every year, for two reasons:
  - The model applies the national share to all of Turkey's fuel exports.
  - Those exports include re-exports of imported Russian products.
- The destinations match by construction, because both use the same export split. So the exported products are **fully counted already (97-100%)**, and the uncounted remainder is about zero. A positive amount appears only in the high case, when the export share is high and the calibration factor is low.
- **What is not handled is a double count at Turkey.**
  - Turkey's own fossil fuel payments to Russia include all of its Russian crude. The exported part is counted again at the buyers.
  - That exported part is EUR 2.3, 1.5, 2.4, 1.6 and 0.2 bn (2022 to 2026 Jan-Aug, central, crude value) and is listed in `double_count_at_turkey`.
  - The owner's point ("it processes and then sells") is best met by *deducting* this amount from Turkey, not by adding anything to the buyers.

**Related channel, not added.** Turkey also re-exports Russian *products* it imported:
- Russian product imports were EUR 12-17 bn a year (CREA). At a resale share of 0.1/0.2/0.45, that is EUR 1.6/3.2/7.2 bn in 2023.
- CREA/CSD found that the EU imported EUR 3.1 bn over Feb 2023-Feb 2024 from three Turkish ports whose imports were 86% Russian.
- The surplus of the laundered model over the refining estimate (EUR 0.8-1.8 bn a year) covers roughly half of this. The figures are in `reexport_of_russian_products`.

## 3. India (`india_overlap`, `india_refining`)
- **Russian crude.** 34.8, 88.9, 89.4 and 86.3 Mt in 2022-2025, and 64.4 Mt in Jan-Aug 2026 (CREA).
- **Export share** of products made from it: 0.28-0.30 (range 0.20-0.42).
  - Basis: India exports about 23% of its refinery runs (PPAC; the figure is approximate). This is weighted up because the export refineries of Reliance (Jamnagar SEZ) and Nayara took a large part of the Russian crude.
  - 2026: 0.22. Reliance stopped Russian crude at its export refinery ahead of the EU ban (press reports from late 2025).
- **Exported product value.** EUR 6.7 bn (Mar-Dec 2022), 15.8, 14.5 and 11.7 bn (2023-2025), and 10.1 bn (2026).
- **Overlap.** The India component of laundered_oil is 7.7, 20.1, 16.3, 11.1 and 10.3 bn, which covers 95-100% of these exports.
  - The remainder is 0.6 bn in 2025 and about 0 in the other years.
  - CREA's refining-loophole figures and this model measure the same channel, so nothing should be added.
- **Double count on India's side.** India's fossil fuel payments also include the exported part: crude value EUR 5.2, 10.6, 11.5, 8.9 and 5.5 bn.
- **Comtrade overstates India's exports.** Comtrade records 83-104 Mt a year of Indian product exports, against about 62 Mt from PPAC. The model's India component may therefore be too high, which makes "already counted" safer, not weaker.

## Weakest assumptions
1. **Export share of fuel refined from Russian crude** (Turkey 0.29-0.35, India 0.28-0.30). These rest on refinery-level reports and company sales, not on a measured split by crude origin. The conclusion that nothing new is uncounted holds unless the share is above about 0.45 for Turkey and 0.38 for India.
2. **Togo's buyers.** Ship-to-ship cargoes are invisible in customs data, so half of the split is a prior.
3. **UAE.** The split rests on importers' data. Iraq and East Africa are added from the UAE's own report for 2022-23, and bunkers and free-zone storage are left out.
4. **Gibraltar and Panama.** Tiny, noisy flows. Their low resale shares make this matter little.
5. **Laundered model rebuild.** Rebuilt from the model code. The CREA country anchors for USA, GBR, FRA, ITA, NLD and AUS (averaged in energy.json) are ignored here, so the counted amount for those buyers is approximate.
6. **2022 includes Jan-Feb.** Turkey's 2022 crude figures are for the whole calendar year. The overlap compares March to December, because the laundered series starts in March 2022.
