# Gas flows on TurkStream's European leg and at Baumgarten (ENTSOG), as a cross-check (round 43)

Data file: `research/2026-10/gaps/entsog_r43.json`. Generated 2026-10-24.
Built by [`scripts/entsog_r43.py`](../scripts/entsog_r43.py) from `raw/entsog/entsog_physical_flow_monthly_*.json`, which [`pipeline/fetch/epdk_entsog.py`](../../../pipeline/fetch/epdk_entsog.py) writes. Run from the repository root: `python3 -I research/2026-10/scripts/entsog_r43.py`.

This is a cross-check: a second official measurement of volume, from the transmission operators' meters. The site's figures come from Eurostat (origin-reported) and from customs (Comtrade). ENTSOG gives no origin. Nothing here is read by the build. Three site figures look too high or too low; they are listed under "Proposed build changes".

## Summary

| country | site figure (`energy2.json` `transit_gas` `gas_from_rus_bcm`) | ENTSOG | verdict |
|---|---|---|---|
| Serbia + Bosnia | 3.22 / 2.88 / 2.63 / 2.86 / 1.65 bcm (2022–2026 Jan–Aug) | net TurkStream intake 3.12 / 2.79 / 2.53 / 2.59 / 1.49 | **Confirms** (ENTSOG is 0.90–0.97 of the site) |
| North Macedonia | 0.29 / 0.36 / 0.33 / 0.17 / 0.08 | its only entry point: 0.28 / 0.36 / 0.35 / 0.32 / 0.14 | **Confirms 2022–24.** 2025–26: ENTSOG is about twice the site, but origin cannot be separated |
| Hungary | 8.49 / 6.64 / 5.00 / **6.30** / **4.35** | 2022–23 bounds 5.0–9.0 / 5.1–7.5; 2024 5.18; **2025 5.34; 2026 3.50** | Confirms 2022–24. **2025 and 2026 are below the site's range** |
| Greece | 1.00 / 2.11 / 3.34 / 2.02 / 0.94 | net pipeline entry from Bulgaria 0.32 / 1.10 / 3.15 / 2.57 / 1.22 | 2024 confirms. 2022–23: the rest is Russian LNG, not separable. 2025–26: ENTSOG is 27–30% above the central, inside the range |
| Austria | 6.61 / 4.45 / **5.26** / 0.02 / 0.00 | bounds 2.6–10.3 / 2.2–6.6 / **3.8–4.5** / 0–0.04 / 0–0.01 | **2024: the site's central is above the physical upper bound.** Other years inside |
| Bulgaria | 1.21 / 0 / 0 / 0.2 / 0.13 | upper bound 1.79 / 0.92 / 2.01 / 2.07 / 1.27 | **Cannot separate** Russian from other gas. The upper bound comes from TurkStream gas left in Bulgaria plus BOTAŞ deliveries |

**Other points:**
- TurkStream's European leg (Strandzha 2) carried **12.5, 13.2, 16.2 and 17.6 bcm** in 2022–2025, and 11.5 bcm in January–August 2026.
- **The platform keeps only five years.** Data start on 2021-11-01, so the API cannot measure any pre-war year.

## 1. Data

- **Endpoint:** `transparency.entsog.eu/api/v1/operationalData`, indicator "Physical Flow", `periodType=day`, from 2021-11-01, one query per point and direction, `limit=-1`.
  - Values are in kWh/d (GCV) per gas day (06:00–06:00 CET).
  - The fetcher sums them into calendar months by the gas day's start date and stores months, not days. The file is 87 KB.
- **Conversion to bcm:** 10.64 kWh/m³. That is Eurostat's GCV of the Russian gas Türkiye reports (TJ GCV per million m³, 2021–2024 mean, 38.3 MJ/m³ at 15 °C). With ENTSOG's own 10.55 kWh/m³, the volumes would be about 0.9% higher.
- **Points (44 point-directions).** Each has the key that answered and the flow status (Confirmed or Provisional) in `points`.
  - Where one side of a point gave no data, the other side was used:
    - Sidirokastro is measured on the Greek side, as is Kulata.
    - Horgoš is measured on the Hungarian side.
    - Baumgarten is measured on the Slovak side. The Austrian side gives nothing.
    - Austria's exits are measured on the receiving side: Germany, Italy and Slovenia.
  - **No data:** Zvornik (Serbia–Bosnia), and the Serbian sides of Kireevo and Horgoš.

