# Weapons at market value (roadmap item 23)

Data: [`weapons_value.json`](weapons_value.json). Scripts and downloads are in the round-5 scratch folder (`weapons_value/split.py`, `model2.py`, `build_json.py`).

## What this is about

Military aid on the map comes from the Kiel Ukraine Support Tracker ([kiel-notes.md](../kiel-notes.md)). Kiel uses the value each donor reports, and fills gaps with its own price list. Donors value weapons taken from their own stocks in very different ways:

- **Replacement cost**: what it costs to buy a new item to replace the old one. Used by the US until March 2023, the UK in its budget figures, Sweden (package values include money for replacement procurement), Finland and the Baltic states (EU Peace Facility claims at 91–100% of the new price), and in practice France.
- **Book value**: the original purchase price minus depreciation. Used by the US since 31 March 2023 (average net book value for equipment, moving-average or standard price for munitions), and by Slovakia's audit office.
- **Kiel list price**: used when the donor gives no value, mostly SIPRI average contract prices in 2021 dollars. Many of these are already second-hand deals (Leopard 1, Leopard 2A4, M113, Gepard).

The owner's instruction: replacement cost is not the value to Ukraine. Count the **market value**, meaning what the used equipment would fetch on the international market. New procurement from industry is already at market price, and so are purchases of refurbished second-hand systems (Czech T-72EA, Leopard 1A5, the Jordanian Gepards). Neither needs a correction.

**The debate, briefly.** Replacement cost measures the donor's fiscal cost, because the donor has to buy new. Market value measures what Ukraine would otherwise have to pay. Use value, what a system is worth on the battlefield, can be far higher than either for old systems near the end of their life (Gepard, M113, HAWK). This file follows the owner's instruction (market value) and leaves the cost view to the builder (see Overlaps).

## Hard benchmarks found

