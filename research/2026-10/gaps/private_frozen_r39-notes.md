# Russian private assets frozen abroad, and western income blocked in Russia (round 39)

Data: [`private_frozen_r39.json`](private_frozen_r39.json). Gathered 2026-10-23.. Not wired into the pipeline.

This file answers item 3 of the round-39 Russia-side audit (private assets frozen abroad are missing) and item 5 (type-C balances are only partly covered). It extends [`frozen_assets.json`](frozen_assets.json), which counts only the Bank of Russia's reserves, and reuses its rates and its rule: the **return the owners would have earned without the freeze** is counted, not the frozen amount.

## The question

The map's "Russian money frozen" line counts the return Russia lost on its frozen central-bank reserves, about EUR 31bn over 2022 to August 2026. Private Russian money was frozen too. The project's "Russia" includes private profit and capital income, so the private part belongs on the same line, provided it is not counted twice. Three groups are involved:

1. **Assets of sanctioned people and companies**, frozen by national authorities: bank deposits, securities, company stakes, yachts and villas. Russian state banks and companies are included.
2. **Russian investors' securities blocked at Euroclear and Clearstream** after the EU listed Russia's central depository (NSD) in June 2022. Most of these investors are not sanctioned.
3. **The other direction: type-C balances.** Russia pays dividends, coupons and sale proceeds owed to "unfriendly" holders only into type-C accounts, which cannot leave Russia. This is a marker only.

## What we found

### The headline figures

- **EU, sanctioned persons and entities:**
  - EUR 18.9bn reported by member states at 16 December 2022. The member split was Belgium 3.5, Luxembourg 2.5, Italy 2.3, Germany 2.2, Ireland 1.8, Austria 1.8, France 1.3, Spain 1.0, other 2.5.
  - EUR 24.1bn by mid-2023.
  - **"More than EUR 28 billion of private assets in the EU frozen"** on the Commission's own page (checked: page updated 12 October 2026, no as-of date given).
  - The audit's "over EUR 28bn" is confirmed.
- **REPO task force:** more than USD 30bn of sanctioned Russians' assets blocked or frozen by June 2022, and **more than USD 58bn by 9 March 2023** (Treasury press release jy1329, checked). No later REPO total exists. The figure covers all members (US, UK, EU, Canada, Japan, Australia) and excludes central-bank assets.
- **Russian investors' securities blocked at the depositories:** the Bank of Russia estimated **RUB 5.7tn** at the end of November 2022 (Interfax, checked), just over 20% of it retail, about EUR 85–90bn at the time.
  - Nabiullina said about half had been unblocked by early 2025, with RUB 570bn in 2024 alone.
  - She later put the total unblocked since 2022 at RUB 5.3tn, with over RUB 400bn in 2025 (24 March 2026). That figure probably includes channels other than Euroclear and Clearstream, since it nearly equals the whole 2022 stock.

### By holding country (stock, EUR bn, central)

