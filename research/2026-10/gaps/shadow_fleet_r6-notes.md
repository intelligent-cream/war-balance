# Shadow fleet, round 6: how much of the "opaque" fleet is really Russian

File: `shadow_fleet_r6.json`. Gathered 2026-10-18. Not yet reviewed by a person. Roadmap item C3. Ranges are about 90%.

This is a **revision** of [`shadow_fleet.json`](shadow_fleet-notes.md) (round 5), with the same structure, and it **replaces** it. Nothing changes for the mainstream (G7-linked) fleet, the Greek shares, the shadow/white split, the freight pools or LNG. The change is how the shadow fleet is split between **Russia itself** and **truly foreign controllers**.

Scripts are in the scratchpad folder `r6/shadow_fleet_r6/`:
- `build_r6.py` builds the model and runs a Monte Carlo for the ranges.
- `assemble_r6.py` writes the JSON.
- `sens.py` runs the one-at-a-time sensitivities.
- `balt_mgr_sep26.txt` and `balt_mgr_annual.json` hold the KSE Baltic chart readings.

## The question

KSE reports shadow-tanker volumes by the **country of the ship manager**. A manager in Dubai, Hong Kong or the Seychelles is often a front. Round 5 handled this with guesses. The largest guess was that **50%** of tankers with Seychelles, Marshall Islands or unknown managers are Russian-controlled, plausibly anywhere from 25% to 80%.

Round 6 replaces those guesses with evidence for each manager group. No vessel-level beneficial-owner dataset was reachable: Lloyd's List Intelligence, S&P and Kpler fields are paywalled, and the one academic Equasis study ([Transportation Research Interdisciplinary Perspectives, 2026](https://www.sciencedirect.com/science/article/pii/S2590198226002630)) returned 403. The evidence is therefore three things:
- KSE's own charts and tables;
- sanctions designations that name who controls a network;
- investigations.

## New evidence

