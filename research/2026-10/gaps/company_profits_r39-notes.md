# Foreign companies' profits in Russia, and foreign partners in Russian LNG and upstream (`company_profits_r39.json`)

Round 39, audit items 1 and 4 (gaps39 `russia_side.md`). The map counts the taxes that foreign-owned companies pay in Russia (`company_taxes_r6.json`), but not the profits their owners make there. It also takes the foreign partners' share out of Russia's LNG gain without crediting it to anyone. This file is the research input for both. It is not wired into the pipeline yet.

Units are EUR bn, nominal. USD is converted at ECB annual averages. RUB per EUR is 87.2 (2021), 72.5, 92.2, 100.3, 94 and 93 (2026), the same rates as `company_flows.json` and `company_taxes_r6.json`. **2026 is January–August and is not annualised.**

**Sign:** `change > 0` means the home country's owners earned more from Russia than they would have without the war. That counts toward Russia, the same direction as "more tax paid in Russia". A fall counts toward Ukraine.

This file was produced by the project's research step. The script and downloads are kept in the round-39 scratch folder, not in the repository. Every source is listed in the JSON (`sources`, and per partner).

## 1. What the flow is and why it belongs on the map

Take a German company that sells into Russia:

- **If it exports**, the map counts the sale at the seller's net gain: home taxes plus profit above a normal return.
- **If it makes the same product in a Russian plant**, the map counts only the Russian taxes, which push Germany toward Russia. The owner's profit is not counted at all.

So the same choice is treated two ways. The fix is to count the owners' profit in Russia against the no-war level, by home country:

