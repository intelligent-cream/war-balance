// Round 62 (images for image search): chart images that answer what people search for ("ukraine support by country",
// "aid to ukraine per capita", "how much has France given to Ukraine", "frozen russian assets by country"), drawn at
// deploy from the figures the pages show (seo_pages.mjs passes the map's own numbers and words: seo_extract.mjs), in
// the map's look (its colours, fonts and bars with their range lines), so they change with the data and need no upkeep.
//
//   ranking charts   support for Ukraine by country in euros, as a share of GDP and per person (top 10 each), the net
//                    (toward Ukraine or toward Russia, with ranges), the money that moved toward Russia, the Russian
//                    assets frozen in each country and the countries' sanctions on Russia: one per language
//   country charts   one per country page and language: support for Ukraine with its parts (own aid, EU share,
//                    refugees), Russia's earnings from trade, frozen money and the net, each with its range
//
// Round 68 (image review): one diverging layout on every chart with both directions (zero at a fixed place, toward
// Ukraine to the right, toward Russia to the left, a short stub for a value near zero), each figure right after its
// bar's end with the range line lighter behind it, text large enough for a 250px thumbnail and a phone, every fill at
// 3:1 or more against the background (a less certain value striped, not paler), a short alt text with the full
// breakdown in the ImageObject's description, a visible caption, and an 800px copy of every image for srcset.
//
// Every image is 1200×630 WebP (Chromium's own encoder, through the DevTools protocol), with an 800×420 copy beside it
// (<name>-800.webp), written to site/img/ (not in git, like site/share/) at an address that stays the same from one
// deploy to the next (seo_i18n.mjs IMG_FILE). The models (rankChart, countryChart) and the HTML (chartHtml) are pure:
// pipeline/test_seo.mjs tests them; the page's fit() only shrinks text and the bars' scale until everything fits.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import * as I from "./seo_i18n.mjs";

export const W = 1200, H = 630, W2 = 800;
const BG = "#fbfcfc";
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// the map's colours (index.html; the share cards): blue toward Ukraine, orange toward Russia, grey for no clear
// direction. Round 68: a direction that is not certain keeps a fill of 3:1 or more on the background (uaF 3.4, ruF 3.2,
// grey 4.0) and is striped (class pl), so it differs from a sure one by more than its shade
export const TONE = { ua: "#2a6fb0", uaF: "#5c8cbd", ru: "#d4601a", ruF: "#cc7a40", grey: "#6b7f90" };
// the parts of support (own aid, EU share, refugees, the rest): 10.3, 5.1, 3.4 and 4.0 to 1 on the background
export const PART_TONE = ["#14406b", "#2a6fb0", "#5c8cbd", "#6b7f90"];
// the frozen amounts: central bank reserves, private assets (7.4 and 3.4 to 1)
export const FROZEN_TONE = ["#1d5689", "#5c8cbd"];
// round 64: the site's own fonts (site/fonts/fonts.css and its woff2 files, inlined, font-display: block), not Google's
const FONTS = "<!-- fonts -->";
const fontStyle = async site => {
  const css = await readFile(join(site, "fonts", "fonts.css"), "utf8"), files = [...new Set([...css.matchAll(/url\(\/fonts\/([\w.-]+)\)/g)].map(m => m[1]))];
  const data = Object.fromEntries(await Promise.all(files.map(async f => [f, (await readFile(join(site, "fonts", f))).toString("base64")])));
  return `<style>${css.replace(/url\(\/fonts\/([\w.-]+)\)/g, (m, f) => `url(data:font/woff2;base64,${data[f]})`).replace(/font-display:swap/g, "font-display:block")}</style>`;
};

// an image's address: /img/<name>.webp in English, /img/<lang>/<name>.webp in the other languages
export const imgPath = (l, key, slug = "") => `/img/${l === "en" ? "" : l + "/"}${I.IMG_FILE[l][key].replace("{slug}", slug)}.webp`;
// round 68: its 800px-wide copy, beside it
export const smallPath = path => path.replace(/\.webp$/, `-${W2}.webp`);

