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
  country's own streams on hover or when picked; a highlight's countries' streams; moving dashes, static arrows with
  reduced motion; off by default on phones. The old gross flow lines (canvas) are an option, "Gross trade flows".
- **Hover card**: support for Ukraine and kept from Russia as two bars, each with its sentence ("paid Russia €65.8bn
  (1.6% of GDP) less than without the war"), the net with its range, and the orange caveat for orange countries.
- **Filters drawer** (right side; a bottom sheet on phones, with the map visible above it), collapsed by default, a dot
  on the button when anything differs from the default. Seven sections with the same heading, spacing and left edge
  (owner: the drawer "can look better"): 1. **the map shows** (Net, Support for Ukraine, Kept from Russia, Cost to the
  country) and the **measure** (% of GDP, per person, total €) as full-width segmented controls, with the quick views
  "€ to Ukraine" and "Change in € to Russia"; 2. **find a country**; 3. **what's counted**, folded by default (16
  on/off switches with world totals, grouped toward Ukraine, kept from Russia and own line; "Showing the official
  numbers" under the heading, or "Custom mix, not the official figures" with "Reset to the official numbers", also
  under the title, in the panel and the tooltip); 4. **where and when**: region, group (EU, G7, NATO, BRICS, former
  Soviet Union), size and year; 5. **map layers**: streams, gross trade flows, the three markers (on/off switches) and
  zoom; 6. **rankings and top lists**: the pages (Map, Ranking, Ukraine vs Russia, Table & data, How it works,
  Sources), Top lists, and the top ten and bottom five of the current view, folded; 7. **display**: light or dark,
  language.
- **Highlights**: seven chips; one highlights its countries (others dimmed) and shows a small closable fact card with
  its caveat.
- **Country panel**: side panel on desktop, bottom sheet on phones; each number once (owner: "all the information
  (some duplicated)"). 1. The header: name, a one-sentence lead in words (which part the net mostly is and why), and
  the net with €, likely range, certainty and average year. 2. **The two parts**, side by side (stacked on phones):
  support for Ukraine and kept from Russia, each with its value in % and €, a bar, what it is in words, likely range,
  grade and average year; Russian money frozen on its own line. 3. **What changes the meaning here**: at most four
  notes. 4. **The five biggest parts**, each opening its method in place (how, why with its decisions, the country's
  sources with exact tables, method page, trace), and "Show the other N parts" (only the rest). 5. Folded sections:
  what it cost the country (with money flowing back), method band and alternatives (with the method notes, coverage,
  "How this is calculated" and a link to the waterfall in How it works), markers (critical goods, wages, taken by
  Russia), sanctions or own choice, per year against the pre-war level, aid, companies and people, share and compare
  (with the map value in € per person or total €), and the numbered sources.
- **Other pages**, from Filters or the page tabs in the header line once one is open: Ranking, Ukraine vs Russia,
  Table & data (CSV, CSV with every part, JSON), How it works, and Sources (the method in four lines, how decisions are
  made, then every money flow with how, why, sources and research files).

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
| **View** | **Net (the sum)** (default) · Support for Ukraine · Kept from Russia ("Change in payments to Russia" until round 17) · Cost to the country (since round 15; the first design had Change since 2021 · Cost carried · To Ukraine · To Russia) |
| **Measure** | **% of GDP** (default, the fairest comparison of sacrifice) · Per person · Total € |
| **Period** | from 2022 up to a chosen year, using the yearly values in `world.json` |
| **Find a country** ("Find your country" until round 17; in Filters) | search box; zooms to the country and opens its panel |

- **Change since 2021** is the main view: net shift = aid + purchases from Ukraine above the 2021 level + the drop in payments
  to Russia below the 2021 level (paying Russia more counts negative). Diverging colours: copper = shifted toward Russia, teal = toward Ukraine.
- **Cost to the country** ("Cost carried" before round 15) is the opportunity cost, after gains: aid + extra price of replacing Russian energy + lost sales to Russia + tariffs dropped for Ukraine.
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
