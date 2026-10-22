# North Korea's military value to Russia, revalued (round 24b)

Data: [`north_korea_r24.json`](north_korea_r24.json); applied in `pipeline/build_data.py` `military_rus_scaled()`. Earlier values: [`military_rus_r6.json`](military_rus_r6.json), paid share [`military_payment_r13.json`](military_payment_r13.json).

**Decision (the owner, 22 October 2026, audit 24 D M3):** full value EUR 6.8 / 10.0 / 18.6bn; the paid/unpaid factor unchanged; a method-band alternative "Russia paid only what was observed flowing back" (paid share 5-13%). **All the study figures below were read via the press**: the INSS and KIDA PDFs were not reachable.

Data: `t3_north_korea.json`. Research only.

## Where it sits in the model
- **Part `mil`** ("Weapons and troops sent to Russia") in `calc()`, a Russia-side part.
  - Data: `data.json countries.PRK.military_rus`. `alt` = full value per year; `years` / `years_lo` / `years_hi` = the counted value.
  - Built from `research/2026-10/gaps/military_rus_r6.json`, which gives volumes × prices = full value: EUR 8.8bn (3.3–17.6), 2022 to Aug 2026.
  - `military_payment_r13.json` decides how much counts: the paid share (0.8 / 1.0 / 1.0) at the seller's net gain, with 50% of shells treated as outdated stock at a 0.9 gain, and troops' pay in full.
- **Counted now:** EUR 3.02bn (0.97–6.08), i.e. 0.34 × the full value.
- **North Korea's net now:** −10.28% of GDP (−20.64 to −3.34).

