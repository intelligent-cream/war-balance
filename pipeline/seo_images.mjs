// Round 62 (images for image search): chart images that answer what people search for ("ukraine support by country",
// "aid to ukraine per capita", "how much has France given to Ukraine", "frozen russian assets by country"), drawn at
// deploy from the figures the pages show (seo_pages.mjs passes the map's own numbers and words: seo_extract.mjs), in
// the map's look (its colours, fonts and bars with their range lines), so they change with the data and need no upkeep.
//
//   ranking charts   support for Ukraine by country in euros, as a share of GDP and per person (top 15 each), the net
//                    (toward Ukraine or toward Russia, with ranges), the money that moved toward Russia, and the
//                    Russian assets frozen in each country: one per language where its page is in that language
//   country charts   one per country page and language: support for Ukraine with its parts (own aid, EU share,
//                    refugees), Russia's earnings from trade, frozen money and the net, each with its range
//
// Every image is 1200×630 WebP (Chromium's own encoder, through the DevTools protocol), written to site/img/ (not in
// git, like site/share/) at an address that stays the same from one deploy to the next (seo_i18n.mjs IMG_FILE).
// The models (rankChart, countryChart) and the HTML (chartHtml) are pure: pipeline/test_seo.mjs tests them.

import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import * as I from "./seo_i18n.mjs";

export const W = 1200, H = 630;
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// the map's colours (index.html; the share cards): blue toward Ukraine, orange toward Russia, a paler tint of the same
// hue where the direction is not certain, grey for no clear direction
export const TONE = { ua: "#2a6fb0", uaF: "#7fa7cf", ru: "#d4601a", ruF: "#e6a274", grey: "#8795a0" };
const PART_TONE = ["#1d5689", "#2a6fb0", "#6c9fd0", "#b9c7d4"];
// round 64: the site's own fonts (site/fonts/fonts.css and its woff2 files, inlined, font-display: block), not Google's
const FONTS = "<!-- fonts -->";
const fontStyle = async site => {
  const css = await readFile(join(site, "fonts", "fonts.css"), "utf8"), files = [...new Set([...css.matchAll(/url\(\/fonts\/([\w.-]+)\)/g)].map(m => m[1]))];
  const data = Object.fromEntries(await Promise.all(files.map(async f => [f, (await readFile(join(site, "fonts", f))).toString("base64")])));
  return `<style>${css.replace(/url\(\/fonts\/([\w.-]+)\)/g, (m, f) => `url(data:font/woff2;base64,${data[f]})`).replace(/font-display:swap/g, "font-display:block")}</style>`;
};

// an image's address: /img/<name>.webp in English, /img/<lang>/<name>.webp in the other languages
export const imgPath = (l, key, slug = "") => `/img/${l === "en" ? "" : l + "/"}${I.IMG_FILE[l][key].replace("{slug}", slug)}.webp`;

// a value's colour: its side, paler where its direction is not certain
export const toneOf = (v, sure = true, grey = false) => (grey ? "grey" : v >= 0 ? (sure ? "ua" : "uaF") : sure ? "ru" : "ruF");

