// Share images and pages: one 1200×630 preview card per country (site/share/<iso>.png), a page per country
// (site/c/<iso>.html) whose link preview shows that card and which opens the map on that country, and a world card.
// Uses the map's own calculations, so the cards always match the map.
//
// Run after build_data.py:  node pipeline/share_cards.mjs
// Needs Node 18+ and Playwright (npm i -g playwright; a Chromium build, or PLAYWRIGHT_CHROMIUM=/path/to/chromium).

import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const SITE_URL = "https://intelligent-cream.github.io/follow-the-money-ukraine/";
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css" };

const server = createServer(async (req, res) => {
  try {
    const path = join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html"));
    const body = await readFile(path);
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: "light" });
await page.goto(base + "index.html");
// round 16 (review 5, C2): the page says when it is ready, with the method band's alternatives loaded
await page.waitForFunction(() => document.body.dataset.ready === "true" && typeof DATA !== "undefined" && Object.keys(DATA).length > 100);
await page.waitForTimeout(1500);
await mkdir(join(SITE, "share"), { recursive: true });
await mkdir(join(SITE, "c"), { recursive: true });

// world card: the map itself, without panels
await page.evaluate(() => {
  for (const sel of ["#status", ".bar", ".legend", ".zoom", ".map-title", "#hint", "#flows"]) document.querySelector(sel).style.display = "none";
  window.dispatchEvent(new Event("resize"));
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;left:48px;bottom:44px;z-index:99;background:#fbfcfcee;padding:22px 28px;border-radius:10px;max-width:640px;font-family:'Source Sans 3',sans-serif;color:#15212b";
  el.innerHTML = `<div style="font-family:Archivo,sans-serif;font-weight:800;font-stretch:115%;font-size:40px;letter-spacing:-.02em;line-height:1.05">Follow the Money:<br>Ukrainian Aid</div>
    <div style="margin-top:10px;font-size:22px;color:#55636e">Every country's net: its <b style="color:#2a6fb0">support for Ukraine</b> plus the <b style="color:#c9520f">change in its payments to Russia</b>, as a share of its economy: totals since 2022 against one year's GDP.</div>`;
  document.body.appendChild(el);
});
await page.waitForTimeout(800);
await page.screenshot({ path: join(SITE, "share", "world.png") });
await page.evaluate(() => document.body.lastElementChild.remove());

const cards = await page.evaluate(() => {
  const out = [];
  for (const c of Object.values(DATA)) {
    const k = calc(c, 2026);
    const yrs = yearsOf(2026);
    // round 16b (check 16, N3): "about 0" instead of "likely −<0.01% to +<0.01%" where both ends round to zero
    const rg = (lo, hi) => (nearZero(c, lo) && nearZero(c, hi) ? "about 0" : `likely ${fmtMeasure(c, lo, "gdp", true)} to ${fmtMeasure(c, hi, "gdp", true)}`);
    out.push({
      netRange: rg(k.shiftLo, k.shiftHi), uaRange: rg(k.uaLo, k.uaHi), ruRange: rg(k.rusLo, k.rusHi),
      iso3: c.iso3, name: c.name, uaPos: k.uaBal >= 0,
      // round 14 (audit C4): the same words as the panel (rusWords in index.html): "cut off by Russia" only where it
      // did, "earned from Russia" for earners. Round 15 (approved by the owner): the net leads, as on the map, then its
      // two parts; every figure is a total since 2022 with its average year; the main part of each number is named
      ua: fmtMeasure(c, k.uaBal, "gdp", true), uaY: perYear(c, k.uaBal, 2026), uaEur: eur(k.uaBal, true),
      ru: fmtMeasure(c, k.rusBal, "gdp", true), ruY: perYear(c, k.rusBal, 2026), ruLess: k.rusBal >= 0, ruWhat: rusWords(c, k).en,
      uaUnc: uncertain(c, 2026, "ua"), ruUnc: uncertain(c, 2026, "rus"), netUnc: uncertain(c, 2026, "net"), years: yrs.toFixed(1),
      refX: c.ref_excluded ? eur(c.ref_excluded.years.reduce((a, b) => a + b, 0)) : "",
      netPos: k.shift >= 0, earner: !!k.earner,
      pct: fmtMeasure(c, k.shift, "gdp", true), pctY: perYear(c, k.shift, 2026), eur: eur(k.shift, true), pp: c.pop ? perPerson(c, k.shift) : "", netWhat: netWords(c, k, "en"),
      lo: fmtMeasure(c, k.shiftLo, "gdp", true), hi: fmtMeasure(c, k.shiftHi, "gdp", true),
      // round 16 (review 5, M5): every number with its likely range; Russian money frozen on its own line (net only)
      uaLo: fmtMeasure(c, k.uaLo, "gdp", true), uaHi: fmtMeasure(c, k.uaHi, "gdp", true), ruLo: fmtMeasure(c, k.rusLo, "gdp", true), ruHi: fmtMeasure(c, k.rusHi, "gdp", true),
      fz: Math.abs(k.frozen) >= 0.0005 ? fmtMeasure(c, k.frozen, "gdp", true) : "",
      dataTo: document.body.dataset.dataTo || "",
    });
  }
  return out;
});

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
for (const d of cards) {
  await page.evaluate(d => {
    let el = document.getElementById("card");
    if (!el) { el = document.createElement("div"); el.id = "card"; document.body.appendChild(el); }
    // the map's colours: blue toward Ukraine, orange toward Russia, gold for earners from the war effort
    const col = d.netPos ? "#2a6fb0" : d.earner ? "#8f7417" : "#c9520f";
    el.style.cssText = "position:fixed;inset:0;z-index:99;background:#fbfcfc;color:#15212b;font-family:'Source Sans 3',system-ui,sans-serif;padding:40px 64px 34px;display:flex;flex-direction:column";
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:115%;font-size:26px;letter-spacing:-.01em">
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#2a6fb0"></span>
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#d4601a;margin-left:-10px"></span>
        Follow the Money: Ukrainian Aid</div>
      <div style="margin-top:18px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:112%;font-size:54px;letter-spacing:-.02em;line-height:1">${d.name}</div>
      <div style="display:flex;align-items:baseline;gap:18px;margin-top:12px">
        <span style="font-family:Archivo,sans-serif;font-weight:800;font-size:88px;letter-spacing:-.03em;line-height:1;color:${col}">${d.pct}</span>
        <span style="font-size:27px;font-weight:600;color:#15212b;line-height:1.15">net: of a year's GDP in total<br>since 2022 (about ${d.pctY} a year)</span>
      </div>
      <div style="margin-top:10px;font-size:26px;font-weight:600;color:#15212b;line-height:1.25">${d.netRange[0].toUpperCase() + d.netRange.slice(1)}${d.netUnc ? " · direction uncertain" : ""} · ${d.eur}${d.pp ? " · " + d.pp : ""}</div>
      <div style="margin-top:8px;font-size:24px;color:#15212b;line-height:1.25;border-left:5px solid #d4601a;padding-left:12px">It adds two different things: aid given and payments to Russia avoided.${d.netWhat ? " " + d.netWhat[0].toUpperCase() + d.netWhat.slice(1) + "." : ""}</div>
      <div style="margin-top:12px;font-size:23px;color:#15212b;line-height:1.3">Support for Ukraine <b style="color:${d.uaPos ? "#2a6fb0" : "#8f7417"}">${d.ua}</b> (${d.uaRange})${d.uaUnc ? " · direction uncertain" : ""}${d.refX ? ` · hosted Ukrainian refugees (${d.refX}), not counted as support: co-belligerent` : ""}</div>
      <div style="margin-top:6px;font-size:23px;color:#15212b;line-height:1.3">Change in payments to Russia <b style="color:${d.ruLess ? "#2a6fb0" : "#c9520f"}">${d.ru}</b> (${d.ruRange}): ${d.ruWhat}${d.ruUnc ? " · direction uncertain" : ""}</div>
      ${d.fz ? `<div style="margin-top:6px;font-size:23px;color:#15212b;line-height:1.3">Russian money frozen <b style="color:#2a6fb0">${d.fz}</b>: the return Russia lost on its reserves frozen here, in the net only</div>` : ""}
      <div style="margin-top:auto;font-size:17px;color:#55636e;line-height:1.35">2022 to August 2026 (about ${d.years} years) · figures to ${d.dataTo} · research preview, every number with a range and a source<br>intelligent-cream.github.io/follow-the-money-ukraine</div>
`;
  }, d);
  await page.waitForTimeout(30);
  const iso = d.iso3.toLowerCase();
  await page.screenshot({ path: join(SITE, "share", iso + ".png") });
  const title = `${d.name}: net ${d.pct} of a year's GDP in total since 2022 (${d.netRange}; support for Ukraine ${d.ua}; change in payments to Russia ${d.ru}) | Follow the Money: Ukrainian Aid`;
  const desc = `In total since 2022 (to August 2026, about ${d.years} years) against one year's GDP: net ${d.pct} (${d.netRange}; ${d.eur}; about ${d.pctY} a year)${d.netWhat ? ", " + d.netWhat : ""}${d.netUnc ? ", direction uncertain" : ""}, the sum of support for Ukraine ${d.ua} (${d.uaRange}) and change in payments to Russia ${d.ru} (${d.ruRange}; ${d.ruWhat})${d.fz ? `, plus Russian money frozen ${d.fz}` : ""}. The net adds two different things: aid given and payments to Russia avoided. Every number with a range and a source.`;
  await writeFile(join(SITE, "c", iso + ".html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE_URL}c/${iso}.html">
<meta property="og:image" content="${SITE_URL}share/${iso}.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${SITE_URL}#${d.iso3}">
<meta http-equiv="refresh" content="0; url=../#${d.iso3}">
<style>body{font-family:system-ui,sans-serif;margin:40px;color:#15212b;background:#fbfcfc}</style>
</head><body><p><a href="../#${d.iso3}">${esc(d.name)} on the map</a></p><script>location.replace("../#${d.iso3}");</script></body></html>
`);
}
console.log(`wrote ${cards.length} cards and pages, and share/world.png`);
await browser.close();
server.close();
