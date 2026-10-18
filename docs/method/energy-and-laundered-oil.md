# Energy: transit gas, laundered oil, the energy premium and discount

Fuel is most of what the world buys from Russia, and it is where attribution is hardest: gas crosses several borders before it is burned, oil is refined in India or Turkey and sold on as diesel, trading hubs resell fuel to their own customers, and buyers paid very different prices. This page explains how the map counts Russian gas where it is used, how "laundered" oil (fuel made from Russian crude elsewhere) is followed to its final buyer, how refiners are kept from being counted twice, and what the energy premium and oil discount in the cost view are. Price levels and the war-time windfall are on [prices.md](prices.md).

Code: the energy section of [build_data.py `build()`](../../pipeline/build_data.py), `reassign_laundered_oil()`, `uae_fuel_net()`. Research: [`energy.json`](../../research/2026-10/gaps/energy.json) ([notes](../../research/2026-10/gaps/energy-notes.md)), [`energy2.json`](../../research/2026-10/gaps/energy2.json) ([notes](../../research/2026-10/gaps/energy2-notes.md)), [`crea.json`](../../research/2026-10/crea.json) ([notes](../../research/2026-10/crea-notes.md)).

## Payments to Russia for fuel

Customs data (`trade_full.json`) are the base for "paid to Russia". Two additions handle fuel that customs miss:

- **Pipeline-gas countries** (`PIPELINE_GAS`: the EU plus Turkey, Serbia, North Macedonia, Bosnia, Moldova, Switzerland, Georgia, Armenia, Kazakhstan, Kyrgyzstan, Uzbekistan, Belarus): each year takes the larger of all customs imports from Russia and the CREA fossil-fuel value, because customs often do not label pipeline gas as Russian. The CREA 2021 value enters the baseline at pre-war prices; the low base is the larger of the two lows (imports are at least the fuel value; this fixed a bug found in [narrow-notes.md](../../research/2026-10/gaps/narrow-notes.md)).
- **UAE**: Russian fuel delivered to the UAE that UAE customs do not record (CREA 5.6bn in 2022, 6.1bn in 2023) is added, net of its resale (audit 2, question 2); `uae_fuel_net()` takes out what UAE customs already record for 2024–2026.

2026 fossil payments are CREA's actual figures to the end of August.

## Transit gas

