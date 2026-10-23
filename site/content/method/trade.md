# Goods trade with Russia and Ukraine

Goods trade is the largest part of the map for most countries: what each country bought from and sold to Russia and Ukraine, 2019 to August 2026. This page explains where the numbers come from, how value is moved to the country where it really belongs (re-export hubs, transit, gold), and why sales count as profit rather than revenue. Fuel-specific steps are on the [energy page](#view=how&sec=m-energy-and-laundered-oil).

Details for developers: [filling order, shares, margins and research files](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/trade.md).

## Sources and filling order

233 economies, four flows (bought from and sold to Russia and Ukraine). Values are taken in this order:

1. **the country's own customs report** (UN Comtrade; Eurostat for EU members in 2026), certainty A;
2. **the partner's report** of the same trade (Russia's or Ukraine's), adjusted for the usual gap between the two, certainty B;
3. **IMF trade statistics**, certainty B;
4. **an estimate** from the growth of reporting countries, certainty C.

Russia publishes no partner detail after 2021, so from 2022 trade with Russia is always what the other country reports. Official national statistics replace these where they are better (Belarus, Kazakhstan, Kyrgyzstan, Armenia, Uzbekistan, Türkiye, the UAE and others). For **countries that do not report** (Libya, Venezuela, Syria, Iran, North Korea and others), tanker tracking and official statements fill the gap; only the share Russia was paid for counts, not supplies on credit or as aid.

### Why UN Comtrade and not Eurostat for EU members

The two agree for the EU as a whole but can differ a lot for one country (the Netherlands, 2021: EUR 18.5bn in UN Comtrade, 26.5bn in Eurostat). Eurostat books goods where they enter the EU, so Russian goods landing in Rotterdam for Germany count for the Netherlands. UN Comtrade holds each country's own figures for goods bought for its own economy, which answers "who paid Russia", with one definition for every country in the world.

## The pre-war level and the comparison

Each flow is compared with its expected no-war level, usually 2021 at pre-war prices ([counterfactual](#view=how&sec=m-counterfactual)). How the four flows enter the map:

| flow | part on the map | counted at |
|---|---|---|
| bought from Russia | less or more paid to Russia | Russia's net gain on that mix of goods |
| sold to Russia | income lost or gained | seller's net gain × genuinely extra |
| bought from Ukraine | extra purchases from Ukraine | Ukraine's net gain; a fall is not held against a country |
| sold to Ukraine | extra sales to Ukraine | seller's net gain × genuinely extra, subtracted as money flowing back |

## Profit, not revenue

Selling EUR 10bn less to Russia does not cost the seller EUR 10bn: the goods would have cost money to make. So a sale counts at the **seller's net gain** (taxes plus profit above a normal return) **times the share that is genuinely extra** (not sold elsewhere instead), the [same rule for every seller](#view=how&sec=m-overview-one-rule-for-every-seller). Manufacturing earns little above a normal return, so sales given up count at a small share of their value. Counting gross revenue would put Cyprus at +30% of GDP and Lithuania at +45%.

## Re-export hubs

Goods made in China or the EU and sold on to Russia through Armenia or the UAE count for the country that made them, not for the hub. This applies to 11 hubs (the UAE, Armenia, Kazakhstan, Türkiye, Kyrgyzstan, Georgia, Uzbekistan, Azerbaijan, Serbia, Mongolia, Tajikistan), with measured re-export shares where they exist (Armenia 0.86–0.92, Kazakhstan 0.77–0.84). The hub keeps its trading margin (goods 5–20%, an educated guess). Russian gold and diamonds passed on by hubs go to their first buyers. Hubs keep 2021 as their no-war level.

### Belarus

Belarus's re-exports to Russia (mostly EU used cars in 2022–2023, and machinery from China, Türkiye and the UAE) are estimated from what partners shipped to Belarus, and moved to the countries that made the goods (China 45%, Germany 16%, Poland 15%).

## Baltic and Finnish pass-through

Before the war much of the Baltic states' trade with Russia was transit (Estonia's oil terminal at Muuga, Lithuanian re-exports). Counting it as "given up" would make Lithuania +45% of GDP. So the transit share is taken out before and after the war alike. It is **not** handed to the final buyers: they already record those goods as imports from Russia.

## Residual gap

Russia's own customs record EUR 29–46bn a year more imports than its partners report selling. Part is valuation; part is unrecorded transit through Kyrgyzstan and Kazakhstan (given to the countries of origin); the rest is spread over sellers by their reported sales. Belarus is left out: it reports its full trade with Russia.

## Hong Kong gold

Nearly all of the rise in Hong Kong's imports from Russia since before the war is precious metals (measured from its own records). The share it passed on to mainland China counts for China, the share sent elsewhere for those buyers; Hong Kong keeps the rest. Gold is valued at the 2021 gold price held flat ([prices](#view=how&sec=m-prices-gold-at-its-no-war-price)). Hong Kong's direction is uncertain.

## Gold and hidden channels

Money that appears nowhere in customs: Kyrgyzstan's gold gap (partners record more gold from it than it exports; passed on to the buyers of Kyrgyz gold), and high-end allowances for China, Türkiye, Kazakhstan, Armenia and India. Certainty D. Payments through agents and crypto are not added again: they settle trade customs already record.

## Payment agents

Agents in third countries settle much of Russia's trade outside normal banking and charge fees (3–4% in 2022–2024). The share of those fees kept by local residents, about EUR 7bn over 2022–2026 (China 1.7bn, Kazakhstan 1.1, the UAE 1.0), counts as money earned from Russia, at the financial industry's net gain: about a tenth of the fees. The country split is an educated guess (D).

## Remittances and relocants

**A marker, not in the totals** (△). Migrants' wages sent home from Russia are individuals' income, not a country's choice; the real gain over working elsewhere is small and hard to measure; and they would dominate the bottom of the ranking (Tajikistan about −40% of GDP). The marker shows the change against the expected level since 2022: Tajikistan EUR 9.4bn more than expected (81% of GDP), Uzbekistan 18.9bn more (19%). Most of the rise comes from Russia's war economy pushing wages up.

**Relocants are left out**: money Russians brought when they moved abroad after 2022 is money leaving Russia, about EUR 30bn of the 2022 surge in transfers (Armenia, Uzbekistan, Georgia...). Their living spending is also taken out of services sold to Russia.

## Narrower actual values

National and partner statistics narrowed ten series in nine countries: Armenia's gold passed on, Brunei's refinery, Tajikistan's and Belarus's official totals and prices, the land neighbours' own-report margins, and Yemen's and Syria's pre-war levels.

## Goods Russia's weapons need: the critical-goods marker

A euro of microchips matters more to Russia's war than a euro of bananas, but the map counts money. So sales of the 50 goods on the allies' **Common High Priority List** (chips, electronics, bearings, machine tools) are shown as a **marker** (◆), not added: the money is already in the trade number. About EUR 42bn over 2022–August 2026: China 23.6bn, Hong Kong 7.5, the UAE 1.8, India and Türkiye 1.4 each. EU members sold EUR 3.8bn in 2021 and almost nothing from 2023. Large sellers get the tag "Sold Russia goods its weapons need" ([tags](#view=how&sec=m-tags)).

## Freight: CIF to FOB

Import values include freight and insurance, which go to shippers and insurers, not Russia. Each importer's own freight margin (OECD data: China 6.4%, India 7.2%, Germany 4.9%) is taken out of its payments to Russia, except for trade priced at the Russian border (pipelines, overland).

## January–August 2026

2026 trade comes, for 32 economies, from monthly UN Comtrade data and national statistics, not from the 2025 rate (India's imports from Russia: EUR 48bn, not 38bn). Aid is the Kiel Institute's release of 8 October 2026, data to 31 August 2026.

## Smaller corrections

Denmark's sales to Russia sit between Danish and Eurostat figures. Small-country data artefacts are fixed (Lebanon's 2019 fuel for smuggling into Syria, traders' origin labels in Mauritania, storage terminals in Saint Lucia and Bonaire). Dual-use goods are inside recorded sales and not added again.

## Sanctions-mandated or own choice

A **label only**; totals do not change. For 42 economies with sanctions, it estimates which share of each cut was required by bans (EU Regulation 833/2014 and national regimes). A ban counts as "required" only for what was still flowing when it took effect: a fuel a country stopped before the ban was its own choice. Required share of the fall, 2022–2026: Lithuania 21%, Finland 27%, Poland 38%, Germany 30%. Poland's pipeline crude, which Russia halted in February 2023, is labelled as cut off by Russia, like the gas Gazprom cut off. For a gas cut after 2022 (Austria 2024, the end of transit through Ukraine in 2025), only the gas still flowing the year before counts as cut off by Russia: about 4% of Italy's fall, 30% of Austria's.
