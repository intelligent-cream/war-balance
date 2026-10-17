# Research process

Certainty A and B numbers come from importers. Certainty **C and D** numbers come from research,
written down as **estimate cards** (see 03-data-model.md) and reviewed like code.

## Research topics (initial backlog)

| topic | side | method | certainty |
|-------|------|--------|-----------|
| Military support from North Korea (shells, missiles, troops) | RUS | quantity × unit price, troop count × cost per soldier-year | D |
| Military support from Iran (drones, technology transfer) | RUS | quantity × price + lump-sum range for licences | D |
| Belarus (territory, production, logistics) | RUS | fixed range | D |
| Undisclosed military aid to Ukraine, per donor | UKR | Oryx counts × unit price, minus what Kiel already lists | C–D |
| Laundered oil per buying country | RUS | refinery share × product imports | C |
| Excess trade and re-exports (China, Turkey, Central Asia, Caucasus, UAE) | RUS | excess over baseline, dual-use groups | C |
| Hidden payment channels per country | RUS | mirror-trade gaps, gold, crypto, capped by Bank of Russia errors and omissions | D |
| Switching cost per country | UKR | volume replaced × price difference | C |
| Volunteers for Ukraine, recruited fighters for Russia | both | counts from multiple reports | D |
| Company taxes paid in Russia (gaps in KSE data) | RUS | revenue share × effective tax rate | C |

## Workflow

```
1. Open issue     → template "Research: <topic>", names the question and the method
2. Collect        → evidence items in research/evidence/ (LLM-assisted search allowed, see below)
3. Estimate       → estimate card in research/estimates/, status: draft
4. Review         → pull request; a second person checks with the checklist below; status: reviewed
5. Publish        → next data build picks up reviewed cards
6. Revisit        → `next_review` date; D cards every quarter, C cards with each data refresh
```

### Evidence rules
- Every evidence item has an **archived copy** (web.archive.org or archive.today) and the **exact quote** that supports the number.
- Publisher tiers: 1 official government or international body, 2 research institute, 3 established media, 4 single source or belligerent source.
- A **D** estimate needs at least **two independent sources**, at least one of which is **not** from Ukraine's or Russia's government or military.
- A **C** estimate needs a documented method and data from at least one tier 1–2 source.
- Claims from either government at war are allowed as evidence, but are always flagged `belligerent_source: true` and never the only source.

### LLM-assisted collection
An agent (Claude via the API) can speed up step 2:
- Input: the research question and the evidence rules.
- It searches, reads, and writes **draft** evidence items (URL, archived URL, quote, date, publisher tier).
- It may propose an estimate card with ranges.
- It **cannot** set `status: reviewed`. A person verifies every quote against the archived page before review.

### Review checklist
- [ ] Every input traces to an evidence item; every quote is on the archived page.
- [ ] The range is wide enough to cover the sources' disagreements.
- [ ] No double counting with Kiel, CREA or another card (check `subcategory` and `period`).
- [ ] The wording on the site would be neutral and accurate.
- [ ] The same method is applied to comparable countries on both sides.

## Corrections

- A public "Report a correction" page with a contact address shown as text.
- Every correction gets an issue; accepted corrections update the card or the importer, and the site's changelog lists them.
- Companies and governments named on the site can send corrections in the same way; responses are logged.
