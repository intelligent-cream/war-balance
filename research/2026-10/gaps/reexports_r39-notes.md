# Re-exports to Russia from Türkiye, Azerbaijan and Serbia: HS6 product matching (round 39)

Data file: `reexports_r39.json` (same folder). Generated 2026-10-23.
Raw pulls: 540 Comtrade JSON files are in `/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r39/weak/dl/hs6/`. Scripts are `scripts/pull.py`, `scripts/hs6.py` and `scripts/write_rx.py` in the same scratch folder.

## What it replaces and how to swap it in

**What changes.** In `reexports.json` → `hubs.{TUR,AZE,SRB}`, three fields change: `reexports_to_RUS`, `reexports_to_RUS_baseline_2019_2021` and `reexport_share_of_exports_to_RUS`. They keep the same shape. Origin shares, margins and onward-Russian-goods fields stay as they are.

**A trap in `apply_reexports()`.** It multiplies these series by `refine.json` `reexport_share[hub][year][band] / old`. That is the round-11 HS4 correction, and it is now superseded. Use one of two ways:
1. **Swap `refine.json` only.** Replace `reexport_share.{TUR,AZE,SRB}` with `refine_reexport_share_equivalent` from this file. No code change is needed, and the result is identical.
2. **Swap the series.** Replace the series in `reexports.json` and drop the three hubs from `refine.json` `reexport_share`.

**One more consumer.** `apply_residual()` reads `reexport_share_of_exports_to_RUS` without the refine factor. That share decides how much of the hub's pro-rata gap moves to the origin countries. The new shares are given for it.

## Comtrade access (no key)

- **What works.** `comtradeapi.un.org/public/v1/preview/C/A/HS` answers without a key. It takes a comma list of HS6 codes and both flows and partners in one call.
- **Its limits:**
  - 500 rows per call and one period per call;
  - about one call every 3–4 s before HTTP 429 ("rate limit");
  - an intermittent "403 Quota Exceeded" after a few hundred calls, which clears after some minutes.
- **The pull.** About 110 HS6 codes per call (≤4 rows each). That makes 36 calls per reporter-year for the 3,891 HS6 codes of the chapters `reexports.json` uses (28–40, 42–43, 61–70, 73, 82–96). Reporters 792, 31 and 688 were pulled for 2021–2025: 540 calls, all complete.
- **What is out of reach.** The keyed endpoints (`/data/v1/get`, bulk files) were not used.
- **Check.** The HS6 sums reproduce the HS2 totals for Türkiye in 2023: chapter 84 exports to Russia USD 2.483bn, chapter 85 0.677bn, chapter 39 0.659bn.

## Method (HS6, the hub's own data)

For each product p:
- XR = exports to Russia.
- M3 = imports from everyone except Russia.
- XW = exports to everyone except Russia.

The steps:
1. **Matched increase** against 2021: m = max(0, min(ΔXR, ΔM3)).
2. **Weight for "pure imports":** w = 1 − XW/M3 in 2021. A product the hub already sold to the rest of the world counts as its own production.
3. **Re-exports** = Σ w·m + the pre-war level Σ w·min(XR₂₀₂₁, M3₂₀₂₁).
4. **Low** uses w².
5. **High** is the "level capacity": Σ min(XR, M3 − XW). That is the most foreign content the hub's own net imports allow.
6. **2026 (Jan–Aug):** the 2025 share of exports to Russia × `trade_full` Jan–Aug 2026, range ×0.8 / ×1.2.

Neither the S&P Global press figure nor the judged 0.4 / 0.75 / 0.4 shares is used any more.

## Results (EUR bn, central (low–high))

| hub | baseline 2021 | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug | share of all exports to Russia, 2022–25 |
|---|---|---|---|---|---|---|---|
| TUR | 0.41 (0.27–0.75) | 1.35 | 1.80 | 1.24 | 1.01 | 0.59 (0.34–1.21) | 15–18% |
| AZE | 0.030 | 0.056 | 0.077 | 0.098 | 0.077 | 0.053 | 6–9% |
| SRB | 0.097 | 0.25 | 0.24 | 0.19 | 0.16 | 0.10 | 21–22% |

The low and high for each year are in the JSON. Türkiye 2023, for example, is 1.80 (1.30–3.33).

**Comparison with what the map uses now** (`reexports.json` × the refine factor), EUR bn, 2022 – Aug 2026:

| hub | now | round 39 | change | old share of exports to Russia (residual) → new |
|---|---|---|---|---|
| TUR | 4.79 | 5.99 | **+1.20** | 0.155 / 0.20 / 0.167 / 0.127 → 0.153 / 0.178 / 0.157 / 0.170 |
| AZE | 0.42 | 0.36 | −0.06 | 0.137 / 0.167 / 0.177 / 0.177 → 0.060 / 0.070 / 0.090 / 0.074 |
| SRB | 0.75 | 0.93 | +0.19 | 0.154 / 0.178 / 0.157 / 0.151 → 0.216 / 0.215 / 0.210 / 0.217 |

**Effect on the map:**
- About EUR 1.2bn more of Türkiye's sales to Russia moves to the countries that made the goods. These are China, Germany, Italy, France and "other", by the existing origin shares, less a 10% margin. That is about 3% of Türkiye's ~36bn gross.
- The difference comes mostly from the **pre-war level**. HS6 shows Türkiye already re-exported about USD 0.48bn a year to Russia in 2021 (old assumption: EUR 0.17bn).
- The war-time **increase** is close to the round-11 HS4 result:
  - USD 0.94 / 1.46 / 0.86 / 0.66bn in 2022–25;
  - 35–38% of the increase in Türkiye's manufactured exports to Russia in 2022–24;
  - S&P Global found 30–50% foreign origin for high-priority goods.
- **Azerbaijan** is small and mostly its own production (SOCAR polymers): −0.06bn.
- **Serbia** imports most of what it sells to Russia in these chapters. The weight is high, giving +0.19bn.

**Largest matched HS6 products for Türkiye** (weighted, 2023): 340250 (washing preparations), 853710 (control panels), 871690 (trailer parts), 845811 (CNC lathes), 320890 (paints), 382499 (chemical preparations), 845710 (machining centres), 620140 (coats).

## Certainty and caveats

**Certainty: D → C for all three.** The estimate now comes from measured product-level trade in the hubs' own customs data, but still not from a flag on re-exports.

**Known weaknesses:**
- **Base year.** It is 2021 only. 2019 was not pulled, because of the quota. A 2019–21 average base would raise the matched increase (2021 was a strong year).
- **Code changes.** HS 2017 codes in 2021 against HS 2022 codes from 2022 lose some matches. The effect is small, and both sides of min() fall together.
- **Production within a product.** Within an HS6 product, the weight cannot tell domestic production from re-export. That is why the high end is wide.
- **Origin of matched products.** Origin shares are still the HS84/85/87/90 shares from `reexports.json`. Imports of the matched HS6 products by origin can be pulled the same way, about 15 calls per hub-year for the top 100 products.
- **TÜİK and RZS** (national monthly data) were not needed. Comtrade already holds the hubs' own HS6 reports for 2021–2025.
