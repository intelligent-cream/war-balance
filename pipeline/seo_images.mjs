// Round 62 (images for image search): chart images that answer what people search for ("ukraine support by country",
// "aid to ukraine per capita", "how much has France given to Ukraine", "frozen russian assets by country"), drawn at
// deploy from the figures the pages show (seo_pages.mjs passes the map's own numbers and words: seo_extract.mjs), in
// the map's look (its colours, fonts and bars with their range lines), so they change with the data and need no upkeep.
//
//   ranking charts   support for Ukraine by country in euros, as a share of GDP and per person, the net (toward Ukraine
//                    or toward Russia, with ranges), the money that moved toward Russia, the Russian assets frozen in
//                    each country, the countries' sanctions on Russia and (round 69) one per topic page with a table
//   country charts   one per country page and language: support for Ukraine with its parts (own aid, EU share,
//                    refugees), Russia's earnings from trade, frozen money and the net, each with its range
//
// Round 68 (image review): one diverging layout on every chart with both directions (zero at a fixed place, toward
// Ukraine to the right, toward Russia to the left, a short stub for a value near zero), each figure right after its
// bar's end with the range line lighter behind it, text large enough for a 250px thumbnail and a phone, every fill at
// 3:1 or more against the background (a less certain value striped, not paler), a short alt text with the full
// breakdown in the ImageObject's description, a visible caption, and an 800px copy of every image for srcset.
//
// Round 69 (images that win image search, after the charts that do): the ranking charts are square (1200×1200, 13
// rows in large type, readable at a 250px thumbnail) with a 1200×630 copy for link previews (og:image); a coloured
// band and accent beside a headline that states the finding (from the data, never written by hand); a flag beside each
// country (circle-flags, MIT, pipeline/vendor/circle-flags); support stacked by its parts with a key; light gridlines
// with their values; a light outline of Ukraine where the bars leave room; what is counted in the subtitle; the source
// line and the CC BY marks at the foot; the countries whose money moved toward Russia as a world map; the frozen assets
// led by one big number; and the image's credit and licence written inside each file (XMP, read by Google Images).
//
// Every image is WebP (Chromium's own encoder, through the DevTools protocol), with an 800px copy beside it
// (<name>-800.webp) and, for a square chart, its 1200×630 copy (<name>-wide.webp), written to site/img/ (not in git,
// like site/share/) at an address that stays the same from one deploy to the next (seo_i18n.mjs IMG_FILE). The models
// (rankChart, countryChart, mapChart) and the HTML (chartHtml) are pure: pipeline/test_seo.mjs tests them; the page's
// fit() only shrinks text and the bars' scale until everything fits.

import { mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as I from "./seo_i18n.mjs";

export const W = 1200, H = 630, W2 = 800;
// round 69: the two shapes: square (the page's figure, the ImageObject, the image sitemap) and wide (og:image)
export const SIZE = { sq: [1200, 1200], wide: [W, H] };
const BG = "#f7f9fb";
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// the map's colours (index.html; the share cards): blue toward Ukraine, orange toward Russia, grey for no clear
// direction. Round 68: a direction that is not certain keeps a fill of 3:1 or more on the background (uaF 3.4, ruF 3.1,
// grey 3.9) and is striped (class pl), so it differs from a sure one by more than its shade
export const TONE = { ua: "#2a6fb0", uaF: "#5c8cbd", ru: "#d4601a", ruF: "#cc7a40", grey: "#6b7f90" };
// the parts of support (own aid, EU share, refugees, the rest). Round 69: richer blues, still 10.2, 5.6, 3.4 and 3.8
// to 1 on the background
export const PART_TONE = ["#0b3d77", "#1a62c4", "#3a8bd0", "#6d8193"];
// the frozen amounts: central bank reserves, private assets (7.4 and 3.4 to 1)
export const FROZEN_TONE = ["#1d5689", "#5c8cbd"];
// round 69: the two figures of the support tracker's chart: the site's and the Kiel Institute's (10.2 and 3.8 to 1)
export const PAIR_TONE = ["#0b3d77", "#6d8193"];
// the accent band and bar of a chart, by the side it is about
const ACCENT = { ua: ["#1a62c4", "#0b3d77"], ru: ["#e0702a", "#b4500f"], both: ["#2a6fb0", "#d4601a"], grey: ["#6d8193", "#3d4f5f"] };
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
// round 69: a square chart's 1200×630 copy, for link previews
export const widePath = path => path.replace(/\.webp$/, "-wide.webp");

// a value's colour: its side, striped where its direction is not certain
export const toneOf = (v, sure = true, grey = false) => (grey ? "grey" : v >= 0 ? (sure ? "ua" : "uaF") : sure ? "ru" : "ruF");
const pale = tone => /F$/.test(tone || "");

// sentences joined with ". ", without a second full stop after an abbreviation ("серпня 2026 р.")
export const joinSentences = parts => parts.filter(Boolean).map(p => String(p).trim()).reduce((a, p) => (a ? a + (/[.!?]$/.test(a) ? " " : ". ") : "") + p, "").replace(/([^.!?])$/, "$1.");

// ----- a ranking chart: rows of { name, flag, v, lo, hi, value, note, tone, segs, pair, label, cells } on one axis -----
// rows already in their order; round 69: sub (what is counted), keys (the parts' colours), tick (an axis value's text),
// accent (ua, ru, both or grey), outline (Ukraine's outline behind the bars), hero (one big number above the bars),
// nWide (the rows of the 1200×630 copy)
export function rankChart({ key, l, title, unit, period, sub, source, rows, legend = [], keys = [], alt, desc = "", caption = "", cols = null, tick = null, accent = "ua", outline = false, hero = null, nSq = 13, nWide = 8 }) {
  return { kind: "rank", key, l, title, sub: sub || I.cap([period, unit].filter(Boolean).join(" · ")), source, legend, keys, alt, desc: desc || alt, caption, cols, tick, accent, outline, hero, nSq, nWide,
    rows: rows.map((r, i) => ({ rank: r.rank ?? i + 1, ...r })) };
}

// the axis: from the smallest to the largest of the values and their ranges, always with zero
export function domain(rows, pad = 0) {
  let lo = 0, hi = 0;
  for (const r of rows) for (const x of [r.v, r.lo, r.hi, ...(r.segs || []).map(s => s.v), ...(r.pair || []).map(p => p.v)]) if (x != null && isFinite(x)) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
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
// round 69: the gridlines' values: a round step (1, 2, 2.5 or 5 times a power of ten), about four across the axis
export function niceTicks(lo, hi, n = 5) {
  const span = hi - lo;
  if (!(span > 0)) return [0];
  const raw = span / n, p = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map(m => m * p).find(s => s >= raw) || 10 * p;
  const out = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + step * 1e-9; t += step) out.push(+t.toFixed(10));
  return out;
}

// an axis value's text: tick { l, unit: eur | pct | pp | n, signed } (or a function)
export const tickText = (tk, v) => {
  if (typeof tk === "function") return tk(v);
  if (Math.abs(v) < 1e-12) return "0";
  const sg = tk.signed ? (v > 0 ? "+" : "−") : v < 0 ? "−" : "", a = Math.abs(v);
  return sg + (tk.unit === "pct" ? I.P(tk.l, a).replace(/([.,])0(?=\s?%)/, "") : tk.unit === "pp" ? I.PP(tk.l, a) : tk.unit === "n" ? String(a) : I.E(tk.l, a));
};

// a row's bar (or stacked parts, or a pair of bars), its range line and its figure, placed from zero (z, percent of
// the bar area) with each length in percent at full scale (k per unit), times the chart's scale --s that fit() sets so
// that every figure fits. A bar is at least 4px long, so a value near zero still shows beside the zero line.
const P = x => +x.toFixed(3);
function barHtml(r, z, k, { big = false } = {}) {
  const at = off => `calc(${P(z)}% + var(--s) * ${P(off * k)}%)`;
  let out = `<span class="ax" style="left:${P(z)}%"></span>`, end = 0;
  const cls = `b${pale(r.tone) ? " pl" : ""}${big ? " big" : ""}`;
  const labAt = (e0, html, extra = "") => {
    const e = P(Math.abs(e0) * k), neg = e0 < 0;
    return `<span class="lab${extra}" data-e="${neg ? -e : e}" style="${neg ? `right:calc(${P(100 - z)}% + max(4px, var(--s) * ${e}%) + 6px)` : `left:calc(${P(z)}% + max(4px, var(--s) * ${e}%) + 6px)`}">${html}</span>`;
  };
  if (r.pair && r.pair.length) {
    // round 69: two bars side by side (the site's figure and another's), each with its own figure
    r.pair.forEach((p, i) => {
      out += `<i class="b p${i}" style="left:${P(z)}%;width:max(4px, calc(var(--s) * ${P(Math.abs(p.v) * k)}%));background-color:${p.color}"></i>`;
      out += labAt(p.v, p.label, ` p${i}`);
    });
    return out;
  }
  if (r.segs && r.segs.length) {
    let pos = 0, neg = 0;
    const segs = r.segs.filter(s => s.v && !s.back);
    segs.forEach((s, i) => {
      const a = s.v > 0 ? pos : neg + s.v;
      if (s.v > 0) pos += s.v; else neg += s.v;
      // a 2px gap of the background between parts
      const gap = i < segs.length - 1 && s.v > 0 ? `;border-right:2px solid ${BG}` : "";
      out += `<i class="${cls}" style="left:${at(a)};width:calc(var(--s) * ${P(Math.abs(s.v) * k)}%);background-color:${s.color}${gap}"></i>`;
    });
    // round 69: money flowing back (a part below zero, subtracted from the parts above it): striped over the end of the
    // stack, which then ends at the row's total
    for (const s of r.segs.filter(x => x.back && x.v < 0)) out += `<i class="b bk" style="left:${at(pos + s.v)};width:calc(var(--s) * ${P(-s.v * k)}%)"></i>`;
    end = pos || neg;
  } else if (r.v != null) {
    const w = `max(4px, calc(var(--s) * ${P(Math.abs(r.v) * k)}%))`, col = TONE[r.tone] || r.color || TONE.grey;
    out += `<i class="${cls}${r.v < 0 ? " neg" : ""}" style="${r.v < 0 ? `right:${P(100 - z)}%` : `left:${P(z)}%`};width:${w};background-color:${col};--c:${col}"></i>`;
    end = r.v;
  }
  // round 69: the range line thin and light, beneath the bar (never through a figure, which sits on the background)
  if (r.lo != null && r.hi != null && isFinite(r.lo) && isFinite(r.hi) && Math.abs(r.hi - r.lo) > 1e-9) {
    const a = Math.min(r.lo, r.hi), b = Math.max(r.lo, r.hi);
    out += `<i class="w" data-a="${P(a * k)}" data-b="${P(b * k)}" style="left:${at(a)};width:calc(var(--s) * ${P((b - a) * k)}%)"></i>`;
  }
  // the figure right after the bar's end (not the range line's), on its own side of zero
  if (r.label) out += labAt(end === 0 && r.v < 0 ? -1e-9 : end, r.label);
  // a country chart's row name, on the other side of zero from its bar
  if (r.name != null && r.nameSide) out += `<span class="nm ${end < 0 || r.v < 0 ? "nr" : "nl"}" style="${end < 0 || r.v < 0 ? `left:calc(${P(z)}% + 14px)` : `right:calc(${P(100 - z)}% + 14px)`}">${esc(r.name)}</span>`;
  return out;
}

const CSS = `*{box-sizing:border-box;margin:0}html,body{width:1200px;height:1200px;overflow:hidden;background:${BG}}
#c{--s:1;--W:${W}px;--H:${H}px;--px:40px;--band:10px;--ht:22px;--h1:46px;--sub:21px;--fs:24px;--rh:36px;--flw:30px;--ff:16px;--accw:9px;--hero:84px;--rt:12px;--a1:#1a62c4;--a2:#0b3d77;
position:fixed;left:0;top:0;width:var(--W);height:var(--H);background:${BG};color:#15212b;font:400 var(--fs)/1.2 "Source Sans 3",system-ui,sans-serif;padding:0 var(--px) 14px;display:flex;flex-direction:column;font-variant-numeric:tabular-nums;overflow:hidden}
#c.sq{--W:1200px;--H:1200px;--px:56px;--band:16px;--ht:40px;--h1:60px;--sub:27px;--fs:31px;--rh:58px;--flw:46px;--ff:20px;--accw:13px;--hero:128px;--rt:18px;padding-bottom:22px}
#c.cc{--fs:26px}
.band{flex:none;height:var(--band);margin:0 calc(-1 * var(--px));background:linear-gradient(90deg,var(--a1),var(--a2))}
.hd{flex:none;display:flex;gap:calc(var(--accw) * 1.6);margin-top:var(--ht);align-items:stretch;position:relative;z-index:2}
.hd .acc{flex:none;width:var(--accw);border-radius:4px;background:linear-gradient(180deg,var(--a1),var(--a2))}
.hd .tf{flex:none;width:calc(var(--h1) * 1.5);height:calc(var(--h1) * 1.5);align-self:center}.hd .tf img{width:100%;height:100%;display:block}
.hd>div{min-width:0;flex:1}
h1{font:800 var(--h1)/1.04 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.02em;color:#0f1d2a;text-wrap:balance}
.sub{margin-top:8px;font-size:var(--sub);line-height:1.22;color:#45535e;text-wrap:pretty}.party{margin-top:6px;font-size:var(--sub);font-weight:700;color:#8a2f2f}
.keys{flex:none;display:flex;flex-wrap:wrap;gap:4px 24px;margin-top:calc(var(--rt) * .9);font-size:calc(var(--fs) * .78);color:#25333e;position:relative;z-index:2}
.keys span{white-space:nowrap}.keys i{display:inline-block;width:.9em;height:.9em;border-radius:3px;margin-right:7px;vertical-align:-2px}
.hero{flex:none;display:flex;align-items:center;gap:22px;margin-top:var(--rt);padding:14px 22px;background:#e6eef7;border-radius:14px;position:relative;z-index:2}
.hero b{font:800 var(--hero)/1 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.03em;color:#0b3d77;white-space:nowrap}
.hero span{font-size:calc(var(--fs) * 1.05);font-weight:700;line-height:1.15;color:#15212b}.hero small{display:block;margin-top:6px;font-size:calc(var(--fs) * .78);font-weight:400;color:#45535e;line-height:1.2}
.rows{flex:1;min-height:0;overflow:hidden;margin-top:var(--rt);display:grid;grid-template-columns:max-content 1fr;grid-auto-rows:minmax(var(--rh),1fr);column-gap:14px;align-items:stretch;position:relative;z-index:1}
.rows.fl{grid-template-columns:var(--flw) max-content 1fr}.rows.one{grid-template-columns:1fr}.rows.cols{grid-template-columns:max-content 1fr max-content max-content}
.rows>.f{align-self:center;width:var(--flw);height:var(--flw);border-radius:50%;box-shadow:0 0 0 1.5px rgba(21,33,43,.14)}.rows>.f img{width:100%;height:100%;display:block}
.rows>.n{align-self:center;text-align:left;font-weight:600;max-width:calc(var(--fs) * 11);line-height:1.02;text-wrap:balance}
.rows>.grp{grid-column:1/-1;align-self:end;font:700 calc(var(--fs) * .78)/1.1 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#45535e}
.rows>.ch{align-self:end;font-size:calc(var(--fs) * .8);color:#45535e;white-space:nowrap;padding-bottom:2px}.rows>.ch i{display:inline-block;width:.75em;height:.75em;border-radius:2px;margin-right:5px;vertical-align:-1px}
.rows>.cv{align-self:center;text-align:right;font-weight:700;white-space:nowrap}.rows>.cv.na{font-weight:400;color:#45535e}
.gl{position:absolute;inset:0;overflow:hidden;z-index:0}.gl i{position:absolute;top:0;bottom:0;width:1px;margin-left:-.5px;background:#d5dee6}.gl i.z{width:2px;margin-left:-1px;background:#5d6b77}
.axl{position:relative;overflow:hidden;min-height:calc(var(--fs) * 1.05);align-self:stretch}.axl span{position:absolute;top:2px;transform:translateX(-50%);font-size:calc(var(--fs) * .66);color:#5d6b77;white-space:nowrap}.axl span.z{transform:none}
.bar{position:relative;z-index:1}
.bar .ax{display:none}
.bar .b{position:absolute;top:19%;bottom:25%;border-radius:0 4px 4px 0}.bar .b.neg{border-radius:4px 0 0 4px}
.bar .b.p0{top:6%;bottom:54%}.bar .b.p1{top:54%;bottom:6%}
.bar .b.bk{background:repeating-linear-gradient(135deg,${BG} 0 3px,rgba(247,249,251,.25) 3px 8px);border-radius:0 4px 4px 0;box-shadow:inset 0 0 0 1.5px #6d8193}
.bar .b.pl{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 3px,transparent 3px 9px);box-shadow:inset 0 0 0 2px var(--c,transparent)}
.bar .w{position:absolute;top:84%;height:2px;margin-top:-1px;background:#7b8995;opacity:.75}
.bar .w::before,.bar .w::after{content:"";position:absolute;top:-4px;height:10px;width:2px;background:#7b8995}.bar .w::before{left:0}.bar .w::after{right:-1px}
.bar .lab{position:absolute;top:42%;transform:translateY(-50%);white-space:nowrap;line-height:1.05;padding:1px 5px;background:${BG};border-radius:4px;z-index:2}
.bar .lab.p0{top:26%}.bar .lab.p1{top:74%}.bar .lab.p0 b{font-size:calc(var(--fs) * .9)}.bar .lab.p1 b{font-size:calc(var(--fs) * .82)}
.lab b{font-weight:800;font-size:calc(var(--fs) * 1.08)}.lab small{font-size:calc(var(--fs) * .74);color:#45535e;margin-left:7px}.lab .t{font-weight:600;color:#15212b;margin-left:9px}
.ctry{flex:1;min-height:0;overflow:hidden;margin-top:10px;display:flex;flex-direction:column;justify-content:space-evenly;position:relative;z-index:1}
.ctry .bar{height:calc(var(--fs) * 2.1);flex:none}.ctry .bar.big{height:calc(var(--fs) * 2.6)}
.ctry .bar .b{top:14%;bottom:20%}.ctry .bar .lab{top:47%}
.ctry .bar .ax{display:block;position:absolute;top:0;bottom:0;width:2px;margin-left:-1px;background:#15212b;opacity:.6}
.ctry .nm{position:absolute;top:47%;transform:translateY(-50%);z-index:2;padding:1px 6px;background:${BG};border-radius:4px;font:700 var(--fs)/1.05 Archivo,"Helvetica Neue",Arial,sans-serif;max-width:calc(50% - 20px);text-wrap:balance}.ctry .nl{text-align:right}
.ctry .lab b{font-family:Archivo,"Helvetica Neue",Arial,sans-serif;font-weight:800;font-size:calc(var(--fs) * 1.2);letter-spacing:-.01em}.ctry .big .lab b,.ctry .bar.big .lab b{font-size:calc(var(--fs) * 1.5)}
.parts{display:flex;flex-wrap:wrap;justify-content:center;gap:2px 22px;font-size:calc(var(--fs) * .8);color:#25333e;margin-top:-4px}.parts i{display:inline-block;width:.85em;height:.85em;border-radius:3px;margin-right:6px;vertical-align:-1px}
.ukr{position:absolute;right:calc(var(--px) * .7);bottom:calc(var(--ff) * 5.5);width:calc(var(--W) * .34);z-index:0;opacity:.9}.ukr path{fill:#e1ebf5;stroke:#c3d4e5;stroke-width:1.2;stroke-linejoin:round}
#c.wide .ukr{width:calc(var(--W) * .2)}
.map{flex:none;margin-top:var(--rt);position:relative;z-index:1}.map svg{display:block;width:100%;height:auto}
.map path{stroke:#fff;stroke-width:.35;stroke-linejoin:round}.map .sn{font:italic 600 14px "Source Sans 3",sans-serif;fill:#5d6b77}.map .ml rect{fill:#fff;stroke:#15212b;stroke-opacity:.25;stroke-width:.6}.map .ml text{font:700 15px "Source Sans 3",sans-serif;fill:#15212b}.map .ml text tspan.v{font-weight:800;fill:#b4500f}.map .ml circle{fill:#15212b}.map .ml line{stroke:#15212b;stroke-width:.8}
.tl{flex:1;min-height:0;margin-top:var(--rt);display:grid;grid-template-columns:1fr 1fr;grid-auto-rows:minmax(0,1fr);gap:0 36px;font-size:calc(var(--fs) * .92)}
.tl>div{display:flex;align-items:center;gap:12px;border-top:1px solid #dfe5ea;min-height:0}.tl .k{width:1.3em;color:#45535e;font-weight:600;text-align:right}.tl img{width:calc(var(--fs) * 1.25);height:calc(var(--fs) * 1.25);border-radius:50%}
.tl .nn{flex:1;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tl b{font-weight:800;color:#b4500f;white-space:nowrap}
.ft{flex:none;display:grid;grid-template-columns:max-content minmax(0,1fr) max-content;grid-template-areas:"wb src cc" "wb leg cc";align-items:center;gap:3px 22px;margin-top:12px;padding-top:12px;border-top:1px solid #dbe2e8;font-size:var(--ff);color:#45535e;line-height:1.25;position:relative;z-index:2}
#c.sq .ft{grid-template-areas:"src src src" "wb leg cc";row-gap:10px}
.ft .wb{grid-area:wb;font:800 calc(var(--ff) * 1.15)/1 Archivo,"Helvetica Neue",Arial,sans-serif;color:#15212b;white-space:nowrap}.ft .wb i{display:inline-block;width:.7em;height:.7em;border-radius:3px;margin-right:3px}
.ft .src{grid-area:src;color:#25333e}.ft .leg{grid-area:leg;color:#5d6b77}.ft .leg i{display:inline-block;width:.8em;height:.8em;border-radius:2px;margin:0 5px 0 0;vertical-align:-1px}
.ft .cc{grid-area:cc;display:flex;gap:4px}.ft .cc svg{width:calc(var(--ff) * 1.55);height:calc(var(--ff) * 1.55)}`;
// the page's fit(): the title on two lines at most (three on a square chart), then everything on the image (the rows'
// height, then the text smaller step by step), then the bars' scale so that every figure and range line stays inside
// its row; the gridlines' values past the end of the axis are hidden
const FIT = `<script>window.fit=()=>{const c=document.getElementById("c"),st=(k,v)=>c.style.setProperty(k,v),h1=c.querySelector("h1"),rows=c.querySelector(".rows,.ctry,.tl"),sq=c.classList.contains("sq");
st("--s",1);const lh=()=>parseFloat(getComputedStyle(h1).fontSize)*1.04,lines=()=>Math.round(h1.offsetHeight/lh());
let h=sq?60:46;const maxL=sq?3:2,minH=sq?44:32;while(lines()>maxL&&h>minH){h-=2;st("--h1",h+"px")}
const over=()=>(rows&&rows.scrollHeight>rows.clientHeight+1)||c.scrollHeight>c.clientHeight+1;
const steps=sq?[["--rh","52px"],["--rh","47px"],["--fs","28px"],["--sub","24px"],["--h1",Math.min(h,54)+"px"],["--rh","43px"],["--fs","26px"],["--rh","39px"],["--fs","24px"],["--sub","21px"],["--rh","35px"],["--fs","22px"],["--h1",Math.min(h,46)+"px"]]
:[["--rh","32px"],["--rh","29px"],["--fs","22px"],["--sub","20px"],["--h1",Math.min(h,42)+"px"],["--rh","26px"],["--fs","20px"],["--h1",Math.min(h,38)+"px"],["--sub","18px"],["--rh","22px"],["--fs","18px"]];
for(const [k,v] of steps){if(!over())break;st(k,v)}
let s=1;for(const b of c.querySelectorAll(".bar")){const A=b.clientWidth,ax=b.querySelector(".ax");if(!A||!ax)continue;const z=parseFloat(ax.style.left)/100;
for(const w of b.querySelectorAll(".w")){const a=+w.dataset.a/100,bb=+w.dataset.b/100;if(bb>0)s=Math.min(s,(1-z)/bb);if(a<0)s=Math.min(s,z/-a)}
for(const l of b.querySelectorAll(".lab")){const e=+l.dataset.e/100,lw=l.offsetWidth+8;if(e>0)s=Math.min(s,(A*(1-z)-lw)/(A*e));else if(e<0)s=Math.min(s,(A*z-lw)/(A*-e))}}
st("--s",Math.max(.05,s));
for(const t of c.querySelectorAll(".axl span")){const p=t.parentNode.clientWidth;if(t.offsetLeft+t.offsetWidth/2>p-2||t.offsetLeft<-1)t.style.visibility="hidden"}}</script>`;
export const PAGE_HTML = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style>${FIT}</head><body><div id="c"></div></body></html>`;

// a figure's text colour: its side's darker shade (readable on the light background), grey without a direction
const inkOf = tone => (tone === "grey" ? "#3d4f5f" : /^ru/.test(tone) ? "#b4500f" : "#0b4f96");
// the CC BY marks (Creative Commons' own two signs, drawn small)
const CC_MARKS = `<span class="cc" aria-label="CC BY 4.0"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff" stroke="#45535e" stroke-width="5"/><text x="32" y="41" text-anchor="middle" font-family="Archivo,Arial,sans-serif" font-weight="800" font-size="26" fill="#45535e" letter-spacing="-1">cc</text></svg><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#fff" stroke="#45535e" stroke-width="5"/><circle cx="32" cy="17" r="5.5" fill="#45535e"/><path d="M24 25h16a2 2 0 0 1 2 2v12h-5v13H27V39h-5V27a2 2 0 0 1 2-2z" fill="#45535e"/></svg></span>`;
const brand = () => `<span class="wb"><i style="background:${TONE.ua}"></i><i style="background:${TONE.ru}"></i> War Balance</span>`;
const swatch = x => (x.pale ? `<i class="pl" style="background:${x.color};background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 3px,transparent 3px 7px)"></i>` : `<i style="background:${x.color}"></i>`);
const legendHtml = items => `<span class="leg">${items.map(x => (x.color ? `${swatch(x)}${esc(x.text)}` : esc(x.text))).join(" · ")}</span>`;
const foot = m => `<div class="ft">${brand()}<span class="src">${esc(m.source)}</span>${legendHtml(m.legend || [])}${CC_MARKS}</div>`;
const flagImg = (ctx, f) => (f && ctx.flags && ctx.flags[f] ? `<img src="${ctx.flags[f]}" alt="">` : "");
const head = (m, ctx = {}) => {
  const tf = m.flag ? flagImg(ctx, m.flag) : "";
  return `<div class="band"></div><div class="hd"><i class="acc"></i>${tf ? `<span class="tf">${tf}</span>` : ""}<div><h1>${esc(m.title)}</h1>${m.sub ? `<p class="sub">${esc(m.sub)}</p>` : ""}${m.party ? `<p class="party">${esc(m.party)}</p>` : ""}</div></div>`;
};
const keysHtml = keys => (keys && keys.length ? `<div class="keys">${keys.map(x => `<span>${swatch(x)}${esc(x.text)}</span>`).join("")}</div>` : "");
const figLabel = r => r.label || `<b style="color:${inkOf(r.tone)}">${esc(r.value)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ""}`;
// the accent's two colours as the chart's CSS variables
export const accentStyle = a => { const [a1, a2] = ACCENT[a] || ACCENT.ua; return `--a1:${a1};--a2:${a2}`; };

// the HTML of one chart, inside the page above (#c). ctx: { flags: { iso2: data URI }, ukr: { d, w, h }, world } (the
// renderer's, from the vendored flags and the map's own atlas); size: "sq" or "wide"
export function chartHtml(m, host, ctx = {}, size = "wide") {
  const sq = size === "sq";
  if (m.kind === "map") return mapHtml(m, ctx, sq);
  if (m.kind === "rank") {
    const rows = m.rows.slice(0, sq ? m.nSq || 13 : m.nWide || 8);
    // the net's two groups keep both ends on the wide copy
    const shown = !sq && m.rowsWide ? m.rowsWide : rows;
    const d = domain(shown), k = 100 / (d.hi - d.lo), z = -d.lo * k;
    const named = shown.some(r => r.name), cols = m.cols && m.cols.length ? m.cols : null, flags = named && shown.some(r => r.flag);
    const grid = cols ? "cols" : !named ? "one" : flags ? "fl" : "";
    const pre = flags ? 2 : named ? 1 : 0;
    const colHead = cols ? `${named ? "<span></span>" : ""}<span></span>${cols.map(c => `<span class="ch">${c.color ? swatch(c) : ""}${esc(c.text)}</span>`).join("")}` : "";
    const row = r => `${r.sepBefore ? `<div class="grp">${esc(r.sepBefore)}</div>` : ""}${flags ? `<span class="f">${flagImg(ctx, r.flag)}</span>` : ""}${named ? `<span class="n">${esc(r.name)}</span>` : ""}<span class="bar">${gl}${barHtml({ ...r, label: cols ? "" : r.pair ? "" : figLabel(r), pair: r.pair ? r.pair.map(p => ({ ...p, label: p.label || `<b style="color:${p.ink || "#15212b"}">${esc(p.value)}</b>` })) : null }, z, k)}</span>${cols ? (r.cells || []).map(x => `<span class="cv${x.na ? " na" : ""}"${x.color ? ` style="color:${x.color}"` : ""}>${esc(x.text)}</span>`).join("") : ""}`;
    // round 69: light gridlines with their values, behind the bars (each row draws its piece of every line; not on a
    // chart with columns of figures)
    let gl = "", axisHtml = "";
    if (m.tick && !cols) {
      const ticks = niceTicks(d.lo, d.hi, 6), pos = t => `calc(${P(z)}% + var(--s) * ${P(t * k)}%)`;
      gl = `<span class="gl">${ticks.map(t => `<i${Math.abs(t) < 1e-12 ? ' class="z"' : ""} style="left:${pos(t)}"></i>`).join("")}</span>`;
      axisHtml = `${"<span></span>".repeat(pre)}<span class="axl">${ticks.map(t => `<span${Math.abs(t) < 1e-12 && z < 1 ? ' class="z"' : ""} style="left:${pos(t)}">${esc(tickText(m.tick, t))}</span>`).join("")}</span>`;
    }
    const outline = m.outline && ctx.ukr ? `<svg class="ukr" viewBox="0 0 ${ctx.ukr.w} ${ctx.ukr.h}" aria-hidden="true"><path d="${ctx.ukr.d}"/></svg>` : "";
    const hero = m.hero ? `<div class="hero"><b>${esc(m.hero.big)}</b><span>${esc(m.hero.text)}${m.hero.small ? `<small>${esc(m.hero.small)}</small>` : ""}</span></div>` : "";
    return `${head(m, ctx)}${hero}${keysHtml(m.keys)}${outline}<div class="rows ${grid}">${colHead}${shown.map(row).join("")}${axisHtml}</div>${foot(m)}`;
  }
  // a country: its rows on one axis in euros, zero in the middle (toward Ukraine to the right, toward Russia to the
  // left), each row's name on the other side of zero from its bar; the parts of support beneath its bar
  let M = 0;
  for (const r of m.rows) for (const x of [r.v, r.lo, r.hi, r.segs ? r.segs.filter(s => s.v > 0).reduce((a, s) => a + s.v, 0) : 0]) if (x != null && isFinite(x)) M = Math.max(M, Math.abs(x));
  const k = 50 / (M || 1);
  return `${head(m, ctx)}<div class="ctry">${m.rows.map(r => {
    const vis = (r.parts || []).filter(p => p.shown);
    return `<div class="bar${r.key === "net" ? " big" : ""}">${barHtml({ ...r, name: r.label, nameSide: true, label: figLabel({ ...r, label: "", note: r.note }) }, 50, k, { big: r.key === "net" })}</div>${vis.length ? `<p class="parts">${vis.map(p => `<span><i style="background:${p.color}"></i>${esc(p.text)}</span>`).join("")}</p>` : ""}`;
  }).join("")}</div>${foot(m)}`;
}

// ----- a country's chart, from the map's figures and words in a language (seo_extract.mjs country()) -----
// c: the country in this language; earner: no clear direction (the share cards' grey); words: { title, period, source,
// unit, legendSigned, range, support, trade, frozen, net, ofGdp, party, partNames: {aid, euaid, ref}, other, paler };
// flag: its two-letter code (round 69: its flag beside the title)
export function countryChart({ c, l, earner = false, words: w, alt = true, flag = "" }) {
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
  const accent = c.party ? "grey" : f.net >= 0 ? "ua" : "ru";
  return { kind: "country", key: "country", l, iso: c.iso, flag, accent, title: w.title, sub: [w.period, w.unit].join(" · "), party: partyLine, rows, legend, source: w.source,
    alt: alt ? altText : "", desc: alt ? desc : "", caption: I.img(l, "cCountry", { name: c.name, period: w.period }) };
}

// ----- round 69: a world map, each country in the colour of its group (the map's own groups of the net) -----
// countries: { "<numeric id>": tone key }; tones: { key: { color, text } } in the key's order; labels: [{ id, name,
// value }] (the countries named on the map, with their figure); list: the square copy's list beneath the map
export function mapChart({ l, title, sub, source, countries, tones, labels = [], list = [], sides = [], alt, desc = "", caption = "", accent = "ru" }) {
  return { kind: "map", key: "map", l, title, sub, source, countries, tones, labels, list, sides, alt, desc: desc || alt, caption, accent, legend: [] };
}
function mapHtml(m, ctx, sq) {
  const wd = ctx.world;
  if (!wd) throw new Error("seo_images.mjs: no world atlas for the map");
  const fill = id => (m.tones[m.countries[id]] || m.tones.none || { color: "#e3e8ec" }).color;
  const paths = wd.shapes.map(s => `<path d="${s.d}" fill="${fill(s.id)}"${m.countries[s.id] === "side" ? ' class="sd"' : ""}/>`).join("");
  // the two sides (no figure of their own): outlined, with their names
  const sides = (m.sides || []).map(x => { const s = wd.shapes.find(y => y.id === x.id); return s ? `<text class="sn" x="${P(s.cx + (x.dx || 0))}" y="${P(s.cy + (x.dy || 0))}" text-anchor="middle">${esc(x.name)}</text>` : ""; }).join("");
  // the named countries: a dot at the shape's centre, its name and figure in a box beside it (moved down when two
  // boxes would overlap)
  const boxes = [];
  const lab = m.labels.map(x => {
    const s = wd.shapes.find(y => y.id === x.id);
    if (!s) return "";
    const w = 12 + 8.2 * (x.name.length + x.value.length + 1), h = 24;
    let bx = s.cx + 16, by = s.cy - h / 2;
    if (bx + w > wd.w - 4) bx = s.cx - 16 - w;
    for (let i = 0; i < 12 && boxes.some(b => bx < b[0] + b[2] + 4 && b[0] < bx + w + 4 && by < b[1] + b[3] + 3 && b[1] < by + h + 3); i++) by += h + 4;
    boxes.push([bx, by, w, h]);
    const lx = bx > s.cx ? bx : bx + w;
    return `<g class="ml"><line x1="${P(s.cx)}" y1="${P(s.cy)}" x2="${P(lx)}" y2="${P(by + h / 2)}"/><circle cx="${P(s.cx)}" cy="${P(s.cy)}" r="3"/><rect x="${P(bx)}" y="${P(by)}" width="${P(w)}" height="${h}" rx="5"/><text x="${P(bx + 6)}" y="${P(by + 17)}">${esc(x.name)} <tspan class="v">${esc(x.value)}</tspan></text></g>`;
  }).join("");
  const keys = Object.values(m.tones).filter(t => t.text).map(t => ({ color: t.color, text: t.text }));
  const list = sq && m.list.length ? `<div class="tl">${m.list.map((x, i) => `<div><span class="k">${i + 1}</span>${flagImg(ctx, x.flag)}<span class="nn">${esc(x.name)}</span><b>${esc(x.value)}</b></div>`).join("")}</div>` : "";
  return `${head(m, ctx)}<div class="map"><svg viewBox="0 0 ${wd.w} ${wd.h}" role="img">${paths}${sides}${lab}</svg></div>${keysHtml(keys)}${list}${sq && !list ? '<div style="flex:1"></div>' : ""}${foot(m)}`;
}

// ----- the atlas: the map's own countries-50m.json (TopoJSON), decoded here (no library) -----
function decodeTopo(topo) {
  const t = topo.transform;
  const arcs = topo.arcs.map(a => { let x = 0, y = 0; return a.map(p => (t ? (x += p[0], y += p[1], [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]]) : p)); });
  const ring = idx => { const pts = []; for (const i of idx) { const a = i < 0 ? arcs[~i].slice().reverse() : arcs[i]; a.forEach((p, k) => { if (k === 0 && pts.length) return; pts.push(p); }); } return pts; };
  return topo.objects.countries.geometries.map(g => ({ id: g.id, polys: (g.type === "Polygon" ? [g.arcs] : g.type === "MultiPolygon" ? g.arcs : []).map(p => p.map(ring)) }));
}
// Crimea: a ring of Russia's shape in the atlas, drawn with Ukraine (its internationally recognised borders)
const isCrimea = ring => { const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]); return Math.min(...xs) > 32 && Math.max(...xs) < 37 && Math.min(...ys) > 44 && Math.max(...ys) < 46.5 && ring.length > 20; };
function withCrimea(geos) {
  const ru = geos.find(g => g.id === "643"), ua = geos.find(g => g.id === "804");
  if (!ru || !ua) return geos;
  const cr = ru.polys.filter(p => isCrimea(p[0]));
  if (!cr.length) return geos;
  ru.polys = ru.polys.filter(p => !cr.includes(p));
  ua.polys = ua.polys.concat(cr);
  return geos;
}
// the Natural Earth projection (Šavrič et al.), as d3-geo's geoNaturalEarth1
const natEarth = (lon, lat) => {
  const l = (lon * Math.PI) / 180, f = (lat * Math.PI) / 180, f2 = f * f, f4 = f2 * f2;
  return [l * (0.8707 - 0.131979 * f2 + f4 * (-0.013791 + f4 * (0.003971 * f2 - 0.001529 * f4))), f * (1.007226 + f2 * (0.015085 + f4 * (-0.044475 + 0.028874 * f2 - 0.005916 * f4)))];
};
// (a ring that crosses the 180th meridian is broken there: no line across the whole map)
const pathOf = (rings, proj, minD = 0.6) => rings.map(r => {
  let out = "", last = null, n = 0, lon0 = null, broken = false;
  for (const p of r) {
    const [x, y] = proj(p), jump = lon0 != null && Math.abs(p[0] - lon0) > 180;
    lon0 = p[0]; broken = broken || jump;
    if (last && !jump && Math.hypot(x - last[0], y - last[1]) < minD) continue;
    out += (n && !jump ? "L" : "M") + P(x).toFixed(1).replace(/\.0$/, "") + " " + P(y).toFixed(1).replace(/\.0$/, "");
    last = [x, y]; n++;
  }
  return n >= 3 ? out + (broken ? "" : "Z") : "";
}).join("");
const areaC = pts => { let a = 0, cx = 0, cy = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const f = pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1]; a += f; cx += (pts[j][0] + pts[i][0]) * f; cy += (pts[j][1] + pts[i][1]) * f; } return a ? { a: a / 2, cx: cx / (3 * a), cy: cy / (3 * a) } : { a: 0, cx: pts[0][0], cy: pts[0][1] }; };
// the world in a 1000-wide box (without Antarctica), each country's path and the centre of its largest piece
export function worldShapes(topo, width = 1000) {
  const geos = withCrimea(decodeTopo(topo)).filter(g => g.id !== "010" && g.id);
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const g of geos) for (const p of g.polys) for (const q of p[0]) { const [x, y] = natEarth(q[0], Math.max(-58, q[1])); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, -y); y1 = Math.max(y1, -y); }
  const k = width / (x1 - x0), proj = q => { const [x, y] = natEarth(q[0], Math.max(-58, q[1])); return [(x - x0) * k, (-y - y0) * k]; };
  const shapes = geos.map(g => {
    const big = g.polys.map(p => ({ p, c: areaC(p[0].map(proj)) })).sort((a, b) => Math.abs(b.c.a) - Math.abs(a.c.a))[0];
    return { id: g.id, d: g.polys.map(p => pathOf(p, proj)).join(""), cx: big ? big.c.cx : 0, cy: big ? big.c.cy : 0 };
  }).filter(s => s.d);
  return { w: width, h: Math.ceil((y1 - y0) * k), shapes };
}
// Ukraine's outline (with Crimea) in its own box, for the charts' background
export function ukraineOutline(topo, width = 400) {
  const ua = withCrimea(decodeTopo(topo)).find(g => g.id === "804");
  const kx = Math.cos((48.5 * Math.PI) / 180), pts = ua.polys.flatMap(p => p[0]);
  const xs = pts.map(p => p[0] * kx), ys = pts.map(p => -p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), k = width / (Math.max(...xs) - x0);
  return { d: ua.polys.map(p => pathOf(p, q => [(q[0] * kx - x0) * k, (-q[1] - y0) * k], 0.8)).join(""), w: width, h: Math.ceil((Math.max(...ys) - y0) * k) };
}

