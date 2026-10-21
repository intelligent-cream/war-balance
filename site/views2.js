// ===== Table & data (round 19, rebuilt; the owner: the table "needs a lot of work") =====
// One row per country in the Filters drawer's filter (no filters of its own), every number in the drawer's measure: the
// net, support for Ukraine, kept from Russia and Russian money frozen, each with its likely range and its certainty
// letter, then GDP, population and the main parts. Columns are grouped and sort on a click; the header row and the
// country column stay in view while the table scrolls inside its own box. "Download CSV" and "Download JSON" give exactly
// the rows and columns shown; the full data (every country, every number in € and % of GDP, every part) is below them.
// How it works was a view here until round 19: the owner removed it; its content is in the docs, and each part's method
// is one tap away in the country panel and in Sources.
/* global state, DATA, calc, scaled, fmtMeasure, eur, select, MIN_GDP_RANK, FRAC, t, LANG, viewState, eligible, periodText,
   measureText, num, yi, remitSum, uncertain, grades, chip, filterSummary, plainName, custom, COUNTED, isOn, esc, tData,
   LETTERS_KEY, renderView */

// the four numbers, each a group of three columns: the value, its likely range and its certainty letter
const TGROUPS = [
  { id: "net", label: "Net (the sum)", v: k => [k.shift, k.shiftLo, k.shiftHi], en: "net" },
  { id: "ua", label: "Support for Ukraine", v: k => [k.uaBal, k.uaLo, k.uaHi], en: "support_for_ukraine" },
  { id: "rus", label: "Kept from Russia", v: k => [k.rusBal, k.rusLo, k.rusHi], en: "kept_from_russia" },
  { id: "frozen", label: "Russian money frozen", v: k => [k.frozen, k.frozenLo, k.frozenHi], en: "russian_money_frozen" },
];
const MEASURE_EN = { gdp: "pct_gdp", pp: "eur_per_person", total: "eur_bn" };
const MAIN_PARTS = 3;

function tableRows(pool) {
  const y = state.year;
  return pool.map(c => {
    const k = calc(c, y), gr = y > 2021 ? grades(c, y) : { ua: "D", rus: "D", net: "D" };
    const fz = k.frozenParts && k.frozenParts[0];
    const row = { c, k, iso3: c.iso3, name: c.name, gdp: c.gdp, pop: c.pop };
    for (const gp of TGROUPS) {
      const [v, lo, hi] = gp.v(k);
      const has = gp.id !== "frozen" || Math.abs(v) >= 0.0005;
      row[gp.id] = has ? { v, lo, hi, s: scaled(c, v), slo: scaled(c, lo), shi: scaled(c, hi),
        cert: gp.id === "frozen" ? (fz ? fz.cert : null) : y > 2021 ? gr[gp.id] : null,
        unc: gp.id !== "frozen" && y > 2021 && uncertain(c, y, gp.id) } : null;
    }
    // the largest parts, either way, with plain names
    row.main = k.shiftParts.concat(k.backShift).filter(p => Math.abs(p.v) > 1e-6).sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, MAIN_PARTS);
    return row;
  });
}
// the value a column sorts by: numbers in the measure shown, letters in order (A first), the name alphabetically
function sortVal(r, key) {
  if (key === "name") return r.name;
  if (key === "gdp" || key === "pop") return r[key] ?? -Infinity;
  const [id, part] = key.split(".");
  const x = r[id];
  if (!x) return part === "cert" ? "Z" : -Infinity;
  return part === "cert" ? x.cert || "Z" : x.s ?? -Infinity;
}
const signCls = (gp, v) => (v == null || Math.abs(v) < 1e-9 ? "" : v > 0 ? "pos" : gp === "ua" ? "" : "neg");
const fmtV = (c, v) => fmtMeasure(c, v, state.measure, true, false);
const partsTxt = r => r.main.map(p => `${plainName(p)} ${fmtV(r.c, p.v)}`).join("; ");

