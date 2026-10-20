# Aid, refugees, military support and flowback

The Ukraine side of the ledger: government aid (Kiel Institute and, for the 190 countries outside its tracker, UN and government records), each EU member's share of EU-level aid, undisclosed military aid, private donations and the cost of hosting refugees. On the Russia side, weapons and troops sent to Russia. And in between, flowback: aid that returns to the donor's own economy as orders for its own industry. This page explains each, including the corrections that keep Russia's own money (loans repaid from frozen assets) out of donors' aid.

## Aid

Data: [`kiel.json`](../../research/2026-10/kiel.json) ([notes](../../research/2026-10/kiel-notes.md)), the [Kiel Institute Ukraine Support Tracker](https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/), Release 31 (data 24 January 2022 to 31 August 2026), allocations by month (`Allocations per Month`), categories military, financial and humanitarian. Code: aid section of [build_data.py `build()`](../../pipeline/build_data.py).

- **Allocated, not pledged.** "Allocated" means delivered or contracted. Commitments not yet allocated are shown as `pledged_open` in "More details", not counted.
- **Loans** count at their **economic value to Ukraine** in the net shift and at the **lender's cost** in the cost view, both per loan item from measured rates and expected losses (round 12, [loans](loans.md); certainty C).
- **ERA loans excluded.** G7 loans repaid from immobilised Russian assets (ERA: US 18.3, EU 18.1, Canada 3.3, UK 2.6, Japan 1.6 EUR bn) are Russia's money, not the donor's. They are taken out of the donor's years (in the year paid: US 2024, Japan 2026, UK 2025–2026, the others 2025), loans and financial category (`era_excluded` in `data.json`); [`check_data.py`](../../pipeline/check_data.py) check 5 verifies this.
- **Amounts without a month** (Italy 1.3bn) are spread over the years in proportion.

