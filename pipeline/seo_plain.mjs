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

// ----- round 71b (owner: "the Kiel page still looks cleaner"): the reading rhythm, one pattern for every template -----
// A page reads: the H1 (the page's question), a dek (one smaller line: the finding), the date line, the answer card and
// one row of actions (one coloured button, the rest plain links); then sections that each follow one rhythm: a heading,
// one plain sentence, ONE visual (an embed or a card), at most one small note (a <details> that folds a dense
// explanation away). Each fact is shown once: tables, long lists and static bars that repeat a visual go under "For
// experts" (kept in the HTML). The look is CLEAN_CSS (pages.css), mobile first, light by default.
// a section in the rhythm: id and title (text), lead (HTML: one sentence), visual (HTML), note (HTML, e.g. why())
export const rhythm = ({ id, title, lead = "", visual = "", note = "", cls = "" }) => (visual ? `<section class="rs${cls ? " " + cls : ""}" aria-labelledby="${id}"><h2 id="${id}">${esc(title)}</h2>
${lead ? `<p class="rs-lead">${lead}</p>\n` : ""}${visual}${note ? "\n" + note : ""}</section>` : "");
// a small folded note under a visual: summary text, body HTML
export const why = (summary, html, id = "") => (String(html || "").trim() ? `<details class="why"${id ? ` id="${id}"` : ""}><summary>${esc(summary)}</summary>
<div class="why-in">${html}</div></details>` : "");
// a section written with a heading of its own (<section ...><h2 id="x">T</h2>...</section>) as a folded note
export const foldSection = html => {
  const m = String(html || "").match(/^<section[^>]*><h2 id="([\w-]+)">([\s\S]*?)<\/h2>([\s\S]*)<\/section>\s*$/);
  return m ? `<details class="why" id="${m[1]}"><summary>${m[2]}</summary>\n<div class="why-in">${m[3]}</div></details>` : html || "";
};
// the dek under the H1: the finding, smaller, linked to the page that has it
export const dek = (text, href = "") => (text ? `<p class="dek">${href ? `<a href="${href}">${esc(text)}</a>` : esc(text)}</p>` : "");
// one row of actions: one primary button [href, text], then plain links [[href, text], ...]
export const actions = (primary, links = []) => `<p class="acts">${primary ? `<a class="btn" href="${primary[0]}">${esc(primary[1])} →</a>` : ""}${links.map(([h, t]) => `<a class="lnk" href="${h}">${esc(t)}</a>`).join("")}</p>`;
// the light/dark switch in the page header (the map's own key, ftm-theme: a reader's choice wins on every page and in
// the map); THEME_JS switches it, remembers it and tells the embeds on the page
export const themeButton = label => `<button class="theme" type="button" aria-label="${esc(label)}" title="${esc(label)}"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button>`;
export const THEME_JS = `<script>(function(){var b=document.querySelector("button.theme");if(!b)return;b.addEventListener("click",function(){var d=document.documentElement,n=d.dataset.theme==="dark"?"light":"dark";d.dataset.theme=n;try{localStorage.setItem("ftm-theme",n)}catch(e){}document.querySelectorAll("iframe").forEach(function(f){try{f.contentWindow.postMessage({type:"wb-theme",theme:n},location.origin)}catch(e){}})})})();</script>`;
export const CLEAN_CSS = `
main.plain{max-width:920px;font-size:17.5px;line-height:1.6}
main.plain h1{font-size:clamp(28px,4.6vw,40px);line-height:1.12;margin:12px 0 10px}
main.plain .dek{font:600 clamp(18px,2.4vw,21px)/1.35 var(--fd);letter-spacing:-.005em;margin:0 0 10px;color:var(--ink);max-width:46em}
main.plain .dek a{color:inherit;text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:4px}main.plain .dek a:hover{text-decoration-color:var(--ukr)}
main.plain p.dated{color:var(--soft);font-size:14.5px;margin:0 0 22px}
main.plain .ans{border:1px solid var(--line);border-radius:12px;box-shadow:none;margin:0 0 18px}
main.plain .ans,main.plain .ans.pos,main.plain .ans.neg,main.plain .ans.fpos,main.plain .ans.fneg{border-top:1px solid var(--line)}
main.plain .astats li{background:transparent}
.acts{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;margin:0 0 8px}.acts .btn{padding:9px 18px;border-radius:999px}
.acts .lnk{font-weight:600;color:var(--ink);text-decoration:underline;text-decoration-color:var(--line);text-underline-offset:3px}.acts .lnk:hover{text-decoration-color:var(--ukr)}
main.plain section.rs,main.plain>section:not(.ans):not(.chartsec),main.plain>.rs,main.plain>.whys{margin:64px 0 0}main.plain>.whys details.why{margin:8px 0 0}
main.plain .rs>h2,main.plain>section>h2,main.plain section.faq>h2{font:800 23px/1.25 var(--fd);letter-spacing:-.01em;text-transform:none;color:var(--ink);margin:0 0 8px}
main.plain .rs-lead{margin:0 0 16px;color:var(--soft);font-size:16.5px;max-width:46em}
main.plain .emb-slot{margin:0}main.plain .emb-cap{display:none}
details.why{margin:12px 0 0;font-size:15px}details.why>summary{cursor:pointer;color:var(--ukr);font-weight:600;list-style:none;display:inline-flex;gap:6px;align-items:center}
details.why>summary::-webkit-details-marker{display:none}details.why>summary::before{content:"+";font:700 17px/1 var(--fd)}details.why[open]>summary::before{content:"\\2212"}
details.why .why-in{padding:8px 0 0;color:var(--ink)}details.why .why-in p{margin:6px 0}details.why h2,details.why h3{font-size:16px;text-transform:none;letter-spacing:0;color:var(--ink);margin:10px 0 4px}
main.plain details.experts{margin:72px 0 10px;border:0;border-top:1px solid var(--line);border-radius:0;padding:0;background:none}
main.plain details.experts .card,main.plain details.experts .tile,main.plain details.experts .ans{background:var(--surface)}
main.plain section.faq h3{font-size:17px;margin:18px 0 4px}
.top .theme{margin-left:auto;width:34px;height:32px;border:1px solid var(--line);border-radius:8px;background:none;color:var(--ink);cursor:pointer;display:inline-grid;place-items:center}
@media (max-width:640px){main.plain{font-size:17px}main.plain section.rs,main.plain>section.pw,main.plain>section.faq{margin-top:48px}main.plain .rs>h2,main.plain>section>h2{font-size:21px}}`;
// the questions (FAQPage in the JSON-LD): each answer folded under its question; items: [{ q: text, a: HTML }]
export const faq = (title, items) => (items.length ? `<section class="faq" id="faq"><h2>${esc(title)}</h2>${items.map(x => `<details class="qa"><summary><h3>${esc(x.q)}</h3></summary><p>${x.a}</p></details>`).join("\n")}</section>` : "");
export const FAQ_CSS = `
main.plain details.qa{border-bottom:1px solid var(--line)}main.plain details.qa>summary{cursor:pointer;list-style:none;display:flex;gap:12px;align-items:baseline;padding:12px 0}
main.plain details.qa>summary::-webkit-details-marker{display:none}main.plain details.qa>summary h3{flex:1;margin:0;font-size:17px}
main.plain details.qa>summary::after{content:"+";font:700 19px/1 var(--fd);color:var(--soft)}main.plain details.qa[open]>summary::after{content:"\\2212"}main.plain details.qa>p{margin:0 0 14px}`;
// a questions section already written (<section class="faq"><h2>…</h2><h3>q</h3><p …>a</p>…): each answer folded
export const foldFaq = html => String(html || "").replace(/<section class="faq"(?! id=)/, '<section class="faq" id="faq"').replace(/<h3>([\s\S]*?)<\/h3>(<p[^>]*>[\s\S]*?<\/p>)/g, '<details class="qa"><summary><h3>$1</h3></summary>$2</details>');
