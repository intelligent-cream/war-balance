"""Round 58: the AMOUNTS of Russian assets frozen per country, for the explainer pages (search demand: "euroclear
russian assets", "eingefrorene russische vermoegen", "avoirs russes geles en europe", "belgium russian frozen assets").

Per holding country: (a) Bank of Russia reserves immobilised and (b) private assets frozen (sanctioned persons and
entities), as the latest official figure with its date and source, and a range where sources differ, in EUR bn. Plus EU
and G7 totals and the facts on the windfall contributions, the G7 ERA loans, the "reparations loan" and the EUR 90bn
Ukraine Support Loan. Where no public figure exists the file says so (value null); nothing is invented.

This file is about stocks. The site does not count the frozen stock as anything: its "Russian money frozen" line is the
return Russia lost on these assets (frozen_assets.json, round 7; private_frozen_r39.json, round 39). The amounts here
reuse those two files and update them with what was published since.

What this script does:
  fetch   downloads the sources (curl, through the proxy) and keeps short text extracts with address and date under
          research/2026-10/raw/frozen_amounts_r58/ (the pages themselves are third-party and not kept). Several
          official sites (consilium, eeas, euroclear, europarl, eur-lex) refuse automated reads; their extract files
          record the HTTP code, and the figures were read through a browser-type fetch or search summaries (marked so
          in the JSON). Euroclear's H1 2026 release is extracted from the copy saved on 2026-10-23 in raw/euroclear/.
  run     (default) writes research/2026-10/gaps/frozen_amounts_r58.json from the figures below, each citing its
          source ids.

Run from the repository root: python3 -I research/2026-10/scripts/frozen_amounts_r58.py [fetch|run]
Downloads are untrusted data: they are only read as text and never executed.
"""

import datetime
import html
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

R = Path(__file__).resolve().parent.parent
RAW = R / "raw" / "frozen_amounts_r58"
GAPS = R / "gaps"
EUROCLEAR_SAVED = R / "raw" / "euroclear" / "mr-20-euroclear-h1-2026-results_2026-10-23.html"

