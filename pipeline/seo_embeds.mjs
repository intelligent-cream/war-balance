// Round 71 (owner: "I would love if we can transform the pages to have this vibe. I love the data embeds that show the
// map, the different charts and everything"): the interactive embeds, written with the pages (seo_pages.mjs calls
// writeEmbeds at the end of its run).
//
//   /embed/<name>/ and /<lang>/embed/<name>/   one small page per embed and language: the frame (title, subtitle with
//                                              unit and period, the War Balance mark, a source line with the data's date,
//                                              a toolbar) around a chart drawn by embed.js; noindex, its canonical the
//                                              page it belongs to, with a visible link back
//   /embed/data.json                           every country's figures, from the map's own calc() as the pages show them
//                                              (seo_extract.mjs): support, trade and net by year (they add up to the
//                                              page's totals exactly; checked here), the parts of its support, GDP and
//                                              population, its name in every language
//   /embed/embed.js, /embed/embed.css          the runtime (pipeline/embed/runtime.js after the number formats of
//                                              seo_i18n.mjs, so an embed writes a figure exactly as its page does) and
//                                              its look (pipeline/embed/embed.css)
//   /vendor/d3-7.9.0.min.js, topojson-client   self-hosted (site/vendor/, with their licences); only the embeds load them
//
// On a page an embed is a slot (slot()): the page's static chart image stays in it as the fallback without JavaScript and
// for search engines, and an iframe replaces it once it is near the screen and has drawn (LOADER, a few hundred bytes
// inline), so a page is no heavier to its first paint.
//
// Words: seo_i18n.mjs EMB (the embeds' own, all seven languages, read by the wording guard) and the phrases the pages and
// the chart images already use (IMG, PLAIN, LABELS).

import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as I from "./seo_i18n.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const hash = s => createHash("sha256").update(s).digest("hex").slice(0, 8);
export const D3_FILE = "/vendor/d3-7.9.0.min.js", TOPO_FILE = "/vendor/topojson-client-3.1.0.min.js";
export const NAMES = ["explorer", "support-by-country", "totals-over-time", "per-person", "toward-russia", "frozen-assets"];
export const embedPath = (l, name) => (l === "en" ? "" : "/" + l) + "/embed/" + name + "/";
// a first height for the frame (it then takes the height the embed reports)
export const EMB_H = { explorer: 780, "support-by-country": 760, "totals-over-time": 600, "per-person": 760, "toward-russia": 700, "frozen-assets": 640, country: 820, topic: 720, series: 560 };
const MAT = 0.0005;
const r6 = v => Math.round((+v || 0) * 1e6) / 1e6;

// ----- the data: one compact file for every embed -----
// countries: the English extraction (seo_extract.mjs: fig, measures, years, gdp, pop, region, party, noData); names: { l:
// { iso: name } }; num: { iso: the map's numeric id }; frozen: { rows, hero, total, none(l) } from the frozen-assets chart;
// ru: the rows of countries-helping-russia/ (iso, net and its range, sure)
export function embedData({ countries, names, num, years, frac, dataTo, included, frozen, ru }) {
  const ys = years.filter(y => y >= 2022), ytd = ys.map(y => (frac[years.indexOf(y)] ?? 1) < 1);
  const c = {};
  for (const x of countries) {
    if (!x.gdp) continue;
    const f = x.fig || {}, m = k => (x.measures && x.measures[k] && x.measures[k].v != null ? x.measures[k].v : 0);
    const yr = q => ys.map(y => r6(((x.years || []).find(z => z.y === y) || {})[q]));
    const y = [yr("uaBn"), yr("rusBn"), yr("netBn"), yr("frozenBn")];
    const tot = [f.ua || 0, f.rus || 0, f.net || 0, f.frozen || 0].map(r6);
    // the years add up to the page's totals (seo_extract.mjs years: calc() by year, the difference of running totals)
    y.forEach((arr, i) => { const s = arr.reduce((a, b) => a + b, 0); if (Math.abs(s - tot[i]) > 1e-4) throw new Error(`seo_embeds: ${x.iso} years add up to ${s}, not ${tot[i]} (${i})`); });
    const lv = k => ((f[k] || {}).level === "sure" ? 1 : 0);
    c[x.iso] = { n: num[x.iso] || "", s: x.slug, g: r6(x.gdp), p: x.pop ? r6(x.pop) : 0, r: x.region || "", pt: x.party ? 1 : 0, nd: x.noData || x.mostlyNoData ? 1 : 0,
      sU: lv("cU"), sR: lv("cR"), sN: lv("cN"), f: tot, y, pa: [r6(m("part:aid")), r6(m("part:euaid")), r6(m("part:ref"))], pd: r6(f.paidRussia || 0) };
  }
  return { v: 1, dataTo, years: ys, ytd, c, nm: names, inc: included || {}, fz: frozen || null, fzNames: (frozen && frozen.names) || {}, ru: ru || [] };
}

