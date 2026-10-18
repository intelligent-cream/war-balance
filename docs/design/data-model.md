# Data model

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Three layers:
1. **Warehouse** (DuckDB): the full detail, rebuilt on every run.
2. **Research files** (YAML in git): estimate cards and evidence, written by people.
3. **Site data** (JSON): small per-country files that the map reads.

## 1. Warehouse tables

### Reference tables

```sql
CREATE TABLE country (
    iso3            TEXT PRIMARY KEY,        -- 'DEU'
    iso_numeric     TEXT NOT NULL,           -- '276', matches the map geometry
    name            TEXT NOT NULL,
    region          TEXT,                    -- 'EU', 'Europe other', 'Asia', ...
    eu_member_from  DATE
);

CREATE TABLE indicator (                     -- World Bank / Eurostat
    iso3        TEXT REFERENCES country,
    year        INTEGER,
    population  BIGINT,
    gdp_eur     DOUBLE,                      -- current prices
    PRIMARY KEY (iso3, year)
);

CREATE TABLE fx_rate (                       -- ECB monthly average
    currency    TEXT,
    month       DATE,
    eur_per_unit DOUBLE,
    PRIMARY KEY (currency, month)
);

CREATE TABLE deflator (                      -- euro area HICP, 2022 = 1.0
    month       DATE PRIMARY KEY,
    factor      DOUBLE
);

CREATE TABLE actor (                         -- states, institutions, companies
    actor_id     TEXT PRIMARY KEY,           -- 'DEU', 'EU_INSTITUTIONS', 'LEI:5299...'
    actor_type   TEXT CHECK (actor_type IN ('state','institution','company','private')),
    name         TEXT,
    home_country TEXT REFERENCES country,    -- for companies: parent's country
    exit_status  TEXT                        -- companies: 'stayed','scaling_back','left'
);
```

### Provenance

```sql
CREATE TABLE source (
    source_id   TEXT PRIMARY KEY,            -- 'kiel', 'crea', 'comtrade', ...
    name        TEXT,
    url         TEXT,
    licence     TEXT,
    priority    INTEGER                      -- lower wins when two sources describe the same flow
);

CREATE TABLE snapshot (
    snapshot_id TEXT PRIMARY KEY,            -- 'kiel/2026-10-06'
    source_id   TEXT REFERENCES source,
    fetched_at  TIMESTAMP,
    storage_uri TEXT,                        -- r2://mft-raw/kiel/2026-10-06/tracker.xlsx
    sha256      TEXT
);
```

### The ledger

```sql
CREATE TABLE flow (
    flow_id          TEXT PRIMARY KEY,
    snapshot_id      TEXT REFERENCES snapshot,   -- NULL for rows from estimate cards
    estimate_id      TEXT,                        -- set for rows from estimate cards

    source_actor     TEXT REFERENCES actor,       -- who gives / pays
    target           TEXT CHECK (target IN ('UKR','RUS')),
    paid_by          TEXT REFERENCES actor,       -- when different from source_actor
    delivered_by     TEXT REFERENCES actor,       -- company that delivered, if any
    channel_via      TEXT REFERENCES country,     -- re-exports, laundered oil

    side_category    TEXT,   -- UKR: military, financial, humanitarian, refugees, sanctions_trade
                             -- RUS: energy, other_trade, company_tax, military_inkind, hidden
    subcategory      TEXT,   -- 'crude_oil', 'lng', 'tariff_waiver', 'artillery_shells', ...
    instrument       TEXT CHECK (instrument IN ('grant','loan','guarantee','in_kind','payment','tax','cost')),
    status           TEXT CHECK (status IN ('pledged','allocated','disbursed','reported','estimated')),

    period_start     DATE,
    period_end       DATE,
    amount_original  DOUBLE,
    currency         TEXT,
    amount_eur       DOUBLE,        -- nominal, at the period's FX rate
    amount_eur_2022  DOUBLE,        -- constant 2022 euros
    grant_equivalent_eur DOUBLE,    -- loans/guarantees only; NULL otherwise

    certainty        TEXT CHECK (certainty IN ('A','B','C','D')),
    low_eur          DOUBLE,        -- required for C and D
    high_eur         DOUBLE,

    is_duplicate_of  TEXT,          -- set by dedupe; excluded from totals
    notes            TEXT
);

CREATE TABLE loan_terms (
    flow_id          TEXT PRIMARY KEY REFERENCES flow,
    interest_rate    DOUBLE,
    maturity_years   DOUBLE,
    grace_years      DOUBLE,
    schedule         TEXT,           -- 'bullet', 'annuity', 'custom'
    repaid_from      TEXT,           -- 'borrower', 'frozen_asset_proceeds'
    default_prob     DOUBLE,
    lender_rate      DOUBLE,         -- discount rate for "cost to lender"
    borrower_rate    DOUBLE          -- discount rate for "value to Ukraine"
);
```

