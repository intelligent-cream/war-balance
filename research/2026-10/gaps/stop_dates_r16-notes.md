# "Required by sanctions" from each country's actual stop date (round 16)

File: `stop_dates_r16.json`, built by [`scripts/stop_dates_r16.py`](../scripts/stop_dates_r16.py) from the sanctions working directory (the same scripts and Eurostat Comext downloads as `sanctions_share.json`, not in the repository). Gathered 2026-10-20. Not yet reviewed by a person.

Raised by review 5 (M4), approved by the owner. `sanctions_share.json` counted a fall as "required" from the date each ban took effect, whether or not the country had already stopped. Lithuania's panel said "86% required by sanctions" although Lithuania stopped Russian crude before the EU ban. Round 16: the required share reflects only what was still flowing when a ban took effect; anything stopped earlier is the country's own choice. A label only: no total changes.

## Rule

- A banned fuel whose imports a country stopped before every applicable ban date (the low, central and high dates of `sanctions_share-notes.md`) counts as its own choice in every year.
- Pipeline crude that stopped before its exemption ended (23 June 2023 for Germany and Poland) is not required either.
- Gas was never banned by the EU (LNG only for short-term contracts from 25 April 2026), so early stops of gas (Lithuania April 2022; Latvia and Estonia by law from 1 January 2023) do not change the required share; gas Russia cut off itself stays labelled as before.

## Stop dates and evidence

| country | product (HS) | stopped | evidence | checked |
|---|---|---|---|---|
| Lithuania | crude (2709) | end of March 2022 (set to 1 April 2022) | [Baltic Times (BNS), 25 March 2022](https://www.baltictimes.com/orlen_lithuania_plans_to_refine_saudi_oil_only___minister/): Orlen Lietuva renounces Russian oil, will refine only Saudi oil; [S&P Global, 26 April 2022](https://www.spglobal.com/energy/en/news-research/latest-news/crude-oil/042622-polish-top-refiner-pkn-orlen-ready-for-any-russian-oil-ban-ceo): Mazeikiai had stopped taking Russian cargoes at the end of March | Baltic Times fetched; S&P **not verified** (HTTP 403; as reported in search results) |
| Lithuania | gas (2711) | 2 April 2022 | [LRT, 4 April 2022](https://www.lrt.lt/en/news-in-english/19/1661749/lithuania-becomes-first-eu-country-to-stop-russian-gas-imports): imports for Lithuania's needs 0 MWh | fetched; gas not banned, no effect |
| Finland | crude (2709) | 20 July 2022 | [Neste, 6 April 2022](https://neste.com/news/one-of-the-last-remaining-crude-oil-cargoes-from-russia-will-arrive-at-neste-tonight): 85% of Russian crude replaced; "The existing supply contracts for Russian crude oil end in July"; the last cargo on 20 July 2022 per [Neste's response to the war](https://www.neste.com/nestes-response-to-the-war-in-ukraine): "The last of the crude oil cargoes from Russian origin arrived at the Porvoo refinery on Wednesday 20 July 2022" | both fetched; the 20 July date **confirmed** on Neste's page (check 16, 20 October 2026) and by monthly customs data (last imports July 2022) |
| Poland | coal (2701, 2704) | 16 April 2022 | [Baker McKenzie](https://sanctionsnews.bakermckenzie.com/poland-introduces-sanctions-against-russia-and-belarus/): Poland's Act banning Russian and Belarusian coal (CN 2701, 2704) effective 16 April 2022, before the EU ban (10 August 2022) | fetched |
| Poland | pipeline crude | 25 February 2023 | [WION, 26 February 2023](https://www.wionews.com/world/polish-energy-group-says-russia-halted-oil-pipeline-deliveries-565942/amp): Orlen says the Russian side stopped Druzhba deliveries; about 10% of its crude. **Stopped by Russia** (round 16b): labelled with Russia's cut-offs, not own choice (`moved_stopped_by_russia`) | fetched in round 16; HTTP 403 in check 16, where monthly customs data confirmed it (0.50 Mt in February 2023, nil from March) |
| Germany | pipeline crude | 1 January 2023 | [Stars and Stripes (dpa), 20 December 2022](https://www.stripes.com/theaters/europe/2022-12-20/germany-russian-oil-2023-8490978.html): Leuna and Schwedt stop ordering Russian crude from the new year | fetched |

Searched without a usable stop date: Estonia's and Latvia's oil products and coal-tar oils, Latvia's steel, Denmark's and Sweden's crude. They keep the ban-date split.

## Effect on the label (share of the fall in purchases from Russia required by sanctions, 2022–2026)

| country | before | after |
|---|---|---|
| Lithuania | 87% | 21% |
| Finland | 71% | 27% |
| Poland | 76% | 38% |
| Germany | 49% | 30% |

Moved to own choice, EUR bn at pre-war prices (central, 2022–2026): Lithuania 9.1, Finland 13.6, Poland 18.7, Germany 22.0 (`stop_dates_r16.json`).

## Caveats

- Stop dates are company and government statements, not customs months; a cargo contracted before the date may have arrived after it.
- A partial stop (Neste replaced 85% by April 2022) is treated by its end date: the whole product counts as own choice, because it stopped before the ban took effect.

## Round 16b (check 16, N6; approved by the owner)

Poland's pipeline crude was stopped by Russia (Transneft halted Druzhba deliveries, 25 February 2023), not by Poland, so
it is not the country's own choice. `scripts/stop_dates_r16.py` now also writes, per year, the part of
`moved_to_own_choice` that comes from that stop (`moved_stopped_by_russia`: the difference between the run with and
without the pipeline stop; `pipeline_stopped_by_russia` lists the countries). The other figures are unchanged (re-run
on 20 October 2026). `apply_stop_dates()` adds that part to the share "cut off by Russia" (`sanctions.to_rus.cut`,
with `oil_cut_from`), so Poland reads 38% required, 50% cut off by Russia (gas and pipeline oil), 12% own choice.
Germany's pipeline crude stays own choice: its refineries stopped ordering. Finland's 20 July 2022 date is now
confirmed on Neste's page (check 16).
