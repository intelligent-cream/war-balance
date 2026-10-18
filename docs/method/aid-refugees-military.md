# Aid, refugees, military support and flowback

The Ukraine side of the ledger: government aid (Kiel Institute and, for the 190 countries outside its tracker, UN and government records), each EU member's share of EU-level aid, undisclosed military aid, private donations and the cost of hosting refugees. On the Russia side, weapons and troops sent to Russia. And in between, flowback: aid that returns to the donor's own economy as orders for its own industry. This page explains each, including the corrections that keep Russia's own money (loans repaid from frozen assets) out of donors' aid.

## Aid

Data: [`kiel.json`](../../research/2026-10/kiel.json) ([notes](../../research/2026-10/kiel-notes.md)), the [Kiel Institute Ukraine Support Tracker](https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/), Release 31 (data 24 January 2022 to 31 August 2026), allocations by month (`Allocations per Month`), categories military, financial and humanitarian. Code: aid section of [build_data.py `build()`](../../pipeline/build_data.py).

- **Allocated, not pledged.** "Allocated" means delivered or contracted. Commitments not yet allocated are shown as `pledged_open` in "More details", not counted.
- **Loans** count at face value in the net shift and at **grant equivalent** (30%, `LOAN_GRANT_ELEMENT`, cost-to-lender view, certainty C) in the cost view.
- **ERA loans excluded.** G7 loans repaid from immobilised Russian assets (ERA: US 18.3, EU 18.1, Canada 3.3, UK 2.6, Japan 1.6 EUR bn) are Russia's money, not the donor's. They are taken out of the donor's years (US in 2024, others in 2025), loans and financial category (`era_excluded` in `data.json`); [`check_data.py`](../../pipeline/check_data.py) check 5 verifies this.
- **Amounts without a month** (Italy 1.3bn) are spread over the years in proportion.