CREA assigns pipeline gas to the country where it enters: Germany for Nord Stream, Slovakia for the Ukrainian route, Bulgaria and Turkey for TurkStream. [`energy2.json`](../../research/2026-10/gaps/energy2.json) `transit_gas` gives gas by **country of final use** for 33 countries, mainly from Eurostat `nrg_ti_gas` (imports by origin, which leaves out pure transit; Germany's 55.4 bcm in 2021 matches about 56% of its consumption), with named estimates for Austria, Switzerland, Moldova, Slovakia, Hungary and Greece.

For these countries the pipeline:

1. values final-use gas at the country's **own Russian gas price** (`gas_prices.json`, `MWH_PER_BCM = 10.55e6`), see [prices.md](prices.md#gas-prices-per-country);
2. replaces the gas share in the CREA value with final-use gas (`non_gas_share()`);
3. takes the gas recorded in customs (HS 2711, [`customs_gas.json`](../../research/2026-10/gaps/customs_gas.json)) out of `to_rus` and adds final-use gas, yearly values and 2019–2021 baseline alike;
4. for **non-transit** countries keeps whichever is larger, customs gas or final-use gas (Greece's customs record more);
5. handles **gas booked under other customs headings** (`GAS_IN_CUSTOMS`: Turkey 100%, Poland 100%, Germany 7%) so it is not added twice. This audit fix cut Turkey's payments to Russia from EUR 220bn to 184.5bn ([audit-notes.md](../../research/2026-10/gaps/audit-notes.md)).

[`check_data.py`](../../pipeline/check_data.py) check 13 verifies that every gas user's 2021 payments include at least its final-use gas.

## Laundered oil

"Russian oil bought via other countries" is fuel refined from Russian crude in India, Turkey, China or the UAE and bought by someone else. Russia earned money on the crude, so the final buyer's purchase counts toward Russia.

**Starting values** (`energy.json` `laundered_oil`): each refiner's HS 2710 exports to a destination × the Russian share of that refiner's crude (India 15% in 2022, 38% in 2023–24, 34% in 2025; China 17–20%; Turkey 35–54%), calibrated to CREA's named-refinery figures (central × 0.699). **EU members** are scaled to Global Witness's figure for Russian crude in EU imports (× 0.62, range 0.5–0.8; [audit-notes.md](../../research/2026-10/gaps/audit-notes.md) item 4).

### Per-country values for the EU, USA, UK and Australia (round 5)

The model got the EU total right (within about 5% of customs evidence) but split it badly between members.
[`apply_laundered_eu()`](../../pipeline/build_data.py) replaces the modelled values with customs-based ones from
[`laundered_eu.json`](../../research/2026-10/gaps/laundered_eu.json) ([notes](../../research/2026-10/gaps/laundered_eu-notes.md)):
Eurostat Comext imports of fuel (HS 2710) by member and origin (India, Türkiye, UAE, China, Singapore, Georgia) × the
Russian-crude share of each origin's exports × the crude-to-fuel value ratio, with the Netherlands (about 74% resold)
and Belgium (48%) passing fuel on to their customers, so each value is at the **final consumer**. Checked against
CREA's per-country figures for 2023 (EU 2.60 vs 2.6; France 0.42 vs 0.42; Italy 0.34 vs 0.32). USA, UK and Australia
come from CREA's country figures. Italy, Spain, France and Slovenia were too low in the model (they buy directly from
Jamnagar, Vadinar and STAR); the Netherlands, Germany, Malta and Cyprus too high (refiners' mirror data and bunkers).
2026 drops sharply after the EU ban of 21 January 2026 on fuel made from Russian crude.

Not yet covered: Brunei's Hengyi refinery (about 60% Russian crude, a main source of Australia's fuel in 2025–26) is
not in the refiner list, and relabelled Russian products from Turkish ports without refineries (Ceyhan, Marmara
Ereğlisi, Mersin; EUR 3.1–3.3bn a year to the EU, mostly Greece) are recorded under other origins in EU customs.

### Hub resale chain

Trading hubs buy fuel and resell part of it. `reassign_laundered_oil()` passes each hub's resold share to its customers (`HUB_RESALE` from `energy2.json` `hub_resale`; customers from [`hub_exports_2024.json`](../../research/2026-10/gaps/hub_exports_2024.json), [`hub_buyers.json`](../../research/2026-10/gaps/hub_buyers.json) and, for Togo, African importers' records in `refine.json`):

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
| Malta, Gibraltar, Panama | ≤ 0.03 middle | mostly bunkers |

Fuel passed from one hub to another (India to the Netherlands, Belgium to the Netherlands) is passed on again until nothing is left in transit (`pass_on()`, up to 20 rounds). Fuel sold to ships in port (bunkers) has no buyer country and stays with the hub, except at the hub's low end. **Gibraltar** buys fuel to sell as bunkers to passing ships, paid for by shipowners elsewhere; like other resellers it keeps a margin of 10% (5–30%) of its Russian fuel and laundered oil (Gibraltar: −18.9% → −1.4% of GDP).

### Valuing and capping

- Only the **Russian crude inside** the fuel is money for Russia: `CRUDE_CONTENT = 0.42 / 0.50 / 0.60` of the fuel value (CREA: EUR 4.2bn of Russian crude in EUR 8.5bn of fuel, moved with prices; lowered from 0.60 / 0.68 / 0.75 in round 5).
- Laundered oil cannot exceed what an economy can use: capped at 1% (middle) and 2% (high) of GDP per year (`LAUNDERED_CAP`), so ship registries and storage points (Marshall Islands, Liberia) do not absorb fuel. GDP from `residual.json` is loaded before the cap so it applies to small territories too.

### Pre-war laundered oil

Fuel refined from Russian crude reached buyers before 2022 too: EUR 3–5bn a year, mostly via China ([`round4a.json`](../../research/2026-10/gaps/round4a.json) `laundered_prewar`, [notes §4](../../research/2026-10/gaps/round4a-notes.md); 97 buyers, largest Singapore 0.73bn and Hong Kong 0.51bn a year). Only the rise above each buyer's 2018–2021 level and its pre-war growth `g` counts:

