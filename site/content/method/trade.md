# Goods trade with Russia and Ukraine

Goods trade is the largest part of the map for most countries: what each country bought from and sold to Russia and Ukraine, 2019 to August 2026. This page covers where the numbers come from (UN Comtrade, IMF, Eurostat, mirror data, official statements for non-reporters), how the pipeline moves value to the country where it really belongs (re-export hubs, the Baltic pass-through, Hong Kong gold, Russia's unexplained imports), why freight is taken out of import values, why sales count as profit rather than revenue, and how the sanctions label splits a cut into "required" and "own choice". Energy-specific steps (transit gas, laundered oil) are on [energy-and-laundered-oil.md](#view=how&sec=m-energy-and-laundered-oil).

## Sources and filling order

Base file: [`trade_full.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/trade_full.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/trade_full-notes.md)), 233 economies, four flows, 2019–2025 plus 2026 January–August. It extends the first-round [`trade.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/trade.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/trade-notes.md)). <span class="incode">In the code: `imports_from_RUS`, `exports_to_RUS`, `imports_from_UKR`, `exports_to_UKR`</span>

Values are taken in this order, and the `basis` field records which was used:

1. **reported**: the country's own customs report (UN Comtrade, 2019–2025; for EU members in 2026, Eurostat Comext January–August, scaled to the Comtrade level), certainty A;
2. **mirror**: Russia's or Ukraine's report on the same flow, divided by the median mirror/reported ratio (imports from Russia 0.847, exports to Russia 1.320, imports from Ukraine 0.810, exports to Ukraine 1.388; these reflect CIF/FOB valuation and origin attribution), certainty B;
3. **imf**: IMF IMTS, spliced to the Comtrade level; rejected when its implied growth is outside the 5–95th percentile of reporters (65 values rejected), certainty B;
4. **estimated**: interpolation or the median growth of reporting countries, certainty C.

