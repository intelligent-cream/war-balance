# Germany's undisclosed military aid (round 39)

Data file: `deu_undisclosed_r39.json` (same folder). Generated 2026-10-23. **Not yet reviewed by a person.**

## What it replaces

`uncovered.json` → `undisclosed_aid.countries.DEU`, in the same shape. `build()` in `pipeline/build_data.py` reads it in the "flows researched last" block (about line 1201), under the `undisclosed` source.

The current value is EUR 1.8bn at certainty D: 0.3 in 2025 and 1.5 in Jan–Aug 2026.

## Finding

**Through 2024 there is no gap**, and this is official. The government's own totals are already in Kiel.

**2025–26: no official disbursement figure exists yet.**
- **The government list does not give one.** Its "Bilaterale Unterstützungsleistungen …" list changed format in 2026. The current version (Stand 30.06.2026, military about EUR 57.6bn) counts:
  - money "provided or set aside for the coming years";
  - the value of Bundeswehr stock deliveries;
  - training costs.

  The old format (Stand 31.03.2025) counted cash outflows only (BMVg EUR 15.07bn). The two cannot be differenced into 2026 outflows.
- **The Kiel Institute has no figure either.** Policy Brief 10/2026 gives EUR 22.7bn disbursed in 2022–25 and EUR 11.6bn appropriated for 2026. It says how much of the 2026 money has been paid "is unknown".
- **The Bundestag request that would settle it is unanswered.** Kleine Anfrage **21/8052** (18 Sep 2026), question 2, asks for actual outflows ("Ist-Ausgaben") by year for 2022–25 and to 30 June 2026. It asks by title: Einzelplan 60, Kapitel 6002, Titel 687 06 (Ertüchtigung of attacked states) and 687 03. The answer was not published by 23 Oct 2026. **When it appears, 2025 and 2026 can be replaced with B-grade figures.**
- **Other routes are closed.** The federal budget's data portal (bundeshaushalt.de) shows outturns by title, but it was behind a bot check from here. The BMF monthly reports do not break out the Ukraine titles.

## Values

| EUR bn | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) |
|---|---|---|---|---|---|
| current | 0 (0–0.2) | 0 (0–0.2) | 0 (0–0.3) | 0.3 (0–1.5) | 1.5 (0–4.0) |
| round 39 | unchanged | unchanged | unchanged | unchanged | **1.4 (0–3.5)** |

**2026 arithmetic:**
1. The appropriation is EUR 11.55bn. The final 2026 budget raised it by EUR 3bn from the EUR 8.5bn draft. The Foreign Office gives "about 12bn" including receipts.
2. Jan–Aug outflow = 11.55 × execution 0.8–1.0 × 8/12 = EUR 6.2–7.7bn.
3. Kiel R31 records EUR 5.45bn of German aid in Jan–Aug 2026, of which military is about 4.9–5.2bn.
4. The gap is 1.0–2.8bn. The central is 1.4 (execution 0.9).
5. The low stays 0. Germany pays multi-year contracts that Kiel books at contract or delivery, and some 2026 money pays for items Kiel dated in 2025.
6. The high is 3.5, down from 4.0. The old high assumed even spending with no execution shortfall.

**Effect:** −0.1bn central for Germany (about 0.002% of GDP). The grade stays **D**. It can become B once the answer to 21/8052 is published.

## Sources

- [Bundesregierung list, Stand 30.06.2026](https://www.bundesregierung.de/resource/blob/975228/2423058/b49e873efda519b0e6be3a12d1e306ee/2026-04-24-ukraine-unterstuetzung-data.pdf?download=1). The filename says 2026-04-24, but the document is dated 30.06.2026.
- [Bundesregierung list, Stand 31.03.2025](https://www.bundesregierung.de/resource/blob/975228/2201464/c03ec9d86f75e03dbec547ac4d5fcc99/liste-ukr-bilaterale-hilfe-data.pdf?download=1): the old cash-outflow format.
- [Drucksache 21/8052](https://dserver.bundestag.de/btd/21/080/2108052.pdf): the question. The answer is pending.
- [hib 277/2025](https://www.bundestag.de/presse/hib/kurzmeldungen-1098302): Einzelplan 60, 2025: EUR 8.3bn, plus commitment authorisations (VE) of 13.6bn.
- [Auswärtiges Amt, Haushalt 2026](https://www.auswaertiges-amt.de/de/aamt/haushalt-2283092).
- [Weltwoche, citing Handelsblatt](https://weltwoche.de/daily/bundesregierung-stockt-ukraine-hilfe-2026-auf-115-milliarden-euro-auf/): 11.55bn. This is press; the primary source is Haushaltsgesetz 2026, Einzelplan 60.
- [Kiel Policy Brief 10/2026](https://www.kielinstitut.de/media/news/ukraine-support-tracker-only-eur-417-billion-of-germanys-eur-100-billion-went-to-ukraine/).
