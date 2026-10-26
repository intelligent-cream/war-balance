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

test("the templates give the approved copy", () => {
  assert.equal(T.countryCopy("en", FX.DEU).title, "How much has Germany given Ukraine? €74.7bn since 2022");
  assert.equal(T.countryCopy("en", FX.DEU).description, "Germany supported Ukraine with €74.7bn (1.8% of one year's GDP) since 2022. With trade with Russia counted: 3.7% of GDP toward Ukraine, very likely.");
  assert.equal(T.countryCopy("en", FX.SVK).title, "Is Slovakia helping Ukraine or Russia? Too close to call");
  assert.equal(T.countryCopy("en", FX.HUN).title, "Is Hungary helping Russia? 6.0% of GDP toward Russia");
  assert.equal(T.countryCopy("en", FX.BLR).title, "Is Belarus helping Russia? Party to the war, 3.6% of GDP");
  assert.equal(T.countryCopy("en", FX.AUS).title, "How much has Australia given Ukraine? €1.3bn since 2022");
  assert.equal(T.countryCopy("de", FX.DEU).title, "Wie viel hat Deutschland der Ukraine gegeben? 74,7\u00a0Mrd.\u00a0€");
  assert.equal(T.countryCopy("pl", FX.HUN).h1, "Czy Węgry pomagają Rosji? Co pokazują przepływy pieniędzy");
  assert.deepEqual(T.countryLangs(FX.DEU), T.LANGS);
  // round 56: every country has a page in every language
  assert.deepEqual(T.countryLangs(FX.SVK), T.LANGS);
});

test("a title's chance word follows the category", () => {
  const unc = { ...FX.DEU, iso: "XXA", name: "Testland", cN: { level: "unc", p: 0.55, side: "ukraine" } };
  assert.match(T.countryCopy("en", unc).title, /Too close to call/);
  const lean = { ...unc, cN: { level: "lean", p: 0.8, side: "russia" } };
  assert.match(T.countryCopy("en", lean).title, /Leaning Russia/);
  // the Slovakia override is only used while Slovakia is too close to call
  assert.doesNotMatch(T.countryCopy("en", { ...FX.SVK, cN: { level: "sure", p: 0.99, side: "ukraine" } }).description, /Too close/);
});

