# Does each country have sanctions on Russia? (round 58)

File: `sanctions_r58.json`. Script: `research/2026-10/scripts/sanctions_r58.py` (run `python3 -I` from the repository root). Downloads: `research/2026-10/raw/sanctions_r58/`. `_fetchlog.tsv` gives each download's URL, date, HTTP status and size. `search_extracts.json` holds dated extracts for sources that could only be reached through web search. Checked: 27 October 2026.

This is research only. It feeds pages that answer searches like "does Kazakhstan sanction Russia" or "which countries have sanctions against Russia". It does not change the map, and nothing in `pipeline/`, `site/` or `docs/` was touched.

## What each country record holds

Every one of the 231 entries in `site/data.json` has the fields below. `src` always lists ids from `sources`.

| field | meaning |
|---|---|
| `own_regime` | `yes` is `true`, `false` or `null`. `true` means sanctions or Russia export controls under the country's own law. `false` means none found: an EU member, or a British territory under the UK order, sets `applies_regime` (`"EU"` or `"GBR"`) instead. `null` means a territory where this was not checked. Also `since`, `basis` and `scope`. |
| `eu_aligned` | `status` is one of `eu_member`, `adopts_eu_measures`, `adopts_eu_measures_partial`, `none_found` or `not_checked_territory`. `in_hr_statement_2026_508` says whether the country is named in the EU High Representative's alignment statement on the 20th package. |
| `price_cap_coalition` | `member`, plus `how` (G7, founding member, joined, or via the EU) and `since`. |
| `export_controls` | `russia_controls` is `true`, `false` or `null`. `bis_supp3` gives the scope and Federal Register citation from US EAR Supplement No. 3 to Part 746. |
| `unfriendly_list` | Russia's list. `listed` is `true`, `false` or `null` (a territory not named itself whose sovereign is listed). Also `since`, `how` (named, as an EU member state, or under the United Kingdom) and `order`. |
| `position` | Only for countries whose government said publicly that it does not impose sanctions of its own: a short paraphrase, the date and the source. |
| `category` | One neutral label per entry, used for page wording (see below). |
| `notes` | Caveats for this entry, and how to word it. |

## Categories and counts (231 entries)

| category | n | entries |
|---|---|---|
| `eu_member` | 27 | the EU27 |
| `adopts_eu_measures` | 10 | ALB, AND, BIH (partial), CHE, ISL, MDA (partial), MKD, MNE, NOR, SMR |
| `own_regime` | 9 | USA, GBR, CAN, AUS, NZL, JPN, KOR (export controls and financial measures), SGP (export controls and financial measures), TWN (export controls only) |
| `financial_directive_only` | 1 | BHS: regulators told banks not to deal with people sanctioned by the US, UK, EU or Canada; it has no list of its own |
| `no_own_regime_stated` | 9 | CHN, IND, TUR, ARE, BRA, KAZ, GEO, SRB, HKG |
| `no_own_regime_found` | 137 | everyone else, including BLR and FSM |
| `territory_uk_order` | 10 | AIA, IOT, CYM, FLK, MSR, PCN, SHN, SGS, TCA, VGB, all under the Russia (Sanctions) (Overseas Territories) Order 2020 |
| `territory` | 28 | other non-state entries: Dutch, French, US, Australian, NZ-realm and Danish territories, BMU, GIB, BVT, MAC, ATA, ESH |

Other counts:
- `own_regime.yes`: 20. That is the 9 in `own_regime`, plus CHE, NOR, SMR, AND, MDA, BHS, plus ALB, BIH, ISL, MKD, MNE.
- Apply the EU or UK regime: 37 (the EU27 and the 10 British territories).
- Price cap coalition: 33. That is the G7, Australia, New Zealand (since 7 March 2024) and the EU27. The EU members count as "via the EU": the coalition statement treats the EU as a party.
- Listed in EAR Supplement No. 3: 38 countries. 37 of them are on the map; Liechtenstein is not in `data.json`. Singapore also has its own controls (MFA, 5 March 2022), so `russia_controls` is true for 38 map entries.
- Russia's unfriendly list: 58 map entries. That is the EU27, 18 named states, the Bahamas and 12 British overseas territories. Liechtenstein, Monaco and Ukraine are on the list but not in `data.json`.

