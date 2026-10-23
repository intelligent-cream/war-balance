// Round 16 (review 5, C2; approved by the owner): the map's numbers in a real browser must match the same model run in
// Node with every method-band alternative loaded (site_numbers.mjs). Review 5 found that the page worked out the
// "direction uncertain" marks, the rankings and the grades before detail.json (the alternatives) had loaded, and kept
// them. This check loads the page as a reader does, waits until it says it is ready, and compares, for every economy:
// the method band and the "direction uncertain" flag of each headline number, the countries marked uncertain on each map
// (round 17: a faded colour of the leaning direction, no longer dotted or grey; round 24b: "leaning toward ..." or "uncertain
// direction"), which way each of those leans, and the countries ranked in the Ranking view of each headline
// number.
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
    for (const q of ["ua", "rus", "net"]) Object.assign(o, { [q + "Unc"]: uncertain(c, 2026, q), [q + "Lean"]: leaning(c, 2026, q), [q + "BandLo"]: mb[q].lo * g, [q + "BandHi"]: mb[q].hi * g });
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
    if (o[q + "Lean"] !== n[q + "Lean"]) { nFlag++; problems.push(`${iso} ${q}: leaning in the page ${o[q + "Lean"]}, in Node ${n[q + "Lean"]}`); }
    for (const e of ["BandLo", "BandHi"]) {
      if (Math.abs(o[q + e] - n[q + e]) > 0.005) { nBand++; problems.push(`${iso} ${q}${e}: page ${o[q + e].toFixed(3)}, Node ${n[q + e].toFixed(3)}`); }
    }
    if (o.grades[q] !== n.grades[q]) { nGrade++; problems.push(`${iso} ${q} grade: page ${o.grades[q]}, Node ${n.grades[q]}`); }
  }
}

// 2. each headline view: the countries ranked in the Ranking view, and the countries marked uncertain on the map
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
  // round 24b (owner): a party to the war (Belarus) is never ranked
  const want = Object.entries(node.countries).filter(([, c]) => c.gdp >= MIN_GDP && !c[q + "Unc"] && !c.party && c[q] !== null).map(([k]) => k).sort();
  const have = got.rows.slice().sort();
  const extra = have.filter(k => !want.includes(k)), missing = want.filter(k => !have.includes(k));
  if (extra.length || missing.length) problems.push(`${lens} ranking: ranked in the page but not in Node ${extra.join(" ") || "none"}; missing ${missing.join(" ") || "none"}`);
  const wrongDots = got.dotted.filter(k => !node.countries[k]?.[q + "Unc"]);
  if (wrongDots.length) problems.push(`${lens} map: marked uncertain (faded) although Node says the direction is clear: ${wrongDots.join(" ")}`);
  ranked[lens] = have.length;
}
// 3. round 16b (check 16, B2): small economies with a clear direction take the lightest colour of that direction, never
// the neutral "no change" colour (the clamp used to send negatives to the neutral bucket). Round 17 (approved by the
// owner): one colour rule. A small economy whose direction is uncertain was the neutral grey until round 17; the owner
// then asked for uncertain countries to show the faded colour of their leaning direction (its clamped colour mixed halfway
// toward the neutral grey, scaleFor().fadedFor; round 21: a pale tint of the same hue), so the check expects that faded
// lean colour, never the neutral grey and never the full colour
const SMALL = ["TUV", "PLW", "BTN", "DJI"];
let nSmall = 0, nFaded = 0;
for (const lens of ["net", "payments"]) {
  await ready(`#lens=${lens}`);
  const got = await page.evaluate(small => {
    const sc = scaleFor(), out = [];
    for (const iso of small) {
      const c = byIso[iso];
      if (!c) { out.push({ iso, missing: true }); continue; }
      const v = scaled(c, lensValue(c));
      const paths = [...document.querySelectorAll("path.country")].filter(p => p.__data__ && (DATA[p.__data__.id] || DATA[INCLUDED[p.__data__.id]]) === c);
      out.push({ iso, v, color: sc.colorFor(c, v), faded: sc.fadedFor(c, v), fills: paths.map(p => p.style.fill), neutral: sc.neutral, want: v > 0 ? sc.lightest.pos : sc.lightest.neg, unc: uncertain(c, 2026, HEAD_LENS[state.lens]) });
    }
    return out;
  }, SMALL);
  const norm = x => (x || "").replace(/\s/g, "").toLowerCase();
  const rgb = h => (h.startsWith("#") ? `rgb(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)})` : h);
  for (const o of got) {
    nSmall++;
    if (o.unc) nFaded++;
    if (o.missing) { problems.push(`${lens} map: ${o.iso} missing from the data`); continue; }
    if (o.color === o.neutral || o.color !== o.want) problems.push(`${lens} map: ${o.iso} (${o.v.toFixed(2)}) coloured ${o.color}, want ${o.want}`);
    const is = (f, h) => norm(f) === norm(rgb(h)) || norm(f) === norm(h);
    if (o.unc && (is(o.faded, o.neutral) || is(o.faded, o.want))) problems.push(`${lens} map: ${o.iso} faded colour ${o.faded} is not apart from the neutral and the full colour`);
    for (const f of o.fills) {
      if (o.unc && !is(f, o.faded)) problems.push(`${lens} map: ${o.iso}'s direction is not certain but it is painted ${f}, not the faded lean colour ${o.faded}`);
      if (!o.unc && !is(f, o.want)) problems.push(`${lens} map: ${o.iso} has a clear direction but is painted ${f}, not ${o.want}`);
      if (is(f, o.neutral)) problems.push(`${lens} map: ${o.iso} painted in the neutral colour`);
    }
  }
}

