# Refined estimates for four guessed inputs

File: `refine.json`. Gathered 2026-10-18. Not yet reviewed by a person. Ranges are meant as about 90%.

Scripts are in `working/refine/scripts/`:
- `bars.py` reads values off KSE stacked-bar charts from the bar geometry.
- `rot_tables.py` parses the KSE top-10 ship-manager tables.
- `shipping_control.py` computes the shipping shares.
- `ct_fetch.py` and `reexport_hs4.py` run the HS4 re-export match.
- `togo.py` and `togo_final.py` build the Togo split.
- `gold.py` builds the gold shares.
- `assemble.py` and `finalize.py` write the output.

Downloaded reports and Comtrade extracts are in `working/refine/dl/`.

## Summary

| guess | old | new (central, range) | how much it moved |
|---|---|---|---|
| UAE foreign share of shadow-fleet freight | 0.55 | 0.15 (2022), 0.20 (2023), 0.25 (2024), 0.32 (2025), 0.20 (2026); about 0.05-0.45 overall | large: UAE freight about 0.3x the current model in 2022-24, 0.2x in 2025, 0.1x in 2026 |
| India / China / Hong Kong foreign share | 0.55 (same assumption) | IND 0.45-0.55, CHN 0.80, HKG 0.65 | India freight 0.2-0.6x from 2023, China and Hong Kong 0.6-0.8x |
| Freight per barrel | pool 2026 Jan-Aug USD 9.7bn | USD 11.0bn (8.5-14); 2022-25 confirmed | small |
| Re-export shares | ARM 0.87, KAZ 0.75, KGZ 0.9, TUR 0.4, UZB 0.4, AZE 0.75, SRB 0.4 | ARM 0.86-0.92, KAZ 0.77-0.84, KGZ 0.60-0.77, TUR 0.31-0.36, UZB 0.61-0.83, AZE 0.36-0.43, SRB 0.37-0.48 | moderate: AZE and KGZ down, UZB up, Turkey a bit down, others confirmed |
| Togo fuel buyers | NGA 0.18, AGO 0.17, CIV 0.10 ... (half prior) | NGA 0.32 (0.20-0.51), CMR 0.12, COD 0.10, AGO 0.07, BEN 0.05 ... | moderate |
| Hong Kong gold onward share to mainland | 0.30 / 0.55 / 0.85 | 0.57 (2022), 0.55 (2023), 0.48 (2024), 0.37 (2025, range 0.17-0.58) | moderate, falling over time |
| UAE gold first destinations | other 0.50, TUR 0.32, CHE 0.07, HKG 0.03, IND 0.02 | HKG 0.30, IND 0.19, CHE 0.15 (0-0.35), TUR 0.14, SAU 0.08, other 0.08 | large change in the split |

## 1. Who controls the shadow fleet

**Evidence used:** KSE Institute publishes monthly shadow-fleet volumes by the country of the ship or commercial manager (Apr 2022 to Aug 2026). These values were read from the chart geometry of the September 2026 tracker, to about ±16 kb/d, and checked against KSE's own labels (for example Aug 2026: China 42%, Russia 22%). KSE also names the top-10 managers every month in its Russian Oil Tracker, and 37 issues were parsed.

**UAE-managed shadow volume:**

| year | kb/d | share of all seaborne crude and products |
|---|---|---|
| 2022 | 723 | 12% |
| 2023 | 1,096 | 18% |
| 2024 | 1,081 | 18% |
| 2025 | 550 | 10% |
| 2026 Jan-Aug | 376 | 7% |

