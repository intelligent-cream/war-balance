// Round 54 (findable pages): the site's static pages, written at deploy next to the share cards (share_cards.mjs calls
// writeSeoPages with the map already open in Chromium; run on its own: node pipeline/seo_pages.mjs). Every number comes
// from the map itself (seo_extract.mjs), so a page always says what the map says. It writes, in site/ (not in git):
//   country/<slug>/index.html   one page per country, English; <lang>/country/<slug>/ for the ten most searched (TOP)
//   c/<iso>.html                the old share links: canonical to the country page, and sent there
//   ranking/, support-for-ukraine/, trade-with-russia/, how-it-works/, method/<page>/, limitations/, changelog/
//   <lang>/index.html           the map in each language (a copy of index.html with its own head; data-lang="de")
//   <slug>/ and group/<slug>/  the topic and group pages, one per entry of pipeline/seo_topics.json (round 55)
//   sitemap.xml, robots.txt
// and, in git, the A–Z list of country pages and the data date in site/index.html (between markers; unchanged unless the
// data change) and pipeline/seo_lastmod.json (each page's content hash and the date it last changed, for lastmod).

import { readFile, writeFile, mkdir, rm, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { extractSite, extractDocs } from "./seo_extract.mjs";
import * as T from "./seo_templates.mjs";
import { buildTopic, renderTopic, TOPIC_CSS, pathOf } from "./seo_topics.mjs";

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
.chance{display:inline-block;font-size:13px;font-weight:700;border-radius:999px;padding:1px 9px;margin-left:6px;border:1px solid var(--line);white-space:nowrap}
.sub{color:var(--soft);font-size:14.5px;margin:4px 0}
.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:10px}
.tile{border-radius:10px;padding:12px 14px;background:var(--surface);border:1px solid var(--line)}.tile.pos{background:var(--ukr-lo);border-color:transparent}.tile.neg{background:var(--rus-lo);border-color:transparent}
.tile .tv{font:800 28px/1.15 var(--fd)}.tile p{margin:2px 0}
.party{border-left:4px solid #8a2f2f;padding:6px 12px;background:var(--surface)}
.note{border-left:4px solid var(--rus);padding:4px 12px;color:var(--ink)}
table{border-collapse:collapse;width:100%;font-size:14.5px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid var(--line);vertical-align:top}th{font-weight:600;color:var(--soft)}td.n,th.n{text-align:right;white-space:nowrap}
.tbl{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}
.letter{display:inline-block;font:700 11px/1 var(--fd);border:1px solid var(--line);border-radius:4px;padding:2px 4px;margin-left:5px;vertical-align:1px;color:var(--soft)}
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

function shell({ lang, title, description, canonical, alternates = [], image, imageAlt, ld = [], body, ogType = "website", iso = "", css = "" }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>try { document.documentElement.dataset.theme = localStorage.getItem("ftm-theme") || "dark"; } catch (e) { document.documentElement.dataset.theme = "dark"; }</script>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${alternates.map(([l, u]) => `<link rel="alternate" hreflang="${l}" href="${u}">`).join("\n")}
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="War Balance">
<meta property="og:locale" content="${T.OG_LOCALE[lang]}">
${alternates.filter(([l]) => l !== lang && T.OG_LOCALE[l]).map(([l]) => `<meta property="og:locale:alternate" content="${T.OG_LOCALE[l]}">`).join("\n")}
<meta property="og:title" content="${esc(title.replace(/ \| War Balance.*$/, ""))}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title.replace(/ \| War Balance.*$/, ""))}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta name="theme-color" content="#14213d">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..800&family=Source+Sans+3:wght@400;600;700&display=swap">
<style>${CSS}${css ? "\n" + css : ""}</style>
${ld.map(jsonld).join("\n")}
${CF_BEACON}
</head>
<body${iso ? ` data-iso="${iso}"` : ""}>
${body}
</body>
</html>
`.replace(/\n{2,}/g, "\n");
}

export async function writeSeoPages({ page, site, siteUrl, log = console.log }) {
  const U = siteUrl.replace(/\/$/, "") + "/", abs = p => U + p.replace(/^\//, "");
  const data = JSON.parse(await readFile(join(site, "data.json"), "utf8"));
  const Q = JSON.parse(await readFile(join(HERE, "seo_queries.json"), "utf8"));
  const statePath = join(HERE, "seo_lastmod.json");
  const state = existsSync(statePath) ? JSON.parse(await readFile(statePath, "utf8")) : {};
  const today = new Date().toISOString().slice(0, 10), newState = {};
  const dataTo = data.data_to;
  // round 55: the topic and group pages, one per entry (pipeline/seo_topics.json)
  const TOPICS = JSON.parse(await readFile(join(HERE, "seo_topics.json"), "utf8")).pages;
  const RESERVED = new Set(["c", "country", "group", "ranking", "support-for-ukraine", "trade-with-russia", "how-it-works", "method", "limitations", "changelog", "content", "i18n", "share", ...T.LANGS]);
  for (const e of TOPICS) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug) || (e.kind === "topic" && RESERVED.has(e.slug)) || !["topic", "group"].includes(e.kind)) throw new Error("seo_topics.json: bad slug or kind " + e.slug);
    if (TOPICS.filter(x => pathOf(x) === pathOf(e)).length > 1) throw new Error("seo_topics.json: two pages at " + pathOf(e));
  }

  // the generated folders start empty, so a renamed page leaves nothing behind
  for (const d of ["c", "country", "group", "ranking", "support-for-ukraine", "trade-with-russia", "how-it-works", "method", "limitations", "changelog", ...T.LANGS.filter(l => l !== "en")])
    await rm(join(site, d), { recursive: true, force: true });
  // a topic page's folder holds its index.html only (anything else there is not ours: stop rather than delete it)
  for (const e of TOPICS.filter(x => x.kind === "topic")) {
    const d = join(site, e.slug);
    if (!existsSync(d)) continue;
    const inside = await readdir(d);
    if (inside.some(f => f !== "index.html")) throw new Error(`site/${e.slug}/ holds other files than a generated page: rename the topic`);
    await rm(d, { recursive: true, force: true });
  }
  // ----- everything the pages show, from the map -----
  const EN = await page.evaluate(extractSite, { lang: "en" });
  const docs = await page.evaluate(extractDocs);
  const countries = EN.countries.filter(c => c.gdp);   // the map's shapes without an economy (Antarctica...) have no page
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  const fOf = c => ({ ...c.fig, iso: c.iso, name: c.nameEn, party: c.party, armedFull: c.armedFull, noData: c.noData || c.mostlyNoData, mostly: c.mostlyNoData });
  const langsOf = c => T.countryLangs(fOf(c));
  const LANG_DATA = { en: byIso };
  for (const l of T.LANGS.filter(x => x !== "en")) {
    const isos = countries.filter(c => langsOf(c).includes(l)).map(c => c.iso);
    const r = await page.evaluate(extractSite, { lang: l, isos });
    LANG_DATA[l] = Object.fromEntries(r.countries.map(c => [c.iso, c]));
  }
  const slugs = new Set();
  for (const c of countries) { if (slugs.has(c.slug)) throw new Error("two countries with the slug " + c.slug); slugs.add(c.slug); }
  const cPath = (c, l = "en") => (l === "en" ? "" : "/" + l) + "/country/" + c.slug + "/";

  // ----- writing, with lastmod from a hash of what the page says -----
  const written = [];   // { path, alternates: [[lang, url]] }
  async function put(path, html, alternates = []) {
    const hash = createHash("sha256").update(html).digest("hex").slice(0, 16);
    const prev = state[path], date = prev && prev[0] === hash ? prev[1] : today;
    newState[path] = [hash, date];
    const file = join(site, path.replace(/^\//, ""), path.endsWith("/") ? "index.html" : "");
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, html.split(DATE_TOKEN).join(date).replace(/__WB_LASTMOD_HUMAN_(\w+)__/g, (m, l) => fmtDate(date, l)));
    written.push({ path, alternates, lastmod: date });
  }
  const human = l => `__WB_LASTMOD_HUMAN_${l}__`;

  const top = l => `<header class="top"><a class="brand" href="${l === "en" ? "/" : "/" + l + "/"}"><img src="/favicon.svg" alt="" width="20" height="20">War Balance</a>
<nav aria-label="Site"><a href="${l === "en" ? "/" : "/" + l + "/"}">${T.L(l, "map")}</a><a href="/ranking/">${T.L(l, "ranking")}</a><a href="/how-it-works/">${T.L(l, "how")}</a></nav></header>`;
  const foot = l => `<footer><div class="in"><nav aria-label="More"><a href="/ranking/">${T.L(l, "ranking")}</a><a href="/support-for-ukraine/">${T.L(l, "supportPage")}</a><a href="/trade-with-russia/">${T.L(l, "tradePage")}</a><a href="/how-it-works/">${T.L(l, "how")}</a><a href="/limitations/">${T.L(l, "limitations")}</a><a href="/changelog/">${T.L(l, "changelog")}</a></nav>
<p>${T.L(l, "preview")} ${T.L(l, "dataTo", { to: fmtDate(dataTo, l), upd: human(l) })}. Data: <a href="/data.json">data.json</a>, CC BY 4.0.</p></div></footer>`;
  const crumbs = (l, items) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map(([n, h], i) => (h && i < items.length - 1 ? `<a href="${h}">${esc(n)}</a>` : `<span aria-current="page">${esc(n)}</span>`)).join(" › ")}</nav>`;
  const crumbLd = items => ({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: items.map(([n, h], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: abs(h) })) });
  const DATASET = { "@id": U + "#dataset" };

  // ----- country pages -----
  const order = EN.rank.net.order, groupOf = {};
  for (const g of EN.rank.net.groups) for (const r of g.rows) groupOf[r.iso] = { label: g.label, g: g.g, rank: r.rank, row: r };
  const tileHtml = (l, label, n) => `<div class="tile ${n.pos ? (n.unc ? "fpos" : "pos") : n.unc ? "fneg" : "neg"}"><p class="lbl">${esc(label)}</p><p>${esc(n.pre)}</p><p class="tv">${esc(n.big)}</p><p class="sub">${esc([n.post, n.eur].filter(Boolean).join(" · "))}</p><p class="sub">${esc(n.range)}${n.chance ? ` <span class="chance">${esc(n.chance)}</span>` : ""}</p></div>`;
  for (const c0 of countries) {
    const ls = langsOf(c0), alts = ls.map(l => [l, abs(cPath(c0, l))]);
    if (ls.length > 1) alts.push(["x-default", abs(cPath(c0))]);
    for (const l of ls) {
      const c = LANG_DATA[l][c0.iso], f = fOf(c0), copy = T.countryCopy(l, f);
      const faq = l === "en" ? T.faqEn(c0, (Q[c0.iso] || {}).en || []) : T.faqLang(c, copy);
      const home = l === "en" ? "/" : "/" + l + "/", url = abs(cPath(c0, l));
      const crumbItems = [[T.L(l, "map"), home], [T.L(l, "ranking"), "/ranking/"], [c.name, cPath(c0, l)]];
      const g = groupOf[c0.iso], i = order.indexOf(c0.iso);
      const near = i < 0 ? [] : order.slice(Math.max(0, i - 3), i + 4);
      const cls = c.net ? (c0.earner ? "mid" : c.net.unc ? (c.net.pos ? "fpos" : "fneg") : c.net.pos ? "pos" : "neg") : "mid";
      let main = "";
      if (c0.noData || c0.mostlyNoData) {
        main = `<section class="card mid"><p class="lbl">${T.L(l, "noData")}</p><p>${T.L(l, "noDataText")}</p></section>`;
      } else {
        main = `<section class="card ${cls}" aria-label="${esc(T.L(l, "net"))}"><p class="lbl">${esc(c.net.pre)}${c.net.chance ? ` <span class="chance">${esc(c.net.chance)}</span>` : ""}</p>
<p class="big">${esc(c.net.big)} <span class="unit">${esc([c.net.post, T.L(l, "ofGdp")].filter(Boolean).join(" "))}</span></p>
<p class="sub">${esc(c.net.range)} · ${esc(c.net.eur)} · ${esc(c.net.perYear)}</p>
<p>${esc(c.netSentence)}.${c.lead ? " " + esc(c.lead) : ""}</p>${c.net.chanceSentence ? `<p class="sub">${esc(c.net.chanceSentence)}</p>` : ""}</section>
${c0.party ? `<p class="party"><b>${esc(T.L(l, "party"))}.</b> ${esc(c.partyWhy)}</p>` : ""}
<div class="tiles">${tileHtml(l, T.L(l, "support"), c.ua)}${tileHtml(l, T.L(l, "trade"), c.rus)}</div>
<p class="sub">${esc(c.kept)}.</p>
${c.frozen ? `<p class="sub"><b>${esc(T.L(l, "frozen"))}:</b> ${esc(c.frozen.verb)} (${esc(c.frozen.eur)}).</p>` : ""}
${c.kiel ? `<p class="sub">${esc(c.kiel)}</p>` : ""}
<h2>${esc(T.L(l, "parts"))}</h2>
${c.sections.map(s => `<p class="psec">${esc(s.pre)} ${esc(s.amount)}${s.post ? " " + esc(s.post) : ""} · ${esc(s.eur)}</p>
<div class="tbl"><table><tbody>${s.parts.map(p => `<tr><td>${esc(p.name)}<span class="letter" title="${esc(T.L(l, "lettersKey"))}">${esc(p.letter)}</span>${p.ev ? `<span class="ev">${esc(p.ev)}</span>` : ""}</td><td class="n">${esc(p.sign + p.amount)}</td><td class="n">${esc(p.eur)}</td></tr>`).join("")}</tbody></table></div>`).join("\n")}
<p class="sub">${esc(T.L(l, "lettersKey"))}</p>
<h2>${esc(T.L(l, "byYear"))}</h2>
<div class="tbl"><table><thead><tr><th>${esc(T.L(l, "year"))}</th><th class="n">${esc(T.L(l, "support"))}</th><th class="n">${esc(T.L(l, "trade"))}</th><th class="n">${esc(T.L(l, "netYear"))}</th><th class="n">${esc(T.L(l, "total"))}</th></tr></thead>
<tbody>${c.years.map(y => `<tr><td>${y.y}${y.ytd ? "*" : ""}</td><td class="n">${esc(y.ua)}</td><td class="n">${esc(y.rus)}</td><td class="n">${esc(y.net)}</td><td class="n">${esc(y.cum)}</td></tr>`).join("")}</tbody></table></div>
<p class="sub">${esc(T.L(l, "yearNote"))}</p>`;
      }
      const body = `${top(l)}
<main class="wrap">
${crumbs(l, crumbItems)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
<p><a class="btn" href="${home}#${c0.iso}">${esc(T.L(l, "openMap"))} →</a></p>
${main}
${faq.length ? `<section class="faq"><h2>${esc(T.L(l, "faq"))}</h2>${faq.map(x => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join("\n")}</section>` : ""}
<h2>${esc(T.L(l, "nearby"))}</h2>
${g ? `<p class="sub">${esc(g.label)}${g.rank ? " · " + g.rank : ""}</p><ol class="rk">${near.map(iso => { const x = groupOf[iso], cc = LANG_DATA[l][iso] || byIso[iso]; return `<li${iso === c0.iso ? ' class="here"' : ""}><span class="r">${x.rank ? x.rank + "." : ""}</span>${iso === c0.iso ? esc(cc.name) : `<a href="${cPath(byIso[iso], LANG_DATA[l][iso] ? l : "en")}">${esc(cc.name)}</a>`}<span class="v">${esc(x.row.value)}</span><span class="e">${esc(x.label)} · ${esc(x.row.eur)}${x.row.sure ? "" : " · " + esc(x.row.chance)}</span></li>`; }).join("")}</ol>`
    : `<p>${esc(c0.party ? T.L(l, "party") : T.L(l, "notRanked"))}. <a href="/ranking/">${esc(T.L(l, "ranking"))}</a></p>`}
${c.sources && c.sources.length ? `<h2>${esc(T.L(l, "sources"))}</h2><ul class="src">${c.sources.map(s => `<li>${s.url ? `<a href="${esc(s.url)}" rel="noopener">${esc(s.name)}</a>` : esc(s.name)}</li>`).join("")}</ul><p class="sub">${esc(T.L(l, "moreSources", { n: c.nSources }))} <a href="${home}#${c0.iso}">${esc(T.L(l, "openMap"))}</a> · <a href="/how-it-works/">${esc(T.L(l, "measured"))}</a></p>` : ""}
${ls.length > 1 ? `<p class="langs" aria-label="${esc(T.L(l, "languages"))}">${ls.filter(x => x !== l).map(x => `<a href="${cPath(c0, x)}" hreflang="${x}" lang="${x}">${T.LANG_NAMES[x]}</a>`).join("")}</p>` : ""}
</main>
${foot(l)}`;
      const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: l, dateModified: DATE_TOKEN,
        image: abs(`share/${c0.iso.toLowerCase()}.png`), isPartOf: DATASET, about: { "@type": "Country", name: c0.nameEn } }, crumbLd(crumbItems)];
      if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });
      await put(cPath(c0, l), shell({ lang: l, title: copy.title, description: copy.description, canonical: url, alternates: ls.length > 1 ? alts : [], image: abs(`share/${c0.iso.toLowerCase()}.png`),
        imageAlt: `${c0.nameEn}: ${c0.net ? c0.net.pre + " " + c0.net.big + " of a year's GDP since 2022" : "no data"}, War Balance`, ld, body, ogType: "article", iso: c0.iso }), ls.length > 1 ? alts : []);
    }
    // the old share link (round 30's c/<iso>.html): kept for links already shared, sent on to the country page
    const copy = T.countryCopy("en", fOf(c0)), to = cPath(c0), iso = c0.iso.toLowerCase();
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
</head><body><p><a href="${to}">${esc(c0.nameEn)}</a></p><script>location.replace("${to}" + location.hash);</script></body></html>
`);
  }

  // ----- the ranking and the two lens pages -----
  const nm = iso => byIso[iso].nameEn, ttl = iso => T.names(iso, nm(iso))[1].replace(/^the /, "the ");
  const G0 = EN.rank.net.groups.find(g => g.g === 0), G5 = EN.rank.net.groups.find(g => g.g === 5);
  const uaRows = EN.rank.ua.groups.flatMap(g => g.rows), ruRows = EN.rank.rus.groups.flatMap(g => g.rows);
  const big = r => byIso[r.iso].gdp >= 5;   // the map's ranking threshold for lists by size (MIN_GDP_RANK, € 5bn)
  const facts = {
    n: EN.rank.net.order.length,
    topUa: (G0 ? G0.rows.filter(r => !r.small).slice(0, 3) : []).map(r => nm(r.iso)),
    topRu: (G5 ? G5.rows.filter(r => !r.small).slice(-3).reverse() : []).map(r => nm(r.iso)),
    parties: EN.rank.net.party.map(r => nm(r.iso)),
    euroTop: uaRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 2).map(r => [ttl(r.iso), r.eurBn]),
    shareTop: uaRows.filter(r => r.sure && big(r)).sort((a, b) => b.pct - a.pct).slice(0, 3).map(r => nm(r.iso)),
    ruMore: ruRows.slice().sort((a, b) => a.eurBn - b.eurBn).slice(0, 2).map(r => [nm(r.iso), r.eurBn]),
    ruLess: ruRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 1).map(r => [nm(r.iso), r.eurBn])[0],
  };
  const GROUP_ID = ["toward-ukraine", "leaning-toward-ukraine", "near-zero", "too-close-to-call", "leaning-toward-russia", "toward-russia"];
  const GROUP_ID_UA = ["supported-ukraine", "leaning-supported-ukraine", "near-zero", "too-close-to-call", "leaning-below-zero", "below-zero"];
  const rankLi = (r, extra = "") => `<li><span class="r">${r.rank ? r.rank + "." : ""}</span><a href="${cPath(byIso[r.iso])}">${esc(nm(r.iso))}</a><span class="v">${esc(r.value)}</span><span class="e">${esc(r.eur)}${extra}${r.sure ? "" : " · " + esc(r.chance) + (r.side === "ukraine" ? " toward Ukraine" : " toward Russia")}</span></li>`;
  const itemList = rows => ({ "@context": "https://schema.org", "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderDescending", numberOfItems: rows.length,
    itemListElement: rows.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: abs(cPath(byIso[r.iso])), name: nm(r.iso) })) });
  const chanceKey = "Very likely: at least a 95% chance and every other method choice agrees. Leaning: at least 65%. Too close to call: below that. Near zero: the likely range stays within ±0.5% of a year's GDP. % = chance of the more likely direction.";
  const moneyOnly = "The ranking measures money: aid to Ukraine and the change in what Russia keeps from trade, against a world without the war. Weapons sent, troops and diplomacy are not in it.";
  const topicLinks = (skip = "") => `<h2 id="topics">Topics</h2><ul class="rel">${TOPICS.filter(e => pathOf(e) !== skip).map(e => `<li><a href="${pathOf(e)}">${esc(e.label)}</a></li>`).join("")}</ul>`;
  async function rankPage(path, pageKey, rk, ids, rowExtra, extraTop = "", mapHash = "#view=rank") {
    const copy = T.staticCopy(pageKey, facts), url = abs(path), items = [["Map", "/"], [copy.h1.split(":")[0].replace(/ by country since 2022$/, ""), path]];
    const rowsAll = rk.groups.flatMap(g => g.rows);
    const body = `${top("en")}
