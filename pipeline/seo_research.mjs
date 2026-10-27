// Round 58b (owner approved: "wire the three research results"): what the static pages show from three research files,
// at deploy, in every language. Nothing here is written per country: each block is a rule on a research file's own
// fields, and its words are the phrases of the one translation table (seo_i18n.mjs RES).
//   sanctions   research/2026-10/gaps/sanctions_r58.json: the sanctions on Russia that apply in each country and
//               territory (its category), the oil price cap coalition, export controls and, kept apart, Russia's own
//               list of "unfriendly" states. A section and a question on every country page, and the page of every
//               country (/countries-with-sanctions-on-russia/). A fact that rests on a search engine's extract or a
//               news report is marked as such where its source is listed, and no position is quoted word for word.
//   frozen      frozen_amounts_r58.json: the amounts frozen in each holding country (Bank of Russia reserves and the
//               assets of sanctioned people and companies, each with its date and source; "no public figure" where
//               the file has none, never zero; an outside estimate marked as one), on the country pages and as two
//               columns of /frozen-russian-assets/, and the EU and REPO totals, the windfall, the ERA loans and the
//               reparations loan in the explainers. A stock is never shown as Russia's loss: the map counts the return.
//   revenue     russia_revenue_r58.json: Russia's federal oil and gas revenue by year and month, CREA's estimate of
//               export earnings and defence spending for context, each figure labelled by type
//               (/russia-oil-gas-revenue/, a CSV of the series in the downloads, lines in llms-full.txt).
// Every figure these blocks write carries the research file's path and value (data-rv, data-v; data-u its unit), and
// check 48 (seo_check.py check_research) reads each back against the file and against the text the reader sees.
//
// Pure (no browser): pipeline/test_seo.mjs tests it.

import * as I from "./seo_i18n.mjs";

