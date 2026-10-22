# Leaning toward Ukraine or Russia, or uncertain direction (round 24b)

The rule is in `site/index.html` (`leanInfo()`, `leaning()`, `pSameSign()`); the browser and Node agree on it (`pipeline/browser_check.mjs`, check 32).

**Decision (the owner, 22 October 2026, replacing the research proposal below):** "things like this should just be leaning ... the range does cross zero, but it's very unlikely that it will be zero ... unless it's smack dab in the middle, you can say uncertain". A number whose likely range or a method-band alternative crosses zero is **leaning toward Ukraine / Russia** when the chance of its middle value's sign is **at least 65%** under a two-piece normal on the likely range (mode = the middle value, the range ends the 5th and 95th percentiles); below that its direction is **uncertain**. The research's other two conditions (|middle| ≥ 0.25% of GDP, ≥ 75% of method-band alternatives agreeing) are dropped for the label; the share of alternatives that agree is shown in the panel's explanation. "Too close to call" is retired. Neither leaning nor uncertain numbers are ranked; both are listed under the ranking. **Belarus**, a party to the war (the owner, same day), is in neither list.

The research note follows (its 0.80 threshold and the lists it gives are the proposal, not the rule).


Data: `t7_leaning.json`. Model run: `scripts/run_model.js` executes the site's own Model section (`calc`, `methodBands`, `uncertain`) on `site/data.json` + `detail.json` alternatives for 2022 – Aug 2026, giving `_model_full.json`. Metrics come from `scripts/t7_leaning.py`. Research only; label and list only, no number changes.

## Universe
- Economies with GDP ≥ €5bn (`MIN_GDP_RANK`) whose direction is **uncertain** today (`uncertain()`: the likely range or any method-band alternative has the other sign or is zero).
- Belarus is left out (proposed as a party to the war, audit H3).
- Counts today: net 113, support 58, business with Russia 121.

## Proposed rule (objective)
A country is **"leaning toward Ukraine/Russia"** on a lens when all three hold:
1. **p_same ≥ 0.80.** This is the probability that the true value has the central's sign. It is computed from the likely range as a two-piece normal: mode = central, 5th percentile = low, 95th = high, σ_lo = (v − lo)/1.645, σ_hi = (hi − v)/1.645.
   - For v < 0: P(x<0) = w_l + 2·w_h·(Φ(−v/σ_hi) − 0.5), where w = σ/(σ_lo+σ_hi). Mirror the formula for v > 0.
   - 0.80 corresponds to roughly **75% of the likely range's width on the central's side** (the owner's suggested test), which is in the JSON as `range_share_same`.
2. **|central| ≥ 0.25% of GDP**, so near-zero noise is not labelled.
3. **≥ 75% of the method-band alternatives** have the central's sign.

Leaning countries stay **unranked**. They get a faded colour (as now) plus a sentence: "Leans toward Russia: −2.9% of GDP, about 9 in 10 chance of this direction, but the likely range reaches +0.3".

Optional second tier, **"slightly leaning"**: p_same ≥ 0.60, |central| ≥ 0.5%, and *every* method alternative has the sign.

## Results (2022 – Aug 2026, % of one year's GDP)

### Net (20 leaning: 10 toward Russia, 10 toward Ukraine)
| | country | central [likely range] | p_same | alternatives same sign |
|---|---|---|---|---|
| ← Russia | Kyrgyzstan | −6.75 [−15.7, +3.8] | 0.84 | 100% |
| | **Türkiye** | −2.85 [−5.4, +0.3] | 0.92 | 100% |
| | North Macedonia | −1.71 [−3.3, +0.8] | 0.84 | 93% |
| | Nepal | −1.67 [−3.0, −0.85] (band only) | 1.00 | 92% |
| | **Hong Kong** | −1.59 [−3.7, +0.1] | 0.95 | 100% |
| | **UAE** | −0.83 [−2.1, +0.2] | 0.92 | 100% |
| | Egypt | −0.42 | 0.94 | 100% |
| | Mauritius | −0.35 (band only) | 1.00 | 93% |
| | South Africa | −0.32 | 0.93 | 100% |
| | Kenya | −0.31 | 0.81 | 100% |
| → Ukraine | Ecuador, Angola, Rwanda | +0.26 to +0.28 | 0.92–0.97 | 100% |
| | Slovenia | +0.58 [−0.3, +3.6] | 0.94 | 100% |
| | Malta | +0.82 | 0.91 | 100% |
| | Turkmenistan | +1.54 | 0.92 | 100% |
| | **Czechia** | +1.57 [−0.9, +4.3] | 0.85 | 100% |
| | Montenegro | +2.48 | 0.98 | 100% |
| | Lebanon | +2.80 | 0.92 | 100% |
| | Bulgaria | +2.91 [−0.7, +7.6] | 0.92 | 100% |

Slightly leaning: Mongolia −5.5, Georgia −3.4, Burkina Faso −2.7, Senegal −2.4, Mozambique −2.2, Cyprus +0.9, Brunei +2.4.

**Not leaning:**
- Serbia (p 0.72), Iran (central only −0.05), Kazakhstan (0.60), Armenia (0.43), Slovakia (0.53), Austria (0.66).
- Georgia and Mongolia fail on p_same, because their hub and fuel bands are wide (audit H3's random-walk issue). They would probably qualify once that is fixed.

### Business with Russia (20 leaning: 9 toward Russia, 11 toward Ukraine)
- **Toward Russia:** Kyrgyzstan, Türkiye, Nepal, Hong Kong, UAE, Egypt, Mauritius, South Africa, Kenya.
- **Toward Ukraine** (reduced business): Ecuador, Angola, Rwanda, Spain +0.39, Nigeria +0.44, Croatia +0.56, Belgium +0.62, **Italy +0.92**, Turkmenistan, Bulgaria +2.48, Lebanon.
- **Slightly leaning:** Mongolia, Georgia, Burkina Faso, Senegal, Mozambique, Czechia +1.13, Brunei.

### Support for Ukraine (1 leaning)
Georgia +0.26 (p 0.98). Support is rarely uncertain with a sizeable central.

## Expected effect
- About 20 countries per lens gain a "leaning" label. The ranking itself does not change.
- This answers the audit's point that Türkiye, the UAE and Hong Kong were invisible.
- Belarus would show as a party to the war (topic H3), not as leaning.

## Confidence
- **Rule:** high, because it is mechanical and reproducible from the build.
- **The two-piece normal:** an approximation. The model's range is a quadrature combination, not a full distribution.

## Open questions
1. Thresholds: 0.80 / 0.25% / 75%, or stricter (0.85, as in the JSON's sensitivity: 17 net leaning)?
2. Show the "slightly leaning" tier, or keep one tier only?
3. Countries that are uncertain only through the method band (Nepal, Mauritius): label them as leaning, or "depends on a method choice"?
4. Generate the counts in the build (audit H4/L4) so the text does not drift.