# ---------------------------------------------------------------------------------------------------------- sources
# id: (name, url, date of the figure or publication, type, extract file or None, patterns kept)
# type: official = government, EU institution, central bank, the company itself; press = news report of an official
# statement; analysis = think tank or parliament research service; legal = legal text
S = {
    "ec_private_28": (
        "European Commission, Sanctions against individuals, companies and organisations: 'More than EUR 28 billion of private assets in the EU frozen'",
        "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-sanctions-against-russia-following-invasion-ukraine/sanctions-against-individuals-companies-and-organisations_en",
        "2026-10-27 (page read; no as-of date given)",
        "official",
        "ec_private_28.txt",
        [r"28 billion", r"4,600"],
    ),
    "ec_assistance": (
        "European Commission, EU assistance to Ukraine: EUR 3.8bn from the proceeds of Russian immobilised assets; EUR 19.8bn disbursed under the Ukraine Support Loan",
        "https://commission.europa.eu/topics/eu-solidarity-ukraine/eu-assistance-ukraine_en",
        "2026-10-27 (page read)",
        "official",
        "ec_assistance.txt",
        [r"immobilised assets", r"Ukraine Support Loan"],
    ),
    "ec_usl": (
        "European Commission (DG DEFIS), Ukraine Support Loan: final legislation adopted by the Council on 23 April 2026",
        "https://defence-industry-space.ec.europa.eu/eu-defence-industry/ukraine-support-loan_en",
        "2026-04-23",
        "official",
        "ec_usl.txt",
        [r"23 April 2026", r"90 billion"],
    ),
    "euroclear_h1_2026": (
        "Euroclear, H1 2026 results: balance sheet EUR 241bn, of which EUR 202bn sanctioned Russian assets (30 Jun 2026); interest EUR 2.3bn; about EUR 6.6bn windfall paid to date, next EUR 1.4bn due July 2026; Moscow judgment 15 May 2026, appeal rejected 16 Jul 2026",
        "https://www.euroclear.com/newsandinsights/en/press/2026/mr-20-euroclear-h1-2026-results.html",
        "2026-07-17",
        "official",
        "euroclear_h1_2026.txt",
        [r"€202 billion", r"windfall contribution", r"Moscow Court"],
    ),
    "euroclear_2025": (
        "Euroclear, 2025 results: EUR 195bn sanctioned Russian assets on the balance sheet (31 Dec 2025); interest EUR 5.0bn",
        "https://www.euroclear.com/newsandinsights/en/press/2026/mr-06-euroclear-delivers-strong-2025-results.html",
        "2026-02-04",
        "official",
        None,
        [],
    ),
    "euroclear_q1_2026_ifx": (
        "Interfax: Euroclear Q1 2026, EUR 200bn of EUR 237bn balance sheet related to sanctioned Russian assets; income EUR 1.1bn",
        "https://interfax.com/newsroom/top-stories/117483/",
        "2026-05-08",
        "press",
        "interfax_euroclear_q1_2026.txt",
        [r"200 billion|200 bln", r"237"],
    ),
    "euroclear_ceo_2025": (
        "Investfuture (Euroclear CEO, Oct 2025): EUR 193bn of Russian assets, of which EUR 180bn Bank of Russia (from private_frozen_r39.json)",
        "https://investfuture.ru/articles/euroclear-zamorazhivaet-193-milliarda-evro-rossiyskikh-aktivov-v-otvet-na-konflikt-1170151279",
        "2025-10",
        "press",
        None,
        [],
    ),
    "euronews_where": (
        "Euronews: Where are the Russian immobilised assets? Nobody except Belgium wants to say (France 22.8 per Le Maire; Luxembourg ministers 'below EUR 10,000'; Germany will not disclose; Japan does not disclose; OFSI GBP 28.7bn excludes sovereign assets; RCMP CAD 185m frozen, 473m blocked; REPO USD 5.06bn in the US; Switzerland CHF 7.45bn)",
        "https://www.euronews.com/my-europe/2025/11/06/where-are-the-russian-immobilised-assets-nobody-except-belgium-wants-to-say",
        "2025-11-06",
        "press",
        "euronews_2025-11-06_where.txt",
        [r"10,000", r"22\.8", r"does not disclose", r"185 million", r"5\.06"],
    ),
    "euronews_140": (
        "Euronews: Brussels pitches EUR 140bn loan to Ukraine based on Russia's frozen assets (EUR 210bn in the EU, about 185 at Euroclear; about 45 set aside for ERA)",
        "https://www.euronews.com/my-europe/2025/09/26/brussels-pitches-140-billion-loan-to-ukraine-based-on-russias-frozen-assets",
        "2025-09-26",
        "press",
        "euronews_2025-09-26_140bn.txt",
        [r"210 billion", r"185 billion", r"140 billion"],
    ),
    "eprs_2025": (
        "EPRS briefing BRI(2025)775908, Figure 1 (data PISM): Belgium 180, Japan 28.1, UK 26.6, France 19, Canada 15.1, Luxembourg 10, Switzerland 6.2, US 4.3, Germany 0.21 EUR bn (double counts Euroclear cash held in CAD and GBP)",
        "https://eprs.europarl.europa.eu/contents/publications/EPRS/2025/09/EPRS_BRI(2025)775908.html",
        "2025-09-10",
        "analysis",
        None,
        [],
    ),
    "verfassungsblog_2600": (
        "Verfassungsblog (Leichsenring, Popp): Regulation (EU) 2025/2600 of 12 December 2025, Russian state assets frozen de facto permanently under Art. 122(1) TFEU; 'up to EUR 210 billion'",
        "https://verfassungsblog.de/from-security-to-economics/",
        "2025-12-23",
        "analysis",
        "verfassungsblog_2025-12-23_reg2600.txt",
        [r"2025/2600 of 12 December", r"EUR 210 billion"],
    ),
    "reg_2025_2600": (
        "Council Regulation (EU) 2025/2600 of 12 December 2025 (Art. 122 TFEU): prohibition of transfers of immobilised Bank of Russia assets back to Russia, no six-monthly renewal",
        "https://eur-lex.europa.eu/eli/reg/2025/2600/oj/eng",
        "2025-12-12",
        "legal",
        None,
        [],
    ),
    "delors_2026": (
        "Institut Jacques Delors, Montoya: EU support to Ukraine in 2026, the saga of the reparations loan (EUR 140bn idea, Dec 2025 proposals incl. EUR 210bn reparations loan and Art. 122 regulation; 19 Dec 2025 agreement on EUR 90bn)",
        "https://institutdelors.eu/content/uploads/2026/02/PP320_EU_support_Ukraine_2026_Montoya_EN.pdf",
        "2026-02-10",
        "analysis",
        "delors_2026-02_reparations_loan.txt",
        [r"EUR 210 billion", r"EUR 90 billion", r"Article 122", r"reparations loan of EUR 140"],
    ),
    "euco_2025_12": (
        "European Council conclusions on Ukraine, 18 December 2025: loan of EUR 90bn for 2026-2027 based on EU borrowing backed by budget headroom; Ukraine repays only once reparations are received; assets stay immobilised and the Union reserves its right to use them to repay the loan; work on the Reparations Loan to continue; CZ, HU, SK unaffected (enhanced cooperation)",
        "https://www.consilium.europa.eu/en/meetings/european-council/2025/12/18/",
        "2025-12-18",
        "official",
        None,
        [],
    ),
    "kyivpost_euco_2025_12": (
        "Kyiv Post: EU Council ends uncertainty with EUR 90bn loan decision for Ukraine",
        "https://www.kyivpost.com/post/66567",
        "2025-12-19",
        "press",
        "kyivpost_2025-12-19_euco.txt",
        [r"90 billion", r"reparations", r"immobili[sz]ed"],
    ),
    "consilium_usl_2026_02": (
        "Council of the EU: Council agrees position on legal framework to provide EUR 90bn in financial support to Ukraine (Regulation (EU) 2026/467 followed in February 2026)",
        "https://www.consilium.europa.eu/en/press/press-releases/2026/02/04/council-agrees-position-on-legal-framework-to-provide-90-billion-in-financial-support-to-ukraine/",
        "2026-02-04",
        "official",
        None,
        [],
    ),
    "pgj_hungary_veto": (
        "Pipeline & Gas Journal (Reuters): Druzhba flows resume; Hungary lifts its veto on the EUR 90bn EU loan (22-23 Apr 2026)",
        "https://pgjonline.com/news/2026/april/druzhba-pipeline-oil-flows-resume-to-hungary-slovakia-after-outage",
        "2026-04-26",
        "press",
        "pgj_2026-04_hungary_veto.txt",
        [r"90 billion euro", r"veto"],
    ),
    "ec_usl_first": (
        "European Commission: first EUR 3.2bn instalment under the EUR 90bn Ukraine Support Loan (25 Jun 2026); EUR 3.9bn for drones (30 Jun 2026)",
        "https://enlargement.ec.europa.eu/news/commission-disburses-first-eur32-billion-instalment-ukraine-under-eur90-billion-ukraine-support-loan-2026-06-25_en",
        "2026-06-25",
        "official",
        "ec_usl_first_2026-06-25.txt",
        [r"3\.2 billion", r"90 billion"],
    ),
    "windfall_aug_2026": (
        "LB.ua / Commission: EU receives EUR 1.4bn of revenue from immobilised Russian assets (3 Aug 2026), about EUR 8bn in windfall profits in all",
        "https://en.lb.ua/news/2026/08/05/39430_eu_provide_ukraine_another_14.html",
        "2026-08-05",
        "press",
        "lbua_2026-08-05_windfall.txt",
        [r"1\.4 billion", r"8 billion", r"windfall"],
    ),
    "kallas_ep_answer": (
        "Answer by HR/VP Kallas for the Commission (E-001278/2025): 90% of the first two windfall tranches to the European Peace Facility, 10% to the Ukraine Facility; from the third tranche 95% to the Ukraine Loan Cooperation Mechanism, 5% EPF; first EUR 1.5bn received July 2024",
        "https://www.europarl.europa.eu/doceo/document/E-10-2025-001278-ASW_EN.html",
        "2025",
        "official",
        None,
        [],
    ),
    "reg_2024_1469": (
        "Council Regulation (EU) 2024/1469 and Decision (CFSP) 2024/1470 of 21 May 2024: financial contribution of CSDs' net profits on immobilised Bank of Russia balances (the 'windfall contribution')",
        "https://eur-lex.europa.eu/eli/reg/2024/1469/oj/eng",
        "2024-05-21",
        "legal",
        None,
        [],
    ),
    "reg_2024_2773": (
        "Regulation (EU) 2024/2773: Ukraine Loan Cooperation Mechanism and exceptional macro-financial assistance (EU share of the G7 ERA loans, up to EUR 18.1bn)",
        "https://eur-lex.europa.eu/eli/reg/2024/2773/oj/eng",
        "2024-10-24",
        "legal",
        None,
        [],
    ),
    "ec_era_first": (
        "European Commission: first EUR 3bn to Ukraine of its part of the G7 loan to be repaid from proceeds of immobilised Russian assets",
        "https://enlargement.ec.europa.eu/news/commission-disburses-first-eu3-billion-ukraine-its-part-g7-loan-be-repaid-proceeds-immobilised-2025-01-10_en",
        "2025-01-10",
        "official",
        "ec_era_first_2025-01-10.txt",
        [r"3 billion", r"18\.1 billion", r"G7"],
    ),
    "era_partners": (
        "Kyiv Post / CEE Legal Matters: G7 ERA lender shares (US USD 20bn, EU EUR 18.1bn, UK GBP 2.26bn, Canada CAD 5bn, Japan JPY 471.9bn)",
        "https://ceelegalmatters.com/ukraine/30497-avellum-and-sayenko-kharenko-advise-on-g7-era-loans-from-the-uk-canada-and-japan",
        "2025",
        "press",
        "ceelm_era_partners.txt",
        [r"2\.26", r"471\.9", r"CAD 5|5 billion"],
    ),
    "g7_apulia": (
        "G7 Apulia Leaders' Communique: about USD 50bn ERA loans serviced by the extraordinary revenues of immobilised Russian sovereign assets; assets stay immobilised until Russia pays for the damage",
        "https://www.consilium.europa.eu/media/a4jbq0cb/apulia-g7-leaders-communique.pdf",
        "2024-06-14",
        "official",
        None,
        [],
    ),
    "repo_280": (
        "US Treasury / DOJ readout, REPO deputies meeting: Russian sovereign assets immobilised in REPO jurisdictions estimated at around USD 280bn, the majority in the EU",
        "https://home.treasury.gov/news/press-releases/jy1716",
        "2023-09-07",
        "official",
        "treasury_jy1716_repo_280.txt",
        [r"280 billion", r"sovereign assets"],
    ),
    "repo_58": (
        "US Treasury, REPO joint statement: more than USD 58bn of sanctioned Russians' assets blocked or frozen; Bank of Russia and NWF assets remain immobilised",
        "https://home.treasury.gov/news/press-releases/jy1329",
        "2023-03-09",
        "official",
        "treasury_jy1329_repo_58.txt",
        [r"58 billion", r"Russian Central Bank"],
    ),
    "brookings_status": (
        "Brookings: What is the status of Russia's frozen sovereign assets? (REPO USD 280bn is the latest official estimate; experts and the Bank of Russia say USD 300-330bn)",
        "https://www.brookings.edu/articles/what-is-the-status-of-russias-frozen-sovereign-assets",
        "2025",
        "analysis",
        "brookings_status.txt",
        [r"280 billion", r"300", r"Euroclear"],
    ),
    "belgium_occrp_2025": (
        "OCCRP: Belgium blocked EUR 258bn: EUR 193bn transactions (Bank of Russia) and EUR 65bn assets, of which EUR 55bn securities through the sanctioned NSD and about EUR 10bn of sanctioned Russian banks (Belgian Treasury)",
        "https://occrp.org/en/scoop/belgium-blocked-270b-due-to-russian-sanctions-much-of-it-belongs-to-unsanctioned-russians",
        "2025-02-19",
        "press",
        None,
        [],
    ),
    "ec_18_9_2022": (
        "European Commission via European Sanctions / Belga: EUR 18.9bn frozen by member states at 16 Dec 2022 (BEL 3.5, LUX 2.5, ITA 2.3, DEU 2.2, IRL 1.8, AUT 1.8, FRA 1.3, ESP 1.0, other 2.5)",
        "https://www.europeansanctions.com/2023/01/eu-commission-says-18-9-billion-euros-of-russian-assets-frozen/",
        "2022-12-16",
        "press",
        None,
        [],
    ),
    "politico_68_2022": (
        "Politico via Ukrinform: EU froze EUR 68bn of Russian assets: Belgium 50, Luxembourg 5.5; Bank of Russia reserves listed separately (Nov 2022)",
        "https://ukrinform.net/rubric-economy/3617160-eu-freezes-eur-68b-in-russian-assets-politico.html",
        "2022-11",
        "press",
        None,
        [],
    ),
    "fra_lemaire_2022": (
        "Euronews (fr): France froze EUR 22.8bn of Bank of Russia assets (Le Maire)",
        "https://fr.euronews.com/2022/03/20/la-france-a-gele-plus-de-22-milliards-d-euros-d-actifs-de-la-banque-de-russie",
        "2022-03-20",
        "press",
        None,
        [],
    ),
    "fra_tresor_2022": (
        "Ukrinform (CNN): France froze EUR 23.7bn, of which EUR 22.8bn central bank",
        "https://ukrinform.net/rubric-polytics/3456151-france-freezes-over-25b-worth-of-russian-assets.html",
        "2022-04",
        "press",
        None,
        [],
    ),
    "fra_lcp_2026": (
        "LCP (French National Assembly channel): about EUR 19bn of Bank of Russia assets in France out of about EUR 210bn in Europe; nearly EUR 1bn of oligarchs' jewels, financial assets, yachts and villas frozen in France",
        "https://lcp.fr/actualites/avoirs-russes-geles-la-france-peut-elle-vraiment-saisir-l-argent-de-moscou-436040",
        "2026-05-06",
        "press",
        "lcp_2026-05-06_france.txt",
        [r"19 milliards", r"milliard d'euros de bijoux"],
    ),
    "lux_paperjam_2022": (
        "Paperjam: Russian assets worth EUR 5.5bn blocked in Luxembourg (finance ministry; Commission list 2.5)",
        "https://en.paperjam.lu/article/russian-assets-worth-5-5bn-blo",
        "2022-12",
        "press",
        None,
        [],
    ),
    "deu_dpa_2025": (
        "dpa (Dec 2025, via frozen_assets.json): Berlin told EU partners only a 'small three-digit million amount' of Bank of Russia assets is held in Germany",
        "https://www.zdfheute.de/politik/ausland/russland-vermoegen-eingefroren-eu-ukraine-krieg-100.html",
        "2025-12",
        "press",
        None,
        [],
    ),
    "deu_welt_2025": (
        "Mind.ua (Welt am Sonntag): Germany has frozen Russian assets worth over EUR 5.3bn",
        "https://mind.ua/en/news/20253639-germany-has-frozen-russian-assets-worth-more-than-5-3-billion-euros",
        "2025",
        "press",
        None,
        [],
    ),
    "ita_gdf": (
        "Quotidiano (ANSA): UIF annual report, yachts, villas and Russian funds frozen for about EUR 2bn (Guardia di Finanza: 28 oligarchs, EUR 1.94bn)",
        "https://www.quotidiano.net/ultimaora/uif-congelati-yacht-ville-e-fondi-russi-per-2-miliardi-f5561ae7",
        "2023-07-04",
        "press",
        "quotidiano_italy_2bn.txt",
        [r"miliard", r"oligarch"],
    ),
    "irl_oireachtas_2024": (
        "Dail Eireann written answer: over EUR 1.9bn frozen by Irish financial institutions",
        "https://www.oireachtas.ie/ga/debates/question/2024-03-07/63/",
        "2024-03-07",
        "official",
        None,
        [],
    ),
    "aut_dsn": (
        "Vienna.at (APA; DSN/OeNB): frozen Russian assets in Austria fell from about EUR 2bn to 1.5bn",
        "https://www.vienna.at/eingefrorenes-russisches-vermogen-in-osterreich-gesunken/8579134",
        "2024",
        "press",
        None,
        [],
    ),
    "nld_2024": (
        "DutchNews (letter to parliament): frozen Russian assets in the Netherlands down to just under EUR 100m after EUR 560m was released",
        "https://dutchnews.nl/2024/10/frozen-russian-assets-have-melted-to-just-under-e100-million",
        "2024-10",
        "press",
        None,
        [],
    ),
    "cyp_2025": (
        "CBN / AP: Cyprus frozen assets EUR 1.5bn (2023), 1.3bn (Jan 2025), 1.2bn (Oct 2025)",
        "https://www.cbn.com.cy/article/120678",
        "2025-10",
        "press",
        None,
        [],
    ),
    "esp_reynders_2022": (
        "The Objective: Reynders: Spain froze EUR 41m (Sep 2022), against EUR 1.0bn in the Commission's Dec 2022 list",
        "https://theobjective.com/espana/2022-09-30/reynders-espana-oligarcas-rusia/",
        "2022-09-30",
        "press",
        None,
        [],
    ),
    "swe_police_2025": (
        "Global Sanctions: Swedish Police report on compliance with EU Russia sanctions: EUR 43m frozen under Regulation 269/2014 (Feb 2022-Sep 2024)",
        "https://globalsanctions.com/2025/11/sweden-publishes-report-on-compliance-with-russia",
        "2025-11",
        "press",
        "globalsanctions_2025-11_sweden.txt",
        [r"43 million|€43|EUR 43", r"269/2014"],
    ),
    "fin_yle_2023": (
        "Novaya Gazeta Europe (Yle, Foreign Ministry): Finland froze about EUR 187m of Russian assets",
        "https://novayagazeta.eu/en/articles/2023/01/22/finland-freezes-eur187-million-worth-of-russian-assets-en-news",
        "2023-01-22",
        "press",
        "novayagazeta_2023-01-22_finland.txt",
        [r"187 million"],
    ),
    "lva_fiu_2026": (
        "Global Sanctions: Latvian FIU 2025 annual report on sanctions: about EUR 153m frozen",
        "https://globalsanctions.com/2026/06/latvian-financial-intelligence-unit-publishes-2025-annual-report-on-sanctions/",
        "2026-06",
        "press",
        "globalsanctions_2026-06_latvia.txt",
        [r"153", r"frozen"],
    ),
    "est_err": (
        "ERR News: tens of millions worth of frozen Russian assets in Estonia (bank accounts about EUR 11.7m, tax-board prepayment accounts about EUR 8.4m)",
        "https://news.err.ee/1608797566/tens-of-millions-worth-of-frozen-russian-assets-in-estonia",
        "2022-11 (approx.)",
        "press",
        "err_estonia.txt",
        [r"11\.7", r"8\.4"],
    ),
    "ltu_2023": (
        "Eurointegration: Lithuania froze EUR 103m of sanctioned Russian and Belarusian assets",
        "https://www.eurointegration.com.ua/rus/news/2023/08/8/7167221/",
        "2023-08-08",
        "press",
        "eurointegration_2023-08_lithuania.txt",
        [r"103"],
    ),
    "pol_forsal_2022": (
        "Forsal: deputy finance minister: Poland has frozen PLN 160m of Russian assets",
        "https://forsal.pl/finanse/aktualnosci/artykuly/8386492,wiceminister-finansow-zamrozilismy-dotychczas-160-mln-zl-aktywow-rosyjskich-w-polsce.html",
        "2022-03",
        "press",
        "forsal_2022-03_poland.txt",
        [r"160 mln"],
    ),
    "cze_echo24": (
        "Echo24 (Finance Ministry / FAU): Czechia froze Russian assets worth up to about CZK 10bn at the peak",
        "https://www.echo24.cz/a/H5a5d/zpravy-domov-sankce-rusko-zmrazeni-majetek",
        "2023",
        "press",
        "echo24_czechia.txt",
        [r"10 miliard"],
    ),
    "ofsi_2024_25": (
        "OFSI Annual Review 2024-25: GBP 28.7bn of assets reported frozen under the Russia regime by May 2025 (GBP 22.5bn in the 2024 frozen-asset review)",
        "https://assets.publishing.service.gov.uk/media/68ef7ec68427701993d5e0d9/OFSI_Annual_Review_2024-25.pdf",
        "2025-10",
        "official",
        None,
        [],
    ),
    "gov_uk_25bn": (
        "GOV.UK (HM Treasury): UK sanctions freeze GBP 25bn of Russian assets",
        "https://www.gov.uk/government/news/uk-sanctions-freeze-25bn-of-russian-assets",
        "2025-03-21",
        "official",
        "govuk_2025-03-21_25bn.txt",
        [r"£25 billion"],
    ),
    "uk_8bn_times": (
        "Novaya Gazeta Europe (The Times): UK announces plan to unlock billions in frozen Russian assets (about GBP 8bn of Russian sovereign assets in UK banks)",
        "https://novayagazeta.eu/en/articles/2025/12/05/uk-announces-plan-to-unlock-billions-in-frozen-russian-assets-to-aid-ukraine-en-news",
        "2025-12-05",
        "press",
        "novayagazeta_2025-12-05_uk8bn.txt",
        [r"8 billion|£8|8bn"],
    ),
    "uk_8bn_ft": (
        "Ukranews (Financial Times): British banks oppose using about GBP 8bn of frozen Russian sovereign assets",
        "https://ukranews.com/en/news/1122350-british-banks-oppose-idea-of-using-frozen-russian-sovereign-assets-ft",
        "2025-12-11",
        "press",
        "ukranews_2025-12-11_uk8bn_ft.txt",
        [r"8 billion|£8"],
    ),
    "seco_2025": (
        "Bluewin (SECO): CHF 7.4bn of private assets frozen plus CHF 7.45bn of Bank of Russia reserves (1 Apr 2025)",
        "https://www.bluewin.ch/en/news/switzerland-freezes-russian-assets-worth-15-billion-2633158.html",
        "2025-04-01",
        "press",
        "bluewin_2025-04_seco.txt",
        [r"7\.4", r"7\.45"],
    ),
    "seco_2026_iz": (
        "Izvestia (SECO spokesman Fabian Mayenfisch): CHF 8.5bn of financial assets frozen at 1 Jun 2026; Bank of Russia assets CHF 6.8bn in June 2026",
        "https://iz.ru/en/node/2149609",
        "2026-08-15",
        "press",
        "izvestia_2026-08-15_seco.txt",
        [r"8\.5 billion", r"6\.8 billion"],
    ),
    "jpn_nikkei_2022": (
        "Nippon.com (Reuters, Nikkei): Bank of Japan held about JPY 4-5 trillion of Russia's reserves in 2021",
        "https://www.nippon.com/en/news/reu20220301KBN2KX1YY/",
        "2022-03-01",
        "press",
        "nippon_2022-03-01_japan.txt",
        [r"trillion yen|trillion"],
    ),
    "aus_dfat": (
        "DFAT via frozen_assets.json: under AUD 100m of Russian assets held in Australia",
        "https://www.dfat.gov.au/international-relations/security/sanctions",
        "2024",
        "official",
        None,
        [],
    ),
    "cbr_lawsuit_2026": (
        "Gherson: the Central Bank of Russia sues the EU in the General Court over the indefinite freeze (Regulation 2025/2600)",
        "https://www.gherson.com/blog/central-bank-sues-eu-in-luxembourg-over-frozen-assets/",
        "2026-03",
        "press",
        "gherson_2026_cbr_lawsuit.txt",
        [r"General Court", r"Central Bank"],
    ),
    "euronews_2026_10_16": (
        "Euronews: Budget, Ukraine, migration: five takeaways from the EU leaders' summit (immobilised assets 'remain politically divisive')",
        "https://www.euronews.com/2026/10/16/budget-ukraine-migration-five-takeaways-from-the-eu-leaders-summit",
        "2026-10-16",
        "press",
        None,
        [],
    ),
    "forbes_2026_10": (
        "Forbes (Temnycky): EU states revive push to use frozen Russian assets for Ukraine (Sweden, Netherlands, Poland, Spain letter; ECB warning)",
        "https://www.forbes.com/sites/marktemnycky/2026/10/01/eu-states-revive-push-to-use-frozen-russian-assets-for-ukraine/",
        "2026-10-01",
        "press",
        None,
        [],
    ),
    "belga_tax": (
        "Belga: frozen Russian assets at Euroclear earn Belgium EUR 1.7bn in tax revenue (pledged to Ukraine)",
        "https://www.belganewsagency.eu/frozen-russian-assets-at-euroclear-earn-belgium-17-billion-euros-in-tax-revenue",
        "2025",
        "press",
        None,
        [],
    ),
    "frozen_assets_json": (
        "This project, research/2026-10/gaps/frozen_assets.json and -notes.md (round 7): reserves by holder, double counts in the EPRS split",
        "research/2026-10/gaps/frozen_assets-notes.md",
        "2026-10-18",
        "project",
        None,
        [],
    ),
    "private_r39_json": (
        "This project, research/2026-10/gaps/private_frozen_r39.json and -notes.md (round 39): private assets by holder",
        "research/2026-10/gaps/private_frozen_r39-notes.md",
        "2026-10-23",
        "project",
        None,
        [],
    ),
}

