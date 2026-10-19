# Sources

This page lists the main external sources behind the map, grouped by topic, each with its address and a link to the method page that uses it. It is a guide, not the complete list: the research files cite about a thousand individual documents (official statistics, government reports, research institutes, press reports). The complete, per-value source lists are in each research file's `sources` field and its `*-notes.md` file ([research-files.md](research-files.md)), and the 55 source entries the map itself shows (numbered on every figure) are in `site/data.json` under `sources`; since the round-11 audit, `data.json` lists only sources that a part cites. Retrieval dates are 17–19 October 2026 unless a note says otherwise.

**The exact links (round 11).** [`sources_r11.json`](../../research/2026-10/sources_r11.json) ([notes](../../research/2026-10/sources_r11-notes.md)) gives, for every source id, the exact table, dataset query or report each figure comes from, marked `primary`, `secondary` (press) or `model`, and whether the link was confirmed. The build copies the confirmed links into `data.json` (`links`), and the map shows them under each source. Some sources rest on press reports only; [limitations](../limitations.md) lists them. The original sources keep their own terms of use.

## Trade

Used in [trade.md](../method/trade.md) and [counterfactual.md](../method/counterfactual.md).

| source | address | used for |
|---|---|---|
| UN Comtrade (public preview API) | https://comtradeapi.un.org/public/v1/preview/C/A/HS · https://comtradeplus.un.org/ | goods trade with Russia and Ukraine by reporter, mirror data, HS chapters, re-export flags, dual-use headings, gold (HS 7108) |
| Eurostat Comext DS-045409 | https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409 | EU monthly trade 2024–Aug 2026, unit values |
| IMF International Trade in Goods (IMTS) | https://api.imf.org/ (SDMX `IMF.STA,IMTS`) | non-reporters, Ukraine's own 2025–2026 data |
| Russia FCS totals (via press reports) | (customs.gov.ru not reachable) | Russia's imports, residual gap ([residual-notes.md](../../research/2026-10/gaps/residual-notes.md)) |
| National statistics: Belstat, NBRB, Armstat, stat.uz, National Bank of Georgia, TÜİK, Monstat | e.g. https://www.nbrb.by/statistics/foreigntrade/dynamics.xls | [`narrow.json`](../../research/2026-10/gaps/narrow.json) |
| UAE Ministry of Economy / Foreign Trade | see [round4b-notes.md](../../research/2026-10/gaps/round4b-notes.md) | UAE non-oil trade with Russia |
| Swissaid | https://www.swissaid.ch/en/media/united-arab-emirates-more-than-ever-a-hub-for-conflict-gold/ | UAE gold from Russia |
| S&P Global Market Intelligence | https://www.spglobal.com/market-intelligence/en/news-insights/research/navigating-sanctions-evasion-trade-analysis-of-high-priority-goods-exports-to-russia | Turkey re-export share |
| KSE Institute, critical components | https://sanctions.kse.ua/wp-content/uploads/2026/07/CHP-Q2-2026-Report.pdf | China's share of high-priority goods |
| Regulation (EU) 833/2014 (EUR-Lex) | https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0833 | sanctions-mandated share |

## Energy and prices

Used in [energy-and-laundered-oil.md](../method/energy-and-laundered-oil.md) and [prices.md](../method/prices.md).

| source | address | used for |
|---|---|---|
| CREA Russia Fossil Tracker API | https://api.russiafossiltracker.com/v0/counter · methodology https://www.russiafossiltracker.com/methodology/ | fossil payments per buyer and month, Russian export prices |
| CREA reports | https://energyandcleanair.org/ (e.g. [four years of invasion](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf)) | refining-loophole figures, laundered oil calibration |
| Eurostat energy: `nrg_ti_gas`, `nrg_ti_gasm`, `nrg_ti_oil`, `nrg_cb_gas`, `nrg_cb_oil` | https://ec.europa.eu/eurostat/databrowser/view/nrg_ti_gas/default/table | gas by country of origin (final use), hub resale shares, replacement shares |
| Eurostat price indices: `sts_inpi` (import prices), `prc_hicp` (services HICP) | https://ec.europa.eu/eurostat/databrowser/ | non-fuel goods and services price levels |
| FRED (Brent, ULSD, IMF commodity series) | https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU | benchmark fuel prices |
| World Bank Commodity Price Data (Pink Sheet) | https://www.worldbank.org/en/research/commodity-markets | counterfactual commodity features |
| Global Witness | https://www.globalwitness.org/en/campaigns/fossil-gas/eu-purchases-of-laundered-russian-oil-worth-an-estimated-11-billion-to-the-kremlin-in-2023/ | EU laundered-oil correction (× 0.62) |
| Banque de France | https://banque-france.fr/en/publications-and-statistics/publications/china-has-reduced-its-energy-bill-thanks-russian-oil-discounts | China's oil discount |
| ICRA, Reuters | see [crea-notes.md](../../research/2026-10/crea-notes.md) | India's and Turkey's oil discounts |
| Gazprom | https://www.gazprom.com/projects/power-of-siberia/ | Power of Siberia volumes |

## Aid, refugees and military

Used in [aid-refugees-military.md](../method/aid-refugees-military.md).

