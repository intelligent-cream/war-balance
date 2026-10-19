# Round 11: checking the judgement net-gain shares (`assumptions_r11_gain.json`)

Gathered on 2026-10-19. **No one has reviewed this yet.** These are proposals only.
`net_gain_russia.json` and `net_gain_ukraine.json` have not been changed.

## What was checked

Some net-gain shares in the two files were judgement, or rested on one or two remembered company margins:

- **Russia:** services, arms, other manufactured goods, wood, food, chemicals, steel and aluminium.
- **Ukraine:** other food, other metals, wood, machinery, chemicals and other goods.

This round looked for official sector profit figures, export duties actually collected, and company results.
Where data was found, it replaces the judgement.

## The data found

- **Russia, sector profits 2021–2025 (the main new source).** Each year the Federal Tax Service publishes
  Rosstat's profitability of sold goods and return on assets for every OKVED-2 activity. The tables are
  reproduced on ConsultantPlus. This covers transport by mode, construction, IT, food, fish, crops, wood,
  paper, chemicals, metallurgy, machinery and "other transport equipment", which includes aircraft, ships and
  military vehicles.
- **Russia, service exports by type 2021–2025.** These come from the Bank of Russia and are used as weights.
- **Russia, export duties.**
  - Grain and oilseed duties raised RUB 152 bn in 2024 and about 121 bn in 2025 (Accounts Chamber, via
    Zerno.ru and Agroinvestor). That is about 3.9% and 3.6% of all food exports.
  - The duty linked to the exchange rate charged 4–7% on most non-machinery goods from October 2023 to
    31 December 2024. It raised RUB 140 bn in 2023.
  - The 2021 metals duty was 15% plus a minimum, from August to December 2021.
- **Russia, companies.**
  - Rusal's revenue, EBITDA, EBIT, depreciation and balance sheet (HKEX filings).
  - Severstal's EBITDA for 2021–2023 and MMK's for 2023–2025.
  - Rostec's margins: a net margin of 7.9% in 2021 and 2.1% in 2023. Profitability on the state defence
    order is about 2%.
  - Rosoboronexport in 2014: revenue of RUB 22 bn on about USD 13 bn of exports. That is a commission of
    about 4.4% and net profit of about 1.9%.
- **Ukraine, profits by division 2019–2021.** Derzhstat publishes operating profitability for every KVED
  division and group up to 2021. Some 2021 figures: food products 3.3%, wood 10.7%, furniture 7.4%,
  chemicals 14.7%, electrical equipment 2.1%, machinery 4.4%.
- **Ukraine, nothing by division after 2021.** The 2024 yearbook (table 22.12) gives whole sections only:
  all firms, industry, agriculture.

## How a share is computed

One rule is used for every sector:

**gain = other production taxes + profit tax + profit above a normal return**

Each part is a share of sales.

- The sales margin comes from the official profitability figure.
- Firms differ, so the rule averages over a spread of firm margins. Profitable firms still count when the
  sector as a whole only breaks even. `net_gain_ukraine.json` already does this.
- **Russia: capital per rouble of sales = sales margin ÷ return on assets.** Both figures come from the same
  table. The normal return is 9% before tax.
  - Rail freight shows why this matters. Its margin is high (profitability of 20%), but its return on
    assets is only 3.5%, so almost nothing is above a normal return.
- **Ukraine:** the same settings as the existing file. The normal return is 10%. Capital per unit of sales
  is 0.6–0.8 (judgement).
- Export duties are added on top, because company accounts treat them as a cost.

## Results (central values; old → new)

