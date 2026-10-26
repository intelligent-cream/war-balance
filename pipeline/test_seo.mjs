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
  assert.equal(T.countryCopy("de", FX.DEU).title, "Wie viel hat Deutschland der Ukraine gegeben? 74,7 Mrd. €");
  assert.equal(T.countryCopy("pl", FX.HUN).h1, "Czy Węgry pomagają Rosji? Co pokazują przepływy pieniędzy");
  assert.deepEqual(T.countryLangs(FX.DEU), T.LANGS);
  assert.deepEqual(T.countryLangs(FX.SVK), ["en"]);
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

test("every config entry builds a page with titles and descriptions that fit", () => {
  const slugs = new Set();
  for (const e of TOPICS) {
    assert.ok(!slugs.has(pathOf(e)), "two entries at " + pathOf(e)); slugs.add(pathOf(e));
    const m = buildTopic(e, CS, TOPICS, { dataTo: "August 2026" });
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