| source | address | used for |
|---|---|---|
| Kiel Institute, Ukraine Support Tracker (Release 31) | https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/ · [workbook](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx) · [research note](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/Subject_Dossiers_Topics/Ukraine/Ukraine_Support_Tracker/Ukraine_Support_Tracker_-_Research_Note.pdf) | aid, loans, ERA, EU share, item-level coding for flowback |
| Kiel Policy Brief 217 | https://www.kielinstitut.de/publications/how-much-aid-has-germany-given-to-ukraine-20290/ | German aid and refugee costs |
| UN OCHA Financial Tracking Service | https://fts.unocha.org/countries/234/summary/2026 · API https://api.hpc.tools/v1/public/fts/flow?countryISO3=UKR&year=2022 | aid outside Kiel, refugee-plan funding |
| Eurostat temporary protection `migr_asytpsm` | https://ec.europa.eu/eurostat/databrowser/view/migr_asytpsm/default/table | refugees in the EU and EFTA |
| UNHCR population API | https://api.unhcr.org/population/v1/population/?coo=UKR&coa_all=true | refugees elsewhere |
| Government budgets and audit offices (Bundestag, NIK Poland, NAO UK, Rijksfinanciën, SEM Switzerland, IRCC Canada, GAO US and others) | see [round4b-notes.md](../../research/2026-10/gaps/round4b-notes.md) §2 | refugee costs for 27 hosts |
| CSIS | https://www.csis.org/analysis/where-missing-100-billion-us-aid-ukraine | US own-industry share |
| Ukrainian government (PURL) | https://www.kmu.gov.ua/en/news/rik-purl-maizhe-7-mlrd-dlia-postavok-krytychnoho-ozbroiennia-dlia-ukrainy | PURL purchases |
| SIPRI Top 100 (2024) | https://www.sipri.org/sites/default/files/2025-11/fs_2512_top_100_2024.pdf | EU arms production shares |
| INSS, KIDA, Bloomberg, RUSI, KSE and others | see [other-notes.md](../../research/2026-10/other-notes.md), [china_military-notes.md](../../research/2026-10/gaps/china_military-notes.md) | military support to Russia |
| National donation totals (DZI, DEC, Giro555, Zewo, Candid) | see [uncovered-notes.md](../../research/2026-10/gaps/uncovered-notes.md) §4 | private donations |

## Services, shipping and companies

Used in [services-shipping-companies.md](../method/services-shipping-companies.md).

| source | address | used for |
|---|---|---|
| OECD-WTO Balanced Trade in Services (BaTiS) | https://www.oecd.org/en/data/datasets/balanced-trade-in-services.html · API https://sdmx.oecd.org/public/rest/data/OECD.SDD.TPS,DSD_BATIS@DF_BATIS,1.0/ | services with Russia, services trends |
| Eurostat `bop_its6_det` | https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table | EU services with Russia |
| Bank of Russia balance of payments | https://www.cbr.ru/statistics/macro_itm/svs/ | services totals, FDI income |
| KSE Institute shadow fleet tracker | https://sanctions.kse.ua/wp-content/uploads/2026/10/KSE_Shadow_Fleer_Tracker_SEP26.pdf | tanker managers, freight |
| S&P Global, Windward, press freight quotes | see [shipping-notes.md](../../research/2026-10/gaps/shipping-notes.md) | freight pools and shares |
| KSE Institute, Leave Russia digest 80 | https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf · https://leave-russia.org/ | foreign companies' taxes, exits |
| B4Ukraine / KSE reports | https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf · https://b4ukraine.org/pdf/B4U_Report_2025.pdf · https://b4ukraine.org/pdf/BusinessOfStaying.pdf | taxes by home country |
| IMF Direct Investment Positions | https://api.imf.org/ (SDMX `IMF.STA,DIP`) | company-tax allocation and history |

## Macro data and exchange rates

| source | address | used for |
|---|---|---|
| World Bank WDI | https://api.worldbank.org/v2/ | GDP (2024) and population; counterfactual GDP and volumes |
| UNSD, UN WPP, national accounts of territories | see [residual-notes.md](../../research/2026-10/gaps/residual-notes.md) §1 | GDP for 31 economies missing in WDI |
| ECB reference rates | https://data.ecb.europa.eu/data/datasets/EXR | USD/EUR, annual and monthly |
| IMF World Economic Outlook, October 2021 (via DBnomics) | see [trend3-notes.md](../../research/2026-10/gaps/trend3-notes.md) | pre-war commodity price paths for the counterfactual |
| Bailey, Strezhnev and Voeten, UN General Assembly ideal points | https://doi.org/10.7910/DVN/LEJUQZ | voting-distance feature ([counterfactual.md](../method/counterfactual.md)) |

## Map and code

| source | address | used for |
|---|---|---|
| world-atlas (Natural Earth) | https://github.com/topojson/world-atlas | country shapes (ISC licence) |
| D3 7.9.0, TopoJSON 3.0.2 | https://cdnjs.cloudflare.com/ | map rendering |

## See also

- [research-files.md](research-files.md): which research file holds which numbers
- [pipeline.md](pipeline.md): how sources become `site/data.json`
- [Licence for data and text](../../LICENSE-DATA.md)
- [Documentation index](../README.md)
