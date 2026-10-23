# Crypto and payment agents: what can be split by country (round 6, C8)

Data file: `research/2026-10/gaps/payment_channels.json`. Gathered 2026-10-18. Not yet reviewed by a person.
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes. The Bank of Russia balance of payments is the main input.
Units: EUR bn, nominal; 2026 = January–August, not annualised. USD at ECB yearly averages (2021 1.183, 2022 1.053, 2023 1.081, 2024 1.082, 2025 1.13, 2026 1.16).

## 1. The question

Since 2022 a large part of Russia's foreign payments goes around normal banks. It goes through **payment agents** in third countries, through netting schemes, and through **crypto**: the Garantex and Grinex exchanges and the A7A5 rouble stablecoin. Does any of this money move value between Russia and a specific country *without already being in trade data*?

There are two different things:

| Kind | Example | New flow? |
|---|---|---|
| **Route** | A Moscow importer pays a Kyrgyz agent, the agent pays a Chinese factory; the goods are in Chinese and Russian customs data | No. The goods are already counted (`trade_full.json`, `residual.json`) |
| **Margin of the route** | The Kyrgyz agent keeps 2–4% of the payment as its fee | **Yes.** This fee is income for the intermediary. It is outside customs value and outside Russia's services data |
| Capital leaving Russia | Relocants move savings to Armenia; Russians buy USDT | No. This is money *from* Russia, not a payment *to* it and not a margin |
| Untraceable crypto | Chainalysis: Russia received about USD 376bn of crypto (Jul 2024–Jun 2025) | Cannot be attributed to any country |

So the one part this file adds is **payment-agent fees earned by residents of third countries**, toward Russia. It works like the profit on sales to Russia: money earned by helping Russia trade around sanctions.

## 2. Why the fees are not yet on the map

