// Round 54 (findable pages): tests of the static pages' copy (seo_templates.mjs) and of the country slugs (index.html).
//   - the templates give the approved copy (seo_plan, 26 October 2026) for figures of the current build;
//   - every title stays within 60 characters and every description within 155, for every category and long names;
//   - the slugs are unique, plain and stable.
// Run: node --test pipeline/test_seo.mjs

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as T from "./seo_templates.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// figures of five countries as the map gave them (round 52 data), with what the approved copy says for them
const FX = {"DEU": {"net": 152.586452, "netLo": 110.001732, "netHi": 208.69428, "ua": 74.665985, "uaLo": 66.894458, "uaHi": 97.502093, "rus": 72.626997, "rusLo": 30.785978, "rusHi": 123.867238, "frozen": 5.29347, "netPct": 3.651077, "netLoPct": 2.632113, "netHiPct": 4.99362, "uaPct": 1.786602, "rusPct": 1.737813, "frozenPct": 0.126662, "paidRussia": 69.31617, "cN": {"level": "sure", "p": 0.9999999983704664, "side": "ukraine", "pct": ">99%", "sideWords": "toward Ukraine"}, "cU": {"level": "sure", "p": 1, "side": "ukraine", "pct": ">99%", "sideWords": "above zero"}, "cR": {"level": "sure", "p": 0.9980676168634317, "side": "ukraine", "pct": ">99%", "sideWords": "toward Ukraine"}, "iso": "DEU", "name": "Germany", "party": false, "armedFull": 0}, "SVK": {"net": 0.168944, "netLo": -4.912093, "netHi": 5.695532, "ua": 0.948305, "uaLo": 0.491138, "uaHi": 1.619087, "rus": -0.911641, "rusLo": -5.971931, "rusHi": 4.574044, "frozen": 0.13228, "netPct": 0.139353, "netLoPct": -4.051712, "netHiPct": 4.697927, "uaPct": 0.782204, "rusPct": -0.751962, "frozenPct": 0.10911, "paidRussia": 14.44335, "cN": {"level": "unc", "p": 0.575, "side": "ukraine", "pct": "57%", "sideWords": "toward Ukraine"}, "cU": {"level": "sure", "p": 0.9997388125000701, "side": "ukraine", "pct": ">99%", "sideWords": "above zero"}, "cR": {"level": "unc", "p": 0.5880000000000001, "side": "russia", "pct": "58%", "sideWords": "toward Russia"}, "iso": "SVK", "name": "Slovakia", "party": false, "armedFull": 0}, "HUN": {"net": -11.403334, "netLo": -18.599457, "netHi": -1.38342, "ua": 0.670354, "uaLo": 0.485758, "uaHi": 0.995372, "rus": -12.272198, "rusLo": -19.465735, "rusHi": -2.257611, "frozen": 0.19851, "netPct": -5.991349, "netLoPct": -9.772215, "netHiPct": -0.726854, "uaPct": 0.352206, "rusPct": -6.447853, "frozenPct": 0.104298, "paidRussia": 30.6162, "cN": {"level": "sure", "p": 0.97, "side": "russia", "pct": "97%", "sideWords": "toward Russia"}, "cU": {"level": "sure", "p": 0.9999999991573219, "side": "ukraine", "pct": ">99%", "sideWords": "above zero"}, "cR": {"level": "sure", "p": 0.971, "side": "russia", "pct": "97%", "sideWords": "toward Russia"}, "iso": "HUN", "name": "Hungary", "party": false, "armedFull": 0}, "BLR": {"net": -2.517572, "netLo": -9.280928, "netHi": 5.130518, "ua": 0, "uaLo": 0, "uaHi": 0, "rus": -2.517572, "rusLo": -9.280928, "rusHi": 5.130518, "frozen": 0, "netPct": -3.601677, "netLoPct": -13.277437, "netHiPct": 7.339797, "uaPct": 0, "rusPct": -3.601677, "frozenPct": 0, "paidRussia": 109.525, "cN": {"level": "lean", "p": 0.775, "side": "russia", "pct": "77%", "sideWords": "toward Russia"}, "cU": {"level": "zero", "p": 0.5, "side": "ukraine", "pct": "50%", "sideWords": "above zero"}, "cR": {"level": "lean", "p": 0.775, "side": "russia", "pct": "77%", "sideWords": "toward Russia"}, "iso": "BLR", "name": "Belarus", "party": true, "armedFull": 1.2725}, "AUS": {"net": -0.604227, "netLo": -1.423452, "netHi": 0.550267, "ua": 1.289895, "uaLo": 0.998386, "uaHi": 2.118225, "rus": -1.909523, "rusLo": -2.675068, "rusHi": -1.108664, "frozen": 0.0154, "netPct": -0.037471, "netLoPct": -0.088274, "netHiPct": 0.034124, "uaPct": 0.079992, "rusPct": -0.118418, "frozenPct": 0.000955, "paidRussia": 6.92175, "cN": {"level": "zero", "p": 0.7090000000000001, "side": "russia", "pct": "70%", "sideWords": "toward Russia"}, "cU": {"level": "sure", "p": 0.9999999999999117, "side": "ukraine", "pct": ">99%", "sideWords": "above zero"}, "cR": {"level": "sure", "p": 0.9999551286473811, "side": "russia", "pct": ">99%", "sideWords": "toward Russia"}, "iso": "AUS", "name": "Australia", "party": false, "armedFull": 0}};

// the map's chance words (seo_extract.mjs words), in English and German
const W = { leanU: "Leaning toward Ukraine", leanR: "Leaning toward Russia", near: "near zero", zero: "essentially zero", unc: "too close to call", party: "Party to the war", sure: "very likely", lean: "likely", uncLean: "slightly more likely {side} ({p} chance)" };
const W_DE = { leanU: "Tendenz Richtung Ukraine", leanR: "Tendenz Richtung Russland", near: "nahe null", zero: "praktisch null", unc: "zu knapp für eine Aussage", party: "Kriegspartei", sure: "sehr wahrscheinlich", lean: "wahrscheinlich", uncLean: "etwas wahrscheinlicher {side} (Wahrscheinlichkeit {p})" };
const en = f => T.countryCopy("en", { ...f, words: W });

test("the templates give the copy of the one country template", () => {
  assert.equal(en(FX.DEU).title, "How much has Germany given to Ukraine? €74.7bn since 2022");
  // round 57: every chance and direction word is the map's ({sureWord}, {netDir})
  // round 61 (CTR): the answer first; without the parts in the data, the total alone
  assert.equal(en(FX.DEU).description, "Germany has given Ukraine €74.7bn since 2022 (1.8% of GDP).");
  assert.equal(en(FX.SVK).title, "Does Slovakia support Ukraine or Russia? Too close to call");
  // round 59b: without searches for the question about Russia, a page keeps its chance level's own title ("Does X support
  // Russia?" only where it is searched: seo_families.json has no default verb any more)
  assert.equal(en(FX.HUN).title, "Is Hungary helping Russia? 6.0% of GDP toward Russia");
  assert.equal(en(FX.BLR).title, "Is Belarus helping Russia? Party to the war, 3.6% of GDP");
  // round 57: Australia's hand-written override is gone; it has the title of its chance level
  // round 65 (SEO audit, fix 3d): the question its heading asks, where it fits in 60 characters
  assert.equal(en(FX.AUS).title, "Does Australia support Russia or Ukraine? Essentially zero");
  // round 57: the ten most searched countries use the same template as every other country (their names the map's)
  assert.equal(T.countryCopy("de", { ...FX.DEU, nameL: "Deutschland", words: W_DE }).title, "Deutschland: Wie viel Hilfe für die Ukraine? 74,7\u00a0Mrd.\u00a0€");
  assert.equal(T.countryCopy("pl", { ...FX.HUN, nameL: "Węgry", words: W_DE }).h1, "Węgry: czy ten kraj pomaga Rosji? Co pokazują przepływy pieniędzy");
  // round 56's rule, from seo_families.json: a country whose trade is searched far more than its aid is asked about trade
  const rule = JSON.parse(readFileSync(join(HERE, "seo_families.json"), "utf8")).country.tradeFirst;
  assert.match(en({ ...FX.DEU, iso: "XXA", name: "Testland", demand: { trade: 5000, aid: 300 }, tradeFirst: rule }).title, /^Does Testland trade with Russia\? Russia kept €72.6bn less$/);
  assert.match(en({ ...FX.DEU, demand: { trade: 6342, aid: 3230 }, tradeFirst: rule }).title, /^How much has Germany/);
  assert.deepEqual(T.countryLangs(FX.DEU), T.LANGS);
  // round 56: every country has a page in every language
  assert.deepEqual(T.countryLangs(FX.SVK), T.LANGS);
});

