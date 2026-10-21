// ===== Views: ranking and Ukraine vs Russia bubbles (the table and data download are in views2.js) =====
// Same numbers as the map: the current view (the net, support for Ukraine, kept from Russia), measure and year.
// Round 19 (owner): every filter is in the Filters drawer. The views have none of their own: each reads the drawer's
// state (view, measure, what's counted, region, group, size, year), says it in one line (filterSummary) and re-renders
// whenever it changes (paint() calls renderView())
/* global state, DATA, calc, scaled, fmtMeasure, eur, rangeTxt, showTip, tip, select, setPressed, MIN_GDP_RANK, YEARS, FRAC, t, LANG,
   num, money, tight, compact, parseHash, writeHash, yi, remitSum, HEAD_LENS, uncertain, grades, filterSummary, renderDrawer */
// Labels below are English keys; t() (i18n.js) translates them when rendered.

const GROUPS = {
  all: { label: "All countries", list: null },
  eu: { label: "EU", list: "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE" },
  g7: { label: "G7", list: "USA JPN DEU GBR FRA ITA CAN" },
  nato: { label: "NATO", list: "ALB BEL BGR CAN HRV CZE DNK EST FIN FRA DEU GRC HUN ISL ITA LVA LTU LUX MNE NLD MKD NOR POL PRT ROU SVK SVN ESP SWE TUR GBR USA" },
  brics: { label: "BRICS", list: "BRA IND CHN ZAF EGY ETH IRN ARE IDN" },
  ussr: { label: "Former Soviet Union", list: "ARM AZE BLR EST GEO KAZ KGZ LVA LTU MDA TJK TKM UZB" },
};
// round 15: the net and its two parts are views of their own (net, support, payments), so no part switch is needed.
// Round 17: the group is one of the Filters drawer's filters (with state.region and state.size in index.html), shared by
// the map and these views. sortKey and sortDir are the table's column sort (views2.js)
const viewState = { group: "all", sortKey: "net.v", sortDir: -1 };

function inGroup(c) {
  const g = GROUPS[viewState.group];
  return !g.list || g.list.split(" ").includes(c.iso3);
}
function eligible(c) {
  return inGroup(c) && (state.region === "all" || (REGION_OF[c.iso3] || "asia") === state.region) && (c.gdp || 0) >= state.size;
}

// the headline number of the current view, with its likely range, in the current measure
function metricOf(c) {
  const k = calc(c, state.year);
  const [v, lo, hi] = { net: [k.shift, k.shiftLo, k.shiftHi], support: [k.uaBal, k.uaLo, k.uaHi], payments: [k.rusBal, k.rusLo, k.rusHi] }[state.lens];
  const s = x => (x == null ? null : scaled(c, x));
  return { c, k, bn: v, loBn: lo, hiBn: hi, v: s(v), lo: s(lo), hi: s(hi) };
}
const LENS_TITLE = {
  support: "Support for Ukraine since before the war",
  payments: "Kept from Russia since before the war: paid Russia less (+) or more (−) than without the war",
  net: "Support for Ukraine plus kept from Russia, since before the war",
};
function measureText() {
  return t({ gdp: "total as % of one year's GDP (average 2022–2024), not a yearly rate", pp: "€ per person", total: "€ billion" }[state.measure]);
}
function periodText() {
  if (state.year === 2021) return t("2021 (before the war)");
  const y = state.year;
  return `2022–${y}${y === 2026 && FRAC[5] < 1 ? t(" (2026 year to date, Jan–Aug)") : ""}`;
}
function tick(v) {
  const sg = v < 0 ? "−" : "", a = Math.abs(v);
  if (state.measure === "gdp") return sg + num(a, 2, 0) + "%";
  if (state.measure === "pp") return sg + money(compact(a));
  return sg + tight(money(num(a), "bn"));
}
// long names are cut with an ellipsis; the full name is in a <title> (and in the row's label and tooltip)
const fitName = (name, max) => (name.length > max ? name.slice(0, max - 1).trimEnd() + "…" : name);
// chart rows and bubbles act like buttons: Enter and Space open the country, as a click does
function activateOnKey(el, fn) { el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); }
function tipFor(m) {
  const range = m.loBn != null ? "<br>" + t("Likely range {lo} to {hi}", { lo: fmtMeasure(m.c, m.loBn, state.measure, true), hi: fmtMeasure(m.c, m.hiBn, state.measure, true) }) : "";
  return `<b>${m.c.name}</b>${fmtMeasure(m.c, m.bn, state.measure, true)}${state.measure !== "total" ? ` · ${eur(m.bn, true)}` : ""}${range}<br><span style="opacity:.75">${t("Click for the full breakdown")}</span>`;
}