// a value's colour: its side, striped where its direction is not certain
export const toneOf = (v, sure = true, grey = false) => (grey ? "grey" : v >= 0 ? (sure ? "ua" : "uaF") : sure ? "ru" : "ruF");
const pale = tone => /F$/.test(tone || "");

// sentences joined with ". ", without a second full stop after an abbreviation ("серпня 2026 р.")
export const joinSentences = parts => parts.filter(Boolean).map(p => String(p).trim()).reduce((a, p) => (a ? a + (/[.!?]$/.test(a) ? " " : ". ") : "") + p, "").replace(/([^.!?])$/, "$1.");

// ----- a ranking chart: rows of { name, v, lo, hi, value, note, tone, segs, label, cells } on one axis -----
// head: { title, sub, foot, legend }; rows already in their order
export function rankChart({ key, l, title, unit, period, source, rows, legend = [], alt, desc = "", caption = "", cols = null }) {
  return { kind: "rank", key, l, title, sub: I.cap([period, unit].filter(Boolean).join(" · ")), source, legend, alt, desc: desc || alt, caption, cols, rows: rows.map((r, i) => ({ rank: r.rank ?? i + 1, ...r })) };
}

// the axis: from the smallest to the largest of the values and their ranges, always with zero
export function domain(rows, pad = 0) {
  let lo = 0, hi = 0;
  for (const r of rows) for (const x of [r.v, r.lo, r.hi, ...(r.segs || []).map(s => s.v)]) if (x != null && isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
  // segments stack: a row's positive and negative parts each add up
  for (const r of rows) if (r.segs) {
    hi = Math.max(hi, r.segs.filter(s => s.v > 0).reduce((a, s) => a + s.v, 0));
    lo = Math.min(lo, r.segs.filter(s => s.v < 0).reduce((a, s) => a + s.v, 0));
  }
  if (hi === lo) hi = lo + 1;
  // room for the figures written beside the bars (a share of the axis on each side that has bars)
  const span = hi - lo;
  return { lo: lo < 0 ? lo - span * pad : lo, hi: hi > 0 ? hi + span * pad : hi };
}

// a row's bar (or stacked parts), its range line and its figure, placed from zero (z, percent of the bar area) with
// each length in percent at full scale (k per unit), times the chart's scale --s that fit() sets so that every
// figure fits. A bar is at least 4px long, so a value near zero still shows beside the zero line.
const P = x => +x.toFixed(3);
function barHtml(r, z, k, { big = false } = {}) {
  const at = off => `calc(${P(z)}% + var(--s) * ${P(off * k)}%)`;
  let out = `<span class="ax" style="left:${P(z)}%"></span>`, end = 0;
  const cls = `b${pale(r.tone) ? " pl" : ""}${big ? " big" : ""}`;
  if (r.segs && r.segs.length) {
    let pos = 0, neg = 0;
    const segs = r.segs.filter(s => s.v);
    segs.forEach((s, i) => {
      const a = s.v > 0 ? pos : neg + s.v;
      if (s.v > 0) pos += s.v; else neg += s.v;
      // a 2px gap of the background between parts
      const gap = i < segs.length - 1 && s.v > 0 ? `;border-right:2px solid ${BG}` : "";
      out += `<i class="${cls}" style="left:${at(a)};width:calc(var(--s) * ${P(Math.abs(s.v) * k)}%);background-color:${s.color}${gap}"></i>`;
    });
    end = pos || neg;
  } else if (r.v != null) {
    const w = `max(4px, calc(var(--s) * ${P(Math.abs(r.v) * k)}%))`, col = TONE[r.tone] || TONE.grey;
    out += `<i class="${cls}${r.v < 0 ? " neg" : ""}" style="${r.v < 0 ? `right:${P(100 - z)}%` : `left:${P(z)}%`};width:${w};background-color:${col};--c:${col}"></i>`;
    end = r.v;
  }
  if (r.lo != null && r.hi != null && isFinite(r.lo) && isFinite(r.hi) && Math.abs(r.hi - r.lo) > 1e-9) {
    const a = Math.min(r.lo, r.hi), b = Math.max(r.lo, r.hi);
    out += `<i class="w" data-a="${P(a * k)}" data-b="${P(b * k)}" style="left:${at(a)};width:calc(var(--s) * ${P((b - a) * k)}%)"></i>`;
  }
  // the figure right after the bar's end (not the range line's), on its own side of zero, over the range line
  if (r.label) {
    const e = P(Math.abs(end) * k), neg = end < 0 || (end === 0 && r.v < 0);
    out += `<span class="lab" data-e="${neg ? -e : e}" style="${neg ? `right:calc(${P(100 - z)}% + max(4px, var(--s) * ${e}%) + 6px)` : `left:calc(${P(z)}% + max(4px, var(--s) * ${e}%) + 6px)`}">${r.label}</span>`;
  }
  // a country chart's row name, on the other side of zero from its bar
  if (r.name != null && r.nameSide) out += `<span class="nm ${end < 0 || r.v < 0 ? "nr" : "nl"}" style="${end < 0 || r.v < 0 ? `left:calc(${P(z)}% + 14px)` : `right:calc(${P(100 - z)}% + 14px)`}">${esc(r.name)}</span>`;
  return out;
}

const CSS = `*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
#c{--s:1;--h1:48px;--sub:22px;--fs:24px;--rh:36px;position:fixed;inset:0;width:${W}px;height:${H}px;background:${BG};color:#15212b;font:400 var(--fs)/1.2 "Source Sans 3",system-ui,sans-serif;padding:26px 40px 18px;display:flex;flex-direction:column;font-variant-numeric:tabular-nums}
h1{font:800 var(--h1)/1.05 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.02em;text-wrap:balance}
.sub{margin-top:8px;font-size:var(--sub);line-height:1.25;color:#4a5863;text-wrap:balance}.party{margin-top:6px;font-size:var(--sub);font-weight:700;color:#8a2f2f}
.rows{flex:1;min-height:0;overflow:hidden;margin-top:12px;display:grid;grid-template-columns:max-content 1fr;grid-auto-rows:minmax(var(--rh),1fr);column-gap:14px;align-items:stretch}
.rows.one{grid-template-columns:1fr}.rows.cols{grid-template-columns:max-content 1fr max-content max-content}
.rows>.n{align-self:center;text-align:right;font-weight:600;max-width:340px;line-height:1.02;text-wrap:balance}
.rows>.grp{grid-column:1/-1;align-self:end;font:700 calc(var(--fs) * .78)/1.1 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#4a5863}
.rows>.ch{align-self:end;font-size:calc(var(--fs) * .8);color:#4a5863;white-space:nowrap;padding-bottom:2px}.rows>.ch i{display:inline-block;width:.75em;height:.75em;border-radius:2px;margin-right:5px;vertical-align:-1px}
.rows>.cv{align-self:center;text-align:right;font-weight:700;white-space:nowrap}.rows>.cv.na{font-weight:400;color:#4a5863}
.bar{position:relative}
.bar .ax{position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#15212b;opacity:.6}
.bar .b{position:absolute;top:20%;bottom:20%;border-radius:0 3px 3px 0}.bar .b.neg{border-radius:3px 0 0 3px}
.bar .b.pl{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 3px,transparent 3px 9px);box-shadow:inset 0 0 0 2px var(--c,transparent)}
.bar .w{position:absolute;top:50%;height:2px;margin-top:-1px;background:#4e5b66;box-shadow:0 0 0 1px rgba(255,255,255,.95)}
.bar .w::before,.bar .w::after{content:"";position:absolute;top:-7px;height:16px;width:2px;background:#4e5b66;box-shadow:0 0 0 1px rgba(255,255,255,.95)}.bar .w::before{left:0}.bar .w::after{right:-1px}
.bar .lab{position:absolute;top:50%;transform:translateY(-50%);white-space:nowrap;line-height:1.05;padding:1px 5px;background:${BG};border-radius:4px;z-index:2}
.lab b{font-weight:700;font-size:calc(var(--fs) * 1.12)}.lab small{font-size:calc(var(--fs) * .78);color:#4a5863;margin-left:7px}.lab .t{font-weight:600;color:#15212b;margin-left:9px}
#c.cc{--fs:26px}.ctry{flex:1;min-height:0;overflow:hidden;margin-top:10px;display:flex;flex-direction:column;justify-content:space-evenly}
.ctry .bar{height:calc(var(--fs) * 2.1);flex:none}.ctry .bar.big{height:calc(var(--fs) * 2.6)}
.ctry .bar .b{top:14%;bottom:14%}
.ctry .nm{position:absolute;top:50%;transform:translateY(-50%);z-index:2;padding:1px 6px;background:${BG};border-radius:4px;font:700 var(--fs)/1.05 Archivo,"Helvetica Neue",Arial,sans-serif;max-width:calc(50% - 20px);text-wrap:balance}.ctry .nl{text-align:right}
.ctry .lab b{font-family:Archivo,"Helvetica Neue",Arial,sans-serif;font-weight:800;font-size:calc(var(--fs) * 1.2);letter-spacing:-.01em}.ctry .big .lab b,.ctry .bar.big .lab b{font-size:calc(var(--fs) * 1.5)}
.parts{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 22px;font-size:calc(var(--fs) * .8);color:#2b3944;margin-top:-4px}.parts i{display:inline-block;width:.8em;height:.8em;border-radius:2px;margin-right:6px;vertical-align:-1px}
.ft{display:flex;justify-content:space-between;align-items:flex-end;gap:10px 24px;margin-top:10px;font-size:18px;color:#4a5863;line-height:1.25}
.ft .leg{display:flex;flex-wrap:wrap;gap:2px 18px;align-items:center}.ft .leg i{display:inline-block;width:13px;height:13px;border-radius:2px;margin-right:6px;vertical-align:-1px}
.ft .wb{font:800 19px/1 Archivo,"Helvetica Neue",Arial,sans-serif;color:#15212b;white-space:nowrap}.ft .wb i{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:3px}
.ft .src{text-align:right;white-space:nowrap}`;
// the page's fit(): the title on two lines at most, then everything on the image (the rows' height, then the text
// smaller step by step), then the bars' scale so that every figure and range line stays inside its row
const FIT = `<script>window.fit=()=>{const c=document.getElementById("c"),st=(k,v)=>c.style.setProperty(k,v),h1=c.querySelector("h1"),rows=c.querySelector(".rows,.ctry");
st("--s",1);const lines=()=>Math.round(h1.offsetHeight/(parseFloat(getComputedStyle(h1).fontSize)*1.05));
let h=48;while(lines()>2&&h>34){h-=2;st("--h1",h+"px")}
const over=()=>rows.scrollHeight>rows.clientHeight+1||c.scrollHeight>c.clientHeight+1;
const steps=[["--rh","32px"],["--rh","29px"],["--fs","22px"],["--sub","20px"],["--h1",Math.min(h,42)+"px"],["--rh","26px"],["--fs","20px"],["--h1",Math.min(h,38)+"px"],["--sub","18px"],["--rh","22px"],["--fs","18px"]];
for(const [k,v] of steps){if(!over())break;st(k,v)}
let s=1;for(const b of c.querySelectorAll(".bar")){const A=b.clientWidth,z=parseFloat(b.querySelector(".ax").style.left)/100;if(!A)continue;
for(const w of b.querySelectorAll(".w")){const a=+w.dataset.a/100,bb=+w.dataset.b/100;if(bb>0)s=Math.min(s,(1-z)/bb);if(a<0)s=Math.min(s,z/-a)}
for(const l of b.querySelectorAll(".lab")){const e=+l.dataset.e/100,lw=l.offsetWidth+8;if(e>0)s=Math.min(s,(A*(1-z)-lw)/(A*e));else if(e<0)s=Math.min(s,(A*z-lw)/(A*-e))}}
st("--s",Math.max(.05,s))}</script>`;
export const PAGE_HTML = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style>${FIT}</head><body><div id="c"></div></body></html>`;

// a figure's text colour: its side's darker shade (readable on the light background), grey without a direction
const inkOf = tone => (tone === "grey" ? "#4a5863" : /^ru/.test(tone) ? "#b4500f" : "#1f5a94");
const brand = () => `<span class="wb"><i style="background:${TONE.ua}"></i><i style="background:${TONE.ru}"></i> War Balance</span>`;
const swatch = x => (x.pale ? `<i class="pl" style="background:${x.color};background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 3px,transparent 3px 7px)"></i>` : `<i style="background:${x.color}"></i>`);
const legendHtml = items => `<span class="leg">${brand()}${items.map(x => (x.color ? `<span>${swatch(x)}${esc(x.text)}</span>` : `<span>${esc(x.text)}</span>`)).join("")}</span>`;
const foot = m => `<div class="ft">${legendHtml(m.legend)}<span class="src">${esc(m.source)}</span></div>`;
const head = m => `<h1>${esc(m.title)}</h1>${m.sub ? `<p class="sub">${esc(m.sub)}</p>` : ""}${m.party ? `<p class="party">${esc(m.party)}</p>` : ""}`;
const figLabel = r => r.label || `<b style="color:${inkOf(r.tone)}">${esc(r.value)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ""}`;

// the HTML of one chart, inside the page above (#c)
export function chartHtml(m, host) {
  if (m.kind === "rank") {
    const d = domain(m.rows), k = 100 / (d.hi - d.lo), z = -d.lo * k;
    const named = m.rows.some(r => r.name), cols = m.cols && m.cols.length ? m.cols : null;
    const grid = cols ? "cols" : named ? "" : "one";
    const colHead = cols ? `${named ? "<span></span>" : ""}<span></span>${cols.map(c => `<span class="ch">${c.color ? swatch(c) : ""}${esc(c.text)}</span>`).join("")}` : "";
    const row = r => `${r.sepBefore ? `<div class="grp">${esc(r.sepBefore)}</div>` : ""}${named ? `<span class="n">${esc(r.name)}</span>` : ""}<span class="bar">${barHtml({ ...r, label: cols ? "" : figLabel(r) }, z, k)}</span>${cols ? (r.cells || []).map(x => `<span class="cv${x.na ? " na" : ""}"${x.color ? ` style="color:${x.color}"` : ""}>${esc(x.text)}</span>`).join("") : ""}`;
    return `${head(m)}<div class="rows ${grid}">${colHead}${m.rows.map(row).join("")}</div>${foot(m)}`;
  }
  // a country: its rows on one axis in euros, zero in the middle (toward Ukraine to the right, toward Russia to the
  // left), each row's name on the other side of zero from its bar; the parts of support beneath its bar
  let M = 0;
  for (const r of m.rows) for (const x of [r.v, r.lo, r.hi, r.segs ? r.segs.filter(s => s.v > 0).reduce((a, s) => a + s.v, 0) : 0]) if (x != null && isFinite(x)) M = Math.max(M, Math.abs(x));
  const k = 50 / (M || 1);
  return `${head(m)}<div class="ctry">${m.rows.map(r => {
    const vis = (r.parts || []).filter(p => p.shown);
    return `<div class="bar${r.key === "net" ? " big" : ""}">${barHtml({ ...r, name: r.label, nameSide: true, label: figLabel({ ...r, label: "", note: r.note }) }, 50, k, { big: r.key === "net" })}</div>${vis.length ? `<p class="parts">${vis.map(p => `<span><i style="background:${p.color}"></i>${esc(p.text)}</span>`).join("")}</p>` : ""}`;
  }).join("")}</div>${foot(m)}`;
}

// ----- a country's chart, from the map's figures and words in a language (seo_extract.mjs country()) -----
// c: the country in this language; earner: no clear direction (the share cards' grey); words: { title, period, source,
// unit, legendSigned, range, support, trade, frozen, net, ofGdp, party, partNames: {aid, euaid, ref}, other, paler }
export function countryChart({ c, l, earner = false, words: w, alt = true }) {
  if (!c || !c.net || c.noData || c.mostlyNoData) return null;
  const f = c.fig, E = v => I.E(l, v), sg = v => (Math.abs(v) < 0.0005 ? "" : v > 0 ? "+" : "−");
  const signed = v => sg(v) + E(v);
  const sentence = n => [n.pre, n.big, n.post].filter(Boolean).join(" ");
  const sure = n => !(n.unc || (n.info && n.info.level && n.info.level !== "sure"));
  const note = n => (!sure(n) && n.chance && !c.party ? n.chance : "");
  const mOf = k => (c.measures && c.measures[k] && c.measures[k].v != null ? c.measures[k].v : 0);
  // support for Ukraine and its parts: own aid, EU share, refugee hosting, and the rest (the smaller parts, net of the
  // money of the war effort spent back in its own economy), which add up to its support
  const pa = [["aid", mOf("part:aid")], ["euaid", mOf("part:euaid")], ["ref", mOf("part:ref")]];
  const other = f.ua - pa.reduce((a, [, v]) => a + v, 0);
  const parts = pa.map(([k, v], i) => ({ k, v, color: PART_TONE[i], text: `${w.partNames[k]} ${signed(v)}` })).filter(p => Math.abs(p.v) >= 0.0005);
  if (Math.abs(other) >= 0.0005 && parts.length) parts.push({ k: "other", v: other, color: PART_TONE[3], text: `${w.other} ${signed(other)}` });
  const stack = parts.length && parts.every(p => p.v >= 0);
  // round 68: a part is in the key only where its bar shows (stacked, and at least 0.5% of the axis: 3px or more)
  const M = Math.max(...[f.ua, f.uaLo, f.uaHi, f.rus, f.rusLo, f.rusHi, f.frozen, f.net, f.netLo, f.netHi].filter(v => v != null && isFinite(v)).map(Math.abs), 1e-9);
  for (const p of parts) p.shown = !!stack && p.v / M >= 0.005;
  const rows = [
    { key: "ua", label: w.support, v: f.ua, lo: f.uaLo, hi: f.uaHi, value: signed(f.ua), tone: toneOf(f.ua, sure(c.ua)), note: note(c.ua), words: `${sentence(c.ua)} ${w.ofGdp} · ${c.ua.range}`,
      segs: stack ? parts.map(p => ({ v: p.v, color: p.color })) : null, parts },
    { key: "rus", label: w.trade, v: f.rus, lo: f.rusLo, hi: f.rusHi, value: signed(f.rus), tone: toneOf(f.rus, sure(c.rus)), note: note(c.rus), words: `${sentence(c.rus)} ${w.ofGdp} · ${c.rus.range}` },
  ];
  if (c.frozen) rows.push({ key: "frozen", label: w.frozen, v: f.frozen, value: signed(f.frozen), tone: "ua", words: c.frozen.verb });
  rows.push({ key: "net", label: w.net, v: f.net, lo: f.netLo, hi: f.netHi, value: signed(f.net), tone: toneOf(f.net, sure(c.net), earner), note: note(c.net),
    words: `${sentence(c.net)} ${w.ofGdp} · ${c.net.range}${c.net.chance && !c.party ? " · " + c.net.chance : ""}` });
  const legend = [{ text: w.legendSigned }, { text: w.range }, ...(rows.some(r => pale(r.tone)) ? [{ color: TONE[rows.find(r => pale(r.tone)).tone], pale: true, text: w.paler || I.img(l, "paler", { faded: "Faded: not certain" }) }] : [])];
  // round 68: the alt text is short (the chart and its four figures); the full breakdown, in the map's own words, is
  // the ImageObject's description
  const altText = `${I.img(l, "bar")}: ${c.name}, ${w.period}: ${rows.map(r => `${r.label} ${r.value}`).join("; ")} (${w.legendSigned.split(/[,،]/)[0].trim()})`;
  const desc = joinSentences([`${c.name}, ${w.period}`, c.party ? w.party : "", `${sentence(c.ua)} ${w.ofGdp} (${c.ua.eur})${parts.length ? ": " + parts.map(p => p.text).join(", ") : ""}`,
    `${sentence(c.rus)} ${w.ofGdp} (${c.rus.eur})`, c.frozen ? `${c.frozen.verb} (${c.frozen.eur})` : "", `${w.net}: ${sentence(c.net)} ${w.ofGdp} (${c.net.eur})`]);
  // a party to the war says so beneath the title, unless the title (the page's question) already does
  const partyLine = c.party && !w.title.toLowerCase().includes(w.party.split(",")[0].toLowerCase()) ? w.party : "";
  return { kind: "country", key: "country", l, iso: c.iso, title: w.title, sub: [w.period, w.unit].join(" · "), party: partyLine, rows, legend, source: w.source,
    alt: alt ? altText : "", desc: alt ? desc : "", caption: I.img(l, "cCountry", { name: c.name, period: w.period }) };
}

// ----- the image on a page: a figure near its top (the first one not lazy), with its alt text, size, caption and its
// 800px copy for small screens -----
export const SIZES = "(max-width: 820px) calc(100vw - 34px), 788px";
export function figureHtml(img, { lazy = false, caption } = {}) {
  if (!img) return "";
  const cap = caption === undefined ? img.caption || "" : caption;
  return `<figure class="chart"><img src="${img.path}" alt="${esc(img.alt)}" width="${W}" height="${H}" srcset="${smallPath(img.path)} ${W2}w, ${img.path} ${W}w" sizes="${SIZES}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
}
export const FIGURE_CSS = "\nfigure.chart{margin:14px 0 16px}figure.chart img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fbfcfc}figure.chart figcaption{font-size:14.5px;color:var(--soft);margin-top:6px}";
// schema.org: the image as an ImageObject (the page's primaryImageOfPage), its caption the figure's, its description
// the full breakdown (round 68), with Google's image-metadata fields: the charts are under the data licence, CC BY 4.0,
// explained on /downloads/
export const imageObject = (img, abs, extra = {}) => ({ "@type": "ImageObject", contentUrl: abs(img.path), url: abs(img.path), width: W, height: H, encodingFormat: "image/webp",
  caption: img.caption || img.alt, description: img.desc || img.alt, inLanguage: img.l,
  thumbnail: { "@type": "ImageObject", contentUrl: abs(smallPath(img.path)), width: W2, height: Math.round((H * W2) / W) },
  creator: { "@type": "Organization", name: "War Balance", url: abs("/") }, creditText: "War Balance", copyrightNotice: "War Balance, CC BY 4.0",
  license: "https://creativecommons.org/licenses/by/4.0/", acquireLicensePage: abs("/downloads/"), ...extra });

