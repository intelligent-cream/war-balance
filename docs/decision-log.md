# Decision log: every decision, in the order it was made

[decisions.md](decisions.md) explains the method as it stands. This page records **how it got there**: each decision,
who raised it, why, and what it changed. "Owner" is the project's author; "reader" a Reddit commenter; "audit" an
independent review run on the project; "proposed" means suggested by Claude and accepted by the owner. Dates are
2026-10-17 to 2026-10-20; every decision is in the git history. Who raised each decision in rounds 1–6 is
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

## Round 13: one rule, two numbers (19 October)

An independent review by an economist and a data journalist ("audit") raised every point below; the owner approved each. Details, data and effects: [decisions](decisions.md#round-13-one-valuation-rule-for-every-seller).

| decision | raised by | why | effect |
|---|---|---|---|
| Fix the **fuel-mix bug** (volumes at 2019–2021 prices, not no-war prices) and add a check | audit | the fuel share of what was bought was understated from 2022 | Hungary −4.1 → −5.5, Slovakia +1.3 → −0.1, India −2.3 → −2.8 |
| Deflate **gold** with the gold price | audit | Hong Kong's palladium-heavy mix inflated its volume of gold 1.3–3 times | Hong Kong −4.2 → −1.9 |
| **One valuation rule** for every seller: net gain (taxes plus profit above a normal return, OECD STAN) × genuinely extra, for sales to Russia and Ukraine, flowback, services, shipping, payment agents and paid weapons | audit, owner | the rules for Russia and for everyone else differed tenfold | Belarus −18.5 → −5.6, Cyprus +6.1 → −0.3, US +0.36 → +0.48 |
| **Remittances** at the migrant's net gain: the war wage premium and the premium over the home wage | audit, owner | wages pay for real work | Tajikistan −38.3 → −39.6 (its war wage premium is real), Kyrgyzstan −6.1 → −7.5 |
| **Weapons to Russia**: paid (also in kind) as a sale at the seller's net gain; unpaid in full | audit, owner | payment in kind is payment | North Korea −30.0 → −10.2 |
| **EU refiners** charged to their buyers, like India's and Türkiye's | audit | the same crude was treated two ways | Lithuania −2.5, the Netherlands −0.9, Finland −0.6 |
| **Laundered oil** in volumes, both ways | audit | the only trade part in money and rises only | Estonia +2.2, Latvia +2.7, Togo +6.8 |
| **Two headline numbers**: support for Ukraine and the change in payments to Russia, the net as their sum, everywhere; gas Russia cut off itself labelled | audit, owner | "less paid to Russia" is not money moved to Ukraine | wording, ranking by either number, exports |
| **Certainty**: stacked models at best C; correlated errors; a **method band** next to the 90% range | audit | letters and ranges overstated the evidence | letters and ranges only |
| **Windfall** at Russia's net gain on the extra price | audit, owner | the same rule as volumes | Japan and Spain lose about a fifth of their windfall |
| **Units**: the period total against one year's GDP, with an average-year line | audit | the total was read as a yearly rate | display |
| Text: MSMT troops 11,000 + 3,000; "Aid (Kiel, adjusted)"; Yemen's 2023 price index; exact source links; research scripts in the repository; PhosAgro margins fetched | audit | errors and untraced inputs | Yemen −9.7 → −7.8 |
| Loans (6.7% plus expected loss; EU provisioning rates) kept, the critique recorded | audit, owner | decision B is the owner's choice | none |
| **Remittances out of the totals, shown as a marker** ("depends on wages earned in Russia": the change in what migrants sent from Russia, % of GDP, with its range). Reverses the owner's round-7 decision to count them | raised by audit, owner decided | they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over the migrant's alternatives is small and hard to measure; and they dominated the bottom of the ranking (Tajikistan −39.6, almost all remittances) ([why](decisions.md#remittances-from-russia)) | Tajikistan −39.6 → −0.8, Uzbekistan −14.5 → −6.1, Kyrgyzstan −7.5 → −4.9, Armenia −2.9 → −1.6, Belarus −5.6 → −5.0 |
| **Laundered oil through EU refiners counted only where both routes are measured**: where the route that replaced EU-refined fuel after the EU ban is not measured for a buyer, its 2023–2026 values are held at the expected level ("route not measured after 2022") | raised by audit, owner decided | small fuel importers got large "less paid to Russia" credits because our post-war data do not trace their fuel from India and others, not because they changed what they did ([why](decisions.md#round-13b-remittances-as-a-marker-laundered-oil-routes)) | Togo +6.61 → −0.05 (out of the top 10), Marshall Islands +6.2 → +0.9, Gibraltar +2.9 → −0.1, Tunisia −5.5 → −7.1, Georgia −1.1 → −2.5; EU members unchanged |

## Round 14: independent audit 3 (19 October)

A third independent review ("audit 3", economist and data journalist) raised every point below; the owner approved each, with instructions for C1–C4, H1–H5, M1–M6 and L1–L5. Details, data and effects: [decisions](decisions.md#round-14-independent-audit-3); all steps: [changelog](changelog.md#round-14).

| decision | raised by | why | effect |
|---|---|---|---|
| Use the **measured fuel share** in Russia's gain on what was bought (C1), and **customs values** for what was bought each year, not tracker tonnes (C2) | audit, owner | a 60-country average and tonnes that contradict customs drove the bottom of the ranking | Yemen −7.86 → −6.86 (both), Uzbekistan −6.15 → −3.53, Tunisia −7.09 → −4.92, Libya −5.20 → −7.03 |
| **FOB on both sides** of the windfall: freight surge taken out of customs values (C3) | audit, owner | the freight surge counted as Russia's windfall and again for shipowners | India −2.74 → −2.38, China −1.03 → −0.72, Türkiye −3.08 → −2.62 |
| **Share cards**: "cut off by Russia" only where it happened; earners "earned from Russia" (C4); **flowback text** from the data (H1) | audit, owner | misleading, quotable text | display |
| **Nigeria, Lebanon, Belgium, Malta** artefacts: growth on its own base, fuel price screen, structural label (H2); **hubs pass EU-refined fuel on** (H3) | audit, owner | modelling artefacts and circular counting | Nigeria +1.51 → +0.93, Belgium +3.15 → +2.69, Malta +1.42 → +0.75 |
| **Method band** with the choices that move results; honest range wording; grades by primary-data share (H4) | audit, owner | the band and the letters no longer informed | letters 1 A, 5 B, 209 C, 16 D |
| **Cut label** completed with evidence (Latvia, Moldova, Austria, France; Poland from volumes) (H5) | audit, owner | incomplete list, regulation cited instead of evidence | labels only |
| **Normal return** 5% real after tax + country risk premium; services without real estate (M2) | audit, owner | inflation was subtracted twice | US flowback 2.2% → 3.6% of the money; Cyprus +0.4, Belarus −0.4 |
| **Current euros** for every trade part (M5); **seizures** counted (M4); **frozen reserves** on their own line (M6); sign-aware correlations (M3); fairness note (M1) | audit, owner | units, coerced transfers and wording | Lithuania +10.50 → +11.91, Estonia +9.57 → +11.17, Austria +0.20 → −0.43, Hong Kong −2.36 → −4.16 |
| Russia's and Ukraine's normal returns checked against 5% real + their premium, relabelled after tax, **not recomputed** | audit (check), owner (instruction to check) | per-group capital bases are not all recorded | none; recorded as an open issue |
| Docs, legend, Iran note, price source, China's dual-use note, INSS search (L1–L5) | audit, owner | stale or missing text | display |

## Round 14b: taken by Russia, and one normal return (19 October)

Two changes, both **raised by the owner**. Details: [decisions](decisions.md#round-14b-taken-by-russia-not-in-the-totals)
and [decisions](decisions.md#round-14b-russias-and-ukraines-normal-return); steps and effects in the
[changelog](changelog.md#round-14b).

| decision | raised by | why | effect |
|---|---|---|---|
| **Seizures and forced exit costs out of the totals, counted as a cost carried** (reverses round 5's forced discounts and exit fees and round 14's M4 seizures); shown in the panel, table, CSV, JSON and as a map marker; check 25 | owner | a loss imposed on the country's companies and a gain for Russia; the country did not choose to move that money | Finland +0.88, Austria +0.72, Ireland +0.54, Denmark +0.52; cost view up by the same amounts |
| **Russia's and Ukraine's normal return as for every seller**: 5% real + the country risk premium, on book capital as a nominal USD rate (Russia 11.4%, Ukraine 23.0%); capital per unit of revenue measured for every product group | owner (after the round-14 check) | one rule for every seller; the files subtracted 2.4 and 15 points too little | Estonia −1.27, Lithuania −1.12 (from Russia's lower gain shares, not Ukraine's normal return), Moldova −0.99, Libya +0.86, Yemen +0.75 |

## Round 15: separate maps, named lists and a stricter ranking (19 October)

A fourth independent review (economist and data journalist) raised every point below except two, which the **owner
raised**; the owner approved each. Details, data and effects: [decisions](decisions.md#round-15-separate-maps-named-lists-and-comparable-numbers);
all steps: [changelog](changelog.md#round-15).

| decision | raised by | why | effect |
|---|---|---|---|
| **Support for Ukraine is the default map**; the change in payments to Russia a second map with the world total; the net a third, with a warning (C1) | review, owner | the net adds two different things and credits each buyer with a market-wide effect | display |
| **"Paid Russia more than before the war" and "Armed Russia"** replace "Who helps Russia the most" (C2) | review, owner | poor fuel importers ranked above Iran | display |
| **Main part named** on cards, OG text, share text and panel (H2); **period and average year** on every shared figure (L3); Nigeria's structural label (L2) | review, owner | windfall-driven numbers read as behaviour; totals read as yearly rates | display |
| **Russia never credited for hosting; Belarus's hosting a label** | owner | the aggressor and a co-belligerent | Belarus support +0.16 → 0 |
| **Six more method-band alternatives**, a band per number, **ranking only where no alternative or range changes the sign**, **new grades** (H3) | review, owner | the band, the ranking and the letters did not inform | 104 economies ≥ EUR 5bn uncertain on the net; net letters 6 B, 51 C, 106 D |
| **Average 2022–2024 GDP** (M1); **Power of Siberia** in China's no-war path (M2); **Hormuz** note and "2026 at 2025 prices" (owner; M4); **one refugee definition** (M5); Ukraine's premium per year | review, owner (Hormuz) | denominator, contracted gas, unrelated price shock, comparability | Nigeria +0.81 → +0.44; China −0.66 → −0.63; Poland support +1.11 → +1.95 |
| **Docs figures checked** by `check_docs_numbers.py` (H4) | review, owner | stale docs | none |
| **The net first, then its two parts** (replaces support for Ukraine as the default); the gross **To Ukraine** and **To Russia** views removed; **"Cost carried" renamed "Cost to the country"** | owner | the gross views include normal trade and measure something different; the cost is already net of gains | display; old links open the nearest view |

## Round 16: review 5 (20 October)

A fifth independent review (economist and data journalist) raised the points below; the **owner approved** each and
**kept the net as the default view and ranking** (the review asked to stop ranking it). Two points were the owner's
own additions to the brief: the "Russia's net gain" wording and refugee spending flowing back. Details, data and
effects: [decisions](decisions.md#round-16-review-5); all steps: [changelog](changelog.md#round-16).

| decision | raised by | why | effect |
|---|---|---|---|
| **The method band's alternatives load before anything is drawn**, and a real-browser check compares the page with the Node model (C2) | review, owner | the page ranked countries its own rule leaves out | the browser shows what the checks report |
| **Poland's refugee scope factor in 2022 only**; Germany's later years at the reported federal figure (H1) | review, owner | a 2022 projection applied to every year | Poland support +1.95 → +1.28 (with step 13) |
| **The superseded valuation rule leaves the method band** (H5) | review, owner | it is no longer a reasonable alternative | Bulgaria, Czechia, India, Kuwait, Nigeria ranked on support |
| **Redirected trade on both sides**, half against each (H6) | review, owner | the world total of the alternative had the wrong sign | bands |
| **"Russia's net gain"**, not "paid", for the world totals | owner (from review H3) | they are net gains | wording |
| **EU-level aid text**: the EPF not in it, and why; text and bar the same figure (L1) | review, owner | the text contradicted Kiel and the bar | wording |
| **Adjusted aid graded by its adjusted share**; stale metadata marked (L4, L2) | review, owner | modelled adjustments were graded A | Estonia, Latvia support B → C |
| **Colour scale set by economies of at least EUR 5bn** (L3) | review, owner | micro-states looked darker than India | display |
| **The net stays the default and ranked** | owner | simplicity, with the warning line | none |
| **"Russia's gain from this country rose"** with each entry's cause; arms suppliers on "Armed Russia" only (H3) | review, owner | North Korea headed a list of payments | display |
| **Russian money frozen on its own line**, in the net only (H4) | review, owner | it is not a payment | Belgium payments +1.86 → +0.62 |
| **One common cost per refugee** in the method band (H2) | review, owner (actual cost kept on the map) | the same refugee was worth 0 to 20,000 euros | bands |
| **Refugee spending flows back** at the host's real gain (M3) | owner (from review M3) | weapons bought at home were netted, refugee spending was not | 2.7% of hosting cost |
| **Small flows from the 2019–2021 average** (M2; the median since round 16b) | review, owner | single-year noise in small flows | Cameroon +0.80 → +0.36 |
| **Hong Kong keeps only the gold that stays there; gold volume at the no-war gold price** (M1, M6) | review, owner | gold passed on and the gold price were charged to Hong Kong | Hong Kong −4.27 → −1.59 |
| **"Required by sanctions" from each country's actual stop date** (M4) | review, owner | Lithuania stopped Russian crude before the ban | Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%) required (label) |

### Round 16b: check 16 (20 October)

A pre-release check of round 16 found that Brunei's rise came from a mislabelled field (B1) and that the new colour
clamp painted negative micro-states as "no change" (B2), with ten smaller points. The **owner approved** the fixes.
Details: [decisions](decisions.md#round-16b-fixes-after-check-16); steps: [changelog](changelog.md#round-16b).

| decision | raised by | why | effect |
|---|---|---|---|
| **Small-flow baseline: the median of 2019–2021 at pre-war prices, from the yearly series**; refinery openings and closures (Brunei, New Zealand) and mirror-only data (Syria) keep 2021 (B1, N1) | check, owner | the "average" was 2021 at 2021 prices for 28 flows; one-off years decided the mean | Brunei +5.04 → +2.35, Malta +0.79 → +0.28 (payments) |
| **Lightest colour of each direction for small economies** (B2) | check, owner | negatives fell into the neutral colour | display |
| **Site text, share text and the net map's legend** (N2, N3, N10) | check, owner | the text said 2021 for every flow; "−<0.01% to +<0.01%"; frozen money unnamed | wording |
| **Refugee spending through retail, accommodation and food, and rent** (N4) | check, owner | finance and ICT were in the services group | Poland's factor 8.2% → 7.3% |
| **"Gold at its actual price" in the method band** (N5) | check, owner | part of the gold price rise may be the war's | bands |
| **Poland's pipeline crude "cut off by Russia"** (N6) | check, owner | Russia halted Druzhba | label |
| **The page works without `detail.json`** (N7) | check, owner | a failed file blocked the page | display |
| **Ranges and the warning in shared text and on the cards** (M5) | review, owner | shared figures dropped the uncertainty | display |

## Round 17: redesign, the map first (20 October)

The owner compared the first-view prototypes A, B and C and **chose B**: the map first, with money streams, v2's
country panel and highlights, and concept 2's "what's counted" switches. **No number changed.** Details:
[decisions](decisions.md#round-17-redesign); steps: [changelog](changelog.md#round-17).

| decision | raised by | why | effect |
|---|---|---|---|
| **Map first**: on load only the slim research-preview banner, one header line with ⓘ, a one-row legend and two buttons (Highlights, Filters) | owner | the controls covered the map | display |
| **Filters collapsed by default**, with a dot when anything differs | owner | one place for every control | display |
| **One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change; no teal, no bivariate map; "too close to call" grey without dots (later in round 17, at the owner's request, a faded colour of its leaning direction instead); gold gone; the EUR 5bn colour clamp kept | owner | two directions, two hues | display |
| **"Kept from Russia"** replaces "Change in payments to Russia" everywhere, with the sign in words ("paid Russia €65.8bn (1.6% of GDP) less than without the war") | owner | the old name read as "paid more" next to a plus | wording; CSV and JSON fields renamed |
| **Streams = the map's numbers**: support to Kyiv, how much more was paid to Moscow, in €; top 12 each way; off on phones; the gross flow lines optional | owner | one story on one map | display |
| **What's counted**: switches that recompute everything through `calc()`, with a "Custom mix, not the official figures" note and reset; custom mixes are not shared | owner | readers asked for it; the note keeps it honest | none by default |
| **Highlights** with the corrected Baltic chip (Lithuania's cut mostly its own choice) | owner | stories one click from the map | display |
| **Method on the bars**: each part of a country opens its how, why, sources and links | owner | the method sits on the number | display |

## Round 19: one place for every filter (21 October)

The owner asked for a simpler interface: every filter in one drawer that stays open, the views listed at its top, and
no cost view. **No number changed** for the net, support for Ukraine or kept from Russia. Details:
[decisions](decisions.md#round-19-one-place-for-every-filter); steps:
[changelog](changelog.md#round-19-one-place-for-every-filter).

| decision | raised by | why | effect |
|---|---|---|---|
| **Views at the top of Filters** (Map, Ranking, Ukraine vs Russia, Table & data, Sources); How it works and the Top lists removed, their old links open Sources and the Ranking view | owner | one list of the ways to look at the data | display |
| **Filters only in the drawer**: the views have no filters of their own and say in one line what they show | owner | two sets of filters disagreed | display |
| **A persistent drawer**: open until closed, on the left on desktop beside the country panel, a bottom sheet with a chosen height on phones; kept for the visit | owner | it closed on every change | display |
| **No cost view**: "The map shows" is Net, Support for Ukraine or Kept from Russia; `lens=cost` opens the net; the cost stays in the full data download, labelled | owner (to simplify) | a different kind of number | display; downloads |
| **No quick buttons** ("€ to Ukraine", "Change in € to Russia") | owner | they repeated the map shows plus the measure | display |
| **The measure in the country panel**: per person or total € for the big number, tiles and bars, % of GDP beside them | owner | the panel ignored the measure | display |
| **Table & data rebuilt**, with downloads of exactly what is shown and the full data | owner | "needs a lot of work" | display; downloads |
| **Every source listed**, in the Sources view and at the end of each country panel | owner | the method flow ends at the sources | display |