**Annual flows, TWh / bcm**

| point (direction) | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|
| Strandzha 2, TR→BG (TurkStream) | 133.4 / 12.54 | 141.0 / 13.25 | 172.4 / 16.20 | 186.7 / 17.55 | 122.6 / 11.53 |
| Strandzha 1, TR→BG (BOTAŞ) | 0 | 5.2 / 0.49 | 18.8 / 1.77 | 19.2 / 1.81 | 5.2 / 0.49 |
| Kireevo, BG→RS | 80.9 / 7.60 | 89.5 / 8.41 | 108.3 / 10.18 | 110.8 / 10.42 | 70.5 / 6.62 |
| Kalotina, BG→RS (interconnector, Azeri gas) | 0 | 0 | 1.2 / 0.11 | 2.6 / 0.24 | 1.3 / 0.12 |
| Kulata/Sidirokastro, BG→GR | 8.7 / 0.82 | 14.6 / 1.38 | 33.5 / 3.15 | 27.5 / 2.59 | 13.4 / 1.26 |
| Kulata/Sidirokastro, GR→BG | 5.3 / 0.50 | 2.9 / 0.27 | 0 | 0.2 / 0.02 | 0.4 / 0.04 |
| Kyustendil, BG→MK | 3.0 / 0.28 | 3.8 / 0.36 | 3.7 / 0.35 | 3.4 / 0.32 | 1.5 / 0.14 |
| Negru Vodă I, BG→RO (Trans-Balkan) | 20.0 / 1.88 | 27.8 / 2.61 | 23.9 / 2.24 | 41.2 / 3.87 | 27.9 / 2.62 |
| IGB→Bulgartransgaz, Stara Zagora | 4.8 / 0.45 | 15.4 / 1.45 | 9.4 / 0.89 | 10.7 / 1.00 | 7.9 / 0.75 |
| Horgoš, RS→HU | 52.4 / 4.92 | 61.5 / 5.78 | 82.7 / 7.78 | 84.7 / 7.96 | 56.5 / 5.31 |
| Kiskundorozsma, HU→RS | 4.7 / 0.44 | 1.6 / 0.15 | 1.2 / 0.12 | 1.4 / 0.13 | 1.8 / 0.17 |
| Balassagyarmat, HU→SK | 2.8 / 0.26 | 6.9 / 0.65 | 27.6 / 2.60 | 27.9 / 2.62 | 19.3 / 1.81 |
| Bereg, HU→UA | 4.9 / 0.46 | 14.2 / 1.33 | 20.0 / 1.88 | 31.9 / 3.00 | 9.0 / 0.84 |
| Mosonmagyaróvár, AT→HU | 35.7 / 3.35 | 24.5 / 2.30 | 0.3 / 0.02 | 30.1 / 2.83 | 7.2 / 0.68 |
| Baumgarten, SK→AT | 194.9 / 18.32 | 84.5 / 7.95 | 106.7 / 10.03 | 0.4 / 0.04 | 0.1 / 0.01 |
| Arnoldstein, AT→IT | 116.2 / 10.92 | 26.9 / 2.52 | 57.7 / 5.42 | 7.0 / 0.65 | 11.2 / 1.05 |
| Murfeld, AT→SI | 11.4 / 1.07 | 6.6 / 0.62 | 7.1 / 0.67 | 8.8 / 0.83 | 5.7 / 0.54 |
| Oberkappel, DE→AT | 56.9 / 5.35 | 27.8 / 2.61 | 4.8 / 0.45 | 69.5 / 6.53 | 47.1 / 4.43 |

The verification notes' sums match (Strandzha 2: 133 / 141 / 172 / 187 TWh; Kireevo: 81 / 90 / 108 / 111; Horgoš 2025: 84.7; Sidirokastro 2025: 27.5).

