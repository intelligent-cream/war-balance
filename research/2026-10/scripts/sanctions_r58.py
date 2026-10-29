"""Round 58: does each country on the map have sanctions on Russia? A factual status per country (site/data.json), since
February 2022, in five neutral, separately sourced parts:

1. own_regime: a sanctions or export-control regime against Russia under the country's own law (yes / no found), since
   when, legal basis, scope, sources.
2. eu_aligned: EU member (Regulations 833/2014 and 269/2014), or a non-member that adopts the EU's Russia measures
   under its own law (HR alignment statements; national acts), or none found.
3. price_cap_coalition: member of the G7+ oil price cap coalition (statements of 2 December 2022 and 7 March 2024).
4. export_controls: listed in the US EAR Supplement No. 3 to Part 746 (countries that committed to substantially
   similar export controls on Russia and Belarus), or own controls from an official source (Singapore).
5. unfriendly_list: on Russia's list of states and territories that commit unfriendly acts (Government Order of
   5 March 2022 No. 430-r, as amended by No. 2018-r of 23 July 2022 and No. 3216-r of 29 October 2022).
Plus `position`: a short, sourced public statement for countries that said they do not impose sanctions of their own.

Nothing is guessed: where no evidence was found the field says so, with the date checked. Territories that are not
states carry their sovereign and are not given the sovereign's status unless a source names them.

Inputs: research/2026-10/raw/sanctions_r58/ (downloads listed with URL and date in _fetchlog.tsv; web-search extracts in
search_extracts.json). The three Russian orders on pravo.gov.ru are scanned images; their lists are transcribed below
from the page images (ru_430r_2022-03-05.pdf p.2, ru_2018r_2022-07-23.pdf p.2, ru_3216r_2022-10-29.pdf p.1).

Run from the repository root: python3 -I research/2026-10/scripts/sanctions_r58.py
Writes research/2026-10/gaps/sanctions_r58.json.
"""

import html
import json
import re
from pathlib import Path

R = Path(__file__).resolve().parent.parent
ROOT = R.parent.parent
RAW = R / "raw" / "sanctions_r58"
CHECKED = "2026-10-27"

EU27 = [
    "AUT",
    "BEL",
    "BGR",
    "HRV",
    "CYP",
    "CZE",
    "DNK",
    "EST",
    "FIN",
    "FRA",
    "DEU",
    "GRC",
    "HUN",
    "IRL",
    "ITA",
    "LVA",
    "LTU",
    "LUX",
    "MLT",
    "NLD",
    "POL",
    "PRT",
    "ROU",
    "SVK",
    "SVN",
    "ESP",
    "SWE",
]
G7 = ["CAN", "FRA", "DEU", "ITA", "JPN", "GBR", "USA"]

# entries in site/data.json that are not sovereign states: their sovereign (None: no single sovereign / not applicable)
TERRITORY = {
    "ABW": "NLD",
    "BES": "NLD",
    "CUW": "NLD",
    "SXM": "NLD",
    "AIA": "GBR",
    "BMU": "GBR",
    "CYM": "GBR",
    "FLK": "GBR",
    "GIB": "GBR",
    "IOT": "GBR",
    "MSR": "GBR",
    "PCN": "GBR",
    "SGS": "GBR",
    "SHN": "GBR",
    "TCA": "GBR",
    "VGB": "GBR",
    "ASM": "USA",
    "GUM": "USA",
    "MNP": "USA",
    "UMI": "USA",
    "ATF": "FRA",
    "BLM": "FRA",
    "NCL": "FRA",
    "PYF": "FRA",
    "SPM": "FRA",
    "WLF": "FRA",
    "CCK": "AUS",
    "CXR": "AUS",
    "NFK": "AUS",
    "COK": "NZL",
    "NIU": "NZL",
    "TKL": "NZL",
    "FRO": "DNK",
    "GRL": "DNK",
    "BVT": "NOR",
    "HKG": "CHN",
    "MAC": "CHN",
    "ATA": None,
    "ESH": None,
}
# British overseas territories covered by the Russia (Sanctions) (Overseas Territories) Order 2020, Schedule 1
# (uk_si_2020_1571_sch1.html); Bermuda and Gibraltar are not in that schedule (they give effect to UK sanctions under
# their own legislation, not checked in this round)
UK_OT_ORDER = ["AIA", "IOT", "CYM", "FLK", "MSR", "PCN", "SHN", "SGS", "TCA", "VGB"]

