# Prices: volumes, not values, and the war-time windfall

Russian gas cost Hungary 7.6 times its pre-war price in 2022. A country that kept buying the same amount paid far more but did not change its behaviour; one that halved its purchases paid about the same but did change. So the map compares **volumes**: each traded value is divided by its price level against 2019–2021. The extra money Russia earned because its fuel cost more is counted separately, as the **war-time windfall**, toward Russia.

Details for developers: [indices, formulas and research files](https://github.com/intelligent-cream/war-balance/blob/main/docs/reference/method/prices.md).

## Why volumes

Without a price level, a price spike would look like more buying and a later price fall like a cut. With it, the map compares expected and actual volumes, then values the change at that year's prices so trade is in the same euros as aid (fuel at the price a no-war market expected).

## Which index each flow uses

| flow | price level |
|---|---|
| bought from Russia | the country's own mix of fuel and other prices (below) |
| sold to Russia, trade with Ukraine | the EU's import price index for goods other than fuel |
| services and shipping | euro-area services prices |
| company taxes | none: compared in money |
| oil via other countries | the price of Russian crude against its no-war price |

## The composite index for payments to Russia

Each buyer's price level mixes fuel and other goods in the shares it actually bought. Fuel prices are the country's own customs unit values where measured (102 countries), otherwise benchmarks for Urals crude, Russian oil products, the country's own gas price and coal. Türkiye hides its Russian crude and gas in customs, so its prices are rebuilt from contract terms and regulator volumes.

## One price basis: FOB

Customs values include sea freight, which surged on longer war-time routes. Counting that freight as Russia's windfall would be wrong (it went to shipowners), so oil is compared at the Russian port (FOB) on both sides. On this basis India paid EUR 11.0bn **below** the no-war price, instead of 10.7bn above it on customs values. The method band keeps the customs basis as an alternative.

## The mix of what was bought

Russia's gain depends on how much of a purchase was fuel. The pre-war share is each country's own 2018–2021 share (Yemen's imports from Russia were 95% wheat); each year's share comes from the country's customs values per fuel, not from tanker-tracking tonnes, which contradict customs for some buyers.

## Fuel price screen

A country's own fuel price more than 1/0.6 times off its benchmark in a war year is treated as a data error and replaced by the benchmark (Nigeria's products, some coal prices, Brazil's 2022 crude). The 0.6 band is a judgement.

## Gas prices per country

Russian gas was priced very differently from country to country. The map uses each country's realised price (50 countries): customs unit values where they exist, peer countries' prices where customs hide Russian gas (Germany, Austria), published contract prices (Belarus, Moldova, Armenia) and oil-formula models (Türkiye, Poland before 2023). The 2022 price index runs from about 7 for Hungary (hub prices) to 1.1 for Belarus (a fixed dollar price).

## War-time windfall

For each year from 2022: what the country paid for Russian fuel, minus the same volume at the prices a no-war market expected. It is negative where Russia sold below them (discounts, the price cap). It counts at **Russia's net gain on the extra price**: all of it for oil and pipeline gas (costs do not rise with the price), about 0.7 for LNG, less for coal.

- **Fuel only**: other goods' price rises are mostly general inflation.
- **Only money flowing to Russia**: higher prices on goods sold to Russia do not count.
- **A consequence of the choice to buy**: what Russia earns at the price of the day follows from the choice to buy from it, so the spike counts to the buyer though it did not set the price. A buyer that paid less because others' sanctions pushed Russia's prices down (discounts, the price cap) gets no credit for it: that came from others' choices.
- **On top of volume**: a country that cut volumes still pays the windfall on what it kept buying. Germany: EUR 16.5bn<!-- n:DEU.part_windfall abs --> toward Russia (likely 1.3<!-- n:DEU.part_windfallHi abs --> to 29.3<!-- n:DEU.part_windfallLo abs -->), almost all in 2022.

## No-war prices

The comparison is with prices markets **expected before the invasion**: IMF, World Bank, EIA, ECB and European Commission forecasts and futures from October 2021 to January 2022 (central), the lowest of them (low) and mid-February 2022 futures (high). Hub-indexed gas contracts follow the no-war hub price, oil-indexed contracts an oil formula, and fixed-price buyers (Belarus, Armenia and others) get no gas windfall.

Gas forward prices of early 2021, before the late-2021 squeeze (TTF about EUR 17.5/MWh for 2022, against 38 in the October-2021 forecasts and 59 in the central path), are a third pre-war path. Part of that squeeze may have been the war's: the IEA tied much of Europe's 2021 storage shortfall to Gazprom ([Bloomberg](https://www.bloombergquint.com/business/iea-blames-russia-for-gas-squeeze-hurting-european-economies)). Since round 46 the windfall's likely range reaches this path, as it reaches the October-2021 forecasts and the February-2022 futures; before, it was a method-band alternative.

Against 2019–2021 prices the windfall would be about three times larger: that average includes the 2020 COVID crash, and prices were already rising in late 2021. Urals sold in 2022 at almost exactly its no-war price; gas was still more than twice its no-war level.

### Gold at its no-war price

A change in the volume of gold is valued at the **2021 gold price held flat**, so a buyer's number does not grow with the gold price alone. Part of the later gold price rise may be the war's (central banks bought gold after Russia's reserves were frozen), so the method band has "gold at its actual price".

## 2026 and the Hormuz crisis

Fuel prices in 2026 are high partly because the Strait of Hormuz was shut to tankers from March 2026 (Brent 35% above its pre-crisis futures, diesel about 59%; [CREA](https://energyandcleanair.org/what-the-hormuz-crisis-has-cost-fossil-fuel-importers-march-to-august-2026/)). This war did not cause it, so the 2026 no-war price is the actual world price and only Russia-specific price gaps count. The money still really reached Russia, so 2026 is valued at 2026 prices; the panel notes where valuing 2026 at 2025 prices would change the number, and the method band shows it. Germany: net 3.65%<!-- n:DEU.net --> for 2022–August 2026; with 2026 at 2025 prices it cut Russia's earnings from trade by 1.62%<!-- n:DEU.alt_p26.rus --> instead of 1.74%<!-- n:DEU.rus -->.

### Why January–August 2026 can look larger than all of 2025

For a country that stopped buying, each year's number is the purchases it no longer makes, valued at that year's prices. The no-war world is valued at 2026 prices, which include the Hormuz spike, so each barrel not bought counts for more in 2026 than in 2025. Eight months of 2026 can therefore come out larger than all of 2025: Italy cut Russia's earnings from trade by EUR 6.7bn<!-- n:ITA.rusY2026Eur --> in January–August 2026 against 4.4bn<!-- n:ITA.rusY2025Eur --> in 2025. This does not mean Russia earned more in 2026: its federal oil and gas revenue fell, EUR 56bn in January–August 2026 against 64bn a year earlier (Russian Ministry of Finance). It means the money those buyers keep away from Russia was worth more at 2026 prices. The method band shows 2026 at 2025 prices.

*For year pages:* 2026 covers January–August only, but can look larger than 2025 for countries that stopped buying: the purchases they no longer make are valued at 2026 prices, raised by the Hormuz crisis, while Russia's own oil and gas revenue fell.