### Trade and baselines

```sql
CREATE TABLE trade (                 -- Comtrade / Eurostat, both directions, mirror data included
    reporter    TEXT, partner TEXT,  -- ISO3
    flow_dir    TEXT CHECK (flow_dir IN ('import','export')),
    hs_group    TEXT,                -- our grouping of HS codes, incl. 'chp_dual_use'
    month       DATE,
    value_eur   DOUBLE,
    source_id   TEXT,
    is_mirror   BOOLEAN              -- true when taken from the partner's report
);

CREATE TABLE trade_baseline (        -- 2017–2021 trend, projected forward
    reporter TEXT, partner TEXT, flow_dir TEXT, hs_group TEXT, year INTEGER,
    expected_eur DOUBLE, actual_eur DOUBLE,
    excess_eur  DOUBLE GENERATED ALWAYS AS (actual_eur - expected_eur)
);
```

### Flowback

Flowback needs no new table:
- **Own industry / other countries' aid spent here**: `flow.delivered_by` points to the company that was paid;
  its `actor.home_country` is where the money went. A `flow` row with `paid_by = DEU` and a US company as `delivered_by` is flowback to the US.
- **Extra sales to Ukraine**: `trade_baseline` rows with `partner = 'UKR'`, `flow_dir = 'export'`, positive `excess_eur`.

```sql
CREATE VIEW flowback_country_year AS
SELECT a.home_country AS iso3, year(f.period_start) AS year, 'industry' AS part, SUM(f.amount_eur) AS eur
FROM flow f JOIN actor a ON a.actor_id = f.delivered_by
WHERE f.target = 'UKR' AND f.is_duplicate_of IS NULL
GROUP BY ALL
UNION ALL
SELECT reporter, year, 'extra_sales', SUM(GREATEST(excess_eur, 0))
FROM trade_baseline WHERE partner = 'UKR' AND flow_dir = 'export'
GROUP BY ALL;
```

Where contract data is missing, an estimate card gives the share of a donor's military aid spent with its own industry (certainty C).

### People

```sql
CREATE TABLE people_count (
    iso3        TEXT REFERENCES country,
    side        TEXT CHECK (side IN ('UKR','RUS')),
    kind        TEXT,                -- 'volunteers', 'recruited_fighters', 'troops', 'refugees_hosted'
    as_of       DATE,
    low INTEGER, central INTEGER, high INTEGER,
    certainty   TEXT,
    estimate_id TEXT
);
```

### Analysis output

