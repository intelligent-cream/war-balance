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

The European Peace Facility is not in Kiel's EU figures since tracker version 16 ([kiel-notes.md](../../research/2026-10/kiel-notes.md)).

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
measured expected loss of its creditor class: 0 for the IMF and World Bank, 9% for EU loans, the bilateral standstill
for G7 and Paris Club lenders, about 95% for the 2026 Support Loan). The high end discounts at the promised war yield
of the year of payout (38% in 2022, 40% in 2023, 15–24% after). Round 5 used a flat 10% (6–15%), a judgement. Over
2022–2026 face value EUR 96.5bn becomes about 53bn (42–85); it was 64bn (40–77). The full method, the measured rates,
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
5. **Poland** (round 5): the cost is refugee spending from the Aid Fund at BGK (PLN 11.3bn in 2022, 8.9bn in 2023, 8.1bn in 2024; NIK confirms 2022), not the Fund's total, which also pays for tasks outside Poland. Poland's 2022–2026 gross hosting cost falls from the Fund's total of EUR 24bn to EUR 10.8bn of refugee spending (`refugee_gross` in `data.json`), and to about EUR 3.2bn net of refugees' taxes. At the time this moved Poland from +10.0% to +7.1% of GDP; the current build shows +4.1%. Bulgaria and Croatia also have new budget figures. Round 11 audit: these PLN figures were checked only against a press article, because the BGK and NIK pages blocked automated access ([verify_r11_aid-notes](../../research/2026-10/verify_r11_aid-notes.md)), so Poland's refugee part is certainty C.

The panel also shows the latest refugee count (`people.refugees`).

## Military support to Russia

"Weapons and troops sent to Russia", always toward Russia, certainty D:

- **North Korea**: shells, missiles and troops, from INSS munitions estimates, KIDA and others (central about EUR 9bn for August 2023 to December 2025; [other-notes.md](../../research/2026-10/other-notes.md)); narrowed in [`narrow.json`](../../research/2026-10/gaps/narrow.json).
- **Iran**: Shahed and missile contracts, about EUR 4bn ([`flowback2.json`](../../research/2026-10/gaps/flowback2.json) `military_to_russia`).
- **Belarus**: own valuation of ammunition and equipment quantities.
- **China**: only what is **not** in recorded trade ([`china_military.json`](../../research/2026-10/gaps/china_military.json), [notes](../../research/2026-10/gaps/china_military-notes.md)): unrecorded finished military items (15% of their value), smuggled dual-use goods (3% of recorded) and intelligence, training and services: EUR 0.17–0.33bn a year (Monte Carlo 90%: 0.12–0.72). China's recorded dual-use exports (EUR 4.5–5.8bn a year on the Common High Priority list) are already in its sales to Russia and are shown only as a note (`dual_use_note`).

Most of these supplies are sales or barter paid for by Russia, so they are counted as support to Russia, not as aid. Volunteers for Ukraine and fighters for Russia are shown as counts (`people`), not money; belligerent-sourced counts are left out.


### Round 6 revision

North Korea, Iran and Belarus are revalued from more sources ([`military_rus_r6.json`](../../research/2026-10/gaps/military_rus_r6.json),
[notes](../../research/2026-10/gaps/military_rus_r6-notes.md)), at market value (what Russia pays its own industry):

| supplier | 2022–Aug 2026, EUR bn (range) | certainty | main evidence |
|---|---|---|---|
| North Korea | 8.8 (3.3–17.6) | C | 6.5–15m shells (Ukrainian and South Korean intelligence, Open Source Centre container counts, the sanctions monitoring team), 150–280 KN-23 missiles, troops' pay |
| Iran | 3.5 (1.5–5.5) | C | ready drones 2022–23, the Alabuga licence (leaked USD 1.75bn), over 400 ballistic missiles; nothing in 2026 |
| Belarus | 1.3 (0.55–2.7) | D | ammunition from army stocks; components sold by companies are already in trade |
| China | 1.3 (1.0–3.0) | D | unchanged (`china_military.json`) |

## Flowback