test("titles fit in 60 characters and descriptions in 155, for every category and long names", () => {
  const long = ["Saint Vincent and the Grenadines", "Bosnia and Herzegovina", "Turks and Caicos Islands", "Central African Republic", "Holy See (Vatican City State)"];
  const levels = [["sure", "ukraine"], ["sure", "russia"], ["lean", "ukraine"], ["lean", "russia"], ["unc", "russia"], ["near", "ukraine"], ["zero", "russia"]];
  for (const name of long) for (const [level, side] of levels) for (const party of [false, true]) for (const k of [0.004, 1.23456, 123.456]) {
    const f = { ...FX.DEU, iso: "XXA", name, party, netPct: k, uaPct: k, rusPct: -k, net: k * 40, ua: k * 30, rus: -k * 20, netLoPct: -k, netHiPct: 2 * k, cN: { level, p: 0.97, side }, cR: { level, p: 0.9, side } };
    const c = T.countryCopy("en", f);
    assert.ok(c.title.length <= T.TITLE_MAX, c.title);
    assert.ok(c.description.length <= T.DESC_MAX, c.description);
  }
  for (const l of T.LANGS) {
    const h = T.homeCopy(l, 191);
    assert.ok(h.title.length <= T.TITLE_MAX && h.description.length <= T.DESC_MAX, l);
    for (const iso of T.TOP) for (const side of ["ukraine", "russia"]) {
      if (l === "en") continue;
      const c = T.countryCopy(l, { ...FX.DEU, iso, cN: { level: "sure", p: 0.99, side } });
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
    paid: { v: 10 }, frozen: { v: 0 } }, ...extra });
const CS = [mk("AAA", "Aland", 100, 4, 2, 2), mk("BBB", "Bland", 50, -1, 0.5, -1.5), mk("CCC", "Cland", 3, 0.3, 0.3, 0), mk("DDD", "Dland", 20, -2, 0, -2, { party: true })];
// the countries the config names in its questions ({iso:...}), with the measures it asks for
const named = (iso, extra = {}) => { const c = mk(iso, iso, 50, 1, 1, 0, extra); c.measures.armed = { v: 2 }; return c; };
const CS_NAMED = CS.concat([named("IRN"), named("PRK", { party: true }), named("CHN"), named("USA")]);

test("every config entry builds a page with titles and descriptions that fit", () => {
  const slugs = new Set();
  for (const e of TOPICS) {
    assert.ok(!slugs.has(pathOf(e)), "two entries at " + pathOf(e)); slugs.add(pathOf(e));
    const m = buildTopic(e, CS_NAMED, TOPICS, { dataTo: "August 2026" });
    assert.ok(m.title.length <= T.TITLE_MAX, e.slug + ": " + m.title);
    assert.ok(m.description.length <= T.DESC_MAX, e.slug + ": " + m.description);
    assert.ok(m.h1 && m.intro && !/\{\w/.test(m.intro + m.title + m.description + JSON.stringify(m.faq)), e.slug);
  }
});

test("a topic ranks, totals and leaves out parties as configured", () => {
  const e = { slug: "t", kind: "topic", title: "T", description: "{top1} first; {sum:net_eur}, {sum:net_pct} {sum:net_dir}; {nToU:net} sure toward Ukraine; {cmp:paid:ua}", h1: "H", intro: "I", rank: "net", sort: "gdp" };
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
  assert.match(html, /<tr data-iso="AAA">.*data-q="net" data-level="sure"><b class="pos">\+4\.0%/);
  assert.match(html, /data-total="net"><span>Net<\/span><b class="pos">\+4\.2%/);
  assert.match(html, /Party to the war/);
  assert.throws(() => buildTopic({ ...e, title: "{nope}" }, CS, [], { dataTo: "" }), /unknown placeholder/);
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
  const words = { leanU: "Tendenz Richtung Ukraine", leanR: "Tendenz Richtung Russland", near: "nahe null", zero: "praktisch null", unc: "zu knapp für eine Aussage", party: "Kriegspartei" };
  const levels = [["sure", "ukraine", "u_sure"], ["sure", "russia", "r_sure"], ["lean", "ukraine", "u_lean"], ["lean", "russia", "r_lean"], ["unc", "russia", "unc"], ["near", "ukraine", "zero"], ["zero", "russia", "zero"]];
  for (const l of I.LANGS.filter(x => x !== "en")) for (const name of ["Schweiz", "St. Vincent und die Grenadinen", "Demokratische Republik Kongo"]) for (const [level, side, cat] of levels) for (const party of [false, true]) {
    const f = { ...FX.DEU, iso: "XXA", name, nameL: name, party, words, cN: { level, p: 0.97, side }, cR: { level, p: 0.9, side } };
    const c = T.countryCopy(l, f);
    assert.ok(c.title.length <= T.TITLE_MAX && c.description.length <= T.DESC_MAX, l + " " + c.title + " | " + c.description);
    const want = party ? "kriegspartei" : cat === "u_lean" ? "tendenz richtung ukraine" : cat === "r_lean" ? "tendenz richtung russland" : cat === "unc" ? "zu knapp" : cat === "zero" ? (level === "near" ? "nahe null" : "praktisch null") : "";
    if (l === "de" && want) assert.ok(c.title.toLowerCase().includes(want), c.title);
  }
  // the ten most searched countries keep their hand-written titles while very likely
  assert.match(T.countryCopy("fr", { ...FX.HUN, nameL: "Hongrie", words }).title, /^La Hongrie aide-t-elle la Russie \?/);
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
  assert.match(html, /data-q="ua" data-year="2023"><b class="pos">\+3 Mrd\. €/);
  assert.match(html, /im Jahr 2023/);
});
