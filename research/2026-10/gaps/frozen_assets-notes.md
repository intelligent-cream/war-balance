# Frozen Russian reserves: the return Russia did not get

Data: [`frozen_assets.json`](frozen_assets.json). Gathered 2026-10-18. Not yet reviewed by a person. Not wired into the pipeline.

## The question

The owner decided that freezing the Bank of Russia's reserves counts. Each holding country gets credit, on its balance with Russia, for the **yearly return those reserves would have earned for Russia** without the freeze. The frozen amount itself is not counted.

So we need, per holding country and year (2022 from 28 February, 2023–2025, 2026 = January–August):

1. how much is immobilised there;
2. what it would have earned;
3. whether anything is counted twice.

## What we found

### The amounts

Only Euroclear and Switzerland publish figures. Everyone else is estimated.

- **The EU holds about EUR 210bn.** About 185 is at Euroclear in Brussels and about 25 is in commercial banks (France, Germany, Sweden, Cyprus, Belgium). Source: the Commission, reported by Euronews.
- **Euroclear's cash keeps growing** as Russia's bonds mature. Its balance sheet shows these amounts for all sanctioned Russian assets, private ones included: 86 (cash, Sep 2022), 183 (Dec 2024), 195 (Dec 2025), 200 (Mar 2026) and 202 (Jun 2026). By October 2025 the Bank of Russia's cash was about 175–176. The Bank of Russia's whole position (cash plus securities not yet matured) stays at about 180–186. Only the mix shifts from securities to cash.
- **EPRS/PISM (2025) gives a country split:** Belgium 180, Japan 28.1, UK 26.6, France 19, Canada 15.1, Luxembourg 10, Switzerland 6.2, US 4.3 and Germany 0.21 EUR bn, about 290 in all. **This split counts some money twice.** About 8% of Euroclear's cash sits in Canadian dollars, about C$22bn in Canadian banks, which is the same EUR 15bn as "Canada". About 17% is in sterling (about EUR 30bn). Australia's "AUD 7bn" is likewise Euroclear's 2% in Australian dollars. These sums are frozen by the EU through Euroclear, so they belong to Belgium. Without the double counting the countries add up to about **EUR 260bn**, which matches the CFR/G7 estimate.
- **Switzerland:** SECO reports CHF 7.45bn of Bank of Russia reserves (April 2025), kept separate from CHF 7.4bn of private assets.
- **France:** Finance minister Le Maire said EUR 22.8bn was frozen (March 2022). PISM uses 19.
- **Germany:** only a "small three-digit million amount" (dpa, December 2025).
- **Luxembourg:** the government says below EUR 10,000; EPRS assumed 10bn. We use 2 (range 0–10).
- **Japan:** not disclosed. Estimates run EUR 25–30bn (USD 30bn), and Nikkei reported JPY 4–5 trillion in 2021.
- **US:** USD 5.06bn (REPO task force, 2023).

### What Russia held before the war (Bank of Russia Annual Report 2021)

On 1 January 2022 Russia held USD 612.9bn: 481.4 in foreign currency and 131.5 in gold.

- **By currency:** EUR 33.9%, gold 21.5%, CNY 17.1%, USD 10.9%, GBP 6.2%, JPY 5.9%, CAD 3.2%, AUD 1.0%, SGD 0.3%.
- **"By country":** gold in Russia 21.5, China 16.8, Germany 15.7, France 9.9, Japan 9.3, US 6.4, UK 5.1, supranational 4.3, Canada 2.7, Austria 2.5, other 5.8 (% of the total).
- **Caution:** the country is where the issuer or counterparty is based, **not where the asset is held**. German Bunds held at Euroclear count as "Germany". Do not use these shares as holding-country amounts.

### The yields

The Bank of Russia kept short, safe portfolios: government bills and bonds, deposits and repo. In 2021 it earned −0.74% on euros, 0.05% on dollars, −0.32% on sterling, −0.07% on yen and −0.14% on Canadian dollars. So the right rate depends on the currency and the year.

