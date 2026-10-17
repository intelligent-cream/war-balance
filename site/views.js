// ===== Views: ranking, Ukraine vs Russia bubbles, table and data download =====
// Same numbers as the map: the current view (change, cost, to Ukraine, to Russia), measure and year.
/* global state, DATA, calc, lensValue, scaled, fmtMeasure, eur, rangeTxt, showTip, tip, select, setPressed, MIN_GDP_RANK, YEARS, FRAC, closeMenu */

const GROUPS = {
  all: { label: "All countries", list: null },
  eu: { label: "EU", list: "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE" },
  g7: { label: "G7", list: "USA JPN DEU GBR FRA ITA CAN" },
  nato: { label: "NATO", list: "ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA" },
  brics: { label: "BRICS", list: "BRA IND CHN ZAF EGY ETH IRN ARE IDN" },
  ussr: { label: "Former Soviet Union", list: "ARM AZE BLR EST GEO KAZ KGZ LVA LTU MDA TJK TKM UZB" },
};
const viewState = { group: "all", small: false, sortKey: "metric", sortDir: -1 };

function inGroup(c) {
  const g = GROUPS[viewState.group];
  return !g.list || g.list.split(" ").includes(c.iso3);
}
function eligible(c) {
  return inGroup(c) && (viewState.small || (c.gdp || 0) >= MIN_GDP_RANK);
}

// the headline number of the current view, with its likely range, in the current measure
function metricOf(c) {
  const k = calc(c, Math.max(2022, state.year));
  const pick = { change: [k.shift, k.shiftLo, k.shiftHi], cost: [k.cost, k.costLo, k.costHi] }[state.lens];
  const [v, lo, hi] = pick || [lensValue(c), null, null];
  const s = x => (x == null ? null : scaled(c, x));
  return { c, k, bn: v, loBn: lo, hiBn: hi, v: s(v), lo: s(lo), hi: s(hi) };
}
const LENS_TITLE = {
  change: "Shift toward Ukraine or Russia since before the war",
  cost: "What supporting Ukraine cost",
  ukr: "Money sent to Ukraine (aid and purchases)",
  rus: "Money and support reaching Russia",
};
function measureText() {
  return { gdp: "total as % of one year's GDP", pp: "€ per person", total: "€ billion" }[state.measure];
}
function periodText() {
  const y = Math.max(2022, state.year);
  return `2022–${y}${y === 2026 && FRAC[5] < 1 ? " (2026 to August)" : ""}`;
}
function tick(v) {
  if (state.measure === "gdp") return d3.format("~")(+v.toFixed(2)) + "%";
  if (state.measure === "pp") return "€" + d3.format("~s")(v);
  return "€" + d3.format("~")(v) + "bn";
}
function filtersHtml() {
  return `<div class="filters" role="group" aria-label="Filter countries">
    ${Object.entries(GROUPS).map(([k, g]) => `<button class="chipbtn" data-group="${k}" aria-pressed="${viewState.group === k}">${g.label}</button>`).join("")}
    <span class="sep"></span>
    <button class="chipbtn" data-small="1" aria-pressed="${viewState.small}" title="Economies under €${MIN_GDP_RANK}bn GDP swing a lot in % of GDP">Small economies</button>
  </div>`;
}
function wireFilters(root) {
  root.querySelectorAll("[data-group]").forEach(b => (b.onclick = () => { viewState.group = b.dataset.group; renderView(); }));
  root.querySelectorAll("[data-small]").forEach(b => (b.onclick = () => { viewState.small = !viewState.small; renderView(); }));
}
function tipFor(m) {
  const range = m.loBn != null ? `<br>Likely range ${fmtMeasure(m.c, m.loBn, state.measure, true)} to ${fmtMeasure(m.c, m.hiBn, state.measure, true)}` : "";
  return `<b>${m.c.name}</b>${fmtMeasure(m.c, m.bn, state.measure, true)}${state.measure !== "total" ? ` · ${eur(m.bn, true)}` : ""}${range}<br><span style="opacity:.75">Click for the full breakdown</span>`;
}