# ---------------------------------------------------------------------------------------------------------------------
# Sources. type: legal_text, official_statement, official_list, official_mirror (official text republished by a third
# party), news, law_firm, search_extract (only a search-result extract was reachable; see search_extracts.json)
SOURCES = {
    "ru_430r": (
        "Government of Russia, Order of 5 March 2022 No. 430-r (official publication, scanned)",
        "http://publication.pravo.gov.ru/Document/View/0001202203070001",
        "legal_text",
        "ru_430r_2022-03-05.pdf",
    ),
    "ru_430r_news": (
        "Government of Russia, news release on Order 430-r, 7 March 2022",
        "http://government.ru/docs/44745/",
        "official_statement",
        "ru_gov_44745.html",
    ),
    "ru_2018r": (
        "Government of Russia, Order of 23 July 2022 No. 2018-r amending the list (scanned)",
        "http://publication.pravo.gov.ru/Document/View/0001202207250018",
        "legal_text",
        "ru_2018r_2022-07-23.pdf",
    ),
    "ru_3216r": (
        "Government of Russia, Order of 29 October 2022 No. 3216-r amending the list (scanned)",
        "http://publication.pravo.gov.ru/Document/View/0001202210310047",
        "legal_text",
        "ru_3216r_2022-10-29.pdf",
    ),
    "ru_consultant": (
        "ConsultantPlus, Order 430-r, current edition 'ред. от 29.10.2022'",
        "https://www.consultant.ru/document/cons_doc_LAW_411064/",
        "official_mirror",
        "consultant_430r.html",
    ),
    "bis_supp3": (
        "US eCFR, 15 CFR Part 746 Supplement No. 3: countries excluded from certain license requirements",
        "https://www.ecfr.gov/api/renderer/v1/content/enhanced/current/title-15?part=746",
        "legal_text",
        "bis_ecfr_part746.html",
    ),
    "eu_align_2026_508": (
        "HR statement on alignment with Council Decision (CFSP) 2026/508 (20th package), 13 May 2026, as republished by PubAffairs Bruxelles (consilium.europa.eu blocks downloads)",
        "https://www.pubaffairsbruxelles.eu/eu-institution-news/statement-by-the-high-representative-on-behalf-of-the-eu-on-the-alignment-of-certain-countries-concerning-restrictive-measures-in-view-of-russias-actions-destabilising-the-situation-in-ukrain-2/",
        "official_mirror",
        "pubaffairs_alignment_2014-512.html",
    ),
    "eu_align_2026_508_orig": (
        "Council of the EU, same statement (original URL)",
        "https://www.consilium.europa.eu/en/press/press-releases/2026/05/13/statement-by-the-high-representative-on-behalf-of-the-european-union-on-the-alignment-of-certain-countries-concerning-restrictive-measures-in-view-of-russia-s-actions-destabilising-the-situation-in-ukraine-council-decision-cfsp-2026508/",
        "official_statement",
        None,
    ),
    "eu_align_2026_1351": (
        "HR statement on alignment with Council Decision (CFSP) 2026/1351, 29 June 2026",
        "https://www.consilium.europa.eu/en/press/press-releases/2026/06/29/statement-by-the-high-representative-on-behalf-of-the-european-union-on-the-alignment-of-certain-countries-concerning-restrictive-measures-in-view-of-russia-s-destabilising-activities-20261351/",
        "search_extract",
        "search_extracts.json#x_eu_2026_06_decl",
    ),
    "eu_833": (
        "Council Regulation (EU) No 833/2014 (consolidated)",
        "https://eur-lex.europa.eu/eli/reg/2014/833/oj",
        "legal_text",
        None,
    ),
    "pricecap_2022": (
        "Statement of the G7 and Australia on a price cap for seaborne Russian-origin crude oil, 2 December 2022 (German Federal Foreign Office)",
        "https://www.auswaertiges-amt.de/en/newsroom/news/g7-australia-price-cap-seaborne-russian-origin-crude-oil/2567026",
        "official_statement",
        "de_aa_pricecap_2022-12-02.html",
    ),
    "pricecap_nzl": (
        "Price Cap Coalition statement welcoming New Zealand as a member, 7 March 2024 (Japan MOF)",
        "https://www.mof.go.jp/policy/international_policy/gaitame_kawase/gaitame/economic_sanctions/20240307_statement.pdf",
        "official_statement",
        "jp_mof_pricecap_20240307.pdf",
    ),
    "us_ofac": (
        "OFAC, Russian Harmful Foreign Activities Sanctions (EO 14024 and related)",
        "https://ofac.treasury.gov/sanctions-programs-and-country-information/russian-harmful-foreign-activities-sanctions",
        "official_statement",
        "ofac_russia_program.html",
    ),
    "uk_si": (
        "The Russia (Sanctions) (EU Exit) Regulations 2019 (SI 2019/855)",
        "https://www.legislation.gov.uk/uksi/2019/855/contents",
        "legal_text",
        "uk_si_2019_855.html",
    ),
    "uk_ot": (
        "The Russia (Sanctions) (Overseas Territories) Order 2020 (SI 2020/1571), Schedule 1",
        "https://www.legislation.gov.uk/uksi/2020/1571/schedule/1/made",
        "legal_text",
        "uk_si_2020_1571_sch1.html",
    ),
    "ca_semr": (
        "Special Economic Measures (Russia) Regulations, SOR/2014-58",
        "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2014-58/index.html",
        "legal_text",
        "ca_sor_2014-58.html",
    ),
    "au_asr": (
        "Autonomous Sanctions Regulations 2011 (F2011L02673), reg. 5B 'Sanctioned commercial activity—Russia'",
        "https://www.legislation.gov.au/F2011L02673/latest/text",
        "legal_text",
        "au_legislation_F2011L02673.html",
    ),
    "au_dfat": (
        "DFAT, Russia sanctions regime (page not retrievable on the date checked)",
        "https://www.dfat.gov.au/international-relations/security/sanctions/sanctions-regimes/russia-sanctions-regime",
        "official_statement",
        None,
    ),
    "nz_mfat": (
        "MFAT, Russia Sanctions (Russia Sanctions Act 2022)",
        "https://www.mfat.govt.nz/en/countries-and-regions/europe/ukraine/russian-invasion-of-ukraine/sanctions",
        "official_statement",
        "nz_mfat_russia.html",
    ),
    "jp_fefta": (
        "Japan's sanctions related to the situation in Ukraine (Foreign Exchange and Foreign Trade Act), law-firm summary (mofa.go.jp, meti.go.jp return 403)",
        "https://www.whitecase.com/insight-alert/japans-sanctions-related-situation-ukraine",
        "search_extract",
        "search_extracts.json#x_jp_fefta",
    ),
    "kr_mofa": (
        "Korea MOFA, 28 February 2022 announcement on export controls and SWIFT",
        "https://www.mofa.go.kr/eng/brd/m_5676/view.do?seq=322003",
        "search_extract",
        "search_extracts.json#x_kr_2022",
    ),
    "tw_moea": (
        "Taiwan MOEA export controls on Russia and Belarus (news report)",
        "https://www.taiwannews.com.tw/en/news/4557937",
        "search_extract",
        "search_extracts.json#x_tw_2022",
    ),
    "sg_mfa": (
        "Singapore MFA, Sanctions and restrictions against Russia, 5 March 2022",
        "https://www.mfa.gov.sg/Newsroom/Press-Statements-Transcripts-and-Photos/2022/03/20220305-sanctions",
        "official_statement",
        "sg_mfa_2022-03-05.html",
    ),
    "ch_finma": (
        "FINMA, 28 February 2022: Federal Council adopts EU sanctions; amendment of SR 946.231.176.72",
        "https://www.finma.ch/en/news/2022/02/20220228-sr-946-231-176-72/",
        "official_statement",
        "ch_finma_20220228.html",
    ),
    "ch_seco": (
        "SECO, 'Switzerland adopts EU sanctions against Russia', 28 February 2022",
        "https://seco.admin.ch/seco/en/home/seco/nsb-news.msg-id-87386.html",
        "search_extract",
        "search_extracts.json#x_ch_seco",
    ),
    "no_reg": (
        "Norway, Regulation of 15 August 2014 No. 1076 and government release on the 10th package",
        "https://www.regjeringen.no/en/whats-new/new-sanctions-against-russia-implemented-in-norwegian-law/id2970907/",
        "search_extract",
        "search_extracts.json#x_no_2014",
    ),
    "ua_law": (
        "Law of Ukraine 'On Sanctions' No. 1644-VII of 14 August 2014 (page not retrievable on the date checked)",
        "https://zakon.rada.gov.ua/laws/show/1644-18",
        "legal_text",
        None,
    ),
    "md_cis": (
        "Moldpres, 9 January 2026: Moldova aligns with US restrictive measures on Russian oil companies (Interinstitutional Supervisory Council decision)",
        "https://moldpres.md/eng/politics/doc-moldova-aligns-with-restrictive-measures-imposed-by-united-states-against-russian-oil-companies",
        "official_statement",
        "md_moldpres_us_oil.html",
    ),
    "md_align": (
        "Commission progress report on Moldova's alignment (news report)",
        "https://www.rferl.org/a/eu-expects-moldova-implement-more-sanctions-russia/32677999.html",
        "search_extract",
        "search_extracts.json#x_md",
    ),
    "ad_decree": (
        "Andorra decree incorporating EU 19th and 20th packages, May 2026 (news report)",
        "https://www.alto.ad/politics/2026/05/andorra-eu-russia-sanctions-ukraine-war",
        "news",
        "ad_alto_2026-05.html",
    ),
    "sm_decree": (
        "San Marino Decree-Law 15 March 2022 No. 35 and later decree-laws (Consiglio Grande e Generale)",
        "https://www.consigliograndeegenerale.sm/on-line/home/documento17131672.html",
        "search_extract",
        "search_extracts.json#x_sm_decree",
    ),
    "bs_gfsr": (
        "Central Bank of The Bahamas, GFSR directives on Russian business activities, 12 March 2022",
        "https://centralbankbahamas.com/news/press-releases/press-release-group-of-financial-services-regulators-directives-on-russian-business-activities",
        "official_statement",
        "bs_cbb_2022-03-12.html",
    ),
    "bs_gfsr_pdf": (
        "GFSR notice, directive on Russian business activities, 12 March 2022",
        "https://www.centralbankbahamas.com/news/press-releases/press-release-group-of-financial-services-regulators-directives-on-russian-business-activities",
        "search_extract",
        "search_extracts.json#x_bs_gfsr",
    ),
    "fsm": (
        "FSM severs diplomatic ties with Russia, 25 February 2022 (news report)",
        "https://www.pacificislandtimes.com/post/fsm-cuts-diplomatic-ties-with-russia-condemns-ukraine-invasion",
        "search_extract",
        "search_extracts.json#x_fsm",
    ),
    "cn": (
        "Chinese MFA spokesperson, 9 March 2022 (news report)",
        "https://www.tbsnews.net/node/377803",
        "search_extract",
        "search_extracts.json#x_cn",
    ),
    "in": (
        "Indian MEA spokesperson on the EU's 18th package, July 2025 (news report)",
        "https://scroll.in/latest/1084674/india-does-not-subscribe-to-unilateral-measures-says-mea-on-fresh-european-sanctions-on-russia",
        "search_extract",
        "search_extracts.json#x_in",
    ),
    "tr": (
        "Turkish Foreign Minister, 1 March 2022 (news report)",
        "https://bianet.org/haber/minister-turkey-wants-invasion-to-end-but-has-no-inclination-to-join-sanctions-against-russia-258490",
        "search_extract",
        "search_extracts.json#x_tr",
    ),
    "ae": (
        "UAE official to Reuters, 2023 (news report)",
        "https://www.aljazeera.com/news/2023/8/21/uae-says-not-flouting-ally-sanctions-as-its-economy-warms-to-russia",
        "search_extract",
        "search_extracts.json#x_ae",
    ),
    "br": (
        "Reuters, April 2023: Brazil has not joined sanctions (news report)",
        "https://koreatimes.co.kr/www/nation/2023/04/501_349394.html",
        "search_extract",
        "search_extracts.json#x_br",
    ),
    "kz": (
        "Kazakhstan Foreign Ministry / President Tokayev on sanctions (Interfax)",
        "https://interfax.com/newsroom/top-stories/86487/",
        "search_extract",
        "search_extracts.json#x_kz",
    ),
    "ge": (
        "Georgian Prime Minister, 25 February 2022 (news report)",
        "https://eurasianet.org/georgia-says-it-wont-join-international-sanctions-against-russia",
        "search_extract",
        "search_extracts.json#x_ge",
    ),
    "rs": (
        "Serbia and EU alignment on Russia (news report)",
        "https://n1info.rs/english/news/serbia-fails-to-align-with-two-new-eu-measures-against-russia/",
        "search_extract",
        "search_extracts.json#x_rs",
    ),
    "hk": (
        "Hong Kong Chief Executive, 11 October 2022 (AP report)",
        "https://www.nbcnews.com/news/world/hong-kong-us-sanctions-russian-owned-superyacht-rcna51642",
        "search_extract",
        "search_extracts.json#x_hk",
    ),
}

