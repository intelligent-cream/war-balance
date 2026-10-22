# Story tags

Under each country's numbers, a few short tags tell its story in a line each: why its trade with Russia changed, what it did, and how sure the number is. Each tag opens one or two sentences with the number behind it and its sources. They are generated from the data by the rules below, in this order of priority; the first six are shown, the rest behind "+ more". A tag changes no number. MAT, a material amount, is 0.1% of the country's GDP (2022–2024 average). Round 25 (owner, 22 October 2026: "add more tags that make sense ... in short tell the story why the country is where it's at, then we back that up with the numbers").

| Tag (key) | Shown when | Source |
|---|---|---|
| Party to the war (`party`) | the country is a party to the war on Russia's side (Belarus) | UN General Assembly resolution ES-11/1; EU Regulation 2022/355 (`co_belligerent`, `belarus_party`) |
| Gas (and oil) cut off by Russia (`gascut`) | gas or pipeline oil that Russia cut off itself, or that stopped with the end of transit, is at least a quarter of what Russia kept less | gas cut-offs (`gas_cuts`) |
| Kept buying Russian pipeline oil (EU exemption) (`exempt`) | Hungary and Slovakia: they kept buying Russian crude through the Druzhba pipeline under the EU embargo's pipeline exemption, although an alternative existed (round 26) | Council Regulation (EU) 2022/879; Czechia's switch via TAL (OSW, April 2025); Adria pipeline tests (`pipeline_exemption`) |
| Cut through EU sanctions it agreed to / Cut through its own sanctions / Cut through sanctions it adopted (`sanct`) | what Russia kept less is positive and at least MAT and sanctions required at least 60% of it. The words say who set the sanctions (round 26): EU members agreed to the EU's (Council Regulation 833/2014); the US, the UK, Japan, Canada, Australia, New Zealand and South Korea set their own; Switzerland, Liechtenstein, Norway, Iceland, Montenegro, Albania, North Macedonia, Bosnia and Herzegovina and Moldova adopted the EU's themselves | share required by sanctions (`sanctions_share`) |
| Cut beyond what sanctions required (`own`) | sanctions required at most 40% of what Russia kept less | share required by sanctions (`sanctions_share`) |
| Partly its sanctions, partly beyond them (`mixed`) | sanctions required between 40% and 60% of it | share required by sanctions (`sanctions_share`) |
| War-time fuel prices (`windfall`) | the war-time price part moved at least MAT toward Russia | war-time prices (`windfall`, `gas_prices`) |
| Russian oil at a war-time discount (`discount`) | the discount on Russian oil after the sanctions, 2022 to the chosen year, is at least MAT | energy (`energy`) |
| Trade data hidden since 2022 (`hidden`) | the country and Russia stopped publishing trade by partner and product (Belarus) | counterfactual and trade (`counterfactual`, `trade`) |
| Bought N% less / more from Russia (`bought`) | its purchases from Russia, in euros at each year's prices, changed by at least 50% and €0.5bn from 2021 to the chosen year (2025 at most) | trade (`trade`) |
| Sold Russia N% less / more (`sold`) | the same for its sales to Russia | trade (`trade`) |
| Trade hub for re-exports to Russia (`hub`) | it passes goods on to Russia and those goods are moved to the countries that made them | re-exports (`reexports`) |
| Sent weapons or troops to Russia (`mil`) | weapons, ammunition or troops sent to Russia are at least MAT | military support to Russia (`military_rus_r6`, `north_korea_r24`) |
| Top-10 aid giver for its size / Major aid giver (`aid`) | its aid to Ukraine against its GDP ranks in the top 10 of economies over €5bn, or is at least 0.5% of GDP | Kiel Institute and EU-level aid (`kiel`, `kiel_eu_share`, `aid_gaps`) |
| Hosts many refugees (`refugees`) | at least 10 refugees from Ukraine per 1,000 residents | UNHCR and national counts (`refugees`) |
| Froze Russian money (`frozen`) | the return Russia lost on reserves frozen here is at least MAT, or a fifth of the numbers | frozen reserves (`frozen_reserves`) |
| Mostly from fuel buying / Mostly from sales to Russia (`orange`) | the country is orange on the map and that is mostly fuel buying or sales, not weapons | our model: the parts and their sizes |
| Earned from the war effort (`earner`) | it earned more supplying Ukraine's war effort than it gave | our model: money flowing back from the war effort |
| Russian-owned firms here (`rusfirms`) | profits kept by Russian owners of firms here moved at least MAT toward Russia | Russian-owned companies (`russian_owned_r10`) |
| Its firms still pay tax in Russia (`tax`) | taxes its firms paid in Russia moved at least MAT toward Russia | company taxes (`company_taxes_r6`) |
| Ships Russian oil (`ship`) | what it kept from shipping and insuring Russian oil is at least MAT | shipping (`shipping`, `shadow_fleet`) |
| Rough data: mostly estimates (`rough`) | at least half of its parts, by size, are certainty D | our model: the parts' certainty letters |
| Mostly one part (`one`) | one part is at least 70% of a net of at least MAT, in the same direction | our model: the parts and their sizes |
| Small economy (`small`) | GDP under €5bn: not ranked | World Bank GDP (`trade`) |
| Two different things added (`two`) | the net adds support for Ukraine to a positive trade with Russia | our model |

Whether a number is "leaning toward Ukraine / Russia" or "uncertain direction" is said in its headline, not as a tag. Each tag that cites data links its sources in its sentence; the code is `storyTags()` in `index.html`.