| group | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| RU services | 0.08 → 0.032 | 0.08 → 0.035 | 0.08 → 0.043 | 0.08 → 0.034 | 0.08 → 0.044 | 0.08 → 0.044 |
| RU arms | 0.12 → 0.043 | 0.12 → 0.039 | 0.12 → 0.045 | 0.12 → 0.050 | 0.12 → 0.050 | 0.12 → 0.050 |
| RU other manufactured | 0.05 → 0.031 | 0.05 → 0.040 | 0.05 → 0.044 | 0.05 → 0.044 | 0.05 → 0.045 | 0.05 → 0.045 |
| RU wood | 0.12 → 0.144 | 0.06 → 0.054 | 0.03 → 0.040 | 0.03 → 0.064 | 0.03 → 0.023 | 0.03 → 0.023 |
| RU food | 0.18 → 0.142 | 0.22 → 0.127 | 0.18 → 0.126 | 0.14 → 0.109 | 0.12 → 0.100 | 0.12 → 0.104 |
| RU chemicals | 0.17 → 0.161 | 0.15 → 0.158 | 0.10 → 0.076 | 0.10 → 0.075 | 0.08 → 0.069 | 0.09 → 0.069 |
| RU steel | 0.28 → 0.312 | 0.12 → 0.134 | 0.09 → 0.145 | 0.05 → 0.116 | 0.02 → 0.055 | 0.02 → 0.055 |
| RU aluminium | 0.14 → 0.166 | 0.05 → 0.039 | 0.02 → 0.020 | 0.04 → 0.053 | 0.02 → 0.016 | 0.07 (kept) |
| UA other food | 0.09 → 0.075 | 0.06 → 0.042 | 0.07 → 0.048 | 0.08 → 0.065 | 0.08 → 0.065 | 0.08 → 0.065 |
| UA other metals | 0.10 → 0.034 | 0.05 → 0.020 | 0.04 → 0.033 | 0.05 → 0.037 | 0.05 → 0.037 | 0.05 → 0.037 |
| UA wood | 0.08 → 0.058 | 0.05 → 0.026 | 0.05 → 0.044 | 0.06 → 0.050 | 0.06 → 0.050 | 0.06 → 0.050 |
| UA machinery | 0.04 → 0.030 | 0.03 → 0.023 | 0.03 → 0.039 | 0.035 → 0.044 | 0.035 → 0.044 | 0.035 → 0.044 |
| UA chemicals | 0.10 → 0.071 | 0.04 → 0.019 | 0.03 → 0.027 | 0.04 → 0.030 | 0.04 → 0.030 | 0.04 → 0.030 |
| UA other | 0.08 → 0.050 | 0.05 → 0.022 | 0.05 → 0.045 | 0.05 → 0.052 | 0.05 → 0.052 | 0.05 → 0.052 |

Low and high values, the arithmetic for each group and the source links are in the JSON.

Russia's non-fuel average hardly changes: 0.200 → 0.197 (2021), 0.185 → 0.167, 0.138 → 0.129,
0.116 → 0.118, 0.112 → 0.109, 0.133 → 0.130 (2026). The reason is that the cuts (food) and the
increases (steel) roughly cancel.

## What changed most, and why

- **Russian arms, 0.12 → about 0.04–0.05.**
  - Aircraft, ship and military-vehicle makers report low margins. Their return on assets is negative or
    below 2%.
  - Rostec's defence work earns about 2%.
  - Rosoboronexport's own profit adds about 0.02.
  - The high case stays at 0.12. A 2007 Kommersant report put the commission at 5–15%, and export contracts
    may be more profitable than domestic orders, but no recent data exists.
- **Russian services, 0.08 → about 0.03–0.045.** Most service exports are transport, travel, construction
  and business services. These sectors earn about a normal return on their large asset base. Sea transport
  in 2022–23 is the exception.
- **Russian food, 2022 0.22 → 0.13.** Crop profitability fell to about 20%, set against a large land and
  machinery base. Grain duties take about 4% of all food export value, not more.
- **Russian steel is higher in 2022–2025.** Severstal and MMK kept EBITDA margins of 20–36% until 2024.
  The old values assumed almost no rent. The new central value is the average of a sector method (lower) and
  a company method (higher), so the range is wide.
- **Ukraine, 2021 is lower in every group.** Measured 2021 manufacturing margins were thin: 2–11% on costs.
  The old 0.08–0.10 for other metals, chemicals and wood was too high.

## What is still judgement

- **Ukraine 2022–2026.** No division data is published, so these years use a proxy and are marked
  judgement. The proxy takes 2019–2020 division margins and scales them by Ukrstat's section trend: about
  0.29 in 2022, 0.99 in 2023 and 1.13 in 2024. 2025–2026 repeat 2024.
- **Russia 2026.** This repeats 2025 (no sector data yet). Aluminium 2026 keeps the old value.
- **Weights inside groups.** Examples: which OKVED or KVED sectors make up "other manufactured" or "other
  food", and the mapping of travel and business services. Also judgement: steel depreciation (6%) and
  capital per unit of sales (1.0).
- **Food duties 2021–2023 are estimated.** Only partial totals were found: RUB 47 bn by October 2021, and
  about RUB 175 bn from June 2021 to early 2022.
- **How far the 2023–24 exchange-rate duty reached wood, chemicals and aluminium.** The coverage rates are
  assumed: 50%, 25% and 50%. Wood ranges from 20% to 80%. Aluminium ranges from 0% to 100%.
- **The Russian return on assets uses total assets, including financial investments.** This tends to
  understate profit above a normal return. The fertiliser makers inside OKVED 20 push chemicals up.
- **Weaker sources.** Several figures come from secondary sources or search snippets:
  - the Rosoboronexport 2014 figures (Wikipedia);
  - the 2014 arms exports;
  - MMK 9M 2025;
  - the 2025 Rusal and Severstal figures, which were already in `net_gain_russia.json`.

  Their entries in the JSON say so.
- **Not reachable.** Rosstat's own site and the Finance Ministry site could not be reached from here, so
  the export-duty revenue by type that the Finance Ministry publishes was not checked. The Ukrainian
  2022–2024 division tables appear not to be published at all.
