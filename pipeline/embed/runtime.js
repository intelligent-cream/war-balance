// Round 71 (owner: "I love the data embeds that show the map, the different charts and everything"): the runtime of the
// interactive embeds (/embed/<name>/, /<lang>/embed/<name>/), written by seo_embeds.mjs into site/embed/embed.js after the
// number formats of seo_i18n.mjs (WBF: P, E, PP, the same code the pages use, so an embed writes every figure as its page
// does). Each embed is a frame: a header (title, subtitle with unit and period, the War Balance mark), the chart, a source
// line with the data's date and a toolbar (about, download as CSV or PNG, share or embed, full screen). The data are
// /embed/data.json (seo_embeds.mjs embedData: every country's yearly support, trade and net from the map's calc(), the
// parts of its support, its population and GDP, its name in every language), the words the page's (CFG.s, from the
// phrase tables in seo_i18n.mjs). D3 v7 and topojson-client are self-hosted in /vendor/ and load only here.
/* global d3, topojson, WBF */
(function () {
  "use strict";
  const CFG = JSON.parse(document.getElementById("emb-cfg").textContent);
  const S = CFG.s, L = CFG.l, F = WBF;
  const $ = (sel, el = document) => el.querySelector(sel);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m, k) => (v[k] != null ? v[k] : m));
  const root = $("#emb"), main = $(".emb-main", root), MIN_GDP = 5, MAT = 0.0005;
  const cssv = n => getComputedStyle(root).getPropertyValue(n).trim();
  const narrow = () => root.clientWidth < 720;
  let D = null, C = [], byIso = {}, byNum = {};
  const hashState = (() => { const o = {}; for (const kv of location.hash.replace(/^#/, "").split("&")) { const [k, v] = kv.split("="); if (k) o[k] = decodeURIComponent(v || ""); } return o; })();
  const setHash = o => { const s = Object.entries(o).filter(([, v]) => v !== "" && v != null).map(([k, v]) => k + "=" + encodeURIComponent(v)).join("&"); try { history.replaceState(null, "", s ? "#" + s : location.pathname + location.search); } catch (e) { /* sandboxed */ } };

  // ----- numbers, as the pages write them -----
  const sg = v => (v >= 0 ? "+" : "−");
  const UNIT = {
    eur: { of: (c, v) => v, fmt: (v, signed) => (v == null ? S.na : (signed ? sg(v) : v < 0 && Math.abs(v) >= MAT ? "−" : "") + F.E(L, v)) },
    pp: { of: (c, v) => (c.p ? (v * 1000) / c.p : null), fmt: (v, signed) => (v == null ? S.na : (signed ? sg(v) : v <= -0.5 ? "−" : "") + F.PP(L, v)) },
    n: { of: (c, v) => v, fmt: v => (v == null ? S.na : String(Math.round(v))) },
    gdp: { of: (c, v) => (c.g ? (100 * v) / c.g : null), fmt: (v, signed) => (v == null ? S.na : (signed ? sg(v) : v < 0 && Math.abs(v) >= 0.01 ? "−" : "") + F.P(L, v)) },
  };
  const Q = { ua: 0, rus: 1, net: 2, fz: 3 };
  const QNAME = { ua: S.mUa, rus: S.mRus, net: S.mNet };
  const SIGNED = { ua: false, rus: true, net: true, fz: false };
  // a country's total of q from 2022 to the year index yi (the last index is its total, exactly the page's figure)
  const cum = (c, q, yi) => (yi >= D.years.length - 1 ? c.f[Q[q]] : c.y[Q[q]].slice(0, yi + 1).reduce((a, b) => a + b, 0));
  const yearOwn = (c, q, yi) => c.y[Q[q]][yi];
  const name = c => (D.nm[L] && D.nm[L][c.iso]) || D.nm.en[c.iso] || c.iso;
  const yLabel = yi => (D.ytd[yi] ? fill(S.ytd, { y: D.years[yi], month: CFG.month }) : String(D.years[yi]));
  const csvCell = v => (typeof v === "number" ? String(Math.round(v * 1e6) / 1e6) : /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
  const tone = (v, sure = true) => cssv(v >= 0 ? (sure ? "--ukr" : "--ukr-f") : sure ? "--rus" : "--rus-f");

  // ----- the frame: tooltip, popovers, toolbar -----
  const tip = document.createElement("div");
  tip.className = "emb-tip"; tip.hidden = true; tip.setAttribute("role", "status");
  root.appendChild(tip);
  const showTip = (e, html) => {
    tip.innerHTML = html; tip.hidden = false;
    const r = root.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX - r.left + 14, y = e.clientY - r.top + 14;
    if (x + w > r.width - 6) x = Math.max(6, e.clientX - r.left - w - 14);
    if (y + h > r.height - 6) y = Math.max(6, e.clientY - r.top - h - 14);
    tip.style.left = x + "px"; tip.style.top = y + "px";
  };
  const hideTip = () => { tip.hidden = true; };
  let view = null;   // the view shown: { csv(), svg(), name }
  const pop = $(".emb-pop", root);
  function openPop(kind, btn) {
    if (!pop.hidden && pop.dataset.kind === kind) { closePop(); return; }
    pop.dataset.kind = kind;
    if (kind === "info") pop.innerHTML = `<h3>${esc(S.about)}</h3><p>${esc(CFG.note)}</p><p class="emb-pv">${esc(S.preview)}</p><p><a href="${esc(CFG.method)}" target="_top">${esc(S.how)} →</a></p>`;
    if (kind === "dl") pop.innerHTML = `<h3>${esc(S.download)}</h3><p><button type="button" data-dl="csv">${esc(S.dlCsv)}</button> <button type="button" data-dl="png"${view && view.svg ? "" : " disabled"}>${esc(S.dlPng)}</button></p><p class="emb-pv">${esc(S.licence)}</p>`;
    if (kind === "share") {
      const url = CFG.self + location.hash, code = `<iframe src="${CFG.self}${location.hash}" title="${esc(CFG.title)}" width="100%" height="${Math.max(420, Math.round(root.offsetHeight))}" style="border:0" loading="lazy" allow="fullscreen; clipboard-write" allowfullscreen></iframe>`;
      pop.innerHTML = `<h3>${esc(S.share)}</h3><label>${esc(S.link)}<span class="emb-copy"><input type="text" readonly value="${esc(url)}"><button type="button" data-copy="0">${esc(S.copy)}</button></span></label>
<label>${esc(S.embed)}<span class="emb-copy"><textarea readonly rows="4">${esc(code)}</textarea><button type="button" data-copy="1">${esc(S.copy)}</button></span></label><p class="emb-pv">${esc(S.embedHelp)}</p>`;
    }
    pop.insertAdjacentHTML("afterbegin", `<button type="button" class="emb-x" aria-label="${esc(S.close)}">×</button>`);
    pop.hidden = false; pop.setAttribute("aria-label", btn.getAttribute("aria-label"));
    for (const b of root.querySelectorAll(".emb-tools button")) b.setAttribute("aria-expanded", String(b === btn));
    const f = pop.querySelector("button:not(.emb-x), input, a"); if (f) f.focus();
  }
  function closePop() { pop.hidden = true; pop.dataset.kind = ""; for (const b of root.querySelectorAll(".emb-tools button")) b.setAttribute("aria-expanded", "false"); }
  async function copy(text, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } t.remove();
    }
    if (ok) { const was = btn.textContent; btn.textContent = S.copied; setTimeout(() => (btn.textContent = was), 1400); }
  }
  pop.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.classList.contains("emb-x")) closePop();
    else if (b.dataset.copy != null) copy(pop.querySelectorAll("input, textarea")[+b.dataset.copy].value, b);
    else if (b.dataset.dl === "csv") downloadCsv();
    else if (b.dataset.dl === "png") downloadPng();
  });
  root.addEventListener("keydown", e => { if (e.key === "Escape") { closePop(); hideTip(); closeDrawer(); } });
  document.addEventListener("click", e => { if (!pop.hidden && !e.target.closest(".emb-pop, .emb-tools")) closePop(); });
  for (const b of root.querySelectorAll(".emb-tools button")) b.addEventListener("click", () => {
    const k = b.dataset.act;
    if (k === "full") {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (root.requestFullscreen) root.requestFullscreen().catch(() => window.open(CFG.self + location.hash, "_blank", "noopener"));
      else window.open(CFG.self + location.hash, "_blank", "noopener");
    } else openPop(k, b);
  });
  document.addEventListener("fullscreenchange", () => {
    const fb = $('[data-act="full"]', root), on = document.fullscreenElement === root;
    fb.setAttribute("aria-label", on ? S.exitFull : S.full); fb.title = on ? S.exitFull : S.full;
    root.classList.toggle("is-full", on); setTimeout(redraw, 60);
  });

  // ----- downloads -----
  const fileBase = () => "war-balance-" + CFG.name.replace(/\//g, "-") + (view && view.name ? "-" + view.name : "");
  function save(blob, file) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  function downloadCsv() {
    if (!view || !view.csv) return;
    const rows = view.csv(), meta = [["# " + CFG.title], ["# " + CFG.sub], ["# " + CFG.source + " · " + CFG.dated], ["# " + CFG.self]];
    save(new Blob(["﻿" + meta.concat(rows).map(r => r.map(csvCell).join(",")).join("\n") + "\n"], { type: "text/csv;charset=utf-8" }), fileBase() + ".csv");
  }
  let FONT_CSS = null;
  async function fontCss() {
    if (FONT_CSS != null) return FONT_CSS;
    const one = async (fam, file, w) => { try { const b = await (await fetch("/fonts/" + file)).blob(); const u = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); return `@font-face{font-family:"${fam}";src:url(${u}) format("woff2");font-weight:${w};font-stretch:75% 125%}`; } catch (e) { return ""; } };
    FONT_CSS = (await Promise.all([one("Archivo", "archivo-latin.woff2", "100 900"), one("Source Sans 3", "source-sans-3-latin.woff2", "200 900")])).join("");
    return FONT_CSS;
  }
  // the PNG: the chart's SVG with the frame's title, subtitle, mark and source line, drawn at twice its size
  async function downloadPng() {
    if (!view || !view.svg) return;
    const chart = view.svg(); if (!chart) return;
    const w = Math.max(560, +chart.getAttribute("width") || chart.getBoundingClientRect().width), ch = +chart.getAttribute("height") || chart.getBoundingClientRect().height;
    const pad = 20, titleH = 58, footH = 46, H = titleH + ch + footH, NS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("xmlns", NS); svg.setAttribute("width", w + 2 * pad); svg.setAttribute("height", H + pad);
    const css = await fontCss();
    const ink = cssv("--ink"), soft = cssv("--soft");
    svg.innerHTML = `<style>${css}text{font-family:"Source Sans 3",Arial,sans-serif}</style><rect width="100%" height="100%" fill="${cssv("--surface")}"/>
<text x="${pad}" y="${pad + 18}" font-family="Archivo,Arial,sans-serif" font-weight="800" font-size="18" fill="${ink}">${esc(CFG.title.length > 95 ? CFG.title.slice(0, 94) + "…" : CFG.title)}</text>
<text x="${pad}" y="${pad + 38}" font-size="13" fill="${soft}">${esc(CFG.sub + (view.subExtra ? " · " + view.subExtra : ""))}</text>
<g transform="translate(${w + pad - 120},${pad + 4})"><rect width="10" height="10" rx="2" fill="${cssv("--ukr")}"/><rect x="6" width="10" height="10" rx="2" fill="${cssv("--rus")}"/><text x="22" y="10" font-family="Archivo,Arial,sans-serif" font-weight="800" font-size="13" fill="${ink}">War Balance</text></g>
<text x="${pad}" y="${titleH + ch + 26}" font-size="11.5" fill="${soft}">${esc(CFG.source + " · " + CFG.dated)}</text>
<text x="${pad}" y="${titleH + ch + 42}" font-size="11.5" fill="${soft}">${esc(CFG.self.replace(/^https?:\/\//, ""))}</text>`;
    const g = document.createElementNS(NS, "g"); g.setAttribute("transform", `translate(${pad},${titleH})`);
    const cl = chart.cloneNode(true); cl.removeAttribute("class"); g.appendChild(cl); svg.appendChild(g);
    const src = new XMLSerializer().serializeToString(svg);
    const img = new Image(), url = URL.createObjectURL(new Blob([src], { type: "image/svg+xml;charset=utf-8" }));
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const k = 2, cv = document.createElement("canvas"); cv.width = (w + 2 * pad) * k; cv.height = (H + pad) * k;
    const ctx = cv.getContext("2d"); ctx.scale(k, k); ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url);
    await new Promise(r => cv.toBlob(b => { save(b, fileBase() + ".png"); r(); }, "image/png"));
  }

  // ----- the height, for the page that holds the frame -----
  let lastH = 0;
  const report = () => { const h = Math.ceil(root.getBoundingClientRect().height) + 2; if (Math.abs(h - lastH) > 1 && window.parent !== window) { lastH = h; window.parent.postMessage({ type: "wb-emb", h, name: CFG.name }, "*"); } };
  if (window.ResizeObserver) new ResizeObserver(report).observe(root);
  let rt = 0, lastW = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(root.clientWidth - lastW) > 4) redraw(); }, 120); });
  let redrawFn = () => {};
  function redraw() { lastW = root.clientWidth; hideTip(); redrawFn(); report(); }

  // ----- small builders -----
  const seg = (id, items, value, onChange, label) => {
    const el = document.createElement("div"); el.className = "emb-seg"; el.setAttribute("role", "radiogroup"); if (label) el.setAttribute("aria-label", label);
    el.innerHTML = items.map(([k, t]) => `<button type="button" role="radio" data-k="${k}" aria-checked="${k === value}">${esc(t)}</button>`).join("");
    el.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; for (const x of el.children) x.setAttribute("aria-checked", String(x === b)); onChange(b.dataset.k); });
    el.id = id; return el;
  };
  const select = (id, items, value, onChange, label) => {
    const el = document.createElement("select"); el.id = id; el.className = "emb-sel"; if (label) el.setAttribute("aria-label", label);
    el.innerHTML = items.map(([k, t]) => `<option value="${k}"${k === value ? " selected" : ""}>${esc(t)}</option>`).join("");
    el.addEventListener("change", () => onChange(el.value)); return el;
  };
  const controls = (...els) => { const d = document.createElement("div"); d.className = "emb-ctl"; for (const e of els) if (e) d.appendChild(e); return d; };
  const svgEl = (w, h) => d3.create("svg").attr("width", w).attr("height", h).attr("viewBox", `0 0 ${w} ${h}`).attr("font-family", '"Source Sans 3",Arial,sans-serif').attr("class", "emb-svg");
  const tickFmt = (unit, signed) => v => (Math.abs(v) < 1e-9 ? "0" : UNIT[unit].fmt(v, signed && v !== 0));
  // horizontal bars: rows { key, name, v, lo, hi, segs [{v, color, back}], color, label, tip }
  function hbars(rows, { width, unit, signed, labelW, onTip, rowH = 24 }) {
    const lw = labelW || Math.min(150, Math.max(84, width * 0.26)), vw = 74, w = width, top = 26, h = top + rows.length * rowH + 8;
    const lo = Math.min(0, ...rows.map(r => Math.min(r.v, r.lo ?? r.v))), hi = Math.max(0, ...rows.map(r => Math.max(r.v, r.hi ?? r.v, (r.segs || []).reduce((a, s) => a + (s.back ? 0 : s.v), 0))));
    const x = d3.scaleLinear().domain([lo, hi || 1]).nice(4).range([lw, w - vw]);
    const svg = svgEl(w, h), ink = cssv("--ink"), soft = cssv("--soft"), line = cssv("--line");
    const ax = svg.append("g").attr("font-size", 11).attr("fill", soft);
    for (const t of x.ticks(narrow() ? 3 : 5)) {
      ax.append("line").attr("x1", x(t)).attr("x2", x(t)).attr("y1", top - 4).attr("y2", h - 6).attr("stroke", t === 0 ? soft : line).attr("stroke-width", t === 0 ? 1.2 : 1);
      ax.append("text").attr("x", x(t)).attr("y", top - 9).attr("text-anchor", "middle").attr("fill", soft).text(tickFmt(unit, signed)(t));
    }
    const g = svg.append("g").selectAll("g").data(rows).join("g").attr("transform", (r, i) => `translate(0,${top + i * rowH})`).attr("class", "emb-row");
    g.append("rect").attr("x", 0).attr("width", w).attr("height", rowH).attr("fill", "transparent");
    g.append("text").attr("x", lw - 8).attr("y", rowH / 2 + 4).attr("text-anchor", "end").attr("font-size", 12.5).attr("fill", ink).text(r => (r.name.length > 22 ? r.name.slice(0, 21) + "…" : r.name));
    const bh = rowH - 8;
    g.each(function (r) {
      const gg = d3.select(this);
      if (r.segs && r.segs.length) {
        let run = 0;
        for (const s of r.segs) {
          if (s.back) continue;
          gg.append("rect").attr("x", x(run)).attr("y", 4).attr("height", bh).attr("width", Math.max(0, x(run + s.v) - x(run))).attr("fill", s.color);
          run += s.v;
        }
        const back = r.segs.find(s => s.back);
        if (back) gg.append("rect").attr("x", x(run + back.v)).attr("y", 4).attr("height", bh).attr("width", Math.max(0, x(run) - x(run + back.v))).attr("fill", "url(#emb-stripe)");
      } else {
        const a = x(Math.min(0, r.v)), b = x(Math.max(0, r.v));
        gg.append("rect").attr("x", a).attr("y", 4).attr("height", bh).attr("width", Math.max(r.v === 0 ? 0 : 1.5, b - a)).attr("rx", 2).attr("fill", r.color || tone(r.v));
      }
      if (r.lo != null && r.hi != null) gg.append("line").attr("x1", x(r.lo)).attr("x2", x(r.hi)).attr("y1", rowH / 2).attr("y2", rowH / 2).attr("stroke", ink).attr("stroke-width", 1.3).attr("opacity", 0.75);
      const pos = (r.segs || []).reduce((a, q) => a + (q.back ? 0 : q.v), 0);
      const end = r.v >= 0 ? Math.max(x(r.v), x(pos), r.hi != null ? x(r.hi) : 0) : x(0);
      gg.append("text").attr("x", Math.min(w - 2, end + 5)).attr("y", rowH / 2 + 4).attr("font-size", 12).attr("font-weight", 700).attr("fill", ink).attr("text-anchor", end + 5 > w - vw + 60 ? "end" : "start").text(r.label);
    });
    const defs = svg.append("defs"), p = defs.append("pattern").attr("id", "emb-stripe").attr("width", 6).attr("height", 6).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
    p.append("rect").attr("width", 6).attr("height", 6).attr("fill", cssv("--surface")); p.append("rect").attr("width", 2.6).attr("height", 6).attr("fill", soft);
    if (onTip) g.on("pointermove", (e, r) => showTip(e, onTip(r))).on("pointerleave", hideTip).on("click", (e, r) => showTip(e, onTip(r)));
    return svg.node();
  }
  // lines over the years: series { key, name, color, vals [v per year], dash }
  function lines(series, { width, height, unit, signed, onTip, labels = null, fmt = null }) {
    const m = { t: 14, r: narrow() ? 14 : 24, b: 28, l: narrow() ? 58 : 74 }, w = width, h = height;
    const XL = labels || D.years.map((y, i) => (D.ytd[i] ? y + "*" : String(y)));
    const xs = d3.scalePoint().domain(XL.map((y, i) => i)).range([m.l, w - m.r]).padding(0.15);
    const all = series.flatMap(s => s.vals).filter(v => v != null);
    const y = d3.scaleLinear().domain([Math.min(0, ...all), Math.max(0, ...all) || 1]).nice(5).range([h - m.b, m.t]);
    const svg = svgEl(w, h), soft = cssv("--soft"), line = cssv("--line");
    const ax = svg.append("g").attr("font-size", 11);
    for (const t of y.ticks(5)) {
      ax.append("line").attr("x1", m.l).attr("x2", w - m.r).attr("y1", y(t)).attr("y2", y(t)).attr("stroke", t === 0 ? soft : line).attr("stroke-width", t === 0 ? 1.2 : 1);
      ax.append("text").attr("x", m.l - 6).attr("y", y(t) + 4).attr("text-anchor", "end").attr("fill", soft).text(fmt ? fmt(t) : tickFmt(unit, signed)(t));
    }
    // as many labels as fit (a long series every few points), the last one only where it does not run into the one before
    const longest = Math.max(...XL.map(x => String(x).length)), fit = Math.max(2, Math.floor((w - m.l - m.r) / (longest * 7 + 14)));
    const every = Math.max(1, Math.ceil(XL.length / fit)), last = XL.length - 1;
    XL.forEach((yr, i) => { if (i % every === 0 && (i === last || last - i >= every / 2 || every === 1)) ax.append("text").attr("x", xs(i)).attr("y", h - 8).attr("text-anchor", "middle").attr("fill", soft).text(yr); });
    const ln = d3.line().defined(v => v != null).x((v, i) => xs(i)).y(v => y(v));
    const g = svg.append("g");
    for (const s of series) {
      g.append("path").attr("d", ln(s.vals)).attr("fill", "none").attr("stroke", s.color).attr("stroke-width", s.bold ? 3 : 2.2).attr("stroke-dasharray", s.dash || null).attr("stroke-linejoin", "round");
      g.append("g").selectAll("circle").data(s.vals.map((v, i) => [v, i]).filter(d => d[0] != null)).join("circle").attr("cx", d => xs(d[1])).attr("cy", d => y(d[0])).attr("r", 3.2).attr("fill", s.color);
    }
    const rule = svg.append("line").attr("y1", m.t).attr("y2", h - m.b).attr("stroke", soft).attr("stroke-dasharray", "3 3").attr("opacity", 0);
    const hit = svg.append("rect").attr("x", m.l).attr("y", m.t).attr("width", w - m.l - m.r).attr("height", h - m.t - m.b).attr("fill", "transparent");
    const near = e => { const px = d3.pointer(e)[0]; let bi = 0, bd = 1e9; XL.forEach((yr, i) => { const d = Math.abs(xs(i) - px); if (d < bd) { bd = d; bi = i; } }); return bi; };
    if (onTip) hit.on("pointermove", e => { const i = near(e); rule.attr("x1", xs(i)).attr("x2", xs(i)).attr("opacity", 1); showTip(e, onTip(i)); })
      .on("pointerleave", () => { rule.attr("opacity", 0); hideTip(); });
    return { node: svg.node(), x: xs, y };
  }
  const legendHtml = items => `<ul class="emb-key">${items.map(k => `<li><i style="background:${k.color}"${k.cls ? ` class="${k.cls}"` : ""}></i>${esc(k.text)}</li>`).join("")}</ul>`;
  const tipRows = (title, rows) => `<b>${esc(title)}</b><table>${rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table>`;
  const PALETTE = () => ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6", "--c7", "--c8", "--c9", "--c10"].map(cssv);
  const partTone = () => [cssv("--t-aid"), cssv("--t-eu"), cssv("--t-ref"), cssv("--t-other")];
  // a country's support in its parts, scaled (null when a part is under zero: one bar)
  const partsOf = (c, k) => {
    const [aid, eu, ref] = c.pa, ua = c.f[0], other = ua - aid - eu - ref, T = partTone();
    if ([aid, eu, ref].some(v => v < -1e-9)) return null;
    return [aid, eu, ref, other].map((v, i) => (i === 3 && v < 0 ? { v: v * k, back: true } : { v: Math.max(0, v) * k, color: T[i] }));
  };
  const partsTip = (c, unit) => { const [aid, eu, ref] = c.pa, other = c.f[0] - aid - eu - ref, u = v => UNIT[unit].fmt(UNIT[unit].of(c, v), false);
    return [[S.kAid, u(aid)], [S.kEu, u(eu)], [S.kRef, u(ref)], [S.kOther, (other < 0 ? "−" : "") + u(Math.abs(other))], [S.mUa, u(c.f[0])]]; };
  const unitSub = unit => ({ eur: S.unitEur, pp: S.unitPp, gdp: S.unitPct })[unit];

  // ===== the data explorer =====
  function explorer() {
    const st = { tab: hashState.tab || "map", q: hashState.m || "net", unit: hashState.u || "gdp", yi: D.years.length - 1, sort: hashState.s || "value", dir: hashState.d || "desc", sel: null };
    if (!QNAME[st.q]) st.q = "net"; if (!UNIT[st.unit]) st.unit = "gdp"; if (!["table", "map", "line", "bar"].includes(st.tab)) st.tab = "map";
    if (hashState.y && D.years.indexOf(+hashState.y) >= 0) st.yi = D.years.indexOf(+hashState.y);
    const ranked = C.filter(c => !c.pt && !c.nd);
    const big = ranked.filter(c => c.g >= MIN_GDP);
    const defaultSel = big.slice().sort((a, b) => b.f[0] - a.f[0]).slice(0, 10).map(c => c.iso);
    st.sel = new Set(hashState.c === "all" ? ranked.map(c => c.iso) : hashState.c ? hashState.c.split(",").filter(i => byIso[i]) : defaultSel);
    const save = () => setHash({ tab: st.tab, m: st.q, u: st.unit, y: st.yi === D.years.length - 1 ? "" : D.years[st.yi], s: st.sort === "value" ? "" : st.sort, d: st.dir === "desc" ? "" : st.dir, c: st.sel.size > 60 && st.sel.size >= ranked.length ? "all" : [...st.sel].join(",") });
    const val = (c, yi = st.yi, q = st.q, unit = st.unit) => (c.nd ? null : UNIT[unit].of(c, cum(c, q, yi)));
    const fv = (v, q = st.q) => UNIT[st.unit].fmt(v, SIGNED[q]);
    const colorOf = new Map();
    const pal = PALETTE();
    const colorFor = iso => { if (!colorOf.has(iso)) { const used = new Set(colorOf.values()); colorOf.set(iso, pal.find(p => !used.has(p)) || pal[colorOf.size % pal.length]); } return colorOf.get(iso); };
    main.innerHTML = `<div class="ex">
<aside class="ex-side" id="ex-side" aria-label="${esc(S.countries)}">
  <div class="ex-head"><p class="ex-brand">${esc(S.explorer)}</p><button type="button" class="ex-close" aria-label="${esc(S.close)}">×</button></div>
  <div class="ex-sort"><label for="ex-sortby">${esc(S.sortBy)}</label><select id="ex-sortby" class="emb-sel"><option value="value">${esc(S.sValue)}</option><option value="name">${esc(S.sName)}</option></select><button type="button" class="ex-dir" aria-label="${esc(S.order)}" title="${esc(S.order)}">↓</button></div>
  <input type="search" class="ex-find" placeholder="${esc(S.search)}" aria-label="${esc(S.search)}">
  <ul class="ex-list" role="list"></ul>
  <div class="ex-all"><button type="button" data-a="all">+ ${esc(S.selectAll)}</button><button type="button" data-a="none">× ${esc(S.clear)}</button></div>
</aside>
<div class="ex-main">
  <div class="ex-tabs" role="tablist" aria-label="${esc(S.view)}">${[["table", S.tabTable, "M3 4h18v16H3zM3 9h18M3 14h18M9 4v16"], ["map", S.tabMap, "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"], ["line", S.tabLine, "M3 17l6-6 4 4 8-8"], ["bar", S.tabBar, "M5 20V10M10 20V4M15 20v-7M20 20v-11"]].map(([k, t, d]) => `<button type="button" role="tab" id="tab-${k}" data-tab="${k}" aria-selected="${k === st.tab}" aria-controls="ex-view"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>${esc(t)}</button>`).join("")}
  <button type="button" class="ex-open" aria-controls="ex-side" aria-expanded="false">${esc(S.countries)} <span class="ex-n"></span></button></div>
  <div class="ex-bar"></div>
  <div class="ex-view" id="ex-view" role="tabpanel"></div>
  <div class="ex-legend"></div>
  <div class="ex-time"><button type="button" class="ex-play" aria-label="${esc(S.play)}" title="${esc(S.play)}"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg></button>
    <span class="ex-y0">2022</span><input type="range" class="ex-slider" min="0" max="${D.years.length - 1}" step="1" value="${st.yi}" aria-label="${esc(S.year)}" list="ex-ticks"><span class="ex-y1"></span>
    <datalist id="ex-ticks">${D.years.map((y, i) => `<option value="${i}" label="${y}"></option>`).join("")}</datalist></div>
</div></div>`;
    const side = $(".ex-side", main), list = $(".ex-list", side), view = $(".ex-view", main), legend = $(".ex-legend", main), bar = $(".ex-bar", main), slider = $(".ex-slider", main);
    bar.appendChild(controls(select("ex-measure", [["net", S.mNet], ["ua", S.mUa], ["rus", S.mRus]], st.q, v => { st.q = v; update(); }, S.measure),
      seg("ex-unit", [["eur", S.uEur], ["pp", S.uPp], ["gdp", S.uGdp]], st.unit, v => { st.unit = v; update(); }, S.unit)));
    $("#ex-sortby", side).value = st.sort;
    $("#ex-sortby", side).addEventListener("change", e => { st.sort = e.target.value; st.dir = st.sort === "name" ? "asc" : "desc"; drawList(); save(); });
    $(".ex-dir", side).addEventListener("click", () => { st.dir = st.dir === "desc" ? "asc" : "desc"; drawList(); save(); });
    $(".ex-find", side).addEventListener("input", drawList);
    $(".ex-all", side).addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.a === "all") for (const c of C) st.sel.add(c.iso); else st.sel.clear(); drawList(); update(); });
    list.addEventListener("change", e => { const i = e.target.dataset.iso; if (!i) return; if (e.target.checked) st.sel.add(i); else st.sel.delete(i); update(false); markList(); });
    const openBtn = $(".ex-open", main);
    openBtn.addEventListener("click", () => { side.classList.add("open"); openBtn.setAttribute("aria-expanded", "true"); $(".ex-find", side).focus(); });
    $(".ex-close", side).addEventListener("click", closeDrawer);
    for (const b of main.querySelectorAll("[data-tab]")) b.addEventListener("click", () => { st.tab = b.dataset.tab; for (const x of main.querySelectorAll("[data-tab]")) x.setAttribute("aria-selected", String(x === b)); update(); });
    $(".ex-tabs", main).addEventListener("keydown", e => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return; const tabs = [...main.querySelectorAll("[data-tab]")], i = tabs.findIndex(t => t.dataset.tab === st.tab);
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]; n.click(); n.focus();
    });
    slider.addEventListener("input", () => { st.yi = +slider.value; stop(); update(false); });
    let timer = null;
    const play = $(".ex-play", main);
    const stop = () => { if (timer) { clearInterval(timer); timer = null; play.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>'; play.setAttribute("aria-label", S.play); play.title = S.play; root.classList.remove("playing"); } };
    play.addEventListener("click", () => {
      if (timer) { stop(); return; }
      if (st.yi >= D.years.length - 1) st.yi = 0; else st.yi++;
      slider.value = st.yi; update(false);
      play.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>'; play.setAttribute("aria-label", S.pause); play.title = S.pause; root.classList.add("playing");
      timer = setInterval(() => { if (st.yi >= D.years.length - 1) { stop(); return; } st.yi++; slider.value = st.yi; update(false); }, 1100);
    });
    function sorted() {
      const k = st.sort === "name" ? (a, b) => name(a).localeCompare(name(b), L) : (a, b) => (val(b) ?? -Infinity) - (val(a) ?? -Infinity) || name(a).localeCompare(name(b), L);
      const r = C.slice().sort(k); return st.dir === (st.sort === "name" ? "asc" : "desc") ? r : r.reverse();
    }
    function drawList() {
      const q = $(".ex-find", side).value.trim().toLowerCase();
      $(".ex-dir", side).textContent = st.dir === "desc" ? "↓" : "↑";
      list.innerHTML = sorted().filter(c => !q || name(c).toLowerCase().includes(q)).map(c => `<li><label><input type="checkbox" data-iso="${c.iso}"${st.sel.has(c.iso) ? " checked" : ""}><span class="ex-nm">${esc(name(c))}</span><span class="ex-v">${esc(c.nd ? S.noData : fv(val(c)))}</span></label></li>`).join("");
      markList();
    }
    function markList() {
      for (const i of list.querySelectorAll("input")) { const on = st.sel.has(i.dataset.iso); i.checked = on; i.closest("li").classList.toggle("on", on); const sw = i.closest("li"); sw.style.setProperty("--sw", on ? colorFor(i.dataset.iso) : "transparent"); }
      $(".ex-n", main).textContent = "(" + st.sel.size + ")";
    }
    const selRows = () => C.filter(c => st.sel.has(c.iso));
    // the map
    let world = null, feats = null, mapSvg = null, zoom = null, mapG = null, path = null;
    async function loadWorld() {
      if (world) return;
      const file = narrow() || matchMedia("(pointer: coarse)").matches ? "/countries-lite.json" : "/countries-50m.json";
      world = await (await fetch(file)).json();
      feats = topojson.feature(world, world.objects.countries).features.filter(f => f.id !== "010");
    }
    const dataOf = f => byNum[f.id] || byNum[D.inc[f.id]] || null;
    function scaleFor() {
      // one scale for every year, so the colours stay put while the years play: the largest size at the data's end
      const vs = C.filter(c => !c.nd && !c.pt).map(c => Math.abs(val(c, D.years.length - 1) ?? 0)).sort((a, b) => b - a);
      const M = vs[Math.min(vs.length - 1, 2)] || 1;   // the third largest, so one country does not wash out the rest
      const ip = d3.interpolateRgbBasis([cssv("--rus-d"), cssv("--rus"), cssv("--rus-l"), cssv("--zero"), cssv("--ukr-l"), cssv("--ukr"), cssv("--ukr-d")]);
      return { M, s: d3.scaleDivergingSqrt(ip).domain([-M, 0, M]).clamp(true) };
    }
    async function drawMap() {
      view.innerHTML = `<p class="emb-load">${esc(S.loading)}</p>`;
      await loadWorld();
      if (st.tab !== "map") return;
      const w = view.clientWidth || 600, h = narrow() ? Math.max(170, Math.round(w * 0.52)) : Math.max(260, Math.min(470, Math.round(w * 0.5)));
      const proj = d3.geoEqualEarth().fitExtent([[4, 4], [w - 4, h - 4]], { type: "FeatureCollection", features: feats });
      path = d3.geoPath(proj);
      // the map is clipped to its own frame: zoomed in, it must not draw over the header or the country list
      const svg = svgEl(w, h).style("overflow", "hidden"); mapSvg = svg;
      svg.append("clipPath").attr("id", "emb-map-clip").append("rect").attr("width", w).attr("height", h);
      svg.append("defs").append("pattern").attr("id", "emb-hatch").attr("width", 5).attr("height", 5).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)")
        .call(p => { p.append("rect").attr("width", 5).attr("height", 5).attr("fill", cssv("--nodata")); p.append("rect").attr("width", 1.4).attr("height", 5).attr("fill", cssv("--line")); });
      svg.append("rect").attr("width", w).attr("height", h).attr("fill", cssv("--sea"));
      mapG = svg.append("g").attr("clip-path", "url(#emb-map-clip)").append("g");
      mapG.selectAll("path").data(feats).join("path").attr("d", path).attr("class", "ex-c").attr("stroke", cssv("--edge")).attr("stroke-width", 0.4).attr("vector-effect", "non-scaling-stroke")
        .on("pointermove", (e, f) => showTip(e, mapTip(f))).on("pointerleave", hideTip)
        .on("click", (e, f) => { const c = dataOf(f); if (c && !narrow()) { if (st.sel.has(c.iso)) st.sel.delete(c.iso); else st.sel.add(c.iso); markList(); colorMap(); save(); } else showTip(e, mapTip(f)); });
      // one finger scrolls the page (two pinch or drag the map); the wheel scrolls the page too (the buttons zoom)
      zoom = d3.zoom().scaleExtent([1, 8]).translateExtent([[0, 0], [w, h]]).filter(e => (!e.touches || e.touches.length > 1) && !e.button).on("zoom", e => mapG.attr("transform", e.transform));
      svg.call(zoom).on("wheel.zoom", null).style("touch-action", "pan-y pinch-zoom");
      view.innerHTML = ""; view.appendChild(svg.node());
      const zb = document.createElement("div"); zb.className = "ex-zoom";
      zb.innerHTML = `<button type="button" data-z="in" aria-label="${esc(S.zoomIn)}" title="${esc(S.zoomIn)}">+</button><button type="button" data-z="out" aria-label="${esc(S.zoomOut)}" title="${esc(S.zoomOut)}">−</button><button type="button" data-z="reset" aria-label="${esc(S.reset)}" title="${esc(S.reset)}">⟲</button>`;
      zb.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; const z = b.dataset.z; if (z === "reset") svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity); else svg.transition().duration(250).call(zoom.scaleBy, z === "in" ? 1.6 : 1 / 1.6); });
      view.appendChild(zb);
      colorMap();
    }
    function mapTip(f) {
      if (f.id === "804") return `<b>${esc(S.ukraine)}</b>`;
      if (f.id === "643") return `<b>${esc(S.russia)}</b>`;
      const c = dataOf(f);
      if (!c) return `<b>${esc(f.properties && f.properties.name || "")}</b><br>${esc(S.noData)}`;
      const nm = byNum[f.id] ? name(c) : `${f.properties.name} → ${name(c)}`;
      if (c.nd) return `<b>${esc(nm)}</b><br>${esc(S.noData)}`;
      return tipRows(nm + (c.pt ? " · " + S.partyShort : ""), [["ua", S.mUa], ["rus", S.mRus], ["net", S.mNet]].map(([q, t]) => [t, fv(val(c, st.yi, q), q)]).concat([[S.period, yLabel(st.yi).replace(/^/, "2022–")]]));
    }
    function colorMap() {
      if (!mapG) return;
      const { s } = scaleFor();
      mapG.selectAll("path.ex-c").attr("fill", f => { if (f.id === "804" || f.id === "643") return cssv("--target"); const c = dataOf(f); if (!c || c.nd) return "url(#emb-hatch)"; const v = val(c); return v == null ? "url(#emb-hatch)" : s(v); })
        .attr("stroke", f => { const c = dataOf(f); return c && st.sel.has(c.iso) && byNum[f.id] ? cssv("--ink") : cssv("--edge"); })
        .attr("stroke-width", f => { const c = dataOf(f); return c && st.sel.has(c.iso) && byNum[f.id] ? 1.3 : 0.4; });
      const { M } = scaleFor(), sc = scaleFor().s, n = 9, stops = d3.range(n).map(i => -M + (2 * M * i) / (n - 1));
      legend.innerHTML = `<div class="ex-grad"><span class="ex-nd"><i></i>${esc(S.noData)}</span><div class="ex-ramp"><div class="ex-bar-g" style="background:linear-gradient(90deg,${stops.map(v => sc(v)).join(",")})"></div><div class="ex-ticks">${[-M, -M / 4, 0, M / 4, M].map((v, i) => `<span>${i === 0 ? "≤\u2009" : i === 4 ? "≥\u2009" : ""}${esc(Math.abs(v) < 1e-12 ? "0" : fv(v, "net"))}</span>`).join("")}</div></div></div><p class="ex-note">${esc(S.legend)}</p>`;
    }
    function drawTable() {
      const rows = selRows().length ? selRows() : C.filter(c => !c.nd);
      const cols = [["name", S.country], ["ua", S.mUa], ["rus", S.mRus], ["net", S.mNet]];
      st.tsort = st.tsort || st.q; st.tdir = st.tdir || "desc";
      const key = st.tsort, kf = key === "name" ? (a, b) => name(a).localeCompare(name(b), L) : (a, b) => (val(b, st.yi, key) ?? -Infinity) - (val(a, st.yi, key) ?? -Infinity);
      const r = rows.slice().sort(kf); if (st.tdir === "asc") r.reverse();
      view.innerHTML = `<div class="ex-tbl"><table><thead><tr>${cols.map(([k, t]) => `<th class="${k === "name" ? "" : "n"}${k === st.q ? " cur" : ""}" aria-sort="${k === key ? (st.tdir === "desc" ? "descending" : "ascending") : "none"}"><button type="button" data-k="${k}">${esc(t)}<span aria-hidden="true">${k === key ? (st.tdir === "desc" ? " ↓" : " ↑") : " ↕"}</span></button></th>`).join("")}</tr></thead>
<tbody>${r.map(c => `<tr><td><i class="ex-dot" style="background:${st.sel.has(c.iso) ? colorFor(c.iso) : "transparent"}"></i>${esc(name(c))}${c.pt ? ` <span class="ex-tag">${esc(S.partyShort)}</span>` : ""}</td>${["ua", "rus", "net"].map(q => { const v = val(c, st.yi, q); return `<td class="n${q === st.q ? " cur" : ""}"${v == null ? "" : ` style="color:${q === "ua" && v >= 0 ? "inherit" : tone(v)}"`}>${esc(c.nd ? S.noData : fv(v, q))}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
      view.querySelector("thead").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; if (st.tsort === b.dataset.k) st.tdir = st.tdir === "desc" ? "asc" : "desc"; else { st.tsort = b.dataset.k; st.tdir = b.dataset.k === "name" ? "asc" : "desc"; } drawTable(); });
      legend.innerHTML = `<p class="ex-note">${esc(S.legend)}</p>`;
    }
    function drawLine() {
      const rows = selRows().filter(c => !c.nd);
      if (!rows.length) { view.innerHTML = `<p class="emb-empty">${esc(S.pick)}</p>`; legend.innerHTML = ""; return; }
      const w = view.clientWidth || 600, h = Math.max(240, Math.min(420, Math.round(w * 0.52)));
      const series = rows.map(c => ({ key: c.iso, name: name(c), color: colorFor(c.iso), vals: D.years.map((y, i) => val(c, i)) }));
      const out = lines(series, { width: w, height: h, unit: st.unit, signed: SIGNED[st.q], onTip: i => tipRows(`2022–${yLabel(i)}`, series.slice().sort((a, b) => (b.vals[i] ?? 0) - (a.vals[i] ?? 0)).map(s => [s.name, fv(s.vals[i])])) });
      d3.select(out.node).append("line").attr("x1", out.x(st.yi)).attr("x2", out.x(st.yi)).attr("y1", 10).attr("y2", h - 28).attr("stroke", cssv("--ink")).attr("stroke-width", 1).attr("opacity", 0.35);
      view.innerHTML = ""; view.appendChild(out.node);
      legend.innerHTML = legendHtml(series.map(s => ({ color: s.color, text: s.name }))) + `<p class="ex-note">${esc(S.cumNote)}</p>`;
    }
    function drawBar() {
      const rows = selRows().filter(c => !c.nd).map(c => ({ c, v: val(c) })).filter(r => r.v != null).sort((a, b) => b.v - a.v);
      if (!rows.length) { view.innerHTML = `<p class="emb-empty">${esc(S.pick)}</p>`; legend.innerHTML = ""; return; }
      const w = view.clientWidth || 600;
      const node = hbars(rows.map(({ c, v }) => ({ key: c.iso, name: name(c), v, label: fv(v), color: st.q === "ua" && v >= 0 ? cssv("--ukr") : tone(v) })), { width: w, unit: st.unit, signed: SIGNED[st.q],
        onTip: r => tipRows(r.name, [["ua", S.mUa], ["rus", S.mRus], ["net", S.mNet]].map(([q, t]) => [t, fv(val(byIso[r.key], st.yi, q), q)])) });
      view.innerHTML = ""; view.appendChild(node);
      legend.innerHTML = `<p class="ex-note">${esc(S.legend)}</p>`;
    }
    function update(full = true) {
      $(".ex-y1", main).textContent = yLabel(st.yi);
      slider.setAttribute("aria-valuetext", "2022–" + yLabel(st.yi));
      root.dataset.tab = st.tab;
      const sub = `${QNAME[st.q]} · ${unitSub(st.unit)} · 2022–${yLabel(st.yi)}`;
      $(".emb-sub", root).textContent = sub;
      if (full) drawList(); else for (const li of list.querySelectorAll("li")) { const c = byIso[li.querySelector("input").dataset.iso]; li.querySelector(".ex-v").textContent = c.nd ? S.noData : fv(val(c)); }
      if (st.tab === "map") { if (mapG && !full && view.querySelector("svg")) colorMap(); else drawMap(); }
      else if (st.tab === "table") drawTable(); else if (st.tab === "line") drawLine(); else drawBar();
      save();
    }
    view.svgOf = () => view.querySelector("svg");
    setView({
      get name() { return st.tab; }, get subExtra() { return ""; },
      svg: () => (st.tab === "table" ? tableSvg() : view.querySelector("svg.emb-svg")),
      csv: () => {
        const rows = st.tab === "map" ? C : selRows();
        return [[S.country, "ISO3", S.period, S.mUa, S.mRus, S.mNet, "unit"]].concat(rows.map(c => [name(c), c.iso, "2022–" + yLabel(st.yi), ...["ua", "rus", "net"].map(q => (c.nd ? "" : val(c, st.yi, q) ?? "")), st.unit === "eur" ? "EUR bn" : st.unit === "pp" ? "EUR per person" : "% of GDP"]));
      },
    });
    function tableSvg() {
      const rows = [...view.querySelectorAll("tbody tr")].slice(0, 40).map(tr => [...tr.children].map(td => td.textContent));
      const w = Math.max(560, view.clientWidth), rh = 22, h = 28 + rows.length * rh, svg = svgEl(w, h), ink = cssv("--ink"), soft = cssv("--soft");
      const xs = [8, w * 0.42, w * 0.62, w * 0.82].map((x, i) => (i ? x + w * 0.16 : x));
      [S.country, S.mUa, S.mRus, S.mNet].forEach((t, i) => svg.append("text").attr("x", xs[i]).attr("y", 16).attr("text-anchor", i ? "end" : "start").attr("font-size", 11.5).attr("font-weight", 700).attr("fill", soft).text(t));
      rows.forEach((r, j) => { r.forEach((t, i) => svg.append("text").attr("x", xs[i]).attr("y", 40 + j * rh).attr("text-anchor", i ? "end" : "start").attr("font-size", 12.5).attr("fill", ink).text(t)); svg.append("line").attr("x1", 0).attr("x2", w).attr("y1", 46 + j * rh).attr("y2", 46 + j * rh).attr("stroke", cssv("--line")); });
      return svg.node();
    }
    redrawFn = () => { if (st.tab === "map") drawMap(); else update(false); };
    update();
  }
  function closeDrawer() { const s = $(".ex-side", root); if (s && s.classList.contains("open")) { s.classList.remove("open"); const b = $(".ex-open", root); if (b) { b.setAttribute("aria-expanded", "false"); b.focus(); } } }

  // ===== support by country: stacked bars of its parts =====
  function stacked() {
    const st = { unit: hashState.u || "eur", all: hashState.all === "1" };
    if (!UNIT[st.unit]) st.unit = "eur";
    const T = partTone();
    main.innerHTML = `<div class="emb-ctlrow"></div><div class="emb-chart"></div><div class="emb-keyrow"></div><p class="emb-more"><button type="button" class="emb-link"></button></p>`;
    $(".emb-ctlrow", main).appendChild(controls(seg("st-unit", [["eur", S.uEur], ["gdp", S.uGdp], ["pp", S.uPp]], st.unit, v => { st.unit = v; draw(); }, S.unit)));
    $(".emb-more button", main).addEventListener("click", () => { st.all = !st.all; draw(); });
    let shown = [];
    function draw() {
      const k = c => UNIT[st.unit].of(c, 1);
      let rows = C.filter(c => !c.pt && !c.nd && c.f[0] >= MAT && (st.unit === "eur" || c.g >= MIN_GDP) && k(c) != null).sort((a, b) => k(b) * b.f[0] - k(a) * a.f[0]);
      const n = rows.length; if (!st.all) rows = rows.slice(0, narrow() ? 15 : 20); shown = rows;
      const w = $(".emb-chart", main).clientWidth || 600;
      const node = hbars(rows.map(c => { const segs = partsOf(c, k(c)); return { key: c.iso, name: name(c), v: c.f[0] * k(c), segs, color: segs ? null : cssv("--ukr"), label: UNIT[st.unit].fmt(c.f[0] * k(c), false) }; }),
        { width: w, unit: st.unit, signed: false, onTip: r => tipRows(r.name, partsTip(byIso[r.key], st.unit)) });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(node);
      const back = rows.some(c => { const s = partsOf(c, 1); return s && s.some(x => x.back); });
      $(".emb-keyrow", main).innerHTML = legendHtml([{ color: T[0], text: S.kAid }, { color: T[1], text: S.kEu }, { color: T[2], text: S.kRef }, { color: T[3], text: S.kOther }].concat(back ? [{ cls: "stripe", color: "transparent", text: S.kBack }] : []));
      $(".emb-more button", main).textContent = st.all ? S.showFewer : fill(S.showAll, { n });
      $(".emb-more", main).hidden = n <= 20;
      $(".emb-sub", root).textContent = `${CFG.subBase} · ${unitSub(st.unit)}`;
      setHash({ u: st.unit === "eur" ? "" : st.unit, all: st.all ? "1" : "" });
    }
    setView({ name: "", svg: () => $(".emb-chart svg", main), csv: () => [[S.country, "ISO3", S.kAid, S.kEu, S.kRef, S.kOther, S.mUa, "unit"]].concat(shown.map(c => { const k = UNIT[st.unit].of(c, 1), [a, e, r] = c.pa; return [name(c), c.iso, a * k, e * k, r * k, (c.f[0] - a - e - r) * k, c.f[0] * k, st.unit === "eur" ? "EUR bn" : st.unit === "pp" ? "EUR per person" : "% of GDP"]; })) });
    redrawFn = draw; draw();
  }

  // ===== totals over time: support, trade and net, added up over a chosen set of countries =====
  const SETS = () => ({
    all: C.filter(c => !c.pt && !c.nd).map(c => c.iso),
    europe: C.filter(c => !c.pt && !c.nd && (c.r === "eu" || c.r === "eur")).map(c => c.iso),
    eu: C.filter(c => !c.nd && c.r === "eu").map(c => c.iso),
    g7: ["USA", "DEU", "GBR", "FRA", "ITA", "JPN", "CAN"].filter(i => byIso[i]),
  });
  function overTime() {
    const sets = SETS();
    const st = { set: hashState.set || "europe", unit: hashState.u === "gdp" ? "gdp" : "eur", mode: hashState.mode === "year" ? "year" : "run", iso: hashState.c && byIso[hashState.c] ? hashState.c : "" };
    if (!sets[st.set]) st.set = "europe";
    main.innerHTML = `<div class="emb-ctlrow"></div><div class="emb-chart"></div><div class="emb-keyrow"></div>`;
    const opts = [["all", S.pAll], ["europe", S.pEurope], ["eu", S.pEu], ["g7", S.pG7]].concat(C.filter(c => !c.nd).slice().sort((a, b) => name(a).localeCompare(name(b), L)).map(c => ["c:" + c.iso, name(c)]));
    $(".emb-ctlrow", main).appendChild(controls(
      select("ot-set", opts, st.iso ? "c:" + st.iso : st.set, v => { if (v.startsWith("c:")) { st.iso = v.slice(2); } else { st.iso = ""; st.set = v; } draw(); }, S.set),
      seg("ot-mode", [["run", S.running], ["year", S.each]], st.mode, v => { st.mode = v; draw(); }, S.mode),
      seg("ot-unit", [["eur", S.uEur], ["gdp", S.uGdp]], st.unit, v => { st.unit = v; draw(); }, S.unit)));
    let series = [];
    function draw() {
      const isos = st.iso ? [st.iso] : sets[st.set], rows = isos.map(i => byIso[i]).filter(c => c && !c.nd);
      const gdp = rows.reduce((a, c) => a + (c.g || 0), 0);
      const sum = (q, i) => rows.reduce((a, c) => a + (st.mode === "run" ? cum(c, q, i) : yearOwn(c, q, i)), 0);
      const conv = v => (st.unit === "gdp" ? (gdp ? (100 * v) / gdp : null) : v);
      series = [["ua", S.mUa, cssv("--ukr")], ["rus", S.mRus, cssv("--rus")], ["net", S.mNet, cssv("--ink")]].map(([q, t, col]) => ({ key: q, name: t, color: col, bold: q === "net", dash: q === "net" ? "6 4" : null, vals: D.years.map((y, i) => conv(sum(q, i))) }));
      const w = $(".emb-chart", main).clientWidth || 600, h = Math.max(240, Math.min(400, Math.round(w * 0.5)));
      const fmtv = (v, q) => (v == null ? S.na : st.unit === "gdp" ? UNIT.gdp.fmt(v, SIGNED[q]) : UNIT.eur.fmt(v, SIGNED[q]));
      const out = lines(series, { width: w, height: h, unit: st.unit, signed: true, onTip: i => tipRows(st.mode === "run" ? `2022–${yLabel(i)}` : yLabel(i), series.map(s => [s.name, fmtv(s.vals[i], s.key)])) });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(out.node);
      $(".emb-keyrow", main).innerHTML = legendHtml(series.map(s => ({ color: s.color, text: s.name, cls: s.dash ? "dash" : "" }))) + `<p class="ex-note">${esc(fill(S.sumOf, { n: rows.length }))} ${esc(S.legend)}${D.ytd.some(Boolean) ? " " + esc(fill(S.ytdNote, { y: D.years[D.years.length - 1], month: CFG.month })) : ""}</p>`;
      $(".emb-sub", root).textContent = `${st.mode === "run" ? S.running : S.each} · ${unitSub(st.unit)} · ${CFG.period}`;
      setHash({ set: st.iso ? "" : st.set === "europe" ? "" : st.set, c: st.iso, u: st.unit === "eur" ? "" : st.unit, mode: st.mode === "run" ? "" : st.mode });
    }
    setView({ name: "", svg: () => $(".emb-chart svg", main), csv: () => [[S.year].concat(series.map(s => s.name))].concat(D.years.map((y, i) => [yLabel(i)].concat(series.map(s => s.vals[i] ?? "")))) });
    redrawFn = draw; draw();
  }

  // ===== a ranked list of bars (per person; toward Russia) =====
  function ranked(kind) {
    const st = { q: hashState.m === "net" ? "net" : "ua", unit: kind === "rus" ? (hashState.u === "gdp" ? "gdp" : "eur") : "pp", all: hashState.all === "1" };
    main.innerHTML = `<div class="emb-ctlrow"></div><div class="emb-chart"></div><div class="emb-keyrow"></div><p class="emb-more"><button type="button" class="emb-link"></button></p>`;
    if (kind === "pp") $(".emb-ctlrow", main).appendChild(controls(seg("rk-q", [["ua", S.mUa], ["net", S.mNet]], st.q, v => { st.q = v; draw(); }, S.measure)));
    else $(".emb-ctlrow", main).appendChild(controls(seg("rk-unit", [["eur", S.uEur], ["gdp", S.uGdp]], st.unit, v => { st.unit = v; draw(); }, S.unit)));
    $(".emb-more button", main).addEventListener("click", () => { st.all = !st.all; draw(); });
    let shown = [];
    function draw() {
      let rows;
      if (kind === "rus") rows = D.ru.map(r => ({ c: byIso[r.iso], v: r.v, lo: r.lo, hi: r.hi, sure: r.sure })).filter(r => r.c).map(r => { const k = UNIT[st.unit].of(r.c, 1); return { ...r, k }; }).filter(r => r.k != null).sort((a, b) => a.v * a.k - b.v * b.k);
      else rows = C.filter(c => !c.pt && !c.nd && c.p && c.g >= MIN_GDP && (st.q === "net" || c.f[0] >= MAT)).map(c => ({ c, v: c.f[Q[st.q]], k: (1000 / c.p), sure: st.q === "ua" ? c.sU : c.sN })).sort((a, b) => b.v * b.k - a.v * a.k);
      const n = rows.length; if (!st.all) rows = rows.slice(0, narrow() ? 15 : 20); shown = rows;
      const w = $(".emb-chart", main).clientWidth || 600, U = UNIT[kind === "rus" ? st.unit : "pp"];
      const node = hbars(rows.map(r => {
        const v = kind === "rus" ? -r.v * r.k : r.v * r.k;
        const lo = kind === "rus" && r.lo != null ? -r.hi * r.k : null, hi = kind === "rus" && r.hi != null ? -r.lo * r.k : null;
        return { key: r.c.iso, name: name(r.c), v, lo, hi, color: kind === "rus" ? cssv(r.sure ? "--rus" : "--rus-f") : st.q === "ua" ? cssv(r.sure ? "--ukr" : "--ukr-f") : tone(v, r.sure), label: kind === "rus" ? U.fmt(v, false).replace(/^−/, "") : U.fmt(v, st.q === "net"), sure: r.sure };
      }), { width: w, unit: kind === "rus" ? st.unit : "pp", signed: kind !== "rus" && st.q === "net", onTip: r => {
        const c = byIso[r.key];
        if (kind === "rus") { const x = D.ru.find(z => z.iso === r.key), k = UNIT[st.unit].of(c, 1); return tipRows(r.name, [[S.mNet, U.fmt(x.v * k, true)], [S.rangeShort, `${U.fmt(x.lo * k, true)} … ${U.fmt(x.hi * k, true)}`], [S.mUa, U.fmt(c.f[0] * k, false)], [S.mRus, U.fmt(c.f[1] * k, true)]].concat(r.sure ? [] : [[S.faded, ""]])); }
        return tipRows(r.name, [[S.mUa, UNIT.pp.fmt(UNIT.pp.of(c, c.f[0]), false)], [S.mNet, UNIT.pp.fmt(UNIT.pp.of(c, c.f[2]), true)], [S.uEur, UNIT.eur.fmt(c.f[Q[st.q]], st.q === "net")]].concat(r.sure ? [] : [[S.faded, ""]]));
      } });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(node);
      const anyF = rows.some(r => !r.sure);
      $(".emb-keyrow", main).innerHTML = kind === "rus" ? legendHtml([{ color: cssv("--rus"), text: S.towardRu }].concat(anyF ? [{ color: cssv("--rus-f"), text: S.faded }] : []).concat([{ cls: "rng", color: "transparent", text: S.range }]))
        : legendHtml(st.q === "ua" ? [{ color: cssv("--ukr"), text: S.mUa }].concat(anyF ? [{ color: cssv("--ukr-f"), text: S.faded }] : []) : [{ color: cssv("--ukr"), text: S.plus }, { color: cssv("--rus"), text: S.minus }].concat(anyF ? [{ color: cssv("--ukr-f"), text: S.faded }] : []));
      $(".emb-more button", main).textContent = st.all ? S.showFewer : fill(S.showAll, { n });
      $(".emb-more", main).hidden = n <= 20;
      if (kind === "pp") $(".emb-sub", root).textContent = `${QNAME[st.q]} · ${S.unitPp} · ${CFG.period}`;
      else $(".emb-sub", root).textContent = `${CFG.subBase} · ${unitSub(st.unit)}`;
      setHash(kind === "rus" ? { u: st.unit === "eur" ? "" : st.unit, all: st.all ? "1" : "" } : { m: st.q === "ua" ? "" : st.q, all: st.all ? "1" : "" });
    }
    setView({ name: "", svg: () => $(".emb-chart svg", main), csv: () => kind === "rus"
      ? [[S.country, "ISO3", S.mNet, "low", "high", "unit"]].concat(shown.map(r => [name(r.c), r.c.iso, r.v * r.k, r.lo * r.k, r.hi * r.k, st.unit === "eur" ? "EUR bn" : "% of GDP"]))
      : [[S.country, "ISO3", QNAME[st.q], "unit"]].concat(shown.map(r => [name(r.c), r.c.iso, r.v * r.k, "EUR per person"])) });
    redrawFn = draw; draw();
  }

  // ===== frozen Russian assets by holding country =====
  function frozen() {
    main.innerHTML = `<div class="fz-hero"></div><div class="emb-chart"></div><div class="emb-keyrow"></div>`;
    const Z = D.fz, [C1, C2] = [cssv("--fz1"), cssv("--fz2")];
    $(".fz-hero", main).innerHTML = Z.hero ? `<p class="fz-big">${esc(F.E(L, Z.hero.v))}</p><p class="fz-t">${esc(S.heroFrozen)}</p><p class="fz-s">${esc(fill(S.heroFrozenSmall, { date: S.fzDate, total: F.E(L, Z.total) }))}</p>` : "";
    function draw() {
      const w = $(".emb-chart", main).clientWidth || 600;
      const nm = r => (byIso[r.iso] ? name(byIso[r.iso]) : (D.fzNames[L] || {})[r.iso] || r.iso);
      const node = hbars(Z.rows.map(r => ({ key: r.iso, name: nm(r), v: (r.cb ?? 0) + (r.pv ?? 0), lo: r.lo, hi: r.hi, segs: [{ v: r.cb ?? 0, color: C1 }, { v: r.pv ?? 0, color: C2 }], label: F.E(L, (r.cb ?? 0) + (r.pv ?? 0)) })),
        { width: w, unit: "eur", signed: false, onTip: r => { const x = Z.rows.find(z => z.iso === r.key); return tipRows(r.name, [[S.kCb, x.cb == null ? S.na : F.E(L, x.cb)], [S.kPriv, x.pv == null ? S.na : F.E(L, x.pv)], [S.rangeShort, `${F.E(L, x.lo)} … ${F.E(L, x.hi)}`]]); } });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(node);
      $(".emb-keyrow", main).innerHTML = legendHtml([{ color: C1, text: S.kCb }, { color: C2, text: S.kPriv }, { cls: "rng", color: "transparent", text: S.rangeTotal }]) + (S.fzNone ? `<p class="ex-note">${esc(S.fzNone)}</p>` : "");
    }
    setView({ name: "", svg: () => $(".emb-chart svg", main), csv: () => [[S.country, "ISO3", S.kCb, S.kPriv, "low", "high", "unit"]].concat(Z.rows.map(r => [(byIso[r.iso] ? name(byIso[r.iso]) : r.iso), r.iso, r.cb ?? "", r.pv ?? "", r.lo, r.hi, "EUR bn"])) });
    redrawFn = draw; draw();
  }

  // ===== one country: the parts of its number, then its totals year by year =====
  function country() {
    const c = byIso[CFG.iso];
    if (!c) { main.innerHTML = `<p class="emb-empty">${esc(S.noData)}</p>`; return; }
    if (c.nd) { main.innerHTML = `<p class="emb-empty">${esc(S.noDataText)}</p>`; setView({ name: "", csv: () => [] }); return; }
    const st = { mode: hashState.mode === "year" ? "year" : "run" };
    main.innerHTML = `${c.pt ? `<p class="emb-party">${esc(S.party)}</p>` : ""}<h3 class="emb-h3">${esc(S.tBreak)}</h3><div class="emb-chart cy-wf"></div><div class="emb-keyrow cy-k1"></div>
<div class="cy-years"><h3 class="emb-h3">${esc(S.byYear)}</h3><div class="emb-ctlrow"></div><div class="emb-chart cy-ln"></div><div class="emb-keyrow cy-k2"></div></div>`;
    $(".cy-years .emb-ctlrow", main).appendChild(controls(seg("cy-mode", [["run", S.running], ["year", S.each]], st.mode, v => { st.mode = v; drawLine(); }, S.mode)));
    const T = partTone();
    let series = [];
    function drawWf() {
      const [aid, eu, ref] = c.pa, ua = c.f[0], rus = c.f[1], net = c.f[2], fz = c.f[3], other = ua - aid - eu - ref;
      const steps = [];
      const piece = (label, v, color) => { if (Math.abs(v) >= MAT) steps.push({ label, v, color: v >= 0 ? color : null, back: v < 0 }); };
      piece(S.bkAid, aid, T[0]); piece(S.bkEu, eu, T[1]); piece(S.bkRef, ref, T[2]); piece(S.bkOther, other, T[3]);
      steps.push({ label: S.bkUa, v: ua, total: true, color: ua >= 0 ? cssv(c.sU ? "--ukr" : "--ukr-f") : cssv("--rus") });
      steps.push({ label: rus >= 0 ? S.bkRusLess : S.bkRusMore, v: rus, color: tone(rus, c.sR) });
      if (Math.abs(fz) >= MAT) steps.push({ label: S.bkFrozen, v: fz, color: fz >= 0 ? cssv("--fz1") : cssv("--rus") });
      steps.push({ label: S.bkNet, v: net, total: true, color: tone(net, c.sN || c.pt) });
      let run = 0; for (const s of steps) { if (s.total) { s.a = 0; s.b = s.v; run = s.v; } else { s.a = run; s.b = run + s.v; run = s.b; } }
      // on a phone each label takes its own line above its bar
      const nw = narrow(), w = $(".cy-wf", main).clientWidth || 600, lw = nw ? 0 : Math.min(250, w * 0.42), vw = 78, rowH = nw ? 42 : 28, top = 8, h = top + steps.length * rowH + 6, by = nw ? 18 : 0;
      const lo = Math.min(0, ...steps.flatMap(s => [s.a, s.b])), hi = Math.max(0, ...steps.flatMap(s => [s.a, s.b]));
      const x = d3.scaleLinear().domain([lo, hi || 1]).range([lw, w - (nw ? 4 : vw)]);
      const svg = svgEl(w, h), ink = cssv("--ink"), soft = cssv("--soft");
      const defs = svg.append("defs"), p = defs.append("pattern").attr("id", "emb-stripe2").attr("width", 6).attr("height", 6).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
      p.append("rect").attr("width", 6).attr("height", 6).attr("fill", cssv("--surface")); p.append("rect").attr("width", 2.6).attr("height", 6).attr("fill", soft);
      svg.append("line").attr("x1", x(0)).attr("x2", x(0)).attr("y1", top + by - 4).attr("y2", h - 2).attr("stroke", soft).attr("opacity", 0.6);
      const g = svg.append("g").selectAll("g").data(steps).join("g").attr("transform", (s, i) => `translate(0,${top + i * rowH})`);
      g.append("rect").attr("width", w).attr("height", rowH).attr("fill", "transparent");
      g.filter(s => s.total).append("line").attr("x1", 0).attr("x2", w).attr("y1", 0).attr("y2", 0).attr("stroke", ink).attr("stroke-width", 1.4);
      g.append("text").attr("x", 0).attr("y", nw ? 14 : rowH / 2 + 4).attr("font-size", 12.5).attr("font-weight", s => (s.total ? 700 : 400)).attr("fill", ink).text(s => (!nw && s.label.length > 40 ? s.label.slice(0, 39) + "…" : s.label));
      g.append("rect").attr("x", s => x(Math.min(s.a, s.b))).attr("y", s => by + (s.total ? 4 : 7)).attr("height", s => (s.total ? (nw ? 18 : rowH - 8) : nw ? 12 : rowH - 14)).attr("rx", 2)
        .attr("width", s => Math.max(1.5, Math.abs(x(s.b) - x(s.a)))).attr("fill", s => (s.back ? "url(#emb-stripe2)" : s.color));
      g.append("text").attr("x", w - 2).attr("y", nw ? 14 : rowH / 2 + 4).attr("text-anchor", "end").attr("font-size", 12.5).attr("font-weight", 700).attr("fill", ink).text(s => sg(s.v) + F.E(L, s.v));
      g.on("pointermove", (e, s) => showTip(e, `<b>${esc(s.label)}</b><br>${esc(sg(s.v) + F.E(L, s.v))}${c.g ? ` · ${esc(sg(s.v) + F.P(L, (100 * s.v) / c.g))}` : ""}`)).on("pointerleave", hideTip);
      const ch = $(".cy-wf", main); ch.innerHTML = ""; ch.appendChild(svg.node());
      $(".cy-k1", main).innerHTML = `<p class="ex-note">${esc(S.bkKey)}</p>`;
    }
    function drawLine() {
      series = [["ua", S.mUa, cssv("--ukr")], ["rus", S.mRus, cssv("--rus")], ["net", S.mNet, cssv("--ink")]].map(([q, t, col]) => ({ key: q, name: t, color: col, bold: q === "net", dash: q === "net" ? "6 4" : null, vals: D.years.map((y, i) => (st.mode === "run" ? cum(c, q, i) : yearOwn(c, q, i))) }));
      if (Math.abs(c.f[3]) >= MAT) series.push({ key: "fz", name: S.frozen, color: cssv("--fz1"), dash: "2 3", vals: D.years.map((y, i) => (st.mode === "run" ? cum(c, "fz", i) : yearOwn(c, "fz", i))) });
      const w = $(".cy-ln", main).clientWidth || 600, h = Math.max(220, Math.min(340, Math.round(w * 0.45)));
      const out = lines(series, { width: w, height: h, unit: "eur", signed: true, onTip: i => tipRows(st.mode === "run" ? `2022–${yLabel(i)}` : yLabel(i), series.map(s => [s.name, UNIT.eur.fmt(s.vals[i], s.key !== "ua" && s.key !== "fz")])) });
      const ch = $(".cy-ln", main); ch.innerHTML = ""; ch.appendChild(out.node);
      $(".cy-k2", main).innerHTML = legendHtml(series.map(s => ({ color: s.color, text: s.name, cls: s.dash ? "dash" : "" }))) + `<p class="ex-note">${esc(S.yearSigns)}${D.ytd.some(Boolean) ? " " + esc(fill(S.ytdNote, { y: D.years[D.years.length - 1], month: CFG.month })) : ""}</p>`;
      setHash({ mode: st.mode === "run" ? "" : st.mode });
    }
    setView({ name: "", svg: () => { const a = $(".cy-wf svg", main), b = $(".cy-ln svg", main); if (!b) return a; const w = Math.max(+a.getAttribute("width"), +b.getAttribute("width")), ha = +a.getAttribute("height"), hb = +b.getAttribute("height");
      const s = svgEl(w, ha + hb + 16).node(); const ga = a.cloneNode(true), gb = b.cloneNode(true); gb.setAttribute("y", ha + 16); s.appendChild(ga); s.appendChild(gb); return s; },
    csv: () => [[S.year, S.mUa, S.mRus, S.frozen, S.mNet, "unit"]].concat(D.years.map((y, i) => [yLabel(i), yearOwn(c, "ua", i), yearOwn(c, "rus", i), yearOwn(c, "fz", i), yearOwn(c, "net", i), "EUR bn"])).concat([[S.total, c.f[0], c.f[1], c.f[3], c.f[2], "EUR bn"]]) });
    redrawFn = () => { drawWf(); drawLine(); }; redrawFn();
  }

  // ===== a page's own ranked list (a topic, part, year or group page; the military aid page): its rows, as the page
  // writes them (CFG.rows: name, iso, v in the page's unit, value, tone), first rows then every row =====
  function topicBars() {
    const R = CFG.rows || [], st = { all: hashState.all === "1" };
    main.innerHTML = `<div class="emb-chart"></div><div class="emb-keyrow"></div><p class="emb-more"><button type="button" class="emb-link"></button></p>`;
    $(".emb-more button", main).addEventListener("click", () => { st.all = !st.all; draw(); });
    const TONE = { ua: "--ukr", uaF: "--ukr-f", ru: "--rus", ruF: "--rus-f", grey: "--t-other", frozen: "--fz1" };
    let shown = [];
    function draw() {
      shown = st.all ? R : R.slice(0, narrow() ? 15 : 20);
      const w = $(".emb-chart", main).clientWidth || 600;
      const node = hbars(shown.map((r, i) => ({ key: String(i), name: r.name, v: r.v, label: r.value, color: cssv(TONE[r.tone] || "--ukr") })), { width: w, unit: CFG.unit || "eur", signed: !!CFG.signed,
        onTip: r => { const x = shown[+r.key]; return `<b>${esc(x.name)}</b><br>${esc(x.value)}${x.sub ? `<br>${esc(x.sub)}` : ""}`; } });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(node);
      const tones = [...new Set(shown.map(r => r.tone))];
      $(".emb-keyrow", main).innerHTML = (CFG.keys || []).length ? legendHtml(CFG.keys.filter(k => tones.includes(k.tone)).filter((k, i, a) => a.findIndex(z => z.text === k.text) === i).map(k => ({ color: cssv(TONE[k.tone]), text: k.text }))) : "";
      $(".emb-more button", main).textContent = st.all ? S.showFewer : fill(S.showAll, { n: R.length });
      $(".emb-more", main).hidden = R.length <= 20;
      setHash({ all: st.all ? "1" : "" });
    }
    setView({ name: "", svg: () => $(".emb-chart svg", main), csv: () => [[CFG.colName || S.country, CFG.colValue || S.sValue, "ISO3"]].concat(R.map(r => [r.name, r.raw ?? r.v, r.iso || ""])) });
    redrawFn = draw; draw();
  }
  // ===== a series of its own (Russia's oil and gas revenue by month or year, its budget balance): CFG.sets, each
  // { key, label, x: [labels], unit: "eur" | "pct", lines: [{ name, tone, vals }] }, a switch between the sets =====
  function series() {
    const sets = CFG.sets || [], st = { k: sets.some(x => x.key === hashState.set) ? hashState.set : (sets[0] || {}).key };
    const TONE = { ua: "--ukr", ru: "--rus", ink: "--ink", grey: "--t-other" };
    main.innerHTML = `<div class="emb-ctlrow"></div><div class="emb-chart"></div><div class="emb-keyrow"></div>`;
    if (sets.length > 1) $(".emb-ctlrow", main).appendChild(controls(seg("se-set", sets.map(x => [x.key, x.label]), st.k, v => { st.k = v; draw(); }, S.view)));
    let cur = null;
    const fmtOf = u => v => (v == null ? S.na : u === "pct" ? F.P(L, v) : (v < 0 ? "−" : "") + F.E(L, v));
    function draw() {
      cur = sets.find(x => x.key === st.k) || sets[0]; if (!cur) return;
      const ls = cur.lines.map(x => ({ name: x.name, color: cssv(TONE[x.tone] || "--ink"), vals: x.vals }));
      const w = $(".emb-chart", main).clientWidth || 600, h = Math.max(220, Math.min(380, Math.round(w * 0.45))), f = fmtOf(cur.unit);
      const out = lines(ls, { width: w, height: h, labels: cur.x, fmt: v => (Math.abs(v) < 1e-12 ? "0" : f(v)), onTip: i => tipRows(cur.x[i], ls.map(s => [s.name, f(s.vals[i])])) });
      const ch = $(".emb-chart", main); ch.innerHTML = ""; ch.appendChild(out.node);
      $(".emb-keyrow", main).innerHTML = legendHtml(ls.map(s => ({ color: s.color, text: s.name }))) + (cur.note ? `<p class="ex-note">${esc(cur.note)}</p>` : "");
      $(".emb-sub", root).textContent = cur.sub || CFG.sub;
      setHash({ set: st.k === (sets[0] || {}).key ? "" : st.k });
    }
    setView({ get name() { return st.k; }, svg: () => $(".emb-chart svg", main), csv: () => cur ? [[S.period].concat(cur.lines.map(x => x.name))].concat(cur.x.map((x, i) => [x].concat(cur.lines.map(s => s.vals[i] ?? "")))) : [] });
    redrawFn = draw; draw();
  }
  function setView(v) { view = v; }
  // the page that holds the frame switches its theme (seo_plain.mjs THEME_JS): follow it and draw again in its colours
  window.addEventListener("message", e => { if (e.source !== window.parent || !e.data || e.data.type !== "wb-theme") return; document.documentElement.dataset.theme = e.data.theme === "dark" ? "dark" : "light"; if (D) redraw(); });
  new MutationObserver(() => { const e = $(".emb-sub", root), t = e.textContent; if (t && t[0] !== t[0].toUpperCase()) e.textContent = t[0].toUpperCase() + t.slice(1); }).observe($(".emb-sub", root), { childList: true, characterData: true, subtree: true });
  const KINDS = { explorer, "support-by-country": stacked, "totals-over-time": overTime, "per-person": () => ranked("pp"), "toward-russia": () => ranked("rus"), "frozen-assets": frozen, country, topic: topicBars, series };
  fetch(CFG.data).then(r => r.json()).then(d => {
    D = d;
    C = Object.entries(d.c).map(([iso, c]) => ({ iso, ...c })).sort((a, b) => a.iso.localeCompare(b.iso));
    for (const c of C) { byIso[c.iso] = c; byNum[c.n] = c; }
    lastW = root.clientWidth;
    (KINDS[CFG.kind] || explorer)();
    root.classList.add("ready"); report();
  }).catch(e => { main.innerHTML = `<p class="emb-empty">${esc(S.failed)}</p>`; if (window.console) console.warn(e); });
})();