**Most of this is the Sovcomflot chain:**
- Sun Ship Management and Oil Tankers SCF Mgmt. OFAC identified both as beneficially owned by the Russian state through Sovcomflot. In 2023 they carried 34% of all shadow volume, and in April 2022 Sun Ship carried 74% of shadow crude.
- Stream Ship Management (46 ex-Sovcomflot tankers, and 28 of KSE's 45 "core" crude tankers in H1 2024), Fornax (23 ex-Sovcomflot tankers) and Avebury (took Stream ships in October 2024).
- Nova, Dreamer, Greenlight, Albatross, Grace, Lynx and Twister. KSE and the Ukrainian GUR register describe these as operators of former Sovcomflot tankers.

**Russian-controlled share of UAE-managed volume.** These counts cover named top-10 managers only, so they are lower bounds:

| year | named Sovcomflot-chain managers | plus probable Russian-linked |
|---|---|---|
| 2023 | 73-89% | – |
| 2024 | 69% | +10% |
| 2025 | 57% | +21% (Moonlight, Sterling, Starfish: owners unclear) |
| 2026 | about 80% | – |

**Foreign share used (central, range):**

| year | foreign share |
|---|---|
| 2022 | 0.15 (0.05-0.30) |
| 2023 | 0.20 (0.10-0.30) |
| 2024 | 0.25 (0.15-0.35) |
| 2025 | 0.32 (0.18-0.45) |
| 2026 | 0.20 (0.10-0.32) |

**Hong Kong, China and India:**
- **Hong Kong (0.65, range 0.40-0.85).** Sovcomflot-chain tankers are registered to Hong Kong-named shells (Comitana, Insania, Vimena, Anchorstar Shipping HK). Hong Kong is therefore set below mainland China.
- **China (0.80, range 0.60-0.92).** Chinese managers mainly run Kozmino-China voyages for private Chinese owners such as Sunne, Prominent and Searun. There are also serial single-ship managers on sanctions lists (Kun Lun Shan, Wu Gong Shan and similar). Their owners are unknown.
- **India (0.45-0.55, range 0.20-0.80).** In 2022-23 Gatik's 58-tanker fleet was suspected of a Rosneft link. Later Indian managers are mostly technical managers for Seychelles and Marshall Islands companies whose owners are unknown.

**A second finding: the model's gross shares are too large.** The KSE volumes show that the current model gives the UAE (13-17% of the pool in 2023-26) and India (7-9%) too large a share of the freight pool. This holds even before the Russian carve-out: KSE puts India-managed shadow volume at 3-4% of seaborne exports. `freight_scale_vs_current_model` combines both corrections:

| | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|
| ARE | 0.31 (0.08-0.77) | 0.28 (0.11-0.53) | 0.27 (0.13-0.48) | 0.20 (0.09-0.35) | 0.08 (0.03-0.16) |
| IND | 1.0 (0.6-1.5)* | 0.62 (0.35-0.97) | 0.17 (0.07-0.30) | 0.27 (0.12-0.49) | 0.23 (0.10-0.41) |
| CHN | 1.0 (0.6-1.5)* | 0.68 (0.41-1.01) | 0.82 (0.49-1.18) | 0.72 (0.43-1.04) | 0.77 (0.46-1.10) |
| HKG | 1.0 (0.6-1.5)* | 0.65 (0.37-0.99) | 0.67 (0.33-1.09) | 0.58 (0.29-0.96) | 0.62 (0.31-1.02) |

\*KSE's shadow series misses tankers that still had G7 insurance in 2022, and in part of 2023. For China, Hong Kong and India the model value is therefore kept in 2022 and given half weight in 2023.

**How to apply it:** multiply the hub's freight, and the insurance, management and finance items that follow owner shares, by this factor. Move the removed amount to the Russian pool, not to any foreign country.

**What is still open:** Seychelles-registered owners carried 11-13% of seaborne volume in 2024-25 (KSE registered-owner chart). In the model they sit inside the small "other shadow" pool, and are probably Russian- or hub-backed.

**Freight per barrel:** Long-haul crude rates implied by the pools for 2022-2025 (USD 7-12/bbl) match the quotes:
- Primorsk to West Coast India was USD 12/bbl from December 2023 to February 2024.
- 2025 rates were USD 5-8m per voyage.

In 2026 rates rose after the Strait of Hormuz closed:
- March 2026: Aframax from the Baltic USD 20-23m, about USD 28-31/bbl.
- April 2026: USD 16m, about USD 22/bbl.
- Early September 2026: Novorossiysk to India USD 23.2/bbl and to China USD 25.7/bbl, both records.

These average about USD 17-18/bbl for January to August, so the 2026 crude pool rises from USD 9.7bn to 11.0bn (8.5-14).

## 2. Re-export shares

No hub except Uzbekistan flags re-exports to Russia in Comtrade, and Uzbekistan's flagged amount is negligible. No study gives hub-level shares. The shares are therefore now measured from 4-digit (HS4) trade data in UN Comtrade for 2019 and 2021-2025: 294 queries covering the manufactured chapters.

**Method:**
1. For each heading, the matched increase is the smaller of two figures, both measured against the 2019/2021 average: the rise in exports to Russia, and the rise in imports from non-Russian partners.
2. Each heading is weighted by how far the hub was a pure importer before the war: w = 1 − (exports to non-Russian partners ÷ imports from them) in the base years. A heading the hub already exported to the rest of the world counts as home production.
3. The share is the weighted HS4 match divided by the HS2 match. It therefore plugs straight into `reexports.json` in place of the old hub share.
4. Years are pooled 60/40 with the hub mean.

**Validation:**
- **Armenia:** the weighted match explains 80-90% of the rise in exports to Russia. The finance ministry gives 87% for H1 2023, and about 80-94% for January-September 2023.
- **Turkey:** the weighted share of the increase is 27-33%. S&P Global finds 30-50% foreign origin for high-priority goods. Turkey's result is lower, as expected for consumer goods.

| hub | old | 2022 | 2023 | 2024 | 2025 | 2026 |
|---|---|---|---|---|---|---|
| ARM | 0.87 | 0.86 (0.73-0.99) | 0.88 (0.75-1.0) | 0.90 (0.77-1.0) | 0.92 (0.78-1.0) | 0.92 (0.66-1.0) |
| KAZ | 0.75 | 0.77 (0.65-0.89) | 0.84 (0.71-0.97) | 0.82 (0.70-0.94) | 0.84 (0.71-0.96) | 0.84 (0.60-1.0) |
| KGZ | 0.9 | 0.72 (0.54-0.90) | 0.77 (0.58-0.96) | 0.75 (0.57-0.94) | 0.60 (0.45-0.75) | 0.60 (0.38-0.82) |
| TUR | 0.4 | 0.34 (0.20-0.55) | 0.31 (0.18-0.51) | 0.31 (0.17-0.51) | 0.36 (0.21-0.57) | 0.36 (0.18-0.63) |
| UZB | 0.4 | 0.83 (0.62-1.0) | 0.67 (0.50-0.84) | 0.61 (0.46-0.77) | 0.61 (0.39-0.84) | 0.61 (0.39-0.84) |
| AZE | 0.75 | 0.42 (0.31-0.52) | 0.38 (0.28-0.47) | 0.43 (0.32-0.54) | 0.36 (0.27-0.45) | 0.36 (0.23-0.50) |
| SRB | 0.4 | 0.45 (0.32-0.66) | 0.37 (0.25-0.57) | 0.43 (0.28-0.68) | 0.48 (0.33-0.74) | 0.48 (0.28-0.82) |

**Caveats:**
- **Kazakhstan:** import records for 2021-22 are incomplete, so the 2022 share rests on a small HS2 match.
- **Uzbekistan and Azerbaijan:** both have small flows (USD 0.1-0.4bn matched), so their yearly shares are noisy.
- **Kyrgyzstan:** imports are under-recorded and the 2025 match is small.
- **What the weighting cannot see:** it uses pre-war net trade, not product-level origin. A heading in which a hub both makes and re-exports goods is split by the weight only.

## 3. Togo's fuel buyers

The fuel India declares to Togo is gasoil and diesel (HS 271019), not gasoline:

| year | USD bn |
|---|---|
| 2022 | 4.8 |
| 2023 | 3.2 |
| 2024 | 2.1 |
| 2025 | 1.7 |

Importers record India as the origin, not Lomé, so plain mirror data miss most of it.

**Origin reconciliation:** for each West and Central African importer, the cargo India declared elsewhere is estimated as imports recorded from India, minus India's recorded direct exports to that country, plus imports recorded from Togo. In 2023 this traces USD 2.78bn of the 3.24bn:

| buyer | share |
|---|---|
| Nigeria | 53% |
| DR Congo | 15% |
| Cameroon | 12% |
| Congo | 6% |
| Benin | 5% |

**Other years:**
- **2022:** importers' records are incomplete, so it is half its own reconciliation and half the 2023 structure.
- **2024-25:** the Dangote refinery cut Nigeria's diesel imports. India's direct gasoil exports to Nigeria fell from USD 1.3bn to 0.2bn and then to 0.02bn. These years use 70% importers' mirror data (Angola, Ghana, South Africa, Benin, Congo, Côte d'Ivoire) and 30% the 2023 structure.

