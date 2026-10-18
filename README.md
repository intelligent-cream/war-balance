# Follow the Money: Ukrainian Aid

An interactive map of how much each country has shifted money and support towards Ukraine or towards Russia since the full-scale invasion, and what that has cost it.

**Map:** https://intelligent-cream.github.io/follow-the-money-ukraine/

Status: **research preview**. All figures come from public sources or are estimates built from them. Every number has a likely range, a certainty letter (A reported, B measured estimate, C modelled estimate, D rough indication) and a source. The research was compiled with AI assistance and has not yet been reviewed line by line by a person. Treat it as a starting point and check the sources before quoting a figure.

## What the map shows

- **Change since before the war** (the main view): aid to Ukraine (EU-level aid split over member states by their EU budget contribution), undisclosed military aid and private donations (estimates), refugee hosting, purchases from Ukraine above the pre-war level, the drop in payments to Russia for goods and services, sales to Russia given up and less tax paid in Russia by companies based in the country. Subtracted: anything bought from or sold to Russia above the pre-war level, Russian oil bought via other countries, gold and hidden payment channels, weapons sent to Russia and, optionally, money flowing back from Ukraine (every euro for Ukraine followed to the economy where it was spent). Each country shows two balances, with Ukraine (gave minus earned from the war effort) and with Russia; the headline adds them. A country that earned more from the war effort than it gave is shown in gold, not as money toward Russia. Money earned counts at the value kept in the economy × the share that is genuinely extra.
- **Cost carried**: aid with loans at grant equivalent, refugee hosting, the extra price paid to replace Russian energy, income lost on sales to Russia (value kept × genuinely extra) and tariffs dropped for Ukraine, minus discounts gained on Russian oil.
- **% of GDP** (the headline measure): the total for 2022 up to the chosen year, as a share of one year's GDP (2024). Rankings leave out economies under EUR 5bn GDP and countries whose likely range crosses zero.

## Method in short

- **Expected without the war**: trade and services start from 2021 at pre-war prices (company taxes from the 2018-2021 average). Exports to Russia and trade with Ukraine then follow each country's other trade and GDP, the rest stays at the 2021 level: the models that predicted past years best in back-tests from 2008, 2013 and 2016. Changes compare volumes at pre-war prices; the extra Russia earned from war-time fuel prices counts as a separate part.
- **Counted where used**: transit gas for the country that burns it, fuel resold by trading hubs for the hub's customers, goods re-exported to Russia by hubs (UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan and others) for the countries that made them, Hong Kong's gold for mainland China.
- **No country is rewarded for missing data**: gaps are filled with estimates that carry wide ranges, never left at zero.
- **Margins of error**: each part has a low and high value (about a 90% range) from the data, or from its certainty letter (A ±5%, B ±15%, C ±35%, D ±70%). The tested error of the no-war prediction is part of every range. Totals combine parts' errors in quadrature, with the correlations measured between flows ([ranges](docs/method/ranges.md)).

The full method is documented in [`docs/`](docs/README.md) (see below); the log by data round is in [`research/2026-10/README.md`](research/2026-10/README.md). Every research file has a notes file next to it with sources, retrieval dates and the reasoning behind each educated guess. Paths like `working/...` in the notes refer to the research scripts and raw downloads, which are not published here.

## Documentation

Start at the [documentation index](docs/README.md), which explains in plain language how to read a number. Main pages:

- [Method overview](docs/method/overview.md): the core idea and every part of the calculation
- [Expected without the war](docs/method/counterfactual.md): the models tried, the back-tests and which prediction is used for which flow
- [Prices and the war-time windfall](docs/method/prices.md) · [Ranges and certainty](docs/method/ranges.md)
- [Trade](docs/method/trade.md) · [Energy and laundered oil](docs/method/energy-and-laundered-oil.md) · [Services, shipping, company taxes](docs/method/services-shipping-companies.md) · [Aid, refugees, military, flowback](docs/method/aid-refugees-military.md) · [AI-guessed incentives](docs/method/incentives.md)
- [Pipeline and data.json](docs/reference/pipeline.md) · [Research files](docs/reference/research-files.md) · [Sources](docs/reference/sources.md)
- [Limitations](docs/limitations.md) · [Changelog](docs/changelog.md)

## Repository

| Folder | What it holds |
|---|---|
| `site/` | the map (`index.html`), its data (`data.json`) and the country shapes |
| `pipeline/` | `build_data.py` turns the research files into `site/data.json`; `check_data.py` tests for double counting, ordered ranges and totals that match the published sources |
| `research/2026-10/` | research inputs (JSON) and notes, per topic; `gaps.md` lists what is reported and what is estimated, per country |
| `docs/` | documentation of the method, data and pipeline ([index](docs/README.md)) |
| `docs/design/` | early design notes; where they differ from the map's methodology, `docs/` and the code are current |

Run it yourself:

```sh
./setup.sh                                  # dependencies and pre-commit hooks
uv run python pipeline/build_data.py        # rebuild site/data.json from research/
uv run python pipeline/check_data.py        # checks
cd site && python3 -m http.server 8000      # open http://localhost:8000
node pipeline/share_cards.mjs              # optional: share images and a page per country (needs Node and Playwright; the Pages deploy runs it)
```

## Corrections

Found a wrong number, a better source or a missing flow? Open an issue with the country, the figure and a link to the source, or send a message to [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/). Corrections are listed in the commit history.

## Licence

- Code: MIT, see [`LICENSE`](LICENSE).
- Data and text (`site/data.json`, `research/`, `docs/`): CC BY 4.0, see [`LICENSE-DATA.md`](LICENSE-DATA.md). The original sources keep their own terms; see the source list in each research file.
- Country shapes: [world-atlas](https://github.com/topojson/world-atlas) (ISC licence), from Natural Earth (public domain).