Russia publishes no partner detail after 2021, so trade with Russia from 2022 is always what the other country reports. 2026 uses Comext January–August for the EU, IMF monthly data elsewhere, and otherwise the 2025 rate × 8/12 (marked `*`, see [ranges.md](#view=how&sec=m-ranges-2026-and-the--mark)).

In the pipeline ([build_data.py `build()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py), first section) better data replace these values at customs level, so every later step applies to them too:

- [`narrow.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/narrow.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/narrow-notes.md)): official statistics for countries with the widest ranges (Belarus Union State and Belstat totals, Kazakhstan, Kyrgyzstan, Armenia, Uzbekistan, Georgia, Turkey, Moldova and others);
- [`round4b.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4b.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4b-notes.md)) for the UAE: its customs totals, which equal the official non-oil trade with Russia (USD 20.4bn in 2025); applied after `narrow.json`.

**Non-reporters.** [`nonreport.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/nonreport.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/nonreport-notes.md)) corrects 21 partners that do not report (Libya, Venezuela, Syria, Turkmenistan, Tajikistan, Afghanistan, Cuba, Sudan, Yemen, North Korea, Iran, Lebanon and others) with tanker tracking (CREA, Kpler), official statements and partner customs. Only the **paid share** of Russian supplies counts as money to Russia; supplies on credit, as aid or barter are Russian support, not payments. <span class="incode">In the code: `paid_share`</span>

### Why UN Comtrade and not Eurostat for EU members

EU members' trade with Russia is published twice, and the two can differ a lot for a single country while agreeing for
the EU as a whole (imports from Russia, EUR bn):

| | this map (UN Comtrade) | Eurostat Comext |
|---|---|---|
| EU total, 2021 | 152.0 | 163.6 |
| EU total, 2023 | 49.3 | 50.8 |
| Netherlands, 2021 | 18.5 | 26.5 |
| Belgium, 2021 | 6.3 | 7.8 |
| Austria, 2023 | 0.36 | 3.67 |

They count different things:

- **UN Comtrade** holds each country's own customs figures (the *national concept*): goods bought for that country's
  economy.
- **Eurostat Comext** uses the EU's *community concept*: goods are booked where they cross the EU border or are cleared.
  Russian goods landing in Rotterdam or Antwerp and going on to Germany or Czechia count for the Netherlands or Belgium
  ("quasi-transit"), and goods cleared in one member for another count for the first.
- Austria's own statistics hide the origin of its gas, so its imports from Russia look small in Comtrade; the map counts
  gas separately, where it is burned ([energy](#view=how&sec=m-energy-and-laundered-oil-transit-gas)), so that gas is not missed.

For the question "who paid Russia", the national concept is the better measure, and Comtrade uses the same definition
for every country in the world. The full comparison, 843 checks against UN Comtrade, Eurostat and CREA, is in
[`verify_r11_trade-notes.md`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/verify_r11_trade-notes.md).

## The pre-war level and the comparison

The trade loop stores `base` (initially the 2019–2021 average) and `base_range` (the extremes of the 2019–2021 average and the low/high baselines). For every flow in [`counterfactual.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/counterfactual.json), [build_data.py `counterfactual()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py) then resets `base` to 2021 at pre-war prices and sets the expected path `bmul`, except for small purchases from Russia (under EUR 1bn a year in 2019–2021), which start from the median of 2019, 2020 and 2021 at pre-war prices (the trade loop also keeps the yearly 2019–2021 values for this, `_pre`). Details: [counterfactual.md](#view=how&sec=m-counterfactual-small-flows-start-from-the-2019-to-2021-median).

How the four flows enter the net shift (`calc()` in [`site/index.html`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/site/index.html)):

| flow | part | counted as |
|---|---|---|
| `to_rus` | Less / more paid to Russia | change in volume, valued at each year's prices, × Russia's net gain per euro; the mix of what was bought from customs values per fuel |
| `from_rus` | Income lost on sales given up / income from extra sales | change in volume at each year's prices × the seller's net gain (taxes plus profit above a normal return of 5% a year above inflation plus the country's risk premium) × genuinely extra ([the net-gain rule](#view=how&sec=m-overview-the-net-gain-rule)) |
| `buy_ukr` | Extra purchases from Ukraine | rise above expected, each year, × Ukraine's net gain per euro; a fall is not held against a country |
| `sell_ukr` | Extra sales to Ukraine | rise above expected, × the seller's net gain × genuinely extra, subtracted as flowback |

## Profit, not revenue

Selling EUR 10bn less to Russia does not cost the seller EUR 10bn: the goods would have cost money to make. **One rule** applies to every seller ([overview](#view=how&sec=m-overview-one-rule-for-every-seller)).

**Every sale counts at the seller's net gain × genuinely extra.** Income from sales to Russia counts at the seller's net gain (taxes on production plus profit above a normal return on capital, 5% a year above inflation plus the country's risk premium, as a share of output ([overview](#view=how&sec=m-overview-the-net-gain-rule)), by country and industry, from OECD STAN: [`net_gain_sellers.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/net_gain_sellers.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/net_gain_sellers-notes.md)) times the share that is genuinely extra business (not sold elsewhere instead). Manufacturing earns little above that return, so sales given up or gained count at a small share of their value. Economies outside STAN use the OECD median of the industry. There are separate factors for sales lost and extra sales, and for goods and services (`c.vk` in `data.json`; `earned3()` in `calc()`). In the cost view this is "Income lost on sales to Russia". <span class="incode">In the code: `value_kept.json`</span>

**Purchases count at the seller's net gain too.** A purchase from Russia counts at Russia's net gain on that mix of goods (about 0.6 of the price for oil and gas, 0.1–0.2 for other goods), and an extra purchase from Ukraine at Ukraine's, so that trade and aid are on the same scale ([overview.md](#view=how&sec=m-overview-the-net-gain-rule)).

Counting sales at gross revenue would put Cyprus at +30% of GDP and Lithuania at +45% ([notes §5](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit2-notes.md)). `META.lost_margin` (a flat 20% margin) is still written to `data.json`, but `calc()` uses it only for a country without `vk`, and every country has one.

## Re-export hubs

Goods made in China or the EU and sold on to Russia through Armenia or the UAE should count for the country that made them, not for the hub. [build_data.py `apply_reexports()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py) uses [`reexports.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/reexports.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/reexports-notes.md)) for 11 hubs: UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan, Georgia, Uzbekistan, Azerbaijan, Serbia, Mongolia, Tajikistan.

- **Goods to Russia**: the re-exported part of the hub's exports to Russia moves to the origin countries (`origin_shares`; "EU27" split by members' own sales to Russia). The hub keeps its trading margin (goods 5–20%, UAE 3–15%; an educated guess).
- **Russian goods passed on** (gold and diamonds mostly): move from the hub's payments to Russia to the first buyers (`destination_shares`; UAE gold buyers from importers' records: Hong Kong 30%, India 19%, Switzerland 15%, Turkey 14%). Gold margin 0.3–6%.
- **Measured shares** ([`refine.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refine.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refine-notes.md)) replace the first guesses: Armenia 0.86–0.92, Kazakhstan 0.77–0.84, Kyrgyzstan 0.60–0.77, Turkey 0.31–0.36, Uzbekistan 0.61–0.83, Azerbaijan 0.36–0.43, Serbia 0.37–0.48.
- **UAE 2024–2026** re-exports and gold passed on are raised to match its customs totals. <span class="incode">In the code: `round4b.json`</span>
- **The pre-war level moves the same way**: `reexports_to_RUS_baseline_2019_2021` comes out of the hub's base and into the origins'; since the counterfactual starts from 2021, the pre-war re-exports are also taken out of the hubs' 2021 values.

Hubs are labelled on the map (`hub` field). Their trade keeps the 2021 level as the counterfactual ([counterfactual.md](#view=how&sec=m-counterfactual-6-which-model-is-used-for-which-flow)). Belarus's re-exports are moved too (below).

### Belarus

Belarus and Russia stopped publishing trade by product in 2022, so Belarus's re-exports to Russia are estimated from
what partners report shipping to Belarus ([`belarus.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/belarus.json),
[notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/belarus-notes.md)): EU used cars in 2022–23 (German, Polish and Lithuanian car
exports to Belarus rose from USD 0.36bn in 2021 to 2.53bn in 2023, then fell after Lithuania's 2024 ban), machinery and
electronics from China, Türkiye and the UAE, net of what only replaced lost EU supplies. EUR 0.6 / 1.7 / 1.2 / 0.8 / 0.6bn
in 2022–2026 against 0.25bn a year before the war, moved to the makers (China 45%, Germany 16%, Poland 15%, Lithuania
11%, Türkiye 7%) with a 10% margin kept. Chinese car kits assembled at BelGee are processing and stay Belarusian.

## Baltic and Finnish pass-through

Before the war much of the Baltic states' trade with Russia was transit: Estonia's oil entrepôt at Muuga, Latvian steel, Lithuanian re-exports (85–90% of its sales to Russia). Counting that as "given up" would make Lithuania +45% of GDP. [build_data.py `baltic_transit()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py), from [`audit2.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit2.json) question 6:

- takes the unprocessed transit share out of the imports from Russia of Estonia, Latvia, Lithuania and Finland, before and after the war alike;
- takes re-exports out of their sales to Russia (Lithuania 0.85, Estonia 0.39, Latvia 0.45, Finland 0.10) and gives them to the EU members that made the goods, by their own sales to Russia; a 7% margin stays;
- leaves crude refined in Lithuania and Finland (real processing).

The transit share is **not** added to the final buyers. Those buyers already record the goods: the EU, the US and most
other countries record imports by country of origin, so Russian diesel shipped to the Netherlands through Estonia is
already in Dutch imports from Russia. Adding it again would count it twice: the final buyers already carry it in
their own customs records.

## Residual gap

Russia's own customs record more imports than its partners report selling: EUR 29–46bn a year in 2022–2025 ([`residual.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/residual.json), [notes §2](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/residual-notes.md)). [build_data.py `apply_residual()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py) splits it:

| component (EUR bn) | 2022 | 2023 | 2024 | 2025 | where it goes |
|---|---|---|---|---|---|
| CIF/FOB valuation | 13.3 | 14.5 | 14.3 | 13.6 | not allocated |
| unrecorded transit via Kyrgyzstan | 3.2 | 5.8 | 6.7 | 8.6 | country of origin |
| unrecorded transit via Kazakhstan | 0.6 | 1.1 | 4.2 | 2.9 | country of origin |
| residual, pro rata | 11.3 | 15.7 | 14.9 | 20.7 | each country by its reported sales; hubs pass their re-exported share on to origins |

**Belarus is excluded**: it reports its full trade with Russia through Union State totals, so its pro-rata share is spread over the other countries ([`round4b.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/round4b.json) §3). The structural pre-war gap (about EUR 6bn a year) is not added to 2022–2026 only. The added value is in `from_rus`, certainty at best C, and its 2026 is estimated. <span class="incode">In the code: `est26`</span>

## Hong Kong gold

**Gold at the gold price.** Gold in a country's payments to Russia (tagged where the UAE and Hong Kong pass it on, and Hong Kong's own rise) is deflated with the gold price index (the customs panel of Russian gold, HS 7108, and the NBP gold fixing for 2026; [`prices.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/prices.json) benchmarks, rebased to 2019–2021 = 1: 1.08 in 2022, 1.16 in 2023, 1.50 in 2024, 2.05 in 2025, 2.66 in 2026), not with the country's pre-war mix. Hong Kong's pre-war imports from Russia were half palladium and platinum, whose price fell, so its own index (0.90 in 2023–2026) would make the volume of gold 1.3–3 times too large. Each year's index is the value-weighted mix of the gold index on the gold share and the country's own index on the rest. The gold price rise itself is not counted as a change, like any other non-fuel price rise. <span class="incode">In the code: `deflate_gold()`; `cur`</span>

The rise in Hong Kong's imports from Russia since before the war is taken to be precious metals (`HK_METALS_SHARE`, per year). It is measured from Hong Kong's own import records in UN Comtrade ([raw/comtrade_hkg](https://github.com/intelligent-cream/follow-the-money-ukraine/tree/main/research/2026-10/raw/comtrade_hkg)): precious metals (HS 71) were 56–67% of its imports from Russia in 2019–2021 and 85%, 99%, 98% and 99% in 2022–2025. Against the 2019–2021 average, HS 71 rose by more than the total in every year (other goods fell), so the share of the rise is 1.0 (capped; 2026 takes 2025's). The share passed on to mainland China (0.57 in 2022 falling to 0.37 in 2025, from Hong Kong's own gold trade in `refine.json`) counts for China; only the rise above the pre-war level is treated as gold in transit. Hong Kong is labelled a gold transit hub. Code: the end of `apply_residual()`.

**Only the gold that stays in Hong Kong counts for Hong Kong, at the no-war gold price.** From Hong Kong's own HS 7108 trade (UN Comtrade, [`hk_gold_r16.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hk_gold_r16.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/hk_gold-notes.md)): mainland China keeps its onward share (so it is not counted twice); the share Hong Kong exported elsewhere (0.21, 0.11, 0.34, 0.33 of its gold imports in 2022–2025) goes to those buyers by their share of its non-China gold exports, tagged as gold (Thailand, the UAE, India, Singapore, Korea, Indonesia; destinations that ban Russian-origin gold at half their share, as in the UAE rule); Hong Kong keeps the rest (0.22–0.34 of its rise). The change in the volume of gold is valued at the 2021 gold price held flat, like fuel at its no-war price, not at each year's gold price (index 2.86 in 2026); the gold price rise is not counted as a windfall in the central figure. Central banks' gold buying after Russia's reserves were frozen is widely linked to the war, so part of the rise may be the war's; the method band has "gold at its actual price" for that reason ([prices](#view=how&sec=m-prices-gold-at-its-no-war-price)). Hong Kong's direction is uncertain. Check 33 verifies that the China and elsewhere shares never exceed what Hong Kong imported. <span class="incode">In the code: `GOLD_NOWAR`</span>

## Gold and hidden channels

"Gold and hidden payments to Russia" holds money that appears nowhere in customs data ([`uncovered.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/uncovered.json) `hidden_channels`, [notes §2](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/uncovered-notes.md), certainty D): Kyrgyzstan's gold gap (partners record 16–52 t a year more than Kyrgyzstan exports; 0/25/75% assumed Russian), Hong Kong's 2026 gold, and high-band margins for China, Turkey, Kazakhstan, Armenia and India. UAE gold is in its customs data and is zero here. Kyrgyzstan's hidden gold is passed on to the buyers of Kyrgyz gold ([`kgz_gold.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/kgz_gold.json), UN Comtrade HS 7108 imports from Kyrgyzstan 2023–2024: Switzerland 37%, China 33% with Hong Kong, UK 15%, UAE 11%); Kyrgyzstan keeps 5%. The payments themselves are not added again: payment agents and crypto settle trade that customs already record. Only the fees the agents keep are added, since round 6 (next section).

## Payment agents

Agents in third countries settle much of Russia's trade outside normal banking and charge fees (3–4% in 2022–2024,
peaks of 10–15%, 2–2.5% since 2025) that are in neither customs values nor services data. The share of those fees kept
by residents (35–60%; the rest belongs to Russian-owned networks), against 2021, counts as money earned from Russia,
about EUR 7bn over 2022–2026: China 1.7bn, Kazakhstan 1.1, the UAE 1.0, Hong Kong 0.9, Türkiye 0.85, Kyrgyzstan 0.7
(checked against Kyrgyz banks' extra profits), Armenia 0.45. The country split is an educated guess (certainty D; C for
Kyrgyzstan). Crypto volumes (Garantex, the A7A5 rouble stablecoin) and the 2022 transfers of people leaving Russia have
no country split or are not payments to Russia, and are not counted
([`payment_channels.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/payment_channels.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/payment_channels-notes.md)).
The fees are a sale of financial services to Russia, so they count at the financial industry's net gain
(OECD median 0.20) × genuinely extra (0.5), about a tenth of the fees.

## Remittances and relocants

**A marker, not in the totals.** Migrant workers' remittances from Russia are not in the net shift, the cost view,
either headline number, the method band or the share cards ([decisions](#view=how&sec=cl-why-remittances-from-russia)):
they are individuals' wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain
over what the migrant could earn elsewhere is small and hard to measure; and they would dominate the bottom of the
ranking (Tajikistan about −40% of GDP, almost all of it remittances).

They are shown as a **marker** (△), like the [critical-goods marker](#view=how&sec=m-trade-goods-russias-weapons-need-the-critical-goods-marker):

- **What it shows**: the change in labour remittances from Russia against the expected no-war level, summed from 2022
  to the chosen year, in euros and as % of one year's GDP (the average of 2022–2024), with its likely range (the reported range of what
  was sent and of the expected level, combined as independent errors), and the total migrants sent from Russia in that
  time. Relocants' transfers stay out, as below. <span class="incode">In the code: `apply_remittances()`, `remit` in `data.json`</span>
- **Where**: a line in every country panel with data ("Depends on wages earned in Russia: remittances from Russia
  changed by X% of GDP since 2022 (not in the totals)" where migrants sent at least 1% of GDP a year from Russia over
  the period; without "depends" elsewhere), a map layer ("Wages from Russia": a triangle beside the critical-goods
  diamond, its size following the change), and columns marked "not in totals" in the CSV
  and the JSON. <span class="incode">In the code: `remittances_from_russia_change_*_not_in_totals`; `remittances_from_russia_change_not_in_totals`</span>
- **2022 to August 2026** (against average 2022–2024 GDP): Tajikistan EUR 9.4bn more than expected (81% of GDP; likely 40% to 131%; EUR 20.9bn sent in all),
  Uzbekistan 18.9bn more (19%), Kyrgyzstan 0.3bn more (2.4%; likely from 14% less to 16% more), Armenia 1.6% more, Belarus 1.1% more, Georgia
  0.3% less, Azerbaijan 0.6% less, Moldova 2.6% less, Kazakhstan about the same. The triangle shows for Tajikistan, Uzbekistan, Kyrgyzstan,
  Armenia, Georgia and Belarus.
- **How the change is measured**: the expected level is the 2019 and 2021 average grown at each country's pre-war
  trend ([`remittances.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/remittances.json),
  [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/remittances-notes.md)). Most of the rise comes from Russia's war economy pushing wages up (average wage 57,000
  roubles in 2021, 100,000 in 2025). Tajikistan's total from Russia is checked against EFSD's 2025 share of GDP (within
  6%); Uzbekistan's against its central bank. How only the pay above what the same work earns elsewhere would count is
  in [`remittances_r13-notes.md`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/remittances_r13-notes.md).

**Relocants are left out.** Money Russians brought or sent when they moved abroad after 2022 (savings, property
purchases, transfers through local accounts) is money leaving Russia, which hurts Russia; counting it toward Russia
would be the wrong sign, and counting it toward Ukraine would credit countries for something unrelated to Ukraine.
About EUR 30bn of the 2022 surge in transfers is split out this way (Armenia 11.9, Uzbekistan 7.5, Tajikistan 3.3,
Georgia 3.0, Azerbaijan 2.5), tested by the drop back after the surge.

Relocants' **living spending** is recorded in the host's travel credits from Russia, so that share also comes out of
services sold to Russia (`apply_relocants()`, [`relocants.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/relocants.json),
[notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/relocants-notes.md)): about EUR 3.3bn (1.2–6.5) over 2022–2026, mostly Türkiye
(0.9), Georgia (0.7, from its central bank's one-year residence rule; 38% of 2022 travel credits from Russia), the UAE,
Serbia, Armenia and Montenegro. Georgia moves from −14.8% to −13.5% of GDP, Montenegro +4.4% to +5.0%.

## Narrower actual values

National and partner statistics narrowed ten series in nine countries
([`actuals_r7.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/actuals_r7.json),
[notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/actuals_r7-notes.md)); each entry names the input it replaces, changed as the
builder loads it: <span class="incode">In the code: `_actuals_r7()`</span>

- **Armenia**: 95–100% of the gold and diamonds it buys from Russia is passed on (its gold exports exceed its gold
  imports from all origins every year), instead of 64–95%; more goes to the final buyers (UAE, China, Hong Kong).
- **Brunei**: one Russian crude share for both the refinery's intake and the crude passed on to fuel buyers.
- **Tajikistan**: Tajik official totals and Russian figures agree (imports from Russia USD 1.5–2.4bn a year).
- **Belarus**: crude at the Urals price minus Russia's export duty (phased out by 2024); gas at a fixed dollar price.
- **Kazakhstan, Kyrgyzstan, Mongolia**: own-report margins from Russia's mirror data, which sit near 1.0 for land
  neighbours, not the world median ratio. **Yemen, Syria**: the pre-war level from Russia's own export figures.

## Goods Russia's weapons need: the critical-goods marker

A euro of microchips matters more to Russia's war than a euro of bananas, but the map counts money. So sales to Russia
of the 50 goods on the EU/US/UK/Japan **Common High Priority List** (chips, other electronics, navigation parts,
bearings, machine tools) are shown as a **marker** (◆) and a line in the country panel, not added to any total; the
money is already inside Russia's earnings from trade (`apply_chpl()`, [`chpl.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/chpl.json),
[notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/chpl-notes.md)). Large sellers also get the tag "Sold Russia goods its weapons need: €X" ([tags](#view=how&sec=m-tags)), which says the full value; the totals count only the seller's own gain on these sales.

- **Per shipping country**: the country that let the goods go to Russia. Exporters' own customs records (Eurostat,
  UN Comtrade), adjusted toward what Russian customs recorded as dispatched from each country in 2023 (KSE: China
  ×1.25, Hong Kong ×2.96, Türkiye ×2.99, UAE ×1.59); the low end is the country's own record.
- **Shown** where the total from 2022 to the chosen year is at least EUR 0.1bn; the diamond grows with the amount.
- **2022 to August 2026**: about EUR 42bn in all. China 23.6bn (18.6–31.8), Hong Kong 7.5, the UAE 1.8, Belarus 1.4
  (a guess), India 1.4, Türkiye 1.4, Kazakhstan 1.0. EU members sold EUR 3.8bn in 2021 and almost nothing from 2023.
- **Not shown**: the brand behind the goods (Western brands made about 44% in 2023 by Russian customs data, about
  a quarter US brands); later years are guesses because Russia restricted its customs data in 2024.
- **Caution**: Russia pays well above world prices for these goods, so part of the money is the seller's margin, not
  more hardware. China's military-support part uses its own, narrower figure. <span class="incode">In the code: `china_military.json`</span>

## Freight: CIF to FOB

Import values include freight and insurance (CIF). That part is paid to shippers and insurers, and is counted for them in [shipping](#view=how&sec=m-services-shipping-companies-shipping) and services, not for Russia. [build_data.py `remove_freight()`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/pipeline/build_data.py) takes the importer's own freight margin from OECD ITIC out of every country's payments to Russia (the 25 largest buyers by name, e.g. China 6.4%, India 7.2%, Türkiye 8.6%, Germany 4.9%, low ×0.7, high ×1.4; others `CIF_SHARE = 4.5% / 6.5% / 9%`; gold 0.1% / 0.5% / 2%), yearly values and baseline alike, except for the share priced at the Russian border (pipeline gas and crude, electricity, overland trade; `BORDER_PRICED`).

## January–August 2026

January–August 2026 trade comes, for 32 economies, from monthly UN Comtrade data and national
statistics (Kazakhstan, Uzbekistan, Armenia, Belarus), fetched in October 2026, not from the 2025 rate
([`refresh_2026.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refresh_2026.json), [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/refresh_2026-notes.md)).
India's imports from Russia, for example, are EUR 48bn, not the 38bn the 2025 rate gives. Kazakhstan uses official
figures, not the IMF's flat monthly fill-in. Not yet published: Taiwan, UAE exports,
Turkmenistan, Syria, Iran. Aid stays on Kiel release 31 (8 October 2026, data to 31 August 2026), the latest; the map
counts Kiel **allocations**, not pledges.

## Smaller corrections

- **Denmark** sales to Russia sit between Danish and Eurostat data (×1.34, range 0.98–1.9), baseline scaled the same way (`apply_audit()`, [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/audit-notes.md)).
- **Data artefacts** in small countries (`fix_artefacts()`, `round4b.json` §4): Lebanon's baseline leaves out 2019 (fuel bought for smuggling into Syria); Mauritania's pre-war "Russian" fuel was traders' origin labels; Saint Lucia's and Bonaire's Russian fuel went to storage terminals; Botswana's rough diamonds were bought for resale; Seychelles shipping managers are fronts; Malta's suppressed services data are filled; Gibraltar keeps a 10% margin on bunker fuel ([energy-and-laundered-oil.md](#view=how&sec=m-energy-and-laundered-oil-hub-resale-chain)).
- **Dual-use goods** are inside recorded sales to Russia and are not added again (China's recorded dual-use exports EUR 4.5–5.8bn a year; [`china_military-notes.md`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/china_military-notes.md)).

## Sanctions-mandated or own choice

A label only; totals do not change. [`sanctions_share.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/sanctions_share.json) ([notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/sanctions_share-notes.md)) estimates, for 42 economies applying EU-style or own sanctions, which share of each cut was required by bans (parsed from 19 consolidated versions of [Regulation (EU) 833/2014](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0833) and national regimes). The pipeline (end of `build()`) sums the mandated euros over the years and divides by the map's own fall: `sanctions[flow] = {mandated, gas}`, where `gas` is the share of the import fall that was natural gas. Gas was not sanctioned before 2026, but much of the gas cut was Russia's (Gazprom's cut-offs in 2022) or the end of Ukrainian transit (1 January 2025), not the buyer's choice; the panel says so (`sanctionNote()` in [`site/index.html`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/site/index.html)).

**From each country's actual stop date.** A ban counts as "required" only for what was still flowing when it took effect. A fuel a country stopped before every applicable ban date is its own choice in every year, and pipeline crude stopped before its exemption ended is not required either: Lithuania's and Finland's crude (spring and July 2022), Poland's coal (national ban, 16 April 2022) and pipeline crude (stopped by Russia, February 2023), Germany's pipeline crude (1 January 2023). Data: [`stop_dates_r16.json`](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/stop_dates_r16.json), evidence and what was verified in its [notes](https://github.com/intelligent-cream/follow-the-money-ukraine/blob/main/research/2026-10/gaps/stop_dates_r16-notes.md); `apply_stop_dates()`. Required share of the fall, 2022–2026: Lithuania 21% (over all its trade with Russia: 23%), Finland 27%, Poland 38%, Germany 30%.

**Poland's pipeline crude is "stopped by Russia", not own choice.** Russia (Transneft) halted Druzhba deliveries to Poland on 25 February 2023 (Orlen, [WION](https://www.wionews.com/world/polish-energy-group-says-russia-halted-oil-pipeline-deliveries-565942/amp); monthly customs data: 0.50 Mt in February 2023, nil from March). It goes to the part Russia cut off itself, like the gas Gazprom cut off (`moved_stopped_by_russia` in `stop_dates_r16.json`, `sanctions.to_rus.cut` and `oil_cut_from`; the panel says "gas and pipeline oil that Russia cut off itself"). Poland's fall in purchases from Russia, 2022–2026: 38% required by sanctions, 50% cut off by Russia (gas 18%, pipeline crude 31%), 12% own choice. The method-band alternative "without what Russia cut off itself" leaves out the crude too. Germany's pipeline crude stays own choice (its refineries stopped ordering). Finland's last Russian crude cargo, 20 July 2022, is confirmed on [Neste's own page](https://www.neste.com/nestes-response-to-the-war-in-ukraine).

**Gas cut off by Russia after 2022 counts only what was still flowing.** For a cut after 2022 (Austria's OMV in November 2024; the end of transit through Ukraine on 1 January 2025 for Slovakia and Italy), only the gas the country still bought the year before the cut is labelled as cut off by Russia; the rest of its fall from the pre-war level was its own earlier choice. Italy cut its Russian gas from about 29 bcm in 2021 to 2.9 bcm in 2023 ([Osservatorio CPI, Università Cattolica](https://osservatoriocpi.unicatt.it/ocpi-pubblicazioni-quasi-azzerato-l-import-di-gas-russo)) and about 6 bcm in 2024 ([Il Post, citing Ember](https://www.ilpost.it/2025/05/07/italia-gas-russo-gnl-putin-sanzioni-importazioni-diversificazione/)); so about 4% of Italy's fall is labelled as cut by Russia, and Italy gets no "Gas cut off by Russia" tag. Austria's share is about 30%, Slovakia's about 8%. A label only; totals do not change. <span class="incode">In the code: `cut_part_of_gas_fall()` in `build_data.py`</span>
