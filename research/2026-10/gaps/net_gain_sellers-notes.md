# Sellers' net gain per euro of sales (round 13; normal return revised in round 14)

Gathered on 2026-10-19. Output: [`net_gain_sellers.json`](net_gain_sellers.json). Script: [`../scripts/net_gain_sellers.py`](../scripts/net_gain_sellers.py). Raw downloads: [`../raw/oecd_stan/`](../raw/oecd_stan/). **No one has reviewed this yet.**

## Why

An independent audit (19 October 2026) found that the map valued sales under two rules. Russia's and Ukraine's sales counted at the seller's **net gain** (taxes plus profit above a normal return, `net_gain_russia.json`, `net_gain_ukraine.json`). Everyone else's earnings counted at **value kept** (OECD TiVA domestic value added, which includes wages) × genuinely extra (`value_kept.json`). The owner approved one rule for every seller: net gain × genuinely extra. This file gives the net gain for every seller other than Russia and Ukraine.

## Definition

The same concept as for Russia and Ukraine, built from national accounts by industry:

```
net gain = (D29X39 + B2A3N − SELF × D1 / SAL − r × N11NA) / P1
```

| code | what | note |
|---|---|---|
| P1 | output | the denominator, like the FOB price for Russia |
| D29X39 | other taxes less subsidies on production | the state's take on production; exports carry no VAT |
| B2A3N | net operating surplus and mixed income | profit after depreciation, before profit tax; where only gross surplus is published, gross minus consumption of fixed capital (P51C); for 3-digit defence industries without P51C, the parent industry's ratio |
| SELF × D1 / SAL | the labour part of mixed income | the self-employed paid as employees are; SELF = EMP − SAL where SELF is missing |
| r × N11NA | a normal return on capital | net capital stock at current replacement cost; **round 14: r = 5% real, after company tax, plus the country's risk premium (low case 6%, high case 4%, plus the same premium)**; round 13 used 9% (8–10%) nominal; where a country does not publish the stock, the median capital per unit of output of the industry (for 3-digit defence industries, the parent's ratio) |