// ----- drawing: a few Chromium processes side by side (pages of one browser share its compositor and take turns), each
// image captured as WebP at 1200px and again at 800px -----
// jobs: [{ path, model }]; site: the site folder; browser: Playwright's browser (its type launches the others)
export async function renderImages(browser, jobs, { site, host, workers = 4, quality = 85, log = () => {} }) {
  const t0 = Date.now();
  const pageHtml = PAGE_HTML.replace(FONTS, await fontStyle(site));
  const dirs = new Set(jobs.map(j => dirname(join(site, j.path))));
  for (const d of dirs) await mkdir(d, { recursive: true });
  const n = Math.max(1, Math.min(workers, Math.ceil(jobs.length / 50)));
  const opts = process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {};
  const extra = await Promise.all(Array.from({ length: n - 1 }, () => browser.browserType().launch(opts)));
  let next = 0, bytes = 0;
  const work = async b => {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, colorScheme: "light" });
    const page = await ctx.newPage();
    await page.setContent(pageHtml, { waitUntil: "networkidle" });
    const cdp = await ctx.newCDPSession(page);
    while (next < jobs.length) {
      const j = jobs[next++];
      await page.evaluate(async ([html, cls]) => { const c = document.getElementById("c"); c.className = cls; c.removeAttribute("style"); c.innerHTML = html; await document.fonts.ready; window.fit(); },
        [chartHtml(j.model, host), j.model.kind === "country" ? "cc" : ""]);
      for (const [path, scale] of [[j.path, 1], [smallPath(j.path), W2 / W]]) {
        const { data } = await cdp.send("Page.captureScreenshot", { format: "webp", quality, clip: { x: 0, y: 0, width: W, height: H, scale }, captureBeyondViewport: false });
        const buf = Buffer.from(data, "base64");
        bytes += buf.length;
        await writeFile(join(site, path), buf);
      }
    }
    await ctx.close();
  };
  try { await Promise.all([browser, ...extra].map(work)); } finally { await Promise.all(extra.map(b => b.close())); }
  log(`images: ${jobs.length} charts at ${W}px and ${W2}px (${(bytes / Math.max(1, 2 * jobs.length) / 1024).toFixed(0)} KB each on average, ${(bytes / 1048576).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(1)}s, ${n} Chromium processes`);
  return { n: jobs.length, bytes, ms: Date.now() - t0 };
}