# Sources whose figures were read through a browser-type fetch or a search summary because the site refuses curl; the
# JSON marks them "read": "summary". Everything with an extract that holds the figure is "read": "extract"; the rest
# (cited from rounds 7 and 39, or legal acts) are "read": "earlier round" or "not fetched".
READ_SUMMARY = {
    "euronews_where",
    "euronews_140",
    "euco_2025_12",
    "consilium_usl_2026_02",
    "ec_usl_first",
    "kallas_ep_answer",
    "seco_2026_iz",
    "euronews_2026_10_16",
    "forbes_2026_10",
    "repo_280",
    "era_partners",
    "uk_8bn_ft",
    "uk_8bn_times",
    "lva_fiu_2026",
    "swe_police_2025",
    "fin_yle_2023",
    "est_err",
    "ltu_2023",
    "cze_echo24",
    "pol_forsal_2022",
    "ita_gdf",
    "fra_lcp_2026",
    "windfall_aug_2026",
    "cbr_lawsuit_2026",
    "euroclear_q1_2026_ifx",
}
EARLIER_ROUND = {
    "euroclear_2025",
    "euroclear_ceo_2025",
    "eprs_2025",
    "belgium_occrp_2025",
    "ec_18_9_2022",
    "politico_68_2022",
    "fra_lemaire_2022",
    "fra_tresor_2022",
    "lux_paperjam_2022",
    "deu_dpa_2025",
    "deu_welt_2025",
    "irl_oireachtas_2024",
    "aut_dsn",
    "nld_2024",
    "cyp_2025",
    "esp_reynders_2022",
    "ofsi_2024_25",
    "aus_dfat",
    "belga_tax",
}