# ---------------------------------------------------------------------------------------------------------------------
# Russia's list, transcribed from the scanned orders. Order 430-r (5 March 2022): Australia, Albania, Andorra, United
# Kingdom (incl. Jersey and the overseas territories Anguilla, British Virgin Islands, Gibraltar), EU member states,
# Iceland, Canada, Liechtenstein, Micronesia, Monaco, New Zealand, Norway, Republic of Korea, San Marino, North
# Macedonia, Singapore, USA, Taiwan (China), Ukraine, Montenegro, Switzerland, Japan.
# Order 2018-r (23 July 2022): adds the Bahamas; UK entry adds Guernsey and Isle of Man.
# Order 3216-r (29 October 2022): UK entry becomes "United Kingdom (including the Crown Dependencies and the British
# Overseas Territories)". ConsultantPlus shows 29.10.2022 as the current edition on the date checked.
UNFRIENDLY_430R = [
    "AUS",
    "ALB",
    "AND",
    "GBR",
    "ISL",
    "CAN",
    "LIE",
    "FSM",
    "MCO",
    "NZL",
    "NOR",
    "KOR",
    "SMR",
    "MKD",
    "SGP",
    "USA",
    "TWN",
    "UKR",
    "MNE",
    "CHE",
    "JPN",
]
UK_NAMED_430R = ["AIA", "VGB", "GIB"]
BRITISH_OT = ["AIA", "BMU", "IOT", "VGB", "CYM", "FLK", "GIB", "MSR", "PCN", "SHN", "SGS", "TCA"]