// ----- the words of an embed in a language -----
// raw: the phrase with the runtime's placeholders kept ({n}, {y}, {month}, {date}, {total}); {q:...} opened
const raw = (fn, l, k) => fn(l, k, x => `{${x}}`);
export function strings(l, { T, unitBn, faded, gdpMin }) {
  const E = k => I.emb(l, k), R = k => raw(I.emb, l, k);
  const out = {};
  for (const k of ["explorer", "view", "tabTable", "tabMap", "tabLine", "tabBar", "measure", "mNet", "mUa", "mRus", "unit", "uEur", "uPp", "uGdp", "sortBy", "sName", "sValue", "order", "selectAll", "clear", "countries", "search",
    "play", "pause", "year", "legend", "partyShort", "period", "pick", "cumNote", "loading", "about", "download", "dlCsv", "dlPng", "share", "link", "copy", "copied", "embed", "embedHelp", "full", "exitFull", "close",
    "back", "zoomIn", "zoomOut", "reset", "set", "pAll", "pEurope", "pEu", "pG7", "running", "each", "mode", "rangeShort", "towardRu", "plus", "minus", "showFewer", "yearSigns", "failed"]) out[k] = E(k);
  for (const k of ["ytd", "sumOf", "ytdNote", "showAll"]) out[k] = R(k);
  Object.assign(out, {
    na: I.img(l, "na"), kAid: I.img(l, "kAid"), kEu: I.img(l, "kEu"), kRef: I.img(l, "kRef"), kOther: I.img(l, "kOther"), kBack: I.img(l, "kBack"), kCb: I.img(l, "kCb"), kPriv: I.img(l, "kPriv"),
    range: I.img(l, "range"), rangeTotal: I.img(l, "rangeTotal"), heroFrozen: I.img(l, "heroFrozen"), heroFrozenSmall: raw(I.img, l, "heroFrozenSmall"),
    unitEur: unitBn, unitPp: I.img(l, "unitPp"), unitPct: I.img(l, "unitPct"), faded,
    preview: T.L(l, "preview"), how: T.L(l, "how"), noData: T.L(l, "noData"), noDataText: T.L(l, "noDataText"), party: T.L(l, "party"), country: T.L(l, "country"), byYear: T.L(l, "byYear"),
    frozen: T.L(l, "frozen"), total: T.L(l, "total"), licence: I.img(l, "credit"), ukraine: I.s(l, "ukraine"), russia: I.s(l, "russia"),
    tBreak: I.plain(l, "tBreak"), bkAid: I.plain(l, "bkAid"), bkEu: I.plain(l, "bkEu"), bkRef: I.plain(l, "bkRef"), bkOther: I.plain(l, "bkOther"), bkUa: I.plain(l, "bkUa"), bkRusLess: I.plain(l, "bkRusLess"),
    bkRusMore: I.plain(l, "bkRusMore"), bkFrozen: I.plain(l, "bkFrozen"), bkNet: I.plain(l, "bkNet"), bkKey: I.plain(l, "bkKey"), gdpMin,
  });
  return out;
}

