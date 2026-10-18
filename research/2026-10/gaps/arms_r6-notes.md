# Russian arms income: who the "rest of world" buyers are, and the Iran double count (round 6, C1 and C4)

Data: [`arms_r6.json`](arms_r6.json). Generated 2026-10-18. EUR bn, nominal. 2026 = January–August, not annualised.
It refines [`russian_arms_exports.json`](russian_arms_exports.json) ([notes](russian_arms_exports-notes.md)): it **replaces** that
file's `ROW` entry and adds new buyers. It also gives the amount the builder should subtract for Iran.

## C1: the "rest of world" remainder

### What the flow is

Russia earned about USD 15bn a year from arms before the war and 7–9bn after. Round 5 split this by buyer for 19 countries.
It left about **EUR 0.87bn a year before the war and EUR 3.0bn in 2022–Aug 2026** as "rest of world" (ROW), with no
country. This file assigns as much of it as the evidence allows to named buyers. Each entry uses the same fields as
`russian_arms_exports.json`, so the builder can merge them directly.

### Data found

- **SIPRI arms transfers database:** the trade-register backend (atbackend.sipri.org) reset the connection again, so the per-year
  recipient tables could not be downloaded. I used the published fact sheets instead.
- **SIPRI fact sheets** ([2023](https://www.sipri.org/sites/default/files/2024-03/fs_2403_at_2023.pdf),
  [2024](https://www.sipri.org/sites/default/files/2025-03/fs_2503_at_2024.pdf),
  [2025](https://www.sipri.org/sites/default/files/2026-03/fs_2603_at_2025.pdf)). Each gives each importer's world share and its
  main suppliers' shares, so imports from Russia can be computed:

| period | Russia's deliveries by region | what this leaves outside the 19 named buyers |
|---|---|---|
| 2019–23 | Asia 68%, Middle East 13%, Africa 10% | Africa excluding Algeria about 5% |
| 2020–24 | Asia 74%, Africa 12%, Europe 7.4% (Armenia, Belarus, Serbia), Middle East 6.4%, Americas ~0 | Africa excluding Algeria (7.4%) about 4.6%; Mali is 54% of Russia's West African deliveries |
| 2021–25 | India 48%, China 13%, Belarus 13%, Kazakhstan 8.5%, Algeria 5.2%, Iran 3.2% | Africa 4.3% of world imports × Russia 15% → 9.5% of Russian exports; sub-Saharan Africa about 3.9% |

- **Rosoboronexport:** Africa made up more than 30% of its supplies in 2023 ([TASS](https://tass.com/defense/1715497)). Africa is about 30% of its order book in 2026 ([TASS via www1.ru](https://www1.ru/en/news/2026/09/07/17-mlrd-dollarov-i-30-portfelia-rosoboroneksport-raskryl-masstab-oboronnogo-sotrudnicestva-s-afrikoi.html)).
- **Contract and delivery news:**
  - Mali: L-39, Su-25, Mi-24P and Mi-8 in 2022–23 ([Janes](https://www.janes.com/defence-news/air-platforms/latest/russia-delivers-more-aircraft-to-mali), [Al Arabiya](https://english.alarabiya.net/News/world/2022/08/09/Mali-receives-six-more-warplanes-from-Russia)). Convoys of armour and artillery in 2025 ([AP](https://www.ksat.com/news/world/2025/06/10/russia-skirts-western-sanctions-to-ramp-up-its-military-footprint-in-africa/)).
  - Uganda: Mi-28NE in 2022 ([Military Africa](https://military.africa/2022/06/uganda-acquiring-mi-28n-havoc-attack-helicopter-from-russia)), and USD 53m of equipment in October 2025.
  - Ethiopia: six ex-Indian Su-30K delivered from 2024 ([Militaeraktuell](https://militaeraktuell.at/en/ex-indian-su-30k-now-all-in-africa/)).
  - Sudan: arms at preferential prices in exchange for a naval base ([New Arab](https://www.newarab.com/news/sudan-offers-russia-red-sea-base-25-years-military-arms)).
  - Laos: 10 Yak-130 for about USD 300m, and T-72B1 tanks partly paid with mining concessions ([AIN](https://oldain.ainonline.com/aviation-news/defense/2019-01-21/laos-receives-yak-130-combat-jet-trainers), [RFA](https://www.rfa.org/english/news/laos/tanks-12282018162153.html)).
  - Azerbaijan: Russia supplied 60% of its arms in 2011–20, but Israel supplied 69% in 2016–20 ([SIPRI](https://sipri.org/commentary/topical-backgrounder/2021/arms-transfers-conflict-zones-case-nagorno-karabakh)).
  - Latin America: no new Russian sales since 2017 except to Nicaragua ([Univ. of Navarra](https://en.unav.edu/web/global-affairs/larga-sequia-en-la-venta-de-armas-de-rusia-a-latinoamerica)). Venezuela's payments dried up in 2019 ([National Interest](https://nationalinterest.org/node/93906)).
  - Bulgaria: MiG-29 maintenance with RSK MiG, BGN 81.3m over 4 years from 2018 ([BTA](https://bta.bg/en/news/108193-Agreement-on-Maintenance-of-MiG-29-Fighters-Signed-with-Russia-s-RSK-MiG)).

### How the numbers were built

1. **Payments:** a central payment per buyer and year in EUR, from the contract news. Without a contract, it comes from the SIPRI regional share and a typical price, and is marked as an educated guess.
2. **Ceiling:** in every year, the buyers together take less than the old ROW. The rest stays in a smaller ROW.
3. **Ranges:** multipliers on the central value:
   - 0.3–2.5× for guesses;
   - 0.4–2.0× where a contract anchors the value (Mali, Uganda);
   - 0.6–1.5× for Bulgaria (contract value known).
4. **Expected level without the war:** set in USD per year and converted per year with the ECB rates. 2026 is prorated to 8/12. The formula for the change and its range is the same as in `russian_arms_exports.json`: expected − actual, with the range combined in quadrature.
5. **Mali, Burkina Faso and Niger:** they turned to Russia after their coups and the French withdrawal, not because of the war. Their no-war level is therefore set above 2019–21 (Mali: USD 65m a year).
6. **`in_customs` = 0 for all:** no arms show up in these buyers' customs data.

### Results (2022–Aug 2026, EUR bn)

| buyer | paid/yr before the war | paid 2022–26 | change vs expected (range) | direction | cert. |
|---|---|---|---|---|---|
| Azerbaijan | 0.11 | 0.10 | +0.37 (+0.05 to +0.68) | toward Ukraine (paid less) | D |
| Laos | 0.06 | 0.06 | +0.12 (−0.01 to +0.21) | toward Ukraine | D |
| Libya (Haftar) | 0.013 | 0.17 | −0.11 (−0.37 to +0.03) | toward Russia (paid more) | D |
| Mali | 0.027 | 0.37 | −0.09 (−0.49 to +0.20) | toward Russia | D |
| Burkina Faso | 0.005 | 0.15 | −0.09 (−0.32 to +0.04) | toward Russia | D |
| Ethiopia | 0.013 | 0.16 | −0.08 (−0.32 to +0.07) | toward Russia | D |
| Nigeria, Malaysia, Angola, Uganda, Bulgaria, Slovakia | 0.01–0.06 each | 0.01–0.19 | +0.045 to +0.05 each | toward Ukraine | C–D |
| Niger, Sudan, Venezuela | 0.005–0.03 | 0.09–0.17 | −0.04 to −0.01 | toward Russia | D |
| Turkmenistan, Thailand, Mongolia | 0.01–0.02 | 0.005–0.05 | +0.02 to +0.04 | toward Ukraine | D |
| **Remaining ROW (unassigned)** | **0.35** | **1.19** | +0.82 (−1.28 to +1.87) | toward Ukraine | D |

**The unassigned amount shrinks from EUR 3.00bn to 1.19bn paid in 2022–26 (−60%), and from 0.87 to 0.35bn a year before
the war.** Year by year, the old ROW / assigned here / still unassigned are:

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|
| old ROW | 0.76 | 0.88 | 0.97 | 0.86 | 0.46 | 0.46 | 0.71 | 0.52 |
| assigned | 0.58 | 0.51 | 0.45 | 0.44 | 0.34 | 0.40 | 0.39 | 0.25 |
| remaining | 0.18 | 0.36 | 0.52 | 0.41 | 0.13 | 0.06 | 0.32 | 0.27 |

The remaining ROW covers:

- Syria (mostly on credit or unpaid);
- Kyrgyzstan and Tajikistan (mostly aid);
- spares for Greece and Cyprus;
- the Philippines, Sri Lanka and small Gulf buyers;
- Latin American helicopter support;
- Cameroon, Equatorial Guinea, Rwanda and Mozambique;
- the allocation error of the 19 named buyers.

All the effects are small: no new buyer exceeds EUR 0.4bn over five years. Against GDP, the larger ones are Laos (about +0.8% of one year's GDP), Mali (about −0.4%), Burkina Faso (about −0.4%) and Azerbaijan (about +0.5%).

## C4: Iran, the same value counted twice

### The problem

The map counts Iran's weapons sent to Russia, about EUR 4.3bn, as a shift toward Russia ([`flowback2.json`](flowback2.json)
`military_to_russia`). It also counts Iran's payments for Russian arms (Su-35, Yak-130, Mi-28) as money paid to Russia:
EUR 3.3bn paid, or −2.46bn against the expected level. Where Iran paid for Russian jets with drones, missiles or by
offsetting accounts, one value is counted twice.

### Evidence on how they paid

| evidence | points to | source |
|---|---|---|
| Russia flew EUR 140m in cash and captured Western weapons to Tehran for ~160 drones (Aug 2022) | drones paid in cash or kind, not jets | [Sky News via Kyiv Independent](https://kyivindependent.com/sky-news-russia-sent-to-iran-140-million-euros-in-cash-western-weapons-seized-in-ukraine-in-exchange-for-kamikaze-drones/) |
| Leaked Sahara Thunder files: Shahed/Alabuga contract of USD 1.75bn (USD 193k a drone for 6,000); Alabuga sent ~2.07 t of gold (~EUR 0.11bn) in Feb 2023 as part payment | partly paid in gold; most of the payment method unknown | [TWZ](https://twz.com/news-features/what-does-a-shahed-136-really-cost) |
| Reuters (via Iran Times): Fath-360 launcher delivery "may partly be a payment" for Su-35s | barter link | [Iran Times](https://iran-times.com/iran-said-about-to-ship-missile-launchers-to-russia/?amp=1) |
| Analysts in 2023: Iran agreed to supply hundreds of drones to speed up Su-35 deliveries | barter link | reported widely in 2023 |
| Iranian diplomats: Iran made "full payment" for 50 Su-35 under Rouhani (before Aug 2021) | cash, before the war (no overlap) | [Bourse & Bazaar](https://www.bourseandbazaar.org/articles/2023/7/13/iran-paid-for-su-35-jets-but-russia-wont-deliver-them) |
| Leaked Rostec files: 48 Su-35 for ~EUR 6bn, deliveries 16–18 to 46–48 months after an advance payment; first 20 built by July 2026, still in Russia | an advance around 2024–25; method not stated | [Iran International](https://www.iranintl.com/en/202510069695), [Daily Times](https://dailytimes.com.pk/1517162/russia-completes-first-su-35-batch-for-iran/) |
| Iranian MP: missiles and drones bartered for Russian soy and wheat; customs show no soy from Russia | barter against grain, not jets (only partly plausible) | [Iran International](https://www.iranintl.com/en/202409089074) |
| Mir–Shetab card link, SPFS–SEPAM messaging link (2023–24) | civilian payment channels; no evidence of an arms clearing account | same |

No source documents a formal clearing account. The evidence mixes cash and gold (Russia paying for drones), barter
claims (missiles for jets or grain) and a claim that Iran paid for the jets in cash before the war.

### Overlap to subtract (EUR bn)

Overlap in year *y* = barter share × Iran's central payment to Russia in *y*. The barter share is 10% (low), 35% (central) or 70% (high).

| | 2022 | 2023 | 2024 | 2025 | 2026 | total |
|---|---|---|---|---|---|---|
| low | 0.019 | 0.056 | 0.065 | 0.106 | 0.086 | **0.33** |
| central | 0.066 | 0.194 | 0.226 | 0.372 | 0.301 | **1.16** |
| high | 0.133 | 0.389 | 0.453 | 0.743 | 0.602 | **2.32** |

**Check:** the cumulative overlap stays below Iran's cumulative deliveries to Russia less the documented cash and gold
(EUR 0.25bn) in every year. Cumulative deliveries were 1.2bn by end-2022 and 2.8bn by end-2023, against cumulative
payments of 0.19bn and 0.75bn. So the cap never binds.

**Recommendation: subtract from the arms-payments side** (Iran in `russian_arms_exports.json`). Add the overlap to Iran's
`change_vs_expected_ex_customs`: central −2.46 → **−1.30bn**, range of the overlap 0.33–2.32. Keep `military_to_russia`
unchanged. The reasons:

1. The drones and missiles are the physical support that is well documented (Bloomberg valuation).
2. A jet paid in drones is not extra money for Russia.
3. Russia's national arms totals are foreign-currency revenue, so barter is not in them anyway.
4. Iran's arms value is a D-grade contract allocation.

Do **not** move the subtracted amount to other buyers or to ROW.

## Overlaps with other files

- **`russian_arms_exports.json`:** this file replaces its `ROW` entry. None of the 18 new ISO3 codes is there, and the national totals are unchanged.
- **`trade_full.json` / `nonreport.json`:** no arms in these buyers' customs, so `in_customs` = 0. The corrections for Libya, Venezuela and Sudan are oil and goods, not arms.
- **Services:** Bulgaria's and Slovakia's MiG-29 maintenance (EUR 0.006–0.012bn a year) may sit in services imports from Russia. Drop them if the services part already shows that fall.
- **Wagner / Africa Corps fees** (Mali about USD 0.13bn a year, partly in gold) are not arms exports. They are not included here or, as far as checked, anywhere else. This is an open item.
- **Iran:** see C4. The grain-for-missiles claim would be a third copy of the value (Iran's grain imports from Russia in trade). It is not quantified: use it in Iran's high case at most.
- **Venezuela:** its repayments of Russian arms loans are debt service, not counted here.

## What is guessed, and open questions

- All the new buyers except Bulgaria (C) are D: educated guesses built from contract news and regional shares.
- **Rosoboronexport's ">30% Africa in 2023"** against about 19% here (Algeria + Egypt 0.93bn + new African buyers 0.25bn of 6.3bn) suggests that Algeria is too low or that more of ROW is African. Since the remaining 2023–24 ROW is small, a bigger Africa would have to come from the named buyers.
- **Who pays for Libya's kit (Haftar or the UAE).** The value is attributed to Libya here.
- **The Sahel's extra purchases** follow coups, not the war. The builder may show them as labels rather than as a shift toward Russia.
- **The SIPRI per-recipient TIV tables** would tighten everything once the database backend is reachable.