<main class="wrap">
${crumbs("en", items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
<p><a class="btn" href="/${mapHash}">Open in the map →</a></p>
<p class="note">${esc(moneyOnly)}</p>
<p class="sub">${esc(chanceKey)}</p>
${extraTop}
${rk.groups.filter(g => g.rows.some(r => !r.small)).map(g => `<h2 id="${ids[g.g]}">${esc(g.label)} · ${g.rows.filter(r => !r.small).length}</h2><ol class="rk">${g.rows.filter(r => !r.small).map(r => rankLi(r, rowExtra(r))).join("")}</ol>`).join("\n")}
<h2 id="smaller-economies">Smaller economies (GDP under €5bn)</h2>
<p class="sub">The map's ranking leaves them out by default (Filters › Size), because small amounts swing their shares widely. Each with its group.</p>
<ol class="rk">${rk.groups.flatMap(g => g.rows.filter(r => r.small).map(r => rankLi(r, " · " + esc(g.label) + rowExtra(r)))).join("")}</ol>
${rk.party.length ? `<h2 id="party">Party to the war (with Russia), not ranked</h2><ul class="plain">${rk.party.map(r => `<li><a href="${cPath(byIso[r.iso])}">${esc(nm(r.iso))}</a> ${esc(r.value)} · ${esc(r.eur)}</li>`).join("")}</ul>` : ""}
${rk.noData.filter(i => byIso[i]).length ? `<h2 id="no-data">No data</h2><p class="sub">No observation of their own for the war years: nothing is counted and they are not ranked.</p><p>${rk.noData.filter(i => byIso[i]).map(i => `<a href="${cPath(byIso[i])}">${esc(nm(i))}</a>`).join(", ")}</p>` : ""}
<p><a href="/ranking/">Ranking</a> · <a href="/support-for-ukraine/">Support for Ukraine by country</a> · <a href="/trade-with-russia/">Trade with Russia by country</a> · <a href="/how-it-works/">How it works</a></p>
${topicLinks()}
</main>
${foot("en")}`;
    await put(path, shell({ lang: "en", title: copy.title, description: copy.description, canonical: url, image: abs("share/world.png"), imageAlt: "World map of where each country's money moved since 2022",
      ld: [{ "@context": "https://schema.org", "@type": "CollectionPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items), itemList(rowsAll)], body,
      css: "ul.rel{display:flex;flex-wrap:wrap;gap:6px 16px;list-style:none;padding:0}" }));
  }
  await rankPage("/ranking/", "ranking", EN.rank.net, GROUP_ID, () => "");
  const euroTable = (rows, title, fmt) => `<h2 id="${title.toLowerCase().replace(/[^a-z]+/g, "-")}">${esc(title)}</h2><div class="tbl"><table><thead><tr><th>#</th><th>Country</th><th class="n">€</th><th class="n">% of GDP</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td>${i + 1}</td><td><a href="${cPath(byIso[r.iso])}">${esc(nm(r.iso))}</a></td><td class="n">${esc(fmt(r))}</td><td class="n">${esc(r.value)}</td></tr>`).join("")}</tbody></table></div>`;
  await rankPage("/support-for-ukraine/", "support-for-ukraine", EN.rank.ua, GROUP_ID_UA, r => (r.pp ? " · " + r.pp.replace(/ pp$/, "") + " per person" : ""),
    euroTable(uaRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 15), "Most in euros", r => r.eur.replace(/^\+/, "")) + `<h2>As a share of GDP, with € per person</h2>`, "#view=rank&lens=support");
  await rankPage("/trade-with-russia/", "trade-with-russia", EN.rank.rus, GROUP_ID, () => "",
    euroTable(ruRows.slice().sort((a, b) => a.eurBn - b.eurBn).slice(0, 10), "Russia kept most more, in euros", r => r.eur.replace(/^−/, "")) + euroTable(ruRows.slice().sort((a, b) => b.eurBn - a.eurBn).slice(0, 10), "Russia kept most less, in euros", r => r.eur.replace(/^\+/, "")) + `<h2>As a share of GDP</h2>`,
    "#view=rank&lens=payments");

  // ----- round 55: the topic and group pages (pipeline/seo_topics.json), one generic page each -----
  const dataToMonth = new Date(dataTo + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  for (const e of TOPICS) {
    const m = buildTopic(e, countries, TOPICS, { dataTo: dataToMonth }), path = m.path, url = abs(path);
    const items = [["Map", "/"], ["Ranking", "/ranking/"], [e.label, path]];
    const rel = m.related.map(s => TOPICS.find(x => x.slug === s)).filter(Boolean);
    const body = `${top("en")}
<main class="wrap">
${crumbs("en", items)}
<h1>${esc(m.h1)}</h1>
<p class="intro">${esc(m.intro)}</p>
<p><a class="btn" href="/${m.map}">Open in the map →</a></p>
<p class="note">${esc(moneyOnly.replace("The ranking measures", "These numbers measure"))}</p>
${renderTopic(m, { esc, cPath })}
${rel.length ? `<h2 id="related">Related</h2><ul class="rel">${rel.map(x => `<li><a href="${pathOf(x)}">${esc(x.label)}</a></li>`).join("")}</ul>` : ""}
<p><a href="/ranking/">Ranking</a> · <a href="/support-for-ukraine/">Support for Ukraine by country</a> · <a href="/trade-with-russia/">Trade with Russia by country</a> · <a href="/how-it-works/">How it works</a></p>
${topicLinks(path)}
</main>
${foot("en")}`;
    const ld = [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: m.title, description: m.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET, image: abs("share/world.png") },
      crumbLd(items), itemList(m.rows.map(c => ({ iso: c.iso })))];
    if (m.faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: m.faq.map(x => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) });
    await put(path, shell({ lang: "en", title: m.title, description: m.description, canonical: url, image: abs("share/world.png"), imageAlt: "World map of where each country's money moved since 2022", ld, body, css: TOPIC_CSS + "\nul.rel{display:flex;flex-wrap:wrap;gap:6px 16px;list-style:none;padding:0}" }));
  }

  // ----- How it works, the method pages, the limitations, the changelog -----
  const docPage = async (path, heading, html, first, items, extra = "") => {
    const copy = T.docCopy(heading, first), url = abs(path);
    const body = `${top("en")}
<main class="wrap doc">
${crumbs("en", items)}
<h1>${esc(copy.h1)}</h1>
${extra}
${html}
<p class="meta"><a href="/how-it-works/">How it works</a> · <a href="/limitations/">Limitations</a> · <a href="/changelog/">Changelog</a> · <a href="/#view=how">Open in the map</a></p>
</main>
${foot("en")}`;
    await put(path, shell({ lang: "en", title: copy.title, description: copy.description, canonical: url, image: abs("share/world.png"), imageAlt: "War Balance: where each country's money moved since 2022",
      ld: [{ "@context": "https://schema.org", "@type": path === "/changelog/" ? "WebPage" : "TechArticle", "@id": url, url, headline: copy.h1, name: copy.title, description: copy.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body, ogType: "article" }));
  };
  for (const m of docs.method) await docPage(`/method/${m.page}/`, m.title, m.html, m.first, [["Map", "/"], ["How it works", "/how-it-works/"], [m.title, `/method/${m.page}/`]]);
  await docPage("/limitations/", docs.limitations.title, docs.limitations.html, docs.limitations.first, [["Map", "/"], ["How it works", "/how-it-works/"], [docs.limitations.title, "/limitations/"]]);
  await docPage("/changelog/", docs.changelog.title, docs.changelog.html, docs.changelog.first, [["Map", "/"], ["How it works", "/how-it-works/"], [docs.changelog.title, "/changelog/"]]);
  {
    const copy = T.staticCopy("how-it-works", facts), path = "/how-it-works/", url = abs(path), items = [["Map", "/"], ["How it works", path]];
    const order = ["reading", "overview", "counterfactual", "prices", "trade", "energy-and-laundered-oil", "aid-refugees-military", "loans", "services-shipping-companies", "russia-state-and-companies", "ranges", "tags"];
    const ms = order.map(p => docs.method.find(m => m.page === p)).filter(Boolean).concat(docs.method.filter(m => !order.includes(m.page)));
    const firstSentence = s => (s.match(/^[^.!?]+[.!?]/) || [s])[0];
    const body = `${top("en")}
<main class="wrap">
${crumbs("en", items)}
<h1>${esc(copy.h1)}</h1>
<p class="intro">${esc(copy.intro)}</p>
<p><a class="btn" href="/#view=how">Open in the map →</a></p>
<p class="note">${esc(moneyOnly.replace("The ranking measures", "Every number measures"))}</p>
<h2>The method, page by page</h2>
<ul class="plain">${ms.map(m => `<li style="margin-bottom:10px"><a href="/method/${m.page}/"><b>${esc(m.title)}</b></a><br><span class="sub">${esc(firstSentence(m.first))}</span></li>`).join("")}</ul>
<h2>Every money flow</h2>
<div class="tbl"><table><tbody>${EN.flows.map(f => `<tr><td>${docs.flowMethod[f.id] ? `<a href="${docs.flowMethod[f.id]}">${esc(f.name)}</a>` : esc(f.name)}</td><td>${esc(f.what)}</td></tr>`).join("")}</tbody></table></div>
<h2>Also</h2>
<p><a href="/limitations/">${esc(docs.limitations.title)}</a> · <a href="/changelog/">${esc(docs.changelog.title)}</a> · <a href="/ranking/">Ranking</a> · <a href="/data.json">Full data (JSON)</a></p>
</main>
${foot("en")}`;
    await put(path, shell({ lang: "en", title: copy.title, description: copy.description, canonical: url, image: abs("share/world.png"), imageAlt: "War Balance: where each country's money moved since 2022",
      ld: [{ "@context": "https://schema.org", "@type": "WebPage", "@id": url, url, name: copy.title, description: copy.description, inLanguage: "en", dateModified: DATE_TOKEN, isPartOf: DATASET }, crumbLd(items)], body }));
  }

  // ----- the map: the A–Z list and the data date in index.html, and a copy per language -----
  const idxPath = join(site, "index.html");
  let idx = await readFile(idxPath, "utf8");
  const az = countries.slice().sort((a, b) => a.nameEn.localeCompare(b.nameEn, "en"));
  const azBlock = l => `<!-- az:start -->\n        <p class="sub" id="az-intro">${esc(T.homeCopy(l, facts.n).intro)}</p>\n        <nav id="az" aria-label="${esc(T.L(l, "allCountries"))}">\n${az.map(c => `          <a href="${cPath(c)}" data-iso="${c.iso}">${esc(c.nameEn)}</a>`).join("\n")}\n        </nav>\n<!-- az:end -->`;
  const topicsBlock = `<!-- topics:start -->\n        <nav id="topics" aria-label="Topics" data-i18n-aria="Topics">\n${TOPICS.map(e => `          <a href="${pathOf(e)}">${esc(e.label)}</a>`).join("\n")}\n        </nav>\n<!-- topics:end -->`;
  idx = idx.replace(/<!-- topics:start -->[\s\S]*?<!-- topics:end -->/, topicsBlock);
  idx = idx.replace(/<!-- az:start -->[\s\S]*?<!-- az:end -->/, azBlock("en")).replace(/"dateModified": "[\d-]+"/, `"dateModified": "${data.generated}"`);
  await writeFile(idxPath, idx);
  const homeAlts = T.LANGS.map(l => [l, l === "en" ? U : U + l + "/"]).concat([["x-default", U]]);
  written.push({ path: "/", alternates: homeAlts, lastmod: null });
  for (const l of T.LANGS.filter(x => x !== "en")) {
    const h = T.homeCopy(l, facts.n);
    let x = idx.replace('<html lang="en">', `<html lang="${l}" data-lang="${l}">`).replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">')
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(h.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(h.description)}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(h.title)}">`).replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${esc(h.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${esc(h.description)}">`).replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${esc(h.description)}">`)
      .replace(`<meta property="og:url" content="${U}">`, `<meta property="og:url" content="${U}${l}/">`).replace(`<link rel="canonical" href="${U}">`, `<link rel="canonical" href="${U}${l}/">`)
      .replace(`<meta property="og:locale" content="en_GB">`, `<meta property="og:locale" content="${T.OG_LOCALE[l]}">`).replace(`<meta property="og:locale:alternate" content="${T.OG_LOCALE[l]}">`, `<meta property="og:locale:alternate" content="en_GB">`)
      .replace(/<!-- az:start -->[\s\S]*?<!-- az:end -->/, azBlock(l))
      // a link to a place on this page ("#view=how") stays on /de/ (the <base> would send it to /)
      .replace("</body>", `<script>document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && !e.defaultPrevented && !e.ctrlKey && !e.metaKey) { e.preventDefault(); location.hash = a.getAttribute("href"); } });</script>\n</body>`);
    if (!x.includes("</body>")) x += `<script>document.addEventListener("click", e => { const a = e.target.closest && e.target.closest('a[href^="#"]'); if (a && !e.defaultPrevented && !e.ctrlKey && !e.metaKey) { e.preventDefault(); location.hash = a.getAttribute("href"); } });</script>\n`;
    await mkdir(join(site, l), { recursive: true });
    await writeFile(join(site, l, "index.html"), x);
    written.push({ path: "/" + l + "/", alternates: homeAlts, lastmod: null });
  }
  // the home pages' lastmod: when the map's own text or the A–Z list changed (a hash of index.html), else kept
  {
    const hash = createHash("sha256").update(idx).digest("hex").slice(0, 16), prev = state["/"], date = prev && prev[0] === hash ? prev[1] : today;
    for (const w of written.filter(w => w.lastmod === null)) { w.lastmod = date; newState[w.path] = [hash, date]; }
  }

  // ----- sitemap.xml and robots.txt -----
  const xmlEsc = s => s.replace(/&/g, "&amp;");
  // the home pages first, then the other pages, then the countries (each group in its own order)
  const rankOf = w => (/^\/(\w\w\/)?$/.test(w.path) ? 0 : /\/country\//.test(w.path) ? 2 : 1);
  written.sort((a, b) => rankOf(a) - rankOf(b) || a.path.localeCompare(b.path));
  const urls = written.map(w => `  <url>\n    <loc>${xmlEsc(abs(w.path))}</loc>\n    <lastmod>${w.lastmod}</lastmod>\n${w.alternates.map(([l, u]) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEsc(u)}"/>\n`).join("")}  </url>`);
  await writeFile(join(site, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join("\n")}\n</urlset>\n`);
  await writeFile(join(site, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${U}sitemap.xml\n`);
  // the state, sorted, so a diff shows only pages whose words or numbers changed
  const sorted = Object.fromEntries(Object.keys(newState).sort().map(k => [k, newState[k]]));
  const changed = Object.keys(sorted).filter(k => !state[k] || state[k][0] !== sorted[k][0]);
  await writeFile(statePath, JSON.stringify(sorted, null, 0).replace(/\],"/g, '],\n"').replace(/^\{/, "{\n") .replace(/\}$/, "\n}") + "\n");
  log(`seo: ${written.length} pages (${countries.length} countries, ${written.filter(w => /^\/\w\w\/country\//.test(w.path)).length} in other languages), sitemap.xml; ${changed.length} new or changed since pipeline/seo_lastmod.json`);
  return { pages: written.length, changed };
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