# ---------------------------------------------------------------------------------------------------------------------
# Own regimes. since: the start of the country's own Russia measures (2014 where the regime predates the full
# invasion, with the post-February-2022 step named in `basis`)
OWN = {
    "USA": {
        "since": "2014-03-06",
        "scope": "full: blocking, import/export bans, financial, services, price cap",
        "basis": "IEEPA executive orders: EO 13660 (2014); EO 14024 (15 April 2021) and, after the invasion, EO 14066, 14068, 14071 (March-April 2022); export controls under the EAR (15 CFR 746.8)",
        "src": ["us_ofac", "bis_supp3"],
    },
    "GBR": {
        "since": "2020-12-31",
        "scope": "full: asset freezes, trade, financial, services, transport",
        "basis": "Sanctions and Anti-Money Laundering Act 2018; Russia (Sanctions) (EU Exit) Regulations 2019 (SI 2019/855), in force at the end of the Brexit transition, much amended from February 2022",
        "src": ["uk_si"],
    },
    "CAN": {
        "since": "2014-03-17",
        "scope": "full: asset freezes, trade, financial, services",
        "basis": "Special Economic Measures Act; Special Economic Measures (Russia) Regulations, SOR/2014-58 (last amended 2026-09-04 per the consolidation)",
        "src": ["ca_semr"],
    },
    "AUS": {
        "since": "2014",
        "scope": "full: designations, import/export bans, commercial activity",
        "basis": "Autonomous Sanctions Act 2011; Autonomous Sanctions Regulations 2011 (Russia measures since 2014, expanded from February 2022)",
        "src": ["au_asr", "au_dfat"],
    },
    "NZL": {
        "since": "2022-03",
        "scope": "full: designations, trade, financial, services",
        "basis": "Russia Sanctions Act 2022 and its Regulations (New Zealand's first autonomous sanctions law; exact assent date not re-checked, legislation.govt.nz not retrievable)",
        "src": ["nz_mfat"],
    },
    "JPN": {
        "since": "2022-02-26",
        "scope": "asset freezes, export and import bans, payments, price cap",
        "basis": "Foreign Exchange and Foreign Trade Act: 'Measures Related to the Situation in Ukraine' (MOFA, MOF, METI) from 26 February 2022 (earlier, smaller Crimea-related measures from 2014)",
        "src": ["jp_fefta", "pricecap_2022"],
    },
    "KOR": {
        "since": "2022-02-28",
        "scope": "export controls (strategic items, later non-strategic lists) and financial measures (SWIFT-related); no general asset-freeze regime found",
        "basis": "Foreign Trade Act export licensing; government announcement of 28 February 2022",
        "src": ["kr_mofa", "bis_supp3"],
    },
    "SGP": {
        "since": "2022-03-05",
        "scope": "export controls (military goods; electronics, computers, telecoms dual-use) and financial measures against four Russian banks and designated entities",
        "basis": "Strategic Goods (Control) Act / Strategic Goods (Control) Order 2021; MAS financial measures; MFA statement of 5 March 2022",
        "src": ["sg_mfa"],
    },
    "TWN": {
        "since": "2022",
        "scope": "export controls only (Strategic High-Tech Commodities lists for Russia and Belarus, extended 2022-2024)",
        "basis": "MOEA/Bureau of Foreign Trade export control lists",
        "src": ["tw_moea", "bis_supp3"],
    },
    "UKR": {
        "since": "2014-08-14",
        "scope": "full: NSDC sanctions decisions enacted by presidential decree",
        "basis": "Law of Ukraine 'On Sanctions' No. 1644-VII (2014)",
        "src": ["ua_law"],
    },
    "CHE": {
        "since": "2014-08-27",
        "scope": "adopts the EU's Russia measures (with Swiss decisions on each package)",
        "basis": "Embargo Act; Ordinance of 4 March 2022 on measures in connection with the situation in Ukraine (SR 946.231.176.72), replacing the 2014 anti-circumvention ordinance; decision of 28 February 2022 to adopt EU sanctions",
        "src": ["ch_finma", "ch_seco"],
    },
    "NOR": {
        "since": "2014-08-15",
        "scope": "adopts the EU's Russia measures with national adaptations",
        "basis": "Regulation of 15 August 2014 No. 1076 (restrictive measures concerning Ukraine), amended for each adopted EU package",
        "src": ["no_reg"],
    },
    "BHS": {
        "since": "2022-03-12",
        "scope": "financial sector only: directive not to deal with persons sanctioned by the US, Canada, UK, EU and others; no own designation list found",
        "basis": "Group of Financial Services Regulators directives of 12 March 2022",
        "src": ["bs_gfsr"],  # round 60: the directive PDF is gone; its press release (bs_gfsr) is the one address
    },
    "SMR": {
        "since": "2022-03-15",
        "scope": "adopts EU listings and later EU commercial and financial measures",
        "basis": "Decree-Law 15 March 2022 No. 35 and later decree-laws",
        "src": ["sm_decree"],
    },
    "AND": {
        "since": None,
        "scope": "adopts EU measures by government decree (latest found: May 2026, 19th and 20th packages)",
        "basis": "government decrees on restrictive measures (start date not established)",
        "src": ["ad_decree"],
    },
    "MDA": {
        "since": None,
        "scope": "partial: adopts some EU packages and some US designations through decisions of the Interinstitutional Supervisory Council",
        "basis": "law on international restrictive measures; Interinstitutional Supervisory Council decisions",
        "src": ["md_cis", "md_align"],
    },
}
# Countries in the HR alignment statements whose own national legal basis was not separately checked this round
ALIGN_ONLY = {"ALB", "BIH", "ISL", "MNE", "MKD"}