| Holder | 2022 | 2023 | 2024 | 2025 | 2026 | Basis | Cert. |
|---|---|---|---|---|---|---|---|
| Belgium, Euroclear (NSD securities + sanctioned Russian banks) | 50 | 58.7 | 62 | 65 | 60 | Belgian Treasury: 50 (Nov 2022, CBR separate); 58.7 "assets, mainly securities" beside 191.9 of blocked CBR transactions (2023); **65 in Feb 2025, of which 55 NSD securities and about 10 sanctioned Russian banks** (OCCRP) | C |
| Luxembourg, Clearstream (NSD securities) | 20 | 17 | 12 | 10 | 9 | RUB 5.7tn less Belgium, then about half unblocked; no Luxembourg figure published | D |
| United Kingdom | 18.7 | 16.1 | 26.6 | 26.9 | 26.5 | OFSI: GBP 18.39bn (to Oct 2022), 10.2bn (2023 review), **22.5bn (2024 review)**; in-year 25.03bn → **28.7bn (May 2025)** (OFSI Annual Review 2024-25, read in the PDF) | C |
| Switzerland | 7.0 | 6.8 | 6.9 | 7.9 | 8.9 | SECO: CHF 7.5bn (Dec 2022), 5.8bn (end-2023), **7.4bn (Apr 2025)**, **8.5bn (1 Jun 2026)**, kept separate from the Bank of Russia's CHF 6.8–7.45bn | B |
| Luxembourg, banks and funds | 4.3 | 5.0 | 5.0 | 5.0 | 5.0 | Finance ministry 2.5 (Mar 2022), 4.3 (Jun 2022), **5.5 (Dec 2022)**; the Commission list says 2.5 | C |
| United States | 4 | 5 | 5 | 5 | 5 | Not published; the REPO residual after the EU and UK is about USD 5–12bn for the US and Japan | D |
| Germany | 1.8 | 3.5 | 4.5 | 5.1 | 5.1 | 2.2 (Commission, 2022); **5.32bn in all (Finance Ministry, 2025)** less about 0.21 for the CBR | C |
| Italy | 2.0 | 2.3 | 2.4 | 2.4 | 2.4 | Guardia di Finanza over 1.7 (2022), Commission 2.3; mostly yachts and villas | C |
| Ireland | 1.7 | 1.9 | 1.9 | 1.9 | 1.9 | **Over 1.9bn (Dáil answers, Mar and May 2024)**; no CBR assets in Ireland | B |
| Austria | 1.6 | 1.9 | 1.6 | 1.5 | 1.5 | About 2bn at end-2022, then 1.5bn (DSN/OeNB) | B |
| Cyprus | 1.2 | 1.5 | 1.4 | 1.25 | 1.2 | 1.5 (Jan 2023); **1.3 (Jan 2025: 901m investment firms, 307m service providers, 90m other)**; 1.2 (Oct 2025) | B |
| France | 1.0 | 1.3 | 1.3 | 1.3 | 1.3 | Treasury 23.7 in all less 22.8 CBR (2022); 1.3 (Commission); mostly property | C |
| Spain | 0.5 | 0.8 | 0.8 | 0.8 | 0.8 | 41m (Reynders, Sep 2022) against 1.0bn (Commission, Dec 2022): the two do not reconcile | D |
| Netherlands | 0.6 | 0.6 | 0.35 | 0.1 | 0.1 | 660m frozen; **under 100m by Oct 2024** after 560m was released (letter to parliament) | B |
| Japan, Canada, Australia | 0.45 | 0.48 | 0.48 | 0.48 | 0.48 | Japan a guess (0.3); RCMP CAD 185m frozen (CAD 473m blocked transactions only in the high end); DFAT under AUD 100m | C/D |
| EU, not split | 1.5 | 2.5 | 3 | 3 | 3 | Commission total less the above; not assigned | D |

The national rows add up to about EUR 40–45bn in 2024–25. That is consistent with the EU's "more than 28bn" plus the UK and Switzerland, and with REPO's USD 58bn in 2023. The depository rows (about EUR 70bn in 2024) sit on top. They are not in the Commission's EUR 28bn: Belgium reported only 3.5bn of sanctioned persons' assets to the Commission while its Treasury held 59–65bn of frozen assets.

### The return lost (EUR bn, central; range for 2022–2026)

The rule is `stock × financial share × blended rate × year fraction`.

- **Rates:** the same per-currency short rates as the reserves (`frozen_assets.json`: EUR 0.4 / 3.3 / 3.5 / 2.2 / 2.0%; USD 2.2 / 5.1 / 5.0 / 4.2 / 3.7%; GBP, JPY, CAD and AUD as there). The Swiss franc is added here: 0.1 / 1.6 / 1.2 / 0.15 / 0.0%.
- **Financial share:** yachts, villas and art earn no money-market return. The share is 1.0 for the depositories, Switzerland (SECO counts financial assets only) and the Netherlands, about 0.95 for Ireland and Luxembourg, 0.8 for the UK, 0.75 for Germany, 0.5 for Spain, 0.4 for France and 0.35 for Italy.
- **Ranges:** the stock, share and rate errors are combined in quadrature, as for the reserves.

