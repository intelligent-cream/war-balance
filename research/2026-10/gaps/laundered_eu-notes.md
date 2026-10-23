# Laundered oil per EU member (research 2026-10, round 5, item 5)

Gathered 2026-10-18. Output: [`laundered_eu.json`](laundered_eu.json). EUR bn, nominal, low / central / high; 2026 = January–August, not annualised. **Not yet reviewed by a person.**
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

## What the flow is

"Laundered oil" is diesel, jet fuel and other products made from Russian crude in India, Türkiye, the UAE, China and similar countries, then sold to buyers that ban Russian oil. Russia was paid for the crude, so what matters is **the value of the Russian crude inside the fuel**, counted for the country that finally used it.

The model currently builds EU members' values from refiners' export statistics, then scales them all by one EU-wide factor (× 0.62, range 0.5–0.8) to match Global Witness's 2023 total. This file builds every member from EU customs data and checks the results against CREA's per-country figures.

## Data found

| source | what it gives | used for |
|---|---|---|
| [Eurostat Comext DS-045409](https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409) | HS 2710 imports by member state and origin, annual 2019–2025 and monthly Jan–Aug 2026 | the base for every member |
| [CREA, "Refining loophole widens: 44%"](https://energyandcleanair.org/wp/wp-content/uploads/2024/04/CREA_PCC_Refined-Oil-Analysis_19.02.2024_Rev_15.04.2024.pdf) (Feb 2024) | Dec 2022–Dec 2023: EUR 8.5 bn of products made from Russian crude, containing EUR 4.2 bn of crude. EU 2.6 bn of crude: Netherlands 0.59, France 0.42, Italy 0.32. USA 0.81 | crude-to-product ratio, calibration |
| [CREA/CSD, Turkish refineries](https://csd.eu/fileadmin/user_upload/publications_library/files/2024_9/FINAL_CREA_CSD_Analysis_Turkish-Refineries_09.2024.pdf) (Sep 2024) | H1 2024: EU EUR 2.47 bn from STAR, Izmit and Aliaga, 1.5 bn of it from Russian crude. Romania 448 mn, Netherlands 216 mn, USA 232 mn, UK 16.5 mn. STAR runs 98% Russian crude | Turkish share, Romania high |
| [CREA, Third year of invasion](https://energyandcleanair.org/wp/wp-content/uploads/2025/04/CREA_Analysis_Third-year-of-invasion_24.02.2025_REVISED_10.04.2025.pdf) | Mar 2024–Feb 2025: G7+ EUR 18 bn from six Indian/Turkish refineries, 9 bn made from Russian crude. Top EU importers of all products from them: Netherlands 3.3, France 1.4, Romania 1.2, Spain 1.1, Italy 0.95 | cross-check |
| [CREA, Fourth year of invasion](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) | Mar 2025–Feb 2026: G7+ EUR 14.7 bn, 7.2 bn from Russian crude. Australia 3.4 (1.6), USA 1.8 (0.8). Brunei's Hengyi refinery: 60% Russian, 98% of its exports to sanctioning countries go to Australia | non-EU checks |
| [Global Witness](https://www.globalwitness.org/en/campaigns/fossil-gas/eu-purchases-of-laundered-russian-oil-worth-an-estimated-11-billion-to-the-kremlin-in-2023/) (Feb 2024) | 2023: 130 m bbl of EU imports from these refineries, 35 m bbl from Russian crude. The EUR 1.1 bn in the title is **Kremlin tax**, not crude value | cross-check (35 m bbl ≈ EUR 2.0–2.2 bn of crude) |
| [KSE Institute](https://institute.kse.ua/wp-content/uploads/2026/06/kse_refining_loophole_eng_june_2026.pdf) (Jun 2026) | After the EU ban (21 Jan 2026): EU imports from 11 refineries −69% (Feb–Apr vs H2 2025). Indian Russian-sourced exports to the EU −97%. About 50 kb/d still comes from Tüpraş Izmit, STAR and Kulevi | 2026 shares |
| [Novaya Gazeta / Cedar](https://novayagazeta.eu/en/articles/2026/06/24/the-billion-euro-loophole-en), [GTR](https://www.gtreview.com/news/europe/g7-still-importing-russian-origin-fuel-due-to-refining-loophole/) | CREA: EUR 929 mn Jan–May 2026, including Turkish non-refinery ports. Cargoes: Cyprus 16, Spain 7, France 7. About three-quarters of the EUR 3.3 bn from Turkish ports went to Greece | 2026 high, Greece and Cyprus flags |
| [BBC/CREA](https://www.pravda.com.ua/eng/news/2024/02/05/7440489/), [S&P Global](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/051926-uk-bans-imports-of-russian-oil-refined-abroad-exempts-diesel-and-jet-fuel) | UK: GBP 569 mn of products from Russian crude in the 12 months after Dec 2022. 2025: about 39 kb/d of Indian jet and gasoil. The UK ban exempts diesel and jet | UK |

No per-member-state figures were found from Global Witness, from CSD beyond the Turkish report, or from KSE. CREA's per-country refinery data need an API key, which this research did not have.

## How the numbers were built

1. **Imports.** Comext HS 2710 imports of each member from India, Türkiye, UAE, China, Singapore and Georgia, by country of origin. For refined fuel, the origin is the refining country.
2. **× Russian share.** This is the share of Russian crude in what each origin sends to the EU (central values):

   | origin | 2019–21 | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) |
   |---|---|---|---|---|---|---|
   | India | 0.015–0.02 | 0.15 | 0.35 | 0.38 | 0.33 | 0.065 (ban; January only) |
   | Türkiye | 0.15–0.22 | 0.38 | 0.45 | 0.61 (CREA H1 2024: 1.5/2.47) | 0.55 | 0.35 (Izmit, STAR) |
   | UAE | 0.02 | 0.08 | 0.07 | 0.04 | 0.035 | 0.02 |
   | China | 0.10 | 0.12 | 0.12 | 0.12 | 0.12 | 0.08 |
   | Singapore | 0.02 | 0.03 | 0.03 | 0.03 | 0.03 | 0.03 |

   Saudi Arabia, Kuwait and the US are left out. Saudi Arabia burns imported Russian fuel oil at home but exports its own crude and products, which cannot be traced to Russia.
3. **× crude-to-product value ratio k.** CREA's own figures give EUR 4.2 bn of crude per EUR 8.5 bn of product, so k = 0.494 (Dec 2022–Dec 2023). Each year k moves with the Russian crude price relative to diesel (ULSD):

   | year | k |
   |---|---|
   | 2022 | 0.47 |
   | 2023 | 0.494 |
   | 2024 | 0.60 |
   | 2025 | 0.56 |
   | 2026 | 0.415 |
   | pre-war, no discount | about 0.70 |

   The range is × 0.88 to × 1.12.
4. **Cyprus.** Cyprus's imports from an origin "not specified" (QW) rose from EUR 0.07 bn in 2021 to 1.0 bn in 2025, as the war began, and CREA names Cyprus as the top EU destination in 2026. These imports are counted as 40% (10–80%) from Turkish/Indian refiners.
5. **Romania high.** Kpler-based CREA figures show more than Comext does, because Constanța also forwards fuel to Moldova and Ukraine. The CREA H1 2024 figure is used as the high case for 2024–2025.
6. **2026 high.** The high is at least twice the central, because CREA's Jan–May figure is larger than the customs-based estimate (see "Open questions").
7. **Final consumer.** Customs record the member state where fuel was declared, so Rotterdam and Antwerp carry fuel that is used elsewhere. The model's own pass-on is applied, with the same shares as `energy2.json` `hub_resale` (central) and the same customers (`hub_exports_2024.json`), for the Netherlands, Belgium, Greece and Malta. The low and high cases are scaled by the same ratio.

**Calibration.** For 2023 the method gives an EU total of 2.60 bn (first importer). CREA gives 2.6 bn for 13 months, about 2.4 bn a year. Per member:

| country | here, 2023 | CREA, 13 months to Dec 2023 |
|---|---|---|
| Netherlands | 0.50 | 0.59 |
| France | 0.42 | 0.42 |
| Italy | 0.34 | 0.32 |

Global Witness's 35 m bbl is worth about 2.0–2.2 bn. All three checks fall within about 15%.

## Results: EU totals (central, EUR bn)

| | 2019–21 avg | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug | 2022–26 |
|---|---|---|---|---|---|---|---|
| first importer | 0.24 | 1.05 | 2.60 | 2.92 | 2.08 | 0.32 | 8.97 |
| final consumer (after hubs) | 0.21 | 0.96 | 2.40 | 2.60 | 1.90 | 0.30 | 8.15 |
| model, `site/data.json` `laund` | base 0.19 | 1.15 | 2.12 | 2.24 | 1.74 | 0.55 | 7.80 |

The EU total agrees with the model to within 5%. The model's single × 0.62 correction works at EU level, but it hides large errors between members. In 2026 the model is about twice the customs evidence, because it does not see that India's Russian-crude exports to the EU almost stopped after the ban.

## Results per country (final consumer, 2022–2026 total, central with range)

| country | first importer | final consumer | model now | pre-war base (final) | model base | certainty | role |
|---|---|---|---|---|---|---|---|
| France | 1.37 | **1.53** (0.86–2.39) | 1.07 | 0.046 | 0.018 | B | final consumer |
| Italy | 1.24 | **1.27** (0.76–1.89) | 0.60 | 0.039 | 0.020 | B | final consumer |
| Germany | 0.46 | **0.93** (0.56–1.36) | 1.23 | 0.014 | 0.023 | C | final consumer (gets ARA resale) |
| Spain | 0.88 | **0.92** (0.53–1.38) | 0.47 | 0.023 | 0.017 | C | final consumer |
| Romania | 0.75 | **0.75** (0.46–1.54) | 0.61 | 0.005 | 0.003 | B | final, part transit to MDA/UKR |
| Netherlands | 1.82 | **0.50** (0.28–0.79) | 1.19 | 0.013 | 0.017 | B | ARA hub, ~74% resold |
| Belgium | 0.64 | **0.48** (0.25–0.79) | 0.57 | 0.012 | 0.010 | C | ARA hub, ~48% resold |
| Cyprus | 0.38 | **0.39** (0.08–1.07) | 0.56 | 0.012 | 0.022 | D | final consumer and bunkers; origin hidden |
| Slovenia | 0.35 | **0.36** (0.22–0.53) | 0.14 | 0.018 | 0.007 | C | part transit (Koper) |
| Greece | 0.46 | **0.23** (0.14–0.33) | 0.34 | 0.014 | 0.009 | D | hub (STS, bunkers) |
| Portugal | 0.15 | 0.15 | 0.09 | 0.003 | 0.003 | C | final |
| Poland | 0.12 | 0.15 | 0.05 | 0.001 | 0.001 | C | final |
| Malta | 0.01 | **0.01** | 0.37 | 0.001 | 0.028 | D | bunker hub |
| Luxembourg | 0 | 0.03 | 0.09 | 0.001 | 0.004 | C | final (via BEL/NLD) |
| Bulgaria | 0.06 | 0.06 | 0.13 | 0.001 | 0.001 | C | final |

Ireland, Denmark, Sweden and Finland are 0.06–0.10 each. The Baltics, Czechia, Slovakia, Hungary, Austria and Croatia are 0.00–0.02. Per-year values are in the JSON.

## Why the numbers differ from the model

- **Italy, Spain, France, Slovenia and Poland are 1.4–2.6 times higher here.** They import directly from Jamnagar, Vadinar and the Turkish refineries, and Comext shows it. The model's starting values come from refiners' mirror exports, then are cut by 0.62 across the board.
- **The Netherlands is lower: 0.50 here against 1.19 in the model.** The model's start for the Netherlands (2.4–2.9 bn of product a year in 2023–2025) is about twice what Dutch customs record from these origins. In 2025, for example, Dutch customs show 0.95 bn from India and 0.18 bn from Türkiye. The difference comes from Comtrade mirror data that name Rotterdam for cargoes "for orders". Germany is lower here for the same reason, since most of its value is passed on from the Netherlands.
- **Malta (0.37 → 0.01) and Cyprus (0.56 → 0.39).** These model values come from STS and bunker deliveries recorded in India's and Türkiye's export data. Maltese customs show almost nothing, because fuel bought for ships is paid for by shipowners elsewhere. Cyprus keeps a real but uncertain amount (D).
- **Luxembourg and Bulgaria** are smaller here. Bulgarian customs show few imports from these origins (Burgas refines Russian crude itself, but that is an EU refiner and is not counted).
- **Crude content (applies to every country).** The model values the crude at 0.60/0.68/0.75 of the product value (`CRUDE_CONTENT`). CREA's own figures imply 0.494 for 2023, and 0.42–0.60 across 2022–2026, because Russian crude was sold at a discount while diesel margins were high. For the EU, the × 0.62 correction roughly cancels this out. **For non-EU buyers it does not**, so the model is probably 1.2–1.6 times too high there (see below).

## Non-EU checks (crude value, central, EUR bn)

| country | 2022 | 2023 | 2024 | 2025 | 2026 J–A | total | model total | basis |
|---|---|---|---|---|---|---|---|---|
| USA | 0.25 | 0.75 | 0.60 | 0.45 | 0.33 | 2.38 | 4.47 | CREA 0.81 bn crude Dec22–Dec23; 0.80 bn product Y4 |
| United Kingdom | 0.08 | 0.32 | 0.30 | 0.21 | 0.08 | 0.99 | 2.07 | CREA/BBC GBP 569 mn product; S&P 39 kb/d in 2025 |
| Australia | 0.25 | 0.43 | 0.57 | 0.90 | 0.35 | 2.50 | 3.39 | CREA windows; Y4 1.6 bn product made from Russian crude incl. Brunei |

For the US and the UK the model is about twice the CREA evidence. The cause is crude content plus pass-on from the Netherlands, which the model sends to the US and UK. Australia is higher in the model for 2023–24 and lower for 2025. The model's refiner list (India, Türkiye, China, UAE) has no **Brunei (Hengyi)**, which supplied most of Australia's Russian-derived fuel in 2025–26. Singapore blends, which the model passes to Australia, are not in the CREA figures. Norway, Switzerland, Japan, South Korea and Canada have no published figure, so their model values stay as they are.

## What is guessed

- The Russian share by origin for exports to the EU in 2022 and 2025, and every China, UAE and Singapore share. These are educated guesses with wide ranges, informed by Comtrade crude shares and CREA's refinery reliance figures.
- The shares for 2026 after the ban.
- The Cyprus QW share.
- The hub resale shares, which are the model's own.
- The 2022, 2024 and 2026 values for the US, UK and Australia (C/D).

## Overlaps

- **Same flow as the model.** This is the same flow as `energy.json` `laundered_oil` and `reassign_laundered_oil()`. It is a **replacement or check for EU members, not an addition**.
- **Refiner deductions.** The deductions at Türkiye, India and China (`hub_buyers.json`, `round4a.json`) assume the exported crude is counted at the buyers. The EU total barely changes here (+5%), so they stay valid. If the non-EU crude-content fix is adopted, though, the deductions should shrink in proportion.
- **Pre-war base.** The 2019–21 average here (EU 0.21 bn, final consumer) matches `round4a.json` `laundered_prewar` (model EU base 0.19). Use one or the other, not both.
- **Direct Russian product imports.** Fuel recorded with Russian origin in Comext (2022 to early 2023, and the Bulgarian derogation) is in `to_rus`. It is not here.
- **Turkish non-refinery ports.** Relabelled Russian products shipped from Ceyhan, Marmara Ereğlisi and Mersin are worth EUR 3.1–3.3 bn a year to the EU, mostly to Greece. They are **not added**. Comext records many of them as Iraqi, Turkmen, Kazakh or Azeri origin. `hub_buyers.json` (`reexport_of_russian_products`) already discusses this channel, and the model's Turkish share partly covers it. If counted, Greece's value would rise by up to EUR ~1–2 bn a year before resale.

## Open questions

- **Greece's origin data.** Greece's imports of Iraqi, Turkmen and Kazakh products (0.6–1.1 bn a year since 2023) need a check. Are they relabelled Russian fuel from Turkish ports?
- **CREA Jan–May 2026.** CREA's EUR 0.929 bn for Jan–May 2026 is well above the customs-based 0.32 bn for Jan–Aug. The likely explanation is the Turkish ports and the different origin rules, but this is not confirmed. It is the main reason the 2026 high is wide.
- **Better data.** A CREA API key (`/v1/kpler_trade`, refinery to destination port) would give Kpler-based per-country values to replace the share assumptions.
- **Builder choice.** Use `final_consumer` values for attribution, and either drop the × 0.62 EU factor for the members given here or keep it only for countries not covered.
