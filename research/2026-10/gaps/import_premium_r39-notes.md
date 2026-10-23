# The sanctions price premium on sales to Russia (round 39)

Data file: `import_premium_r39.json`. Made on 2026-10-23 for the round-39 audit item "Russia side, item 2"
(the price premium Russia pays for imports is only partly covered). **Research input only.** Nothing in
`build_data.py`, `data.json` or the site uses it yet. Unit: EUR bn, current prices, ECB yearly USD rates
as in `trade_full.json`; 2026 is January–August. Ranges are rough 90% bands..

**In one paragraph.** Since 2022 the same exporters charge Russia more than their other customers for the
same HS6 goods, and the gap has grown each year. Measured from the sellers' own UN Comtrade unit values,
value-weighted, the premium is about **0% in 2022, 5% in 2023, 9% in 2024 and 11% in 2025 for China**. It
is 8–18% in 2024–2025 for goods on the EU export-ban lists, 0–6% for other goods and 20–30% (unweighted) for the
50 CHPL codes. Türkiye is at 9–11% in 2022–2023, then near 0 because its other goods fell in price. Over
2022–Aug 2026 the extra price comes to about **EUR 48bn (20–99)**, of which about **24bn (5–74)** is the
sellers' own net gain. Today the map counts almost none of it: it reads the premium as volume and values
it at a manufacturing net gain of about 1.6%. Counting it would move China by about **0.10% of GDP toward
Russia** (EUR 17bn). It would move Türkiye by 0.09%, Kazakhstan by 0.25% and Uzbekistan by 0.5%; Belarus's
0.7% is only a guess. The map effect, EUR 23bn (5–74), sits inside the audit's EUR 15–50bn guess, but it is far smaller
than the headline percentages in the literature suggest, because those come from unweighted line-level
regressions or from the sanctioned subset only (section 3).

## 1. What the map does now (traced in the code)

