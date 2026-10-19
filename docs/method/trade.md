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

The trade loop stores `base` (initially the 2019–2021 average) and `base_range` (the extremes of the 2019–2021 average and the low/high baselines). For every flow in [`counterfactual.json`](../../research/2026-10/gaps/counterfactual.json), [build_data.py `counterfactual()`](../../pipeline/build_data.py) then resets `base` to 2021 at pre-war prices and sets the expected path `bmul`. Details: [counterfactual.md](counterfactual.md).

How the four flows enter the net shift (`calc()` in [`site/index.html`](../../site/index.html)):

| flow | part | counted as |
|---|---|---|
| `to_rus` | Less / more paid to Russia | change in volume at pre-war prices, × Russia's net gain per euro (round 10) |
| `from_rus` | Income lost on sales given up / income from extra sales | change × value kept × genuinely extra ([the money rule](overview.md#the-money-rule-round-6)) |
| `buy_ukr` | Extra purchases from Ukraine | rise above expected, each year, × Ukraine's net gain per euro (round 10); a fall is not held against a country |
| `sell_ukr` | Extra sales to Ukraine | rise above expected, × the money rule, subtracted as flowback |

## Profit, not revenue

Selling EUR 10bn less to Russia does not cost the seller EUR 10bn: the goods would have cost money to make. Two rules apply today.

**The money rule (round 6): income counts at value kept × genuinely extra.** Income from sales to Russia counts at the value kept in the seller's economy (domestic value added, OECD TiVA) times the share that is genuinely extra business (not sold elsewhere instead). There are separate factors for sales lost and extra sales, and for goods and services (`c.vk` in `data.json`, from [`value_kept.json`](../../research/2026-10/gaps/value_kept.json); `earned3()` in `calc()`). For example, Germany's lost sales to Russia count at 0.25 (0.14–0.39) and Finland's at 0.15 (0.06–0.28). In the cost view this is "Income lost on sales to Russia". Money flowing back follows the same rule ([overview.md](overview.md#the-money-rule-round-6)).

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

98% of Hong Kong's imports from Russia are taken to be precious metals (`HK_METALS_SHARE`; this figure is not yet traced to a research file, see [decisions](../decisions.md#constants-and-rules-written-down-in-round-11)). The share passed on to mainland China (0.57 in 2022 falling to 0.37 in 2025, from Hong Kong's own gold trade in `refine.json`) counts for China; only the rise above the pre-war level is treated as gold in transit. Hong Kong is labelled a gold transit hub. Code: the end of `apply_residual()`.

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

## Remittances and relocants (round 7)

**Migrant workers' remittances** from Russia are wages for labour sold to Russia's economy, so they count like
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

## See also

- [counterfactual.md](counterfactual.md): the expected level for each flow
- [prices.md](prices.md): the price levels used for goods
- [energy-and-laundered-oil.md](energy-and-laundered-oil.md): transit gas, fuel hubs, refiners
- [aid-refugees-military.md](aid-refugees-military.md#flowback): flowback and sales to Ukraine
- [reference/sources.md](../reference/sources.md#trade): trade data sources
- [Documentation index](../README.md)
