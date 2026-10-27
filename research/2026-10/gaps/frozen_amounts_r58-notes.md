# How much Russian money is frozen, and where (round 58)

Data: [`frozen_amounts_r58.json`](frozen_amounts_r58.json). Script: `research/2026-10/scripts/frozen_amounts_r58.py` (`fetch`, then `run`). Extracts: `research/2026-10/raw/frozen_amounts_r58/`. Gathered 2026-10-27. Not wired into the pipeline.

## Why this file exists

People search for the **amounts** frozen per country, for example "euroclear russian assets", "eingefrorene russische Vermögen", "avoirs russes gelés en Europe" and "belgium russian frozen assets". The site's "Russian money frozen" line counts something else: the **return Russia lost** on these assets, from [`frozen_assets.json`](frozen_assets.json) (round 7) and [`private_frozen_r39.json`](private_frozen_r39.json) (round 39). This file gives the stocks behind that line, so pages can show them as context. It reuses both earlier files and updates them where newer figures exist.

## The rule

- **A stock is not a loss.** The frozen amounts still belong to their Russian owners. On a page, an amount is "frozen" or "immobilised", never "lost", "seized", "taken" or a country's "gain". The site counts only the yearly return.
- **Official figure first.** `v` is the latest official figure, with its date and source. A government, EU institution, central bank or the holder itself counts as official. `lo`/`hi` give the range across sources.
- **No public figure means `v: null`.** An outside estimate goes in `est` and must be shown as an estimate. Nothing is invented.
- **Two kinds of asset, kept apart:**
  - `cbr_eur`: Bank of Russia reserves immobilised by the holding jurisdiction.
  - `private_eur`: assets of sanctioned persons and entities, including Russian state-owned banks.
  - Russian investors' securities blocked at Euroclear through the sanctioned depository NSD (EUR 55bn) are a third kind. They are shown separately for Belgium and are not in `private_eur`.
- **Currency.** Values are in EUR bn, converted at about the exchange rate of the figure's date. `native` keeps the original amount.

## Coverage

