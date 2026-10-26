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

import { names } from "./seo_templates.mjs";
import { P as PL, E as EL, PP as PPL, s as S, measureName, list3 as list3L, fitTitle, fitDesc } from "./seo_i18n.mjs";

const P = x => PL("en", x), E = bn => EL("en", bn).replace(/\u00a0/g, " ");
// the measures a page can rank by or show, with their column labels (seo_i18n.mjs MEASURE and PART)
export const label = (key, l = "en") => measureName(l, key);
// how a measure is written: "signed" (+ toward Ukraine, − toward Russia), "kept" (how much more or less Russia kept than
// without the war: "€5.2bn more"), or "amount" (a plain sum). Round 56: every part of the panel is signed (a part such as
// shipping income is the shipping country's, not Russia's, so "Russia kept more" would be wrong); frozen money and the
// parts outside the totals are plain sums
const AMOUNT_PART = new Set(["frozen", "frozen_priv", "prem", "disc", "seized", "exits", "trapped", "aidge", "margin", "tariff"]);
export const style = k => (k === "net" || k === "ua" ? "signed" : k === "rus" || k === "paidGain" ? "kept"
  : k.startsWith("part:") ? (AMOUNT_PART.has(k.slice(5)) ? "amount" : "signed") : "amount");
const SIGNED = k => style(k) !== "amount";
// measures whose cell carries the panel's chance (checked against the model by check 48)
export const CHANCE_KEYS = ["net", "ua", "rus"];
export const pathOf = e => (e.kind === "group" ? `/group/${e.slug}/` : e.kind === "compare" ? `/compare/${e.slug}/` : `/${e.slug}/`);
const SIDES = new Set(["RUS", "UKR"]);   // the two sides the money is measured toward: no figure of their own

const fmtSigned = v => (v > 0 ? "+" : v < 0 ? "−" : "");
const pp = (v, pop) => (pop ? (v * 1000) / pop : null);   // € bn and population in millions → € per person
const fmtPP = x => PPL("en", x);
const list3 = a => (a.length > 2 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join(" and "));
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

