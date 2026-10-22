# War-time fuel prices: the no-war price band on its own line, and an early-2021 alternative (round 24b)

Data: [`windfall_band_r24.json`](windfall_band_r24.json); the band move is in `site/index.html` `calc()` (the no-war price term `t.nr` now widens the war-time price line, not the paid line); the alternative is `build_data.py` `METHOD_ALTERNATIVES` "gas_early2021" in `nw()`.

**Decision (the owner, 22 October 2026, audit 24 D M2):** (a) and (b) below, as a method-band alternative, not the central value; (c) the overview's step 1 reworded.

Data: `t5_windfall_range.json`. Script: `scripts/t5_windfall_paths.py`. Inputs: `research/2026-10/gaps/energy_nowar.json` (`nowar_index`, `contract_prices`) and `site/data.json` (`windfall`). Research only.

## What the model does now (read before changing anything)
- **The windfall line's own range covers only the actual-price uncertainty.** Hungary: −€9.93bn [−10.70, −9.12], i.e. ±8%.
- **The no-war price uncertainty is already in the model, but in another line.** It is carried once, on the expected path of the `paid` part: `build_data.py` `war_windfall()` comment, "carried once, on the expected path (apply_nowar_prices) ... it cancels"; in `calc()` it is the `t.nr` term in `spread()`. The bands are Oct-2021 forecasts (low) to Feb-2022 futures (high).
- So the **business total** includes the no-war price uncertainty (Hungary's `paid` is −0.52 [−4.38, +4.12]), but the **windfall line does not show it**.
- The audit's "±8%" is therefore mostly a presentation gap. The real gaps are two:
  1. the windfall line misleads on its own;
  2. there is no path for the view that the late-2021 gas squeeze was already Russia's war preparation. That question was left open in `energy_nowar-notes.md`, decision 3.

## Alternative no-war TTF paths (EUR/MWh, 2022 / 2023 / 2024 / 2025)
| path | values | evidence |
|---|---|---|
| Feb-2022 futures (existing high) | 80 / 56 / 38 / 31 | ICE settlements mid-Feb 2022; contains a war-risk premium (ENGIE, 31 Jan 2022), so this is an upper bound for the no-war price |
| Jan-2022 central (existing) | 59.4 / 37.1 / 30.0 / 26.5 | IMF WEO Update (25 Jan 2022) futures, EIA STEO Jan 2022, ECB Dec 2021 |
| Oct-2021 forecasts (existing low) | 38 / 27.8 / 25 / 22 | World Bank CMO (21 Oct 2021), IMF WEO Oct 2021 |
| **Pre-squeeze forwards (new)** | 17.5 flat | TTF Cal-22 traded €16.7–18.1 in Jan–Mar 2021, before Gazprom held back supply ([Enel Global Trading forward updates](https://k4viewnews-globaltrading-qual.enel.com/spanish-forward-gas-update-21-01-2021): 22 Jan 16.68, 5 Feb 17.08, 12 Feb 16.90, 24 Feb 16.75, 12 Mar 18.11). Later calendar years are not found, so the flat path is judged |
| 2019–21 average (pre-round-7 rule) | 23.13 | `energy_nowar.json` base |

**Why the pre-squeeze path is defensible.** In January 2022 the IEA said there were "strong elements of tightness in the European gas market due to Russia's behaviour". It said Russia could deliver at least a third more, and that the EU storage deficit was "largely due to Gazprom" ([Bloomberg, 12 Jan 2022](https://www.bloomberg.com/news/articles/2022-01-12/iea-blames-russia-for-gas-squeeze-hurting-european-economies); [IEA key statements](https://www.iea.org/news/iea-key-statements-and-communications-on-the-natural-gas-crisis-in-europe); [PGJ](https://pgjonline.com/news/2022/january/russia-undermining-european-gas-supply-amid-ukraine-standoff-iea-says)). Gazprom cut Q4 2021 exports to Europe by 25% year on year.

## Windfall by path (EUR bn, counted, 2022 – Aug 2026; 2026 unchanged, since its no-war price equals the actual price by decision)
| country | now [range] | Feb-22 futures | central | Oct-21 forecasts | pre-squeeze | proposed likely range | pre-squeeze, as points of GDP on business |
|---|---|---|---|---|---|---|---|
| Hungary | 9.93 [9.12, 10.70] | 0.60 | 9.91 | 16.10 | 22.75 | **0.6 – 16.2** | −5.2 → −12.0 |
| Türkiye | 20.50 [6.6, 29.6] | 5.95 | 20.49 | 30.97 | 41.54 | 0.4 – 34.4 | −1.9 → −3.9 |
| Germany | 16.49 [10.1, 24.3] | 11.56 | 16.47 | 21.58 | 26.47 | 8.4 – 25.8 | windfall −0.39 → −0.63; total ≈ −1.0 (see below) |
| Italy | 8.18 [6.9, 9.3] | 2.41 | 8.18 | 12.36 | 16.83 | 2.3 – 12.5 | −0.39 → −0.80 |
| Czechia | 5.10 [4.1, 6.4] | −0.70 | 5.11 | 8.80 | 12.97 | −0.8 – 9.0 | −1.65 → −4.20 |
| Austria | 4.20 [2.7, 5.6] | −1.12 | 4.19 | 7.45 | 11.12 | −1.3 – 7.8 | −0.89 → −2.35 |
| Slovakia | 2.54 [0.8, 3.7] | −0.26 | 2.54 | 4.35 | 6.43 | −0.8 – 4.7 | −2.10 → −5.30 |
| Serbia (oil-indexed) | 1.01 [0.7, 1.3] | 0.52 | 1.01 | 1.39 | 1.39 | 0.4 – 1.5 | −1.37 → −1.88 |
| North Macedonia | 0.35 | 0.01 | 0.35 | 0.58 | 0.77 | 0.0 – 0.6 | −2.4 → −5.3 |
| Moldova | 0.38 | 0.17 | 0.38 | 0.55 | 0.69 | −0.1 – 0.6 | −2.5 → −4.5 |
| Greece | 2.43 | 1.44 | 2.43 | 3.27 | 3.99 | 0.1 – 4.0 | −1.1 → −1.8 |

- **Method.** The gas part of each year's counted windfall is rescaled by (p − n′)/(p − n_c). p and n_c are the country's actual and central no-war contract prices (`contract_prices`). n′ is the contract formula (TTF and oil weights) evaluated on the alternative path. The central path reproduces the model (Hungary 9.91 vs 9.93).
- **China, Poland and Finland.** Their wide current ranges come from oil and price data, not the gas path.

## Proposal (exact)
1. **Show the no-war uncertainty on the windfall line.**
   - Move the `t.nr` term (expected volume × no-war price band) from `paid` to `windfall` in `calc()`. The windfall's range then becomes the actual-price band ⊕ the no-war band. The quadrature result is in the JSON as `proposed_likely_range_eur_bn`; Hungary becomes **0.6 – 16.2**, i.e. −5.2% of GDP [−8.5, −0.3].
   - `paid` keeps its other range terms.
   - Totals barely move, because the term is moved, not added. The only differences come through RHO pairs involving `paid` (paid|laund 0.5, etc.).
   - The builder can compute the windfall lo/hi with `band_nw` high/low (`war_windfall()` already has the argument) and drop `nr` from `paid`.
2. **Add a method-band alternative "no-war gas at pre-squeeze forwards (€17.5/MWh)".** This view treats the 2021 squeeze as part of the war.
   - It must move both the windfall and the volume part (identity: business total change = −E × Δn).
   - It is a band alternative, not the central.
3. **Reword overview step 1** as the audit suggests: "...has shifted nothing in volume; the higher price it paid is counted separately as Russia's windfall".

## Effect
- **Likely ranges (proposal 1):** Hungary's windfall range widens about 10×; its business total range barely changes.
- **Method band (proposal 2):**
  - Hungary's band reaches about −12.9% on business. It is still toward Russia, so no change of status.
  - Slovakia's business band reaches about −3.7%, which adds to its already uncertain status.
  - **Czechia's net could cross zero** in that alternative: about 1.57 − 2.55 points from the windfall alone, and less again once the volume part is included. Czechia is already uncertain.
  - Austria's net band moves further negative.
  - Germany: business about 1.57 → ≈0.5–0.6 in that alternative. That is a rough total-effect estimate, E ≈ 50 bcm/yr × Δn, about €44bn over 2022–25; not computed in the model.
- **Status changes:** no country changes ranked status unless the leaning rule (topic 7) uses the method band. Czechia, Slovakia and Austria are already uncertain.

## Confidence
- **Paths:** high for the existing three, which are pre-war documents. The pre-squeeze path is medium: 2022 is evidenced, 2023–25 are judged flat.
- **Per-country scaling:** medium. It is linear in the contract formula and ignores the volume response.

## Open questions
1. Is the pre-squeeze path acceptable as a method-band alternative, given that it implies the war began economically in mid-2021?
2. Should the Feb-2022 futures stay the high end of n? They hold a war-risk premium; the owner might prefer the Jan-2022 futures as the high end, which would narrow the range on the "small windfall" side.
3. The pre-squeeze path for 2023–2025 needs the 2021 forward curve for Cal-23/24/25 (ICE end-of-day data, not found free).
