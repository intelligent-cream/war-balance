// Round 41 (review: "the whole model runs in the browser and has zero direct tests"): tests of the map's own model,
// the "Model" section of site/index.html, run directly in Node on site/data.json and site/detail.json. Three kinds:
//   - invariants that must hold for every country (the parts add up, the ranges hold their middle value, ...);
//   - the sign simulation and the leaning rule on cases with a known answer;
//   - a snapshot of a dozen countries' headline numbers (pipeline/model_snapshot.json), so a refactoring that changes a
//     number fails here. After a deliberate data or method change, refresh it: node pipeline/test_model.mjs --update
//
// Run: node --test pipeline/test_model.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url)), SITE = join(HERE, "..", "site");
const html = readFileSync(join(SITE, "index.html"), "utf8");
const code = html.slice(html.indexOf("// ===== Model ====="), html.indexOf("function lensValue")).replace(/^let YEARS.*$/m, "").replace(/^let DATA.*$/m, "");
const D = JSON.parse(readFileSync(join(SITE, "data.json"), "utf8"));
const det = JSON.parse(readFileSync(join(SITE, "detail.json"), "utf8"));
const M = new Function("D", "t", `let YEARS = D.years, FRAC = D.frac, SRC = D.sources, META = D.meta; let DATA = {}, byIso = {}, INCLUDED = {};
  ${code}; return { calc, normalise, methodBands, uncertain, leanInfo, isNearZero, pSignMC, LEAN, PARTY_TO_WAR, setData: (d, b) => { DATA = d; byIso = b; ALTS_READY = true; } };`)(D, s => s);
const data = {}, by = {};
for (const [k, c] of Object.entries(D.countries)) { c.alts = det.alts[k] || {}; M.normalise(c); data[c.n] = c; by[k] = c; }
M.setData(data, by);

const Y = 2026, EPS = 1e-9;
const SNAP = join(HERE, "model_snapshot.json");
const SNAP_ISO = ["DEU", "POL", "USA", "GBR", "FRA", "HUN", "CHN", "IND", "TUR", "BEL", "LUX", "KAZ", "NPL", "TCD"];
const r4 = v => +v.toFixed(4);
const snapshot = () => Object.fromEntries(SNAP_ISO.filter(i => by[i]).map(i => {
  const k = M.calc(by[i], Y);
  return [i, { net: r4(k.shift), netLo: r4(k.shiftLo), netHi: r4(k.shiftHi), ua: r4(k.uaBal), rus: r4(k.rusBal), frozen: r4(k.frozen), noData: !!k.noData, mostlyNoData: !!k.mostlyNoData }];
}));

if (process.argv.includes("--update")) {
  writeFileSync(SNAP, JSON.stringify(snapshot(), null, 1) + "\n");
  console.log("wrote", SNAP);
  process.exit(0);
}

const all = Object.values(by).filter(c => c.gdp);

test("the net is support for Ukraine plus the change in Russia's earnings plus Russian money frozen", () => {
  for (const c of all) {
    const k = M.calc(c, Y);
    assert.ok(Math.abs(k.shift - (k.uaBal + k.rusBal + k.frozen)) < 1e-6, `${c.iso3}: ${k.shift} vs ${k.uaBal} + ${k.rusBal} + ${k.frozen}`);
  }
});

test("the parts add up to the net", () => {
  for (const c of all) {
    const k = M.calc(c, Y), sum = k.signParts.net.reduce((a, p) => a + p.v, 0);
    assert.ok(Math.abs(sum - k.shift) < 1e-6, `${c.iso3}: parts ${sum} vs net ${k.shift}`);
  }
});

test("every likely range holds its middle value", () => {
  for (const c of all) {
    const k = M.calc(c, Y);
    for (const [v, lo, hi, q] of [[k.shift, k.shiftLo, k.shiftHi, "net"], [k.uaBal, k.uaLo, k.uaHi, "ua"], [k.rusBal, k.rusLo, k.rusHi, "rus"]])
      assert.ok(lo <= v + EPS && v <= hi + EPS, `${c.iso3} ${q}: ${lo} <= ${v} <= ${hi}`);
  }
});

test("2021 is the comparison year: every number is zero", () => {
  for (const c of all) {
    const k = M.calc(c, 2021);
    assert.ok(Math.abs(k.shift) < 1e-9 && Math.abs(k.uaBal) < 1e-9 && Math.abs(k.rusBal) < 1e-9, c.iso3);
  }
});

test("no data means no parts; mostly no data means its main trade with Russia has no record of its own", () => {
  for (const c of all) {
    const k = M.calc(c, Y);
    if (k.noData) assert.equal(k.signParts.net.length, 0, c.iso3);
    if (k.mostlyNoData) assert.ok(c.no_data.includes("paid") && c.no_data.includes("sold"), c.iso3);
    assert.ok(!(k.noData && k.mostlyNoData), c.iso3);
  }
});

test("the sign simulation matches a known answer and repeats exactly", () => {
  // one part, a symmetric range 1 ± 2 (5th to 95th percentile): P(> 0) = Φ(1.645 / 2) = 0.7946
  const parts = [{ k: "x", v: 1, lo: -1, hi: 3 }];
  const p = M.pSignMC(parts, 1);
  assert.ok(Math.abs(p - 0.7946) < 0.015, `P = ${p}`);
  assert.equal(M.pSignMC(parts, 1), p, "same seed, same answer");
  // two independent parts that cancel: about one half
  const q = M.pSignMC([{ k: "a", v: 1, lo: 0, hi: 2 }, { k: "b", v: -1, lo: -2, hi: 0 }], 1e-9);
  assert.ok(Math.abs(q - 0.5) < 0.02, `P = ${q}`);
  // a part far from zero: nearly certain
  assert.ok(M.pSignMC([{ k: "x", v: 10, lo: 9, hi: 11 }], 10) > 0.999);
});

test("leaning: a side only at a 65% chance or more, never for a certain number", () => {
  for (const c of all) {
    for (const q of ["net", "ua", "rus"]) {
      const li = M.leanInfo(c, Y, q);
      if (!li) continue;
      assert.ok(M.uncertain(c, Y, q), `${c.iso3} ${q}: lean info for a certain number`);
      assert.equal(!!li.side, li.p >= M.LEAN.p, `${c.iso3} ${q}: side ${li.side} at p ${li.p}`);
    }
  }
});

test("near zero only for numbers that are not certain", () => {
  for (const c of all) if (M.isNearZero(c, Y, "net")) assert.ok(M.uncertain(c, Y, "net"), c.iso3);
});

test("the headline numbers of a dozen countries match the snapshot", () => {
  const want = JSON.parse(readFileSync(SNAP, "utf8")), got = snapshot();
  for (const [iso, w] of Object.entries(want)) {
    for (const [f, v] of Object.entries(w)) {
      if (typeof v === "number") assert.ok(Math.abs(got[iso][f] - v) <= 0.00015, `${iso}.${f}: ${got[iso][f]} vs snapshot ${v} (refresh with --update after a deliberate change)`);
      else assert.equal(got[iso][f], v, `${iso}.${f}`);
    }
  }
});
