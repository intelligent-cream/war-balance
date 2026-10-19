# Decisions: every modelling choice, why it was made, and its evidence

The map combines published data with modelling choices. This page lists every choice that changes a number: what was
chosen, why, what the alternative was, and where the data and evidence are. Data and choices are kept apart on purpose.
A figure taken from a statistics office is **data**. A rule for combining figures is a **decision**, and a
**decision** can be argued with even when every input is right.

The project was built with AI assistance (Claude) under one person's direction. The author set the question and
decided the choices below, many of them proposed or refined with Claude; the research files were compiled by AI
research agents with web search. **None of the inputs has yet been
checked line by line by a person.** The verification status of each input is in
[`verify_r11_aid.json`](../research/2026-10/verify_r11_aid.json) and
[`verify_r11_trade.json`](../research/2026-10/verify_r11_trade.json); the exact primary link behind every source is in
[`sources_r11.json`](../research/2026-10/sources_r11.json). Corrections are welcome as a GitHub issue or on Reddit
(u/Intelligent-Cream-14).

## 1. The question and the unit

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Measure **money moved toward Ukraine or toward Russia because of the war**, per country, 2022 to August 2026 | Aid totals alone hide that some donors kept paying Russia for energy, and that some aid was spent in the donor's own economy | Count aid only (Kiel Institute does this, and it is the better source for aid alone) | [overview](method/overview.md#the-core-idea-in-four-steps) |
| Show the total as **% of one year's GDP** (2024) | Lets small and large economies be compared; per person and total euros are one click away | Total euros (favours large economies) | GDP: World Bank WDI, IMF WEO ([sources](reference/sources.md)) |
| Compare with **what would have happened without the war**, not with zero | Buying less from Russia than before is money Russia did not get; buying the same as before is not new support | Compare with 2021 levels only | [counterfactual](method/counterfactual.md) |