// ----- Ranking: every country as a dot with its likely range, sorted -----
function renderRanking(root) {
  const rows = Object.values(DATA).filter(eligible).map(metricOf).filter(m => m.v != null).sort((a, b) => b.v - a.v);
  const diverging = state.lens === "change" || state.lens === "cost";
  const narrowScreen = root.clientWidth < 600;
  const W = Math.min(1040, root.clientWidth - 32), rowH = 22, labelW = narrowScreen ? 104 : 150, valW = narrowScreen ? 58 : 76;
  const top = 30, H = top + rows.length * rowH + 10;
  const vals = rows.flatMap(m => [m.v, m.lo ?? m.v, m.hi ?? m.v]);
  // a square-root scale keeps small countries readable next to large totals; the range is clamped to the 2nd-98th percentile
  const sorted = vals.slice().sort((a, b) => a - b);
  const q = p => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))] ?? 0;
  const lo = Math.min(0, q(0.01)), hi = Math.max(0, q(0.99));
  const x = d3.scaleSymlog().constant(state.measure === "gdp" ? 0.5 : state.measure === "pp" ? 50 : 1).domain([lo, hi]).range([labelW, W - valW]).clamp(true).nice();
  // round values on both sides of zero, kept only where they don't crowd each other
  const base = state.measure === "gdp" ? [1, 2, 5, 10, 20, 50, 100, 200] : state.measure === "pp" ? [100, 500, 1000, 5000, 10000, 50000] : [1, 10, 50, 100, 500, 1000];
  const cand = [0, ...base.flatMap(b => [b, -b])].filter(t => t >= x.domain()[0] && t <= x.domain()[1]).sort((a, b) => Math.abs(a) - Math.abs(b));
  const ticks = [];
  for (const t of cand) if (ticks.every(u => Math.abs(x(u) - x(t)) >= (narrowScreen ? 38 : 46))) ticks.push(t);
  const col = v => (v >= 0 ? (state.lens === "rus" ? "var(--rus)" : "var(--ukr)") : "var(--rus)");
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${LENS_TITLE[state.lens]}, ${rows.length} countries, ranked">
    <g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${H - 6}"/><text x="${x(t)}" y="${top - 12}" text-anchor="middle">${tick(t)}</text>`).join("")}</g>
    ${diverging ? `<line class="zero" x1="${x(0)}" x2="${x(0)}" y1="${top - 6}" y2="${H - 6}"/>` : ""}
    ${rows.map((m, i) => {
      const y = top + i * rowH + rowH / 2;
      const w = m.lo != null ? `<line class="whisk" x1="${x(m.lo)}" x2="${x(m.hi)}" y1="${y}" y2="${y}"/>` : `<line class="whisk" x1="${x(0)}" x2="${x(m.v)}" y1="${y}" y2="${y}" style="stroke:${col(m.v)};stroke-opacity:.35;stroke-width:6"/>`;
      return `<g class="row" tabindex="0" role="button" data-n="${m.c.n}" aria-label="${m.c.name}: ${fmtMeasure(m.c, m.bn, state.measure, true)}">
        <rect class="hit" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
        <text class="lbl" x="${labelW - 10}" y="${y + 4}" text-anchor="end">${i + 1}. ${m.c.name.length > (narrowScreen ? 13 : 22) ? m.c.iso3 : m.c.name}</text>
        ${w}<circle class="dot" cx="${x(m.v)}" cy="${y}" r="5.5" fill="${col(m.v)}"/>
        <text x="${W}" y="${y + 4}" text-anchor="end" style="font-family:var(--font-data);font-size:12px;fill:var(--ink)">${fmtMeasure(m.c, m.bn, state.measure, diverging)}</text>
      </g>`;
    }).join("")}
  </svg>`;
  root.innerHTML = `<div class="view-inner">
    <h2>${LENS_TITLE[state.lens]}</h2>
    <p class="sub">${measureText()}, ${periodText()}. Dot: middle estimate; line: likely range (about 90%). ${rows.length} countries; switch view and measure at the top. Click a country for the breakdown.</p>
    ${filtersHtml()}
    <div class="chart">${svg}</div>
    <p class="note-small">Scale is compressed (symmetric log) so small and large countries both stay readable; the axis labels give the true values.</p>
  </div>`;
  wireRows(root, rows);
}
function wireRows(root, rows) {
  const by = Object.fromEntries(rows.map(m => [m.c.n, m]));
  root.querySelectorAll(".row, .bubble").forEach(el => {
    const m = by[el.dataset.n];
    el.addEventListener("pointermove", e => showTip(e, tipFor(m)));
    el.addEventListener("pointerleave", () => (tip.hidden = true));
    el.addEventListener("click", () => { tip.hidden = true; select(m.c.n, false); });
    el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(m.c.n, false); } });
  });
  wireFilters(root);
}

// ----- Ukraine vs Russia: what each country moved toward Ukraine against what it moved toward Russia -----
function sides(c) {
  const k = calc(c, Math.max(2022, state.year));
  const parts = k.shiftParts.concat(state.netBack ? k.backParts.map(p => ({ ...p, v: -p.v })) : []);
  const ukr = parts.reduce((s, p) => s + Math.max(0, p.v), 0), rus = parts.reduce((s, p) => s + Math.max(0, -p.v), 0);
  return { c, k, ukr, rus, net: ukr - rus, bn: k.shift, v: scaled(c, k.shift), lo: scaled(c, k.shiftLo), hi: scaled(c, k.shiftHi) };
}
function renderBubbles(root) {
  const measure = state.measure === "total" ? "gdp" : state.measure;
  const all = Object.values(DATA).filter(eligible).map(sides).filter(s => s.c.gdp);
  const sx = s => scaled(s.c, s.ukr, measure), sy = s => scaled(s.c, s.rus, measure);
  const W = Math.min(1040, root.clientWidth - 32), H = Math.round(Math.min(720, Math.max(380, W * 0.68)));
  const m = { l: 56, r: 18, t: 18, b: 46 };
  const maxV = d3.max(all.flatMap(s => [sx(s), sy(s)])) || 1;
  // log-like axes (symmetric log): spreads the many small shifts and still fits the few very large ones
  const k0 = measure === "gdp" ? 0.5 : 50;
  const x = d3.scaleSymlog().constant(k0).domain([0, maxV * 1.08]).range([m.l, W - m.r]);
  const y = d3.scaleSymlog().constant(k0).domain([0, maxV * 1.08]).range([H - m.b, m.t]);
  const r = d3.scaleSqrt().domain([0, d3.max(all, s => s.c.gdp)]).range([2.5, Math.max(18, W / 28)]);
  const d = x.domain()[1];
  const steps = measure === "gdp" ? [1, 2, 5, 10, 20, 50, 100] : [100, 500, 1000, 5000, 10000, 50000];
  const ticks = steps.filter(t => t <= d);
  const big = all.slice().sort((a, b) => b.c.gdp - a.c.gdp).slice(0, W < 600 ? 10 : 22).map(s => s.c.n)
    .concat(all.slice().sort((a, b) => Math.max(sx(b), sy(b)) - Math.max(sx(a), sy(a))).slice(0, W < 600 ? 4 : 8).map(s => s.c.n));
  const sel = state.selected;
  const unit = measure === "gdp" ? "% of one year's GDP" : "€ per person";
  const order = all.slice().sort((a, b) => b.c.gdp - a.c.gdp);   // big bubbles first, small ones on top
  // labels for the largest economies (and the selected one), skipped where they would overlap a label already placed
  const labels = [];
  for (const s of [...order.filter(s => s.c.n === sel), ...order.filter(s => big.includes(s.c.n) && s.c.n !== sel)]) {
    const t = s.c.name.length > 14 ? s.c.iso3 : s.c.name, w = t.length * 6.6, lx = x(sx(s)), ly = y(sy(s)) - r(s.c.gdp) - 4;
    if (labels.every(l => Math.abs(l.x - lx) > (l.w + w) / 2 + 2 || Math.abs(l.y - ly) > 13)) labels.push({ x: lx, y: ly, w, t });
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Each country: money moved toward Ukraine against money moved toward Russia">
    <path class="zone-ukr" d="M${x(0)},${y(0)} L${x(d)},${y(0)} L${x(d)},${y(d)} Z"/>
    <path class="zone-rus" d="M${x(0)},${y(0)} L${x(0)},${y(d)} L${x(d)},${y(d)} Z"/>
    <g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${H - m.b}"/><line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>
      <text x="${x(t)}" y="${H - m.b + 16}" text-anchor="middle">${measure === "gdp" ? t + "%" : "€" + d3.format("~s")(t)}</text>
      <text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${measure === "gdp" ? t + "%" : "€" + d3.format("~s")(t)}</text>`).join("")}</g>
    <line class="diag" x1="${x(0)}" y1="${y(0)}" x2="${x(d)}" y2="${y(d)}"/>
    <text class="zone-lbl" x="${x(d) - 8}" y="${y(0) - 12}" text-anchor="end" style="fill:var(--ukr)">Net toward Ukraine</text>
    <text class="zone-lbl" x="${x(0) + 10}" y="${y(d) + 18}" style="fill:var(--rus);paint-order:stroke;stroke:var(--surface);stroke-width:4px">Net toward Russia</text>
    <text x="${(m.l + W - m.r) / 2}" y="${H - 8}" text-anchor="middle" style="fill:var(--ink)">Moved toward Ukraine → (${unit})</text>
    <text transform="translate(14 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle" style="fill:var(--ink)">Moved toward Russia → (${unit})</text>
    ${order.map(s => `<circle class="bubble${s.c.n === sel ? " sel" : ""}" data-n="${s.c.n}" tabindex="0" role="button" aria-label="${s.c.name}" cx="${x(sx(s))}" cy="${y(sy(s))}" r="${r(s.c.gdp)}" fill="${s.net >= 0 ? "var(--ukr)" : "var(--rus)"}"/>`).join("")}
    ${labels.map(l => `<text x="${l.x}" y="${l.y}" text-anchor="middle" style="fill:var(--ink);font-size:11.5px;font-weight:600;paint-order:stroke;stroke:var(--surface);stroke-width:3px;pointer-events:none">${l.t}</text>`).join("")}
  </svg>`;
  root.innerHTML = `<div class="view-inner">
    <h2>What each country moved toward Ukraine, and toward Russia</h2>
    <p class="sub">${periodText()}, ${unit}. Right: aid, refugees, Russian trade given up. Up: trade with Russia above the pre-war level, oil bought via other countries, hidden channels, weapons${state.netBack ? ", money flowing back from Ukraine" : ""}. Below the diagonal a country is net toward Ukraine. Bubble size: size of the economy.</p>
    ${filtersHtml()}
    <div class="chart">${svg}</div>
    <p class="note-small">Log-like axes so that small and large shifts both stay visible. ${state.measure === "total" ? "Shown in % of GDP: totals in € would put every small country in one corner. " : ""}Middle estimates only; each country's range is in its breakdown.</p>
  </div>`;
  wireRows(root, all.map(s => ({ c: s.c, bn: s.k.shift, loBn: s.k.shiftLo, hiBn: s.k.shiftHi })));
}

// ----- Table and data download -----
const COLS = [
  { k: "name", label: "Country", fmt: (r) => r.name },
  { k: "shiftGdp", label: "Net shift, % of a year's GDP", fmt: r => pct(r.shiftGdp), sign: true },
  { k: "shiftRange", label: "Likely range", fmt: r => `${pct(r.shiftLoGdp)} to ${pct(r.shiftHiGdp)}`, nosort: true },
  { k: "shift", label: "Net shift, €", fmt: r => eur(r.shift, true), sign: true },
  { k: "shiftPp", label: "Per person", fmt: r => (r.shiftPp == null ? "–" : (r.shiftPp < 0 ? "−" : "") + "€" + Math.round(Math.abs(r.shiftPp)).toLocaleString("en")), sign: true },
  { k: "costGdp", label: "Cost, % of a year's GDP", fmt: r => pct(r.costGdp) },
  { k: "aid", label: "Aid incl. EU share, €", fmt: r => eur(r.aid) },
  { k: "paidRus", label: "Paid to Russia, €", fmt: r => eur(r.paidRus) },
  { k: "cert", label: "Certainty", fmt: r => r.cert },
];
const pct = v => (v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(Math.abs(v) >= 1 ? 1 : 2) + "%");
function tableRows() {
  const y = Math.max(2022, state.year);
  return Object.values(DATA).filter(eligible).map(c => {
    const k = calc(c, y), g = c.gdp ? 100 / c.gdp : null, pp = c.pop ? 1e9 / (c.pop * 1e6) : null;
    return {
      c, name: c.name, iso3: c.iso3, gdp: c.gdp, pop: c.pop,
      shift: k.shift, shiftLo: k.shiftLo, shiftHi: k.shiftHi,
      shiftGdp: g && k.shift * g, shiftLoGdp: g && k.shiftLo * g, shiftHiGdp: g && k.shiftHi * g, shiftPp: pp && k.shift * pp,
      cost: k.cost, costGdp: g && k.cost * g, aid: k.aid, refugees: k.refugees, paidRus: k.paidRussia, cert: k.shiftCert,
      parts: k.shiftParts.concat(state.netBack ? k.backParts.map(p => ({ ...p, v: -p.v, lo: -p.hi, hi: -p.lo, k: "back_" + p.k })) : []),
    };
  });
}
function renderTable(root) {
  const rows = tableRows();
  const key = viewState.sortKey === "metric" ? "shiftGdp" : viewState.sortKey;
  rows.sort((a, b) => (key === "name" || key === "cert" ? String(a[key]).localeCompare(String(b[key])) : (a[key] ?? -Infinity) - (b[key] ?? -Infinity)) * viewState.sortDir);
  root.innerHTML = `<div class="view-inner">
    <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end">
      <div><h2>All countries, all numbers</h2>
      <p class="sub">${periodText()}${state.netBack ? ", after money flowing back" : ""}. Click a column to sort, a row for the breakdown.</p></div>
      <div class="dl">
        <button id="dl-csv">Download CSV</button>
        <button id="dl-parts">CSV with every part</button>
        <a href="data.json" download="follow-the-money-ukrainian-aid.json">Full data (JSON)</a>
      </div>
    </div>
    ${filtersHtml()}
    <div class="tablewrap"><table class="dtable">
      <thead><tr>${COLS.map(col => `<th scope="col" data-k="${col.k}" ${col.nosort ? "" : `aria-sort="${key === col.k ? (viewState.sortDir < 0 ? "descending" : "ascending") : "none"}"`}>${col.label}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(r => `<tr data-n="${r.c.n}">${COLS.map(col => `<td class="${col.sign ? (r[col.k] > 0 ? "pos" : r[col.k] < 0 ? "neg" : "") : ""}">${col.fmt(r)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table></div>
    <p class="note-small">Data and text: CC BY 4.0, credit "Follow the Money: Ukrainian Aid". Every figure has its sources in the country breakdown and in the research files on GitHub. Figures to ${document.body.dataset.dataTo || "the end of August 2026"}.</p>
  </div>`;
  root.querySelectorAll("th[data-k]").forEach(th => (th.onclick = () => {
    const k = th.dataset.k; if (k === "shiftRange") return;
    viewState.sortDir = viewState.sortKey === k || (viewState.sortKey === "metric" && k === "shiftGdp") ? -viewState.sortDir : k === "name" ? 1 : -1;
    viewState.sortKey = k; renderView();
  }));
  root.querySelectorAll("tbody tr").forEach(tr => (tr.onclick = () => select(tr.dataset.n, false)));
  root.querySelector("#dl-csv").onclick = () => download(csvSummary(rows), "follow-the-money-ukrainian-aid.csv");
  root.querySelector("#dl-parts").onclick = () => download(csvParts(rows), "follow-the-money-ukrainian-aid-parts.csv");
  wireFilters(root);
}
const q = v => (v == null || Number.isNaN(v) ? "" : typeof v === "number" ? +v.toFixed(4) : /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : v);
function csvSummary(rows) {
  const head = ["iso3", "country", "period", "net_shift_eur_bn", "net_shift_low", "net_shift_high", "net_shift_pct_gdp", "net_shift_eur_per_person", "cost_eur_bn", "cost_pct_gdp", "aid_eur_bn", "refugees_eur_bn", "paid_to_russia_eur_bn", "certainty", "gdp_eur_bn_2024", "population_m"];
  const lines = rows.map(r => [r.iso3, r.name, periodText(), r.shift, r.shiftLo, r.shiftHi, r.shiftGdp, r.shiftPp, r.cost, r.costGdp, r.aid, r.refugees, r.paidRus, r.cert, r.gdp, r.pop].map(q).join(","));
  return [head.join(","), ...lines].join("\n");
}
function csvParts(rows) {
  const head = ["iso3", "country", "period", "part", "label", "eur_bn", "low", "high", "certainty", "sources"];
  const lines = rows.flatMap(r => r.parts.map(p => [r.iso3, r.name, periodText(), p.k, p.label, p.v, p.lo, p.hi, p.cert, (p.src || []).join(" ")].map(q).join(",")));
  return [head.join(","), ...lines].join("\n");
}
function download(text, name) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ----- switching -----
function renderView() {
  const root = document.getElementById("view");
  const v = state.view || "map";
  document.querySelector(".app").dataset.view = v;
  root.hidden = v === "map";
  if (v === "map") return;
  const scroll = root.scrollTop;
  ({ rank: renderRanking, bubbles: renderBubbles, table: renderTable })[v](root);
  root.scrollTop = scroll;
}
function setView(v) {
  state.view = v;
  setPressed("[data-view]", "view", v);
  tip.hidden = true;
  renderView();
  try { history.replaceState(null, "", location.pathname + location.search + (v === "map" ? (state.selected ? "#" + (DATA[state.selected]?.iso3 || "") : "") : "#view=" + v)); } catch (e) { /* file:// */ }
}
document.querySelectorAll("[data-view]").forEach(b => (b.onclick = () => { setView(b.dataset.view); if (typeof closeMenu === "function") closeMenu(); }));
window.addEventListener("resize", () => state.view && state.view !== "map" && renderView());
window.renderView = renderView;
window.setView = setView;
const startView = (location.hash.match(/view=(\w+)/) || [])[1];
if (startView && ["rank", "bubbles", "table"].includes(startView)) {
  const wait = setInterval(() => { if (Object.keys(DATA).length) { clearInterval(wait); setView(startView); } }, 100);
}
