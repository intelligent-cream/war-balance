// Round 69: the Charts page (/charts/, /<lang>/charts/): every chart image of the site as a grid of thumbnails, grouped
// by kind (the main rankings, the topics, the parts, the years), then one chart per country, A to Z, folded. Each chart
// links its page and has a download link (the full size, and the 1200×630 copy of a square chart) and the credit line
// to copy; the page carries its gallery as schema.org ImageGallery. seo_pages.mjs collects the charts as it writes the
// pages (addImg) and writes this page with its own frame (shell, put); the words are seo_i18n.mjs IMG ch*.

import * as I from "./seo_i18n.mjs";
import { smallPath } from "./seo_images.mjs";

const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const CHARTS_CSS = "\n.charts{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:16px;margin:10px 0 24px}" +
  ".charts figure{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:6px}" +
  ".charts img{display:block;width:100%;height:auto;border-radius:6px;background:#f7f9fb}.charts figcaption{font-size:14px;line-height:1.35}" +
  ".charts .dl{font-size:13px;color:var(--soft)}.charts code{display:block;font-size:12px;color:var(--soft);overflow-wrap:anywhere}" +
  "details.ctry-charts>summary{cursor:pointer;color:var(--ukr);margin:10px 0}.credit{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px}";

// items: [{ path, og, w, h, alt, title, group, page, name }] in the order they were made; groups: the group names in
// their order, the last one the countries (folded, A to Z)
export function chartsBody(l, items, { groups, countries }) {
  const credit = I.img(l, "credit");
  const card = (x, short = false) => {
    const [w, h] = [x.w, x.h], thumbH = Math.round((h * 800) / w);
    return `<figure><a href="${x.path}"><img src="${smallPath(x.path)}" alt="${esc(x.alt)}" width="800" height="${thumbH}" loading="lazy" decoding="async"></a><figcaption>${x.page ? `<a href="${x.page}">${esc(short ? x.name : x.title)}</a>` : esc(short ? x.name : x.title)}`
      + `<span class="dl"><br><a href="${x.path}" download>${esc(I.img(l, "chDl"))} (${w}×${h})</a>${x.og && x.og !== x.path ? ` · <a href="${x.og}" download>${esc(I.img(l, "chWide", { w: 1200, h: 630 }))}</a>` : ""}</span>`
      + `${short ? "" : `<code>${esc(credit)}</code>`}</figcaption></figure>`;
  };
  const by = g => items.filter(x => x.group === g);
  const secs = groups.filter(g => g !== countries && by(g).length).map((g, i) => `<h2 id="g${i + 1}">${esc(g)} · ${by(g).length}</h2>\n<div class="charts">${by(g).map(x => card(x)).join("")}</div>`);
  const cs = by(countries).slice().sort((a, b) => a.name.localeCompare(b.name, l));
  const ctry = cs.length ? `<h2 id="countries">${esc(countries)} · ${cs.length}</h2>\n<details class="ctry-charts"><summary>${esc(I.img(l, "chCountriesN", { n: cs.length }, { n: cs.length }))}</summary><div class="charts">${cs.map(x => card(x, true)).join("")}</div></details>` : "";
  return `<p class="credit">${esc(I.img(l, "chCredit"))}: <code>${esc(credit)}</code></p>\n${secs.join("\n")}\n${ctry}`;
}
// schema.org: the page's gallery (the charts of every group but the countries, each an ImageObject)
export const galleryLd = (l, items, countries, imageObject, abs) => ({ "@type": "ImageGallery", inLanguage: l, associatedMedia: items.filter(x => x.group !== countries).map(x => imageObject(x, abs)) });
