# Russian oil exports lost to Ukraine's strikes (round 51)

Data file: `research/2026-10/gaps/strike_supply_r51.json`. Script: `research/2026-10/scripts/strike_supply_r51.py`.
- `python3 -I research/2026-10/scripts/strike_supply_r51.py` writes the JSON from the figures in the script. Each figure cites its extract.
- `... fetch` downloads the sources again. It keeps short text extracts, with address and date, in `research/2026-10/raw/strike_supply_r51/`. The KSE trackers are read from `raw/kse_rot/`.

Applied by `pipeline/build_data.py` `strike_supply()` (constants `STRIKE_SUPPLY`, `STRIKE_EMBARGO`).

## The owner's decision

- Ukraine's strikes on Russia's refineries, ports and pipelines limit what Russia **can** export.
- A buyer that bought less because of that did not choose to: "we're gonna normalize for that ... it's just a lowering of the baseline".
- Sanctions, embargoes, the price cap and buyers switching suppliers are choices and stay counted.
- Russia's 2022 gas cut-off stays counted too. The owner's reason: it was a foreseeable answer to the buyers' own sanctions.

**Correction, same round:** the adjustment applies only to buyers whose purchases the strikes actually limited. These are the buyers that were willing and able to buy the product at the time. In the owner's words: "India ... limited by Ukraine hitting refineries, there's no intention there."
- A buyer whose own embargo had already stopped the product is not touched. For it the strike changed nothing.
- Lowering its baseline would wrongly shrink a drop it chose.

## Estimates

Units:
- Products are mb/d, year averages. 2026 is January to August, the map's period.
- Each figure is low / central / high.
- "Per tonne exported" is the volume lost per tonne Russia actually exported that year. It is the factor applied to each buyer's own purchases.

| year | runs lost to strikes | pass-through | products lost (mb/d) | Mt | share of no-war exports (2.95 mb/d) | per tonne exported |
|---|---|---|---|---|---|---|
| 2022 | 0 / 0 / 0.01 | 0.5 / 0.7 / 1.0 | 0 (capped) | 0 | 0 | 0 |
| 2023 | 0 / 0.015 / 0.05 | | 0 (capped) | 0 | 0 | 0 |
| 2024 | 0.09 / 0.15 / 0.25 | | 0.045 / 0.105 / 0.22 | 2.2 / 5.2 / 10.8 | 1.5% / 3.6% / 7.5% | 0.017 / 0.039 / 0.081 |
| 2025 | 0.18 / 0.26 / 0.33 | | 0.09 / 0.18 / 0.33 | 4.4 / 8.9 / 16.2 | 3.1% / 6.2% / 11.2% | 0.035 / 0.071 / 0.128 |
| 2026 | 0.75 / 0.85 / 0.95 | | 0.38 / 0.60 / 0.90 | 12.2 / 19.4 / 29.2 | 12.7% / 20.2% / 30.4% | 0.183 / 0.290 / 0.436 |

### Russia's product exports

IEA Oil Market Report, 13 May 2026. The table's sources are IEA, Kpler and Argus.

| | 2022 | 2023 | 2024 | 2025 | Jan-26 | Feb-26 | Mar-26 | Apr-26 |
|---|---|---|---|---|---|---|---|---|
| products, mb/d | 2.98 | 2.97 | 2.73 | 2.58 | 2.81 | 2.44 | 2.50 | 2.15 |

- **Later 2026 months.** June 1.83, July 1.40 and August 1.30 come from the KSE Institute Russian Oil Trackers of August and September 2026 (IEA basis). May is not found on that basis and is assumed to be 2.0, between April and June. The January to August average is 2.05.
- **2021.** 144.3 Mt (Federal Customs Service, via SeaNews; search summary only). That is about 2.94 mb/d.
- **The no-war level** is taken as 2.95 mb/d, the 2021–2022 level.
- **Cap.** The loss in any year is capped at the whole shortfall against the no-war level. In 2022 and 2023 exports were at the pre-war level, so no loss is counted, although single refineries were hit (Novoshakhtinsk 2022; Tuapse, Afipsky, Ilsky, Volgograd 2023). If those hits cut exports, it does not show in the data.

### Refinery runs lost to strikes

This is the judgement step.

