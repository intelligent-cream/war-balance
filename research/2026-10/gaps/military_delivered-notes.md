# Military aid counted when delivered, not when allocated (round 24b)

Data: [`military_delivered.json`](military_delivered.json), written by `pipeline/military_delivered.py` from the Kiel R31 workbook in [`raw/kiel/`](../raw/kiel/); applied in `pipeline/build_data.py` `apply_military_delivered()`.

**Decision (the owner, 22 October 2026, audit 24 D M4):** every donor's military aid counts as delivered by 31 August 2026 (the lead times below; USAI calibrated to the DoD's 57% by March 2026), Kiel's full allocation as the high end of support, the slow lead times as the low end. The EU Support Loan's military part is spread to members by their EU share. **Germany:** its own cash payments to March 2025 (€15.07bn) exceed Kiel's German procurement allocations then (€8.3bn), so the smaller (fast-delivery) cut is central and the central cut the low end. The money a donor spends at home (flowback "own") follows delivery. **Read only via the press:** Kiel's 8 October 2026 Germany analysis (Börsen-Zeitung) and the DoD USAI figures (Militarnyi, Legis1); the Lead IG report and CRS IF12040 were not reached.

## What the data can and cannot tell us
- **Kiel does not publish delivered value per donor.** The R31 main sheet has `tot_value_deliv_EUR` and `item_numb_deliv`, but only for rows with a delivery source (US: €8.6bn of €64.6bn; Germany: €12.1bn of €25.0bn). Those rows show 95–100% delivered, which is a selection effect: a row gets a delivery source *because* it was delivered. They cannot stand for the rest of the allocation.
- **Kiel unit counts (sheet `Fig A4. Weapon Delivery`)** show the lag for heavy items. For example, US tanks 76 allocated vs 22.5 delivered, German 155mm howitzers 110 vs 34, French 69 vs 36, Italian 76 vs 46, Danish tanks 94 vs 67. That covers units only, not value.
- **The one hard delivered-value series is the US USAI.** The DoD (Lead IG quarterly report on Operation Atlantic Resolve, Q1 2026, 18 May 2026) reports USD 19.21bn of USD 33.51bn USAI transferred by March 2026 (57%), with USD 13.49bn still on order ([Militarnyi](https://militarnyi.com/en/news/ukraine-8-2-billion-usai-october-march/)). Legis1 summarises the DoD estimate as 57.3% as of August 2026 ([Legis1, 3 Sep 2026](https://legis1.com/news/ukraine-aid-delivery-us-committed-682b-to-only-57)). The previous quarter's figure was about 33% (Oct 2025), so the series is lumpy.
- **Germany's own total, Kiel's reading.** Kiel's 8 Oct 2026 analysis of Germany's €100bn says the €57.6bn military figure includes **€22bn of future commitments and commitment authorisations** (Verpflichtungsermächtigungen). It is unclear how much of the 2026 tranches has flowed, because Berlin has published no detail since mid-2025 ([Börsen-Zeitung, 8 Oct 2026](https://www.boersen-zeitung.de/konjunktur-politik/deutsche-ukrainehilfe-weniger-generoes-als-von-berlin-deklariert)). Kiel's own R31 German allocation (€25.0bn at item prices) does not contain those €22bn, so the model is not exposed to that part.
- **Cross-check for Germany.** The government's list *Bilaterale Unterstützungsleistungen* (Stand 31.03.2025, p. 6) says the BMVg's €15.07bn covers only cash actually paid out, and excludes Bundeswehr stock ([PDF](https://www.bundesregierung.de/resource/blob/975228/2201464/5f307970470d06878af4f84fff956613e84/liste-ukr-bilaterale-hilfe-data.pdf?download=1)). Kiel's non-stock German allocations up to that date total only €8.3bn. So Kiel is **not** running ahead of German payments. Payment is still not delivery (there are advances), so this bounds the German correction rather than removing it. The newer list (€100.9bn at 30 Jun 2026, cited in [BT-Drs. 21/8052](https://dserver.bundestag.de/btd/21/080/2108052.pdf)) could not be fetched; the government's answer is still pending.

## Proposed rule (exact)
For every donor, the military part counted up to date T (31 Aug 2026, or the slider year end) is:

`delivered(T) = Σ_rows value × clip((T − start)/L, 0, 1)`

- `start` is the later of the announcement date and 1 January of the first `earmarked_year`.
- Rows earmarked for 2027 and later count 0.
- `L` is the delivery lead time in years, low/central/high, set by channel:

| channel (Kiel fields) | L central | L range | evidence |
|---|---|---|---|
| stock (`source_of_weapon` = stocks or blank) | 0.25 | 0.1–0.5 | drawdowns typically ship within weeks to months |
| NATO PURL (`channel`) | 0.5 | 0.25–1 | US stock bought by Europeans |
| procurement in Ukraine (Danish model; `procurement_location` Ukraine / "EEA; EFTA; Ukraine") | 1.0 | 0.5–2 | Danish-funded Bohdana howitzers were delivered "within months" ([Kyiv Independent](https://kyivindependent.com/ukraine-to-receive-18-denmark-funded-bohdana-artillery-units-within-months-copenhagen-says/)) |
| US USAI (explanation names USAI) | **4.5** | 3.75–5.5 | calibrated: the model gives 57.6% delivered by 31 Mar 2026 vs the DoD's 57%; the slow end gives 47% |
| other procurement (European industry) | 3.0 | 2–4.5 | judgement, between the Danish model and USAI; IRIS-T and Patriot orders run over several years |

- **Low/high of support.** The low end of support uses the slow L, and the high end uses Kiel's full allocation (L→0). That keeps today's figure as the top of the range.
- **Flowback.** "Own aid spent in its own economy" should be scaled by the same delivered share, so the correction is not counted twice in the other direction.
- **Money is unaffected.** Cash grants and loans (financial and humanitarian aid) are disbursements, so they need no correction.
- **The EU Ukraine Support Loan's military part.** Kiel allocates €8.87bn of it in 2026, and about €7.9bn is undelivered by August. It reaches members through `euaid`, so the correction there is the member's `eu_share` × the undelivered amount.

## Results (EUR bn, 2022 to Aug 2026; effect on "Support for Ukraine" in points of one year's GDP)
| donor | Kiel military allocated | of which USAI/procurement | undelivered own (range) | + EU loan share | effect, central | support now → after |
|---|---|---|---|---|---|---|
| USA | 64.6 | 30.8 USAI | 10.2 (6.6–14.0) | – | −0.04 | 0.35 → 0.31 |
| Germany | 25.0 | 14.7 proc + 2.6 UA | 6.5 (4.3–10.4) | 1.8 | −0.20 | 1.57 → 1.37 |
| UK | 16.1 | 6.8 + 1.3 | 3.5 (1.8–5.4) | – | −0.11 | 0.54 → 0.43 |
| Denmark | 10.5 | 6.6 + 1.5 | 2.4 (1.4–4.2) | 0.2 | **−0.69** | 3.49 → 2.81 |
| Netherlands | 9.3 | 2.6 + 1.3 | 1.0 (0.2–2.1) | 0.4 | −0.13 | 2.12 → 1.99 |
| Sweden | 9.3 | 3.6 | 2.0 (1.3–2.9) | 0.3 | −0.42 | 2.01 → 1.59 |
| Norway | 7.5 | 3.3 | 2.0 (1.2–3.3) | – | −0.40 | 2.71 → 2.30 |
| France | 6.2 | 3.2 | 1.5 (0.8–2.0) | 1.5 | −0.11 | 0.68 → 0.57 |
| Canada | 5.6 | 3.1 | 1.3 (1.0–1.9) | – | −0.06 | 0.40 → 0.34 |
| Poland | 4.5 | 0.8 | 0.3 | 0.3 | −0.08 | 1.29 → 1.21 |
| Finland | 3.3 | 0.4 | 0.3 | 0.15 | −0.15 | 1.80 → 1.65 |
| Belgium | 2.8 | 1.5 | 0.7 | 0.3 | −0.17 | 0.94 → 0.77 |
| Baltic states | 0.7–1.2 | small | ≤0.1 | ≤0.03 | −0.16 to −0.32 | e.g. Latvia 1.57 → 1.25 |

The full table for 30 donors is in the JSON (`donors`). The effect on the net is the same number of points.

## Expected effect and reading
- **Biggest movers in points:** Denmark (−0.7), Sweden and Norway (−0.4), and the Baltic states (−0.2 to −0.3). These donors switched early to procurement (Danish model, Nordic packages for 2025–26).
- **Biggest in euros:** the US (−€10bn, −0.04 points) and Germany (−€8.3bn including its EU-loan share, −0.20 points).
- **Rankings:** no sign changes. Denmark could fall below Estonia and Lithuania in support.
- **Timing, not loss:** this is a shift in time. Undelivered contracts still arrive after August 2026, so the year slider beyond 2026 (if ever added) gets them back.

## Confidence
- **Medium for the US:** calibrated on DoD data.
- **Low to medium for Europe:** the lead times are judged. The German cash cross-check suggests Kiel may *understate* German money, so the German central could be too large a cut.
- **Option for the owner:** apply the correction in the central figure only for USAI and the EU Support Loan (both documented), and put the full per-donor model in the method band as "deliveries only".

## Open questions
1. Central for all donors, or USAI and EU loan only, with the rest in the band?
2. Get the government's answer to BT-Drs. 21/8052 (Germany's Ist-Ausgaben for Titel 687 06 / 687 03 by year). It would give the German cash series to 2026.
3. Should Kiel's "unknown source" rows (US €6.2bn, Germany €2.9bn) count as stock (as here) or follow the donor's mix?