**Outside Kiel** (190 countries): [`aid_gaps.json`](../../research/2026-10/gaps/aid_gaps.json) ([notes](../../research/2026-10/gaps/aid_gaps-notes.md)) from the [UN OCHA Financial Tracking Service](https://fts.unocha.org/countries/234/summary/2026) and official statements. Largest: Saudi Arabia 0.37bn, UAE, Qatar, North Macedonia (military), Azerbaijan. 163 countries with no record anywhere get 0 with a small upper bound (0.002% of 2022 GDP), so no one is assumed to have given nothing for certain. Check 2 verifies no country takes aid from both Kiel and the gap research.

### EU-level aid

Aid from EU institutions (Commission, Council, EIB; Kiel's `EU_INST`) is split over the 27 members by their share of EU budget contributions, Kiel's own method (`eu_share`), and shown as its own part, "Share of EU-level aid", with the same relative range as the member's aid. Check 1 verifies the members' shares add up to the EU total.

**The 2026 EU Ukraine Support Loan** is guaranteed by 24 members, not Czechia, Hungary or Slovakia; their slice of the 2026 disbursements goes to the other 24 in proportion (`apply_audit()`, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md) item 9; Czechia 2.06 → 1.90, Hungary 0.98 → 0.87, Slovakia 1.37 → 1.30 EUR bn).

The European Peace Facility is not in Kiel's EU figures since tracker version 16 ([kiel-notes.md](../../research/2026-10/kiel-notes.md)).

## Undisclosed aid and private donations

From [`uncovered.json`](../../research/2026-10/gaps/uncovered.json) ([notes §3–4](../../research/2026-10/gaps/uncovered-notes.md)):

- **Undisclosed military aid** beyond Kiel (certainty C–D): Germany's 2026 appropriations above what Kiel records (0 / 1.5 / 4.0), Italy's later classified decrees, France's 2024 gap, small Greek amounts. France's 2022–23 gap was taken out because Kiel adopted France's official figure in Release 16 (audit 2, question 3). Check 8 warns if undisclosed aid exceeds half of a country's Kiel military aid.
- **Private donations**: national totals for 2022 (Germany DZI, UK DEC, Netherlands Giro555, Switzerland Zewo, US Candid), a GDP share elsewhere (Western donors 0.015%, Central and Eastern Europe 0.03%, Baltic states 0.06%), falling to about 5–13% of the 2022 level later. Largest 2022–2026: US 2.6, Germany 1.3, UK 0.8 EUR bn.

## Refugees

Hosting refugees from Ukraine counts toward Ukraine in both the net shift and the cost view. Sources, in order of preference:

1. **Government budgets and audit offices** for 27 hosts ([`round4b.json`](../../research/2026-10/gaps/round4b.json) §2, [notes](../../research/2026-10/gaps/round4b-notes.md)), applied by `apply_audit()`: gross public spending on Ukrainians per calendar year (US ORR and benefits, German federal budget and Bürgergeld, Polish Aid Fund, UK Homes for Ukraine, Dutch central government, Swiss lump sums and others). 2022–2026 total EUR 133bn against 155bn in the earlier model: the US (−7.4), Canada (−5.2), Spain, Italy and the UK fall; Germany (+2.0) and Norway (+1.0) rise.
2. **Elsewhere**, [`refugees.json`](../../research/2026-10/gaps/refugees.json) ([notes](../../research/2026-10/gaps/refugees-notes.md)): person-years per calendar year (Eurostat `migr_asytpsm` monthly stocks for the EU and EFTA, UNHCR end-year counts with a ramp elsewhere, US and Canadian programme arrivals) × k × GDP per head, with k calibrated on the reported budgets (certainty C).
3. **Donor-paid costs** are taken off the host ([`flowback2.json`](../../research/2026-10/gaps/flowback2.json) `refugee_donor_funding`): UN refugee plans and EU grants paid for part of the cost in Moldova and others. Moldova's `round4b.json` figures are already its own cost, net of donors. Check 11 verifies this for Moldova.

The panel also shows the latest refugee count (`people.refugees`).

## Military support to Russia

"Weapons and troops sent to Russia", always toward Russia, certainty D:

- **North Korea**: shells, missiles and troops, from INSS munitions estimates, KIDA and others (central about EUR 9bn for August 2023 to December 2025; [other-notes.md](../../research/2026-10/other-notes.md)); narrowed in [`narrow.json`](../../research/2026-10/gaps/narrow.json).
- **Iran**: Shahed and missile contracts, about EUR 4bn ([`flowback2.json`](../../research/2026-10/gaps/flowback2.json) `military_to_russia`).
- **Belarus**: own valuation of ammunition and equipment quantities.
- **China**: only what is **not** in recorded trade ([`china_military.json`](../../research/2026-10/gaps/china_military.json), [notes](../../research/2026-10/gaps/china_military-notes.md)): unrecorded finished military items (15% of their value), smuggled dual-use goods (3% of recorded) and intelligence, training and services: EUR 0.17–0.33bn a year (Monte Carlo 90%: 0.12–0.72). China's recorded dual-use exports (EUR 4.5–5.8bn a year on the Common High Priority list) are already in its sales to Russia and are shown only as a note (`dual_use_note`).

Most of these supplies are sales or barter paid for by Russia, so they are counted as support to Russia, not as aid. Volunteers for Ukraine and fighters for Russia are shown as counts (`people`), not money; belligerent-sourced counts are left out.

## Flowback

Part of military aid comes back to the donor as orders for its own industry. Counting the full aid as a shift toward Ukraine while ignoring this would flatter big arms producers. Code: flowback section of `build()`; data: [`flowback.json`](../../research/2026-10/flowback.json) ([notes](../../research/2026-10/flowback-notes.md)) and [`flowback2.json`](../../research/2026-10/gaps/flowback2.json) ([notes](../../research/2026-10/gaps/flowback2-notes.md)).

- **Own aid spent with its own defence industry**: the own-industry share of bilateral military aid. US 0.86–0.90 (CSIS, certainty B); other donors from Kiel's item-level coding (domestic procurement + own stocks refilled at home + a share of uncoded value; Germany 0.40–0.59, UK 0.44–0.74, France 0.70–0.90, Netherlands 0.11–0.27); no evidence: 20% / 40% / 70% (`OWN_SHARE_DEFAULT`, certainty D).
- **Other countries' aid spent here**: NATO PURL purchases from US stocks (US receives EUR 3.7bn in 2025 and more in 2026), and EU-level military aid credited to member arms industries by SIPRI production share (`EU_ARMS_SLICE`: France 39%, Germany 24%, Italy 19%, Sweden 6%, Czechia 4%, Spain 3.5%, Poland 3%), × 70–88% spent with EU/EEA industry.
- **Extra sales to Ukraine** above the expected level ([trade.md](trade.md)).

All three count only as **profit** (20%, range 0.5–1.5×), the same share as profit lost on sales to Russia: the goods still cost money to make. They are subtracted from both the net shift and the cost. The "money flowing back" switch on the map (on by default, `state.netBack`) turns them off. Check 6 compares PURL paid with PURL received by the US.

## See also

- [overview.md](overview.md): where these parts sit in the net shift and the cost view
- [ranges.md](ranges.md): certainty letters and default ranges
- [reference/sources.md](../reference/sources.md#aid-refugees-and-military)
- Research notes: [kiel-notes.md](../../research/2026-10/kiel-notes.md), [aid_gaps-notes.md](../../research/2026-10/gaps/aid_gaps-notes.md), [refugees-notes.md](../../research/2026-10/gaps/refugees-notes.md), [round4b-notes.md](../../research/2026-10/gaps/round4b-notes.md), [flowback-notes.md](../../research/2026-10/flowback-notes.md), [flowback2-notes.md](../../research/2026-10/gaps/flowback2-notes.md), [china_military-notes.md](../../research/2026-10/gaps/china_military-notes.md), [other-notes.md](../../research/2026-10/other-notes.md)
- [Documentation index](../README.md)