- **2024.** Reuters (via Hydrocarbon Processing) counted 14% of primary capacity, about 900 kb/d, idle from drones at the end of March 2024. Most units were back within one to three months, and there were further hits in May and June. Year average: 0.15 mb/d (0.09–0.25).
- **2025.** January to July had hits on Ryazan, Volgograd, Kstovo and Saratov, about 0.12 mb/d. From August, runs were about 500 kb/d below pre-attack levels (Kpler, 18 Nov 2025). Reuters reported about 20% of capacity idle at the peak and 3% less refining over the year. Year average: 7/12 × 0.12 + 5/12 × 0.45 = 0.26 (0.18–0.33).
- **2026.** IEA: 4.7 mb/d in April and 3.8 in June. Kpler: about 3.8 in July and 58% of capacity down or attacked. KSE: 3.7 in July. Against 5.3–5.4 before the attacks (Kpler), the January to August average is about 0.85 below (0.75–0.95).
  - The Hormuz crisis raised demand for Russian barrels, so none of the 2026 fall is weaker demand.
  - The EU's 20th package (2026) added Tuapse to its banned list, but Tuapse's refinery had already been stopped by strikes.

### Pass-through to exports

A fall in throughput reaches exports at 0.5 / 0.7 / 1.0.
- **Why not 1.** Russia protects its home market. It exports crude instead (crude exports rose when runs fell: IEA, April 2026). Secondary units kept clean products running (Kpler).
- **Why not much below 1.** The export bans were answers to strike-driven shortages: gasoline from March 2024, gasoline and jet fuel from 1 April 2026, diesel in summer 2026. They push the loss onto exports.
- **Check against the data.** In January to August 2026, product exports fell about 0.6 mb/d against early 2025 while runs fell about 0.85, a ratio of about 0.7. In 2025, product exports fell 0.15 while runs fell about 0.15–0.2.
- **Bans.** The 2023 gasoline ban (September to November) answered domestic prices before the strike waves and is not counted. The bans from 2024 count through the pass-through, but not on top of it.

### Crude by sea

The ports were stopped for days at a time:
- Primorsk: September 2025, and 23 March 2026.
- Ust-Luga: about two weeks from 25 March 2026. Baltic loadings fell from 1.5 to 0.76 mb/d in the week of 30 March (IEA).
- Sheskharis: −370 kb/d for a week in April 2026 (IEA), and −58% month on month in August 2026 (CREA, via search).
- Novorossiysk: two days in November 2025.

Net of rerouting and of the crude that idle refineries freed for export, crude exports did not fall: 4.88 mb/d in April 2026, and 4.4 in June near records (IEA, KSE).
- **Central: 0 in every year.**
- **High end:** the gross volume of the outages, about 22 million barrels in 2026 (0.09 mb/d) and about 1–2 million in 2025.
- On the net figures the strikes probably raised crude exports. That is not counted: the owner asked for a lowering only.

### Druzhba south

- **August 2025.** A Ukrainian strike on the Nikolskoye pumping station (18 August) stopped flows to Hungary and Slovakia for about two days. A strike on Unecha (21–22 August) stopped them until 28 August. That is about 8 days in all.
  - Stocks covered the gap.
  - Some volume may have been made up later. Counted: 3 / 6 / 8 days, on each buyer's 2025 crude.
- **Czechia** had stopped Russian crude by its own choice in April 2025, so it is not affected.
- **Not counted: the halt of 27 January to 22 April 2026.** It followed a Russian strike on the pipeline at Brody in Ukraine, which is not a Ukrainian strike on Russia. Hungary blamed Ukraine for slow repairs. That is disputed and is not a strike.
  - The Ukrainian strike on Kaleykino (23 February 2026) fell inside that halt and stopped nothing more for these buyers.
- **Belarus** may have been affected by the Unecha strike. No evidence was found, so nothing is counted.

### Other products

- **Ammonia and fertiliser:** no strike-related loss was found. The Togliatti-Odesa pipeline was shut by the war in February 2022, not by a strike, and no measured loss was found at Taman.
- **Coal and LNG:** no measured strike loss. Not included.

## Allocation to buyers

For buyer c, product p (seaborne crude or products) and year t:

`lost = min(V × r × n, fs × s × n)`

- V: the buyer's own purchases of p that year, at 2019–2021 prices. This is `customs_fuel_volumes()`: its customs value at FOB, divided by its price level. Crude includes Türkiye's crude hidden in confidential codes.
- r: the volume lost per tonne exported.
- n: the no-war price level of p. Products use the no-war diesel and gasoil level, crude the no-war Urals level; 2026 uses the actual world price, as everywhere in the build.
- The cap: fs × s × n is the buyer's own no-war level of that product, its pre-war share held flat at the no-war price.

