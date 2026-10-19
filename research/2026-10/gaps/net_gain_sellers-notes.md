# Sellers' net gain per euro of sales (round 13)

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
| r × N11NA | a normal return on capital | net capital stock at current replacement cost; r = 9% (8–10%), the same as for Russia; where a country does not publish the stock, the median capital per unit of output of the industry (for 3-digit defence industries, the parent's ratio) |

Profit tax is paid out of the operating surplus, so it is inside the gain. Central: the mean of 2021–2023 (the years STAN covers during the war) at r = 9%; low: the lowest year of 2019–2023 at 10%; high: the highest at 8%. Each share is kept between 0 and 1. Tiny 3-digit industries whose taxes or surplus exceed their output are left out (data errors, e.g. Greece's weapons industry 2021).

## Industry groups

| kind of earning | industries | key in `data.json` `vk` |
|---|---|---|
| goods sold to Russia (lost or extra), other flowback | manufacturing (C) | rl, rx, fo |
| weapons flowback (own and others' aid spent at home, arms Ukraine bought), paid weapons sent to Russia | weapons and ammunition (C252), aircraft (C303), military vehicles (C304), electronics (C26); where STAN has no 3-digit defence data, C25, C26, C28, C30 | fw |
| extra sales to Ukraine | fuel share × refined petroleum (C19) + rest × manufacturing; fuel shares from UN Comtrade as in `value_kept-notes.md` | ux |
| services sold to Russia | mean of accommodation and food (I) and business services (G–N) | sl, sx |
| shipping Russian oil | water transport (H50) | sh |
| insuring Russian oil | insurance (K65) | in |
| payment agents' fees | finance (K) | ag |

Manufacturing (C) replaces the industry excluding construction (BTE) that `value_kept.json` used for sales to Russia: what Europe, China, Türkiye and Belarus sell to Russia is mostly machinery, vehicles, chemicals and food, not mining or electricity.

## Results (central)

| country | goods | weapons | fuel | services | shipping | insurance | finance |
|---|---|---|---|---|---|---|---|
| USA | 0.038 | 0.032 | 0.085 | 0.050 | 0.000 | median | 0.134 |
| DEU | 0.013 | 0.037 | 0.048 | 0.000 | 0.060 | 0.117 | 0.043 |
| GBR | 0.035 | 0.021 | 0.018 | 0.017 | 0.000 | 0.329 | 0.187 |
| FRA | 0.008 | 0.063 | 0.013 | 0.000 | 0.262 | 0.000 | 0.000 |
| ITA | 0.010 | 0.035 | 0.010 | 0.012 | 0.000 | 0.247 | 0.140 |
| POL | 0.066 | 0.112 | 0.116 | 0.161 | median | 0.000 | 0.321 |
| CZE | 0.000 | 0.035 | 0.000 | 0.000 | 0.000 | 0.228 | 0.111 |
| NLD | 0.040 | 0.036 | 0.006 | 0.025 | 0.054 | 0.124 | 0.195 |
| FIN | 0.027 | 0.026 | 0.000 | 0.000 | 0.000 | 0.388 | 0.243 |
| DNK | 0.070 | 0.096 | 0.041 | 0.000 | 0.190 | 0.041 | 0.144 |
| NOR | 0.009 | 0.092 | 0.000 | 0.004 | 0.000 | 0.000 | 0.291 |
| GRC | 0.069 | 0.146 | 0.028 | 0.119 | 0.000 | 0.080 | 0.320 |
| KOR | 0.000 | median | median | median | 0.391 | 0.154 | 0.239 |
| JPN | 0.000 | 0.015 | 0.122 | 0.006 | median | median | 0.205 |
| TUR | median | median | median | median | median | median | median |
| OECD median (25th–75th) | 0.013 (0.000–0.040) | 0.037 (0.020–0.079) | 0.018 (0.000–0.049) | 0.002 (0.000–0.026) | 0.000 (0.000–0.045) | 0.155 (0.104–0.265) | 0.196 (0.134–0.281) |

"median" = the country is not in STAN for that industry and takes the OECD median. Türkiye publishes no output by industry in STAN, so it takes the medians.

**Reading.** Manufacturing in OECD economies earned about 1% of output above a 9% return on its capital in 2021–2023 (median); Korea and Japan earned less than that return, so their gain is 0. This matches Russia's "other manufactured goods" (0.05). Water transport is near zero in most countries in national accounts; Denmark (0.19, container boom) and France and Korea are exceptions. Greek shipowners' profits are mostly booked offshore, outside Greece's accounts, so Greece's H50 shows a loss: Greek shipping now counts at 0.

## Economies outside STAN

China, India, the UAE, Belarus, Kazakhstan, North Korea, Iran and every other economy outside the 38 OECD members take the OECD median of each industry (with the 25th to 75th percentile as range). This is labelled in `data.json` (`ng_own` false) and is the main weakness of this file: China's industrial firms' margins are not measured here.

## How it is applied

`apply_value_kept()` in [`build_data.py`](../../../pipeline/build_data.py): for each country and kind of earning, net gain × genuinely extra (`value_kept.json`'s `extra`, with round-11 overrides). The two ranges are combined as independent errors in absolute terms. The round-6 products (value kept × extra) are kept as `vk_old` for the method band. Shipping freight and insurance are re-valued; ship sales (their price premium) and flag-registry fees keep their shares (premium and fees are already rent). Payment agents' fees are multiplied by the financial industry's share. Paid weapons sent to Russia use the weapons group (`military_payment_r13.json`).

## Effect

On the map (net, % of a year's GDP, this step alone): Belarus −18.5 → −5.6, Kyrgyzstan −16.7 → −6.1, Armenia −10.1 → −2.4, Cyprus +6.1 → −0.3, Georgia −7.2 → −2.3, China −1.56 → −1.05, the US +0.36 → +0.48 (US flowback earned back EUR 44bn → 1.5bn).

## What is guessed

- The normal return (9%, 8–10%): the same as for Russia; it is a judgement about the cost of capital.
- The industry stands in for the seller: an exporter's margin can differ from its industry's average.
- The OECD median for every economy outside STAN.
- Only the seller's own industry counts, not its domestic suppliers' gain (as for Russia).
