# Russian-owned non-oil companies abroad: profits sent home (round 10)

Output: [`russian_owned_r10.json`](russian_owned_r10.json), generated 2026-10-18.

This fills a gap in roadmap item 24. [`company_flows.json`](company_flows.json) counts profits sent to Russia by oil, gas, bank and telecom firms abroad. This file adds metals, mining, fertiliser, diamond and uranium firms.

- Units: EUR bn, nominal, low / central / high (~90% range).
- 2026 means January–August. It is not annualised.
- The host is the country where the plant is. Holding companies in Cyprus, Switzerland, the UK, the Netherlands or Jersey are not hosts.
- `profits_change_vs_prewar` uses the same method as company_flows:
  - central = paid that year minus the 2019–2021 average (times 8/12 for 2026);
  - low and high = central ± 0.9 × the larger of the change and the pre-war average.
  - Where the pre-war average is 0, low and high come from the paid range (as company_flows does for India).
- USD per EUR: 1.12 (2019), 1.142, 1.183, 1.053, 1.081, 1.082, 1.13, 1.16 (2026). SEK per EUR: 11.47 (2023), 11.43 (2024).

## The short answer
Very little money goes home from these plants.

- Most are captive suppliers. They sell to Rusal, NLMK or EuroChem trading arms at transfer prices. Their profit shows up in the parent's export revenue, not as dividends.
- Many lose money (NLMK's Belgian plants, Aughinish in 2021–2023).
- Hosts froze or blocked the rest: Lithuania (Lifosa), Angola (Catoca), the UK (Evraz), Poland (Grupa Azoty stake).
- The one sizeable flow is uranium dividends from Kazakhstan (Rosatom's Uranium One). That number is a guess.

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026* |
|---|---|---|---|---|---|---|---|---|
| paid to Russian parents, central | 0.16 | 0.13 | 0.20 | 0.11 | 0.21 | 0.19 | 0.15 | 0.08 |
| change vs pre-war, central | | | 0 | −0.05 | +0.05 | +0.03 | −0.01 | −0.03 |

\* January–August.

## Already counted elsewhere, so left out
- **Finland, Nornickel Harjavalta:** already in company_flows FIN.
- **USA, NLMK USA and TMK IPSCO:** already in company_flows USA.

## Ireland: Aughinish Alumina (Rusal)
**What it is.** Aughinish is an alumina refinery in Co. Limerick, about 1.9 Mt a year, with 459 staff in 2023.
- The operating company is Limerick Alumina Refining Ltd.
- It is owned by UC Rusal, whose controlling shareholder is En+ (Deripaska).
- It is not sanctioned by the EU, UK or US. The US sanctioned Rusal in April 2018 and lifted it in January 2019.
- In 2026, some EU states raised listing Aughinish, or banning alumina exports, for the 21st package. Ireland resists.

**Accounts, pre-tax.** These come from Irish Times, RTE and Irish Examiner reports of the CRO filings.

| year | pre-tax result | revenue | other facts |
|---|---|---|---|
| 2018 | +$40.9m | $757m | |
| 2019 | +$54.6m | $691m | owed Rusal Trading $126m |
| 2021 | loss | $785m | figure not confirmed |
| 2022 | loss | $853m | figure not confirmed |
| 2023 | −$113.6m | $583m | accumulated losses $359.7m |
| 2024 | +$119.4m | $875m | accumulated losses $240.2m |

- The Irish Times says no dividend was paid to Rusal for 2024.
- With accumulated losses this large, an Irish company has no profits it may distribute. So a dividend was not possible in 2021–2025 and is unlikely in 2026.
- The plant relies on a letter of support from Rusal.
- **Paid to Russia:** 0 in every year. The high case allows a little interest or fees, and an unseen dividend in 2019.

**Where the profit really goes.** Aughinish sells its alumina to Rusal trading companies at prices that leave it close to break-even. The margin sits in Rusal's trading arm. That is Russian export revenue, so it is not counted here.

**Sales to Russia.** These are alumina exports to Russian smelters (Sayanogorsk, Krasnoyarsk) in Eurostat customs data (IE → RU, HS 281820). They are already counted as trade; they are listed here only so they can be checked.

| | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026* |
|---|---|---|---|---|---|---|---|---|
| EUR bn | 0.113 | 0.090 | 0.156 | 0.231 | 0.194 | 0.347 | 0.316 | 0.164 |
| kt | 377 | 394 | 511 | 631 | 630 | 827 | 776 | 568 |

Exports to Russia have more than doubled since before the war. The rest of the output goes mainly to Aluminium Dunkerque (France) and KUBAL (Sweden).

## Sweden: KUBAL (Rusal)
KUBAL is an aluminium smelter in Sundsvall, about 135 kt a year. It is owned through Libertatum Materials (Cyprus).

| year | pre-tax result | equity | paid out |
|---|---|---|---|
| 2022 | EUR 15.5m | EUR 93.7m | not found |
| 2023 | EUR 9.5m | EUR 30.1m | about SEK 800m to the Cyprus parent |
| 2024 | EUR 10.3m | EUR 24.2m | SEK 151m dividend |

- The 2023 payment is EUR 0.07bn. Equity fell even though the company made a profit, so this was a distribution and not just a loan. It counts for Sweden.
- 2024 is EUR 0.013bn.
- In March 2026 police raided the company over suspected sanctions breaches dating from 2023. Banks stopped its payments and the tax agency froze SEK 56m. So 2026 is 0.
- 2019–2022 and 2025 are small guesses.
- Certainty: C.

## Belgium, Denmark, Italy, France: NLMK Belgium Holdings and EuroChem Antwerp
| host | company | paid to Russia |
|---|---|---|
| BEL | NBH: La Louvière, Clabecq (NLMK 49%, Wallonia's SOGEPA 49%) | 0. Loss-making; NLMK put in more than EUR 0.5bn of capital |
| BEL | EuroChem Antwerpen | 0 in 2023–2025: equity grew by exactly the profit each year. Pre-war: small guess |
| DNK | NLMK DanSteel (part of NBH) | 0 |
| ITA | NLMK Verona (NBH), Eurallumina (Rusal, idle since 2009), Evraz Palini e Bertoli | 0 |
| FRA | NLMK Strip (NBH) | 0 |

EuroChem Antwerpen results: +2.7m (2022), −15.1m (2023), +11.1m (2024), +47.1m (2025). Its owner, the Melnichenko family, is under EU sanctions, so any dividend would be frozen.

## Lithuania: Lifosa (EuroChem)
- **Profits:** net EUR 16.8m (2020), 120.7m (2021). Pre-tax 37.7m (2022), −64.2m (2023), 29.9m (2024), 58.4m (2025).
- **Past dividends:** it paid EUR 165m to EuroChem in 2016.
- **2022 onwards:** its accounts were frozen in March 2022. A state-appointed administrator took over in July 2024. So 2022–2026 is 0, and that is firm.
- **2019–2021:** guessed at 0.02–0.03 a year.

## Poland: Grupa Azoty stake (Acron)
- Acron holds 19.8% through Norica Holding. This is a minority stake.
- No dividend was found in 2019–2021. The shares have been frozen since 2022.
- Paid to Russia: 0.

## Angola: Catoca (Alrosa, 41%)
- **Blocked dividends:** USD 100m (FY2021), 85m (FY2022) and 134.4m (FY2023) could not leave Angola.
- **Exit:** the stake went to Oman's Taadeen in May 2025.
- **2022–2024:** 0.
- **2025:** central 0. The high case is EUR 0.29bn, in case the blocked dividends were settled inside the exit deal. That is not known.
- **Pre-war:** guessed at about 0.03–0.04 a year.
- The sale price is capital, so it is not counted.

## Kazakhstan: Uranium One (Rosatom)
- **What it is:** joint ventures with Kazatomprom (Akdala, South Inkai, Karatau, Akbastau, Zarechnoye, Khorasan, Budenovskoye).
- **Not double counted:** company_flows KAZ does not include it.
- **Pre-war:** Uranium One made about USD 120m a year in 2021.
- **Paid to Russia:** guessed at 0.07–0.08 a year before the war, rising to 0.18 in 2024 with uranium prices.
- **Falling again:** Zarechnoye and Khorasan stakes were sold to Chinese buyers, and Kazakhstan raised its extraction tax.
- Certainty: D. This is the biggest item and the least certain.

## USA and Canada: Evraz North America
- Evraz plc is UK-listed and Russian-controlled (Abramovich and partners).
- The UK sanctioned it in May 2022. Evraz NA was sold to Atlas Holdings in August 2025. The sale money is held back from Evraz plc.
- Pre-war dividends are small guesses, split 70% USA and 30% Canada. 2023–2026 is 0.

## Captive Rusal plants: Guinea, Jamaica, Australia
These plants pay no dividends, so paid to Russia is about 0. They ship raw material to Rusal. The sales to Russia below are **rough estimates**, not customs data:

| host | plant | sales to Russia, central, EUR bn |
|---|---|---|
| GIN | CBK Kindia, Dian-Dian, Friguia | 0.18–0.33 a year |
| JAM | Windalco (Ewarton), 396 kt alumina in 2025 | 0.04–0.10 a year; Rusal is now looking for a buyer |
| AUS | QAL 20% (tolling) | about 0.2 a year until Australia's ban in March 2022, then 0 |

## Checked and found nil or not material
- **Rusal:**
  - Alpart was sold to JISCO in 2016.
  - Aluminium Rheinfelden is not owned by Rusal.
  - Others: Guyana BCGI (closed), ALSCON Nigeria (idle), Armenal Armenia (small), Nikolaev Ukraine (seized).
- **Nornickel:** Nkomati (sold in 2021, now on care and maintenance) and Tati (closed).
- **EuroChem:**
  - Tarragona and Germany are trading or distribution arms, which are excluded like Litasco.
  - Brazil is still in its investment phase.
  - No K+S stake was found.
- **Others:** PhosAgro, Uralkali, Severstal, Metalloinvest, Sibur and Mechel have only trading arms abroad, or nothing. TMK's Romanian plants: no dividend was found. MMK Metalurji (Turkey) makes losses.

## What is estimated
**From filings or reporting:**
- Aughinish: no dividend, and its accumulated losses.
- KUBAL's 2023–2024 payments.
- EuroChem Antwerpen's equity, showing no dividend.
- Lifosa's freeze.
- Catoca's blocked dividends.
- Evraz sanctions and sale.
- Irish alumina exports, from Eurostat.

**Guesses:**
- All pre-war dividends except Lifosa's history.
- Uranium One's dividends in every year.
- KUBAL in 2019–2022 and 2025.
- Sales to Russia from Guinea, Jamaica and Australia.

## Overlaps
- Only the companies listed here are new. Harjavalta, NLMK USA and TMK IPSCO are already in company_flows.
- Sales to Russia, and purchases from Russia (slabs for NBH, ammonia for Antwerp, nickel matte for Harjavalta), are customs trade that is already counted. **Do not add them.**
- Sale prices (Evraz NA, Catoca, Uranium One stakes) are capital, not income.
