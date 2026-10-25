# Energy near-misses: Türkiye, Czechia, Malta (round 44)

Data file: [`energy_r44.json`](energy_r44.json). Raw extracts: `research/2026-10/raw/energy_r44/`, written by [`pipeline/fetch/energy_r44.py`](../../../pipeline/fetch/energy_r44.py) (`uv run pipeline/fetch/energy_r44.py`). Generated 2026-10-25.

This file is a proposal. The build does not read it.

**How the chances were computed.** The site's own model code (`site/index.html`, from `// ===== Model =====` to `lensValue`) was loaded as in the round-43 blocker scripts. A copy of each country was patched (data fields, not the part's lo/hi), re-normalised, and passed through `calc()`, `chance()` and `uncertain()`. The method alternatives come from `detail.json` and are left unchanged. This harness reproduces the current values exactly: TUR 0.9455 / 0.9409, CZE 0.9399, MLT 0.9484.

## Summary

| | number | part | old range (% of GDP) | new range | chance old → new | certain? | evidence |
|---|---|---|---|---|---|---|---|
| Türkiye | net | windfall | −1.93 [−3.49, +0.37] | −1.93 [−3.23, −0.03] | 0.946 → **0.963** | **yes** | method fix (no new official price data exists) |
| Türkiye | Russia's earnings | windfall | same | same | 0.941 → **0.958** | **yes** | same |
| Czechia | net | paid | +2.38 [+0.14, +4.50] | +2.38 [+0.87, +4.50] | 0.940 → **0.968** | **yes** | official: Czech customs, Eurostat energy balance, IMF |
| Czechia | Russia's earnings | paid | same | same | 0.769 → 0.827 | no | |
| Malta | net | ship | −0.17 [−0.81, +0.06] | unchanged | 0.948 | no | official data only bound it (UNCTAD); CREA owner data needs an API key |

## 1. Türkiye: the windfall

### Official Turkish price evidence: there is none to add

- **Turkish customs** (Comtrade reporter 792, imports from Russia) publish chapter 27: USD 41.8bn (2022) and 30.1bn (2023). They hide HS 2709 completely. For HS 2711 they show only LNG/LPG: 0.146 and 0.348bn. TÜİK publishes the same customs data, so it has no Russian gas or crude unit value either.
- **EPDK** natural gas sector reports (2024 report re-read, SHA-256 `9bede383…`, the same file `epdk_entsog.py` uses) give import volumes by country and contract type. Their only price table is section 9 (Tablo 9.1): average retail prices to households and industry in TL/Sm³, which are subsidised. There is no import price and no BOTAŞ purchase cost.
- **BOTAŞ**: the annual-report page answers HTTP 200 but links no report files. The reports give no purchase cost by supplier anyway.
- **Gazprom** stopped publishing average prices by country after 2021.
- The only official price evidence is therefore the chapter-27 residual that `turkey_prices.json` already uses: chapter total minus visible headings, minus crude, minus LNG.

### A method error that inflates the range

- `war_windfall()` sets `c.windfall.path_band` = `proposed_likely_range_eur_bn` low/high over central, from `windfall_band_r24.json`.
- That range is already the **quadrature of the actual-price band and the no-war-path deviation**. `windfall_band_r24-notes.md` (Proposal 1) says so, and the numbers confirm it. For Türkiye: 20.495 − √((20.495 − 6.629)² + (20.491 − 5.946)²) = 0.40, which is the stored low.
- `calc()` then combines it with the actual-price band a second time: `withNr()` → `hypot(r0 − r1, |W| × (1 − pb[0]))`.
- So on the side toward zero, Türkiye's windfall range is √(13.9² + 20.1²) = 24.4bn. Without the double count it would be √(13.9² + 14.5²) = 20.1bn.
- **Fix:** take the pure path ratios, sorted: [Feb-2022 futures, Oct-2021 forecasts] / Jan-2022 central. For Türkiye that changes `path_band` from [0.0195, 1.6765] to [0.2902, 1.5114].
- **Result for Türkiye:**
  - windfall: €−20.48bn [−37.07, +3.95] → [−34.37, −0.36];
  - net: 0.9455 → 0.9627;
  - Russia's earnings: 0.9409 → 0.9579.
  - Both become certain.
- **Other countries with a path band**, re-run with pure ratios (HUN, SRB, SVK, AUT, CHN, MDA, BGR, GRC, MKD, DEU, ITA, CZE, POL, FIN, BIH): no status changes, and none loses certainty. The largest other move is +0.007.
- **Without the fix**, an evidence-based narrowing of the actual-price band would have to reach ×0.85 to make Türkiye certain. ×0.90 gives only 0.9485, and no source supports even that.

