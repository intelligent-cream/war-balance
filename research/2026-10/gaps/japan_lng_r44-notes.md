# Japan's purchases from Russia: a contract-based no-war path for Sakhalin-2 LNG (round 44)

Data file: `research/2026-10/gaps/japan_lng_r44.json`. Generated 2026-10-25. Status: **proposal, not applied**.
Fetch script: `pipeline/fetch/japan_r44.py`. Raw extracts: `research/2026-10/raw/japan_r44/`.

This file moves no central value. It narrows Japan's no-war band for "paid" (`to_rus` `cb`) by giving Sakhalin-2 LNG a band built from the contracts and leaving the generic band on everything else.

## Summary

- **Japan's LNG from Russia was very steady before the war, and it kept flowing during it.** Official Ministry of Finance figures show 6.1-7.3 Mt a year in 2016-2021 (6.57 Mt in 2021) and 5.7-6.9 Mt a year in 2022-2025. The Japanese buyers' long-term Sakhalin-2 contracts add up to about 5.0 Mt a year, with expiries from March 2026 to 2033.
- **But LNG is only 23% of what Japan bought from Russia.** In 2019-2021 the rest was crude (21%), coal (17%), palladium and platinum (10%), seafood (8%), aluminium (7%), oil products (3%) and other goods (10%). So the contract narrows only a quarter of the band.
- **Old vs new, Japan, "Russia's earnings from trade" (`rus`), 2022-2026, EUR bn:**

