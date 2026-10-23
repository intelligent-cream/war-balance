# Company flows: exit payments, seizures, and profits sent home by Russian-owned firms abroad

Output: [`company_flows.json`](company_flows.json), generated on 2026-10-18. It covers two roadmap items:

- **(18)** What Russia took from foreign companies that left: the exit contribution paid to the budget, the value handed to Russian buyers through forced discounts, and assets seized without payment. These are given by the company's **home country** and year, 2022–2026.
- **(24)** Dividends and profits that Russian-owned companies abroad send to their Russian parents. These are given by **host country**, 2019–2026, as the level and as the change against the 2019–2021 average.

Units are EUR bn, nominal, as low / central / high (~90% range). 2026 means January–August and is not annualised. Exchange rates:

- RUB per EUR (approximate Bank of Russia annual averages): 72.5 (2022), 92.2 (2023), 100.3 (2024), 94 (2025), 93 (2026).
- USD per EUR: the ECB rates in the brief.

This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes.

**How the map uses the exit payments and seizures (round 14b, raised by the owner):** the exit contribution, the forced discount and the seizures are **not in the totals**. They are a loss imposed on the country's companies and a gain for Russia, not money the country chose to move, so the map counts them in the cost view as a cost carried (`taken` in `site/data.json`) and shows them apart in the panel, the table and as a map marker. Rounds 5–14 counted the contribution and the discount in the net (round 14 added seizures). See [`docs/decisions.md`](https://warbalance.org/#view=how&sec=cl-why).

## 1. Exit payments (item 18)

### What the flow is
Since late 2022, a foreign owner from an "unfriendly" country needs approval from a government sub-commission before it can sell a Russian business. Approval comes with two conditions:

- **Discount.** The sale must be at least 50% below an independent valuation. From October 2024 the minimum is 60%.
- **"Voluntary" contribution to the federal budget.** It was 10% of value from December 2022, 15% of market value from October 2023, and 35% of the deal from October 2024. The 35% is paid in instalments: 25% within a month, 5% within a year and 5% within two years.

Some owners never got to sell. Their assets were put under "temporary management" by decree, expropriated, or taken by court orders linked to contracts cancelled because of sanctions.

The JSON gives three separate series, so the builder can choose which to count:

| series | what it is | who in Russia gains | direction |
|---|---|---|---|
| `exit_contribution` | money paid into the federal budget | the state | toward Russia (a payment to Russia, counted in full) |
| `discount_transfer` | value given away to Russian buyers through the discount or a 1-rouble sale | Russian private or state buyers | toward Russia if counted |
| `seizure` | asset value lost minus anything actually received abroad | the state or Russian firms | toward Russia if counted |

None of these existed before the war. The pre-war level is 0, so each series is its own change.

