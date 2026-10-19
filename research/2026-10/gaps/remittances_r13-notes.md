# Remittances from Russia at the migrant's net gain (round 13)

Gathered on 2026-10-19. Output: [`remittances_r13.json`](remittances_r13.json). It changes how [`remittances.json`](remittances.json) is valued; the labour, relocant and expected series there stay. **No one has reviewed this yet.**

## Why

Until round 12 the change in labour remittances against the no-war level counted at value kept (0.97) × genuinely extra (0.55). The audit found that this counts wages, a real cost of the work, as if they were profit, against the map's own net-gain rule: Tajikistan's −38% of GDP was 99% remittances. The owner approved one rule: wages pay for real work, so only the pay above what the same work earns elsewhere (the migrant's "normal return") is a gain, and only its war-driven change counts.

## The rule

For each year, with L = labour remittances from Russia and E = what was expected without the war (both from `remittances.json`):

```
toward Russia = P + p × extra × (L − E − P),   P = min(L × w, max(0, L − E))
```

- **w, the war wage premium**: the share of the Russian wage above its pre-war trend. Russian average wages (Rosstat): 57,244 roubles in 2021, 65,338 (2022), 74,854 (2023), 87,952 (2024), 100,360 (2025). The pre-war trend is the 2019–2021 growth, 9.0% a year (2019 from the 2020 average of 51,083 and its 6% growth); 7% and 10% are the ends. So w is 0.045 (2022), 0.091 (2023), 0.157 (2024) and 0.195 (2025); 2026 takes 2025's.
- **P, the premium in what migrants sent**, counts in full: it is pay above what the same work earned before the war. It counts only as far as it shows in euros (the cap at L − E): in Kyrgyzstan the weaker rouble cancelled the rise in rouble wages, and what migrants sent stayed at the no-war level.
- **The rest of the change** (more or fewer migrants, or a shift from cash to cards) at no-war wages counts only by the migrant's premium over the alternative wage, p, times `remittances.json`'s genuinely extra share (0.55 when above, 0.40 when below).
- **p = 1 − alternative wage ÷ migrant wage in Russia without the war.** Migrants earned 0.823 of the Russian average in 2021 (47,100 roubles in a survey of 4,739 Kyrgyz, Uzbek and Tajik migrants, against 57,244). Russia's average was USD 1,231 in May 2025, so a migrant earned about USD 1,013, or USD 816 at no-war wages. Home wages in mid-2025: Tajikistan USD 314 (its statistics agency), Uzbekistan 484, Kyrgyzstan 481, Kazakhstan 790 (Times of Central Asia, sources not named). So p is 0.62 for Tajikistan, 0.41 for Uzbekistan and Kyrgyzstan and 0.03 for Kazakhstan. The low end uses Kazakhstan as the alternative destination (USD 650 at the migrant ratio): 0.20. Armenia, Georgia, Azerbaijan, Belarus and Moldova: 0.2 (0–0.4), a judgement (no home wage fetched).

Each input is moved on its own and the effects are combined in quadrature for the range.

## Checking the totals

- **Tajikistan.** The World Bank gives USD 6.80bn (2024) and 10.18bn (2025). EFSD (via Interfax, 12 Oct 2026) puts 2025 remittances at 54.5% of GDP; with the World Bank's 2025 GDP of USD 17.66bn that is USD 9.62bn, 6% below the World Bank total. The audit's "about USD 8.6bn" is not in the article it cites (which gives 45% of GDP for 2024 and an ADB forecast of 37% for 2025). The research keeps the World Bank total; its low end of 2025 labour (EUR 4.6bn) covers the EFSD figure. Tajikistan publishes no country split; the Bank of Russia stopped publishing by country after 2021.
- **Uzbekistan.** The Central Bank of Uzbekistan (via Kun.uz and Times of Central Asia, January 2025): USD 14.8bn in 2024, of which USD 11.5bn (77%) from Russia: matches `remittances.json`. Uzbeks working abroad fell by a third in 2024 to 1.14m (about 1m in Russia), so the rise is pay per worker and a channel shift, not more workers.

## Results (2022 to August 2026, net % of 2024 GDP, this step alone)

| country | before | after | why |
|---|---|---|---|
| Tajikistan | −38.3 | −39.6 | the war wage premium (about EUR 3bn) counts in full; the rest of an 80% rise above the no-war level × 0.62 × 0.55 |
| Uzbekistan | −15.1 | −14.5 | |
| Kyrgyzstan | −6.1 | −7.5 | pay rose with the war, but in euros it stayed near the no-war level, so the premium is capped |
| Moldova | +6.1 | +5.4 | fewer migrants in Russia: their lost pay counts only by the premium over other work |

Tajikistan stays at about −40%: its migrants' pay in Russia rose far above the no-war level, and a 2022–2026 total against one year's GDP adds about five years of it. The audit's −0.8% assumed that wages are entirely a real cost; the owner's rule counts the war-driven premium, which is a real gain to Tajik households.

## Not verified

- Rosstat's own tables could not be opened (the site's certificate is not trusted by this environment); the wage series come from RBC, nalog-nalog.ru and brobank.ru, which cite Rosstat. They agree with each other where they overlap, except 2024 (nalog-nalog.ru 86,399, RBC 87,952: RBC used) and 2025 (100,360 or 101,784: 100,360 used).
- Daryo's "nearly USD 600 a month" (2024) returned HTTP 403 and is not used.
- No migrant-specific wage series after 2021: migrants' pay is assumed to follow the Russian average.

## Sources (fetched 2026-10-19 unless noted)

- World Bank WDI, personal remittances received: <https://api.worldbank.org/v2/country/TJK;UZB;KGZ/indicator/BX.TRF.PWKR.CD.DT?format=json&date=2017:2025>
- World Bank WDI, GDP in current USD, Tajikistan: <https://api.worldbank.org/v2/country/TJK/indicator/NY.GDP.MKTP.CD?format=json&date=2023:2025>
- Interfax (EFSD outlook): <https://interfax.com/newsroom/top-stories/119513/>
- Times of Central Asia, Tajikistan slowdown: <https://timesca.com/tajikistan-predicts-economic-slowdown-amid-declining-remittances/>
- Times of Central Asia, wages: <https://timesca.com/tajikistan-average-salary-rises-but-trails-behind-central-asia/>
- 24.kg, migrants' average salary (2021): <https://24.kg/english/216641__Average_salary_of_migrants_in_Russia_voiced/>
- nalog-nalog.ru, Russian average wage by year: <https://nalog-nalog.ru/zarplaty_i_kadry/srednyaya-zarabotnaya-plata-po-rossii-v-2023-godu/>
- BFM, 2020 average wage: <https://www.bfm.ru/news/465422>
- Kun.uz, Uzbekistan 2024 (found by search, quoted there): <https://kun.uz/en/news/2025/01/20/remittances-to-uzbekistan-reached-nearly-15-billion-in-2024>
