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
  ${code}; return { calc, normalise, methodBands, uncertain, grades, worldPaid, setData: (d, b) => { DATA = d; byIso = b; } };`)(D, s => s);
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
  const o = { gdp: c.gdp, gdp_2024: c.gdp_2024 ?? null, grades: M.grades(c, Y) };
  for (const [q, [v, lo, hi]] of Object.entries(head)) {
    // the ranking rule written out again, independently of uncertain(): the value, its likely range and every
    // method-band alternative must have the same sign
    const alts = mb.alts.map(a => a[q]);
    const sameSign = v !== 0 && [lo, hi, ...alts].every(z => z * v > 0);
    Object.assign(o, { [q]: r4(v * g), [q + "Lo"]: r4(lo * g), [q + "Hi"]: r4(hi * g), [q + "BandLo"]: r4(mb[q].lo * g), [q + "BandHi"]: r4(mb[q].hi * g),
      [q + "Eur"]: r4(v), [q + "Unc"]: M.uncertain(c, Y, q), [q + "SameSign"]: sameSign });
  }
  Object.assign(o, { ua2025: r4(x25.uaBal * g), rus2025: r4(x25.rusBal * g), net2025: r4(x25.shift * g),
    refugees: r4(x.refugees), aidRef: r4((x.shiftParts.find(p => p.k === "ref") || { v: 0 }).v) });
  for (const a of mb.alts) o["alt_" + a.k] = { ua: r4(a.ua * g), rus: r4(a.rus * g), net: r4(a.net * g) };
  out.countries[k] = o;
}
process.stdout.write(JSON.stringify(out));
