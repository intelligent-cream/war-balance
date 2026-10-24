# Laundered oil, round 43: better data for the countries it decides

Gathered 2026-10-24. Output: [`laundered_r43.json`](laundered_r43.json). Downloads: `research/2026-10/raw/{eurostat,comext,comtrade,aps,eia,epdk,ecb}_laund/` (≈330 KB), fetched by `pipeline/fetch/laundered_r43.py` (run with `python -I`). Wired into the builder in round 43; see **Wired in** for the built values. The tables before it are the research-stage estimates.

Units: EUR bn nominal, 2026 = January–August. "Part" means the site's laundered-oil part (`laund`, at Russia's net gain), summed over 2022–2026. Positive means Russia lost: the buyer gets credit. The part was recomputed with the site's own `calc()` and `pSignMC` on patched copies of `site/data.json` (2026-10-24). These are approximations: refiners' deductions and other countries are not rebuilt.

## The question

The round-43 blocker analysis found that halving the laundered part's range would make five net numbers certain: Chile, Cyprus, Malta, the Philippines and Papua New Guinea. On Russia's earnings it would do the same for Fiji and South Africa. This round asks what makes each of these ranges wide, and whether better data can narrow it.

## What makes the range wide now

The shares below come from holding one input at its middle value. They measure how much of the half-width toward zero disappears. Base and actual values are correlated at 0.5 in `calc()`, so the shares do not add up to 100%.

| country | main driver | what it is |
|---|---|---|
| Cyprus | actual values (59%) | Comext "not specified extra-EU" imports (QW), counted as 40% (10–80%) refined from Turkish or Indian crude. CREA's Turkish-port cargoes to Cyprus are counted as fuel used in Cyprus |
| Malta | actual values and base | The bunker split, the EU-refiner route in 2021–22, and Turkish-port cargoes held at the cap |
| Philippines | **expected path (48%)** | `bmul` keeps the old China-route pre-war growth: in the middle case ×1.25–1.8 by 2026, at the low end flat. This is a counterfactual, not data |
| Pakistan | expected path (40%), actual values | As for the Philippines, plus the UAE share (±50%) |
| Chile | **actual values (93%)** | The "OTHER" origins (US refiners, "areas nes") may reach 2% Russian crude. US fuel is 75–85% of Chile's imports, so the high end is 5–10× the middle |
| Papua New Guinea, Fiji | actual values, price | The Singapore pool share (×0.74–1.38), stacked with crude content and quantity |
| New Zealand | actual values, gain, price | Singapore, Malaysia and Indian shares, stacked |
| South Africa | price, actual values, gain | India's band (×0.75–1.27) on 30–35% of imports |
| Australia | actual values, price, gain | The CREA-based series, whose ends are wide |

Two features of how the range is built matter for every country:

- **Ends are stacked.** r39 multiplies the low (and high) ends of quantity, origin share and crude content together. Elsewhere `calc()` combines independent terms in quadrature.
- **The price is counted twice.** `calc()` then adds the Urals price band through `pidx`. Crude content is itself Russian FOB price × yield ÷ fuel price, so the price uncertainty enters twice.

## New data