`data.json` has no entry for Ukraine or Russia. The Ukraine rows in the script's tables are therefore unused.

## Russia's "unfriendly" list

The list is Government Order of 5 March 2022 No. 430-r. The text was read from the official scanned publication on pravo.gov.ru: page 2 of the order, and page 2 of Order 2018-r. It names:
- Australia, Albania, Andorra;
- the UK, with Jersey, Anguilla, the British Virgin Islands and Gibraltar;
- the EU member states;
- Iceland, Canada, Liechtenstein, Micronesia, Monaco, New Zealand, Norway, the Republic of Korea, San Marino, North Macedonia, Singapore, the USA, "Taiwan (China)", Ukraine, Montenegro, Switzerland and Japan.

It was amended twice:
- **23 July 2022, Order No. 2018-r:** added the Bahamas, and Guernsey and the Isle of Man under the UK.
- **29 October 2022, Order No. 3216-r:** the UK entry now reads "United Kingdom (including the Crown Dependencies and British Overseas Territories)".

ConsultantPlus shows 29.10.2022 as the current edition. On pravo.gov.ru I found no later amendment.

In September 2025 Lavrov said Russia is moving away from the term (search extract). That was a remark; the order itself has not changed.

The list does not name Moldova, Bosnia and Herzegovina, or the territories of EU states and the US. These records say `listed: null` with "not named; sovereign listed". We do not infer that they are covered.

A different Russian list limits hiring by diplomatic missions: the USA and Czechia from 2021, then Greece, Denmark, Slovenia, Croatia and Slovakia from July 2022. It is mentioned in `unfriendly_list_text.not_this_list` and is not used.

## How to phrase it on pages

Answer the question itself, with the date checked and the legal basis. Keep "has its own sanctions" apart from "complies with others' sanctions".

Suggested wording by category:
- **eu_member:** "Yes. As an EU member, {X} applies the EU's sanctions on Russia (Council Regulations 833/2014 and 269/2014), which every member agreed to in the Council. It is also part of the G7+ oil price cap through the EU, and Russia lists it as 'unfriendly'."
- **adopts_eu_measures:** "Yes. {X} is not in the EU but adopts the EU's sanctions on Russia under its own law ({basis})." For BIH and MDA add: "Official EU reports say its alignment is incomplete."
- **own_regime:** "Yes. {X} has its own sanctions on Russia under {basis}, since {since}." For KOR, SGP and TWN, give the scope plainly. Example: "Taiwan restricts exports of listed high-tech goods to Russia and Belarus. It has no general sanctions list."
- **financial_directive_only (Bahamas):** "{X}'s financial regulators told banks in March 2022 not to deal with people sanctioned by the US, UK, EU and Canada. It has no sanctions list of its own."
- **no_own_regime_stated:** "No. {X} has not imposed sanctions of its own on Russia. Its government has said {position.stance} ({date})." Kazakhstan: "No sanctions of its own; the government says it will not let its territory be used to get around other countries' sanctions." Avoid words like "refuses" or "sides with". Quote or paraphrase only what the source says.
- **no_own_regime_found:** "We found no sanctions of {X}'s own against Russia (checked {date})." Do not write "does not comply with sanctions". Firms there may still follow US or EU rules because of secondary-sanction risk.
- **territory_uk_order:** "The UK's sanctions on Russia apply in {X} through the Russia (Sanctions) (Overseas Territories) Order 2020."
- **territory:** "{X} is a territory of {sovereign}. We did not check whether {sovereign}'s sanctions extend to it."

Add Russia's side as a separate sentence where `unfriendly_list.listed` is true: "Russia lists {X} as an 'unfriendly' state (Order 430-r of 5 March 2022)." It is a list of countries Russia retaliates against. It is not a sanction by {X}.

For "which countries have sanctions against Russia", give the numbers: 27 EU members, 10 other European states that adopt EU measures, and 9 others with their own regimes (US, UK, Canada, Australia, New Zealand, Japan, Korea, Singapore, Taiwan). Ukraine has its own regime too but is not on the map. Never present the "unfriendly" list as the list of sanctioning countries. They overlap, but not fully: Micronesia is on Russia's list without sanctions of its own, and Moldova and Bosnia adopt EU measures without being listed.

