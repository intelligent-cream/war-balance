# Relocants' spending inside "services sold to Russia"

File: `relocants.json`. Gathered 2026-10-18. Not yet reviewed by a person.

## What this is

The map counts `svc_sold` as money a country earns from Russia. Travel credits are a big part of it. Since 2022,
part of those travel credits is not Russian tourists. It is Russians who moved abroad (relocants) paying rent, food
and local services. The owner decided that this is money *leaving* Russia, not income from Russia. This file
estimates that part, per country and year from 2022 to 2026, so it can be taken out. Ordinary tourism stays in.

For each country the file gives:
- `relocant_share_of_svc_sold`: the share of the map's `svc_sold` (low, central, high);
- `remove_eur_bn`: that share times the map's central `svc_sold`, in EUR bn (2026 = Jan–Aug).

## How it was estimated

1. **The pre-war tourist level.** 2021 was hit by COVID, so the comparison is mostly with 2019.
2. **How many relocants there were** (migration balances, residence permits, bank accounts) and what they spend
   (about USD 1,000–1,600 a month in the Caucasus, the Balkans and Turkey; more in Dubai).
3. **How much of that spending the compiler records as travel.** Under balance-of-payments rules, someone who stays
   (or plans to stay) a year or more is a resident. Their spending is then household spending, not travel. So a
   relocant shows up in travel credits mostly in the first year, or while staying on visa runs. This is why the
   shares peak in 2022–2023 and then fall.
4. **Check:** the relocant part cannot be much bigger than the rise over the pre-war tourist level, and what is left
   per tourist visit must still look normal.

## Results (EUR bn removed, 2022–2026 total)

| country | low | central | high | certainty | peak year |
|---|---|---|---|---|---|
| Georgia | 0.39 | 0.73 | 1.12 | B-C | 2022 (0.36) |
| Türkiye | 0.29 | 0.90 | 1.86 | C-D | 2022 (0.35) |
| UAE | 0.12 | 0.52 | 1.25 | D | 2022–23 (0.13) |
| Serbia | 0.14 | 0.38 | 0.75 | C-D | 2023 (0.14) |
| Armenia | 0.08 | 0.24 | 0.46 | C | 2022 (0.07) |
| Montenegro | 0.08 | 0.23 | 0.41 | D | 2023 (0.10) |
| Kazakhstan | 0.03 | 0.18 | 0.39 | C-D | 2022 (0.05) |
| Kyrgyzstan | 0.01 | 0.05 | 0.11 | D | 2022 (0.02) |
| Uzbekistan | 0.00 | 0.04 | 0.10 | D | 2023 (0.01) |
| **all nine** | **1.15** | **3.27** | **6.47** | | |

## Country notes

**Georgia (best documented).** The National Bank of Georgia (NBG) puts travel credits from Russia at about USD 775m
in 2019, 891m in 2022, 938m in 2023, roughly 835m in 2024 and about 694m in 2025. In 2022 Russians made fewer visits
than in 2019 but spent about 55% more per visit. In October 2022, just after mobilisation, Russians' spending was
526% higher than a year earlier. The NBG treats Russians who stayed or plan to stay a year or more as residents
(35.5% of resident Russians in March 2023) and leaves them out of travel. Everyone else, including first-year
relocants and people on visa runs, is in. Geostat shows net immigration of Russians of about 60k in 2022 and 17k in
2023; IDFI says 73.7k stayed over 2022–23. Share of `svc_sold`: 38% in 2022, 24% in 2023, 11% in 2024, then
small. By 2025 travel credits from Russia are below the 2019 tourist level, so little relocant spending is left.
So the warning holds: Georgia's 2022–23 "Russian tourism" is partly long-stayers counted as travellers.

**Armenia.** Official net arrivals were about 42k Russians in Jan–Sep 2022 (the government claimed 100–150k), and
68.7k non-resident bank accounts were opened. A year of their living costs would be bigger than the whole
`svc_sold` series (EUR 0.35–0.45bn), so most of it cannot be inside it. It must be recorded as resident spending,
inside remittances, or missed. The share is therefore capped by the modest rise over the pre-war level: 20% in
2022, falling to 6% in 2026.

**Serbia.** `svc_sold` more than doubled in 2023. Part of that is IT and business services sold to Russian clients
by firms that moved there; that is kept, because it is earned from Russia. The Interior Ministry counted about 300k
entries and about 53k who settled; more than 67k temporary residence permits were issued by the end of 2024. Permit
holders mostly become residents, but visa-run stayers remain travellers. Share: 17–18% in 2022–23, falling after.

**Türkiye.** Russians with residence permits: about 66k before the war, a peak of about 150–158k at end-2022 and
early 2023, 96k in May 2024 and 85–90k in 2025. The extra over the pre-war level is about 85k at the peak, but
Russian tourist visits also rose (5.2m in 2022, 6.3m in 2023, 6.7m in 2024). Most of the rise is tourism coming back,
so the relocant share is small: 6% in 2022, 1–2% from 2024. The EUR amounts are still large because the base is big.

**UAE.** No UAE figures by country; `svc_sold` is the OECD-WTO BaTiS estimate built from Russia's travel spending.
Dubai drew wealthy relocants with high spending, but most hold residence visas. Educated guess: 5–8% (range 1–18%).

**Montenegro.** Travel credits from Russia rose from 0.19 to 0.35 in 2023 while direct flights from Russia were
banned. That points to people staying for months (residence permits, property, visa runs). Educated guess: 28% in
2023 (range 12–45%).

**Kazakhstan, Uzbekistan, Kyrgyzstan.** Their `svc_sold` is mostly transport and shows no 2022 travel jump. About
146k of the roughly 930k post-mobilisation arrivals were still in Kazakhstan in December 2022, and 50–80k at the end
of 2023. Bishkek's 2022 wave was short-lived, and Uzbekistan saw few relocants. Shares: 1–7%.

## Things to watch

- **Apply the shares, not the EUR amounts,** if `svc_sold` is revised. The EUR figures use the central `svc_sold`
  for all three bounds.
- **No double count with `remittances.json`.** That file already leaves out relocants' money transfers. Those
  transfers pay for the spending removed here, but they sit on different balance-of-payments lines
  (transfers/financial flows vs travel). Removing both is consistent.
- **The counterfactual.** If the no-war expected level was fitted on 2022–2023 travel, it should be refitted
  after this removal, or the removal will be partly cancelled out.
- **Gaps:** ISET, CRRC and EBRD/World Bank studies were not read in detail. No published year-by-year split of
  relocant spending inside travel was found anywhere except the NBG's 1-year rule. The UAE, Montenegro, Kyrgyzstan
  and Uzbekistan rest on educated guesses.

Sources are listed with URLs in `relocants.json` → `sources`.
