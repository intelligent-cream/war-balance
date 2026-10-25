# Pipeline gas: a contract baseline (round 53)

## Rule (written 2026-10-25 before any back-test result was computed; the same text is `RULE` in the script)

**What is tested.** Whether the gas contracts known at a forecast origin predict a country's later purchases of Russian
gas better than "held flat" (the site's central for pipeline buyers).

**Data.**
- Actual: Eurostat `nrg_ti_gas`, imports from Russia (partner RU), TJ GCV, 2008-2021. The extract is round 48's
  `raw/demand_cf_r48/eurostat_energy_2026-10-25.json.gz` (present on this branch). Countries whose Russian imports
  Eurostat reports as 0 or confidential while gas plainly arrived (Austria, Denmark, Croatia, the UK) are left out.
- Contracts known at the origin: the two dated snapshots of Cedigaz's pipeline-contract database that the US
  Congressional Research Service published (report R42405): **vintage 2014** ("updated June 2014", figure 3 of the
  5 Nov 2015 version, years 2010-2030) and **vintage 2018** ("updated October 2018", figure 5 of the 26 Feb 2020
  version, years 2015-2035). Both are stacked-area charts; they are digitised (bcm/yr per buyer country and year,
  about ±0.5 bcm) and hand-checked. Origins 2014-2017 use vintage 2014; origins 2018-2020 use vintage 2018.
- No dated contract snapshot before mid-2014 was found. Origins 2010-2013 are therefore **not** evaluated; a
  sensitivity that uses vintage 2014 for origins 2011-2013 is reported separately and flagged as look-ahead (it
  contains renewals signed after those origins). It does not count for the verdict.

**Models**, for country c, origin o (data up to o), target year t = o+1 .. o+H, H = 1..5, t ≤ 2021:
- **F** (held flat): pred(t) = A(o).
- **K1** (contract path on the last year): pred(t) = A(o) × ACQ(t) / ACQ(o). Where ACQ(o) = 0 (no contract in the
  snapshot) K1 = F. Where the contract has expired by t with no renewal in the snapshot, renewal at the last ACQ is
  assumed (central), so K1 = F for those years.
- **K3** (contract path on the 3-year offtake ratio): pred(t) = mean over k = o-2..o of A(k)/ACQ(k), × ACQ(t), with the
  same fallbacks (any ACQ(k) = 0 → F; expired → last positive ACQ).
- **KB** (the literal contract band, checked for coverage only): [0.8 × ACQ(t), 1.1 × ACQ(t)] in volume (take-or-pay
  floor 80%, the documented level for Bulgaria and the Turkish importers, to a 10% upward flexibility), converted at
  37.1 PJ GCV per bcm (Bruegel's 40 bcm = 412 TWh). Coverage of the summed actual over H.

**Error.** Cumulative: e = ln(Σ pred / Σ actual) over t = o+1..o+H (as the site's cumulative bands). Countries with
A(o) = 0 or a zero summed actual are skipped.

**Pass (all three, for K1 and for K3 separately):**
1. **Accuracy:** at every origin 2014-2020 and every horizon H available at it, the median |e| over countries is at
   least 15% lower than F's (K ≤ 0.85 × F). One miss fails.
2. **Band not wider:** the pooled empirical 90% band (5th-95th percentile of e over all countries and origins) is no
   wider than F's at every H.
3. **Coverage:** with the band re-estimated without the held-out origin (leave-one-origin-out), it covers at least
   85% of the held-out cases at every H (90% nominal; 85% allows for the small number of cases).

If neither passes, the contract baseline is **not** a better central than "held flat", and only documented decisions
(signed contracts' ends that a buyer announced before 2022, such as Poland's Yamal contract) are offered as changes.

**Site computation (fixed before the results).** Each gas buyer's purchases from Russia ("paid", `to_rus`) are split
into gas (its 2019-2021 gas share, `fossil_share × gas mix`, as `pre_war_fuel_split()` in build_data.py) and the rest,
which keeps its current band. The gas part gets the contract path (central) and the contract band; the two are
combined by the gas share of the expected value with rho = 0.26, exactly as `contract_lng()` does for Japan's LNG.
The 2025 end of Ukrainian transit is computed separately as a forced loss (round-52 style): the gas each buyer took
through Ukraine in 2024, less what it got by other Russian routes in 2025-2026, at the no-war price.

## Files

- Data: `research/2026-10/gaps/gas_contracts_r53.json`. Script: `research/2026-10/scripts/gas_contracts_r53.py`
  (`python3 -I ... run [patch.json]`, stdlib only, about 2 s; `... merge <before_after.json>`; `... digitize` re-reads
  the two chart images with Pillow, evidence only).
- Extracts: `research/2026-10/raw/gas_contracts_r53/` - each text file starts with its URL and the retrieval date
  (2026-10-25); the two CRS chart pages as PNG; `cedigaz_vintages_digitised.json` (machine digitisation, calibration,
  palettes); `search_summaries_2026-10-25.txt` for pages that could not be downloaded here (gazprom.com reset every
  connection; Reuters, S&P Global, IEA, Euronews, SeeNews returned 403). Not yet in `raw/MANIFEST.json`.
- The site before/after was computed with the site's own `calc()` on `site/data.json` of 2026-10-25 (scratchpad
  `r53gc/ba.mjs`, round 49's script plus range widths), then merged with `merge`.

**Nothing here is read by the build, and no number on the site changes.**

## Verdict (short)

**The contract baseline fails the pre-registered rule; "held flat" stays the central.** Contracts known at the
origin did not predict a country's later Russian gas purchases better than holding the last year flat: K1 was 15%
better in 0 of 25 origin-horizon cells, K3 in 2 of 25. The literal contract band (take-or-pay floor to ACQ max)
covered only 42-47% of country outcomes. Put on the site with its measured band, the contract model **widens** the
"paid" range of most large gas buyers (Germany, Czechia, Slovakia, Austria, Hungary). Two narrower things hold up:
Poland's announced non-renewal (a decision taken before the war), and the 2025 end of Ukrainian transit as a forced
loss, both shown below for the owner to decide.

## 1. Contracts as of end-2021

ACQ = annual contract quantity. ToP = take-or-pay share of ACQ. Certainty A = primary or two independent sources;
B = one good secondary; C = chart reading or unverified; D = gap.

| Buyer country | Buyer(s) | ACQ, bcm/yr | ToP | End / status at end-2021 | Use in the model | Cert. |
|---|---|---|---|---|---|---|
| Germany | Uniper (~24, to 2035/36), SEFE/Wingas, RWE, VNG, EnBW, Shell Energy (1.2) | 49 (Cedigaz 2020-31) | ~85% (norm) | 2031-2036 | running | B |
| Italy | Eni (>20, to 2034/35), Edison, Gazprom direct | 26.3; 23.4 from 2026 (Cedigaz) | n/p | 2034-35; part ends 2025 | running; 2026 step = expiry without renewal evidence (low end) | B |
| Austria | OMV | ~6 (62 TWh, Bruegel; 6.7 Cedigaz) | 96% (press) | 2040 (extended June 2018) | running; Ukrainian transit | A |
| Czechia | RWE Transgas / innogy | 9 | 90% | 2035 | running | B |
| Slovakia | SPP | ~6.3 (67 TWh) | n/p | 2028 (20-yr from 2009) | running; Ukrainian transit | A |
| Hungary | MVM CEEnergy (2 contracts) | 4.5 (3.5 via Serbia, 1 via Austria) | n/p | 15 yrs from 1 Oct 2021 | new, smaller than 2019-21 purchases (8.8) | A |
| Poland | PGNiG (Yamal) | 10.2 | 85% | 31 Dec 2022; non-renewal notified 15 Nov 2019 | 0 from 2023 (range 0-40%) | A |
| Bulgaria | Bulgargaz | 2.9 | 80% | 31 Dec 2022; no pre-war decision | renewal central; low 0 from 2023 | A |
| Greece | DEPA | 2.0 (Jan 2022 deal; was 2.5-3) | carry-forward ToP | 2026 | new, smaller (2/3 of the old ACQ) | B |
| Serbia | Srbijagas | ~2 | n/p | ended 31 Dec 2021, extended to May 2022 in talks | renewal central; low 0.8 (no other route) | B |
| Moldova | Moldovagaz | ~3 (incl. Transnistria) | n/p | 5 yrs from 1 Nov 2021 (to Oct 2026) | running (site counts the right bank only, own band) | A |
| Finland | Gasum | n/p (Cedigaz 6 = maximum?) | ToP (award 2022) | 2031 | running | B |
| Netherlands | GasTerra | 4.1 of 9.2 bcm Russian gas used | n/p | 1 Oct 2022 | renewal central; low = without GasTerra's part | B |
| France | Engie | 10.6 (Cedigaz); ~121 TWh taken 2021 | n/p | 2030 | running | B |
| Slovenia | Geoplin | 0.6 | n/p | 1 Jan 2023 | renewal central; low 0 from 2023 | A |
| Romania | not named | 6.7 (Cedigaz) | n/p | 2030 | running | C |
| Türkiye | Botas (Blue Stream 16, West/TurkStream 4), 7 private firms (10) | 30.5 to 2021; 21.8 2022-25; ~6 2026 | 80%; MSQ 37.5% | 8 bcm/yr ended 2021 (talks open); Blue Stream end-2025 | renewal central; face value as low end | B |
| Croatia | PPD | 1.0 | n/p | 31 Dec 2027 | no pipeline gas in the site's mix: nothing to change | A |
| Denmark | Orsted | up to 1.2 | n/p | 2030 (unverified) | no gas in the site's mix | C |
| Estonia | Eesti Gaas | - | - | ended 2015; short-term after | no contract: unchanged | B |
| Latvia | Latvijas Gaze | n/p | - | Cedigaz 2018 shows end 2017; later terms not public | gap: unchanged | C |
| Lithuania | Lietuvos Dujos / Achema | - | - | ended 2015 | gap: unchanged | C |
| Bosnia, N. Macedonia | BH-Gas, Makpetrol etc. | small | - | not found | gap: unchanged | D |
| Switzerland | - | - | - | no direct Gazprom contract | unchanged | B |
| China | CNPC | 38 (ramp) | - | Power of Siberia, 2014 | already contract-based (`power_of_siberia()`) | A |
| Kazakhstan, Uzbekistan, Kyrgyzstan, Armenia, Georgia | state or Gazprom-owned buyers | - | - | intergovernmental protocols, fixed prices | not modelled (no ACQ published; flows did not fall) | D |

Ukrainian transit: the December 2019 deal (65 bcm 2020, 40 bcm/yr 2021-2024) **expired 31 Dec 2024**; its end date
was known before the war. 15.4 bcm went through in 2024 (13.5 to Slovakia, 1.9 to Moldova/Transnistria; Expro).

Gaps: most ACQs are not published; the Cedigaz snapshots are country totals (all buyers), read from charts
(±0.5 bcm). Gazprom's own press releases could not be opened here (connection reset), so its announcements are
cited through TASS, Interfax, energynomics.ro and energyindustryreview.com.

## 2. Back-test (rule above)

16 countries, origins 2014-2020, 25 origin-horizon cells, 400 country cases. Median |cumulative log error|, pooled
5-95% band width, leave-one-origin-out coverage:

| H | n | F | K1 | K3 | width F / K1 / K3 | LOO coverage F / K1 / K3 | literal ToP-ACQ band coverage |
|---|---|---|---|---|---|---|---|
| 1 | 112 | 0.133 | 0.135 | 0.169 | 0.97 / 0.97 / 0.94 | 0.88 / 0.88 / 0.88 | 0.43 (n 87) |
| 2 | 96 | 0.154 | 0.154 | 0.148 | 0.89 / 0.89 / 0.87 | 0.87 / 0.87 / 0.87 | 0.47 |
| 3 | 80 | 0.162 | 0.159 | 0.151 | 0.90 / 0.90 / 0.83 | 0.86 / 0.86 / 0.88 | 0.47 |
| 4 | 64 | 0.158 | 0.159 | 0.182 | 0.88 / 0.88 / 0.89 | 0.89 / 0.89 / 0.89 | 0.46 |
| 5 | 48 | 0.162 | 0.163 | 0.177 | 1.06 / 1.06 / 1.21 | 0.85 / 0.85 / 0.85 | 0.44 |

- **K1: FAIL** (accuracy: 0 of 25 cells at least 15% better; band and coverage the same as F). K1 equals F almost
  everywhere: the snapshots change ACQ inside 2015-2021 only for Germany (2020), Italy (2021), Czechia (2017).
- **K3: FAIL** (2 of 25 cells; band wider at H4 and H5).
- Look-ahead sensitivity, origins 2011-2013 with the 2014 snapshot (does not count): K1 0 of 15 cells better.
- Post-hoc (does not count): single-dominant-buyer countries only (BG, CZ, EL, PL, SK, TR, IT, DE): no pattern either
  (H2 K1 0.117 vs F 0.137, H3 0.125 vs 0.115).

**Why contracts do not predict country purchases.** (1) Contracts bind companies, not countries: country Russian
imports over the snapshot ACQ ran from 0.23 (Romania) and 0.4 (Finland) to 2.5 (Netherlands), median 0.9 - resale,
hubs and transit move gas between countries. (2) Take-or-pay was soft: shortfalls carry forward, prices and floors
were renegotiated (Czechia's arbitration, the Turkish importers' 2021 deficits, 2018 EU settlement). (3) Over
2015-2021 the contract paths were almost flat, so they add nothing that 2021 held flat does not already have.
**Contract history before 2014 is too thin**: no dated snapshot exists, so 2010-2013 origins are not evaluated.

## 3. On the site (before/after, 2022-2026, site model)

Gas part = `fossil_share x gas mix` of each buyer's 2019-2021 purchases (Germany 0.36, Italy 0.48, Austria 0.62,
Czechia 0.41, Slovakia 0.43, Hungary 0.43, Poland 0.15, Bulgaria 0.24, Greece 0.19, Serbia 0.27, Moldova 0.28,
Finland 0.06, Netherlands 0.21, France 0.25, Slovenia 0.05, Romania 0.10, Türkiye 0.22; Estonia 0.06 but no contract).
Non-gas keeps its current band; combined with rho 0.26 as in `contract_lng()`.

**A. Full contract baseline** (central: Poland 0 from 2023, Hungary 4.5 bcm, Greece 2/3; gas band = the measured K1
band [0.60-1.59] at H1 to [0.63-1.81] at H5, plus renewal ranges). EUR bn, 2022-2026; width = net range in % of GDP:

| Country | no-war before | after | net before -> after | width before -> after | net group before -> after |
|---|---|---|---|---|---|
| Germany | 183.3 [144.4-229.9] | 183.3 [143.4-252.8] | +152.6 | 2.36 -> 2.50 | certain |
| Italy | 82.0 [53.4-123.0] | 82.0 [58.0-125.9] | +34.4 | 2.15 -> 2.15 | certain |
| Austria | 17.0 [11.1-25.5] | 17.0 [11.9-27.4] | +2.08 | 3.56 -> 3.64 | leaning (0.68 -> 0.69) |
| Czechia | 27.6 [22.9-38.4] | 27.6 [21.8-40.5] | +7.91 | 5.17 -> 5.43 | certain |
| Slovakia | 14.9 [12.8-18.6] | 14.9 [11.8-21.4] | +0.17 | 8.75 -> 9.39 | too close to call |
| Hungary | 18.2 [14.9-22.5] | 14.1 [11.0-25.8] | -11.40 -> -13.64 | 9.05 -> 9.76 | certain (Russia's side) |
| Poland | 74.0 [59.2-112.4] | 65.9 [53.1-101.6] | +37.45 -> +34.56 | 4.99 -> 4.71 | certain |
| Bulgaria | 12.8 [8.4-19.2] | 12.8 [8.0-18.9] | +3.05 | 7.29 -> 7.27 | certain (0.95) -> leaning (0.94) |
| Greece | 19.1 [12.5-28.7] | 17.9 [12.1-27.6] | +0.16 -> -0.43 | 5.05 -> 4.84 | essentially zero -> too close to call (Russia's side) |
| Serbia | 8.4 [5.5-12.6] | 8.4 [5.7-12.4] | -1.01 | 4.84 -> 4.66 | leaning |
| Moldova | 4.6 [3.9-6.5] | 4.6 [3.7-6.6] | +1.03 | 11.95 -> 12.08 | certain |
| Finland | 43.1 [31.0-64.4] | 43.1 [31.5-63.7] | +23.08 | 7.25 -> 7.13 | certain |
| Netherlands | 88.9 [57.9-133.3] | 88.9 [59.4-130.5] | +54.13 | 5.19 -> 5.07 | certain |
| France | 67.9 [44.3-101.9] | 67.9 [47.7-99.9] | +43.65 | 1.53 -> 1.48 | certain (Russia's earnings: leaning -> certain) |
| Slovenia | 2.0 [1.1-5.5] | 2.0 [1.2-5.4] | +0.41 | 3.35 -> 3.24 | leaning |
| Romania | 21.5 [14.0-32.2] | 21.5 [14.5-31.7] | +8.77 | 3.59 -> 3.49 | certain |
| Türkiye | 117.8 [97.2-169.5] | 117.8 [91.0-168.5] | -32.78 | 5.02 -> 5.08 | certain (Russia's side) |

World "paid" (central change, all countries) 137.1 -> 131.3; Russia's earnings change the same way. Three group
changes (Bulgaria net, France Russia's earnings, Greece net). Estonia, Latvia, Lithuania, Bosnia, North Macedonia,
Switzerland: no contract found, unchanged.

**The start-year range does not shrink.** For Slovakia, Estonia and Moldova the "alternative baseline" range in the
site (`triple()`: `b = [min(base_range[0], years_lo[0]/pidx_hi[0], base), max(...)]`) equals the range of the 2021
value itself (customs and price uncertainty of 2021). Removing the gas part of `base_range` (variant
`contract_full_and_base_range`) changes nothing: a contract does not narrow it.

**B. Central changes only** (current bands kept): Poland -8.1bn no-war (net +37.45 -> +34.56, certain stays),
Hungary -4.1bn (net -11.40 -> -13.64, certain), Greece -1.3bn (net +0.16 -> -0.43: essentially zero -> too close to
call, Russia's side). Poland alone: world paid 137.1 -> 134.2, no group change.

**C. Ukrainian transit end as a forced loss** (current path; would-have = 2024 volume through Ukraine, Austria x0.85
after the OMV halt, ±15%; less what still arrived by TurkStream; at the no-war gas price):

| Country | lost bcm 2025 / 2026 (annualised) | no-war 2022-26 before -> after | net before -> after | net group |
|---|---|---|---|---|
| Slovakia | 0.97 / 1.02 (3.57 would-have, 2.6 rerouted) | 14.9 -> 14.5 | +0.17 -> -0.04 | too close to call -> essentially zero |
| Austria | 3.48 / 3.50 | 17.0 -> 15.2 | +2.08 -> +1.33 | leaning -> too close to call |
| Italy | 4.89 / 5.20 | 82.0 -> 79.5 | +34.43 -> +33.43 | certain |
| Czechia | 1.79 / 1.79 (low end 0) | 27.6 -> 26.7 | +7.91 -> +7.57 | certain |
| Hungary, Moldova (right bank), Slovenia | 0 | - | - | - |

World paid 137.1 -> 134.8. Russia's earnings: Austria -2.43 -> -3.18, Slovakia -0.91 -> -1.12, Czechia +3.60 -> +3.25,
Italy +18.76 -> +17.76.

## 4. Special cases and how they count

- **Ukraine's transit end (1 Jan 2025)**: Ukraine's decision, not the buyers'. Under the round-52 principle it is
  forced on them and can count neither way (C above). Doubt: the transit contract's end-2024 date was known before the
  war, so even without the war its renewal was uncertain (Nord Stream 2 would have offered another route; Slovakia's
  and Austria's delivery points could have moved). The would-have level here is the buyers' own 2024 purchases, a
  wartime revealed choice, as round 51 used.
- **Austria / OMV**: Gazprom halted OMV on 16 Nov 2024 after OMV offset an arbitration award; OMV terminated on
  11 Dec 2024 (its choice). Russian gas kept reaching Austria at Baumgarten in slightly smaller volumes until the
  transit end, so the would-have is 85% of 2024.
- **Russia's 2022 cut-offs stay counted** (foreseeable answer to sanctions), as the site already does.
- **Rouble-payment cut-offs are counted as choices** (the buyers refused the payment scheme): PGNiG/Poland and
  Bulgargaz (27 Apr 2022), Gasum/Finland (21 May), GasTerra/Netherlands (31 May; contract ended 1 Oct 2022 anyway,
  about 2 bcm), Orsted/Denmark and Shell Energy/Germany (1 June). Latvia (30 July 2022, "conditions") similar.
- **Poland**: its Yamal contract would have ended in 2022 anyway; PGNiG notified non-renewal in November 2019 and
  built Baltic Pipe. This is the one contract fact that is a documented pre-war decision. Round 8 already holds it
  as `central_alternative` in `fuel_volume_cf.json` (not applied).
- **Hungary and Greece**: new, smaller contracts signed in September 2021 and January 2022. Hungary bought more than
  4.5 bcm in every war year (8.5, 6.6, 5.0, 5.3), so its contract is not a ceiling: B overstates Hungary's shift.
- **Moldova**: the 2021 contract (to Oct 2026, ~3 bcm incl. Transnistria) has no right-bank quantity; the site's own
  right-bank band is unchanged. Transnistria's loss of transit gas in 2025 is not in Moldova's figure.

## 5. Doubts

- Contract volumes are mostly unpublished; the back-test rests on chart readings of two Cedigaz snapshots (±0.5 bcm).
- Eurostat's partner attribution is weak where gas is bought at hubs (Netherlands, Romania, Finland), and four
  countries had to be dropped (Austria, Denmark, Croatia, UK).
- The renewal rule (central = renewal) is a choice; in 2015-2021 most expiring contracts were renewed, but not where
  the buyer had an alternative (Lithuania, Estonia after 2015).
- The gas value share uses the 2019-2021 mix and the 2019-2021 average volume as reference (as `pre_war_fuel_split()`).
- The transit loss uses ±15% around the would-have level (judgement) and the site's final-use volumes (energy2.json)
  for 2024-2026, whose 2026 is January-August.

## Recommendation

1. Do not adopt the contract baseline as the no-war central or band for pipeline gas: it fails the rule, and its
   measured band would widen most ranges.
2. If the owner wants contract facts in the figure, the defensible one is **Poland's announced end of the Yamal
   contract** (B, Poland only): a pre-war decision, A-grade sources, no group change.
3. The **transit end as a forced loss** (C) follows the round-52 principle mechanically; whether its end was
   "forced" or foreseeable is the owner's call (see 4).