## 2. Czechia: the pre-war level of purchases from Russia

### What holds it back

- `paid` gets 74% of its spread toward zero from the baseline (`base`). The low end of `base_range` is 2.05, against a central of 4.21 (EUR bn at 2019–2021 prices).
- That low end is `to_rus.years_lo[0] / pidx_hi[0]` = 2.888 / 1.408.
- 2.888 comes from `trade_full.json` CZE `imports_from_RUS` 2021 low = **3.945**, which is central 5.918 / 1.5. This is the rule that widens the range toward the IMF value, capped at ×1.5.

### Why the IMF value is not a real alternative

The IMF IMTS series is Czech customs TOTAL minus HS 2711. It omits Russian gas.

| USD bn | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|
| Czech customs, total from Russia | 5.015 | 2.942 | 6.999 | 11.375 | 3.468 | 3.392 | 1.148 |
| of which HS 2711 (gas) | 1.632 | 0.808 | 3.489 | 7.790 | 0.475 | 0.900 | 0 |
| total − HS 2711 | 3.383 | 2.134 | 3.510 | 3.585 | 2.993 | 2.492 | 1.148 |
| IMF IMTS | 3.283 | 2.176 | 3.511 | 3.449 | 2.974 | 2.407 | 1.040 |

- The build then swaps customs gas for final-use gas (`energy2.json` `transit_gas`). It subtracts customs gas (EUR 2.95bn in 2021) from a low that never contained it.
- So the low case keeps about EUR 1.0bn of non-gas goods. In effect it assumes Czechia bought **no Russian crude** in 2021.

### Official volumes (2017–2026)

| | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|---|---|---|---|
| Russian crude, kt (Eurostat `nrg_ti_oil`) | 4,100 | 4,003 | 3,822 | 3,013 | 3,418 | 4,161 | 4,307 | 2,715 | – | – |
| Russian crude, kt (Czech customs HS 2709) | 4,100 | 4,003 | 3,821 | 3,013 | 3,417 | 4,162 | 4,223 | 2,716 | 527 (Jan to mid-Apr) | 0 |
| all crude imports, kt (Eurostat) | 7,814 | 7,439 | 7,738 | 6,174 | 6,841 | 7,425 | 7,406 | 6,501 | | |
| Russian gas, million m³ (Eurostat `nrg_ti_gas`) | 8,817 | 7,968 | 9,508 | 7,590 | 8,719 | 6,838 | 551 | 1,791 | | |

- **Druzhba ended for Czechia in April 2025.** MERO ČR's press release of 17 April 2025 says Czechia was supplied exclusively with non-Russian crude for the first time, via TAL-PLUS. MERO publishes no yearly volume table: its annual-report pages return 404.
- **The 2021 customs values match volumes × market prices:**
  - crude: USD 511/t, at Urals;
  - gas: about EUR 32/MWh on 8.7 bcm (92 TWh at 10.55 kWh/m³), plausible for lagged contracts.
- So the origin-based customs value is confirmed by two official volume series. The site uses the same origin basis for 2022–2026.

### Proposed low and effect

- **New low:** the file's own reported margin, ±6.96% (= high/central − 1), with no IMF widening. 2021: 5.506 instead of 3.945.
- **Estimated effect:**
  - `years_lo[0]` 2.888 → about 4.22, using the current gas-swap and freight factor 0.852 on the low;
  - `base_range` low 2.05 → 3.00;
  - `paid` +2.38 [+0.14, +4.50] → [+0.87, +4.50];
  - net: 0.9399 → **0.968**, certain. With a harsher freight factor (0.80): 0.9675. Together with the windfall fix: 0.972.
  - Russia's earnings: 0.769 → 0.827. Still not certain: the windfall then dominates.

The same IMF-capped low (central/1.5) appears in 2021 for **GBR, ROU and OMN**. They were not checked here.

## 3. Malta: shipping

### What drives the range

The `ship` part's side toward zero is EUR 0.131bn over 2022–2026. It splits as follows:

- **ship sales at the high case:** 0.060bn. That is 80% of 1.5× a sale value that is an educated guess (`shipping.json`). Follow the Money names Greek, UK, German and Belgian sellers, not Maltese ones.
- **Maltese-controlled freight:** 0.052bn. It is the high controller share × the high "genuinely extra" net gain, `vk.sh` 0.0415. The central `vk.sh` is 0, so freight adds nothing to the central.
- insurance: 0.010bn;
- registry fees: 0.010bn.

