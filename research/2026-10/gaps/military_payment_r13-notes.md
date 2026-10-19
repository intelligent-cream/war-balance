# Weapons sent to Russia: paid or unpaid (round 13)

Gathered on 2026-10-19. Output: [`military_payment_r13.json`](military_payment_r13.json). It changes how [`military_rus_r6.json`](military_rus_r6.json) and [`china_military.json`](china_military.json) are valued; their volumes and prices stay. **No one has reviewed this yet.**

## Why

Until round 12 all weapons and troops sent to Russia counted at full market value as support, while a Chinese firm's sale to Russia counted at its value kept × genuinely extra. The audit found North Korea was paid for its shells, mostly in kind, so its −30% of GDP counted a sale as a gift. The owner approved a split:

- **Paid**: a sale. It counts at the seller's net gain × genuinely extra, like any sale to Russia ([`net_gain_sellers.json`](net_gain_sellers.json)).
- **Unpaid**: support, at full value.

**Payment in kind is payment.** Technology, components, fuel and food that Russia gave in return are a price paid, so the delivery is a sale.

## Evidence and decisions

| supplier | paid share (low, central, high) | evidence |
|---|---|---|
| North Korea | 0.8 / 1.0 / 1.0 | INSS (South Korea's Institute for National Security Strategy, report by Lim Soo Ho, via Bloomberg and The Insider): transfers of sensitive military technology and precision components were 80–96% of Russia's total compensation for supplies worth USD 7.67–14.4bn (Aug 2023–Dec 2025), the rest cash. NK News: cash was "only a limited portion"; confirmed deliveries of fuel, weapons and food worth USD 0.58–1.5bn. The 0.8 end lets a fifth be unpaid. |
| Iran | 0.8 / 1.0 / 1.0 | Bloomberg (via Militarnyi): contracts worth about USD 2.7bn for ballistic and air-defence missiles from October 2021, and a USD 1.75bn contract for Shahed drones and their production; Russia spent "more than the equivalent of USD 4bn". |
| Belarus | 0 / 0 / 0.5 | No evidence of payment for the ammunition and vehicles taken from the Belarusian army's stocks was found: support in full. The other end assumes half was paid. |
| China (unrecorded part only) | 0.8 / 1.0 / 1.0 | What is counted (unrecorded military items, smuggled dual-use goods, satellite imagery and training) is sold by Chinese firms (`china_military-notes.md`). |

**The seller's gain.** None of these economies is in OECD STAN, so new production takes the OECD median gain on weapons (0.037; 0.020–0.079) × the genuinely extra share for weapons (0.4 / 0.6 / 0.8). **North Korea's stock** is different: about half of one shipment was so outdated that Russian factories had to rework it (Ukraine's military intelligence, Vadym Skibitsky to Reuters, via PRM.ua; a belligerent source). Outdated stock had almost no other use, so nearly all its price is a gain: 0.9 (0.7–1.0) on an outdated share of 0.5 (0.3–0.6), the rest at the weapons gain. North Korea's artillery systems are treated as stock too; its missiles as new production.

**Troops.** The pay Russia gives North Korea for its soldiers goes to the state. The soldiers' alternative is conscript service at almost no pay, so the premium over the alternative wage is the whole pay, and all of it is war-driven (the remittances rule, [`remittances_r13-notes.md`](remittances_r13-notes.md)): counted in full, as before.

## Results (net % of 2024 GDP, this step alone)

| supplier | before | after |
|---|---|---|
| North Korea | −30.0 | −10.2 (−20.4 to −3.3) |
| Iran | −0.79 | −0.01 |
| China | −1.05 | −1.04 |
| Belarus | unchanged (unpaid) | |

North Korea keeps −10%: its shells were mostly old stock sold at a good price, and its troops' pay counts in full.

## Not verified

- The leaked Alabuga files' gold payment (lb.ua, cited in `military_rus_r6-notes.md`) was not opened again and is not used.
- The INSS report itself was not opened: its figures come from Bloomberg's account as carried by The Insider.
- **Round 14 (audit L5):** the INSS report itself was searched for again and could not be fetched: the institute's site (inss.re.kr) returned no publication list to an automated request (HTTP 500), and no copy of the report was found. Secondary coverage ([Global Defense Corp, 18 March 2026](https://www.globaldefensecorp.com/2026/03/18/north-korea-made-14-4-billion-in-revenue-through-troop-deployments-and-military-equipment-exports-to-russia/), fetched) names the report ("Economic Effects of North Korea's Troop Deployment to Russia and Military Equipment Exports", Lim Soo-ho, released 13 March 2026) and gives USD 7.67–14.4bn for **August 2023 to December 2024**; the table above says to December 2025. Which period is right is **not verified**; the paid share (0.8–1.0) does not depend on it. The label (press account of INSS) and this limitation stay.

## Sources (fetched 2026-10-19)

- The Insider (INSS via Bloomberg): <https://theins.press/en/news/290450>
- NK News: <https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/>
- Militarnyi (Bloomberg): <https://militarnyi.com/en/blogs/iran-sent-russia-2-7-billion-worth-of-missiles-alone/>
- PRM.ua (HUR to Reuters): <https://prm.ua/en/intelligence-shipments-of-shells-from-north-korea-to-russia-have-halved/>