- the pre-war level goes through the same EU correction and the same hub pass-on chain as the yearly values, then × crude content;
- `bmul = (1 + g)^(year − 2019.5)`, and the range always includes no growth;
- on the map, `above3()` counts only the rise, in money (no price index), so higher fuel prices count too.

## Refiners: counted once

Turkey, India and China refine Russian crude and export part of the fuel. That exported part is already counted at the buyers as laundered oil (95–100% per [`hub_buyers-notes.md`](../../research/2026-10/gaps/hub_buyers-notes.md)), so its crude value is taken out of the refiner's own payments to Russia, which then cover only what it uses itself:

| refiner | exported crude value | source |
|---|---|---|
| Turkey | EUR 2.1–3.6bn a year in 2022–2025 | `hub_buyers.json` `turkey_refining.double_count_at_turkey` |
| India | per year | `hub_buyers.json` `india_refining` |
| China | per year | `round4a.json` `china_refining` |

[`check_data.py`](../../pipeline/check_data.py) check 15 verifies the refining source on Turkey and India. **EU refiners' exports** (Lithuania, Finland, others) are not counted as laundered oil anywhere and stay with the refiner country (`round4a.json` `eu_refiners`).

## Turkey, a special case

Turkey appears in almost every energy step: a TurkStream transit and final-use gas country whose customs hide gas under other headings, a refiner of Russian crude, a fuel hub whose customers are 50–57% in the EU, a re-export hub for goods, and a buyer whose crude and gas prices are hidden by its customs. Its prices (round 5, [`turkey_prices.json`](../../research/2026-10/gaps/turkey_prices.json), [notes](../../research/2026-10/gaps/turkey_prices-notes.md)) are rebuilt without the hidden customs lines: volumes from EPDK (the Turkish energy regulator), crude at the Russian Finance Ministry's Urals average plus freight, and gas from the contract terms (about 70% hub-indexed since 2021, spot purchases at 95% of TTF), checked against the customs residual for chapter 27 (2022: 101 vs 98 EUR/MWh). The old measured index (3.3 in 2022) was right; the oil-formula gas price (1.75) was not. This raises Türkiye's war-time windfall and lowers its volume change: −5.9% → −6.6% of GDP, with a narrower range.

## Energy premium and oil discount

These are in the **cost** view only ([overview.md](overview.md#the-cost-view)), from `energy.json`:

- **Extra paid to replace Russian energy** (switching cost) = displaced volume × replacement share × per-tonne premium, by fuel and month. Displaced volume is 2021 minus the year, when positive; replacement shares come from Eurostat (gas 1.0 in 2022, 0.885 in 2023, 0.635 later); the premium is TTF minus the Russian contract price for gas, and between the pre-war structural gap and the full discount forgone for crude and coal. Largest: Germany 34.5bn (17.3–48.7), Italy 18.5bn, Netherlands 11.3bn.
- **Discount gained on Russian oil** = crude tonnes × (Brent − CREA realised price) + products likewise, from March 2022, × 0.671 (median of published estimates: ICRA for India, Banque de France for China, Reuters for Turkey). Largest: India 33.8bn, China 24.9bn, Turkey 7.7bn.

## See also

- [prices.md](prices.md): fuel price indices, gas prices per country, the windfall
- [trade.md](trade.md): customs data, freight removal, re-export hubs
- [services-shipping-companies.md](services-shipping-companies.md#shipping): tankers carrying Russian oil
- Research notes: [energy-notes.md](../../research/2026-10/gaps/energy-notes.md), [energy2-notes.md](../../research/2026-10/gaps/energy2-notes.md), [hub_buyers-notes.md](../../research/2026-10/gaps/hub_buyers-notes.md), [refine-notes.md](../../research/2026-10/gaps/refine-notes.md), [round4a-notes.md](../../research/2026-10/gaps/round4a-notes.md), [crea-notes.md](../../research/2026-10/crea-notes.md)
- [Documentation index](../README.md)
