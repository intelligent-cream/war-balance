# Hong Kong's Russian gold: what stays, what goes on (round 16)

File: `hk_gold_r16.json`, built by [`scripts/hk_gold_r16.py`](../scripts/hk_gold_r16.py). Gathered 2026-10-20..

Raised by review 5 (M1, M6), approved by the owner. Until round 15 only the share of Hong Kong's Russian gold passed on to mainland China (`refine.json` `hk_onward`) was moved out of Hong Kong; the share it re-exported to everyone else stayed with Hong Kong, while the UAE's gold was passed to its buyers. Round 16 counts **only the gold that stays in Hong Kong** for Hong Kong.

## Data

UN Comtrade public preview, reporter Hong Kong (344), HS 7108 (gold), flows M and X, all partners, one call per year 2022–2025 (raw responses in `raw/comtrade_hkg/HKG_7108_XMRX_<year>.json`, fetched 2026-10-20). USD bn:

| year | imports | exports | to mainland China | exported elsewhere (share of imports) | retained, gross (1 − exports/imports) |
|---|---|---|---|---|---|
| 2022 | 38.01 | 30.13 | 22.12 | 0.211 | 0.207 |
| 2023 | 59.85 | 40.24 | 33.54 | 0.112 | 0.328 |
| 2024 | 65.38 | 56.54 | 34.17 | 0.342 | 0.135 |
| 2025 | 101.77 | 80.37 | 46.29 | 0.335 | 0.210 |

2026 carries 2025 forward. The 2022–2023 totals match the figures in `refine-notes.md` (China's share of Hong Kong's gold exports 0.73, 0.83, 0.60, 0.58).

## Rule

Russian gold is fungible inside Hong Kong's gold trade, so it follows Hong Kong's own pattern:

1. **Mainland China** keeps the onward share already in the build (`hk_onward`, central 0.566, 0.546, 0.476, 0.372, 0.372). Unchanged, so China is not counted twice.
2. **Other buyers** get the share Hong Kong exported elsewhere (row above), split by their share of its non-China gold exports. Destinations that ban Russian-origin gold (the EU from July 2022, the UK, US, Japan, Canada, Australia, New Zealand, Norway and Switzerland, with LBMA refinery screening) have their central share halved, as `refine.json` does for Switzerland in the UAE's gold; the freed share goes pro rata to the others. Largest destinations (2025): Thailand 0.32, UAE 0.11, India 0.09, Singapore 0.09, South Korea 0.08, Indonesia 0.07.
3. **Hong Kong** keeps the rest: 1 − onward − elsewhere = 0.22, 0.34, 0.18, 0.29, 0.29 of its rise in Russian gold (it was 0.43–0.63).

Only the rise since before the war is gold in transit (as before); the moved gold is tagged as gold, so it counts at Russia's gain on gold and is deflated with the gold price.

## No-war gold price (M6)

A change in the volume of gold is now valued at the price a no-war market expected, like fuel: the 2021 gold price held flat (`GOLD_NOWAR` in `build_data.py`; a judgement: for an asset price the expectation is no change, and gold futures price only the cost of carry). Before, the volume was valued at each year's actual gold price (index 2.86 in 2026 against 2019–2021), so Hong Kong's number rose with the gold price alone. The gold price rise itself is not counted as a windfall: unlike fuel, no measurable share of it was caused by this war (central-bank buying, interest rates).

## Effect (round 16, payments to Russia, % of a year's GDP)

Hong Kong −4.30 → −1.59 (now "direction uncertain"); Thailand +0.42 → +0.10; UAE −0.72 → −0.84; Singapore −0.29 → −0.36; United Kingdom +0.88 → +0.83; Indonesia −0.15 → −0.19; Malaysia −0.59 → −0.62; China unchanged within 0.02 points.

## Caveats

- First hop only: gold Hong Kong sends to the UAE or Singapore stays there; their own onward trade is not followed again.
- The halving for banned destinations is a judgement, as in the UAE rule.
- Hong Kong's retained gold includes vault build-up that may leave later.