def text_of(path: Path) -> str:
    raw = path.read_bytes()
    if raw[:5] == b"%PDF-":
        r = subprocess.run(["pdftotext", "-q", str(path), "-"], check=False, capture_output=True)
        s = r.stdout.decode("utf-8", errors="replace")
    else:
        s = raw.decode("utf-8", errors="replace")
        s = re.sub(r"(?is)<(script|style|noscript)[^>]*>.*?</\1>", " ", s)
        s = html.unescape(re.sub(r"(?s)<[^>]+>", " ", s))
    return re.sub(r"\s+", " ", s)


def extract(s: str, patterns: list[str], width: int = 600) -> list[str]:
    out = []
    for p in patterns:
        for m in list(re.finditer(p, s))[:2]:
            out.append(s[max(0, m.start() - width // 3) : m.end() + width].strip())
    return out


def fetch() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    today = datetime.datetime.now(tz=datetime.UTC).date().isoformat()
    with tempfile.TemporaryDirectory() as tmp:
        for sid, (_name, url, _date, _kind, fname, pats) in S.items():
            if not fname:
                continue
            if sid == "euroclear_h1_2026" and EUROCLEAR_SAVED.exists():
                body = extract(text_of(EUROCLEAR_SAVED), pats, 900)
                head = (
                    f"URL: {url}\nFetched: 2026-10-23 (copy in research/2026-10/raw/euroclear/; the site now returns 403)"
                    f"\nExtract made: {today}\nHTTP: 200\nExtract (short passages around the figures used):\n\n"
                )
                (RAW / fname).write_text(head + "\n\n---\n\n".join(body) + "\n")
                print(fname, "saved copy", len(body))
                continue
            dl = Path(tmp) / "doc"
            dl.unlink(missing_ok=True)
            r = subprocess.run(
                ["curl", "-sSL", "--max-time", "60", "-A", "Mozilla/5.0", "-o", str(dl), "-w", "%{http_code}", url],
                check=False,
                capture_output=True,
                text=True,
            )
            code = r.stdout.strip()
            body = extract(text_of(dl), pats) if code == "200" and dl.exists() else []
            note = (
                ""
                if body
                else "\n(no extract: the site refused the download or the page did not hold the figure; read via a browser-type fetch or a search summary, see the JSON)"
            )
            head = f"URL: {url}\nFetched: {today}\nHTTP: {code}{note}\nExtract (short passages around the figures used):\n\n"
            (RAW / fname).write_text(head + "\n\n---\n\n".join(body) + "\n")
            print(fname, code, len(body))


# ------------------------------------------------------------------------------------------- exchange rates (EUR per unit)
# Approximate ECB reference rates around the date of each figure, rounded; only used to show a EUR value next to the
# figure in its own currency. 2026 rates: USD from the Reuters conversion in the April 2026 extract (USD 1 = EUR 0.8543);
# CHF about 0.93 per euro in mid-2026 (assumption, close to 2025 levels)
FX = {
    ("GBP", "2025-03"): 1.19,
    ("GBP", "2025-05"): 1.18,
    ("GBP", "2025-12"): 1.14,
    ("CHF", "2025-04"): 1.06,
    ("CHF", "2026-06"): 1.07,
    ("USD", "2023-03"): 0.93,
    ("USD", "2023-09"): 0.93,
    ("USD", "2026-04"): 0.8543,
    ("CAD", "2025-11"): 0.616,
    ("AUD", "2024"): 0.61,
    ("JPY", "2021"): 1 / 130,
    ("CZK", "2023"): 1 / 24,
    ("PLN", "2022-03"): 1 / 4.65,
}


def eur(amount: float, cur: str, when: str) -> float:
    return round(amount * FX[(cur, when)], 3)


# --------------------------------------------------------------------------------------------------- per country
# Each entry: v = the figure shown (latest official where one exists), lo/hi = the range across sources, date = the date
# of v, src = source ids (first = the one for v), official = whether v is a government/EU/central-bank/company figure,
# basis = how v and the range were set. v None = no public figure; then est (if any) is an outside estimate, shown only
# as such.
def F(v, lo, hi, date, src, official, basis, **kw):
    d = {"v": v, "lo": lo, "hi": hi, "date": date, "src": src, "official": official, "basis": basis}
    d.update(kw)
    return d


NONE_CBR = F(None, None, None, None, [], False, "No public figure found.")
NONE_PRIV = F(None, None, None, None, [], False, "No public figure found.")

GBP_287 = eur(28.7, "GBP", "2025-05")
GBP_225 = eur(22.5, "GBP", "2025-05")
UK_CBR = eur(8.0, "GBP", "2025-12")
CHF_CBR_26 = eur(6.8, "CHF", "2026-06")
CHF_CBR_25 = eur(7.45, "CHF", "2025-04")
CHF_PRIV_26 = eur(8.5, "CHF", "2026-06")
CHF_PRIV_25 = eur(7.4, "CHF", "2025-04")
US_CBR = eur(5.06, "USD", "2023-09")
CAN_FROZEN = eur(0.185, "CAD", "2025-11")
CAN_BLOCKED = eur(0.473, "CAD", "2025-11")

COUNTRIES = {
    "BEL": {
        "name": "Belgium (Euroclear Bank, Brussels)",
        "cbr_eur": F(
            185,
            180,
            190,
            "2025-12",
            ["euronews_140", "verfassungsblog_2600", "euroclear_ceo_2025", "eprs_2025", "euroclear_h1_2026"],
            True,
            "Commission figure used for the reparations-loan and Art. 122 texts: about EUR 185bn of the EUR 210bn of Bank of Russia assets in the EU sit at Euroclear. Euroclear's CEO gave 180 of 193 (Oct 2025); EPRS/PISM 180. The value at the freeze (Feb 2022) is not published.",
            company_figure={
                "what": "Euroclear Bank's balance sheet: sanctioned Russian assets (cash, Bank of Russia plus private), EUR bn",
                "series": {
                    "2022-09": 86,
                    "2024-12": 183,
                    "2025-09": 193,
                    "2025-12": 195,
                    "2026-03": 200,
                    "2026-06": 202,
                },
                "src": ["euroclear_h1_2026", "euroclear_2025", "euroclear_q1_2026_ifx", "frozen_assets_json"],
                "note": "This is the sanctioned cash on Euroclear's balance sheet, rising as frozen bonds mature into cash. It is the figure behind headlines like 'Euroclear passes EUR 200bn'. It includes private sanctioned cash (about EUR 13bn) and is not the same as the Bank of Russia's position.",
            },
        ),
        "private_eur": F(
            10,
            3.5,
            12,
            "2025-02",
            ["belgium_occrp_2025", "ec_18_9_2022", "politico_68_2022"],
            True,
            "Belgian Treasury (via OCCRP, Feb 2025): EUR 65bn of frozen assets beside EUR 193bn of blocked Bank of Russia transactions; of the 65, about EUR 10bn belongs to sanctioned Russian banks and EUR 55bn are securities that passed through the sanctioned depository NSD (mostly owned by unsanctioned Russian investors). Belgium reported EUR 3.5bn of sanctioned persons' assets to the Commission (Dec 2022), the most of any member then.",
            nsd_blocked_securities={
                "v": 55,
                "date": "2025-02",
                "src": ["belgium_occrp_2025"],
                "note": "Russian investors' securities blocked at Euroclear because the NSD is sanctioned. Not sanctioned persons' assets in the usual sense; shown separately.",
            },
        ),
        "notes": "Belgium hosts most of the world's immobilised Russian reserves because Euroclear is the main international depository for the bonds central banks hold. The freeze is an EU decision; Euroclear only holds the assets. Euroclear's cash in Canadian dollars, sterling and Australian dollars (about 8%, 17% and 2%) sits with banks abroad but is Euroclear's, i.e. Belgium's, not Canada's, the UK's or Australia's.",
    },
    "FRA": {
        "name": "France",
        "cbr_eur": F(
            22.8,
            18,
            22.8,
            "2022-03-20",
            ["fra_lemaire_2022", "fra_lcp_2026", "eprs_2025", "euronews_where"],
            True,
            "The only official figure: finance minister Le Maire, EUR 22.8bn of Bank of Russia assets immobilised (March 2022). The government has declined to update it (Euronews, Nov 2025). Later estimates: 19 (EPRS/PISM 2025; LCP, May 2026), about 18 (press). Held by commercial banks.",
        ),
        "private_eur": F(
            1.0,
            0.9,
            1.3,
            "2026-05-06",
            ["fra_lcp_2026", "ec_18_9_2022", "fra_tresor_2022"],
            False,
            "LCP (May 2026): 'nearly EUR 1bn' of oligarchs' assets frozen in France (no official source named). Commission list, Dec 2022: EUR 1.3bn (mostly property); the Treasury's 2022 total of 23.7 less the 22.8 central-bank figure gives 0.9. No recent Treasury figure found.",
        ),
        "notes": "France is the second holder of Bank of Russia assets in the EU, in commercial banks it has not named.",
    },
    "LUX": {
        "name": "Luxembourg (Clearstream Banking SA and banks)",
        "cbr_eur": F(
            0.0,
            0.0,
            10,
            "2025-11",
            ["euronews_where", "eprs_2025"],
            True,
            "Finance and foreign ministers (joint statement, Nov 2025): 'below EUR 10,000' of Bank of Russia assets immobilised in Luxembourg. EPRS used EUR 10bn as a 'conservative' figure from estimates of several billion to about 20bn. The two cannot both be right; the official figure is shown, the EPRS number as the top of the range. Round 7 used 2 (0-10).",
        ),
        "private_eur": F(
            5.5,
            2.5,
            5.5,
            "2022-12",
            ["lux_paperjam_2022", "ec_18_9_2022", "politico_68_2022"],
            True,
            "Finance ministry: EUR 5.5bn blocked (Dec 2022); the Commission's list gave 2.5 at the same time. No later figure. Russian investors' securities blocked at Clearstream through the NSD are not published (round 39 guessed 3-16bn).",
        ),
        "notes": "Clearstream publishes no figure for Russian sovereign or NSD-blocked assets.",
    },
    "DEU": {
        "name": "Germany",
        "cbr_eur": F(
            None,
            0.1,
            0.5,
            None,
            ["euronews_where", "deu_dpa_2025", "eprs_2025"],
            False,
            "No official figure: the government says it cannot disclose the volume or location of Bank of Russia assets (Euronews, Nov 2025). Berlin told EU partners a 'small three-digit million amount' (dpa, Dec 2025); EPRS/PISM 0.21. Bank of Russia reserves 'in Germany' in its 2021 report (15.7%) are German bonds by issuer, mostly held at Euroclear.",
            est=0.21,
        ),
        "private_eur": F(
            5.3,
            2.2,
            5.3,
            "2025",
            ["deu_welt_2025", "ec_18_9_2022"],
            False,
            "Welt am Sonntag (2025, via mind.ua): over EUR 5.3bn frozen in Germany in all (may include the small central-bank amount). Commission list Dec 2022: 2.2. No Bundesbank or BMF publication found.",
        ),
        "notes": "",
    },
    "ITA": {
        "name": "Italy",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            2.0,
            1.8,
            2.3,
            "2023-07-04",
            ["ita_gdf", "ec_18_9_2022"],
            True,
            "UIF annual report and Guardia di Finanza: about EUR 2bn (1.94bn) of yachts, villas, land and company stakes of 28 oligarchs; Commission list Dec 2022: 2.3. No later figure found.",
        ),
        "notes": "",
    },
    "IRL": {
        "name": "Ireland",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            1.9,
            1.8,
            1.9,
            "2024-03-07",
            ["irl_oireachtas_2024", "ec_18_9_2022"],
            True,
            "Dail written answer: over EUR 1.9bn frozen by Irish financial institutions; Commission list Dec 2022: 1.8.",
        ),
        "notes": "",
    },
    "AUT": {
        "name": "Austria",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            1.5,
            1.5,
            2.0,
            "2024",
            ["aut_dsn", "ec_18_9_2022"],
            True,
            "DSN/OeNB via APA: down from about EUR 2bn (end-2022) to 1.5bn; Commission list Dec 2022: 1.8.",
        ),
        "notes": "",
    },
    "CYP": {
        "name": "Cyprus",
        "cbr_eur": F(
            None,
            None,
            None,
            None,
            ["euronews_140"],
            False,
            "Named in press reports among the EU states holding part of the EUR 25bn of Bank of Russia assets outside Euroclear; no figure.",
        ),
        "private_eur": F(
            1.2,
            1.2,
            1.5,
            "2025-10",
            ["cyp_2025"],
            True,
            "1.5 (2023), 1.3 (Jan 2025: investment firms 0.9, service providers 0.3), 1.2 (Oct 2025).",
        ),
        "notes": "",
    },
    "ESP": {
        "name": "Spain",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            1.0,
            0.04,
            1.0,
            "2022-12-16",
            ["ec_18_9_2022", "esp_reynders_2022"],
            True,
            "Commission list Dec 2022: 1.0; Commissioner Reynders had said EUR 41m (Sep 2022). The two do not reconcile; no later figure.",
        ),
        "notes": "",
    },
    "NLD": {
        "name": "Netherlands",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            0.1,
            0.1,
            0.66,
            "2024-10",
            ["nld_2024"],
            True,
            "Letter to parliament: just under EUR 100m after EUR 560m was released (peak about 660m).",
        ),
        "notes": "",
    },
    "SWE": {
        "name": "Sweden",
        "cbr_eur": F(
            None,
            None,
            None,
            None,
            ["euronews_140"],
            False,
            "Named in press reports (with France, Germany, Cyprus) among the EU holders outside Euroclear; no figure.",
        ),
        "private_eur": F(
            0.043,
            0.043,
            0.043,
            "2024-09",
            ["swe_police_2025"],
            True,
            "Swedish Police report: EUR 43m frozen under Regulation 269/2014 from Feb 2022 to Sep 2024, almost 90% linked to sanctioned persons.",
        ),
        "notes": "",
    },
    "FIN": {
        "name": "Finland",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            0.187,
            0.187,
            0.19,
            "2023-01",
            ["fin_yle_2023"],
            True,
            "Foreign Ministry via Yle: about EUR 187m (property, shares, vehicles, boats). A press claim of 'over EUR 4bn of Russian state assets' frozen in Finland in a Naftogaz enforcement case is unverified and not a sanctions figure; not used.",
        ),
        "notes": "",
    },
    "EST": {
        "name": "Estonia",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            0.02,
            0.02,
            0.03,
            "2022-11 (approx.)",
            ["est_err"],
            True,
            "ERR: about EUR 11.7m in bank accounts plus 8.4m in tax-board prepayment accounts; officials say exact values are hard to calculate.",
        ),
        "notes": "",
    },
    "LVA": {
        "name": "Latvia",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            0.153,
            0.153,
            0.153,
            "2025-12",
            ["lva_fiu_2026"],
            True,
            "Latvian FIU 2025 annual report (June 2026): about EUR 153m frozen; 156 persons and entities.",
        ),
        "notes": "",
    },
    "LTU": {
        "name": "Lithuania",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            0.103,
            0.087,
            0.103,
            "2023-08",
            ["ltu_2023"],
            True,
            "More than EUR 103m frozen under Russia and Belarus sanctions (Aug 2023); 87m in late 2022.",
        ),
        "notes": "Includes Belarus-related assets.",
    },
    "POL": {
        "name": "Poland",
        "cbr_eur": NONE_CBR,
        "private_eur": F(
            eur(0.160, "PLN", "2022-03"),
            eur(0.140, "PLN", "2022-03"),
            eur(0.160, "PLN", "2022-03"),
            "2022-03",
            ["pol_forsal_2022"],
            True,
            "Deputy finance minister: PLN 160m frozen (March 2022). No later total found (Gazprom's Yamal stake frozen separately, no value).",
        ),
        "notes": "Old figure.",
    },
    "CZE": {
        "name": "Czechia",
        "cbr_eur": F(
            None,
            None,
            None,
            None,
            [],
            False,
            "Government decided in Nov 2023 to freeze all Russian state assets; no amount published.",
        ),
        "private_eur": F(
            0.35,
            0.04,
            eur(10, "CZK", "2023"),
            "2023",
            ["cze_echo24"],
            True,
            "Finance ministry/FAU: up to about CZK 10bn at the peak (about EUR 0.4bn); 2023 press figures EUR 0.35-0.42bn; CZK 1bn in 2022.",
        ),
        "notes": "",
    },
    "GBR": {
        "name": "United Kingdom",
        "cbr_eur": F(
            None,
            UK_CBR,
            26.6,
            None,
            ["uk_8bn_times", "uk_8bn_ft", "eprs_2025", "euronews_where"],
            False,
            "No official figure: the government declines to give one. The Times (5 Dec 2025) and the FT (11 Dec 2025) report about GBP 8bn of Russian sovereign assets in UK banks (about EUR 9bn). EPRS/PISM's EUR 26.6bn probably counts Euroclear's sterling cash, which is Belgium's.",
            est=UK_CBR,
        ),
        "private_eur": F(
            GBP_287,
            GBP_225,
            GBP_287,
            "2025-05",
            ["ofsi_2024_25", "gov_uk_25bn"],
            True,
            "OFSI Annual Review 2024-25: GBP 28.7bn reported frozen under the Russia regime by May 2025 (GBP 22.5bn in the 2024 frozen-asset review; 'over GBP 25bn', HM Treasury, March 2025). Values as reported at designation; excludes sovereign assets (Euronews).",
            native={"GBP_bn": 28.7},
        ),
        "notes": "OFSI's figure is the largest national private figure published anywhere. No 2025-26 review was found by 27 Oct 2026.",
    },
    "CHE": {
        "name": "Switzerland",
        "cbr_eur": F(
            CHF_CBR_26,
            CHF_CBR_26,
            CHF_CBR_25,
            "2026-06",
            ["seco_2026_iz", "seco_2025"],
            True,
            "SECO: CHF 6.8bn in June 2026 (spokesman via Izvestia); CHF 7.45bn at 1 Apr 2025. Held in commercial banks.",
            native={"CHF_bn": 6.8},
        ),
        "private_eur": F(
            CHF_PRIV_26,
            CHF_PRIV_25,
            CHF_PRIV_26,
            "2026-06-01",
            ["seco_2026_iz", "seco_2025"],
            True,
            "SECO: CHF 8.5bn of financial assets frozen at 1 Jun 2026; CHF 7.4bn at 1 Apr 2025 (plus 14 properties, cars, aircraft, art).",
            native={"CHF_bn": 8.5},
        ),
        "notes": "The only country that publishes both figures regularly, and keeps them apart.",
    },
    "USA": {
        "name": "United States",
        "cbr_eur": F(
            US_CBR,
            4.3,
            US_CBR,
            "2023-09",
            ["euronews_where", "repo_280"],
            True,
            "REPO task force via Axios (Sep 2023): USD 5.06bn of Russian sovereign assets in the US financial system; Treasury did not answer Euronews in 2025.",
            native={"USD_bn": 5.06},
        ),
        "private_eur": F(
            None,
            None,
            None,
            None,
            ["repo_58"],
            False,
            "No US figure published. REPO's 'more than USD 58bn' (March 2023) covers all members together.",
        ),
        "notes": "",
    },
    "JPN": {
        "name": "Japan",
        "cbr_eur": F(
            None,
            20,
            40,
            None,
            ["euronews_where", "eprs_2025", "jpn_nikkei_2022"],
            False,
            "Not disclosed: 'The Government of Japan does not disclose the information regarding the details of Russia's sovereign assets.' Estimates: EUR 25-30bn (press), 28.1 (EPRS/PISM); Nikkei: JPY 4-5tn at the Bank of Japan in 2021 (about EUR 31-38bn then). Belgium's PM said 50; outside the range.",
            est=28,
        ),
        "private_eur": NONE_PRIV,
        "notes": "Probably the second-largest holder of Bank of Russia assets, but there is no official figure.",
    },
    "CAN": {
        "name": "Canada",
        "cbr_eur": F(
            None,
            None,
            None,
            None,
            ["euronews_where", "frozen_assets_json"],
            False,
            "No official figure. The CAD 22bn often quoted is Euroclear's cash in Canadian dollars (Belgium's), not Canada's own freeze; EPRS's EUR 15.1bn repeats it.",
        ),
        "private_eur": F(
            CAN_FROZEN,
            CAN_FROZEN,
            round(CAN_FROZEN + CAN_BLOCKED, 3),
            "2025-11",
            ["euronews_where"],
            True,
            "RCMP: CAD 185m 'effectively' frozen and CAD 473m of transactions blocked (not split between the central bank and private owners).",
            native={"CAD_bn": 0.185},
        ),
        "notes": "",
    },
    "AUS": {
        "name": "Australia",
        "cbr_eur": F(
            None,
            None,
            None,
            None,
            ["frozen_assets_json"],
            False,
            "No official figure. The 'AUD 7bn' sometimes quoted is Euroclear's Australian-dollar cash (Belgium's).",
        ),
        "private_eur": F(
            None,
            0.0,
            eur(0.1, "AUD", "2024"),
            None,
            ["aus_dfat"],
            True,
            "DFAT: under AUD 100m of Russian assets in Australia (all owners); shown as a ceiling only.",
        ),
        "notes": "",
    },
}

