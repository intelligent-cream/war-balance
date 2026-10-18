# Roadmap

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Each phase ends with something visible on the map.

| phase | build | map shows | done when |
|-------|-------|-----------|-----------|
| **0. Skeleton** | repo, `setup.sh`, pre-commit, Pydantic models, DuckDB schema, `mft` CLI, site scaffold from the prototype | the prototype map reading `world.json` | `mft publish` writes valid JSON from fixtures |
| **1. First real numbers** | Kiel importer, CREA importer, FX, deflator, GDP, population | support for Ukraine and fossil payments to Russia, per country, A–B only | totals reconcile with Kiel and CREA published totals |
| **2. Loans and refugees** | `loan_terms`, grant equivalent, Kiel refugee costs, UNHCR | grant equivalent vs face value; refugees category | worked example test passes |
| **3. Trade and baselines** | Comtrade, Comext, baselines, excess trade, tariff waivers, state take | other trade, sanctions and trade category, 2021 reference in trends | top-down check against Russian MinFin passes |
| **4. Switching cost** | energy prices, volumes replaced | cost of sanctions per country (C) | ranges reviewed |
| **5. Companies** | KSE Leave Russia, filings, exit status | company line in the panel | wording reviewed |
| **6. Research layer** | estimate cards, evidence, review flow, LLM-assisted collection | military in-kind, hidden channels, laundered oil, people (C–D) | first ten cards reviewed |
| **7. Launch** | corrections page, table view, downloads, weekly automation | public site | two weekly data PRs merged without manual fixes |

Phases 3–6 can partly run in parallel once phase 1 is done.
