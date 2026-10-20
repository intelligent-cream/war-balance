# GDP denominator: average 2022–2024 (round 15)

Data: `gdp_avg_r15.json`, generated 2026-10-19 by [`scripts/gdp_avg_r15.py`](../scripts/gdp_avg_r15.py). Raised by review 4 (M1), approved by the owner. **Not yet reviewed by a person.**

## Why

Every figure on the map is a total over 2022 to August 2026 in each year's euros, divided by one year's GDP. Until round 14 that year was 2024. For economies whose currency collapsed, 2024 was a trough in euros: Nigeria's GDP was USD 647bn in 2022, 487bn in 2023 and 252bn in 2024 (World Bank), so its 2024 GDP alone more than doubled its share. The average of 2022–2024 matches the numerator's period better.

## What

- **Source, as before**: World Bank WDI `NY.GDP.MKTP.CD` for the 200 economies whose 2024 GDP came from it, IMF WEO (DataMapper `NGDPD`) for the four that came from the IMF (Taiwan, Yemen, San Marino, South Sudan). Fetched 2026-10-19 (`raw/worldbank/NY.GDP.MKTP.CD_2022_2024.json`, World Bank last updated 2026-10-08; `raw/imf/weo_NGDPD_2024.json`).
- **Euros**: each year at its ECB average (USD per EUR 1.053 in 2022, 1.0813 in 2023, 1.0824 in 2024), the rates `build_data.py` already uses.
- **Kept at one year** (13 entries): North Korea (the Bank of Korea's 2024 GNI estimate; its 2022 and 2023 estimates, KRW 36.7 and 40.9 trillion, were seen in press reports only and are not used), Greenland and the Isle of Man (World Bank 2023 only) and territories without data.
- `build_data.py` (`gdp_average()`) sets `gdp` to the average at the end of the build, so steps that cap a flow at a share of GDP keep the GDP they were calibrated on; `gdp_2024` is kept for the method band ("2024 GDP").

## Effect (% of GDP, net)

Nigeria +0.81 → +0.44, Kyrgyzstan −5.68 → −6.75, Mongolia −4.78 → −5.52, Yemen −6.11 → −5.13, Türkiye −2.42 → −2.86, Lithuania +10.98 → +11.80, Poland +3.74 → +4.21, Norway +3.37 → +3.09 (its 2022 GDP was high). Most European figures rise by 4–12%, because their 2022 and 2023 GDP in euros was lower than in 2024.
