# Services, shipping and company taxes

Three smaller flows complete the Russia side of the ledger: services traded with Russia (tourism above all), income from shipping, insuring and selling tankers for Russian oil and LNG, and taxes that foreign-owned companies pay in Russia. Each is compared with an expected no-war level, like goods, but each needs its own care: 2021 was a COVID year for travel, shipping income is mostly costs rather than profit, and most taxes a company pays in Russia are really paid by its Russian customers and staff. This page explains each choice.

## Services

Data: [`uncovered.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/uncovered.json) `services` ([notes §1](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/uncovered-notes.md)), 199 economies, two flows:

- `svc_bought` (bought from Russia): "Less / more paid to Russia for services", the change × Russia's net gain on services ([overview](#view=how&sec=m-overview-the-net-gain-rule));
- `svc_sold` (sold to Russia, including what Russian tourists spend in the country): "Income lost on services to Russia given up (e.g. tourism)", change × the seller's net gain × genuinely extra ([overview.md](#view=how&sec=m-overview-one-rule-for-every-seller)).

Sources: Eurostat `bop_its6_det` (EU, EFTA, candidates, Turkey), OECD-WTO BaTiS (own reports and the balanced estimate), the Bank of Russia balance of payments. Non-reporters (China, UAE, India, Kazakhstan, Belarus) use BaTiS balanced values × 0.6–1.5 (certainty C). Turkey uses the mean of its report and BaTiS, because 6.3 million Russian visitors imply more travel income than Turkey reports. 2026 is the 2025 value × 0.66–0.71.

**The expected level.** Services stay at 2021 (random walk), plus the travel recovery from COVID: the 2021 travel shortfall against 2019 closes at the UNWTO world pace (49% of the gap still open in 2022, 17% in 2023, 1% in 2024). No model beat this in all three back-tests ([counterfactual.md](#view=how&sec=m-counterfactual-6-which-model-is-used-for-which-flow)). Where the map's 2021 is higher than the model's own 2021 (a source with little COVID dip), the expected level is capped at the model's recovered level in euros. Countries without a counterfactual entry use `trend2.json` ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/trend2-notes.md)), with travel fitted on 2012–2019.

**Narrower data** for Georgia (National Bank travel revenue), Turkey (TÜİK and Russian arrivals × spend), Tunisia, Cyprus and others come from [`narrow.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/narrow.json). **Malta's** suppressed post-2022 services data are filled. Price level: euro-area services HICP ([prices.md](#view=how&sec=m-prices)). <span class="incode">In the code: `fix_artefacts()`</span>

**Services sold to Russia count at the seller's net gain** (accommodation and food, business services without real estate, with a 5% real normal return plus the country's risk premium: OECD median 0.040, Poland 0.18, the US 0.11) × genuinely extra. Cyprus's business services sold to Russia before the war earned about a normal return, so they count for little.

## Shipping

Data: [`shipping.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shipping.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shipping-notes.md)), applied by [build_data.py `apply_shipping()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py). Money earned by companies in each country for carrying, insuring, financing and registering Russia's seaborne crude, product and LNG exports, and for selling tankers to the shadow fleet. The earner is the country of the owner or manager, insurer, lender or registry, never the flag.

