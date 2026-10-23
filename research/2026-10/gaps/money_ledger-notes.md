# All-money ledger and stock replacement (round 6, steps A1 and A2)

Data file: `money_ledger.json` (same folder). Generated 2026-10-18. **Not yet reviewed by a person.**
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## 1. What this is

The map's new rule ([roadmap Round 6 A](https://intelligent-cream.github.io/follow-the-money-ukraine/#view=how)) gives every country a balance **with Ukraine**: what it gave,
minus what it earned from the war effort. To know what a country earned we first need to know **where every euro that reached
Ukraine was actually spent**. This file is that ledger.

- **A1, the ledger.** Every euro that reached Ukraine from 24 Jan 2022 to 31 Aug 2026, from every source, assigned **once** to
  (a) what it paid for and (b) the economy where it was spent (the seller's country).
- **A2, stock replacement.** Purchases donors made to **replace** weapons they gave Ukraine, counted only where a government or
  contract says so explicitly, only up to the value given, and only what was paid by Aug 2026. By buyer, seller and year.

All values are **gross** (revenue to the seller, not profit), EUR bn, nominal, 2026 = Jan–Aug. USD at ECB yearly averages
(2022 1.053, 2023 1.081, 2024 1.082, 2025 1.13, 2026 1.16). Turning gross sales into "value kept" and "genuinely extra" is
steps A3/A4, not this file.

## 2. Sources of money and data used

| Source line | Data | Total EUR bn |
|---|---|---|
| Bilateral government aid (military, financial, humanitarian) | Kiel Ukraine Support Tracker R31, all 5,587 allocation rows, item level ([workbook](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx)) | 257.3 |
| Undisclosed military aid beyond Kiel | `uncovered.json` | 4.5 |
| EU institutions incl. EIB (not ERA) | Kiel "EU (Commission and Council)" and EIB rows | 81.7 |
| G7 ERA loans (US 18.3, EU 18.1, Canada 3.3, UK 2.65, Japan 1.6) | Kiel ERA rows | 43.9 |
| IMF purchases, World Bank own-risk, EBRD own-risk, CEB | World Bank IDS, Government of Ukraine, EBRD (via `loans_value-notes.md`) | 24.2 |
| Private donations (people, firms, foundations) | `uncovered.json` by giver country | 10.7 |
| Ukraine's own budget spent on arms abroad | seller lines of `ua_arms_purchases.json` paid by Ukraine | 14.6 |
| **Total** | | **436.9** |

Anchors for where money was spent:
- Kiel's item coding (`source_of_weapon`, `stock_location`, `procurement_location`, `channel`): EUR 90.5bn of procurement has a
  coded location; 25.6bn of procurement and 28.9bn of other military rows have none.
- [CSIS](https://www.csis.org/analysis/where-missing-100-billion-us-aid-ukraine): ~86–90% of US military aid was spent in the US.
- [CRS IF12040 (31 Aug 2026)](https://www.everycrsreport.com/files/2026-08-31_IF12040_b732b458ee1fe7527c3424284c4b36137ae2ee3f.html): PDA up to
  USD 31.7bn, USAI 33.5bn (57.3% delivered), replenishment 45.8bn, PURL 6.3bn announced / 4.8bn received, JUMPSTART ~2.8bn.
- Ukrainian Ministry of Finance on budget support ([Q1 2023](https://www.kmu.gov.ua/en/news/minfin-43-mlrd-dol-ssha-profinansovano-na-priorytetni-vydatky-i-kvartalu-2023-roku-v-ramkakh-proektu-svitovoho-banku-peace),
  [2022](https://www.kmu.gov.ua/en/news/inozemni-partnery-nadaly-ukraini-495-mlrd-hrn-u-2022-rotsi-na-zabezpechennia-priorytetnykh-vydatkiv-cherez-tsilovyi-fond-svitovoho-banku-peace)):
  social spending 61.5%, health salaries 15%, education 14.5%, rescuers 4.7%.
- `ua_arms_purchases.json`: Czech licence totals, initiative origins, Polish, Bulgarian, Romanian, Slovak sales to Ukraine.
- `flowback2.json`: each donor's domestic share `pu` for items with no coded seller; EU/EEA arms production shares.

## 3. How each euro was assigned

**Weapons (Kiel military rows).**
1. Coded procurement location → that country (split equally if several). The UK's Thales LMM missiles, coded "France", go to
   the UK (built in Belfast, as in flowback2).
2. NATO PURL and the US JUMPSTART mechanism → USA (paid to the US government).
3. Czech-led ammunition initiative → origin split from `ua_arms_purchases` (Czech licences 46%, BGR 13%, TUR 10.5%, ZAF 6%,
   SRB 5%, SVK, GRC, KOR 3% each, IND, BIH, PAK, unknown 4.5%). Initiative money that Kiel books without the initiative code
   (to reach EUR 1.9 / 2.4 / 0.8bn in 2024 / 2025 / 2026) is taken out of those donors' unlocated foreign purchases.
4. **Own stocks → "stock", not money spent.** A tank taken from a depot pays no one in 2022–26. If it is replaced, the
   replacement purchase is the spending (A2). EUR 71.8bn (Kiel value) is in this class, 33.9bn of it US drawdowns.
5. Procurement with no location → the donor's domestic share `pu` (flowback2), then Ukrainian producers (Kiel's trend:
   2% in 2022 rising to 25% in 2026), then a foreign pattern: half Kiel's coded third-country purchases, half EU/EEA arms
   production shares (D). US: 88% USA, 4% Ukraine, 8% abroad (Bulgaria, Serbia, Pakistan, Korea, Israel and others).
6. Rows with no source coded → split by the donor's own coded stock share.
7. EU Ukraine Support Loan drone tranches (EEA/EFTA/Ukraine origin rule): 75% Ukrainian producers, 25% EU/EEA industry;
   the Gripen tranche (EUR 2.5bn) → Sweden.
8. Czech sales are pinned to the Czech licence totals (CZK 12.8bn 2022 … 50.7bn 2025): what donors do not explain is paid by Ukraine.

**Money (financial rows).** Budget support, ERA loans, IMF and World Bank money → Ukraine's budget: pensions and social 60%,
public salaries (doctors, teachers, rescuers, officials) 37%, other 3%. Energy-tagged money → an energy equipment basket
(20% Ukraine; Germany, China, Türkiye, the US, Poland and others; D). EU investment guarantees and grants → investment (70% in
Ukraine). EIB → infrastructure (60% Ukraine). EBRD → private firms and towns in Ukraine; its energy loans partly buy gas and
equipment abroad. Poland's USD 1bn central-bank swap line was not spent ("liquidity").

**Humanitarian.** Cash to UN agencies and NGOs: 60% in Ukraine, 10% the donor's economy, the rest neighbours, the EU and
unknown (D). In-kind goods: 85% the donor's economy. Private donations: 55% Ukraine, 25% the givers' own economy, 10–20% China
(drones and parts bought by Ukrainian funds), 10% unknown (D).

**Ranges.** Each entry carries a certainty letter: A (Kiel coded seller, official) ±10%, B −20/+25%, C −40/+50%, D −65/+100%.
A seller's low/high add these up as if fully correlated, so ranges are wide on purpose.

## 4. Sources = uses (EUR bn, central)

| Use | 2022 | 2023 | 2024 | 2025 | 2026 | Total |
|---|---|---|---|---|---|---|
| Budget: pensions and social | 19.1 | 23.9 | 32.3 | 20.9 | 8.4 | 104.6 |
| Budget: public salaries | 11.8 | 14.7 | 19.9 | 12.9 | 5.2 | 64.5 |
| Budget: other | 1.0 | 1.2 | 1.6 | 1.0 | 0.4 | 5.2 |
| Weapons, new money: ammunition | 1.9 | 11.0 | 16.7 | 11.8 | 2.9 | 44.3 |
| Weapons, new money: heavy weapons | 6.8 | 6.5 | 4.9 | 3.7 | 1.1 | 23.1 |
| Weapons, new money: aviation and drones | 2.9 | 0.3 | 1.2 | 2.2 | 10.6 | 17.2 |
| Weapons, new money: air defence, missiles, light | 1.1 | 0.2 | 0.0 | 4.0 | 5.0 | 10.3 |
| Weapons, new money: equipment, services, unspecified | 3.9 | 8.3 | 9.3 | 14.6 | 5.6 | 41.7 |
| Weapons from donors' stocks (no new spending) | 27.2 | 23.7 | 14.5 | 4.3 | 2.0 | 71.8 |
| Energy | 1.4 | 1.8 | 3.1 | 3.0 | 2.6 | 12.0 |
| Reconstruction and investment | 3.0 | 1.4 | 3.3 | 7.4 | 1.8 | 16.9 |
| Humanitarian (official and private) | 13.2 | 5.1 | 2.8 | 2.0 | 1.2 | 24.2 |
| Liquidity, not spent | 0.9 | – | – | – | – | 0.9 |
| **Total = total sources** | | | | | | **436.9** |

Where the new money was spent: **Ukraine 219.6**, the payer's own economy 70.6, other economies 68.7, abroad with no known
seller 5.3 (the "residual"). Plus 71.8 of stock donations (spending only if replaced, A2) and 0.9 not spent. The residual is
mostly the unknown part of UN/NGO spending (2.7), private donations (1.1), the initiative's unnamed origins and US money abroad.

## 5. Results by seller economy (EUR bn, 2022 – Aug 2026, gross)

| Seller | total low / central / high | own aid | other donors | EU | multilat. | ERA | UKR budget | private | weapons | A2 replacement sales | cert. |
|---|---|---|---|---|---|---|---|---|---|---|---|
| UKR | 182.7 / 219.6 / 264.5 | – | 77.0 | 72.1 | 22.6 | 42.3 | – | 5.6 | 15.7 | – | A |
| USA | 38.8 / 48.5 / 61.2 | 30.3 | 16.5 | 0.04 | – | 0.19 | 0.95 | 0.64 | 47.2 | 21.8 (16.6–28.1) | B |
| DEU | 9.4 / 16.4 / 26.3 | 11.2 | 3.0 | 1.6 | 0.24 | 0.08 | – | 0.33 | 13.0 | 2.0 (1.2–3.4) | C |
| FRA | 4.5 / 10.1 / 18.2 | 5.0 | 3.3 | 1.5 | 0.16 | 0.11 | – | 0.03 | 8.4 | 0.09 | D |
| POL | 5.6 / 8.3 / 12.1 | 0.85 | 1.3 | 0.31 | 0.24 | – | 5.5 | 0.10 | 6.3 | – | B |
| SWE | 5.5 / 7.4 / 10.0 | 2.9 | 1.7 | 2.75 | – | 0.04 | – | 0.03 | 7.0 | 1.4 (0.65–2.8) | B |
| CZE | 4.9 / 7.1 / 10.0 | 0.31 | 5.0 | 0.16 | – | 0.10 | 1.5 | 0.03 | 6.8 | – | C |
| GBR | 5.2 / 6.9 / 8.9 | 5.6 | 0.16 | – | – | 0.89 | – | 0.20 | 6.5 | 0.8 (0.5–1.7) | C |
| BGR | 2.6 / 4.3 / 6.6 | – | 0.80 | – | – | 0.03 | 3.5 | 0.01 | 4.3 | – | C |
| ITA | 1.1 / 3.1 / 6.1 | 0.12 | 1.9 | 0.89 | – | 0.05 | – | 0.11 | 1.9 | – | D |
| NOR | 1.7 / 2.8 / 4.3 | 1.8 | 0.56 | 0.04 | 0.39 | – | – | 0.02 | 2.1 | 0.08 | C |
| TUR | 1.1 / 2.8 / 5.2 | – | 1.5 | 0.13 | – | 0.02 | 1.1 | – | 1.7 | – | D |
| NLD | 1.5 / 2.4 / 3.7 | 1.4 | 0.69 | 0.26 | – | – | – | 0.08 | 1.8 | – | C |
| CAN | 1.8 / 2.4 / 3.0 | 2.2 | 0.02 | – | – | – | – | 0.11 | 2.2 | – | B |
| CHN | 0.8 / 2.3 / 4.5 | – | 0.81 | 0.06 | – | – | – | 1.4 | 0.6 | – | D |
| DNK | 1.4 / 1.9 / 2.6 | 1.8 | 0.03 | 0.10 | – | – | – | 0.02 | 1.6 | – | C |
| FIN | 0.9 / 1.5 / 2.2 | 1.05 | 0.31 | 0.08 | – | – | – | 0.01 | 1.2 | 0.40 (0.25–0.65) | C |
| BEL | 0.8 / 1.5 / 2.5 | 0.86 | 0.47 | 0.15 | – | – | – | 0.03 | 1.2 | – | C |
| ESP | 0.6 / 1.4 / 2.5 | 0.34 | 0.50 | 0.42 | – | – | – | 0.08 | 0.6 | – | D |
| SVK | 0.7 / 1.3 / 2.0 | – | 0.46 | – | 0.08 | – | 0.70 | – | 1.2 | – | C |
| ROU | 0.7 / 1.2 / 1.9 | 0.10 | 0.02 | 0.08 | – | – | 1.0 | 0.04 | 1.0 | – | C |
| SRB | 0.3 / 0.7 / 1.3 | – | 0.33 | – | – | – | 0.39 | – | 0.7 | – | D |
| KOR | 0.3 / 0.6 / 1.1 | 0.11 | 0.40 | 0.02 | – | – | – | 0.09 | 0.2 | 1.6 (0.4–2.2) | D |

Year-by-year series, the weapons subtypes and the top paying donors per seller are in the JSON. The USA's sales to other
donors (16.5) were paid mainly by Germany 5.9 (Patriots), Norway 2.7, the Netherlands 1.8, Canada 1.4 and Denmark 1.1.

## 6. A2: stock replacement (paid by Aug 2026, EUR bn)

Total **29.0 (20.3–40.8)**. Only purchases a government or contract calls a replacement; capped at the donated value.

| Buyer → seller | central (low–high) | What | Cert. |
|---|---|---|---|
| USA → USA (+KOR, DEU, other 5%) | 19.3 (14.9–23.8) | Replenishment funds USD 39.3bn for USD 31.8bn of drawdowns ([DoD IG](https://www.dodig.mil/reports.html/Article/4274648/audit-of-controls-over-funds-provided-for-the-replenishment-of-defense-articles/)); capped at 31.8bn, 50–80% paid | B |
| POL → USA | 1.3 | 116 M1A1 Abrams, USD 1.4bn, "to restock" after 240+ T-72 ([Notes from Poland](https://notesfrompoland.com/2023/01/04/poland-approves-1-4-billion-deal-to-buy-116-abrams-tanks-from-us/)) | A |
| DEU → USA / DEU | 1.1 / 0.86 | 8 Patriot fire units (2× USD 1.2bn, ~40% paid), GEM-T USD 478m, 18 Leopard 2A8 (EUR 525m), PzH 2000; replacement value EUR 5.2bn ([Bundesregierung](https://www.bundesregierung.de/breg-de/themen/krieg-in-der-ukraine/lieferungen-ukraine-2054514), [Defense News](https://defensenews.com/land/2024/07/11/germany-buys-more-patriots-as-it-supplements-ukraines-air-defense)) | B |
| POL → KOR | 1.0 (0–1.4) | K2/K9 contracts "in part" replacing T-72, PT-91, Krab ([OODA](https://oodaloop.com/briefs/2022/07/27/poland-to-buy-hundreds-of-south-korean-tanks-howitzers-after-sending-arms-to-ukraine)) | D |
| SWE → SWE / DEU / other | 0.96 / 0.12 / 0.12 | Riksdag: donated materiel "re-acquired urgently" ([Prop. 2022/23:92](https://lagen.nu/prop/2022/23:92)); amount estimated | D |
| GBR → GBR / SWE / USA | 0.83 / 0.38 / 0.23 | NAO: ~GBP 1bn contracts, total GBP 2.71bn; Archer replaces AS90 ([DE&S](https://des.mod.uk/des-secures-archer-artillery-systems-to-replace-as90-for-british-army)) | C |
| DEU → DEU (Ringtausch) | 0.55 (0.35–0.8) | Leopard 2A4, Marder, trucks for CZE, SVK, GRC, SVN ([ESUT](https://esut.de/en/2022/08/meldungen/36153/leopard-2-a4-im-ringtausch-fuer-slowakei-und-tschechien/)) | C |
| FIN → FIN / KOR / USA / other | 0.4 / 0.12 / 0.12 / 0.16 | Supplementary budgets, authorities ~EUR 2.2bn to 2028 ([Government](https://valtioneuvosto.fi/en/-/government-submits-supplementary-budget-proposal-to-parliament-4)) | B |
| NLD → DEU / USA / other | 0.24 / 0.24 / 0.12 | Replacement value EUR 1.41bn, replaced "where necessary"; paid share estimated | D |
| NOR, DNK→ISR, FRA, ROU→USA, EST→KOR, SVK→USA | 0.08–0.2 each | Air defence missiles; 19 ATMOS for Caesars; 18 Caesar (EUR 85m); Patriot (capped at 0.36); K9 for FH-70; AH-1Z | B–D |

Searched, nothing explicit found: Italy, Spain, Belgium, Canada, Lithuania, Latvia, Portugal, Australia. They get no
replacement, so their stock donations create no new spending in this ledger.

## 7. What is guessed (certainty D or wide)

- The foreign pattern for unlocated procurement (half Kiel-coded, half EU arms production) and Ukraine's share of it.
- The energy basket, the UN/NGO split, the private-donation split (China's share of crowdfunded drones).
- The initiative origin split (from press reports; no government publishes it).
- A2 paid shares (Sweden, the Netherlands, Poland's K2/K9 share, Germany's Patriot payments before 2027 deliveries).
- France (D): most French aid has no coded source; `pu` 0.85 drives the result.

## 8. Overlaps and how the builder must use this

The ledger **does not add money**: the giving side (Kiel aid, `loans_value`, `weapons_value`, private and undisclosed aid in
`uncovered.json`) stays as it is. On the earning side it **replaces** three existing fields per country:

| Existing field (site/data.json) | Replace with (money_ledger.json) | Example, 2022–26 central |
|---|---|---|
| `flowback.own` (own share × own military aid, incl. own stocks × refill rate r) | `by_source_and_type['own_aid|weapons']` + replacement bought from itself | USA 56.9 → 29.9 + 18.4; DEU 12.0 → 11.9; GBR 8.4 → 6.3; ITA 1.8 → 0 |
| `flowback.purl_in` (USA: PURL; EU members: slice of EU military aid) | USA: inside `other_donors|weapons` (PURL 5.5, JUMPSTART 1.1, German Patriots 3.2 …); EU members: `EU|weapons` | FRA 2.7 → 0.7; ITA 1.3 → 0.35; SWE 0.4 → 2.6 (Gripen) |
| `flowback.arms` (ua_arms add_to_map, already net of customs) | `other_donors|weapons` + `UKR_budget|weapons` + `ERA|weapons` (+ `private|weapons`) **minus** `already_in_customs_trade_eur_bn` | CZE 6.8 → 6.4; BGR 5.0 → 4.3; POL 0.07 → 5.8 gross, almost all in customs |

Rules: (1) never add the ledger on top of these fields; (2) the ledger is gross, so keep netting customs-recorded arms exports
(`sell_ukr`) through `already_in_customs_trade_eur_bn` (Poland, Slovakia, Romania); (3) replacement purchases from **other**
countries (e.g. USA from Poland's Abrams, Korea from Poland and Finland) are new earnings for the seller; (4) the "other" type
(budget, energy, humanitarian, reconstruction spent in donor or third economies, e.g. DEU 3.4, CHN 1.6, TUR 1.1) has no field
yet; (5) Ukraine is the recipient, not an earner. Money is fungible: budget support is assigned to Ukraine's budget (first
round) and Ukraine's own foreign arms bill to "UKR budget", never both. EPF reimbursements (EU → member states for stocks given)
are transfers between donors, not money to Ukraine (memo). Refugee costs are not in the ledger.

## 9. Open questions

- Kiel allocations are dated when contracted; actual payments (e.g. USAI only 57% delivered) lag. A cash-timing version would
  move US and German money later.
- COARM per-state exports to Ukraine would firm up Czech, Polish, Bulgarian and Slovak lines.
- National replacement budgets for Sweden, the Netherlands and Norway (budget annexes) would replace estimates in A2.
- UNGM procurement statistics by supplier country would replace the UN/NGO split.
- Guarantees (EUR 22.5bn) are counted at face value as money lent by the IFIs against them; at economic value see `loans_value`.