// ----- one embed page -----
// extra: a page's own data for the "topic" and "series" kinds (rows, unit, signed, keys, colName, colValue; sets)
export function pageHtml({ l, name, kind, title, sub, subBase = "", period, note, canonical, self, source, dated, month, S, fontCss, v, iso = "", home, extra = null }) {
  const cfg = { kind, name, l, s: S, data: "/embed/data.json?v=" + v.data, self, title, sub, subBase, period, source, dated, note, method: "/how-it-works/", month, iso, ...(extra || {}) };
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const tools = [["info", S.about, "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 11v6M12 7.5v.5"], ["dl", S.download, "M12 4v11M7 10l5 5 5-5M5 20h14"],
    ["share", S.share, "M18 4a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5M6 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5M18 15a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5M8.2 11l7.6-4M8.2 13l7.6 4"],
    ["full", S.full, "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"]];
  return `<!doctype html>
<html lang="${l}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} | War Balance</title>
<meta name="description" content="${esc(note.length > 155 ? note.slice(0, 154).replace(/\s+\S*$/, "") + "…" : note)}">
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="${canonical}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>(function(){var d=document.documentElement,t=null;try{t=new URLSearchParams(location.search).get("theme")||localStorage.getItem("ftm-theme")}catch(e){}d.dataset.theme=t==="dark"?"dark":"light";if(window.self===window.top)d.className="solo"})()</script>
<link rel="preload" href="/fonts/source-sans-3-latin.woff2" as="font" type="font/woff2" crossorigin>
<style>${fontCss}html.solo body{background:var(--bg);padding:16px}</style>
<link rel="stylesheet" href="/embed/embed.css?v=${v.css}">
</head>
<body>
<div class="emb" id="emb" data-kind="${kind}">
<header class="emb-head"><div><h1 class="emb-title">${esc(title)}</h1><p class="emb-sub">${esc(sub ? sub[0].toUpperCase() + sub.slice(1) : "")}</p></div><a class="emb-mark" href="${home}" target="_top"><img src="/favicon.svg" alt="" width="20" height="20">War Balance</a></header>
<div class="emb-main"><p class="emb-load">${esc(S.loading)}</p><noscript><p class="emb-empty"><a href="${canonical}" target="_top">${esc(S.back)}</a></p></noscript></div>
<div class="emb-pop" role="dialog" hidden></div>
<footer class="emb-foot"><div><p>${esc(source)} · <b>${esc(dated)}</b></p><p>${esc(S.preview)} <a href="${canonical}" target="_top">${esc(S.back)} →</a></p></div>
<div class="emb-tools">${tools.map(([k, t, d]) => `<button type="button" data-act="${k}" aria-label="${esc(t)}" title="${esc(t)}" aria-expanded="false">${icon(d)}</button>`).join("")}</div></footer>
</div>
<script type="application/json" id="emb-cfg">${JSON.stringify(cfg).replace(/</g, "\\u003c")}</script>
<script src="${D3_FILE}" defer></script>${kind === "explorer" ? `\n<script src="${TOPO_FILE}" defer></script>` : ""}
<script src="/embed/embed.js?v=${v.js}" defer></script>
</body>
</html>
`;
}