| evidence | what it shows | used for |
|---|---|---|
| [KSE tracker Mar 2026](https://sanctions.kse.ua/wp-content/uploads/2026/04/KSE_Shadow_fleet_tracker_MAR26.pdf), chart of shadow volume by **registered-owner** country (read from chart geometry; checked against the printed labels, e.g. Dec 2024: China 998, UAE 172, Russia 745, Seychelles 880 kb/d) | Russian-registered owners carried 45% / 36% / 26% / 19% / 17% of shadow volume (2022–26), while Russian *managers* carried only 4–13% until 2025. UAE-registered owners carry only 175–230 kb/d against 550–1,100 kb/d UAE-managed. | Sovcomflot tankers keep Russian owners behind Dubai managers. This is a hard **lower bound** on the Russian share. |
| [KSE tracker Sep 2026](https://sanctions.kse.ua/wp-content/uploads/2026/10/KSE_Shadow_Fleer_Tracker_SEP26.pdf), **Baltic** section: volume by manager country for Baltic ports, monthly from Apr 2022 | "China"-managed loadings in the Baltic were 72, 139, 210, 167 and 442 kb/d (2022–26). That is 59%, 43%, 24%, 21% and 38% of all "China"-managed volume. Baltic top-10 managers are serial shells such as Prizantal Shorelink, Krivet Shardline, Solvix League and Aetherion. Seychelles managers load 53–58% of their volume in the Baltic. | Splits KSE "China" into a **western** part (mostly fronts) and a **Pacific** part (Kozmino to China, mostly real Chinese owners). |
| KSE Sep 2026, table of the top-20 EU-designated tankers | Sovcomflot tankers are registered to Hong Kong shells (Comitana, Anchorstar, Vimena, Insania, Glimmer Shipping HK). Sovcomflot-chain Dubai managers (Nova, Greenlight, Lynx, Grace, Albatross) use Omani SPC owners (Citrine Marine, White Agate). Baltic "China" shells use Azerbaijani ISM managers. | Hong Kong and Oman labels are partly Russian. |
| [Windward, 1 Oct 2026](https://windward.ai/blog/45-shadow-fleet-tankers-link-to-a-single-hong-kong-nominee/) | 45 Russia-trading tankers sit in single-ship Hong Kong companies with one untraceable nominee. 40 have ISM managers in flats in Sumqayit, Azerbaijan. All were Seychelles or Marshall Islands SPVs before 2026. Four list Litasco (Lukoil's Geneva trading arm) as former commercial controller. | The opaque and western "China" groups are one network, with Russian-company roots. |
| [EU Council, 15 Dec 2025](https://www.eeas.europa.eu/delegations/ukraine/russias-war-aggression-against-ukraine-council-sanctions-9-shadow-fleet-enablers_en) | Listed businessmen "linked directly or indirectly to Rosneft and Lukoil", including 2Rivers figures; 2Rivers "controls a large proportion of the vessels in Russia's so-called shadow fleet". Also listed: Nova Shipmanagement and Citrine Marine (UAE), Hung Phat Maritime (Vietnam) and SeverTransBunker (Russia). | UAE, opaque and "other" groups |
| UK sanctions on 2Rivers ([May 2025](https://www.bairdmaritime.com/shipping/tankers/uk-sanctions-directors-of-oil-trading-group-over-russian-ties-2): directors; [Feb 2026](https://www.lloydslist.com/LL1156430/UK-targets-2Rivers-shadow-fleet-network-in-Russia-sanctions-push): 175 companies, 48 tankers); [Project Brazen](https://mysteryships.projectbrazen.com/) | 2Rivers (ex-Coral Energy) runs about 125 tankers. Purchases were largely financed by **Russian bank loans**, and the operation was allegedly directed by Rosneft. Shareholders are Azerbaijani nationals in Dubai. | 2Rivers is counted as **2/3 Russian, 1/3 Azerbaijani/UAE** |
| UK ([Jul 2025](https://www.spglobal.com/commodity-insights/en/news-research/latest-news/shipping/072125-uk-sanctions-lukoil-linked-trader-135-shadow-fleet-tankers)) and EU (Oct 2025) sanctions on Litasco Middle East; FT on Eiger Shipping (about 25 tankers financed by Litasco) | Lukoil runs its own Dubai-based fleet | UAE, opaque |
| [OCCRP, Jun 2026](https://www.occrp.org/en/news/dozens-of-azerbaijan-companies-manage-russian-shadow-fleet-tankers) | At least 31 Azerbaijan-registered ISM firms (2023–25) manage sanctioned tankers | Azerbaijan nationality share |
| FT on Gatik ([via National Herald, Apr 2023](https://www.nationalheraldindia.com/business/unknown-indian-company-shipping-millions-of-barrels-of-russian-oil)) | 58 tankers; more than half of the 83m bbl tracked by Kpler came from Rosneft; opaque owners | India 2022–23 |
| [KSE, Sep 2025](https://sanctions.kse.ua/wp-content/uploads/2025/09/New-shadow-tankers-Overview.pdf) | New 2025 tankers: Seychelles, Mauritius and Marshall Islands single-ship owners with serial Chinese, Indian and UAE ISM managers. Half of 81 unsanctioned repeat tankers carry the Russian flag. | opaque |
| [S&P, Oct 2024](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/100424-non-g7-crude-tankers-share-hits-fresh-high-in-russia-on-seychelles-shadow-firms) | Seychelles operators doubled crude liftings to 14.7m bbl a month; ownership unknown | opaque |
| [HUR via USM, Feb 2025](https://en.usm.media/?p=168397) | Russia spent more than **USD 10bn** buying shadow tankers since Dec 2022; fleet of up to 1,000 tankers | aggregate cross-check |
| [SZR via LIGA, Dec 2025](https://news.liga.net/en/politics/news/the-szr-told-where-companies-operating-tankers-of-the-russian-shadow-fleet-are-registered) | Operator companies: Seychelles 15% (90), Greece 9.5%, Russia 9.5%, China 9%, UAE 8.6% | context |

## Russian-controlled share by manager group (central, low–high)

| KSE manager group | 2022 | 2023 | 2024 | 2025 | 2026 | round 5 | main evidence |
|---|---|---|---|---|---|---|---|
| Russia | 100% | 100% | 100% | 100% | 100% | 100% | – |
| UAE | 85 (70–95) | 82 (72–92) | 78 (65–88) | 72 (55–85) | 80 (68–90) | 85 / 80 / 75 / 68 / 80 | Sovcomflot chain is 57–89% of named volume; Litasco/Eiger; EU listing of Nova and Citrine; registered-owner chart |
| "China", western part (Baltic × 1.25) | 75 (50–90) | 75 | 75 | 75 | 75 | 20% (mainland) / 35% (HK) | Windward Hong Kong cluster, KSE Baltic tables, Azerbaijani ISM managers |
| "China", Pacific part | 20 (8–40) | 20 | 20 | 20 | 20 | 20% / 35% | Kozmino private owners; Sovcomflot shuttles |
| India | 60 (35–80) | 60 | 45 (25–65) | 45 | 45 | 55 / 50 / 45 / 45 / 45 | Gatik (Rosneft cargoes), later technical managers |
| Singapore | 20 (5–40) | 20 | 20 | 20 | 20 | 20% | unchanged |
| **Seychelles, Marshall Islands, unknown** | **60 (40–80)** | **65 (45–85)** | **65 (45–85)** | **65 (45–85)** | **65 (45–85)** | **50 (25–80)** | 2Rivers, Litasco/Eiger, Gatik successors, Sovcomflot SPVs; HUR spending |
| other managers | 33 + 12% opaque | same | same | same | same | 25% (opaque part all foreign) | Hung Phat (EU), Omani SPCs of the Sovcomflot chain, Gabon/Panama shells |

The 2021 structure is kept as in round 5: a 6% pre-war shadow segment, 30% Russian.

**Why 65% for the opaque group.** 2Rivers alone runs about 125 tankers, roughly 12–20% of the Russia-trading shadow fleet. Most of its ships sit in Seychelles, Marshall Islands, Hong Kong or Dubai single-ship companies, so they could make up half of the opaque group. It counts 2/3 Russian. Lukoil's own fleet (Eiger, about 25 tankers), the Gatik successors (Rosneft) and the Sovcomflot SPVs add perhaps another 20–25% of the group. The rest are independent Chinese, Indian and Turkish-run single-ship owners, guessed at about 40% Russian. Together that gives 60–70%.

The aggregate check points the same way. If the HUR figure of USD 10bn is compared with a fleet value of roughly USD 15–20bn (about 700–900 old tankers bought for USD 20–30m each), around half or more of the fleet's value is Russian-funded. This model gives Russia 55–75% of shadow volume.

**Nationality of the non-Russian rest** (all certainty D):

| group | split of the non-Russian rest |
|---|---|
| UAE | UAE 55%, India 20%, Azerbaijan 10%, Türkiye 10%, China 5% |
| western "China" shells | Azerbaijan 35%, UAE 25%, China 20%, Hong Kong 20% |
| Pacific "China" | China 55%, Hong Kong 45% |
| India | India 85%, UAE 15% |
| opaque | China 22%, Hong Kong 13%, India 20%, UAE 20%, Azerbaijan 10%, Vietnam, Türkiye and Malaysia 5% each |

These replace round 5, which counted the whole non-Russian UAE part as UAE.

## Results

**Russian share of shadow barrels:**

| | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| round 6 | 75% | 67% | 58% | 55% | 62% |
| round 5 | 70% | 58% | 49% | 46% | 51% |
| lower bound (Russian registered owners only) | 45% | 36% | 26% | 19% | 17% |

**Gross freight**, EUR bn (central). The 2022–26 range is from the Monte Carlo.

| country | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug | 2022–26 (range) | round 5 | change |
|---|---|---|---|---|---|---|---|---|
| Greece | 5.29 | 4.63 | 2.45 | 2.83 | 1.88 | 17.1 (13.3–21.5) | 17.2 | −0.1 |
| China | 0.56 | 0.83 | 0.90 | 0.75 | 1.03 | 4.1 (3.1–5.3) | 4.7 | −0.6 |
| Türkiye | 0.61 | 0.95 | 0.64 | 0.56 | 0.72 | 3.5 (2.5–4.9) | 3.2 | +0.2 |
| UAE | 0.44 | 0.76 | 0.61 | 0.47 | 0.59 | 2.9 (2.0–4.1) | 4.3 | **−1.5** |
| India | 0.30 | 0.74 | 0.51 | 0.45 | 0.63 | 2.6 (1.9–3.7) | 2.6 | 0.0 |
| Hong Kong | 0.23 | 0.36 | 0.50 | 0.41 | 0.65 | 2.2 (1.5–3.0) | 2.6 | −0.5 |
| Azerbaijan | 0.07 | 0.22 | 0.26 | 0.20 | 0.28 | 1.0 (0.5–2.2) | 0.4 | **+0.6** |
| Vietnam | 0.03 | 0.11 | 0.14 | 0.11 | 0.10 | 0.5 (0.2–1.0) | 0.7 | −0.3 |
| Oman | 0.03 | 0.16 | 0.10 | 0.09 | 0.12 | 0.5 (0.2–1.1) | 0.7 | −0.1 |
| Malaysia | 0.02 | 0.15 | 0.13 | 0.10 | 0.12 | 0.5 (0.3–1.1) | 0.6 | −0.1 |
| **Russia (own and controlled)** | 3.75 | 4.75 | 4.65 | 3.46 | 5.57 | 22.2 (19.4–25.2) | 19.8 | +2.3 |

- All foreign countries together: EUR **43.7bn** gross over 2022–26, against 46.0bn in round 5.
- Cyprus, Singapore, Malta, Kuwait, Japan, Norway, the USA and other mainstream owners are unchanged (±0.01).
- Greece falls slightly (−0.8%). Only Pacific shadow crude now gets the 0.6× Kozmino freight discount, so the crude pool is spread over more full-rate barrels.

**Sensitivities** (EUR bn, 2022–26, crude and products only):

| change | UAE | China | Hong Kong | India | Azerbaijan |
|---|---|---|---|---|---|
| opaque group at 45% Russian | +0.24 | +0.27 | +0.16 | +0.24 | +0.12 |
| opaque group at 85% Russian | −0.24 | −0.27 | −0.16 | −0.24 | −0.12 |
| UAE group at its low Russian share | +0.59 | – | – | – | – |
| UAE group at its high Russian share | −0.48 | – | – | – | – |
| Pacific "China" at 40% Russian | – | −0.33 | −0.27 | – | – |
| western "China" at 50% Russian | – | +0.15 | +0.15 | – | +0.27 |

The opaque share is no longer the biggest lever. The UAE share is now larger for the UAE, and the Pacific share is larger for China.

## How the builder should use it

Use exactly as `shadow_fleet.json` (see its notes), with three points:
- Read `countries.ISO3.freight` and `baseline_2019_2021` from this file instead of `shadow_fleet.json`.
- Keep dropping the `refine.json` `shipping_control` scaling and the 2026 ×1.065 factor.
- New fields:
  - `freight_2022_2026_total`: the Monte Carlo range of the sum. Use it rather than adding yearly ranges, in line with B1.
  - `r5_freight_central` and `change_vs_r5_2022_2026`: for the before/after check (A8).
  - `control_by_manager_bucket`: the evidence table above.
- Gross freight still needs the profit (or, under round 6 rule A, value-kept × extra) factor.

## What is guessed

- **2Rivers counted 2/3 Russian.** It has Russian bank financing and, per the EU, Rosneft direction, but Azerbaijani/Dubai shareholders. If it were counted fully foreign, Azerbaijan and the UAE would each gain about EUR 0.3–0.5bn. If it were counted fully Russian, Azerbaijan would fall to about 0.5bn.
- **The Black Sea and Arctic share of "China"-managed shells**, set at 25% of the Baltic amount (0–60%). KSE publishes a Baltic chart only.
- **The nationality split of the non-Russian rest** in each group (certainty D).
- **No vessel-level beneficial-owner data.** All shares are network-level judgements anchored on KSE volumes and sanctions texts. Certainty stays C for the hubs and D for Azerbaijan, Vietnam, Oman and Malaysia.

## Overlaps

- This file replaces `shadow_fleet.json` one for one and adds no new flow. Only the Russia/foreign split of the same freight pools changes.
- Never add it to `shipping.json` freight. Ship sales, insurance and the services overlap are handled as before.
- Azerbaijan's new freight is shipping freight. Oil-trading margins of hub traders, including 2Rivers as a trader, sit in `hub_buyers.json` and the laundered-oil files, which are untouched. Check that no Azerbaijan or UAE trader margin is credited twice.
- Sovcomflot's Hong Kong and Omani shells are counted for Russia, not for Hong Kong or Oman.

## Open questions

- Lloyd's List Intelligence or S&P "group beneficial owner" fields per vessel, joined to KSE volumes, would turn the group shares into data (certainty B).
- A KSE Black Sea and Pacific manager chart would remove the 25% west guess.
- The UK's February 2026 2Rivers list (175 companies) could be matched to IMO numbers to measure the network's share of shadow volume directly.