NO_FIGURE = {
    "what": "Countries with Russia sanctions in force for which no public amount was found (central bank or private)",
    "list": [
        "DNK",
        "NOR",
        "PRT",
        "GRC",
        "HRV",
        "SVN",
        "SVK",
        "HUN",
        "ROU",
        "BGR",
        "MLT",
        "SGP",
        "KOR",
        "NZL",
        "ISL",
        "LIE",
    ],
    "note": "Absence of a figure is not evidence of zero. Singapore and South Korea banned transactions with the Bank of Russia in March 2022 but published no amount. Liechtenstein, Iceland and Norway apply EU-type sanctions; no amounts found in this round.",
}


def sum_v(key: str, isos: list[str]) -> float:
    return round(sum((COUNTRIES[i][key]["v"] or COUNTRIES[i][key].get("est") or 0) for i in isos), 1)


EU = [
    "BEL",
    "FRA",
    "LUX",
    "DEU",
    "ITA",
    "IRL",
    "AUT",
    "CYP",
    "ESP",
    "NLD",
    "SWE",
    "FIN",
    "EST",
    "LVA",
    "LTU",
    "POL",
    "CZE",
]
NON_EU = ["GBR", "CHE", "USA", "JPN", "CAN", "AUS"]

TOTALS = {
    "eu_cbr": F(
        210,
        200,
        210,
        "2025-12",
        ["euronews_140", "verfassungsblog_2600", "delors_2026"],
        True,
        "Commission: about EUR 210bn of Bank of Russia assets immobilised in the EU, of which about 185 at Euroclear and about 25 in commercial banks (France, Germany, Sweden, Cyprus, Belgium). The basis of the reparations-loan proposal (3 Dec 2025) and of Regulation 2025/2600.",
    ),
    "eu_private": F(
        28,
        24.1,
        28,
        "2026-10 (page; figure undated)",
        ["ec_private_28", "ec_18_9_2022"],
        True,
        "Commission: 'more than EUR 28 billion of private assets in the EU frozen' (sanctioned persons and entities); 18.9 at 16 Dec 2022, 24.1 by mid-2023. Does not include the EUR 55bn of NSD-blocked securities at Euroclear.",
    ),
    "repo_cbr": F(
        eur(280, "USD", "2023-09"),
        None,
        None,
        "2023-09-07",
        ["repo_280", "brookings_status"],
        True,
        "REPO task force: about USD 280bn of Russian sovereign assets immobilised in REPO jurisdictions (EU, G7, Australia), the majority in the EU; the latest official all-country total. Experts and the Bank of Russia say USD 300-330bn.",
        native={"USD_bn": 280},
    ),
    "repo_private": F(
        eur(58, "USD", "2023-03"),
        None,
        None,
        "2023-03-09",
        ["repo_58"],
        True,
        "REPO: more than USD 58bn of sanctioned Russians' assets blocked or frozen by all members. No later REPO total.",
        native={"USD_bn": 58},
    ),
    "countries_with_figure_cbr": {
        "eu": sum_v("cbr_eur", EU),
        "non_eu_incl_estimates": sum_v("cbr_eur", NON_EU),
        "note": "Sum of the per-country values above (estimates used for Germany, the UK and Japan; Canada and Australia zero, see their notes). Mixed dates. EU about 208 against the Commission's 210; with the UK (~9), Switzerland, US and Japan (~28) about EUR 255bn, consistent with REPO's USD 280bn (EUR 260bn at the 2023 rate).",
    },
    "countries_with_figure_private": {
        "eu": sum_v("private_eur", EU),
        "non_eu": sum_v("private_eur", NON_EU),
        "note": "Sum of the national private figures above (Belgium's sanctioned banks, not the NSD securities). Mixed dates (2022-2026). The EU sum (about 30) is close to the Commission's 'more than 28bn', but by luck: Belgium's 10 is the Treasury's sanctioned-banks figure (the Commission's list had 3.5), while many members' figures are old (2022-23) or missing.",
    },
}

