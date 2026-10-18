# Changelog: research rounds

The map's data were built in four research rounds in October 2026, each followed by changes to the pipeline and the site. This page summarises what each round added or corrected and links to the method page that now explains it. The detailed log, with every file and decision, is [`research/2026-10/README.md`](../research/2026-10/README.md); individual corrections are in the commit history.

## Round 1

**First real data, 17 October 2026.** Six research files replaced sample values:

- aid per donor from the Kiel Institute tracker, Release 31 ([`kiel.json`](../research/2026-10/kiel.json)) → [aid](method/aid-refugees-military.md#aid);
- goods trade with Russia and Ukraine from UN Comtrade, 2021–2025 ([`trade.json`](../research/2026-10/trade.json)) → [trade](method/trade.md);
- fossil payments to Russia from CREA, laundered oil, oil discounts ([`crea.json`](../research/2026-10/crea.json)) → [energy](method/energy-and-laundered-oil.md);
- own-industry share of military aid and PURL ([`flowback.json`](../research/2026-10/flowback.json)) → [flowback](method/aid-refugees-military.md#flowback);
- profit tax of foreign companies in Russia ([`companies.json`](../research/2026-10/companies.json)) → [company taxes](method/services-shipping-companies.md#company-taxes);
- military support to Russia, people, population and GDP ([`other.json`](../research/2026-10/other.json)).

Method: EU-level aid split by EU budget share; refugee costs modelled from Kiel's EU total; 2026 trade estimated from the 2025 rate.

## Round 2

**Gaps filled, margins everywhere, 17 October 2026.**

- Estimates with low/middle/high ranges for every gap: aid from 190 non-Kiel countries, refugee costs per year, energy switching cost and discounts, all company taxes, trade 2019–Aug 2026 ([`gaps/`](../research/2026-10/gaps/trade_full.json) files).
- Ranges of about 90% everywhere; certainty-letter defaults where data give none → [ranges](method/ranges.md).
- Flowback counted as profit (20%).
- **Attribution through middlemen**: laundered oil to the final buyer through trading hubs; Hong Kong's Russian gold partly to China; Russia's unexplained imports to the countries of origin → [trade](method/trade.md#residual-gap), [energy](method/energy-and-laundered-oil.md#hub-resale-chain).
- Services, hidden channels, undisclosed aid and private donations added ([`uncovered.json`](../research/2026-10/gaps/uncovered.json)).

## Round 3

**Prices, transit gas, hubs, trends and two audits, 17–18 October 2026.**

- **Pre-war prices**: every traded flow divided by its price level, so changes compare volumes → [prices](method/prices.md).
- **Transit gas** counted where it is used; **gas prices per country** → [energy](method/energy-and-laundered-oil.md#transit-gas).
- **Hub resale** of refined products; customers of the UAE, India, Turkey, Togo, Gibraltar and Panama; Turkey's and India's refined exports counted once.
- **Re-exports through 11 trade hubs** moved to the countries that made the goods → [trade](method/trade.md#re-export-hubs).
- **Tanker shipping** as profit, with the services overlap removed; **freight** taken out of import values (CIF to FOB) → [shipping](method/services-shipping-companies.md#shipping).
- **Pre-war trends** (`trend.json`, `trend2.json`): the first counterfactual beyond a flat baseline → [counterfactual](method/counterfactual.md#2-history-four-generations).
- **First audit** of 31 countries: gas double counts (Turkey 220 → 184.5bn), ERA loans out of aid, EU Support Loan guarantors, Denmark, laundered oil × 0.62 for the EU.
- **China's military support** only where not in recorded trade → [military](method/aid-refugees-military.md#military-support-to-russia).
- **Narrower ranges** for 16 countries from official statistics; a base-range bug for pipeline-gas countries fixed.
- **Refined estimates** for shadow-fleet control, re-export shares, Togo's buyers and gold routes.
- **Second audit**: UAE gold and fuel, France's undisclosed aid, Russia's structural import gap, trend windows, border-priced freight; Baltic transit measured.
- Headline measure set to the 2022-to-year total as % of one year's GDP.

## Round 4

**Back-tested counterfactual and method fixes, 18 October 2026.**

- **War-time price windfall** on Russian fuel counted toward Russia → [prices](method/prices.md#war-time-windfall).
- **Profit, not revenue** on sales to Russia (20%) → [trade](method/trade.md#profit-not-revenue).
- **Baltic and Finnish pass-through** taken out before and after the war → [trade](method/trade.md#baltic-and-finnish-pass-through).
- **Ranges in quadrature** (baseline and actual values correlated 0.5) instead of stacked worst cases → [ranges](method/ranges.md#quadrature-for-traded-flows-spread).
- **2026 labelled year to date**; estimated parts marked `*`.
- **Company taxes**: profit tax plus half of other taxes, 2018–2021 base.
- **China's refined exports** counted once; **pre-war laundered oil** as a baseline → [energy](method/energy-and-laundered-oil.md#pre-war-laundered-oil).
- **Own customs prices** for 102 countries (`prices.json`); Turkey kept on benchmarks pending review.
- **UAE trade** from its customs totals; **refugee costs** from budgets for 27 hosts; **Belarus** taken out of the residual spread; **artefacts** in small countries fixed.
- **Counterfactual**: 16 models back-tested from 2008, 2013 and 2016; exports to Russia and Ukraine trade follow a nowcast, the rest holds 2021; ranges 1.5–2× wider → [counterfactual](method/counterfactual.md).

## Round 4 review fixes

Applied after a review of round 4 (section "Review fixes" in the [research log](../research/2026-10/README.md)):

- UAE customs figures applied after `narrow.json` (UAE −0.5% → −1.5% of GDP).
- Services counterfactual capped at the model's recovered level (Montenegro +10.8% → +5.4%) → [counterfactual](method/counterfactual.md#6-which-model-is-used-for-which-flow).
- Windfall and payments price index from each year's actual fuel share (India −4.6% → −5.1%) → [prices](method/prices.md).
- Pre-war re-exports taken out of hubs' 2021 values; pre-war laundered oil through the hub chain; laundered-oil GDP cap for all countries.
- Gibraltar keeps a 10% bunker margin (−18.9% → −1.4%); Kyrgyzstan's hidden gold passed to its buyers via [`kgz_gold.json`](../research/2026-10/gaps/kgz_gold.json) (−30.5% → −15.1%).
- `*` also on payments with estimated 2026 trade; method text describes the windfall.

Headline numbers after these fixes (2022–Aug 2026, % of a year's GDP): Germany +4.8%, Poland +10.0%, China −1.6%, India −5.1%, Hungary −6.7%, UAE −1.5%.

## Round 5

The [round 5 roadmap](roadmap.md) in full. Research:

- **New money flows to Russia:** Russian arms sales against the expected level; Rosatom construction and Russia's state
  loans; exit payments of companies leaving Russia; profits of Russian-owned companies abroad
  ([russia-state-and-companies.md](method/russia-state-and-companies.md)).
- **Aid valued for Ukraine:** loans at their economic value (grant element at 10%), multilateral lending by
  shareholding, donated weapons at market value, refugees at net cost (minus their taxes), Poland's refugee spending
  corrected ([aid-refugees-military.md](method/aid-refugees-military.md)).
- **Flowback:** arms Ukraine bought abroad count for the seller (Czechia, Bulgaria, the US).
- **Better data:** tanker freight by real controller; laundered oil per EU member from customs; Türkiye's prices from
  contract terms and EPDK volumes; actual January–August 2026 trade for 32 economies; ERA loans in the year paid;
  Belarus's re-exports and its own error band.
- **Code:** measured correlations between parts' errors; one price base (2019–2021); bars from zero with capped range
  lines; data-coverage notes load after the map; data text translatable.

Headline effects: Poland +10.0% → +7.1% of GDP (refugees), Türkiye −6.0% → −6.6% (prices), Hungary −6.7% → −7.6%,
Germany +4.8% → +4.3%, Japan +0.91% → +0.76% (loans), Belarus's range −79% to +51% → −58% to +19%.

## Round 6

The [round 6 roadmap](roadmap.md) in full. The main change is a fairer count of money earned from the war effort:

- **Two balances:** each country has a balance with Ukraine (what it gave minus what it earned from the war effort) and
  one with Russia; the headline adds them. A country that earned more from the war effort than it gave gets a gold
  outline, and gold fill when that makes its total negative; that is never counted as money toward Russia
  ([overview.md](method/overview.md#two-balances-round-6)).
- **The money rule:** money paid out counts in full; money earned (flowback, sales and services to Russia, freight for
  Russian oil) counts as value kept in the economy (OECD TiVA) × the share that is genuinely extra. It replaces the flat
  20% profit ([overview.md](method/overview.md#the-money-rule-round-6)).
- **The all-money ledger:** every euro that reached Ukraine followed to the economy where it was spent, including
  purchases that replaced donated weapons and aid spent on energy, relief and rebuilding. The US earns back EUR 44bn of
  94bn given, Germany 10 of 78 ([aid-refugees-military.md](method/aid-refugees-military.md#flowback)).
- **Ranges:** the 2022–2026 total's range measured directly on the back-tests (about as wide as before); own bands for
  Mongolia, Yemen, Tajikistan and Moldova; Moldova without Transnistria's unpaid gas (range −14…+74% → +8…+36%)
  ([counterfactual.md](method/counterfactual.md)). Trade with Ukraine back to 2021 held flat after more back-tests.
- **Data gaps closed:** payment agents' fees; North Korea and Iran military support at certainty C; 18 more buyers of
  Russian arms and Iran's drones counted once; Brunei's refinery at its true Russian crude intake and Russian fuel
  relabelled in Turkish ports; shadow-fleet shares from evidence; Belarus's loan deferrals net of refinancing; company
  taxes checked against company reports.
- **Display:** ranges as a pale band behind each bar, readable on phones and in dark mode.

Headline effects (% of GDP, develop → round 6): Kyrgyzstan −15.3 → −23.3, Armenia −7.8 → −13.4, Georgia −12.0 → −16.0
(payment agents, money rule), Belarus −23.7 → −28.6, North Korea −36.8 → −30.0, Brunei +6.6 → −4.8, Moldova +16.9 →
+19.3 (range now above zero), Bulgaria +1.7 → +0.7 and Czechia +2.4 → +1.9 (gold outline: they earned more from the war
effort than they gave). Large donors barely move: US +0.61 → +0.51, Germany +4.26 → +4.23, Poland +7.1 → +7.3.

## See also

- [limitations.md](limitations.md): what is still open
- [method/overview.md](method/overview.md)
- [Documentation index](README.md)
