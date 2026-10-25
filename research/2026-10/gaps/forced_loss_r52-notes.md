# Forced losses of Russian supply that are not Ukraine's strikes (round 52)

Data file: `research/2026-10/gaps/forced_loss_r52.json`. Script: `research/2026-10/scripts/forced_loss_r52.py`.
- `python3 -I research/2026-10/scripts/forced_loss_r52.py` writes the JSON from the figures in the script. Each figure cites its extract.
- `... fetch` downloads the sources again. It keeps short text extracts, with address and date, in `research/2026-10/raw/forced_loss_r52/`.

Applied by `pipeline/build_data.py` `strike_supply()` (constant `FORCED_LOSS`, next to `STRIKE_SUPPLY` and `STRIKE_EMBARGO`).

## The owner's decision

The rule: "A country's figure reflects its own choices and the foreseeable answers to them. Things forced on it that it did not choose — Ukraine's strikes on Russian refineries, Russia's sudden export bans — count neither for it nor against it."

And on the strikes: "we also don't punish them for it, so the Ukraine strikes also don't punish India". India is counted for what it chose to buy. What the strikes kept from it neither credits nor blames it.

- **Counted, as choices or foreseeable answers to them:**
  - embargoes, sanctions and the price cap;
  - switching to other suppliers;
  - Russia's 2022 gas cut-off, an answer to the buyers' own sanctions;
  - Russia's counter-sanctions and import bans on "unfriendly" countries;
  - the war-time prices paid by buyers who kept buying (the windfall).
- **Not counted, as forced:**
  - Ukraine's strikes (round 51, `strike_supply_r51.json`);
  - Russia's 2023 gasoline and diesel export ban (this file);
  - the 2026 Druzhba halt to Hungary and Slovakia, after a Russian strike (this file).

The trade-off, stated on the method page: for willing buyers hit by a forced loss, the figure shows what they chose to pay. That is EUR 13.1bn (8.4–21.1bn) more in purchases over 2022–2026 than actually reached Russia, all causes together. At Russia's gain share it is EUR 3.7bn.

## Cause 1: Russia's export ban of September to November 2023

### What was banned

- **21 September 2023:** Government decree No. 1537 banned gasoline and diesel exports.
  - Exempt: the other members of the Eurasian Economic Union, Armenia, Belarus, Kazakhstan and Kyrgyzstan (Reuters 17 Nov 2023, Armenpress, Enerdata).
  - Mongolia and Uzbekistan were added to the exemptions only in the 2024 bans.
- **23 September:** resolution No. 1564 took gas oils, marine fuel and middle distillates out of the ban. It also cancelled the exception for Abkhazia and South Ossetia (Interfax).
- **6 October:** diesel by pipeline was allowed again (Reuters). Seaborne ULSD resumed on 9 October (Reuters/LSEG, 17 Oct 2023).
  - Diesel by rail and truck stayed banned for a while longer.
- **17 November:** the gasoline ban was lifted (energy ministry, via Reuters).

The ban answered Russia's own pump prices, before the strike waves. Round 51 did not count it. Its 2023 strike loss is 0 (capped at the year's shortfall), so nothing is counted twice. The bans from March 2024 answered strike-driven shortages. They are inside round 51's pass-through and are not added here.

### Lost exports (Mt, low / central / high)

| product | low | central | high | how |
|---|---|---|---|---|
| gasoline | 0.40 | 0.65 | 0.85 | about 0.42 Mt a month × 58/30 × 80% stopped |
| diesel (ULSD) | 0.10 | 0.25 | 0.50 | the measured fall in early October, net of maintenance |
| total | 0.50 | 0.90 | 1.35 | 1.1% / 2.0% / 3.1% of 2023 product exports |

**Gasoline**
- **Normal exports.** About 5 Mt in 2023 (Enerdata), against 4.8 Mt in 2022 (Reuters via Daryo). That is about 0.42 Mt a month.
- **During the ban:**
  - Rail exports fell about 80% in the first half of October (Reuters via Daryo).
  - What still left Russian ports was mostly Belarusian gasoline. Belarus is a separate exporter.
  - Seaborne gasoline in October was 51,000 b/d, less than a third of September's (Bloomberg/Vortexa, 20 Dec 2023; read through a search summary, the page blocks automated access).
