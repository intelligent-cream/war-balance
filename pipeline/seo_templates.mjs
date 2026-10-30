// Round 54 (findable pages): the titles, descriptions, headings, intros and short FAQs of the static pages, filled with
// the live figures from the map (seo_extract.mjs). Titles are at most 60 characters and descriptions at most 155: each
// phrase lists shorter forms, the first that fits is used, and the last is always short (checked by check_data.py).
//
// Pure functions (no browser): pipeline/test_seo.mjs tests them.
//
// Round 56 (more findable pages): every country has a page in every language, for every chance level, and an English
// title asks "Does ... trade with Russia?" where people search for that far more than for its aid (seo_demand.json).
//
// Round 57 (owner: "very little to maintain"): this file holds no words of its own. Every phrase is in the one
// translation table, pipeline/seo_i18n.mjs, in all seven languages; here the country page's template picks the phrase
// for the country's chance level and fills it with the map's figures, names and words (the hand-written titles of the
// ten most searched countries and the per-country English overrides of round 54 are folded into these rules). The
// rule that asks about trade instead of aid is in pipeline/seo_families.json (country.tradeFirst).
//
// Round 59 (owner approved: "titles in the words people search"): the title and heading may instead ask the question
// people search in the page's language ("How much has Canada given to Ukraine?", "Does Belarus support Russia?",
// "Combien la France a donné à l'Ukraine ?"), by the volumes in seo_demand.json ask and the rule in seo_families.json
// (country.phrasing); askOf below, the phrases in seo_i18n.mjs ASK.

import { P as PL, E as EL, L as LL, cap, list3, inSentence, inList, countryText, homeText, staticText, fit, askText, semi, grammar, countryIncl, countryLine, docDesc } from "./seo_i18n.mjs";

export const TITLE_MAX = 60, DESC_MAX = 155;
export const LANGS = ["en", "uk", "de", "fr", "pl", "nl", "es"];
export const OG_LOCALE = { en: "en_GB", uk: "uk_UA", de: "de_DE", fr: "fr_FR", pl: "pl_PL", nl: "nl_NL", es: "es_ES" };
export const LANG_NAMES = { en: "English", uk: "Українська", de: "Deutsch", fr: "Français", pl: "Polski", nl: "Nederlands", es: "Español" };
export const L = LL;
export { fit };