| % a year (central) | 2022 (Mar–Dec) | 2023 | 2024 | 2025 | 2026 (Jan–Aug) |
|---|---|---|---|---|---|
| EUR | 0.4 | 3.3 | 3.5 | 2.2 | 2.0 |
| USD | 2.2 | 5.1 | 5.0 | 4.2 | 3.7 |
| GBP | 2.0 | 4.7 | 5.0 | 4.2 | 3.8 |
| JPY | 0.0 | 0.0 | 0.1 | 0.5 | 0.8 |
| CAD | 2.2 | 4.8 | 4.5 | 2.7 | 2.3 |

How the low, central and high rates are set:

- **low** = the policy or deposit rate;
- **high** = the 1–2-year government yield plus a small spread;
- **central** = between the two.

The JSON gives all three for each currency, including AUD and SGD.

**Check against Euroclear.** Euroclear actually earned EUR 0.82bn (2022), 4.4 (2023), 6.9 (2024), 5.0 (2025) and 2.3 (H1 2026) on Russian cash. That is about 3.4%, 3.8% and 2.6% a year from 2023 to 2025, and about 2.3% in 2026. Our blended central rate for Euroclear's currency mix is 3.8, 4.0, 2.75 and 2.5%. Close enough. Euroclear also keeps some cash at central banks below market rates.

**The owner's 3–4% fits dollars and sterling from 2023 to 2025.** It is too high for euros in 2022, for 2025–2026 euros and for yen in every year.

## Method

```
return_denied[country, year] = immobilised_central × blended_rate_central × year_fraction
blended_rate = Σ currency share × rate(currency, year)
year_fraction: 2022 = 10/12 (freeze on 28 Feb), 2026 = 8/12, otherwise 1
```

- **Ranges:** the relative error of the amount and the relative error of the rate are combined in quadrature, because they are independent. The low end never goes below "low amount × low rate".
- **Adding up years:** yearly ranges add up (`sum3()`), which is right here because the amount error is the same every year.
- **Currency mix for Belgium:** Euroclear's cash mix in Q3 2024 (EUR 65, GBP 17, CAD 8, USD 7, AUD 2, SGD 1%), used for every year. This is a guess for 2022, when most of the position was still bonds.
- **Currency mix for France, Switzerland and others:** educated guesses, recorded in `currency_mix_basis`.

## Results (EUR bn, central; range for 2022–2026)

| Holder | Immobilised (2024) | 2022 | 2023 | 2024 | 2025 | 2026 | **2022–26** | Range | Cert. |
|---|---|---|---|---|---|---|---|---|---|
| Belgium (Euroclear) | 183 (175–192) | 1.47 | 6.88 | 7.24 | 5.09 | 3.07 | **23.8** | 20.6–26.8 | B |
| France | 20 (15–23) | 0.11 | 0.71 | 0.74 | 0.50 | 0.30 | **2.4** | 1.7–2.9 | C |
| United Kingdom | 10 (3–27) | 0.17 | 0.47 | 0.50 | 0.42 | 0.25 | **1.8** | 0.5–4.9 | D |
| Switzerland | 7.8 (7.2–8.4) | 0.08 | 0.32 | 0.33 | 0.25 | 0.15 | **1.1** | 1.0–1.3 | B |
| United States | 4.5 (3–8) | 0.08 | 0.23 | 0.23 | 0.19 | 0.11 | **0.8** | 0.5–1.5 | C |
| Japan | 28 (20–40) | 0.00 | 0.00 | 0.03 | 0.14 | 0.15 | **0.3** | 0.15–0.6 | C |
| Luxembourg (Clearstream) | 2 (0–10) | 0.01 | 0.07 | 0.08 | 0.05 | 0.03 | **0.24** | 0–1.2 | D |
| Canada | 0.5 (0.1–3) | 0.01 | 0.02 | 0.02 | 0.01 | 0.01 | **0.08** | 0–0.5 | D |
| Singapore | 0.3 (0–1.5) | | | | | | **0.05** | 0–0.2 | D |
| Austria | 0.3 (0–2) | | | | | | **0.03** | 0–0.2 | D |
| Germany | 0.21 (0.1–0.5) | | | | | | **0.02** | 0.01–0.06 | C |
| South Korea | 0.1 (0–1) | | | | | | **0.02** | 0–0.2 | D |
| Australia | 0.05 (0–0.5) | | | | | | **0.01** | 0–0.1 | D |
| EU, not split (Sweden, Cyprus, Belgian banks) | 3 (1–8) | | | | | | 0.35 | 0.1–1.0 | D |
| **Total** | **about 260** | | | | | | **about 31** | 24.5–40.4 | |

