# Hong Kong's 2026 gold from Russia, measured (round 44)

Output: [`hk_csd_r44.json`](hk_csd_r44.json), written by [`../scripts/hk_csd_r44.py`](../scripts/hk_csd_r44.py), 2026-10-25. Applied in `pipeline/build_data.py` `build()` (source id `hk_csd_r44`, type data, family "trade").

- **Source:** C&SD Trade-IDDS, Hong Kong imports of HS 7108 by origin, downloaded by the owner 2026-10-25 (<https://tradeidds.censtatd.gov.hk/>). File: [`../raw/hk_tradeidds_r44/imports_origin_RUS_7108_monthly_2018-2026.csv`](../raw/hk_tradeidds_r44/imports_origin_RUS_7108_monthly_2018-2026.csv): imports of Russian origin, monthly, HK$ '000, HS 710811/710812/710813 (almost all 710812, unwrought gold). Trade-IDDS forbids automated access (robots.txt), so the owner downloaded it by hand, as `uae_hkg_r43-notes.md` suggested.
- **Units:** HK$ to USD at the peg, 7.8. USD to EUR at the ECB monthly rates in `raw/ecb/EXR_2026-10-23.json`.

## Short answer

| | before (site) | after |
|---|---|---|
| HKG imports from Russia, January–August 2026, customs layer, EUR bn | 19.00 (17.45–20.61) | **18.29 (18.21–18.37)** |
| of which gold | estimated (Comtrade January–July plus an August estimate from seasonal ratios) | **17.13, measured** (USD 19.85bn) |
| of which non-gold | (inside the total) | 1.17 (1.08–1.24), estimated |

- The site's 2026 figure did not come from `trade_full.json`'s IMF-based value (17.87, range 13.7–23.3): `refresh_2026.json` already replaced it with Comtrade's January–July TOTAL plus an August estimate (median of three seasonal ratios, +3.94 EUR bn, range 3.74–4.50). That August estimate was too high: measured August gold is USD 3.55bn (EUR 3.06bn), and non-gold has run at USD 67–258m a month.
- Gold is 93.2% of Hong Kong's imports from Russia in January–July 2026 (Comtrade, 7108 / TOTAL).

## Method

- **Gold, January–August 2026:** C&SD, Russian origin, all HS 7108 lines, summed by month, converted at the month's ECB rate: EUR 17.127bn.
- **Non-gold, January–July:** Comtrade monthly TOTAL minus HS 7108 (`raw/uae_hkg_r43/comtrade_hkg_7108_monthly.csv`; C&SD's own records), EUR 1.022bn.
- **Non-gold, August:** not yet published; the January–July monthly mean (USD 170m), with the lowest (67m, July) and highest (258m, June) month as the range: EUR 0.146bn (0.057–0.222).
- **Total:** 18.295 (18.206–18.371). Basis "reported", period 2026-01..2026-08. The range is the non-gold uncertainty only, as the owner asked; the measured gold carries none. (The other years keep the generic own-report band, about −14%/+17%; 2026 is now much narrower than them.)
- Everything downstream is unchanged: only the rise over the pre-war level counts as gold in transit (`HK_METALS_SHARE`), the onward share to mainland China (`hk_onward`) and the share exported elsewhere (`hk_gold_r16.json`) move to those buyers, and the gold is valued at the 2021 gold price held flat. So most of Hong Kong's range still comes from where the gold goes next, not from the import value.

## Origin or consignment

C&SD's file is by **origin**: Russian-origin gold, whatever country consigned it. That is what the method needs, the gold Russia sold. Comtrade's figure for Hong Kong's imports from Russia (partner 643) is compared below.

| USD m | 2022 | 2023 | 2024 | 2025 | Jan–Jul 2026 |
|---|---|---|---|---|---|
| C&SD, Russian origin | 966.1 | 5,596.0 | 5,193.7 | 10,510.4 | 16,301.1 |
| Comtrade, partner Russia | 578.5 | 5,212.0 | 4,640.1 | 10,451.1 | 16,277.6 |
| difference | +67% | +7.4% | +11.9% | +0.6% | +0.1% |

- For 2025 and 2026 the two agree to 0.6% and 0.1%, so the choice does not matter for 2026. C&SD by origin is used because it is the right concept and it alone covers August.
- **Not changed, flagged for a later round:** in 2022–2024 Russian-origin gold exceeded Comtrade's partner-Russia figure by USD 0.39bn, 0.38bn and 0.55bn. That gold presumably came through a third country (the UAE is the obvious candidate). If it did, the UAE rule already passes some of it to Hong Kong as UAE gold, so switching those years to origin would risk counting it twice. Left as it is.

## Checks

- C&SD's January–July 2026 total (16,301) is within 0.15% of Comtrade's monthly HS 7108 rows (16,278); month by month within 2% (April −1.5%, July +1.5%), consistent with a revision or rounding of the HK$ conversion.
- The 2025 C&SD total (USD 10.51bn) against Comtrade's annual 10.45bn: +0.6%.