// the page's model: which countries, in which order, the totals and every filled-in text
export function buildTopic(e, countries, all, { dataTo }) {
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
  const dir = (k, v) => (style(k) === "kept" ? (v >= 0 ? "less for Russia than without the war" : "more for Russia than without the war") : k === "net" ? (v >= 0 ? "toward Ukraine" : "toward Russia") : "");
  const dir2 = v => (v >= 0 ? "less" : "more");
  const groups = Object.fromEntries((all || []).filter(x => x.members).map(x => [x.slug, x]));
  const subSet = slug => { const g = groups[slug]; return g ? countries.filter(c => g.members.includes(c.iso) && !c.party && !c.noData && !c.mostlyNoData && c.gdp) : []; };
  const nm = c => names(c.iso, c.nameEn)[1];
  const level = (c, k) => { const m = mvY(c, k); return m ? m.level : ""; };
  const fill = s => capSentences(String(s).replace(/\{([\w:]+?)\}/g, (all0, ph) => {
    let m;
    if (ph === "n") return String(rows.length);
    if (ph === "dataTo") return dataTo;
    if ((m = ph.match(/^top(\d)$/))) return rows[+m[1] - 1] ? nm(rows[+m[1] - 1]) : "";
    if (ph === "top3list") return list3(rows.slice(0, 3).map(nm));
    if ((m = ph.match(/^top(\d)_(eur|pct|pp)$/))) {
      const c = rows[+m[1] - 1]; if (!c) return "";
      const v = mvY(c, key).v;
      return m[2] === "eur" ? E(v) : m[2] === "pct" ? P((100 * v) / c.gdp) : c.pop ? fmtPP(pp(v, c.pop)) + " per person" : "";
    }
    if ((m = ph.match(/^top(\d)by:([\w:]+?)(_eur|_pct)?$/))) {
      const by = rows.filter(c => mvY(c, m[2])).sort((a, b) => Math.abs(mvY(b, m[2]).v) - Math.abs(mvY(a, m[2]).v));
      if (m[1] === "3" && !m[3]) return list3(by.slice(0, 3).map(nm));
      const c = by[+m[1] - 1]; if (!c) return "";
      return m[3] === "_eur" ? E(mvY(c, m[2]).v) : m[3] === "_pct" ? P((100 * mvY(c, m[2]).v) / c.gdp) : nm(c);
    }
    if ((m = ph.match(/^sum:([\w:]+?)_(eur|pct|pp|dir|dir2)$/))) {
      const s = sumOf(rows, m[1]);
      return m[2] === "eur" ? E(s.v) : m[2] === "pct" ? P(s.pct) : m[2] === "pp" ? (s.pop ? fmtPP(pp(s.v, s.pop)) + " per person" : "") : m[2] === "dir" ? dir(m[1], s.v) : dir2(s.v);
    }
    if ((m = ph.match(/^sub:([\w-]+):([\w:]+?)_(eur|pct|dir|dir2)$/))) {
      const s = sumOf(subSet(m[1]), m[2]);
      return m[3] === "eur" ? E(s.v) : m[3] === "pct" ? P(s.pct) : m[3] === "dir" ? dir(m[2], s.v) : dir2(s.v);
    }
    // round 56: one named country's figure, wherever it is in the table (or outside it: a party to the war)
    if ((m = ph.match(/^iso:([A-Z]{3}):([\w:]+?)_(eur|pct)$/))) {
      const c = byIso[m[1]], x = c && mvY(c, m[2]);
      if (!x) throw new Error(`seo_topics.json ${e.slug}: no ${m[2]} for ${m[1]}`);
      return m[3] === "eur" ? E(x.v) : P((100 * x.v) / c.gdp);
    }
    if ((m = ph.match(/^cmp:([\w:]+):([\w:]+)$/))) {
      const a = Math.abs(sumOf(rows, m[1]).v), b = Math.abs(sumOf(rows, m[2]).v);
      return Math.abs(a - b) < 0.02 * Math.max(a, b) ? "about the same as" : a > b ? "more than" : "less than";
    }
    if ((m = ph.match(/^ratio:([\w:]+):([\w:]+)$/))) {
      const a = Math.abs(sumOf(rows, m[1]).v), b = Math.abs(sumOf(rows, m[2]).v), r = b ? a / b : 0;
      return r >= 1 ? r.toFixed(1).replace(/\.0$/, "") + " times" : Math.round(r * 100) + "%";
    }
    if ((m = ph.match(/^(n|names)(ToU|ToR|Unsure):([\w:]+)$/))) {
      const k = m[3], set = rows.filter(c => (m[2] === "Unsure" ? level(c, k) && level(c, k) !== "sure" : level(c, k) === "sure" && mvY(c, k).side === (m[2] === "ToU" ? "ukraine" : "russia")));
      return m[1] === "n" ? String(set.length) : set.length ? list3(set.map(nm)) : "none";
    }
    throw new Error(`seo_topics.json ${e.slug}: unknown placeholder {${ph}}`);
  }));
  const forms = x => (x == null ? [""] : Array.isArray(x) ? x : [x]).map(fill);
  // an entry of a generated family (seo_families.mjs) or a page in another language has its words from seo_i18n.mjs
  const title = fitTitle(forms(e.title)), description = fitDesc(forms(e.description));
  const totals = ["net", "ua", "rus", "frozen"].map(k => ({ key: k, ...sumOf(rows, k), dir: dir(k, sumOf(rows, k).v) }));
  const subtotals = (e.subtotals || []).filter(s => groups[s]).map(s => ({ slug: s, label: groups[s].label, n: subSet(s).length, sums: ["ua", "paid", "paidGain", "net"].map(k => ({ key: k, ...sumOf(subSet(s), k) })) }));
  return {
    path: pathOf(e), kind: e.kind, slug: e.slug, label: e.label, key, sort, order: e.order || "desc", title, description, h1: fill(e.h1 || ""), intro: fill(e.intro || ""), year, side: e.side || "", moneyNote: e.moneyNote || "",
    // a column every listed country has nothing in (frozen money in the Gulf states) is left out
    columns: (e.columns || (e.kind === "group" ? ["ua", "rus", "frozen"] : [])).filter(k => k !== key && rows.some(c => mvY(c, k) && Math.abs(mvY(c, k).v) >= 0.0005)), rows, party, noData, sides, missing, extra,
    faq: (e.faq || []).map(x => ({ q: fill(x.q), a: fill(x.a) })), sections: (e.sections || []).map(s => ({ h2: s.h2 && fill(s.h2), p: (s.p || []).map(fill), list: (s.list || []).map(fill) })),
    notes: (e.notes || []).map(fill), totals, subtotals, map: e.map || "#view=rank", related: e.related || [], minGdp,
  };
}

// ----- the HTML of a page's main part (the shell, header and footer are seo_pages.mjs's) -----
export const TOPIC_CSS = `td.m i,.tot i{font-style:normal;white-space:nowrap}td.m{text-align:right;min-width:8.6em}td.m b{font-size:15.5px;white-space:nowrap}td.m .s{display:block;font-size:12.5px;line-height:1.35;color:var(--soft);white-space:normal}
td.m .pos,b.pos{color:var(--ukr)}td.m .neg,b.neg{color:var(--rus-t)}th.m{text-align:right;min-width:8.6em}td.r{color:var(--soft);font-size:13px;width:2em}
.tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px;margin:14px 0}.tot div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.tot b{display:block;font:800 22px/1.2 var(--fd)}.tot span{font-size:13.5px;color:var(--soft)}
ul.bul{padding-left:20px}ul.bul li{margin:0 0 6px}`;