# ------------------------------------------------------------------------- windfall, ERA, reparations loan: the facts
TIMELINE = [
    (
        "2022-02-28",
        "The EU, US, UK, Canada, Japan and Switzerland bar transactions with the Bank of Russia; its reserves in their jurisdictions are immobilised (EU: Council Regulation 2022/334 amending 833/2014).",
        ["frozen_assets_json"],
    ),
    (
        "2023-03-09",
        "REPO task force: more than USD 58bn of sanctioned Russians' private assets blocked or frozen.",
        ["repo_58"],
    ),
    (
        "2023-09-07",
        "REPO task force maps about USD 280bn of immobilised Russian sovereign assets, mostly in the EU.",
        ["repo_280"],
    ),
    (
        "2024-05-21",
        "EU windfall contribution: CSDs holding over EUR 1m of Bank of Russia assets pay most of their net profit on that cash to the EU (Regulation 2024/1469). The principal is untouched.",
        ["reg_2024_1469"],
    ),
    (
        "2024-06-14",
        "G7 Apulia summit: about USD 50bn of 'Extraordinary Revenue Acceleration' (ERA) loans to Ukraine, to be serviced from the windfall revenues; the assets stay immobilised until Russia pays for the damage.",
        ["g7_apulia"],
    ),
    (
        "2024-07",
        "First windfall payment from Euroclear, about EUR 1.55bn (Commission: EUR 1.5bn); 90% via the European Peace Facility, 10% via the Ukraine Facility (also for the second tranche).",
        ["kallas_ep_answer", "euroclear_h1_2026"],
    ),
    (
        "2024-10-24",
        "EU ERA share set up: Ukraine Loan Cooperation Mechanism and up to EUR 18.1bn macro-financial assistance (Regulation 2024/2773). Other lenders: US USD 20bn, UK GBP 2.26bn, Canada CAD 5bn, Japan JPY 471.9bn.",
        ["reg_2024_2773", "era_partners"],
    ),
    ("2025-01-10", "Commission pays the first EUR 3bn of the EU's ERA share.", ["ec_era_first"]),
    (
        "2025",
        "Windfall payments: about EUR 2.1bn (spring) and 1.6bn (summer); from the third tranche 95% goes to the Ukraine Loan Cooperation Mechanism (repaying the ERA loans) and 5% to the EPF.",
        ["kallas_ep_answer", "euroclear_h1_2026", "frozen_assets_json"],
    ),
    (
        "2025-09-26",
        "Commission floats a EUR 140bn 'reparations loan' from the cash balances at Euroclear (about EUR 45bn of the 185 already backing ERA).",
        ["euronews_140", "delors_2026"],
    ),
    (
        "2025-10-23",
        "European Council does not agree; Belgium asks for shared liability and guarantees; Commission asked for options.",
        ["delors_2026"],
    ),
    (
        "2025-12-03",
        "Commission tables legal proposals: a reparations loan using up to EUR 210bn of immobilised assets, or EU borrowing, to cover two-thirds of Ukraine's EUR 135bn needs for 2026-27 (EUR 90bn); plus an Art. 122 regulation to block transfers back to Russia.",
        ["delors_2026"],
    ),
    (
        "2025-12-12",
        "Council Regulation (EU) 2025/2600 (Art. 122 TFEU, qualified majority): immobilised Bank of Russia assets may not be transferred back to Russia; no six-monthly unanimous renewal any more.",
        ["reg_2025_2600", "verfassungsblog_2600"],
    ),
    (
        "2025-12-18/19",
        "European Council: EUR 90bn loan for 2026-27 from EU borrowing backed by budget headroom, not from the assets. Ukraine repays only once it receives reparations; the assets stay immobilised and the Union 'reserves its right' to use them to repay the loan; work on the Reparations Loan to continue. Czechia, Hungary and Slovakia stay out (enhanced cooperation).",
        ["euco_2025_12", "kyivpost_euco_2025_12", "delors_2026"],
    ),
    (
        "2026-02-04",
        "Council position on the EUR 90bn Ukraine Support Loan (Regulation (EU) 2026/467).",
        ["consilium_usl_2026_02"],
    ),
    (
        "2026-02-27",
        "The Bank of Russia challenges Regulation 2025/2600 before the EU General Court.",
        ["cbr_lawsuit_2026"],
    ),
    (
        "2026-04-23",
        "Council adopts the last act for the EUR 90bn loan after Hungary lifts its veto (tied to the Druzhba restart).",
        ["ec_usl", "pgj_hungary_veto"],
    ),
    (
        "2026-05-15",
        "Moscow court rules for the Bank of Russia against Euroclear; appeal rejected 16 Jul 2026. Euroclear does not recognise the jurisdiction; such rulings are not recognised under EU law.",
        ["euroclear_h1_2026"],
    ),
    (
        "2026-06-25",
        "First Ukraine Support Loan payment, EUR 3.2bn (and EUR 3.9bn for drones on 30 June). EUR 19.8bn disbursed by late October 2026 (Commission page).",
        ["ec_usl_first", "ec_assistance"],
    ),
    (
        "2026-06-30",
        "Euroclear: EUR 202bn of its EUR 241bn balance sheet relates to sanctioned Russian assets; H1 interest EUR 2.3bn; about EUR 6.6bn paid as windfall so far.",
        ["euroclear_h1_2026"],
    ),
    (
        "2026-08-03",
        "Fifth windfall payment, EUR 1.4bn; about EUR 8bn in all since 2024. The Commission counts EUR 3.8bn of EU support to Ukraine 'from the proceeds of Russian immobilised assets' (the EPF and Ukraine Facility parts; the ULCM part repays ERA).",
        ["windfall_aug_2026", "ec_assistance"],
    ),
    (
        "2026-08 to 10",
        "Sweden, the Netherlands, Poland and Spain push to revive the reparations loan for 2027; the ECB warns about confidence in the euro. European Council 15-16 Oct 2026: no decision, will 'revert to the issue in a timely manner'.",
        ["forbes_2026_10", "euronews_2026_10_16"],
    ),
]

