# Energy: transit gas, laundered oil, the energy premium and discount

Fuel is most of what the world buys from Russia, and it is where attribution is hardest: gas crosses several borders before it is burned, oil is refined in India or Türkiye and sold on as diesel, and trading hubs resell fuel to their own customers. This page explains how the map follows Russian fuel to the country that uses it. Prices and the war-time windfall are on the [prices page](#view=how&sec=m-prices).

Details for developers: [shares, caps, hub tables and research files](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/energy-and-laundered-oil.md).

## Payments to Russia for fuel

Customs data are the base. Two additions catch fuel that customs miss: for pipeline-gas buyers (the EU, Türkiye, Serbia, Moldova and others) each year takes the larger of customs and the fuel tracker of the Centre for Research on Energy and Clean Air (CREA), because customs often do not label pipeline gas as Russian; and Russian fuel delivered to the UAE that its customs do not record is added. The windfall line carries the uncertainty of the no-war price itself (Hungary EUR 0.5–16.2bn). Hungary and Slovakia are labelled "Kept buying Russian pipeline oil (EU exemption)".

## Transit gas

CREA assigns pipeline gas to the country where it enters (Germany for Nord Stream, Slovakia for the Ukrainian route). The map counts gas **where it is burned**, from Eurostat's imports by origin for 33 countries, at each country's own Russian gas price ([gas prices](#view=how&sec=m-prices-gas-prices-per-country)). Gas booked under other customs headings (Türkiye, Poland, part of Germany's) is not added twice.

## Laundered oil

"Russian oil bought via other countries" is fuel refined from Russian crude in India, Türkiye, China, the UAE or EU refineries and bought by someone else.

**Why the buyer is charged.** Part of the price of every tonne of that diesel is the Russian crude inside it, and without the buyer's demand there is no sale. Fuel is easy to trace to its crude, so a buyer can know. What Russia keeps on that crude is charged to the buyer, as if it had bought the crude itself. The refiner keeps only its margin and its discount, and its own payments to Russia are reduced by the same amount, so nothing is counted twice.

### Per-country values for the EU, USA, UK and Australia

The model got the EU total right but split it badly between members, so EU members use their own customs imports of fuel from India, Türkiye, the UAE, China, Singapore and Georgia, with the Netherlands and Belgium passing fuel on to their customers. They match CREA's per-country figures (2023: EU 2.60 vs 2.6; France 0.42 vs 0.42). The US, UK and Australia use CREA's figures. Two more routes are added: Brunei's refinery (mostly to Australia) and Russian fuel relabelled in Turkish ports (mostly to Greece). After the EU ban of 21 January 2026 on fuel made from Russian crude, the EU values drop sharply.

### Hub resale chain

Trading hubs resell part of what they buy, and the map passes each hub's resold share on to its customers, hub to hub until nothing is left in transit:

| hub | share resold (middle) |
|---|---|
| Netherlands | 0.74 |
| Togo | 0.65 |
| Singapore | 0.56 |
| Greece | 0.50 |
| Belgium | 0.48 |
| UAE | 0.42 |
| Türkiye | 0.20 |
| India | 0.15 |

Fuel sold to ships in port (bunkers) has no buyer country and stays with the hub. Gibraltar keeps a 10% margin on its bunker fuel.

### Valuing and capping

Only the **Russian crude inside** the fuel is money for Russia: about 0.63–0.82 of the fuel's price after the invasion, measured per refiner and year from what Russia was paid for the crude. It counts at Russia's net gain on crude. Laundered oil cannot exceed what an economy can use (at most 1–2% of GDP a year), so ship registries and storage points do not absorb fuel; records of fuel "exported" to Liberia, Panama and the Marshall Islands are bunkers sold to ships, and are dropped.

### Pre-war laundered oil

Fuel from Russian crude reached buyers before 2022 too (EUR 3–5bn a year, mostly via China). Like every trade part it is compared in volumes against its pre-war level, both ways: a buyer who now buys less Indian diesel made from Russian crude gets credit, one who buys more is charged. That a small buyer barely changes Russia's revenue (crude is fungible) is not built in; see [limitations](#view=how&sec=limitations).

## Refiners: counted once

Türkiye, India and China refine Russian crude and export part of the fuel. That exported part is charged to the buyers, so it is taken out of the refiner's own payments, at exactly the amount the buyers are charged. **EU refiners** are treated the same way: the Russian crude in fuel they exported (Lithuania, Finland, the Netherlands and others) is charged to their buyers by each refiner's 2021 export shares.

### EU-refined fuel: measured both ways

After the EU ban on Russian crude (December 2022) and fuel (February 2023), fuel from Russian crude reached small importers through India and Türkiye instead, a route our post-war data do not trace for many of them. Their apparent fall would be a gap in the data, not a change in behaviour. So **this route counts only where both the pre-war and the post-war route are measured**: for EU members (their own customs), and for buyers named in India's, Türkiye's or the UAE's own export records. Elsewhere the route is held at its no-war level and the panel says "route not measured after 2022".

| country | route counted for all | with the rule |
|---|---|---|
| Togo | +6.61 | −0.05 |
| Marshall Islands | +6.17 | +0.91 |
| Gibraltar | +2.88 | −0.10 |
| Tunisia | −5.51 | −7.09 |
| EU members | | unchanged |

### Growth, hubs and Nigeria

Pre-war growth applies only to the part it was measured on (fuel from China, India and Türkiye). Hubs pass EU-refined fuel on to their customers like other fuel. Nigeria's credit for buying less EU-refined fuel is labelled structural: the EU banned Russian-made fuel in 2023 and Nigeria's Dangote refinery opened in 2024. Lebanon, Nigeria, Libya and Moldova keep their credit because the post-war records name them.

## Turkey, a special case

Türkiye appears in almost every energy step: a transit and final-use gas country whose customs hide the gas, a refiner of Russian crude, a fuel hub whose customers are half in the EU, and a buyer whose crude and gas prices are hidden. Its prices are rebuilt from the energy regulator's volumes, Russian export prices and contract terms (gas about 70% hub-indexed).

## Energy premium and oil discount

**Not in the totals.** They belong to the cost view, which the site does not show; the full data download keeps them.

- **Extra paid to replace Russian energy**: the displaced volume × the premium over the Russian price. Largest: Germany EUR 34.5bn, Italy 18.5bn, the Netherlands 11.3bn.
- **Discount gained on Russian oil**: crude bought below Brent from March 2022, only the part beyond Russia's normal pre-war discount. Largest: India EUR 24.1bn, China 18.1bn, Türkiye 5.5bn.
