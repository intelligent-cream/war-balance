# Round 11: checking the assumptions behind the money rule and the cost view

Data file: [`assumptions_r11_rules.json`](assumptions_r11_rules.json). The file only proposes changes:
`pipeline/build_data.py` and `value_kept.json` are untouched. Scripts are in
`/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r11/scripts/`. **Not yet reviewed by a person.**

## Summary: old and new values

| constant | old | new (low / central / high) | basis |
|---|---|---|---|
| Lost sales to Russia, share not redirected (default) | 0.25 / 0.40 / 0.60 | 0.20 / 0.35 / 0.55 | judgement on firm-level data |
| … Finland | 0.15 / 0.30 / 0.50 | 0.10 / 0.25 / 0.45 | judgement on VATT and Bank of Finland |
| … Baltics | 0.25 / 0.45 / 0.65 | 0.20 / 0.40 / 0.60 | judgement on Latvijas Banka |
| … large exporters, commodity exporters | 0.20/0.35/0.55; 0.10/0.20/0.40 | unchanged | |
| Extra sales to Russia (China 0.60, Türkiye 0.45, default 0.50) | – | unchanged, now backed by capacity data | data |
| Weapons (default 0.6, US 0.70) | – | unchanged | data |
| Tourism lost (0.30) | – | unchanged | data |
| Shadow shipping (0.65) | – | unchanged | judgement |
| `OWN_SHARE_DEFAULT` | 0.2 / 0.4 / 0.7 | 0.0 / 0.1 / 0.3 | judgement (applies only to ALB, MKD, MNE) |
| `LOAN_GRANT_ELEMENT` (lender's cost) | 0.30 | 0.09 / 0.26 / 0.47, or better a value per loan class | data (terms) + judgement (expected loss) |
| `META.tariff_rate` | 4% for EU, UK and Canada | EU 0.2 / 0.3 / 1.0% (Jun 2022–Jun 2025 only); UK 0.1 / 0.2 / 0.5%; Canada 0.3 / 1.0 / 3% | data |
| `EU_ARMS_SLICE` × 0.78 | FRA 0.30, DEU 0.19, ITA 0.15, SWE 0.05 … | SWE 0.28; all others together 0.03; about 0.7 to Ukraine's own industry | data (Kiel items) |

The biggest changes are the tariff rate (the EU cost falls from about EUR 1bn a year to about EUR 0.05–0.08bn) and the EU arms slice
(about EUR 2.7bn of flowback moves off France and about 1.7bn off Germany, and Sweden gains about 2.1bn).

## 1. "Genuinely extra" shares

**Lost sales to Russia.** I found no study that measures what share of the EU's lost 2022 sales to Russia found other
buyers. I searched ECB, Bundesbank, Banca d'Italia and Kiel publications; the CEPR/VoxEU pages refused access. The
firm-level evidence all points the same way:

- **Germany, 2014 sanctions.** [Görg, Jacobs and Meuchelböck, IZA DP 16146](https://repec.iza.org/dp16146.pdf) used German firm data.
  Total sales fell only for the 283 firms with more than 5% of their sales in Russia: −4.8% at the 2015 peak, and no longer
  significant by 2017. Firms with under 2% of sales in Russia showed no fall, so they were "able to divert their sales
  destined for Russia either to other destination countries or to the domestic market".
- **Finland, 2022.** [VATT](https://vatt.fi/en/-/vatt-data-room-russian-invasion-of-ukraine-has-had-only-minor-economic-effects-on-finnish-firms-that-used-to-trade-with-russia):
  former Russia exporters' turnover was "almost unaffected", with no effect on jobs. The
  [Bank of Finland](https://www.bofbulletin.fi/en/2024/3/the-collapse-of-trade-with-russia-has-had-a-limited-effect-on-finnish-manufacturing/)
  finds "most the loss in Russian exports has been compensated for by penetration of new markets".
- **Latvia, 2022.** [Latvijas Banka (Gavoille)](https://eng.lsm.lv/article/features/commentary/10.06.2025-how-did-latvian-firms-exposed-to-russia-adapt-to-trade-sanctions.a602623/):
  low-exposure firms kept or raised turnover. Only firms with more than 25% of turnover from Russia lost, cutting about 10% of jobs.
- **Spain, 2022.** [de Lucio et al.](https://sanctionsrussia.org/publication/reducing-trade-with-russia/): rerouting through
  neighbouring countries was about 5% of the exports lost. This covers rerouting to Russia, not new buyers, so it does not measure redirection.

The proposal slightly lowers the default, Finland and the Baltics. It is still a judgement, because no study gives an
economy-wide redirection share. The German result that the losses fade after about three years suggests an optional
factor of about 0.7 for 2025–2026.

**Extra sales to Russia.** China's car industry ran at 72.0% of capacity in Q1 2023 and 75.6% in Q3 2023
([NBS Q1](https://www.stats.gov.cn/english/PressRelease/202304/t20230420_1938877.html),
[NBS Q3](https://www.stats.gov.cn/english/PressRelease/202310/t20231026_1943931.html)). With that much spare capacity, China
keeps 0.60. Türkiye's CBRT capacity use was 75.9–77.6% through 2022
([AA, Sept 2022](https://aa.com.tr/en/economy/turkish-manufacturing-capacity-up-in-september/2694690)), close to full, so it keeps 0.45.

**Weapons.** The Commission says EU 155mm capacity reached 1 million a year in January 2024, with ASAP aiming at 2 million by
end-2025 ([Latvian MoD](https://www.mod.gov.lv/en/news/european-commission-will-invest-additional-artillery-ammunition-production-capacities)).
That is consistent with 0.6. Nothing new was found on crowding-out.

**Tourism.** EU nights in 2023 were 2.92bn, 1.6% above 2019, even without Russian guests
([Eurostat](https://ec.europa.eu/eurostat/fr/web/products-eurostat-news/w/ddn-20240116-1)). That supports a low default of 0.30.

**Shadow shipping.** Product-tanker recycling in 2023 was the lowest since 1996
([BIMCO](https://www.bimco.org/news-and-trends/market-reports/shipping-number-of-the-week/20240117-snow)). That is consistent with old
tankers being kept trading, but BIMCO gives strong earnings in general as the cause. The value stays a judgement.

## 2. `OWN_SHARE_DEFAULT`

Since flowback2.json, Kiel's item coding gives an own-industry share for 35 donors, so the default no longer applies to
the countries named in the brief:

| donor | own-industry share (Kiel item coding) |
|---|---|
| Netherlands | 0.17 |
| Denmark | 0.20 |
| Norway | 0.28 |
| Canada | 0.43 |
| Sweden | 0.64 |

The default now applies only to **Albania, North Macedonia and Montenegro**, about EUR 0.09bn of military aid in total.
All three gave Soviet-era stock and have little arms industry of their own. A middle of 0.4 is too high, so the proposal is
0 / 0.1 / 0.3 (judgement; the effect is under EUR 0.03bn). No national report gives these three countries' shares.

## 3. `LOAN_GRANT_ELEMENT` (cost view: what the lender gives up)

The value to Ukraine is already in `loans_value.json`, discounted at Ukraine's borrowing rate. The cost view needs the
**lender's** cost, so the same Kiel terms (maturity, grace, interest) are discounted at the lender's own funding rate:

- **EU loans** use the EU's reported cost of funding
  ([Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf)): Ukraine Facility 2.76%,
  MFA+ 3.15%.
- **Other lenders** use about 3%, and Japan about 0.5% (judgement).

Formula: lender's cost = 1 − PV(Ukraine's interest and principal × (1 − expected loss)).

| scenario | EU interest subsidy runs to | expected loss |
|---|---|---|
| low | 2027 | 0 |
| central | 2034 | 10% |
| high | the loan's life | 25% |

The expected loss is a judgement: Ukraine cut the face value of its private Eurobonds by 37% in 2024 but has kept paying
official creditors.

| class | face (EUR bn) | lender's cost, low / central / high |
|---|---|---|
| EU Ukraine Facility | 25.6 | 0.03 / 0.29 / 0.59 |
| EU MFA+ 2023 | 18.0 | 0.14 / 0.37 / 0.62 |
| IBRD loans enabled by guarantees | 14.2 | 0.00 / 0.05 / 0.20 |
| EU Ukraine Support Loan | 11.6 | 0.80 / 0.95 / 1.00 |
| guarantees for lending to firms | 8.5 | 0.05 / 0.15 / 0.30 |
| EU exceptional MFA 2022 (EUR 5bn) | 5.0 | 0.13 / 0.35 / 0.54 |
| Canada (IMF account, 2023) | 3.2 | 0.11 / 0.19 / 0.33 |
| EIB, EU MFA 2022 without subsidy | 5.3 | 0.00 / 0.10 / 0.25 |
| **all 140 items** | 96.5 | **0.15 / 0.32 / 0.52** |
| without the USL defence window (booked as military) | 88.1 | **0.09 / 0.26 / 0.47** |

The old 0.3 is close to the central value, so the data mostly add a range. One case is far off: Japan's
EUR 9.6bn of IBRD guarantees cost Japan about 0.05 of face, not 0.3. Using the cost per class would fix that.

## 4. `META.tariff_rate`

| waiver | official figure | implied rate |
|---|---|---|
| EU, 2022 proposal | below EUR 31m customs + EUR 34.6m anti-dumping a year, at 2021 volumes ([OEIL 1702126](https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1702126)) | 65.6 / 25,070 = 0.26% |
| EU, 2023 renewal | EUR 33.4m + below EUR 15m = 48.4m ([OEIL 1734705](https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1734705)) | 0.19% |
| UK | only 1.4% of imports from Ukraine (about GBP 8m a year) still carried duty before May 2022 ([EM to SI 2022/525](https://www.legislation.gov.uk/uksi/2022/525/pdfs/uksiem_20220525_en.pdf), para 12.4) | 1.4% × 10–30% assumed duty = 0.14–0.42% |
| Canada | CAD 7.5m remitted June 2022–May 2023, CAD 9.5m to February 2026 ([SOR/2023-121](https://gazette.gc.ca/rp-pr/p2/2023/2023-06-21/html/sor-dors121-eng.html), [SOR/2026-95](https://gazette.gc.ca/rp-pr/p2/2026/2026-06-17/html/sor-dors95-eng.html)) | about 3.3% in the first year, about 0.3% after, 1.1% overall |

EU purchases from Ukraine in 2021 were EUR 25.07bn (`site/data.json`). For Canada, about EUR 6.6m of remitted duties (CAD 9.5m at roughly 1.45 CAD/EUR)
falls against EUR 0.62bn of purchases from Ukraine over the same months.

- **EU timing.** The EU waiver ran only from 4 June 2022 to 5 June 2025. The revised DCFTA (in force 29 October 2025) is a
  permanent agreement, not a war waiver.
- **Who pays.** About 75% of EU customs revenue goes to the EU budget, so the EU part could be shared by EU budget share
  rather than by each member's purchases from Ukraine.
- **The EU high end.** It is a judgement. Duties on the 2022–24 surge volumes (sugar, wheat, poultry) would be much larger,
  but at those duties the goods would not have come, so they are not revenue given up.
- **What is missing.** No ex-post Commission figure for the duties actually waived was found.

## 5. `EU_ARMS_SLICE`

Kiel Release 31 records **EUR 8.874bn** of EU-level military aid, all dated 2026:

| item | EUR bn | share | where the money goes |
|---|---|---|---|
| JAS 39 Gripen (contractor Saab AB) | 2.50 | 0.28 | Sweden |
| drones (3.90 + 1.00 + 0.97) | 5.87 | about 0.72 together | Ukraine's own industry |
| Ukraine Investment Framework (dual-use and defence industry) | 0.50 | | Ukraine's own industry |

- **Drones.** The 3.9bn tranche is for "Ukrainian drones"
  ([Government of Ukraine](https://www.kmu.gov.ua/en/news/yuliia-svyrydenko-ukraina-otrymala-vid-ies-38-mlrd-ievro-na-oboronnu-pidtrymku)).
  The other two tranches may buy from EEA/EFTA countries or Ukraine.
- **The European Peace Facility** reimburses members for donated stock. Kiel credits that to the donors, so it is not in
  the EU row. Its joint-procurement contractors are not public: the EDA withheld them
  ([Breaking Defense](https://breakingdefense.com/2023/09/european-defence-agency-signs-first-set-of-joint-ammunition-procurement-contracts/)).
- **SIPRI production shares** describe where arms are made, but none of these items went to French, German or Italian
  industry.

**Proposal**, as a share of EU-level military aid, with the 0.78 factor set to 1:
- Sweden 0.28.
- All other members together 0.03 (0–0.10, judgement), split by the
  [ASAP 2024 award](https://defence-industry-space.ec.europa.eu/document/download/9d7b317f-5220-4e37-8f87-982f43b668b1_en?filename=07%2006%202024%20ASAP%20Award%20Decisions.pdf)
  grant shares: DEU 0.31, FRA 0.20, ITA 0.11, GRC 0.08, FIN 0.08, HUN 0.06, ESP 0.06, SWE 0.045, CZE 0.035, BEL 0.02.
- The rest stays in Ukraine.

The code should also put it all in 2026, instead of spreading it over 2022–2026 by the EU's total aid profile.

Effect, central (EUR bn):

| | old | new |
|---|---|---|
| France | 2.70 | 0.05 |
| Germany | 1.66 | 0.08 |
| Italy | 1.32 | 0.03 |
| Sweden | 0.42 | 2.50 |

## What has no public data

- An economy-wide share of lost 2022 Russia sales that was redirected.
- Displacement in shadow shipping.
- Own-industry shares for Albania, North Macedonia and Montenegro.
- EPF reimbursements by member state.
- EDA/EPF joint-procurement contractors.
- Ex-post EU duties waived in 2022–2025, and a UK figure after 2022.
