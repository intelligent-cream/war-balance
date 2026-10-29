// Round 57b (richer country pages; the design approved by the owner on 26 October 2026: "looks good, only the sources
// links should be real links"): the sections and the questions of a country page, chosen and filled by rule from the
// map's own data. Every block is a condition on the data and then either the map's own sentence (seo_extract.mjs
// dyn: storyTags, decideLine, uncReason, chanceSentence, frozenLine, sanctionNote, kielLine, the marker notes ...) or a
// phrase of the one translation table (seo_i18n.mjs DYN) filled with figures; nothing is written per country.
//
//   - every figure this file writes is marked with the model quantity it shows (<span data-f data-k>), and check 48
//     (seo_check.py check_dyn) checks each against the model on every country page in every language;
//   - round 60: direction words follow the sign of the middle value, a chance names the side it is the chance of, and the
//     map's chance words say both where they differ (index.html chanceInfo dirWords, disagree); a year's own amount has no
//     range, so a change of side between years is said only where the total is very likely and every year is material;
//   - ranks follow the map's rule: only a very likely country gets a number, among economies of €5bn and more;
//   - the questions are a pool of templates, each with a data condition, a family and a score (base + 40 × salience
//     + 10 × log10(1 + search demand)); a page gets the best four to six, at most two per family. The visible
//     questions and the JSON-LD FAQPage are the same array (the JSON-LD answer is the visible one as plain text);
//   - every source is a link: its key document, or else its entry in the page's list of sources;
//   - round 59: the questions about what it gave, about Russia and about its trade are asked in the phrasing people
//     search in the page's language, and their scores add those searches' monthly volumes (o.ask, seo_demand.json ask).
// Not here, on purpose: the euros of supply that stopped without the buyer's choice (strikes, export ban, Druzhba):
// the map does not show them yet, and these pages only repeat the map.
//
// Pure (no browser): pipeline/test_seo.mjs tests it.

import * as I from "./seo_i18n.mjs";

