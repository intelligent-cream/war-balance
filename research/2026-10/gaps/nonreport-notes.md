# Non-reporting partners of Russia: corrected trade (research 2026-10)

Gathered on 2026-10-17. The output is `nonreport.json`, covering 21 countries. Values are in EUR bn, low / central / high (meant as ~90% ranges), for 2019-2025 plus 2026 Jan-Aug (not annualized). **No one has reviewed this yet.**

Scripts:
- `working/scripts-nonreport/build.py` assembles the JSON from `trade_full.json` plus the overrides.
- `crea_month.py` aggregates CREA monthly data by destination.

The CREA extract is saved as `working/raw/nonreport/crea_by_dest_year.txt`. Its source file is `raw/energy/counter_month_dest_commodity_2021_2026aug.csv`, the CREA API data retrieved for `energy.json`.

## How to use
- Each year has a `basis` field:
  - `trade_full (kept)` means the value is copied unchanged from `trade_full.json`.
  - `nonreport_study` means this study replaced it. `trade_full_central` is kept alongside for comparison.
- **Replace** the trade_full values for these countries with the ones in `nonreport.json`.
- **`paid_share`** is the share of Russian supplies (`imports_from_RUS`) that was paid for in money. The remaining share (1 - `paid_share`) is Russian credit, aid or barter. Book it as Russian support to the partner, not as money flowing to Russia.

## Method
1. **Fossil fuels.** The value of Russian crude and oil products by discharge country comes from CREA, which is based on Kpler. It is added to the non-fossil trade wherever the partner's own report or the IMF imputation clearly leaves the oil out. The test: CREA's fuel value alone exceeds the trade_full value for all goods.
2. **Non-fossil trade.**
   - Russian and partner official statements on turnover and growth (TASS, Interfax, partner ministries).
   - Agroexport food and wheat values.
   - Partner customs where they exist: IRICA for Iran, Tajik statistics, the Taliban Ministry of Industry and Commerce (MoIC).
3. **Pre-war consistency.** 2019-2021 is always kept from trade_full. After 2022 the same reporter basis is used where possible. For example, Iran uses Iranian customs, not the Russian turnover figure, which is about twice as large in every year including 2021.

## Main corrections (central, EUR bn, imports from Russia)

| Country | trade_full 2025 | new 2025 | Why |
|---|---|---|---|
| Libya | 0.15 | 1.85 (2024: 2.8) | Russian diesel and products, 2-3 Mt/yr (CREA) |
| Venezuela | 0.06 | 1.10 | Russian naphtha as diluent, ~36 kb/d (Vortexa/Kpler) |
| Syria | 0.85 (2026: 0.55) | 1.25 (2026: 1.30) | Russian Arctic crude to Baniyas after Assad fell |
| Turkmenistan | 0.31 | 1.38 | Official statements: +73% in H1 2024, +35% in Jan-Oct 2025 |
| Tajikistan | 1.52 (2024: 0.84) | 1.77 (2024: 1.65) | Tajik national statistics: USD 1.9bn in 2024 |
| Afghanistan | 0.10 | 0.47 | Fuel and wheat deal; Taliban MoIC reports USD 534m of imports |
| Cuba | 0.11 (2022: 0.09) | 0.26 (2022: 0.60) | Russian oil cargoes plus official turnover figures |
| Sudan | 0.21 | 0.48 (2026: 0.62) | Agroexport wheat (USD 408m) plus fuel |
| Yemen | 0.15 | 0.39 | Russian fuel into Houthi-controlled ports, which the Aden-government reports miss |
| North Korea | 0.03 | 0.22 | Fuel shipments above the UN cap (Open Source Centre), food |
| Iran | 0.97 | 1.28 | IRICA customs; exports to Russia also corrected from 0.47 to ~0.97 |
| Lebanon | 0.16 | 0.45 | CREA fuel alone was 0.32 |

**Smaller adjustments:**
- Mali 2023: the ~USD 100m Russian fuel, fertiliser and wheat package.
- CAR, Eritrea: free wheat, plus thinly recorded flows into CAR.

**Kept unchanged:**
- Myanmar: centrals kept, highs raised.
- Burkina Faso, Niger, Nicaragua, Laos.
- Bangladesh: values kept, only `paid_share` added.

## Paid share (central)
| Country | Paid share | Reason |
|---|---|---|
| North Korea | 0.20 | Barter for munitions |
| CAR | 0.30 | Mostly donations |
| Cuba | 0.35 | State loan / humanitarian cargoes, existing arrears |
| Bangladesh | 0.50 | Rooppur NPP equipment financed by a Russian state loan |
| Eritrea | 0.60 | Donations, concessional terms |
| Syria | 0.65 | Assad-era wheat on credit/aid; 2025-26 crude sold via traders |
| Mali | 0.70 | Terms of the 2022 package unclear |
| Nicaragua | 0.80 | Donated wheat and vehicles |
| Venezuela | 0.85 | Naphtha bought through intermediaries |
| Myanmar | 0.85 | Commercial in roubles; some fertiliser barter |
| Iran, Sudan, Laos, Niger | 0.90 | Mostly commercial |
| Libya, Afghanistan, Burkina Faso, Yemen | 0.95 | Commercial |
| Turkmenistan, Tajikistan, Lebanon | 0.97 | Commercial |

## Caveats and educated guesses
- **Myanmar.** CREA's Russian crude "to Myanmar" (EUR 0.96bn in 2023, 1.39bn in 2024) is transit to China through the Kyaukphyu pipeline. It is excluded from MMR; adding it would double count.
- **Libya.**
  - CREA counts the first discharge port. Part of the fuel is re-exported or smuggled onward, so the central is 0.75-1.0 x CREA.
  - Russian official turnover (~USD 1bn in 2023) is lower because cargoes are sold through third-country traders. By country of origin they are still Russian.
- **Turkmenistan.**
  - Absolute levels are reconstructed from scattered statements. The 2023 Turkmen statement prints "678 million tons", read here as USD.
  - The 80/20 split between Russian exports and Turkmen exports comes from the 2023 statement.
  - Certainty C.
- **Cuba.**
  - Reuters says no Russian crude went to Cuba in 2023. CREA still shows 0.34 Mt of products and crude in 2023.
  - Russian 2022 turnover statements conflict: USD 452m (Chernyshenko) vs ~RUB 60bn (~USD 0.87bn, Mishustin). The range spans both.
  - The second 2026 tanker, announced in April 2026, is not confirmed in CREA's Jan-Aug data. It is covered by the high bound.
- **North Korea.** Munitions are excluded from `exports_to_RUS`. They are given separately as a cumulative 2023-2025 value: EUR 1.4 / 8.3 / 17.7bn. The low end is the amount INSS confirmed from observable data; the high end is KIDA's USD 19.2bn. Use it only in a military module.
- **Iran.** Drones and missiles are excluded. Iranian events in 2026 make the Jan-Aug 2026 range wide.
- **Not done:** systematic Comtrade mirror queries of third-country re-exports to these partners.
