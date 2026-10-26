// Share images: one 1200×630 preview card per country (site/share/<iso>.png) and a world card. Uses the map's own
// calculations, so the cards always match the map. Then (round 54) the static pages, with the same page still open:
// a page per country whose link preview shows its card, the ranking and method pages, the map in each language,
// robots.txt and sitemap.xml (seo_pages.mjs), with the site's address from pipeline/site_config.json.
//
// Run after build_data.py:  node pipeline/share_cards.mjs
// Needs Node 18+ and Playwright (npm i -g playwright; a Chromium build, or PLAYWRIGHT_CHROMIUM=/path/to/chromium).

import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { writeSeoPages } from "./seo_pages.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
// the site's own address, in one place (round 30): pipeline/site_config.json
const CFG = JSON.parse(await readFile(join(dirname(fileURLToPath(import.meta.url)), "site_config.json"), "utf8"));
const SITE_URL = CFG.site_url, HOST = new URL(SITE_URL).host;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".md": "text/markdown" };

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
  // round 17: the map as it opens (with its money streams), without the header line, the buttons and the legend (round 21:
  // all three are in the header bar; the map opens on Europe, so the title box sits on the right)
  for (const sel of [".topbar", ".legend", "#fact", "#hlpanel", "#flows"]) { const el = document.querySelector(sel); if (el) el.style.display = "none"; }
  window.dispatchEvent(new Event("resize"));
  const el = document.createElement("div");
  el.style.cssText = "position:fixed;right:40px;bottom:40px;z-index:99;background:#fbfcfcee;padding:22px 28px;border-radius:10px;max-width:560px;font-family:'Source Sans 3',sans-serif;color:#15212b";
  el.innerHTML = `<div style="font-family:Archivo,sans-serif;font-weight:800;font-stretch:115%;font-size:40px;letter-spacing:-.02em;line-height:1.05">War<br>Balance</div>
    <div style="margin-top:10px;font-size:22px;color:#55636e">Where did each country's money move: <b style="color:#2a6fb0">toward Ukraine</b> or <b style="color:#c9520f">toward Russia</b>? Its support for Ukraine plus how much <span style="color:#2a6fb0">less</span>, or <span style="color:#c9520f">more</span>, Russia kept from trade with it (taxes and profit, not the full price), as a share of its economy: totals since 2022 against one year's GDP.</div>`;
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
    // round 29: the page's own range in words (no signs under unsigned headlines)
    const rg = (lo, hi, q = "net") => rangeWords(c, lo, hi, q, "gdp");
    out.push({
      netRange: rg(k.shiftLo, k.shiftHi), uaRange: rg(k.uaLo, k.uaHi, "ua"), ruRange: rg(k.rusLo, k.rusHi),
      partyWhy: PARTY_TO_WAR.has(c.iso3) ? PARTY_WHY[c.iso3] : "",
      iso3: c.iso3, name: c.name, uaPos: k.uaBal >= 0,
      // round 14 (audit C4): the same words as the panel (rusWords in index.html): "cut off by Russia" only where it
      // did, "earned from Russia" for earners. Round 15 (approved by the owner): the net leads, as on the map, then its
      // two parts; every figure is a total since 2022 with its average year; the main part of each number is named
      ua: fmtMeasure(c, k.uaBal, "gdp", true), uaY: perYear(c, k.uaBal, 2026), uaEur: eur(k.uaBal, true),
      // round 17 (approved by the owner): business with Russia, with the sign in words: "paid Russia €65.8bn (1.6% of GDP)
      // less than without the war", with its main cause or the gas Russia cut off itself (the page is in English here).
      // Round 22 (owner): every number as a verb and an amount, from the page's own verb() and netSentence()
      ru: fmtMeasure(c, k.rusBal, "gdp", true), ruY: perYear(c, k.rusBal, 2026), ruLess: k.rusBal >= 0, ruWhat: keptWords(c, k, "gdp", true),
      uaUnc: uncertain(c, 2026, "ua"), ruUnc: uncertain(c, 2026, "rus"), netUnc: uncertain(c, 2026, "net"), years: yrs.toFixed(1),
      // round 24b (owner): "leaning toward ..." or "uncertain direction" (the page's own words), and a party to the war
      uaDir: dirWords(c, 2026, "ua"), ruDir: leaning(c, 2026, "rus") ? "" : dirWords(c, 2026, "rus"), netDir: dirWords(c, 2026, "net"), party: PARTY_TO_WAR.has(c.iso3),
      refX: c.ref_excluded ? eur(c.ref_excluded.years.reduce((a, b) => a + b, 0)) : "",
      netPos: k.shift >= 0, earner: !!k.earner,
      pct: fmtMeasure(c, k.shift, "gdp", true), pctY: perYear(c, k.shift, 2026), eur: eur(k.shift, true), pp: c.pop ? perPerson(c, k.shift) : "", netWhat: netWords(c, k, "en"),
      lo: fmtMeasure(c, k.shiftLo, "gdp", true), hi: fmtMeasure(c, k.shiftHi, "gdp", true),
      // round 16 (review 5, M5): every number with its likely range; Russian money frozen on its own line (net only)
      uaLo: fmtMeasure(c, k.uaLo, "gdp", true), uaHi: fmtMeasure(c, k.uaHi, "gdp", true), ruLo: fmtMeasure(c, k.rusLo, "gdp", true), ruHi: fmtMeasure(c, k.rusHi, "gdp", true),
      fz: Math.abs(k.frozen) >= 0.0005 ? fmtMeasure(c, k.frozen, "gdp", true) : "",
      dataTo: document.body.dataset.dataTo || "",
      netVerb: verbAround(uncertain(c, 2026, "net") && leaning(c, 2026, "net") ? "netLean" : "net", k.shift)[0], pctU: fmtMeasure(c, Math.abs(k.shift), "gdp"), pctYU: fmtMeasure(c, Math.abs(k.shift) / yrs, "gdp"), eurU: eur(Math.abs(k.shift)),
      uaV: verb("ua", k.uaBal, c, "gdp"), ruV: verb(uncertain(c, 2026, "rus") && leaning(c, 2026, "rus") ? "rusLean" : "rus", k.rusBal, c, "gdp"), fzV: Math.abs(k.frozen) >= 0.0005 ? verb("frozen", k.frozen, c, "gdp") : "",
      // round 25: the title says "Leaning toward …" when the net leans, as the card and the panel do
      netV: verb(uncertain(c, 2026, "net") && leaning(c, 2026, "net") ? "netLean" : "net", k.shift, c, "gdp"), sum: netSentence(c, k, "gdp"),
    });
  }
  return out;
});