- **The owner's flat 3.5%** would give about EUR 40bn. The difference is mostly Japan (4.4 → 0.3) and euros in 2022.
- **Belgium** gets about 4% of its GDP from this one part. That is larger than its whole Kiel aid.
- **The strict variant** for Belgium counts only the return that is lost for good: Euroclear's interest on the Bank of Russia's unpaid cash. It comes to 0.76 / 4.1 / 6.4 / 4.65 / 2.85, about EUR 18.8bn. Interest on bonds that had not yet matured was blocked as coupons, not lost.

## Overlap with the windfall profits and the ERA loans

**Short answer: no double count with ERA or with the EU windfall contributions after 2024, as long as both stay out of donors' aid.** One real overlap needs fixing: Belgium's tax-funded aid.

The return Russia did not get is counted once, toward Ukraine, on the holder's balance. What Euroclear does with that return (windfall to the EU, ERA repayments, Belgian tax, its own buffer) is then Russia's money in transit. It must not show up again as a donor's aid.

1. **ERA loans** (US 18.3, EU 18.1, Canada 3.3, UK 2.6, Japan 1.6 EUR bn). These are already removed from donors' aid (`ERA_YEARS` / `era_excluded` in `build_data.py`), and they are repaid from the windfall. **No double count.**
2. **EU windfall contributions.** Payments: July 2024 1.55; spring 2025 about 2.05; July 2025 1.6; early 2026 about 1.4; July 2026 about 1.4 (estimated). Total paid by Q1 2026 about 6.6.
   - From 2025 they go to the ERA repayment mechanism: no double count.
   - **The 2024 money went about 90% to the European Peace Facility and 10% to the Ukraine Facility.** If Kiel counts those payments as EU aid, they reach member states through their EU shares: about EUR 1.4–3bn across the EU27, small for any one country.
   - Builder: check Kiel's EU row for 2024–2025 entries funded by the windfall and take them out.
   - The 90/10 split is from memory of the May 2024 Council decision. Verify it.
3. **Belgian corporate tax on Euroclear's Russian income.** It was about EUR 1.7bn in 2024 and an estimated 1.0bn in 2025, falling in 2026. Belgium pledged all of it to Ukraine, mostly as military aid. Belgium's Kiel aid jumps to 1.35 (2024) and 1.42 (2025) EUR bn. **That is a real double count for Belgium:** its aid is paid out of Russia's lost return, which Belgium already gets credit for.
   - Option (a): take the tax-funded part out of Belgium's aid. This is cleaner.
   - Option (b): credit Belgium only with the return denied minus the tax.
   - Both give the same total. Belgium does not publish which aid the tax paid for (Kyiv Post fact-check), so the split is uncertain.
4. **Euroclear's retained profits** (its risk buffer, plus 10% of the windfall held back for 5 years). These are inside the return denied and are nobody's aid. No double count.
5. **Naming clash.** The map already has a "windfall": extra paid to Russia because of war-time fuel prices. Do not call this part "windfall". Call it "return on frozen reserves".

## Private sanctioned assets (kept separate)

- **EU:** about EUR 28bn (Commission, 2024; widely cited, not re-checked against the primary text). The late-2022 split by member (total 18.9): Belgium 3.5, Luxembourg 2.5, Italy 2.3, Germany 2.2, Ireland 1.8, Austria 1.8, France 1.3, Spain 1.0, other 2.5.
- **UK:** GBP 25bn (OFSI, March 2025), said to exclude sovereign assets.
- **Switzerland:** CHF 7.4bn (SECO, March 2025).
- **Canada:** C$185m.
- **Australia:** under AUD 100m.
- **All REPO members together:** about USD 58bn (2023).

**Recommendation: do not count these.** They are private money, not the Russian state's. Much of it is yachts, villas and company shares that earn no interest. And freezing it does not cut what the Russian state can spend.

## Not frozen (for the docs)

