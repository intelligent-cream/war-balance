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
- **Freight follows the real controller** (round 5, [`shadow_fleet.json`](../../research/2026-10/gaps/shadow_fleet.json), [notes](../../research/2026-10/gaps/shadow_fleet-notes.md)). Each tanker counts for its beneficial owner or commercial controller, not where its manager is registered. Russian-owned tankers behind UAE, Indian, Hong Kong, Seychelles and Marshall Islands fronts count for Russia itself, so for no country on the map. The split comes from KSE's monthly volumes by manager country (mainstream fleet linked to price-cap countries: 94% of barrels in 2021, 37% in 2024, 42% in Jan–Aug 2026) and press summaries of Lloyd's List, S&P, Kpler and Windward; Greek owners carry about half of the mainstream fleet. Round 6 ([`shadow_fleet_r6.json`](../../research/2026-10/gaps/shadow_fleet_r6.json), [notes](../../research/2026-10/gaps/shadow_fleet_r6-notes.md)) sets the Russian share per manager group from sanctions lists and investigations (KSE's owner and Baltic charts, Windward, the EU and UK listings of 2Rivers, Gatik and others): opaque managers 60–65% (45–85%), the UAE group 72–85%, India 45–60%, western-loading "Chinese" shells 75%; the foreign remainder is split by nationality. Russian-controlled tankers carry 55–75% of shadow barrels. Largest changes in gross freight 2022–2026 against the pre-war level: Greece +10.2bn, UAE +3.8, China +3.2, Türkiye +2.4, India +2.3, Hong Kong +2.1 (only the profit share counts on the map).
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
- **2026** is January–August (marked `*`): estimated from 2025 and the first company reports for 2026.

**Round 6: checked against company reports.** [`company_taxes_r6.json`](../../research/2026-10/gaps/company_taxes_r6.json)
([notes](../../research/2026-10/gaps/company_taxes_r6-notes.md)) replaces the KSE split and the carried-back history
above. The company reports that could be reached show KSE is accurate where companies filed accounts; the errors are
elsewhere:

- **Interpolated and carried-forward years.** Only 43 of the 100 largest foreign firms filed 2024 accounts, so KSE
  carried many forward from 2023, and its 2025 applies 2024 shares to a preliminary total. Austria now rests on
  Raiffeisen's own country-by-country tax for Russia (EUR 559m in 2022, 464m in 2023, 399m in 2024); KSE's 2022 Austria
  figure was below Raiffeisen alone. UniCredit (Italy), OTP (Hungary) and PepsiCo (US) reports were used the same way,
  and Bundesbank reinvested earnings for Germany.
- **Seized companies.** Unipro (Germany) and Fortum (Finland) have been under Russian state management since April
  2023; their taxes no longer count for the old owners from May 2023.
- **Wrong home country.** JTI was filed under Switzerland; its owner is Japan Tobacco, so it moves to Japan.

The effects are small: Austria +2.3bn toward Russia (was +2.0), Finland −0.75 (was −0.49), most others within
EUR 0.1–0.3bn. Bank figures are accounting tax (including deferred tax), not cash.
- Compared in **money**, without a price index.

On the map: "Less / more tax paid in Russia by companies". Cross-check: the audit found US 15.5 against a check of 12.5–17 and Germany 8.6 against 7.5–11 (EUR bn, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md)).

## See also

- [counterfactual.md](counterfactual.md): expected levels for services
- [trade.md](trade.md): goods trade and the 20% margin
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): the oil the tankers carry
- [reference/sources.md](../reference/sources.md#services-shipping-and-companies)
- [Documentation index](../README.md)
