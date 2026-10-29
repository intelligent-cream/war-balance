# Changelog

The short history, newest first. The [full changelog](https://github.com/intelligent-cream/war-balance/blob/main/docs/changelog-full.md) keeps every round's decisions, evidence and before-and-after figures; the git history has every change. Figures are % of a year's GDP, 2022 to August 2026, at the time of the round.

<h2 id="cl-r60">Round 60: fixes from an independent audit <span class="cl-date">29 October</span></h2>

An independent audit of the pages, the numbers and the method. Most fixes below change words, groups and labels; two change how something is counted: purchases from Ukraine now count both ways, and weapons sold to Russia count at the seller's real gain.

- **Direction and chance**: direction words follow the sign of the middle value; where the simulations lean the other way, the chance says so ("the middle value is toward Russia, but the simulations lean slightly toward Ukraine (51%)"). Net and trade now take the same simulation draws where they are the same number. "Very likely" also needs the likely range to stay on that side, so a range that crosses zero is never called very likely (the UAE, Hong Kong, Bulgaria and New Zealand's net among them); a number whose whole range is under 0.1% of GDP is "essentially zero".
- **Purchases from Ukraine, both ways** (owner: "we should definitely count buying less from Ukraine … just like Russia"): buying less from Ukraine than without the war now counts toward Russia, as buying more counts toward Ukraine, at Ukraine's net gain. The no-war level is each buyer's 2021 share of what Ukraine could still export that year, product by product, so Ukraine's own losses (blocked ports, occupied land, the steel works of Mariupol) are held against no one. Poland's part goes from +€0.03bn to +€0.41bn, Germany's and Türkiye's from 0 to +€0.16bn; China's from 0 to −€0.57bn, India's to −€0.18bn and Belarus's to −€0.16bn (its net from −3.60% to −3.83% of GDP: Ukraine's embargo on Belarus counts, as a foreseeable answer to hosting the invasion). No net changes sign. The grain bans of Poland, Hungary and Slovakia change little: before the war they bought almost none of those crops. Measuring the land neighbours against Ukraine's exports to its neighbours is in the method band. Groups: Iraq becomes very likely toward Russia, Eritrea and Mauritania likely toward Russia; Colombia and Egypt go from very likely to likely; Palestine becomes essentially zero.
- **Weapons sold to Russia at the seller's real gain**: Iran's and North Korea's sales count at their gain from price against cost, item by item, not at Western arms makers' 5 cents per euro. Iran's drone licence charged about $193,000 per drone that costs about $50,000 to make; missiles and shells count above the 28% margin of Rheinmetall's ammunition business; North Korea's shells are valued at Russia's prices against their cost. These sales exist only because of the war, so 0.9 of the gain (0.8–1.0) counts as genuinely extra. Iran's weapons now count for €1.84bn instead of €0.11bn: its net goes from −0.03% to −0.44% of GDP, from essentially zero to very likely toward Russia. North Korea's count for €5.87bn instead of €3.33bn: −11.3% to −19.9% of GDP.
- **The certainty rule as written**: the method pages now give the rule the map uses: "very likely" needs the simulation at 95% or more, every other method choice agreeing and the likely range on that side of zero; "essentially zero" is a number whose whole likely range is within ±0.1% of GDP, or one that is not very likely with a middle value under 0.1%. The pages use one set of words: very likely, likely, too close to call, near zero, essentially zero.
- **One classifier**: the ranking, the country pages, the map's ranking view and the downloads use the same groups, with "Essentially zero" as its own group; the "Toward Russia" list on the ranking page starts from number 1. The map's legend says "very likely" and "likely", as the pages do.
- **Labels by sign**: companies' profits in Russia, stakes in Russian oil and gas, the sanctions premium and Russian forces are named by their direction; "Gave Ukraine less than without the war" is gone ("No support for Ukraine recorded", or "Earned more from Ukraine's war effort than it gave"); support made only of a share of IMF and World Bank lending is named as that.
- **Accurate boilerplate**: weapons count at their money value (aid at market value when delivered, deliveries to Russia at the seller's gain where Russia paid); votes, diplomacy and intent are not in the numbers. Support for Ukraine is described with all its parts. The sanctions line shows only where trade cut Russia's earnings. Türkiye-type sentences name the war-time price premium of the whole period, largest in 2022.
- **Tables that add up**: the by-year tables of country and comparison pages have the frozen-money column, and one sign convention everywhere: + toward Ukraine, − toward Russia. Russia's earnings from trade are shown in their two lines: Russia's own gain and the country's own gain from trade with Russia.
- **Pages and downloads**: the page of countries whose money moved toward Russia lists all of them; year pages say why January–August 2026 can reach a full year; the downloads have a data dictionary of every column, the ranking group, no-data and party columns (and no letters on the headline numbers), sources, the energy switching cost and oil discount, Russia's budget balance and National Wealth Fund, a guide to data.json and checksums. Names, amounts ("<€1m", "€1.0bn"), periods ("2022 to August 2026") and translations were tidied; Kosovo has its own page.

<h2 id="cl-r59">Round 59: titles in the words people search <span class="cl-date">27 October</span></h2>

Page titles, headings and questions now use the phrasing people actually search, in each language, where the page answers it. No number changes.

- **Country pages**: the title asks the question searched most for that country in the page's language, chosen by rule from monthly search volumes: "How much has Canada given to Ukraine?", "Does Belarus support Russia?", "Combien la France a donné à l'Ukraine ?", "Ukraine-Hilfe Deutschland". Where a country's trade with Russia is much searched, its trade section and question name the pair ("India–Russia trade"). Every answer is the map's own figure, with its chance.
- **Topic pages**: "Russia's allies?" on the page of countries whose money moved toward Russia, with a line saying the site measures money, not alliances; "Total aid to Ukraine by country" on the support ranking and tracker, with a question on Ukraine's allies answered the same way; "Frozen Russian assets and Euroclear by country", with Euroclear's own figure; "Sanctions on Russia by country", with a question on what the EU's sanctions are.
- **Russia's war budget**: the oil and gas revenue page is now "Russia's war budget: defence spending vs oil and gas income", with questions on Russia's defence budget and its oil earnings, answered from the research file.
- **What each country bought from Russia, by fuel**: the page on who bought Russian oil and gas now lists the buyers of crude oil, oil products, pipeline gas, LNG and coal from 2022 to August 2026, sorted by the importer's own customs records (CIF), beside the map's own figure at the Russian border (FOB) and CREA's ship tracker, each row with its quality (C and D marked as estimates). Its questions, "Who buys Russian oil?", "Who buys Russian gas and LNG?" and Russian oil exports by country, are answered from the same tables. Country pages show what each bought by fuel where it is measured, and India's page its crude oil by year from its own customs, with the question "How much Russian oil does India buy?".
- **Military aid to Ukraine by country**: a new page in all seven languages with each country's military aid as the map counts it (delivered, at market value, the UK's loan repaid from Russian assets left out) beside the Kiel Institute's figure, with its share of GDP, per person, its quality and the steps from one figure to the other, and why they differ. Every country page and the support tracker split support for Ukraine into military, financial and humanitarian aid, refugee hosting, the share of EU aid, private donations and money flowing back, adding up to the map's figure. Where no military aid is on record outside Kiel's tracker, the pages say "no record found", not zero.
- **Russia's budget balance**: the war budget page now shows the federal budget's revenue, spending and balance by year and month (as executed), the 2026 budget law, the in-year plan and the Ministry of Finance's September estimate side by side, each labelled, and the National Wealth Fund's liquid assets, and answers "What is Russia's budget deficit?". Facts with their dates and sources only.
- **For reuse**: two more CSV files in the downloads (purchases from Russia by country, year and fuel; support for Ukraine by type) and their lines in llms-full.txt.
- **Fix**: "Does … support Russia?" is now asked only on the pages where people search for that question in that language; before, every English page asked it, also for countries whose money moved toward Ukraine.

<h2 id="cl-r58">Round 58: explainers and search wording <span class="cl-date">27 October</span></h2>

The pages now explain their topics, use the words people search with and carry three new pieces of research, in all seven languages. The research corrected the frozen-money inputs of three holders: small changes, below.

- **Short explainers** at the top of the topic pages: what the shadow fleet is, how the oil price cap works, what frozen Russian assets and the reparations loan are, what re-export hubs are and how the site counts them (for the country that made the goods), and Russia's list of "unfriendly" countries.
- **Searchers' wording** where the data support it: "North Korea soldiers and shells" and "Iran drones" on the weapons page and those country pages, "sanctions evasion" on the trade hubs page, and a question on a country's relations with Russia where people search for it, answered from its figures.
- **For reuse**: a downloads page with CSV files, a Markdown version and a cite line on every page, and a plain-text guide at /llms.txt. The years file also has the return Russia lost on frozen money, so each row adds up to its net.
- **Sanctions, country by country**: every country page says which sanctions on Russia apply there (its own, the EU's, or none: said publicly or none found), with the oil price cap and export controls, its sources and the date checked; a new page lists every country and territory by category. Russia's own list of "unfriendly" countries is shown apart: it is not a list of sanctions.
- **Amounts frozen**: the Russian money frozen in each holding country (the Bank of Russia's reserves and the assets of sanctioned people and companies, each with its date and source; "no public figure" where none is published) on the country pages and beside the frozen-assets ranking, and the EU and G7 totals, the windfall payments, the ERA loans and the €90bn Ukraine Support Loan in its explainers. The map still counts the return Russia lost, not the amounts.
- **Russia's oil and gas income**: a new page with Russia's federal budget revenue from oil and gas by year and month since 2019 and its share of federal revenue, with export earnings and defence spending for context, each figure labelled; CSV files of the series in the downloads.
- **Corrections from the new research**: Luxembourg's frozen central-bank reserves are now its government's figure (below €10,000) instead of an estimate of €2bn, Switzerland's 2026 amount is SECO's CHF 6.8bn and the UK's low end €8bn instead of €3bn. Luxembourg's net goes from 3.60% to 3.50% of GDP; the other EU members' nets move by less than 0.01% (they share in Clearstream's part), Switzerland's by 0.002%, and the UK's likely range only at its low end.

<h2 id="cl-fix-part-pages">Fix: part pages <span class="cl-date">27 October</span></h2>

The pages that rank one part of the numbers now read the way the map does. No number changes.

- **Ranges in the value's own sign**: each part's likely range is written in the same unit and sign as its value, low to high, so the value always lies inside it (before, the range had no signs, so a value below zero seemed to fall outside it). A share of GDP keeps the sign of its euros.
- **Money flowing back** (aid spent in a country's own economy, other countries' aid spent there, extra sales to Ukraine) is explained once above the table: what the country where the money was spent earned from it, subtracted from its support for Ukraine. The table runs from the most subtracted, and says so.
- **Chance words only where the map has a chance** (the net, support for Ukraine and trade with Russia); a single part shows its value and its range. Words that every row repeated are said once, above the table.
- The pages by year now show frozen Russian money too, so each row adds up to its net. A new check reads every table of every generated page in every language for these mistakes.

<h2 id="cl-r57">Round 57: richer country pages <span class="cl-date">26 October</span></h2>

Each country page now tells more of its story, in the map's own words and in all seven languages; the map itself is unchanged.

- **New sections, shown only where the data have something to say**: its story in short and what decides its number (the map's own tags and lines), trade with Russia before and after the war, sanctions and Russia's own cut-offs, the cost of switching away from Russian energy, frozen Russian money, refugees, why the figure differs from the Kiel tracker, money flowing back, companies, indirect channels such as trade hubs and refined oil, and its neighbours and groups, numbered by the map's own ranking rule. The longer sections are folded.
- **Questions chosen for each country** from one pool, by its data and by what people search for. Every source behind its parts is now a link, listed by part with its kind: official, research, press or own estimate.
- The wording check now also stops comparative words (smaller, higher, below, far more and the like) in the pages' fixed text, so no sentence can go stale when the data change. No number changes.

<h2 id="cl-r56">Round 56: many more findable pages <span class="cl-date">26 October</span></h2>

The same figures, shown in more ways and more languages, all written from the map every time the site is published; the map itself is unchanged.

- **Every page in seven languages**: each country, topic and group page now also exists in Ukrainian, German, French, Polish, Dutch and Spanish, for every chance level, with the map's own words for it.
- **New pages**: which countries help Russia (in money terms), the shadow fleet, the cost of hosting refugees, EU against US aid, aid per person, weapons sent to Russia, the oil discount, Russian oil refined in other countries and the trade hubs around Russia; each part of the numbers ranked on its own page; support for Ukraine and trade with Russia for each year since 2022; and over 200 pairs of countries side by side (/compare/).
- A Topics page lists them all, and each country page links its groups, comparisons and parts. No number changes.

<h2 id="cl-r55">Round 55: topic and group pages <span class="cl-date">26 October</span></h2>

Pages that answer one question each, built from the map's own figures every time the site is published; the map itself is unchanged.

- **Five topic pages**: a Ukraine support tracker (support for Ukraine by country in euros, % of GDP and per person, with the net and the Kiel Institute's figure beside what is counted here), who bought Russian oil and gas (what each country paid Russia; the model does not split those payments by fuel, and the page says so), frozen Russian assets (the return Russia lost, not the amount frozen), Europe's payments to Russia against its support for Ukraine, and Russia's war income from trade.
- **Six group pages**, at /group/: the EU, the G7, NATO, BRICS, the Gulf states and Central Asia, each with the members' totals and every member's net, support and trade, with its likely range and chance. Belarus and North Korea stay apart as parties to the war; Russia and Ukraine have no figure of their own.
- Each page has a short list of questions answered with its figures and a link to the matching view of the map. Filters lists the pages under Topics, and the ranking pages link them. No number changes.

<h2 id="cl-r54">Round 54: findable pages <span class="cl-date">26 October</span></h2>

Every country, the ranking and the method now have their own page, so a search can find them; the map itself is unchanged.

- **A page per country**, at /country/ and its name (for example /country/germany/): its net, support for Ukraine and Russia's earnings from trade with their likely ranges and chances, the parts with their certainty letters, each year's amounts, its neighbours in the ranking, its main sources and a few short questions answered with its figures. "Open in the map" opens its panel. The numbers come from the map itself when the site is built, so the two always agree. Old share links (/c/) lead there.
- **The ranking and the two lenses** have pages too (/ranking/, /support-for-ukraine/, /trade-with-russia/), and so do How it works, each method page, the limitations and this changelog.
- **Languages**: the map opens in a language from its own address (/de/, /fr/, /pl/, /nl/, /es/, /uk/), and the ten most searched countries have a page in each.
- In the map, the ranking rows link to these pages, and Filters lists every country from A to Z. No number changes.

<h2 id="cl-r52">Round 52: one rule for what counts <span class="cl-date">25 October</span></h2>

The owner: "we also don't punish them for it, so the Ukraine strikes also don't punish India".

- **The rule**, now on the method page: a country's figure reflects its own choices and the foreseeable answers to them. Things forced on it that it did not choose, such as Ukraine's strikes or Russia's sudden export bans, count neither for it nor against it. India is counted for the Russian fuel it chose to buy. What the strikes kept from it neither credits nor blames it.
- **Still counted**: embargoes, sanctions, the price cap, switching suppliers, Russia's 2022 gas cut-off and its counter-sanctions, and the war-time prices paid by buyers who kept buying. For buyers hit by a forced loss, the figure shows what they chose to pay: about EUR 13bn more in total than actually reached Russia.
- **Two losses added**, treated like the strikes:
  - Russia's ban on gasoline and diesel exports from September to November 2023: about 0.9 Mt lost (likely 0.5–1.4), EUR 0.3bn of expected purchases for 40 buyers. Armenia, Belarus, Kazakhstan and Kyrgyzstan were exempt.
  - The Druzhba halt from 27 January to 22 April 2026, after a Russian strike in Ukraine: 86 days of crude, EUR 0.65bn for Slovakia and EUR 0.35bn for Hungary.
- **What that changes**: no country changes group. Slovakia's net moves toward Russia, from +0.48bn to +0.17bn, and stays too close to call. The world's net change in payments to Russia: EUR 137.6bn → 137.1bn.

<h2 id="cl-r51">Round 51: Ukraine's strikes on Russian refineries are not a buyer's choice <span class="cl-date">25 October</span></h2>

The owner: "that's not something what any country chose ... it's just a lowering of the baseline".

- Where Ukraine's strikes on refineries, ports and the Druzhba pipeline cut what Russia could export, a buyer that still wanted Russian fuel could not get it. That shortfall no longer counts as its choice: its no-war level is lowered by the fuel it lost (oil products about 5 Mt in 2024, 9 Mt in 2025, 19 Mt in 2026 to August, with a range; crude about none). Buyers that had already stopped by their own embargo are unaffected. Russia's 2022 gas cut-off still counts: it answered the buyers' own sanctions.
- **What that changes**: EUR 12bn of expected purchases for 58 buyers, most for Türkiye (2.9bn), China (1.7bn), Singapore, India and Brazil; their shift toward Russia grows slightly. No country changes group.
- **Models we tried**: four ways to predict the no-war level better than "2021 held flat" (from buyers' total demand, from Russia's exports, from predicted shares, and a blend) were back-tested on 2005–2016. None was clearly better, so the simple rule stays; the method page lists them.

<h2 id="cl-r47">Round 47: a better no-war starting point for smaller buyers <span class="cl-date">25 October</span></h2>

The owner: "Fix that". Both rules come from back-testing the no-war level on 2005–2016 trade with Russia.

- **Mid-size buyers** (EUR 0.1–1bn a year from Russia before the war) now start from their 2021 purchases instead of the 2019–2021 middle year: 13% more accurate in the back-test. The range is unchanged.
- **Small buyers** (under EUR 0.1bn) kept growing their purchases more than "held flat" assumes; their no-war level is now shifted up by that measured gap (×1.22 after one year to ×1.57 after five), with the range ends in euros kept.
- **What that changes**: Afghanistan and Jordan become certain toward Russia, Colombia certain toward Ukraine; Bosnia and Herzegovina, Honduras, Cuba and Costa Rica lean toward Ukraine; Nicaragua and Venezuela no longer lean toward Russia. Not certain on the net: 92 → 88. Placebo coverage stays about 90% (war moved to 2014) and 97% (2018).

<h2 id="cl-r46">Round 46: "essentially zero" and "too close to call" <span class="cl-date">25 October</span></h2>

- A number that is not certain and whose middle value is under 0.1% of a year's GDP now says **essentially zero**: the war moved almost no money either way there (Kazakhstan, Algeria, Israel and others), a fact rather than an open question.
- **Three method choices no longer veto a direction** (the owner: "start on 3"): "without the war-time windfall" is shown as a separate figure under the method band, not a veto ("money moved" includes the price premium Russia received); "windfall at 100%" is out (a rule replaced in round 13); no-war gas at early-2021 prices is now part of the likely range, as the low end of the no-war gas price, instead of a veto; redirected trade uses its own ratio per commodity (oil 0.63, gas 0.89, coal 0.50, other goods 0.76, was 0.70 for everything).
- **What that changes**: carried inside the range, the early-2021 gas price widens every gas buyer's range a little, so Italy, Spain and France are no longer certain on Russia's earnings from trade (now leaning toward Ukraine at 91.6%, 90.1% and 94.6%). As a veto it only counted where it flipped a sign, which hid this uncertainty everywhere else. No net figure changes group.
- **Own-history no-war bands**: 30 uncertain countries were back-tested on their own trade with Russia since 2001, under the same rule that admitted Türkiye's band. Three pass (Kenya, Peru, French Polynesia); French Polynesia becomes certain on trade, Peru's narrower range puts it near zero. The other 27 keep the general band: their own history is more volatile than it (Colombia came closest, but its 2014–2020 errors were larger than anything before).
- Below a 65% chance either way, a direction is **too close to call** (was "unclear"; the ranking group was "direction uncertain").

<h2 id="cl-r45">Round 45: a shorter country panel <span class="cl-date">25 October</span></h2>

The owner: "a little too much text in the main country view".

- "What decides it" only for numbers that are not certain, and only when one part can flip them.
- The two tiles show their chance only when it is not certain; the headline already says "very likely".
- "Backed by N sources" without the count of official statistics; each part still says how it is backed.
- A leaning pill no longer repeats the side its label already names ("likely · 71%").
- The panel's first layer is the number, its chance and its range: the sum line, the euros and the average year, and why a number is not certain moved one tap away (the owner: "it does not add value ... it's already in the breakdown").
- The country panel follows the view: in Support or Trade the big number is that number, and the tiles show the other two (the owner: "if I click support / trade and click on the country I still get the same headline").

<h2 id="cl-r44">Round 44: more certain numbers from official sources, two fixes, and a cleaner map bar <span class="cl-date">25 October</span></h2>
<!-- flows: paid windfall rusfirms -->

The owner: "go for it", and on the stories strip, "I don't like them".

- **Now certain**: Türkiye toward Russia (net and trade), Czechia toward Ukraine (net), Kyrgyzstan toward Russia (net and trade), Nigeria (trade), Japan toward Ukraine (trade, at 95.0%, right on the line). Certain directions: 68 → 71 on the net, 60 → 64 on Russia's earnings from trade.
- **Two fixes**: Türkiye's war-time price range counted one source of uncertainty twice; Czechia's 2021 low case came from IMF figures that leave out gas (Eurostat confirms 3.4 Mt of Russian crude that year).
- **Official sources added**: Kyrgyzstan's own statistics (its purchases from Russia were 18–30% higher in 2024–2026 than the figures used), Armenia's 2026 figures, Japan's customs data and its Sakhalin-2 LNG contracts (a narrower no-war level for that quarter of its purchases), Hong Kong's own statistics for its 2026 Russian gold (downloaded by the owner), and the extractive-industry reports and company accounts for Russian-owned firms in Angola and Iraq (both firmer, still leaning).
- **Rules the project replaced no longer veto a direction**: EU refiners keeping the Russian crude, the laundered-oil rules before rounds 13b and 38, the fuel mix from tanker tonnes and fuel prices with freight are out of the method band.
- **Tested and rejected**: a no-war level per product (fuel, cereals, fertiliser, metals) did not beat "2021 held flat" in back-tests, so the bands stay as they are; the test also confirms they cover what they should.
- The stories strip next to the year buttons is gone.

<h2 id="cl-r43">Round 43: more numbers certain, from tested bands and measured data <span class="cl-date">24 October</span></h2>
<!-- flows: paid laund sold -->

The owner: "go for 1 to 3", and for the UAE and Hong Kong, "can you use Playwright?"

- **No-war bands calibrated by the placebo test**: what countries would have bought from Russia without the war now has a band 0.81 of its old width, and small sales to Russia 1.1 times theirs (the 2014 test, when Russia's own economy was hit). Rerun, the trade ranges still hold the true zero for 96% (2018) and 90% (2014) of ranked economies.
- **Türkiye's own band**, back-tested on its energy regulator's (EPDK) gas and crude volumes since 2005; EPDK is a second official source next to customs. Its range narrows, but at 94% it still only leans toward Russia.
- **Gas checked against metered pipeline flows (ENTSOG)**: Hungary 2025–2026 and Austria 2024 bought less Russian gas than the figures used (Hungary 5.3 bcm, not 6.3, in 2025); Bulgaria's high case widened to what physically came in.
- **Laundered oil from measured data**: Russia's share of India's crude from its monthly customs, Türkiye's from EPDK, each EU refiner's own share, and Australia's own petroleum statistics; Cyprus and Malta measured as buyers (Cyprus re-exports most of the fuel it imports, so that is no longer charged to it). A bug is fixed: measured buyers keep a flat no-war path, as documented.
- **Now certain** on the net: Bulgaria, Egypt, Chile, Cyprus, New Zealand, Papua New Guinea, the Maldives; on Russia's earnings from trade also Spain, Italy, South Africa and Fiji. The Philippines moves from leaning to near zero. Certain directions: 61 → 68 on the net, 51 → 60 on Russia's earnings.
- **UAE and Hong Kong**: a browser reaches more UAE sites than plain downloads, but the UAE statistics office blocks it and Hong Kong's detailed trade tool does not allow automated access; nothing narrowed their ranges. The UAE's 2019 customs figures match the IMF data the site uses to the dollar, so those are official UAE figures.

<h2 id="cl-r42">Round 42: how likely each direction is, what decides it, and tested ranges <span class="cl-date">24 October</span></h2>
<!-- flows: paid sold aid own -->

The owner: "decide 'certain' with the simulation alone", "replace the letter grade with a plain scale".

- **A chance instead of a letter**: each headline number says how likely its direction is, from simulating every part's range together: very likely (at least 95%, and every other method choice agrees: certain), likely (at least 65%: leaning), unclear, or near zero. The ranking shows the chance on every row.
- **Two fixes**: leaning now looks both ways (a middle value just above zero in a range that reaches mostly below it leans the other way, and says so); aid and the money flowing back from it now offset in the range instead of adding (Germany's support low end 1.58% → 1.60%).
- **Groups that moved** (net): the UAE, Hong Kong and South Africa from leaning toward Russia to certain; Taiwan from uncertain to leaning toward Ukraine; French Polynesia from near zero to certain. Support: 12 small numbers from near zero to certain. Trade: Armenia and Mozambique from leaning to uncertain, Fiji from certain to leaning. No middle value changed.
- **What decides it**: each panel names the smallest change to one part that would flip the direction.
- **Letters follow the sources**: a part's letter is capped by its sources (A needs two official statistics, B one, C research; press or own estimates alone give D), and parts resting on the press alone say "press only".
- **Ranges tested**: rerun as if the war had started in 2018, trade ranges held the true zero for 97% of ranked economies; for a 2014 start, 92%. The site now says so instead of "about 90% by judgement".

<h2 id="cl-r41">Round 41: a map you can read at a glance, tested code, and a fixed simulation <span class="cl-date">24 October</span></h2>
<!-- flows: windfall paid sold -->

- **The sign simulation had a broken random generator** (it repeated after about 10,000 draws), so "leaning" was decided on fewer independent draws than it said. It is replaced, and 8,000 draws now run per number. No net figure changes; seven groups move: Taiwan's net from leaning toward Ukraine to uncertain, Nicaragua's net from uncertain to leaning toward Russia, and the trade groups of Armenia, Cyprus, Mozambique, Nicaragua and Thailand.
- **Mostly no data**: a country whose trade with Russia has no record of its own and only small rough estimates counted (Chad, South Sudan, Somalia, Haiti, Guinea, Equatorial Guinea and others) no longer gets a direction. It is drawn hatched, not ranked, and says so.
- **Mostly price**: where war-time fuel prices it did not set make up most of a number (Hungary: €9.9 bn of €11.6 bn), the panel and the tooltip say so.
- **Two numbers as the headline**: each panel and tooltip shows support · trade · frozen = net.
- **On the map**: the three views, the year and Play sit on the map; the default frame shows the Americas, Africa and East Asia; a strip of stories picks the clearest case for each kind of flow; the arcs are off until switched on.
- **Tests**: the map's own model is tested directly in every build (the parts add up, the ranges hold their middle value, the simulation gives known answers, a dozen countries' numbers are pinned).
- **Citable**: a citation file (CITATION.cff) and a git tag per round.
- **Citations**: no Wikipedia left; 21 citations now point to the official or primary source (company accounts, decrees, regulator reports, government releases). What rests on the press alone is kept and marked "press report". No number changed.
- The last "not reviewed by a person" lines are gone from the research notes.

<h2 id="cl-r40">Round 40: Russian forces in Africa, corrected citations, and no "not yet checked" <span class="cl-date">23 October</span></h2>
<!-- flows: rusarms laund -->

- **Wagner / Africa Corps** count as money toward Russia: what host governments paid them and what their firms took in gold and timber, at Russia's own gain, against 2021. Central African Republic −0.41% → −4.84% (a small economy, not ranked); Sudan −0.42% → −0.14% (Wagner's gold fell after Sudan's own war); Mali, Burkina Faso, Niger, Equatorial Guinea and Libya move by under 0.1 point. A tag, "Russian forces in the country", marks the years they were there.
- **New Zealand and South Africa** carry a structural label: they bought more refined fuel because their own refineries closed. The numbers do not change.
- **Three citations corrected**: Russia's 2014 arms exports ($13.2bn for Rosoboronexport, over $15bn in all), Georgian fighters for Ukraine (500 to 1,500, not 1,500), Russians in Serbia (48,000 residence permits, 80,000 to 110,000 resident, not 300,000).
- The owner: the inputs are checked by a person, so "not yet checked by a person" is gone from the site and the files.

<h2 id="cl-r39">Round 39: certainty, a visual How it works, five new money flows and better data <span class="cl-date">23 October</span></h2>
<!-- flows: frozen coprofits flowback laund sold paid ref undisc -->

The owner: "what has evidence should be counted as such, then on top we can add speculative".

- **Certainty**: a number's chance of each direction is worked out by simulating its parts; a sixth ranking group, **near zero** (range and method band within ±0.5% of GDP, 35 countries); each panel that is not certain says why in one line.
- **How it works** rebuilt around pictures: one country's sum, four rules, one euro, the no-war chart, how sure a number is, the money flows as tiles, a glossary; the long texts one tap deeper.
- **New money flows**: Russian private assets frozen abroad (Luxembourg +1.74% → +3.47%, Belgium +2.84% → +3.41%, Cyprus +1.34% → +2.14%); profits of companies in Russia and stakes in Russian oil and gas (Sweden +0.38, Finland +0.48, the UK +0.36, Germany +0.21; Hungary −0.39); the sanctions premium Russia pays (Belarus −0.82 with laundered oil, Uzbekistan −0.50, Kazakhstan −0.25, China −0.12); extra services sold to Ukraine (Poland −0.06).
- **Laundered oil measured** for 21 fuel buyers from their own customs and the Russian share of crude at each origin; "not counted" is no longer a method-band alternative, "half charged" is (Mozambique −2.19% → −1.04%, Tanzania −1.95% → −1.04%, Nepal −1.67% → −2.25%, Mauritius −0.35% → −0.86%).
- **Weak estimates replaced**: re-exports by product matching, Russia's import gap split by its own regions of origin, refugee budgets (Denmark −0.22, Sweden −0.12), Germany's 2026 undisclosed aid, Tajikistan's remittance split, four citations; raw trade data and download scripts in the repository, so the trade figures can be rebuilt.

<h2 id="cl-r38">Round 38: leaning groups, Kiel reconciled, and much less text <span class="cl-date">23 October</span></h2>
<!-- flows: aid mil ref -->

The site was reviewed from four angles (economic fairness, too much text, reasons to dismiss it, and whether researchers could cite it), which led to these changes. The owner: "we can create leaning groups".

- **Ranking in five groups**: toward Ukraine, leaning toward Ukraine, direction uncertain, leaning toward Russia, toward Russia. Only the two certain groups are numbered.
- **"Armed Russia" tag** at the full value delivered, from €50m (Iran €3.5bn). The totals still count a sale at the seller's own gain.
- **Kiel reconciled**: a table walks from Kiel's figures to the map's (aid method page). Two fixes: the panel's "Kiel's figure" for EU members no longer includes the EU share (Germany €30.8bn, not €49.5bn); the UK's G7 loan repaid from Russian assets was also taken off as undelivered military aid. The UK goes from +1.41% to +1.46%; small Kiel amounts without a month are now spread over the years, so a few countries move by up to 0.03 points (Slovenia +0.64% to +0.67%).
- **Refugees**: each host's panel shows the cost per refugee-year (the Netherlands about €24,000, Poland about €2,400).
- **Less text**: a shorter ⓘ with the sum as a picture, a three-line tooltip, a shorter legend, three folds in the country panel, the likely range as a bar, the method choices as a dot strip, no closing sum line, and documentation cut from about 90,000 to 17,000 words (the [full changelog](https://github.com/intelligent-cream/war-balance/blob/main/docs/changelog-full.md) and the developer details are in the repository).
- About says the project has no connection to Follow the Money (ftm.nl), whose name it used in its first week.

<h2 id="cl-r37">Round 37: the trade tile without the two "who kept what" lines <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold -->

Display only: the trade tile no longer repeats who kept what; the breakdown and the tags already say it.

<h2 id="cl-r36">Round 36: Russian money frozen without a tile of its own <span class="cl-date">23 October</span></h2>
<!-- flows: frozen -->

Display only: no separate tile for Russian money frozen; it stays in the breakdown, the closing sum and a tag.

<h2 id="cl-r35">Round 35: a calmer country panel <span class="cl-date">23 October</span></h2>
<!-- flows: -->

Display only: the panel shows three tags and the three largest parts per section; the rest is one tap deeper.

<h2 id="cl-r33">Round 33: tags replace Highlights <span class="cl-date">23 October</span></h2>
<!-- flows: -->

Display only: the hand-written Highlights are gone; the story tags, worked out from the data, are filters that combine and can be shared. Owner: "use the tags in the filter section to get similar interesting insights".

<h2 id="cl-r32">Round 32: renamed to War Balance <span class="cl-date">23 October</span></h2>
<!-- flows: -->

The site is now War Balance, at warbalance.org; the earlier addresses redirect. No number changed.

<h2 id="cl-r31">Round 31: a logo, and visits counted <span class="cl-date">23 October</span></h2>
<!-- flows: -->

Display only: a logo, and visit counts without cookies or personal data.

<h2 id="cl-r30">Round 30: ready for the new address <span class="cl-date">23 October</span></h2>
<!-- flows: -->

Display only: one site address, a sitemap, and a dataset description for search engines.

<h2 id="cl-r29">Round 29: Russia's earnings from trade, uncertainty in the ranking, a cleaner method <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold mil aid -->

The trade number is renamed **Russia's earnings from trade**; the measure is unchanged. Owner: "just rename it to something that makes more sense". Leaning and uncertain countries are ranked, faded; North Korea is a party to the war and no longer ranked. Italy's "gas cut off by Russia" label now covers only gas still flowing before the cut (about 4% of its fall); no total moved.

<h2 id="cl-r28">Round 28: signs in the breakdown, like a balance sheet <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold flowback -->

Display only: each row of the breakdown carries a + or − sign again.

<h2 id="cl-r27">Round 27: the trade tile says what happened to trade <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold -->

Display only: the trade tile reads "Reduced trade with Russia by 1.6%" again.

<h2 id="cl-r26">Round 26: coherence <span class="cl-date">22 October</span></h2>
<!-- flows: paid windfall laund sold buy flowback sanctions -->

**No data, no number**: a trade part without the country's own observation for the war years counts as zero. Owner: "if I don't have any data, we shouldn't put anything there". 74 economies and territories move, those over EUR 5bn by at most 0.2 points (Guinea −0.26% → −0.08%). The breakdown follows the tiles, the "no real alternative" label is gone, and sanctions tags say who set the sanctions.

<h2 id="cl-r25">Round 25: kept wording, two-section parts, story tags <span class="cl-date">22 October</span></h2>
<!-- flows: paid windfall laund sold services shipping companytax rusfirms rusarms statefin mil agents frozen buy flowback -->

Display only: the trade side says who kept what, the parts are split into toward Russia and toward Ukraine, and every country gets story tags.

<h2 id="cl-r24b">Round 24b: the method changes the owner decided <span class="cl-date">22 October</span></h2>
<!-- flows: aid euaid ref flowback paid windfall laund sold services shipping companytax rusfirms rusarms statefin mil agents -->

Refugee hosting at actual spending minus only the host's gain on refugees' work (net: Czechia +1.57% → +2.50%, Poland +4.40% → +5.00%, Germany +3.22% → +3.44%). Military aid counted when delivered (Denmark +4.44% → +4.09%, Sweden +3.58% → +3.30%). North Korea at the full value of what it supplied (−10.28% → −11.34%). Uncertain numbers now say which way they lean; Belarus is a party to the war, not ranked.

<h2 id="cl-r24">Round 24: every number backed where you read it <span class="cl-date">22 October</span></h2>
<!-- flows: aid loans euaid priv ref paid windfall laund sold buy services shipping companytax agents remit gold frozen -->

No number changed: fixes from four checks (a reader's trace, numbers against the data, every source link, data and method quality), and each number's sources shown where it is read. The method changes followed in round 24b.

<h2 id="cl-r23">Round 23: one home for the documentation <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

Display only: How it works holds the method, the limitations and this changelog.

<h2 id="cl-r22">Round 22: views as tabs, sources and panel reorganised; a new name <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

Display only: Map, Ranking and Sources as tabs; the panel and the sources reorganised; the site was named Follow the Money: Ukraine (War Balance since round 32).

<h2 id="cl-r21">Round 21: polish, Crimea and borders <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

Display only: a calmer design; Crimea drawn as Ukraine; borders as Google Maps shows them for most of the world.

<h2 id="cl-r20">Round 20: three views <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

Display only: Map, Ranking and Sources; the table and per-person views removed.

<h2 id="cl-r19">Round 19: one place for every filter <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

Display only: every filter in one drawer; the cost view left the site (it stays in the full data download).

<h2 id="cl-r18">Round 18: the streams on phones and a visual country panel <span class="cl-date">20 October</span></h2>
<!-- flows:  -->

Display only: money streams on phones; a country panel of numbers and bars.

<h2 id="cl-r17">Round 17: redesign, the map first <span class="cl-date">20 October</span></h2>
<!-- flows:  -->

Display only: the map opens on its own, with one colour rule; filters fold away.

<h2 id="cl-r16b">Round 16b: small flows and refugee spending <span class="cl-date">20 October</span></h2>
<!-- flows: ref flowback laund services frozen gold -->

Small purchases from Russia start from the median of 2019–2021, with listed exceptions (trade number: Brunei +5.04% → +2.35%, Malta +0.79% → +0.28%, Syria −1.87% → −0.92%). Refugee spending flows back through shops, hotels and rent; Poland's pipeline crude is labelled as cut off by Russia.

<h2 id="cl-r16">Round 16: browser and data agree, values corrected <span class="cl-date">20 October</span></h2>
<!-- flows: aid loans euaid ref flowback paid windfall services frozen mil gold -->

The page and the data model now give the same bands and rankings. Refugee scaling applies to 2022 only (Poland net +5.06% → +4.44%); Russian money frozen moves to its own line (Belgium's trade number +1.86% → +0.62%, net unchanged); Hong Kong's gold is followed to its buyers (−4.30% → −1.59%).

<h2 id="cl-r15">Round 15: separate maps, named lists and a stricter ranking <span class="cl-date">19 October</span></h2>
<!-- flows: aid ref paid windfall mil -->

GDP becomes the 2022–2024 average (Nigeria +0.81% → +0.44%, Lithuania net +10.98% → +11.80%). Refugees on one all-government definition (Poland's support +1.11% → +1.95%). The net comes first, its two parts get maps of their own, and the documentation's figures are checked against the data.

<h2 id="cl-r14b">Round 14b: taken by Russia, and one normal return <span class="cl-date">19 October</span></h2>
<!-- flows: paid exits seized -->

Seizures and forced exits leave the totals (net: Finland +7.54% → +8.43%, Austria −0.43% → +0.29%). Russia's and Ukraine's normal returns are recomputed (Estonia +11.17% → +9.90%, Lithuania +12.09% → +10.98%).

<h2 id="cl-r14">Round 14: units, freight and seizures <span class="cl-date">19 October</span></h2>
<!-- flows: flowback paid windfall laund services shipping frozen seized mil gold -->

Russia's gain is weighted by what each country actually bought, from customs; fuel is compared at the Russian port, without the war-time freight surge; every trade part is in current euros. Net: Lithuania +10.50% → +11.91%, Libya −5.20% → −7.03%, Hong Kong −2.36% → −4.16%, Uzbekistan −6.15% → −3.53%.

<h2 id="cl-r13b">Round 13b: remittances as a marker, laundered-oil routes <span class="cl-date">19 October</span></h2>
<!-- flows: laund remit -->

Remittances leave the totals and become a marker (Tajikistan −39.61% → −0.81%, Uzbekistan −14.46% → −6.11%). Oil refined in the EU counts only where both the pre-war and post-war routes are measured (Togo +6.61% → −0.05%, Marshall Islands +6.17% → +0.91%).

<h2 id="cl-r13">Round 13: one rule, two numbers <span class="cl-date">19 October</span></h2>
<!-- flows: aid loans flowback paid windfall laund sold services shipping remit mil agents gold -->

One valuation rule for every seller: its net gain × the share that is genuinely extra (Belarus −18.48% → −5.55%, Kyrgyzstan −16.71% → −6.09%). Paid weapons deliveries to Russia count as sales (North Korea −29.95% → −10.16%). Support for Ukraine and the trade side become two numbers.

<h2 id="cl-r12">Round 12: data precision <span class="cl-date">19 October</span></h2>
<!-- flows: loans undisc paid energy services -->

Loans valued from measured rates and losses instead of a flat 10%: about EUR 55bn of 96.5bn face counts. Five more judgement values replaced by measured ones (Germany +3.71% → +3.64%, Japan +0.48% → +0.42%).

<h2 id="cl-r11a">Round 11b: checking every link and figure behind the sources <span class="cl-date">19 October</span></h2>
<!-- flows: loans ref flowback -->

No number changed: every source link and figure checked; stale text and some certainty letters corrected.

<h2 id="cl-r11">Round 11: every constant traced to its data <span class="cl-date">19 October</span></h2>
<!-- flows: aid loans euaid priv ref paid windfall laund sold buy services shipping companytax frozen remit gold -->

Every input traced to its primary source and every judgement written down. Russia's gain on services and arms now comes from official sector profits (Hong Kong −5.0% → −4.3%, Hungary −3.9% → −4.1%).

<h2 id="cl-r9-10">Rounds 9–10: what readers asked <span class="cl-date">18 October</span></h2>
<!-- flows: paid windfall laund buy rusfirms statefin gold -->

Trade counts at the seller's net gain, as a reader on Reddit suggested (Lithuania +27.8% → +14.8%, Poland +8.1% → +4.1%, India −5.2% → −2.4%). The Russian crude in fuel refined elsewhere is measured per refiner; Russian-owned plants abroad are added.

<h2 id="cl-r8">Round 8: narrower ranges and the interface <span class="cl-date">18 October</span></h2>
<!-- flows:  -->

Narrower, tested ranges for pipeline fuel buyers; Poland's no-war path drops the Yamal gas it had already decided to end (+9.2% → +8.1%).

<h2 id="cl-r7">Round 7: what the owner asked to add <span class="cl-date">18 October</span></h2>
<!-- flows: paid windfall frozen remit markers -->

Added the return Russia lost on frozen reserves, remittances, the critical-goods marker and no-war energy prices (the windfall fell to about a third). Hungary −7.6% → −4.5%, Lithuania +22.5% → +27.8%.

<h2 id="cl-r6">Round 6: one rule for money, two balances <span class="cl-date">18 October</span></h2>
<!-- flows: loans ref flowback mil agents gold -->

Every euro that reached Ukraine followed to where it was spent; money earned from the war effort subtracted; payment agents added (Kyrgyzstan −15.3% → −23.3%, Brunei +6.6% → −4.8%, Moldova +16.9% → +19.3%).

<h2 id="cl-r5">Round 5: values at their real worth <span class="cl-date">18 October</span></h2>
<!-- flows: aid loans ref flowback laund shipping rusfirms statefin rusarms -->

Weapons at market value, loans as gifts, refugees at net cost; Russian arms sales, Rosatom, company exits and Russian-owned firms added (Poland +10.0% → +7.1%, Japan +0.91% → +0.76%).

<h2 id="cl-r3-4">Rounds 3–4: profit, windfall and a tested baseline <span class="cl-date">17–18 October</span></h2>
<!-- flows: loans undisc ref paid windfall laund sold services shipping companytax gold -->

Profit instead of revenue, volumes instead of values, the war-time windfall, gas counted where it is burned, re-export hubs, and a no-war level tested on past years.

<h2 id="cl-r1-2">Rounds 1–2: the question and the first map <span class="cl-date">17 October</span></h2>
<!-- flows: aid euaid undisc ref flowback paid laund energy services shipping companytax gold -->

The question, the first real data (Kiel Institute, UN Comtrade, CREA) and the first map, with an estimate and a range for every gap.
