# Round 60: the seller's gain on weapons sold to Russia

Gathered on 2026-10-29. Output: [`arms_margin_r60.json`](arms_margin_r60.json), built by
`scripts/arms_margin_r60.py` (`python -I ... extract <dir>`, then `build`). Extracts of the pages used are in
`raw/arms_margin_r60/` (URL and retrieval date at the top of each). **Applied in round 60**: `apply_military_payment()` in `pipeline/build_data.py` reads `countries.<IRN|PRK>.gain_proposed`, with genuinely extra 0.9 (0.8-1.0) for these sales (the round-60 choice, the "extra_09" scenario below).

## The current method

`pipeline/build_data.py`, `apply_military_payment()` (round 13, `military_payment_r13.json`):

    counted = value × (paid × gain × extra + (1 − paid));   troops' pay counts in full

- **gain**: `net_gain_sellers.json` `oecd_median.weapons` = 0.051 (0.027–0.100). This is the excess profit plus taxes
  of OECD arms makers (STAN C252/C303/C304/C26), measured above a normal return. Every Iranian item and North Korea's
  missiles take this rate.
- **North Korea's shells and artillery** are "stock". Half (0.3–0.6) is outdated stock at a gain of 0.9 (0.7–1.0),
  and the rest is at 0.051. The blended rate is 0.476 (0.229–0.640).
- **extra**: `value_kept.json` `flowback_weapons.extra` = 0.4 / 0.6 / 0.8. That is the default, whose stated reason is
  "war-driven capacity growth in Western defence industry".
- **paid**: 1.0 (0.8–1.0) for Iran, North Korea and China, and 0 (0–0.5) for Belarus.

The script reproduces the site exactly. **Iran**: €3.53bn delivered, €0.108bn counted (0.051 × 0.6 = 3.06%).
**North Korea**: €10.0bn delivered (troops €0.88bn), €3.33bn counted.

## Why 0.051 is the wrong rate for Iran and North Korea

The OECD rate describes a Western firm that sells at a competitive price to many buyers, and whose excess profit is
small. The sales to Russia are different. The seller is a state monopoly, there is one buyer with few alternatives,
and the price was set by bargaining far above the cost of production. The rate also ignores a sale that is mostly a
licence: copying a design costs Iran almost nothing. The **same concept** (price minus the seller's full cost
including a normal return, as a share of the price) applied to the price and cost evidence gives much higher rates.

## Evidence

| item | price | seller's cost | source |
|---|---|---|---|
| Alabuga contract (licence, technology, equipment, software, 6,000 units) | USD 1.75bn in total. The per-unit "licensing and component fee" was USD 193k for 6,000 units (290k for 2,000; first ask 375k) | "six times the previously estimated cost of the drone"; "around 10 percent of components coming from abroad". The plan was full localisation with minimal Iranian components, at a Russian unit cost of USD 48.8k. The all-in programme cost was about USD 165.5k per unit, so "just under USD 1bn" | Defense One and TWZ (Prana leak via Militarnyi), extracts `defone.txt`, `twz.txt`, `militarnyi.txt` |
| Shahed-136 made in Iran | USD 150k in the model (50–290k) | about USD 50k is "quite realistic" (TWZ). The engine alone (MD-550, a copy of the L-550) costs USD 12–17k, and the Chinese version is offered at 13.6k. Earlier USD 20k estimates were "significantly off the mark" | TWZ |
| Iranian ballistic and air-defence missiles | about USD 2.7bn of contracts (Bloomberg, round 13) | none public (Fath-360, Fateh-110) | breakingdefense page did not download (403) |
| North Korean shells | model USD 400 / 800 / 1,100 per round (Russian procurement about 1,200–1,300) | not known. Price estimates for North Korean rounds start at USD 300 (152mm) and 150 (122mm) (Guseinova, low case) | `kyivpost.txt` |
| a Western ammunition maker in a seller's market | — | Rheinmetall Weapon & Ammunition operating margin 28.4% (2024), about 29% (2025) | `rhm.txt` |

**Payment.** C4ADS (via StateWatch) found that at least 1.79 t of gold (about USD 104m, at USD 58.32/g) was delivered
in March 2023 and a further 2+ t was agreed in April 2023. There were also dirham payments to a Dubai account, and
crypto is possible (`statewatch.txt`). TWZ: "more than two million grams of gold". The payments documented so far
(about USD 0.1–0.25bn) are well below the contract. The paid share is **not** changed here. Lowering it would make Iran
count *more* toward Russia, because the unpaid share counts at full value.

**North Korea.** FNF ("Unequal Partnership", via Al Jazeera, `aljaz.txt`) puts deliveries at up to USD 9.8bn and
Pyongyang's gains at only USD 0.46–1.19bn. Taken literally, that is a gain of 5–12%. It is really a statement about
**payment**: little cash or goods were seen flowing back, while INSS says 80–96% of Russia's compensation was
technology. The site already handles it as the `nk_paid_observed` method band (round 24b), so it is not used as a gain
rate here.