WINDFALL = {
    "what": "EU windfall contribution: net profits Euroclear (and other CSDs) earn on the Bank of Russia's immobilised cash, paid to the EU. The assets themselves are not touched.",
    "payments_eur_bn": [
        {"date": "2024-07", "v": 1.55, "use": "90% EPF, 10% Ukraine Facility"},
        {"date": "2025-04", "v": 2.1, "use": "90% EPF, 10% Ukraine Facility"},
        {"date": "2025-07/08", "v": 1.6, "use": "95% ULCM (ERA repayments), 5% EPF"},
        {"date": "2026-Q1", "v": 1.4, "use": "95% ULCM, 5% EPF"},
        {"date": "2026-08-03", "v": 1.4, "use": "95% ULCM, 5% EPF"},
    ],
    "total_eur_bn": {"v": 8.0, "date": "2026-08-03", "src": ["windfall_aug_2026", "euroclear_h1_2026"]},
    "conflicts": "Tranche sizes differ slightly between Euroclear (1.55, about 2.1, 1.6) and Commission or press rounding (1.5, 1.5-1.6). Euroclear's 'about EUR 6.6bn to date' (17 Jul 2026) plus the 1.4bn of 3 Aug 2026 gives the Commission's 'about EUR 8bn'.",
    "belgium": "Belgium also taxes Euroclear's Russia-related profit (corporate tax about EUR 1.7bn for 2024) and has pledged that money to Ukraine.",
    "src": ["reg_2024_1469", "kallas_ep_answer", "euroclear_h1_2026", "windfall_aug_2026", "belga_tax"],
}