```sql
CREATE TABLE country_category_year AS
SELECT
    COALESCE(a.home_country, f.source_actor) AS iso3,
    f.target,
    f.side_category,
    year(f.period_start)                    AS year,
    SUM(COALESCE(f.grant_equivalent_eur, f.amount_eur)) AS central_eur,
    SUM(COALESCE(f.low_eur,  f.amount_eur)) AS low_eur,
    SUM(COALESCE(f.high_eur, f.amount_eur)) AS high_eur,
    MAX(f.certainty)                        AS weakest_certainty,   -- 'D' > 'A'
    SUM(f.amount_eur)                       AS face_value_eur
FROM flow f
LEFT JOIN actor a ON a.actor_id = f.source_actor
WHERE f.is_duplicate_of IS NULL
  AND f.status IN ('allocated','disbursed','reported','estimated')
GROUP BY ALL;
```

Company rows roll up to `home_country` but keep `actor_type = 'company'`, so the site can show them as a separate line.

## 2. Research files

### Estimate card (`research/estimates/<id>.yaml`)

```yaml
id: rus-military-inkind-prk-artillery
title: Artillery shells supplied by North Korea to Russia
side: RUS
category: military_inkind
source_actor: PRK
period: { start: 2023-08-01, end: 2026-09-30 }
certainty: D
status: reviewed            # draft → in_review → reviewed → retired
method: quantity_x_unit_price
inputs:
  quantity:   { low: 0, central: 0, high: 0, unit: shells }      # EXAMPLE STRUCTURE ONLY
  unit_price: { low: 0, central: 0, high: 0, unit: EUR, basis: "NATO 155mm-equivalent replacement price, discounted for 152mm" }
assumptions:
  - Counts from container shipments are converted at an assumed shells-per-container figure.
evidence: [ev-0012, ev-0031, ev-0044]
reviewers: [name-1, name-2]
reviewed_at: 2026-10-01
next_review: 2027-01-01
```

Supported methods: `quantity_x_unit_price`, `share_of_total`, `excess_over_baseline`, `refinery_share`, `fixed_range`.
Ranges are propagated with simple interval arithmetic (low × low, central × central, high × high);
a Monte Carlo option can come later.

### Evidence item (`research/evidence/<id>.yaml`)

```yaml
id: ev-0012
url: https://example.org/report
archived_url: https://web.archive.org/web/2026.../https://example.org/report
publisher: Example Institute
publisher_tier: 2            # 1 official, 2 research institute, 3 established media, 4 single or belligerent source
belligerent_source: false
published_at: 2026-03-14
quote: "Exact sentence that supports the number."
supports: [rus-military-inkind-prk-artillery]
```

## 3. Site data (JSON)

### `world.json` (loaded once, small)

```json
{
  "generated_at": "2026-10-19",
  "years": [2021, 2022, 2023, 2024, 2025, 2026],
  "countries": {
    "DEU": {
      "n": "276", "name": "Germany", "pop": 83.3, "gdp": 4300,
      "ukr": [0, 12.1, 15.3, 14.0, 10.2, 6.8],
      "rus": [21.0, 16.4, 6.5, 5.2, 4.1, 3.0],
      "certainty": { "ukr": "B", "rus": "B" }
    }
  }
}
```
Amounts in € billions, one value per year, so the map can recolour for any time window without loading more data.

### `country/<ISO3>.json` (loaded when a country is opened)

```json
{
  "iso3": "DEU",
  "ukr": {
    "categories": [
      { "id": "military", "years": [0, 5.1, 6.9, 6.2, 4.4, 3.0], "certainty": "B",
        "low": null, "high": null, "sources": ["kiel"] }
    ],
    "loans": { "face_value": 0.0, "grant_equivalent_lender": 0.0, "grant_equivalent_ukraine": 0.0 }
  },
  "rus": { "categories": [ … ], "baseline_2021": 21.0 },
  "people": [ { "side": "UKR", "kind": "volunteers", "low": 0, "central": 0, "high": 0, "certainty": "D" } ],
  "companies": { "count_stayed": 0, "tax_paid_in_russia": [ … ] },
  "sources": { "kiel": { "name": "Kiel Institute Ukraine Support Tracker", "data_date": "2026-10-06", "url": "…" } }
}
```
