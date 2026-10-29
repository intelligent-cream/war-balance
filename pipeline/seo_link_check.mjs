// Round 60 (audit: five source links that no longer open, one on a test server): a report of every external link the
// site cites, run once a month by .github/workflows/link-check.yml. It reads the sources of site/data.json (each
// source's address and its documents) and every http(s) address in the research files of pipeline/seo_families.json
// research, asks each once (HEAD, then GET where HEAD is refused) and writes a Markdown report: the links that answer
// 4xx/5xx or not at all, and those on hosts that look like test servers. It never fails the build (exit code 0): a
// broken link is fixed in research/2026-10/link_fixes.json or the research file, by hand.
//
// Run: node pipeline/seo_link_check.mjs [report.md]   (default: link-check-report.md)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = process.argv[2] || "link-check-report.md";
const data = JSON.parse(readFileSync(join(ROOT, "site", "data.json"), "utf8"));
const fam = JSON.parse(readFileSync(join(ROOT, "pipeline", "seo_families.json"), "utf8"));
const links = new Map();   // url -> [where]
const add = (u, where) => { if (/^https?:\/\//.test(u || "")) (links.get(u) || links.set(u, []).get(u)).push(where); };
for (const [id, s] of Object.entries(data.sources || {})) {
  add(s.url, `data.json sources.${id}`);
  for (const l of s.links || []) add(l.url, `data.json sources.${id}`);
}
for (const [name, x] of Object.entries(fam.research || {})) {
  if (!x || !x.file || !existsSync(join(ROOT, x.file))) continue;
  for (const u of readFileSync(join(ROOT, x.file), "utf8").match(/https?:\/\/[^\s"'<>\\)]+/g) || []) add(u, x.file + ` (${name})`);
}
const TEST_HOST = /(^|[.-])(qual|qa|test|staging|stage|dev|uat)([.-]|$)/i;
async function ask(url) {
  for (const method of ["HEAD", "GET"]) {
    try {
      const r = await fetch(url, { method, redirect: "follow", signal: AbortSignal.timeout(30000), headers: { "user-agent": "War Balance link check (https://warbalance.org/)" } });
      if (method === "HEAD" && [403, 405, 501].includes(r.status)) continue;
      return r.status;
    } catch (e) { if (method === "GET") return "no answer: " + (e.cause?.code || e.name); }
  }
  return "no answer";
}
const list = [...links.keys()], res = [];
for (let i = 0; i < list.length; i += 8) {
  const batch = list.slice(i, i + 8);
  res.push(...(await Promise.all(batch.map(async u => ({ u, st: await ask(u) })))));
}
const bad = res.filter(r => typeof r.st !== "number" || r.st >= 400), test = res.filter(r => TEST_HOST.test(new URL(r.u).hostname));
const row = r => `| ${r.st} | ${r.u} | ${links.get(r.u).slice(0, 3).join("; ")} |`;
const md = [`# Link check, ${new Date().toISOString().slice(0, 10)}`, "", `${list.length} links checked; ${bad.length} do not open; ${test.length} on hosts that look like test servers.`, "",
  "## Links that do not open", "", "| Answer | Address | Cited in |", "| --- | --- | --- |", ...bad.map(row), "",
  "## Links on test servers", "", "| Answer | Address | Cited in |", "| --- | --- | --- |", ...test.map(row), ""].join("\n");
writeFileSync(out, md);
console.log(`link check: ${list.length} links, ${bad.length} broken, ${test.length} on test hosts; report in ${out}`);
