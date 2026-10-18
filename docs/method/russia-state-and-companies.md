# Russia's state finance, arms sales and companies

Money that reaches Russia outside ordinary trade: payments for Russian nuclear projects and repayments of Russia's
state loans, purchases of Russian weapons, and money moved by companies (foreign companies leaving Russia, Russian
companies abroad sending profits home). Added in round 5. Each is a yearly change against the pre-war level, stored as
an extra part (`add_extra()` in [build_data.py](../../pipeline/build_data.py), `c.extra` in `data.json`) and shown in the
country breakdown like any other part.

## Nuclear projects and state loans from Russia

Code: `apply_state_finance()`; data: [`russia_state_finance.json`](../../research/2026-10/gaps/russia_state_finance.json)
([notes](../../research/2026-10/gaps/russia_state_finance-notes.md)).

- **Nuclear fuel and enrichment** (HS 2844, 8401) are already in goods trade with Russia: nothing added (US EUR
  0.5–1.1bn a year, China, Korea, France, the VVER countries).
- **Construction by Rosatom** (Egypt, Bangladesh, Hungary's Paks II, India, Iran, Uzbekistan) is in neither goods nor
  services data. Only the buyer's own share counts; the part paid with a Russian state loan is Russian money paying a
  Russian company.
- **Interest and repayments on Russia's state loans** (World Bank International Debt Statistics with Russia as creditor,
  actuals to 2024, contractual schedule after; news for Belarus's deferrals, Bangladesh's escrow, Viet Nam and Iraq
  stopping payment). Only the **deviation from the pre-war repayment schedule** counts: a loan ending on schedule is not
  a war-time choice. New drawdowns are left out: they pay for work that is not counted.
- **Customs over-counts removed**: equipment for Akkuyu is imported by Rosatom's own Turkish company (Türkiye about
  EUR −2.5bn over 2022–2026), El Dabaa equipment is 85% loan-financed (Egypt −1.1).

| country | 2022–2026, EUR bn (toward Russia +) | why |
|---|---|---|
| Türkiye | −2.5 | customs over-count of Akkuyu equipment removed |
| Belarus | −1.1 | payments deferred |
| Hungary | +0.8 | Paks II payments and loan prepayments (certainty D) |
| Viet Nam | −0.7 | stopped paying in 2023 (blocked payment channels) |
| Iraq | −0.4 | stopped paying |

Arrears in Viet Nam, Iraq and Bangladesh were caused by sanctions on payment channels, not by choice: they count (the money did not reach Russia) and the country panel says so in a note. **Belarus's** deferrals were granted by Russia and refinanced with new Russian loans, so its loan repayments are left out (round 6); only its nuclear-plant part counts.

## Weapons bought from Russia