// round 61 (CTR): the first paragraph and the description answer first: the total, what it holds beyond its own aid
// (the EU share, refugee hosting: only where the data have them) and the Kiel Institute's bilateral figure where it has one
test("round 61: the country page answers first, with the parts beyond its own aid and Kiel's figure from the data", () => {
  const fra = { ...FX.DEU, iso: "FRA", name: "France", ua: 16.87, uaPct: 0.6, parts: { aid: 4.26, eu: 9.82, ref: 1.8, kiel: 7.91 } };
  const c = en(fra);
  assert.equal(c.intro, "France has given Ukraine €16.9bn since 2022 (0.60% of GDP). Beyond its own aid, that total includes its share of EU aid (€9.8bn) and the cost of hosting refugees (€1.8bn). The Kiel Institute counts €7.9bn in bilateral aid.");
  assert.match(c.description, /^France has given Ukraine €16\.9bn since 2022 \(0\.60% of GDP\), including €9\.8bn as its EU share and €1\.8bn for refugees\. Kiel/);
  assert.doesNotMatch(c.intro + c.description, /one year's GDP|very likely|\+/);
  // no Kiel figure and no EU share in the data: neither is named
  const nor = en({ ...fra, name: "Norway", parts: { aid: 8.4, ref: 4.4, kiel: null } });
  assert.doesNotMatch(nor.intro + nor.description, /Kiel|EU/);
  assert.match(nor.intro, /includes the cost of hosting refugees \(€4\.4bn\)\.$/);
  // support below zero: no "has given"
  assert.doesNotMatch(en({ ...fra, ua: -0.2, parts: {} }).intro, /has given/);
  // every language: the answer first, Kiel's figure where the data have it, within the lengths
  for (const l of T.LANGS) {
    const x = T.countryCopy(l, { ...fra, nameL: "France", words: W_DE });
    assert.ok(x.title.length <= T.TITLE_MAX && x.description.length <= T.DESC_MAX, l + " " + x.description);
    assert.ok(/16[,.]9|16\.900/.test(x.intro.slice(0, 80)) && /Kiel|Kiloń|Кіль/.test(x.intro), l + " " + x.intro);
    assert.ok(!/\{|undefined/.test(x.intro + x.intro2 + x.description), l);
  }
  // the searched verb: "¿Cuánto dinero ha dado ...?", "Does ... support Russia or Ukraine?"
  assert.match(T.countryCopy("es", { ...fra, nameL: "Francia", words: W_DE }).title, /^¿Cuánto dinero ha dado Francia a Ucrania\?/);
  assert.match(en({ ...FX.AUS, name: "Albania" }).title, /^Does Albania support Russia or Ukraine\?/);
});

test("a title's chance word follows the category", () => {
  const unc = { ...FX.DEU, iso: "XXA", name: "Testland", cN: { level: "unc", p: 0.55, side: "ukraine", sideWords: "toward Ukraine" } };
  assert.match(en(unc).title, /Too close to call/);
  const lean = { ...unc, cN: { level: "lean", p: 0.8, side: "russia", sideWords: "toward Russia" } };
  assert.match(en(lean).title, /Leaning toward Russia/);
  // the words follow the level, never the other way round
  assert.doesNotMatch(en({ ...FX.SVK, cN: { level: "sure", p: 0.99, side: "ukraine", sideWords: "toward Ukraine" } }).description, /Too close/);
  // "more" or "less" for Russia follows the sign of what Russia kept
  assert.match(en(FX.HUN).description, /Russia kept €12.3bn more/);
  assert.match(en({ ...FX.HUN, rus: 1.5 }).description, /Russia kept €1.5bn less/);
});

// round 60 (audit: Togo's intro said "0.46% toward Ukraine" for a net of −0.46%, its simulations 51% toward Ukraine): the
// direction words follow the middle value's sign; the chance says the side it is the chance of, and the map's chance words
// say both where they differ
test("direction words follow the sign of the middle value; the chance names its own side", () => {
  const togo = { ...FX.SVK, iso: "XTG", name: "Testland", net: -0.041, netPct: -0.46,
    cN: { level: "unc", p: 0.51, side: "ukraine", sideWords: "toward Ukraine", dirWords: "toward Russia", disagree: true },
    loc: { net: { range: "likely from 2.3% toward Russia to 2.5% toward Ukraine", chance: "too close to call: the middle value is toward Russia, but the simulations lean slightly toward Ukraine (51%)" } } };
  const c = en(togo);
  // round 63: its title asks the Russia question, so the first paragraph answers it: the net with its direction and chance
  assert.match(c.intro, /The net is 0\.46% of GDP toward Russia \(/);
  assert.match(c.intro, /the middle value is toward Russia, but the simulations lean slightly toward Ukraine \(51%\)/);
  assert.doesNotMatch(c.intro + c.intro2, /GDP toward Ukraine \(/);
  // the description's chance is the simulation's side (round 65: in words, not as a share of the money)
  assert.match(c.description, /^Too close to call: slightly more likely toward Ukraine \(51% chance\)\. Middle estimate: 0\.46% of GDP toward Russia/);
});

test("titles fit in 60 characters and descriptions in 155, for every category and long names", () => {
  const long = ["Saint Vincent and the Grenadines", "Bosnia and Herzegovina", "Turks and Caicos Islands", "Central African Republic", "Holy See (Vatican City State)"];
  const levels = [["sure", "ukraine"], ["sure", "russia"], ["lean", "ukraine"], ["lean", "russia"], ["unc", "russia"], ["near", "ukraine"], ["zero", "russia"]];
  for (const name of long) for (const [level, side] of levels) for (const party of [false, true]) for (const k of [0.004, 1.23456, 123.456]) {
    const f = { ...FX.DEU, iso: "XXA", name, party, netPct: k, uaPct: k, rusPct: -k, net: k * 40, ua: k * 30, rus: -k * 20, netLoPct: -k, netHiPct: 2 * k, cN: { level, p: 0.97, side }, cR: { level, p: 0.9, side } };
    const c = en(f);
    assert.ok(c.title.length <= T.TITLE_MAX, c.title);
    assert.ok(c.description.length <= T.DESC_MAX, c.description);
  }
  for (const l of T.LANGS) {
    const h = T.homeCopy(l, 191, "August 2026");
    assert.ok(h.title.length <= T.TITLE_MAX && h.description.length <= T.DESC_MAX, l);
    for (const iso of ["USA", "DEU", "HUN", "XXA"]) for (const side of ["ukraine", "russia"]) {
      if (l === "en") continue;
      const c = T.countryCopy(l, { ...FX.DEU, iso, nameL: "Vereinigte Staaten", words: W_DE, cN: { level: "sure", p: 0.99, side } });
      assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + iso + " " + c.title + " " + c.description);
    }
  }
});

test("the country slugs are unique and plain", () => {
  const html = readFileSync(join(HERE, "..", "site", "app.js"), "utf8");   // round 64: the map's code, moved out of index.html
  const code = html.match(/^const SLUG_FIX = .*$/m)[0] + "\n" + html.match(/^const countrySlug = [\s\S]*?;\n/m)[0];
  const countrySlug = new Function(code + "; return countrySlug;")();
  const D = JSON.parse(readFileSync(join(HERE, "..", "site", "data.json"), "utf8"));
  const slugs = Object.values(D.countries).map(c => countrySlug(c));
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  assert.equal(countrySlug({ iso3: "TUR", name: "Turkey" }), "turkiye");
  assert.equal(countrySlug({ iso3: "CIV", name: "Côte d'Ivoire" }), "cote-divoire");
  assert.equal(countrySlug({ iso3: "USA", name: "United States" }), "united-states");
});

// ----- round 55: the topic and group pages (seo_topics.mjs), from made-up countries -----
import { buildTopic, renderTopic, pathOf } from "./seo_topics.mjs";
const TOPICS = JSON.parse(readFileSync(join(HERE, "seo_topics.json"), "utf8")).pages;
const mk = (iso, name, gdp, net, ua, rus, extra = {}) => ({ iso, nameEn: name, slug: name.toLowerCase(), gdp, pop: 10, region: "eu", party: false, noData: false, mostlyNoData: false,
  measures: { net: { v: net, lo: net - 1, hi: net + 1, range: "likely …", chance: "very likely · >99%", level: "sure", side: net >= 0 ? "ukraine" : "russia" },
    ua: { v: ua, lo: ua, hi: ua, range: "", chance: "very likely · >99%", level: "sure", side: "ukraine" }, rus: { v: rus, lo: rus, hi: rus, range: "", chance: "likely toward Russia · 80%", level: "lean", side: "russia" },
    paid: { v: 10 }, paidGain: { v: -1 }, "part:disc": { v: -0.5 }, frozen: { v: 0 } }, ...extra });
const CS = [mk("AAA", "Aland", 100, 4, 2, 2), mk("BBB", "Bland", 50, -1, 0.5, -1.5), mk("CCC", "Cland", 3, 0.3, 0.3, 0), mk("DDD", "Dland", 20, -2, 0, -2, { party: true })];
// the countries the config names in its questions ({iso:...}), with the measures it asks for
const named = (iso, extra = {}) => { const c = mk(iso, iso, 50, 1, 1, 0, extra); c.measures.armed = { v: 2 }; return c; };
const CS_NAMED = CS.concat([named("IRN"), named("PRK", { party: true }), named("CHN"), named("USA")], ["GBR", "MDA", "TUR", "BLR", "SAU", "KAZ", "IND", "ARE"].map(i => named(i)));

test("every config entry builds a page with titles and descriptions that fit", () => {
  const slugs = new Set();
  for (const e of TOPICS) {
    assert.ok(!slugs.has(pathOf(e)), "two entries at " + pathOf(e)); slugs.add(pathOf(e));
    const m = buildTopic(e, CS_NAMED, TOPICS, { dataTo: "August 2026", words: W, vars: { y1: 2026, euroclear: "€202bn", euroclearDate: "June 2026", euCbr: "€210bn", euCbrDate: "December 2025" } });
    assert.ok(m.title.length <= T.TITLE_MAX, e.slug + ": " + m.title);
    assert.ok(m.description.length <= T.DESC_MAX, e.slug + ": " + m.description);
    assert.ok(m.h1 && m.intro && !/\{\w/.test(m.intro + m.title + m.description + JSON.stringify(m.faq)), e.slug);
  }
});

test("a topic ranks, totals and leaves out parties as configured", () => {
  const e = { slug: "t", kind: "topic", title: "T", description: "{top1} first; {sum:net_eur}, {sum:net_pct} {if:sum:net>=0|toward Ukraine|toward Russia}; {nToU:net} sure toward Ukraine; {if:abs(sum:paid)~abs(sum:ua)|about the same as|{if:abs(sum:paid)>abs(sum:ua)|more than|less than}}", h1: "H", intro: "I", rank: "net", sort: "gdp" };
  const m = buildTopic(e, CS, [], { dataTo: "August 2026" });
  // Cland is under €5bn of GDP (left out when ranked by % of GDP), Dland a party to the war
  assert.deepEqual(m.rows.map(c => c.iso), ["AAA", "BBB"]);
  assert.deepEqual(m.party.map(c => c.iso), ["DDD"]);
  assert.equal(m.description, "Aland first; €3bn, 2.0% toward Ukraine; 1 sure toward Ukraine; more than");
  const asc = buildTopic({ ...e, order: "asc", sort: "eur", rank: "rus" }, CS, [], { dataTo: "" });
  assert.deepEqual(asc.rows.map(c => c.iso), ["BBB", "CCC", "AAA"]);
  const g = buildTopic({ ...e, kind: "group", members: ["AAA", "CCC", "DDD", "RUS"] }, CS, [], { dataTo: "" });
  assert.deepEqual(g.rows.map(c => c.iso), ["CCC", "AAA"]);   // by % of GDP, every member (a group has no size limit)
  assert.deepEqual(g.sides, ["RUS"]);
  const html = renderTopic(g, { esc: s => String(s), cPath: c => "/country/" + c.slug + "/" });
  assert.match(html, /<tr data-iso="AAA"[^>]*>.*data-q="net" data-level="sure"[^>]*><b class="pos">\+4\.0%/);
  assert.match(html, /data-total="net"><span>Net<\/span><b class="pos">\+4\.2%/);
  assert.match(html, /Party to the war/);
  assert.throws(() => buildTopic({ ...e, title: "{nope}" }, CS, [], { dataTo: "" }), /unknown placeholder/);
  // round 57: an unknown value or a condition that does not depend on the data stops the build
  assert.throws(() => buildTopic({ ...e, title: "{if:sum:nope>0|a|b}" }, CS, [], { dataTo: "" }), /unknown value/);
  assert.throws(() => buildTopic({ ...e, title: "{if:1>0|a|b}" }, CS, [], { dataTo: "" }), /does not depend on the data/);
  assert.throws(() => buildTopic({ ...e, title: "{if:n>0|a}b}" }, CS, [], { dataTo: "" }), /stray/);
  // the old placeholders that wrote a direction or an order by themselves are gone
  assert.throws(() => buildTopic({ ...e, title: "{cmp:paid:ua}" }, CS, [], { dataTo: "" }), /unknown placeholder/);
});

// ----- round 56: the generated families, the language frames and the year pages -----
import * as I from "./seo_i18n.mjs";
import { partEntries, yearEntries, compareEntries } from "./seo_families.mjs";
const FAM = JSON.parse(readFileSync(join(HERE, "seo_families.json"), "utf8"));

test("numbers are written the way each language writes them", () => {
  assert.equal(I.E("en", 74.666), "€74.7bn");
  assert.equal(I.E("en", 1234.4), "€1,234bn");
  assert.equal(I.E("en", 0.05), "€50m");
  assert.equal(I.E("de", 74.666), "74,7 Mrd. €");
  assert.equal(I.E("fr", 0.05), "50 M€");
  assert.equal(I.E("es", 74.666), "74.700 M€");
  assert.equal(I.E("pl", 547.2), "547 mld €");
  assert.equal(I.P("en", 3.651), "3.7%");
  assert.equal(I.P("de", 0.004), "<0,01 %");
  assert.equal(I.P("uk", 0.35), "0,35%");
  assert.equal(I.PP("nl", 1514.6), "€1.515");
  assert.equal(I.monthYear("2026-08-31", "pl"), "sierpnia 2026");
});

test("every family page and language has a title and description that fit", () => {
  const parts = FAM.parts.list.map(p => p.key);
  for (const l of I.LANGS) {
    for (const k of parts) {
      const c = I.partCopy(l, { key: k, n: 40, top: ["Bosnia and Herzegovina", "Saint Vincent and the Grenadines"], topV: "€1,234bn", dataTo: I.monthYear("2026-08-31", l) });
      assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + k + " " + c.title + " | " + c.description);
      assert.ok(I.partName(l, k) !== k, l + " has no name for " + k);
    }
    for (const kind of ["ua", "rus"]) for (const partial of [false, true]) {
      const c = I.yearCopy(l, { kind, y: 2026, partial, month: I.monthOnly("2026-08-31", l), n: 60, top: ["Central African Republic", "B", "C"], topV: "€1,234bn", dataTo: "" });
      assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + kind + " " + c.title);
    }
    const c = I.compareCopy(l, { A: "Saint Vincent and the Grenadines", B: "Bosnia and Herzegovina" });
    assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + c.title);
    const h = I.hubCopy(l, 300);
    assert.ok(h.title.length <= T.TITLE_MAX && h.description.length <= T.DESC_MAX, l);
    if (l === "en") continue;
    for (const e of TOPICS) {
      assert.ok(I.TOPIC_T[e.slug] && I.TOPIC_T[e.slug][l], "no " + l + " words for " + e.slug);
      const t = I.topicCopyLang(l, e, { n: 60, top: ["Saint Vincent and the Grenadines", "B", "C"], topV: "€1,234bn", measure: I.measureName(l, "ua"), unitKey: "gdp", dataTo: "August 2026", sumUa: "€1bn", sumNetPct: "1%", netDir: "x", isGroup: e.kind === "group" });
      assert.ok(t.title.length <= T.TITLE_MAX && t.description.length <= T.DESC_MAX, l + " " + e.slug + " " + t.title + " | " + t.description);
    }
  }
});

test("a country page in another language says the map's chance words, for every level and long names", () => {
  const words = W_DE;
  const levels = [["sure", "ukraine", "u_sure"], ["sure", "russia", "r_sure"], ["lean", "ukraine", "u_lean"], ["lean", "russia", "r_lean"], ["unc", "russia", "unc"], ["near", "ukraine", "zero"], ["zero", "russia", "zero"]];
  for (const l of I.LANGS.filter(x => x !== "en")) for (const name of ["Schweiz", "St. Vincent und die Grenadinen", "Demokratische Republik Kongo"]) for (const [level, side, cat] of levels) for (const party of [false, true]) {
    const f = { ...FX.DEU, iso: "XXA", name, nameL: name, party, words, cN: { level, p: 0.97, side }, cR: { level, p: 0.9, side } };
    const c = T.countryCopy(l, f);
    assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + c.title + " | " + c.description);
    const want = party ? "kriegspartei" : cat === "u_lean" ? "tendenz richtung ukraine" : cat === "r_lean" ? "tendenz richtung russland" : cat === "unc" ? "zu knapp" : cat === "zero" ? (level === "near" ? "nahe null" : "praktisch null") : "";
    if (l === "de" && want) assert.ok(c.title.toLowerCase().includes(want), c.title);
  }
  // round 57: the ten most searched countries have the same template as the others (their hand-written titles folded in)
  assert.match(T.countryCopy("fr", { ...FX.HUN, nameL: "Hongrie", words }).title, /^Hongrie : le pays aide-t-il la Russie \?/);
});

