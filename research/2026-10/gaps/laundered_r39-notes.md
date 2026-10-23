# Laundered oil, round 39: measured content as the central value, speculative versions in the band

Gathered 2026-10-23. Output: [`laundered_r39.json`](laundered_r39.json). EUR bn, nominal; 2026 = January–August, not annualised. USD at ECB yearly averages. **Not yet reviewed by a person, and not wired into the builder.**
This file was produced by the project's research step and is kept as a data input; the research scripts and raw downloads are not in the repository, and the sources are listed in these notes and in the JSON (`sources`, `extracts`).

## The question

The owner decided: "what has evidence should be counted as such, then on top we can add speculative". The round-39 certainty audit found that "laundered oil not counted" (`laund_off`) flips the sign for 24 countries, and that laundered oil carries 13% of the uncertainty in the not-certain group. This round asks:

1. What evidence shows how much of the fuel bought from refining hubs is made from Russian crude, and who bears Russia's gain?
2. Can better quantities per buyer and per-refinery shares narrow the ranges for small buyers (Fiji, New Caledonia, New Zealand, South Africa, Mauritius, Nepal, Papua New Guinea)?
3. What does that do to each buyer's value and group?

## Evidence

| source | what it gives |
|---|---|
| [UN Comtrade API](https://comtradeapi.un.org/public/v1/preview/C/A/HS) | HS 2710 imports by partner for 21 buyers, 2019–2025; HS 2710 exports by partner of India, Singapore, Korea, Malaysia, China, UAE (to 2023), Türkiye, Brunei, Indonesia; HS 2709 crude imports by origin for 14 refiners and hubs; Russia's own export records for 2019–2021 |
| [DGCI&S TradeStat](https://tradestat.commerce.gov.in/eidb/commodity_wise_all_countries_export) | India's HS 2710 exports by country, USD m, FY2018-19 to FY2025-26. The old `.asp` addresses return 404 |
| [KSE Institute, June 2026](https://institute.kse.ua/wp-content/uploads/2026/06/kse_refining_loophole_eng_june_2026.pdf) | Kpler-based Russian share of crude intake for 11 refineries, Feb–Apr 2025, Nov 2025–Jan 2026 and Feb–Apr 2026. Products from Russian crude were 48%, 27% and 21% of the exports of six Indian refineries. Non-sanctioning buyers took 74% to 89% of those exports. The method is "perfect mixing" |
| [CREA, four years](https://energyandcleanair.org/wp/wp-content/uploads/2026/02/CREA_RU_Analysis_Four-years-of-invasion_24.02.2026.pdf) | G7+ bought EUR 14.7 bn from refineries using Russian crude in Feb 2025–Jan 2026, of which EUR 7.2 bn was made from Russian crude (0.49). Australia: 1.6 of 3.4 |
| [CREA, August 2026](https://energyandcleanair.org/august-2026-monthly-analysis-of-russian-fossil-fuel-exports-and-sanctions/) | Jamnagar 38% Russian in May–Jul 2026; Vadinar 100% in Jan–Aug 2026 (81% in 2025); China's seaborne crude 23% Russian |
| [CREA, The Laundromat (2023)](https://energyandcleanair.org/wp/wp-content/uploads/2023/04/CREA_The-Laundromat_How-the-price-cap-coalition-whitewashes-Russian-oil-in-third-countries.pdf) | The five laundromat countries; Singapore took 0.5 Mt more Russian crude |
| [CEPR DP17957](https://cepr.org/publications/dp17957) (Babina et al.; 403 to scripts, content checked through [eucrim](https://eucrim.eu/news/study-on-impact-of-international-sanctions-on-russian-oil-exports/)) | Russia redirected crude to India, China and Türkiye without losing volume, at discounts smaller than Urals quotes suggest. Products are harder to redirect |
| [1News / CREA, Nov 2025](https://www.1news.co.nz/2025/11/20/russian-oil-has-flowed-into-new-zealand-despite-sanctions) | New Zealand: about 75 kt of the fuel it bought from Jamnagar in Dec 2024–Apr 2025 was made from Russian crude, NZD 100 m of fuel |
| [MBIE](https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-publications-and-technical-papers/energy-in-new-zealand/energy-in-new-zealand-2023/oil), [OGJ on SAPREF](https://ogj.com/refining-processing/refining/operations/article/14233703/shell-bp-joint-venture-to-idle-south-african-refinery) | Marsden Point closed on 31 March 2022. SAPREF (180 kb/d) was idled from the end of March 2022. Engen Durban closed after a fire in December 2020 |
| [Korea Times, Mar 2026](https://www.koreatimes.co.kr/amp/business/companies/20260330/korea-resumes-russian-naphtha-imports) | Korea bought no Russian crude or naphtha from 2023 until a US-waiver cargo in March 2026 |
| [TÜİK](https://biruni.tuik.gov.tr/disticaretapp/) | The portal is interactive and was not scraped. Türkiye's crude imports by origin are not in Comtrade either, so the KSE and CREA shares are used |

**What the customs data show (Russian share of crude imports, by tonnes):**

| refiner | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 |
|---|---|---|---|---|---|---|---|
| India | 1.3% | 1.3% | 2.1% | 15.2% | 37.8% | 38.1% | 33.7% |
| China | 15.4% | 15.5% | 15.7% | 16.0% | 18.0% | 19.2% | 16.6% |
| Korea | 6.3% | 4.9% | 6.1% | 2.3% | 0 | 0 | 0 |
| Japan | 5.4% | 4.1% | 3.6% | 1.5% | 0.1% | 0 | 0.1% |
| Thailand | 5.0% | 5.7% | 3.3% | 0.7% | 0 | 0 | 0 |
| Singapore | 2.9% | 0.5% | 1.5% | ~1% | 0.5% | 0 | 0 |
| Malaysia (imports only) | 6.3% | 3.4% | 10.7% | 1.6% | 0 | 0.3% | 0 |

Per refinery (KSE, three periods: Feb–Apr 2025, Nov 2025–Jan 2026, Feb–Apr 2026): Jamnagar 47%, 19%, 18% (38% in May–Jul 2026, CREA); Vadinar 71%, 100%, 98%; New Mangalore 60%, 16%, 28%; Paradip 7%, 29%, 25%; STAR 89%, 79%, 68%; Tüpraş İzmit 21%, 47%, 74%; Tüpraş İzmir 0 from December 2025. All of these are in `refinery_level_shares`.

## Who bears Russia's gain: what the evidence supports

- **The content is measured.** A refinery's Russian share of crude, applied to all its products ("perfect mixing"), is the convention used by CREA, KSE and Australia's sanctions guidance. KSE calls the result "indicative estimates of potential exposure ... rather than a precise molecular tracing". So "not counted" (zero) contradicts the evidence. Physically, some of the fuel was made from Russian crude, and it can be measured.
- **The incidence is not measured.** Babina et al. show that Russia redirected its crude at a discount without losing volume. One buyer of Indian diesel therefore changes Russia's revenue by less than the full crude inside the diesel. The project already uses this logic for "paid" (`attrib`, world ratio about 0.5 for buyers who bought more). How much less, per buyer, has no published estimate. This is the speculative part.

## Proposed rule

**Central: measured content (option A).** For each buyer:

- its own customs imports of HS 2710 by origin;
- × the measured Russian share of that origin's refinery pool or hub pool that year;
- × crude content (`crude_content.json`).

The pre-war level (2019–2021) is measured the same way. Hubs (Singapore, Malaysia, Oman) get a mass balance of their own customs: crude feed plus product imports by origin, each × its origin's share. Where a buyer does not report, or reports a trading hub as consignor (the Pacific islands record Singapore), the suppliers' export records are used, × 1.05. Option A counts only refiners whose own payments the builder already nets off (India, China, Türkiye, UAE, Brunei, EU refiners). Korea, Japan, Thailand and the hubs' own refineries keep their Russian crude, which is already in their own payments. Valuation, volumes and net gain are unchanged (`laundered_volumes()`).

**Option B (shown, not recommended now).** Every refiner passes its share on, so buyers of Korean, Japanese and Thai fuel get credit for those refiners' pre-war Russian crude. This is fuller, but the builder would then have to take the same amounts off Korea's, Japan's, Thailand's, Singapore's and Malaysia's own payments, base years included. Otherwise the cut is counted twice.

**Speculative low (method band): `laund_half` replaces `laund_off`.** Half of Russia's gain is charged to the buyer, the redirected-trade incidence. With today's series this changes two groups out of 161: Mauritius and Nepal go from leaning Russia to certain Russia.

**Speculative high (method band): `laund_model`.** The current hub-chain model is kept as the alternative for buyers given a measured series. For them both routes are measured by their own customs, so the route rule (`laund_route`) has nothing to hold and is dropped. Elsewhere `laund_route` stays.

**Range.** The origin-share band (India ×0.75 to ×1.27; China and Türkiye ±20%; UAE ±50%; hubs from their inputs), crude content low/high, and ±10% on quantities (±20% for mirrors or carried years).

**Structural label (owner decision).** New Zealand's refinery closed on 31 March 2022 (decided in 2021). South Africa's Engen and SAPREF refineries closed in December 2020 and March 2022. Both countries' fuel imports rose 1.7–2.7 times. The proposal is to label this like Nigeria/Dangote and to show a variant with the pre-war base scaled to post-closure imports:

- New Zealand: gain to Russia 0.104 (−0.072 to 0.283), and its group becomes certain Ukraine;
- South Africa: 1.050 (−0.121 to 2.477).

## Results: gain to Russia from laundered oil, cumulative 2022–2026 (change view)

Positive means Russia gained. "Now" is the repo as of 2026-10-23, computed with the site's own `calc()`. Groups are the net balance's.

| country | cert. | now | proposed (A) | option B | group now | group proposed |
|---|---|---|---|---|---|---|
| Fiji | C | 0.012 (−0.003 to 0.044) | 0.015 (−0.0003 to 0.034) | −0.007 | leans Russia | Russia (certain) |
| New Caledonia | C | 0.008 (−0.002 to 0.030) | 0.006 (−0.008 to 0.021) | −0.005 | leans Russia | leans Russia |
| New Zealand | B | 0.134 (0.022 to 0.338) | 0.237 (0.082 to 0.411) | 0.127 | leans Ukraine | leans Ukraine |
| South Africa | B | 1.189 (0.430 to 2.377) | 1.641 (0.412 to 3.165) | 1.626 | leans Russia | leans Russia |
| Mauritius | C | 0.046 (0.021 to 0.080) | 0.113 (0.026 to 0.221) | 0.113 | leans Russia | Russia (certain) |
| Nepal | B | 0.657 (0.297 to 1.167) | 0.884 (0.388 to 1.415) | 0.883 | leans Russia | Russia (certain) |
| Papua New Guinea | C | 0.018 (−0.005 to 0.066) | 0.023 (−0.003 to 0.058) | 0.009 | leans Russia | leans Russia |
| Bangladesh | C | 0.489 (0.078 to 1.097) | 0.618 (−0.057 to 1.319) | 0.484 | leans Ukraine | uncertain |
| Philippines | B | −0.424 (−1.199 to 0.669) | −0.599 (−1.181 to 0.269) | −1.017 | leans Ukraine | leans Ukraine |
| Sri Lanka | B | 0.368 (0.160 to 0.703) | 0.342 (0.121 to 0.591) | 0.307 | Russia (certain) | Russia (certain) |
| Maldives | C | 0.015 (0.006 to 0.029) | 0.017 (−0.007 to 0.053) | 0.013 | leans Russia | leans Russia |
| Chile | B | −0.048 (−0.103 to 0.023) | −0.136 (−0.542 to 0.209) | −0.207 | leans Ukraine | leans Ukraine |
| Cameroon | D | 0.064 (0.001 to 0.208) | −0.024 (−0.171 to 0.171) | −0.030 | leans Ukraine | leans Ukraine |
| Kenya | C | 0.293 (0.035 to 0.761) | 0.264 (−0.079 to 0.680) | 0.260 | leans Russia | leans Russia |
| Tanzania | C | 1.168 (0.531 to 2.103) | 0.505 (0.175 to 0.898) | 0.500 | Russia (certain) | Russia (certain) |
| Mozambique | C | 0.343 (0.151 to 0.687) | 0.119 (0.002 to 0.264) | 0.118 | leans Russia | uncertain |
| Pakistan | C | 0.124 (−0.086 to 0.474) | −0.184 (−0.974 to 0.495) | −0.223 | leans Russia | leans Ukraine |
| Solomon Islands | C | 0.000 | 0.004 (−0.001 to 0.008) | −0.002 | Russia (certain) | leans Russia |
| Vanuatu | C | 0.005 (0.002 to 0.008) | 0.009 (0.003 to 0.015) | 0.009 | leans Russia | Russia (certain) |
| Samoa | C | 0.000 | 0.003 (0.000 to 0.006) | 0.001 | uncertain | leans Russia |
| Tonga | D | 0.000 | 0.002 (0.000 to 0.004) | 0.001 | leans Russia | leans Russia |

Central gain by year (2022, 2023, 2024, 2025, 2026 Jan–Aug), and the levels of Russian crude in the fuel (2019–2026) against the current `laund.years`, are in the JSON (`buyers.*.gain_to_russia_change_view_eur_bn`, `russian_crude_in_fuel_eur_bn_levels`, `repo_current_levels_eur_bn`). Examples:

| country | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| Nepal | 0.114 | 0.232 | 0.230 | 0.163 | 0.144 |
| South Africa | 0.593 | 0.456 | 0.296 | 0.163 | 0.133 |
| New Zealand | 0.027 | 0.059 | 0.040 | 0.048 | 0.062 |
| Fiji | 0.002 | 0.004 | 0.004 | 0.002 | 0.003 |
| Philippines | −0.178 | −0.032 | −0.052 | −0.166 | −0.170 |

## What changes, and why

- **Pacific islands through Singapore.** The measured Russian-derived share of the Singapore pool is 3.0% before the war and 3.2–3.9% after (option A). Much of the "Singapore" fuel on the islands' customs is Korean or Malaysian by the suppliers' own records: in 2024 Fiji recorded USD 688 m from Singapore, while Korea recorded 176 m and Malaysia 50 m to Fiji. The pre-war level is about 1.7 times the current base. Levels rise, so the change stays small. Fiji's net range stops crossing zero, but only just: its upper end is −0.0002, while the laundered part alone still reaches −0.0003 (Russia losing). New Caledonia and Papua New Guinea still cross. Under option B, Fiji, New Caledonia and the Solomon Islands change sign, because their Korean and Singaporean suppliers stopped buying Russian crude.
- **India's buyers** (Nepal, Sri Lanka, Bangladesh, South Africa, Mauritius). India's share went from 1–2% to 34–38%, so the measured rise is real. Nepal buys all its fuel from Indian Oil Corporation; India's records in Comtrade and DGCI&S agree (USD 1.5–2.1 bn a year). Mauritius and Nepal become certain once `laund_off` is replaced.
- **East African transit hubs.** India records USD 2.2–3.0 bn a year to Tanzania, but Tanzania's own home-use imports from India are 0.66–0.91 bn. For Mozambique the figures are 0.6–1.8 bn and 0.07–0.2 bn. The difference is transit to Zambia, DRC, Malawi, Zimbabwe, Rwanda, Burundi and Uganda. The current model charges it to Tanzania and Mozambique. Using their own customs cuts their gain to Russia from 1.17 to 0.51 bn (Tanzania) and from 0.34 to 0.12 bn (Mozambique). The landlocked buyers are not computed yet.
- **China's buyers** (Philippines, Pakistan, Chile, Bangladesh). China's Russian share barely moved (15.7% → 16–19%), so the content did not change. What changes is volume, and pre-war Chinese fuel (Pakistan USD 1.5 bn in 2021) is a large base. Pakistan moves to the Ukraine side. Its post-war content comes mostly from the UAE, the weakest share (CREA's Russian products ÷ UAE exports).
- **Cameroon** records India as the origin of fuel that India does not record (USD 415 m against 8 m), and has no customs data after 2023. Rated D.

## Notes for the builder

- For the listed buyers, replace `laund.years`, `years_lo`, `years_hi`, `base` and `base_range` (base = the mean over 2019–2021 of each level ÷ the Urals index: 1.124, 0.723, 1.154), and drop `eu_route_held`. In their alternatives, `laund_off` becomes `laund_half` and `laund_route` becomes `laund_model`.
- The series already hold Brunei's (Hengyi) fuel for New Zealand and the Philippines, so drop `laundered_r6` Brunei additions for NZL and PHL. They also hold the fuel these buyers got through Singapore and Malaysia, so switch off `reassign_laundered_oil()` resale to them. Recompute the refiner deductions (India, China, Türkiye, UAE) from the buyers' new values.
- Option B needs new deductions from Korea, Japan, Thailand, Singapore and Malaysia.

## What is guessed

- The feed of Malaysia's and Oman's refineries (20–27 Mt and 13–22 Mt).
- Singapore's 2022 crude (not served by Comtrade; taken as ~1% Russian).
- The UAE's pre-war share (3%, from Russia's 2021 product exports to the UAE).
- Türkiye's pre-war share (15–20%, from Russia's crude exports).
- India's 2026 share (30%, from 21–38% across KSE and CREA periods).
- 2026 quantities: 2025 × 8/12 × the CREA diesel price ratio (1.31).
- Years without the buyer's own customs: Nepal 2023–25, New Caledonia and Bangladesh all years, Papua New Guinea 2025, Cameroon 2024–25, Tonga 2024. These are mirrors or carried forward.

## Open questions

- Option A or B (owner): should Korea, Japan, Thailand and the hubs pass Russian crude on?
- Indian Oil Corporation per-refinery shares (Barauni, Haldia, Paradip) for Nepal. Paradip was 7–29% in 2025–26, below the national 34%.
- Transit fuel to the landlocked African buyers, from their own customs.
- The UAE re-export share. A Kpler split of Fujairah would settle it.
- Bangladesh Petroleum Corporation's imports by origin, to replace the mirrors.
- The structural label for New Zealand and South Africa.
