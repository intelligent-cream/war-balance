# Wagner Group and Africa Corps in host countries (round 40)

File: `wagner_r40.json` (same folder). Generated 2026-10-23. The file is a research input only: `build_data.py` does not read it yet. The builder script and the downloaded reports are not in the repository. The JSON keeps every input with its basis, and the sources are listed below. All URLs were checked on 2026-10-23.

The owner decided to count, as money toward Russia, what host governments pay Wagner / Africa Corps for security services and what Wagner-linked firms take from the hosts' resources. A new tag, "Russian forces in the country", comes with it. Until now this money was in no part of the map. `arms_r6-notes.md` says so: "Wagner / Africa Corps fees ... are not included here or, as far as checked, anywhere else."

## Bottom line

- **Gross paid or taken from 2022 to August 2026: about EUR 2.5bn.** By host:
  - CAR 1.0 (security 0.30, gold, diamonds and timber 0.71);
  - Mali 0.62;
  - Sudan 0.61 (gold);
  - Libya 0.20;
  - Burkina Faso, Niger and Equatorial Guinea 0.08 together.
- **Russia's gain on that money: about EUR 0.6bn.** This is after fighters' pay, equipment, transport, local partners and miners. CAR 0.30, Sudan 0.12, Mali 0.09, Libya 0.05.
  - RUSI (2025) concludes that Mali was "not profitable for Wagner" and that the CAR was very profitable. The yearly profits would "not be enough to pay the costs of only one day of Russia's fighting in Ukraine".
- **Change against the no-war level (what the map would count), 2022 to August 2026, EUR bn:**

| host | toward Russia, central (range) | % of GDP | what drives it | certainty |
|---|---|---|---|---|
| Central African Republic | +0.11 (−0.03 to +0.32) | +4.4% (−1.2 to +13.4) | Ndassima gold ramping up after the 2020 concession; timber from 2021 | D (presence A) |
| Mali | +0.01 (−0.02 to +0.10) | +0.04% | contract signed before the war, so only its 2024 build-up counts; **+0.09 (0.37%) with the strict calendar-2021 level** | D (payments C, presence A) |
| Equatorial Guinea | +0.006 (0.001 to 0.025) | +0.05% | Africa Corps from Aug 2024 | D |
| Burkina Faso | +0.006 (0 to 0.034) | +0.03% | Africa Corps from Jan 2024 | D |
| Niger | +0.003 (0 to 0.022) | +0.02% | Africa Corps from Apr 2024 | D |
| Libya | −0.04 (−0.08 to +0.02) | −0.08% | fewer Wagner after the 2022 drawdown to Ukraine; payer may be the UAE | D |
| Sudan | −0.12 (−0.63 to +0.13) | −0.28% | Wagner gold fell after Sudan's own April 2023 war | D |
| Mozambique, Madagascar | 0 | 0 | presence ended in 2019 | C |

The **world sum is about zero (central −0.03, range −0.77 to +0.65).** Without the two falls (Sudan, Libya) it is +0.13 toward Russia.
- The **CAR is the only host where this moves the map visibly.** It is a small economy (GDP EUR 2.4bn) and is not ranked.
- Every other host moves by less than 0.1% of GDP, apart from Sudan, and Mali under the strict rule.

## 1. The rule

**What counts.** Russia's gain is the payment or the resource value minus the operation's real costs. It is the project's net-gain rule applied to a service Russia sells.
- The real costs are:
  - fighters' pay (about USD 3,000 a month, paid in roubles into Russian accounts);
  - equipment wear and the MoD's charge for aircraft, drones and transport (up to 30% of the contract, RUSI);
  - local partners (for example Aswar in Sudan: USD 100,000 a month plus staff salaries);
  - artisanal miners.
- The arms net gain (0.04–0.05) is **not** used. The gain shares come from RUSI's cost and revenue evidence:

| line | gain share low / central / high | basis |
|---|---|---|
| Mali security | 0 / 0.15 / 0.35 | RUSI: wages about USD 4m a month of 10.8m; MoD up to 30%; arrears; "not profitable" |
| CAR security | 0.1 / 0.3 / 0.5 | RUSI: contingent costs USD 25–100m a year against EUR 91–200m revenue; profit EUR 0–100m+ |
| CAR gold, diamonds, timber | 0.15 / 0.3 / 0.5 | Wagner leases concessions and "taxes" artisanal miners (RUSI interviews); tax exemptions from Bangui |
| Sudan gold | 0.08 / 0.2 / 0.4 | margin of a smuggler-processor: buys below world price and avoids export tax |
| Libya | 0.05 / 0.25 / 0.45 | contract of the Syria type, cost close to revenue |
| Burkina Faso, Niger | 0 / 0.15 / 0.35 | as Mali |
| Equatorial Guinea | 0.1 / 0.25 / 0.45 | guard duty in the capital |

**No-war level.** Only the change against the 2021 level counts, held flat (2026 prorated 8/12), unless evidence says the war changed it.
- **Mali.** The deal was reported in September 2021 (Reuters: about 6bn CFA francs, USD 10.8m a month), and Wagner arrived in December 2021 (US Treasury). It predates the invasion.
  - So the 2021 level is the contract's run rate, 0.13bn a year, not the one month paid in calendar 2021. This matches how `rusarms` treats contracts already in the pipeline.
  - The strict calendar-2021 level is kept as `alt_strict_2021` for the method band: +0.09bn instead of +0.01.
- **CAR, Libya and Sudan** had Wagner before 2022, so their 2021 levels are held flat.
- **Burkina Faso, Niger and Equatorial Guinea** had no Russian forces in 2021, so everything since counts. Their deployments follow the Sahel coups, not the war. Like any extra purchase from Russia, they count anyway.
- **Did the war change it?** Partly, in both directions:
  - Wagner pulled several hundred fighters out of Libya for Ukraine in spring 2022 (FT, via Al Jazeera).
  - The CAR contingent shrank from about 2,000 (2021) to 600–1,600 (2024).
  - Prigozhin's mutiny and death in 2023 moved the business under the MoD (Africa Corps).
  - CNN (2022) and a US cable (Politico, Jan 2023) tie the Sudan gold flights and the Ndassima expansion to funding the war.
  - None of this changes the rule: change against 2021. The falls get a `not_buyer_choice` share for the panel, as `rusarms` does.

**Gold** is valued at the 2021 price (USD 1,799/oz). This is the project's no-war gold rule (`GOLD_NOWAR`, round 16). The value at the actual price is in `gross_usd_bn_actual_price` for the `gold_actual` method band. At 2025–2026 prices, CAR's gold is worth about 1.9–2.5 times more.

**Where the money went.** The central counts the whole Russian network's gain wherever it was banked: UAE traders, CAR front companies, Russia. This follows the project's treatment of Russian-owned firms' profits (`russian_owned_r10`). `reached_russia` gives the part that plausibly reached Russia itself:
- Africa Corps (an MoD body): about 1.
- Prigozhin-era security margins: 0.5 (0.3–0.8).
- CAR resources: 0.4 (0.2–0.7). They were sold mostly through Dubai (Industrial Resources General Trading, Kratol Aviation), but LLC DM sold gold in Russia (Treasury jy1581).
- Sudan gold: 0.5 (0.3–0.8). It was flown to Russia via Latakia (CNN), and part was sold in the UAE.

In total about EUR 0.31bn of the 0.58bn gain plausibly reached Russia.

## 2. Per country

### Central African Republic (presence 2021–2026: A)

**Presence**
- Wagner arrived in 2018 as "Russian instructors": 500 men, up to about 2,000 in 2021, and 600–1,600 in 2024 (RUSI).
- The UN Panel (S/2023/360, paras 103–105) documents Russian instructors fighting with the army, and Midas Ressources operating the Ndassima processing compound with Russian vehicles. Those vehicles were notified in 2021 as a temporary transfer for the election.
- In 2025 Moscow pressed Bangui to switch to Africa Corps and pay cash. Bangui prefers to pay in gold, uranium and iron (AP, Aug 2025).