EU_ALIGN_NOTE = {
    "CHE": "not part of CFSP alignment statements; adopts EU measures by its own Federal Council decisions",
    "NOR": "EEA, not bound; Government decides on each package; not named in the 13 May 2026 statement on Decision 2026/508 but named in the 29 June 2026 statement on Decision 2026/1351",
    "BIH": "named in alignment statements; national implementation is reported to be incomplete (not verified here)",
    "MDA": "named in alignment statements; Commission reports alignment is incomplete",
    "AND": "not part of CFSP alignment statements; national decrees state alignment with EU sanctions",
    "SMR": "not part of CFSP alignment statements; national decree-laws implement EU listings and measures",
    "UKR": "named in alignment statements and has its own regime",
}

POSITION = {
    "CHN": (
        "opposes unilateral sanctions without a basis in international law; continues normal trade with Russia",
        "2022-03-09",
        ["cn"],
    ),
    "IND": ("does not subscribe to unilateral measures (said of the EU's 18th package)", "2025-07", ["in"]),
    "TUR": ("has not joined sanctions on principle; implements UN Security Council sanctions", "2022-03-01", ["tr"]),
    "ARE": ("abides by UN sanctions; has not adopted the Western measures", "2023", ["ae"]),
    "BRA": ("has not joined sanctions on Russia; government opposes them", "2023-04", ["br"]),
    "KAZ": (
        "does not impose its own sanctions and does not support other countries' sanctions, but says it will not let its territory be used to circumvent them and will abide by the sanctions regime",
        "2022-2023",
        ["kz"],
    ),
    "GEO": ("will not join financial and economic sanctions, citing national interests", "2022-02-25", ["ge"]),
    "SRB": ("has not imposed sanctions on Russia and has not aligned with EU Russia decisions", "2025", ["rs"]),
    "HKG": ("acts only on UN sanctions; no legal basis for unilateral ones", "2022-10-11", ["hk"]),
}


def text_of(name: str) -> str:
    t = (RAW / name).read_text(encoding="utf-8", errors="replace")
    t = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", "", t)
    t = re.sub(r"<[^>]+>", " ", t)
    return html.unescape(re.sub(r"\s+", " ", t))


NAME_ISO = {
    "Australia": "AUS",
    "Austria": "AUT",
    "Belgium": "BEL",
    "Bulgaria": "BGR",
    "Canada": "CAN",
    "Croatia": "HRV",
    "Cyprus": "CYP",
    "Czech Republic": "CZE",
    "Denmark": "DNK",
    "Estonia": "EST",
    "Finland": "FIN",
    "France": "FRA",
    "Germany": "DEU",
    "Greece": "GRC",
    "Hungary": "HUN",
    "Iceland": "ISL",
    "Ireland": "IRL",
    "Italy": "ITA",
    "Japan": "JPN",
    "Latvia": "LVA",
    "Liechtenstein": "LIE",
    "Lithuania": "LTU",
    "Luxembourg": "LUX",
    "Malta": "MLT",
    "Netherlands": "NLD",
    "New Zealand": "NZL",
    "Norway": "NOR",
    "Poland": "POL",
    "Portugal": "PRT",
    "Romania": "ROU",
    "Slovakia": "SVK",
    "Slovenia": "SVN",
    "South Korea": "KOR",
    "Spain": "ESP",
    "Sweden": "SWE",
    "Switzerland": "CHE",
    "Taiwan": "TWN",
    "United Kingdom": "GBR",
    "Albania": "ALB",
    "Bosnia and Herzegovina": "BIH",
    "Moldova (Republic of)": "MDA",
    "Montenegro": "MNE",
    "North Macedonia": "MKD",
    "Ukraine": "UKR",
}


def bis_supp3() -> dict:
    """Country -> (scope, FR citation) from the eCFR rendering of Supplement No. 3 to Part 746."""
    t = text_of("bis_ecfr_part746.html")
    i = t.index("Supplement No. 3 to Part 746—Countries Excluded")
    head = "Country Scope Federal Register citation"
    s = t[t.index(head, i) + len(head) : t.index("Supplement No. 4 to Part 746", i)]
    out = {}
    for m in re.finditer(r"([A-Z][A-Za-z .]+?) (Full|Partial) (\d+ FR \d+ , [\d/]+)\.", s):
        name = m.group(1).strip()
        out[NAME_ISO[name]] = {"scope": m.group(2), "fr": m.group(3).replace(" ,", ",")}
    assert len(out) >= 38, len(out)
    return out


