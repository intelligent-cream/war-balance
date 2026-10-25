# pipeline/fetch: download scripts for the open-data sources

Each script downloads one source into `research/2026-10/raw/<folder>/`. Every output file has the retrieval date in its name, so a new run never overwrites an earlier one. Each script prints a short summary when it finishes.

None of the scripts changes a research file (`trade.json`, `crea.json`, `gaps/*.json`). They create the raw inputs; the research step reads them.

All scripts are standalone [uv scripts](https://docs.astral.sh/uv/guides/scripts/), with their dependencies declared inline. Run them from anywhere:

```sh
uv run pipeline/fetch/comtrade.py      # about 1-2 h without a key (quota waits); resumable
uv run pipeline/fetch/crea.py
uv run pipeline/fetch/eurostat_comext.py
uv run pipeline/fetch/eurostat_tp.py
uv run pipeline/fetch/imf_imts.py
uv run pipeline/fetch/fts.py
uv run pipeline/fetch/unhcr.py
uv run pipeline/fetch/ecb.py
uv run pipeline/fetch/ukrstat.py
uv run pipeline/fetch/build_trade_check.py   # rebuild trade.json's figures from the raw Comtrade pull; read-only
uv run pipeline/fetch/totals.py              # headline totals (used by the monthly workflow)
uv run python pipeline/raw_manifest.py       # then refresh MANIFEST.json
```

`_common.py` holds the shared helpers: HTTP retries and back-off, dated output paths, gzip JSON, and JSON-stat flattening. Set `FETCH_DATE=YYYY-MM-DD` to choose the date in the file names.

## Sources, endpoints and output

All endpoints were checked from the sandbox on 2026-10-23. None needs an API key.

| script | endpoint | output folder | what |
|---|---|---|---|
| `comtrade.py` | `comtradeapi.un.org/public/v1/preview/C/{A,M}/HS` (or `/data/v1/get` with `COMTRADE_KEY`) | `comtrade_api/` | annual TOTAL 2019–2025: all reporters against Russia and Ukraine (p643/p804, M/X), plus Russia's and Ukraine's own reports by partner (r643 to 2021, r804); exports to Russia at HS4 for the 22 dual-use headings plus 8708, 2021–2025; monthly TOTAL for 2026 |
| `crea.py` | `api.russiafossiltracker.com/v0/counter`, `/v0/price`, `/v0/chart/departure_by_ownership`, `/v0/counter_last` | `crea_api/` | payments by destination and fuel (calendar years from 2021 and from 2022-02-24, monthly); prices; daily shadow vs G7+ tanker departures |
| `eurostat_comext.py` | `ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409` | `comext/` | EU27 members against RU/UA, monthly and annual from 2019: TOTAL, 27, 2701/2709/2710/2711, 7108 and the dual-use HS4 headings |
| `eurostat_tp.py` | `.../dissemination/statistics/1.0/data/migr_asytpsm` | `eurostat_tp/` | temporary protection, Ukrainians, monthly from 2022-03 (JSON-stat, the same format as `migr_asytpsm_UA.json`) |
| `imf_imts.py` | `api.imf.org/external/sdmx/2.1/data/IMF.STA,IMTS/...` (SDMX CSV) | `imf_imts/` | every country's X/M with RUS and UKR, plus Russia's and Ukraine's own series by partner; annual and monthly from 2019 |
| `fts.py` | `api.hpc.tools/v1/public/fts/flow?countryISO3=UKR&year=Y` | `fts/` | OCHA FTS humanitarian flows to Ukraine, one file per year from 2022 |
| `unhcr.py` | `api.unhcr.org/population/v1/population/?coo=UKR&coa_all=true` | `unhcr/` | refugees from Ukraine by country of asylum, end-year from 2021 (2026 is empty until UNHCR publishes) |
| `ecb.py` | `data-api.ecb.europa.eu/service/data/EXR/...` | `ecb/` | annual and monthly euro reference rates (USD and 14 others) |
| `ukrstat.py` | `stat.gov.ua/sdmx/workspaces/default:integration/registry/sdmx/2.1/data/...` | `ukrstat/` | Ukraine's own trade by partner: annual to 2024 and Jan–Sep 2025 cumulative (all that Ukrstat publishes as of 2026-10-23) |
| `epdk_entsog.py` | `epdk.gov.tr` market reports (gas, oil); `transparency.entsog.eu/api/v1/operationalData` (Physical Flow) | `epdk/`, `entsog/` | round 43: Türkiye's gas and crude imports by origin (EPDK, 2005–2026); metered daily flows at the TurkStream, Balkan and Central European points from 2021-11, summed to months |
| `energy_r44.py` | Eurostat `nrg_ti_oil`/`nrg_ti_gas`; Comtrade public preview `C/A/HS`; `unctadstat-api.unctad.org/bulkdownload/US.FleetBeneficialOwners` | `energy_r44/` | round 44: Czechia's crude and gas imports from Russia by origin (2015 onward), Czechia's and Türkiye's imports from Russia by heading, the fleet by country of beneficial ownership (Malta, Greece, Cyprus, Russia); status and SHA-256 of the documents consulted (MERO, EPDK, BOTAŞ, Transport Malta) |
| `eaeu_r44.py` | `eec.eaeunion.org` trade-statistics pages; `stat.gov.kg`, `stat.gov.kz`, `armstat.am`; `dataportal.belstat.gov.by` API | `eaeu_r44/` | round 44: EAEU members' own statistics of trade with Russia (Kyrgyzstan's refined totals and 2026 first release, Kazakhstan, Armenia by origin and trading country), the EEC's 2015–2021 member-pair tables and the latest period each EEC product offers; downloads in `src_<date>/`, extract `eaeu_r44_<date>.json` |
| `japan_r44.py` | `www.e-stat.go.jp` (MoF Trade Statistics of Japan, "Commodity by Country (Import)", statistics code 00350300); Comtrade public preview `C/A/HS` | `japan_r44/` | round 44: Japan's imports from Russia by 9-digit HS code, yearly and monthly, 2014–2026 (only the Russia rows kept), and Comtrade's Japan/Korea/China imports from Russia (LNG and TOTAL) as a cross-check |

