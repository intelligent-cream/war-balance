# Remittances from Russia (round 7, R5)

Data file: `remittances.json` (same folder). Script and downloads:
`/tmp/claude-0/-home-user/71ac834a-35d2-5698-a36d-858806a141e1/scratchpad/r7/remittances/` (`scripts/build.py`, `dl/`).
**Not yet reviewed by a person. Not yet wired into `data.json`.**

## 1. What this is

The owner decided that money migrant workers send home from Russia counts. It is pay for labour sold to Russia's
economy, so it works like services sold to Russia. Money Russians brought or sent when they moved abroad after 2022
(relocants' savings, property purchases) is money *leaving* Russia and is left out.

For each receiving country, 2019 to 2026 (2026 = January–August), in EUR bn, the file gives:

- **total from Russia**: everything sent from Russia, as the receiving central bank reports it;
- **labour**: the part that is migrant workers' pay (this is what counts);
- **relocants and other**: total minus labour (relocants, capital, Russians' own-account transfers, trade payments
  through individuals). Left out;
- **expected labour**: the no-war level;
- **money-rule factors**: value kept and genuinely extra.

It also gives the 2022–2026 change against the expected level, as EUR bn and as % of 2024 GDP, before and after the
money rule.

## 2. Where the numbers come from

The Bank of Russia published transfers by country until 2021. It then stopped and resumed only in August 2026, with
outgoing totals only. So every figure comes from the **receiving** country.

| country | source | quality |
|---|---|---|
| Uzbekistan | Central Bank: transfers by country (Russia 87% in 2022, 78% in 2023, USD 11.5bn = 77% in 2024, 72% in Q1 2026) | good totals; 2019–2021 Russia part rebuilt |
| Kyrgyzstan | National Bank: transfers by country (Russia about 93%; USD 2.53bn in 2023, 2.78bn in 2024) | good |
| Tajikistan | no country split. World Bank total × assumed Russia share 0.88 (0.80–0.93) | weak |
| Armenia | Central Bank: bank transfers from Russia (USD 0.865bn in 2021, ~3.5bn in 2022, 3.95bn in 2023, 3.9bn in 2025) | good totals; split modelled |
| Georgia | National Bank: transfers by country (Russia USD 0.41bn in 2021, 2.07bn in 2022, 0.54bn in 2024) | good |
| Kazakhstan | National Bank via RBC: USD 0.78bn in 2022, about 7× 2021, then back down | fair |
| Azerbaijan | Central Bank: Russia 82% of ~3.6bn in 2022, 1.05bn in 2023, 0.50bn in 2024 | fair |
| Moldova | National Bank: Russia USD 0.26bn (21%) in 2019, falling; later years estimated | weak |
| Belarus | no country split. World Bank total × assumed Russia share 0.45 | weak |

Note: these "money transfer" totals are wider than the balance-of-payments line "personal remittances". For example,
Armenia's BoP personal remittances barely moved (USD 1.56bn in 2021, 2.12bn in 2022, 1.57bn in 2025) while bank
transfers from Russia quadrupled. The BoP compilers already strip out most relocant and trade money.

## 3. Splitting labour from relocants

The 2022 surge in Armenia, Georgia, Kazakhstan and Azerbaijan was not wages. It came with the arrival of Russians
(about 112,000 stayed in Georgia in 2022, a similar number passed through Armenia, many more through Kazakhstan),
Russians opening local bank cards, and diaspora businesses moving capital home. The World Bank attributed the 2022
record to "capital migration" from Russia, the strong rouble and demand for migrant workers.

The test is the **drop back**:

- **Georgia:** USD 2.07bn (2022) → 1.5bn → 0.54bn (2024) → about 0.48bn (2025). This is close to the pre-war 0.41bn.
  The labour/diaspora part is about 0.35–0.40bn a year throughout.
- **Kazakhstan:** USD 0.78bn (2022) → about 0.13bn (2024). Few Kazakhs work in Russia, so labour is under 0.1bn.
- **Azerbaijan:** Russia USD ~2.95bn (2022) → 1.05bn → 0.50bn (2024), below pre-war (~0.65bn).
- **Armenia** is different. Gross transfers from Russia stayed high (USD 3.5–3.9bn a year) but are mostly two-way:
  re-export payments, Russians paying through Armenian accounts, relocants' salaries. Net inflows from Russia halved in
  early 2024. Labour is modelled as the pre-war Armenian migrant level (~USD 0.75bn) × Russian wages in dollars.
- **Uzbekistan:** transfers from Russia jumped from ~USD 5.4bn (2021) to ~14.2bn (2022), fell to 8.9bn (2023), then rose
  again (11.5bn in 2024, ~14.6bn in 2025). The 2022 peak and the 2023 fall show a one-off: migrants moved savings home
  in fear of sanctions, and Russians opened Uzbek cards. About USD 6.6bn of 2022 is put outside labour. The 2024–2025
  rise matches Russian wages and is counted as labour.
- **Tajikistan:** the 2022 jump (USD 2.9bn → 5.35bn total) is more than wages and the rouble explain, so about 1.1bn is
  put outside labour. Part of the 2024–2025 rise (to USD 9–10bn) is also left out.
- **Kyrgyzstan:** small relocant part in 2022 (~USD 0.3bn); the rest is labour.

Labour ranges are about ±10–25% for the big three and ±25–35% for the Caucasus.

## 4. The expected no-war level

Base: the average of 2019 and 2021 labour. 2020 is left out because of COVID. Growth follows the pre-war trend.
Before the war the Russian average wage in dollars grew about 3.7% a year (2017–2021), with the rouble at about
73–75 per dollar.

| country | growth a year (central, ±3 points) | why |
|---|---|---|
| Uzbekistan | 6% | fast pre-war growth after the 2017 currency reform |
| Tajikistan | 5% | |
| Kyrgyzstan, Belarus | 3% | |
| Armenia, Azerbaijan | 2% | |
| Georgia | 1% | ageing diaspora |
| Kazakhstan | 0% | |
| Moldova | −6% | Russia's share fell from ~36% (2017) to 21% (2019) as workers moved to the EU |

The low and high values also move the base by ±5%.

**Rouble effect.** The rouble was strong in 2022 (68.5 per dollar against about 74 without the war), which raises the
2022 euro value by about 8%. It was weak in 2023–2024 (85–93) and only middling in 2025 (~83.5). Over 2022–2026 the
currency effect is therefore *negative*. The gap comes from **rouble wages**: the average wage rose from RUB 57,244
(2021) to RUB 100,360 (2025), +14–18% a year against 7–9% before the war. That is the war economy's labour shortage
(mobilisation, emigration, defence production).

## 5. The money rule

- **Value kept: 0.97 (0.93–0.99).** The migrant's pay is the home country's income. Only the transfer fee (the Russia
  corridors are among the cheapest in the world, ~1–2%) and a little leakage are lost.
- **Genuinely extra, when above expected: 0.55 (0.30–0.80).** The migrants would mostly have worked in Russia anyway;
  the base already covers that. The gap is the war wage premium, and that is real extra income. It is reduced
  because:
  - part of the measured rise is a channel shift from cash to cards and P2P (Uzbekistan: 44% by P2P in H1 2025),
    which is not new money;
  - without the war, some migrants would have earned in other countries.
- **Genuinely extra, when below expected: 0.40 (0.25–0.60).** This covers Moldova, Azerbaijan and Georgia. Most
  workers who left Russia found work in the EU, Korea, the UK or Türkiye.
- **Product:** 0.53 (0.29–0.78) above expected; 0.39 (0.24–0.58) below.

**Context only (not counted):** after the Crocus attack (March 2024), Russia tightened migrant rules. Measures
included raids, higher patent fees from January 2026 and a register of "controlled persons". Central Asian migrants
were pressed to sign army contracts in exchange for citizenship. Nepalis, Indians, Cubans and others were recruited
as soldiers. North Korean workers are a state labour export and are not modelled.

## 6. Results, 2022 to August 2026

Change = labour minus expected, summed. Positive = more earned from Russia than expected (toward Russia). GDP = 2024.

| country | labour | expected | change EUR bn (range) | % GDP | money rule EUR bn | % GDP (range) | certainty |
|---|---|---|---|---|---|---|---|
| Uzbekistan | 45.5 | 26.7 | +18.9 (9.3–24.2) | 16.8 | +10.1 | 9.0 (2.4–16.8) | C |
| Tajikistan | 20.9 | 11.6 | +9.4 (4.7–14.2) | 70 | +5.0 | 37 (10–83) | D |
| Kyrgyzstan | 11.5 | 11.2 | +0.3 (−1.9 to 2.3) | 2.0 | +0.18 | 1.1 (−6.7 to 10.5) | B |
| Belarus | 3.8 | 3.0 | +0.8 (−0.5 to 2.2) | 1.2 | +0.45 | 0.6 (−0.4 to 2.3) | D |
| Armenia | 3.9 | 3.6 | +0.4 (−0.9 to 1.8) | 1.5 | +0.19 | 0.8 (−2.3 to 5.8) | C |
| Kazakhstan | 0.4 | 0.4 | 0.0 (−0.1 to 0.2) | 0.0 | 0.0 | 0.0 | C |
| Georgia | 1.6 | 1.6 | −0.1 (−0.6 to 0.4) | −0.3 | −0.03 | −0.1 (−1.0 to 1.0) | B |
| Azerbaijan | 2.3 | 2.8 | −0.4 (−1.2 to 0.3) | −0.6 | −0.16 | −0.2 (−1.0 to 0.3) | C |
| Moldova | 0.4 | 0.7 | −0.3 (−0.5 to −0.07) | −1.7 | −0.11 | −0.65 (−1.7 to −0.1) | D |

Relocant and other money left out over 2022–2026 is about EUR 30bn, mostly Armenia (11.9), Uzbekistan (7.5),
Tajikistan (3.3), Georgia (3.0), Azerbaijan (2.5), Kazakhstan (1.0) and Kyrgyzstan (0.6).

Other countries: Türkiye, China, Vietnam, Israel, Serbia, Germany and the UAE get under EUR 0.1bn a year of labour
income from Russia, or relocant money only. Ukraine is not scored for this flow.

## 7. Overlaps with what the map already counts

- **Services sold to Russia (`svc_sold`)**: no overlap. That is services trade. Compensation of employees is primary
  income and personal transfers are secondary income; neither is in services. But relocants' spending in Georgia and
  Armenia (rent, travel) *is* in travel credits. Georgia's `svc_sold` went from 0.25 to 0.95 in 2022. Leaving relocant
  transfers out here avoids counting that money twice.
- **`payment_channels.json`** already lists the 2022 surge as "recorded, not counted". Consistent.
- **Profits remitted (`company_flows.json`)** are investment income, not wages. No overlap.
- **Goods trade and re-exports**: trade payments made through individuals (Armenia, Kyrgyzstan, Uzbekistan) sit in the
  non-labour part, which is not counted. No double count.
- No field in `data.json` holds remittances.

## 8. Open questions for the owner

1. **Tajikistan is huge:** about 37% of GDP after the money rule (range 10–83%). Remittances are about half of
   Tajikistan's GDP, so any war wage premium is large against it. Accept, or cap? Certainty is D: there is no
   country split and the 2024–2025 totals disagree (World Bank USD 6.8bn and 10.2bn; IOM/ADB 5.8bn and 9.2bn).
2. **Uzbekistan:** about 9% of GDP. This is a big new orange item for a country the map now shows as fairly neutral.
3. **Remote workers:** relocated Russians in Armenia and Georgia who are paid by Russian employers. Are they relocants
   (left out) or labour sold to Russia? Left out here.
4. **Relocants' spending:** should their local spending inside `svc_sold` travel credits also be removed, for
   consistency with leaving relocants out?
5. **Diaspora:** for Georgia, Armenia and Azerbaijan, part of "labour" is family support from long-settled diaspora,
   not current wages. It is treated as labour here.
6. **Belarus and Moldova** need a country split from the NBRB and BNM balance-of-payments tables before use.
