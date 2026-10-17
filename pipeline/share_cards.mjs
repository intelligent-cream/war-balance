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
await page.waitForFunction(() => typeof DATA !== "undefined" && Object.keys(DATA).length > 100);
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
    <div style="margin-top:10px;font-size:22px;color:#55636e">Who shifted money toward <b style="color:#2a6fb0">Ukraine</b>, and who toward <b style="color:#c9520f">Russia</b>? Every country, as a share of its economy, since before the war.</div>`;
  document.body.appendChild(el);
});
await page.waitForTimeout(800);
await page.screenshot({ path: join(SITE, "share", "world.png") });
await page.evaluate(() => document.body.lastElementChild.remove());

const cards = await page.evaluate(() => {
  const out = [];
  for (const c of Object.values(DATA)) {
    const k = calc(c, 2026);
    const parts = k.shiftParts.concat(state.netBack ? k.backShift : [])
      .filter(p => Math.abs(p.v) > 1e-3).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 4);
    out.push({
      iso3: c.iso3, name: c.name, toUkr: k.shift >= 0,
      pct: fmtMeasure(c, k.shift, "gdp", true), eur: eur(k.shift, true), pp: c.pop ? perPerson(c, k.shift) : "",
      lo: fmtMeasure(c, k.shiftLo, "gdp", true), hi: fmtMeasure(c, k.shiftHi, "gdp", true),
      parts: parts.map(p => ({ label: p.label, v: eur(p.v, true), pos: p.v >= 0 })),
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
    const col = d.toUkr ? "#2a6fb0" : "#c9520f";
    el.style.cssText = "position:fixed;inset:0;z-index:99;background:#fbfcfc;color:#15212b;font-family:'Source Sans 3',system-ui,sans-serif;padding:52px 64px;display:flex;flex-direction:column";
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:115%;font-size:26px;letter-spacing:-.01em">
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#2a6fb0"></span>
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#d4601a;margin-left:-10px"></span>
        Follow the Money: Ukrainian Aid</div>
      <div style="margin-top:34px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:112%;font-size:64px;letter-spacing:-.02em;line-height:1">${d.name}</div>
      <div style="display:flex;align-items:baseline;gap:18px;margin-top:16px">
        <span style="font-family:Archivo,sans-serif;font-weight:800;font-size:112px;letter-spacing:-.03em;line-height:1;color:${col}">${d.pct}</span>
        <span style="font-size:30px;font-weight:600;color:#15212b;line-height:1.15">of a year's GDP<br>toward ${d.toUkr ? "Ukraine" : "Russia"}</span>
      </div>
      <div style="margin-top:12px;font-size:23px;color:#55636e">since before the war, 2022–2026 · ${d.eur}${d.pp ? " · " + d.pp : ""} · likely ${d.lo} to ${d.hi}</div>
      <div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;gap:6px 40px;font-size:21px">
        ${d.parts.map(p => `<div style="display:flex;justify-content:space-between;border-top:1px solid #d6dde2;padding-top:6px"><span>${p.label}</span><b style="font-family:'IBM Plex Mono',monospace;font-weight:500;color:${p.pos ? "#2a6fb0" : "#c9520f"}">${p.v}</b></div>`).join("")}
      </div>
      <div style="margin-top:18px;font-size:17px;color:#55636e">Figures to ${d.dataTo} · research preview, every number with a range and a source · intelligent-cream.github.io/follow-the-money-ukraine</div>`;
  }, d);
  await page.waitForTimeout(30);
  const iso = d.iso3.toLowerCase();
  await page.screenshot({ path: join(SITE, "share", iso + ".png") });
  const title = `${d.name}: ${d.pct} of GDP toward ${d.toUkr ? "Ukraine" : "Russia"} | Follow the Money: Ukrainian Aid`;
  const desc = `Since before the war, 2022–2026: ${d.eur}${d.pp ? ", " + d.pp : ""}. Likely range ${d.lo} to ${d.hi} of a year's GDP. Every number with a source.`;
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
