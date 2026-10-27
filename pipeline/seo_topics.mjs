// Round 55 (topic and group pages, owner: "similar pages loading the same thing"): one generic page for every entry of
// pipeline/seo_topics.json. A page is a ranked table of countries by one of the panel's measures, with its totals, a short
// FAQ answered from the same figures, related pages and a link to the matching view of the map. Adding a page is adding
// one entry to the config; nothing here knows any page by name.
//
// Every figure comes from the map at deploy (seo_extract.mjs: each country's measures as its panel has them, with the
// likely range and the chance in the panel's words). Here the figures are only selected, sorted, added up for a group
// (members' best estimates, and their share of the members' combined GDP) and written out.
//
// buildTopic() is pure (pipeline/test_seo.mjs tests it); renderTopic() turns its result into the page's HTML.
//
// Round 56 (more findable pages): the same page for the generated families (seo_families.mjs: one part of the panel,
// one year) and in every site language (renderTopic(m, { lang }): the frames from seo_i18n.mjs, each country's range and
// chance words from the map in that language). An entry with a year ranks that year's own amounts.

import { P as PL, E as EL, PP as PPL, s as S, measureName, list3 as list3L, fitTitle, fitDesc, fmt, inSentence, cap, armedPair } from "./seo_i18n.mjs";

const P = x => PL("en", x), E = bn => EL("en", bn).replace(/ /g, " ");
// the measures a page can rank by or show, with their column labels (seo_i18n.mjs MEASURE and PART)
export const label = (key, l = "en") => measureName(l, key);
// how a measure is written: "signed" (+ toward Ukraine, − toward Russia), "kept" (how much more or less Russia kept than
// without the war: "€5.2bn more"), or "amount" (a plain sum). Round 56: every part of the panel is signed (a part such as
// shipping income is the shipping country's, not Russia's, so "Russia kept more" would be wrong); frozen money and the
// parts outside the totals are plain sums
const AMOUNT_PART = new Set(["frozen", "frozen_priv", "prem", "disc", "seized", "exits", "trapped", "aidge", "margin", "tariff"]);
export const style = k => (k === "net" || k === "ua" ? "signed" : k === "rus" || k === "paidGain" ? "kept"
  : k.startsWith("part:") ? (AMOUNT_PART.has(k.slice(5)) ? "amount" : "signed") : "amount");
// measures whose cell carries the panel's chance (checked against the model by check 48)
export const CHANCE_KEYS = ["net", "ua", "rus"];
export const pathOf = e => (e.kind === "group" ? `/group/${e.slug}/` : e.kind === "compare" ? `/compare/${e.slug}/` : `/${e.slug}/`);
const SIDES = new Set(["RUS", "UKR"]);   // the two sides the money is measured toward: no figure of their own

const fmtSigned = v => (v > 0 ? "+" : v < 0 ? "−" : "");
const pp = (v, pop) => (pop ? (v * 1000) / pop : null);   // € bn and population in millions → € per person
const fmtPP = x => PPL("en", x);
const list3 = a => list3L("en", a);
const capSentences = s => s.replace(/(^|[.?!]\s+)the /g, "$1The ");

// a measure's value for one country (null when it has none); with a year, that year's own amount (net, ua or rus)
const YEAR_KEY = { ua: "uaBn", rus: "rusBn", net: "netBn" };
export function mv(c, key, year) {
  if (key === "fuelShare") return c.fuelSharePreWar == null ? null : { v: c.fuelSharePreWar };
  if (year && YEAR_KEY[key]) { const r = (c.years || []).find(x => x.y === year); return r && r[YEAR_KEY[key]] != null ? { v: r[YEAR_KEY[key]], year, ytd: r.ytd } : null; }
  const m = c.measures && c.measures[key];
  return m && m.v != null ? m : null;
}
const inUnit = (c, v, sort) => (sort === "eur" ? v : sort === "pp" ? pp(v, c.pop) : c.gdp ? (100 * v) / c.gdp : null);

