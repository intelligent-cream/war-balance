// Round 16 (review 5, C2; approved by the owner): the map's numbers in a real browser must match the same model run in
// Node with every method-band alternative loaded (site_numbers.mjs). Review 5 found that the page worked out the
// "direction uncertain" marks, the rankings and the grades before detail.json (the alternatives) had loaded, and kept
// them. This check loads the page as a reader does, waits until it says it is ready, and compares, for every economy:
// the method band and the "direction uncertain" flag of each headline number, the dotted countries on each map, and
// the countries ranked in the Ranking view of each headline number.
//
// Run after build_data.py:  node pipeline/browser_check.mjs      (check_data.py runs it too, check 32)
// Needs Node 18+ and Playwright (npm i -g playwright, or PLAYWRIGHT_CHROMIUM=/path/to/chromium). Exit code 1 on a mismatch.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = process.env.SITE_DIR || join(HERE, "..", "site");   // SITE_DIR: check another copy of the site
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css" };
const MIN_GDP = 5;

// the Node computation, with the alternatives loaded
const node = JSON.parse(execFileSync(process.execPath, [join(HERE, "site_numbers.mjs")], { maxBuffer: 1 << 28 }).toString());

const server = createServer(async (req, res) => {
  try {
    const path = join(SITE, decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html"));
    const body = await readFile(path);
    // detail.json is served last, as on a slow line, so a page that draws before it arrives is caught
    if (path.endsWith("detail.json")) await new Promise(r => setTimeout(r, 1500));
    res.writeHead(200, { "content-type": TYPES[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}/`;
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {});
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
const errors = [];
page.on("pageerror", e => errors.push(String(e)));
const problems = [];
const ready = async hash => {
  await page.goto(base + "index.html" + hash);
  // the page marks itself ready after its first render; the old page drew the map first and loaded detail.json after
  await page.waitForFunction(() => document.body.dataset.ready === "true" || (typeof byIso !== "undefined" && Object.values(byIso).some(c => c.alts)), null, { timeout: 60000 });
  await page.waitForTimeout(400);
};

await ready("");
// 1. bands and flags as the page holds them (cached values included: that is what the reader sees)
const inPage = await page.evaluate(() => {
  const out = {};
  for (const c of Object.values(byIso)) {
    if (!c.gdp) continue;
    const mb = methodBands(c, 2026), g = 100 / c.gdp, o = { gdp: c.gdp };
    for (const q of ["ua", "rus", "net"]) Object.assign(o, { [q + "Unc"]: uncertain(c, 2026, q), [q + "BandLo"]: mb[q].lo * g, [q + "BandHi"]: mb[q].hi * g });
    o.grades = grades(c, 2026);
    out[c.iso3] = o;
  }
  return out;
});
let nBand = 0, nFlag = 0, nGrade = 0;
for (const [iso, o] of Object.entries(inPage)) {
  const n = node.countries[iso];
  if (!n) continue;
  for (const q of ["ua", "rus", "net"]) {
    if (o[q + "Unc"] !== n[q + "Unc"]) { nFlag++; problems.push(`${iso} ${q}: direction uncertain in the page ${o[q + "Unc"]}, in Node ${n[q + "Unc"]}`); }
    for (const e of ["BandLo", "BandHi"]) {
      if (Math.abs(o[q + e] - n[q + e]) > 0.005) { nBand++; problems.push(`${iso} ${q}${e}: page ${o[q + e].toFixed(3)}, Node ${n[q + e].toFixed(3)}`); }
    }
    if (o.grades[q] !== n.grades[q]) { nGrade++; problems.push(`${iso} ${q} grade: page ${o.grades[q]}, Node ${n.grades[q]}`); }
  }
}

// 2. each headline view: the countries ranked in the Ranking view, and the countries dotted on the map
const LENS = { net: "net", support: "ua", payments: "rus" };
const ranked = {};
for (const [lens, q] of Object.entries(LENS)) {
  await ready(`#view=rank&lens=${lens}`);
  const got = await page.evaluate(() => {
    const isoOf = n => DATA[n].iso3;
    return {
      rows: [...document.querySelectorAll("#view g.row[data-n]")].map(g => isoOf(g.dataset.n)),
      dotted: [...document.querySelectorAll("path.country.uncertain")].map(p => p.__data__ && DATA[p.__data__.id]).filter(Boolean).map(c => c.iso3),
    };
  });
  const want = Object.entries(node.countries).filter(([, c]) => c.gdp >= MIN_GDP && !c[q + "Unc"] && c[q] !== null).map(([k]) => k).sort();
  const have = got.rows.slice().sort();
  const extra = have.filter(k => !want.includes(k)), missing = want.filter(k => !have.includes(k));
  if (extra.length || missing.length) problems.push(`${lens} ranking: ranked in the page but not in Node ${extra.join(" ") || "none"}; missing ${missing.join(" ") || "none"}`);
  const wrongDots = got.dotted.filter(k => !node.countries[k]?.[q + "Unc"]);
  if (wrongDots.length) problems.push(`${lens} map: dotted although Node says the direction is clear: ${wrongDots.join(" ")}`);
  ranked[lens] = have.length;
}
// 3. round 16b (check 16, B2): small economies with a clear direction take the lightest colour of that direction, never
// the neutral "no change" colour (the clamp used to send negatives to the neutral bucket)
const SMALL = ["TUV", "PLW", "BTN", "DJI"];
let nSmall = 0;
for (const lens of ["net", "payments"]) {
  await ready(`#lens=${lens}`);
  const got = await page.evaluate(small => {
    const sc = scaleFor(), out = [];
    for (const iso of small) {
      const c = byIso[iso];
      if (!c) { out.push({ iso, missing: true }); continue; }
      const v = scaled(c, lensValue(c));
      const paths = [...document.querySelectorAll("path.country")].filter(p => p.__data__ && (DATA[p.__data__.id] || DATA[INCLUDED[p.__data__.id]]) === c);
      out.push({ iso, v, color: sc.colorFor(c, v), fills: paths.map(p => p.style.fill), neutral: sc.colors[4], want: sc.colors[v > 0 ? 5 : 3] });
    }
    return out;
  }, SMALL);
  const norm = x => (x || "").replace(/\s/g, "").toLowerCase();
  const rgb = h => `rgb(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)})`;
  for (const o of got) {
    nSmall++;
    if (o.missing) { problems.push(`${lens} map: ${o.iso} missing from the data`); continue; }
    if (o.color === o.neutral || o.color !== o.want) problems.push(`${lens} map: ${o.iso} (${o.v.toFixed(2)}) coloured ${o.color}, want ${o.want}`);
    for (const f of o.fills) if (norm(f) === norm(rgb(o.neutral)) || norm(f) === norm(o.neutral)) problems.push(`${lens} map: ${o.iso} painted in the neutral colour`);
  }
}

if (errors.length) problems.push("page errors: " + errors.slice(0, 3).join(" | "));
await browser.close();
server.close();

const unc = q => Object.values(node.countries).filter(c => c.gdp >= MIN_GDP && c[q + "Unc"]).length;
console.log(`browser check: ${Object.keys(inPage).length} economies; ranked net ${ranked.net}, support ${ranked.support}, payments ${ranked.payments}; direction uncertain (GDP >= EUR 5bn) ua ${unc("ua")}, rus ${unc("rus")}, net ${unc("net")}; small economies not neutral: ${nSmall} checked`);
if (problems.length) {
  console.log(`MISMATCH: ${problems.length} (bands ${nBand}, flags ${nFlag}, grades ${nGrade})`);
  for (const p of problems.slice(0, 25)) console.log("  " + p);
  process.exit(1);
}
console.log("browser and Node agree");