Not scriptable from here (manual review rounds):
- Kiel UST: an xlsx whose URL changes with every release.
- KSE Russian Oil Tracker: a PDF each month. Copies are in `raw/kse_rot/`.
- Euroclear: www.euroclear.com blocks scripts (Cloudflare 403); `cf.euroclear.com` works.
- ukrstat.gov.ua: its TLS certificate has expired.
- customs.gov.ua: returns 403.
- The World Bank API works but is not scripted yet (ENTSOG is, in `epdk_entsog.py`).

Large responses are written as `.json.gz` holding `{"columns": [...], "rows": [[...]]}` plus the query metadata. `*.csv.gz`, `*.pdf`, `*.html` and `*.xlsx` under `raw/` are git-ignored, so the scripts never write `.csv.gz`.

## How trade.json is derived from the raw files

This is reconstructed from `research/2026-10/trade-notes.md`, the `source` and `notes` fields of `trade.json`, and the comparison below. The original `scripts/build_trade.py` and its inputs in `research/raw/trade/` are not in the repository.

1. **Query.** UN Comtrade public preview, annual, HS, `cmdCode=TOTAL`, `customsCode=C00`, `motCode=0`, `partner2Code=0`, one query per year and flow:
   - `p643_{M,X}_{year}` and `p804_{M,X}_{year}`: all reporters against Russia and against Ukraine;
   - `r804_{M,X}_{year}`: Ukraine's own report by partner;
   - `r643_{M,X}_2021`: Russia's own report by partner. Russia files no partner detail after 2021.

   The value is `primaryValue` in USD: imports are CIF and exports FOB, as reported.
2. **Currency.** Each value is divided by the ECB annual average USD per EUR (`EXR.A.USD.EUR.SP00.A`: 2021 1.18274, 2022 1.05305, 2023 1.08127, 2024 1.08238, 2025 1.12998) and by 1e9, giving EUR bn. The values are not rounded.
3. **Indicators** for each economy (M49 mapped to ISO3 by `trade.json["m49_to_iso3"]`; 490 "Other Asia, nes" = TWN):
   - `imports_from_RUS` = the economy's own p643 M; `exports_to_RUS` = p643 X;
   - `imports_from_UKR` = p804 M; `exports_to_UKR` = p804 X.
4. **Mirror fallback**, used only when the economy did not report that flow and year:
   - the partner's report with the flow reversed: Russia's 2021 report (r643, 2021 only) and Ukraine's report (r804, 2021–2024);
   - `mirror[indicator][year] = true` marks these values;
   - there is no fallback for trade with Russia after 2021, and none for Ukraine in 2025, because Ukraine's 2025 report is not in Comtrade. Missing values are null, never estimated.
5. **Special entries:**
   - `RUS.imports_from_UKR` / `exports_to_UKR`: Russia's own report for 2021, then Ukraine's report (mirror) from 2022;
   - `UKR`'s trade with Russia: Ukraine's own report.
6. **Dual use** (`exports_to_RUS_dual_use`). For 2021 and 2023–2025, the sum of p643 X over the 22 HS4 headings (8411, 8471, 8473, 8482, 8483, 8486, 8504, 8517, 8525, 8526, 8529, 8532, 8533, 8536, 8537, 8541, 8542, 8548, 8803, 8807, 9013, 9014) in EUR bn.
   - The value is 0 when the reporter filed a total export to Russia but no row in these headings.
   - HS 8708 is kept apart as `hs8708_*`.
   - `latest` / `latest_year` is the most recent of 2023–2025 with a reported total. `by_hs4_latest_usd` holds the raw USD per heading for that year.
7. **Certainty** is "A" for every value (official customs data).

**Check (2026-10-23).** `build_trade_check.py` applies steps 1–6 to `raw/comtrade_api/comtrade_annual_{total,hs4}_2026-10-23.json.gz`:
- **3,773 of 3,776** values in `trade.json` match within 0.5%. This covers the four indicators for 2021–2025, the mirror flags and the dual-use sums. The rule above therefore describes the original build.
- The only differences come from Papua New Guinea's 2024 report, which reached Comtrade after the 2026-10-17 pull:
  - `exports_to_UKR` 2024: 0.0005 (mirror) becomes 0.0299 (own report);
  - two new small values.
- Not checked: `latest`/`by_hs4_latest_usd`, the `name` field, and the `notes` text.

Other inputs of the map that sit on top of `trade.json` are produced by the research step, not here. They include `gaps/trade_full.json`, `gaps/nonreport.json` (non-reporters), the IMF fills and the 2026 refresh (`gaps/refresh_2026.json`).

## Sizes (2026-10-23 run)

About 5.5 MB is committed in all (plus 2.5 MB of git-ignored PDFs and HTML under `kse_rot/` and `euroclear/`). The largest files:
- `comext/` 2.2 MB
- `imf_imts/` 1.0 MB
- `crea_api/price_*` 0.9 MB
- `fts/` 0.8 MB

A monthly run adds about the same again, so keep only the newest dated file of each family in git, or move older ones to "listed only" in the manifest.

## Automation

See `docs/reference/fetch-workflow.yml.example`. It is a monthly GitHub Actions job that runs these scripts and `totals.py --compare`. When a total moves by more than 1%, it opens a pull request with the new raw files and the `trade.json` rebuild check. It is not active until it is copied to `.github/workflows/`.