### Data found: the budget line
| year | RUB bn | what it contains | source |
|---|---|---|---|
| 2022 | 2.95 | exit contributions (the line started in 2022) | [Moscow Times](https://ru.themoscowtimes.com/2026/10/01/vlasti-rf-ozhidayut-4715-mlrd-r-dobrovolnykh-vznosov-biznesa-v-byudzhet-v-26g-a207546) |
| 2023 | 116.45 | exit contributions (Reuters: 116.5bn; Kommersant/GRM: ~120bn) | same; [Kommersant](https://www.kommersant.ru/doc/7363099) |
| 2024 | 160.26 | exit contributions (155.8bn by end-November; plan was 2.1bn) | [Izvestia](https://iz.ru/en/node/1802960) |
| 2025 | 251.3 | whole line; MinFin said ~120bn came from exit sales in January–March | [Interfax](https://www.interfax.ru/business/1017524), [TKS](https://www.tks.ru/reviews/2026/08/18/0001/dobrovolnyie-vznosyi-biznesa-v-byudzhet-dostigli-rekordnyih-384-mlrd-rublej/) |
| 2026 | 15.6 in Q1, 383.7 by mid-August | the surge from April is Russian business "donations" for the war, not exits | [TKS](https://www.tks.ru/reviews/2026/08/18/0001/dobrovolnyie-vznosyi-biznesa-v-byudzhet-dostigli-rekordnyih-384-mlrd-rublej/), [Meduza](https://meduza.io/en/news/2026/10/01/putin-reportedly-asked-russian-business-leaders-to-help-fund-the-war-moscow-expects-471-billion-rubles-in-voluntary-contributions-from-companies-this-year) |

Exit part used:

- **2025:** 150bn (range 110–200). That is the 120bn of Q1 plus part of the rest of the year. Exit deals fell to 23 in 2025, from 111 in 2023 and 63 in 2024 (Kept).
- **2026:** 15bn (range 8–30).
- **Total 2022–2026:** about RUB 445bn, or **EUR 4.7bn (3.9–5.4)**.
- **Cross-check:** KSE counted "at least RUB 250bn (~USD 2.7bn) between 2023 and mid-2024".

### How the numbers were split by country
- **Contributions.** No register says who paid what. The split uses the size of the business that sold out in 2023–2024 in each home country. This is derived from [`companies_all.json`](companies_all.json) as the KSE all-status taxes minus the in-scope taxes, summed over 2023 and 2024.
  - Shares: USA 17%, UK 14%, France 11%, Netherlands 11%, Germany 9%, Switzerland 4%, Sweden 4%, Finland 3%, Norway 3%, Denmark 3%, and so on.
  - In 2024, Carlsberg's Baltika contribution (RUB 8.5–12bn, [Izvestia](https://iz.ru/en/node/1834411)) is given to Denmark explicitly as 6% of that year.
- **Discount, 2023–2026: ratio method.** The discount equals the contribution × (discount rate ÷ contribution rate), using these ratios:

  | year(s) | ratio | basis |
  |---|---|---|
  | 2023 | 5 (3–8) | 0.5 ÷ 0.10 |
  | 2024 | 3 (1.8–4.5) | mix of 0.5 ÷ 0.15 and 0.6 ÷ 0.35 |
  | 2025–2026 | 1.7 (1.2–2.8) | |

  The result is split with the same key. 1-rouble sales have even larger discounts, which is why the high case is wide.
- **Discount, 2022: case list.** No contributions were paid in 2022. Cases:
  - Renault/AvtoVAZ for 1 rouble
  - Société Générale/Rosbank
  - McDonald's
  - Nissan for 1 euro
  - Equinor (stakes handed to Rosneft)
  - Avito
  - Shell retail and Salym
  - plus a residual of EUR 2.5bn (1–5) for about 140 smaller exits

  Total: EUR 11.7bn.
- **2024 mega-deals added explicitly:**
  - **Yandex N.V.** (Netherlands holding): RUB 475bn price with a mandatory discount of at least 50%, so at least EUR 4.7bn was transferred ([AP/Barchart](https://www.barchart.com/story/news/23844284/the-owners-of-russia-s-tech-pioneer-yandex-are-selling-at-a-big-kremlin-required-discount)).
  - **Polymetal** (Jersey, redomiciled to Kazakhstan in 2023): enterprise value USD 3.69bn at about 2.5× EBITDA, against about 8× historically. Transfer EUR 3.5bn (1.7–6.0) ([Mining.com](https://www.mining.com/web/polymetal-international-agrees-to-sell-russian-assets-for-3-7-billion/)).
  - Both are flagged `conduit_caution`. Their shareholders were largely international portfolio investors, plus Russian investors in Polymetal's case. The builder may prefer to leave them unattributed.
- **Seizures** are counted case by case, from KSE's [loss study](https://kse.ua/wp-content/uploads/2025/03/KSE_Assessing-Foreign-Companies-Losses-in-Russia.pdf) (Annex 1) and company releases. Each is booked in the year control was lost:
  - **Leased aircraft.** About USD 10bn of leased aircraft were kept by Russian airlines. The Russian insurer NSK paid more than USD 2.5bn by January 2025 ([factbox](https://www.stockopedia.com/share-prices/nsk-TYO:6471/news/factbox-aviation-lessor-settlements-with-russia-over-trapped-planes-019e6d72-da8e-7d6c-8315-ae0c00d89631/)), assumed USD 3.5bn by 2026. The net USD 6.5bn is booked in 2022 and split by lessor home country: Ireland 45%, USA 15%, Japan 15%, China 12%, Singapore 5%, UK 5%, UAE 3%.
  - **Raiffeisen.** EUR 1.87bn was forcibly debited in 2025 for the Rasperia award ([RBI](https://www.rbinternational.com/content/dam/rbi/ho/investors/news/ir-releases/rasperia-verdict/2025-04-24%20Rasperia%20second%20instance%20verdict%20IR%20release%20RBI.pdf.coredownload.pdf)).
  - **Shell Sakhalin-2.** It is counted at full stake value because the RUB 94.8bn "price" was not confirmed as received ([Interfax](https://interfax.com/newsroom/top-stories/90264/)).
  - **Danone and Carlsberg** sit only under seizure, minus what they later received. They are not counted again as discount.

### Totals, EUR bn, 2022–2026
| series | 2022 | 2023 | 2024 | 2025 | 2026* | sum (range) |
|---|---|---|---|---|---|---|
| exit contribution (to budget) | 0.04 | 1.26 | 1.60 | 1.60 | 0.16 | 4.7 (3.9–5.4) |
| discount to Russian buyers | 11.7 | 6.3 | 13.0 | 2.7 | 0.3 | 34 (18–57) |
| seizures | 12.8 | 12.9 | 5.5 | 1.9 | 0 | 33 (22–47) |

### Biggest home countries, sum 2022–2026, EUR bn central (range)
| country | contribution | discount | seizure | main items |
|---|---|---|---|---|
| Germany | 0.43 (0.18–0.9) | 1.9 (0.5–6.3) | 9.5 (6.0–13.9) | Wintershall Dea 5.3, Unipro 2.5, Linde, bank court seizures |
| USA | 0.82 (0.34–1.7) | 4.4 (1.3–13) | 4.9 (3.2–6.6) | Exxon Sakhalin-1 3.8, aircraft, McDonald's |
| Netherlands | 0.52 (0.2–1.1) | 7.5 (3.1–15.6) | 0.6 | Yandex 4.7, Avito, Heineken, AgroTerra |
| UK | 0.68 (0.3–1.4) | 3.2 (0.9–10) | 3.9 (2.2–6.2) | Shell Sakhalin-2, Raven Russia, Unilever |
| France | 0.52 (0.2–1.1) | 5.6 (3.0–12.3) | 0.7 | Renault, Société Générale, Danone |
| Kazakhstan (conduit) | 0.04 | 3.6 (1.7–6.5) | 0 | Polymetal |
| Austria | 0.04 | 0.15 | 3.4 (2.8–4.1) | Raiffeisen 1.87, OMV 1.5 |
| Ireland | 0.06 | 0.2 | 2.8 (1.5–5.1) | aircraft lessors |
| Finland | 0.16 | 0.6 | 1.7 (1.2–2.5) | Fortum |
| Denmark | 0.24 | 0.8 | 1.0 (0.7–2.5) | Carlsberg |
| Japan | 0.06 | 1.0 | 1.0 | Nissan, Toyota, aircraft (SMBC, ORIX) |
| Norway | 0.15 | 1.5 | 0.04 | Equinor |

Certainty:
- Budget totals: B.
- Country contributions: C for the large countries, D for the rest.
- Discount: C where a case is named, otherwise D.
- Seizures: B for named company write-downs and C for court seizures.

### What is guessed
- The exit share of the 2025–2026 budget line.
- The discount/contribution ratios.
- The 2022 residual.
- Fair values for Shell's Sakhalin-2 stake, Unipro, OMV's stake and Polymetal.
- The aircraft net figure and its split by lessor home country.
- Whether Yandex and Polymetal paid a contribution, which is not found. If they did, part of the 2024 ratio discount double counts them. The explicit mega-deals are then on top, and the high case covers this.

## 2. Profits remitted by Russian-owned companies abroad (item 24)

### What the flow is
These are dividends and profit transfers from operating subsidiaries abroad to Russian parents (Lukoil, Rosneft, Gazprom, Gazprom Neft, Zarubezhneft, Russian banks, MTS and others). The host country is where the subsidiary operates.

Holding conduits are not hosts:
- Cyprus
- Lukoil International GmbH in Austria
- Dutch holdings
- Litasco and other trading arms in Switzerland or the UAE

Trading margins are part of Russian export revenue, already in the trade and energy parts.

### Data found
- **Bank of Russia BoP** ([standard components](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx), [DI income](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/direct_investment/70e-dir_inv.xlsx)). Direct investment income receivable, USD bn:

  | | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
  |---|---|---|---|---|---|---|---|
  | all DI income receivable | 35.2 | 28.6 | 66.0 | 23.8 | 18.0 | 8.1 | 8.0 |
  | dividends | 17.6 | 21.8 | 20.2 | n/a | n/a | n/a | n/a |

  Dividends are only split out up to 2021. Most of this is round-tripping: Russia's 2021 outward FDI position was USD 205bn in Cyprus out of 375bn. There is no split by country after 2021. This series is used only as an upper bound.
- **Host balance-of-payments data.** Eurostat `bop_fdi6_inc` (partner RU) is almost entirely confidential.
- **Lukoil 2021 IFRS** ([release](https://www.lukoil.com/PressCenter/Pressreleases/Pressrelease?rid=577486)). Outside-Russia EBITDA was RUB 164.4bn for upstream and 116.6bn for downstream, about EUR 3.2bn in total. Lukoil stopped publishing IFRS after 2021.
- **NIS (Serbia)** reported dividends ([biznis.rs](https://biznis.rs/vesti/nis-danas-isplacuje-rekordnu-dividendu/)):

  | paid in | RSD bn | note |
  |---|---|---|
  | 2023 | 23.36 | record |
  | 2024 | 10.48 | |
  | 2025 | 4.6 | Russian shareholders' part deferred under US sanctions |

  The Russian share is 56.15%.
- **Host choices that stopped flows:**
  - Germany put Gazprom Germania (April 2022) and Rosneft Deutschland (September 2022) under trusteeship.
  - Italy put ISAB under a trustee, then it was sold in 2023.
  - Bulgaria appointed a special manager for Lukoil Neftochim in November 2025 ([BTA/Agerpres](https://agerpres.ro/economic-extern/2025/11/17/bta-rumen-spetsov-a-fost-numit-administrator-special-la-lukoil-neftochim-burgas--1503634)).
  - US sanctions of October 2025 forced the sale of Lukoil International. The Carlyle deal of January 2026 excludes Kazakhstan and is subject to OFAC approval ([Interfax](https://interfax.com/newsroom/top-stories/115836/)).
  - Iraq froze West Qurna-2 payments.
  - Rosneft cannot repatriate from India: no Nayara dividend was found ([Business Today](https://www.businesstoday.in/amp/latest/corporate/story/russias-rosneft-in-early-talks-with-reliance-to-sell-stake-in-nayara-energy-report-482345-2025-06-29)).

### How the numbers were built
- Lukoil's foreign EBITDA was converted to remitted profit with net/EBITDA about 0.5 and a payout of 0.5–0.8. It was spread over hosts by asset weight: Uzbekistan, Kazakhstan, Iraq, Azerbaijan and Egypt upstream; Bulgaria, Romania, the Netherlands and Italy downstream.
- Rosneft (Egypt Zohr), Zarubezhneft (Vietnam), Gazprom (Germany, UK, Belarus, Armenia) and Russian banks (Belarus, Kazakhstan, Armenia, Austria) were added from their asset size.
- Post-war years follow prices (high 2022) and the host decisions above.
- Ranges are log-normal-like (×0.4 to ×2.0–2.5). NIS is ×0.8–1.25.

### Results, EUR bn
| host | pre-war avg per year | remitted 2022–2026 | change vs pre-war, sum | certainty |
|---|---|---|---|---|
| Kazakhstan | 0.52 | 2.8 | +0.39 | D |
| Belarus | 0.25 | 1.9 | +0.73 | D |
| Uzbekistan | 0.23 | 1.35 | +0.26 | D |
| Iraq | 0.23 | 1.2 | +0.11 | D |
| Egypt | 0.17 | 1.0 | +0.22 | D |
| Vietnam | 0.13 | 0.86 | +0.24 | D |
| Azerbaijan | 0.09 | 0.83 | +0.43 | D |
| Germany | 0.28 | 0.05 | **−1.27** (trusteeship) | C |
| USA | 0.09 | 0.15 | −0.29 | D |
| UK | 0.04 | 0.01 | −0.19 | D |
| Bulgaria | 0.04 | 0.33 | +0.16 | D |
| Serbia | 0.02 | 0.17 | +0.08 | B |
| India | 0 | 0 (0–1.4) | 0 (0 to +1.4) | D |

Across all hosts, remittances were about EUR 2.3bn a year before the war. After it they were 3.4 (2022), 2.8, 2.6, 2.1 and 1.0 (2026, eight months). The changes are small next to GDP everywhere except possibly Belarus and Armenia (≤0.1% of GDP over the period).

## Overlaps with existing files
- **[`companies_all.json`](companies_all-notes.md) / `round4a.json` (company taxes).**
  - These count taxes of subsidiaries while foreign-owned, using profit tax + half of other taxes.
  - KSE lists "exit taxes" among "other taxes". However, the exit contribution is paid by the seller or buyer to the budget, not by the subsidiary, so little of it should be in subsidiary tax data.
  - Worst case: half of up to EUR 1.6bn a year is double counted.
  - Recommendation: keep company taxes as they are and add `exit_contribution` in full.
- **Taxes after the sale.** Firms sold to Russian owners are already removed from the company-tax scope (factor f), so taxes paid after the sale are not attributed to the old home country.
- **Not counted here:**
  - Trapped dividends of companies still in Russia (type-C accounts, BP's Rosneft stake, RBI's EUR 4.4bn excess capital).
  - Sale prices of Russian assets abroad (ISAB, the coming Lukoil International sale), which are capital swaps.
- **Profits remitted** do not overlap with any file: no existing part counts income on Russian outward FDI. Trading-arm and Cyprus holding income are excluded to avoid double counting with trade and energy.

## Things the builder must decide or watch
1. **Direction and fairness.** Exit payments are a cost that companies paid *because* they left. Counting them "toward Russia" for the home country is consistent with "payments to Russia count in full". But it lowers the score of countries whose firms left, while firms that stayed are already counted through taxes. A label or toggle may be wise.
2. **Discount and seizure are not payments to the Russian state.** They are wealth transfers to Russian residents and the state. They are large (about EUR 34bn and 33bn, against 4.7bn of contributions), and they are one-off write-downs measured at book or "fair" values. The suggested default is to count only `exit_contribution`, with the other two as an optional layer.
3. **Conduits.** Polymetal (Kazakhstan) and Yandex (Netherlands) dominate those countries' discount totals.
4. **Profits remitted** are mostly D-grade guesses. Post-war increases partly reflect 2022 oil and gas prices, not host choices. A price deflator (fuel `pidx`) would remove most of the increase for oil hosts.
5. The 2025–2026 budget line mixes exit payments with Russian business "donations". Never use 251bn or 384bn as exit payments.

## Open questions
- An exit contribution per deal (MinFin does not publish one). Did Yandex and Polymetal pay one?
- Lukoil foreign dividends after 2021, and whether Lukoil International paid anything to Moscow in 2024–2025.
- Nayara dividends (FY2023–FY2025 board minutes in India).
- How much of the 2026 Q1 budget line came from exits.
- The final outcome of aircraft settlements and of the Exxon Sakhalin-1 talks (Russia offered a return in 2025).
