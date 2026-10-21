# Website: the map

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Current site: `site/index.html` reads `site/data.json` (built by `pipeline/build_data.py` from `research/2026-10/`).

## Current design (round 17: the map first, option B)

The owner chose option B of three first-view prototypes (A: the net map with two bars on hover; B: the net map with
money streams; C: two maps side by side), with prototype v2's country panel and highlights and concept 2's "what's
counted" switches ([decisions](../decisions.md#round-17-redesign)).

- **First view**: the map fills the screen. On it: the research-preview banner as one slim line (it opens on click),
  one header line, "Who supported Ukraine, and who paid Russia less, or more? · 2022–Aug 2026", with an ⓘ popover
  (the three key points, the per-year example, the orange caveat "mostly fuel buying, not siding with Russia", what
  grey means and what the streams show), a one-row legend ("toward Russia ← no clear change → toward Ukraine"; "Russia
  ← no change → Ukraine" on phones; "More" opens the steps and keys) and two buttons, **Highlights** and **Filters**.
  Nothing else: no control bar, title box or zoom buttons.
- **One colour rule**: blue toward Ukraine, orange toward Russia, grey no clear change, with the site's colour-blind-safe stepped blues and oranges in dark and light themes. Economies under
  EUR 5bn GDP take the lightest step of their direction. A number that is "too close to call" (its likely range or
  method band crosses zero) takes a faded colour of its leaning direction: its own colour mixed halfway toward the
  neutral grey, with no dots or outline ([decisions](../decisions.md#round-17-redesign)).
- **Money streams** (SVG): blue to Kyiv sized by support for Ukraine in €, orange to Moscow sized by how much more the
  country paid Russia than without the war in € (the map's numbers, not gross trade); the 12 largest each way; a
  country's own streams on hover, tap or when picked; a highlight's countries' streams; moving dashes, static arrows
  with reduced motion. On by default on phones too since round 18, calmer there: the 7 largest each way and thinner
  lines; a tapped country's streams move into view above the bottom sheet (beside a side sheet on a phone held
  sideways). The dashes are drawn on a layer of their own (`#streamfx`), so the map is not repainted every frame, and
  pause while the page is hidden or the map is dragged. The old gross flow lines (canvas) are an option, "Gross trade
  flows"; their animation loop runs only while they are on.
- **Hover card**: support for Ukraine and kept from Russia as two bars, each with its sentence ("paid Russia €65.8bn
  (1.6% of GDP) less than without the war"), the net with its range, and the orange caveat for orange countries.
- **Filters drawer** (round 19, the owner's interface changes; [decisions](../decisions.md#round-19-one-place-for-every-filter)):
  a persistent top layer. Filters opens it and it stays open until the reader closes it (the Filters button, × or
  Escape inside it): panning or zooming the map, switching views, changing a filter or clicking a country leave it
  open. On desktop it sits on the left, above everything, and the header line, legend, highlight card and views move
  right; the country panel stays on the right, so both show at once. On phones it is a bottom sheet that keeps the
  height chosen (half the screen, nearly all of it, or just its handle; drag or tap the handle); opening a country
  shrinks it to its handle so the panel shows above it. Open or closed and the sheet's height are kept for the visit
  (sessionStorage). A dot on the button when anything differs from the default. Sections, in order: 1. **views**
  (Map, Ranking, Ukraine vs Russia, Table & data, Sources) as one segmented control; 2. **the map shows** (Net,
  Support for Ukraine, Kept from Russia); 3. **measure** (% of GDP, per person, total €); 4. **what's counted**, folded
  by default (16 on/off switches with world totals, grouped toward Ukraine, kept from Russia and own line; "Showing
  the official numbers", or "Custom mix, not the official figures" with "Reset to the official numbers", also under
  the title, in the panel and the tooltip); 5. **where and when**: region, group (EU, G7, NATO, BRICS, former Soviet
  Union), size and year; 6. **map layers**: streams, gross trade flows, the three markers and zoom, switched off (with
  a note and "Show the map") in the other views; 7. **find a country**; 8. **display**: light or dark, language.
  Removed in round 19: the cost view, the quick views "€ to Ukraine" and "Change in € to Russia" (the same as the map
  shows plus the measure), How it works and the Top lists (the Ranking view replaces them).
- **Views read the drawer** (round 19): the Ranking, Ukraine vs Russia and Table & data views have no filter
  controls of their own; each follows the drawer's view, measure, what's counted, region, group, size and year, live,
  and says in one line what it shows ("Net (the sum) · % of GDP · EU · 2022–Aug 2026"), with a link to the drawer.
- **Highlights**: seven chips; one highlights its countries (others dimmed) and shows a small closable fact card with
  its caveat.
- **Country panel**: side panel on desktop, bottom sheet on phones (a side sheet on a phone held sideways); each
  number once (round 17), numbers and bars first (round 18, owner: "less text-heavy, more visual and structured ...
  keep all the explanations, but hide them"). It opens with no sentences: 1. The country's **name only**. 2. **The
  net** as one big number with a small label ("of a year's GDP since 2022"), its certainty letter and one compact line
  (€, likely range, ≈ average year); since round 19 in the drawer's measure: per person ("+€1,609", "per person, in
  total since 2022") or total € ("+€134 bn"), with % of GDP as the second line, and the tiles and bars in that
  measure too; a tap opens the lead in words, what the net adds, the certainty in words and what
  the likely range is. 3. **The two parts as two tiles** side by side (support for Ukraine and kept from Russia: label,
  letter, value in %, € and a small bar on a shared zero line), and Russian money frozen as a slim third tile where
  it exists; a tap opens the words, the likely range, the average year, the gas Russia cut off and the refugees not
  counted. 4. **What changes the meaning here** as small flags with an icon ("≈ too close to call", "⚠ fuel buying, not
  policy", "✂ gas cut off by Russia", "§ mostly sanctions", "+ two different things added", ...), each opening its
  one-line meaning. 5. **The biggest parts** as a diverging bar chart: the 7 largest, each row a short label and value
  over a full-width bar (blue toward Ukraine, orange toward Russia, grey earned back; the likely range as an outline),
  all on one zero line; a tap opens the part's method in place (how, why with its decisions, the country's sources
  with exact tables, method page, trace); "Show the other N parts". 6. Folded sections: about the country (code,
  people, GDP), money flowing back, method band and alternatives (with the method notes, coverage and "How this is
  calculated"), markers (critical goods, wages, taken by Russia), sanctions or own choice, per year against the
  pre-war level, aid, companies and people, share and compare. 7. **Sources** (round 19, not folded): every source
  used for the country's figures, numbered, with exact tables and links. The method flow is: panel → a part's bar →
  how it is calculated and why → that part's sources → Sources at the end of the panel → the Sources view.
- **Other views**, from Filters or the tabs in the header line once one is open: **Ranking** (the drawer's number and
  measure, with likely ranges), **Ukraine vs Russia**, **Table & data** (round 19, rebuilt: one row per country in the
  filter; grouped, sortable columns for the net, support for Ukraine, kept from Russia and Russian money frozen, each
  with its likely range and letter, then GDP, population and the main parts; tabular numbers, a sticky header and
  country column, its own scroll box; "Download CSV" and "Download JSON" export exactly what is shown, and the full data
  (every country and number, every part, data.json) below; the data gaps by country, folded), and **Sources** (the
  method in four lines, how decisions are made, then every money flow with how, why, sources and research files; every
  source in data.json is listed). How it works was a view until round 19; its content is in this documentation.

The rest of this page is the early plan, kept for the record.

EU-level aid is never shown on its own: it is split over the member states by their contribution to the EU budget
(Kiel's method), and included in each member's aid. Added in round 3:
Ukraine and Russia panels with rankings, a rankings view with a sortable table of all countries, an uncertainty range on every
headline number, numbered sources on every number, a play button (2021 → 2026), compare two countries, sales to Russia against
2021, discounts on Russian oil, company taxes, loans and pledges under "More details", a phone layout with an options menu,
and, when a country is selected, only its own flows are drawn.

One screen: a world map you can pan and zoom, and a panel for the selected country.
A working prototype with sample values is in `site/index.html`.

## Map views

| control | options |
|---------|---------|
| **View** | **Net (the sum)** (default) · Support for Ukraine · Kept from Russia ("Change in payments to Russia" until round 17); Cost to the country from round 15 to round 18 (the first design had Change since 2021 · Cost carried · To Ukraine · To Russia) |
| **Measure** | **% of GDP** (default, the fairest comparison of sacrifice) · Per person · Total € |
| **Period** | from 2022 up to a chosen year, using the yearly values in `world.json` |
| **Find a country** ("Find your country" until round 17; in Filters) | search box; zooms to the country and opens its panel |

- **Change since 2021** is the main view: net shift = aid + purchases from Ukraine above the 2021 level + the drop in payments
  to Russia below the 2021 level (paying Russia more counts negative). Diverging colours: copper = shifted toward Russia, teal = toward Ukraine.
- **Cost to the country** ("Cost carried" before round 15; removed from the site in round 19) is the opportunity cost, after gains: aid + extra price of replacing Russian energy + lost sales to Russia + tariffs dropped for Ukraine.
- **Flow layer**: animated arcs from every country to Kyiv (teal) and Moscow (copper); width and number of moving dots follow the yearly amount
  in the selected year. A wide faint line under each Russia arc shows the 2021 level, so a shrinking or growing flow is visible at a glance.
  Selecting a country highlights its arcs and dims the rest. With reduced motion the arcs are drawn without moving dots.
- Ukraine and Russia themselves are drawn as dark destinations, not coloured by data.
- Countries without data are hatched and labelled "No data yet", never shown as zero.
- Colour scales are logarithmic for totals (values range from millions to hundreds of billions).
- Neutral palette: support for Ukraine in teal, flows to Russia in copper. No national flag colours.

## Country panel

Order, top to bottom:
Headline numbers are shown as % of GDP first, with euros and per person underneath. Each panel also has a
**Data coverage** list (reported / estimated / missing per part), and the rankings view has a **Data gaps by country** table.

1. **Change since before the war**: the net shift, with a waterfall of aid, extra purchases from Ukraine and less (or more) paid to Russia.
2. **What it cost**: total opportunity cost, per person and % of GDP, split into aid, switching cost and tariffs dropped.
3. **Per year against 2021**: paid to Russia and bought from Ukraine as lines against a dashed 2021 level, the gap shaded teal (helps Ukraine) or copper (helps Russia).
4. **Categories**: one bar per category with its certainty letter; C and D are drawn lighter and show a low–high range.
5. **People**: volunteers and recruited fighters as counts.
6. **Companies**: number based in this country still operating in Russia, and taxes they paid there.
7. **Sources**: each source with its data date and a link.

## Interaction

- Hover (or tap) shows the country name and the current value.
- Click opens the panel; on phones the panel is a bottom sheet.
- The URL anchor holds the selected country (`#DEU`), so a link opens straight on it.
- An accessible table view lists every country with the same numbers.

## Build

- TypeScript + Vite, D3 (geo, zoom, scales) drawing SVG; Natural Earth 1:50m borders (`world-atlas` TopoJSON).
- Reads `data/world.json` on load, `data/country/<ISO3>.json` when a country opens.
- Light and dark theme follow the system.
- Deployed by Cloudflare Pages from `main`.