| Country | Central bank (EUR bn) | Date, source | Private (EUR bn) | Date, source |
|---|---|---|---|---|
| **Belgium** (Euroclear) | **185** (180–190) | Dec 2025, Commission | **10** sanctioned Russian banks (3.5–12); plus 55 NSD-blocked securities | Feb 2025, Belgian Treasury via OCCRP |
| France | **22.8** (18–22.8) | Mar 2022, Le Maire; 19 in later estimates | about 1.0 (0.9–1.3) | May 2026, LCP; 1.3 Commission 2022 |
| Luxembourg | **below EUR 10,000** (0–10) | Nov 2025, ministers | 5.5 (2.5–5.5) | Dec 2022, finance ministry |
| Germany | no official figure; est. 0.21 (0.1–0.5) | dpa Dec 2025: "small three-digit million" | 5.3 (2.2–5.3) | 2025, Welt am Sonntag |
| Italy | none | | 2.0 (1.8–2.3) | Jul 2023, UIF / Guardia di Finanza |
| Ireland | none | | 1.9 | Mar 2024, Dáil answer |
| Austria | none | | 1.5 (1.5–2.0) | 2024, DSN/OeNB |
| Cyprus | holder, no figure | | 1.2 (1.2–1.5) | Oct 2025 |
| Spain | none | | 1.0 (0.04–1.0) | Dec 2022, Commission (conflicts with 41m) |
| Netherlands | none | | 0.1 (peak 0.66) | Oct 2024, letter to parliament |
| Czechia | all state assets frozen (Nov 2023), no amount | | 0.35 (0.04–0.42) | 2023, FAÚ / finance ministry |
| Finland | none | | 0.19 | Jan 2023 |
| Latvia | none | | 0.15 | 2025 FIU report (Jun 2026) |
| Lithuania | none | | 0.10 (incl. Belarus) | Aug 2023 |
| Sweden | holder, no figure | | 0.04 | Feb 2022–Sep 2024, Police |
| Poland | none | | 0.03 (PLN 160m) | Mar 2022 |
| Estonia | none | | 0.02 | about Nov 2022, ERR |
| **United Kingdom** | no official figure; est. **~9** (GBP 8bn; range 9–26.6) | Dec 2025, The Times / FT | **33.9** (GBP 28.7bn; 26.6–33.9) | May 2025, OFSI Annual Review 2024-25 |
| **Switzerland** | **7.3** (CHF 6.8bn; to 7.9) | Jun 2026, SECO | **9.1** (CHF 8.5bn; from 7.8) | 1 Jun 2026, SECO |
| United States | **4.7** (USD 5.06bn; 4.3–4.7) | Sep 2023, REPO via Axios | no US figure | |
| **Japan** | not disclosed; est. **28** (20–40) | press, EPRS; Nikkei JPY 4–5tn in 2021 | none | |
| Canada | no figure (the CAD 22bn is Euroclear's) | | 0.11 frozen (to 0.41 incl. blocked transactions) | Nov 2025, RCMP |
| Australia | no figure (the AUD 7bn is Euroclear's) | | under 0.06 (AUD 100m) | DFAT |

**No public amount found** for either kind: Denmark, Norway, Portugal, Greece, Croatia, Slovenia, Slovakia, Hungary, Romania, Bulgaria, Malta, Singapore, South Korea, New Zealand, Iceland and Liechtenstein. The missing figure does not mean zero.

## Totals

- **EU, central bank:** about **EUR 210bn**: about 185 at Euroclear and about 25 in commercial banks (France, Germany, Sweden, Cyprus, Belgium). This is the Commission's figure, the basis of the reparations-loan proposal and of Regulation 2025/2600. The country rows add up to about 208.
- **EU, private:** "more than **EUR 28bn**" (Commission page, read 27 Oct 2026, undated). It was 18.9 in December 2022 and 24.1 in mid-2023. It does not include the EUR 55bn of NSD-blocked securities.
- **All sanctioning countries, central bank:**
  - **About USD 280bn**, mostly in the EU (REPO, 7 Sep 2023). This is the latest official total.
  - Experts and the Bank of Russia put it at USD 300–330bn.
  - The country rows here add up to about EUR 257bn, using the estimates for Japan and the UK.
- **All REPO members, private:** more than **USD 58bn** (March 2023). There is no later total.
- **Euroclear's own figure:** **EUR 202bn** of sanctioned Russian assets on its EUR 241bn balance sheet (30 Jun 2026).
  - The series: 86 (Sep 2022), 183 (Dec 2024), 193 (Sep 2025), 195 (Dec 2025), 200 (Mar 2026), 202 (Jun 2026).
  - This is cash, and it includes about EUR 13bn of private sanctioned cash.
  - It is the source of headlines like "Euroclear passes EUR 200bn". Never add it to the Commission's 185.

## Windfall, ERA and the reparations loan

**Windfall contribution** (Regulation 2024/1469, 21 May 2024)

- Euroclear pays the EU most of its net profit on the Bank of Russia's cash. The principal is not touched.
- Payments so far:

  | Date | EUR bn |
  |---|---|
  | Jul 2024 | 1.55 |
  | Spring 2025 | 2.1 |
  | Summer 2025 | 1.6 |
  | Early 2026 | 1.4 |
  | 3 Aug 2026 | 1.4 |
  | **Total** | **about 8** |

- **Use:** the first two tranches went 90% to the European Peace Facility and 10% to the Ukraine Facility. From the third tranche, 95% goes to the Ukraine Loan Cooperation Mechanism, which repays the ERA loans, and 5% to the EPF.
- The Commission counts EUR 3.8bn of its Ukraine support as "from the proceeds of Russian immobilised assets".
- Belgium also taxes Euroclear's Russia-related profit (about EUR 1.7bn for 2024) and has pledged that money to Ukraine.

**G7 ERA loans** (Apulia, June 2024): about USD 50bn (EUR 45bn), repaid from the windfall, not from the assets.

| Lender | Amount | About EUR bn |
|---|---|---|
| United States | USD 20bn | 18.3 |
| EU | EUR 18.1bn (Regulation 2024/2773) | 18.1 |
| Canada | CAD 5bn | 3.3 |
| United Kingdom | GBP 2.26bn | 2.6 |
| Japan | JPY 471.9bn | 1.6 |

- The EU's first EUR 3bn was paid on 10 Jan 2025.
- The pipeline already keeps ERA out of donors' aid.

**Reparations loan: proposed, not adopted**

- **The idea (Sep 2025):** EUR 140bn from Euroclear's cash balances.
- **The legal proposal (3 Dec 2025):** it would use up to EUR 210bn. The EU would borrow the cash, Euroclear would hold an interest-free claim on the EU instead, and Ukraine would repay only if Russia pays reparations. Member states would guarantee it. It is not a confiscation.
- **Belgium's role:** Euroclear holds about 185 of the 210, so Belgium carries most of the legal and retaliation risk. Belgian PM De Wever demanded shared liability, guarantees and the participation of the other holders. Italy, Malta, Bulgaria and, less openly, France backed his caution.
- **12 Dec 2025:** Regulation **2025/2600** (Art. 122 TFEU, qualified majority) bars any transfer back to Russia, with no six-monthly unanimous renewal. The Bank of Russia challenged it in the EU General Court (announced 27 Feb / 3 Mar 2026).
- **18–19 Dec 2025:** the European Council chose the **EUR 90bn Ukraine Support Loan** instead.
  - It covers 2026–27 and is funded by EU borrowing backed by budget headroom.
  - Ukraine repays only once it receives reparations.
  - The assets stay immobilised, and the Union "reserves its right" to use them to repay the loan.
  - Work on the reparations loan is to continue.
  - Czechia, Hungary and Slovakia are outside it (enhanced cooperation).
- **The loan in 2026:**
  - Regulation 2026/467 followed in February 2026.
  - The Council completed the legislation on 23 Apr 2026, after Hungary lifted its veto when Druzhba flows resumed.
  - The first EUR 3.2bn was paid on 25 Jun 2026.
  - EUR 19.8bn had been paid by late October 2026 (Commission page).
- **Moscow court ruling:** a Moscow court ruled for the Bank of Russia against Euroclear on 15 May 2026, and the appeal was rejected on 16 Jul 2026. The EU does not recognise this.
- **Since August 2026:** Sweden, the Netherlands, Poland and Spain have pushed to revive the reparations loan for 2027. The European Council of 15–16 Oct 2026 made no decision.

## Conflicts and how they are handled

1. **Luxembourg, central bank.** The government says "below EUR 10,000", while EPRS estimates EUR 10bn (range of several billion to 20bn). `v` is the official figure, with EPRS as the high end. Round 7 uses 2 (0–10) for the return line. Its effect is small either way, but **builder: consider lowering it**.
2. **UK, central bank.** No official figure exists.
   - Press reports of about GBP 8bn (about EUR 9bn) are the best evidence. EPRS's 26.6 probably counts Euroclear's sterling cash.
   - Round 7's guess of 10 (3–27) fits. The low end of 3 can rise to about 8.
   - The OFSI private figure (GBP 28.7bn) excludes sovereign assets, according to Euronews. Round 39 still flags this as "check".
3. **Switzerland, central bank.** SECO says CHF 6.8bn (June 2026), against 7.45 (April 2025). Round 7 holds 7.8–8.0 for 2025–26, about 0.5–0.7bn above the 2026 figure. The effect on the return is about EUR 0.01bn a year: negligible.
4. **France.** The only official figure is 22.8 (2022). Recent press gives 19 or 18. The government will not update it.
5. **Spain, private.** The Commission says 1.0 and Reynders said 41m. Neither is recent.
6. **Belgium, private.** The Commission's list (3.5) and the Treasury (65, of which 10 are sanctioned banks and 55 NSD securities) measure different things. Both are shown.
7. **EPRS country split.** It double counts Euroclear's cash in CAD, GBP and AUD as Canada, the UK and Australia. Do not use it for those three.
8. **Windfall tranche sizes** differ by rounding (1.5 or 1.55; 1.5 or 1.6). The EUR 8bn total fits both Euroclear and the Commission.
9. **Finland.** A press claim of "over EUR 4bn of Russian state assets" frozen in a Naftogaz enforcement case is unverified and is not a sanctions figure. It is not used.

## What pages can show, and how to phrase it

Usable lines:

- **Country page:** "About EUR X bn of the Russian central bank's reserves are immobilised here, and EUR Y bn of sanctioned Russians' assets are frozen (source, date)." Use the official `v` with its date. If `v` is null: "No official figure has been published" (plus "estimates: …" when `est` exists).
- **Belgium:** "About EUR 185bn of Bank of Russia reserves are immobilised at Euroclear in Brussels (European Commission, December 2025). Euroclear reports EUR 202bn of sanctioned Russian assets on its balance sheet (30 June 2026), mostly the central bank's cash."
- **EU:** "About EUR 210bn of Russian central bank assets are immobilised in the EU, and more than EUR 28bn of private assets of sanctioned people and companies are frozen (European Commission)."
- **Ownership:** "The assets still belong to their owners. Only the income is used: the EU's windfall contribution (about EUR 8bn since 2024), which repays the G7's USD 50bn ERA loans."
- **The loan:** "The EU's EUR 90bn loan for 2026–27 is funded by EU borrowing. Ukraine repays it only if Russia pays reparations, and the EU reserves the right to use the immobilised assets for that. A loan from the assets themselves (the 'reparations loan') was proposed but not adopted."
- **Link to the map:** "On this map the frozen amount is not counted. What counts is the return Russia could have earned on it (see 'Russian money frozen')."

Avoid:

- Calling the stock "lost" or a country's "gain".
- Adding Euroclear's 202 to the Commission's 185.
- Using the EPRS figures for Canada and the UK.
- Mixing the EUR 28bn (sanctioned persons) with the NSD securities.
- Saying the EUR 90bn loan is "funded by Russian assets".

## Doubts

- **Japan is the second-largest holder but publishes nothing.** The EUR 20–40bn rests on press, EPRS and a 2021 Nikkei figure.
- **No US private figure exists, and there has been no REPO update since 2023.**
- **Many EU private figures are from 2022–23:** France, Spain, Italy, Luxembourg, Poland, Lithuania and Estonia. The Commission has published no member split since December 2022.
- **Some figures were read only through search summaries or a browser-type fetch**, because the sites refuse automated downloads (HTTP 403/406). These are marked `"read": "summary"` in `sources`:
  - the Izvestia/SECO June 2026 figures;
  - Latvia's FIU report;
  - Sweden's police report;
  - the FT report of GBP 8bn;
  - the European Council conclusions of December 2025;
  - Regulation 2026/467.

  The Euroclear H1 2026 extract was made from the copy saved on 2026-10-23.
- **Euroclear's Q3 2026 results** were not found by 27 Oct 2026, and neither was an OFSI 2025-26 review.
- **ERA disbursement status** by lender (the US and Japan) was not checked in full.
- **Exchange rates** are rounded approximations near each figure's date. The CHF rate for mid-2026 is an assumption.
