# Trace: every money flow, from the source to the map

The map adds up many kinds of money. This page groups every part shown on the map into **money flows** and, for each
flow, gives one entry with the same seven items: what it is, how it is calculated, why it is done this way, the data
sources with their exact links, the research files and raw data, the code, and which values are data and which are
judgement. Every link points to the exact section, file or table.

The same groups are on the map: the **Sources** view (`#view=sources`) shows one group per flow, and the § link next to
each part in a country's panel opens that part's group, for example `#view=sources&flow=loans`. Since round 17 every part
in a country's panel also opens its method in place: how it is calculated in two or three plain sentences, why it is
done this way in one line with links to its section in [decisions.md](decisions.md) and the [decision log](decision-log.md),
that country's sources with their exact links, and links to the method page and to this page's entry for the flow
("Full trace"). The Sources view (titled "Method and sources") opens with the method in four lines and how decisions
are made, and gives each flow the same how and why. The second headline number was called "kept from Russia" from round
17 to round 21 ("change in payments to Russia" before) and "business with Russia" since round 22; the money streams on the map show the same two numbers in euros.

Status: research preview. The figures were compiled with AI assistance and have not yet been checked line by line by a
person ([decisions](decisions.md)).

## How to read an entry

- **Parts on the map**: the names in a country's panel, with the key used in `calc()` in
  [`site/index.html`](../site/index.html). A part is in the net shift, in the money flowing back, or in the cost view
  (the "Cost to the country" button, called "Cost carried" before round 15; since round 19 the site no longer shows the
  cost view, and its parts are only in the full data download, labelled;
  [overview](method/overview.md#every-part-of-the-net-shift)).
- **How it's calculated**: the method section that writes the calculation out.
- **Why it's done this way**: the rows of [decisions.md](decisions.md) (by section, with the row's name) and of the
  [decision log](decision-log.md) (by round).
- **Data sources**: the source ids in [`site/data.json`](../site/data.json) that this flow's parts cite, most cited first,
  with the confirmed exact links from [`sources_r11.json`](../research/2026-10/sources_r11.json). Inputs that feed three
  flows or more (the no-war models, Russia's net gain, the value kept, the round-11 assumptions, the audits) are listed
  once, under [Shared inputs](#shared-inputs).
- **Certainty**: the letters the parts carry across all countries (A reported, B measured estimate, C modelled
  estimate, D rough indication; [ranges](method/ranges.md#certainty-letters)).

Common to almost every trade flow: the level expected without the war ([counterfactual](method/counterfactual.md)),
volumes at pre-war prices ([prices](method/prices.md)) and the likely ranges ([ranges](method/ranges.md)).

## The flows at a glance

| flow | parts on the map | site address |
|---|---|---|
| [Aid to Ukraine](#aid-to-ukraine) | `aid`, `aidge` | `#view=sources&flow=aid` |
| [Loans and guarantees](#loans-and-guarantees) | `multilat` | `#view=sources&flow=loans` |
| [Share of EU-level aid](#share-of-eu-level-aid) | `euaid` | `#view=sources&flow=euaid` |
| [Undisclosed military aid (estimate)](#undisclosed-military-aid-estimate) | `undisc` | `#view=sources&flow=undisc` |
| [Private donations](#private-donations) | `priv` | `#view=sources&flow=priv` |
| [Hosting refugees](#hosting-refugees) | `ref` | `#view=sources&flow=ref` |
| [Flowing back from Ukraine](#flowing-back-from-ukraine) | `own`, `purl`, `othsp`, `arms`, `sell`, `refsp` (round 16) | `#view=sources&flow=flowback` |
| [Payments to Russia for fuel and goods](#payments-to-russia-for-fuel-and-goods) | `paid` | `#view=sources&flow=paid` |
| [War-time price windfall](#war-time-price-windfall) | `windfall` | `#view=sources&flow=windfall` |
| [Refined and laundered Russian oil](#refined-and-laundered-russian-oil) | `laund` | `#view=sources&flow=laund` |
| [Energy switching cost and oil discount](#energy-switching-cost-and-oil-discount) | `prem`, `disc` | `#view=sources&flow=energy` |
| [Sales to Russia](#sales-to-russia) | `sold`, `margin` | `#view=sources&flow=sold` |
| [Purchases from Ukraine](#purchases-from-ukraine) | `buy`, `tariff` | `#view=sources&flow=buy` |
| [Services and tourism](#services-and-tourism) | `svcpaid`, `svcsold` | `#view=sources&flow=services` |
| [Shipping Russian oil](#shipping-russian-oil) | `ship` | `#view=sources&flow=shipping` |
| [Company taxes in Russia](#company-taxes-in-russia) | `tax` | `#view=sources&flow=companytax` |
| [Companies leaving Russia](#companies-leaving-russia) (cost view, not in the totals, round 14b) | `exits` | `#view=sources&flow=exits` |
| [Russian-owned companies abroad](#russian-owned-companies-abroad) | `rusfirms` | `#view=sources&flow=rusfirms` |
| [Assets seized by Russia](#assets-seized-by-russia) (cost view, not in the totals, round 14b) | `seized` | `#view=sources&flow=seized` |
| [Frozen Russian reserves](#frozen-russian-reserves) (on the map: "Russian money frozen"; in the net only since round 16) | `frozen` | `#view=sources&flow=frozen` |
| [Remittances from Russia (marker)](#remittances-from-russia-marker) | none: a marker, not in the totals (`remit` in `data.json`) | `#view=sources&flow=remit` |
| [Rosatom and Russian state loans](#rosatom-and-russian-state-loans) | `statefin` | `#view=sources&flow=statefin` |
| [Weapons bought from Russia](#weapons-bought-from-russia) | `rusarms` | `#view=sources&flow=rusarms` |
| [Weapons and troops sent to Russia](#weapons-and-troops-sent-to-russia) | `mil` | `#view=sources&flow=mil` |
| [Payment agents](#payment-agents) | `agents` | `#view=sources&flow=agents` |
| [Gold and hidden payments to Russia](#gold-and-hidden-payments-to-russia) | `hidden` | `#view=sources&flow=gold` |
| [Labels and counts outside the totals](#labels-and-counts-outside-the-totals) | none (labels and counts) | `#view=sources&flow=markers` |

## Aid to Ukraine

**Round 16 (review 5):** the adjusted aid part takes Kiel's letter only where the modelled adjustments (weapons at market value, loans as gifts) are under 5% of it, B under 25%, else C (`aidCert`; [decisions](decisions.md#round-16-review-5)).

**Round 13 (audit):** The part is labelled "Kiel, adjusted: weapons at market value, loans as gifts"; the panel shows Kiel's own figure next to it (Poland EUR 5.89bn in Kiel, 3.24bn on the map). The source links to the Release 31 workbook.

**What it is:** Military, financial and humanitarian aid from governments, with donated weapons at their market value.

**Parts on the map:** Aid to Ukraine (`aid`, net shift); Aid given (loans at grant equivalent) (`aidge`, cost view).

**How it's calculated:** [aid-refugees-military.md § Aid](method/aid-refugees-military.md#aid); [Donated weapons at market value (round 5)](method/aid-refugees-military.md#donated-weapons-at-market-value-round-5); [The cost view](method/overview.md#the-cost-view).

**Why it's done this way:**

- [decisions § 2. Aid and the cost of hosting refugees](decisions.md#2-aid-and-the-cost-of-hosting-refugees): Aid from the Kiel Institute Ukraine Support Tracker
- [decisions § 2. Aid and the cost of hosting refugees](decisions.md#2-aid-and-the-cost-of-hosting-refugees): Donated weapons at market value
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Countries with no aid record
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Own-industry share of military aid where no evidence exists
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): ERA loans (repaid from frozen Russian assets) left out of the donor's aid
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Donated weapons at market value

**Data sources:**

- `aid_gaps`: Aid from countries outside the Kiel tracker: UN OCHA Financial Tracking Service and government reports
  - [UN OCHA FTS API: all funding flows to Ukraine, 2022](https://api.hpc.tools/v1/public/fts/flow?countryISO3=UKR&year=2022) (primary)
  - [Qatar MoFA: Qatar pledges USD 100 million for humanitarian assistance to Ukraine](https://mofa.gov.qa/en/qatar/latest-articles/latest-news/details/1445/01/10/qatar-pledges-usd-100-million-for-humanitarian-assistance-to-ukraine) (primary)
  - [UAE MoFA: relief flight to Ukraine](https://www.mofa.gov.ae/en/mediahub/news/2024/2/13/13-2-2024-uae-ukrain) (primary)
  - [Interfax: UAE allots USD 100 million for humanitarian aid to Ukraine](https://interfax.com/newsroom/top-stories/84198/) (press report)
  - [Singapore MFA: contribution to Ukraine (28 Feb 2022)](https://www.mfa.gov.sg/Newsroom/Press-Statements-Transcripts-and-Photos/2022/02/20220228-contribution-to-Ukraine) (primary)
- `kiel`: Kiel Institute, Ukraine Support Tracker Release 31 (published 8 Oct 2026)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Kiel Institute, Ukraine Support Tracker page](https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/) (primary)
  - [Kiel Policy Brief 217: How much aid has Germany given to Ukraine?](https://www.kielinstitut.de/publications/how-much-aid-has-germany-given-to-ukraine-20290/) (primary)
- `weapons_value`: Donated weapons at market value: GAO and DoD Inspector General (US drawdown valuation), UK National Audit Office, EU Peace Facility claims, used-equipment and munitions prices
  - [GAO-24-106934: Ukraine assistance - actions needed to properly value defense articles (PDF)](https://www.gao.gov/products/gao-24-106934) (primary)
  - [DoD OIG DODIG-2024-095: revaluation of PDA support to Ukraine](https://www.dodig.mil/reports.html/Article/3805413/audit-of-the-dods-revaluation-of-the-support-provided-to-ukraine-through-presid/) (primary)
  - [UK NAO: Investigation into military support for Ukraine (summary)](https://nao.org.uk/wp-content/uploads/2024/09/Investigation-into-military-support-for-Ukraine-Summary-1.pdf) (primary)
  - [NKÚ Slovakia: donating military property to Ukraine](https://www.nku.gov.sk/web/nku-en/-/slovakia-has-actively-helped-ukraine-by-donating-military-property) (primary)
  - [DSCA: Excess Defense Articles](https://www.dsca.mil/Programs/Defense-Trade-and-Arms-Transfers/Excess-Defense-Articles) (primary)
  - [ERR/Politico: Estonia using EPF to modernise its military](https://news.err.ee/1608928883/politico-estonia-using-epf-to-modernize-its-military) (press report)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
- `loans_value`: Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_rules`: Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived (shared input, links under [Shared inputs](#shared-inputs))
- `kiel_eu_share`: EU-level aid split over member states by their contribution to the EU budget (Kiel method)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Kiel Working Paper 2218, The Ukraine Support Tracker: which countries help Ukraine and how?](https://www.kielinstitut.de/publications/the-ukraine-support-tracker-which-countries-help-ukraine-and-how-20852/) (primary)
  - [Method: EU-level aid](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/aid-refugees-military.md#eu-level-aid) (this project's method)
- `audit`: Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`kiel.json`](../research/2026-10/kiel.json), [`kiel-notes.md`](../research/2026-10/kiel-notes.md), [`gaps/aid_gaps.json`](../research/2026-10/gaps/aid_gaps.json), [`gaps/aid_gaps-notes.md`](../research/2026-10/gaps/aid_gaps-notes.md), [`gaps/weapons_value.json`](../research/2026-10/gaps/weapons_value.json), [`gaps/weapons_value-notes.md`](../research/2026-10/gaps/weapons_value-notes.md), [`gaps/refresh_2026-notes.md`](../research/2026-10/gaps/refresh_2026-notes.md), [`gaps/audit-notes.md`](../research/2026-10/gaps/audit-notes.md), [`verify_r11_aid-notes.md`](../research/2026-10/verify_r11_aid-notes.md); raw downloads: `raw/kiel/` (not in the repository; listed with checksums in [`raw/MANIFEST.json`](../research/2026-10/raw/MANIFEST.json)).

**Code:** `build()` step 5, aid (inline), `apply_audit()`, `apply_weapons_value()`, `apply_assumptions_r11_rules()`, `calc()` in `site/index.html` (`ownAid3`, `aidge`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: Kiel's aid per donor and year (A to B where Kiel records it). Judgement: the market value of donated weapons (a factor per Kiel row), and aid for the 190 countries outside Kiel (D, with a small upper bound where no record exists). Letters across all country parts: A 67, B 23, C 40, D 276.

Known gaps:

- Aid outside the Kiel tracker is a rough indication (D) for most small donors.
- The cost-view part ("Aid given") also carries the loan values, see Loans and guarantees.

## Loans and guarantees

**What it is:** Loans count at their gift to Ukraine: the interest it saves and the default risk the lender carries, not the full amount.

**Parts on the map:** Share of new IMF, World Bank and EBRD lending (`multilat`, net shift).

**Also changes:** `aid`, `euaid`, `aidge` (see their own flows).

**How it's calculated:** [loans.md § The two parts of the gift](method/loans.md#the-two-parts-of-the-gift); [By loan type](method/loans.md#by-loan-type); [The range](method/loans.md#the-range); [The cost view](method/loans.md#the-cost-view); [New lending by the IMF and World Bank](method/loans.md#new-lending-by-the-imf-and-world-bank).

**Why it's done this way:**

- [decisions § 2. Aid and the cost of hosting refugees](decisions.md#2-aid-and-the-cost-of-hosting-refugees): Loans at their gift to Ukraine
- [decisions § Applied in round 12 (data precision)](decisions.md#applied-in-round-12-data-precision): loans: discount rate and default risk (net shift)
- [decisions § Applied in round 12 (data precision)](decisions.md#applied-in-round-12-data-precision): loans: the lender's cost (cost view)
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): What a loan costs the lender (cost view)
- [decision log § Round 12: data precision (19 October)](decision-log.md#round-12-data-precision-19-october): Value loans at opportunity cost
- [decision log § Round 12: data precision (19 October)](decision-log.md#round-12-data-precision-19-october): Gift = cheaper interest + the default risk the lender really carries
- [decision log § Round 12: data precision (19 October)](decision-log.md#round-12-data-precision-19-october): Expected loss by class
- [decision log § Round 12: data precision (19 October)](decision-log.md#round-12-data-precision-19-october): Decision B: each EU loan's expected loss is the EU's own provisioning rate
- [decisions § Applied in round 12 (data precision)](decisions.md#applied-in-round-12-data-precision): EU loans: expected loss (Decision B)

**Data sources:**

- `loans_value`: Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Regulation (EU) 2024/792 (Ukraine Facility): no provisioning and no provisioning rate set for its loans](https://eur-lex.europa.eu/eli/reg/2024/792/oj) (primary)
  - [Decision (EU) 2022/1628 (exceptional MFA EUR 5bn; repurposed EIB ELM loans EUR 1.59bn): provisioning rate 70%](https://eur-lex.europa.eu/eli/dec/2022/1628/oj) (primary)
  - [Council ST-5738-2026: Ukraine Support Loan](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf) (primary)
  - [ICU Weekly Insight 26 Jan 2026 (Eurobond yields)](https://icu.ua/download/8460/ICUWeeklyInsight-20260126-Eng.pdf) (primary)
  - [IMF: members' quotas and voting power](https://www.imf.org/en/About/executive-board/members-quotas) (primary)
  - [World Bank: IBRD country voting table](https://thedocs.worldbank.org/en/doc/a16374a6cee037e274c5e932bf9f88c6-0330032021/original/IBRDCountryVotingTable.pdf) (primary)
  - [EBRD: shareholders and board of governors](https://www.ebrd.com/shareholders-and-board-of-governors.html) (primary)
  - [Ukrinform: Ukraine prices USD 1.25bn 8-year Eurobond at 6.875% (27 Apr 2021)](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html) (primary)
  - [Interfax-Ukraine: USD 500m tap of the 2029 Eurobond at 6.30% (22 Jul 2021)](https://en.interfax.com.ua/news/economic/758134.html) (primary)
  - [ICU Weekly Insight 28 Mar 2022: Eurobond lows of 21-34 cents = yields of 37-427%](https://icu.ua/download/4058/ICUWeeklyInsight-20220328-Eng.pdf) (primary)
  - [ICU Weekly Insight 18 Dec 2023: Eurobonds at 24-31 cents](https://icu.ua/download/4446/ICUWeeklyInsight-20231218-Eng.pdf) (primary)
  - [Eavex Capital Fixed Income Weekly 22 Dec 2025: yields of the restructured Eurobonds](https://www.eavex.com.ua/wp-content/uploads/2025/12/eavex-fi-weekly-dec-22.pdf) (primary)
  - [Government of Ukraine: restructuring of USD 20.5bn Eurobonds completed (4 Sep 2024)](https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha) (primary)
  - [Government of Ukraine: memorandum with the Group of Creditors of Ukraine, debt service suspended to Feb 2030 (17 Apr 2026)](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy) (primary)
  - [French Treasury: Group of Creditors of Ukraine statement (17 Apr 2026)](https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement) (primary)
  - [IMF press release 26/66: EFF arrangement for Ukraine (26 Feb 2026)](https://www.imf.org/en/news/articles/2026/02/26/pr-26066-ukraine-imf-executive-board-approves-usd-8point1-billion-under-an-eff-arrangement) (primary)
  - [European Parliament Legislative Observatory 2022/0213(COD): exceptional MFA, provisioning 70% instead of 9%](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888) (primary)
  - [Schlegl, Trebesch and Wright: The Seniority Structure of Sovereign Debt (NBER w25793)](https://www.nber.org/papers/w25793) (primary)
  - [Interfax: Ukraine repaid USD 279.7m to the IMF in February 2026 (6 Mar 2026)](https://interfax.com/newsroom/top-stories/116503/) (primary)
  - [FRED (OECD): long-term government bond yields, 10-year, Germany (IRLTLT01DEM156N)](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01) (primary)
  - [Decision (EU) 2022/313 (emergency MFA EUR 1.2bn): loans provisioned under Regulation 2021/947](https://eur-lex.europa.eu/eli/dec/2022/313/oj) (primary)
  - [Regulation (EU) 2021/947 (NDICI), Article 31(5): provisioning rate 9% for macro-financial assistance](https://eur-lex.europa.eu/eli/reg/2021/947/oj) (primary)
  - [Decision (EU) 2022/1201 (exceptional MFA EUR 1bn): provisioning rate 70%](https://eur-lex.europa.eu/eli/dec/2022/1201/oj) (primary)
  - [Regulation (EU) 2022/2463 (MFA+ 2023, EUR 18bn): no provisioning and no provisioning rate set](https://eur-lex.europa.eu/eli/reg/2022/2463/oj) (primary)

**Research files and raw data:** [`gaps/loans_value.json`](../research/2026-10/gaps/loans_value.json), [`gaps/loans_value-notes.md`](../research/2026-10/gaps/loans_value-notes.md), [`kiel-notes.md`](../research/2026-10/kiel-notes.md); raw downloads: [`raw/loan_rates/`](../research/2026-10/raw/loan_rates/), `raw/kiel/` (not in the repository; listed with checksums in [`raw/MANIFEST.json`](../research/2026-10/raw/MANIFEST.json)).

**Code:** `apply_loans_value()`, `pipeline/loan_rates.py`, `calc()` (`loan_adj_own`, `loan_adj_eu`, `loans_grant_eq`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: loan terms (Kiel), Ukraine's 2021 bond yields, the war-time yields and the lenders' funding rates. Data and legal texts: the EU's own provisioning rate per loan (Decision B: 70% for the 2022 exceptional MFA and the repurposed EIB loans, 9% for the rest). Judgement: using a provisioning rate as the expected loss (it is a buffer, not an observed loss), 9% where the law sets no rate (MFA+, Ukraine Facility), guarantees for firms at 10/25/40% of face. Letters across all country parts: C 68.

Known gaps:

- [Loans: expected losses and the normal rate](limitations.md#open-issues-in-the-numbers) (limitations).
- The method section is [What is still judgement](method/loans.md#what-is-still-judgement).

## Share of EU-level aid

**Round 16 (review 5):** the panel's text gives the same figure as the bar (loans at their gift to Ukraine) with the face value beside it, and says why the European Peace Facility is not in it (Kiel has not counted it since version 16: it reimburses members for weapons already in their own aid). The EPF's GNI-key burden shift is not modelled ([limitations](limitations.md)).

**What it is:** Aid paid by the EU itself, split over member states by their share of the EU budget.

**Parts on the map:** Share of EU-level aid (`euaid`, net shift).

**How it's calculated:** [aid-refugees-military.md § EU-level aid](method/aid-refugees-military.md#eu-level-aid).

**Why it's done this way:**

- [decisions § 2. Aid and the cost of hosting refugees](decisions.md#2-aid-and-the-cost-of-hosting-refugees): EU-level aid split over members by their share of the EU budget
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Where EU-level military aid is spent
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Letters fixed in calc(): the share of EU-level aid always B
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): EU-level aid as its own part

**Data sources:**

- `kiel_eu_share`: EU-level aid split over member states by their contribution to the EU budget (Kiel method)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Kiel Working Paper 2218, The Ukraine Support Tracker: which countries help Ukraine and how?](https://www.kielinstitut.de/publications/the-ukraine-support-tracker-which-countries-help-ukraine-and-how-20852/) (primary)
  - [Method: EU-level aid](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/aid-refugees-military.md#eu-level-aid) (this project's method)
- `audit`: Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports (shared input, links under [Shared inputs](#shared-inputs))
- `loans_value`: Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`kiel.json`](../research/2026-10/kiel.json), [`kiel-notes.md`](../research/2026-10/kiel-notes.md), [`gaps/assumptions_r11_rules-notes.md`](../research/2026-10/gaps/assumptions_r11_rules-notes.md), [`gaps/loans_value-notes.md`](../research/2026-10/gaps/loans_value-notes.md); raw downloads: `raw/kiel/` (not in the repository; listed with checksums in [`raw/MANIFEST.json`](../research/2026-10/raw/MANIFEST.json)).

**Code:** `build()` step 5 (`eu_years`), `apply_audit()` (EU Support Loan guarantors), `apply_loans_value()` (`loan_adj_eu`), `calc()` (`eu3`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: EU institutions' aid (Kiel) and members' budget shares. Judgement: the split itself (Kiel's method) and the fixed letter B. Letters across all country parts: B 27.

Known gaps:

- The split follows budget shares, not what each member actually paid in a given year.

## Undisclosed military aid (estimate)

**What it is:** Military aid that governments did not publish, estimated from policy briefs and national reports.

**Parts on the map:** Undisclosed military aid (estimate) (`undisc`, net shift, cost view).

**How it's calculated:** [aid-refugees-military.md § Undisclosed aid and private donations](method/aid-refugees-military.md#undisclosed-aid-and-private-donations).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Undisclosed military aid](decisions.md#undisclosed-military-aid): what is counted, why, what is left out, data or judgement
- [decisions § What is data and what is estimated](decisions.md#what-is-data-and-what-is-estimated): Estimates and models: undisclosed aid
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Undisclosed military aid estimated beyond the Kiel tracker
- [decision log § Round 3–4: profit, windfall and a tested baseline (17–18 October)](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october): France's undisclosed aid for 2022–23 taken out

**Data sources:**

- `undisclosed`: Undisclosed military aid beyond the Kiel tracker: Kiel policy briefs, national reports
  - [Kiel Institute: Ukraine Support Tracker research note](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Ukraine_Support_Tracker_-_Research_Note.pdf) (primary)
  - [Kiel Institute: only EUR 41.7bn of Germany's EUR 100bn went to Ukraine](https://www.kielinstitut.de/media/news/ukraine-support-tracker-only-eur-417-billion-of-germanys-eur-100-billion-went-to-ukraine/) (primary)
  - [Public Sénat: France granted nearly EUR 3bn in aid in 2024 (Lecornu)](https://www.publicsenat.fr/actualites/international/ukraine-avec-le-degel-des-avoirs-russes-la-france-aura-accorde-pres-de-3-milliards-deuros-daides-en-2024-annonce-sebastien-lecornu) (press report)
  - [Militarnyi (Welt): a third of Ukrainian ammunition supplied from Bulgaria](https://militarnyi.com/en/news/at-the-beginning-of-the-war-a-third-of-ukrainian-ammunition-was-supplied-from-bulgaria-welt/) (press report)
  - [IAI: Italy's military aid to Ukraine](https://www.iai.it/en/node/22399) (press report)
  - [Al Jazeera: Greece prepares a military deal with Ukraine](https://www.aljazeera.com/news/2024/7/16/russian-anger-builds-as-greece-prepares-a-military-deal-with-ukraine) (press report)
- `audit2`: Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/uncovered.json`](../research/2026-10/gaps/uncovered.json), [`gaps/uncovered-notes.md`](../research/2026-10/gaps/uncovered-notes.md), [`gaps/audit2-notes.md`](../research/2026-10/gaps/audit2-notes.md); no raw download is kept for this flow.

**Code:** `build()` step 13 (inline, `uncovered.json`), `apply_audit2(..., "values")` (France) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Judgement throughout (C to D): no official totals exist; the values are estimates from Kiel policy briefs and national reports. Letters across all country parts: C 4, D 8.

Known gaps:

- No recorded reason for check 8's threshold (half of a country's Kiel military aid) ([decisions](decisions.md#undisclosed-military-aid)).

## Private donations

**What it is:** Money given to Ukraine by people and companies, from national donation totals or a model based on GDP.

**Parts on the map:** Private donations (`priv`, net shift, cost view).

**How it's calculated:** [aid-refugees-military.md § Undisclosed aid and private donations](method/aid-refugees-military.md#undisclosed-aid-and-private-donations).

**Why it's done this way:**

- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Private donations where no national total exists
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Private donations, 2022

**Data sources:**

- `private`: Private donations to Ukraine: national donation totals (DZI, DEC, Candid) and a GDP-based model elsewhere
  - [DZI press release 16 Apr 2025 (German donations for Ukraine)](https://www.dzi.de/wp-content/uploads/2025/04/DZI_PM_16Apr2025.pdf) (primary)
  - [Candid: Update - philanthropy's response to the Ukraine crisis](https://candid.org/blogs/update-philanthropys-response-to-ukraine-crisis/) (primary)
  - [Civil Society / Fundraising: DEC Ukraine humanitarian appeal raised over GBP 400m](https://fundraising.co.uk/2023/02/02/dec-ukraine-humanitarian-appeal-has-raised-over-400mn/) (press report)
  - [Hart van Nederland: Giro555 action closes with over EUR 184m for Ukraine](https://www.hartvannederland.nl/oekraine/langstlopende-giro555-actie-ooit-is-klaar-ruim-184-miljoen-voor-oekraine) (press report)
  - [Fondation de France: four years after the start of the war](https://www.carenews.com/fondation-de-france/news/quatre-ans-apres-le-debut-de-la-guerre-la-fondation-de-france-reste) (press report)
  - [Interfax-Ukraine: United24 totals](https://interfax.com.ua/news/general/1069153.html) (press report)
  - [Method: Undisclosed aid and private donations](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/aid-refugees-military.md#undisclosed-aid-and-private-donations) (this project's method)
- `assumptions_r11_people`: Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/uncovered.json`](../research/2026-10/gaps/uncovered.json), [`gaps/uncovered-notes.md`](../research/2026-10/gaps/uncovered-notes.md), [`gaps/assumptions_r11_people-notes.md`](../research/2026-10/gaps/assumptions_r11_people-notes.md); no raw download is kept for this flow.

**Code:** `build()` step 13 (inline), `apply_assumptions_r11_people()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: national donation totals (DZI, DEC, Candid) where they exist (C). Judgement: a share of GDP everywhere else (D). Letters across all country parts: C 14, D 328.

Known gaps:

- Most countries have no national total, so the part is a rough indication (D).

## Hosting refugees

**Round 16 (review 5):** the scope factor for Germany and Poland applies to 2022 only (`REFUGEE_SCOPE_YEARS`, `SCOPE_IN_CENTRAL`; Poland's hosting EUR 9.6bn → 4.9bn); the method band adds one common net cost per refugee person-year (`aid.refugee_common_years`, `meta.refugee_common_cost_eur_per_person_year`); the host's gain on refugee spending in its own economy is subtracted under [Flowing back](#flowing-back-from-ukraine) ([refugees_net-notes](../research/2026-10/gaps/refugees_net-notes.md#round-16-the-scope-gap-in-2022-only-a-common-cost-alternative-and-spending-that-flows-back)).

**What it is:** The cost of hosting refugees from Ukraine, minus the taxes working refugees pay.

**Parts on the map:** Hosting refugees (`ref`, net shift, cost view).

**How it's calculated:** [aid-refugees-military.md § Refugees](method/aid-refugees-military.md#refugees).

**Round 15:** one definition for every host, the cost to all levels of government minus refugees' taxes and contributions: Germany's federal figure and Poland's Aid Fund figure are scaled by the 2022 gap to broad estimates (OECD International Migration Outlook 2022 via the press, Kiel, Poland's Council for Cooperation with Ukraine; `REFUGEE_SCOPE` in `build_data.py`). Russia is never credited (the aggressor; ICC warrants of 17 March 2023 for the deportation of children); Belarus's hosting cost is a label, not support for Ukraine (co-belligerent, UN General Assembly resolution ES-11/1; source `co_belligerent`, field `ref_excluded`). Refugees at gross cost are a method-band alternative (`aid.refugee_gross_years`). [decisions § Round 15](decisions.md#round-15-separate-maps-named-lists-and-comparable-numbers).

**Why it's done this way:**

- [decisions § 2. Aid and the cost of hosting refugees](decisions.md#2-aid-and-the-cost-of-hosting-refugees): Refugees at net cost
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Refugee hosting cost (Romania, Bulgaria, Hungary, Belgium, Latvia, Estonia, Georgia)
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Refugee letters
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Refugees at net cost (minus refugees' taxes)

**Data sources:**

- `refugees`: Refugee hosting cost: national budget figures where reported, otherwise refugees hosted per year x cost per refugee calibrated on those budgets
  - [Eurostat migr_asytpsm: beneficiaries of temporary protection, Ukrainian citizens (API query)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/migr_asytpsm?citizen=UA&sex=T&age=TOTAL&unit=PER) (primary)
  - [UNHCR Refugee Data Finder API: Ukrainian refugees by host country, end-2025](https://api.unhcr.org/population/v1/population/?year=2025&coo=UKR&coa_all=true) (primary)
  - [EPRS briefing 775834 (Kiel estimate of EU member-state refugee spending)](https://www.europarl.europa.eu/RegData/etudes/BRIE/2025/775834/EPRS_BRI(2025)775834_EN.pdf) (primary)
  - [Bundestag Drucksache 20/13346](https://dserver.bundestag.de/btd/20/133/2013346.pdf) (primary)
  - [Rijksfinancien: Jaarverslag JenV 2024 (art. 37 reception)](https://www.rijksfinancien.nl/jaarverslag/2024/VI) (primary)
  - [NIK audit: actions to help Ukrainian citizens](https://www.nik.gov.pl/najnowsze-informacje-o-wynikach-kontroli/dzialania-na-rzecz-pomocy-obywatelom-ukrainy.html) (primary)
  - [NAO: Investigation into the Homes for Ukraine scheme](https://www.nao.org.uk/press-releases/investigation-into-homes-for-ukraine/) (primary)
  - [SEM: Fachbericht Programm S 2024](https://www.sem.admin.ch/dam/sem/de/data/integration/foerderung/programm-s/rapport-programm-s-2024.pdf.download.pdf/rapport-programm-s-2024-d.pdf) (primary)
- `refugees_net`: Refugees' taxes and contributions: Czech Labour Ministry, Polish Ministry of Finance, Lithuanian ministry, OECD and IAB employment data; Poland's Aid Fund (BGK) spending
  - [MPSV press release 24 Feb 2025: balance of Ukrainian refugees](https://mpsv.gov.cz/cms/documents/960141c9-77fe-a2a0-08eb-0935789a6a7e/TZ_bilance_UA_24022025.pdf) (primary)
  - [MPSV press release 23 Feb 2024](https://mpsv.gov.cz/documents/20142/7095934/TZ_bilance_UA_23022024_final.pdf) (primary)
  - [Polish Ministry of Finance answer to interpellation 15498](https://api.sejm.gov.pl/sejm/term10/interpellations/attachment/ATTDTDHQD/i15498-o1.pdf) (primary)
  - [Council for Cooperation with Ukraine: Polska Pomoc Ukrainie 2022-2023](https://www.gov.pl/attachment/d423e7e2-300b-480b-9dc2-208572392236) (primary)
  - [Bundestag hib: Ukrainians in employment](https://www.bundestag.de/presse/hib/kurzmeldungen-1166450) (primary)
  - [OECD/EMN Finland: employment of temporary protection holders](https://emn.fi/wp-content/uploads/Ave-Lauren_OECD_EMNFinland_2024_v2.pdf) (primary)
  - [OECD Taxing Wages 2025](https://www.oecd.org/en/publications/2025/04/taxing-wages-2025_20d1a01d.html) (primary)
- `audit`: Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_people`: Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/refugees.json`](../research/2026-10/gaps/refugees.json), [`gaps/refugees-notes.md`](../research/2026-10/gaps/refugees-notes.md), [`gaps/refugees_net.json`](../research/2026-10/gaps/refugees_net.json), [`gaps/refugees_net-notes.md`](../research/2026-10/gaps/refugees_net-notes.md), [`gaps/flowback2-notes.md`](../research/2026-10/gaps/flowback2-notes.md), [`gaps/round4b-notes.md`](../research/2026-10/gaps/round4b-notes.md), [`gaps/assumptions_r11_people-notes.md`](../research/2026-10/gaps/assumptions_r11_people-notes.md), [`verify_r11_aid-notes.md`](../research/2026-10/verify_r11_aid-notes.md); raw downloads: [`raw/eurostat_tp/`](../research/2026-10/raw/eurostat_tp/), [`raw/unhcr_verify/`](../research/2026-10/raw/unhcr_verify/), `raw/refugee_budgets/` (not in the repository; listed with checksums in [`raw/MANIFEST.json`](../research/2026-10/raw/MANIFEST.json)).

**Code:** `build()` step 6 (inline), `apply_audit()` (budgets of 27 hosts), `apply_refugees_net()`, `apply_assumptions_r11_people()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: refugee counts (Eurostat, UNHCR) and national budgets for 27 hosts. Judgement: the cost per refugee elsewhere (a calibrated model) and refugees' tax payments outside the countries that report them. Letters across all country parts: B 2, C 44, D 86.

Known gaps:

- Refugee costs outside 27 hosts are modelled; Poland's 2022 count may be low; Poland's and Czechia's costs were checked only against press ([limitations](limitations.md#open-issues-in-the-numbers)).

## Flowing back from Ukraine

**Round 16 (review 5, M3):** a new part, "Refugee hosting spent in its own economy (rent, food, services)" (`refsp`, money flowing back): the hosting cost counted × the host's net gain on services × genuinely extra (`aid.refugee_back_f`, from `net_gain_sellers.json` and `value_kept.json`), 2.7% of hosting cost overall. It is not part of the money that reached Ukraine, so it is not in the flowback total or the flow lines ([refugee spending](method/aid-refugees-military.md#refugee-spending-flowing-back-round-16)).

**Round 13 (audit):** Money flowing back counts at the seller's net gain (taxes plus profit above a normal return, OECD STAN by country and industry; [`net_gain_sellers.json`](../research/2026-10/gaps/net_gain_sellers.json)) × genuinely extra, no longer at value kept. US flowback earned back falls from EUR 44bn to 1.5bn ([decisions](decisions.md#round-13-one-valuation-rule-for-every-seller)).

**What it is:** Aid money spent in the giver's own economy, and extra sales to Ukraine, subtracted at the seller's net gain times the share that is genuinely extra.

**Parts on the map:** Own aid spent in its own economy (incl. replacing donated stock) (`own`, flowing back); Other countries' aid spent here (incl. their stock replacement) (`purl`, flowing back); Aid spent here on energy, relief and rebuilding (`othsp`, flowing back); Arms Ukraine bought here (`arms`, flowing back); Extra sales to Ukraine above the pre-war level (`sell`, flowing back); Refugee hosting spent in its own economy (rent, food, services) (`refsp`, flowing back, round 16).

**How it's calculated:** [aid-refugees-military.md § Flowback](method/aid-refugees-military.md#flowback); [Round 6: the all-money ledger](method/aid-refugees-military.md#round-6-the-all-money-ledger); [Arms Ukraine bought abroad (round 5)](method/aid-refugees-military.md#arms-ukraine-bought-abroad-round-5); [The money rule (round 6)](method/overview.md#the-money-rule-round-6).

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): Money flowing back
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Own-industry share of military aid where no evidence exists
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Where EU-level military aid is spent
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): The money rule
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): Two balances
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): All-money ledger
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Arms Ukraine bought abroad counted as money flowing back

**Data sources:**

- `value_kept`: Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies
  - [OECD TiVA 2025: domestic value added share of gross exports (SDMX)](https://sdmx.oecd.org/sti-public/rest/data/OECD.STI.PIE,DSD_TIVA_MAINSH@DF_MAINSH,1.1/EXGR_DVA..BTE+C+C19+C25+C26+C28+C302T309+GTN+H50+I.W.PT_EXGR.A?startPeriod=2018&format=csv) (primary)
  - [Federal Register 2024-01220: DFARS domestic content rule](https://www.govinfo.gov/content/pkg/FR-2024-02-15/html/2024-01220.htm) (primary)
  - [Bank of Finland Bulletin: collapse of trade with Russia had a limited effect on Finnish manufacturing](https://www.bofbulletin.fi/en/2024/3/the-collapse-of-trade-with-russia-has-had-a-limited-effect-on-finnish-manufacturing/) (primary)
  - [Hürriyet Daily News: Turkish defence local content 83%](https://www.hurriyetdailynews.com/defense-industrys-local-content-at-83-pct-gorgun-227711) (press report)
  - [Method: The money rule (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/overview.md#the-money-rule-round-6) (this project's method)
- `trade`: UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine (shared input, links under [Shared inputs](#shared-inputs))
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (shared input, links under [Shared inputs](#shared-inputs))
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (shared input, links under [Shared inputs](#shared-inputs))
- `ua_trade_cf`: Expected trade with Ukraine without the war: rolling back-tests on Ukraine's own history and on analogue partners (IMF WEO vintages, IMF DOTS)
  - [DBnomics: IMF Direction of Trade Statistics (DOT)](https://db.nomics.world/IMF/DOT) (primary)
  - [DBnomics: IMF World Economic Outlook (WEO) vintages](https://db.nomics.world/IMF/WEO:2021-10) (primary)
  - [World Bank: GDP constant USD (NY.GDP.MKTP.KD)](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD) (primary)
  - [Method: Trade with Ukraine (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#trade-with-ukraine-round-6) (this project's method)
- `money_ledger`: Where the money for Ukraine was spent: Kiel Ukraine Support Tracker item coding (release 31), CSIS, DSCA notifications, Ukraine's Ministry of Finance, replacement purchases (DoD Inspector General, NAO, government statements)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [CSIS: Where is the missing $100 billion in US aid for Ukraine?](https://www.csis.org/analysis/where-missing-100-billion-us-aid-ukraine) (primary)
  - [CRS IF12040: U.S. Security Assistance to Ukraine Since 2022](https://www.everycrsreport.com/files/2026-08-31_IF12040_b732b458ee1fe7527c3424284c4b36137ae2ee3f.html) (primary)
  - [DoD OIG DODIG-2025-137: replenishment funds](https://www.dodig.mil/reports.html/Article/4274648/audit-of-controls-over-funds-provided-for-the-replenishment-of-defense-articles/) (primary)
  - [Special IG Operation Atlantic Resolve, quarterly report to 30 Jun 2026](https://www.oversight.gov/sites/default/files/documents/reports/2026-08/OAR_Q3_Jun2026_Final_508%20SECURE_0.pdf) (primary)
  - [Bundesregierung: military deliveries to Ukraine](https://www.bundesregierung.de/breg-de/themen/krieg-in-der-ukraine/lieferungen-ukraine-2054514) (primary)
  - [Ukraine Ministry of Finance (KMU): PEACE project financing](https://www.kmu.gov.ua/en/news/minfin-43-mlrd-dol-ssha-profinansovano-na-priorytetni-vydatky-i-kvartalu-2023-roku-v-ramkakh-proektu-svitovoho-banku-peace) (primary)
  - [DSCA: Ukraine Patriot air defense system sustainment](https://www.dsca.mil/Press-Media/Major-Arms-Sales/Article-Display/Article/4290514/ukraine-patriot-air-defense-system-sustainment) (primary)
- `trend`: Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_rules`: Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/money_ledger.json`](../research/2026-10/gaps/money_ledger.json), [`gaps/money_ledger-notes.md`](../research/2026-10/gaps/money_ledger-notes.md), [`gaps/value_kept.json`](../research/2026-10/gaps/value_kept.json), [`gaps/value_kept-notes.md`](../research/2026-10/gaps/value_kept-notes.md), [`gaps/ua_arms_purchases-notes.md`](../research/2026-10/gaps/ua_arms_purchases-notes.md), [`flowback-notes.md`](../research/2026-10/flowback-notes.md), [`gaps/flowback2-notes.md`](../research/2026-10/gaps/flowback2-notes.md); no raw download is kept for this flow.

**Code:** `apply_money_ledger()`, `apply_ua_arms_purchases()`, `apply_value_kept()`, `calc()` (`backParts`, `vk()`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: where aid was spent (Kiel item coding, DSCA notifications, replacement purchases). Judgement: the value kept in the economy and the share that is genuinely extra, where no study exists. Letters across all country parts: B 17, C 220, D 56.

Known gaps:

- Aid spent on energy, relief and rebuilding may partly also appear in customs as extra sales to Ukraine ([limitations](limitations.md#open-issues-in-the-numbers)).

## Payments to Russia for fuel and goods

**Round 16 (review 5):** purchases from Russia under EUR 1bn a year in 2019–2021 start their no-war path from the 2019–2021 median at pre-war prices (round 16b; `SMALL_FLOW_EUR_BN`, `to_rus.small_flow`, `to_rus.base_years`, `to_rus.base_2021`; exceptions `SMALL_FLOW_EXCLUDE`, `SMALL_FLOW_MIRROR`, `to_rus.small_flow_kept_2021`; [counterfactual](method/counterfactual.md#small-flows-start-from-the-2019-to-2021-median-round-16-corrected-in-16b)); the world totals are worded as Russia's net gain; the redirected-trade alternative scales both sides; "required by sanctions" follows each country's actual stop date (`stop_dates_r16.json`; a label).

**Round 14 (audit 3):** Russia's gain on what was bought uses the measured fuel share (`fossil_share()`, check 22) and the country's customs values per fuel, not tracker tonnes (copied tracker years flagged in `to_rus.gain.tracker_copied`); the oil part of payments is at the Russian port (FOB), without the war-time freight surge (check 23); each year's change is valued at that year's prices (`cur`); the price levels cite the `prices` source; the cut label counts only from each cut's date and cites its evidence (`gas_cuts`) ([decisions](decisions.md#round-14-independent-audit-3)).

**Round 13 (audit):** The fuel mix now uses volumes at 2019–2021 prices (a bug had used no-war prices: Hungary −4.1 → −5.5% of GDP); gold is deflated with the gold price (Hong Kong −4.2 → −1.9%); EU refiners' exported Russian crude is charged to their buyers; the part is at best C; gas Russia cut off itself is labelled inside the second headline number ([decisions](decisions.md#round-13-one-valuation-rule-for-every-seller)).

**What it is:** Oil, gas, coal, LNG and other goods bought from Russia, against the level expected without the war, counted at Russia's net gain. Gas that Russia cut off itself is labelled.

**Parts on the map:** Less paid to Russia / More paid to Russia (`paid`, net shift).

**How it's calculated:** [overview.md § The net-gain rule (round 10)](method/overview.md#the-net-gain-rule-round-10); [Payments to Russia for fuel](method/energy-and-laundered-oil.md#payments-to-russia-for-fuel); [Transit gas](method/energy-and-laundered-oil.md#transit-gas); [The pre-war level and the comparison](method/trade.md#the-pre-war-level-and-the-comparison); [Why volumes](method/prices.md#why-volumes); [6. Which model is used for which flow](method/counterfactual.md#6-which-model-is-used-for-which-flow).

**Round 15:** business with Russia is its own map; its title gives the world total, which is Russia's net gain, not payments (round 16 wording): from buyers who cut −EUR 352.0bn<!-- n:WORLD.less -->, from buyers who bought more +EUR 215.4bn<!-- n:WORLD.more --> (`worldPaid()`). China's no-war path includes the contracted Power of Siberia ramp-up (source `power_of_siberia`, [`power_of_siberia_r15.json`](../research/2026-10/gaps/power_of_siberia_r15.json)). Method-band alternatives: redirected trade (round 16: both sides, "less paid" × 0.70<!-- n:WORLD.ratio --> and "more paid" × 0.50, so the world total stays the world's net change), without the gas Russia cut off, and 2026 at 2025 prices (`to_rus.p26`). Countries whose range or band crosses zero are not ranked.

**Why it's done this way:**

- [decisions § Round 14b: Russia's and Ukraine's normal return](decisions.md#round-14b-russias-and-ukraines-normal-return): the net-gain shares subtract 5% real + the country risk premium on measured capital (raised by the owner)
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Trade from customs data
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Purchases count at the seller's net gain
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Freight taken out
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Re-export hubs
- [decisions § 4. Energy](decisions.md#4-energy): Gas counted where it is burned
- [decisions § 1. The question and the unit](decisions.md#1-the-question-and-the-unit): Compare with what would have happened without the war
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Russia's net gain on food, wood, chemicals, steel, aluminium, other goods
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Non-reporting partners: only the paid share counts
- [decisions § Constants in the code](decisions.md#constants-in-the-code): EUR_PER_MT_2021, GAS_IN_CUSTOMS
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): Trade counts at the seller's net gain
- [decision log § Round 3–4: profit, windfall and a tested baseline (17–18 October)](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october): Expected trade without the war from models back-tested on 2008, 2013 and 2016
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Gas priced per country; gas counted where burned

**Data sources:**

- `trade`: UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine
  - [UN Comtrade API: all reporters' imports from Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' imports from Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Ukraine's own report by partner (mirror fallback), imports 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=804&period=2024&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Russia's own 2021 report by partner (mirror fallback), exports](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=643&period=2021&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [ECB Data Portal: USD/EUR annual average exchange rate (EXR.A.USD.EUR.SP00.A)](https://data-api.ecb.europa.eu/service/data/EXR/A.USD.EUR.SP00.A?startPeriod=2021&format=csvdata) (primary)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_gain`: Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_people`: Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins (shared input, links under [Shared inputs](#shared-inputs))
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (shared input, links under [Shared inputs](#shared-inputs))
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (shared input, links under [Shared inputs](#shared-inputs))
- `reexports`: Re-exports through trade hubs (UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan and others): UN Comtrade re-export flags and matched product trade
  - [UN Comtrade API: UAE (784) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=643&flowCode=RX&cmdCode=AG2) (primary)
  - [UN Comtrade API: Armenia (51) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=51&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Kazakhstan (398) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=398&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Kyrgyzstan (417) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=417&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Turkey (792) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=792&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [EBRD: trade flows between Russia, the Caucasus and Central Asia](https://www.ebrd.com/home/news-and-events/news/2023/ebrd-analyses-trade-flows-between-russia-caucasus-and-central-asia.html) (primary)
  - [Brookings: transshipments from the EU to Russia](https://www.brookings.edu/articles/transshipments-from-the-eu-to-russia) (press report)
- `gas_prices`: Russian gas prices per country: Eurostat Comext and UN Comtrade unit values, published contract prices, oil-formula estimates
  - [Eurostat Comext DS-045409 API: monthly gas imports from Russia (HS 271121, 271111), value and quantity](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=M&partner=RU&product=271121&product=271111&flow=1&indicators=VALUE_IN_EUROS&indicators=QUANTITY_IN_100KG&sinceTimePeriod=2021-01) (primary)
  - [UN Comtrade API: imports of HS 2711 from Russia, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=2711,271111,271121) (primary)
  - [FRED: Brent (POILBREUSDM)](https://fred.stlouisfed.org/series/POILBREUSDM) (primary)
  - [OSW: new Hungarian-Russian gas agreement](https://www.osw.waw.pl/en/publikacje/analyses/2021-09-29/new-hungarian-russian-gas-agreement) (press report)
  - [Prime Press: price of Russian gas for Belarus in 2021](https://primepress.by/news/ekonomika/price_of_russia_s_gas_for_belarus_up_1_2_to_128_5_per_1_000_cubic_meters_in_2021-28396/) (press report)
  - [Method: Gas prices per country](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/prices.md#gas-prices-per-country) (this project's method)
- `transit_gas`: Russian gas by country of final use (Eurostat imports by origin, ENTSOG flows, CREA), passed on from transit countries
  - [Eurostat nrg_ti_gas: imports of natural gas by partner (table view)](https://ec.europa.eu/eurostat/databrowser/view/nrg_ti_gas/default/table) (primary)
  - [Eurostat nrg_ti_gasm API: monthly gas imports from Russia (million m3)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_gasm?format=JSON&partner=RU&siec=G3000&unit=MIO_M3) (primary)
  - [Eurostat nrg_te_gas API: gas exports by partner](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_te_gas) (primary)
  - [Eurostat nrg_cb_gas API: gas supply balance](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_gas) (primary)
  - [UN Comtrade API: imports of HS 2711 (gas) from Russia](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=2711,271111,271121) (primary)
- `audit2`: Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports (shared input, links under [Shared inputs](#shared-inputs))
- `nonreport`: Trade with Russia for partners that do not report (Cuba, Venezuela, Syria, Libya, Iran...): tanker tracking, official statements
  - [CREA Russia Fossil Tracker API: Russian fossil-fuel exports by destination](https://api.russiafossiltracker.com/v0/counter?format=csv&date_from=2021-01-01&date_to=2026-10-17&aggregate_by=year,destination_iso2,destination_country,commodity_group&commodity_grouping=split_gas_oil&currency=EUR) (primary)
  - [Turkmenistan state oil and gas portal: trade turnover with Russia up 13% in 2023](https://oilgas.gov.tm/en/posts/news/10897/trade-turnover-between-turkmenistan-and-russia-increased-by-13-in-2023) (primary)
  - [TASS: Russia-Iran trade figures](https://tass.com/economy/1949413) (press report)
  - [Interfax: Russia-Cuba trade](https://interfax.com/newsroom/top-stories/91271/) (press report)
  - [Interfax: Russia-Tajikistan trade](https://interfax.com/newsroom/top-stories/114209/) (press report)
  - [NK News: Russia-North Korea trade hit record USD 34m in 2024 (official)](https://www.nknews.org/2025/06/russia-north-korea-trade-hit-record-34m-in-2024-on-food-and-fuel-official) (press report)
- `trend`: Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life (shared input, links under [Shared inputs](#shared-inputs))
- `narrow`: Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS) (shared input, links under [Shared inputs](#shared-inputs))
- `refining`: Russian crude refined in Turkey and India and exported as fuel: refinery reports, UN Comtrade, CREA, Global Witness
  - [UN Comtrade API: Turkey's exports of HS 2710, 2022-2025](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=792&cmdCode=2710&flowCode=X&period=2024) (primary)
  - [UN Comtrade API: India's exports of HS 2710, 2022-2025](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=699&cmdCode=2710&flowCode=X&period=2024) (primary)
  - [Tüpraş Q4 2024 results webcast presentation](https://www.tupras.com.tr/assets/uploads/investor-relations/presentation/tupras-q424-results-webcast-presentation.pdf) (primary)
  - [CREA/CSD: A Kremlin pit stop (Turkish ports)](https://energyandcleanair.org/wp/wp-content/uploads/2024/06/CREA_CSD_A-Kremlin-pit-stop_The-EU-imported-EUR-3-bn-of-oil-products-from-Turkish-ports-handling-Russian-oil_Final.pdf) (primary)
  - [CREA: Refined oil analysis (Feb 2024, rev. Apr 2024)](https://energyandcleanair.org/wp/wp-content/uploads/2024/04/CREA_PCC_Refined-Oil-Analysis_19.02.2024_Rev_15.04.2024.pdf) (primary)
  - [Global Witness: Shell and Vitol bring Russian-origin diesel into Europe](https://globalwitness.org/en/campaigns/fossil-fuels/shell-vitol-bring-russian-origin-diesel-into-europe-despite-swearing-off-russian-oil/) (press report)
- `residual`: GDP gaps (UNSD, UN WPP, CEPAL), Russia's import gap by country of origin, Hong Kong gold composition
  - [UN WPP 2024: population indicators (standard projections, Excel)](https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx) (primary)
  - [UNSD National Accounts - Analysis of Main Aggregates (AMA) file](https://unstats.un.org/unsd/amaapi/api/file/2) (primary)
  - [World Bank API: GDP (NY.GDP.MKTP.CD) for Cuba, Eritrea, Syria and others](https://api.worldbank.org/v2/country/CUB;ERI;SYR;GUM;ASM;MNP/indicator/NY.GDP.MKTP.CD) (primary)
  - [Method: Residual gap](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/trade.md#residual-gap) (this project's method)
- `laundered_r6`: Brunei's Hengyi refinery and Turkish ports relabelling Russian fuel: CREA, CSD, Eurostat Comext, UN Comtrade, Kpler-based reporting
  - [CREA/CSD: A Kremlin pit stop - EU imported EUR 3bn of oil products from Turkish ports handling Russian oil](https://energyandcleanair.org/wp/wp-content/uploads/2024/05/CREA_CSD_A-Kremlin-pit-stop_The-EU-imported-EUR-3-bn-of-oil-products-from-Turkish-ports-handling-Russian-oil.pdf) (primary)
  - [CREA/CSD: Turkish refineries analysis (Sep 2024)](https://csd.eu/fileadmin/user_upload/publications_library/files/2024_9/FINAL_CREA_CSD_Analysis_Turkish-Refineries_09.2024.pdf) (primary)
  - [CREA Russia Fossil Tracker API: Russian exports to Brunei by commodity and month](https://api.russiafossiltracker.com/v0/counter?destination_iso2=BN&aggregate_by=destination_iso2,commodity,month) (primary)
  - [UN Comtrade API: Brunei's exports of HS 2710](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=96&cmdCode=2710&flowCode=X&period=2024) (primary)
  - [CREA: August 2026 monthly analysis of Russian fossil fuel exports](https://energyandcleanair.org/august-2026-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/) (primary)
  - [KSE Institute: the refining loophole (June 2026)](https://institute.kse.ua/wp-content/uploads/2026/06/kse_refining_loophole_eng_june_2026.pdf) (primary)

**Research files and raw data:** [`gaps/trade_full.json`](../research/2026-10/gaps/trade_full.json), [`gaps/trade_full-notes.md`](../research/2026-10/gaps/trade_full-notes.md), [`crea-notes.md`](../research/2026-10/crea-notes.md), [`gaps/energy2-notes.md`](../research/2026-10/gaps/energy2-notes.md), [`gaps/gas_prices-notes.md`](../research/2026-10/gaps/gas_prices-notes.md), [`gaps/prices-notes.md`](../research/2026-10/gaps/prices-notes.md), [`gaps/net_gain_russia-notes.md`](../research/2026-10/gaps/net_gain_russia-notes.md), [`gaps/counterfactual-notes.md`](../research/2026-10/gaps/counterfactual-notes.md), [`gaps/to_rus_cf-notes.md`](../research/2026-10/gaps/to_rus_cf-notes.md), [`gaps/nonreport-notes.md`](../research/2026-10/gaps/nonreport-notes.md), [`gaps/reexports-notes.md`](../research/2026-10/gaps/reexports-notes.md), [`verify_r11_trade-notes.md`](../research/2026-10/verify_r11_trade-notes.md); raw downloads: [`raw/comtrade/`](../research/2026-10/raw/comtrade/), [`raw/crea/`](../research/2026-10/raw/crea/), [`raw/eurostat/`](../research/2026-10/raw/eurostat/).

**Code:** `build()` steps 1, 3, 4, 7, 11 (inline), `remove_freight()`, `price_indices()`, `apply_reexports()`, `apply_residual()`, `baltic_transit()`, `counterfactual()`, `apply_nowar_prices()`, `apply_net_gain()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: customs trade (UN Comtrade, Eurostat), CREA fuel payments, price indices. Model: the level expected without the war (back-tested). Judgement: Russia's net gain for some goods groups, hub margins. Letters across all country parts: C 224, D 2.

Known gaps:

- 2025-2026 partner data incomplete; 2026 estimated from 2025 (`*`).
- Belarus's range still crosses zero.
- Net-gain shares rest on tax totals and margins ([limitations](limitations.md#open-issues-in-the-numbers)).

## War-time price windfall

**Round 14 (audit 3, C3):** FOB against FOB: the freight surge is taken out of customs unit values with the project's measured freight on Russian oil ([prices § One price basis](method/prices.md#one-price-basis-fob-round-14)); the windfall cites `shipping` for the freight. India's windfall moves from EUR 10.7bn extra paid to EUR 11.0bn paid below the no-war price.

**Round 13 (audit):** Counted at Russia's net gain on the extra price (1 for oil and pipeline gas, 0.68–0.74 for LNG, at most the coal rent for coal), not at 100%; the full value is kept for the method band. Türkiye's 0.7/0.3 gas weights: sensitivity −3.18 to −2.98 ([decisions](decisions.md#round-13-one-valuation-rule-for-every-seller)).

**What it is:** The extra Russia earned because fuel prices rose with the war, at Russia's net gain on that extra price (all of it for oil and pipeline gas, less for LNG and coal).

**Parts on the map:** Extra paid to Russia because of war-time prices / Paid Russia less than no-war prices (discounts, price cap) (`windfall`, net shift).

**How it's calculated:** [prices.md § War-time windfall](method/prices.md#war-time-windfall); [No-war prices (round 7)](method/prices.md#no-war-prices-round-7); [Gas prices per country](method/prices.md#gas-prices-per-country).

**Round 15:** the windfall is named on cards and panels when it is more than half of the number for business with Russia (Hungary: EUR 9.9bn of 11.6bn, mostly 2022). Method-band alternatives: without the windfall, and 2026 at 2025 prices (the Hormuz crisis, source `hormuz`; [prices § 2026 and the Hormuz crisis](method/prices.md#2026-and-the-hormuz-crisis-round-15)).

**Why it's done this way:**

- [decisions § 4. Energy](decisions.md#4-energy): War-time price premium counts in full
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): 2026 no-war price = the actual world price
- [decision log § Round 3–4: profit, windfall and a tested baseline (17–18 October)](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october): War-time price windfall on Russian fuel counts toward Russia for every buyer
- [decision log § Round 7: what the owner asked to add (18 October)](decision-log.md#round-7-what-the-owner-asked-to-add-18-october): No-war energy prices (pre-invasion forecasts and futures)

**Data sources:**

- `windfall`: War-time price windfall on Russian fuel: payments minus the same volume at the prices a no-war market expected (pre-invasion forecasts and futures: IMF, World Bank, EIA, ECB, ICE)
  - [IMF WEO Update January 2022 (text)](https://www.imf.org/-/media/files/publications/weo/2022/update/january/english/text.pdf) (primary)
  - [World Bank Commodity Markets Outlook October 2021, forecasts](https://thedocs.worldbank.org/en/doc/ff5bad98f52ffa2457136bbef5703ddb-0350012021/related/CMO-October-2021-forecasts.pdf) (primary)
  - [EIA Short-Term Energy Outlook January 2022 (base xlsx)](https://www.eia.gov/outlooks/steo/archives/jan22_base.xlsx) (primary)
  - [Eurosystem staff projections December 2021 (PDF)](https://www.ecb.europa.eu/pub/pdf/other/ecb.projections202112_eurosystemstaff~32e481d712.en.pdf) (primary)
  - [European Commission Winter 2022 interim forecast (ip169)](https://economy-finance.ec.europa.eu/system/files/2022-02/ip169_en.pdf) (primary)
  - [European Commission Spring 2022 forecast (ip173)](https://economy-finance.ec.europa.eu/system/files/2022-05/ip173_en.pdf) (primary)
  - [FRED: Australian coal price (PCOALAUUSDM)](https://fred.stlouisfed.org/series/PCOALAUUSDM) (primary)
  - [Method: War-time windfall](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/prices.md#war-time-windfall) (this project's method)
- `gas_prices`: Russian gas prices per country: Eurostat Comext and UN Comtrade unit values, published contract prices, oil-formula estimates
  - [Eurostat Comext DS-045409 API: monthly gas imports from Russia (HS 271121, 271111), value and quantity](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=M&partner=RU&product=271121&product=271111&flow=1&indicators=VALUE_IN_EUROS&indicators=QUANTITY_IN_100KG&sinceTimePeriod=2021-01) (primary)
  - [UN Comtrade API: imports of HS 2711 from Russia, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=2711,271111,271121) (primary)
  - [FRED: Brent (POILBREUSDM)](https://fred.stlouisfed.org/series/POILBREUSDM) (primary)
  - [OSW: new Hungarian-Russian gas agreement](https://www.osw.waw.pl/en/publikacje/analyses/2021-09-29/new-hungarian-russian-gas-agreement) (press report)
  - [Prime Press: price of Russian gas for Belarus in 2021](https://primepress.by/news/ekonomika/price_of_russia_s_gas_for_belarus_up_1_2_to_128_5_per_1_000_cubic_meters_in_2021-28396/) (press report)
  - [Method: Gas prices per country](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/prices.md#gas-prices-per-country) (this project's method)

**Research files and raw data:** [`gaps/energy_nowar.json`](../research/2026-10/gaps/energy_nowar.json), [`gaps/energy_nowar-notes.md`](../research/2026-10/gaps/energy_nowar-notes.md), [`gaps/prices-notes.md`](../research/2026-10/gaps/prices-notes.md), [`gaps/gas_prices-notes.md`](../research/2026-10/gaps/gas_prices-notes.md); raw downloads: [`raw/crea/`](../research/2026-10/raw/crea/).

**Code:** `war_windfall()`, `apply_nowar_prices()`, `fuel_share_year()`, `gas_index()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: fuel prices paid (customs unit values, CREA) and pre-invasion forecasts and futures. Judgement: the 2026 no-war price equals the actual world price (the Hormuz closure). Letters across all country parts: C 194.

Known gaps:

- The no-war gas price rests on late-2021 futures, which already held the autumn-2021 squeeze ([limitations](limitations.md#open-issues-in-the-numbers)).

## Refined and laundered Russian oil

**Round 13b (owner):** a change in the EU-refined route counts for a buyer only where both the pre-war and the post-war route are measured for it (EU members' customs; buyers named in India's, Türkiye's and the UAE's post-war export records or among Togo's buyers, unless a cap sets their value). Elsewhere the route's 2023–2026 values are held at the expected level and labelled "route not measured after 2022" ([energy](method/energy-and-laundered-oil.md#eu-refined-fuel-measured-both-ways-round-13b), [decisions](decisions.md#round-13b-remittances-as-a-marker-laundered-oil-routes)). Togo +6.61 → −0.05, Tunisia −5.51 → −7.09; EU members unchanged.

**Round 13 (audit):** EU refiners (Lithuania, Finland, the Netherlands and 13 others) are treated like India's: their buyers are charged, before and after the war (buyers from each refiner's UN Comtrade HS 2710 exports, [raw/comtrade_2710](../research/2026-10/raw/comtrade_2710/)). Laundered oil is in volumes at the no-war crude price and counts both ways ([decisions](decisions.md#round-13-refiners-and-laundered-oil)).

**What it is:** Fuel made from Russian crude in other countries, EU refiners included, or passed on by trading hubs, charged to the final buyer, in volumes against its pre-war level.

**Parts on the map:** Russian oil bought via other countries (`laund`, net shift).

**How it's calculated:** [energy-and-laundered-oil.md § Laundered oil](method/energy-and-laundered-oil.md#laundered-oil); [Hub resale chain](method/energy-and-laundered-oil.md#hub-resale-chain); [Valuing and capping](method/energy-and-laundered-oil.md#valuing-and-capping); [Refiners: counted once](method/energy-and-laundered-oil.md#refiners-counted-once).

**Why it's done this way:**

- [decisions § 4. Energy](decisions.md#4-energy): Fuel refined from Russian crude charged to the final buyer
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Laundered-oil cap of 1% (middle) and 2% (high) of GDP a year
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Letters fixed in calc(): Russian oil bought via other countries always C
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): UAE, Panama, Malta bunkers; laundered-oil cap per territory
- [decisions § Applied in round 12 (data precision)](decisions.md#applied-in-round-12-data-precision): China's crude-to-fuel ratio
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): The buyer whose demand creates the sale pays the crude money
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): Measure the crude share per refiner and year
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Count refined fuel once
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Laundered oil per EU member from customs data

**Data sources:**

- `laundered`: Laundered oil: fuel made from Russian crude, assigned to the final buyer (trading hubs pass on what they resell), valued at the Russian crude inside it
  - [CREA: Refined oil analysis, price-cap coalition imports of products from Russian crude (Feb 2024, rev. Apr 2024)](https://energyandcleanair.org/wp/wp-content/uploads/2024/04/CREA_PCC_Refined-Oil-Analysis_19.02.2024_Rev_15.04.2024.pdf) (primary)
  - [CREA: Four years of invasion (24 Feb 2026)](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) (primary)
  - [CREA: The Laundromat (Apr 2023)](https://energyandcleanair.org/wp/wp-content/uploads/2023/04/CREA_The-Laundromat_How-the-price-cap-coalition-whitewashes-Russian-oil-in-third-countries.pdf) (primary)
  - [UN Comtrade API: India's exports of refined products (HS 2710), 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=699&period=2024&flowCode=X&cmdCode=2710) (primary)
  - [UN Comtrade API: Turkey's exports of HS 2710, 2022-2025](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=792&cmdCode=2710&flowCode=X&period=2024) (primary)
  - [Global Witness: EU purchases of laundered Russian oil worth an estimated EUR 1.1bn to the Kremlin in 2023](https://globalwitness.org/en/campaigns/fossil-fuels/eu-purchases-of-laundered-russian-oil-worth-an-estimated-11-billion-to-the-kremlin-in-2023/) (press report)
  - [Method: Laundered oil](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/energy-and-laundered-oil.md#laundered-oil) (this project's method)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_hubs`: Round 11: fuel hubs and flag registries (Eurostat oil balances, UN Comtrade own and partner records, port bunker sales), laundered-oil caps from fuel use, Belgian company tax 2022
  - no confirmed link
- `laundered_eu`: Fuel made from Russian crude per EU member: Eurostat Comext HS 2710 imports by origin, refinery Russian-crude shares, CREA per-country checks
  - [Eurostat Comext DS-045409 API (EU trade by HS, partner, reporter)](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=A&reporter=DE&partner=IN&product=2710&flow=1&indicators=VALUE_IN_EUROS&time=2024) (primary)
  - [CREA: Refined oil analysis (Feb 2024, rev. Apr 2024)](https://energyandcleanair.org/wp/wp-content/uploads/2024/04/CREA_PCC_Refined-Oil-Analysis_19.02.2024_Rev_15.04.2024.pdf) (primary)
  - [CREA/CSD: Turkish refineries analysis (Sep 2024)](https://csd.eu/fileadmin/user_upload/publications_library/files/2024_9/FINAL_CREA_CSD_Analysis_Turkish-Refineries_09.2024.pdf) (primary)
  - [KSE Institute: the refining loophole (June 2026)](https://institute.kse.ua/wp-content/uploads/2026/06/kse_refining_loophole_eng_june_2026.pdf) (primary)
  - [CREA: Four years of invasion (24 Feb 2026)](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) (primary)
  - [Global Witness: EU purchases of laundered Russian oil (2023)](https://www.globalwitness.org/en/campaigns/fossil-gas/eu-purchases-of-laundered-russian-oil-worth-an-estimated-11-billion-to-the-kremlin-in-2023/) (press report)

**Research files and raw data:** [`gaps/laundered_eu.json`](../research/2026-10/gaps/laundered_eu.json), [`gaps/laundered_eu-notes.md`](../research/2026-10/gaps/laundered_eu-notes.md), [`gaps/hub_buyers-notes.md`](../research/2026-10/gaps/hub_buyers-notes.md), [`gaps/hub_exports_2024.json`](../research/2026-10/gaps/hub_exports_2024.json), [`gaps/crude_content-notes.md`](../research/2026-10/gaps/crude_content-notes.md), [`gaps/laundered_r6-notes.md`](../research/2026-10/gaps/laundered_r6-notes.md), [`gaps/assumptions_r11_hubs-notes.md`](../research/2026-10/gaps/assumptions_r11_hubs-notes.md), [`gaps/energy-notes.md`](../research/2026-10/gaps/energy-notes.md), [`gaps/round4a-notes.md`](../research/2026-10/gaps/round4a-notes.md); raw downloads: [`raw/comtrade/`](../research/2026-10/raw/comtrade/).

**Code:** `reassign_laundered_oil()`, `apply_laundered_eu()`, `apply_laundered_r6()`, `apply_assumptions_r11_laundered()`, `crude_k()`, `apply_net_gain()` (`laund_gain`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: fuel imports by origin (Eurostat Comext, UN Comtrade), crude share per refiner and year. Judgement: hub resale and bunker shares, the cap per territory where fuel use is not measured. Fixed at C. Letters across all country parts: C 214.

Known gaps:

- Hub resale shares are estimates; Wikipedia is cited for Gibraltar's bunker sales (`energy2.json`) ([limitations](limitations.md#open-issues-in-the-numbers)).

## Energy switching cost and oil discount

**What it is:** Cost view only: the extra paid to replace Russian energy, and the discount gained on Russian oil.

**Parts on the map:** Extra paid to replace Russian energy (`prem`, cost view); Discount gained on Russian oil (`disc`, cost view).

**How it's calculated:** [energy-and-laundered-oil.md § Energy premium and oil discount](method/energy-and-laundered-oil.md#energy-premium-and-oil-discount); [The cost view](method/overview.md#the-cost-view).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Energy switching cost and oil discount](decisions.md#energy-switching-cost-and-oil-discount): what is counted, why, what is left out, data or judgement
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Energy switching cost; Discount gained on Russian oil
- [decision log § Round 7: what the owner asked to add (18 October)](decision-log.md#round-7-what-the-owner-asked-to-add-18-october): Oil discount gain without Russia's normal pre-war discount

**Data sources:**

- `energy`: Energy switching cost, oil discounts and laundered oil: modelled per fuel from CREA, Eurostat, Comtrade and market prices
  - [CREA Russia Fossil Tracker API: monthly exports by destination and commodity (EUR, USD)](https://api.russiafossiltracker.com/v0/counter?format=csv&date_from=2021-01-01&date_to=2026-08-31&aggregate_by=month,destination_iso2,destination_country,commodity&currency=EUR,USD) (primary)
  - [CREA Russia Fossil Tracker API: modelled Russian export prices](https://api.russiafossiltracker.com/v0/price?format=csv&date_from=2021-01-01&date_to=2026-08-31&scenario=default) (primary)
  - [FRED: Brent crude price (DCOILBRENTEU)](https://fred.stlouisfed.org/series/DCOILBRENTEU) (primary)
  - [Eurostat nrg_ti_gas API: EU27 gas imports from Russia and total (TJ GCV)](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_gas?format=JSON&geo=EU27_2020&partner=RU&partner=TOTAL&siec=G3000&unit=TJ_GCV) (primary)
  - [UN Comtrade API: imports of crude oil (HS 2709) from Russia, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2023&partnerCode=643&flowCode=M&cmdCode=2709) (primary)
  - [CREA: Four years of invasion (24 Feb 2026)](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) (primary)
  - [CREA: Third year of invasion (revised 10 Apr 2025)](https://energyandcleanair.org/wp/wp-content/uploads/2025/04/CREA_Analysis_Third-year-of-invasion_24.02.2025_REVISED_10.04.2025.pdf) (primary)
  - [CREA Russia Fossil Tracker methodology](https://www.russiafossiltracker.com/methodology/) (primary)

**Research files and raw data:** [`gaps/energy.json`](../research/2026-10/gaps/energy.json), [`gaps/energy-notes.md`](../research/2026-10/gaps/energy-notes.md), [`crea-notes.md`](../research/2026-10/crea-notes.md); raw downloads: [`raw/crea/`](../research/2026-10/raw/crea/).

**Code:** `build()` step 7, energy (inline) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Model (C): switching cost and discount modelled per fuel from CREA, Eurostat, Comtrade and market prices. Letters across all country parts: C 222, D 14.

Known gaps:

- No recorded reason for leaving out new infrastructure such as floating LNG terminals ([decisions](decisions.md#energy-switching-cost-and-oil-discount)).

## Sales to Russia

**Round 13 (audit):** At the seller's net gain × genuinely extra (manufacturing: OECD median 0.013 in round 13, 0.027 in round 14 with a 5% real normal return), not value kept × genuinely extra; China's extra sales now count at 0.008 instead of 0.485 ([decisions](decisions.md#round-13-one-valuation-rule-for-every-seller)).

**What it is:** Goods sold to Russia, counted at the seller's net gain (taxes plus profit above a normal return) times the share that is genuinely extra.

**Parts on the map:** Income from extra sales to Russia / Income lost on sales to Russia given up (`sold`, net shift); Income lost on sales to Russia (goods and services) (`margin`, cost view).

**How it's calculated:** [trade.md § Profit, not revenue](method/trade.md#profit-not-revenue); [Residual gap](method/trade.md#residual-gap); [Re-export hubs](method/trade.md#re-export-hubs); [The money rule (round 6)](method/overview.md#the-money-rule-round-6).

**Why it's done this way:**

- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Sales to Russia count at the seller's income
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Re-export hubs
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Lost sales to Russia, share not redirected
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Hub trading margins
- [decision log § Round 3–4: profit, windfall and a tested baseline (17–18 October)](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october): Sales to Russia count as the seller's profit, not revenue
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): The money rule

**Data sources:**

- `trade`: UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine
  - [UN Comtrade API: all reporters' imports from Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' imports from Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Ukraine's own report by partner (mirror fallback), imports 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=804&period=2024&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Russia's own 2021 report by partner (mirror fallback), exports](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=643&period=2021&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [ECB Data Portal: USD/EUR annual average exchange rate (EXR.A.USD.EUR.SP00.A)](https://data-api.ecb.europa.eu/service/data/EXR/A.USD.EUR.SP00.A?startPeriod=2021&format=csvdata) (primary)
- `value_kept`: Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies (shared input, links under [Shared inputs](#shared-inputs))
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (shared input, links under [Shared inputs](#shared-inputs))
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_rules`: Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived (shared input, links under [Shared inputs](#shared-inputs))
- `residual`: GDP gaps (UNSD, UN WPP, CEPAL), Russia's import gap by country of origin, Hong Kong gold composition
  - [UN WPP 2024: population indicators (standard projections, Excel)](https://population.un.org/wpp/assets/Excel%20Files/1_Indicator%20(Standard)/EXCEL_FILES/1_General/WPP2024_GEN_F01_DEMOGRAPHIC_INDICATORS_COMPACT.xlsx) (primary)
  - [UNSD National Accounts - Analysis of Main Aggregates (AMA) file](https://unstats.un.org/unsd/amaapi/api/file/2) (primary)
  - [World Bank API: GDP (NY.GDP.MKTP.CD) for Cuba, Eritrea, Syria and others](https://api.worldbank.org/v2/country/CUB;ERI;SYR;GUM;ASM;MNP/indicator/NY.GDP.MKTP.CD) (primary)
  - [Method: Residual gap](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/trade.md#residual-gap) (this project's method)
- `audit2`: Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports (shared input, links under [Shared inputs](#shared-inputs))
- `services`: Services trade with Russia (tourism, transport, business services): Eurostat, OECD-WTO BaTiS, Bank of Russia
  - [OECD-WTO BaTiS SDMX API: services trade with Russia, all partners](https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_BATIS@DF_BATIS,1.0/.RUS...S...?startPeriod=2010&endPeriod=2021) (primary)
  - [Eurostat bop_its6_det API: EU services trade with Russia](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_its6_det?partner=RU&bop_item=S&currency=MIO_EUR) (primary)
  - [Eurostat bop_its6_det (table view)](https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
- `reexports`: Re-exports through trade hubs (UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan and others): UN Comtrade re-export flags and matched product trade
  - [UN Comtrade API: UAE (784) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=643&flowCode=RX&cmdCode=AG2) (primary)
  - [UN Comtrade API: Armenia (51) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=51&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Kazakhstan (398) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=398&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Kyrgyzstan (417) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=417&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [UN Comtrade API: Turkey (792) trade with World and Russia by HS chapter, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=792&period=2023&partnerCode=0,643&flowCode=X,M&cmdCode=AG2) (primary)
  - [EBRD: trade flows between Russia, the Caucasus and Central Asia](https://www.ebrd.com/home/news-and-events/news/2023/ebrd-analyses-trade-flows-between-russia-caucasus-and-central-asia.html) (primary)
  - [Brookings: transshipments from the EU to Russia](https://www.brookings.edu/articles/transshipments-from-the-eu-to-russia) (press report)
- `nonreport`: Trade with Russia for partners that do not report (Cuba, Venezuela, Syria, Libya, Iran...): tanker tracking, official statements
  - [CREA Russia Fossil Tracker API: Russian fossil-fuel exports by destination](https://api.russiafossiltracker.com/v0/counter?format=csv&date_from=2021-01-01&date_to=2026-10-17&aggregate_by=year,destination_iso2,destination_country,commodity_group&commodity_grouping=split_gas_oil&currency=EUR) (primary)
  - [Turkmenistan state oil and gas portal: trade turnover with Russia up 13% in 2023](https://oilgas.gov.tm/en/posts/news/10897/trade-turnover-between-turkmenistan-and-russia-increased-by-13-in-2023) (primary)
  - [TASS: Russia-Iran trade figures](https://tass.com/economy/1949413) (press report)
  - [Interfax: Russia-Cuba trade](https://interfax.com/newsroom/top-stories/91271/) (press report)
  - [Interfax: Russia-Tajikistan trade](https://interfax.com/newsroom/top-stories/114209/) (press report)
  - [NK News: Russia-North Korea trade hit record USD 34m in 2024 (official)](https://www.nknews.org/2025/06/russia-north-korea-trade-hit-record-34m-in-2024-on-food-and-fuel-official) (press report)
- `trend`: Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life (shared input, links under [Shared inputs](#shared-inputs))
- `narrow`: Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS) (shared input, links under [Shared inputs](#shared-inputs))
- `trend2`: Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports (shared input, links under [Shared inputs](#shared-inputs))
- `audit`: Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/trade_full-notes.md`](../research/2026-10/gaps/trade_full-notes.md), [`gaps/value_kept-notes.md`](../research/2026-10/gaps/value_kept-notes.md), [`gaps/reexports-notes.md`](../research/2026-10/gaps/reexports-notes.md), [`gaps/residual-notes.md`](../research/2026-10/gaps/residual-notes.md), [`gaps/counterfactual-notes.md`](../research/2026-10/gaps/counterfactual-notes.md), [`gaps/assumptions_r11_rules-notes.md`](../research/2026-10/gaps/assumptions_r11_rules-notes.md); raw downloads: [`raw/comtrade/`](../research/2026-10/raw/comtrade/), [`raw/eurostat/`](../research/2026-10/raw/eurostat/).

**Code:** `build()` step 3 (inline), `apply_reexports()`, `apply_residual()`, `counterfactual()`, `apply_value_kept()`, `calc()` (`earned3`) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: customs exports to Russia. Model: the expected level without the war. Data: OECD STAN net gain by industry (OECD median outside STAN). Judgement: genuinely extra where no study exists, and hub margins. Letters across all country parts: C 390, D 7.

Known gaps:

- Hub margins and re-export shares are educated guesses ([limitations](limitations.md#open-issues-in-the-numbers)).

## Purchases from Ukraine

**Round 13 (audit):** At best C (a modelled no-war level × a modelled gain); yearly changes summed with their signs, only the total floored at zero.

**What it is:** Extra goods bought from Ukraine, counted at Ukraine's net gain; the cost view adds the import duties dropped.

**Parts on the map:** Extra purchases from Ukraine (`buy`, net shift); Import tariffs dropped for Ukraine (`tariff`, cost view).

**How it's calculated:** [overview.md § The net-gain rule (round 10)](method/overview.md#the-net-gain-rule-round-10); [Trade with Ukraine (round 6)](method/counterfactual.md#trade-with-ukraine-round-6); [The cost view](method/overview.md#the-cost-view).

**Why it's done this way:**

- [decisions § Round 14b: Russia's and Ukraine's normal return](decisions.md#round-14b-russias-and-ukraines-normal-return): the net-gain shares subtract 5% real + the country risk premium on measured capital (raised by the owner)
- [decisions § 3. Trade with Russia and Ukraine](decisions.md#3-trade-with-russia-and-ukraine): Purchases count at the seller's net gain
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Ukraine's net gain on other food, other metals, wood, machinery, chemicals, other
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Import duties waived for Ukraine (cost view)
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): One duty rate for all three waivers
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): The same rule for purchases from Ukraine

**Data sources:**

- `trade`: UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine
  - [UN Comtrade API: all reporters' imports from Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' imports from Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Ukraine's own report by partner (mirror fallback), imports 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=804&period=2024&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Russia's own 2021 report by partner (mirror fallback), exports](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=643&period=2021&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [ECB Data Portal: USD/EUR annual average exchange rate (EXR.A.USD.EUR.SP00.A)](https://data-api.ecb.europa.eu/service/data/EXR/A.USD.EUR.SP00.A?startPeriod=2021&format=csvdata) (primary)
- `net_gain_ukraine`: Ukraine's net gain per euro of exports (taxes plus profit above a normal return): Ukrstat, company reports, KSE Institute
  - [Ukrstat: Statistical Yearbook of Ukraine 2024 (table 22.12 profitability)](https://stat.gov.ua/sites/default/files/2026-09/yearbook_24e.pdf) (primary)
  - [data.gov.ua: profitability of operating activity by economic activity (Derzhstat)](https://data.gov.ua/dataset/afb3d64f-7346-47bf-a9e2-0671629fc1d3) (primary)
  - [Kernel Holding annual report FY2025](https://www.annualreports.com/HostedData/AnnualReports/PDF/kernel_2025.pdf) (primary)
  - [Metinvest annual report 2025, financial review](https://metinvestholding.com/ar2025/uploads/en/financial-review.pdf) (primary)
  - [Ferrexpo full-year results 2025](https://www.ferrexpo.com/media/yo2jxkc3/ferrexpo-full-year-financial-results-for-2025-combined-for-website.pdf) (primary)
  - [Export Promotion Office: how Ukraine's goods exports changed in 2025](https://export.gov.ua/news/how-ukraines-goods-exports-changed-in-2025) (primary)
  - [Method: The net-gain rule (round 10)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/overview.md#the-net-gain-rule-round-10) (this project's method)
- `assumptions_r11_gain`: Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results (shared input, links under [Shared inputs](#shared-inputs))
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (shared input, links under [Shared inputs](#shared-inputs))
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (shared input, links under [Shared inputs](#shared-inputs))
- `ua_trade_cf`: Expected trade with Ukraine without the war: rolling back-tests on Ukraine's own history and on analogue partners (IMF WEO vintages, IMF DOTS)
  - [DBnomics: IMF Direction of Trade Statistics (DOT)](https://db.nomics.world/IMF/DOT) (primary)
  - [DBnomics: IMF World Economic Outlook (WEO) vintages](https://db.nomics.world/IMF/WEO:2021-10) (primary)
  - [World Bank: GDP constant USD (NY.GDP.MKTP.KD)](https://data.worldbank.org/indicator/NY.GDP.MKTP.KD) (primary)
  - [Method: Trade with Ukraine (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#trade-with-ukraine-round-6) (this project's method)
- `assumptions_r11_rules`: Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived (shared input, links under [Shared inputs](#shared-inputs))
- `trend`: Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/trade_full-notes.md`](../research/2026-10/gaps/trade_full-notes.md), [`gaps/net_gain_ukraine-notes.md`](../research/2026-10/gaps/net_gain_ukraine-notes.md), [`gaps/ua_trade_cf-notes.md`](../research/2026-10/gaps/ua_trade_cf-notes.md), [`gaps/counterfactual-notes.md`](../research/2026-10/gaps/counterfactual-notes.md), [`gaps/assumptions_r11_gain-notes.md`](../research/2026-10/gaps/assumptions_r11_gain-notes.md); raw downloads: [`raw/comtrade/`](../research/2026-10/raw/comtrade/), [`raw/eurostat/`](../research/2026-10/raw/eurostat/).

**Code:** `build()` step 3 (inline), `counterfactual()`, `apply_net_gain()`, `tariff_rate()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: customs imports from Ukraine; Ukraine's 2021 net gain from division profits. Judgement: Ukraine's 2022-2026 net gain (a proxy) and the single duty rate. Letters across all country parts: C 228.

Known gaps:

- Ukraine's 2025-2026 net-gain shares have no official profitability figures yet; the single duty rate is still a proposal ([decisions](decisions.md#proposals-that-would-change-numbers-not-applied)).

## Services and tourism

**Round 13 (audit):** Services sold to Russia at the seller's net gain × genuinely extra (OECD median 0.002); at best C.

**What it is:** Services bought from and sold to Russia, such as transport, business services and tourism.

**Parts on the map:** More paid to Russia for services / Less paid to Russia for services (`svcpaid`, net shift); Income from extra services sold to Russia (e.g. tourism) / Income lost on services to Russia given up (e.g. tourism) (`svcsold`, net shift).

**How it's calculated:** [services-shipping-companies.md § Services](method/services-shipping-companies.md#services); [Remittances and relocants (round 7)](method/trade.md#remittances-and-relocants-round-7).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Services and tourism](decisions.md#services-and-tourism): what is counted, why, what is left out, data or judgement
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Russia's net gain on services
- [decisions § Constants in the code](decisions.md#constants-in-the-code): services trend bounds kept within ×2.5 of the middle
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Services trade with Russia, both ways, against the pre-war level

**Data sources:**

- `services`: Services trade with Russia (tourism, transport, business services): Eurostat, OECD-WTO BaTiS, Bank of Russia
  - [OECD-WTO BaTiS SDMX API: services trade with Russia, all partners](https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_BATIS@DF_BATIS,1.0/.RUS...S...?startPeriod=2010&endPeriod=2021) (primary)
  - [Eurostat bop_its6_det API: EU services trade with Russia](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_its6_det?partner=RU&bop_item=S&currency=MIO_EUR) (primary)
  - [Eurostat bop_its6_det (table view)](https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (shared input, links under [Shared inputs](#shared-inputs))
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (shared input, links under [Shared inputs](#shared-inputs))
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_gain`: Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results (shared input, links under [Shared inputs](#shared-inputs))
- `value_kept`: Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies (shared input, links under [Shared inputs](#shared-inputs))
- `narrow`: Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS) (shared input, links under [Shared inputs](#shared-inputs))
- `trend2`: Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/uncovered.json`](../research/2026-10/gaps/uncovered.json), [`gaps/uncovered-notes.md`](../research/2026-10/gaps/uncovered-notes.md), [`gaps/trend2-notes.md`](../research/2026-10/gaps/trend2-notes.md), [`gaps/narrow-notes.md`](../research/2026-10/gaps/narrow-notes.md), [`gaps/relocants-notes.md`](../research/2026-10/gaps/relocants-notes.md); no raw download is kept for this flow.

**Code:** `build()` step 13 (inline), `pre_war_trends()`, `apply_relocants()`, `apply_narrow()`, `apply_net_gain()`, `apply_value_kept()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: services trade (Eurostat, OECD-WTO BaTiS, Bank of Russia) and tourism counts. Judgement: the expected level (2021 held) and the share of travel spent by relocants. Letters across all country parts: C 385.

Known gaps:

- Russia's services imports that BaTiS does not assign to a country only widen the high ends; who earns them is open ([decisions](decisions.md#services-and-tourism)).

## Shipping Russian oil

**Round 13 (audit):** Freight and insurance at the shipper's and insurer's net gain (OECD STAN H50, K65) × genuinely extra; Greek shipping about 0.

**What it is:** Income from shipping and insuring Russian oil, counted for the country that really controls the tankers, at the shippers' and insurers' net gain.

**Parts on the map:** Income from shipping and insuring Russian oil / Less income from shipping Russian oil (`ship`, net shift).

**How it's calculated:** [services-shipping-companies.md § Shipping](method/services-shipping-companies.md#shipping).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Shipping Russian oil](decisions.md#shipping-russian-oil): what is counted, why, what is left out, data or judgement
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Left out, and why: Greek shadow-fleet freight and shadow-shipping factors confirmed and kept
- [decision log § Round 1–2: the question and the first map (17 October)](decision-log.md#round-12-the-question-and-the-first-map-17-october): Count shipping and insuring Russian oil, by owner country

**Data sources:**

- `shipping`: Tanker shipping, insurance and ship sales serving Russian oil and LNG exports: CREA, KSE Institute, S&P Global, Windward, press reports
  - [KSE Institute: Russian oil tracker, July 2026](https://sanctions.kse.ua/wp-content/uploads/2026/08/ROT_July-2026.pdf) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
  - [Baird Maritime: April shipping costs decline for Russian Urals crude to India](https://www.bairdmaritime.com/shipping/tankers/april-shipping-costs-decline-for-russian-urals-crude-to-india) (press report)
  - [CREA: July 2025 monthly analysis of Russian fossil fuel exports and sanctions](https://energyandcleanair.org/july-2025-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/) (primary)
  - [Method: Shipping](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/services-shipping-companies.md#shipping) (this project's method)
- `trend2`: Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports (shared input, links under [Shared inputs](#shared-inputs))
- `value_kept`: Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies (shared input, links under [Shared inputs](#shared-inputs))
- `shadow_fleet`: Tanker control by country: KSE Institute shadow-fleet tracker, Lloyd's List, S&P Global, Kpler and Windward reporting, US/UK/EU sanctions designations
  - [KSE Institute: Shadow fleet tracker, September 2026](https://sanctions.kse.ua/wp-content/uploads/2026/10/KSE_Shadow_Fleer_Tracker_SEP26.pdf) (primary)
  - [KSE Institute: Russian oil tracker, September 2026](https://institute.kse.ua/wp-content/uploads/2026/10/rot_eng_september_2026.pdf) (primary)
  - [KSE Institute: Global shadow fleet (June 2024)](https://sanctions.kse.ua/wp-content/uploads/2024/06/Global-Shadow-Fleet-June-2024.pdf) (primary)
  - [US Treasury press release jy2121 (shadow fleet designations)](https://home.treasury.gov/news/press-releases/jy2121) (primary)
  - [EEAS: Council sanctions 9 shadow fleet enablers](https://www.eeas.europa.eu/delegations/ukraine/russias-war-aggression-against-ukraine-council-sanctions-9-shadow-fleet-enablers_en) (primary)

**Research files and raw data:** [`gaps/shipping.json`](../research/2026-10/gaps/shipping.json), [`gaps/shipping-notes.md`](../research/2026-10/gaps/shipping-notes.md), [`gaps/shadow_fleet_r6-notes.md`](../research/2026-10/gaps/shadow_fleet_r6-notes.md), [`gaps/shadow_fleet-notes.md`](../research/2026-10/gaps/shadow_fleet-notes.md); no raw download is kept for this flow.

**Code:** `apply_shipping()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Mostly judgement (C to D): freight = barrels × freight rates, split by who really controls each tanker (press and tracker reporting). Letters across all country parts: B 1, C 8, D 36.

Known gaps:

- Who really controls each tanker rests mostly on press and tracker reporting (certainty D) ([decisions](decisions.md#shipping-russian-oil)).

## Company taxes in Russia

**What it is:** Taxes that foreign-owned companies still pay in Russia: profit tax plus half of other taxes.

**Parts on the map:** More tax paid in Russia by companies / Less tax paid in Russia by companies (`tax`, net shift).

**How it's calculated:** [services-shipping-companies.md § Company taxes](method/services-shipping-companies.md#company-taxes).

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): Taxes companies still pay in Russia count toward Russia
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Belgian firms' profit tax in Russia, 2022

**Data sources:**

- `company_taxes_r6`: Company taxes in Russia: KSE checked against company reports (Raiffeisen, UniCredit, OTP, PepsiCo) and Bundesbank reinvested earnings
  - [RBI Annual Financial Report 2024](https://www.rbinternational.com/content/dam/rbi/ho/investors/results-reports/annual-reports/rbi/2025-02-25%202024%20RBI%20Annual%20Financial%20Report.pdf.coredownload.pdf) (primary)
  - [OTP Bank investor presentation 4Q 2025](https://www.otpbank.hu/static/portal/sw/file/OTP_Bank_Inv_Pres_4Q2025.pdf) (primary)
  - [Deutsche Bundesbank: direct investment statistics (May 2025)](https://www.bundesbank.de/resource/blob/957944/3f44e3b0af199f69ebcd49ea5887bc01/472B63F073F071307366337C94F8C870/2025-05-16-14-13-59-direktinvestitionsstatistiken-data.pdf) (primary)
  - [KSE Institute, Leave Russia regular digest (July 2026)](https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf) (primary)
  - [B4Ukraine report 2025](https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf) (primary)
- `trend2`: Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_hubs`: Round 11: fuel hubs and flag registries (Eurostat oil balances, UN Comtrade own and partner records, port bunker sales), laundered-oil caps from fuel use, Belgian company tax 2022
  - no confirmed link
- `companies`: KSE Institute and B4Ukraine: all taxes paid in Russia by foreign-owned companies, by home country
  - [KSE Institute, Leave Russia regular digest (July 2026)](https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf) (primary)
  - [B4Ukraine report 2025 (How global firms bankrolled Russia's war chest in 2024)](https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf) (primary)
  - [B4Ukraine: The Business of Staying](https://b4ukraine.org/pdf/BusinessOfStaying.pdf) (primary)
  - [KSE Institute: financial results of foreign business in Russia in 2023](https://kse.ua/wp-content/uploads/2024/09/ENG_What-are-the-financial-results-of-foreign-business-in-Russia-in-2023_final.pdf) (primary)
  - [Leave Russia company database (KSE)](https://leave-russia.org/companies-that-exited) (primary)

**Research files and raw data:** [`companies.json`](../research/2026-10/companies.json), [`companies-notes.md`](../research/2026-10/companies-notes.md), [`gaps/companies_all-notes.md`](../research/2026-10/gaps/companies_all-notes.md), [`gaps/company_taxes_r6-notes.md`](../research/2026-10/gaps/company_taxes_r6-notes.md), [`gaps/round4a-notes.md`](../research/2026-10/gaps/round4a-notes.md), [`gaps/trend2-notes.md`](../research/2026-10/gaps/trend2-notes.md); no raw download is kept for this flow.

**Code:** `build()` step 12 (inline), `pre_war_trends()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: KSE and B4Ukraine totals for about 20 home countries, checked against company reports. Judgement: allocation by company counts for the rest (D). Letters across all country parts: B 16, C 7, D 81.

Known gaps:

- Company taxes outside about 20 reporting countries are allocated, not reported.

## Companies leaving Russia

**What it is:** The forced discount and the exit fee Russia took from companies that sold their Russian business. Since round 14b not in the totals, counted in the cost to the country.

**Parts on the map:** Forced sales: discount and exit fee taken by Russia (`exits`, cost to the country only; `taken` in `data.json`). Rounds 5–14: "Paid to Russia by companies leaving it", in the net shift.

**How it's calculated:** [russia-state-and-companies.md § Companies leaving Russia](method/russia-state-and-companies.md#companies-leaving-russia).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Companies leaving Russia](decisions.md#companies-leaving-russia): what is counted, why, what is left out, data or judgement
- [decisions § Constants in the code](decisions.md#constants-in-the-code): conduit Kazakhstan 3.5, Netherlands 4.7
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Rosatom projects, Russian state loans, company exits, Russian-owned firms abroad counted
- [decisions § Round 14b: taken by Russia, not in the totals](decisions.md#round-14b-taken-by-russia-not-in-the-totals): out of the totals, in the cost to the country (raised by the owner; reverses round 5)
- [decision log § Round 14b](decision-log.md#round-14b-taken-by-russia-and-one-normal-return-19-october)

**Data sources:**

- `company_flows`: Company exits from Russia and Russian-owned companies abroad: Russian budget data, KSE and Yale exit lists, company reports, Bank of Russia balance of payments
  - [KSE Institute: assessing foreign companies' direct losses in Russia (Mar 2025)](https://kse.ua/wp-content/uploads/2025/03/KSE_Assessing-Foreign-Companies-Losses-in-Russia.pdf) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
  - [Bank of Russia: outward direct investment by country 2021 (CDIS)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/direct_investment/CDIS_Out_e_2021.xlsx) (primary)
  - [Meduza: voluntary contributions 2025 RUB 251.3bn; 2026 forecast](https://meduza.io/en/news/2026/10/01/putin-reportedly-asked-russian-business-leaders-to-help-fund-the-war-moscow-expects-471-billion-rubles-in-voluntary-contributions-from-companies-this-year) (press report)
  - [RBI: Rasperia second-instance verdict (IR release)](https://www.rbinternational.com/content/dam/rbi/ho/investors/news/ir-releases/rasperia-verdict/2025-04-24%20Rasperia%20second%20instance%20verdict%20IR%20release%20RBI.pdf.coredownload.pdf) (primary)
  - [Eurostat bop_fdi6_inc API: FDI income](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_fdi6_inc) (primary)
  - [Method: Companies leaving Russia](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/russia-state-and-companies.md#companies-leaving-russia) (this project's method)

**Research files and raw data:** [`gaps/company_flows.json`](../research/2026-10/gaps/company_flows.json), [`gaps/company_flows-notes.md`](../research/2026-10/gaps/company_flows-notes.md); no raw download is kept for this flow.

**Code:** `apply_company_flows()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: Russian budget data and company reports. Judgement: the split by home country (D for most). Letters across all country parts: C 6, D 21.

Known gaps:

- Rounds 5–14 counted the forced discount toward Russia with no recorded reason, although the research suggested counting only the exit contribution ([decisions](decisions.md#companies-leaving-russia)). Since round 14b (raised by the owner) both the discount and the contribution, like seizures ([below](#assets-seized-by-russia)), are out of the totals and counted in the cost to the country.

## Assets seized by Russia

**What it is:** Company assets Russia seized (temporary management by decree, expropriation, court seizures, leased aircraft kept), at the owners' write-downs, by the company's home country. Round 14; since round 14b not in the totals, counted in the cost to the country.

**Parts on the map:** Seized by Russia (companies' assets) (`seized`, cost to the country only; `taken` in `data.json`). Round 14: in the net shift, toward Russia, in business with Russia.

**How it's calculated:** [russia-state-and-companies.md § Assets seized by Russia (round 14)](method/russia-state-and-companies.md#assets-seized-by-russia-round-14).

**Why it's done this way:**

- [decisions § Round 14: independent audit 3](decisions.md#round-14-independent-audit-3): M4, a seizure is as coerced as a forced discount (raised by audit, approved by owner)
- [decisions § Round 14b: taken by Russia, not in the totals](decisions.md#round-14b-taken-by-russia-not-in-the-totals): out of the totals, in the cost to the country (raised by the owner; reverses M4)
- [decision log § Round 14](decision-log.md#round-14-independent-audit-3-19-october)

**Data sources:**

- `seizures`: Company assets seized by Russia: owners' write-downs and book values, KSE Institute loss study and company reports
  - [KSE Institute: Assessing Foreign Companies' Direct Losses in Russia, Annex 1](https://kse.ua/wp-content/uploads/2025/03/KSE_Assessing-Foreign-Companies-Losses-in-Russia.pdf) (secondary, fetched in round 14)
  - [Fortum: inside information, full write-down of its Russian assets (EUR 1.7bn)](https://www.fortum.com/media/2023/05/inside-information-fortum-fully-write-down-its-russian-assets-and-deconsolidate-russia-segment-publishes-restated-comparison-figures) (primary)
  - [OSW: Wintershall Dea withdraws from Russia (EUR 5.3bn write-down)](https://www.osw.waw.pl/en/publikacje/analyses/2023-01-27/wintershall-dea-withdraws-russia) (secondary)
  - [Interfax: Carlsberg's DKK 7bn impairment](https://interfax.com/newsroom/top-stories/99188/) (press report)
  - [Interfax: Danone's write-down after temporary management](https://interfax.com/newsroom/top-stories/93000/) (press report)
- `company_flows`: the seizure series by home country and year (and the sources listed under [Companies leaving Russia](#companies-leaving-russia))

**Research files and raw data:** [`gaps/company_flows.json`](../research/2026-10/gaps/company_flows.json) (`seizure`), [`gaps/company_flows-notes.md`](../research/2026-10/gaps/company_flows-notes.md); no raw download is kept for this flow.

**Code:** `apply_company_flows()` in [`pipeline/build_data.py`](../pipeline/build_data.py).

**Certainty and judgement calls:** Data: the owners' write-downs. Judgement: book value as the value to Russia; aircraft net of insurance settlements; the split of leased aircraft by lessor country. B for named write-downs, C for court seizures and aircraft.

Known gaps:

- Wintershall Dea's EUR 5.3bn also covers Nord Stream and WIGA impairments; Uniper's, OMV's and ExxonMobil's values rest on the KSE annex.

## Russian-owned companies abroad

**What it is:** Profits that Russian-owned companies in this country send to their Russian owners.

**Parts on the map:** Profits sent to Russia by Russian-owned companies here (`rusfirms`, net shift).

**How it's calculated:** [russia-state-and-companies.md § Russian-owned companies abroad](method/russia-state-and-companies.md#russian-owned-companies-abroad).

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): Profits Russian-owned companies abroad send home count toward Russia
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): Russian-owned plants abroad (Aughinish in Ireland and others)
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Rosatom projects, Russian state loans, company exits, Russian-owned firms abroad counted

**Data sources:**

- `company_flows`: Company exits from Russia and Russian-owned companies abroad: Russian budget data, KSE and Yale exit lists, company reports, Bank of Russia balance of payments
  - [KSE Institute: assessing foreign companies' direct losses in Russia (Mar 2025)](https://kse.ua/wp-content/uploads/2025/03/KSE_Assessing-Foreign-Companies-Losses-in-Russia.pdf) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
  - [Bank of Russia: outward direct investment by country 2021 (CDIS)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/direct_investment/CDIS_Out_e_2021.xlsx) (primary)
  - [Meduza: voluntary contributions 2025 RUB 251.3bn; 2026 forecast](https://meduza.io/en/news/2026/10/01/putin-reportedly-asked-russian-business-leaders-to-help-fund-the-war-moscow-expects-471-billion-rubles-in-voluntary-contributions-from-companies-this-year) (press report)
  - [RBI: Rasperia second-instance verdict (IR release)](https://www.rbinternational.com/content/dam/rbi/ho/investors/news/ir-releases/rasperia-verdict/2025-04-24%20Rasperia%20second%20instance%20verdict%20IR%20release%20RBI.pdf.coredownload.pdf) (primary)
  - [Eurostat bop_fdi6_inc API: FDI income](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_fdi6_inc) (primary)
  - [Method: Companies leaving Russia](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/russia-state-and-companies.md#companies-leaving-russia) (this project's method)
- `russian_owned_r10`: Russian-owned metals, mining and chemicals plants abroad (Rusal, NLMK, Nornickel, EuroChem): company filings and parent reports
  - [Irish Times: Aughinish Alumina records profits of EUR 103m](https://www.irishtimes.com/business/2026/04/03/russian-owned-aughinish-alumina-plant-in-limerick-records-profits-of-103m/) (press report)
  - [RTE: Limerick alumina refining results](https://www.rte.ie/news/business/2024/1212/1486128-limerick-alumina-refining-ltd-results/) (press report)
  - [Eurostat Comext API: Irish alumina (HS 281820) exports to Russia](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=A&reporter=IE&partner=RU&product=281820&flow=2&indicators=VALUE_IN_EUROS) (primary)
  - [Largest Companies: Kubikenborg Aluminium AB key figures](https://largestcompanies.com/company/Kubikenborg-Aluminium-AB-21997/closing-figures-and-key-ratios) (press report)
  - [Companyweb: EuroChem Antwerpen NV accounts](https://www.companyweb.be/en/0837473452/euro-chem-antwerpen) (press report)
  - [NLMK: NLMK Group and SOGEPA equalise holdings in NBH](https://eu.nlmk.com/en/media-center/news-groups/nlmk-group-and-sogepa-equalize-their-holdings-in-nlmk-belgium-holdings-sa/) (primary)

**Research files and raw data:** [`gaps/company_flows-notes.md`](../research/2026-10/gaps/company_flows-notes.md), [`gaps/russian_owned_r10.json`](../research/2026-10/gaps/russian_owned_r10.json), [`gaps/russian_owned_r10-notes.md`](../research/2026-10/gaps/russian_owned_r10-notes.md); no raw download is kept for this flow.

**Code:** `apply_company_flows()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: company filings and parent reports for the large plants. Judgement: profits of smaller firms (C to D). Letters across all country parts: B 1, C 7, D 21.

Known gaps:

- Mostly D: few firms publish what they send to their Russian owners.

## Frozen Russian reserves

**Round 16 (review 5, H4):** a line of its own, added to the net only: not in business with Russia (its map, ranking and world total) or in support for Ukraine; shown in the panel, the table ("Russian money frozen, % of a year's GDP (in the net only)"), the CSV (`russian_money_frozen_*_net_only`) and the JSON (`russian_money_frozen`). The one-third host share is explained in the [method](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7); check 34.

**What it is:** The return Russia lost on its central-bank reserves frozen in this country.

**Parts on the map:** Russian money frozen (return Russia lost on its reserves) (`frozen`, net shift; its own line since round 14, never called "less paid to Russia"; since round 16 added to the net only).

**How it's calculated:** [russia-state-and-companies.md § Frozen central-bank reserves (round 7)](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7).

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): The return Russia lost on its frozen reserves counts toward Ukraine
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Euroclear and Clearstream
- [decisions § Constants in the code](decisions.md#constants-in-the-code): BEL_EUROCLEAR_TAX; frozen-reserve return, low end ×0.8
- [decision log § Round 7: what the owner asked to add (18 October)](decision-log.md#round-7-what-the-owner-asked-to-add-18-october): Frozen Russian reserves: the yearly return Russia lost

**Data sources:**

- `frozen_reserves`: Return denied on Russia's frozen central-bank reserves: Euroclear reports, Swiss SECO, EU Commission, G7 and central bank statements; rates per currency and year
  - [Euroclear 2025 results press release](https://www.euroclear.com/newsandinsights/en/press/2026/mr-06-euroclear-delivers-strong-2025-results.html) (primary)
  - [Euroclear 2024 results press release](https://www.euroclear.com/newsandinsights/en/press/2026/mr-12-euroclear-delivers-q1-2026-results.html) (primary)
  - [Euroclear H1 2026 results press release](https://www.euroclear.com/newsandinsights/en/press/2026/mr-20-euroclear-h1-2026-results.html) (primary)
  - [Bank of Russia Annual Report 2021](https://www.cbr.ru/Collection/Collection/File/43443/ar_2021_e.pdf) (primary)
  - [Bank of Russia FX and gold asset management report 2022-1](https://www.cbr.ru/Collection/Collection/File/39685/2022-01_res_en.pdf) (primary)
  - [EPRS briefing 775908](https://eprs.europarl.europa.eu/contents/publications/EPRS/2025/09/EPRS_BRI(2025)775908.html) (primary)
  - [Method: Frozen central-bank reserves (round 7)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) (this project's method)

**Research files and raw data:** [`gaps/frozen_assets.json`](../research/2026-10/gaps/frozen_assets.json), [`gaps/frozen_assets-notes.md`](../research/2026-10/gaps/frozen_assets-notes.md); no raw download is kept for this flow.

**Code:** `apply_frozen_reserves()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: Euroclear reports, rates per currency and year. Judgement: a third to the host for Euroclear and Clearstream, the 2026 Belgian tax, the low end ×0.8. Letters across all country parts: B 2, C 26, D 7.

Known gaps:

- Holdings outside Euroclear and Clearstream are less well reported.

## Remittances from Russia (marker)

**Round 13b (owner, after the audit): a marker, not in the totals.** Migrants' wages sent home from Russia are no longer a part of the net shift, the cost view or either headline number: they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over the alternatives is small and hard to measure; and they dominated the bottom of the ranking (Tajikistan −39.6% of GDP). The panel, the map layer "Wages from Russia" (△) and the table, CSV and JSON show the change in what migrants sent against the expected level, marked "not in the totals". Tajikistan −39.61 → −0.81, Uzbekistan −14.46 → −6.11.

**Round 13 (audit), replaced in round 13b:** At the migrant's net gain: the war wage premium (Russian wages above their pre-war trend) in full as far as it shows in euros, the rest of the change × the premium over the home wage × genuinely extra ([remittances_r13-notes](../research/2026-10/gaps/remittances_r13-notes.md)). Tajikistan's 2025 total checked against EFSD (within 6%).

**What it is:** Shown as a marker, not in the totals: the change in what migrants working in Russia sent home, against the level expected without the war.

**Parts on the map:** none. Marker: "Depends on wages earned in Russia" in the panel (△, `remitNote()`), the map layer "Wages from Russia" (`drawRemit()`), and the table, CSV and JSON columns `remittances_from_russia_change_*_not_in_totals` (`remit` in `data.json`). Until round 13 it was the part "Wages earned working in Russia (migrants' remittances)" (`remit`, net shift).

**How it's calculated:** [trade.md § Remittances and relocants (round 7)](method/trade.md#remittances-and-relocants-round-7).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Remittances from Russia](decisions.md#remittances-from-russia): what is counted, why, what is left out, data or judgement
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Russia's share of remittances, Tajikistan and Belarus
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Moldova's transfers from Russia 2024–2026
- [decision log § Round 7: what the owner asked to add (18 October)](decision-log.md#round-7-what-the-owner-asked-to-add-18-october): Remittances from Russia counted; relocants' transfers and spending left out
- [decision log § Round 13: one rule, two numbers (19 October)](decision-log.md#round-13-one-rule-two-numbers-19-october): Remittances out of the totals, shown as a marker (raised by audit, owner decided)

**Data sources:**

- `remittances`: Remittances from Russia: receiving central banks' transfers by country of origin (CBU, NBKR, CBA, NBG and others), World Bank; relocants' transfers split out
  - [World Bank API: personal remittances received (BX.TRF.PWKR.CD.DT)](https://api.worldbank.org/v2/country/TJK;KGZ;UZB;ARM;GEO;MDA;AZE;KAZ;BLR/indicator/BX.TRF.PWKR.CD.DT) (primary)
  - [Bank of Russia: cross-border operations survey 2020](https://www.cbr.ru/collection/collection/file/39301/cross-borderopssurvey%202020_e.pdf) (primary)
  - [ADB Asian Development Outlook April 2026: Tajikistan](https://www.adb.org/sites/default/files/publication/1135881/taj-ado-april-2026.pdf) (primary)
  - [National Bank of Kazakhstan information release](https://nationalbank.kz/en/news/informacionnye-soobshcheniya/16492) (primary)
  - [24.kg (NBKR): transfers from Russia to Kyrgyzstan +12%](https://24.kg/english/318729_Money_transfers_from_Russia_to_Kyrgyzstan_increase_by_12_percent_for_year/) (press report)
  - [Times of Central Asia (CBU): Uzbekistan received USD 14.8bn in 2024](https://timesca.com/uzbekistan-receives-14-8-billion-in-remittances-in-2024/) (press report)
- `assumptions_r11_people`: Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/remittances.json`](../research/2026-10/gaps/remittances.json), [`gaps/remittances-notes.md`](../research/2026-10/gaps/remittances-notes.md), [`gaps/relocants-notes.md`](../research/2026-10/gaps/relocants-notes.md), [`gaps/assumptions_r11_people-notes.md`](../research/2026-10/gaps/assumptions_r11_people-notes.md); no raw download is kept for this flow.

**Code:** `apply_remittances()`, `apply_assumptions_r11_people()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: receiving central banks' transfers by origin, World Bank totals, Russia's 2019-2021 mirror share. Judgement: the same share applied to all years. Letters on the markers: B 2, C 4, D 3.

Known gaps:

- Tajikistan's marker rests on World Bank totals (D); the share is applied to all years ([limitations](limitations.md#open-issues-in-the-numbers)).

## Rosatom and Russian state loans

**What it is:** Payments for Russian nuclear projects and repayments of Russian state loans.

**Parts on the map:** Nuclear projects and state loans from Russia (`statefin`, net shift).

**How it's calculated:** [russia-state-and-companies.md § Nuclear projects and state loans from Russia](method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Rosatom and Russian state loans](decisions.md#rosatom-and-russian-state-loans): what is counted, why, what is left out, data or judgement
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Rosatom projects, Russian state loans, company exits, Russian-owned firms abroad counted
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): Belarus's Russia-granted loan deferrals left out; sanction-blocked arrears labelled

**Data sources:**

- `state_finance`: Rosatom projects abroad and Russia's state loans: World Bank International Debt Statistics (Russia as creditor), project and loan reporting
  - [World Bank IDS API: interest paid to Russia as bilateral creditor (counterpart 087)](https://api.worldbank.org/v2/sources/6/country/all/series/DT.INT.BLAT.CD/counterpart-area/087) (primary)
  - [TBS News: Rooppur plant payment hurdle](https://www.tbsnews.net/economy/rooppur-plant-payment-hurdle-sticks-it-1097121) (press report)
  - [World Nuclear News: Hungary delays Paks II loan repayment](https://www.world-nuclear-news.org/Articles/Hungary-gets-agreement-to-delay-Paks-II-loan-repay) (press report)
  - [Paks II Ltd: Hungary begins early repayment of the loan](https://www.paks2.hu/en/web/paks-2-en/w/hungary-begins-the-early-repayment-of-the-loan) (primary)
  - [Egypt Independent: USD 25bn Russian loan for Dabaa](https://www.egyptindependent.com/25-bn-russian-funds-egypt-s-first-nuclear-plant-newspaper/) (press report)
  - [UN Comtrade API: imports from Russia of nuclear goods (HS 2844, 8401), 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=2844,8401) (primary)
  - [Method: Nuclear projects and state loans from Russia](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/russia-state-and-companies.md#nuclear-projects-and-state-loans-from-russia) (this project's method)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/russia_state_finance.json`](../research/2026-10/gaps/russia_state_finance.json), [`gaps/russia_state_finance-notes.md`](../research/2026-10/gaps/russia_state_finance-notes.md); no raw download is kept for this flow.

**Code:** `apply_state_finance()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: World Bank International Debt Statistics (Russia as creditor). Judgement: payments to Rosatom where projects do not report them. Letters across all country parts: B 3, C 2, D 5.

Known gaps:

- No recorded reason why loan payments count in full rather than at Russia's net gain ([decisions](decisions.md#rosatom-and-russian-state-loans)).

## Weapons bought from Russia

**What it is:** Payments for Russian weapons, against the level expected without the war, at Russia's net gain.

**Parts on the map:** Weapons bought from Russia (`rusarms`, net shift).

**How it's calculated:** [russia-state-and-companies.md § Weapons bought from Russia](method/russia-state-and-companies.md#weapons-bought-from-russia); [Round 6](method/russia-state-and-companies.md#round-6).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Weapons bought from Russia](decisions.md#weapons-bought-from-russia): what is counted, why, what is left out, data or judgement
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Russia's net gain on arms
- [decision log § Round 5: values at their real worth (18 October)](decision-log.md#round-5-values-at-their-real-worth-18-october): Russian arms sales to other countries counted, against the expected level

**Data sources:**

- `russian_arms`: Russian arms exports by buyer: Rosoboronexport and FSVTS statements, SIPRI fact sheets, contract reporting (S-400, Su-35, Su-57)
  - [SIPRI fact sheet: Trends in international arms transfers, 2025](https://www.sipri.org/sites/default/files/2026-03/fs_2603_at_2025.pdf) (primary)
  - [SIPRI fact sheet: Trends in international arms transfers, 2024](https://www.sipri.org/sites/default/files/2025-03/fs_2503_at_2024.pdf) (primary)
  - [SIPRI fact sheet: Trends in international arms transfers, 2021](https://www.sipri.org/sites/default/files/2022-03/fs_2203_at_2021.pdf) (primary)
  - [Defense News: Russia claims USD 15bn in 2025 arms exports](https://www.defensenews.com/global/europe/2026/02/02/russia-claims-15-billion-in-2025-arms-exports-with-focus-on-africa/) (press report)
  - [CRS R46937: Russian arms sales and defense industry](https://www.everycrsreport.com/reports/R46937.html) (primary)
  - [SIPRI Arms Transfers Database](https://www.sipri.org/databases/armstransfers) (primary)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))
- `assumptions_r11_gain`: Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/russian_arms_exports.json`](../research/2026-10/gaps/russian_arms_exports.json), [`gaps/russian_arms_exports-notes.md`](../research/2026-10/gaps/russian_arms_exports-notes.md), [`gaps/arms_r6-notes.md`](../research/2026-10/gaps/arms_r6-notes.md), [`gaps/assumptions_r11_gain-notes.md`](../research/2026-10/gaps/assumptions_r11_gain-notes.md); no raw download is kept for this flow.

**Code:** `apply_russian_arms()`, `apply_net_gain()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: SIPRI and contract reporting (Rosoboronexport, FSVTS). Judgement: payment timing and the high end of Russia's net gain on arms (0.12). Mostly D. Letters across all country parts: C 4, D 33.

Known gaps:

- Russian Wikipedia is cited in `assumptions_r11_gain.json` ([limitations](limitations.md#open-issues-in-the-numbers)).

## Weapons and troops sent to Russia

**Round 13 (audit):** Paid deliveries, also in kind, count as sales at the seller's net gain; unpaid ones in full ([military_payment_r13-notes](../research/2026-10/gaps/military_payment_r13-notes.md)). North Korea −30.0 → −10.2% of GDP.

**What it is:** Shells, missiles, drones and troops from North Korea, Iran, Belarus and China: what Russia paid for (also in kind) as a sale, at the seller's net gain; what it did not pay for at market value.

**Parts on the map:** Weapons and troops sent to Russia (`mil`, net shift).

**How it's calculated:** [aid-refugees-military.md § Military support to Russia](method/aid-refugees-military.md#military-support-to-russia); [Round 6 revision](method/aid-refugees-military.md#round-6-revision).

**Round 15:** the Russia panel's list "Armed Russia" shows these deliveries at their full value (`military_rus.alt`: North Korea EUR 8.8bn, Iran 3.5bn, China 1.3bn, Belarus 1.3bn), next to what counts in the totals (paid deliveries at the seller's net gain, round 13). Information only; the totals do not change.

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): Weapons and troops sent to Russia count toward Russia at market value
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): Payment agents' fees and revalued military support to Russia

**Data sources:**

- `military_rus_r6`: Military support to Russia: Ukrainian and South Korean intelligence, Open Source Centre, the Multilateral Sanctions Monitoring Team, INSS, leaked Alabuga contracts, Russian procurement prices
  - [Multilateral Sanctions Monitoring Team, MSMT/2025/1: Unlawful Military Cooperation including Arms Transfers between North Korea and Russia (29 May 2025, UN document S/2025/340)](https://msmt.info/api/file/download/18858) (primary)
  - [NK News on INSS: North Korea likely earned USD 14.4bn from military deals with Russia](https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/) (press report)
  - [IStories with Open Source Centre: how North Korea armed Russia](https://istories.media/en/stories/2026/03/16/how-north-korea-armed-russia/) (press report)
  - [Kyiv Independent: ROK intelligence - >12m 152mm rounds](https://kyivindependent.com/north-korea-supplied-russia-with-12-million-rounds-of-152mm-shells-south-korean-intel-estimates/) (press report)
  - [The War Zone: what does a Shahed-136 really cost (leaked Alabuga contracts)](https://twz.com/news-features/what-does-a-shahed-136-really-cost) (press report)
  - [Militarnyi: Iran sent Russia USD 2.7bn worth of missiles alone](https://militarnyi.com/en/blogs/iran-sent-russia-2-7-billion-worth-of-missiles-alone/) (press report)
  - [Militarnyi: role of the Belarusian defence industry in Russian aggression](https://militarnyi.com/en/articles/role-of-defense-industry-of-belarus-in-russian-aggression-against-ukraine/) (press report)
  - [OCCRP: Belarus ramps up arms pipeline to Russia](https://www.occrp.org/en/news/belarus-ramps-up-arms-pipeline-to-russia-amid-sanctions-gaps) (press report)
- `china_military`: China's military support to Russia not in recorded trade: CSIS, RUSI, KSE, Reuters, US and EU findings
  - [KSE Institute sanctions: China and Russia (CHP)](https://sanctions.kse.ua/?p=13285) (primary)
  - [PBS/AP: US intelligence shows China surging equipment sales to Russia](https://www.pbs.org/newshour/world/u-s-intelligence-shows-china-is-surging-equipment-sales-to-russia-to-help-war-effort-in-ukraine-ap-says) (press report)
  - [Brussels Times: EU sanctions Chinese companies including satellite firm](https://www.brusselstimes.com/business/1109130/eu-sanctions-chinese-companies-including-global-satellite-giant) (press report)
  - [CP24/Reuters: Russians covertly trained by China return to fight](https://www.cp24.com/news/world/2026/05/19/russians-covertly-trained-by-china-return-to-fight-in-ukraine-reuters-sources-say/) (press report)
  - [Kathmandu Post/Reuters: Russia has secret war drones project in China](https://kathmandupost.com/world/2024/09/25/russia-has-secret-war-drones-project-in-china-intel-sources-say) (press report)

**Research files and raw data:** [`gaps/military_rus_r6.json`](../research/2026-10/gaps/military_rus_r6.json), [`gaps/military_rus_r6-notes.md`](../research/2026-10/gaps/military_rus_r6-notes.md), [`gaps/china_military-notes.md`](../research/2026-10/gaps/china_military-notes.md), [`other-notes.md`](../research/2026-10/other-notes.md), [`gaps/flowback2-notes.md`](../research/2026-10/gaps/flowback2-notes.md); raw downloads: `raw/msmt/` (not in the repository; listed with checksums in [`raw/MANIFEST.json`](../research/2026-10/raw/MANIFEST.json)).

**Code:** `build()` step 15 (inline), `apply_narrow()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: North Korea's volumes, now confirmed by the primary MSMT/2025/1 report; Iran's leaked contracts. Judgement: every price (no source gives them), Belarus's quantities. North Korea and Iran C, Belarus and China D. Letters across all country parts: C 2, D 2.

Known gaps:

- No source gives prices, so the euro values are our judgement.
- Iran, Belarus and China rest on press reports only ([limitations](limitations.md#open-issues-in-the-numbers)).

## Payment agents

**Round 13 (audit):** Fees at the financial industry's net gain × genuinely extra (about a tenth of the fees).

**What it is:** Fees earned by firms that settle Russia's trade payments, at the financial industry's net gain.

**Parts on the map:** Fees earned settling Russia's trade (payment agents) (`agents`, net shift).

**How it's calculated:** [trade.md § Payment agents (round 6)](method/trade.md#payment-agents-round-6).

**Why it's done this way:**

- [decisions § Why each money flow is counted: Payment agents](decisions.md#payment-agents): what is counted, why, what is left out, data or judgement
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Left out, and why: payment-agent fees confirmed and kept
- [decision log § Round 6: one rule for money, two balances (18 October)](decision-log.md#round-6-one-rule-for-money-two-balances-18-october): Payment agents' fees and revalued military support to Russia

**Data sources:**

- `payment_agents`: Payment agents settling Russia's trade: Bank of Russia balance of payments, Russian Finance Ministry and customs letters on agent commissions, press and sanctions reporting
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx) (primary)
  - [The Bell: the rise of Russia's foreign trade middlemen](https://en.thebell.io/the-rise-of-russias-foreign-trade-middlemen/) (press report)
  - [TKS.RU: agent remuneration and customs value (Minfin letter 27-01-21/106988)](https://www.tks.ru/columns/vasiliev/2025/03/11/0001/) (press report)
  - [US Treasury jy2785: Keremet Bank designated](https://home.treasury.gov/news/press-releases/jy2785) (primary)
  - [Elliptic: A7A5 stablecoin](https://www.elliptic.co/insights/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions/) (press report)
  - [Method: Payment agents (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/trade.md#payment-agents-round-6) (this project's method)

**Research files and raw data:** [`gaps/payment_channels.json`](../research/2026-10/gaps/payment_channels.json), [`gaps/payment_channels-notes.md`](../research/2026-10/gaps/payment_channels-notes.md); no raw download is kept for this flow.

**Code:** `apply_payment_agents()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: Bank of Russia balance of payments. Judgement: the fee rates and the split by country (D). Letters across all country parts: C 1, D 11.

Known gaps:

- The fee rates and the split by country rest mostly on press reports.

## Gold and hidden payments to Russia

**Round 16 (review 5, M1, M6):** only the gold that stays in Hong Kong counts for Hong Kong; the share it exported to buyers other than mainland China is charged to them (source `hk_gold_r16`, [`gaps/hk_gold_r16.json`](../research/2026-10/gaps/hk_gold_r16.json), [notes](../research/2026-10/gaps/hk_gold-notes.md), raw `raw/comtrade_hkg/HKG_7108_XMRX_*.json`); gold volume changes are valued at the 2021 gold price held flat (`GOLD_NOWAR`). These are inside "Less (or more) paid to Russia" (`paid`), tagged as gold (`to_rus.gold_share`); check 33.

**What it is:** Gold and other payments that do not show in customs data, at Russia's gain on them.

**Parts on the map:** Gold and hidden payments to Russia (`hidden`, net shift).

**How it's calculated:** [trade.md § Gold and hidden channels](method/trade.md#gold-and-hidden-channels); [Hong Kong gold](method/trade.md#hong-kong-gold).

**Why it's done this way:**

- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Letters fixed in calc(): gold and hidden payments always D
- [decisions § Decisions that were not written down](decisions.md#decisions-that-were-not-written-down): Hub trading margins: gold 0.3–6%
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Hong Kong gold passed on to the mainland, 2026
- [decisions § Assumptions backed by data (round 11)](decisions.md#assumptions-backed-by-data-round-11): Freight share of gold
- [decisions § Applied in round 12 (data precision)](decisions.md#applied-in-round-12-data-precision): HK_METALS_SHARE
- [decision log § Round 9–10: what readers asked (18 October)](decision-log.md#round-910-what-readers-asked-18-october): Full audit of rounds 9–10 (gold fixed)
- [decision log § Round 12: data precision (19 October)](decision-log.md#round-12-data-precision-19-october): Hong Kong's precious-metals share measured from UN Comtrade

**Data sources:**

- `hidden`: Gold and hidden payment channels to Russia not in customs data: Swissaid, Reuters, Hong Kong and Kyrgyz trade gaps
  - [SWISSAID: United Arab Emirates more than ever a hub for conflict gold](https://www.swissaid.ch/en/media/united-arab-emirates-more-than-ever-a-hub-for-conflict-gold/) (primary)
  - [UN Comtrade API: Hong Kong gold (HS 7108) and total trade with Russia and hubs](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&period=2025&partnerCode=643&flowCode=M&cmdCode=7108,TOTAL) (primary)
  - [UN Comtrade API: all reporters' imports of gold (HS 7108) from the UAE, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=784&flowCode=M&cmdCode=7108) (primary)
  - [Akchabar: lost gold - why the sale of 50 tonnes is not in Kyrgyz statistics](http://www.akchabar.kg/en/article/nedvizhimost-mvcszetffpwgppcz/poteryannoe-zoloto-pochemu-v-naczstatistike-ne-otrazilas-prodazha-50-tonn-dragmetalla) (press report)
  - [Mining.com (Reuters): From Russia with gold - UAE cashes in as sanctions bite](https://www.mining.com/web/from-russia-with-gold-uae-cashes-in-as-sanctions-bite/) (press report)
  - [Elliptic: A7A5, the ruble-backed stablecoin](https://www.elliptic.co/insights/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions/) (press report)
  - [UN Comtrade API: Hong Kong's imports from Russia, all goods and HS 71, 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&partnerCode=643&period=2023&flowCode=M&cmdCode=TOTAL,71) (primary)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (shared input, links under [Shared inputs](#shared-inputs))
- `narrow`: Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS) (shared input, links under [Shared inputs](#shared-inputs))
- `audit2`: Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports (shared input, links under [Shared inputs](#shared-inputs))

**Research files and raw data:** [`gaps/uncovered-notes.md`](../research/2026-10/gaps/uncovered-notes.md), [`gaps/kgz_gold.json`](../research/2026-10/gaps/kgz_gold.json), [`gaps/residual-notes.md`](../research/2026-10/gaps/residual-notes.md), [`gaps/audit2-notes.md`](../research/2026-10/gaps/audit2-notes.md), [`gaps/net_gain_russia-notes.md`](../research/2026-10/gaps/net_gain_russia-notes.md); raw downloads: [`raw/comtrade_hkg/`](../research/2026-10/raw/comtrade_hkg/).

**Code:** `build()` step 13 (inline, `kgz_gold.json`), `apply_residual()`, `apply_audit2(..., "values")`, `_hk_metals_share()`, `apply_net_gain()` in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: Hong Kong and Kyrgyz trade gaps (UN Comtrade). Judgement: the channels outside customs (Swissaid, Reuters). Fixed at D. Letters across all country parts: D 10.

Known gaps:

- Rough indication (D) for every country.

## Labels and counts outside the totals

**Round 16 (review 5, M4):** the sanctions label counts a fuel a country stopped before the ban took effect as its own choice (Lithuania's and Finland's crude, Poland's coal and pipeline crude, Germany's pipeline crude; [`gaps/stop_dates_r16.json`](../research/2026-10/gaps/stop_dates_r16.json), [notes](../research/2026-10/gaps/stop_dates_r16-notes.md), `apply_stop_dates()`).

**What it is:** The critical-goods marker, the sanctions label and counts of volunteers and fighters. They add nothing to the totals.

**Parts on the map:** none. These are shown in the panel but add nothing to the totals.

**How it's calculated:** [trade.md § Goods Russia's weapons need: the critical-goods marker (round 7)](method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7); [Sanctions-mandated or own choice](method/trade.md#sanctions-mandated-or-own-choice).

**Why it's done this way:**

- [decisions § 5. Money flowing back and Russia's state and companies](decisions.md#5-money-flowing-back-and-russias-state-and-companies): Critical goods are a marker, not added
- [decision log § Round 7: what the owner asked to add (18 October)](decision-log.md#round-7-what-the-owner-asked-to-add-18-october): Critical goods as a marker, not in the totals
- [decision log § Round 3–4: profit, windfall and a tested baseline (17–18 October)](decision-log.md#round-34-profit-windfall-and-a-tested-baseline-1718-october): Sanctions label

**Data sources:**

- `chpl`: Sales to Russia of Common High Priority List goods: exporters' customs records (Eurostat, UN Comtrade), adjusted toward Russian dispatch records (KSE)
  - [BIS: Common High Priority Items List (CHPL)](https://www.bis.gov/licensing/country-guidance/common-high-priority-items-list-chpl) (primary)
  - [EU: List of Common High Priority Items (PDF)](https://finance.ec.europa.eu/system/files/2023-09/list-common-high-priority-items_en.pdf) (primary)
  - [Eurostat Comext DS-045409 SDMX: EU exports to Russia by HS-6](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=A&reporter=DE&partner=RU&product=854231&flow=2&indicators=VALUE_IN_EUROS&time=2024) (primary)
  - [UN Comtrade API: exports to Russia of CHP HS-6 codes (example 854231), 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=X&cmdCode=854231,854232,854239) (primary)
  - [KSE Institute: Russian CHP imports tracker Q2 2026](https://institute.kse.ua/wp-content/uploads/2026/07/russian_chp_tracker_eng_q2_2026.pdf) (primary)
  - [KSE Institute: challenges of export controls enforcement (Jan 2024)](https://kse.ua/wp-content/uploads/2024/01/Challenges-of-Export-Controls-Enforcement.pdf) (primary)
- `sanctions_share`: Share of the cut in trade with Russia required by sanctions: EU Regulation 833/2014 (consolidated versions), US, UK, Japanese, Canadian and other bans, Eurostat Comext and UN Comtrade
  - no confirmed link
- `people`: Volunteers and recruited fighters: compiled estimates
  - [Kyiv Independent (South Korea NIS): nearly 11,000 North Korean troops in Kursk](https://kyivindependent.com/nearly-11-000-north-korean-troops-stationed-in-russias-kursk-oblast-at-start-of-2026-media-reports/) (press report)
  - [Kyiv Independent (iStories, leaked Moscow EMIAS data): >1,500 foreign recruits from 48 countries](https://kyivindependent.com/over-1-500-foreign-mercenaries-from-48-countries-join-russian-military-media-reports/) (press report)
  - [RBC-Ukraine: Russia's top source of foreign mercenaries (GUR/'I Want to Live')](https://newsukraine.rbc.ua/news/russia-s-top-source-of-foreign-mercenaries-1781320790.html) (press report)
  - [NPR: Kenyans recruited by Russia](https://www.npr.org/2026/02/19/g-s1-110724/russia-ukraine-war-kenyans-recruited) (press report)
  - [Kontan (Russian MoD list): foreign mercenaries fighting in Ukraine](https://english.kontan.co.id/news/complete-list-of-foreign-mercenaries-fighting-in-ukraine-10-from-indonesia) (press report)
  - [The Insider (Czech Radio): Czech volunteers approved](https://theins.press/en/politics/281953) (press report)
  - [Responsible Statecraft: foreign fighters in Ukraine](https://responsiblestatecraft.org/foreign-fighters-ukraine/) (press report)

**Research files and raw data:** [`gaps/chpl.json`](../research/2026-10/gaps/chpl.json), [`gaps/chpl-notes.md`](../research/2026-10/gaps/chpl-notes.md), [`gaps/sanctions_share-notes.md`](../research/2026-10/gaps/sanctions_share-notes.md), [`other-notes.md`](../research/2026-10/other-notes.md), [`gaps/flowback2-notes.md`](../research/2026-10/gaps/flowback2-notes.md); no raw download is kept for this flow.

**Code:** `apply_chpl()`, `build()` step 22, sanctions labels (inline), `build()` step 15, people (inline) in [`pipeline/build_data.py`](../pipeline/build_data.py) unless named otherwise.

**Certainty and judgement calls:** Data: customs records of critical goods, sanctions texts. Counts of volunteers and fighters are press reports (D).

Known gaps:

- Volunteers and fighters have no confirmed primary link ([limitations](limitations.md#open-issues-in-the-numbers)).

## Shared inputs

These sources feed three flows or more. Their confirmed exact links:

- `assumptions_r11_gain`: Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results (used by 4 flows)
  - no confirmed link
- `assumptions_r11_people`: Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins (used by 4 flows)
  - no confirmed link
- `assumptions_r11_rules`: Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived (used by 4 flows)
  - no confirmed link
- `audit`: Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports (used by 4 flows)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Eurostat bop_its6_det (table view)](https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table) (primary)
  - [B4Ukraine: how global firms bankrolled Russia's war chest in 2024](https://b4ukraine.org/whats-new/how-global-firms-bankrolled-russias-war-chest-in-2024) (primary)
  - [UNHCR Refugee Data Finder API (Ukrainian refugees)](https://api.unhcr.org/population/v1/population/?coo=UKR&coa_all=true) (primary)
  - [Eurostat Comext DS-045409 API](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409?format=JSON&freq=A&reporter=HU&partner=RU&product=27&flow=1&indicators=VALUE_IN_EUROS&time=2024) (primary)
  - [Poland MFA: Poland's support 1000 days after Russia's aggression](https://www.gov.pl/web/japonia/polands-support-1000-days-after-russias-aggression-against-ukraine) (primary)
- `audit2`: Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports (used by 4 flows)
  - [SWISSAID: UAE more than ever a hub for conflict gold](https://www.swissaid.ch/en/media/united-arab-emirates-more-than-ever-a-hub-for-conflict-gold/) (primary)
  - [UN Comtrade API: UAE imports from Russia and Armenia (TOTAL, 71, 7108, 27), 2023](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=643,51&flowCode=M&cmdCode=TOTAL,71,7108,27) (primary)
  - [UN Comtrade API: Armenia gold exports (7108) to UAE, HK, China, Russia, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=51&period=2024&partnerCode=784,344,156,643&flowCode=X&cmdCode=7108) (primary)
  - [Eurostat nrg_ti_oil API: Baltic/Finnish oil imports 2021](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_ti_oil?format=JSON&geo=EE&geo=LV&geo=LT&geo=FI&time=2021&siec=O4100_TOT&siec=O4600&unit=THS_T) (primary)
  - [Kiel Institute: Ukraine Support Tracker research note](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Ukraine_Support_Tracker_-_Research_Note.pdf) (primary)
  - [Mining.com: Hong Kong ousts Dubai as biggest hub for Russian gold trade](https://www.mining.com/web/hong-kong-ousts-dubai-as-biggest-hub-for-russian-gold-trade/) (press report)
- `cf_bands`: Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova (used by 5 flows)
  - [Method: How the prediction's error enters the ranges](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#7-how-the-predictions-error-enters-the-ranges) (this project's method)
  - [Method: Russia's neighbours and Moldova (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#russias-neighbours-and-moldova-round-6) (this project's method)
  - [UN Comtrade API: Moldova imports from Russia by product, 2019](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=498&period=2019&flowCode=M&partnerCode=643&cmdCode=99,2711,27,31,TOTAL) (primary)
- `counterfactual`: Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting) (used by 5 flows)
  - [UN Comtrade API (annual HS, all reporters vs Russia, 2021)](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2021&partnerCode=643&flowCode=X&cmdCode=TOTAL) (primary)
  - [World Bank Commodity Markets (Pink Sheet)](https://www.worldbank.org/en/research/commodity-markets) (primary)
  - [World Bank API: GDP (NY.GDP.MKTP.KD)](https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.KD) (primary)
  - [Method: the counterfactual models](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#6-which-model-is-used-for-which-flow) (this project's method)
- `loans_value`: Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding (used by 3 flows)
  - [Kiel Institute, Ukraine Support Tracker Release 31 workbook (xlsx)](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) (primary)
  - [Regulation (EU) 2024/792 (Ukraine Facility): no provisioning and no provisioning rate set for its loans](https://eur-lex.europa.eu/eli/reg/2024/792/oj) (primary)
  - [Decision (EU) 2022/1628 (exceptional MFA EUR 5bn; repurposed EIB ELM loans EUR 1.59bn): provisioning rate 70%](https://eur-lex.europa.eu/eli/dec/2022/1628/oj) (primary)
  - [Council ST-5738-2026: Ukraine Support Loan](https://data.consilium.europa.eu/doc/document/ST-5738-2026-INIT/en/pdf) (primary)
  - [ICU Weekly Insight 26 Jan 2026 (Eurobond yields)](https://icu.ua/download/8460/ICUWeeklyInsight-20260126-Eng.pdf) (primary)
  - [IMF: members' quotas and voting power](https://www.imf.org/en/About/executive-board/members-quotas) (primary)
  - [World Bank: IBRD country voting table](https://thedocs.worldbank.org/en/doc/a16374a6cee037e274c5e932bf9f88c6-0330032021/original/IBRDCountryVotingTable.pdf) (primary)
  - [EBRD: shareholders and board of governors](https://www.ebrd.com/shareholders-and-board-of-governors.html) (primary)
  - [Ukrinform: Ukraine prices USD 1.25bn 8-year Eurobond at 6.875% (27 Apr 2021)](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html) (primary)
  - [Interfax-Ukraine: USD 500m tap of the 2029 Eurobond at 6.30% (22 Jul 2021)](https://en.interfax.com.ua/news/economic/758134.html) (primary)
  - [ICU Weekly Insight 28 Mar 2022: Eurobond lows of 21-34 cents = yields of 37-427%](https://icu.ua/download/4058/ICUWeeklyInsight-20220328-Eng.pdf) (primary)
  - [ICU Weekly Insight 18 Dec 2023: Eurobonds at 24-31 cents](https://icu.ua/download/4446/ICUWeeklyInsight-20231218-Eng.pdf) (primary)
  - [Eavex Capital Fixed Income Weekly 22 Dec 2025: yields of the restructured Eurobonds](https://www.eavex.com.ua/wp-content/uploads/2025/12/eavex-fi-weekly-dec-22.pdf) (primary)
  - [Government of Ukraine: restructuring of USD 20.5bn Eurobonds completed (4 Sep 2024)](https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha) (primary)
  - [Government of Ukraine: memorandum with the Group of Creditors of Ukraine, debt service suspended to Feb 2030 (17 Apr 2026)](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy) (primary)
  - [French Treasury: Group of Creditors of Ukraine statement (17 Apr 2026)](https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement) (primary)
  - [IMF press release 26/66: EFF arrangement for Ukraine (26 Feb 2026)](https://www.imf.org/en/news/articles/2026/02/26/pr-26066-ukraine-imf-executive-board-approves-usd-8point1-billion-under-an-eff-arrangement) (primary)
  - [European Parliament Legislative Observatory 2022/0213(COD): exceptional MFA, provisioning 70% instead of 9%](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888) (primary)
  - [Schlegl, Trebesch and Wright: The Seniority Structure of Sovereign Debt (NBER w25793)](https://www.nber.org/papers/w25793) (primary)
  - [Interfax: Ukraine repaid USD 279.7m to the IMF in February 2026 (6 Mar 2026)](https://interfax.com/newsroom/top-stories/116503/) (primary)
  - [FRED (OECD): long-term government bond yields, 10-year, Germany (IRLTLT01DEM156N)](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01) (primary)
  - [Decision (EU) 2022/313 (emergency MFA EUR 1.2bn): loans provisioned under Regulation 2021/947](https://eur-lex.europa.eu/eli/dec/2022/313/oj) (primary)
  - [Regulation (EU) 2021/947 (NDICI), Article 31(5): provisioning rate 9% for macro-financial assistance](https://eur-lex.europa.eu/eli/reg/2021/947/oj) (primary)
  - [Decision (EU) 2022/1201 (exceptional MFA EUR 1bn): provisioning rate 70%](https://eur-lex.europa.eu/eli/dec/2022/1201/oj) (primary)
  - [Regulation (EU) 2022/2463 (MFA+ 2023, EUR 18bn): no provisioning and no provisioning rate set](https://eur-lex.europa.eu/eli/reg/2022/2463/oj) (primary)
- `narrow`: Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS) (used by 4 flows)
  - [Bank of Russia: External trade in services 2021 (PDF)](https://cbr.ru/Collection/Collection/File/43429/External_Trade_in_Services_2021.pdf) (primary)
  - [National Bank of Belarus: foreign trade dynamics (xls)](https://www.nbrb.by/statistics/foreigntrade/dynamics.xls) (primary)
  - [Belstat: exports/imports by country 2021 (xlsx)](https://www.belstat.gov.by/upload-belstat/upload-belstat-excel/Oficial_statistika/Godovwe/ExImS2-2021.xlsx) (primary)
  - [UN Comtrade API: Armenia monthly imports from Russia, Aug 2026](https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode=51&partnerCode=643&flowCode=M&period=202608&cmdCode=TOTAL) (primary)
  - [Eurostat bop_its6_det API: Cyprus services with Russia](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_its6_det?geo=CY&partner=RU&currency=MIO_EUR&bop_item=S) (primary)
  - [Statistics Agency of Uzbekistan press release](https://stat.uz/img/news/press-reliz-rus_p38034.pdf) (primary)
  - [EAEU Commission: mutual trade statistics, time series](https://eec.eaeunion.org/comission/department/dep_stat/tradestat/time_series/vzaimnaya-torgovlya-tovarami-dinamicheskie-ryady) (primary)
  - [Go Türkiye: Türkiye's 2025 tourism results](https://goturkiye.com/branding/press-releases/turkiye-announced-its-2025-tourism-results) (primary)
- `net_gain_russia`: Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat (used by 6 flows)
  - [Russian Finance Ministry: oil and gas revenues of the federal budget](https://minfin.gov.ru/ru/statistics/fedbud/oil) (primary)
  - [Rosneft 12M 2025 IFRS results](https://rosneft.com/press/releases/item/223842/) (primary)
  - [PhosAgro 9M 2025 results](https://www.phosagro.com/press/company/phosagro-reports-operating-and-financial-results-for-9m-2025/) (primary)
  - [Polyus FY 2025 results](https://polyus.com/en/media/press-releases/proizvodstvennye-i-finansovye-rezultaty-za-2-polugodie-2025-i-2025-god/) (primary)
  - [Rusal interim results H1 2026 (HKEX)](https://www1.hkexnews.hk/listedco/listconews/sehk/2026/0819/2026081900105.pdf) (primary)
  - [IEP: Monitoring of Russia's economic outlook 2026-3](https://www.iep.ru/files/RePEc/gai/mreoen/mreoen-2026-3-1492.pdf) (primary)
  - [Method: The net-gain rule (round 10)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/overview.md#the-net-gain-rule-round-10) (this project's method)
- `trade`: UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine (used by 4 flows)
  - [UN Comtrade API: all reporters' imports from Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Russia (partner 643), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=643&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' imports from Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: all reporters' exports to Ukraine (partner 804), HS TOTAL, 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2024&partnerCode=804&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Ukraine's own report by partner (mirror fallback), imports 2024](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=804&period=2024&flowCode=M&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [UN Comtrade API: Russia's own 2021 report by partner (mirror fallback), exports](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=643&period=2021&flowCode=X&cmdCode=TOTAL&customsCode=C00&motCode=0&partner2Code=0) (primary)
  - [ECB Data Portal: USD/EUR annual average exchange rate (EXR.A.USD.EUR.SP00.A)](https://data-api.ecb.europa.eu/service/data/EXR/A.USD.EUR.SP00.A?startPeriod=2021&format=csvdata) (primary)
- `trend`: Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life (used by 4 flows)
  - [UN Comtrade API (annual HS, all reporters vs Russia, 2012)](https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2012&partnerCode=643&flowCode=M&cmdCode=TOTAL) (primary)
  - [Eurostat sts_inpi_a API: euro-area import price index](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/sts_inpi_a?format=JSON&geo=EA20&unit=I21&indic_bt=PRC_IMP) (primary)
  - [FRED: Brent crude (DCOILBRENTEU)](https://fred.stlouisfed.org/series/DCOILBRENTEU) (primary)
  - [Method: the counterfactual models](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/counterfactual.md#3-the-16-models-of-generation-4) (this project's method)
- `trend2`: Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports (used by 4 flows)
  - [OECD-WTO BaTiS SDMX API: services trade with Russia 2010-2021](https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_BATIS@DF_BATIS,1.0/.RUS...S...?startPeriod=2010&endPeriod=2021) (primary)
  - [Eurostat bop_its6_det API: services and travel with Russia](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/bop_its6_det?partner=RU&bop_item=S&bop_item=SD&currency=MIO_EUR) (primary)
  - [Bank of Russia: balance of payments standard components (xlsx)](https://www.cbr.ru/vfs/statistics/credit_statistics/bop/bal_of_payments_standart.xlsx) (primary)
  - [IMF DIP SDMX: inward direct investment in Russia](https://api.imf.org/external/sdmx/2.1/data/IMF.STA,DIP/RUS..INWD_D_NETLA_FALL_ALL..A) (primary)
  - [Morport: Russian seaports cargo turnover 2021](https://www.morport.com/rus/news/gruzooborot-morskih-portov-rossii-za-12-mesyacev-2021-g) (primary)
  - [World Bank API: Russia GDP (current USD)](https://api.worldbank.org/v2/country/RUS/indicator/NY.GDP.MKTP.CD) (primary)
- `value_kept`: Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies (used by 4 flows)
  - [OECD TiVA 2025: domestic value added share of gross exports (SDMX)](https://sdmx.oecd.org/sti-public/rest/data/OECD.STI.PIE,DSD_TIVA_MAINSH@DF_MAINSH,1.1/EXGR_DVA..BTE+C+C19+C25+C26+C28+C302T309+GTN+H50+I.W.PT_EXGR.A?startPeriod=2018&format=csv) (primary)
  - [Federal Register 2024-01220: DFARS domestic content rule](https://www.govinfo.gov/content/pkg/FR-2024-02-15/html/2024-01220.htm) (primary)
  - [Bank of Finland Bulletin: collapse of trade with Russia had a limited effect on Finnish manufacturing](https://www.bofbulletin.fi/en/2024/3/the-collapse-of-trade-with-russia-has-had-a-limited-effect-on-finnish-manufacturing/) (primary)
  - [Hürriyet Daily News: Turkish defence local content 83%](https://www.hurriyetdailynews.com/defense-industrys-local-content-at-83-pct-gorgun-227711) (press report)
  - [Method: The money rule (round 6)](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/docs/method/overview.md#the-money-rule-round-6) (this project's method)

## What is still missing

Every flow has a method section. Every flow now also has a row in [decisions.md](decisions.md) that says why it is counted
and why this way; the nine that had none are under [Why each money flow is counted](decisions.md#why-each-money-flow-is-counted),
where aspects with no reason on record are marked "reason not recorded".

These flows have **no confirmed primary link among their own sources** (press reports or this project's models only): none.

The open issues behind the numbers are in [limitations](limitations.md).

## See also

- [decisions.md](decisions.md): every modelling choice, with its reasons and evidence
- [decision-log.md](decision-log.md): how the method got there, round by round
- [reference/research-files.md](reference/research-files.md): every research file and where it is used
- [reference/pipeline.md](reference/pipeline.md): the build steps in order
- [Documentation index](README.md)
