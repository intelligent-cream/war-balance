# Wikipedia and press-only citations (round 41)

Mapping file: `citations_r41.json` (same folder). Generated 2026-10-24. Continues `citations_r39.json`.

**What was done.** Every Wikipedia link and every citation that rests only on a news site, blog, aggregator or search snippet in `research/2026-10` (`*.json`, `*-notes.md`, `gaps/*.json`, `gaps/*-notes.md`) was listed. Where an official or primary source for the same figure could be found and opened (or confirmed by web search when the site blocks this agent), the citation now points to it. Everything else is kept and marked as press. **No number was changed.** Where the official figure differs, it is listed under *Number differences* with its effect.

**Result.** No Wikipedia link is left as a citation (the old URLs survive only in `replaced_r41.old_url`, as a record). 21 citations moved to a primary source (about 600 occurrences, because a few sources are repeated in every country entry). 836 distinct press links remain, in 1412 places in the JSON files; all are marked.

## How press is marked

| where | mark |
|---|---|
| source objects with url | "kind": "press" |
| data rows with src or source_url | "src_kind": "press" / "source_url_kind": "press" |
| plain-string source lists | prefix 'Press only: ' |
| sources_r11.json links | "kind": "secondary" (pipeline convention; classify_sources treats it as a press report) |
| notes (*.md) | not tagged line by line; the press_only list below names every notes line with a press link |

A replaced entry also carries `"replaced_r41": {"old_url": …, "verified": …}`.

## Changes