## Proposed rates (gain per euro delivered, before × extra)

| supplier, item | low | central | high | basis |
|---|---:|---:|---:|---|
| Iran: Alabuga licence/kits contract | 0.60 | **0.80** | 0.90 | mostly technology transfer and fees on parts made in Russia. Iran's own costs (early kits, engines, equipment, engineers) are judged at USD 0.2–0.6bn of 1.75bn |
| Iran: drones delivered 2022–23 | 0.45 | **0.70** | 0.85 | cost about USD 50k (up to 80k with sanctions premiums) against a price of 150–193k |
| Iran: missiles (ballistic, SAM) | 0.15 | **0.35** | 0.60 | no cost data. The floor is a normal defence operating margin. The centre is above Rheinmetall's 28–29%, for a monopoly selling to a cornered buyer |
| Iran: ammunition | 0.15 | **0.35** | 0.60 | as missiles |
| North Korea: shells and artillery systems | 0.32 | **0.63** | 0.84 | outdated half unchanged (0.9). The rest goes from 0.051 to 0.35 (0.15–0.60): a state monopoly with near-zero wages, valued at Russian prices (cost 250–500 on 800 gives 0.4–0.7, set lower for scarce imported inputs and replacement) |
| North Korea: KN-23/24 missiles | 0.15 | **0.35** | 0.60 | as Iran's missiles |
| North Korea: troops | in full | | | unchanged |
| Belarus | — | — | — | unchanged. Paid share 0, so the gain only matters at the 0.5 paid end. If it were ever used, its stock should take a stock rate, not 0.051 |
| China (unrecorded part) | — | — | — | unchanged at 0.051. These are private firms selling dual-use goods. A sanctions premium is plausible but no price and cost evidence was gathered |

The value-weighted central rate is **Iran 0.579** (0.375–0.754), up from 0.051, and **North Korea's arms 0.608**
(0.305–0.825), up from 0.449.

## What the counted amounts become (2022 to Aug 2026, EUR bn)

| | delivered | counted now | proposed (extra 0.6) | proposed, extra 0.9 |
|---|---:|---:|---:|---:|
| Iran | 3.53 | 0.108 (0.04–0.59) | **1.23** (0.55–2.04) | 1.84 |
| North Korea | 10.0 | 3.33 (1.45–6.56) | **4.20** (1.81–8.22) | 5.87 |
| Belarus | 1.27 | 1.27 (unpaid) | unchanged | unchanged |

Iran goes from 3% to 35% of what it delivered, and North Korea from 33% to 42%.

## Effect on the site (site model on `site/data.json` of 2026-10-27, military series replaced)

| | net now | proposed | proposed, extra 0.9 |
|---|---|---|---|
| Iran | −0.03% GDP, chance toward Russia 0.84, *uncertain* | **−0.29%**, 0.995, no longer uncertain | −0.44%, 0.999 |
| North Korea | −11.3%, 0.999 | **−14.3%**, 0.999 | −19.9%, 0.999 |

The change moves Iran's classification from uncertain to certain. North Korea's side does not change; only its size
moves. The world's Russia-side total grows by about €2.0bn (Iran +1.12, North Korea +0.87). The full-value `alt`
method band is untouched.

## Choices for the owner

1. **The extra factor.** The 0.4–0.8 default was written for Western industry, where a war sale can displace other
   buyers. Iran's licence sale and North Korea's stock sales exist only because of the war. 0.8–1.0 is arguable, but
   the rent measure already deducts a normal return, so part of the crowding-out is already in the cost. This proposal
   keeps 0.6 and shows 0.9 as a scenario.
2. **The licence is mostly rent.** If the owner prefers "value added kept" to "rent", the licence part comes out
   about the same (near 1), and delivered goods come out higher (0.6–0.8 of value).

## Doubts

- The Prana leak (Sahara Thunder) is not independently authenticated (TWZ says so). The USD 1.75bn may include
  equipment and components whose cost to Iran is larger than assumed. The low end of 0.6 allows Iran a cost of USD 0.7bn.
- The cost of Iranian missiles and North Korean shells is not documented anywhere. Those rates are judgement, anchored
  only by the price model and a Western margin comparator.
- North Korea's "rest of stock" rate interacts with the payment question. If what North Korea really received is
  closer to FNF's USD 0.5–1.2bn, the issue is the paid share (`nk_paid_observed`), not the gain.
- Iran: possible double counting with Russia's Su-35 sale to Iran, if that was partly barter (already noted in
  `military_rus_r6-notes.md`).
- Not opened: the C4ADS report itself, the Sky News report of €140m cash plus captured Western weapons for about 160
  drones (Nov 2022), and Breaking Defense on the Fath-360 (HTTP 403).
