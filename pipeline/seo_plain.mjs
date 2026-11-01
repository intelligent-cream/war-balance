// Round 70b (owner, on the plain country pages: "this is the right style, apply this to all pages"): the plain reading
// layer's building blocks for every generated page type (topic, part, year and group pages, the ranking and trade pages,
// the comparisons and the research pages): an answer card, bars in HTML and CSS, "In plain words" and the folded "For
// experts" block. The markup and classes are the country pages' (seo_country.mjs plainCard, compareBars, PLAIN_CSS), so
// one look serves all; the words are seo_i18n.mjs PLAIN; nothing needs JavaScript.
//
// Pure (no browser): pipeline/test_seo.mjs tests it.

import * as I from "./seo_i18n.mjs";

export const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const PX = (l, k, v, n) => I.plain(l, k, v, n);

// an answer card. big, ctx and stats are HTML (marked figures); pre, post and the chip text are plain text
export function card({ l, cls = "mid", chip = null, pre = "", big, post = "", ctx = "", stats = [] }) {
  return `<section class="ans ${cls}" aria-label="${esc(PX(l, "tAnswer"))}">
${chip && chip.text ? `<p class="vline"><span class="vchip ${chip.cls || "mid"}">${esc(chip.text)}</span></p>\n` : ""}${pre ? `<p class="apre">${esc(pre)}</p>` : ""}<p class="abig">${big}</p>${post ? `<p class="apost">${esc(post)}</p>` : ""}
${ctx ? `<p class="actx">${ctx}</p>` : ""}${stats.length ? `\n<ul class="astats">${stats.map(s => `<li>${s}</li>`).join("")}</ul>` : ""}
</section>`;
}
// two answer cards side by side (a comparison)
export const pair = cards => `<div class="pair">${cards.join("\n")}</div>`;

// bars, one row per item: { name, href, here, rank, v (the number drawn, any sign), value (HTML), sub (text), tone }.
// Zero sits where the values put it, so a list with both signs is drawn both ways from it
export function bars(rows) {
  if (!rows.length) return "";
  const lo = Math.min(0, ...rows.map(r => r.v)), hi = Math.max(0, ...rows.map(r => r.v)), span = hi - lo || 1, pc = v => Math.round(((v - lo) / span) * 1000) / 10;
  return `<ol class="cmp">${rows.map(r => { const a = pc(Math.min(0, r.v)), w = Math.max(0.6, pc(Math.max(0, r.v)) - a);
    const nm = r.href && !r.here ? `<a href="${r.href}">${esc(r.name)}</a>` : esc(r.name);
    return `<li${r.here ? ' class="here"' : ""}><span class="cn">${r.rank ? `<span class="r">${r.rank}.</span>` : ""}${nm}</span><span class="wt" aria-hidden="true"><i class="z" style="left:${pc(0)}%"></i><i class="b t-${r.tone || "grey"}" style="left:${a}%;width:${Math.round(w * 10) / 10}%"></i></span><span class="wv">${r.value}</span>${r.sub ? `<span class="cs">${esc(r.sub)}</span>` : ""}</li>`; }).join("")}</ol>`;
}
// a section with a short heading
export const section = (id, title, html, cls = "") => (html ? `<section${cls ? ` class="${cls}"` : ""} aria-labelledby="${id}"><h2 id="${id}">${esc(title)}</h2>${html}</section>` : "");
// "In plain words": sentences already filled (HTML)
export const plainWords = (l, items) => section("plain-words", PX(l, "tPlain"), items.filter(Boolean).length ? `<ul class="pwl">${items.filter(Boolean).map(s => `<li>${s}</li>`).join("")}</ul>` : "", "pw");
// "For experts": everything else, folded, kept in the HTML
export const experts = (l, html) => (String(html || "").trim() ? `<details class="experts" id="experts"><summary><h2>${esc(PX(l, "tExperts"))}</h2></summary>
<p class="sub">${esc(PX(l, "expertsNote"))}</p>
${html}
</details>` : "");
// a bar's tone: + toward Ukraine blue, − toward Russia orange, paler where the map is not very sure; a plain amount in
// the tone of the side it belongs to
export const toneOf = (v, sure = true) => (v >= 0 ? "ua" : "ru") + (sure ? "" : "F");