## Public estimates (all secondary press reports of the studies; the primary PDFs were not reachable)
| source | date | period | value (USD bn) | note |
|---|---|---|---|---|
| KIDA (Korea Institute for Defense Analyses) | Apr 2025 | Aug 2023 – ~Mar 2025 | **20.1**: munitions and supplies 19.2 (27.4 trn won), technology to NK 0.63, troops 0.28 | [Kyiv Independent, 16 Apr 2025](https://kyivindependent.com/north-korea-earns-over-20-billion-aiding-russias-war-effort-report-says/); [NK News](https://www.nknews.org/?p=954760). Implied price 3,300–4,600 USD per round on 4.2–5.8m rounds |
| INSS (Lim Soo-ho) | 16 Mar 2026 | Aug 2023 – Dec 2025 (one source says Dec 2024) | **7.67–14.4**: arms 7.05–13.78, troops 0.62 | [NK News, 17 Mar 2026](https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/), [Korea Times](https://www.koreatimes.co.kr/amp/foreignaffairs/northkorea/20260316/n-korea-estimated-to-have-earned-up-to-144-bil-from-russia-ukraine-war-involvement-report). Soldiers USD 2,800/month; USD 0.56bn a year from troops; deliveries to NK of USD 0.58–1.5bn confirmed |
| South Korean estimate via Nikkei | 2025 | three years | 7.0–13.8 | [Hromadske](https://hromadske.ua/en/economy/263814-pivnichna-koreia-zarobyla-blyzko-polovyny-svoho-vvp-za-try-roky-viyny-na-botsi-rosiyi-proty-ukrayiny-nikkei) |
| Friedrich Naumann Foundation (Guseinova) | Oct 2024 | to Oct 2024 | 1.7–5.5 | [Euromaidan Press](https://euromaidanpress.com/2024/10/28/new-research-estimates-north-korean-arms-supplies-to-russia-at-5-5-billion/) |
| FNF "Unequal Partnership" | 18 Sep 2025 | 2023 – mid 2025 | up to **9.8** delivered; NK's gains only **0.46–1.19** | [Al Jazeera](https://www.aljazeera.com/news/2025/9/18/north-korea-getting-a-raw-deal-on-support-for-russias-war-report), [FNF](https://www.freiheit.org/north-and-south-korea/new-fnf-study-partnership-between-russia-and-north-korea) |
| The model (military_rus_r6) | Oct 2026 | to Aug 2026 | ≈ 9.6 (EUR 8.8) | 10m rounds × USD 800, 220 KN-23 × 2.5m, artillery, troops 0.9 |

**Volumes**, already in `military_rus_r6-notes.md`:
- OSC: 29,488 containers (8–11m rounds).
- ROK DIA: about 33,000 containers and more than 12m 152mm-equivalent.
- MSMT/2025/1: up to 9m rounds and at least 100 missiles in 2024 alone.
- Troops: more than 14,000 (MSMT) and 21,000 over four rotations (INSS).

**Price anchor:** Russia's own procurement price is about USD 1,200 per 152mm round in 2024 and more than USD 1,300 in 2025.

**Reading.** The estimates differ mainly in **price**, not volume. KIDA's implied 3,300–4,600 USD per round is roughly 3× Russia's own price for new 152mm shells, while about half of the North Korean rounds are old or 122mm. So KIDA is a price ceiling. INSS brackets the model.

## Proposal
**Full value, EUR bn (2022 – Aug 2026).** These replace `military_rus_r6` PRK 3.3 / 8.8 / 17.6.

| | value | build |
|---|---|---|
| low | **6.8** | INSS low (USD 7.67bn to Dec 2025) + 2026 troops (USD 0.37bn); every independent estimate since 2025 is above the old 3.3 |
| central | **10.0** | INSS midpoint USD 11.05bn + 2026 (USD 0.6bn) = USD 11.6bn. Cross-check: 10m rounds × USD 800 + missiles, artillery and troops ≈ USD 10.0bn |
| high | **18.6** | KIDA USD 19.5bn without the technology North Korea received (that is Russia's payment, not North Korea's delivery) ≈ EUR 18.0bn, + troops after Mar 2025; the same as 12m rounds at Russia's own USD 1,300 price |

- **Yearly profile:** keep r6's container timing (17 / 42 / 38 / 3%) for arms and INSS months for troops.
- **Mapping to `mil`:** unchanged rule. Scale `alt`, `years`, `years_lo` and `years_hi` by new/old full value per band (central ×1.136, low end ×2.06, high end ×1.057), i.e. keep the paid/unpaid factor.
- **Counted:** central 3.43, range 1.99–6.43 (was 3.02, 0.97–6.08).

## Effect (approximate; ranges add in quadrature in the model)
- **North Korea:** net −10.3% → **−11.7%**. The most negative end goes from −20.6 to about −21.8; the least negative from −3.3 to about **−6.8**. North Korea stays "toward Russia", now further from zero.
- **Russia-side world total:** −€0.4bn. Nobody else moves.

## The bigger lever: the paid share
FNF (2025) finds North Korea's gains were only USD 0.46–1.19bn, with no substantial cash inflows observed. INSS confirms deliveries to North Korea of USD 0.58–1.5bn. If that is all Russia paid:
- the paid share of a USD 11.6bn delivery is about 5–13%;
- almost everything counts at full value;
- North Korea returns to about **−30%** of GDP (the round-12 figure).

On the other side, INSS says technology and components were 80–96% of the "compensation". That implies payment far above the fuel and food observed, but is unquantified and unverified.

**This choice moves North Korea by about 20 points; the full-value change in this topic moves it by about 1.4.**

## Confidence
- **Full-value range:** medium. Several independent volume counts; the price is the judgement.
- **Paid share:** low.

## Open questions
1. Should the paid share's low end drop from 0.8 to about 0.15 (FNF / INSS observed transfers), which would widen North Korea's range to about −30%?
2. INSS's period (Dec 2024 or Dec 2025) is still not verified. If it is Dec 2024, the INSS total should be extended by a year (≈ +40%), which would push the central toward EUR 13bn.
3. Labour: North Korean workers in Russia (15–25k) stay out under the remittances rule. KIDA's "manpower" USD 0.28bn is troops, which are already counted.