| Holder | 2022 | 2023 | 2024 | 2025 | 2026 | **2022–26** | Range |
|---|---|---|---|---|---|---|---|
| Belgium, Euroclear | 0.61 | 2.56 | 2.73 | 2.21 | 1.21 | **9.3** | 6.1–10.9 |
| United Kingdom | 0.23 | 0.60 | 1.02 | 0.84 | 0.49 | **3.2** | 1.8–5.1 |
| Luxembourg, Clearstream | 0.25 | 0.74 | 0.53 | 0.34 | 0.18 | **2.0** | 0.7–4.0 |
| Switzerland | 0.06 | 0.24 | 0.24 | 0.19 | 0.12 | **0.85** | 0.7–1.0 |
| United States | 0.06 | 0.22 | 0.21 | 0.18 | 0.10 | **0.8** | 0.1–1.9 |
| Luxembourg, banks | 0.04 | 0.19 | 0.19 | 0.14 | 0.08 | **0.65** | 0.3–0.8 |
| Germany | | | | | | **0.39** | 0.2–0.65 |
| Ireland | | | | | | **0.25** | 0.19–0.31 |
| Cyprus | | | | | | **0.17** | 0.13–0.23 |
| Austria | | | | | | **0.17** | 0.12–0.25 |
| Italy | | | | | | **0.10** | 0.04–0.23 |
| France, Spain, Netherlands, Japan, Canada, Australia | | | | | | **0.20** | 0.07–0.6 |
| **Total** | | | | | | **about 18** | 10.5–26 |
| of which the depositories | | | | | | 11.4 | 6.8–14.9 |

- **Size against the reserves:** about 60% of the reserves line (EUR 31bn). This fits the audit's guess of EUR 8–20bn.
- **What drives it:** Belgium's NSD securities. The national freezes alone come to about EUR 6.7bn.
- **The strict variant:** count only the return lost for good, which is the interest Euroclear and Clearstream keep on blocked cash (coupons and redemptions). Securities still in custody keep their own price and coupons, which are blocked rather than lost. The depository part then falls from 11.4 to about **EUR 1.6–2bn**. Euroclear's private sanctioned cash is about EUR 13bn: EUR 193bn of sanctioned Russian assets on its balance sheet against about 180bn for the Bank of Russia, according to its CEO in October 2025.
- **Which variant fits the existing rule:** the reserves line counts "return denied", blocked or lost. The central figure above follows that rule; the strict variant matches the reserves line's own "strict variant" for Belgium.

## Overlaps: what is not counted twice

1. **Bank of Russia reserves.** Every national figure used here is the authority's private figure, excluding the central bank:
   - SECO reports the two separately;
   - Belgium splits "frozen assets" from 191–193bn of "blocked transactions", which are the CBR's;
   - France is 23.7 less 22.8;
   - Germany is 5.32 less 0.21;
   - Ireland holds no CBR assets;
   - OFSI's figures are frozen assets of designated persons, and the Bank of Russia is under transaction prohibitions rather than designated for an asset freeze. **Check this.**
2. **Euroclear's windfall.** The EU windfall contribution (and so the ERA repayments) is levied only on income from Bank of Russia balances. The interest Euroclear earns on private sanctioned cash stays with Euroclear and is part of the return counted here, once.
   - **Belgian tax.** Belgium's corporate tax on Euroclear's Russia-related profit also covers that private cash. The pipeline already takes the whole tax (`BEL_EUROCLEAR_TAX`) off the reserves line, so nothing more is taken off here.
3. **Belgium's high end in `frozen_assets.json`.** The immobilised range for 2024 runs to 192. Above about 186 it would include private cash. Builder: cap it at 186, or accept at most about EUR 0.2–0.3bn a year of overlap in the high end only.
4. **Commission EUR 28bn against Belgium's Treasury.** Belgium's 3.5bn in the Commission list is taken to be inside the Treasury's 59–65bn. It is not added on top, and the "EU, not split" row is computed with Belgium at 3.5.
5. **Luxembourg.** The ministry's EUR 5.5bn may or may not include NSD positions at Clearstream; it does not say. The Clearstream row's low end (3–8) allows for some overlap. **Open.**
6. **`rusfirms` line** (profits of Russian-owned companies abroad). Trusteeships such as Rosneft Deutschland are not sanctions freezes and are not in Germany's 5.32bn. Lukoil International (US-sanctioned since October 2025) has frozen sale proceeds and dividends that could reach both lines from 2026. Check before wiring.
7. **The `seized` marker** is Russia taking western assets. Type-C balances are a different thing: blocked income, not seized companies. The `company_flows-notes.md` list of "trapped dividends... not counted" is what this marker fills.