## Sources and how strong they are

`sources[].type` says what kind of evidence each source is:
- `legal_text`: Russian orders, eCFR, UK SIs, Canadian and Australian regulations.
- `official_statement`: MFA Singapore, MFAT, FINMA, OFAC, the Bahamas Central Bank, the coalition statements.
- `official_mirror`: the 20th-package alignment statement as republished by PubAffairs; ConsultantPlus.
- `news`
- `search_extract`

Some official sites refused automated download with 403, 503 or a connection reset: consilium.europa.eu, dfat.gov.au, mofa.go.jp, meti.go.jp, regjeringen.no, lovdata.no, legislation.govt.nz, zakon.rada.gov.ua and mofa.go.kr. I did not try to get around this. For those facts the source is a dated search extract, and the type says so. These records rest on search extracts or law-firm summaries:
- Japan (start date and FEFTA basis);
- Korea (28 February 2022);
- Taiwan (start in 2022; exact day not established);
- Norway (Regulation 2014 No. 1076);
- San Marino (Decree-Law 35/2022);
- Moldova (alignment rate);
- every `position` statement.

Each one should be re-checked against the official page before it is quoted word for word.

## Unclear cases and doubts

- **Liechtenstein and Norway** are not named in the 13 May 2026 alignment statement on Decision 2026/508 (20th package). That statement names only ALB, BIH, ISL, MDA, MNE, MKD and UKR. Norway is named in the 29 June 2026 statement on Decision 2026/1351. Norway is coded `adopts_eu_measures` because its own regulation follows EU packages by Government decision, and it may have adopted the 20th package later. Not verified.
- **Bosnia and Herzegovina:** it is named in EU statements, but national implementation is reported to be incomplete. Coded partial; the extent was not verified.
- **Moldova:** partial. It adopts some EU and US measures through decisions of its Interinstitutional Supervisory Council.
- **Andorra:** the government decrees adopting EU measures are confirmed only by a May 2026 news report. The start date was not found.
- **Albania, Montenegro and North Macedonia:** coded from the alignment statement. Their own national legal acts were not checked.
- **Switzerland, Norway and Iceland:** they apply the price cap through EU-aligned measures, but none of them is a coalition member in the statements found. Coded `member: false`.
- **Korea and Taiwan:** `own_regime.yes = true` but narrow in scope (export controls; financial measures for Korea). Pages should say so. The eCFR gives Taiwan's citation as "87 FR 12183, 2/27/2023", apparently a typo for 88 FR. It is kept verbatim.
- **New Zealand:** the Russia Sanctions Act 2022 is confirmed by MFAT. The exact assent date was not re-checked, so `since` is "2022-03".
- **Bermuda and Gibraltar:** they are not in the 2020 Overseas Territories Order schedule. Both apply UK sanctions under their own laws, which were not checked, so they are coded `territory`. Russia lists both (Gibraltar named from March 2022).
- **Dutch Caribbean (ABW, CUW, SXM, BES), French and US territories, Greenland and the Faroes:** the sovereign's regime may or may not extend to them. The Faroes, for example, are outside the EU. Left as `null`.
- **Kazakhstan, UAE and Georgia:** officials have said both "we do not sanction" and "we do not help others get around sanctions". The `position` field keeps only the sourced part. Georgia's comments about not allowing evasion are mentioned in its notes but not sourced to an official text.
- **Micronesia:** cut diplomatic ties on 25 February 2022 and is on Russia's list. No sanctions measures of its own were found.
- **Belarus, Iran, North Korea, Syria and others:** coded `no_own_regime_found`, which is accurate but bare. Pages for Belarus should add that it is itself under Western sanctions.
- **The site's existing lists differ:** `site/index.html` (`OWN_REGIME`, `ALIGNED`) and `pipeline/build_data.py` (`STRIKE_EMBARGO`) use narrower sets. `OWN_REGIME` covers USA, GBR, JPN, CAN, AUS, NZL and KOR; `ALIGNED` covers CHE, LIE, NOR, ISL, MNE, ALB, MKD, BIH and MDA. Round 58 adds SGP, TWN, AND, SMR and BHS as having measures. It does not change those files.
