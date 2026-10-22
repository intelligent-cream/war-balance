// ===== Views: the ranking (the data downloads are in views2.js, shown in Sources) =====
// Same numbers as the map: the current view (the net, support for Ukraine, trade with Russia), measure and year.
// Round 19 (owner): every filter is in the Filters drawer. The views have none of their own: each reads the drawer's
// state (view, measure, what's counted, region, group, size, year) and re-renders whenever it changes (paint() calls
// renderView()). Round 20 (owner): only Map, Ranking and Sources remain, and the ranking is as clean as the map: the
// header line names it and its explanation is in the header's ⓘ (rankInfo)
/* global leaning, PARTY_TO_WAR, state, DATA, calc, scaled, fmtMeasure, eur, rangeTxt, showTip, tip, select, setPressed, MIN_GDP_RANK, YEARS, FRAC, t, LANG,
   num, money, tight, compact, parseHash, writeHash, yi, remitSum, HEAD_LENS, uncertain, grades, renderDrawer, renderInfo, verb */
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
  payments: "Trade with Russia since before the war: Russia kept less (+) or more (−) against a world without the war",
  net: "Support for Ukraine plus trade with Russia, since before the war",
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
// chart rows act like buttons: Enter and Space open the country, as a click does
function activateOnKey(el, fn) { el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(); } }); }
function tipFor(m) {
  const range = m.loBn != null ? "<br>" + t("Likely range {lo} to {hi}", { lo: fmtMeasure(m.c, m.loBn, state.measure, true), hi: fmtMeasure(m.c, m.hiBn, state.measure, true) }) : "";
  // round 22 (owner): a verb and an amount ("Toward Ukraine by 3.2% of GDP · €134 bn"); the chart itself keeps its signed axis
  return `<b>${m.c.name}</b>${verb(HEAD_LENS[state.lens], m.bn, m.c)}${state.measure !== "total" ? ` · ${eur(Math.abs(m.bn))}` : ""}${range}<br><span style="opacity:.75">${t("Click for the full breakdown")}</span>`;
}

