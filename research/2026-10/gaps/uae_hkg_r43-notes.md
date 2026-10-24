# UAE and Hong Kong trade data through a browser (round 43)

Gathered 2026-10-24. Data: `uae_hkg_r43.json`. Fetch: `pipeline/fetch/uae_hkg_r43.mjs` (Playwright, Node), then `pipeline/fetch/uae_hkg_r43_extract.py` (openpyxl). Extracts: `research/2026-10/raw/uae_hkg_r43/` (the `.xlsx` and `.zip` downloads are git-ignored). Not used by the build yet.

The owner asked whether Playwright can get the UAE and Hong Kong trade data that curl could not. **Short answer: partly.** A normal headless Chromium gets past the sites that only reset or refuse curl (Dubai Customs, bayanat.ae, SCAD). It does not get past the UAE statistics office (FCSC), which blocks outright. Hong Kong's interactive tool forbids automated access in its robots.txt. Nothing found narrows the UAE or Hong Kong "paid to Russia" ranges for 2022–2025.

## Rules kept

- One ordinary page load at a time, a 10 s wait on each page and at least 12 s between requests. bayanat.ae asks for `Crawl-delay: 10`.
- No stealth plugins, no CAPTCHA or challenge solving, no faked fingerprints. Each blocked site was loaded once and then left alone.
- robots.txt was read for every host before it was visited.
- Downloads were saved to their own folders and read as data only.

## What was tried

| site | robots.txt | result in the browser | data |
|---|---|---|---|
| fcsc.gov.ae, uaestat.fcsc.gov.ae (FCSC, UAE Stat) | allows `*`; blocks OpenAI bots | **403**, Cloudflare "Sorry, you have been blocked". This is a block page, not a challenge that clears. Stopped | none |
| bayanat.ae (UAE Open Data Portal) | `Crawl-delay: 10` | 200 | Federal Customs Authority (FCA) trade by country, **2010–2019 only**. Ministry of Economy top-10 partner tables, 2015 only. Searches for "Russia" and "Russian Federation" return nothing. No partner data after 2019 |
| www.dsc.gov.ae → data.dubai (Dubai Statistics / Dubai Pulse) | allows | 200 with a WAF "Request Rejected" page. Stopped | none |
| www.dubaicustoms.gov.ae | allows `/en/` | 200 in the browser (curl gets a connection reset) | "Trade Statistics" open-data page: press-release cards for 2013–2020 and 2023, Dubai totals only. No partner or commodity tables |
| data.gov.ae | – | proxy CONNECT 502 | none |
| www.economy.gov.ae | – | 502 | The ministry is now moet.gov.ae (200). Its open-data page links back to bayanat.ae |
| www.scad.gov.ae (Statistics Centre – Abu Dhabi) | allows `/en/` and `/documents/20122/` | 200 | **Non-oil trade through Abu Dhabi ports, by HS section and by country (top 10 only)**: annual 2024 and 2025, monthly 2026 (Mar–Jul found). The annual 2022–2023 slugs give 404 |
| www.censtatd.gov.hk (C&SD) | allows all, AI agents included | 200 | Web-table API: aggregate tables only (as before). The annual supplements by country × commodity (B1020002 imports, B1020004 exports and re-exports) **stop at the 2017 edition**. The trade dashboard is a Tableau Public embed; it rendered blank headless and shows key statistics only |
| tradeidds.censtatd.gov.hk (Trade-IDDS) | **`User-agent: * Disallow: /`** | **not requested** | This is the only C&SD source for country × HS data after 2017 and for **re-exports by origin** |

## Results

**1. UAE official partner data, 2010–2019 (FCA via bayanat).** UAE trade with Russia, USD bn:

| year | imports | exports | re-exports |
|---|---|---|---|
| 2017 | 1.727 | 0.249 | 0.556 |
| 2018 | 2.153 | 0.302 | 0.961 |
| 2019 | 2.794 | 0.342 | 0.545 |

- The 2019 imports, AED 10,262.5 m, convert to USD 2,794.4 m at the peg. That **matches IMF IMTS to the dollar** (USD 2,794,413,952).
- So IMTS carries the UAE's own customs figures. The IMTS imports for 2022–2025 (USD 8.19, 6.45, 6.53 and 8.13 bn) are the UAE's official totals, not IMF estimates.
- No official partner figures after 2019 could be reached: FCSC is blocked, and bayanat and Dubai have nothing newer.

**2. Abu Dhabi ports, non-oil (SCAD).** Each table lists only the top 10 countries:

- **Imports from Russia, 2024 and 2025:** Russia is not in the top 10, so the value is below the 10th country: below AED 4.36 bn (USD 1.19 bn) in 2024 and below AED 4.48 bn (USD 1.22 bn) in 2025.
- **Imports from Russia, 2026:** below the top-10 line in Mar–May; AED 580 m in June and 690 m in July (USD 158 m and 188 m).
- **Re-exports to Russia, 2026:** in the top 10 every month, AED 612, 899, 1,058, 1,248 and 620 m in Mar–Jul (USD 167–340 m a month). In 2024–25 they were below AED 0.99 bn and 0.93 bn a year.
- Most of the UAE's USD 6.5–8.1 bn of imports from Russia therefore enters through Dubai, where the gold trade is. SCAD's precious-metals imports run at only about AED 0.05–0.6 bn a month.