// ----- numbers as the English copy writes them -----
export const P = x => PL("en", x);
export const E = bn => EL("en", bn).replace(/ /g, " ");
export const CH = p => (p >= 0.995 ? ">99%" : Math.floor(p * 100) + "%");
const lc = s => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const EU = new Set("AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split(" "));
// round 56's rule, in seo_families.json (country.tradeFirst): ask whether it trades with Russia where people search for that
// at least this often, this many times more than for its aid or help, and its aid is searched for less than this
export const TRADE_FIRST = { minTrade: 400, ratio: 1.5, maxAid: 800 };
// round 59's rule, in seo_families.json (country.phrasing): the phrasing people search in the page's language
export const PHRASING = { minDemand: 50, minTrade: 100 };
const HELP_CATS = new Set(["u_sure", "u_net", "r_sure", "u_lean", "r_lean", "unc", "zero", "party"]);
// the chance level's key in seo_i18n.mjs ASK (tHelp, h1Help): both leaning sides are "lean"; round 63: a net very likely
// toward Ukraine without support above zero (u_net) answers the Russia question as u_sure does
const askCat = cat => (cat === "u_lean" || cat === "r_lean" ? "lean" : cat === "u_net" ? "u_sure" : cat);

// Round 59 (owner approved: "titles in the words people search"): which of a country page's phrasings the searches in
// its language ask for (seo_demand.json ask: Google's monthly volumes). cat: the page's copy category (after the trade
// rule). { title: "given" | "support" | "helping" | null (the chance level's own), verb: the question about Russia's
// verb, given: the question about what it gave in the searched form, trade: its trade section named as a pair }
export function askOf(l, cat, dm, R = PHRASING) {
  const A = (((dm || {}).ask || {})[l]) || {}, n = k => A[k] || 0, min = R.minDemand ?? Infinity;
  // round 59b (owner: "Does X support Russia?" only where it is actually searched): no default verb, and the verb's own
  // phrasing must be searched at least minDemand times (not the two phrasings added up)
  const given = n("given"), help = n("support") + n("helping"), best = n("support") >= n("helping") ? "support" : "helping";
  const verb = n(best) >= min ? best : "";
  let title = null;
  if (cat === "u_sure" && given >= min && given >= help) title = "given";
  else if (HELP_CATS.has(cat) && verb && help >= given) title = verb;
  return { title, verb, given: title === "given", trade: n("trade") >= (R.minTrade ?? Infinity) };
}

// the copy's category: very likely toward Ukraine or Russia, leaning, too close to call, near or essentially zero, a party
export function category(f) {
  if (f.noData || !f.cN) return "nodata";
  if (f.party) return "party";
  const l = f.cN && f.cN.level;
  if (l === "sure") return f.cN.side === "ukraine" ? "u_sure" : "r_sure";
  if (l === "lean") return f.cN.side === "ukraine" ? "u_lean" : "r_lean";
  if (l === "unc") return "unc";
  return "zero";
}

// f: the figures of one country (seo_extract.mjs: fig plus iso, name, armedFull, demand), with, from seo_pages.mjs:
// nameL (its name in the page's language, the map's), words (the map's chance words in it) and loc (the country as the
// map has it in that language: its range, chance and sentences). € in billions, % of one year's GDP.
export function countryCopy(l, f) {
  let cat = category(f);
  const loc = f.loc || {}, net = loc.net || {}, w = f.words || {}, cN = (loc.fig && loc.fig.cN) || f.cN || {}, cR = f.cR || { level: "sure" };
  const N = f.nameL || f.name, Nt = inSentence(l, N), side = cN.side === "russia";
  const lean = side ? w.leanR : w.leanU, zero = cN.level === "near" ? w.near : w.zero;
  // round 60: support for Ukraine can be below zero (it bought less from Ukraine than without the war, or earned more from
  // the war effort than it gave): the amount then carries its sign
  const neg = x => (x < 0 && Math.abs(x) >= 0.0005 ? "−" : ""), negP = x => (x < 0 && Math.abs(x) >= 0.01 ? "−" : "");
  const v = { N, Nt, NCap: cap(N), NtCap: cap(Nt), ua: f.cN ? neg(f.ua) + EL(l, f.ua) : "", uaP: f.cN ? negP(f.uaPct) + PL(l, f.uaPct) : "", netP: f.cN ? PL(l, f.netPct) : "", rus: f.cN ? EL(l, f.rus) : "", rusP: f.cN ? PL(l, f.rusPct) : "",
    // round 60 (audit: Togo "The net is 0.46% toward Ukraine" for −0.46%): direction words follow the middle value's sign
    // (dirWords); a chance names the side it is the chance of (chDir: the simulation's side)
    ch: f.cN ? CH(f.cN.p) : "", netDir: cN.dirWords || cN.sideWords || "", chDir: cN.sideWords || "", sureWord: w.sure || "", sureWordCap: cap(w.sure || ""), leanWord: lean || "", leanWordLc: lc(lean || ""),
    uncWord: w.unc || "", uncWordCap: cap(w.unc || ""), zeroWord: zero || "", zeroWordCap: cap(zero || ""), partyWord: w.party || "", partyWordLc: lc(w.party || ""),
    dirWords: cN.level === "sure" ? cN.sideWords || "" : lc(lean || ""), netRange: net.range || "", netWords: [net.range, net.chance].filter(Boolean).join(semi(l)),
    kept: loc.kept || "", keptCap: cap(loc.kept || ""), uaVerb: loc.uaVerb || "", uaEur: (loc.ua && loc.ua.eur) || "", netSigned: net.signed || "", partyWhy: loc.partyWhy || "",
    armedEur: EL(l, f.armedFull || 0), frozenEur: EL(l, f.frozen || 0), noDataText: LL(l, "noDataText") };
  const nums = { rusX: f.rus || 0, eu: EU.has(f.iso), armed: (f.armedFull || 0) > 0.5, frozen: Math.abs(f.frozen || 0) >= 0.05, mostly: !!f.mostly };
  // round 61 (CTR): the answer first. The total it gave, what it holds beyond its own aid (its share of EU aid, the cost
  // of hosting refugees: the map's parts, f.parts), and the Kiel Institute's bilateral figure where the data have one
  const pt = f.parts || {}, uaPos = !!f.cN && (f.ua || 0) >= 0.0005, has = x => uaPos && (x || 0) >= 0.0005;
  const g = grammar(l, N);
  // round 63: the name after the language's "with" ({Nd}: "mit den Vereinigten Staaten", "met de Verenigde Staten"), and
  // the map's chance words for the net in a parenthesis ({chanceP}: " (very likely, >99%)", nothing where there are none)
  const chW = String(net.chance || "").replace(/ · /g, ", ");
  Object.assign(v, { Nd: inList(l, N), chanceP: chW ? ` (${chW})` : "", Na: g.Na, NaCap: cap(g.Na), euEur: EL(l, pt.eu || 0), refEur: EL(l, pt.ref || 0), kielEur: pt.kiel != null ? EL(l, pt.kiel) : "" });
  Object.assign(nums, { uaPos, euX: has(pt.eu), refX: has(pt.ref), aidX: has(pt.aid), kiel: pt.kiel != null && pt.kiel >= 0.0005, plural: g.plural, fem: g.fem, neu: g.neu });
  nums.nX = (nums.euX ? 1 : 0) + (nums.refX ? 1 : 0);
  v.xLong = countryIncl(l, "incl", v, nums); v.xShort = countryIncl(l, "inclS", v, nums);
  // round 56: where searches ask far more whether it trades with Russia than what it gave (seo_demand.json), and both
  // numbers are very likely, the English title asks that and answers it with what Russia kept
  const dm = f.demand || {}, R = f.tradeFirst || TRADE_FIRST;
  // round 63 (audit: Nigeria "How much has Nigeria given to Ukraine? −€50m"): the question about what it gave is the
  // title only where its support is above zero; a net very likely toward Ukraine without it asks "Ukraine or Russia?"
  if (cat === "u_sure" && !uaPos) cat = "u_net";
  if (l === "en" && cat === "u_sure" && cR.level === "sure" && (dm.trade || 0) >= R.minTrade && dm.trade >= R.ratio * Math.max(dm.aid || 0, dm.help || 0) && (dm.aid || 0) < R.maxAid) cat = "u_trade";
  let c = countryText(l, cat, v, nums);
  // round 59: the phrasing people search in this language (seo_families.json country.phrasing), where the data answer it
  const ask = askOf(l, cat, dm, f.phrasing || PHRASING);
  if (ask.title) c = { ...c, ...askText(l, ask.title, askCat(cat), v, nums, c.title) };
  // round 63 (audit: "Does China support Russia?" opened with "Bought less from Ukraine than without the war"): a page
  // whose title asks the Russia question answers it first: what Russia kept from trade with it and the net, with its
  // direction and the map's chance words, as its description does; then the support sentence. Only a page whose title
  // asks what it gave (and whose support is above zero) opens with that
  const russiaFirst = russiaLead(cat, ask, uaPos);
  if (russiaFirst) {
    c = { ...c, intro: [countryLine(l, "introRu", v, nums), c.intro].filter(Boolean).join(" "), intro2: countryLine(l, "intro2Ru", v, nums) };
  }
  const out = { ...c, intro: c.intro || (cat === "nodata" ? v.noDataText : ""), category: category(f), ask, russiaFirst };
  out.og_title = out.title; out.og_description = out.description;
  return out;
}

// round 63: whether a country page opens with the answer to the Russia question (its trade with Russia and the net) rather
// than with its support for Ukraine: every page with figures (not a party to the war, not without data) except one whose
// title asks what it gave Ukraine (the chance level u_sure, or the searched phrasing "given") with support above zero
export function russiaLead(cat, ask, uaPos) {
  if (cat === "party" || cat === "nodata") return false;
  const givenTitle = (cat === "u_sure" && !(ask && (ask.title === "support" || ask.title === "helping"))) || !!(ask && ask.title === "given");
  return !(uaPos && givenTitle);
}

// the countries with a page in every language: every country (round 56)
export function countryLangs() {
  return LANGS;
}

// ----- round 57b: the country page's questions are seo_country.mjs's (a pool of questions, each with its data
// condition and score), in every language -----

// ----- the home page in every language, and the English static pages. n: countries ranked -----
export function homeCopy(l, n, dataTo = "") {
  const H = homeText(l, n, dataTo);
  return { ...H, og_title: H.title, og_description: H.description };
}
// facts: { n, topUa: [names], topRu: [names], parties: [names], euroTop: [[name, bn]x2], shareTop: [names], ruMore: [[name, bn]x2], ruLess: [name, bn] }
// round 61: and euroTop3 ([[name, bn]x3]), y1 (the data's last year) and dataTo; l the page's language (the page of support
// by country is in every language: its names and figures in that language)
export function staticCopy(page, x, l = "en") {
  const ls = a => list3(l, a), E1 = b => (l === "en" ? E(b) : EL(l, b));
  const v = { n: x.n, topUa: ls(x.topUa || []), topRu: ls(x.topRu || []), parties: ls(x.parties || []), euroTop: ls((x.euroTop || []).map(([n, b]) => `${n} (${E1(b)})`)),
    euroTop3: ls((x.euroTop3 || x.euroTop || []).map(([n, b]) => `${n} (${E1(b)})`)), shareTop: ls(x.shareTop || []), y1: x.y1 || "", dataTo: x.dataTo || "" };
  const nums = { nParty: (x.parties || []).length };
  const r = [...(x.ruMore || []), ...(x.ruLess ? [x.ruLess] : [])];
  r.forEach(([n, b], i) => { v["n" + (i + 1)] = n; v["e" + (i + 1)] = E1(b); nums["x" + (i + 1)] = b; });
  const T = staticText(page, v, nums, l);
  return { ...T, og_title: T.title, og_description: T.description };
}

// a document page (a method page, the limitations, the changelog): its title from its heading; its description the
// first sentences of its first paragraph, or (round 63) its own where seo_i18n.mjs DOC_DESC has one (key: its address
// without slashes, "method/reading")
export function docCopy(heading, firstPara, key = "") {
  const clean = s => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  const h = clean(heading), p = clean(firstPara || "");
  const title = fit([`${h} | ${LL("en", "methodSuffix")}`, `${h} | War Balance`, h, h.slice(0, TITLE_MAX - 1).replace(/\s+\S*$/, "") + "…"], TITLE_MAX);
  const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
  let description = "";
  for (const s of sentences) { if ((description + s).trim().length > DESC_MAX) break; description = (description + s).trim(); }
  if (!description) description = p.slice(0, DESC_MAX - 1).replace(/\s+\S*$/, "") + "…";
  if (docDesc(key)) description = docDesc(key);
  return { title, description, h1: h, og_title: title, og_description: description };
}

// this file's phrases for the wording guard: none (round 57: they are all in seo_i18n.mjs)
export const phraseList = () => [];