## 2. Aid and the cost of hosting refugees

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Aid from the **Kiel Institute Ukraine Support Tracker** (bilateral allocations) | The most complete, item-level, peer-reviewed aid database | Pledges (overstate), national press releases (inconsistent) | [aid](method/aid-refugees-military.md#aid) |
| **EU-level aid** split over members by their share of the EU budget | Members pay for it; Kiel uses the same split | Leave it with "the EU" (hides members' share) | [EU-level aid](method/aid-refugees-military.md#eu-level-aid) |
| **Loans at their grant element** (10% discount rate, 6–15% range; the 10% is a judgement, [below](#constants-and-rules-written-down-in-round-11)) | A loan that is repaid costs the lender less than a grant | Face value (overstates loans) | [loans](method/aid-refugees-military.md#loans-at-their-economic-value-round-5) |
| **Donated weapons at market value** (what they are worth to Ukraine), not the donor's book value | Old stock is often booked low or high; the value to Ukraine is what matters for the shift | Book value as reported | [weapons](method/aid-refugees-military.md#donated-weapons-at-market-value-round-5) |
| **Refugees at net cost**: hosting cost minus the taxes working refugees pay, floored at zero | Hosting is real support, but working refugees also pay taxes | Gross cost (overstates hosts with high employment) | [refugees](method/aid-refugees-military.md#refugees) |

## 3. Trade with Russia and Ukraine

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Trade from **customs data** (UN Comtrade, Eurostat), the reporter's own figures first, then partner (mirror) figures | Official, comparable across countries | Russian statistics (largely suspended since 2022) | [trade](method/trade.md#sources-and-filling-order) |
| **Purchases count at the seller's net gain**: Russia's taxes plus profit above a normal return, per product and year; the same for Ukraine | Aid is a gift; trade is an exchange, so only the seller's gain is comparable with aid (suggested by a reader) | Full price (treats trade like a gift) | [net-gain rule](method/overview.md#the-net-gain-rule-round-10) |
| **Sales to Russia count at the seller's income** (value kept × genuinely extra) | The seller gave up goods; only the extra income is a gain | Full sales value | [money rule](method/overview.md#the-money-rule-round-6) |
| **Freight taken out** of import values (CIF to FOB) | Freight is paid to shippers, not to Russia | Leave customs values as they are | [freight](method/trade.md#freight-cif-to-fob) |
| **Re-export hubs**: goods passed through the UAE, Armenia, Kazakhstan and others count for the country that made them | Otherwise the hub looks like the supplier | Count at the hub | [re-exports](method/trade.md#re-export-hubs) |

## 4. Energy

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| **War-time price premium counts in full**: payments minus the same volume at the prices markets expected before the invasion | The premium cost Russia nothing more to produce | Compare with 2019–2021 prices (overstates, prices were already rising) | [windfall](method/prices.md#war-time-windfall), [no-war prices](method/prices.md#no-war-prices-round-7) |
| **Gas counted where it is burned**, not where it crosses a border | Transit countries do not pay for gas they pass on | Customs data as recorded | [transit gas](method/energy-and-laundered-oil.md#transit-gas) |
| **Fuel refined from Russian crude** (e.g. Indian diesel) charged to the **final buyer**, at the measured share of the price that reaches Russia; the refiner keeps the rest and its discount profit | The buyer's demand creates the sale; the refiner chose the crude and keeps the discount | Charge the refiner; or ignore it | [laundered oil](method/energy-and-laundered-oil.md#laundered-oil), [crude share](method/energy-and-laundered-oil.md#valuing-and-capping) |

## 5. Money flowing back and Russia's state and companies

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| **Money flowing back**: aid spent in the donor's own economy (weapons built at home, replacing donated stock) is subtracted at value kept × genuinely extra | A donor's industry earns from it, so the donor's net cost is lower | Ignore it (overstates large arms producers) | [flowback](method/aid-refugees-military.md#flowback) |
| **Taxes companies still pay in Russia** count toward Russia (profit tax plus half of other taxes) | Taxes fund Russia's state | Leave out | [company taxes](method/services-shipping-companies.md#company-taxes) |
| **Profits Russian-owned companies abroad send home** count toward Russia | Money reaching Russian owners | Leave out | [Russian-owned companies](method/russia-state-and-companies.md#russian-owned-companies-abroad) |
| **The return Russia lost on its frozen reserves** counts toward Ukraine, for the holder countries | Holding them is a choice that denies Russia income | Count the frozen principal (it is not spent) | [frozen reserves](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| **Weapons and troops sent to Russia** (North Korea, Iran, Belarus) count toward Russia at market value | Direct military support | Leave out (no customs data) | [military support](method/aid-refugees-military.md#military-support-to-russia) |
| **Critical goods** (chips, machine tools) are a marker, not added | They are already inside the trade figures | Add them (counts twice) | [marker](method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7) |

## 6. Uncertainty

| decision | why | alternative | evidence and detail |
|---|---|---|---|
| Every part has a **likely range (about 90%)**, combined in quadrature | Most inputs are estimates; the no-war baseline is the biggest uncertainty | Single numbers (false precision) | [ranges](method/ranges.md) |
| A total takes the **weakest certainty letter** of its parts (A reported to D rough) | A total is only as reliable as its weakest part | Average letters | [certainty](method/ranges.md#certainty-letters) |
| Countries whose range crosses zero are **left out of top lists** | Even the direction is uncertain | Rank them anyway | [ranges](method/ranges.md) |
| **Nothing missing counts as zero**: gaps are estimated, with wide ranges | No country should rank well for having no data | Treat missing as zero | [README](README.md) |

## Assumptions backed by data (round 11)

Round 11 checked the judgement values behind the rules above against data. The proposals are in four research files
([gain](../research/2026-10/gaps/assumptions_r11_gain-notes.md), [rules](../research/2026-10/gaps/assumptions_r11_rules-notes.md),
[hubs](../research/2026-10/gaps/assumptions_r11_hubs-notes.md), [people](../research/2026-10/gaps/assumptions_r11_people-notes.md)).
The research files keep their old values. `build_data.py` applies each proposals file in one step,
`apply_assumptions_r11_*()`, when the file it changes is loaded. A few are constants. No person has reviewed them yet.
Effects are on the headline (% of GDP, 2022 to August 2026, central), unless the cost view is named.

| assumption | old | new | basis | source | effect |
|---|---|---|---|---|---|
| Russia's net gain on services | 0.08 every year | 0.032–0.044 | data: Rosstat profit and return on assets by activity | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/) | whole gain file: Tajikistan −0.24, Armenia −0.18, Kyrgyzstan −0.14, Belarus +0.18, Estonia −0.19, Lithuania −0.11 |
| Russia's net gain on arms | 0.12 | 0.039–0.050 (high stays 0.12) | data: arms makers' margins, Rostec, Rosoboronexport | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/) | weapons bought from Russia count about 60% less (India EUR 0.52bn → 0.19bn) |
| Russia's net gain on food, wood, chemicals, steel, aluminium, other goods | judgement per group | sector profit plus export duties collected; food lower, steel higher | data (2026 repeats 2025) | [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/), [Rusal](https://www1.hkexnews.hk/listedco/listconews/sehk/2024/0426/2024042604499.pdf) | the weighted average of other goods hardly moves: 0.200 → 0.197 (2021), 0.185 → 0.167 (2022), 0.133 → 0.130 (2026) |
| Ukraine's net gain on other food, other metals, wood, machinery, chemicals, other | judgement | 2021 from division profits; 2022–2026 from a proxy | data for 2021, judgement after | [Derzhstat](https://stat.gov.ua/sites/default/files/2023-08/%D0%A0%D0%B5%D0%BD%D1%82%20%D0%BE%D0%BF%D0%B5%D1%80%20%D1%82%D0%B0%20%D1%83%D1%81%D1%96%D1%94%D1%97%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%BF%D1%96%D0%B4%D0%BF%D1%80%20%D0%B7%D0%B0%20%D0%B2%D0%B8%D0%B4%20%D0%B5%D0%BA%D0%BE%D0%BD%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%B7%20%D1%80%D0%BE%D0%B7%D0%BF%D0%BE%D0%B4%20%D0%BD%D0%B0%20%D0%B2%D0%B5%D0%BB%20%D1%81%D0%B5%D1%80%D0%B5%D0%B4%20%D0%BC%D0%B0%D0%BB%D1%96%20%D0%BC%D1%96%D0%BA%D1%80%D0%BE%D0%BF%D1%96%D0%B4%202010%202021.zip) | Ukraine's average gain 0.182 → 0.175 (2021), 0.045 → 0.042 (2023); small |
| Lost sales to Russia, share not redirected | default 0.25/0.40/0.60, Finland 0.15/0.30/0.50, Baltic states 0.25/0.45/0.65 | 0.20/0.35/0.55, 0.10/0.25/0.45, 0.20/0.40/0.60 | judgement on firm-level studies | [IZA DP 16146](https://repec.iza.org/dp16146.pdf) | less credit for sales given up: Finland −0.14, Czechia −0.11, Moldova −0.11, Lithuania −0.09, Estonia −0.07 |
| Own-industry share of military aid where no evidence exists | 0.2/0.4/0.7 | 0/0.1/0.3 (Albania, North Macedonia, Montenegro only) | judgement | [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) | none: the money ledger already replaces this share |
| Where EU-level military aid is spent | SIPRI production shares × 0.78 (France 0.30, Germany 0.19...); in the ledger France 0.72bn, Germany 0.44bn, Italy 0.35bn | Sweden 0.28 (Gripen), all other members 0.03 by ASAP grants, about 0.7 to Ukraine's drone industry; all in 2026 | data (the 0.03 is judgement) | [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) | gross flowback 2026: France 0.97 → 0.31bn, Germany 0.63 → 0.27bn, Italy 0.48 → 0.15bn, Sweden 2.81 → 2.69bn; headline +0.01 at most |
| What a loan costs the lender (cost view) | 0.30 of face | 0.26 (0.09–0.47) | data (terms) and judgement (expected loss) | [Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf) | cost view only: Japan's loans EUR 3.05bn → 2.65bn |
| Import duties waived for Ukraine (cost view) | 4% for the EU, UK and Canada, every year | EU 0.3% from June 2022 to June 2025, UK 0.2%, Canada 1%; the map uses their weighted average, 0.2% | data | [OEIL 1702126](https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1702126) | cost view only: EU members about −0.1 point (Poland 2.08 → 1.96) |
| UAE share of fuel sold as bunkers | 0.15/0.30/0.45 | 0.20/0.30/0.40 | data: Fujairah bunker sales | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | low end of the UAE only; none on the headline |
| Panama resale and bunker shares | 0/0.01/0.10, bunkers 0.05/0.20/0.50 | 0/0.05/0.35, bunkers 0.30/0.40/0.50 | judgement on data | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=591&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | none: Panama has no laundered oil left after the next row |
| Partners' records of fuel "exports" to flag registries | counted as laundered oil bought by Liberia, the Marshall Islands, Panama, Malta | dropped: they are bunkers sold to ships under those flags; Malta keeps what its own customs record | data: own against partner customs | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?partnerCode=430&period=2024&flowCode=X&cmdCode=2710) | Panama +0.03; Liberia's and the Marshall Islands' laundered oil goes to zero |
| Malta's bunkers in the middle case | the hub keeps 97% | keeps 1 − resale − half the bunker share | judgement | [Eurostat](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_oil?format=JSON&siec=O4600&geo=MT&unit=THS_T&nrg_bal=IMP&nrg_bal=EXP&nrg_bal=INTMARB&nrg_bal=GID_OBS&nrg_bal=TO_RPI_RO&nrg_bal=FC_E) | Malta +0.28 with the next row |
| Laundered-oil cap per territory | 1% / 2% of GDP | from fuel use: Liberia 0.25%/0.85%, Togo 0.27%/0.89%, Malta 0.15%/0.4%, Panama 0.02%/0.09%; applied to the final values | data (volumes), judgement (shares) | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=470&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710) | Togo's laundered oil EUR 0.10bn → 0.03bn a year; Malta 0.06–0.09bn → 0.035bn |
| Belgian firms' profit tax in Russia, 2022 | EUR 11.8m (allocated) | EUR 16m (12–35m) | data | [Brussels Times](https://www.brusselstimes.com/590174/global-corporations-pay-3-5-billion-in-taxes-to-kremlin) | tiny |
| Refugee hosting cost, Romania 2023 | 0.16 | 0.24 (0.20–0.32) | data | [Presshub](https://www.presshub.ro/exclusiv-romania-datoreaza-refugiatilor-ucraineni-300-de-milioane-de-lei-in-schimb-ii-trimite-la-munca-282164/) | none: refugees' taxes still exceed the cost, so the net stays at zero |
| Refugee hosting cost, Bulgaria 2022 | 0.22 | 0.30 (0.27–0.40) gross, minus BGN 300m paid from EU funds | data | [Sofia Globe](https://sofiaglobe.com/?p=109602) | Bulgaria's own net cost falls to zero; −0.07 |
| Refugee hosting cost, Hungary 2022–2026 | 0.51 in total | 0.18 (the government's all-in total is about EUR 0.25bn) | data | [Budapest Times](https://www.budapesttimes.hu/hungary/the-biggest-relief-operation-of-hungary/) | net cost EUR 0.29bn → 0; −0.14 |
| Refugee hosting cost, Belgium 2022 / 2023 | 0.28 / 0.42 | 0.40 / 0.55 | data (one budget line) | [Brussels Times](https://www.brusselstimes.com/474292/we-cannot-afford-this-belgian-mp-condemns-colossal-ukrainian-refugee-aid) | net cost EUR 0.57bn → 0.82bn; +0.04 |
| Refugee hosting cost, Latvia 2023–2026, Estonia 2022, Georgia 2022 | Latvia 0.05/0.04/0.03/0.015, Estonia 0.05 | Latvia 0.06/0.06/0.065/0.04, Estonia 0.06, Georgia range 0.006–0.03 | data | [LSM](https://www.lsm.lv/raksts/zinas/latvija/21.11.2024-vel-uz-gadu-pagarina-atbalstu-ukrainas-begliem-latvija.a577249/), [ERR](https://www.err.ee/1608579985/riisalo-pogenikevoog-eestisse-hakkab-stabiliseeruma) | about none: these nets stay near zero |
| OECD's modelled 2022 cost as the lowest high bound | none | for hosts costed as refugees × a rate (Austria, Portugal) | judgement | [OECD IMO 2022](https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/10/international-migration-outlook-2022_140ace0e/30fe16d2-en.pdf) | ranges only |
| Russia's share of remittances, Tajikistan | 0.80/0.88/0.93 | 0.80/0.88/0.97 | data: mirror ratio 2019–2021 | [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/) | range only (low end −83.7 → −89.8) |
| Russia's share of remittances, Belarus | 0.30/0.45/0.60 | 0.30/0.40/0.50 | data: mirror ratio 2019–2021 | [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/) | Belarus's wages from Russia ×0.889; +0.07 |
| Moldova's transfers from Russia 2024–2026 | 0.092 / 0.080 / 0.043 | 0.07 / 0.018 / 0.008 | data: central bank, CIS remittances | [BNM](https://bnm.md/files/Anuar_CI_2023.pdf) | Moldova earns less from Russia: +0.32 (whole file) |
| Private donations, 2022 | Austria 0.074, Czechia 0.096, Denmark 0.059, Finland 0.041, Japan 0.58 | 0.11, 0.19, 0.13, 0.06, 0.15; also Finland and Lithuania 2023, Lithuania 2025, Latvia and Estonia low ends | data: national totals | [Japanese Red Cross](https://www.jrc.or.jp/about/publication/news/20230207_030624.html), [Seznam Zprávy](https://www.seznamzpravy.cz/clanek/fakta-jak-valka-na-ukrajine-zmenila-cesko-cesi-jsou-nejsolidarnejsi-v-historii-226309) | Japan −0.01, Czechia +0.03, Denmark +0.02 |
| Hong Kong gold passed on to the mainland, 2026 | 0.372 (2025 carried) | 0.675 (0.52–0.88) | data: Comtrade January–May 2026 | [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode=344&period=202605&partnerCode=0,643,156&flowCode=M,X&cmdCode=7108) | Hong Kong +0.80 with the next two rows; China moves little |
| Freight share of import values (CIF to FOB) | 3.5%/5.5%/7.5% for every importer | OECD ITIC margin per importer for the 25 largest buyers (China 6.4%, India 7.2%, Türkiye 8.6%, Korea 9.3%), else 4.5%/6.5%/9% | data (mostly modelled by OECD) | [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015) | distant buyers pay Russia a little less: Türkiye +0.09, India +0.05 (whole file) |
| Freight share of gold | 5.5% | 0.1%/0.5%/2% | data: Türkiye's reported margin | [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015) | gold passed on by the UAE and Hong Kong keeps its full value |

**Left out, and why.**

- **Loans per class** (Japan's IBRD guarantees cost it about 0.05 of face, not 0.26). The map holds one loan total per
  donor, not loans by class, so one value is used.
- **Duties per country and period.** The map's cost view applies one rate to all three waivers. The weighted average
  keeps the 2022–2026 total right, but not the split between the EU, the UK and Canada, or by year.
- **Redirection fading after three years** (×0.7 for 2025–2026). It is optional in the proposal, and the money-rule
  factor is one value for all years.
- **Gibraltar's half bunker share.** Its fuel already counts at 10% for the same reason (bunkers paid by shipowners), so
  this would count the bunkers twice.
- **Romania's EU reimbursement.** Its donor-funded share already covers EU funds.
- **Gold freight for gold bought directly** (the UAE's own, Türkiye, Switzerland, India). The map does not separate it
  from other goods; only gold passed on by the UAE and Hong Kong is tagged.
- **The data-based use of Liberia, Panama and the Marshall Islands** (EUR 2–13m a year in the proposal). It is a cap, not
  a value; with the bunker records dropped, these registries keep no laundered oil.
- **Bahamas and other flag states.** Greece's records of exports to them look the same, but their own customs were not
  checked.
- **Confirmed and kept:** hub resale shares for the Netherlands, Belgium, Greece, Malta, Singapore, Türkiye, India,
  Togo and Gibraltar; payment-agent fees; Greek shadow-fleet freight; other company taxes; extra sales to Russia, weapons,
  tourism and shadow-shipping factors; refugee costs of Ireland, the UK and Moldova; Canadian and US donations; Hong
  Kong's 2022–2025 onward shares; the Marshall Islands' and Gibraltar's caps.

## Constants and rules written down in round 11

A traceability audit in round 11 found choices that change a number but were not on this page, and constants in the
code that no research file explains. They are listed here, labelled **data** (traced to a file or a source) or
**judgement** (a choice someone made, which can be argued with). None of the values was changed by the audit. Line
numbers are those of the round-11 audit version of [`build_data.py`](../pipeline/build_data.py) and
[`site/index.html`](../site/index.html).

### Decisions that were not written down

| decision | data or judgement | why | where |
|---|---|---|---|
| **Euroclear and Clearstream**: a third of the return denied on reserves they hold goes to the host (Belgium, Luxembourg), two thirds to all EU members by their share of EU-level aid | judgement (owner, round 7) | the freeze is an EU decision, but the host carries the legal risk. It moves Belgium by about 0.8 points of GDP | `HOST_SHARE`, build_data.py:2530; [frozen reserves](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7) |
| **Default ranges per certainty letter**: A ±5%, B ±15%, C ±35%, D ±70% | judgement | a part with no range of its own still needs one; the widths grow with how little was checked | `RANGE`, index.html:518; [ranges](method/ranges.md#certainty-letters) |
| **Baseline and actual values correlated 0.5** inside `spread()` | judgement | both come from the same statistics office, so their errors partly cancel; not measured | index.html:615; [ranges](method/ranges.md#quadrature-for-traded-flows-spread) |
| **Letters fixed in `calc()`**: gold and hidden payments always D, Russian oil bought via other countries always C, the share of EU-level aid always B | judgement | every buyer's value in these parts is modelled the same way | index.html:680, :687, :695; [ranges](method/ranges.md#certainty-letters) |
| **Laundered-oil cap of 1% (middle) and 2% (high) of GDP a year**, where fuel use is not measured | judgement | ship registries and storage points cannot use the fuel the model assigns them. Still applies to the Marshall Islands and Gibraltar | `LAUNDERED_CAP`, build_data.py:366; [energy](method/energy-and-laundered-oil.md#valuing-and-capping) |
| **Hub trading margins**: goods 5–20%, UAE 3–15%, gold 0.3–6%, Belarus 10%, Baltic states 7% | judgement ("an educated guess" in the research) | a hub that passes goods on keeps only its margin | [trade](method/trade.md#re-export-hubs), [reexports-notes](../research/2026-10/gaps/reexports-notes.md) |
| **Non-reporting partners: only the paid share counts** | data per country, judgement in the rule | Russian supplies given on credit or as aid are Russian support, not money to Russia | build_data.py:616; [nonreport-notes](../research/2026-10/gaps/nonreport-notes.md) |
| **Private donations where no national total exists**: 0.015% of GDP (Western donors), 0.03% (Central and Eastern Europe), 0.06% (Baltic states) for 2022 | judgement | scaled on the countries with national totals | [uncovered-notes](../research/2026-10/gaps/uncovered-notes.md); [aid](method/aid-refugees-military.md#undisclosed-aid-and-private-donations) |
| **Countries with no aid record**: 0, with an upper bound of 0.002% of 2022 GDP (less in later years) | judgement | nobody is assumed to have given nothing for certain | [aid_gaps-notes](../research/2026-10/gaps/aid_gaps-notes.md) item 4 |
| **2026 no-war price = the actual world price** (the Hormuz closure) | judgement | the 2026 price spike came from the closure of the Strait of Hormuz, not from Russia's war. The research left this open: keeping the pre-invasion path would count the spike as windfall (over half of India's) | `NW_WORLD_2026`, build_data.py:1747; [prices](method/prices.md#no-war-prices-round-7), [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) open question 2 |
| **Gold colour and outline**: a country is gold when its total is negative mainly because it earned from the war effort; the outline needs at least EUR 10m and 0.05% of GDP | judgement (owner, round 6) | earning from supplying Ukraine is not money toward Russia; the threshold hides rounding noise | index.html:761–762; [overview](method/overview.md#two-balances-round-6) |
| **Rankings leave out economies under EUR 5bn GDP** | judgement | small economies' trade data are noisy and would fill the top of a % of GDP list | `MIN_GDP_RANK`, index.html:1530 |
| **Loan cost range in the cost view**: half to one and a half times the grant equivalent (13%–39% of face) | judgement | a symmetric band around the middle; the round-11 research measured 9%–47% | index.html:711 |
| **10% discount rate for loans** | judgement | the bottom of Ukraine's post-restructuring Eurobond yields. It is not a current international standard: the IMF's debt-limits policy uses a unified 5% ([IMF](https://www.imf.org/en/Topics/sovereign-debt/debt-limits-policy)); 10% was the OECD DAC's old flat rate | [loans](method/aid-refugees-military.md#loans-at-their-economic-value-round-5), [loans_value-notes](../research/2026-10/gaps/loans_value-notes.md) |
| **One duty rate for all three waivers** (EU, UK, Canada), weighted by purchases | judgement | the map holds one rate (`META.tariff_rate`); see "Left out" above | `TARIFF_RATE_YEARS`, build_data.py:61 |
| **Refugee letters**: a grade such as "A-B" counts at its weaker letter; Poland's refugee part at most C | judgement (round 11 audit) | Poland's and Czechia's costs were checked only against press articles ([verify_r11_aid-notes](../research/2026-10/verify_r11_aid-notes.md)). Czechia A → B, Poland, Germany and Lithuania B → C; no total's letter or value changes | `REFUGEE_CERT_CAP`, build_data.py:2350 |

### Constants in the code

| file:line | constant | status | basis |
|---|---|---|---|
| build_data.py:323 | `EUR_PER_MT_2021`: crude 0.414, products 0.549, gas and LNG 0.583, coal 0.130 EUR bn per Mt | data | CREA's 2021 value for Germany by fuel ([`crea.json`](../research/2026-10/crea.json)) ÷ the tracker's 2021 tonnes ([`energy.json`](../research/2026-10/gaps/energy.json)): 9.065/21.935, 4.057/7.393, 18.177/31.167, 0.831/6.37 |
| build_data.py:343, :952 | China's fuel = crude value ÷ **0.70** | judgement | called "India's measured crude-to-fuel ratio", but India measures 0.64–0.75 by year (mean 0.67, [crude_content](../research/2026-10/gaps/crude_content-notes.md)). See proposals below |
| build_data.py:3046 | `HK_METALS_SHARE = 0.98` | **not traced** | no research file holds Hong Kong's HS 71 imports from Russia; the raw Comtrade downloads have totals only |
| build_data.py:1615 | `GAS_IN_CUSTOMS`: Türkiye 1.0, Poland 1.0, Germany 0.07 | Türkiye and Poland: data; Germany: judgement | [audit-notes](../research/2026-10/gaps/audit-notes.md) items 1 and 8 (Türkiye, Poland's Yamal gas in chapter 99); item 2 gives EUR 2.3–3.5bn of unlabelled German gas, but not the 7% |
| build_data.py:3103 | Gibraltar keeps 10% (5–30%) of its Russian fuel | judgement | a reseller's margin, as for other hubs; bunkers are paid by shipowners elsewhere |
| build_data.py:3124 | Malta's services bought from Russia 0.127, 0.133 (2021–2022), ±35% | data, band judgement | the map's own 2021–2022 values and the 2023–2026 fix in [`round4b.json`](../research/2026-10/gaps/round4b.json) `artefacts.MLT`; ±35% is the width of letter C |
| build_data.py:180 | Malta's own fuel imports, low ×0.76, high ×1.43 | judgement | the band of the model's laundered-oil values, applied to Malta's own customs figure |
| build_data.py:222 | Hungary's refugee cost, low ×0.6, high ×1.5 | data (proposal) | `range_factor` in [`assumptions_r11_people.json`](../research/2026-10/gaps/assumptions_r11_people.json) |
| build_data.py:2527 | `BEL_EUROCLEAR_TAX`: 2024 1.7, 2025 1.0, 2026 0.5 | 2024–2025 data, 2026 judgement | [frozen_assets-notes](../research/2026-10/gaps/frozen_assets-notes.md) item 3 (Belga); 2026 is "a guess" |
| build_data.py:2563 | frozen-reserve return, low end ×0.8 | judgement | Russia would have spent part of the reserves; the notes guess 10–30% |
| build_data.py:918 | EU laundered oil ×0.62 (0.5–0.8) | middle data, band judgement | 0.62 = 1 ÷ 1.6, Global Witness's 35m barrels against the model ([audit-notes](../research/2026-10/gaps/audit-notes.md) item 4); the Global Witness report itself is not linked |
| build_data.py:1752–1786 | `GAS_FORMULA`, `LNG_FORMULA` weights (Türkiye 0.7/0.3, Greece, Bulgaria, North Macedonia, Moldova 0.5/0.5, default 0.75/0.25, Taiwan and China LNG 0.5/0.5) | contract types data, mixed weights judgement | [energy_nowar-notes](../research/2026-10/gaps/energy_nowar-notes.md) section 2 and its note that the hub shares are "judgement calls"; Türkiye from [turkey_prices-notes](../research/2026-10/gaps/turkey_prices-notes.md) |
| build_data.py:1979 | services trend bounds kept within ×2.5 of the middle | judgement | tiny or noisy series give extreme fitted bounds |
| build_data.py:1991 | company-tax trend fallback 1.045 | data | `trend2.json` global central ([trend2-notes](../research/2026-10/gaps/trend2-notes.md)) |
| build_data.py:1645 | Belarus gas price ±2% | judgement | a dollar contract price; [`gas_prices.json`](../research/2026-10/gaps/gas_prices.json) itself gives ±8% (2023–2025) and ±15% (2026) |
| build_data.py:1673 | Tajikistan's 2021 price band ±3% | judgement | its 2021 band came from a fixed ratio that cancels in the index |
| build_data.py:2239 | `conduit` Kazakhstan 3.5, Netherlands 4.7 | data | Polymetal's transfer, EUR 3.5bn (1.7–6.0), and Yandex in [company_flows-notes](../research/2026-10/gaps/company_flows-notes.md); the notes' table rounds Kazakhstan to 3.6 |
| build_data.py:3062 | freight share per importer, low ×0.7, high ×1.4 | judgement (in the proposal) | the rule in [`assumptions_r11_people.json`](../research/2026-10/gaps/assumptions_r11_people.json) `CIF_SHARE` |
| build_data.py:76 | `USD_PER_EUR` 2022–2024 | data | ECB annual averages ([trade-notes](../research/2026-10/trade-notes.md)) |
| build_data.py:1611 | `MWH_PER_BCM = 10.55e6` | data | 10.55 kWh per m3, gross calorific value, as in `energy2.json` and `gas_prices.json` |
| build_data.py:3481 | UAE customs fuel taken off CREA's: 0.37, 0.62, 0.19 (2024–2026) | data | [round4b-notes](../research/2026-10/gaps/round4b-notes.md); 2026 is 0.19, not 0.26, because the addition cannot fall below zero |

### Proposals that would change numbers (not applied)

The audit found these values questionable. Changing them would move figures on the map, so they are left as they are
until someone decides. The expected effect is a rough estimate.

| value | proposal | expected effect |
|---|---|---|
| China's crude-to-fuel ratio 0.70 | use India's measured ratio per year (`crude_k(y, "IND")`, mean 0.67) | about EUR 0.7bn more crude money moved from China to its fuel buyers over 2022–2026, about EUR 0.4bn at Russia's net gain on crude: China's headline moves by less than 0.01 points; its buyers move toward Russia by the same amount in total |
| loan cost range in the cost view (13%–39% of face) | use the measured 9%–47% (`loans_grant_eq_lo/hi` in `data.json`) | cost view only: wider ranges for loan-heavy donors (Japan, Germany, France, Canada); middle values unchanged |
| 10% discount rate | test 5% (IMF) or Ukraine's 2021 yields (6–7%) | loans would count for less: the research's low end already does this (EUR 96.5bn face → about 40bn instead of 64bn); Japan, Germany, France, Canada, Italy and the UK move down |
| one duty rate for the EU, UK and Canada (0.2%) | one rate per waiver | cost view only, tiny: the EU's purchases dominate the average, so EU members barely move (the split by year changes); the UK about the same; Canada's very small part about five times larger |
| Belarus gas price ±2% | the research's ±8% / ±15% | Belarus's range a little wider; middle unchanged |
| `HK_METALS_SHARE` 0.98 | measure HS 71 ÷ all Hong Kong imports from Russia (UN Comtrade) | unknown until measured; it sets how much of Hong Kong's rise counts at the gain on gold |
| Germany's `GAS_IN_CUSTOMS` 0.07 | derive it from EUR 2.3–3.5bn of unlabelled gas against German final-use gas | small: Germany's payments to Russia move by at most about EUR 1bn |

## What is data and what is estimated

- **Reported data** (certainty A–B): aid (Kiel), customs trade, fossil fuel payments (CREA), GDP, refugee counts.
- **Estimates and models** (certainty C–D): the no-war baseline, net-gain shares, value kept, refugee costs outside
  27 hosts with budgets, laundered oil per buyer, shadow-fleet shipping, company taxes outside about 20 reporting
  countries, payment agents, remittance shares, military support to Russia, private donations, undisclosed aid.

Each part in a country's panel shows its certainty letter and numbered sources; the
[sources page](reference/sources.md) lists them, and [`sources_r11.json`](../research/2026-10/sources_r11.json)
gives the exact primary links.
