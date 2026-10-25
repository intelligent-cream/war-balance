# Method overview: one scale for every flow

The map gives every country two numbers for the time since the full-scale invasion, each against what it would have done without the war: **support for Ukraine** and **Russia's earnings from trade** (what Russia keeps: taxes and profit above a normal return, not the full price). Their sum, with the return Russia lost on its frozen reserves, is the **net**. Worldwide, Russia's net gain from buyers who cut fell by EUR 351.5bn<!-- n:WORLD.less --> and rose by EUR 213.9bn<!-- n:WORLD.more --> from buyers who bought more (2022–August 2026).

## The core idea in four steps

1. **Change, not totals.** Each flow is set against the level expected without the war ([counterfactual](#view=how&sec=m-counterfactual)). A country that kept buying the same oil shifted nothing.
2. **Volumes, valued at each year's prices.** Paying more for the same oil is not a change in behaviour, so trade is compared in volumes ([prices](#view=how&sec=m-prices)). The extra Russia earned from higher prices is a part of its own, the war-time windfall.
3. **Summed from 2022 to the chosen year** (2026 counts January–August).
4. **As % of one year's GDP**, the 2022–2024 average. It is a total for about 4.7 years, not a yearly rate.

## Every part of the net shift

<figure class="md-fig" style="margin:0 0 14px" role="img" aria-label="Money-flow diagram: a country gives to Ukraine (blue) and gets some back (grey); it pays Russia and earns from Russia (orange)">
<svg viewBox="0 0 400 420" width="100%" style="max-width:440px;height:auto;display:block" font-size="11">
<rect x="140" y="8" width="120" height="36" rx="6" style="fill:var(--surface);stroke:var(--ukr);stroke-width:2"/>
<text x="200" y="31" text-anchor="middle" font-weight="700" style="fill:var(--ink)">Ukraine</text>
<rect x="140" y="190" width="120" height="36" rx="6" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>
<text x="200" y="213" text-anchor="middle" font-weight="700" style="fill:var(--ink)">A country</text>
<rect x="140" y="374" width="120" height="36" rx="6" style="fill:var(--surface);stroke:var(--rus);stroke-width:2"/>
<text x="200" y="397" text-anchor="middle" font-weight="700" style="fill:var(--ink)">Russia</text>
<line x1="175" y1="186" x2="175" y2="60" style="stroke:var(--ukr);stroke-width:3"/>
<polygon points="175,48 168,62 182,62" style="fill:var(--ukr)"/>
<line x1="225" y1="48" x2="225" y2="174" style="stroke:var(--back);stroke-width:3;stroke-dasharray:5 3"/>
<polygon points="225,186 218,172 232,172" style="fill:var(--back)"/>
<line x1="175" y1="230" x2="175" y2="358" style="stroke:var(--rus);stroke-width:3"/>
<polygon points="175,370 168,356 182,356" style="fill:var(--rus)"/>
<line x1="225" y1="370" x2="225" y2="244" style="stroke:var(--rus);stroke-width:3;stroke-dasharray:5 3"/>
<polygon points="225,230 218,244 232,244" style="fill:var(--rus)"/>
<g text-anchor="end" style="fill:var(--ink)">
<text x="165" y="84" font-weight="700" style="fill:var(--ukr)">Gave Ukraine</text>
<text x="165" y="100">aid (loans as gifts)</text>
<text x="165" y="114">EU share, donations</text>
<text x="165" y="128">refugee hosting</text>
<text x="165" y="142">purchases from Ukraine</text>
<text x="165" y="262" font-weight="700" style="fill:var(--rus-text)">Paid Russia</text>
<text x="165" y="278">fuel and goods</text>
<text x="165" y="292">war-time fuel prices</text>
<text x="165" y="306">oil via other countries</text>
<text x="165" y="320">services, company taxes</text>
<text x="165" y="334">arms bought, Rosatom, profits</text>
<text x="165" y="348">weapons given to Russia</text>
</g>
<g style="fill:var(--ink)">
<text x="236" y="84" font-weight="700" style="fill:var(--back)">Flowed back (−)</text>
<text x="236" y="100">aid spent at home</text>
<text x="236" y="114">arms and goods</text>
<text x="236" y="128">sold to Ukraine</text>
<text x="268" y="204" font-size="10">+ Russian money</text>
<text x="268" y="217" font-size="10">frozen (net only)</text>
<text x="236" y="262" font-weight="700" style="fill:var(--rus-text)">Earned from Russia</text>
<text x="236" y="278">sales and services</text>
<text x="236" y="292">shipping, payment fees</text>
<text x="236" y="306">weapons sold to Russia</text>
</g>
</svg>
<figcaption class="key"><b>Blue minus grey</b> is support for Ukraine. <b>Orange</b> is Russia's earnings from trade: the change in each flow against a world without the war, at the seller's net gain. The net adds both and Russian money frozen.</figcaption>
</figure>

Each part in a country's panel opens its own method. In short:

| part | counted at | number | page |
|---|---|---|---|
| Aid to Ukraine (Kiel, adjusted) | weapons at market value, loans as gifts, when delivered | support | [aid](#view=how&sec=m-aid-refugees-military-aid) |
| Share of EU-level aid | by EU budget share | support | [EU aid](#view=how&sec=m-aid-refugees-military-eu-level-aid) |
| Hosting refugees | spending minus the host's gain | support | [refugees](#view=how&sec=m-aid-refugees-military-refugees) |
| Undisclosed aid, private donations | estimates beyond Kiel | support | [aid](#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations) |
| New IMF, World Bank, EBRD lending | gift value, by shareholding | support | [loans](#view=how&sec=m-loans-new-lending-by-the-imf-and-world-bank) |
| Extra purchases from Ukraine | Ukraine's net gain | support | [trade](#view=how&sec=m-trade) |
| Flowing back (−) | seller's net gain × extra share | support | [flowback](#view=how&sec=m-aid-refugees-military-flowback) |
| Less or more paid to Russia | Russia's net gain | trade | [trade](#view=how&sec=m-trade) |
| War-time fuel prices | Russia's gain on the extra price | trade | [prices](#view=how&sec=m-prices-war-time-windfall) |
| Russian oil via other countries | Russian crude inside the fuel | trade | [laundered oil](#view=how&sec=m-energy-and-laundered-oil-laundered-oil) |
| Sales to Russia | seller's net gain × extra share | trade | [trade](#view=how&sec=m-trade-profit-not-revenue) |
| Services, shipping | seller's net gain | trade | [services](#view=how&sec=m-services-shipping-companies-services) |
| Company taxes in Russia | profit tax + half of other taxes | trade | [taxes](#view=how&sec=m-services-shipping-companies-company-taxes) |
| Weapons and troops sent to Russia | paid: seller's gain; unpaid: in full | trade | [military](#view=how&sec=m-aid-refugees-military-military-support-to-russia) |
| Weapons bought from Russia | Russia's gain on arms | trade | [arms](#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia) |
| Rosatom, Russian state loans | payments against schedule | trade | [state finance](#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia) |
| Russian-owned firms' profits | against 2019–2021 | trade | [firms](#view=how&sec=m-russia-state-and-companies-russian-owned-companies-abroad) |
| Gold and hidden payments | Russia's gain on gold | trade | [gold](#view=how&sec=m-trade-gold-and-hidden-channels) |
| Payment agents' fees | financial industry's gain | trade | [agents](#view=how&sec=m-trade-payment-agents) |
| Russian money frozen | return Russia lost | net only | [frozen](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves) |

Labels that change no total: gas that **Russia cut off itself** (Poland, Bulgaria, Germany and others in 2022; Austria in 2024; the end of transit through Ukraine in 2025, counted only for gas still flowing the year before), and the share of a cut **required by sanctions** ([sanctions](#view=how&sec=m-trade-sanctions-mandated-or-own-choice)).

## Markers outside the totals

Shown on the map and in the panel, added to nothing:

- **Critical goods** (◆): sales to Russia of goods its weapons need; the money is already in the trade number ([marker](#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker)).
- **Wages from Russia** (△): migrants' remittances. They are individuals' wages, not a country's choice, and would swamp the ranking: Tajikistan would be about −40% of GDP; without them it is −0.88%<!-- n:TJK.net --> ([remittances](#view=how&sec=m-trade-remittances-and-relocants)).
- **Taken by Russia** (■): company assets Russia seized and forced-exit costs. Russia took them; the country did not choose to move them ([taken](#view=how&sec=m-russia-state-and-companies-taken-by-russia-not-in-the-totals)).

## One rule for every seller

> **Every sale counts at the seller's net gain × the share that is genuinely extra.**

- **Net gain**: the taxes the seller's state collects plus profit above a normal return on capital, as a share of the price. Wages, materials, transport and a normal return are real costs and do not count. For other countries' sellers it comes from OECD industry accounts (2021–2023).
- **Genuinely extra**: the share of a sale that would not exist without it (weapons about 0.6, sales lost to Russia 0.2–0.45, because many firms found other buyers).
- **In full**: aid, refugee hosting, unpaid weapons, taxes and profits paid to Russia, and the return on frozen reserves.

Manufacturing earns little above a normal return, so US weapons sold for Ukraine count at about 4% of their value.

## The net-gain rule

Aid is a gift: Ukraine gets EUR 1 and gives nothing back. Trade is an exchange: the seller gives up goods that cost money to make. So trade counts at the **seller's net gain**. The idea came from a reader on Reddit.

<figure class="md-fig" style="margin:0 0 14px" role="img" aria-label="Bar: of EUR 100 paid for Russian crude in 2023, 43 covers costs and a normal return, 47 is taxes, 10 is profit above a normal return; 57 counts">
<svg viewBox="0 0 400 92" width="100%" style="max-width:440px;height:auto;display:block" font-size="11">
<text x="0" y="12" font-weight="700" style="fill:var(--ink)">EUR 100 paid for Russian crude (2023)</text>
<rect x="0" y="22" width="172" height="26" style="fill:var(--mid)"/>
<rect x="172" y="22" width="188" height="26" style="fill:var(--rus)"/>
<rect x="360" y="22" width="40" height="26" style="fill:var(--rus);opacity:.6"/>
<text x="6" y="39" style="fill:var(--ink)">costs, normal return 43</text>
<text x="178" y="39" style="fill:var(--on-accent)">Russia's taxes 47</text>
<text x="380" y="39" text-anchor="middle" style="fill:var(--on-accent)">10</text>
<line x1="172" y1="56" x2="400" y2="56" style="stroke:var(--rus);stroke-width:2"/>
<line x1="172" y1="52" x2="172" y2="60" style="stroke:var(--rus);stroke-width:2"/>
<line x1="399" y1="52" x2="399" y2="60" style="stroke:var(--rus);stroke-width:2"/>
<text x="286" y="74" text-anchor="middle" style="fill:var(--ink)">counts: 57 (taxes + profit above normal)</text>
</svg>
</figure>

**Russia's net gain per euro**, central values:

| what Russia sells | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| crude oil | 0.62 | 0.62 | 0.57 | 0.58 | 0.45 | 0.55 |
| oil products | 0.52 | 0.58 | 0.54 | 0.51 | 0.38 | 0.52 |
| pipeline gas | 0.55 | 0.82 | 0.66 | 0.56 | 0.50 | 0.53 |
| LNG (Russian owners' part) | 0.31 | 0.52 | 0.44 | 0.31 | 0.33 | 0.31 |
| coal | 0.27 | 0.41 | 0.17 | 0.03 | 0.02 | 0.02 |
| all other goods | 0.17 | 0.14 | 0.12 | 0.10 | 0.10 | 0.11 |
| services | 0.026 | 0.029 | 0.032 | 0.030 | 0.036 | 0.036 |
| arms | 0.043 | 0.039 | 0.045 | 0.049 | 0.050 | 0.050 |
| gold | 0.37 | 0.31 | 0.38 | 0.47 | 0.56 | 0.64 |

Each country's payments take the gain of what it actually bought: its own mix of fuel and other goods, from its customs records. Russia's normal return is 11.4% a year on its capital (5% real plus Russia's risk premium). **Ukraine's** net gain is lower, about 0.03–0.05 per euro in 2022–2025: war-time logistics take much of the price and investors need a high return.

## Two numbers

- **Support for Ukraine**: aid, EU share, refugees, extra purchases from Ukraine, donations, new multilateral lending, minus money flowing back.
- **Russia's earnings from trade**: everything else. Positive means the country cut what Russia earns; the panel says it in words ("cut Russia's earnings from trade by 1.6%").

A negative support for Ukraine means the country **earned more from the war effort than it gave**, not money toward Russia; on the map such a country is grey.

## The cost view

What the war cost the country itself (aid at the lender's cost, the extra paid to replace Russian energy, income lost on sales to Russia, minus discounts gained on Russian oil). **The site does not show it**; the full data download keeps it ([Download the data](#view=how&sec=data)).

## Gross flows

The map shows changes, not gross totals, because gross totals include normal trade. Gross flows (paid to Russia, bought from Ukraine, aid) are in each panel's small charts, in the downloads and as an option in Filters.

## How the map shows it

**One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change (or support below zero), faded where the direction is not certain. **Money streams** show the two numbers in euros, never gross trade. **What's counted** lets you switch parts off; every total, range and grade follows, and the page says "Custom mix, not the official figures".

## Rules that apply everywhere

- **Counted where used**: gas where it is burned, fuel resold by hubs at the final buyer, goods re-exported by hubs at the country that made them.
- **Counted once**: automated checks test for double counting.
- **Rankings** leave out economies under EUR 5bn GDP. Each headline number says how likely its direction is, from simulating its parts: **certain** at 95% or more with every method choice agreeing; otherwise ranked faded, labelled **leaning** (at least 65%), **near zero** or **uncertain**. Among 163<!-- n:WORLD.nBig --> economies above EUR 5bn, 93<!-- n:WORLD.uncNet --> are not certain on the net.
- **Parties to the war**, Belarus and North Korea, are listed under the ranking, not ranked. Russia invaded Ukraine from Belarus (UN resolution ES-11/1); North Korean troops fought for Russia in Kursk from late 2024.

## No data

A trade part counts only where the country has **its own observation for the war years**: a figure it or its partners report for 2022–2025, or a country-specific record from the research (tanker tracking, national statistics, a refinery's exports). A trend carried forward, or Russia's import gap split by shares, is not an observation.

**Why**: without an observation the number would be our guess about that country, not its record. A part with no observation counts as zero and is named under the trade section as "No data". A country with nothing observed at all is hatched on the map, with no tags and no ranking. This affects 74 economies and territories, mostly small; the list is in the research files.

## Decisions behind the method

The main choices, why they were made and what they do to the numbers. The [full changelog](https://github.com/intelligent-cream/war-balance/blob/main/docs/changelog-full.md) has the evidence for each.

| decision | why | effect |
|---|---|---|
| Compare with a world without the war, not with zero | buying as before is not a choice; buying less is money Russia did not get | every trade part is a change |
| Total since 2022 as % of average 2022–2024 GDP | compares small and large economies; one bad currency year does not decide | Nigeria +0.44%<!-- n:NGA.net --> (+0.81% against 2024 GDP alone) |
| Trade at the seller's net gain | aid is a gift, trade an exchange | Lithuania +27.8% → +14.8%, Poland +8.1% → +4.1% (round 10) |
| One rule for every seller, × the genuinely extra share | sales to Russia, to Ukraine and flowback on one scale | Belarus −18.5% → −5.6% (round 13) |
| Aid from Kiel allocations, counted when delivered | the most complete database; much military aid arrives years later | US EUR 10.2bn, Germany 4.3bn not yet delivered |
| Donated weapons at market value | the value to Ukraine, not the donor's book value | bilateral military aid −14% |
| Loans at their gift to Ukraine | a repaid loan is worth less than a grant; the war yield prices default official lenders did not carry | EUR 96.5bn face → about 55bn |
| Refugees: spending minus the host's gain on refugees' work | refugees' taxes are their own income | Poland net +4.40% → +5.00% (round 24b) |
| Money flowing back is subtracted | a donor's industry earns from aid spent at home | the US earns back about EUR 2bn |
| War-time fuel prices count, against prices a no-war market expected | the premium cost Russia nothing to produce; 2019–2021 prices would overstate it threefold | Germany EUR 16.5bn<!-- n:DEU.part_windfall abs --> toward Russia |
| The 2026 Hormuz spike is not a war windfall | this war did not cause it | 2026 no-war price = actual world price |
| Gas counted where it is burned | transit countries do not pay for gas they pass on | Germany, Slovakia, Bulgaria, Türkiye |
| Fuel from Russian crude charged to the final buyer | the buyer's demand creates the sale; the refiner keeps its margin | Nepal, Tanzania toward Russia |
| Re-exports count for the country that made the goods; Baltic transit taken out | otherwise the hub looks like the supplier; final buyers already record transit goods | Lithuania would be +45% of GDP |
| Seizures and forced exits not in the totals | Russia took them; the country did not choose to move them | Germany net +3.23% → +3.50% (round 14b) |
| Remittances only as a marker | individuals' wages, not a country's choice | Tajikistan −39.6% → −0.8% (round 13b) |
| Frozen reserves: the return Russia lost, a third to the host | an EU decision; Belgium and Luxembourg carry the legal risk | Belgium EUR 7.4bn |
| No data, no number | no country is ranked on our guesses about it | 74 economies; at most 0.2 points above EUR 5bn GDP |
| Uncertain numbers stay in the ranking, faded | hiding them hides information | 65% threshold is a judgement |
| Belarus and North Korea are parties to the war | Russia attacked from Belarus; North Korean troops fought in Kursk | shown, not ranked |
| No-war model uses actual 2022–2026 GDP and trade; ranges stay at the tested 90% | a war-shrunk economy is not a choice; widening every range for rare shocks blurs more than it helps | ranges cover 77–79% when Russia's own economy moves |