## Method proposal for the pipeline

- **Line.** Join the existing **"Russian money frozen"** line, as a second component with its own key and source id: `add_extra(c, "frozen_priv", "Russian money frozen (return lost on private Russian assets)", ...)`, source id `frozen_private`, in the same `OWN_LINE` group.
  - It is added to the net only, like the reserves, and is not part of payments to Russia or of support for Ukraine.
  - The panel can show the two parts, reserves and private, under the one line; the line total is their sum.
  - Rename the line's label to "Russian money frozen (return Russia lost on frozen reserves and private assets)".
- **Side.** It is money Russia did not get, so it counts toward Ukraine, with the sign and band flip of `apply_frozen_reserves()`:

  ```
  low  = -high
  central = -central
  high = -low
  ```

  The low end is multiplied by 0.8 as for the reserves: without a freeze, owners would have moved or spent part of the money.
- **Host rule.**
  - The **depository part** (Euroclear and Clearstream NSD securities) follows the reserves: one third to the host, two thirds to EU members by their EU-aid share. The NSD listing is an EU decision and the depositories are only custodians.
  - **National freezes** (bank accounts, property) go wholly to the holding country, like France's or Switzerland's reserves.
  - This needs a `component` field: `csd` or `national`, already in the JSON.
  - Simpler alternative: spread everything Belgian and Luxembourgish, as the reserves code does by ISO3. That changes little: Belgium 3.42 instead of 3.40, Luxembourg 0.92 instead of 1.35.
- **Certainty letters.** Per row, in the JSON: B for Switzerland, Ireland, Austria, Cyprus and the Netherlands; C for Belgium's depository, the UK, Germany, Italy, France and Luxembourg's banks; D for Clearstream, the US, Japan, Spain and the EU, not split. On the map line, use the weakest of the reserves and private letters per country.
- **Years.** Use `sum3()` as for the reserves: the stock error is the same every year.
- **Code sketch:**

  ```
  apply_frozen_private(countries, src):
      load private_frozen_r39.json
      for each holding row: v = return_lost_eur_bn[y][b] × (0.8 if b == "low" else 1)
      csd rows: HOST_SHARE to the host, the rest by eu_share
      national rows: v to the host
      add_extra(..., "frozen_priv", ...)
  ```

  The unallocated EU block is left out, as in the reserves code.
- **Type-C.** Use `add_taken(c, "typec", "Income blocked in Russia (type-C accounts)", ...)`, with the same marker rules as `seized`: not in the totals, a square marker above 0.1% of GDP, columns marked "not in totals".
  - Value per year: `added_eur_bn`, the new money trapped that year, in the spirit of `seized`, which is booked in the year of loss.
  - The end-period stock goes in the panel text.

## Expected effect (2022 to August 2026, EUR bn, central; proposed host rule; low ×0.8)

GDP is the average 2022–2024 figure in `site/data.json`. "Today" is the existing reserves line, from `site/data.json`.

| # | Country | Private part | Range | % of GDP | Today (reserves) | Combined | Combined % of GDP |
|---|---|---|---|---|---|---|---|
| 1 | Belgium | **+3.40** | 1.8–4.0 | 0.57 | 7.39 | 10.8 | 1.81 |
| 2 | United Kingdom | **+3.17** | 1.5–5.1 | 0.10 | 1.82 | 5.0 | 0.16 |
| 3 | Germany | **+2.12** | 1.0–2.9 | 0.05 | 3.18 | 5.3 | 0.13 |
| 4 | France | **+1.52** | 0.7–2.1 | 0.05 | 5.04 | 6.6 | 0.23 |
| 5 | Luxembourg | **+1.35** | 0.4–2.2 | **1.66** | 0.13 | 1.5 | 1.81 |
| 6 | Italy | **+1.13** | 0.5–1.6 | 0.05 | 1.90 | 3.0 | 0.14 |
| 7 | Switzerland | **+0.85** | 0.5–1.0 | 0.10 | 1.14 | 2.0 | 0.23 |
| 8 | United States | **+0.78** | 0.1–1.9 | 0.003 | 0.84 | 1.6 | 0.006 |
| 9 | Spain | **+0.73** | 0.3–1.0 | 0.05 | 1.26 | 2.0 | 0.13 |
| 10 | Netherlands | **+0.41** | 0.2–0.5 | 0.04 | 0.66 | 1.1 | 0.10 |
| 11 | Ireland | **+0.39** | 0.2–0.5 | 0.07 | 0.26 | 0.66 | 0.12 |
| 12 | Austria | **+0.39** | 0.2–0.5 | 0.08 | 0.43 | 0.82 | 0.17 |
| 13 | Poland | **+0.30** | 0.1–0.4 | 0.04 | 0.56 | 0.86 | 0.11 |
| 14 | Sweden | **+0.25** | 0.1–0.3 | 0.05 | 0.46 | 0.72 | 0.13 |
| 15 | Cyprus | **+0.18** | 0.1–0.25 | **0.57** | 0.03 | 0.21 | 0.64 |