- **Sales to Russia (`from_rus`) are deflated with the Eurostat non-fuel import price index** (`price_indices()`, `pidx` 1.16 for 2023). A price rise that is specific to Russia is therefore read as extra volume. The change in volume is then valued at the seller's net gain × genuinely extra (`vk.rx` for extra sales, `vk.rl` for sales lost; China 0.0163, Türkiye 0.0122, Kazakhstan 0.0163, India 0.0136, Germany's `rl` 0.0106; `calc()` `earned3()` in `site/index.html`).
- So today a premium of EUR 1 paid by Russia counts as about **EUR 0.012–0.016** toward Russia, as if it were manufacturing output. The prices page also states the rule outright: "Only money flowing to Russia: higher prices on goods sold to Russia do not count" (`docs/reference/method/prices.md`, War-time windfall, Rules).
- **Hub margins** are not counted "in full" either. `apply_reexports()` leaves the hub's 5–20% margin (`hub_margin_share`) inside the hub's `from_rus`, where it is valued at the same goods factor `rx` (about 0.016 of the margin). `value_kept-notes.md` recommended 0.85 × extra for that margin part, but the code does not apply it.
- **Payment-agent fees** (`payment_channels.json`, EUR 7.2bn gross kept by residents 2022–2026) are an `extra` part valued at the financial industry's net gain × extra (`vk.ag`, China 0.109). On the map: China −0.18bn, Kazakhstan −0.14, the UAE −0.13, Hong Kong −0.10, Türkiye −0.09, Kyrgyzstan −0.09, Armenia −0.07 (EUR bn, 2022–Aug 2026).
- **The residual** (Russia's own imports above partners' records, `residual.json`) is added to `from_rus` as volume, like any other sale.
- Unit values per HS6 line are **not** in the pipeline. `research/2026-10/raw/comtrade/` holds only TOTAL rows per reporter (the audit's "data already in hand" is not right); HS6 data were downloaded for this note (section 3).

## 2. Literature (each source opened or found by web search, 23 Oct 2026)

| source | data | finding used here |
|---|---|---|
| Emlinger & Lefebvre, *Working Around Sanctions. What Cost to Russia?*, CEPII Policy Brief 50, Feb 2025 ([PDF](https://www.cepii.fr/PDF_PUB/pb/2025/pb2025-50.pdf), opened) | Global Trade Tracker, HS6, 2020–June 2024; the same origin and product across destinations | Exporters' **FOB** unit values to Russia, against the same exporter's other destinations: non-sanctioning origins **+0.21 log (+23%)**, of which strategic products +0.37 (+45%), non-strategic +0.19–0.21; sanctioning origins +0.05 (Table D). CIF/FOB (freight and insurance) +3% on average (Table C). CIF unit values +13% overall, +22% from non-sanctioning origins, +122% for strategic products. Attributed "mainly" to **exporters increasing their margins**, not to circumvention via re-export (Table E) or to switching suppliers (new suppliers are cheaper, lower quality). |
| Emlinger & Lefebvre, *The Price of Isolation: The Rising Cost of Imports in Russia after 2022*, CEPII seminar, 13 Nov 2025 ([abstract](https://www.cepii.fr/CEPII/en/evenements/abstract.asp?IDReu=773), opened) | as above, updated | Unit value of Russian imports **from non-sanctioning countries +17%** on average after Feb 2022, strategic items >+50%; market power of the remaining exporters and higher trade costs. This is the audit's "+17% on all imports": it is on imports from non-sanctioning countries, not all imports. |
| Korhonen & Simola, *From sanctions to price surges: The dynamics of Russia's import prices*, BOFIT DP 8/2025, 21 Nov 2025 ([page](https://publications.bof.fi/handle/10024/54283), [PDF](https://publications.bof.fi/bitstreams/b8449a7f-f8b2-4ff8-8c23-bc4d55191dd8/download), opened) | GTT monthly HS6, Jan 2018–Dec 2024, **HS chapter 84 only**, quantities in items | Sanctioned vs non-sanctioned products to Russia: +0.34 log (baseline) / +0.44 (staggered), i.e. the "**40–60%**"; it grows over time (ATT 0.21 in 2022, 0.30 in 2023, 0.71 in 2024). China's exports to Russia vs to others, sanctioned goods: +0.36 to +0.65 log; Türkiye +0.23 to +0.44. Medians 2021→2024: China's sanctioned goods +87% to Russia vs +9% to others. **This is a premium relative to non-sanctioned goods within HS 84, not the premium against a no-war price on all imports**; it cannot be applied to total imports. |
| Chupilkin, Javorcik & Plekhanov, *The Eurasian Roundabout: Trade Flows into Russia through the Caucasus and Central Asia*, CEPR DP 20097, 2025 ([RePEc](https://ideas.repec.org/p/cpr/ceprdp/20097.html), abstract opened; Oct 2023 version [PDF](https://users.ox.ac.uk/~econ0247/Roundabout.pdf), opened) | UN Comtrade HS6 monthly | "Sanctions have resulted in a substantial increase in unit values of products exported to Russia either directly or indirectly." 2023 version: EU→Russia sanctioned non-luxury +6%, luxury −20% (value thresholds); Armenia/Kazakhstan/Kyrgyzstan→Russia sanctioned industrial and dual-use goods **+50–90%** (Table 8). |
| Egorov, Korovkin, Makarin & Nigmatulina, *Trade Sanctions*, June 2025 ([NBER conference PDF](https://conference.nber.org/conf_papers/f224547.pdf), opened) | Russian customs transactions, 10-digit, to 2023Q4 | **Counter-evidence:** "the sanctioned products' unit values did not differentially increase", which "could also reflect quality downgrades within product categories". |
| Corsetti, Demir & Javorcik, *Trading around Geopolitics* ([Oxford working paper](https://ora.ox.ac.uk/objects/uuid:f4c2b4b9-976b-41bd-8f00-862e29b63b5c), found by search, not opened) | Turkish firm-level customs | Turkish firms raised markups and prices on exports to Russia; more cash-in-advance and lira invoicing; Western-owned affiliates responded less. |

Reading of the literature for this map: the premium is real, rises over time, and is concentrated in sanctioned and strategic goods from non-sanctioning origins. Its size on **all** of Russia's imports, value-weighted, is much smaller than the headline percentages, which come from unweighted line-level regressions or from the sanctioned subset (section 3 shows this directly for China).

## 3. Measuring it from unit values

### Data availability (checked 23 Oct 2026)

- **The UN Comtrade public API works without a key.** The endpoint is
  `https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=156&period=2024&partnerCode=0,643&flowCode=X&cmdCode=854231,...`. It returns value, quantity, quantity unit and net weight per HS6 line.
  - Limits: **500 rows per call**. Asking for all HS6 lines (`cmdCode=AG6`) is cut at 500, so the codes must be listed in batches.
  - About **one call per second** (HTTP 429 "Rate limit is exceeded").
  - A **call-volume quota**: HTTP 403 "Out of call volume quota. Quota will be replenished in 00:24:21", hit after a few hundred calls.
  - The code lists `https://comtradeapi.un.org/files/v1/app/reference/H6.json` and `H5.json` are open too.
  - This note used about 600 calls over two hours.
  - A free API key, or the bulk files, would be needed for monthly data, 2026, or every exporter.
- **Gaps.** Belarus has published no exports by partner since 2021, so it cannot be measured. The UAE has none after 2022, Vietnam none after 2023 and Uzbekistan none for 2025. Kyrgyzstan and Georgia have too few usable lines (fewer than 80, under USD 0.4bn) and fall back to defaults. Russia publishes no imports by partner. The CEPII and BOFIT papers use Global Trade Tracker, which is paid.
- **Measured here:** China, Türkiye, Kazakhstan, India, Hong Kong, Armenia, Germany, Korea, Italy, Uzbekistan (2023–2024), the UAE (2022), Japan, the US, Brazil, Serbia (2024) and Vietnam (2023). All are annual, 2021 against 2022–2025.
  - For the sellers fetched second, war years cover only lines sold to Russia for at least USD 0.1m in 2021, the only lines the measure can use. The "covered" column is relative to that set.

### Method

For each HS6 line of a seller, take the unit value to Russia over the unit value to the rest of the world (World minus Russia). Divide it by the same ratio in 2021: `r = [UV_RUS/UV_ROW]_t / [UV_RUS/UV_ROW]_2021`. The premium on the line is `V_RUS,t × (1 − 1/r)`.

This is the difference-in-differences of CEPII Table D and BOFIT's China specification. It removes the seller's general price changes, inflation and exchange rates, and keeps fixed what each destination bought in 2021.

- **Lines used:** the same quantity unit in both years and to both destinations (else net weight), at least USD 0.1m to Russia in both years. HS 27 (fuel) and 71 (gold, precious metals) are left out.
- **Estimators:**
  - value-weighted, dropping lines with |ln r| > 1 (unit or mix breaks);
  - value-weighted median;
  - unweighted mean of ln r, which is what the regressions in the literature estimate.
- **Central:** per goods group, the mean of the three. Low: the lowest. High: the highest. A country-year total below zero is set to 0 (open question 4).
- **Groups:**
  - `chpl`: the 50 CHPL codes, from `chpl.json`;
  - `eu_ban`: HS6 under an EU export-ban annex of Reg. 833/2014, from the codes parsed in `sanctions_share.json` `bans`, leaving out the luxury annex because of its value thresholds. This covers most of HS 84, 85, 87 and 90, so it is a broad "sanctioned in the EU" group, wider than BOFIT's;
  - `other`: the rest.
- **Years not measured** are scaled from the nearest measured year by China's measured time profile. Relative to 2024 it is 0.06 in 2022, 0.59 in 2023 and 1.25 in 2025. 2026 takes 2025's share, applied to January–August sales.

### Measured premium, % of the seller's covered sales to Russia

| seller, year | covered / all, USD bn | lines | value-weighted (trimmed) | weighted median | unweighted | unweighted: EU-ban / other | unweighted: CHPL |
|---|---|---|---|---|---|---|---|
| CHN 2022 | 65.9 / 75.8 | 2825 | -3.9 | -2.3 | -0.0 | 1 / -2 | 22 |
| CHN 2023 | 97.2 / 110.6 | 2830 | 2.8 | 4.4 | 6.5 | 11 / -0 | 20 |
| CHN 2024 | 101.2 / 115.0 | 2811 | 5.6 | 10.8 | 10.7 | 15 / 3 | 32 |
| CHN 2025 | 90.1 / 103.2 | 2810 | 7.2 | 9.5 | 13.3 | 18 / 6 | 25 |
| TUR 2022 | 7.8 / 9.0 | 1332 | 8.9 | 8.6 | 12.1 | 15 / 8 | 31 |
| TUR 2023 | 9.1 / 10.7 | 1313 | 5.9 | 10.5 | 14.1 | 18 / 8 | 27 |
| TUR 2024 | 7.3 / 7.5 | 1216 | -0.8 | 2.7 | 9.5 | 15 / 3 | 15 |
| TUR 2025 | 5.8 / 6.0 | 1158 | -11.1 | 0.0 | 7.6 | 15 / -3 | 31 |
| KAZ 2022 | 5.0 / 6.5 | 244 | 4.7 | 5.9 | 16.1 | 17 / 15 | 39 |
| KAZ 2023 | 5.9 / 7.2 | 248 | 4.2 | 11.7 | 6.5 | 10 / 3 | -23 |
| KAZ 2024 | 6.0 / 7.2 | 245 | 7.3 | 14.5 | 8.2 | 11 / 3 | 46 |
| KAZ 2025 | 4.7 / 5.9 | 243 | 4.8 | 6.6 | 15.4 | 20 / 10 | 28 |
| DEU 2022 | 11.2 / 14.6 | 1845 | -2.7 | -0.0 | -0.1 | -1 / 2 | -3 |
| DEU 2023 | 6.8 / 9.3 | 1186 | 0.2 | 6.1 | 8.7 | 8 / 9 | 27 |
| DEU 2024 | 5.5 / 7.5 | 942 | 0.1 | 1.9 | 8.8 | 13 / 5 | 24 |
| DEU 2025 | 5.3 / 7.3 | 794 | -4.1 | 1.3 | 11.5 | 14 / 10 | 15 |
| IND 2022 | 2.2 / 2.4 | 614 | 0.8 | 2.2 | 6.4 | 9 / 3 | 4 |
| IND 2023 | 2.9 / 3.0 | 620 | -0.5 | 3.8 | 6.2 | 9 / 3 | 4 |
| IND 2024 | 2.9 / 3.0 | 619 | -4.3 | 0.2 | 4.8 | 6 / 4 | 2 |
| IND 2025 | 3.0 / 3.2 | 598 | 1.1 | 5.8 | 7.8 | 9 / 6 | 2 |
| KOR 2022 | 4.9 / 5.7 | 702 | -2.4 | 0.0 | 3.6 | 4 / 5 | -12 |
| KOR 2023 | 4.7 / 5.4 | 635 | 4.0 | 0.0 | 7.5 | 10 / 3 | -0 |
| KOR 2024 | 3.2 / 3.9 | 509 | 3.2 | 6.4 | 8.8 | 11 / 3 | 30 |
| KOR 2025 | 2.4 / 3.5 | 391 | 4.6 | 5.7 | 7.5 | 9 / 5 | 33 |
| UZB 2023 | 2.3 / 2.5 | 192 | 19.5 | 15.8 | 23.5 | 16 / 26 | 0 |
| UZB 2024 | 2.4 / 2.5 | 186 | 14.9 | 9.8 | 20.3 | 12 / 24 | 0 |
| HKG 2022 | 1.3 / 1.6 | 175 | -17.1 | -22.6 | 5.9 | 7 / 5 | 3 |
| HKG 2023 | 1.8 / 1.9 | 175 | 4.3 | 28.7 | 12.5 | 13 / -1 | 33 |
| HKG 2024 | 1.0 / 1.1 | 156 | -13.0 | 26.5 | 21.2 | 25 / 21 | 7 |
| HKG 2025 | 1.1 / 1.2 | 174 | -11.8 | 8.3 | 10.5 | 7 / 17 | 14 |
| JPN 2024 | 1.8 / 2.1 | 181 | -24.1 | -27.6 | 3.8 | 3 / 5 | -1 |
| ITA 2022 | 4.8 / 5.4 | 1341 | -11.7 | -0.6 | -2.5 | 2 / -10 | 14 |
| ITA 2023 | 4.2 / 4.5 | 954 | -6.4 | 0.0 | -3.7 | 3 / -11 | 18 |
| ITA 2024 | 4.1 / 4.3 | 829 | -8.9 | -0.4 | -4.5 | 3 / -10 | 0 |
| ITA 2025 | 3.6 / 3.8 | 736 | -4.3 | -0.0 | 1.5 | 7 / -2 | 75 |

What the measurements show:

- **The pattern in the literature holds.** The premium is near zero in 2022 and grows after that (BOFIT: ATT 0.21, 0.30, 0.71). It is larger for goods on the ban lists and for CHPL items, and larger from non-sanctioning sellers than from Germany or Italy.
- **The size on all sales, value-weighted, is much smaller than the headline numbers.**
  - China's unweighted mean is 11–13% in 2024–2025, against CEPII's +23% and BOFIT's 40–90% for sanctioned HS 84 goods.
  - The value-weighted estimates are lower again (6–11%). The largest lines dominate them: cars, trucks, phones and computers. Their unit values to Russia moved with the mix (Russia bought cheaper phones and power converters, and dearer SUVs).
  - For the CHPL codes the value-weighted premium is negative for China (−3 to −22%), while the unweighted one is +20–32%. Big lines such as 850440 (converters, ratio 0.62 in 2023) and 847150 (processing units, 0.45) look like quality downgrades, which is what Egorov et al. found in Russian customs data.
- **Türkiye**: about +10% in 2022–2023. Then 0 in 2025: its "other" goods to Russia fell 17–28% in unit value against other destinations, mostly clothing and food, likely a mix effect. The EU-ban group stays at +9–15% throughout.
- **Kazakhstan** +5–15% and **Uzbekistan** +15–24%. In Uzbekistan the premium is mostly on non-sanctioned goods (food, textiles), which is less clearly a sanctions rent. **Hong Kong** is too noisy to read (from −23% to +29% depending on the estimator).
- **Germany** +2–9% in 2023–2025, on goods still allowed (pharma, food, chemicals). CEPII's figure for sanctioning origins is +5%. **Italy** and **Japan** come out negative and are set to 0: Japan's sales are used cars, and Russia's 2023 engine-size ban changed their mix.
- **The CEPII coefficient applied instead.** Taking +0.21 log (18.9% of value) on all non-sanctioning sellers' direct sales (EUR 693bn over 2022–Aug 2026) would give about EUR 130bn gross and 70bn of seller's gain. That is the method band's upper case, not the central one: the coefficient is unweighted, it covers only to mid-2024, and it includes re-exporting hubs, whose markup the map already gives them as a margin.

### Results by year (gross premium, EUR bn; share of direct non-fuel sales in brackets)

| seller | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| China | 0.00 (0.0%) | 5.50 (5.4%) | 9.62 (9.1%) | 10.32 (11.3%) | 7.87 (11.3%) |
| Turkey | 0.79 (10.6%) | 0.86 (10.3%) | 0.24 (3.5%) | 0.00 (0.0%) | 0.00 (0.0%) |
| Kazakhstan | 0.55 (9.3%) | 0.36 (6.2%) | 0.58 (9.6%) | 0.52 (10.7%) | 0.34 (10.7%) |
| Germany | 0.00 (0.0%) | 0.47 (5.1%) | 0.29 (3.8%) | 0.19 (2.7%) | 0.13 (2.7%) |
| Uzbekistan | 0.04 (1.8%) | 0.47 (19.5%) | 0.38 (15.3%) | 0.68 (19.1%) | 0.44 (19.1%) |
| South Korea | 0.02 (0.3%) | 0.24 (4.5%) | 0.23 (5.9%) | 0.18 (5.4%) | 0.10 (5.4%) |
| India | 0.07 (2.7%) | 0.13 (3.6%) | 0.04 (1.0%) | 0.23 (5.8%) | 0.15 (5.8%) |
| Hong Kong | 0.00 (0.0%) | 0.41 (17.2%) | 0.13 (9.8%) | 0.05 (3.3%) | 0.04 (3.3%) |
| Belarus | 0.39 (2.0%) | 0.39 (2.0%) | 0.42 (2.0%) | 0.42 (2.0%) | 0.31 (2.0%) |


## 4. Why the premium is the seller's gain

- The premium is the price above what **the same seller** gets for **the same HS6 good** elsewhere, relative to 2021. Producing the good costs the same whichever buyer gets it. So the extra price does not pay for inputs or wages: it lands in the operating surplus. In the map's terms (overview, "the net-gain rule"): taxes on production plus profit above a normal return, as a share of the sale, is **1 on the premium**, less what pays for real extra costs.
- **Genuinely extra = 1.** Without the war the seller would sell the same good at the normal price. The premium exists only because of the war and the sanctions; "sold elsewhere instead" earns no premium. This holds for the premium on the whole actual volume, not just the change in volume, because the no-war premium is zero.
- **What is not the seller's gain** (taken out by the attribution factor `a`):
  1. **Real extra costs:** compliance and screening, payment delays and rejected transfers, prepayment risk, inland transport to the border (FOB includes it), bribes to intermediaries. CEPII puts freight and insurance at +3% (CIF/FOB), outside FOB, so outside this measure.
  2. **Mix inside an HS6 line:** Russia may buy a dearer variant (bigger cars) or a cheaper one (Egorov et al.: quality downgrades). This biases the measure in either direction; the DiD against the same exporter's other buyers removes only mix changes common to all buyers.
  3. **Over-invoicing for capital flight:** a Russian importer pays an inflated invoice to a supplier or front company abroad and the excess stays with the Russian owner. This is money leaving Russia, not a seller's gain.
  4. **Russian-owned front exporters** in Hong Kong, the UAE, Kyrgyzstan, Kazakhstan and Armenia: as with payment agents (35–60% kept by residents), part of the premium belongs to Russian owners.
- `a` = rent share × resident share. Producers outside the hubs: rent 0.6 (0.35–0.8) × residents 0.9 (0.8–1.0) = **0.54 (0.28–0.80)**. Hubs and front-company locations (KAZ, KGZ, ARM, UZB, GEO, HKG, ARE, AZE, TJK, MNG, SRB, BLR): rent 0.45 (0.2–0.7) × residents 0.6 (0.4–0.8) = **0.27 (0.08–0.56)**. CEPII's reading ("mainly margins") supports the upper half of the rent range; the over-invoicing and quality arguments support the lower. These are judgements (certainty D on the factor).

## 5. Avoiding double counting: the rule for the pipeline

**Rule.** For every seller country `c` and year `y` ≥ 2022:

```
S[c,y]       = own customs exports to Russia (trade_full exports_to_RUS, central/low/high)
               − re-exports to Russia (reexports.json, scaled by refine.json shares)    # hub goods made elsewhere
               × non-fuel, non-gold share (HS 27 and 71 out)                            # priced elsewhere in the map
G[c,y]       = Σ_g  π[c,g,y] × S[c,y] × w[c,g,y]       g ∈ {CHPL, EU export-ban list, other}
from_rus.years[y]  −=  G[c,y]                           # the premium is price, not volume (baseline 2021 unchanged)
new part "premium" (toward Russia) = G[c,y] × a[c] × 1.0 (net gain on rent) × 1.0 (genuinely extra)
```

In this file `G` is `gross_premium_eur_bn` and `G × a` is `seller_gain_eur_bn`. The net map effect is `G × a − G × vk` (the second term is what the map counts today through volume); it is in `map_effect_toward_russia_eur_bn`.

How each overlap is handled:

| existing part | overlap | handling |
|---|---|---|
| sold to Russia (`from_rus`) at `rx`/`rl` | the premium is inside the value and read as volume | subtract `G` from the actual years (not from the baseline) before deflation; the remaining volume keeps `rx`/`rl` |
| hub margins (`apply_reexports`) | a hub's resale price to Russia already includes its sanctions premium | re-exported goods are **out of `S`**; the hub keeps its margin as now; the origin country's re-exports (sold to the hub at non-Russia prices) carry no premium |
| payment-agent fees | paid by the Russian buyer to an intermediary outside the invoice; not in FOB unit values | additive, no change |
| residual (`apply_residual`) | Russian-recorded imports with unknown origin prices | out of `S` (central); could enter the high end only |
| CHPL marker | its value includes the premium | marker unchanged; the panel could say "of which premium" from `gross_by_group_central_eur_bn.chpl` |
| war-time windfall | Russia's fuel sales, opposite direction | no overlap; HS 27 and 71 are out of `S` |
| China military support (`china_military.json`) | dual-use goods inside recorded exports | no overlap: that file sizes the goods, not their price |
| counterfactual | no-war premium is 0 | the whole premium on actual sales is a change |

Certainty: **C** where the premium is measured from the seller's own HS6 unit values and the seller is not a front-company location (China, Türkiye, India, Korea, Germany and other measured producers); **D** for hubs, Hong Kong, the UAE, Belarus and every default.

## 6. Expected effect on the map, 2022 to August 2026

The table shows the 15 largest effects, toward Russia. "Map effect" is the seller's gain minus what the map already counts by reading the premium as volume (gross × `vk.rx`, or `vk.rl` for sanctioning sellers; it is small: China EUR 0.54bn). The percentages use `data.json` `gdp`, the map's denominator.

| # | seller | cert | basis | gross premium | seller's gain (low–high) | map effect | % of GDP (low–high) |
|---|---|---|---|---|---|---|---|
| 1 | China (CHN) | C | measured | 33.31 | 17.99 (4.76–42.65) | 17.45 | 0.101 (0.024–0.247) |
| 2 | Turkey (TUR) | C | measured | 1.89 | 1.02 (0.30–2.82) | 0.99 | 0.094 (0.025–0.265) |
| 3 | Kazakhstan (KAZ) | D | measured | 2.35 | 0.64 (0.07–2.56) | 0.60 | 0.247 (0.014–1.053) |
| 4 | Germany (DEU) | C | measured | 1.07 | 0.58 (0.03–3.01) | 0.57 | 0.014 (0.001–0.072) |
| 5 | Uzbekistan (UZB) | D | measured | 2.01 | 0.54 (0.08–1.99) | 0.51 | 0.508 (0.042–1.973) |
| 6 | Belarus (BLR) | D | default | 1.92 | 0.52 (0.00–4.16) | 0.50 | 0.712 (0.000–5.940) |
| 7 | South Korea (KOR) | C | measured | 0.77 | 0.42 (0.05–1.56) | 0.42 | 0.024 (0.003–0.091) |
| 8 | India (IND) | C | measured | 0.63 | 0.34 (0.03–0.95) | 0.33 | 0.010 (0.001–0.029) |
| 9 | Hong Kong (HKG) | D | measured | 0.63 | 0.17 (0.00–1.25) | 0.16 | 0.045 (0.000–0.350) |
| 10 | Brazil (BRA) | D | default | 0.22 | 0.12 (0.00–0.62) | 0.12 | 0.006 (0.000–0.031) |
| 11 | Indonesia (IDN) | D | default | 0.23 | 0.12 (0.00–0.65) | 0.12 | 0.009 (0.000–0.051) |
| 12 | Poland (POL) | D | default | 0.20 | 0.11 (0.00–0.86) | 0.10 | 0.013 (0.000–0.112) |
| 13 | Switzerland (CHE) | D | default | 0.18 | 0.10 (0.00–0.66) | 0.10 | 0.011 (0.000–0.077) |
| 14 | Netherlands (NLD) | D | default | 0.17 | 0.09 (0.00–0.70) | 0.09 | 0.008 (0.000–0.066) |
| 15 | Belgium (BEL) | D | default | 0.15 | 0.08 (0.00–0.59) | 0.08 | 0.014 (0.000–0.100) |


By share of GDP (central, top 10): Belarus 0.71%, Uzbekistan 0.51%, Armenia 0.28%, Kazakhstan 0.25%, Kyrgyzstan 0.11%, China 0.10%, Turkey 0.09%, Georgia 0.09%, Serbia 0.09%, Slovenia 0.08%

**Totals, 46 sellers.**

- Gross premium: EUR 48bn (20–99).
- Sellers' gain: EUR 24bn (5–74).
- Map effect: EUR 23bn (5–74) toward Russia.
- Where the gross comes from: 33bn measured, 10bn scaled from measured years, 5bn defaults.
- By goods group: EU export-ban goods 38.5bn, other goods 6.1bn, CHPL codes 0.8bn. The CHPL figure is small because the value-weighted CHPL premium is negative for China.

**How each seller moves.**

- **China:** about 0.10% of GDP (0.02–0.25%). Its net shift toward Russia grows by EUR 17bn, the largest new part after its payments for Russian fuel.
- **Türkiye:** 0.09%.
- **Kazakhstan:** 0.25%.
- **Uzbekistan:** 0.5%.
- **Armenia:** 0.28%. The base is its own production only; its re-exports stay with the hub margin.
- **Belarus:** 0.7% (0–5.9%), a default: Belarus publishes nothing by partner.
- **EU members and Korea:** below 0.03%.
- **Uncertainty:** the high ends are 3–4 times the central values because the attribution factor and the estimator choice multiply.

## 7. Open questions for the owner

1. **Change the stated rule?** `prices.md` says "higher prices on goods sold to Russia do not count". This proposal reverses that for a Russia-specific premium. The premium is measured against the same seller's other buyers, so it is not general inflation. The fuel windfall is the mirror case: a Russia-specific price is counted at Russia's net gain on the extra price.
2. **The attribution factor.**
   - Producers: rent 0.6 × residents 0.9 = 0.54.
   - Hubs: rent 0.45 × residents 0.6 = 0.27.
   - CEPII ("mainly margins") supports a higher rent share. Over-invoicing for capital flight and quality changes support a lower one.
   - This is the largest single lever: with a rent share of 0.8, China's effect would be about EUR 24bn instead of 17bn.
3. **Value-weighted or unweighted?**
   - The literature's numbers are unweighted line averages. The map counts euros, which argues for value weights.
   - The central here blends the two, about 9–11% for China in 2024–2025.
   - Unweighted only would raise China by about 20%.
   - The CEPII coefficient would give the EUR 130bn upper case (section 3).
4. **Negative premiums.** Totals below zero are set to 0: Türkiye 2025, Italy, Japan and the UAE in 2022.
   - A negative value is more likely a mix or quality change than a discount Russia won.
   - Setting it to 0 biases the total upward by about EUR 1bn.
   - The alternative is to allow negatives within the band.
5. **Hub margins.**
   - The hub's 5–20% re-export margin sits in `from_rus` and is valued at the goods factor `rx` (about 1.6% of it). `value_kept-notes.md` recommended 0.85 × extra for that margin.
   - Part of that margin is the same sanctions rent: CEPR DP20097 puts Armenia's, Kazakhstan's and Kyrgyzstan's sanctioned goods to Russia at +50–90%.
   - Should the margin above a normal wholesale margin (about 5%) count like this premium, at net gain 1?
   - That would add up to about EUR 0.15bn a year per large hub (UAE, Kazakhstan, Armenia, Kyrgyzstan) and keep hubs consistent with direct sellers.
6. **Belarus.** Nothing is measured. The default is 2% (0–7%) with the hub-type attribution, giving 0.7% of GDP, the largest share on the list. Should Belarus be left out (Union State pricing) or measured from partner data? Russia's own customs by partner are not published either.
7. **2026.** It takes 2025's share. BOFIT's event study suggests the premium still rises.
8. **A one-off download for coverage.** Monthly HS6 data with a free Comtrade key, or GTT if available, would add the missing sellers (Vietnam 2024–25, the UAE 2023+, the Kyrgyz Republic) and 2026. It would also allow BOFIT's product-time and country-product fixed effects in place of the plain 2021 base.
9. **Services.** The same logic could apply to services sold to Russia (freight on Russian routes, insurance, software through intermediaries). Not done here. Shipping of Russian oil already counts its freight premium.

## Files

- **`import_premium_r39.json`:** per seller and year 2022–2026:
  - `base_direct_nonfuel_eur_bn` (low, central, high);
  - `reexports_excluded_eur_bn`;
  - `premium_share_of_sales_unfloored`;
  - `gross_premium_eur_bn`;
  - `gross_by_group_central_eur_bn` (chpl, eu_ban, other);
  - `seller_gain_eur_bn`;
  - `basis`;
  - for measured years, `estimators` and `line_coverage_of_sales`.
  - Per seller it also has totals, `already_counted_as_volume_eur_bn_central`, `map_effect_toward_russia_eur_bn`, `map_effect_pct_gdp` and `certainty`.
  - The header holds the method, the rule for the pipeline, data availability, defaults, the time profile and the literature with URLs.
- **Scripts and raw downloads** are not in the repository, as with other research files. They were in the session's scratch directory: `fetch3.py` (download), `premium.py` (unit-value premium), `build.py` and `assemble.py` (this file). The UN Comtrade calls above reproduce the raw data.