| | no-war band, 2022-26 | paid | Russia's-earnings number | chance | certain? |
|---|---|---|---|---|---|
| now | 0.652-1.500 | 7.76 (1.44 to 16.35) | 6.51 (−0.76 to 15.97) | **92.9%** | no |
| split, ρ = 1 (conservative) | 0.678-1.458 | 7.76 (1.80 to 15.74) | 6.51 (−0.46 to 15.42) | **94.1%** | no |
| split, ρ = 0.5 | 0.703-1.422 | 7.76 (2.15 to 15.23) | 6.51 (−0.17 to 14.97) | 94.8% | no |
| split, ρ = 0.39 (Japan's own 5-year LNG vs other-fuel correlation) | – | – | – | 94.9% | no |
| **split, ρ = 0.26 (recommended)** | **0.717-1.404** | **7.76 (2.33 to 14.97)** | **6.51 (−0.03 to 14.75)** | **95.05%** | **yes, just** |
| split, ρ = 0 | 0.732-1.384 | 7.76 (2.52 to 14.69) | 6.51 (+0.13 to 14.50) | 95.4% | yes |

  - In % of GDP, Russia's-earnings number goes from 0.161% (−0.019% to 0.394%) to 0.161% (−0.001% to 0.364%) at ρ = 0.26.
  - No method alternative crosses zero. The lowest is "redirected trade" (attrib) at +4.15.
- **Reading: this is an honest improvement, but not a robust flip.**
  - The split narrows the low side of Japan's no-war band by 8% (ρ = 1) to 19% (ρ = 0.26).
  - Japan crosses 95% only if the error on LNG and the error on Japan's other purchases are at most weakly correlated (ρ ≲ 0.3), and then only by 0.05 points.
  - The measured correlations are 0.10-0.26 (round 8, fuel vs non-fuel) and 0.39 (Japan's own LNG vs other fuels, 7 windows). The case is on the edge either way.
- **Other countries:**
  - Korea: KOGAS has 1.5 Mt/yr from Sakhalin-2 to 2028, but LNG is only 8% of Korea's purchases from Russia. Its Russia number is already certain (99.1%).
  - China: LNG is 3% of its purchases (Yamal and Sakhalin), and Power of Siberia is already handled by `power_of_siberia()`. Its Russia number is already certain (99.8%).
  - Taiwan: no long-term Russian LNG contract was found. Its paid central is about zero (chance 59.8%), so a narrower band cannot make it certain.
  - The approach changes no status outside Japan.

## 1. Data (task 1)

**Sources and whether they could be reached**

| source | status | used for |
|---|---|---|
| Ministry of Finance, Trade Statistics of Japan, "Commodity by Country (Import)" CSV files on e-Stat (statistics code 00350300), 2009-2025 full years and January-August 2026 | reachable, fetched (22 section files a year, about 0.1-3 MB each, read in memory; only the Russia rows, country code 224, are kept) | everything: values (thousand JPY) and quantities by 9-digit HS code, yearly and monthly |
| UN Comtrade public preview (no key), Japan/Korea/China imports from Russia | reachable, fetched (one period per call) | cross-check: Japan's LNG tonnes and values are identical to MoF. Korea and China LNG shares |
| customs.go.jp trade statistics search | reachable (200), but a JavaScript form | not needed: the same data is in the e-Stat files |
| e-Stat API (api.e-stat.go.jp) | reachable, needs an appId | not used |
| METI/ANRE enecho.meti.go.jp | HTTP 403 | not used |
| JOGMEC | 301 | not needed |
| Sakhalin Energy | HTTP 503 | not used |
| S&P Global (contract table, May 2025) | HTTP 403 | figures from a web-search summary, **not verified** |
| energynews.africa (12 December 2024) | fetched | about 5 Mt/yr contracted of about 6 Mt/yr imported; JERA 0.5 Mt; expiries 2026-2033 |

**Japan's imports from Russia (MoF; bn JPY, LNG in Mt)**

| year | total | LNG (Mt) | LNG | crude | coal | products | PGM 7110 | aluminium | fish 03 |
|---|---|---|---|---|---|---|---|---|---|
| 2017 | 1551 | 7.26 | 312 | 416 | 232 | 115 | 83 | 138 | 124 |
| 2018 | 1723 | 6.67 | 358 | 433 | 263 | 135 | 118 | 132 | 140 |
| 2019 | 1561 | 6.40 | 338 | 435 | 250 | 66 | 125 | 84 | 121 |
| 2020 | 1145 | 6.14 | 250 | 192 | 195 | 43 | 167 | 73 | 103 |
| 2021 | 1552 | 6.57 | 372 | 258 | 286 | 39 | 153 | 136 | 137 |
| 2022 | 1972 | 6.87 | 678 | 174 | 476 | 22 | 130 | 150 | 155 |
| 2023 | 1033 | 6.13 | 583 | 7 | 112 | 0 | 60 | 47 | 131 |
| 2024 | 860 | 5.68 | 547 | 0 | 29 | 0 | 60 | 25 | 130 |
| 2025 | 828 | 5.80 | 502 | 5 | 23 | 0 | 71 | 26 | 143 |
| 2026 Jan-Aug | 583 | 3.42 | 305 | 26 | 16 | 0 | 92 | 26 | 82 |

- 2009-2016 are in the JSON. LNG started in 2009 with 2.77 Mt. It peaked at 8.57 Mt in 2013, in the years after Fukushima.
- Value shares 2019-2021: LNG 22.5%, crude 20.8%, coal 17.2%, PGM 10.5%, fish 8.5%, aluminium 6.9%, products 3.5%, other 10.1%. Fuel in total is 64.0%, which matches the build's fossil share for Japan (0.655).

**Sakhalin-2 contracts (long-term, Mt/yr, expiry)**
- JERA (ex-TEPCO): 1.5, 2029.
- JERA (ex-Chubu): 0.5, March 2026.
- Tokyo Gas: 1.1, 2031.
- Kyushu Electric: 0.5, 2031.
- Toho Gas: 0.5, 2033.
- Tohoku Electric: 0.42, 2030.
- Hiroshima Gas: 0.21, 2028.
- Osaka Gas: 0.2, 2031.
- Saibu Gas: 0.07, 2028.
- Total for Japan: **5.0 Mt/yr**. Korea's KOGAS: 1.5, 2028. Plant capacity: 9.6 Mt/yr.
- Prices are oil-indexed, with periodic reviews.
- The amount by which buyers may take less than contracted is not public, so it is not used.
- Pre-war, Japan took 1.1-2.3 Mt/yr above the contracts, as spot and mid-term cargoes.

## 2. The no-war path (task 2)

- **Central.** The 2021 volume is held flat (6.57 Mt; the 2017-2021 mean is 6.61 Mt). This is a volume multiplier of 1.0, the same as the generic central (`counterfactual.json` JPN `to_rus` is "2021 level held"; `bmul` above 1 is the no-war fuel price from `apply_nowar_prices`). **`bmul` does not change.**
  - Unlike Power of Siberia, there was no contracted ramp-up above 2021, so nothing is added.
- **Low.** Only the contracted Japanese quantities are delivered: 5.0 Mt/yr, and 4.69 Mt/yr in 2026 because JERA's 0.5 Mt contract ended in March 2026, an expiry known before the war.
  - That is 0.761 of 2021 per year, and **0.755** for 2022-2026 with 2026 at 8/12.
- **High.** The larger of the highest pre-war year (2013: 1.304 × 2021) and Japan's highest own rolling window at that horizon (origin 2010, Fukushima: up to 1.345). For 2022-2026 that is **1.332**.
- **Band (cumulative, multiplier on the summed expected level):**
  - H1 0.761-1.304, H2 0.761-1.304, H3 0.761-1.326, H4 0.761-1.345, H5 (2026 at 8/12) **0.755-1.332**.
  - Today's generic band is 0.652-1.500.
- **Check against 2010-2021.** A random walk on Japan's own LNG volumes from Russia, origins 2010-2020:
  - The 5-year cumulative ratios are 1.332, 1.136, 0.948, 0.877, 0.839, 0.898 and 0.904.
  - The 1-year ratios run from 0.896 to 1.181.
  - All 7 five-year windows and all 11 one-year windows lie inside the band.
  - During the war Japan actually took 0.92 × 2021 over 2022-2026, which is inside the band too. Deliveries carried on near the contract-plus level.
- **The other 77% keep the generic band** (to_rus/L × CB_SCALE_PAID), as asked.
  - Round 8 found that seaborne fuel and non-fuel goods, measured alone, are if anything wider than the generic band. So the generic band on the rest is not conservative, and that is a reason not to lean on ρ = 0.
- **Combining the two.** The weight is LNG's share of the expected value, W_t = s · n_t / bmul_t, where s = 0.23 and n_t = (bmul_t − (1 − fs)) / fs is the no-war fuel price factor. W_t is about 0.25.
  - The deviations are combined as `1 − low = sqrt((W·dL)² + ((1−W)·dG)² + 2ρ·W(1−W)·dL·dG)`, and the same for the high side.
  - Evidence for ρ:
    - Round 8 measured 0.10 (all) and 0.26 (pipeline buyers) between fuel and non-fuel errors.
    - Japan's own LNG vs crude+coal+products volume windows give −0.16 (1 year) to 0.39 (5 years, n = 7). Non-fuel goods are 36% of the rest.
  - **Recommended ρ = 0.26**, with ρ = 1 as the conservative bound.

## 3. Effect (task 3)

- **Method.** The `load.mjs` harness, with `c.T.paid.cb` replaced and `calc` / `chance` / `uncertain` rerun. pSignMC is seeded, so repeats give the same result.
- **Result.** See the table in the Summary.
  - The whole no-war band would have to shrink to about ×0.81 for Japan to reach 95%.
  - The split gives the equivalent of ×0.93 at ρ = 1 and ×0.81 at ρ = 0.26.
- **Sensitivity.** With a data-only LNG band (own windows × K = 1.2: 0.81-1.41) instead of the contract floor:
  - 94.5% at ρ = 1;
  - 95.05% at ρ = 0.39;
  - 95.2% at ρ = 0.26.
- **Korea, Taiwan, China:** see the Summary. Same method, with the LNG shares in the JSON (`other_countries`). No status changes.

## Proposed build changes

1. **New function `contract_lng(countries, src)` in `pipeline/build_data.py`**, called in the build sequence **right after `apply_nowar_prices(countries, src)`**. It needs `bmul` with the no-war price applied. It could also be folded into `power_of_siberia()` as a second "contract" branch, but the order differs: Power of Siberia adds volume before prices, while this re-weights the band after them.

```python
def contract_lng(countries: dict[str, dict], src: Sources) -> None:
    """Round 44: Japan's Sakhalin-2 LNG follows its buyers' long-term contracts (about 5 Mt/yr, japan_lng_r44.json):
    the LNG part of "paid" gets a band from the contract floor and the pre-war maximum, the rest keeps the generic
    band (x CB_SCALE_PAID); combined by LNG's share of the expected value. No central change (2021 volume held)."""
    jl = load(GAPS / "japan_lng_r44.json")
    for iso3, flows in jl["countries"].items():
        d, tr = flows["to_rus"], (countries.get(iso3) or {}).get("to_rus")
        if not tr or not tr.get("cb") or not tr.get("bmul"):
            continue
        fs, s, rho = fossil_share(iso3), d["lng_share_of_base"], d["rho"]
        q = tr["bmul"]
        w = [s * (b - (1 - fs)) / fs / b if b and fs else s for b in q]
        hs = ["H1", "H2", "H3", "H4", "H5_2026_8of12"]
        cb = [None]
        for h in range(1, 6):
            wt = [q[i] * FRAC[i] for i in range(1, h + 1)]
            W = sum(x * w[i] for x, i in zip(wt, range(1, h + 1))) / sum(wt)
            band = d["lng_cumulative_band"][hs[h - 1]]
            g_lo, g_hi = tr["cb"][h]

            def comb(a: float, b: float) -> float:
                return math.sqrt((W * a) ** 2 + ((1 - W) * b) ** 2 + 2 * rho * W * (1 - W) * a * b)

            cb.append([round(1 - comb(1 - band["low"], 1 - g_lo), 4), round(1 + comb(band["high"] - 1, g_hi - 1), 4)])
        tr["cb_generic"] = tr["cb"]
        tr["cb"] = cb
        tr["src"] = list(dict.fromkeys((tr.get("src") or []) + [src.add(
            "japan_lng_r44",
            "Japan's imports from Russia by product (Ministry of Finance trade statistics via e-Stat) and Sakhalin-2 long-term LNG contracts (about 5 Mt/yr to Japanese buyers)",
            "https://www.e-stat.go.jp/en/stat-search/files?toukei=00350300&tstat=000001013141",
            jl.get("generated"),
            "LNG's no-war band from the contracts, the generic band on the rest; see research/2026-10/gaps/japan_lng_r44-notes.md",
        )]))
```

   - Note: when computing `wt`, check that `FRAC[5]` is 0.6667 in the build, as in data.json `frac`. The harness used 2/3.
   - `math` is already imported in `build_data.py`.
   - The yearly bands (`bmul_lo` / `bmul_hi`, used by `spreadYear` and the yearly view) are left as they are. Optionally they could be narrowed the same way per year, using the LNG yearly band of 0.761-1.304.
2. **`SOURCE_TYPE`** (`pipeline/build_data.py`, the dict starting near line 1969): add `"japan_lng_r44": "data"`. The contract volumes are press, so `"press"` is the stricter choice if a single kind is needed.
3. **The ρ decision for the owner:** `japan_lng_r44.json` → `countries.JPN.to_rus.rho` = 0.26 (recommended; Japan becomes certain at 95.05%) or 1.0 (conservative; 94.1%, stays uncertain). The 95.05% result sits right on the threshold. If the owner wants a flip that holds up, this change alone does not give one.
4. **`site/content/method/counterfactual.md`** (the integrator edits): one paragraph saying that Japan's Sakhalin-2 LNG, about a quarter of its purchases from Russia, has a no-war band from its long-term contracts (5 Mt/yr; floor = contracted volumes, top = the pre-war maximum), and the rest keeps the generic band.
5. **`research/2026-10/raw/MANIFEST.json`**: not edited (shared file). Add `japan_r44/` (`mof_imports_from_russia_2026-10-25.json.gz`, sha256 `b743e0e2…a086`; `comtrade_jpn_from_rus_2026-10-25.json`; `comtrade_other/`).
6. **Not proposed:** a change of central. The contract central equals the generic central, a 2021 volume of 1.0. Using the 2019-2021 mean (0.974 × 2021) would lower Japan's expected path, and so its paid central, by about 0.6% of the expected sum. That is too small to matter and is not backed by a contract change.