function renderTable(root) {
  const rows = tableRows(Object.values(DATA).filter(eligible));
  const key = viewState.sortKey, dir = viewState.sortDir;
  rows.sort((a, b) => {
    const x = sortVal(a, key), z = sortVal(b, key);
    return ((typeof x === "string" ? x.localeCompare(z, LANG) * (key === "name" ? 1 : -1) : x - z) || 0) * dir;
  });
  const unit = t({ gdp: "% of GDP", pp: "Per person", total: "Total €" }[state.measure]);
  const th = (k, label, cls = "") => `<th scope="col" class="${cls}" aria-sort="${key === k ? (dir < 0 ? "descending" : "ascending") : "none"}"><button data-k="${k}">${label}</button></th>`;
  const cell = (r, gp) => {
    const x = r[gp.id];
    if (!x) return `<td class="gs">–</td><td class="rg">–</td><td class="gr">–</td>`;
    const q = x.unc ? `<span class="unc" title="${t("direction uncertain")}">?</span>` : "";
    return `<td class="gs ${signCls(gp.id, x.v)}">${fmtV(r.c, x.v)}${q}</td><td class="rg">${t("{lo} to {hi}", { lo: fmtV(r.c, x.lo), hi: fmtV(r.c, x.hi) })}</td><td class="gr">${x.cert ? chip(x.cert) : "–"}</td>`;
  };
  root.innerHTML = `<div class="view-inner table-view">
    <h2>${t("All countries, all numbers")}</h2>
    ${filterSummary({ lens: false })}
    <p class="sub">${measureText()}, ${periodText()}${state.netBack ? t(", after money flowing back") : ""}. ${t("Click a column to sort, a row for the breakdown.")} ${t("{n} countries", { n: rows.length })}.</p>
    <div class="dl" role="group" aria-label="${t("Downloads")}">
      <span class="dl-h">${t("This table:")}</span>
      <button id="dl-csv">${t("Download CSV")}</button>
      <button id="dl-json">${t("Download JSON")}</button>
      <span class="dl-h">${t("Every country, every number:")}</span>
      <button id="dl-full">${t("Full data (CSV)")}</button>
      <button id="dl-parts">${t("CSV with every part")}</button>
      <a href="data.json" download="follow-the-money-ukrainian-aid.json">${t("Full data (JSON)")}</a>
    </div>
    <div class="tablewrap" tabindex="0" role="region" aria-label="${t("All countries, all numbers")}"><table class="dtable">
      <thead>
        <tr class="g"><th scope="col" rowspan="2" class="cname" aria-sort="${key === "name" ? (dir < 0 ? "descending" : "ascending") : "none"}"><button data-k="name">${t("Country")}</button></th>
          ${TGROUPS.map(gp => `<th scope="colgroup" colspan="3" class="grp grp-${gp.id}">${t(gp.label)}</th>`).join("")}
          <th scope="colgroup" colspan="2" class="grp">${t("Economy")}</th><th scope="col" rowspan="2" class="mp">${t("Main parts")}</th></tr>
        <tr class="c">${TGROUPS.map(gp => th(gp.id + ".v", unit, "gs") + `<th scope="col" class="rg">${t("Likely range")}</th>` + th(gp.id + ".cert", t("Certainty"), "gr")).join("")}
          ${th("gdp", t("GDP, € bn"), "gs")}${th("pop", t("People, m"))}</tr>
      </thead>
      <tbody>${rows.map(r => `<tr data-n="${r.c.n}"><th scope="row" class="cname"><button>${esc(r.name)}</button></th>${TGROUPS.map(gp => cell(r, gp)).join("")}
        <td class="gs">${r.gdp ? num(r.gdp, r.gdp >= 100 ? 0 : 1) : "–"}</td><td>${r.pop ? num(r.pop, r.pop >= 10 ? 0 : 1) : "–"}</td><td class="mp">${esc(partsTxt(r))}</td></tr>`).join("")}</tbody>
    </table></div>
    <p class="note-small">${t("? direction uncertain: the likely range or a method-band alternative crosses zero (not ranked).")} ${LETTERS_KEY()} ${t("GDP is the 2022–2024 average.")}</p>
    ${coverageHtml(rows)}
    <p class="note-small">${t("Data and text: CC BY 4.0, credit \"Follow the Money: Ukrainian Aid\". Every figure has its sources in the country breakdown and in the research files on GitHub. Figures to {date}.", { date: document.body.dataset.dataTo || t("the end of August 2026") })}</p>
  </div>`;
  // sorting buttons in the header rows; the re-render replaces them, so focus goes to the same column's new button
  root.querySelectorAll("thead button[data-k]").forEach(b => (b.onclick = () => {
    const k = b.dataset.k;
    viewState.sortDir = viewState.sortKey === k ? -viewState.sortDir : k === "name" ? 1 : -1;
    viewState.sortKey = k; renderView();
    const again = root.querySelector(`thead button[data-k="${k}"]`); if (again) again.focus();
  }));
  // a click anywhere on a row opens the country; the button in the country cell (Enter, Space) gets there by keyboard
  root.querySelectorAll("tbody tr[data-n]").forEach(tr => (tr.onclick = () => select(tr.dataset.n, false)));
  // file names say which period, measure and filter they hold
  const tag = `${state.year === 2021 ? "2021" : "2022-" + state.year}_${viewState.group}${state.region !== "all" ? "-" + state.region : ""}${state.size === 0 ? "-with-small" : state.size > MIN_GDP_RANK ? "-over-" + state.size + "bn" : ""}${custom() ? "_custom-mix" : ""}`;
  const all = () => tableRows(Object.values(DATA)).sort((a, b) => a.iso3.localeCompare(b.iso3));
  root.querySelector("#dl-csv").onclick = () => download(csvShown(rows), `follow-the-money-ukrainian-aid_table_${MEASURE_EN[state.measure]}_${tag}.csv`);
  root.querySelector("#dl-json").onclick = () => download(jsonShown(rows), `follow-the-money-ukrainian-aid_table_${MEASURE_EN[state.measure]}_${tag}.json`, "application/json");
  root.querySelector("#dl-full").onclick = () => download(csvFull(all()), `follow-the-money-ukrainian-aid_full_${state.year === 2021 ? "2021" : "2022-" + state.year}${custom() ? "_custom-mix" : ""}.csv`);
  root.querySelector("#dl-parts").onclick = () => download(csvParts(all()), `follow-the-money-ukrainian-aid_parts_${state.year === 2021 ? "2021" : "2022-" + state.year}${custom() ? "_custom-mix" : ""}.csv`);
}
// which parts of each country rest on reported, estimated or missing data (moved here from the old Top lists panel)
function coverageHtml(rows) {
  const list = rows.filter(r => r.c.coverage).sort((a, b) => (b.c.gdp || 0) - (a.c.gdp || 0));
  const heads = (list[0] && list[0].c.coverage) || [];
  if (!heads.length) return "";
  return `<details class="more cov-fold"><summary>${t("Data gaps by country")}</summary>
    <p class="key">${t("● reported · ○ estimated with a range · ✕ missing. Hover a mark for details. Scroll the table sideways for all parts.")}</p>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th scope="col">${t("Country")}</th>${heads.map(p => `<th scope="col" style="cursor:default">${t(p.part.replace("Company taxes in Russia", "Company taxes").replace("Energy switching cost", "Energy cost").replace("Money flowing back", "Flowback"))}</th>`).join("")}</tr></thead>
    <tbody>${list.map(r => `<tr><td><a href="#${r.c.iso3}" data-goto="${r.c.n}">${esc(r.name)}</a></td>${heads.map(h => { const p = (r.c.coverage || []).find(x => x.part === h.part); return p ? `<td class="cov-${p.status}" lang="en" title="${tData(p.note).s.replace(/"/g, "&quot;")}">${{ ok: "●", est: "○", missing: "✕" }[p.status]}</td>` : "<td>–</td>"; }).join("")}</tr>`).join("")}</tbody></table></div>
  </details>`;
}
document.addEventListener("click", e => {
  const a = e.target.closest && e.target.closest(".cov-fold [data-goto]");
  if (a && !e.ctrlKey && !e.metaKey) { e.preventDefault(); select(a.dataset.goto, true); }
});

