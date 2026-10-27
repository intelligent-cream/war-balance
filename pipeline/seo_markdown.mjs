// Round 58 (owner: pages that machines read as easily as people): the Markdown version of a generated page, written
// next to it as index.md (seo_pages.mjs put) and linked from its head with <link rel="alternate" type="text/markdown">.
// It is the page's <main> turned into clean text: the headings, paragraphs, lists, tables and questions, every link as
// a full address, and nothing else (no breadcrumbs, scripts or styles). It says what the HTML says, word for word and
// figure for figure (check 48 compares their numbers); the HTML stays the canonical page and only it is in the sitemap.
//
// Pure (no browser): pipeline/test_seo.mjs tests it.

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", nbsp: " " };
const unent = s => s.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m, k) => ENT[k]).replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
// a full address, with the characters that would end a Markdown link written as escapes
const absUrl = (href, base) => { let u; try { u = new URL(href, base).href; } catch { u = href; } return u.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20"); };
// Markdown's own characters in running text, so a figure such as "*2026" or a name with "_" stays as written
const mdEsc = s => s.replace(/([\\`*_[\]|])/g, "\\$1");

// inline HTML (inside a paragraph, heading, list item or table cell) as Markdown text
function inline(h, base) {
  let s = h
    .replace(/<br\s*\/?>/gi, " ")
    // a figure's smaller lines beside it (a table cell's range and chance) are joined with " · ", as the page shows them
    .replace(/(<\/(?:b|i|span|a)>)\s*(<span class="s">)/g, "$1 · $2")
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, text) => `\u0001${text}\u0002${absUrl(unent(href), base)}\u0003`);
  s = s.replace(/<[^>]+>/g, "");
  // (only ordinary white space: the no-break spaces inside figures such as "1 193 млрд €" stay)
  s = mdEsc(unent(s)).replace(/[ \t\r\n]+/g, " ").replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "");
  // links last, so their address is not escaped
  return s.replace(/\u0001([\s\S]*?)\u0002([^\u0003]*)\u0003/g, (m, text, href) => `[${text.trim()}](${href})`);
}

function table(h, base) {
  const rows = [...h.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map(r => [...r[1].matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t\1>/gi)].map(c => inline(c[2], base) || "–"));
  if (!rows.length) return "";
  const n = Math.max(...rows.map(r => r.length));
  const pad = r => r.concat(Array(n - r.length).fill(""));
  const line = r => "| " + pad(r).join(" | ") + " |";
  return [line(rows[0]), "|" + " --- |".repeat(n), ...rows.slice(1).map(line)].join("\n");
}

// a page's HTML (a whole document, or its <main>) as Markdown. base: the page's own address, for full links
export function htmlToMarkdown(html, base) {
  let h = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || [null, html])[1];
  h = h.replace(/<(script|style|template)[\s\S]*?<\/\1>/gi, "")
    .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/gi, "")
    .replace(/<\/?(details|summary|section|div|header|footer|nav)[^>]*>/gi, "\n");
  const out = [];
  const re = /<(h[1-4]|p|ul|ol|table)(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(h))) {
    const [, tag, , body] = m;
    const t = tag.toLowerCase();
    if (t[0] === "h") { const x = inline(body, base); if (x) out.push("#".repeat(+t[1]) + " " + x); }
    else if (t === "p") { const x = inline(body, base); if (x) out.push(x); }
    else if (t === "table") { const x = table(body, base); if (x) out.push(x); }
    else {
      const items = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(li => inline(li[1], base)).filter(Boolean);
      if (items.length) out.push(items.map((x, i) => (t === "ol" ? `${i + 1}. ` : "- ") + x).join("\n"));
    }
  }
  return out.join("\n\n") + "\n";
}

// every figure a text writes (amounts, shares, counts), for check 48's comparison of a page and its Markdown version
export const figures = text => (unent(text).replace(/\\/g, "").match(/[−+-]?[€$]?\d[\d.,   ]*(?:%|bn|m\b|Mrd\.|Mio\.|Md€|M€|mld|mln|млрд|млн)?/g) || []).map(x => x.replace(/[\s  ]+$/, ""));
