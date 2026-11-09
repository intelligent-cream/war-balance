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
//   e €, unsigned · s € with its sign · m € with a minus only · p % of a year's GDP · ps the same, signed · pm the
//   same with a minus only (round 60: support for Ukraine below zero)
//   q a share (0.79 → 79%) · c a change in % (signed, whole) · n a whole count · k a rank number
export function figText(l, f, v, gdp) {
  const sg = v >= 0 ? "+" : "−";
  switch (f) {
    case "e": return I.E(l, v);
    case "s": return sg + I.E(l, v);
    case "m": return (v < 0 ? "−" : "") + I.E(l, v);
    case "p": return I.P(l, (100 * v) / gdp);
    case "ps": return sg + I.P(l, (100 * v) / gdp);
    case "pm": return (v < 0 && Math.abs((100 * v) / gdp) >= 0.01 ? "−" : "") + I.P(l, (100 * v) / gdp);
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
  out.story = x.story.slice(0, 5).map(t => ({ label: t.label, body: storyBody(l, t, c, x) }));
  // what decides it: the panel's lines under the net, for a number that is not very likely
  if (x.decide) {
    const parts = [c.net.chanceSentence, x.decide.why, x.decide.flip].filter(Boolean).map(esc);
    if (x.level === "zero" || x.level === "near") parts.push(D(l, "zeroSize", { range: esc(c.net.range) }));
    // round 68 (QA review: Egypt "likely toward Russia · 95%" beside "very likely · 95%"): the site's rule (index.html
    // uncertain, chanceInfo) calls a number very likely only when its likely range stays on one side of zero; the same
    // chance can then be "very likely" for the trade and "likely" for the net, and the page says why
    if (x.level === "lean" && c.rus && c.rus.info && c.rus.info.level === "sure" && c.rus.info.side === x.side) parts.push(D(l, "leanVsSure", { sure: esc(o.words.sure || ""), lean: esc(o.words.lean || "") }));
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
  // round 64 (SEO audit, fix 7): the government's own published total, and why it differs from the map's
  const off = officialText(c, x, o, F);
  if (off) sec("official", I.dyn(l, "tOfficial"), P(off));
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
  if (off) out.faq.push({ id: "official", fam: "official", score: 0, q: I.fmt(I.dyn(l, "qOfficial"), { N: name, Nt, NtCap: cap(Nt) }), a: off.replace(/[ \t\r\n]+/g, " ").trim() });
  // the sanctions question after the pool's picks (not one of them: every page has it)
  if (o.regime) out.faq.push({ id: "regime", fam: "regime", score: 0, q: o.regime.q, a: o.regime.a.replace(/[ \t\r\n]+/g, " ").trim() });
  // round 69: why the published figures differ, at the top of the page (seo_pages.mjs puts it under the intro), and its
  // question (the pool's Kiel question says less, so it goes)
  const dif = differText(c, x, o, F);
  if (dif) {
    out.differ = dif.html;
    out.faq = out.faq.filter(q => q.id !== "kiel");
    const g = out.faq.findIndex(q => q.id === "gave"), at = g >= 0 ? g + 1 : Math.min(1, out.faq.length);
    out.faq.splice(at, 0, { id: "differ", fam: "differ", score: 0, q: dif.q, a: dif.a });
  }
  return out;
}

// round 69 (SERP review: revueconflits.com ranks first for "how much has France given to Ukraine" by explaining why the
// estimates range from €6.5bn to €26bn; our "Why this differs from the Kiel tracker" was the 13th heading): a small table
// of the published figures for its support, ours with its parts, the Kiel Institute's bilateral figure, the government's
// own total (official_totals_r64.json) and other sourced totals (published_figures_r69.json), then why they differ. The
// map's figures are marked (check 48); the others are their sources' own, in their currency, each with its link
export const KIEL_URL = "https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/";
export function differText(c, x, o, F) {
  const l = o.l, off = o.official, pubs = (o.published || []).filter(p => p && p.value > 0 && p.source_url);
  const kiel = x.kielFig >= 0.05 ? x.kielFig : 0;
  if (!x.data || x.ua < 0.05 || !(kiel || (off && (off.figures || []).length) || pubs.length)) return null;
  const m = k => (c.measures && c.measures[k] && c.measures[k].v != null ? c.measures[k].v : 0);
  const aid = m("part:aid"), eu = m("part:euaid"), ref = m("part:ref"), other = x.ua - aid - eu - ref;
  const has = v => Math.abs(v) >= 0.0005;
  const link = (href, text) => `<a href="${esc(href)}" rel="noopener">${esc(text)}</a>`;
  const rows = [], vals = [x.ua];
  // ours, with its parts (each a model quantity; "other" is what the parts named do not cover, so not marked). Kiel's
  // figure is Kiel's published one with the G7 loans Russia repays (the map's kielFigure, as the intro says it), not the
  // model's kielEur without them, so it is not marked either
  const parts = [has(aid) && D(l, "difAid", { v: F("m", "part_aid", aid) }), has(eu) && D(l, "difEu", { v: F("m", "part_euaid", eu) }), has(ref) && D(l, "difRef", { v: F("m", "part_ref", ref) }),
    Math.abs(other) >= 0.05 && D(l, "difOther", { v: esc((other < 0 ? "−" : "") + I.E(l, other)) })].filter(Boolean);
  rows.push({ src: esc(I.dyn(l, "difOurs")), srcText: I.dyn(l, "difOurs"), v: F("e", "uaEur", x.ua), cov: D(l, "difOursCov", { dataTo: esc(o.dataTo), list: parts.join(", ") }) });
  if (kiel) { rows.push({ src: link(KIEL_URL, I.dyn(l, "difKiel")), srcText: I.dyn(l, "difKiel"), v: esc(I.E(l, kiel)), cov: D(l, "difKielCov", { dataTo: esc(o.dataTo) }) }); vals.push(kiel); }
  if (off && (off.figures || []).length) {
    const amt = f => { const v = I.CUR(l, f.value, off.currency); return f.qualifier ? D(l, OFF_QUAL[f.qualifier.replace(/\W/g, "")], { v }) : v; };
    const KIND = { civil: "kindCivil", military: "kindMil", nonmil: "kindNonmil" }, fl = off.flags || [];
    const pub = (off.publisher || {})[l] || off.publisher.en;
    rows.push({ src: link(off.source_url, pub), srcText: pub, v: esc(off.figures.map(amt).join(" + ")),
      cov: D(l, "difOffCov", { list: esc(I.list3(l, off.figures.map(f => I.dyn(l, KIND[f.kind])))), asOf: esc(I.dateL(off.as_of, l)) },
        { face: fl.includes("face_value"), noeu: fl.includes("no_eu_share"), committed: off.figures.every(f => f.basis === "committed") }) });
    if (off.figures.length === 1 && off.currency === "EUR") vals.push(off.figures[0].value);
  }
  for (const p of pubs.slice().sort((a, b) => b.value - a.value)) {
    const pub = (p.publisher || {})[l] || p.publisher.en;
    rows.push({ src: link(p.source_url, pub), srcText: pub, v: esc(I.CUR(l, p.value, p.currency)), cov: D(l, p.cover, { asOf: esc(I.dateL(p.as_of, l)) }) });
    if (p.currency === "EUR") vals.push(p.value);
  }
  if (rows.length < 2) return null;
  const lo = Math.min(...vals), hi = Math.max(...vals), range = vals.length >= 2 && lo > 0 && hi > 1.1 * lo;
  const Nt = I.inSentence(l, c.name), names = { N: esc(c.name), Nt: esc(Nt) };
  const rv = { ...names, lo: esc(I.E(l, lo)), hi: esc(I.E(l, hi)) };
  const lead = D(l, "difLead", rv, { range });
  const adds = [has(eu) && I.dyn(l, "difAddEu"), has(ref) && I.dyn(l, "difAddRef")].filter(Boolean);
  const why = D(l, "difWhy", { adds: esc(I.list3(l, adds)) }, { adds: adds.length ? 1 : 0, era: (o.kielAdj || {}).era >= 0.0005, epf: pubs.some(p => p.epf) });
  const table = `<div class="tbl"><table class="differ"><thead><tr><th>${esc(I.dyn(l, "thSource"))}</th><th class="n">${esc(I.dyn(l, "thFigure"))}</th><th>${esc(I.dyn(l, "thCovers"))}</th></tr></thead><tbody>${rows.map((r, i) => `<tr${i === 0 ? ' class="here"' : ""}><td>${i === 0 ? `<b>${r.src}</b>` : r.src}</td><td class="n">${r.v}</td><td>${r.cov}</td></tr>`).join("")}</tbody></table></div>`;
  const html = `<section class="differ" aria-labelledby="why-figures-differ"><h2 id="why-figures-differ">${esc(I.dyn(l, "tDiffer"))}</h2><p>${lead}</p>${table}<p>${why}</p></section>`;
  const q = I.fmt(I.dyn(l, range ? "qDifferRange" : "qDiffer"), { N: c.name, Nt, lo: I.E(l, lo), hi: I.E(l, hi) }).replace(/\u00a0/g, " ");   // plain spaces: the JSON-LD's name is compared as written
  const a = [lead, ...rows.map(r => D(l, "difRow", { src: esc(r.srcText), v: r.v, cov: r.cov })), why].join(" ").replace(/[ \t\r\n]+/g, " ").trim();
  return { html, q, a };
}

// round 68 (QA review: "one figure per concept"): a story tag whose amount is a part of a headline figure says so. The
// sanctions split is of what Russia kept on purchases and sales, a part of the trade figure (France: €19.7bn of €20.2bn);
// the aid tag is a part of the support total (France: aid €15.3bn of €16.9bn). Every other tag is the map's own text
export function storyBody(l, t, c, x) {
  const fx = (c.dyn && c.dyn.facts) || {};
  if (["sanct", "own", "mixed"].includes(t.key) && fx.sanct) {
    const sp = fx.sanct;
    return D(l, "storySanct", { v: I.E(l, sp.tot), m: I.PI(l, sp.m), o: I.PI(l, sp.o), who: sp.who, ex: sp.ex }) + (sp.g >= 1 ? " " + D(l, "storySanctCut", { g: I.PI(l, sp.g) }) : "");
  }
  if (t.key === "aid" && fx.aidTag && fx.aidTag.r) {
    const a = fx.aidTag;
    return D(l, "storyAid", { ua: I.E(l, x.ua), v: I.E(l, a.v), p: I.P(l, (100 * a.v) / c.gdp), r: a.r, n: a.n });
  }
  return sentenceCase(t.body);
}

// round 64 (SEO audit, fix 7): a government's own total (o.official: its entry in research/2026-10/seo/
// official_totals_r64.json), what it covers in the document's own terms (flags), and what the map counts instead. The
// official amounts are the document's, in its currency, not the model's (so not marked); the map's total is marked
const OFF_KIND = { civil: "offCivil", military: "offMil", nonmil: "offNonmil" }, OFF_QUAL = { over: "offOver", about: "offAbout", upto: "offUpTo" };
const OFF_FLAG = { forward: "offForward", face_value: "offFace", no_eu_share: "offNoEu", refugees_federal: "offRefFed", committed: "offCommitted" };
export function officialText(c, x, o, F) {
  const r = o.official, l = o.l;
  if (!r || !x.data || x.ua < 0.0005 || !(r.figures || []).length) return "";
  const amt = f => { const v = I.CUR(l, f.value, r.currency); return f.qualifier ? D(l, OFF_QUAL[f.qualifier.replace(/\W/g, "")], { v }) : v; };
  const items = r.figures.map(f => D(l, OFF_KIND[f.kind], { v: amt(f) }));
  const list = items.length === 1 ? items[0] : items.reduce((a, b) => D(l, "offAnd", { a, b }));
  const flags = [...(r.flags || []), ...(r.figures.every(f => f.basis === "committed") ? ["committed"] : [])];
  const Nt = I.inSentence(l, c.name);
  const link = `<a href="${esc(r.source_url)}" rel="noopener">${esc(r.source_name)}</a>`;
  return [D(l, "offLead", { src: esc((r.publisher || {})[l] || r.publisher.en), list: esc(list), asOf: esc(I.dateL(r.as_of, l)) }),
    ...flags.map(k => D(l, OFF_FLAG[k])),
    D(l, "offOurs", { dataTo: esc(o.dataTo), Nt: esc(Nt), ua: F("e", "uaEur", x.ua) }, { eu: o.eu ? 1 : 0 }),
    D(l, "offSource", { link })].join(" ");
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
      case "gave": a = A("gave", { ua: F("m", "uaEur", x.ua), uaP: F("pm", "uaEur", x.ua), uaRange: esc(c.ua.range), dataTo: esc(o.dataTo), NtCap: esc(cap(Nt)) }, { tiny: Math.abs(x.uaPct) < 0.01 && Math.abs(x.ua) < 0.05, eu: x.eu }); break;
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

// ----- round 70 (owner: "made for experts with a lot of figures ... it should be understandable for the average Joe,
// with the breakdown and a clear structure, and mostly a visual structure"): the plain reading layer at the top of a
// country page. An answer card (one headline number, the overall verdict in the map's own words, one sentence of context,
// its ranks), "Where the number comes from" (a waterfall in HTML and CSS: the parts of support, then trade and frozen
// money, then the overall balance), "In plain words" (three sentences, each a condition on the data), and small bars by
// year and beside its neighbours in the ranking. Every figure is marked as the sections' are (check 48), every phrase is
// seo_i18n.mjs PLAIN (no number, the direction and chance words through placeholders), and nothing needs JavaScript.
// The colours are the chart images' (seo_images.mjs TONE, PART_TONE, FROZEN_TONE), as CSS classes (pages.css PLAIN_CSS)
const PX = (l, k, vars, nums) => I.plain(l, k, vars, nums);
const MAT0 = 0.0005;   // €0.5m: below it an amount is written "<€1m" and not drawn
// the verdict chip: the map's own words for the overall balance (its chance level and side)
export function verdictOf(c, x, words) {
  const w = words || {}, lv = x.level, side = x.side;
  if (x.party) return { text: w.party || "", cls: "mid" };
  if (lv === "sure") return { text: cap(x.sideWords || ""), cls: side === "russia" ? "neg" : "pos" };
  if (lv === "lean") return { text: side === "russia" ? w.leanR : w.leanU, cls: side === "russia" ? "fneg" : "fpos" };
  return { text: cap(lv === "unc" ? w.unc : lv === "near" ? w.near : w.zero || ""), cls: "mid" };
}
// the map's chance word for a level (very likely, likely, too close to call, near zero, essentially zero)
export const chanceWord = (w, lv) => (lv === "sure" ? w.sure : lv === "lean" ? w.lean : lv === "unc" ? w.unc : lv === "near" ? w.near : lv === "zero" ? w.zero : "") || "";
// which number the card leads with: what it gave Ukraine where the page asks that (seo_templates.mjs russiaLead) and its
// support is above zero, else the overall balance
export const leadOf = (x, russiaFirst) => (!russiaFirst && !x.party && x.ua >= MAT0 && !(Math.abs(x.uaPct) < 0.01 && Math.abs(x.ua) < 0.05) ? "ua" : "net");
// the support parts the page names (the rest is "other"), from the map's measures
export function supportParts(c, x) {
  const m = k => (c.measures && c.measures[k] && c.measures[k].v != null ? c.measures[k].v : 0);
  const aid = m("part:aid"), eu = m("part:euaid"), ref = m("part:ref");
  return { aid, eu, ref, other: x.ua - aid - eu - ref };
}

// o: { l, words, lead, gr (name forms: N Nt NtCap Na NaCap Nd plural fem neu), pp (€ per person, the map's), rankEur
// ({ n, of } by amount given, as the page of support by country numbers it), world (the map's rank), party (label) }
export function plainCard(c, x, o, F) {
  const l = o.l, v = verdictOf(c, x, o.words), gdpP = k => F("p", k, k === "uaEur" ? x.ua : x.netEur);
  const ua = o.lead === "ua";
  const pre = ua ? PX(l, "gavePre", o.gr, o.gr) : PX(l, "netPre", o.gr, o.gr);
  const post = ua ? PX(l, "gavePost", o.gr, o.gr) : PX(l, "netPost", { ...o.gr, side: esc(o.dirWords || x.sideWords) }, o.gr);
  const big = ua ? F("e", "uaEur", x.ua) : F("e", "netEur", x.netEur);
  const ctx = ua ? PX(l, "ctxGave", { pp: esc(o.pp || ""), p: gdpP("uaEur") }, { pp: o.pp ? 1 : 0 })
    : PX(l, "ctxNet", { pp: esc(o.pp || ""), p: gdpP("netEur") }, { pp: o.pp ? 1 : 0, frozen: Math.abs(x.frozen) >= MAT0 });
  const stats = [];
  if (ua && o.rankEur) stats.push(PX(l, "rankEur", { n: esc(String(o.rankEur.n)), of: esc(String(o.rankEur.of)) }));
  if (o.world) stats.push(PX(l, "rankNet", { n: F("k", "rank:all", o.world.n), of: F("k", "of:all", o.world.of), side: esc(x.sideWords) }));
  const cls = v.cls === "mid" ? "mid" : ua ? "pos" : v.cls;
  return `<section class="ans ${cls}" aria-label="${esc(PX(l, "tAnswer"))}">
<p class="vline"><span class="vlab">${esc(PX(l, "overall"))}:</span> <span class="vchip ${v.cls}">${esc(v.text)}</span></p>
<p class="apre">${esc(pre)}</p><p class="abig">${big}</p><p class="apost">${esc(post)}</p>
<p class="actx">${ctx}</p>${stats.length ? `\n<ul class="astats">${stats.map(s => `<li>${s}</li>`).join("")}</ul>` : ""}
</section>`;
}

// the waterfall: each step a row with its colour, plain label, bar (from the running total) and signed amount
export function breakdownHtml(c, x, o, F) {
  const l = o.l, sp = supportParts(c, x), fg = c.fig || {}, unc = q => { const i = fg[{ ua: "cU", rus: "cR", net: "cN" }[q]]; return !!(c[q] && c[q].unc) || !!(i && i.level && i.level !== "sure"); };
  const steps = [];
  const piece = (k, key, label, val, tone) => { if (Math.abs(val) >= MAT0) steps.push({ k, key, label, v: val, tone: val >= 0 ? tone : "back" }); };
  piece("aid", "part_aid", PX(l, "bkAid"), sp.aid, "aid");
  piece("eu", "part_euaid", PX(l, "bkEu"), sp.eu, "eu");
  piece("ref", "part_ref", PX(l, "bkRef"), sp.ref, "ref");
  piece("other", "", PX(l, "bkOther"), sp.other, "other");
  steps.push({ k: "ua", key: "uaEur", label: PX(l, "bkUa"), v: x.ua, total: true, tone: x.ua >= 0 ? (unc("ua") ? "uaF" : "ua") : unc("ua") ? "ruF" : "ru" });
  const rus = (c.fig || {}).rus || 0;
  steps.push({ k: "rus", key: "rusEur", label: PX(l, rus >= 0 ? "bkRusLess" : "bkRusMore"), v: rus, tone: rus >= 0 ? (unc("rus") ? "uaF" : "ua") : unc("rus") ? "ruF" : "ru" });
  if (Math.abs(x.frozen) >= MAT0) steps.push({ k: "frozen", key: "frozenEur", label: PX(l, "bkFrozen"), v: x.frozen, tone: x.frozen >= 0 ? "frozen" : "ru" });
  steps.push({ k: "net", key: "netEur", label: PX(l, "bkNet"), v: x.netEur, total: true, tone: x.party ? (x.netEur >= 0 ? "ua" : "ru") : x.netEur >= 0 ? (unc("net") ? "uaF" : "ua") : unc("net") ? "ruF" : "ru" });
  // the running total: pieces of support from zero up to the support total, then trade and frozen money from it
  let run = 0;
  for (const s of steps) {
    if (s.total) { s.a = 0; s.b = s.v; run = s.v; } else { s.a = run; s.b = run + s.v; run = s.b; }
  }
  const lo = Math.min(0, ...steps.flatMap(s => [s.a, s.b])), hi = Math.max(0, ...steps.flatMap(s => [s.a, s.b])), span = hi - lo || 1;
  const pc = v => Math.round(((v - lo) / span) * 1000) / 10;
  const amt = s => (s.key ? F("s", s.key, s.v) : esc((s.v >= 0 ? "+" : "−") + I.E(l, s.v)));
  const rows = steps.map(s => {
    const left = pc(Math.min(s.a, s.b)), width = Math.max(0.6, pc(Math.max(s.a, s.b)) - left);
    return `<li class="${s.total ? "wsum" : "wpc"} k-${s.k}"><span class="wl"><i class="sw t-${s.tone}" aria-hidden="true"></i>${esc(s.label)}</span><span class="wt" aria-hidden="true"><i class="z" style="left:${pc(0)}%"></i><i class="b t-${s.tone}" style="left:${left}%;width:${Math.round(width * 10) / 10}%"></i></span><span class="wv">${amt(s)}</span></li>`;
  });
  return `<section class="brk" aria-labelledby="where-from"><h2 id="where-from">${esc(PX(l, "tBreak"))}</h2>
<ol class="wf">${rows.join("")}</ol>
<p class="sub">${esc(PX(l, "bkKey"))} ${esc(PX(l, "bkHow"))}</p></section>`;
}

// round 70b (owner: the two dense paragraphs under the card repeated it in jargon): the page's opening, a short plain
// sentence pair under the card (Google's snippet): the headline figure the title asks for, then the other side of the
// balance; no share of GDP. Plain text, each amount written as the title and the card write it (one figure per concept)
export function plainIntro(c, x, o) {
  const l = o.l, w = o.words || {}, gr = o.gr, rus = (c.fig || {}).rus || 0, word = chanceWord(w, x.level);
  const tiny = Math.abs(x.uaPct) < 0.01 && Math.abs(x.ua) < 0.05;
  const v = { ...gr, ua: (x.ua < 0 && Math.abs(x.ua) >= MAT0 ? "−" : "") + I.E(l, x.ua), net: I.E(l, x.netEur), rus: I.E(l, rus), side: o.dirWords || x.sideWords, word };
  const n = { ...gr, word: word ? 1 : 0, less: rus >= 0 ? 1 : 0, uaPos: x.ua >= MAT0 && !tiny ? 1 : 0 };
  // round 72 (CTR report 4.1): where the page's description opens with its own sentence (o.first), the intro opens with it
  if (o.lead === "ua") return [o.first || PX(l, "introGave", v, n), PX(l, "introBal", v, n)].join(" ");
  const why = x.party && c.partyWhy ? [c.partyWhy] : [];
  if (o.first) return [o.first, ...why, Math.abs(rus) >= MAT0 ? PX(l, "introNet2", v, n) : ""].filter(Boolean).join(" ");
  return [...why, PX(l, "introNet", v, n), Math.abs(rus) >= MAT0 ? PX(l, "introNet2", v, n) : ""].filter(Boolean).join(" ");
}

// three sentences, each a condition on the data: what its support is made of (or that it is about nothing, or below
// zero), what its trade did to what Russia kept, and the overall balance in the map's words
export function plainBullets(c, x, o, F) {
  const l = o.l, w = o.words || {}, out = [], sp = supportParts(c, x);
  const tiny = Math.abs(x.uaPct) < 0.01 && Math.abs(x.ua) < 0.05;
  if (x.ua >= MAT0 && !tiny) {
    const named = [["aid", "pwAid", sp.aid], ["eu", "pwEu", sp.eu], ["ref", "pwRef", sp.ref]].filter(p => p[2] >= MAT0).sort((a, b) => b[2] - a[2]);
    const top = named[0], q = top ? top[2] / x.ua : 0;
    if (top && q >= 0.01 && q <= 1) out.push(PX(l, "piece", { q: esc(I.PI(l, 100 * q)), what: esc(PX(l, top[1])) }));
  } else if (tiny) out.push(PX(l, "uaSmall", { v: F("m", "uaEur", x.ua) }));
  else out.push(PX(l, "uaNeg", { v: F("m", "uaEur", x.ua), why: esc(o.uaWhy || "") }, { why: o.uaWhy ? 1 : 0 }));
  const rus = (c.fig || {}).rus || 0, rl = ((c.fig || {}).cR || {}).level;
  if (Math.abs(rus) >= MAT0) out.push(PX(l, rus >= 0 ? "rusLess" : "rusMore", { v: F("e", "rusEur", rus), Nd: esc(o.gr.Nd), word: esc(chanceWord(w, rl)) }, { word: chanceWord(w, rl) ? 1 : 0 }));
  if (!x.party && ["unc", "near", "zero"].includes(x.level)) out.push(PX(l, "netClose", { word: esc(chanceWord(w, x.level)) }));
  else out.push(PX(l, "netSide", { side: esc(o.dirWords || x.sideWords), word: esc(chanceWord(w, x.level)) }, { word: chanceWord(w, x.level) ? 1 : 0 }));
  return `<section class="pw" aria-labelledby="plain-words"><h2 id="plain-words">${esc(PX(l, "tPlain"))}</h2><ul class="pwl">${out.map(s => `<li>${s}</li>`).join("")}</ul></section>`;
}

// small bars, one per year, of the number the card leads with (a year's own amount: no range)
export function yearBars(c, x, o, F) {
  const l = o.l, q = o.lead === "ua" ? "ua" : "net", rows = (c.years || []).map(y => ({ y: y.y, ytd: y.ytd, v: q === "ua" ? y.uaBn : y.netBn }));
  if (!rows.length || rows.every(r => Math.abs(r.v) < MAT0)) return "";
  const lo = Math.min(0, ...rows.map(r => r.v)), hi = Math.max(0, ...rows.map(r => r.v)), span = hi - lo || 1, pc = v => Math.round(((v - lo) / span) * 1000) / 10;
  const li = rows.map(r => { const a = pc(Math.min(0, r.v)), wdt = Math.max(0.6, pc(Math.max(0, r.v)) - a), t = r.v >= 0 ? "ua" : "ru";
    return `<li><span class="yl">${r.y}${r.ytd ? "*" : ""}</span><span class="wt" aria-hidden="true"><i class="z" style="left:${pc(0)}%"></i><i class="b t-${t}" style="left:${a}%;width:${Math.round(wdt * 10) / 10}%"></i></span><span class="wv">${F("s", `y${r.y}:${q}`, r.v)}</span></li>`; }).join("");
  return `<p class="sub">${esc(PX(l, q === "ua" ? "yearsUa" : "yearsNet"))}</p><ol class="yb">${li}</ol>${rows.some(r => r.ytd) && o.yearNote ? `<p class="sub">${esc(o.yearNote)}</p>` : ""}`;
}

// its neighbours in the map's ranking as small bars (rows: { name, href, here, rank, pct, value, sure, sub })
export function compareBars(l, rows) {
  if (!rows.length) return "";
  const lo = Math.min(0, ...rows.map(r => r.pct)), hi = Math.max(0, ...rows.map(r => r.pct)), span = hi - lo || 1, pc = v => Math.round(((v - lo) / span) * 1000) / 10;
  return `<ol class="cmp">${rows.map(r => { const a = pc(Math.min(0, r.pct)), wdt = Math.max(0.6, pc(Math.max(0, r.pct)) - a), t = (r.pct >= 0 ? "ua" : "ru") + (r.sure ? "" : "F");
    return `<li${r.here ? ' class="here"' : ""}><span class="cn"><span class="r">${r.rank ? r.rank + "." : ""}</span>${r.here ? esc(r.name) : `<a href="${r.href}">${esc(r.name)}</a>`}</span><span class="wt" aria-hidden="true"><i class="z" style="left:${pc(0)}%"></i><i class="b t-${t}" style="left:${a}%;width:${Math.round(wdt * 10) / 10}%"></i></span><span class="wv">${esc(r.value)}</span><span class="cs">${esc(r.sub)}</span></li>`; }).join("")}</ol>`;
}

// the plain layer's look (written into pages.css by seo_pages.mjs): readable type, mobile first, the chart images' tones
const TONES = { aid: ["#0b3d77", "#4a86cf"], eu: ["#1a62c4", "#6aa3e6"], ref: ["#3a8bd0", "#9cc8ef"], other: ["#6d8193", "#8fa1b0"], ua: ["#2a6fb0", "#6aa8e0"], uaF: ["#5c8cbd", "#7d9fc2"],
  ru: ["#d4601a", "#f39a52"], ruF: ["#cc7a40", "#c99063"], frozen: ["#1d5689", "#5a92c8"] };
const toneCss = i => Object.entries(TONES).map(([k, v]) => `.t-${k}{background:${v[i]}}`).join("");
export const PLAIN_CSS = `
main.plain{font-size:17.5px;line-height:1.6}main.plain .intro{font-size:18.5px}main.plain p.sub{font-size:15px}
main.plain>h2,main.plain>section>h2,main.plain>section>div>h2{font:800 22px/1.25 var(--fd);letter-spacing:-.005em;text-transform:none;color:var(--ink);margin:40px 0 12px}
.ans{background:var(--surface);border:1px solid var(--line);border-top:6px solid var(--mid);border-radius:14px;padding:16px 18px 18px;margin:14px 0 20px}
.ans.pos{border-top-color:var(--ukr)}.ans.neg{border-top-color:var(--rus)}.ans.fpos{border-top-color:color-mix(in srgb,var(--ukr) 55%,var(--mid))}.ans.fneg{border-top-color:color-mix(in srgb,var(--rus) 55%,var(--mid))}
.ans p{margin:0}.vline{font-size:15px;color:var(--soft);margin-bottom:12px!important}.vlab{font-weight:600;margin-right:2px}
.vchip{display:inline-block;font-weight:800;font-size:15.5px;line-height:1.3;border-radius:999px;padding:3px 13px;background:var(--line);color:var(--ink)}
.vchip.pos{background:var(--ukr-lo);color:var(--ukr)}.vchip.neg{background:var(--rus-lo);color:var(--rus-t)}.vchip.fpos{background:transparent;color:var(--ukr);box-shadow:inset 0 0 0 2px var(--ukr-lo)}.vchip.fneg{background:transparent;color:var(--rus-t);box-shadow:inset 0 0 0 2px var(--rus-lo)}
.apre,.apost{font-weight:700;font-size:19px;line-height:1.3}.abig{font:800 clamp(46px,13vw,70px)/1.04 var(--fd);letter-spacing:-.03em;margin:4px 0 2px!important;color:var(--soft)}
.ans.pos .abig{color:var(--ukr)}.ans.neg .abig{color:var(--rus-t)}.ans.fpos .abig{color:color-mix(in srgb,var(--ukr) 65%,var(--soft))}.ans.fneg .abig{color:color-mix(in srgb,var(--rus-t) 65%,var(--soft))}
.actx{margin-top:12px!important;font-size:17.5px}.astats{list-style:none;padding:0;margin:14px 0 0;display:flex;flex-wrap:wrap;gap:8px}
.astats li{background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:5px 12px;font-size:15px;font-weight:600;line-height:1.35}
ol.wf,ol.yb,ol.cmp{list-style:none;padding:0;margin:10px 0 12px}
ol.wf li,ol.cmp li{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"l v" "t t";gap:5px 12px;padding:10px 0;border-bottom:1px solid var(--line);align-items:center}
ol.wf .wl,ol.cmp .cn{grid-area:l;display:flex;gap:9px;align-items:center;line-height:1.3}.wv{grid-area:v;font-weight:700;white-space:nowrap;text-align:right}
.wt{grid-area:t;position:relative;height:14px;display:block}.wt .b{position:absolute;top:0;bottom:0;border-radius:3px;display:block}.wt .z{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;background:var(--soft);opacity:.55;display:block}
ol.wf li.wsum{font-weight:700;border-top:2px solid var(--ink);margin-top:-1px}ol.wf li.wsum .wt{height:22px}ol.wf li.wsum .wv{font-size:18px}ol.wf li.k-net{border-bottom:2px solid var(--ink)}ol.wf li.k-net .wv{font-size:19px}
.sw{display:inline-block;width:15px;height:15px;border-radius:4px;flex:none}
.t-back{background:repeating-linear-gradient(135deg,var(--mid) 0 3px,transparent 3px 7px);box-shadow:inset 0 0 0 1.5px var(--soft)}
${toneCss(0)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${toneCss(1).replace(/\}\./g, "}:root:not([data-theme=\"light\"]) .")}}
${toneCss(1).replace(/^\./, ':root[data-theme="dark"] .').replace(/\}\./g, '}:root[data-theme="dark"] .')}
ol.yb li{display:grid;grid-template-columns:3.6em minmax(0,1fr) 6.8em;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid var(--line)}ol.yb .yl{font-weight:600}ol.yb .wt,ol.yb .wv{grid-area:auto}
ol.cmp li{grid-template-areas:"l v" "t t" "s s";padding:8px 0}ol.cmp .cs{grid-area:s;font-size:14px;color:var(--soft);line-height:1.35}ol.cmp .r{color:var(--soft);font-size:14px;min-width:2.2em}
ol.cmp li.here{font-weight:700;background:var(--surface);margin:0 -8px;padding:8px}
ul.pwl{list-style:none;padding:0;margin:8px 0 6px}ul.pwl li{position:relative;padding:0 0 0 30px;margin:0 0 12px;font-size:18px;line-height:1.5}
ul.pwl li::before{content:"";position:absolute;left:4px;top:.42em;width:12px;height:12px;border-radius:50%;background:var(--ukr);box-shadow:0 0 0 4px var(--ukr-lo)}
.t-grey{background:#6d8193}.pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px;margin:14px 0 20px}.pair .ans{margin:0}.pair .abig{font-size:clamp(38px,10vw,52px)}
ol.hb{list-style:none;padding:0;margin:10px 0 12px}ol.hb li{display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-areas:"l v" "t t" "s s";gap:4px 12px;padding:8px 0;border-bottom:1px solid var(--line);align-items:center}
ol.hb .cn{grid-area:l;font-weight:600}ol.hb .ht{grid-area:t;display:block;height:16px}ol.hb .hs{position:relative;display:flex;height:100%;min-width:3px;border-radius:3px;overflow:hidden}ol.hb .hs i{display:block;height:100%}ol.hb .hb-back{position:absolute;top:0}
ol.hb .cs{grid-area:s;font-size:14px;color:var(--soft)}.lg{display:inline-flex;align-items:center;gap:6px;margin-right:12px;white-space:nowrap}
details.experts{margin:40px 0 10px;border:2px solid var(--line);border-radius:12px;padding:0 16px;background:var(--surface)}
details.experts>summary{cursor:pointer;list-style:none;display:flex;align-items:center;gap:12px}details.experts>summary::-webkit-details-marker{display:none}
details.experts>summary h2{flex:1;font:800 19px/1.3 var(--fd);text-transform:none;letter-spacing:0;color:var(--ink);margin:16px 0}
details.experts>summary::after{content:"+";font:800 26px/1 var(--fd);color:var(--soft)}details.experts[open]>summary::after{content:"\\2212"}details.experts>summary:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
details.experts[open]{padding-bottom:14px}details.experts .card,details.experts .tile{background:var(--bg)}
@media (min-width:640px){ol.hb li{grid-template-columns:minmax(0,11em) minmax(0,1fr) 6.4em;grid-template-areas:"l t v" "s s s"}ol.wf li{grid-template-columns:minmax(0,17em) minmax(0,1fr) 7.6em;grid-template-areas:"l t v"}ol.cmp li{grid-template-columns:minmax(0,13em) minmax(0,1fr) 5.6em;grid-template-areas:"l t v" "s s s"}
.ans{padding:20px 26px 22px}}`;