**Outside Kiel** (190 countries): [`aid_gaps.json`](../../research/2026-10/gaps/aid_gaps.json) ([notes](../../research/2026-10/gaps/aid_gaps-notes.md)) from the [UN OCHA Financial Tracking Service](https://fts.unocha.org/countries/234/summary/2026) and official statements. Largest: Saudi Arabia 0.37bn, UAE, Qatar, North Macedonia (military), Azerbaijan. 163 countries with no record anywhere get 0 with a small upper bound (0.002% of 2022 GDP, a judgement: [decisions](../decisions.md#constants-and-rules-written-down-in-round-11)), so no one is assumed to have given nothing for certain. Check 2 verifies no country takes aid from both Kiel and the gap research.

### EU-level aid

Aid from EU institutions (Commission, Council, EIB; Kiel's `EU_INST`) is split over the 27 members by their share of EU budget contributions, Kiel's own method (`eu_share`), and shown as its own part, "Share of EU-level aid", with the same relative range as the member's aid. Check 1 verifies the members' shares add up to the EU total.

**The 2026 EU Ukraine Support Loan** is guaranteed by 24 members, not Czechia, Hungary or Slovakia; their slice of the 2026 disbursements goes to the other 24 in proportion (`apply_audit()`, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md) item 9; Czechia 2.06 → 1.90, Hungary 0.98 → 0.87, Slovakia 1.37 → 1.30 EUR bn).

**The European Peace Facility (EPF) is not counted** (round 16, review 5 L1, approved by the owner). Kiel has not counted it since tracker version 16 ([kiel-notes.md](../../research/2026-10/kiel-notes.md)): the EPF reimburses member states for weapons they gave Ukraine themselves, which are already in their own bilateral aid, so adding it would count them twice. It is not paid from the EU budget either: it is off-budget, funded by the member states by a GNI key, so it shifts who bears the cost of those weapons between members; the map does not model that shift ([limitations](../limitations.md)). The panel says so, and gives the member's EU-level share at the same value as its bar (loans at their gift to Ukraine), with the face value beside it (until round 15 the text showed the face value, Lithuania €294m against €211m on the bar).

**Grade of the adjusted aid** (round 16, review 5 L4): Kiel's figure is reported (A), but the part on the map is adjusted by modelled factors (weapons at market value, loans as gifts). Its letter is A only where those adjustments are under 5% of it, B under 25%, else C (`aidCert` in `calc()`).

### Donated weapons at market value (round 5)

Donors value weapons from their stocks differently: the US at replacement cost until March 2023 and at depreciated book
value after (GAO-24-106934: about USD 8.1bn overstated), the UK budget at replacement cost (National Audit Office: book
value GBP 0.17bn against replacement GBP 2.7bn), Nordic and Baltic EU Peace Facility claims at 91–100% of the new price.
The map counts the **value to Ukraine: what the equipment would fetch on the market**. Each Kiel row gets a factor
(market value ÷ recorded value) by how it was valued and what it is (MiG-29 × 0.12, F-16 × 0.30, Patriot × 0.75, shells
× 1.3 because their price doubled); new procurement keeps factor 1. Code: `apply_weapons_value()` stores yearly
corrections (`aid.weapons_mv`), which `calc()` adds to aid in the shift toward Ukraine. **The cost view keeps the
recorded values**, closer to what the donor spent. Data: [`weapons_value.json`](../../research/2026-10/gaps/weapons_value.json)
([notes](../../research/2026-10/gaps/weapons_value-notes.md)).

Over 2022–2026 this lowers bilateral military aid by about 14% (EUR 177bn → 152bn): USA −7.0bn, UK −2.7, Sweden −2.4,
Poland −1.8, France −1.6, Netherlands −1.3, Norway −1.1; Germany only −0.5 (mostly new procurement). The correction
shrinks over time as aid moved from stocks to new production.

### Loans at their economic value (round 5)

A loan that is repaid is worth less to Ukraine than a grant. Since round 12 each loan and guarantee counts at its gift:
cheaper interest, discounted at Ukraine's normal 2021 rate (6.7%), plus the default risk the lender really carries (the
measured expected loss of its creditor class: 0 for the IMF and World Bank, for EU loans the provisioning rate the EU set for each loan (70% for the 2022 exceptional MFA and the repurposed EIB loans, 9% for the rest), the bilateral standstill
for G7 and Paris Club lenders, about 95% for the 2026 Support Loan). The high end discounts at the promised war yield
of the year of payout (38% in 2022, 40% in 2023, 15–24% after). Round 5 used a flat 10% (6–15%), a judgement. Over
2022–2026 face value EUR 96.5bn becomes about 55bn (42–85); it was 64bn (40–77). The full method, the measured rates,
a worked example and the evidence are on the [loans page](loans.md). Code: [`loan_rates.py`](../../pipeline/loan_rates.py)
and `apply_loans_value()`; data: [`loans_value.json`](../../research/2026-10/gaps/loans_value.json)
([notes](../../research/2026-10/gaps/loans_value-notes.md)). The cost view uses the lender's cost: the same terms and
losses at the lender's own funding rate ([loans](loans.md#the-cost-view)).