## 2. Derived volumes and what they say

### Serbia + Bosnia: confirms

- **Formula:** Kireevo (BG→RS) − Horgoš (RS→HU) + Kiskundorozsma (HU→RS). This is the TurkStream gas that stays in Serbia, plus what it passes to Bosnia (Zvornik has no data).
- Kalotina (the Bulgaria–Serbia interconnector, Azeri gas from late 2023) is kept apart.
- **Result:** 3.12 / 2.79 / 2.53 / 2.59 / 1.49 bcm, against the site's Serbia + Bosnia figures of 3.22 / 2.88 / 2.63 / 2.86 / 1.65. The ratio is 0.97 / 0.97 / 0.96 / 0.91 / 0.90.
- The small gap in 2025–26 is within the site's range. The site's 2025 figure is Comtrade × the Eurostat/Comtrade ratio. Serbian storage (Banatski Dvor) and own production (about 0.3 bcm) are not in the ENTSOG balance.

### North Macedonia: confirms 2022–24; 2025–26 cannot be separated

- Kyustendil/Zidilovo is the country's only pipeline entry.
- 2022–24 match the site to within 6%.
- 2025–26: 0.32 and 0.14 bcm entered, against the site's 0.17 and 0.08, which are customs-based and include non-Russian purchases routed through Bulgaria.
  - ENTSOG cannot tell TurkStream gas from BOTAŞ or IGB gas carried through Bulgaria.
  - If it was all Russian, the site would be about 0.15 bcm (about EUR 0.07 bn) low in 2025. The site's high case (0.322) already allows this.

### Hungary: confirms 2022–24; 2025 and 2026 are below the site's range

- **Russian gas reaching Hungary** = Horgoš (RS→HU) + Bereg (UA→HU) − what Hungary passes to Slovakia (Balassagyarmat HU→SK).
  - Slovakia's SPP takes its Gazprom gas through TurkStream and Hungary from 2025. In 2024 the flow to Slovakia was already 2.6 bcm.
  - In 2022–23 Hungary also took Russian gas through Austria (Mosonmagyaróvár) and Slovakia, while Baumgarten carried it. These entries are added for the upper bound, because they also carried hub gas.
- **Exports to Ukraine** (Bereg HU→UA: 1.9 bcm in 2024, 3.0 bcm in 2025) are shown apart. Legally they are non-Russian gas: in 2025 they are matched by 2.8 bcm of non-Russian entries from Austria. They are not subtracted.

| bcm | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|
| ENTSOG, Russian gas kept in Hungary | 5.0–9.0 | 5.1–7.5 | **5.18** | **5.34** | **3.50** |
| site central (range) | 8.49 (7.67–9.31) | 6.64 (6.35–6.87) | 5.00 (4.06–7.24) | **6.30 (5.80–7.00)** | **4.35 (3.90–5.00)** |

- **2024.** ENTSOG backs the site's choice of 5.0 (between Eurostat's 4.06 and customs' 7.24). Customs probably include the gas passed on to Slovakia and Ukraine.
- **2025.** The site uses Szijjártó's statement that 8–8.5 bcm arrived and about 2 bcm went on to Slovakia, giving 6.0–6.5 bcm of own use.
  - ENTSOG measures 7.96 bcm arriving at Horgoš and 2.62 bcm leaving for Slovakia, so **5.34 bcm**: about 0.96 bcm (15%) below the site.
  - The balance counts entries minus exits, so gas Hungary put into storage is included.
- **2026 January–August.** 3.50 against 4.35 (CREA-scaled), 20% lower.
- At the site's own unit values, this is about **EUR 0.40 bn (2025) and EUR 0.46 bn (2026)** too much counted as Hungary's payment for Russian gas.

### Greece: 2024 confirms; 2022–23 Russian LNG not separable; 2025–26 above the central