// ----- Ranking: every country as a dot with its likely range, sorted -----
function renderRanking(root) {
  // round 15: a headline number whose direction is uncertain (its likely range or a method-band alternative crosses
  // zero) is not ranked; those countries are named below the chart
  const hq = HEAD_LENS[state.lens], y = state.year;
  const all = Object.values(DATA).filter(eligible).map(metricOf).filter(m => m.v != null).sort((a, b) => b.v - a.v);
  const unc = hq && y > 2021 ? all.filter(m => uncertain(m.c, y, hq)) : [];
  const rows = all.filter(m => !unc.includes(m));
  const diverging = true;   // every view can go either way around zero
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
  // round 17: one colour rule; below zero is orange only where it is money toward Russia (not support)
  const col = v => (v >= 0 ? "var(--ukr)" : state.lens === "support" ? "var(--ink-soft)" : "var(--rus)");
  // a group, not an image: its rows are buttons that keyboard and screen reader users reach one by one
  const title = t(LENS_TITLE[state.lens]);
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("{title}, {n} countries, ranked", { title, n: rows.length })}">
    <g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${H - 6}"/><text x="${x(t)}" y="${top - 12}" text-anchor="middle">${tick(t)}</text>`).join("")}</g>
    ${diverging ? `<line class="zero" x1="${x(0)}" x2="${x(0)}" y1="${top - 6}" y2="${H - 6}"/>` : ""}
    ${rows.map((m, i) => {
      const y = top + i * rowH + rowH / 2;
      const w = m.lo != null ? `<line class="whisk" x1="${x(m.lo)}" x2="${x(m.hi)}" y1="${y}" y2="${y}"/>` : `<line class="whisk" x1="${x(0)}" x2="${x(m.v)}" y1="${y}" y2="${y}" style="stroke:${col(m.v)};stroke-opacity:.35;stroke-width:6"/>`;
      return `<g class="row" tabindex="0" role="button" data-n="${m.c.n}" aria-label="${m.c.name}: ${fmtMeasure(m.c, m.bn, state.measure, true)}">
        <rect class="hit" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
        <text class="lbl" x="${labelW - 10}" y="${y + 4}" text-anchor="end">${i + 1}. ${fitName(m.c.name, narrowScreen ? 13 : 22)}<title>${m.c.name}</title></text>
        ${w}<circle class="dot" cx="${x(m.v)}" cy="${y}" r="5.5" fill="${col(m.v)}"/>
        <text x="${W}" y="${y + 4}" text-anchor="end" style="font-family:var(--font-data);font-size:12px;fill:var(--ink)">${fmtMeasure(m.c, m.bn, state.measure, diverging, false)}</text>
      </g>`;
    }).join("")}
  </svg>`;
  root.innerHTML = `<div class="view-inner">
    <h2>${title}</h2>
    ${filterSummary()}
    <p class="sub">${t("{measure}, {period}. Dot: middle estimate; line: likely range (data and model uncertainty given the method, about 90% by judgement). {n} countries; switch view and measure in Filters. Click a country for the breakdown.", { measure: measureText(), period: periodText(), n: rows.length })}</p>
    ${state.lens === "net" ? `<p class="sub"><b>${t("The net adds two different things: help given to Ukraine and money kept from Russia. Much of what one country stopped paying, Russia sold to others.")}</b></p>` : ""}
    <div class="chart">${svg}</div>
    ${unc.length ? `<p class="note-small">${t("Not ranked, direction uncertain (the likely range or a method-band alternative crosses zero), {n} countries: {list}.", { n: unc.length, list: unc.map(m => `${m.c.name} ${fmtMeasure(m.c, m.bn, state.measure, true)}`).join(", ") })}</p>` : ""}
    <p class="note-small">${t("Scale is compressed (symmetric log) so small and large countries both stay readable; the axis labels give the true values.")}</p>
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
    activateOnKey(el, () => select(m.c.n, false));
  });
}