test("the families: parts by rule, five years each way, the searched pairs and every pair of the largest donors", () => {
  const C = [mk("AAA", "Aland", 100, 4, 2, 2), mk("BBB", "Bland", 50, -1, 0.5, -1.5)];
  for (const c of C) c.measures["part:aid"] = { v: 1 };
  const few = { ...FAM, parts: { minCountries: 2, minTotal: 0.5, list: [{ key: "aid", slug: "a", side: "ua" }, { key: "ship", slug: "s", side: "rus" }] } };
  assert.deepEqual(partEntries(few, C, []).map(e => e.slug), ["a"]);
  // a part a topic page already ranks gets no page of its own
  assert.deepEqual(partEntries(few, C, [{ rank: "part:aid" }]).map(e => e.slug), []);
  const ys = yearEntries(FAM, 2026);
  assert.equal(ys.length, 2 * FAM.years.length);
  assert.ok(ys.find(e => e.slug === "ukraine-aid-2026").partial && !ys.find(e => e.slug === "trade-with-russia-2025").partial);
  const cmp = compareEntries({ compare: { pairwiseTop: 2, pairs: [["BBB", "AAA"], ["AAA", "ZZZ"]] } }, C);
  assert.deepEqual(cmp.map(e => e.slug), ["bland-vs-aland"]);
});

test("a year page ranks that year's own amounts", () => {
  const C = [mk("AAA", "Aland", 100, 4, 2, 2), mk("BBB", "Bland", 50, -1, 0.5, -1.5)];
  C[0].years = [{ y: 2023, uaBn: 1, rusBn: 0.5, netBn: 1.5 }]; C[1].years = [{ y: 2023, uaBn: 3, rusBn: -1, netBn: 2 }];
  const m = buildTopic({ kind: "year", slug: "ukraine-aid-2023", rank: "ua", year: 2023, sort: "eur", order: "desc", columns: ["rus", "net"] }, C, [], { dataTo: "" });
  assert.deepEqual(m.rows.map(c => c.iso), ["BBB", "AAA"]);
  const html = renderTopic(m, { esc: s => String(s), cPath: c => "/country/" + c.slug + "/", l: "de" });
  assert.match(html, /data-q="ua" data-year="2023"[^>]*><b class="pos">\+3 Mrd\. €/);
  assert.match(html, /im Jahr 2023/);
});