for (const d of cards) {
  d.host = HOST;
  await page.evaluate(d => {
    let el = document.getElementById("card");
    if (!el) { el = document.createElement("div"); el.id = "card"; document.body.appendChild(el); }
    // the map's one colour rule (round 17): blue toward Ukraine, orange toward Russia, grey for no clear change and for
    // earning from the war effort, which is not money toward Russia
    // a direction that is not certain (round 24b: leaning or uncertain): the faded colour of the way it leans (round 17, as on the map). Round 21 (polish): a softer tint
    // of the same hue, not a mix with the grey (the orange one was a brown); still 3:1 on the card for large text
    const grey = "#55636e", fadeB = "#5b88b5", fadeO = "#cc7a40";
    const col = d.earner ? grey : d.netUnc ? (d.netPos ? fadeB : fadeO) : d.netPos ? "#2a6fb0" : "#c9520f";
    el.style.cssText = "position:fixed;inset:0;z-index:99;background:#fbfcfc;color:#15212b;font-family:'Source Sans 3',system-ui,sans-serif;padding:40px 64px 34px;display:flex;flex-direction:column";
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:115%;font-size:26px;letter-spacing:-.01em">
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#2a6fb0"></span>
        <span style="display:inline-block;width:14px;height:14px;border-radius:3px;background:#d4601a;margin-left:-10px"></span>
        War Balance</div>
      <div style="margin-top:18px;font-family:Archivo,sans-serif;font-weight:800;font-stretch:112%;font-size:54px;letter-spacing:-.02em;line-height:1">${d.name}</div>
      <div style="margin-top:12px;font-size:30px;font-weight:700;color:${col};line-height:1">${d.netVerb}</div>
      <div style="display:flex;align-items:baseline;gap:18px;margin-top:4px">
        <span style="font-family:Archivo,sans-serif;font-weight:800;font-size:88px;letter-spacing:-.03em;line-height:1;color:${col}">${d.pctU}</span>
        <span style="font-size:27px;font-weight:600;color:#15212b;line-height:1.15">of a year's GDP in total<br>since 2022 (about ${d.pctYU} a year)</span>
      </div>
      <div style="margin-top:10px;font-size:26px;font-weight:600;color:#15212b;line-height:1.25">${d.netRange[0].toUpperCase() + d.netRange.slice(1)}${d.netUnc && !d.party ? " · " + d.netDir : ""} · ${d.eurU}</div>
      ${d.party ? `<div style="margin-top:8px;font-size:21px;font-weight:700;color:#8a2f2f;line-height:1.25">Party to the war (with Russia): ${d.partyWhy}</div>` : ""}
      ${d.party ? "" : `<div style="margin-top:8px;font-size:21px;color:#15212b;line-height:1.25;border-left:5px solid #d4601a;padding-left:12px">${d.sum}. It adds two different things: help given to Ukraine and the change in what Russia kept from trade.${d.netWhat ? " " + d.netWhat[0].toUpperCase() + d.netWhat.slice(1) + "." : ""}</div>`}
      <div style="margin-top:12px;font-size:21px;color:#15212b;line-height:1.3"><b style="color:${!d.uaPos ? grey : d.uaUnc ? fadeB : "#2a6fb0"}">${d.uaV}</b> (${d.uaRange})${d.uaUnc && !d.party ? " · " + d.uaDir : ""}${d.refX ? ` · hosted Ukrainian refugees (${d.refX}), not counted as support: co-belligerent` : ""}</div>
      <div style="margin-top:6px;font-size:21px;color:#15212b;line-height:1.3"><b style="color:${d.ruUnc ? (d.ruLess ? fadeB : fadeO) : d.ruLess ? "#2a6fb0" : "#c9520f"}">${d.ruV}</b> (${d.ruRange}): ${d.ruWhat}${d.ruUnc && !d.party && d.ruDir ? " · " + d.ruDir : ""}</div>
      ${d.fz ? `<div style="margin-top:6px;font-size:21px;color:#15212b;line-height:1.3"><b style="color:#2a6fb0">${d.fzV}</b>: the return Russia lost on its reserves frozen here, in the net only</div>` : ""}
      <div style="margin-top:auto;font-size:16px;color:#55636e;line-height:1.35">2022 to August 2026 (about ${d.years} years) · figures to ${d.dataTo} · <b>Research preview</b>, compiled with AI assistance<br>${d.host}</div>
`;
  }, d);
  await page.waitForTimeout(30);
  const iso = d.iso3.toLowerCase();
  await page.screenshot({ path: join(SITE, "share", iso + ".png") });
}
// round 54 (findable pages): a page per country (country/<slug>/, with the old c/<iso>.html sent there), the ranking,
// the two lens pages, How it works and the method pages, the map in each language, sitemap.xml and robots.txt
// (seo_pages.mjs), from the same page, back on the map without the card
await page.evaluate(() => { const el = document.getElementById("card"); if (el) el.remove(); });
await writeSeoPages({ page, site: SITE, siteUrl: SITE_URL });
console.log(`wrote ${cards.length} share cards and share/world.png`);
await browser.close();
server.close();
