// Round 54 (findable pages): the site's static pages, written at deploy next to the share cards (share_cards.mjs calls
// writeSeoPages with the map already open in Chromium; run on its own: node pipeline/seo_pages.mjs). Every number comes
// from the map itself (seo_extract.mjs), so a page always says what the map says. It writes, in site/ (not in git):
//   country/<slug>/index.html   one page per country, English; <lang>/country/<slug>/ in the six other languages (round 56)
//   c/<iso>.html                the old share links: canonical to the country page, and sent there
//   ranking/, support-for-ukraine/, trade-with-russia/, how-it-works/, method/<page>/, limitations/, changelog/
//   <lang>/index.html           the map in each language (a copy of index.html with its own head; data-lang="de")
//   <slug>/ and group/<slug>/  the topic and group pages, one per entry of pipeline/seo_topics.json (round 55)
//   round 56 (more findable pages, seo_families.mjs): a page per part of the panel (<slug>/), per year
//   (ukraine-aid-<year>/, trade-with-russia-<year>/) and per pair of countries (compare/<a>-vs-<b>/), the Topics page
//   (topics/) listing them all; every topic, group and family page also in each language (<lang>/<path>), with
//   reciprocal hreflang; pages.css (the pages' shared look)
//   sitemap.xml (an index) with sitemap-<lang>.xml, robots.txt
//   round 58: index.md next to every page (its Markdown version, seo_markdown.mjs; not in the sitemap), a cite line on
//   every page, downloads/ (every language) with the map's own CSV export, and llms.txt / llms-full.txt
//   round 58b (seo_research.mjs, seo_families.json research): countries-with-sanctions-on-russia/ and
//   russia-oil-gas-revenue/ (every language), a sanctions section and question and the amounts frozen on every country
//   page, two columns of amounts on frozen-russian-assets/, the explainers' amounts, and the revenue series as CSV
//   round 59b: military-aid-to-ukraine-by-country/ (every language), the fuel tables on russian-oil-gas-buyers/, the
//   support by type on the support tracker and the country pages, what each country bought by fuel on its page, the
//   budget balance and the National Wealth Fund on russia-oil-gas-revenue/, and the fuel and military CSV files
//   round 62: img/ (img/<lang>/ in the other languages), the chart images (seo_images.mjs): support for Ukraine by
//   country in euros, as a share of GDP and per person, the net, the money toward Russia and the frozen assets, and one
//   per country page; each shown near the top of its page, its og:image, in its JSON-LD and in the sitemaps
// and, in git, the A–Z list of country pages and the data date in site/index.html (between markers; unchanged unless the
// data change) and pipeline/seo_lastmod.json (each page's content hash and the date it last changed, for lastmod).

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractSite, extractDocs } from "./seo_extract.mjs";
import * as T from "./seo_templates.mjs";
import { buildTopic, renderTopic, TOPIC_CSS, pathOf, mv, armedOf, style } from "./seo_topics.mjs";
import { htmlToMarkdown } from "./seo_markdown.mjs";
import { partEntries, yearEntries, compareEntries } from "./seo_families.mjs";
import * as I from "./seo_i18n.mjs";
import { countryDyn, plainText, mapRank, rankable, sameRegion, similarOf } from "./seo_country.mjs";
import * as RS from "./seo_research.mjs";
import * as DLX from "./seo_downloads.mjs";
import * as G from "./seo_images.mjs";