Years are weighted by India's exports to Togo, and 5% is left as "other" for Europe-bound part-cargoes.

**Result:**

| buyer | central | range |
|---|---|---|
| Nigeria | 0.32 | 0.20-0.51 |
| Cameroon | 0.12 | – |
| DR Congo | 0.10 | – |
| Angola | 0.07 | – |
| Benin | 0.05 | – |
| Congo | 0.04 | – |
| Cape Verde | 0.04 | – |
| Ghana | 0.03 | – |
| about 12 smaller buyers plus "other" (0.05, range 0-0.15) | about 0.23 | – |

Argus and Nigerian press (S&P Global data) confirm that Lomé ship-to-ship transfers mainly serve Nigeria, then Ghana and the Gulf of Guinea. No Kpler or Vortexa destination split was found in public sources.

## 4. Gold

**Hong Kong onward share:** Russian gold is fungible inside Hong Kong's gold trade, so its onward share is taken as Hong Kong's own pass-through to the mainland.

| year | gross onward share | net onward share | Hong Kong imports from Russia (USD bn) |
|---|---|---|---|
| 2022 | 0.58 | 0.55 | 0.6 |
| 2023 | 0.56 | 0.53 | 5.2 |
| 2024 | 0.52 | 0.43 | 4.6 |
| 2025 | 0.46 | 0.29 | 10.5 |

