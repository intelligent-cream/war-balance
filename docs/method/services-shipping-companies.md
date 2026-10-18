# Services, shipping and company taxes

Three smaller flows complete the Russia side of the ledger: services traded with Russia (tourism above all), income from shipping, insuring and selling tankers for Russian oil and LNG, and taxes that foreign-owned companies pay in Russia. Each is compared with an expected no-war level, like goods, but each needs its own care: 2021 was a COVID year for travel, shipping income is mostly costs rather than profit, and most taxes a company pays in Russia are really paid by its Russian customers and staff. This page explains each choice.

## Services

Data: [`uncovered.json`](../../research/2026-10/gaps/uncovered.json) `services` ([notes §1](../../research/2026-10/gaps/uncovered-notes.md)), 199 economies, two flows:

- `svc_bought` (bought from Russia): "Less / more paid to Russia for services", full change;
- `svc_sold` (sold to Russia, including what Russian tourists spend in the country): "Profit lost on services to Russia given up (e.g. tourism)", change × 20% margin ([trade.md](trade.md#profit-not-revenue)).

Sources: Eurostat `bop_its6_det` (EU, EFTA, candidates, Turkey), OECD-WTO BaTiS (own reports and the balanced estimate), the Bank of Russia balance of payments. Non-reporters (China, UAE, India, Kazakhstan, Belarus) use BaTiS balanced values × 0.6–1.5 (certainty C). Turkey uses the mean of its report and BaTiS, because 6.3 million Russian visitors imply more travel income than Turkey reports. 2026 is the 2025 value × 0.66–0.71.

**The expected level.** Services stay at 2021 (random walk), plus the travel recovery from COVID: the 2021 travel shortfall against 2019 closes at the UNWTO world pace (49% of the gap still open in 2022, 17% in 2023, 1% in 2024). No model beat this in all three back-tests ([counterfactual.md](counterfactual.md#6-which-model-is-used-for-which-flow)). Where the map's 2021 is higher than the model's own 2021 (a source with little COVID dip), the expected level is capped at the model's recovered level in euros (Montenegro +10.8% → +5.4% of GDP). Before round 4, services used `trend2.json` ([notes](../../research/2026-10/gaps/trend2-notes.md)) with travel fitted on 2012–2019; for countries without a counterfactual entry those trends remain.

**Narrower data** for Georgia (National Bank travel revenue), Turkey (TÜİK and Russian arrivals × spend), Tunisia, Cyprus and others come from [`narrow.json`](../../research/2026-10/gaps/narrow.json). **Malta's** suppressed post-2022 services data are filled (`fix_artefacts()`). Price level: euro-area services HICP ([prices.md](prices.md)).

## Shipping

Data: [`shipping.json`](../../research/2026-10/gaps/shipping.json) ([notes](../../research/2026-10/gaps/shipping-notes.md)), applied by [build_data.py `apply_shipping()`](../../pipeline/build_data.py). Money earned by companies in each country for carrying, insuring, financing and registering Russia's seaborne crude, product and LNG exports, and for selling tankers to the shadow fleet. The earner is the country of the owner or manager, insurer, lender or registry, never the flag.

- **Freight** = yearly freight pool (USD 5.2bn in 2021, 14.8bn in 2022) split by owner or manager country (KSE Institute, CREA, S&P Global, Windward).
- **Russia's own fleet stays Russian.** Shadow tankers managed from the UAE, India, China and Hong Kong are mostly Sovcomflot's chain; their freight is scaled down by `refine.json` `shipping_control` (UAE freight × 0.08–0.31 of the earlier model, from KSE monthly manager data and OFAC designations). Seychelles managers are fronts: 20% (5–50%) kept.
- **Profit, not revenue** (`SHIPPING_PROFIT`): freight 20% / 35% / 50%, insurance and finance 10% / 25% / 40%, registry 30–70%; ship sales are already counted as their price premium (80–100%).
- **Double counting removed**: the part already inside services sold to Russia (freight 5%, insurance and finance 10–20%) is taken out (`overlap_share_with_services_sold_to_rus`); Greek tanker earnings in `uncovered.json` are not added again; freight inside import values is removed from payments to Russia ([trade.md](trade.md#freight-cif-to-fob)).
- **2026** freight × 1.065 for the crude pool after the Hormuz closure.
- **Expected level**: the 2019–2021 baseline × Russian seaborne export volume growth (+3.9% a year, `trend2.json` `global.shipping`), with services prices.

On the map: "Profit from shipping and insuring Russian oil" (or "less profit"), certainty D by default.

## Company taxes

Data: [`companies_all.json`](../../research/2026-10/gaps/companies_all.json) ([notes](../../research/2026-10/gaps/companies_all-notes.md)) and [`round4a.json`](../../research/2026-10/gaps/round4a.json) `taxes` ([notes §1](../../research/2026-10/gaps/round4a-notes.md)); first round [`companies.json`](../../research/2026-10/companies.json) ([notes](../../research/2026-10/companies-notes.md)). Sources: KSE Institute and B4Ukraine reports on foreign companies in Russia.

- **Scope**: taxes of Russian subsidiaries while still foreign-owned; companies sold to Russian owners are taken out with a time-weighted share of the exited cohort (0.80 in 2022 falling to 0.10 in 2025).
- **What counts** (round 4): **profit tax in full plus half of other taxes**. VAT, excise and payroll taxes are largely paid by Russian customers and staff. This "owner measure" is about 0.6 of all taxes (EUR 13.2bn in 2021, 8.5bn in 2025 across all home countries).
- **Pre-war level**: the 2018–2021 average. No tax series by home country exists before 2021, so 2018–2020 are carried back from 2021 with Bank of Russia FDI income and Russian GDP indices, adjusted by each country's FDI position (`history_2018_2020_split`); `base_2018_2021 = true` in `data.json`.
- **Expected level**: foreign companies' pre-war growth in Russia (`trend2.json`: the country's own trend where reliable, else the global +4.5% a year), applied by `pre_war_trends()`; no back-tested model covers this flow.
- **2026** is the 2025 rate × 8/12 (marked `*`).
- Compared in **money**, without a price index.

On the map: "Less / more tax paid in Russia by companies". Cross-check: the audit found US 15.5 against a check of 12.5–17 and Germany 8.6 against 7.5–11 (EUR bn, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md)).

## See also

- [counterfactual.md](counterfactual.md): expected levels for services
- [trade.md](trade.md): goods trade and the 20% margin
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): the oil the tankers carry
- [reference/sources.md](../reference/sources.md#services-shipping-and-companies)
- [Documentation index](../README.md)