**Multilateral lending** (IMF, World Bank, EBRD, CEB): only the rise over each institution's 2019–2021 own-risk lending
counts (donor-guaranteed and trust-fund lending is already in Kiel), valued the same way and credited by shareholding,
as its own part ([loans](loans.md#new-lending-by-the-imf-and-world-bank)). Biggest: US 0.28bn, Germany 0.13, Japan
0.12, France 0.11, Italy 0.10, China 0.09 (round 5: US 0.66, Japan 0.27).

**ERA years** (round 5): the ERA loans (repaid from frozen Russian assets, left out) are removed in the years they were
paid: the US in 2024, Japan in 2026, the UK 1.78bn in 2025 and the rest in 2026, the others in 2025; the UK's is coded
as military in Kiel ([refresh_2026-notes.md](../../research/2026-10/gaps/refresh_2026-notes.md)).

## Undisclosed aid and private donations

From [`uncovered.json`](../../research/2026-10/gaps/uncovered.json) ([notes §3–4](../../research/2026-10/gaps/uncovered-notes.md)):

- **Undisclosed military aid** beyond Kiel (certainty C–D): Germany's 2026 appropriations above what Kiel records (0 / 1.5 / 4.0), Italy's later classified decrees, France's 2024 gap, small Greek amounts. France's 2022–23 gap was taken out because Kiel adopted France's official figure in Release 16 (audit 2, question 3). Check 8 warns if undisclosed aid exceeds half of a country's Kiel military aid.
- **Private donations**: national totals for 2022 (Germany DZI, UK DEC, Netherlands Giro555, Switzerland Zewo, US Candid), a GDP share elsewhere (Western donors 0.015%, Central and Eastern Europe 0.03%, Baltic states 0.06%; a judgement, [decisions](../decisions.md#constants-and-rules-written-down-in-round-11)), falling to about 5–13% of the 2022 level later. Largest 2022–2026: US 2.6, Germany 1.3, UK 0.8 EUR bn.

## Refugees

Hosting refugees from Ukraine counts toward Ukraine in both the net shift and the cost view. Sources, in order of preference:

1. **Government budgets and audit offices** for 27 hosts ([`round4b.json`](../../research/2026-10/gaps/round4b.json) §2, [notes](../../research/2026-10/gaps/round4b-notes.md)), applied by `apply_audit()`: gross public spending on Ukrainians per calendar year (US ORR and benefits, German federal budget and Bürgergeld, Polish Aid Fund, UK Homes for Ukraine, Dutch central government, Swiss lump sums and others). 2022–2026 total EUR 133bn against 155bn in the earlier model: the US (−7.4), Canada (−5.2), Spain, Italy and the UK fall; Germany (+2.0) and Norway (+1.0) rise.
2. **Elsewhere**, [`refugees.json`](../../research/2026-10/gaps/refugees.json) ([notes](../../research/2026-10/gaps/refugees-notes.md)): person-years per calendar year (Eurostat `migr_asytpsm` monthly stocks for the EU and EFTA, UNHCR end-year counts with a ramp elsewhere, US and Canadian programme arrivals) × k × GDP per head, with k calibrated on the reported budgets (certainty C).
3. **Donor-paid costs** are taken off the host ([`flowback2.json`](../../research/2026-10/gaps/flowback2.json) `refugee_donor_funding`): UN refugee plans and EU grants paid for part of the cost in Moldova and others. Moldova's `round4b.json` figures are already its own cost, net of donors. Check 11 verifies this for Moldova.

4. **Net cost** (round 5, `apply_refugees_net()`, [`refugees_net.json`](../../research/2026-10/gaps/refugees_net.json), [notes](../../research/2026-10/gaps/refugees_net-notes.md)): the cost minus the taxes and social contributions working refugees pay. Official revenue figures for Czechia (Labour Ministry: CZK 11 / 19 / 25bn in 2022–2024), Poland (Ministry of Finance, only the increase over a no-war path for Ukrainians already working there), Lithuania and Moldova; Germany from official job counts × wages × tax rate; elsewhere modelled (working-age share × employment rate × half the average wage × tax wedge, plus VAT). Across all hosts revenue offsets about half the cost over 2022–2026 (about 20% in 2022, over 60% in 2025). **Floored at zero on each country's 2022–2026 total**: where refugees paid more than they cost (Czechia, Canada, Slovakia, Romania, the Baltic states), hosting counts as zero, not as a shift toward Russia. Used in both the shift and the cost view.
5. **Poland** (round 5): the cost is refugee spending from the Aid Fund at BGK (PLN 11.3bn in 2022, 8.9bn in 2023, 8.1bn in 2024; NIK confirms 2022), not the Fund's total, which also pays for tasks outside Poland. Poland's 2022–2026 gross hosting cost fell from the Fund's total of EUR 24bn to EUR 10.8bn of refugee spending, and to about EUR 3.2bn net of refugees' taxes. At the time this moved Poland from +10.0% to +7.1% of GDP. Round 15 put Poland on the all-government definition (item 6). Bulgaria and Croatia also have new budget figures. Round 11 audit: these PLN figures were checked only against a press article, because the BGK and NIK pages blocked automated access ([verify_r11_aid-notes](../../research/2026-10/verify_r11_aid-notes.md)), so Poland's refugee part is certainty C.

6. **One definition for every host** (round 15, review 4 M5, approved by the owner): the cost to **all levels of government** minus the taxes and contributions refugees pay. Germany's reported figure is federal spending and Poland's is the Aid Fund's refugee spending, so each is scaled by the gap that broad all-government estimates show for that host in 2022 (`REFUGEE_SCOPE` in `build_data.py`): Germany against the OECD *International Migration Outlook 2022* first-year estimate (EUR 6.8bn, 1.24 × federal) and Kiel's estimate (1.53 ×); Poland against OECD (EUR 8.36bn, 3.47 × the Fund's PLN 11.3bn), Kiel (3.68 ×) and Poland's Council for Cooperation with Ukraine (3.81 ×). The central value is the reported figure × √(median ratio), the rule round 5 used for Germany and Switzerland; the low end is the reported figure alone, the high end × the largest ratio. The OECD figures are as reported in the press ([Notes from Poland, 14 October 2022](https://notesfrompoland.com/2022/10/14/poland-to-spend-e8-4bn-supporting-ukraine-refugees-in-2022-highest-in-oecd/)); the OECD table itself blocked automated access (not verified). Effect at the time: Poland's hosting at net cost EUR 3.2bn → 9.6bn (support for Ukraine +1.11% → +1.95%), Germany's 29.5 → 25.1bn (+1.81% → +1.70%). **Round 16 (review 5 H1, approved by the owner): the gap applies to 2022 only** (`REFUGEE_SCOPE_YEARS`). It was measured on 2022 alone, and the OECD figure is a projection for 2022 with a fixed refugee population; Poland ended most free accommodation and host payments in 2023. From 2023 Poland keeps the Aid Fund's reported refugee spending with its own range; Germany's central values had round 5's gap built in for every year, so from 2023 its central is the reported federal figure and its high end keeps the gap (`SCOPE_IN_CENTRAL`). Poland's hosting at net cost EUR 9.6bn → 4.9bn, Germany's 25.1bn → 19.7bn; support for Ukraine now Poland +1.28%<!-- n:POL.ua -->, Germany +1.57%<!-- n:DEU.ua -->. Switzerland keeps its round-5 judgement (no broad estimate found); the modelled hosts keep the round-5 calibration. Refugees at gross cost are in the method band. The unverified Poland and Czechia figures that `kiel.json` carried from a search snippet were removed (they were never used).
7. **Not on the aggressor side** (round 15, raised by the owner). Russia is not on the map as a host: it is the aggressor, and the International Criminal Court issued arrest warrants on 17 March 2023 against Vladimir Putin and Maria Lvova-Belova for the war crime of unlawful deportation and transfer of children from occupied areas of Ukraine to Russia ([ICC press release](https://www.icc-cpi.int/news/situation-ukraine-icc-judges-issue-arrest-warrants-against-vladimir-vladimirovich-putin-and)); the UN Independent International Commission of Inquiry on Ukraine found in March 2026 that these deportations and forcible transfers are crimes against humanity ([UN News, 12 March 2026](https://news.un.org/en/story/2026/03/1167122)). UNHCR's counts for Russia rest on Russian data. No refugee cost of Russia's is in any file the map uses, and `check_data.py` checks that Russia has no entry. **Belarus** hosted Ukrainian refugees too (EUR 0.11bn at net cost, certainty D), but it is a co-belligerent: the UN General Assembly "deplores the involvement of Belarus in this unlawful use of force against Ukraine" (resolution [ES-11/1](https://documents.un.org/api/symbol/access?s=A/RES/ES-11/1&l=en&t=pdf), 2 March 2022). Its cost is moved out of support for Ukraine and every total into a label ("hosted Ukrainian refugees (€0.1bn), not counted as support: co-belligerent"; `ref_excluded` in `data.json`). The owner also noted that many Ukrainians reached Belarus via Russia; UNHCR's inter-agency update of October 2022 says most refugees in Belarus transited Poland, Lithuania and Latvia and "an unknown number continue to arrive via Russia" ([ReliefWeb](https://reliefweb.int/report/belarus/regional-refugee-response-plan-ukraine-situation-inter-agency-operational-update-belarus-31-october-2022-enru)), so the decision rests on Belarus's role in the war, not on the route.

8. **Actual cost on the map, a common cost in the method band** (round 16, review 5 H2, approved by the owner). Each host keeps what it actually spent net of refugees' taxes: the owner chose actual cost. Because the same refugee is then worth EUR 0 to 20,000 a year depending on the host's welfare system, the method band adds "refugees at one common net cost per person-year for every host": each year's total net cost of all hosts over their person-years ([`refugees.json`](../../research/2026-10/gaps/refugees.json) `person_years`, 83 hosts; Belarus left out), EUR 5,780 per person-year in 2022, 3,693 in 2023, 2,180 in 2024, 1,322 in 2025 and 806 in January–August 2026 (`data.json` `meta`). Donor-paid shares stay off. The alternative counts in the "direction uncertain" test like every other one (`refugee_common_cost()`, `calc(c, y, {refCommon: true})`).

The panel also shows the latest refugee count (`people.refugees`).

### Refugee spending flowing back (round 16)

Raised by review 5 (M3); the owner asked for it. Like weapons bought at home, money spent hosting refugees is spent in the host's own economy: rent, food, retail and other services. Only the host's real gain on it is subtracted, under the same rule as other money flowing back ([one rule](overview.md#one-rule-for-every-seller-round-13)): the host's net gain per euro of services (taxes on production plus profit above a normal return; [`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json) group "services": accommodation and food, I, and business services without real estate, GTNXL; the OECD median outside STAN) × the genuinely extra share of civilian spending ([`value_kept.json`](../../research/2026-10/gaps/value_kept.json) `flowback_other`). Real-estate rental excluding imputed rent is not measured on its own: OECD STAN's real estate is dominated by imputed rent and the dwelling stock, the reason round 14 left it out, so rent counts at the services share. It is applied to the hosting cost counted (net of refugees' taxes) and shown as "Refugee hosting spent in its own economy (rent, food, services)" among the money flowing back; it is not part of the money that reached Ukraine. Weighted over all hosts it is 2.7% of the hosting cost (Germany 1.7%, the Netherlands 3.7%, Poland 8.2%); check 35 keeps it between 1% and 5% (`refugee_flowback()`, `aid.refugee_back_f`).

## Military support to Russia

"Weapons and troops sent to Russia", always toward Russia, certainty D:

- **North Korea**: shells, missiles and troops, from INSS munitions estimates, KIDA and others (central about EUR 9bn for August 2023 to December 2025; [other-notes.md](../../research/2026-10/other-notes.md)); narrowed in [`narrow.json`](../../research/2026-10/gaps/narrow.json).
- **Iran**: Shahed and missile contracts, about EUR 4bn ([`flowback2.json`](../../research/2026-10/gaps/flowback2.json) `military_to_russia`).
- **Belarus**: own valuation of ammunition and equipment quantities.
- **China**: only what is **not** in recorded trade ([`china_military.json`](../../research/2026-10/gaps/china_military.json), [notes](../../research/2026-10/gaps/china_military-notes.md)): unrecorded finished military items (15% of their value), smuggled dual-use goods (3% of recorded) and intelligence, training and services: EUR 0.17–0.33bn a year (Monte Carlo 90%: 0.12–0.72). China's recorded dual-use exports (EUR 4.5–5.8bn a year on the Common High Priority list) are already in its sales to Russia and are shown only as a note (`dual_use_note`).

Most of these supplies are sales or barter paid for by Russia. **Round 13 (audit): paid deliveries count as sales.** What Russia paid for, also in kind (technology, components, fuel, food), counts at the seller's net gain × genuinely extra, like any sale to Russia; what it did not pay for counts in full as support ([`military_payment_r13.json`](../../research/2026-10/gaps/military_payment_r13.json), [notes](../../research/2026-10/gaps/military_payment_r13-notes.md)). North Korea: paid (INSS: technology and components 80–96% of Russia's compensation); about half its shells were outdated stock with no other use, counted at 0.9 of their price; troops' pay in full. Iran: paid under contracts. Belarus: no payment found, in full. China's unrecorded part: sold by firms. Effect: North Korea −30.0 → −10.2% of GDP, Iran −0.8 → 0.0. The full-value series is kept for the method band. Volunteers for Ukraine and fighters for Russia are shown as counts (`people`), not money; belligerent-sourced counts are left out.


**Armed Russia (round 15, review 4 C2, approved by the owner).** The Russia panel's list "Who helps Russia the most" is replaced by two named lists. "Paid Russia more than before the war" is the negative end of the payments map, with the note that fuel is fungible and that the figures reflect purchases, not a policy. "Armed Russia" lists the weapons, ammunition, drones, missiles and troops delivered to Russia **at their full value** (the `military_rus.alt` series): North Korea EUR 8.8bn, Iran 3.5bn, China 1.3bn and Belarus 1.3bn for 2022–August 2026, with what counts in the totals next to it (paid deliveries at the seller's net gain, the round-13 rule: Iran EUR 0.1bn). The list is information; the totals do not change. **Round 16** (review 5 H3, approved by the owner): the first list is renamed "Russia's gain from this country rose" and names each entry's main cause ("mostly the 2022 price spike on gas contracts" for Hungary, "mostly gold"); a country whose number is more than half weapons or troops sent to Russia (North Korea, Belarus, Iran) is on "Armed Russia" only, with a note under the first list.

### Round 6 revision

North Korea, Iran and Belarus are revalued from more sources ([`military_rus_r6.json`](../../research/2026-10/gaps/military_rus_r6.json),
[notes](../../research/2026-10/gaps/military_rus_r6-notes.md)), at market value (what Russia pays its own industry):

| supplier | 2022–Aug 2026, EUR bn (range) | certainty | main evidence |
|---|---|---|---|
| North Korea | 8.8 (3.3–17.6) | C | 6.5–15m shells (Ukrainian and South Korean intelligence, Open Source Centre container counts, the sanctions monitoring team), 150–280 KN-23 missiles, troops' pay |
| Iran | 3.5 (1.5–5.5) | C | ready drones 2022–23, the Alabuga licence (leaked USD 1.75bn), over 400 ballistic missiles; nothing in 2026 |
| Belarus | 1.3 (0.55–2.7) | D | ammunition from army stocks; components sold by companies are already in trade |
| China | 1.3 (1.0–3.0) | D | unchanged (`china_military.json`) |

North Korea's volumes are checked against a primary report since round 12: the Multilateral Sanctions Monitoring Team's
MSMT/2025/1 (29 May 2025, UN document S/2025/340). It confirms the rounds, containers, missiles, artillery and troops,
but gives no prices, so the value stays our judgement and the letter stays C
([comparison](../../research/2026-10/gaps/military_rus_r6-notes.md#checked-against-the-primary-report-round-12)).

## Flowback

Part of military aid comes back to the donor as orders for its own industry. Counting the full aid as a shift toward Ukraine while ignoring this would flatter big arms producers. Code: flowback section of `build()`; data: [`flowback.json`](../../research/2026-10/flowback.json) ([notes](../../research/2026-10/flowback-notes.md)) and [`flowback2.json`](../../research/2026-10/gaps/flowback2.json) ([notes](../../research/2026-10/gaps/flowback2-notes.md)).

The first three bullets describe the estimates used up to round 5. **Since round 6 the all-money ledger below replaces all of them** (`apply_money_ledger()` deletes their values), so `OWN_SHARE_DEFAULT`, the PURL estimate and the EU arms slice no longer change any number on the map; they are kept as history.

- **Own aid spent with its own defence industry** (history): the own-industry share of bilateral military aid. US 0.86–0.90 (CSIS, certainty B); other donors from Kiel's item-level coding (domestic procurement + own stocks refilled at home + a share of uncoded value; Germany 0.40–0.59, UK 0.44–0.74, France 0.70–0.90, Netherlands 0.11–0.27); no evidence: 0% / 10% / 30% (`OWN_SHARE_DEFAULT`, round 11; it now applies only to Albania, North Macedonia and Montenegro, certainty D).
- **Other countries' aid spent here** (history; the EU arms split still feeds the ledger): NATO PURL purchases from US stocks (US receives EUR 3.7bn in 2025 and more in 2026), and EU-level military aid credited where Kiel's items say it was spent (round 11, `EU_ARMS_SLICE`): Sweden 28% (the Gripen contract), all other members together 3% (0–10%, split by the ASAP 2024 grants), and about 70% to Ukraine's own drone industry, which is no member's flowback. All of it is dated 2026, as in Kiel. Before round 11 the split followed SIPRI production shares (France 39%, Germany 24%, Italy 19%...).
- **Extra sales to Ukraine** above the expected level ([trade.md](trade.md)).

Until round 5 all three counted only as **profit** (20%, range 0.5–1.5×), the same share as profit lost on sales to Russia. Since round 6 they come from the all-money ledger below; from round 6 to round 12 they counted at value kept × genuinely extra ([the money rule](overview.md#the-money-rule-round-6)). **Since round 13 they count at the seller's net gain × genuinely extra** ([one rule](overview.md#one-rule-for-every-seller-round-13)): weapons at the defence industries' gain (round 13: US 0.032, Germany 0.037, OECD median 0.037; round 14, with a normal return of 5% a year above inflation plus the country's risk premium: US 0.051, Germany 0.051, OECD median 0.051), so US flowback falls from EUR 44bn to 1.5bn in round 13 and is EUR 2.5bn (3.6% of the EUR 70bn flowing back) in round 14 (the audit's point that replacing donated stock is defence spending, not income from Ukraine, is met by the rule: the US arms industry earns little above a normal return). Extra sales to Ukraine count at refining's and manufacturing's gain (Poland 0.68 × 0.116 + 0.32 × 0.066). They are subtracted from both the net shift and the cost. The "money flowing back" switch on the map (on by default, `state.netBack`) turns them off. Check 6 compares PURL paid with PURL received by the US.

### Arms Ukraine bought abroad (round 5)

Weapons Ukraine bought from foreign sellers, with its own budget or donors' cash, are money flowing back to the seller
too: the Czech ammunition initiative (paid by Germany, the Netherlands, Denmark and others; Czech export licences to
Ukraine CZK 47–51bn a year in 2024–25), Bulgarian and Serbian shells via third countries, German money for Patriots from
the US, Danish money for Swedish CV90s. Only sales not already in customs (sales to Ukraine) or in a donor's own-industry
share count. Round 5 counted the seller's profit at 20%, like other flowback; since round 6 these sales are part of the
all-money ledger below and counted at value kept × genuinely extra until round 12; since round 13 at the seller's net gain × genuinely extra. Over 2022–2026 about EUR 21bn of sales (4.2bn of profit
at the old 20%): Czechia 5.7bn gross, Bulgaria 5.0, the US 4.1, Türkiye 1.5, Serbia 1.1. Code: `apply_ua_arms_purchases()`; data:
[`ua_arms_purchases.json`](../../research/2026-10/gaps/ua_arms_purchases.json)
([notes](../../research/2026-10/gaps/ua_arms_purchases-notes.md)).


### Round 6: the all-money ledger

Flowback now comes from one ledger of all money that reached Ukraine ([`money_ledger.json`](../../research/2026-10/gaps/money_ledger.json),
[notes](../../research/2026-10/gaps/money_ledger-notes.md)): every one of Kiel's 5,587 allocations plus undisclosed aid,
IMF/World Bank/EBRD/CEB money, private donations and Ukraine's own budget spent on arms abroad, EUR 437bn in all,
assigned once to what it paid for and the economy where it was spent. Of the new money, EUR 220bn was spent in Ukraine
(mostly pensions, social payments and salaries), 71bn in the payer's own economy, 69bn in other economies. Weapons
given from donors' own stocks (EUR 72bn) are not new spending and earn nothing, unless the donor bought replacements:
EUR 29bn of explicit replacement purchases, capped at the value given (the US 19.3bn at home, Poland's Abrams, German
Patriots, the UK's and Sweden's restocking). Each seller's flowback has four parts: its own aid spent at home (with its
own replacement), other countries' and EU money spent there (with their replacement purchases), Ukraine's own arms
purchases there, and aid spent there on energy, relief and rebuilding. `apply_money_ledger()` replaces the earlier
own-industry shares, PURL, EU arms slice and arms-bought-abroad estimates. Until round 12 the money rule counted the value kept
× genuinely extra: the US 2022–2026 gave EUR 94bn and earned back 44bn (own aid 30, others' purchases 12), so its
balance with Ukraine was +50bn. Since round 13 the seller's net gain × genuinely extra applies: the US earns back
EUR 1.5bn, and its support for Ukraine is +92bn (+0.34% of GDP).

## See also

- [overview.md](overview.md): where these parts sit in the net shift and the cost view
- [loans.md](loans.md): what a loan is worth to Ukraine and what it costs the lender (round 12)
- [ranges.md](ranges.md): certainty letters and default ranges
- [reference/sources.md](../reference/sources.md#aid-refugees-and-military)
- Research notes: [kiel-notes.md](../../research/2026-10/kiel-notes.md), [aid_gaps-notes.md](../../research/2026-10/gaps/aid_gaps-notes.md), [refugees-notes.md](../../research/2026-10/gaps/refugees-notes.md), [round4b-notes.md](../../research/2026-10/gaps/round4b-notes.md), [flowback-notes.md](../../research/2026-10/flowback-notes.md), [flowback2-notes.md](../../research/2026-10/gaps/flowback2-notes.md), [china_military-notes.md](../../research/2026-10/gaps/china_military-notes.md), [other-notes.md](../../research/2026-10/other-notes.md)
- [Documentation index](../README.md)