- **The range.**
  - Low: cargoes brought forward into early September and caught up after 17 November (Bloomberg: exports ramped up in December).
  - High: 0.48 Mt a month (5.76 Mt in 2023, another reported figure) and a 90% cut.

**Diesel**
- **Before the ban.** Seaborne diesel and gasoil were 1.7 Mt in 1–20 September, already about 30% below August because of refinery maintenance (Reuters, 21 Sep 2023).
- **1–15 October.** 1.1 Mt, 20% below the same days of September, "due to ongoing seasonal maintenance of refineries and a fuel export ban" (Reuters, 17 Oct 2023). That is about 0.28 Mt less. Primorsk, the ULSD outlet, was 22% lower at 330,000 t.
- **Whole of October.** 2.55 Mt, 11% below September (Reuters, 3 Nov 2023). So September was about 2.87 Mt, and its last ten days were not lower: cargoes already cleared for export could still leave (Interfax). The second half of October was back at the September rate.
- **The range.**
  - Central: most of the early-October fall.
  - Low: most of it was maintenance.
  - High: the whole measured fall, plus diesel by rail and truck.

### Allocation

As round 51's strike losses:
- **The factor.** The loss per tonne Russia exported is 0.0034 / 0.0062 / 0.0093 of 2023 product exports (2.97 mb/d, IEA). Each buyer gets that factor times its own 2023 purchases of oil products (customs, at 2019–2021 prices), valued at the no-war price.
- **Exempt and embargoed buyers get nothing.** The four EAEU members are exempt (`exempt`). So are buyers in `STRIKE_EMBARGO`: the EU's product embargo ran from February 2023, and the UK, the US and others had their own.
- **The cap.** It is the buyer's own no-war level of products, together with the strike loss of that year (0 in 2023).
- **No shortfall cap.** Unlike the strike estimate, the year's loss is not capped at the shortfall against the pre-war export level. It is measured from the months of the ban, not inferred from annual totals.
- **The denominator** is all of Russia's product exports, as in round 51. Exports to exempt and unknown destinations are not allocated, so the allocated total is below the loss: about EUR 0.30bn (0.17–0.45bn) for 40 buyers.

## Cause 2: the Druzhba halt of 27 January to 22 April 2026

- **The halt.** Flows on the southern Druzhba to Hungary and Slovakia stopped on 27 January 2026, after a Russian drone strike damaged the pipeline near the Brody hub in western Ukraine. Ukraine's foreign minister cited force majeure (The Moscow Times, 16 Feb 2026; Wikipedia).
  - Hungary and Slovakia blamed Ukraine for slow repairs, which Kyiv denied.
  - Either way, neither buyer chose the halt. Round 51 left it out because it is not a Ukrainian strike on Russia. Under the round-52 rule it counts.
- **The restart.** Oil through the Ukrainian section flowed again on 22 April. It reached Slovakia at 2 a.m. on 23 April (Slovak economy ministry). MOL received crude at Fényeslitke and Budkovce that day, "after a hiatus of nearly three months" (MOL, via oenergetice.cz and Reuters via PGJ).
- **Days lost: 80 / 86 / 92.**
  - Central: 27 January to 22 April, 86 days.
  - Low: part of it may have been made up later in the year.
  - High: flows in May were back to normal but below pre-halt levels (intellinews, via a search summary; the page refused automated access).
- **Volumes.**
  - Before the halt, about 0.45 Mt a month each for Hungary and Slovakia (industry sources via Reuters, 18 Jul 2024). So 86 days is about 1.3 Mt each.
  - January 2026 flows averaged 150,000 b/d, against about 200,000 in early 2022–2025 (The Moscow Times).
  - Slovakia expected 13,500 t a day on restart and 119,000 t to the end of April (Fico).
