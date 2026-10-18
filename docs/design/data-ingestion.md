# Data ingestion

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Every source is one module in `src/mft/sources/` with the same interface:

```python
class Source(Protocol):
    source_id: str
    def fetch(self) -> Snapshot: ...              # download, save raw file, record sha256
    def parse(self, snapshot: Snapshot) -> Iterable[Row]: ...   # map to our model, no business logic
```

Rules for every importer:
- Save the raw file **before** parsing. Never edit raw files.
- Parsing only maps columns. Currency conversion, de-duplication and estimates happen later.
- Unknown country names fail loudly (a mapping table in `src/mft/sources/country_names.csv`).
- One fixture file per source in `tests/fixtures/`, trimmed to a few rows.
- Check the licence before publishing derived data; cite the source on the website either way.

Access types below: **open download**, **open API**, **API key (free)**, **paid**, **manual** (copied by a researcher into an estimate card).

## Support for Ukraine

| source | access | refresh | what we take | maps to | certainty | watch out for |
|--------|--------|---------|--------------|---------|-----------|---------------|
| Kiel Institute, Ukraine Support Tracker | open download (xlsx) | every 2–3 months | each aid entry: donor, date, type, committed and allocated amount, loan or grant | `flow` military / financial / humanitarian, `loan_terms` where known | A–B | revisions to past rows; EU institutions are a separate donor; in-kind valuation method per row |
| Kiel refugee cost estimates | open download | with the tracker | hosting cost per country | `flow` refugees | B | method differs from national budgets |
| EU Commission (Ukraine Facility, MFA+, European Peace Facility) | open web pages / reports | monthly | EU-level disbursements | `flow` source `EU_INSTITUTIONS` | A | overlaps with Kiel; Kiel wins by priority |
| IMF programme documents | open download | per review (quarterly) | disbursements, terms | `flow` + `loan_terms` | A | IMF is an institution; not attributed to countries by default |
| World Bank projects API | open API | monthly | projects and donor trust funds for Ukraine | `flow` | A | donor money passed through World Bank funds is already in Kiel under the donor → dedupe |
| G7 ERA loans / frozen asset proceeds | manual from official statements | when announced | tranches, lender, repayment source | `flow` + `loan_terms (repaid_from = frozen_asset_proceeds)` | A | not the lender's own money |
| UNHCR refugee data | open API | monthly | refugees from Ukraine per host country | `people_count refugees_hosted` | A | registrations ≠ people still present |
| Eurostat / Comtrade imports from Ukraine × tariff rates (WTO, TARIC) | open API | monthly | customs revenue given up through tariff waivers | `flow` sanctions_trade, `subcategory = tariff_waiver` | C | needs the MFN rate per HS code |
| US DoD contract announcements, USAI and replenishment funding | open web | daily (we take monthly) | contracts for Ukraine and to refill donated stock, per company | `flow.delivered_by` (flowback) | A–B | refilling stock is flowback, not extra aid |
| National procurement announcements, NATO PURL, Czech ammunition initiative | manual | when announced | which country's aid bought what from which country | `flow.paid_by` + `delivered_by` | B | |
| Comtrade / Eurostat exports to Ukraine | open API | monthly | sales to Ukraine per country, against the 2021 level | `trade_baseline` (flowback) | B | military goods often missing from trade data |
| Volunteers for Ukraine | manual (estimate cards) | quarterly | counts per country | `people_count volunteers` | D | many claims come from belligerents |

## Money and support reaching Russia

| source | access | refresh | what we take | maps to | certainty | watch out for |
|--------|--------|---------|--------------|---------|-----------|---------------|
| CREA Russia Fossil Tracker | open download / API | daily (we take monthly) | fossil fuel payments per importing country and fuel | `flow` energy | B | estimates from shipping data; their method notes go on the site |
| UN Comtrade | API key (free tier, rate limited) | monthly, lagging | goods trade, both directions, with mirror data | `trade` | A–B | Russia stopped reporting; use partner reports (`is_mirror`) |
| Eurostat Comext | open bulk download | monthly | EU trade with Russia, Ukraine and Russia's neighbours | `trade` | A | fastest source for EU countries |
| Russian Ministry of Finance (oil and gas revenue, Urals price) | open web | monthly | budget revenue for the top-down check, Urals price for the state take | `state_take` input, checks | A | published in Russian; may be delayed or stopped |
| KSE Institute oil and shadow fleet reports | open reports | monthly | price-cap compliance, discounts, state take | `state_take` input | B | |
| CREA refinery reports (refining loophole) | open reports | irregular | Russian crude share per refinery, product exports per destination | `laundered_oil` input | C | refinery shares change; Kpler/Vortexa (paid) would be better |
| KSE "Leave Russia" + Russian accounting filings | open download | yearly | per foreign company: revenue, profit, taxes paid in Russia | `flow` company_tax, `actor` | B | filings arrive about a year late |
| Yale CELI list | open web | irregular | exit status | `actor.exit_status` | B | status only |
| Bank of Russia balance of payments | open download | quarterly | errors and omissions, unexplained flows | upper bound for hidden channels | B (total) / D (per country) | totals only |
| Gold and crypto flow reports | manual | quarterly | per-country gold exports, blockchain-analysis reports | `flow` hidden | D | |
| Military support to Russia (DPRK, Iran, Belarus) | manual | quarterly | quantities, unit prices, troops | `flow` military_inkind, `people_count` | D | see research-process.md |

## Supporting data

| source | access | refresh | used for |
|--------|--------|---------|----------|
| ECB Data Portal (SDW) | open API | monthly | FX rates to EUR |
| Eurostat HICP | open API | monthly | constant 2022 euros |
| World Bank WDI | open API | yearly | population, GDP |
| World Bank commodity prices ("Pink Sheet") | open download | monthly | Brent, natural gas Europe (TTF), LNG Asia, coal; switching cost |
| Eurostat energy imports by partner | open API | monthly | volumes replaced after 2022, for switching cost |
| HS code groupings | our own CSV | when needed | `hs_group`, including the EU/US "Common High Priority" list |

## Method notes

**De-duplication priority** (lower wins): Kiel 1, EU Commission 2, World Bank 3, national announcements 4.
Two rows are the same flow when donor, target, category, month and amount (±2 %) match, or when Kiel names the same package.

**State take** (oil): `payment × (mineral extraction tax + export duty share at that month's Urals price)`. Gas and coal use fixed shares from the tax code, reviewed yearly.

**Switching cost** (energy, per country and fuel):
```
volume_replaced   = baseline 2021 volume from Russia − actual volume from Russia
switching_cost    = volume_replaced × (price paid for the alternative − estimated Russian contract price)
```
Gas uses the TTF spot price vs estimated pipeline contract prices; oil uses Brent vs Urals before the price cap.
Shown as a range (low / central / high) with certainty C.

**Excess trade**: a linear trend over 2017–2021 per reporter × partner × HS group, projected forward.
For Russia's neighbours, only the excess that matches Russia's import needs (dual-use HS groups) is counted as re-export to Russia.
