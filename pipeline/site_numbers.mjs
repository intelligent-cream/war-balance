// The map's headline numbers for every country, computed with the map's own model (the "Model" section of
// site/index.html) on site/data.json and site/detail.json. Used by check_docs_numbers.py (figures quoted in the docs)
// and check_data.py (the ranking rule). Prints JSON to stdout.
//
// Run: node pipeline/site_numbers.mjs [year]   (default 2026)

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const html = readFileSync(join(SITE, "app.js"), "utf8");   // round 64: the map's code, moved out of index.html
const code = html.slice(html.indexOf("// ===== Model ====="), html.indexOf("function lensValue")).replace(/^let YEARS.*$/m, "").replace(/^let DATA.*$/m, "");
const D = JSON.parse(readFileSync(join(SITE, "data.json"), "utf8"));
const det = JSON.parse(readFileSync(join(SITE, "detail.json"), "utf8"));
const M = new Function("D", "t", `let YEARS = D.years, FRAC = D.frac, SRC = D.sources, META = D.meta; let DATA = {}, byIso = {}, INCLUDED = {};
  ${code}; return { calc, normalise, methodBands, uncertain, leaning, isNearZero, grades, worldPaid, pSignMC, chance, PARTY_TO_WAR, countrySlug, setData: (d, b) => { DATA = d; byIso = b; ALTS_READY = true; } };`)(D, s => s);
