# Architecture

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

## Principles

1. **Reproducible.** Every published number can be rebuilt from saved raw files plus the estimate cards in this repo.
2. **Data changes are reviewed like code.** A data refresh opens a pull request with a report of what changed. Nothing goes live without a person merging it.
3. **Every number carries its source, method and certainty** all the way to the website.
4. **Boring, cheap tools.** Python, DuckDB, static files. No servers to run.

## Stack

| part | choice | why |
|------|--------|-----|
| language | Python 3.12, managed with `uv` | same as our other projects; good data libraries |
| data validation | Pydantic models | one definition of a flow, checked on the way in |
| storage | **DuckDB** file built from raw files | fast analysis in SQL, one file, no server |
| raw files | object storage (Cloudflare R2 or S3) + a checksum manifest in git | big files stay out of git; we can prove what we used |
| estimates | YAML **estimate cards** in `research/` | reviewed in pull requests, versioned, readable |
| automation | GitHub Actions on a schedule | weekly refresh, opens a data pull request |
| website | static site: TypeScript + Vite, D3 for the map and charts | static JSON in, hosting is free, works without a backend |
| hosting | Cloudflare Pages | works with a private repo, free tier is enough |
| quality | `ruff`, `pytest`, `pre-commit`, JSON Schema checks on estimate cards | runs locally (`setup.sh`) and in CI |

## Code layout

```
follow-the-money-ukraine/
├── setup.sh                     # uv sync + pre-commit install
├── pyproject.toml
├── src/mft/
│   ├── cli.py                   # `mft fetch | load | build | estimate | publish | validate`
│   ├── model/                   # Pydantic: Flow, LoanTerms, Company, Estimate, Evidence, PeopleCount
│   ├── sources/                 # one module per data source (see data-ingestion.md)
│   │   ├── base.py              # Source interface: fetch() → Snapshot, parse(Snapshot) → rows
│   │   ├── kiel.py  crea.py  comtrade.py  eurostat.py  kse_leave_russia.py
│   │   ├── unhcr.py  ecb_fx.py  worldbank.py  imf.py  eu_commission.py  energy_prices.py
│   │   └── ...
│   ├── transform/
│   │   ├── fx.py                # convert to EUR at the month's rate
│   │   ├── deflate.py           # constant 2022 euros
│   │   ├── dedupe.py            # EU vs member states, Kiel vs national, paid_by vs delivered_by
│   │   ├── baseline.py          # 2017–2021 trend per country × partner × HS group
│   │   ├── grant_equivalent.py  # loans and guarantees
│   │   ├── state_take.py        # share of oil and gas payments reaching the Russian budget
│   │   ├── switching_cost.py    # cost of not buying from / selling to Russia
│   │   └── laundered_oil.py     # refinery loophole
│   ├── estimates/               # loads YAML estimate cards, propagates low/central/high
│   ├── analysis/                # aggregates per country × category × year, trends, per person, % of GDP
│   └── publish/
│       ├── site_data.py         # writes site/public/data/*.json
│       └── diff_report.py       # "what changed since last release", posted in the data pull request
├── research/
│   ├── estimates/*.yaml         # estimate cards (certainty C and D)
│   ├── evidence/*.yaml          # evidence items with archived links
│   └── schema/                  # JSON Schemas for both
├── data/                        # gitignored: raw/, warehouse.duckdb, exports/
├── tests/
│   ├── fixtures/                # small real samples of each source file
│   └── ...
├── site/                        # the map website
└── docs/
```

## Pipeline stages

```
fetch ──▶ load ──▶ transform ──▶ estimate ──▶ analyse ──▶ publish
 raw       flows     EUR, dedupe,    YAML cards     per country,    JSON for the site,
 files     table     baselines,      → rows with    category,       Parquet/CSV download,
                     grant equiv.    ranges         year            diff report
```

| stage | input | output | notes |
|-------|-------|--------|-------|
| `fetch` | source URL / API | `data/raw/<source>/<date>/…` + manifest line (sha256, size, url, time) | never overwrites; each fetch is a new snapshot |
| `load` | latest snapshot per source | `flow`, `loan_terms`, `trade`, `people_count`… rows | each source's `parse()` maps columns to our model |
| `transform` | loaded rows + FX, deflators | EUR amounts, dedupe flags, baselines, grant equivalents, switching costs | pure functions, unit tested |
| `estimate` | `research/estimates/*.yaml` | rows with `certainty` C/D and low/central/high | only cards with `status: reviewed` are used |
| `analyse` | all rows | `country_category_year` table | SQL in DuckDB |
| `publish` | analysis tables | `site/public/data/world.json`, `country/<ISO3>.json`, downloads, diff report | the website only reads these files |

## Automation

```
every Monday 06:00 UTC (GitHub Actions)
  └─ mft fetch --all  →  mft build  →  mft validate  →  mft publish
       └─ opens PR "Data update 2026-10-19" on a branch from develop
            ├─ diff report: countries whose totals changed > 5 %, new sources, failed sources
            └─ reviewer merges → develop → (release) main → Cloudflare Pages deploys the site
```

- A source that fails to fetch keeps its last good snapshot. The diff report says so, and the website shows the data date per source.
- Kiel and Comtrade revise past numbers. The diff report lists revisions separately from new data.

## Testing

| kind | example |
|------|---------|
| parser tests | `tests/fixtures/kiel_2026-07.xlsx` (trimmed) → expected rows |
| method tests | grant equivalent of the worked example in the concept doc gives €171m / €553m |
| reconciliation | sum of Kiel rows per donor equals Kiel's own published donor totals (±0.5 %) |
| top-down checks | our total fossil payments to Russia vs Russian Ministry of Finance oil and gas revenue: the ratio must stay within an expected band |
| schema checks | every estimate card validates against `research/schema/estimate.schema.json` (pre-commit) |
| site data checks | every country JSON validates; every number has a `source` and a `certainty` |