// the page's model: which countries, in which order, the totals and every filled-in text.
// opts: dataTo (the data's last month), words (the map's chance words: {word:sure} ...), l (the language of the names),
// armed (round 58: [{ iso, items }], the countries whose data have the kinds of supplies they sent to Russia, in the
// config's order: seo_families.json armedItems, already checked against the data by armedOf below)
export function buildTopic(e, countries, all, { dataTo, words = {}, l = "en", armed = [] }) {
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  const year = e.year || null, mv0 = mv, mvY = (c, k) => mv0(c, k, year);
  const sort = e.sort || "gdp", key = e.rank || "net", minGdp = e.minGdp ?? (e.kind === "group" ? 0 : sort === "eur" ? 0 : 5);
  const exclude = new Set(e.exclude || []);
  const inSet = c => !exclude.has(c.iso) && (e.members ? e.members.includes(c.iso) : e.regions ? e.regions.includes(c.region) : true);
  const pool = countries.filter(inSet);
  const usable = c => !c.party && !c.noData && !c.mostlyNoData && c.gdp && mvY(c, key);
  let rows = pool.filter(c => usable(c) && c.gdp >= minGdp);
  if (e.nonzero) rows = rows.filter(c => Math.abs(mvY(c, key).v) >= 0.0005);
  if (e.onlySide === "russia") rows = rows.filter(c => mvY(c, key).v < 0);
  if (e.onlySide === "ukraine") rows = rows.filter(c => mvY(c, key).v > 0);
  const val = c => inUnit(c, mvY(c, key).v, sort) ?? -Infinity;
  rows.sort((a, b) => (e.order === "asc" ? val(a) - val(b) : e.order === "abs" ? Math.abs(val(b)) - Math.abs(val(a)) : val(b) - val(a)));
  if (e.limit) rows = rows.slice(0, e.limit);
  const party = pool.filter(c => c.party && c.gdp && mvY(c, key) && Math.abs(mvY(c, key).v) >= 0.0005 && (e.onlySide !== "russia" || mvY(c, key).v < 0) && (e.onlySide !== "ukraine" || mvY(c, key).v > 0));
  const noData = pool.filter(c => (c.noData || c.mostlyNoData) && !c.party);
  const sides = (e.members || []).filter(i => SIDES.has(i));
  const missing = (e.members || []).filter(i => !SIDES.has(i) && !byIso[i]);
  const extra = (e.extraRows || []).map(i => byIso[i]).filter(Boolean);
  // ----- totals: the members' best estimates added up, and as a share of their combined GDP -----
  const sumOf = (set, k) => {
    const xs = set.map(c => mvY(c, k)).filter(Boolean);
    const v = xs.reduce((a, m) => a + m.v, 0), gdp = set.filter(c => mvY(c, k)).reduce((a, c) => a + c.gdp, 0), pop = set.filter(c => mvY(c, k)).reduce((a, c) => a + (c.pop || 0), 0);
    return { v, gdp, pop, pct: gdp ? (100 * v) / gdp : 0, n: xs.length };
  };
  const groups = Object.fromEntries((all || []).filter(x => x.members).map(x => [x.slug, x]));
  const subSet = slug => { const g = groups[slug]; return g ? countries.filter(c => g.members.includes(c.iso) && !c.party && !c.noData && !c.mostlyNoData && c.gdp) : []; };
  const nameOf = c => c.name || c.nameEn;
  const nm = c => inSentence("en", nameOf(c));
  const level = (c, k) => { const m = mvY(c, k); return m ? m.level : ""; };
  const bySet = (which, k) => rows.filter(c => (which === "Unsure" ? level(c, k) && level(c, k) !== "sure" : level(c, k) === "sure" && mvY(c, k).side === (which === "ToU" ? "ukraine" : "russia")));
  const members = (e.members || []).filter(i => !SIDES.has(i)).length || rows.length;
  const sideName = i => S(l, i === "RUS" ? "russia" : "ukraine");
  // a measure no country has is a typo in the config: the build stops
  const must = k => { if (!countries.some(c => mvY(c, k))) throw new Error(`no country has the measure “${k}”`); return k; };
  // the words a placeholder stands for (round 57: the words that depend on the data are written with {if:...} in the
  // config, from the values below; the old {cmp:...}, {ratio:...} and {sum:KEY_dir} are gone)
  const text = ph => {
    let m;
    if (ph === "n") return String(rows.length);
    if (ph === "members") return String(members);
    if (ph === "dataTo") return dataTo;
    if (ph === "partyList") return list3(party.map(nm));
    if (ph === "memberNames") return list3((e.members || []).map(i => (byIso[i] ? nm(byIso[i]) : SIDES.has(i) ? sideName(i) : i)));
    if ((m = ph.match(/^(name|the):([A-Z]{3})$/))) { const c = byIso[m[2]]; if (!c) throw new Error(`seo_topics.json ${e.slug}: no country ${m[2]}`); return m[1] === "name" ? nameOf(c) : nm(c); }
    if ((m = ph.match(/^word(Cap)?:(\w+)$/))) { const w = words[m[2]]; if (w === undefined) return undefined; return m[1] ? cap(w) : w; }
    if ((m = ph.match(/^top(\d)$/))) return rows[+m[1] - 1] ? nm(rows[+m[1] - 1]) : "";
    if (ph === "top3list") return list3(rows.slice(0, 3).map(nm));
    if ((m = ph.match(/^top(\d)_(eur|pct|pp)$/))) {
      const c = rows[+m[1] - 1]; if (!c) return "";
      const v = mvY(c, key).v;
      return m[2] === "eur" ? E(v) : m[2] === "pct" ? P((100 * v) / c.gdp) : c.pop ? fmtPP(pp(v, c.pop)) + " " + S("en", "perPerson") : "";
    }
    if ((m = ph.match(/^top(\d)by:([\w:]+?)(_eur|_pct)?$/))) {
      const by = rows.filter(c => mvY(c, m[2])).sort((a, b) => Math.abs(mvY(b, m[2]).v) - Math.abs(mvY(a, m[2]).v));
      if (m[1] === "3" && !m[3]) return list3(by.slice(0, 3).map(nm));
      const c = by[+m[1] - 1]; if (!c) return "";
      return m[3] === "_eur" ? E(mvY(c, m[2]).v) : m[3] === "_pct" ? P((100 * mvY(c, m[2]).v) / c.gdp) : nm(c);
    }
    if ((m = ph.match(/^sum:([\w:]+?)_(eur|pct|pp)$/))) {
      const s = sumOf(rows, must(m[1]));
      return m[2] === "eur" ? E(s.v) : m[2] === "pct" ? P(s.pct) : s.pop ? fmtPP(pp(s.v, s.pop)) + " " + S("en", "perPerson") : "";
    }
    if ((m = ph.match(/^sub:([\w-]+):n$/))) return String(subSet(m[1]).length);
    if ((m = ph.match(/^sub:([\w-]+):([\w:]+?)_(eur|pct)$/))) { const s = sumOf(subSet(m[1]), m[2]); return m[3] === "eur" ? E(s.v) : P(s.pct); }
    // round 56: one named country's figure, wherever it is in the table (or outside it: a party to the war)
    if ((m = ph.match(/^iso:([A-Z]{3}):([\w:]+?)_(eur|pct)$/))) {
      const c = byIso[m[1]], x = c && mvY(c, m[2]);
      if (!x) throw new Error(`seo_topics.json ${e.slug}: no ${m[2]} for ${m[1]}`);
      return m[3] === "eur" ? E(x.v) : P((100 * x.v) / c.gdp);
    }
    if ((m = ph.match(/^(n|names)(ToU|ToR|Unsure):([\w:]+)$/))) { const set = bySet(m[2], m[3]); return m[1] === "n" ? String(set.length) : set.length ? list3(set.map(nm)) : "–"; }
    return undefined;
  };
  // the values a condition reads ({if:sum:paid>sum:ua|...|...})
  const num = ph => {
    let m;
    if (ph === "n") return rows.length;
    if (ph === "members") return members;
    if (ph === "nParty") return party.length;
    if ((m = ph.match(/^sum:([\w:]+)$/))) return countries.some(c => mvY(c, m[1])) ? sumOf(rows, m[1]).v : undefined;
    if ((m = ph.match(/^sub:([\w-]+):n$/))) return subSet(m[1]).length;
    if ((m = ph.match(/^sub:([\w-]+):([\w:]+)$/))) return groups[m[1]] && countries.some(c => mvY(c, m[2])) ? sumOf(subSet(m[1]), m[2]).v : undefined;
    if ((m = ph.match(/^iso:([A-Z]{3}):([\w:]+)$/))) { const x = byIso[m[1]] && mvY(byIso[m[1]], m[2]); return x ? x.v : undefined; }
    if ((m = ph.match(/^top(\d):([\w:]+)$/))) { const c = rows[+m[1] - 1], x = c && mvY(c, m[2]); return x ? x.v : 0; }
    if ((m = ph.match(/^n(ToU|ToR|Unsure):([\w:]+)$/))) return bySet(m[1], m[2]).length;
    return undefined;
  };
  // round 58: the searchers' words for weapons sent to Russia ("North Korea soldiers and shells, Iran drones")
  const armedOne = x => (byIso[x.iso] ? armedPair(l, nameOf(byIso[x.iso]), x.items) : "");
  const armedList = armed.map(armedOne).filter(Boolean).join(", ");
  const text0 = text, num0 = num;
  const text1 = ph => { let m; if (ph === "armedList") return armedList; if ((m = ph.match(/^armed:([A-Z]{3})$/))) { const x = armed.find(a => a.iso === m[1]); return x ? armedOne(x) : ""; } return text0(ph); };
  const num1 = ph => { let m; if (ph === "nArmed") return armedList ? armed.length : 0; if ((m = ph.match(/^armed:([A-Z]{3})$/))) return armed.some(a => a.iso === m[1] && byIso[a.iso]) ? 1 : 0; return num0(ph); };
  const fill = s => { try { return capSentences(fmt(String(s), text1, num1)); } catch (err) { throw new Error(`seo_topics.json ${e.slug}: ${err.message}`); } };
  const forms = x => (x == null ? [""] : Array.isArray(x) ? x : [x]).map(fill);
  // an entry of a generated family (seo_families.mjs) or a page in another language has its words from seo_i18n.mjs
  const title = fitTitle(forms(e.title)), description = fitDesc(forms(e.description));
  const totals = ["net", "ua", "rus", "frozen"].map(k => ({ key: k, ...sumOf(rows, k) }));
  const subtotals = (e.subtotals || []).filter(s => groups[s]).map(s => ({ slug: s, label: groups[s].label, n: subSet(s).length, sums: ["ua", "paid", "paidGain", "net"].map(k => ({ key: k, ...sumOf(subSet(s), k) })) }));
  return {
    path: pathOf(e), kind: e.kind, slug: e.slug, label: e.label, key, sort, order: e.order || "desc", title, description, h1: fill(e.h1 || ""), intro: fill(e.intro || ""), year, side: e.side || "", moneyNote: e.moneyNote || "",
    // a column every listed country has nothing in (frozen money in the Gulf states) is left out
    columns: (e.columns || (e.kind === "group" ? ["ua", "rus", "frozen"] : [])).filter(k => k !== key && rows.some(c => mvY(c, k) && Math.abs(mvY(c, k).v) >= 0.0005)), rows, party, noData, sides, missing, extra,
    faq: (e.faq || []).map(x => ({ q: fill(x.q), a: fill(x.a) })), sections: (e.sections || []).map(s => ({ h2: s.h2 && fill(s.h2), p: (s.p || []).map(fill), list: (s.list || []).map(fill) })),
    notes: (e.notes || []).map(fill), armedList, nArmed: num1("nArmed"), explain: e.explain || [], totals, subtotals, map: e.map || "#view=rank", related: e.related || [], minGdp,
  };
}