export const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const unesc = s => String(s).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
// an answer's HTML as the JSON-LD's plain text ("&lt;0.01%" becomes "<0.01%" again)
export const plainText = html => unesc(String(html).replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
// the panel joins some of its sentences after a full stop in lower case ("... itself. of which ..."): a capital there
const sentenceCase = s => String(s || "").replace(/([.!?]\s+)(\p{Ll})/gu, (m, a, b) => a + b.toUpperCase());
// the panel's markers (◆ ▪ △) stay on the panel
const noMark = s => String(s || "").replace(/^[◆▪△]\s*/u, "");
const D = (l, key, vars = {}, nums = {}) => I.fmt(I.dyn(l, key), vars, nums);

export const MIN_GDP_RANK = 5;   // € bn, the map's ranking threshold (MIN_GDP_RANK in index.html)
export const MATERIAL = 0.001;   // a material amount: 0.1% of a year's GDP (the map's MAT)

// ----- a figure, marked with what it shows: f is its format, k the model quantity (seo_check.py check_dyn) -----
//   e €, unsigned · s € with its sign · m € with a minus only · p % of a year's GDP · ps the same, signed
//   q a share (0.79 → 79%) · c a change in % (signed, whole) · n a whole count · k a rank number
export function figText(l, f, v, gdp) {
  const sg = v >= 0 ? "+" : "−";
  switch (f) {
    case "e": return I.E(l, v);
    case "s": return sg + I.E(l, v);
    case "m": return (v < 0 ? "−" : "") + I.E(l, v);
    case "p": return I.P(l, (100 * v) / gdp);
    case "ps": return sg + I.P(l, (100 * v) / gdp);
    case "q": return I.P(l, 100 * v);
    case "c": return sg + I.PI(l, v);
    case "n": return I.N(l, v);
    case "k": return String(v);
    default: throw new Error("seo_country: unknown figure format " + f);
  }
}
export const fig = (l, f, k, v, gdp, iso) => `<span data-f="${f}" data-k="${k}"${iso ? ` data-iso="${iso}"` : ""}>${esc(figText(l, f, v, gdp))}</span>`;

// ----- the map's ranking rule, for a group of countries: rows { iso, gdp, party, noData, level, side, netPct } -----
export const rankable = r => !!r && (r.gdp || 0) >= MIN_GDP_RANK && !r.party && !r.noData && !!r.level;
export function mapRank(row, pool) {
  if (!rankable(row) || row.level !== "sure") return null;
  const same = pool.filter(r => rankable(r) && r.level === "sure" && r.side === row.side).sort((a, b) => b.netPct - a.netPct);
  const i = same.findIndex(r => r.iso === row.iso);
  if (i < 0) return null;
  return { n: row.side === "ukraine" ? i + 1 : same.length - i, of: same.length };
}
// neighbours by land, in the same part of the world (a border through an overseas territory, Brazil–France, is not one)
const EUROPE = new Set(["eu", "eur"]);
export const sameRegion = (a, b) => a === b || (EUROPE.has(a) && EUROPE.has(b));
// countries with a similar result: same region, same chance level and side, not near or essentially zero
export function similarOf(row, rows, n = 4) {
  if (!rankable(row) || row.level === "zero" || row.level === "near") return [];
  return rows.filter(r => r.iso !== row.iso && rankable(r) && r.region === row.region && r.level === row.level && r.side === row.side)
    .sort((a, b) => Math.abs(a.netPct - row.netPct) - Math.abs(b.netPct - row.netPct) || a.iso.localeCompare(b.iso)).slice(0, n);
}

// ----- the question pool -----
// x: the derived facts (see facts() below). demand: seo_demand.json's entry (trade, help, aid and clusters)
const demandOf = (dm, keys) => keys.reduce((a, k) => a + ((dm.clusters || {})[k] || 0) + (["trade", "help", "aid"].includes(k) ? dm[k] || 0 : 0), 0);
export const POOL = [
  { id: "gave", fam: "aid", base: 30, demand: ["aid", "aid_country", "aid_country_year"], ask: ["given"], cond: x => x.data && x.ua >= 0.0005, sal: x => Math.min(1, x.uaPct) },
  { id: "trade", fam: "trade", base: 25, demand: ["trade", "trade_country", "oil_buyers", "gas_lng"], ask: ["trade"], cond: x => x.data && (x.tb1 || 0) > 0.05, sal: x => Math.min(1, Math.abs(x.rusPct)) },
  { id: "help", fam: "help", base: 28, demand: ["help", "help_russia_country", "country_russia_relations"], ask: ["support", "helping"], cond: x => x.data && !!x.net, sal: x => (x.netEur < 0 ? 1 : 0.4) },
  { id: "decide", fam: "sure", base: 12, demand: [], cond: x => x.data && !!x.decide && !!x.decide.flip && ["lean", "unc"].includes(x.level), sal: () => 1 },
  { id: "close", fam: "sure", base: 12, demand: [], cond: x => x.data && !!x.decide && !!x.decide.why && ["zero", "near"].includes(x.level), sal: () => 0.9 },
  { id: "oilgas", fam: "trade", base: 15, demand: ["oil_buyers", "gas_lng", "shadow_fleet"], sal: x => x.fuelShare,
    cond: x => x.data && x.fuelMeasured && x.fuelShare >= 0.3 && (x.tb1 || 0) > 0.05 && demandOf(x.demand, ["oil_buyers", "gas_lng"]) > 0 },
  { id: "frozen", fam: "frozen", base: 14, demand: ["frozen_assets", "reparations_loan"], cond: x => x.data && Math.abs(x.frozen) >= 0.05 && !!x.notes.frozen,
    sal: x => Math.min(1, Math.abs(x.frozen) / Math.max(0.01, Math.abs(x.netEur))) },
  { id: "refugees", fam: "refugees", base: 12, demand: ["refugees"], cond: x => x.data && x.refN >= 1000 && x.refCost >= 0.0005, sal: x => Math.min(1, x.per1k / 20) },
  { id: "kiel", fam: "aid", base: 10, demand: ["aid_rankings", "brand_tracker"], sal: () => 0.8,
    cond: x => x.data && !!x.kiel && x.kielWhy && x.kielFig >= 0.05 && Math.abs(x.kielFig - x.aidCounted) > 0.1 * x.kielFig },
  { id: "years", fam: "years", base: 10, demand: ["aid_country_year"], cond: x => x.data && x.ua >= 0.1, sal: () => 0.6 },
  { id: "compare", fam: "peers", base: 8, demand: ["comparisons"], cond: x => x.data && x.rankable && x.neighbours.length > 0, sal: () => 0.5 },
  { id: "sources", fam: "sources", base: 6, demand: [], cond: x => x.data && x.srcIds.length > 0, sal: () => 0.3 },
  { id: "hub", fam: "hub", base: 18, demand: ["sanctions_evasion_hubs", "shadow_fleet"], cond: x => x.data && !!x.notes.hub, sal: () => 0.8 },
  { id: "sanctions", fam: "sanctions", base: 12, demand: ["sanctions_country", "sanctions_general"], cond: x => x.data && !!x.notes.sanction, sal: () => 0.6 },
  { id: "nodata", fam: "nodata", base: 40, demand: [], cond: x => !x.data, sal: () => 1 },
  // round 58: in the searchers' words. Its relations with Russia ("Türkei Russland Beziehung"), where the page's language
  // searches for them (seo_demand.json byLang, seo_families.json country.relations), answered from its trade, support
  // and net; the kinds of supplies it sent to Russia ("North Korea soldiers and shells"), where its data have them
  // (seo_families.json armedItems)
  { id: "relations", fam: "relations", base: 20, demand: ["country_russia_relations", "groups_blocs"], cond: x => x.data && !x.party && x.relDemand >= x.relMin, sal: () => 0.7 },
  { id: "armed", fam: "armed", base: 25, demand: ["military_support_russia"], cond: x => !!x.armed && x.armedFull >= 0.0005, sal: () => 1 },
];
export const FAQ_MAX = 6, FAQ_PER_FAMILY = 2;
// round 59: and Google's monthly volumes of the phrasings a question answers, in the page's language (seo_demand.json ask)
const askVol = (x, keys) => (keys || []).reduce((a, k) => a + ((x.ask || {})[k] || 0), 0);
// the questions a page gets: by score, at most FAQ_MAX, at most FAQ_PER_FAMILY per family (ties: the pool's order)
export function pickFaq(x) {
  const cand = POOL.map((p, i) => ({ p, i })).filter(({ p }) => p.cond(x))
    .map(({ p, i }) => ({ p, i, score: p.base + 40 * p.sal(x) + 10 * Math.log10(1 + demandOf(x.demand || {}, p.demand) + askVol(x, p.ask)) }))
    .sort((a, b) => b.score - a.score || a.i - b.i);
  const out = [], fams = {};
  for (const c of cand) {
    if (out.length >= FAQ_MAX) break;
    if ((fams[c.p.fam] || 0) >= FAQ_PER_FAMILY) continue;
    fams[c.p.fam] = (fams[c.p.fam] || 0) + 1;
    out.push({ id: c.p.id, fam: c.p.fam, score: Math.round(c.score) });
  }
  return out;
}

// ----- the facts of one country, from the map's extract in one language (c), with the page's context (o) -----
// o: { l, gdpModal (the fuel share every unmeasured country holds), tradeYears [2021, 2025], peers, demand, eu }
export function facts(c, o) {
  const d = c.dyn || { story: [], notes: {}, facts: {}, parts: [], coverage: [] }, f = c.fig || {}, fx = d.facts || {};
  const m = k => (c.measures && c.measures[k] ? c.measures[k].v : 0);
  const tr = fx.trade || {};
  const srcIds = [...new Set((d.parts || []).flatMap(p => p.src))];
  return {
    data: !!c.net && !c.noData && !c.mostlyNoData, party: !!c.party, iso: c.iso, gdp: c.gdp, name: c.name,
    net: c.net, ua: f.ua || 0, uaPct: f.uaPct || 0, rusPct: f.rusPct || 0, netEur: f.net || 0, netPct: f.netPct || 0, frozen: f.frozen || 0,
    level: f.cN ? f.cN.level : null, side: f.cN ? f.cN.side : null, sideWords: f.cN ? f.cN.sideWords : "",
    decide: d.decide, notes: d.notes || {}, story: d.story || [], parts: d.parts || [], coverage: d.coverage || [], srcIds,
    tb0: tr.bought ? tr.bought.y0 : null, tb1: tr.bought ? tr.bought.y1 : null, ts0: tr.sold ? tr.sold.y0 : null, ts1: tr.sold ? tr.sold.y1 : null,
    fuelShare: fx.fuelShare, fuelMeasured: fx.fuelShare != null && Math.abs(fx.fuelShare - o.fuelDefault) > 1e-6,
    refN: fx.ref ? fx.ref.count : 0, per1k: fx.ref ? fx.ref.per1k : 0, refAsOf: fx.ref ? fx.ref.asOf : "", refCost: m("part:ref"),
    loans: fx.loans, pledged: fx.pledged, flowback: fx.flowback,
    kiel: c.kiel || "", kielWhy: / — /.test(c.kiel || ""), kielFig: m("kiel") || 0, aidCounted: m("aid"),
    prem: m("part:prem"), disc: m("part:disc"),
    rankable: !!(o.peers && o.peers.rankable), neighbours: (o.peers && o.peers.neighbours) || [], demand: o.demand || {}, eu: !!o.eu,
    // round 58: the page language's searches for its relations with Russia, and the kinds of supplies it sent to Russia
    relDemand: ((o.relations && o.relations.clusters) || []).reduce((a, k) => a + ((((o.demand || {}).byLang || {})[k] || {})[o.l] || 0), 0),
    relMin: o.relations && o.relations.minDemand != null ? o.relations.minDemand : Infinity, armed: o.armed || null, armedFull: o.armedFull || 0,
    // round 59: the page language's search volumes of the phrasings its questions answer (seo_demand.json ask)
    ask: (((o.demand || {}).ask || {})[o.l]) || {},
  };
}

// ----- the sections -----
// o: { l, words (the map's chance words), dw (the panel's labels), srcs (every source in this language), L (the
// page labels), dataTo, month, tradeYears, peers: { world, groups: [{ label, n, of }], neighbours, similar, rankable },
// row(iso) (a country's row in this language), home (the map's address), fuelDefault, demand, eu }
export function countryDyn(c, o) {
  const l = o.l, x = facts(c, o), gdp = c.gdp, F = (f, k, v, iso) => fig(l, f, k, v, iso ? o.row(iso).gdp : gdp, iso);
  const out = { story: [], decide: "", sections: [], faq: [] };
  const name = c.name, Nt = I.inSentence(l, name);
  const P = s => `<p>${s}</p>`, sec = (id, title, html) => html && out.sections.push({ id, title, html });
  const [y0, y1] = o.tradeYears;
  const tag = k => x.story.find(t => t.key === k);
  // round 58b: the sanctions on Russia that apply in it (seo_research.mjs sanctionsBlock, from sanctions_r58.json): a
  // section and a question on every page, with or without data
  const regime = () => { if (o.regime) { sec("sanctions-on-russia", o.regime.title, o.regime.html); out.faq.push({ id: "regime", fam: "regime", score: 0, q: o.regime.q, a: o.regime.a.replace(/[ \t\r\n]+/g, " ").trim() }); } };
  if (!x.data) {
    out.faq = faqOf(c, x, o, F);
    regime();
    return out;
  }
  // its story in short: the map's story tags, the first five
  out.story = x.story.slice(0, 5).map(t => ({ label: t.label, body: sentenceCase(t.body) }));
  // what decides it: the panel's lines under the net, for a number that is not very likely
  if (x.decide) {
    const parts = [c.net.chanceSentence, x.decide.why, x.decide.flip].filter(Boolean).map(esc);
    if (x.level === "zero" || x.level === "near") parts.push(D(l, "zeroSize", { range: esc(c.net.range) }));
    out.decide = P(parts.join(" "));
  }
  // year by year: the sentences beside the table (the table is seo_pages.mjs's)
  out.years = yearsText(c, x, o, F);
  // round 59b: its support for Ukraine by type (mil_split_r59.json, seo_research.mjs milCountry)
  if (o.mil) sec("support-by-type", o.mil.title, o.mil.html);
  // trade with Russia before and after (sales values), the fuel share where it is measured, the price effect
  {
    const s = [];
    // the change in % only from a base of at least €10m (from a few million it says little)
    const chg = (k, a, z) => ({ chg: a >= 0.01 ? F("c", k, 100 * (z / a - 1)) : "" });
    if (x.tb0 != null) s.push(D(l, "tradeBought", { b0: F("e", "tb0", x.tb0), b1: F("e", "tb1", x.tb1), y0, y1, ...chg("tbc", x.tb0, x.tb1) }, { chgOk: x.tb0 >= 0.01 }));
    if (x.ts0 != null) s.push(D(l, "tradeSold", { s0: F("e", "ts0", x.ts0), s1: F("e", "ts1", x.ts1), y0, y1, ...chg("tsc", x.ts0, x.ts1) }, { chgOk: x.ts0 >= 0.01 }));
    if (s.length) {
      if (x.fuelMeasured) s.push(D(l, "tradeFuel", { fs: F("q", "fuelShare", x.fuelShare), years: "2018–2021" }));
      const fairShown = x.notes.fairness && out.story.some(t => t.body.includes(x.notes.fairness));   // as the panel: once
      for (const n of [x.notes.windfall, noMark(x.notes.remit), !fairShown && x.notes.fairness]) if (n) s.push(esc(n));
      s.push(D(l, "tradeNote"));
      // round 59: named as the pair people search ("India–Russia trade"), where they do (seo_templates.mjs askOf)
      sec("trade", o.ask && o.ask.trade ? I.askQ(l, "tTradeAsk", name) : I.dyn(l, "tTrade"), P(s.join(" ")));
    }
  }
  // round 59b: what it bought from Russia by fuel, on three bases (fuel_split_r59.json, seo_research.mjs fuelCountry)
  if (o.fuel) sec("by-fuel", o.fuel.title, o.fuel.html);
  // sanctions, Russia's own cut-offs, or a choice: the panel's split, and the pipeline exemption
  if (x.notes.sanction || tag("exempt")) sec("sanctions", I.dyn(l, "tSanctions"), P([x.notes.sanction, tag("exempt") && tag("exempt").body].filter(Boolean).map(esc).join(" ")));
  if (o.regime) sec("sanctions-on-russia", o.regime.title, o.regime.html);
  // the cost of switching away from Russian energy (outside the totals)
  {
    const s = [], pr = Math.abs(x.prem) >= 0.01, di = Math.abs(x.disc) >= 0.01;
    if (pr) s.push(D(l, "energyPremium", { v: F("e", "cost_prem", x.prem), p: F("p", "cost_prem", x.prem) }));
    if (di) s.push(D(l, "energyDiscount", { v: F("e", "cost_disc", x.disc) }));
    if (s.length) { s.push(D(l, "energyNote", {}, { both: pr && di })); sec("energy", I.dyn(l, "tEnergy"), P(s.join(" "))); }
  }
  // frozen Russian money: the panel's line; round 58b: and the amounts frozen there, for context (frozen_amounts_r58.json)
  if (x.notes.frozen || o.stock) sec("frozen", o.L("frozen"), (x.notes.frozen ? P(esc(x.notes.frozen)) : "") + (o.stock || ""));
  // refugees from Ukraine: the map's sentences; the cost per refugee-year only where the hosting cost is reported
  if (x.refN >= 1000) {
    const s = [x.notes.refHosted && esc(x.notes.refHosted), D(l, "refDate", { d: esc(x.refAsOf) })];
    if (x.refCost >= 0.0005) s.push(D(l, "refCost", { v: F("e", "part_ref", x.refCost), p: F("p", "part_ref", x.refCost) }));
    for (const n of [x.notes.refGross, x.notes.refPerYear]) if (n) s.push(esc(n));
    sec("refugees", I.dyn(l, "tRefugees"), P(s.filter(Boolean).join(" ")));
  }
  // why this differs from the Kiel tracker: the panel's line, then the loans and what is promised (Kiel's own figures)
  if (x.kiel && x.kielFig >= 0.05) {
    const s = [esc(x.kiel)];
    if (x.loans) s.push(D(l, "kielLoans", { lf: esc(o.dw.loansFace), lg: esc(o.dw.loansGE), face: F("e", "loansFace", x.loans.face), ge: F("e", "loansGE", x.loans.ge) }));
    if (x.pledged) s.push(D(l, "kielPledged", { label: esc(o.dw.pledged), v: F("e", "pledged", x.pledged) }));
    if (x.notes.undelivered) s.push(esc(x.notes.undelivered));
    sec("kiel", I.dyn(l, "tKiel"), P(s.join(" ")));
  }
  // money flowing back from the war effort
  if (x.flowback && x.flowback.gross >= 0.01) sec("flowback", I.dyn(l, "tFlowback"), P(D(l, "flowback", { gross: F("e", "flowGross", x.flowback.gross), kept: F("e", "flowKept", x.flowback.kept), Nt: esc(Nt) })));
  // companies, Russia and Russian owners: their parts, and what Russia took (a marker)
  {
    const s = x.parts.filter(p => ["tax", "coprofits", "rusfirms", "lngpartners"].includes(p.k) && Math.abs(p.v) >= 0.05).map(p => partLine(l, p, F));
    if (x.notes.taken) s.push(esc(noMark(x.notes.taken)));
    if (s.length) sec("business", I.dyn(l, "tBusiness"), P(s.join(" ")));
  }
  // indirect channels: hubs, refined oil, shipping, settling payments, gold; goods its weapons need (a marker)
  {
    const KEYS = ["laund", "ship", "agents", "hidden"], ps = x.parts.filter(p => KEYS.includes(p.k));
    const show = !!x.notes.hub || ps.some(p => Math.abs(p.v) >= MATERIAL * gdp) || !!x.notes.chpl || !!x.notes.structural || !!x.notes.dualUse;
    if (show) {
      const s = [x.notes.hub, !x.notes.hub && tag("hub") && tag("hub").body].filter(Boolean).map(esc);
      s.push(...ps.map(p => partLine(l, p, F)));
      for (const n of [noMark(x.notes.chpl), x.notes.structural, x.notes.dualUse]) if (n) s.push(esc(n));
      sec("indirect", I.dyn(l, "tIndirect"), P(s.join(" ")));
    }
  }
  // compared with its neighbours and groups: the map's ranking rule
  if (x.rankable) {
    const pr = o.peers, s = [];
    if (pr.world) s.push(D(l, "peersRank", { n: F("k", "rank:all", pr.world.n), of: F("k", "of:all", pr.world.of), side: esc(x.sideWords) }));
    else s.push(D(l, "peersNoRank", { word: esc(levelWord(o.words, x)) }));
    for (const g of pr.groups) s.push(D(l, "peersGroup", { group: esc(g.label), n: F("k", "rank:" + g.slug, g.n), of: F("k", "of:" + g.slug, g.of), side: esc(x.sideWords) }));
    const nb = [c.iso, ...pr.neighbours].map(o.row).sort((a, b) => b.netPct - a.netPct);
    const table = (rows, head) => `<div class="tbl"><table class="peers"><thead><tr><th>${esc(head)}</th><th class="m">${esc(I.dyn(l, "thNet"))}</th></tr></thead><tbody>${rows.map(r => peerRow(l, r, r.iso === c.iso)).join("")}</tbody></table></div>`;
    sec("peers", I.dyn(l, "tPeers"), P(s.join(" ")) + (pr.neighbours.length ? `<h3>${esc(I.dyn(l, "neighbours"))}</h3>${table(nb, o.L("country"))}` : "")
      + (pr.similar.length ? `<h3>${esc(I.dyn(l, "similar"))}</h3>${table(pr.similar.map(o.row), o.L("country"))}` : ""));
  }
  // how the number is backed, and its sources by part (every source a link)
  if (x.srcIds.length) sec("backing", I.dyn(l, "tBacking"), backing(c, x, o, F));
  out.faq = faqOf(c, x, o, F);
  // round 59b: how much Russian oil it buys, by year from its customs, where the fuel section shows the crude by year
  if (o.fuel && o.fuel.faq) out.faq.push({ id: "fuel", fam: "fuel", score: 0, q: o.fuel.faq.q, a: o.fuel.faq.a.replace(/[ \t\r\n]+/g, " ").trim() });
  // the sanctions question after the pool's picks (not one of them: every page has it)
  if (o.regime) out.faq.push({ id: "regime", fam: "regime", score: 0, q: o.regime.q, a: o.regime.a.replace(/[ \t\r\n]+/g, " ").trim() });
  return out;
}

const partLine = (l, p, F) => D(l, "partLine", { name: esc(p.name), v: F("e", "part_" + p.k, p.v), p: F("p", "part_" + p.k, p.v) });
const levelWord = (w, x) => (x.level === "lean" ? (x.side === "ukraine" ? w.leanU : w.leanR) : x.level === "unc" ? w.unc : x.level === "near" ? w.near : x.level === "zero" ? w.zero : w.sure || "").replace(/^\p{Lu}/u, ch => ch.toLowerCase());

// a row of a neighbours or similar table: the map's net (% of GDP, €) and its chance words, in check 48's cell format
function peerRow(l, r, here) {
  const cls = r.netEur >= 0.0005 ? "pos" : r.netEur <= -0.0005 ? "neg" : "";
  const sg = v => (v >= 0 ? "+" : "−");
  const nm = here ? `<b>${esc(r.name)}</b>` : `<a href="${r.href}">${esc(r.name)}</a>`;
  return `<tr data-iso="${r.iso}"><td>${nm}</td><td class="m" data-q="net"${r.party ? "" : ` data-level="${r.level}"`}><b class="${cls}">${esc(sg(r.netEur) + I.P(l, r.netPct))}</b><span class="s">${esc(sg(r.netEur) + I.E(l, r.netEur))}</span><span class="s">${esc(r.party ? r.partyWord : r.chance)}</span></td></tr>`;
}

// the yearly sentences: the year with the largest net amount, support in the first and last full year, and a change
// of side only where the total is very likely and every year's amount is material
function yearsText(c, x, o, F) {
  const l = o.l, rows = c.years || [], full = rows.filter(y => !y.ytd), s = [];
  const live = rows.filter(y => Math.abs(y.netBn) >= 0.0005);
  if (full.length) {
    const big = full.slice().sort((a, b) => Math.abs(b.netBn) - Math.abs(a.netBn))[0];
    if (Math.abs(big.netBn) >= 0.0005) s.push(D(l, "yearBig", { y: big.y, v: F("s", `y${big.y}:net`, big.netBn) }, { nYears: live.length }));
  }
  const a = full[0], b = full[full.length - 1];
  if (x.ua >= 0.1 && a && b && a !== b && a.uaBn > 0) s.push(D(l, "yearUa", { a: F("e", `y${a.y}:ua`, a.uaBn), b: F("e", `y${b.y}:ua`, b.uaBn), y0: a.y, y1: b.y }, { ua0: a.uaBn, ua1: b.uaBn }));
  const sides = new Set(live.map(y => y.netBn > 0));
  if (sides.size > 1) {
    const material = x.level === "sure" && rows.every(y => Math.abs(y.netBn) >= MATERIAL * c.gdp);
    s.push(material ? D(l, "yearSides", { list: rows.map(y => `${y.y}${y.ytd ? "*" : ""} ${F("s", `y${y.y}:net`, y.netBn)}`).join(", ") }) : D(l, "yearSmall"));
  }
  return s.length ? `<p>${s.join(" ")}</p>` : "";
}

// how the number is backed: the sources by tier, the parts by letter, the parts without data, the data coverage, then
// the sources of the largest parts with their tier, and every source (each a link)
export function backing(c, x, o, F) {
  const l = o.l, tierOf = id => (o.srcs[id] || {}).tier || "own";
  const n = t => x.srcIds.filter(id => tierOf(id) === t).length;
  const tot = x.parts.reduce((a, p) => a + Math.abs(p.v), 0) || 1, share = ls => Math.round((100 * x.parts.filter(p => ls.includes(p.grade)).reduce((a, p) => a + Math.abs(p.v), 0)) / tot);
  const pc = v => I.PI(l, v);
  const s = [D(l, "backTiers", { n: x.srcIds.length, off: n("official"), res: n("research"), press: n("press"), own: n("own"), m: n("method") }, { m: n("method") }),
    D(l, "backShare", { ab: pc(share(["A", "B"])), c: pc(share(["C"])), d: pc(share(["D"])) })];
  if (x.notes.noData) s.push(esc(x.notes.noData));
  const cov = x.coverage.length ? `<h3>${esc(o.dw.coverage)}</h3><ul class="cov">${x.coverage.map(p => `<li><span class="dot ${esc(p.status)}" aria-hidden="true"></span>${esc(p.part)}: ${esc(p.word)}${p.note ? ` <span class="sub">${esc(p.note)}</span>` : ""}</li>`).join("")}</ul>` : "";
  const TIER = { official: "tierOfficial", research: "tierResearch", press: "tierPress", own: "tierOwn", method: "tierMethod" };
  const href = (id, fallback) => (o.srcs[id] && o.srcs[id].href) || fallback;
  const li = (id, fallback, attrs = "") => `<li${attrs}><span class="tier t-${tierOf(id)}">${esc(I.dyn(l, TIER[tierOf(id)]))}</span> <a href="${esc(href(id, fallback))}"${/^https?:/.test(href(id, fallback)) ? ' rel="noopener"' : ""}>${esc((o.srcs[id] || {}).name || id)}</a></li>`;
  const seen = new Set(), byPart = [];
  for (const p of x.parts.slice(0, 5)) {
    const ids = p.src.filter(id => tierOf(id) !== "method" && !seen.has(id)).slice(0, 3);
    ids.forEach(id => seen.add(id));
    if (ids.length) byPart.push(`<h3>${esc(p.name)} <span class="letter">${esc(p.grade)}</span></h3><ul class="src">${ids.map(id => li(id, "#src-" + id)).join("")}</ul>`);
  }
  const all = `<details class="fold-in"><summary>${esc(I.dyn(l, "srcAll"))} (${x.srcIds.length})</summary><ul class="src">${x.srcIds.map(id => li(id, o.home + "#" + c.iso, ` id="src-${esc(id)}"`)).join("")}</ul></details>`;
  return `<p>${s.join(" ")}</p>${cov}<h3 class="srch">${esc(I.dyn(l, "tSources"))}</h3>${byPart.join("")}${all}`;
}

// the questions: the pool's picks, filled; q is plain text, a is HTML (its figures marked, its sources links)
function faqOf(c, x, o, F) {
  const l = o.l, name = c.name, Nt = I.inSentence(l, name), N = name, picks = pickFaq(x), out = [];
  const pair = x.armed ? I.armedPair(l, name, x.armed) : "";
  // round 59: the questions in the phrasing people search in this language (o.ask, seo_templates.mjs askOf)
  const ask = o.ask || {};
  const ASKQ = { gave: ask.given ? "qGiven" : "", help: ask.verb === "support" || ask.verb === "helping" ? ask.verb : "", trade: ask.trade ? "qTradeAsk" : "" };
  const q = id => (ASKQ[id] ? I.askQ(l, ASKQ[id], name) : I.fmt(I.dyn(l, "q" + cap(id)), { Nt, N, NtCap: cap(Nt), pair }));
  const A = (id, vars, nums) => D(l, "a" + cap(id), vars, nums);
  const [y0, y1] = o.tradeYears;
  const tag = k => x.story.find(t => t.key === k);
  for (const p of picks) {
    let a = "";
    switch (p.id) {
      case "gave": a = A("gave", { ua: F("e", "uaEur", x.ua), uaP: F("p", "uaEur", x.ua), uaRange: esc(c.ua.range), dataTo: esc(o.dataTo), NtCap: esc(cap(Nt)) }, { tiny: x.uaPct < 0.01 && x.ua < 0.05, eu: x.eu }); break;
      case "trade": a = A("trade", { b1: F("e", "tb1", x.tb1), b0: F("e", "tb0", x.tb0), s1: x.ts1 != null ? F("e", "ts1", x.ts1) : "", y0, y1, kept: esc(c.kept) }, { sold: x.ts1 != null && x.ts1 >= 0.0005 }); break;
      case "help": a = A("help", { partyWhy: esc(c.partyWhy), netSigned: esc(c.net.signed), netWords: esc([c.net.range, c.net.chance].filter(Boolean).join(I.semi(l))), chance: esc(c.net.chanceSentence),
        keptCap: esc(cap(c.kept)), fair: esc(x.notes.fairness), armedEur: esc(I.E(l, o.armedFull || 0)) }, { party: x.party, chance: !!c.net.chanceSentence, fair: !!x.notes.fairness, armed: (o.armedFull || 0) >= 0.05 }); break;
      case "decide": a = A("decide", { chance: esc(c.net.chanceSentence), why: esc(x.decide.why), flip: esc(x.decide.flip) }); break;
      case "close": a = A("close", { zeroWord: esc(x.level === "near" ? o.words.near : o.words.zero), netSigned: esc(c.net.signed), range: esc(c.net.range), why: esc(x.decide.why) }); break;
      case "oilgas": a = A("oilgas", { fs: F("q", "fuelShare", x.fuelShare), years: "2018–2021", b1: F("e", "tb1", x.tb1), b0: F("e", "tb0", x.tb0), y0, y1 }, { split: o.fuel ? 1 : 0 }); break;
      case "frozen": a = A("frozen", { frozen: esc(x.notes.frozen) }) + (o.stock ? " " + o.stock.replace(/<\/?p[^>]*>/g, "") : ""); break;
      case "refugees": a = A("refugees", { hosted: esc(x.notes.refHosted || ""), cost: D(l, "refCost", { v: F("e", "part_ref", x.refCost), p: F("p", "part_ref", x.refCost) }),
        gross: esc(x.notes.refGross || ""), perYear: esc(x.notes.refPerYear || "") }, { gross: !!x.notes.refGross, perYear: !!x.notes.refPerYear }); break;
      case "kiel": a = A("kiel", { kiel: esc(x.kiel) }); break;
      case "years": a = A("years", { list: (c.years || []).map(y => `${esc(y.ytd ? I.s(l, "yearTo", { y: y.y, month: o.month }) : String(y.y))} ${F("m", `y${y.y}:ua`, y.uaBn)}`).join("; "),
        ua: F("e", "uaEur", x.ua), uaRange: esc(c.ua.range) }); break;
      case "compare": {
        const rows = [c.iso, ...x.neighbours].map(o.row).sort((a2, b2) => b2.netPct - a2.netPct);
        const w = o.peers.world;
        a = A("compare", { list: rows.map(r => `${esc(r.name)} ${F("ps", "netEur", r.netEur, r.iso)}`).join(", "),
          rank: w ? D(l, "peersRank", { n: F("k", "rank:all", w.n), of: F("k", "of:all", w.of), side: esc(x.sideWords) }) : "" }, { ranked: !!w });
        break;
      }
      case "sources": {
        const tierOf = id => (o.srcs[id] || {}).tier || "own";
        const list = x.parts.slice(0, 3).map(pt => { const id = pt.src.find(i => tierOf(i) !== "method") || pt.src[0]; if (!id) return ""; const h = (o.srcs[id] && o.srcs[id].href) || "#src-" + id;
          return `${esc(pt.name)}: <a href="${esc(h)}"${/^https?:/.test(h) ? ' rel="noopener"' : ""}>${esc((o.srcs[id] || {}).name || id)}</a>`; }).filter(Boolean);
        a = A("sources", { n: x.srcIds.length, off: x.srcIds.filter(id => tierOf(id) === "official").length, list: list.join(I.semi(l)) });
        break;
      }
      case "hub": a = A("hub", { hub: esc(x.notes.hub), chpl: esc(noMark(x.notes.chpl)) }, { chpl: !!x.notes.chpl }); break;
      case "sanctions": a = A("sanctions", { sanction: esc(x.notes.sanction), exempt: esc(tag("exempt") ? tag("exempt").body : "") }, { exempt: !!tag("exempt") }); break;
      case "relations": a = A("relations", { b1: x.tb1 != null ? F("e", "tb1", x.tb1) : "", b0: x.tb0 != null ? F("e", "tb0", x.tb0) : "", s1: x.ts1 != null ? F("e", "ts1", x.ts1) : "", y0, y1,
        ua: F("e", "uaEur", x.ua), netSigned: esc(c.net.signed), netWords: esc([c.net.range, c.net.chance].filter(Boolean).join(I.semi(l))) },
        { trade: x.tb0 != null && x.tb1 != null, sold: x.ts1 != null && x.ts1 >= 0.0005 }); break;
      case "armed": a = A("armed", { pair: esc(pair), armedEur: esc(I.E(l, x.armedFull)) }, { party: x.party }); break;
      case "nodata": a = A("nodata", { text: esc(c.mostlyNoData && x.notes.noData ? x.notes.noData : o.dw.noDataBig) }); break;
      default: throw new Error("seo_country: no answer for " + p.id);
    }
    out.push({ id: p.id, fam: p.fam, score: p.score, q: q(p.id), a: a.replace(/[ \t\r\n]+/g, " ").trim() });
  }
  return out;
}