// 4. round 25 (owner, 22 October 2026): "What makes up the number" with no + or − signs in its rows (round 28: each row
// signed against its section's headline); round 26: one
// section per tile, each subtotal equal to its tile, together making the net in every country; every country gets its story tags, Belarus its
// "Party to the war" tag first
await ready("");
const r25 = await page.evaluate(() => {
  const bad = [], noTags = [];
  for (const c of Object.values(DATA)) {
    if (!c.gdp) continue;
    const k = calc(c, 2026), S = partSections(c, k);
    // round 26 (owner): one section per tile, its subtotal the tile's own number; the sections make the net
    for (const x of S) if (Math.abs(x.total - x.tile) > 1e-6 + 1e-6 * Math.abs(x.tile)) bad.push(`${c.iso3} ${x.q} ${x.total.toFixed(4)} vs tile ${x.tile.toFixed(4)}`);
    const sumS = S.reduce((a, x) => a + x.total, 0);
    if (Math.abs(sumS - k.shift) > 1e-6 + 1e-6 * Math.abs(k.shift)) bad.push(`${c.iso3} sections ${sumS.toFixed(4)} vs net ${k.shift.toFixed(4)}`);
    if (!storyTags(c, k, 2026).length && Math.abs(k.shift) >= 0.001 * c.gdp) noTags.push(c.iso3);
  }
  const blr = byIso.BLR ? storyTags(byIso.BLR, calc(byIso.BLR, 2026), 2026).map(f => f.key) : [];
  const signs = [];
  for (const iso of ["DEU", "HUN", "BLR", "CZE", "MNG", "TUR", "PRK", "POL", "IND", "USA"]) {
    const c = byIso[iso];
    if (!c) continue;
    select(c.n, false);
    // the section heads carry no sign; round 28 (owner): each row carries + when it adds to its section's headline and
    // − when it takes away from it, like a balance sheet
    const heads = [...document.querySelectorAll("#panel .psec-h")].map(e => e.textContent).join(" | ");
    if (/[+\u2212]\s*[€\d]|(^|\s)-\s*[€\d]/.test(heads)) signs.push(`${iso} head: ${heads.slice(0, 120)}`);
    const k2 = calc(c, 2026), S2 = partSections(c, k2);
    document.querySelectorAll("#panel .psec").forEach((el, i) => {
      const sec = S2.filter(x => x.parts.length || Math.abs(x.tile) >= 0.0005)[i];
      if (!sec) return;
      const ss = sec.tile < 0 ? -1 : 1;
      el.querySelectorAll("details.part").forEach(d => {
        const p = sec.parts.find(q => q.k === d.dataset.part), pv = d.querySelector(".pv");
        if (!p || !pv) return;
        const want = (p.v >= 0 ? 1 : -1) === ss ? "+" : "\u2212";
        if (pv.textContent.trim()[0] !== want) signs.push(`${iso} ${p.k}: "${pv.textContent.trim().slice(0, 20)}" should start with ${want}`);
      });
    });
    if (!document.querySelector("#panel .psec")) signs.push(`${iso}: no sections`);
  }
  return { bad, noTags, blr, signs };
});
if (r25.bad.length) problems.push(`parts sections do not match the tiles or the net: ${r25.bad.slice(0, 5).join("; ")}`);
if (r25.blr[0] !== "party") problems.push(`Belarus's first tag is not "party": ${r25.blr.join(", ")}`);
if (r25.signs.length) problems.push(`wrong signs in the parts sections: ${r25.signs.slice(0, 3).join(" || ")}`);

if (errors.length) problems.push("page errors: " + errors.slice(0, 3).join(" | "));
await browser.close();
server.close();

const unc = q => Object.values(node.countries).filter(c => c.gdp >= MIN_GDP && c[q + "Unc"]).length;
console.log(`parts sections match the tiles and make the net everywhere; Belarus tags ${r25.blr.slice(0, 3).join(", ")}; ${r25.noTags.length} countries with a material net and no tag`);
console.log(`browser check: ${Object.keys(inPage).length} economies; ranked net ${ranked.net}, support ${ranked.support}, payments ${ranked.payments}; direction uncertain (GDP >= EUR 5bn) ua ${unc("ua")}, rus ${unc("rus")}, net ${unc("net")}; small economies' colours: ${nSmall} checked (${nFaded} faded)`);
if (problems.length) {
  console.log(`MISMATCH: ${problems.length} (bands ${nBand}, flags ${nFlag}, grades ${nGrade})`);
  for (const p of problems.slice(0, 25)) console.log("  " + p);
  process.exit(1);
}
console.log("browser and Node agree");
