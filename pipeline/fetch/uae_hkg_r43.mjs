// Round 43: UAE and Hong Kong official trade with Russia, fetched with an ordinary headless browser (Playwright).
//
//   node pipeline/fetch/uae_hkg_r43.mjs            then   uv run pipeline/fetch/uae_hkg_r43_extract.py
//
// Writes to research/2026-10/raw/uae_hkg_r43/ (the .xlsx downloads are git-ignored; the extractor turns them into the
// small CSV/JSON files that are kept):
//   scad_<slug>.xlsx            Statistics Centre - Abu Dhabi (SCAD), "Non-oil Foreign Merchandise Trade Statistics
//                               Through Ports by Harmonized System", annual 2024-2025 and monthly 2026 releases. Tables
//                               7/8 are re-exports/imports by country (top 10 only), Abu Dhabi ports only
//   bayanat_fca_by_country.zip  UAE Open Data Portal (bayanat.ae), Federal Customs Authority "General Total Trade
//                               volume by country" 2010-2019 (imports, exports, re-exports by partner, AED and kg)
//   comtrade_hkg_7108_m_<yyyymm>.json  UN Comtrade public preview, Hong Kong's (C&SD's) monthly imports from Russia,
//                               HS 7108 and TOTAL, for the months of the current year (one period per call)
//   fetch_log_<date>.json       every page and file: address, HTTP status, time
//
// Rules kept (owner's instruction, round 43): one normal page load at a time with a 10 s wait and >= 12 s between
// requests (bayanat.ae robots.txt asks for Crawl-delay 10); no stealth, no challenge solving. Sites that refused an
// ordinary visit on 2026-10-24 are NOT requested: fcsc.gov.ae / uaestat.fcsc.gov.ae (Cloudflare "you have been
// blocked", 403), data.dubai and www.dsc.gov.ae (WAF "Request Rejected"), data.gov.ae (proxy 502),
// www.economy.gov.ae (502). Hong Kong's Trade-IDDS (tradeidds.censtatd.gov.hk) is NOT requested: its robots.txt
// says "User-agent: * Disallow: /".
// Downloads are untrusted data: nothing here executes them; the extractor reads them with openpyxl (data only).

import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = join(ROOT, "research/2026-10/raw/uae_hkg_r43");
const DATE = process.env.FETCH_DATE || new Date().toISOString().slice(0, 10);
const YEAR = Number(DATE.slice(0, 4));
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const SCAD = "https://www.scad.gov.ae/en/w/non-oil-foreign-merchandise-trade-statistics-through-ports-by-harmonized-system";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];

async function visit(page, url) {
  const rec = { url, at: new Date().toISOString() };
  try {
    const resp = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    rec.status = resp ? resp.status() : null;
    await page.waitForTimeout(10000);
    rec.title = await page.title();
  } catch (e) {
    rec.error = String(e).slice(0, 200);
  }
  log.push(rec);
  console.log(rec.status ?? rec.error, url);
  await sleep(12000);
  return rec;
}

async function scad(ctx, page) {
  const slugs = [YEAR - 2, YEAR - 1].map((y) => `annually-${y}`);
  // monthly releases come about two months after the month; months not yet out are not requested
  for (let m = 0; m < Number(DATE.slice(5, 7)) - 1; m++) slugs.push(`monthly-${MONTHS[m]}-${YEAR}`);
  for (const slug of slugs) {
    const rec = await visit(page, `${SCAD}-${slug}`);
    if (rec.status !== 200 || /Access Denied/i.test(rec.title || "")) continue;
    const href = await page.evaluate(() => {
      const a = [...document.querySelectorAll('a[href*="/documents/"]')].find((x) => /_EN\.xlsx/i.test(x.href));
      return a ? a.href : null;
    });
    if (!href) continue;
    const r = await ctx.request.get(href, { timeout: 60000 });
    const f = `scad_${slug}.xlsx`;
    if (r.ok()) writeFileSync(join(OUT, f), await r.body());
    log.push({ url: href, at: new Date().toISOString(), status: r.status(), file: f, page: `${SCAD}-${slug}` });
    console.log(r.status(), f);
    await sleep(12000);
  }
}

async function bayanat(page) {
  // the dataset ids on bayanat.ae change per session, so the dataset is found by search and opened like a visitor would
  await visit(page, "https://bayanat.ae/en/Datasets");
  await page.fill("#searchText", "by country");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(12000);
  const card = page.locator('a[href*="Dataset-info"]', { hasText: "General Total Trade volume by country" }).first();
  if (!(await card.count())) return console.log("bayanat: dataset not found");
  await card.click();
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(10000);
  const btn = page.locator('a:has-text("Download"), button:has-text("Download")').first();
  const [d] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), btn.click()]);
  await d.saveAs(join(OUT, "bayanat_fca_by_country.zip"));
  log.push({ url: d.url(), page: page.url(), at: new Date().toISOString(), file: "bayanat_fca_by_country.zip" });
  console.log("saved bayanat_fca_by_country.zip");
}

async function comtradeHk(ctx) {
  // the public preview takes one period per call; months not yet reported return no rows
  for (let m = 1; m <= 12; m++) {
    const p = `${YEAR}${String(m).padStart(2, "0")}`;
    if (p > DATE.replace(/-/g, "").slice(0, 6)) break;
    const url = `https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode=344&partnerCode=643&period=${p}&flowCode=M&cmdCode=7108,TOTAL`;
    const r = await ctx.request.get(url, { timeout: 60000 });
    const f = `comtrade_hkg_7108_m_${p}.json`;
    if (r.ok()) writeFileSync(join(OUT, f), await r.body());
    log.push({ url, at: new Date().toISOString(), status: r.status(), file: f });
    console.log(r.status(), f);
    await sleep(4000);
  }
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
try {
  await scad(ctx, page);
  await bayanat(page);
  await comtradeHk(ctx);
} finally {
  writeFileSync(join(OUT, `fetch_log_${DATE}.json`), JSON.stringify(log, null, 1));
  await browser.close();
}
