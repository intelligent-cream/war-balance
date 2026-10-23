# Aid, refugees, military support and flowback

The Ukraine side of the ledger: government aid, each EU member's share of EU-level aid, undisclosed military aid, private donations and the cost of hosting refugees. On the Russia side, weapons and troops sent to Russia. In between, flowback: aid that returns to the donor's own economy as orders for its own industry.

Details for developers: [lead times, factors, sources and research files](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/aid-refugees-military.md).

## Aid

Aid comes from the [Kiel Institute Ukraine Support Tracker](https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/) (release of 8 October 2026, data to 31 August 2026): **allocations** (delivered or contracted), not pledges. For the 190 countries outside Kiel, UN and government records fill the gap; countries with no record anywhere get zero with a small upper bound.

Four adjustments, which is why the map's figure differs from Kiel's (the panel shows both):

- **Military aid counts when delivered.** Much of it, above all what is bought from industry, arrives years after it is allocated. Each allocation is spread over a lead time by channel (donor stocks 3 months, US procurement 4.5 years), calibrated to the Pentagon's 57% delivered by March 2026. Not yet delivered by August 2026: the US EUR 10.2bn, Germany 4.3bn. Kiel's full allocation is the high end.
- **Donated weapons at market value**, not book value (below).
- **Loans at their gift to Ukraine**, not their face value (below).
- **G7 loans repaid from frozen Russian assets are left out**: Russia pays for them.