// ----- Ukraine vs Russia: what each country moved toward Ukraine against what it moved toward Russia -----
function sides(c) {
  const k = calc(c, state.year);
  const parts = k.shiftParts.concat(state.netBack ? k.backShift : []);
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
  const unit = t(measure === "gdp" ? "% of one year's GDP" : "€ per person");
  const order = all.slice().sort((a, b) => b.c.gdp - a.c.gdp);   // big bubbles first, small ones on top
  const fv = v => (measure === "gdp" ? num(v, v >= 1 ? 1 : 2) + "%" : money(num(v)));
  const tk = v => (measure === "gdp" ? num(v) + "%" : money(compact(v)));
  // labels for the largest economies (and the selected one), skipped where they would overlap a label already placed
  // the two zone labels are placed first, so country labels keep clear of them
  const zw = s => s.length * 9;
  const zU = t("Net positive"), zR = t("Net negative");
  const labels = [{ x: x(d) - 8 - zw(zU) / 2, y: y(0) - 12, w: zw(zU), zone: true }, { x: x(0) + 10 + zw(zR) / 2, y: y(d) + 18, w: zw(zR), zone: true }];
  // the axis numbers are obstacles too (country labels near the axes covered them on phones)
  const tkw = v => tk(v).length * 7;
  for (const v of ticks) labels.push({ x: m.l - 8 - tkw(v) / 2, y: y(v) + 4, w: tkw(v), zone: true }, { x: x(v), y: H - m.b + 16, w: tkw(v), zone: true });
  for (const s of [...order.filter(s => s.c.n === sel), ...order.filter(s => big.includes(s.c.n) && s.c.n !== sel)]) {
    const t = fitName(s.c.name, 14), w = t.length * 6.6, ly = y(sy(s)) - r(s.c.gdp) - 4;
    const lx = Math.min(W - m.r - w / 2, Math.max(m.l + w / 2 + 2, x(sx(s))));   // kept inside the plot area
    if (labels.every(l => Math.abs(l.x - lx) > (l.w + w) / 2 + 2 || Math.abs(l.y - ly) > (l.zone ? 17 : 13))) labels.push({ x: lx, y: ly, w, t });
  }
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("Each country: its positive parts against its negative parts")}">
    <path class="zone-ukr" d="M${x(0)},${y(0)} L${x(d)},${y(0)} L${x(d)},${y(d)} Z"/>
    <path class="zone-rus" d="M${x(0)},${y(0)} L${x(0)},${y(d)} L${x(d)},${y(d)} Z"/>
    <g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${m.t}" y2="${H - m.b}"/><line x1="${m.l}" x2="${W - m.r}" y1="${y(t)}" y2="${y(t)}"/>
      <text x="${x(t)}" y="${H - m.b + 16}" text-anchor="middle">${tk(t)}</text>
      <text x="${m.l - 8}" y="${y(t) + 4}" text-anchor="end">${tk(t)}</text>`).join("")}</g>
    <line class="diag" x1="${x(0)}" y1="${y(0)}" x2="${x(d)}" y2="${y(d)}"/>
    <text class="zone-lbl" x="${x(d) - 8}" y="${y(0) - 12}" text-anchor="end" style="fill:var(--ukr)">${zU}</text>
    <text class="zone-lbl" x="${x(0) + 10}" y="${y(d) + 18}" style="fill:var(--rus-text);paint-order:stroke;stroke:var(--surface);stroke-width:4px">${zR}</text>
    <text x="${(m.l + W - m.r) / 2}" y="${H - 8}" text-anchor="middle" style="fill:var(--ink)">${t("Support for Ukraine, less paid to Russia → ({unit})", { unit })}</text>
    <text transform="translate(14 ${(m.t + H - m.b) / 2}) rotate(-90)" text-anchor="middle" style="fill:var(--ink)">${t("More paid to or earned from Russia, money flowing back → ({unit})", { unit })}</text>
    ${order.map(s => `<circle class="bubble${s.c.n === sel ? " sel" : ""}" data-n="${s.c.n}" tabindex="0" role="button" aria-label="${s.c.name}: ${t("positive parts")} ${fv(sx(s))}, ${t("negative parts")} ${fv(sy(s))}" cx="${x(sx(s))}" cy="${y(sy(s))}" r="${r(s.c.gdp)}" fill="${s.net >= 0 ? "var(--ukr)" : "var(--rus)"}"/>`).join("")}
    ${labels.filter(l => !l.zone).map(l => `<text x="${l.x}" y="${l.y}" text-anchor="middle" style="fill:var(--ink);font-size:11.5px;font-weight:600;paint-order:stroke;stroke:var(--surface);stroke-width:3px;pointer-events:none">${l.t}</text>`).join("")}
  </svg>`;
  root.innerHTML = `<div class="view-inner">
    <h2>${t("Each country's positive and negative parts")}</h2>
    ${filterSummary({ lens: false })}
    <p class="sub">${t("{period}, {unit}. Right: aid, refugees, purchases from Ukraine, less paid to Russia (including gas Russia cut off, where it did) and Russian money frozen. Up: more paid to Russia, earnings from sales to Russia, oil bought via other countries, hidden channels, weapons{back}. Below the diagonal the net is positive. Bubble size: size of the economy.", { period: periodText(), unit, back: state.netBack ? t(", money flowing back from Ukraine") : "" })}</p>
    <div class="chart">${svg}</div>
    <p class="note-small">${t("Log-like axes so that small and large shifts both stay visible.")} ${state.measure === "total" ? t("Shown in % of GDP: totals in € would put every small country in one corner.") + " " : ""}${t("Middle estimates only; each country's range is in its breakdown.")}</p>
  </div>`;
  wireRows(root, all.map(s => ({ c: s.c, bn: s.k.shift, loBn: s.k.shiftLo, hiBn: s.k.shiftHi })));
}