**3. Hong Kong, gold from Russia, 2026 by month.** Source: UN Comtrade monthly public preview, i.e. C&SD's own records; this was not reached through the browser. HS 7108 imports from Russia, USD m:

| | Jan | Feb | Mar | Apr | May | Jun | Jul | Jan–Jul |
|---|---|---|---|---|---|---|---|---|
| HS 7108 | 741 | 587 | 1,636 | 2,720 | 3,783 | 3,695 | 3,115 | **16,278** |
| TOTAL | 823 | 722 | 1,841 | 2,939 | 4,007 | 3,953 | 3,181 | 17,466 |

- In January–July 2026 Hong Kong already imported **USD 16.3 bn** of Russian gold, against USD 10.45 bn for all of 2025.
- Gold is 93% of everything Hong Kong imported from Russia.
- The TOTAL rows are already in `raw/comtrade_api/comtrade_monthly_2026_*.json.gz`. The HS 7108 split is new. August and September were not yet in Comtrade.

## Comparison with the site

- **HKG `to_rus`** (EUR bn, 2021–2026): central 1.14, 1.54, 3.96, 3.55, 5.42, 4.78; low 0.96, 0.55, 0.98, 0, 0, 0.09; high 1.34, 2.83, 6.52, 8.36, 12.87, 9.73.
- Hong Kong's figures in Comtrade *are* C&SD's figures, so C&SD's HS 7108 imports from Russia would be identical to what the build already uses (0.58, 5.21, 4.64 and 10.45 bn). Trade-IDDS would add nothing for **imports**.
- The width of the HKG range comes from *where the gold goes next*: the onward share to the mainland (`HK_ONWARD`, 0.30 to 0.85) and the share re-exported elsewhere. Only C&SD's **re-exports by origin** (Russian-origin HS 7108 re-exported, by destination) would measure that. Those data are in Trade-IDDS only, and its robots.txt forbids automated access.
- **Effect on the range: none from what was obtained.** If origin-specific re-exports were measured, the 0.30–0.85 onward band would become a measured share. That would remove most of the 2025 range of 0 to 12.9 bn; it cannot be quantified without the data.
- The 2026 monthly gold split confirms that the 2026 rise is gold. The build's 2026 `HK_METALS_SHARE` (1.0, carried from 2025) stays right.
- **ARE `to_rus`** (EUR bn): central 3.02, 5.60, 6.92, 3.67, 3.91, 1.60; low 2.97, 2.18, 3.43, 0.13, 0, 0; high 3.06, 9.33, 10.68, 10.86, 9.46, 5.52.
- **No narrowing for ARE.** No official UAE partner × commodity data after 2019 could be reached, so gold (HS 7108) and fuels (HS 27) by origin for 2022–2025 stay unmeasured.
- Two things do come out for ARE:
  1. The IMTS totals are confirmed as UAE official data. They can be cited as such, and as the ceiling of what the UAE *declares* it imported from Russia (USD 8.13 bn in 2025).
  2. Abu Dhabi ports take at most about USD 1.2 bn of it, so the rest, and the gold, goes through Dubai.
- **The "~USD 20 bn" official UAE–Russia figure** is, as far as the reached sources show, *total* non-oil trade in both directions. It includes UAE exports and re-exports to Russia, which belong to "sold to Russia", not "paid to Russia". It is not a like-for-like check of the payments figure. This is an inference: the FCSC release itself could not be opened.

## Proposed build changes (for the integrator)

1. **Optional, HKG 2026.** Add the HS 7108 monthly rows (`raw/uae_hkg_r43/comtrade_hkg_7108_monthly.csv`) to the HK panel, so the 2026 metals share is measured (0.93 of the total) rather than carried from 2025. The effect is small, because the share of the *rise* is already 1.0.
2. **ARE sources.** Relabel the IMTS ARE import series as "UAE official customs data (FCA, via IMF IMTS)". The basis is the exact 2019 match with the FCA by-country file.
3. **No change to the ARE or HKG ranges.** Nothing measured supports narrowing them.
4. **To narrow HKG:** ask C&SD (trade@censtatd.gov.hk, tel. 852 3863 2596) for a custom table: HS 7108 re-exports of Russian origin by destination, 2022–2026. Alternatively, the owner could pull it by hand from Trade-IDDS as an ordinary user; the robots rule applies to automated agents.
5. **To narrow ARE:** FCSC would need to be reached from a normal connection by hand, or the data requested from FCSC. An automated session should not retry it.
6. **ARE "sold to Russia", 2026.** Abu Dhabi re-exports to Russia rose to AED 0.6–1.25 bn a month in Mar–Jul 2026. This is a lower bound on the UAE's 2026 sales to Russia through Abu Dhabi only. It concerns the other direction and is listed only.

## Reproducibility

`node pipeline/fetch/uae_hkg_r43.mjs` re-runs the fetch, in about 8 minutes with the delays:

- SCAD release pages are found by their slug; the xlsx link is read from each page.
- The bayanat dataset is found by search and opened with a click, because its ids change per session.
- Comtrade months are fetched one period per call.

`uv run pipeline/fetch/uae_hkg_r43_extract.py` writes the three CSVs. The sites that refused an ordinary visit, and Trade-IDDS, are deliberately not requested.

**Terms.**
- C&SD: "Statistical information on this website can be freely used, unless otherwise specified".
- bayanat.ae: UAE open-data licence, for public use.
- SCAD: the files are public publications.
- Dubai Customs: its terms were not reviewed beyond robots.txt, and nothing from it was used.
