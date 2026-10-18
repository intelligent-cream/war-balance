// ===== Views: how the map works (with worked examples), and doing more or less than expected =====
/* global state, DATA, byIso, calc, scaled, fmtMeasure, eur, rangeTxt, showTip, tip, select, waterfall, chip, MIN_GDP_RANK, FRAC, t, viewState, filtersHtml, wireFilters, eligible, periodText,
   num, fitName, activateOnKey, minGdp */

// ----- How it works -----
const EXAMPLES = ["DEU", "POL", "USA", "HUN", "IND", "CHN"];
let exampleIso = "DEU";

function howHtml() {
  const c = byIso[exampleIso];
  const y = state.year;
  const k = calc(c, y);
  const parts = k.shiftParts.concat(state.netBack ? k.backShift.map(p => ({ ...p, label: t("Flowing back: {part}", { part: LANG === "de" ? p.label : p.label[0].toLowerCase() + p.label.slice(1) }) })) : []);
  const live = parts.filter(p => Math.abs(p.v) > 1e-3);
  const top = live.slice().sort((a, b) => b.v - a.v);
  const pos = top.filter(p => p.v > 0).slice(0, 2), neg = top.filter(p => p.v < 0).slice(-2).reverse();
  // one whole sentence per direction: "Ukraine"/"Russia" alone would need a different case in many languages
  const story = t(k.shift >= 0 ? "{name}: {pct} of a year's GDP toward Ukraine. Biggest parts toward Ukraine: {pos}. Biggest toward Russia: {neg}." : "{name}: {pct} of a year's GDP toward Russia. Biggest parts toward Ukraine: {pos}. Biggest toward Russia: {neg}.", {
    name: c.name, pct: fmtMeasure(c, k.shift, "gdp", true),
    pos: pos.map(p => `${p.label} (${eur(p.v, true)})`).join(", ") || "–",
    neg: neg.map(p => `${p.label} (${eur(p.v, true)})`).join(", ") || "–",
  });
  return `<div class="view-inner how-view">
    <h2>${t("How this map is made")}</h2>
    <p class="sub">${t("Most trackers count one kind of money: aid pledged, or fossil fuel bought from Russia. This map puts every flow we can find on one scale, so that countries can be compared fairly.")}</p>
    <ol class="how-steps">
      <li><b>${t("More ways of helping Ukraine.")}</b> ${t("Not only government aid (Kiel Institute), but also the country's share of EU-level aid and of new IMF and World Bank lending, undisclosed military aid, private donations, hosting refugees (net of the taxes refugees pay) and buying more from Ukraine. Loans count at their value to Ukraine (what it saves against borrowing elsewhere), donated weapons at their market value.")}</li>
      <li><b>${t("Both sides of the ledger.")}</b> ${t("Payments to Russia for fuel, goods, services and weapons; Russian oil bought refined in other countries; goods re-exported to Russia through trade hubs, counted for the country that made them; shipping and insuring Russian oil; gold and hidden payment channels; payments for Russian nuclear projects and loans; exit payments of companies leaving Russia; profits of Russian-owned companies abroad; weapons and troops sent to Russia.")}</li>
      <li><b>${t("Money flowing back from Ukraine.")}</b> ${t("Aid spent with the donor's own industry, other countries' aid spent there, arms Ukraine bought there and extra sales to Ukraine are subtracted as the profit they bring (about 20%), because the goods still cost money to make.")}</li>
      <li><b>${t("Change since before the war, not totals.")}</b> ${t("Every flow is compared with what was expected without the war, in volumes at pre-war prices; the extra Russia earned from war-time fuel prices is counted as a separate part. The expected level starts from 2021 and follows the model that predicted past years best (tested on 2008, 2013 and 2016): exports to Russia and trade with Ukraine grow or shrink with the country's other trade and GDP, the rest stays at 2021. That prediction is never exact, so its tested error widens every range.")}</li>
      <li><b>${t("Counted where the money ends up.")}</b> ${t("Gas is counted where it is burned, not where it crosses a border; fuel resold by trading hubs for their customers; freight inside import values for the shipowners, not for Russia.")}</li>
      <li><b>${t("Fair across sizes.")}</b> ${t("The headline is the total since 2022 as a share of one year's GDP, so a small country that gave a lot is not hidden behind a big one that gave a little. Per person and total euros are one click away.")}</li>
      <li><b>${t("Nothing missing counts as zero.")}</b> ${t("Where data are missing, we estimate, with a wide likely range and a certainty letter (A reported to D rough indication). No country is rewarded for having no data.")}</li>
    </ol>
    <h3 class="how-h">${t("Worked example")}</h3>
    <div class="filters" role="group" aria-label="${t("Worked example")}">
      ${EXAMPLES.filter(i => byIso[i]).map(i => `<button class="chipbtn" data-example="${i}" aria-pressed="${i === exampleIso}">${byIso[i].name}</button>`).join("")}
    </div>
    <p class="sub" style="max-width:80ch">${story}</p>
    <div class="how-wf">${waterfall(parts, k.shift, t("Net shift"), k.shiftLo, k.shiftHi)}</div>
    <p class="note-small">${t("Each bar is one part; the pale band behind it is its likely range (about 90%). The net total is at the bottom. Click a part's source number in the country panel for where it comes from.")} <button class="chipbtn" id="how-open">${t("Open {name} on the map", { name: c.name })}</button></p>
    <h3 class="how-h">${t("What this map does not do")}</h3>
    <ul class="how-limits">
      <li>${t("It does not count political support, votes or sanctions as money.")}</li>
      <li>${t("It does not judge whether trade is legal; buying Russian oil within sanctions still sends money to Russia.")}</li>
      <li>${t("It has not yet been reviewed line by line by a person. Every figure links to its sources; corrections are welcome.")}</li>
    </ul>
    <p class="note-small"><a href="https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/README.md" target="_blank" rel="noopener">${t("Full documentation: the models, every part of the calculation, the sources and the known limits")}</a></p>
  </div>`;
}
function renderHow(root) {
  root.innerHTML = howHtml();
  root.querySelectorAll("[data-example]").forEach(b => (b.onclick = () => { exampleIso = b.dataset.example; renderHow(root); }));
  const open = root.querySelector("#how-open");
  if (open) open.onclick = () => { window.setView("map"); select(byIso[exampleIso].n, true); };
}