// ----- a ranking chart: rows of { name, v, lo, hi, value, note, tone, segs } on one axis -----
// head: { title, sub, foot, legend }; rows already in their order
export function rankChart({ key, l, title, unit, period, source, rows, legend = [], alt }) {
  return { kind: "rank", key, l, title, sub: [period, unit].filter(Boolean).join(" · "), source, legend, alt, rows: rows.map((r, i) => ({ rank: r.rank ?? i + 1, ...r })) };
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

// a row's bar (or stacked parts) and its range line, as positioned boxes in percent of the bar area
function barHtml(r, d) {
  const x = v => (100 * (v - d.lo)) / (d.hi - d.lo), z = x(0);
  let out = "";
  if (r.segs && r.segs.length) {
    let pos = 0, neg = 0;
    for (const s of r.segs) {
      if (!s.v) continue;
      const a = s.v > 0 ? pos : neg + s.v, b = s.v > 0 ? pos + s.v : neg;
      if (s.v > 0) pos += s.v; else neg += s.v;
      out += `<i class="b" style="left:${x(a).toFixed(2)}%;width:${Math.max(0.15, x(b) - x(a)).toFixed(2)}%;background:${s.color}"></i>`;
    }
  } else if (r.v != null) {
    const a = Math.min(x(r.v), z), b = Math.max(x(r.v), z);
    out += `<i class="b" style="left:${a.toFixed(2)}%;width:${Math.max(0.3, b - a).toFixed(2)}%;background:${TONE[r.tone] || TONE.grey}"></i>`;
  }
  if (r.lo != null && r.hi != null && isFinite(r.lo) && isFinite(r.hi) && Math.abs(r.hi - r.lo) > 1e-9) {
    const a = x(Math.min(r.lo, r.hi)), b = x(Math.max(r.lo, r.hi));
    out += `<i class="w" style="left:${a.toFixed(2)}%;width:${(b - a).toFixed(2)}%"></i>`;
  }
  // the figure beside the bar's outer end (or its range's), on its own side of zero
  if (r.label) {
    const ends = [r.v, r.lo, r.hi, r.segs ? r.segs.filter(s => s.v > 0).reduce((a, s) => a + s.v, 0) : null].filter(v => v != null && isFinite(v));
    const neg = r.v < 0, e = neg ? Math.min(0, ...ends) : Math.max(0, ...ends);
    out += `<span class="lab" style="${neg ? `right:calc(${(100 - x(e)).toFixed(2)}% + 9px)` : `left:calc(${x(e).toFixed(2)}% + 9px)`}">${r.label}</span>`;
  }
  return `<span class="ax" style="left:${z.toFixed(2)}%"></span>${out}`;
}

const CSS = `*{box-sizing:border-box;margin:0}html,body{width:${W}px;height:${H}px;overflow:hidden;background:#fbfcfc}
#c{position:fixed;inset:0;width:${W}px;height:${H}px;background:#fbfcfc;color:#15212b;font:400 18px/1.25 "Source Sans 3",system-ui,sans-serif;padding:26px 44px 20px;display:flex;flex-direction:column;font-variant-numeric:tabular-nums}
.br{display:flex;align-items:center;justify-content:space-between;font:800 19px/1 Archivo,"Helvetica Neue",Arial,sans-serif;font-stretch:115%;letter-spacing:-.01em}
.br .lg{display:flex;align-items:center;gap:10px}.br .sq{display:inline-block;width:12px;height:12px;border-radius:3px}.br .host{font:600 17px "Source Sans 3",sans-serif;color:#55636e;letter-spacing:0}
h1{margin-top:12px;font:800 31px/1.08 Archivo,"Helvetica Neue",Arial,sans-serif;font-stretch:106%;letter-spacing:-.015em;text-wrap:balance}
.sub{margin-top:6px;font-size:18px;color:#55636e}.party{margin-top:6px;font-size:17px;font-weight:700;color:#8a2f2f}
.rows{flex:1;display:flex;flex-direction:column;justify-content:center;margin-top:10px;min-height:0}
.r{display:grid;grid-template-columns:30px 200px 1fr;column-gap:12px;align-items:center;padding-right:8px}
.r .k{color:#55636e;font-size:14px;text-align:right}.r .n{text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.bar .lab{position:absolute;top:50%;transform:translateY(-50%);white-space:nowrap;line-height:1}.lab b{font-weight:700}.lab small{font-size:13.5px;color:#55636e;margin-left:6px}
.bar{position:relative;height:100%}.bar .ax{position:absolute;top:-3px;bottom:-3px;width:1.5px;background:#15212b;opacity:.55}
.bar .b{position:absolute;top:22%;bottom:22%;border-radius:2px}
.bar .w{position:absolute;top:50%;height:2px;margin-top:-1px;background:#15212b;opacity:.75}
.bar .w::before,.bar .w::after{content:"";position:absolute;top:-5px;height:12px;width:2px;background:#15212b}.bar .w::before{left:0}.bar .w::after{right:0}
.grp{margin:4px 0 1px 42px;font:700 13px/1.2 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#55636e}
.cr{display:grid;grid-template-columns:250px 150px 1fr;column-gap:14px;align-items:center}
.cr .lb{font:700 17px/1.15 Archivo,"Helvetica Neue",Arial,sans-serif;font-stretch:104%}.cr .vv{text-align:right;font:800 26px/1 Archivo,"Helvetica Neue",Arial,sans-serif;letter-spacing:-.01em;white-space:nowrap}
.cr .bar{height:30px}.cr .bar .b{top:3px;bottom:3px}
.cw{margin:3px 0 0 264px;font-size:15.5px;line-height:1.25;color:#2b3944}
.parts{display:flex;flex-wrap:wrap;gap:2px 16px;margin:5px 0 0 264px;font-size:14.5px;color:#2b3944}.parts i{display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.blk{margin:9px 0}
.ft{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:8px;font-size:14.5px;color:#55636e;line-height:1.3}
.ft .leg{display:flex;flex-wrap:wrap;gap:2px 14px}.ft .leg i{display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:5px;vertical-align:-1px}.ft .src{text-align:right;white-space:nowrap}`;
export const PAGE_HTML = `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>${CSS}</style></head><body><div id="c"></div></body></html>`;

// a figure's text colour: its side's darker shade (readable on the light background), grey without a direction
const inkOf = tone => (tone === "grey" ? "#55636e" : /^ru/.test(tone) ? "#b4500f" : "#1f5a94");
const brand = host => `<div class="br"><span class="lg"><span class="sq" style="background:${TONE.ua}"></span><span class="sq" style="background:${TONE.ru};margin-left:-7px"></span>War Balance</span><span class="host">${esc(host)}</span></div>`;
const legendHtml = items => `<span class="leg">${items.map(x => (x.color ? `<span><i style="background:${x.color}"></i>${esc(x.text)}</span>` : `<span>${esc(x.text)}</span>`)).join("")}</span>`;

// the HTML of one chart, inside the page above (#c)
export function chartHtml(m, host) {
  if (m.kind === "rank") {
    const d = domain(m.rows, 0.22), n = m.rows.length + m.rows.filter(r => r.sepBefore).length * 0.8;
    const rowH = Math.max(18, Math.min(30, Math.floor((m.space || 380) / Math.max(1, n))));
    const fs = rowH >= 26 ? 17 : rowH >= 22 ? 16 : 15;
    return `${brand(host)}<h1>${esc(m.title)}</h1><p class="sub">${esc(m.sub)}</p>
<div class="rows">${m.rows.map(r => `${r.sepBefore ? `<div class="grp">${esc(r.sepBefore)}</div>` : ""}<div class="r" style="height:${rowH}px;font-size:${fs}px"><span class="k">${esc(r.rank)}</span><span class="n">${esc(r.name)}</span><span class="bar">${barHtml({ ...r, label: r.label || `<b style="color:${inkOf(r.tone)}">${esc(r.value)}</b>${r.note ? `<small>${esc(r.note)}</small>` : ""}` }, d)}</span></div>`).join("")}</div>
<div class="ft">${legendHtml(m.legend)}<span class="src">${esc(m.source)}</span></div>`;
  }
  // a country: its rows on one axis in euros, each with the map's own sentence beneath
  const d = domain(m.rows);
  return `${brand(host)}<h1>${esc(m.title)}</h1><p class="sub">${esc(m.sub)}</p>${m.party ? `<p class="party">${esc(m.party)}</p>` : ""}
<div class="rows">${m.rows.map(r => `<div class="blk"><div class="cr"><span class="lb">${esc(r.label)}</span><span class="vv" style="color:${inkOf(r.tone)}">${esc(r.value)}</span><span class="bar">${barHtml({ ...r, label: "" }, d)}</span></div>
${r.words ? `<p class="cw">${esc(r.words)}</p>` : ""}${r.parts && r.parts.length ? `<p class="parts">${r.parts.map(p => `<span><i style="background:${p.color}"></i>${esc(p.text)}</span>`).join("")}</p>` : ""}</div>`).join("")}</div>
<div class="ft">${legendHtml(m.legend)}<span class="src">${esc(m.source)}</span></div>`;
}

// ----- a country's chart, from the map's figures and words in a language (seo_extract.mjs country()) -----
// c: the country in this language; earner: no clear direction (the share cards' grey); words: { title, period, source,
// unit, legendSigned, range, support, trade, frozen, net, ofGdp, party, partNames: {aid, euaid, ref}, other }
export function countryChart({ c, l, earner = false, words: w, alt = true }) {
  if (!c || !c.net || c.noData || c.mostlyNoData) return null;
  const f = c.fig, E = v => I.E(l, v), sg = v => (Math.abs(v) < 0.0005 ? "" : v > 0 ? "+" : "−");
  const signed = v => sg(v) + E(v);
  const sentence = n => [n.pre, n.big, n.post].filter(Boolean).join(" ");
  const sure = n => !(n.unc || (n.info && n.info.level && n.info.level !== "sure"));
  const mOf = k => (c.measures && c.measures[k] && c.measures[k].v != null ? c.measures[k].v : 0);
  // support for Ukraine and its parts: own aid, EU share, refugee hosting, and the rest (the smaller parts, net of the
  // money of the war effort spent back in its own economy), which add up to its support
  const pa = [["aid", mOf("part:aid")], ["euaid", mOf("part:euaid")], ["ref", mOf("part:ref")]];
  const other = f.ua - pa.reduce((a, [, v]) => a + v, 0);
  const parts = pa.map(([k, v], i) => ({ k, v, color: PART_TONE[i], text: `${w.partNames[k]} ${signed(v)}` })).filter(p => Math.abs(p.v) >= 0.0005);
  if (Math.abs(other) >= 0.0005 && parts.length) parts.push({ k: "other", v: other, color: PART_TONE[3], text: `${w.other} ${signed(other)}` });
  const stack = parts.length && parts.every(p => p.v >= 0);
  const rows = [
    { key: "ua", label: w.support, v: f.ua, lo: f.uaLo, hi: f.uaHi, value: signed(f.ua), tone: toneOf(f.ua, sure(c.ua)), words: `${sentence(c.ua)} ${w.ofGdp} · ${c.ua.range}`,
      segs: stack ? parts.map(p => ({ v: p.v, color: p.color })) : null, parts },
    { key: "rus", label: w.trade, v: f.rus, lo: f.rusLo, hi: f.rusHi, value: signed(f.rus), tone: toneOf(f.rus, sure(c.rus)), words: `${sentence(c.rus)} ${w.ofGdp} · ${c.rus.range}` },
  ];
  if (c.frozen) rows.push({ key: "frozen", label: w.frozen, v: f.frozen, value: signed(f.frozen), tone: "ua", words: c.frozen.verb });
  rows.push({ key: "net", label: w.net, v: f.net, lo: f.netLo, hi: f.netHi, value: signed(f.net), tone: toneOf(f.net, sure(c.net), earner),
    words: `${sentence(c.net)} ${w.ofGdp} · ${c.net.range}${c.net.chance && !c.party ? " · " + c.net.chance : ""}` });
  const legend = [{ text: w.legendSigned }, { text: w.range }];
  // the alt text says the answer: support with its parts, then trade, then the net, in the map's own words
  const altText = [`${c.name}, ${w.period}`, c.party ? w.party : "", `${sentence(c.ua)} ${w.ofGdp} (${c.ua.eur})${parts.length ? ": " + parts.map(p => p.text).join(", ") : ""}`,
    `${sentence(c.rus)} ${w.ofGdp} (${c.rus.eur})`, `${w.net}: ${sentence(c.net)} ${w.ofGdp} (${c.net.eur})`].filter(Boolean).join(". ") + ".";
  // a party to the war says so beneath the title, unless the title (the page's question) already does
  const partyLine = c.party && !w.title.toLowerCase().includes(w.party.split(",")[0].toLowerCase()) ? w.party : "";
  return { kind: "country", key: "country", l, iso: c.iso, title: w.title, sub: [w.period, w.unit].join(" · "), party: partyLine, rows, legend, source: w.source, alt: alt ? altText : "" };
}

// ----- the image on a page: a figure near its top (the first one not lazy), with its alt text, size and caption -----
export function figureHtml(img, { lazy = false, caption = "" } = {}) {
  if (!img) return "";
  return `<figure class="chart"><img src="${img.path}" alt="${esc(img.alt)}" width="${W}" height="${H}"${lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'}>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
}
export const FIGURE_CSS = "\nfigure.chart{margin:14px 0 16px}figure.chart img{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:10px;background:#fbfcfc}figure.chart figcaption{font-size:13.5px;color:var(--soft);margin-top:5px}";
// schema.org: the image as an ImageObject (the page's primaryImageOfPage)
// (with Google's image-metadata fields: the charts are under the data licence, CC BY 4.0, explained on /downloads/)
export const imageObject = (img, abs, extra = {}) => ({ "@type": "ImageObject", contentUrl: abs(img.path), url: abs(img.path), width: W, height: H, encodingFormat: "image/webp", caption: img.alt, inLanguage: img.l,
  creator: { "@type": "Organization", name: "War Balance", url: abs("/") }, creditText: "War Balance", copyrightNotice: "War Balance, CC BY 4.0",
  license: "https://creativecommons.org/licenses/by/4.0/", acquireLicensePage: abs("/downloads/"), ...extra });

// ----- drawing: a few Chromium processes side by side (pages of one browser share its compositor and take turns), each
// image captured as WebP -----
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
      await page.evaluate(async html => { document.getElementById("c").innerHTML = html; await document.fonts.ready; }, chartHtml(j.model, host));
      const { data } = await cdp.send("Page.captureScreenshot", { format: "webp", quality, clip: { x: 0, y: 0, width: W, height: H, scale: 1 }, captureBeyondViewport: false });
      const buf = Buffer.from(data, "base64");
      bytes += buf.length;
      await writeFile(join(site, j.path), buf);
    }
    await ctx.close();
  };
  try { await Promise.all([browser, ...extra].map(work)); } finally { await Promise.all(extra.map(b => b.close())); }
  log(`images: ${jobs.length} charts (${(bytes / Math.max(1, jobs.length) / 1024).toFixed(0)} KB each on average, ${(bytes / 1048576).toFixed(1)} MB) in ${((Date.now() - t0) / 1000).toFixed(1)}s, ${n} Chromium processes`);
  return { n: jobs.length, bytes, ms: Date.now() - t0 };
}
