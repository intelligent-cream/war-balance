# Business with Russia in two lines (round 24b)

Implemented in `site/index.html` `calc()` (`LINE_EARNED`, `rusPaid`, `rusEarned`) and `build_data.py` `apply_military_payment()` (`military_rus.years_paid`). **Decision (the owner, 22 October 2026, audit 24 D M1):** two display lines under business with Russia, "Paid Russia less / more by" and "Earned less / more from Russia by"; the total, its range, the colours, the map and the ranking are unchanged; weapons sent to Russia split by their paid share. The research note follows.


Data: `t2_business_split.json` (assignment, labels, and per-country split for 44 economies). Script: `scripts/t2_split.py`, run on the baseline model output (`_baseline_headline.json` from `audit_tmp/calc.js`). Research only.

## How the model builds the number today (`site/index.html`, `calc()`)
- `rusBal` is `total(live(shiftParts.filter(RUS_PART)))`.
- `RUS_PART` is every shift part that is not in `UA_PARTS` (aid, euaid, ref, buy, undisc, priv, multilat) and not in `OWN_LINE` (frozen).
- The keys present across the 231 entries, with how many entries carry each: paid 226, laund 214, sold 201, svcpaid 197, windfall 194, svcsold 194, tax 104, ship 45, rusarms 37, rusfirms 29, agents 12, hidden 10, statefin 10, mil 4.
- `VERBS.rus` (≈ line 2500) is "Reduced / Increased business with Russia by {x}".
- The ranking list is titled "Russia's gain from this country rose" (lines 2794, 3630, 3667).

## Proposed assignment (exact)
| line | keys | why |
|---|---|---|
| **A: Paid Russia less / more** | `paid`, `windfall`, `laund`, `svcpaid`, `tax`, `rusfirms`, `rusarms`, `statefin`, `hidden` | Money reaching Russia, counted at **Russia's** net gain (`net_gain_russia.json`), or rent paid to the Russian state (taxes, profits sent home, gold). |
| **B: Earned less / more from Russia** | `sold`, `svcsold`, `ship`, `agents` | The country's **own** gain on selling to Russia, at the seller's net gain × genuinely extra (`net_gain_sellers.json`, `vk`). |
| `mil` (weapons and troops sent to Russia) | recommended: split in the build into `milgift` → A and `milsold` → B | Under `military_payment_r13`, unpaid deliveries count at full value (Russia's gain) and paid ones at the seller's gain. At today's central paid shares: North Korea, Iran and China go to B, Belarus to A. Fallback: all of `mil` in A, with the tooltip "incl. weapons and troops sent". |

**Verbs.** These follow the round-22 style (`VERBS`): the verb carries the sign and the amount has none.
- `rusA: ["Paid Russia less by {x}", "Paid Russia more by {x}"]`
- `rusB: ["Earned less from Russia by {x}", "Earned more from Russia by {x}"]`
- I prefer "Earned … from Russia" to "Sold Russia …" for B, because B also holds shipping and insuring Russian oil and payment agents' fees, which are services *for* Russia's trade rather than sales *to* Russia. If the owner wants strict parallelism, use "Sold Russia less / more by {x}" and put "(goods, services, shipping)" in the tooltip.
- The parent line keeps its verb, "Reduced / Increased business with Russia by {x}". The two new lines sit under it, like the support line's parts.

**What stays the same.**
- `rusBal`, its range, `uncertain()`, the payments map, the ranking order and the net are all computed exactly as now, from all `RUS_PART` parts together, including the cross-line correlations (paid|sold 0.2, paid|svcsold 0.15, sold|svcpaid 0.2, svcpaid|svcsold 0.4).
- The two lines are **display subtotals**. Each is `total()` over its own keys and carries its own likely range. Their centrals add exactly to `rusBal`; their ranges do not add up, and the tooltip should say so.
- **Colours:** both lines keep the business convention. Positive (paid less / earned less) takes the Ukraine colour; negative takes the Russia colour. "Earned more from Russia" therefore stays orange: it is business with Russia that rose, and the words now say whose gain it is.
- **Ranking title:** replace "Russia's gain from this country rose" with **"Business with Russia rose"** and the subtitle "paid Russia more, or earned more from Russia". The cause text (`CAUSE`) prefixes the line the main part belongs to. This fixes the audit's wrong-label point for B.

## Effect: the split for the main countries (% of one year's GDP, 2022 – Aug 2026; central [likely range])
| | business now | A: paid Russia | B: earned from Russia | mil |
|---|---|---|---|---|
| Germany | +1.57 | +1.55 [+0.51, +2.82] | +0.03 | – |
| Poland | +3.03 | +2.91 | +0.13 | – |
| Netherlands | +2.85 | +2.77 | +0.08 | – |
| Lithuania | +9.89 | +9.65 | +0.24 | – |
| Finland | +5.99 | +5.91 | +0.08 | – |
| Hungary | −6.14 | −6.15 [−8.35, −3.70] | +0.004 | – |
| Türkiye | −2.85 | −2.81 [−5.30, +0.33] | −0.045 [−0.15, +0.02] | – |
| China | −0.62 | −0.59 | −0.022 | −0.00 |
| India | −2.21 | −2.21 | −0.004 | – |
| UAE | −0.84 | −0.81 | −0.03 | – |
| Kyrgyzstan | −6.75 | −5.75 [−14.0, +4.6] | **−1.00** [−3.4, −0.26] | – |
| Armenia | +0.14 | +0.76 | **−0.61** | – |
| Georgia | −3.65 | −3.34 | **−0.31** | – |
| Kazakhstan | +0.29 | +0.35 | −0.07 | – |
| Greece | −0.75 | −0.11 | **−0.64** (shipping) | – |
| Cyprus | −0.03 | −0.30 | **+0.27** | – |
| Belarus | −2.78 | −0.23 | −0.73 | −1.82 (unpaid → A) |
| North Korea | −10.28 | −0.07 | 0.00 | −10.21 (paid → B) |

**Reading.**
- For almost every Western country, B is under 0.25 points, so the split changes nothing they say.
- B matters for the hubs and transit economies (Kyrgyzstan, Armenia, Georgia, Kazakhstan), for Greece (shipping) and Cyprus. For them the text becomes accurate: Greece "earned more from Russia (shipping) by 0.64% of GDP" rather than "Russia's gain rose".
- North Korea's number becomes "Earned more from Russia by 10.2%" (it sold shells) if `mil` is split; Belarus's arms are "Paid/gave Russia more".
- **Net and colours:** unchanged for all.

## Confidence
High: this is presentation only, and the arithmetic is unchanged.

## Open questions
1. "Earned … from Russia" or "Sold Russia …" for line B?
2. Split `mil` in the build (recommended), or keep it whole in A?
3. Should the payments-lens ranking list B leaders separately (e.g. "Earned most from Russia": Kyrgyzstan, Belarus, Greece, Armenia)? It would be a new list, with no change to the existing ones.