def align_2026_508() -> list:
    """Countries named in the HR statement on Decision 2026/508."""
    t = text_of("pubaffairs_alignment_2014-512.html")
    assert "Council Decision (CFSP) 2026/508" in t
    m = re.search(r"Finally,[^.]*\.\s*(.+?) align themselves with this Council Decision", t)
    parts = m.group(1).split(", ")
    names = parts[:-1] + parts[-1].rsplit(" and ", 1)
    return [NAME_ISO[n.strip()] for n in names]


def check_anchors() -> None:
    """Fail loudly if a download no longer says what the tables above rely on."""
    t = text_of("ru_gov_44745.html")
    assert "430-р" in t and "Тайвань" in t and "Сингапур" in t
    assert "ред. от 29.10.2022" in text_of("consultant_430r.html")
    t = text_of("de_aa_pricecap_2022-12-02.html")
    assert "The G7 and Australia, as current members of the Price Cap Coalition" in t
    assert "Special Economic Measures (Russia) Regulations" in text_of("ca_sor_2014-58.html")
    assert "Sanctioned commercial activity—Russia" in text_of("au_legislation_F2011L02673.html")
    assert "Russia Sanctions Act 2022" in text_of("nz_mfat_russia.html")
    assert "Military Goods List" in text_of("sg_mfa_2022-03-05.html")
    assert "946.231.176.72" in text_of("ch_finma_20220228.html")
    assert "Executive Order 14024" in text_of("ofac_russia_program.html")
    t = text_of("uk_si_2020_1571_sch1.html")
    assert all(x in t for x in ("Anguilla", "Cayman Islands", "Turks and Caicos Islands", "Virgin Islands"))
    assert "Bermuda" not in t.split("SCHEDULE 1")[1][:600] and "Gibraltar" not in t.split("SCHEDULE 1")[1][:600]
    assert "Interinstitutional Supervisory Council" in text_of("md_moldpres_us_oil.html")
    assert "Andorra's alignment with EU sanctions" in text_of("ad_alto_2026-05.html")


def fetch_dates() -> dict:
    out = {}
    for line in (RAW / "_fetchlog.tsv").read_text().splitlines():
        f = line.split("\t")
        if len(f) >= 4 and f[3] == "200":
            out[f[0]] = f[2]
    return out


