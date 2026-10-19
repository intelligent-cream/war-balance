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
| **Loans at their grant element** (10% discount rate, 6–15% range) | A loan that is repaid costs the lender less than a grant | Face value (overstates loans) | [loans](method/aid-refugees-military.md#loans-at-their-economic-value-round-5) |
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

## What is data and what is estimated

- **Reported data** (certainty A–B): aid (Kiel), customs trade, fossil fuel payments (CREA), GDP, refugee counts.
- **Estimates and models** (certainty C–D): the no-war baseline, net-gain shares, value kept, refugee costs outside
  27 hosts with budgets, laundered oil per buyer, shadow-fleet shipping, company taxes outside about 20 reporting
  countries, payment agents, remittance shares, military support to Russia, private donations, undisclosed aid.

Each part in a country's panel shows its certainty letter and numbered sources; the
[sources page](reference/sources.md) lists them, and [`sources_r11.json`](../research/2026-10/sources_r11.json)
gives the exact primary links.