- When it falls (the business was shrunk, sold or seized, or the profit is stuck in Russia), the home country earned less from Russia. That counts **toward Ukraine**.
- When it rises (stayers gaining market share, Chinese car brands, Raiffeisen's war-time bank margins), it counts **toward Russia**.

## 2. Data found

| source | what it gives | used for | certainty |
|---|---|---|---|
| [KSE, financial results of foreign business in Russia in 2023](https://kse.ua/wp-content/uploads/2024/09/ENG_What-are-the-financial-results-of-foreign-business-in-Russia-in-2023_final.pdf) (Sep 2024), Fig. 2 and 4 | net profit 18.4 / 15.2 / 16.7 USD bn (2021–23); by status: stay 7.7 → 11.8 → 11.7, leave 4.8 → 2.0, exited 5.9 → 3.0; **profit by HQ country for the top 15, 2021–2023** (Fig. 4, read from bar pixels and calibrated on the text's China 2023 = 1.33) | the country factor k, the level | B |
| [KSE 80th digest](https://institute.kse.ua/wp-content/uploads/2026/07/leave-russia_regular-digest_09_07_26_eng_july_2026.pdf) (Jul 2026), via `companies.json` | net income and profit tax by status 2022–2025: all statuses 15.2 / 16.1 / 19.5 / 11.5 USD bn; 2025 −41% ("tax pressure") | ratio of net income to profit tax for firms still foreign-owned | B (2025 preliminary) |
| [B4Ukraine Corporate Complicity](https://b4ukraine.org/pdf/B4Ukraine_Report_2025.pdf) (Aug 2025) | 2024 net profit USD 19.5bn; only 43 of the top 100 filed, so KSE carried forward | check | B |
| **OECD FDI income by counterpart, BMD4** ([API query](https://sdmx.oecd.org/public/rest/data/OECD.DAF.INV,DSD_FDI@DF_FDI_INC_CTRY,/........RUS....?startPeriod=2018), 13,346 rows) | each OECD country's direct-investment income from Russia 2018–2024: total, **dividends (D42)** and **reinvested earnings (D43)** | dividends against trapped profit; levels for 10 countries; Japan's Sakhalin income | A (official); immediate counterpart |
| [Bundesbank direct-investment statistics](https://www.bundesbank.de/resource/blob/957944/3f44e3b0af199f69ebcd49ea5887bc01/472B63F073F071307366337C94F8C870/2025-05-16-14-13-59-direktinvestitionsstatistiken-data.pdf) | German reinvested earnings in Russia: 1.49 / 2.32 / 2.94 / 3.11 EUR bn (2021–24) | cross-check of Germany | A |
| RBI annual reports [2022](https://www.rbinternational.com/content/dam/rbi/ho/investors/results-reports/annual-reports/rbi/2022%20Annual%20Financial%20Report%20-%20printer%20friendly.pdf.coredownload.pdf) and [2024](https://www.rbinternational.com/content/dam/rbi/ho/investors/results-reports/annual-reports/rbi/2025-02-25%202024%20RBI%20Annual%20Financial%20Report.pdf.coredownload.pdf), country-by-country tables; [preliminary 2025](https://www.eqs-news.com/news/corporate/consolidated-profit-excluding-russia-above-1-4-billion-euros/495ce5d1-af8f-4a38-a51d-54726beb9790_en) | Russia profit before tax / income tax, EUR m: 591/117 (2021), 2,616/559, 1,805/464, 1,272/399 (2024, after an 840m Rasperia provision); 2025 group 1.37bn against 1.443bn excluding Russia | Austria (Raiffeisen) | A (2021–24), C (2025–26) |
| [KSE: foreign banks earned USD 3.4bn in 2024](https://kse.ua/about-the-school/news/foreign-banks-earned-over-3-4-billion-in-russia-in-2024-increasing-profits-by-15-kse-institute-research/) | Raiffeisen 1.54, ICBC 0.37, OTP 0.35, Credit Europe 0.17, Bank of China 0.14 (USD bn) | check of Austria, China, Hungary, Türkiye | B |
| OTP (via `company_taxes_r6`) | OTP Russia profit after tax HUF 137bn (2024), 202bn (2025) | Hungary | B |

**Blocked or not used.** The Russian registries (bo.nalog.ru, Rusprofile) and SSRN's full KSE tables were blocked again. BEA data for the US (income 1.20 / 0.05 / 0.50 / 0.68 USD bn, 2021–24) are on an immediate-counterpart basis: US groups hold their Russian units through Dutch, Swiss and Luxembourg holdings, so BEA sits far below KSE's ultimate-owner figure (4.3 in 2021). They are not used.

### Evidence that profits stopped reaching home

OECD direct-investment income from Russia shows the split clearly. Dividends are D42; reinvested (kept in Russia) earnings are D43. USD m:

| reporter | | 2021 | 2022 | 2023 | 2024 |
|---|---|---|---|---|---|
| Germany | dividends / reinvested | 2,331 / 1,767 | 1,234 / 2,443 | 1,090 / 3,183 | **127 / 3,359** |
| Austria (operating units) | dividends / reinvested | 905 / 1,013 | 468 / 2,299 | 115 / 1,683 | 155 / 680 |
| Italy | dividends / reinvested | 205 / 306 | 175 / 345 | 24 / 1,318 | 49 / 1,369 |
| Finland | dividends / reinvested | 337 / 137 | 141 / – | 8 / 63 | 6 / 1 |
| Sweden | dividends / reinvested | 690 / 157 | 28 / 13 | – / −451 | conf. |
| Netherlands (operating units) | dividends / reinvested | 2,929 / −1,491 | 159 / 733 | 255 / 1,503 | 106 / 279 |
| France (mostly TotalEnergies' Novatek and Yamal LNG) | dividends | 1,218 | 1,560 | 979 | 1,185 |
| Türkiye | dividends | 13 | 23 | 114 | 157 |
| Japan (mostly Sakhalin) | total income | 702 | 899 | 871 | 1,394 |

- Fifteen EU and OECD reporters together (France and the Dutch, Luxembourg and Swiss conduits left out) paid out **50% of their Russian earnings as dividends in 2018–2021**. That fell to **28% in 2022, 20% in 2023 and 6% in 2024**. 2025–2026 are assumed to stay at 6%.
- The cause is the type-C account regime (decrees 81 and 95 of March 2022): dividends to owners from "unfriendly" countries need the government commission's approval or are paid into blocked accounts.
- Owners from other countries are not restricted. Turkish dividends rose eightfold.

## 3. Method of this file (item 1)

**Profit by home country (actual).** The model is:

> profit = in-scope profit tax (`company_taxes_r6.json`) × M_y × k_c

- **M_y** is KSE's ratio of net income to profit tax for firms still foreign-owned that year. That is stay + leave + f × the exited cohort, with the same f as the tax file. Values: 3.41 (2021), 2.44, 2.57, 3.32, 2.12 (2025). 2026 uses 2.12.
- **k_c** comes from KSE Figure 4. It is the square root of the country's profit ÷ (KSE-basis profit tax × the all-status ratio), summed over 2021–2023 and held to 0.5–2.0. Examples: Austria 1.25, Finland 1.64, France 0.72, Japan 0.67. Countries outside Fig. 4 use 1, with a range of 0.6–1.6.

The model is replaced or blended where better data exist:

- **Austria.** Raiffeisen's own Russian profit after tax (EUR 0.47 / 2.06 / 1.34 / 1.71 / 0.95 / Jan–Aug 2026 0.70), plus the model for other Austrian firms. 2024 and 2025 are taken **before** the Rasperia charges, because the EUR 1.87bn debit is already in the `seized` marker. The low end of 2024 keeps the provision.
- **Hungary.** OTP Russia 2024–2025 replaces the model.
- **Germany, Italy, Finland, Sweden, Denmark, Korea, Czechia, Poland, Spain, Norway.** The central is the mean of the model and OECD equity income (dividends + reinvested) for 2021–2024. 2025–2026 carry the 2022–24 ratio of blend to model. Germany is taken net of Wintershall Dea's Russian JVs (item 4).
- Belgium, the Netherlands, Luxembourg, Switzerland and Cyprus are not blended: their OECD figures are dominated by holdings.

Check: the sum across countries is 15.2 EUR bn in 2021 (KSE 18.4 USD bn = 15.6) and 15.3 in 2024 (KSE in-scope ≈ 13.8 EUR bn; the blend adds Germany's and Italy's official figures).

**What reached home.** Dividends are profit × the country's payout ratio that year. The ratio is the OECD figure where it exists, otherwise the pooled ratio for "unfriendly" owners. Other owners keep the pre-war 50%.

**Trapped.** Trapped profit = profit × (the country's pre-war payout − actual payout), for "unfriendly" owners from 2022.

**No-war level.** The 2018–2021 average is grown with the same company trend as company taxes (`trend2.json`: global +4.5% a year; the builder should use the country trend where it is reliable).

- The base is the 2021 profit scaled like the country's profit-tax history 2018–2021. For the blended countries and Austria it is the mean of that and OECD equity income 2018–2021.
- The rule is the same as for taxes, so the two parts move together.

**Exiters.** An owner who sold lost the profit stream but got the sale price, which earns a normal return elsewhere. Its lost profit therefore counts only above that return:

- s_exit = 0.6 (0.4–0.85), applied to the exited cohort's share of each country's 2021 business (from `companies_all.json`). Over the period this takes EUR 6.2bn off the no-war level.
- Stayers keep the same capital in both worlds, so their whole profit change counts.

## 4. Do trapped profits count? Recommendation

The map counts what the home country's owners **gained**. Profit that is stuck in a type-C account is booked as the owner's equity, but the owner cannot spend it. Russia decides whether it ever leaves, and on exit it takes 50–60% of the value plus a 15–35% fee.

| rule | world change 2022–Aug 2026, item 1 |
|---|---|
| accrual in full (p = 1) | −4.7 |
| **recommended (p = 0.35)** | **−15.9** |
| p = 0.10 | −20.2 |
| cash only (p = 0) | −22.0 |

**Recommended: p = 0.35 (range 0.10–1.0).** Dividends count in full, normal retention counts in full, and trapped profit counts at 0.35 of its value. The reasons:

1. **It is the seller's gain rule applied honestly.** The seller's net gain is the value the seller keeps. A rouble an "unfriendly" owner cannot take out is worth what the exit route pays for it: a sale at ≥ 50% (60% from Oct 2024) below value, less a 15–35% contribution, gives 0.26–0.43. A small option on normalisation is added on top.
2. **It is consistent with the markers.** The other 0.65 of trapped profit (EUR 11.3bn of 17.3bn, central) is value Russia controls. It belongs beside `seized` and `exits` in `c["taken"]` ("Trapped profits", outside the totals), as the audit suggested. That also covers the "RBI EUR 4.4bn excess capital" and the "BP Rosneft dividends" that `company_flows-notes.md` lists as not counted.
3. **Full accrual (p = 1) would show Austria, Italy and Hungary as gaining from Russia by more than their banks can ever take home.** Cash only (p = 0) would ignore that some owners do sell out and get something back.
4. Owners from other countries (China, Türkiye, the UAE, Kazakhstan) face no restriction, so p = 1 for them.

## 5. Foreign partners in Russian LNG and upstream (item 4)

Each partner is listed by company and home country in `partners`. Each entry has the yearly income (dividends or share of profit), the no-war level, the paid share, the blocked amount, the counted value and the change.

| partner (home) | stake | income 2022–Aug 2026, EUR bn | blocked | change vs no-war | certainty | evidence |
|---|---|---|---|---|---|---|
| TotalEnergies (FRA) | Novatek 19.4% | 2.33 | 0 | −0.03 (−0.59 to +0.23) | B / C | Novatek cash dividends × 589m shares, net of withholding; matches Greenpeace's USD 1.74bn |
| TotalEnergies (FRA) | Yamal LNG 20.02% | 1.28 | 0 | +0.28 (+0.11 to +0.53) | B / D | [Arctida records](https://arctida.io/en/projects/hidden-beneficiaries-yamal-lng): RUB 50.5bn (2022), 43.1bn (2023), 6.5bn (Oct 2024); 105.2bn for 2022–24 |
| CNPC (CHN) | Yamal LNG 20% | 1.28 | 0 | +0.28 (+0.11 to +0.83) | C / D | pro rata to TotalEnergies |
| Silk Road Fund (CHN) | Yamal LNG 9.9% | 0.63 | 0 | +0.14 (+0.05 to +0.41) | C / D | pro rata |
| Mitsui (JPN) | Sakhalin-2 12.5% | 1.47 | 0 | +0.64 (+0.36 to +0.84) | C / D | OECD Japan income × Sakhalin share; [Nikkei via RTVI](https://rtvi.com/news/rossiya-zaplatila-dividendy-yaponskim-uchastnikam-sahalin-1-i-sahalin-2-v-yuanyah/): dividends paid in yuan |
| Mitsubishi (JPN) | Sakhalin-2 10% | 1.18 | 0 | +0.51 | C / D | same |
| SODECO (JPN) | Sakhalin-1 30% | 1.32 | 0 | +0.57 | C / D | same |
| ONGC Videsh, OIL, IOC, BPRL (IND) | Vankor 49.9%, Taas-Yuryakh 29.9%, Sakhalin-1 20% | 1.38 accrued | 1.16 | −1.21 (−1.64 to −0.65) | C / D | last repatriated Jul 2022; [USD 350m (OVL)](https://www.theweek.in/wire-updates/business/2025/08/29/dcm95-biz-ongc-russia.html) and about USD 800m for all Indian firms (Reuters, Dec 2025); [used for the Sakhalin-1 fund](https://interfax.com/newsroom/top-stories/116188/) |
| BP (GBR) | Rosneft 19.75% | 3.68 declared, none received | 3.68 | −4.48 (−4.97 to −3.76) | B / C | [Rosneft dividends](https://www.rosneft.com/press/releases/item/215429/); exit announced 27 Feb 2022 |
| Shell (GBR) | Sakhalin-2 27.5%, Salym 50% | 0.10 | – | −2.49 | D | decree of 30 Jun 2022 |
| ExxonMobil (USA) | Sakhalin-1 30% | 0.12 | – | −1.99 | D | [expropriated Oct 2022](https://www.worldoil.com/news/2022/10/18/exxon-completes-russia-exit-says-operation-was-expropriated/) |
| Wintershall Dea (DEU) | Yuzhno-Russkoye, Achimgaz | 0.80 (2022) | 0.40 | −2.24 | D | deconsolidated 2023, expropriated |
| OMV (AUT) | Yuzhno-Russkoye 24.99% | 0.25 (2022) | 0.10 | −0.90 | D | stake taken 2023 |
| TotalEnergies, CNPC, CNOOC, Japan Arctic LNG | Arctic LNG 2 (10% each) | 0 | 0 | 0 | B | sanctioned; no income |

Notes on the table:

- **The windfall is smaller than the audit guessed (+3–8bn for France and China).** TotalEnergies' own records show Yamal LNG payouts fell after 2023. The CEO says none since 2023; the records show an October 2024 tranche. Greenpeace's USD 5.06bn from Yamal LNG since 2022 is about three times the recorded RUB 105bn and is not used. France's item 4 is +0.25bn and China's +0.42bn.
- **Japan's dividends were not blocked.** They were paid in yuan through Gazprombank, and Japan's OECD income from Russia doubled from 2021 to 2024. Item 4 moves Japan **toward Russia** (+1.7bn), the opposite of the audit's guess.
- **India's are blocked (−1.2bn).** The trapped money gets weight 0.5 (0.25–0.9): it is usable in Russia and has been spent there on the Sakhalin-1 fund.
- **BP's Rosneft dividends get weight 0 (0–0.2).** BP wrote the stake off, and Russia's crude net gain already counts all of Rosneft's profit as Russian. Counting any of it for the UK would count it twice. Because BP chose to leave, the UK's lost no-war income (about EUR 0.9bn a year) counts toward Ukraine, the same way lost taxes count when a firm leaves.
- **The no-war levels are judgements** (certainty D):
  - Yamal LNG pays out RUB 100bn a year (60–150) in total, a programme that started in late 2021.
  - Novatek pays its 2021 dividend of RUB 71.44 a share.
  - Japan uses its 2018–2021 average.
  - BP, Shell, Exxon, Wintershall and OMV keep their 2021 income.
  - All are grown with the company trend.

## 6. Method proposal for the pipeline

1. **Item 1 sits in "Russia's earnings from trade", next to company taxes.** Add a series `c["company"]["profits"]`, read from `countries[*].counted_actual`. Its base is `base_2018_2021` with `base_2018_2021 = true`, and `pre_war_trends()` applies the same `bmul` as taxes. Alternatively, use `add_extra("coprofits", "Profits of the country's companies in Russia", change, ...)` with the precomputed `change`.
   - Label: "Less / more profit made in Russia by companies".
   - Positive change = toward Russia, stored with the sign flipped like other extras.
2. **Item 4 is an extra part**, `add_extra("lngpartners", "Income from stakes in Russian oil and gas projects", ...)`, summing `partners[*].change` by home country. The Arctic LNG 2 rows stay as zero rows so the panel can say so.
3. **The trapped remainder becomes a marker, not part of the totals.** Add `add_taken(c, "trapped", "Profits kept in Russia (type-C accounts)", 0.65 × trapped + blocked partner income × (1 − weight))`. It sits beside `seized` and `exits`.
4. **2026 is January–August already.** Do not apply FRAC again.
5. **Certainty:** B for Austria, Germany, Italy and Hungary; C for countries in Fig. 4 or the OECD split (USA, CHN, FRA, GBR, JPN, CHE, NLD, TUR, KOR, the Nordics, ZAF, IND); D for the rest. Partners carry their own letters.

### Avoiding double counting

- **Company taxes** (`company_taxes_r6.json`). Profits here are after Russian tax, so there is no overlap. The scope is the same: firms count while still foreign-owned, and Unipro and Fortum drop out from May 2023 through the in-scope tax.
- **Exits and seizure markers.** These stay outside the totals, so counting lost profits does not count anything twice. A forced discount is roughly the present value of future profit, so if the owner ever moves the markers into the totals, item 1's exiter part must go. This file already counts an exiter's lost profit only above the normal return on its sale proceeds.
  - Raiffeisen's Rasperia charges are excluded from its profit because they are in `seized`.
  - The seized upstream stakes (Shell, Exxon, Wintershall, OMV) count their lost income, as seized companies' lost taxes already do.
- **Net gain on goods sold.** A parent's exports to its Russian subsidiary count in trade at the seller's net gain. The subsidiary's profit is local value added, so the two are separate. Transfer pricing could move profit between them, which is a small effect and not corrected.
- **LNG on Russia's side.** Russia already keeps only 60% of LNG profit after tax. Item 4 adds the partners' own change and changes nothing on Russia's side.
- **Crude on Russia's side.** Russia's crude net gain ignores foreign stakes, which is why trapped BP money gets weight 0 and India's trapped money weight 0.5. The Indian dividends actually paid in 2021–22 are tiny against Russia's crude gain.
- **OECD data.** Germany's and Austria's OECD income includes their upstream JVs, so it is used net of item 4. France and Japan are not blended.
- **Services.** No services line counts affiliates' profits, so there is no overlap there either.

## 7. Expected effect, 2022–August 2026 (EUR bn; − = toward Ukraine)

| # | country | item 1 profits | item 4 partners | total (90% range) | % of GDP (2022–24 avg) | certainty |
|---|---|---|---|---|---|---|
| 1 | United Kingdom | −1.58 | −6.97 | **−8.55** (−10.1 to −5.5) | −0.27 | C |
| 2 | Germany | −5.28 | −2.24 | **−7.51** (−12.2 to −2.8) | −0.18 | B |
| 3 | United States | −4.74 | −1.99 | **−6.73** (−11.1 to +1.5) | −0.03 | C |
| 4 | China | +4.04 | +0.42 | **+4.47** (+2.6 to +7.6) | +0.03 | C |
| 5 | Sweden | −2.52 | 0 | **−2.52** (−3.1 to −1.0) | −0.46 | C |
| 6 | France | −1.68 | +0.25 | **−1.43** (−3.3 to +2.6) | −0.05 | C |
| 7 | Korea | −1.42 | 0 | **−1.42** (−2.5 to +1.1) | −0.08 | C |
| 8 | Finland | −1.18 | 0 | **−1.18** (−1.5 to +0.5) | −0.44 | C |
| 9 | India | +0.12 | −1.21 | **−1.09** (−1.5 to −0.4) | −0.03 | C |
| 10 | Netherlands | −0.87 | 0 | **−0.87** (−1.6 to +0.8) | −0.08 | C |
| 11 | Hungary | +0.77 | 0 | **+0.77** (+0.4 to +1.4) | +0.41 | B |
| 12 | Austria | +1.64 | −0.90 | **+0.74** (−0.6 to +2.6) | +0.16 | B |
| 13 | Italy | +0.69 | 0 | **+0.69** (−0.8 to +2.2) | +0.03 | B |
| 14 | Switzerland | −0.58 | 0 | **−0.58** (−1.1 to +0.5) | −0.07 | C |
| 15 | Denmark | −0.48 | 0 | **−0.48** (−0.8 to +0.5) | −0.13 | C |

- **Japan:** −1.60 + 1.72 = +0.12. The two items cancel, which is not shown in the ranking above.
- **Türkiye:** +0.30.
- **World totals:** item 1 −15.9 (p = 0.35). Item 4 −10.9, dominated by BP's lost Rosneft income and the seized Shell, Exxon and Wintershall stakes.
- **Year pattern (item 1):** −1.0 (2022), −2.3, −1.5, −6.6 (2025), −4.6 (2026 Jan–Aug). The 2025 drop follows KSE's preliminary −41% in net income. It is the least certain year.
- **Against the audit's guess:** the audit guessed EUR 20–40bn toward Ukraine for item 1. The estimate here is smaller because stayers' profits rose: KSE "stay" firms went from 7.7 to 11.7 USD bn. Most of the effect sits in trapped profit, so the p rule decides the size.

## 8. What is guessed

- **The country factor k.** It is read from a chart and shrunk halfway to 1. Fig. 4 includes exited firms' post-sale profits.
- **2025–2026.** These rest on KSE's preliminary 2025 total and the 2024 payout ratio. 2026 is 2025 × 8/12.
- **p (0.35), s_exit (0.6), and payout after 2024.**
- **Item 4:**
  - the Sakhalin share of Japan's OECD income (0.85, 0.6–1.0) and the 2/3 : 1/3 split between Sakhalin-2 and Sakhalin-1;
  - India's yearly accrual;
  - the 2021 income of Shell, Exxon, Wintershall and OMV;
  - Yamal LNG's no-war payout;
  - Yamal LNG payments to Chinese holders after 2023.

## 9. Open questions for the owner

1. **Trapped profits:** p = 0.35 in the totals and the rest as a "taken" marker (recommended)? Or full accrual (−4.7bn world) or cash only (−22.0bn)? This is the largest single choice.
2. **BP, Shell, Exxon, Wintershall, OMV:** should income lost by companies that chose to leave, or that were seized, count toward Ukraine (as lost taxes already do)? If not, item 4 shrinks to about +2.4 (Japan +1.7, China +0.4, France +0.25) and India −1.2, and the UK falls out of the top three.
3. **Ultimate owner versus the OECD's immediate counterpart.** The blend uses OECD figures for 10 countries. Prefer KSE alone for consistency with taxes?
4. **The exiter rule (s_exit).** Keep it, or count exiters' full lost profit as the audit assumed? Full counting adds about −6bn to item 1.
5. **Lemana PRO (ex-Leroy Merlin)** is counted for France, as in the taxes. Its low case excludes it, as there.
6. **Arctic LNG 2:** should its no-war income (first train from 2024) count as a loss for France, China and Japan? It is left at 0 here.
7. **Sinopec and Silk Road Fund in Sibur, PetroVietnam in Rusvietpetro, Equinor (exited):** not included. Each is about EUR 0.1–0.3bn a year.
8. **Double counting through a growing capital base.** If the trapped marker is added, should the reinvested (trapped) earnings that raised Russian subsidiaries' equity also lower later exit discounts in `company_flows.json`?