- **The total on the map** is about EUR 18bn (10.5–26), against about 27.5bn for the reserves after Belgium's tax.
- **Only Belgium, Luxembourg and Cyprus move by more than 0.5% of GDP.** Luxembourg moves because of its own EUR 5bn of bank freezes, and Cyprus because of investment firms.
- **The UK roughly triples its line** (0.16% of GDP in all).
- **Germany, France, Italy and Spain** gain mostly through the two-thirds EU spread of the Euroclear part.
- **The strict variant** for the depositories (about EUR 1.9bn instead of 11.4) cuts the EU spread by about 85%: Germany about 0.7, France 0.3, Italy 0.3. Belgium goes to about 0.6 and Luxembourg to 0.75; the UK and Switzerland do not change.

## Type-C balances (marker, not in totals)

### Size

- **The only official figure:** RUB 280bn+ (Bank of Russia, early November 2022). Interfax sources put it near RUB 0.6tn at end-2022.
- **Flows:** Sberbank's Dzhabarov (NAUFOR conference, May 2025) said Russian companies paid **RUB 1.4tn into type-C in 2022–2024** and that the largest dividend payers would add **RUB 704bn in 2025**.
- **The Deposit Insurance Agency's** deposited funds rose from RUB 19.7bn to 1.18tn in 2023. The Moscow Times links this to type-C; not confirmed.
- **Releases** have been small. Two asset-exchange rounds saw non-residents buy back only RUB 10.6bn.
- **Medvedev's "USD 300bn"** (December 2025) is not used: no source, and it is close to the whole stock of foreign direct investment.
- **Deposits:** decree 377/2026 (June 2026) brought foreign nationals' deposits into the regime; decree 550/2026 (August 2026) took most of them out again. Not included.

| End of | Stock, RUB tn | EUR bn (range) | Added in year, EUR bn | Interest Russia keeps at the key rate, EUR bn |
|---|---|---|---|---|
| 2022 | 0.6 | 7.9 (3.7–9.3) | 7.9 | 0.3 |
| 2023 | 1.1 | 11.1 (8.1–15.1) | 5.0 | 0.8 |
| 2024 | 1.6 | 15.1 (11.3–20.7) | 4.7 | 2.2 |
| 2025 | 2.4 | 26.1 (19.6–32.6) | 8.7 | 4.2 |
| Aug 2026 | 2.8 | 29.5 (21–38) | 4.2 | 2.8 |

The euro values use EUR/RUB of 75.7, 99.2, 106.1, 92 and 95. The 2025 and 2026 rates are approximations. The audit's "above RUB 1tn" is confirmed as of 2024.

### By owner country

Allocated by each "unfriendly" holder's end-2021 portfolio position in Russian securities, as equity + 0.5 × debt. The data are the IMF PIP (formerly CPIS), fetched from api.imf.org; there are USD 190bn of foreign holdings in all.

