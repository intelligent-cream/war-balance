# Energy: transit gas, laundered oil, the energy premium and discount

Fuel is most of what the world buys from Russia, and it is where attribution is hardest: gas crosses several borders before it is burned, oil is refined in India or Turkey and sold on as diesel, trading hubs resell fuel to their own customers, and buyers paid very different prices. This page explains how the map counts Russian gas where it is used, how "laundered" oil (fuel made from Russian crude elsewhere) is followed to its final buyer, how refiners are kept from being counted twice, and what the energy premium and oil discount in the cost view are. Price levels and the war-time windfall are on [prices.md](#view=how&sec=m-prices).

Code: the energy section of [build_data.py `build()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py), `reassign_laundered_oil()`, `uae_fuel_net()`. Research: [`energy.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy-notes.md)), [`energy2.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy2.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy2-notes.md)), [`crea.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/crea.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/crea-notes.md)).

## Payments to Russia for fuel

**The windfall's uncertainty.** The war-time price windfall's line carries the uncertainty of the no-war price itself (October-2021 forecasts to February-2022 futures), not only that of the actual prices. Where the windfall is worked out under each pre-war no-war gas path (16 gas-contract buyers, [`windfall_band_r24.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/windfall_band_r24.json)), the line takes the wider of the two: Hungary EUR 0.5-16.2bn. A method-band alternative values no-war gas at early-2021 forward prices (TTF EUR 17.5/MWh; Cal-22 traded at 16.7-18.1 in January-March 2021), the view that the late-2021 squeeze was war preparation. Hungary and Slovakia carry the label "Kept buying Russian pipeline oil (EU exemption)" ([Council Regulation (EU) 2022/879](https://eur-lex.europa.eu/eli/reg/2022/879/oj); background research in [`captive_buyers-notes.md`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/captive_buyers-notes.md)).

Customs data are the base for "paid to Russia". Two additions handle fuel that customs miss: <span class="incode">In the code: `trade_full.json`</span>

- **Pipeline-gas countries** (`PIPELINE_GAS`: the EU plus Turkey, Serbia, North Macedonia, Bosnia, Moldova, Switzerland, Georgia, Armenia, Kazakhstan, Kyrgyzstan, Uzbekistan, Belarus): each year takes the larger of all customs imports from Russia and the CREA fossil-fuel value, because customs often do not label pipeline gas as Russian. The CREA 2021 value enters the baseline at pre-war prices; the low base is the larger of the two lows (imports are at least the fuel value; [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/narrow-notes.md)).
- **UAE**: Russian fuel delivered to the UAE that UAE customs do not record (CREA 5.6bn in 2022, 6.1bn in 2023) is added, net of its resale; `uae_fuel_net()` takes out what UAE customs already record for 2024–2026.

2026 fossil payments are CREA's actual figures to the end of August.

## Transit gas

CREA assigns pipeline gas to the country where it enters: Germany for Nord Stream, Slovakia for the Ukrainian route, Bulgaria and Turkey for TurkStream. [`energy2.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy2.json) `transit_gas` gives gas by **country of final use** for 33 countries, mainly from Eurostat `nrg_ti_gas` (imports by origin, which leaves out pure transit; Germany's 55.4 bcm in 2021 matches about 56% of its consumption), with named estimates for Austria, Switzerland, Moldova, Slovakia, Hungary and Greece.

For these countries the pipeline:

1. values final-use gas at the country's **own Russian gas price**, see [prices.md](#view=how&sec=m-prices-gas-prices-per-country); <span class="incode">In the code: `gas_prices.json`, `MWH_PER_BCM = 10.55e6`</span>
2. replaces the gas share in the CREA value with final-use gas; <span class="incode">In the code: `non_gas_share()`</span>
3. takes the gas recorded in customs (HS 2711, [`customs_gas.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/customs_gas.json)) out of `to_rus` and adds final-use gas, yearly values and 2019–2021 baseline alike;
4. for **non-transit** countries keeps whichever is larger, customs gas or final-use gas (Greece's customs record more);
5. handles **gas booked under other customs headings** (`GAS_IN_CUSTOMS`: Turkey 100%, Poland 100%; Germany 14% in 2021 and 15% in 2022, from the EUR 2.3bn and 3.5bn of unlabelled gas in German customs, divided by German final-use Russian gas of EUR 16.6bn and 23.7bn) so it is not added twice ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit-notes.md)).

[`check_data.py`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/check_data.py) check 13 verifies that every gas user's 2021 payments include at least its final-use gas.

## Laundered oil

"Russian oil bought via other countries" is fuel refined from Russian crude in India, Turkey, China, the UAE or EU refineries and bought by someone else. Russia earned money on the crude, so the final buyer's purchase counts toward Russia.

**Why the buyer is charged.** A buyer of fuel refined from Russian crude pays for Russia's crude too: part of the price of every tonne of that diesel or jet fuel is the Russian crude inside it. Without the buyer's demand there is no sale, and no crude for Russia to sell into it. Fuel is easy to trace to its crude (refiners' crude slates, tanker tracking and customs records show it), so a buyer can know where it comes from. So what Russia keeps on that crude (its taxes and profit above a normal return) is charged to the buyer whose demand creates the sale, the same as if it had bought the crude itself. The refiner in between keeps only its refining margin and the discount it got on the crude; its own payments to Russia are reduced by the same amount, so nothing is counted twice ([below](#view=how&sec=m-energy-and-laundered-oil-refiners-counted-once)).

**Starting values** (`energy.json` `laundered_oil`): each refiner's HS 2710 exports to a destination × the Russian share of that refiner's crude (India 15% in 2022, 38% in 2023–24, 34% in 2025; China 17–20%; Turkey 35–54%), calibrated to CREA's named-refinery figures (central × 0.699). **EU members** are scaled to Global Witness's figure for Russian crude in EU imports (× 0.62, range 0.5–0.8; [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit-notes.md) item 4).

### Per-country values for the EU, USA, UK and Australia

The model got the EU total right (within about 5% of customs evidence) but split it badly between members.
[`apply_laundered_eu()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py) replaces the modelled values with customs-based ones from
[`laundered_eu.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_eu.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_eu-notes.md)):
Eurostat Comext imports of fuel (HS 2710) by member and origin (India, Türkiye, UAE, China, Singapore, Georgia) × the
Russian-crude share of each origin's exports × the crude-to-fuel value ratio, with the Netherlands (about 74% resold)
and Belgium (48%) passing fuel on to their customers, so each value is at the **final consumer**. Checked against
CREA's per-country figures for 2023 (EU 2.60 vs 2.6; France 0.42 vs 0.42; Italy 0.34 vs 0.32). USA, UK and Australia
come from CREA's country figures. Italy, Spain, France and Slovenia were too low in the model (they buy directly from
Jamnagar, Vadinar and STAR); the Netherlands, Germany, Malta and Cyprus too high (refiners' mirror data and bunkers).
2026 drops sharply after the EU ban of 21 January 2026 on fuel made from Russian crude.

Two more channels ([`laundered_r6.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_r6.json),
[notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_r6-notes.md)), added to the buyers and taken off the hub's own payments:

- **Brunei's Hengyi refinery**: Russian crude rose from 4–5% of its intake in 2022–23 to 37% in 2025 and 68% in 2026;
  its fuel goes mostly to Australia, then Singapore, Malaysia and Viet Nam (EUR 2.0bn of Russian crude in 2022–2026;
  checked against CREA's 2.6 Mt to Australia). Brunei's customs record only part of this crude, so its payments to
  Russia are its true Russian crude intake (refinery throughput × Russian share) minus what it passed on, plus any
  other goods: EUR 0.14–0.97bn a year kept for paraxylene, benzene and home use. Brunei's total <span class="incode">In the code: `apply_brunei_r6()`</span>
  moves from +6.6% to −4.8% of GDP (likely range −18% to +11%).
- **Turkish ports without refineries** (Ceyhan, Marmara Ereğlisi, Mersin): Russian fuel relabelled and sold to the EU,
  EUR 2.6–3.3bn a year in 2023–2025 (CREA/CSD), mostly Greece, which resells half. Counted at 0.76 per euro (Russian
  product, not refined). Greek imports labelled Iraq, Turkmenistan, Kazakhstan or Azerbaijan rose from EUR 0.04bn a
  year to 1.3–1.6bn. Türkiye's payments to Russia fall by what it passed on (EUR 7.3bn).

Not covered: non-EU buyers from the Turkish ports (about EUR 1–1.5bn a year, buyers unknown) and Georgia's Black Sea
terminals.

### Hub resale chain

Trading hubs buy fuel and resell part of it. `reassign_laundered_oil()` passes each hub's resold share to its customers (`HUB_RESALE` from `energy2.json` `hub_resale`; customers from [`hub_exports_2024.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hub_exports_2024.json), [`hub_buyers.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hub_buyers.json) and, for Togo, African importers' records in `refine.json`):

| hub | resale share low / middle / high | bunker share (middle) |
|---|---|---|
| Netherlands | 0.60 / 0.74 / 0.90 | 0.08 |
| Singapore | 0.45 / 0.56 / 0.87 | 0.38 |
| Togo | 0.45 / 0.65 / 0.90 | 0.02 |
| Greece | 0.30 / 0.50 / 0.75 | 0.06 |
| Belgium | 0.35 / 0.48 / 0.75 | 0.14 |
| UAE | 0.30 / 0.42 / 0.65 | 0.30 |
| Turkey | 0.10 / 0.20 / 0.45 | 0.02 |
| India | 0.05 / 0.15 / 0.36 | 0.02 |
| Malta, Gibraltar | ≤ 0.03 middle | mostly bunkers (Malta 0.81, Gibraltar 0.90) |
| Panama | 0 / 0.05 / 0.35 | 0.40 |

Fuel passed from one hub to another (India to the Netherlands, Belgium to the Netherlands) is passed on again until nothing is left in transit (`pass_on()`, up to 20 rounds). Fuel sold to ships in port (bunkers) has no buyer country and stays with the hub, except at the hub's low end. **Gibraltar** buys fuel to sell as bunkers to passing ships, paid for by shipowners elsewhere; like other resellers it keeps a margin of 10% (5–30%) of its Russian fuel and laundered oil (Gibraltar: −18.9% → −1.4% of GDP).

### Valuing and capping

- Only the **Russian crude inside** the fuel is money for Russia. That share is measured per refiner and year (`crude_k()`, [`crude_content.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/crude_content.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/crude_content-notes.md)): the price Russia was paid for the crude (FOB, after the discount; CREA's Urals and ESPO series) × tonnes of crude per tonne of fuel (about 1.06) ÷ the refiner's fuel export price (UN Comtrade HS 2710), averaged with a check by value (crude price ÷ what a barrel yields in products). Central values:

  | refiner | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
  |---|---|---|---|---|---|---|
  | India | 0.89 | 0.66 | 0.64 | 0.75 | 0.68 | 0.64 |
  | Türkiye | 0.89 | 0.67 | 0.67 | 0.78 | 0.71 | 0.67 |
  | China | 0.95 | 0.72 | 0.75 | 0.82 | 0.76 | 0.75 |
  | Brunei (Hengyi) | 0.90 | 0.66 | 0.63 | 0.74 | 0.67 | 0.63 |

  The crude money counts at Russia's net gain on crude in the change view ([overview](#view=how&sec=m-overview-the-net-gain-rule)).

  Fuel whose refiner is no longer known after trading hubs mixed it uses the refiners' average, weighted by their exports. India's measured share matches its own refinery data (EUR 18.5bn of Russian crude in EUR 28.5bn of fuel in 2022, 0.65). The buyer whose demand creates the sale is charged this part; the rest of the fuel price is the refiner's income, and its profit from the Russian discount is counted for the refiner ("discount gained" in the cost view, in the full data download only). CREA's one ratio, "EUR 4.2bn of crude in EUR 8.5bn of fuel", prices diesel alone, without refining losses or the cheaper products in the export mix, so it is not used; the EU figures and the Brunei channel are rescaled to these shares. <span class="incode">In the code: `laundered_eu.json`</span>
- Laundered oil cannot exceed what an economy can use: capped at 1% (middle) and 2% (high) of GDP per year, so ship registries and storage points (Marshall Islands, Liberia) do not absorb fuel. GDP from `residual.json` is loaded before the cap so it applies to small territories too. <span class="incode">In the code: `LAUNDERED_CAP`</span>
- Bunkers ([decisions](#view=how&sec=cl-r11)): refiners' and Greece's records of fuel "exports" to Liberia, the Marshall Islands and Panama are bunkers sold to ships under those flags, which the registries' own customs do not show; they are dropped, and Malta keeps only what its own customs record. Where fuel use is known the cap is fuel use × the share made from Russian crude × crude content (`LAUNDERED_CAP_BY`: Liberia 0.25% / 0.85%, Togo 0.27% / 0.89%, Malta 0.15% / 0.4%, Panama 0.02% / 0.09% of GDP), applied to the final values. Malta keeps half its bunker share less in the middle case (81% of its fuel imports leave as bunkers).

### Pre-war laundered oil

Fuel refined from Russian crude reached buyers before 2022 too: EUR 3–5bn a year, mostly via China ([`round4a.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4a.json) `laundered_prewar`, [notes §4](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4a-notes.md); 97 buyers, largest Singapore 0.73bn and Hong Kong 0.51bn a year). Only the rise above each buyer's 2018–2021 level and its pre-war growth `g` counts:

- the pre-war level goes through the same EU correction and the same hub pass-on chain as the yearly values, then × crude content;
- `bmul = (1 + g)^(year − 2019.5)`, and the range always includes no growth.

**In volumes, both ways.** Laundered oil is measured like every other trade part
: the Russian crude in the fuel at the crude price a <span class="incode">In the code: `laundered_volumes()` in `build_data.py`, `delta3()` in `calc()`</span>
no-war market expected (its price index is the Urals price paid over the no-war crude price), against its pre-war level
at 2019–2021 prices grown with `g` and the no-war crude price; falls count as well as rises, at Russia's net gain on
crude. Urals sold below the no-war price, so the same volume is worth more at no-war prices. The fungibility point (a small buyer of Indian diesel barely changes
Russia's revenue) is not built in; see [limitations](#view=how&sec=limitations). Buyers of fuel from EU refiners get credit
for the Russian crude that left that fuel after the EU's 2022 embargo, where both routes are measured ([below](#view=how&sec=m-energy-and-laundered-oil-eu-refined-fuel-measured-both-ways)).

## Refiners: counted once

Turkey, India and China refine Russian crude and export part of the fuel. That exported part is already counted at the buyers as laundered oil (95–100% per [`hub_buyers-notes.md`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hub_buyers-notes.md)), so it is taken out of the refiner's own payments to Russia. What is taken off the refiner equals what its buyers
are charged: the **exported fuel value × the refiner's own crude share for that year**, which the buyers' average is built from, so <span class="incode">In the code: `crude_k()`</span>
no crude money is lost between them (using the refiners' measured crude values instead, about 0.67 of the fuel,
would leave about EUR 14bn uncounted):

| refiner | exported fuel value | source |
|---|---|---|
| Turkey | EUR 0.4–3.6bn a year in 2022–2026 | `hub_buyers.json` `turkey_refining.by_year` |
| India | EUR 8–16bn a year | `hub_buyers.json` `india_refining` |
| China | crude value ÷ China's own measured crude share of its fuel exports (0.72–0.82 in 2022–2026, [`crude_content.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/crude_content.json)) | `round4a.json` `china_refining` |

[`check_data.py`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/check_data.py) check 15 verifies the refining source on Turkey and India.

**EU refiners are treated the same way.** The Russian crude in fuel that EU refiners (Lithuania, Finland, the Netherlands and 13 others) exported is charged to the buyers, like India's, Türkiye's and China's. The refiner keeps only what it used itself, before and after the war: the exported share of its Russian crude (`round4a.json` `eu_refiners`: Lithuania 0.70, the Netherlands 0.70, Slovakia 0.65, Finland 0.45 and so on; 2021 from the CREA tracker's crude tonnes at 2021 prices; later years from the same file) comes out of its payments and its pre-war level, and is charged to its buyers by each refiner's own HS 2710 exports by partner in 2021 (UN Comtrade, [raw/comtrade_2710](https://github.com/intelligent-cream/follow-the-money-ukraine/tree/main/research/2026-10/raw/comtrade_2710)). Fuel exported to Ukraine, to ships' bunkers or to places not on the map stays with the refiner. The part taken off counts at Russia's gain on crude, as for India. <span class="incode">In the code: `eu_refiner_exports()`</span>

### EU-refined fuel: measured both ways

Some small fuel importers would get large "less paid to Russia" credits from this route alone: Togo +6.6% of
GDP, the Marshall Islands +6.2, Gibraltar +2.9. Before the war their fuel came partly from EU
refiners using Russian crude, a route measured for every buyer (the refiners' 2021 exports by partner). After the EU
ban on Russian crude (5 December 2022) and fuel (5 February 2023), fuel made from Russian crude reached them through
India, Türkiye and others instead, and our post-war data do not trace that route to many small buyers. Their fall is a
gap in the data, not a change in what they did.

**Rule:** a change in this route counts for a buyer only where both the pre-war and the post-war
route are measured for that buyer. The post-war route counts as measured when:

1. the buyer is an **EU member**: its own customs records of fuel from India, Türkiye, the UAE, China, Singapore and
   Georgia ([`laundered_eu.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_eu.json), checked against CREA's per-country
   figures, [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/laundered_eu-notes.md)); or
2. the buyer is **named in the post-war fuel-export records** of India, Türkiye or the UAE (their own reports for
   2022–2025, top destinations, [`hub_buyers.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hub_buyers.json) `hubs`,
   [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hub_buyers-notes.md) §1), or among the importers that record fuel via Togo
   ([`refine.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refine.json) `togo_buyers`), **and** a cap does not set its post-war
   value (the GDP cap or `LAUNDERED_CAP_BY` binding in a war year: Togo, Liberia, Panama, Mozambique, ship
   registries).

The United States, the United Kingdom, Australia and Japan are covered under (2); CREA's per-country figures cover the
first three as well. China's and Singapore's exports have no researched destination list, so buyers reached only
through them are not counted as measured; for the large ones (Hong Kong, the Philippines, Vietnam) the EU route was
small and the effect is below 0.01 points.

Where the post-war route is not measured, the route's **2023–2026 values are held at the level expected without the
war** (its pre-war level × the buyer's pre-war growth × the no-war crude price), so no change is counted for it, and
the panel says "route not measured after 2022". 2022 keeps the EU refiners' own measured exports (the crude embargo
began in December). Refiners are unchanged: their exports are measured on their side. Code: `eu_refiner_exports()`;
the flag is `eu_route_held` in `data.json` `laund`; [`check_data.py`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/check_data.py) checks that no EU
member is held.

Of the 202 buyers of EU-refined fuel, 74 are measured both ways and 128 are held. Net, % of GDP, with the route counted for every buyer and with the rule:

| country | route counted for all | with the rule | why |
|---|---|---|---|
| Togo | +6.61 | −0.05 | fuel hub; its post-war value is its fuel-use cap, not a measurement |
| Marshall Islands | +6.17 | +0.91 | ship registry; no post-war record (2022 still counts) |
| Gibraltar | +2.88 | −0.10 | bunker port; not in the post-war records |
| Tunisia | −5.51 | −7.09 | not in the post-war records |
| Georgia | −1.11 | −2.48 | not in the post-war records |
| Aruba | +0.96 | −0.33 | not in the post-war records |
| North Macedonia, Albania, Montenegro, Bosnia and Herzegovina | | −0.5 to −0.75 each | supplied by Greek and other EU refiners before the war |
| EU members | | unchanged | both routes measured |

### Growth, hubs and Nigeria

- **Growth only on the base it was measured on.** The pre-war growth of laundered oil (`round4a.json`, about 10%
  a year) is measured on fuel refined from Russian crude in China, India and Türkiye before the war, so it applies only
  to that part of the pre-war base. The EU-refined part added in `eu_refiner_exports()` is flat (its pre-war level × the
  no-war crude price), and the held route (above) is flat too.
- **Hubs pass EU-refined fuel on.** EU-refined fuel bought by trading hubs (Rotterdam, Antwerp, Malta, Singapore,
  Greece, the UAE, Togo) is passed on to the hubs' customers through the same resale shares and chains as other
  laundered oil; fuel that comes back to the refiner through a hub (the Netherlands–Belgium–Germany <span class="incode">In the code: `_hub_chain()`</span>
  circle) is the refiner's own use and stays with it; bunker fuel sold to ships at a hub is charged to no country.
- **Nigeria.** Its products price index is screened as a data error (0.53 of the benchmark in 2023;
  [prices.md](#view=how&sec=m-prices-fuel-price-screen)), and its credit for less fuel bought from EU refiners is labelled
  structural on the map: the EU banned Russian-made fuel (2023) and Nigeria's Dangote refinery started production in
  January 2024 ([VOA](https://www.voaafrica.com/a/nigeria-s-dangote-refinery-starts-diesel-aviation-fuel-production/7438591.html)).

Lebanon, Nigeria, Libya and Moldova keep their credit: Türkiye's own records name
Lebanon, Libya and Moldova, and India's, the UAE's and Togo's buyers' records name Nigeria. If only EU members and the
G7 and Australia counted as measured, Moldova would move −2.46, Lebanon −2.22, Libya −2.06 and Nigeria −1.04 points
([limitations](#view=how&sec=limitations)).

## Turkey, a special case

Turkey appears in almost every energy step: a TurkStream transit and final-use gas country whose customs hide gas under other headings, a refiner of Russian crude, a fuel hub whose customers are 50–57% in the EU, a re-export hub for goods, and a buyer whose crude and gas prices are hidden by its customs. Its prices ([`turkey_prices.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/turkey_prices.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/turkey_prices-notes.md)) are rebuilt without the hidden customs lines: volumes from EPDK (the Turkish energy regulator), crude at the Russian Finance Ministry's Urals average plus freight, and gas from the contract terms (about 70% hub-indexed since 2021, spot purchases at 95% of TTF), checked against the customs residual for chapter 27 (2022: 101 vs 98 EUR/MWh). They confirm a measured index of about 3.3 in 2022, not the oil-formula gas price (1.75).

## Energy premium and oil discount

These are not in the totals. They belonged to the **cost** view ([overview.md](#view=how&sec=m-overview-the-cost-view)), which the site does not show; the full data download keeps them. From `energy.json`:

- **Extra paid to replace Russian energy** (switching cost) = displaced volume × replacement share × per-tonne premium, by fuel and month. Displaced volume is 2021 minus the year, when positive; replacement shares come from Eurostat (gas 1.0 in 2022, 0.885 in 2023, 0.635 later); the premium is TTF minus the Russian contract price for gas, and between the pre-war structural gap and the full discount forgone for crude and coal. Largest: Germany 34.5bn (17.3–48.7), Italy 18.5bn, Netherlands 11.3bn.
- **Discount gained on Russian oil** = crude tonnes × (Brent − CREA realised price) + products likewise, from March 2022, × 0.671 (median of published estimates: ICRA for India, Banque de France for China, Reuters for Turkey).
  - **Only the war's part:** Russian crude already sold about 5% below Brent before the war, and that part of the discount would have existed without the war. `apply_nowar_prices()` in `build_data.py` therefore multiplies the discount by `oil_discount_gain_factor` from [`energy_nowar.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy_nowar.json) `switching_cost_r7`: 0.731, 0.751, 0.659, 0.557 and 0.788 for 2022–2026 ([notes §3](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/energy_nowar-notes.md)).
  - Largest, 2022 to August 2026: India EUR 24.1bn (likely 17.7 to 35.9), China 18.1bn (13.3 to 26.9), Türkiye 5.5bn (4.1 to 8.3).
