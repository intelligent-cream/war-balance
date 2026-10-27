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
const W = { leanU: "Leaning toward Ukraine", leanR: "Leaning toward Russia", near: "near zero", zero: "essentially zero", unc: "too close to call", party: "Party to the war", sure: "very likely", lean: "likely" };
const W_DE = { leanU: "Tendenz Richtung Ukraine", leanR: "Tendenz Richtung Russland", near: "nahe null", zero: "praktisch null", unc: "zu knapp für eine Aussage", party: "Kriegspartei", sure: "sehr wahrscheinlich", lean: "wahrscheinlich" };
const en = f => T.countryCopy("en", { ...f, words: W });

test("the templates give the copy of the one country template", () => {
  assert.equal(en(FX.DEU).title, "How much has Germany given to Ukraine? €74.7bn since 2022");
  // round 57: every chance and direction word is the map's ({sureWord}, {netDir})
  assert.equal(en(FX.DEU).description, "Support for Ukraine from Germany since 2022: €74.7bn (1.8% of one year's GDP). With trade with Russia counted: 3.7% of GDP toward Ukraine, very likely.");
  assert.equal(en(FX.SVK).title, "Is Slovakia helping Ukraine or Russia? Too close to call");
  // round 59: in English a very likely or party page asks the question searched more overall (seo_families.json defaultHelp)
  assert.equal(en(FX.HUN).title, "Does Hungary support Russia? 6.0% of GDP toward Russia");
  assert.equal(en(FX.BLR).title, "Does Belarus support Russia? Party to the war, 3.6% of GDP");
  // round 57: Australia's hand-written override is gone; it has the title of its chance level
  assert.equal(en(FX.AUS).title, "Australia: Ukraine or Russia? Net essentially zero");
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
  const html = readFileSync(join(HERE, "..", "site", "index.html"), "utf8");
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
    const m = buildTopic(e, CS_NAMED, TOPICS, { dataTo: "August 2026", words: W });
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
  kiel: "", fig: { net: 0.05, netPct: 0.02, ua: 0.016, uaPct: 0.006, rusPct: 0.01, frozen: 0, cN: { level: "zero", p: 0.58, side: "russia", sideWords: "toward Russia" } },
  net: { signed: "+0.02%", range: "likely from 2.7% toward Russia to 2.8% toward Ukraine", chance: "essentially zero", chanceSentence: "A 58% chance toward Russia; 11% of the other method choices agree." },
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

test("direction words follow the chance, not the middle value's sign; years change side only when it is a finding", () => {
  const r = SC.countryDyn(mkC(), OPT());
  const help = r.faq.find(x => x.id === "help").a;
  assert.match(help, /essentially zero/);
  assert.match(help, /A 58% chance toward Russia/);
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
  assert.match(p.faq[1].a, /^The EU's sanctions on Russia are set in Council Regulations 833\/2014 and 269\/2014, which every member agreed to in the Council\. The EU's 27 members apply them, and 10 other European countries adopt them/);
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
  assert.deepEqual(T.askOf("en", "u_sure", DEMAND.CAN, PHR), { title: "given", verb: "support", given: true, trade: false });
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
  for (const l of I.LANGS) for (const slug of Object.keys(I.TOPIC_X)) {
    const x = I.topicExtra(l, slug, vars, { nParty: 1, nSure: 2 });
    assert.ok(x.faq.length >= 1 && x.faq.every(f => f.q.trim().endsWith("?") && !/[{}]/.test(f.q + f.a)), `${l} ${slug}`);
  }
  assert.match(I.topicExtra("en", "countries-helping-russia", vars, { nParty: 1, nSure: 2 }).note, /^Looking for Russia's allies\?/);
  for (const l of I.LANGS) {
    const p = RS.revenuePage(l, REV, { warIncome: "/russia-war-income/", published: "2026-10-09", months: 24, yearWord: "Year", balance: "budget_balance_yearly" });
    assert.ok(p.title.length <= 60 && p.description.length <= 155, l);
    assert.equal(p.faq[1].q, I.res(l, "rQ3"));
    assert.ok(!p.faq.some(f => f.q === I.res(l, "rQ4")), l);   // no balance series in the file yet: no question
  }
  const en = RS.revenuePage("en", REV, { warIncome: "/x/", published: "2026-10-09", months: 24, yearWord: "Year" });
  assert.equal(en.title, "Russia's war budget: defence spending vs oil and gas income");
  assert.equal(en.faq[0].q, "How much does Russia earn from oil?");
  assert.match(en.faq[1].a, /^Russia's budget law, as adopted, plans RUB 12,900bn for “national defence” in 2026, after RUB 13,500bn in 2025\. On a broader definition, SIPRI estimates Russia's military spending in 2025 at RUB 15,964bn, 7\.5% of GDP\./);
  const withBal = RS.revenuePage("en", { ...REV, budget_balance_yearly: { 2025: { balance_rub_bn: -5650, balance_share_gdp: -0.026 } } }, { warIncome: "/x/", published: "", months: 24, yearWord: "Year", balance: "budget_balance_yearly" });
  assert.match(withBal.faq[withBal.faq.length - 1].a, /^Russia's federal budget balance in 2025: a deficit of RUB 5,650bn \(2\.6% of GDP\)/);
});
