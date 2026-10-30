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
// Round 59 (owner approved: "wire the three research results of round 59"):
//   fuel        fuel_split_r59.json: what each country bought from Russia by fuel (crude oil, oil products, pipeline gas,
//               LNG, coal), each year 2022 to the data's month, on three bases said every time: the importer's own
//               customs (CIF), the map's basis (FOB at the Russian border, the figure in the map) and CREA's tracker.
//               Tables per fuel on /russian-oil-gas-buyers/ (ranked by customs), a section on the country pages, the
//               crude by year and a question where a country's purchases are large and measured, a CSV, llms-full.txt.
//   military    mil_split_r59.json: the site's support for Ukraine split into military, financial, humanitarian,
//               refugees, the share of EU aid, other and money flowing back, beside the Kiel Institute's military
//               figure: /military-aid-to-ukraine-by-country/, a section on the country pages, columns on the support
//               tracker, a CSV, llms-full.txt. A zero outside Kiel's records is "no record found", never zero aid.
//   deficit     russia_deficit_r59.json: Russia's federal budget balance by year and month (execution), the 2026 law,
//               in-year plan and September estimate (each labelled), and the National Wealth Fund's liquid assets, on
//               /russia-oil-gas-revenue/, with the question on the budget deficit. Facts with their dates, no causes.
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
// round 59: a figure computed from the file (a sum or a difference of its values) is marked by its paths joined with
// " + " and " - " (check 48 works it out again), data-sg="-1" where the page shows the value with the opposite sign
// (a deficit the file stores as a negative balance), data-pop (millions) for a figure per person

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
// o.frozen (round 59): frozenFacts of frozen_amounts_r58.json, for the reserves immobilised in the EU (or null)
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
  // round 59: "What are the EU sanctions on Russia?", from the file: the Council regulations its EU category names, the
  // members and the adopters, the members in the price cap coalition through the EU; the reserves immobilised in the EU
  // from frozen_amounts_r58.json
  const regs = String((S.categories || {}).eu_member || "").match(/\d+\/\d{4}/g);
  if (!regs) throw new Error("sanctions_r58.json: the EU category names no Council regulation");
  const fz = o.frozen || null;
  faq.splice(1, 0, { q: R(l, "sQ3"), a: R(l, "sA3", { regs: I.list3(l, regs), nEu: n.eu_member || 0, nAdopt: n.adopts_eu_measures || 0, adoptList: list(of("adopts_eu_measures")), checked,
    euCbr: fz ? I.E(l, fz.euCbr) : "", euCbrDate: fz ? I.dateL(fz.euCbrDate, l) : "" }, { nViaEU: all.filter(r => r.cat === "eu_member" && r.cap.viaEU).length, euCbrOk: fz ? 1 : 0 }) });
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
// round 59: the amounts the frozen-assets page's question on Euroclear answers, in a language
export function frozenVars(l, F) {
  const x = frozenFacts(F);
  return { euroclear: I.E(l, x.euroclear), euroclearDate: I.dateL(x.euroclearDate, l), euCbr: I.E(l, x.euCbr), euCbrDate: I.dateL(x.euCbrDate, l) };
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
// Minfin's data), months (how many months the monthly table shows), yearWord (the column's name), balance (round 59:
// the name of the budget balance series, seo_families.json research.revenue.balance) }
export function revenuePage(l, Rv, o) {
  const m = revenueModel(Rv, o.months);
  const lf = m.lastFull, ytd = m.ytd, latestMonthL = I.dateL(m.latest, l, true);
  const yLabel = x => (x.complete ? x.y : R(l, "partYear", { y: x.y, month: I.monthOnly(`${m.latest}-15`, l) }));
  // round 59: Russia's defence budget (the budget law's latest year, the year before it, SIPRI's latest estimate)
  const dv = defenceVars(l, Rv);
  const vars = { ...dv.vars, y0: m.y0, lastFull: lf.y, ogRub: I.CUR(l, lf.og_rev_rub, "RUB"), ogEur: I.E(l, lf.og_rev_eur), share: I.P(l, 100 * lf.share), latestMonth: latestMonthL,
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
${o.deficit ? deficitBlock(l, o.deficit, { months: o.months }) : ""}
<h2 id="measure">${esc(R(l, "rMeasureH"))}</h2><p>${esc(R(l, "rMeasure"))} <a href="${o.warIncome}">${esc(R(l, "rMeasureLink"))} →</a></p>
<h2 id="sources">${esc(R(l, "sources"))}</h2><ul class="src">${srcs.map(s => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(s.name)}</a>${/news/i.test(s.type || "") ? ` <span class="sub">(${esc(R(l, "srcNews"))})</span>` : ""}</li>`).join("")}</ul>`;
  const crea = m.crea.find(x => x.y === lf.y);
  const faq = [
    { q: R(l, "rQ1"), a: R(l, "rA1", { ...vars, crea: crea ? I.E(l, crea.oil_gas_eur_bn) : "" }) },
    { q: R(l, "rQ2"), a: R(l, "rA2", { ...vars, list: m.years.filter(x => x.complete).map(x => `${x.y} ${I.P(l, 100 * x.share)}`).join(", ") }) },
  ];
  // round 59: the questions people search: the defence budget, and the budget's balance (russia_deficit_r59.json, the
  // research entry seo_families.json research.revenue.balance names)
  if (dv.nums.defOk) faq.splice(1, 0, { q: R(l, "rQ3"), a: R(l, "rA3", dv.vars, dv.nums) });
  const bal = o.deficit ? balanceVars(l, o.deficit) : null;
  if (bal) faq.push({ q: R(l, "rQ4"), a: R(l, "rA4", bal.vars, bal.nums) });
  return { title: R(l, "rTitle"), description: R(l, "rDesc", vars), h1: R(l, "rH1", vars), intro: R(l, "rIntro", vars, dv.nums), label: R(l, "rLabel"), body, faq, model: m };
}
// round 59: the defence figures a question answers, each as what it is: the budget law's "national defence" in its
// latest year (and the year before, planned or spent), SIPRI's latest estimate (broader definition) and its share of GDP
export function defenceVars(l, Rv) {
  const d = Rv.defence_yearly || {}, ys = Object.keys(d).sort();
  const plan = ys.filter(y => d[y].national_defence_plan_rub_bn != null), sip = ys.filter(y => d[y].sipri_local_rub_bn != null);
  const y = plan[plan.length - 1], prev = y ? String(+y - 1) : null, pv = prev && d[prev] ? d[prev].national_defence_plan_rub_bn ?? d[prev].national_defence_executed_rub_bn : null;
  const sy = sip[sip.length - 1];
  if (!y || !sy) return { vars: { defPlan: "", defYear: "", defPrev: "", prevYear: "", sipriYear: "", sipriRub: "", sipriGdp: "" }, nums: { defOk: 0, prevOk: 0 } };
  return { vars: { defPlan: I.CUR(l, d[y].national_defence_plan_rub_bn, "RUB"), defYear: y, defPrev: pv != null ? I.CUR(l, pv, "RUB") : "", prevYear: prev || "",
    sipriYear: sy, sipriRub: I.CUR(l, d[sy].sipri_local_rub_bn, "RUB"), sipriGdp: d[sy].sipri_share_gdp != null ? I.P(l, 100 * d[sy].sipri_share_gdp) : "" },
  nums: { defOk: 1, prevOk: pv != null ? 1 : 0 } };
}
// round 59: the federal budget's balance a question answers (russia_deficit_r59.json): the last complete year and the
// current year to its latest month (execution), the 2026 budget law and the Ministry's latest estimate (each as what it
// is); null without the file
export function balanceVars(l, D) {
  if (!D || !Array.isArray(D.yearly)) return null;
  const full = D.yearly.filter(y => y.complete && y.balance_rub != null), part = D.yearly.filter(y => !y.complete && y.balance_rub != null);
  const y = full[full.length - 1], p = part[part.length - 1];
  if (!y) return null;
  const pl = deficitPlans(D, p ? String(p.year) : "");
  const law = pl.find(x => x.kind === "law"), est = pl.filter(x => x.kind === "estimate").pop();
  const R0 = v => I.CUR(l, Math.abs(v), "RUB");
  return {
    vars: { balYear: String(y.year), balRub: R0(y.balance_rub), balEur: I.E(l, y.balance_eur), balGdp: y.balance_pct_gdp != null ? I.P(l, 100 * Math.abs(y.balance_pct_gdp)) : "",
      ytdYear: p ? String(p.year) : "", ytdMonth: p ? I.monthOnly(`${D.meta.latest_budget_month}-15`, l) : "", ytdRub: p ? R0(p.balance_rub) : "", ytdEur: p ? I.E(l, p.balance_eur) : "",
      lawRub: law ? R0(law.deficit) : "", lawGdp: law && law.deficit_pct_gdp != null ? I.P(l, 100 * law.deficit_pct_gdp) : "",
      estRub: est ? R0(est.deficit) : "", estGdp: est && est.deficit_pct_gdp_stated != null ? I.P(l, 100 * est.deficit_pct_gdp_stated) : "", estDate: est ? I.dateL(est.date, l) : "" },
    nums: { bal: y.balance_rub, gdpOk: y.balance_pct_gdp != null ? 1 : 0, ytdOk: p ? 1 : 0, ytd: p ? p.balance_rub : 0, lawOk: law ? 1 : 0, estOk: est ? 1 : 0 },
  };
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

// ===== round 59: three more research results (fuel_split_r59.json, mil_split_r59.json, russia_deficit_r59.json) =====
// a marked figure cell. u: eur (€ bn), rub (RUB bn), share (a fraction, shown as %), pct (already %), pp (per person:
// o.pop in millions); o.sg -1 shows the value with the opposite sign; o.sub a line beneath; o.cls the cell's class
// (n, or k beside the model's own cells); o.none the words where the file has no figure
const signOf = (x, t) => (x < 0 && /[1-9]/.test(t) && !t.startsWith("<") ? "−" : "");
export function figText(l, v, u, pop) {
  const a = u === "rub" ? I.CUR(l, v, "RUB") : u === "eur" ? I.E(l, v) : u === "share" ? I.P(l, 100 * v) : u === "pct" ? I.P(l, v) : u === "pp" ? I.PP(l, (v * 1000) / pop) : String(v);
  return signOf(v, a) + a;
}
function cellOf(l, file, path, v, u, o = {}) {
  const cls = o.cls || "n";
  if (v === null || v === undefined) return `<td class="${cls}"${rv(file, path, null)}>${esc(o.none || "–")}</td>`;
  const sg = o.sg || 1, x = v * sg;
  const attrs = rv(file, path, v, u) + (sg !== 1 ? ` data-sg="${sg}"` : "") + (u === "pp" ? ` data-pop="${o.pop}"` : "");
  return `<td class="${cls}"${attrs}>${esc(figText(l, x, u, o.pop))}${o.sub ? `<span class="s">${esc(o.sub)}</span>` : ""}</td>`;
}
// a marked figure in a sentence (the same reading as a cell)
function figSpan(l, file, path, v, u, o = {}) {
  const sg = o.sg || 1;
  return `<span${rv(file, path, v, u)}${sg !== 1 ? ` data-sg="${sg}"` : ""}>${esc(figText(l, v * sg, u, o.pop))}</span>`;
}
// a plain value marked (a quality letter, a word): its text is the reader's, its value the file's
const wordCell = (file, path, v, text, sub = "") => `<td${rv(file, path, v)}>${esc(text)}${sub ? ` <span class="sub">(${esc(sub)})</span>` : ""}</td>`;
const sumPath = paths => paths.join(" + ");
const sumOf = xs => xs.reduce((a, x) => a + x, 0);

// ----- what each country bought from Russia, by fuel -----
export const FUELS = ["crude", "products", "pipeline_gas", "lng", "coal"];
const QR = { A: 0, B: 1, C: 2, D: 3 };
// the war years of the file (2021 is its pre-war reference) and the partial last year's months
export const fuelYears = F => F.years.filter(y => +y >= 2022).map(String);
export const fuelPeriod = (l, F) => R(l, "fPeriod", { to: I.monthYear(F.data_to, l) });
// a country's value in a year on one basis: site (the map's, central), customs (the importer's, CIF), tracker (CREA)
function fy(F, iso, y, basis, fuel) {
  const x = ((F.countries[iso] || {}).years || {})[y];
  if (!x) return { v: null, path: "" };
  if (basis === "site") return { v: x[fuel] ? x[fuel].central : null, path: `countries.${iso}.years.${y}.${fuel}.central` };
  const k = basis === "customs" ? "gross_customs" : "tracker_crea";
  return { v: x[k] && x[k][fuel] != null ? x[k][fuel] : null, path: `countries.${iso}.years.${y}.${k}.${fuel}` };
}
// 2022 to the data's month on one basis: customs and site from the file's own sums, the tracker its years added up
export function fuelSum(F, iso, basis, fuel) {
  const c = F.countries[iso];
  if (basis === "customs") { const g = c.gross_customs_sum_2022_2026; return { v: g && g[fuel] != null ? g[fuel] : null, path: `countries.${iso}.gross_customs_sum_2022_2026.${fuel}` }; }
  if (basis === "site") { const s = c.sum_2022_2026 && c.sum_2022_2026[fuel]; return { v: s ? s.central : null, lo: s ? s.low : null, hi: s ? s.high : null, path: `countries.${iso}.sum_2022_2026.${fuel}.central` }; }
  const xs = fuelYears(F).map(y => fy(F, iso, y, "tracker", fuel)).filter(x => x.v != null);
  return xs.length ? { v: sumOf(xs.map(x => x.v)), path: sumPath(xs.map(x => x.path)) } : { v: null, path: `countries.${iso}.years.${fuelYears(F)[0]}.tracker_crea.${fuel}` };
}
// a row's quality: the weakest of the war years in which the fuel was material (1% of its sum), and whether its
// customs hide the supplier (Türkiye's crude and gas: the file's basis says so)
export function fuelQuality(F, iso, fuel) {
  const c = F.countries[iso], ys = fuelYears(F);
  const size = y => (fuel ? Math.abs(fy(F, iso, y, "site", fuel).v || 0) + Math.abs(fy(F, iso, y, "customs", fuel).v || 0) : sumOf(FUELS.map(f => Math.abs(fy(F, iso, y, "site", f).v || 0))));
  const tot = sumOf(ys.map(size));
  const use = ys.filter(y => c.years[y] && tot > 0 && size(y) >= 0.01 * tot);
  if (!use.length) return null;
  const y = use.slice().sort((a, b) => QR[c.years[b].quality] - QR[c.years[a].quality] || a.localeCompare(b))[0];
  return { q: c.years[y].quality, y, path: `countries.${iso}.years.${y}.quality`, hidden: !!fuel && use.some(z => /partner hidden/i.test((c.years[z].basis || {})[fuel] || "")) };
}
const isEst = q => q === "C" || q === "D";
// the rows of a fuel's table: the countries whose customs record the most, and those the map's basis lists most, sorted
// by customs (the usual meaning of "imports"); the research's own list of buyers is the check
export function fuelRows(F, fuel, n = 15) {
  const isos = Object.keys(F.countries);
  const cust = iso => fuelSum(F, iso, "customs", fuel).v, site = iso => fuelSum(F, iso, "site", fuel).v;
  const byC = isos.filter(i => cust(i) > 0).sort((a, b) => cust(b) - cust(a)).slice(0, n);
  const byS = isos.filter(i => site(i) > 0).sort((a, b) => site(b) - site(a)).slice(0, n);
  const tb = ((F.top_buyers_2022_2026 || {})[fuel] || {}).gross_customs || [];
  const want = tb.slice(0, n).map(x => x.iso3);
  if (want.length && want.join() !== byC.slice(0, want.length).join()) throw new Error(`fuel_split_r59.json ${fuel}: the buyers by customs are not the file's top_buyers_2022_2026`);
  return [...byC, ...byS.filter(i => !byC.includes(i))].sort((a, b) => (cust(b) ?? -1) - (cust(a) ?? -1) || (site(b) ?? 0) - (site(a) ?? 0));
}
// the three cells of a row (customs, the map's basis with its range, the tracker) and its quality
function fuelCells(l, F, iso, fuel, { range = true } = {}) {
  const c = fuelSum(F, iso, "customs", fuel), s = fuelSum(F, iso, "site", fuel), t = fuelSum(F, iso, "tracker", fuel);
  const sub = range && s.lo != null && s.hi != null && I.E(l, s.lo) !== I.E(l, s.hi) ? R(l, "fRange", { lo: I.E(l, s.lo), hi: I.E(l, s.hi) }) : "";
  const tr = t.v === null || t.v === 0 ? `<td class="n"${rv("fuel", t.path, t.v)}>${esc(R(l, "notTracked"))}</td>` : cellOf(l, "fuel", t.path, t.v, "eur");
  return cellOf(l, "fuel", c.path, c.v, "eur", { none: R(l, "noCustoms") }) + cellOf(l, "fuel", s.path, s.v, "eur", { sub }) + tr;
}
function qualityCell(l, F, iso, fuel) {
  const q = fuelQuality(F, iso, fuel);
  if (!q) return "<td>–</td>";
  const sub = [isEst(q.q) ? R(l, "est") : "", q.hidden ? R(l, "hidden") : ""].filter(Boolean).join("; ");
  return wordCell("fuel", q.path, q.q, q.q, sub);
}
const fuelHead = (l, first) => `<thead><tr>${first}<th class="n">${esc(R(l, "thCustoms"))}</th><th class="n">${esc(R(l, "thSite"))}</th><th class="n">${esc(R(l, "thTracker"))}</th><th>${esc(R(l, "thQuality"))}</th></tr></thead>`;
// the bases, said once for every table
const fuelBases = l => `<ul class="bul"><li>${esc(R(l, "fBasisCustoms"))}</li><li>${esc(R(l, "fBasisSite"))}</li><li>${esc(R(l, "fBasisTracker"))}</li></ul><p class="sub">${esc(R(l, "fQuality"))}</p>`;

// the section of /russian-oil-gas-buyers/: a table per fuel and the buyers on the map together. o: { nameOf(iso),
// href(iso) (its page, or ""), rows }
export function fuelSection(l, F, o) {
  const period = fuelPeriod(l, F), n = o.rows || 15;
  const nm = iso => (o.href(iso) ? `<a href="${o.href(iso)}">${esc(o.nameOf(iso))}</a>` : esc(o.nameOf(iso)));
  const tables = FUELS.map(f => {
    const rows = fuelRows(F, f, n);
    return `<h3 id="fuel-${f.replace(/_/g, "-")}">${esc(R(l, "fTableH", { fuel: R(l, "fu_" + f), period }))}</h3>
<div class="tbl"><table class="fuel" data-fuel="${f}">${fuelHead(l, `<th>#</th><th>${esc(I.s(l, "country"))}</th>`)}<tbody>${rows.map((iso, i) => `<tr id="${f}-${iso}"><td class="r">${i + 1}</td><td>${nm(iso)}</td>${fuelCells(l, F, iso, f)}${qualityCell(l, F, iso, f)}</tr>`).join("")}</tbody></table></div>`;
  }).join("\n");
  // the buyers on the map together, 2022 to the data's month: customs of the reporters, the map's basis, CREA's tracker
  const ys = fuelYears(F), W = F.world;
  const wsum = (k, f) => { const xs = ys.filter(y => W[y] && W[y][k] && W[y][k][f] != null); return xs.length ? { v: sumOf(xs.map(y => W[y][k][f])), path: sumPath(xs.map(y => `world.${y}.${k}.${f}`)) } : null; };
  const wcell = x => (x ? cellOf(l, "fuel", x.path, x.v, "eur") : "<td class=\"n\">–</td>");
  const wrow = f => `<tr><td>${esc(R(l, "fu_" + f))}</td>${wcell(wsum("gross_customs_reporters", f))}${wcell(wsum("site_basis", f))}${f === "other" || f === "total_site" ? "<td class=\"n\">–</td>" : wcell(wsum("crea_all_destinations", f))}</tr>`;
  const world = `<h3 id="fuel-all">${esc(R(l, "fWorldH", { period }))}</h3>
<div class="tbl"><table class="fuel"><thead><tr><th>${esc(R(l, "thFuel"))}</th><th class="n">${esc(R(l, "thCustoms"))}</th><th class="n">${esc(R(l, "thSite"))}</th><th class="n">${esc(R(l, "thTracker"))}</th></tr></thead><tbody>${[...FUELS, "other"].map(wrow).join("")}</tbody></table></div>
<p class="sub">${esc(R(l, "fWorldNote"))}</p>`;
  return `<h2 id="by-fuel">${esc(R(l, "fH"))}</h2>
<p>${esc(R(l, "fIntro", { period }))}</p>
${fuelBases(l)}
${tables}
${world}
<p class="sub">${esc(R(l, "fNote", { y: ys[ys.length - 1], month: I.monthOnly(F.data_to, l) }))}</p>`;
}
// the values the buyers page's questions use (seo_i18n.mjs TOPIC_X): the first three buyers by customs of each fuel, the
// first one's figure on each basis, the buyers on the map together. nameOf(iso): the name in a sentence
export function fuelVars(l, F, nameOf, n = 15) {
  const top = f => fuelRows(F, f, n).filter(i => fuelSum(F, i, "customs", f).v > 0);
  const E = v => I.E(l, v);
  const one = (f, p) => { const i = top(f)[0]; return { [p + "1"]: nameOf(i), [p + "1v"]: E(fuelSum(F, i, "customs", f).v), [p + "1s"]: E(fuelSum(F, i, "site", f).v), [p + "1t"]: fuelSum(F, i, "tracker", f).v ? E(fuelSum(F, i, "tracker", f).v) : "", [p + "Tops"]: I.list3(l, top(f).slice(0, 3).map(nameOf)) }; };
  const ys = fuelYears(F), W = F.world, ws = (k, f) => sumOf(ys.map(y => ((W[y] || {})[k] || {})[f] || 0));
  const hid = ["crude", "pipeline_gas"].flatMap(f => top(f).slice(0, 3).filter(i => (fuelQuality(F, i, f) || {}).hidden));
  return {
    vars: { period: fuelPeriod(l, F), ...one("crude", "c"), ...one("products", "p"), ...one("pipeline_gas", "g"), ...one("lng", "n"), ...one("coal", "k"),
      wCrude: E(ws("gross_customs_reporters", "crude")), wProd: E(ws("gross_customs_reporters", "products")), sCrude: E(ws("site_basis", "crude")), sProd: E(ws("site_basis", "products")),
      tCrude: E(ws("crea_all_destinations", "crude")), tProd: E(ws("crea_all_destinations", "products")), hiddenName: hid.length ? nameOf(hid[0]) : "" },
    nums: { hidden: hid.length ? 1 : 0, c1tOk: fuelSum(F, top("crude")[0], "tracker", "crude").v ? 1 : 0 },
  };
}
// a country's purchases by fuel: shown where its fuel (the five, on the map's basis, 2022 to the data's month) comes to
// at least cfg.minEur and a war year's quality is one of cfg.quality; its crude by year (and the question) where its
// customs recorded at least crudeYears.minEur of crude in the last full year and every war year is measured
export function fuelOf(F, iso, cfg = {}) {
  const c = F && F.countries && F.countries[iso];
  if (!c) return null;
  const ys = fuelYears(F), okQ = cfg.quality || ["A", "B", "C"];
  const fuel = sumOf(FUELS.map(f => fuelSum(F, iso, "site", f).v || 0));
  if (fuel < (cfg.minEur ?? 0.1) || !ys.some(y => c.years[y] && okQ.includes(c.years[y].quality))) return null;
  const cy = cfg.crudeYears || {}, full = ys.filter(y => !(c.years[y] || {}).partial_year), last = full[full.length - 1];
  const crudeYears = !!last && (fy(F, iso, last, "customs", "crude").v || 0) >= (cy.minEur ?? Infinity) && ys.every(y => c.years[y] && (cy.quality || ["A", "B"]).includes(c.years[y].quality));
  return { iso, fuel, crudeYears };
}
// the country page's section, and its question where the crude by year is shown. names: { N, Nt, NtCap }; page: the
// buyers page in this language
export function fuelCountry(l, F, iso, cfg, names, page) {
  const r = fuelOf(F, iso, cfg);
  if (!r) return null;
  const c = F.countries[iso], ys = fuelYears(F), period = fuelPeriod(l, F);
  const yl = y => (c.years[y].partial_year ? R(l, "partYear", { y, month: I.monthOnly(F.data_to, l) }) : y);
  const has = f => ["customs", "site", "tracker"].some(b => Math.abs(fuelSum(F, iso, b, f).v || 0) >= 0.0005);
  const rows = FUELS.filter(has).map(f => `<tr><td>${esc(R(l, "fu_" + f))}</td>${fuelCells(l, F, iso, f)}${qualityCell(l, F, iso, f)}</tr>`).join("");
  const g = c.gross_customs_sum_2022_2026 || {}, keys = [...FUELS, "other"];
  const other = `<tr><td>${esc(R(l, "fu_other"))}</td>${cellOf(l, "fuel", `countries.${iso}.gross_customs_sum_2022_2026.other`, g.other ?? null, "eur")}${cellOf(l, "fuel", `countries.${iso}.sum_2022_2026.other.central`, c.sum_2022_2026.other.central, "eur")}<td class="n">–</td><td></td></tr>`;
  const total = `<tr><td><b>${esc(R(l, "fu_total"))}</b></td>${g.crude != null ? cellOf(l, "fuel", sumPath(keys.map(k => `countries.${iso}.gross_customs_sum_2022_2026.${k}`)), sumOf(keys.map(k => g[k] || 0)), "eur") : "<td class=\"n\">–</td>"}${cellOf(l, "fuel", `countries.${iso}.sum_2022_2026.total_site.central`, c.sum_2022_2026.total_site.central, "eur")}<td class="n">–</td><td></td></tr>`;
  const qs = ys.filter(y => c.years[y]).map(y => `<span${rv("fuel", `countries.${iso}.years.${y}.quality`, c.years[y].quality)}>${esc(yl(y))}: ${esc(c.years[y].quality)}</span>`).join(", ");
  let html = `<p>${esc(R(l, "fCountryLead", { NtCap: names.NtCap, period }))}</p>
<div class="tbl"><table class="fuel">${fuelHead(l, `<th>${esc(R(l, "thFuel"))}</th>`)}<tbody>${rows}${other}${total}</tbody></table></div>
<p class="sub">${R(l, "fQualityYears", { list: qs })}</p>`;
  let faq = null;
  if (r.crudeYears) {
    const cells = y => { const a = fy(F, iso, y, "customs", "crude"), b = fy(F, iso, y, "site", "crude"), t = fy(F, iso, y, "tracker", "crude"); return cellOf(l, "fuel", a.path, a.v, "eur") + cellOf(l, "fuel", b.path, b.v, "eur") + (t.v ? cellOf(l, "fuel", t.path, t.v, "eur") : `<td class="n"${rv("fuel", t.path, t.v)}>${esc(R(l, "notTracked"))}</td>`); };
    html += `<h3 id="crude-by-year">${esc(R(l, "fCrudeH"))}</h3>
<div class="tbl"><table class="fuel">${fuelHead(l, `<th>${esc(R(l, "thYear"))}</th>`)}<tbody>${ys.filter(y => c.years[y]).map(y => `<tr><td>${esc(yl(y))}</td>${cells(y)}${wordCell("fuel", `countries.${iso}.years.${y}.quality`, c.years[y].quality, c.years[y].quality, isEst(c.years[y].quality) ? R(l, "est") : "")}</tr>`).join("")}</tbody></table></div>`;
    const list = ys.filter(y => c.years[y]).map(y => { const a = fy(F, iso, y, "customs", "crude"); return `${esc(yl(y))} ${figSpan(l, "fuel", a.path, a.v, "eur")}`; }).join("; ");
    const withT = ys.filter(y => fy(F, iso, y, "tracker", "crude").v), lastT = withT.filter(y => !c.years[y].partial_year).pop() || withT.pop(), t = lastT ? fy(F, iso, lastT, "tracker", "crude") : null, s = fuelSum(F, iso, "site", "crude");
    faq = { q: R(l, "fQCountry", names), a: R(l, "fACountry", { ...names, list, tYear: lastT ? esc(yl(lastT)) : "", t: t ? figSpan(l, "fuel", t.path, t.v, "eur") : "", site: figSpan(l, "fuel", s.path, s.v, "eur"), period: esc(period) }, { tOk: t ? 1 : 0 }) };
  }
  html += `<p><a href="${page}#by-fuel">${esc(R(l, "fAll"))} →</a></p>`;
  return { title: R(l, "fCountryH"), html, faq };
}
// the CSV (the downloads): every country, year and fuel on the three bases, with the map's range and the quality
export function fuelCsv(F, nameOf = iso => F.countries[iso].name) {
  const q = v => (v === null || v === undefined ? "" : String(v));
  const out = ["iso3,country,year,months,fuel,site_basis_fob_eur_bn,site_basis_low_eur_bn,site_basis_high_eur_bn,customs_cif_eur_bn,tracker_crea_eur_bn,quality"];
  for (const iso of Object.keys(F.countries).sort()) {
    const c = F.countries[iso];
    for (const y of F.years.map(String)) {
      const x = c.years[y];
      if (!x) continue;
      const months = x.partial_year ? x.partial_year : "January-December";
      for (const f of [...FUELS, "other", "total_site"]) {
        const s = x[f] || {}, g = x.gross_customs || {}, t = x.tracker_crea || {};
        const nm = nameOf(iso), name = /[",]/.test(nm) ? `"${nm.replace(/"/g, '""')}"` : nm;
        out.push([iso, name, y, months, f === "total_site" ? "total" : f, q(s.central), q(s.low), q(s.high), q(f === "total_site" ? g.total : g[f]), q(f === "other" || f === "total_site" ? null : t[f]), x.quality].join(","));
      }
    }
  }
  return out.join("\n");
}

// ----- support for Ukraine by type, and military aid by country -----
export const MIL_PARTS = ["military", "financial", "humanitarian", "refugees", "eu_share", "other", "flowback"];
export function milVal(M, iso, k) {
  const c = M && M.countries && M.countries[iso];
  if (!c) return null;
  if (k === "other") return { v: c.other ? (c.other.private_donations || 0) + (c.other.extra_purchases_from_ukraine || 0) : 0, path: `countries.${iso}.other.private_donations + countries.${iso}.other.extra_purchases_from_ukraine` };
  return { v: c[k] ?? null, path: `countries.${iso}.${k}` };
}
// no military aid on record outside Kiel's tracker: "no record found", not zero
export const milNoRecord = (M, iso) => { const c = M.countries[iso]; return !!c && c.basis !== "kiel" && Math.abs(c.military || 0) < 0.0005; };
function milCell(l, M, iso, k, o = {}) {
  const x = milVal(M, iso, k);
  if (!x) return `<td class="${o.cls || "n"}">–</td>`;
  // round 60 (audit: words in a column of figures): no record is a dash, its words in the cell's title and the notes
  if (k === "military" && milNoRecord(M, iso)) return `<td class="${o.cls || "n"}"${rv("military", x.path, x.v)} title="${esc(R(l, "noRecord"))}">–</td>`;
  return cellOf(l, "military", x.path, x.v, "eur", o);
}
// the columns beside the support tracker's table (td.k: outside the model's checked cells)
export const milHeads = l => MIL_PARTS.map(k => R(l, "ty_" + k));
export const milCells = (l, M, iso) => MIL_PARTS.map(k => milCell(l, M, iso, k, { cls: "k" })).join("");
// the country page's section: its support split by type, adding up to the map's figure. names: { Nt, NtCap }
export function milCountry(l, M, iso, names, page) {
  const c = M && M.countries && M.countries[iso];
  if (!c || Math.abs(c.total_site || 0) < 0.0005) return null;
  const kiel = c.kiel_military != null ? R(l, "mKiel", { v: I.E(l, c.kiel_military) }) : R(l, "mNotKiel");
  const rng = c.military_range && I.E(l, c.military_range[0]) !== I.E(l, c.military_range[1]) ? R(l, "fRange", { lo: I.E(l, c.military_range[0]), hi: I.E(l, c.military_range[1]) }) : "";
  const eu = c.eu_share_split && Math.abs(c.eu_share_split.military || 0) >= 0.0005 ? R(l, "mEuMil", { v: I.E(l, c.eu_share_split.military) }) : "";
  // round 60 (audit: Iran's and China's "financial aid" is their share of IMF and World Bank lending): that share is named
  const imf = (c.financial_parts || {}).imf_world_bank_ebrd_share || 0;
  const sub = { military: [rng, milNoRecord(M, iso) ? R(l, "noRecord") : kiel].filter(Boolean).join("; "), eu_share: eu, flowback: R(l, "mBackNote"),
    financial: Math.abs(imf) >= 0.0005 ? R(l, "mImf", { v: I.E(l, imf) }) : "" };
  const row = k => `<tr><td>${esc(R(l, "ty_" + k))}</td>${milCell(l, M, iso, k, { sub: sub[k] || "" })}</tr>`;
  const shown = MIL_PARTS.filter(k => k === "military" || Math.abs(milVal(M, iso, k).v || 0) >= 0.0005);
  const html = `<p>${esc(R(l, "mCountryLead", { ...names, period: R(l, "fPeriod", { to: names.dataTo }) }))}</p>
<div class="tbl"><table class="mil"><tbody>${shown.map(row).join("")}<tr><td><b>${esc(R(l, "ty_total"))}</b></td>${cellOf(l, "military", `countries.${iso}.total_site`, c.total_site, "eur")}</tr></tbody></table></div>
<p class="sub"><span${rv("military", `countries.${iso}.quality`, c.quality)}>${esc(R(l, "mQuality", { q: c.quality }))}</span>${milNoRecord(M, iso) ? " " + esc(R(l, "mNoRecordNote")) : ""}</p>
<p><a href="${page}">${esc(R(l, "mAll"))} →</a></p>`;
  return { title: R(l, "mCountryH"), html };
}
// the page /military-aid-to-ukraine-by-country/ in a language. o: { nameOf(iso), href(iso), pop(iso) (millions, or
// null), dataTo, stepsMin (the donors whose steps from Kiel's figure are shown, € bn), gdpMin (€ bn, for the question
// on the share of GDP) }
export function milPage(l, M, o) {
  const C = M.countries, isos = Object.keys(C);
  const nm = iso => (o.href(iso) ? `<a href="${o.href(iso)}">${esc(o.nameOf(iso))}</a>` : esc(o.nameOf(iso)));
  const rows = isos.filter(i => Math.abs(C[i].military || 0) >= 0.0005 || Math.abs(C[i].kiel_military || 0) >= 0.0005)
    .sort((a, b) => (C[b].military || 0) - (C[a].military || 0) || (C[b].kiel_military || 0) - (C[a].kiel_military || 0) || a.localeCompare(b));
  const rng = c => (c.military_range && I.E(l, c.military_range[0]) !== I.E(l, c.military_range[1]) ? R(l, "fRange", { lo: I.E(l, c.military_range[0]), hi: I.E(l, c.military_range[1]) }) : "");
  const tr = (iso, i) => {
    const c = C[iso], pop = o.pop(iso);
    return `<tr id="${iso}"><td class="r">${i + 1}</td><td>${nm(iso)}</td>${milCell(l, M, iso, "military", { sub: rng(c) })}${c.kiel_military == null ? `<td class="n"${rv("military", `countries.${iso}.kiel_military`, null)}>${esc(R(l, "mNotKielCell"))}</td>` : cellOf(l, "military", `countries.${iso}.kiel_military`, c.kiel_military, "eur")}${cellOf(l, "military", `countries.${iso}.military_pct_gdp`, c.military_pct_gdp, "pct")}${pop ? cellOf(l, "military", `countries.${iso}.military`, c.military, "pp", { pop }) : "<td class=\"n\">–</td>"}${wordCell("military", `countries.${iso}.quality`, c.quality, c.quality, isEst(c.quality) ? R(l, "est") : "")}</tr>`;
  };
  const head = `<thead><tr><th>#</th><th>${esc(I.s(l, "country"))}</th><th class="n">${esc(R(l, "thMil"))}</th><th class="n">${esc(R(l, "thKiel"))}</th><th class="n">${esc(R(l, "thGdp"))}</th><th class="n">${esc(R(l, "thPp"))}</th><th>${esc(R(l, "thQuality"))}</th></tr></thead>`;
  // from Kiel's figure to the map's, for the large donors and all countries together
  const STEPS = ["kiel_allocated_less_era", "weapons_at_market_value", "not_yet_delivered", "loans_guarantees_at_gift_value", "undisclosed_estimate"];
  const big = rows.filter(i => (C[i].kiel_military || 0) >= (o.stepsMin ?? 1));
  const stepRow = (label, base, k0, x) => `<tr><td>${label}</td>${cellOf(l, "military", `${base}.kiel_military`, x.kiel_military, "eur")}${STEPS.map(k => cellOf(l, "military", `${base}.military_parts.${k}`, x.military_parts[k], "eur")).join("")}${cellOf(l, "military", `${base}.military`, x.military, "eur")}</tr>`;
  const steps = `<div class="tbl"><table class="mil"><thead><tr><th>${esc(I.s(l, "country"))}</th><th class="n">${esc(R(l, "thKiel"))}</th>${["thKielLessEra", "thMarket", "thUndelivered", "thGuar", "thUndisc"].map(k => `<th class="n">${esc(R(l, k))}</th>`).join("")}<th class="n">${esc(R(l, "thMil"))}</th></tr></thead><tbody>${big.map(i => stepRow(nm(i), `countries.${i}`, i, C[i])).join("")}${stepRow(`<b>${esc(R(l, "mAllRow"))}</b>`, "totals", "", M.totals)}</tbody></table></div>`;
  const none = isos.filter(i => milNoRecord(M, i)).sort((a, b) => o.nameOf(a).localeCompare(o.nameOf(b), l));
  const T = M.totals, tot = k => (k === "other" ? T.other : T[k]);
  const types = `<div class="tbl"><table class="mil"><tbody>${MIL_PARTS.map(k => `<tr><td>${esc(R(l, "ty_" + k))}</td>${cellOf(l, "military", `totals.${k}`, tot(k), "eur")}</tr>`).join("")}<tr><td><b>${esc(R(l, "ty_total"))}</b></td>${cellOf(l, "military", "totals.total_site", T.total_site, "eur")}</tr></tbody></table></div>`;
  const kielUrl = (M.sources || {}).kiel || "";
  const body = `<h2 id="by-country">${esc(R(l, "mTableH", { period: R(l, "fPeriod", { to: o.dataTo }) }))}</h2>
<p class="sub">${esc(R(l, "mTableNote"))}</p>
<div class="tbl"><table class="mil">${head}<tbody>${rows.map(tr).join("")}</tbody></table></div>
<h2 id="kiel">${esc(R(l, "mStepsH"))}</h2><p>${esc(R(l, "mStepsIntro", { dataTo: o.dataTo, min: I.E(l, o.stepsMin ?? 1) }))}</p>
${steps}
<p class="sub">${esc(R(l, "mStepsNote", { dataTo: o.dataTo }))}</p>
<h2 id="no-record">${esc(R(l, "mNoneH"))}</h2><p>${esc(R(l, "mNone"))} ${none.map(nm).join(", ")}</p>
<h2 id="by-type">${esc(R(l, "mTypesH"))}</h2><p>${esc(R(l, "mTypesIntro"))}</p>
${types}
<h2 id="sources">${esc(R(l, "sources"))}</h2><ul class="src">${kielUrl ? `<li><a href="${esc(kielUrl)}" rel="noopener">${esc(R(l, "mSrcKiel"))}</a></li>` : ""}<li><a href="/method/aid-refugees-military/">${esc(R(l, "mSrcMethod"))}</a></li><li><a href="/data.json">${esc(R(l, "mSrcData"))}</a></li></ul>`;
  // the questions: who gave the most (the map's figure, Kiel's, the share of GDP) and why the two differ
  const E = v => I.E(l, v), nmT = iso => o.nameIn(iso);
  const byK = isos.filter(i => C[i].kiel_military != null).sort((a, b) => C[b].kiel_military - C[a].kiel_military);
  const byG = isos.filter(i => (C[i].gdp_eur_bn || 0) >= (o.gdpMin ?? 5) && (C[i].military || 0) >= 0.0005).sort((a, b) => C[b].military_pct_gdp - C[a].military_pct_gdp);
  const P = T.military_parts, gbr = isos.filter(i => C[i].kiel_military != null && Math.abs(C[i].kiel_military - C[i].military_parts.kiel_allocated_less_era) >= 0.05);
  // round 63: a list after "with" in the language's form ("met de Verenigde Staten", seo_i18n.mjs inList)
  const nmL = iso => I.inList(l, nmT(iso));
  const v1 = { tops: I.list3(l, rows.slice(0, 3).map(nmL)), t1: nmT(rows[0]), t1v: E(C[rows[0]].military), k1: nmT(byK[0]), k1v: E(C[byK[0]].kiel_military),
    gTops: I.list3(l, byG.slice(0, 3).map(nmL)), g1: nmT(byG[0]), g1v: I.P(l, C[byG[0]].military_pct_gdp), gdpMin: I.E(l, o.gdpMin ?? 5), period: R(l, "fPeriod", { to: o.dataTo }), dataTo: o.dataTo };
  const v2 = { ...v1, kielAll: E(T.kiel_military), siteAll: E(T.military), undelivered: E(Math.abs(P.not_yet_delivered)), market: E(Math.abs(P.weapons_at_market_value)), undisc: E(P.undisclosed_estimate),
    eraName: gbr.length ? cap(nmT(gbr[0])) : "", era: gbr.length ? E(C[gbr[0]].kiel_military - C[gbr[0]].military_parts.kiel_allocated_less_era) : "", nUndisc: isos.filter(i => (C[i].military_parts.undisclosed_estimate || 0) > 0).length };
  const v3 = { ...v1, total: E(T.total_site), mil: E(T.military), fin: E(T.financial), hum: E(T.humanitarian), ref: E(T.refugees), eu: E(T.eu_share) };
  const faq = [{ q: R(l, "mQ1"), a: R(l, "mA1", v1) }, { q: R(l, "mQ2"), a: R(l, "mA2", v2, { era: gbr.length ? 1 : 0 }) }, { q: R(l, "mQ3"), a: R(l, "mA3", v3) }];
  return { title: R(l, "mTitle"), description: R(l, "mDesc"), h1: R(l, "mH1", { dataTo: o.dataTo }), intro: R(l, "mIntro", { dataTo: o.dataTo }), label: R(l, "mLabel"), body, faq, rows };
}
// the CSV (the downloads): every country's support by type, with Kiel's military figure, the range and the quality
// round 60: the country's English name as the site writes it (llms-full.txt and the pages: "Türkiye", not "Turkey")
export function milCsv(M, nameOf = iso => M.countries[iso].name) {
  const q = v => (v === null || v === undefined ? "" : String(v));
  // round 60: financial aid's share of IMF, World Bank and EBRD lending as its own column (of which)
  const out = ["iso3,country,military_eur_bn,military_low_eur_bn,military_high_eur_bn,military_record,kiel_military_eur_bn,military_pct_gdp,financial_eur_bn,financial_of_which_imf_world_bank_share_eur_bn,humanitarian_eur_bn,refugees_eur_bn,eu_share_eur_bn,other_eur_bn,flowback_eur_bn,support_total_eur_bn,basis,quality"];
  for (const iso of Object.keys(M.countries).sort()) {
    const c = M.countries[iso], nm = nameOf(iso), name = /[",]/.test(nm) ? `"${nm.replace(/"/g, '""')}"` : nm;
    out.push([iso, name, q(c.military), q((c.military_range || [])[0]), q((c.military_range || [])[1]), milNoRecord(M, iso) ? "no record found" : "recorded", q(c.kiel_military), q(c.military_pct_gdp),
      q(c.financial), q((c.financial_parts || {}).imf_world_bank_ebrd_share), q(c.humanitarian), q(c.refugees), q(c.eu_share), q(milVal(M, iso, "other").v), q(c.flowback), q(c.total_site), c.basis, c.quality].join(","));
  }
  return out.join("\n");
}

// ----- Russia's federal budget balance and the National Wealth Fund -----
// the 2026 law, the in-year plan and the latest estimate (each labelled by its kind), and the execution to date
export function deficitPlans(D, year) {
  const ps = ((D.plans || {})[year] || []).map(p => ({ ...p, path: `plans.${year}@${p.date}` }));
  return ps;
}
// a source's name: the file's own, or, where the file names an extract (interfax_2026-07-15_plan), its site and date
const srcName = (l, s) => {
  if (!/^[a-z0-9_.-]+$/.test(s.name || "")) return s.name;
  const host = (String(s.url).match(/^https?:\/\/(?:www\.)?([^/]+)/) || [])[1] || s.name, d = (s.name.match(/\d{4}-\d{2}(?:-\d{2})?/) || [""])[0];
  return d ? `${host}, ${I.dateL(d, l)}` : host;
};
// the section of /russia-oil-gas-revenue/: the balance by year (execution, with the year to date), the 2026 plans
// against execution, the last months and the fund's liquid assets. o: { months }
export function deficitBlock(l, D, o = {}) {
  const ym = D.meta.latest_budget_month, month = I.monthOnly(`${ym}-15`, l);
  const yl = y => (y.complete ? String(y.year) : R(l, "partYear", { y: y.year, month }));
  const c = (path, v, u, opt) => cellOf(l, "deficit", path, v, u, opt);
  const yRows = D.yearly.map(y => { const p = `yearly@${y.year}`; return `<tr${rv("deficit", `${p}.complete`, y.complete)}><td>${esc(yl(y))}</td>${c(`${p}.rev_rub`, y.rev_rub, "rub")}${c(`${p}.exp_rub`, y.exp_rub, "rub")}${c(`${p}.balance_rub`, y.balance_rub, "rub")}${c(`${p}.balance_eur`, y.balance_eur, "eur")}${c(`${p}.balance_pct_gdp`, y.balance_pct_gdp, "share", { sub: y.complete ? "" : R(l, "dYtdGdp") })}</tr>`; }).join("");
  const th = ks => ks.map(k => `<th class="n">${esc(R(l, k))}</th>`).join("");
  const part = D.yearly.filter(y => !y.complete).pop();
  const year = part ? String(part.year) : "";
  const pl = deficitPlans(D, year), ex = (D.plans || {})[`${year}_execution_to_date`];
  const pRows = pl.map(p => `<tr><td>${esc(R(l, "pk_" + p.kind))}</td><td>${esc(I.dateL(p.date, l))}</td>${c(`${p.path}.rev`, p.rev, "rub")}${c(`${p.path}.exp`, p.exp, "rub")}${c(`${p.path}.deficit`, p.deficit, "rub")}${p.deficit_pct_gdp_stated != null ? c(`${p.path}.deficit_pct_gdp_stated`, p.deficit_pct_gdp_stated, "share") : c(`${p.path}.deficit_pct_gdp`, p.deficit_pct_gdp ?? null, "share")}</tr>`).join("")
    + (ex && part ? `<tr><td>${esc(R(l, "pk_exec", { month }))}</td><td>${esc(I.dateL(ym, l))}</td>${c(`yearly@${part.year}.rev_rub`, part.rev_rub, "rub")}${c(`plans.${year}_execution_to_date.exp_rub`, ex.exp_rub, "rub")}${c(`plans.${year}_execution_to_date.balance_rub`, ex.balance_rub, "rub", { sg: -1 })}${c(`monthly@${ym}.ytd_balance_pct_gdp`, D.monthly[D.monthly.length - 1].ytd_balance_pct_gdp, "share", { sg: -1, sub: R(l, "dYtdGdp") })}</tr>` : "");
  const ms = D.monthly.slice(-(o.months || 24)).reverse();
  const mRows = ms.map(m => { const p = `monthly@${m.ym}`; return `<tr><td>${esc(I.monthLabel(m.ym, l))}</td>${c(`${p}.rev_rub`, m.rev_rub, "rub")}${c(`${p}.exp_rub`, m.exp_rub, "rub")}${c(`${p}.balance_rub`, m.balance_rub, "rub")}${c(`${p}.balance_eur`, m.balance_eur, "eur")}${c(`${p}.ytd_balance_rub`, m.ytd_balance_rub, "rub")}</tr>`; }).join("");
  // the fund: every 1 January, and the latest date
  const last = D.meta.latest_nwf_date, nwf = D.nwf.filter(n => /-01-01$/.test(n.as_of) || n.as_of === last);
  const wd = n => { const y = String(+n.as_of.slice(0, 4) - (/-01-01$/.test(n.as_of) ? 1 : 0)), w = (D.nwf_yearly || {})[y]; return w && w.withdrawals_rub_bn != null ? c(`nwf_yearly.${y}.withdrawals_rub_bn`, w.withdrawals_rub_bn, "rub", { sub: /-01-01$/.test(n.as_of) ? y : R(l, "partYear", { y, month: I.monthOnly(`${n.month_of_flows}-15`, l) }) }) : "<td class=\"n\">–</td>"; };
  const nRows = nwf.map(n => { const p = `nwf@${n.as_of}`; return `<tr><td>${esc(I.dateL(n.as_of, l))}</td>${c(`${p}.total_rub_bn`, n.total_rub_bn, "rub")}${c(`${p}.liquid_rub_bn`, n.liquid_rub_bn, "rub")}${c(`${p}.liquid_eur_bn`, n.liquid_eur_bn, "eur")}${c(`${p}.liquid_pct_gdp`, n.liquid_pct_gdp, "share")}${wd(n)}</tr>`; }).join("");
  const law = pl.find(p => p.kind === "law"), est = pl.filter(p => p.kind === "estimate").pop();
  const srcs = (D.sources || []).filter(s => /^https?:/.test(s.url || ""));
  return `<h2 id="deficit">${esc(R(l, "dH"))}</h2><p>${esc(R(l, "dIntro", { published: I.dateL(((((D.sources || [])[0] || {}).date || "").match(/\d{4}-\d{2}-\d{2}/) || [""])[0], l) }))}</p>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(R(l, "thYear"))}</th>${th(["thRev", "thExp", "thBal", "thBalEur", "thBalGdp"])}</tr></thead><tbody>${yRows}</tbody></table></div>
<p class="sub">${esc(R(l, "dYearNote", { month }))}</p>
<h3 id="deficit-plans">${esc(R(l, "dPlansH", { y: year }))}</h3><p>${esc(R(l, "dPlansIntro", { y: year }, { est: est ? 1 : 0, law: law ? 1 : 0 }))}</p>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(R(l, "thVersion"))}</th><th>${esc(R(l, "thDate"))}</th>${th(["thRev", "thExp", "thDeficit", "thDefGdp"])}</tr></thead><tbody>${pRows}</tbody></table></div>
<p class="sub">${esc(R(l, "dPlansNote"))}</p>
<h3 id="deficit-months">${esc(R(l, "dMonthH", { latestMonth: I.dateL(ym, l, true) }))}</h3>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(R(l, "thMonth"))}</th>${th(["thRev", "thExp", "thBal", "thBalEur", "thYtd"])}</tr></thead><tbody>${mRows}</tbody></table></div>
<h3 id="nwf">${esc(R(l, "dNwfH"))}</h3><p>${esc(R(l, "dNwfIntro"))}</p>
<div class="tbl"><table class="rev"><thead><tr><th>${esc(R(l, "thAsOf"))}</th>${th(["thNwfTotal", "thLiquid", "thLiquidEur", "thLiquidGdp", "thWithdrawn"])}</tr></thead><tbody>${nRows}</tbody></table></div>
<p class="sub">${esc(R(l, "dNwfNote"))}</p>
<p class="sub">${esc(R(l, "dSrcNote"))}</p><ul class="src">${srcs.map(s => `<li><a href="${esc(s.url)}"${ext(s.url)}>${esc(srcName(l, s))}</a>${/news/i.test(s.type || "") ? ` <span class="sub">(${esc(R(l, "srcNews"))})</span>` : ""}</li>`).join("")}</ul>`;
}

// llms-full.txt (English): the first buyers of each fuel by customs, and each military donor's figure beside Kiel's
export function fuelLlms(F, nameOf, n = 5) {
  const p = fuelPeriod("en", F);
  return FUELS.map(f => `- ${R("en", "fu_" + f)}, ${p}: ` + fuelRows(F, f, 15).slice(0, n).map(i => { const c = fuelSum(F, i, "customs", f), s = fuelSum(F, i, "site", f), t = fuelSum(F, i, "tracker", f);
    return `${nameOf(i)} ${I.E("en", c.v)} customs (CIF), ${I.E("en", s.v)} map basis (FOB)${t.v ? `, ${I.E("en", t.v)} CREA tracker` : ""}`; }).join("; "));
}
export function milLlms(M, nameOf) {
  const C = M.countries;
  return Object.keys(C).filter(i => Math.abs(C[i].military || 0) >= 0.0005).sort((a, b) => C[b].military - C[a].military)
    .map(i => `- ${nameOf(i)}: military aid ${I.E("en", C[i].military)} (delivered, market value; ${I.P("en", C[i].military_pct_gdp)} of GDP), Kiel ${C[i].kiel_military == null ? "no record" : I.E("en", C[i].kiel_military)}, quality ${C[i].quality}`);
}