- **Not in customs value.** Russia's Ministry of Finance (letter 01.11.2024 No. 27-01-21/106988) and the Customs Service (letter 20.08.2024) say this: when the importer hires an agent only to arrange payment, the agent's commission is *not* part of customs value (EAEU Customs Code art. 40). Court practice is still mixed ([TKS.RU, 11 Mar 2025](https://www.tks.ru/columns/vasiliev/2025/03/11/0001/)).
- **Not in services data.** Russia's whole import of financial services is only USD 1.1–1.4bn a year in 2023–2025, down from 2.5bn in 2021 ([Bank of Russia BoP](https://www.cbr.ru/vfs/eng/statistics/credit_statistics/bop/bal_of_payments_standart_e.xlsx)). That cannot hold billions of fees.
- `uncovered.json` (`crypto_and_payment_agents`) and `china_military-notes.md` §1d both say explicitly that agent commissions are not counted. This file is where they are counted.

## 3. Data found

| Fact | Value | Source |
|---|---|---|
| Share of cross-border payments via middlemen | under 20% before mid-2024; up to 80% in late 2024 | [Vedomosti via The Bell, 2 Nov 2024](https://en.thebell.io/the-rise-of-russias-foreign-trade-middlemen/) |
| Share of import operations via agents | about 7 in 10 (B1) / up to 85% of FX transfers (banks) | [T-Bank](https://secrets.tbank.ru/razvitie/kak-vesti-mezhdunarodnye-raschety/), [New Retail](https://new-retail.ru/business/ekonomika/transgranichnye_raschety_cherez_agentov_novye_realii_i_skrytye_izderzhki/) |
| Fees | 10–15% peaks in 2023; up to 12% in early 2024; 2–3% average by spring 2025 | [Alta.ru](https://www.alta.ru/external_news/120536/), [Reuters via Harici](https://harici.com.tr/en/new-russia-china-payment-network-cuts-trade-costs/) |
| Fees 2025 | average down from 5% to 2%; 1.5% for large batches | [Vesti](https://www.vesti.ru/article/4567302) |
| Chinese banks | about 80% of Russian payments returned in mid-2024; "China Track" netting run by Russian banks from 2025 | [Novaya Gazeta Europe](https://novayagazeta.eu/articles/2024/07/29/some-80-of-russian-payments-to-china-returned-amid-increasing-western-pressure-en-news), [Moscow Times](https://ru.themoscowtimes.com/2025/04/22/popavshie-pod-sanktsii-rossiiskie-banki-sozdali-sekretnuyu-sistemu-dlya-sdelok-skitaem-a161694) |
| Kyrgyzstan | Russian entities sent USD 2.8bn in 2023 (0.37bn back); fees up to 3%; Keremet Bank under OFAC sanctions (Jan 2025) | [Moscow Times, Aug 2026](https://www.themoscowtimes.com/2026/08/06/kyrgyz-banks-tighten-restrictions-on-russian-transactions-amid-us-sanctions-pressure), [US Treasury](https://home.treasury.gov/news/press-releases/jy2785) |
| A7 / A7A5 | at least USD 179.1bn of A7A5 operations Feb 2025–Jun 2026; A7 subagents: over USD 17bn of dollar operations, accounts at about 435 institutions in 83 countries (KGZ, HKG, IDN, SYC, TUR, ARE named) | [FinCEN via Economist.kg, 11 Oct 2026](https://economist.kg/dengi/2026/10/11/a7a5-operatsii-179-mlrd-fincen/), [Elliptic](https://www.elliptic.co/insights/a7a5-the-ruble-backed-stablecoin-100-billion-in-transactions/) |
| Garantex | over USD 100bn of transfers | [TRM Labs](https://www.trmlabs.com/resources/blog/the-takedown-of-garantex-a-notorious-crypto-exchanges-role-in-illicit-finance) |
| Russia's goods imports (BoP) | USD 301bn (2021), 277 (2022), 303 (2023), 302 (2024), 306 (2025), 160 (H1 2026) | Bank of Russia |

**No source gives agent or crypto volumes by counterparty country.** A7, Old Vector, Grinex and Garantex are controlled from Russia (PSB, Ilan Shor), so their own commissions stay in Russia.

## 4. How the numbers were built

1. **Gross agent fees** = (Russia's goods imports − hub re-exports already in `reexports.json`) × share paid through third-country agents × average fee. Exports are added on top, smaller: 10–20% of Russian exports at a 0.3–1.5% fee.
   - Share via agents, central: 3% (2021), 20% (2022), 30% (2023), 55% (2024), 55% (2025), 50% (2026).
   - Fee, central: 2%, 3%, 3.5%, 4%, 2.5%, 2%.
2. **Where the agent sits**: an educated split in two periods, because the routes changed after the US secondary-sanctions order of December 2023.
   - 2022–23: more Kazakhstan, Armenia, UAE and Türkiye (EU goods).
   - 2024–26: more China, Hong Kong and Kyrgyzstan.
3. **Share kept by residents**: many agents are Russian-owned (A7 network, VTB's Shanghai netting, Russian-owned shells in Hong Kong and Dubai). Their fees stay with Russia and count for no country. Residents keep 35% (Hong Kong) to 60% (Kazakhstan, Türkiye, Uzbekistan), each with a ±20-point range. About 10% of agent volume is left unallocated (Seychelles fronts and others).
4. **Change against pre-war**: the 2021 level is subtracted. It is small, because grey-import agents already existed. 2026 uses 8/12 of it.
5. **Ranges**: each factor's range is treated as an independent log-normal 90% band and combined. The 5-year sums add the yearly lows and highs, which is conservative.

**Gross fees, all agents (EUR bn, central (low–high))**: 2022 1.9 (0.9–3.8); 2023 3.2 (1.5–6.1); 2024 6.5 (3.6–11.9); 2025 4.1 (2.3–7.0); 2026 Jan–Aug 2.1 (1.2–3.9). About 40% of this is counted for named countries. The rest stays with Russian-owned structures or is unallocated.

## 5. Results: margin earned by country (toward Russia, EUR bn)

| ISO3 | cert | 2022 | 2023 | 2024 | 2025 | 2026 J–A | 2022–26 central (low–high) |
|---|---|---|---|---|---|---|---|
| CHN | D | 0.12 | 0.21 | 0.69 | 0.43 | 0.22 | 1.67 (0.57–3.86) |
| KAZ | D | 0.15 | 0.26 | 0.34 | 0.21 | 0.11 | 1.05 (0.31–2.51) |
| ARE | D | 0.13 | 0.22 | 0.35 | 0.22 | 0.11 | 1.03 (0.30–2.49) |
| HKG | D | 0.07 | 0.13 | 0.36 | 0.22 | 0.12 | 0.90 (0.23–2.25) |
| TUR | D | 0.13 | 0.22 | 0.26 | 0.16 | 0.08 | 0.85 (0.24–2.08) |
| KGZ | C | 0.07 | 0.12 | 0.25 | 0.16 | 0.08 | 0.68 (0.17–1.71) |
| ARM | D | 0.07 | 0.12 | 0.14 | 0.08 | 0.04 | 0.45 (0.11–1.10) |
| UZB | D | 0.03 | 0.06 | 0.11 | 0.07 | 0.04 | 0.31 (0.07–0.83) |
| GEO | D | 0.02 | 0.03 | 0.03 | 0.02 | 0.01 | 0.11 (0.02–0.36) |
| IDN, THA, SRB | D | 0 | 0 | 0.03 | 0.02 | 0.01 | 0.06 each (0.02–0.2) |
| **Sum** | | 0.77 | 1.36 | 2.62 | 1.64 | 0.84 | **7.2 (2.1–17.8)** |

**Size relative to GDP.** These values are tiny for China and the UAE. For Kyrgyzstan (about 1.5% of GDP in 2024) and Armenia they matter.

**Cross-checks**
- **Kyrgyzstan:** bank net profit was KGS 24.2bn in 2023 and 31.1bn in 2024 ([NBKR via Economist.kg](https://economist.kg/all/2025/02/25/chistaia-pribyl-bankov-kyrghyzstana-v-2024-ghodu-prievysila-31-mlrd-somov/)), several times the pre-war level. The excess is roughly USD 0.2–0.3bn a year, the same order as the 0.25bn here.
- **Armenia:** bank profit tripled to AMD 256bn (about USD 640m) in 2022 ([Eurasianet](https://eurasianet.org/armenian-banks-record-mega-profits-but-the-economy-doesnt-feel-it)). Most of it came from relocants' money and FX conversion, which is not counted, so the agent margin here is much smaller.

## 6. Educated guesses

- The **country split** of agent volumes: no source has it.
- The **share kept by residents**.
- The **2022 and 2026 shares** paid via agents.

The fee levels and the 2024–25 shares rest on press reports that quote market participants. That is the reason for certainty D, and C for Kyrgyzstan, where bank profits give a check.

## 7. Overlaps (and how they are avoided)

| Existing part | Relation | Handling |
|---|---|---|
| `reexports.json` hub margin (5–20%, includes a sanctions-risk premium) | A hub trader that resells to Russia earns that margin | Re-export values (EUR 7–11bn a year) are removed from the fee base |
| `residual.json` (goods Russia records, partners do not) | Those goods are also paid through agents | Residual counts the value of the goods, not the fees, so there is no overlap |
| `uncovered.json` services | Russia's financial-services imports are only USD 1.1–1.4bn, mostly to Western centres | Overlap of at most about EUR 0.1bn a year; ignored |
| `uncovered.json` hidden_channels, `kgz_gold.json` | Gold paid to Russia | No gold in this file |
| Sellers' 20% profit on exports to Russia | The fee is paid by the Russian buyer to a separate intermediary, outside the invoice | Additional to it. Where seller and agent are in the same country (China) and margin stacking is a worry, use the low value |
| `china_military.json` §1d | Says commissions are not counted there | Counted here instead |

**Builder:** add `countries[ISO3].to_rus` directly as an extra part toward Russia. It is already profit: **do not multiply by 0.2.** It is already a change against 2021. The 2021-inclusive levels are in `margin_level_incl_2021_baseline` for reference.

## 8. Recorded but not counted

- **Payment volumes** through agents: a route for recorded trade.
- **Crypto volumes** (Garantex, Grinex, A7A5, Chainalysis totals): no country split. The bulk is domestic, round-tripping, or settlement of recorded trade. The operators are Russian-controlled.
- **The 2022 remittance surge**:
  - Armenia: USD 3.5bn in 2022, against 0.87bn in 2021.
  - Georgia: about USD 2bn, against 0.41bn.
  - Kazakhstan: about 7 times the 2021 level.
  - This is money leaving Russia with relocants and capital flight. It is not a payment to Russia.
- **BoP "other accounts receivable"** (Russia's assets): USD 79.7bn (2022), 27.2 (2023), 46.4 (2024), 19.8 (2025), 24.6 (H1 2026), against 19.5bn in 2021. These are advances and export receipts held abroad, often stuck in agent chains. They are Russia's claims, not payments to Russia by any country.
- **Crypto mining sales, ransomware and darknet proceeds:**
  - These are money reaching Russia outside trade data.
  - No country chose them: the buyers are anonymous, and the victims are not making a choice.
  - All of them existed before the war.
- **Oil paid in USDT or bitcoin:** the oil is in customs data.

## 9. What remains unquantifiable

- The true split of agent volumes by country, and who owns the agents.
- Whether "sanctions premiums" sit inside customs prices, where they are already counted, or in side payments.
- Cash couriers and hawala-style netting with no records.
- How much of the A7A5 and Grinex flow pays for goods, and how much is capital flight or sanctions evasion for services such as software, freight or insurance. Service purchases paid via crypto would be a new flow, but no source sizes them.
- The joint soft bound for hidden net flows is still Bank of Russia net errors and omissions (EUR 6–12bn a year, outflow), in `uncovered.json` `upper_bound`.

## 10. Open questions

- FinCEN's A7 Network findings (proposed special measure, comments until 4 Nov 2026) may later give volumes by country of subagent.
- National bank statistics on banks' fee and commission income (Kyrgyzstan, Armenia, Kazakhstan, Georgia) could replace the guessed retained shares.