// ----- Doing more or less than expected (AI-guessed incentives) -----
// expected shift (% of a year's GDP) from two AI-guessed scores: direction away from Russia (0-10) and threat (0-100),
// by least squares over the economies on the ranking; shifts are clipped at ±30% so a few extremes don't set the line
function fitExpectation(rows) {
  const X = rows.map(r => [1, r.dir, r.thr]), Y = rows.map(r => Math.max(-30, Math.min(30, r.y)));
  const XtX = [0, 1, 2].map(i => [0, 1, 2].map(j => X.reduce((s, x) => s + x[i] * x[j], 0)));
  const XtY = [0, 1, 2].map(i => X.reduce((s, x, n) => s + x[i] * Y[n], 0));
  // solve the 3x3 system by Gaussian elimination
  const A = XtX.map((row, i) => [...row, XtY[i]]);
  for (let i = 0; i < 3; i++) {
    let p = i; for (let r = i + 1; r < 3; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    for (let r = 0; r < 3; r++) if (r !== i) { const f = A[r][i] / A[i][i]; for (let cc = i; cc < 4; cc++) A[r][cc] -= f * A[i][cc]; }
  }
  return [0, 1, 2].map(i => A[i][3] / A[i][i]);
}
// small economies have noisy trade data that dominate a ranking of differences, so only economies above €20bn
const EXPECT_MIN_GDP = 20;
function renderExpect(root) {
  const y = state.year;
  const rows = Object.values(DATA).filter(c => c.incentive && c.incentive.direction != null && c.gdp >= EXPECT_MIN_GDP && eligible(c)).map(c => {
    const k = calc(c, y);
    return { c, k, y: (k.shift / c.gdp) * 100, dir: c.incentive.direction, thr: c.incentive.threat };
  });
  const all = Object.values(DATA).filter(c => c.incentive && c.incentive.direction != null && c.gdp >= EXPECT_MIN_GDP)
    .map(c => ({ dir: c.incentive.direction, thr: c.incentive.threat, y: (calc(c, y).shift / c.gdp) * 100 }));
  const [a, b, g] = fitExpectation(all);
  rows.forEach(r => { r.exp = a + b * r.dir + g * r.thr; r.diff = r.y - r.exp; });
  rows.sort((p, q) => q.diff - p.diff);
  const n = Math.min(15, Math.floor(rows.length / 2));
  const best = rows.slice(0, n), worst = rows.slice(-n).reverse();
  const W = Math.min(1040, root.clientWidth - 32), narrowScreen = W < 600, labelW = narrowScreen ? 100 : 150, rowH = 24;
  const maxAbs = Math.max(...best.concat(worst).map(r => Math.abs(r.diff)), 1);
  // each list runs one way, so bars start at zero and show the size of the difference
  const x = d3.scaleLinear().domain([0, maxAbs]).range([labelW, W - 80]);
  const diffTxt = r => `${r.diff >= 0 ? "+" : "−"}${num(Math.abs(r.diff), 1)} ${t("pts")}`;
  // a group of row buttons, named by the heading above it
  const bars = (list, colour, title) => {
    const H = list.length * rowH + 8;
    return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${title}">${list.map((r, i) => {
      const yy = i * rowH + rowH / 2 + 4, x0 = x(0), x1 = x(Math.abs(r.diff));
      return `<g class="row" tabindex="0" role="button" data-n="${r.c.n}" aria-label="${r.c.name}: ${diffTxt(r)}">
        <rect class="hit" x="0" y="${yy - rowH / 2}" width="${W}" height="${rowH}" fill="transparent"/>
        <text class="lbl" x="${labelW - 10}" y="${yy + 4}" text-anchor="end">${fitName(r.c.name, narrowScreen ? 13 : 22)}<title>${r.c.name}</title></text>
        <rect x="${Math.min(x0, x1)}" y="${yy - 7}" width="${Math.max(2, Math.abs(x1 - x0))}" height="14" rx="3" fill="${colour}"/>
        <text x="${W}" y="${yy + 4}" text-anchor="end" style="font-family:var(--font-data);font-size:12px;fill:var(--ink)">${diffTxt(r)}</text>
      </g>`;
    }).join("")}<line class="zero" x1="${x(0)}" x2="${x(0)}" y1="0" y2="${H}"/></svg>`;
  };
  root.innerHTML = `<div class="view-inner">
    <h2>${t("Who went out of their way")}</h2>
    <div class="ai-note"><b>${t("AI guesses, no real data.")}</b> ${t("Each country's political distance from Russia (0–10) and how threatened it feels by Russia (0–100) were guessed by an AI, without sources. From those two guesses we fit what a country would be expected to shift, then show who did much more, or much less, than that. Treat it as a conversation starter, not a finding.")}</div>
    <p class="sub">${t("Actual shift minus expected shift, in percentage points of a year's GDP, {period}. Expected = {a} + {b} × direction + {g} × threat.", { period: periodText(), a: num(a, 1), b: num(b, 2), g: num(g, 3) })}</p>
    ${filtersHtml()}
    <h3 class="how-h">${t("Did more than their incentives predict")}</h3>
    <div class="chart">${bars(best, "var(--ukr)", t("Did more than their incentives predict"))}</div>
    <h3 class="how-h">${t("Did less than predicted, or helped Russia")}</h3>
    <div class="chart">${bars(worst, "var(--rus)", t("Did less than predicted, or helped Russia"))}</div>
    <p class="note-small">${t("Economies under {min} GDP are left out. The guesses for each country, with a one-line reason, are in the research files on GitHub.", { min: minGdp(EXPECT_MIN_GDP) })}</p>
  </div>`;
  const by = Object.fromEntries(rows.map(r => [r.c.n, r]));
  root.querySelectorAll(".row").forEach(el => {
    const r = by[el.dataset.n];
    el.addEventListener("pointermove", e => showTip(e, `<b>${r.c.name}</b>${t("Actual {act}, expected {exp} of a year's GDP", { act: (r.y >= 0 ? "+" : "−") + num(Math.abs(r.y), 1) + "%", exp: (r.exp >= 0 ? "+" : "−") + num(Math.abs(r.exp), 1) + "%" })}<br>${t("Direction {d}/10, threat {th}/100 (AI guess)", { d: num(r.dir, 1, 0), th: num(r.thr, 1, 0) })}<br><span style="opacity:.8" lang="en">${r.c.incentive.why || ""}</span>`));
    el.addEventListener("pointerleave", () => (tip.hidden = true));
    el.addEventListener("click", () => { tip.hidden = true; select(r.c.n, false); });
    activateOnKey(el, () => select(r.c.n, false));
  });
  wireFilters(root);
}

window.EXTRA_VIEWS = { how: renderHow, expect: renderExpect };