Part of military aid comes back to the donor as orders for its own industry. Counting the full aid as a shift toward Ukraine while ignoring this would flatter big arms producers. Code: flowback section of `build()`; data: [`flowback.json`](../../research/2026-10/flowback.json) ([notes](../../research/2026-10/flowback-notes.md)) and [`flowback2.json`](../../research/2026-10/gaps/flowback2.json) ([notes](../../research/2026-10/gaps/flowback2-notes.md)).

The first three bullets describe the estimates used up to round 5. **Since round 6 the all-money ledger below replaces all of them** (`apply_money_ledger()` deletes their values), so `OWN_SHARE_DEFAULT`, the PURL estimate and the EU arms slice no longer change any number on the map; they are kept as history.

- **Own aid spent with its own defence industry** (history): the own-industry share of bilateral military aid. US 0.86–0.90 (CSIS, certainty B); other donors from Kiel's item-level coding (domestic procurement + own stocks refilled at home + a share of uncoded value; Germany 0.40–0.59, UK 0.44–0.74, France 0.70–0.90, Netherlands 0.11–0.27); no evidence: 0% / 10% / 30% (`OWN_SHARE_DEFAULT`, round 11; it now applies only to Albania, North Macedonia and Montenegro, certainty D).
- **Other countries' aid spent here** (history; the EU arms split still feeds the ledger): NATO PURL purchases from US stocks (US receives EUR 3.7bn in 2025 and more in 2026), and EU-level military aid credited where Kiel's items say it was spent (round 11, `EU_ARMS_SLICE`): Sweden 28% (the Gripen contract), all other members together 3% (0–10%, split by the ASAP 2024 grants), and about 70% to Ukraine's own drone industry, which is no member's flowback. All of it is dated 2026, as in Kiel. Before round 11 the split followed SIPRI production shares (France 39%, Germany 24%, Italy 19%...).
- **Extra sales to Ukraine** above the expected level ([trade.md](trade.md)).

Until round 5 all three counted only as **profit** (20%, range 0.5–1.5×), the same share as profit lost on sales to Russia. Since round 6 they come from the all-money ledger below and count at value kept × genuinely extra ([the money rule](overview.md#the-money-rule-round-6)). They are subtracted from both the net shift and the cost. The "money flowing back" switch on the map (on by default, `state.netBack`) turns them off. Check 6 compares PURL paid with PURL received by the US.

### Arms Ukraine bought abroad (round 5)

Weapons Ukraine bought from foreign sellers, with its own budget or donors' cash, are money flowing back to the seller
too: the Czech ammunition initiative (paid by Germany, the Netherlands, Denmark and others; Czech export licences to
Ukraine CZK 47–51bn a year in 2024–25), Bulgarian and Serbian shells via third countries, German money for Patriots from
the US, Danish money for Swedish CV90s. Only sales not already in customs (sales to Ukraine) or in a donor's own-industry
share count. Round 5 counted the seller's profit at 20%, like other flowback; since round 6 these sales are part of the
all-money ledger below and count at value kept × genuinely extra. Over 2022–2026 about EUR 21bn of sales (4.2bn of profit
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
own-industry shares, PURL, EU arms slice and arms-bought-abroad estimates. The money rule then counts the value kept
× genuinely extra. Example, the US 2022–2026: gave EUR 94bn, earned back 44bn (own aid 30, others' purchases 12), so
its balance with Ukraine is +50bn.

## See also

- [overview.md](overview.md): where these parts sit in the net shift and the cost view
- [loans.md](loans.md): what a loan is worth to Ukraine and what it costs the lender (round 12)
- [ranges.md](ranges.md): certainty letters and default ranges
- [reference/sources.md](../reference/sources.md#aid-refugees-and-military)
- Research notes: [kiel-notes.md](../../research/2026-10/kiel-notes.md), [aid_gaps-notes.md](../../research/2026-10/gaps/aid_gaps-notes.md), [refugees-notes.md](../../research/2026-10/gaps/refugees-notes.md), [round4b-notes.md](../../research/2026-10/gaps/round4b-notes.md), [flowback-notes.md](../../research/2026-10/flowback-notes.md), [flowback2-notes.md](../../research/2026-10/gaps/flowback2-notes.md), [china_military-notes.md](../../research/2026-10/gaps/china_military-notes.md), [other-notes.md](../../research/2026-10/other-notes.md)
- [Documentation index](../README.md)
