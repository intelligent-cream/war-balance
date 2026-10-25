# Changelog

The short history, newest first. The [full changelog](https://github.com/intelligent-cream/war-balance/blob/main/docs/changelog-full.md) keeps every round's decisions, evidence and before-and-after figures; the git history has every change. Figures are % of a year's GDP, 2022 to August 2026, at the time of the round.

<h2 id="cl-r46">Round 46: "essentially zero" and "too close to call" <span class="cl-date">25 October</span></h2>

- A number that is not certain and whose middle value is under 0.1% of a year's GDP now says **essentially zero**: the war moved almost no money either way there (Kazakhstan, Algeria, Israel and others), a fact rather than an open question.
- **Three method choices no longer veto a direction** (the owner: "start on 3"): "without the war-time windfall" is shown as a separate figure under the method band, not a veto ("money moved" includes the price premium Russia received); "windfall at 100%" is out (a rule replaced in round 13); no-war gas at early-2021 prices is now part of the likely range, as the low end of the no-war gas price, instead of a veto; redirected trade uses its own ratio per commodity (oil 0.63, gas 0.89, coal 0.50, other goods 0.76, was 0.70 for everything).
- **What that changes**: carried inside the range, the early-2021 gas price widens every gas buyer's range a little, so Italy, Spain and France are no longer certain on Russia's earnings from trade (now leaning toward Ukraine, 92%, 90% and 95%-). As a veto it only counted where it flipped a sign, which hid this uncertainty everywhere else. No net figure changes group.
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