**Security payments**
- RUSI (Table 1, citing Osborn and Zufferey) gives EUR 91.2m a year from the CAR government, 2018–2022: EUR 7.6m a month, EUR 391m in all.
- That is about 4% of GDP and about a quarter of state revenue, and it may include in-kind items. The central is set at USD 70m a year (35–110), flat. There is no evidence the amount changed after 2021, so the change is 0 ± 0.006 a year.

**Resources**
- **Gold.** Ndassima (25-year concession to Midas, 2020) is worth USD 100–290m a year by expert estimates (Blood Gold Report, NBC, RUSI), or 1.6–4.7 t. US Treasury puts the deposit at "more than one billion dollars". The CAR mines ministry says USD 2.8bn.
  - AXMIN's early-stage reserves (1.54m oz; USD 280–310m of development costs still needed in 2013) argue for the lower half of the range.
  - Tonnes used: 1.0 (2021), 2.0, 2.8, 2.5, 2.2, and 1.4 for 8 months of 2026.
- **Diamonds.** Diamville and Lobaye Invest exported USD 12m in 16 months legally (OCCRP/EIC), "tens of millions" with smuggling. Central USD 15m a year.
- **Timber.** Bois Rouge's 186,600 ha permit dates from February 2021. A Wagner source puts exports at USD 20m a year.

**Result:** gain EUR 0.30bn (security 0.09, resources 0.21). Change +0.11, all of it from resources.

### Mali (presence Dec 2021–2026: A)

**Presence**
- Wagner from December 2021 (Treasury jy1645), about 1,000 at first and up to 2,500 in 2024.
- Wagner announced its exit on 6 June 2025, and Africa Corps (MoD) took over (Al Jazeera).
- The junta and Africa Corps lost Kidal in late April 2026 (Al Jazeera; ADF).

**Payments**
- Reuters (Sept 2021, four sources) reported USD 10.8m a month. The Blood Gold Report says more than USD 200m from Dec 2021 to June 2023.
- ADF (May 2026) says "nearly USD 1 billion" since 2021 and at least USD 10m a month, paid in cash. That total may include arms, so it is used only as the high end.
- Payment was partly in gold levied from mining firms (RUSI, War on the Rocks). The Sentry (Aug 2025) says Wagner went "unpaid for months".
- Central: USD 0.13bn (2022), 0.15, 0.17, 0.14, and 0.09 (Jan–Aug 2026).

**Resources:** none. No concession was confirmed (RUSI; The Sentry). The Yadran gold refinery (groundbreaking June 2025) is a commercial Russian firm and would belong in `russian_owned` if it starts producing.

**Result:** gain EUR 0.09bn. Change +0.01 (run-rate rule) or +0.09 (strict).

### Sudan (presence 2021–2023: B; 2024–2026 left out of the tag)

**Presence**
- M-Invest and Meroe Gold have been in Sudan since 2017 (Treasury sm1058, 2020). Meroe Gold is now Al-Solag (UK designation of 20 July 2023).
- In the April 2023 war Wagner backed the RSF. Russia later courted the army: a naval-base deal was announced in February 2025 and frozen in December 2025.
- No confirmed Russian unit has been in Sudan after 2023.

**Gold**
- CNN (July 2022) counted at least 16 Russian gold flights in 18 months, one with about 1 t of gold declared as biscuits.
- Leaked central-bank data show 32.7 t unaccounted for in 2021. That is all smuggling, not only Wagner's.
- The Blood Gold Report assumes half of USD 1.9bn a year reaches Wagner and the Kremlin. That is taken here as above the high end, because Sudan's smuggling also runs through the RSF's own firms and the UAE.
- Tonnes used: 5 (2021), 6, 3, 1, 0.8, and 0.5 for 8 months of 2026, each with a wide range.

**Result:** gain EUR 0.12bn. Change −0.12, because the flows fell with Sudan's own war (not_buyer_choice 0.6).

### Libya (presence 2021–2026: B)

