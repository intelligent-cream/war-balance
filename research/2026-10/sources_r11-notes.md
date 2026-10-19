# Exact source links per source id (round 11)

Data file: `research/2026-10/sources_r11.json`. Generated 2026-10-19. Not yet reviewed by a person.

This round answers a reader's criticism: many source entries in `site/data.json` have no URL, or only a homepage. Each of the 59 source ids now has its own list of 2 to 8 links. Each link points to the exact dataset query, report PDF, press release or method section behind the figure.

## How the links were chosen and checked

- **Where they come from.** Links were taken from the research JSON and notes behind each id. To find the research file for an id, look up its `src.add("<id>"` call in `pipeline/build_data.py`. Where a research file named a dataset but only a generic endpoint, the exact query was built from the parameters in the notes, then fetched. Examples:
  - UN Comtrade: `comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=TOTAL...`. One query per year and flow; the year 2024 is given as the example.
  - Eurostat dataset API queries, e.g. `nrg_ti_gas`, `migr_asytpsm`, `bop_its6_det`, Comext `DS-045409`.
  - The Kiel Release 31 workbook, the CREA fossil tracker API, and the OECD BaTiS and TiVA SDMX queries.
- **Fetching.** Every link was fetched on 2026-10-19. A Comtrade query counts as confirmed only if it returned data rows. One query returned zero rows and was dropped. Queries with several years at once were cut to a single year, because the public preview API allows only one period.
- **The `checked` field says how each link was confirmed:**
  - `fetched`: HTTP 200 with the expected content.
  - `confirmed by web search`: the site blocks automated fetches, but a search found the exact URL with the matching title. This covers Euroclear, DoD OIG, DSCA, EUR-Lex, IMF and OECD.
  - `exists in research file; site blocked automated fetch`: a Cloudflare or other bot wall stopped the check, so the link is marked `"confirmed": false`.
- **Replacements.** Some links in the research files were dead or could only be confirmed in another form. They were replaced:
  - The Kyiv Independent URL slug was corrected.
  - Russia's Finance Ministry oil-revenue page exists only at `/ru/statistics/fedbud/oil`; the English path returns 404.
  - FRED CSV endpoints were replaced by the series pages. The proxy cuts the CSV off.
  - The GAO PDF was replaced by the GAO product page.
  - The DBnomics WEO link was replaced by the October 2021 vintage, `IMF/WEO:2021-10`.
- **Dropped links.** A World Bank Armenia PDF returned 404. The neftegaz.ru article, the Irish CRO search page (a homepage, not a filing) and the USDA factsheet could not be confirmed and were also dropped.
- **`kind`:**
  - `primary`: official statistics, or the institution's own data, report or press release. This includes company reports and think-tank reports for the think tank's own estimates.
  - `secondary`: a press article that cites a figure.
  - `method`: a section of this repo's `docs/method/*.md`. Every anchor was checked against the rendered GitHub page.

## Result

- **59 of 59 ids** have links: 345 in total, 326 confirmed and 19 unconfirmed.
- **55 of 59 ids** have at least one confirmed primary link.
- **The 4 without a primary link, and why:**
  - `flowback_default`: a pure assumption of this project (`"model": true`), so it has no external source. Its links go to `aid-refugees-military.md#flowback` and `ranges.md#where-a-parts-range-comes-from`.
  - `people` (volunteers and recruited fighters): no official statistics exist. All figures are press reports of intelligence estimates or of belligerents' claims (certainty D).
  - `military_rus_r6` (North Korea, Iran and Belarus arms to Russia): no official data. The figures are intelligence estimates (INSS, South Korean NIS/DIA, MSMT, Ukraine's HUR) and leaked contracts, known only through press reports.
  - `other_mil2`: same reason. It is also superseded: no country in `site/data.json` uses it any more.
- **`"model": true`:** `flowback_default`, `flowback_model` and `cf_bands`. They link to the method sections; `cf_bands` also links the one Comtrade query that feeds it. `windfall`, `trend` and `counterfactual` are model outputs built on primary data. They keep `"model": false`, and their primary inputs are linked next to the method section.
- **Ids registered but not used by any country in the current `site/data.json`:** `flowback_model`, `purl`, `eu_industry`, `other_mil`, `other_mil2`, `shadow_fleet`, `gas_prices`, `refugees_net` and `ua_arms`. They feed other parts or have been superseded, as each id's `note` says.

## Remaining weak spots

- **Unconfirmed links.** The 19 unconfirmed links are mostly secondary press: Bloomberg, Lloyd's List, S&P Global, Intellinews, Euromaidan Press, FDD, Izvestia, 1TV Georgia, Radio Prague. Three are primary:
  - Azerbaijan's embassy decree page (TLS certificate error)
  - Statistics Lithuania (bot wall)
  - the Voeten UN voting DOI (bot wall)

  A person opening these in a browser should confirm them.
- **`ua_arms`:** the Czech trade ministry's own licence reports are not linked in the research files. The figures come from press summaries of them. Linking the MPO annual export-control reports directly would make this primary.
- **Press-only figures.** `nonreport`, `hidden`, `undisclosed`, `private`, `china_military` and `payment_agents` still rest largely on press reports. That is the nature of these flows, and their certainty letters (C-D) already say so.
- **Not wired into the map yet.** Showing these links on the site needs a change to `pipeline/build_data.py` or `site/`. No such change was made in this round.