def main() -> None:
    check_anchors()
    supp3 = bis_supp3()
    aligned_508 = align_2026_508()
    data = json.loads((ROOT / "site" / "data.json").read_text())["countries"]
    dates = fetch_dates()

    def unfriendly(iso: str) -> dict:
        eu = iso in EU27
        if iso in UNFRIENDLY_430R or eu:
            how = "EU member states" if eu else "named"
            return {
                "listed": True,
                "since": "2022-03-05",
                "how": how,
                "order": "430-r",
                "src": ["ru_430r", "ru_consultant"],
            }
        if iso == "BHS":
            return {"listed": True, "since": "2022-07-23", "how": "named", "order": "2018-r", "src": ["ru_2018r"]}
        if iso in UK_NAMED_430R:
            return {
                "listed": True,
                "since": "2022-03-05",
                "how": "named under United Kingdom",
                "order": "430-r",
                "src": ["ru_430r"],
            }
        if iso in BRITISH_OT:
            return {
                "listed": True,
                "since": "2022-10-29",
                "how": "United Kingdom incl. British Overseas Territories",
                "order": "3216-r",
                "src": ["ru_3216r"],
            }
        sov = TERRITORY.get(iso)
        if sov and (sov in UNFRIENDLY_430R or sov in EU27):
            return {
                "listed": None,
                "since": None,
                "how": f"not named; its sovereign ({sov}) is listed",
                "order": None,
                "src": ["ru_430r"],
            }
        return {"listed": False, "since": None, "how": None, "order": None, "src": ["ru_430r", "ru_consultant"]}

    def eu_aligned(iso: str) -> dict:
        if iso in EU27:
            return {"status": "eu_member", "basis": "Council Regulations 833/2014 and 269/2014", "src": ["eu_833"]}
        if iso in aligned_508 or iso in ("NOR", "CHE", "AND", "SMR"):
            partial = iso in ("BIH", "MDA")
            return {
                "status": "adopts_eu_measures_partial" if partial else "adopts_eu_measures",
                "in_hr_statement_2026_508": iso in aligned_508,
                "note": EU_ALIGN_NOTE.get(iso),
                "src": (["eu_align_2026_508", "eu_align_2026_508_orig"] if iso in aligned_508 else [])
                + (["eu_align_2026_1351"] if iso == "NOR" else [])
                + OWN.get(iso, {}).get("src", []),
            }
        return {"status": "none_found", "src": ["eu_align_2026_508"]}

    def price_cap(iso: str) -> dict:
        if iso in G7 or iso == "AUS":
            return {
                "member": True,
                "how": "G7" if iso in G7 else "founding member",
                "since": "2022-12-02",
                "src": ["pricecap_2022"],
            }
        if iso == "NZL":
            return {"member": True, "how": "joined", "since": "2024-03-07", "src": ["pricecap_nzl"]}
        if iso in EU27:
            return {"member": True, "how": "via the EU", "since": "2022-12-02", "src": ["pricecap_2022"]}
        return {"member": False, "src": ["pricecap_2022", "pricecap_nzl"]}

    def export_controls(iso: str) -> dict:
        if iso in supp3:
            return {
                "russia_controls": True,
                "basis": "listed in EAR Supplement No. 3 to Part 746 (committed to substantially similar export controls on Russia and Belarus)",
                "bis_supp3": supp3[iso],
                "src": ["bis_supp3"],
            }
        if iso == "SGP":
            return {
                "russia_controls": True,
                "basis": "own controls announced 5 March 2022; not in EAR Supplement No. 3",
                "bis_supp3": None,
                "src": ["sg_mfa"],
            }
        if iso in ("UKR", "MNE", "ALB", "MKD", "BIH", "MDA", "AND", "SMR"):
            return {
                "russia_controls": None,
                "basis": "adopts EU measures (which include export bans) but not in EAR Supplement No. 3; own export-control scope not checked",
                "bis_supp3": None,
                "src": ["bis_supp3"],
            }
        return {
            "russia_controls": False,
            "basis": "not in EAR Supplement No. 3; no own Russia export controls found",
            "bis_supp3": None,
            "src": ["bis_supp3"],
        }

    out = {}
    counts: dict = {}
    for iso, c in sorted(data.items()):
        sov = TERRITORY.get(iso)
        rec = {"name": c["name"], "kind": "territory" if iso in TERRITORY else "state", "sovereign": sov}
        if iso in OWN:
            o = OWN[iso]
            rec["own_regime"] = {
                "yes": True,
                "since": o["since"],
                "basis": o["basis"],
                "scope": o["scope"],
                "src": o["src"],
            }
        elif iso in ALIGN_ONLY:
            rec["own_regime"] = {
                "yes": True,
                "since": None,
                "basis": "national implementation of EU measures (named in HR alignment statements); national act not checked this round",
                "scope": "adopts EU measures",
                "src": ["eu_align_2026_508"],
            }
        elif iso in EU27:
            rec["own_regime"] = {
                "yes": False,
                "since": None,
                "basis": "EU regime applies (member state)",
                "scope": None,
                "applies_regime": "EU",
                "src": ["eu_833"],
            }
        elif iso in UK_OT_ORDER:
            rec["own_regime"] = {
                "yes": False,
                "since": "2020-12-31",
                "basis": "UK Russia regime extended by the Russia (Sanctions) (Overseas Territories) Order 2020",
                "scope": "as UK",
                "applies_regime": "GBR",
                "src": ["uk_ot"],
            }
        else:
            rec["own_regime"] = {
                "yes": False,
                "since": None,
                "basis": f"no own regime found (checked {CHECKED})",
                "scope": None,
                "src": [],
            }
        rec["eu_aligned"] = eu_aligned(iso)
        rec["price_cap_coalition"] = price_cap(iso)
        rec["export_controls"] = export_controls(iso)
        rec["unfriendly_list"] = unfriendly(iso)
        if iso in TERRITORY and iso != "HKG":
            # not a state: whether the sovereign's measures extend here was not checked territory by territory
            follows = f"territory of {TERRITORY[iso]}" if TERRITORY[iso] else "no single sovereign"
            if iso not in UK_OT_ORDER:
                rec["own_regime"] = {
                    "yes": None,
                    "since": None,
                    "basis": f"{follows}; no own regime found and extension of the sovereign's regime not checked",
                    "scope": None,
                    "src": [],
                }
            rec["eu_aligned"] = {"status": "not_checked_territory", "src": []}
            rec["export_controls"] = {
                "russia_controls": None,
                "basis": f"{follows}; not checked separately",
                "bis_supp3": None,
                "src": [],
            }
        if iso in POSITION:
            p = POSITION[iso]
            rec["position"] = {"stance": p[0], "date": p[1], "src": p[2]}

        # one neutral category per entry, for page wording
        if iso in EU27:
            cat = "eu_member"
        elif iso in TERRITORY:
            cat = "territory_uk_order" if iso in UK_OT_ORDER else "territory"
        elif rec["eu_aligned"]["status"].startswith("adopts_eu_measures") and iso not in ("UKR",):
            cat = "adopts_eu_measures"
        elif iso in OWN and iso != "BHS":
            cat = "own_regime"
        elif iso == "BHS":
            cat = "financial_directive_only"
        elif iso in POSITION:
            cat = "no_own_regime_stated"
        else:
            cat = "no_own_regime_found"
        if iso == "HKG":
            cat = "no_own_regime_stated"
        if iso in ("CHE", "NOR"):
            cat = "adopts_eu_measures"
        rec["category"] = cat
        rec["notes"] = NOTES.get(iso)
        rec["checked"] = CHECKED
        out[iso] = rec
        counts[cat] = counts.get(cat, 0) + 1

    summary = {
        "entries": len(out),
        "by_category": dict(sorted(counts.items(), key=lambda kv: -kv[1])),
        "own_regime_yes": sum(r["own_regime"]["yes"] is True for r in out.values()),
        "applies_eu_or_uk_regime": sum(bool(r["own_regime"].get("applies_regime")) for r in out.values()),
        "own_regime_none_found": sum(
            r["own_regime"]["yes"] is False and not r["own_regime"].get("applies_regime") for r in out.values()
        ),
        "own_regime_unknown_territory": sum(r["own_regime"]["yes"] is None for r in out.values()),
        "eu_members": sum(r["eu_aligned"]["status"] == "eu_member" for r in out.values()),
        "adopt_eu_measures_non_members": sorted(
            k for k, r in out.items() if r["eu_aligned"]["status"].startswith("adopts_eu_measures")
        ),
        "price_cap_coalition": sorted(k for k, r in out.items() if r["price_cap_coalition"]["member"]),
        "price_cap_coalition_count": sum(r["price_cap_coalition"]["member"] for r in out.values()),
        "export_controls_true": sum(r["export_controls"]["russia_controls"] is True for r in out.values()),
        "bis_supp3_in_map": sorted(k for k in supp3 if k in out),
        "bis_supp3_not_in_map": sorted(k for k in supp3 if k not in out),
        "unfriendly_listed": sum(r["unfriendly_list"]["listed"] is True for r in out.values()),
        "unfriendly_not_named_sovereign_listed": sorted(
            k for k, r in out.items() if r["unfriendly_list"]["listed"] is None
        ),
        "unfriendly_430r_not_in_map": sorted(k for k in UNFRIENDLY_430R if k not in out),
        "explicit_no_own_regime_statements": sorted(POSITION),
        "aligned_in_hr_statement_2026_508": aligned_508,
    }
    sources = [
        {
            "id": k,
            "name": v[0],
            "url": v[1],
            "type": v[2],
            "file": v[3],
            "date": dates.get((v[3] or "").split("#")[0], CHECKED),
        }
        for k, v in SOURCES.items()
    ]
    used = {s for r in out.values() for part in r.values() if isinstance(part, dict) for s in part.get("src", [])}
    assert used <= set(SOURCES), used - set(SOURCES)
    doc = {
        "generated": CHECKED,
        "about": "Sanctions status toward Russia since February 2022 for every entry in site/data.json. Neutral, verifiable parts; nothing inferred where no source was found. See sanctions_r58-notes.md.",
        "categories": CATEGORIES,
        "summary": summary,
        "unfriendly_list_text": {
            "order": "Government of Russia Order of 5 March 2022 No. 430-r, as amended 23 July 2022 (2018-r) and 29 October 2022 (3216-r); current edition 29.10.2022 per ConsultantPlus on "
            + CHECKED,
            "entries": [
                "Australia",
                "Albania",
                "Andorra",
                "Bahamas (from 23 July 2022)",
                "United Kingdom (incl. Crown Dependencies and British Overseas Territories; Jersey, Anguilla, BVI, Gibraltar named from 5 March 2022, Guernsey and Isle of Man from 23 July 2022, all from 29 October 2022)",
                "EU member states",
                "Iceland",
                "Canada",
                "Liechtenstein",
                "Micronesia",
                "Monaco",
                "New Zealand",
                "Norway",
                "Republic of Korea",
                "San Marino",
                "North Macedonia",
                "Singapore",
                "United States",
                "Taiwan",
                "Ukraine",
                "Montenegro",
                "Switzerland",
                "Japan",
            ],
            "not_this_list": "A separate Russian list (Presidential Decree 243 of 2021; Order 1230-r of 2021: USA, Czech Republic; extended July 2022 to Greece, Denmark, Slovenia, Croatia, Slovakia) limits hiring of local staff by diplomatic missions. Not used here; only search extracts were seen.",
            "src": ["ru_430r", "ru_2018r", "ru_3216r", "ru_consultant", "ru_430r_news"],
        },
        "countries": out,
        "sources": sources,
    }
    (R / "gaps" / "sanctions_r58.json").write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n")
    print(json.dumps(summary, indent=1))