| Owner | Share | Stock Aug 2026, EUR bn | % of GDP |
|---|---|---|---|
| United States | 47% | 13.9 | 0.05 |
| Luxembourg (funds) | 11% | 3.3 | **4.0** |
| Ireland (funds) | 6.2% | 1.8 | 0.34 |
| United Kingdom | 6.2% | 1.8 | 0.06 |
| Germany | 3.8% | 1.1 | 0.03 |
| Netherlands | 2.9% | 0.85 | 0.08 |
| Cyprus | 2.7% | 0.8 | **2.4** |
| France | 2.3% | 0.67 | 0.02 |
| Cayman Islands | 2.2% | 0.63 | 9.4 |
| Switzerland | 2.1% | 0.6 | 0.07 |
| Japan | 2.0% | 0.6 | 0.02 |
| Norway | 2.0% | 0.59 | 0.12 |
| Canada | 1.8% | 0.54 | 0.03 |
| Austria | 1.8% | 0.52 | 0.11 |
| Australia | 1.3% | 0.37 | 0.02 |

The full list is in the JSON.

- **Cautions for this key:**
  - Luxembourg, Ireland and the Cayman Islands are fund domiciles, mostly for US and UK investors.
  - Cyprus's holdings are largely Russian round-tripping, so the "western" owner is often Russian.
  - Dividends to direct-investment parents (also type-C) are not in this key. For them, CDIS 2021 inward positions or company_flows' list would be the better key.
- **For the map,** only Luxembourg and Cyprus pass the 0.1% marker threshold by a margin, and both are misleading for these reasons. Show the marker with that caveat, or apply the key only to equity held outside fund domiciles.

## What is guessed

- **Clearstream** (no figure at all) and the **US** (a residual from REPO): both D.
- **The Belgian path** between Treasury figures, and its low end, which allows for the Bank of Russia's "half unblocked".
- **The UK** for 2022–23: OFSI's annual figures jump from GBP 18.4bn to 10.2bn to 22.5bn, with different methods each year.
- **Financial shares** for Italy, France, Spain and the UK.
- **Type-C stocks** after 2022, the 2025–26 exchange rates and the allocation key.

## Open questions

1. **Count the depository part as "return denied"** (central EUR 11.4bn) or only the lost-for-good interest on blocked cash (strict, about EUR 1.6–2bn)? Most of the gap is the EU spread. The reserves line uses "denied", so the default here is denied.
2. **NSD securities belong mostly to unsanctioned Russian retail and institutional investors.** It is Russia's capital income under the project's definition, but the owner may want only sanctioned persons' assets. Without the depositories the total is about EUR 6.7bn (Belgium 0.2, UK 3.2, Luxembourg 0.7, Switzerland 0.85).
3. **Host rule for the depositories:** one third to the host (proposed) or the whole of Belgium and Luxembourg spread, as the reserves code does today?
4. **Does OFSI's GBP 22.5bn include any Bank of Russia money or NSD-linked positions** at UK custodians? (OFSI mentions NSD-to-registrar transfers.) Also, why is the 2023 review figure (10.2) so far below 2022 and 2024?
5. **Luxembourg:** does the ministry's EUR 5.5bn include Clearstream's NSD positions? Is there a figure after 2022?
6. **No US figure is published.** OFAC's blocked-property reports for Russia are not public; ask Treasury or use the REPO residual.
7. **Type-C:** an official stock (the Bank of Russia stopped disclosing after November 2022), and the split between portfolio and direct-investment holders.
8. **Lukoil International** (US-sanctioned in 2025): frozen proceeds may need to go in from 2026, and checked against the `rusfirms` line.

## Sources

Every source is in `sources` in the JSON. The figures were checked as follows.

- **Read in the primary document or page:** the Commission page (EUR 28bn), US Treasury jy1329 (USD 58bn), the OFSI Annual Review 2024-25 PDF (GBP 22.5bn and 28.7bn), Interfax (RUB 5.7tn, type-C RUB 280bn and 0.6tn), and IMF PIP (fetched).
- **Read in press reports of official statements:** OCCRP (Belgian Treasury split), Izvestia (SECO, June 2026), Paperjam (Luxembourg), expert.ru (Nabiullina), smart-lab (Dzhabarov), the Oireachtas answers (Ireland) and DutchNews (the Netherlands).
- **From secondary summaries only:** the Euroclear CEO's 193/180 split (via Investfuture; the Euroclear site blocks automated reading), Germany's 5.32bn (via mind.ua, from Welt am Sonntag), Cyprus and Austria.
