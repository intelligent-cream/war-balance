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

import { P, E, names, fit, TITLE_MAX, DESC_MAX } from "./seo_templates.mjs";

// the measures a page can rank by or show, with their column labels
export const MEASURE_LABEL = {
  net: "Net", ua: "Support for Ukraine", rus: "Russia kept from trade, vs no war", frozen: "Russian money frozen (return lost)",
  paid: "Paid Russia since 2022", paidGain: "Russia kept from its purchases, vs no war", aid: "Aid counted here", kiel: "Kiel Institute figure",
  fuelShare: "Fuel share of purchases, 2018–21",
};
const PART_LABEL = { windfall: "From war-time fuel prices", laund: "From its oil refined elsewhere", frozen: "Frozen reserves (return lost)", frozen_priv: "Frozen private assets (return lost)", ship: "From shipping Russian oil" };
export const label = key => MEASURE_LABEL[key] || (key.startsWith("part:") ? PART_LABEL[key.slice(5)] || key.slice(5) : key);
// how a measure is written: "signed" (+ toward Ukraine, − toward Russia), "kept" (how much more or less Russia kept than
// without the war: "€5.2bn more"), or "amount" (a plain sum)
const UA_PART = new Set(["aid", "euaid", "ref", "buy", "undisc", "priv", "multilat"]);
export const style = k => (k === "net" || k === "ua" ? "signed" : k === "rus" || k === "paidGain" ? "kept"
  : k.startsWith("part:") ? (UA_PART.has(k.slice(5)) ? "signed" : k.startsWith("part:frozen") ? "amount" : "kept") : "amount");
const SIGNED = k => style(k) !== "amount";
// measures whose cell carries the panel's chance (checked against the model by check 48)
export const CHANCE_KEYS = ["net", "ua", "rus"];
export const pathOf = e => (e.kind === "group" ? `/group/${e.slug}/` : `/${e.slug}/`);
const SIDES = new Set(["RUS", "UKR"]);   // the two sides the money is measured toward: no figure of their own

const fmtSigned = v => (v > 0 ? "+" : v < 0 ? "−" : "");
const pp = (v, pop) => (pop ? (v * 1000) / pop : null);   // € bn and population in millions → € per person
const fmtPP = x => (Math.abs(x) < 0.5 ? "<€1" : "€" + Math.round(Math.abs(x)).toLocaleString("en-GB"));
const list3 = a => (a.length > 2 ? a.slice(0, -1).join(", ") + " and " + a[a.length - 1] : a.join(" and "));
const capSentences = s => s.replace(/(^|[.?!]\s+)the /g, "$1The ");

// a measure's value for one country (null when it has none)
function mv(c, key) {
  if (key === "fuelShare") return c.fuelSharePreWar == null ? null : { v: c.fuelSharePreWar };
  const m = c.measures && c.measures[key];
  return m && m.v != null ? m : null;
}
const inUnit = (c, v, sort) => (sort === "eur" ? v : sort === "pp" ? pp(v, c.pop) : c.gdp ? (100 * v) / c.gdp : null);