| id | file(s) | old → new | supports | verified |
|---|---|---|---|---|
| R01 | `assumptions_r11_gain.json` ×6 | https://ru.wikipedia.org/wiki/%D0%A0%D0%BE%D1%81%D0%BE%D0%B1… → [Rosoboronexport JSC filed RAS accounts (FNS/Rosstat data, via audit-it.ru): 2014 EBIT RUB …](https://www.audit-it.ru/buh_otchet/7718852163_ao-rosoboroneksport) | Rosoboronexport 2014 revenue and net profit (arms margin term, 6 proposals) | fetched 2026-10-24 (EBIT and return on sales read; income statement rows did not load) |
| R02 | `captive_buyers.json` | https://en.wikipedia.org/wiki/Gazprom_Armenia → [Gazprom Armenia: in 2021 CJSC Gazprom Armenia imported 2,449.2 million cubic meters of nat…](https://armenia.gazprom.com/press/news/2022/02/73) | Gazprom owns Armenia's gas grid; Russian gas volume (~2 bcm in the label) | confirmed by web search 2026-10-24 (page returned 503 to the fetcher); ownership: Gazprom, Jan 2014 (100% of ArmRosgazprom), r39 C4 |
| R03 | `china_military.json` | https://en.wikipedia.org/wiki/China_and_the_Russo-Ukrainian_… → [Novaya Gazeta Europe, 17 Mar 2023, summarising Politico (16 Mar 2023, ImportGenius customs…](https://novayagazeta.eu/en/articles/2023/03/17/politico-china-supplies-russia-with-copies-of-m-16-marks-those-as-civilian-hunting-rifles-in-customs-papers-en-news) | Politico 2023 rifles/body armour; the sanctions chronology now has its own official entries (US Treasury jy1220; Council Regulation (EU) 2025/1494) | search 2026-10-24; politico.com returns 403 here, so the Politico URL slug in r39 stays unconfirmed |
| R04 | `flowback2.json` | https://en.wikipedia.org/wiki/Foreign_fighters_in_the_Russo-… → [Telex, 23 Jun 2023: Sandor Fegyir (volunteer, later Ukraine's ambassador to Hungary): abou…](https://telex.hu/english/2023/06/23/future-ukrainian-ambassador-hungary-not-taking-part-in-the-war-400-people-are-fighting-in-the-ukrainian-army) | Hungarian volunteers for Ukraine 200/400/600 | search 2026-10-24 |
| R05 | `flowback2.json` | https://en.wikipedia.org/wiki/Foreign_fighters_in_the_Russo-… → [ERR News: minister unable to say how many Estonian volunteers fight for Ukraine (no offici…](https://news.err.ee/1609120082/minister-unable-to-say-how-many-estonian-volunteers-fighting-for-ukraine) | Estonian volunteers for Ukraine 50/80/100 | search 2026-10-24 |
| R06 | `flowback2.json` | https://en.wikipedia.org/wiki/Foreign_fighters_in_the_Russo-… → [RFE/RL: Belarusian volunteers in the Kastus Kalinouski Regiment (the commander puts it at …](https://www.rferl.org/a/belarus-fighters-ukraine-long-march/32278387.html) | Belarusian volunteers for Ukraine 450/1,000/2,000 | search 2026-10-24 |
| R07 | `flowback2.json` | https://en.wikipedia.org/wiki/Foreign_fighters_in_the_Russo-… → [El Pais, 'Russia recruits Cubans for the frontlines in Ukraine: It's all been a scam' (202…](https://smallwarsjournal.com/2025/08/30/russia-recruits-cubans-for-the-frontlines-in-ukraine-its-all-been-a-scam-el-pais/) | Cubans fighting for Russia 1,000/3,000/20,000 | search 2026-10-24 (El Pais page itself not reached) |
| R08 | `flowback2.json` | https://en.wikipedia.org/wiki/Foreign_fighters_in_the_Russo-… → [SAnews (South African Government News Agency), 6 Nov 2025: the Presidency received distres…](https://www.sanews.gov.za/node/78099) | South Africans fighting for Russia 17/17/50 | fetched 2026-10-24; it gives 17 men and the investigation, no arrests (the press reports 4-5 arrests at OR Tambo on 28-30 Nov 2025, not 8) |
| R11 | `uncovered.json` ×203, `sources_r11.json` | https://www.carenews.com/fondation-de-france/news/quatre-ans… → [Fondation de France press release, Feb 2026 (four years of Solidarite Ukraine): EUR 21.6m …](https://fondationdefrance.org/images/pdf/2026/CP_FDF_4_ans_Ukraine.pdf) | France private donations (Fondation de France) | PDFs fetched 2026-10-24 (4-year and 1-year releases) |
| R12 | `energy.json` ×195 | https://www.trend.az/business/energy/3639390.html → [EPDK, Petroleum Market Annual Report 2023: crude oil imports 31,395,136 t in 2023 (-6.24%)](https://www.epdk.gov.tr/Detay/DownloadDocument?id=A2Bza6vGyaQ=) | Turkiye crude imports 31 Mt in 2023 | document fetched 2026-10-24 (31.395.135,95 tons) |
| R13 | `crea.json` ×2, `energy.json` ×121 | https://deccanchronicle.com/business/economics/russian-oil-i… → [ICRA research summary (Apr 2024): discounted Russian crude saved India USD 5.1bn in FY2023…](https://icra.in/Rating/DownloadResearchSummaryReport?id=5676) | India savings on Russian crude | PDF fetched 2026-10-24 |
| R14 | `assumptions_r11_gain.json` ×18 | https://ppt.ru/obzory/vstupaet-v-silu/postanovlenie-pravitel… → [Government Decree No. 1656 of 28 Nov 2024 amending Decree No. 1538 (official publication, …](http://publication.pravo.gov.ru/document/0001202411290007) | exchange-rate-linked export duties apply to 31 Dec 2024 (coal suspended Dec 2024) | record found through the pravo.gov.ru API 2026-10-24; page returns 200 |
| R15 | `assumptions_r11_gain.json` ×11 | https://gmk.center/news/v-rossii-nachali-dejstvovat-poshliny… → [Government Decree No. 988 of 25 Jun 2021 amending export duty rates (temporary duties on f…](http://publication.pravo.gov.ru/document/0001202106250042) | 15% base rate plus a specific minimum on metals exports, Aug-Dec 2021 | pravo.gov.ru API record (number and date match the 25 June 2021 decree reported by the press); the text itself was not opened |
| R16 | `assumptions_r11_gain.json` ×23 | https://expert.ru/news/v-rossii-sobrali-117-mlrd-rub-kursovy… → [Government Decree No. 1538 of 21 Sep 2023 on export duty rates (exchange-rate-linked dutie…](http://publication.pravo.gov.ru/document/0001202309210020) | rates 4% (80-85 RUB/USD) to 7% (95+), in force from 1 Oct 2023; RUB 117bn collected | pravo.gov.ru API record 2026-10-24; 117bn/186bn confirmed by web search (press) |
| R18 | `assumptions_r11_gain.json` ×5, `net_gain_russia.json`, `net_gain_russia_r14.json` | https://www.itiger.com/news/1124699335 → [UC RUSAL annual results announcement for the year ended 31 Dec 2025 (HKEX filing, 18 Mar 2…](https://newsfile.moomoo.com/public/NN-PersistNoticeAttachment/7781/20260318/12056504-0.PDF) | Rusal 2025 adjusted EBITDA margin 7.1% | PDF fetched and read 2026-10-24 |
| R19 | `assumptions_r11_gain.json` ×6 | https://www.akm.ru/news/chistaya_pribyl_rostekha_za_2021_god… → [Rostec press release (May 2022), Chemezov's 2021 report to the President: revenue RUB 2.06…](https://www.rostec.ru/upload/iblock/a3c/mwb8hb61alrpziupuajwnq345w4z3nb1.pdf) | Rostec 2021 revenue, EBITDA, net profit | confirmed by web search 2026-10-24 (rostec.ru returned 503 to the fetcher) |
| R20 | `assumptions_r11_hubs.json` | https://www.brusselstimes.com/590174/global-corporations-pay… → [B4Ukraine and KSE Institute, 'The Business of Staying' (Jul 2023, 2022 data): foreign comp…](https://b4ukraine.org/pdf/BusinessOfStaying.pdf) | Belgium 2022 company profit tax | PDF fetched 2026-10-24: USD 3.5bn read in the text; the Belgian split is in a table not extracted as text (search confirms it) |
| R21a | `assumptions_r11_hubs.json` | https://www.worldometers.info/ca/petroli/liberia-petroli/ → [US EIA International Energy Statistics: Liberia petroleum consumption 4.85 thousand b/d (2…](https://www.eia.gov/international/data/country/LBR/petroleum-and-other-liquids/annual-refined-petroleum-products-consumption) | Liberia oil consumption | EIA API read 2026-10-24 (4.852734 kb/d, 2024) |
| R21b | `assumptions_r11_hubs.json` | https://www.worldometers.info/fr/petrole/togo-petrole/ → [US EIA International Energy Statistics: Togo petroleum consumption 15.69 thousand b/d (685…](https://www.eia.gov/international/data/country/TGO/petroleum-and-other-liquids/annual-refined-petroleum-products-consumption) | Togo oil consumption | EIA API read 2026-10-24 (15.690353 kb/d, 2024) |
| R22 | `assumptions_r11_hubs.json` | https://engine.online/news/rotterdam-conventional-bunker-sal… → [Maritime and Port Authority of Singapore, bunker sales statistics (annual workbook): 51.82…](https://www.mpa.gov.sg/who-we-are/newsroom-resources/research-and-statistics/bunkering-statistics) | Singapore 2023 bunker total | MPA workbook bunker-sales_Sep-2026.xlsx read 2026-10-24 |
| R24 | `china_military.json` | https://amp.scmp.com/news/world/russia-central-asia/article/… → [US Treasury press release jy1220, 26 Jan 2023: Changsha Tianyi Space Science and Technolog…](https://home.treasury.gov/news/press-releases/jy1220) | China: satellite imagery to Wagner (Spacety) | fetched 2026-10-24 |
| R25 | `china_military.json` | https://www.scmp.com/news/china/diplomacy/article/3318793/eu… → [Council Regulation (EU) 2025/1494 (18th package, OJ 19 Jul 2025): transaction ban on Heihe…](https://eur-lex.europa.eu/eli/reg/2025/1494/oj) | EU 18th package sanctions two Chinese banks | confirmed by web search (Global Trade Alert, SCMP) 2026-10-24; EUR-Lex returns a bot check to the fetcher |
| R26 | `sources_r11.json` | https://globalnews.ca/news/8851619/russia-cut-finland-off-ga… → [Gasum, 20 May 2022: natural gas imports from Russia under Gasum's supply contract will be …](https://gasum.com/en/About-gasum/for-the-media/News/2022/natural-gas-imports-from-russia-under-gasums-supply-contract-will-be-halted-on-saturday-21-may-at-07.00) | Russia cut gas to Finland on 21 May 2022 | confirmed by web search 2026-10-24 (gasum.com returns 403 to the fetcher) |
| R09 | `flowback2.json` | https://en.wikipedia.org/wiki/List_of_Americans_in_the_Armed… → removed | US volunteers for Ukraine 800/1,500/3,000 | no official count by nationality exists (r39 C8); the remaining Espreso source is marked press |
| R10 | `energy2.json` | https://shipandbunker.com/news/emea/778476-gibraltar-2022-bu… → [Ship & Bunker (trade press, Dec 2022; S&B's own estimate, no official volume exists): ...](https://shipandbunker.com/news/emea/778476-gibraltar-2022-bunker-calls-heading-for-12-year-low) | Gibraltar bunker sales ~4.3 Mt (2021), ~3.4 Mt (2022 est.) | name said 'via Wikipedia' although the URL was already Ship & Bunker (r39 C6); marked press |
| R28 | `refugees_budgets_r39.json` | https://gazzettaufficiale.biz/atti/2025/20250002/24A07062.ht… → [https://www.gazzettaufficiale.it/eli/id/2025/01/03/24A07062/SG](https://www.gazzettaufficiale.it/eli/id/2025/01/03/24A07062/SG) | Italy: EUR 36m spending limit for 2025 for Civil Protection reception measures (DPC ordinance, GU n. 2, 3 Jan 2025) | official ELI page returns 200 (2026-10-24); the act text loads in a frame, so the EUR 36m was not re-read |
| R29 | `power_of_siberia_r15.json` | (new) → [https://www.gazprom.com/press/news/2014/may/article191451/](https://www.gazprom.com/press/news/2014/may/article191451/) | the 2014 Gazprom-CNPC contract, 38 bcm a year for 30 years (the contracted plateau) | confirmed by web search 2026-10-24; gazprom.com unreachable from here. Yearly volumes stay Interfax/TASS/Reuters (press) |
| N1 | `captive_buyers-notes.md` | https://en.wikipedia.org/wiki/Gazprom_Armenia → [https://armenia.gazprom.com/press/news/2022/02/73](https://armenia.gazprom.com/press/news/2022/02/73) | table row Armenia (line 32) | as R02 |
| N2 | `assumptions_r11_gain-notes.md` | (new) → [https://www.audit-it.ru/buh_otchet/7718852163_ao-rosoboroneksport](https://www.audit-it.ru/buh_otchet/7718852163_ao-rosoboroneksport) | 'Weaker sources' list (line 123): Rosoboronexport 2014 figures no longer cite Wikipedia | as R01 |
| N3 | `assumptions_r11_hubs-notes.md` | https://www.brusselstimes.com/590174/global-corporations-pay… → [https://b4ukraine.org/pdf/BusinessOfStaying.pdf](https://b4ukraine.org/pdf/BusinessOfStaying.pdf) | Belgium 2022 (line 106) | as R20 |
| R27 | `pipeline/build_data.py` | https://interfax.com/newsroom/top-stories/115552/ → [https://www.gazprom.com/press/news/2014/may/article191451/](https://www.gazprom.com/press/news/2014/may/article191451/) |  | Gazprom release of 21 May 2014 confirmed by web search 2026-10-24 (gazprom.com unreachable from here) |

R03–R07 swap a Wikipedia page for the press report it summarised: still press, now marked. R09 removes a Wikipedia list (no official count of US volunteers exists). R11–R25 and R26–R29 are official or primary sources.

## Number differences (no number changed)

| id | item | file | ours | official / primary | effect |
|---|---|---|---|---|---|
| D1 | Rosoboronexport 2014 revenue | `gaps/assumptions_r11_gain.json (proposal 6, arms; same text in 6 proposals)` | RUB 22.04bn (from ru.wikipedia) | not published as such; filed RAS accounts give EBIT RUB 10.35bn at a 58.2% return on sales, i.e. about RUB 17.8bn revenue; net profit RUB 9.67bn confirmed | none: the commission on USD 13.2bn of deliveries becomes about 3.6% instead of 4.4%, net profit stays about 1.9% of contract value, so the +0.02 (0.01-0.03) arms margin term is unchanged. Number not changed |
| D2 | Armenia: Russian gas volume | `gaps/captive_buyers.json sources.arm_gazprom.figures` | ~2 bcm Russian vs ~0.37-0.5 bcm Iranian | Gazprom Armenia imported 2,449.2 million m3 in 2021; the Iranian swap volume (~0.37 bcm) has no official source found | none: a label description (the captive label was removed in round 26); the 84.5% Comtrade share is unchanged. Recorded as official_check_r41 in the entry |
| D3 | South Africans fighting for Russia: arrests | `gaps/flowback2.json fighters_for_russia.ZAF` | label: '17 nationals in Donbas, 8 arrests' | SAnews (Presidency statement, 6 Nov 2025): 17 men, investigation ordered, no arrests mentioned; press: 4-5 people arrested at OR Tambo, 28-30 Nov 2025 | none: low/central 17 unchanged; only the arrest count in the old label was unsupported (the old label text was replaced by the SAnews title) |
| D4 | Estonian volunteers for Ukraine | `gaps/flowback2.json volunteers_for_ukraine.EST` | 50 / 80 / 100, '3 killed' | no official count (ERR: minister unable to say); ERR counts at least six Estonian volunteers killed by Aug 2025; no source found for '~100' | people flows are a rough indication (certainty D); no money effect. Number not changed; the 100 high has no source |
| D5 | Belarusian volunteers for Ukraine | `gaps/flowback2.json volunteers_for_ukraine.BLR` | 450 / 1,000 / 2,000 | none; RFE/RL: the regiment commander says more than 300; CEPA: over 1,000 passed through, a few hundred remain. '~450' was not found | none on money (Belarusian citizens are excluded as co-belligerent, see the entry note). Number not changed; a low of about 300 would match the sources |
| D6 | Fondation de France donations | `gaps/uncovered.json (shared private-donation source list) and sources_r11.json private` | EUR 16m (2022) | EUR 16.8m collected in the first year (to Feb 2023); EUR 21.6m to 31 Dec 2025 (matches) | none: a source label; France's private-donation values come from other inputs. The label now carries the official figures |
| D7 | Singapore bunker sales 2023 | `gaps/assumptions_r11_hubs.json proposal 4 (SGP)` | 51.27 Mt (Engine; conventional fuels only) | MPA: 51.82 Mt all fuels (2023), 54.92 Mt (2024) | none: the note's '51.3-54.9 Mt' keeps the 0.38 bunker share; 51.8 does the same |
| D8 | Exchange-rate export duty collections | `gaps/assumptions_r11_gain.json (proposals citing Expert)` | RUB 117bn collected (to mid-Dec 2023) | no Treasury figure found; the FTS itself later gave RUB 186bn for 1 Oct 2023-Feb 2024 (press) | none: the proposals use the decree's 4-7% rates, not the 117bn total |

Official figures that match the old press figure: EPDK 2023 crude imports 31.40 Mt = '31 Mt' (R12); ICRA USD 5.1bn / 7.9bn (R13); Rusal 2025 adjusted EBITDA margin 7.1% (R18); Rostec 2021 revenue 2.06trn, EBITDA 334.9bn, net profit 163.5bn (R19); B4Ukraine USD 3.5bn profit tax (R20); EIA: Liberia 4.85 kb/d, Togo 15.69 kb/d (R21); Hungary ~400 / ~30 killed (R04); Cuba ~20,000 recruited, 200-300 killed (R07); Treasury: Spacety designated 26 Jan 2023 (R24); Regulation 2025/1494: two Chinese banks (R25); Gasum: Russian supply halted 21 May 2022 07:00 (R26); Gazprom-CNPC 2014: 38 bcm a year, 30 years (R27/R29).

## Round 39 partials

| id | was | now | how |
|---|---|---|---|
| C1 | partial | done | R01: Wikipedia replaced by the filed accounts (audit-it.ru); revenue difference recorded as D1 |
| C4 | partial | done except the Iranian volume | R02: Gazprom Armenia's own 2021 import release; the Iranian swap (~0.37 bcm) is still press only (D2) |
| C5 | partial | partial | R03, R24, R25: Wikipedia gone; sanctions chronology now US Treasury jy1220 and Regulation (EU) 2025/1494. politico.com still returns 403, so the Politico summary by Novaya Gazeta Europe stands in, marked press. Still press: the EU 14th-package Chang Guang listing (Brussels Times; Implementing Regulation number not confirmed), Blinken's nitrocellulose remark (Axios; State Department transcript not reached), and the NYT gunpowder item (only in the old Wikipedia summary) |
| C12 | partial | press only, figure confirmed | '2023 contracts >USD 12bn' confirmed in the RBC headline and Prime (search, 2026-10-24); no Rosoboronexport release found (roe.ru not reachable) |
| C13 | partial | partial (not a press citation) | Enel staging host unchanged; the DG ENER Q1 2021 report PDF returns 403 and archive.org 429 from here; ICE history is paywalled |
| C14 | partial | contract primary, 2025 volume press | R27/R29: the 2014 Gazprom-CNPC contract release is the primary source for the contracted path (also the site source link). 2025 = 38.8 bcm remains Gazprom's preliminary figure via Interfax; the IEA Gas Market Report (~39 bcm, via TASS) returns 403 here |
| C15 | partial | press only | the INSS report ('Economic effects of North Korea's troop dispatch and munitions exports to Russia', Mar 2026) was not found on inss.re.kr (site search returned nothing); Korea Times, NK News, Bloomberg, The Insider stay, marked press |

## pipeline/build_data.py

Only these lines changed:

- line 1943: SOURCE_TYPE: "people": "report" -> "press" (all its documents are press reports)
- line 3107: src.add power_of_siberia name: now names Gazprom's 2014 CNPC contract and says yearly volumes come via Interfax, TASS and Reuters
- line 3108: src.add power_of_siberia url: interfax.com/newsroom/top-stories/115552/ -> gazprom.com/press/news/2014/may/article191451/

Already typed `press` in `SOURCE_TYPE`: `gas_cuts`, `power_of_siberia`, `military_payment`, `dangote`, `north_korea_r24`.

Not changed (outside the allowed edits), suggested:

- attach_r11_sources (line ~1845) sets kind 'primary' for every assumptions_r11_* proposal source; 34 press links reach the site as primary documents. Reading the research field would fix it: "kind": "secondary" if x.get("kind") == "press" else "primary".
- PRESS_HOSTS misses the hosts listed in press_hosts_missing_from_pipeline (it would catch the same 34 links and any other press link that reaches the site).
- S&P Global news pages (spglobal.com .../news-research/...) are trade press; PRESS_HOSTS has argusmedia and lloydslist but not spglobal.
- military_rus_r6 (8 of 9 documents press) and china_military (5 of 6) are typed 'report'; they mix data with press, so 'report' can stay, but the site will show them as reports.

The 360 press hosts missing from `PRESS_HOSTS` are listed in `citations_r41.json` (`press_hosts_missing_from_pipeline`).

## Remaining press-only citations

No primary source was found for these (or the primary is not public: Russian budget lines, intelligence estimates, investigations, company statements made only to the press). Full list with every file and notes line: `citations_r41.json` → `press_only.list`.

By file (distinct press links):

| file | links |
|---|---|
| `sources_r11.json` | 88 |
| `flowback2.json` | 61 |
| `nonreport.json` | 49 |
| `other.json` | 44 |
| `round4b.json` | 40 |
| `aid_gaps.json` | 29 |
| `assumptions_r11_people.json` | 25 |
| `flowback.json` | 23 |
| `ua_arms_purchases.json` | 23 |
| `arms_r6.json` | 23 |
| `private_frozen_r39.json` | 23 |
| `uncovered.json` | 22 |
| `fuel_volume_cf.json` | 21 |
| `military_rus_r6.json` | 20 |
| `military_rus_r6-notes.md` | 19 |
| `russian_owned_r10.json` | 19 |
| `payment_channels.json` | 18 |
| `remittances.json` | 18 |
| `china_military.json` | 18 |
| `narrow.json` | 17 |
| `ua_arms_purchases-notes.md` | 17 |
| `arms_r6-notes.md` | 17 |
| `company_flows.json` | 17 |
| `shadow_fleet_r6.json` | 16 |
| `company_flows-notes.md` | 16 |
| `wagner_r40-notes.md` | 16 |
| `wagner_r40.json` | 16 |
| `refine.json` | 14 |
| `russian_arms_exports.json` | 14 |
| `value_kept.json` | 14 |
| `company_profits_r39.json` | 13 |
| `russia_state_finance.json` | 13 |
| `payment_channels-notes.md` | 13 |
| `russian_arms_exports-notes.md` | 13 |
| `frozen_assets.json` | 13 |
| `gas_prices.json` | 13 |
| `assumptions_r11_hubs.json` | 12 |
| `energy2.json` | 11 |
| `company_taxes_r6.json` | 11 |
| `weapons_value.json` | 11 |
| `refugees_net.json` | 11 |
| `assumptions_r11_gain.json` | 10 |
| `net_gain_russia.json` | 10 |
| `net_gain_russia_r14.json` | 10 |
| `relocants.json` | 10 |
| `refugees.json` | 10 |
| `weapons_value-notes.md` | 10 |
| `money_ledger.json` | 10 |
| `belarus-notes.md` | 9 |
| `belarus.json` | 9 |
| `shadow_fleet_r6-notes.md` | 9 |
| `north_korea_r24.json` | 8 |
| `remittances_r13.json` | 8 |
| `company_taxes_r6-notes.md` | 8 |
| `reexports.json` | 8 |
| `residual.json` | 8 |
| `shipping.json` | 7 |
| `north_korea_r24-notes.md` | 7 |
| `loans_value-notes.md` | 7 |
| `loans_value.json` | 7 |
| `remittances_r13-notes.md` | 7 |
| `shadow_fleet.json` | 6 |
| `assumptions_r11_rules.json` | 6 |
| `stop_dates_r16-notes.md` | 6 |
| `stop_dates_r16.json` | 6 |
| `chpl.json` | 6 |
| `round4a.json` | 6 |
| `laundered_eu.json` | 5 |
| `military_payment_r13-notes.md` | 5 |
| `company_profits_r39-notes.md` | 5 |
| `shadow_fleet-notes.md` | 5 |
| `actuals_r7.json` | 5 |
| `net_gain_ukraine.json` | 5 |
| `net_gain_ukraine_r14.json` | 5 |
| `captive_buyers-notes.md` | 5 |
| `captive_buyers.json` | 5 |
| `power_of_siberia_r15-notes.md` | 5 |
| `refugees_gain-notes.md` | 5 |
| `refugees_gain.json` | 5 |
| `laundered_eu-notes.md` | 4 |
| `military_payment_r13.json` | 4 |
| `audit2-notes.md` | 4 |
| `audit2.json` | 4 |
| `refresh_2026.json` | 4 |
| `laundered_r39.json` | 4 |
| `money_ledger-notes.md` | 4 |
| `power_of_siberia_r15.json` | 4 |
| `military_delivered-notes.md` | 4 |
| `laundered_r6.json` | 3 |
| `crude_content.json` | 3 |
| `refresh_2026-notes.md` | 3 |
| `assumptions_r11_hubs-notes.md` | 3 |
| `frozen_assets-notes.md` | 3 |
| `assumptions_r11_rules-notes.md` | 3 |
| `hub_buyers.json` | 3 |
| `import_gap_r39-notes.md` | 3 |
| `import_gap_r39.json` | 3 |
| `laundered_r39-notes.md` | 3 |
| `crea.json` | 2 |
| `energy.json` | 2 |
| `laundered_r6-notes.md` | 2 |
| `verify_r11_trade.json` | 2 |
| `refugees_net-notes.md` | 2 |
| `turkey_prices.json` | 2 |
| `windfall_band_r24-notes.md` | 2 |
| `windfall_band_r24.json` | 2 |
| `verify_r11_aid.json` | 1 |
| `kiel.json` | 1 |
| `companies_all-notes.md` | 1 |
| `companies_all.json` | 1 |
| `deu_undisclosed_r39-notes.md` | 1 |
| `deu_undisclosed_r39.json` | 1 |
| `energy_nowar.json` | 1 |
| `trend2.json` | 1 |
| `turkey_prices-notes.md` | 1 |
| `ua_trade_cf-notes.md` | 1 |
| `ua_trade_cf.json` | 1 |

Most cited (10 or more places, or feeding a model value):

| citations | link | supports |
|---|---|---|
| 123 | https://www.dailysabah.com/business/energy/turkiye-saves-2-billion-on-russian-oi… | Reuters calculation (LSEG data + trader estimates), crude and products, reported 19 Dec 2023; other years not estimated. |
| 45 | https://www.bairdmaritime.com/shipping/tankers/april-shipping-costs-decline-for-… | Reuters via Baird Maritime: Urals freight Baltic-India USD 20-23m (Mar 2026), 16m (Apr 2026) |
| 30 | https://novayagazeta.eu/en/articles/2026/06/24/the-billion-euro-loophole-en |  |
| 14 | https://shippingtelegraph.com/maritime-insurance-news/uae-and-russia-the-biggest… | Shipping Telegraph on CREA registered-owner counts (UAE ~41% of shadow crude tankers) |
| 12 | https://kyivindependent.com/over-1-500-foreign-mercenaries-from-48-countries-joi… | iStories leak (Moscow EMIAS): 603 Nepalis at recruitment centres |
| 11 | https://english.kontan.co.id/news/complete-list-of-foreign-mercenaries-fighting-… | Russian MoD (BELLIGERENT, unverified), 14-16 Mar 2024: 13,387 'mercenaries' arrived, 5,962 killed https://english.kontan.co.id/news/complete-list-of-foreign-mer |
| 11 | https://newsukraine.rbc.ua/news/russia-s-top-source-of-foreign-mercenaries-17813… | Ukraine GUR / CCD 'I Want to Live' project (BELLIGERENT), Jun 2026: >42,000 foreigners incl. >14,000 DPRK https://newsukraine.rbc.ua/news/russia-s-top-source-of |
| 8 | https://www.bloomberg.com/news/articles/2026-02-03/russian-steelmaker-severstal-… | Bloomberg: Severstal margins drop to 16-year low (2025 EBITDA margin 19%), as cited in net_gain_russia.json |
| 8 | https://www.spglobal.com/energy/en/news-research/latest-news/natural-gas/020226-… | S&P Global: TurkStream flows to Europe 16.8 bcm in 2025 (+8% y/y), 1.61 bcm Jan 2026 |
| 7 | https://www.rferl.org/a/iran-protests-russia-war-ukraine/33648840.html | RFE/RL: How important is Iran for Russia's war effort? |
| 7 | https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-dea… | NK News: North Korea likely earned $14.4B from military deals with Russia (cash a limited portion; fuel, weapons and food deliveries USD 0.58-1.5bn; troop pay) |
| 7 | https://www.ftm.eu/articles/who-is-behind-the-russian-shadow-fleet | Follow the Money: European shipowners keep Russia's shadow fleet afloat (230+ tankers, >USD 6bn; Greece ~USD 4bn/127 ships, UK USD 590m/22, Germany USD 190m) |
| 6 | https://www.defenceukraine.com/en/references/danish-model/ | defenceukraine.com Danish Model reference |
| 6 | https://www.defenceukraine.com/en/references/czech-ammunition-initiative/ | defenceukraine.com Czech Ammunition Initiative reference |
| 6 | https://www.vedomosti.ru/politics/news/2024/07/30/1052875-chemezov-predstavil-pu… | Vedomosti, 30 Jul 2024: Chemezov presented Rostec report |
| 6 | https://ru.themoscowtimes.com/2026/07/15/deneg-unas-nemnogo-glava-krupneishego-p… | The Moscow Times (ru), 15 Jul 2026: Rostec profit fell 42% to RUB 76.4 bn |
| 6 | https://www.kommersant.ru/doc/739784 | Kommersant Vlast, 5 Feb 2007: Oruzhie massovogo poglosheniya |
| 6 | https://www.zerno.ru/node/29146 | Zerno.ru / Interfax: export duty revenue on crops in 2024 RUB 141.19 bn vs forecast 214.43 bn (Accounts Chamber note on 2024 budget execution) |
| 6 | https://www.agroinvestor.ru/markets/article/45107-poshliny-ne-plyvut-v-byudzhet-… | Agroinvestor, 6 Nov 2025: Poshliny ne plyvut v byudzhet |
| 6 | https://www.interfax.ru/russia/846294 | Interfax, 15 Jun 2022: budget received about RUB 175 bn from the grain damper |
| 6 | https://www.interfax.ru/russia/800047 | Interfax, 28 Oct 2021: Minfin notes RUB 47 bn from grain export duty |
| 6 | https://www.akm.ru/news/vyruchka_mmk_za_2024_god_vyrosla_na_0_7/ | AK&M, 20 Mar 2025: MMK 2024 revenue up 0.7% |
| 6 | https://finance.mail.ru/article/chistaya-pribyl-mmk-po-msfo-za-devyat-mesyacev-s… | Mail.ru Finance: MMK 9M 2025 IFRS |
| 6 | https://militarnyi.com/en/blogs/iran-sent-russia-2-7-billion-worth-of-missiles-a… | Militarnyi: Iran sent Russia USD 2.7bn worth of missiles alone |
| 6 | https://theins.press/en/politics/281953 | Russian Investigative Committee (BELLIGERENT), Bastrykin, May 2025 via The Insider https://theins.press/en/politics/281953 |

## Not done

- Notes files (`*-notes.md`) were not tagged line by line; their press links are in `press_only.list` with file and line.
- Sites that refused this agent (gazprom.com, rostec.ru, mmk.ru, iea.org, congress.gov, imf.org, eur-lex.europa.eu, gasum.com, mof.gov.ua, cbu.uz) were checked by web search only; those entries say so in `verified`.
- Severstal 2025, MMK 2024 and 9M 2025, Rostec 2023 and 2025, grain-duty revenue, Rotterdam bunkers, Fujairah, Panama, Armenian bank profits and the central-bank remittance figures quoted via the press: an official page exists or should exist but could not be opened or found here; they stay press, marked.
