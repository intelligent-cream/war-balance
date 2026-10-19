# Website: the map

> **Historical design note.** This page describes an early plan; the map was built differently (a single Python build script and static JSON, no warehouse or estimate cards). For the current method and data see the [documentation index](../README.md).

Current prototype: `site/index.html` reads `site/data.json` (built by `pipeline/build_data.py` from `research/2026-10/`).

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
| **View** | **Net (the sum)** (default) · Support for Ukraine · Change in payments to Russia · Cost to the country (since round 15; the first design had Change since 2021 · Cost carried · To Ukraine · To Russia) |
| **Measure** | **% of GDP** (default, the fairest comparison of sacrifice) · Per person · Total € |
| **Period** | from 2022 up to a chosen year, using the yearly values in `world.json` |
| **Find your country** | search box; zooms to the country and opens its panel |

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
