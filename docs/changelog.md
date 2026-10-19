# Changelog: research rounds

The map's data were built in twelve research rounds in October 2026, each followed by changes to the pipeline and the site. This page summarises what each round added or corrected and links to the method page that now explains it. The detailed log, with every file and decision, is [`research/2026-10/README.md`](../research/2026-10/README.md); individual corrections are in the commit history.

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

## See also

- [limitations.md](limitations.md): what is still open
- [method/overview.md](method/overview.md)
- [Documentation index](README.md)
