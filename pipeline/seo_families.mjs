// Round 56 (more findable pages, owner: "use what we have and show it in a new manner ... split numbers that are
// together"): the generated page families, from pipeline/seo_families.json and the map's own numbers. Nothing here is
// written per page: a part of the panel, a year or a pair of countries becomes a page by rule.
//   parts:    /<slug>/ one per part of the panel that enough countries have (and that no topic page already ranks)
//   years:    /ukraine-aid-<year>/ and /trade-with-russia-<year>/
//   compare:  /compare/<a>-vs-<b>/ for the searched pairs and every pair of the largest donors (round 63: only the
//             listed pairs indexed)
// Pure (pipeline/test_seo.mjs tests it); seo_pages.mjs writes the pages.

const SIZE = 0.0005;   // the smallest amount shown (€0.5m)

// the value of one part for a country (the measures seo_extract.mjs gives: part:<key>)
const partV = (c, key) => { const m = c.measures && c.measures["part:" + key]; return m && m.v != null ? m.v : 0; };

// which parts get a page: enough countries, enough money, no topic page of their own
export function partEntries(fam, countries, topics) {
  const ranked = new Set(topics.map(e => e.rank).filter(r => r && r.startsWith("part:")).map(r => r.slice(5)));
  const out = [];
  for (const p of fam.parts.list) {
    if (ranked.has(p.key)) continue;
    const vs = countries.filter(c => c.gdp).map(c => partV(c, p.key)).filter(v => Math.abs(v) >= SIZE);
    const total = vs.reduce((a, v) => a + Math.abs(v), 0), sum = vs.reduce((a, v) => a + v, 0);
    if (vs.length < fam.parts.minCountries || total < fam.parts.minTotal) continue;
    // round 68: the frozen reserves page with the part's two pieces beside it (the return on reserves held here, and the
    // share of the return on reserves held at Euroclear and Clearstream)
    const col = p.key === "frozen" ? ["part:frozen_own", "part:frozen_eu", "frozen", "net"] : { ua: ["ua", "net"], back: ["ua", "net"], rus: ["rus", "net"], frozen: ["frozen", "net"], cost: ["net"] }[p.side];
    // the order, by side (round 58: said in the side's own words by seo_topics.mjs): support and frozen money high to
    // low; money flowing back (below zero: subtracted from support) from the most subtracted; trade parts by size either
    // way; a cost high to low, or low to high where it is mostly below zero (a gain, such as the oil discount)
    const order = p.side === "ua" || p.side === "frozen" ? "desc" : p.side === "back" ? "asc" : p.side === "cost" ? (sum < 0 ? "asc" : "desc") : "abs";
    out.push({ kind: "part", slug: p.slug, key: p.key, side: p.side, rank: "part:" + p.key, sort: "eur", order, minGdp: 0, nonzero: true, columns: col, limit: 60,
      map: p.side === "ua" || p.side === "back" ? "#view=rank&lens=support" : p.side === "rus" ? "#view=rank&lens=payments" : "#view=rank", n: vs.length });
  }
  return out;
}

export function yearEntries(fam, lastYear) {
  return fam.years.flatMap(y => [
    // round 58: with frozen money's own column, so each row's columns add up to its net (support + trade + frozen)
    { kind: "year", slug: `ukraine-aid-${y}`, yearKind: "ua", year: y, partial: y === lastYear, rank: "ua", sort: "eur", order: "desc", minGdp: 0, nonzero: true, columns: ["rus", "frozen", "net"], limit: 60, map: `#view=rank&lens=support&y=${y}` },
    { kind: "year", slug: `trade-with-russia-${y}`, yearKind: "rus", year: y, partial: y === lastYear, rank: "rus", sort: "eur", order: "asc", minGdp: 0, nonzero: true, columns: ["ua", "frozen", "net"], limit: 60, map: `#view=rank&lens=payments&y=${y}` },
  ]);
}

// the pairs: the searched ones in their order, then every pair of the largest donors in euros (the larger first).
// Round 63 (audit: 1,505 near-identical comparison pages): only the pairs listed in seo_families.json compare.pairs are
// indexed (index: true): the pairs people search (seo_demand.json, the queries naming two countries) and the obvious
// neighbours and rivals. The other pairs of the largest donors are still written, but noindex, out of the sitemaps and
// not linked from the hubs (seo_pages.mjs)
export function compareEntries(fam, countries) {
  const by = Object.fromEntries(countries.map(c => [c.iso, c]));
  const ok = i => by[i] && by[i].gdp;
  const donors = countries.filter(c => c.gdp && !c.party && !c.noData && !c.mostlyNoData && c.measures && c.measures.ua)
    .sort((a, b) => b.measures.ua.v - a.measures.ua.v).slice(0, fam.compare.pairwiseTop).map(c => c.iso);
  const pairs = fam.compare.pairs.filter(([a, b]) => ok(a) && ok(b) && a !== b);
  const listed = new Set(pairs.map(p => p.slice().sort().join("-")));
  for (let i = 0; i < donors.length; i++) for (let j = i + 1; j < donors.length; j++) pairs.push([donors[i], donors[j]]);
  const seen = new Set(), out = [];
  for (const [a, b] of pairs) {
    const k = [a, b].sort().join("-");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ kind: "compare", slug: `${by[a].slug}-vs-${by[b].slug}`, a, b, index: listed.has(k) });
  }
  return out;
}