CATEGORIES = {
    "eu_member": "EU member state: applies the EU's Russia sanctions (Council Regulations 833/2014, 269/2014), which it agreed to in the Council.",
    "adopts_eu_measures": "Not in the EU; adopts the EU's Russia measures under its own law (named in EU alignment statements, or national decisions saying so). '_partial' in eu_aligned.status where official sources say alignment is incomplete.",
    "own_regime": "Has its own Russia sanctions or export-control regime under national law (scope varies: Korea and Taiwan mainly export controls).",
    "financial_directive_only": "Financial regulators directed institutions to observe other jurisdictions' Russia sanctions; no own designation list found (the Bahamas).",
    "no_own_regime_stated": "No own regime found, and the government has said publicly that it does not impose sanctions of its own (statement in `position`).",
    "no_own_regime_found": "No own Russia sanctions regime found on the date checked. This is not a statement about compliance with other countries' sanctions.",
    "territory_uk_order": "British overseas territory covered by the Russia (Sanctions) (Overseas Territories) Order 2020: the UK regime applies there.",
    "territory": "Not a sovereign state; status follows the sovereign only where its law extends there, which was not checked territory by territory.",
}

NOTES = {
    "UKR": "Ukraine is the country attacked; it has its own sanctions regime and is named in EU alignment statements.",
    "BLR": "No own regime found; Belarus is itself under EU, US, UK and other sanctions for its role in the war.",
    "FSM": "Micronesia cut diplomatic ties with Russia on 25 February 2022 and is on Russia's list; no sanctions measures of its own found.",
    "KAZ": "Phrase as: no sanctions of its own; says it will not let its territory be used to get around other countries' sanctions.",
    "BMU": "British overseas territory, not in the 2020 Overseas Territories Order schedule; gives effect to UK sanctions under its own legislation (not checked this round).",
    "GIB": "British overseas territory, not in the 2020 Overseas Territories Order schedule; applies UK sanctions under its own legislation (not checked this round).",
    "HKG": "Special Administrative Region of China; acts only on UN Security Council sanctions.",
    "MAC": "Special Administrative Region of China; no own regime found.",
    "TWN": "On Russia's list as 'Taiwan (China)'. Export controls only; no general sanctions designation regime found.",
    "KOR": "Russia's list names the Republic of Korea. Measures are export controls and financial steps.",
    "SGP": "Singapore described its March 2022 measures as its first unilateral sanctions outside the UN; only export controls and financial measures.",
    "MDA": "Not on Russia's list although it adopts part of the EU's measures.",
    "BIH": "Not on Russia's list although named in EU alignment statements; implementation reported incomplete.",
    "SRB": "EU candidate that has not aligned with EU Russia sanctions.",
    "GEO": "Not aligned with EU Russia sanctions. Officials have also said Georgia will not let its territory be used to evade sanctions (not quoted here).",
    "ISL": "EEA; named in EU alignment statements; on BIS Supplement No. 3 since 12 April 2022.",
    "NOR": "EEA; aligns by national regulation and Government decision on each EU package; not a price cap coalition member (applies the cap through alignment, not checked separately).",
    "CHE": "Not in the price cap coalition list; adopted the price cap with the EU packages (not checked separately).",
    "BHS": "On Russia's list since 23 July 2022 (Order 2018-r).",
    "AND": "Start date of Andorra's own decrees not established.",
}


if __name__ == "__main__":
    main()