// ----- round 58 (owner: "the ranking does not work and the numbers make no sense"): a part's page -----
test("a part page writes each value with its range in the value's own sign, in the side's words, without chance words", () => {
  // money flowing back (other countries' aid spent here): below zero, subtracted from support
  const back = (iso, name, gdp, v, lo, hi) => mk(iso, name, gdp, 1, 1, 0, {});
  const C = [back("AAA", "Aland", 500, 0, 0, 0), back("BBB", "Bland", 300, 0, 0, 0), back("CCC", "Cland", 26000, 0, 0, 0)];
  const P = { AAA: [-0.3, -0.64, -0.003], BBB: [-0.17, -0.49, -0.02], CCC: [-0.7, -1.4, -0.32] };
  for (const c of C) { const [v, lo, hi] = P[c.iso]; c.measures["part:purl"] = { v, lo, hi, range: "", chance: "", level: "", side: "", partSide: "back", name: c.nameEn + " kept part of others' aid, spent here" }; }
  const [e] = partEntries({ parts: { minCountries: 1, minTotal: 0, list: [{ key: "purl", slug: "p", side: "back" }] } }, C, []);
  const m = buildTopic({ ...e, label: "P" }, C, [], { dataTo: "" });
  assert.deepEqual(m.rows.map(c => c.iso), ["CCC", "AAA", "BBB"]);   // the most subtracted first
  assert.equal(m.keySide, "back");
  for (const l of ["en", "nl"]) {
    const html = renderTopic(m, { esc: s => String(s), cPath: c => "/country/" + c.slug + "/", l }).replace(/[\u00a0\u202f]/g, " ");
    const nl = l === "nl";
    // Sweden-like row: −0.06% of GDP with a range from −€0.64bn to −€3m (signed, low to high, holding the value)
    assert.match(html, nl ? /<b class="neg">−€0,30 mld<\/b><span class="s"><i>−0,06% van het bbp<\/i>/ : /<b class="neg">−€0.30bn<\/b><span class="s"><i>−0.06% of GDP<\/i>/);
    assert.match(html, nl ? /bandbreedte <i>−€0,64 mld<\/i> tot <i>−€3 mln<\/i>/ : /range <i>−€0.64bn<\/i> to <i>−€3m<\/i>/);
    const cells = [...html.matchAll(/data-q="part:purl"[^>]*>(.*?)<\/td>/g)].map(x => x[1]).join(" ");
    assert.equal(cells.match(/class="s rg"/g).length, 3);
    assert.doesNotMatch(cells, nl ? /waarschijnlijk|ongeveer 0|richting/ : /likely|about 0|toward/);
    assert.doesNotMatch(html, /kept part of others' aid/);   // no words repeated in every row
    assert.match(html, nl ? /naar het afgetrokken bedrag, van hoog naar laag/ : /by the amount subtracted, high to low/);
    assert.match(html, nl ? /−: wat het verdiende, afgetrokken van zijn steun/ : /−: what it earned, subtracted from its support for Ukraine/);
  }
  // a share of exactly 0.01% keeps its sign
  const one = renderTopic(buildTopic({ ...e, sort: "gdp" }, [C[0]].map(c => ({ ...c, gdp: 3000 })), [], { dataTo: "" }), { esc: s => String(s), cPath: () => "/" });
  assert.match(one, /<b class="neg">−0.01%<\/b>/);
});

test("a page by year has frozen money's column, so its columns add up to the net", () => {
  const [ua] = yearEntries(FAM, 2026);
  assert.deepEqual(ua.columns, ["rus", "frozen", "net"]);
});

// ----- round 57: the placeholder engine, and the one translation table -----
test("conditions choose words from the data, and stop the build when they cannot be read", () => {
  assert.equal(I.fmt("Russia kept {v} {if:x>=0|less|more}", { v: "€1bn" }, { x: -2 }), "Russia kept €1bn more");
  assert.equal(I.fmt("{if:a~b|about the same as|{if:a>b|more than|less than}}", {}, { a: 100, b: 101 }), "about the same as");
  assert.equal(I.fmt("{if:abs(a)>b|big|small}", {}, { a: -5, b: 3 }), "big");
  assert.equal(I.fmt("{if:flag|yes}", {}, { flag: false }), "");
  assert.equal(I.fmt("{q:Is {N} helping Russia}?", { N: "Hungary" }), "Is Hungary helping Russia?");
  assert.throws(() => I.fmt("{if:x>0|a|b}", {}, {}), /unknown value/);
  assert.throws(() => I.fmt("{if:2>1|a|b}"), /does not depend on the data/);
  assert.throws(() => I.fmt("{if:x>>0|a|b}", {}, { x: 1 }), /cannot read the condition/);
  assert.throws(() => I.fmt("{nope}"), /unknown placeholder/);
});

test("every phrase of the table parses, in every language, and each family has every language", () => {
  const list = I.phraseList();
  for (const p of list) I.parseTpl(p.text);
  assert.deepEqual([...new Set(list.map(p => p.lang))].sort(), [...I.LANGS].sort());
  for (const k of ["COPY.part.title[0]", "COPY.year.ua.intro", "COPY.compare.line", "COPY.hub.title", "COPY.country.u_sure.h1", "COPY.home.intro", "S.rankBy", "LABELS.yearNote"])
    for (const l of I.LANGS) assert.ok(list.some(p => p.key === k && p.lang === l), k + " " + l);
  assert.deepEqual(T.phraseList(), []);   // seo_templates.mjs has no words of its own
});

test("the comparison line says which country gave more from the figures", () => {
  const a = { a: "Aland", b: "Bland", eurA: "€1bn", eurB: "€2bn", uaA: 1, uaB: 2, pctA: 3, pctB: 1 };
  assert.equal(I.compareLine("en", a), "Support for Ukraine in euros: Aland €1bn, Bland €2bn. More in euros: Bland; more as a share of GDP: Aland.");
});

// ----- round 57b: the country page's sections and question pool (seo_country.mjs) -----
import * as SC from "./seo_country.mjs";
// a country as seo_extract.mjs gives it, in English (figures made up; Kazakhstan's shape: the middle value toward
// Ukraine, the chance toward Russia)
const mkC = (over = {}) => ({
  iso: "XKZ", name: "Testland", gdp: 250, party: false, noData: false, mostlyNoData: false, partyWhy: "", kept: "Russia kept €35m (0.01% of GDP) less than without the war",
  kiel: "", fig: { net: 0.05, netPct: 0.02, ua: 0.016, uaPct: 0.006, rusPct: 0.01, frozen: 0, cN: { level: "zero", p: 0.58, side: "russia", sideWords: "toward Russia", dirWords: "toward Ukraine" } },
  net: { signed: "+0.02%", range: "likely from 2.7% toward Russia to 2.8% toward Ukraine", chance: "essentially zero", chanceSentence: "Chance toward Russia: 58%; 11% of the other method choices agree." },
  ua: { range: "likely <0.01% to 0.03%" }, measures: { "part:ref": { v: 0.012 }, "part:prem": { v: 0.0035 }, "part:disc": { v: -0.0001 } },
  years: [{ y: 2022, ytd: false, uaBn: 0.003, netBn: -0.33 }, { y: 2023, ytd: false, uaBn: 0.002, netBn: 0.26 }, { y: 2024, ytd: false, uaBn: 0.001, netBn: -0.37 }, { y: 2025, ytd: false, uaBn: 0.005, netBn: 0.07 }, { y: 2026, ytd: true, uaBn: 0.005, netBn: 0.42 }],
  dyn: { story: [{ key: "hub", label: "Trade hub", body: "Goods it passed on. of which some." }], decide: { level: "zero", why: "Not certain, mostly because of how much it would have bought from Russia without the war.", flip: "" },
    notes: { hub: "Transit hub: trade hub.", frozen: "", sanction: "" }, coverage: [{ part: "Refugee hosting", status: "est", word: "estimated", note: "modelled" }],
    facts: { trade: { bought: { y0: 13.9118, y1: 15.94622 }, sold: { y0: 0.003, y1: 0.004 } }, fuelShare: 0.0972, ref: { count: 4240, per1k: 0.2, asOf: "2025" }, flowback: null, loans: null, pledged: null },
    parts: [{ k: "paid", v: 2.6, name: "Russia kept less from fuel and goods sold here", grade: "C", src: ["trade", "prices", "nolink"] }, { k: "laund", v: -0.04, name: "Russia kept more from its oil bought via other countries", grade: "D", src: ["laundered"] }] },
  ...over,
});
const ROW = { XKZ: { iso: "XKZ", name: "Testland", href: "/country/testland/", netPct: 0.02, netEur: 0.05, level: "zero", side: "russia", chance: "essentially zero", gdp: 250 },
  XUZ: { iso: "XUZ", name: "Uzland", href: "/country/uzland/", netPct: -4.1, netEur: -4.1, level: "sure", side: "russia", chance: "very likely · >99%", gdp: 100 } };
const OPT = (over = {}) => ({ l: "en", words: W, dw: { story: "Its story in short", coverage: "Data coverage", loansFace: "Loans, full amount", loansGE: "Loans, grant equivalent", pledged: "Promised", noDataBig: "There is no observation of its own." },
  srcs: { trade: { name: "UN Comtrade", href: "https://comtrade.un.org/x", tier: "official" }, prices: { name: "Prices", href: "https://ex.org/p", tier: "method" }, nolink: { name: "A note", href: "", tier: "own" }, laundered: { name: "CREA", href: "https://ex.org/c", tier: "research" } },
  L: k => ({ frozen: "Russian money frozen", country: "Country" })[k] || k, dataTo: "August 2026", month: "August", tradeYears: [2021, 2025],
  peers: { rankable: true, world: null, groups: [], neighbours: ["XUZ"], similar: [] }, row: iso => ROW[iso], home: "/", fuelDefault: 0.5737, demand: { help: 4718, clusters: { country_russia_relations: 4472 } }, eu: false, ...over });

test("the question pool: a data condition each, 4 to 6 by score, at most 2 per family, the same array for the page and the JSON-LD", () => {
  const r = SC.countryDyn(mkC(), OPT());
  const ids = r.faq.map(x => x.id);
  assert.ok(ids.length >= 4 && ids.length <= SC.FAQ_MAX, ids.join());
  assert.equal(ids[0], "help");   // the most searched for this country, and material
  const fams = {}; for (const x of r.faq) fams[x.fam] = (fams[x.fam] || 0) + 1;
  assert.ok(Object.values(fams).every(n => n <= SC.FAQ_PER_FAMILY));
  assert.ok(!ids.includes("decide") && ids.includes("close"));   // essentially zero: why so small, never "what flips it"
  assert.equal(SC.POOL.length, 17);   // round 58: relations and armed
  assert.ok(!SC.POOL.some(p => /forced|strike|druzhba/.test(p.id)));   // not shown on the map yet, so not on the pages
  // a country without data gets the one question about that
  const nd = SC.countryDyn(mkC({ net: null, noData: true }), OPT());
  assert.deepEqual(nd.faq.map(x => x.id), ["nodata"]);
  assert.deepEqual(nd.sections, []);
  // the JSON-LD's answer is the visible one as plain text
  for (const x of r.faq) assert.ok(!/<|&lt;/.test(SC.plainText(x.a)) || /</.test(SC.plainText(x.a)));
  assert.equal(SC.plainText('<span data-f="p">&lt;0.01%</span> of GDP'), "<0.01% of GDP");
});

test("a chance names the side it is the chance of; years change side only when it is a finding", () => {
  const r = SC.countryDyn(mkC(), OPT());
  const help = r.faq.find(x => x.id === "help").a;
  assert.match(help, /essentially zero/);
  assert.match(help, /Chance toward Russia: 58%/);
  assert.doesNotMatch(help.replace(/likely from 2\.7% toward Russia to 2\.8% toward Ukraine/, ""), /toward Ukraine/);
  const peers = r.sections.find(s => s.id === "peers").html;
  assert.match(peers, /Its direction is essentially zero, so the map's ranking gives it no number/);
  // the yearly amounts change side, but the total is not very likely: no change-of-side claim
  assert.match(r.years, /not a finding/);
  assert.doesNotMatch(r.years, /changed side/);
  const sure = mkC({ fig: { ...mkC().fig, cN: { level: "sure", p: 0.99, side: "ukraine", sideWords: "toward Ukraine" } } });
  for (const y of sure.years) y.netBn = Math.sign(y.netBn) * 1;   // every year material (0.4% of GDP)
  assert.match(SC.countryDyn(sure, OPT()).years, /changed side: 2022 <span data-f="s" data-k="y2022:net">−€1bn<\/span>/);
});

test("sections: trade before and after, the measured fuel share only, energy outside the totals, every source a link", () => {
  const r = SC.countryDyn(mkC(), OPT());
  const trade = r.sections.find(s => s.id === "trade").html;
  assert.match(trade, /It bought <span data-f="e" data-k="tb0">€13\.9bn<\/span> from Russia in 2021 and <span data-f="e" data-k="tb1">€15\.9bn<\/span> in 2025 \(<span data-f="c" data-k="tbc">\+15%<\/span>\)/);
  assert.doesNotMatch(trade, /tsc/);   // no % change from a base under €10m
  assert.match(trade, /fuel was <span data-f="q" data-k="fuelShare">9\.7%<\/span>/);
  assert.doesNotMatch(SC.countryDyn(mkC({ dyn: { ...mkC().dyn, facts: { ...mkC().dyn.facts, fuelShare: 0.5737 } } }), OPT()).sections.find(s => s.id === "trade").html, /fuel was/);
  assert.ok(!r.sections.some(s => s.id === "energy"));   // €3.5m: not material
  const back = r.sections.find(s => s.id === "backing").html;
  const lis = back.match(/<li[^>]*>.*?<\/li>/g).filter(x => /class="tier/.test(x));
  assert.ok(lis.length >= 4 && lis.every(x => /<a href="(https:\/\/|#src-|\/#)/.test(x)), lis.join("\n"));
  assert.match(back, /<li id="src-nolink"><span class="tier t-own">own estimate<\/span> <a href="\/#XKZ">A note<\/a><\/li>/);
  assert.match(back, /<span class="tier t-method">method input<\/span>/);
  // the story keeps the map's words, with a capital after a full stop
  assert.equal(r.story[0].body, "Goods it passed on. Of which some.");
});

test("the map's ranking rule: a number only for a very likely country, among economies of €5bn and more", () => {
  const rows = [{ iso: "A", gdp: 10, level: "sure", side: "ukraine", netPct: 3 }, { iso: "B", gdp: 10, level: "sure", side: "ukraine", netPct: 1 }, { iso: "C", gdp: 10, level: "lean", side: "ukraine", netPct: 5 },
    { iso: "D", gdp: 3, level: "sure", side: "ukraine", netPct: 9 }, { iso: "E", gdp: 10, level: "sure", side: "russia", netPct: -2 }, { iso: "F", gdp: 10, level: "sure", side: "russia", netPct: -1 }];
  assert.deepEqual(SC.mapRank(rows[1], rows), { n: 2, of: 2 });
  assert.equal(SC.mapRank(rows[2], rows), null);
  assert.equal(SC.mapRank(rows[3], rows), null);
  assert.deepEqual(SC.mapRank(rows[4], rows), { n: 1, of: 2 });
  assert.ok(SC.sameRegion("eu", "eur") && !SC.sameRegion("am", "eu"));
  assert.deepEqual(SC.similarOf({ ...rows[0], region: "eu" }, rows.map(r => ({ ...r, region: "eu" }))).map(r => r.iso), ["B"]);
});

test("the country page's phrases: every language, the same placeholders, no markup of their own", () => {
  // (a name may be written in a sentence or before a question: {N}, {Nt}, {NtCap})
  const ph = s => [...new Set([...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).filter(x => !/^N(t|tCap)?$/.test(x)))].sort().join(",");
  for (const k of I.DYN_KEYS) for (const l of I.LANGS) {
    const s = I.dyn(l, k);
    assert.ok(!/[<>&]/.test(s.replace(/\{if:[^|]*\|/g, "")), l + " " + k);   // (a condition may compare: a>b)
    assert.equal(ph(s), ph(I.dyn("en", k)), l + " " + k);
  }
  for (const l of I.LANGS) assert.ok(I.phraseList().some(p => p.key === "DYN.aHelp" && p.lang === l), l);
  // every language's page renders, with the same marked figures
  for (const l of I.LANGS) {
    const r = SC.countryDyn(mkC(), OPT({ l }));
    assert.ok(r.faq.length >= 4 && r.sections.length >= 4, l);
    assert.ok(!/\{\w|undefined|NaN/.test(JSON.stringify(r)), l);
  }
});

// ----- round 64 (SEO audit, fix 7): a government's own total, from the research file, in every language -----
test("round 64: the government's own total: its figures, what it covers, the map's figure and the source", () => {
  const OFF = JSON.parse(readFileSync(join(HERE, "..", "research", "2026-10", "seo", "official_totals_r64.json"), "utf8")).countries;
  for (const [iso, r] of Object.entries(OFF)) {
    assert.ok(/^https:\/\//.test(r.source_url) && r.as_of && r.figures.length && r.figures.every(f => f.value > 0 && f.basis && f.covers && f.quote), iso);
    for (const l of I.LANGS) assert.ok(r.publisher[l], iso + " " + l);
  }
  const de = OFF.DEU;
  const en = SC.countryDyn(mkC(), OPT({ official: de, eu: true }));
  const sec = en.sections.find(x => x.id === "official"), q = en.faq.find(x => x.id === "official");
  assert.ok(sec && q, "a section and a question");
  assert.match(sec.html, /Germany's federal government reports over €43\.3bn in bilateral civil support and about €57\.6bn in military support, as of 30 June 2026\./);
  assert.match(sec.html, /leaves out its share of EU aid/);
  assert.match(sec.html, /<span data-f="e" data-k="uaEur">/);
  assert.ok(sec.html.includes(de.source_url));
  for (const l of I.LANGS) {
    const r = SC.countryDyn(mkC(), OPT({ l, official: de, eu: true }));
    assert.ok(r.sections.some(x => x.id === "official") && !/\{\w|undefined|NaN/.test(JSON.stringify(r)), l);
  }
  // no official figure, or no support to compare: nothing
  assert.ok(!SC.countryDyn(mkC(), OPT()).sections.some(x => x.id === "official"));
});

// ----- round 58: explainers and search wording; the Markdown versions -----
import { htmlToMarkdown } from "./seo_markdown.mjs";
import { armedOf } from "./seo_topics.mjs";

test("the explainers: every one in every language, filled, the amount hook left out until the data give one", () => {
  for (const l of I.LANGS) for (const id of I.EXPLAIN_IDS) {
    const x = I.explainText(l, id);
    assert.ok(x.q.endsWith("?") || x.q.endsWith(" ?") || x.q.endsWith("?»"), l + " " + id + " " + x.q);
    assert.ok(x.a.length > 200 && !/[{}]/.test(x.a), l + " " + id);
    const n = x.a.split(/(?<=[.!?])\s+(?=\p{Lu})/u).length;
    assert.ok(n >= 3 && n <= 5, `${l} ${id}: ${n} sentences`);
  }
  assert.equal(I.explainText("de", "shadowFleet").q, "Was ist die Schattenflotte?");
  assert.equal(I.explainText("pl", "shadowFleet").q, "Co to jest flota cieni?");
  assert.equal(I.explainText("fr", "priceCap").q, "Qu'est-ce que le plafonnement du prix du pétrole russe ?");
  assert.ok(I.explainText("en", "shadowFleet").link);
  // the downloads page's title and description fit, in every language
  for (const l of I.LANGS) assert.ok(I.s(l, "dlTitle").length <= T.TITLE_MAX && I.s(l, "dlDescription").length <= T.DESC_MAX, l);
  // the hook: a sentence on the amount only when the code gives one
  assert.doesNotMatch(I.explainText("en", "reparationsLoan").a, /€/);
  assert.match(I.explainText("en", "reparationsLoan", { amountText: "The data put it at €1bn." }, { amount: 1 }).a, /€1bn\.$/);
  // every explainer named by a topic page exists, and its cluster is in the config
  const fam = JSON.parse(readFileSync(join(HERE, "seo_families.json"), "utf8"));
  for (const e of TOPICS) for (const id of e.explain || []) { assert.ok(I.EXPLAIN_IDS.includes(id), id); assert.ok(id in fam.explain.clusters, id); }
});

test("the searchers' words for weapons sent to Russia, only where the data have them", () => {
  assert.equal(I.armedPair("en", "North Korea", ["soldiers", "shells"]), "North Korea soldiers and shells");
  assert.equal(I.armedPair("de", "Iran", ["drones"]), "Iran – Drohnen");
  const cfg = { minEur: 0.05, list: { PRK: { items: ["soldiers", "shells"], src: "nk" }, IRN: { items: ["drones"], src: "mr" } } };
  const cs = [{ iso: "PRK", armedFull: 10 }, { iso: "IRN", armedFull: 0.01 }];
  assert.deepEqual(armedOf(cfg, cs, { PRK: ["nk"], IRN: ["mr"] }), [{ iso: "PRK", items: ["soldiers", "shells"] }]);   // Iran under minEur
  assert.deepEqual(armedOf(cfg, cs, { PRK: ["other"] }), []);   // the research is not among its sources
  const e = TOPICS.find(x => x.slug === "military-support-to-russia");
  const C = [{ iso: "PRK", name: "North Korea", nameEn: "North Korea", gdp: 30, measures: { armed: { v: 10 }, net: { v: -3 } } }, { iso: "IRN", name: "Iran", nameEn: "Iran", gdp: 400, measures: { armed: { v: 3.5 }, net: { v: -0.1 } } }, { iso: "CHN", name: "China", nameEn: "China", gdp: 17000, measures: { armed: { v: 1 }, net: { v: -100 } } }];
  const m = buildTopic(e, C, TOPICS, { dataTo: "August 2026", l: "en", armed: [{ iso: "PRK", items: ["soldiers", "shells"] }, { iso: "IRN", items: ["drones"] }] });
  assert.equal(m.title, "North Korea soldiers and shells, Iran drones: arms to Russia");
  assert.equal(m.faq[0].q, "Iran drones for Russia: what are they worth?");
  const none = buildTopic(e, C, TOPICS, { dataTo: "August 2026", l: "en", armed: [] });
  assert.equal(none.title, "Who sends Russia weapons? Drones, shells and missiles");
  assert.equal(none.faq[1].q, "Are North Korea's troops counted?");
  const de = I.topicCopyLang("de", e, { n: 3, top: ["A"], topV: "1", measure: "x", unitKey: "eur", dataTo: "August 2026", sumUa: "1", sumNetPct: "1", isGroup: false, armedList: m.armedList.replace("soldiers and shells", "Soldaten und Granaten"), nArmed: 2 });
  assert.match(de.h1, /Nordkorea|North Korea/);
  assert.ok(de.title.length <= T.TITLE_MAX);
  // the trade hubs in the searchers' words, neutral
  const hubs = TOPICS.find(x => x.slug === "russia-trade-hubs");
  assert.match(hubs.title[0], /sanctions evasion/);
  for (const [l, w] of [["de", "Sanktionsumgehung"], ["pl", "omijanie sankcji"], ["fr", "contournement des sanctions"]]) assert.ok(JSON.stringify(I.TOPIC_T["russia-trade-hubs"][l]).includes(w), l);
});

test("the country page's questions in the searchers' words: relations where searched in that language, the supplies sent where the data have them", () => {
  const byLang = { byLang: { country_russia_relations: { de: 3589, es: 20 } }, clusters: { country_russia_relations: 4472 }, help: 4718 };
  const rel = { minDemand: 150, clusters: ["country_russia_relations", "groups_blocs"] };
  const de = SC.countryDyn(mkC(), OPT({ l: "de", demand: byLang, relations: rel }));
  const es = SC.countryDyn(mkC(), OPT({ l: "es", demand: byLang, relations: rel }));
  assert.ok(de.faq.some(x => x.id === "relations"));
  assert.ok(!es.faq.some(x => x.id === "relations"));
  const a = de.faq.find(x => x.id === "relations");
  assert.match(a.q, /^Testland und Russland/);
  assert.match(a.a, /data-k="tb1"/);   // its figures are marked for check 48
  const arm = SC.countryDyn(mkC(), OPT({ armed: ["drones"], armedFull: 3.5 }));
  const q = arm.faq.find(x => x.id === "armed");
  assert.equal(q.q, "Testland drones for Russia: what are they worth?");
  assert.match(q.a, /€3\.5bn at full value/);
  assert.ok(!SC.countryDyn(mkC(), OPT({ armedFull: 3.5 })).faq.some(x => x.id === "armed"));   // no config, no question
});

test("a page's Markdown version: its headings, text, lists and tables, full links, nothing else", () => {
  const html = `<html><head><title>x</title></head><body><header>menu</header><main class="wrap"><nav class="crumbs"><a href="/">Map</a></nav>
<h1>Shadow fleet</h1><p class="intro">For <a href="/country/greece/">Greece</a>: −€1.5bn &amp; more_x.</p>
<details class="fold"><summary><h2>Parts</h2></summary><div class="tbl"><table><thead><tr><th>#</th><th>Country</th></tr></thead><tbody><tr><td>1</td><td class="m"><b>+1.8%</b><span class="s">€5.2bn</span><span class="s">likely</span></td></tr></tbody></table></div></details>
<ul class="rel"><li><a href="https://x.org/a(b)">A</a></li><li>B</li></ul><script>var x = 1;</script></main><footer>foot</footer></body></html>`;
  const md = htmlToMarkdown(html, "https://warbalance.org/shadow-fleet/");
  assert.equal(md, "# Shadow fleet\n\nFor [Greece](https://warbalance.org/country/greece/): −€1.5bn & more\\_x.\n\n## Parts\n\n| # | Country |\n| --- | --- |\n| 1 | +1.8% · €5.2bn · likely |\n\n- [A](https://x.org/a%28b%29)\n- B\n");
});

// ----- round 58b: the three research results (seo_research.mjs) -----
import * as RS from "./seo_research.mjs";
const RJ = f => JSON.parse(readFileSync(join(HERE, "..", "research", "2026-10", "gaps", f), "utf8"));
const SANC = RJ("sanctions_r58.json"), FROZ = RJ("frozen_amounts_r58.json"), REV = RJ("russia_revenue_r58.json");

test("sanctions: every entry answered from its category in every language; Russia's list said apart, never as a sanction", () => {
  for (const iso of Object.keys(SANC.countries)) {
    const r = RS.sanctionsOf(SANC, iso);
    assert.ok(RS.SANCTION_CATS.includes(r.cat), iso);
    for (const l of I.LANGS) {
      const a = RS.sanctionsAnswer(l, r, { N: "X", Nt: "X", sov: r.sov || "" });
      assert.ok(a.length > 40 && !/[{}]/.test(a), `${iso} ${l}`);
    }
  }
  const kaz = RS.sanctionsAnswer("en", RS.sanctionsOf(SANC, "KAZ"), { N: "Kazakhstan", Nt: "Kazakhstan" });
  assert.match(kaz, /^No\. Kazakhstan has not imposed sanctions of its own/);
  assert.match(kaz, /get around other countries' sanctions/);
  assert.doesNotMatch(kaz, /refuses|sides with/);
  const twn = RS.sanctionsAnswer("en", RS.sanctionsOf(SANC, "TWN"), { N: "Taiwan", Nt: "Taiwan" });
  assert.match(twn, /export controls on listed high-tech goods/);
  assert.match(twn, /Separately, Russia lists Taiwan as an “unfriendly” state \(government order 430-r, 5 March 2022\): that is Russia's own list/);
  const deu = RS.sanctionsOf(SANC, "DEU");
  assert.equal(deu.cat, "eu_member");
  assert.ok(deu.cap.member && deu.cap.viaEU === false);   // a G7 member in its own right
  // a fact read only through a search engine's extract is marked where its source is listed
  const b = RS.sanctionsBlock("en", RS.sanctionsOf(SANC, "KAZ"), { N: "Kazakhstan", Nt: "Kazakhstan" }, "/countries-with-sanctions-on-russia/");
  assert.match(b.html, /search summary/);
  assert.equal(b.q, "Does Kazakhstan have sanctions on Russia?");
  // the page of every country: every entry, the counts by category the file's own
  const p = RS.sanctionsPage("en", SANC, { nameOf: i => SANC.countries[i].name, href: () => "" });
  assert.deepEqual(p.counts, SANC.summary.by_category);
  assert.equal((p.body.match(/<tr id="[A-Z]{3}"/g) || []).length, Object.keys(SANC.countries).length);
  assert.match(p.faq[2].a, /Micronesia/);
  // round 59: "What are the EU sanctions on Russia?", from the file's EU category, its members and adopters
  assert.equal(p.faq[1].q, "What are the EU sanctions on Russia?");
  assert.match(p.faq[1].a, /^The EU's sanctions on Russia are set in Council Regulations 833\/2014 and 269\/2014, which every member agreed to in the Council\. The EU's 27 members apply them, and \d+ other European countries adopt them/);
  assert.doesNotMatch(p.faq[1].a, /immobilised/);   // no frozen file given: no amount
  const p2 = RS.sanctionsPage("de", SANC, { nameOf: i => SANC.countries[i].name, href: () => "", frozen: RS.frozenFacts(FROZ) });
  assert.match(p2.faq[1].a, /in der EU immobilisiert/);
  assert.equal(p2.title, "Sanktionen gegen Russland nach Ländern: EU, USA, UK u. a.");
});

test("frozen amounts: the file's figure with its date, never zero where there is none, an estimate marked; explainers' amounts from the file", () => {
  assert.match(RS.frozenLines("en", FROZ, "BEL"), /data-v="185"[^>]*>€185bn<\/span> \(December 2025/);
  assert.match(RS.frozenLines("en", FROZ, "BEL"), /€202bn<\/span> of sanctioned Russian assets on its balance sheet \(June 2026\); that figure overlaps/);
  const jpn = RS.frozenLines("en", FROZ, "JPN");
  assert.match(jpn, />no public figure<\/span> \(estimate: about €28bn\)/);
  assert.doesNotMatch(jpn, /€0/);
  assert.match(RS.frozenLines("en", FROZ, "LUX"), />&lt;€1m<\/span>/);   // "below EUR 10,000", not zero
  assert.match(RS.frozenLines("en", FROZ, "PRT"), /No public figure has been published/);
  assert.equal(RS.frozenLines("en", FROZ, "CHN"), "");
  for (const l of I.LANGS) {
    const a = RS.explainAmount(l, "frozenAssets", FROZ).vars.amountText, b = RS.explainAmount(l, "reparationsLoan", FROZ).vars.amountText;
    assert.ok(a.includes(I.E(l, FROZ.totals.eu_cbr.v)) && a.includes(I.E(l, 202)), l);
    assert.ok(b.includes(I.E(l, 90)) && b.includes(I.E(l, 19.8)), l);
    assert.doesNotMatch(I.explainText(l, "reparationsLoan", { amountText: b }, { amount: 1 }).a, /\{|\}/);
  }
  assert.match(RS.explainAmount("en", "reparationsLoan", FROZ).vars.amountText, /^Where it stands: proposed, not adopted\./);
  assert.doesNotMatch(RS.explainAmount("en", "reparationsLoan", FROZ).vars.amountText, /funded by Russian assets/);
});

test("Russia's oil and gas revenue: every figure on the page and in the CSV is the file's", () => {
  for (const l of I.LANGS) {
    const p = RS.revenuePage(l, REV, { warIncome: "/russia-war-income/", published: "2026-10-09", months: 24, yearWord: "Year" });
    const marks = [...p.body.matchAll(/data-rv="revenue:([^"]+)" data-v="([^"]+)"/g)];
    assert.ok(marks.length > 150, l);
    for (const [, path, v] of marks) {
      const segs = path.split("."); let x = REV;
      for (const s of segs) x = s.includes("@") ? x[s.split("@")[0]].find(m => m.ym === s.split("@")[1]) : x[s];
      assert.equal(String(x === null ? "null" : x), v, `${l} ${path}`);
    }
    assert.equal(new Set(marks.filter(([, p0]) => p0.startsWith("monthly@")).map(([, p0]) => p0.split(".")[0])).size, 24);
    assert.doesNotMatch(p.body + p.intro, /pays for the army|who funds/i);
    assert.match(p.body, /href="\/russia-war-income\/"/);
  }
  const csv = RS.revenueCsv(REV);
  assert.equal(csv.monthly.split("\n").length, REV.monthly.length + 1);
  assert.ok(csv.yearly.includes("\n2019,12,true,7924.3,"));
});

test("a country page gets the sanctions section and question; the frozen section the amounts", () => {
  const regime = { title: "Sanctions on Russia", q: "Does Testland have sanctions on Russia?", a: "No. x", html: "<div>x</div>" };
  const r = SC.countryDyn(mkC(), OPT({ regime, stock: '<p class="stock">Amounts</p>' }));
  assert.equal(r.faq[r.faq.length - 1].id, "regime");
  assert.ok(r.sections.some(s => s.id === "sanctions-on-russia"));
  assert.ok(r.sections.find(s => s.id === "frozen").html.includes("Amounts"));
  const nd = SC.countryDyn(mkC({ net: null, noData: true }), OPT({ regime }));
  assert.deepEqual(nd.faq.map(x => x.id), ["nodata", "regime"]);
  assert.deepEqual(nd.sections.map(s => s.id), ["sanctions-on-russia"]);
});

// ----- round 59 (owner approved: "titles in the words people search") -----
const DEMAND = JSON.parse(readFileSync(join(HERE, "seo_demand.json"), "utf8"));
const PHR = JSON.parse(readFileSync(join(HERE, "seo_families.json"), "utf8")).country.phrasing;
const W_FR = { ...W, leanU: "Tendance vers l'Ukraine", leanR: "Tendance vers la Russie", party: "Partie à la guerre", sure: "très probable" };

test("round 59: the country page asks the question searched in its language, where the data answer it", () => {
  // the rule, from seo_families.json and the volumes in seo_demand.json
  assert.deepEqual(T.askOf("en", "u_sure", DEMAND.CAN, PHR), { title: "given", verb: "", given: true, trade: false });
  // round 59b: no default verb: a country without searches for the question about Russia is not asked it in that verb
  assert.equal(PHR.defaultHelp, undefined);
  // and a phrasing searched less than minDemand on its own is not used (Germany: "support" 40, "helping" 10)
  assert.equal(T.askOf("en", "u_sure", DEMAND.DEU, PHR).verb, "");
  assert.equal(T.askOf("en", "u_sure", DEMAND.USA, PHR).verb, "");
  assert.equal(T.askOf("en", "r_sure", DEMAND.HUN, PHR).verb, "support");
  assert.equal(T.askOf("en", "party", DEMAND.BLR, PHR).title, "support");
  assert.equal(T.askOf("en", "party", DEMAND.PRK, PHR).title, "helping");   // "is North Korea helping Russia" is searched more
  assert.equal(T.askOf("en", "r_sure", DEMAND.IND, PHR).trade, true);
  assert.equal(T.askOf("de", "r_sure", {}, PHR).title, null);                 // no searches in German: the level's own title
  assert.equal(T.askOf("en", "u_sure", DEMAND.HUN, PHR).title, "support");    // a very likely page answers the question too
  // the titles: English, and the searched forms in French, German, Polish and Dutch
  const C = (l, f, nameL, words, iso) => T.countryCopy(l, { ...f, nameL, words, demand: DEMAND[iso], phrasing: PHR });
  assert.equal(C("en", FX.DEU, "Germany", W, "DEU").title, "How much has Germany given to Ukraine? €74.7bn since 2022");
  assert.equal(C("en", FX.BLR, "Belarus", W, "BLR").title, "Does Belarus support Russia? Party to the war, 3.6% of GDP");
  assert.equal(C("en", FX.BLR, "Belarus", W, "BLR").h1, "Does Belarus support Russia? Party to the war (with Russia)");
  assert.equal(C("de", FX.DEU, "Deutschland", W_DE, "DEU").title, "Ukraine-Hilfe Deutschland: 74,7 Mrd. € seit 2022");
  assert.equal(C("fr", FX.DEU, "France", W_FR, "FRA").title, "Combien la France a donné à l'Ukraine ? 74,7 Md€ depuis 2022");
  assert.equal(C("fr", FX.DEU, "France", W_FR, "FRA").h1, "Combien la France a donné à l'Ukraine depuis 2022 ?");
  assert.match(C("pl", FX.DEU, "Polska", W_DE, "POL").title, /^Ile Polska dała Ukrainie\? /);
  assert.match(C("nl", FX.DEU, "Nederland", W_DE, "NLD").title, /^Hoeveel heeft Nederland aan Oekraïne gegeven\? /);
  // a level that is not very likely keeps the map's chance words in the title
  assert.equal(C("en", FX.SVK, "Slovakia", W, "SVK").title, "Does Slovakia support Russia? Too close to call");
  assert.equal(C("en", { ...FX.BLR, party: false, name: "Serbia" }, "Serbia", W, "SRB").title, "Does Serbia support Russia? Leaning toward Russia");
  for (const l of T.LANGS) for (const iso of Object.keys(FX)) for (const which of ["given", "support", "helping"]) {
    const cat = T.category(FX[iso]); if (which === "given" && cat !== "u_sure") continue;
    const a = I.askText(l, which, cat, { N: "Testland", Nt: "Testland", ua: "€1bn", netP: "1%", netDir: "x", rus: "€1bn", leanWord: "L", uncWordCap: "U", zeroWord: "Z", partyWord: "P" }, { rusX: 1 }, "fallback");
    assert.ok(a.title.length <= 60 && !/[{}]/.test(a.title + a.h1), `${l} ${iso} ${which}`);
  }
});

test("round 59: the names' grammar for the localized questions", () => {
  const g = (l, n) => I.grammar(l, n);
  assert.equal(g("fr", "France").Na, "la France"); assert.equal(g("fr", "Allemagne").Na, "l'Allemagne"); assert.equal(g("fr", "Canada").Na, "le Canada");
  assert.equal(g("fr", "Pays-Bas").Na, "les Pays-Bas"); assert.ok(g("fr", "États-Unis").plural); assert.equal(g("fr", "Royaume-Uni").Na, "le Royaume-Uni");
  assert.equal(g("fr", "Corée du Sud").Na, "la Corée du Sud"); assert.equal(g("fr", "Israël").Na, "Israël"); assert.equal(g("fr", "Mexique").Na, "le Mexique");
  assert.equal(g("nl", "Verenigde Staten").Na, "de Verenigde Staten"); assert.equal(g("nl", "Verenigd Koninkrijk").Na, "het Verenigd Koninkrijk");
  assert.equal(I.askQ("pl", "qGiven", "Polska"), "Ile Polska dała Ukrainie?"); assert.equal(I.askQ("pl", "qGiven", "Niemcy"), "Ile Niemcy dały Ukrainie?");
  assert.equal(I.askQ("pl", "qGiven", "Izrael"), "Ile Izrael dał Ukrainie?"); assert.equal(I.askQ("pl", "qGiven", "Peru"), "Ile Peru dało Ukrainie?");
  assert.equal(I.askQ("fr", "qGiven", "Pays-Bas"), "Combien les Pays-Bas ont donné à l'Ukraine ?");
});

test("round 59: the country page's questions and trade heading in the searched phrasing; their scores add the volumes", () => {
  const ask = { title: "support", verb: "support", given: false, trade: true };
  const r = SC.countryDyn(mkC(), OPT({ ask }));
  assert.equal(r.faq.find(x => x.id === "help").q, "Does Testland support Russia?");
  assert.equal(r.sections.find(s => s.id === "trade").title, "Testland–Russia trade");
  const t = r.faq.find(x => x.id === "trade");
  if (t) assert.equal(t.q, "Testland–Russia trade: how much since 2022?");
  const r0 = SC.countryDyn(mkC(), OPT());
  assert.equal(r0.faq.find(x => x.id === "help").q, "Is Testland helping Russia?");
  assert.equal(r0.sections.find(s => s.id === "trade").title, I.dyn("en", "tTrade"));
  // the volumes raise a question's score
  const x = SC.facts(mkC(), OPT()), base = SC.pickFaq(x).find(q => q.id === "trade");
  const up = SC.pickFaq({ ...x, ask: { trade: 880 } }).find(q => q.id === "trade");
  assert.ok(up && (!base || up.score > base.score));
});

test("round 59: the topic pages' notes and questions, every language; the revenue page's defence question and the balance hook", () => {
  const vars = { n: 9, tops: "A, B and C", t1: "A", topV: "€1bn", sumUa: "€9bn", nSure: 2, sureWord: "very likely", partyList: "P", partyWord: "Party", partyWordLc: "party", euroclear: "€1bn", euroclearDate: "June 2026", euCbr: "€2bn", euCbrDate: "May 2026" };
  const FUEL0 = RJ("fuel_split_r59.json");
  for (const l of I.LANGS) for (const slug of Object.keys(I.TOPIC_X)) {
    const fv = I.TOPIC_X_NEEDS[slug] === "fuel" ? RS.fuelVars(l, FUEL0, iso => FUEL0.countries[iso].name) : { vars: {}, nums: {} };
    const x = I.topicExtra(l, slug, { ...vars, ...fv.vars }, { nParty: 1, nSure: 2, ...fv.nums });
    assert.ok(x.faq.length >= 1 && x.faq.every(f => f.q.trim().endsWith("?") && !/[{}]/.test(f.q + f.a)), `${l} ${slug}`);
  }
  assert.match(I.topicExtra("en", "countries-helping-russia", vars, { nParty: 1, nSure: 2 }).note, /^Looking for Russia's allies\?/);
  for (const l of I.LANGS) {
    const p = RS.revenuePage(l, REV, { warIncome: "/russia-war-income/", published: "2026-10-09", months: 24, yearWord: "Year" });
    assert.ok(p.title.length <= 60 && p.description.length <= 155, l);
    assert.equal(p.faq[1].q, I.res(l, "rQ3"));
    assert.ok(!p.faq.some(f => f.q === I.res(l, "rQ4")), l);   // without the deficit file: no question
  }
  const en = RS.revenuePage("en", REV, { warIncome: "/x/", published: "2026-10-09", months: 24, yearWord: "Year" });
  assert.equal(en.title, "Russia's war budget: defence spending vs oil and gas income");
  assert.equal(en.faq[0].q, "How much does Russia earn from oil?");
  assert.match(en.faq[1].a, /^Russia's budget law, as adopted, plans RUB 12,900bn for “national defence” in 2026, after RUB 13,500bn in 2025\. On a broader definition, SIPRI estimates Russia's military spending in 2025 at RUB 15,964bn, 7\.5% of GDP\./);
  // round 59b: the balance hook reads russia_deficit_r59.json (seo_families.json research.revenue.balance)
  const withBal = RS.revenuePage("en", REV, { warIncome: "/x/", published: "", months: 24, yearWord: "Year", deficit: RJ("russia_deficit_r59.json") });
  assert.match(withBal.faq[withBal.faq.length - 1].a, /^Russia's federal budget had a deficit of RUB 5,627bn \(€59bn, 2\.6% of GDP\) in 2025, from the Ministry of Finance's execution data\. From January to September 2026 the balance was a deficit of RUB 5,186bn \(€57\.9bn\)\. The budget law for 2026 set a deficit of RUB 3,786bn \(1\.6% of GDP\)\. The Ministry's estimate of 30 September 2026 is RUB 7,345bn \(3\.2% of GDP\) for the full year\.$/);
});

// ----- round 59b: the fuel split, the support by type and military aid, the budget balance (seo_research.mjs) -----
const FUEL = RJ("fuel_split_r59.json"), MIL = RJ("mil_split_r59.json"), DEF = RJ("russia_deficit_r59.json");
test("round 59b: the buyers of each fuel by their customs records, the three bases marked, estimates said as such", () => {
  for (const f of RS.FUELS) {
    const rows = RS.fuelRows(FUEL, f, 15);
    assert.deepEqual(rows.slice(0, 15), FUEL.top_buyers_2022_2026[f].gross_customs.map(x => x.iso3));
    // the map's own list adds the buyers its basis lists, after them
    for (const x of FUEL.top_buyers_2022_2026[f].site_basis) assert.ok(rows.includes(x.iso3), `${f} ${x.iso3}`);
  }
  const html = RS.fuelSection("en", FUEL, { nameOf: i => FUEL.countries[i].name, href: () => "", rows: 15 });
  assert.match(html, /<tr id="crude-CHN"><td class="r">1<\/td><td>China<\/td><td class="n" data-rv="fuel:countries\.CHN\.gross_customs_sum_2022_2026\.crude" data-v="257\.4619" data-u="eur">€257bn<\/td><td class="n" data-rv="fuel:countries\.CHN\.sum_2022_2026\.crude\.central"/);
  assert.match(html, /<tr id="crude-TUR">.*?data-v="C">C <span class="sub">\(estimate; customs do not name the supplier\)<\/span>/);
  assert.match(html, /<tr id="crude-BLR">.*?not tracked/);
  assert.match(html, /<tr id="crude-IND">.*?data-v="A">A<\/td>/);
  assert.doesNotMatch(html, /funded the war|bankroll|propping up|laundered/i);
  const v = RS.fuelVars("en", FUEL, i => FUEL.countries[i].name);
  assert.equal(v.vars.c1, "China"); assert.equal(v.vars.c1v, "€257bn"); assert.equal(v.vars.cTops, "China, India and Turkey"); assert.equal(v.nums.hidden, 1);
  for (const l of I.LANGS) {
    const h = RS.fuelSection(l, FUEL, { nameOf: i => FUEL.countries[i].name, href: () => "", rows: 15 });
    assert.ok(!/[{}]/.test(h) && h.includes('data-fuel="lng"'), l);
    const x = I.topicExtra(l, "russian-oil-gas-buyers", RS.fuelVars(l, FUEL, i => FUEL.countries[i].name).vars, RS.fuelVars(l, FUEL, i => FUEL.countries[i].name).nums);
    assert.equal(x.faq.length, 3, l);
    assert.ok(x.note && x.faq.every(f => f.q.endsWith("?") && !/[{}]/.test(f.a)), l);
  }
});

test("round 59b: a country's purchases by fuel where measured; the crude by year and its question where large and measured", () => {
  const cfg = { minEur: 0.1, quality: ["A", "B", "C"], crudeYears: { minEur: 10, quality: ["A", "B"] } };
  const names = { N: "India", Nt: "India", NtCap: "India", dataTo: "August 2026" };
  const ind = RS.fuelCountry("en", FUEL, "IND", cfg, names, "/russian-oil-gas-buyers/");
  assert.equal(ind.faq.q, "How much Russian oil does India buy?");
  assert.match(ind.faq.a, /^India's customs recorded these imports of crude oil from Russia \(CIF, by country of origin\): 2022 <span data-rv="fuel:countries\.IND\.years\.2022\.gross_customs\.crude" data-v="24\.\d+" data-u="eur">€24\.2bn<\/span>; 2023 .*2024 <span[^>]*>€48\.7bn<\/span>.*CREA's tracker, from ship data, estimates <span[^>]*>€31\.9bn<\/span> for 2025\./);
  assert.match(ind.html, /id="crude-by-year"/);
  // Germany: measured, but its customs recorded no crude to speak of in the last full year: no crude by year
  const deu = RS.fuelCountry("en", FUEL, "DEU", cfg, { N: "Germany", Nt: "Germany", NtCap: "Germany", dataTo: "August 2026" }, "/x/");
  assert.ok(deu && !deu.faq && !/crude-by-year/.test(deu.html));
  // China: large, but an estimate in a war year: the section, no question
  assert.equal(RS.fuelCountry("en", FUEL, "CHN", cfg, names, "/x/").faq, null);
  // no fuel split (quality D only) or too little fuel: no section
  const none = Object.keys(FUEL.countries).filter(i => !RS.fuelOf(FUEL, i, cfg));
  assert.ok(none.length > 0 && none.every(i => RS.fuelCountry("en", FUEL, i, cfg, names, "/x/") === null));
  for (const l of I.LANGS) {
    const b = RS.fuelCountry(l, FUEL, "IND", cfg, names, "/x/");
    assert.ok(b.faq.q.endsWith("?") && !/[{}]/.test(b.html + b.faq.a), l);
  }
});

test("round 59b: military aid by country, its steps from Kiel's figure, and no zero outside Kiel", () => {
  const o = { nameOf: i => MIL.countries[i].name, nameIn: i => I.inSentence("en", MIL.countries[i].name), href: () => "", pop: () => 10, dataTo: "August 2026", stepsMin: 1, gdpMin: 5 };
  const p = RS.milPage("en", MIL, o);
  const ms = p.rows.map(i => MIL.countries[i].military);
  assert.deepEqual(ms, ms.slice().sort((a, b) => b - a));
  assert.equal(p.rows[0], "USA");
  assert.match(p.body, /<tr id="MKD">.*?not in Kiel/);
  assert.match(p.body, /No military aid record found/);
  assert.ok(!p.rows.includes("BRA") && /Brazil/.test(p.body.split('id="no-record"')[1]));
  assert.equal(p.faq[0].q, "Which country gave the most military aid to Ukraine?");
  assert.match(p.faq[0].a, /the table starts with the United States, Germany and the United Kingdom: the United States €47\.4bn\. By the Kiel Institute's allocations, the United States with €64\.6bn\./);
  assert.match(p.faq[1].a, /€28\.1bn of the aid Kiel records was not yet delivered by August 2026.*The United Kingdom's ERA loan \(€2\.6bn\)|€28\.1bn of the aid Kiel records was not yet delivered by August 2026.*The United Kingdom's ERA loan \(€2\.7bn\)/);
  for (const l of I.LANGS) {
    const x = RS.milPage(l, MIL, { ...o, nameIn: i => I.inSentence(l, MIL.countries[i].name) });
    assert.ok(x.title.length <= 60 && x.description.length <= 155 && x.faq.every(f => f.q.endsWith("?") && !/[{}]/.test(f.a)) && !/[{}]/.test(x.body), l);
  }
  // the country page: the parts add up to the map's figure; a zero outside Kiel is "no record found"
  const gbr = RS.milCountry("en", MIL, "GBR", { Nt: "the United Kingdom", NtCap: "The United Kingdom", dataTo: "August 2026" }, "/m/");
  assert.match(gbr.html, /Kiel: €16\.2bn/);
  const nr = Object.keys(MIL.countries).find(i => RS.milNoRecord(MIL, i) && Math.abs(MIL.countries[i].total_site) >= 0.0005);
  // round 60 (audit: words in a column of figures): no record is a dash in the cell, its words in the title and the note
  assert.match(RS.milCountry("en", MIL, nr, { Nt: "X", NtCap: "X", dataTo: "August 2026" }, "/m/").html, /data-rv="military:countries\.\w+\.military" data-v="0" title="no record found">–/);
  assert.match(RS.milCells("en", MIL, nr), /title="no record found">–/);
});

test("round 59b: the budget balance, the plans labelled, the fund; the CSV files are the files' figures", () => {
  const b = RS.deficitBlock("en", DEF, { months: 24 });
  for (const y of DEF.yearly) assert.ok(b.includes(`data-rv="deficit:yearly@${y.year}.balance_rub"`), y.year);
  assert.match(b, /<td>Budget law, as signed<\/td><td>28 November 2025<\/td>/);
  assert.match(b, /Ministry of Finance estimate, with the draft budget for the next years<\/td><td>30 September 2026<\/td>.*?>RUB 7,345bn<\/td><td class="n"[^>]*>3\.2%<\/td>/);
  assert.match(b, /data-rv="deficit:plans\.2026_execution_to_date\.balance_rub" data-v="-5185\.6" data-u="rub" data-sg="-1">RUB 5,186bn</);
  assert.match(b, /data-rv="deficit:yearly@2025\.balance_rub" data-v="-5626\.5" data-u="rub">−RUB 5,627bn</);
  assert.match(b, /data-rv="deficit:nwf@2026-10-01\.liquid_rub_bn"[^>]*>RUB 3,800bn</);
  assert.doesNotMatch(b, /pays for the war|drained|because of the war/i);
  const fc = RS.fuelCsv(FUEL).split("\n");
  assert.equal(fc.length - 1, Object.values(FUEL.countries).reduce((a, c) => a + Object.keys(c.years).length, 0) * 7);
  assert.ok(fc.some(r => r.startsWith("IND,India,2024,January-December,crude,31.2287,") && r.endsWith(",48.7148,38.4319,A")));
  const mc = RS.milCsv(MIL).split("\n");
  assert.equal(mc.length - 1, Object.keys(MIL.countries).length);
  assert.ok(mc.some(r => r.startsWith("DEU,Germany,21.882,16.418,32.496,recorded,25.004,")));
  assert.ok(mc.some(r => /,no record found,/.test(r)));
  assert.match(RS.fuelLlms(FUEL, i => FUEL.countries[i].name)[0], /^- Crude oil, 2022 to August 2026: China €257bn customs \(CIF\), €217bn map basis \(FOB\), €236bn CREA tracker; India /);
});

// ----- round 62: the chart images (seo_images.mjs) -----
import * as GI from "./seo_images.mjs";

// France as the map gave it (round 61 data): its three numbers in the panel's words, and the parts of its support
const chartC = (o = {}) => ({ iso: "FRA", name: "France", party: false, noData: false, mostlyNoData: false,
  fig: { net: 43.63, netLo: 22.54, netHi: 65.31, ua: 16.87, uaLo: 12.9, uaHi: 24.75, rus: 20.22, rusLo: -0.39, rusHi: 40.39, frozen: 6.53 },
  net: { pre: "Toward Ukraine by", big: "1.6%", post: "", eur: "€43.6bn", range: "likely 0.80% to 2.3% toward Ukraine", chance: "very likely · >99%", unc: false, info: { level: "sure" } },
  ua: { pre: "Supported Ukraine with", big: "0.60%", post: "", eur: "€16.9bn", range: "likely 0.46% to 0.88%", chance: "very likely · >99%", unc: false, info: { level: "sure" } },
  rus: { pre: "Probably cut Russia's earnings from trade by", big: "0.72%", post: "", eur: "€20.2bn", range: "likely from 0.01% toward Russia to 1.4% toward Ukraine", unc: true, info: { level: "lean" } },
  frozen: { verb: "Froze Russian money: Russia lost 0.23% of GDP in returns", eur: "€6.5bn" },
  measures: { "part:aid": { v: 4.261 }, "part:euaid": { v: 9.822 }, "part:ref": { v: 1.804 } }, ...o });
const chartW = l => ({ title: "How much has France given to Ukraine since 2022?", period: I.img(l, "period", { dataTo: "August 2026" }), source: I.img(l, "source", { host: "warbalance.org", date: "31 August 2026" }),
  unit: I.img(l, "uCountry"), legendSigned: I.s(l, "legendSigned"), range: I.img(l, "range"), support: T.L(l, "support"), trade: T.L(l, "trade"), frozen: T.L(l, "frozen"), net: T.L(l, "net"),
  ofGdp: T.L(l, "ofGdp"), party: T.L(l, "party"), partNames: { aid: I.partName(l, "aid"), euaid: I.partName(l, "euaid"), ref: I.partName(l, "ref") }, other: I.img(l, "other") });

test("round 62: every chart phrase in every language, with the same placeholders; file names plain, stable and distinct", () => {
  const ph = s => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(",");
  for (const k of Object.keys(I.IMG.en)) for (const l of I.LANGS) {
    assert.ok(I.IMG[l] && typeof I.IMG[l][k] === "string" && I.IMG[l][k].trim(), l + " " + k);
    assert.equal(ph(I.IMG[l][k]), ph(I.IMG.en[k]), l + " " + k);
  }
  for (const l of I.LANGS) {
    assert.deepEqual(Object.keys(I.IMG_FILE[l]).sort(), Object.keys(I.IMG_FILE.en).sort(), l);
    const paths = Object.keys(I.IMG_FILE[l]).map(k => GI.imgPath(l, k, "france"));
    assert.equal(new Set(paths).size, paths.length, l);
    for (const p of paths) assert.match(p, l === "en" ? /^\/img\/[a-z0-9-]+\.webp$/ : new RegExp(`^/img/${l}/[a-z0-9-]+\\.webp$`), p);
  }
  // the address does not carry the data's date, so it stays the same when the data change
  assert.equal(GI.imgPath("en", "eur"), "/img/ukraine-aid-by-country.webp");
  assert.equal(GI.imgPath("de", "country", "france"), "/img/de/france-ukraine-hilfe-und-handel-mit-russland.webp");
});

test("round 62: a country's chart: support with parts that add up, trade, frozen money and the net, in the map's words", () => {
  const m = GI.countryChart({ c: chartC(), l: "en", words: chartW("en") });
  assert.deepEqual(m.rows.map(r => r.key), ["ua", "rus", "frozen", "net"]);
  const ua = m.rows[0];
  assert.equal(ua.value, "+€16.9bn");
  assert.ok(Math.abs(ua.parts.reduce((a, p) => a + p.v, 0) - 16.87) < 1e-9, "the parts add up to the support");
  assert.deepEqual(ua.parts.map(p => p.k), ["aid", "euaid", "ref", "other"]);
  assert.equal(ua.segs.length, 4);
  // + toward Ukraine; a direction that is not certain is paler
  assert.equal(m.rows[1].tone, "uaF");
  assert.equal(m.rows[3].tone, "ua");
  assert.match(m.rows[3].words, /^Toward Ukraine by 1\.6% of a year's GDP since 2022 · likely 0\.80% to 2\.3% toward Ukraine · very likely/);
  assert.match(m.alt, /^France, 2022 to August 2026\. Supported Ukraine with 0\.60% .*\(€16\.9bn\): Government aid to Ukraine \+€4\.3bn, Share of EU aid to Ukraine \+€9\.8bn, Cost of hosting refugees from Ukraine \+€1\.8bn/);
  // toward Russia: orange and "−"; a part below zero is listed, not stacked
  const ru = GI.countryChart({ c: chartC({ fig: { ...chartC().fig, net: -11.4, netLo: -18.6, netHi: -1.4, rus: -12.3, rusLo: -19.5, rusHi: -2.3 },
    net: { ...chartC().net, pre: "Toward Russia by", eur: "€11.4bn" }, measures: { "part:aid": { v: -0.5 } } }), l: "en", words: chartW("en") });
  assert.equal(ru.rows.find(r => r.key === "net").value, "−€11.4bn");
  assert.equal(ru.rows.find(r => r.key === "net").tone, "ru");
  assert.equal(ru.rows[0].segs, null);
  // no data: no chart (the page keeps its share card); a party to the war says so unless the title does
  assert.equal(GI.countryChart({ c: chartC({ noData: true }), l: "en", words: chartW("en") }), null);
  assert.equal(GI.countryChart({ c: chartC({ party: true }), l: "en", words: chartW("en") }).party, T.L("en", "party"));
  assert.equal(GI.countryChart({ c: chartC({ party: true }), l: "en", words: { ...chartW("en"), title: "Does Belarus support Russia? Party to the war (with Russia)" } }).party, "");
  // every language draws, with nothing left unfilled
  for (const l of I.LANGS) {
    const x = GI.countryChart({ c: chartC(), l, words: chartW(l) });
    assert.ok(!/\{\w|undefined|NaN/.test(JSON.stringify(x) + GI.chartHtml(x, "warbalance.org")), l);
  }
});

test("round 62: a ranking chart's axis holds every bar and range with zero; the first image on a page is not lazy", () => {
  const d = GI.domain([{ v: 5, lo: 2, hi: 9 }, { v: -3, lo: -6, hi: 1 }]);
  assert.deepEqual(d, { lo: -6, hi: 9 });
  const d2 = GI.domain([{ v: 2, lo: 1, hi: 3 }], 0.5);
  assert.equal(d2.lo, 0);
  assert.equal(d2.hi, 4.5);
  const m = GI.rankChart({ key: "eur", l: "en", title: I.img("en", "tEur"), unit: I.img("en", "uEur"), period: "2022 to August 2026", source: "s", alt: "a",
    rows: [{ name: "A & B", v: 2, lo: 1, hi: 3, value: "€2bn", tone: "ua" }] });
  assert.equal(m.rows[0].rank, 1);
  assert.ok(GI.chartHtml(m, "warbalance.org").includes("A &amp; B"));
  const img = { path: "/img/x.webp", alt: "Support \"x\"", l: "en" };
  assert.match(GI.figureHtml(img), /fetchpriority="high"/);
  assert.doesNotMatch(GI.figureHtml(img), /loading=/);
  assert.match(GI.figureHtml(img, { lazy: true }), /loading="lazy"/);
  assert.match(GI.figureHtml(img), /alt="Support &quot;x&quot;" width="1200" height="630"/);
  assert.equal(GI.imageObject(img, p => "https://warbalance.org" + p).contentUrl, "https://warbalance.org/img/x.webp");
});

// ----- round 63 (independent SEO audit) -----
const LOC_HUN = { net: { chance: "very likely · 97%", range: "likely 0.72% to 9.8% toward Russia" }, kept: "Russia kept €12.3bn (6.4% of GDP) more than without the war", uaVerb: "Support", ua: { eur: "€0.67bn" } };
test("round 63: a page whose title asks the Russia question opens with the trade with Russia and the net, in every language", () => {
  // Hungary: support above zero, but the title asks about Russia: the answer first, then the support sentence
  const h = T.countryCopy("en", { ...FX.HUN, words: W, loc: LOC_HUN });
  assert.ok(h.russiaFirst);
  assert.equal(h.intro.split(". ").slice(0, 2).join(". "), "Russia kept €12.3bn more in taxes and profit from trade with Hungary since 2022 than without the war. The net is 6.0% of GDP toward Russia (very likely, 97%)");
  assert.match(h.intro, /\(very likely, 97%\)\. Hungary has given Ukraine €0\.67bn/);
  assert.match(h.intro2, /The net's range: likely 0\.72% to 9\.8% toward Russia\.$/);
  // China-like: support below zero, toward Russia: the trade first, the support sentence after it
  const chn = T.countryCopy("en", { ...FX.HUN, iso: "XCN", name: "Testland", ua: -0.52, uaPct: -0.003, words: W, loc: { ...LOC_HUN, uaVerb: "Bought less from Ukraine than without the war", ua: { eur: "€521m" } } });
  assert.match(chn.intro, /^Russia kept €12\.3bn more in taxes and profit from trade with Testland since 2022 than without the war\. The net is 6\.0% of GDP toward Russia \(very likely, 97%\)\. Bought less from Ukraine/);
  // an "essentially zero" page and a too-close-to-call page answer first too
  assert.match(T.countryCopy("en", { ...FX.AUS, words: W, loc: { net: { chance: "essentially zero", range: "about 0" } } }).intro, /^Russia kept €1\.9bn more .*The net is 0\.04% of GDP toward Russia \(essentially zero\)\./);
  assert.match(en(FX.SVK).intro, /^Russia kept €0\.91bn more in taxes and profit from trade with Slovakia/);
  // a page whose title asks what it gave, with support above zero, is as it was; a party to the war too
  const deu = T.countryCopy("en", { ...FX.DEU, words: W, loc: LOC_HUN });
  assert.ok(!deu.russiaFirst);
  assert.equal(deu.intro, "Germany has given Ukraine €74.7bn since 2022 (1.8% of GDP).");
  assert.ok(!en(FX.BLR).russiaFirst);
  // every language: the amount Russia kept and the net come before the support sentence, with the chance words
  for (const l of T.LANGS) {
    const x = T.countryCopy(l, { ...FX.HUN, nameL: "Hungary", words: W_DE, loc: LOC_HUN });
    const iR = x.intro.search(/12[,.]3|12\.300/), iU = x.intro.search(/0[,.]67|670|700/);
    assert.ok(x.russiaFirst && iR >= 0 && iU > iR, l + " " + x.intro);
    assert.match(x.intro, /\(very likely, 97%\)/, l);
    assert.ok(!/\{|undefined/.test(x.intro + x.intro2), l);
  }
  // the rule
  assert.equal(T.russiaLead("u_sure", { title: null }, true), false);
  assert.equal(T.russiaLead("u_sure", { title: "support" }, true), true);
  assert.equal(T.russiaLead("r_sure", { title: "given" }, true), false);
  assert.equal(T.russiaLead("zero", { title: null }, true), true);
  assert.equal(T.russiaLead("u_net", { title: null }, false), true);
  assert.equal(T.russiaLead("party", { title: "support" }, true), false);
  assert.equal(T.russiaLead("nodata", { title: null }, false), false);
});

test("round 63: 'How much has X given to Ukraine?' only where its support is above zero", () => {
  // Nigeria: very likely toward Ukraine through trade, support −€50m: no "given" title in any language, even where searched
  const nga = { ...FX.DEU, iso: "NGA", name: "Nigeria", ua: -0.05, uaPct: -0.011, rus: 1.9, rusPct: 0.43, net: 1.85, netPct: 0.42,
    cN: { level: "sure", p: 0.96, side: "ukraine", sideWords: "toward Ukraine" }, demand: { ask: Object.fromEntries(T.LANGS.map(l => [l, { given: 5000 }])) }, phrasing: PHR };
  const given = /given|Wie viel|Combien|Cuánto|Ile |Hoeveel|скільки/i;
  for (const l of T.LANGS) {
    const x = T.countryCopy(l, { ...nga, nameL: "Nigeria", words: l === "en" ? W : W_DE, loc: { net: { chance: "very likely · 96%", range: "likely 0.04% to 0.80% toward Ukraine" }, uaVerb: "Bought less", ua: { eur: "€50m" } } });
    assert.ok(!given.test(x.title) && !given.test(x.h1), l + " " + x.title);
    assert.ok(!x.title.includes("−") && x.title.length <= T.TITLE_MAX && x.description.length <= T.DESC_MAX, l + " " + x.title);
    assert.equal(x.ask.title, null, l);
  }
  assert.equal(T.countryCopy("en", { ...nga, words: W }).title, "Nigeria: Ukraine or Russia? 0.42% of GDP toward Ukraine");
  assert.equal(T.countryCopy("en", { ...nga, words: W }).h1, "Does Nigeria support Ukraine or Russia? What the money flows show");
  // where the question about Russia is searched, it asks that instead (and answers it with the net toward Ukraine)
  assert.match(T.countryCopy("en", { ...nga, words: W, demand: { ask: { en: { support: 500 } } } }).title, /^Does Nigeria support Russia\? 0\.42% of GDP toward Ukraine$/);
  // a positive support keeps the question about what it gave
  assert.match(T.countryCopy("en", { ...nga, ua: 2, uaPct: 0.4, words: W }).title, /^How much has Nigeria given to Ukraine\?/);
});

test("round 63: only the listed comparison pairs are indexed; names in lists take their article", () => {
  const C = [mk("AAA", "Aland", 100, 4, 2, 2), mk("BBB", "Bland", 50, -1, 0.5, -1.5), mk("CCC", "Cland", 40, 1, 0.4, 0.6)];
  const cmp = compareEntries({ compare: { pairwiseTop: 3, pairs: [["BBB", "AAA"]] } }, C);
  assert.deepEqual(cmp.map(e => [e.slug, e.index]), [["bland-vs-aland", true], ["aland-vs-cland", false], ["bland-vs-cland", false]]);
  // the real list: a few dozen pairs, each indexed once
  const n = FAM.compare.pairs.length;
  assert.ok(n >= 20 && n <= 60 && new Set(FAM.compare.pairs.map(p => p.slice().sort().join())).size === n);
  // "met de Verenigde Staten", "mit den Vereinigten Staaten", "par les États-Unis"
  assert.equal(I.inList("nl", "Verenigde Staten"), "de Verenigde Staten");
  assert.equal(I.inList("de", "Vereinigte Staaten"), "den Vereinigten Staaten");
  assert.equal(I.inList("de", "Niederlande"), "den Niederlanden");
  assert.equal(I.inList("de", "Deutschland"), "Deutschland");
  assert.equal(I.inList("fr", "États-Unis"), "les États-Unis");
  assert.equal(I.inList("en", "the United States"), "the United States");
  assert.match(I.yearCopy("nl", { kind: "ua", y: 2025, partial: false, month: "augustus", n: 3, top: ["Verenigde Staten", "Duitsland", "Nederland"], topV: "€1", dataTo: "augustus 2026" }).intro, /met de Verenigde Staten, Duitsland en Nederland\.$/);
});

test("round 63: the ranking and the trade page in every language fit; the method pages have their own descriptions", () => {
  const facts = { n: 150, topUa: ["A", "B", "C"], topRu: ["D", "E", "F"], parties: ["G", "H"], ruMore: [["X", -128], ["Y", -70.5]], ruLess: ["Z", 72.6], euroTop: [], shareTop: [], y1: 2026, dataTo: "August 2026" };
  const seen = new Set();
  for (const l of T.LANGS) for (const page of ["ranking", "trade-with-russia"]) {
    const c = T.staticCopy(page, facts, l);
    assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX && !/[{}]|undefined/.test(c.title + c.description + c.h1 + c.intro), `${l} ${page} ${c.title}`);
    if (l !== "en") assert.ok(!seen.has(c.title), l + page), seen.add(c.title);
  }
  assert.equal(T.staticCopy("ranking", facts, "pl").title, "Pomoc dla Ukrainy: ranking państw 2022–2026");
  assert.match(T.staticCopy("ranking", facts, "de").title, /^Welche Länder unterstützen die Ukraine am meisten\?/);
  for (const key of ["method/reading", "method/prices"]) {
    const d = T.docCopy("Heading", "Germany, 2022 to August 2026, in the current build:", key).description;
    assert.ok(d.length >= 120 && d.length <= 155 && !/\d{4}/.test(d), key + " " + d.length);
  }
  assert.equal(T.docCopy("H", "One. Two.").description, "One. Two.");
});

// round 65 (SEO audit, fix 1): a page's lastmod moves only when what it says changes, not its template, fonts or scripts
test("round 65: the content hash covers the title, description and main text, not the head, scripts or navigation", () => {
  const page = ({ title = "Does Benin support Ukraine or Russia?", desc = "Too close to call.", css = "/pages.css?v=aaaa", font = "a.woff2", nav = "Map", num = "0.36%", ld = "2026-10-01" } = {}) =>
    `<!doctype html><html><head><title>${title}</title><meta name="description" content="${desc}"><link rel="preload" href="/fonts/${font}"><link rel="stylesheet" href="${css}">` +
    `<script type="application/ld+json">{"dateModified":"${ld}"}</script></head><body><header class="top"><nav><a href="/">${nav}</a></nav></header>` +
    `<main class="wrap"><h1>Benin</h1><p>Net ${num} of GDP.</p><img src="/img/benin.webp?v=${css}" alt="Chart: net ${num}"><script>var x = "${css}";</script></main><footer>Updated ${ld}</footer></body></html>`;
  const h0 = T.contentHash(page());
  // the template, the fonts, the scripts, the navigation, the JSON-LD and the footer's date: the same hash
  assert.equal(T.contentHash(page({ css: "/pages.css?v=bbbb", font: "b.woff2", nav: "Karte", ld: "2026-10-30" })), h0);
  // a number in the main text, the title or the description: another hash
  for (const x of [{ num: "0.37%" }, { title: "Benin: Ukraine or Russia?" }, { desc: "Leaning toward Ukraine." }]) assert.notEqual(T.contentHash(page(x)), h0, JSON.stringify(x));
  assert.match(T.pageContent(page()), /Net 0\.36% of GDP\. Chart: net 0\.36%/);
  assert.doesNotMatch(T.pageContent(page()), /pages\.css|woff2|dateModified|Updated/);
  // the stored date stays while the hash is the same; a new or changed page takes today
  assert.equal(T.lastmodOf([h0, "2026-10-01"], h0, "2026-10-30"), "2026-10-01");
  assert.equal(T.lastmodOf(["0000", "2026-10-01"], h0, "2026-10-30"), "2026-10-30");
  assert.equal(T.lastmodOf(undefined, h0, "2026-10-30"), "2026-10-30");
});

// round 65 (SEO audit, fix 3): snippets say "of GDP", lead with the verdict and the middle value, and a chance too close to
// call is said in words (not "56% toward Russia", easily read as 56% of the money)
test("round 65: descriptions: the chance in words, the verdict and middle value first, of GDP", () => {
  const benin = { ...FX.SVK, iso: "XBN", name: "Benin", netPct: 0.36, uaPct: 0.004,
    cN: { level: "unc", p: 0.56, side: "russia", sideWords: "toward Russia", dirWords: "toward Ukraine", disagree: true },
    loc: { net: { range: "likely from 1.5% toward Russia to 3.4% toward Ukraine" } } };
  const c = en(benin);
  assert.match(c.description, /^Too close to call: slightly more likely toward Russia \(56% chance\)\./);
  assert.doesNotMatch(c.description, /\(\d+% toward|likely from|one year's GDP|…/);
  const de = T.countryCopy("de", { ...benin, nameL: "Benin", words: W_DE });
  assert.match(de.description, /etwas wahrscheinlicher toward Russia \(Wahrscheinlichkeit 56%\)/);
  assert.doesNotMatch(de.description, /eines Jahres-BIP/);
  for (const f of [FX.AUS, FX.BLR, { ...FX.SVK, cN: { ...FX.SVK.cN, level: "lean" } }]) {
    const d = en({ ...f, loc: { net: { range: "likely from 0.26% toward Russia to 1.4% toward Ukraine" } } }).description;
    assert.doesNotMatch(d, /one year's GDP|likely from/, d);
  }
});

// round 65 (SEO audit, fix 2): a comparison's description gives both headline numbers, in every language, uncut
test("round 65: comparison descriptions give both headline nets, without an ellipsis", () => {
  const c = I.compareCopy("en", { A: "Germany", B: "France", a: { netP: "3.7%", dir: "toward Ukraine" }, b: { netP: "1.6%", dir: "toward Ukraine" } });
  assert.equal(c.description, "Germany: 3.7% of GDP toward Ukraine; France: 1.6% toward Ukraine. Aid and trade with Russia since 2022, compared.");
  for (const l of T.LANGS) for (const [A, B] of [["Germany", "France"], ["Saint Vincent and the Grenadines", "Bosnia and Herzegovina"]]) {
    const x = I.compareCopy(l, { A, B, a: { netP: "<0.01%", dir: "toward Russia" }, b: { netP: "12.3%", dir: "toward Ukraine" } });
    assert.ok(x.description.length <= 150 && !x.description.includes("…") && x.description.includes("12.3%"), l + " " + x.description);
  }
  // without the figures of one of them: the description without numbers
  assert.doesNotMatch(I.compareCopy("en", { A: "Germany", B: "Nauru", a: { netP: "3.7%", dir: "toward Ukraine" }, b: null }).description, /3\.7%/);
});