// l: the page's language; the countries in m are that language's (their names, ranges and chance words the map's)
export function renderTopic(m, { esc, cPath, l = "en" }) {
  const T = (k, v) => S(l, k, v), Pl = x => PL(l, x), El = x => EL(l, x), PPl = x => PPL(l, x), lab = k => label(k, l);
  const name = c => (l === "en" ? c.nameEn : c.name || c.nameEn);
  const cls = v => (v >= 0.0005 ? "pos" : v <= -0.0005 ? "neg" : "");
  // a short figure is kept on one line ("+€0.25bn"); a longer phrase may wrap
  const keep = x => (x.length <= 24 ? `<i>${esc(x)}</i>` : esc(x));
  // a figure in the measure's own way of writing: "+1.8%", "€5.2bn more", "€547bn"
  const say = (k, v, s, g = "") => { const st = style(k); if (Math.abs(v) < 0.0005 || /^(<|€0m|0\u00a0)/.test(s)) return s + g; return st === "kept" ? `${s}${g} ${v >= 0 ? T("less") : T("more")}` : (st === "signed" && !/^<?0[.,]01/.test(s) && !s.startsWith("<") ? fmtSigned(v) + s : s) + g; };
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
    const what = t.key === "rus" ? T("totRus", { v: El(t.v), lm: t.v >= 0 ? T("less") : T("more") }) : t.key === "ua" ? T("totUa", { v: El(t.v) }) : t.key === "frozen" ? T("totFrozen", { v: El(t.v) }) : `${El(t.v)} ${t.v >= 0 ? T("toU") : T("toR")}`;
    return `<div data-total="${t.key}"><span>${esc(lab(t.key))}</span><b class="${cls(t.v)}">${esc(say(t.key, t.v, Pl(t.pct)))}</b><span>${[T("ofCombined"), what, t.key === "net" || t.key === "ua" ? say(t.key, t.v, PPl(pp(t.v, t.pop))) + " " + T("perPerson") : ""].filter(Boolean).map(keep).join(" · ")}</span></div>`;
  }).join("")}</div><p class="sub">${esc(T("totals", { n: m.rows.length }))}</p>` : "";
  const subs = m.subtotals.map(s => `<p class="sub" data-subtotal="${s.slug}"><b>${esc(s.labelL || s.label)} (${s.n})</b>: ${s.sums.map(x => `${esc(lab(x.key))}: ${esc(say(x.key, x.v, El(x.v)))} (${esc(say(x.key, x.v, Pl(x.pct), " " + T("ofGdp")))})`).join(" · ")}</p>`).join("");
  const others = [
    m.party.length ? `<h2 id="party">${esc(T("party"))}</h2><ul class="plain">${m.party.map(c => { const x = mv(c, m.key, m.year); return `<li><a href="${cPath(c)}">${esc(name(c))}</a>: ${esc(lab(m.key))} ${esc(x ? say(m.key, x.v, El(x.v)) : "–")}</li>`; }).join("")}</ul>` : "",
    m.sides.length ? `<p class="sub">${esc(T("sides", { x: list3L(l, m.sides.map(i => (i === "RUS" ? T("russia") : T("ukraine")))) }))}</p>` : "",
    m.kind === "group" && m.noData.length ? `<h2 id="no-data">${esc(T("noData"))}</h2><p class="sub">${esc(T("noDataText"))} ${m.noData.map(c => `<a href="${cPath(c)}">${esc(name(c))}</a>`).join(", ")}</p>` : "",
    m.extra.length ? `<h2 id="outside">${esc(T("outside"))}</h2><div class="tbl"><table>${head}<tbody>${m.extra.map(c => row(c, null)).join("")}</tbody></table></div>` : "",
  ].join("\n");
  const F = T("first"), firstW = m.order === "abs" ? F.abs : m.order === "asc" ? (style(m.key) === "kept" ? F.keptAsc : style(m.key) === "amount" ? F.largest : F.ruAsc) : style(m.key) === "kept" ? F.keptDesc : m.key === "net" ? F.netDesc : F.largest;
  const legend = [...new Set([m.key, ...m.columns].map(style))].map(st => (st === "kept" ? T("legendKept") : st === "signed" ? T("legendSigned") : "")).filter(Boolean);
  const rankNote = `${m.year ? T("rankByYear", { m: lab(m.key), unit: T("unit")[m.sort], first: firstW, y: m.yearL || m.year }) : T("rankBy", { m: lab(m.key), unit: T("unit")[m.sort], first: firstW, to: m.dataToL || "" })}${m.kind !== "group" && m.minGdp > 0 ? " " + T("minGdp", { n: m.minGdp }) : ""} ${legend.length ? cap1(legend.join("; ")) + "." : ""}`;
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