ERA = {
    "what": "G7 Extraordinary Revenue Acceleration loans: about USD 50bn (EUR 45bn) lent to Ukraine in 2024-2025, repaid from the windfall revenues of the immobilised assets, not from the assets.",
    "lenders": {
        "USA": {"native": "USD 20bn", "eur_bn_approx": 18.3},
        "EU": {"native": "EUR 18.1bn (macro-financial assistance via the ULCM)", "eur_bn_approx": 18.1},
        "CAN": {"native": "CAD 5bn", "eur_bn_approx": 3.3},
        "GBR": {"native": "GBP 2.26bn", "eur_bn_approx": 2.6},
        "JPN": {"native": "JPY 471.9bn", "eur_bn_approx": 1.6},
    },
    "status": "The EU paid its first EUR 3bn on 10 Jan 2025 and its share was to be paid by end-2025; the UK paid its last tranche in April 2025. Reports in 2026 said parts of the US and Japanese shares were still being paid out. Not checked in full this round.",
    "src": ["g7_apulia", "reg_2024_2773", "ec_era_first", "era_partners"],
}

REPARATIONS_LOAN = {
    "status_2026_10": "Not adopted. Proposed by the Commission (idea Sep 2025, EUR 140bn; legal proposal 3 Dec 2025 with up to EUR 210bn of immobilised assets). Set aside on 19 Dec 2025 in favour of the EUR 90bn Ukraine Support Loan from EU borrowing; leaders asked for work on it to continue. Revived by several members for 2027 in Aug-Oct 2026; no decision at the 15-16 Oct 2026 summit.",
    "mechanism": "The EU would borrow the cash balances that Euroclear and other institutions hold for the Bank of Russia (Euroclear would get an interest-free EU debt claim instead), and lend that money to Ukraine. Ukraine would repay only if Russia pays reparations; the Bank of Russia's claim on Euroclear would stay, and Member States would guarantee the EU against it being enforced. Not a confiscation.",
    "belgium_role": "Euroclear holds about EUR 185bn of the EUR 210bn in the EU, so Belgium carries most of the legal and retaliation risk (Russian court claims against Euroclear; the 2015 Belgium-Russia investment treaty). Belgium's PM De Wever demanded shared liability, guarantees and the participation of the other holders (France's banks, Japan, the UK); he also called confiscation unacceptable. Italy, Malta and Bulgaria, and less openly France, backed Belgium's caution.",
    "what_was_agreed_instead": "Ukraine Support Loan, EUR 90bn for 2026-27 (indicatively 30 budget support, 60 defence), EU borrowing guaranteed by budget headroom, 24 members (without CZ, HU, SK). Repaid by Ukraine only out of reparations; the EU 'reserves its right' to use the immobilised assets to repay it.",
    "src": ["euronews_140", "delors_2026", "euco_2025_12", "ec_usl", "forbes_2026_10", "euronews_2026_10_16"],
}

PHRASING = {
    "rule": "The site counts the yearly return Russia lost on these assets (Russian money frozen line), never the frozen stock. Amounts on pages are context: 'frozen' or 'immobilised', not 'lost', 'taken' or 'seized'.",
    "do": [
        "Belgium: 'About EUR 185bn of the Russian central bank's reserves are immobilised at Euroclear in Brussels (European Commission, December 2025). Euroclear reports EUR 202bn of sanctioned Russian assets on its balance sheet (30 June 2026), most of it the central bank's cash.'",
        "EU: 'About EUR 210bn of Bank of Russia assets are immobilised in the EU, and more than EUR 28bn of sanctioned Russians' private assets are frozen (European Commission).'",
        "Countries without a figure: 'Japan has not published how much it holds; estimates are EUR 20-40bn.' / 'No official figure has been published.'",
        "Ownership: 'The assets still belong to Russia's central bank; only the income is used (windfall contribution, ERA loans).'",
        "The reparations loan: 'proposed, not adopted'; the EUR 90bn loan 'from EU borrowing, to be repaid by Ukraine only if Russia pays reparations'.",
    ],
    "dont": [
        "Do not add the EPRS figures for Canada (15.1) and the UK (26.6) to Belgium's: they include Euroclear's cash in those currencies.",
        "Do not add Euroclear's EUR 202bn and the Commission's EUR 185bn: they overlap.",
        "Do not mix the private EUR 28bn (sanctioned persons) with the EUR 55bn of NSD-blocked securities at Euroclear.",
        "Do not present the EUR 90bn Ukraine Support Loan as funded by Russian assets, or the windfall payments as the assets themselves.",
        "Do not show the frozen stock as Russia's loss, cost or the country's gain.",
    ],
}


def src_obj(sid: str) -> dict:
    name, url, date, kind, fname, _ = S[sid]
    if fname and (RAW / fname).exists():
        txt = (RAW / fname).read_text()
        read = (
            "extract"
            if "HTTP: 200" in txt and "(no extract" not in txt
            else ("summary" if sid in READ_SUMMARY else "not fetched")
        )
    elif sid in EARLIER_ROUND or kind == "project":
        read = "earlier round"
    elif sid in READ_SUMMARY:
        read = "summary"
    else:
        read = "not fetched"
    d = {"id": sid, "name": name, "url": url, "date": date, "type": kind, "read": read}
    if fname:
        d["extract"] = f"research/2026-10/raw/frozen_amounts_r58/{fname}"
    return d


def run() -> None:
    used = set()

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "src" and isinstance(v, list):
                    used.update(v)
                else:
                    walk(v)
        elif isinstance(o, list):
            for x in o:
                walk(x)

    walk(COUNTRIES)
    walk(TOTALS)
    walk([WINDFALL, ERA, REPARATIONS_LOAN])
    for _, _, s in TIMELINE:
        used.update(s)
    missing = sorted(used - set(S))
    if missing:
        sys.exit(f"unknown source ids: {missing}")
    out = {
        "generated": "2026-10-27",
        "round": 58,
        "meta": {
            "what": "Amounts of Russian assets frozen, per holding country: Bank of Russia reserves immobilised (cbr_eur) and private assets of sanctioned persons and entities frozen (private_eur); EU and G7/REPO totals; windfall, ERA and reparations-loan facts. For explainer pages and search; not wired into the pipeline.",
            "units": "EUR bn. v = the figure shown (latest official where one exists, converted at about the rate of its date; native gives the original), lo/hi = range across sources, date = date of v, src = source ids (first = v's source; resolved in 'sources'), official = whether v comes from a government, EU institution, central bank or the holder itself. v null = no public figure; est = an outside estimate, to be shown only as one.",
            "rule": "Stocks only. The site's 'Russian money frozen' line counts the return Russia lost on these stocks (frozen_assets.json, private_frozen_r39.json); never the stock itself.",
            "reuse": "Amounts from rounds 7 and 39 are reused and updated: UK central-bank estimate (now ~GBP 8bn press figure, was a guess of 10), Switzerland (June 2026), Euroclear (June 2026), Luxembourg (official 'below EUR 10,000'), France (LCP 2026), Latvia, Sweden, Finland, Estonia, Lithuania, Poland, Czechia added.",
        },
        "countries": COUNTRIES,
        "no_public_figure": NO_FIGURE,
        "totals": TOTALS,
        "windfall": WINDFALL,
        "era_loans": ERA,
        "reparations_loan": REPARATIONS_LOAN,
        "timeline": [{"date": d, "fact": f, "src": s} for d, f, s in TIMELINE],
        "phrasing": PHRASING,
        "fx_eur_per_unit": {f"{c} {d}": r for (c, d), r in FX.items()},
        "sources": [src_obj(s) for s in S if s in used],
    }
    GAPS.mkdir(parents=True, exist_ok=True)
    (GAPS / "frozen_amounts_r58.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
    print("countries", len(COUNTRIES), "sources", len(out["sources"]))
    print("cbr eu", TOTALS["countries_with_figure_cbr"], "\npriv", TOTALS["countries_with_figure_private"])


if __name__ == "__main__":
    {"fetch": fetch, "run": run}[sys.argv[1] if len(sys.argv) > 1 else "run"]()
