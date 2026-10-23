# The site: a developer's note

What a reader sees is described on the site itself (How it works). This note says where things are in the code.

## Files

| File | What it holds |
|---|---|
| `site/index.html` | the map, the country panel, Filters and Highlights, the model (`calc()`, ranges, grades) and How it works (`renderHow`) |
| `site/views.js` | the Ranking view |
| `site/views2.js` | the data downloads (CSV and JSON), shown at the end of How it works |
| `site/i18n.js`, `site/i18n/*.js` | the six translations; the English text in the code is the key (`t("...")`, `tData()` for data texts) |
| `site/content/` | the long-form text of How it works: `method/*.md`, `limitations.md`, `changelog.md` |
| `site/data.json`, `site/detail.json` | built by `pipeline/build_data.py`; never edit by hand |
| `pipeline/share_cards.mjs` | the share images and a page per country (`site/share/`, `site/c/`), made by the Pages deploy |

## How it works and its content

`site/content/*.md` is the one place the method, the limitations and the changelog are written. The site loads it only
when How it works opens and renders it with marked and DOMPurify (pinned versions from cdnjs, `MD_LIBS`). Headings get
ids from their text as GitHub makes them, under a prefix: `m-<page>-` for a method page, `lim-` for the limitations;
the changelog's rounds carry their own ids (`<h2 id="cl-r13">`), followed by `<!-- flows: paid sold -->`, the money
flows (ids in `FLOWS`) the round changed, which fill each flow's "Changes to this flow". A money flow's `method` field
names its place in a method page (`trade.md#re-export-hubs`); its card shows that section as "Full method".

Links inside the content use the site's own addresses (below), so they work on the site; on GitHub they do not.
`pipeline/check_docs_numbers.py` checks every figure tagged `<!-- n:POL.rus -->` in `site/content/` against the model.

## Addresses

The address keeps what the reader sees.

- `view`: `map` (the default), `rank` or `how`. Old views open the nearest one (`OLD_VIEW`): `sources` and `table`
  open `how`, `bubbles`, `rankings` and `top` open `rank`; `#RANKINGS` opens `rank`.
- `flow`: with `view=how`, a money flow (`#view=how&flow=loans`); `open=method` also opens its full method.
- `sec`: with `view=how`, a section or heading: `method-h`, `flows-h`, `method-full`, `limitations`, `changelog`,
  `data`, a method page or one of its headings (`m-trade`, `m-trade-re-export-hubs`) or a round (`cl-r13`).
- `lens`: `net` (the default), `support`, or `payments` (trade with Russia; `trade`, `business` and `kept` open it too).
  Older values: `change` opens `net`, `ukr` opens `support`, `rus` opens `payments`, `cost` opens `net`.
- `m`: `gdp` (the default) or `total`; `pp` (per person until round 20) opens `gdp`.
- `y`: a year, 2021 to 2026. `hl`: a highlight (`world`, `armed`, `baltic`, `hungary`, `support`, `gascut`, `taken`).
- A country: `#AUS`, or `c=AUS` with other values; `UKR` and `RUS` open the Ukraine and Russia panels.
- Values at their default are left out. "What's counted" is never in the address: a link always opens the official
  numbers. `c/aus.html` is a country's own page, whose link preview shows its card.
- History (round 24): every change of view, flow or section the reader makes is a new history entry (`pushNav()`), so
  Back retraces their steps inside the site; Back/Forward and edited addresses go through `route()`.

## Sources

`data.json` `sources` holds each source with `type` (`data`, `report`, `press`, `ours`, `notes`), `date_kind` and its
documents (`links`); 1-3 documents per source are `key`, and the documents of the research-note bundles carry the
`flows` they belong to. All of this is set at build time by `classify_sources()` in `pipeline/build_data.py`, which
also swaps links that no longer open for the addresses in `research/2026-10/link_fixes.json`. The site renders a
source with `srcItem()` (name, date, key documents, the rest folded) and a flow's sources with `flowSourcesHtml()`;
check 37 in `check_data.py` holds the rules.

## The site's address, search engines and the domain

- **One setting.** The site's own address is `site_url` in `pipeline/site_config.json` (now
  `https://warbalance.org/`); `old_url` is the previous GitHub Pages address. `pipeline/share_cards.mjs`
  reads it for the country pages, the card images, `robots.txt` and `sitemap.xml`. `site/index.html` carries the same
  value in its head (canonical, `og:url`, `og:image`, hreflang alternates) and in `SITE_URL`; check 46 fails if any of
  them, or `site/CNAME`, differs, or if a file in `site/` still gives the old address as the site's own. To move the site
  again, change `site_config.json`, the head of `index.html`, `SITE_URL` and `site/CNAME` together.
- **Generated files.** `robots.txt` (allow all, with the sitemap) and `sitemap.xml` (the map with its seven language
  versions, `?lang=…`, and every country page `c/<iso>.html`, each with the data's date) are written by
  `share_cards.mjs`, in CI and in the deploy; they are not committed (`.gitignore`), like `site/c/` and `site/share/`.
- **Structured data.** The map's head has JSON-LD for the website, the publishing organisation ("War Balance",
  no personal names) and the Dataset (licence CC BY 4.0, coverage February 2022 to August 2026, the JSON
  download). Each country page has a WebPage that is part of the Dataset.
- **The custom domain on GitHub Pages.** The deploy uses GitHub Actions, so `site/CNAME` documents the domain but does
  not set it: in the repository's Settings → Pages → Custom domain, enter `warbalance.org`, then tick Enforce
  HTTPS once the certificate is issued. DNS for the domain is at Cloudflare: four A records for GitHub Pages
  (185.199.108–111.153, not proxied; no AAAA records) and `www` as a CNAME to `intelligent-cream.github.io`. The
  earlier addresses (followthemoneyukraine.org and .com) redirect to warbalance.org with Cloudflare redirect rules.
- **Search Console and Bing Webmaster Tools.** Use the project's own email account. Add the site as a Domain property
  (a DNS TXT record at Cloudflare) or as a URL-prefix property with an HTML tag: put the tag in the head of
  `site/index.html` next to the canonical link, deploy, verify, then submit `https://warbalance.org/sitemap.xml`.