**Presence**
- Wagner since late 2018: up to 2,000 according to the UN Panel (S/2021/229).
- In spring 2022, 300–400 to about 1,000 were pulled out for Ukraine.
- From 2024 Africa Corps has used al-Jufra, Brak al-Shati, al-Khadim and Maaten al-Sarra as its Sahel hub (All Eyes on Wagner).

**Payments**
- No figure is public. The estimate is cost-based: RUSI's Syria cost of USD 5,150 per fighter-month, applied to 1,200–2,000 men in 2021 and fewer after 2022.
- **The payer may be the UAE.** The Pentagon IG (2020, via Foreign Policy) said the UAE "possibly" funded Wagner. The line is attributed to Libya here, as `arms_r6` attributes Libya's arms.
- No oil income to Wagner is documented, although Wagner guarded the Sharara and Es Sider sites.

**Result:** change −0.04 (toward Ukraine).

### Burkina Faso, Niger, Equatorial Guinea (presence from 2024: B, B, C)

**Presence**
- Burkina Faso: 100 Africa Corps landed on 24 January 2024, with 200 more planned (OSW). Wagner in 2022–23 was alleged and denied (Al Jazeera).
- Niger: about 100 instructors and an air-defence system arrived on 10–12 April 2024 (CNN).
- Equatorial Guinea: 100–200 from about August 2024 (Reuters, via BBC/Ghanaian Times), and 100–300 in 2026 (Fides, Jeune Afrique). The government denies they are there.

**Payments**
- None is public. The estimate is 100–300 men at USD 5,000–10,000 per man-month. The low end is 0, in case Moscow carries the cost as influence spending.
- Niger's possible uranium sale to Russia would be trade, not this part.

### Mozambique, Madagascar

Mozambique had about 200 Wagner fighters in Cabo Delgado from September to November 2019. In Madagascar, the 2018 election work and the Kraoma chromite venture ended in 2019. Both are 0 for 2021–2026 and get no tag. Their pre-2021 years are kept in `presence.years_before_2021`.

## 3. Overlaps

- **`rusarms` (`russian_arms_exports.json` + `arms_r6.json`).** These cover weapons only, and Wagner fees are explicitly outside them. Two edges:
  - Mali's 2025 armour convoys were "partly for Africa Corps" (`arms_r6`). Mali's payment for that kit could sit in both files.
  - ADF's USD 1bn total, used only as Mali's high end, may include arms.
  - Both overlaps are under EUR 0.01bn of gain.
- **`hidden` (`uncovered.json`).** It covers Russian-origin gold. Wagner's African gold is African-origin in UAE customs, so it is not there.
  - Sudanese gold flown to Russia and re-exported as Russian gold could earn Russia's gold gain a second time. That is at most a few tonnes in 2021–2022 and below EUR 0.01bn. No adjustment is proposed.
- **`military_rus` and its relatives.** They cover the other direction (weapons sent to Russia), so there is no overlap.
- **`nonreport.json` (CAF).** CAR's unreported imports of Russian goods and wheat are Russia's goods sales.
  - Wagner's own imports of Russian equipment (Logistique Economique Etrangere, Treasury jy2384) are a cost inside this file's gain share, not a second gain.
- **`russian_owned_r10`, `company_taxes_r6`, `companies_all`.** No Wagner firm is in them (checked: CAF, MLI, SDN and BFA are all zero). Nordgold and Yadran are commercial Russian firms and belong there, not here.
- **Customs (`trade_full`).** Nothing of this file is in customs. Sudan reports zero gold exports to Russia.

## 4. Proposal for the pipeline

**Code**
- Add a new part with key `wagner`, labelled "Russian forces paid here (Wagner / Africa Corps)". It goes on the side of Russia's earnings from trade (orange), next to `rusarms`.
- Add a new `apply_wagner()` called right after `apply_russian_arms()`. It does `add_extra(c, "wagner", label, d["to_russia_eur_bn"], d["certainty"], sid)`, with `not_choice` taken from the largest line's `not_buyer_choice`.
  - The series are already Russia's gain and already the change against 2021 (positive = toward Russia).
  - No net-gain multiplier and no further baseline.
