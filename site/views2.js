// ===== Views: how the map works (with worked examples) =====
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
  // two numbers and their sum (round 13), then the biggest parts on each side
  const story = t("{name}: support for Ukraine {ua} and change in payments to Russia {ru} of one year's GDP; net {pct}. Biggest positive parts: {pos}. Biggest negative parts: {neg}.", {
    name: c.name, pct: fmtMeasure(c, k.shift, "gdp", true), ua: fmtMeasure(c, k.uaBal, "gdp", true), ru: fmtMeasure(c, k.rusBal, "gdp", true),
    pos: pos.map(p => `${p.label} (${eur(p.v, true)})`).join(", ") || "–",
    neg: neg.map(p => `${p.label} (${eur(p.v, true)})`).join(", ") || "–",
  });
  return `<div class="view-inner how-view">
    <h2>${t("How this map is made")}</h2>
    <p class="sub">${t("Most trackers count one kind of money: aid pledged, or fossil fuel bought from Russia. This map puts every flow we can find on one scale, so that countries can be compared fairly.")}</p>
    <ol class="how-steps">
      <li><b>${t("More ways of helping Ukraine.")}</b> ${t("Not only government aid (Kiel Institute), but also the country's share of EU-level aid and of new IMF and World Bank lending, undisclosed military aid, private donations, hosting refugees (net of the taxes refugees pay) and buying more from Ukraine. Loans count at their value to Ukraine (what it saves against borrowing elsewhere), donated weapons at their market value.")}</li>
      <li><b>${t("Both sides of the ledger.")}</b> ${t("Payments to Russia for fuel, goods, services and weapons; Russian oil bought refined in other countries; goods re-exported to Russia through trade hubs, counted for the country that made them; shipping and insuring Russian oil; gold and hidden payment channels; payments for Russian nuclear projects and loans; exit payments of companies leaving Russia; profits of Russian-owned companies abroad; weapons and troops sent to Russia.")}</li>
      <li><b>${t("Money flowing back from Ukraine.")}</b> ${t("Every euro that reached Ukraine is followed to the economy where it was spent: weapons, energy, relief and rebuilding, including stock bought to replace donated weapons. What a country earns this way is subtracted from what it gave.")}</li>
      <li><b>${t("One rule for every seller.")}</b> ${t("Aid counts in full: it is a gift. A sale is an exchange, so it counts at what the seller really gains: its taxes plus profit above a normal return. The same rule applies to every seller: Russia (about 60 cents per euro for oil and gas, 2 to 40 for other goods), Ukraine (4 to 18 cents), and everyone who sells to Russia or to Ukraine, ships Russian oil or supplies weapons (0 to 7 cents for most manufactured goods, from OECD industry accounts). A second factor keeps only the business that is genuinely extra. Migrants count only the pay above what the same work earns elsewhere, and only its war-driven change. Weapons Russia did not pay for count in full. The extra Russia earned from war-time fuel prices counts at Russia's net gain on that extra price, which is close to all of it.")}</li>
      <li><b>${t("Two numbers, and their sum.")}</b> ${t("Each country gets two numbers. Support for Ukraine: what it gave Ukraine and bought from it, minus what it earned back from the war effort. Change in payments to Russia: how much less (or more) it paid Russia and earned from it than expected without the war. That second number includes gas that Russia cut off itself and gas that stopped when Ukraine ended transit; the panel says how much. The map colours the sum. Earning more from the war effort than a country gave is not money toward Russia: such a country gets a gold outline, and is filled gold when that is what makes its total negative.")}</li>
      <li><b>${t("Change since before the war, not totals.")}</b> ${t("Every flow is compared with what was expected without the war, in volumes (fuel at the prices a no-war market expected, other goods at pre-war prices); the extra Russia earned from war-time fuel prices is counted as a separate part. The expected level starts from 2021 and follows the model that predicted past years best (tested on 2008, 2013 and 2016): exports to Russia grow or shrink with the country's other trade and GDP; the rest, including trade with Ukraine, stays at 2021. That prediction is never exact, so its tested error widens every range.")}</li>
      <li><b>${t("Counted where the money ends up.")}</b> ${t("Gas is counted where it is burned, not where it crosses a border; fuel resold by trading hubs for their customers; freight inside import values for the shipowners, not for Russia.")}</li>
      <li><b>${t("Fair across sizes.")}</b> ${t("The headline is the total for 2022 to August 2026 as a share of one year's GDP (2024), so a small country that gave a lot is not hidden behind a big one that gave a little. It is not a yearly rate: divide by about 4.7 for an average year. Per person and total euros are one click away.")}</li>
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

window.EXTRA_VIEWS = { ...(window.EXTRA_VIEWS || {}), how: renderHow };