- **Replacement crude.**
  - Croatia's Adria pipeline (JANAF) carried non-Russian crude. That does not reduce the Russian loss.
  - Russian crude by sea, allowed under the EU's exemption when the pipeline is disrupted, was not obtained: JANAF asked for EU and US permits for each cargo.
  - Slovakia and Hungary released strategic stocks (Slovakia 250,000 t twice). Stocks do not change purchases from Russia.
- **Who else.** No other buyer is affected:
  - Czechia stopped Russian crude by its own choice in April 2025.
  - Poland and Germany are on the northern branch and stopped by choice in 2023.
  - Belarus is upstream of Brody.

### Allocation

- **The factor.** `r = days / (period − days)` on the buyer's January–August 2026 crude purchases (customs), with a period of 243 days. The buyer's customs are what arrived on the 157 days the pipeline flowed, so the lost days are set against those.
  - For consistency the same rule now applies to round 51's 8 days in August 2025 (6/359 instead of 6/365). That moves Hungary and Slovakia by under EUR 1m.
- **Result.** EUR 1.00bn (0.90–1.11bn): Slovakia 0.65bn, Hungary 0.35bn.
  - Hungary's share is lower because its 2026 customs show less Russian crude per flowing day than Slovakia's: EUR 0.58bn against 0.99bn for January–August. In 2025 it was 1.73bn against 2.01bn.

## What is not counted (left for a decision)

- **Ukraine's ban on Lukoil transit, from 18 July 2024.** It stopped Lukoil's crude to Hungary and Slovakia (Reuters, 18 Jul 2024). Other Russian suppliers (Tatneft, Russneft) took over, and MOL took title at the Belarus–Ukraine border from September 2024. No loss of volume was measured.
- **The end of gas transit through Ukraine, 1 January 2025.** It hit Slovakia, Austria and Moldova. It is already labelled as gas whose supply stopped ("without the gas Russia cut off itself", `RUSSIA_GAS_CUT`), but it does not lower the baseline. By the round-52 rule Slovakia did not choose it.
  - Austria had ended its Gazprom contract after Gazprom stopped deliveries in November 2024.
  - This is the largest open case. Slovakia bought about EUR 0.9bn of Russian pipeline gas in 2021, at 2019–2021 prices.
- **Russia's food export bans.** Grain to the EAEU (March–June 2022), sugar (March–August 2022) and rice (from July 2023) are sudden export bans too. They fall on goods the build does not split by product.
- **Russia's 2023 diesel export duty for resellers** and the later quotas. These are price measures, not bans. Not counted.

## Result

| | expected purchases taken out, EUR bn (low–high) | at Russia's gain share |
|---|---|---|
| strikes (round 51) | 11.77 (7.3–19.6) | 3.16 |
| 2023 export ban | 0.30 (0.17–0.45) | 0.09 |
| 2026 Druzhba halt | 1.00 (0.90–1.11) | 0.48 |
| all | 13.07 (8.4–21.1) | 3.73 |

- **World totals.** Less paid to Russia: EUR 353.8bn before, 353.4bn after. More paid: 216.1bn before, 216.4bn after. Net: 137.6bn before, 137.1bn after.
- **Groups.** No country changes group, on the net or on Russia's earnings.
  - Slovakia's net falls from EUR +0.48bn to +0.17bn. It stays too close to call (61% → 58% toward Ukraine).
  - Hungary's net moves from −11.23 to −11.40.
  - The 2023 ban adds EUR 0.06bn or less per buyer (Türkiye 0.06, China 0.05, Brazil 0.03, India 0.03).

## What is uncertain

- **The 2023 volumes are estimates from Reuters/LSEG half-month data.** Maintenance and the ban overlap in September and October.
- **Mongolia** is counted as affected in 2023. No source confirms an exemption for it that year.
- **Hungary's 2026 customs** may be incomplete for the last months. If so, its loss is understated.
- **The evidence letter.** The two new sources are research and press. As in round 51, index.html `METHOD_INPUTS` could not be edited this round.