- Add a source `wagner` (kind "report") pointing to the RUSI PDF and these notes.

**Site and method pages**
- `index.html` touch points sit next to every `rusarms` entry: the FLOWS list, the method link, the labels, the "Russia's earnings from trade" group, the "mostly ..." phrases, the direction sentence, part explanations and the "Other" bucket.
- Method: a subsection "Russian forces paid by host countries" under "Weapons bought from Russia" in `russia-state-and-companies.md` (and `docs/reference/method/`), plus a row in `overview.md`'s parts table.

**Tag**
- "Russian forces in the country" (`rusforces`), from `presence.years`. It is shown when any year from 2022 to the chosen year is present, and it changes no number.
- Add it to `tags.md` and `storyTags()`, after `party`.
- Hosts that get it: CAR, Mali, Libya (2022–2026); Sudan (2022–2023 only); Burkina Faso, Niger, Equatorial Guinea (2024–2026).

**Method band**
- `wagner_strict_2021`: Mali's calendar-2021 level.
- `wagner_reached_only`: only the part that reached Russia.
- Optionally `no_falls`: floor Sudan's and Libya's falls at 0.

## 5. Open questions

1. **Libya's payer.** If the UAE paid, the line belongs to the UAE.
2. **Falls.** Should Sudan's and Libya's falls count toward Ukraine (the rule as written, labelled not their choice) or be floored at 0?
3. **Mali's no-war level.** Use the run rate (central) or calendar 2021 (strict)? The difference is 0.33% of Mali's GDP.
4. **CAR's payment level.** EUR 7.6m a month is unverified and implausibly large against CAR's revenue.
5. **Ndassima's real output.** No production data exist.
6. **Sudan's 2021 Wagner volume.** It drives the whole Sudan fall.
7. **Does Africa Corps charge Burkina Faso, Niger and Equatorial Guinea at all?**
8. **Syria** (Evro Polis oil and gas, profits about USD 90m in 2020) is outside Africa and outside this file. Wagner left in 2023, so Syria would show a fall.
9. **Togo, Chad, Mauritania, Guinea.** No confirmed deployment was found in 2021–2026.

## Sources (certainty)