- **Net pipeline entry from Bulgaria** at Sidirokastro (BG→GR minus GR→BG): 0.32 / 1.10 / 3.15 / 2.57 / 1.22 bcm.
- It is TurkStream gas carried through Bulgaria, mainly DEPA's Gazprom contract, possibly mixed with BOTAŞ gas.
- **2022–23.** The site's Eurostat figure (1.00 / 2.11 bcm) is origin-reported and includes Russian LNG at Revithoussa. ENTSOG's pipeline points cannot attribute LNG, so they confirm only the pipeline part.
- **2024.** 3.15 against 3.34 (0.94): confirms.
- **2025–26.** 2.57 and 1.22 against the central 2.02 and 0.94. That is 27–30% higher, inside the site's range (1.25–3.47 and 0.19–2.30).
  - If the pipeline gas is Russian, the central is about 0.55 bcm (EUR 0.20 bn) low in 2025 and 0.28 bcm (EUR 0.13 bn) low in 2026.

### Austria: 2024 central above the physical bound

- Up to the end of 2024, all Baumgarten entry gas was Russian (Ukraine and Slovakia route).
- **Lower bound:** Baumgarten minus all exits (Germany ×3, Italy, Slovenia, Hungary), if the exits took Russian gas first.
- **Upper bound:** that plus every other entry (Germany, Italy, Slovenia, Hungary). This is Austria's net import through all its points, capped by Baumgarten.
- Storage that connects only to the German grid (Haidach, 7Fields) is not visible.

| bcm | 2022 | 2023 | 2024 | 2025 | 2026 Jan–Aug |
|---|---|---|---|---|---|
| ENTSOG bounds | 2.62–10.35 | 2.19–6.58 | **3.78–4.46** | 0–0.04 | 0–0.01 |
| site central (range) | 6.61 (4.09–6.96) | 4.45 (4.21–5.61) | **5.26 (4.52–6.25)** | 0.02 | 0 |

- **In 2024 Austria's whole net import through its border points was 4.46 bcm**, and Russian gas kept was 3.78 bcm or more.
  - The site's central 5.26 bcm is the mean of CREA and 80% × consumption. It exceeds the total net import by 0.8 bcm.
  - Only a net withdrawal of gas stored in earlier years could reconcile it. That is consumption, not a 2024 purchase from Russia.
  - Gap: 0.8–1.5 bcm, or **EUR 0.30–0.55 bn**.
- 2022–23 are inside the bounds. The bounds are wide because of the 2022 storage fill and the German entries.
- 2025–26 confirm that Austria's Russian supply stopped.

### Bulgaria: cannot separate

- **Full balance.** All cross-border points, plus IGB at Stara Zagora, plus Chiren storage, gives apparent use of 2.56 / 2.64 / 2.84 / 2.80 bcm, and 1.98 bcm in January–August 2026. That matches Bulgaria's consumption, so the balance closes.
- **Its supply:**
  - IGB (Azeri): 0.45–1.45 bcm;
  - BOTAŞ at Strandzha 1 (the 2023 Bulgargaz–BOTAŞ deal): 0.49 / 1.77 / 1.81 / 0.49 bcm;
  - **TurkStream gas left in Bulgaria** (Strandzha 2 minus every onward exit): 1.79 / 0.43 / 0.24 / 0.26 / 0.78 bcm.
- **2022.** The 1.79 bcm left in Bulgaria is above the site's 1.21 (Eurostat; Gazprom stopped supplying Bulgargaz in April 2022). Some of it may be later traders' gas or storage. The site's figure is a lower bound.
- **2023–25.** Bulgaria kept 0.24–0.43 bcm a year of TurkStream gas (or the residual is line pack or measurement error). It also received 0.5–1.8 bcm of BOTAŞ gas, and BOTAŞ's own portfolio was 41% Russian in 2024 (EPDK). The site has 0 / 0 / 0.2, which follows the contract position.
  - Physically, the upper bound is 0.9–2.1 bcm.
  - The site's 2025 range (0–2.5) already covers it. The 2023–24 range (0–0) does not.
- **2026 January–August.** BOTAŞ deliveries at Strandzha 1 fell to 0.49 bcm, and TurkStream gas left in Bulgaria rose to 0.78 bcm. Bulgarian buyers seem to take gas at Strandzha 2 now. Its contractual origin is not public.
- **Strandzha 2 itself has no origin.** The European string is fed at Kıyıköy from TurkStream line 2. BOTAŞ volumes sold to Bulgaria can also be delivered there.