export const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const R = (l, k, v, n) => I.res(l, k, v, n);
const ext = url => (/^https?:\/\//.test(url || "") ? ` rel="noopener"` : "");
// a marked figure: the file ("sanctions", "frozen", "revenue"), its path in the file, its value and unit
const rv = (file, path, v, u) => ` data-rv="${file}:${path}" data-v="${esc(v === null || v === undefined ? "null" : String(v))}"${u ? ` data-u="${u}"` : ""}`;

// ----- sanctions -----
export const SANCTION_CATS = ["eu_member", "adopts_eu_measures", "own_regime", "financial_directive_only", "no_own_regime_stated", "no_own_regime_found", "territory_uk_order", "territory"];
// the kinds of sources whose facts are marked where they are listed: read only through a search engine's extract, or a
// news report
const MARK = { search_extract: "srcSearch", news: "srcNews" };

// one entry of sanctions_r58.json, as the pages use it
export function sanctionsOf(S, iso) {
  const c = S && S.countries && S.countries[iso];
  if (!c) return null;
  if (!SANCTION_CATS.includes(c.category)) throw new Error(`sanctions_r58.json ${iso}: unknown category ${c.category}`);
  const or = c.own_regime || {}, ea = c.eu_aligned || {}, pc = c.price_cap_coalition || {}, ec = c.export_controls || {}, uf = c.unfriendly_list || {}, pos = c.position || null;
  const scopeTxt = String(or.scope || "");
  // the reach of a regime of its own: export controls only, export controls and financial measures, or wider
  const scope = c.category !== "own_regime" ? "" : /^export controls only/i.test(scopeTxt) ? "exp" : /^export controls/i.test(scopeTxt) ? (/financial/i.test(scopeTxt) ? "expFin" : "exp") : "full";
  const byId = Object.fromEntries((S.sources || []).map(s => [s.id, s]));
  const ids = [...(or.src || []), ...(ea.status === "eu_member" || String(ea.status).startsWith("adopts") ? ea.src || [] : []), ...(pc.member ? pc.src || [] : []), ...(ec.russia_controls ? ec.src || [] : []), ...(uf.listed ? uf.src || [] : []), ...(pos ? pos.src || [] : [])];
  const src = [...new Set(ids)].filter(id => byId[id] && byId[id].url).map(id => byId[id]);
  return {
    iso, cat: c.category, kind: c.kind, sov: c.sovereign || null, since: or.since || null,
    scope, partial: ea.status === "adopts_eu_measures_partial",
    cap: { member: !!pc.member, viaEU: pc.how === "via the EU" },
    exp: { v: ec.russia_controls === undefined ? null : ec.russia_controls, bis: !!ec.bis_supp3 },
    uf: { listed: uf.listed === undefined ? null : uf.listed, since: uf.since || null, order: uf.order || "", sovListed: /sovereign .* is listed/.test(String(uf.how || "")) },
    // a government's own statement: its date, and whether it also said it would not let others' sanctions be got around
    pos: pos ? { date: pos.date || "", evasion: /circumvent|get around|evasion/i.test(String(pos.stance || "")) } : null,
    checked: c.checked || S.generated, src,
  };
}

// the answer to "Does X have sanctions on Russia?" in a language, as plain sentences (no figures: dates and names only).
// names: { N, Nt } its name in the language (Nt: in a sentence, "the United States"), sov: its sovereign's name
export function sanctionsAnswer(l, r, { N, Nt, sov = "" }) {
  const day = r.since && /^\d{4}-\d{2}-\d{2}/.test(r.since) ? 1 : 0;
  const v = { N, Nt, NtCap: cap(Nt), sov, sinceText: r.since ? I.dateL(r.since, l, true) : "", dateText: r.pos && r.pos.date ? I.dateL(r.pos.date, l) : "", checked: I.dateL(r.checked, l) };
  const n = { partial: r.partial, since: r.since ? 1 : 0, day, expFin: r.scope === "expFin", exp: r.scope === "exp", date: r.pos && r.pos.date ? 1 : 0, evasion: !!(r.pos && r.pos.evasion),
    viaEU: r.cap.viaEU, bis: r.exp.bis, sov: sov && (r.uf.sovListed || r.cat === "territory") ? 1 : 0 };
  const out = [R(l, "cat_" + r.cat, v, n)];
  if (r.cap.member) out.push(R(l, "priceCap", v, n));
  if (r.exp.v === true && r.cat !== "eu_member") out.push(R(l, "exportCtl", v, n));
  if (r.uf.listed === true) out.push(R(l, "ufListed", { ...v, order: r.uf.order, sinceText: I.dateL(r.uf.since, l) }, n));
  else if (r.uf.listed === null) out.push(R(l, "ufNotNamed", v, { ...n, sov: sov && r.uf.sovListed ? 1 : 0 }));
  else out.push(R(l, "ufNo", v, n));
  return out.join(" ");
}

// a source as a list item: a link, and its kind where it is weaker evidence
const srcLi = (l, s) => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>${MARK[s.type] ? ` <span class="sub">(${esc(R(l, MARK[s.type]))})</span>` : ""}</li>`;

// the section of a country page and its question. page: the address of every country's sanctions in this language
export function sanctionsBlock(l, r, names, page) {
  const a = sanctionsAnswer(l, r, names);
  const top = r.src.slice(0, 2).map(s => `<a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>${MARK[s.type] ? ` (${esc(R(l, MARK[s.type]))})` : ""}`);
  const faqA = esc(a) + (top.length ? ` ${esc(R(l, "sources"))}: ${top.join("; ")}.` : "");
  const html = `<div class="sanc"${rv("sanctions", `countries.${r.iso}.category`, r.cat)}><p>${esc(a)} ${esc(R(l, "checked", { checked: I.dateL(r.checked, l) }))}</p>
${r.src.length ? `<h3>${esc(R(l, "sources"))}</h3><ul class="src">${r.src.map(s => srcLi(l, s)).join("")}</ul>` : ""}
<p><a href="${page}#${r.iso}">${esc(R(l, "allSanctions"))} →</a></p></div>`;
  return { q: R(l, "qRegime", { N: names.N, Nt: names.Nt, NtCap: cap(names.Nt) }), a: faqA, html, title: R(l, "tRegime") };
}

// every entry, by category, for the page of every country: [{ cat, rows: [record] }] (rows in the language's name order)
export function sanctionsTable(S, nameOf, l) {
  const by = Object.fromEntries(SANCTION_CATS.map(k => [k, []]));
  for (const iso of Object.keys(S.countries)) { const r = sanctionsOf(S, iso); by[r.cat].push(r); }
  for (const k of SANCTION_CATS) by[k].sort((a, b) => nameOf(a.iso).localeCompare(nameOf(b.iso), l));
  return SANCTION_CATS.map(cat => ({ cat, rows: by[cat] })).filter(g => g.rows.length);
}

// the page of every country's sanctions in a language. o: { nameOf(iso), href(iso) (its page, or ""), checked }
export function sanctionsPage(l, S, o) {
  const groups = sanctionsTable(S, o.nameOf, l), n = Object.fromEntries(groups.map(g => [g.cat, g.rows.length]));
  const all = groups.flatMap(g => g.rows);
  const list = isos => I.list3(l, isos.map(o.nameOf));
  const of = cat => (groups.find(g => g.cat === cat) || { rows: [] }).rows.map(r => r.iso);
  const listedNo = all.filter(r => r.uf.listed === true && ["no_own_regime_found", "no_own_regime_stated"].includes(r.cat) && r.kind === "state").map(r => r.iso);
  const adoptNo = all.filter(r => ["adopts_eu_measures", "own_regime", "financial_directive_only"].includes(r.cat) && r.uf.listed === false).map(r => r.iso);
  const checked = I.dateL(S.generated, l);
  const yn = (v, path, iso, terr) => `<td${rv("sanctions", `countries.${iso}.${path}`, v)}>${esc(v === true ? R(l, "yes") : v === false ? (terr ? "–" : R(l, "no")) : R(l, "notChecked"))}</td>`;
  const capCell = r => `<td${rv("sanctions", `countries.${r.iso}.price_cap_coalition.member`, r.cap.member)}>${esc(r.cap.member ? (r.cap.viaEU ? R(l, "viaEU") : R(l, "yes")) : r.kind === "territory" ? "–" : R(l, "no"))}</td>`;
  const ufCell = r => `<td${rv("sanctions", `countries.${r.iso}.unfriendly_list.listed`, r.uf.listed)}>${esc(r.uf.listed === true ? R(l, "listed", { sinceText: I.dateL(r.uf.since, l) }) : r.uf.listed === null ? R(l, "notNamed") : R(l, "no"))}</td>`;
  const measures = r => R(l, "cell_" + r.cat, { scope: R(l, r.scope === "exp" ? "scopeExp" : r.scope === "expFin" ? "scopeExpFin" : "scopeFull"), sinceText: r.since ? I.dateL(r.since, l) : "", dateText: r.pos && r.pos.date ? I.dateL(r.pos.date, l) : "" },
    { partial: r.partial, since: r.since ? 1 : 0, day: r.since && /^\d{4}-\d{2}-\d{2}/.test(r.since) ? 1 : 0, date: r.pos && r.pos.date ? 1 : 0 });
  const head = `<thead><tr><th>${esc(I.s(l, "country"))}</th><th>${esc(R(l, "thMeasures"))}</th><th>${esc(R(l, "thPriceCap"))}</th><th>${esc(R(l, "thExport"))}</th><th>${esc(R(l, "thUnfriendly"))}</th></tr></thead>`;
  const row = r => `<tr id="${r.iso}"${rv("sanctions", `countries.${r.iso}.category`, r.cat)}><td>${o.href(r.iso) ? `<a href="${o.href(r.iso)}">${esc(o.nameOf(r.iso))}</a>` : esc(o.nameOf(r.iso))}</td><td>${esc(measures(r))}</td>${capCell(r)}${yn(r.exp.v, "export_controls.russia_controls", r.iso, r.kind === "territory")}${ufCell(r)}</tr>`;
  const body = `<h2 id="by-category">${esc(R(l, "sCounts"))}</h2><ul class="bul">${groups.map(g => `<li><a href="#${g.cat.replace(/_/g, "-")}">${esc(R(l, "lab_" + g.cat))}</a>: ${g.rows.length}</li>`).join("")}</ul>
<p class="sub">${esc(R(l, "sNoteUkr"))}</p>
${groups.map(g => `<h2 id="${g.cat.replace(/_/g, "-")}">${esc(R(l, "lab_" + g.cat))} · ${g.rows.length}</h2><p class="sub">${esc(R(l, "note_" + g.cat))}</p>
<div class="tbl"><table class="sanc">${head}<tbody>${g.rows.map(row).join("")}</tbody></table></div>`).join("\n")}
<p class="sub">${esc(R(l, "sNoteSrc"))}</p>`;
  const faq = [
    { q: R(l, "sQ1"), a: R(l, "sA1", { nEu: n.eu_member || 0, nAdopt: n.adopts_eu_measures || 0, nOwn: n.own_regime || 0, adoptList: list(of("adopts_eu_measures")), ownList: list(of("own_regime")), finList: list(of("financial_directive_only")), checked },
      { nFin: n.financial_directive_only || 0 }) },
    { q: R(l, "sQ2"), a: R(l, "sA2", { listedNoList: list(listedNo), adoptNoList: list(adoptNo) }, { nListedNo: listedNo.length, nAdoptNo: adoptNo.length }) },
  ];
  return { title: R(l, "sTitle"), description: R(l, "sDesc"), h1: R(l, "sH1"), intro: R(l, "sIntro", { checked }), label: R(l, "sLabel"), body, faq, counts: n };
}

// ----- frozen amounts -----
// a holding country's amounts (null: the file has nothing for it; { none: true }: no public figure for either kind)
export function frozenOf(F, iso) {
  const c = F && F.countries && F.countries[iso];
  if (!c) return F && (F.no_public_figure || {}).list && F.no_public_figure.list.includes(iso) ? { iso, none: true } : null;
  return { iso, cbr: c.cbr_eur || null, priv: c.private_eur || null, nsd: (c.private_eur || {}).nsd_blocked_securities || null, euroclear: (c.cbr_eur || {}).company_figure || null };
}
const srcOf = (F, ids) => (F.sources || []).find(s => s.id === (ids || [])[0]) || null;
// one amount in a language: "€185bn"; "<€1m" for an official figure under a million (Luxembourg's "below EUR 10,000");
// "no public figure", with an outside estimate marked as one
export function stockText(l, x) {
  if (!x || x.v === null || x.v === undefined) return { fig: R(l, "noFig"), est: x && x.est != null ? R(l, "estimate", { v: I.E(l, x.est) }) : "" };
  return { fig: x.v > 0 && x.v < 0.0005 ? "<" + I.E(l, 0.001) : x.v === 0 ? "<" + I.E(l, 0.001) : I.E(l, x.v), est: "" };
}
// an amount with its date and source, marked (data-rv) for check 48
function stockHtml(l, F, iso, key, x) {
  const t = stockText(l, x), s = x ? srcOf(F, x.src) : null;
  const when = x && x.v !== null && x.v !== undefined && x.date ? I.dateL(x.date, l) : "";
  const tail = [t.est, when, s && s.url && x.v !== null && x.v !== undefined ? `<a href="${esc(s.url)}"${ext(s.url)}>${esc(R(l, "source"))}</a>${s.read === "summary" ? ` (${esc(R(l, "srcSearch"))})` : ""}` : ""].filter(Boolean);
  return `<span${rv("frozen", `countries.${iso}.${key}.v`, x ? x.v : null, "eur")}>${esc(t.fig)}</span>${tail.length ? ` (${tail.map(p => (p.startsWith("<a ") ? p : esc(p))).join(", ")})` : ""}`;
}
// the country page's lines: the amounts, the NSD securities and Euroclear's own figure (Belgium), or "no public figure"
export function frozenLines(l, F, iso) {
  const f = frozenOf(F, iso);
  if (!f) return "";
  if (f.none) return `<p>${esc(R(l, "stockNone"))}</p>`;
  let s = `${esc(R(l, "stockLead"))} ${R(l, "stockCbr", { v: stockHtml(l, F, iso, "cbr_eur", f.cbr) })}; ${R(l, "stockPriv", { v: stockHtml(l, F, iso, "private_eur", f.priv) })}`;
  if (f.nsd && f.nsd.v != null) s += `; ${R(l, "stockNsd", { v: `<span${rv("frozen", `countries.${iso}.private_eur.nsd_blocked_securities.v`, f.nsd.v, "eur")}>${esc(I.E(l, f.nsd.v))}</span>`, date: esc(I.dateL(f.nsd.date, l)) })}`;
  s += ".";
  if (f.euroclear && f.euroclear.series) {
    const ks = Object.keys(f.euroclear.series).sort(), k = ks[ks.length - 1];
    s += " " + R(l, "stockEuroclear", { v: `<span${rv("frozen", `countries.${iso}.cbr_eur.company_figure.series.${k}`, f.euroclear.series[k], "eur")}>${esc(I.E(l, f.euroclear.series[k]))}</span>`, date: esc(I.dateL(k, l)) });
  }
  return `<p class="stock">${s}</p>`;
}
// the two columns of /frozen-russian-assets/: a cell per kind (the date beneath)
export function frozenCells(l, F, iso) {
  const f = frozenOf(F, iso) || { iso };
  const cell = (key, x) => {
    const t = stockText(l, x), when = x && x.v !== null && x.v !== undefined && x.date ? I.dateL(x.date, l) : "";
    return `<td class="k"${rv("frozen", `countries.${iso}.${key}.v`, x ? x.v : null, "eur")}>${esc(t.fig)}${t.est || when ? `<span class="s">${esc(t.est || when)}</span>` : ""}</td>`;
  };
  return cell("cbr_eur", f.cbr) + cell("private_eur", f.priv);
}

// the facts behind the explainers' amounts, from the file's totals, windfall, ERA and reparations-loan records and its
// dated timeline (each read by a pattern; a fact that is not found stops the build rather than leaving a sentence out)
export function frozenFacts(F) {
  const need = (m, what) => { if (!m) throw new Error("frozen_amounts_r58.json: not found: " + what); return m; };
  const t = F.totals, bel = need(F.countries.BEL && F.countries.BEL.cbr_eur.company_figure, "Euroclear's series").series;
  const ks = Object.keys(bel).sort(), last = ks[ks.length - 1];
  const era = need(F.era_loans.what.match(/about USD (\d+(?:\.\d+)?)bn \(EUR (\d+(?:\.\d+)?)bn\)/), "the ERA loans' total");
  const usl = need(F.reparations_loan.what_was_agreed_instead.match(/EUR (\d+)bn for (\d{4})-(\d{2})/), "the Ukraine Support Loan");
  const prop = need(F.timeline.find(x => /legal proposals: a reparations loan using up to EUR \d+bn/.test(x.fact)), "the legal proposal");
  const euco = need(F.timeline.find(x => /^European Council: EUR \d+bn loan/.test(x.fact)), "the European Council's decision");
  const paid = need(F.timeline.map(x => x.fact.match(/EUR ([\d.]+)bn disbursed by (?:late |early |mid-)?([A-Z][a-z]+) (\d{4})/)).find(Boolean), "the loan paid out");
  const mon = new Date(`${paid[2]} 1, 2000`).getMonth() + 1;
  if (!mon) throw new Error("frozen_amounts_r58.json: month " + paid[2]);
  return {
    euCbr: t.eu_cbr.v, euCbrDate: t.eu_cbr.date, euPriv: t.eu_private.v,
    repoCbrUsd: t.repo_cbr.native.USD_bn, repoCbrDate: t.repo_cbr.date, repoPrivUsd: t.repo_private.native.USD_bn, repoPrivDate: t.repo_private.date,
    euroclear: bel[last], euroclearDate: last, windfall: F.windfall.total_eur_bn.v, windfallDate: F.windfall.total_eur_bn.date,
    eraUsd: +era[1], eraEur: +era[2], usl: +usl[1], uslYears: `${usl[2]}–${usl[3]}`,
    propDate: prop.date, propMax: +prop.fact.match(/up to EUR (\d+)bn/)[1], eucoDate: euco.date.slice(0, 10), uslPaid: +paid[1], paidDate: `${paid[3]}-${String(mon).padStart(2, "0")}`,
  };
}
// an explainer's amounts in a language (seo_i18n.mjs EXPLAIN {amountText}): { amountText, amount }
export function explainAmount(l, id, F) {
  if (!F || !["frozenAssets", "reparationsLoan"].includes(id)) return { vars: { amountText: "" }, nums: { amount: 0 } };
  const x = frozenFacts(F), E = v => I.E(l, v), U = v => I.CUR(l, v, "USD"), D = (s, g) => I.dateL(s, l, g);
  const text = id === "frozenAssets"
    ? R(l, "amtFrozenAssets", { euCbr: E(x.euCbr), euCbrDate: D(x.euCbrDate), euPriv: E(x.euPriv), repoCbr: U(x.repoCbrUsd), repoCbrDate: D(x.repoCbrDate), repoPriv: U(x.repoPrivUsd), repoPrivDate: D(x.repoPrivDate),
      euroclear: E(x.euroclear), euroclearDate: D(x.euroclearDate), windfall: E(x.windfall), windfallDate: D(x.windfallDate, true) })
    : R(l, "amtReparationsLoan", { propDate: D(x.propDate), propMax: E(x.propMax), eucoDate: D(x.eucoDate), usl: E(x.usl), uslYears: x.uslYears, paidDate: D(x.paidDate, true), uslPaid: E(x.uslPaid), eraUsd: U(x.eraUsd), eraEur: E(x.eraEur) });
  return { vars: { amountText: text }, nums: { amount: 1 } };
}

// ----- Russia's oil and gas revenue -----
// the series the page shows: every year (the last one marked when it is not complete), the last n months, CREA's
// yearly estimate and defence spending
export function revenueModel(Rv, nMonths = 24) {
  const ys = Object.keys(Rv.yearly).sort();
  const years = ys.map(y => ({ y, ...Rv.yearly[y] }));
  const full = years.filter(x => x.complete), part = years.filter(x => !x.complete);
  const months = Rv.monthly.slice(-nMonths);
  const latest = Rv.meta.latest_budget_month;
  if (months[months.length - 1].ym !== latest) throw new Error("russia_revenue_r58.json: the last month is not meta.latest_budget_month");
  const crea = Object.keys(Rv.crea_yearly_export_revenue).sort().map(y => ({ y, ...Rv.crea_yearly_export_revenue[y] }));
  const def = Object.keys(Rv.defence_yearly).sort().map(y => ({ y, ...Rv.defence_yearly[y] }))
    .filter(d => ["national_defence_executed_rub_bn", "national_defence_plan_rub_bn", "sipri_local_rub_bn"].some(k => d[k] != null));
  return { years, lastFull: full[full.length - 1], ytd: part[part.length - 1] || null, months, latest, crea, def, y0: ys[0] };
}
const monthOf = (y, n) => `${y}-${String(n).padStart(2, "0")}`;
// a figure cell: rub (RUB bn), eur (EUR bn), share (0.39 = 39%)
function figCell(l, path, v, u) {
  if (v === null || v === undefined) return `<td class="n"${rv("revenue", path, null)}>–</td>`;
  const t = u === "rub" ? I.CUR(l, v, "RUB") : u === "eur" ? I.E(l, v) : I.P(l, 100 * v);
  return `<td class="n"${rv("revenue", path, v, u)}>${esc(t)}</td>`;
}
// the page in a language. o: { warIncome (the address of /russia-war-income/ in this language), published (the date of
// Minfin's data), months (how many months the monthly table shows), yearWord (the column's name) }
export function revenuePage(l, Rv, o) {
  const m = revenueModel(Rv, o.months);
  const lf = m.lastFull, ytd = m.ytd, latestMonthL = I.dateL(m.latest, l, true);
  const yLabel = x => (x.complete ? x.y : R(l, "partYear", { y: x.y, month: I.monthOnly(`${m.latest}-15`, l) }));
  const vars = { y0: m.y0, lastFull: lf.y, ogRub: I.CUR(l, lf.og_rev_rub, "RUB"), ogEur: I.E(l, lf.og_rev_eur), share: I.P(l, 100 * lf.share), latestMonth: latestMonthL,
    ytdRub: ytd ? I.CUR(l, ytd.og_rev_rub, "RUB") : "", ytdEur: ytd ? I.E(l, ytd.og_rev_eur) : "", ytdShare: ytd ? I.P(l, 100 * ytd.share) : "", published: o.published ? I.dateL(o.published, l) : "" };
  const yRows = m.years.map(x => `<tr${rv("revenue", `yearly.${x.y}.complete`, x.complete)}><td>${esc(yLabel(x))}</td>${figCell(l, `yearly.${x.y}.og_rev_rub`, x.og_rev_rub, "rub")}${figCell(l, `yearly.${x.y}.og_rev_eur`, x.og_rev_eur, "eur")}${figCell(l, `yearly.${x.y}.share`, x.share, "share")}${figCell(l, `yearly.${x.y}.total_rev_rub`, x.total_rev_rub, "rub")}</tr>`).join("");
  const head5 = first => `<thead><tr><th>${esc(first)}</th><th class="n">${esc(R(l, "thOgRub"))}</th><th class="n">${esc(R(l, "thOgEur"))}</th><th class="n">${esc(R(l, "thShare"))}</th><th class="n">${esc(R(l, "thTotRub"))}</th></tr></thead>`;
  const mRows = m.months.slice().reverse().map(x => `<tr><td>${esc(I.monthLabel(x.ym, l))}</td>${figCell(l, `monthly@${x.ym}.og_rev_rub`, x.og_rev_rub, "rub")}${figCell(l, `monthly@${x.ym}.og_rev_eur`, x.og_rev_eur, "eur")}${figCell(l, `monthly@${x.ym}.share`, x.share, "share")}${figCell(l, `monthly@${x.ym}.total_rev_rub`, x.total_rev_rub, "rub")}</tr>`).join("");
  const cLabel = x => (x.months < 12 ? R(l, "partYear", { y: x.y, month: I.monthOnly(`${monthOf(x.y, x.months)}-15`, l) }) : x.y);
  const cRows = m.crea.map(x => `<tr><td>${esc(cLabel(x))}</td>${figCell(l, `crea_yearly_export_revenue.${x.y}.total_eur_bn`, x.total_eur_bn, "eur")}${figCell(l, `crea_yearly_export_revenue.${x.y}.oil_gas_eur_bn`, x.oil_gas_eur_bn, "eur")}</tr>`).join("");
  const dRows = m.def.map(x => `<tr><td>${esc(x.y)}</td>${figCell(l, `defence_yearly.${x.y}.national_defence_executed_rub_bn`, x.national_defence_executed_rub_bn, "rub")}${figCell(l, `defence_yearly.${x.y}.national_defence_plan_rub_bn`, x.national_defence_plan_rub_bn, "rub").replace(/<\/td>$/, /approx/i.test(x.plan_note || "") ? ` <span class="sub">(${esc(R(l, "approx"))})</span></td>` : "</td>")}${figCell(l, `defence_yearly.${x.y}.sipri_local_rub_bn`, x.sipri_local_rub_bn, "rub")}${figCell(l, `defence_yearly.${x.y}.sipri_share_gdp`, x.sipri_share_gdp, "share")}</tr>`).join("");
  const srcs = (Rv.sources || []).filter(s => /^https?:/.test(s.url || ""));
  const body = `<h2 id="what">${esc(R(l, "rWhatH"))}</h2><p>${esc(R(l, "rWhat"))}</p>
<h2 id="by-year">${esc(R(l, "rYearH"))}</h2>
<div class="tbl"><table class="rev">${head5(o.yearWord)}<tbody>${yRows}</tbody></table></div>
<h2 id="by-month">${esc(R(l, "rMonthH", { latestMonth: latestMonthL }))}</h2>
<div class="tbl"><table class="rev">${head5(R(l, "thMonth"))}<tbody>${mRows}</tbody></table></div>
<h2 id="exports">${esc(R(l, "rCreaH"))}</h2><p>${esc(R(l, "rCrea"))}</p>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(o.yearWord)}</th><th class="n">${esc(R(l, "thCreaAll"))}</th><th class="n">${esc(R(l, "thCreaOg"))}</th></tr></thead><tbody>${cRows}</tbody></table></div>
<h2 id="defence">${esc(R(l, "rDefH"))}</h2><p>${esc(R(l, "rDef"))}</p>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(o.yearWord)}</th><th class="n">${esc(R(l, "thDefSpent"))}</th><th class="n">${esc(R(l, "thDefPlan"))}</th><th class="n">${esc(R(l, "thSipri"))}</th><th class="n">${esc(R(l, "thSipriGdp"))}</th></tr></thead><tbody>${dRows}</tbody></table></div>
<h2 id="measure">${esc(R(l, "rMeasureH"))}</h2><p>${esc(R(l, "rMeasure"))} <a href="${o.warIncome}">${esc(R(l, "rMeasureLink"))} →</a></p>
<h2 id="sources">${esc(R(l, "sources"))}</h2><ul class="src">${srcs.map(s => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>${/news/i.test(s.type || "") ? ` <span class="sub">(${esc(R(l, "srcNews"))})</span>` : ""}</li>`).join("")}</ul>`;
  const crea = m.crea.find(x => x.y === lf.y);
  const faq = [
    { q: R(l, "rQ1"), a: R(l, "rA1", { ...vars, crea: crea ? I.E(l, crea.oil_gas_eur_bn) : "" }) },
    { q: R(l, "rQ2"), a: R(l, "rA2", { ...vars, list: m.years.filter(x => x.complete).map(x => `${x.y} ${I.P(l, 100 * x.share)}`).join(", ") }) },
  ];
  return { title: R(l, "rTitle"), description: R(l, "rDesc", vars), h1: R(l, "rH1", vars), intro: R(l, "rIntro", vars), label: R(l, "rLabel"), body, faq, model: m };
}
// the CSV files of the series (the downloads): month by month, and by year with CREA and defence beside
export function revenueCsv(Rv) {
  const q = v => (v === null || v === undefined ? "" : String(v));
  const monthly = ["month,oil_gas_revenue_rub_bn,oil_gas_revenue_eur_bn,oil_gas_revenue_usd_bn,federal_revenue_rub_bn,federal_revenue_eur_bn,oil_gas_share,eur_rub_monthly_average,usd_rub_monthly_average",
    ...Rv.monthly.map(x => [x.ym, x.og_rev_rub, x.og_rev_eur, x.og_rev_usd, x.total_rev_rub, x.total_rev_eur, x.share, x.eur_rub_avg, x.usd_rub_avg].map(q).join(","))].join("\n");
  const ys = [...new Set([...Object.keys(Rv.yearly), ...Object.keys(Rv.crea_yearly_export_revenue), ...Object.keys(Rv.defence_yearly)])].sort();
  const yearly = ["year,months,complete,oil_gas_revenue_rub_bn,oil_gas_revenue_eur_bn,oil_gas_revenue_usd_bn,federal_revenue_rub_bn,federal_revenue_eur_bn,oil_gas_share,crea_fossil_export_eur_bn_estimate,crea_oil_gas_export_eur_bn_estimate,national_defence_spent_rub_bn,national_defence_budget_law_rub_bn,sipri_military_spending_rub_bn,sipri_military_share_gdp",
    ...ys.map(y => { const a = Rv.yearly[y] || {}, c = Rv.crea_yearly_export_revenue[y] || {}, d = Rv.defence_yearly[y] || {};
      return [y, a.months, a.complete, a.og_rev_rub, a.og_rev_eur, a.og_rev_usd, a.total_rev_rub, a.total_rev_eur, a.share, c.total_eur_bn, c.oil_gas_eur_bn, d.national_defence_executed_rub_bn, d.national_defence_plan_rub_bn, d.sipri_local_rub_bn, d.sipri_share_gdp].map(q).join(","); })].join("\n");
  return { monthly, yearly };
}