// the page's model: which countries, in which order, the totals and every filled-in text
export function buildTopic(e, countries, all, { dataTo }) {
  const byIso = Object.fromEntries(countries.map(c => [c.iso, c]));
  const sort = e.sort || "gdp", key = e.rank || "net", minGdp = e.minGdp ?? (e.kind === "group" ? 0 : sort === "eur" ? 0 : 5);
  const exclude = new Set(e.exclude || []);
  const inSet = c => !exclude.has(c.iso) && (e.members ? e.members.includes(c.iso) : e.regions ? e.regions.includes(c.region) : true);
  const pool = countries.filter(inSet);
  const usable = c => !c.party && !c.noData && !c.mostlyNoData && c.gdp && mv(c, key);
  let rows = pool.filter(c => usable(c) && c.gdp >= minGdp);
  if (e.nonzero) rows = rows.filter(c => Math.abs(mv(c, key).v) >= 0.0005);
  if (e.onlySide === "russia") rows = rows.filter(c => mv(c, key).v < 0);
  if (e.onlySide === "ukraine") rows = rows.filter(c => mv(c, key).v > 0);
  const val = c => inUnit(c, mv(c, key).v, sort) ?? -Infinity;
  rows.sort((a, b) => (e.order === "asc" ? val(a) - val(b) : val(b) - val(a)));
  if (e.limit) rows = rows.slice(0, e.limit);
  const party = pool.filter(c => c.party && c.gdp && mv(c, key) && Math.abs(mv(c, key).v) >= 0.0005 && (e.onlySide !== "russia" || mv(c, key).v < 0) && (e.onlySide !== "ukraine" || mv(c, key).v > 0));
  const noData = pool.filter(c => (c.noData || c.mostlyNoData) && !c.party);
  const sides = (e.members || []).filter(i => SIDES.has(i));
  const missing = (e.members || []).filter(i => !SIDES.has(i) && !byIso[i]);
  const extra = (e.extraRows || []).map(i => byIso[i]).filter(Boolean);
  // ----- totals: the members' best estimates added up, and as a share of their combined GDP -----
  const sumOf = (set, k) => {
    const xs = set.map(c => mv(c, k)).filter(Boolean);
    const v = xs.reduce((a, m) => a + m.v, 0), gdp = set.filter(c => mv(c, k)).reduce((a, c) => a + c.gdp, 0), pop = set.filter(c => mv(c, k)).reduce((a, c) => a + (c.pop || 0), 0);
    return { v, gdp, pop, pct: gdp ? (100 * v) / gdp : 0, n: xs.length };
  };
  const dir = (k, v) => (style(k) === "kept" ? (v >= 0 ? "less for Russia than without the war" : "more for Russia than without the war") : k === "net" ? (v >= 0 ? "toward Ukraine" : "toward Russia") : "");
  const dir2 = v => (v >= 0 ? "less" : "more");
  const groups = Object.fromEntries((all || []).filter(x => x.members).map(x => [x.slug, x]));
  const subSet = slug => { const g = groups[slug]; return g ? countries.filter(c => g.members.includes(c.iso) && !c.party && !c.noData && !c.mostlyNoData && c.gdp) : []; };
  const nm = c => names(c.iso, c.nameEn)[1];
  const level = (c, k) => { const m = mv(c, k); return m ? m.level : ""; };
  const fill = s => capSentences(String(s).replace(/\{([\w:]+?)\}/g, (all0, ph) => {
    let m;
    if (ph === "n") return String(rows.length);
    if (ph === "dataTo") return dataTo;
    if ((m = ph.match(/^top(\d)$/))) return rows[+m[1] - 1] ? nm(rows[+m[1] - 1]) : "";
    if (ph === "top3list") return list3(rows.slice(0, 3).map(nm));
    if ((m = ph.match(/^top(\d)_(eur|pct|pp)$/))) {
      const c = rows[+m[1] - 1]; if (!c) return "";
      const v = mv(c, key).v;
      return m[2] === "eur" ? E(v) : m[2] === "pct" ? P((100 * v) / c.gdp) : c.pop ? fmtPP(pp(v, c.pop)) + " per person" : "";
    }
    if ((m = ph.match(/^top(\d)by:([\w:]+?)(_eur|_pct)?$/))) {
      const by = rows.filter(c => mv(c, m[2])).sort((a, b) => Math.abs(mv(b, m[2]).v) - Math.abs(mv(a, m[2]).v));
      if (m[1] === "3" && !m[3]) return list3(by.slice(0, 3).map(nm));
      const c = by[+m[1] - 1]; if (!c) return "";
      return m[3] === "_eur" ? E(mv(c, m[2]).v) : m[3] === "_pct" ? P((100 * mv(c, m[2]).v) / c.gdp) : nm(c);
    }
    if ((m = ph.match(/^sum:([\w:]+?)_(eur|pct|pp|dir|dir2)$/))) {
      const s = sumOf(rows, m[1]);
      return m[2] === "eur" ? E(s.v) : m[2] === "pct" ? P(s.pct) : m[2] === "pp" ? (s.pop ? fmtPP(pp(s.v, s.pop)) + " per person" : "") : m[2] === "dir" ? dir(m[1], s.v) : dir2(s.v);
    }
    if ((m = ph.match(/^sub:([\w-]+):([\w:]+?)_(eur|pct|dir|dir2)$/))) {
      const s = sumOf(subSet(m[1]), m[2]);
      return m[3] === "eur" ? E(s.v) : m[3] === "pct" ? P(s.pct) : m[3] === "dir" ? dir(m[2], s.v) : dir2(s.v);
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
      const k = m[3], set = rows.filter(c => (m[2] === "Unsure" ? level(c, k) && level(c, k) !== "sure" : level(c, k) === "sure" && mv(c, k).side === (m[2] === "ToU" ? "ukraine" : "russia")));
      return m[1] === "n" ? String(set.length) : set.length ? list3(set.map(nm)) : "none";
    }
    throw new Error(`seo_topics.json ${e.slug}: unknown placeholder {${ph}}`);
  }));
  const forms = x => (Array.isArray(x) ? x : [x]).map(fill);
  const cut = (s, max) => (s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…");
  const title = cut(fit(forms(e.title), TITLE_MAX), TITLE_MAX), description = cut(fit(forms(e.description), DESC_MAX), DESC_MAX);
  const totals = ["net", "ua", "rus", "frozen"].map(k => ({ key: k, ...sumOf(rows, k), dir: dir(k, sumOf(rows, k).v) }));
  const subtotals = (e.subtotals || []).filter(s => groups[s]).map(s => ({ slug: s, label: groups[s].label, n: subSet(s).length, sums: ["ua", "paid", "paidGain", "net"].map(k => ({ key: k, ...sumOf(subSet(s), k) })) }));
  return {
    path: pathOf(e), kind: e.kind, slug: e.slug, label: e.label, key, sort, order: e.order || "desc", title, description, h1: fill(e.h1), intro: fill(e.intro),
    // a column every listed country has nothing in (frozen money in the Gulf states) is left out
    columns: (e.columns || (e.kind === "group" ? ["ua", "rus", "frozen"] : [])).filter(k => k !== key && rows.some(c => mv(c, k) && Math.abs(mv(c, k).v) >= 0.0005)), rows, party, noData, sides, missing, extra,
    faq: (e.faq || []).map(x => ({ q: fill(x.q), a: fill(x.a) })), sections: (e.sections || []).map(s => ({ h2: s.h2 && fill(s.h2), p: (s.p || []).map(fill), list: (s.list || []).map(fill) })),
    notes: (e.notes || []).map(fill), totals, subtotals, map: e.map || "#view=rank", related: e.related || [], minGdp,
  };
}

// ----- the HTML of a page's main part (the shell, header and footer are seo_pages.mjs's) -----
export const TOPIC_CSS = `td.m i,.tot i{font-style:normal;white-space:nowrap}td.m{text-align:right;min-width:8.6em}td.m b{font-size:15.5px;white-space:nowrap}td.m .s{display:block;font-size:12.5px;line-height:1.35;color:var(--soft);white-space:normal}
td.m .pos,b.pos{color:var(--ukr)}td.m .neg,b.neg{color:var(--rus-t)}th.m{text-align:right;min-width:8.6em}td.r{color:var(--soft);font-size:13px;width:2em}
.tot{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:10px;margin:14px 0}.tot div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.tot b{display:block;font:800 22px/1.2 var(--fd)}.tot span{font-size:13.5px;color:var(--soft)}
ul.bul{padding-left:20px}ul.bul li{margin:0 0 6px}`;

export function renderTopic(m, { esc, cPath }) {
  const cls = v => (v >= 0.0005 ? "pos" : v <= -0.0005 ? "neg" : "");
  // a short figure is kept on one line ("+€0.25bn"); a longer phrase may wrap
  const keep = x => (x.length <= 24 ? `<i>${esc(x)}</i>` : esc(x));
  // a figure in the measure's own way of writing: "+1.8%", "€5.2bn more", "€547bn"
  const say = (k, v, s, g = "") => { const st = style(k); if (Math.abs(v) < 0.0005 || /^(<|€0m)/.test(s)) return s + g; return st === "kept" ? `${s}${g} ${v >= 0 ? "less" : "more"}` : (st === "signed" && s !== "<0.01%" ? fmtSigned(v) + s : s) + g; };
  // a measure in its own cell: the main figure in the page's unit, the others beside it, then the range and chance
  const cell = (c, k, main) => {
    const x = mv(c, k);
    if (!x) return `<td class="m" data-q="${k}">–</td>`;
    if (k === "fuelShare") return `<td class="m" data-q="${k}"><b>${Math.round(x.v * 100)}%</b><span class="s">of what it bought from Russia</span></td>`;
    const pct = c.gdp ? (100 * x.v) / c.gdp : null, per = pp(x.v, c.pop);
    const f = { gdp: pct == null ? "" : say(k, x.v, P(pct)), eur: say(k, x.v, E(x.v)), pp: per == null ? "" : say(k, x.v, fmtPP(per) + " pp") };
    const unit = main ? m.sort : "eur", first = f[unit];
    const rest = ["gdp", "eur", "pp"].filter(u => u !== unit && f[u] && (main || u === "gdp")).map(u => (u === "gdp" ? say(k, x.v, P(pct), " of GDP") : f[u]));
    const words = [x.range, x.chance].filter(Boolean).join(" · ");
    return `<td class="m" data-q="${k}"${x.level ? ` data-level="${x.level}"` : ""}><b class="${SIGNED(k) ? cls(x.v) : ""}">${esc(first)}</b><span class="s">${rest.map(keep).join(" · ")}</span>${main && words ? `<span class="s">${esc(words)}</span>` : ""}${!main && x.chance ? `<span class="s">${esc(x.chance)}</span>` : ""}</td>`;
  };
  const head = `<thead><tr><th>#</th><th>Country</th><th class="m">${esc(label(m.key))}</th>${m.columns.map(k => `<th class="m">${esc(label(k))}</th>`).join("")}</tr></thead>`;
  const row = (c, i) => `<tr data-iso="${c.iso}"><td class="r">${i == null ? "" : i + 1}</td><td><a href="${cPath(c)}">${esc(c.nameEn)}</a>${c.gdp < 5 ? ' <span class="ev">small economy</span>' : ""}</td>${cell(c, m.key, true)}${m.columns.map(k => cell(c, k, false)).join("")}</tr>`;
  const tot = m.kind === "group" && m.rows.length ? `<div class="tot" aria-label="Group totals">${m.totals.filter(t => t.n && Math.abs(t.v) >= 0.0005).map(t => {
    const what = t.key === "rus" ? `Russia kept ${E(t.v)} ${t.v >= 0 ? "less" : "more"} than without the war` : t.key === "ua" ? `${E(t.v)} in support` : t.key === "frozen" ? `${E(t.v)} return lost` : `${E(t.v)} ${t.dir}`;
    return `<div data-total="${t.key}"><span>${esc(label(t.key))}</span><b class="${cls(t.v)}">${esc(say(t.key, t.v, P(t.pct)))}</b><span>${["of the members' combined GDP", what, t.key === "net" || t.key === "ua" ? say(t.key, t.v, fmtPP(pp(t.v, t.pop))) + " per person" : ""].filter(Boolean).map(keep).join(" · ")}</span></div>`;
  }).join("")}</div><p class="sub">Totals: the ${m.rows.length} members' best estimates added up, and as a share of their combined GDP. Each member's likely range and chance are on its row.</p>` : "";
  const subs = m.subtotals.map(s => `<p class="sub" data-subtotal="${s.slug}"><b>${esc(s.label)} (${s.n})</b>: ${s.sums.map(x => `${esc(label(x.key))}: ${esc(say(x.key, x.v, E(x.v)))} (${esc(say(x.key, x.v, P(x.pct), " of GDP"))})`).join(" · ")}</p>`).join("");
  const others = [
    m.party.length ? `<h2 id="party">Party to the war (with Russia), not ranked</h2><ul class="plain">${m.party.map(c => { const x = mv(c, m.key); return `<li><a href="${cPath(c)}">${esc(c.nameEn)}</a>: ${esc(label(m.key))} ${esc(x ? say(m.key, x.v, E(x.v)) : "–")}</li>`; }).join("")}</ul>` : "",
    m.sides.length ? `<p class="sub">${m.sides.map(i => (i === "RUS" ? "Russia" : "Ukraine")).join(" and ")}: one of the two sides the money is measured toward, so no figure of its own.</p>` : "",
    m.kind === "group" && m.noData.length ? `<h2 id="no-data">No data</h2><p class="sub">No observation of their own for the war years: not ranked. ${m.noData.map(c => `<a href="${cPath(c)}">${esc(c.nameEn)}</a>`).join(", ")}</p>` : "",
    m.extra.length ? `<h2 id="outside">Outside the totals</h2><div class="tbl"><table>${head}<tbody>${m.extra.map(c => row(c, null)).join("")}</tbody></table></div>` : "",
  ].join("\n");
  const unitWord = { gdp: "as a share of one year's GDP", eur: "in euros", pp: "per person" }[m.sort];
  const first = m.order === "asc" ? (style(m.key) === "kept" ? "where Russia kept most more first" : "most toward Russia first") : style(m.key) === "kept" ? "where Russia kept most less first" : m.key === "net" ? "most toward Ukraine first" : "largest first";
  const legend = [...new Set([m.key, ...m.columns].map(style))].map(st => (st === "kept" ? "more or less: how much more or less Russia kept (taxes and profit, not sales) than in a world without the war" : st === "signed" ? "+ toward Ukraine, − toward Russia" : "")).filter(Boolean);
  const rankNote = `Ranked by “${label(m.key)}” ${unitWord}, ${first}, February 2022 to the latest data.${m.kind === "topic" && m.minGdp > 0 ? ` Economies under €${m.minGdp}bn of GDP are left out, as in the map's ranking.` : ""} ${legend.length ? cap1(legend.join("; ")) + "." : ""}`;
  return `${tot}
${subs}
<h2 id="table">${esc(m.kind === "group" ? "Members" : "Ranking")} · ${m.rows.length}</h2>
<p class="sub">${esc(rankNote)}</p>
${m.notes.map(n => `<p class="sub">${esc(n)}</p>`).join("")}
<div class="tbl"><table class="topic">${head}<tbody>${m.rows.map(row).join("")}</tbody></table></div>
<p class="sub">Each row: the best estimate, then the likely range and the chance of its direction, as in the country's panel. Weapons sent, troops and diplomacy are not in these numbers.</p>
${others}
${m.sections.map(s => `${s.h2 ? `<h2>${esc(s.h2)}</h2>` : ""}${s.p.map(p => `<p>${esc(p)}</p>`).join("")}${s.list.length ? `<ul class="bul">${s.list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}`).join("\n")}
${m.faq.length ? `<section class="faq"><h2>Questions</h2>${m.faq.map(x => `<h3>${esc(x.q)}</h3><p>${esc(x.a)}</p>`).join("\n")}</section>` : ""}`;
}
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