// ----- Ranking: every country as a dot with its likely range, sorted -----
// what the ⓘ in the header says while the ranking is open
function rankInfo() {
  const n = Object.values(DATA).filter(eligible).length;
  return `<p><b>${t(LENS_TITLE[state.lens])}</b></p>
    <p>${t("{measure}, {period}. Dot: middle estimate; line: likely range (data and model uncertainty given the method, about 90% by judgement). {n} countries; switch view and measure in Filters. Click a country for the breakdown.", { measure: measureText(), period: periodText(), n })}</p>
    ${state.lens === "net" ? `<p>${t("The net adds two different things: help given to Ukraine and the change in what Russia kept from trade. Much of what one country stopped buying, Russia sold to others.")}</p>` : ""}
    <p class="sub">${t("Scale is compressed (symmetric log) so small and large countries both stay readable; the axis labels give the true values.")}</p>
    <p class="sub"><button class="linkbtn" data-goview="map">${t("Map")}</button> · <button class="linkbtn" data-goview="how">${t("How it works")}</button></p>`;
}
function renderRanking(root) {
  // round 15: a headline number whose direction is uncertain (its likely range or a method-band alternative crosses
  // zero) is not ranked; those countries are named below the chart
  const hq = HEAD_LENS[state.lens], y = state.year;
  const all = Object.values(DATA).filter(eligible).map(metricOf).filter(m => m.v != null).sort((a, b) => b.v - a.v);
  // round 24b (owner, 22 October 2026): a number whose direction is not certain is "leaning toward Ukraine / Russia" or,
  // near the middle, "uncertain direction"; neither is ranked, both are named under the chart. Belarus, a party to the
  // war, is in neither
  const party = all.filter(m => PARTY_TO_WAR.has(m.c.iso3));
  const unc0 = hq && y > 2021 ? all.filter(m => !party.includes(m) && uncertain(m.c, y, hq)) : [];
  const big = (a, b) => Math.abs(b.v) - Math.abs(a.v);   // largest first
  const lean = side => unc0.filter(m => leaning(m.c, y, hq) === side).sort(big);
  const leanU = lean("ukraine"), leanR = lean("russia"), unc = unc0.filter(m => !leanU.includes(m) && !leanR.includes(m)).sort(big);
  const rows = all.filter(m => !unc0.includes(m) && !party.includes(m));
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
      return `<g class="row" tabindex="0" role="button" data-n="${m.c.n}" aria-label="${m.c.name}: ${verb(HEAD_LENS[state.lens], m.bn, m.c)}">
        <rect class="hit" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
        <text class="lbl" x="${labelW - 10}" y="${y + 4}" text-anchor="end">${i + 1}. ${fitName(m.c.name, narrowScreen ? 13 : 22)}<title>${m.c.name}</title></text>
        ${w}<circle class="dot" cx="${x(m.v)}" cy="${y}" r="5.5" fill="${col(m.v)}"/>
        <text x="${W}" y="${y + 4}" text-anchor="end" style="font-family:var(--font-data);font-size:12px;fill:var(--ink)">${fmtMeasure(m.c, m.bn, state.measure, diverging, false)}</text>
      </g>`;
    }).join("")}
  </svg>`;
  root.innerHTML = `<div class="view-inner">
    <div class="chart">${svg}</div>
    ${[[leanR, "Leaning toward Russia ({n}):", "rus"], [leanU, "Leaning toward Ukraine ({n}):", "ukr"], [unc, "Uncertain direction ({n}):", "unc"], [party, "Party to the war (with Russia), not ranked:", "party"]].filter(([l]) => l.length).map(([l, lab, cls]) => chipGroup(l, t(lab, { n: l.length }), cls)).join("")}
    ${unc0.length ? `<p class="note-small">${t("Not ranked: the likely range or another reasonable method choice crosses zero. Leaning: at least a 65% chance of that direction under the likely range; uncertain: less.")}</p>` : ""}
  </div>`;
  wireRows(root, rows);
}
// round 25 (owner): the countries not ranked as tappable chips, grouped (leaning toward Russia or Ukraine, uncertain,
// party to the war); a chip opens the country's panel
function chipGroup(list, label, cls) {
  return `<div class="rk-group rk-${cls}"><p class="rk-h">${label}</p><div class="rk-chips">${list.map(m => `<button class="rk-chip" data-n="${m.c.n}">${m.c.name} <span>${fmtMeasure(m.c, m.bn, state.measure, true)}</span></button>`).join("")}</div></div>`;
}
function wireRows(root, rows) {
  const by = Object.fromEntries(rows.map(m => [m.c.n, m]));
  root.querySelectorAll(".rk-chip").forEach(el => el.addEventListener("click", () => { tip.hidden = true; select(el.dataset.n, false); }));
  root.querySelectorAll(".row").forEach(el => {
    const m = by[el.dataset.n];
    el.addEventListener("pointermove", e => showTip(e, tipFor(m)));
    el.addEventListener("pointerleave", () => (tip.hidden = true));
    el.addEventListener("click", () => { tip.hidden = true; select(m.c.n, false); });
    activateOnKey(el, () => select(m.c.n, false));
  });
}

// ----- switching -----
function renderView() {
  const root = document.getElementById("view");
  const v = state.view || "map";
  document.querySelector(".app").dataset.view = v;
  root.hidden = v === "map";
  if (v === "map") return;
  const scroll = root.scrollTop;
  ({ rank: renderRanking, ...(window.EXTRA_VIEWS || {}) })[v](root);
  root.scrollTop = scroll;
}
// quiet: the address already says this view (Back/Forward)
function setView(v, quiet) {
  state.view = v;
  // round 22: the header tabs (role="tab"): the chosen one is selected and is the one Tab reaches
  document.querySelectorAll(".vtabs [data-view]").forEach(b => { const on = b.dataset.view === v; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  tip.hidden = true;
  renderView();
  // the drawer's map layers apply to the map only (round 19)
  if (typeof renderDrawer === "function") renderDrawer();
  // the header line and its ⓘ say which view is open (round 20)
  if (typeof renderInfo === "function") renderInfo();
  // round 17: a view starts below the header line, which shows the page tabs outside the map
  if (typeof placeView === "function") placeView();
  // round 24: a view chosen by the reader is a new history entry (Back returns to the one before)
  if (!quiet) (window.pushNav ? window.pushNav() : writeHash(false));
}
// round 19: switching views leaves the Filters drawer open (it closes only when the reader closes it)
document.querySelectorAll(".vtabs [data-view]").forEach(b => (b.onclick = () => setView(b.dataset.view)));
// arrow keys, Home and End move between the tabs (the ARIA tabs pattern) and open the view
document.querySelector(".vtabs").addEventListener("keydown", e => {
  const tabs = [...document.querySelectorAll(".vtabs [data-view]")], i = tabs.indexOf(document.activeElement);
  if (i < 0) return;
  const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (j == null) return;
  e.preventDefault();
  const tab = tabs[(j + tabs.length) % tabs.length];
  tab.focus(); setView(tab.dataset.view);
});
window.addEventListener("resize", () => state.view && state.view !== "map" && renderView());
window.renderView = renderView;
window.setView = setView;
// "#view=rank", also combined with a country: "#view=rank&c=POL"; views that are gone open the nearest one (parseHash)
const startView = parseHash().view;
if (["rank", "how"].includes(startView)) {
  const wait = setInterval(() => { if (Object.keys(DATA).length) { clearInterval(wait); setView(startView); } }, 100);
}