// ----- switching -----
function renderView() {
  const root = document.getElementById("view");
  const v = state.view || "map";
  document.querySelector(".app").dataset.view = v;
  root.hidden = v === "map";
  if (v === "map") return;
  const scroll = root.scrollTop;
  ({ rank: renderRanking, bubbles: renderBubbles, ...(window.EXTRA_VIEWS || {}) })[v](root);
  root.scrollTop = scroll;
}
// quiet: the address already says this view (Back/Forward)
function setView(v, quiet) {
  state.view = v;
  setPressed(".views [data-view]", "view", v);
  // on phones the tabs are one row that scrolls sideways: bring the chosen one into sight
  const tab = document.querySelector(`.views [data-view="${v}"]`), row = tab && tab.parentElement;
  if (row && row.scrollWidth > row.clientWidth) row.scrollLeft += tab.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - tab.offsetWidth) / 2;
  tip.hidden = true;
  renderView();
  // the drawer's map layers apply to the map only (round 19)
  if (typeof renderDrawer === "function") renderDrawer();
  // round 17: a view starts below the header line, which shows the page tabs outside the map
  if (typeof placeView === "function") placeView();
  if (!quiet) writeHash(false);
}
// round 19: switching views leaves the Filters drawer open (it closes only when the reader closes it)
document.querySelectorAll(".views [data-view]").forEach(b => (b.onclick = () => setView(b.dataset.view)));
window.addEventListener("resize", () => state.view && state.view !== "map" && renderView());
window.renderView = renderView;
window.setView = setView;
// "#view=rank", also combined with a country: "#view=rank&c=POL"; "#view=how" (gone in round 19) opens Sources (parseHash)
const startView = parseHash().view;
if (["rank", "bubbles", "table", "sources"].includes(startView)) {
  const wait = setInterval(() => { if (Object.keys(DATA).length) { clearInterval(wait); setView(startView); } }, 100);
}