// ----- the image on a page: a figure near its top (the first one not lazy), with its alt text, size, caption and its
// 800px copy for small screens -----
export const SIZES = "(max-width: 820px) calc(100vw - 34px), 788px";
export function figureHtml(img, { lazy = false, caption } = {}) {
  if (!img) return "";
  const cap = caption === undefined ? img.caption || "" : caption, w = img.w || W, h = img.h || H;
  return `<figure class="chart"><img src="${img.path}" alt="${esc(img.alt)}" width="${w}" height="${h}" srcset="${smallPath(img.path)} ${W2}w, ${img.path} ${w}w" sizes="${h > w * 0.8 ? SIZES_SQ : SIZES}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ""}</figure>`;
}
// a square chart is at most 640px wide on a page (so its text and the next lines stay in view)
export const SIZES_SQ = "(max-width: 680px) calc(100vw - 34px), 640px";
export const FIGURE_CSS = "\nfigure.chart{margin:14px 0 16px}figure.chart img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#f7f9fb}figure.chart img[height=\"1200\"]{max-width:640px}figure.chart figcaption{font-size:14.5px;color:var(--soft);margin-top:6px}";
// schema.org: the image as an ImageObject (the page's primaryImageOfPage), its caption the figure's, its description
// the full breakdown (round 68), with Google's image-metadata fields: the charts are under the data licence, CC BY 4.0,
// explained on /downloads/
export const imageObject = (img, abs, extra = {}) => {
  const w = img.w || W, h = img.h || H;
  return { "@type": "ImageObject", contentUrl: abs(img.path), url: abs(img.path), width: w, height: h, encodingFormat: "image/webp",
    caption: img.caption || img.alt, description: img.desc || img.alt, inLanguage: img.l,
    thumbnail: { "@type": "ImageObject", contentUrl: abs(smallPath(img.path)), width: W2, height: Math.round((h * W2) / w) },
    creator: { "@type": "Organization", name: "War Balance", url: abs("/") }, creditText: "War Balance", copyrightNotice: "War Balance, CC BY 4.0",
    license: "https://creativecommons.org/licenses/by/4.0/", acquireLicensePage: abs("/downloads/"), ...extra };
};