// the dataset's Zenodo DOI (all versions; resolves to the latest release), in every page's cite line
export const DATA_DOI = "10.5281/zenodo.23832992";
const HERE = dirname(fileURLToPath(import.meta.url));
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, "\\u003c")}</script>`;
const DATE_TOKEN = "__WB_LASTMOD__";
const CF_BEACON = `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "75bc871fc6fd41939f35f32036bc7902"}'></script>`;
const fmtDate = (iso, l) => new Date(iso + "T12:00:00Z").toLocaleDateString(l === "en" ? "en-GB" : l, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

// the site's look in a few lines: its fonts, colours and light/dark themes (the map's tokens, index.html :root)
const CSS = `:root{--bg:#f4f6f8;--surface:#fff;--ink:#15212b;--soft:#55636e;--line:#d3dae0;--ukr:#2a6fb0;--ukr-lo:#d6e6f4;--rus:#d4601a;--rus-t:#b4500f;--rus-lo:#fde2c6;--mid:#c9d0d6;--focus:#0d4f66;--fd:"Archivo","Helvetica Neue",Arial,sans-serif;--fb:"Source Sans 3","Segoe UI",system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e161d;--surface:#141f28;--ink:#e3e9ee;--soft:#97a6b1;--line:#2b3944;--ukr:#6aa8e0;--ukr-lo:#1b3350;--rus:#f39a52;--rus-t:#f39a52;--rus-lo:#4a2a14;--mid:#4f5962;--focus:#8fd3ea;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e161d;--surface:#141f28;--ink:#e3e9ee;--soft:#97a6b1;--line:#2b3944;--ukr:#6aa8e0;--ukr-lo:#1b3350;--rus:#f39a52;--rus-t:#f39a52;--rus-lo:#4a2a14;--mid:#4f5962;--focus:#8fd3ea;color-scheme:dark}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 var(--fb);font-variant-numeric:tabular-nums;overflow-wrap:break-word}
a{color:var(--ukr)}a:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.top{display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px;padding:10px 16px;background:var(--surface);border-bottom:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:8px;font:800 17px/1 var(--fd);font-stretch:115%;color:var(--ink);text-decoration:none;letter-spacing:-.01em}
.top nav{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:14.5px}.top nav a{color:var(--ink);text-decoration:none}.top nav a:hover{text-decoration:underline}
.wrap{max-width:820px;margin:0 auto;padding:18px 16px 40px}
.crumbs{font-size:13.5px;color:var(--soft)}.crumbs a{color:var(--soft)}
h1{font:800 clamp(26px,5vw,36px)/1.12 var(--fd);font-stretch:108%;letter-spacing:-.015em;margin:10px 0 12px;text-wrap:balance}
h2{font:700 13px/1.3 var(--fd);letter-spacing:.07em;text-transform:uppercase;color:var(--soft);margin:34px 0 10px}
h3{font:700 17px/1.3 var(--fd);margin:20px 0 6px}
.intro{font-size:18px;margin:0 0 14px}
.btn{display:inline-block;background:var(--ukr);color:#fff;padding:10px 16px;border-radius:8px;font-weight:700;text-decoration:none}
:root[data-theme="dark"] .btn{color:#141f28}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .btn{color:#141f28}}
.card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:16px 0}
.lbl{font-weight:600;margin:0}.big{font:800 clamp(40px,10vw,58px)/1.05 var(--fd);letter-spacing:-.03em;margin:4px 0}
.unit{font:600 16px var(--fb);letter-spacing:0;color:var(--ink)}.pos .big,.pos .tv{color:var(--ukr)}.neg .big,.neg .tv{color:var(--rus-t)}.mid .big{color:var(--soft)}
.fpos .big,.fpos .tv{color:color-mix(in srgb,var(--ukr) 60%,var(--soft))}.fneg .big,.fneg .tv{color:color-mix(in srgb,var(--rus-t) 60%,var(--soft))}
.chance{display:inline-block;font-size:13px;font-weight:700;border-radius:999px;padding:1px 9px;margin-left:6px;border:1px solid var(--line);white-space:normal;max-width:100%}.card .chance{margin-left:0}
.sub{color:var(--soft);font-size:14.5px;margin:4px 0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:10px}
.tile{border-radius:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--line)}.tile.pos{background:var(--ukr-lo);border-color:transparent}.tile.neg{background:var(--rus-lo);border-color:transparent}
.tile .tv{font:800 28px/1.15 var(--fd)}.tile p{margin:2px 0}
.party{border-left:4px solid #8a2f2f;padding:6px 12px;background:var(--surface)}
.note{border-left:4px solid var(--rus);padding:4px 12px;color:var(--ink)}
table{border-collapse:collapse;width:100%;font-size:14.5px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}th{font-weight:600;color:var(--soft)}td.n,th.n{text-align:right;white-space:nowrap}
.tbl{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
.letter{display:inline-block;font:700 11px/1 var(--fd);border:1px solid var(--line);border-radius:4px;padding:2px 4px;margin-left:2px;vertical-align:1px;color:var(--soft)}
.ev{font-size:12.5px;color:var(--soft);margin-left:4px}.psec{margin:10px 0 0;font-weight:600}
ol.rk,ul.plain{list-style:none;padding:0;margin:0}ol.rk li{display:grid;grid-template-columns:2.4em minmax(0,1fr) auto;gap:2px 8px;padding:5px 0;border-bottom:1px solid var(--line);align-items:baseline}
ol.rk .r{color:var(--soft);font-size:13px}ol.rk .v{white-space:nowrap;text-align:right}ol.rk .e{grid-column:2/-1;font-size:13px;color:var(--soft)}ol.rk li.here{font-weight:700}
.faq h3{font-size:17px}.faq p{margin:4px 0 12px}
.src li{margin:0 0 8px}.meta{color:var(--soft);font-size:14px;margin-top:30px}
.langs{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:14px}
footer{border-top:1px solid var(--line);padding:18px 16px 30px;font-size:14px;color:var(--soft);background:var(--surface)}footer .in{max-width:820px;margin:0 auto}footer a{color:var(--soft)}footer nav{display:flex;flex-wrap:wrap;gap:4px 14px;margin-bottom:8px}
.doc img{max-width:100%}.doc pre{overflow-x:auto}.doc code{font-size:.92em}.doc h2{text-transform:none;letter-spacing:0;color:var(--ink);font-size:23px;margin-top:30px}.doc h3{font-size:18px}
.doc .cl-date{font:400 14px var(--fb);color:var(--soft);margin-left:6px}
.az{columns:2 12em;column-gap:20px;font-size:15px;padding:0;list-style:none}.az li{break-inside:avoid;padding:1px 0}`;

// round 64 (SEO audit, fix 8a): the fonts are self-hosted (site/fonts/: the woff2 files Google Fonts served, their
// @font-face rules in fonts.css with font-display: swap, and their OFL licences), not a render-blocking stylesheet from
// Google: the rules go into pages.css and the map's head (between <!-- fonts:start --> and <!-- fonts:end -->), and the
// body font's Latin file is preloaded
export const FONT_PRELOAD = '<link rel="preload" href="/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossorigin>';
export const fontCss = async site => (await readFile(join(site, "fonts", "fonts.css"), "utf8")).replace(/^\/\*[\s\S]*?\*\/\n?/, "").trim();
export const fontBlock = css => `<!-- fonts:start -->\n${FONT_PRELOAD}\n<style>${css}</style>\n<!-- fonts:end -->`;
// round 56: the look is one shared file (pages.css, written with the pages; ?v= its hash), so each page carries only its words
let CSS_HREF = "/pages.css";
// round 58: every page's cite line ("War Balance, figures to August 2026, <its address>"), set by writeSeoPages with the
// data's month in each language; in the page (before the end of <main>), in its Markdown version and in its JSON-LD
let CITE = null;
const mdHref = canonical => { try { const u = new URL(canonical); return u.pathname.endsWith("/") ? u.pathname + "index.md" : ""; } catch { return ""; } };
function shell({ lang, title, description, canonical, alternates = [], image, imageAlt, ld = [], body, ogType = "website", iso = "", css = "", noindex = false }) {
  const cite = CITE ? CITE(lang, canonical) : "", md = mdHref(canonical);
  if (cite && ld[0] && /Page|Article/.test(ld[0]["@type"] || "")) ld = [{ ...ld[0], creditText: cite }, ...ld.slice(1)];
  if (cite) body = body.replace("</main>", `<p class="cite">${esc(cite)}</p>\n</main>`);
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>try { document.documentElement.dataset.theme = localStorage.getItem("ftm-theme") || "dark"; } catch (e) { document.documentElement.dataset.theme = "dark"; }</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${noindex ? "noindex, follow" : "max-image-preview:large"}">
<link rel="canonical" href="${canonical}">${md ? `\n<link rel="alternate" type="text/markdown" href="${md}">` : ""}
${alternates.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${u}">`).join("\n")}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="War Balance">
<meta property="og:locale" content="${T.OG_LOCALE[lang]}">
${alternates.filter(([l]) => l !== lang && T.OG_LOCALE[l]).map(([l]) => `<meta property="og:locale:alternate" content="${T.OG_LOCALE[l]}">`).join("\n")}
<meta property="og:title" content="${esc(title.replace(/ \| War Balance.*$/, ""))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">${/\.webp$/.test(image) ? `\n<meta property="og:image:type" content="image/webp">` : ""}
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title.replace(/ \| War Balance.*$/, ""))}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${esc(imageAlt)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#14213d">
${FONT_PRELOAD}
<link rel="stylesheet" href="${CSS_HREF}">${css ? `\n<style>${css}</style>` : ""}
${ld.map(jsonld).join("\n")}
${CF_BEACON}
</head>
<body${iso ? ` data-iso="${iso}"` : ""}>
${body}
</body>
</html>
`.replace(/\n{2,}/g, "\n");
}

// round 68: the typography of the map's strings in a language (see writeSeoPages), on every string of an extract
export const typoText = (l, x) => {
  let t = x;
  if (["de", "fr", "es"].includes(l)) t = t.replace(/(\d)%/g, "$1\u00a0%");
  if (l === "fr") t = t.replace(/’/g, "'").replace(/\((La|Le|Les|L') /g, (m, a) => "(" + a.toLowerCase() + " ").replace(/\(L'/g, "(l'");
  return t;
};
const TYPO_SKIP = new Set(["href", "url", "src", "id", "iso", "slug", "key", "k", "status"]);
function typo(o, l) {
  if (!["de", "fr", "es"].includes(l) || !o || typeof o !== "object") return o;
  for (const k of Object.keys(o)) { const v = o[k]; if (typeof v === "string") { if (!TYPO_SKIP.has(k)) o[k] = typoText(l, v); } else if (v && typeof v === "object") typo(v, l); }
  return o;
}

export async function writeSeoPages({ page, site, siteUrl, log = console.log }) {
  const t0 = Date.now();
  const U = siteUrl.replace(/\/$/, "") + "/", abs = p => U + p.replace(/^\//, "");
  const data = JSON.parse(await readFile(join(site, "data.json"), "utf8"));
  const DEMAND = JSON.parse(await readFile(join(HERE, "seo_demand.json"), "utf8"));
  const FAM = JSON.parse(await readFile(join(HERE, "seo_families.json"), "utf8"));
  const statePath = join(HERE, "seo_lastmod.json");
  const state = existsSync(statePath) ? JSON.parse(await readFile(statePath, "utf8")) : {};
  const today = new Date().toISOString().slice(0, 10), newState = {};
  const dataTo = data.data_to, lastYear = +dataTo.slice(0, 4);
  const NL = T.LANGS.filter(l => l !== "en");
  const lp = (l, path) => (l === "en" ? path : "/" + l + path);   // a page's address in a language
  // round 55: the topic and group pages, one per entry (pipeline/seo_topics.json)
  const TOPICS = JSON.parse(await readFile(join(HERE, "seo_topics.json"), "utf8")).pages;
  // round 58b: the research files the pages read (seo_families.json research)
  const RCFG = FAM.research || {}, readRes = async x => (x && x.file ? JSON.parse(await readFile(join(HERE, "..", x.file), "utf8")) : null);
  const SANC = await readRes(RCFG.sanctions), FROZ = await readRes(RCFG.frozen), REV = await readRes(RCFG.revenue);
  // round 59b: what each country bought by fuel, support for Ukraine by type, Russia's budget balance
  const FUEL = await readRes(RCFG.fuel), MIL = await readRes(RCFG.military), DEF = await readRes(RCFG.deficit);
  // the research entry whose file has the budget's balance by year (seo_families.json research.revenue.balance)
  const BAL = RCFG.revenue && RCFG.revenue.balance ? await readRes(RCFG[RCFG.revenue.balance]) : null;
  // round 64 (SEO audit, fix 7): governments' own published totals, for the country pages (seo_country.mjs officialText)
  const OFFICIAL = await readRes({ file: "research/2026-10/seo/official_totals_r64.json" });
  if (RCFG.revenue && RCFG.revenue.balance && !(BAL && Array.isArray(BAL.yearly))) throw new Error(`seo_families.json research.revenue.balance: ${RCFG.revenue.balance} has no balance by year`);
  const RPAGES = [RCFG.sanctions, RCFG.revenue, RCFG.military].filter(x => x && x.slug);
  const RPAGE = [SANC && RCFG.sanctions && { key: "sanctions", cfg: RCFG.sanctions, path: "/" + RCFG.sanctions.slug + "/" }, REV && RCFG.revenue && { key: "revenue", cfg: RCFG.revenue, path: "/" + RCFG.revenue.slug + "/" },
    MIL && RCFG.military && { key: "military", cfg: RCFG.military, path: "/" + RCFG.military.slug + "/" }].filter(Boolean);
  const rLabel = (x, l) => I.res(l, { sanctions: "sLabel", revenue: "rLabel", military: "mLabel" }[x.key]);
  const RESERVED = new Set([...RPAGES.map(x => x.slug), "c", "country", "group", "compare", "topics", "downloads", "ranking", "support-for-ukraine", "trade-with-russia", "how-it-works", "method", "limitations", "changelog", "content", "i18n", "share", "img", ...T.LANGS]);
  for (const e of TOPICS) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug) || (e.kind === "topic" && RESERVED.has(e.slug)) || !["topic", "group"].includes(e.kind)) throw new Error("seo_topics.json: bad slug or kind " + e.slug);
    if (TOPICS.filter(x => pathOf(x) === pathOf(e)).length > 1) throw new Error("seo_topics.json: two pages at " + pathOf(e));
  }

  // ----- everything the pages show, from the map (round 56: every country in every language) -----
  const EN = await page.evaluate(extractSite, { lang: "en" });
  const docs = await page.evaluate(extractDocs);
  // round 58: the downloads, from the map's own CSV export (site/views2.js csvFull, csvParts) with its default settings:
  // the same files the Sources view gives, so they cannot differ
  const CSV = await page.evaluate(() => {
    /* global csvFull, csvParts, tableRows, DATA */
    if (typeof csvFull !== "function" || typeof tableRows !== "function") return null;
    const rows = tableRows(Object.values(DATA).filter(c => c.gdp)).sort((a, b) => a.iso3.localeCompare(b.iso3));
    return { full: csvFull(rows), parts: csvParts(rows) };
  });
  if (!CSV) throw new Error("seo_pages: the map's CSV export (site/views2.js csvFull, csvParts, tableRows) is not loaded");
  const countries = EN.countries.filter(c => c.gdp);   // the map's shapes without an economy (Antarctica...) have no page
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  for (const c of countries) c.demand = DEMAND[c.iso] || {};
  // round 61: with the parts of its support the copy names first (own aid, EU share, refugee hosting) and the Kiel
  // Institute's bilateral figure (null where Kiel does not list it): the map's own measures
  const mOf = (c, k) => (c.measures && c.measures[k] && c.measures[k].v != null ? c.measures[k].v : null);
  const fOf = c => ({ ...c.fig, iso: c.iso, name: c.nameEn, party: c.party, armedFull: c.armedFull, noData: c.noData || c.mostlyNoData, mostly: c.mostlyNoData, demand: c.demand,
    parts: { aid: mOf(c, "part:aid") || 0, eu: mOf(c, "part:euaid") || 0, ref: mOf(c, "part:ref") || 0, kiel: mOf(c, "kiel") } });
  const LANG_DATA = { en: byIso }, WORDS = { en: EN.words }, RANK = { en: EN.rank.net }, DYNW = { en: EN.dynWords }, SRCS = { en: EN.srcs };
  // round 61: the support ranking and the chance key in every language (the page of support by country in every language)
  // round 63: and the trade ranking (the ranking and the trade page in every language)
  const RANK_UA = { en: EN.rank.ua }, RANK_RU = { en: EN.rank.rus }, CHKEY = { en: EN.chanceKey || "" };
  for (const l of NL) {
    const r = await page.evaluate(extractSite, { lang: l, isos: countries.map(c => c.iso) });
    // round 68 (QA review): the map's words in one typography with the pages' own phrases: a space before % in German,
    // French and Spanish ("0,72 % du PIB", as seo_i18n.mjs P writes it), and in French the straight apostrophe of the
    // phrase table and a lower-case article after "(" in a sentence ("(la Russie a conservé plus ...)")
    typo(r, l);
    LANG_DATA[l] = Object.fromEntries(r.countries.map(c => [c.iso, c]));
    WORDS[l] = r.words; RANK[l] = r.rank.net; DYNW[l] = r.dynWords; SRCS[l] = r.srcs; RANK_UA[l] = r.rank.ua; RANK_RU[l] = r.rank.rus; CHKEY[l] = r.chanceKey || "";
  }
  const tExtract = Date.now() - t0;
  const LC = l => countries.map(c => LANG_DATA[l][c.iso] || c);   // the countries as a language has them
  // round 57b: the fuel share of pre-war purchases is measured for some countries; the others hold one average (the
  // value most countries share): a page shows only a measured share, and the energy table leaves the average out
  const fuelCount = {};
  for (const c of countries) { const v = c.dyn && c.dyn.facts.fuelShare; if (v != null) fuelCount[v] = (fuelCount[v] || 0) + 1; }
  const fuelDefault = +Object.entries(fuelCount).sort((a, b) => b[1] - a[1])[0][0];
  for (const l of T.LANGS) for (const c of LC(l)) if (c.fuelSharePreWar != null && Math.abs(c.fuelSharePreWar - fuelDefault) < 1e-6) c.fuelSharePreWar = null;
  const slugs = new Set();
  for (const c of countries) { if (slugs.has(c.slug)) throw new Error("two countries with the slug " + c.slug); slugs.add(c.slug); }
  const cPath = (c, l = "en") => (l === "en" ? "" : "/" + l) + "/country/" + c.slug + "/";

  // ----- round 56: the generated families, and every page's name in every language -----
  const PARTS = partEntries(FAM, countries, TOPICS), YEARS = yearEntries(FAM, lastYear), COMPARES = compareEntries(FAM, countries);
  const topSlugs = new Set(TOPICS.filter(e => e.kind === "topic").map(e => e.slug));
  for (const e of [...PARTS, ...YEARS]) if (RESERVED.has(e.slug) || topSlugs.has(e.slug) || slugs.has(e.slug)) throw new Error("seo_families.json: slug taken " + e.slug);
  // round 63: the comparisons that are indexed (seo_families.mjs compareEntries: the listed pairs); the others are written
  // noindex and are not linked from the hubs
  const COMPARES_IX = COMPARES.filter(e => e.index);
  const FAMILY = [...TOPICS, ...PARTS, ...YEARS, ...COMPARES_IX];
  // round 58: the countries whose data have the kinds of supplies they sent to Russia (seo_families.json armedItems)
  const ARMED = armedOf(FAM.armedItems, countries, Object.fromEntries(Object.entries(data.countries).map(([iso, c]) => [iso, (c.military_rus && c.military_rus.src) || []])));
  const armedItemsOf = iso => (ARMED.find(x => x.iso === iso) || {}).items || null;
  const monthL = l => I.monthYear(dataTo, l), monthOnlyL = l => I.monthOnly(dataTo, l);
  // a country's name in a language: the map's own (site/i18n.js regionName, with its NAME_FIX table), the same on every page
  const nameL = (iso, l) => (LANG_DATA[l][iso] || byIso[iso]).name;
  // round 59b: a research file's country by its name in a language (the map's; the file's own for one without a page)
  const nameAnyL = (iso, l) => ((LANG_DATA[l][iso] || byIso[iso] || {}).name) || ((FUEL || {}).countries || {})[iso]?.name || ((MIL || {}).countries || {})[iso]?.name || iso;
  const nameIn = (iso, l) => I.inSentence(l, nameAnyL(iso, l));
  const labelOf = (e, l) => {
    if (e.kind === "part") return I.partName(l, e.key);
    if (e.kind === "year") return I.yearCopy(l, { kind: e.yearKind, y: e.year, partial: e.partial, month: monthOnlyL(l), n: 0, top: [], topV: "", dataTo: monthL(l) }).label;
    if (e.kind === "compare") return I.compareCopy(l, { A: nameL(e.a, l), B: nameL(e.b, l) }).label;
    return l === "en" ? e.label : ((I.TOPIC_T[e.slug] || {})[l] || [e.label])[0];
  };
  const bySlug = Object.fromEntries(FAMILY.filter(e => e.kind === "topic" || e.kind === "group").map(e => [e.slug, e]));
  const related = slug => bySlug[slug.replace(/^group\//, "")];
  const famAlts = path => T.LANGS.map(l => [l, abs(lp(l, path))]).concat([["x-default", abs(path)]]);

  // the generated folders start empty, so a renamed page leaves nothing behind
  for (const d of ["c", "country", "group", "compare", "topics", "downloads", "img", "ranking", "support-for-ukraine", "trade-with-russia", "how-it-works", "method", "limitations", "changelog", ...NL])
    await rm(join(site, d), { recursive: true, force: true });
  // a topic page's folder holds its index.html only (anything else there is not ours: stop rather than delete it)
  // (round 56: every part the config lists, also one that has no page this time, so a page that is no longer made goes)
  for (const e of [...TOPICS.filter(x => x.kind === "topic"), ...FAM.parts.list.filter(p => !topSlugs.has(p.slug) && !RESERVED.has(p.slug)), ...YEARS, ...RPAGES]) {
    const d = join(site, e.slug);
    if (!existsSync(d)) continue;
    const inside = await readdir(d);
    if (inside.some(f => f !== "index.html" && f !== "index.md")) throw new Error(`site/${e.slug}/ holds other files than a generated page: rename the topic`);
    await rm(d, { recursive: true, force: true });
  }
  // the shared look
  let allCss = CSS + "\n" + TOPIC_CSS + "\nul.rel{display:flex;flex-wrap:wrap;gap:6px 16px;list-style:none;padding:0}\n.more h3{font:700 14px/1.3 var(--fd);margin:14px 0 4px;color:var(--soft)}" +
    // round 57b: the country page's sections, folded below its top, with its story tags, data coverage and sources by tier
    "\ndetails.fold{border-top:1px solid var(--line)}details.fold>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;padding:2px 0}" +
    "details.fold>summary::-webkit-details-marker{display:none}details.fold>summary h2{flex:1;margin:14px 0}details.fold>summary::after{content:\"+\";font:700 20px/1 var(--fd);color:var(--soft)}" +
    "details.fold[open]>summary::after{content:\"\u2212\"}details.fold>summary:focus-visible{outline:2px solid var(--focus);outline-offset:2px}details.fold h3{font-size:15.5px;margin:16px 0 6px}" +
    "\nul.tags{list-style:none;padding:0;margin:0}ul.tags li{padding:7px 0;border-bottom:1px dashed var(--line)}ul.cov{list-style:none;padding:0;font-size:14.5px;margin:6px 0}ul.cov li{margin:3px 0}" +
    ".dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:6px}.dot.ok{background:#3a9a5b}.dot.est{background:#d9a21b}.dot.missing{background:#c84a3a}" +
    "\nul.src{list-style:none;padding:0;font-size:14.5px}ul.src li{margin:0 0 6px;overflow-wrap:anywhere}.tier{display:inline-block;font-size:11.5px;line-height:1.5;border-radius:4px;padding:0 6px;margin-right:4px;background:var(--line);color:var(--ink)}" +
    "details.fold-in>summary{cursor:pointer;color:var(--ukr);margin:12px 0 8px}table.peers td.m{min-width:7em}" +
    // round 58: the explainers at the top of a topic page, and every page's cite line
    "\n.explain{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:4px 16px 2px;margin:14px 0}.explain h2{text-transform:none;letter-spacing:0;color:var(--ink);font-size:17px;margin:12px 0 4px}.explain p{margin:4px 0 12px}" +
    ".cite{color:var(--soft);font-size:13.5px;margin-top:26px;overflow-wrap:anywhere}" +
    // round 58b: the tables of every country's sanctions and of Russia's oil and gas revenue
    "\ntable.sanc td,table.rev td{font-size:14px}table.sanc td:first-child{min-width:8em}table.rev td.n{white-space:nowrap}p.stock a,div.sanc a{overflow-wrap:anywhere}" +
    // round 59b: the fuel, military and budget balance tables (a range or a label beneath a figure)
    "\ntable.fuel td,table.mil td{font-size:14px}td.n .s{display:block;font-size:12.5px;line-height:1.35;color:var(--soft);white-space:normal;font-weight:400}table.fuel td:nth-child(2),table.mil td:nth-child(2){min-width:7em}";
  // round 68: the page of support by country's table on a phone (no rank column, tighter cells), the folded method note
  allCss += "\ntable.hub td,table.hub th{padding:6px 6px}table.hub td.n{white-space:nowrap}@media (max-width:520px){table.hub .r{display:none}table.hub{font-size:14px}table.hub td,table.hub th{padding:5px 4px}}details.howbuilt{margin:14px 0}details.howbuilt p{margin:6px 0}";
  allCss += G.FIGURE_CSS;
  const FONT_CSS = await fontCss(site);
  allCss = FONT_CSS + "\n" + allCss;
  await writeFile(join(site, "pages.css"), allCss + "\n");
  CSS_HREF = "/pages.css?v=" + createHash("sha256").update(allCss).digest("hex").slice(0, 8);

  // ----- writing, with lastmod from a hash of what the page says -----
  const written = [];   // { path, alternates: [[lang, url]] }
  // round 63: a page kept out of the index (noindex: a thin comparison, a territory without data of its own) is written and
  // reachable, but not in the sitemaps and without hreflang
  async function put(path, html, alternates = [], images = [], { noindex = false } = {}) {
    // round 65 (SEO audit, fix 1): the hash of what the page says (seo_templates.mjs pageContent: title, description and
    // the text of <main>), not of its template, fonts or scripts, so only a real change of content moves its date
    const hash = T.contentHash(html), date = T.lastmodOf(state[path], hash, today);
    newState[path] = [hash, date];
    const file = join(site, path.replace(/^\//, ""), path.endsWith("/") ? "index.html" : "");
    await mkdir(dirname(file), { recursive: true });
    const out = html.split(DATE_TOKEN).join(date).replace(/__WB_LASTMOD_HUMAN_(\w+)__/g, (m, l) => fmtDate(date, l));
    await writeFile(file, out);
    // round 58: its Markdown version (not in the sitemap; the HTML stays canonical)
    if (path.endsWith("/")) await writeFile(join(dirname(file), "index.md"), htmlToMarkdown(out, abs(path)));
    written.push({ path, alternates, lastmod: date, images, noindex });
  }
  const human = l => `__WB_LASTMOD_HUMAN_${l}__`;

  const home = l => (l === "en" ? "/" : "/" + l + "/");
  const top = l => `<header class="top"><a class="brand" href="${home(l)}"><img src="/favicon.svg" alt="" width="20" height="20">War Balance</a>
<nav aria-label="Site"><a href="${home(l)}">${T.L(l, "map")}</a><a href="${lp(l, "/ranking/")}">${T.L(l, "ranking")}</a><a href="${lp(l, "/topics/")}">${esc(I.s(l, "topics"))}</a><a href="/how-it-works/">${T.L(l, "how")}</a></nav></header>`;
  const foot = l => `<footer><div class="in"><nav aria-label="More"><a href="${lp(l, "/ranking/")}">${T.L(l, "ranking")}</a><a href="${lp(l, "/support-for-ukraine/")}">${T.L(l, "supportPage")}</a><a href="${lp(l, "/trade-with-russia/")}">${T.L(l, "tradePage")}</a><a href="${lp(l, "/topics/")}">${esc(I.s(l, "allTopics"))}</a><a href="/how-it-works/">${T.L(l, "how")}</a><a href="/limitations/">${T.L(l, "limitations")}</a><a href="/changelog/">${T.L(l, "changelog")}</a></nav>
<p>${T.L(l, "preview")} ${T.L(l, "dataTo", { to: fmtDate(dataTo, l), upd: human(l) })}. ${T.L(l, "licence", { link: '<a href="/data.json">data.json</a>' })}</p></div></footer>`;
  const crumbs = (l, items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([n, h], i) => (h && i < items.length - 1 ? `<a href="${h}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`)).join(" › ")}</nav>`;
  const crumbLd = items => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, h], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: abs(h) })) });
  const DATASET = { "@id": U + "#dataset" };
  const langLinks = (l, path) => `<p class="langs" aria-label="${esc(T.L(l, "languages"))}">${T.LANGS.filter(x => x !== l).map(x => `<a href="${lp(x, path)}" hreflang="${x}" lang="${x}">${T.LANG_NAMES[x]}</a>`).join("")}</p>`;
  const relList = (l, list) => (list.length ? `<ul class="rel">${list.map(e => `<li><a href="${lp(l, pathOf(e))}">${esc(labelOf(e, l))}</a></li>`).join("")}</ul>` : "");

  // ----- round 56: the family pages' models, built once per language (their rows tell the country pages what links them) -----
  const dataToL = Object.fromEntries(T.LANGS.map(l => [l, monthL(l)]));
  CITE = (l, url) => I.s(l, "cite", { dataTo: dataToL[l] || dataToL.en, doi: DATA_DOI, url });
  const MODELS = {};   // path -> { l: model }
  // round 61 (CTR): the values a topic's title and text may use besides its table: the data's last year ("2022–2026"),
  // and on the frozen-assets page the amounts frozen (frozen_amounts_r58.json: Euroclear, the reserves in the EU)
  const topicVars = (e, l) => ({ y1: lastYear, ...(FROZ && RCFG.frozen && e.slug === RCFG.frozen.topic ? RS.frozenVars(l, FROZ) : {}) });
  for (const e of [...TOPICS, ...PARTS, ...YEARS]) {
    MODELS[pathOf(e)] = {};
    for (const l of T.LANGS) {
      const m = buildTopic(e, LC(l), TOPICS, { dataTo: dataToL.en, words: WORDS.en, l, armed: ARMED, vars: topicVars(e, l) });
      m.dataToL = dataToL[l];
      if (e.year) m.yearL = e.partial ? I.s(l, "yearTo", { y: e.year, month: monthOnlyL(l) }) : String(e.year);
      MODELS[pathOf(e)][l] = m;
    }
  }
  const inRows = {};   // iso -> [entries whose table lists it]
  for (const e of [...PARTS]) for (const c of MODELS[pathOf(e)].en.rows) (inRows[c.iso] = inRows[c.iso] || []).push(e);
  const groupsOf = {}; for (const e of TOPICS.filter(x => x.kind === "group")) for (const i of e.members) (groupsOf[i] = groupsOf[i] || []).push(e);
  const comparesOf = {}; for (const e of COMPARES_IX) for (const i of [e.a, e.b]) (comparesOf[i] = comparesOf[i] || []).push(e);
  // round 63: a territory without any data of its own (not "mostly no data"): its page is noindex, out of the sitemaps and
  // the hubs' lists, without hreflang
  const noOwn = c => !!(c && c.noData && !c.mostlyNoData);

  // ----- round 62: the chart images (seo_images.mjs), from the figures the pages show; drawn at the end of the run -----
  const HOST = new URL(siteUrl).host, JOBS = [];
  // the map's two-letter codes (site/i18n.js ISO2), and those of holders too small for the map's atlas
  const ISO2M = { LIE: "LI", ...(await page.evaluate(() => (typeof ISO2 !== "undefined" ? ISO2 : {}))) };
  const imgPeriod = l => I.img(l, "period", { dataTo: dataToL[l] }), imgSource = l => I.img(l, "source", { host: HOST, date: fmtDate(dataTo, l) });
  const addImg = (model, path) => { if (!model) return null; JOBS.push({ path, model }); return { path, alt: model.alt, l: model.l, caption: model.caption || "" }; };
  const sureRow = x => !!x && x.level === "sure";
  // a ranking chart's alt text: what it shows, its period, then every row as its figure is written on the chart
  const rankAlt = (l, k, rows) => `${I.img(l, k)}, ${imgPeriod(l)}: ${rows.map(r => `${r.name} ${r.value}`).join(", ")}.`;
  const rankImg = (l, key, title, unitKey, altKey, rows, extraLegend = []) => {
    const pale = rows.some(r => /F$/.test(r.tone));
    const legend = [{ text: I.img(l, "range") }, ...(pale ? [{ text: I.img(l, "paler") }] : []), ...extraLegend];
    const m = G.rankChart({ key, l, title, unit: I.img(l, unitKey), period: imgPeriod(l), source: imgSource(l), rows, legend, alt: rankAlt(l, altKey, rows) });
    m.caption = `${I.img(l, altKey)}, ${imgPeriod(l)}`;
    return addImg(m, G.imgPath(l, key));
  };
  const RIMG = Object.fromEntries(T.LANGS.map(l => [l, {}]));
  for (const l of T.LANGS) {
    const nmI = iso => nameL(iso, l), uaAll = RANK_UA[l].groups.flatMap(g => g.rows), fg = iso => byIso[iso].fig, gdpOf = iso => byIso[iso].gdp;
    // support for Ukraine in euros (the table "In euros" of the page of support by country) and as a share of GDP
    // (its ranking, economies of €5bn and more), each with its likely range
    RIMG[l].eur = rankImg(l, "eur", I.img(l, "tEur"), "uEur", "aEur", uaAll.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 15)
      .map(r => ({ name: nmI(r.iso), v: r.eurBn, lo: fg(r.iso).uaLo, hi: fg(r.iso).uaHi, value: r.eur.replace(/^\+/, ""), note: r.sure ? "" : r.words, tone: G.toneOf(r.eurBn, r.sure) })));
    RIMG[l].gdp = rankImg(l, "gdp", I.img(l, "tGdp"), "uGdp", "aGdp", uaAll.filter(r => !r.small).sort((a, b) => b.pct - a.pct).slice(0, 15)
      .map(r => ({ name: nmI(r.iso), v: r.pct, lo: (100 * fg(r.iso).uaLo) / gdpOf(r.iso), hi: (100 * fg(r.iso).uaHi) / gdpOf(r.iso), value: r.value.replace(/^\+/, ""), note: r.sure ? "" : r.words, tone: G.toneOf(r.pct, r.sure) })));
    // per person: the rows of the per-capita page (seo_topics.json ukraine-aid-per-capita)
    const ppM = (MODELS["/ukraine-aid-per-capita/"] || {})[l];
    if (ppM) RIMG[l].pp = rankImg(l, "pp", I.img(l, "tPp"), "uPp", "aPp", ppM.rows.slice(0, 15).map(c => {
      const x = mv(c, "ua"), per = v => (v * 1000) / c.pop;
      return { name: c.name, v: per(x.v), lo: x.lo == null ? null : per(x.lo), hi: x.hi == null ? null : per(x.hi), value: I.PP(l, per(x.v)), note: sureRow(x) ? "" : x.chance, tone: G.toneOf(x.v, sureRow(x)) };
    }));
    // the money that moved toward Russia: the rows of countries-helping-russia/ (the net below zero, parties apart), by
    // euros, drawn as the size toward Russia
    const ruM = (MODELS["/countries-helping-russia/"] || {})[l];
    if (ruM) RIMG[l].rus = rankImg(l, "rus", I.img(l, "tRus"), "uRus", "aRus", ruM.rows.slice().sort((a, b) => mv(a, "net").v - mv(b, "net").v).slice(0, 15).map(c => {
      const x = mv(c, "net");
      return { name: c.name, v: -x.v, lo: -x.hi, hi: -x.lo, value: "−" + I.E(l, x.v), note: sureRow(x) ? "" : x.chance, tone: sureRow(x) ? "ru" : "ruF" };
    }));
    // the Russian assets frozen in each holding country (frozen_amounts_r58.json, the two columns of frozen-russian-assets/):
    // the central bank reserves and the private assets, each the country's official figure; no figure is not zero
    if (FROZ && RCFG.frozen) {
      const fr = Object.keys(FROZ.countries).map(iso => ({ iso, f: RS.frozenOf(FROZ, iso) })).filter(x => x.f && !x.f.none)
        .map(({ iso, f }) => { const cb = f.cbr && f.cbr.v != null ? f.cbr : null, pv = f.priv && f.priv.v != null ? f.priv : null; return { iso, cb, pv, tot: (cb ? cb.v : 0) + (pv ? pv.v : 0) }; })
        .filter(x => x.cb || x.pv).sort((a, b) => b.tot - a.tot || a.iso.localeCompare(b.iso)).slice(0, 15);
      const none = Object.keys(FROZ.countries).filter(iso => { const f = RS.frozenOf(FROZ, iso); return f && !f.none && !(f.cbr && f.cbr.v != null) && !(f.priv && f.priv.v != null); })
        .concat((FROZ.no_public_figure || {}).list || []);
      // (a holder without a page, such as Liechtenstein: its name in the language from its two-letter code)
      const frName = iso => { const n = nameAnyL(iso, l); if (n !== iso) return n; const two = ISO2M[iso]; try { if (two) return new Intl.DisplayNames([l], { type: "region" }).of(two); } catch { /* the file's own name */ } return ((FROZ.countries[iso] || {}).name || iso).replace(/ \(.*$/, ""); };
      const fig = x => (x ? RS.stockText(l, x).fig : "–"), rng = (x, k) => (x ? (x[k] != null ? x[k] : x.v) : 0);
      const C2 = "#8fb5da";
      const rows = fr.map(x => ({ name: frName(x.iso), v: x.tot, lo: rng(x.cb, "lo") + rng(x.pv, "lo"), hi: rng(x.cb, "hi") + rng(x.pv, "hi"), segs: [{ v: x.cb ? x.cb.v : 0, color: G.TONE.ua }, { v: x.pv ? x.pv.v : 0, color: C2 }],
        value: `${fig(x.cb)} + ${fig(x.pv)}`, label: `<b style="color:#1f5a94">${esc(fig(x.cb))}</b> + <b style="color:#4f7fae">${esc(fig(x.pv))}</b>`, tone: "ua" }));
      const m = G.rankChart({ key: "frozen", l, title: I.img(l, "tFrozen"), unit: I.img(l, "uFrozen"), period: imgPeriod(l), source: imgSource(l), rows,
        legend: [{ color: G.TONE.ua, text: I.res(l, "colCbr") }, { color: C2, text: I.res(l, "colPriv") }, ...(none.length ? [{ text: `${I.cap(I.res(l, "noFig"))}: ${I.list3(l, none.map(frName))}` }] : [])],
        alt: `${I.img(l, "aFrozen")}, ${imgPeriod(l)} (${I.res(l, "colCbr")} + ${I.res(l, "colPriv")}): ${rows.map(r => `${r.name} ${r.value}`).join(", ")}.` });
      m.caption = `${I.img(l, "aFrozen")}, ${imgPeriod(l)}`;
      m.space = 330;
      RIMG[l].frozen = addImg(m, G.imgPath(l, "frozen"));
    }
  }
  // the net (the ranking page; round 63: in every language): the map's own groups "Toward Ukraine" and "Toward Russia"
  // (very likely), the furthest 8 of each among economies of €5bn and more, with their likely range
  for (const l of T.LANGS) {
    const gs = RANK[l].groups, g0 = gs.find(g => g.g === 0), g6 = gs.find(g => g.g === 6), fg = iso => byIso[iso].fig;
    const row = r => ({ rank: r.rank, name: nameL(r.iso, l), v: r.pct, lo: fg(r.iso).netLoPct, hi: fg(r.iso).netHiPct, value: r.value, tone: G.toneOf(r.pct, true) });
    const up = g0 ? g0.rows.filter(r => r.rank).sort((a, b) => a.rank - b.rank).slice(0, 8).map(row) : [];
    const down = g6 ? g6.rows.filter(r => r.rank).sort((a, b) => a.rank - b.rank).slice(0, 8).map(row) : [];
    if (down.length) down[0].sepBefore = g6.label;
    if (up.length) up[0].sepBefore = g0.label;
    const rows = [...up, ...down];
    if (rows.length) {
      const m = G.rankChart({ key: "net", l, title: I.img(l, "tNet"), unit: I.img(l, "uNet"), period: imgPeriod(l), source: imgSource(l), rows,
        legend: [{ text: I.s(l, "legendSigned") }, { text: I.img(l, "range") }], alt: rankAlt(l, "aNet", rows) });
      m.caption = `${I.img(l, "aNet")}, ${imgPeriod(l)}`;
      RIMG[l].net = addImg(m, G.imgPath(l, "net"));
    }
  }
  // a country's chart in a language: the map's words for its three numbers and the parts of its support
  const CW = Object.fromEntries(T.LANGS.map(l => [l, { period: imgPeriod(l), source: imgSource(l), unit: I.img(l, "uCountry"), legendSigned: I.s(l, "legendSigned"), range: I.img(l, "range"),
    support: T.L(l, "support"), trade: T.L(l, "trade"), frozen: T.L(l, "frozen"), net: T.L(l, "net"), ofGdp: T.L(l, "ofGdp"), party: T.L(l, "party"),
    partNames: { aid: I.partName(l, "aid"), euaid: I.partName(l, "euaid"), ref: I.partName(l, "ref") }, other: I.img(l, "other") }]));
  const countryImg = (l, c0, c, title) => addImg(G.countryChart({ c, l, earner: !!c0.earner, words: { ...CW[l], title } }), G.imgPath(l, "country", c0.slug));
  // the ImageObject of a page's main image (its primaryImageOfPage), and a figure's caption
  const imgLd = img => (img ? { primaryImageOfPage: G.imageObject(img, abs) } : {});

  const groupOfMap = {}; for (const g of EN.rank.net.groups) for (const r of g.rows) groupOfMap[r.iso] = r;
  // ----- round 57b: each country's neighbours by land (the map's own borders, countries-50m.json), its place in the
  // map's ranking and in its groups by the map's rule, and the countries with a similar result (seo_country.mjs) -----
  const RANKROW = Object.fromEntries(countries.map(c => [c.iso, { iso: c.iso, gdp: c.gdp, party: c.party, noData: c.noData || c.mostlyNoData, region: c.region,
    level: c.fig.cN ? c.fig.cN.level : null, side: c.fig.cN ? c.fig.cN.side : null, netPct: c.fig.netPct }]));
  const RROWS = Object.values(RANKROW);
  const topo = JSON.parse(await readFile(join(site, "countries-50m.json"), "utf8"));
  const isoOfN = {}; for (const [iso, c] of Object.entries(data.countries)) isoOfN[c.n] = iso;
  const arcOwners = new Map(), walkArcs = (a, f) => (typeof a === "number" ? f(a < 0 ? ~a : a) : a.forEach(x => walkArcs(x, f)));
  for (const g of topo.objects.countries.geometries) {
    const iso = isoOfN[g.id];
    if (iso && g.arcs) walkArcs(g.arcs, a => { if (!arcOwners.has(a)) arcOwners.set(a, new Set()); arcOwners.get(a).add(iso); });
  }
  const NBR = {};
  for (const set of arcOwners.values()) if (set.size > 1) for (const a of set) for (const b of set) if (a !== b) (NBR[a] = NBR[a] || new Set()).add(b);
  const SIDES = new Set(["RUS", "UKR"]);   // the two sides the money is measured toward
  const PEERS = {};
  for (const c of countries) {
    const r = RANKROW[c.iso];
    const nb = [...(NBR[c.iso] || [])].filter(i => RANKROW[i] && !SIDES.has(i) && !RANKROW[i].noData && byIso[i].net && sameRegion(RANKROW[i].region, r.region)).sort();
    const groups = TOPICS.filter(e => e.kind === "group" && (e.members || []).includes(c.iso)).map(e => ({ e, ...(mapRank(r, RROWS.filter(x => e.members.includes(x.iso))) || {}) })).filter(g => g.n);
    PEERS[c.iso] = { rankable: rankable(r) && !SIDES.has(c.iso), world: mapRank(r, RROWS), neighbours: nb, similar: similarOf(r, RROWS.filter(x => !SIDES.has(x.iso))).map(x => x.iso), groups };
    // the map's own numbers in its ranking (views.js renderRanking) are the same rule
    const mine = PEERS[c.iso].world, map = (groupOfMap[c.iso] || {}).rank ?? null;
    if ((mine ? mine.n : null) !== map) throw new Error(`seo_country.mjs mapRank: ${c.iso} ${mine && mine.n} but the map's ranking says ${map}`);
  }
  const rowL = (l, iso) => {
    const x = LANG_DATA[l][iso] || byIso[iso], r = RANKROW[iso];
    return { iso, name: x.name, href: cPath(byIso[iso], l), netPct: x.fig.netPct, netEur: x.fig.net, level: r.level, side: r.side, chance: x.net ? x.net.chance : "", party: r.party, partyWord: WORDS[l].party, gdp: x.gdp };
  };
  const EU27 = new Set("AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split(" "));
  // round 68 (QA review: an 80-word method paragraph above every table): below the table, folded, with the method's link
  const howFold = (l, paras) => (paras.filter(Boolean).length ? `<details class="fold-in howbuilt"><summary>${esc(I.s(l, "howBuilt"))}</summary>${paras.filter(Boolean).map(x => `<p class="sub">${esc(x)}</p>`).join("")}<p class="sub"><a href="/how-it-works/">${esc(T.L(l, "how"))} →</a></p></details>` : "");
  const fold = (id, title, html) => (html ? `<details class="fold" id="${id}"><summary><h2>${esc(title)}</h2></summary>\n${html}\n</details>` : "");

  // ----- country pages -----
  const order = EN.rank.net.order;
  const groupOfL = {};
  for (const l of T.LANGS) { groupOfL[l] = {}; for (const g of RANK[l].groups) for (const r of g.rows) groupOfL[l][r.iso] = { label: g.label, g: g.g, rank: r.rank, row: r }; }
  const groupOf = groupOfL.en;
  // round 60 (audit: "Nearby in the ranking · 7" read as a count): a rank says of how many, as the ranking page does
  const groupSize = (l, g) => (RANK[l].groups.find(x => x.g === g.g) || { rows: [] }).rows.filter(r => r.rank).length;
  // round 60 (audit: Belgium 2023 1.3 + 1.4 ≠ 6.1): a by-year table has the frozen money's column wherever there is
  // any, so each row adds up: support + trade + frozen = net
  const hasFrozen = c => (c.years || []).some(y => Math.abs(y.frozenBn || 0) >= 0.0005);
  // round 68 (QA review: "Russian money frozen: Froze Russian money: ..."): the map's verb already starts with its label
  const frozenLine = (l, z) => { const v = String(z.verb || ""), i = v.indexOf(": "); return i > 0 ? `<b>${esc(v.slice(0, i))}:</b> ${esc(v.slice(i + 2))}` : `<b>${esc(T.L(l, "frozen"))}:</b> ${esc(v)}`; };
  const tileHtml = (l, label, n) => `<div class="tile ${n.pos ? (n.unc ? "fpos" : "pos") : n.unc ? "fneg" : "neg"}"><p class="lbl">${esc(label)}</p><p>${esc(n.pre)}</p><p class="tv">${esc(n.big)}</p><p class="sub">${esc([n.post, n.eur].filter(Boolean).join(" · "))}</p><p class="sub">${esc(n.range)}${n.chance ? ` <span class="chance">${esc(n.chance)}</span>` : ""}</p></div>`;
  const cap = x => (x ? x.charAt(0).toUpperCase() + x.slice(1) : x);
  const moreAbout = (l, c0) => {
    const name = l === "en" ? c0.nameEn : LANG_DATA[l][c0.iso].name;
    const gs = groupsOf[c0.iso] || [], cs = comparesOf[c0.iso] || [], ps = (inRows[c0.iso] || []).slice().sort((a, b) => Math.abs(mv(c0, b.rank).v) - Math.abs(mv(c0, a.rank).v)).slice(0, 12);
    const years = YEARS.filter(e => e.yearKind === "ua");
    return `<section class="more"><h2 id="more">${esc(I.s(l, "more_about", { name }))}</h2>
${gs.length ? `<h3>${esc(I.s(l, "groups"))}</h3>${relList(l, gs)}` : ""}
${cs.length ? `<h3>${esc(I.s(l, "compared"))}</h3><ul class="rel">${cs.map(e => `<li><a href="${lp(l, pathOf(e))}">${esc(labelOf(e, l))}</a></li>`).join("")}</ul>` : ""}
${ps.length ? `<h3>${esc(I.s(l, "partsRanked"))}</h3>${relList(l, ps)}` : ""}
<h3>${esc(I.s(l, "byYearPages"))}</h3><ul class="rel">${years.map(e => `<li><a href="${lp(l, pathOf(e))}">${e.year}</a></li>`).join("")}<li><a href="${lp(l, "/support-for-ukraine/")}">${esc(T.L(l, "supportPage"))}</a></li><li><a href="${lp(l, "/topics/")}">${esc(I.s(l, "allTopics"))}</a></li></ul></section>`;
  };
  // round 61: each country page's heading in each language, the words other pages link it with (year and compare pages)
  const H1 = Object.fromEntries(T.LANGS.map(l => [l, {}]));
  for (const c0 of countries) {
    const ls = T.countryLangs(fOf(c0)), thin = noOwn(c0), alts = thin ? [] : ls.map(l => [l, abs(cPath(c0, l))]);
    if (ls.length > 1 && !thin) alts.push(["x-default", abs(cPath(c0))]);
    for (const l of ls) {
      const c = LANG_DATA[l][c0.iso], f = { ...fOf(c0), nameL: c.name, words: WORDS[l], loc: c, tradeFirst: FAM.country && FAM.country.tradeFirst, phrasing: FAM.country && FAM.country.phrasing }, copy = T.countryCopy(l, f);
      H1[l][c0.iso] = copy.h1;
      // round 62: its chart (support with its parts, trade, frozen money and the net), titled with the page's question
      const cimg = c0.noData || c0.mostlyNoData ? null : countryImg(l, c0, c, copy.h1);
      // round 57b: the page's sections and questions (seo_country.mjs), from the map's data in this language
      const pr = PEERS[c0.iso];
      // round 58b: its sanctions on Russia (sanctions_r58.json) and the amounts frozen there (frozen_amounts_r58.json)
      const rr = SANC ? RS.sanctionsOf(SANC, c0.iso) : null;
      const regime = rr ? RS.sanctionsBlock(l, rr, { N: c.name, Nt: I.inSentence(l, c.name), sov: rr.sov ? ((LANG_DATA[l][rr.sov] || byIso[rr.sov] || {}).name || rr.sov) : "" }, lp(l, "/" + RCFG.sanctions.slug + "/")) : null;
      const stock = FROZ ? RS.frozenLines(l, FROZ, c0.iso) : "";
      // round 59b: what it bought from Russia by fuel, and its support for Ukraine by type
      const Nt0 = I.inSentence(l, c.name), names0 = { N: c.name, Nt: Nt0, NtCap: cap(Nt0), dataTo: dataToL[l] };
      const fuelB = FUEL ? RS.fuelCountry(l, FUEL, c0.iso, { ...(RCFG.fuel.country || {}), crudeYears: RCFG.fuel.crudeYears }, names0, lp(l, "/" + RCFG.fuel.topic + "/")) : null;
      const milB = MIL ? RS.milCountry(l, MIL, c0.iso, names0, lp(l, "/" + RCFG.military.slug + "/")) : null;
      const dyn = countryDyn(c, { l, words: WORDS[l], dw: DYNW[l], srcs: SRCS[l], L: k => T.L(l, k), dataTo: dataToL[l], month: monthOnlyL(l), tradeYears: [data.years[0], data.years[4]],
        peers: { ...pr, groups: pr.groups.map(g => ({ slug: g.e.slug, label: labelOf(g.e, l), n: g.n, of: g.of })) }, row: iso => rowL(l, iso), home: home(l), fuelDefault,
        demand: c0.demand, eu: EU27.has(c0.iso), armedFull: c0.armedFull, relations: (FAM.country || {}).relations, armed: armedItemsOf(c0.iso), regime, stock, ask: copy.ask, fuel: fuelB, mil: milB, official: OFFICIAL && OFFICIAL.countries[c0.iso] });
      const faq = dyn.faq;
      const url = abs(cPath(c0, l));
      const crumbItems = [[T.L(l, "map"), home(l)], [T.L(l, "ranking"), lp(l, "/ranking/")], [c.name, cPath(c0, l)]];
      const g = groupOfL[l][c0.iso], i = order.indexOf(c0.iso);
      const near = i < 0 ? [] : order.slice(Math.max(0, i - 3), i + 4);
      const cls = c.net ? (c0.earner ? "mid" : c.net.unc ? (c.net.pos ? "fpos" : "fneg") : c.net.pos ? "pos" : "neg") : "mid";
      let main = "";
      if (c0.noData || c0.mostlyNoData) {
        main = `<section class="card mid"><p class="lbl">${T.L(l, "noData")}</p><p>${T.L(l, "noDataText")}</p></section>
${dyn.sections.map(x => fold(x.id, x.title, x.html)).join("\n")}`;
      } else {
        // round 60 (audit: "Toward Russia by too close to call"): the words, then the number, then the chance
        main = `<section class="card ${cls}" aria-label="${esc(T.L(l, "net"))}"><p class="lbl">${esc(c.net.pre)}</p>
<p class="big">${esc(c.net.big)} <span class="unit">${esc([c.net.post, T.L(l, "ofGdp")].filter(Boolean).join(" "))}</span></p>${c.net.chance ? `\n<p><span class="chance">${esc(c.net.chance)}</span></p>` : ""}
<p class="sub">${esc(c.net.range)} · ${esc(c.net.eur)} · ${esc(c.net.perYear)}</p>
<p>${esc(c.netSentence)}.${c.lead ? " " + esc(c.lead) : ""}</p>${c.net.chanceSentence ? `<p class="sub">${esc(c.net.chanceSentence)}</p>` : ""}</section>
${c0.party ? `<p class="party"><b>${esc(T.L(l, "party"))}.</b> ${esc(c.partyWhy)}</p>` : ""}
<div class="tiles">${tileHtml(l, T.L(l, "support"), c.ua)}${tileHtml(l, T.L(l, "trade"), c.rus)}</div>
<p class="sub">${esc(c.kept)}.</p>
${c.gainSplit ? `<ul class="plain gsplit">${[c.gainSplit.rus, c.gainSplit.own].map(x => `<li><b>${esc(cap(I.fmt(I.dyn(l, "ofWhich"), { x: x.label })))}:</b> ${esc(x.words)} (${esc(x.eur)}; ${esc(x.range)})</li>`).join("")}</ul><p class="sub">${esc(DYNW[l].gainNote)}</p>` : ""}
${c.frozen ? `<p class="sub">${frozenLine(l, c.frozen)} (${esc(c.frozen.eur)}).</p>` : ""}
${dyn.story.length ? `<section class="story" aria-labelledby="story"><h2 id="story">${esc(DYNW[l].story)}</h2><ul class="tags">${dyn.story.map(t => `<li><b>${esc(t.label)}</b> ${esc(t.body)}</li>`).join("")}</ul></section>` : ""}
${dyn.decide ? `<section aria-labelledby="decide"><h2 id="decide">${esc(I.dyn(l, "tDecide"))}</h2>${dyn.decide}</section>` : ""}
${fold("parts", T.L(l, "parts"), `${c.sections.map(s => `<p class="psec">${esc(s.pre)} ${esc(s.amount)}${s.post ? " " + esc(s.post) : ""} · ${esc(s.eur)}</p>
<div class="tbl"><table><tbody>${s.parts.map(p => `<tr><td>${esc(p.name)} <span class="letter" title="${esc(T.L(l, "lettersKey"))}">${esc(p.letter)}</span>${p.ev ? `<span class="ev">${esc(p.ev)}</span>` : ""}</td><td class="n">${esc(p.sign + p.amount)}</td><td class="n">${esc(p.eur)}</td></tr>`).join("")}</tbody></table></div>`).join("\n")}
<p class="sub">${esc(I.s(l, "legendParts"))} ${esc(T.L(l, "lettersKey"))}</p>`)}
${fold("by-year", T.L(l, "byYear"), `${dyn.years}
<div class="tbl"><table><thead><tr><th>${esc(T.L(l, "year"))}</th><th class="n">${esc(T.L(l, "support"))}</th><th class="n">${esc(T.L(l, "tradeYear"))}</th>${hasFrozen(c) ? `<th class="n">${esc(T.L(l, "frozen"))}</th>` : ""}<th class="n">${esc(T.L(l, "netYear"))}</th><th class="n">${esc(T.L(l, "total"))}</th></tr></thead>
<tbody>${c.years.map(y => `<tr id="y${y.y}"><td><a href="${lp(l, `/ukraine-aid-${y.y}/`)}">${y.y}</a>${y.ytd ? "*" : ""}</td><td class="n">${esc(y.ua)}</td><td class="n">${esc(y.rus)}</td>${hasFrozen(c) ? `<td class="n">${esc(y.frozen)}</td>` : ""}<td class="n">${esc(y.net)}</td><td class="n">${esc(y.cum)}</td></tr>`).join("")}</tbody></table></div>
<p class="sub">${esc(T.L(l, "yearNote", { y: lastYear, month: monthOnlyL(l) }))}</p>`)}
${dyn.sections.map(x => fold(x.id, x.title, x.html)).join("\n")}`;
      }
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, crumbItems)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>${copy.intro2 ? `\n<p>${esc(copy.intro2)}</p>` : ""}
${G.figureHtml(cimg)}
<p><a class="btn" href="${home(l)}#${c0.iso}">${esc(T.L(l, "openMap"))} →</a></p>
${main}
${faq.length ? `<section class="faq" id="faq"><h2>${esc(T.L(l, "faq"))}</h2>${faq.map(x => `<h3>${esc(x.q)}</h3><p>${x.a}</p>`).join("\n")}</section>` : ""}
<h2>${esc(T.L(l, "nearby"))}</h2>
${g ? `<p class="sub">${esc(g.label)}${g.rank ? " · " + esc(T.L(l, "rankOf", { r: g.rank, n: groupSize(l, g) })) : ""}</p><ol class="rk">${near.map(iso => { const x = groupOfL[l][iso], cc = LANG_DATA[l][iso] || byIso[iso]; return `<li${iso === c0.iso ? ' class="here"' : ""}><span class="r">${x.rank ? x.rank + "." : ""}</span>${iso === c0.iso ? esc(cc.name) : `<a href="${cPath(byIso[iso], l)}">${esc(cc.name)}</a>`}<span class="v">${esc(x.row.value)}</span><span class="e">${esc(x.label)} · ${esc(x.row.eur)}${x.row.sure ? "" : " · " + esc(x.row.chance)}</span></li>`; }).join("")}</ol>`
    : `<p>${esc(c0.party ? T.L(l, "party") : T.L(l, "notRanked"))}. <a href="${lp(l, "/ranking/")}">${esc(T.L(l, "ranking"))}</a></p>`}
${moreAbout(l, c0)}
${(c0.noData || c0.mostlyNoData) && c.sources && c.sources.length ? `<h2>${esc(T.L(l, "sources"))}</h2><ul class="src">${c.sources.map(s => `<li><a href="${esc(s.url || home(l) + "#" + c0.iso)}"${s.url ? ' rel="noopener"' : ""}>${esc(s.name)}</a></li>`).join("")}</ul>` : ""}
${c.nSources ? `<p class="sub">${esc(T.L(l, "moreSources", { n: c.nSources }))} <a href="${home(l)}#${c0.iso}">${esc(T.L(l, "openMap"))}</a> · <a href="/how-it-works/">${esc(T.L(l, "measured"))}</a></p>` : ""}
${ls.length > 1 && !thin ? `<p class="langs" aria-label="${esc(T.L(l, "languages"))}">${ls.filter(x => x !== l).map(x => `<a href="${cPath(c0, x)}" hreflang="${x}" lang="${x}">${T.LANG_NAMES[x]}</a>`).join("")}</p>` : ""}
</main>
${foot(l)}`;
      const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN,
        image: cimg ? [abs(cimg.path), abs(`share/${c0.iso.toLowerCase()}.png`)] : abs(`share/${c0.iso.toLowerCase()}.png`), ...imgLd(cimg), isPartOf: DATASET, about: { "@type": "Country", name: c0.nameEn } }, crumbLd(crumbItems)];
      if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: plainText(x.a) } })) });
      await put(cPath(c0, l), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: ls.length > 1 ? alts : [], image: cimg ? abs(cimg.path) : abs(`share/${c0.iso.toLowerCase()}.png`),
        imageAlt: cimg ? cimg.alt : c0.net ? T.L("en", "imgCountry", { name: c0.name, what: c0.net.pre + " " + c0.net.big }) : T.L("en", "imgNoData", { name: c0.name }), ld, body, ogType: "article", iso: c0.iso, noindex: thin }), ls.length > 1 ? alts : [], cimg ? [cimg] : [], { noindex: thin });
    }
    // the old share link (round 30's c/<iso>.html): kept for links already shared, sent on to the country page
    const copy = T.countryCopy("en", { ...fOf(c0), nameL: c0.name, words: WORDS.en, loc: c0, tradeFirst: FAM.country && FAM.country.tradeFirst, phrasing: FAM.country && FAM.country.phrasing }), to = cPath(c0), iso = c0.iso.toLowerCase();
    await mkdir(join(site, "c"), { recursive: true });
    await writeFile(join(site, "c", iso + ".html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(copy.title)}</title>
<meta name="description" content="${esc(copy.description)}">
<link rel="canonical" href="${abs(to)}">
<meta property="og:type" content="article"><meta property="og:site_name" content="War Balance">
<meta property="og:title" content="${esc(copy.og_title)}"><meta property="og:description" content="${esc(copy.og_description)}">
<meta property="og:url" content="${abs(to)}"><meta property="og:image" content="${abs(`share/${iso}.png`)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${abs(`share/${iso}.png`)}">
<meta http-equiv="refresh" content="0; url=${to}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
</head><body><p><a href="${to}">${esc(c0.name)}</a></p><script>location.replace("${to}" + location.hash);</script></body></html>
`);
  }
  const tCountries = Date.now() - t0 - tExtract;

  // ----- the ranking and the two lens pages -----
  const nm = iso => byIso[iso].name, ttl = iso => I.inSentence("en", nm(iso));
  // round 63: the Russia end is the group "Toward Russia" (g 6; it was g 5, "Leaning toward Russia"), its furthest three
  const G0 = EN.rank.net.groups.find(g => g.g === 0), G6 = EN.rank.net.groups.find(g => g.g === 6);
  const uaRows = EN.rank.ua.groups.flatMap(g => g.rows), ruRows = EN.rank.rus.groups.flatMap(g => g.rows);
  const big = r => byIso[r.iso].gdp >= 5;   // the map's ranking threshold for lists by size (MIN_GDP_RANK, € 5bn)
  // round 63: the facts by country code, named in each language (the ranking and the trade page in every language)
  const fIso = {
    topUa: (G0 ? G0.rows.filter(r => !r.small).slice(0, 3) : []).map(r => r.iso),
    topRu: (G6 ? G6.rows.filter(r => !r.small).slice(-3).reverse() : []).map(r => r.iso),
    parties: EN.rank.net.party.map(r => r.iso),
    // round 57: the lists are what their words say (Russia kept more: below zero; less: above)
    ruMore: ruRows.filter(r => r.eurBn < 0).sort((a, b) => a.eurBn - b.eurBn).slice(0, 2).map(r => [r.iso, r.eurBn]),
    ruLess: ruRows.filter(r => r.eurBn > 0).sort((a, b) => b.eurBn - a.eurBn).slice(0, 1).map(r => [r.iso, r.eurBn])[0],
  };
  const facts = {
    n: EN.rank.net.order.length,
    topUa: fIso.topUa.map(nm), topRu: fIso.topRu.map(nm), parties: fIso.parties.map(nm),
    euroTop: uaRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 2).map(r => [ttl(r.iso), r.eurBn]),
    shareTop: uaRows.filter(r => r.sure && big(r)).sort((a, b) => b.pct - a.pct).slice(0, 3).map(r => nm(r.iso)),
    ruMore: fIso.ruMore.map(([i, b]) => [ttl(i), b]), ruLess: fIso.ruLess ? [ttl(fIso.ruLess[0]), fIso.ruLess[1]] : undefined,
  };
  // round 60: seven groups, the map's chance levels (rankGroup in index.html), essentially zero among them
  const GROUP_ID = ["toward-ukraine", "leaning-toward-ukraine", "near-zero", "essentially-zero", "too-close-to-call", "leaning-toward-russia", "toward-russia"];
  const GROUP_ID_UA = ["supported-ukraine", "leaning-supported-ukraine", "near-zero", "essentially-zero", "too-close-to-call", "leaning-below-zero", "below-zero"];
  // round 60 (audit: "51%" without saying of what): a row that is not very likely has the map's own chance words, which
  // name the middle value's direction and, where the simulations lean the other way, that side too
  // round 61: in the page's language (the page of support by country is in every language)
  const nmL = (iso, l) => (l === "en" ? nm(iso) : nameL(iso, l));
  const rankLi = (r, extra = "", l = "en") => `<li><span class="r">${r.rank ? r.rank + "." : ""}</span><a href="${cPath(byIso[r.iso], l)}">${esc(nmL(r.iso, l))}</a><span class="v">${esc(r.value)}</span><span class="e">${esc(r.eur)}${extra}${r.sure ? "" : " · " + esc(r.words)}</span></li>`;
  const itemList = (rows, l = "en") => ({ "@context": "https://schema.org", "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderDescending", numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: abs(cPath(byIso[r.iso], l)), name: nmL(r.iso, l) })) });
  // the chance levels in the map's own words (CHANCE_KEY in index.html), not written here
  const topicLinks = (skip = "", l = "en") => `<h2 id="topics">${esc(I.s(l, "topics"))}</h2><ul class="rel">${TOPICS.filter(e => pathOf(e) !== skip).map(e => `<li><a href="${lp(l, pathOf(e))}">${esc(labelOf(e, l))}</a></li>`).join("")}${RPAGE.map(x => `<li><a href="${lp(l, x.path)}">${esc(rLabel(x, l))}</a></li>`).join("")}<li><a href="${lp(l, "/topics/")}"><b>${esc(l === "en" ? T.L("en", "allTopicsLong") : I.s(l, "allTopics"))}</b></a></li></ul>`;
  // round 61 (CTR): the facts of the page of support by country in a language (the names and figures the map's)
  const factsL = l => {
    if (l === "en") return { ...facts, euroTop3: uaRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 3).map(r => [ttl(r.iso), r.eurBn]), y1: lastYear, dataTo: dataToL.en };
    // round 63 (audit: "met Verenigde Staten"): a name in a list after "with" in the language's form (seo_i18n.mjs inList)
    const rows = RANK_UA[l].groups.flatMap(g => g.rows), byEur = rows.slice().sort((a, b) => b.eurBn - a.eurBn), nIn = iso => I.inList(l, nameL(iso, l)), nB = iso => nameL(iso, l);
    return { ...facts, euroTop: byEur.slice(0, 2).map(r => [nIn(r.iso), r.eurBn]), euroTop3: byEur.slice(0, 3).map(r => [nIn(r.iso), r.eurBn]),
      shareTop: rows.filter(r => r.sure && big(r)).sort((a, b) => b.pct - a.pct).slice(0, 3).map(r => nIn(r.iso)), y1: lastYear, dataTo: dataToL[l],
      topUa: fIso.topUa.map(nB), topRu: fIso.topRu.map(nB), parties: fIso.parties.map(nB), ruMore: fIso.ruMore.map(([i, b]) => [nIn(i), b]), ruLess: fIso.ruLess ? [nIn(fIso.ruLess[0]), fIso.ruLess[1]] : undefined };
  };
  // round 59: faq, questions in the words people search (seo_i18n.mjs TOPIC_X), visible and as JSON-LD from one array
  async function rankPage(path, pageKey, rk, ids, rowExtra, extraTop = "", mapHash = "#view=rank", faq = [], l = "en", alts = [], imgs = { top: null, more: [] }) {
    const copy = T.staticCopy(pageKey, factsL(l), l), url = abs(lp(l, path));
    const crumb = pageKey === "support-for-ukraine" ? T.L(l, "supportPage") : copy.h1.split(":")[0].trim();
    const items = [[T.L(l, "map"), home(l)], [crumb, lp(l, path)]];
    const rowsAll = rk.groups.flatMap(g => g.rows), chanceKey = CHKEY[l] || "";
    // round 68 (QA review): on the page of support by country, the groups' sizes in words ("Supported Ukraine: 39
    // countries", not "Supported Ukraine · 39"), no "+" in a group where every amount is above zero, "under €1m" for "<€1m", and no amount per
    // person that rounds to nothing ("+€0.0 per person")
    const hubPage = pageKey === "support-for-ukraine";
    const gLabel = g => g.label;
    const gHead = (g, n) => (hubPage ? I.s(l, "hubGroup", { label: g.label, n }, { n }) : `${g.label} · ${n}`);
    const plainRow = (r, g) => {
      if (!hubPage) return r;
      const allPos = g.rows.every(x => x.eurBn >= 0), un = x => (allPos ? String(x || "").replace(/^\+/, "") : String(x || "").replace(/^\+(?=<)/, ""));
      const under = x => String(x || "").replace(/^([+−]?)<(.+)$/, (m0, sg, v) => sg + I.s(l, "underV", { v }));
      const ppZero = /^[+−]?€?\s?0[.,]0(?!\d)|^[+−]?0[.,]0\s/.test(String(r.pp || "").trim());
      return { ...r, value: un(r.value), eur: under(un(r.eur)), pp: ppZero ? "" : un(r.pp) };
    };
    const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
${G.figureHtml(imgs.top, { caption: imgs.top ? imgs.top.caption : "" })}
<p><a class="btn" href="${home(l)}${mapHash}">${esc(T.L(l, "openMap"))} →</a></p>
${extraTop}
${rk.groups.filter(g => g.rows.some(r => !r.small)).map(g => { const big = g.rows.filter(r => !r.small), list = g.g === 6 ? big.slice().reverse() : big;
  // round 60 (audit: the "Toward Russia" group numbered 33 down to 1): it is listed from number 1, the furthest toward Russia
  return `<h2 id="${ids[g.g]}">${esc(gHead(g, big.length))}</h2>${g.g === 6 ? `<p class="sub">${esc(T.L(l, "rankRussiaOrder", { one: 1 }))}</p>` : ""}<ol class="rk">${list.map(r => rankLi(plainRow(r, g), rowExtra(plainRow(r, g)), l)).join("")}</ol>`; }).join("\n")}
<h2 id="smaller-economies">${esc(T.L(l, "smaller", { gdpMin: I.E(l, 5) }))}</h2>
<p class="sub">${esc(T.L(l, "smallerNote"))}</p>
<ol class="rk">${rk.groups.flatMap(g => g.rows.filter(r => r.small).map(r => rankLi(plainRow(r, g), " · " + esc(gLabel(g)) + rowExtra(plainRow(r, g)), l))).join("")}</ol>
${howFold(l, [T.L(l, "rankMoney"), chanceKey])}
${rk.party.length ? `<h2 id="party">${esc(I.s(l, "party"))}</h2><ul class="plain">${rk.party.map(r => `<li><a href="${cPath(byIso[r.iso], l)}">${esc(nmL(r.iso, l))}</a> ${esc(r.value)} · ${esc(r.eur)}</li>`).join("")}</ul>` : ""}
${rk.noData.filter(i => byIso[i]).length ? `<h2 id="no-data">${esc(T.L(l, "noData"))}</h2><p class="sub">${esc(T.L(l, "noDataRank"))}</p><p>${rk.noData.filter(i => byIso[i]).map(i => (noOwn(byIso[i]) ? esc(nmL(i, l)) : `<a href="${cPath(byIso[i], l)}">${esc(nmL(i, l))}</a>`)).join(", ")}</p>` : ""}
${faq.length ? `<section class="faq" id="faq"><h2>${esc(I.s(l, "questions"))}</h2>${faq.map(x => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join("\n")}</section>` : ""}
<p><a href="${lp(l, "/ranking/")}">${esc(T.L(l, "ranking"))}</a> · <a href="${lp(l, "/support-for-ukraine/")}">${esc(T.L(l, "supportPage"))}</a> · <a href="${lp(l, "/trade-with-russia/")}">${esc(T.L(l, "tradePage"))}</a> · <a href="/how-it-works/">${esc(T.L(l, "how"))}</a></p>
${topicLinks("", l)}
${alts.length ? langLinks(l, path) : ""}
</main>
${foot(l)}`;
    const pImgs = [imgs.top, ...(imgs.more || [])].filter(Boolean);
    await put(lp(l, path), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: alts, image: imgs.top ? abs(imgs.top.path) : abs("share/world.png"), imageAlt: imgs.top ? imgs.top.alt : T.L("en", "imgWorld"),
      ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET,
        ...(pImgs.length ? { image: pImgs.map(x => G.imageObject(x, abs)) } : {}), ...imgLd(imgs.top) }, crumbLd(items), itemList(rowsAll, l),
        ...(faq.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) }] : [])], body,
    }), alts, pImgs);
  }
  // round 63: the ranking in every language, with reciprocal hreflang and x-default (as the support page in round 61), its
  // net chart in each language
  for (const l of T.LANGS) await rankPage("/ranking/", "ranking", RANK[l], GROUP_ID, () => "", "", "#view=rank", [], l, famAlts("/ranking/"), { top: RIMG[l].net || null, more: [] });
  const euroTable = (rows, id, title, fmt, l = "en") => `<h2 id="${id}">${esc(title)}</h2><div class="tbl"><table><thead><tr><th>#</th><th>${esc(T.L(l, "country"))}</th><th class="n">€</th><th class="n">${esc(T.L(l, "share"))}</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><a href="${cPath(byIso[r.iso], l)}">${esc(nmL(r.iso, l))}</a></td><td class="n">${esc(fmt(r))}</td><td class="n">${esc(r.value)}</td></tr>`).join("")}</tbody></table></div>`;
  // round 68 (QA review, fix 9): a country's total linked in the words people search in a language ("how much Germany has
  // given to Ukraine since 2022", "combien la France a donné à l'Ukraine depuis 2022"): the countries most searched that
  // way (seo_demand.json ask "given", at least seo_families.json country.phrasing.minDemand a month) and the given ones
  const ASK_MIN0 = ((FAM.country || {}).phrasing || {}).minDemand ?? Infinity;
  const givenText = (l, iso) => { const N = nameL(iso, l), g = I.grammar(l, N); return I.s(l, "givenLink", { N, Nt: I.inSentence(l, N), Na: g.Na }, { plural: g.plural }); };
  const givenIsos = (l, extra = []) => {
    const searched = countries.map(c => [c, ((((c.demand || {}).ask || {})[l] || {}).given) || 0]).filter(([c, n]) => n >= ASK_MIN0 && !c.noData && !c.mostlyNoData && (c.fig.ua || 0) > 0)
      .sort((a, b) => b[1] - a[1] || a[0].iso.localeCompare(b[0].iso)).slice(0, 3).map(([c]) => c.iso);
    return [...new Set([...searched, ...extra])].filter(i => byIso[i] && !noOwn(byIso[i])).slice(0, 6);
  };
  const givenLinks = (l, extra = []) => { const xs = givenIsos(l, extra); return xs.length ? `<p class="sub">${esc(I.s(l, "hubBy"))} ${xs.map(i => `<a href="${cPath(byIso[i], l)}">${esc(givenText(l, i))}</a>`).join(" · ")}</p>` : ""; };
  // round 59: "Ukraine allies" and who gives the most, answered from this page's list (the tracker's questions, TOPIC_X)
  // round 61 (CTR): the all-years page of support by country in every language, with reciprocal hreflang (it was English
  // only, so searches in other languages landed on year pages); the tracker keeps the angle of the Kiel figures
  {
    const path = "/support-for-ukraine/", alts = famAlts(path);
    for (const l of T.LANGS) {
      const rk = RANK_UA[l], rows = rk.groups.flatMap(g => g.rows), byEur = rows.slice().sort((a, b) => b.eurBn - a.eurBn);
      const tops = byEur.slice(0, 3).map(r => I.inSentence(l, nmL(r.iso, l)));
      const k1 = byEur[0] ? mOf(byIso[byEur[0].iso], "kiel") : null, kielMore1 = !!(k1 != null && byEur[0] && k1 > byEur[0].eurBn + 0.0005);
      const faq = I.topicExtra(l, "ukraine-support-tracker", { n: rows.length, tops: I.list3(l, tops.map(x => I.inList(l, x))), t1: tops[0] || "", topV: byEur[0] ? I.E(l, byEur[0].eurBn) : "", sumUa: I.E(l, rows.reduce((a, r) => a + r.eurBn, 0)), kiel1: kielMore1 ? I.E(l, k1) : "" }, { kielMore1 }).faq;
      const extra = l === "en" ? r => (r.pp ? " · " + r.pp.replace(/ pp$/, "") + " per person" : "") : r => (r.pp ? " · " + r.pp : "");
      // round 68 (QA review): the answer page: country, euros, % of GDP and € per person in one table that fits a phone,
      // and the largest donors' own pages linked in the words people search ("combien la France a donné à l'Ukraine
      // depuis 2022"; seo_demand.json ask, as the year pages)
      const hubTable = `<h2 id="in-euros">${esc(T.L(l, "inEuros"))}</h2><div class="tbl"><table class="hub"><thead><tr><th class="r">#</th><th>${esc(T.L(l, "country"))}</th><th class="n">€</th><th class="n">${esc(I.s(l, "colGdp"))}</th><th class="n">${esc(I.s(l, "colPp"))}</th></tr></thead><tbody>${byEur.slice(0, 15).map((r, i) => `<tr><td class="r">${i + 1}</td><td><a href="${cPath(byIso[r.iso], l)}">${esc(nmL(r.iso, l))}</a></td><td class="n">${esc(r.eur.replace(/^\+/, ""))}</td><td class="n">${esc(r.value.replace(/^\+/, ""))}</td><td class="n">${esc(String(r.pp || "").replace(/^\+/, "").replace(/ pp$/, ""))}</td></tr>`).join("")}</tbody></table></div>`;
      await rankPage(path, "support-for-ukraine", rk, GROUP_ID_UA, extra,
        givenLinks(l, byEur.slice(0, 5).map(r => r.iso)) + hubTable + `<h2>${esc(T.L(l, "shareWithPp"))}</h2>` +
        G.figureHtml(RIMG[l].gdp, { lazy: true, caption: RIMG[l].gdp ? RIMG[l].gdp.caption : "" }), "#view=rank&lens=support", faq, l, alts, { top: RIMG[l].eur, more: [RIMG[l].gdp] });
    }
  }
  // round 63: the trade page in every language too
  for (const l of T.LANGS) {
    const rr = RANK_RU[l].groups.flatMap(g => g.rows);
    await rankPage("/trade-with-russia/", "trade-with-russia", RANK_RU[l], GROUP_ID, () => "",
      euroTable(rr.filter(r => r.eurBn < 0).sort((a, b) => a.eurBn - b.eurBn).slice(0, 10), "russia-kept-more", T.L(l, "keptMoreEur"), r => r.eur.replace(/^−/, ""), l) + euroTable(rr.filter(r => r.eurBn > 0).sort((a, b) => b.eurBn - a.eurBn).slice(0, 10), "russia-kept-less", T.L(l, "keptLessEur"), r => r.eur.replace(/^\+/, ""), l) + `<h2>${esc(T.L(l, "asShare"))}</h2>`,
      "#view=rank&lens=payments", [], l, famAlts("/trade-with-russia/"));
  }


  // ----- the topic and group pages (round 55) and the generated families (round 56), in every language -----
  // round 58: an explainer's values from the data (round 58b: the amounts frozen and the reparations loan's facts, from
  // frozen_amounts_r58.json, seo_research.mjs explainAmount), and whether it is also an FAQ entry in a language
  const EXPL = FAM.explain || {}, TOPIC_DEMAND = DEMAND._topics || {};
  const explainOf = (l, id) => { const a = RS.explainAmount(l, id, FROZ); return { id, ...I.explainText(l, id, a.vars, a.nums), faq: explainFaq(id, l) }; };
  const explainFaq = (id, l) => { const cl = (EXPL.clusters || {})[id]; return !!cl && ((TOPIC_DEMAND[cl] || {})[l] || 0) >= (EXPL.minDemand ?? Infinity); };
  const moneyNote = (l, m) => I.s(l, m.moneyNote === "mil" || m.key === "part:mil" || m.key === "armed" || m.columns.includes("part:mil") ? "moneyMil" : "moneyOnly");
  // the first row's figure (round 58: with its sign, as in the table, for a signed measure or a sum below zero)
  const topV = (l, m) => { const c = m.rows[0]; if (!c) return ""; const x = mv(c, m.key, m.year); if (!x) return ""; const v = m.sort === "eur" ? I.E(l, x.v) : m.sort === "pp" ? (c.pop ? I.PP(l, (x.v * 1000) / c.pop) + " " + I.s(l, "perPerson") : "") : I.P(l, (100 * x.v) / c.gdp);
    const st = style(m.key), sg = v.startsWith("<") || Math.abs(x.v) < 0.0005 ? "" : st === "signed" ? (x.v > 0 ? "+" : "−") : st === "amount" && x.v < 0 ? "−" : ""; return sg + v; };
  const capThe = x => String(x || "").replace(/(^|[.?!]\s+)the /g, "$1The ");
  const rowName = (l, c) => I.inSentence(l, c.name);
  // round 68 (QA review: the Dutch per-capita intro had no figures): the per-person page's first three rows and their
  // amounts per person, for its intro in every language (the English one has them from seo_topics.json)
  const ppVars = (e, l, m) => {
    if (e.slug !== "ukraine-aid-per-capita") return {};
    const o = {};
    m.rows.slice(0, 3).forEach((c, i) => { const x = mv(c, "ua"); o["top" + (i + 1)] = I.inList(l, c.name); o[`top${i + 1}_pp`] = x && c.pop ? I.PP(l, (x.v * 1000) / c.pop) : ""; });
    return o;
  };
  // round 59: a topic page's note and questions in the words people search (seo_i18n.mjs TOPIC_X), from its table (the
  // rows on the page's side the map gives as very likely, the parties to the war) and the research files
  const topicX = (e, l, m) => {
    const NEEDS = { frozen: FROZ, fuel: FUEL };
    if (!I.TOPIC_X[e.slug] || (I.TOPIC_X_NEEDS[e.slug] && !NEEDS[I.TOPIC_X_NEEDS[e.slug]])) return { note: "", faq: [] };
    const side = e.onlySide || (e.order === "asc" ? "russia" : "ukraine"), names = m.rows.slice(0, 3).map(c => rowName(l, c));
    const nSure = m.rows.filter(c => { const x = mv(c, m.key, m.year); return x && x.level === "sure" && x.side === side; }).length;
    const ua = m.totals.find(x => x.key === "ua") || { v: 0 }, pw = WORDS[l].party || "";
    const vars = { n: m.rows.length, tops: I.list3(l, names.map(x => I.inList(l, x))), t1: names[0] || "", topV: topV(l, m), sumUa: I.E(l, ua.v), nSure, sureWord: WORDS[l].sure || "",
      partyList: I.list3(l, m.party.map(c => rowName(l, c))), partyWord: pw, partyWordLc: pw.charAt(0).toLowerCase() + pw.slice(1), ...(FROZ && I.TOPIC_X_NEEDS[e.slug] === "frozen" ? RS.frozenVars(l, FROZ) : {}) };
    // round 59b: the buyers of each fuel by their customs records (fuel_split_r59.json)
    const fv = I.TOPIC_X_NEEDS[e.slug] === "fuel" ? RS.fuelVars(l, FUEL, iso => nameIn(iso, l), RCFG.fuel.rows || 15) : { vars: {}, nums: {} };
    // (a question answered from a research file is marked, data-rq: check 48 finds its figures in the page's tables)
    // round 68: the top row's Kiel figure, where it is above the total (the tracker's "who gives the most")
    const k1 = m.rows[0] ? mv(m.rows[0], "kiel") : null, u1 = m.rows[0] ? mv(m.rows[0], "ua") : null;
    const kielMore1 = !!(k1 && u1 && k1.v != null && k1.v > u1.v + 0.0005);
    const x = I.topicExtra(l, e.slug, { ...vars, ...fv.vars, kiel1: kielMore1 ? I.E(l, k1.v) : "" }, { nParty: m.party.length, nSure, ...fv.nums, kielMore1 });
    return { ...x, faq: x.faq.map(f => ({ ...f, rq: I.TOPIC_X_NEEDS[e.slug] === "fuel" ? "fuel" : "" })) };
  };
  // round 60 (audit: 2026, January to August, above all of 2025 for 15 countries): on the pages of trade with Russia
  // by year for the last full year and the year in progress, why a part year can reach a full one (the no-war world at
  // each year's prices, the Hormuz spike in 2026), and whether Russia's own oil and gas revenue fell in the same months
  const revDown = (() => {
    if (!REV || !REV.monthly) return 0;
    const to = dataTo.slice(0, 7), y1 = to.slice(0, 4), y0 = String(+y1 - 1), mm = m => m.ym.slice(5);
    const cur = REV.monthly.filter(m => m.ym.startsWith(y1 + "-") && m.ym <= to), prev = REV.monthly.filter(m => m.ym.startsWith(y0 + "-") && cur.some(c => mm(c) === mm(m)));
    const sum = xs => xs.reduce((a, m) => a + (m.og_rev_rub || 0), 0);
    return cur.length && prev.length === cur.length && sum(cur) < sum(prev) ? 1 : 0;
  })();
  const yearPrices = (e, l) => (e.kind === "year" && e.yearKind === "rus" && e.year >= lastYear - 1
    ? `<p class="sub">${esc(I.s(l, "yearPrices", { y: e.year, y1: lastYear, y0: lastYear - 1, month: monthOnlyL(l) }, { partial: e.partial ? 1 : 0, revDown }))} <a href="/method/prices/#m-prices-why-januaryaugust-2026-can-look-larger-than-all-of-2025">${esc(I.s(l, "howPrices"))} →</a></p>` : "");
  // round 61 (CTR): a year page says it counts that year alone and links the totals since 2022: the page of support by
  // country and the pages of the countries people search "how much has ... given" for in this language (seo_demand.json
  // ask, at least seo_families.json country.phrasing.minDemand a month, the three most searched), each by its own heading
  const ASK_MIN = ((FAM.country || {}).phrasing || {}).minDemand ?? Infinity;
  const searchedIn = l => countries.map(c => [c, ((((c.demand || {}).ask || {})[l] || {}).given) || 0]).filter(([c, n]) => n >= ASK_MIN && H1[l][c.iso] && !c.noData && !c.mostlyNoData)
    .sort((a, b) => b[1] - a[1] || a[0].iso.localeCompare(b[0].iso)).slice(0, 3).map(([c]) => c);
  const yearTotals = (l, e) => `<p class="sub">${esc(I.s(l, "yearAlone", { Y: e.partial ? I.s(l, "yearTo", { y: e.year, month: monthOnlyL(l) }) : String(e.year) }))} ${[[lp(l, "/support-for-ukraine/"), T.L(l, "supportPage")], ...givenIsos(l, searchedIn(l).map(c => c.iso)).slice(0, 4).map(i => [cPath(byIso[i], l), givenText(l, i)])].map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join(" · ")}</p>`;
  const famRelated = e => {
    if (e.kind === "part") return PARTS.filter(x => x !== e && x.side === e.side).slice(0, 8);
    if (e.kind === "year") return YEARS.filter(x => x !== e && (x.yearKind === e.yearKind || x.year === e.year));
    return (e.related || []).map(related).filter(Boolean);
  };
  // round 62: the topic pages that answer with a chart (seo_images.mjs): the image shown near the top and as og:image
  const TOPIC_IMG = { "ukraine-support-tracker": "eur", "ukraine-aid-per-capita": "pp", "countries-helping-russia": "rus", "frozen-russian-assets": "frozen" };
  for (const e of [...TOPICS, ...PARTS, ...YEARS]) {
    const path = pathOf(e), alts = famAlts(path);
    for (const l of T.LANGS) {
      const timg = e.kind === "topic" && TOPIC_IMG[e.slug] ? RIMG[l][TOPIC_IMG[e.slug]] || null : null;
      const m = MODELS[path][l], tops = m.rows.slice(0, 3).map(c => rowName(l, c));
      let copy;
      if (e.kind === "part") copy = { ...I.partCopy(l, { key: e.key, n: m.rows.length, top: tops, topV: topV(l, m), dataTo: dataToL[l] }), intro: I.partIntro(l, { key: e.key, side: e.side, n: m.rows.length, top: tops, dataTo: dataToL[l] }) };
      else if (e.kind === "year") copy = I.yearCopy(l, { kind: e.yearKind, y: e.year, partial: e.partial, month: monthOnlyL(l), n: m.rows.length, top: tops, topV: topV(l, m).replace(/^[+−]/, ""), topX: m.rows[0] ? mv(m.rows[0], m.key, m.year).v : 0, dataTo: dataToL[l] });
      else if (l === "en") copy = { title: m.title, description: m.description, h1: m.h1, intro: m.intro, label: e.label };
      else {
        const tot = k => m.totals.find(x => x.key === k) || { v: 0, pct: 0 };
        copy = I.topicCopyLang(l, e, { n: m.rows.length, top: tops, topV: topV(l, m), measure: I.measureName(l, m.key), unitKey: m.sort, dataTo: dataToL[l],
          sumUa: I.E(l, tot("ua").v), sumNetPct: I.P(l, tot("net").pct), net: tot("net").v, isGroup: e.kind === "group", armedList: m.armedList, nArmed: m.nArmed,
          y1: lastYear, extra: { ...topicVars(e, l), ...ppVars(e, l, m) } });
        // the English config's own questions, sections and notes stay on the English page
        m.faq = []; m.sections = []; m.notes = [];
        for (const sb of m.subtotals) sb.labelL = labelOf(bySlug[sb.slug] || { kind: "group", slug: sb.slug, label: sb.label }, l);
      }
      if (l === "en") for (const k of ["title", "description", "h1", "intro"]) copy[k] = capThe(copy[k]);
      const url = abs(lp(l, path)), hub = lp(l, "/topics/");
      const items = [[T.L(l, "map"), home(l)], [I.s(l, "topics"), hub], [copy.label || labelOf(e, l), lp(l, path)]];
      const rel = famRelated(e);
      // round 58: the page's explainers (seo_topics.json explain, seo_i18n.mjs EXPLAIN), each an FAQ entry where its
      // language searches for it (seo_demand.json _topics, seo_families.json explain)
      const explains = (m.explain || []).map(id => explainOf(l, id));
      // round 59: the questions people search first (an English config question with the same words is not repeated)
      const X = topicX(e, l, m);
      m.compact = !!e.compact;
      if (X.faq.length) m.faq = X.faq.filter(f => !m.faq.some(g => g.q === f.q)).concat(m.faq);
      // round 58b: the amounts frozen in each holding country, beside the return (frozen_amounts_r58.json)
      const stockCols = FROZ && RCFG.frozen && e.slug === RCFG.frozen.topic ? { heads: [I.res(l, "colCbr"), I.res(l, "colPriv")], cell: c => RS.frozenCells(l, FROZ, c.iso) } : null;
      // round 59b: support for Ukraine by type beside the support tracker's table (mil_split_r59.json), and the fuel
      // tables on the buyers page (fuel_split_r59.json)
      const milCols = MIL && RCFG.military && e.slug === RCFG.military.support ? { heads: RS.milHeads(l), cell: c => RS.milCells(l, MIL, c.iso) } : null;
      const fuelHtml = FUEL && RCFG.fuel && e.slug === RCFG.fuel.topic ? RS.fuelSection(l, FUEL, { nameOf: iso => nameAnyL(iso, l), href: iso => (byIso[iso] ? cPath(byIso[iso], l) : ""), rows: RCFG.fuel.rows }) : "";
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
${G.figureHtml(timg, { caption: timg ? timg.caption : "" })}
${e.kind === "year" && e.yearKind === "ua" ? yearTotals(l, e) : ""}
${X.note ? `<p>${esc(X.note)}</p>` : ""}
${yearPrices(e, l)}
${explains.map(x => `<section class="explain" id="what-${x.id}"><h2>${esc(x.q)}</h2><p>${esc(x.a)}${x.link ? ` <a href="#table">${esc(x.link)} ↓</a>` : ""}</p></section>`).join("\n")}
<p><a class="btn" href="${home(l)}${m.map}">${esc(T.L(l, "openMap"))} →</a></p>
${renderTopic(m, { esc, cPath: c => cPath(c, l), l, extra: stockCols || milCols })}
${howFold(l, [moneyNote(l, m)])}
${stockCols ? `<p class="sub">${esc(I.res(l, "stockNote"))}</p>` : ""}
${milCols ? `<p class="sub">${esc(I.res(l, "mTrackerNote"))} <a href="${lp(l, "/" + RCFG.military.slug + "/")}">${esc(I.res(l, "mAll"))} →</a></p>` : ""}
${fuelHtml}
${rel.length ? `<h2 id="related">${esc(I.s(l, "related"))}</h2>${relList(l, rel)}` : ""}
<p><a href="${lp(l, "/ranking/")}">${esc(T.L(l, "ranking"))}</a> · <a href="${lp(l, "/support-for-ukraine/")}">${esc(T.L(l, "supportPage"))}</a> · <a href="${lp(l, "/trade-with-russia/")}">${esc(T.L(l, "tradePage"))}</a> · <a href="${hub}">${esc(I.s(l, "allTopics"))}</a> · <a href="/how-it-works/">${esc(T.L(l, "how"))}</a></p>
${langLinks(l, path)}
</main>
${foot(l)}`;
      const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET,
        image: timg ? abs(timg.path) : abs("share/world.png"), ...imgLd(timg) },
        crumbLd(items), { "@context": "https://schema.org", "@type": "ItemList", numberOfItems: m.rows.length, itemListElement: m.rows.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: abs(cPath(c, l)), name: rowName(l, c) })) }];
      const faqLd = explains.filter(x => x.faq).map(x => ({ q: x.q, a: x.a })).concat(m.faq);
      if (faqLd.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqLd.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });
      await put(lp(l, path), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: alts, image: timg ? abs(timg.path) : abs("share/world.png"), imageAlt: timg ? timg.alt : T.L("en", "imgWorld"), ld, body }), alts, timg ? [timg] : []);
    }
  }

  // ----- round 56: two countries side by side -----
  for (const e of COMPARES) {
    const path = pathOf(e), alts = e.index ? famAlts(path) : [];
    for (const l of T.LANGS) {
      const a = LANG_DATA[l][e.a], b = LANG_DATA[l][e.b], A = nameL(e.a, l), B = nameL(e.b, l);
      const ok = c => c.net && !c.noData && !c.mostlyNoData;
      // round 65 (SEO audit, fix 2): both headline nets in the description, with the map's direction words for each
      const head = c => (ok(c) && c.fig && c.fig.cN ? { netP: I.P(l, c.fig.netPct), dir: c.fig.cN.dirWords || c.fig.cN.sideWords || "" } : null);
      const copy = I.compareCopy(l, { A, B, a: head(a), b: head(b) });
      const lines = [a, b].filter(ok).map(c => `${c.name}: ${c.net.pre} ${c.net.big}${c.net.post ? " " + c.net.post : ""} ${T.L(l, "ofGdp")} (${[c.net.range, c.net.chance].filter(Boolean).join(I.semi(l))}).`);
      let line = "";
      if (ok(a) && ok(b) && !a.party && !b.party) {
        const ua = c => c.measures.ua.v, pct = c => (100 * ua(c)) / c.gdp;
        line = I.compareLine(l, { a: a.name, b: b.name, eurA: I.E(l, ua(a)), eurB: I.E(l, ua(b)), uaA: ua(a), uaB: ua(b), pctA: pct(a), pctB: pct(b) });
      }
      const m = { kind: "compare", key: "net", sort: "gdp", order: "desc", columns: ["ua", "rus", "frozen", "paid"].filter(k => [a, b].some(c => mv(c, k) && Math.abs(mv(c, k).v) >= 0.0005)), rows: [a, b],
        party: [], sides: [], noData: [], extra: [], totals: [], subtotals: [], notes: [], sections: [], faq: [], minGdp: 0, year: null, side: "", dataToL: dataToL[l] };
      // the parts of both, side by side, in the panel's three sections
      const keys = [];
      for (const c of [a, b]) for (const sec of c.sections || []) for (const p of sec.parts) if (!keys.find(k => k.k === p.k)) keys.push({ k: p.k, q: sec.q });
      keys.sort((x, y) => ["ua", "rus", "frozen"].indexOf(x.q) - ["ua", "rus", "frozen"].indexOf(y.q));
      // round 58: the share of GDP keeps the sign of the euros (a size under 0.01% has none)
      const pv = (c, k) => { const x = mv(c, "part:" + k); if (!x || Math.abs(x.v) < 0.0005) return `<td class="m" data-q="part:${k}" data-iso="${c.iso}">–</td>`; const sgn = k.startsWith("frozen") ? "" : x.v > 0 ? "+" : x.v < 0 ? "−" : "", P0 = I.P(l, (100 * x.v) / c.gdp); return `<td class="m" data-q="part:${k}" data-iso="${c.iso}" data-st="${k.startsWith("frozen") ? "amount" : "signed"}"><b class="${x.v > 0 ? "pos" : "neg"}">${esc(sgn + I.E(l, x.v))}</b><span class="s"><i>${esc((P0.startsWith("<") ? "" : sgn) + P0 + " " + I.s(l, "ofGdp"))}</i></span></td>`; };
      const partsTable = keys.length ? `<h2 id="parts">${esc(I.s(l, "theParts"))}</h2><div class="tbl"><table><thead><tr><th>${esc(I.s(l, "measure"))}</th><th class="m">${esc(a.name)}</th><th class="m">${esc(b.name)}</th></tr></thead><tbody>${keys.map(({ k }) => `<tr><td>${esc(I.partName(l, k))}</td>${pv(a, k)}${pv(b, k)}</tr>`).join("")}</tbody></table></div><p class="sub">${esc(I.s(l, "legendSigned"))}</p>` : "";
      const yr = c => Object.fromEntries((c.years || []).map(y => [y.y, y]));
      const ya = yr(a), yb = yr(b), ys = [...new Set([...Object.keys(ya), ...Object.keys(yb)])].sort();
      // round 60 (audit: the year table did not add up): each year a row per country, with support, trade, the frozen
      // money (where either has any) and the net, so each row adds up
      const fz = hasFrozen(a) || hasFrozen(b);
      const yRow = (c, yy, y, first) => `<tr><td>${first ? `<a href="${lp(l, `/ukraine-aid-${y}/`)}">${y}</a>${yy.ytd ? "*" : ""}` : ""}</td><td>${esc(c.name)}</td><td class="n">${esc(yy.ua)}</td><td class="n">${esc(yy.rus)}</td>${fz ? `<td class="n">${esc(yy.frozen)}</td>` : ""}<td class="n">${esc(yy.net)}</td></tr>`;
      const yearTable = ys.length ? `<h2 id="by-year">${esc(I.s(l, "yearByYear"))}</h2><div class="tbl"><table><thead><tr><th>${esc(T.L(l, "year"))}</th><th>${esc(T.L(l, "country"))}</th><th class="n">${esc(T.L(l, "support"))}</th><th class="n">${esc(T.L(l, "tradeYear"))}</th>${fz ? `<th class="n">${esc(T.L(l, "frozen"))}</th>` : ""}<th class="n">${esc(T.L(l, "netYear"))}</th></tr></thead><tbody>${ys.map(y => [[a, ya[y]], [b, yb[y]]].filter(([, yy]) => yy).map(([c, yy], i) => yRow(c, yy, y, i === 0)).join("")).join("")}</tbody></table></div><p class="sub">${esc(T.L(l, "yearNote", { y: lastYear, month: monthOnlyL(l) }))}</p>` : "";
      const others = (comparesOf[e.a] || []).concat(comparesOf[e.b] || []).filter(x => x !== e).filter((x, i, arr) => arr.indexOf(x) === i).slice(0, 10);
      const groupsBoth = (groupsOf[e.a] || []).filter(g => (groupsOf[e.b] || []).includes(g));
      const url = abs(lp(l, path)), hub = lp(l, "/topics/");
      const items = [[T.L(l, "map"), home(l)], [I.s(l, "topics"), hub], [copy.label, lp(l, path)]];
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(lines.join(" "))}</p>
${line ? `<p>${esc(line)}</p>` : ""}
<p class="sub">${esc(I.s(l, "compareOwn"))} ${[[cPath(byIso[e.a], l), (byIso[e.a].fig.ua || 0) > 0 ? givenText(l, e.a) : a.name], [cPath(byIso[e.b], l), (byIso[e.b].fig.ua || 0) > 0 ? givenText(l, e.b) : b.name], [lp(l, "/support-for-ukraine/"), T.L(l, "supportPage")]].map(([h, t]) => `<a href="${h}">${esc(t)}</a>`).join(" · ")}</p>
<p><a class="btn" href="${home(l)}#${e.a}">${esc(a.name)} →</a> <a class="btn" href="${home(l)}#${e.b}">${esc(b.name)} →</a></p>
<h2 id="side-by-side">${esc(I.s(l, "sideBySide"))}</h2>
${renderTopic(m, { esc, cPath: c => cPath(c, l), l }).replace(/<h2 id="table">[^<]*<\/h2>\n<p class="sub"[^>]*>[^<]*<\/p>\n/, "")}
${partsTable}
${yearTable}
${howFold(l, [I.s(l, "moneyOnly")])}
<h2 id="related">${esc(I.s(l, "related"))}</h2><ul class="rel"><li><a href="${cPath(byIso[e.a], l)}">${esc(a.name)}</a></li><li><a href="${cPath(byIso[e.b], l)}">${esc(b.name)}</a></li>${groupsBoth.concat(others).map(x => `<li><a href="${lp(l, pathOf(x))}">${esc(labelOf(x, l))}</a></li>`).join("")}<li><a href="${hub}">${esc(I.s(l, "allTopics"))}</a></li></ul>
${e.index ? langLinks(l, path) : ""}
</main>
${foot(l)}`;
      const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET, image: abs("share/world.png"),
        about: [{ "@type": "Country", name: byIso[e.a].nameEn }, { "@type": "Country", name: byIso[e.b].nameEn }] }, crumbLd(items)];
      await put(lp(l, path), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: alts, image: abs("share/world.png"), imageAlt: T.L("en", "imgPair", { a: byIso[e.a].name, b: byIso[e.b].name }), ld, body, ogType: "article", noindex: !e.index }), alts, [], { noindex: !e.index });
    }
  }

  // ----- round 56: the Topics page, every generated page by kind, in every language -----
  {
    const path = "/topics/", alts = famAlts(path);
    for (const l of T.LANGS) {
      const n = FAMILY.length + 3 + RPAGE.length, copy = I.hubCopy(l, n), url = abs(lp(l, path));
      const sec = (id, h, list) => (list.length ? `<h2 id="${id}">${esc(h)} · ${list.length}</h2>${relList(l, list)}` : "");
      const ranks = l === "en" ? I.s("en", "rankings") : [[T.L(l, "ranking"), lp(l, "/ranking/")], [T.L(l, "supportPage"), lp(l, "/support-for-ukraine/")], [T.L(l, "tradePage"), lp(l, "/trade-with-russia/")]];
      const items = [[T.L(l, "map"), home(l)], [I.s(l, "topics"), lp(l, path)]];
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.description)}</p>
<h2 id="rankings">${esc(I.s(l, "hubRankings"))}</h2><ul class="rel">${ranks.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}<li><a href="${lp(l, "/downloads/")}">${esc(I.s(l, "downloads"))}</a></li></ul>
${RPAGE.length ? `<h2 id="background">${esc(I.res(l, "hubBackground"))} · ${RPAGE.length}</h2><ul class="rel">${RPAGE.map(x => `<li><a href="${lp(l, x.path)}">${esc(rLabel(x, l))}</a></li>`).join("")}</ul>` : ""}
${sec("topics-list", I.s(l, "hubTopics"), TOPICS.filter(e => e.kind === "topic"))}
${sec("groups", I.s(l, "hubGroups"), TOPICS.filter(e => e.kind === "group"))}
${sec("parts", I.s(l, "hubParts"), PARTS)}
${sec("years", I.s(l, "hubYears"), YEARS)}
${sec("compare", I.s(l, "hubCompare"), COMPARES_IX)}
<h2 id="countries">${esc(I.s(l, "hubCountries"))}</h2><ul class="rel">${countries.filter(c => !noOwn(c)).sort((x, y) => LANG_DATA[l][x.iso].name.localeCompare(LANG_DATA[l][y.iso].name, l)).map(c => `<li><a href="${cPath(c, l)}">${esc(LANG_DATA[l][c.iso].name)}</a></li>`).join("")}</ul>
${langLinks(l, path)}
</main>
${foot(l)}`;
      await put(lp(l, path), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: alts, image: abs("share/world.png"), imageAlt: T.L("en", "imgWorld"),
        ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body }), alts);
    }
  }
  // ----- round 58b: the page of every country's sanctions and the page of Russia's oil and gas revenue, every language
  // (seo_research.mjs; their figures from the research files, each marked for check 48) -----
  {
    // the names of the entries without a page (Antarctica ...) in a language: the browser's own, as the map's
    const ISO2 = await page.evaluate(() => (typeof ISO2 !== "undefined" ? ISO2 : {}));
    const nameAny = (iso, l) => (LANG_DATA[l][iso] || {}).name || (() => { try { return ISO2[iso] ? new Intl.DisplayNames([l], { type: "region" }).of(ISO2[iso]) : ""; } catch { return ""; } })() || (data.countries[iso] || {}).name || iso;
    const published = ((((REV || {}).sources || [])[0] || {}).date || "").match(/data (\d{4}-\d{2}-\d{2})/);
    for (const x of RPAGE) {
      const path = x.path, alts = famAlts(path);
      for (const l of T.LANGS) {
        const url = abs(lp(l, path)), hub = lp(l, "/topics/");
        const pg = x.key === "sanctions"
          ? RS.sanctionsPage(l, SANC, { nameOf: iso => nameAny(iso, l), href: iso => (byIso[iso] ? cPath(byIso[iso], l) : ""), frozen: FROZ ? RS.frozenFacts(FROZ) : null })
          : x.key === "military"
            ? RS.milPage(l, MIL, { nameOf: iso => nameAny(iso, l), nameIn: iso => I.inSentence(l, nameAny(iso, l)), href: iso => (byIso[iso] ? cPath(byIso[iso], l) : ""), pop: iso => (byIso[iso] || {}).pop || null,
              dataTo: dataToL[l], stepsMin: x.cfg.stepsMin, gdpMin: x.cfg.gdpMin })
            : RS.revenuePage(l, REV, { warIncome: lp(l, "/" + x.cfg.warIncome + "/"), published: published ? published[1] : "", months: x.cfg.months || 24, yearWord: T.L(l, "year"), deficit: BAL });
        const explains = (x.cfg.explain || []).map(id => explainOf(l, id));
        const rel = (x.cfg.related || []).map(sl => { const t = related(sl); if (t) return [labelOf(t, l), lp(l, pathOf(t))]; const r2 = RPAGE.find(y => y.cfg.slug === sl); return r2 ? [rLabel(r2, l), lp(l, r2.path)] : null; }).filter(Boolean);
        const items = [[T.L(l, "map"), home(l)], [I.s(l, "topics"), hub], [pg.label, lp(l, path)]];
        const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(pg.h1)}</h1>
<p class="intro">${esc(pg.intro)}</p>
${explains.map(e2 => `<section class="explain" id="what-${e2.id}"><h2>${esc(e2.q)}</h2><p>${esc(e2.a)}</p></section>`).join("\n")}
${pg.body}
<section class="faq" id="faq"><h2>${esc(I.s(l, "questions"))}</h2>${pg.faq.map(q => `<h3>${esc(q.q)}</h3><p${x.key === "sanctions" ? "" : ` data-rq="${x.key}"`}>${esc(q.a)}</p>`).join("\n")}</section>
<h2 id="related">${esc(I.s(l, "related"))}</h2><ul class="rel">${rel.map(([t, h]) => `<li><a href="${h}">${esc(t)}</a></li>`).join("")}<li><a href="${lp(l, "/downloads/")}">${esc(I.s(l, "downloads"))}</a></li><li><a href="${hub}">${esc(I.s(l, "allTopics"))}</a></li></ul>
${langLinks(l, path)}
</main>
${foot(l)}`;
        const faqLd = explains.filter(e2 => e2.faq).map(e2 => ({ q: e2.q, a: e2.a })).concat(pg.faq);
        const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: pg.title, description: pg.description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET, image: abs("share/world.png") }, crumbLd(items),
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqLd.map(q => ({ "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } })) }];
        await put(lp(l, path), shell({ lang: l, title: pg.title, description: pg.description, canonical: url, alternates: alts, image: abs("share/world.png"), imageAlt: T.L("en", "imgWorld"), ld, body }), alts);
      }
    }
  }
  const tFamilies = Date.now() - t0 - tExtract - tCountries;

  // ----- How it works, the method pages, the limitations, the changelog -----
  const docPage = async (path, heading, html, first, items, extra = "") => {
    const copy = T.docCopy(heading, first, path.replace(/^\/|\/$/g, "")), url = abs(path);
    const body = `${top("en")}
<main class="wrap doc">
${crumbs("en", items)}
<h1>${esc(copy.h1)}</h1>
${extra}
${html}
<p class="meta"><a href="/how-it-works/">${esc(T.L("en", "how"))}</a> · <a href="/limitations/">${esc(T.L("en", "limitations"))}</a> · <a href="/changelog/">${esc(T.L("en", "changelog"))}</a> · <a href="/#view=how">${esc(T.L("en", "openMap"))}</a></p>
</main>
${foot("en")}`;
    await put(path, shell({ lang: "en", title: copy.title, description: copy.description, canonical: url, image: abs("share/world.png"), imageAlt: T.L("en", "imgBrand"),
      ld: [{ "@context": "https://schema.org", "@type": path === "/changelog/" ? "WebPage" : "TechArticle", "@id": url, url, headline: copy.h1, name: copy.title, description: copy.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body, ogType: "article" }));
  };
  for (const m of docs.method) await docPage(`/method/${m.page}/`, m.title, m.html, m.first, [[T.L("en", "map"), "/"], [T.L("en", "how"), "/how-it-works/"], [m.title, `/method/${m.page}/`]]);
  await docPage("/limitations/", docs.limitations.title, docs.limitations.html, docs.limitations.first, [[T.L("en", "map"), "/"], [T.L("en", "how"), "/how-it-works/"], [docs.limitations.title, "/limitations/"]]);
  await docPage("/changelog/", docs.changelog.title, docs.changelog.html, docs.changelog.first, [[T.L("en", "map"), "/"], [T.L("en", "how"), "/how-it-works/"], [docs.changelog.title, "/changelog/"]]);
  {
    const copy = T.staticCopy("how-it-works", facts), path = "/how-it-works/", url = abs(path), items = [[T.L("en", "map"), "/"], [T.L("en", "how"), path]];
    const order = ["reading", "overview", "counterfactual", "prices", "trade", "energy-and-laundered-oil", "aid-refugees-military", "loans", "services-shipping-companies", "russia-state-and-companies", "ranges", "tags"];
    const ms = order.map(p => docs.method.find(m => m.page === p)).filter(Boolean).concat(docs.method.filter(m => !order.includes(m.page)));
    // round 60 (audit: teasers cut at a decimal point, "cost Hungary 7."): a sentence ends at . ! or ? before a space or
    // the end, not inside a number
    const firstSentence = s => (s.match(/^[\s\S]*?[.!?](?=\s|$)/) || [s])[0];
    const body = `${top("en")}
<main class="wrap">
${crumbs("en", items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
<p><a class="btn" href="/#view=how">${esc(T.L("en", "openMap"))} →</a></p>
<p class="note">${esc(T.L("en", "everyNumber"))}</p>
<h2>${esc(T.L("en", "methodPages"))}</h2>
<ul class="plain">${ms.map(m => `<li style="margin-bottom:10px"><a href="/method/${m.page}/"><b>${esc(m.title)}</b></a><br><span class="sub">${esc(firstSentence(m.first))}</span></li>`).join("")}</ul>
<h2>${esc(T.L("en", "flows"))}</h2>
<div class="tbl"><table><tbody>${EN.flows.map(f => `<tr><td>${docs.flowMethod[f.id] ? `<a href="${docs.flowMethod[f.id]}">${esc(f.name)}</a>` : esc(f.name)}</td><td>${esc(f.what)}</td></tr>`).join("")}</tbody></table></div>
<h2>${esc(T.L("en", "also"))}</h2>
<p><a href="/limitations/">${esc(docs.limitations.title)}</a> · <a href="/changelog/">${esc(docs.changelog.title)}</a> · <a href="/ranking/">${esc(T.L("en", "ranking"))}</a> · <a href="/data.json">${esc(T.L("en", "fullData"))}</a></p>
</main>
${foot("en")}`;
    await put(path, shell({ lang: "en", title: copy.title, description: copy.description, canonical: url, image: abs("share/world.png"), imageAlt: T.L("en", "imgBrand"),
      ld: [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body }));
  }

  // ----- round 58: the downloads page (every language), its CSV files, and llms.txt / llms-full.txt -----
  const csvq = v => (v == null || Number.isNaN(v) ? "" : typeof v === "number" ? String(+v.toFixed(4)) : typeof v === "boolean" ? String(v) : /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);
  // round 58b: with the return Russia lost on frozen money, so each row adds up to its net (support + trade + frozen)
  const yearsCsv = ["iso3,country,year,year_to_date,support_ukraine_eur_bn,trade_with_russia_toward_ukraine_eur_bn,frozen_return_lost_eur_bn,net_shift_eur_bn",
    ...countries.slice().sort((a, b) => a.iso.localeCompare(b.iso)).filter(c => !c.noData && c.years).flatMap(c => c.years.map(y => [c.iso, c.nameEn, y.y, !!y.ytd, y.uaBn, y.rusBn, y.frozenBn, y.netBn].map(csvq).join(",")))].join("\n");
  // round 58b: Russia's federal oil and gas revenue, month by month and by year (russia_revenue_r58.json)
  const REVCSV = REV ? RS.revenueCsv(REV) : null;
  // round 60: the research files' countries under the site's English name, as in the other files and llms-full.txt
  const csvName = F => iso => (byIso[iso] || {}).nameEn || (F.countries[iso] || {}).name || iso;
  const DL = [["war-balance-countries.csv", CSV.full, "dlCountries"], ["war-balance-parts.csv", CSV.parts, "dlParts"], ["war-balance-years.csv", yearsCsv, "dlYears"],
    ...(REVCSV ? [["russia-oil-gas-revenue-monthly.csv", REVCSV.monthly, "dlRevMonthly"], ["russia-oil-gas-revenue-yearly.csv", REVCSV.yearly, "dlRevYearly"]] : []),
    // round 59b: what each country bought by fuel and year, and support for Ukraine by type (the research files)
    ...(FUEL ? [["war-balance-fuel-split.csv", RS.fuelCsv(FUEL, csvName(FUEL)), "dlFuel"]] : []), ...(MIL ? [["war-balance-military-split.csv", RS.milCsv(MIL, csvName(MIL)), "dlMil"]] : []),
    // round 60 (audit of the downloads): the cost of replacing Russian energy and the oil discount, every source, Russia's
    // budget balance and the National Wealth Fund (seo_downloads.mjs)
    ["war-balance-energy-cost.csv", DLX.energyCsv(countries, `2022-${lastYear}${data.frac && data.frac[data.frac.length - 1] < 1 ? ` (${lastYear}: January-${I.monthOnly(dataTo, "en")})` : ""}`), "dlEnergy"],
    ["war-balance-sources.csv", DLX.sourcesCsv(data.sources || {}), "dlSources"],
    ...(DEF ? (() => { const b = DLX.budgetCsv(DEF); return [["russia-budget-balance-yearly.csv", b.yearly, "dlBudgetYearly"], ["russia-budget-balance-monthly.csv", b.monthly, "dlBudgetMonthly"], ["russia-national-wealth-fund.csv", b.nwf, "dlNwf"]]; })() : [])];
  // every column of every file in the dictionary (the build stops on one that is not), the JSON's guide, the checksums
  const DICTX = DLX.dictionary(DL.map(([f, text]) => [f, text]));
  DL.push(["war-balance-data-dictionary.csv", DICTX.csv, "dlDict"], ["war-balance-data-dictionary.md", DICTX.md, "dlDictMd"], ["data-json-schema.md", DLX.schemaMd(data), "dlSchema"]);
  const dlText = (l, k) => (I.RES_KEYS.includes(k) ? I.res(l, k) : I.s(l, k));
  await mkdir(join(site, "downloads"), { recursive: true });
  // the byte order mark makes spreadsheets read the file as UTF-8, as the map's own download does (the Markdown without)
  const dlBody = (f, text) => (f.endsWith(".csv") ? "\ufeff" : "") + text + "\n";
  for (const [f, text] of DL) await writeFile(join(site, "downloads", f), dlBody(f, text));
  // round 60: the SHA-256 of every file as it is served, and its size (data.json too)
  const dataJsonText = await readFile(join(site, "data.json"), "utf8");
  const SUMS = [...DL.map(([f, text]) => [f, dlBody(f, text)]), ["../data.json", dataJsonText]].map(([f, b]) => ({ f, sha: DLX.sha256(b), kb: Buffer.byteLength(b) / 1024 }));
  await writeFile(join(site, "downloads", "SHA256SUMS.txt"), SUMS.map(x => `${x.sha}  ${x.f.replace(/^\.\.\//, "")}`).join("\n") + "\n");
  const sumOf = f => SUMS.find(x => x.f === f);
  const meta = (l, f) => { const x = sumOf(f); return x ? ` <span class="sub">(${esc(I.N(l, Math.max(1, Math.round(x.kb))))} kB · SHA-256 <code>${x.sha.slice(0, 16)}…</code>)</span>` : ""; };
  {
    const path = "/downloads/", alts = famAlts(path);
    for (const l of T.LANGS) {
      const url = abs(lp(l, path)), items = [[T.L(l, "map"), home(l)], [I.s(l, "downloads"), lp(l, path)]];
      const title = I.s(l, "dlTitle"), description = I.s(l, "dlDescription");
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, items)}
<h1>${esc(I.s(l, "dlH1"))}</h1>
<p class="intro">${esc(I.s(l, "dlIntro", { dataTo: dataToL[l] }))}</p>
<ul class="bul">${DL.map(([f, , k]) => `<li><a href="/downloads/${f}" download>${esc(f)}</a>: ${esc(dlText(l, k))}${meta(l, f)}</li>`).join("")}<li><a href="/data.json" download="war-balance.json">data.json</a>: ${esc(I.s(l, "dlJson"))}${meta(l, "../data.json")}</li><li><a href="/downloads/SHA256SUMS.txt" download>SHA256SUMS.txt</a>: ${esc(I.s(l, "dlSums", { algo: "SHA-256" }))}</li></ul>
<h2 id="fields">${esc(I.s(l, "dlGuide"))}</h2>
<ul class="bul">${I.s(l, "dlFields").map(x => `<li>${esc(I.fmt(x, { dataTo: dataToL[l] }))}</li>`).join("")}</ul>
<p>${esc(I.s(l, "dlDictLine"))} <a href="/downloads/war-balance-data-dictionary.csv" download>war-balance-data-dictionary.csv</a> · <a href="/downloads/war-balance-data-dictionary.md">war-balance-data-dictionary.md</a> · <a href="/downloads/data-json-schema.md">data-json-schema.md</a></p>
<p>${esc(I.s(l, "dlLicence"))}</p>
<p><a href="/how-it-works/">${esc(T.L(l, "how"))}</a> · <a href="/limitations/">${esc(T.L(l, "limitations"))}</a> · <a href="${lp(l, "/topics/")}">${esc(I.s(l, "allTopics"))}</a></p>
${langLinks(l, path)}
</main>
${foot(l)}`;
      await put(lp(l, path), shell({ lang: l, title, description, canonical: url, alternates: alts, image: abs("share/world.png"), imageAlt: T.L("en", "imgWorld"),
        ld: [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: title, description, inLanguage: l, dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body }), alts);
    }
  }
  {
    const X = I.LLMS.en, f = (k, v = {}) => I.fmt(X[k], v), link = (name, p, what) => `- [${name}](${abs(p)}): ${what}`;
    const head = [`# War Balance`, "", `> ${X.summary}`, "", f("dataLine", { dataTo: dataToL.en }), "",
      `## ${X.hMeasures}`, "", ...X.defs.map(d => "- " + d), "- " + f("chance", { chanceKey: EN.chanceKey || "" }), "",
      `## ${X.hCite}`, "", f("cite", { dataTo: dataToL.en, doi: DATA_DOI }), "",
      `## ${X.hPages}`, "", link("Map", "/", X.pages.home), link(T.L("en", "ranking"), "/ranking/", X.pages.ranking), link(T.L("en", "supportPage"), "/support-for-ukraine/", X.pages.support),
      link(T.L("en", "tradePage"), "/trade-with-russia/", X.pages.trade), link(I.s("en", "allTopics"), "/topics/", X.pages.topics), link(I.s("en", "downloads"), "/downloads/", X.pages.downloads),
      ...TOPICS.map(e => `- [${e.label}](${abs(pathOf(e))})`), ...RPAGE.map(x => link(rLabel(x, "en"), x.path, X.pages[x.key])), "", X.markdown, X.langs, "",
      `## ${X.hMethod}`, "", link(T.L("en", "how"), "/how-it-works/", X.pages.how), ...docs.method.map(m => `- [${m.title}](${abs(`/method/${m.page}/`)})`), link(docs.limitations.title, "/limitations/", X.pages.limitations), "",
      `## ${X.hData}`, "", link("data.json", "/data.json", I.s("en", "dlJson")), ...DL.map(([fl, , k]) => link(fl, "/downloads/" + fl, dlText("en", k))), link("llms-full.txt", "/llms-full.txt", X.pages.llmsFull), ""];
    // one line per country, its figures as the map writes them (check 48 compares them with the model)
    const line = c => {
      const url = abs(cPath(c));
      if (c.noData || c.mostlyNoData || !c.net) return `- ${c.nameEn}: ${X.noData} | ${url}`;
      const f0 = c.fig, sg = v => (v >= 0 ? "+" : "−");
      return `- ${c.nameEn}: net ${sg(f0.net)}${I.P("en", f0.netPct)} of a year's GDP (${[c.net.range, c.party ? X.party : c.net.chance].filter(Boolean).join("; ")}) | support for Ukraine ${I.E("en", f0.ua)} | ${c.kept} | ${url}`;
    };
    const all = countries.slice().sort((a, b) => a.nameEn.localeCompare(b.nameEn, "en"));
    await writeFile(join(site, "llms.txt"), head.join("\n") + "\n");
    // round 58b: Russia's federal oil and gas revenue by year (check 48 compares each line with the file)
    const revLines = REV ? RS.revenueModel(REV).years.map(y => "- " + I.fmt(X.revLine, { y: y.complete ? y.y : I.res("en", "partYear", { y: y.y, month: I.monthOnly(REV.meta.latest_budget_month + "-15", "en") }),
      ogRub: I.CUR("en", y.og_rev_rub, "RUB"), ogEur: I.E("en", y.og_rev_eur), share: I.P("en", 100 * y.share) })) : [];
    // round 59b: the buyers of each fuel and each military donor (check 48 compares each line with the files)
    const nameEn = iso => (byIso[iso] || {}).nameEn || ((FUEL || MIL || {}).countries || {})[iso]?.name || iso;
    const fuelLines = FUEL ? RS.fuelLlms(FUEL, nameEn) : [], milLines = MIL ? RS.milLlms(MIL, nameEn) : [];
    await writeFile(join(site, "llms-full.txt"), head.join("\n") + `\n## ${X.hCountries}\n\n${X.fullIntro}\n\n` + all.map(line).join("\n") + "\n"
      + (revLines.length ? `\n## ${X.hRevenue}\n\n${revLines.join("\n")}\n` : "")
      + (fuelLines.length ? `\n## ${X.hFuel}\n\n${fuelLines.join("\n")}\n` : "") + (milLines.length ? `\n## ${X.hMil}\n\n${milLines.join("\n")}\n` : ""));
  }

  // ----- the map: the A–Z list, the Topics list and the data date in index.html, and a copy per language -----
  const idxPath = join(site, "index.html");
  let idx = await readFile(idxPath, "utf8");
  const az = countries.filter(c => !noOwn(c)).sort((a, b) => a.name.localeCompare(b.name, "en"));
  const azBlock = l => `<!-- az:start -->\n        <p class="sub" id="az-intro">${esc(T.homeCopy(l, facts.n, dataToL[l]).intro)}</p>\n        <nav id="az" aria-label="${esc(T.L(l, "allCountries"))}">\n${az.map(c => `          <a href="${cPath(c, l)}" data-iso="${c.iso}">${esc(c.name)}</a>`).join("\n")}\n        </nav>\n<!-- az:end -->`;
  // round 56: the topics in each language's own words and addresses, then the Topics page with everything else
  // round 63: the ranking, the support and the trade page in the language first
  const topicsBlock = l => `<!-- topics:start -->\n        <nav id="topics" aria-label="Topics" data-i18n-aria="Topics">\n${[[lp(l, "/ranking/"), T.L(l, "ranking")], [lp(l, "/support-for-ukraine/"), T.L(l, "supportPage")], [lp(l, "/trade-with-russia/"), T.L(l, "tradePage")]].map(([h, t]) => `          <a href="${h}">${esc(t)}</a>\n`).join("")}${TOPICS.map(e => `          <a href="${lp(l, pathOf(e))}">${esc(labelOf(e, l))}</a>`).concat(RPAGE.map(x => `          <a href="${lp(l, x.path)}">${esc(rLabel(x, l))}</a>`)).join("\n")}\n          <a href="${lp(l, "/topics/")}"><b>${esc(I.s(l, "allTopics"))} →</b></a>\n        </nav>\n<!-- topics:end -->`;
  idx = idx.replace(/<!-- topics:start -->[\s\S]*?<!-- topics:end -->/, topicsBlock("en"));
  // round 64 (SEO audit, fix 8b): the map's code is site/app.js (cached, deferred); its address names its hash, so a
  // changed file is fetched again
  const appHash = createHash("sha256").update(await readFile(join(site, "app.js"))).digest("hex").slice(0, 8);
  if (!/<script src="app\.js\?v=\w*" defer><\/script>/.test(idx)) throw new Error("index.html: the app.js script was not found");
  idx = idx.replace(/<script src="app\.js\?v=\w*" defer><\/script>/, `<script src="app.js?v=${appHash}" defer></script>`);
  // round 64: the self-hosted fonts' rules in the map's head, from site/fonts/fonts.css
  if (!/<!-- fonts:start -->[\s\S]*?<!-- fonts:end -->/.test(idx)) throw new Error("index.html: the fonts block was not found");
  idx = idx.replace(/<!-- fonts:start -->[\s\S]*?<!-- fonts:end -->/, () => fontBlock(FONT_CSS));
  // round 58: the guide for automated readers, linked from the map's head
  if (!idx.includes('href="/llms.txt"')) idx = idx.replace(/(<link rel="canonical" href="[^"]*">)/, '$1\n<link rel="alternate" type="text/plain" href="/llms.txt" title="llms.txt">');
  idx = idx.replace(/<!-- az:start -->[\s\S]*?<!-- az:end -->/, azBlock("en")).replace(/"dateModified": "[\d-]+"/, `"dateModified": "${data.generated}"`);
  // round 65 (SEO audit, fix 4): the Dataset's downloads, the files this build wrote (data.json and every CSV file in
  // /downloads/), each with its format and address; written in the map's JSON-LD style ("key": value)
  const ldStr = o => (Array.isArray(o) ? `[${o.map(ldStr).join(", ")}]` : o && typeof o === "object" ? `{${Object.entries(o).map(([k, x]) => `${JSON.stringify(k)}: ${ldStr(x)}`).join(", ")}}` : JSON.stringify(o));
  const dist = [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: abs("data.json"), name: "Full data (JSON)" },
    ...DL.filter(([f]) => f.endsWith(".csv")).map(([f]) => ({ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: abs("downloads/" + f), name: f }))];
  if (!/"distribution": \[[^\]]*\]/.test(idx)) throw new Error("index.html: the Dataset's distribution was not found");
  idx = idx.replace(/"distribution": \[[^\]]*\]/, () => `"distribution": ${ldStr(dist).replace(/</g, "\\u003c")}`);
  await writeFile(idxPath, idx);
  const homeAlts = T.LANGS.map(l => [l, l === "en" ? U : U + l + "/"]).concat([["x-default", U]]);
  written.push({ path: "/", alternates: homeAlts, lastmod: null });
  for (const l of NL) {
    const h = T.homeCopy(l, facts.n, dataToL[l]);
    let x = staticI18n(idx, await mapDict(site, l));
    x = x.replace('<html lang="en">', `<html lang="${l}" data-lang="${l}">`).replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">')
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(h.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(h.description)}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(h.title)}">`).replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(h.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(h.description)}">`).replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(h.description)}">`)
      .replace(`<meta property="og:url" content="${U}">`, `<meta property="og:url" content="${U}${l}/">`).replace(`<link rel="canonical" href="${U}">`, `<link rel="canonical" href="${U}${l}/">`)
      .replace(`<meta property="og:locale" content="en_GB">`, `<meta property="og:locale" content="${T.OG_LOCALE[l]}">`).replace(`<meta property="og:locale:alternate" content="${T.OG_LOCALE[l]}">`, `<meta property="og:locale:alternate" content="en_GB">`)
      .replace(/<!-- az:start -->[\s\S]*?<!-- az:end -->/, azBlock(l)).replace(/<!-- topics:start -->[\s\S]*?<!-- topics:end -->/, topicsBlock(l))
      // a link to a place on this page ("#view=how") stays on /de/ (the <base> would send it to /)
      // (round 64: registered once the deferred scripts have run, after the map's own click handlers, as before)
      .replace("</body>", `<script>document.addEventListener("DOMContentLoaded", () => document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && !e.defaultPrevented && !e.ctrlKey && !e.metaKey) { e.preventDefault(); location.hash = a.getAttribute("href"); } }));</script>\n</body>`);
    if (!x.includes("</body>")) x += `<script>document.addEventListener("DOMContentLoaded", () => document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && !e.defaultPrevented && !e.ctrlKey && !e.metaKey) { e.preventDefault(); location.hash = a.getAttribute("href"); } }));</script>\n`;
    await mkdir(join(site, l), { recursive: true });
    await writeFile(join(site, l, "index.html"), x);
    written.push({ path: "/" + l + "/", alternates: homeAlts, lastmod: null });
  }
  // the home pages' lastmod: when the map's own text or the A–Z list changed (round 65: the hash of what index.html
  // says, seo_templates.mjs pageContent, not of its scripts, fonts or head), else kept
  {
    const hash = T.contentHash(idx), date = T.lastmodOf(state["/"], hash, today);
    for (const w of written.filter(w => w.lastmod === null)) { w.lastmod = date; newState[w.path] = [hash, date]; }
  }

  // ----- round 62: the chart images, drawn in the same Chromium (a few pages side by side) -----
  const tImg0 = Date.now();
  await G.renderImages(page.context().browser(), JOBS, { site, host: HOST, workers: +(process.env.WB_IMG_WORKERS || 4), log });
  const tImages = Date.now() - tImg0;

  // ----- the sitemaps (round 56: an index, sitemap.xml, and one sitemap per language) and robots.txt -----
  const xmlEsc = s => s.replace(/&/g, "&amp;");
  const langOf = w => { const m = w.path.match(/^\/(\w\w)\//); return m && T.LANGS.includes(m[1]) ? m[1] : "en"; };
  // the home pages first, then the other pages, then the countries (each group in its own order)
  const rankOf = w => (/^\/(\w\w\/)?$/.test(w.path) ? 0 : /\/country\//.test(w.path) ? 3 : /\/compare\//.test(w.path) ? 2 : 1);
  written.sort((a, b) => rankOf(a) - rankOf(b) || a.path.localeCompare(b.path));
  const maps = [];
  for (const l of T.LANGS) {
    const ws = written.filter(w => langOf(w) === l && !w.noindex);
    const urls = ws.map(w => `  <url>\n    <loc>${xmlEsc(abs(w.path))}</loc>\n    <lastmod>${w.lastmod}</lastmod>\n${w.alternates.map(([al, u]) => `    <xhtml:link rel="alternate" hreflang="${al}" href="${xmlEsc(u)}"/>\n`).join("")}${(w.images || []).map(im => `    <image:image>\n      <image:loc>${xmlEsc(abs(im.path))}</image:loc>\n    </image:image>\n`).join("")}  </url>`);
    await writeFile(join(site, `sitemap-${l}.xml`), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join("\n")}\n</urlset>\n`);
    maps.push({ file: `sitemap-${l}.xml`, lastmod: ws.map(w => w.lastmod).sort().pop() || today, n: ws.length });
  }
  await writeFile(join(site, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${maps.map(m => `  <sitemap>\n    <loc>${abs(m.file)}</loc>\n    <lastmod>${m.lastmod}</lastmod>\n  </sitemap>`).join("\n")}\n</sitemapindex>\n`);
  await writeFile(join(site, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${U}sitemap.xml\n`);
  // the state, sorted, so a diff shows only pages whose words or numbers changed
  const sorted = Object.fromEntries(Object.keys(newState).sort().map(k => [k, newState[k]]));
  const changed = Object.keys(sorted).filter(k => !state[k] || state[k][0] !== sorted[k][0]);
  await writeFile(statePath, JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"').replace(/^\{/, "{\n") .replace(/\}$/, "\n}") + "\n");
  const count = re => written.filter(w => re.test(w.path)).length;
  const secs = ms => (ms / 1000).toFixed(1) + "s";
  const nNoindex = written.filter(w => w.noindex).length;
  log(`seo: ${written.length} pages (${nNoindex} noindex, out of the sitemaps) in ${maps.length} sitemaps (${maps.map(m => m.file.replace(/^sitemap-|\.xml$/g, "") + " " + m.n).join(", ")}): ` +
    `${count(/\/country\//)} country pages, ${count(/\/compare\//)} comparisons (${written.filter(w => /\/compare\//.test(w.path) && !w.noindex).length} indexed), ${PARTS.length} parts, ${YEARS.length} years and ${TOPICS.length} topics in ${T.LANGS.length} languages; ` +
    `${changed.length} new or changed since pipeline/seo_lastmod.json; ${secs(Date.now() - t0)} (reading the map ${secs(tExtract)}, countries ${secs(tCountries)}, families ${secs(tFamilies)}, images ${secs(tImages)})`);
  return { pages: written.length, changed, parts: PARTS.map(e => e.slug), compares: COMPARES.map(e => e.slug) };
}

// round 64 (SEO audit, fix 5): the map's static text (data-i18n, data-i18n-aria, -title, -ph: the H1, the tabs, the map
// controls, the Filters drawer, "All countries, A to Z") written in the page's language at build time, from the map's own
// dictionary (site/i18n/<lang>.js), so it is right before any script runs; applyStatic() (i18n.js) then sets the same words
export async function mapDict(site, l) {
  const { runInNewContext } = await import("node:vm");
  const box = { I18N: {} };
  runInNewContext(await readFile(join(site, "i18n", l + ".js"), "utf8"), box);
  return box.I18N[l] || {};
}
const unesc = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
export function staticI18n(html, dict) {
  const tr = k => esc(dict[unesc(k)] ?? unesc(k));
  // only the page's markup: from the app's first element to the first script after it (the scripts build their own text)
  const a = html.indexOf('<div class="app"'), b = html.indexOf("<script", a);
  if (a < 0 || b < 0) throw new Error("index.html: the map's markup was not found");
  const attr = (tag, data, name) => {
    const m = tag.match(new RegExp(`\\s${data}="([^"]*)"`));
    if (!m) return tag;
    const v = tr(m[1]), re = new RegExp(`(\\s${name}=")[^"]*(")`);
    return re.test(tag) ? tag.replace(re, `$1${v}$2`) : tag.replace(/\s*>$/, ` ${name}="${v}">`);
  };
  const mid = html.slice(a, b)
    .replace(/<[a-zA-Z][^>]*>/g, tag => attr(attr(attr(tag, "data-i18n-aria", "aria-label"), "data-i18n-title", "title"), "data-i18n-ph", "placeholder"))
    .replace(/(<[a-zA-Z][^>]*\sdata-i18n="([^"]*)"[^>]*>)([^<]*)(?=<\/)/g, (m, open, k) => open + tr(k));
  return html.slice(0, a) + mid + html.slice(b);
}

// on its own: node pipeline/seo_pages.mjs (serves site/, opens the map in Chromium, writes the pages)
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { createServer } = await import("node:http");
  const { extname } = await import("node:path");
  const { createRequire } = await import("node:module");
  const { chromium } = createRequire(import.meta.url)("playwright");
  const SITE = join(HERE, "..", "site"), CFG = JSON.parse(await readFile(join(HERE, "site_config.json"), "utf8"));
  const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".md": "text/markdown" };
  const server = createServer(async (req, res) => {
    try { const p = join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html")); const b = await readFile(p); res.writeHead(200, { "content-type": TYPES[extname(p)] || "application/octet-stream" }); res.end(b); }
    catch { res.writeHead(404); res.end(); }
  }).listen(0);
  const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
  const page = await browser.newPage();
  await page.goto(`http://localhost:${server.address().port}/index.html`);
  await page.waitForFunction(() => document.body.dataset.ready === "true" && typeof DATA !== "undefined" && Object.keys(DATA).length > 100);
  await writeSeoPages({ page, site: SITE, siteUrl: CFG.site_url });
  await browser.close();
  server.close();
}
