# Concept

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Status: **design only**, nothing is implemented yet.

Goal: per country, see how much money flows **to Ukraine** (aid, loans, weapons)
and how much flows **to Russia** (payments for oil, gas, coal, other trade, taxes),
over time, in one currency. Then show the balance, for example
"Country X gave Ukraine €A but paid Russia €B for fossil fuels since 24 Feb 2022".

---

## 1. Core idea: one ledger of flows

Every piece of money is one row, a directed edge between two actors:

```
source ──(amount, type, date, status)──▶ target
```

| field            | example                                      | why                                                  |
|------------------|----------------------------------------------|------------------------------------------------------|
| `source`         | `DEU`, `EU_INSTITUTIONS`, `IMF`               | ISO-3 country or institution                         |
| `target`         | `UKR`, `RUS`                                  | who receives the money                               |
| `flow_type`      | one of the categories in 4e, plus `asset_proceeds` | lets us split totals |
| `status`         | pledged → allocated → disbursed (aid); estimated / reported (trade) | promises are not deliveries          |
| `amount_original`| 500_000_000                                   | as reported                                          |
| `currency`       | USD                                           | converted later                                      |
| `date`           | 2024-06-01 (or a month or quarter)             | for time series                                      |
| `instrument`     | grant / loan / guarantee / in-kind / payment  | a loan is not a gift                                 |
| `data_source`    | `kiel`, `crea`, `comtrade`, …                 | traceability                                         |
| `certainty`      | A / B / C / D (see 4c), plus low/central/high range | estimates are allowed but always labelled         |
| `channel_via`    | `TUR`, `ARE`, `KAZ` (optional)                | for re-exports and sanctions evasion                 |
| `source_type`    | state / institution / company / private       | lets companies be counted next to countries          |
| `company_id`     | `LEI:529900…` or own id (optional)            | which company paid or delivered                      |
| `home_country`   | `DEU` (optional)                              | where the company's parent is based, for roll-ups    |
| `paid_by`        | `USA` (optional)                              | who paid for it, when a company only delivers it     |
| `loan_terms_id`  | link to a `loan_terms` row (optional)         | interest, maturity, grace period, for loan valuation |

All analysis happens on this one table. A new data source only needs an
importer that writes rows in this shape.

---

## 2. Data sources

### Money going to Ukraine
| source | covers | notes |
|--------|--------|-------|
| **Kiel Institute, Ukraine Support Tracker** | government military, financial and humanitarian aid per donor, committed vs allocated | the reference dataset, updated about every quarter, downloadable xlsx |
| EU Commission (Ukraine Facility, MFA+, EPF) | EU-level money | must not be double counted against member states |
| IMF / World Bank / EIB project databases | loans and programmes | multilateral, so map back to shareholders only if wanted |
| G7 ERA loans / Euroclear windfall profits | Russian frozen-asset proceeds sent to Ukraine | a special case: money taken *from* Russia and sent *to* Ukraine |
| NATO PURL and national procurement announcements | weapons bought for Ukraine | often vague; low confidence |
| United24 and large NGOs (optional) | private donations | separate layer, not government money |

### Money going to Russia
| source | covers | notes |
|--------|--------|-------|
| **CREA, Russia Fossil Tracker** | daily estimated fossil fuel export revenue per importing country | the main source for "who pays Russia" |
| UN Comtrade / Eurostat Comext | all goods imported from Russia per country and HS code | monthly; national reporting can lag |
| **Mirror trade** (partner-reported exports to Russia) | Russia stopped publishing detailed trade, so we use what partners report | standard workaround |
| KSE Institute (oil revenue, price-cap, shadow fleet) | Urals discount, tax take | used to estimate how much reaches the **Russian state** |
| Russian Ministry of Finance (oil and gas budget revenue) | top-down check on the total | for checking only, not per country |
| Yale CELI / KSE "Leave Russia" | foreign companies still operating in Russia and the profit tax they pay | adds a small "tax" flow per home country |