// ----- round 69: the image's credit and licence inside the file (XMP: IPTC Creator, Credit Line, Copyright Notice,
// Web Statement of Rights, Licensor URL), the fields Google Images reads; added as WebP's XMP chunk, without
// re-encoding -----
export const XMP_RIGHTS = { creator: "War Balance", credit: "War Balance (warbalance.org)", rights: "War Balance, CC BY 4.0", statement: "https://warbalance.org/downloads/", licence: "https://creativecommons.org/licenses/by/4.0/" };
export function xmpPacket({ title = "", creator, credit, rights, statement, licence, url }) {
  const x = s => esc(s);
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">`
    + `<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/" xmlns:plus="http://ns.useplus.org/ldf/xmp/1.0/" xmlns:cc="http://creativecommons.org/ns#">`
    + `<dc:creator><rdf:Seq><rdf:li>${x(creator)}</rdf:li></rdf:Seq></dc:creator>${title ? `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${x(title)}</rdf:li></rdf:Alt></dc:title>` : ""}`
    + `<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${x(rights)}</rdf:li></rdf:Alt></dc:rights><photoshop:Credit>${x(credit)}</photoshop:Credit><xmpRights:Marked>True</xmpRights:Marked>`
    + `<xmpRights:WebStatement>${x(statement)}</xmpRights:WebStatement><xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">${x(rights)}: ${x(licence)}</rdf:li></rdf:Alt></xmpRights:UsageTerms>`
    + `<plus:Licensor><rdf:Seq><rdf:li rdf:parseType="Resource"><plus:LicensorName>${x(creator)}</plus:LicensorName><plus:LicensorURL>${x(statement)}</plus:LicensorURL></rdf:li></rdf:Seq></plus:Licensor>`
    + `<cc:license rdf:resource="${x(licence)}"/>${url ? `<cc:attributionURL rdf:resource="${x(url)}"/>` : ""}<cc:attributionName>${x(creator)}</cc:attributionName>`
    + `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
}
// a WebP file with an XMP chunk: a simple file (VP8 or VP8L) becomes an extended one (VP8X with the XMP flag)
export function webpWithXmp(buf, w, h, xmp) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") throw new Error("not a WebP file");
  const chunk = (id, data) => { const pad = data.length % 2 ? Buffer.alloc(1) : Buffer.alloc(0), hd = Buffer.alloc(8); hd.write(id, 0, "ascii"); hd.writeUInt32LE(data.length, 4); return Buffer.concat([hd, data, pad]); };
  const chunks = [];
  for (let o = 12; o + 8 <= buf.length;) { const id = buf.toString("ascii", o, o + 4), n = buf.readUInt32LE(o + 4); chunks.push({ id, data: buf.subarray(o + 8, o + 8 + n) }); o += 8 + n + (n % 2); }
  const body = chunks.filter(c => c.id !== "XMP " && c.id !== "VP8X");
  let x = chunks.find(c => c.id === "VP8X");
  const vp8x = Buffer.alloc(10);
  if (x) x.data.copy(vp8x, 0, 0, 10);
  else { vp8x.writeUIntLE(w - 1, 4, 3); vp8x.writeUIntLE(h - 1, 7, 3); if (body.some(c => c.id === "VP8L")) vp8x[0] |= 0x10; }
  vp8x[0] |= 0x04;
  const out = Buffer.concat([chunk("VP8X", vp8x), ...body.map(c => chunk(c.id, c.data)), chunk("XMP ", Buffer.from(xmp, "utf8"))]);
  const head = Buffer.alloc(12); head.write("RIFF", 0, "ascii"); head.writeUInt32LE(out.length + 4, 4); head.write("WEBP", 8, "ascii");
  return Buffer.concat([head, out]);
}

// ----- the renderer's context: the vendored flags (pipeline/vendor/circle-flags, MIT) as data addresses, Ukraine's
// outline and the world from the map's atlas -----
const HERE = dirname(fileURLToPath(import.meta.url));
export async function renderContext(site) {
  const dir = join(HERE, "vendor", "circle-flags", "flags"), flags = {};
  for (const f of await readdir(dir)) if (f.endsWith(".svg")) flags[f.slice(0, -4)] = "data:image/svg+xml;base64," + (await readFile(join(dir, f))).toString("base64");
  const topo = JSON.parse(await readFile(join(site, "countries-50m.json"), "utf8"));
  return { flags, ukr: ukraineOutline(topo), world: worldShapes(topo) };
}

// ----- drawing: a few Chromium processes side by side (pages of one browser share its compositor and take turns), each
// image captured as WebP at full size and (for a page's figure) again at 800px, each with its XMP -----
// jobs: [{ path, model, size: "sq" | "wide", small }]; site: the site folder; browser: Playwright's browser (its type
// launches the others)
export async function renderImages(browser, jobs, { site, host, workers = 4, quality = 82, qualitySmall = 75, log = () => {}, ctx = null }) {
  const t0 = Date.now();
  const pageHtml = PAGE_HTML.replace(FONTS, await fontStyle(site));
  const C = ctx || (await renderContext(site));
  const dirs = new Set(jobs.map(j => dirname(join(site, j.path))));
  for (const d of dirs) await mkdir(d, { recursive: true });
  const n = Math.max(1, Math.min(workers, Math.ceil(jobs.length / 50)));
  const opts = process.env.PLAYWRIGHT_CHROMIUM ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM } : {};
  const extra = await Promise.all(Array.from({ length: n - 1 }, () => browser.browserType().launch(opts)));
  let next = 0, bytes = 0, files = 0;
  const work = async b => {
    const ctxB = await b.newContext({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 1, colorScheme: "light" });
    const page = await ctxB.newPage();
    await page.setContent(pageHtml, { waitUntil: "networkidle" });
    const cdp = await ctxB.newCDPSession(page);
    while (next < jobs.length) {
      const j = jobs[next++], size = j.size || "wide", [w, h] = SIZE[size] || SIZE.wide;
      const cls = [size, j.model.kind === "country" ? "cc" : ""].filter(Boolean).join(" ");
      await page.evaluate(async ([html, cls, style]) => { const c = document.getElementById("c"); c.className = cls; c.setAttribute("style", style); c.innerHTML = html; await document.fonts.ready; await Promise.all([...c.querySelectorAll("img")].map(i => i.decode().catch(() => {}))); window.fit(); },
        [chartHtml(j.model, host, C, size), cls, accentStyle(j.model.accent)]);
      const xmp = xmpPacket({ ...XMP_RIGHTS, title: j.model.title, url: j.page ? `https://${host}${j.page}` : "" });
      for (const [path, scale] of [[j.path, 1], ...(j.small === false ? [] : [[smallPath(j.path), W2 / w]])]) {
        // round 69: the 800px copies and the link-preview copies a little more compressed (they are seen smaller)
        const q = scale < 1 || j.small === false ? qualitySmall : quality;
        const { data } = await cdp.send("Page.captureScreenshot", { format: "webp", quality: q, clip: { x: 0, y: 0, width: w, height: h, scale }, captureBeyondViewport: false });
        const buf = webpWithXmp(Buffer.from(data, "base64"), Math.round(w * scale), Math.round(h * scale), xmp);
        bytes += buf.length; files++;
        await writeFile(join(site, path), buf);
      }
    }
    await ctxB.close();
  };
  try { await Promise.all([browser, ...extra].map(work)); } finally { await Promise.all(extra.map(b => b.close())); }
  log(`images: ${jobs.length} charts (${jobs.filter(j => j.size === "sq").length} square), ${files} files (${(bytes / Math.max(1, files) / 1024).toFixed(0)} KB each on average, ${(bytes / 1048576).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(1)}s, ${n} Chromium processes`);
  return { n: jobs.length, files, bytes, ms: Date.now() - t0 };
}
