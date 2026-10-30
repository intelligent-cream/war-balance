# The site: a developer's note

What a reader sees is described on the site itself (How it works). This note says where things are in the code.

## Files

| File | What it holds |
|---|---|
| `site/index.html` | the map, the country panel, Filters (with the tags as filters), the model (`calc()`, ranges, grades) and How it works (`renderHow`) |
| `site/views.js` | the Ranking view |
| `site/views2.js` | the data downloads (CSV and JSON), shown at the end of How it works |
| `site/i18n.js`, `site/i18n/*.js` | the six translations; the English text in the code is the key (`t("...")`, `tData()` for data texts) |
| `site/content/` | the long-form text of How it works: `method/*.md`, `limitations.md`, `changelog.md` |
| `site/data.json`, `site/detail.json` | built by `pipeline/build_data.py`; never edit by hand |
| `pipeline/share_cards.mjs` | the share images and a page per country (`site/share/`, `site/c/`), made by the Pages deploy |
| `pipeline/seo_images.mjs` | the chart images for image search (`site/img/`), drawn in the same run (round 62) |

## How it works and its content

`site/content/*.md` is the one place the method, the limitations and the changelog are written. The site loads it only
when How it works opens and renders it with marked and DOMPurify (pinned versions from cdnjs, `MD_LIBS`). Headings get
ids from their text as GitHub makes them, under a prefix: `m-<page>-` for a method page, `lim-` for the limitations;
the changelog's rounds carry their own ids (`<h2 id="cl-r13">`), followed by `<!-- flows: paid sold -->`, the money
flows (ids in `FLOWS`) the round changed, which fill each flow's "Changes to this flow". A money flow's `method` field
names its place in a method page (`trade.md#re-export-hubs`); its card shows that section as "Full method".

Links inside the content use the site's own addresses (below), so they work on the site; on GitHub they do not.
`pipeline/check_docs_numbers.py` checks every figure tagged `<!-- n:POL.rus -->` in `site/content/` (and in `docs/`
and the README) against the model.

The site's text is written for readers. Developer detail lives here instead: the parameter-level version of each method
page is in [`method/`](method/) (one file per page; each method page links to its own), and the full round-by-round
history with every decision is [`docs/changelog-full.md`](../changelog-full.md). The site's changelog is a short
summary with the same round ids (`cl-r13`). The content may use raw HTML: inline SVG diagrams (in a `<figure>` with no
blank lines inside, colours as `style="fill:var(--ukr)"` so both themes work) pass through marked and DOMPurify.

Known display notes (moved from the limitations page):

- Links to research files from the map point to the `main` branch on GitHub, the published branch; a file added on a
  branch opens only after it is merged.
- Refugee ranges per year in `data.json` can have a low value above the middle one in a single year (35 cases, for
  example the United States in 2026). The ranges are floored on running totals, so they are ordered for every period
  the map shows, not for each year on its own ([pipeline.md](pipeline.md#datajson-in-brief)).
- China's dual-use exports are shown in its panel as a note; they are already in its sales to Russia.

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
- `y`: a year, 2021 to 2026. `tags`: up to three story tags picked in Filters (round 33), comma-separated
  (`#tags=windfall,discount`); on the map and in the Ranking. The keys are `TAG_CAT` in `index.html`. The older `hl`
  (a highlight, rounds 17 to 32) opens its nearest tag: `world` → `bought_more`, `armed` → `mil`, `hungary` →
  `windfall`, `support` → `aid_top`, `gascut` → `gascut`; `baltic` and `taken` are dropped.
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
- **Generated files.** `robots.txt` (allow all, with the sitemap) and the sitemaps are written by `share_cards.mjs`
  (with `seo_pages.mjs`), in CI and in the deploy; they are not committed (`.gitignore`), like `site/c/` and
  `site/share/`. Since round 56 `sitemap.xml` is an index of one sitemap per language (`sitemap-en.xml`,
  `sitemap-de.xml` ...), each page listed with its hreflang alternates and the date its words or numbers last changed
  (`pipeline/seo_lastmod.json`).
- **Generated pages (rounds 54–56).** A page per country, topic and group (`pipeline/seo_topics.json`), per part of the
  panel, per year and per pair of countries (`pipeline/seo_families.json`, by rule in `seo_families.mjs`), and the
  Topics page (`/topics/`), each in all seven languages at `/<lang>/<same path>/`; the frames of the pages in each
  language are in `pipeline/seo_i18n.mjs`, everything said about a country is the map's own text in that language.
  Check 48 (`pipeline/seo_check.py`) holds the rules.
- **Chart images (round 62).** `pipeline/seo_images.mjs` draws 1200×630 WebP charts at deploy into `site/img/`
  (`site/img/<lang>/` for the other languages; not committed, like `site/share/`), from the figures the pages show and
  in the map's colours and fonts: support for Ukraine by country in euros, as a share of GDP and per person, the
  money that moved toward Russia and the frozen Russian assets (each in all seven languages), the net (on
  `/ranking/`; round 63: in every language), and one per country page with data. Their file names (`seo_i18n.mjs` `IMG_FILE`) carry no date, so an
  address stays the same as the data change. Each is shown near the top of its page with alt text that states the
  figures, is its `og:image` and `primaryImageOfPage`, and is listed in the sitemaps (`image:image`); every generated
  page has `max-image-preview:large`. Check 48 reads them (`check_images`).
- **Thin pages and languages (round 63).** Only the comparison pairs listed in `seo_families.json` `compare.pairs`
  (searched pairs, neighbours and rivals) are indexed; the other pairs of the largest donors and the pages of
  territories without any data of their own are written with `noindex, follow`, without hreflang, out of the
  sitemaps and the hub lists. `/ranking/` and `/trade-with-russia/` are in all seven languages (with the net chart
  in each), and a country page whose title asks the Russia question opens with the trade with Russia and the net.
- **Structured data.** The map's head has JSON-LD for the website, the publishing organisation ("War Balance",
  no personal names) and the Dataset (licence CC BY 4.0, coverage 2022 to August 2026 (all of 2022), the JSON
  download). Each country page has a WebPage that is part of the Dataset.
- **The custom domain on GitHub Pages.** The deploy uses GitHub Actions, so `site/CNAME` documents the domain but does
  not set it: in the repository's Settings → Pages → Custom domain, enter `warbalance.org`, then tick Enforce
  HTTPS once the certificate is issued. DNS for the domain is at Cloudflare: four A records for GitHub Pages
  (185.199.108–111.153, not proxied; no AAAA records) and `www` as a CNAME to `intelligent-cream.github.io`. The
  earlier addresses (followthemoneyukraine.org and .com) redirect to warbalance.org with Cloudflare redirect rules.
- **Search Console and Bing Webmaster Tools.** Use the project's own email account. Add the site as a Domain property
  (a DNS TXT record at Cloudflare) or as a URL-prefix property with an HTML tag: put the tag in the head of
  `site/index.html` next to the canonical link, deploy, verify, then submit `https://warbalance.org/sitemap.xml`.