| input | source (status) | what changed |
|---|---|---|
| Russian share of India's crude in 2026 | India's monthly customs via UN Comtrade (200): 20.6%, 26.5%, 38.4%, 34.9%, 40.8%, 49.1% and 53.7% for January–July. CREA 55.5% for July (press, [Business Today](https://www.businesstoday.in/latest/economy/story/india-buys-record-russian-crude-again-imports-hit-2-8-million-bpd-in-july-548355-2026-08-10)) | 0.30 (0.21–0.40) → **0.39 (0.29–0.47)** |
| India's band, 2023–25 | Customs (37.8%, 38.1%, 33.7%) and Kpler (about 39% in 2023) agree. The spread between refineries comes from KSE: the exporting refineries' share runs ×0.64–1.37 of the national share in individual quarters, which averages out over a year | ×0.75/1.27 → ×0.85/1.25 |
| Türkiye's share | EPDK annual oil market reports (200), Table 2.1.1: Russian crude ÷ all crude imports | 2019 **0.336** (r39 0.20); 2020 0.111; 2021 0.173; 2022 0.358 (r39 0.416); 2023 0.341; 2024 0.564; 2025 0.477; Jan–Aug 2026 **0.269** (r39 0.45; EPDK August annex, as in `turkey_gas_r43.json`). Band ×0.85/1.2. Cert A: EPDK matches CREA within 1% for 2024 |
| EU refiners' shares | Eurostat `nrg_ti_oil` crude imports from Russia ÷ total (200) | One EU share of 27% → each member's own. In 2019–21: Greece 10–18%, Spain 2–5%, Italy 10–14%, France 9–13%, Netherlands 27–32%, Belgium 29–32%, Finland 83–92%, Lithuania 73–80%, Poland 63–72%. All 0 from 2023 except Hungary, Slovakia and Czechia. Bulgaria is confidential, so the r39 value stays |
| US refiners | EIA (200): imports from Russia 540, 673, 147 and 0 kb/d in 2020–23, against refinery crude input of 14.2–16.4 mb/d | USA set to 0 under option A, like Korea and Japan; it was "OTHER" with a 2% high end. Under option B the pre-war share would be at most 4.4% |
| Buyers' 2026 quantities | Monthly customs via UN Comtrade (200): Chile, New Zealand, Philippines, South Africa and Fiji, 5–8 months each | Replaces "2025 × 8/12 × 1.31". Example: the Philippines bought USD 650 m of Chinese fuel in Jan–Jul 2026, against 1,697 m carried |
| Australia | Australian Petroleum Statistics (data.gov.au, CC BY 4.0, 200). Product imports by source country, monthly to August 2026 | The CREA-based values are replaced by a measured series, like r39's. It confirms CREA's level: about 1.27 bn of crude in 2025, against CREA's 1.6 bn of fuel made from Russian crude in Feb 2025–Jan 2026 |
| Cyprus and Malta | Eurostat `nrg_bal_c` and `nrg_ti_oil` (imports by country of last consignment); Comext imports and exports (200) | See the next section |

Unchanged from r39: China (customs, 15–19%), UAE, Brunei, Korea, Japan and Thailand. The hub pools (Singapore, Malaysia, Oman) are r39's, rescaled by the new shares of their origins.

## Cyprus and Malta: is the fuel used there?

**Cyprus mostly uses its fuel itself.**

- Imports are 2.3–2.5 Mtoe a year. Bunkers are 9–12% of that and inland use 88–93%; power alone takes about 1 Mtoe.
- Its own supply was consigned from Greece (0.9–1.0 Mt), Israel (0.7), Spain (0.5) and Italy. Türkiye supplied 44, 33 and 0 kt in 2022–24, and "not specified" 8, 5 and 37 kt.

**The fuel that widens Cyprus's range is not in that supply.**

- Comext QW imports (1.08 Mt in 2024, 1.58 Mt in 2025) and Comext's Turkish imports are missing from the energy statistics.
- Cyprus re-exported 1.47, 1.65 and 3.65 Mt of fuel in 2023–25, mainly to Libya, Lebanon, Egypt and Nigeria. This is storage and re-export, as at the Vasilikos terminal.
- So this fuel's Russian crude belongs to Cyprus's re-export customers, not to Cyprus.
- EPDK also records Turkish exports to "T.R.N.C." (northern Cyprus, 0.29 Mt in 2024). CREA's "Cyprus" may include northern ports.

**The new Cyprus series** is built from:

- fuel by consigning country, × that country's share, × crude content;
- plus laundered_r6's Greek resale of Turkish-port fuel (0.04–0.06 bn a year);
- at the high end only, the Turkish fuel that Comext records but the energy statistics do not, and half of CREA's 2026 cargoes.

Before the war, Greek, Italian, Belgian and Dutch refiners supplied about 0.10–0.14 bn a year of Russian crude in this fuel, close to the current EU-refiner route. Since the EU bans it is 0.05–0.06 bn. **The part changes sign**: from −0.19 bn (−0.97 to +0.23) to **+0.24 bn (+0.07 to +0.34)**.

**Malta's fuel is mostly sold as bunkers.**

- 80% of its oil is international maritime bunkers: the ratio of bunkers to imports was 0.80 in each of 2022, 2023 and 2024. This confirms `energy2.json`'s 0.81.
- Inland use is 17–20%.
- Türkiye consigned 60–73 kt a year. The `laundered_r6` cargoes imply about 0.2 Mt; the rest is ship-to-ship transfers off Malta.

The site keeps 59.5% in the middle case (`HUB_BUNKER_HALF_MID`, a judgement). Recomputed by consigning country, the part is +0.07 bn (−0.03 to +0.12). If only inland use is charged, as the method page says for bunkers, it is +0.02 (0.00 to +0.03). That choice is the owner's.

## Results: old against new range of the laundered part, and the chance

"Data" keeps r39's stacked ends, so only the inputs change. "Proposed" adds the quadrature combination. Chance means the chance of the more likely direction; ✔ means certain (at least 95%, middle value on that side, and no method alternative crosses).

| country | now: part, EUR bn | data (stacked) | proposed (quadrature) | width ×, proposed | net chance: now → data → proposed | Russia's-earnings chance: now → data → proposed |
|---|---|---|---|---|---|---|
| Cyprus | −0.19 (−0.97 to +0.23) | +0.24 (−0.04 to +0.40) | **+0.24 (+0.07 to +0.34)** | 0.22 | 94.5 → **99.9 ✔** → **100 ✔** | 63 → 94 → 95.8, vetoed by `refiner` |
| Malta (current bunker rule) | +0.03 (−0.11 to +0.17) | +0.07 (−0.06 to +0.13) | +0.07 (−0.03 to +0.12) | 0.53 | 92.7 → **96.3 ✔** → **97.4 ✔** | 68 → 78 → 81 (`refiner`) |
| Malta (inland use only) | | | +0.02 (0.00 to +0.03) | 0.10 | → 98.2 ✔ | → 76 |
| Philippines | +0.60 (−0.27 to +1.18) | +0.64 (−0.27 to +1.29) | +0.64 (−0.11 to +1.07) | 0.81 | 92.9 → 93.0 → **95.3 ✔** | 92.9 → 93.0 → 94.8 |
| Philippines, flat path | | | +0.04 (−0.31 to +0.44) | 0.52 | → 88.8 | → 85.8 |
| Papua New Guinea | −0.023 (−0.058 to +0.003) | −0.025 (−0.057 to +0.002) | −0.025 (−0.040 to −0.006) | 0.57 | 90.4 → 92.6 → **97.9 ✔** | 91.6 → 93.0 → **97.8 ✔** |
| Chile | +0.14 (−0.21 to +0.54) | +0.13 (+0.04 to +0.26) | +0.13 (+0.05 to +0.21) | 0.21 | 83.4 → **99.6 ✔** → **99.8 ✔** | 78.9 → **99.5 ✔** → **99.7 ✔** |
| Fiji | −0.015 (−0.034 to +0.000) | −0.018 (−0.036 to −0.002) | −0.018 (−0.027 to −0.005) | 0.64 | 95.0 ✔ → 97.3 ✔ → 99.2 ✔ | 94.8 → **96.9 ✔** → **99.2 ✔** |
| South Africa | −1.64 (−3.17 to −0.41) | −1.69 (−3.23 to −0.53) | −1.69 (−2.34 to −0.84) | 0.54 | 97.2 ✔ → 98.4 → 99.1 | 95.6 ✔ → 97.3 → 98.8 |
| New Zealand | −0.24 (−0.41 to −0.08) | −0.21 (−0.37 to −0.08) | −0.21 (−0.29 to −0.11) | 0.55 | 89.0 → 92.5 → **95.5 ✔** | 53.5 → 54 → 56 |
| Pakistan | +0.18 (−0.50 to +0.97) | +0.19 (−0.52 to +1.06) | +0.19 (−0.33 to +0.75) | 0.73 | 70.2 → 70 → 75.7 | 68 → 68 → 72 |
| Australia | −1.51 (−2.87 to −0.34) | −1.58 (−3.34 to −0.00) | −1.58 (−2.37 to −0.46) | 0.76 | 57 → 52 → 58 | 98.1 ✔ → **94.6** → 99.3 ✔ |

Three caveats:

- In the current site data, South Africa's Russian earnings show 95.6% and Fiji's net 95.0%; the blocker analysis used rounded values.
- The `refiner` alternative in `detail.json` still holds the old laundered series. Under that view the EU refiners keep their Russian crude, so Cyprus's and Malta's pre-war credit disappears. It would keep vetoing Cyprus's and Malta's Russian earnings unless `refiner` becomes a lens, as method_choices.md recommends.
- `laund_half` was recomputed from the new series. `laund_model` and `laund_route` still hold the old values.

## Who crosses the threshold

| | net | Russia's earnings |
|---|---|---|
| Data alone (stacked ends kept) | Chile, Cyprus, Malta (Fiji stays certain) | Chile, Fiji. Australia would drop to 94.6% |
| With quadrature (proposed) | Chile, Cyprus, Malta, Papua New Guinea, Philippines (95.3%, just), New Zealand | Chile, Fiji, Papua New Guinea. Australia, South Africa and New Zealand stay as they are; Cyprus is at 95.8% but vetoed by `refiner` |

Four countries do not cross:

- **Philippines on Russia's earnings** (94.8%).
- **Pakistan.**
- **Philippines with a flat expected path.** Its laundered credit comes almost entirely from the old China-route growth in `bmul`; with a flat path its net falls to 89%.
- **Cyprus and Malta on Russia's earnings**, while `refiner` vetoes.

## Proposed build changes

Exact field references are in `laundered_r43.json` under `proposed_build_changes`.

1. **B1, origin shares.**
   - What it replaces: in `laundered_r39.json`'s `origin_russian_share_used.A` (read by `_r39_share()` and `_r39_hub_mix()`):
     - `IND|2026` [0.30, 0.21, 0.40] becomes [0.39, 0.29, 0.47];
     - the IND bands for 2023–25 become ×0.85/1.25;
     - `TUR|2019–2026` take the EPDK values;
     - `EU|y` gives way to each member's Eurostat share;
     - `USA` becomes explicitly [0, 0, 0];
     - the hub pools are rescaled.
   - In `_r39_share()`, look up `USA` and the member codes before falling back to `EU`.
2. **B2, the measured buyers' levels** (PHL, PNG, CHL, NZL, PAK, ZAF, FJI). `apply_laundered_r39()` takes the levels from `laundered_r43.json` `buyers.<ISO>.russian_crude_in_fuel_levels`, keys unchanged. Base, refiner deductions and labels follow as now.
3. **B3, ranges in quadrature.** Combine quantity (customs ±8%, mirror ±20%), origin share and crude content per origin, then origins in quadrature. The stacked ends are kept as `low_stacked`/`high_stacked`. This is a method choice: `calc()` already does the same for each part's own terms.
4. **B4, Cyprus.**
   - Make it a measured buyer with `buyers.CYP`.
   - Drop laundered_eu's QW part and laundered_r6's direct Turkish-port part at Cyprus.
   - Add no EU-refiner route on top; the refiners' deduction follows the measured value.
   - The QW and Turkish-port fuel then belongs to Cyprus's re-export customers. That assignment is not computed here.
5. **B5, Malta.**
   - Levels from `buyers.MLT`, then the bunker rule as now.
   - Owner option: set `HUB_BUNKER_HALF_MID['MLT']` to the measured bunker share of 0.80 (0.74–0.82), so that only inland use is charged.
6. **B6, Australia.**
   - `buyers.AUS` (APS) replaces `replacement_for_laundered_eu_non_eu_AUS` and laundered_eu's non-EU AUS values.
   - Keep `bmul`.
   - Brunei's deduction should follow the BRN part.
7. **B7, the expected path of the measured buyers** (owner). `apply_laundered_r39()` copies the old routes' `bmul` into the measured buyers, while its docstring says their pre-war level is flat. The choice decides the Philippines and Pakistan.
8. **B8 (optional).** For measured series set `pidx_lo = pidx_hi = pidx`, because the crude-content band already carries the Urals price. The effect is small.

These changes also affect other buyers through the shared inputs:

- **The higher India share for 2026** raises 2026 for Nepal, Sri Lanka, Bangladesh, Mauritius, Tanzania and Kenya.
- **The member-specific EU shares** lower the pre-war base for buyers of Italian, Spanish and Greek fuel.
- **EPDK's 2019 share for Türkiye** raises the pre-war base for buyers of Turkish fuel.

## Wired in (round 43 build)

These decisions were taken:

- **B3, ranges.** Quantity and origin share are combined in quadrature. Crude content is added across origins, because all refiners share it (the Urals price and refining margins).
- **B7, expected path.** It is flat for the measured buyers, as round 39 documented. This is a bug fix: the code had copied the old routes' `bmul`.
- **B5, Malta.** The bunker rule and the cap are kept. They now apply to its measured levels and to its pre-war level.
- **B8, price band.** The Urals band is dropped for measured series.
- **B1, B2, B4, B6** are done as proposed. Australia's expected path is flat too, like the other measured buyers, not its old `bmul`.
- **Method band.** `refiner`, `laund_half` and the other alternatives are rebuilt from the new data. `laund_model` remains the old model, by definition.

All 24 measured buyers (the 21 of round 39 plus Cyprus, Malta and Australia) use `measured_buyers`. Their levels were recomputed with the new shares and range rule.

Built values (`site/data.json`, 2026). "Part" is the laundered part in EUR bn; net and Russia's earnings are in % of GDP, with the chance and the group.

| | laundered part, before | after | net, before | after | Russia's earnings, before | after |
|---|---|---|---|---|---|---|
| Cyprus | −0.190 (−0.974 to +0.235) | **+0.222 (+0.044 to +0.308)** | +2.14, 94.5% leaning Ukraine | +3.42, 99.9% **certain** | +0.20, 63% uncertain | +1.48, 95.1% **certain** |
| Malta | +0.028 (−0.114 to +0.169) | +0.042 (−0.088 to +0.196) | +0.90, 92.7% leaning | +0.97, 94.8% leaning | +0.28, 68% leaning | +0.35, 72% leaning (`refiner` crosses) |
| Philippines | +0.599 (−0.269 to +1.181) | **+0.037 (−0.266 to +0.297)** | +0.26, 92.9% leaning Ukraine | +0.12, 89.8% near zero | +0.26, 92.9% leaning | +0.12, 87.3% near zero |
| Papua New Guinea | −0.023 (−0.058 to +0.003) | −0.025 (−0.040 to −0.010) | −0.07, 90.4% near zero | −0.08, 99.8% **certain** Russia | −0.07, 91.6% near zero | −0.08, 99.8% **certain** |
| Chile | +0.136 (−0.209 to +0.542) | +0.089 (+0.053 to +0.146) | +0.04, 83.4% near zero | +0.03, 100% **certain** Ukraine | +0.04, 78.9% near zero | +0.03, 100% **certain** |
| Fiji | −0.015 (−0.034 to +0.000) | −0.018 (−0.028 to −0.008) | −0.30, 95.0% certain | −0.35, 99.9% certain | −0.30, 94.8% leaning | −0.35, 99.9% **certain** |
| South Africa | −1.641 (−3.165 to −0.412) | −1.742 (−2.407 to −1.075) | −0.45, 97.2% certain | −0.48, 99.3% certain | −0.45, 95.6% certain | −0.48, 99.3% certain |
| New Zealand | −0.237 (−0.411 to −0.082) | −0.204 (−0.278 to −0.124) | +0.04, 89.0% near zero | +0.05, 95.9% **certain** Ukraine | −0.01, 53.5% near zero | +0.00, 55.5% near zero |
| Pakistan | +0.184 (−0.495 to +0.974) | −0.064 (−0.327 to +0.322) | +0.02, 70.2% near zero (Ukraine side) | −0.05, 60.1% near zero (Russia side) | +0.02, 68% near zero | −0.05, 62% near zero |
| Australia | −1.511 (−2.872 to −0.339) | −2.021 (−2.825 to −1.129) | −0.01, 57% near zero | −0.04, 73% near zero | −0.09, 98.1% certain | −0.12, 100% certain |

**Philippines and Pakistan.** With the expected level flat, almost all of the Philippines' laundered credit goes: +0.04 bn instead of +0.60. Its net falls from 0.26% (92.9%, leaning Ukraine) to 0.12% (89.8%, near zero). Pakistan's part changes sign, to −0.06 bn, and its net moves to the Russia side, still near zero. Their credit came from the old China-route growth (×1.25–1.8 by 2026), not from anything measured for them.

**Malta.** It stays leaning, at 94.8% on the net. Under the kept bunker rule its high end charges all of its bunkers (base range up to 0.075), and the cap holds its middle values for 2021–22 at 0.035.

**Other buyers that moved:**

- **Through the flat path and India's 2026 share:**
  - Maldives: net from 83.4% leaning to 99.6% certain Russia.
  - Solomon Islands and Tonga: from leaning to certain Russia.
  - Samoa: 98.2%, still leaning, because `laund_model` crosses.
  - Bangladesh: from near zero on the Ukraine side to near zero on the Russia side (−0.01%).
  - Nepal: −2.25 → −2.45%. Tanzania: −1.04 → −1.12%. Mozambique: −1.04 → −1.18%. Kenya: 81.5 → 87.6%. Cameroon: 86 → 92%. All these keep their groups.
  - Vanuatu: −0.79 → −0.73%.
- **Refiners, through their deductions** (no group changes):
  - India: −2.17 → −2.15%; it is relieved more, mostly through the higher 2026 share.
  - China: −0.12 bn net.
  - Türkiye: −2.95 → −3.00%. It gets back the Turkish-port fuel no longer charged to Cyprus and Malta, which was re-exported or not used there.
  - Brunei: +2.44 → +3.09%, 85% leaning Ukraine. Australia's own statistics show more Hengyi fuel than laundered_r6 did, so Brunei passes on more.
  - EU refiners shifted by their own Eurostat shares: Netherlands −0.03, Lithuania +0.03, Finland −0.01, Romania +0.01, Germany −0.02 bn, France −0.02 bn, Poland, Hungary.
- **Counts:** among economies of at least EUR 5bn GDP, numbers whose direction is not certain fell from 108 to 103 on Russia's earnings and from 100 to 95 on the net (`overview.md` figures refreshed).

## What is estimated

- Malta's and Cyprus's 2025 tonnes by consigning country are 2024's (Eurostat ends there), at 2025 Comext unit values. 2026 is 2025 × 8/12 × 1.31.
- Israel's refiners: share 0, up to 5% at the high end. Caspian (KZ, TM, AZ) fuel shipped via Russian ports: 0, up to 10% at the high end. Georgian consignments: 30% (10–75%).
- Comtrade monthly data were scaled to 8 months: South Africa from 5 months, the Philippines and Fiji from 7.
- The KSE refinery-route band for India comes from three quarterly snapshots.
- China's exporting refiners (the quota holders) may run less Russian crude than the national average, which would be a lower share. No public annual figure was found, so ±20% stays.
- The Philippines' and Pakistan's 2026 Chinese and UAE volumes. Pakistan's monthly customs reach only January.

## Open questions

- Owner, B7: should the measured buyers' expected path be flat?
- Owner, B5: bunkers to no country, or half?
- Owner: `refiner` as lens or veto (method_choices.md).
- Where Cyprus's re-exported fuel goes: Libya and Lebanon by Comext. Assigning it needs a hub resale share for Cyprus.
- Kpler annual shares per refinery for Jamnagar and Vadinar in 2023–24, which would narrow India's route band. Only quarterly KSE figures and press figures were found.