// ----- writing: the data, the runtime, the look and every page -----
// pages: [{ l, name, kind, title, sub, subBase, period, note, canonical, source, dated, month, iso }] (self is worked out)
export async function writeEmbeds({ site, siteUrl, data, pages, S, fontCss }) {
  const U = siteUrl.replace(/\/$/, "");
  await rm(join(site, "embed"), { recursive: true, force: true });
  for (const l of I.LANGS.filter(x => x !== "en")) await rm(join(site, l, "embed"), { recursive: true, force: true });
  await mkdir(join(site, "embed"), { recursive: true });
  const dataTxt = JSON.stringify(data);
  const js = `// War Balance embeds: the number formats of the pages (pipeline/seo_i18n.mjs), then the runtime (pipeline/embed/runtime.js)\nvar WBF = (function () {\n${I.FMT_SOURCE()}\nreturn { P: P, E: E, PP: PP };\n})();\n` + (await readFile(join(HERE, "embed", "runtime.js"), "utf8"));
  const css = await readFile(join(HERE, "embed", "embed.css"), "utf8");
  await writeFile(join(site, "embed", "data.json"), dataTxt);
  await writeFile(join(site, "embed", "embed.js"), js);
  await writeFile(join(site, "embed", "embed.css"), css);
  const v = { data: hash(dataTxt), js: hash(js), css: hash(css) };
  for (const p of pages) {
    const path = embedPath(p.l, p.name), file = join(site, path.replace(/^\//, ""), "index.html");
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, pageHtml({ ...p, self: U + path, S: S[p.l], fontCss, v, home: p.l === "en" ? "/" : "/" + p.l + "/" }));
  }
  return { n: pages.length, bytes: { data: dataTxt.length, js: js.length, css: css.length } };
}

// ----- on a page: the slot, the loader and their look (the page's rhythm is seo_plain.mjs) -----
// fallback: the static chart (figureHtml) or other HTML shown without JavaScript and until the embed has drawn
export function slot({ l, name, title, fallback = "", caption = "", h, hash = "" }) {
  const src = embedPath(l, name) + (hash ? "#" + hash.replace(/^#/, "") : "");
  return `<div class="emb-slot" data-emb="${src}" data-emb-h="${h || EMB_H[name.split("/")[0]] || 620}" data-emb-title="${esc(I.emb(l, "iframeTitle", { title }))}">
<div class="emb-fb">${fallback}<p class="emb-open"><a href="${src}">${esc(I.emb(l, "open"))} →</a></p></div>
</div>${caption ? `\n<p class="emb-cap">${esc(caption)}</p>` : ""}`;
}
// the iframes, made once a slot is near the screen; each shows once it reports its height (embed.js report())
export const LOADER = `<script>(function(){var s=document.querySelectorAll(".emb-slot[data-emb]");if(!s.length||!("IntersectionObserver" in window))return;var th=document.documentElement.dataset.theme||"";
function go(x){if(x.querySelector("iframe"))return;var f=document.createElement("iframe");var u=x.getAttribute("data-emb").split("#");f.src=u[0]+(th?"?theme="+th:"")+(u[1]?"#"+u[1]:"");f.title=x.getAttribute("data-emb-title");f.setAttribute("loading","lazy");f.setAttribute("allow","fullscreen; clipboard-write");f.setAttribute("allowfullscreen","");f.style.height=x.getAttribute("data-emb-h")+"px";x.appendChild(f)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);go(e.target)}})},{rootMargin:"600px 0px"});s.forEach(function(x){io.observe(x)});
addEventListener("message",function(e){if(e.origin!==location.origin||!e.data||e.data.type!=="wb-emb")return;document.querySelectorAll(".emb-slot iframe").forEach(function(f){if(f.contentWindow===e.source){f.style.height=e.data.h+"px";f.parentNode.classList.add("emb-on")}})})})();</script>`;
export const PAGE_CSS = `
.emb-slot{position:relative;margin:16px 0 6px}.emb-slot iframe{display:block;width:100%;border:0;position:absolute;left:0;top:0;visibility:hidden;color-scheme:normal}
.emb-slot.emb-on iframe{position:static;visibility:visible}.emb-slot.emb-on>.emb-fb{display:none}
.emb-fb figure.chart{margin:0}.emb-open{margin:6px 0 0;font-size:14.5px}.emb-cap{font-size:15px;color:var(--soft);margin:6px 0 22px}`;