// ----- downloads -----
const q = v => (v == null || Number.isNaN(v) ? "" : typeof v === "number" ? +v.toFixed(4) : typeof v === "boolean" ? String(v) : /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);
const r4 = v => (v == null || Number.isNaN(v) ? null : +v.toFixed(4));
const partsEn = r => r.main.map(p => `${p.en}: ${r4(scaled(r.c, p.v))}`).join("; ");
// exactly the table shown: its rows in its order, its columns, in its measure
function csvShown(rows) {
  const u = MEASURE_EN[state.measure];
  const head = ["iso3", "country", "period", "measure", "figures",
    ...TGROUPS.flatMap(gp => [`${gp.en}_${u}`, `${gp.en}_low_${u}`, `${gp.en}_high_${u}`, `${gp.en}_certainty`, ...(gp.id === "frozen" ? [] : [`${gp.en}_direction_uncertain`])]),
    "gdp_eur_bn_avg_2022_2024", "population_m", `main_parts_${u}`];
  const lines = rows.map(r => [r.iso3, r.c.name_en, periodTextEn(), measureEn(), figuresEn(),
    ...TGROUPS.flatMap(gp => { const x = r[gp.id]; return [x && x.s, x && x.slo, x && x.shi, x && x.cert, ...(gp.id === "frozen" ? [] : [x ? x.unc : ""])]; }),
    r.gdp, r.pop, partsEn(r)].map(q).join(","));
  return [head.join(","), ...lines].join("\n");
}
function jsonShown(rows) {
  return JSON.stringify({ period: periodTextEn(), measure: measureEn(), figures: figuresEn(), net_of_flowback: state.netBack, filter: filterEn(),
    note: "the net = support for Ukraine + kept from Russia + Russian money frozen; kept from Russia is positive when the country paid Russia less than without the war, negative when it paid more; direction_uncertain: the likely range or a method-band alternative crosses zero (not ranked)",
    countries: rows.map(r => ({ iso3: r.iso3, country: r.c.name_en,
      ...Object.fromEntries(TGROUPS.map(gp => { const x = r[gp.id]; return [gp.en, x ? { value: r4(x.s), low: r4(x.slo), high: r4(x.shi), certainty: x.cert, ...(gp.id === "frozen" ? {} : { direction_uncertain: x.unc }) } : null]; })),
      gdp_eur_bn_avg_2022_2024: r.gdp, population_m: r.pop,
      main_parts: r.main.map(p => ({ part: p.k, label: p.en, value: r4(scaled(r.c, p.v)) })) })) }, null, 1);
}
const measureEn = () => ({ gdp: "% of one year's GDP (average 2022-2024), total for the period", pp: "EUR per person, total for the period", total: "EUR billion, total for the period" }[state.measure]);
const filterEn = () => ({ region: state.region, group: viewState.group, min_gdp_eur_bn: state.size });
// every country, every number in € bn and % of GDP. Round 19: the cost to the country is no longer shown on the site; it
// stays here, labelled
function csvFull(rows) {
  const head = ["iso3", "country", "period", "net_of_flowback",
    "support_ukraine_eur_bn", "support_ukraine_low_eur_bn", "support_ukraine_high_eur_bn", "support_ukraine_pct_gdp", "support_ukraine_certainty", "support_ukraine_direction_uncertain",
    "kept_from_russia_eur_bn", "kept_from_russia_low_eur_bn", "kept_from_russia_high_eur_bn", "kept_from_russia_pct_gdp", "kept_from_russia_certainty", "kept_from_russia_direction_uncertain", "of_which_gas_cut_by_russia_eur_bn",
    "russian_money_frozen_eur_bn_net_only", "russian_money_frozen_low_eur_bn_net_only", "russian_money_frozen_high_eur_bn_net_only", "russian_money_frozen_pct_gdp_net_only",
    "net_shift_eur_bn", "net_shift_low_eur_bn", "net_shift_high_eur_bn", "net_shift_pct_gdp", "net_shift_eur_per_person", "net_shift_certainty", "net_shift_direction_uncertain",
    "refugees_hosted_not_counted_co_belligerent_eur_bn",
    "remittances_from_russia_change_eur_bn_not_in_totals", "remittances_from_russia_change_low_eur_bn_not_in_totals", "remittances_from_russia_change_high_eur_bn_not_in_totals", "remittances_from_russia_change_pct_gdp_not_in_totals",
    "taken_by_russia_from_companies_eur_bn_not_in_totals", "taken_by_russia_from_companies_low_eur_bn_not_in_totals", "taken_by_russia_from_companies_high_eur_bn_not_in_totals", "taken_by_russia_from_companies_pct_gdp_not_in_totals",
    "cost_to_the_country_eur_bn_not_shown_on_the_site", "cost_to_the_country_pct_gdp_not_shown_on_the_site", "aid_eur_bn", "refugees_eur_bn", "paid_to_russia_eur_bn", "gdp_eur_bn_avg_2022_2024", "population_m", "figures"];
  const y = state.year, N = yi(y);
  const lines = rows.map(r => {
    const c = r.c, k = r.k, g = c.gdp ? 100 / c.gdp : null, pp = c.pop ? 1e9 / (c.pop * 1e6) : null, G = v => (g == null || v == null ? null : v * g);
    const rm = c.remit && N > 0 ? [remitSum(c, N), remitSum(c, N, "years_lo"), remitSum(c, N, "years_hi")] : [null, null, null];
    const refX = c.ref_excluded ? c.ref_excluded.years.slice(1, N + 1).reduce((a, b) => a + b, 0) : null;
    const cert = id => (r[id] ? r[id].cert : null), unc = id => (r[id] ? r[id].unc : false);
    return [r.iso3, c.name_en, periodTextEn(), state.netBack,
      k.uaBal, k.uaLo, k.uaHi, G(k.uaBal), cert("ua"), unc("ua"), k.rusBal, k.rusLo, k.rusHi, G(k.rusBal), cert("rus"), unc("rus"), k.rusCut,
      k.frozen, k.frozenLo, k.frozenHi, G(k.frozen),
      k.shift, k.shiftLo, k.shiftHi, G(k.shift), pp && k.shift * pp, cert("net"), unc("net"), refX,
      rm[0], rm[1], rm[2], G(rm[0]),
      k.taken, k.takenLo, k.takenHi, G(k.taken),
      k.cost, G(k.cost), k.aid, k.refugees, k.paidRussia, c.gdp, c.pop, figuresEn()].map(q).join(",");
  });
  return [head.join(","), ...lines].join("\n");
}
// round 17: "official", or which parts of a custom mix were switched off (in English, like the other columns)
function figuresEn() { return custom() ? "custom mix, not the official figures: " + COUNTED.filter(gp => !isOn(gp)).map(gp => gp.label).join("; ") + " switched off" : "official"; }
function csvParts(rows) {
  const head = ["iso3", "country", "period", "net_of_flowback", "part", "label", "eur_bn", "low_eur_bn", "high_eur_bn", "certainty", "sources", "figures"];
  // round 14b: what Russia took from companies comes last, marked: it is not in the net
  const all = r => r.k.shiftParts.concat(state.netBack ? r.k.backShift.map(p => ({ ...p, k: "back_" + p.k })) : [])
    .concat((r.k.takenParts || []).map(p => ({ ...p, k: "taken_" + p.k, en: p.en + " (not in totals)" })));
  const lines = rows.flatMap(r => all(r).map(p => [r.iso3, r.c.name_en, periodTextEn(), state.netBack, p.k, p.en, p.v, p.lo, p.hi, p.cert, (p.src || []).join(" "), figuresEn()].map(q).join(",")));
  return [head.join(","), ...lines].join("\n");
}
function periodTextEn() {
  if (state.year === 2021) return "2021 (before the war)";
  const y = state.year;
  // a plain hyphen: spreadsheets and scripts handle it everywhere
  return `2022-${y}${y === 2026 && FRAC[5] < 1 ? " (2026 year to date, Jan–Aug)" : ""}`;
}
function download(text, name, type = "text/csv") {
  const a = document.createElement("a");
  // the byte order mark makes Excel read the file as UTF-8 (country names, €); JSON goes without it
  a.href = URL.createObjectURL(new Blob([type === "text/csv" ? "﻿" + text : text], { type: type + ";charset=utf-8" }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

window.EXTRA_VIEWS = { ...(window.EXTRA_VIEWS || {}), table: renderTable };