So:
- The loss is shared **pro rata over the buyers that actually bought the product at the time.** A buyer's baseline is never lowered by more than it would itself have bought.
- Destinations missing from the customs data are not allocated. A third of 2026's product cargoes have an "unknown" destination (KSE), and some buyers are not in `prices.json`. So the allocated total is lower than Russia's whole loss: about 60% in euros.
- **Embargo.** Buyers in `STRIKE_EMBARGO` (EU27, GBR, USA, CAN, AUS, NZL, CHE, NOR, ISL) get nothing for seaborne oil from 2023. EU seaborne crude was stopped from December 2022 and products from February 2023, by their own choice. Druzhba crude to Hungary and Slovakia is exempt and allocated directly.
- **Ordering.** In 2022 the embargoing buyers still bought products, but the 2022 loss is 0, so the order does not matter.

### Interaction with the rest of the build

- **"Less paid" and "more paid".** The change becomes actual − (expected − lost), which equals (actual + lost) − expected. The buyer is measured as if it had bought what it wanted. So for a buyer that bought more than before the war (India, Türkiye, China), "paid more to Russia" rises a little. For a buyer that bought less, "less paid" shrinks. Either way the strike is neither credited nor charged.
- **Windfall.** Untouched: it is actual volumes × (actual price − no-war price).
- **Laundered oil.** Untouched: it values the Russian crude in fuel bought elsewhere, and crude was not limited.
- **No-war price paths.** Not double counted: the loss is valued at the no-war price, like the expected path itself.
- **Bands.**
  - The yearly band takes the loss range (`bmul_lo` − the high loss, `bmul_hi` − the low loss).
  - The cumulative band (`cb`) keeps its width in euros and adds the loss range, weighted as `spread()` sums it (FRAC × cur × Russia's gain share).
  - The no-war price band (nrl/nrh) stays relative to the lowered path.
- **Small flows.** Their bias shift (`small_flow_bias()`, round 47) runs first, so the loss is taken off the shifted path, in euros.
- **Placebo** (`pipeline/placebo.py`): there were no strikes before the war, so the factor is 1 and the placebo is unchanged.

## Result

EUR 11.8bn of expected purchases over 2022–2026 (7.3–19.6bn) is taken out, for 58 buyers. About two thirds of it falls in 2026.

| buyer | taken out, EUR bn (low–high) | change in net |
|---|---|---|
| Türkiye | 2.9 (1.7–4.8) | −0.90 |
| China | 1.7 (1.2–3.3) | −0.50 |
| Singapore | 0.9 (0.5–1.5) | −0.42 |
| India | 0.8 (0.4–2.0) | −0.17 |
| Brazil | 0.8 (0.5–0.8) | −0.10 |
| Mongolia | 0.5 | −0.16 |
| Uzbekistan | 0.5 | −0.07 |
| Hungary, Slovakia (Druzhba) | 0.03 each | −0.01 each |

- **The change in net** is in EUR bn toward Russia, at Russia's gain share.
- **World totals.** Less paid to Russia: EUR 354.2bn before, 353.8bn after. More paid: 213.4bn before, 216.1bn after. Net: 140.8bn before, 137.6bn after.
- **Groups.** One change only: Taiwan's "Russia's earnings" moves from uncertain to near zero. No net group changes.

## What is uncertain

- **The runs lost and the pass-through are judgement.** The high end for 2026 (0.9 mb/d) equals the whole shortfall of product exports. Sanctions on Rosneft and Lukoil (October 2025) and the EU's own measures must have played some part.
- **May 2026 product exports are assumed.**
- **Allocation by customs value.** Customs are CIF and the export figures are FOB, a gap of 5–10%. Customs for 2026 cover January to August.
- **The pro-rata rule** assumes every buyer was cut in proportion. In fact Russia's bans fell on gasoline and diesel first, and Türkiye's imports halved in August 2026 under the diesel ban.
- **Druzhba August 2025.** Whether the lost days were made up later is not known.
- **The halt of January to April 2026** (Russian strike at Brody, Hungary blaming Ukraine's repairs) is not counted. Counting it would add roughly EUR 1bn for Hungary and Slovakia (about 85 days of their Druzhba crude).
  - **Round 52:** now counted, with Russia's 2023 export ban, as a forced loss under the owner's rule (`forced_loss_r52.json`, -notes.md): EUR 1.0bn for Hungary and Slovakia.
- **The evidence letter.** The new source is a research-type source. The site's evidence letter for "paid" may treat it as a measuring source, because it is not in index.html `METHOD_INPUTS`, which this round could not edit. Paid parts already rest on official customs, so no letter rises.
