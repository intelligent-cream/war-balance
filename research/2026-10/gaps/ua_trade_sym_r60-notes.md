# Purchases from Ukraine counted both ways, with Ukraine's own supply loss taken out (round 60)

Data file: `research/2026-10/gaps/ua_trade_sym_r60.json`. Script: `research/2026-10/scripts/ua_trade_sym_r60.py`
(`fetch`, `run`, `merge`; run with `python3 -I`). Raw extracts with URL and retrieval date (2026-10-29) are in
`research/2026-10/raw/ua_trade_sym_r60/` (not yet in `raw/MANIFEST.json`). The before/after on the site was computed
with the site's own `calc()` on `site/data.json` of 2026-10-29 (scratchpad `r60/ba.mjs`, then `merge`).

**Applied in round 60** (owner: "Yes, we should definitely count buying less from Ukraine … just like Russia"): `ua_supply_share()` in `pipeline/build_data.py` reads `mix_2021` and `ukraine_export_ratio_vs_2021_eur` from this file, and `calc()` counts the part with its sign. Central: the share rule against all of Ukraine's exports; the route variant is the method-band alternative `ua_route`; Belarus counted. When written, this was a design for the owner's decision, with the numbers it would give.

## Summary

- **The rule.** The expected purchase from Ukraine is the buyer's 2021 purchase (2021 held flat, as now) scaled, product
  group by group, by what Ukraine actually managed to export that year compared with 2021. The buyer keeps its 2021
  share of what Ukraine could sell. Buying more than that counts toward Ukraine, as now. Buying less now counts toward
  Russia. Both are valued at Ukraine's net gain per euro, the same weights the site uses now (`buy_ukr.gain`).
- **Ukraine's forced loss is taken out.** In 2023, for example, Ukraine exported 27% of its 2021 steel (in euros) and
  28% of its iron ore, but 77% of its grain and 100% of its oilseeds. A buyer of steel is expected to buy 27% of
  its 2021 steel, not 100%. Over 2022 to August 2026, the expected level for all buyers falls from EUR 317bn
  (2021 held flat) to EUR 192bn. Actual purchases were EUR 210bn.
- **The effect is small in money.** Ukraine's net gain is only 2-7 cents per euro of exports, so even a EUR 10bn
  shortfall counts as about EUR 0.5bn.
  - The sum over all countries of the "bought from Ukraine" part goes from EUR +0.38bn to +0.50bn.
  - 91 countries move toward Russia, by EUR 1.70bn in total. 50 countries move toward Ukraine, by EUR 1.82bn.
  - No country's net changes sign. Two figures already at zero flip: Israel (-0.009 to +0.001) and the British Indian
    Ocean Territory.