- RUSI, *Wagner's Business Model in Syria and Africa: Profit and Patronage*, 6 Feb 2025 (B): https://static.rusi.org/wagners-business-model-in-syria-and-africa_0.pdf
- The Blood Gold Report, Dec 2023 (D): https://bloodgoldreport.com/wp-content/uploads/2023/12/The-Blood-Gold-Report-2023-December.pdf
- The Sentry, *Architects of Terror*, June 2023 (C): https://thesentry.org/wp-content/uploads/2023/06/ArchitectsTerror-TheSentry-June2023.pdf ; *Mercenary Meltdown*, Aug 2025 (C): https://thesentry.org/reports/mercenary-meltdown-wagner-failure-mali/
- Reuters, 13 Sept 2021, USD 10.8m a month, as carried by Al Jazeera (C): https://www.aljazeera.com/news/2021/9/14/france-warns-mali-against-russian-wagner-mercenary-deal
- US Treasury (A, designations and presence): sm1058 https://home.treasury.gov/news/press-releases/sm1058 · sm1133 https://home.treasury.gov/news/press-releases/sm1133 · jy1220 https://home.treasury.gov/news/press-releases/jy1220 · jy1502 https://home.treasury.gov/news/press-releases/jy1502 · jy1581 https://home.treasury.gov/news/press-releases/jy1581 · jy1645 https://home.treasury.gov/news/press-releases/jy1645 · jy2384 https://home.treasury.gov/news/press-releases/jy2384
- Council of the EU, 25 Feb 2023 (A): https://www.eeas.europa.eu/delegations/ukraine/wagner-group-council-adds-11-individuals-and-7-entities-eu-sanctions-lists_en
- UK FCDO, 20 July 2023 (A): https://www.gov.uk/government/news/uk-sanctions-wagner-group-leaders-and-front-companies-responsible-for-violence-and-instability-across-africa ; OFSI notices: https://assets.publishing.service.gov.uk/media/64b8f1e62059dc000d5d2641/Notice_Sudan_200723.pdf , https://assets.publishing.service.gov.uk/media/64b8f2ae06f78d0014742584/Notice_Central_African_Republic_200723.pdf
- UN Panels of Experts (A for what they state): CAR S/2023/360 https://documents.un.org/doc/undoc/gen/n23/117/53/pdf/n2311753.pdf · Libya S/2021/229 https://www.ecoi.net/en/file/local/2047327/S_2021_229_E.pdf · Mali S/2023/578 https://digitallibrary.un.org/record/4019115 · Sudan S/2024/65 https://documents.un.org/doc/undoc/gen/n24/005/64/pdf/n2400564.pdf
- CNN, July 2022, Sudan gold (C): https://abc17news.com/news/national-world/cnn-europe-mideast-africa/2022/07/29/russia-is-plundering-gold-in-sudan-to-boost-putins-war-effort-in-ukraine-2/
- AP, Aug 2025, CAR and Africa Corps (C): https://www.news4jax.com/business/2025/08/06/russia-asks-central-african-republic-to-replace-wagner-with-state-run-africa-corps-and-pay-for-it/
- OCCRP, diamonds (C): https://www.occrp.org/en/news/report-wagner-mercenaries-profit-from-central-africas-blood-diamonds ; NBC, Ndassima (C): https://www.nbcnews.com/news/africa/wagner-ukraine-russia-central-african-republic-gold-mine-putin-rcna86392 ; Globe and Mail, Ndassima (C): https://theglobeandmail.com/business/article-canadian-owned-mine-seized-by-russian-mercenaries-in-africa-is-helping/
- Foreign Policy, UAE and Wagner in Libya (C): https://foreignpolicy.com/2020/11/30/pentagon-trump-russia-libya-uae/ ; Al Jazeera, Libya drawdown (C): https://www.aljazeera.com/news/2022/4/15/russians-unlikely-leave-libya-despite-ukraine-war
- All Eyes on Wagner (C/D): https://alleyesonwagner.org/2024/05/10/mediterranean-sea-objective-for-the-african-corps/ · https://alleyesonwagner.org/2025/12/01/the-madmax-uranium-express-the-convoy-of-all-dangers/
- Mali, 2025–2026: Al Jazeera on Wagner's exit (B) https://www.aljazeera.com/news/2025/6/6/russias-wagner-mercenaries-leaving-mali-africa-corps-to-remain · Al Jazeera on Kidal (B) https://www.aljazeera.com/news/2026/4/29/what-role-has-russia-played-in-malis-security-and-the-sahel-region · ADF (D) https://adf-magazine.com/2026/05/mercenaries-in-mali-come-with-high-cost-few-results/ · War on the Rocks (C) https://warontherocks.com/2026/09/russias-road-to-el-dorado/
- Africa Corps deployments: OSW, Burkina Faso (B) https://www.osw.waw.pl/en/publikacje/analyses/2024-01-31/wagner-forces-under-a-new-flag-russias-africa-corps-burkina-faso · Al Jazeera, Burkina Faso denial (C) https://www.aljazeera.com/news/2022/12/21/burkina-faso-denies-it-paid-russian-fighters-with-mine-rights · CNN, Niger (B) https://krdo.com/news/2024/04/12/russian-weapons-and-trainers-arrive-in-niger-weeks-after-us-military-agreement-ends/ · Equatorial Guinea (C) https://ghanaiantimes.com.gh/russia-sends-military-instructors-to-equatorial-guinea-reports , https://fides.org/en/news/78126

ACLED and Chatham House were searched. ACLED's Q&A on Wagner's exit from Mali (July 2025) is cited in search results but its URL now returns 404, so it is not used. Chatham House's Alex Vines ("paid directly in gold or in mining concessions", BBC) is quoted only second-hand, so it is not used for numbers.