// round 58: the countries of seo_families.json armedItems whose data have what the config names: weapons and troops
// sent to Russia of at least minEur at full value (the extract's armedFull) and the config's source among the sources of
// their military_rus entry (data.json). cfg: armedItems; countries: the extract's; sources: { iso: [source ids] }
export function armedOf(cfg, countries, sources) {
  if (!cfg || !cfg.list) return [];
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  return Object.entries(cfg.list).filter(([iso, x]) => byIso[iso] && (byIso[iso].armedFull || 0) >= (cfg.minEur ?? 0.05) && (sources[iso] || []).includes(x.src) && (x.items || []).length)
    .map(([iso, x]) => ({ iso, items: x.items }));
}

// ----- the HTML of a page's main part (the shell, header and footer are seo_pages.mjs's) -----
export const TOPIC_CSS = `td.m i,.tot i{font-style:normal;white-space:nowrap}td.m{text-align:right;min-width:8.6em}td.m b{font-size:15.5px;white-space:nowrap}td.m .s{display:block;font-size:12.5px;line-height:1.35;color:var(--soft);white-space:normal}
td.m .pos,b.pos{color:var(--ukr)}td.m .neg,b.neg{color:var(--rus-t)}th.m{text-align:right;min-width:8.6em}td.r{color:var(--soft);font-size:13px;width:2em}
.tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px;margin:14px 0}.tot div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.tot b{display:block;font:800 22px/1.2 var(--fd)}.tot span{font-size:13.5px;color:var(--soft)}
ul.bul{padding-left:20px}ul.bul li{margin:0 0 6px}`;

