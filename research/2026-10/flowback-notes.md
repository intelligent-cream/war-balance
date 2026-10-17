# Flowback notes: where Ukraine aid money is spent (as of 2026-10-17)

Data file: flowback.json (same folder). Raw downloads: raw/flowback/.
Certainty: B = documented figure; C = modelled share or range.

## USA (certainty B)
- $175.2bn appropriated 2022-24 (5 supplementals + $0.9bn base budget; excludes $9bn loans). Source: CSIS Cancian, 2025-02-11.
- CSIS (Feb 2025): about **90% of military aid** and **60% of all aid** was spent in the US. The rest went 25% to Ukraine and 15% globally.
- CSIS Cancian & Park (May 2024, quoted by Quincy): 86% of the military part and 72% of the $61bn April 2024 supplemental were spent in the US.
- Central estimate of money spent in the US: 0.60 x $175bn = about $105bn, or **about EUR 97bn** (range EUR 89-105bn).
- Building blocks:
  - $25.9bn appropriated for PDA replenishment, of which $16.8bn was obligated by Nov 2023.
  - USAI obligations were $10.5bn by late 2023.
  - DoD: more than $27bn of obligations reached suppliers in 37 states (Nov 2023 map).
  - Committed equipment: PDA $34.1bn, USAI $33.2bn, FMS $6.3bn.
- Since 2025:
  - The US has announced no new aid package since 2025-01-09. Kiel: US aid fell 99% in 2025.
  - The US now sells instead of giving:
    - PURL: EUR 3.7bn in 2025 (Kiel), and USD 6.7bn cumulative by 2026-07-23 (KMU), about EUR 5.8bn. More than 90% comes from US stocks.
    - FMS cases: ERAM up to $825m, funded by DK, NL and NO plus FMF. Patriot sustainment $179.1m and $105m. Satcom $150m.

## PURL payers (money to US)
| Country | Dec 2025 (Kiel, EUR) | Jul 2026 cumulative (KMU, USD) |
|---|---|---|
| Norway | >0.7bn | 1.36bn |
| Netherlands | >0.7bn (first pkg EUR 500m, Aug 2025) | 1.163bn |
| Germany | ~0.6bn | 0.9bn (+USD 200m pledged 2026-06-18) |
| Canada | ~0.55bn | 0.834bn (CAD ~892m) |
| Sweden | - | 0.546bn |
| Denmark | DKK 580m | - |
| Australia / NZ | 28.4m / 7.4m | - |
| Romania / Croatia | EUR 50m / 15m (secondary) | - |

- Joint packages:
  - Nordic-Baltic package of $500m (2025-11-13).
  - NL/UK/NO/SE package of about $500m.
  - BE/CA/LU/PT/SI/ES package (Dec 2025).
  - DE/NO/PL package (Dec 2025).
- Country shares inside these joint packages are not published.

## Europe: domestic vs abroad vs Ukraine
- No government publishes a domestic share. All per-country shares in the JSON are **C (modelled)**, and each has its reasoning attached.
- Kiel (Aug 2025): Europe allocated at least EUR 35.1bn of procurement-based aid by June 2025. The contracts went "primarily" to European and Ukrainian firms.
- Kiel KPB203 (Feb 2026): procurement in Ukraine was 4%, then 12%, then 22% of procurement-based aid (H2 2024, H1 2025, H2 2025). At least 11 donors funded Ukrainian production.
- Danish model:
  - Denmark: about EUR 830m by Dec 2025, plus DKK 1.3bn (about EUR 0.17bn) in its June 2026 package.
  - Sweden: about EUR 180m. Iceland: EUR 5.5m.
  - EU windfall profits channelled by Denmark: EUR 0.4bn (2024) and EUR 0.83bn (2025).
  - Norway and Canada pledged for 2025, but no amounts were found.
  - Parallel schemes: Dutch model about EUR 790m (2025). Germany EUR 400m for Ukrainian long-range drones.
  - Ukraine MoD: USD 6.1bn of foreign money went into Ukrainian production in 2025, of which about USD 1.8bn went through the Danish model.
- Czech ammunition initiative:
  - More than EUR 1.6bn was pledged by 15 states (May 2024).
  - Germany paid EUR 576m (2024) and EUR 300m (May 2026).
  - About 4-4.4m rounds have been delivered (worth about CZK 90bn).
  - 2026: EUR 1-1.4bn raised against a need of EUR 5bn. The number of donors fell from 18 to 9.
  - The rounds are bought mostly outside the EU (KR, TR, ZA, IN). Czechia's own budget share is small.
- France: a EUR 200m special fund (Oct 2022) for Ukraine to order directly from French industry. French aid is otherwise mostly French stocks and French industry, so the domestic share is high (C).
- UK:
  - International Fund for Ukraine: more than GBP 1bn pooled (UK about GBP 500m), including a GBP 300m contract for 152mm shells.
  - GBP 4.5bn 2025 package, presented as supporting UK industry.
- EU:
  - EPF: EUR 11.1bn for Ukraine since 2022. Reimbursements to member states were blocked until a EUR 6.6bn release in Sep 2026 (EUR 4.7bn reimbursements, EUR 1bn joint procurement, EUR 0.9bn EUMAM).
  - The new EUR 90bn Support Loan earmarks EUR 60bn for defence, with EU/EEA/Ukraine origin rules.

## Ukraine civilian/dual-use imports
- Drones:
  - Imports were USD 1.17bn in 2024 (1.66% of goods imports), 92% of it from China.
  - China's share of imported drone components fell from about 90% (early 2024) to 38% (H1 2025) and 28% (Jan-Aug 2026).
- Generators and energy equipment: not quantified in this pass (null).

## Russia side
- North Korea:
  - KIDA estimates about USD 20bn (munitions USD 19.2bn, technology USD 0.63bn, labour USD 0.28bn). It was mostly paid in kind.
  - An alternative estimate puts it at USD 1.7-5.5bn.
  - Certainty C.
- Iran: a leaked USD 1.75bn Shahed contract (6,000 units plus technology), partly paid in gold. Unverified, so certainty C.
- China: more than USD 4bn a year of high-priority dual-use exports to Russia (2024, 2025), per MERICS and OSW. These are trade payments, not aid.
- Discount gains: not quantified (null).

## Caveats
- FX assumptions: 0.925 EUR/USD for 2022-24, 0.86 for 2025-26, 0.134 EUR/DKK.
- The CSIS "spent in US" figure includes US-force costs and DoD industrial-base money that never reaches Ukraine.
- Backfill of donated stocks from foreign suppliers (e.g. Poland buying from Korea and the US) is flowback abroad, but it is not quantified here.
