# Limitations and open issues

The map is a research preview. Its figures were compiled with AI assistance from public sources and have not yet been reviewed line by line by a person. This page lists the known open issues, from the ones most likely to move a headline number to small display problems, says where each is documented, and explains how to report a correction. If you quote a figure, check its sources first (every number on the map links to them).

## Open issues in the numbers

| issue | effect | where documented |
|---|---|---|
| **Belarus's range still crosses zero** (−17.6% of GDP, likely range −38.6% to +3.6%), narrower since round 5 with a Belarus-specific band for its imports from Russia. It is left out of top lists. | Belarus | [counterfactual.md](method/counterfactual.md#belarus-round-5) |
| **2025–2026 partner data incomplete.** 121 reporters had 2025 annual data; 2026 is estimated from 2025 for many importers (marked `*`). | recent years | [ranges.md](method/ranges.md#2026-and-the--mark) |
| **Hub margins and re-export shares** are educated guesses (goods 5–20%, gold 0.3–6%). | hubs and their suppliers | [trade.md](method/trade.md#re-export-hubs) |
| **Refugee costs** outside the 27 hosts with budgets are modelled. Poland's refugee count for 2022 uses Eurostat's December stock (0.96m), which fell from 1.37m in September after a clean-up of the PESEL register, so its 2022 hosting cost may be low ([refugees-notes](../research/2026-10/gaps/refugees-notes.md)). Poland's and Czechia's cost figures were checked only against press articles, because the primary pages (BGK, NIK, MPSV) blocked automated access ([verify_r11_aid-notes](../research/2026-10/verify_r11_aid-notes.md)). | refugee hosts | [aid-refugees-military.md](method/aid-refugees-military.md#refugees) |
| **Military support to Russia** is a rough indication (D) for Belarus and China; North Korea and Iran are now C (round 6). **Every link behind it is a press report** (`military_rus_r6` in [`sources_r11.json`](../research/2026-10/sources_r11.json): NK News on INSS, IStories with Open Source Centre, Kyiv Independent on South Korean intelligence, and others). The primary reports they quote are not linked: the Multilateral Sanctions Monitoring Team's first report (29 May 2025, published by the 11 member states' foreign ministries), the INSS study, South Korea's NIS and JCS briefings to the National Assembly, and Open Source Centre's own report. In the round-11 audit their pages blocked automated access or could not be read, so none could be confirmed. North Korea's whole headline (−30.0% of GDP, range −59.5% to −11.2%) rests on this part. | North Korea, Iran, Belarus, China | [aid-refugees-military.md](method/aid-refugees-military.md#military-support-to-russia) |
| **Volunteers and fighters** (`people`) are counts from press reports, some of them from belligerents (Russia's defence ministry list, Ukraine's "I Want to Live" project). No primary link is confirmed. They are shown as counts only and add nothing to the totals. | the "People" section of the panel | [aid-refugees-military.md](method/aid-refugees-military.md#military-support-to-russia) |
| **Constants that are judgements.** The round-11 audit listed every constant in the code that no research file explains, with a proposal where the value looks wrong. Round 12 measured six of them (loans, China's crude ratio, Germany's gas in customs, Belarus's gas band, Hong Kong's metals share); the single duty rate for three waivers is still a proposal, and the other judgements remain. | various | [decisions](decisions.md#constants-and-rules-written-down-in-round-11) |
| **Loans: expected losses and the normal rate.** Round 12 values loans from measured rates and losses ([loans](method/loans.md)), but some parts are still judgement: the EU's 9% expected loss is its provisioning rate, not an observed loss; the 2026 Support Loan's 0.80–1.00 depends on reparations; guarantees for firms stay at 10/25/40% of face (no war-risk premium could be measured); the final treatment of bilateral debt is not known. Ukraine's 2021 USD rate is used for euro and yen loans, because no euro yield was found, which slightly overstates those gifts. The range is wide (EUR 42–85bn of 96.5bn face), because the high end uses the promised war yield. | loan-heavy donors: Japan, EU members, Canada, the UK | [loans.md](method/loans.md#what-is-still-judgement) |
| **Wikipedia and press as inputs.** Research files cite many press sites that are not in `sources_r11.json`. Wikipedia is cited in seven files: [`energy2.json`](../research/2026-10/gaps/energy2.json) (Gibraltar bunker sales), [`china_military.json`](../research/2026-10/gaps/china_military.json), [`assumptions_r11_rules.json`](../research/2026-10/gaps/assumptions_r11_rules.json), [`assumptions_r11_gain.json`](../research/2026-10/gaps/assumptions_r11_gain.json) (Russian Wikipedia on Rosoboronexport), [`relocants.json`](../research/2026-10/gaps/relocants.json), [`fuel_volume_cf.json`](../research/2026-10/gaps/fuel_volume_cf.json) and [`flowback2.json`](../research/2026-10/gaps/flowback2.json) (foreign fighters). These should be replaced by the references Wikipedia cites. | the values those files feed | [sources](reference/sources.md) |
| **Net gain shares** (round 10) rest on tax totals and company margins; crude, oil products and pipeline gas are B, everything else C, Since round 11, services, arms and other manufactured goods rest on Rosstat sector profits instead of judgement ([decisions](decisions.md#assumptions-backed-by-data-round-11)); the high end for arms (0.12) is still a judgement. Ukraine's 2022–2026 shares come from a proxy, and its 2025–2026 shares have no official profitability figures yet. | every country's trade parts | [overview.md](method/overview.md#the-net-gain-rule-round-10) |
| **Aid spent on energy, relief and rebuilding** (round 6 ledger) may partly also appear in customs as extra sales to Ukraine (in-kind goods, energy equipment); only weapons are netted against customs so far. At the money rule's factors the overlap is small (Germany at most about EUR 0.7bn). | donors of in-kind goods | [aid-refugees-military.md](method/aid-refugees-military.md#flowback) |
| **Remittances for Tajikistan** (about −37% of GDP from this part, total −38.2% with a range of −89.8% to −10.2%) rest on World Bank totals and Russia's share of them, certainty D. Since round 11 the share (0.88, range 0.80–0.97) and Belarus's share (0.40, range 0.30–0.50) come from the 2019–2021 mirror ratio in Bank of Russia data, and Moldova's 2024–2026 transfers from its central bank. The share is still applied to all years, so a change in where migrants work after 2021 is not captured. | Tajikistan, Belarus, Moldova | [trade.md](method/trade.md#remittances-and-relocants-round-7) |
| **The no-war gas price** rests on late-2021 futures, which already held the autumn-2021 gas squeeze (partly Gazprom's); a lower path would raise the windfall for gas buyers. | gas buyers | [prices.md](method/prices.md#no-war-prices-round-7) |

## Display issues

- **China's dual-use exports** (`dual_use_note` in `data.json`) are written to the data but not shown on the site.
- **Links to the documentation** from the map (the ⓘ links and source notes) point to the `main` branch on GitHub. Anchors added on a branch work only after it is merged.
- **Refugee ranges per year in `data.json`** can have a low value above the middle one in a single year (42 cases, for example the United States in 2026). The ranges are floored on running totals, so they are ordered for every period the map shows, not for each year on its own ([pipeline.md](reference/pipeline.md#datajson-in-brief)).


## Deliberate choices (not limitations)

- **The counterfactual uses actual 2022–2026 GDP and trade** as inputs, and **its ranges stay at the tested 90%** rather than being widened for Russia-side shocks. Both are explained in [counterfactual.md](method/counterfactual.md#deliberate-choices).
- **Baltic and Finnish transit is removed but not handed to the final buyers**, because the buyers already record those goods as imports from Russia ([trade.md](method/trade.md#baltic-and-finnish-pass-through)).

## Older documents

The design notes in [`docs/design/`](design/architecture.md) describe an earlier plan (DuckDB warehouse, estimate cards, weekly automation) that was not built this way. Where they differ from this documentation, this documentation and the code are current.

## How to report a correction

Found a wrong number, a better source or a missing flow? Please send:

1. the country and the figure (as shown on the map, with the year setting),
2. what you think it should be,
3. a link to the source.

Open an issue on GitHub, or send a message to [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/). Corrections are listed in the commit history and in the [changelog](changelog.md).

## See also

- [changelog.md](changelog.md): what each round fixed
- [method/ranges.md](method/ranges.md): what the likely ranges cover
- [Research log by round](../research/2026-10/README.md)
- [Documentation index](README.md)