Profit tax is paid out of the operating surplus, so it is inside the gain, and r is an after-tax rate. Central: the mean of 2021–2023 (the years STAN covers during the war) at r = 5% + the country premium; low: the lowest year of 2019–2023 at 6% + premium; high: the highest at 4% + premium. Each share is kept between 0 and 1. Tiny 3-digit industries whose taxes or surplus exceed their output are left out (data errors, e.g. Greece's weapons industry 2021).

## Industry groups

| kind of earning | industries | key in `data.json` `vk` |
|---|---|---|
| goods sold to Russia (lost or extra), other flowback | manufacturing (C) | rl, rx, fo |
| weapons flowback (own and others' aid spent at home, arms Ukraine bought), paid weapons sent to Russia | weapons and ammunition (C252), aircraft (C303), military vehicles (C304), electronics (C26); where STAN has no 3-digit defence data, C25, C26, C28, C30 | fw |
| extra sales to Ukraine | fuel share × refined petroleum (C19) + rest × manufacturing; fuel shares from UN Comtrade as in `value_kept-notes.md` | ux |
| services sold to Russia | mean of accommodation and food (I) and business services without real estate (G–N less L, STAN `GTNXL`; round 13 used `GTN`, which includes real estate) | sl, sx |
| shipping Russian oil | water transport (H50) | sh |
| insuring Russian oil | insurance (K65) | in |
| payment agents' fees | finance (K) | ag |

Manufacturing (C) replaces the industry excluding construction (BTE) that `value_kept.json` used for sales to Russia: what Europe, China, Türkiye and Belarus sell to Russia is mostly machinery, vehicles, chemicals and food, not mining or electricity.

## Results (central, round 14)

| country | goods | weapons | fuel | services | shipping | insurance | finance |
|---|---|---|---|---|---|---|---|
| USA | 0.067 | 0.051 | 0.105 | 0.109 | 0.000 | median | 0.154 |
| DEU | 0.030 | 0.051 | 0.052 | 0.037 | 0.113 | 0.142 | 0.071 |
| GBR | 0.047 | 0.031 | 0.024 | 0.045 | 0.000 | 0.339 | 0.197 |
| FRA | 0.021 | 0.071 | 0.016 | 0.000 | 0.306 | 0.000 | 0.000 |
| ITA | 0.016 | 0.041 | 0.014 | 0.044 | 0.000 | 0.252 | 0.149 |
| POL | 0.073 | 0.125 | 0.123 | 0.181 | median | 0.004 | 0.330 |
| CZE | 0.012 | 0.045 | 0.000 | 0.018 | 0.000 | 0.234 | 0.129 |
| NLD | 0.057 | 0.047 | 0.014 | 0.082 | 0.105 | 0.136 | 0.219 |
| FIN | 0.043 | 0.032 | 0.009 | 0.018 | 0.000 | 0.394 | 0.248 |
| DNK | 0.098 | 0.121 | 0.051 | 0.035 | 0.211 | 0.051 | 0.168 |
| NOR | 0.027 | 0.107 | 0.000 | 0.052 | 0.000 | 0.000 | 0.315 |
| GRC | 0.073 | 0.150 | 0.029 | 0.145 | 0.000 | 0.082 | 0.325 |
| KOR | 0.000 | median | median | median | 0.434 | 0.164 | 0.261 |
| JPN | 0.002 | 0.020 | 0.130 | 0.034 | median | median | 0.218 |
| LTU | 0.077 | 0.201 | median | 0.053 | 0.118 | 0.247 | 0.315 |
| EST | 0.005 | 0.000 | 0.000 | 0.022 | 0.000 | 0.371 | 0.348 |
| LVA | 0.039 | 0.077 | 0.000 | 0.008 | 0.000 | 0.253 | 0.209 |
| TUR | median | median | median | median | median | median | median |
| OECD median (25th–75th) | 0.027 (0.005–0.065) | 0.051 (0.027–0.100) | 0.024 (0.000–0.058) | 0.040 (0.018–0.069) | 0.000 (0.000–0.092) | 0.164 (0.125–0.281) | 0.218 (0.149–0.297) |
| round 13 OECD median (9% nominal, G–N with real estate) | 0.013 | 0.037 | 0.018 | 0.002 | 0.000 | 0.155 | 0.196 |

"median" = the country is not in STAN for that industry and takes the OECD median. Türkiye publishes no output by industry in STAN, so it takes the medians (its 4.66% country premium is not used). The round-13 results are kept in [`net_gain_sellers_r13.json`](net_gain_sellers_r13.json) (`NG_METHOD=r13`) for the method band.

**Reading.** Manufacturing in OECD economies earned about 3% of output above a 5% real return on its capital in 2021–2023 (median); Korea earned less than that return, so its gain is 0. Water transport is near zero in most countries in national accounts; Denmark, France, Korea and the Netherlands are exceptions. Greek shipowners' profits are mostly booked offshore, outside Greece's accounts, so Greece's H50 shows a loss: Greek shipping counts at 0.

## Economies outside STAN

China, India, the UAE, Belarus, Kazakhstan, North Korea, Iran and every other economy outside the 38 OECD members take the OECD median of each industry (with the 25th to 75th percentile as range). This is labelled in `data.json` (`ng_own` false) and is the main weakness of this file: China's industrial firms' margins are not measured here. **They get no country risk premium (round 14):** a country rate needs the country's own capital stock to apply it to, and these economies publish none by industry in STAN. A higher rate for China or India would lower their gain, but there is nothing to apply it to without inventing a capital stock.

## How it is applied

`apply_value_kept()` in [`build_data.py`](../../../pipeline/build_data.py): for each country and kind of earning, net gain × genuinely extra (`value_kept.json`'s `extra`, with round-11 overrides). The two ranges are combined as independent errors in absolute terms. The round-6 products (value kept × extra) are kept as `vk_old` for the method band. Shipping freight and insurance are re-valued; ship sales (their price premium) and flag-registry fees keep their shares (premium and fees are already rent). Payment agents' fees are multiplied by the financial industry's share. Paid weapons sent to Russia use the weapons group (`military_payment_r13.json`).

## Effect

On the map (net, % of a year's GDP, this step alone): Belarus −18.5 → −5.6, Kyrgyzstan −16.7 → −6.1, Armenia −10.1 → −2.4, Cyprus +6.1 → −0.3, Georgia −7.2 → −2.3, China −1.56 → −1.05, the US +0.36 → +0.48 (US flowback earned back EUR 44bn → 1.5bn).

## 6. The normal return, in plain language (round 14)

> Before counting a seller's profit as gain, we subtract what investors need to earn just to keep their money in the business. We set that at **5% a year above inflation, after company tax**, on the value of machines and buildings, **plus the country's risk premium** (4–6% in the high and low cases, plus the same premium). We use a rate above inflation because the capital is valued at today's prices: its value already rises with inflation each year, and that rise is the investors' compensation for inflation. Subtracting a rate that includes inflation would take inflation out twice. 5% is about what US and European companies' shareholders and lenders required in 2021–2023 after inflation (Damodaran's cost-of-capital data less market inflation expectations), and it matches the 3–5% real rates the OECD reports for productivity statistics. Investors in riskier countries need more: we add Damodaran's country risk premium for each seller with its own OECD data (0 for Germany, the Netherlands and the Nordics; 0.2% for the US; 0.8% for France and the UK; 1.1% for Poland and Lithuania; 1.6% for Latvia; 2.5% for Italy and Hungary; 4.7% for Türkiye, which has no industry data in STAN). Countries without OECD industry data keep the OECD median share, because there is no capital stock to apply their own rate to.

**Why each choice (owner-approved, round 14, audit M2):**

| choice | why | source |
|---|---|---|
| real, not nominal | N11NA is at current replacement cost and operating surplus excludes holding gains; total return = surplus + holding gains, so surplus only has to cover the real part | OECD, *Measuring Capital* 2009, §8 (p. 65), §8.4 (pp. 75–76), §16.1.2 (p. 138: "preferable to operate with a real rate"; long-run real rates 3–5%); Schreyer, Diewert & Harrison (2005), Canberra II recommendation 2; OECD productivity database note (a constant real rate); Barkai (2018/2020); De Loecker, Eeckhout & Unger (2020) |
| after tax | profit tax stays inside the gain, so the rate is what investors need after company tax (a WACC) | Damodaran WACC files; Barkai |
| 5% central | Damodaran's non-financial WACC 2022–2024 (US and Europe about 7.9–8.0% nominal) less US 10-year breakeven inflation (about 2.3–2.5%) ≈ 5.5%; 4.5% with financials; real risk-free (TIPS 0.4–2%) + equity premium 4.2–6% on about 75% equity ≈ 4.5–5.5% | Damodaran `wacc.xls`, `waccEurope.xls` and archives; US Treasury real and nominal yield curves |
| 4% high case, 6% low case | 4% ≈ OECD statistical practice and UK regulated WACCs (4.0–4.7% CPIH-real); 6% covers riskier industries (machinery, electronics, hotels 6.1–6.4% real) and the capital STAN leaves out (inventories, land) | Oxera on the CMA PR24 redetermination (Ofwat FD 4.03%, CMA 4.20%) and Ofgem RIIO-3 (4.34–4.66%) |
| country risk premium | the owner chose to use country differences: Damodaran's rating-based country risk premium, January 2026, added in full to the 5% for each STAN seller (the research had suggested scaling it by the equity share, about 0.7; the owner's rule adds it in full, a judgement) | Damodaran, *Country Default Spreads and Risk Premiums* (`country_risk_r14.json`) |
| one rate for all industries | measured industry real WACCs (4.8–6.4%) lie inside the 4–6% band; ONS work recommends one required real rate in all industries | Oulton & Wallis (2015); Oulton & Rincón-Aznar (2009) |
| why 9% looked plausible | it is close to a nominal cost of **equity** (Kroll about 8.5–9.5%), not a real WACC | Kroll, September 2025 |
| services without real estate | STAN's `GTN` is "services of the business economy, sections G to N" and includes real estate (L), whose dwelling stock made Germany's G–N capital three times its output (2022: GTN capital EUR 10.1trn = GTNXL 2.0trn + L 8.1trn); `GTNXL` leaves real estate out | OECD STAN 2025 code list and data |

**Effect (this step alone, net % of a year's GDP):** Cyprus +0.40, Belarus −0.38, Kyrgyzstan −0.20, Armenia −0.16, Georgia −0.15, North Korea −0.12, Montenegro +0.12, Lithuania +0.10; every other country moves by 0.06 or less. US weapons flowback counted as profit rises from 2.2% to 3.6% of the money flowing back (EUR 1.55bn to 2.50bn of 70.2bn).

**Russia's and Ukraine's files (consistency check, round 14).** Each file subtracts an after-tax required return that matches its capital base:

| file | rate as used | capital base | currency | after-tax rate | about, real | 5% real + country premium |
|---|---|---|---|---|---|---|
| `net_gain_russia.json` | 9% (8–10%) on capital employed | company capital employed (book value; 65 USD per barrel of crude, 1.0× revenue for fertilisers) | nominal USD | 9% (profit tax counted as gain, the 9% taken from the pre-tax margin) | 6.5% | 5% + 3.9% = 8.9% real, about 11.4% nominal USD |
| `net_gain_ukraine.json` | 10% (8–12%) before profit tax, on capital employed | company capital employed (book value) | nominal USD | 10% × (1 − 18%) = 8.2% | 5.8% | 5% + 15.5% = 20.5% real, about 23% nominal USD |
| `net_gain_sellers.json` | 5% (4–6%) + premium | STAN N11NA, current replacement cost | national currency, real | 5% + premium | 5% + premium | — |

Book capital pairs with a nominal rate, replacement-cost capital with a real rate; the labels "before tax" (Russia) and "pre-tax" (Ukraine) are corrected to "after tax" in their notes. **Finding:** both files subtract less than "5% real + their country premium" implies: Russia by about 2.4 points (its gain on crude would fall by about 0.02–0.03 of the price at 1.0× revenue of capital), Ukraine by about 15 points (its gain on farm, steel and ore exports would fall to little more than taxes). **Not changed in round 14:** both files were built by hand per product group, and the capital per unit of revenue is recorded for only some groups (crude, fertilisers), so a recomputation would need inputs that are not in the research; the direction is stated here and in `docs/decisions.md`.

## What is guessed

- The normal return (round 14: 5% real after tax, 4–6%, plus the country premium): a judgement anchored on market data (section 6); round 13's 9% nominal is kept as the method band's old-method bound.
- The industry stands in for the seller: an exporter's margin can differ from its industry's average.
- The OECD median for every economy outside STAN.
- Only the seller's own industry counts, not its domestic suppliers' gain (as for Russia).