- **China:** about USD 103bn (16.8% on 1 January 2022), and yuan assets about USD 105bn. Russia has since used part of its yuan.
- **Gold in Russia:** USD 131.5bn, out of reach of sanctions.
- **Supranational:** about USD 26bn (IMF position, BIS). Hard to use, but not frozen as such.
- **"Other":** about USD 36bn, split between sanctioning countries and others. No data on India, Turkey, the UAE or others holding Bank of Russia reserves in size.
- **Overall:** Russia said about USD 300bn of its roughly USD 640bn was frozen.

## What is guessed

- **Educated guesses with wide ranges:** UK 10 (3–27), Luxembourg 2 (0–10), Canada 0.5, Austria, Singapore, Korea, Australia, and the "EU, not split" block. The UK is the biggest open item: if PISM's 26.6 is right, the UK's credit rises from 1.8 to about 4.9.
- **Currency mixes** for France, Switzerland and the UK are assumptions.
- **Euroclear's 2024 cash mix** is applied to 2022, when most of the position was still bonds.
- **2026 rates** assume mid-2026 policy rates hold through August.
- **Not in the range:** without a freeze, Russia would have spent part of these reserves, for example to defend the rouble. Then it would not have earned the return on all of it. That could overstate everything by perhaps 10–30% (a guess).

## What the builder must watch

1. **Belgium dominates** (about 24 of 31). Open owner question: credit Belgium alone, as the brief says, or spread the Euroclear part over EU members (by GNI, like EU aid)? The freeze is an EU decision and Euroclear only holds the assets. The same question applies to Clearstream.
2. **Never add** the EPRS/PISM figures for Canada or the UK on top of Belgium's.
3. **Remove Belgium's tax-funded aid** (overlap 3), and check Kiel's 2024 EU entries funded by the windfall (overlap 2).
4. **Use per-currency rates, not a flat 3–4%.** Otherwise Japan is overstated more than tenfold.
5. **This part needs its own name and source id.** It is "toward Ukraine" on the holder's balance, with no pre-war comparison, so use `sum3()` for the years.
6. **If the EU ever lends the principal** (the Reparations Loan, shelved in December 2025), that loan must stay out of donors' aid, like ERA.

## Sources

The main ones are listed below. All of them are in `sources` in the JSON.

- Bank of Russia, [Annual Report 2021](https://www.cbr.ru/Collection/Collection/File/43443/ar_2021_e.pdf), charts 30–32 and table 23.
- Bank of Russia, [FX and gold asset management report No. 1 (61) 2022](https://www.cbr.ru/Collection/Collection/File/39685/2022-01_res_en.pdf).
- [EPRS BRI(2025)775908](https://eprs.europarl.europa.eu/contents/publications/EPRS/2025/09/EPRS_BRI(2025)775908.html), Figure 1.
- Euroclear results: [2025](https://www.euroclear.com/newsandinsights/en/press/2026/mr-06-euroclear-delivers-strong-2025-results.html), [Q1 2026](https://www.euroclear.com/newsandinsights/en/press/2026/mr-12-euroclear-delivers-q1-2026-results.html), [H1 2026](https://www.euroclear.com/newsandinsights/en/press/2026/mr-20-euroclear-h1-2026-results.html), [2024](https://www.euroclear.com/newsandinsights/en/press/2025/mr-05-euroclear-delivers-strong-results-in-2024.html).
- [New Lines Institute](https://newlinesinstitute.org/wp-content/uploads/2025116-Ukraine-Reparations-NLISAP-1.pdf) (Euroclear cash by currency).
- [Euronews: where are the assets](https://www.euronews.com/my-europe/2025/11/06/where-are-the-russian-immobilised-assets-nobody-except-belgium-wants-to-say).
- [SECO via bluewin](https://www.bluewin.ch/en/news/switzerland-freezes-russian-assets-worth-15-billion-2633158.html).
- [Belga: Belgian tax EUR 1.7bn](https://www.belganewsagency.eu/frozen-russian-assets-at-euroclear-earn-belgium-17-billion-euros-in-tax-revenue).

Scripts: `/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r7/frozen_assets/scripts/` (`build.py` for the calculation, `assemble.py` for the JSON).
