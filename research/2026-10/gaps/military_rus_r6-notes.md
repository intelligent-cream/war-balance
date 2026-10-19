# Military support to Russia, round 6 (`military_rus_r6.json`)

Round 6 revision of `flowback2.json` `military_to_russia`. It replaces that block and the North Korea series in
`narrow.json` (`countries.PRK.military_rus`). Same keys, so the builder can swap it in directly.

## What the flow is

Weapons, ammunition, troops and intelligence that foreign states sent to Russia for its war. Russia mostly paid in kind:
technology, oil, food, gold, and some cash. Following the method, each item is valued at **market value** (what Russia
pays its own industry for the same item, or what it paid the supplier). It counts **in full** and always **toward
Russia**. None of it shows up in customs data, so no profit margin applies.

Units: EUR bn nominal. 2026 covers January–August only. USD is converted with ECB yearly averages (1.053, 1.081, 1.082, 1.13, 1.16).
Ranges are about 90%. A country's low, central and high are the sums of its items' lows, centrals and highs.

## Results

| Country | 2022 | 2023 | 2024 | 2025 | 2026 (Jan–Aug) | Total central | Range | Certainty (old → new) |
|---|---|---|---|---|---|---|---|---|
| North Korea (PRK) | 0 | 1.28 | 3.59 | 3.38 | 0.58 | **8.8** | 3.3–17.6 | D (narrow.json C) → **C** |
| Iran (IRN) | 0.39 | 1.30 | 1.33 | 0.52 | 0 | **3.5** | 1.5–5.5 | D → **C** |
| Belarus (BLR) | 0.92 | 0.23 | 0.05 | 0.05 | 0.03 | **1.3** | 0.55–2.7 | D → D |
| China (CHN), not-in-trade only | 0.17 | 0.26 | 0.28 | 0.33 | 0.24 | **1.3** | 1.0–3.0 | D → D |

Previous centrals were PRK 9.5 (flowback2) or 10.85 (narrow), IRN 4.3, BLR 1.2, and CHN 1.28 (china_military).

## North Korea: about EUR 8.8bn (C)

**Quantities.** The independent counts now agree within a factor of about 2:

| Source | Count |
|---|---|
| [Open Source Centre via IStories](https://istories.media/en/stories/2026/03/16/how-north-korea-armed-russia/) | 29,488 containers, Sep 2023–Jan 2026, so **8–11m** shells and rockets |
| [ROK Defense Intelligence Agency](https://www.koreatimes.co.kr/amp/foreignaffairs/northkorea/20260301/n-korea-ships-33000-containers-of-weapons-to-russia-seoul) | about 33,000 containers (Mar 2026), earlier [>12m 152mm-equivalent](https://kyivindependent.com/north-korea-supplied-russia-with-12-million-rounds-of-152mm-shells-south-korean-intelligence-estimates/), and 220 artillery pieces |
| [MSMT/2025/1](https://msmt.info/api/file/download/18858) (11-state monitoring team; primary report, read in round 12, see below; first seen [via the press](https://www.yahoo.com/news/north-korea-supplied-russia-9-142135873.html)) | up to 9m rounds and at least 100 ballistic missiles in 2024 alone |
| [Ukrainian HUR](https://prm.ua/en/intelligence-shipments-of-shells-from-north-korea-to-russia-have-halved/) (belligerent) | about 6.5m since 2023; 2025 half of 2024; about half the shells outdated |
| [INSS via Nikkei](https://hromadske.ua/en/economy/263814-pivnichna-koreia-zarobyla-blyzko-polovyny-svoho-vvp-za-try-roky-viyny-na-botsi-rosiyi-proty-ukrayiny-nikkei) | about 250 KN-23 missiles; [CAR](https://storymaps.arcgis.com/stories/3a4e9d713f59426d9d1ea3881abecbf3) documented KN-23/24 debris in Kharkiv |
| [Maritime Executive](https://maritime-executive.com/article/north-korean-shipments-of-shells-to-russia-tail-off) | only two shipments seen Jan–Mar 2026 |

**Prices.** Russian state procurement paid about [USD 1,200 per 152mm round in 2024 and over USD 1,300 in 2025](https://euromaidanpress.com/2026/01/27/ukrainian-drones-forced-a-change-russia-now-pays-more-per-shell-to-fire-from-farther-away/).
Bain put the cost at [about USD 1,000](https://militarnyi.com/en/news/sky-news-russia-is-producing-artillery-shells-around-three-times-faster-than-europe-and-the-united-states/).
North Korean stock is worth less: many rounds are 122mm or mortar rounds, and about half are outdated. So the model uses USD 400 / 800 / 1,100 per
152mm-equivalent round.

| Item | Low | Central | High | Build |
|---|---|---|---|---|
| Shells and rockets | 2.4 | 7.3 | 15.0 | 6.5m / 10m / 15m rounds × USD 400 / 800 / 1,100 |
| KN-23/24 missiles | 0.2 | 0.5 | 0.9 | 150 / 220 / 280 × USD 1.5m / 2.5m / 3.5m |
| Artillery systems | 0.1 | 0.2 | 0.4 | 220 × USD 0.5m / 1m / 2m |
| Troops | 0.6 | 0.9 | 1.3 | [INSS](https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/): USD 0.62bn Oct 2024–Dec 2025, USD 0.56bn a year after that; × 0.7–1.5 |

Timing follows the container counts: 17% in 2023, 42% in 2024, 38% in 2025 and 3% in 2026. Through December 2025 the central is
EUR 8.3bn, against INSS's EUR 6.9–13.0bn (USD 7.7–14.4bn).

**Why C.** There are several independent counts and a price anchor in Russia's own procurement data.

**What remains a guess.** The price discount for old stock, and the 2026 volume.

**Not counted.** The wages of 15–25k North Korean workers in Russia (a labour transaction). Payment form does not change the value:
INSS says 80–96% of Russia's payment is technology and components, so Pyongyang's cash income is far smaller than the
market value of what it sent.

### Checked against the primary report (round 12)

The Multilateral Sanctions Monitoring Team's first report is now read in full: **MSMT/2025/1, "Unlawful Military
Cooperation including Arms Transfers between North Korea and Russia"**, 29 May 2025, also UN document S/2025/340.
[Download](https://msmt.info/api/file/download/18858), [list of reports](https://msmt.info/Publications/Reports).
The PDF is kept as `research/2026-10/raw/msmt/msmt_2025_1.pdf` (listed with its checksum in `raw/MANIFEST.json`;
PDFs are not stored in the repository).

| item | MSMT/2025/1 says | paragraph | the model uses | fits? |
|---|---|---|---|---|
| Shells and rockets, 2024 | up to 9m rounds of mixed artillery and rocket ammunition in 49 shipments, Jan to mid-Dec 2024, per one participating state | 8, 11 | 42% of 10m (central) in 2024, so about 4.2m; 6.3m at the high end | yes: the model is below this upper figure; the high end (15m in all) leaves room for it |
| Shells and rockets, Aug 2023 to Mar 2025 | 4.2 to 5.8m rounds of 122mm and 152mm (Open Source Centre's estimate) | 8, 12 | 6.5m / 10m / 15m to early 2026 | yes: the low end (6.5m to 2026) is above OSC's count to March 2025, as later shipments continued |
| Containers | over 20,000 since early September 2023 | 11 | timing follows the container counts (29,488 to Jan 2026, OSC; about 33,000 to Mar 2026, ROK DIA) | yes: consistent with the later, higher counts |
| Ballistic missiles | at least 100 in 2024 alone | 13 | 150 / 220 / 280 KN-23/24, 2023 to 2026 | yes: the low end is above the 2024 minimum |
| Heavy artillery | elements of three brigade sets: 170mm self-propelled guns, 240mm rocket launchers, more than 200 vehicles in all (guns, launchers, reload vehicles) | 13 | 220 artillery systems | yes |
| Troops | over 11,000 in late 2024; over 3,000 more Jan to Mar 2025 | 9, 25, 26 | troops' pay from INSS (USD 0.62bn Oct 2024 to Dec 2025) | yes: counts only; the report gives no pay |
| Prices | none | | USD 400 / 800 / 1,100 per round, missiles USD 1.5m / 2.5m / 3.5m | **not checked**: the report gives no values |

**Result.** The report confirms the volumes from a primary, multi-state source. It gives no prices, so the value in
euros is still our judgement on Russian procurement prices, and the certainty stays **C**. No number on the map
changes.

## Iran: about EUR 3.5bn (C)

| Item | Low | Central | High | Build |
|---|---|---|---|---|
| Ready-made drones, 2022–23 | 0.05 | 0.24 | 0.66 | 1,000 / 1,700 / 2,400 drones ([ISIS](https://isis-online.org/isis-reports/alabugas-greatly-expanded-production-rate-of-shahed-136-drones/): about 1,100 launched before Alabuga's own output) × USD 50k / 150k / 290k |
| Alabuga contract (licence, technology, 6,000 kits) | 0.92 | 1.61 | 1.88 | leaked contract [USD 1.75bn](https://twz.com/news-features/what-does-a-shahed-136-really-cost); low uses the "programme cost just under USD 1bn" in the same files; [gold paid](https://en.lb.ua/news/2024/02/06/26552_hackers_leak_cost_iranian_shaheds.html) |
| Ballistic and air-defence missiles | 0.41 | 1.47 | 2.48 | [Bloomberg](https://militarnyi.com/en/blogs/iran-sent-russia-2-7-billion-worth-of-missiles-alone/): about USD 2.7bn of contracts; [Cavoli](https://www.rferl.org/a/iran-protests-russia-war-ukraine/33648840.html): over 400 SRBMs delivered; the model assumes ~17% / 60% / 100% of the contracts delivered |
| Ammunition | 0.12 | 0.21 | 0.51 | WSJ: 300,000 shells and 1m rounds; 300–500k shells × USD 400–1,000 |

By year: 2022 0.39, 2023 1.30, 2024 1.33, 2025 0.52, 2026 0.

The 2026 value is zero because the flow has reversed since Iran's 2025–26 war: Russia now ships TNT, ammunition and drone parts to Iran
([FDD, Aug 2026](https://www.fdd.org/analysis/2026/08/19/russia-helps-iran-sharpen-its-sword/)).
Russia's own Geran production after localisation is **not** Iranian supply and is not counted. That is the main reason the total is lower than
the old EUR 4.3bn.

### Su-35 netting (for the overlap agent and the builder)

Russia is selling Iran 48 Su-35s (about EUR 6bn, delivered from 2026; `russian_arms_exports.json`). If part of that price was settled
with Iranian drones or missiles, the same goods would be counted both as Iran's payment to Russia and as Iran's supply to Russia.
The amounts that could be barter, central EUR bn:

| | 2022 | 2023 | 2024 | 2025 | 2026 | Total (low–high) |
|---|---|---|---|---|---|---|
| All Iranian supply | 0.39 | 1.30 | 1.33 | 0.52 | 0 | 3.53 (1.5–5.5) |
| of which drones (direct + Alabuga) | 0.17 | 0.88 | 0.57 | 0.23 | 0 | 1.85 |
| of which missiles | 0.15 | 0.30 | 0.74 | 0.28 | 0 | 1.47 |

Timing argues against a large overlap. The supplies were delivered in 2022–25 and the jets come in 2026–28. If netting is needed, subtract
the settled part from Iran's Su-35 payments or from this series, never from both. The exact split is in `countries.IRN.by_item_eur_bn`.

## Belarus: about EUR 1.3bn (D)

| Item | Low | Central | High | Build |
|---|---|---|---|---|
| Ammunition from army stocks | 0.53 | 1.21 | 2.51 | [131.6 kt Jan 2022–Feb 2023](https://www.pravda.com.ua/eng/news/2023/06/10/7406295/), [about 5 kt in 2024](https://militarnyi.com/en/articles/role-of-defense-industry-of-belarus-in-russian-aggression-against-ukraine/), [loading again in Sep 2025](https://isans.org/analysis/belarus-review/belarus-review-by-isans-september-30-2025.html); 140 / 160 / 190 kt × USD 4k / 8k / 14k per tonne |
| T-72A and other vehicles from storage | 0.02 | 0.04 | 0.07 | 94–130 vehicles × USD 0.2–0.6m |
| State ammunition plant ("Uchastok", 2026) | 0 | 0.03 | 0.13 | [BelPol](https://euromaidanpress.com/2025/12/22/belarus-launches-secret-project-full-cycle-ammunition-plant-for-russian-army-by-2026/): hull plant from mid-2026 |

**Not added (already in trade):**

- Components that Belarusian companies sell to Russian arms makers ([BIC/OCCRP](https://www.occrp.org/en/news/belarus-ramps-up-arms-pipeline-to-russia-amid-sanctions-gaps): over USD 1.2bn, Feb 2022–Aug 2025: Peleng sights, MZKT chassis, Grad rocket parts, Integral chips). These are commercial sales inside Belarus's exports to Russia.
- Aircraft and air-defence repairs. These are in the services trade, which grew from USD 4bn to USD 9bn.
- Russia's share of Belarusian defence exports rose from 26% (2019) to 60% (2022). Those exports are also inside trade.

**Why D.** The quantities come from activists and the prices are our own.

## China: about EUR 1.3bn (D), unchanged

This is identical to `china_military.json` `uncounted_total`. This round found no new evidence. It is repeated here only so that all
four suppliers sit in one file. **Use one of the two, not both.** Recorded dual-use exports (EUR 4.5–5.8bn a year) stay in trade.

## Other suppliers checked

| Country | Finding | Counted |
|---|---|---|
| Myanmar | [USD 24m of tank sights and cameras bought back by Uralvagonzavod](https://themoscowtimes.com/2023/06/05/russia-buys-back-military-parts-exported-to-asia-a81399) (late 2022, customs records) | no (in customs, tiny) |
| India | USD 0.15m of missile sight parts bought back | no |
| Syria (to 2024) | no transfers to Russia found; Russia withdrew its own equipment | no |
| Eritrea | political support only | no |
| Foreign fighters | individual recruits paid by Russia | counts only (`fighters_for_russia`) |

## Overlaps (what the builder must do)

1. **Replace** `flowback2.json` `military_to_russia` with `countries` from this file.
2. **Remove or skip** `narrow.json` `countries.PRK.military_rus`. `apply_narrow()` runs after the military section and would otherwise overwrite PRK with the old central of EUR 10.85bn.
3. For CHN, keep using `china_military.json` (same numbers), or this file. Do not use both.
4. For Iran, apply the Su-35 netting only if the overlap agent finds evidence of barter (see the table above).
5. Belarus components, repairs and China's dual-use goods are in trade. They are not in this file.

## Open questions

- 2026 North Korean volumes after March. Only two ships have been seen.
- How much of Iran's USD 2.7bn missile contract was delivered. Fath-360 has not been seen in use.
- The true tonnage of Belarusian stock transfers after 2023.
- Whether Belarusian state production (Uchastok) will be invoiced through trade, which would make it overlap trade.
