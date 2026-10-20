# Goods trade with Russia and Ukraine

Goods trade is the largest part of the map for most countries: what each country bought from and sold to Russia and Ukraine, 2019 to August 2026. This page covers where the numbers come from (UN Comtrade, IMF, Eurostat, mirror data, official statements for non-reporters), how the pipeline moves value to the country where it really belongs (re-export hubs, the Baltic pass-through, Hong Kong gold, Russia's unexplained imports), why freight is taken out of import values, why sales count as profit rather than revenue, and how the sanctions label splits a cut into "required" and "own choice". Energy-specific steps (transit gas, laundered oil) are on [energy-and-laundered-oil.md](energy-and-laundered-oil.md).

## Sources and filling order

Base file: [`trade_full.json`](../../research/2026-10/gaps/trade_full.json) ([notes](../../research/2026-10/gaps/trade_full-notes.md)), 233 economies, four flows (`imports_from_RUS`, `exports_to_RUS`, `imports_from_UKR`, `exports_to_UKR`), 2019–2025 plus 2026 January–August. It extends the first-round [`trade.json`](../../research/2026-10/trade.json) ([notes](../../research/2026-10/trade-notes.md)).

Values are taken in this order, and the `basis` field records which was used:

1. **reported**: the country's own customs report (UN Comtrade, 2019–2025; for EU members in 2026, Eurostat Comext January–August, scaled to the Comtrade level), certainty A;
2. **mirror**: Russia's or Ukraine's report on the same flow, divided by the median mirror/reported ratio (imports from Russia 0.847, exports to Russia 1.320, imports from Ukraine 0.810, exports to Ukraine 1.388; these reflect CIF/FOB valuation and origin attribution), certainty B;
3. **imf**: IMF IMTS, spliced to the Comtrade level; rejected when its implied growth is outside the 5–95th percentile of reporters (65 values rejected), certainty B;
4. **estimated**: interpolation or the median growth of reporting countries, certainty C.

Russia publishes no partner detail after 2021, so trade with Russia from 2022 is always what the other country reports. 2026 uses Comext January–August for the EU, IMF monthly data elsewhere, and otherwise the 2025 rate × 8/12 (marked `*`, see [ranges.md](ranges.md#2026-and-the--mark)).

In the pipeline ([build_data.py `build()`](../../pipeline/build_data.py), first section) better data replace these values at customs level, so every later step applies to them too:

- [`narrow.json`](../../research/2026-10/gaps/narrow.json) ([notes](../../research/2026-10/gaps/narrow-notes.md)): official statistics for countries with the widest ranges (Belarus Union State and Belstat totals, Kazakhstan, Kyrgyzstan, Armenia, Uzbekistan, Georgia, Turkey, Moldova and others);
- [`round4b.json`](../../research/2026-10/gaps/round4b.json) ([notes](../../research/2026-10/gaps/round4b-notes.md)) for the UAE: its customs totals, which equal the official non-oil trade with Russia (USD 20.4bn in 2025); applied after `narrow.json`.

**Non-reporters.** [`nonreport.json`](../../research/2026-10/gaps/nonreport.json) ([notes](../../research/2026-10/gaps/nonreport-notes.md)) corrects 21 partners that do not report (Libya, Venezuela, Syria, Turkmenistan, Tajikistan, Afghanistan, Cuba, Sudan, Yemen, North Korea, Iran, Lebanon and others) with tanker tracking (CREA, Kpler), official statements and partner customs. Only the **paid share** of Russian supplies counts as money to Russia (`paid_share`); supplies on credit, as aid or barter are Russian support, not payments.

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
  gas separately, where it is burned ([energy](energy-and-laundered-oil.md#transit-gas)), so that gas is not missed.

For the question "who paid Russia", the national concept is the better measure, and Comtrade uses the same definition
for every country in the world. The full comparison, 843 checks against UN Comtrade, Eurostat and CREA, is in
[`verify_r11_trade-notes.md`](../../research/2026-10/verify_r11_trade-notes.md).

## The pre-war level and the comparison

The trade loop stores `base` (initially the 2019–2021 average) and `base_range` (the extremes of the 2019–2021 average and the low/high baselines). For every flow in [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json), [build_data.py `counterfactual()`](../../pipeline/build_data.py) then resets `base` to 2021 at pre-war prices and sets the expected path `bmul`, except for small purchases from Russia (round 16: under EUR 1bn a year in 2019–2021), which keep the 2019–2021 average. Details: [counterfactual.md](counterfactual.md#small-flows-start-from-the-2019-to-2021-average-round-16).

How the four flows enter the net shift (`calc()` in [`site/index.html`](../../site/index.html)):

| flow | part | counted as |
|---|---|---|
| `to_rus` | Less / more paid to Russia | change in volume, valued at each year's prices (round 14), × Russia's net gain per euro (round 10); the mix of what was bought from customs values per fuel (round 14) |
| `from_rus` | Income lost on sales given up / income from extra sales | change in volume at each year's prices × the seller's net gain (taxes plus profit above a normal return of 5% a year above inflation plus the country's risk premium, round 14) × genuinely extra ([the net-gain rule](overview.md#the-net-gain-rule-round-10)) |
| `buy_ukr` | Extra purchases from Ukraine | rise above expected, each year, × Ukraine's net gain per euro (round 10); a fall is not held against a country |
| `sell_ukr` | Extra sales to Ukraine | rise above expected, × the seller's net gain × genuinely extra, subtracted as flowback |

## Profit, not revenue

Selling EUR 10bn less to Russia does not cost the seller EUR 10bn: the goods would have cost money to make. Since round 13 **one rule** applies to every seller ([overview](overview.md#one-rule-for-every-seller-round-13)).

**One rule (round 13): every sale counts at the seller's net gain × genuinely extra.** Income from sales to Russia counts at the seller's net gain (taxes on production plus profit above a 9% return on capital, as a share of output, by country and industry, from OECD STAN: [`net_gain_sellers.json`](../../research/2026-10/gaps/net_gain_sellers.json), [notes](../../research/2026-10/gaps/net_gain_sellers-notes.md)) times the share that is genuinely extra business (`value_kept.json`). Manufacturing earns about 1% of output above a normal return (OECD median; Germany 1.3%, the US 3.8%, Poland 6.6%), so Germany's lost sales to Russia now count at about 0.004 and China's extra sales at 0.008 (were 0.25 and 0.485). Economies outside STAN use the OECD median of the industry. This is the same rule as for purchases from Russia and Ukraine (next paragraph).

**The money rule (round 6, superseded in round 13): income counted at value kept × genuinely extra.** Income from sales to Russia counts at the value kept in the seller's economy (domestic value added, OECD TiVA) times the share that is genuinely extra business (not sold elsewhere instead). There are separate factors for sales lost and extra sales, and for goods and services (`c.vk` in `data.json`, from [`value_kept.json`](../../research/2026-10/gaps/value_kept.json); `earned3()` in `calc()`). For example, Germany's lost sales to Russia count at 0.25 (0.14–0.39) and Finland's at 0.15 (0.06–0.28). In the cost view this is "Income lost on sales to Russia". Money flowing back followed the same rule ([overview.md](overview.md#the-money-rule-round-6)). Kept as `vk_old` for the method band.

**The net-gain rule (round 10): purchases count at the seller's net gain.** A purchase from Russia counts at Russia's net gain on that mix of goods (about 0.6 of the price for oil and gas, 0.1–0.2 for other goods), and an extra purchase from Ukraine at Ukraine's (0.042–0.175), so that trade and aid are on the same scale ([overview.md](overview.md#the-net-gain-rule-round-10)).

**History: the flat 20% margin (rounds 4–5).** From round 4 to round 5, sales given up and extra sales counted as the seller's profit, `META.lost_margin = 0.2`, with a range of 0.5× to 1.5× the margin; flowback used the same share. The audit had shown why a margin was needed: Cyprus at +30% of GDP and Lithuania at +45% came from sales and services counted at gross revenue ([audit2-notes.md §5](../../research/2026-10/gaps/audit2-notes.md)). The money rule replaced the flat margin in round 6. `META.lost_margin` is still written to `data.json`, but `calc()` uses it only for a country without `vk`, and every country has one.

## Re-export hubs

Goods made in China or the EU and sold on to Russia through Armenia or the UAE should count for the country that made them, not for the hub. [build_data.py `apply_reexports()`](../../pipeline/build_data.py) uses [`reexports.json`](../../research/2026-10/gaps/reexports.json) ([notes](../../research/2026-10/gaps/reexports-notes.md)) for 11 hubs: UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan, Georgia, Uzbekistan, Azerbaijan, Serbia, Mongolia, Tajikistan.

- **Goods to Russia**: the re-exported part of the hub's exports to Russia moves to the origin countries (`origin_shares`; "EU27" split by members' own sales to Russia). The hub keeps its trading margin (goods 5–20%, UAE 3–15%; an educated guess).
- **Russian goods passed on** (gold and diamonds mostly): move from the hub's payments to Russia to the first buyers (`destination_shares`; UAE gold buyers from importers' records: Hong Kong 30%, India 19%, Switzerland 15%, Turkey 14%). Gold margin 0.3–6%.
- **Measured shares** ([`refine.json`](../../research/2026-10/gaps/refine.json), [notes](../../research/2026-10/gaps/refine-notes.md)) replace the first guesses: Armenia 0.86–0.92, Kazakhstan 0.77–0.84, Kyrgyzstan 0.60–0.77, Turkey 0.31–0.36, Uzbekistan 0.61–0.83, Azerbaijan 0.36–0.43, Serbia 0.37–0.48.
- **UAE 2024–2026** re-exports and gold passed on are raised to match its customs totals (`round4b.json`).
- **The pre-war level moves the same way**: `reexports_to_RUS_baseline_2019_2021` comes out of the hub's base and into the origins'; since the counterfactual starts from 2021, the pre-war re-exports are also taken out of the hubs' 2021 values.

Hubs are labelled on the map (`hub` field). Their trade keeps the 2021 level as the counterfactual ([counterfactual.md](counterfactual.md#6-which-model-is-used-for-which-flow)). Belarus's re-exports are moved too since round 5 (below).

### Belarus (round 5)

Belarus and Russia stopped publishing trade by product in 2022, so Belarus's re-exports to Russia are estimated from
what partners report shipping to Belarus ([`belarus.json`](../../research/2026-10/gaps/belarus.json),
[notes](../../research/2026-10/gaps/belarus-notes.md)): EU used cars in 2022–23 (German, Polish and Lithuanian car
exports to Belarus rose from USD 0.36bn in 2021 to 2.53bn in 2023, then fell after Lithuania's 2024 ban), machinery and
electronics from China, Türkiye and the UAE, net of what only replaced lost EU supplies. EUR 0.6 / 1.7 / 1.2 / 0.8 / 0.6bn
in 2022–2026 against 0.25bn a year before the war, moved to the makers (China 45%, Germany 16%, Poland 15%, Lithuania
11%, Türkiye 7%) with a 10% margin kept. Chinese car kits assembled at BelGee are processing and stay Belarusian.

## Baltic and Finnish pass-through

Before the war much of the Baltic states' trade with Russia was transit: Estonia's oil entrepôt at Muuga, Latvian steel, Lithuanian re-exports (85–90% of its sales to Russia). Counting that as "given up" made Lithuania +45% of GDP. [build_data.py `baltic_transit()`](../../pipeline/build_data.py), from [`audit2.json`](../../research/2026-10/gaps/audit2.json) question 6:

- takes the unprocessed transit share out of the imports from Russia of Estonia, Latvia, Lithuania and Finland, before and after the war alike;
- takes re-exports out of their sales to Russia (Lithuania 0.85, Estonia 0.39, Latvia 0.45, Finland 0.10) and gives them to the EU members that made the goods, by their own sales to Russia; a 7% margin stays;
- leaves crude refined in Lithuania and Finland (real processing).

The transit share is **not** added to the final buyers. Those buyers already record the goods: the EU, the US and most
other countries record imports by country of origin, so Russian diesel shipped to the Netherlands through Estonia is
already in Dutch imports from Russia. Adding it again would count it twice (checked in round 5; the audit's
recommendation to "give it to the final buyers" is met by their own customs records).

## Residual gap

Russia's own customs record more imports than its partners report selling: EUR 29–46bn a year in 2022–2025 ([`residual.json`](../../research/2026-10/gaps/residual.json), [notes §2](../../research/2026-10/gaps/residual-notes.md)). [build_data.py `apply_residual()`](../../pipeline/build_data.py) splits it:

| component (EUR bn) | 2022 | 2023 | 2024 | 2025 | where it goes |
|---|---|---|---|---|---|
| CIF/FOB valuation | 13.3 | 14.5 | 14.3 | 13.6 | not allocated |
| unrecorded transit via Kyrgyzstan | 3.2 | 5.8 | 6.7 | 8.6 | country of origin |
| unrecorded transit via Kazakhstan | 0.6 | 1.1 | 4.2 | 2.9 | country of origin |
| residual, pro rata | 11.3 | 15.7 | 14.9 | 20.7 | each country by its reported sales; hubs pass their re-exported share on to origins |

**Belarus is excluded**: it reports its full trade with Russia through Union State totals, so its pro-rata share is spread over the other countries ([`round4b.json`](../../research/2026-10/gaps/round4b.json) §3). The structural pre-war gap (about EUR 6bn a year) is no longer added to 2022–2026 only (audit 2, question 4). The added value is in `from_rus`, certainty at best C, and its 2026 is estimated (`est26`).

## Hong Kong gold

**Round 13 (audit): gold at the gold price.** Gold in a country's payments to Russia (tagged where the UAE and Hong Kong pass it on, and Hong Kong's own rise) is deflated with the gold price index (the customs panel of Russian gold, HS 7108, and the NBP gold fixing for 2026; [`prices.json`](../../research/2026-10/gaps/prices.json) benchmarks, rebased to 2019–2021 = 1: 1.08 in 2022, 1.16 in 2023, 1.50 in 2024, 2.05 in 2025, 2.66 in 2026), not with the country's pre-war mix. Hong Kong's pre-war imports from Russia were half palladium and platinum, whose price fell, so its index (0.90 in 2023–2026) made the volume of gold 1.3–3 times too large. Each year's index is the value-weighted mix of the gold index on the gold share and the old index on the rest (`deflate_gold()`). Hong Kong: −4.2% → −1.9% of GDP. The gold price rise itself is not counted as a change, like any other non-fuel price rise. **Round 14 (current euros):** the change in the volume of gold is then valued at each year's gold price, like every other part (`cur`), so Hong Kong's extra gold bought from Russia counts at today's prices: −2.36% → −4.16% of GDP.

The rise in Hong Kong's imports from Russia since before the war is taken to be precious metals (`HK_METALS_SHARE`, per year). Round 12 measured it from Hong Kong's own import records in UN Comtrade ([raw/comtrade_hkg](../../research/2026-10/raw/comtrade_hkg/)): precious metals (HS 71) were 56–67% of its imports from Russia in 2019–2021 and 85%, 99%, 98% and 99% in 2022–2025. Against the 2019–2021 average, HS 71 rose by more than the total in every year (other goods fell), so the share of the rise is 1.0 (capped; 2026 takes 2025's). It was a flat 0.98 that no research file explained. The share passed on to mainland China (0.57 in 2022 falling to 0.37 in 2025, from Hong Kong's own gold trade in `refine.json`) counts for China; only the rise above the pre-war level is treated as gold in transit. Hong Kong is labelled a gold transit hub. Code: the end of `apply_residual()`.

**Round 16 (review 5, M1 and M6; approved by the owner): only the gold that stays in Hong Kong counts for Hong Kong, at the no-war gold price.** Until round 15 the share Hong Kong re-exported to everyone other than mainland China stayed with Hong Kong, while the UAE's gold went on to its buyers. Now, from Hong Kong's own HS 7108 trade (UN Comtrade, [`hk_gold_r16.json`](../../research/2026-10/gaps/hk_gold_r16.json), [notes](../../research/2026-10/gaps/hk_gold-notes.md)): mainland China keeps its onward share (unchanged, so it is not counted twice); the share Hong Kong exported elsewhere (0.21, 0.11, 0.34, 0.33 of its gold imports in 2022–2025) goes to those buyers by their share of its non-China gold exports, tagged as gold (Thailand, the UAE, India, Singapore, Korea, Indonesia; destinations that ban Russian-origin gold at half their share, as in the UAE rule); Hong Kong keeps the rest (0.22–0.34 of its rise). And the change in the volume of gold is valued at the 2021 gold price held flat (`GOLD_NOWAR`), like fuel at its no-war price, instead of each year's gold price (index 2.86 in 2026); the gold price rise is not counted as a windfall, because no measurable share of it was caused by this war. Hong Kong −4.30% → −1.59% of GDP (direction uncertain); Thailand +0.42% → +0.10%; the UAE −0.72% → −0.84%. Check 33 verifies that the China and elsewhere shares never exceed what Hong Kong imported.

## Gold and hidden channels

"Gold and hidden payments to Russia" holds money that appears nowhere in customs data ([`uncovered.json`](../../research/2026-10/gaps/uncovered.json) `hidden_channels`, [notes §2](../../research/2026-10/gaps/uncovered-notes.md), certainty D): Kyrgyzstan's gold gap (partners record 16–52 t a year more than Kyrgyzstan exports; 0/25/75% assumed Russian), Hong Kong's 2026 gold, and high-band margins for China, Turkey, Kazakhstan, Armenia and India. UAE gold is in its customs data and is zero here (audit 2). Kyrgyzstan's hidden gold is passed on to the buyers of Kyrgyz gold ([`kgz_gold.json`](../../research/2026-10/gaps/kgz_gold.json), UN Comtrade HS 7108 imports from Kyrgyzstan 2023–2024: Switzerland 37%, China 33% with Hong Kong, UK 15%, UAE 11%); Kyrgyzstan keeps 5%. The payments themselves are not added again: payment agents and crypto settle trade that customs already record. Only the fees the agents keep are added, since round 6 (next section).

## Payment agents (round 6)

Agents in third countries settle much of Russia's trade outside normal banking and charge fees (3–4% in 2022–2024,
peaks of 10–15%, 2–2.5% since 2025) that are in neither customs values nor services data. The share of those fees kept
by residents (35–60%; the rest belongs to Russian-owned networks), against 2021, counts as money earned from Russia,
about EUR 7bn over 2022–2026: China 1.7bn, Kazakhstan 1.1, the UAE 1.0, Hong Kong 0.9, Türkiye 0.85, Kyrgyzstan 0.7
(checked against Kyrgyz banks' extra profits), Armenia 0.45. The country split is an educated guess (certainty D; C for
Kyrgyzstan). Crypto volumes (Garantex, the A7A5 rouble stablecoin) and the 2022 transfers of people leaving Russia have
no country split or are not payments to Russia, and are not counted
([`payment_channels.json`](../../research/2026-10/gaps/payment_channels.json), [notes](../../research/2026-10/gaps/payment_channels-notes.md)).
**Round 13:** the fees are a sale of financial services to Russia, so they count at the financial industry's net gain
(OECD median 0.20) × genuinely extra (0.5), about a tenth of the fees (were counted in full).

## Remittances and relocants (round 7)

**Round 13b (owner, after the audit): a marker, not in the totals.** Migrant workers' remittances from Russia are no
longer in the net shift, the cost view, either headline number, the method band or the share cards. This reverses the
owner's round-7 decision to count them ([decisions](../decisions.md#remittances-from-russia)): they are individuals'
wages, not a country's choice; the money flows from Russia to the migrant's home; the real gain over what the migrant
could earn elsewhere is small and hard to measure; and they would dominate the bottom of the ranking (Tajikistan
−39.6% of GDP, almost all of it remittances).

They are shown as a **marker** (△), like the [critical-goods marker](#goods-russias-weapons-need-the-critical-goods-marker-round-7):

- **What it shows**: the change in labour remittances from Russia against the expected no-war level, summed from 2022
  to the chosen year, in euros and as % of one year's GDP (the average of 2022–2024 since round 15), with its likely range (the reported range of what
  was sent and of the expected level, combined as independent errors), and the total migrants sent from Russia in that
  time (`apply_remittances()`, `remit` in `data.json`). Relocants' transfers stay out, as below.
- **Where**: a line in every country panel with data ("Depends on wages earned in Russia: remittances from Russia
  changed by X% of GDP since 2022 (not in the totals)" where migrants sent at least 1% of GDP a year from Russia over
  the period; without "depends" elsewhere), a map layer ("Wages from Russia": a triangle beside the critical-goods
  diamond, its size following the change), and columns marked "not in totals" in the table, the CSV
  (`remittances_from_russia_change_*_not_in_totals`) and the JSON (`remittances_from_russia_change_not_in_totals`).
- **2022 to August 2026** (round 15, against average 2022–2024 GDP): Tajikistan +EUR 9.4bn (+81% of GDP; likely +40 to +131%; EUR 20.9bn sent in all),
  Uzbekistan +18.9bn (+19%), Kyrgyzstan +0.3bn (+2.4%, likely −14 to +16%), Armenia +1.6%, Belarus +1.1%, Georgia
  −0.3%, Azerbaijan −0.6%, Moldova −2.6%, Kazakhstan 0. The triangle shows for Tajikistan, Uzbekistan, Kyrgyzstan,
  Armenia, Georgia and Belarus.
- **Effect of taking them out** (net, % of 2024 GDP, round 13b): Tajikistan −39.61 → −0.81, Uzbekistan −14.46 → −6.11, Kyrgyzstan
  −7.48 → −4.94, Armenia −2.91 → −1.62, Belarus −5.63 → −4.96, Moldova +7.96 → +7.77.

The paragraphs below describe how remittances were counted before round 13b. The research files stay as they are.

**Round 13 (audit): at the migrant's net gain.** Wages pay for real work, so only the pay above what the same work
earns elsewhere counts, and only its war-driven change: the war wage premium in what migrants sent (Russian wages
above their 9% pre-war trend: 5% of pay in 2022, 19% in 2025), as far as it shows in euros, plus the rest of the
change × the premium over the home wage (Tajikistan 0.62, Uzbekistan and Kyrgyzstan 0.41, others 0.2) × genuinely
extra ([`remittances_r13.json`](../../research/2026-10/gaps/remittances_r13.json),
[notes](../../research/2026-10/gaps/remittances_r13-notes.md)). Tajikistan −38.3 → −39.6% of GDP, Uzbekistan −15.1 →
−14.5, Kyrgyzstan −6.1 → −7.5, Moldova +6.1 → +5.4. Tajikistan's total from Russia was checked against EFSD's 2025
share of GDP (within 6%); Uzbekistan's against its central bank. The text below describes rounds 7–12. Replaced in
round 13b by the marker above.

**Migrant workers' remittances** from Russia are wages for labour sold to Russia's economy, so they counted like
services sold to Russia: the change against the expected no-war level, at value kept (0.97) × genuinely extra (0.55
when above expected, 0.40 when below) (`apply_remittances()`,
[`remittances.json`](../../research/2026-10/gaps/remittances.json),
[notes](../../research/2026-10/gaps/remittances-notes.md)). The expected level is the 2019 and 2021 average grown at
each country's pre-war trend. Most of the rise came from Russia's war economy pushing wages up (average wage 57,000
roubles in 2021, 100,000 in 2025). Effects, % of GDP 2022–2026: Tajikistan −37 (−83 to −10, certainty D: no split by
country of origin), Uzbekistan −9 (−17 to −2), Kyrgyzstan −1.2, Armenia −0.8, Belarus −0.6; Georgia, Azerbaijan and
Moldova slightly positive (less earned from Russia than expected).

**Relocants are left out.** Money Russians brought or sent when they moved abroad after 2022 (savings, property
purchases, transfers through local accounts) is money leaving Russia, which hurts Russia; counting it toward Russia
would be the wrong sign, and counting it toward Ukraine would credit countries for something unrelated to Ukraine.
About EUR 30bn of the 2022 surge in transfers was split out this way (Armenia 11.9, Uzbekistan 7.5, Tajikistan 3.3,
Georgia 3.0, Azerbaijan 2.5), tested by the drop back after the surge.

Relocants' **living spending** is recorded in the host's travel credits from Russia, so that share also comes out of
services sold to Russia (`apply_relocants()`, [`relocants.json`](../../research/2026-10/gaps/relocants.json),
[notes](../../research/2026-10/gaps/relocants-notes.md)): about EUR 3.3bn (1.2–6.5) over 2022–2026, mostly Türkiye
(0.9), Georgia (0.7, from its central bank's one-year residence rule; 38% of 2022 travel credits from Russia), the UAE,
Serbia, Armenia and Montenegro. Georgia moves from −14.8% to −13.5% of GDP, Montenegro +4.4% to +5.0%.

## Narrower actual values (round 7)

National and partner statistics narrowed ten series in nine countries
([`actuals_r7.json`](../../research/2026-10/gaps/actuals_r7.json),
[notes](../../research/2026-10/gaps/actuals_r7-notes.md)); each entry names the input it replaces, changed as the
builder loads it (`_actuals_r7()`):

- **Armenia**: 95–100% of the gold and diamonds it buys from Russia is passed on (its gold exports exceed its gold
  imports from all origins every year), instead of 64–95%; more goes to the final buyers (UAE, China, Hong Kong).
- **Brunei**: one Russian crude share for both the refinery's intake and the crude passed on to fuel buyers.
- **Tajikistan**: Tajik official totals and Russian figures agree (imports from Russia USD 1.5–2.4bn a year).
- **Belarus**: crude at the Urals price minus Russia's export duty (phased out by 2024); gas at a fixed dollar price.
- **Kazakhstan, Kyrgyzstan, Mongolia**: own-report margins from Russia's mirror data, which sit near 1.0 for land
  neighbours, not the world median ratio. **Yemen, Syria**: the pre-war level from Russia's own export figures.

## Goods Russia's weapons need: the critical-goods marker (round 7)

A euro of microchips matters more to Russia's war than a euro of bananas, but the map counts money. So sales to Russia
of the 50 goods on the EU/US/UK/Japan **Common High Priority List** (chips, other electronics, navigation parts,
bearings, machine tools) are shown as a **marker** (◆) and a line in the country panel, not added to any total; the
money is already inside trade with Russia (`apply_chpl()`, [`chpl.json`](../../research/2026-10/gaps/chpl.json),
[notes](../../research/2026-10/gaps/chpl-notes.md)).

- **Per shipping country**: the country that let the goods go to Russia. Exporters' own customs records (Eurostat,
  UN Comtrade), adjusted toward what Russian customs recorded as dispatched from each country in 2023 (KSE: China
  ×1.25, Hong Kong ×2.96, Türkiye ×2.99, UAE ×1.59); the low end is the country's own record.
- **Shown** where the total from 2022 to the chosen year is at least EUR 0.1bn; the diamond grows with the amount.
- **2022 to August 2026**: about EUR 42bn in all. China 23.6bn (18.6–31.8), Hong Kong 7.5, the UAE 1.8, Belarus 1.4
  (a guess), India 1.4, Türkiye 1.4, Kazakhstan 1.0. EU members sold EUR 3.8bn in 2021 and almost nothing from 2023.
- **Not shown**: the brand behind the goods (Western brands made about 44% in 2023 by Russian customs data, about
  a quarter US brands); later years are guesses because Russia restricted its customs data in 2024.
- **Caution**: Russia pays well above world prices for these goods, so part of the money is the seller's margin, not
  more hardware. China's military-support part (`china_military.json`) uses its own, narrower figure.

## Freight: CIF to FOB

Import values include freight and insurance (CIF). That part is paid to shippers and insurers, and is counted for them in [shipping](services-shipping-companies.md#shipping) and services, not for Russia. [build_data.py `remove_freight()`](../../pipeline/build_data.py) takes the importer's own freight margin from OECD ITIC out of every country's payments to Russia (round 11: the 25 largest buyers by name, e.g. China 6.4%, India 7.2%, Türkiye 8.6%, Germany 4.9%, low ×0.7, high ×1.4; others `CIF_SHARE = 4.5% / 6.5% / 9%`, was 3.5% / 5.5% / 7.5%; gold 0.1% / 0.5% / 2%), yearly values and baseline alike, except for the share priced at the Russian border (pipeline gas and crude, electricity, overland trade; `BORDER_PRICED` from audit 2, question 7).

## 2026 refresh (round 5)

January–August 2026 trade was refreshed in October 2026 for 32 economies from monthly UN Comtrade data and national
statistics (Kazakhstan, Uzbekistan, Armenia, Belarus), replacing the 2025-rate estimates
([`refresh_2026.json`](../../research/2026-10/gaps/refresh_2026.json), [notes](../../research/2026-10/gaps/refresh_2026-notes.md)).
The largest change: India's imports from Russia, EUR 48bn instead of 38bn (India −5.1% → −5.4% of GDP). Kazakhstan's
IMF monthly series were a flat fill-in and are replaced with official figures. Not yet published: Taiwan, UAE exports,
Turkmenistan, Syria, Iran. Aid stays on Kiel release 31 (8 October 2026, data to 31 August 2026), the latest; the map
counts Kiel **allocations**, not pledges.

## Smaller corrections

- **Denmark** sales to Russia sit between Danish and Eurostat data (×1.34, range 0.98–1.9), baseline scaled the same way (`apply_audit()`, [audit-notes.md](../../research/2026-10/gaps/audit-notes.md)).
- **Data artefacts** in small countries (`fix_artefacts()`, `round4b.json` §4): Lebanon's baseline leaves out 2019 (fuel bought for smuggling into Syria); Mauritania's pre-war "Russian" fuel was traders' origin labels; Saint Lucia's and Bonaire's Russian fuel went to storage terminals; Botswana's rough diamonds were bought for resale; Seychelles shipping managers are fronts; Malta's suppressed services data are filled; Gibraltar keeps a 10% margin on bunker fuel ([energy-and-laundered-oil.md](energy-and-laundered-oil.md#hub-resale-chain)).
- **Dual-use goods** are inside recorded sales to Russia and are not added again (China's recorded dual-use exports EUR 4.5–5.8bn a year; [`china_military-notes.md`](../../research/2026-10/gaps/china_military-notes.md)).

## Sanctions-mandated or own choice

A label only; totals do not change. [`sanctions_share.json`](../../research/2026-10/gaps/sanctions_share.json) ([notes](../../research/2026-10/gaps/sanctions_share-notes.md)) estimates, for 42 economies applying EU-style or own sanctions, which share of each cut was required by bans (parsed from 19 consolidated versions of [Regulation (EU) 833/2014](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0833) and national regimes). The pipeline (end of `build()`) sums the mandated euros over the years and divides by the map's own fall: `sanctions[flow] = {mandated, gas}`, where `gas` is the share of the import fall that was natural gas. Gas was not sanctioned before 2026, but much of the gas cut was Russia's (Gazprom's cut-offs in 2022) or the end of Ukrainian transit (1 January 2025), not the buyer's choice; the panel says so (`sanctionNote()` in [`site/index.html`](../../site/index.html)).

**Round 16 (review 5, M4; approved by the owner): from each country's actual stop date.** A ban counted as "required" only for what was still flowing when it took effect. A fuel a country stopped before every applicable ban date is its own choice in every year, and pipeline crude stopped before its exemption ended is not required either: Lithuania's and Finland's crude (spring and July 2022), Poland's coal (national ban, 16 April 2022) and pipeline crude (stopped by Russia, February 2023), Germany's pipeline crude (1 January 2023). Re-run on the same customs data ([`stop_dates_r16.json`](../../research/2026-10/gaps/stop_dates_r16.json), evidence and what was verified in its [notes](../../research/2026-10/gaps/stop_dates_r16-notes.md); `apply_stop_dates()`). Required share of the fall, 2022–2026: Lithuania 87% → 21% (the panel's note over all its trade with Russia: 86% → 23%), Finland 71% → 27%, Poland 76% → 38%, Germany 49% → 30%. The fall itself, and every total, is unchanged.

## See also

- [counterfactual.md](counterfactual.md): the expected level for each flow
- [prices.md](prices.md): the price levels used for goods
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, fuel hubs, refiners
- [aid-refugees-military.md](aid-refugees-military.md#flowback): flowback and sales to Ukraine
- [reference/sources.md](../reference/sources.md#trade): trade data sources
- [Documentation index](../README.md)