### Trans-Balkan (Romania, Moldova, Ukraine)

- Negru Vodă I (BG→RO): 1.88 / 2.61 / 2.24 / 3.87 / 2.62 bcm.
- The 2025 jump fits the TurkStream gas delivered to Transnistria from February 2025 (`energy2.json` `passed_on_shares` BGR 2025: `MDA_transnistria` 0.098).
- It was not compared further. ENTSOG has no Moldovan or Ukrainian destination split.

## Proposed build changes

These are cross-checks, not replacements. Two site figures look clearly wrong; the builder decides.

1. **Hungary 2025–2026 (`energy2.json` `transit_gas.countries.HUN.gas_from_rus_bcm`).**
   - Set `"2025"` central to 5.34 (low 5.0, high 6.3) and `"2026"` central to 3.50 (low 3.3, high 4.35).
   - Scale `gas_from_rus_eur_bn` `"2025"` / `"2026"` by the same ratio (×0.848, ×0.805), giving about 2.24 and 1.91 EUR bn.
   - Source: `entsog_r43.json` `derived.HUN.*.russian_entry_minus_slovakia_bcm`.
   - **Expected effect:** Hungary's `to_rus` (through the transit-gas swap) falls by about EUR 0.40 bn in 2025 and EUR 0.46 bn in 2026. "More paid to Russia" for Hungary shrinks by about EUR 0.9 bn over 2025–26. Slovakia is unchanged, because its 2.6 bcm already matches ENTSOG's 2.62 bcm to Slovakia.
2. **Austria 2024 (`transit_gas.countries.AUT.gas_from_rus_bcm["2024"]`).**
   - Set central 4.12 (low 3.78, high 4.46), the ENTSOG bounds.
   - Scale `gas_from_rus_eur_bn["2024"]` by ×0.78, giving about 1.52 EUR bn.
   - **Expected effect:** Austria's `to_rus` in 2024 falls by about EUR 0.42 bn. Italy and Slovenia take what passed through Austria (`passed_on_shares` 2023_2024): check that their shares still add up.
3. **Greece 2025–2026 (`transit_gas.countries.GRC.gas_from_rus_bcm`).** Optional: raise central `"2025"` to 2.57 and `"2026"` to 1.22, both inside the current range. Effect: about +EUR 0.20 bn (2025) and +0.13 bn (2026) for Greece.
4. **Bulgaria 2023–2024 (`transit_gas.countries.BGR.gas_from_rus_bcm`).**
   - Widen the high case from 0 to the physical upper bound: 0.92 (2023) and 2.01 (2024) bcm. Keep central 0.
   - This makes the range honest without claiming that the BOTAŞ gas was Russian. The effect is on the high side of Bulgaria's range only.
5. **Not changed:** Serbia, Bosnia and North Macedonia 2022–24, Greece 2024, Hungary 2022–24, Austria 2022–23 and 2025–26. ENTSOG confirms them, or they lie inside its bounds.
6. **Fetcher README.** `pipeline/fetch/README.md` says "The ENTSOG and World Bank APIs work but are not scripted yet". ENTSOG and EPDK are now scripted (`epdk_entsog.py`), so add a row to its table.

## Limits

- **No origin.** ENTSOG measures molecules at borders. "Russian" here means "entered through a route that carried only Russian gas": TurkStream at Strandzha 2, and Baumgarten up to 2024. BOTAŞ deliveries, IGB and LNG are not Russian by route, but BOTAŞ's portfolio is partly Russian.
- **No pre-war base.** The data start in November 2021. No-war bands for these countries cannot be built from the API. The TP Archives, IEA Gas Trade Flows, or the Bulgartransgaz/DESFA annual reports would be needed.
- **Storage.** Balances count entries minus exits. Gas put into storage counts as kept, which is right for purchases. Austria's German-connected storage and Hungary's storage cycles are not visible.
- **Provisional data.** The Hungarian and Greek points are all "Provisional". The Bulgarian ones are "Confirmed".
