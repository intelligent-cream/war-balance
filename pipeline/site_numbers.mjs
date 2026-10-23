// The map's headline numbers for every country, computed with the map's own model (the "Model" section of
// site/index.html) on site/data.json and site/detail.json. Used by check_docs_numbers.py (figures quoted in the docs)
// and check_data.py (the ranking rule). Prints JSON to stdout.
//
// Run: node pipeline/site_numbers.mjs [year]   (default 2026)

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const html = readFileSync(join(SITE, "index.html"), "utf8");
const code = html.slice(html.indexOf("// ===== Model ====="), html.indexOf("function lensValue")).replace(/^let YEARS.*$/m, "").replace(/^let DATA.*$/m, "");
const D = JSON.parse(readFileSync(join(SITE, "data.json"), "utf8"));
const det = JSON.parse(readFileSync(join(SITE, "detail.json"), "utf8"));
const M = new Function("D", "t", `let YEARS = D.years, FRAC = D.frac, SRC = D.sources, META = D.meta; let DATA = {}, byIso = {}, INCLUDED = {};
  ${code}; return { calc, normalise, methodBands, uncertain, leaning, isNearZero, grades, worldPaid, PARTY_TO_WAR, setData: (d, b) => { DATA = d; byIso = b; ALTS_READY = true; } };`)(D, s => s);
const data = {}, by = {};
for (const [k, c] of Object.entries(D.countries)) { c.alts = det.alts[k] || {}; M.normalise(c); data[c.n] = c; by[k] = c; }
M.setData(data, by);
const Y = +(process.argv[2] || 2026);
const r4 = v => (v == null ? null : +v.toFixed(4));
const out = { year: Y, world: M.worldPaid(Y), countries: {} };
for (const [k, c] of Object.entries(by)) {
  if (!c.gdp) continue;
  const g = 100 / c.gdp, x = M.calc(c, Y), x25 = M.calc(c, 2025), mb = M.methodBands(c, Y);
  const head = { ua: [x.uaBal, x.uaLo, x.uaHi], rus: [x.rusBal, x.rusLo, x.rusHi], net: [x.shift, x.shiftLo, x.shiftHi] };
  const o = { gdp: c.gdp, gdp_2024: c.gdp_2024 ?? null, grades: M.grades(c, Y), party: M.PARTY_TO_WAR.has(k) };
  for (const [q, [v, lo, hi]] of Object.entries(head)) {
    // the ranking rule written out again, independently of uncertain(): the value, its likely range and every
    // method-band alternative must have the same sign
    const alts = mb.alts.map(a => a[q]);
    const sameSign = v !== 0 && [lo, hi, ...alts].every(z => z * v > 0);
    Object.assign(o, { [q]: r4(v * g), [q + "Lo"]: r4(lo * g), [q + "Hi"]: r4(hi * g), [q + "BandLo"]: r4(mb[q].lo * g), [q + "BandHi"]: r4(mb[q].hi * g),
      [q + "Eur"]: r4(v), [q + "Unc"]: M.uncertain(c, Y, q), [q + "SameSign"]: sameSign,
      // round 24b (owner): which way a number that is not certain leans ("ukraine", "russia", or null: uncertain direction)
      [q + "Lean"]: M.leaning(c, Y, q), [q + "Near"]: M.isNearZero(c, Y, q) });
  }
  Object.assign(o, { ua2025: r4(x25.uaBal * g), rus2025: r4(x25.rusBal * g), net2025: r4(x25.shift * g),
    refugees: r4(x.refugees), aidRef: r4((x.shiftParts.find(p => p.k === "ref") || { v: 0 }).v),
    // round 24 (audit B): the euro amounts the worked examples quote: what was given and earned back, each part (EUR
    // bn, with its likely range), the gas and oil Russia cut off itself
    uaGave: r4(x.uaGave), uaBackEur: r4(-x.uaBack), rusCut: r4(x.rusCut), frozenEur: r4(x.frozen),
    // round 24b (owner): business with Russia in two lines, paid Russia and earned from Russia (EUR bn); they add up to it
    rusPaidEur: r4(x.rusPaid), rusEarnedEur: r4(x.rusEarned) });
  for (const p of x.shiftParts.concat(x.backShift)) Object.assign(o, { ["part_" + p.k]: r4(p.v), ["part_" + p.k + "Lo"]: r4(p.lo), ["part_" + p.k + "Hi"]: r4(p.hi) });
  for (const a of mb.alts) o["alt_" + a.k] = { ua: r4(a.ua * g), rus: r4(a.rus * g), net: r4(a.net * g) };
  out.countries[k] = o;
}
// round 24 (audit B): counts the text quotes, worked out here so they cannot go stale: economies over EUR 5bn of GDP,
// how many of them are not certain on each number (round 24b: leaning or uncertain direction), the sources and their documents
const big = Object.values(out.countries).filter(o => o.gdp >= 5);
Object.assign(out.world, { nAll: Object.keys(out.countries).length, nBig: big.length,
  uncUa: big.filter(o => o.uaUnc).length, uncRus: big.filter(o => o.rusUnc).length, uncNet: big.filter(o => o.netUnc).length,
  // round 24b: of those, how many lean one way, and how many have an uncertain direction (a party to the war left out)
  leanNet: big.filter(o => o.netUnc && o.netLean).length, nearNet: big.filter(o => o.netUnc && o.netNear).length, dirUncNet: big.filter(o => o.netUnc && !o.netLean && !o.party).length,
  leanUa: big.filter(o => o.uaUnc && o.uaLean).length, leanRus: big.filter(o => o.rusUnc && o.rusLean).length,
  nSources: Object.keys(D.sources).length, nDocs: new Set(Object.values(D.sources).flatMap(s => (s.links || []).map(l => l.url))).size });
process.stdout.write(JSON.stringify(out));
