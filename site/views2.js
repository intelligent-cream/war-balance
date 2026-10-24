// ===== Data downloads, shown in the Sources view =====
// Round 20 (owner): Table & data is no longer a view (its old links open Sources). Its downloads stay, in Sources: every
// country, every number (CSV), every part (CSV) and the whole data file (JSON), plus the data gaps by country. They
// follow the Filters drawer's period, what's counted and money flowing back; every country is in them.
/* global leaning, chance, partGrade, evidence, state, DATA, calc, scaled, t, viewState, uncertain, grades, custom, COUNTED, isOn, esc, tData, FRAC, yi, remitSum, select */

// the four numbers, each a group of three columns: the value, its likely range and its certainty letter
const TGROUPS = [
  { id: "net", label: "Net", v: k => [k.shift, k.shiftLo, k.shiftHi], en: "net" },
  { id: "ua", label: "Support for Ukraine", v: k => [k.uaBal, k.uaLo, k.uaHi], en: "support_for_ukraine" },
  { id: "rus", label: "Russia's earnings from trade", v: k => [k.rusBal, k.rusLo, k.rusHi], en: "trade_with_russia_toward_ukraine" },
  { id: "frozen", label: "Russian money frozen", v: k => [k.frozen, k.frozenLo, k.frozenHi], en: "russian_money_frozen" },
];

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
    return row;
  });
}
// the Download the data section at the end of Sources
function dataHtml() {
  const rows = tableRows(Object.values(DATA).filter(c => c.gdp)).sort((a, b) => (b.gdp || 0) - (a.gdp || 0));
  return `<h2 style="font-size:20px" id="data">${t("Download the data")}</h2>
    <p class="sub">${t("Every country, every number, for the period and parts chosen in Filters.")}</p>
    <div class="dl" role="group" aria-label="${t("Downloads")}">
      <button id="dl-full">${t("Full data (CSV)")}</button>
      <button id="dl-parts">${t("CSV with every part")}</button>
      <a href="data.json" download="war-balance.json">${t("Full data (JSON)")}</a>
    </div>
    ${coverageHtml(rows)}
    <p class="note-small">${t("Data and text: CC BY 4.0, credit \"War Balance\". Every figure has its sources in the country breakdown and in the research files on GitHub. Figures to {date}.", { date: document.body.dataset.dataTo || t("the end of August 2026") })}</p>`;
}
function wireData(root) {
  const all = () => tableRows(Object.values(DATA)).sort((a, b) => a.iso3.localeCompare(b.iso3));
  const tag = `${state.year === 2021 ? "2021" : "2022-" + state.year}${custom() ? "_custom-mix" : ""}`;
  const f = root.querySelector("#dl-full"), p = root.querySelector("#dl-parts");
  if (f) f.onclick = () => download(csvFull(all()), `war-balance_full_${tag}.csv`);
  if (p) p.onclick = () => download(csvParts(all()), `war-balance_parts_${tag}.csv`);
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
// every country, every number in € bn and % of GDP. Round 19: the cost to the country is no longer shown on the site; it
// stays here, labelled
function csvFull(rows) {
  const head = ["iso3", "country", "period", "net_of_flowback",
    "support_ukraine_eur_bn", "support_ukraine_low_eur_bn", "support_ukraine_high_eur_bn", "support_ukraine_pct_gdp", "support_ukraine_certainty", "support_ukraine_direction_uncertain",
    "trade_with_russia_toward_ukraine_eur_bn", "trade_with_russia_toward_ukraine_low_eur_bn", "trade_with_russia_toward_ukraine_high_eur_bn", "trade_with_russia_toward_ukraine_pct_gdp", "trade_with_russia_toward_ukraine_certainty", "trade_with_russia_toward_ukraine_direction_uncertain", "of_which_gas_cut_by_russia_eur_bn",
    "of_which_russia_kept_less_eur_bn", "of_which_russia_kept_less_low_eur_bn", "of_which_russia_kept_less_high_eur_bn", "of_which_country_kept_less_from_selling_to_russia_eur_bn", "of_which_country_kept_less_from_selling_to_russia_low_eur_bn", "of_which_country_kept_less_from_selling_to_russia_high_eur_bn",
    "russian_money_frozen_eur_bn_net_only", "russian_money_frozen_low_eur_bn_net_only", "russian_money_frozen_high_eur_bn_net_only", "russian_money_frozen_pct_gdp_net_only",
    "net_shift_eur_bn", "net_shift_low_eur_bn", "net_shift_high_eur_bn", "net_shift_pct_gdp", "net_shift_eur_per_person", "net_shift_certainty", "net_shift_direction_uncertain", "net_shift_leaning", "net_shift_chance_toward_ukraine",
    "military_aid_allocated_not_yet_delivered_eur_bn",
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
      k.rusPaid, k.rusPaidLo, k.rusPaidHi, k.rusEarned, k.rusEarnedLo, k.rusEarnedHi,
      k.frozen, k.frozenLo, k.frozenHi, G(k.frozen),
      k.shift, k.shiftLo, k.shiftHi, G(k.shift), pp && k.shift * pp, cert("net"), unc("net"), y > 2021 && unc("net") ? leaning(c, y, "net") || "" : "", y > 2021 && c.gdp ? +chance(c, y, "net").pUa.toFixed(3) : "", k.undelivered, refX,
      rm[0], rm[1], rm[2], G(rm[0]),
      k.taken, k.takenLo, k.takenHi, G(k.taken),
      k.cost, G(k.cost), k.aid, k.refugees, k.paidRussia, c.gdp, c.pop, figuresEn()].map(q).join(",");
  });
  return [head.join(","), ...lines].join("\n");
}
// round 17: "official", or which parts of a custom mix were switched off (in English, like the other columns)
function figuresEn() { return custom() ? "custom mix, not the official figures: " + COUNTED.filter(gp => !isOn(gp)).map(gp => gp.label).join("; ") + " switched off" : "official"; }
function csvParts(rows) {
  const head = ["iso3", "country", "period", "net_of_flowback", "part", "label", "eur_bn", "low_eur_bn", "high_eur_bn", "certainty", "evidence", "sources", "figures"];
  // round 14b: what Russia took from companies comes last, marked: it is not in the net
  const all = r => r.k.shiftParts.concat(state.netBack ? r.k.backShift.map(p => ({ ...p, k: "back_" + p.k })) : [])
    .concat((r.k.takenParts || []).map(p => ({ ...p, k: "taken_" + p.k, en: p.en + " (not in totals)" })));
  const lines = rows.flatMap(r => all(r).map(p => [r.iso3, r.c.name_en, periodTextEn(), state.netBack, p.k, p.en, p.v, p.lo, p.hi, partGrade(p), evidence(p).kind, (p.src || []).join(" "), figuresEn()].map(q).join(",")));
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

window.dataHtml = dataHtml;
window.wireData = wireData;