Code: `apply_russian_arms()`; data: [`russian_arms_exports.json`](../../research/2026-10/gaps/russian_arms_exports.json)
([notes](../../research/2026-10/gaps/russian_arms_exports-notes.md)). Russia's income from arms sales fell from about
USD 15bn a year in 2019–2021 to 7–9bn after 2022 (official statements of the export agency and Rostec; Russia's later
claims of 14–15bn are used only as the high end). Arms are almost entirely outside customs data (India and China record
almost none), so this is a new part; the small part inside customs (Algeria's 2024 radars) is taken out. Split by buyer
from contracts (India's S-400, Iran's Su-35, Algeria's Su-57, Egypt's cancelled Su-35), SIPRI buyer shares and payment
timing, against an expected level without the war that leaves out one-off contracts (Türkiye's 2019 S-400).

Biggest changes over 2022–2026 (toward Ukraine = paid less): India +4.3bn, China +3.7, Egypt +2.8, Algeria +2.3, Iraq,
Viet Nam, Myanmar about +0.5 each; Iran −2.5 (paid more), Saudi Arabia −0.5. A large part of the fall was not the
buyer's choice: Russia kept its output for its own army and sanctions hit its production (India about 50%, China 70%,
Egypt 20%, about 60% elsewhere). The country panel says so in a note, like the sanctions split; the number is not
reduced. Most buyer values after 2021 are educated guesses (certainty D; India and China C).

### Round 6

18 more buyers were found for the "rest of world" remainder from SIPRI fact sheets ([`arms_r6.json`](../../research/2026-10/gaps/arms_r6.json),
[notes](../../research/2026-10/gaps/arms_r6-notes.md)): Mali, Burkina Faso, Niger, Libya, Sudan, Ethiopia, Uganda,
Angola, Nigeria, Laos, Mongolia, Malaysia, Turkmenistan, Thailand, Azerbaijan, Venezuela, Bulgaria, Slovakia. The
unassigned amount falls from EUR 3.0bn to 1.2bn. **Iran** is counted once: about 35% (10–70%) of its payments for
Russian arms were settled in drones and missiles that are already counted as weapons sent to Russia, so that part
(EUR 1.2bn central) is taken off its arms payments.

## Companies leaving Russia

Code: `apply_company_flows()`; data: [`company_flows.json`](../../research/2026-10/gaps/company_flows.json)
([notes](../../research/2026-10/gaps/company_flows-notes.md)). By the company's home country:

- **Exit contribution** to Russia's budget, required since 2023 for every sale (Russian budget line: RUB 116bn in 2023,
  160bn in 2024, about 150bn of 2025's line). Split by the size of the businesses that sold out.
- **Forced discount**: sales at least 50–60% below valuation hand the difference to Russian buyers (2022 case list:
  Renault, Société Générale, McDonald's, Nissan, Equinor, Shell; later years from the contribution). Yandex (Netherlands)
  and Polymetal (Kazakhstan) are left out: their shareholders were mostly international, not Dutch or Kazakh.
- **Not counted: seizures** without payment (Wintershall Dea, Uniper's Unipro, Fortum, Carlsberg, Danone, leased
  aircraft; about EUR 33bn). Russia took these; the owners had no choice. They are in the research file.

Counting exit payments toward Russia means a company's exit costs its country on this part, while the taxes it no
longer pays in Russia count toward Ukraine (company taxes, [services-shipping-companies.md](services-shipping-companies.md#company-taxes)).

## Russian-owned companies abroad

Profits Russian parents receive from their companies abroad, by host country, against 2019–2021: Lukoil's refineries
(Bulgaria, Romania, the Netherlands), NIS in Serbia (reported dividends), Rosneft in India and Egypt, Zarubezhneft in
Viet Nam, Russian banks. Trusteeships that stopped transfers count toward Ukraine: Germany (Rosneft Deutschland,
Gazprom Germania, now SEFE) about EUR 1.3bn over 2022–2026. Mostly estimates (certainty D) except Serbia.

**Round 10: metals, mining and chemicals plants.** Prompted by a reader asking about Rusal's Aughinish Alumina in
Limerick, Russian-owned industrial plants abroad were added ([`russian_owned_r10.json`](../../research/2026-10/gaps/russian_owned_r10.json),
[notes](../../research/2026-10/gaps/russian_owned_r10-notes.md)), by host country, in the same part. They send little
home: about EUR 0.1–0.2bn a year in total, before and after the war, and the change against 2019–2021 stays within
±0.05bn a year.

- **Ireland, Aughinish Alumina (Rusal):** no dividends in any year. It had accumulated losses (USD 360m at the end of
  2023, 240m at the end of 2024), so it cannot legally pay one; for 2024 none was paid (pre-tax profit USD 119m).
  Profit can leave through prices charged to Rusal's trading companies, which public data do not show. Its alumina
  sold to Russia (Eurostat: EUR 0.11bn in 2019, 0.16bn in 2021, 0.35bn in 2024) is already in Ireland's exports to
  Russia, counted at the money rule like all sales to Russia ([trade.md](trade.md#profit-not-revenue)).
- **Sweden, KUBAL (Rusal):** about EUR 0.07bn sent to its Cyprus parent in 2023 and a small dividend in 2024; none
  in 2026, after a police raid over suspected sanctions breaches froze its payments.
- **Belgium, Denmark, Italy, France (NLMK's plants; EuroChem Antwerpen):** about zero; the steel plants lose money and
  Antwerpen kept its profit.
- **Lithuania, Lifosa (EuroChem):** zero since 2022: accounts frozen in March 2022, a state administrator since 2024.
- **Kazakhstan, Uranium One (Rosatom):** a rough guess of EUR 0.07bn a year before the war rising to 0.18bn in 2024
  (certainty D), the largest and least certain item.
- **Angola, Catoca (Alrosa 41%):** USD 322m of dividends for 2021–2023 blocked; the stake was sold in May 2025.
- **USA and Canada, Evraz North America:** zero after the UK sanctions of May 2022; sold in August 2025.

## Frozen central-bank reserves (round 7)

About EUR 260bn of the Bank of Russia's reserves have been immobilised since 28 February 2022, about 185bn at
Euroclear in Belgium. The frozen amount itself is not counted. What counts is the yearly return those reserves would
have earned for Russia without the freeze: money Russia did not get, so toward Ukraine on the balance with Russia
(`apply_frozen_reserves()`, [`frozen_assets.json`](../../research/2026-10/gaps/frozen_assets.json),
[notes](../../research/2026-10/gaps/frozen_assets-notes.md)).

- **Rates per currency and year**, close to what Euroclear actually earned (about 3.4%, 3.8% and 2.6% in 2023–2025);
  yen and 2022 euro rates were near zero. Total about EUR 31bn over 2022 to August 2026 (24.5–40).
- **Euroclear and Clearstream**: the freeze is an EU decision, so a third of their return goes to the host (Belgium,
  Luxembourg, which carry the legal risk) and two thirds to all EU members by their share of EU-level aid.
- **Belgium's tax** on Euroclear's Russian-asset income (about EUR 1.7bn in 2024, 1.0bn in 2025) is pledged to
  Ukraine and already in Belgium's aid, so it is taken off the return first.
- **The low end** allows for Russia having spent part of the reserves without a freeze (× 0.8).
- **No double count** with the G7 ERA loans, which are repaid from this return and already left out of donors' aid.
  One small possible overlap remains: most of the July 2024 windfall tranche went to the European Peace Facility, and
  if the Kiel data count it as EU aid it also sits in members' EU shares (EUR 1.4–3bn across the EU).
- **Left out**: private sanctioned assets (about EUR 28bn in the EU): private money, much of it yachts and property
  that earn nothing. Reserves held in China (about USD 103bn) and gold held in Russia were not frozen.

Largest credits, 2022–2026: Belgium EUR 7.4bn (1.2% of GDP), France 5.0, Germany 3.2, Italy 1.9, the UK 1.8,
Spain 1.3, Switzerland 1.1, the US 0.8.

## See also

- [overview.md](overview.md): every part of the map
- [trade.md](trade.md): goods trade with Russia
- [aid-refugees-military.md](aid-refugees-military.md): weapons sent to Russia (the other direction)
- [Documentation index](../README.md)