### Evidence

- **UNCTADstat beneficial ownership** (official, all ship types):
  - Malta-owned fleet: 4.2–4.3 Mdwt (about 0.07% of the world, roughly 200 ships) in 2019–2022, 5.1 Mdwt in 2023, 12.2–12.7 Mdwt in 2024–25;
  - Greece-owned: about 18% of the world.
  - Malta/Greece is 0.4% (2021–22) and 1.0% (2024–25). The model's controller shares imply 4–7% (`shadow_fleet.json`: Malta 1.7–2.2% of Russian barrels, Greece 30–39%).
  - Malta is mostly a flag of Greek owners. In 2022, 63.5 of the 114.8 Mdwt under Malta's flag was Greek-owned and 0.7 Mdwt Maltese-owned.
  - This suggests Malta's share is overstated, but UNCTAD has no split by ship type. It bounds the share; it does not measure it.
- **CREA:**
  - `/v1/kpler_trade` holds per-voyage owner and flag, but it needs an API key (HTTP 400, "Please provide an API key").
  - `/v0/chart/departure_by_ownership`, already fetched, gives only G7+/shadow totals.
- **Transport Malta** registry statistics: HTTP 403.
- **EU sanctions listings** of Malta-flagged vessels concern the flag, not the controller. Malta's shadow share is already 0 in the model.
- **Press:** Lloyd's List mentions Malta only as the flag of Greek-owned tankers.

### Options (net chance)

| option | net chance |
|---|---|
| freight high share at the central share | 0.9505 |
| Maltese freight ×0.5 | 0.9595 |
| Maltese freight ×0.25 | 0.9625 |
| ship-sales high at 2× central | 0.9606 |

Every one of these is a judgement, not a measurement. **No change is recommended** on the evidence reached.

## Proposed build changes

1. **Türkiye (and every country with a path band): stop counting the actual-price band twice.**
   - Where: `pipeline/build_data.py`, `war_windfall()`, the round-24b block that sets `c["windfall"]["path_band"]`.
   - Replace `r = wb["proposed_likely_range_eur_bn"]; path_band = [r["low"]/r["central"], r["high"]/r["central"]]` with:
     - `p = wb["windfall_by_path_eur_bn"]; c0 = p["central_jan2022"]`;
     - if `abs(c0) >= 0.05`: `path_band = sorted([round(p["feb2022_futures"]/c0, 4), round(p["oct2021_forecasts"]/c0, 4)])`, else none (BIH).
   - `calc()` needs no change: `withNr()` already combines the path band with the actual-price band in quadrature.
   - Update the comment and the `windfall_band` source note: the band is the no-war-path spread alone.
   - Expected: TUR `path_band` [0.2902, 1.5114]; windfall €−20.48bn [−34.4, −0.4]; net 0.963 and Russia's earnings 0.958, both certain. No other status changes.
2. **Czechia: drop the IMF (gas-less) low end of its purchases from Russia.**
   - Where: `research/2026-10/gaps/trade_full.json`, `countries.CZE.imports_from_RUS`.
   - Set `low` to central × (2 − high/central), the file's own reported margin:

     | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 |
     |---|---|---|---|---|---|
     | 4.168 | 2.396 | 5.506 | 10.050 | 2.985 | 2.916 |

     Also set `baseline.low` to 5.506.
   - Add a note: IMF IMTS = Czech customs TOTAL − HS 2711 (`energy_r44.json`).
   - No code change. `counterfactual()` derives `base_range` from `years_lo[0]`.
   - Expected: `to_rus.years_lo[0]` ≈ 4.2, `base_range[0]` ≈ 3.0, CZE net 0.968, certain.
   - Optional follow-up: apply the same check to GBR, ROU and OMN (2021 low = central/1.5). Or add a rule in the trade builder: do not widen toward an IMF value that equals the reporter's total minus one HS heading.
3. **Malta: no change.**
   - If the owner accepts a judgement, the smallest defensible one is to scale MLT `freight` in `shadow_fleet_r6.json` ×0.5 on the UNCTAD ownership evidence. Net 0.9595, certain.
   - Better: fetch CREA `/v1/kpler_trade` with a key (Russian origin, `nest_ships=false`, one row per trade, grouped by `ship_owner_iso2`) and replace Malta's controller share with the measured one.

## Overlaps

- No new money flow. Change 1 changes ranges only, not centrals.
- Change 2 changes a low end only. The 2021 central and the gas swap are untouched. It also widens nothing else, because `al`, the actual-value term on Czechia's toward-zero side, uses the high values.