- **Freight** = yearly freight pool (USD 5.2bn in 2021, 14.8bn in 2022) split by owner or manager country (KSE Institute, CREA, S&P Global, Windward).
- **Freight follows the real controller** ([`shadow_fleet.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shadow_fleet.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shadow_fleet-notes.md)). Each tanker counts for its beneficial owner or commercial controller, not where its manager is registered. Russian-owned tankers behind UAE, Indian, Hong Kong, Seychelles and Marshall Islands fronts count for Russia itself, so for no country on the map. The split comes from KSE's monthly volumes by manager country (mainstream fleet linked to price-cap countries: 94% of barrels in 2021, 37% in 2024, 42% in Jan–Aug 2026) and press summaries of Lloyd's List, S&P, Kpler and Windward; Greek owners carry about half of the mainstream fleet. The research ([`shadow_fleet_r6.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shadow_fleet_r6.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shadow_fleet_r6-notes.md)) sets the Russian share per manager group from sanctions lists and investigations (KSE's owner and Baltic charts, Windward, the EU and UK listings of 2Rivers, Gatik and others): opaque managers 60–65% (45–85%), the UAE group 72–85%, India 45–60%, western-loading "Chinese" shells 75%; the foreign remainder is split by nationality. Russian-controlled tankers carry 55–75% of shadow barrels. Largest changes in gross freight 2022–2026 against the pre-war level: Greece +10.2bn, UAE +3.8, China +3.2, Türkiye +2.4, India +2.3, Hong Kong +2.1 (only the profit share counts on the map).
- **Profit, not revenue** (`SHIPPING_PROFIT`, the fallback where the net gain below is missing): freight 20% / 35% / 50%, insurance and finance 10% / 25% / 40%, registry 30–70%; ship sales are already counted as their price premium (80–100%).
- **At the shipper's and insurer's net gain.** Gross freight counts at the water-transport industry's net gain (OECD STAN, H50: 0 for Greece and Norway, 0.19 for Denmark, OECD median 0; [`net_gain_sellers.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/net_gain_sellers.json)) × genuinely extra; insurance and finance at the insurance industry's (K65, OECD median 0.155) × genuinely extra. Ship-sale premiums and registry fees are already rent and keep their shares. Greece's shipping part is about 0: in national accounts Greek water transport earns less than a normal return (its owners' profits are booked offshore), a limit noted in [limitations](#view=how&sec=limitations).
- **Double counting removed**: the part already inside services sold to Russia (freight 5%, insurance and finance 10–20%) is taken out; Greek tanker earnings in `uncovered.json` are not added again; freight inside import values is removed from payments to Russia ([trade.md](#view=how&sec=m-trade-freight-cif-to-fob)). <span class="incode">In the code: `overlap_share_with_services_sold_to_rus`</span>
- **2026**: freight rates rose after the Strait of Hormuz closed ([refine-notes.md](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refine-notes.md), freight quotes for March–September 2026). The higher rates are already inside the freight values from `shadow_fleet.json`, so no extra factor is applied ([shadow_fleet-notes.md](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/shadow_fleet-notes.md), "How the builder should use it").
- **Expected level**: the 2019–2021 baseline × Russian seaborne export volume growth (+3.9% a year, `trend2.json` `global.shipping`), with services prices.

On the map: "Profit from shipping and insuring Russian oil" (or "less profit"), certainty D by default.

## Company taxes

Data: [`companies_all.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/companies_all.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/companies_all-notes.md)) and [`round4a.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4a.json) `taxes` ([notes §1](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4a-notes.md)); first round [`companies.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/companies.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/companies-notes.md)). Sources: KSE Institute and B4Ukraine reports on foreign companies in Russia.

- **Scope**: taxes of Russian subsidiaries while still foreign-owned; companies sold to Russian owners are taken out with a time-weighted share of the exited cohort (0.80 in 2022 falling to 0.10 in 2025).
- **What counts**: **profit tax in full plus half of other taxes**. VAT, excise and payroll taxes are largely paid by Russian customers and staff. This "owner measure" is about 0.6 of all taxes (EUR 13.2bn in 2021, 8.5bn in 2025 across all home countries).
- **Pre-war level**: the 2018–2021 average. No tax series by home country exists before 2021, so 2018–2020 are carried back from 2021 with Bank of Russia FDI income and Russian GDP indices, adjusted by each country's FDI position; `base_2018_2021 = true` in `data.json`. <span class="incode">In the code: `history_2018_2020_split`</span>
- **Expected level**: foreign companies' pre-war growth in Russia (`trend2.json`: the country's own trend where reliable, else the global +4.5% a year), applied by `pre_war_trends()`; no back-tested model covers this flow.
- **2026** is January–August (marked `*`): estimated from 2025 and the first company reports for 2026.

**Checked against company reports.** [`company_taxes_r6.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/company_taxes_r6.json)
([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/company_taxes_r6-notes.md)) replaces the KSE split and the carried-back history
above where reports exist. The company reports that could be reached show KSE is accurate where companies filed accounts; the errors are
elsewhere:

- **Interpolated and carried-forward years.** Only 43 of the 100 largest foreign firms filed 2024 accounts, so KSE
  carried many forward from 2023, and its 2025 applies 2024 shares to a preliminary total. Austria rests on
  Raiffeisen's own country-by-country tax for Russia (EUR 559m in 2022, 464m in 2023, 399m in 2024); KSE's 2022 Austria
  figure was below Raiffeisen alone. UniCredit (Italy), OTP (Hungary) and PepsiCo (US) reports were used the same way,
  and Bundesbank reinvested earnings for Germany.
- **Seized companies.** Unipro (Germany) and Fortum (Finland) have been under Russian state management since April
  2023; their taxes do not count for the old owners from May 2023.
- **Wrong home country.** JTI was filed under Switzerland; its owner is Japan Tobacco, so it moves to Japan.

The changes against the KSE split are small: Austria EUR 2.3bn toward Russia, Finland 0.75bn toward Ukraine, most others within
EUR 0.1–0.3bn of KSE. Bank figures are accounting tax (including deferred tax), not cash.
- Compared in **money**, without a price index.

On the map: "Less / more tax paid in Russia by companies". Cross-check: US 15.5 against a check of 12.5–17 and Germany 8.6 against 7.5–11 (EUR bn, [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit-notes.md)).