### Company level (both directions)
| source | covers | notes |
|--------|--------|-------|
| **KSE Institute "Leave Russia" + Russian company filings** | revenue, profit and **taxes paid in Russia** by foreign-owned subsidiaries | the best per-company number for "money to the Russian state" |
| Yale CELI list | which companies stayed, scaled back or left Russia | status only, no amounts |
| Annual reports, SEC / ESMA filings | Russia revenue segments, write-offs, Ukraine contracts | for the large companies (banks, consumer goods, energy) |
| War & Sanctions database (Ukrainian intelligence, GUR), RUSI / KSE component studies | Western-brand parts found in Russian weapons | supplied mostly through third countries, so low confidence |
| Shipping and insurance data (CREA, KSE shadow-fleet tracking) | tankers, flags, insurers carrying Russian oil | services sold to Russia, not goods |
| Defence contract announcements (DoD contracts, Rheinmetall, BAE, …) | weapons and ammunition made for Ukraine | usually **paid for by a government**, see below |
| Company donation pages, Kiel private-sector notes | companies' own aid (in-kind tech, cash) | e.g. satellite internet, cloud, medical supplies |

### Supporting data
- **ECB / FRED exchange rates** for converting everything to EUR (monthly average for the flow's date).
- **Eurostat / World Bank deflators** for constant 2022 prices.
- **World Bank GDP** to show flows as a percentage of GDP (fairer between big and small countries).

---

## 3. Pipeline

```
 ┌──────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
 │ Importers│──▶│ Normalise    │──▶│ De-duplicate │──▶│ Enrich      │──▶│ Analyse and  │
 │ per src  │   │ currency,    │   │ EU vs member │   │ state-take, │   │ report       │
 │          │   │ dates, ISO   │   │ states, ERA  │   │ re-exports  │   │              │
 └──────────┘   └──────────────┘   └──────────────┘   └─────────────┘   └──────────────┘
      raw files kept           SQLite ledger (money_flow.db)              Telegram / web
```

1. **Import**: one importer per source downloads the file, saves a raw copy with the date, and turns it into ledger rows.
2. **Normalise**: convert to EUR at the rate for the flow's date, convert to constant prices, map country names to ISO-3, split quarterly or annual figures into months when needed.
3. **De-duplicate**:
   - EU institutions get their own `source = EU_INSTITUTIONS`, never also counted under member states (optional "attribute by budget share" view).
   - ERA / frozen-asset loans are tagged `asset_proceeds` so they do not inflate any one donor's own contribution.
   - Kiel and national announcements overlap, so keep one source per flow (a priority order per field).
4. **Enrich**:
   - **State take**: a payment for Russian oil is not all Russian state money. Multiply by an estimated tax share (mineral extraction tax plus export duty, which depends on the Urals price, month by month) to get "estimated money to the Kremlin budget" next to "gross money to Russia".
   - **Re-export and evasion layer**: compare a country's exports of high-priority dual-use goods (the EU/US "Common High Priority" HS list) to Russia's neighbours before and after 2022. A sudden jump (for example EU → Kyrgyzstan → Russia) gets marked as an *indirect* flow with `channel_via`, and low confidence.
5. **Analyse**: see below.

---

## 4. What it calculates

For each country, for any time period:

| metric | meaning |
|--------|---------|
| `to_ukraine_total` | allocated aid, split military / financial / humanitarian, grant vs loan |
| `to_ukraine_grant_equivalent` | loans counted at their gift part only (a 0% 30-year loan ≠ a free gift) |
| `to_russia_gross` | all payments for Russian goods (fossil fuels plus everything else) |
| `to_russia_state_take` | the part estimated to end up in the Russian state budget |
| `to_russia_indirect` | estimated flows through other countries (low confidence) |
| **`balance_ratio`** | `to_ukraine_total / to_russia_gross`; above 1 means the country sends more to Ukraine than to Russia |
| `% of GDP` versions | to compare Estonia with the US fairly |
| `pledge_gap` | pledged minus actually allocated or disbursed |

Global views:
- **Sankey diagram**: countries on the left, Ukraine and Russia on the right, line width = euros.
- **Time series**: monthly "money to Russia vs money to Ukraine" per country and for the world.
- **Leaderboards**: biggest supporters of Ukraine, biggest payers to Russia, biggest change since 2022.
- **Alerts**: a sudden jump in a country's imports from Russia, or a big new aid package.

---

## 4a. Company layer

Companies are a separate layer. Paying for something and delivering it are kept apart:

- **Paid by and delivered by.** When the US pays a company to build artillery shells for Ukraine,
  the row has `paid_by = USA` and `company_id = <the company>`. The money counts once, for the US.
  The company shows up as *who delivered it*, never as a second donor. The same applies to a
  government-funded satellite internet subscription.
- **Company's own money.** Free products, services or cash given by the company itself count as `source_type = company`.
- **Company money to Russia** comes in three kinds, kept apart:
  1. **Taxes paid in Russia** by its Russian subsidiary (profit tax and others): goes directly to the state.
  2. **Business in Russia**: revenue, wages and suppliers there. Large, but mostly not state money.
  3. **Goods and services sold to Russia**, directly or through third countries (components,
     shipping, insurance). Indirect, low confidence.
- **Roll-ups.** Every company has a `home_country`. A country page can then show
  "German companies paid €X in Russian taxes in 2024" next to the German state's aid to Ukraine.
  This is shown as a separate line and never added into the state's numbers.

Company metrics: `company_tax_to_russia`, `company_revenue_in_russia`, `company_aid_to_ukraine`,
`company_contracts_for_ukraine` (paid by states) and the exit status (stayed / scaling back / left).

---

## 4b. Loans are not gifts: the cost of a loan

A €1bn loan and a €1bn grant both move €1bn today, but a loan comes back with interest.
So for every loan the system computes the **grant equivalent**: how much of it is really a gift.

Stored per loan in `loan_terms`: interest rate, maturity, grace period, repayment schedule,
currency, guarantor, and **how it is repaid** (by Ukraine, or from frozen Russian asset profits as with the ERA loans).

### The calculation
```
present_value_of_repayments = Σ repayment_t / (1 + discount_rate)^t
grant_equivalent            = face_value − present_value_of_repayments × (1 − default_probability)
grant_element_%             = grant_equivalent / face_value
```
This is the OECD DAC grant-equivalent method, with a default term added.

The main choice is the **discount rate**. It answers different questions, so both are shown:

| view | discount rate | question it answers |
|------|---------------|---------------------|
| **Cost to lender** (opportunity cost) | lender's own borrowing cost (e.g. German or US 10y bond yield) | what does it really cost the lender to lend instead of keeping the money? |
| **Value to Ukraine** | Ukraine's own market borrowing rate | how much does Ukraine save compared with borrowing on the market? |

### Worked example
€1bn loan, 10 years, 1% interest, repaid in one go at the end:

| | discount rate | value of repayments today | grant equivalent |
|---|---|---|---|
| Cost to lender | 3% | €829m | **€171m (17%)** |
| Cost to lender, 20% chance of default (simplified: nothing comes back on default) | 3% | €664m | **€336m (34%)** |
| Value to Ukraine | 10% | €447m | **€553m (55%)** |

So that "€1bn" is between about €0.17bn and €0.55bn of real support, depending on the view.
The dashboard shows the face value **and** the grant equivalent, and leaderboards rank by grant equivalent by default.

### Special cases
- **Guarantees**: no money moves until a default. The cost is `exposure × default_probability`, booked as a contingent cost.
- **Loans repaid from Russian frozen assets (ERA loans)**: the lender carries almost no cost, so the grant
  equivalent to the lender is about 0, but the value to Ukraine is close to 100%. Tagged `asset_proceeds`.
- **Restructuring or write-offs later**: a new row that raises the grant equivalent at the date it happens.
- **Weapons from old stock**: a similar "real cost" question. Store both book value and replacement cost.
- **Loans to Russia** (e.g. from China, or old loans still being paid): the same calculation applies in the other direction.

---

## 4c. Certainty and estimated layers

Purpose reminder: a person opens **their own country's page** and sees how much it supports
Ukraine and how much money or other support reaches Russia from it. So estimates are allowed,
but every number has a certainty level, and the page always shows it.

### Certainty levels
| level | meaning | example |
|-------|---------|---------|
| **A: reported** | official, itemised figure | Kiel allocated aid, budget line, company tax filing |
| **B: measured estimate** | calculated from solid data with a known method | CREA fossil revenue, grant equivalent of a loan |
| **C: modelled estimate** | built from several assumptions, range shown | laundered oil, excess trade above the pre-war trend |
| **D: rough indication** | based on reports, leaks or intelligence, wide range | North Korean shells, hidden payment channels |

Levels C and D are always stored as a **range (low / central / high)** with the assumptions written out.
Headline totals show A+B; the country page shows A+B+C+D as a stacked bar with the uncertain part shaded.

### Non-money military support (to either side)
Weapons, ammunition, soldiers, drones and know-how given without money moving, or through barter.
- Value = quantity × estimated unit price (e.g. shells at the replacement price NATO pays),
  troops at an estimated cost per soldier-year, technology transfer as a lump-sum range.
- Sources: government and intelligence statements, ISW, RUSI, CSIS, Oryx (counted equipment), investigative journalism.
- Mostly level D, sometimes C. Applies in both directions (e.g. North Korea/Iran → Russia, undisclosed deliveries → Ukraine).

### Hidden payment channels
Estimate, per country, money reaching Russia outside official statistics:
- **Mirror-trade gaps:** what country X reports exporting to Russia and its neighbours vs what arrives.
- **Bank of Russia balance of payments:** "errors and omissions" and unexplained flows, as a top-down cap.
- **Gold and crypto:** published flows (e.g. gold exports to the UAE, blockchain-analysis reports), assigned to countries where possible.
- Level D, always shown as a range.

### Excess trade instead of all trade (China, Turkey, Central Asia, …)
Ordinary trade that didn't change after the invasion is not counted as support.
Only the **excess above the pre-war trend** is counted:
```
excess = actual_2022+  −  expected_from_trend(2017–2021)
```
- Calculated per HS code group, with the dual-use "Common High Priority" goods shown separately.
- Includes re-routing: country X → Kyrgyzstan → Russia shows up as excess exports to Kyrgyzstan.
- The same method applies to every country, not just China. Level C.

### Laundered oil (the refining loophole)
Russian crude refined in India, Turkey and elsewhere, with the fuel sold to third countries:
```
russian_share_in_product = refinery's share of Russian crude input (CREA, Kpler-type data)
laundered_value          = product imports from that refinery × russian_share_in_product
```
Assigned to the country that **buys the fuel**. Level C.

---

## 4d. Change since before the war and the cost of switching

Ordinary trade that existed before the war is not "support" in either direction. What tells the story is
**what changed**, and **what that change cost**. The same rule applies to Ukraine and Russia.

Baseline = the 2017–2021 trend, per country and per HS code group.

| view | Russia | Ukraine |
|------|--------|---------|
| **Still flowing** (gross, per year) | "Your country still pays Russia €X per year" | trade with Ukraine, shown as context only |
| **Change vs baseline** | cut in imports from Russia (money withheld), or excess above trend | trade above trend (e.g. after EU tariff waivers) |
| **Cost of the change** (opportunity cost) | **switching cost**, see below | **trade concessions**: customs revenue given up by waiving tariffs |

### Switching cost (cost of sanctions)
What it costs a country to *not* buy from or sell to Russia:
```
energy_switching_cost = Σ (price_of_alternative − price_russian_supply_would_have_had) × volume_replaced
lost_export_cost      = (expected exports to Russia from trend − actual exports) × profit margin share
```
- Energy: e.g. LNG instead of pipeline gas, non-Russian diesel. Prices from TTF / Henry Hub / Brent vs Urals and pipeline contract estimates.
- Lost exports: sanctioned goods and companies that left Russia. Only the margin counts, since the goods can partly be sold elsewhere.
- Level C, always a range. Counted as support for Ukraine, in its own category (see 4e).

Note: Ukraine's own trade with other countries partly fell because of the war (blocked ports, occupied land),
not because of anyone's choice. So a fall in trade with Ukraine is **not** counted against a country.

---

## 4d-2. Money flowing back from Ukraine

Aid does not all leave the donor's economy. Ukraine spends much of it, or the donor spends it on Ukraine's behalf,
with the donor's own companies. To see how far a country really goes out of its way, this **flowback** is measured
with the same rule as everything else: only what is **above the 2021 level** counts.

| part | what it is | how we measure it | certainty |
|------|-----------|-------------------|-----------|
| **Own industry** | a donor's aid spent with its own defence industry: contracts for Ukraine, refilling stock it donated | contract announcements (e.g. US DoD, national procurement), Kiel's split of stock vs procurement | C |
| **Other countries' aid spent here** | aid from country A spent in country B, e.g. European money buying US weapons through NATO PURL, the Czech ammunition initiative | PURL and initiative announcements | B |
| **Extra sales to Ukraine** | Ukraine's imports from the country **above** the 2021 level, paid with its own or aid money | Comtrade / Eurostat, partner-reported exports to Ukraine | B |

```
flowback       = own industry + other countries' aid spent here + (sales to Ukraine − 2021 level, if positive)
net shift      = aid + extra purchases from Ukraine + less paid to Russia − flowback
net cost       = cost carried − flowback
```

- Flowback is **revenue** for companies in that country, not profit; the goods still cost money to make.
  It is shown separately, and the website has a switch to subtract it or not.
- Old stock donated and later refilled: the aid is the value of the stock (as Kiel records it); the money spent refilling it at home is flowback, never extra aid.
- Some donors fund production **inside Ukraine** (e.g. the "Danish model"), which has almost no flowback.
- A country that gave nothing but sells more to Ukraine (e.g. components) gets flowback without cost: its net cost is a gain.

---

## 4e. Categories

Every flow belongs to one category. The country page shows the categories side by side, never one combined score.

**Support for Ukraine**
| category | contents | usual certainty |
|----------|----------|-----------------|
| Military | weapons, ammunition, equipment, training, paid for by the state | A–B (undisclosed parts C–D) |
| Financial | budget support, grant equivalent of loans and guarantees | A–B |
| Humanitarian | food, medicine, energy equipment, reconstruction | A |
| Refugees | cost of hosting people who fled Ukraine (Kiel refugee cost estimates, national budgets, UNHCR numbers × cost per person) | B–C |
| Sanctions and trade | switching cost, lost exports, trade concessions to Ukraine | C |
| People | volunteers fighting for or working in Ukraine (**count**, not euros) | D |

**Money and support reaching Russia**
| category | contents | usual certainty |
|----------|----------|-----------------|
| Energy payments | oil, gas, coal, uranium, including laundered oil | B–C |
| Other trade | excess above the pre-war trend, dual-use goods separately | B–C |
| Company taxes | taxes paid in Russia by companies based in the country | A–B |
| Military (non-money) | weapons, ammunition, technology, troops | D |
| Hidden channels | payment agents, gold, crypto | D |
| People | fighters recruited for Russia (**count**, not euros) | D |

Every category is available as total euros, **per person** in the country, and **% of GDP**.

Political support (UN votes, blocking sanctions) is **out of scope**: this tool only covers money and material support.

---

## 4f. Trend over time

Per country and per category: monthly series and year-on-year change.
The country page leads with "getting better or worse", e.g.
"Payments to Russia: −62% vs 2021, but +15% vs last year (through laundered diesel)."

---

## 4g. Publishing and wording

The data is shown openly, including estimates and company names. To make that defensible:
- Every number links to its source and method, and shows its certainty level.
- Neutral wording: "payments to Russia", "estimated", "range", never accusations.
- A public corrections page and a contact for companies and governments to send corrections.
- C and D estimates are checked by a person before publishing. An LLM-assisted research step can gather reports, but not publish.

---

## 5. Pitfalls to design for

- **Pledged ≠ delivered.** Always show the status and default to *allocated or disbursed*.
- **Weapons value.** Donated old stock can be valued at book value, replacement cost or market price. Store which one was used and keep the source's choice.
- **Trade is not "funding".** Buying oil is a commercial payment, not a donation. The report must say "payments to Russia", not "aid to Russia", and show the state-take version next to it.
- **Lag and revisions.** Kiel and Comtrade revise old numbers. Keep each import as a snapshot so history can be rebuilt and changes show up as differences.
- **Mixed timing.** Pledges are dated by announcement, trade by shipment month. Report this clearly and don't hide it.
- **Indirect flows are estimates.** Show them separately and never mix them into the headline number.
- **Company double counting.** A company delivering weapons that a government paid for is not a second donor (`paid_by` vs `company_id`).
- **Company data is patchy.** Many companies don't report Russia separately. Mark missing data as missing, not as zero.
- **Loan face value inflates totals.** Always show the grant equivalent and the discount rate used.
- **Neutral wording.** The tool reports flows with sources and confidence. It does not judge countries.

---

## 6. How it is built

See [architecture.md](architecture.md) for the code layout, [data-model.md](data-model.md) for the tables,
[data-ingestion.md](data-ingestion.md) for every data source, [research-process.md](research-process.md)
for the estimates, and [website.md](website.md) for the map.

---

## 7. Build order (summary)

The detailed plan is in [roadmap.md](roadmap.md).

1. Ledger object and SQLite store, plus the Kiel importer → "money to Ukraine per country".
2. CREA importer → "money to Russia for fossil fuels per country" and the first **balance ratio**.
3. FX, deflator and GDP normalisation.
4. Loan terms and grant equivalent (Kiel already marks which aid is a loan, so this upgrades step 1 quickly).
5. Comtrade mirror trade (non-fossil goods) and the state-take estimate.
6. Company layer: KSE "Leave Russia" taxes first, then defence contracts and company donations.
7. Refugee hosting costs and trade concessions to Ukraine.
8. Change vs pre-war baseline and switching cost (energy first, then lost exports).
9. Weekly Telegram digest.
10. Re-export and evasion layer (hardest, lowest confidence).
11. Non-money military support, hidden channels and volunteers/fighters (level D research).
12. Web dashboard with the Sankey diagram.
