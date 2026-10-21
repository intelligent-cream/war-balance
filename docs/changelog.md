# Changelog: research rounds

The map's data were built in sixteen research rounds in October 2026, each followed by changes to the pipeline and the site; round 17 redesigned the site without changing a number. This page summarises what each round added or corrected and links to the method page that now explains it. The detailed log, with every file and decision, is [`research/2026-10/README.md`](../research/2026-10/README.md); individual corrections are in the commit history.

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

## Round 7

The [round 7 roadmap](roadmap.md) in full:

- **No-war energy prices**: fuel payments and the war-time windfall are compared with the prices a no-war market
  expected (pre-invasion forecasts and futures), not 2019–2021 prices; 2026 against actual world prices (the Hormuz
  spike was not caused by this war); a negative windfall where Russia sold below those prices. The windfall falls
  from EUR 455bn to roughly a third ([prices.md](method/prices.md#no-war-prices-round-7)).
- **Frozen Russian reserves**: the return they would have earned for Russia, credited to the holders; Euroclear a
  third to Belgium and two thirds to all EU members ([russia-state-and-companies.md](method/russia-state-and-companies.md#frozen-central-bank-reserves-round-7)).
- **Remittances from Russia**: migrant workers' wages at the money rule; relocants' transfers and living spending left
  out ([trade.md](method/trade.md#remittances-and-relocants-round-7)).
- **Critical-goods marker**: sales to Russia of goods its weapons need, shown as ◆, not in the totals
  ([trade.md](method/trade.md#goods-russias-weapons-need-the-critical-goods-marker-round-7)).
- **Narrower figures**: national statistics for nine countries; the band for imports from Russia re-measured.

Headline effects (% of GDP, develop → round 7): Tajikistan −6.4 → −45.1 (remittances, certainty D), Uzbekistan
−9.5 → −18.1, Hungary −7.6 → −4.5, Slovakia −1.2 → +3.5, Lithuania +22.5 → +27.8, Germany +4.2 → +5.2, Poland
+7.3 → +9.2, Belgium +2.1 → +4.2. Ranges grew a little overall (median width 4.3 → 4.8 points), because fuel valued
at no-war prices makes the amounts larger.

## Round 8

**Narrower ranges for pipeline fuel buyers.** The no-war band for payments to Russia measured on physical fuel
volumes: Germany, Hungary, Slovakia, Czechia, Poland, Finland and North Macedonia get narrower ranges; Hungary's range
no longer crosses zero. Poland's no-war path drops its Yamal gas from 2023 (ended by a 2019 decision): +9.2% → +8.1%
([counterfactual.md](method/counterfactual.md#pipeline-fuel-buyers-round-8)).

## Round 9

**Russian crude in fuel refined elsewhere, measured.** The share of a refined fuel's price that reaches Russia for its
crude is now measured per refiner (India, Türkiye, China, Brunei) and year from Russia's realised crude prices and the
refiners' fuel export prices, instead of one ratio of 0.42 / 0.50 / 0.60 for everything: 0.63–0.82 after the invasion,
about 0.9 before it ([energy-and-laundered-oil.md](method/energy-and-laundered-oil.md#valuing-and-capping)). The buyer is charged the crude money,
the refiner keeps the rest of the price and its discount profit. The higher pre-war share raises the pre-war level too,
so most buyers move little: Australia 0.00 → −0.03, India −5.5 → −5.2, Türkiye −5.0 → −4.9, Tanzania −2.7 → −3.5.

## Round 10

**Trade counts at the seller's net gain.** Aid is a gift and counts in full; trade is an exchange, so a purchase from
Russia now counts at Russia's net gain on it (its taxes plus profit above a normal return: about 0.6 of the price for
oil and gas, 0.1–0.2 for other goods, 0.08 for services, 0.12 for arms), and an extra purchase from Ukraine at
Ukraine's (0.045 in 2023 to 0.18 before the war). The war-time price premium, taxes and profits paid to Russia and aid
still count in full ([overview.md](method/overview.md#the-net-gain-rule-round-10)). Suggested by a reader on Reddit.

**Russian-owned plants abroad.** Metals, mining and chemicals subsidiaries (Rusal's Aughinish in Ireland and KUBAL
in Sweden, NLMK, EuroChem, Uranium One) added to the profits sent to Russia; the amounts are small
([russia-state-and-companies.md](method/russia-state-and-companies.md#russian-owned-companies-abroad)).

**Shareable views.** The address keeps the view and the buttons on top (`#view=rank&lens=ukr&m=total`); flow lines
are on at start; the names of Ukraine and Russia are drawn above the flow lines ([README](README.md)).

Headline effects (% of GDP, round 9 → round 10): Lithuania +27.8 → +14.8, Estonia +23.2 → +9.6, Finland +16.3 → +9.3,
Moldova +22.7 → +5.8, Latvia +11.4 → +4.2, Germany +5.2 → +3.7, Poland +8.1 → +4.1, United Kingdom +3.2 → +1.2,
United States +0.57 → +0.36, Hungary −4.5 → −3.9, Serbia 0.0 → −1.9, India −5.2 → −2.4, Hong Kong −8.3 → −5.0
(gold counts at Russia's gain on gold). The top of the ranking keeps its order; the median range narrows from 4.7 to
1.8 points of GDP.

**Audit fixes (round 10).** A full audit found that the mix of what was bought used current prices, so war-time price
rises moved it and were counted twice; that the expected and actual mixes split fuels differently in 2021; that LNG
used the pipeline-gas gain; that refiners were relieved at a lower gain than their buyers were charged; that the Rosatom
customs correction was taken off at full value; that gold and hidden payments had changed the *To Russia* view; that
fuel refined in China before the war was subtracted twice; and that relabelled Russian products counted at the crude
gain. All are fixed. Shared links: Back keeps the current filters, and invalid values are tidied out of the address.

## Round 11

**Assumptions backed by data.** Judgement values were checked against data and replaced where data exists
([decisions.md](decisions.md#assumptions-backed-by-data-round-11)). Russia's net gain on services and arms now comes
from official sector profits: 0.08 → about 0.04 and 0.12 → about 0.045. Fewer lost sales to Russia count as lost
income. Partners' records of bunkers sold to ships of Liberia, Panama and the Marshall Islands no longer count as their
laundered oil. Refugee costs, remittances, donations and freight margins use budget and statistical figures. EU-level
military aid now counts where Kiel's items say it was spent: Sweden's Gripen and Ukraine's own drones, not French or
German industry. In the cost view, loans cost the lender 26% of face (was 30%) and waived duties about 0.2% (was 4%).

Headline effects (% of GDP, round 10 → round 11): Hong Kong −5.0 → −4.3, Estonia +9.6 → +9.3, Lithuania +14.8 → +14.6,
Finland +9.3 → +9.1, Belarus −17.8 → −17.6, Tajikistan −38.0 → −38.2, Malta +0.6 → +0.9, Hungary −3.9 → −4.1,
Latvia +4.2 → +4.0. Moldova stays at +5.8. Germany, Poland, the United States, the United Kingdom, France, Italy and
Sweden move by less than 0.03 points. The median range stays at about 1.9 points of GDP.

## Round 11 audit

**Traceability, 19 October 2026.** An audit checked whether every number can be traced to a source or a written
decision. It found 41 problems (11 high, 20 medium, 10 low). **No number on the map changed**: the totals and ranges of
every country are the same before and after (checked with the site's own `calc()`). What changed:

- **Stale text corrected.** The worked example in the documentation (Poland is now +4.1%, not +10.0%), the counterfactual
  effect table, the limitations, the ranges page and the oil discount figures use the current build. The site no longer
  says that money flowing back and lost sales count at "about 20%" profit: they count at the value kept in the economy ×
  the share that is genuinely extra (US weapons 63%). It now says that trade with Ukraine is held at the 2021 level, and
  the Russia panel names the real drivers (migrants' wages, North Korea's weapons) instead of trade hubs. All six
  translations follow.
- **Sources attached where they produce the number.** The money-rule factors (`value_kept`) and Russia's net gain
  (`net_gain_russia`) are now cited on every part they weight; gas prices and tanker control on the parts they feed.
  Sources of steps the all-money ledger replaced (CSIS, the assumed and modelled own-industry shares, PURL, the EU arms
  split, arms bought abroad, the first military-support estimates) are no longer shown, because they no longer produce a
  number. The sanctions, arms and blocked-loan notes in each panel now have a source footnote. Russia's Finance Ministry
  link uses the working Russian address.
- **Decisions and constants written down.** Eleven missing decisions and every untraced constant in the code are in
  [decisions.md](decisions.md#constants-and-rules-written-down-in-round-11), each labelled data or judgement. Values that
  look wrong (for example China's crude-to-fuel ratio of 0.70) are listed as proposals, not changed.
- **Claims softened.** The 10% loan discount rate is a judgement, not "the IMF/OECD convention" (the IMF uses 5%). The 2026
  Hormuz decision is cited. The services and arms net-gain shares are now data, not judgement.
- **Certainty letters.** A refugee grade such as "A-B" now counts at its weaker letter, and Poland's refugee cost is at
  most C, because it was checked only against a press article. Czechia A → B; Germany, Lithuania, Poland B → C. No
  total's letter changes.
- **Clean-up.** The AI-guessed incentive scores are no longer in `data.json`, and their dead code is gone. Research and
  pipeline reference pages list the round-11 files, `detail.json` and the new build steps.

## Round 12: data precision

**Measured values for six judgements, 19 October 2026.** The round-11 audit listed values that were judgements or not
traced. Round 12 replaced six of them with measured ones, one at a time, recording each change's effect with the site's
own `calc()` ([decisions](decisions.md#applied-in-round-12-data-precision), [decision log](decision-log.md#round-12-data-precision-19-october)).

- **Loans** ([loans](method/loans.md), new page). The gift in a loan is now cheaper interest, discounted at Ukraine's
  2021 bond rate (6.7%), plus the default risk the lender really carries: the measured expected loss of its creditor
  class (IMF and World Bank 0, EU 9%, the bilateral standstill for G7 and Paris Club lenders, about 95% for the 2026
  Support Loan). The high end uses the promised war yield of the year of payout (38% in 2022, 40% in 2023, 24%, 17% and
  15% after), measured from 72 weekly ICU price reports and 106 weekly Eavex yield tables. It was a flat 10%. Loans now
  count EUR 53bn (42–85) of 96.5bn face, instead of 64bn (40–77). New script:
  [`pipeline/loan_rates.py`](../pipeline/loan_rates.py); raw downloads in
  [`raw/loan_rates`](../research/2026-10/raw/loan_rates/).
- **Loans in the cost view**: each loan item's cost to its lender, with the same terms and losses at the lender's own
  funding rate, and each country's own low and high (`loans_grant_eq_lo`, `loans_grant_eq_hi`). It was 26% of face,
  with a half-to-one-and-a-half band. Japan's IBRD guarantees now cost it almost nothing; EU members carry more.
- **China's crude-to-fuel ratio**: China's own measured share per year (0.72–0.82), was 0.70. What is taken off China's payments for the crude in its fuel exports now equals that crude's value (China −0.005 points).
- **Germany's gas already in customs**: 0.14 (2021) and 0.15 (2022), derived from the audit's EUR 2.3bn and 3.5bn, was 0.07.
- **Belarus's gas price band**: ±8% (2023–2025) and ±15% (2026) from the research, was ±2%.
- **Hong Kong's precious-metals share**: 1.0, measured from UN Comtrade, was 0.98 (not traced).

Headline effects (% of GDP, round 11 → round 12): Hong Kong −4.29 → −4.20, Germany +3.71 → +3.64, Japan +0.48 → +0.42,
Sweden +2.98 → +2.92, Finland +9.06 → +9.00, France +1.60 → +1.55, Spain +1.13 → +1.08, Italy +2.00 → +1.95, Canada
+0.47 → +0.43, the UK +1.15 → +1.12. The US, Türkiye, India, China, Belarus, the UAE and Australia move by less than 0.01
points. Cost view: Finland +0.07, France and Italy +0.06, Germany +0.05; Japan −0.07, Canada −0.04, the UK −0.03.

- **Decision B: the EU's own provisioning rate per loan** (the owner's choice). Each EU loan's central expected loss is
  now the provisioning rate the EU set for it in its legal text: 70% for the exceptional MFA of 2022 (EUR 1bn and 5bn,
  Decisions 2022/1201 and 2022/1628) and the EUR 1.59bn of repurposed EIB ELM loans (2022/1628); 9% for the emergency
  MFA (2022/313, under Regulation 2021/947). MFA+ (2022/2463) and the Ukraine Facility (2024/792) set no provisioning
  rate, because they rest on budget headroom, so the usual 9% is kept. The low (0) and the high (the war yield) do not
  change. EU-level loans are worth EUR 49.4bn to Ukraine instead of 47.3bn, all loans 55bn instead of 53bn (lender's
  cost 34bn instead of 30bn). All 27 EU members move toward Ukraine by 0.007 to 0.014 points (Finland and France
  +0.014); in the cost view by 0.013 to 0.026 ([loans](method/loans.md#by-loan-type)).
- **Trace by money flow** ([trace](trace.md), new page). Every part on the map is grouped into one of 26 money flows.
  Each flow has one entry: what it is, the method section, the decisions behind it, its sources with their exact links,
  the research files and raw data, the code, and which values are data or judgement. The map has a new **Sources** view
  with the same groups, and a § link next to each part in a country's panel opens its flow
  (`#view=sources&flow=loans`). No number changes.
- **North Korea's primary source**: the Multilateral Sanctions Monitoring Team's report MSMT/2025/1 (29 May 2025, UN
  document S/2025/340) is now read and linked as a primary source of `military_rus_r6`. It confirms the volumes (rounds,
  containers, missiles, artillery, troops) but gives no prices, so the certainty stays C and no number changes
  ([comparison](../research/2026-10/gaps/military_rus_r6-notes.md#checked-against-the-primary-report-round-12)).
- **Why each money flow is counted** ([decisions](decisions.md#why-each-money-flow-is-counted)). The nine flows with
  no written reason (undisclosed aid, energy switching cost and oil discount, services, shipping, company exits,
  remittances, Rosatom and state loans, arms bought from Russia, payment agents) now have one, taken from what was said
  when each was added. Choices with no reason on record are marked "reason not recorded". The decision log gains rows
  for undisclosed aid, the switching cost and oil discount, services and arms bought from Russia. No number changes.

## Round 13

**One rule, two numbers, 19 October 2026** (an independent economist and journalist audit, all fixes approved by the owner; [decisions](decisions.md#round-13-one-valuation-rule-for-every-seller), [decision log](decision-log.md#round-13-one-rule-two-numbers-19-october)). Each step was made on its own; net % of a year's GDP:

1. **Fuel-mix bug**: the volume of all payments now uses 2019–2021 prices. Hungary −4.09 → −5.53, Mongolia −4.68 → −6.53, Slovakia +1.33 → −0.07, Belarus −17.55 → −18.48, Libya −6.45 → −7.34, Türkiye −3.30 → −3.91, India −2.32 → −2.83. New check in `check_data.py`.
2. **Gold deflator**: Hong Kong −4.20 → −1.90; small changes for China, Oman, Switzerland.
3. **Text**: MSMT troop figures (11,000 + 3,000), "Aid to Ukraine (Kiel, adjusted ...)" with Kiel's own figure in the panel, Yemen's 2023 price index (−9.64 → −7.80, applied in step 12).
4. **One valuation rule** (OECD STAN net gain × genuinely extra; [`net_gain_sellers.json`](../research/2026-10/gaps/net_gain_sellers.json)): Belarus −18.48 → −5.55, Kyrgyzstan −16.71 → −6.09, Armenia −10.11 → −2.42, Cyprus +6.12 → −0.30, Georgia −7.22 → −2.31, Uzbekistan −18.12 → −15.13, Montenegro +4.60 → +2.24, Lithuania 14.45 → 12.69, Estonia 9.01 → 7.33, China −1.56 → −1.05, the US +0.36 → +0.48.
5. **Remittances** at the migrant's net gain ([`remittances_r13.json`](../research/2026-10/gaps/remittances_r13.json)): Kyrgyzstan −6.09 → −7.48, Tajikistan −38.28 → −39.63, Moldova +6.11 → +5.38, Uzbekistan −15.13 → −14.50. Replaced in [round 13b](#round-13b): remittances are now a marker, in no total.
6. **Weapons to Russia, paid or unpaid** ([`military_payment_r13.json`](../research/2026-10/gaps/military_payment_r13.json)): North Korea −29.95 → −10.16, Iran −0.79 → −0.01.
7. **EU refiners** charged to their buyers: Lithuania 12.69 → 10.15, the Netherlands 5.56 → 4.62, Finland 7.78 → 7.17, Greece −0.65.
8. **Laundered oil in volumes, both ways**: Togo +6.82, Latvia +2.71, Moldova +2.38, Estonia +2.22, Libya +1.65, Tunisia +1.60; Nepal −1.61 → −1.80. Togo's credit was a data gap, removed in [round 13b](#round-13b).
9. **Two headline numbers** everywhere (map, panel, ranking, share cards, table and downloads, How it works), with gas Russia cut off itself labelled. No number changes.
10. **Certainty and ranges**: stacked models at best C (parts at B 665 → 84); correlated errors; a method band in the panel; PhosAgro's margins fetched (Russia's 2023 fertiliser gain 0.20 → 0.27). The windfall at Russia's net gain (step 12) came in this build: Japan +0.02, Spain +0.05, Belgium +0.09.
11. **Units**: "2022–2026 total as % of one year's GDP (2024), not a yearly rate" on the map, with an average-year line in the panel.
12. **Other findings**: Yemen's price index (Yemen −9.64 → −7.80); extra purchases from and sales to Ukraine summed with their signs; exact source links; the round-6 value-kept scripts in [`research/2026-10/scripts/`](../research/2026-10/scripts/value_kept/); the audit's loan critique recorded.

All steps together (base → round 13): Lithuania 14.55 → 10.50, Finland 9.02 → 7.26, Estonia 9.25 → 9.57, the Netherlands 6.35 → 4.88, Germany 3.65 → 3.25, Poland 4.06 → 3.62, the US 0.36 → 0.48, Hungary −4.09 → −5.30, Slovakia +1.33 → −0.24, Hong Kong −4.20 → −2.35, China −1.56 → −1.03, North Korea −29.98 → −10.16, Belarus −17.55 → −5.63, Tajikistan −38.20 → −39.61, Uzbekistan −17.87 → −14.46.

## Round 13b

**Remittances as a marker; laundered oil only where both routes are measured, 19 October 2026** (two owner decisions
after the round-13 report, both raised by the audit; [decisions](decisions.md#round-13b-remittances-as-a-marker-laundered-oil-routes),
[decision log](decision-log.md#round-13-one-rule-two-numbers-19-october)). Net % of a year's GDP:

1. **Remittances out of the totals, shown as a marker** (△ in the panel, map layer "Wages from Russia", columns marked
   "not in totals" in the table, CSV and JSON): no longer in the net, the cost view, either headline number, the method
   band or the share cards. Reverses the owner's round-7 decision: individuals' wages, not a country's choice; the
   money flows from Russia to the migrant's home; the real gain over the alternatives is small and hard to measure; they
   dominated the bottom of the ranking ([trade](method/trade.md#remittances-and-relocants-round-7)). Tajikistan −39.61 →
   −0.81, Uzbekistan −14.46 → −6.11, Kyrgyzstan −7.48 → −4.94, Armenia −2.91 → −1.62, Belarus −5.63 → −4.96, Moldova
   +7.96 → +7.77. The marker for Tajikistan: +70% of GDP since 2022 (+EUR 9.4bn against the expected level).
2. **Laundered oil through EU refiners counted only where both routes are measured**: where the route that replaced
   EU-refined fuel after the EU ban is not in the post-war records for a buyer, its 2023–2026 values are held at the
   expected level and labelled "route not measured after 2022" ([energy](method/energy-and-laundered-oil.md#eu-refined-fuel-measured-both-ways-round-13b)).
   Togo +6.61 → −0.05 (was 5th in the ranking; its range now crosses zero), Marshall Islands +6.17 → +0.91, Gibraltar
   +2.88 → −0.10, Tunisia −5.51 → −7.09, Georgia −1.11 → −2.48, Aruba +0.96 → −0.33, North Macedonia −0.78 → −1.53,
   Albania +0.84 → +0.17, Montenegro +2.67 → +2.12; no EU member moves. Two new checks in `check_data.py`.

Ranking (GDP at least EUR 5bn, range not crossing zero): Lithuania +10.50, Estonia +9.57, Moldova +7.77, Finland +7.26,
Latvia +5.52 at the top; North Korea −10.16, Yemen −7.86, Tunisia −7.09, Uzbekistan −6.15, Hungary −5.30 at the
bottom. Togo, Tajikistan, Montenegro and Argentina left the ranking (their ranges cross zero).

## Round 14

**Independent audit 3, 19 October 2026** (every change raised by the audit and approved by the owner;
[decisions](decisions.md#round-14-independent-audit-3), [decision log](decision-log.md#round-14-independent-audit-3-19-october)).
Steps in the order applied, net % of a year's GDP, each step alone:

1. **C1, measured fuel share** in Russia's gain on what was bought: Yemen −7.86 → −4.06, Moldova 7.77 → 6.06, Libya
   −5.20 → −3.72, Nigeria 1.51 → 1.06, Brunei −1.27 → +1.75 ([prices](method/prices.md#the-mix-of-what-was-bought-round-14)).
2. **C2, customs values for what was bought**, tracker tonnes only to split fuels, copied tracker years flagged:
   Uzbekistan −6.32 → −3.16, Belarus −5.00 → −2.02, Tunisia −7.54 → −5.06, Libya −3.72 → −6.63, Yemen −4.06 → −6.87,
   Armenia −1.65 → +0.36.
3. **C3, FOB on both sides**: the freight surge out of customs values: India −2.92 → −2.29, Türkiye −2.90 → −2.51,
   Tunisia +0.39, Bulgaria +0.43, China −0.75 → −0.65 ([prices](method/prices.md#one-price-basis-fob-round-14)).
4. **H2, laundered-oil growth on its own base, fuel price screen, Nigeria labelled**: Lebanon 3.71 → 2.73, Libya
   −6.18 → −7.08, Nigeria 1.32 → 0.68, Malta 1.43 → 1.04, Belgium 3.49 → 3.14.
5. **H3, hubs pass EU-refined fuel on**: Belgium 3.14 → 2.81, Malta 1.04 → 0.75, Nigeria 0.68 → 0.89.
6. **M2, normal return 5% real after tax + country risk premium, services without real estate**: Cyprus 0.39 → 0.79,
   Belarus −2.02 → −2.40, Lithuania +0.10; US weapons flowback 2.2% → 3.6% of the money flowing back.
7. **M5, current euros** for every trade part: Lithuania 10.67 → 11.91, Estonia 9.99 → 11.17, Moldova 5.97 → 6.98,
   Hong Kong −2.34 → −4.16 (its gold at today's gold price).
8. **M4, seizures counted** ("Seized by Russia"): Austria 0.26 → −0.43, Finland 8.16 → 7.54, Ireland 1.42 → 0.93,
   Germany 3.45 → 3.23.
9. **M6** frozen reserves on their own line; **H5** cut label completed (labels only); **M3** sign-aware correlations
   (ranges only); **H4** method band with nine alternatives, range wording and grades by primary-data share; **C4**
   share cards and texts; **H1** flowback text; **M1** fairness note; **L1–L5** docs, legend, notes and sources.

Combined, round 13 → round 14 (ranking: GDP at least EUR 5bn, range not crossing zero): Lithuania +10.50 → +11.91,
Estonia +9.57 → +11.17, Finland +7.26 → +7.54, Moldova +7.77 → +6.98, Latvia +5.52 → +5.49, the Netherlands +4.88 →
+4.80, Poland +3.62 → +4.08, Denmark +4.05 → +3.88, Germany +3.25 → +3.23, Belgium +3.15 → +2.69, the US +0.48 →
+0.48; at the bottom North Korea −10.16 → −10.29, Libya −5.20 → −7.03, Yemen −7.86 → −6.86, Hungary −5.30 → −5.31,
Tunisia −7.09 → −4.92, Hong Kong −2.36 → −4.16, Uzbekistan −6.15 → −3.53, India −2.74 → −2.38, China −1.03 → −0.72.
Nigeria (+0.93, range +0.14 to +1.75), Malta and Ireland leave the top 20; Montenegro, Britain and Portugal enter it. Totals' letters: 1 A, 5 B, 209 C, 16 D (were 208 D, 23 C). Four new checks in
`check_data.py` (22 measured fuel share, 23 FOB price basis, 24 share-card qualifier; check 19 adapted to customs).

## Round 14b

**Two owner changes, 19 October 2026** ([decisions](decisions.md#round-14b-taken-by-russia-not-in-the-totals),
[decision log](decision-log.md#round-14b-taken-by-russia-and-one-normal-return-19-october)). Net % of a year's GDP,
each step alone:

1. **Taken by Russia, not in the totals.** Seizures (round 14, M4) and forced exit costs (round 5: the forced discount
   and the exit fee paid to Russia's budget) leave the net shift and both headline numbers and count in the cost view
   as a sacrifice ("Seized by Russia (companies' assets)"; "Forced sales: discount and exit fee taken by Russia").
   The panel says "Russia took €X from companies of this country (seizures and forced sales); not in the totals,
   counted as a cost carried"; the table, CSV and JSON have a "not in totals" column; the map has a square marker
   (layer "Taken by Russia") where it is at least 0.1% of GDP. New check 25. Net: Finland 7.54 → 8.43, Austria −0.43 →
   +0.29, Ireland 0.93 → 1.47, Denmark 3.88 → 4.40, Norway 3.06 → 3.43, the Netherlands 4.80 → 5.16, Germany 3.23 →
   3.50, France 1.33 → 1.56, the UK 1.27 → 1.50. Cost view: Finland 3.23 → 4.11, Austria 0.71 → 1.43, Ireland 1.22 →
   1.76, Germany 2.46 → 2.73 ([Russia's state and companies](method/russia-state-and-companies.md#round-14b-taken-by-russia-not-in-the-totals)).
2. **Russia's and Ukraine's normal return.** Both files now subtract 5% real (4–6%) + the country risk premium (Russia
   3.90%, Ukraine 15.54%), on book capital as a nominal USD rate: Russia 11.4% (was 9%), Ukraine 23.0% (was 8.2% after
   tax). Capital per unit of revenue is measured per group (Rosneft, Novatek, PhosAgro, Nornickel, Kernel, Astarta,
   Ferrexpo, Rosstat, Ukrstat, Damodaran's emerging-market industries). Russia's crude gain 2023 0.64 → 0.57, non-fuel
   average 2024 0.118 → 0.103; Ukraine's export average 2024 0.069 → 0.036. Net: Estonia 11.17 → 9.90, Lithuania 12.09
   → 10.98, Moldova 6.98 → 5.99, Libya −7.03 → −6.16, Yemen −6.86 → −6.11, Finland 8.43 → 7.76, Tunisia −4.92 →
   −4.26, Latvia 5.49 → 4.94, Poland 4.11 → 3.74, India −2.38 → −2.08. Estonia's and Lithuania's moves come from Russia's lower gain shares on what they stopped buying from Russia, not from Ukraine's normal return (corrected in round 15) ([net_gain_russia-notes](../research/2026-10/gaps/net_gain_russia-notes.md),
   [net_gain_ukraine-notes](../research/2026-10/gaps/net_gain_ukraine-notes.md)).

Combined, round 14 → round 14b: Lithuania +11.91 → +10.98, Estonia +11.17 → +9.90, Finland +7.54 → +7.76, Moldova
+6.98 → +5.99, Latvia +5.49 → +4.94, Denmark +3.88 → +4.32, Poland +4.08 → +3.74, Germany +3.23 → +3.34, Austria
−0.43 → +0.20, Ireland +0.93 → +1.45, the US +0.48 → +0.49; at the bottom North Korea −10.29 → −10.28, Libya −7.03 →
−6.16, Yemen −6.86 → −6.11, Hungary −5.31 → −5.33, Tunisia −4.92 → −4.26, India −2.38 → −2.08. Ireland enters the
top 20, Portugal leaves it. Totals' letters: 1 A, 6 B, 205 C, 19 D.

## Round 15

Review 4 (economist and data journalist), approved by the owner; two points raised by the owner. Decisions:
[decisions](decisions.md#round-15-separate-maps-named-lists-and-comparable-numbers),
[log](decision-log.md#round-15-separate-maps-named-lists-and-a-stricter-ranking-19-october).

1. **Docs brought up to date** (H4): Poland's reading guide, the limitations table, the overview's units (current
   euros since round 14) and every round-15 figure; headline figures in the docs now carry a tag
   (`<!-- n:POL.ua -->`) and `pipeline/check_docs_numbers.py` (run by `check_data.py`) fails when one differs from
   `data.json`. The text claiming Estonia's and Lithuania's round-14b move came from Ukraine's normal return is
   corrected: it came from Russia's lower gain shares.
2. **Average 2022–2024 GDP** as the denominator (M1; `gdp_avg_r15.json`, World Bank WDI and IMF WEO fetched
   19 October 2026): Nigeria +0.81 → +0.44, Kyrgyzstan −5.68 → −6.75, Yemen −6.11 → −5.13, Norway's support
   +2.96 → +2.71; most European figures rise by 4–12% (Lithuania's net +10.98 → +11.80).
3. **Power of Siberia** (M2): China's no-war path includes the contracted ramp-up; China −0.66 → −0.63.
4. **Ukraine's country risk premium per year** (January 2022–2026 Damodaran tables): below 0.02 points everywhere.
5. **Refugees** (M5 and the owner): one all-government definition (Poland's support +1.11 → +1.95, Germany's
   +1.81 → +1.70); Belarus's hosting moved to a label (support +0.16 → 0); Russia never credited (check 26); the
   unverified Poland and Czechia snippets removed from `kiel.json`.
6. **Three maps** (C1): support for Ukraine is the default; the change in payments to Russia a second map with the
   world total (EUR 358.8bn less paid by buyers who cut, 226.7bn more by others); the net a third with a warning.
   Hash `lens=support|payments|net`; `lens=change` opens the net. Table, CSV and JSON put support first, each number
   with its letter and a direction flag.
7. **Russia panel** (C2): "Paid Russia more than before the war" and "Armed Russia" (full military value).
8. **Words** (H2, L2, L3): the main part named on cards, OG text, share text and panel when it is more than half of
   the number (Hungary: "mostly the 2022 war-time price spike (€9.9bn of €11.6bn; its volumes barely changed)";
   Belgium: the frozen-reserve return; Moldova: gas Russia cut off; Nigeria: structural); every shared figure says
   "in total since 2022 (about X a year)". Share cards regenerated.
9. **Method band, ranking and grades** (H3): six more alternatives, a band for each number, the sign rule for every
   ranking (check 29), the new letters. Hormuz note and "2026 at 2025 prices" (owner, M4).

Combined, round 14b → round 15 (support for Ukraine; net): Denmark +3.40 → +3.49; +4.32 → +4.44, Norway +2.96 →
+2.71; +3.37 → +3.09, the Netherlands +2.02 → +2.15; +4.76 → +5.06, Poland +0.98 → +1.95; +3.74 → +5.06, Germany
+1.75 → +1.70; +3.34 → +3.35, the US +0.34 → +0.35; +0.49 → +0.52, Lithuania +1.71 → +1.84; +10.98 → +11.80,
Estonia +1.99 → +2.07; +9.90 → +10.33; at the other end Hungary −5.33 → −5.77, Libya −6.16 → −6.54, Yemen −6.11 →
−5.13, India −2.08 → −2.21, China −0.66 → −0.63, Nigeria +0.81 → +0.44, Belarus −2.52 → −2.78 (net).

Then, at the owner's request (the net first, then its two parts; [decisions](decisions.md#round-15-the-net-first-then-its-two-parts)):

10. **Four views, the net first**: "Net (the sum)" is the default map, ranking, top lists, share-card headline and
    OG text, always with its warning; then "Support for Ukraine", "Change in payments to Russia" (with the world
    total) and "Cost to the country". The table puts the net first; the CSV and JSON columns are unchanged. Share
    cards and pages regenerated: they lead with the net and still show both parts and the main-part qualifiers.
11. **The gross views "To Ukraine" and "To Russia" removed** (buttons, code paths, colours and rankings): they
    include normal trade and measure something different. The gross flows stay in the panel's small charts, the
    table and downloads and the flow lines. Old links: `lens=ukr` opens support for Ukraine, `lens=rus` the change in
    payments to Russia, `lens=change` the net; an address without `lens` opens the net (check 31).
12. **"Cost carried" renamed "Cost to the country"** on the site, in the panel, How it works and the docs, with one
    line where it is explained: "what it cost the country itself, after gains such as cheaper Russian oil or business
    won back". All six translations updated; strings only the removed views used are gone. No number changed.

## Round 16

Review 5 (economist and data journalist), approved by the owner; the owner kept the net as the default view and
ranking. Decisions: [decisions](decisions.md#round-16-review-5), [log](decision-log.md#round-16-review-5-20-october).
Steps, in the order applied, with the main movers (% of a year's GDP, 2022 to August 2026):

1. **Bands, rankings and grades in the browser** (C2): `detail.json` (the method band's alternatives) loads with the
   data, before anything is drawn; caches fill only after it. New real-browser check `pipeline/browser_check.mjs`
   (check 32): the page's bands, "direction uncertain" flags, grades, Ranking view and map dots must match the Node
   model. On the round-15 code it finds 115 mismatches (Nepal's payments band −1.67 to −1.55 instead of −1.84 to
   +0.05; net ranked 61 countries instead of 59, payments 56 instead of 53). No number changed.
2. **Refugee scope factor in 2022 only** (H1): Poland support +1.95 → +1.34, net +5.06 → +4.44; Germany +1.70 →
   +1.58, net +3.35 → +3.23.
3. **The pre-round-13 valuation rule leaves the method band** (H5): support "direction uncertain" 100 → 95
   (Bulgaria, Czechia, India, Kuwait, Nigeria ranked again). No central value moved.
4. **Redirected trade on both sides** (H6): the alternative scales "less paid" by 0.70 and "more paid" by 0.50, so
   the world total stays the world's net change. Bands only.
5. **Wording**: the world totals are Russia's net gain ("from buyers who cut −€355bn; from buyers who bought more
   +€215bn"), not payments.
6. **EU-level aid text** (L1): the European Peace Facility is not in it, and why; the text shows the bar's figure
   (Lithuania €211m, not €294m) with the face value beside it.
7. **Grades and metadata** (L4, L2): adjusted aid graded by its adjusted share (Estonia, Latvia support B → C);
   status lines on four superseded research files.
8. **Colour scale** (L3): economies under EUR 5bn GDP are clamped to the lightest step of their direction.
9. (The net stays the default and ranked: the owner's decision.)
10. **"Russia's gain from this country rose"**, with each entry's main cause; arms suppliers on "Armed Russia" only.
11. **Russian money frozen on its own line**, in the net only (H4): Belgium payments +1.86 → +0.62 (net unchanged
    +2.81), France +0.86 → +0.68, Luxembourg +0.77 → +0.61; payments for Belgium, Italy and Spain become direction
    uncertain.
12. **One common cost per refugee** in the method band (H2). Bands only.
13. **Refugee spending flowing back** (M3): 2.7% of hosting cost; Poland support −0.06, Netherlands −0.04, Montenegro
    −0.05, Ireland −0.02.
14. **Small flows from the 2019–2021 average** (M2; 148 flows under EUR 1bn a year; corrected in round 16b below):
    Cameroon +0.80 → +0.36 (direction uncertain), Brunei +2.35 → +5.04 (an artefact: the "average" was 2021 at 2021
    prices for 28 flows, check 16 B1), Syria −0.92 → −1.87, Burkina Faso −3.55 → −2.79, Afghanistan −1.53 → −0.96,
    Malta +0.28 → +0.79, Senegal −1.82 → −2.26, Bosnia +0.55 → +0.16, Tajikistan −0.38 → −0.76, Latvia +3.54 → +3.22,
    Libya −6.54 → −6.79, Yemen −5.13 → −4.86 (payments); 70 economies of at least EUR 5bn moved by 0.02 points or more.
15. **Hong Kong's gold** (M1, M6): Hong Kong −4.30 → −1.59 (direction uncertain), Thailand +0.42 → +0.10, UAE
    −0.72 → −0.84, Singapore −0.29 → −0.36, United Kingdom +0.88 → +0.83 (payments).
16. **"Required by sanctions" from actual stop dates** (M4; label only): Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%), Finland 71% → 27%,
    Poland 76% → 38%, Germany 49% → 30%.
17. **Share text and cards** (M5): ranges and "in total since 2022" in the share text and OG descriptions; the
    card's range and warning in large dark type. Cards regenerated.

All six translations updated. Combined, round 15 → round 16 (support for Ukraine; change in payments to Russia;
net): Poland +1.95 → +1.28; +3.11 → +3.03; +5.06 → +4.39, Germany +1.70 → +1.57; +1.65 → +1.57; +3.35 → +3.22,
Belgium +0.94; +1.86 → +0.62; +2.81, Lithuania +1.84; +9.96 → +9.89; +11.80, Hong Kong −4.27 → −1.59 (both),
Cameroon +0.80 → +0.36, Latvia net +5.19 → +4.87. Among economies of at least EUR 5bn: 103 moved by 0.02 points or
more; direction uncertain on support 96, on payments 123 and on the net 114 (round 15: 100, 110, 104).

## Round 16b

Check 16 (economist and data journalist, 20 October 2026), approved by the owner. Decisions:
[decisions](decisions.md#round-16b-fixes-after-check-16), [log](decision-log.md#round-16b-check-16-20-october). Movers
are % of a year's GDP, 2022 to August 2026, round 16 → round 16b.

1. **Small-flow baseline** (B1, N1): the median of 2019, 2020 and 2021 at 2019–2021 prices, computed from the yearly
   series (`small_flow_base()`, `to_rus.base_years`), instead of a field that for 28 flows held 2021 at 2021 prices.
   Exceptions keep 2021: Brunei (Hengyi refinery from November 2019) and New Zealand (Marsden Point closed March 2022)
   in `SMALL_FLOW_EXCLUDE`; Syria (mirror-only, confidential pre-war data) in `SMALL_FLOW_MIRROR`, labelled in the
   panel; Mauritania and Botswana (single researched values); Lebanon keeps its researched level. 140 flows use the
   median. New check 36. Payments: Brunei +5.04 → +2.35 (direction uncertain), Marshall Islands +3.01 → +0.59,
   Syria −1.87 → −0.92, Curaçao +0.84 → −0.02, Gibraltar +0.70 → −0.08, Faroe Islands +0.31 → −0.22, Malta +0.79 →
   +0.28, New Zealand +0.27 → +0.02, Slovenia −0.01 → −0.19, Cameroon +0.36 → +0.19, Israel +0.13 → −0.03, Latvia
   +3.22 → +3.07, Yemen −4.86 → −4.72, Togo −0.78 → −0.63, Afghanistan −0.96 → −0.82, Libya −6.79 → −6.93, Senegal
   −2.26 → −2.39, Tajikistan −0.76 → −0.87. 60 economies moved by 0.02 points or more on a headline number, all
   through this step except Ireland's support (step 5).
2. **Colours of small economies** (B2): the lightest colour of their direction (`colors[3]` or `colors[5]`), no
   longer the neutral colour for negatives (check 16 counted 22 on the net map and 23 on payments: Tuvalu, Palau,
   Bhutan, Djibouti...). The browser check asserts it for those four.
3. **Site text** (N2, N10): the panel's "Pre-war level" and How it works describe the small-flow rule; the net map's
   legend title names Russian money frozen. All six languages.
4. **Share text and cards** (N3): "about 0" where both ends of a range round to zero. Cards regenerated.
5. **Refugee spending flowing back** (N4): retail (G47), accommodation and food (I) and rent without imputed rent
   (L less L68A), from OECD STAN; Poland's factor 8.2% → 7.3% (support +1.28 → +1.29), Germany 1.7% → 2.2%, the
   Netherlands 3.7% → 3.0%; 2.7% overall.
6. **Gold at its actual price** (N5) in the method band; the gold docs no longer claim the war caused no measurable
   share of the gold price rise.
7. **Poland's pipeline crude cut off by Russia** (N6; label): 38% required, 50% cut off by Russia, 12% own choice
   (was 38%, 18%, 43%); the "without what Russia cut off itself" band takes the crude out too (Poland's payments
   band 2.14 → 1.56 at the low end). Finland's last cargo (20 July 2022) confirmed on Neste's page.
8. **`detail.json` failure** (N7): the page draws without the rebuilt alternatives and says so, instead of failing.


## Round 17

**Redesign: the map first (option B), 20 October 2026.** The owner chose option B of the first-view prototypes, with
the country panel and highlights of prototype v2 and the "what's counted" switches of concept 2. Decisions:
[decisions](decisions.md#round-17-redesign), [log](decision-log.md#round-17-redesign-the-map-first-20-october).
**No number changed**: `calc()` with every part counted is the same code, and the model's output for all 231 entries
is byte-identical before and after (check 32 still matches the browser with Node).

1. **The first view**: the map fills the screen; on top only the research-preview banner as one slim line, one header
   line with an ⓘ popover, a one-row legend ("More" opens the steps and keys) and two buttons, Highlights and Filters.
   The control bar, the map title box, the hint and the zoom buttons are gone from the first view (zoom is in Filters).
2. **The Filters drawer**, collapsed by default, holds everything that was in the bar, plus region, group and size
   filters (shared by the map, the drawer's ranking and the Ranking, bubbles and table views), "€ to Ukraine" and
   "Change in € to Russia", the rankings and top lists, the pages, the map layers, theme and language. A dot on the
   button shows a change from the default.
3. **One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change. "Direction uncertain" is grey
   without dots; support below zero, the net of a country that mainly earned from the war effort, and a gain in the
   cost view are grey (gold and the gold outline are gone); money flowing back is grey in the panel's bars.
4. **"Kept from Russia"**, positive when the country paid Russia less than without the war, in every text, list,
   download (`kept_from_russia_*` columns, a `kept_from_russia` object in the JSON, a `figures` column), share text,
   card and OG description, and in all six languages; sentences say "paid Russia X less (or more) than without the
   war". `lens=kept` opens the view. Check 31 now also checks the closed drawer, the two buttons and that no page text
   says "change in payments to Russia".
5. **Money streams** replace the gross flow lines as the default layer: blue to Kyiv sized by support for Ukraine in
   €, orange to Moscow sized by how much more the country paid Russia than without the war in €, the map's own numbers;
   the 12 largest each way; a country's own streams on hover or when picked; static arrows with reduced motion; off by
   default on phones. The gross flow lines remain in Filters as "Gross trade flows", off by default. The map markers
   (critical goods, wages from Russia, taken by Russia) are off by default too.
6. **What's counted**: 16 switches in the drawer, with world totals. Every number recomputes; a yellow "Custom mix, not
   the official figures" note with "Reset to the official numbers" shows wherever numbers do; custom mixes cannot be
   shared and downloads name the parts switched off.
7. **Highlights**: seven chips from prototype v2, worked out from the data, each with a fact card and its caveat;
   `#hl=…` links to one.
8. **The country panel**: headline sentence, total with range and certainty in words, the two parts in words, "What
   changes the meaning here", the five biggest parts and all parts, each opening its method in place (how, why with
   its decisions, this country's sources, method page, trace); everything else behind "Show more".
9. **Sources view**: the method in four lines and how decisions are made on top; how and why for each flow.
10. **Hover card**: two bars in words (support for Ukraine and kept from Russia), the net with its range, and the
    orange caveat for orange countries ("mostly fuel buying, not siding with Russia"; weapons and troops, or sales to
    Russia, where those are the main part).
11. **Share cards and pages regenerated** (`pipeline/share_cards.mjs`) with the new name, the sign in words and the
    one colour rule; check 24 passes on all 231 pages.
12. **Too close to call is faded, not grey** (owner): a number whose likely range or method band crosses zero takes the
    colour of its leaning direction mixed halfway toward the neutral grey, on the map, in the hover card's bars and in
    the panel's big number; no dots, no outline; still not ranked and without a stream. Grey is now only no clear
    change and the net of a country that mainly earned from the war effort. Legend, ⓘ and the panel's note say so in
    all six languages; check 32 expects the faded colour. 61 countries on the default map change from grey to faded.
13. **The Filters drawer in seven calm sections** (owner): the map shows and measure, find a country, what's counted
    (folded), where and when, map layers, rankings and top lists, display; on/off switches, full-width segmented
    controls, a sticky header and a bottom sheet on phones. No control removed.
14. **The country panel, each number once** (owner): header with a lead in words and the net with its range; the two
    parts once, with value, range and grade; at most four notes; the five biggest parts and the other parts; then
    folded sections for cost, method band, markers, sanctions or own choice, per year, aid and companies, share and
    sources. The net had appeared four times, each part up to six times; the duplicates are gone.

**Not ported from the prototypes**: the bivariate map (replaced by the one colour rule), concept 2's workbench layout,
v2's separate Rankings page (the Ranking view and the drawer's top ten cover it), option C's two maps, the prototypes'
proposed "poorer importer" rule (not approved; the round-14 fairness note stays) and the full per-flow decision lists
(each part links to its decisions section and the log).

## Round 18: the streams on phones and a visual country panel

Owner requests; no number changed (`audit_tmp/calc.js` for all 231 entries identical before and after). Decisions:
[round 18](decisions.md#round-18-the-streams-on-phones-and-a-country-panel-of-numbers-and-bars).

1. **Streams on phones.** The cause: off by default under 900px with the switch below the fold of the Filters sheet; a
   tapped country's streams drawn behind the bottom sheet; the moving dashes repainting the whole map SVG each frame.
   Now on by default on phones too, with the 7 largest each way and thinner lines; a tapped country's streams move
   into view above the sheet; a phone held sideways gets a side sheet; the dashes have their own layer and pause while
   the page is hidden or the map is dragged; the idle canvas loop is gone; the reduced-motion arrowheads keep their
   size when zoomed.
2. **The country panel, numbers first.** The name only on top; the net as one big number with one compact line; the
   two parts as two tiles (and Russian money frozen as a slim third); small flags for what changes the meaning; the 7
   biggest parts as a diverging bar chart. Every sentence opens in place on a tap; the code, people and GDP are in a
   folded "About" section. 20 new strings in all six languages; 3 obsolete ones removed.

## See also

- [limitations.md](limitations.md): what is still open
- [method/overview.md](method/overview.md)
- [Documentation index](README.md)