- **Gross onward share:** exports to China ÷ gold imports.
- **Net onward share:** the same after taking off imports from China.
- **Why the shares fall:** Hong Kong kept 13-33% of its gold imports, and gold coming back from the mainland grew to USD 10.8bn (2024) and 23.6bn (2025).
- **Central:** the mean of the gross and net shares.
- **High:** China's share of Hong Kong's gold exports. This applies if Russian bars go mainly to China.

**UAE gold destinations:** These come from importers' records of gold (HS 7108) bought from the UAE, weighted by the yearly flow of Russian gold through the UAE. For all UAE gold the first-stop shares are:

| destination | share |
|---|---|
| Switzerland | 31% |
| Hong Kong | 23% |
| India | 15% |
| Turkey | 11% |
| Saudi Arabia | 6% |

The old proxy was mostly Iraq, Oman and Qatar, and missed Hong Kong and India.

**Switzerland adjustment:** Switzerland bans Russian-origin gold, so for the Russian component the central halves the Swiss share (low 0, high the full share). The freed share goes to markets that take Russian bars openly.

**Result:**

| destination | central | range |
|---|---|---|
| Hong Kong | 0.30 | – |
| India | 0.19 | – |
| Switzerland | 0.15 | 0-0.35 |
| Turkey | 0.14 | – |
| Saudi Arabia | 0.08 | – |
| other | 0.08 | – |

## Still weak

1. Owners of non-Sovcomflot UAE, Indian, Chinese and Seychelles shadow tankers. Sanctions lists name managers and registered owners, not the ultimate owners.
2. The KSE series is read from charts, counts only shadow tankers, and uses manager country rather than the owner's country.
3. The re-export weights rest on net trade, not product-level origin. Kyrgyzstan, Kazakhstan and Uzbekistan import records are poor.
4. Togo 2024-26 rests on thin mirror data, with no tracker data on ship-to-ship transfers.
5. The Hong Kong and UAE gold splits treat Russian gold as fungible. Nothing tracks Russian bars specifically.

## Sources

Full name, URL and date for each source are in `refine.json` under each block's `sources`. The main ones:
- KSE Institute: Shadow Fleet Trackers (March and September 2026); Russian Oil Tracker issues (June 2023 to September 2026); *Assessing Russia's Shadow Fleet* (June 2024); *The Core of Russia's Shadow Fleet* (August 2024); new shadow tankers review (September 2025).
- GUR War&Sanctions vessel register.
- Reuters freight reports via Baird Maritime and MarineLink.
- Kommersant freight data.
- UN Comtrade public preview API: HS4 hub trade; HS 271019 India and West Africa; HS 7108 Hong Kong and the UAE mirror.
- Armenpress and Azatutyun (Armenian finance ministry).
- S&P Global (Turkey high-priority goods; Lomé gasoline).
- Argus (Lomé ship-to-ship transfers).
- New Telegraph and Nairametrics (Nigeria fuel via Lomé).
- Reuters via The New Arab (Russian gold to the UAE).