// l: the page's language; the countries in m are that language's (their names, ranges and chance words the map's)
export function renderTopic(m, { esc, cPath, l = "en" }) {
  const T = (k, v, n) => S(l, k, v, n), Pl = x => PL(l, x), El = x => EL(l, x), PPl = x => PPL(l, x), lab = k => label(k, l);
  const name = c => (l === "en" ? c.nameEn : c.name || c.nameEn);
  const cls = v => (v >= 0.0005 ? "pos" : v <= -0.0005 ? "neg" : "");
  // a short figure is kept on one line ("+€0.25bn"); a longer phrase may wrap
  const keep = x => (x.length <= 24 ? `<i>${esc(x)}</i>` : esc(x));
  // a figure in the measure's own way of writing: "+1.8%", "€5.2bn more", "€547bn"
  const say = (k, v, s, g = "") => { const st = style(k); if (Math.abs(v) < 0.0005 || /^(<|€0m|0\u00a0)/.test(s)) return s + g; return st === "kept" ? T("figKept", { s: s + g }, { x: v }) : (st === "signed" && !/^<?0[.,]01/.test(s) && !s.startsWith("<") ? fmtSigned(v) + s : s) + g; };
  // a measure in its own cell: the main figure in the page's unit, the others beside it, then the range and chance
  const cell = (c, k, main) => {
    const x = mv(c, k, m.year);
    const yr = m.year && YEAR_KEY[k] ? ` data-year="${m.year}"` : "";
    if (!x) return `<td class="m" data-q="${k}"${yr}>–</td>`;
    if (k === "fuelShare") return `<td class="m" data-q="${k}"><b>${Math.round(x.v * 100)}%</b><span class="s">${esc(T("fuelShare"))}</span></td>`;
    const pct = c.gdp ? (100 * x.v) / c.gdp : null, per = pp(x.v, c.pop);
    const f = { gdp: pct == null ? "" : say(k, x.v, Pl(pct)), eur: say(k, x.v, El(x.v)), pp: per == null ? "" : say(k, x.v, PPl(per) + " " + T("perPerson")) };
    const unit = main ? m.sort : "eur", first = f[unit];
    const rest = ["gdp", "eur", "pp"].filter(u => u !== unit && f[u] && (main || u === "gdp")).map(u => (u === "gdp" ? say(k, x.v, Pl(pct), " " + T("ofGdp")) : f[u]));
    const words = [x.range, x.chance].filter(Boolean).join(" · ");
    return `<td class="m" data-q="${k}"${yr}${x.level ? ` data-level="${x.level}"` : ""}><b class="${style(k) !== "amount" ? cls(x.v) : ""}">${esc(first)}</b><span class="s">${rest.map(keep).join(" · ")}</span>${main && words ? `<span class="s">${esc(words)}</span>` : ""}${main && x.name && k.startsWith("part:") ? `<span class="s">${esc(x.name)}</span>` : ""}${!main && x.chance ? `<span class="s">${esc(x.chance)}</span>` : ""}</td>`;
  };
  const head = `<thead><tr><th>#</th><th>${esc(T("country"))}</th><th class="m">${esc(lab(m.key))}</th>${m.columns.map(k => `<th class="m">${esc(lab(k))}</th>`).join("")}</tr></thead>`;
  const row = (c, i) => `<tr data-iso="${c.iso}"><td class="r">${i == null || m.kind === "compare" ? "" : i + 1}</td><td><a href="${cPath(c)}">${esc(name(c))}</a>${c.gdp < 5 ? ` <span class="ev">${esc(T("small"))}</span>` : ""}</td>${cell(c, m.key, true)}${m.columns.map(k => cell(c, k, false)).join("")}</tr>`;
  const tot = m.kind === "group" && m.rows.length ? `<div class="tot" aria-label="${esc(T("groupTotals"))}">${m.totals.filter(t => t.n && Math.abs(t.v) >= 0.0005).map(t => {
    const what = t.key === "rus" ? T("totRus", { v: El(t.v) }, { x: t.v }) : t.key === "ua" ? T("totUa", { v: El(t.v) }) : t.key === "frozen" ? T("totFrozen", { v: El(t.v) }) : T("totNet", { v: El(t.v) }, { x: t.v });
    return `<div data-total="${t.key}"><span>${esc(lab(t.key))}</span><b class="${cls(t.v)}">${esc(say(t.key, t.v, Pl(t.pct)))}</b><span>${[T("ofCombined"), what, t.key === "net" || t.key === "ua" ? say(t.key, t.v, PPl(pp(t.v, t.pop))) + " " + T("perPerson") : ""].filter(Boolean).map(keep).join(" · ")}</span></div>`;
  }).join("")}</div><p class="sub">${esc(T("totals", { n: m.rows.length }))}</p>` : "";
  const subs = m.subtotals.map(s => `<p class="sub" data-subtotal="${s.slug}"><b>${esc(s.labelL || s.label)} (${s.n})</b>: ${s.sums.map(x => `${esc(lab(x.key))}: ${esc(say(x.key, x.v, El(x.v)))} (${esc(say(x.key, x.v, Pl(x.pct), " " + T("ofGdp")))})`).join(" · ")}</p>`).join("");
  const others = [
    m.party.length ? `<h2 id="party">${esc(T("party"))}</h2><ul class="plain">${m.party.map(c => { const x = mv(c, m.key, m.year); return `<li><a href="${cPath(c)}">${esc(name(c))}</a>: ${esc(lab(m.key))} ${esc(x ? say(m.key, x.v, El(x.v)) : "–")}</li>`; }).join("")}</ul>` : "",
    m.sides.length ? `<p class="sub">${esc(T("sides", { x: list3L(l, m.sides.map(i => (i === "RUS" ? T("russia") : T("ukraine")))) }))}</p>` : "",
    m.kind === "group" && m.noData.length ? `<h2 id="no-data">${esc(T("noData"))}</h2><p class="sub">${esc(T("noDataText"))} ${m.noData.map(c => `<a href="${cPath(c)}">${esc(name(c))}</a>`).join(", ")}</p>` : "",
    m.extra.length ? `<h2 id="outside">${esc(T("outside"))}</h2><div class="tbl"><table>${head}<tbody>${m.extra.map(c => row(c, null)).join("")}</tbody></table></div>` : "",
  ].join("\n");
  // the order of the table, said neutrally (round 57: no "largest first")
  const O = T("order"), st0 = style(m.key), ord = m.order === "abs" ? O.bySize : m.order === "asc" ? (st0 === "kept" ? O.keptMoreLess : st0 === "amount" ? O.bySize : O.ruUa) : st0 === "kept" ? O.keptLessMore : m.key === "net" ? O.uaRu : O.hiLo;
  const legend = [...new Set([m.key, ...m.columns].map(style))].map(st => (st === "kept" ? T("legendKept") : st === "signed" ? T("legendSigned") : "")).filter(Boolean);
  const rankNote = `${m.year ? T("rankByYear", { m: lab(m.key), unit: T("unit")[m.sort], order: ord, y: m.yearL || m.year }) : T("rankBy", { m: lab(m.key), unit: T("unit")[m.sort], order: ord, to: m.dataToL || "" })}${m.kind !== "group" && m.minGdp > 0 ? " " + T("minGdp", { gdpMin: El(m.minGdp) }) : ""} ${legend.length ? cap1(legend.join("; ")) + "." : ""}`;
  return `${tot}
${subs}
<h2 id="table">${esc(m.kind === "group" ? T("members") : T("ranking"))} · ${m.rows.length}</h2>
<p class="sub">${esc(rankNote.trim())}</p>
${m.side === "cost" ? `<p class="sub">${esc(T("notInTotals"))}</p>` : ""}
${m.notes.map(n => `<p class="sub">${esc(n)}</p>`).join("")}
<div class="tbl"><table class="topic">${head}<tbody>${m.rows.map(row).join("")}</tbody></table></div>
<p class="sub">${esc(m.year ? T("eachRowYear") : T("eachRow"))}</p>
${others}
${m.sections.map(s => `${s.h2 ? `<h2>${esc(s.h2)}</h2>` : ""}${s.p.map(p => `<p>${esc(p)}</p>`).join("")}${s.list.length ? `<ul class="bul">${s.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}`).join("\n")}
${m.faq.length ? `<section class="faq"><h2>${esc(T("questions"))}</h2>${m.faq.map(x => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join("\n")}</section>` : ""}`;
}
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