- **Charged most** (change in net, EUR bn; % of GDP):
  - China −0.57 (−0.003%; −0.34 in the route variant);
  - India −0.18;
  - Belarus −0.16 (−0.23% of GDP, the largest relative change; mostly Ukraine's own embargo, see doubts);
  - Pakistan −0.07, Iraq −0.06, Nigeria −0.06, Indonesia −0.05, Japan −0.05, Morocco −0.04, Ethiopia −0.04,
    Saudi Arabia −0.04, Netherlands −0.03.
- **Credited more than now:**
  - Poland +0.38 (now +0.03, new +0.41);
  - Germany +0.16, Türkiye +0.16, Czechia +0.12, Slovakia +0.13, Romania +0.11, Bulgaria +0.10, the US +0.10,
    Spain +0.09, Egypt +0.08, Austria +0.05, Moldova +0.03 (+0.18% of GDP).
  - These countries kept buying close to their 2021 amounts while Ukraine's exports fell. Because they kept or raised
    their share of a smaller supply, that now counts as support.
- **The bans barely register against the no-war level.** Before the war, Poland, Hungary, Slovakia and Romania bought
  almost no Ukrainian wheat, maize, rapeseed or sunflower seed. In 2021 Poland bought EUR 47m of them, Hungary 5m,
  Romania 2m and Slovakia 0. The bans took them back to about their pre-war level, not below it.
  - Poland's four crops, 2024 to August 2026: EUR 7m bought against EUR 110m expected, a shortfall of 0.10bn, or
    **−0.008bn** at Ukraine's gain.
  - Hungary, Slovakia, Romania and Bulgaria: about 0 or slightly positive.
  - What the bans really took from Ukraine is the war-time surge of 2022-2023: Poland bought EUR 0.96bn of the four
    crops in 2022 and 0.24bn in 2023. That surge counted for Poland as extra purchases. Under a no-war comparison, its
    end does not count against Poland, because the no-war world never had it. See "Bans" for how the owner could
    charge it instead.

## 1. Rule (proposed)

For buyer c, product group p, year t (2022 to August 2026):

```
baseline(c,t)  = base(c) x FRAC(t) x pidx(c,t)                          (the site's no-war level now: 2021 held flat)
R(p,t)         = Ukraine's exports of p to all destinations in t / in 2021   (EUR at current prices)
w(c,p)         = p's share of Ukraine's 2021 exports to c                    (Ukraine's own customs report)
expected(c,t)  = base(c) x pidx(c,2021) x FRAC(t) x sum_p w(c,p) R(p,t)
supply_factor  = expected / baseline = pidx(c,2021) x sum_p w R / pidx(c,t)  (= the site's bmul, real terms)
shortfall      = actual - expected                                          (negative = toward Russia)
value          = sum over t of shortfall(t) x gain(c,t)                     (signed, no floor)
```

- **Groups** are the ten of `net_gain_ukraine.json`: grain, oilseeds (12, 15, 2306), other food, iron ore (2601),
  steel (72-73), other metals, wood (44, 94), machinery, chemicals and other.
- **Implementation in the site would need two changes.**
  1. `buy_ukr.bmul` (with `bmul_lo` and `bmul_hi`) is multiplied by the supply factor. `cb`, the measured cumulative
     band, is kept and applied to the lower expected level.
  2. In `calc()`, the part `above3(T.buyUkr)` becomes `neg(delta3(T.buyUkr))`. That makes it signed: the yearly
     changes are summed and the total is not floored, as for "paid to Russia".
  - Its label becomes something like "Bought from Ukraine: more / less than expected".
- **The no-war baseline is the site's own.** For both flows, `ua_trade_cf.json` (round 6) chose 2021 held flat for
  every size class. The back-tests never cleared the bar. The cumulative bands per size class (`cb`) are reused.
  Unlike purchases from Russia, small flows here do not use the 2019-2021 median; that is also unchanged.

## 2. How Ukraine's forced supply loss is neutralised

`R(p,t)` is Ukraine's actual export of each group. The war is in it: the closed ports of 2022, the grain corridor
(August 2022 to July 2023), the Ukrainian corridor that followed, the loss of Mariupol and Azovstal, occupied
farmland, and power cuts at the steel works. The buyer is charged only for falling below its own 2021 share of that
smaller supply.

Ukraine's exports in EUR against 2021 (`ukraine_export_ratio_vs_2021_eur.global`):

| group | 2022 | 2023 | 2024 | 2025 | 2026 (Jan-Aug, annual rate) |
|---|---|---|---|---|---|
| grain | 0.87 | 0.77 | 0.87 | 0.65 | 0.76 |
| oilseeds | 1.15 | 1.00 | 1.08 | 1.00 | 0.98 |
| other food | 0.95 | 1.03 | 1.23 | 1.27 | 1.25 |
| iron ore | 0.48 | 0.28 | 0.45 | 0.35 | 0.28 |
| steel | 0.44 | 0.27 | 0.31 | 0.31 | 0.26 |
| machinery | 0.78 | 0.55 | 0.66 | 0.67 | 0.63 |
| chemicals | 0.52 | 0.35 | 0.38 | 0.36 | 0.36 |

How each year's figure is built:

- **2021-2024:** UN Comtrade, Ukraine as reporter. The totals are 65.6, 44.4, 36.1 and 41.6 USD bn.
- **2025:** the State Customs Service total (40.37 USD bn), split by the 2025 product mix already used in
  `net_gain_ukraine.json`.
- **2026:** January-August (26.70 USD bn) at an annual rate. It uses 2021's share of exports that fell in
  January-August (0.635; Comtrade monthly) and the 2026 mix (estimated, certainty C).
- **Currency:** USD values are converted at ECB average rates.

**Why the value is not deflated by product prices.** In site terms, value against value is a share rule: "the buyer
keeps its 2021 share of each product". The site then values the gap at each year's prices, as it does now. Grain's
2022 price spike therefore raises both the expected and the actual value; it is not counted as a volume gain.

**A built-in check.** If every buyer kept its share, the world sum of shortfalls would be about zero. It is
EUR +18bn: 210bn bought against 192bn expected. Importers' records (CIF, by origin, cleared in the EU) grew faster
than Ukraine's own records (FOB, by destination). Part of the reason is that EU entry countries cleared goods that
moved on to other buyers. This tilts the result slightly toward Ukraine for EU buyers.

## 3. Results

Totals for 2022 to August 2026 per country are under `countries.<ISO>.total_2022_2026aug` (actual, baseline,
expected, shortfall, value at gain, current part, symmetric without supply factor). Yearly rows have `baseline`,
`supply_factor`, `supply_factor_route`, `expected`, `actual`, `shortfall`, `gain_per_eur`, `value_at_gain`, `lo` and
`hi`. The yearly `lo` and `hi` are the envelope over the actual range, the gain range and the two supply-factor
variants. The site's own before/after per country is in `site_before_after`: buy part now and new with its band, net
now and new, change, change in % of GDP and sign flip. That band includes the measured cumulative band `cb`, which is
wide (×0.5 to ×3 on the expected level).

| country | actual | baseline | expected | shortfall | at gain (new part) | part now | net change | net now → new |
|---|---|---|---|---|---|---|---|---|
| China | 15.7 | 43.1 | 25.9 | −10.2 | −0.57 (−3.40…+0.20) | 0 | −0.57 | −127.8 → −128.4 |
| India | 5.0 | 11.5 | 9.5 | −4.4 | −0.18 | 0 | −0.18 | −70.5 → −70.6 |
| Belarus | 0.3 | 6.6 | 4.4 | −4.1 | −0.16 | 0 | −0.16 | −2.52 → −2.68 |
| Netherlands | 7.5 | 10.7 | 8.4 | −0.9 | −0.03 | 0 | −0.03 | 54.1 → 54.1 |
| Hungary | 6.1 | 9.4 | 5.6 | +0.5 | +0.006 | 0 | +0.006 | −11.41 → −11.40 |
| Italy | 8.5 | 17.2 | 8.0 | +0.4 | +0.02 | 0 | +0.02 | 34.4 → 34.4 |
| Romania | 6.9 | 7.2 | 4.0 | +2.9 | +0.11 | 0 | +0.11 | 8.77 → 8.88 |
| Slovakia | 4.6 | 4.1 | 2.0 | +2.7 | +0.17 | 0.05 | +0.13 | 0.17 → 0.29 |
| Bulgaria | 5.7 | 4.4 | 1.9 | +3.8 | +0.15 | 0.06 | +0.10 | 3.05 → 3.14 |
| Türkiye | 14.1 | 20.0 | 9.9 | +4.2 | +0.16 | 0 | +0.16 | −32.8 → −32.7 |
| Germany | 15.0 | 16.2 | 10.6 | +4.4 | +0.16 | 0 | +0.16 | 152.5 → 152.7 |
| Spain | 11.4 | 8.1 | 5.6 | +5.8 | +0.17 | 0.09 | +0.09 | 16.5 → 16.6 |
| Poland | 22.7 | 22.2 | 12.8 | +10.0 | +0.41 (−0.64…+0.85) | 0.03 | +0.38 | 37.4 → 37.8 |

(EUR bn, current prices, 2022 to August 2026.)

**Without the supply factor**, symmetric against the plain 2021 level (`symmetric_without_supply_factor`), the world
sum would be EUR −4.7bn. China would be charged −1.49bn, Italy −0.33bn and Türkiye −0.29bn. The neutralisation is
what keeps the war's own damage to Ukraine's exports off the buyers.

## 4. Bans and the EU's duty-free access

**What the measures were:**

| country | measure | sources |
|---|---|---|
| EU-wide | Ban on wheat, maize, rapeseed and sunflower seed for free circulation in PL, HU, SK, RO and BG, 2 May to 15 Sep 2023 | |
| Poland | National ban on the four crops (and some products of them) from 16 Sep 2023, still in force in May 2026 | `bans_2023`, `bans_2026` |
| Hungary | National ban on 24 farm products from Sep 2023 | |
| Slovakia | National ban on the four crops plus some other farm goods | |
| Romania | Import licences from 13 Oct 2023 for the four crops, for processors only; few or no imports at first | `romania_licences` |
| Bulgaria | Let the ban lapse on 15 Sep 2023 | |

No other national bans were found. Moldova, Lithuania and Latvia restricted Russian and Belarusian goods, not
Ukrainian ones.

**What the bans did to the figures** (`bans`, Comext, imports of the four crops from Ukraine):

- Purchases by all five countries went from about zero in 2021 to EUR 0.2-1.0bn each in 2022, and back to about zero
  from 2024.
- **Against the no-war level the bans cost almost nothing:**
  - Poland: −0.008bn at gain, 2024 to August 2026.
  - The other four: about 0, or above expected.
- The 2022-2023 surge counted for these countries. Now that the rule is symmetric, it counts in full rather than
  being floored away.
- Hungary moves by about 0 in total (+0.006). Its overall purchases from Ukraine fell from 1.96bn (2021) to 1.09bn
  (2025), while its 2021 mix was heavy in steel and iron ore, which Ukraine could not supply.

**If the owner wants the bans themselves charged**, the measure would be the ban against a war-time level without
the ban, not against the no-war level. The war-time level would be, for example, the average of the 12 months before
16 Sep 2023 for the banned lines.

- For Poland that is EUR 0.2-0.5bn a year less, or about −0.01 to −0.02bn a year at Ukraine's grain and oilseed gain
  (2-5 cents per euro).
- That is −0.03 to −0.06bn over 2024 to August 2026. It does not change any sign.
- **It breaks the "one rule"**: no other part has a war-time counterfactual. So it is not proposed, only sized.

**The EU's duty-free access (ATM, 4 June 2022 to 5 June 2025) is not double-counted:**

- **The tariffs given up** count only in the cost view ("Import tariffs dropped for Ukraine", `tariff3`, 0.3%). They
  are in neither the net nor the headline numbers.
- **Kiel** does not count trade preferences as aid.
- **The extra purchases** the ATM caused count once, in this part, at Ukraine's gain.
- **When the ATM ended** (June 2025: back to DCFTA quotas, then the revised Article 29 deal), any fall in EU purchases
  now counts against the member states that bought less. That is consistent with "the country's own choices": EU
  trade policy is the members' policy.

## 5. Variants and ranges

- **Route variant** (`supply_factor_route`, `buy_part_new_route_variant`).
  - The land neighbours (POL, HUN, SVK, ROU, MDA) are measured against Ukraine's exports to the neighbours. Everyone
    else is measured against Ukraine's exports to the rest. 2025-2026 use the 2024 split.
  - It treats the 2022 rerouting overland as forced: shipping by land because the ports were shut was not the
    buyers' choice.
  - It lowers the neighbours' credits: Poland −0.18 instead of +0.41, Slovakia +0.06, Romania 0.00, Hungary −0.09.
  - It raises distant buyers' credits: China −0.34 instead of −0.57.
  - World sum of the part: +0.59bn.
  - It is in the yearly `lo`/`hi`. **Recommended as the alternative shown in "how sure", not as the central value.**
    The EU opened the land routes deliberately (Solidarity Lanes, ATM), so those purchases are partly a choice.
- **Charge-only variant** (not computed separately; it follows from the columns).
  - Keep the current credit (above the 2021 level, floored) and charge only below `expected`. Between the two, nothing
    counts.
  - This version is not symmetric. Its charges equal the negative totals above for countries whose actual purchases
    are below expected; their current credit is 0 anyway.

## 6. Phrasing for pages

- trade.md table, row "bought from Ukraine": *"purchases from Ukraine against expected | Ukraine's net gain; more
  than expected counts for a country, less counts against it. Expected is the 2021 level, scaled product by product
  to what Ukraine could export during the war, so the war's damage to Ukraine's exports is held against no one."*
- Panel label: "Bought more from Ukraine than expected" / "Bought less from Ukraine than expected".
- Method sentence: *"A country that kept its pre-war share of Ukraine's exports is neutral. One that took more of
  what Ukraine could still sell helped Ukraine, and one that took less (an import ban, a switch to other suppliers)
  counts the other way. Ukraine's own losses (blocked ports, occupied land, the steel works of Mariupol) lower what
  every buyer is expected to buy."*
- On the bans: *"Poland, Hungary and Slovakia have banned some Ukrainian farm goods since September 2023. They bought
  almost none of them before the war, so against a world without the war the bans change little. What they ended
  was the extra trade of 2022-2023, which counts for these countries in those years."*

## 7. Doubts

1. **Belarus.** −4.1bn of its shortfall, −0.16bn at gain, comes from Ukraine's own embargo on trade with Belarus.
   - Here it is counted as a foreseeable answer to Belarus's own choice of hosting the invasion. The site likewise
     keeps Russia's own cut-offs in the totals and only labels them.
   - If the owner treats it as forced, set Belarus's supply factor to its actual: change 0. Russia has no `buy_ukr`.
2. **The share rule is zero-sum given Ukraine's supply.** One buyer's credit is another's charge.
   - That is right if Ukraine was supply-limited, which is clear for steel, ore and 2022 grain.
   - It is wrong where Ukraine was demand-limited: 2024-2026 farm goods, and the bans themselves. There a lost buyer
     is a real loss to Ukraine, but this rule only charges it when the buyer falls below its share.
   - `R(p,t)` also includes the effect of the buyers' own choices, though mostly of the small ones (the five ban
     countries took 0.2% of Ukraine's grain exports in 2021).
3. **Back-tests.** The share rule is the "SUP" shape of round 49, which did not beat 2021 held flat on Russia's
   history (0 of 35 cells).
   - It is used here not as a better forecast but to take out a known, forced supply loss. The owner's principle
     requires that, not accuracy.
   - The bands therefore stay the measured `cb` bands of the flat rule, applied to the lower expected level. They are
     wide: for most countries the new part's range crosses zero, e.g. China −3.40 to +0.20.
4. **Transit and the place of clearance.** Poland, Romania, Bulgaria and Slovakia clear goods that move on to other
   EU buyers, so their actual purchases may be overstated and their credits too large. The route variant is the
   lower end for them.
5. **2025-2026 product split.** These years use the customs mix of `net_gain_ukraine.json`; the 2026 split is an
   estimate (C). The 2026 annual rate uses 2021's January-August share. 2021 had a late, record harvest, so this may
   understate 2026 grain a little.
6. **Buyer's mix.** The mix is from Ukraine's report (FOB, by destination). It differs from the importer's report the
   site uses for the totals. Where Ukraine recorded under USD 1m to a partner, the world mix is used.
7. **Gain weights.** The year-t gain applies to both expected and actual, as the site does now. Ukraine's gain was
   very low in 2023 (2.5 cents), so 2023 shortfalls weigh little.

## Sources

The `sources` block of the JSON:

- UN Comtrade (Ukraine's exports by partner and chapter);
- the State Customs Service via export.gov.ua and Interfax-Ukraine;
- Eurostat Comext DS-045409;
- ECB EXR;
- the site's `data.json`;
- [Al Jazeera, 15 Sep 2023](https://www.aljazeera.com/news/2023/9/15/poland-hungary-to-continue-ban-on-ukrainian-grain-after-eu-lifts-embargo);
- [TVP World, May 2026](https://tvpworld.com/93484811/-eu-urges-poland-hungary-slovakia-to-lift-ukraine-grain-import-bans);
- [Interfax, Oct 2023 (Romania's licences)](https://interfax.com/newsroom/top-stories/95461/).
