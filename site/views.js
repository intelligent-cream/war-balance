// ===== Views: the ranking (the data downloads are in views2.js, shown in Sources) =====
// Same numbers as the map: the current view (the net, support for Ukraine, trade with Russia), measure and year.
// Round 19 (owner): every filter is in the Filters drawer. The views have none of their own: each reads the drawer's
// state (view, measure, what's counted, region, group, size, year) and re-renders whenever it changes (paint() calls
// renderView()). Round 20 (owner): only Map, Ranking and Sources remain, and the ranking is as clean as the map: the
// header line names it and its explanation is in the header's ⓘ (rankInfo)
/* global leaning, chance, pct, isNearZero, noDataAt, PARTY_TO_WAR, state, DATA, calc, scaled, fmtMeasure, eur, rangeTxt, showTip, tip, select, setPressed, MIN_GDP_RANK, YEARS, FRAC, t, LANG,
   num, money, tight, compact, parseHash, writeHash, yi, remitSum, HEAD_LENS, uncertain, grades, renderDrawer, renderInfo, verb, rangeWords */
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
  payments: "Russia's earnings from trade since before the war: Russia kept less (+) or more (−) against a world without the war",
  net: "Support for Ukraine plus the cut in Russia's earnings from trade, since before the war",
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
  const range = m.loBn != null ? "<br>" + rangeWords(m.c, m.loBn, m.hiBn, HEAD_LENS[state.lens] === "ua" ? "ua" : "net") + (m.st ? " · " + t(m.st === "lean" ? "leaning" : "uncertain") : "") : "";
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
  // Round 29 (owner, 23 October 2026: "I like the ranking. But maybe in the ranking we have the uncertainty there, so we
  // can just see it"): every country is in the one ranked chart, with its likely range; a number whose direction is not
  // certain (the likely range or a method-band alternative crosses zero) stays in its place, drawn faded and labelled
  // "leaning" or "uncertain". Parties to the war are listed under the chart, not ranked; a country with no observation
  // of its own is left out
  const hq = HEAD_LENS[state.lens], y = state.year;
  // round 33: tags picked in Filters narrow the ranking to the countries that have all of them (a note says so)
  const ts = typeof tagSet === "function" ? tagSet() : null;
  const all = Object.values(DATA).filter(eligible).filter(c => !ts || ts.has(c.n)).map(metricOf).filter(m => m.v != null).sort((a, b) => b.v - a.v);
  const party = all.filter(m => PARTY_TO_WAR.has(m.c.iso3));
  const nod = y > 2021 ? all.filter(m => noDataAt(m.c, y)) : [];
  const rows = all.filter(m => !party.includes(m) && !nod.includes(m));
  // Round 38 (owner, 23 October 2026: "we can create leaning groups"): the rows come in five groups, each under its own
  // heading: a certain direction either way, leaning either way (at least a 65% chance), and uncertain. Only the certain
  // groups are numbered: toward Ukraine from the top, toward Russia from the bottom (1 = furthest toward Russia)
  const status = m => (!hq || y <= 2021 || !uncertain(m.c, y, hq) ? "" : leaning(m.c, y, hq) ? "lean" : "unc");
  rows.forEach(m => (m.st = status(m)));
  // round 39 (owner: "do B"): a sixth group in the middle, near zero (range and method band within ±0.5% of GDP)
  rows.forEach(m => (m.nz = !!m.st && isNearZero(m.c, y, hq)));
  // round 42 (certainty audit): a leaning row goes to the side the simulation favours, which can differ from the sign of
  // its middle value; each row shows that side's chance
  rows.forEach(m => { m.ch = hq && y > 2021 ? chance(m.c, y, hq) : null; });
  const grp = m => (m.nz ? 2 : m.st === "unc" ? 3 : m.st === "lean" ? (m.ch.side === "ukraine" ? 1 : 4) : m.v >= 0 ? 0 : 5);
  const GROUP_LABEL = state.lens === "support"
    ? ["Supported Ukraine", "Leaning: supported Ukraine", "Near zero", "Direction uncertain", "Leaning: below zero", "Below zero"]
    : ["Toward Ukraine", "Leaning toward Ukraine", "Near zero", "Direction uncertain", "Leaning toward Russia", "Toward Russia"];
  rows.sort((a, b) => grp(a) - grp(b) || b.v - a.v);
  const groups = [0, 1, 2, 3, 4, 5].map(g => rows.filter(m => grp(m) === g)).map((list, g) => ({ g, list })).filter(x => x.list.length);
  groups.forEach(({ g, list }) => list.forEach((m, i) => (m.rank = g === 0 ? i + 1 : g === 5 ? list.length - i : null)));
  // one layout list: a heading line before each group, then its rows
  const lines = groups.flatMap(({ g, list }) => [{ head: g, n: list.length }, ...list]);
  const diverging = true;   // every view can go either way around zero
  const narrowScreen = root.clientWidth < 600;
  const W = Math.min(1040, root.clientWidth - 32), rowH = 22, labelW = narrowScreen ? 112 : 170, chW = narrowScreen ? 42 : 48, valW = (narrowScreen ? 58 : 76) + chW;
  const top = 30, H = top + lines.length * rowH + 10;
  const vals = rows.flatMap(m => [m.v, m.lo ?? m.v, m.hi ?? m.v]);
  // a compressed (symmetric-log) scale keeps small countries readable next to large totals; the range is clamped to the
  // 1st-99th percentile. Its axis says so (round 29: the ticks are not evenly spaced in value)
  const sorted = vals.slice().sort((a, b) => a - b);
  const q = p => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(p * (sorted.length - 1))))] ?? 0;
  const lo = Math.min(0, q(0.01)), hi = Math.max(0, q(0.99));
  const x = d3.scaleSymlog().constant(state.measure === "gdp" ? 0.5 : state.measure === "pp" ? 50 : 1).domain([lo, hi]).range([labelW, W - valW]).clamp(true).nice();
  // round values on both sides of zero, kept only where they don't crowd each other
  const base = state.measure === "gdp" ? [1, 2, 5, 10, 20, 50, 100, 200] : state.measure === "pp" ? [100, 500, 1000, 5000, 10000, 50000] : [1, 10, 50, 100, 500, 1000];
  const cand = [0, ...base.flatMap(b => [b, -b])].filter(t => t >= x.domain()[0] && t <= x.domain()[1]).sort((a, b) => Math.abs(a) - Math.abs(b));
  const ticks = [];
  for (const t of cand) if (ticks.every(u => Math.abs(x(u) - x(t)) >= (narrowScreen ? 38 : 46))) ticks.push(t);
  // one colour rule; below zero is orange only where it is money toward Russia (not support)
  const col = v => (v >= 0 ? "var(--ukr)" : state.lens === "support" ? "var(--ink-soft)" : "var(--rus)");
  const stLabel = { lean: t("leaning"), unc: t("uncertain") };
  // a group, not an image: its rows are buttons that keyboard and screen reader users reach one by one
  const title = t(LENS_TITLE[state.lens]);
  const svg = `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${t("{title}, {n} countries, ranked", { title, n: rows.length })}">
    <g class="grid">${ticks.map(t => `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 6}" y2="${H - 6}"/><text x="${x(t)}" y="${top - 12}" text-anchor="middle">${tick(t)}</text>`).join("")}</g>
    ${diverging ? `<line class="zero" x1="${x(0)}" x2="${x(0)}" y1="${top - 6}" y2="${H - 6}"/>` : ""}
    ${lines.map((m, i) => {
      const y = top + i * rowH + rowH / 2;
      if (m.head != null) return `<text class="rk-gh rk-gh${m.head}" x="0" y="${y + 6}">${t(GROUP_LABEL[m.head])} · ${m.n}</text>`;
      const w = m.lo != null ? `<line class="whisk" x1="${x(m.lo)}" x2="${x(m.hi)}" y1="${y}" y2="${y}"/>` : `<line class="whisk" x1="${x(0)}" x2="${x(m.v)}" y1="${y}" y2="${y}" style="stroke:${col(m.v)};stroke-opacity:.35;stroke-width:6"/>`;
      const tag = (m.st ? ` · ${stLabel[m.st]}` : "") + (m.ch ? ` · ${t("chance {p}", { p: pct(m.ch.p) })}` : "");
      return `<g class="row${m.st ? " rk-" + m.st : ""}${m.nz ? " rk-nz" : ""}" tabindex="0" role="button" data-n="${m.c.n}" data-g="${grp(m)}" aria-label="${m.c.name}: ${verb(HEAD_LENS[state.lens], m.bn, m.c)}${tag}">
        <rect class="hit" x="0" y="${y - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
        <text class="lbl" x="${labelW - 10}" y="${y + 4}" text-anchor="end">${m.rank ? m.rank + ". " : ""}${fitName(m.c.name, narrowScreen ? 12 : 20)}<title>${m.c.name}${tag}</title></text>
        ${w}<circle class="dot" cx="${x(m.v)}" cy="${y}" r="5.5" fill="${col(m.v)}"/>
        ${m.ch ? `<text class="rk-ch" x="${W - valW + 6}" y="${y + 4}" text-anchor="start" style="fill:${m.ch.side === "ukraine" ? "var(--ukr)" : state.lens === "support" ? "var(--ink-soft)" : "var(--rus)"}">${pct(m.ch.p)}</text>` : ""}
        <text x="${W}" y="${y + 4}" text-anchor="end" style="font-family:var(--font-data);font-size:12px;fill:var(--ink)">${fmtMeasure(m.c, m.bn, state.measure, diverging, false)}</text>
      </g>`;
    }).join("")}
  </svg>`;
  const tagNote = ts ? `<p class="rk-tags" role="status"><span>${t("Showing {n} countries tagged: {tags}.", { n: rows.length + party.length, tags: tagNames() })}</span> <button class="linkbtn tclear" data-tag-clear>${t("Clear tags")}</button></p>` : "";
  root.innerHTML = `<div class="view-inner">
    ${tagNote}<p class="rk-key"><span class="rk-k rk-k-sure"></span>${t("certain (≥95%)")} <span class="rk-k rk-k-lean"></span>${t("leaning (≥65%)")} <span class="rk-k rk-k-unc"></span>${t("uncertain")} · ${t("% = chance of the more likely direction")}</p>
    <div class="chart">${svg}</div>
    <p class="note-small">${t("Compressed scale: the axis labels give the true values.")}</p>
    ${party.length ? chipGroup(party, t("Party to the war (with Russia), not ranked:"), "party") : ""}
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