const data = {}, by = {};
for (const [k, c] of Object.entries(D.countries)) { c.alts = det.alts[k] || {}; M.normalise(c); data[c.n] = c; by[k] = c; }
M.setData(data, by);
// round 60 (owner): "Russia's earnings from trade" split in two, per country and year. rusGain: what Russia itself kept
// more or less (fuel and goods it sold, the war-time windfall, oil via other countries, services it sold, taxes it
// collected, profits of Russian-owned firms, its arms, state projects, gold and hidden payments, weapons given to it);
// ownGain: what the country itself earned from Russia (its sales to Russia and the sanctions premium on them, services,
// shipping, payment agents, its firms' profits and stakes in Russia, weapons it was paid for). The same two lines as
// calc()'s rusPaid and rusEarned (LINE_EARNED in site/index.html), so rusGain + ownGain = Russia's earnings from trade;
// the ranges are each line's own and do not add up. Both stay in the total. Sign as on the map: + toward Ukraine.
// Run: node pipeline/site_numbers.mjs --gain-split out.json  (build_data.py writes the result into data.json)
if (process.argv[2] === "--gain-split") {
  const r5 = v => +(+v).toFixed(5), yrs = D.years.filter(y => y >= 2022);
  const res = {};
  for (const [k, c] of Object.entries(by)) {
    if (!c.gdp) continue;
    const cum = yrs.map(y => M.calc(c, y));
    const line = (v, lo, hi) => {
      const tot = cum.map(x => [r5(x[v]), r5(x[lo]), r5(x[hi])]);
      return { years: [0].concat(tot.map((t, i) => r5(t[0] - (i ? tot[i - 1][0] : 0)))), cum: [null].concat(tot) };
    };
    res[k] = { rusGain: line("rusPaid", "rusPaidLo", "rusPaidHi"), ownGain: line("rusEarned", "rusEarnedLo", "rusEarnedHi") };
  }
  writeFileSync(process.argv[3], JSON.stringify(res));
  process.exit(0);
}
const Y = +(process.argv[2] || 2026);
// round 46 (owner: "start on 3"): the choices that never veto a certain direction, written out here as the rule says
// (site/content/method/ranges.md, "The method band"): rules the project replaced (round 44, and round 46: the windfall at
// 100%), the early-2021 gas path, which the likely range carries, and "without the war-time windfall", a view only
const NOT_A_VETO = new Set(["refiner", "laund_route", "fuelmix", "freight", "laund_model", "windfall_full", "gas_early2021", "windfall_off"]);
const r4 = v => (v == null ? null : +v.toFixed(4));
const wp = M.worldPaid(Y);
// round 46: the redirected-trade ratios by commodity group (oil, gas, coal, other goods), as single figures for the docs
const out = { year: Y, world: { ...wp, ...Object.fromEntries(["oil", "gas", "coal", "other"].flatMap((g, i) => [["ratio_" + g, r4(wp.ratioG[i])], ["ratioMore_" + g, r4(wp.ratioMoreG[i])]])) }, countries: {} };
for (const [k, c] of Object.entries(by)) {
  if (!c.gdp) continue;
  const g = 100 / c.gdp, x = M.calc(c, Y), x25 = M.calc(c, 2025), mb = M.methodBands(c, Y);
  const head = { ua: [x.uaBal, x.uaLo, x.uaHi], rus: [x.rusBal, x.rusLo, x.rusHi], net: [x.shift, x.shiftLo, x.shiftHi] };
  const o = { slug: M.countrySlug(c), gdp: c.gdp, gdp_2024: c.gdp_2024 ?? null, grades: M.grades(c, Y), party: M.PARTY_TO_WAR.has(k),
    // round 41: no data, or mostly no data (only small rough estimates): drawn hatched and not ranked
    noData: !!(x.noData || x.mostlyNoData),
    // round 63: no data of its own at all (not "mostly no data"): its page is noindex and out of the sitemaps
    noOwnData: !!x.noData && !x.mostlyNoData };
  for (const [q, [v, lo, hi]] of Object.entries(head)) {
    // the ranking rule written out again, independently of uncertain(): round 42 (owner: "decide 'certain' with the
    // simulation alone"): the simulation over the parts gives the value's own sign at least a 95% chance, and every
    // method-band alternative has that sign. Here always the full simulation, without the page's shortcut for numbers
    // far from zero
    const alts = mb.alts.filter(a => !NOT_A_VETO.has(a.k)).map(a => a[q]);
    const pOwn = v ? M.pSignMC(x.signParts[q], v) : 0;
    // round 60: and the likely range stays on the value's side (the range and the simulation must both say so)
    const sameSign = v !== 0 && pOwn >= 0.95 && alts.every(z => z * v > 0) && lo * v > 0 && hi * v > 0;
    Object.assign(o, { [q]: r4(v * g), [q + "Lo"]: r4(lo * g), [q + "Hi"]: r4(hi * g), [q + "BandLo"]: r4(mb[q].lo * g), [q + "BandHi"]: r4(mb[q].hi * g),
      [q + "Eur"]: r4(v), [q + "Unc"]: M.uncertain(c, Y, q), [q + "SameSign"]: sameSign,
      // round 24b (owner): which way a number that is not certain leans ("ukraine", "russia", or null: uncertain direction)
      [q + "Lean"]: M.leaning(c, Y, q), [q + "Near"]: M.isNearZero(c, Y, q), [q + "Chance"]: r4(M.chance(c, Y, q).pUa) });
  }
  Object.assign(o, { ua2025: r4(x25.uaBal * g), rus2025: r4(x25.rusBal * g), net2025: r4(x25.shift * g),
    refugees: r4(x.refugees), aidRef: r4((x.shiftParts.find(p => p.k === "ref") || { v: 0 }).v),
    // round 24 (audit B): the euro amounts the worked examples quote: what was given and earned back, each part (EUR
    // bn, with its likely range), the gas and oil Russia cut off itself
    uaGave: r4(x.uaGave), uaBackEur: r4(-x.uaBack), rusCut: r4(x.rusCut), frozenEur: r4(x.frozen),
    // round 24b (owner): business with Russia in two lines, paid Russia and earned from Russia (EUR bn); they add up to it
    rusPaidEur: r4(x.rusPaid), rusEarnedEur: r4(x.rusEarned),
    // round 60: the same two lines as % of GDP with their own ranges (Russia's gain, the country's own gain)
    rusGain: r4(x.rusPaid * g), rusGainLo: r4(x.rusPaidLo * g), rusGainHi: r4(x.rusPaidHi * g),
    ownGain: r4(x.rusEarned * g), ownGainLo: r4(x.rusEarnedLo * g), ownGainHi: r4(x.rusEarnedHi * g) });
  for (const p of x.shiftParts.concat(x.backShift)) Object.assign(o, { ["part_" + p.k]: r4(p.v), ["part_" + p.k + "Lo"]: r4(p.lo), ["part_" + p.k + "Hi"]: r4(p.hi) });
  // round 68: the frozen reserves part in its two pieces (calc() frozenSplit: the return on reserves held here, and the
  // share of the return on reserves held at Euroclear and Clearstream), as the frozen-assets page's columns show them
  if (x.frozenSplit) for (const [k, s] of [["frozen_own", x.frozenSplit.own], ["frozen_eu", x.frozenSplit.eu]]) Object.assign(o, { ["part_" + k]: r4(s[0]), ["part_" + k + "Lo"]: r4(s[1]), ["part_" + k + "Hi"]: r4(s[2]) });
  // round 56 (more findable pages): the parts outside the totals (the oil discount, the cost of replacing Russian
  // energy, what Russia took from companies), and each year's cumulative support, trade and net (round 58: and frozen
  // money, so a page by year's columns can be added up) (EUR bn) for the
  // pages by year (each year's own amount is the difference of two years)
  for (const p of x.costParts.concat(x.takenParts || [])) o["cost_" + p.k] = r4(p.v);
  // round 57b (richer country pages): the figures the country pages' sections write beside the map's sentences (check 48):
  // what it bought from and sold to Russia in 2021 and 2025 (sales values), its measured fuel share before the war,
  // loans in full and as a gift and what is promised (Kiel's figures), money flowing back and what its firms kept of it
  const tr = c.to_rus || {}, fr = c.from_rus || {}, ai = c.aid || {};
  o.dyn = { tb0: tr.years ? tr.years[0] : null, tb1: tr.years ? tr.years[4] : null, ts0: fr.years ? fr.years[0] : null, ts1: fr.years ? fr.years[4] : null,   // as in data.json (a % change needs them unrounded)

    fuelShare: tr.gain && tr.gain.fossil_share != null ? tr.gain.fossil_share : null, loansFace: r4(ai.loans_face ?? null), loansGE: r4(ai.loans_face ? (ai.loans_grant_eq ?? ai.loans_face * 0.26) : null),
    pledged: r4(ai.pledged_open ?? null), flowGross: r4(x.flowback), flowKept: r4(x.flowbackProfit) };
  // round 60: Kiel's own figure for its bilateral aid (EUR bn), beside the adjusted amount the map counts (part_aid)
  o.kielEur = r4(x.kielOwn);
  o.yearsEur = Object.fromEntries(D.years.filter(yy => yy >= 2022 && yy <= Y).map(yy => { const z = yy === Y ? x : M.calc(c, yy); return [yy, [r4(z.uaBal), r4(z.rusBal), r4(z.shift), r4(z.frozen)]]; }));
  // round 60: each year's own change in Russia's earnings from trade and in Russia's own gain (EUR bn; 2026 =
  // January-August), flat keys so the docs can tag them (rusY2025Eur, rusGainY2026Eur)
  for (const yy of Object.keys(o.yearsEur)) {
    const prev = o.yearsEur[yy - 1], z = +yy === Y ? x : M.calc(c, +yy), zp = prev ? M.calc(c, yy - 1) : null;
    o["rusY" + yy + "Eur"] = r4(o.yearsEur[yy][1] - (prev ? prev[1] : 0));
    o["rusGainY" + yy + "Eur"] = r4(z.rusPaid - (zp ? zp.rusPaid : 0));
  }
  // round 46: the views beside the band (without the war-time windfall) under the same names
  for (const a of mb.alts.concat(mb.views || [])) o["alt_" + a.k] = { ua: r4(a.ua * g), rus: r4(a.rus * g), net: r4(a.net * g) };
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