| Benchmark | Number | Source |
|---|---|---|
| US PDA: replacement cost vs net book value | FY22 USD 2.6bn + FY23 USD 3.6bn overstated, plus USD 1.9bn more found by the Inspector General = USD 8.1bn on about USD 24bn of drawdowns, so net book value ≈ 0.68 × replacement | [Al Jazeera 2023](https://www.aljazeera.com/news/2023/6/21/pentagon-overestimates-value-of-ukraine-military-aid-by-6bn), [GAO-24-106934](https://www.gao.gov/assets/gao-24-106934.pdf), [DODIG-2024-095](https://www.dodig.mil/Reports/Audits-and-Evaluations/Article/3805413/audit-of-the-dods-revaluation-of-the-support-provided-to-ukraine-through-presid/) |
| US legal definition of "value" for items drawn from stock | "acquisition cost adjusted as appropriate for condition and **market value**" (22 U.S.C. 2403(m)); many items past their useful life have a net book value of 0; the Army uses an average net book value (one armoured vehicle type: USD 0–1.3m, average USD 461k) | GAO-24-106934 |
| UK stock donated Feb 2022–Mar 2024 | book value GBP 171.5m vs replacement cost GBP 2.71bn (6%); UK budget totals include the replacement cost | [NAO, Sept 2024](https://nao.org.uk/wp-content/uploads/2024/09/Investigation-into-military-support-for-Ukraine-Summary-1.pdf) |
| EU Peace Facility claims | Finland 100%, Latvia 99%, Lithuania 93%, Estonia 91%, France 71%, Sweden 26% of the **new** purchase price | [ERR/Politico](https://news.err.ee/1608928883/politico-estonia-using-epf-to-modernize-its-military), [LRT](https://www.lrt.lt/en/news-in-english/19/1948442/estonia-raises-eyebrows-claiming-reimbursement-for-aid-to-ukraine-media) |
| Slovakia | S-300 residual value EUR 69m; MiG-29 and Kub about EUR 0.5bn at book value; the prosecutor called the roughly 40-year-old jets almost worthless | [NKÚ](https://www.nku.gov.sk/web/nku-en/-/slovakia-has-actively-helped-ukraine-by-donating-military-property) |
| France | France's own figure (EUR 2.6bn) against Kiel's price-based estimate of EUR 0.85–2.0bn | Kiel research note (2024) |
| US Excess Defense Articles | sold at 5–50% of the original acquisition value, depending on age and condition | [DSCA](https://www.dsca.mil/Programs/Defense-Trade-and-Arms-Transfers/Excess-Defense-Articles) |
| Used F-16 | Norway sold 32 to Romania for EUR 388m including upgrade, spares and training (about EUR 12m each), against Kiel's USD 41m | [Defense Post](https://thedefensepost.com/2022/11/07/norway-sell-f-16-romania/) |
| Wartime premium on used systems | 60 Gepards that the Netherlands sold to Jordan for EUR 21m in 2013 were bought back by the US for USD 118m in 2023 | [Euro-SD](https://euro-sd.com/2023/11/news/land/35117/us-to-supply-gepard-to-ukraine/) |
| Used tanks | Leopard 1 hulks bought from the Belgian state cheaply, about EUR 0.5m each to restore; 108 Leopard 2A4 to Spain for EUR 16.9m, 100 used Leopard 2A6 to Finland for EUR 200m (pre-war); 90 Czech T-72s refurbished for about USD 90m | [Al Jazeera](https://www.aljazeera.com/news/2023/8/9/deal-struck-to-send-second-hand-leopard-1-tanks-from-belgium-to-ukraine), [DID](https://www.defenseindustrydaily.com/spain-finalizes-buy-of-108-leopard-2a4-tanks-01155/), [Defense News](https://www.defensenews.com/pentagon/2022/11/04/us-netherlands-go-dutch-to-refurbish-czech-tanks-for-ukraine/) |
| 155mm shells | EUR 2,000 before the war, then 4,000–8,000; US M795 about USD 3,000; NSPA contracts about USD 5,500 | [Defense One](https://www.defenseone.com/business/2023/11/race-make-artillery-shells-us-eu-see-different-results/392288/), [ERR](https://news.err.ee/1609258719/salm-to-us-defense-publication-takes-europe-a-year-to-fulfill-ukrainian-artillery-shells-orders) |

## How the numbers were built

1. **Split of Kiel's military aid.** I read every military allocation row in Kiel Release 31 (`MAIN DATA`, the redistributed EUR value). Each row is classified by:
   - **source**: procurement, stocks, both, or unspecified (Kiel's `source_of_weapon`);
   - **valuation**: donor-reported, or "calculated with prices" by Kiel;
   - **item class**: munitions and missiles, equipment, uncoded, Soviet-origin.

   Per-donor totals match `kiel.json` `military_allocated` exactly. Across all donors excluding EU institutions (EUR 177bn): 37% from stocks, 44% procurement, 2% both, 17% unspecified.
2. **Factor by valuation basis and item class** (market value ÷ recorded value; low / central / high):

   | Basis | Munitions, missiles | Equipment | Uncoded |
   |---|---|---|---|
   | R, replacement or new purchase price | 0.65 / 0.85 / 1.0 (in-date munitions sold near new prices in a seller's market) | 0.20 / 0.35 / 0.60 (EDA 5–50%, used tanks and F-16s) | 0.35 / 0.55 / 0.80 |
   | U, US net book value after March 2023 | 0.85 / 1.0 / 1.3 | 0.6 / 1.0 / 1.6 | 0.75 / 1.0 / 1.4 |
   | B, book or residual value | 1.0 / 1.4 / 2.5 (market prices rose) | 0.4 / 0.9 / 1.6 | 0.6 / 1.0 / 1.8 |
   | K, Kiel list price (2021 USD) | 0.9 / 1.3 / 2.0 | 0.45 / 0.75 / 1.1; Soviet-origin 0.15 / 0.35 / 0.70 | 0.6 / 0.85 / 1.2 |

3. **Item overrides** for the largest stock items. These are listed in `items_overridden` in the JSON:
   - MiG-29 ×0.12 (Germany sold 22 MiG-29 to Poland for EUR 1 each in 2003);
   - F-16 ×0.30;
   - Challenger 2 ×0.30;
   - PT-91 ×0.25;
   - Patriot and SAMP/T batteries ×0.75;
   - HAWK and Sea Sparrow ×0.25;
   - M777 ×0.5;
   - old Stingers ×0.5;
   - Swedish Strv 122 ×0.12 (recorded at about EUR 60m per tank, the cost of a new Leopard 2A8);
   - French AMX-10 RC ×0.08 (recorded at EUR 12m each);
   - Kiel's second-hand-priced Leopard, M113 and Gepard ×1.2 (wartime premium).

   Kiel spreads package totals over the rows it prices. Overrides on Kiel-priced rows are therefore applied only where the row value is within 0.5–2 × count × price.
4. **Donor basis.** These are the bases for donor-reported stock values:
   - USA: replacement cost before April 2023, net book value after;
   - Netherlands: like Kiel prices (the official estimate was within 10% of Kiel's);
   - Slovakia: book value;
   - Czechia: 70% book value;
   - Australia: 60% near-market;
   - Canada and Sweden 2022: half replacement, half book;
   - everyone else: replacement cost (from Peace Facility claims and budget practice).
5. **Mixed and unknown rows.** "Both" rows are counted half as stock and half as procurement. Rows with an unspecified source use the donor's coded stock share × its stock factor. Allocations with an unknown month (Italy 1.30) are spread over the years in proportion.
6. **UK calibrated to the NAO.** Kiel codes about EUR 4.9bn as UK stock for 2022 to March 2024, but the MoD's own replacement cost is only EUR 3.15bn. Only those EUR 3.15bn are corrected, with market ÷ replacement 0.20 / 0.40 / 0.65. The rest stays at factor 1.
7. **Ranges.** Low and high use all-low and all-high factors for a donor, which is fully correlated and so wide. Certainty is B where an official valuation benchmark exists (US, UK), C where the basis is documented but the factors are estimates, and D otherwise.

## Results (EUR bn, Kiel bilateral military aid 2022 to Aug 2026, excluding EU institutions)

Total recorded is 177.0. At market value it is **152.3 (136.2–173.7)**, a correction of **−24.7 (−40.9 to −3.4)**, or −14%. Every correction reduces aid toward Ukraine.

| Donor | Recorded | of which stock | Factor (low / central / high) | Market value | Correction (range) | Certainty |
|---|---|---|---|---|---|---|
| USA | 64.62 | 33.79 | 0.79 / 0.89 / 1.02 | 57.61 | −7.01 (−13.78 to +1.43) | B |
| GBR | 16.18 | 5.95 | 0.78 / 0.83 / 0.91 | 13.52 | −2.67 (−3.58 to −1.50) | B |
| SWE | 9.27 | 4.31 | 0.65 / 0.74 / 0.86 | 6.83 | −2.44 (−3.29 to −1.26) | C |
| POL | 4.45 | 1.35 | 0.47 / 0.60 / 0.82 | 2.68 | −1.78 (−2.34 to −0.82) | C |
| FRA | 6.23 | 1.40 | 0.65 / 0.74 / 0.85 | 4.64 | −1.59 (−2.18 to −0.95) | C |
| NLD | 9.36 | 3.26 | 0.76 / 0.86 / 1.00 | 8.05 | −1.31 (−2.25 to −0.03) | C |
| NOR | 7.46 | 2.13 | 0.79 / 0.86 / 0.95 | 6.40 | −1.06 (−1.60 to −0.37) | C |
| BEL | 2.84 | 0.81 | 0.57 / 0.68 / 0.83 | 1.92 | −0.91 (−1.22 to −0.49) | D |
| FIN | 3.34 | 0.34 | 0.67 / 0.77 / 0.90 | 2.57 | −0.77 (−1.11 to −0.34) | C |
| ITA | 3.00 | 1.33 | 0.50 / 0.75 / 1.03 | 2.25 | −0.75 (−1.50 to +0.09) | D |
| DNK | 10.54 | 0.96 | 0.92 / 0.94 / 0.96 | 9.86 | −0.68 (−0.85 to −0.45) | C |
| ESP | 1.51 | 0.85 | 0.49 / 0.65 / 0.85 | 0.98 | −0.53 (−0.77 to −0.22) | D |
| DEU | 25.00 | 4.64 | 0.92 / 0.98 / 1.07 | 24.51 | −0.49 (−2.09 to +1.79) | C |
| SVK | 0.70 | 0.69 | 0.22 / 0.37 / 0.71 | 0.26 | −0.44 (−0.54 to −0.20) | C |
| LTU | 1.21 | 0.39 | 0.57 / 0.66 / 0.81 | 0.80 | −0.41 (−0.52 to −0.23) | C |
| EST | 0.89 | 0.60 | 0.48 / 0.62 / 0.80 | 0.55 | −0.34 (−0.46 to −0.18) | C |
| LVA | 0.65 | 0.43 | 0.48 / 0.59 / 0.78 | 0.39 | −0.27 (−0.34 to −0.15) | C |
| AUS | 0.91 | 0.56 | 0.58 / 0.76 / 0.96 | 0.69 | −0.22 (−0.38 to −0.03) | C |
| CAN | 5.82 | 1.39 | 0.88 / 0.97 / 1.13 | 5.64 | −0.18 (−0.70 to +0.77) | C |
| CZE | 0.58 | 0.24 | 0.67 / 0.75 / 0.87 | 0.43 | −0.15 (−0.19 to −0.08) | C |

Per year, central (recorded × factor = market value):

- **USA**
  - 2022: 20.88 × 0.76 = 15.84
  - 2023: 23.11 × 0.92 = 21.18
  - 2024: 20.14 × 1.00 = 20.10
  - 2025: 0.48 × 1.00 = 0.48
- **GBR**
  - 2022: 3.59 × 0.66
  - 2023: 2.58 × 0.75
  - 2024: 2.67 × 0.80
  - 2025: 5.44 × 0.98
  - 2026: 1.91 × 0.92
- **SWE**
  - 2022: 0.55 × 0.82
  - 2023: 1.47 × 0.39
  - 2024: 2.21 × 0.60
  - 2025: 3.71 × 0.93
  - 2026: 1.34 × 0.78
- **POL**
  - 2022: 1.83 × 0.59
  - 2023: 1.49 × 0.47
  - later years are small

The correction falls over time because aid shifted from stocks to new production: the stock share of all donors' military aid fell from 45–77% per quarter in 2022 to mostly under 25% in 2025–26 (Kiel Fig A26). Germany's factor is close to 1 because Kiel values most German stock deliveries with its own prices, which are largely pre-war contract prices.

## What is guessed

- All class factors are educated estimates. They are anchored on the benchmarks above, but no donor publishes market values.
- The valuation basis is documented for the US, UK, Slovakia, Sweden, France, Finland and the Baltic states. It is assumed for Norway, Denmark, Poland, Belgium, Spain, Canada, Italy and the small donors.
- Finland's aid is 79% "source unspecified", so its correction rests on an assumed stock share.
- Italy's aid is classified, so certainty is D.

## Overlaps

- Only Kiel bilateral military allocations are corrected. EU-level military aid (procurement) and PURL purchases from US stocks (market transactions at FMS prices) get factor 1.
- [`uncovered.json`](uncovered.json) undisclosed military aid is not corrected. It is mostly budget money for procurement. Italy's later decrees are likely stock and could take Italy's stock factor (about 0.73).
- **Flowback** ([flowback.json](../flowback.json), [flowback2.json](flowback2.json)) counts replenishment of donated stocks as orders for the donor's own industry. That spending stays real and is not changed here. The builder should not re-apply own-industry shares to the corrected value, or flowback shrinks twice.
- **ERA loans**: the UK ERA loan (2.65, coded military, 2025) sits in rows with factor about 1. Apply `correction_by_year` (absolute EUR bn) rather than the factor, so the pipeline's ERA exclusion is unaffected.
- **Cost view**: replacement cost is arguably the donor's real fiscal cost. The builder should decide whether the cost view keeps the recorded values and only the net shift uses market value.

## Open questions

- Germany's own replacement-cost figure for Bundeswehr stock (EUR 5.2bn, Feb 2024) is not used by Kiel. If Kiel ever switches to it, Germany's correction becomes larger (factor about 0.4 on that part).
- A Kiel working paper or the European Court of Auditors may publish Peace Facility valuation rules per member. That would replace the assumed bases.
- Kiel's price list values 155mm rounds at USD 776, a pre-war US cost, far below the 2023–25 market of USD 3,000–5,500. Where Kiel prices munitions itself, market value is probably higher than recorded. Because Kiel spreads package values over priced rows, this was handled only through the class factor (1.3), not item by item.
