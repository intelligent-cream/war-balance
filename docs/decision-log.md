# Decision log: every decision, in the order it was made

[decisions.md](decisions.md) explains the method as it stands. This page records **how it got there**: each decision,
who raised it, why, and what it changed. "Owner" is the project's author; "reader" a Reddit commenter; "audit" an
independent review run on the project; "proposed" means suggested by Claude and accepted by the owner. Dates are
2026-10-17 to 2026-10-19; every decision is in the git history. Who raised each decision in rounds 1–6 is
reconstructed from the commit history and may be imprecise; corrections by the owner are welcome.

## Round 1–2: the question and the first map (17 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Map money moved toward Ukraine **and** toward Russia per country, not aid alone | owner | headline aid hides money still paid to Russia | the core of the project |
| Show it as **% of GDP**, with per person and total euros one click away | owner | compare small and large countries fairly | headline unit |
| Name: "Follow the Money: Ukrainian Aid"; EU-level aid as its own part | owner | clearer name; EU money is paid by members | EU aid split by budget share |
| Mark 2026 as January–August; show the data date | proposed | partial year must not look complete | `*` marks on estimated parts |
| Ranking, Ukraine-vs-Russia and table views; CSV and JSON download; share card per country | owner | let readers find and share their country | views and share pages |
| Corrections via Reddit and GitHub | owner | an anonymous project still needs a way to be corrected | link in the status line |
| Count **shipping and insuring Russian oil**, by owner country | proposed | money earned serving Russia's exports | new part ([why](decisions.md#shipping-russian-oil)) |
| **Services trade with Russia** (tourism, transport, business services), both ways, against the pre-war level | proposed | only goods were counted; a gap is estimated, never left at zero | new part: Cyprus toward Ukraine (gave up services sold to Russia), Tunisia and Georgia toward Russia (Russian tourists) ([why](decisions.md#services-and-tourism)) |
| **Undisclosed military aid** estimated beyond the Kiel tracker | proposed | hidden help to Russia was estimated, so hidden help to Ukraine needed the same treatment, or the picture leans one way | new part, about EUR 0.5–1.8bn a year ([why](decisions.md#undisclosed-military-aid)) |
| **Energy switching cost**: the extra price paid to replace Russian energy, in the cost view | owner, proposed | stopping Russian energy has a price; the owner asked for this "opportunity cost" | cost-view part, EUR 133bn (59–205) in total; Germany 34.5bn, Italy 18.5bn ([why](decisions.md#energy-switching-cost-and-oil-discount)) |
| **Discount gained on Russian oil** subtracted in the cost view | proposed | buyers of cheap Russian oil gain from it, the reverse of Europe's switching cost | cost-view part: India EUR 34bn, China 25bn at first ([why](decisions.md#energy-switching-cost-and-oil-discount)) |
| Count **refined fuel once**, at the buyer, not at the refiner and the buyer | audit | it had been counted twice | refiners' exports taken off |
| **Take freight out** of payments to Russia (CIF to FOB) | audit | freight goes to shippers, not Russia | payments lower by 3.5–7.5% |
| Gas priced **per country**; gas counted where burned | proposed | Hungary and Serbia paid different prices; transit countries do not burn the gas | gas price index per country |
| **ERA loans** (repaid from frozen Russian assets) left out of the donor's aid | audit | they cost the donor nothing | US and others lower than Kiel's headline |

## Round 3–4: profit, windfall and a tested baseline (17–18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Sales **to** Russia count as the seller's **profit**, not revenue | audit | Cyprus and Lithuania had been inflated by gross sales | big drop for service exporters |
| Ranges combine uncertainty sources **in quadrature** | proposed | adding worst cases overstated ranges | narrower, honest ranges |
| **War-time price windfall** on Russian fuel counts toward Russia for every buyer | proposed | the extra price is money Russia got only because of the war | Hungary, Slovakia, Türkiye toward Russia |
| **Expected trade without the war** from models back-tested on 2008, 2013 and 2016 | proposed | holding 2021 flat had no tested error | counterfactual with measured error |
| **Sanctions label**: how much of the move away from Russian trade was required | owner | buying less because it is banned is different from choosing to | label only, totals unchanged |
| **Baltic and Finnish transit** removed | audit | goods passing through are not those countries' purchases | Baltic figures corrected |
| **France's undisclosed aid** for 2022–23 taken out | audit | Kiel already holds it (it adopted France's official figure in Release 16), so it counted twice | France −1.3bn ([why](decisions.md#undisclosed-military-aid)) |
| Linked **documentation** for every method | owner | readers must be able to check the method | docs/ folder |

## Round 5: values at their real worth (18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| **Donated weapons at market value** | proposed | book values of old stock are arbitrary | donors' aid revalued |
| **Loans at their grant element** (10% discount rate) | proposed | a repaid loan costs less than a grant | loan-heavy donors lower |
| **Refugees at net cost** (minus refugees' taxes) | proposed | working refugees pay taxes | hosts with high employment lower |
| **Rosatom projects, Russian state loans, company exits, Russian-owned firms abroad** counted | proposed | money reaching Russia outside trade | new parts ([why: Rosatom and state loans](decisions.md#rosatom-and-russian-state-loans), [company exits](decisions.md#companies-leaving-russia)) |
| **Russian arms sales** to other countries counted, against the expected level | proposed | arms are almost wholly outside customs data; buyers who cut purchases moved toward Ukraine, those who kept buying paid Russia | new part: India, China, Egypt, Algeria toward Ukraine, Iran toward Russia ([why](decisions.md#weapons-bought-from-russia)) |
| **Laundered oil per EU member** from customs data | audit | the EU-wide split was wrong per member | EU members corrected |
| **Arms Ukraine bought abroad** counted as money flowing back | proposed | a seller earns from them | Czechia, Bulgaria earn back |

## Round 6: one rule for money, two balances (18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| **The money rule**: money earned counts at value kept × genuinely extra | proposed | a flat 20% profit was arbitrary | flowback and sales revalued |
| **Two balances**: with Ukraine and with Russia; earning from the war effort is never "toward Russia" | owner | a donor whose industry earned more than it gave is not pro-Russian | gold colour for net earners |
| **All-money ledger**: every euro for Ukraine followed to where it was spent | proposed | the US spends much of its aid at home | US earns back about half |
| **Payment agents' fees** and revalued **military support to Russia** | proposed | money and arms reaching Russia | new parts ([why: payment agents](decisions.md#payment-agents)) |
| Belarus's Russia-granted **loan deferrals left out**; sanction-blocked arrears labelled | proposed | not the borrower's choice | Belarus, Viet Nam corrected ([why](decisions.md#rosatom-and-russian-state-loans)) |
| Moldova **without Transnistria's unpaid gas** | proposed | it is support for Transnistria, not money to Russia | Moldova higher |

## Round 7: what the owner asked to add (18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Germany's cut of Russian gas counts **in its favour** | owner | it was a voluntary stance against Russia | kept as is |
| **Frozen Russian reserves**: the yearly return Russia lost (3–4% a year), credited to holders | owner | holding them denies Russia income | Belgium, EU members up |
| **Critical goods** (chips, machine tools) as a **marker**, not in the totals | owner | already inside trade; a marker shows it without double counting | ◆ on the map |
| **No-war energy prices** (pre-invasion forecasts and futures), not 2019–2021 prices | owner | market prices were already rising before the war | windfall about a third of before |
| **Remittances** from Russia counted; **relocants'** transfers and spending left out | owner, proposed | migrants' wages are money from Russia; relocants spend their own money | Tajikistan, Uzbekistan toward Russia ([why](decisions.md#remittances-from-russia)) |
| **Oil discount gain without Russia's normal pre-war discount** (about 5% below Brent) | proposed | that part of the discount existed before the war | India 34 → 24bn, China 25 → 18bn in the cost view ([why](decisions.md#energy-switching-cost-and-oil-discount)) |
| Narrower actual values for nine countries from national statistics | owner | ranges were too wide | narrower ranges |

## Round 8: narrower ranges and the interface (18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| No-war band for pipeline fuel buyers measured on **physical volumes** | owner | ranges for "less paid to Russia" were huge | Germany, Hungary, Poland narrower |
| **Remove the "above or below expectation" view** | owner | it rested on AI guesses, not data | view removed |
| Dark design by default with a light switch; flow lines on; Ukraine's name readable on phones | owner | the light theme did not work; the label was hidden | new design |
| Links keep the view, filters and year | owner | readers asked for direct links | shareable links |

## Round 9–10: what readers asked (18 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Check whether Australia's fuel from Russian crude is fair | reader | Australia's net of about zero looked wrong | investigated |
| The **buyer whose demand creates the sale** pays the crude money; the **refiner keeps the rest and its discount profit** | owner | follows the money: who paid, who profited | kept as is |
| **Measure the crude share** per refiner and year instead of a fixed 50% | owner | "find the real numbers, not fictional ones" | 63–82% after the war, about 90% before |
| **Trade counts at the seller's net gain** (taxes plus profit above a normal return); aid in full | reader, owner | a purchase is an exchange, aid is a gift | everyone moves toward zero, ranges halve |
| The same rule for **purchases from Ukraine** | owner | one rule for both sides | Ukraine's gain 5–18 cents per euro |
| **Russian-owned plants abroad** (Aughinish in Ireland and others) | reader | Rusal's Aughinish was missing | small amounts added |
| **Weighting by scarcity** (tanks count double) **not** adopted | reader suggested, owner declined | arbitrary multipliers; market value already reflects scarcity | roadmap: a separate "share of own stock given" marker |
| Full **audit** of rounds 9–10, all confirmed bugs fixed | owner | trust | price double count, LNG, refiners, Rosatom, gold fixed |

## Round 11: traceability (19 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Say plainly that the figures are **AI-compiled and not yet verified** | reader, owner | the numbers could not be traced to primary sources | banner and sources list |
| **Exact primary links** for every source; raw downloads kept in the repository | reader, owner | "indistinguishable from fabricated data" | [sources_r11.json](../research/2026-10/sources_r11.json), [raw/](../research/2026-10/raw/) |
| **Verify** aid, GDP, refugees, trade and fuel against primary data | owner | trust needs checks, not assurances | [verify_r11_aid](../research/2026-10/verify_r11_aid-notes.md), [verify_r11_trade](../research/2026-10/verify_r11_trade-notes.md) |
| Back every **assumption** with data where it exists, and say where it does not | owner | separate data from judgement | assumptions_r11_*.json |
| Every decision written down with reasons and evidence | owner | this page and [decisions.md](decisions.md) | |

## Round 11 audit: traceability (19 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Fix every stale figure and claim in the documentation and on the site, but **change no number on the map** | owner | the text had drifted from the data; changing values needs its own decision | no total or range changes |
| Cite the money-rule factors and Russia's net gain on **every part they weight**; stop showing sources that no longer produce a number | audit | a reader could not see where a factor came from | source lists only |
| Write down **eleven missing decisions** and every untraced constant, labelled data or judgement | audit | [decisions.md](decisions.md#constants-and-rules-written-down-in-round-11) claimed to list every choice | new section |
| Keep China's crude ratio 0.70, the loan cost band, the 10% discount rate, the single duty rate, Belarus's ±2% gas band, Hong Kong's 98% and Germany's 7% gas share as they are, and list them as **proposals** | audit, owner | each would change a number | [proposals](decisions.md#proposals-that-would-change-numbers-not-applied) |
| A refugee grade such as "A-B" counts at its **weaker letter**; Poland's refugee cost at most C | audit | the letters overstated how much was checked | four part letters; no total letter |
| Call the 10% loan discount rate a **judgement** | audit | it is not a current IMF or OECD standard | text only |
| Stop publishing the AI-guessed **incentive scores** | audit | the view was removed in round 8 and nothing reads them | smaller `data.json` |

## Round 12: data precision (19 October)

| decision | raised by | why | effect |
|---|---|---|---|
| Replace the six questionable values of the round-11 proposals with **measured** ones, one at a time, and record each change's effect | owner | a judgement should give way to data where data exist | [decisions](decisions.md#applied-in-round-12-data-precision) |
| Value loans at **opportunity cost: the real market rate Ukraine faced in the year of payout**, wartime included | owner | what the market would have charged is the consistent price of the money | first method; kept as the **high** end |
| Do not use the promised war yield (30–60%) as the central value: it is mostly **compensation for expected default**, which official lenders did not bear | owner | the IMF and World Bank are paid first; EU loans were left out of both debt deals; bilateral lenders only deferred. At the war yield, long loans become near-full gifts | central value split into two parts |
| **Gift = cheaper interest** (at Ukraine's 2021 rate, 6.7%) **+ the default risk the lender really carries** (the measured expected loss of its creditor class) | owner | separates the price of time from the price of risk, each measured | net shift: loans EUR 53bn instead of 64bn; Japan −0.06 points, EU members −0.04 to −0.05 ([loans](method/loans.md)) |
| Expected loss by class: IMF and World Bank 0; EU 9% (the EU's own provisioning rate for MFA loans); bilateral lenders the Group of Creditors' standstill in the cash flows; the 2026 Support Loan about 95% (repaid only from reparations) | owner, proposed | each from a fetched source; nothing judged where a measure exists | [loans](method/loans.md#by-loan-type) |
| Range: **low** = the 2021 rate, no loss for official lenders; **high** = the promised war yield of the year | owner | the low strips out all war risk; the high is the owner's first idea | [loans](method/loans.md#the-range) |
| **Cost view**: the same terms and expected losses at the lender's own funding rate, per loan item, with its own low and high; replaces the flat 26% | owner | the two views should share one set of numbers | Japan −0.07 points, EU members up to +0.07 ([loans](method/loans.md#the-cost-view)) |
| Every loan number has a **fetched source**; what could not be fetched is marked "not verified" and not used | owner | the same standard as round 11 | [loans evidence](method/loans.md#evidence), [sources_r11.json](../research/2026-10/sources_r11.json) |
| China's crude-to-fuel ratio from **China's own measured share** per year (not India's) | proposed | the research file has China's own value; it is closer than India's | China −0.005 points |
| Germany's gas already in customs **derived** from the audit's EUR 2.3bn and 3.5bn | audit, owner | 0.07 had no derivation | Germany −0.04 points |
| Belarus's gas band from the research (±8%, ±15%) where the price is assumed | audit, owner | ±2% was a judgement | none visible |
| Hong Kong's precious-metals share **measured** from UN Comtrade | audit, owner | 0.98 was not traced | Hong Kong +0.08 points |
| Decision B: each EU loan's expected loss is **the EU's own provisioning rate** for that loan (70% for the 2022 exceptional MFA and the repurposed EIB loans; 9% where the law sets 9% or no rate) | owner | the EU judged 9% not adequate for Ukraine in 2022 and set 70% (Decisions 2022/1201 and 2022/1628); MFA+ and the Ukraine Facility rest on budget headroom with no rate, so 9% stays | EU members +0.007 to +0.014 points; loans EUR 55bn instead of 53bn ([decisions](decisions.md#applied-in-round-12-data-precision), [loans](method/loans.md#by-loan-type)) |
