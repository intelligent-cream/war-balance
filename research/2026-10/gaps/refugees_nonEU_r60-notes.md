# Refugee hosting outside the EU: people actually supported, at a non-EU cost (round 60)

File: `refugees_nonEU_r60.json`. Built by a short script from `refugees.json` (GDP per head, UNHCR person-years) and the figures below; read by `_r60_replace()` in `pipeline/build_data.py`, which replaces these hosts' entries in `refugees.json` and `refugees_net.json` as they are loaded. Checked: 29 October 2026.

## The problem (audit 63, item 1)

`refugees.json` costed every host without a budget figure as UNHCR's count of refugees from Ukraine × k × GDP per head, with k = 0.152 (0.048–0.485) calibrated on EU hosts' budgets (Germany, Poland, Czechia, the Netherlands). Outside the EU both parts overstate the host's own cost:

- **UNHCR's count is broad.** Montenegro: 64,640 at end-2023, while some 10,000 had received temporary protection by 25 December 2023 (UNHCR fact sheet, February 2024) and nearly 5,000 held it in May 2024 (UN Montenegro). More than 60,000 Ukrainians there hold ordinary residence permits or short stays and get no hosting support. North Macedonia: 19,187 in UNHCR's count, 45 granted temporary protection or humanitarian residence by September 2024. Serbia: about 1,000–2,000 protection holders against 7,000–16,000.
- **The cost rate is an EU one.** EU hosts pay accommodation, cash allowances and integration through welfare systems. Non-EU hosts pay far less per person, and much of what refugees receive there is paid by UNHCR, the EU and NGOs, which is not the host's own cost.

Before this round Montenegro's hosting was EUR 0.246bn, 3.6% of its GDP, making it first on support for Ukraine.

## What changes

1. **People.** Temporary protection holders or equivalent where published:
   - Montenegro: about 10,000 granted from March 2022 to December 2023; nearly 5,000 holding it in May 2024; in 2025, 2,529 applications and 5,487 extensions (Government of Montenegro, 29 December 2025, in the IFRC appeal's final report). Person-years 4,000 (2022, March–December) / 6,500 / 5,000 / 7,000 / 4,700 (2026, January–August), with ranges.
   - Serbia: 1,166 Ukrainians granted by 1 March 2023; 861 holders in July 2023; 355 new grants and 672 extensions in 2024 (AIDA); 1,500–2,000 present per the Belgrade Centre for Human Rights. High end for 2022–2023: the ~4,500 privately accommodated Ukrainians the Commissariat was in contact with.
   - North Macedonia: 45 granted by September 2024; 405 applications by October 2023; the August 2023 decision unimplemented by the end of 2024 (IFRC). High end allows for a rise after the 2025 extension.
   - Albania: 351 granted in March 2022; Ukrainians could also stay a year without a permit; 3,802 present at end-March 2024 (UNHCR). Low: the 2022 holders falling off; high: UNHCR's count.
   - Georgia: no temporary protection. The state pays GEL 300 per family and GEL 45 per person a month (Decree 1254, from August 2023, extended to 2026); the Ministry of Finance's 2023 report lists 1,795 families / 3,420 persons in January 2023, a few hundred families later in 2023 (this figure was read in a web-search summary of the report, not in the report itself). Tbilisi's hotel programme cost GEL 11–14m in 2022. Spending is entered directly: EUR 6m (4.5–10) in 2022, 1.5m (1–4) in 2023, 1.1m (0.4–3.3) a year in 2024–2025 (300–2,000 families, central 700), 0.7m in January–August 2026.
   - Every other middle-income non-EU host (Türkiye, Azerbaijan, Armenia, Kazakhstan, Kyrgyzstan, Bosnia and Herzegovina, Brazil, Mexico, Argentina, Colombia, Peru, Ecuador, Costa Rica, Panama, Paraguay, the Dominican Republic, the Philippines, India, China): no count of protected or supported people found; UNHCR's count × 0.15 / 0.5 / 1.0. In the hosts with both figures only 1–15% of UNHCR's count held protection or support; Türkiye's UNHCR count (2,600–5,000) is close to its international-protection applicants (2,930 in May 2025), so the high end keeps it.
2. **Cost per supported person-year** = k × GDP per head, k = 0.02 / 0.055 / 0.152:
   - Moldova's own budget spending (round4b) is EUR 6–20m a year for 73,000–142,000 refugee person-years, about k = 0.02 of its whole refugee count;
   - Montenegro's government redirected up to EUR 2m to the Interior Ministry's coordination body for people under temporary protection in 2022 (SEECheck): about EUR 500 per protection person-year, k ≈ 0.04;
   - Georgia's cash programme: about GEL 4,600 per family-year, EUR ~850 per person-year, k ≈ 0.10.
   The central is their geometric middle; the high end is the EU hosts' central rate (no non-EU host is assumed to spend more per person than the EU middle). Health care and schooling that protection holders use are not costed separately; the high end covers them.
3. **No donor share.** The new figures are the host's own spending; UN, EU and NGO money is left out by construction, so `flowback2.json`'s donor shares are not taken off (Georgia and Armenia were already exempt).
4. **The host's gain on refugees' work** (`apply_refugees_gain`) uses the new person-years, so it scales with the people counted.

Unchanged: Moldova (its own budget figures, round4b), Belarus (a label, party to the war), the EU, EFTA, the UK, the US, Canada, Japan, Australia and the high-income hosts Israel, Korea, Chile, Uruguay, New Zealand, Iceland and Liechtenstein. The panel's refugee count (`people.refugees.count`) stays UNHCR's; `supported_2025` beside it gives the people counted here.

## Effect (hosting, EUR bn, 2022 to August 2026, central)

| host | before | after | net % of GDP before → after | rank (net) before → after |
|---|---|---|---|---|
| Montenegro | 0.246 | 0.016 | +3.62 → +0.36 | 11 → 44 |
| North Macedonia | 0.090 | 0.0003 | −1.47 → −2.08 | 137 → 140 |
| Georgia | 0.121 | 0.010 | −3.71 → −4.10 | 145 → 147 |
| Serbia | 0.065 | 0.003 | −1.37 → −1.45 | 135 → 137 |
| Albania | 0.035 | 0.003 | +0.21 → +0.06 | 47 → 63 |
| Türkiye | 0.033 | 0.006 | −3.08 → −3.09 | 144 → 145 |
| Azerbaijan | 0.021 | 0.004 | −2.42 → −2.44 | 142 → 144 |

Ranks among economies above EUR 5bn GDP, not parties to the war, with data, as in `site_numbers.mjs` (round 60 build; Kosovo, added in the same round, moves most ranks below 30 down by one). Montenegro was first on support for Ukraine (3.60% of GDP) and is now 35th (0.34%).

## Open points

- Montenegro's 2022 temporary-protection stock is not published by month; 4,000 person-years (2,400–6,400) is inferred from the ~10,000 granted by December 2023 and the ~5,000 holding it in May 2024.
- Georgia's 2024–2026 caseload is not published; the range (300–2,000 families) is wide.
- k for non-EU hosts rests on three rough points; a host's own refugee budget line would replace it.