From Kiel to the map, € billion, bilateral aid to August 2026 (each member's share of EU-level aid is a part of its own). "Other": countries outside Kiel and rounding.

| Donor | Kiel | G7 loans Russia repays | Not yet delivered | Loans at gift value | Weapons at market value | Other | **Map** |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| United States | 115.38 | −18.34 | −10.20 | 0.00 | −7.01 | +0.01 | **79.84** |
| Germany | 30.84 | 0.00 | −4.33 | −0.16 | −0.49 | 0.00 | **25.86** |
| United Kingdom | 22.80 | −2.65 | −1.86 | −3.54 | −2.67 | +0.01 | **12.09** |
| Canada | 14.85 | −3.26 | −1.31 | −3.48 | −0.18 | 0.00 | **6.62** |
| Japan | 14.42 | −1.58 | −0.01 | −7.94 | −0.03 | +0.01 | **4.87** |
| Denmark | 11.74 | 0.00 | −1.98 | −0.03 | −0.68 | +0.01 | **9.06** |
| Norway | 11.53 | 0.00 | −2.04 | 0.00 | −1.06 | +0.01 | **8.44** |
| Sweden | 11.33 | 0.00 | −2.04 | −0.26 | −2.44 | 0.00 | **6.59** |
| Netherlands | 11.20 | 0.00 | −0.97 | −0.22 | −1.31 | −0.01 | **8.69** |
| France | 7.91 | 0.00 | −1.48 | −0.57 | −1.59 | −0.01 | **4.26** |
| Poland | 5.89 | 0.00 | −0.28 | −0.87 | −1.78 | −0.01 | **2.95** |
| Italy | 4.31 | 0.00 | 0.00 | −0.18 | −0.75 | 0.00 | **3.38** |
| **All countries** | 283.12 | −25.83 | −28.11 | −17.93 | −24.68 | +0.65 | **187.22** |

Refugee hosting is not in Kiel's aid. For EU hosts, 2022–2025, Kiel's modelled cost (cited by the European Parliament's research service) is €163bn; the map counts €74bn: what governments actually spent (€79bn), minus what donors paid back and the host's gain on refugees' work. Kiel models about €10,800 per refugee-year; the budgets paid about €5,300. Spending per refugee differs widely: the Netherlands about €24,000 a year, Poland about €2,400.

### EU-level aid

Aid from EU institutions is split over the 27 members by their share of the EU budget, Kiel's own method. The 2026 EU Support Loan is guaranteed by 24 members, so Czechia's, Hungary's and Slovakia's slices go to the other 24. The European Peace Facility is not counted: it reimburses members for weapons already in their own aid, so adding it would count them twice ([limitations](#view=how&sec=limitations)).

### Donated weapons at market value

Donors value weapons from their stocks very differently (the US at replacement cost until 2023, the UK at replacement cost far above book value). The map counts **what the equipment would fetch on the market**: old MiG-29s at a fraction of their recorded value, shells above it because their price doubled. This lowers bilateral military aid by about 14% (EUR 177bn → 152bn), most for the US, the UK and Sweden; Germany's mostly new purchases barely move.

### Loans at their economic value

A loan that is repaid is worth less than a grant. Each loan counts at its gift: cheaper interest plus the default risk the lender really carries. Over 2022–2026, EUR 96.5bn of loans at face value become about 55bn. The full method is on the [loans page](#view=how&sec=m-loans). New IMF, World Bank and EBRD lending counts only above pre-war levels, credited by shareholding.

## Undisclosed aid and private donations

- **Undisclosed military aid** beyond Kiel (certainty C–D): Germany's 2026 appropriations above what Kiel records, Italy's classified decrees, France's 2024 gap.
- **Private donations**: national totals for 2022 (Germany, UK, Netherlands, Switzerland, US), a share of GDP elsewhere (a judgement), falling sharply after 2022. Largest 2022–2026: the US EUR 2.6bn, Germany 1.3bn, the UK 0.8bn.

## Refugees

Hosting refugees from Ukraine counts toward Ukraine at **what all levels of government actually spend on them**, minus what donors paid, minus the host's **real gain on refugees' work** (the extra profit and taxes on production their work creates). Refugees' own wages and the taxes on them are their income, not the host's gain, so they are not subtracted.

- **Sources**: government budgets and audit offices for 27 hosts; elsewhere a model of refugee-years × a cost per person calibrated on those budgets (certainty C).
- **One definition**: where a reported figure covers only part of government (Germany's federal budget, Poland's Aid Fund), 2022 is scaled up by the gap broad estimates (OECD, Kiel) show.
- **Hosting 2022 to August 2026**: Germany EUR 35.5bn<!-- n:DEU.part_ref -->, Poland 10.6bn<!-- n:POL.part_ref -->, Czechia 3.1bn.
- **Not the aggressor's side**: Russia is not credited as a host (the International Criminal Court's arrest warrants concern the deportation of Ukrainian children). Belarus's hosting (about EUR 0.1bn) is a label, not support: Belarus is a party to the war.
- **The method band** shows refugees at one common cost per person for every host, since the same refugee is worth EUR 0 to 20,000 a year depending on the host's welfare system.

### Refugee spending flowing back

Money spent hosting refugees is spent in the host's own economy (rent, food, shops). Only the host's real gain on it is subtracted, under the [one rule](#view=how&sec=m-overview-one-rule-for-every-seller): about 2.7% of the hosting cost overall (Germany 2.2%, Poland 7.3%).

## Military support to Russia

"Weapons and troops sent to Russia", always toward Russia:

- **North Korea**: shells, missiles and troops. Full value 2022 to August 2026 EUR 10.0bn (likely 6.8 to 18.6), from South Korean studies read through press reports; the volumes are confirmed by the sanctions monitoring team's report of May 2025 (MSMT/2025/1), which gives no prices.
- **Iran**: Shahed drones and missiles under contract, about EUR 3.5bn.
- **Belarus**: ammunition from army stocks.
- **China**: only what is **not** in recorded trade (unrecorded military items, smuggled dual-use goods, services), EUR 0.17–0.33bn a year.

**Paid deliveries count as sales**: what Russia paid for, also in kind (technology, fuel, food), counts at the seller's net gain, like any sale; what it did not pay for counts in full. North Korea was largely paid in kind; about half its shells were old stock with no other use. A method-band alternative counts only what was seen flowing back to Pyongyang, which moves North Korea's net from about −11% to −32% of GDP. North Korea is a party to the war and not ranked.

The Russia panel's list **"Armed Russia"** shows all deliveries at full value (North Korea EUR 8.8bn, Iran 3.5bn, China 1.3bn, Belarus 1.3bn); the totals do not change.

### Sources and values

| supplier | 2022–Aug 2026, EUR bn (range) | certainty | main evidence |
|---|---|---|---|
| North Korea | 8.8 (3.3–17.6) | C | 6.5–15m shells, 150–280 missiles, troops' pay |
| Iran | 3.5 (1.5–5.5) | C | drones 2022–23, the Alabuga licence, ballistic missiles |
| Belarus | 1.3 (0.55–2.7) | D | ammunition from army stocks |
| China | 1.3 (1.0–3.0) | D | unrecorded military items |

Volunteers for Ukraine and fighters for Russia are shown as counts, not money.

## Flowback

Part of aid comes back to the donor as orders for its own industry. Counting the full aid while ignoring this would flatter big arms producers. Each seller's flowback is its own aid spent at home (including replacing donated stock), other countries' aid spent there, Ukraine's own arms purchases there, aid spent there on energy and rebuilding, and extra sales to Ukraine. It counts at the **seller's net gain × genuinely extra**: arms makers earn little above a normal return, so the US earns back only a few percent of the money spent in its economy. The "money flowing back" switch on the map turns it off.

### Services sold to Ukraine

Since round 39 extra **services** sold to Ukraine count as flowing back too, like extra goods: transport on the solidarity lanes and other services the sellers report (Eurostat, OECD-WTO), and Ukrainians' own card spending abroad (the National Bank of Ukraine), spread over hosts by refugee numbers. Each at the seller's real gain times the share that is genuinely extra; host governments' refugee spending is not in it (that is refugee hosting). About EUR 1bn in all; Poland −0.06% of GDP, the most.

### Arms Ukraine bought abroad

Weapons Ukraine bought from foreign sellers, with its own budget or donors' cash (the Czech ammunition initiative, Bulgarian and Serbian shells, Patriots from the US), are money flowing back to the seller too: about EUR 21bn over 2022–2026, Czechia 5.7bn gross, Bulgaria 5.0, the US 4.1.

### The all-money ledger

Flowback comes from one ledger of all money that reached Ukraine, EUR 437bn: every Kiel allocation, undisclosed aid, IMF and World Bank money, private donations and Ukraine's own arms purchases abroad, each assigned once to where it was spent. EUR 220bn was spent in Ukraine (mostly pensions, social payments and salaries), 71bn in the payer's own economy, 69bn elsewhere. Weapons given from stocks (EUR 72bn) earn nothing unless the donor bought replacements. The US earns back EUR 2.08bn<!-- n:USA.uaBackEur -->, and its support for Ukraine is EUR 82.5bn<!-- n:USA.uaEur --> (0.32%<!-- n:USA.ua --> of GDP).
