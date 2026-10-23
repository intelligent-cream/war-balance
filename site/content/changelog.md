# Changelog

Every update to the map, newest first: what changed and every decision behind it. Every change is also in the git history.

The detailed research log, with every file, is [`research/2026-10/README.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/README.md).

<h2 id="cl-r33">Round 33: tags replace Highlights <span class="cl-date">23 October</span></h2>
<!-- flows: -->

**The Highlights are gone; the story tags are filters in Filters. No number changed.**

### What changed

1. The Highlights button and its list are gone from the map.
2. Filters has a new **Tags** section, after "The map shows" and Measure: every story tag a country can have (the same
   rules as under each country's numbers, in [How the tags are set](#view=how&sec=m-tags)), grouped as "Why trade with
   Russia changed", "What it did" and "How sure", each with how many countries have it. A tag that comes in two
   versions is two filters (bought or sold much more or much less, top-10 or major aid giver, orange mostly from fuel
   buying or from sales).
3. Picking a tag dims the countries without it and opens a card on the map: what the tag means, how many countries
   have it, the largest five (tap one to open it) and a link to how the tags are set. Up to three tags combine: the map
   then shows the countries that have all of them, with their number and a "Clear tags" button.
4. The tags picked are in the address (`#tags=windfall,discount`), so a view can be shared, and they narrow the
   Ranking too, with a note above it. Old Highlight links open their nearest tag (Hungary's price spike: War-time fuel
   prices; Who armed Russia: Sent weapons or troops to Russia), or the plain map where there is none.
5. All six languages are updated; the Highlights' text is removed from them.

### Decisions

- **Tags instead of Highlights.** The owner, 23 October 2026: "remove the highlights and use the tags in the filter
  section to get similar interesting insights but based on tags". The Highlights were a fixed set of stories written by
  hand; the tags are worked out from the data for every country by published rules, so the same insights (who bought
  more, who armed Russia, the war-time price spike, the top supporters, the gas Russia cut off) now come from one
  source, and can be combined. Effect: none on the numbers; tags only pick countries.

<h2 id="cl-r32">Round 32: renamed to War Balance <span class="cl-date">23 October</span></h2>
<!-- flows: -->

**The site is now War Balance, at warbalance.org. No number changed.**

### What changed

1. The name "Follow the Money: Ukraine" became **War Balance** everywhere: the page, its search and share tags, the
   share cards and country pages, the downloads (`war-balance_*` files), the About text and all six languages. The
   question the map asks is unchanged.
2. The address is **warbalance.org**. The earlier addresses (followthemoneyukraine.org, followthemoneyukraine.com and
   the github.io address) redirect to it, so links already shared keep working. The repository moves to
   `intelligent-cream/war-balance`; GitHub forwards the old repository address.
3. The logo is a serif "W" on navy with a thin rule under it, in the same style as before.
4. The "not affiliated with Follow the Money (FTM)" line in About is gone, as it is no longer needed.

### Decisions

- **A new name.** "Follow the Money" is a registered EU trademark of FTM Media B.V. (EUIPO 015136708, classes 9, 16
  and 41, which include publishing), so the site takes a name of its own. "War Balance" was checked in the EU's
  trademark search (TMview) and no matching mark was found. Effect: name and address only.

<h2 id="cl-r31">Round 31: a logo, and visits counted <span class="cl-date">23 October</span></h2>
<!-- flows: -->

**The site has a logo, and visits are counted without cookies. No number changed.**

### What changed

1. A logo: a white serif "F" on navy with a thin rule under it, as the browser-tab icon, the home-screen icon on
   phones (with a web manifest), next to the name in the header, and as the organisation's logo for search engines.
2. Visits are counted with Cloudflare Web Analytics: no cookies, no personal data, nothing stored on the reader's
   device; only page views, pages, countries and referrers in total.

<h2 id="cl-r30">Round 30: ready for the new address <span class="cl-date">23 October</span></h2>
<!-- flows: -->

**The site is ready to move to its own address, followthemoneyukraine.org, and search engines can now find every
country page. No number changed.**

### What changed

1. **One address.** The site's address is set in one place and used by the map, the country pages, the share cards and
   the documentation. Links to the old address keep working inside the site.
2. **Found by search engines.** A sitemap lists the map in its seven languages and every country page; a robots file
   points to it. Each page names its main address, so the old and new addresses do not compete.
3. **Described as a dataset.** The map describes itself as an open dataset (licence CC BY 4.0, February 2022 to August
   2026, with the data download), so it can appear in dataset search; each country page is part of it.
4. **Country pages say what they show.** Each country page's title gives its net and its trade side in the site's own
   words, for example "Germany: toward Ukraine by 3.4% of GDP; cut Russia's earnings from trade by 1.6% of GDP", and
   its description starts with "Research preview: unverified estimates".

### Decisions

- **Move to followthemoneyukraine.org.** Raised by the owner (23 October 2026), with Cloudflare for the domain and
  GitHub Pages for the site. Effect: the address only.

<h2 id="cl-r29">Round 29: Russia's earnings from trade, uncertainty in the ranking, a cleaner method <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold mil aid -->

**The trade side is renamed "Russia's earnings from trade": "Cut Russia's earnings from trade by 1.6%" for Germany,
"Raised Russia's earnings from trade by 6.1%" for Hungary. The ranking now shows leaning and uncertain countries, faded
and labelled. North Korea is a party to the war. Only North Korea's ranking and Italy's gas label changed; every total
is the same.**

### What changed

1. **Renamed, not changed.** The trade tile reads "Cut / Raised Russia's earnings from trade by X" ("Probably cut /
   raised …" when it leans); the map's lens, legend, ⓘ, the CSV's labels, the README and all six languages say
   "Russia's earnings from trade". Tapping the tile adds: "Earnings = what Russia keeps: taxes and profit above a normal
   return, not the full price paid; includes war-time prices." The measure itself is unchanged; the CSV column names
   are unchanged.
2. **One ranking with the uncertainty in it.** Countries whose direction is leaning or uncertain are ranked with the
   others, faded, with dashed range lines and the label "leaning" or "uncertain"; a key above the chart says what each
   means and how many are not certain. The separate lists under the chart are gone. The axis is marked as compressed.
   Belarus and North Korea are listed below the chart as parties to the war, not ranked.
3. **North Korea is a party to the war.** Its troops fought for Russia against Ukraine in the Kursk region from late
   2024, which it confirmed on 28 April 2025, and it supplied Russia with shells and missiles (MSMT/2025/1). Like
   Belarus, its numbers are shown in its panel, but it has the map's party category and is not ranked. To undo it,
   remove `PRK` from `PARTY_TO_WAR` in `site/index.html` and the `north_korea_party` entry in `build_data.py`.
4. **Italy's "gas cut off by Russia" label corrected.** Italy had cut its Russian gas itself, from about 29 bcm in 2021
   to 2.9 bcm in 2023, before transit through Ukraine ended on 1 January 2025; the label had counted its whole fall
   against the pre-war level (about EUR 6.7bn) as cut off by Russia. A cut after 2022 now labels only the gas the
   country still bought the year before the cut: Italy about 4% of its fall (EUR 1.1bn), so it loses the "Gas cut off by
   Russia" tag; Austria 30% (was 50%), Slovakia 8% (was 19%). Cuts in 2022 are unchanged. A label only: no total moves.
5. **Kiel's figure next to ours.** The aid card and the support tile show the Kiel Institute's own figure for a
   country's aid next to the amount counted, with the reasons they differ (weapons at market value, loans at their
   gift value, G7 loans repaid from Russian assets left out, military aid counted when delivered): the US EUR 115bn
   against 79.8bn, Germany 49.5bn against 25.9bn.
6. **A tag for critical goods.** Large sellers of goods Russia's weapons need get the tag "Sold Russia goods its
   weapons need: €X" (at least €1bn, or at least €50m and 0.1% of GDP, 2022 to the chosen year, at full value): China,
   Hong Kong, the UAE, Belarus, India, Türkiye, Kazakhstan and others.
7. **Why the buyer of laundered oil is charged**, said plainly in How it works: the buyer pays for Russia's crude
   inside the fuel, and its demand creates the sale; the refiner keeps only its margin and its discount.
8. **Ranges in words** everywhere ("likely 2.4% to 4.8% toward Ukraine"; "likely from 0.4% toward Russia to 1.2%
   toward Ukraine"), no bare minus under a headline without a sign, no "+<0.01% to +<0.01%"; tiny lines are hidden.
9. **The method pages and limitations are rewritten** in the present tense: what the map does, not how it got there.
   The history stays in this changelog. The worked examples (Poland, Germany) use the current figures and are checked
   against the data.
10. **Display.** The legend's steps are drawn as steps and the legend opens on a phone; the phone header is compact;
    the map frames Europe on a phone and keeps a tapped country in view above the panel; share cards and link
    previews keep "Research preview: unverified estimates".

### Decisions

- **Rename, do not change the measure.** The owner (23 October 2026): "just rename it to something that makes more
  sense, because what it measures is good, but the naming suggests something different." The number measures what
  Russia earns (taxes and profit above a normal return), not the value of trade, so the name says that.
- **Uncertainty inside the ranking.** The owner: "I like the ranking. But maybe in the ranking we have the uncertainty
  there. So we can just see it." Faded rows keep their place by their middle value.
- **The buyer of laundered oil stays charged.** The owner: "We charge the profits. And if I buy Indian oil, I know
  it's from Russia." No method change; the reason is now explained.
- **North Korea as a party to the war.** The owner: "I think North Korea is a party to the war. Maybe." It is easy to
  revert (item 3).
- **The method text describes the present.** The owner asked to clean it up, removing the development history rather
  than rewriting it; the history is here.
- **Kiel's figure shown, ours kept.** The owner asked to show Kiel's numbers next to ours and explain the difference in
  short.

<h2 id="cl-r28">Round 28: signs in the breakdown, like a balance sheet <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold flowback -->

**Each row in "What makes up the number" again carries a sign: + when it adds to its section's headline, − when it
takes away from it. No number changed.**

### What changed

1. In each section (support for Ukraine, trade with Russia, Russian money frozen) a row reads "+1.7%" when it adds to
   the section's headline and "−0.39%" when it works against it. For Germany, "Reduced trade with Russia by 1.6%" is
   made of "+1.7% Russia kept less from fuel and goods sold here" and "−0.39% Russia kept more from war-time fuel
   prices"; for Hungary, "Increased trade with Russia by 6.1%" includes "+5.2% Russia kept more from war-time fuel
   prices". Colour still says the direction (blue toward Ukraine, orange toward Russia). The section headings keep no
   sign; their verbs say the direction.
2. The browser check (check 32) now checks every row's sign against its section's headline.

### Decisions

- **A sign on each row, relative to its section.** Raised by the owner (23 October 2026), on Germany's "Russia kept more
  from war-time fuel prices 0.39%": "should be a negative on the balance sheet; the colour makes it semi clear now, but
  not really as clear as a − would". Round 25 had removed all signs because a bare "−5.2%" read as "paid less"; a sign
  measured against the section's own headline does not have that problem. Effect: display only.

<h2 id="cl-r27">Round 27: the trade tile says what happened to trade <span class="cl-date">23 October</span></h2>
<!-- flows: paid windfall laund sold -->

**The trade tile reads "Reduced trade with Russia by 1.6%" again ("Increased …", or "Probably …" when it leans); the
two lines under it still say who kept what. No number changed.**

### What changed

1. The tile's headline is "Reduced / Increased trade with Russia by X of GDP" ("Probably reduced / increased …" when
   its likely range crosses zero but leans), instead of "Trade with Russia: toward Ukraine / Russia by". The amount is
   still measured by what each side kept (taxes and profit above a normal return), as the two lines under it and the
   "kept" tap line say. All six languages.
2. The closing sum under "What makes up the number" reads, for example, "Supported Ukraine 0.50% + reduced trade with
   Russia 6.3% = toward Ukraine by 6.8%".

### Decisions

- **The trade tile says what happened to trade.** Raised by the owner (23 October 2026): "Can we rename this not
  simply to reduce trade with Russia or what the previous name was? … we had a name that made way more sense."
  Effect: wording only.

<h2 id="cl-r26">Round 26: coherence <span class="cl-date">22 October</span></h2>
<!-- flows: paid windfall laund sold buy flowback sanctions -->

**The breakdown now matches the numbers at the top, parts with no data of the country's own count as zero, the "no
real alternative" label is gone, and the sanctions tags say who set the sanctions. Only parts with no observation
changed: 74 economies and territories; the 19 of them over EUR 5bn moved by at most 0.2 points of GDP.**

### What changed

1. **The breakdown follows the tiles** (owner, 22 October 2026, on Moldova: "the breakdown doesn't seem to match the
   numbers at the top"). "What makes up the number" has one section per tile, Support for Ukraine, Trade with Russia
   and Russian money frozen, each headed with the tile's own words and amount; inside, rows by size, each saying its
   direction in words and colour (blue toward Ukraine, orange toward Russia, grey for money flowing back), with no + or
   − sign. The closing line adds the tiles: "Supported Ukraine 0.35% − trade toward Russia 6.1% + Russia lost 0.07% on
   frozen money = toward Russia by 5.7%". The browser check now proves for every country that each section equals its
   tile and that the sections make the net.
2. **No data, no number** (owner, on the Falkland Islands: "if I don't have any data, we shouldn't put anything there").
   A trade part counts only where the country has its own observation for the war years: a figure it or its partners
   report for 2022-2025 (UN Comtrade, Eurostat), or a country-specific record from the research (non-reporters'
   trade from tanker tracking and official statements, hubs' re-export records, national statistics, gas by country
   of use, the Power of Siberia, Hong Kong's gold); for fuel made from Russian crude, the country's own customs records,
   refiners' reported exports to it or refinery-specific research. The pre-war trend carried forward, Russia's import
   gap split by origin shares and fuel reached only through EU refiners' 2021 export shares are not observations: those
   parts count as zero and are named under the trade section as "No data". A country with nothing observed at all is
   hatched on the map as "No data", with no tags and no ranking. Every part removed is listed in
   [no_data_effects](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/no_data_effects.md).
   The Falkland Islands keep only their observed sales to Ukraine (from Ukraine's own customs records).
3. **No "no real alternative to Russian fuel" label** (owner: "every country has an alternative ... all the other
   countries in Europe found an alternative"; then: "I don't know if you even need that tag anywhere. Everybody has
   alternatives... there's always a way"). The round-24b label is removed everywhere; its research stays in
   `captive_buyers.json` as background. Hungary and Slovakia get a plain label instead, **"Kept buying Russian
   pipeline oil (EU exemption)"**: the EU's crude embargo exempted crude by pipeline (Council Regulation (EU)
   2022/879), the Adria pipeline from Croatia was an alternative, and Czechia, on the same Druzhba pipeline, switched
   fully to crude via Italy and Germany by 2025 ([OSW, 18 April 2025](https://www.osw.waw.pl/en/publikacje/analyses/2025-04-18/czech-republic-no-longer-depends-russian-oil)).
4. **Sanctions tags say who set the sanctions** (owner: "these tags are weird, the US gets mostly sanctions which is
   not true at all if you look at the breakdown"). Sanctions a country set or agreed to are its own choice too, so
   "Mostly required by sanctions" became "Cut through its own sanctions" (the US, the UK, Japan, Canada, Australia, New
   Zealand, South Korea), "Cut through EU sanctions it agreed to" (EU members) or "Cut through sanctions it adopted"
   (Switzerland, Norway and others that took over the EU's); "Mostly its own choice" became "Cut beyond what sanctions
   required" (at most 40% required), and the middle case "Partly its sanctions, partly beyond them". The tap gives the
   numbers, e.g. the US: "Of the €39.7 bn less that Russia kept from its trade, about 74% was required by sanctions it
   set itself (oil import ban of March 2022, EO 14066), 26% went beyond them". Each trade part's card now shows its own
   split (the US's fuel and goods: "Required by sanctions it set itself: 75% · beyond them: 25%"), so the breakdown backs the tag up.
5. **Tag audit** on 15 large economies: "Fuel buying, not policy" claimed more than the numbers show (keeping on buying
   can be a choice; Hungary does both) and is now "Mostly from fuel buying" ("Mostly from sales to Russia"); the
   war-time discount tag now says where its money is in the breakdown (inside "Russia kept … from fuel and goods sold
   here"), since the discount is not a part of its own.
6. **Checks**: check 41 now asserts that no captive label is left and that the pipeline-exemption label changes no
   number; check 42 requires sources for the new tags; check 32 compares each section with its tile.

### Decisions

- **Tile-aligned breakdown** — *raised by:* owner; *decided by:* owner, 22 October 2026; *effect:* display.
- **A part with no observation of the country's own counts as zero** — *raised by:* owner; *decided by:* owner; *effect:*
  74 economies and territories, at most 0.2 points of GDP for those over EUR 5bn (Guinea −0.26% → −0.08%).
  Not applied: a year missing after observed years (mostly 2025, the customs lag) is still filled from the country's
  own path, because zeroing it would remove 2025 and 2026 for more than a hundred countries that report.
- **No "no real alternative" label; a plain EU-exemption label for Hungary and Slovakia** — *raised by:* owner; *decided
  by:* owner; *effect:* labels only, no number.
- **Sanctions tags name who set the sanctions** — *raised by:* owner; *decided by:* owner; *effect:* labels only.

<h2 id="cl-r25">Round 25: kept wording, two-section parts, story tags <span class="cl-date">22 October</span></h2>
<!-- flows: paid windfall laund sold services shipping companytax rusfirms rusarms statefin mil agents frozen buy flowback -->

**The trade side now says who kept what, "What makes up the number" splits the parts into toward Russia and toward
Ukraine without signs, and every country gets a few story tags. No number changed.**

### What changed

1. **"Kept" wording** (owner, 22 October 2026: "Yeah, I like the word kept ... let's just work with kept"): only what
   really stays with them is counted, taxes and profit above a normal return, not the full price paid, so the trade
   side says who kept what. The second number is **Trade with Russia** (was Business with Russia): its tile reads
   "Trade with Russia: toward Ukraine by 1.6%" (or "toward Russia", "leaning toward …"), with two lines underneath:
   "Russia kept €65.6 bn less" and "Germany kept €0.2 bn less from selling to Russia". The parts read "Russia kept
   less from fuel and goods sold here", "Russia kept more from war-time fuel prices", "Germany kept less from selling to
   Russia", "Its firms paid Russia more tax", and so on; Russian money frozen reads "Russia lost €3.2 bn in returns on
   its frozen money". A one-line explanation of "kept" sits wherever it appears. The legend reads "Russia kept more ←
   no clear change → Russia kept less"; `lens=trade` opens the map too. The full data download's columns are renamed:
   `business_with_russia_reduced_*` → `trade_with_russia_toward_ukraine_*` (same sign: positive = toward Ukraine,
   Russia kept less), `of_which_paid_russia_less_*` → `of_which_russia_kept_less_*`, `of_which_earned_less_from_russia_*`
   → `of_which_country_kept_less_from_selling_to_russia_*`.
2. **"What makes up the number" in two sections** (owner: "Yes, we should have a section towards Russia. The section
   towards Ukraine makes sense. Totally good. Approved."): **Toward Russia** and **Toward Ukraine**, each with its
   subtotal and its parts largest first (five shown, the rest one tap away), no + or − signs: the label says the
   direction, the section confirms it, and each bar grows from the section's left edge in its colour with its likely
   range. A closing line shows how the two make the headline: "Toward Russia 6.3% − toward Ukraine 0.58% = toward Russia
   by 5.7%". The ranking and other charts with a zero line keep their signs.
3. **Story tags** (owner: "add some more tags that make sense ... all the tags there ... to in short tell the story why
   the country is where it's at ... then we back that up with the numbers"): up to six short tags under each country's
   numbers (the rest behind "+ more"), each opening a sentence with its number and sources; the top three on the hover
   card. 25 rules with explicit thresholds, documented in [Story tags](#view=how&sec=m-tags): party to the war, gas
   cut off by Russia, no real alternative to Russian fuel, sanctions or own choice, war-time fuel prices, Russian oil at
   a war-time discount, trade data hidden, bought or sold N% more or less, trade hub, weapons sent to Russia, top-10 or
   major aid giver, many refugees, froze Russian money, fuel buying not policy, Russian-owned firms, taxes still paid in
   Russia, shipping Russian oil, rough data, mostly one part, small economy. Belarus, for example: party to the war,
   war-time fuel prices, Russian oil at a war-time discount, sold Russia 70% more, trade data hidden since 2022. The
   sanctions tags now need 60% (was 50%) to say "mostly", with "partly sanctions, partly own choice" in between.
4. **No double "leaning" chip**: when the headline already says "Leaning toward …", no second chip repeats it (Czechia);
   the chance of that direction moved into the headline's explanation.
5. **Ranking**: the countries not ranked (leaning toward Russia, leaning toward Ukraine, uncertain direction, party to
   the war) are tappable country chips, grouped, instead of plain text.
6. **Checks**: check 32 (in the browser) also checks that the two sections make the net in every country, that no + or −
   sign is left in the sections, and that Belarus's first tag is "Party to the war"; check 42 checks that every tag rule
   is in the tags table with a source and that every tag stating a figure from data links its sources.

### Decisions

- **"Kept" for the trade side, "Trade with Russia" for the number** — *raised by:* owner, 22 October 2026 ("I like the word
  kept ... let's just work with kept"); *why:* the numbers count what stays with Russia (or with the seller), not the full
  price, so "business" overstated them; *effect:* wording only.
- **Two sections in "What makes up the number", without signs** — *raised by:* owner ("Approved. Do that."); *why:* "−5.2%
  paid Russia war-time fuel prices" read as paying less; *effect:* display only.
- **Story tags on every country, from documented rules** — *raised by:* owner; *why:* tell in short why a country is where
  it is, then back it up with the numbers; *effect:* display only (a tag changes no number).

<h2 id="cl-r24b">Round 24b: the method changes the owner decided <span class="cl-date">22 October</span></h2>
<!-- flows: aid euaid ref flowback paid windfall laund sold services shipping companytax rusfirms rusarms statefin mil agents -->

**The changes decided in round 24, and two more decisions of the same day: a number that is not certain now says which
way it leans, and Belarus is shown as a party to the war. Numbers change for refugee hosts, military donors and North
Korea; business with Russia changes only for North Korea.** Full before/after per country is in the research log.

### What changed

1. **Refugee hosting** counts what the host spent (minus the share donors paid back) minus only the host's real gain
   on refugees' work, like any other money flowing back; the subtraction of refugees' taxes and the floor at zero
   are gone. Poland's middle value uses the OECD median margins, its own margins the range end
   ([`refugees_gain-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/refugees_gain-notes.md)).
   Net: Czechia +1.57% → +2.50% of GDP, Poland +4.40% → +5.00%, Bulgaria +2.91% → +3.20%, Slovakia +0.12% → +0.37%,
   Austria +0.21% → +0.47%, Germany +3.22% → +3.44%.
2. **Business with Russia in two lines** in the panel and the download: "Paid Russia less / more by" (payments,
   war-time prices, laundered oil, services bought, company taxes, Russian firms, Russian arms, state finance, hidden
   flows, and the unpaid part of military support) and "Earned less / more from Russia by" (sales, services sold,
   shipping, payment agents, and the paid part of military support). They add up to the old number, which does not
   change; "Russia's gain from this country rose" is now "Business with Russia rose"
   ([`business_split-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/business_split-notes.md)).
3. **North Korea** counts the full value of what it supplied, EUR 6.8bn / 10.0bn / 18.6bn (low / middle / high):
   −10.28% → −11.34% of GDP. A method-band alternative, "Russia paid only what was observed", gives −31.86%
   ([`north_korea_r24-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/north_korea_r24-notes.md)).
4. **Military aid counts as delivered**, not as allocated, for every donor: each Kiel allocation is delivered over a
   lead time by channel (donor stocks 3 months, Ukraine's own industry 1 year, other procurement 3 years, the US USAI
   4.5 years, calibrated to the Pentagon's 57% delivered by March 2026). Kiel's full allocation is the high end of the
   range. Not yet delivered by August 2026, middle value: the US EUR 10.2bn, Germany EUR 4.3bn (the
   fast lead times, the smaller cut: the German government's cash figures suggest Kiel may understate what Germany has
   paid out; EUR 6.5bn at the slow end), the UK EUR 3.5bn, EU institutions EUR 7.9bn (shared out to members by their EU share). Money
   flowing back from procurement follows delivery
   ([`military_delivered-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_delivered-notes.md);
   `pipeline/military_delivered.py`). Net: Denmark +4.44% → +4.09%, Sweden +3.58% → +3.30%, Norway +3.08% → +2.91%.
5. **War-time fuel prices**: the uncertainty of the no-war price moves from payments to Russia to the war-time prices
   line, widened to the price-path range the research found per country (Hungary EUR 0.5bn–16.2bn). A method-band
   alternative uses gas prices from early 2021, before the squeeze. Overview step 1 says this
   ([`windfall_band_r24-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/windfall_band_r24-notes.md)).
6. **Captive buyers labelled**: Mongolia, Kyrgyzstan, Armenia, Moldova (2022), Serbia (2022–23), Bosnia and
   Herzegovina, and partly Hungary and Slovakia carry a label "no practical alternative to Russian …" with its years
   and source; it changes no number (check 41)
   ([`captive_buyers-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/captive_buyers-notes.md)).
7. **Leaning instead of "too close to call"**: a number whose range or method alternatives cross zero leans toward
   Ukraine or Russia when its middle value's sign has at least a 65% chance; otherwise its direction is uncertain.
   The panel says "Leaning toward Russia by …", and the ranking lists "Leaning toward Russia", "Leaning toward
   Ukraine" and "Uncertain direction" under the ranked countries. Net, economies over EUR 5bn: 49 ranked, 26 leaning
   toward Russia, 38 toward Ukraine, 49 uncertain. Montenegro's net is now ranked
   ([`leaning-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/leaning-notes.md)).
8. **Belarus is a party to the war (with Russia)**: its own map pattern and legend entry, a line at the top of its
   panel with sources (UN General Assembly resolution ES-11/1, which deplores Belarus's involvement, and EU Regulation
   2022/355 on its role in the invasion), not ranked and in no list (check 39). Its refugee label stays.
9. **For readers**: each part's method in the panel has a note for this country where the method differs (war-time
   prices, refugees, undelivered aid, military support, captive buyer); How it works shows one live trace, from
   Germany's share of EU aid to the document behind it; each flow links to the exact decisions behind it in this
   changelog.
10. **Checks**: the two business lines add up (check 38), a party to the war is never ranked or listed (39), delivered
    military aid is never more than allocated (40), captive labels change no number (41); the browser and Node agree
    on every leaning (check 32).

### Decisions

- **Refugee hosting at actual spending minus the host's gain on refugees' work, no tax subtraction, no floor; Poland
  at the OECD median margins, its own margins the range end** — *raised by:* audit (quality); *decided by:* owner,
  22 October 2026
- **Business with Russia shown in two lines, paid Russia and earned from Russia; the total, map and ranking
  unchanged** — *raised by:* audit; *decided by:* owner
- **North Korea at the full value of what it supplied, with "Russia paid only what was observed" as a method-band
  alternative** — *raised by:* audit; *decided by:* owner
- **Military aid counted as delivered for every donor, by lead time; Germany the shorter cut; flowing back follows
  delivery; Kiel's allocation the high end** — *raised by:* audit (D M4); *decided by:* owner
- **War-time fuel prices carry the no-war price range, widened to the price-path range; early-2021 gas prices as an
  alternative** — *raised by:* audit; *decided by:* owner
- **A captive-buyer label, with no change to any number** — *raised by:* audit; *decided by:* owner
- **Leaning at a 65% chance, otherwise uncertain direction; "too close to call" retired** — *raised by:* audit;
  *decided by:* owner: "things like this should just be leaning … the range does cross zero, but it's very unlikely
  that it will be zero … unless it's smack dab in the middle, you can say uncertain"; the research's other two
  conditions (0.25% of GDP and 75% of the alternatives) are dropped; the alternatives' share is shown on a tap
- **Belarus is a party to the war, not ranked** — *raised by:* owner: "party to war, yes, for sure"; its numbers stay
  in the data and its panel
- **Not done yet:** richer country tags (only the party tag and the captive label exist; the code takes several)

<h2 id="cl-r24">Round 24: every number backed where you read it <span class="cl-date">22 October</span></h2>
<!-- flows: aid loans euaid priv ref paid windfall laund sold buy services shipping companytax agents remit gold frozen -->

**Four independent audits (a reader trace, numbers against the data, every source link, the quality of the data and
method) and the owner's decisions on them. The fixes and the new way of showing sources are here; the method changes
the owner decided come in round 24b. No number changed in this round.**

### What changed

1. **Sources show their documents.** A source is a publisher's dataset or report; under its name the reader now sees
   its 1–3 key documents as links, without opening anything, and "+ n more documents" folded. In How it works each
   money flow lists its sources grouped as official statistics and datasets, reports and studies, press reports, our
   own models and research notes, with "All N documents in one list (for checking)" at the end; the header says
   "18 sources · 127 documents". The fold "Exact tables and reports" is gone: it held the real sources (509 documents
   behind 66 bundles), and a flow such as Loans looked like it had one source when it had 25 documents.
2. **Research-note bundles show only what belongs to the flow.** The documents behind the round-11 corrections are
   tagged with the money flows they changed, so Payments to Russia no longer lists refugee budgets or crowdfunded
   drones.
3. **The country panel**: a line under the numbers, "Backed by N sources · see them", opens the panel's sources; each
   part lists its own sources in place, each with its key documents (the second link into How it works is gone); the
   list at the end shows every source under every part that uses it, and counts only the sources behind the country's
   non-zero parts (a small economy no longer lists 60 sources that feed nothing there).
4. **Sources are typed and labelled** in the build (`classify_sources()` in `pipeline/build_data.py`): press reports
   and encyclopedias are marked as press, dates say "data to", "published" or "checked", the internal "Round 11:"
   prefix is gone from names, and a source's own link is never a bare homepage. `check_data.py` check 37 holds this.
5. **Dead links replaced**: 17 links that no longer opened (UN Comtrade's old API address, Eurostat's moved trade
   database, a Bank of Russia page, Ukraine's statistics office, the KSE company list and others) point to the working
   page or to an archived copy, labelled "archived copy"
   ([`link_fixes.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/link_fixes.json)).
6. **Out-of-date figures in the method pages** corrected and now checked against the model: Germany's worked example
   (support EUR 65.4bn, business with Russia EUR 65.8bn, net EUR 134.4bn, refugees +19.7bn), the US earning back
   EUR 2.52bn, Poland's gas and oil cut off by Russia (EUR 11.1bn), Hungary without the war-time prices, the
   Tajikistan remittance marker, the counts of countries too close to call (96, 122 and 114 of 163) and the certainty
   letters' distribution. 107 figures in the text are now tagged and compared with the model on every build (check 30).
7. **Removed features no longer described as current**: the cost view, per person, the table and the Sources tab;
   the "above or below expectation" page is gone from the method (it described a view removed in round 11; a note is
   in the limitations).
8. **One name per part everywhere**: the panel's plain names ("Paid Russia war-time fuel prices", "Its share of EU
   aid") are used on the flow cards ("On the map: …") and in the lists; the flows are renamed "War-time fuel prices"
   and "Share of EU aid".
9. **Back stays on the site**: every change of view, flow or section is a step in the browser's history, so Back
   returns to the country panel or the flow card instead of leaving the site.
10. **Certainty letters explain themselves on a tap** (they only had a hover text): their meaning and a link to how
    the letters are set.
11. **Smaller fixes**: the "updated" date comes from this changelog; the Highlights and share texts use the current
    wording ("increased business with Russia"; the net "adds help given to Ukraine and the change in business with
    Russia", true for every country); function names in the method text sit in a small "In the code" note; on phones
    the Highlights and Filters buttons step aside while reading; the hover card no longer stays over an opened panel;
    the compare rows say "Net (toward Ukraine)"; self-links in this changelog removed; the two round-11 entries have
    distinct titles.

### Decisions

- **Show sources with their key documents, typed, filtered by flow; "Backed by N sources" under the numbers** —
  *raised by:* audit (sources, reader trace); *decided by:* owner, 22 October 2026 ("two makes sense")
- **Fix every stale figure and link, and the Back button** — *raised by:* audit; *decided by:* owner ("do one for sure")
- **Decided, implemented in round 24b (numbers will change):**
  - **Refugee hosting at actual spending**, minus only the host's real gain on refugees' work (as for other money
    flowing back), instead of minus all taxes refugees pay with a floor at zero — *raised by:* audit (quality);
    *why:* the tax netting broke the one-seller rule and set Czechia, Slovakia, Romania and the Baltic states to zero
  - **A "leaning" list** for countries too close to call — *raised by:* audit; *decided by:* owner
  - **Business with Russia as two lines**: Russia's gain on what it sold, and the seller's own gain on sales to
    Russia — *raised by:* audit; *decided by:* owner
  - **North Korea's value, contracted versus delivered military aid, Hungary's war-time price range, and a label for
    buyers with no alternative to Russia** — *raised by:* audit; *decided by:* owner; every change with its sources
- **Not changed:** gas that Russia cut off stays in the totals and Russia's seizures stay outside them — *raised by:*
  audit (it asked for the same treatment of both); *decided by:* owner: "if I still buy Russian gas … I'm giving
  Russia money. If I lose my company to Russia, I didn't give them anything, they stole something"; a seizure is
  theft, not a payment
- **No "choices only" net** — *raised by:* audit; *decided by:* owner: sanctions a country voted for are still a
  choice, so chosen and imposed changes cannot be cleanly separated

<h2 id="cl-r23">Round 23: one home for the documentation <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

**How it works replaces Sources and holds the method, the limitations and this changelog; the documentation in the repository now points here. No number changed.**

### What changed

1. **One home for the documentation.** The method pages, the limitations and this changelog are Markdown files in
   [`site/content/`](https://github.com/intelligent-cream/war-balance/tree/main/site/content), written
   there and nowhere else, and the site renders them in How it works. The repository's `docs/` folder no longer
   repeats them: the README points to the website, and only developer notes stay in
   [`docs/reference/`](https://github.com/intelligent-cream/war-balance/tree/main/docs/reference).
2. **Sources is How it works again**, with the same tab place: how to trace a number, the method in four lines, the
   money flows, [the method in full](#view=how&sec=method-full), [the limitations](#view=how&sec=limitations), this
   changelog and the data downloads, with a contents list on the left (a "Jump to" list on phones). Old links
   (`#view=sources`, `#view=table`) open it.
3. **Each money flow** keeps how it is calculated, why, its sources (one fold of exact tables) and its research files,
   and now also opens **Full method** (its own part of the method pages) and **Changes to this flow** (the rounds
   below that changed it, with links).
4. **The country panel is a portal**: an opened part shows its value in words and one sentence of how it is
   calculated, then "How it works: (the flow) →" and "Sources for this part", which open that flow here. The longer why,
   the per-part sources and the general method moved out of the panel; the country's own sources stay at its end.
5. **The decision log and the decisions page are folded into this changelog**: each round lists its decisions in
   short, and "Every decision in full, with evidence" one click deeper; the core choices and why each flow is counted
   are the last two sections. All 174 decision-log rows and all 303 rows of the decisions page are here, as bullets.
   The step-by-step trace of every flow (`docs/trace.md`) is gone: each flow's card holds the same path.
6. **Links**: every link to the old documentation (in the map, the source notes, `sources_r11.json` and the pipeline's
   notes) now opens the matching place in How it works.

### Decisions

- **The website is the one place for the documentation**; the repository keeps code, data, research notes and short
  developer notes — *raised by:* owner; *why:* repository documents went out of date and repeated each other;
  *effect:* display and documentation only
- **Sources renamed How it works**, holding the limitations and the changelog — *raised by:* owner
- **The country panel points into How it works** instead of repeating the method — *raised by:* owner
- **The decision log is carried into the changelog**, every decision kept; the per-flow trace page dropped — *raised
  by:* owner
- **Long-form text stays in English** in every language, with a note; the interface around it is translated —
  *raised by:* proposed; *why:* translating every method page would make six copies that go out of date

<h2 id="cl-r22">Round 22: views as tabs, sources and panel reorganised; a new name <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

**Map, Ranking and How it works (then Sources) became tabs; the country panel and the sources page were reorganised; the site became Follow the Money: Ukraine and the second number Business with Russia. No number changed.**

### What changed

Owner requests; no number changed (all 231 entries identical before and after).

1. **Views as tabs**: Map · Ranking · Sources in the header bar (`.vtabs`, role="tablist", arrow keys, Home and End);
   a full-width row under the question on phones. The Views block is gone from Filters; check 31 now asserts the
   header tabs and that the drawer has no view buttons.
2. **Country panel in three levels**: "What makes up the number" (was "The biggest parts"); one compact card per part
   (`methodCard`: value and range in words, how, why, sources one line each with one `linksFold` of exact tables,
   links); five groups replace eight folds (`group`: Over time, Context, How certain, Facts, Share and compare, each
   with a one-line preview); all sources last, closed, grouped by part and renumbered in that order (`panelSources`,
   `renumber`; a [n] mark opens it at that source). The panel header now stays above the bars' ticks.
3. **Sources view**: how to trace a number, the method in four cards, decisions folded; flows as closed cards in four
   groups (`FLOW_GROUPS`) with a sticky table of contents, a search (`wireSources`), Expand all and Collapse all; on
   phones a search and a "Jump to a flow" list. `#view=sources&flow=X` opens that flow.
4. **Renaming** (owner: "do all of this renaming and make sure to do that everywhere"): "Follow the Money: Ukraine";
   the question "Where did each country's money move: toward Ukraine or toward Russia?"; **Business with Russia** for
   the second number (was "Kept from Russia"); `lens=business` opens it too. Every number in a sentence or tile is a
   verb and an amount (`VERBS`, `verb`, `verbAround`, `netSentence`): the net block, the tiles, the hover card, the
   ranking's hover card and row labels for screen readers, the share text, the share cards and pages. Legend of the
   Russia map: "increased ← no clear change → reduced". CSV columns `business_with_russia_reduced_*`; download names
   `follow-the-money-ukraine_*`. Docs, README and licences use the new names; earlier rounds' records keep the old ones.
5. **Strings**: about 75 new or changed strings in all six languages; the ones no longer used are removed.

### Decisions

The owner asked for the views out of Filters, easier sources and a better organised country panel, then renamed the
site and its numbers. **No number changed.** "Kept from Russia" in the rows above is now called **Business with
Russia**; those rows keep the old name as the record.

- **Views as tabs** in the header bar, not in Filters — *raised by:* owner; *why:* "not really filters"; *effect:* display
- **Country panel in three levels**, five named groups, sources grouped by part — *raised by:* owner; *why:* "perfect gradual exposure"; *effect:* display
- **Sources view as a guide**: how to trace a number, flow cards, contents and search — *raised by:* owner; *why:* "easier to trace the data and method"; *effect:* display
- **"Follow the Money: Ukraine"** and the question "Where did each country's money move: toward Ukraine or toward Russia?" — *raised by:* owner; *why:* renaming; *effect:* display; downloads
- **Business with Russia** (was "Kept from Russia"), and every number as a verb and an amount — *raised by:* owner; *why:* "by 1.6%" misread; one name everywhere; *effect:* display; downloads

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 22: views as tabs, sources and panel reorganised

The owner: the views "are not really filters and they are kind of big decisions"; "make the sources easier to read,
and easier to trace the data and method in the sources. Same for the single country view ... perfect gradual exposure
and very well organised"; then a renaming, "do all of this renaming and make sure to do that everywhere". **No number
changed** (every country's figures identical before and after). The second number, "Kept from Russia" from round 17 to
round 21, is now **Business with Russia**: the rows of earlier rounds keep the old name as the record of what was
decided then.

- **The views are the page's main tabs**: Map · Ranking · Sources in the header bar (a full-width row on phones), keyboard tabs; not in Filters any more — *data or judgement:* judgement; *raised by:* owner; *why:* they change the page, they do not filter it; *effect:* display; *where:* `.vtabs`, `setView`
- **The country panel in three levels**: numbers first; then what makes up the number, one compact card per part (how, why, its sources one line each, one fold of exact tables, the links); then five closed groups with a preview (over time, context, how certain, facts, share and compare) replacing eight loose folds; last all the country's sources, closed, grouped by part and numbered in that order — *data or judgement:* judgement; *raised by:* owner; *why:* gradual exposure: each level only when asked; *effect:* display; *where:* `methodCard`, `group`, `panelSources`, `renumber`
- **The Sources view as a guide**: how to trace a number (source → research note → part on the map → the country's number), the method in four cards, then the money flows as closed cards in four groups with a table of contents and a search; one fold of exact tables per flow — *data or judgement:* judgement; *raised by:* owner; *why:* 16,800 px of open text before; now each flow opens on demand; *effect:* display; *where:* `renderSources`, `FLOW_GROUPS`, `wireSources`
- **Site name "Follow the Money: Ukraine"** (was "Follow the Money: Ukrainian Aid") in the page, its tags, the share cards and pages, the credit line, the downloads (`follow-the-money-ukraine_*`) and the docs; the address stays — *data or judgement:* judgement; *raised by:* owner; *why:* the site is about money in both directions, not only aid; *effect:* display; downloads; *where:* `index.html`, `share_cards.mjs`, `views2.js`
- **The question "Where did each country's money move: toward Ukraine or toward Russia?"** (was "Who supported Ukraine, and who paid Russia less, or more?") — *data or judgement:* judgement; *raised by:* owner; *why:* one question for the one map; *effect:* display; *where:* header, tags
- **Business with Russia** replaces "Kept from Russia" as the second number's name (positive: reduced; `lens=payments`, `lens=kept` and now `lens=business` open it); the panel says what it holds: buying from and selling to Russia, services, shipping and company taxes paid there, each compared with no war — *data or judgement:* judgement; *raised by:* owner; *why:* "kept from" read as money held back; business is what changed; *effect:* display; *where:* `OLD_LENS`, tiles
- **Every number in a sentence or tile is a verb and an amount**: "Toward Ukraine by 3.2% of GDP", "Supported Ukraine with …", "Reduced (or Increased) business with Russia by …", "Froze Russian money worth …"; the amount has no sign and a % always says "of GDP"; the net in words adds the three. Charts keep their signed axes — *data or judgement:* judgement; *raised by:* owner; *why:* "by 1.6%" must not read as a 1.6% fall in trade, and a sign in a sentence was misread; *effect:* display; *where:* `VERBS`, `verb`, `netSentence`
- **CSV columns `business_with_russia_reduced_*`** (were `kept_from_russia_*`), same sign: positive = reduced — *data or judgement:* judgement; *raised by:* owner; *why:* the same name everywhere; *effect:* downloads; *where:* `views2.js`

</details>

<h2 id="cl-r21">Round 21: polish, Crimea and borders <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

**A calmer design; Crimea drawn as Ukraine; borders as Google Maps shows them for most of the world. No number changed.**

### What changed

#### Round 21: polish

Owner request ("clean it up even more, make it look even more professional"); no number changed (the map's own model
for all 231 entries identical).

1. **Header bar** (`#bar`): the slim banner, the boxed header line on the map and the two buttons are one bar above the
   map. "Research preview · estimates not yet checked by a person · About"; About (`setAbout`) opens the full
   research-preview text below the bar (Escape or a click outside closes it); a data load error opens it too. The
   view below no longer needs the header's height (`--hdr-b` gone; `placeView` now sets `--bar-h` for the ⓘ popover
   on phones).
2. **Capital labels** (`placeLabels`): Ukraine's name below the Kyiv dot, Russia's right of the Moscow dot, at a fixed
   distance on screen at every zoom.
3. **Colours**: three blues, three oranges and one grey (`BLUES`, `ORANGES`, `STEPS` with three boundaries each; the
   first unchanged). `scaleFor().fade` makes a pale tint of the same hue (HCL: chroma ×0.6, lightness half way to 92
   in the light theme, 72 in the dark); the map's 72% shading under the streams is gone. `scaleFor()` now also returns
   `neutral` and `lightest`, which `pipeline/browser_check.mjs` uses instead of palette positions. Share cards: the
   faded text colours are a softer blue and orange (`#5b88b5`, `#cc7a40`, 3:1 or more on the card), not a brown.
4. **Streams** (`drawStreams`): thin solid lines (up to 6 px, 3.5 on phones) that fade in; 8 each way (5 on phones);
   the moving-dash layer `#streamfx`, its pause on drag and the arrowhead markers are removed.
5. **Typography**: `--font-data` is the body font; `font-variant-numeric: tabular-nums` on the page; IBM Plex Mono is
   no longer loaded; section labels in sentence case without letter-spacing.
6. **Filters**: views, the map shows, measure, "Up to" (the year) and find a country on top; **More options**
   (`#more-fold`) folds what's counted, where (region, group, size) and the map layers; display last.
7. **Opening frame** (`openView`): Europe and western Asia (desktop centred on 40°E 45°N, phones on 26°E 44°N).
8. **Country panel**: tiles and the frozen-money row without borders or backgrounds, hairlines between them, more
   padding; the "what changes the meaning" box is a left rule.
9. **Share cards**: the world card's title box moved to the right, clear of Europe.
10. **Strings**: 5 new in all six languages ("Research preview", "estimates not yet checked by a person", "About",
    "More options", "Where"); "Where and when" removed.

#### Round 21b: Crimea is Ukraine

The owner: Crimea is not Russia. The map data (Natural Earth, de facto control) drew it inside Russia; on load the site
now moves its polygon to Ukraine and merges the two into one shape (`googleBorders` in `index.html`), on the desktop
and phone maps and the share cards. No number changed.

#### Round 21c: borders as on Google Maps

The owner: the other borders as Google Maps shows them for most of the world. Somaliland is now part of Somalia and
Northern Cyprus part of Cyprus, merged into one shape on load (`googleBorders`). Kosovo, Western Sahara, Taiwan and
Palestine stay as drawn, as on Google Maps. No number changed.

### Decisions

The owner asked for a cleaner, more professional look. **No number changed.**

- **One header bar** with the site's name, a short research-preview note (About opens the full text), the question and the two buttons — *raised by:* owner; *why:* the banner was cut off; the boxed title looked unfinished; *effect:* display
- **Capital names beside the Kyiv and Moscow dots** at every zoom — *raised by:* owner; *why:* a dot without its name; *effect:* display
- **Three steps each way and one grey; faded = a pale tint of the same hue**; full colours under the streams — *raised by:* owner; *why:* muddy browns; *effect:* display
- **Thin solid streams**, 8 each way (5 on phones) — *raised by:* owner; *why:* the busiest part of the screen; *effect:* display
- **One typeface with tabular figures**, sentence-case labels — *raised by:* owner; *why:* a technical look; *effect:* display
- **More options** folds the rarely used filters — *raised by:* owner; *why:* a long drawer; *effect:* display
- **The map opens on Europe and western Asia** — *raised by:* owner; *why:* it cut through Africa; *effect:* display
- **The country panel without boxes inside its box** — *raised by:* owner; *why:* boxes inside boxes; *effect:* display
- **Crimea is Ukraine** on the map: the map data drew it inside Russia; it is now part of Ukraine's shape — *raised by:* owner; *why:* Crimea is Ukraine; *effect:* display
- **Borders as on Google Maps** for most of the world: Somaliland part of Somalia, Northern Cyprus part of Cyprus; Kosovo, Western Sahara, Taiwan and Palestine as drawn — *raised by:* owner; *why:* the same pattern as Google Maps; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 21: polish

The owner asked to "clean it up even more, make it look even more professional" and approved seven changes. **No
number changed** (every country's figures identical before and after).

- **One header bar** above the map: the site's name, "Research preview · estimates not yet checked by a person · About" (About opens the full text: dates, how the figures were compiled, how to report an error), the question with its period and ⓘ, and the Highlights and Filters buttons (at the bottom on phones). It replaces the cut-off banner line and the boxed header on the map — *data or judgement:* judgement; *raised by:* owner; *why:* the banner ended mid-sentence; a boxed title on the map looked unfinished; *effect:* display; *where:* `#bar`, `setAbout`
- **The names of Ukraine and Russia beside the dots of Kyiv and Moscow**, at a fixed distance on screen at every zoom — *data or judgement:* judgement; *raised by:* owner; *why:* zoomed in on Europe the Moscow dot was left without its name; *effect:* display; *where:* `placeLabels`
- **Dark by default stays** (an earlier owner decision: the light theme did not work then); the light theme is one switch away in Filters — *raised by:* owner (round 8); *effect:* none; *where:* `ftm-theme`
- **Three steps each way and one grey** (four each way before); the darkest orange, a brown, is gone. The first step's boundary, where "no clear change" ends, is unchanged — *data or judgement:* judgement; *raised by:* owner; *why:* fewer, cleaner colours; *effect:* display; *where:* `BLUES`, `ORANGES`, `STEPS`
- **Too close to call: a pale tint of the same hue** (chroma cut by 40%, lightness half way to a pale level), not a mix with the grey; the map keeps full colours under the streams (it was shaded to 72%) — *data or judgement:* judgement; *raised by:* owner; *why:* the faded oranges turned muddy brown on the dark map; *effect:* display; *where:* `scaleFor().fade`
- **Thin solid streams that fade in**, the 8 largest each way (5 on phones; 12 and 7 before), no moving dashes or arrowheads — *data or judgement:* judgement; *raised by:* owner; *why:* the dotted streams were the busiest part of the screen; *effect:* display; *where:* `drawStreams`, `streamTop`
- **One typeface**: Source Sans 3 with tabular figures for numbers (Archivo for headings), sentence-case labels without letter-spacing; the monospace font is gone — *data or judgement:* judgement; *raised by:* owner; *why:* the technical look; *effect:* display; *where:* CSS
- **Filters: the everyday choices on top** (views, the map shows, measure, year, find a country); region, group, size, what's counted and the map layers folded into **More options**, with a dot when anything in it differs from the default — *data or judgement:* judgement; *raised by:* owner; *why:* most readers never change them; *effect:* display; *where:* `#more-fold`
- **The map opens on Europe and western Asia** (it cut through Africa); the whole world one zoom-out away — *data or judgement:* judgement; *raised by:* owner; *why:* the story is in Europe; *effect:* display; *where:* `openView`
- **The country panel without boxes inside its box**: the tiles and the frozen-money row are separated by hairlines, more white space, the same content — *data or judgement:* judgement; *raised by:* owner; *why:* boxes inside boxes; *effect:* display; *where:* CSS

</details>

<h2 id="cl-r20">Round 20: three views <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

**Map, Ranking and Sources only; the cost view, Ukraine vs Russia, Table & data and per person removed. No number changed.**

### What changed

Owner request after round 19 went live; no number changed.

1. **Three views**: Map, Ranking, Sources. Ukraine vs Russia (`renderBubbles`) and Table & data (`renderTable`) are
   removed; `#view=bubbles` opens Ranking and `#view=table` opens Sources (`OLD_VIEW`).
2. **A clean ranking**: only the chart and, below it, the countries too close to call. The header line says
   "Ranking: Net (the sum)" (or the part shown); its ⓘ (`rankInfo` in `views.js`) holds the explanation that sat above
   the chart. The one-line filter summary (`filterSummary`) is gone from every view.
3. **Download the data** at the end of Sources (`dataHtml`, `wireData` in `views2.js`): "Full data (CSV)", "CSV with
   every part", "Full data (JSON)" and the data gaps by country.
4. **Strings**: 2 new in all six languages, 1 changed, 28 no longer used removed. CSS for the bubbles, the table and the
   filter summary removed.
5. **No per person measure** (the owner, after the three views went live): Measure is % of GDP or Total €; `m=pp`
   opens % of GDP. The compare rows and the full data CSV keep the net per person. "Per person" removed from the
   dictionaries.
6. **Checks**: check 31 now asserts the three views and the old links to the removed ones, no `renderBubbles` or
   `renderTable`, `rankInfo` and the downloads in place.

### Decisions

The owner asked for a simpler site after round 19 went live. **No number changed.**

- **Three views**: Map, Ranking, Sources; Ukraine vs Russia and Table & data removed, their old links open Ranking and Sources — *raised by:* owner; *why:* simpler; *effect:* display
- **The ranking as clean as the map**: its title in the header line, its explanation in the ⓘ — *raised by:* owner; *why:* "more clean like the map"; *effect:* display
- **Downloads at the end of Sources**, with the data gaps by country — *raised by:* owner (the table removed); *why:* the data stay downloadable; *effect:* downloads
- **No per person measure**: % of GDP or Total €; old `m=pp` links open % of GDP — *raised by:* owner; *why:* "not so relevant"; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 20: three views

The owner, after round 19 went live: "the ranking pages should be more clean like the map where you just click the (i)
at the top to get the more information besides that you use the filter, remove the Ukraine vs Russia thing and the
Table & data ... just keep the sources ranking and map to keep it simpler". **No number changed.**

- **Three views**: Map, Ranking, Sources. Ukraine vs Russia and Table & data are removed; `#view=bubbles` opens Ranking, `#view=table` opens Sources — *data or judgement:* judgement; *raised by:* owner; *why:* simpler; *effect:* display; *where:* `VIEWS`, `OLD_VIEW`
- **The ranking as clean as the map**: no title, filter line or notes above the chart; the header line names it ("Ranking: Net (the sum)") and its ⓘ explains the dots, lines, measure, scale and what the net adds. The list of countries too close to call stays below the chart — *data or judgement:* judgement; *raised by:* owner; *why:* "more clean like the map"; *effect:* display; *where:* `rankInfo`, `renderInfo`
- **Downloads move to Sources**: "Full data (CSV)", "CSV with every part", "Full data (JSON)" and the data gaps by country, at the end of the Sources view. The downloads of only the rows shown went with the table — *data or judgement:* judgement; *raised by:* owner (the table removed); *why:* the data stay downloadable; *effect:* downloads; *where:* `views2.js`
- **No per person measure**: the Measure in Filters is % of GDP or Total €; `m=pp` in an old link opens % of GDP. The panel's compare rows and the full data download keep the net per person — *data or judgement:* judgement; *raised by:* owner; *why:* "per person is also not so relevant"; *effect:* display; *where:* `#drawer`, `setFilters`
- **The one-line filter summary is gone** from the views; the Filters button's dot still shows when anything differs from the default — *data or judgement:* judgement; *raised by:* owner; *why:* filters live only in Filters; *effect:* display; *where:* `filterSummary` removed

</details>

<h2 id="cl-r19">Round 19: one place for every filter <span class="cl-date">21 October</span></h2>
<!-- flows:  -->

**Every filter in one drawer that stays open; the cost view removed. No number changed.**

### What changed

Owner requests (the interface); no number changed for the net, support for Ukraine or kept from Russia
(the map's own model run on all 231 entries identical before and after).

1. **Views in the Filters drawer.** A "Views" control at the top of the drawer: Map, Ranking, Ukraine vs Russia,
   Table & data, Sources. How it works is no longer a view (`#view=how` opens Sources; the panel's link to its
   waterfall now points to the method on the bars and to Sources); `views2.js` now holds the table. The Top lists
   (the drawer's section, its button and the "Top lists" panel) are gone: `#c=RANKINGS` opens the Ranking view.
2. **Filters only in the drawer.** The group and "small economies" chips are gone from the Ranking, Ukraine vs Russia
   and Table & data views; each view follows the drawer live and shows a one-line summary with a link to it.
3. **A persistent drawer.** It stays open until it is closed: map moves, view switches, filter changes and country
   clicks leave it open. Desktop: on the left, above everything, beside the country panel on the right. Phones: a
   bottom sheet at a chosen height (half, nearly full, or its handle; drag or tap the handle), shrinking to its handle
   when a country opens. Open state and height kept in sessionStorage. The map layers are switched off, with a note,
   outside the Map view.
4. **No cost view.** "The map shows": Net, Support for Ukraine, Kept from Russia. Removed: the cost button, colours,
   legend words, ranking lists, compare rows, the panel's "What it cost" fold (money flowing back has its own fold),
   the hover card's cost, the highlight caveat's and the Sources flows' cost wording. `lens=cost` opens the net. The
   cost stays in the full data CSV, labelled. The taken-by-Russia note: "Russia took €X from companies of this country
   (seizures and forced sales); not in the totals".
5. **No quick buttons** "€ to Ukraine" and "Change in € to Russia".
6. **The measure in the country panel.** Per person or total €: the big number, tiles and bars in that measure, with
   % of GDP as the second line.
7. **The drawer's order**: views; the map shows; measure; what's counted; where and when; map layers; find a country;
   display.
8. **Table & data rebuilt** (`views2.js`): one row per country in the filter; grouped, sortable columns (net, support
   for Ukraine, kept from Russia, Russian money frozen, each with likely range and letter; GDP; population; main
   parts) in the drawer's measure; sticky header and country column; its own scroll box. "Download CSV" and "Download
   JSON" export exactly what is shown; "Full data (CSV)", "CSV with every part" and data.json give everything. The data
   gaps by country moved here from the old Top lists panel.
9. **Sources.** Four sources cited only in panel notes are now in the Sources view (gas cut-offs, the UN resolution on
   Belarus, the Dangote refinery, the Hormuz crisis), so it lists all 66. Each country panel ends with an unfolded
   Sources section of every source used for its figures.
10. **Highlights** unchanged, apart from the taken-by-Russia caveat's wording.
11. **Strings**: 40 new strings in all six languages; 271 entries no longer used anywhere in the site removed from each
    dictionary.
12. **Checks**: check 31 now asserts the three views, `lens=cost` → net, the Views list in the drawer, no How it works
    view, `#c=RANKINGS` → Ranking, a drawer closed only by its own controls and kept in sessionStorage, no filter
    controls in the views and no cost wording in the site's text; check 29 counts the Ranking view's rule
    (`uncertain(m.c, y, hq)`) where the Top lists' ranking used to be; check 25's wording no longer names a cost view.

### Decisions

The owner asked for a simpler interface: every filter in one drawer that stays open, the views listed at its top, and
no cost view. **No number changed** for the net, support for Ukraine or kept from Russia.

- **Views at the top of Filters** (Map, Ranking, Ukraine vs Russia, Table & data, Sources); How it works and the Top lists removed, their old links open Sources and the Ranking view — *raised by:* owner; *why:* one list of the ways to look at the data; *effect:* display
- **Filters only in the drawer**: the views have no filters of their own and say in one line what they show — *raised by:* owner; *why:* two sets of filters disagreed; *effect:* display
- **A persistent drawer**: open until closed, on the left on desktop beside the country panel, a bottom sheet with a chosen height on phones; kept for the visit — *raised by:* owner; *why:* it closed on every change; *effect:* display
- **No cost view**: "The map shows" is Net, Support for Ukraine or Kept from Russia; `lens=cost` opens the net; the cost stays in the full data download, labelled — *raised by:* owner (to simplify); *why:* a different kind of number; *effect:* display; downloads
- **No quick buttons** ("€ to Ukraine", "Change in € to Russia") — *raised by:* owner; *why:* they repeated the map shows plus the measure; *effect:* display
- **The measure in the country panel**: per person or total € for the big number, tiles and bars, % of GDP beside them — *raised by:* owner; *why:* the panel ignored the measure; *effect:* display
- **Table & data rebuilt**, with downloads of exactly what is shown and the full data — *raised by:* owner; *why:* "needs a lot of work"; *effect:* display; downloads
- **Every source listed**, in the Sources view and at the end of each country panel — *raised by:* owner; *why:* the method flow ends at the sources; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 19: one place for every filter

The owner's interface requests, in order. Presentation only: **no number changed** for the net, support for Ukraine or
kept from Russia (the map's own model run on all 231 entries and `headline.json` byte-identical before and after; check 32
still matches the browser with Node). The rows of earlier rounds keep their wording as the record of what was decided
then.

- **Views at the top of the Filters drawer**: Map, Ranking, Ukraine vs Russia, Table & data, Sources, as one segmented control. **How it works is no longer a view**: its entry points are gone (`#view=how` opens Sources); its content is in these docs, and the panel's text that pointed to its waterfall now points to the method on each bar and to Sources. **The Top lists are gone** (the drawer's "Top lists" button and its top ten and bottom five, and the "Top lists" panel): the Ranking view does that; `#c=RANKINGS` and `#RANKINGS` open the Ranking view, and the panel's data-gaps table moved to Table & data — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the ways of looking at the data belong together, first; the top lists repeated the Ranking view; *effect:* display; old links keep working; *where:* `.dviews`, `VIEWS`, `OLD_VIEW`, `parseHash()`; check 31
- **All filtering only in the drawer**: the Ranking, Ukraine vs Russia and Table & data views have no filter controls of their own (the group and "small economies" chips are gone). Each reads the drawer's state (what the map shows, measure, what's counted, region, group, size, year), updates live when it changes and says in one line what it shows ("Net (the sum) · % of GDP · EU · 2022–Aug 2026"), with a link that opens the drawer — *data or judgement:* judgement; *raised by:* owner; *why:* two sets of filters disagreed and confused; *effect:* display; *where:* `filterSummary()`, `views.js`, `views2.js`; check 31
- **The drawer is a persistent top layer**: Filters opens it and it stays open until the reader closes it (the Filters button, ×, or Escape inside it); panning or zooming the map, switching views, changing a filter or clicking a country leave it open. On desktop it sits on the left, above everything, and the header line, legend, fact card and views make room; the country panel stays on the right, so both show. On phones it is a bottom sheet that keeps the height chosen (half the screen, nearly all, or its handle only; drag or tap the handle); opening a country shrinks it to its handle so the panel shows above it. Open or closed and the sheet's height are kept for the visit (sessionStorage, where the browser allows it). Map layers apply to the map only: switched off, with a note, in the other views — *data or judgement:* judgement; *raised by:* owner; *why:* the drawer used to close on every view switch, country pick and search, so each change meant reopening it; *effect:* display; *where:* `openDrawer()`, `closeDrawer()`, `setDrawerSize()`, `drawerSpace()`; check 31
- **The map shows three things**: Net (the sum), Support for Ukraine, Kept from Russia. **The cost to the country is removed as a view everywhere** (the owner, to simplify): its button, its colours and legend, its ranking lists (the Ukraine panel's second list and the Top lists), its rows in the compare panel, the panel's folded "What it cost" section (its money-flowing-back details stay, in their own fold "Money flowing back"), the "How this is calculated" line on it, its words in the hover card, the highlights, the Sources view and the docs. `lens=cost` opens the net. `calc()` still works it out, and the full data download keeps it, labelled `cost_to_the_country_*_not_shown_on_the_site`. What Russia took from companies is a marker: "Russia took €X from companies of this country (seizures and forced sales); not in the totals" — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* a fourth view of a different kind of number (what it cost, not where money went) made the site harder to read; *effect:* display; no headline number changed; *where:* `LENSES`, `OLD_LENS`, `STEPS`, `takenNote()`, `csvFull()`; checks 25 and 31
- **The quick buttons "€ to Ukraine" and "Change in € to Russia" are removed** — *data or judgement:* judgement; *raised by:* owner; *why:* they were "the map shows" plus the measure; *effect:* display; *where:* `#drawer`
- **The measure carries through to the country panel**: with € per person or total €, the big number, the tiles and the parts bars are in that measure ("+€1,609" per person, in total since 2022; "+€134 bn"), with % of GDP as the second line; the bars are drawn in that measure. The hover card and the Ranking view already followed it — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the panel showed % of GDP whatever the map showed; *effect:* display only; *where:* `mVal()`, `mSec()`, `mBar()`, `netBlock()`, `partTiles()`, `partRow()`, `firstLayer()`
- **The drawer's order after Views**: the map shows; measure; what's counted (kept as it is); where and when; map layers; find a country; display — *data or judgement:* judgement; *raised by:* owner; *why:* the most used choices first; *effect:* display; *where:* `#drawer`
- **Table & data rebuilt**: one row per country in the drawer's filter; grouped, sortable columns for the net, support for Ukraine, kept from Russia and Russian money frozen, each with its likely range and certainty letter (with "?" where the direction is uncertain), then GDP, population and the three largest parts; in the drawer's measure; tabular numbers; a sticky header and country column; the table scrolls inside its own box (both ways), never the page. "Download CSV" and "Download JSON" give exactly the rows and columns shown, in its order and measure; the full data (every country and number in € and % of GDP, every part, data.json) is beside them — *data or judgement:* judgement; *raised by:* owner ("needs a lot of work"); *why:* the old table mixed units, had its own filters and did not show the ranges and letters of all four numbers; *effect:* display; downloads; *where:* `views2.js`
- **Sources complete; a Sources section in every panel**: the Sources view now lists every source in data.json (four were only cited in panel notes: the gas cut-offs, the UN resolution on Belarus, the Dangote refinery and the Hormuz crisis); each country panel ends with a Sources section listing every source used for that country's figures, with links. The flow is: a part's bar → how it is calculated and why → that part's sources → the panel's Sources → the Sources view — *data or judgement:* data (the list) and judgement; *raised by:* owner; *why:* a reader should find every source from the number it is behind; *effect:* display; *where:* `FLOWS` (`src`, `costParts`), `countryPanel()`
- **Highlights kept as they are** (the "taken by Russia" caveat now says the countries did not choose to move that money, instead of naming the cost view) — *raised by:* owner; *why:* the owner likes them; *effect:* none; *where:* `HL`

</details>

<h2 id="cl-r18">Round 18: the streams on phones and a visual country panel <span class="cl-date">20 October</span></h2>
<!-- flows:  -->

**Money streams work on phones; the country panel leads with numbers and bars. No number changed.**

### What changed

Owner requests; no number changed (the map's own model run on all 231 entries identical before and after).

1. **Streams on phones.** The cause: off by default under 900px with the switch below the fold of the Filters sheet; a
   tapped country's streams drawn behind the bottom sheet; the moving dashes repainting the whole map SVG each frame.
   Now on by default on phones too, with the 7 largest each way and thinner lines; a tapped country's streams move
   into view above the sheet; a phone held sideways gets a side sheet; the dashes have their own layer and pause while
   the page is hidden or the map is dragged; the idle canvas loop is gone; the reduced-motion arrowheads keep their
   size when zoomed.
2. **The country panel, numbers first.** The name only on top; the net as one big number with one compact line; the
   two parts as two tiles (and Russian money frozen as a slim third); small flags for what changes the meaning; the 7
   biggest parts as a diverging bar chart. Every sentence opens in place on a tap; the code, people and GDP are in a
   folded "About" section. 20 new strings in all six languages; 3 obsolete ones removed.
3. **The likely range on the bars.** The cause of the "not always there" range: the chart's scale ignored the ranges,
   so 65% of the shown parts had their range outline cut off at the chart edge; 20 ranges were under 4 px wide; the
   tiles drew none. Each bar is now a gradient plot ([Correll & Gleicher 2014](https://graphics.cs.wisc.edu/Papers/2014/CG14/Error%20Bars%20Considered%20Harmful%20Exploring%20Alternate%20Encodings%20for%20Mean%20and%20Error.pdf);
   Newman & Scholl 2012, *Psychonomic Bulletin & Review* 19(4):601–607): solid to the low end ("at least"), a fade to
   the high end ("could be up to"), a dark tick at the best estimate; a range across zero is a faint fade both ways.
   Same bar on the two tiles; a one-line key; each opened part gives its range in words. 3 new strings in all six
   languages.

### Decisions

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 18: the streams on phones, and a country panel of numbers and bars

Two owner requests. Presentation only: **no number changed** (the map's own model run on all 231 entries gives
byte-identical output and `headline.json` before and after; check 32 still matches the browser with Node). The
round-17 rows above keep their wording as the record of what was decided then.

- **Money streams on by default on phones, calmer there** (owner: "the money flows are not working on mobile"). Cause found in phone emulation (iPhone 13, Pixel 7, both orientations): the streams were off by default under 900px and their switch sat below the fold of the Filters sheet, so on a phone nothing moved; switched on, a tapped country's own streams were drawn behind the bottom sheet (the map did not move), and the moving dashes, inside the map's SVG, repainted every country path each frame (about 47 fps with 4× CPU throttling; 31 fps at 6×). Now: on by default everywhere; on phones the 7 largest each way (12 on larger screens) and lines about half as thick; a tapped country's streams move into view above the sheet (beside it on a phone held sideways, where the panel is now a side sheet); the dashes are on their own layer (`#streamfx`) and pause while the page is hidden or the map is dragged; the gross-flow canvas loop runs only while those lines are on, at no more than 2 device pixels per CSS pixel; the reduced-motion arrowheads keep one size on screen (they grew with the zoom into blobs on phones) — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the streams are the map's story in euros; on a phone they were invisible or hidden; *effect:* display only; 60 fps on phone emulation with 4× throttling; the ⓘ says how many streams each way; *where:* `STREAMS_DEFAULT`, `streamTop()`, `drawStreams()`, `frameStreams()`, `#streamfx`, `startLoop()`
- **The country panel: numbers and bars first, every explanation one tap away** (owner: "a lot of text ... I like just numbers ... very easy on the eyes at first. Keep all the explanations, but hide them: click to expand"). Default view: the name only (the code, people and GDP moved to a folded "About" section); the net as one big number with one compact line (€ · likely range · ≈ per year) and its certainty letter; the two parts as two tiles with a small bar, and Russian money frozen as a slim third tile where it exists; "what changes the meaning" as small flags with an icon; the 7 biggest parts as a diverging bar chart on one zero line (blue toward Ukraine, orange toward Russia), "Show the other N parts". Behind a tap, in place: the lead sentence and what the net adds (net), the parts in words, ranges, average year, gas Russia cut off and refugees not counted (tiles), each flag's meaning, each part's how / why / sources (bars). Everything else stays in the folded sections at the bottom — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the owner liked the bars and the bare numbers, not the sentences around them; *effect:* display only; nothing deleted: a browser check opens every fold before and after and finds every figure and every explanation sentence of the old panel in the new one (DEU, HUN, LTU, USA, CHN, PRK, BEL, TUR, IND, NGA, BLR, FRA); *where:* `netBlock()`, `partTiles()`, `meaningFlags()`, `leadParts()`, `partRow()`, `barAxis()`, `firstLayer()`, `countryPanel()`
- **Each bar shows its likely range as a gradient plot** (owner: the range outline was "so vague to understand" and "not always there"). Cause found by measuring the 7 shown parts of every country (830 rows): no part lacks a low and high value, and the outline was drawn above the bar, not under it; but the chart's scale was set by the central values only, so in 539 of 830 rows (65%) the range ran past the chart edge and its outline was cut off there, where it merged with the track's own rounded edge; 20 ranges were under 4 px wide (Korea's aid 0.6 px), so the faint grey outline (45% opacity) vanished into the bar's end; and the two tiles' small bars never drew a range at all. Now, following [Correll & Gleicher 2014, "Error Bars Considered Harmful"](https://graphics.cs.wisc.edu/Papers/2014/CG14/Error%20Bars%20Considered%20Harmful%20Exploring%20Alternate%20Encodings%20for%20Mean%20and%20Error.pdf), which recommends gradient plots over bars with error bars because of the within-the-bar bias (Newman & Scholl 2012, *Psychonomic Bulletin & Review* 19(4):601–607) and the cliff effect at the ends of an interval: solid colour from zero to the low end of the likely range (what we are fairly sure of), a fade in the same hue from there to the high end (what it could be up to), and a thin dark tick, a little taller than the bar, at the best estimate. A range that crosses zero has no solid part: a faint fade in the faded colour of its leaning direction (as on the map) spreads both ways from zero, with the tick at the best estimate. The scale now makes room for the ranges (each side grows by at most half the central values' span, so one very wide range does not squash every other bar; beyond that the fade is cut at the edge at the strength it has there); the fade is at least 6 px wide and the tick has a hairline of the surface colour, so both read in light and dark. A one-line key above the bars (at least · could be up to · best estimate); each part's opened row now gives its range in words in % of GDP and €. The two tiles use the same bar; the net has no bar — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* an outline box around a bar is read as "the bar" (values inside it look more likely) and the box was often missing; a fade shows "at least" and "could be up to" without a hard edge; *effect:* display only; numbers identical (the map's own model, all 231 entries); *where:* `barAxis()`, `barHtml()`, `fadeHtml()`, `barKey()`, `partTiles()`, `methodCard()`, `--fa0`…`--fx1`

</details>

<h2 id="cl-r17">Round 17: redesign, the map first <span class="cl-date">20 October</span></h2>
<!-- flows:  -->

**The map opens on its own with one colour rule; filters fold away. No number changed.**

### What changed

**Redesign: the map first (option B), 20 October 2026.** The owner chose option B of the first-view prototypes, with
the country panel and highlights of prototype v2 and the "what's counted" switches of concept 2.
**No number changed**: `calc()` with every part counted is the same code, and the model's output for all 231 entries
is byte-identical before and after (check 32 still matches the browser with Node).

1. **The first view**: the map fills the screen; on top only the research-preview banner as one slim line, one header
   line with an ⓘ popover, a one-row legend ("More" opens the steps and keys) and two buttons, Highlights and Filters.
   The control bar, the map title box, the hint and the zoom buttons are gone from the first view (zoom is in Filters).
2. **The Filters drawer**, collapsed by default, holds everything that was in the bar, plus region, group and size
   filters (shared by the map, the drawer's ranking and the Ranking, bubbles and table views), "€ to Ukraine" and
   "Change in € to Russia", the rankings and top lists, the pages, the map layers, theme and language. A dot on the
   button shows a change from the default.
3. **One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change. "Direction uncertain" is grey
   without dots; support below zero, the net of a country that mainly earned from the war effort, and a gain in the
   cost view are grey (gold and the gold outline are gone); money flowing back is grey in the panel's bars.
4. **"Kept from Russia"**, positive when the country paid Russia less than without the war, in every text, list,
   download (`kept_from_russia_*` columns, a `kept_from_russia` object in the JSON, a `figures` column), share text,
   card and OG description, and in all six languages; sentences say "paid Russia X less (or more) than without the
   war". `lens=kept` opens the view. Check 31 now also checks the closed drawer, the two buttons and that no page text
   says "change in payments to Russia".
5. **Money streams** replace the gross flow lines as the default layer: blue to Kyiv sized by support for Ukraine in
   €, orange to Moscow sized by how much more the country paid Russia than without the war in €, the map's own numbers;
   the 12 largest each way; a country's own streams on hover or when picked; static arrows with reduced motion; off by
   default on phones. The gross flow lines remain in Filters as "Gross trade flows", off by default. The map markers
   (critical goods, wages from Russia, taken by Russia) are off by default too.
6. **What's counted**: 16 switches in the drawer, with world totals. Every number recomputes; a yellow "Custom mix, not
   the official figures" note with "Reset to the official numbers" shows wherever numbers do; custom mixes cannot be
   shared and downloads name the parts switched off.
7. **Highlights**: seven chips from prototype v2, worked out from the data, each with a fact card and its caveat;
   `#hl=…` links to one.
8. **The country panel**: headline sentence, total with range and certainty in words, the two parts in words, "What
   changes the meaning here", the five biggest parts and all parts, each opening its method in place (how, why with
   its decisions, this country's sources, method page, trace); everything else behind "Show more".
9. **Sources view**: the method in four lines and how decisions are made on top; how and why for each flow.
10. **Hover card**: two bars in words (support for Ukraine and kept from Russia), the net with its range, and the
    orange caveat for orange countries ("mostly fuel buying, not siding with Russia"; weapons and troops, or sales to
    Russia, where those are the main part).
11. **Share cards and pages regenerated** (`pipeline/share_cards.mjs`) with the new name, the sign in words and the
    one colour rule; check 24 passes on all 231 pages.
12. **Too close to call is faded, not grey** (owner): a number whose likely range or method band crosses zero takes the
    colour of its leaning direction mixed halfway toward the neutral grey, on the map, in the hover card's bars and in
    the panel's big number; no dots, no outline; still not ranked and without a stream. Grey is now only no clear
    change and the net of a country that mainly earned from the war effort. Legend, ⓘ and the panel's note say so in
    all six languages; check 32 expects the faded colour. 61 countries on the default map change from grey to faded.
13. **The Filters drawer in seven calm sections** (owner): the map shows and measure, find a country, what's counted
    (folded), where and when, map layers, rankings and top lists, display; on/off switches, full-width segmented
    controls, a sticky header and a bottom sheet on phones. No control removed.
14. **The country panel, each number once** (owner): header with a lead in words and the net with its range; the two
    parts once, with value, range and grade; at most four notes; the five biggest parts and the other parts; then
    folded sections for cost, method band, markers, sanctions or own choice, per year, aid and companies, share and
    sources. The net had appeared four times, each part up to six times; the duplicates are gone.

**Not ported from the prototypes**: the bivariate map (replaced by the one colour rule), concept 2's workbench layout,
v2's separate Rankings page (the Ranking view and the drawer's top ten cover it), option C's two maps, the prototypes'
proposed "poorer importer" rule (not approved; the round-14 fairness note stays) and the full per-flow decision lists
(each part links to its decisions section and the log).

### Decisions

The owner compared the first-view prototypes A, B and C and **chose B**: the map first, with money streams, v2's
country panel and highlights, and concept 2's "what's counted" switches. **No number changed.**

- **Map first**: on load only the slim research-preview banner, one header line with ⓘ, a one-row legend and two buttons (Highlights, Filters) — *raised by:* owner; *why:* the controls covered the map; *effect:* display
- **Filters collapsed by default**, with a dot when anything differs — *raised by:* owner; *why:* one place for every control; *effect:* display
- **One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change; no teal, no bivariate map; "too close to call" grey without dots (later in round 17, at the owner's request, a faded colour of its leaning direction instead); gold gone; the EUR 5bn colour clamp kept — *raised by:* owner; *why:* two directions, two hues; *effect:* display
- **"Kept from Russia"** replaces "Change in payments to Russia" everywhere, with the sign in words ("paid Russia €65.8bn (1.6% of GDP) less than without the war") — *raised by:* owner; *why:* the old name read as "paid more" next to a plus; *effect:* wording; CSV and JSON fields renamed
- **Streams = the map's numbers**: support to Kyiv, how much more was paid to Moscow, in €; top 12 each way; off on phones; the gross flow lines optional — *raised by:* owner; *why:* one story on one map; *effect:* display
- **What's counted**: switches that recompute everything through `calc()`, with a "Custom mix, not the official figures" note and reset; custom mixes are not shared — *raised by:* owner; *why:* readers asked for it; the note keeps it honest; *effect:* none by default
- **Highlights** with the corrected Baltic chip (Lithuania's cut mostly its own choice) — *raised by:* owner; *why:* stories one click from the map; *effect:* display
- **Method on the bars**: each part of a country opens its how, why, sources and links — *raised by:* owner; *why:* the method sits on the number; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 17: redesign

The owner tested three first-view prototypes (A: the net map with two bars on hover; B: the net map with money streams;
C: two maps side by side) and the two earlier prototypes (v2: the method on the bars and the highlights; concept 2: the
"what's counted" switches), and **chose option B**, with v2's country panel and highlights and concept 2's switches.
These are presentation choices: **no number changed** (the map's own model run on all 231 entries and
`pipeline/site_numbers.mjs` give byte-identical output before and after; check 32 still matches the browser with Node).

- **The map first**: on load the map fills the screen, with only the research-preview banner as one slim line (it opens on click), one header line ("Who supported Ukraine, and who paid Russia less, or more? · 2022–Aug 2026" with an ⓘ popover), a one-row legend ("toward Russia ← no clear change → toward Ukraine") and two buttons, Highlights and Filters — *data or judgement:* judgement (presentation); *raised by:* owner (option B); *why:* the bar of controls, the title box and the large legend covered half the map and asked for decisions before the reader had seen anything; *effect:* display; the explanation (the three points, the per-year example, the orange caveat, what grey means, what the streams show) is in the ⓘ popover; *where:* `index.html` (`.topline`, `.hdr`, `.tr`, `renderLegend()`, `renderInfo()`); check 31 and the round-17 browser checks
- **Filters collapsed by default**: a drawer with find a country, the four views, the measure, "€ to Ukraine" and "Change in € to Russia", what's counted, region, group, size, year, the rankings and top lists, the pages (Ranking, Ukraine vs Russia, Table & data, How it works, Sources), the map layers, zoom, theme and language. The button shows a dot when anything differs from the default — *data or judgement:* judgement; *raised by:* owner; *why:* one place for every control, out of the way until wanted; *effect:* display; the region, group and size filters are shared by the map (others dimmed), the drawer's ranking and the views; *where:* `#drawer`, `renderDrawer()`, `filtersChanged()`, `eligible()` in `views.js`
- **One colour rule everywhere**: blue = toward Ukraine, orange = toward Russia, grey = no clear change, with the site's colour-blind-safe blue and orange in both themes; no teal and no bivariate mixing. Grey also for "too close to call" (no dot pattern; later in round 17 the owner changed this to a faded colour of the leaning direction, see below), for support below zero and for a net below zero that is mainly earning from the war effort (gold until round 17), and for a gain in the cost view. The EUR 5bn colour clamp (round 16) is kept — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* two hues for two directions read at a glance; earning from Ukraine's war effort is not money toward Russia; *effect:* display; `browser_check.mjs` now expects a too-close-to-call small economy in the neutral grey; *where:* `scaleFor()`, `ONE_SIDED`, `paint()`, `--back`; [overview](#view=how&sec=m-overview-how-the-map-shows-it)
- **Too close to call: a faded colour of the leaning direction, not grey** (owner, after the redesign: "I don't like all the uncertain countries being grey even if they strongly lean"). A number whose likely range or method band crosses zero is painted the colour its value would get (the EUR 5bn clamp included), mixed halfway toward the neutral grey (`d3.interpolateRgb(…, --mid)(0.5)`): a strong lean stays a clear but lighter, greyer blue or orange. No dots and no outline (the round-15 dashed edge is gone). Still not ranked, still "too close to call" in the hover card and the panel, still no stream. The hover card's two bars use the same mix; the panel's big number mixes toward the soft ink so it keeps its contrast. Grey stays for no clear change and for a net below zero that is mainly earning from the war effort. The legend's "More" and the ⓘ add a faded swatch; all six languages — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the lean is information: grey hid that Türkiye leans toward Russia and Brunei toward Ukraine, while "too close to call" and the unranked status still say the sign is not settled; *effect:* display only, no number changed (the map's own model identical for all 231 entries); 61 countries on the default map (net, % of GDP, 2022–Aug 2026) turn from grey to a faded colour; `browser_check.mjs` (check 32) now expects a too-close-to-call small economy in the faded lean colour; *where:* `scaleFor().fadedFor`, `paint()`, `twoBars()`, `firstLayer()`, `.total .n.fpos/.fneg`, `renderLegend()`, `renderInfo()`, `meaningNotes()`
- **The Filters drawer in seven sections** (owner: it "can look better"): the map shows and the measure as full-width segmented controls; find a country; what's counted (folded, on/off switches grouped by side, the official/custom status under the heading); where and when; map layers (switches, markers grouped, zoom); rankings and top lists (the pages as a 3×2 grid, Top lists, the top ten and bottom five folded); display (light or dark, language). One heading style, one spacing, one left edge; a sticky header with the close button; a bottom sheet with a grab handle on phones instead of a full-screen page — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* theme and language sat beside the search at the top, the four views wrapped onto two ragged rows, the 17 switches and the top-15 list were always open and pushed the map layers to the bottom; a reader looking for one control had to scan everything; *effect:* display only; every control, id and default unchanged; *where:* `#drawer`, `.dblock`, `.seg-grid`, `.dfold`, `renderDrawer()`
- **The country panel, each number once** (owner: it "has all the information (some duplicated)"): header (name, a one-sentence lead in words, the net with €, likely range, certainty and average year); the two parts side by side, each with value, €, bar, words, likely range, grade and average year, and Russian money frozen on its own line; at most four notes on what changes the meaning; the five biggest parts and "Show the other N parts"; then folded sections: cost (with money flowing back), method band and alternatives (with the method notes, coverage, "How this is calculated"), markers, sanctions or own choice, per year, aid, companies and people, share and compare, sources. Removed as duplicates: the lead's numbers (the net, both parts, per year, frozen), the "Show more" repeat of the net line, both parts' cards, the net's likely range and the average year, the waterfall (the same parts; it stays in How it works, linked), the sanctions split and the critical goods in the notes (each now in its own section), the earner note in the parts, the top five repeated in "all parts", and the subtotals in its group headings; the map value shows only when it is a different number (per person or total €) — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* in the audit of DEU, HUN, LTU, USA, CHN, PRK and BEL the net appeared 4 times, its euro value 4, the average year 3, each part 3 to 6, Russian money frozen 4 to 7 and each top part twice; *effect:* display only, no number changed; nothing deleted that is not shown elsewhere in the panel or the How it works view; *where:* `leadLine()`, `twoParts()`, `meaningNotes()`, `firstLayer()`, `countryPanel()`, `fold()`
- **"Kept from Russia"** replaces "Change in payments to Russia" everywhere: site, views, panel, rankings, lists, table, CSV and JSON (`kept_from_russia_*`, `kept_from_russia`), share text, share cards, OG text, docs and all six languages. Positive = kept from Russia (paid Russia less than without the war) = blue; negative = paid it more = orange. In sentences the sign is in words: "paid Russia €65.8bn (1.6% of GDP) less than without the war". The net = support for Ukraine + kept from Russia + Russian money frozen — *data or judgement:* judgement (wording); *raised by:* owner; *why:* next to "+1.6%" the old name read as "paid Russia more"; *effect:* wording; `lens=kept` opens the view (the address keeps `lens=payments`); the CSV gains a `figures` column; *where:* `keptWords()`, `supportWords()`, `shareText()`, `views.js`, `share_cards.mjs`, `i18n/`
- **Money streams = the map's numbers**: blue streams to Kyiv sized by support for Ukraine in €, orange streams to Moscow sized by how much more the country paid Russia than without the war in € (minus kept from Russia), from `calc()`, never gross trade; a direction that is too close to call has no stream. The 12 largest each way by default; hovering or picking a country shows its own, a highlight shows those of its countries; slow moving dashes, static arrows under `prefers-reduced-motion`; off by default on phones, switched in Filters. The old gross flow lines stay as an option, "Gross trade flows", off by default — *data or judgement:* judgement (presentation); *raised by:* owner (option B); *why:* the streams make the euro scale visible and tell the same story as the map; *effect:* display; *where:* `streamLists()`, `drawStreams()`, `STREAMS_DEFAULT`
- **What's counted** (concept 2's switches): 16 switches (the old "Subtract money flowing back" is one of them) with world totals; the map, rankings, panels and every number recompute through `calc()`, which drops the parts in `OFF` in `live()`; the caches of the world total, the method band and the grades are keyed by `OFF`. Whenever one is off, a yellow "Custom mix, not the official figures: … switched off" note with "Reset to the official numbers" shows under the title, in the drawer, the panel and the tooltip; sharing is disabled for a custom mix (the link and its card carry the official figures) and downloads say which parts were off — *data or judgement:* judgement; *raised by:* owner (concept 2); *why:* readers asked what a number would be without a part; the note keeps a custom mix from passing as the official figure; *effect:* none with every switch on (the default); limits: bilateral loans sit in government aid at their gift value, the markers and the cost view's energy parts are not switchable; *where:* `OFF`, `offKey()`, `COUNTED`, `customNote()`, `figuresEn()` in `views.js`
- **Highlights**: v2's chips (Russia sold elsewhere, Armed Russia, Baltic cuts, Hungary's 2022 price spike, top support relative to GDP, gas Russia cut off itself, what Russia took from companies), worked out from the data when shown; picking one highlights its countries, dims the rest and shows a small closable fact card with its caveat. The Baltic chip says Lithuania's cut was mostly its own choice (77%; sanctions required 23%), as round 16 found — *data or judgement:* data (the figures) and judgement (the choice of stories); *raised by:* owner (v2); *why:* the stories that used to need reading are one click from the map; *effect:* display; `#hl=baltic` links to one; *where:* `HL`, `renderFact()`, `setHighlight()`
- **The country panel**: side panel on desktop, bottom sheet on phones; a one-sentence headline, the total with its range and certainty in words, the two parts as bars in words, "What changes the meaning here" (with the orange caveat for orange countries), the five biggest parts and "Show all parts". **Every part opens in place**: how it is calculated (two or three plain sentences), why it is done this way (one line, with links to its section in this page and the decision log), this country's sources with their exact tables, and links to the method page, the full trace and all sources for the flow. Everything the panel showed before (map value, share, compare, method band, grades, markers, cost, money flowing back, per year, coverage, sources) is behind "Show more" — *data or judgement:* judgement; *raised by:* owner (v2); *why:* the method was a link away; now it sits on the number it explains; *effect:* display; *where:* `firstLayer()`, `methodCard()`, `HOW`, `WHY`, `countryPanel()`
- **The Sources view opens with the method in four lines** and how decisions are made, and each money flow adds how it is calculated and why — *data or judgement:* judgement; *raised by:* owner (v2); *why:* the method page of v2; *effect:* display; `#view=sources&flow=…` unchanged; *where:* `renderSources()`, `flowHtml()`
- **Map markers off by default** (critical goods, wages from Russia, taken by Russia), switched on in Filters; still in every panel — *data or judgement:* judgement; *raised by:* owner ("only the map" on load); *why:* they crowded the first view; *effect:* display; *where:* `state.chpl`, `state.remit`, `state.taken`
- **Not ported**: the bivariate map and its 3×3 legend (replaced by the one colour rule), concept 2's ledger workbench layout, v2's separate Rankings page (the Ranking view and the drawer's top ten do this), option C's two maps, the prototypes' proposed "poorer importer" rule for economies under EUR 1,000bn (not approved; the site keeps its round-14 fairness note) and the full list of every decision row per flow (each part links to its decisions section and log instead) — *data or judgement:* judgement; *raised by:* owner; *why:* see changelog; *effect:* none

</details>

<h2 id="cl-r16b">Round 16b: fixes after check 16 <span class="cl-date">20 October</span></h2>
<!-- flows: ref flowback laund services frozen gold -->

**Fixes from an independent check: small flows, refugee spending and the band cache.**

### What changed

Check 16 (economist and data journalist, 20 October 2026), approved by the owner. Movers
are % of a year's GDP, 2022 to August 2026, round 16 → round 16b.

1. **Small-flow baseline** (B1, N1): the median of 2019, 2020 and 2021 at 2019–2021 prices, computed from the yearly
   series (`small_flow_base()`, `to_rus.base_years`), instead of a field that for 28 flows held 2021 at 2021 prices.
   Exceptions keep 2021: Brunei (Hengyi refinery from November 2019) and New Zealand (Marsden Point closed March 2022)
   in `SMALL_FLOW_EXCLUDE`; Syria (mirror-only, confidential pre-war data) in `SMALL_FLOW_MIRROR`, labelled in the
   panel; Mauritania and Botswana (single researched values); Lebanon keeps its researched level. 140 flows use the
   median. New check 36. Payments: Brunei +5.04 → +2.35 (direction uncertain), Marshall Islands +3.01 → +0.59,
   Syria −1.87 → −0.92, Curaçao +0.84 → −0.02, Gibraltar +0.70 → −0.08, Faroe Islands +0.31 → −0.22, Malta +0.79 →
   +0.28, New Zealand +0.27 → +0.02, Slovenia −0.01 → −0.19, Cameroon +0.36 → +0.19, Israel +0.13 → −0.03, Latvia
   +3.22 → +3.07, Yemen −4.86 → −4.72, Togo −0.78 → −0.63, Afghanistan −0.96 → −0.82, Libya −6.79 → −6.93, Senegal
   −2.26 → −2.39, Tajikistan −0.76 → −0.87. 60 economies moved by 0.02 points or more on a headline number, all
   through this step except Ireland's support (step 5).
2. **Colours of small economies** (B2): the lightest colour of their direction (`colors[3]` or `colors[5]`), no
   longer the neutral colour for negatives (check 16 counted 22 on the net map and 23 on payments: Tuvalu, Palau,
   Bhutan, Djibouti...). The browser check asserts it for those four.
3. **Site text** (N2, N10): the panel's "Pre-war level" and How it works describe the small-flow rule; the net map's
   legend title names Russian money frozen. All six languages.
4. **Share text and cards** (N3): "about 0" where both ends of a range round to zero. Cards regenerated.
5. **Refugee spending flowing back** (N4): retail (G47), accommodation and food (I) and rent without imputed rent
   (L less L68A), from OECD STAN; Poland's factor 8.2% → 7.3% (support +1.28 → +1.29), Germany 1.7% → 2.2%, the
   Netherlands 3.7% → 3.0%; 2.7% overall.
6. **Gold at its actual price** (N5) in the method band; the gold docs no longer claim the war caused no measurable
   share of the gold price rise.
7. **Poland's pipeline crude cut off by Russia** (N6; label): 38% required, 50% cut off by Russia, 12% own choice
   (was 38%, 18%, 43%); the "without what Russia cut off itself" band takes the crude out too (Poland's payments
   band 2.14 → 1.56 at the low end). Finland's last cargo (20 July 2022) confirmed on Neste's page.
8. **`detail.json` failure** (N7): the page draws without the rebuilt alternatives and says so, instead of failing.

### Decisions

A pre-release check of round 16 found that Brunei's rise came from a mislabelled field (B1) and that the new colour
clamp painted negative micro-states as "no change" (B2), with ten smaller points. The **owner approved** the fixes.

- **Small-flow baseline: the median of 2019–2021 at pre-war prices, from the yearly series**; refinery openings and closures (Brunei, New Zealand) and mirror-only data (Syria) keep 2021 (B1, N1) — *raised by:* check, owner; *why:* the "average" was 2021 at 2021 prices for 28 flows; one-off years decided the mean; *effect:* Brunei +5.04 → +2.35, Malta +0.79 → +0.28 (payments)
- **Lightest colour of each direction for small economies** (B2) — *raised by:* check, owner; *why:* negatives fell into the neutral colour; *effect:* display
- **Site text, share text and the net map's legend** (N2, N3, N10) — *raised by:* check, owner; *why:* the text said 2021 for every flow; "−<0.01% to +<0.01%"; frozen money unnamed; *effect:* wording
- **Refugee spending through retail, accommodation and food, and rent** (N4) — *raised by:* check, owner; *why:* finance and ICT were in the services group; *effect:* Poland's factor 8.2% → 7.3%
- **"Gold at its actual price" in the method band** (N5) — *raised by:* check, owner; *why:* part of the gold price rise may be the war's; *effect:* bands
- **Poland's pipeline crude "cut off by Russia"** (N6) — *raised by:* check, owner; *why:* Russia halted Druzhba; *effect:* label
- **The page works without `detail.json`** (N7) — *raised by:* check, owner; *why:* a failed file blocked the page; *effect:* display
- **Ranges and the warning in shared text and on the cards** (M5) — *raised by:* review, owner; *why:* shared figures dropped the uncertainty; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 16b: fixes after check 16

A pre-release check of round 16 (an economist and a data journalist, 20 October 2026) found two blocking errors (B1,
B2) and ten smaller points; the **owner approved** the fixes below. Each row says what is data and what is judgement.

- **Small-flow baseline = the median of 2019, 2020 and 2021 at 2019–2021 prices** (B1, N1), computed from the yearly series; not the mean, so one one-off year cannot set it — *data or judgement:* judgement (median; the threshold) on data (yearly customs values, price levels); *why:* round 16 took the "average" from a field that held 2021 at 2021 prices for 28 flows (Brunei ×1.35 by its oil price alone); the mean let Malta's 2019 fuel entry and Israel's 2019 crude decide; *effect:* 140 flows; Brunei +5.04 → +2.35 (direction uncertain); Malta +0.79 → +0.28; Syria −1.87 → −0.92; New Zealand +0.27 → +0.02; Israel +0.13 → −0.03; Cameroon +0.36 → +0.19 (payments); *where:* `small_flow_base()`, `to_rus.base_years`; check 36; [counterfactual](#view=how&sec=m-counterfactual-small-flows-start-from-the-2019-to-2021-median)
- **Exceptions keep 2021**: refinery openings and closures (Brunei: Hengyi began operations in November 2019; New Zealand: Marsden Point stopped refining on 31 March 2022, closure voted in August 2021); mirror-only pre-war data (Syria: Russia's reports, 100% confidential HS 99 in 2020–2021), labelled in the panel; single researched values (Mauritania, Botswana) — *data or judgement:* data (company and government statements, Comtrade) and judgement (which breaks count); *why:* 2019–2020 do not describe these countries' pre-war trade; *effect:* Brunei, New Zealand, Syria as listed; Lebanon keeps its researched level as in round 16; *where:* `SMALL_FLOW_EXCLUDE`, `SMALL_FLOW_MIRROR`, `to_rus.small_flow_kept_2021`, `baseNote()`
- **Small economies take the lightest colour of their direction** (B2): `colors[3]` (lightest orange, or gold in the support view) or `colors[5]` (lightest blue), not `f(±0.25)`, which put negatives in the neutral bucket — *data or judgement:* display; *why:* 22 economies on the net map and 23 on payments looked like "no change" (Tuvalu −2.94%); *effect:* display; *where:* `scaleFor().colorFor`; `browser_check.mjs` (Tuvalu, Palau, Bhutan, Djibouti on the net and payments maps)
- **Site text names the small-flow rule** (N2): the panel's "Pre-war level" and How it works, in all six languages — *data or judgement:* wording; *why:* the text said 2021 for everything; *effect:* display; *where:* `index.html`, `views2.js`, `i18n/`
- **"About 0" instead of a range of −<0.01% to +<0.01%** in the share text and cards (N3) — *data or judgement:* wording; *why:* the range said nothing; *effect:* display; *where:* `shareText()`, `share_cards.mjs`
- **Refugee spending flows back through retail, accommodation and food, and rent** (N4): the mean net gain of STAN G47 (G where missing), I and L less L68A (imputed rent; left out where STAN has no split) — *data or judgement:* data (OECD STAN 2025) and judgement (equal weights); *why:* the broad services group holds finance and ICT, where refugees spend little; *effect:* Poland's factor 8.2% → 7.3% of hosting cost; Germany 1.7% → 2.2%; Netherlands 3.7% → 3.0%; overall 2.7% (unchanged); Poland support +1.28 → +1.29; *where:* `refugee_flowback()`; `net_gain_sellers.json` group `refugee_spending`
- **"Gold at its actual price" in the method band** (N5); the docs no longer say no measurable share of the gold price rise was the war's — *data or judgement:* judgement; *why:* central banks' gold buying after Russia's reserves were frozen is widely linked to the war; *effect:* bands only (gold buyers: Hong Kong, the UAE, Thailand...); *where:* `gold_actual` in `METHOD_ALTERNATIVES`, `deflate_gold()`; [prices](#view=how&sec=m-prices-gold-at-its-no-war-price)
- **Poland's pipeline crude is "cut off by Russia"** (N6), like the gas Gazprom cut off, not own choice; Finland's 20 July 2022 last cargo confirmed on Neste's page — *data or judgement:* data (Orlen statement, monthly customs data); *why:* Transneft halted Druzhba to Poland on 25 February 2023; *effect:* label: Poland 38% required, 50% cut off by Russia, 12% own choice (was 38%, 18%, 43%); the "without what Russia cut off itself" alternative takes the crude out too (Poland's payments band low end 2.14 → 1.56); *where:* `apply_stop_dates()`, `stop_dates_r16.json` `moved_stopped_by_russia`, `sanctions.to_rus.oil_cut_from`
- **The page works if `detail.json` fails** (N7): it draws without the rebuilt alternatives and says so in the banner and the panel; when it loads, it still loads before anything is drawn — *data or judgement:* display; *why:* round 16 showed only a load error; *effect:* display; *where:* `DETAIL_FAILED` in `index.html`
- **The net map's legend title names Russian money frozen** (N10): "Net: support plus the change in payments and Russian money frozen", in all six languages (the map title box was left as it was: a longer title overlapped the legend on desktop) — *data or judgement:* wording; *why:* the net includes it; *effect:* display; *where:* `index.html`, `i18n/`

</details>

<h2 id="cl-r16">Round 16: review 5 <span class="cl-date">20 October</span></h2>
<!-- flows: aid loans euaid ref flowback paid windfall services frozen mil gold -->

**An independent review: browser and Node agree, the docs quote the map's numbers, and several values corrected.**

### What changed

Review 5 (economist and data journalist), approved by the owner; the owner kept the net as the default view and
ranking.
Steps, in the order applied, with the main movers (% of a year's GDP, 2022 to August 2026):

1. **Bands, rankings and grades in the browser** (C2): `detail.json` (the method band's alternatives) loads with the
   data, before anything is drawn; caches fill only after it. New real-browser check `pipeline/browser_check.mjs`
   (check 32): the page's bands, "direction uncertain" flags, grades, Ranking view and map dots must match the Node
   model. On the round-15 code it finds 115 mismatches (Nepal's payments band −1.67 to −1.55 instead of −1.84 to
   +0.05; net ranked 61 countries instead of 59, payments 56 instead of 53). No number changed.
2. **Refugee scope factor in 2022 only** (H1): Poland support +1.95 → +1.34, net +5.06 → +4.44; Germany +1.70 →
   +1.58, net +3.35 → +3.23.
3. **The pre-round-13 valuation rule leaves the method band** (H5): support "direction uncertain" 100 → 95
   (Bulgaria, Czechia, India, Kuwait, Nigeria ranked again). No central value moved.
4. **Redirected trade on both sides** (H6): the alternative scales "less paid" by 0.70 and "more paid" by 0.50, so
   the world total stays the world's net change. Bands only.
5. **Wording**: the world totals are Russia's net gain ("from buyers who cut −€355bn; from buyers who bought more
   +€215bn"), not payments.
6. **EU-level aid text** (L1): the European Peace Facility is not in it, and why; the text shows the bar's figure
   (Lithuania €211m, not €294m) with the face value beside it.
7. **Grades and metadata** (L4, L2): adjusted aid graded by its adjusted share (Estonia, Latvia support B → C);
   status lines on four superseded research files.
8. **Colour scale** (L3): economies under EUR 5bn GDP are clamped to the lightest step of their direction.
9. (The net stays the default and ranked: the owner's decision.)
10. **"Russia's gain from this country rose"**, with each entry's main cause; arms suppliers on "Armed Russia" only.
11. **Russian money frozen on its own line**, in the net only (H4): Belgium payments +1.86 → +0.62 (net unchanged
    +2.81), France +0.86 → +0.68, Luxembourg +0.77 → +0.61; payments for Belgium, Italy and Spain become direction
    uncertain.
12. **One common cost per refugee** in the method band (H2). Bands only.
13. **Refugee spending flowing back** (M3): 2.7% of hosting cost; Poland support −0.06, Netherlands −0.04, Montenegro
    −0.05, Ireland −0.02.
14. **Small flows from the 2019–2021 average** (M2; 148 flows under EUR 1bn a year; corrected in round 16b below):
    Cameroon +0.80 → +0.36 (direction uncertain), Brunei +2.35 → +5.04 (an artefact: the "average" was 2021 at 2021
    prices for 28 flows, check 16 B1), Syria −0.92 → −1.87, Burkina Faso −3.55 → −2.79, Afghanistan −1.53 → −0.96,
    Malta +0.28 → +0.79, Senegal −1.82 → −2.26, Bosnia +0.55 → +0.16, Tajikistan −0.38 → −0.76, Latvia +3.54 → +3.22,
    Libya −6.54 → −6.79, Yemen −5.13 → −4.86 (payments); 70 economies of at least EUR 5bn moved by 0.02 points or more.
15. **Hong Kong's gold** (M1, M6): Hong Kong −4.30 → −1.59 (direction uncertain), Thailand +0.42 → +0.10, UAE
    −0.72 → −0.84, Singapore −0.29 → −0.36, United Kingdom +0.88 → +0.83 (payments).
16. **"Required by sanctions" from actual stop dates** (M4; label only): Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%), Finland 71% → 27%,
    Poland 76% → 38%, Germany 49% → 30%.
17. **Share text and cards** (M5): ranges and "in total since 2022" in the share text and OG descriptions; the
    card's range and warning in large dark type. Cards regenerated.

All six translations updated. Combined, round 15 → round 16 (support for Ukraine; change in payments to Russia;
net): Poland +1.95 → +1.28; +3.11 → +3.03; +5.06 → +4.39, Germany +1.70 → +1.57; +1.65 → +1.57; +3.35 → +3.22,
Belgium +0.94; +1.86 → +0.62; +2.81, Lithuania +1.84; +9.96 → +9.89; +11.80, Hong Kong −4.27 → −1.59 (both),
Cameroon +0.80 → +0.36, Latvia net +5.19 → +4.87. Among economies of at least EUR 5bn: 103 moved by 0.02 points or
more; direction uncertain on support 96, on payments 123 and on the net 114 (round 15: 100, 110, 104).

### Decisions

A fifth independent review (economist and data journalist) raised the points below; the **owner approved** each and
**kept the net as the default view and ranking** (the review asked to stop ranking it). Two points were the owner's
own additions to the brief: the "Russia's net gain" wording and refugee spending flowing back.


- **The method band's alternatives load before anything is drawn**, and a real-browser check compares the page with the Node model (C2) — *raised by:* review, owner; *why:* the page ranked countries its own rule leaves out; *effect:* the browser shows what the checks report
- **Poland's refugee scope factor in 2022 only**; Germany's later years at the reported federal figure (H1) — *raised by:* review, owner; *why:* a 2022 projection applied to every year; *effect:* Poland support +1.95 → +1.28 (with step 13)
- **The superseded valuation rule leaves the method band** (H5) — *raised by:* review, owner; *why:* it is no longer a reasonable alternative; *effect:* Bulgaria, Czechia, India, Kuwait, Nigeria ranked on support
- **Redirected trade on both sides**, half against each (H6) — *raised by:* review, owner; *why:* the world total of the alternative had the wrong sign; *effect:* bands
- **"Russia's net gain"**, not "paid", for the world totals — *raised by:* owner (from review H3); *why:* they are net gains; *effect:* wording
- **EU-level aid text**: the EPF not in it, and why; text and bar the same figure (L1) — *raised by:* review, owner; *why:* the text contradicted Kiel and the bar; *effect:* wording
- **Adjusted aid graded by its adjusted share**; stale metadata marked (L4, L2) — *raised by:* review, owner; *why:* modelled adjustments were graded A; *effect:* Estonia, Latvia support B → C
- **Colour scale set by economies of at least EUR 5bn** (L3) — *raised by:* review, owner; *why:* micro-states looked darker than India; *effect:* display
- **The net stays the default and ranked** — *raised by:* owner; *why:* simplicity, with the warning line; *effect:* none
- **"Russia's gain from this country rose"** with each entry's cause; arms suppliers on "Armed Russia" only (H3) — *raised by:* review, owner; *why:* North Korea headed a list of payments; *effect:* display
- **Russian money frozen on its own line**, in the net only (H4) — *raised by:* review, owner; *why:* it is not a payment; *effect:* Belgium payments +1.86 → +0.62
- **One common cost per refugee** in the method band (H2) — *raised by:* review, owner (actual cost kept on the map); *why:* the same refugee was worth 0 to 20,000 euros; *effect:* bands
- **Refugee spending flows back** at the host's real gain (M3) — *raised by:* owner (from review M3); *why:* weapons bought at home were netted, refugee spending was not; *effect:* 2.7% of hosting cost
- **Small flows from the 2019–2021 average** (M2; the median since round 16b) — *raised by:* review, owner; *why:* single-year noise in small flows; *effect:* Cameroon +0.80 → +0.36
- **Hong Kong keeps only the gold that stays there; gold volume at the no-war gold price** (M1, M6) — *raised by:* review, owner; *why:* gold passed on and the gold price were charged to Hong Kong; *effect:* Hong Kong −4.27 → −1.59
- **"Required by sanctions" from each country's actual stop date** (M4) — *raised by:* review, owner; *why:* Lithuania stopped Russian crude before the ban; *effect:* Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%) required (label)

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 16: review 5

A fifth independent review ("review 5", economist and data journalist) raised C1, C2, H1–H6, M1–M6 and L1–L4. **The
owner approved the changes below** (items 1–8 and 10–17 of the round-16 brief); **every row is "raised by review 5,
approved by owner"** unless it says otherwise. The owner **kept the net as the default view and ranking**, with its
warning line (review C1 asked to stop ranking it; the owner prefers simplicity).

- **Nothing is worked out before the method band's alternatives load** (C2): `detail.json` loads with `data.json`, before the first render; the caches of bands and grades fill only once the alternatives are in (`ALTS_READY`) and are emptied by `resetModelCaches()`. A real-browser check compares the page with the Node model — *data or judgement:* test (a bug fix); *why:* the page drew the map and cached bands and grades before `detail.json` arrived and never cleared them, so it ranked countries the documented rule leaves out (Nepal, Mauritius on the net; Australia, Mauritius, Nigeria, Nepal on payments); *effect:* the browser now shows what `check_data.py` reports; on the old code the new check finds 115 mismatches; *where:* `index.html` load; [`pipeline/browser_check.mjs`](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/browser_check.mjs); check 32
- **Poland's refugee scope factor in 2022 only** (H1): the 2022 gap between broad estimates and reported spending scales 2022; later years keep the reported figure. Germany had the same gap built into its central values in every year, so from 2023 its central is the reported federal figure — *data or judgement:* data (the ratio is a 2022 projection) and judgement (later years); *why:* a 2022 OECD projection says nothing about 2023–2026; Poland ended most free accommodation in 2023; *effect:* Poland's hosting EUR 9.6bn → 4.9bn, support +1.95% → +1.34%; Germany 25.1bn → 19.7bn, +1.70% → +1.58%; *where:* `REFUGEE_SCOPE_YEARS`, `SCOPE_IN_CENTRAL`; [refugees](#view=how&sec=m-aid-refugees-military-refugees)
- **The superseded valuation rule leaves the method band** (H5): the pre-round-13 rule (value kept × extra, paid weapons in full) is no longer an alternative and no longer decides who is ranked; `vk_old` and the shipping and agents copies are no longer written — *data or judgement:* judgement; *why:* the project replaced it in round 13; it is not a reasonable other choice; *effect:* support "direction uncertain" 100 → 95: Bulgaria, Czechia, India, Kuwait and Nigeria are ranked again; *where:* `METHOD_ALTS`, `calc()`; [ranges](#view=how&sec=m-ranges-the-method-band)
- **Redirected trade on both sides** (H6): what buyers who bought more took up is Russian supply redirected from buyers who cut (at most the smaller of the two totals); it is counted once, half against each side: cutters' credits × (less − r/2)/less, extra buyers' debits × (more − r/2)/more, so the two still add up to the world's net change — *data or judgement:* judgement (the half split); *why:* round 15 scaled only the cutters, to the world net, so the alternative's world total had the wrong sign (−94.7bn against +132.1bn); *effect:* factors 0.70 and 0.50; Lithuania's payments under the alternative 4.2% → 7.1%; India −2.21% → −0.94%; *where:* `worldPaid()`, `calc(opt.attrib)`
- **"Russia's net gain", not "paid"** (owner, H3): the world totals and similar labels say what they are: "Russia's net gain on goods and fuel … from buyers who cut −€355bn; from buyers who bought more +€215bn" — *data or judgement:* wording; *why:* the totals are Russia's net gain (about half the gross payments), not payments; *effect:* display; *where:* `worldGainText()`; the payments map's legend
- **EU-level aid text** (L1): the European Peace Facility is not in it (Kiel left it out from version 16): it pays members back for weapons they gave themselves, already in their own aid, so adding it would count them twice. The text now gives the same figure as the bar (loans at their gift to Ukraine) and the face value beside it — *data or judgement:* data (Kiel) and wording; *why:* the text said the EPF was included and paid from the EU budget; Lithuania's text said €294m (face value) and the bar +€211m (grant value); *effect:* display; every member's text and bar agree; *where:* `countryPanel()`; [EU-level aid](#view=how&sec=m-aid-refugees-military-eu-level-aid); the EPF's GNI-key burden shift in [limitations](#view=how&sec=limitations)
- **Adjusted aid graded by how much is adjusted** (L4): A only where the modelled adjustments (weapons at market value, loans as gifts) are under 5% of it, B under 25%, else C — *data or judgement:* judgement (thresholds); *why:* Kiel's figure is reported (A), the adjustments are modelled; *effect:* support letters (GDP ≥ EUR 5bn): Estonia and Latvia B → C; 4 A, 15 B, 16 C, 128 D; *where:* `aidCert` in `calc()`
- **Stale metadata** (L2): the round-14 net-gain copies (9% normal return), the round-13 sellers' copy and the round-11 gain assumptions say they are superseded and where the current values are — *data or judgement:* data documentation; *why:* the copy said 9% while the docs say 11.4%; *effect:* none; *where:* `status` in four research files
- **Colour scale set by economies of at least EUR 5bn** (L3): smaller economies are coloured within that scale, clamped to the lightest step of their direction; the legend says so — *data or judgement:* judgement (the EUR 5bn threshold, as in the rankings); *why:* Tuvalu and Palau looked as dark as or darker than India for a few million euros; *effect:* display; *where:* `scaleFor().colorFor`
- **The net stays the default and ranked** (owner decision) — *data or judgement:* judgement; *why:* simplicity; the warning line stays on the map, panel, rankings, cards and share text; *effect:* none
- **"Russia's gain from this country rose"** replaces "Paid Russia more than before the war" (H3); each entry names its main cause ("mostly the 2022 price spike on gas contracts", "mostly gold"); a country whose number is more than half weapons or troops sent to Russia is on "Armed Russia" only (North Korea, Belarus, Iran), with a note. North Macedonia appeared because of the 2022 gas price windfall on its Russian gas (EUR 0.35bn of 0.36bn); it bought less from Russia. It is now named that way and, with the 2019–2021 baseline, its direction is uncertain — *data or judgement:* data (main parts, the gas share of the windfall from the pre-war fuel mix and 2022 price excess) and judgement (the 50% rule); *why:* the old title put North Korea, which armed Russia, first, and named price effects as purchases; *effect:* display; *where:* `gainRoseList()`, `gainCause()`, `armedMostly()`; `windfall.gas_share`, `to_rus.gold_share`
- **Russian money frozen on its own line** (H4): the return Russia lost on its frozen reserves leaves the change in payments to Russia (its map, ranking and world total) and is added to the net only; shown in the panel, table, CSV, JSON and trace — *data or judgement:* judgement (presentation); *why:* it is not a payment; it was half of the world's "change in payments" story and two-thirds of Belgium's; *effect:* Belgium payments +1.86% → +0.62% (net unchanged at +2.81%; frozen +1.24%); payments direction uncertain for Belgium, Italy and Spain; *where:* `OWN_LINE`, `frozenLine()`; [frozen reserves](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves)
- **One common cost per refugee in the method band** (H2): the map keeps each host's actual net cost (owner's choice); the band adds every host at the hosts' average net cost per person-year (EUR 5,780 in 2022 to 806 in 2026) — *data or judgement:* data (person-years, net costs) and judgement (the average); *why:* the same refugee was worth EUR 0 to 20,000 a year depending on the host's welfare system; *effect:* Netherlands support under the alternative +1.33% (map +2.11%); Czechia +1.81% (map +0.38%); no ranking change; *where:* `refugee_common_cost()`, `calc(opt.refCommon)`
- **Refugee spending flows back** (owner, M3): the host's real gain on hosting money spent at home (services' net gain × genuinely extra, the flowback rule) is subtracted — *data or judgement:* data (OECD STAN, value_kept.json) and judgement (services as the proxy for rent); *why:* weapons bought at home were netted, refugee spending was not; *effect:* 2.7% of the hosting cost overall; Poland support −0.06 points, Netherlands −0.04; *where:* `refugee_flowback()`, `refsp` in `calc()`; check 35
- **Small flows start from the 2019–2021 average** (M2): purchases from Russia averaging under EUR 1bn a year in 2019–2021 (the back-tests' small and medium size classes) start their no-war path from that average; 2021 alone stays in the range. **Corrected in round 16b** (below): the median at pre-war prices, with listed exceptions — *data or judgement:* judgement (the threshold); *why:* a single year turns noise in small flows into rankings (Cameroon's 2021 was 64% above its average); *effect:* as shipped in round 16: 148 flows; Cameroon +0.80% → +0.36% (direction uncertain); Syria −0.92 → −1.87; Malta +0.35 → +0.79; Latvia +3.54 → +3.22 (payments). Brunei's +2.35 → +5.04 was an artefact: for 28 flows the "average" was a copy of 2021 at 2021 prices (check 16, B1); *where:* `SMALL_FLOW_EUR_BN`, `counterfactual()`; [counterfactual](#view=how&sec=m-counterfactual-small-flows-start-from-the-2019-to-2021-median)
- **Hong Kong keeps only the gold that stays there** (M1); **gold volume at the no-war gold price** (M6): the share it exported to buyers other than mainland China goes to them; China's share is unchanged; gold volume changes are valued at the 2021 gold price held flat — *data or judgement:* data (Comtrade HS 7108) and judgement (halving destinations that ban Russian gold; the flat no-war price); *why:* Hong Kong was charged for gold it passed on and for the gold price rise; *effect:* Hong Kong −4.27% → −1.59% (direction uncertain); Thailand +0.42 → +0.10; UAE −0.72 → −0.84; *where:* `apply_residual()`, `GOLD_NOWAR`; [`hk_gold-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/hk_gold-notes.md); check 33
- **"Required by sanctions" from each country's actual stop date** (M4): a fuel stopped before a ban took effect is the country's own choice in every year (Lithuania's and Finland's crude, Poland's coal and pipeline crude, Germany's pipeline crude) — *data or judgement:* data (company and government statements; see the notes for what was verified); *why:* Lithuania stopped Russian crude in spring 2022, before the EU ban; *effect:* label only: Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%) required, Finland 71% → 27%, Poland 76% → 38%, Germany 49% → 30%; *where:* `apply_stop_dates()`; [`stop_dates_r16-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/stop_dates_r16-notes.md)
- **Share text and cards** (M5): the share text and OG descriptions give each number's likely range and "in total since 2022"; the cards show the range in large dark type and the net's warning in short form at 24px, not 20px grey — *data or judgement:* wording and design; *why:* shared figures dropped the uncertainty and the warning; *effect:* display; *where:* `shareText()`, `share_cards.mjs`

</details>

<h2 id="cl-r15">Round 15: separate maps, named lists and a stricter ranking <span class="cl-date">19 October</span></h2>
<!-- flows: aid ref paid windfall mil -->

**The net first, then its two parts as maps of their own; a country is ranked only when its direction is certain.**

### What changed

Review 4 (economist and data journalist), approved by the owner; two points raised by the owner.

1. **Docs brought up to date** (H4): Poland's reading guide, the limitations table, the overview's units (current
   euros since round 14) and every round-15 figure; headline figures in the docs now carry a tag
   (`<!-- n:POL.ua -->`) and `pipeline/check_docs_numbers.py` (run by `check_data.py`) fails when one differs from
   `data.json`. The text claiming Estonia's and Lithuania's round-14b move came from Ukraine's normal return is
   corrected: it came from Russia's lower gain shares.
2. **Average 2022–2024 GDP** as the denominator (M1; `gdp_avg_r15.json`, World Bank WDI and IMF WEO fetched
   19 October 2026): Nigeria +0.81 → +0.44, Kyrgyzstan −5.68 → −6.75, Yemen −6.11 → −5.13, Norway's support
   +2.96 → +2.71; most European figures rise by 4–12% (Lithuania's net +10.98 → +11.80).
3. **Power of Siberia** (M2): China's no-war path includes the contracted ramp-up; China −0.66 → −0.63.
4. **Ukraine's country risk premium per year** (January 2022–2026 Damodaran tables): below 0.02 points everywhere.
5. **Refugees** (M5 and the owner): one all-government definition (Poland's support +1.11 → +1.95, Germany's
   +1.81 → +1.70); Belarus's hosting moved to a label (support +0.16 → 0); Russia never credited (check 26); the
   unverified Poland and Czechia snippets removed from `kiel.json`.
6. **Three maps** (C1): support for Ukraine is the default; the change in payments to Russia a second map with the
   world total (EUR 358.8bn less paid by buyers who cut, 226.7bn more by others); the net a third with a warning.
   Hash `lens=support|payments|net`; `lens=change` opens the net. Table, CSV and JSON put support first, each number
   with its letter and a direction flag.
7. **Russia panel** (C2): "Paid Russia more than before the war" and "Armed Russia" (full military value).
8. **Words** (H2, L2, L3): the main part named on cards, OG text, share text and panel when it is more than half of
   the number (Hungary: "mostly the 2022 war-time price spike (€9.9bn of €11.6bn; its volumes barely changed)";
   Belgium: the frozen-reserve return; Moldova: gas Russia cut off; Nigeria: structural); every shared figure says
   "in total since 2022 (about X a year)". Share cards regenerated.
9. **Method band, ranking and grades** (H3): six more alternatives, a band for each number, the sign rule for every
   ranking (check 29), the new letters. Hormuz note and "2026 at 2025 prices" (owner, M4).

Combined, round 14b → round 15 (support for Ukraine; net): Denmark +3.40 → +3.49; +4.32 → +4.44, Norway +2.96 →
+2.71; +3.37 → +3.09, the Netherlands +2.02 → +2.15; +4.76 → +5.06, Poland +0.98 → +1.95; +3.74 → +5.06, Germany
+1.75 → +1.70; +3.34 → +3.35, the US +0.34 → +0.35; +0.49 → +0.52, Lithuania +1.71 → +1.84; +10.98 → +11.80,
Estonia +1.99 → +2.07; +9.90 → +10.33; at the other end Hungary −5.33 → −5.77, Libya −6.16 → −6.54, Yemen −6.11 →
−5.13, India −2.08 → −2.21, China −0.66 → −0.63, Nigeria +0.81 → +0.44, Belarus −2.52 → −2.78 (net).

Then, at the owner's request (the net first, then its two parts; decisions):

10. **Four views, the net first**: "Net (the sum)" is the default map, ranking, top lists, share-card headline and
    OG text, always with its warning; then "Support for Ukraine", "Change in payments to Russia" (with the world
    total) and "Cost to the country". The table puts the net first; the CSV and JSON columns are unchanged. Share
    cards and pages regenerated: they lead with the net and still show both parts and the main-part qualifiers.
11. **The gross views "To Ukraine" and "To Russia" removed** (buttons, code paths, colours and rankings): they
    include normal trade and measure something different. The gross flows stay in the panel's small charts, the
    table and downloads and the flow lines. Old links: `lens=ukr` opens support for Ukraine, `lens=rus` the change in
    payments to Russia, `lens=change` the net; an address without `lens` opens the net (check 31).
12. **"Cost carried" renamed "Cost to the country"** on the site, in the panel, How it works and the docs, with one
    line where it is explained: "what it cost the country itself, after gains such as cheaper Russian oil or business
    won back". All six translations updated; strings only the removed views used are gone. No number changed.

### Decisions

A fourth independent review (economist and data journalist) raised every point below except two, which the **owner
raised**; the owner approved each.

- **Support for Ukraine is the default map**; the change in payments to Russia a second map with the world total; the net a third, with a warning (C1) — *raised by:* review, owner; *why:* the net adds two different things and credits each buyer with a market-wide effect; *effect:* display
- **"Paid Russia more than before the war" and "Armed Russia"** replace "Who helps Russia the most" (C2) — *raised by:* review, owner; *why:* poor fuel importers ranked above Iran; *effect:* display
- **Main part named** on cards, OG text, share text and panel (H2); **period and average year** on every shared figure (L3); Nigeria's structural label (L2) — *raised by:* review, owner; *why:* windfall-driven numbers read as behaviour; totals read as yearly rates; *effect:* display
- **Russia never credited for hosting; Belarus's hosting a label** — *raised by:* owner; *why:* the aggressor and a co-belligerent; *effect:* Belarus support +0.16 → 0
- **Six more method-band alternatives**, a band per number, **ranking only where no alternative or range changes the sign**, **new grades** (H3) — *raised by:* review, owner; *why:* the band, the ranking and the letters did not inform; *effect:* 104 economies ≥ EUR 5bn uncertain on the net; net letters 6 B, 51 C, 106 D
- **Average 2022–2024 GDP** (M1); **Power of Siberia** in China's no-war path (M2); **Hormuz** note and "2026 at 2025 prices" (owner; M4); **one refugee definition** (M5); Ukraine's premium per year — *raised by:* review, owner (Hormuz); *why:* denominator, contracted gas, unrelated price shock, comparability; *effect:* Nigeria +0.81 → +0.44; China −0.66 → −0.63; Poland support +1.11 → +1.95
- **Docs figures checked** by `check_docs_numbers.py` (H4) — *raised by:* review, owner; *why:* stale docs; *effect:* none
- **The net first, then its two parts** (replaces support for Ukraine as the default); the gross **To Ukraine** and **To Russia** views removed; **"Cost carried" renamed "Cost to the country"** — *raised by:* owner; *why:* the gross views include normal trade and measure something different; the cost is already net of gains; *effect:* display; old links open the nearest view

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 15: separate maps, named lists and comparable numbers

A fourth independent review ("review 4", economist and data journalist) raised C1, C2, H2–H4, M1, M2, M4, M5, L1–L3;
**the owner approved each** with instructions. Two points were **raised by the owner**: refugees hosted by the
aggressor side (item 4) and the Hormuz crisis in 2026. The review's H1 (links to a stale `main`) does not apply: `main`
and `develop` are identical.

- **Three maps** (C1): support for Ukraine is the default map colour, ranking and share-card headline; the change in payments to Russia is a second map ("Paid Russia less than before the war" / "Paid Russia more than before the war") with the world total in its title (EUR 358.8bn less paid by buyers who cut, 226.7bn more by others); the net is a third, with the warning "adds two different things: aid given and payments to Russia avoided; much of what one country stopped paying, Russia sold to others" — *data or judgement:* judgement (presentation); *raised by:* review, approved by owner; *why:* the net adds aid at full value to payments avoided at Russia's rent, and gives each buyer the full credit for a market-wide effect; *effect:* display; old links with `lens=change` open the net; *where:* `HEAD_LENS`, `OLD_LENS`, `scaleFor()`, `titleNote()` in `index.html`
- **Two named lists** (C2) replace "Who helps Russia the most": "Paid Russia more than before the war" (the payments map's negative end, with the round-14 note that fuel is fungible and the figure reflects purchases, not a policy) and "Armed Russia" (weapons and troops at full value: North Korea 8.8, Iran 3.5, China 1.3, Belarus 1.3 EUR bn) — *data or judgement:* data (military values, round 6) and judgement (the split); *raised by:* review, approved by owner; *why:* the old heading put poor fuel importers above Iran, whose drones count at the seller's gain; *effect:* display; totals unchanged (paid deliveries still at the seller's gain, round 13); *where:* `targetPanel()`
- **Name the main part** (H2) on cards, OG text, share text and panel when one part is more than half of the change in payments to Russia or of the net, in either direction, with its amount; the windfall names its peak year and says when volumes barely changed; gas Russia cut off is named when it is at least 40% of the number — *data or judgement:* judgement (the 50% and 40% thresholds); *raised by:* review, approved by owner; *why:* "more paid to Russia" read as behaviour for countries whose number is mostly war-time prices (Hungary: EUR 9.9bn of 11.6bn); *effect:* display; *where:* `mainPart()`, `driverText()`, `rusWords()`, `netWords()`
- **Cards show the period** (L3): "of a year's GDP in total since 2022 (about X a year)"; the share text and OG descriptions say 2022 to August 2026, about 4.7 years — *data or judgement:* display; *raised by:* review, approved by owner; *why:* Kiel quotes yearly shares of 2021 GDP; a total next to them misleads; *effect:* display; *where:* `shareText()`, `share_cards.mjs`
- **Russia never credited for hosting; Belarus's hosting a label** ("hosted Ukrainian refugees (€0.1bn), not counted as support: co-belligerent") — *data or judgement:* data (ICC warrants 17 March 2023; UN Commission of Inquiry 2026; UNGA ES-11/1) and judgement (co-belligerents out); *raised by:* owner; *why:* Russia is the aggressor and deported children; Belarus's territory was used for the invasion. UNHCR says most refugees in Belarus came through the EU and "an unknown number" via Russia, so the decision rests on Belarus's role, not the route; *effect:* Belarus support +0.16% → 0; *where:* `aggressor_refugees()`, `CO_BELLIGERENT`; check 26
- **Method band** (H3): redirected trade (less paid × the world net-to-gross ratio, 0.37), without the gas Russia cut off, refugees at gross cost, without the windfall, 2026 at 2025 prices, 2024 GDP; a band for each of the three numbers — *data or judgement:* judgement (the alternatives); *raised by:* review, approved by owner; *why:* the band left out the choices that matter most; *effect:* display; *where:* `METHOD_ALTS`, `methodBands()`
- **Ranking rule** (H3): ranked only if neither the likely range nor any method-band alternative changes the sign; otherwise "direction uncertain", dotted on the map and marked in the panel, for all three rankings — *data or judgement:* rule; *raised by:* review, approved by owner; *why:* Nigeria was ranked with a band of 0.00–0.93; *effect:* among economies ≥ EUR 5bn: 100 uncertain on support (almost all near zero), 110 on payments, 104 on the net; *where:* `uncertain()`, `rankList()`; check 29
- **Grades** (H3): each headline number graded by its share on A–B and D parts and by the width of its range and method band against the value (A: ≥75% A–B, ≤5% D, spread ≤0.5; B: ≥50%, ≤15%, ≤1; C: ≤35% D, spread ≤2.5; else D) — *data or judgement:* judgement (thresholds); *raised by:* review, approved by owner; *why:* 202 of 228 totals were C; *effect:* net (GDP ≥ 5bn): before 6 B, 149 C, 7 D; after 6 B, 51 C, 106 D; support 2 A, 19 B, 14 C, 128 D; *where:* `grade()`, `grades()`; [ranges](#view=how&sec=m-ranges-certainty-letters)
- **GDP denominator**: the average of 2022–2024 nominal GDP in euros (World Bank WDI or IMF WEO, as before; each year at its ECB rate), not 2024 alone — *data or judgement:* data; *raised by:* review, approved by owner; *why:* the numerator is 2022–2026 euros; 2024 was a trough for currencies that collapsed; *effect:* Nigeria +0.81 → +0.44, Kyrgyzstan −5.68 → −6.75, Yemen −6.11 → −5.13, Lithuania +10.98 → +11.80 (net); most European values rise 4–12%; *where:* `gdp_average()`, [`gdp_avg_r15.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/gdp_avg_r15.json); check 27
- **China's no-war path** includes the contracted Power of Siberia ramp-up (2014 contract; 15.4, 22.0, 30.0, 38, 38 bcm a year against 10.39 in 2021) — *data or judgement:* data (Gazprom via Interfax, TASS, Reuters), judgement where the contract figure was not found (2022, 2024: not verified); *raised by:* review, approved by owner; *why:* contracted before the war, so not war-driven; *effect:* China −0.66 → −0.63 (payments); *where:* `power_of_siberia()`; [counterfactual](#view=how&sec=m-counterfactual-power-of-siberia); check 28
- **Hormuz crisis in 2026**: the money stays in (it reached Russia; buyers who stopped would have paid those prices); a panel note, the method-band case "2026 at 2025 prices", Germany's 2022–2025 figure in the docs (+2.69% vs +3.35%) — *data or judgement:* data (CREA, IEA via Kuwait Times) and judgement (keep the money); *raised by:* owner (raised); the method-band case also review M4; *why:* the spike was not caused by this war; *effect:* display and method band; *where:* `hormuzNote()`, `p26`; [prices](#view=how&sec=m-prices-2026-and-the-hormuz-crisis)
- **Comparable refugee costs** (M5): one definition, all levels of government minus refugees' taxes; Germany (federal) and Poland (Aid Fund) scaled by the 2022 gap to broad estimates (OECD IMO 2022 via the press, Kiel, Poland's Council), central = reported × √(median ratio); the unverified Poland and Czechia snippets in `kiel.json` removed — *data or judgement:* data (the reported figures and broad estimates) and judgement (the geometric mean); *raised by:* review, approved by owner; *why:* Germany's figure was scaled to all levels, Poland's was not; *effect:* Poland support +1.11 → +1.95, Germany +1.81 → +1.70; *where:* `REFUGEE_SCOPE`, `apply_refugees_net()`
- **Nigeria's structural label** on its card and share text (L2) — *data or judgement:* display; *raised by:* review, approved by owner; *why:* in the data, not on the card; *effect:* display; *where:* `driverText()`
- **Ukraine's country risk premium per year**: each January's Damodaran value (6.43%, 17.26%, 17.55%, 16.01%, 15.54% for 2022–2026; 2021 takes January 2022) — *data or judgement:* data (Damodaran archives); *raised by:* review, approved by owner; *why:* the January 2026 premium was applied to every year; *effect:* below 0.02 points everywhere (Slovakia +0.01); *where:* `net_gain_ukraine.json` `normal_return_r15`
- **Docs checked against the data**: headline figures in the docs carry a tag and `check_docs_numbers.py` (run by check 30) flags any that differ from `data.json` — *data or judgement:* test; *raised by:* review (H4), approved by owner; *why:* the docs had drifted after round 14b; *effect:* none; *where:* `pipeline/check_docs_numbers.py`, `pipeline/site_numbers.mjs`

#### Round 15: the net first, then its two parts

After review 4, the owner changed the order of the views. Owner: **start with the net, then its two parts; removed the
gross To Ukraine/To Russia views because they include normal trade and measure something different; renamed Cost carried
to Cost to the country.** No number changed.

- **The net first** (replaces the default in "Three maps" above): four views in this order, "Net (the sum)" (the default map colour, ranking, top lists, share-card headline and OG text, always with its warning), "Support for Ukraine", "Change in payments to Russia" (with the world total) and "Cost to the country"; share cards lead with the net and still show both parts and the main-part qualifiers — *data or judgement:* judgement (presentation); *raised by:* owner; *why:* the net is the map's question; the warning and the two parts keep it from being read as aid alone; *effect:* display; an address without `lens` opens the net; *where:* `state`, `LENS_RANK`, `OLD_LENS` in `index.html`; `share_cards.mjs`; check 31
- **Gross views removed**: "To Ukraine" (aid + refugees + purchases from Ukraine) and "To Russia" (payments, laundered oil, taxes, weapons, services, hidden channels) — *data or judgement:* judgement; *raised by:* owner; *why:* gross totals include trade that existed before the war, so they measure something different from the change since before the war; *effect:* display; the gross flows stay in the panel's small charts, the table and downloads and the flow lines; old links with `lens=ukr` open support for Ukraine, `lens=rus` the change in payments to Russia; *where:* `OLD_LENS`; [overview](#view=how&sec=m-overview-gross-flows)
- **"Cost carried" renamed "Cost to the country"**, with one line where the view is explained: "what it cost the country itself, after gains such as cheaper Russian oil or business won back" — *data or judgement:* judgement (wording); *raised by:* owner; *why:* the cost is already net of gains; the old name read as a gross burden; *effect:* display; *where:* `titleNote()`, the panel's "How this is calculated", How it works

</details>

<h2 id="cl-r14b">Round 14b: taken by Russia, and one normal return <span class="cl-date">19 October</span></h2>
<!-- flows: paid exits seized -->

**Seizures and forced exits left the totals; Russia's and Ukraine's normal returns recomputed.**

### What changed

**Two owner changes, 19 October 2026** ([decisions](#view=how&sec=cl-why),
decision log). Net % of a year's GDP,
each step alone:

1. **Taken by Russia, not in the totals.** Seizures (round 14, M4) and forced exit costs (round 5: the forced discount
   and the exit fee paid to Russia's budget) leave the net shift and both headline numbers and count in the cost view
   as a sacrifice ("Seized by Russia (companies' assets)"; "Forced sales: discount and exit fee taken by Russia").
   The panel says "Russia took €X from companies of this country (seizures and forced sales); not in the totals,
   counted as a cost carried"; the table, CSV and JSON have a "not in totals" column; the map has a square marker
   (layer "Taken by Russia") where it is at least 0.1% of GDP. New check 25. Net: Finland 7.54 → 8.43, Austria −0.43 →
   +0.29, Ireland 0.93 → 1.47, Denmark 3.88 → 4.40, Norway 3.06 → 3.43, the Netherlands 4.80 → 5.16, Germany 3.23 →
   3.50, France 1.33 → 1.56, the UK 1.27 → 1.50. Cost view: Finland 3.23 → 4.11, Austria 0.71 → 1.43, Ireland 1.22 →
   1.76, Germany 2.46 → 2.73 ([Russia's state and companies](#view=how&sec=m-russia-state-and-companies-taken-by-russia-not-in-the-totals)).
2. **Russia's and Ukraine's normal return.** Both files now subtract 5% real (4–6%) + the country risk premium (Russia
   3.90%, Ukraine 15.54%), on book capital as a nominal USD rate: Russia 11.4% (was 9%), Ukraine 23.0% (was 8.2% after
   tax). Capital per unit of revenue is measured per group (Rosneft, Novatek, PhosAgro, Nornickel, Kernel, Astarta,
   Ferrexpo, Rosstat, Ukrstat, Damodaran's emerging-market industries). Russia's crude gain 2023 0.64 → 0.57, non-fuel
   average 2024 0.118 → 0.103; Ukraine's export average 2024 0.069 → 0.036. Net: Estonia 11.17 → 9.90, Lithuania 12.09
   → 10.98, Moldova 6.98 → 5.99, Libya −7.03 → −6.16, Yemen −6.86 → −6.11, Finland 8.43 → 7.76, Tunisia −4.92 →
   −4.26, Latvia 5.49 → 4.94, Poland 4.11 → 3.74, India −2.38 → −2.08. Estonia's and Lithuania's moves come from Russia's lower gain shares on what they stopped buying from Russia, not from Ukraine's normal return (corrected in round 15) ([net_gain_russia-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_russia-notes.md),
   [net_gain_ukraine-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_ukraine-notes.md)).

Combined, round 14 → round 14b: Lithuania +11.91 → +10.98, Estonia +11.17 → +9.90, Finland +7.54 → +7.76, Moldova
+6.98 → +5.99, Latvia +5.49 → +4.94, Denmark +3.88 → +4.32, Poland +4.08 → +3.74, Germany +3.23 → +3.34, Austria
−0.43 → +0.20, Ireland +0.93 → +1.45, the US +0.48 → +0.49; at the bottom North Korea −10.29 → −10.28, Libya −7.03 →
−6.16, Yemen −6.86 → −6.11, Hungary −5.31 → −5.33, Tunisia −4.92 → −4.26, India −2.38 → −2.08. Ireland enters the
top 20, Portugal leaves it. Totals' letters: 1 A, 6 B, 205 C, 19 D.

### Decisions

Two changes, both **raised by the owner**. The reasons are in [why each money flow is counted](#view=how&sec=cl-why).

- **Seizures and forced exit costs out of the totals, counted as a cost carried** (reverses round 5's forced discounts and exit fees and round 14's M4 seizures); shown in the panel, table, CSV, JSON and as a map marker; check 25 — *raised by:* owner; *why:* a loss imposed on the country's companies and a gain for Russia; the country did not choose to move that money; *effect:* Finland +0.88, Austria +0.72, Ireland +0.54, Denmark +0.52; cost view up by the same amounts
- **Russia's and Ukraine's normal return as for every seller**: 5% real + the country risk premium, on book capital as a nominal USD rate (Russia 11.4%, Ukraine 23.0%); capital per unit of revenue measured for every product group — *raised by:* owner (after the round-14 check); *why:* one rule for every seller; the files subtracted 2.4 and 15 points too little; *effect:* Estonia −1.27, Lithuania −1.12 (from Russia's lower gain shares, not Ukraine's normal return), Moldova −0.99, Libya +0.86, Yemen +0.75

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 14b: Russia's and Ukraine's normal return

**Raised by the owner**, after the round-14 consistency check (M2): Russia's and Ukraine's net-gain shares subtracted
less than the sellers' rule implies (Russia by about 2.4 points, Ukraine by about 15), because capital per unit of
revenue was recorded for only some product groups.

- **The sellers' rule for Russia and Ukraine**: 5% a year above inflation after tax (4–6%) plus Damodaran's country risk premium (Russia 3.90%, Ukraine 15.54%, January 2026, fetched) — *data or judgement:* judgement anchored on market data (as for the sellers); *why:* one rule for every seller; *effect:* Russia 11.4% (10.4–12.4%), Ukraine 23.0% (22.0–24.0%) after tax; *where:* [net_gain_sellers-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md) section 6
- **Book capital with a nominal USD rate**: the capital measures are balance-sheet values (company IFRS statements, Rosstat total assets via return on assets, Ukrstat fixed assets at book value, Damodaran invested capital), so the real rate gets 2.5% expected USD inflation (US 10-year breakeven 2.3–2.5%) — *data or judgement:* judgement; *why:* book capital pairs with a nominal rate, replacement-cost capital with a real rate (the sellers' STAN capital is replacement cost); *where:* [net_gain_russia-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_russia-notes.md), [net_gain_ukraine-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_ukraine-notes.md)
- **Capital per unit of revenue measured for every group**: Russia: crude and products from Rosneft (PP&E / revenue 1.38), LNG from Novatek (non-current assets / revenue 1.94), fertilisers from PhosAgro (0.98), nonferrous from Nornickel (1.10), coal and the round-11 sector groups from Rosstat (margin / return on assets); Ukraine: farms from Astarta (1.08) and Damodaran's farming (0.77), traders and crushers from Kernel (0.47) and Damodaran, iron ore from Ukrstat mining (1.01) and Ferrexpo (0.70), steel from Damodaran (0.85) and Ukrstat manufacturing — *data or judgement:* data (fetched balance sheets and statistics); *why:* the builders' capital was judgement or missing; *where:* the two notes files
- **Where a group has no capital data, the closest measured group or an industry ratio, labelled**: Russia's pipeline gas keeps its builder's capital (Gazprom's statements could not be fetched); gold, the steel company method and Ukraine's six smaller groups use Damodaran's emerging-market industry ratios — *data or judgement:* judgement; *why:* never invent inputs; *where:* the two notes files
- **Ukraine's premium in every year**: the January 2026 premium (15.54%) applies to 2021 too, as the sellers' premiums do — *data or judgement:* judgement; *why:* one rule; the premium for a year is not in the research; *effect:* Ukraine's 2021 average 0.175 → 0.098
- **Method band**: the "normal return" alternative keeps Russia's and Ukraine's round-14 shares (`net_gain_*_r14.json`) with the sellers' round-13 rule — *data or judgement:* rule; *why:* the band shows the old method in one switch; *where:* `load()` in `build_data.py`

Effect (this step alone, net % of a year's GDP): Estonia −1.27, Lithuania −1.12, Moldova −0.99, Libya +0.86, Yemen
+0.75, Finland −0.67, Tunisia +0.66, Lebanon −0.56, Latvia −0.54, Georgia +0.41, the Netherlands −0.39, Belarus −0.39,
Poland −0.37, Uzbekistan +0.36, India +0.31. Russia's gain on crude falls from 0.64 to 0.57 in 2023, its non-fuel
average from 0.118 to 0.103 in 2024; Ukraine's export average from 0.069 to 0.036 in 2024. Both sides shrink: buying
less from Russia credits less, buying more from Russia costs less, and extra purchases from Ukraine count less.

</details>

<h2 id="cl-r14">Round 14: independent audit 3 <span class="cl-date">19 October</span></h2>
<!-- flows: flowback paid windfall laund services shipping frozen seized mil gold -->

**An independent audit: units, freight, seizures and several values corrected.**

### What changed

**Independent audit 3, 19 October 2026** (every change raised by the audit and approved by the owner).
Steps in the order applied, net % of a year's GDP, each step alone:

1. **C1, measured fuel share** in Russia's gain on what was bought: Yemen −7.86 → −4.06, Moldova 7.77 → 6.06, Libya
   −5.20 → −3.72, Nigeria 1.51 → 1.06, Brunei −1.27 → +1.75 ([prices](#view=how&sec=m-prices-the-mix-of-what-was-bought)).
2. **C2, customs values for what was bought**, tracker tonnes only to split fuels, copied tracker years flagged:
   Uzbekistan −6.32 → −3.16, Belarus −5.00 → −2.02, Tunisia −7.54 → −5.06, Libya −3.72 → −6.63, Yemen −4.06 → −6.87,
   Armenia −1.65 → +0.36.
3. **C3, FOB on both sides**: the freight surge out of customs values: India −2.92 → −2.29, Türkiye −2.90 → −2.51,
   Tunisia +0.39, Bulgaria +0.43, China −0.75 → −0.65 ([prices](#view=how&sec=m-prices-one-price-basis-fob)).
4. **H2, laundered-oil growth on its own base, fuel price screen, Nigeria labelled**: Lebanon 3.71 → 2.73, Libya
   −6.18 → −7.08, Nigeria 1.32 → 0.68, Malta 1.43 → 1.04, Belgium 3.49 → 3.14.
5. **H3, hubs pass EU-refined fuel on**: Belgium 3.14 → 2.81, Malta 1.04 → 0.75, Nigeria 0.68 → 0.89.
6. **M2, normal return 5% real after tax + country risk premium, services without real estate**: Cyprus 0.39 → 0.79,
   Belarus −2.02 → −2.40, Lithuania +0.10; US weapons flowback 2.2% → 3.6% of the money flowing back.
7. **M5, current euros** for every trade part: Lithuania 10.67 → 11.91, Estonia 9.99 → 11.17, Moldova 5.97 → 6.98,
   Hong Kong −2.34 → −4.16 (its gold at today's gold price).
8. **M4, seizures counted** ("Seized by Russia"): Austria 0.26 → −0.43, Finland 8.16 → 7.54, Ireland 1.42 → 0.93,
   Germany 3.45 → 3.23.
9. **M6** frozen reserves on their own line; **H5** cut label completed (labels only); **M3** sign-aware correlations
   (ranges only); **H4** method band with nine alternatives, range wording and grades by primary-data share; **C4**
   share cards and texts; **H1** flowback text; **M1** fairness note; **L1–L5** docs, legend, notes and sources.

Combined, round 13 → round 14 (ranking: GDP at least EUR 5bn, range not crossing zero): Lithuania +10.50 → +11.91,
Estonia +9.57 → +11.17, Finland +7.26 → +7.54, Moldova +7.77 → +6.98, Latvia +5.52 → +5.49, the Netherlands +4.88 →
+4.80, Poland +3.62 → +4.08, Denmark +4.05 → +3.88, Germany +3.25 → +3.23, Belgium +3.15 → +2.69, the US +0.48 →
+0.48; at the bottom North Korea −10.16 → −10.29, Libya −5.20 → −7.03, Yemen −7.86 → −6.86, Hungary −5.30 → −5.31,
Tunisia −7.09 → −4.92, Hong Kong −2.36 → −4.16, Uzbekistan −6.15 → −3.53, India −2.74 → −2.38, China −1.03 → −0.72.
Nigeria (+0.93, range +0.14 to +1.75), Malta and Ireland leave the top 20; Montenegro, Britain and Portugal enter it. Totals' letters: 1 A, 5 B, 209 C, 16 D (were 208 D, 23 C). Four new checks in
`check_data.py` (22 measured fuel share, 23 FOB price basis, 24 share-card qualifier; check 19 adapted to customs).

### Decisions

A third independent review ("audit 3", economist and data journalist) raised every point below; the owner approved each, with instructions for C1–C4, H1–H5, M1–M6 and L1–L5.

- Use the **measured fuel share** in Russia's gain on what was bought (C1), and **customs values** for what was bought each year, not tracker tonnes (C2) — *raised by:* audit, owner; *why:* a 60-country average and tonnes that contradict customs drove the bottom of the ranking; *effect:* Yemen −7.86 → −6.86 (both), Uzbekistan −6.15 → −3.53, Tunisia −7.09 → −4.92, Libya −5.20 → −7.03
- **FOB on both sides** of the windfall: freight surge taken out of customs values (C3) — *raised by:* audit, owner; *why:* the freight surge counted as Russia's windfall and again for shipowners; *effect:* India −2.74 → −2.38, China −1.03 → −0.72, Türkiye −3.08 → −2.62
- **Share cards**: "cut off by Russia" only where it happened; earners "earned from Russia" (C4); **flowback text** from the data (H1) — *raised by:* audit, owner; *why:* misleading, quotable text; *effect:* display
- **Nigeria, Lebanon, Belgium, Malta** artefacts: growth on its own base, fuel price screen, structural label (H2); **hubs pass EU-refined fuel on** (H3) — *raised by:* audit, owner; *why:* modelling artefacts and circular counting; *effect:* Nigeria +1.51 → +0.93, Belgium +3.15 → +2.69, Malta +1.42 → +0.75
- **Method band** with the choices that move results; honest range wording; grades by primary-data share (H4) — *raised by:* audit, owner; *why:* the band and the letters no longer informed; *effect:* letters 1 A, 5 B, 209 C, 16 D
- **Cut label** completed with evidence (Latvia, Moldova, Austria, France; Poland from volumes) (H5) — *raised by:* audit, owner; *why:* incomplete list, regulation cited instead of evidence; *effect:* labels only
- **Normal return** 5% real after tax + country risk premium; services without real estate (M2) — *raised by:* audit, owner; *why:* inflation was subtracted twice; *effect:* US flowback 2.2% → 3.6% of the money; Cyprus +0.4, Belarus −0.4
- **Current euros** for every trade part (M5); **seizures** counted (M4); **frozen reserves** on their own line (M6); sign-aware correlations (M3); fairness note (M1) — *raised by:* audit, owner; *why:* units, coerced transfers and wording; *effect:* Lithuania +10.50 → +11.91, Estonia +9.57 → +11.17, Austria +0.20 → −0.43, Hong Kong −2.36 → −4.16
- Russia's and Ukraine's normal returns checked against 5% real + their premium, relabelled after tax, **not recomputed** — *raised by:* audit (check), owner (instruction to check); *why:* per-group capital bases are not all recorded; *effect:* none; recorded as an open issue
- Docs, legend, Iran note, price source, China's dual-use note, INSS search (L1–L5) — *raised by:* audit, owner; *why:* stale or missing text; *effect:* display

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 14: independent audit 3

A third independent review by an economist and a data journalist (19 October 2026, "audit 3") found two coding inconsistencies in Russia's gain on what was bought, a price-basis error in the windfall, a share-card qualifier printed for countries it did not apply to, stale flowback text, artefacts for Nigeria, Lebanon, Belgium and Malta, and a method band that left out the choices that moved results. Every change below was **raised by the audit and approved by the owner**. Each row says what is data and what is judgement. Effects are on the net, % of a year's GDP, for that step alone, in the order applied.

- **C1. Measured fuel share in the net-gain step**: `apply_net_gain()` uses `fossil_share()` (the measured 2018–2021 mix in `prices.json`), as the price index and the windfall do, and the measured split over fuels where customs give it; `check_data.py` check 22 — *data or judgement:* data (a coding inconsistency); *why:* 172 economies outside the 60 largest buyers took the 60-country average (57% fuel): Yemen's wheat counted as half fuel; *effect:* Yemen −7.86 → −4.06, Moldova 7.77 → 6.06, Libya −5.20 → −3.72, Nigeria 1.51 → 1.06; *where:* [prices](#view=how&sec=m-prices-the-mix-of-what-was-bought)
- **C2. What was bought from customs values**: the fuel share of each year's purchases from the country's customs values per fuel, each deflated by its own price level, moved in odds against 2018–2021 (no cap at 100% fuel); tracker tonnes only split fuels, not in copied years (25 economies repeat 2024 in 2025) — *data or judgement:* data (customs) with a judgement (odds anchoring); *why:* tracker tonnes contradicted customs (Uzbekistan's products 13 times 2021) and capped Yemen and Tunisia at all fuel; *effect:* Uzbekistan −6.32 → −3.16, Belarus −5.00 → −2.02, Tunisia −7.54 → −5.06, Libya −3.72 → −6.63, Yemen −4.06 → −6.87; *where:* [prices](#view=how&sec=m-prices-the-mix-of-what-was-bought)
- **C3. One price basis (FOB)**: the war-time rise in sea freight (the project's measured freight pool on Russian crude and products, `shipping-notes.md`) is taken out of customs (CIF) values, scaled to each importer's ITIC margin, from both the oil price index and the oil part of payments; overland buyers and border-priced supplies have none; check 23 — *data or judgement:* data (freight pool) with judgements (route scaling by ITIC margin, the overland list, a 35% cap); *why:* CIF unit values against an FOB no-war benchmark counted the freight surge as Russia's windfall and again as shipowners' income; *effect:* India −2.92 → −2.29 (windfall +10.7bn extra paid → 11.0bn below no-war), Türkiye −2.90 → −2.51, China −0.75 → −0.65; *where:* [prices](#view=how&sec=m-prices-one-price-basis-fob)
- **H2. Laundered-oil growth only on its base; fuel prices screened; Nigeria labelled**: the pre-war growth stays on the base it was measured on (not the EU-refined part); fuel unit values more than 1/0.6 times off the benchmark are replaced (Nigeria's products 0.53); Nigeria's credit labelled structural (EU fuel ban, Dangote refinery) — *data or judgement:* data (the screen and the base) with a judgement (the 0.6 band); *why:* the growth raised the expected level 86% for no measured reason; a data error gave Nigeria a "paid less than no-war prices" credit; *effect:* Lebanon 3.71 → 2.73, Nigeria 1.32 → 0.68, Malta 1.43 → 1.04, Belgium 3.49 → 3.14, Libya −6.18 → −7.08; *where:* [energy](#view=how&sec=m-energy-and-laundered-oil-growth-hubs-and-nigeria)
- **H3. Hubs pass EU-refined fuel on**: hubs' resale shares and chains apply to EU-refined fuel too; fuel returning to its refiner through a hub stays with it; bunkers are charged to no one — *data or judgement:* data (hub export shares) with the existing resale judgements; *why:* Belgium was credited 6.4bn for oil it partly resold; the Netherlands–Belgium–Germany flows were counted in a circle; *effect:* Belgium 3.14 → 2.81, Malta 1.04 → 0.75, the Netherlands −0.10; *where:* [energy](#view=how&sec=m-energy-and-laundered-oil-growth-hubs-and-nigeria)
- **M2. Normal return 5% real after tax + the country's risk premium** (4–6% in the high and low cases); services without real estate (STAN `GTNXL`); economies without STAN keep the OECD median; Russia's and Ukraine's files relabelled after tax and checked — *data or judgement:* judgement anchored on market data (Damodaran WACC and country risk premiums, Treasury real yields, OECD manual, UK regulators); *why:* 9% nominal on replacement-cost capital took inflation out twice; real estate's dwelling stock made services' capital three times output; *effect:* Cyprus +0.40, Belarus −0.38, Kyrgyzstan −0.20, Lithuania +0.10; US weapons flowback 2.2% → 3.6%; *where:* [net_gain_sellers-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md) section 6
- ~~**M2. Russia and Ukraine not recomputed**~~ (recomputed in [round 14b](#view=how&sec=cl-r14b)): both files subtract less than "5% real + their premium" implies (Russia by about 2.4 points, Ukraine by about 15) — *data or judgement:* judgement (left for a later round); *why:* they were built by hand per product group, and the capital per unit of revenue is recorded for only some groups; recomputing would need inputs not in the research; *effect:* none; *where:* [net_gain_sellers-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md) section 6
- **M5. Current euros**: each year's change in volume is valued at that year's prices (`cur`): other goods at their own price level, fuel at the no-war price (already that year's euros), gold at the gold price — *data or judgement:* data (the same price indices); *why:* trade parts were at 2019–2021 prices against aid in money of each year; *effect:* Lithuania +1.24, Estonia +1.17, Moldova +1.01, Hong Kong −1.82 (gold at today's price); *where:* [overview](#view=how&sec=m-overview-the-core-idea-in-four-steps)
- ~~**M4. Seizures count**~~ (moved to the cost view in [round 14b](#view=how&sec=cl-why)), as money taken by Russia, on their own line ("Seized by Russia"), by home country, at owners' write-downs (company_flows.json; Fortum, Wintershall Dea, Carlsberg, Danone and the KSE case list fetched) — *data or judgement:* data (write-downs) with judgements (book value as the value to Russia; aircraft net of settlements); *why:* a seizure is as coerced as a forced discount, which already counted; *effect:* Austria +0.26 → −0.43, Finland −0.62, Ireland −0.49, Denmark −0.25, Germany −0.22; *where:* [Russia's state and companies](#view=how&sec=m-russia-state-and-companies-assets-seized-by-russia)
- **M6. Frozen reserves on their own line**, "Russian money frozen", kept in the change in payments to Russia and never called "less paid" — *data or judgement:* wording; *why:* the return Russia lost is not a payment; it is money Russia did not get, which is what the second number measures; *effect:* none; *where:* [Russia's state and companies](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves)
- **H5. Cut label completed**: Latvia (30 July 2022), France's Engie (1 September 2022), Moldova (from October 2022, was 2025), Austria's OMV (16 November 2024, was 2025); the first year from the cut date; Poland's gas part from final-use volumes; the label cites evidence of each cut (`gas_cuts`), not EU Regulation 833/2014 — *data or judgement:* data (company, operator and press statements, fetched); *why:* the list missed four cuts; Poland's customs book gas under other headings; *effect:* labels only: Poland 0.6bn → 4.6bn, Moldova 0.25 → 0.46bn; France's gas purchases rose (LNG), so no label; *where:* [overview](#view=how&sec=m-overview)
- **C4. Share cards and texts**: "cut off by Russia" only where Russia cut the country's gas; earners "earned from Russia"; when the largest part of "less paid" is not payments it is named (Belgium: frozen reserves; Nigeria, Latvia: less Russian crude via refiners); cards regenerated; check 24 — *data or judgement:* wording; *why:* 96 countries carried a cut qualifier they did not have; North Korea's card said "more paid"; *effect:* display; *where:* `rusWords()` in `site/index.html`, `pipeline/share_cards.mjs`
- **H1. Flowback text**: the rule is the seller's real gain (taxes plus profit above a normal return) × genuinely extra; the panel gives the country's own share and the US weapons share from the data (about 3.6%) — *data or judgement:* wording; *why:* every donor panel still said "value kept × genuinely extra (for US weapons, about 63%)"; *effect:* display; *where:* `site/index.html`, `views2.js`
- **H4. Method band widened; range wording; grades**: the band adds EU refiner treatment, the laundered-oil route rule and coverage, the fuel-mix basis, the freight basis and the normal return (data rebuilt with each choice, `METHOD_ALTERNATIVES`); the range is "data and model uncertainty given the method, about 90% by judgement"; a total's letter is graded by the share resting on primary data (A: 80% in A; B: half in A–B; C: 75% in A–C; else D) — *data or judgement:* judgement (thresholds); *why:* the band left out the choices that moved results; every total was D or C; *effect:* letters: 208 D / 23 C → 1 A, 5 B, 209 C, 16 D; *where:* [ranges](#view=how&sec=m-ranges-certainty-letters)
- **M3. Correlations with signs**: the correlation between two parts is multiplied by the product of their signs — *data or judgement:* data-free (arithmetic); *why:* a common input moves parts of opposite sign in opposite directions; *effect:* ranges only, slightly narrower for the US, France, China; *where:* [ranges](#view=how&sec=m-ranges-from-parts-to-a-total)
- **M1. Fairness note**: poorer economies (GDP per person under EUR 15,000) at the "more paid to Russia" end whose negative number is mostly payments get a note that fuel is fungible and the figure reflects what was bought; the ranking says so too — *data or judgement:* wording (the EUR 15,000 line is a judgement); *why:* the bottom of the ranking is mostly poor fuel and food importers; *effect:* display; *where:* `fairnessNote()`
- **L1–L5**: stale numbers in the docs updated; the legend's negative end "more paid to or earned from Russia"; a note that paid weapons count at the seller's gain (Iran); the price indices cite a source (`prices`); China's dual-use note shown; the INSS report searched again, not found (label and limitation kept) — *data or judgement:* wording and sources; *why:* stale or missing text; *effect:* display; *where:* [military_payment_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_payment_r13-notes.md)

</details>

<h2 id="cl-r13b">Round 13b: remittances as a marker, laundered-oil routes <span class="cl-date">19 October</span></h2>
<!-- flows: laund remit -->

**Remittances left the totals; laundered-oil routes only where records name the buyer.**

### What changed

**Remittances as a marker; laundered oil only where both routes are measured, 19 October 2026** (two owner decisions
after the round-13 report, both raised by the audit; decisions,
[decision log](#view=how&sec=cl-r13)). Net % of a year's GDP:

1. **Remittances out of the totals, shown as a marker** (△ in the panel, map layer "Wages from Russia", columns marked
   "not in totals" in the table, CSV and JSON): no longer in the net, the cost view, either headline number, the method
   band or the share cards. Reverses the owner's round-7 decision: individuals' wages, not a country's choice; the
   money flows from Russia to the migrant's home; the real gain over the alternatives is small and hard to measure; they
   dominated the bottom of the ranking ([trade](#view=how&sec=m-trade-remittances-and-relocants)). Tajikistan −39.61 →
   −0.81, Uzbekistan −14.46 → −6.11, Kyrgyzstan −7.48 → −4.94, Armenia −2.91 → −1.62, Belarus −5.63 → −4.96, Moldova
   +7.96 → +7.77. The marker for Tajikistan: +70% of GDP since 2022 (+EUR 9.4bn against the expected level).
2. **Laundered oil through EU refiners counted only where both routes are measured**: where the route that replaced
   EU-refined fuel after the EU ban is not in the post-war records for a buyer, its 2023–2026 values are held at the
   expected level and labelled "route not measured after 2022" ([energy](#view=how&sec=m-energy-and-laundered-oil-eu-refined-fuel-measured-both-ways)).
   Togo +6.61 → −0.05 (was 5th in the ranking; its range now crosses zero), Marshall Islands +6.17 → +0.91, Gibraltar
   +2.88 → −0.10, Tunisia −5.51 → −7.09, Georgia −1.11 → −2.48, Aruba +0.96 → −0.33, North Macedonia −0.78 → −1.53,
   Albania +0.84 → +0.17, Montenegro +2.67 → +2.12; no EU member moves. Two new checks in `check_data.py`.

Ranking (GDP at least EUR 5bn, range not crossing zero): Lithuania +10.50, Estonia +9.57, Moldova +7.77, Finland +7.26,
Latvia +5.52 at the top; North Korea −10.16, Yemen −7.86, Tunisia −7.09, Uzbekistan −6.15, Hungary −5.30 at the
bottom. Togo, Tajikistan, Montenegro and Argentina left the ranking (their ranges cross zero).

### Decisions

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 13b: remittances as a marker, laundered-oil routes

Two owner decisions after the round-13 report (19 October 2026), both raised by the audit. Effects are on the net, % of
a year's GDP, for that change alone; every other country is unchanged (changelog).

- **Remittances out of the totals, shown as a marker**: no longer in the net shift, the cost view, either headline number, the method band or the share cards; the change in labour remittances from Russia against the expected level is shown in the panel ("depends on wages earned in Russia" where migrants sent at least 1% of GDP a year), as a map layer (a triangle, "Wages from Russia") and as columns marked "not in totals" in the table, CSV and JSON. **Reverses the owner's round-7 decision** — *data or judgement:* rule (owner); the 1% of GDP threshold for the map is a judgement; *why:* individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over the alternatives is small and hard to measure; they would dominate the bottom of the ranking (Tajikistan −39.6, almost all remittances); *effect:* Tajikistan −39.61 → −0.81, Uzbekistan −14.46 → −6.11, Kyrgyzstan −7.48 → −4.94, Armenia −2.91 → −1.62, Belarus −5.63 → −4.96, Moldova +7.96 → +7.77; *where:* [remittances](#view=how&sec=cl-why-remittances-from-russia), [trade](#view=how&sec=m-trade-remittances-and-relocants)
- **Laundered oil through EU refiners: a change counts only where both routes are measured for the buyer.** Before the war the route is measured for every buyer (each EU refiner's 2021 Comtrade HS 2710 exports by partner). After the EU ban, fuel made from Russian crude came through India, Türkiye, the UAE and China; that route counts as measured for a buyer when (1) it is an EU member (its own customs records, laundered_eu.json, checked against CREA), or (2) it is named in the post-war fuel-export records of India, Türkiye or the UAE (their own reports for 2022–2025, hub_buyers.json) or among the importers that record fuel via Togo (refine.json), and a cap does not set its post-war value. Elsewhere the route's 2023–2026 values are held at the expected level and labelled "route not measured after 2022"; 2022 keeps the refiners' own measured exports — *data or judgement:* data: which buyers the post-war records name; rule: hold at the expected level where they do not; *why:* the fall for small fuel importers (Togo, the Marshall Islands, Gibraltar, Tunisia, Georgia) was a gap in our post-war data, not a change in what they did; EU members keep the step-7 treatment (both routes measured). 74 buyers of EU-refined fuel are measured both ways, 128 are held; *effect:* Togo +6.61 → −0.05, Marshall Islands +6.17 → +0.91, Gibraltar +2.88 → −0.10, Tunisia −5.51 → −7.09, Georgia −1.11 → −2.48, Aruba +0.96 → −0.33, North Macedonia −0.78 → −1.53; no EU member moves; *where:* [energy](#view=how&sec=m-energy-and-laundered-oil-eu-refined-fuel-measured-both-ways), `eu_refiner_exports()`
- Lebanon, Nigeria, Libya and Moldova keep the step-7 treatment — *data or judgement:* data: Türkiye's own export records name Lebanon, Libya and Moldova; India's, the UAE's and Togo's buyers' records name Nigeria; *why:* both routes are measured for them. Sensitivity: counting only EU members and the G7 and Australia as measured would move Moldova −2.46, Lebanon −2.22, Libya −2.06, Nigeria −1.04; *effect:* none; *where:* [limitations](#view=how&sec=limitations)

</details>

<h2 id="cl-r13">Round 13: one rule, two numbers <span class="cl-date">19 October</span></h2>
<!-- flows: aid loans flowback paid windfall laund sold services shipping remit mil agents gold -->

**One valuation rule for every seller; support for Ukraine and business with Russia as two numbers.**

### What changed

**One rule, two numbers, 19 October 2026** (an independent economist and journalist audit, all fixes approved by the owner). Each step was made on its own; net % of a year's GDP:

1. **Fuel-mix bug**: the volume of all payments now uses 2019–2021 prices. Hungary −4.09 → −5.53, Mongolia −4.68 → −6.53, Slovakia +1.33 → −0.07, Belarus −17.55 → −18.48, Libya −6.45 → −7.34, Türkiye −3.30 → −3.91, India −2.32 → −2.83. New check in `check_data.py`.
2. **Gold deflator**: Hong Kong −4.20 → −1.90; small changes for China, Oman, Switzerland.
3. **Text**: MSMT troop figures (11,000 + 3,000), "Aid to Ukraine (Kiel, adjusted ...)" with Kiel's own figure in the panel, Yemen's 2023 price index (−9.64 → −7.80, applied in step 12).
4. **One valuation rule** (OECD STAN net gain × genuinely extra; [`net_gain_sellers.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers.json)): Belarus −18.48 → −5.55, Kyrgyzstan −16.71 → −6.09, Armenia −10.11 → −2.42, Cyprus +6.12 → −0.30, Georgia −7.22 → −2.31, Uzbekistan −18.12 → −15.13, Montenegro +4.60 → +2.24, Lithuania 14.45 → 12.69, Estonia 9.01 → 7.33, China −1.56 → −1.05, the US +0.36 → +0.48.
5. **Remittances** at the migrant's net gain ([`remittances_r13.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances_r13.json)): Kyrgyzstan −6.09 → −7.48, Tajikistan −38.28 → −39.63, Moldova +6.11 → +5.38, Uzbekistan −15.13 → −14.50. Replaced in [round 13b](#view=how&sec=cl-r13b): remittances are now a marker, in no total.
6. **Weapons to Russia, paid or unpaid** ([`military_payment_r13.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_payment_r13.json)): North Korea −29.95 → −10.16, Iran −0.79 → −0.01.
7. **EU refiners** charged to their buyers: Lithuania 12.69 → 10.15, the Netherlands 5.56 → 4.62, Finland 7.78 → 7.17, Greece −0.65.
8. **Laundered oil in volumes, both ways**: Togo +6.82, Latvia +2.71, Moldova +2.38, Estonia +2.22, Libya +1.65, Tunisia +1.60; Nepal −1.61 → −1.80. Togo's credit was a data gap, removed in [round 13b](#view=how&sec=cl-r13b).
9. **Two headline numbers** everywhere (map, panel, ranking, share cards, table and downloads, How it works), with gas Russia cut off itself labelled. No number changes.
10. **Certainty and ranges**: stacked models at best C (parts at B 665 → 84); correlated errors; a method band in the panel; PhosAgro's margins fetched (Russia's 2023 fertiliser gain 0.20 → 0.27). The windfall at Russia's net gain (step 12) came in this build: Japan +0.02, Spain +0.05, Belgium +0.09.
11. **Units**: "2022–2026 total as % of one year's GDP (2024), not a yearly rate" on the map, with an average-year line in the panel.
12. **Other findings**: Yemen's price index (Yemen −9.64 → −7.80); extra purchases from and sales to Ukraine summed with their signs; exact source links; the round-6 value-kept scripts in [`research/2026-10/scripts/`](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/scripts/value_kept); the audit's loan critique recorded.

All steps together (base → round 13): Lithuania 14.55 → 10.50, Finland 9.02 → 7.26, Estonia 9.25 → 9.57, the Netherlands 6.35 → 4.88, Germany 3.65 → 3.25, Poland 4.06 → 3.62, the US 0.36 → 0.48, Hungary −4.09 → −5.30, Slovakia +1.33 → −0.24, Hong Kong −4.20 → −2.35, China −1.56 → −1.03, North Korea −29.98 → −10.16, Belarus −17.55 → −5.63, Tajikistan −38.20 → −39.61, Uzbekistan −17.87 → −14.46.

### Decisions

An independent review by an economist and a data journalist ("audit") raised every point below; the owner approved each.

- Fix the **fuel-mix bug** (volumes at 2019–2021 prices, not no-war prices) and add a check — *raised by:* audit; *why:* the fuel share of what was bought was understated from 2022; *effect:* Hungary −4.1 → −5.5, Slovakia +1.3 → −0.1, India −2.3 → −2.8
- Deflate **gold** with the gold price — *raised by:* audit; *why:* Hong Kong's palladium-heavy mix inflated its volume of gold 1.3–3 times; *effect:* Hong Kong −4.2 → −1.9
- **One valuation rule** for every seller: net gain (taxes plus profit above a normal return, OECD STAN) × genuinely extra, for sales to Russia and Ukraine, flowback, services, shipping, payment agents and paid weapons — *raised by:* audit, owner; *why:* the rules for Russia and for everyone else differed tenfold; *effect:* Belarus −18.5 → −5.6, Cyprus +6.1 → −0.3, US +0.36 → +0.48
- **Remittances** at the migrant's net gain: the war wage premium and the premium over the home wage — *raised by:* audit, owner; *why:* wages pay for real work; *effect:* Tajikistan −38.3 → −39.6 (its war wage premium is real), Kyrgyzstan −6.1 → −7.5
- **Weapons to Russia**: paid (also in kind) as a sale at the seller's net gain; unpaid in full — *raised by:* audit, owner; *why:* payment in kind is payment; *effect:* North Korea −30.0 → −10.2
- **EU refiners** charged to their buyers, like India's and Türkiye's — *raised by:* audit; *why:* the same crude was treated two ways; *effect:* Lithuania −2.5, the Netherlands −0.9, Finland −0.6
- **Laundered oil** in volumes, both ways — *raised by:* audit; *why:* the only trade part in money and rises only; *effect:* Estonia +2.2, Latvia +2.7, Togo +6.8
- **Two headline numbers**: support for Ukraine and the change in payments to Russia, the net as their sum, everywhere; gas Russia cut off itself labelled — *raised by:* audit, owner; *why:* "less paid to Russia" is not money moved to Ukraine; *effect:* wording, ranking by either number, exports
- **Certainty**: stacked models at best C; correlated errors; a **method band** next to the 90% range — *raised by:* audit; *why:* letters and ranges overstated the evidence; *effect:* letters and ranges only
- **Windfall** at Russia's net gain on the extra price — *raised by:* audit, owner; *why:* the same rule as volumes; *effect:* Japan and Spain lose about a fifth of their windfall
- **Units**: the period total against one year's GDP, with an average-year line — *raised by:* audit; *why:* the total was read as a yearly rate; *effect:* display
- Text: MSMT troops 11,000 + 3,000; "Aid (Kiel, adjusted)"; Yemen's 2023 price index; exact source links; research scripts in the repository; PhosAgro margins fetched — *raised by:* audit; *why:* errors and untraced inputs; *effect:* Yemen −9.7 → −7.8
- Loans (6.7% plus expected loss; EU provisioning rates) kept, the critique recorded — *raised by:* audit, owner; *why:* decision B is the owner's choice; *effect:* none
- **Remittances out of the totals, shown as a marker** ("depends on wages earned in Russia": the change in what migrants sent from Russia, % of GDP, with its range). Reverses the owner's round-7 decision to count them — *raised by:* raised by audit, owner decided; *why:* they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over the migrant's alternatives is small and hard to measure; and they dominated the bottom of the ranking (Tajikistan −39.6, almost all remittances) ([why](#view=how&sec=cl-why-remittances-from-russia)); *effect:* Tajikistan −39.6 → −0.8, Uzbekistan −14.5 → −6.1, Kyrgyzstan −7.5 → −4.9, Armenia −2.9 → −1.6, Belarus −5.6 → −5.0
- **Laundered oil through EU refiners counted only where both routes are measured**: where the route that replaced EU-refined fuel after the EU ban is not measured for a buyer, its 2023–2026 values are held at the expected level ("route not measured after 2022") — *raised by:* raised by audit, owner decided; *why:* small fuel importers got large "less paid to Russia" credits because our post-war data do not trace their fuel from India and others, not because they changed what they did ([why](#view=how&sec=cl-r13b)); *effect:* Togo +6.61 → −0.05 (out of the top 10), Marshall Islands +6.2 → +0.9, Gibraltar +2.9 → −0.1, Tunisia −5.5 → −7.1, Georgia −1.1 → −2.5; EU members unchanged

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Round 13: one valuation rule for every seller

An independent review by an economist and a data journalist (19 October 2026, "audit") found three valuation rules mixed in the headline, a bug in the fuel mix, a wrong deflator for gold, unequal treatment of refiners, and framing and certainty that overstated the evidence. The owner approved every fix below. Each row says what is data and what is judgement. Effects are on the net, % of a year's GDP, for that step alone.

- **Fuel-mix bug fixed**: the volume of all payments in `apply_net_gain()` uses the payments index at 2019–2021 prices (`_pidx_pre`), as the tracker's fuel volumes do; a check tests that the same volumes give the same gain — *data or judgement:* data (a coding error); *why:* the no-war index valued fuel at no-war prices, about twice the 2019–2021 level in 2022, so the fuel share of what was bought was understated (audit); *effect:* Hungary −4.1 → −5.5, Slovakia +1.3 → −0.1, India −2.3 → −2.8, Türkiye −3.3 → −3.9, Mongolia −4.7 → −6.5; *where:* [overview](#view=how&sec=m-overview-the-net-gain-rule), `check_data.py`
- **Gold at the gold price**: gold in the payments (tagged or Hong Kong's rise) is deflated with the gold index, rebased to 2019–2021 — *data or judgement:* data (prices.json gold index); *why:* Hong Kong's pre-war index was half palladium, whose price fell while gold's rose 2.7 times (audit); *effect:* Hong Kong −4.2 → −1.9; *where:* [trade](#view=how&sec=m-trade-hong-kong-gold)
- **One rule for every seller**: every sale counts at the seller's net gain (taxes plus profit above a 9% return on capital, OECD STAN by country and industry) × genuinely extra; value kept (incl. wages) is dropped — *data or judgement:* data (OECD STAN 2025); judgement: the normal return (9%, the same as Russia's), manufacturing for goods sold to Russia, the OECD median for economies outside STAN; *why:* the same car counted ten times more when China sold it to Russia than when Russia sold it; the claim "the same rule" was not true (audit). "Genuinely extra" stays: it measures additionality, not value; *effect:* Belarus −18.5 → −5.6, Kyrgyzstan −16.7 → −6.1, Armenia −10.1 → −2.4, Cyprus +6.1 → −0.3, Georgia −7.2 → −2.3, China −1.56 → −1.05, US +0.36 → +0.48; *where:* [overview](#view=how&sec=m-overview-one-rule-for-every-seller), [net_gain_sellers-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md)
- Shipping freight and insurance at the shippers' and insurers' net gain; ship-sale premiums and registry fees keep their shares — *data or judgement:* data (STAN H50, K65); judgement for premiums and fees (already rent); *why:* the same rule; *effect:* Greece's shipping part about 0; *where:* [services](#view=how&sec=m-services-shipping-companies-shipping)
- Payment agents' fees at the financial industry's net gain × genuinely extra — *data or judgement:* data (STAN K); judgement (extra 0.5); *why:* a fee is a sale of a service to Russia; *effect:* Kyrgyzstan's fees −0.7bn → about −0.07bn; *where:* [trade](#view=how&sec=m-trade-payment-agents)
- ~~**Remittances at the migrant's net gain**~~ (replaced in [round 13b](#view=how&sec=cl-r13b): a marker, not in the totals): the war wage premium in what migrants sent counts in full (as far as it shows in euros); the rest of the change × the premium over the home wage × genuinely extra — *data or judgement:* data: Rosstat wages (as reported), a 2021 survey of migrant pay, home wages (as reported); judgement: the 9% pre-war wage trend, 0.2 for countries without a home wage; *why:* wages pay for real work; only pay above what the same work earns elsewhere is a gain, and only its war-driven change counts (audit, owner); *effect:* Tajikistan −38.3 → −39.6, Uzbekistan −15.1 → −14.5, Kyrgyzstan −6.1 → −7.5, Moldova +6.1 → +5.4; *where:* [remittances_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances_r13-notes.md)
- Tajikistan's remittance total kept at the World Bank's (USD 10.18bn in 2025); EFSD's 54.5% of GDP implies 9.6bn — *data or judgement:* data; *why:* the audit's "about 8.6bn" is not in the article it cites; the range covers EFSD's figure; *effect:* none; *where:* [remittances_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances_r13-notes.md#checking-the-totals)
- **Weapons sent to Russia: paid or unpaid.** Paid (also in kind) = a sale at the seller's net gain × genuinely extra; unpaid = support in full. North Korea paid (INSS: in kind 80–96%), half its shells outdated stock at 0.9 of the price; Iran paid (contracts); Belarus unpaid (no payment found); China's unrecorded part sold by firms; troops' pay in full — *data or judgement:* data: INSS via Bloomberg and The Insider, NK News, Bloomberg via Militarnyi, HUR via Reuters; judgement: 0.9 on outdated stock, Belarus unpaid, the 0.8 ends; *why:* payment in kind is payment, so it is a sale; troops' pay counts in full: it goes to the North Korean state, and the soldiers' alternative pay is close to nothing; *effect:* North Korea −30.0 → −10.2, Iran −0.8 → 0.0; *where:* [military_payment_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_payment_r13-notes.md)
- **Windfall at Russia's net gain** on the extra price: 1 for oil and pipeline gas, the profit tax plus Russia's 60% of LNG profit (0.68–0.74), at most the coal rent for coal — *data or judgement:* data (net_gain_russia.json); *why:* costs do not rise with the price; the audit asked for the windfall to count by the same rule as volumes; *effect:* Japan and Spain lose about a fifth of their windfall; Hungary and Türkiye unchanged; *where:* [prices](#view=how&sec=m-prices-war-time-windfall)
- Türkiye's no-war gas price keeps 0.7 hub (TTF) and 0.3 oil formula — *data or judgement:* data for "about 70% hub-indexed since 2021" (turkey_prices-notes); judgement in using it as the weights; *why:* the audit asked to source or label it. Sensitivity: 0.5/0.5 gives Türkiye −3.18, 0.9/0.1 gives −2.98 (central −3.08); *effect:* none; *where:* [prices](#view=how&sec=m-prices-war-time-windfall)
- **Two numbers**: support for Ukraine and the change in payments to Russia, with the net as their sum, everywhere on the site; "less paid to Russia (incl. supplies Russia cut off)", never "toward Ukraine" — *data or judgement:* rule; *why:* most of the "toward Ukraine" score of Lithuania, Finland, the Netherlands and Germany was less paid to Russia, including gas Russia cut off itself (audit); *effect:* no number changes; *where:* [overview](#view=how&sec=m-overview)
- **Cut by Russia label**: the gas part of "less paid to Russia" in years when Gazprom cut the supply (Poland, Bulgaria, Finland, the Netherlands, Denmark, Germany from 2022) or Ukraine's transit ended (Austria, Slovakia, Italy, Moldova from 2025) — *data or judgement:* data (sanctions_share.json gas_part); judgement in the list of countries and first years; *why:* it is not the country's choice (sanctions_share-notes); *effect:* a label: Germany EUR 24bn of 70bn; *where:* [overview](#view=how&sec=m-overview-every-part-of-the-net-shift)
- **Stacked models at best C**: less paid to Russia, purchases from Ukraine, sales and services to and from Russia — *data or judgement:* rule; *why:* a modelled no-war level × a modelled share is a modelled estimate (audit); *effect:* letters only; *where:* [ranges](#view=how&sec=m-ranges-certainty-letters)
- **Correlated errors**: aid and EU aid (1), aid and its own flowback (−0.5), parts sharing Russia's gain shares (0.5), flowback parts sharing the weapons gain (0.5), paid and sold (0.2) — *data or judgement:* judgement; *why:* parts that share inputs are not independent (audit); *effect:* ranges only; *where:* [ranges](#view=how&sec=m-ranges-from-parts-to-a-total)
- **Method band** next to the 90% range: the net under the round-12 valuation rule, the windfall in full, loans at the war-time yield — *data or judgement:* rule; *why:* the range is parameter uncertainty given the method; method choices move some countries by a factor of two (audit); *effect:* display; *where:* [ranges](#view=how&sec=m-ranges-the-method-band)
- PhosAgro's margins fetched: Russia's fertiliser gain share 2023 0.20 → 0.27; Acron's 2021 margin unverified (D) — *data or judgement:* data (PhosAgro annual report 2023); *why:* "from memory" inputs must be fetched or graded down (audit); *effect:* small; *where:* [net_gain_russia-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/net_gain_russia-notes.md)
- Extra purchases from and sales to Ukraine: the yearly changes summed with their signs, only the total floored at zero — *data or judgement:* rule; *why:* flooring each year gave noisy series a positive value when the true change was 0 (audit); *effect:* tiny; *where:* [overview](#view=how&sec=m-overview-every-part-of-the-net-shift)
- Yemen's 2023 non-fuel price index (0.68, its own customs unit value) replaced by the wheat index (1.30) — *data or judgement:* data; *why:* the only non-fuel index below 0.8; Yemen's imports from Russia are 99.6% wheat (audit §15); *effect:* Yemen −9.7 → −7.8; *where:* `PRICE_OUTLIERS` in `build_data.py`
- Yemen's GDP stays the IMF figure (USD 8.07bn for 2024); the Netherlands' 2026 index (0.63) and Tunisia's 2024 index (0.88) were checked and kept — *data or judgement:* data; *why:* Yemen's GDP matches the IMF WEO; the World Bank has none after 2018. The Netherlands' low 2026 index is LNG bought below the no-war (world) price, the method's own result, not an error; *effect:* none; *where:* [limitations](#view=how&sec=limitations)
- "Aid (Kiel)" relabelled "Aid to Ukraine (Kiel, adjusted: weapons at market value, loans as gifts)", with Kiel's own figure in the panel — *data or judgement:* rule; *why:* Poland's Kiel figure is EUR 5.89bn; the map shows 3.24bn after the write-downs (audit); *effect:* labels; *where:* [README](#view=how)
- Exact links instead of portal home pages (Kiel's Release 31 workbook, a Comtrade query, the MSMT report, the windfall's method notes); round-6 value-kept scripts moved into the repository — *data or judgement:* rule; *why:* a source should be one click from the figure (audit M8); *effect:* none; *where:* [sources_r11.json](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/sources_r11.json), [scripts](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/scripts/value_kept)

#### Round 13: refiners and laundered oil

- **EU refiners treated like India's and Türkiye's**: the Russian crude in fuel they export is charged to the buyers, before and after the war; the refiner keeps what it used itself — *data or judgement:* data: round4a.json export shares, CREA crude tonnes, each refiner's UN Comtrade HS 2710 exports by partner (2021); judgement: fuel to Ukraine, bunkers and places off the map stays with the refiner; *why:* the same crude counted at the refiner only in the EU (audit); *effect:* Lithuania −2.5, the Netherlands −0.9, Finland −0.6; *where:* [energy](#view=how&sec=m-energy-and-laundered-oil-refiners-counted-once)
- **Laundered oil in volumes, both ways**: the crude at the no-war crude price against its pre-war level at 2019–2021 prices, falls counted too, at Russia's net gain on crude — *data or judgement:* rule; *why:* the only trade part in money and rises only; it mixed price and volume (audit); *effect:* Estonia +2.2, Latvia +2.7, Togo +6.8 (a fuel hub whose pre-war fuel held Russian crude); Nepal −1.6 → −1.8, Tanzania −2.0 → −2.2; *where:* [energy](#view=how&sec=m-energy-and-laundered-oil-pre-war-laundered-oil)

#### Audit points kept, with the reason

- **Loans** (audit M4): Ukraine's 2021 rate (6.7%) already holds a default premium, so adding the creditor class's expected loss partly double counts; EU provisioning rates are prudence, not forecasts. The owner kept decision B and the 6.7% normal rate; effect on headlines 0.007–0.014 points. The method band shows loans at the war-time yield ([loans](#view=how&sec=m-loans-what-is-still-judgement)).
- **Frozen reserves** (M9): the return denied stays credited a third to the host, two thirds to EU members (owner, round 7). It is in the second number, labelled as the return Russia lost.
- **Constant prices against nominal aid** (M2): stated on the map and in [overview](#view=how&sec=m-overview-the-core-idea-in-four-steps); re-inflating all volumes to 2024 prices would change every part and is left for a later round.
- **Minimum GDP for rankings** (M5): kept at EUR 5bn; rankings say that countries whose range crosses zero are left out because the sign is uncertain.
- **The 2021 baseline for gas** (M6): kept; an alternative 2019–2021 futures path was not built this round.
- **Refugee costs** (M7): gross and net are not yet shown side by side; noted in [limitations](#view=how&sec=limitations).
- **Laundered oil for small buyers** (H3): the volume rule does not address fungibility (Nepal's diesel barely changes Russia's revenue); noted in [limitations](#view=how&sec=limitations). Round 13b holds the EU-refined route where its post-war replacement is not measured ([above](#view=how&sec=cl-r13b)); fungibility itself is still open.

</details>

<h2 id="cl-r12">Round 12: data precision <span class="cl-date">19 October</span></h2>
<!-- flows: loans undisc paid energy services -->

**Six judgement constants replaced by measured values; loans valued from measured rates and losses.**

### What changed

**Measured values for six judgements, 19 October 2026.** The round-11 audit listed values that were judgements or not
traced. Round 12 replaced six of them with measured ones, one at a time, recording each change's effect with the site's
own `calc()` ([round 11](#view=how&sec=cl-r11)).

- **Loans** ([loans](#view=how&sec=m-loans), new page). The gift in a loan is now cheaper interest, discounted at Ukraine's
  2021 bond rate (6.7%), plus the default risk the lender really carries: the measured expected loss of its creditor
  class (IMF and World Bank 0, EU 9%, the bilateral standstill for G7 and Paris Club lenders, about 95% for the 2026
  Support Loan). The high end uses the promised war yield of the year of payout (38% in 2022, 40% in 2023, 24%, 17% and
  15% after), measured from 72 weekly ICU price reports and 106 weekly Eavex yield tables. It was a flat 10%. Loans now
  count EUR 53bn (42–85) of 96.5bn face, instead of 64bn (40–77). New script:
  [`pipeline/loan_rates.py`](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/loan_rates.py); raw downloads in
  [`raw/loan_rates`](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/raw/loan_rates).
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
  +0.014); in the cost view by 0.013 to 0.026 ([loans](#view=how&sec=m-loans-by-loan-type)).
- **Trace by money flow** ([trace](#view=how&sec=flows-h), new page). Every part on the map is grouped into one of 26 money flows.
  Each flow has one entry: what it is, the method section, the decisions behind it, its sources with their exact links,
  the research files and raw data, the code, and which values are data or judgement. The map has a new **Sources** view
  with the same groups, and a § link next to each part in a country's panel opens its flow
  (`#view=sources&flow=loans`). No number changes.
- **North Korea's primary source**: the Multilateral Sanctions Monitoring Team's report MSMT/2025/1 (29 May 2025, UN
  document S/2025/340) is now read and linked as a primary source of `military_rus_r6`. It confirms the volumes (rounds,
  containers, missiles, artillery, troops) but gives no prices, so the certainty stays C and no number changes
  ([comparison](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/military_rus_r6-notes.md#checked-against-the-primary-report-round-12)).
- **Why each money flow is counted** ([decisions](#view=how&sec=cl-why)). The nine flows with
  no written reason (undisclosed aid, energy switching cost and oil discount, services, shipping, company exits,
  remittances, Rosatom and state loans, arms bought from Russia, payment agents) now have one, taken from what was said
  when each was added. Choices with no reason on record are marked "reason not recorded". The decision log gains rows
  for undisclosed aid, the switching cost and oil discount, services and arms bought from Russia. No number changes.

### Decisions

- Replace the six questionable values of the round-11 proposals with **measured** ones, one at a time, and record each change's effect — *raised by:* owner; *why:* a judgement should give way to data where data exist; *effect:* [decisions](#view=how&sec=cl-r11)
- Value loans at **opportunity cost: the real market rate Ukraine faced in the year of payout**, wartime included — *raised by:* owner; *why:* what the market would have charged is the consistent price of the money; *effect:* first method; kept as the **high** end
- Do not use the promised war yield (30–60%) as the central value: it is mostly **compensation for expected default**, which official lenders did not bear — *raised by:* owner; *why:* the IMF and World Bank are paid first; EU loans were left out of both debt deals; bilateral lenders only deferred. At the war yield, long loans become near-full gifts; *effect:* central value split into two parts
- **Gift = cheaper interest** (at Ukraine's 2021 rate, 6.7%) **+ the default risk the lender really carries** (the measured expected loss of its creditor class) — *raised by:* owner; *why:* separates the price of time from the price of risk, each measured; *effect:* net shift: loans EUR 53bn instead of 64bn; Japan −0.06 points, EU members −0.04 to −0.05 ([loans](#view=how&sec=m-loans))
- Expected loss by class: IMF and World Bank 0; EU 9% (the EU's own provisioning rate for MFA loans); bilateral lenders the Group of Creditors' standstill in the cash flows; the 2026 Support Loan about 95% (repaid only from reparations) — *raised by:* owner, proposed; *why:* each from a fetched source; nothing judged where a measure exists; *effect:* [loans](#view=how&sec=m-loans-by-loan-type)
- Range: **low** = the 2021 rate, no loss for official lenders; **high** = the promised war yield of the year — *raised by:* owner; *why:* the low strips out all war risk; the high is the owner's first idea; *effect:* [loans](#view=how&sec=m-loans-the-range)
- **Cost view**: the same terms and expected losses at the lender's own funding rate, per loan item, with its own low and high; replaces the flat 26% — *raised by:* owner; *why:* the two views should share one set of numbers; *effect:* Japan −0.07 points, EU members up to +0.07 ([loans](#view=how&sec=m-loans-the-cost-view))
- Every loan number has a **fetched source**; what could not be fetched is marked "not verified" and not used — *raised by:* owner; *why:* the same standard as round 11; *effect:* [loans evidence](#view=how&sec=m-loans-evidence), [sources_r11.json](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/sources_r11.json)
- China's crude-to-fuel ratio from **China's own measured share** per year (not India's) — *raised by:* proposed; *why:* the research file has China's own value; it is closer than India's; *effect:* China −0.005 points
- Germany's gas already in customs **derived** from the audit's EUR 2.3bn and 3.5bn — *raised by:* audit, owner; *why:* 0.07 had no derivation; *effect:* Germany −0.04 points
- Belarus's gas band from the research (±8%, ±15%) where the price is assumed — *raised by:* audit, owner; *why:* ±2% was a judgement; *effect:* none visible
- Hong Kong's precious-metals share **measured** from UN Comtrade — *raised by:* audit, owner; *why:* 0.98 was not traced; *effect:* Hong Kong +0.08 points
- Decision B: each EU loan's expected loss is **the EU's own provisioning rate** for that loan (70% for the 2022 exceptional MFA and the repurposed EIB loans; 9% where the law sets 9% or no rate) — *raised by:* owner; *why:* the EU judged 9% not adequate for Ukraine in 2022 and set 70% (Decisions 2022/1201 and 2022/1628); MFA+ and the Ukraine Facility rest on budget headroom with no rate, so 9% stays; *effect:* EU members +0.007 to +0.014 points; loans EUR 55bn instead of 53bn ([decisions](#view=how&sec=cl-r11), [loans](#view=how&sec=m-loans-by-loan-type))

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Applied in round 12 (data precision)

Each value below was a judgement or untraced, and is now measured. Effects are on the headline (% of GDP, 2022 to
August 2026, central), measured with the site's own `calc()` before and after each change, one at a time.

- loans: discount rate and default risk (net shift) — *old:* 10% for every loan (6–7% low, 13–15% high), a judgement; *new:* Ukraine's 2021 rate, 6.7%, plus the expected loss of the lender's class: IMF and World Bank 0, EU 9%, bilateral lenders the standstill (3–28% of value), Support Loan about 95%; low: no loss; high: the promised war yield of the year (38%, 40%, 24%, 17%, 15%); *evidence:* 2021 bond sales ([Ukrinform](https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html), [Interfax-Ukraine](https://en.interfax.com.ua/news/economic/758134.html)); weekly prices and yields (ICU, Eavex); standstill terms ([Government of Ukraine](https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy)); seniority ([NBER w25793](https://www.nber.org/papers/w25793)); EU provisioning ([OEIL](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888)); all on the [loans page](#view=how&sec=m-loans-evidence); *effect:* loans worth EUR 53bn instead of 64bn (of 96.5bn face). Japan −0.06 points, Sweden, Finland −0.05, France, Spain, Italy, Belgium, Denmark, Latvia −0.05 to −0.04, Germany −0.04, Canada −0.03, UK −0.03; the US −0.001
- loans: the lender's cost (cost view) — *old:* 26% of face for every loan, range ×0.5–×1.5; *new:* the same terms and expected losses at the lender's own funding rate, per loan item, with its own low and high; *evidence:* EU cost of funding ([Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf)); OECD 10-year yields ([FRED](https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01)); *effect:* cost view: EU members up (Finland +0.07, Italy, France, Belgium +0.06, Germany +0.05); Japan −0.07, Canada −0.04, UK −0.03
- China's crude-to-fuel ratio — *old:* 0.70 (judgement); *new:* China's own measured share per year, 0.72–0.82; *evidence:* [`crude_content.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/crude_content.json); *effect:* what is taken off China's own payments for the crude in its fuel exports now equals that crude's value: before, ÷ 0.70 × China's own ratio (0.72–0.82) took off up to 17% more. China −0.005 points (EUR −0.8bn). Its fuel buyers barely move (EUR +0.06bn in total, through the refiners' blended ratio; none by more than 0.006 points). The audit's proposal (India's ratio, 0.67) would have moved China the other way; China's own measured value is the closer one
- Germany's gas already in customs — *old:* 0.07 (judgement); *new:* 0.14 (2021) and 0.15 (2022), from EUR 2.3bn and 3.5bn ÷ German final-use Russian gas of EUR 16.6bn and 23.7bn; *evidence:* [audit-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit-notes.md) item 2, [`audit.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit.json); *effect:* Germany −0.04 points (EUR −1.7bn): payments to Russia fall by EUR 1.1bn (2021) and 1.8bn (2022), but the pre-war baseline falls more, so less was avoided
- Belarus gas price band — *old:* ±2% every year (judgement); *new:* ±2% to 2022, ±8% 2023–2025, ±15% 2026; *evidence:* [gas_prices-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/gas_prices-notes.md); *effect:* none visible: Belarus's range moves by 0.01 points
- `HK_METALS_SHARE` — *old:* 0.98 (not traced); *new:* 1.0 in every year: precious metals rose by more than all imports from Russia; *evidence:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&partnerCode=643&period=2023&flowCode=M&cmdCode=TOTAL,71) (2019–2025, [raw/comtrade_hkg](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/raw/comtrade_hkg)); *effect:* Hong Kong +0.08 points (EUR +0.3bn), China −0.002
- EU loans: expected loss (Decision B) — *old:* 9% for every EU loan (the usual MFA provisioning rate); *new:* the provisioning rate the EU set for each loan: 70% for the exceptional MFA of 2022 (EUR 1bn and 5bn) and the EUR 1.59bn of repurposed EIB ELM loans; 9% for the emergency MFA (Regulation 2021/947 applies); 9% kept for MFA+ and the Ukraine Facility, whose regulations set no provisioning rate (budget headroom). The owner chose the EU's own rate as the lender's expected loss; the EU judged 9% not adequate for Ukraine in 2022; *evidence:* [2022/313](https://eur-lex.europa.eu/eli/dec/2022/313/oj), [2021/947](https://eur-lex.europa.eu/eli/reg/2021/947/oj), [2022/1201](https://eur-lex.europa.eu/eli/dec/2022/1201/oj), [2022/1628](https://eur-lex.europa.eu/eli/dec/2022/1628/oj), [2022/2463](https://eur-lex.europa.eu/eli/reg/2022/2463/oj), [2024/792](https://eur-lex.europa.eu/eli/reg/2024/792/oj), [Legislative Observatory 2022/0213(COD)](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888); *effect:* EU-level loans worth EUR 49.4bn to Ukraine instead of 47.3bn (lender's cost 32.4bn instead of 28.6bn). All 27 EU members up by 0.007 to 0.014 points (Finland, France +0.014, Italy, Belgium, Sweden, Denmark +0.013); cost view +0.013 to +0.026

</details>

<h2 id="cl-r11a">Round 11b: checking every link and figure behind the sources <span class="cl-date">19 October</span></h2>
<!-- flows: loans ref flowback -->

**An audit of every source and constant.**

### What changed

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
  [decisions.md](#view=how&sec=cl-r11), each labelled data or judgement. Values that
  look wrong (for example China's crude-to-fuel ratio of 0.70) are listed as proposals, not changed.
- **Claims softened.** The 10% loan discount rate is a judgement, not "the IMF/OECD convention" (the IMF uses 5%). The 2026
  Hormuz decision is cited. The services and arms net-gain shares are now data, not judgement.
- **Certainty letters.** A refugee grade such as "A-B" now counts at its weaker letter, and Poland's refugee cost is at
  most C, because it was checked only against a press article. Czechia A → B; Germany, Lithuania, Poland B → C. No
  total's letter changes.
- **Clean-up.** The AI-guessed incentive scores are no longer in `data.json`, and their dead code is gone. Research and
  pipeline reference pages list the round-11 files, `detail.json` and the new build steps.

### Decisions

- Fix every stale figure and claim in the documentation and on the site, but **change no number on the map** — *raised by:* owner; *why:* the text had drifted from the data; changing values needs its own decision; *effect:* no total or range changes
- Cite the money-rule factors and Russia's net gain on **every part they weight**; stop showing sources that no longer produce a number — *raised by:* audit; *why:* a reader could not see where a factor came from; *effect:* source lists only
- Write down **eleven missing decisions** and every untraced constant, labelled data or judgement — *raised by:* audit; *why:* [decisions.md](#view=how&sec=cl-r11) claimed to list every choice; *effect:* new section
- Keep China's crude ratio 0.70, the loan cost band, the 10% discount rate, the single duty rate, Belarus's ±2% gas band, Hong Kong's 98% and Germany's 7% gas share as they are, and list them as **proposals** — *raised by:* audit, owner; *why:* each would change a number; *effect:* [proposals](#view=how&sec=cl-r11)
- A refugee grade such as "A-B" counts at its **weaker letter**; Poland's refugee cost at most C — *raised by:* audit; *why:* the letters overstated how much was checked; *effect:* four part letters; no total letter
- Call the 10% loan discount rate a **judgement** — *raised by:* audit; *why:* it is not a current IMF or OECD standard; *effect:* text only
- Stop publishing the AI-guessed **incentive scores** — *raised by:* audit; *why:* the view was removed in round 8 and nothing reads them; *effect:* smaller `data.json`

<h2 id="cl-r11">Round 11: every constant traced to its data <span class="cl-date">19 October</span></h2>
<!-- flows: aid loans euaid priv ref paid windfall laund sold buy services shipping companytax frozen remit gold -->

**Every input traced to its primary source; assumptions and constants written down.**

### What changed

**Assumptions backed by data.** Judgement values were checked against data and replaced where data exists
(decisions.md). Russia's net gain on services and arms now comes
from official sector profits: 0.08 → about 0.04 and 0.12 → about 0.045. Fewer lost sales to Russia count as lost
income. Partners' records of bunkers sold to ships of Liberia, Panama and the Marshall Islands no longer count as their
laundered oil. Refugee costs, remittances, donations and freight margins use budget and statistical figures. EU-level
military aid now counts where Kiel's items say it was spent: Sweden's Gripen and Ukraine's own drones, not French or
German industry. In the cost view, loans cost the lender 26% of face (was 30%) and waived duties about 0.2% (was 4%).

Headline effects (% of GDP, round 10 → round 11): Hong Kong −5.0 → −4.3, Estonia +9.6 → +9.3, Lithuania +14.8 → +14.6,
Finland +9.3 → +9.1, Belarus −17.8 → −17.6, Tajikistan −38.0 → −38.2, Malta +0.6 → +0.9, Hungary −3.9 → −4.1,
Latvia +4.2 → +4.0. Moldova stays at +5.8. Germany, Poland, the United States, the United Kingdom, France, Italy and
Sweden move by less than 0.03 points. The median range stays at about 1.9 points of GDP.

### Decisions

- Say plainly that the figures are **AI-compiled and not yet verified** — *raised by:* reader, owner; *why:* the numbers could not be traced to primary sources; *effect:* banner and sources list
- **Exact primary links** for every source; raw downloads kept in the repository — *raised by:* reader, owner; *why:* "indistinguishable from fabricated data"; *effect:* [sources_r11.json](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/sources_r11.json), [raw/](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/raw)
- **Verify** aid, GDP, refugees, trade and fuel against primary data — *raised by:* owner; *why:* trust needs checks, not assurances; *effect:* [verify_r11_aid](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/verify_r11_aid-notes.md), [verify_r11_trade](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/verify_r11_trade-notes.md)
- Back every **assumption** with data where it exists, and say where it does not — *raised by:* owner; *why:* separate data from judgement; *effect:* assumptions_r11_*.json
- Every decision written down with reasons and evidence — *raised by:* owner; *why:* this page and [decisions.md](#view=how&sec=changelog)

<details class="cl-full"><summary>Every decision in full, with evidence</summary>

#### Assumptions backed by data (round 11)

Round 11 checked the judgement values behind the rules above against data. The proposals are in four research files
([gain](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_gain-notes.md), [rules](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_rules-notes.md),
[hubs](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_hubs-notes.md), [people](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_people-notes.md)).
The research files keep their old values. `build_data.py` applies each proposals file in one step,
`apply_assumptions_r11_*()`, when the file it changes is loaded. A few are constants. No person has reviewed them yet.
Effects are on the headline (% of GDP, 2022 to August 2026, central), unless the cost view is named.

- Russia's net gain on services — *old:* 0.08 every year; *new:* 0.032–0.044; *basis:* data: Rosstat profit and return on assets by activity; *source:* [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/); *effect:* whole gain file: Tajikistan −0.24, Armenia −0.18, Kyrgyzstan −0.14, Belarus +0.18, Estonia −0.19, Lithuania −0.11
- Russia's net gain on arms — *old:* 0.12; *new:* 0.039–0.050 (high stays 0.12); *basis:* data: arms makers' margins, Rostec, Rosoboronexport; *source:* [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/); *effect:* weapons bought from Russia count about 60% less (India EUR 0.52bn → 0.19bn)
- Russia's net gain on food, wood, chemicals, steel, aluminium, other goods — *old:* judgement per group; *new:* sector profit plus export duties collected; food lower, steel higher; *basis:* data (2026 repeats 2025); *source:* [FNS/Rosstat 2021](https://www.consultant.ru/document/cons_doc_LAW_55729/df3929054ebc0ff6d666accad51e6fedca8c75fe/), [Rusal](https://www1.hkexnews.hk/listedco/listconews/sehk/2024/0426/2024042604499.pdf); *effect:* the weighted average of other goods hardly moves: 0.200 → 0.197 (2021), 0.185 → 0.167 (2022), 0.133 → 0.130 (2026)
- Ukraine's net gain on other food, other metals, wood, machinery, chemicals, other — *old:* judgement; *new:* 2021 from division profits; 2022–2026 from a proxy; *basis:* data for 2021, judgement after; *source:* [Derzhstat](https://stat.gov.ua/sites/default/files/2023-08/%D0%A0%D0%B5%D0%BD%D1%82%20%D0%BE%D0%BF%D0%B5%D1%80%20%D1%82%D0%B0%20%D1%83%D1%81%D1%96%D1%94%D1%97%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%BF%D1%96%D0%B4%D0%BF%D1%80%20%D0%B7%D0%B0%20%D0%B2%D0%B8%D0%B4%20%D0%B5%D0%BA%D0%BE%D0%BD%20%D0%B4%D1%96%D1%8F%D0%BB%20%D0%B7%20%D1%80%D0%BE%D0%B7%D0%BF%D0%BE%D0%B4%20%D0%BD%D0%B0%20%D0%B2%D0%B5%D0%BB%20%D1%81%D0%B5%D1%80%D0%B5%D0%B4%20%D0%BC%D0%B0%D0%BB%D1%96%20%D0%BC%D1%96%D0%BA%D1%80%D0%BE%D0%BF%D1%96%D0%B4%202010%202021.zip); *effect:* Ukraine's average gain 0.182 → 0.175 (2021), 0.045 → 0.042 (2023); small
- Lost sales to Russia, share not redirected — *old:* default 0.25/0.40/0.60, Finland 0.15/0.30/0.50, Baltic states 0.25/0.45/0.65; *new:* 0.20/0.35/0.55, 0.10/0.25/0.45, 0.20/0.40/0.60; *basis:* judgement on firm-level studies; *source:* [IZA DP 16146](https://repec.iza.org/dp16146.pdf); *effect:* less credit for sales given up: Finland −0.14, Czechia −0.11, Moldova −0.11, Lithuania −0.09, Estonia −0.07
- Own-industry share of military aid where no evidence exists — *old:* 0.2/0.4/0.7; *new:* 0/0.1/0.3 (Albania, North Macedonia, Montenegro only); *basis:* judgement; *source:* [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx); *effect:* none: the money ledger already replaces this share
- Where EU-level military aid is spent — *old:* SIPRI production shares × 0.78 (France 0.30, Germany 0.19...); in the ledger France 0.72bn, Germany 0.44bn, Italy 0.35bn; *new:* Sweden 0.28 (Gripen), all other members 0.03 by ASAP grants, about 0.7 to Ukraine's drone industry; all in 2026; *basis:* data (the 0.03 is judgement); *source:* [Kiel release 31](https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx); *effect:* gross flowback 2026: France 0.97 → 0.31bn, Germany 0.63 → 0.27bn, Italy 0.48 → 0.15bn, Sweden 2.81 → 2.69bn; headline +0.01 at most
- What a loan costs the lender (cost view) — *old:* 0.30 of face; *new:* 0.26 (0.09–0.47); *basis:* data (terms) and judgement (expected loss); *source:* [Council 8202/26](https://data.consilium.europa.eu/doc/document/ST-8202-2026-INIT/en/pdf); *effect:* cost view only: Japan's loans EUR 3.05bn → 2.65bn. Replaced in round 12 by a cost per loan item ([loans](#view=how&sec=m-loans-the-cost-view))
- Import duties waived for Ukraine (cost view) — *old:* 4% for the EU, UK and Canada, every year; *new:* EU 0.3% from June 2022 to June 2025, UK 0.2%, Canada 1%; the map uses their weighted average, 0.2%; *basis:* data; *source:* [OEIL 1702126](https://oeil.europarl.europa.eu/oeil/en/procedure-document-summary/pdf?id=1702126); *effect:* cost view only: EU members about −0.1 point (Poland 2.08 → 1.96)
- UAE share of fuel sold as bunkers — *old:* 0.15/0.30/0.45; *new:* 0.20/0.30/0.40; *basis:* data: Fujairah bunker sales; *source:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=784&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710); *effect:* low end of the UAE only; none on the headline
- Panama resale and bunker shares — *old:* 0/0.01/0.10, bunkers 0.05/0.20/0.50; *new:* 0/0.05/0.35, bunkers 0.30/0.40/0.50; *basis:* judgement on data; *source:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=591&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710); *effect:* none: Panama has no laundered oil left after the next row
- Partners' records of fuel "exports" to flag registries — *old:* counted as laundered oil bought by Liberia, the Marshall Islands, Panama, Malta; *new:* dropped: they are bunkers sold to ships under those flags; Malta keeps what its own customs record; *basis:* data: own against partner customs; *source:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?partnerCode=430&period=2024&flowCode=X&cmdCode=2710); *effect:* Panama +0.03; Liberia's and the Marshall Islands' laundered oil goes to zero
- Malta's bunkers in the middle case — *old:* the hub keeps 97%; *new:* keeps 1 − resale − half the bunker share; *basis:* judgement; *source:* [Eurostat](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/nrg_cb_oil?format=JSON&siec=O4600&geo=MT&unit=THS_T&nrg_bal=IMP&nrg_bal=EXP&nrg_bal=INTMARB&nrg_bal=GID_OBS&nrg_bal=TO_RPI_RO&nrg_bal=FC_E); *effect:* Malta +0.28 with the next row
- Laundered-oil cap per territory — *old:* 1% / 2% of GDP; *new:* from fuel use: Liberia 0.25%/0.85%, Togo 0.27%/0.89%, Malta 0.15%/0.4%, Panama 0.02%/0.09%; applied to the final values; *basis:* data (volumes), judgement (shares); *source:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=470&period=2023&partnerCode=0&flowCode=M,X,RX,RM&cmdCode=2710); *effect:* Togo's laundered oil EUR 0.10bn → 0.03bn a year; Malta 0.06–0.09bn → 0.035bn
- Belgian firms' profit tax in Russia, 2022 — *old:* EUR 11.8m (allocated); *new:* EUR 16m (12–35m); *basis:* data; *source:* [Brussels Times](https://www.brusselstimes.com/590174/global-corporations-pay-3-5-billion-in-taxes-to-kremlin); *effect:* tiny
- Refugee hosting cost, Romania 2023 — *old:* 0.16; *new:* 0.24 (0.20–0.32); *basis:* data; *source:* [Presshub](https://www.presshub.ro/exclusiv-romania-datoreaza-refugiatilor-ucraineni-300-de-milioane-de-lei-in-schimb-ii-trimite-la-munca-282164/); *effect:* none: refugees' taxes still exceed the cost, so the net stays at zero
- Refugee hosting cost, Bulgaria 2022 — *old:* 0.22; *new:* 0.30 (0.27–0.40) gross, minus BGN 300m paid from EU funds; *basis:* data; *source:* [Sofia Globe](https://sofiaglobe.com/?p=109602); *effect:* Bulgaria's own net cost falls to zero; −0.07
- Refugee hosting cost, Hungary 2022–2026 — *old:* 0.51 in total; *new:* 0.18 (the government's all-in total is about EUR 0.25bn); *basis:* data; *source:* [Budapest Times](https://www.budapesttimes.hu/hungary/the-biggest-relief-operation-of-hungary/); *effect:* net cost EUR 0.29bn → 0; −0.14
- Refugee hosting cost, Belgium 2022 / 2023 — *old:* 0.28 / 0.42; *new:* 0.40 / 0.55; *basis:* data (one budget line); *source:* [Brussels Times](https://www.brusselstimes.com/474292/we-cannot-afford-this-belgian-mp-condemns-colossal-ukrainian-refugee-aid); *effect:* net cost EUR 0.57bn → 0.82bn; +0.04
- Refugee hosting cost, Latvia 2023–2026, Estonia 2022, Georgia 2022 — *old:* Latvia 0.05/0.04/0.03/0.015, Estonia 0.05; *new:* Latvia 0.06/0.06/0.065/0.04, Estonia 0.06, Georgia range 0.006–0.03; *basis:* data; *source:* [LSM](https://www.lsm.lv/raksts/zinas/latvija/21.11.2024-vel-uz-gadu-pagarina-atbalstu-ukrainas-begliem-latvija.a577249/), [ERR](https://www.err.ee/1608579985/riisalo-pogenikevoog-eestisse-hakkab-stabiliseeruma); *effect:* about none: these nets stay near zero
- OECD's modelled 2022 cost as the lowest high bound — *old:* none; *new:* for hosts costed as refugees × a rate (Austria, Portugal); *basis:* judgement; *source:* [OECD IMO 2022](https://www.oecd.org/content/dam/oecd/en/publications/reports/2022/10/international-migration-outlook-2022_140ace0e/30fe16d2-en.pdf); *effect:* ranges only
- Russia's share of remittances, Tajikistan — *old:* 0.80/0.88/0.93; *new:* 0.80/0.88/0.97; *basis:* data: mirror ratio 2019–2021; *source:* [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/); *effect:* range only (low end −83.7 → −89.8)
- Russia's share of remittances, Belarus — *old:* 0.30/0.45/0.60; *new:* 0.30/0.40/0.50; *basis:* data: mirror ratio 2019–2021; *source:* [Bank of Russia](https://www.cbr.ru/statistics/macro_itm/external_sector/cbti/); *effect:* Belarus's wages from Russia ×0.889; +0.07
- Moldova's transfers from Russia 2024–2026 — *old:* 0.092 / 0.080 / 0.043; *new:* 0.07 / 0.018 / 0.008; *basis:* data: central bank, CIS remittances; *source:* [BNM](https://bnm.md/files/Anuar_CI_2023.pdf); *effect:* Moldova earns less from Russia: +0.32 (whole file)
- Private donations, 2022 — *old:* Austria 0.074, Czechia 0.096, Denmark 0.059, Finland 0.041, Japan 0.58; *new:* 0.11, 0.19, 0.13, 0.06, 0.15; also Finland and Lithuania 2023, Lithuania 2025, Latvia and Estonia low ends; *basis:* data: national totals; *source:* [Japanese Red Cross](https://www.jrc.or.jp/about/publication/news/20230207_030624.html), [Seznam Zprávy](https://www.seznamzpravy.cz/clanek/fakta-jak-valka-na-ukrajine-zmenila-cesko-cesi-jsou-nejsolidarnejsi-v-historii-226309); *effect:* Japan −0.01, Czechia +0.03, Denmark +0.02
- Hong Kong gold passed on to the mainland, 2026 — *old:* 0.372 (2025 carried); *new:* 0.675 (0.52–0.88); *basis:* data: Comtrade January–May 2026; *source:* [UN Comtrade](https://comtradeapi.un.org/public/v1/preview/C/M/HS?reporterCode=344&period=202605&partnerCode=0,643,156&flowCode=M,X&cmdCode=7108); *effect:* Hong Kong +0.80 with the next two rows; China moves little
- Freight share of import values (CIF to FOB) — *old:* 3.5%/5.5%/7.5% for every importer; *new:* OECD ITIC margin per importer for the 25 largest buyers (China 6.4%, India 7.2%, Türkiye 8.6%, Korea 9.3%), else 4.5%/6.5%/9%; *basis:* data (mostly modelled by OECD); *source:* [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015); *effect:* distant buyers pay Russia a little less: Türkiye +0.09, India +0.05 (whole file)
- Freight share of gold — *old:* 5.5%; *new:* 0.1%/0.5%/2%; *basis:* data: Türkiye's reported margin; *source:* [OECD ITIC](https://sdmx.oecd.org/sti-public/rest/data/OECD.SDD.TPS,DSD_ITIC@DF_ITIC,1.1/.RUS.C_F..HS17_27+HS17_2709+HS17_2710+HS17_2711+HS17_7108+_T.A.?startPeriod=2015); *effect:* gold passed on by the UAE and Hong Kong keeps its full value

**Left out, and why.**

- **Loans per class** (Japan's IBRD guarantees cost it about 0.05 of face, not 0.26). The map held one loan total per
  donor, not loans by class, so one value was used. Applied in round 12: each loan item now has its own lender's cost
  ([loans](#view=how&sec=m-loans-the-cost-view)).
- **Duties per country and period.** The map's cost view applies one rate to all three waivers. The weighted average
  keeps the 2022–2026 total right, but not the split between the EU, the UK and Canada, or by year.
- **Redirection fading after three years** (×0.7 for 2025–2026). It is optional in the proposal, and the money-rule
  factor is one value for all years.
- **Gibraltar's half bunker share.** Its fuel already counts at 10% for the same reason (bunkers paid by shipowners), so
  this would count the bunkers twice.
- **Romania's EU reimbursement.** Its donor-funded share already covers EU funds.
- **Gold freight for gold bought directly** (the UAE's own, Türkiye, Switzerland, India). The map does not separate it
  from other goods; only gold passed on by the UAE and Hong Kong is tagged.
- **The data-based use of Liberia, Panama and the Marshall Islands** (EUR 2–13m a year in the proposal). It is a cap, not
  a value; with the bunker records dropped, these registries keep no laundered oil.
- **Bahamas and other flag states.** Greece's records of exports to them look the same, but their own customs were not
  checked.
- **Confirmed and kept:** hub resale shares for the Netherlands, Belgium, Greece, Malta, Singapore, Türkiye, India,
  Togo and Gibraltar; payment-agent fees; Greek shadow-fleet freight; other company taxes; extra sales to Russia, weapons,
  tourism and shadow-shipping factors; refugee costs of Ireland, the UK and Moldova; Canadian and US donations; Hong
  Kong's 2022–2025 onward shares; the Marshall Islands' and Gibraltar's caps.

#### Constants and rules written down in round 11

A traceability audit in round 11 found choices that change a number but were not on this page, and constants in the
code that no research file explains. They are listed here, labelled **data** (traced to a file or a source) or
**judgement** (a choice someone made, which can be argued with). None of the values was changed by the audit. Line
numbers are those of the round-11 audit version of [`build_data.py`](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/build_data.py) and
[`site/index.html`](https://github.com/intelligent-cream/war-balance/blob/main/site/index.html).

#### Decisions that were not written down

- **Euroclear and Clearstream**: a third of the return denied on reserves they hold goes to the host (Belgium, Luxembourg), two thirds to all EU members by their share of EU-level aid — *data or judgement:* judgement (owner, round 7); *why:* the freeze is an EU decision, but the host carries the legal risk. It moves Belgium by about 1.2 points of GDP (review 5's estimate; this row said 0.8 until round 16). Since round 16 the return is its own line, in the net only; *where:* `HOST_SHARE`, build_data.py:2530; [frozen reserves](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves)
- **Default ranges per certainty letter**: A ±5%, B ±15%, C ±35%, D ±70% — *data or judgement:* judgement; *why:* a part with no range of its own still needs one; the widths grow with how little was checked; *where:* `RANGE`, index.html:518; [ranges](#view=how&sec=m-ranges-certainty-letters)
- **Baseline and actual values correlated 0.5** inside `spread()` — *data or judgement:* judgement; *why:* both come from the same statistics office, so their errors partly cancel; not measured; *where:* index.html:615; [ranges](#view=how&sec=m-ranges-quadrature-for-traded-flows-spread)
- **Letters fixed in `calc()`**: gold and hidden payments always D, Russian oil bought via other countries always C, the share of EU-level aid always B — *data or judgement:* judgement; *why:* every buyer's value in these parts is modelled the same way; *where:* index.html:680, :687, :695; [ranges](#view=how&sec=m-ranges-certainty-letters)
- **Laundered-oil cap of 1% (middle) and 2% (high) of GDP a year**, where fuel use is not measured — *data or judgement:* judgement; *why:* ship registries and storage points cannot use the fuel the model assigns them. Still applies to the Marshall Islands and Gibraltar; *where:* `LAUNDERED_CAP`, build_data.py:366; [energy](#view=how&sec=m-energy-and-laundered-oil-valuing-and-capping)
- **Hub trading margins**: goods 5–20%, UAE 3–15%, gold 0.3–6%, Belarus 10%, Baltic states 7% — *data or judgement:* judgement ("an educated guess" in the research); *why:* a hub that passes goods on keeps only its margin; *where:* [trade](#view=how&sec=m-trade-re-export-hubs), [reexports-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/reexports-notes.md)
- **Non-reporting partners: only the paid share counts** — *data or judgement:* data per country, judgement in the rule; *why:* Russian supplies given on credit or as aid are Russian support, not money to Russia; *where:* build_data.py:616; [nonreport-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/nonreport-notes.md)
- **Private donations where no national total exists**: 0.015% of GDP (Western donors), 0.03% (Central and Eastern Europe), 0.06% (Baltic states) for 2022 — *data or judgement:* judgement; *why:* scaled on the countries with national totals; *where:* [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md); [aid](#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations)
- **Countries with no aid record**: 0, with an upper bound of 0.002% of 2022 GDP (less in later years) — *data or judgement:* judgement; *why:* nobody is assumed to have given nothing for certain; *where:* [aid_gaps-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/aid_gaps-notes.md) item 4
- **2026 no-war price = the actual world price** (the Hormuz closure) — *data or judgement:* judgement; *why:* the 2026 price spike came from the closure of the Strait of Hormuz, not from Russia's war. The research left this open: keeping the pre-invasion path would count the spike as windfall (over half of India's); *where:* `NW_WORLD_2026`, build_data.py:1747; [prices](#view=how&sec=m-prices-no-war-prices), [energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) open question 2
- **Gold colour and outline**: a country is gold when its total is negative mainly because it earned from the war effort; the outline needs at least EUR 10m and 0.05% of GDP — *data or judgement:* judgement (owner, round 6); *why:* earning from supplying Ukraine is not money toward Russia; the threshold hides rounding noise; *where:* index.html:761–762; [overview](#view=how&sec=m-overview-two-numbers)
- **Rankings leave out economies under EUR 5bn GDP** — *data or judgement:* judgement; *why:* small economies' trade data are noisy and would fill the top of a % of GDP list; *where:* `MIN_GDP_RANK`, index.html:1530
- **Loan cost range in the cost view**: half to one and a half times the grant equivalent (13%–39% of face) — *data or judgement:* judgement; **data since round 12**; *why:* replaced by each country's own low and high lender's cost (`loans_grant_eq_lo`, `loans_grant_eq_hi`), from the expected losses per creditor class ([loans](#view=how&sec=m-loans-the-cost-view)); the half-to-one-and-a-half band is only a fallback; *where:* index.html:714
- **10% discount rate for loans** — *data or judgement:* judgement; **data since round 12**; *why:* replaced by Ukraine's measured 2021 rate (6.7%: its 6.875% and 6.30% bond sales) plus measured expected losses, with the promised war yield of each year as the high end (38% in 2022, 40% in 2023, 24%, 17%, 15% after; from 72 weekly ICU price reports and 106 weekly Eavex yield tables). The IMF's 5% and the old 10% are no longer used; *where:* [loans](#view=how&sec=m-loans), [loans_value-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/loans_value-notes.md)
- **One duty rate for all three waivers** (EU, UK, Canada), weighted by purchases — *data or judgement:* judgement; *why:* the map holds one rate (`META.tariff_rate`); see "Left out" above; *where:* `TARIFF_RATE_YEARS`, build_data.py:61
- **Refugee letters**: a grade such as "A-B" counts at its weaker letter; Poland's refugee part at most C — *data or judgement:* judgement (round 11 audit); *why:* Poland's and Czechia's costs were checked only against press articles ([verify_r11_aid-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/verify_r11_aid-notes.md)). Czechia A → B, Poland, Germany and Lithuania B → C; no total's letter or value changes; *where:* `REFUGEE_CERT_CAP`, build_data.py:2350

#### Constants in the code

- build_data.py:323 — *constant:* `EUR_PER_MT_2021`: crude 0.414, products 0.549, gas and LNG 0.583, coal 0.130 EUR bn per Mt; *status:* data; *basis:* CREA's 2021 value for Germany by fuel ([`crea.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/crea.json)) ÷ the tracker's 2021 tonnes ([`energy.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy.json)): 9.065/21.935, 4.057/7.393, 18.177/31.167, 0.831/6.37
- build_data.py:345, :955 — *constant:* China's fuel = crude value ÷ China's own crude share of its fuel exports per year (0.72, 0.75, 0.82, 0.76, 0.75 in 2022–2026); *status:* **data** (round 12; was 0.70, a judgement); *basis:* `crude_k(y, "CHN")` in [`crude_content.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/crude_content.json) ([notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/crude_content-notes.md)); see [round 12](#view=how&sec=cl-r12)
- build_data.py:3102 — *constant:* `HK_METALS_SHARE`: 1.0 every year (the precious-metals share of Hong Kong's rise in imports from Russia); *status:* **data** (round 12; was 0.98, not traced); *basis:* UN Comtrade, Hong Kong's imports from Russia, HS 71 and total, 2019–2025 ([raw/comtrade_hkg](https://github.com/intelligent-cream/war-balance/tree/main/research/2026-10/raw/comtrade_hkg)); see [round 12](#view=how&sec=cl-r12)
- build_data.py:1622, :1627 — *constant:* `GAS_IN_CUSTOMS`: Türkiye 1.0, Poland 1.0; `GAS_UNLABELLED`: Germany EUR 2.3bn (2021), 3.5bn (2022), so a share of 0.14 and 0.15; *status:* **data** (Germany since round 12; was 0.07, a judgement); *basis:* [audit-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit-notes.md) items 1, 2 and 8 and the flags in [`audit.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit.json); see [round 12](#view=how&sec=cl-r12)
- build_data.py:3103 — *constant:* Gibraltar keeps 10% (5–30%) of its Russian fuel; *status:* judgement; *basis:* a reseller's margin, as for other hubs; bunkers are paid by shipowners elsewhere
- build_data.py:3124 — *constant:* Malta's services bought from Russia 0.127, 0.133 (2021–2022), ±35%; *status:* data, band judgement; *basis:* the map's own 2021–2022 values and the 2023–2026 fix in [`round4b.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/round4b.json) `artefacts.MLT`; ±35% is the width of letter C
- build_data.py:180 — *constant:* Malta's own fuel imports, low ×0.76, high ×1.43; *status:* judgement; *basis:* the band of the model's laundered-oil values, applied to Malta's own customs figure
- build_data.py:222 — *constant:* Hungary's refugee cost, low ×0.6, high ×1.5; *status:* data (proposal); *basis:* `range_factor` in [`assumptions_r11_people.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_people.json)
- build_data.py:2527 — *constant:* `BEL_EUROCLEAR_TAX`: 2024 1.7, 2025 1.0, 2026 0.5; *status:* 2024–2025 data, 2026 judgement; *basis:* [frozen_assets-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/frozen_assets-notes.md) item 3 (Belga); 2026 is "a guess"
- build_data.py:2563 — *constant:* frozen-reserve return, low end ×0.8; *status:* judgement; *basis:* Russia would have spent part of the reserves; the notes guess 10–30%
- build_data.py:918 — *constant:* EU laundered oil ×0.62 (0.5–0.8); *status:* middle data, band judgement; *basis:* 0.62 = 1 ÷ 1.6, Global Witness's 35m barrels against the model ([audit-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit-notes.md) item 4); the Global Witness report itself is not linked
- build_data.py:1752–1786 — *constant:* `GAS_FORMULA`, `LNG_FORMULA` weights (Türkiye 0.7/0.3, Greece, Bulgaria, North Macedonia, Moldova 0.5/0.5, default 0.75/0.25, Taiwan and China LNG 0.5/0.5); *status:* contract types data, mixed weights judgement; *basis:* [energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) section 2 and its note that the hub shares are "judgement calls"; Türkiye from [turkey_prices-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/turkey_prices-notes.md)
- build_data.py:1979 — *constant:* services trend bounds kept within ×2.5 of the middle; *status:* judgement; *basis:* tiny or noisy series give extreme fitted bounds
- build_data.py:1991 — *constant:* company-tax trend fallback 1.045; *status:* data; *basis:* `trend2.json` global central ([trend2-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/trend2-notes.md))
- build_data.py:1669 — *constant:* Belarus gas price ±2% (2019–2022), ±8% (2023–2025), ±15% (2026); *status:* ±2%: judgement on a published dollar price; ±8% and ±15%: **data** (round 12; was ±2% for every year); *basis:* [`gas_prices-notes.md`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/gas_prices-notes.md) (the range rule for customs prices); see [round 12](#view=how&sec=cl-r12)
- build_data.py:1673 — *constant:* Tajikistan's 2021 price band ±3%; *status:* judgement; *basis:* its 2021 band came from a fixed ratio that cancels in the index
- build_data.py:2239 — *constant:* `conduit` Kazakhstan 3.5, Netherlands 4.7; *status:* data; *basis:* Polymetal's transfer, EUR 3.5bn (1.7–6.0), and Yandex in [company_flows-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/company_flows-notes.md); the notes' table rounds Kazakhstan to 3.6
- build_data.py:3062 — *constant:* freight share per importer, low ×0.7, high ×1.4; *status:* judgement (in the proposal); *basis:* the rule in [`assumptions_r11_people.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_people.json) `CIF_SHARE`
- build_data.py:76 — *constant:* `USD_PER_EUR` 2022–2024; *status:* data; *basis:* ECB annual averages ([trade-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/trade-notes.md))
- build_data.py:1611 — *constant:* `MWH_PER_BCM = 10.55e6`; *status:* data; *basis:* 10.55 kWh per m3, gross calorific value, as in `energy2.json` and `gas_prices.json`
- build_data.py:3481 — *constant:* UAE customs fuel taken off CREA's: 0.37, 0.62, 0.19 (2024–2026); *status:* data; *basis:* [round4b-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/round4b-notes.md); 2026 is 0.19, not 0.26, because the addition cannot fall below zero

#### Proposals that would change numbers (not applied)

The audit found these values questionable. Six of its seven proposals were applied in round 12 (next section). This one
is left as it is until someone decides. The expected effect is a rough estimate.

- one duty rate for the EU, UK and Canada (0.2%) — *proposal:* one rate per waiver; *expected effect:* cost view only, tiny: the EU's purchases dominate the average, so EU members barely move (the split by year changes); the UK about the same; Canada's very small part about five times larger

</details>

<h2 id="cl-r9-10">Rounds 9–10: what readers asked <span class="cl-date">18 October</span></h2>
<!-- flows: paid windfall laund buy rusfirms statefin gold -->

**Readers' questions on Reddit: the net-gain rule and more.**

### What changed

#### Round 10

**Trade counts at the seller's net gain.** Aid is a gift and counts in full; trade is an exchange, so a purchase from
Russia now counts at Russia's net gain on it (its taxes plus profit above a normal return: about 0.6 of the price for
oil and gas, 0.1–0.2 for other goods, 0.08 for services, 0.12 for arms), and an extra purchase from Ukraine at
Ukraine's (0.045 in 2023 to 0.18 before the war). The war-time price premium, taxes and profits paid to Russia and aid
still count in full ([overview.md](#view=how&sec=m-overview-the-net-gain-rule)). Suggested by a reader on Reddit.

**Russian-owned plants abroad.** Metals, mining and chemicals subsidiaries (Rusal's Aughinish in Ireland and KUBAL
in Sweden, NLMK, EuroChem, Uranium One) added to the profits sent to Russia; the amounts are small
([russia-state-and-companies.md](#view=how&sec=m-russia-state-and-companies-russian-owned-companies-abroad)).

**Shareable views.** The address keeps the view and the buttons on top (`#view=rank&lens=ukr&m=total`); flow lines
are on at start; the names of Ukraine and Russia are drawn above the flow lines ([README](#view=how)).

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

#### Round 9

**Russian crude in fuel refined elsewhere, measured.** The share of a refined fuel's price that reaches Russia for its
crude is now measured per refiner (India, Türkiye, China, Brunei) and year from Russia's realised crude prices and the
refiners' fuel export prices, instead of one ratio of 0.42 / 0.50 / 0.60 for everything: 0.63–0.82 after the invasion,
about 0.9 before it ([energy-and-laundered-oil.md](#view=how&sec=m-energy-and-laundered-oil-valuing-and-capping)). The buyer is charged the crude money,
the refiner keeps the rest of the price and its discount profit. The higher pre-war share raises the pre-war level too,
so most buyers move little: Australia 0.00 → −0.03, India −5.5 → −5.2, Türkiye −5.0 → −4.9, Tanzania −2.7 → −3.5.

### Decisions

- Check whether Australia's fuel from Russian crude is fair — *raised by:* reader; *why:* Australia's net of about zero looked wrong; *effect:* investigated
- The **buyer whose demand creates the sale** pays the crude money; the **refiner keeps the rest and its discount profit** — *raised by:* owner; *why:* follows the money: who paid, who profited; *effect:* kept as is
- **Measure the crude share** per refiner and year instead of a fixed 50% — *raised by:* owner; *why:* "find the real numbers, not fictional ones"; *effect:* 63–82% after the war, about 90% before
- **Trade counts at the seller's net gain** (taxes plus profit above a normal return); aid in full — *raised by:* reader, owner; *why:* a purchase is an exchange, aid is a gift; *effect:* everyone moves toward zero, ranges halve
- The same rule for **purchases from Ukraine** — *raised by:* owner; *why:* one rule for both sides; *effect:* Ukraine's gain 5–18 cents per euro
- **Russian-owned plants abroad** (Aughinish in Ireland and others) — *raised by:* reader; *why:* Rusal's Aughinish was missing; *effect:* small amounts added
- **Weighting by scarcity** (tanks count double) **not** adopted — *raised by:* reader suggested, owner declined; *why:* arbitrary multipliers; market value already reflects scarcity; *effect:* roadmap: a separate "share of own stock given" marker
- Full **audit** of rounds 9–10, all confirmed bugs fixed — *raised by:* owner; *why:* trust; *effect:* price double count, LNG, refiners, Rosatom, gold fixed

<h2 id="cl-r8">Round 8: narrower ranges and the interface <span class="cl-date">18 October</span></h2>
<!-- flows:  -->

**Narrower, tested ranges and a new interface.**

### What changed

**Narrower ranges for pipeline fuel buyers.** The no-war band for payments to Russia measured on physical fuel
volumes: Germany, Hungary, Slovakia, Czechia, Poland, Finland and North Macedonia get narrower ranges; Hungary's range
no longer crosses zero. Poland's no-war path drops its Yamal gas from 2023 (ended by a 2019 decision): +9.2% → +8.1%
([counterfactual.md](#view=how&sec=m-counterfactual-pipeline-fuel-buyers)).

### Decisions

- No-war band for pipeline fuel buyers measured on **physical volumes** — *raised by:* owner; *why:* ranges for "less paid to Russia" were huge; *effect:* Germany, Hungary, Poland narrower
- **Remove the "above or below expectation" view** — *raised by:* owner; *why:* it rested on AI guesses, not data; *effect:* view removed
- Dark design by default with a light switch; flow lines on; Ukraine's name readable on phones — *raised by:* owner; *why:* the light theme did not work; the label was hidden; *effect:* new design
- Links keep the view, filters and year — *raised by:* owner; *why:* readers asked for direct links; *effect:* shareable links

<h2 id="cl-r7">Round 7: what the owner asked to add <span class="cl-date">18 October</span></h2>
<!-- flows: paid windfall frozen remit markers -->

**Frozen reserves, remittances, critical goods and no-war energy prices.**

### What changed

The [round 7 roadmap](#view=how) in full:

- **No-war energy prices**: fuel payments and the war-time windfall are compared with the prices a no-war market
  expected (pre-invasion forecasts and futures), not 2019–2021 prices; 2026 against actual world prices (the Hormuz
  spike was not caused by this war); a negative windfall where Russia sold below those prices. The windfall falls
  from EUR 455bn to roughly a third ([prices.md](#view=how&sec=m-prices-no-war-prices)).
- **Frozen Russian reserves**: the return they would have earned for Russia, credited to the holders; Euroclear a
  third to Belgium and two thirds to all EU members ([russia-state-and-companies.md](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves)).
- **Remittances from Russia**: migrant workers' wages at the money rule; relocants' transfers and living spending left
  out ([trade.md](#view=how&sec=m-trade-remittances-and-relocants)).
- **Critical-goods marker**: sales to Russia of goods its weapons need, shown as ◆, not in the totals
  ([trade.md](#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker)).
- **Narrower figures**: national statistics for nine countries; the band for imports from Russia re-measured.

Headline effects (% of GDP, develop → round 7): Tajikistan −6.4 → −45.1 (remittances, certainty D), Uzbekistan
−9.5 → −18.1, Hungary −7.6 → −4.5, Slovakia −1.2 → +3.5, Lithuania +22.5 → +27.8, Germany +4.2 → +5.2, Poland
+7.3 → +9.2, Belgium +2.1 → +4.2. Ranges grew a little overall (median width 4.3 → 4.8 points), because fuel valued
at no-war prices makes the amounts larger.

### Decisions

- Germany's cut of Russian gas counts **in its favour** — *raised by:* owner; *why:* it was a voluntary stance against Russia; *effect:* kept as is
- **Frozen Russian reserves**: the yearly return Russia lost (3–4% a year), credited to holders — *raised by:* owner; *why:* holding them denies Russia income; *effect:* Belgium, EU members up
- **Critical goods** (chips, machine tools) as a **marker**, not in the totals — *raised by:* owner; *why:* already inside trade; a marker shows it without double counting; *effect:* ◆ on the map
- **No-war energy prices** (pre-invasion forecasts and futures), not 2019–2021 prices — *raised by:* owner; *why:* market prices were already rising before the war; *effect:* windfall about a third of before
- **Remittances** from Russia counted; **relocants'** transfers and spending left out — *raised by:* owner, proposed; *why:* migrants' wages are money from Russia; relocants spend their own money; *effect:* Tajikistan, Uzbekistan toward Russia ([why](#view=how&sec=cl-why-remittances-from-russia))
- **Oil discount gain without Russia's normal pre-war discount** (about 5% below Brent) — *raised by:* proposed; *why:* that part of the discount existed before the war; *effect:* India 34 → 24bn, China 25 → 18bn in the cost view ([why](#view=how&sec=cl-why-energy-switching-cost-and-oil-discount))
- Narrower actual values for nine countries from national statistics — *raised by:* owner; *why:* ranges were too wide; *effect:* narrower ranges

<h2 id="cl-r6">Round 6: one rule for money, two balances <span class="cl-date">18 October</span></h2>
<!-- flows: loans ref flowback mil agents gold -->

**An all-money ledger and two balances.**

### What changed

The [round 6 roadmap](#view=how) in full. The main change is a fairer count of money earned from the war effort:

- **Two balances:** each country has a balance with Ukraine (what it gave minus what it earned from the war effort) and
  one with Russia; the headline adds them. A country that earned more from the war effort than it gave gets a gold
  outline, and gold fill when that makes its total negative; that is never counted as money toward Russia
  ([overview.md](#view=how&sec=m-overview-two-numbers)).
- **The money rule:** money paid out counts in full; money earned (flowback, sales and services to Russia, freight for
  Russian oil) counts as value kept in the economy (OECD TiVA) × the share that is genuinely extra. It replaces the flat
  20% profit ([overview.md](#view=how&sec=m-overview-one-rule-for-every-seller)).
- **The all-money ledger:** every euro that reached Ukraine followed to the economy where it was spent, including
  purchases that replaced donated weapons and aid spent on energy, relief and rebuilding. The US earns back EUR 44bn of
  94bn given, Germany 10 of 78 ([aid-refugees-military.md](#view=how&sec=m-aid-refugees-military-flowback)).
- **Ranges:** the 2022–2026 total's range measured directly on the back-tests (about as wide as before); own bands for
  Mongolia, Yemen, Tajikistan and Moldova; Moldova without Transnistria's unpaid gas (range −14…+74% → +8…+36%)
  ([counterfactual.md](#view=how&sec=m-counterfactual)). Trade with Ukraine back to 2021 held flat after more back-tests.
- **Data gaps closed:** payment agents' fees; North Korea and Iran military support at certainty C; 18 more buyers of
  Russian arms and Iran's drones counted once; Brunei's refinery at its true Russian crude intake and Russian fuel
  relabelled in Turkish ports; shadow-fleet shares from evidence; Belarus's loan deferrals net of refinancing; company
  taxes checked against company reports.
- **Display:** ranges as a pale band behind each bar, readable on phones and in dark mode.

Headline effects (% of GDP, develop → round 6): Kyrgyzstan −15.3 → −23.3, Armenia −7.8 → −13.4, Georgia −12.0 → −16.0
(payment agents, money rule), Belarus −23.7 → −28.6, North Korea −36.8 → −30.0, Brunei +6.6 → −4.8, Moldova +16.9 →
+19.3 (range now above zero), Bulgaria +1.7 → +0.7 and Czechia +2.4 → +1.9 (gold outline: they earned more from the war
effort than they gave). Large donors barely move: US +0.61 → +0.51, Germany +4.26 → +4.23, Poland +7.1 → +7.3.

### Decisions

- **The money rule**: money earned counts at value kept × genuinely extra — *raised by:* proposed; *why:* a flat 20% profit was arbitrary; *effect:* flowback and sales revalued
- **Two balances**: with Ukraine and with Russia; earning from the war effort is never "toward Russia" — *raised by:* owner; *why:* a donor whose industry earned more than it gave is not pro-Russian; *effect:* gold colour for net earners
- **All-money ledger**: every euro for Ukraine followed to where it was spent — *raised by:* proposed; *why:* the US spends much of its aid at home; *effect:* US earns back about half
- **Payment agents' fees** and revalued **military support to Russia** — *raised by:* proposed; *why:* money and arms reaching Russia; *effect:* new parts ([why: payment agents](#view=how&sec=cl-why-payment-agents))
- Belarus's Russia-granted **loan deferrals left out**; sanction-blocked arrears labelled — *raised by:* proposed; *why:* not the borrower's choice; *effect:* Belarus, Viet Nam corrected ([why](#view=how&sec=cl-why-rosatom-and-russian-state-loans))
- Moldova **without Transnistria's unpaid gas** — *raised by:* proposed; *why:* it is support for Transnistria, not money to Russia; *effect:* Moldova higher

<h2 id="cl-r5">Round 5: values at their real worth <span class="cl-date">18 October</span></h2>
<!-- flows: aid loans ref flowback laund shipping rusfirms statefin rusarms -->

**Weapons at market value, loans as gifts and more values at their real worth.**

### What changed

The [round 5 roadmap](#view=how) in full. Research:

- **New money flows to Russia:** Russian arms sales against the expected level; Rosatom construction and Russia's state
  loans; exit payments of companies leaving Russia; profits of Russian-owned companies abroad
  ([russia-state-and-companies.md](#view=how&sec=m-russia-state-and-companies)).
- **Aid valued for Ukraine:** loans at their economic value (grant element at 10%), multilateral lending by
  shareholding, donated weapons at market value, refugees at net cost (minus their taxes), Poland's refugee spending
  corrected ([aid-refugees-military.md](#view=how&sec=m-aid-refugees-military)).
- **Flowback:** arms Ukraine bought abroad count for the seller (Czechia, Bulgaria, the US).
- **Better data:** tanker freight by real controller; laundered oil per EU member from customs; Türkiye's prices from
  contract terms and EPDK volumes; actual January–August 2026 trade for 32 economies; ERA loans in the year paid;
  Belarus's re-exports and its own error band.
- **Code:** measured correlations between parts' errors; one price base (2019–2021); bars from zero with capped range
  lines; data-coverage notes load after the map; data text translatable.

Headline effects: Poland +10.0% → +7.1% of GDP (refugees), Türkiye −6.0% → −6.6% (prices), Hungary −6.7% → −7.6%,
Germany +4.8% → +4.3%, Japan +0.91% → +0.76% (loans), Belarus's range −79% to +51% → −58% to +19%.

### Decisions

- **Donated weapons at market value** — *raised by:* proposed; *why:* book values of old stock are arbitrary; *effect:* donors' aid revalued
- **Loans at their grant element** (10% discount rate) — *raised by:* proposed; *why:* a repaid loan costs less than a grant; *effect:* loan-heavy donors lower
- **Refugees at net cost** (minus refugees' taxes) — *raised by:* proposed; *why:* working refugees pay taxes; *effect:* hosts with high employment lower
- **Rosatom projects, Russian state loans, company exits, Russian-owned firms abroad** counted — *raised by:* proposed; *why:* money reaching Russia outside trade; *effect:* new parts ([why: Rosatom and state loans](#view=how&sec=cl-why-rosatom-and-russian-state-loans), [company exits](#view=how&sec=cl-why-companies-leaving-russia))
- **Russian arms sales** to other countries counted, against the expected level — *raised by:* proposed; *why:* arms are almost wholly outside customs data; buyers who cut purchases moved toward Ukraine, those who kept buying paid Russia; *effect:* new part: India, China, Egypt, Algeria toward Ukraine, Iran toward Russia ([why](#view=how&sec=cl-why-weapons-bought-from-russia))
- **Laundered oil per EU member** from customs data — *raised by:* audit; *why:* the EU-wide split was wrong per member; *effect:* EU members corrected
- **Arms Ukraine bought abroad** counted as money flowing back — *raised by:* proposed; *why:* a seller earns from them; *effect:* Czechia, Bulgaria earn back

Decided not to do:

- **Wider ranges for Russia-side shocks.** The counterfactual's ranges stay at their tested 90% for normal periods.
  Stretching them for a rare Russia-side shock would blur the result more than it adds honesty, since the map already
  uses a real prediction rather than a flat 2021 level. See [method/counterfactual.md](#view=how&sec=m-counterfactual).
- **Pre-war forecasts as model inputs.** The counterfactual uses actual 2022–2026 GDP and trade: if a country's
  economy shrank because of the war, it would have traded less with Russia anyway, and that is not a choice the map
  should credit or blame.

<h2 id="cl-r3-4">Rounds 3–4: profit, windfall and a tested baseline <span class="cl-date">17–18 October</span></h2>
<!-- flows: loans undisc ref paid windfall laund sold services shipping companytax gold -->

**Profit instead of revenue, the war-time windfall and a no-war baseline tested on past years.**

### What changed

#### Round 4 review fixes

Applied after a review of round 4 (section "Review fixes" in the [research log](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/README.md)):

- UAE customs figures applied after `narrow.json` (UAE −0.5% → −1.5% of GDP).
- Services counterfactual capped at the model's recovered level (Montenegro +10.8% → +5.4%) → [counterfactual](#view=how&sec=m-counterfactual-6-which-model-is-used-for-which-flow).
- Windfall and payments price index from each year's actual fuel share (India −4.6% → −5.1%) → [prices](#view=how&sec=m-prices).
- Pre-war re-exports taken out of hubs' 2021 values; pre-war laundered oil through the hub chain; laundered-oil GDP cap for all countries.
- Gibraltar keeps a 10% bunker margin (−18.9% → −1.4%); Kyrgyzstan's hidden gold passed to its buyers via [`kgz_gold.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/kgz_gold.json) (−30.5% → −15.1%).
- `*` also on payments with estimated 2026 trade; method text describes the windfall.

Headline numbers after these fixes (2022–Aug 2026, % of a year's GDP): Germany +4.8%, Poland +10.0%, China −1.6%, India −5.1%, Hungary −6.7%, UAE −1.5%.

#### Round 4

**Back-tested counterfactual and method fixes, 18 October 2026.**

- **War-time price windfall** on Russian fuel counted toward Russia → [prices](#view=how&sec=m-prices-war-time-windfall).
- **Profit, not revenue** on sales to Russia (20%) → [trade](#view=how&sec=m-trade-profit-not-revenue).
- **Baltic and Finnish pass-through** taken out before and after the war → [trade](#view=how&sec=m-trade-baltic-and-finnish-pass-through).
- **Ranges in quadrature** (baseline and actual values correlated 0.5) instead of stacked worst cases → [ranges](#view=how&sec=m-ranges-quadrature-for-traded-flows-spread).
- **2026 labelled year to date**; estimated parts marked `*`.
- **Company taxes**: profit tax plus half of other taxes, 2018–2021 base.
- **China's refined exports** counted once; **pre-war laundered oil** as a baseline → [energy](#view=how&sec=m-energy-and-laundered-oil-pre-war-laundered-oil).
- **Own customs prices** for 102 countries (`prices.json`); Turkey kept on benchmarks pending review.
- **UAE trade** from its customs totals; **refugee costs** from budgets for 27 hosts; **Belarus** taken out of the residual spread; **artefacts** in small countries fixed.
- **Counterfactual**: 16 models back-tested from 2008, 2013 and 2016; exports to Russia and Ukraine trade follow a nowcast, the rest holds 2021; ranges 1.5–2× wider → [counterfactual](#view=how&sec=m-counterfactual).

#### Round 3

**Prices, transit gas, hubs, trends and two audits, 17–18 October 2026.**

- **Pre-war prices**: every traded flow divided by its price level, so changes compare volumes → [prices](#view=how&sec=m-prices).
- **Transit gas** counted where it is used; **gas prices per country** → [energy](#view=how&sec=m-energy-and-laundered-oil-transit-gas).
- **Hub resale** of refined products; customers of the UAE, India, Turkey, Togo, Gibraltar and Panama; Turkey's and India's refined exports counted once.
- **Re-exports through 11 trade hubs** moved to the countries that made the goods → [trade](#view=how&sec=m-trade-re-export-hubs).
- **Tanker shipping** as profit, with the services overlap removed; **freight** taken out of import values (CIF to FOB) → [shipping](#view=how&sec=m-services-shipping-companies-shipping).
- **Pre-war trends** (`trend.json`, `trend2.json`): the first counterfactual beyond a flat baseline → [counterfactual](#view=how&sec=m-counterfactual-2-four-generations-of-models).
- **First audit** of 31 countries: gas double counts (Turkey 220 → 184.5bn), ERA loans out of aid, EU Support Loan guarantors, Denmark, laundered oil × 0.62 for the EU.
- **China's military support** only where not in recorded trade → [military](#view=how&sec=m-aid-refugees-military-military-support-to-russia).
- **Narrower ranges** for 16 countries from official statistics; a base-range bug for pipeline-gas countries fixed.
- **Refined estimates** for shadow-fleet control, re-export shares, Togo's buyers and gold routes.
- **Second audit**: UAE gold and fuel, France's undisclosed aid, Russia's structural import gap, trend windows, border-priced freight; Baltic transit measured.
- Headline measure set to the 2022-to-year total as % of one year's GDP.

### Decisions

- Sales **to** Russia count as the seller's **profit**, not revenue — *raised by:* audit; *why:* Cyprus and Lithuania had been inflated by gross sales; *effect:* big drop for service exporters
- Ranges combine uncertainty sources **in quadrature** — *raised by:* proposed; *why:* adding worst cases overstated ranges; *effect:* narrower, honest ranges
- **War-time price windfall** on Russian fuel counts toward Russia for every buyer — *raised by:* proposed; *why:* the extra price is money Russia got only because of the war; *effect:* Hungary, Slovakia, Türkiye toward Russia
- **Expected trade without the war** from models back-tested on 2008, 2013 and 2016 — *raised by:* proposed; *why:* holding 2021 flat had no tested error; *effect:* counterfactual with measured error
- **Sanctions label**: how much of the move away from Russian trade was required — *raised by:* owner; *why:* buying less because it is banned is different from choosing to; *effect:* label only, totals unchanged
- **Baltic and Finnish transit** removed — *raised by:* audit; *why:* goods passing through are not those countries' purchases; *effect:* Baltic figures corrected
- **France's undisclosed aid** for 2022–23 taken out — *raised by:* audit; *why:* Kiel already holds it (it adopted France's official figure in Release 16), so it counted twice; *effect:* France −1.3bn ([why](#view=how&sec=cl-why-undisclosed-military-aid))
- Linked **documentation** for every method — *raised by:* owner; *why:* readers must be able to check the method; *effect:* docs/ folder

<h2 id="cl-r1-2">Rounds 1–2: the question and the first map <span class="cl-date">17 October</span></h2>
<!-- flows: aid euaid undisc ref flowback paid laund energy services shipping companytax gold -->

**The question, the first data and the first map.**

### What changed

#### Round 2

**Gaps filled, margins everywhere, 17 October 2026.**

- Estimates with low/middle/high ranges for every gap: aid from 190 non-Kiel countries, refugee costs per year, energy switching cost and discounts, all company taxes, trade 2019–Aug 2026 ([`gaps/`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/trade_full.json) files).
- Ranges of about 90% everywhere; certainty-letter defaults where data give none → [ranges](#view=how&sec=m-ranges).
- Flowback counted as profit (20%).
- **Attribution through middlemen**: laundered oil to the final buyer through trading hubs; Hong Kong's Russian gold partly to China; Russia's unexplained imports to the countries of origin → [trade](#view=how&sec=m-trade-residual-gap), [energy](#view=how&sec=m-energy-and-laundered-oil-hub-resale-chain).
- Services, hidden channels, undisclosed aid and private donations added ([`uncovered.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered.json)).

#### Round 1

**First real data, 17 October 2026.** Six research files replaced sample values:

- aid per donor from the Kiel Institute tracker, Release 31 ([`kiel.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/kiel.json)) → [aid](#view=how&sec=m-aid-refugees-military-aid);
- goods trade with Russia and Ukraine from UN Comtrade, 2021–2025 ([`trade.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/trade.json)) → [trade](#view=how&sec=m-trade);
- fossil payments to Russia from CREA, laundered oil, oil discounts ([`crea.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/crea.json)) → [energy](#view=how&sec=m-energy-and-laundered-oil);
- own-industry share of military aid and PURL ([`flowback.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/flowback.json)) → [flowback](#view=how&sec=m-aid-refugees-military-flowback);
- profit tax of foreign companies in Russia ([`companies.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/companies.json)) → [company taxes](#view=how&sec=m-services-shipping-companies-company-taxes);
- military support to Russia, people, population and GDP ([`other.json`](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/other.json)).

Method: EU-level aid split by EU budget share; refugee costs modelled from Kiel's EU total; 2026 trade estimated from the 2025 rate.

### Decisions

- Map money moved toward Ukraine **and** toward Russia per country, not aid alone — *raised by:* owner; *why:* headline aid hides money still paid to Russia; *effect:* the core of the project
- Show it as **% of GDP**, with per person and total euros one click away — *raised by:* owner; *why:* compare small and large countries fairly; *effect:* headline unit
- Name: "Follow the Money: Ukrainian Aid"; EU-level aid as its own part — *raised by:* owner; *why:* clearer name; EU money is paid by members; *effect:* EU aid split by budget share
- Mark 2026 as January–August; show the data date — *raised by:* proposed; *why:* partial year must not look complete; *effect:* `*` marks on estimated parts
- Ranking, Ukraine-vs-Russia and table views; CSV and JSON download; share card per country — *raised by:* owner; *why:* let readers find and share their country; *effect:* views and share pages
- Corrections via Reddit and GitHub — *raised by:* owner; *why:* an anonymous project still needs a way to be corrected; *effect:* link in the status line
- Count **shipping and insuring Russian oil**, by owner country — *raised by:* proposed; *why:* money earned serving Russia's exports; *effect:* new part ([why](#view=how&sec=cl-why-shipping-russian-oil))
- **Services trade with Russia** (tourism, transport, business services), both ways, against the pre-war level — *raised by:* proposed; *why:* only goods were counted; a gap is estimated, never left at zero; *effect:* new part: Cyprus toward Ukraine (gave up services sold to Russia), Tunisia and Georgia toward Russia (Russian tourists) ([why](#view=how&sec=cl-why-services-and-tourism))
- **Undisclosed military aid** estimated beyond the Kiel tracker — *raised by:* proposed; *why:* hidden help to Russia was estimated, so hidden help to Ukraine needed the same treatment, or the picture leans one way; *effect:* new part, about EUR 0.5–1.8bn a year ([why](#view=how&sec=cl-why-undisclosed-military-aid))
- **Energy switching cost**: the extra price paid to replace Russian energy, in the cost view — *raised by:* owner, proposed; *why:* stopping Russian energy has a price; the owner asked for this "opportunity cost"; *effect:* cost-view part, EUR 133bn (59–205) in total; Germany 34.5bn, Italy 18.5bn ([why](#view=how&sec=cl-why-energy-switching-cost-and-oil-discount))
- **Discount gained on Russian oil** subtracted in the cost view — *raised by:* proposed; *why:* buyers of cheap Russian oil gain from it, the reverse of Europe's switching cost; *effect:* cost-view part: India EUR 34bn, China 25bn at first ([why](#view=how&sec=cl-why-energy-switching-cost-and-oil-discount))
- Count **refined fuel once**, at the buyer, not at the refiner and the buyer — *raised by:* audit; *why:* it had been counted twice; *effect:* refiners' exports taken off
- **Take freight out** of payments to Russia (CIF to FOB) — *raised by:* audit; *why:* freight goes to shippers, not Russia; *effect:* payments lower by 3.5–7.5%
- Gas priced **per country**; gas counted where burned — *raised by:* proposed; *why:* Hungary and Serbia paid different prices; transit countries do not burn the gas; *effect:* gas price index per country
- **ERA loans** (repaid from frozen Russian assets) left out of the donor's aid — *raised by:* audit; *why:* they cost the donor nothing; *effect:* US and others lower than Kiel's headline

<h2 id="cl-foundations">The method's foundations <span class="cl-date">rounds 1–10</span></h2>
<!-- flows: -->

**The core choices the method rests on, as they stand; how each came about is in the rounds above.**

### The question and the unit

- Measure **money moved toward Ukraine or toward Russia because of the war**, per country, 2022 to August 2026 — *why:* Aid totals alone hide that some donors kept paying Russia for energy, and that some aid was spent in the donor's own economy; *alternative:* Count aid only (Kiel Institute does this, and it is the better source for aid alone); *evidence and detail:* [overview](#view=how&sec=m-overview-the-core-idea-in-four-steps)
- Show the total as **% of one year's GDP** (2024) — *why:* Lets small and large economies be compared; per person and total euros are one click away; *alternative:* Total euros (favours large economies); *evidence and detail:* GDP: World Bank WDI, IMF WEO ([sources](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/sources.md))
- Compare with **what would have happened without the war**, not with zero — *why:* Buying less from Russia than before is money Russia did not get; buying the same as before is not new support; *alternative:* Compare with 2021 levels only; *evidence and detail:* [counterfactual](#view=how&sec=m-counterfactual)

### Aid and the cost of hosting refugees

- Aid from the **Kiel Institute Ukraine Support Tracker** (bilateral allocations) — *why:* The most complete, item-level, peer-reviewed aid database; *alternative:* Pledges (overstate), national press releases (inconsistent); *evidence and detail:* [aid](#view=how&sec=m-aid-refugees-military-aid)
- **EU-level aid** split over members by their share of the EU budget — *why:* Members pay for it; Kiel uses the same split; *alternative:* Leave it with "the EU" (hides members' share); *evidence and detail:* [EU-level aid](#view=how&sec=m-aid-refugees-military-eu-level-aid)
- **Loans at their gift to Ukraine**: cheaper interest, discounted at Ukraine's measured 2021 rate (6.7%), plus the default risk the lender really carries (the measured expected loss of its creditor class); range: no expected loss (low) to the promised war yield of the year of payout (high). Round 12, the owner's choice; round 5 used a flat 10% (a judgement) — *why:* A repaid loan is worth less than a grant. The owner first chose opportunity cost at the real war rate (30–60% in 2022–2023). But that yield is mostly compensation for expected default, which official lenders did not bear (the IMF and World Bank are paid first; EU loans were left out of both debt deals; bilateral lenders only deferred), so it overstates the gift. It is kept as the high end, since it is what the market would have charged; *alternative:* Face value (overstates loans); a flat 10%; the war yield as the central value (near-full gifts); *evidence and detail:* [loans](#view=how&sec=m-loans)
- **Donated weapons at market value** (what they are worth to Ukraine), not the donor's book value — *why:* Old stock is often booked low or high; the value to Ukraine is what matters for the shift; *alternative:* Book value as reported; *evidence and detail:* [weapons](#view=how&sec=m-aid-refugees-military-donated-weapons-at-market-value)
- **Refugees at net cost**: hosting cost minus the taxes working refugees pay, floored at zero — *why:* Hosting is real support, but working refugees also pay taxes; *alternative:* Gross cost (overstates hosts with high employment); *evidence and detail:* [refugees](#view=how&sec=m-aid-refugees-military-refugees)

### Trade with Russia and Ukraine

- Trade from **customs data** (UN Comtrade, Eurostat), the reporter's own figures first, then partner (mirror) figures — *why:* Official, comparable across countries; *alternative:* Russian statistics (largely suspended since 2022); *evidence and detail:* [trade](#view=how&sec=m-trade-sources-and-filling-order)
- **Purchases count at the seller's net gain**: Russia's taxes plus profit above a normal return, per product and year; the same for Ukraine — *why:* Aid is a gift; trade is an exchange, so only the seller's gain is comparable with aid (suggested by a reader); *alternative:* Full price (treats trade like a gift); *evidence and detail:* [net-gain rule](#view=how&sec=m-overview-the-net-gain-rule)
- **Sales to Russia count at the seller's income** (since round 13 the seller's net gain × genuinely extra; until round 12 value kept × genuinely extra) — *why:* The seller gave up goods; only the extra income is a gain; *alternative:* Full sales value; *evidence and detail:* [net-gain rule](#view=how&sec=m-overview-the-net-gain-rule)
- **Freight taken out** of import values (CIF to FOB) — *why:* Freight is paid to shippers, not to Russia; *alternative:* Leave customs values as they are; *evidence and detail:* [freight](#view=how&sec=m-trade-freight-cif-to-fob)
- **Re-export hubs**: goods passed through the UAE, Armenia, Kazakhstan and others count for the country that made them — *why:* Otherwise the hub looks like the supplier; *alternative:* Count at the hub; *evidence and detail:* [re-exports](#view=how&sec=m-trade-re-export-hubs)

### Energy

- **War-time price premium counts in full**: payments minus the same volume at the prices markets expected before the invasion — *why:* The premium cost Russia nothing more to produce; *alternative:* Compare with 2019–2021 prices (overstates, prices were already rising); *evidence and detail:* [windfall](#view=how&sec=m-prices-war-time-windfall), [no-war prices](#view=how&sec=m-prices-no-war-prices)
- **Gas counted where it is burned**, not where it crosses a border — *why:* Transit countries do not pay for gas they pass on; *alternative:* Customs data as recorded; *evidence and detail:* [transit gas](#view=how&sec=m-energy-and-laundered-oil-transit-gas)
- **Fuel refined from Russian crude** (e.g. Indian diesel) charged to the **final buyer**, at the measured share of the price that reaches Russia; the refiner keeps the rest and its discount profit — *why:* The buyer's demand creates the sale; the refiner chose the crude and keeps the discount; *alternative:* Charge the refiner; or ignore it; *evidence and detail:* [laundered oil](#view=how&sec=m-energy-and-laundered-oil-laundered-oil), [crude share](#view=how&sec=m-energy-and-laundered-oil-valuing-and-capping)

### Money flowing back and Russia's state and companies

- **Money flowing back**: aid spent in the donor's own economy (weapons built at home, replacing donated stock) is subtracted at the seller's net gain × genuinely extra (value kept until round 12) — *why:* A donor's industry earns from it, so the donor's net cost is lower; *alternative:* Ignore it (overstates large arms producers); *evidence and detail:* [flowback](#view=how&sec=m-aid-refugees-military-flowback)
- **Taxes companies still pay in Russia** count toward Russia (profit tax plus half of other taxes) — *why:* Taxes fund Russia's state; *alternative:* Leave out; *evidence and detail:* [company taxes](#view=how&sec=m-services-shipping-companies-company-taxes)
- **Profits Russian-owned companies abroad send home** count toward Russia — *why:* Money reaching Russian owners; *alternative:* Leave out; *evidence and detail:* [Russian-owned companies](#view=how&sec=m-russia-state-and-companies-russian-owned-companies-abroad)
- **The return Russia lost on its frozen reserves** counts toward Ukraine, for the holder countries — *why:* Holding them is a choice that denies Russia income; *alternative:* Count the frozen principal (it is not spent); *evidence and detail:* [frozen reserves](#view=how&sec=m-russia-state-and-companies-frozen-central-bank-reserves)
- **Weapons and troops sent to Russia** (North Korea, Iran, Belarus) count toward Russia: unpaid deliveries at market value, paid ones (also in kind) at the seller's net gain since round 13 — *why:* Direct military support; a paid delivery is a sale; *alternative:* Leave out (no customs data); *evidence and detail:* [military support](#view=how&sec=m-aid-refugees-military-military-support-to-russia)
- **Critical goods** (chips, machine tools) are a marker, not added — *why:* They are already inside the trade figures; *alternative:* Add them (counts twice); *evidence and detail:* [marker](#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker)

### Uncertainty

- Every part has a **likely range (about 90%)**, combined in quadrature — *why:* Most inputs are estimates; the no-war baseline is the biggest uncertainty; *alternative:* Single numbers (false precision); *evidence and detail:* [ranges](#view=how&sec=m-ranges)
- A total takes the **weakest certainty letter** of its parts (A reported to D rough) — *why:* A total is only as reliable as its weakest part; *alternative:* Average letters; *evidence and detail:* [certainty](#view=how&sec=m-ranges-certainty-letters)
- Countries whose range crosses zero are **left out of top lists** — *why:* Even the direction is uncertain; *alternative:* Rank them anyway; *evidence and detail:* [ranges](#view=how&sec=m-ranges)
- **Nothing missing counts as zero**: gaps are estimated, with wide ranges — *why:* No country should rank well for having no data; *alternative:* Treat missing as zero; *evidence and detail:* [README](#view=how)

<h2 id="cl-why">Why each money flow is counted <span class="cl-date">rounds 1–14</span></h2>
<!-- flows: -->

Nine money flows on the map had no row here saying why they are counted, and why this way. The reasons below were
written down from what was actually said when each flow was added: in the method pages, the research notes, the code
comments, the commit history and the project conversation. Who raised each point follows the
[decision log](#view=how&sec=changelog): **(owner)** is the project's author, **(proposed, accepted)** means Claude suggested it
and the owner agreed, **(audit)** an independent review, **(reader)** a Reddit commenter. Where no reason was given
for a choice, the row says **reason not recorded**; nothing has been filled in after the fact.

<h3 id="cl-why-undisclosed-military-aid">Undisclosed military aid</h3>
<!-- flows: undisc -->

Toward Ukraine, in the net shift and the cost view. Added in round 1–2 (commit `532eb77`); France corrected by the
second audit in round 3–4 (`3888f03`). Method: [undisclosed aid](#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations).
Research: [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §3,
[audit2-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit2-notes.md) §3. Log:
[round 1–2](#view=how&sec=cl-r1-2),
[round 3–4](#view=how&sec=cl-r3-4).

- **Count military aid that governments did not publish**, beyond what the Kiel tracker records — *data or judgement:* judgement: the values are estimates (certainty C–D); *why:* Hidden help to Russia is estimated, so undisclosed weapons for Ukraine need the same treatment: "without both, the picture leans one way" (proposed, accepted). A known gap left at zero would reward missing data: "no country gets rewarded for no data" (owner); *where:* [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §3
- **Only amounts beyond Kiel Release 31**: Germany's 2025–2026 appropriations above what Kiel records, Italy's later decrees, France's 2024 gap, small Greek amounts — *data or judgement:* data where a budget or official total exists (Germany's EUR 11.6bn appropriated for 2026, France's official totals); judgement in the yearly split and the ranges; *why:* Anything Kiel already holds would count twice. France's 2022–23 gap was already in Kiel, which adopted France's official EUR 2.6bn in Release 16, so it was taken out (France −1.3bn); Germany's estimate was checked and does not overlap (audit); *where:* [audit2-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit2-notes.md) §3, `apply_audit2()`
- **Left out**: US intelligence and covert support; Bulgaria's secret 2022 deliveries; Türkiye's deliveries; the frozen-asset part of France's 2024 total (about EUR 0.3bn) — *data or judgement:* judgement; *why:* Intelligence and covert support have no value to put on them; Bulgaria's and Türkiye's deliveries were commercial sales (Bulgaria's reportedly paid by the US and UK), not their aid; the map leaves Russia's own money out elsewhere; *where:* [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §3, [audit2-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/audit2-notes.md) §3
- **Check 8** warns when undisclosed aid exceeds half of a country's Kiel military aid — *data or judgement:* judgement; *why:* reason not recorded; *where:* [method](#view=how&sec=m-aid-refugees-military-undisclosed-aid-and-private-donations)

<h3 id="cl-why-energy-switching-cost-and-oil-discount">Energy switching cost and oil discount</h3>
<!-- flows: energy -->

Cost view only. Both added in round 1–2 (commit `532eb77`, research `energy.json`); the oil discount was corrected in
round 7 (`c765e84`). Method: [energy premium and oil discount](#view=how&sec=m-energy-and-laundered-oil-energy-premium-and-oil-discount),
[the cost view](#view=how&sec=m-overview-the-cost-view). Research: [energy-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy-notes.md),
[energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) §3. Log:
[round 1–2](#view=how&sec=cl-r1-2),
[round 7](#view=how&sec=cl-r7).

- **The extra price paid to replace Russian energy counts as a cost the country carried** — *data or judgement:* judgement (the rule); *why:* Without it, a country that stopped buying Russian gas shows only "less money to Russia", not the price it paid (proposed). The owner asked for "how much does it cost the country to not buy Russian oil and buy alternatives ... the cost of sanctions ... the opportunity cost" (owner); *where:* [log](#view=how&sec=cl-r1-2)
- **In the cost view only**, not in the net shift — *data or judgement:* judgement; *why:* The cost view is "what the country gave up, not where money went"; *where:* [overview](#view=how&sec=m-overview-the-cost-view)
- **Displaced volume × replacement share × price gap**, per fuel and month: gas at TTF minus Russia's contract price; crude and coal at the midpoint of the pre-war price gap and the full discount forgone — *data or judgement:* data: CREA volumes and realised prices, Eurostat replacement shares, TTF, Brent and coal prices; judgement: the midpoint for crude and coal, the low-case replacement shares; *why:* Replaces a flat 25% of the value no longer bought; the owner asked for real values with margins of error (owner). Weighting by month catches the 2022 gas cut-off at peak prices. For oil the "Russian price" is ambiguous: the full discount forgone overstates the cost, the pre-war gap understates it, so the middle is the midpoint; *where:* [energy-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy-notes.md), method and caveats
- **The price gap is against the same year's Russian price, not the no-war price** (checked and kept in round 7) — *data or judgement:* judgement; *why:* That is the cost of choosing another supplier. Against the no-war price it would add the war-time price spike, which was paid to other suppliers and would have been paid without switching; *where:* [energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) §3
- **The discount gained on Russian oil is subtracted** in the cost view — *data or judgement:* judgement (the rule); *why:* India, China and Türkiye save money by buying cheap Russian oil: "a gain for them, the reverse of the switching cost Europe pays, so it belongs in their cost view" (proposed, accepted); *where:* [log](#view=how&sec=cl-r1-2)
- **Discount = tonnes × (Brent − Russia's realised price) × 0.671**, from March 2022 — *data or judgement:* data: CREA realised prices, Brent; 0.671 is the median of published estimates (ICRA, Banque de France, Reuters); *why:* Published estimates come out at 0.49–0.84 of the gross price gap, because they are net of freight and compare with other suppliers' delivered prices; *where:* [energy-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy-notes.md), method §2
- **Without Russia's normal pre-war discount** (factors 0.56–0.79 a year) — *data or judgement:* data: Russian crude sold at 0.948 of Brent in 2021; *why:* About 5% of the discount existed before the war and would have existed without it (proposed; the owner left the remaining energy questions to Claude's recommendation). India 33.8 → 24.1bn, China 24.9 → 18.1bn; *where:* [energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) §3, `apply_nowar_prices()`
- **Not counted twice with the windfall** — *data or judgement:* rule; *why:* The windfall covers what was still bought from Russia, the switching premium what was replaced. The discount gain and the windfall see the same discount in different views; *where:* [energy_nowar-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md) §3
- **Left out**: households' and industry's energy subsidies; new infrastructure such as floating LNG terminals — *data or judgement:* judgement; *why:* Subsidies "are costs of the war, not money toward Ukraine or Russia" (proposed, accepted, round 7). Infrastructure: reason not recorded; *where:* [energy-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy-notes.md), caveats

<h3 id="cl-why-services-and-tourism">Services and tourism</h3>
<!-- flows: services -->

Both directions, in the net shift; income lost on services also in the cost view. Added in round 1–2 (commit
`532eb77`, research `uncovered.json`); pre-war trends in round 3 (`105f35e`); the money rule in round 6 (`eef967d`);
relocants' spending out in round 7 (`bca0255`); Russia's net gain in round 10 (`109b8eb`), measured in round 11
(`7079676`). Method: [services](#view=how&sec=m-services-shipping-companies-services). Research:
[uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §1,
[relocants-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/relocants-notes.md),
[narrow-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/narrow-notes.md). Log:
[round 1–2](#view=how&sec=cl-r1-2).

- **Count services traded with Russia** (transport, business services, tourism) both ways, against the expected no-war level, like goods — *data or judgement:* data: Eurostat, OECD-WTO BaTiS, Bank of Russia; *why:* Only goods were counted, so tourism and services sold to Russia were missing (proposed, accepted); gaps are estimated rather than left out (owner). Countries that stopped selling services to Russia move toward Ukraine; those that sell more, mainly to Russian tourists, move toward Russia; *where:* [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §1
- **Bought from Russia: at Russia's net gain on services** (0.032–0.044 since round 11) — *data or judgement:* data: Rosstat profit and return on assets by activity; *why:* The rule for every purchase: aid is a gift, trade an exchange, so only the seller's gain compares with aid (reader, owner, round 10); *where:* [net-gain rule](#view=how&sec=m-overview-the-net-gain-rule), [assumptions](#view=how&sec=cl-r11)
- **Sold to Russia: at value kept × genuinely extra** (tourism lost: genuinely extra 0.30) — *data or judgement:* data: OECD TiVA for value kept; judgement for genuinely extra; *why:* Gross sales had inflated Cyprus and Lithuania (audit, round 3–4); a flat 20% profit was arbitrary (proposed, round 6); *where:* [money rule](#view=how&sec=m-overview-one-rule-for-every-seller)
- **Expected level: 2021 held, plus the travel recovery from COVID** at the UNWTO world pace, capped at the model's recovered level — *data or judgement:* judgement, tested; *why:* 2021 was a COVID year for travel; no model beat this in all three back-tests; *where:* [counterfactual](#view=how&sec=m-counterfactual-6-which-model-is-used-for-which-flow)
- **Countries that do not report** (China, the UAE, India, Kazakhstan, Belarus) at BaTiS balanced values ×0.6–1.5; **Türkiye** at the mean of its own report and BaTiS — *data or judgement:* judgement; *why:* BaTiS from 2022 rests on modelled Russian figures. Türkiye's 6.3 million Russian visitors imply more travel income than it reports; *where:* [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) §1
- **Left out**: relocants' living spending (round 7); Russia's travel imports that BaTiS does not assign to a country, which only widen the high ends — *data or judgement:* judgement; *why:* Relocants' spending is money leaving Russia, not income from it (proposed; the owner left it to Claude's recommendation). The unassigned travel spending has no country split; *where:* [relocants-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/relocants-notes.md), [uncovered-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/uncovered-notes.md) caveats

<h3 id="cl-why-shipping-russian-oil">Shipping Russian oil</h3>
<!-- flows: shipping -->

Toward Russia when income rose, in the net shift. Research in round 1–2 (`1337385`), counted from `43f1c38`; profit
instead of revenue in `5734a4b`; freight by the real controller in round 5 (`308560d`); Russian shares from evidence
and freight at the money rule in round 6 (`eef967d`). Method: [shipping](#view=how&sec=m-services-shipping-companies-shipping).
Research: [shipping-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/shipping-notes.md),
[shadow_fleet-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/shadow_fleet-notes.md),
[shadow_fleet_r6-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/shadow_fleet_r6-notes.md). Log:
[round 1–2](#view=how&sec=cl-r1-2).

- **Count income from carrying, insuring, financing and registering Russia's seaborne crude, product and LNG exports, and from selling tankers to the shadow fleet**, against 2019–2021 — *data or judgement:* judgement (the rule); *why:* Money earned serving Russia's exports; Greek, Maltese and Cypriot owners earned large freight income and it was "probably the largest real flow still missing" (proposed, accepted). It is compared with its pre-war level like other services sold to Russia; *where:* [shipping-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/shipping-notes.md)
- **Counted for the country of the company that earns it** (owner or manager, insurer, lender, registry), never the flag; **freight by the real controller** since round 5; Russian-controlled tankers count for no country — *data or judgement:* data: KSE, CREA, S&P and Windward volumes by manager; judgement: the split by controller (opaque managers 60–65% Russian, 45–85%); *why:* The money goes to the company, not the flag state. Who controls the tankers was "the biggest guess in shipping", so it was researched from sanctions lists and investigations (proposed, accepted); *where:* `apply_shipping()`, [shadow_fleet_r6-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/shadow_fleet_r6-notes.md)
- **Profit, not revenue**: freight 20/35/50%, insurance and finance 10/25/40%, registry 30–70%, ship sales at their price premium; since round 6 freight at value kept × genuinely extra (Greek shipping 0.17) — *data or judgement:* judgement, based on tanker operating margins of 30–50% in the 2022–23 boom; *why:* "A Greek shipowner's €5bn of freight isn't €5bn gained" (proposed); "fix shipping and flowback as profit" (owner). Freight pays for fuel, port fees, crew and the ship itself; *where:* `SHIPPING_PROFIT` in [build_data.py](https://github.com/intelligent-cream/war-balance/blob/main/pipeline/build_data.py), [money rule](#view=how&sec=m-overview-one-rule-for-every-seller)
- **Expected level**: 2019–2021 × Russia's seaborne export growth before the war (+3.9% a year) — *data or judgement:* data: `trend2.json`; *why:* A growing pre-war trend would have kept growing, and trends were to cover more flows than goods (owner); *where:* [trend2-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/trend2-notes.md)
- **Left out**: the part already inside services sold to Russia (freight 5%, insurance and finance 10–20%); Greek tanker earnings in `uncovered.json`; freight inside import values — *data or judgement:* rule; *why:* Each would count the same money twice ("remove the shipping double count", owner); freight is paid to shippers, not to Russia (audit); *where:* [shipping](#view=how&sec=m-services-shipping-companies-shipping), [freight](#view=how&sec=m-trade-freight-cif-to-fob)

<h3 id="cl-why-companies-leaving-russia">Companies leaving Russia</h3>
<!-- flows: exits -->

**Since round 14b: not in the totals, counted in the cost to the country** (below).
Rounds 5 to 14: toward Russia, in the net shift, by the company's home country. Added in round 5 (commit `650e1ff`). Method:
[companies leaving Russia](#view=how&sec=m-russia-state-and-companies-companies-leaving-russia). Research:
[company_flows-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/company_flows-notes.md) §1. Log:
[round 5](#view=how&sec=cl-r5).

- **Round 14b: out of the totals, a cost carried**: the forced discount and the exit contribution, and the seizures counted in round 14, leave the net shift and both headline numbers and count in the cost view — *data or judgement:* rule (owner); *why:* Russia took this money; the country did not choose to move it (below); *where:* `apply_company_flows()`, `add_taken()`
- ~~**Count the exit contribution**~~ (rounds 5–14, in the totals) paid to Russia's budget by foreign companies that sell out, by home country — *data or judgement:* data: Russia's budget line (RUB 116bn in 2023, 160bn in 2024); judgement: the split by home country, by the size of the businesses sold (certainty D for most); *why:* Russia makes foreign companies pay an "exit contribution" to its budget to be allowed to sell: "that's money to Russia, by company home country" (proposed, accepted); *where:* [company_flows-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/company_flows-notes.md) §1
- ~~**Count the forced discount**~~ (rounds 5–14, in the totals): the value handed to Russian buyers by sales at least 50–60% below valuation — *data or judgement:* judgement: a 2022 case list, later years from the contribution; *why:* Proposed together with the contribution as money to Russia and accepted (proposed, accepted). The research suggested counting only the contribution, since a discount goes to Russian buyers, not the state; why the discount was kept anyway: reason not recorded; *where:* [company_flows-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/company_flows-notes.md) §1 and "Things the builder must decide or watch"
- **No pre-war level**: each payment is its own change — *data or judgement:* data; *why:* None of these payments existed before the war; *where:* [company_flows-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/company_flows-notes.md) §1
- ~~**Left out: seizures**~~ (until round 13) without payment (Wintershall Dea, Unipro, Fortum, Carlsberg, Danone, leased aircraft; about EUR 33bn); counted in the totals in round 14 (audit M4), in the cost view since round 14b — *data or judgement:* judgement; *why:* Russia took these; "the owners had no choice" (proposed); *where:* `apply_company_flows()`
- **Left out: the Yandex (Netherlands) and Polymetal (Kazakhstan) discounts** — *data or judgement:* judgement; *why:* Their shareholders were mostly international, not Dutch or Kazakh; *where:* [method](#view=how&sec=m-russia-state-and-companies-companies-leaving-russia)

##### Round 14b: taken by Russia, not in the totals

**Raised by the owner.** This **reverses the round-5 inclusion** of forced discounts and exit fees in the totals and
**the round-14 (audit M4) inclusion of seizures**. The owner's reasoning: assets seized by Russia (decree 302
temporary management, court seizures) and forced exit costs (the forced discount when companies sold out, and the
"voluntary contribution" or exit fee paid to the Russian budget) are a loss imposed on the country's companies, that
is a sacrifice, and a gain for Russia. The country did not choose to move that money; Russia took it.

- **Out of the totals**: seizures and forced exit costs are in neither the net shift nor either headline number (support for Ukraine; change in payments to Russia) — *data or judgement:* rule (owner); *why:* Russia took the money; the country did not choose to move it; *effect:* Finland +0.88, Austria +0.72 (−0.43 → +0.29), Ireland +0.54, Denmark +0.52, Norway +0.37, the Netherlands +0.35, Germany +0.27, France +0.23, the UK +0.23 (net, % of GDP); *where:* `apply_company_flows()`
- **A cost carried**: both count in the cost view, positive, like the energy switching cost ("Seized by Russia (companies' assets)"; "Forced sales: discount and exit fee taken by Russia") — *data or judgement:* rule (owner); *why:* what Russia took is what the country's companies lost: a sacrifice; *effect:* cost view: Finland +0.88, Austria +0.72 of GDP; *where:* `taken` in `data.json`, `calc()`
- **Shown apart**: the panel line "Russia took €X from companies of this country (seizures and forced sales); not in the totals, counted in the cost to the country" ("counted as a cost carried" before round 15); a table, CSV and JSON column marked "not in totals"; a square map marker (layer "Taken by Russia") where it is at least 0.1% of a year's GDP — *data or judgement:* display; *why:* the same pattern as remittances (round 13b); *effect:* display; *where:* `takenNote()`, `drawTaken()`, `views.js`
- **Method band**: no alternative includes them — *data or judgement:* rule; *why:* the alternatives are rebuilt with the same rule; *effect:* none; *where:* `METHOD_ALTERNATIVES`
- **Check**: `check_data.py` check 25 (no `exits` or `seized` part in the net; every home country with a seizure or exit payment has it in the cost view; `calc()` adds `taken` to the cost only) — *data or judgement:* test; *why:* keeps the rule from coming back by mistake; *effect:* none; *where:* `pipeline/check_data.py`

Method: [Russia's state and companies](#view=how&sec=m-russia-state-and-companies-taken-by-russia-not-in-the-totals).
Log: [round 14b](#view=how&sec=cl-r14b).

<h3 id="cl-why-remittances-from-russia">Remittances from Russia</h3>
<!-- flows: remit -->

**Since round 13b: a marker, not in the totals.** Migrant workers' wages sent home from Russia are no longer in the net
shift, the cost view or either headline number. The panel, the map (a triangle, layer "Wages from Russia") and the
table, CSV and JSON show them apart, marked "not in the totals": "Depends on wages earned in Russia: remittances from
Russia changed by X% of GDP since 2022". This **reverses the owner's round-7 decision** to count them, after the
round-13 audit. The owner's reasons: they are individuals' wages, not a country's choice; the money flows from Russia
to the migrant's home, not the other way; the real gain over what the migrant could earn elsewhere is small and hard
to measure; and they would dominate the bottom of the ranking (Tajikistan −39.6% of GDP, almost all of it
remittances). Research in round 7 (`ec6e00a`), on the map in `9a46dd5`; relocants' spending out in `bca0255`;
Russia's share measured in round 11 (`7079676`). Method: [remittances and relocants](#view=how&sec=m-trade-remittances-and-relocants).
Research: [remittances-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances-notes.md),
[relocants-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/relocants-notes.md),
[remittances_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances_r13-notes.md) (kept, no longer used). Log:
[round 7](#view=how&sec=cl-r7),
[round 13](#view=how&sec=cl-r13).

- **Round 13b: a marker, not in the totals**: the change in labour remittances from Russia against the expected level, per year with its range, shown in the panel (where migrants sent at least 1% of GDP a year: "depends on wages earned in Russia"), on the map and in the table, CSV and JSON — *data or judgement:* rule (owner, after the round-13 audit); *why:* individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over the alternatives is small and hard to measure; they dominated the bottom of the ranking. Reverses round 7; *where:* `apply_remittances()`, [trade](#view=how&sec=m-trade-remittances-and-relocants)
- ~~**Count migrant workers' wages sent home from Russia**~~ (rounds 7–13), against the expected no-war level — *data or judgement:* data: receiving central banks' transfers by origin, World Bank totals; *why:* They are "wages for labour sold to Russia's economy, so they work like services sold to Russia" (proposed); "should be taken into account" (owner). Most of the rise came from Russia's war economy pushing wages up; *where:* [remittances-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances-notes.md) §1
- ~~**At value kept (0.97) × genuinely extra (0.55 when above expected, 0.40 when below)**~~ (rounds 7–12) — *data or judgement:* data for value kept; judgement for genuinely extra; *why:* Migrants "would mostly have worked there anyway", so only part of the money is new income (proposed); *where:* [money rule](#view=how&sec=m-overview-one-rule-for-every-seller)
- ~~**Round 13: at the migrant's net gain**~~ (replaced in round 13b) instead: the war wage premium in full, the rest × the premium over the home wage × genuinely extra — *data or judgement:* data and judgement ([round 13](#view=how&sec=cl-r13)); *why:* wages pay for real work (audit, owner); *where:* [remittances_r13-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances_r13-notes.md)
- **Expected level** (also for the marker): the 2019 and 2021 average, grown at each country's pre-war trend — *data or judgement:* data and judgement; *why:* 2020 is left out because of COVID; *where:* [remittances-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances-notes.md) §4
- **Russia's share where no split by origin exists** (Tajikistan, Belarus): the mirror ratio of 2019–2021, the same in every year — *data or judgement:* data for the share; judgement in applying it to every year; *why:* Tajikistan's central bank does not publish transfers by country; why the same share holds every year: reason not recorded; *where:* [assumptions](#view=how&sec=cl-r11), [limitations](#view=how&sec=limitations)
- **Left out: relocants' transfers** (about EUR 30bn of the 2022 surge) **and their living spending** — *data or judgement:* rule; *why:* It is money leaving Russia: counting it toward Russia would be the wrong sign, and counting it toward Ukraine would credit countries for something unrelated to Ukraine (proposed; the owner had asked whether counting it was "doing too much"); *where:* [remittances-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances-notes.md), [relocants-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/relocants-notes.md)
- **Russians working remotely for Russian employers left out; family support from long-settled communities counted as labour** — *data or judgement:* judgement; *why:* Family support "is still income from Russia's economy" (proposed). Remote workers: Claude suggested counting them as labour where data exist; why the research left them out: reason not recorded; *where:* [remittances-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/remittances-notes.md) §8

<h3 id="cl-why-rosatom-and-russian-state-loans">Rosatom and Russian state loans</h3>
<!-- flows: statefin -->

Either direction, in the net shift. Added in round 5 (commit `650e1ff`); Belarus's deferrals left out in round 6
(`c8a69b8`). Method: [nuclear projects and state loans](#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia).
Research: [russia_state_finance-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russia_state_finance-notes.md). Log:
[round 5](#view=how&sec=cl-r5),
[round 6](#view=how&sec=cl-r6).

- **Count the buyer's own payments for Rosatom construction** (Egypt, Bangladesh, Hungary's Paks II, India, Iran, Uzbekistan) — *data or judgement:* data where projects report; judgement where they do not (certainty D); *why:* Countries pay Rosatom to build nuclear plants, and that money goes to Russia but is "probably not in trade data" (proposed, accepted: "check that and if not it should be included"). The check found construction in neither goods nor services data; *where:* [russia_state_finance-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russia_state_finance-notes.md), step 1
- **Only the buyer's own share**; the loan-financed part and new drawdowns are left out — *data or judgement:* rule; *why:* A Russian state loan paying Rosatom is Russian money paying a Russian company; drawdowns pay for work that is not counted; *where:* `apply_state_finance()`
- **Count interest and repayments on Russia's state loans, as the deviation from the pre-war schedule** — *data or judgement:* data: World Bank International Debt Statistics (Russia as creditor), actuals to 2024, contractual schedule after; *why:* Repayments are money to Russia (proposed, accepted). "A loan ending on schedule is not a war-time choice"; deferrals, stops, escrow and prepayments are. Arrears caused by sanctions on payment channels (Viet Nam, Iraq, Bangladesh) count, because the money did not reach Russia, with a note; *where:* [method](#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia)
- **Loan payments count in full**; the customs correction is rescaled to Russia's net gain — *data or judgement:* rule; *why:* The correction comes out of payments the map counts at Russia's net gain (round 10). Why loan payments are not at a net gain: reason not recorded; *where:* [method](#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia)
- **Customs over-counts removed**: Akkuyu equipment imported by Rosatom's own Turkish company; El Dabaa equipment, 85% loan-financed — *data or judgement:* data; *why:* They were paid with Russian money, not by the buyer; *where:* [russia_state_finance-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russia_state_finance-notes.md)
- **Left out**: nuclear fuel and enrichment; Belarus's loan repayments; Rosatom's capital transfers into Türkiye — *data or judgement:* rule; *why:* Fuel is already in goods trade; Belarus's deferrals were granted by Russia and refinanced with new Russian loans, so they were not its choice (proposed, round 6); Rosatom's transfers into Türkiye are money from Russia, not to it; *where:* [method](#view=how&sec=m-russia-state-and-companies-nuclear-projects-and-state-loans-from-russia), [russia_state_finance-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russia_state_finance-notes.md)

<h3 id="cl-why-weapons-bought-from-russia">Weapons bought from Russia</h3>
<!-- flows: rusarms -->

Either direction, in the net shift. Added in round 5 (commit `93716b5`); 18 more buyers and Iran counted once in
round 6 (`eef967d`); at Russia's net gain in round 10 (`109b8eb`), measured in round 11 (`7079676`). Method:
[weapons bought from Russia](#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia). Research:
[russian_arms_exports-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russian_arms_exports-notes.md),
[arms_r6-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/arms_r6-notes.md),
[assumptions_r11_gain-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/assumptions_r11_gain-notes.md). Log:
[round 5](#view=how&sec=cl-r5).

- **Count payments to Russia for weapons, parts, licence kits, repairs and training**, against what the buyer would have paid without the war — *data or judgement:* data: SIPRI, Rosoboronexport and FSVTS statements, contract reporting; judgement: payment timing and the split by buyer (mostly D); *why:* Buyers paid Russia billions for weapons that "often don't appear in customs data"; "buyers who cut purchases moved toward Ukraine, and those who kept buying sent money to Russia. This is probably the biggest missing piece" (proposed, accepted); *where:* [russian_arms_exports-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russian_arms_exports-notes.md)
- **Expected level without one-off contracts** (Türkiye's 2019 S-400) — *data or judgement:* judgement; *why:* One-off contracts inflate the 2019–2021 average: Türkiye would get +2.2bn instead of +0.3bn; *where:* [russian_arms_exports-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/russian_arms_exports-notes.md)
- **At Russia's net gain on arms** (0.039–0.050; high end 0.12) — *data or judgement:* data since round 11 (arms makers' margins, Rostec, Rosoboronexport); the high end is judgement; *why:* The rule for every purchase from Russia (reader, owner, round 10); *where:* [assumptions](#view=how&sec=cl-r11)
- **Russia's own supply limits shown as a note, not taken off** (about 50% of the fall for India, 70% for China, 20% for Egypt) — *data or judgement:* judgement: the share is a guess from SIPRI and Rostec; *why:* Handled like the sanctions split, as a note (proposed). Subtracting the share was offered; why it was not taken: reason not recorded; *where:* [method](#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia)
- **Russia's later claims of USD 14–15bn a year used only as the high end** — *data or judgement:* judgement; *why:* reason not recorded; *where:* [method](#view=how&sec=m-russia-state-and-companies-weapons-bought-from-russia)
- **Taken off**: the small part inside customs (Algeria's 2024 radars); Iran's payments settled in drones and missiles (about 35%) — *data or judgement:* rule; *why:* Both are already counted, in trade or as weapons sent to Russia; *where:* [round 6](#view=how&sec=m-russia-state-and-companies-more-buyers)

<h3 id="cl-why-payment-agents">Payment agents</h3>
<!-- flows: agents -->

Toward Russia, in the net shift. Added in round 6 (commit `27e2d37`); checked against data in round 11 (`26735a2`)
and kept. Method: [payment agents](#view=how&sec=m-trade-payment-agents). Research:
[payment_channels-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/payment_channels-notes.md). Log:
[round 6](#view=how&sec=cl-r6).

- **Count the fees that agents in third countries earn for settling Russia's trade** outside normal banking — *data or judgement:* data: Bank of Russia balance of payments, Kyrgyz banks' extra profits; judgement: fee rates and the split by country (certainty D; C for Kyrgyzstan); *why:* The fee is income earned by helping Russia trade around sanctions, like the profit on sales to Russia, and it is in neither customs values (Russian Finance Ministry and customs letters) nor services data (proposed; the owner asked to "dig deeper" after agents had been listed as not measurable); *where:* [payment_channels-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/payment_channels-notes.md) §1–2
- **Only the share kept by residents** (35–60%), **against 2021** — *data or judgement:* judgement; *why:* The rest belongs to Russian-owned networks; *where:* `apply_payment_agents()`
- **Counted as it is**, not multiplied by a profit share — *data or judgement:* rule; *why:* A fee is already a margin; *where:* [payment_channels-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/payment_channels-notes.md) §7
- **Left out**: payment volumes; crypto volumes; the 2022 transfers of people leaving Russia; Russia's export receipts held abroad; crypto mining and ransomware proceeds — *data or judgement:* rule; *why:* Volumes only route trade already counted; crypto has no country split; relocants' money is leaving Russia; held receipts are Russia's own claims; nobody chose to pay crime proceeds and they existed before the war. In round 1–2 agents were left out because they "mostly pay for trade that customs already record" (proposed); *where:* [payment_channels-notes](https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/payment_channels-notes.md) §1, §8
