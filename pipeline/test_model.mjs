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
  ${code}; return { calc, normalise, methodBands, withAlt, uncertain, leanInfo, isNearZero, pSignMC, chance, evidence, partGrade, LEAN, CHANCE, PARTY_TO_WAR, setData: (d, b) => { DATA = d; byIso = b; ALTS_READY = true; } };`)(D, s => s);
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

// round 42 (certainty audit): the chance is the more likely direction's, whichever sign the middle value has; a certain
// number has at least a 95% chance on the side of its middle value, and every method choice agrees
test("certain means a 95% chance on the middle value's side and every method choice agreeing", () => {
  for (const c of all) {
    for (const q of ["net", "ua", "rus"]) {
      const ch = M.chance(c, Y, q), v = { net: "shift", ua: "uaBal", rus: "rusBal" }[q], val = M.calc(c, Y)[v];
      assert.ok(ch.p >= 0.5 && ch.p <= 1 && Math.abs(ch.p - Math.max(ch.pUa, 1 - ch.pUa)) < 1e-12, `${c.iso3} ${q}`);
      if (M.uncertain(c, Y, q)) continue;
      assert.ok(ch.p >= M.CHANCE.sure, `${c.iso3} ${q}: certain at ${ch.p}`);
      assert.equal(ch.side, val > 0 ? "ukraine" : "russia", `${c.iso3} ${q}: side`);
      assert.ok(M.methodBands(c, Y).alts.every(a => a[q] * val > 0), `${c.iso3} ${q}: a method choice disagrees`);
    }
  }
});

test("the aid and flowback errors offset: a positive and a negative part that grow together narrow the total", () => {
  // the same two parts, the chance of the total's sign is higher when their sizes correlate (+0.5 in RHO for aid|own)
  const correlated = M.pSignMC([{ k: "aid", v: 2, lo: 1, hi: 3 }, { k: "own", v: -1.5, lo: -2.25, hi: -0.75 }], 1);
  const independent = M.pSignMC([{ k: "x1", v: 2, lo: 1, hi: 3 }, { k: "x2", v: -1.5, lo: -2.25, hi: -0.75 }], 1);
  assert.ok(correlated > independent, `${correlated} vs ${independent}`);
});

test("a part's letter never claims more than its sources: A two official statistics, B one, press or own estimates D", () => {
  const ORDER = ["A", "B", "C", "D"];
  for (const c of all) {
    for (const p of M.calc(c, Y).signParts.net) {
      const ev = M.evidence(p), g = M.partGrade(p);
      assert.ok(ORDER.indexOf(g) >= ORDER.indexOf(ev.letter) && ORDER.indexOf(g) >= ORDER.indexOf(p.cert || "A"), `${c.iso3} ${p.k}: ${g} vs ${ev.letter}/${p.cert}`);
      if (g === "A") assert.ok(ev.off >= 2, `${c.iso3} ${p.k}`);
      if (ev.kind === "press" || ev.kind === "own") assert.equal(g, "D", `${c.iso3} ${p.k}`);
    }
  }
});

// round 46 (owner: "start on 3"): rules the project replaced, the early-2021 gas path (carried by the likely range) and
// "without the war-time windfall" (a view of behaviour only) never veto a certain direction or widen the method band
const NOT_A_VETO = ["refiner", "laund_route", "fuelmix", "freight", "laund_model", "gas_early2021"];
test("retired, simulated and view-only alternatives never veto", () => {
  let bites = 0;
  for (const c of all) {
    const mb = M.methodBands(c, Y), keys = new Set(mb.alts.map(a => a.k));
    for (const k of [...NOT_A_VETO, "windfall_off", "windfall_full"]) assert.ok(!keys.has(k), `${c.iso3}: ${k} is in the method band`);
    assert.ok(mb.views.some(a => a.k === "windfall_off"), `${c.iso3}: no windfall-off view`);
    if (!c.gdp || c.gdp < 5) continue;
    const others = [M.calc(c, Y, { windfall: "off" }), ...NOT_A_VETO.filter(n => c.alts[n]).map(n => M.calc(M.withAlt(c, n), Y))];
    for (const q of ["net", "rus"]) {
      const f = { net: "shift", rus: "rusBal" }[q], v = M.calc(c, Y)[f], ch = M.chance(c, Y, q);
      // a number the main rule makes certain stays certain when only these alternatives have the other sign
      // (round 60: and the likely range stays on that side)
      const k0 = M.calc(c, Y), [lo, hi] = q === "net" ? [k0.shiftLo, k0.shiftHi] : [k0.rusLo, k0.rusHi];
      const sure = v && ch.p >= M.CHANCE.sure && ch.side === (v > 0 ? "ukraine" : "russia") && mb.alts.every(a => a[q] * v > 0) && lo * v > 0 && hi * v > 0;
      if (!sure) continue;
      assert.ok(!M.uncertain(c, Y, q), `${c.iso3} ${q}: not certain`);
      if (others.some(k => k[f] * v <= 0)) bites++;
      for (const a of mb.alts) assert.ok(a[q] <= mb[q].hi + EPS && a[q] >= mb[q].lo - EPS);
      for (const a of mb.views) if (a[q] > mb[q].hi + EPS || a[q] < mb[q].lo - EPS) bites++;
    }
  }
  assert.ok(bites > 0, "no certain number has a retired or view-only alternative on the other side or outside the band: the test does not bite");
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

// round 60 (audit: Togo's net and its trade, the same number, read 51% and 52%): a part takes the same draws in every
// simulation, by its key, so a number made of the same parts gets the same chance, whatever else is in its list
test("the same parts get the same draws: net and trade agree where they are the same number", () => {
  const parts = [{ k: "paid", v: 0.018, lo: -0.053, hi: 0.323 }, { k: "windfall", v: -0.018, lo: -0.041, hi: 0.016 }, { k: "laund", v: -0.041, lo: -0.23, hi: 0.126 }];
  const withTiny = [{ k: "aid", v: 0, lo: 0, hi: 1e-9 }, ...parts, { k: "buy", v: 0, lo: 0, hi: 1e-9 }];
  assert.equal(M.pSignMC(withTiny, 1), M.pSignMC(parts, 1));
  assert.equal(M.pSignMC(parts.slice().reverse(), 1), M.pSignMC(parts, 1));
  for (const c of all) {
    const k = M.calc(c, Y), key = l => l.filter(p => Math.abs(p.v) > 1e-6 || p.hi - p.lo > 1e-6).map(p => p.k).sort().join();
    if (k.uaBal || k.frozen || key(k.signParts.net) !== key(k.signParts.rus)) continue;
    assert.ok(Math.abs(M.chance(c, Y, "net").pUa - M.chance(c, Y, "rus").pUa) < 1e-9, c.iso3);
  }
});

// round 60 (audit: the UAE "very likely toward Russia, 97%" with a likely range reaching +€1.1bn): the range adds the
// parts' distances as errors, the simulation draws each skewed part whole, so they can disagree; very likely needs both
test("very likely only when the likely range stays on the same side", () => {
  let bites = 0;
  for (const c of all) for (const q of ["net", "ua", "rus"]) {
    const k = M.calc(c, Y), [lo, hi] = { ua: [k.uaLo, k.uaHi], rus: [k.rusLo, k.rusHi], net: [k.shiftLo, k.shiftHi] }[q];
    if (!M.uncertain(c, Y, q)) assert.ok(lo * hi > 0, `${c.iso3} ${q}: certain with a range from ${lo} to ${hi}`);
    else if (lo * hi <= 0 && M.chance(c, Y, q).p >= M.CHANCE.sure) bites++;
  }
  assert.ok(bites > 0, "no number has a 95% chance and a range across zero: the test does not bite");
});
