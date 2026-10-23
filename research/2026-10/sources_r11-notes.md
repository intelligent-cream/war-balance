# Exact source links per source id (round 11)

Data file: `research/2026-10/sources_r11.json`. Generated 2026-10-19..

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
- **Wired into the map (update).** This item is out of date: the build now copies the confirmed links into `site/data.json` (`links`, the final pass of `build()` in `pipeline/build_data.py`), and the site shows them under each source (`srcLinks()` in `site/index.html`).

## Update after the round-11 audit (2026-10-19)

The figures above describe the file when it was first written. After the traceability audit:

- **Count.** The file now has 64 ids. `site/data.json` lists 55. The 4 `assumptions_r11_*` ids were added with an empty `links` list: their links are built by `attach_r11_sources()` from the proposals' own sources, and an empty list here keeps them. `sanctions_share` was added because the sanctions note in each panel now cites it; its EUR-Lex link is unconfirmed (no readable page for an automated fetch).
- **`refugees_net` is used.** It is cited on the refugee part of 66 countries; the list of unused ids above was wrong about it.
- **Superseded ids.** `flowback_model`, `csis`, `purl`, `flowback_default`, `flowback_kiel`, `eu_industry`, `ua_arms`, `other_mil` and `other_mil2` no longer produce a number. Each has a `superseded` field, and `prune_sources()` keeps them out of `site/data.json`. `flowback_default`'s link title and note now give the round-11 share (0/10/30%).
- **Ids now cited where they feed a number.** `gas_prices` (payments to Russia and the windfall of 50 countries) and `shadow_fleet` (the shipping part) are now cited by the parts they feed. `value_kept` and `net_gain_russia` are cited on every part they weight.
- **Still without a primary link:** `military_rus_r6` and `people`. The audit tried to confirm the Multilateral Sanctions Monitoring Team's first report (29 May 2025) and the joint statements of its member states, but their pages blocked automated access. They are listed as open in `docs/limitations.md`.

## Update in round 12: the North Korea primary report (2026-10-19)

- **`military_rus_r6` now has a primary link.** The Multilateral Sanctions Monitoring Team's first report,
  MSMT/2025/1, "Unlawful Military Cooperation including Arms Transfers between North Korea and Russia" (29 May 2025,
  also UN document S/2025/340), was downloaded from [msmt.info](https://msmt.info/api/file/download/18858) (listed at
  [msmt.info/Publications/Reports](https://msmt.info/Publications/Reports)) and read. It is the first link of
  `military_rus_r6`, kind `primary`, confirmed. The PDF is kept as `raw/msmt/msmt_2025_1.pdf`; like all PDFs it is
  not in the repository, only listed with its checksum in `raw/MANIFEST.json`.
- **What it confirms:** North Korea's volumes (rounds, containers, missiles, artillery vehicles, troops). **What it
  does not give:** prices. The valuation in euros stays our judgement, so the certainty stays C. The comparison with
  the model's quantities is in [`gaps/military_rus_r6-notes.md`](gaps/military_rus_r6-notes.md).
- **Still without a primary link:** `people` only. Iran, Belarus and China inside `military_rus_r6` and
  `china_military` still rest on press reports.
