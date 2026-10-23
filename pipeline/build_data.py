"""Build site/data.json for the map from the research files in research/2026-10/.

Run: uv run python pipeline/build_data.py

All amounts are EUR billions, per year 2021..2026 (2026 = January to August).
Every series carries a middle value and a low/high range (about 90%), a certainty letter (A-D) and source ids.
No country is left at zero because data is missing: gaps are filled with estimates from research/2026-10/gaps/.
"""

from __future__ import annotations

import datetime
import json
import math
import re
import statistics
from pathlib import Path

import pycountry

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "2026-10"
GAPS = RESEARCH / "gaps"
OUT = ROOT / "site" / "data.json"

YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
PRE_YEARS = (2019, 2020, 2021)
# 2026 is counted through August, the cut-off of the Kiel aid data; all 2026 inputs are January-August values
FRAC = [1, 1, 1, 1, 1, round(8 / 12, 4)]
EU27 = set(
    "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split()
)
TARIFF_WAIVER = EU27 | {"GBR", "CAN"}

# ---- round 11: assumptions replaced by data where the research found it (research/2026-10/gaps/assumptions_r11_*.json
# and their -notes.md; not yet reviewed by a person). The research files keep their old values: each proposals file is
# applied by one overlay, apply_assumptions_r11_<file>(), when the research file it changes is loaded (load(), the same
# way as the round-7 actuals), or by a commented constant below. Proposals that were left out, and why, are listed in
# site/content/changelog.md (assumptions backed by data, round 11)
R11 = {k: json.loads((GAPS / f"assumptions_r11_{k}.json").read_text()) for k in ("gain", "rules", "hubs", "people")}
_B3 = ("low", "central", "high")
# which countries each proposals file changed: their series get the round-11 source (attach_r11_sources)
R11_TOUCHED: dict[str, set[str]] = {k: set() for k in R11}

# own-industry share of military aid where no evidence exists (certainty D): low, middle, high. Round 11 (rules): the
# default now applies only to Albania, North Macedonia and Montenegro, which gave Soviet-era stock and have little arms
# industry (was 0.2 / 0.4 / 0.7; judgement)
OWN_SHARE_DEFAULT = (0.0, 0.1, 0.3)
# where EU-level military aid is spent, as a share of it. Round 11 (rules, Kiel release 31 items): the Gripen contract
# (Saab) is 0.28 for Sweden, about 0.7 goes to Ukraine's own drone industry (no member's flowback) and 0.03 to all
# other members, split by the ASAP 2024 grant shares. Was SIPRI production shares x 0.78 (France 0.39, Germany 0.24...)
EU_ARMS_SLICE = next(p for p in R11["rules"]["proposals"] if p["constant"].startswith("EU_ARMS_SLICE"))["new"][
    "applied directly as the share of EU-level military aid (set the 0.78 factor to 1)"
]
# range of those shares: Sweden 0.25-0.30 (data), the other members together 0-0.10 instead of 0.03 (judgement)
EU_ARMS_RANGE = {"SWE": (0.25 / 0.28, 0.30 / 0.28), "other": (0.0, 0.10 / 0.03)}
# what a loan costs the lender (cost view only), as a share of face value. Round 11 (rules): Kiel's loan terms
# discounted at the lender's own funding rate, with an expected loss, weighted by face value over the loan items
# outside the Ukraine Support Loan defence window: 0.09 / 0.26 / 0.47 (was 0.3, judgement); the middle is used.
# Round 12: every loan in loans_value.json now has its own lender's cost (loan_rates.py, site/content/method/loans.md); this
# average is only used for loan amounts moved by later corrections (move_loan)
LOAN_GRANT_ELEMENT = 0.26
# import duties given up on purchases from Ukraine (cost view only), share of purchases, per year 2021-2026. Round 11
# (rules, Commission and government estimates): the EU waiver ran from 4 June 2022 to 5 June 2025 only, at about
# 0.3%; the UK 0.2% from May 2022; Canada about 1% from 9 June 2022. Was a flat 4% for all of them. The map applies one
# rate (META.tariff_rate): the average of these, weighted by purchases from Ukraine in 2022-2026 (tariff_rate())
TARIFF_RATE_YEARS = {
    "EU27": [0.0, 0.003 * 7 / 12, 0.003, 0.003, 0.003 * 5 / 12, 0.0],
    "GBR": [0.0, 0.002 * 8 / 12, 0.002, 0.002, 0.002, 0.002],
    "CAN": [0.0, 0.01 * 7 / 12, 0.01, 0.01, 0.01, 0.01],
}
# when each lender paid out its ERA loan (None = the rest), and Kiel's category for it where not financial
ERA_YEARS = {"USA": {2024: None}, "JPN": {2026: None}, "GBR": {2025: 1.78, 2026: None}}
ERA_CATEGORY = {"GBR": "military"}
# round 11 (hubs): flag registries whose fuel "imports" in the model are partners' records of bunkers sold to ships
# flying their flag (China, Greece, Türkiye, India report them as exports to Liberia, the Marshall Islands, Panama,
# Malta); the registries' own customs show none of it, except Malta's small imports below
R11_FLAG_REGISTRIES = ("LBR", "MHL", "PAN", "MLT")
# Malta's own customs: HS 2710 imports from India, the UAE and Türkiye, USD m 2022-2024 (assumptions_r11_hubs.json)
R11_MLT_OWN_IMPORTS_USD_M = {2022: 0.3, 2023: 59.3, 2024: 1.6}
# ECB annual averages, USD per EUR (ECB EXR.A.USD.EUR.SP00.A; research/2026-10/trade-notes.md)
USD_PER_EUR = {2022: 1.053, 2023: 1.0813, 2024: 1.0824}


def _r11_triple(s: str) -> tuple[float, ...]:
    """'0.20/0.35/0.55 (unchanged)' -> (0.2, 0.35, 0.55)."""
    return tuple(float(x) for x in s.split()[0].split("/"))


def _vk_product(vk: dict, ex: dict) -> dict:
    """Value kept x genuinely extra, as value_kept.json builds it: central = vk x extra; low/high combine the two
    log-ranges in quadrature, the high capped at vk_high x extra_high."""
    c = vk["central"] * ex["central"]
    lo = math.hypot(math.log(vk["central"] / vk["low"]), math.log(ex["central"] / ex["low"]))
    hi = math.hypot(math.log(vk["high"] / vk["central"]), math.log(ex["high"] / ex["central"]))
    return {
        "low": round(c * math.exp(-lo), 3),
        "central": round(c, 3),
        "high": round(min(c * math.exp(hi), vk["high"] * ex["high"]), 3),
    }


def apply_assumptions_r11_gain(name: str, d: dict) -> dict:
    """Round 11, assumptions_r11_gain.json: the judgement net-gain shares of Russia (services, arms, manufactured goods,
    wood, food, chemicals, steel, aluminium) and Ukraine (other food, other metals, wood, machinery, chemicals, other)
    replaced by shares built from official sector profitability, export duties collected and company results. The
    averages are recomputed from the files' own export mix (they reproduce the old averages exactly)."""
    if name not in ("net_gain_russia.json", "net_gain_ukraine.json"):
        return d
    # round 14b: the files carry these groups recomputed from the same round-11 inputs at the sellers' normal return
    # (5% real + the country risk premium, on book capital as a nominal USD rate); the round-11 values then stand only
    # in the round-14 copies (net_gain_*_r14.json) that the method band's old-method alternative loads
    for p in [] if d.get("normal_return_r14b") else R11["gain"]["proposals"]:
        if p["file"].endswith("/" + name):
            d["groups"][p["group"]][str(p["year"])] = {b: p["new"][b] for b in _B3}
    mix, avg = (d["non_fuel_mix"], "non_fuel_average") if name == "net_gain_russia.json" else (d["mix"], "average")
    for y, w in mix.items():
        tot = sum(w.values()) or 1.0
        d["groups"][avg][y] = {b: round(sum(x * d["groups"][k][y][b] for k, x in w.items()) / tot, 4) for b in _B3}
    return d


def apply_assumptions_r11_rules(name: str, d: dict) -> dict:
    """Round 11, assumptions_r11_rules.json: (1) the share of lost sales to Russia that was not redirected (value_kept.json,
    "genuinely extra"): default, Finland and the Baltic states lower, from firm-level studies; (2) EU-level military aid
    spent where Kiel's items say (money_ledger.json): Sweden's Gripen, Ukraine's drones, a small slice for the rest.
    The other proposals in the file are constants (OWN_SHARE_DEFAULT, EU_ARMS_SLICE, LOAN_GRANT_ELEMENT,
    TARIFF_RATE_YEARS) or confirm the current values."""
    if name == "value_kept.json":
        new = R11["rules"]["proposals"][0]["new"]
        old_default = (0.25, 0.4, 0.6)
        for iso3, c in d["countries"].items():
            s = c.get("sales_to_russia_lost") or {}
            ex = s.get("extra") or {}
            cur = tuple(ex.get(b) for b in _B3)
            key = "Finland" if iso3 == "FIN" else "Baltics" if iso3 in ("EST", "LVA", "LTU") else None
            if key is None and cur == old_default:
                key = "default"
            if key is None or not s.get("value_kept"):
                continue
            s["extra"] = dict(zip(_B3, _r11_triple(new[key])))
            s["product"] = _vk_product(s["value_kept"], s["extra"])
            R11_TOUCHED["rules"].add("vk:" + iso3)
    elif name == "money_ledger.json":
        # Kiel's EU-level military aid (all dated 2026): the ledger's central total, split by the round-11 shares
        tot = sum(
            (((c.get("by_source_and_type") or {}).get("EU|weapons") or {}).get("2026") or {}).get("central", 0.0)
            for c in d["countries"].values()
        )
        for iso3, c in d["countries"].items():
            bst = c.setdefault("by_source_and_type", {})
            sh = EU_ARMS_SLICE.get(iso3, 0.0)
            if iso3 == "UKR" or not (sh or bst.get("EU|weapons")):
                continue
            lo_f, hi_f = EU_ARMS_RANGE.get(iso3, EU_ARMS_RANGE["other"])
            bst["EU|weapons"] = {"2026": {"low": tot * sh * lo_f, "central": tot * sh, "high": tot * sh * hi_f}}
            R11_TOUCHED["rules"].add("eu:" + iso3)
    return d


def apply_assumptions_r11_hubs(name: str, d: dict) -> dict:
    """Round 11, assumptions_r11_hubs.json: UAE and Panama bunker and resale shares (energy2.json); partners' records of
    bunkers sold to ships of the big flag registries dropped (energy.json, hub_exports_2024.json, hub_buyers.json,
    laundered_r6.json); Belgium's 2022 company profit tax from KSE/B4Ukraine (company_taxes_r6.json). Malta's half of
    its bunkers in the middle case and the per-territory caps on laundered oil are in reassign_laundered_oil() and
    apply_assumptions_r11_laundered()."""
    props = R11["hubs"]["proposals"]
    if name == "energy2.json":
        for p in props:
            if p["item"] == "hub_resale" and p["new"] != p["old"]:
                h = d["hub_resale"][p["country"]]
                h.update({b: p["new"][b] for b in _B3})
                h["bunker_share"] = dict(zip(_B3, p["new"]["bunker_share"]))
                R11_TOUCHED["hubs"].add("laund:" + p["country"])
    elif name == "energy.json":
        # the model's laundered oil for these registries is refiners' (India, Türkiye, China, UAE) HS 2710 exports to
        # them, as the refiners report them: bunkers sold to ships under their flag. Malta keeps what its own customs
        # record from those refiners (in the model's band, x0.76 / x1.43; judgement, site/content/changelog.md, constants)
        for iso3 in R11_FLAG_REGISTRIES:
            lo = (d["countries"].get(iso3) or {}).get("laundered_oil")
            if not lo:
                continue
            for y in lo:
                v = 0.0
                if iso3 == "MLT":
                    yy = min(int(y), 2024)
                    v = R11_MLT_OWN_IMPORTS_USD_M.get(yy, 0.0) / USD_PER_EUR.get(yy, 1.08) / 1000
                    v *= FRAC[5] if y == "2026" else 1.0
                lo[y] = {"low": round(v * 0.76, 6), "central": round(v, 6), "high": round(v * 1.43, 6)}
            R11_TOUCHED["hubs"].add("laund:" + iso3)
    elif name == "hub_exports_2024.json":
        # hubs' records of fuel "exports" to flag registries are bunkers: their resale goes to their other customers
        for shares in d["shares"].values():
            for iso3 in R11_FLAG_REGISTRIES[:3]:
                shares.pop(iso3, None)
    elif name == "hub_buyers.json":
        for hub, h in d["hubs"].items():
            for iso3 in R11_FLAG_REGISTRIES[:3] + (("MLT",) if hub == "TUR" else ()):
                h["destination_shares"].pop(iso3, None)
    elif name == "laundered_r6.json":
        # Turkish-port fuel reaching these registries only via Greece's records of exports to them (bunkers)
        for iso3 in R11_FLAG_REGISTRIES[:3]:
            d["countries"].pop(iso3, None)
    elif name == "company_taxes_r6.json":
        for p in props:
            if p["item"] == "company_profit_tax" and isinstance(p["new"], dict) and "central" in p["new"]:
                c = d["countries"][p["country"]]
                for y in p["years"].split(","):
                    y = y.strip()
                    oth = c["other_taxes"][y]
                    c["profit_tax"][y] = {b: p["new"][b] for b in _B3}
                    # the map's measure: profit tax in full and half of the other taxes
                    c["owner_measure"][y] = {b: round(p["new"][b] + 0.5 * oth[b], 5) for b in _B3}
                R11_TOUCHED["hubs"].add("tax:" + p["country"])
    return d


def apply_assumptions_r11_people(name: str, d: dict) -> dict:
    """Round 11, assumptions_r11_people.json: refugee hosting costs from budget figures (refugees_net.json), Russia's
    share of remittances and Moldova's transfers from Russia (remittances.json), private donations from national
    totals (uncovered.json), Hong Kong's 2026 gold passed on to the mainland (refine.json). The freight share of import
    values per importer is in remove_freight()."""
    props = R11["people"]["proposals"]
    if name == "refugees_net.json":
        rc = d["countries"]
        specific_2022 = set()
        for p in props:
            iso3, new = p["country"], p["new"]
            if p["item"] == "refugee_gross_cost" and isinstance(new, dict) and iso3 in rc:
                g = rc[iso3]["gross"]
                if "range_factor" in new:  # Hungary: a central path, low x0.6, high x1.5
                    for y, v in new.items():
                        if y.isdigit():
                            g[y] = {"low": round(v * 0.6, 4), "central": v, "high": round(v * 1.5, 4)}
                elif "central" in new:  # one year (Estonia 2022, Bulgaria 2022, Georgia 2022)
                    g[p["years"]] = {b: new[b] for b in _B3}
                else:
                    for y, v in new.items():
                        g[y] = {b: v[b] for b in _B3}
                if iso3 == "BGR":
                    # BGN 300m of the BGN 523m paid to hotels in 2022 came from EU funds; Bulgaria's figures are its
                    # own cost (no donor share in apply_refugees_net), so the EU-funded part is taken out here
                    eu = 300 / 1.95583 / 1000
                    g["2022"] = {b: round(v - eu, 4) for b, v in g["2022"].items()}
                specific_2022 |= {iso3} if "2022" in (p["years"] or "") else set()
                R11_TOUCHED["people"].add("ref:" + iso3)
            elif p["item"] == "refugee_gross_cost_floor" and iso3 in rc:
                # documented costs are floors under the gross cost (Ireland, UK): raised only where below
                for y, v in new.items():
                    fl = next((x for k, x in v.items() if k.endswith("floor")), None) if isinstance(v, dict) else None
                    gy = rc[iso3]["gross"].get(y)
                    if fl and gy and gy["low"] < fl:
                        gy.update({b: max(gy[b], fl) for b in _B3})
                        R11_TOUCHED["people"].add("ref:" + iso3)
        # OECD's modelled first-year cost as the lowest high bound for hosts costed as refugees x a rate (certainty C),
        # except hosts with a 2022 figure above and those OECD itself flags as overstated (Hungary, Slovakia, Romania)
        oecd = props[0]["new"]["oecd_2022_eur_bn"]
        for iso3, v in oecd.items():
            c = rc.get(iso3)
            if not c or iso3 in specific_2022 | {"HUN", "SVK", "ROU"} or c.get("gross_certainty") != "C":
                continue
            g = c["gross"]["2022"]
            if g["high"] < v:
                g["high"] = v
                R11_TOUCHED["people"].add("ref:" + iso3)
    elif name == "remittances.json":
        rc = d["countries"]
        for p in props:
            iso3, new = p["country"], p["new"]
            if p["item"] == "remittance_russia_share" and iso3 in rc:
                old, c = p["old"], rc[iso3]
                # labour remittances and the expected level are the receiving country's total x Russia's share
                f = {b: new[b] / old[b] for b in _B3}
                for y in c["labour_eur_bn"]:
                    for key in ("total_from_rus_eur_bn", "labour_eur_bn"):
                        v = c[key][y]
                        c[key][y] = {b: round(v[b] * f[b], 4) for b in _B3}
                    if f["central"] != 1.0:  # the expected level moves with the central share
                        e = c["expected_labour_eur_bn"][y]
                        c["expected_labour_eur_bn"][y] = {b: round(e[b] * f["central"], 4) for b in _B3}
                R11_TOUCHED["people"].add("rem:" + iso3)
            elif p["item"] == "remittance_total_from_russia" and iso3 in rc:
                c = rc[iso3]
                for y, v in new.items():
                    c["total_from_rus_eur_bn"][y] = {b: v[b] for b in _B3}
                    rel = c["relocant_eur_bn"].get(y, 0.0)
                    c["labour_eur_bn"][y] = {b: round(max(0.0, v[b] - rel), 4) for b in _B3}
                R11_TOUCHED["people"].add("rem:" + iso3)
    elif name == "uncovered.json":
        pc = d["private_donations"]["countries"]
        for p in props:
            iso3, new = p["country"], p["new"]
            if p["item"] != "private_donations" or iso3 not in pc or not isinstance(new, dict):
                continue
            ys = {p["years"]: new} if "central" in new else new
            for y, v in ys.items():
                if isinstance(v, dict):
                    pc[iso3]["years"][y] = {b: v[b] for b in _B3}
            R11_TOUCHED["people"].add("priv:" + iso3)
    elif name == "refine.json":
        for p in props:
            if p["item"] == "hk_onward" and isinstance(p["new"], dict):
                d["hk_onward"]["2026"] = {b: p["new"][b] for b in _B3}
    return d


def apply_assumptions_r11(name: str, d: dict) -> dict:
    for f in (apply_assumptions_r11_gain, apply_assumptions_r11_rules, apply_assumptions_r11_hubs,
              apply_assumptions_r11_people):  # fmt: skip
        d = f(name, d)
    return d


# better data for the biggest guesses: shadow fleet ownership, re-export shares, Togo's buyers, gold routes
REFINE = apply_assumptions_r11(
    "refine.json",
    json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/refine.json").read_text()),
)
# energy research: transit gas, price indices, fuel mix before the war, hub resale shares
E2 = apply_assumptions_r11(
    "energy2.json",
    json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/energy2.json").read_text()),
)
# laundered oil (fuel refined from Russian crude in India, Turkey, China...): trading hubs resell part of what they buy,
# so that share is passed on to their customers (low, middle, high share resold) ...
# (shares from research/2026-10/gaps/energy2.json; only hubs whose fuel customers are known are passed on)
HUB_RESALE = {hub: (d["low"], d["central"], d["high"]) for hub, d in E2["hub_resale"].items()}
# fuel sold to ships in port (bunkers) has no known buyer country: it stays with the hub, except at the hub's low end
# EUR bn per million tonnes of Russian fuel in 2021 (CREA, Germany): turns fuel tonnes into a value split per year.
# Traced (round 11 audit): crea.json DEU fossil_2021_by_fuel (EUR bn) / energy.json DEU fossil_from_russia_by_fuel_mt
# 2021 (Mt): crude 9.065/21.935, products 4.057/7.393, gas 18.177/31.167, coal 0.831/6.37; LNG takes the gas value
EUR_PER_MT_2021 = {"crude": 0.414, "products": 0.549, "gas": 0.583, "lng": 0.583, "coal": 0.130}
FUEL_INDEX = {"crude": "urals", "products": "products", "gas": "pipeline_gas", "lng": "lng", "coal": "coal"}
# ... and only the Russian crude inside the fuel is money for Russia, bought at a discount (low, middle, high share)
# Russian crude per euro of fuel made from it, per refiner and year (round 9, crude_content.json): the price Russia was paid
# for the crude (FOB, after the discount) x tonnes of crude per tonne of fuel / the refiner's fuel export price. The buyer
# whose demand creates the sale is charged this part; the rest of the fuel price stays with the refiner
_CC = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/crude_content.json").read_text())
CRUDE_K = {r: {int(y): (v["low"], v["central"], v["high"]) for y, v in by.items()} for r, by in _CC["refiners"].items()}


def _refiner_exports() -> dict[str, dict[int, float]]:
    """Fuel made from Russian crude that each refiner exported (EUR bn, central): the weights of the blended ratio."""
    gaps = Path(__file__).resolve().parent.parent / "research/2026-10/gaps"
    hb = json.loads((gaps / "hub_buyers.json").read_text())
    china = json.loads((gaps / "round4a.json").read_text())["china_refining"]["exported_crude_value"]
    pv = lambda by: {int(y): (v.get("exported_product_value_eur_bn") or {}).get("central", 0.0) for y, v in by.items()}  # noqa: E731
    return {
        "TUR": pv(hb["turkey_refining"]["by_year"]),
        "IND": pv(hb["india_refining"]),
        # round 12: China's own measured crude share per year (crude_content.json), was a flat 0.70 (judgement)
        "CHN": {int(y): v.get("central", 0.0) / CRUDE_K["CHN"][int(y)][1] for y, v in china.items()},
    }


REFINER_EXPORTS = _refiner_exports()


def crude_k(year: int, refiner: str | None = None) -> tuple[float, float, float]:
    """(low, central, high) crude per euro of fuel. Without a refiner: the refiners' average weighted by their fuel
    exports, for fuel whose refiner is not known once trading hubs have mixed it (2021: the 2022 weights)."""
    if refiner:
        return CRUDE_K.get(refiner, CRUDE_K["other"])[year]
    w = {r: by.get(year) or by.get(2022, 0.0) for r, by in REFINER_EXPORTS.items()}
    tot = sum(w.values()) or 1
    return tuple(sum(CRUDE_K[r][year][i] * x for r, x in w.items()) / tot for i in range(3))  # type: ignore[return-value]


# the crude ratio the round-5 EU research used (laundered_eu.json k, central; low x0.88, high x1.12; pre-war about 0.70)
EU_K_OLD = {2021: 0.70, 2022: 0.47, 2023: 0.494, 2024: 0.60, 2025: 0.56, 2026: 0.415}
# and the single ratio the round-6 Brunei research used (laundered_r6.json), low, central, high
R6_K_OLD = (0.42, 0.5, 0.6)
# laundered oil can not exceed what an economy can use: capped at a share of GDP per year (middle, high); the fuel model
# otherwise assigns fuel to ship registries and storage points (Marshall Islands, Liberia). Judgement (site/content/changelog.md)
LAUNDERED_CAP = (0.01, 0.02)
# round 11 (hubs): where the research measured what a territory can use, the cap is fuel use x the share made from
# Russian crude elsewhere x crude content (Liberia, Togo, Malta, Panama; the Marshall Islands and Gibraltar keep 1%/2%)
LAUNDERED_CAP_BY = {
    p["country"]: (p["new"]["mid"], p["new"]["high"])
    for p in R11["hubs"]["proposals"]
    if p["item"] == "LAUNDERED_CAP" and p["new"]["mid"] != p["old"]["mid"]
}
# round 11 (hubs): hubs whose bunkers are most of their fuel imports (Malta, 81%) keep less in the middle case: half
# of the bunker share is fuel bought by foreign shipowners (judgement). Gibraltar is left out: fix_artefacts() already
# keeps only 10% of its fuel, for the same reason
HUB_BUNKER_HALF_MID = {"MLT": 0.5 * E2["hub_resale"]["MLT"]["bunker_share"]["central"]}
# countries that received Russian pipeline gas, which customs data often do not record as Russian; only for these is the
# fossil fuel tracker used when it is higher than customs data (elsewhere its "destinations" can be storage terminals)
PIPELINE_GAS = EU27 | {
    "TUR",
    "SRB",
    "MKD",
    "BIH",
    "MDA",
    "CHE",
    "GEO",
    "ARM",
    "KAZ",
    "KGZ",
    "UZB",
    "BLR",
}
CERT_ORDER = "ABCD"
# the latest month in the data (2026 runs January to August) and the date of this build
DATA_TO, DATA_TO_TEXT = "2026-08-31", "31 August 2026"


def latest_change() -> tuple[str, str]:
    """Round 24 (audit A: About said "updated 19 October" while the changelog ran to 21 October): the date the site
    gives as "updated" is the newest round's date in site/content/changelog.md, not written by hand."""
    txt = (ROOT / "site" / "content" / "changelog.md").read_text()
    m = re.search(r'<span class="cl-date">(\d{1,2}) (\w+)(?: (\d{4}))?</span>', txt)
    day, month, year = int(m.group(1)), m.group(2), int(m.group(3) or DATA_TO[:4])
    d = datetime.datetime.strptime(f"{day} {month} {year}", "%d %B %Y").date()
    return d.isoformat(), f"{day} {month} {year}"


UPDATED, UPDATED_TEXT = latest_change()
# territories whose trade and aid statistics are reported by another country (customs unions, dependencies)
INCLUDED_IN = {"LIE": "CHE", "MCO": "FRA", "IMN": "GBR", "PRI": "USA", "VIR": "USA", "MAF": "FRA"}

NAMES = {
    "USA": "United States", "GBR": "United Kingdom", "KOR": "South Korea", "PRK": "North Korea", "RUS": "Russia",
    "IRN": "Iran", "VNM": "Vietnam", "TWN": "Taiwan", "MDA": "Moldova", "BOL": "Bolivia", "VEN": "Venezuela",
    "TZA": "Tanzania", "SYR": "Syria", "LAO": "Laos", "COD": "DR Congo", "COG": "Congo", "CZE": "Czechia",
    "TUR": "Turkey", "MKD": "North Macedonia", "CIV": "Côte d'Ivoire", "BRN": "Brunei", "PSE": "Palestine",
    "FSM": "Micronesia", "HKG": "Hong Kong", "MAC": "Macao",
}  # fmt: skip


# round 7: narrower actual values from national and partner statistics (research/2026-10/gaps/actuals_r7.json). Each
# entry names the input it replaces ("file:path"); the inputs are changed as they are loaded, so nothing is applied twice
ACTUALS_R7 = {
    key: val
    for c in json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/actuals_r7.json").read_text())[
        "countries"
    ].values()
    for s in c.values()
    for key, val in s["inputs"].items()
}


def _band(f: dict, y: str, lo: float, hi: float) -> None:
    v = f.get(y)
    if v and v.get("central"):
        v["low"], v["high"] = round(v["central"] * lo, 6), round(v["central"] * hi, 6)


def _actuals_r7(name: str, d: dict) -> dict:
    for key, val in ACTUALS_R7.items():
        if " and narrow.json:" in key:
            # own-report margins for land-border partners: Russia's mirror sits near 1.0, not the world median ratio
            iso, field = key.split(":")[1].split(" ")[0].split(".")
            if name == "trade_full.json":
                f = d["countries"][iso][field]
                for y in val["years"]:
                    _band(f, y, val["lo"], val["hi"])
                if f.get("baseline") and "2021" in val["years"]:
                    f["baseline"]["low"], f["baseline"]["high"] = f["2021"]["low"], f["2021"]["high"]
            elif name == "narrow.json":
                k = {"imports_from_RUS": "to_rus", "exports_to_RUS": "from_rus"}[field]
                tl = ((d["countries"].get(iso) or {}).get(k) or {}).get("trade_layer")
                for y in val["years"] if tl else []:
                    _band(tl, y, val["lo"], val["hi"])
        elif key.startswith(name + ":") and isinstance(val, dict):
            *path, last = key.split(":", 1)[1].split(".")
            obj = d
            for part in path:
                obj = obj[part]
            if name == "nonreport.json":
                for y, v in val.items():
                    obj[last][y].update(v)
            elif last == "reexports_from_RUS":
                obj[last].update(val)
            else:
                obj[last] = val
    return d


def load(path: Path) -> dict | None:
    # round 14b: the method band's "normal_return" alternative (round 13's 9% for sellers) keeps Russia's and Ukraine's
    # round-14 net-gain shares (their builders' 9% and 8.2% after tax) as well
    name = path.name
    if "normal_return" in ALT and name in ("net_gain_russia.json", "net_gain_ukraine.json"):
        path = path.with_name(path.stem + "_r14.json")
    if not path.exists():
        return None
    # round 7 actuals first, then the round-11 assumptions backed by data
    return apply_assumptions_r11(name, _actuals_r7(name, json.loads(path.read_text())))


def iso_numeric(iso3: str) -> str | None:
    if iso3 == "TWN":
        return "158"
    country = pycountry.countries.get(alpha_3=iso3)
    return country.numeric if country else None


def short_name(iso3: str) -> str:
    if iso3 in NAMES:
        return NAMES[iso3]
    country = pycountry.countries.get(alpha_3=iso3)
    name = getattr(country, "common_name", None) or country.name
    return name.split(",")[0]


def weakest(letters) -> str:
    return max((x for x in letters if x), key=CERT_ORDER.index, default="A")


def lch(by_year: dict | None) -> dict:
    """{year: {low, central, high}} -> {"years": [...], "years_lo": [...], "years_hi": [...]} for 2021..2026."""
    c, lo, hi = [], [], []
    for y in YEARS:
        v = (by_year or {}).get(str(y)) or {}
        mid = v.get("central") or 0
        c.append(round(mid, 5))
        lo.append(round(min(v.get("low", mid) or 0, mid), 5))
        hi.append(round(max(v.get("high", mid) or 0, mid), 5))
    return {"years": c, "years_lo": lo, "years_hi": hi}


def scaled(series: list[float], factor: float) -> list[float]:
    return [round(v * factor, 5) for v in series]


class Sources:
    def __init__(self) -> None:
        self.items: dict[str, dict] = {}

    def add(self, sid: str, name: str, url: str | None = None, date: str | None = None, note: str | None = None) -> str:
        self.items.setdefault(
            sid, {k: v for k, v in {"name": name, "url": url, "date": date, "note": note}.items() if v}
        )
        return sid


# Russian gas that Russia itself cut off, or that stopped when Ukraine ended gas transit on 1 January 2025: the date
# the supply stopped (sanctions_share-notes.md, "Own choice is not always a choice"). Round 14 (audit H5, approved by the
# owner): Latvia (Gazprom halted supply on 30 July 2022), France (Engie, 1 September 2022), Moldova (Gazprom cut volumes
# by 30% from October 2022; the right bank stopped buying Gazprom gas in December 2022; was labelled from 2025 only) and
# Austria (OMV, 16 November 2024; was 2025) added or corrected; the first year counts only from the cut date. Evidence:
# research/2026-10/sources_r11.json "gas_cuts" (company, operator and press statements of each cut)
RUSSIA_GAS_CUT = {"POL": "2022-04-27", "BGR": "2022-04-27", "FIN": "2022-05-21", "NLD": "2022-05-31",
                  "DNK": "2022-06-01", "DEU": "2022-06-15", "LVA": "2022-07-30", "FRA": "2022-09-01",
                  "MDA": "2022-10-01", "AUT": "2024-11-16", "SVK": "2025-01-01", "ITA": "2025-01-01"}  # fmt: skip
# Poland books its Russian gas under other customs headings (sanctions_share-notes.md, audit.json), so the gas part of
# its fall is taken from volumes instead: final-use Russian gas (energy2.json transit_gas, bcm) against 2019-2021, at the
# 2019-2021 average value per bcm
GAS_PART_FROM_VOLUMES = {"POL"}


def gas_part_r14(iso3: str, y: int, v: dict) -> float:
    """The gas share of a year's fall in purchases from Russia (sanctions_share.json gas_part; Poland from volumes)."""
    if iso3 not in GAS_PART_FROM_VOLUMES:
        return v.get("gas_part") or 0.0
    tg = E2["transit_gas"]["countries"][iso3]
    bcm, val = tg["gas_from_rus_bcm"], tg["gas_from_rus_eur_bn"]
    pre_bcm = sum(bcm[str(x)]["central"] for x in (2019, 2020, 2021)) / 3
    per_bcm = sum(val[str(x)]["central"] for x in (2019, 2020, 2021)) / 3 / pre_bcm
    fall = v.get("fall_map") or v["mandated_eurbn"]["central"] / v["mandated_share_map"]["central"]
    gas_fall = max(0.0, pre_bcm * FRAC[YEARS.index(y)] - bcm[str(y)]["central"]) * per_bcm
    return min(1.0, gas_fall / fall) if fall > 0 else 0.0


def cut_fraction(iso3: str, y: int) -> float:
    """Share of year y after Russia cut the country's gas (0 before the cut year, 1 after it)."""
    d = RUSSIA_GAS_CUT.get(iso3)
    if not d:
        return 0.0
    cy, cm, cd = (int(x) for x in d.split("-"))
    if y < cy:
        return 0.0
    if y > cy:
        return 1.0
    start, end = datetime.date(cy, cm, cd), datetime.date(cy + 1, 1, 1)
    return (end - start).days / (end - datetime.date(cy, 1, 1)).days


def cut_part_of_gas_fall(iso3: str, y: int) -> float:
    """Round 29 (audit 29, economist: Italy's "gas cut off by Russia" took in its own move away from Russian gas): in a
    year after the cut, only the gas the country was still buying just before the cut was stopped by it; the rest of that
    year's fall against the pre-war level had already happened by the country's own choice. Share of the year's gas fall
    that the cut explains: (gas bought the year before the cut - gas bought this year) / (pre-war gas - gas bought this
    year), from transit_gas volumes (energy2.json, bcm). 1 where there are no volumes, or for a cut in 2022 (the year
    before is the pre-war level)."""
    d = RUSSIA_GAS_CUT.get(iso3)
    tg = (E2.get("transit_gas") or {}).get("countries", {}).get(iso3)
    if not d or not tg:
        return 1.0
    bcm = {int(k): v["central"] for k, v in tg["gas_from_rus_bcm"].items()}
    cy = int(d[:4])
    if cy <= 2022:
        return 1.0
    pre = sum(bcm.get(x, 0.0) for x in (2019, 2020, 2021)) / 3
    before = bcm.get(cy - 1, pre)
    now = bcm.get(y, 0.0) / (FRAC[YEARS.index(y)] or 1.0)
    fall = pre - now
    if fall <= 0:
        return 0.0
    return max(0.0, min(1.0, (before - now) / fall))


def fall_of(v: dict) -> float:
    """Round 16: the map's fall in one year of sanctions_share.json, kept as fall_map where stop dates moved the
    required part (apply_stop_dates), else the required euros over the required share."""
    m = v["mandated_share_map"]["central"]
    return v.get("fall_map") or (v["mandated_eurbn"]["central"] / m if m else 0.0)


def apply_stop_dates(sanc: dict) -> None:
    """Round 16 (review 5, M4; approved by the owner): "required by sanctions" follows the date each country actually
    stopped. What stopped before a ban took effect (Lithuania's and Finland's crude, Poland's coal and pipeline crude,
    Germany's pipeline crude; stop_dates_r16.json) moves from the required part to own choice; the fall itself is kept
    (fall_map), so only the split changes. Round 16b (check 16, N6): Poland's pipeline crude was stopped by Russia, so
    it goes to "stopped by Russia" (stopped_by_russia_eurbn, added to the cut share), not own choice. A label only: the
    totals do not change."""
    sd = load(GAPS / "stop_dates_r16.json")
    for iso3, years in sd["countries"].items():
        flow = (sanc["countries"].get(iso3) or {}).get("to_rus") or {}
        for y, m in years.items():
            v = flow.get(y)
            if not v or not v.get("mandated_share_map") or not v["mandated_share_map"]["central"]:
                continue
            v["fall_map"] = v["mandated_eurbn"]["central"] / v["mandated_share_map"]["central"]
            # round 16b (check 16, N6): the part Russia stopped itself (Poland's Druzhba crude, halted by Transneft on
            # 25 February 2023) is labelled stopped by Russia, like the gas it cut off, not the country's own choice
            v["stopped_by_russia_eurbn"] = (m.get("moved_stopped_by_russia") or [0.0] * 3)[1]
            for j, b in enumerate(_B3):
                old = v["mandated_eurbn"][b]
                new = max(0.0, old - m["moved_to_own_choice"][j])
                v["mandated_eurbn"][b] = round(new, 4)
                v["mandated_share_map"][b] = round(v["mandated_share_map"][b] * new / old, 4) if old else 0.0
            v["stop_dates_r16"] = True


def build() -> dict:
    src = Sources()
    kiel, flowback, other = (
        load(RESEARCH / "kiel.json"),
        load(RESEARCH / "flowback.json"),
        load(RESEARCH / "other.json"),
    )
    trade = load(GAPS / "trade_full.json")
    # better official data for the countries with the widest ranges (narrow.json) enter at customs level, so every later
    # step (re-exports, residual, freight, audits) applies to them as to everyone else
    for iso3, series in load(GAPS / "narrow.json")["countries"].items():
        for key, field in (("to_rus", "imports_from_RUS"), ("from_rus", "exports_to_RUS")):
            tl = (series.get(key) or {}).get("trade_layer")
            if tl and iso3 in trade["countries"]:
                f = trade["countries"][iso3].setdefault(field, {})
                for y, v in tl.items():
                    f[y] = {**(f.get(y) or {}), **{b: v[b] for b in ("low", "central", "high")}}
    # January-August 2026 actual trade where published since the first build (refresh_2026.json, round 5): monthly
    # UN Comtrade and national statistics replace the 2025-rate estimates
    for iso3, d in load(GAPS / "refresh_2026.json")["countries"].items():
        for field, by_year in d.items():
            v = by_year.get("2026") if isinstance(by_year, dict) else None
            if not isinstance(v, dict) or "central" not in v:
                continue
            f = trade["countries"].setdefault(iso3, {}).setdefault(field, {})
            f["2026"] = {**(f.get("2026") or {}), **{k: v[k] for k in ("low", "central", "high", "basis") if k in v}}
    # the UAE: its own customs totals, which match the official non-oil trade with Russia (round4b.json), after narrow.json, which is older for the UAE
    for key, field in (("to_rus", "imports_from_RUS"), ("from_rus", "exports_to_RUS")):
        f = trade["countries"].setdefault("ARE", {}).setdefault(field, {})
        for y, v in R4B["uae"][key].items():
            f[y] = {**(f.get(y) or {}), **{b: v[b] for b in ("low", "central", "high")}}
    aid_gaps, refugees = load(GAPS / "aid_gaps.json"), load(GAPS / "refugees.json")
    energy, companies = load(GAPS / "energy.json"), load(GAPS / "companies_all.json")
    countries: dict[str, dict] = {}
    notes: dict[str, dict[str, str]] = {}  # per country, per part: how the value was obtained

    def entry(iso3: str) -> dict | None:
        if iso3 in ("RUS", "UKR") or iso3 in INCLUDED_IN:  # destinations, and territories counted by another country
            return None
        if iso3 in countries:
            return countries[iso3]
        n = iso_numeric(iso3)
        if not n:
            return None
        countries[iso3] = {"n": n, "iso3": iso3, "name": short_name(iso3), "kind": "state"}
        if iso3 in TARIFF_WAIVER:
            countries[iso3]["tariff_waiver"] = True
        return countries[iso3]

    def note(iso3: str, part: str, status: str, text: str) -> None:
        notes.setdefault(iso3, {})[part] = (status, text)

    # ---- population and GDP ----
    for iso3, d in (other.get("population_gdp") or {}).items():
        c = entry(iso3)
        if c:
            c["pop"], c["gdp"] = d.get("pop_m"), d.get("gdp_eur_bn")

    # ---- trade with Russia and Ukraine, 2019-2026, with ranges and alternative baselines ----
    tid = src.add(
        "trade",
        "UN Comtrade, IMF trade statistics and Eurostat: goods trade with Russia and Ukraine",
        "https://comtradeapi.un.org/public/v1/preview/C/A/HS?period=2023&partnerCode=643&cmdCode=TOTAL&flowCode=M",
        trade.get("retrieved"),
        "own reports first, then partner (mirror) reports, IMF and estimates; 2026 is January to August",
    )
    flows = [
        ("to_rus", "imports_from_RUS", "Bought from Russia"),
        ("from_rus", "exports_to_RUS", "Sold to Russia"),
        ("buy_ukr", "imports_from_UKR", "Bought from Ukraine"),
        ("sell_ukr", "exports_to_UKR", "Sold to Ukraine"),
    ]
    basis_cert = {"reported": "A", "mirror": "B", "imf": "B", "estimated": "C"}
    for iso3, t in trade["countries"].items():
        c = entry(iso3)
        if not c:
            continue
        for key, field, part in flows:
            f = t.get(field) or {}
            if not f:
                continue
            series = lch(f)
            base = f.get("baseline") or {}
            alts = [
                x
                # the 2022 trend projection is left out: the map applies the pre-war trend itself (bmul)
                for x in (base.get("avg_2019_2021"), base.get("low"), base.get("high"))
                if x is not None
            ]
            series["base_range"] = [round(min(alts), 5), round(max(alts), 5)] if alts else [series["years"][0]] * 2
            # pre-war level: the 2019-2021 average, so a one-off spike in a single year does not count as a cut;
            # 2021 alone and the 2019-2021 trend widen the range (base_range). counterfactual() later resets the
            # middle value to 2021 at pre-war prices for the flows it models, as the site's text says
            avg = base.get("avg_2019_2021")
            series["base"] = round(avg, 5) if avg is not None else series["years"][0]
            bases = [(f.get(str(y)) or {}).get("basis", "estimated") for y in YEARS]
            cert = weakest(basis_cert.get(b, "C") for b in bases[:5])
            c[key] = {**series, "cert": cert, "src": [tid]}
            if key == "to_rus":
                # round 16b (check 16, B1): the yearly 2019-2021 values, so counterfactual() can take the small-flow
                # baseline from the years themselves (dropped before writing)
                c[key]["_pre"] = [(f.get(str(y)) or {}).get("central") or 0.0 for y in PRE_YEARS]
            if bases[5] == "estimated":
                c[key]["est26"] = True  # no 2026 figures published yet: estimated from 2025
            kinds = sorted({b for b in bases})
            status = "ok" if set(bases[:5]) == {"reported"} else "est"
            note(iso3, part, status, "reported 2021-2025" if status == "ok" else "partly filled: " + ", ".join(kinds))

    # ---- Russia's partners that do not report trade: corrected values, and only the paid share counts ----
    nr = load(GAPS / "nonreport.json")
    nid = src.add(
        "nonreport",
        "Trade with Russia for partners that do not report (Cuba, Venezuela, Syria, Libya, Iran...): tanker tracking, official statements",
        None,
        nr.get("retrieved"),
        "Russian supplies given on credit or as aid are Russian support, not money to Russia: only the paid share counts",
    )
    for iso3, d in nr["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        ps = d.get("paid_share") or {"low": 1, "central": 1, "high": 1}
        for key, field in (("to_rus", "imports_from_RUS"), ("from_rus", "exports_to_RUS")):
            f = d.get(field)
            if not f:
                continue
            ser = lch(f)
            avg = sum((f.get(str(y)) or {}).get("central", 0) for y in (2019, 2020, 2021)) / 3
            ser["base"], ser["base_range"] = round(avg, 5), [ser["years_lo"][0], ser["years_hi"][0]]
            ser["_pre"] = [(f.get(str(y)) or {}).get("central", 0) for y in PRE_YEARS]
            if (
                key == "to_rus"
            ):  # unpaid supplies are not money to Russia (all years, so the comparison stays like for like)
                for k, sh in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    ser[k] = [round(v * ps[sh], 5) for v in ser[k]]
                ser["base"] = round(ser["base"] * ps["central"], 5)
                ser["_pre"] = [v * ps["central"] for v in ser["_pre"]]
                ser["base_range"] = [ser["base_range"][0] * ps["low"], ser["base_range"][1] * ps["high"]]
                ser["paid_share"] = ps
            old_src = (c.get(key) or {}).get("src", [])
            c[key] = {**ser, "cert": d.get("certainty") or "C", "src": old_src + [nid]}
        note(
            iso3,
            "Bought from Russia",
            "est",
            f"corrected for missing reports; only the paid share ({ps['central']:.0%}) counts",
        )

    # ---- aid: Kiel for its 41 donors (+ EU share), UN FTS and national reports for everyone else ----
    s = kiel["source"]
    kid = src.add(
        "kiel",
        "Kiel Institute, Ukraine Support Tracker " + s.get("release", ""),
        # the release's own workbook, not the tracker's home page (round 13 audit)
        s.get("url") or s.get("page"),
        s.get("data_until"),
    )
    kiel_donors = set()
    eu_total = (kiel["donors"].get("EU_INST") or {}).get("total_allocated") or 0
    eu_aid = None
    for iso3, d in kiel["donors"].items():
        if not d.get("total_allocated"):
            continue
        by_year = d.get("by_year") or {}
        years = [0] + [round(by_year.get(str(y)) or 0, 4) for y in YEARS[1:]]
        unassigned = d.get("total_allocated", 0) - sum(years)
        if (
            unassigned > 0.0005
        ):  # amounts without a month: spread over the years in proportion (round 38: also small ones)
            tot = sum(years) or 1
            years = [round(v + unassigned * v / tot, 4) for v in years]
        loans, era = d.get("loans_face_value") or 0, d.get("era_allocated") or 0
        if era:
            # G7 loans repaid from immobilised Russian assets (ERA) are Russia's money, not the donor's: left out,
            # in the years they were paid (Kiel release 31: the US in December 2024, Japan in 2026, the UK 1.78 in
            # 2025 and the rest in 2026, the others in 2025; refresh_2026-notes.md)
            plan = ERA_YEARS.get(iso3) or {2025: era}
            left = era
            for y, amount in plan.items():
                i = YEARS.index(y)
                take = min(left, amount if amount is not None else left, years[i])
                years[i], left = round(years[i] - take, 4), left - take
            for i in range(len(YEARS) - 1, 0, -1):
                take = min(left, years[i])
                years[i], left = round(years[i] - take, 4), left - take
            loans = max(0, loans - era)
        aid = {
            "years": years,
            # frozen-asset (ERA) loans are financial aid in Kiel's categories; they are left out here as in the years
            "cats": {
                k: round(
                    max(0.0, (d.get(f"{k}_allocated") or 0) - (era if k == ERA_CATEGORY.get(iso3, "financial") else 0)),
                    3,
                )
                for k in ("military", "financial", "humanitarian")
            },
            "loans_face": round(loans, 3) or None,
            # loans repaid from frozen Russian assets (ERA) cost the lender almost nothing
            "loans_grant_eq": round(loans * LOAN_GRANT_ELEMENT, 3) if loans else None,
            "era_excluded": round(era, 3) or None,
            "pledged_open": round(d.get("pledged_not_delivered") or 0, 3),
            "cert": d.get("certainty") or "A",
            "src": [kid],
        }
        if iso3 == "EU_INST":
            eu_aid = aid
            continue
        c = entry(iso3)
        if not c:
            continue
        c["aid"] = aid
        kiel_donors.add(iso3)
        if iso3 in EU27 and d.get("eu_share_allocated") and eu_total:
            c["eu_share"] = round(d["eu_share_allocated"] / eu_total, 5)
        note(iso3, "Aid to Ukraine", "ok", "Kiel Institute, to 31 Aug 2026")

    # EU-level aid is split over member states by their contribution to the EU budget (Kiel's method)
    eu_src = src.add(
        "kiel_eu_share",
        "EU-level aid split over member states by their contribution to the EU budget (Kiel method)",
        s.get("url") or s.get("page"),
        s.get("data_until"),
    )
    for c in countries.values():
        share = c.get("eu_share")
        if not share or not eu_aid:
            continue
        a = c["aid"]
        a["eu_years"] = scaled(eu_aid["years"], share)
        a["years"] = [round(x + y, 4) for x, y in zip(a["years"], a["eu_years"])]
        a["cats"] = {k: round(v + eu_aid["cats"][k] * share, 3) for k, v in a["cats"].items()}
        a["loans_face"] = round((a.get("loans_face") or 0) + (eu_aid["loans_face"] or 0) * share, 3)
        a["loans_grant_eq"] = round((a.get("loans_grant_eq") or 0) + (eu_aid["loans_grant_eq"] or 0) * share, 3)
        a["pledged_open"] = round((a.get("pledged_open") or 0) + (eu_aid["pledged_open"] or 0) * share, 3)
        a["eu_share"] = share
        a["src"] = a["src"] + [eu_src]
        # sources of the "Share of EU-level aid" part on the map; loans_value and audit are added where they change it
        a["eu_src"] = [eu_src]
        note(c["iso3"], "Aid to Ukraine", "ok", "Kiel Institute, to 31 Aug 2026, incl. EU share")

    gid = src.add(
        "aid_gaps",
        "Aid from countries outside the Kiel tracker: UN OCHA Financial Tracking Service and government reports",
        "https://fts.unocha.org/countries/234/summary/2026",
        aid_gaps.get("generated"),
        "countries with no record: 0, with a small upper bound based on what similar donors gave",
    )
    for iso3, d in aid_gaps["countries"].items():
        c = entry(iso3)
        if not c or c.get("aid"):
            continue
        series = lch(d.get("years"))
        split = d.get("split") or {}
        c["aid"] = {
            **series,
            "cats": {k: round(split.get(k) or 0, 4) for k in ("military", "financial", "humanitarian")},
            "cert": d.get("certainty") or "D",
            "src": [gid],
        }
        found = (d.get("total") or {}).get("central")
        note(
            iso3,
            "Aid to Ukraine",
            "est",
            "UN FTS and government reports" if found else "no record found: 0, with a small upper bound",
        )

    # ---- refugee hosting, per year with ranges ----
    rid = src.add(
        "refugees",
        "Refugee hosting cost: national budget figures where reported, otherwise refugees hosted per year x cost per refugee calibrated on those budgets",
        "https://ec.europa.eu/eurostat/databrowser/view/migr_asytpsm/default/table",
        refugees.get("generated"),
        "Eurostat and UNHCR counts, US and Canadian programme arrivals; see research/2026-10/gaps/refugees-notes.md",
    )
    for iso3, d in refugees["countries"].items():
        c = entry(iso3)
        if not c:
            continue
        series = lch(d.get("cost"))
        if not any(series["years_hi"]):
            continue
        a = c.setdefault("aid", {"years": [0] * 6, "cats": {}, "cert": "D", "src": []})
        a["refugee_years"], a["refugee_years_lo"], a["refugee_years_hi"] = (
            series["years"],
            series["years_lo"],
            series["years_hi"],
        )
        a["refugee_cert"] = d.get("certainty") or "C"
        a["refugee_src"] = [rid]
        counts = d.get("counts") or {}
        latest = next((counts[y] for y in ("2026", "2025", "2024") if counts.get(y)), None)
        if latest:
            c.setdefault("people", {})["refugees"] = {
                "count": latest,
                "as_of": "2026" if counts.get("2026") else "2025",
                "src": [rid],
            }
        note(
            iso3,
            "Refugee hosting",
            "ok" if d.get("basis") == "reported" else "est",
            "national budget figures" if d.get("basis") == "reported" else "modelled from refugees hosted per year",
        )

    # refugee costs paid by donors (UN refugee plans, EU grants) are not the host country's own cost
    rdf = load(GAPS / "flowback2.json")["refugee_donor_funding"]
    for iso3, d in rdf.items():
        a = (countries.get(iso3) or {}).get("aid") or {}
        if not a.get("refugee_years"):
            continue
        sh = d["donor_share"]
        a["refugee_years"] = [round(v * (1 - sh["central"]), 5) for v in a["refugee_years"]]
        a["refugee_years_lo"] = [round(v * (1 - sh["high"]), 5) for v in a["refugee_years_lo"]]
        a["refugee_years_hi"] = [round(v * (1 - sh["low"]), 5) for v in a["refugee_years_hi"]]
        a["refugee_donor_share"] = sh

    # ---- energy: switching cost, oil discount, laundered oil, fossil fuel payments ----
    eid = src.add(
        "energy",
        "Energy switching cost, oil discounts and laundered oil: modelled per fuel from CREA, Eurostat, Comtrade and market prices",
        "https://www.russiafossiltracker.com/methodology/",
        energy.get("generated"),
        "see research/2026-10/gaps/energy-notes.md",
    )
    laundered: dict[str, dict] = {}
    e2 = E2
    transit = e2["transit_gas"]["countries"]
    customs_gas = load(GAPS / "customs_gas.json")["countries"]
    src.add(
        "transit_gas",
        "Russian gas by country of final use (Eurostat imports by origin, ENTSOG flows, CREA), passed on from transit countries",
        "https://ec.europa.eu/eurostat/databrowser/view/nrg_ti_gas/default/table",
        e2.get("generated"),
        "replaces the gas in customs data (UN Comtrade HS 2711, research/2026-10/gaps/customs_gas.json) and in the fossil fuel tracker; see energy2-notes.md; Austria, Switzerland and Hungary 2024 are estimates",
    )
    for iso3, d in energy["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        sw, disc = lch(d.get("switching_cost")), lch(d.get("oil_discount_gain"))
        cert = d.get("certainty") or {}
        c["energy"] = {
            "premium": sw["years"], "premium_lo": sw["years_lo"], "premium_hi": sw["years_hi"],
            "discount": disc["years"], "discount_lo": disc["years_lo"], "discount_hi": disc["years_hi"],
            "cert": cert.get("switching_cost", "C"), "src": [eid], "discount_src": [eid],
        }  # fmt: skip
        fossil = lch(d.get("fossil_from_russia"))
        laund = lch(d.get("laundered_oil"))
        tr = c.get("to_rus")
        tg = transit.get(iso3)
        if tg:
            # the fossil tracker counts gas where it crosses the border (Slovakia, Austria, Bulgaria...); the gas
            # research gives it where it is used, so the tracker's gas share is swapped for that
            gas = lch({y: v for y, v in tg["gas_from_rus_eur_bn"].items() if int(y) >= YEARS[0]})
            # valued at the country's own Russian gas price where researched (Europe-wide price otherwise)
            own = (GAS_PRICES["countries"].get(iso3) or {}).get("pipeline") or {}
            bcm = tg.get("gas_from_rus_bcm") or {}
            for i, y in enumerate(YEARS):
                pr, vol = own.get(str(y)), bcm.get(str(y))
                if pr and vol and vol.get("central"):
                    for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                        gas[k][i] = round(vol[b] * pr[b] * MWH_PER_BCM / 1e9, 5)
            cg = customs_gas.get(iso3, {})
            cyears = [cg.get(str(y), 0.0) for y in YEARS]
            g25 = gas["years"][4]
            cyears[5] = cyears[4] * (gas["years"][5] / g25 if g25 else FRAC[5])
            if "passed_on_shares" not in tg:
                # not a transit country: gas its customs record as Russian was used there, even if the gas research
                # found less (Greece)
                for k in ("years", "years_lo", "years_hi"):
                    gas[k] = [round(max(g, cv), 5) for g, cv in zip(gas[k], cyears)]
            share = non_gas_share(d.get("fossil_from_russia_by_fuel_mt") or {}, e2["price_index"])
            for k in ("years", "years_lo", "years_hi"):
                fossil[k] = [round(f * s + g, 5) for f, s, g in zip(fossil[k], share, gas[k])]
            # Moldova: its own customs data hold the gas right-bank Moldova paid for; the gas research adds
            # Transnistria's unpaid Gazprom gas, which is support for Transnistria, not money to Russia (cf_bands.json)
            if tr and iso3 != "MDA":
                # customs data record gas where it crosses the border too: that gas is swapped for final-use gas
                gic = gas_in_customs(iso3, gas["years"])
                if gic:
                    # customs already hold this gas under another heading (Turkey, Poland; part of it for Germany)
                    cyears = [max(cv, g * sh) for cv, g, sh in zip(cyears, gas["years"], gic)]
                for k in ("years", "years_lo", "years_hi"):
                    tr[k] = [round(max(0.0, t - cgv) + g, 5) for t, cgv, g in zip(tr[k], cyears, gas[k])]
                pre = {
                    b: sum(tg["gas_from_rus_eur_bn"][str(y)][b] for y in (2019, 2020, 2021)) / 3
                    for b in ("low", "central", "high")
                }
                cpre = sum(cg.get(str(y), 0.0) for y in (2019, 2020, 2021)) / 3
                if gic:
                    cpre = max(cpre, pre["central"] * gic[0])
                tr["base"] = round(max(0.0, tr["base"] - cpre) + pre["central"], 5)
                if tr.get("_pre"):  # the same swap, year by year
                    g0 = gic[0] if gic else 0.0
                    tr["_pre"] = [
                        max(0.0, v - max(cg.get(str(y), 0.0), tg["gas_from_rus_eur_bn"][str(y)]["central"] * g0))
                        + tg["gas_from_rus_eur_bn"][str(y)]["central"]
                        for v, y in zip(tr["_pre"], PRE_YEARS)
                    ]
                tr["base_range"] = [
                    round(max(0.0, tr["base_range"][0] - cpre) + pre["low"], 5),
                    round(max(0.0, tr["base_range"][1] - cpre) + pre["high"], 5),
                ]
                tr["src"] = tr.get("src", []) + ["transit_gas"]
        if tr and iso3 in PIPELINE_GAS and iso3 != "MDA":  # Moldova: customs gas only (see above)
            # customs data miss some fossil fuel (pipeline gas is not always recorded as Russian),
            # so payments to Russia use whichever is larger each year: all imports from Russia, or the fossil fuel value
            for k in ("years", "years_lo", "years_hi"):
                tr[k] = [round(max(a, b), 5) for a, b in zip(tr[k], fossil[k])]
            # the fossil value is known from 2021 only: brought to 2019-2021 prices to compare with the baseline
            f21 = {b: fuel_index(iso3, b)[0] for b in ("low", "central", "high")}
            tr["base_range"] = [
                # fuel is only part of imports: the low end is the larger of the two lows, not the smaller
                max(tr["base_range"][0], fossil["years_lo"][0] / f21["high"]),
                max(tr["base_range"][1], fossil["years_hi"][0] / f21["low"]),
            ]
            if fossil["years"][0] / f21["central"] > tr.get("base", 0):
                tr["_pre_single"] = "fossil"  # the baseline is now a 2021 value: no yearly series behind it
            tr["base"] = round(max(tr.get("base", 0), fossil["years"][0] / f21["central"]), 5)
        if tr:
            if iso3 in EU27:
                # the model's laundered oil for EU members is about 1.6 times the Russian crude Global Witness finds in
                # EU imports (audit); corrected before resale, so what EU hubs pass on is corrected too
                # 0.62 = 1 / 1.6 (audit-notes item 4); the 0.5-0.8 band is a judgement (site/content/changelog.md, constants)
                for k, m in (("years", 0.62), ("years_lo", 0.5), ("years_hi", 0.8)):
                    laund[k] = [v * m for v in laund[k]]
            laundered[iso3] = laund
        note(iso3, "Energy switching cost", "est", "modelled per fuel and month")
    # GDP from residual.json is needed now: laundered oil is capped at a share of GDP (Gibraltar)
    for iso3, d in load(GAPS / "residual.json")["population_gdp"].items():
        c = countries.get(iso3)
        if c and not c.get("gdp") and (d.get("gdp_eur_bn") or {}).get("central"):
            c["gdp"], c["pop"] = d["gdp_eur_bn"]["central"], (d.get("pop_m") or {}).get("central")
    reassign_laundered_oil(countries, laundered, src)
    apply_laundered_eu(countries, src)
    apply_laundered_r6(countries, src)
    apply_assumptions_r11_laundered(countries)
    # refiners: the Russian crude in the fuel Turkey and India export is counted at the buyers (laundered oil),
    # so it is taken out of the refiner's own payments to Russia; they keep what they use themselves
    hb = load(GAPS / "hub_buyers.json")
    # what is taken off the refiner must equal what its buyers are charged: the exported fuel x the refiner's own crude
    # ratio for that year (crude_k), which the buyers' blended ratio averages (round 5 review: different ratios on the two
    # sides had left EUR 14bn uncounted)
    bands = {"low": 0, "central": 1, "high": 2}

    def as_crude(by_year: dict, key: str, ref: str) -> dict:
        return {
            y: {b: (v.get(key) or {}).get(b, 0.0) * crude_k(int(y), ref)[i] for b, i in bands.items()}
            for y, v in by_year.items()
        }

    china = load(GAPS / "round4a.json")["china_refining"]["exported_crude_value"]
    exported = {
        "TUR": as_crude(hb["turkey_refining"]["by_year"], "exported_product_value_eur_bn", "TUR"),
        "IND": as_crude(hb["india_refining"], "exported_product_value_eur_bn", "IND"),
        # China reports crude values only: fuel = crude / China's measured crude share of its fuel exports for the
        # year (crude_content.json, central 0.72-0.82 in 2022-2026). Round 12, was a flat / 0.70 (judgement)
        "CHN": {
            y: {b: v.get(b, 0.0) / crude_k(int(y), "CHN")[1] * crude_k(int(y), "CHN")[i] for b, i in bands.items()}
            for y, v in china.items()
        },
    }
    rid = src.add(
        "refining",
        "Russian crude refined in Turkey and India and exported as fuel: refinery reports, UN Comtrade, CREA, Global Witness",
        "https://energyandcleanair.org/",
        hb.get("generated"),
        "the exported part is counted at the buyers as laundered oil; see research/2026-10/gaps/hub_buyers-notes.md",
    )
    # before the war the refined fuel came mostly from China (round4a.json laundered_prewar): the buyers' pre-war
    # level of laundered oil already holds it, so it comes out of China's 2021 payments too (audit, round 10)
    pre_refined = sum((c.get("laund") or {}).get("base", 0.0) for c in countries.values())
    exported["CHN"]["2021"] = {b: pre_refined for b in bands}
    for iso3, by_year in exported.items():
        tr = (countries.get(iso3) or {}).get("to_rus")
        if not tr:
            continue
        gross = {k: list(tr[k]) for k in ("years", "years_lo", "years_hi")}
        for k, b in (("years", "central"), ("years_lo", "high"), ("years_hi", "low")):
            tr[k] = [round(max(0.0, v - (by_year.get(str(y)) or {}).get(b, 0)), 5) for v, y in zip(tr[k], YEARS)]
        # what was taken off, kept so that apply_net_gain() can weight it at Russia's gain on crude (audit, round 10)
        tr["_refined_out"] = [g - v for g, v in zip(gross["years"], tr["years"])]
        tr["src"] = tr.get("src", []) + [rid]
    eu_refiner_exports(countries, src, rid)

    # ---- taxes paid in Russia by companies based in the country (all taxes, still foreign-owned) ----
    kse = src.add(
        "companies",
        "KSE Institute and B4Ukraine: all taxes paid in Russia by foreign-owned companies, by home country",
        "https://leave-russia.org/",
        companies.get("generated"),
        "reported for about 20 countries, allocated by company counts and investment for the rest; companies sold to Russian owners are not counted",
    )
    counts = (load(RESEARCH / "companies.json") or {}).get("countries", {})  # company counts (USA and Germany)
    for iso3, d in companies["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        series = lch(d.get("all_taxes"))
        # 2026 is not reported yet: the 2025 rate for eight months, with a wider range
        series["years"][5] = round(series["years"][4] * FRAC[5], 5)
        series["years_lo"][5] = round(series["years_lo"][4] * FRAC[5] * 0.7, 5)
        series["years_hi"][5] = round(series["years_hi"][4] * FRAC[5] * 1.2, 5)
        if not any(series["years_hi"]):
            note(iso3, "Company taxes in Russia", "ok", "no companies operating in Russia found")
            continue
        c["company"] = {
            "taxes": series["years"], "taxes_lo": series["years_lo"], "taxes_hi": series["years_hi"],
            "staying": counts.get(iso3, {}).get("companies_staying"), "left": counts.get(iso3, {}).get("companies_left"),
            "cert": d.get("certainty") or "C", "src": [kse], "est26": True,
        }  # fmt: skip
        note(
            iso3,
            "Company taxes in Russia",
            "ok" if d.get("basis") == "reported" else "est",
            "KSE country figures" if d.get("basis") == "reported" else "allocated by company counts and investment",
        )

    # taxes paid in Russia that count: profit tax in full and half of the other taxes (VAT, excise and payroll taxes are
    # largely paid by Russian customers and staff); the baseline is the 2018-2021 average (round4a.json)
    r4a = load(GAPS / "round4a.json")["taxes"]
    for iso3, c in countries.items():
        co, sp = c.get("company"), r4a["split"].get(iso3)
        if not co or not sp:
            continue
        hist = r4a["history_2018_2020_split"].get(iso3) or {}
        meas = lambda d, b: (d.get("profit") or {}).get(b, 0) + 0.5 * (d.get("other") or {}).get(b, 0)  # noqa: E731
        for k, b in (("taxes", "central"), ("taxes_lo", "low"), ("taxes_hi", "high")):
            vals = [meas(sp.get(str(y)) or {}, b) for y in YEARS[:5]]
            vals.append(vals[4] * FRAC[5])  # 2026 to August: the 2025 rate
            co[k] = [round(v, 5) for v in vals]
        pre = [meas(hist.get(str(y)) or {}, "central") for y in (2018, 2019, 2020)] + [co["taxes"][0]]
        pre_lo = [meas(hist.get(str(y)) or {}, "low") for y in (2018, 2019, 2020)] + [co["taxes_lo"][0]]
        pre_hi = [meas(hist.get(str(y)) or {}, "high") for y in (2018, 2019, 2020)] + [co["taxes_hi"][0]]
        co["base"] = round(sum(pre) / 4, 5)
        co["base_range"] = [round(sum(pre_lo) / 4, 5), round(sum(pre_hi) / 4, 5)]
        co["base_2018_2021"] = True

    # round 6: KSE's series checked against company reports (Raiffeisen's country-by-country tax, UniCredit, OTP,
    # PepsiCo) and the Bundesbank; carried-forward and interpolated years revised, seized Unipro and Fortum removed from
    # May 2023, JTI moved to Japan. Same measure (profit tax + half the other taxes); 2026 is January-August already
    r6 = load(GAPS / "company_taxes_r6.json")
    rid = src.add(
        "company_taxes_r6",
        "Company taxes in Russia: KSE checked against company reports (Raiffeisen, UniCredit, OTP, PepsiCo) and Bundesbank reinvested earnings",
        "https://leavingrussia.org/",
        r6.get("generated"),
        "replaces the KSE split; see research/2026-10/gaps/company_taxes_r6-notes.md",
    )
    for iso3, d in r6["countries"].items():
        c = countries.get(iso3)
        om = d.get("owner_measure")
        if not c or not om or not any((om.get(str(y)) or {}).get("high") for y in YEARS):
            continue
        co = c.setdefault("company", {"cert": "C", "src": []})
        for k, b in (("taxes", "central"), ("taxes_lo", "low"), ("taxes_hi", "high")):
            co[k] = [round((om.get(str(y)) or {}).get(b, 0.0), 5) for y in YEARS]
        bb = d["base_2018_2021"]
        co["base"], co["base_range"], co["base_2018_2021"] = bb["central"], [bb["low"], bb["high"]], True
        co["cert"] = d.get("certainty") or co["cert"]
        co["src"] = [x for x in co["src"] if x != kse] + [rid]
        co["est26"] = True

    # ---- flows researched last: services trade, gold and hidden channels, undisclosed aid, private donations ----
    unc = load(GAPS / "uncovered.json")
    svc = src.add(
        "services",
        "Services trade with Russia (tourism, transport, business services): Eurostat, OECD-WTO BaTiS, Bank of Russia",
        "https://www.oecd.org/en/data/datasets/balanced-trade-in-services.html",
        "2026-10",
        "see research/2026-10/gaps/uncovered-notes.md",
    )
    hid = src.add(
        "hidden",
        "Gold and hidden payment channels to Russia not in customs data: Swissaid, Reuters, Hong Kong and Kyrgyz trade gaps",
        None,
        "2026-10",
        "rough indication, certainty D",
    )
    und = src.add(
        "undisclosed",
        "Undisclosed military aid beyond the Kiel tracker: Kiel policy briefs, national reports",
        None,
        "2026-10",
        "certainty C-D",
    )
    pri = src.add(
        "private",
        "Private donations to Ukraine: national donation totals (DZI, DEC, Candid) and a GDP-based model elsewhere",
        None,
        "2026-10",
        "certainty C-D",
    )
    for iso3, d in unc["services"]["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        for key, field in (("svc_bought", "bought_from_rus"), ("svc_sold", "sold_to_rus")):
            if d.get(field):
                ser = lch(d[field])
                ser["base"], ser["base_range"] = ser["years"][0], [ser["years_lo"][0], ser["years_hi"][0]]
                c[key] = {**ser, "cert": d.get("certainty") or "C", "src": [svc]}
        note(iso3, "Services trade with Russia", "est", "Eurostat, OECD-WTO and Bank of Russia data")
    for section, key, sid in (
        ("hidden_channels", "hidden", hid),
        ("undisclosed_aid", "undisclosed", und),
        ("private_donations", "private", pri),
    ):
        for iso3, d in unc[section]["countries"].items():
            if section == "hidden_channels" and iso3 == "HKG":  # Hong Kong's 2026 gold is already in its trade data
                continue
            c = countries.get(iso3)
            ser = lch(d.get("to_rus") or d.get("years"))
            if c and any(ser["years_hi"]):
                c[key] = {**ser, "cert": d.get("certainty") or "D", "src": [sid]}
    # Kyrgyzstan's hidden gold went on to the buyers of Kyrgyz gold (kgz_gold.json): counted for them, as for other
    # hubs; Kyrgyzstan keeps a 5% margin
    kg, h = load(GAPS / "kgz_gold.json"), (countries.get("KGZ") or {}).get("hidden")
    if h:
        for buyer, w in kg["shares"].items():
            b = countries.get("CHN" if buyer == "HKG" else buyer)  # Hong Kong's gold counts for China
            if not b:
                continue
            o = b.setdefault("hidden", {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6, "cert": "D", "src": [hid]})  # fmt: skip
            for k in ("years", "years_lo", "years_hi"):
                o[k] = [round(v + x * w * (1 - kg["margin_kept"]), 5) for v, x in zip(o[k], h[k])]
        for k in ("years", "years_lo", "years_hi"):
            h[k] = [round(x * kg["margin_kept"], 5) for x in h[k]]
    for iso3 in countries:
        if countries[iso3].get("private"):
            note(iso3, "Private donations", "est", "national totals or a GDP-based estimate")

    # ---- money flowing back: own-industry share of military aid, NATO PURL ----
    # SUPERSEDED (round 11 audit): apply_money_ledger() deletes every value and source this section sets
    # (OWN_SHARE_DEFAULT, the USA PURL band x0.9/1.1 and x0.7/1.3, EU_ARMS_SLICE here); it is kept as history
    fb = flowback["countries"]
    model = src.add(
        "flowback_model",
        "Own-industry share of military aid: modelled range from procurement evidence",
        None,
        "2026-10",
        "no government except the US publishes this share",
    )
    csis = src.add(
        "csis",
        "CSIS, Where is the missing $100 billion in US aid for Ukraine",
        "https://www.csis.org/analysis/where-missing-100-billion-us-aid-ukraine",
        "2025-02-11",
    )
    purl = src.add(
        "purl",
        "Kiel Policy Brief 203 and Ukrainian government, NATO PURL purchases",
        "https://www.kmu.gov.ua/en/news/rik-purl-maizhe-7-mlrd-dlia-postavok-krytychnoho-ozbroiennia-dlia-ukrainy",
        "2026-07-23",
    )
    default = src.add(
        "flowback_default",
        "Assumed own-industry share 0-30% (middle 10%) where no evidence was found; replaced by the money ledger",
        None,
        None,
        "certainty D",
    )
    fb2 = load(GAPS / "flowback2.json")["own_industry"]
    kiel_item = src.add(
        "flowback_kiel",
        "Own-industry share of military aid from Kiel's item-level coding (own stocks, domestic purchases, purchases abroad)",
        "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx",
        "2026-10",
        "stocks refilled at home and items with no coded source are estimated per donor; see research/2026-10/gaps/flowback2-notes.md",
    )
    # EU-level military aid is spent mostly with EU/EEA industry, by where arms are made (SIPRI), not by budget share
    # round 11 (rules): EU_ARMS_SLICE is already a share of all EU-level military aid (Kiel's items), so the EU/EEA
    # industry factor is 1; and Kiel dates every EU-level military item 2026, so it is not spread over 2022-2026 by the
    # EU's total aid profile. (money_ledger.json replaces this flowback below and dates it 2026 as well.)
    eu_ind = {"low": 1.0, "central": 1.0, "high": 1.0}
    eu_mil_years = [0.0] * 5 + [eu_aid["cats"]["military"]] if eu_aid else [0] * 6
    for iso3, c in countries.items():
        a = c.get("aid") or {}
        mil_total = (a.get("cats") or {}).get("military") or 0
        if mil_total < 0.01:
            continue
        info = fb.get(iso3) or {}
        share = info.get("own_industry_share") or {}
        share = share.get("of_military_aid", share)
        if iso3 in fb2 and iso3 != "USA":  # item-level evidence replaces the earlier modelled shares
            share = fb2[iso3]["own_share"]
        known = share.get("central") is not None
        lo, mid, hi = (
            (share.get("low", share["central"]), share["central"], share.get("high", share["central"]))
            if known
            else OWN_SHARE_DEFAULT
        )
        paid = info.get("purl_paid_eur_bn") or {}
        purl_out = [
            0,
            0,
            0,
            0,
            (paid.get("2025") or {}).get("value", 0) if isinstance(paid.get("2025"), dict) else 0,
            0,
        ]
        if paid.get("cumulative_eur_bn"):
            purl_out[5] = max(0, paid["cumulative_eur_bn"] - purl_out[4])
        # only the country's own (bilateral) military aid: its EU share is spent by EU rules, handled below
        eu_mil = (a.get("eu_share") or 0) * (eu_aid["cats"]["military"] if eu_aid else 0)
        bil_years = [v - e for v, e in zip(a["years"], a.get("eu_years") or [0] * 6)]
        total = sum(bil_years) or 1
        mil_years = [v * max(0, mil_total - eu_mil) / total for v in bil_years]
        base = [max(0, m - p) for m, p in zip(mil_years, purl_out)]
        c["flowback"] = {
            "own": scaled(base, mid), "own_lo": scaled(base, lo), "own_hi": scaled(base, hi), "purl_out": [round(v, 4) for v in purl_out],
            "cert_own": ("B" if iso3 == "USA" else "C") if known else "D",
            "src": [csis if iso3 == "USA" else kiel_item if iso3 in fb2 else model if known else default],
        }  # fmt: skip
        # the values below are replaced by apply_money_ledger(); the note describes what the map shows
        note(
            iso3,
            "Money flowing back",
            "ok" if iso3 == "USA" else "est",
            "each euro followed to the economy where it was spent",
        )
    eu_src = src.add(
        "eu_industry",
        "EU-level military aid spent with each member's arms industry: Kiel item coding (round 11); replaced by the money ledger",
        "https://www.sipri.org/sites/default/files/2025-11/fs_2512_top_100_2024.pdf",
        "2025-12",
        "rough split; certainty C",
    )
    for iso3, slice_ in EU_ARMS_SLICE.items():
        c = countries.get(iso3)
        if not c or not eu_aid:
            continue
        fbk = c.setdefault("flowback", {"own": [0] * 6, "src": [], "cert_own": "C"})
        for key, f in (("purl_in", eu_ind["central"]), ("purl_in_lo", eu_ind["low"]), ("purl_in_hi", eu_ind["high"])):
            fbk[key] = [round(x + v * f * slice_, 5) for x, v in zip(fbk.get(key) or [0] * 6, eu_mil_years)]
        fbk["purl_src"] = fbk.get("purl_src", []) + [eu_src]
    usa = countries.get("USA")
    rec = ((fb.get("USA") or {}).get("received_from_others_eur_bn") or {}).get("purl_by_year") or {}
    if usa and rec:
        y25 = (rec.get("2025") or {}).get("value") or 0
        y26 = (rec.get("2026_to_july") or {}).get("value") or 0
        usa["flowback"]["purl_in"] = [0, 0, 0, 0, y25, y26]
        usa["flowback"]["purl_in_lo"], usa["flowback"]["purl_in_hi"] = (
            [0, 0, 0, 0, y25 * 0.9, y26 * 0.7],
            [0, 0, 0, 0, y25 * 1.1, y26 * 1.3],
        )
        usa["flowback"]["purl_src"] = [purl]

    # ---- military support to Russia, volunteers and fighters ----
    # the first estimates below (other_mil, its year shape and x0.5/x2 fallback) are SUPERSEDED for every country by
    # flowback2.json and military_rus_r6.json further down (round 11 audit); kept as history
    oid = src.add(
        "other_mil",
        "Military support to Russia: estimates from KIDA, INSS, Bloomberg and others",
        None,
        "2026-10",
        "rough indication, certainty D; mostly paid for by Russia",
    )
    for iso3, d in (other.get("military_to_russia") or {}).items():
        if iso3 == "CHN":  # China's dual-use sales are already in its exports to Russia (trade data)
            continue
        c = countries.get(iso3)
        tot = d.get("total_eur_bn") or {}
        if c and tot.get("central"):
            shape = [0, 0.05, 0.3, 0.35, 0.2, 0.1]
            mid, lo, hi = tot["central"], tot.get("low") or tot["central"] * 0.5, tot.get("high") or tot["central"] * 2
            c["military_rus"] = {
                "years": spread(mid, shape),
                "years_lo": spread(lo, shape),
                "years_hi": spread(hi, shape),
                "src": [oid],
            }
    fb2all = load(GAPS / "flowback2.json")
    oid2 = src.add(
        "other_mil2",
        "Military support to Russia: INSS, KIDA, Bloomberg, Ukrainian and Western intelligence, own valuation for Belarus",
        None,
        "2026-10",
        "rough indication, certainty D; China left out because it overlaps trade data",
    )
    # round 6: North Korea, Iran and Belarus revalued with more sources (military_rus_r6.json); China below. Round 24b:
    # North Korea's full value from north_korea_r24.json (military_rus_scaled)
    mr6 = military_rus_scaled()
    mid6 = src.add(
        "military_rus_r6",
        "Military support to Russia: Ukrainian and South Korean intelligence, Open Source Centre, the Multilateral Sanctions Monitoring Team, INSS, leaked Alabuga contracts, Russian procurement prices",
        "https://msmt.info/api/file/download/18858",
        mr6.get("generated"),
        "market value of what Russia received; North Korea and Iran certainty C; see research/2026-10/gaps/military_rus_r6-notes.md",
    )
    for iso3, d in {**fb2all["military_to_russia"], **mr6["countries"]}.items():
        c = countries.get(iso3)
        if iso3 == "CHN" or not c or not d.get("by_year"):
            continue
        ser = lch(d["by_year"])
        c["military_rus"] = {
            **ser,
            "cert": (d.get("certainty") or "D")[0],
            "src": [mid6 if iso3 in mr6["countries"] else oid2],
        }
    # China: only what is not already in recorded trade (unrecorded military items, satellite imagery and training,
    # smuggled dual-use goods); the dual-use goods in recorded exports are already counted as sales to Russia
    cm = load(GAPS / "china_military.json")
    if "CHN" in countries:
        cid = src.add(
            "china_military",
            "China's military support to Russia not in recorded trade: CSIS, RUSI, KSE, Reuters, US and EU findings",
            None,
            cm.get("generated"),
            "rough indication (D); recorded dual-use exports are already counted as sales to Russia; see research/2026-10/gaps/china_military-notes.md",
        )
        countries["CHN"]["military_rus"] = {**lch(cm["items"]["uncounted_total"]), "cert": "D", "src": [cid]}
        du = lch(cm["items"]["dual_use_recorded"])
        countries["CHN"]["dual_use_note"] = round(sum(du["years"]), 2)
    pid = src.add(
        "people",
        "Volunteers and recruited fighters: compiled estimates",
        None,
        "2026-10",
        "rough indication, certainty D",
    )
    for key, out in (("volunteers_for_ukraine", "vol"), ("fighters_for_russia", "fighters")):
        merged = {
            **(other.get(key) or {}),
            **{k: v for k, v in fb2all.get(key, {}).items() if not v.get("belligerent_source")},
        }
        for iso3, d in merged.items():
            c = countries.get(iso3)
            central = d.get("central") or d.get("low")
            if c and central:
                c.setdefault("people", {})[out] = {
                    "central": central,
                    "low": d.get("low"),
                    "high": d.get("high"),
                    "src": [pid],
                }

    apply_shipping(countries, src, note)
    apply_reexports(countries, src, note)
    apply_residual(countries, src, note)
    apply_audit(countries, src)
    fix_artefacts(countries)
    baltic_transit(countries)
    # incentives.json (AI-guessed direction and threat scores) is no longer copied into data.json: its view was removed
    # in round 8 and the site does not read the scores (round 11 audit; the layer was removed, see the changelog, round 24)
    # label only, the totals do not change: which part of each cut was required by sanctions, and which part of the fall
    # in purchases was gas that Russia cut off or that stopped with Ukrainian transit (sanctions_share.json)
    sanc = load(GAPS / "sanctions_share.json")
    apply_stop_dates(sanc)
    # cited by the sanctions note in each panel (index.html sanctionNote(); round 11 audit)
    src.add(
        "sanctions_share",
        "Share of the cut in trade with Russia required by sanctions: EU Regulation 833/2014 (consolidated versions), US, UK, Japanese, Canadian and other bans, Eurostat Comext and UN Comtrade",
        "https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX:32014R0833",
        sanc.get("generated"),
        "a label only, the totals do not change; see research/2026-10/gaps/sanctions_share-notes.md",
    )
    # round 14 (H5): the cut label cites the evidence of each cut, not the EU sanctions regulation
    src.add(
        "gas_cuts",
        "Russian gas cut off by Russia or by the end of Ukrainian transit, and Druzhba oil to Poland halted by Russia (25 February 2023): company, gas operator and press statements of each cut (Gazprom to Poland, Bulgaria, Finland, the Netherlands, Denmark, Germany, Latvia, France's Engie, Moldova, Austria's OMV; transit end 1 January 2025; Orlen on Druzhba)",
        "https://www.gasunietransportservices.nl/en/news/gazprom-ceases-supplying-gasterra-with-effect-from-31-may",
        "2026-10-19",
        "a label only, the totals do not change; dates in build_data.py RUSSIA_GAS_CUT; Poland's gas part from final-use volumes (energy2.json)",
    )
    for iso3, d in sanc["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        lab = {}
        for flow in ("to_rus", "from_rus", "svc_bought", "svc_sold"):
            ys = [v for y, v in (d.get(flow) or {}).items() if y.isdigit() and v.get("mandated_share_map")]
            mand = sum(v["mandated_eurbn"]["central"] for v in ys)
            # round 16: the map's fall in each year (kept as fall_map where stop dates moved the required part)
            fall = sum(fall_of(v) for v in ys)
            if fall > 0:
                gas = sum(
                    (gas_part_r14(iso3, int(y), v) if flow == "to_rus" else v.get("gas_part") or 0) * fall_of(v)
                    for y, v in (d.get(flow) or {}).items()
                    if y.isdigit() and v.get("mandated_share_map") and fall_of(v)
                )
                # round 13 (audit): the gas part of years when Russia itself cut the supply or Ukraine's transit
                # ended (RUSSIA_GAS_CUT), shown as "cut off by Russia or by the end of transit"; a label only. Round 14:
                # from the cut date (the first year in part), and Poland's gas part from volumes
                cut = sum(
                    gas_part_r14(iso3, int(y), v) * cut_fraction(iso3, int(y)) * cut_part_of_gas_fall(iso3, int(y)) * fall_of(v)
                    + (v.get("stopped_by_russia_eurbn") or 0.0)
                    for y, v in (d.get(flow) or {}).items()
                    if y.isdigit() and v.get("mandated_share_map") and fall_of(v) and flow == "to_rus"
                )  # fmt: skip
                lab[flow] = {"mandated": round(min(1.0, mand / fall), 3), "gas": round(min(1.0, gas / fall), 3),
                             "cut": round(min(1.0, cut / fall), 3)}  # fmt: skip
                if flow == "to_rus" and iso3 in RUSSIA_GAS_CUT and cut > 0:
                    lab[flow]["cut_from"] = RUSSIA_GAS_CUT[iso3]
                # round 16b: oil Russia stopped itself (Poland's Druzhba crude from 25 February 2023)
                if flow == "to_rus" and any((v.get("stopped_by_russia_eurbn") or 0) > 0 for v in ys):
                    lab[flow]["oil_cut_from"] = load(GAPS / "stop_dates_r16.json")["pipeline_stopped"][iso3]
        if lab:
            c["sanctions"] = lab
    remove_freight(countries)
    src.add(
        "prices",
        "Price levels of what was traded with Russia and Ukraine (2019-2021 = 1): each buyer's own customs unit values per fuel and for other goods, benchmark indices (CREA, World Bank, Eurostat), gas contract prices; oil at the Russian port (FOB), outliers screened",
        "https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/prices-notes.md",
        "2026-10-19",
        "prices.json, energy2.json price_index, gas_prices.json; freight from shipping-notes.md; see How it works",
    )
    price_indices(countries)
    apply_narrow(countries, src)
    apply_brunei_r6(countries)
    apply_relocants(countries)
    apply_audit2(countries, src, "values")
    uae_fuel_net(countries)
    war_windfall(countries, src)
    pre_war_trends(countries, src)
    counterfactual(countries, src)
    power_of_siberia(countries, src)
    apply_weapons_value(countries, src)
    apply_state_finance(countries, src)
    apply_company_flows(countries, src)
    apply_refugees_net(countries, src)
    apply_refugees_gain(countries, src)
    aggressor_refugees(countries, src)
    party_to_war(countries, src)
    refugee_common_cost(countries)
    refugee_flowback(countries)
    apply_ua_arms_purchases(countries, src)
    apply_loans_value(countries, src)
    apply_money_ledger(countries, src)
    apply_military_delivered(countries, src)
    apply_captive(countries, src)
    apply_russian_arms(countries, src)
    apply_payment_agents(countries, src)
    apply_frozen_reserves(countries, src)
    apply_frozen_private(countries, src)
    apply_svc_ukr(countries, src)
    apply_remittances(countries, src)
    apply_chpl(countries, src)
    apply_value_kept(countries, src)
    apply_military_payment(countries, src)
    apply_audit2(countries, src, "trends")
    apply_nowar_prices(countries, src)
    laundered_volumes(countries)
    current_euros(countries)
    deflate_gold(countries)
    apply_net_gain(countries, src)
    # round 14 (audit H2): Nigeria's credit for less fuel from EU refiners is structural: the EU banned Russian-made fuel
    # (February 2023) and Nigeria's own Dangote refinery started production in January 2024; a label, the totals do not
    # change
    if countries.get("NGA", {}).get("laund"):
        src.add(
            "dangote",
            "VOA: Nigeria's Dangote refinery starts diesel, aviation fuel production (January 2024)",
            "https://www.voaafrica.com/a/nigeria-s-dangote-refinery-starts-diesel-aviation-fuel-production/7438591.html",
            "2024-01-12",
            "label only: Nigeria's fall in fuel bought from EU refiners is structural (EU fuel ban, domestic refining)",
        )
        countries["NGA"]["laund"]["structural"] = {"why": "domestic_refining", "src": ["dangote"]}
    # round 15 (raised by the owner): cited by the 2026 note in each panel (index.html hormuzNote())
    src.add(
        "hormuz",
        "CREA: What the Hormuz crisis has cost fossil-fuel importers, March to August 2026 (Brent 35% above pre-crisis futures; diesel 59%, Asian LNG 75%)",
        "https://energyandcleanair.org/what-the-hormuz-crisis-has-cost-fossil-fuel-importers-march-to-august-2026/",
        "2026-10-19",
        "the 2026 price spike came from the Hormuz crisis, not from this war; the money stays in, and the method band values 2026 at 2025 prices (How it works)",
    )
    if "laund_off" in ALT:
        for c in countries.values():
            c.pop("laund", None)
            tr = c.get("to_rus") or {}
            for k in ("laundered", "laundered_lo", "laundered_hi", "laund_gain"):
                tr.pop(k, None)
    attach_r11_sources(countries, src)
    attach_input_sources(countries)
    mark_no_data(countries)
    for c in countries.values():
        for x in c.get("extra") or []:
            x.pop("_cc", None)
        for obj in c.values():
            if isinstance(obj, dict):
                obj.pop("_refine_delta", None)
                obj.pop("_gold", None)
                obj.pop("_refined_out", None)
                obj.pop("_prod", None)
                obj.pop("_pidx_pre", None)
                obj.pop("_pre", None)
                obj.pop("_pre_single", None)
                obj.pop("_gold_a", None)
                obj.pop("_capped", None)
                # the baseline always lies inside its own range
                if obj.get("base_range") and obj.get("base") is not None:
                    br = obj["base_range"]
                    obj["base_range"] = [round(min(br[0], obj["base"]), 5), round(max(br[1], obj["base"]), 5)]
    for iso3, c in countries.items():
        c["coverage"] = coverage(c, notes.get(iso3, {}))
    # the exact primary links behind each source (round 11): the table, dataset query or report page each figure comes
    # from, checked to exist; press reports and this project's own models marked as such
    r11 = (load(RESEARCH / "sources_r11.json") or {}).get("sources") or {}
    for sid, item in src.items.items():
        links = [
            {"title": lk["title"], "url": lk["url"], "kind": lk.get("kind", "primary")}
            for lk in (r11.get(sid) or {}).get("links") or []
            if lk.get("url") and lk.get("confirmed", True)
        ]
        if links:
            item["links"] = links
    prune_sources(countries, src)
    source_documents(src)
    classify_sources(src)
    gdp_average(countries)
    status = (
        f"<b>Research preview</b> · figures to {DATA_TO_TEXT}, updated {UPDATED_TEXT}. "
        "Compiled with AI assistance from public sources and not yet checked line by line against them by a person: treat the figures as unverified estimates. "
        "Every number has a likely range and sources; gaps are filled with estimates, never left at zero. "
        'Every choice and its evidence: <a href="#view=how&sec=changelog">changelog</a>. '
        'Method and data: <a href="https://github.com/intelligent-cream/war-balance">GitHub</a>. Corrections: <a href="https://www.reddit.com/user/Intelligent-Cream-14/">Reddit</a> or a GitHub issue. '
        # round 38: the project was called "Follow the Money: Ukraine" in its first week; it has no link to ftm.nl
        "Not connected to Follow the Money (ftm.nl), whose name the project used in its first week."
    )
    return {
        "generated": UPDATED,
        "data_to": DATA_TO,
        "years": YEARS,
        "frac": FRAC,
        "meta": {"tariff_rate": tariff_rate(countries), "lost_margin": 0.2, **META_R16},
        "status_html": status,
        "sources": src.items,
        "countries": {k: v for k, v in sorted(countries.items())},
        # map shapes of these territories show the figures of the country that reports for them
        "included_in": {
            iso_numeric(t): countries[p]["n"] for t, p in INCLUDED_IN.items() if iso_numeric(t) and p in countries
        },
    }


def gdp_average(countries: dict[str, dict]) -> None:
    """Round 15 (review 4, M1; approved by the owner): every % of GDP on the map divides by the average of 2022-2024
    nominal GDP in euros (gdp_avg_r15.json: World Bank WDI, or IMF WEO where the 2024 figure came from it), not by 2024
    alone, which was a trough year for economies whose currency collapsed (Nigeria). Set last, so the steps above that
    cap a flow at a share of GDP keep the GDP they were calibrated on. gdp_2024 stays for the method band."""
    avg = load(GAPS / "gdp_avg_r15.json")["countries"]
    for iso3, c in countries.items():
        d = avg.get(iso3)
        if d and c.get("gdp"):
            c["gdp_2024"] = c["gdp"]
            c["gdp"] = d["gdp_eur_bn_avg_2022_2024"]


HUB_BUNKER = {hub: d["bunker_share"]["low"] for hub, d in E2["hub_resale"].items() if hub in HUB_RESALE}


def tariff_rate(countries: dict[str, dict]) -> float:
    """Round 11: one duty rate for the cost view, the average of the EU, UK and Canadian rates per year
    (TARIFF_RATE_YEARS), weighted by each one's purchases from Ukraine in 2022-2026."""
    num = den = 0.0
    for iso3, c in countries.items():
        ys = (c.get("buy_ukr") or {}).get("years")
        if iso3 not in TARIFF_WAIVER or not ys:
            continue
        rates = TARIFF_RATE_YEARS["EU27" if iso3 in EU27 else iso3]
        num += sum(r * v for r, v in zip(rates[1:], ys[1:]))
        den += sum(ys[1:])
    return round(num / den, 5) if den else 0.0


def r11_proposal_flows(k: str, q: dict) -> list[str]:
    """Round 24 (audit C, approved by the owner): the money flows (FLOWS ids in index.html) a round-11 proposal changed,
    so a flow in How it works shows only the documents behind its own proposals, not the whole bundle."""
    if k == "gain":
        if "net_gain_ukraine" in q.get("file", ""):
            return ["buy"]
        return {"services": ["services"], "arms": ["rusarms"]}.get(q.get("group"), ["paid", "windfall"])
    if k == "rules":
        c = q.get("constant", "")
        for key, fl in (
            ("sales_to_russia", ["sold"]),
            ("flowback_weapons", ["flowback"]),
            ("services_to_russia", ["services"]),
            ("shipping", ["shipping"]),
            ("OWN_SHARE_DEFAULT", ["flowback"]),
            ("LOAN_GRANT_ELEMENT", ["loans"]),
            ("tariff_rate", ["buy"]),
            ("EU_ARMS_SLICE", ["euaid", "flowback"]),
        ):
            if key in c:
                return fl
        return []
    item = q.get("item", "")
    for key, fl in (
        ("hub_", ["laund"]),
        ("LAUNDERED_CAP", ["laund"]),
        ("payment_agents", ["agents"]),
        ("company_profit_tax", ["companytax"]),
        ("shadow_fleet", ["shipping"]),
        ("private_donations", ["priv"]),
        ("refugee_", ["ref"]),
        ("CIF_SHARE", ["paid"]),
        ("remittance_", ["remit"]),
        ("hk_onward", ["gold"]),
    ):
        if item.startswith(key):
            return fl
    return []


def attach_r11_sources(countries: dict[str, dict], src: Sources) -> None:
    """Round 11: one source per proposals file, with the primary links its applied proposals cite, added to the series
    each file changed."""
    names = {
        "gain": "Round 11: net-gain shares from official sector profitability (Russia: FNS/Rosstat by OKVED-2 activity; Ukraine: Derzhstat by KVED division), export duties collected and company results",
        "rules": "Round 11: money-rule and cost-view constants from data: firm-level redirection studies, Kiel item coding of EU-level military aid, lenders' funding costs, EU, UK and Canadian estimates of duties waived",
        "hubs": "Round 11: fuel hubs and flag registries (Eurostat oil balances, UN Comtrade own and partner records, port bunker sales), laundered-oil caps from fuel use, Belgian company tax 2022",
        "people": "Round 11: refugee hosting budgets, remittance mirror shares, national donation totals, Hong Kong gold 2026 and OECD ITIC freight margins",
    }
    primary = {"gain": (0, 0), "rules": (5, 0), "hubs": (26, 0), "people": (28, 0)}
    ids = {}
    for k, name in names.items():
        props = R11[k]["proposals"]
        p, s = primary[k]
        sid = src.add(
            f"assumptions_r11_{k}",
            name,
            props[p]["sources"][s]["url"],
            R11[k].get("generated"),
            f"proposals applied as listed in the changelog; see research/2026-10/gaps/assumptions_r11_{k}-notes.md",
        )
        links, seen = [], {}
        for q in props:
            fl = r11_proposal_flows(k, q)
            for x in q.get("sources") or []:
                u = x.get("url") or ""
                if not u.startswith("http"):
                    continue
                if u in seen:
                    # round 24: a link cited by several proposals belongs to each of their flows
                    seen[u]["flows"] = sorted(set(seen[u]["flows"]) | set(fl))
                    continue
                seen[u] = {"title": x.get("title") or u, "url": u, "kind": "primary", "flows": fl}
                links.append(seen[u])
        src.items[sid]["links"] = links
        ids[k] = sid

    def put(obj: dict | None, key: str, sid: str) -> None:
        if obj is not None:
            lst = obj.setdefault(key, [])
            if sid not in lst:
                lst.append(sid)

    for iso3, c in countries.items():
        # net-gain shares: payments to Russia, services bought, purchases from Ukraine, Russian arms
        for key in ("to_rus", "svc_bought", "buy_ukr"):
            if (c.get(key) or {}).get("gain"):
                put(c[key], "src", ids["gain"])
        for x in c.get("extra") or []:
            if x["k"] == "rusarms":
                put(x, "src", ids["gain"])
        # the remittance marker (round 13b): Russia's share of remittances (round 11, people) is one of its inputs
        if "rem:" + iso3 in R11_TOUCHED["people"]:
            put(c.get("remit"), "src", ids["people"])
        # rules: lost sales to Russia (value kept x extra), EU-level arms money, loans and duties in the cost view
        if "vk:" + iso3 in R11_TOUCHED["rules"]:
            put(c.get("from_rus"), "src", ids["rules"])
        if "eu:" + iso3 in R11_TOUCHED["rules"] and (c.get("flowback") or {}).get("purl_src") is not None:
            put(c["flowback"], "purl_src", ids["rules"])
        if (c.get("aid") or {}).get("loans_face"):
            put(c["aid"], "src", ids["rules"])
        if c.get("tariff_waiver"):
            put(c.get("buy_ukr"), "src", ids["rules"])
        # hubs: laundered oil, Belgium's company tax
        if "laund:" + iso3 in R11_TOUCHED["hubs"]:
            if (c.get("to_rus") or {}).get("laundered_src") is not None:
                put(c["to_rus"], "laundered_src", ids["hubs"])
            put(c.get("laund"), "src", ids["hubs"])
        if "tax:" + iso3 in R11_TOUCHED["hubs"]:
            put(c.get("company"), "src", ids["hubs"])
        # people: freight margins on every payment to Russia (and Hong Kong's gold passed on), refugee costs, donations
        put(c.get("to_rus"), "src", ids["people"])
        if "ref:" + iso3 in R11_TOUCHED["people"] and (c.get("aid") or {}).get("refugee_src") is not None:
            put(c["aid"], "refugee_src", ids["people"])
        if "priv:" + iso3 in R11_TOUCHED["people"]:
            put(c.get("private"), "src", ids["people"])


def attach_input_sources(countries: dict[str, dict]) -> None:
    """Round 11 audit: inputs that produce a number but were registered without being cited by the part they feed.
    Russian gas prices per country (gas_prices.json) set the price index of payments to Russia and the windfall; the
    tanker control split (shadow_fleet_r6.json) sets the freight in the shipping part."""
    gp = GAS_PRICES["countries"]
    sf = load(GAPS / "shadow_fleet_r6.json")["countries"]
    for iso3, c in countries.items():
        if iso3 in gp:
            for key in ("to_rus", "windfall"):
                obj = c.get(key)
                if obj is not None and "gas_prices" not in obj.setdefault("src", []):
                    obj["src"].append("gas_prices")
        sh = c.get("shipping")
        if iso3 in sf and sh is not None and "shadow_fleet" not in sh.setdefault("src", []):
            sh["src"].append("shadow_fleet")


# source ids the site cites by name, not through a part's src list (index.html)
SITE_SOURCE_IDS = {"kiel_eu_share", "sanctions_share", "russian_arms", "gas_cuts", "hormuz"}


def prune_sources(countries: dict[str, dict], src: Sources) -> None:
    """Round 11 audit: data.json lists only the sources a number on the map cites. Sources of superseded steps (the
    earlier flowback estimates, the first military-support estimates, unused ids) stay in the code and in
    research/2026-10/sources_r11.json, marked superseded there, but are not published as if they produced a number."""
    used = set(SITE_SOURCE_IDS)

    def walk(o: object) -> None:
        if isinstance(o, dict):
            for k, v in o.items():
                if k.endswith("src") and isinstance(v, list):
                    used.update(x for x in v if isinstance(x, str))
                else:
                    walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(countries)
    for sid in [k for k in src.items if k not in used]:
        del src.items[sid]


# Round 24 (audit C, approved by the owner on 22 October 2026): what kind of source each one is, the group it is listed
# under in How it works: official statistics and datasets ("data"), reports and studies, including laws and official
# reports ("report"), press reports ("press"), this project's own models ("ours"), and research notes that bundle the
# documents behind several small corrections ("notes")
SOURCE_TYPE = {
    "trade": "data", "nonreport": "report", "kiel": "data", "kiel_eu_share": "report", "aid_gaps": "data",
    "refugees": "data", "energy": "ours", "transit_gas": "data", "laundered": "ours", "laundered_eu": "data",
    "laundered_r6": "report", "refining": "report", "eu_refiners": "ours", "companies": "report",
    "company_taxes_r6": "report", "services": "data", "hidden": "report", "undisclosed": "report", "private": "report",
    "military_rus_r6": "report", "china_military": "report", "people": "report", "shipping": "report",
    "shadow_fleet": "report", "reexports": "data", "residual": "data", "hk_gold_r16": "data", "audit": "notes",
    "sanctions_share": "report", "gas_cuts": "press", "prices": "ours", "narrow": "data", "audit2": "notes",
    "windfall": "ours", "trend": "ours", "gas_prices": "data", "trend2": "ours", "counterfactual": "ours",
    "ua_trade_cf": "ours", "cf_bands": "ours", "power_of_siberia": "press", "weapons_value": "report",
    "state_finance": "data", "company_flows": "report", "russian_owned_r10": "report", "seizures": "report",
    "refugees_net": "data", "co_belligerent": "report", "loans_value": "report", "money_ledger": "data",
    "russian_arms": "report", "payment_agents": "report", "frozen_reserves": "report", "frozen_private": "report", "svc_ukr": "data", "remittances": "data",
    "chpl": "data", "value_kept": "report", "net_gain_sellers": "data", "military_payment": "press",
    "net_gain_russia": "data", "net_gain_ukraine": "data", "dangote": "press", "hormuz": "report",
    "assumptions_r11_gain": "notes", "assumptions_r11_rules": "notes", "assumptions_r11_hubs": "notes",
    "assumptions_r11_people": "notes",
    "refugees_gain": "data", "north_korea_r24": "press", "military_delivered": "ours", "windfall_band": "ours",
    "pipeline_exemption": "report", "belarus_party": "report", "north_korea_party": "report",
}  # fmt: skip
# news sites and encyclopedias: a link there is a press report, whatever the research file called it
PRESS_HOSTS = (
    "themoscowtimes", "vedomosti", "kommersant", "wikipedia", "reuters", "bloomberg", "bnnbloomberg", "interfax",
    "tass.", "ft.com", "wsj.com", "nytimes", "theguardian", "kyivindependent", "rferl", "voaafrica", "voanews",
    "thebell", "theins", "nknews", "yonhap", "euractiv", "politico", "dw.com", "bbc.", "rbc.ru", "meduza",
    "novayagazeta", "notesfrompoland", "hellenicshippingnews", "shipandbunker", "oilprice", "ukrinform", "unian",
    "pravda", "ria.ru", "frontnews", "lvportals", "reddeeradvocate", "belganewsagency", "europeannewsroom",
    "tehrantimes", "eghtesadonline", "intellinews", "dailysabah", "hurriyet", "trend.az", "azernews", "akipress",
    "kun.uz", "gazeta.uz", "eurasianet", "jiji.com", "kyodo", "japantimes", "nikkei", "scmp", "caixin",
    "globaltimes", "xinhua", "sofiaglobe", "globalnews", "usm.media", "hartvannederland", "kathimerini",
    "lemonde", "lefigaro", "spiegel", "handelsblatt", "faz.net", "zeit.de", "corriere", "ansa.it", "elpais",
    "kyivpost", "euronews", "apnews", "nbcnews", "cnbc", "forbes", "insider", "occrp", "pozirk", "alta.ru", "zerno.ru",
    "infomarket.md", "newsmaker.md", "rtp.pt", "aa.com.tr", "argusmedia", "lloydslist", "tradewinds", "splash247",
)  # fmt: skip
LINK_FIXES = json.loads((RESEARCH / "link_fixes.json").read_text())["fixes"]


def is_homepage(url: str) -> bool:
    from urllib.parse import urlparse

    u = urlparse(url)
    return u.path in ("", "/") and not u.query


def classify_sources(src: Sources) -> None:
    """Round 24 (audit C, approved by the owner on 22 October 2026). Each source gets its type; its documents get a press
    label where they are news reports, a working address where the old one no longer opens (link_fixes.json, archived
    copies labelled), and 1-3 of them are marked key documents, shown under the source's name without opening anything.
    The source's own link is never a bare homepage: it is its first key document instead. Names lose the internal
    "Round 11:" prefix; the date says what it is ("data to" for data, "published" for older reports, otherwise "checked")."""
    for sid, s in src.items.items():
        typ = SOURCE_TYPE.get(sid, "report")
        s["type"] = typ
        s["name"] = re.sub(r"^Round 11(?: audit)?: ", "", s["name"])
        links = [dict(lk) for lk in s.get("links") or []]
        if s.get("url") and not is_homepage(s["url"]) and all(lk["url"] != s["url"] for lk in links):
            # the source's own link is one of its documents too (a source with no other document keeps it as its key one)
            links.append({"title": s["name"], "url": s["url"], "kind": "primary"})
        for lk in links:
            fx = LINK_FIXES.get(lk["url"])
            if fx:
                lk["url"] = fx["url"]
                if fx.get("archived"):
                    lk["archived"] = True
            host = lk["url"].split("/")[2] if lk["url"].startswith("http") else ""
            if lk.get("kind") == "primary" and (
                any(p in host for p in PRESS_HOSTS) or lk["title"].lower().startswith("search snippet")
            ):
                lk["kind"] = "secondary"
        cand = [lk for lk in links if lk["url"].startswith("http") and not is_homepage(lk["url"])]
        key = [lk for lk in cand if lk.get("kind", "primary") == "primary"][:3] or cand[:3]
        for lk in key:
            lk["key"] = True
        if links:
            s["links"] = links
        url = LINK_FIXES.get(s.get("url") or "", {}).get("url") or s.get("url")
        if not url or is_homepage(url):
            url = key[0]["url"] if key else None
        if url:
            s["url"] = url
        else:
            s.pop("url", None)
        d = s.get("date") or ""
        s["date_kind"] = "data" if typ == "data" else "published" if d and d < "2026-09" else "checked"


def non_gas_share(by_fuel_mt: dict, prices: dict) -> list[float]:
    """Share of the fossil tracker's value per year that is not pipeline gas or LNG, from tonnes per fuel and prices."""
    out = []
    for y in YEARS:
        mt = by_fuel_mt.get(str(y)) or {}
        val = {
            f: t
            * EUR_PER_MT_2021.get(f, 0.4)
            * prices[FUEL_INDEX.get(f, "products")][str(y)]["central"]
            / prices[FUEL_INDEX.get(f, "products")]["2021"]["central"]
            for f, t in mt.items()
        }
        tot = sum(val.values())
        out.append(1 - (val.get("gas", 0) + val.get("lng", 0)) / tot if tot else 1.0)
    return out


def idx(name: str, band: str) -> list[float]:
    return [E2["price_index"][name][str(y)][band] for y in YEARS]


def import_mix(iso3: str) -> dict:
    """What a country bought from Russia in 2019-2021 by fuel; outside the 60 largest buyers, the weighted average."""
    mixes = E2["fuel_mix_2019_2021"]
    if iso3 in mixes:
        return mixes[iso3]
    weights = {k: m.get("imports_from_rus_2019_2021_eur_bn") or 0 for k, m in mixes.items()}
    wsum = sum(weights.values()) or 1
    keys = ("fossil_share", "crude", "products", "gas", "coal", "other_fossil")
    return {k: sum((mixes[i].get(k) or 0) * w for i, w in weights.items()) / wsum for k in keys}


GAS_PRICES = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/gas_prices.json").read_text())


# energy content of natural gas: MWh per bcm (gross calorific value, 10.55 kWh per m3, as in energy2.json and
# gas_prices.json "energy_basis")
MWH_PER_BCM = 10.55e6
# share of final-use Russian gas that customs already record as imports from Russia under another heading (audit):
# Turkey and Poland book it under confidential or general fuel codes (audit-notes items 1 and 8)
GAS_IN_CUSTOMS = {"TUR": 1.0, "POL": 1.0}
# Germany books part of it: EUR 2.3bn (2021) and 3.5bn (2022) of Russian HS 27 without a sub-heading (audit-notes item 2,
# audit.json flags). Round 12: the share is derived per year from these amounts, as amount / German final-use Russian
# gas that year (2021: 2.3 / 16.6 = 0.14; 2022: 3.5 / 23.7 = 0.15; the 2019-2021 baseline uses 2021's share). Was a flat
# 0.07 (judgement). From 2023 Germany had no Russian pipeline gas, so the share does not matter
GAS_UNLABELLED = {"DEU": {2021: 2.3, 2022: 3.5}}


def gas_in_customs(iso3: str, gas_years: list[float]) -> list[float] | None:
    """Per year, the share of final-use gas already in customs (None if none is)."""
    if iso3 in GAS_IN_CUSTOMS:
        return [GAS_IN_CUSTOMS[iso3]] * len(YEARS)
    unl = GAS_UNLABELLED.get(iso3)
    if not unl:
        return None
    share = {y: v / gas_years[YEARS.index(y)] for y, v in unl.items() if gas_years[YEARS.index(y)]}
    # years without an audit figure take the nearest measured year's share
    return [share.get(y, share[max(share)] if y > max(share) else share[min(share)]) for y in YEARS]


def gas_index(iso3: str, band: str) -> list[float]:
    """Price level of Russian gas for one country (2019-2021 = 1): its own contract or customs price where researched
    (Hungary pays hub prices, Serbia and Turkey oil-linked, Belarus a fixed dollar price), else the Europe-wide index."""
    kind = "pipeline" if iso3 in PIPELINE_GAS else "lng"
    own = (GAS_PRICES["countries"].get(iso3) or {}).get("index_vs_2019_2021") or {}
    series = own.get(kind) or own.get("lng" if kind == "pipeline" else "pipeline") or {}
    fallback = idx("pipeline_gas" if kind == "pipeline" else "lng", band)
    out = []
    for y, fb in zip(YEARS, fallback):
        v = (series.get(str(y)) or {}).get(band)
        out.append(v if v else fb)
    return out


PRICES = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/prices.json").read_text())[
    "countries"
]
# Turkey hides the partner for crude and gas: its prices come from Russian export prices, EPDK volumes and contract
# terms instead (turkey_prices.json, round 5), and so does its Russian pipeline gas price
_TUR = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/turkey_prices.json").read_text())
PRICES["TUR"] = _TUR["countries"]["TUR"]
GAS_PRICES["countries"].setdefault("TUR", {}).setdefault("index_vs_2019_2021", {})["pipeline"] = _TUR[
    "gas_prices_tur_replacement"
]["index_vs_2019_2021"]
# Belarus: fixed dollar contract price, so only the exchange rate moves it (round 7). Where the price is published
# (2019-2022) the band is +-2%. Round 12: from 2023 the price is settled in roubles and its continuation is assumed, so
# the research's own ranges apply (gas_prices-notes.md: +-8% for 2023-2025, +-15% for 2026); was +-2% for every year
BLR_GAS_BAND = {"2023": 0.08, "2024": 0.08, "2025": 0.08, "2026": 0.15}
for _y, _v in GAS_PRICES["countries"]["BLR"]["index_vs_2019_2021"]["pipeline"].items():
    _w = BLR_GAS_BAND.get(_y, 0.02)
    _v["low"], _v["high"] = round(_v["central"] * (1 - _w), 4), round(_v["central"] * (1 + _w), 4)
PRICES_SKIP: set[str] = set()


def pre_war_fuel_split(iso3: str) -> dict:
    """Round 14 (C1): the split of pre-war fuel imports from Russia over fuels. The 60 largest buyers keep their own
    2019-2021 mix (energy2.json, with final-use gas); for the others, the measured 2018-2021 payments per fuel in their
    own customs (prices.json windfall_parts) where available, else the 60-country average (import_mix)."""
    mixes = E2["fuel_mix_2019_2021"]
    if iso3 in mixes:
        return mixes[iso3]
    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    key = {"crude": "crude", "products": "products", "other_fossil": "other_fossil", "coal": "coal",
           "pipeline_gas": "gas", "lng": "lng"}  # fmt: skip
    out = dict.fromkeys(("crude", "products", "gas", "lng", "coal", "other_fossil"), 0.0)
    for f, by in parts.items():
        if f in key:
            out[key[f]] += sum(max(0.0, (by.get(str(y)) or {}).get("paid") or 0.0) for y in (2018, 2019, 2020, 2021))
    tot = sum(out.values())
    if tot <= 0:
        return import_mix(iso3)
    return {**{k: v / tot for k, v in out.items()}, "fossil_share": fossil_share(iso3), "measured_split": True}


def fossil_share(iso3: str) -> float:
    """Fuel's share of a country's pre-war imports from Russia: measured 2018-2021 mix where available."""
    mx = (PRICES.get(iso3) or {}).get("mix_2018_2021") if iso3 not in PRICES_SKIP else None
    if mx and mx.get("non_fuel_goods") is not None:
        return 1 - mx["non_fuel_goods"]
    return import_mix(iso3).get("fossil_share") or 0


# Yemen's 2023 non-fuel index from customs unit values is 0.68 of its 2019-2021 level, while its imports from Russia
# are almost all wheat (99.6%), whose world price was 1.30 times that level: the only non-fuel index below 0.8 in
# prices.json, on EUR 0.09bn of imports. Replaced by the wheat index (round 13 audit, section 15)
PRICE_OUTLIERS = {("YEM", "non_fuel_goods", 2023): "wheat"}
_PRODUCT_IDX = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/prices.json").read_text())[
    "benchmarks"
]["non_fuel_products_index_vs_2018_2021"]


def own_index(iso3: str, name: str, band: str) -> list[float] | None:
    """A country's own realised price index for Russian goods (customs unit values, rebased to 2019-2021 = 1)."""
    if iso3 in PRICES_SKIP:
        return None
    s = ((PRICES.get(iso3) or {}).get("index") or {}).get(name)
    if not s or not all(str(y) in s for y in YEARS):
        return None
    # prices.json measures against 2018-2021; rebased to 2019-2021 = 1 like every other index on the map
    pre = [s[str(y)]["central"] for y in (2019, 2020, 2021) if str(y) in s and s[str(y)].get("central")]
    r = sum(pre) / len(pre) if len(pre) == 3 else 1.0
    out = [s[str(y)][band] / r for y in YEARS]
    # round 13 (audit): a customs unit value far from its own product's world price is a data error, not a price; the
    # product's world index (prices.json benchmarks, rebased to 2019-2021) replaces it for that year
    for (i3, nm, yr), prod in PRICE_OUTLIERS.items():
        if (i3, nm) == (iso3, name):
            b = _PRODUCT_IDX[prod]
            br = sum(b[str(y)]["central"] for y in (2019, 2020, 2021)) / 3
            out[YEARS.index(yr)] = b[str(yr)][band] / br
    if iso3 == "BLR" and name == "crude":
        return [BLR_CRUDE[str(y)][band] for y in YEARS]  # Urals netback minus the export duty (actuals_r7.json)
    # round 14 (C3): seaborne oil prices at the Russian port (FOB), the basis of the no-war benchmarks
    if name in OIL_PARTS:
        out = [v * fob_factor(iso3, OIL_PARTS[name], y) for v, y in zip(out, YEARS)]
    elif name == "fossil_all":
        out = [v * oil_fob_factor_paid(iso3, y)[0] for v, y in zip(out, YEARS)]
    # round 14 (H2, audit): fuel unit values far from the benchmark are screened like non-fuel ones (a data error, not a
    # price): replaced by the benchmark for that year, and fuel's composite index rebuilt from the screened parts
    flagged = fuel_outliers(iso3)
    if name in FUEL_BENCH:
        for i, y in enumerate(YEARS):
            if (name, y) in flagged:
                out[i] = idx(FUEL_BENCH[name], band)[i]
    elif name == "fossil_all" and any(nm != "fossil_all" for nm, _ in flagged):
        for i, y in enumerate(YEARS):
            if any(yy == y for _, yy in flagged):
                out[i] = _fuel_composite(iso3, i, y, band)
    if iso3 == "TJK" and name == "fossil_all" and band != "central":
        # its 2021 band came from a fixed own-price ratio that cancels in the 2021 index (actuals_r7.json); +-3% is a
        # judgement (site/content/changelog.md, constants)
        out[0] = s["2021"]["central"] / r * (0.97 if band == "low" else 1.03)
    return out


# round 14 (H2): fuel price screen. An own fuel index more than 1/0.6 times off its benchmark (both 2019-2021 = 1, oil at
# FOB) in a war year is a data error (Nigeria's products 2023: customs value over CREA tonnes, 0.53 of the benchmark);
# years filled from the country's own post-war ratio inherit it, so they are screened with it. The band is a judgement
# set at the non-fuel screen's 0.6-0.8 level (Yemen's wheat 0.68) widened for fuel's larger route and quality spread
FUEL_BENCH = {"crude": "urals", "products": "products", "diesel": "products", "fuel_oil": "products", "coal": "coal"}
FUEL_SCREEN = (0.6, 1 / 0.6)
_FUEL_OUTLIERS: dict[str, set] = {}


def fuel_outliers(iso3: str) -> set:
    """(fuel, year) pairs of a country's own fuel price index that fail the screen (cached)."""
    if iso3 in _FUEL_OUTLIERS:
        return _FUEL_OUTLIERS[iso3]
    _FUEL_OUTLIERS[iso3] = set()  # guards the recursion through own_index below
    pr = PRICES.get(iso3) or {}
    out = set()
    for name, bench in FUEL_BENCH.items():
        if not (pr.get("index") or {}).get(name):
            continue
        own = own_index(iso3, name, "central")
        if not own:
            continue
        b = idx(bench, "central")
        basis = (pr.get("basis") or {}).get(name) or {}
        bad = [y for i, y in enumerate(YEARS) if y >= 2022 and b[i] > 0
               and not FUEL_SCREEN[0] <= own[i] / b[i] <= FUEL_SCREEN[1]]  # fmt: skip
        if any(str(basis.get(str(y), "")).startswith("customs") for y in bad):
            bad += [
                y for y in YEARS if y >= 2022 and "own post-war ratio" in str(basis.get(str(y), "")) and y not in bad
            ]
        out |= {(name, y) for y in bad}
    _FUEL_OUTLIERS[iso3] = out
    return out


def _fuel_composite(iso3: str, i: int, y: int, band: str) -> float:
    """Fuel's price level in year y as the paid-weighted harmonic mean of its parts' (screened, FOB) indices."""
    parts = (PRICES.get(iso3) or {}).get("windfall_parts") or {}
    num = den = 0.0
    for f, by in parts.items():
        v = (by.get(str(y)) or {}).get("paid") or 0.0
        if f == "non_fuel_goods" or v <= 0:
            continue
        if f in ("pipeline_gas", "lng"):
            ix = gas_index(iso3, band)[i]
        else:
            nm = {"other_fossil": "products", "crude_gas_hidden": "crude"}.get(f, f)
            ix = (own_index(iso3, nm, band) or idx(FUEL_BENCH.get(nm, "products"), band))[i]
            v *= fob_factor(iso3, OIL_PARTS[f], y) if f in OIL_PARTS else 1.0
        num, den = num + v, den + v / ix
    return num / den if den else 1.0


# Belarus buys Russian crude at the Urals price minus the Russian export duty (phased out by 2024), round 7
BLR_CRUDE = ACTUALS_R7["crude_index_vs_2019_2021 (replaces idx('urals') for BLR only)"]


def fuel_index(iso3: str, band: str) -> list[float]:
    """Price level of the fossil fuels a country bought from Russia before the war, per year (pre-war = 1): its own
    realised prices where measured, else its pre-war fuel mix with benchmark indices."""
    own = own_index(iso3, "fossil_all", band) if iso3 != "BLR" else None
    if own:
        return own
    m = import_mix(iso3)
    fuels = ("crude", "products", "gas", "coal", "other_fossil")
    total = sum(m.get(f) or 0 for f in fuels) or 1
    crude = [BLR_CRUDE[str(y)][band] for y in YEARS] if iso3 == "BLR" else idx("urals", band)
    return [
        sum((m.get(f) or 0) * v for f, v in zip(fuels, vals)) / total
        for vals in zip(crude, idx("products", band), gas_index(iso3, band), idx("coal", band), idx("products", band))
    ]


def fuel_share_year(iso3: str) -> list[float | None]:
    """Fuel's share of what a country actually paid Russia each year, at that year's prices, from its own customs
    (prices.json: fuel payments per fuel / all payments); None where not measured. India bought mostly crude after
    2022, so its pre-war mix (43% fuel) would understate both the fuel price level and the windfall."""
    pr = PRICES.get(iso3) if iso3 not in PRICES_SKIP else None
    parts, paid = (pr or {}).get("windfall_parts") or {}, (pr or {}).get("paid") or {}
    out: list[float | None] = []
    for y in YEARS:
        tot = (paid.get(str(y)) or {}).get("central")
        fuel = sum((p.get(str(y)) or {}).get("paid") or 0 for k, p in parts.items() if k != "non_fuel_goods")
        # round 14 (C3): the fuel part at FOB, as the payments it is a share of (remove_freight)
        if tot and fuel:
            f = oil_fob_factor_paid(iso3, y)[0]
            tot, fuel = tot - fuel * (1 - f), fuel * f
        out.append(round(min(1.0, fuel / tot), 4) if tot and fuel and y >= 2022 else None)
    return out


# round 14 (audit H4): the method band. Each alternative method choice rebuilds the data with one switch on (main below);
# the countries' changed fields go to detail.json "alts", and the map's methodBand() recomputes the net with them
ALT: set[str] = set()
METHOD_ALTERNATIVES = {
    "refiner": "EU refiners keep the Russian crude in the fuel they export (until round 13)",
    "laund_route": "laundered oil: every buyer's change counted, without the round-13b route rule",
    "laund_off": "laundered oil (fuel made from Russian crude elsewhere) not counted",
    "fuelmix": "the mix of what was bought from the fuel tracker's tonnes (until round 14), not customs values",
    "freight": "fuel prices as customs (CIF) values, freight included (until round 14)",
    "normal_return": "sellers' normal return 9% nominal, services incl. real estate (round 13); Russia's and Ukraine's shares as in round 14",
    "gold_actual": "gold valued at its actual price, not at its 2021 price (central banks' buying after Russia's reserves were frozen is linked to the war)",
    "nk_paid_observed": "North Korea: Russia paid only what was observed flowing back (USD 0.5-1.5bn), so nearly all its deliveries count at full value (round 24b)",
    "gas_early2021": "no-war gas at early-2021 forward prices (TTF EUR 17.5/MWh for 2022-2025), before the late-2021 squeeze (round 24b)",
}


# round 14 (C2): customs parts by fuel (prices.json windfall_parts) and the gain group each is weighed at
CUSTOMS_FUEL = {"crude": "crude", "products": "products", "other_fossil": "other_fossil", "coal": "coal",
                "pipeline_gas": "gas", "lng": "lng", "crude_gas_hidden": "crude"}  # fmt: skip


def _part_index(iso3: str, part: str, y: int) -> float:
    """Price level (2019-2021 = 1) of one customs part in year y (2018-2026): the country's own customs unit values
    where measured (own_index, with its outlier screen), else the benchmark; 2018 takes 2019's benchmark level."""
    if y in YEARS:
        i = YEARS.index(y)
        if part in ("pipeline_gas", "lng"):
            return gas_index(iso3, "central")[i]
        if part == "non_fuel_goods":
            return (own_index(iso3, "non_fuel_goods", "central") or idx("non_fuel_goods", "central"))[i]
        name = {"crude_gas_hidden": "crude", "other_fossil": "products"}.get(part, part)
        bench = {"crude": "urals", "products": "products", "coal": "coal"}[name]
        own = own_index(iso3, name, "central") if part != "other_fossil" else None
        return (own or idx(bench, "central"))[i]
    # before 2021: the own index rebased to 2019-2021 where prices.json has it, else the benchmark
    name = {"crude_gas_hidden": "crude", "other_fossil": "products", "lng": "pipeline_gas"}.get(part, part)
    own = ((PRICES.get(iso3) or {}).get("index") or {}).get(name) if iso3 not in PRICES_SKIP else None
    if own and all(str(x) in own and own[str(x)].get("central") for x in (2019, 2020, 2021, y)):
        r = sum(own[str(x)]["central"] for x in (2019, 2020, 2021)) / 3
        return own[str(y)]["central"] / r
    bench = {"crude": "urals", "products": "products", "coal": "coal", "pipeline_gas": "pipeline_gas",
             "non_fuel_goods": "non_fuel_goods"}.get(name, "products")  # fmt: skip
    return E2["price_index"][bench][str(max(y, 2019))]["central"]


def customs_fuel_volumes(iso3: str) -> dict[int, dict[str, float]]:
    """Round 14 (C2): what a country bought from Russia per year, by customs part, in volume (customs value / that
    part's price level, 2019-2021 = 1), 2018-2026; empty where customs do not split fuel from other goods."""
    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    out: dict[int, dict[str, float]] = {}
    for y in range(2018, 2027):
        vol = {}
        for f, by in parts.items():
            v = (by.get(str(y)) or {}).get("paid") or 0.0
            if f in OIL_PARTS:  # round 14 (C3): CIF value to FOB, the basis of the oil price index
                v *= fob_factor(iso3, OIL_PARTS[f], y)
            if v > 0 and (f in CUSTOMS_FUEL or f == "non_fuel_goods"):
                ix = _part_index(iso3, f, y)
                if ix > 0:
                    vol[f] = vol.get(f, 0.0) + v / ix
        if sum(vol.values()) > 0:
            out[y] = vol
    return out


def tracker_copied_years(by_mt: dict) -> list[int]:
    """Round 14 (C2): years whose fossil-tracker tonnes repeat the year before (2025 = 2024 for 25 economies; 2026 =
    2025 x 8/12): an estimate carried forward, not a measurement."""
    out = []
    for y in YEARS[1:]:
        a, b = by_mt.get(str(y - 1)) or {}, by_mt.get(str(y)) or {}
        if not a or not any(a.values()) or set(a) != set(b):
            continue
        f = FRAC[YEARS.index(y)] / FRAC[YEARS.index(y - 1)]
        if all(abs(b[k] - a[k] * f) <= 1e-4 * max(1.0, abs(a[k])) for k in a):
            out.append(y)
    return out


def _odds_shift(base: float, now: float, ref: float) -> float:
    """base moved by the change from ref to now, in odds, so it stays inside (0, 1) (round 14, C2: no cap at 100%)."""
    c = lambda x: min(1 - 1e-4, max(1e-4, x))  # noqa: E731
    o = c(base) / (1 - c(base)) * (c(now) / (1 - c(now))) / (c(ref) / (1 - c(ref)))
    return o / (1 + o) if base > 0 else 0.0


def price_indices(countries: dict[str, dict]) -> None:
    """Price level of each flow per year against 2019-2021 (= 1), so changes compare volumes, not price swings."""
    # round 14 (audit L4): the price levels cite their own source on the map
    PRICE_SRC.append("prices")
    for iso3, c in countries.items():
        for key, names in (
            ("to_rus", None),
            ("from_rus", "non_fuel_goods"),
            ("buy_ukr", "non_fuel_goods"),
            ("sell_ukr", "non_fuel_goods"),
            ("svc_bought", "services"),
            ("svc_sold", "services"),
            ("shipping", "services"),
        ):
            obj = c.get(key)
            if not obj:
                continue
            if "prices" not in obj.setdefault("src", []):
                obj["src"].append("prices")
            for band, suffix in (("central", ""), ("low", "_lo"), ("high", "_hi")):
                if names:
                    series = idx(names, band)
                else:
                    fuel = fuel_index(iso3, band)
                    fs = fossil_share(iso3)
                    nf = own_index(iso3, "non_fuel_goods", band) or idx("non_fuel_goods", band)
                    # pre-war weights, or the year's actual fuel share of payments where measured (a share of
                    # value at that year's prices, so the index is the harmonic mean)
                    series = [
                        1 / (sy / f + (1 - sy) / g) if sy is not None and f > 0 and g > 0 else fs * f + (1 - fs) * g
                        for f, g, sy in zip(fuel, nf, fuel_share_year(iso3))
                    ]
                obj["pidx" + suffix] = [round(v, 4) for v in series]


PRICE_SRC: list[str] = []


# ---- round 7: prices a no-war market expected (energy_nowar.json) ----
NOWAR = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/energy_nowar.json").read_text())
NW_IDX = NOWAR["nowar_index"]
# 2026: the Strait of Hormuz closure was not caused by this war, so the no-war price is the actual world price
# (decision, not a measured value: energy_nowar-notes.md left it open; site/content/changelog.md, energy)
NW_WORLD_2026 = {"urals": "brent", "diesel_gasoil_products": "diesel_gasoil_products", "russian_coal": "newcastle",
                 "ttf": "ttf", "jkm": "jkm", "oil_formula_9m": "oil_formula_9m"}  # fmt: skip
# gas contract formulas (weights on hub TTF, a 9-month oil formula and spot JKM); empty = fixed price, no windfall.
# Contract types from energy_nowar-notes.md section 2 (Türkiye 70/30 from turkey_prices-notes.md); the mixed weights
# (0.5, 0.7) and the default 0.75/0.25 are judgement calls, as the notes say (site/content/changelog.md, constants)
GAS_FORMULA = {**{i: {"ttf": 1.0} for i in ("HUN", "SVK", "AUT", "DEU", "ITA", "CZE", "FRA", "NLD", "BEL", "CHE", "FIN",
                                            "POL", "SVN", "HRV", "ROU", "LVA", "LTU", "EST", "LUX", "GBR", "ESP", "PRT",
                                            "SWE")},
               "TUR": {"ttf": 0.7, "oil9": 0.3}, **{i: {"ttf": 0.5, "oil9": 0.5} for i in ("GRC", "BGR", "MKD", "MDA")},
               **{i: {"oil9": 1.0} for i in ("SRB", "BIH", "CHN")}, **{i: {} for i in ("BLR", "ARM", "KGZ", "UZB",
                                                                                      "KAZ", "AZE", "GEO")}}  # fmt: skip
LNG_FORMULA = {"JPN": {"oil9": 1.0}, "KOR": {"oil9": 1.0}, "TWN": {"oil9": 0.5, "jkm": 0.5}, "CHN": {"oil9": 0.5, "jkm": 0.5},
               **{i: {"jkm": 1.0} for i in ("IND", "SGP", "THA", "BGD", "PAK", "IDN", "VNM", "KWT", "BRA")}}  # fmt: skip


# round 24b (method band, windfall_band_r24.json): no-war TTF at early-2021 forward prices (Cal-22 EUR 16.7-18.1/MWh,
# January-March 2021), flat EUR 17.5/MWh for 2022-2025, over the 2019-2021 average (EUR 23.133/MWh)
TTF_PRESQUEEZE = 17.5 / 23.133


def nw(name: str, y: int, band: str) -> float:
    """No-war price level of one benchmark (2019-2021 = 1); the actual world price in 2026."""
    if y >= 2026:
        return NW_IDX[NW_WORLD_2026[name]][str(y)]["actual"]
    if name == "ttf" and "gas_early2021" in ALT:
        return TTF_PRESQUEEZE
    return NW_IDX[name][str(y)][band]


def formula_ratio(f: dict, y: int, band: str) -> float:
    """No-war over actual value of a gas price formula (1 for a fixed price)."""
    if not f:
        return 1.0
    key = {"ttf": "ttf", "oil9": "oil_formula_9m", "jkm": "jkm"}
    num = sum(w * nw(key[k], y, band) for k, w in f.items())
    return num / sum(w * NW_IDX[key[k]][str(y)]["actual"] for k, w in f.items())


def nowar_ratio(iso3: str, i: int, band_nw: str, band_p: str) -> float:
    """No-war price level over actual price level of the fuel a country bought from Russia in year i. The no-war level
    is the forecast price of each fuel (gas by its contract formula; fixed-price gas keeps its actual price), weighted
    by volume: per fuel paid where its customs measure it (prices.json), else its pre-war fuel mix. Any premium the
    country paid over the market is not carried into the no-war price."""
    y = YEARS[i]
    if y < 2022:
        return 1.0
    pipe = GAS_FORMULA.get(iso3, {"ttf": 0.75, "oil9": 0.25})
    lng = LNG_FORMULA.get(iso3, {"ttf": 1.0})
    key = {"ttf": "ttf", "oil9": "oil_formula_9m", "jkm": "jkm"}

    def gas_n(f: dict) -> float:
        if not f:
            return gas_index(iso3, band_p)[i]  # fixed contract price: no windfall
        return sum(w * nw(key[k], y, band_nw) for k, w in f.items()) / sum(f.values())

    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    paid = {f: (v.get(str(y)) or {}).get("paid") or 0 for f, v in parts.items() if f != "non_fuel_goods"}
    bench = {"crude": ("urals", "urals"), "products": ("diesel_gasoil_products", "products"),
             "coal": ("russian_coal", "coal"), "other_fossil": ("diesel_gasoil_products", "products")}  # fmt: skip
    if sum(v for v in paid.values() if v > 0) > 0:
        vol = num = 0.0
        for f, v in paid.items():
            if v <= 0:
                continue
            if f in ("pipeline_gas", "lng"):
                pf, nf = gas_index(iso3, band_p)[i], gas_n(pipe if f == "pipeline_gas" else lng)
            else:
                nwk, ik = bench.get(f, bench["products"])
                own = own_index(iso3, f, band_p) if f in ("crude", "products", "coal") else None
                pf, nf = (own[i] if own else idx(ik, band_p)[i]), nw(nwk, y, band_nw)
            vol += v / pf
            num += v / pf * nf
        return num / vol / fuel_index(iso3, band_p)[i]
    m = import_mix(iso3)
    fuels = ("crude", "products", "gas", "coal", "other_fossil")
    total = sum(m.get(f) or 0 for f in fuels) or 1
    nmap = {"crude": nw("urals", y, band_nw), "products": nw("diesel_gasoil_products", y, band_nw),
            "gas": gas_n(pipe if iso3 in PIPELINE_GAS else lng), "coal": nw("russian_coal", y, band_nw),
            "other_fossil": nw("diesel_gasoil_products", y, band_nw)}  # fmt: skip
    return sum((m.get(f) or 0) * nmap[f] for f in fuels) / total / fuel_index(iso3, band_p)[i]


# Russia's gain on each euro of the war-time price rise of LNG: the profit tax (20% in 2022, 34% in 2023-2025, 25% in
# 2026) plus Russia's 60% of the profit after tax (net_gain_russia-notes.md, LNG)
LNG_PROFIT_TAX = {2022: 0.20, 2023: 0.34, 2024: 0.34, 2025: 0.34, 2026: 0.25}


def windfall_gain(iso3: str) -> list[float]:
    """Russia's net gain per euro of the war-time price windfall, per year, weighted by what the country paid for each
    fuel (prices.json windfall_parts, else its pre-war fuel mix)."""
    ru = load(GAPS / "net_gain_russia.json")["groups"]
    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    m = import_mix(iso3)
    out = []
    for i, y in enumerate(YEARS):
        if y < 2022:
            out.append(1.0)
            continue
        t = LNG_PROFIT_TAX[y]
        lng = t + 0.6 * (1 - t)
        # coal: the rent at the actual price, spread over the price rise; capped at 1
        r = nw("russian_coal", y, "central") / idx("coal", "central")[i]
        gc = ru["coal"].get(str(y), ru["coal"]["2025"])["central"]
        coal = 1.0 if r >= 1 else min(1.0, gc / (1 - r))
        gain = {"lng": lng, "coal": coal}
        paid = {f: (v.get(str(y)) or {}).get("paid") or 0.0 for f, v in parts.items() if f != "non_fuel_goods"}
        if sum(x for x in paid.values() if x > 0) <= 0:
            gas = m.get("gas") or 0.0
            paid = {"crude": m.get("crude") or 0.0, "products": (m.get("products") or 0.0) + (m.get("other_fossil") or 0.0),
                    "coal": m.get("coal") or 0.0, ("pipeline_gas" if iso3 in PIPELINE_GAS else "lng"): gas}  # fmt: skip
        tot = sum(x for x in paid.values() if x > 0)
        out.append(round(sum(x * gain.get(f, 1.0) for f, x in paid.items() if x > 0) / tot, 4) if tot else 1.0)
    return out


WINDFALL_BAND: dict = json.loads((GAPS / "windfall_band_r24.json").read_text())


def war_windfall(countries: dict[str, dict], src: Sources) -> None:
    """Extra money Russia earned because fuel prices were higher during the war: what a country paid for Russian fuel
    minus what the same fuel would have cost at the prices a no-war market expected (round 7: pre-invasion forecasts
    and futures, energy_nowar.json; 2019-2021 prices before). Negative where Russia sold below that price (the
    sanctions discount): less money to Russia. Non-fuel goods are left out (their price rise is general inflation)."""
    src.add(
        "windfall_band",
        "War-time gas price windfall under the pre-war no-war price paths: World Bank and IMF October-2021 forecasts, IMF/EIA/ECB January-2022 views, ICE TTF futures of mid-February 2022 and early 2021 (Enel Global Trading forward updates); each contract's TTF/oil formula",
        "https://k4viewnews-globaltrading-qual.enel.com/spanish-forward-gas-update-21-01-2021",
        WINDFALL_BAND.get("generated"),
        "the windfall line's range under the other no-war paths; see research/2026-10/gaps/windfall_band_r24-notes.md",
    )
    wid = src.add(
        "windfall",
        "War-time price windfall on Russian fuel: payments minus the same volume at the prices a no-war market expected (pre-invasion forecasts and futures: IMF, World Bank, EIA, ECB, ICE)",
        "https://github.com/intelligent-cream/war-balance/blob/main/research/2026-10/gaps/energy_nowar-notes.md",
        "2026-10-18",
        "fuel share of payments per year from own customs where measured (prices.json), else the pre-war import mix; fuel price indices (prices.json, energy2.json, gas_prices.json); round 14: oil at FOB, the war-time sea-freight surge (shipping-notes.md freight pool) taken out of customs CIF values",
    )
    for iso3, c in countries.items():
        tr = c.get("to_rus")
        if not tr:
            continue
        fs, fsy_own = fossil_share(iso3), fuel_share_year(iso3)
        if not fs and not any(fsy_own):
            continue
        out = {}
        # the low end takes the low fuel price level; the uncertainty of the no-war price is carried once, on the
        # expected path (apply_nowar_prices), because the windfall and the volume part share it and it cancels
        for k, band, band_nw in (
            ("years", "central", "central"),
            ("years_lo", "low", "central"),
            ("years_hi", "high", "central"),
        ):
            fuel, nf = fuel_index(iso3, band), own_index(iso3, "non_fuel_goods", band) or idx("non_fuel_goods", band)
            vals = []
            for i, y in enumerate(YEARS):
                if y < 2022 or fuel[i] <= 0:
                    vals.append(0.0)
                    continue
                # fuel's share of the year's payments, at that year's prices
                fsy = fsy_own[i] if fsy_own[i] is not None else fs * fuel[i] / (fs * fuel[i] + (1 - fs) * nf[i])
                vals.append(round(tr["years"][i] * fsy * (1 - nowar_ratio(iso3, i, band_nw, band)), 5))
            out[k] = vals
        # the fuel share moves with the price level too, so the three values are put back in order each year
        trip = [sorted((a, b, h)) for a, b, h in zip(out["years_lo"], out["years"], out["years_hi"])]
        out = {"years_lo": [t[0] for t in trip], "years": [t[1] for t in trip], "years_hi": [t[2] for t in trip]}
        # round 13 (audit): the windfall counts at Russia's net gain on the extra price, like every other payment to
        # Russia. Costs do not rise with the price, so the gain on it is all of it for crude, products and pipeline
        # gas; for LNG only the profit tax and Russia's 60% of the profit after tax; for coal at most the rent Russia
        # still made at the actual price (net_gain_russia.json). The full-value series is kept for the method band
        m = windfall_gain(iso3)
        # round 16: the gas share (pipeline and LNG) of the pre-war fuel bought from Russia, for the cause named in the
        # "Russia's gain rose" list ("the 2022 price spike on gas contracts")
        c["windfall"] = {k: [round(v * f, 5) for v, f in zip(vals, m)] for k, vals in out.items()} | {
            "alt": out["years"],
            "gain": m,
            "gas_share": windfall_gas_share(iso3),
            "cert": "C",
            "src": [wid, "net_gain_russia", "shipping"],
        }
        # round 24b (audit 24, D M2): the windfall under the other pre-war no-war gas price paths (Feb-2022 futures,
        # Oct-2021 forecasts; windfall_band_r24.json), as factors on the central windfall; calc() widens the line with them
        wb = (WINDFALL_BAND.get("countries_research_run") or {}).get(iso3)
        if wb and wb["proposed_likely_range_eur_bn"]["central"]:
            r = wb["proposed_likely_range_eur_bn"]
            c["windfall"]["path_band"] = [round(r["low"] / r["central"], 4), round(r["high"] / r["central"], 4)]
            c["windfall"]["src"].append("windfall_band")


def windfall_gas_share(iso3: str) -> float:
    """Round 16: the gas share (pipeline and LNG) of a country's 2022 windfall, for the cause named in the "Russia's gain
    rose" list: each fuel's pre-war share of purchases from Russia x how far its 2022 price rose above the no-war price
    (both against 2019-2021). A label only."""
    mix, i, y = pre_war_fuel_split(iso3), 1, 2022
    pipe = GAS_FORMULA.get(iso3, {"ttf": 0.75, "oil9": 0.25})
    key = {"ttf": "ttf", "oil9": "oil_formula_9m", "jkm": "jkm"}
    gas_nw = sum(w * nw(key[k], y, "central") for k, w in pipe.items()) / sum(pipe.values()) if pipe else None
    gas_pa = gas_index(iso3, "central")[i]
    gap = {"crude": idx("urals", "central")[i] - nw("urals", y, "central"),
           "products": idx("products", "central")[i] - nw("diesel_gasoil_products", y, "central"),
           "other_fossil": idx("products", "central")[i] - nw("diesel_gasoil_products", y, "central"),
           "coal": idx("coal", "central")[i] - nw("russian_coal", y, "central"),
           "gas": gas_pa - (gas_nw if gas_nw is not None else gas_pa)}  # fmt: skip
    gap["lng"] = gap["gas"]
    w = {f: max(0.0, (mix.get(f) or 0) * gap[f]) for f in gap}
    tot = sum(w.values())
    return round((w["gas"] + w["lng"]) / tot, 3) if tot > 0 else 0.0


def laundered_volumes(countries: dict[str, dict]) -> None:
    """Round 13 (audit): laundered oil as volumes, like every other trade part. The Russian crude inside the fuel a
    country bought is valued at the crude price a no-war market expected, against its pre-war level at pre-war prices,
    and counts both ways (it was the rise only, in money, so higher prices counted and falls did not). Its price index
    is the Urals price paid over the no-war crude price; the expected path takes the no-war price on top of the pre-war
    growth. Russia's net gain on crude weights it in calc(), as before."""
    ural = {b: idx("urals", b) for b in BANDS}
    nwc = [nw("urals", y, "central") if y >= 2022 else ural["central"][i] for i, y in enumerate(YEARS)]
    for c in countries.values():
        tr = c.get("to_rus") or {}
        lb = c.get("laund")
        if lb is None and any(tr.get("laundered") or []):
            lb = c["laund"] = {"years": list(tr["laundered"]), "years_lo": list(tr.get("laundered_lo") or tr["laundered"]),
                               "years_hi": list(tr.get("laundered_hi") or tr["laundered"]), "base": 0.0, "base_range": [0.0, 0.0],
                               "cert": "C", "src": list(tr.get("laundered_src") or [])}  # fmt: skip
        if not lb:
            continue
        # money / pidx = crude volume x no-war crude price (2019-2021 = 1); 2021 at its own price
        for suf, b in (("", "central"), ("_lo", "low"), ("_hi", "high")):
            lb["pidx" + suf] = [round(a / n, 4) for a, n in zip(ural[b], nwc)]
        lb["pidx"][0] = lb["pidx_lo"][0] = lb["pidx_hi"][0] = round(ural["central"][0], 4)
        # the pre-war level (2021 money) at 2019-2021 prices, and the no-war price on the expected path
        r21 = ural["central"][0]
        lb["base"] = round(lb.get("base", 0.0) / r21, 5)
        lb["base_range"] = [round(v / r21, 5) for v in lb.get("base_range") or [0.0, 0.0]]
        for k in ("bmul", "bmul_lo", "bmul_hi"):
            g = lb.get(k) or [1.0] * 6
            lb[k] = [1.0] + [round(v * n, 4) for v, n in zip(g[1:], nwc[1:])]
        lb["volumes"] = True
        for obj in (lb, tr):
            key = "src" if obj is lb else "laundered_src"
            if obj and "prices" not in obj.setdefault(key, []):
                obj[key].append("prices")


def apply_nowar_prices(countries: dict[str, dict], src: Sources) -> None:
    """Round 7: the change in fuel volume is valued at the prices a no-war market expected, not 2019-2021 prices, so
    that it and the windfall add up exactly: actual - expected payment = (volume change x no-war price) + (actual
    volume x (actual price - no-war price)). The expected path (bmul) takes the no-war fuel price on its fuel share,
    and the price index of payments values the fuel part at the no-war price. The oil discount gain (cost view) no
    longer counts Russia's normal pre-war discount to Brent."""
    disc = NOWAR["switching_cost_r7"]["oil_discount_gain_factor"]
    for iso3, c in countries.items():
        en = c.get("energy")
        if en and en.get("discount"):
            for k in ("discount", "discount_lo", "discount_hi"):
                en[k] = [round(v * disc.get(str(y), 1.0), 5) for v, y in zip(en[k], YEARS)]
        tr = c.get("to_rus")
        fs, fsy_own = fossil_share(iso3), fuel_share_year(iso3)
        if not tr or (not fs and not any(v for v in fsy_own if v)):
            continue
        fuel_c = fuel_index(iso3, "central")
        # the no-war fuel price level per year (2019-2021 = 1)
        n = [nowar_ratio(iso3, i, "central", "central") * fuel_c[i] if y >= 2022 else 1.0 for i, y in enumerate(YEARS)]
        mul = [fs * v + (1 - fs) for v in n]
        # round 15 (method band, "2026 at 2025 prices"): the factor that values 2026's change at 2025's fuel prices
        # instead of the Hormuz-crisis prices of 2026 (site/content/method/prices.md)
        tr["p26"] = round(mul[4] / mul[5], 4) if mul[5] else 1.0
        # the no-war price's own range, as factors on the expected path (the site adds it to the range of the change)
        for suf, b in (("nrl", "low"), ("nrh", "high")):
            nb = [nowar_ratio(iso3, i, b, "central") * fuel_c[i] if y >= 2022 else 1.0 for i, y in enumerate(YEARS)]
            tr[suf] = [round((fs * v + (1 - fs)) / m, 4) for v, m in zip(nb, mul)]
        for k in ("bmul", "bmul_lo", "bmul_hi"):
            if tr.get(k):
                tr[k] = [round(b * m, 4) for b, m in zip(tr[k], mul)]
        if not tr.get("bmul"):
            tr["bmul"] = tr["bmul_lo"] = tr["bmul_hi"] = [round(m, 4) for m in mul]
        # the payments index at 2019-2021 prices, kept for the fuel mix (apply_net_gain): its tracker volumes are at
        # 2019-2021 prices too, so the volume of all payments must be (round 13 audit: the no-war index below values
        # fuel at no-war prices, which understated the fuel share from 2022)
        tr["_pidx_pre"] = list(tr["pidx"])
        for band, suffix in (("central", ""), ("low", "_lo"), ("high", "_hi")):
            fuel = fuel_index(iso3, band)
            nf = own_index(iso3, "non_fuel_goods", band) or idx("non_fuel_goods", band)
            out = []
            for i, y in enumerate(YEARS):
                f, g = fuel[i], nf[i]
                sy = fsy_own[i] if fsy_own[i] is not None else fs * f / (fs * f + (1 - fs) * g)
                # value / index = fuel volume x no-war price + other goods at pre-war prices
                out.append(round(1 / (sy * n[i] / f + (1 - sy) / g), 4) if f > 0 and g > 0 else tr["pidx" + suffix][i])
            tr["pidx" + suffix] = out
            if band == "central":
                # round 14 (M5): the factor that turns a year's volume (fuel at the no-war price, other goods at
                # 2019-2021 prices) into current euros, like aid: fuel is already in that year's euros at the no-war
                # price; other goods are re-inflated by their own price level
                cur = []
                for i, y in enumerate(YEARS):
                    f, g = fuel[i], nf[i]
                    sy = fsy_own[i] if fsy_own[i] is not None else fs * f / (fs * f + (1 - fs) * g)
                    cur.append(round((sy * n[i] / f + (1 - sy)) * out[i], 4) if f > 0 and g > 0 else round(out[i], 4))
                tr["cur"] = cur
        tr["nowar_prices"] = True


P26_CRUDE = round(NW_IDX["brent"]["2025"]["actual"] / NW_IDX["brent"]["2026"]["actual"], 4)


def current_euros(countries: dict[str, dict]) -> None:
    """Round 14 (audit M5, approved by the owner): every trade part in the same euros as aid, current prices. The map
    compares volumes (each year's value over its price level) so that price swings are not counted as changes; the
    change in volume is then valued at that year's prices (cur, applied in index.html spread()). Goods and services
    other than fuel: their own price level (pidx); fuel in payments to Russia and the Russian crude in fuel bought
    elsewhere (laundered oil): already in that year's euros at the price a no-war market expected (round 7), so 1."""
    for c in countries.values():
        for key in ("from_rus", "buy_ukr", "sell_ukr", "svc_bought", "svc_sold", "shipping"):
            obj = c.get(key)
            if obj and obj.get("pidx"):
                obj["cur"] = [round(v, 4) for v in obj["pidx"]]
        tr = c.get("to_rus")
        if tr and not tr.get("cur") and tr.get("pidx"):
            tr["cur"] = [round(v, 4) for v in tr["pidx"]]
        if c.get("laund"):
            c["laund"]["cur"] = [1.0] * len(YEARS)
            # round 15 (method band): crude at 2025's price instead of 2026's (Brent, actual)
            c["laund"]["p26"] = P26_CRUDE


def pre_war_trends(countries: dict[str, dict], src: Sources) -> None:
    """Where trade was already growing or shrinking before the war, the counterfactual follows that trend (damped,
    capped at -10%..+10% a year). The range always includes the flat 2019-2021 level; unreliable trends centre on it."""
    tr = load(GAPS / "trend.json")
    sid = src.add(
        "trend",
        "Pre-war trade trends 2012-2021 in real terms (UN Comtrade, price indices), continued with a 3-year half-life",
        "https://comtradeapi.un.org/",
        tr.get("generated"),
        "back-tested on 2002-2013; see research/2026-10/gaps/trend-notes.md",
    )
    src.add(
        "gas_prices",
        "Russian gas prices per country: Eurostat Comext and UN Comtrade unit values, published contract prices, oil-formula estimates",
        "https://ec.europa.eu/eurostat/web/international-trade-in-goods/data/database",
        GAS_PRICES.get("generated"),
        "see research/2026-10/gaps/gas_prices-notes.md; Turkey, Poland, Germany and Austria are modelled from neighbours or oil formulas",
    )
    for iso3, flows in tr["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        for key, d in flows.items():
            obj = c.get(key)
            if not obj or not d.get("multiplier"):
                continue
            mid, lo, hi = [1.0], [1.0], [1.0]
            for y in YEARS[1:]:
                m = d["multiplier"].get(str(y)) or {"low": 1, "central": 1, "high": 1}
                cen = m["central"] if d.get("reliable") else 1.0
                mid.append(round(cen, 4))
                lo.append(round(min(m["low"], cen, 1.0), 4))
                hi.append(round(max(m["high"], cen, 1.0), 4))
            obj["bmul"], obj["bmul_lo"], obj["bmul_hi"] = mid, lo, hi
            obj["src"] = obj.get("src", []) + ([sid] if sid not in obj.get("src", []) else [])

    # services, company taxes and shipping (research/2026-10/gaps/trend2.json)
    t2 = load(GAPS / "trend2.json")
    sid2 = src.add(
        "trend2",
        "Pre-war trends for services (OECD-WTO BaTiS, Eurostat, Bank of Russia), foreign companies in Russia and Russian seaborne exports",
        "https://www.oecd.org/en/data/datasets/balanced-trade-in-services.html",
        t2.get("generated"),
        "travel fitted on 2012-2019 with the COVID rebound; see research/2026-10/gaps/trend2-notes.md",
    )

    def put(obj: dict, mid: list, lo: list, hi: list) -> None:
        obj["bmul"], obj["bmul_lo"], obj["bmul_hi"] = mid, lo, hi
        if sid2 not in obj.setdefault("src", []):
            obj["src"].append(sid2)

    for iso3, flows in t2["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        for key in ("svc_bought", "svc_sold"):
            d, obj = flows.get(key), c.get(key)
            if not d or not obj or not d.get("multiplier"):
                continue
            # the services baseline is 2021, a COVID year for travel: multipliers are against 2019-2021, so they are
            # divided by 2021's level relative to 2019-2021. An unreliable trend keeps only the rebound from COVID
            r = 1.0 if obj.get("base_2019_2021") else (d.get("base_2021_over_2019_2021") or 1.0)
            mex = d.get("multiplier_ex_covid") or d["multiplier"]
            mid, lo, hi = [1.0], [1.0], [1.0]
            for y in YEARS[1:]:
                m, mx = d["multiplier"][str(y)], mex.get(str(y)) or d["multiplier"][str(y)]
                rebound = m["central"] / mx["central"] if mx["central"] else 1.0
                # a level-based counterfactual (Egypt's flight ban, no COVID split) is used as it is
                cen = (m["central"] if d.get("reliable") or not d.get("multiplier_ex_covid") else rebound) / r
                mid.append(round(cen, 4))
                # tiny or noisy series can give extreme fitted bounds: kept within 2.5 times the middle value (judgement,
                # site/content/changelog.md, constants)
                lo.append(round(max(cen / 2.5, min(m["low"] / r, cen, rebound / r)), 4))
                hi.append(round(min(cen * 2.5, max(m["high"] / r, cen, rebound / r)), 4))
            put(obj, mid, lo, hi)
    comp_global = t2["global"]["company"]
    for iso3, c in countries.items():
        obj = c.get("company")
        if not obj:
            continue
        d = (t2["countries"].get(iso3) or {}).get("company")
        d = d if d and d.get("reliable") else comp_global
        # the company series starts in 2021; the trend is against 2019-2021 (or about that level, for a 2018-2021 base);
        # 1.045 is trend2.json's global central (trend2-notes.md)
        r = d.get("trend_2021_over_2019_2021") or comp_global.get("trend_2021_over_2019_2021") or 1.045
        r = r.get("central", 1.045) if isinstance(r, dict) else r
        if obj.get("base_2018_2021"):
            r = 1.0
        mid = [1.0] + [round(d["multiplier"][str(y)]["central"] / r, 4) for y in YEARS[1:]]
        lo = [1.0] + [round(min(d["multiplier"][str(y)]["low"] / r, 1.0), 4) for y in YEARS[1:]]
        hi = [1.0] + [round(max(d["multiplier"][str(y)]["high"] / r, 1.0), 4) for y in YEARS[1:]]
        put(obj, mid, lo, hi)
    ship = t2["global"]["shipping"]
    for c in countries.values():
        obj = c.get("shipping")
        if obj:
            ms = [ship["multiplier"][str(y)] for y in YEARS[1:]]
            put(
                obj,
                [1.0] + [m["central"] for m in ms],
                [1.0] + [min(m["low"], 1.0) for m in ms],
                [1.0] + [max(m["high"], 1.0) for m in ms],
            )


# Round 16 (review 5, M2; approved by the owner): purchases from Russia below this average a year in 2019-2021 (EUR bn,
# at 2019-2021 prices; the upper limit of the back-tests' small and medium size classes, counterfactual-notes.md) start
# their no-war path from the 2019-2021 average, not from 2021 alone
SMALL_FLOW_EUR_BN = 1.0
# Round 16b (check 16, B1 and N1; approved by the owner): flows where 2019-2020 do not describe the pre-war trade, so the
# small-flow rule is not applied and the no-war path keeps 2021 at 2019-2021 prices. Refinery openings or closures:
SMALL_FLOW_EXCLUDE = {
    "BRN": (
        "refinery",
        "Brunei's Hengyi refinery began operations in November 2019: 2019-2020 are start-up years",
        "https://www.business.gov.bn/mofe-expansion-of-hengyi-complex-will-be-significant-boost-to-brunei-economy/",
    ),
    "NZL": (
        "refinery",
        "New Zealand's Marsden Point refinery stopped refining on 31 March 2022 (closure voted in August 2021): its "
        "Russian crude and fuel of 2019-2020 fed a refinery that closed for reasons of its own",
        "https://en.wikipedia.org/wiki/Marsden_Point_Oil_Refinery",
    ),
}
# Pre-war data that are only mirror or confidential figures: 2021 kept, and the panel says so
SMALL_FLOW_MIRROR = {
    "SYR": "Syria's pre-war imports are Russia's own export figures, coded 100% as confidential (HS 99) in 2020-2021",
}


def pre_price_levels(iso3: str) -> list[float]:
    """Price level of what a country bought from Russia in 2019, 2020 and 2021, relative to 2021 (central): its own
    customs unit values where measured for all three years, else its pre-war fuel mix with the benchmark indices
    (energy2.json), weighted by fuel's pre-war share like price_indices(). Used only to bring 2019 and 2020 to the
    2021 price level of the flow's own index (round 16b)."""
    pi = E2["price_index"]

    def own(name: str) -> list[float] | None:
        s = ((PRICES.get(iso3) or {}).get("index") or {}).get(name) if iso3 not in PRICES_SKIP else None
        if s and all((s.get(str(y)) or {}).get("central") for y in PRE_YEARS):
            return [s[str(y)]["central"] for y in PRE_YEARS]
        return None

    m = import_mix(iso3)
    fuels = ("crude", "products", "gas", "coal", "other_fossil")
    gas = "pipeline_gas" if iso3 in PIPELINE_GAS else "lng"
    total = sum(m.get(f) or 0 for f in fuels) or 1
    bench = [
        sum(
            (m.get(f) or 0) * pi[n][str(y)]["central"]
            for f, n in zip(fuels, ("urals", "products", gas, "coal", "products"))
        )
        / total
        for y in PRE_YEARS
    ]
    fuel = own("fossil_all") or bench
    nf = own("non_fuel_goods") or [pi["non_fuel_goods"][str(y)]["central"] for y in PRE_YEARS]
    fs = fossil_share(iso3)
    lvl = [fs * f + (1 - fs) * g for f, g in zip(fuel, nf)]
    return [v / lvl[2] if lvl[2] else 1.0 for v in lvl]


def small_flow_base(iso3: str, obj: dict, avg_nominal: float, p21: float) -> None:
    """Round 16 (review 5, M2), corrected in round 16b (check 16, B1 and N1; approved by the owner): a small flow from
    Russia swings from year to year (one cargo more or less), so a single year is a noisy starting point. Where purchases
    from Russia were under SMALL_FLOW_EUR_BN a year in 2019-2021, the no-war path starts from the MEDIAN of 2019, 2020
    and 2021, each at 2019-2021 prices, so one odd year (Malta's 2019 fuel entry, Israel's 2019 crude) cannot set it.
    2021 is the map's own value (years[0] / pidx[0]); 2019 and 2020 are the yearly customs values (_pre) brought to the
    build's adjusted level (freight, gas swap, resale margins: the ratio of the adjusted to the raw 2019-2021 average)
    and to 2021's price level (pre_price_levels). 2021 alone stays inside the range. Not applied, so 2021 is kept: the
    refinery openings and closures in SMALL_FLOW_EXCLUDE, the mirror-only data in SMALL_FLOW_MIRROR, and flows whose
    pre-war level is a single researched or 2021-only value (_pre_single: no yearly series behind it; a researched
    level that is not a 2021 value, Lebanon's, is kept as it is). Round 16 took
    the 'average' from base, which for these flows held 2021 at 2021 prices (Brunei +2.35 -> +5.04, an artefact)."""
    pre = obj.get("_pre")
    b21 = obj["base"]
    reason = None
    if iso3 in SMALL_FLOW_EXCLUDE:
        reason = SMALL_FLOW_EXCLUDE[iso3][0]
    elif iso3 in SMALL_FLOW_MIRROR:
        reason = "mirror"
    elif obj.get("_pre_single"):
        reason = obj["_pre_single"]
    elif not pre or not sum(pre) or iso3 == "MDA":  # Moldova: its own researched baseline (below)
        reason = "no_series"
    if reason is None:
        k = avg_nominal / (sum(pre) / 3)
        lv = pre_price_levels(iso3)
        real = [pre[0] * k / (p21 * lv[0]), pre[1] * k / (p21 * lv[1]), b21]
        if not sum(real) / 3 < SMALL_FLOW_EUR_BN:
            return
        med = sorted(real)[1]
        obj["base_2021"] = b21
        obj["base_years"] = [round(v, 5) for v in real]  # 2019, 2020, 2021 at 2019-2021 prices
        obj["base"] = round(med, 5)
        obj["base_range"] = [round(min(obj["base_range"][0], med), 5), round(max(obj["base_range"][1], med), 5)]
        obj["small_flow"] = True
    elif reason == "researched" and abs(avg_nominal - obj["years"][0]) > 1e-4:
        # a researched pre-war level that is not a 2021 value (Lebanon: the mean of 2018, 2020 and 2021, leaving out
        # 2019's fuel bought for smuggling into Syria; fix_artefacts()) is kept as it is, as in round 16
        obj["base_2021"] = b21
        obj["base"] = round(avg_nominal, 5)
        obj["base_range"] = [
            round(min(obj["base_range"][0], obj["base"]), 5),
            round(max(obj["base_range"][1], obj["base"]), 5),
        ]
        obj["base_researched"] = True
    elif avg_nominal < SMALL_FLOW_EUR_BN and reason in ("refinery", "mirror"):
        obj["small_flow_kept_2021"] = reason  # a label: the panel says why 2021 is kept


def counterfactual(countries: dict[str, dict], src: Sources) -> None:
    """Expected trade without the war (research/2026-10/gaps/counterfactual.json): per flow type, the model that beat
    holding 2021 flat in back-tests from 2008, 2013 and 2016, else 2021 held flat (services with the travel recovery).
    The pre-war level becomes 2021 at 2019-2021 prices, and the multipliers carry the back-tested 90% error, so the
    expected path is never treated as exact. Replaces the trend.json and trend2.json trends for these flows."""
    cf = load(GAPS / "counterfactual.json")
    # Belarus's imports from Russia: its own 2002-2021 history gives an error band about half as wide as the generic
    # one (belarus.json, round 5); its exports to Russia keep the generic band, which rests on far more errors
    cf["countries"].setdefault("BLR", {})["to_rus"] = load(GAPS / "belarus.json")["countries"]["BLR"]["counterfactual"][
        "to_rus"
    ]
    sid = src.add(
        "counterfactual",
        "Expected trade without the war: models back-tested on 2008, 2013 and 2016 against holding 2021 flat (UN Comtrade, World Bank WDI and commodity prices, UN voting)",
        "https://comtradeapi.un.org/",
        cf.get("generated"),
        "exports to Russia and trade with Ukraine follow a nowcast; imports from Russia and services keep 2021; see research/2026-10/gaps/counterfactual-notes.md",
    )
    # round 6: the range of the 2022-2026 total is measured on the back-tests' cumulative errors (per flow, size class,
    # model and number of years), and some of Russia's neighbours get bands tested on their own history (cf_bands.json)
    # round 6: more back-tests for trade with Ukraine (rolling origins on Ukraine's history, analogue partners); both
    # flows fall back to 2021 held flat, each with its own cumulative band (ua_trade_cf.json); replaces round 4's models
    ua = load(GAPS / "ua_trade_cf.json")
    for iso3, flows in ua["countries"].items():
        for key in ("buy_ukr", "sell_ukr"):
            if flows.get(key):
                cf["countries"].setdefault(iso3, {})[key] = flows[key]
    uid = src.add(
        "ua_trade_cf",
        "Expected trade with Ukraine without the war: rolling back-tests on Ukraine's own history and on analogue partners (IMF WEO vintages, IMF DOTS)",
        "https://db.nomics.world/IMF/DOT",
        ua.get("generated"),
        "2021 held flat for both flows; see research/2026-10/gaps/ua_trade_cf-notes.md",
    )
    bands = load(GAPS / "cf_bands.json")
    # round 7: the band for imports from Russia re-measured on rolling origins 2005-2020 and calibrated by era (each
    # era covered 90-94% by bands from the other two), per size class; applied to every country of that size that has
    # no own tested band (to_rus_cf.json)
    trc = load(GAPS / "to_rus_cf.json")["countries"]
    cls = {}
    for d in trc.values():
        cls.setdefault(d["size_class"], d)
    for size, d in cls.items():
        for table in ("chosen", "rw"):
            if f"to_rus/{size}" in bands["cumulative_bands"][table]:
                bands["cumulative_bands"][table][f"to_rus/{size}"] = d["cumulative_band"]
    own = {i for i, f in bands["countries"].items() if "to_rus" in f} | {"BLR"}
    for iso3, flows in cf["countries"].items():
        d = flows.get("to_rus")
        if d and iso3 not in own and d.get("size_class") in cls and d.get("multiplier_vs_2021"):
            d["multiplier_vs_2021"] = cls[d["size_class"]]["multiplier_vs_2021"]
    # round 8: buyers of Russian fuel mainly by pipeline (Druzhba crude plus pipeline gas) had steady physical volumes
    # before the war; their band is measured on tonnes and terajoules, combined with other goods by fuel share and
    # calibrated by era (fuel_volume_cf.json). Poland had notified in 2019 that its Yamal gas contract would end in
    # 2022, so its no-war path drops the gas from 2023 (a decision taken before the war)
    fv = load(GAPS / "fuel_volume_cf.json")["countries"]
    for iso3, d in fv.items():
        tr = (cf["countries"].get(iso3) or {}).get("to_rus")
        if d.get("status") != "new" or not tr:
            continue
        alt = (d.get("central_alternative") or {}).get("multiplier_vs_2021") or {}
        tr["multiplier_vs_2021"] = {
            y: {b: v * alt.get(y, 1.0) for b, v in m.items()} for y, m in d["multiplier_vs_2021"].items()
        }
        tr["cumulative_band"] = d["cumulative_band"]
    for iso3, flows in bands["countries"].items():
        for key, d in flows.items():
            cf["countries"].setdefault(iso3, {}).setdefault(key, {}).update(
                {k: d[k] for k in ("multiplier_vs_2021", "cumulative_band", "method", "size_class") if k in d}
            )
    bid = src.add(
        "cf_bands",
        "Ranges of the 2022-2026 total measured on the back-tests' cumulative errors; own bands for Mongolia, Yemen, Tajikistan and Moldova",
        None,
        bands.get("generated"),
        "see research/2026-10/gaps/cf_bands-notes.md",
    )
    for iso3, flows in cf["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        for key, d in flows.items():
            obj = c.get(key)
            if not obj or not obj.get("base") or not d.get("multiplier_vs_2021"):
                continue
            p = obj.get("pidx") or [1.0] * len(YEARS)
            pl, ph = obj.get("pidx_lo") or p, obj.get("pidx_hi") or p
            if not p[0]:
                continue
            avg_nominal = obj["base"]  # the build's 2019-2021 average, in each year's own prices
            obj["base"] = round(obj["years"][0] / p[0], 5)
            obj["base_range"] = [
                round(min(obj["years_lo"][0] / ph[0], obj["base"]), 5),
                round(max(obj["years_hi"][0] / pl[0], obj["base"]), 5),
            ]
            if key == "to_rus":
                small_flow_base(iso3, obj, avg_nominal, p[0])
            ms = [d["multiplier_vs_2021"][str(y)] for y in YEARS[1:]]
            # services: the travel recovery is sized on the model's own 2021 level. Where the map's 2021 is higher
            # (another source, little COVID dip), the expected level stops at the model's recovered level in euros
            # (Montenegro: its 2021 was 6% of 2019 in the model's data, but not in the map's)
            eur = d.get("eur_bn_at_2018_2021_prices") or {}
            scale = []
            for y, m in zip(YEARS[1:], ms):
                e = (eur.get(str(y)) or {}).get("central")
                cap = max(1.0, e / obj["base"]) if key.startswith("svc_") and e and m["central"] > 1 else m["central"]
                scale.append(min(1.0, cap / m["central"]) if m["central"] else 1.0)
            obj["bmul"] = [1.0] + [round(m["central"] * f, 4) for m, f in zip(ms, scale)]
            obj["bmul_lo"] = [1.0] + [round(min(m["low"], m["central"]) * f, 4) for m, f in zip(ms, scale)]
            obj["bmul_hi"] = [1.0] + [round(max(m["high"], m["central"]) * f, 4) for m, f in zip(ms, scale)]
            meth = d.get("method", "")
            obj["cf"] = "lin" if meth.startswith("linear") else "rf" if meth.startswith("random-forest") else "rw"
            obj["src"] = [x for x in obj.get("src", []) if x not in ("trend", "trend2")] + [sid]
            # cumulative band per number of years summed (index 1-5; 5 = 2026 at 8 of 12 months), as [low, high]
            # multipliers on the sum of the expected levels
            cb = d.get("cumulative_band")
            if not cb and not (iso3 == "BLR" and key == "to_rus"):  # Belarus keeps its own yearly band (round 5)
                table = bands["cumulative_bands"]
                cell = f"{key}/{d.get('size_class', 'M')}"
                cb = (table["rw"] if obj["cf"] == "rw" and cell in table["rw"] else table["chosen"]).get(cell)
            if cb:
                hs = ["H1", "H2", "H3", "H4", "H5_2026_8of12"]
                obj["cb"] = [None] + [[cb[h]["low"], cb[h]["high"]] for h in hs]
                obj["src"].append(bid)
            if key in ("buy_ukr", "sell_ukr") and key in (ua["countries"].get(iso3) or {}):
                obj["src"].append(uid)
            if iso3 == "MDA" and key == "to_rus":
                # right-bank gas and other goods at 2019-2021 prices; the 2019-2021 average as the low alternative
                m = bands["countries"]["MDA"]["to_rus"]["base_range_recommended_eur_bn_at_2019_2021_prices"]
                obj["base"], obj["base_range"] = m["central"], [m["low"], m["high"]]


def power_of_siberia(countries: dict[str, dict], src: Sources) -> None:
    """Round 15 (review 4, M2; approved by the owner): China's no-war imports from Russia include the contracted ramp-up
    of the Power of Siberia pipeline (agreed 2014, flowing since December 2019): the contracted volume above the 2021
    level (power_of_siberia_r15.json) is added to the expected path at 2019-2021 prices, before the no-war fuel price
    is applied (apply_nowar_prices). Only deliveries beyond the contracted path count as war-driven."""
    ps = load(GAPS / "power_of_siberia_r15.json")
    tr = (countries.get("CHN") or {}).get("to_rus")
    if not tr or not tr.get("bmul") or not tr.get("base"):
        return
    pipe = GAS_PRICES["countries"]["CHN"]["pipeline"]
    price = sum(pipe[str(y)]["central"] for y in (2019, 2020, 2021)) / 3  # EUR/MWh at 2019-2021 prices
    v21 = ps["actual"]["2021"]
    add = [0.0] + [(ps["contracted"][str(y)] - v21) * MWH_PER_BCM * price / 1e9 / tr["base"] for y in YEARS[1:]]
    for k in ("bmul", "bmul_lo", "bmul_hi"):
        if tr.get(k):
            tr[k] = [round(b + a, 4) for b, a in zip(tr[k], add)]
    sid = src.add(
        "power_of_siberia",
        "Power of Siberia: contracted gas deliveries to China (Gazprom via Interfax, TASS and Reuters)",
        "https://interfax.com/newsroom/top-stories/115552/",
        ps.get("generated"),
        "the contracted ramp-up (2014 contract, 38 bcm/yr plateau) is in China's no-war path; see research/2026-10/gaps/power_of_siberia_r15.json",
    )
    tr["src"] = list(dict.fromkeys((tr.get("src") or []) + [sid]))
    tr["pos_contracted_bmul_add"] = [round(a, 4) for a in add]


LAUNDERED_PREWAR = json.loads(
    (Path(__file__).resolve().parent.parent / "research/2026-10/gaps/round4a.json").read_text()
)["laundered_prewar"]


def add_extra(c: dict, k: str, label: str, to_russia: dict[str, list[float]], cert: str, sid: str) -> None:
    """A part with no series of its own: yearly change against the pre-war level, as money toward Russia (low, central,
    high), stored as the shift toward Ukraine (the sign flipped, so its low end is the most toward Russia)."""
    part = {"k": k, "label": label, "cert": cert, "src": [sid],
            "c": [round(-v, 5) for v in to_russia["central"]],
            "l": [round(-v, 5) for v in to_russia["high"]],
            "h": [round(-v, 5) for v in to_russia["low"]]}  # fmt: skip
    c.setdefault("extra", []).append(part)


def add_taken(c: dict, k: str, label: str, taken: dict[str, list[float]], cert: str, srcs: list[str]) -> None:
    """Round 14b: money Russia took from the country's companies (seizures, forced sales), yearly, positive = taken
    (low, central, high). Not in the net or either headline number; a cost carried in the cost view."""
    part = {"k": k, "label": label, "cert": cert, "src": list(srcs),
            "c": [round(v, 5) for v in taken["central"]],
            "l": [round(v, 5) for v in taken["low"]],
            "h": [round(v, 5) for v in taken["high"]]}  # fmt: skip
    c.setdefault("taken", []).append(part)


SANCTION_BLOCKED_LOANS = {"VNM", "IRQ", "BGD"}


def apply_state_finance(countries: dict[str, dict], src: Sources) -> None:
    """Rosatom nuclear projects and Russia's state loans (russia_state_finance.json, round 5): the buyer's own payments
    for construction, repayments and interest on Russian state loans against the schedule, and Rosatom equipment that
    customs data counted as the host's purchases (Akkuyu, El Dabaa). Nuclear fuel is already in goods trade."""
    rf = load(GAPS / "russia_state_finance.json")
    sid = src.add(
        "state_finance",
        "Rosatom projects abroad and Russia's state loans: World Bank International Debt Statistics (Russia as creditor), project and loan reporting",
        "https://www.worldbank.org/en/programs/debt-statistics/ids",
        rf.get("generated"),
        "drawdowns left out (they pay for work not counted); see research/2026-10/gaps/russia_state_finance-notes.md",
    )
    for iso3, d in rf["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        ro, sl = d.get("rosatom") or {}, d.get("state_loans") or {}
        out = {"low": [], "central": [], "high": []}
        for b in out:
            add = ro.get("to_add") or {}
            cc = ro.get("customs_correction") or {}
            # Belarus's deferrals were granted by Russia and refinanced with new Russian loans: net of that, its
            # repayments did not change by its own choice (round 6), so only its nuclear-plant part counts
            dev = {} if iso3 == "BLR" else (sl.get("deviation_from_schedule") or {})
            add_base = (ro.get("to_add_base_2019_2021") or {}).get(b, 0.0)
            cc_base = sum((cc.get(str(y)) or {}).get(b, 0.0) for y in (2019, 2020, 2021)) / 3
            # the customs over-count is taken out of "paid", which is measured at pre-war prices: deflated the same way
            p = (c.get("to_rus") or {}).get("pidx") or [1.0] * len(YEARS)
            for i, y in enumerate(YEARS):
                v = (
                    0.0
                    if y < 2022
                    else (
                        ((add.get(str(y)) or {}).get(b, 0.0) - add_base)
                        + ((cc.get(str(y)) or {}).get(b, 0.0) - cc_base) / (p[i] or 1.0)
                        + (dev.get(str(y)) or {}).get(b, 0.0)
                    )
                )
                out[b].append(v)
        # bands combined linearly, then put back in order per year
        trip = [sorted(t) for t in zip(out["low"], out["central"], out["high"])]
        out = {"low": [t[0] for t in trip], "central": [t[1] for t in trip], "high": [t[2] for t in trip]}
        if max(abs(v) for v in out["low"] + out["high"]) < 1e-4:
            continue
        cert = weakest([x for x in (ro.get("certainty"), sl.get("certainty")) if x] or ["D"])
        add_extra(c, "statefin", "Nuclear projects and state loans from Russia", out, cert[0], sid)
        # the customs over-count comes out of "paid", which counts at Russia's net gain: apply_net_gain() rescales it
        p = (c.get("to_rus") or {}).get("pidx") or [1.0] * len(YEARS)
        cc_c = [0.0] + [
            (
                (cc.get(str(y)) or {}).get("central", 0.0)
                - sum((cc.get(str(z)) or {}).get("central", 0.0) for z in (2019, 2020, 2021)) / 3
            )
            / (p[i] or 1.0)
            for i, y in enumerate(YEARS)
            if y >= 2022
        ]
        c["extra"][-1]["_cc"] = [round(-v, 5) for v in cc_c]
        # repayments stopped because sanctions blocked the payment channels, not by the borrower's choice
        if iso3 in SANCTION_BLOCKED_LOANS:
            c["extra"][-1]["blocked"] = True


def apply_company_flows(countries: dict[str, dict], src: Sources) -> None:
    """Company money to Russia (company_flows.json, round 5), by the company's home country: the exit contribution to
    Russia's budget and the forced discount to Russian buyers when foreign companies sell out, and the profits that
    Russian-owned companies abroad send home, against the pre-war level (trusteeships that stopped them count the other
    way). Round 14: seizures without payment are recorded too. Round 14b (raised by the owner): seizures and forced exit
    costs (the forced discount and the exit contribution) are taken by Russia, not moved by the country's choice, so they
    are not in the totals; they are stored in c["taken"] and counted as a cost carried (a sacrifice)."""
    cf = load(GAPS / "company_flows.json")
    sid = src.add(
        "company_flows",
        "Company exits from Russia and Russian-owned companies abroad: Russian budget data, KSE and Yale exit lists, company reports, Bank of Russia balance of payments",
        "https://leave-russia.org/",
        cf.get("generated"),
        "exit contribution and forced discount by home country; profits of Russian-owned firms by host country; see research/2026-10/gaps/company_flows-notes.md",
    )
    # holdings whose owners were mostly international: their 2024 discount is not the home country's (central, EUR bn)
    # Yandex (company_flows-notes.md, Netherlands 4.7) and Polymetal's transfer, EUR 3.5bn (1.7-6.0) in the notes' text;
    # the notes' table rounds Kazakhstan's conduit total to 3.6
    conduit = {"NLD": 4.7, "KAZ": 3.5}
    # Russian-owned metals, mining and chemicals plants abroad (round 10, russian_owned_r10.json: Rusal's Aughinish in
    # Ireland, NLMK, Nornickel, EuroChem...), added to the oil, gas and bank subsidiaries above, by host country
    r10 = (load(GAPS / "russian_owned_r10.json") or {}).get("countries") or {}
    rid = src.add(
        "russian_owned_r10",
        "Russian-owned metals, mining and chemicals plants abroad (Rusal, NLMK, Nornickel, EuroChem): company filings and parent reports",
        "https://core.cro.ie/",
        "2026-10-18",
        "profits and dividends sent to the Russian parent, by host country; see research/2026-10/gaps/russian_owned_r10-notes.md",
    )
    hosts = dict(cf["countries"])
    for iso3, d in r10.items():
        old = hosts.get(iso3) or {}
        pr0, pr1 = old.get("profits_change_vs_prewar") or {}, d.get("profits_change_vs_prewar") or {}
        merged = {
            y: {b: (pr0.get(y) or {}).get(b, 0.0) + (pr1.get(y) or {}).get(b, 0.0) for b in ("low", "central", "high")}
            for y in set(pr0) | set(pr1)
        }
        cert = (
            weakest([old.get("profits_certainty"), d.get("profits_certainty")]) if old else d.get("profits_certainty")
        )
        hosts[iso3] = {**old, "profits_change_vs_prewar": merged, "profits_certainty": cert, "_r10": True}
    src.add(
        "seizures",
        "Company assets seized by Russia (decree 302 temporary management, expropriation by decree, court seizures, leased aircraft): owners' write-downs and book values, KSE Institute loss study and company reports",
        "https://kse.ua/wp-content/uploads/2025/03/KSE_Assessing-Foreign-Companies-Losses-in-Russia.pdf",
        "2026-10-19",
        "by the company's home country, in the year control was lost, minus anything received abroad; see research/2026-10/gaps/company_flows-notes.md (seizures)",
    )
    for iso3, d in hosts.items():
        c = countries.get(iso3)
        if not c:
            continue
        ex = {"low": [], "central": [], "high": []}
        for b in ex:
            for y in YEARS:
                v = (d.get("exit_contribution") or {}).get(str(y), {}).get(b, 0.0)
                dt = (d.get("discount_transfer") or {}).get(str(y), {})
                disc = dt.get(b, 0.0)
                if y == 2024 and iso3 in conduit and dt.get("central"):
                    disc *= max(0.0, 1 - conduit[iso3] / dt["central"])
                ex[b].append(v + disc)
        # round 14b (raised by the owner): what Russia took from the country's companies is a loss imposed on them and a
        # gain for Russia, not money the country chose to move. It leaves both headline numbers and the net (it reverses
        # round 5, which counted forced discounts and exit fees, and round 14 M4, which counted seizures) and is counted
        # in the cost view as a sacrifice, like the energy switching cost: c["taken"], positive = taken by Russia
        if any(ex["high"]):
            cert = weakest([d.get("exit_contribution_certainty"), d.get("discount_transfer_certainty")])
            add_taken(c, "exits", "Forced sales: discount and exit fee taken by Russia", ex, cert or "C", [sid])
        # assets Russia seized from the country's companies (decree 302 temporary management, expropriation by decree,
        # court seizures, leased aircraft kept), valued at the owners' write-downs or book value less anything received
        # abroad, in the year control was lost (round 14, audit M4)
        sz = d.get("seizure") or {}
        sz_y = {
            b: [(sz.get(str(y)) or {}).get(b, 0.0) if y >= 2022 else 0.0 for y in YEARS]
            for b in ("low", "central", "high")
        }
        if any(sz_y["high"]):
            add_taken(
                c,
                "seized",
                "Seized by Russia (companies' assets)",
                sz_y,
                d.get("seizure_certainty") or "C",
                [sid, "seizures"],
            )
        pr = d.get("profits_change_vs_prewar") or {}
        if pr:
            out = {
                b: [(pr.get(str(y)) or {}).get(b, 0.0) if y >= 2022 else 0.0 for y in YEARS]
                for b in ("low", "central", "high")
            }
            if max(abs(v) for v in out["low"] + out["high"]) > 1e-4:
                add_extra(
                    c,
                    "rusfirms",
                    "Profits sent to Russia by Russian-owned companies here",
                    out,
                    d.get("profits_certainty") or "D",
                    sid,
                )
                if d.get("_r10"):
                    c["extra"][-1]["src"].append(rid)


def apply_refugees_net(countries: dict[str, dict], src: Sources) -> None:
    """Refugee hosting at net cost (refugees_net.json, round 5): the cost minus the taxes and contributions working
    refugees pay (official for Czechia, Poland, Lithuania and Moldova; modelled elsewhere), with Poland's cost limited to
    refugee spending from its Aid Fund. Floored at zero on each country's 2022-2026 total: a budget gain is the refugees'
    own work, not a shift toward Russia. Used in both the shift and the cost view."""
    rn = load(GAPS / "refugees_net.json")
    sid = src.add(
        "refugees_net",
        "Refugees' taxes and contributions: Czech Labour Ministry, Polish Ministry of Finance, Lithuanian ministry, OECD and IAB employment data; Poland's Aid Fund (BGK) spending",
        "https://www.oecd.org/en/topics/sub-issues/migration-and-ukraine.html",
        rn.get("generated"),
        "net = hosting cost - refugees' tax revenue; see research/2026-10/gaps/refugees_net-notes.md",
    )
    donors = load(GAPS / "flowback2.json")["refugee_donor_funding"]
    for iso3, d in rn["countries"].items():
        a = (countries.get(iso3) or {}).get("aid")
        if not a or not d.get("gross") or not d.get("revenue"):
            continue
        # costs paid by donors are not the host's; Moldova's, Poland's, Bulgaria's, Georgia's and Armenia's figures are
        # already the host's own
        sh = (donors.get(iso3) or {}).get("donor_share") if iso3 not in ("MDA", "POL", "BGR", "GEO", "ARM") else None
        sh = sh or {"low": 0, "central": 0, "high": 0}
        gross = d["gross"]
        if iso3 in REFUGEE_SCOPE:
            # round 15: one definition, all levels of government; the reported partial figure (the low end) scaled by
            # the scope gap the broad estimates show for this host (central: the geometric mean, high: the largest).
            # Round 16 (review 5, H1; approved by the owner): the gap was measured on 2022 alone (the OECD figure is a
            # projection for 2022), so it scales 2022 only; later years keep the reported figure and its own range
            med, top = REFUGEE_SCOPE[iso3]
            gross = {y: ({"low": v["low"], "central": v["low"] * med**0.5, "high": max(v["high"], v["low"] * top)}
                         if y in REFUGEE_SCOPE_YEARS
                         else {**v, "central": v["low"]} if iso3 in SCOPE_IN_CENTRAL else dict(v))
                     for y, v in gross.items()}  # fmt: skip
        g = lambda y, b: (gross.get(str(y)) or {}).get(b, 0.0)  # noqa: E731
        r = lambda y, b: (d["revenue"].get(str(y)) or {}).get(b, 0.0)  # noqa: E731
        mid = [g(y, "central") * (1 - sh["central"]) - r(y, "central") for y in YEARS]
        lo = [g(y, "low") * (1 - sh["high"]) - r(y, "high") for y in YEARS]
        hi = [g(y, "high") * (1 - sh["low"]) - r(y, "low") for y in YEARS]

        # floored on the running total, so no period on the year slider shows hosting as a gain: a later surplus
        # offsets earlier costs, down to zero and no further (each band on its own; the bands stay ordered in total)
        def floor_running(arr: list[float]) -> list[float]:
            out, run = [], 0.0
            for v in arr:
                new = max(0.0, run + v)
                out.append(new - run)
                run = new
            return out

        band = [sorted(t) for t in zip(lo, mid, hi)]
        lo, mid, hi = (floor_running([b[i] for b in band]) for i in range(3))
        a["refugee_years"] = [round(v, 5) for v in mid]
        a["refugee_years_lo"] = [round(v, 5) for v in lo]
        a["refugee_years_hi"] = [round(v, 5) for v in hi]
        a["refugee_gross"] = round(sum(g(y, "central") for y in YEARS[1:]), 4)
        # round 15 (method band): the host's own gross cost per year, before refugees' taxes ("refugees at gross cost")
        a["refugee_gross_years"] = [round(g(y, "central") * (1 - sh["central"]), 5) for y in YEARS]
        # a range such as "A-B" counts at its weaker letter (round 11 audit: "A-B" was read as A); Poland's costs are
        # checked only against a press article, the primary pages being blocked (verify_r11_aid-notes.md), so C
        grades = (d.get("gross_certainty") or "C", d.get("revenue_certainty") or "C")
        letters = [ch for x in grades for ch in x if ch in CERT_ORDER]
        a["refugee_cert"] = weakest(letters + [REFUGEE_CERT_CAP.get(iso3, "A")])
        a["refugee_src"] = list(dict.fromkeys((a.get("refugee_src") or []) + [sid]))


_STAN_RATIO: dict = {}


def _stan_output_per_labour() -> dict:
    """OECD STAN 2021-2023 output per euro of labour cost by (country, industry), labour cost = D1 x EMP/SAL (the
    self-employed paid as employees are, as in net_gain_sellers.json). Read once."""
    if _STAN_RATIO:
        return _STAN_RATIO
    import csv

    raw = RESEARCH / "raw" / "oecd_stan"
    vals: dict = {}
    for f in ("stan_flows.csv", "stan_gtnxl_flows.csv", "stan_retail_rent_flows.csv", "stan_persons.csv",
              "stan_gtnxl_persons.csv", "stan_retail_rent_persons.csv"):  # fmt: skip
        with open(raw / f, newline="") as fh:
            for r in csv.DictReader(fh):
                if (
                    r["MEASURE"] in ("P1", "D1", "EMP", "SAL")
                    and r["TIME_PERIOD"] in ("2021", "2022", "2023")
                    and r["OBS_VALUE"]
                ):
                    vals.setdefault((r["REF_AREA"], r["ACTIVITY"]), {}).setdefault(r["MEASURE"], []).append(
                        float(r["OBS_VALUE"])
                    )
    for key, v in vals.items():
        if v.get("P1") and v.get("D1"):
            f = (
                statistics.mean(v["EMP"]) / statistics.mean(v["SAL"])
                if v.get("EMP") and v.get("SAL") and statistics.mean(v["SAL"])
                else 1.0
            )
            if statistics.mean(v["D1"]) * f > 0:
                _STAN_RATIO[key] = statistics.mean(v["P1"]) / (statistics.mean(v["D1"]) * f)
    return _STAN_RATIO


def refugee_work_gain(iso3: str, cfg: dict, ng: dict, own: bool = True) -> dict:
    """The host's net gain per euro of refugees' wages, [low, central, high] (refugees_gain.json): the industries
    refugees work in x each industry's net gain per euro of output (net_gain_sellers.json) x its output per euro of labour
    cost (OECD STAN). own=False uses the OECD median margins and output ratios (Ireland always; Poland at low and central)."""
    ratio = _stan_output_per_labour()
    shares = (cfg["sector_shares"].get(iso3) or cfg["sector_shares"]["default"])["shares"]

    def median_ratio(ind: str) -> float:
        return statistics.median(v for (c, i), v in ratio.items() if i == ind)

    def margin(ind: str, b: str) -> float:
        i = ((ng["countries"].get(iso3) or {}).get("industries") or {}).get(ind) if own else None
        if i:
            return i[b]
        return statistics.median(
            v["industries"][ind][b] for v in ng["countries"].values() if (v.get("industries") or {}).get(ind)
        )

    out = {}
    for b in ("low", "central", "high"):
        tot = 0.0
        for s, w in shares.items():
            ind = cfg["industry_map"].get(s)
            if not ind:
                continue
            r = (ratio.get((iso3, ind)) if own else None) or median_ratio(ind)
            tot += w * margin(ind, b) * r
        out[b] = tot
    return out


def refugee_wage_bill(iso3: str, d: dict, cfg: dict, b: str) -> list[float]:
    """Refugees' gross earnings in the host, EUR bn per year 2022-2026 (2026 January to August), band b."""
    py = [(d.get("person_years") or {}).get(str(y), 0) for y in YEARS[1:]]
    frac = [1, 1, 1, 1, 8 / 12]
    wb = cfg["wage_bills"]
    if iso3 == "DEU":
        s = wb["DEU"]
        return [
            (
                s["employed_above_feb2022"][i] * s["wage_eur_month"][b] * 12
                + s["minijobs"][i] * s["minijob_eur_month"] * 12
            )
            * frac[i]
            / 1e9
            for i in range(5)
        ]
    if iso3 == "CZE":
        s = wb["CZE"]
        return [
            py[i]
            * cfg["working_age_share_default"]
            * s["earnings_ratio"][i]
            * s["avg_wage_eur_k"]
            * 1e3
            * s["band"][b]
            / 1e9
            for i in range(5)
        ]
    if iso3 in wb and isinstance(wb[iso3], dict):
        s = wb[iso3]
        return [
            py[i]
            * cfg["working_age_share_default"]
            * s["employment_rate"][i]
            * s["wage_ratio"]
            * s["avg_wage_eur_k"]
            * 1e3
            * s["band"][b]
            / 1e9
            for i in range(5)
        ]
    m = d.get("revenue_model_inputs")
    if not m:
        return [0.0] * 5
    return [
        py[i]
        * m.get("working_age_share", cfg["working_age_share_default"])
        * m["employment_rate"][i]
        * cfg["wage_ratio_default"][b]
        * m["avg_wage_2024_eur_k"]
        * 1e3
        / 1e9
        for i in range(5)
    ]


def apply_refugees_gain(countries: dict[str, dict], src: Sources) -> None:
    """Round 24b (audit 24, D H1; approved by the owner 22 October 2026): refugee hosting at what governments actually
    spent, minus donor-paid shares, minus only the host's real gain on refugees' work (refugees_gain.json): refugees'
    wage bill x the host's net gain per euro of their wages x the genuinely extra share (0.5, 0.3-0.8). Under the
    one-seller rule refugees' wages, and the taxes on them, are their own income, not the host's gain, so their taxes are
    no longer subtracted (round 5 did), and there is no floor at zero (which made Czechia, Slovakia, Romania and the
    Baltic states count nothing). Poland: the OECD median margins at central and low, its own STAN margins at the high
    gain (the low end of hosting). Replaces apply_refugees_net()'s values; the gross series and grades stay from it."""
    cfg = load(GAPS / "refugees_gain.json")
    rn = load(GAPS / "refugees_net.json")["countries"]
    # the current sellers' margins in every build (net_gain_sellers_r13.json, the "normal_return" alternative's file,
    # has no G47 or GTNXL industries; the refugee rule postdates it)
    ng = json.loads((GAPS / "net_gain_sellers.json").read_text())
    donors = load(GAPS / "flowback2.json")["refugee_donor_funding"]
    sid = src.add(
        "refugees_gain",
        "Refugees' work and the industries they work in: Bundesagentur fuer Arbeit (Arbeitsmarkt kompakt, 30 Jan 2026), CBS (Oekraiense vluchtelingen, 1 Nov 2025, Tabel 4), ZUS and PAP (Poland), MPSV (Czechia), OECD-EMN employment rates; OECD STAN output and labour cost",
        "https://statistik.arbeitsagentur.de/DE/Statischer-Content/Statistiken/Themen-im-Fokus/Migration/Personen-nach-Staatsangehoerigkeiten/Generische-Publikationen/AM-kompakt-Auswirkungen-Fluchtmigration-Ukraine-Arbeitsmarkt.pdf",
        cfg.get("generated"),
        "hosting = actual spending - the host's net gain on refugees' work; see research/2026-10/gaps/refugees_gain-notes.md",
    )
    ex = cfg["extra"]
    for iso3, d in rn.items():
        a = (countries.get(iso3) or {}).get("aid")
        if not a or not d.get("gross"):
            continue
        sh = (donors.get(iso3) or {}).get("donor_share") if iso3 not in ("MDA", "POL", "BGR", "GEO", "ARM") else None
        sh = sh or {"low": 0, "central": 0, "high": 0}
        gross = d["gross"]
        if iso3 in REFUGEE_SCOPE:
            med, top = REFUGEE_SCOPE[iso3]
            gross = {y: ({"low": v["low"], "central": v["low"] * med**0.5, "high": max(v["high"], v["low"] * top)}
                         if y in REFUGEE_SCOPE_YEARS
                         else {**v, "central": v["low"]} if iso3 in SCOPE_IN_CENTRAL else dict(v))
                     for y, v in gross.items()}  # fmt: skip
        g = lambda y, b: (gross.get(str(y)) or {}).get(b, 0.0)  # noqa: E731
        own_margins = iso3 not in cfg["median_margins_for"]
        gpw = refugee_work_gain(iso3, cfg, ng, own=own_margins)
        wb = {b: [0.0] + refugee_wage_bill(iso3, d, cfg, b) for b in ("low", "central", "high")}
        gain = {b: [w * gpw[b] * ex[b] for w in wb[b]] for b in wb}
        if iso3 == "POL":
            # the owner's choice (option c of refugees_gain-notes.md): the two readings are the range. The OECD median at
            # central; Poland's own margins (its central case: central wage bill and extra share) as the high gain, the
            # low end of hosting, where that is larger than the median's high gain
            own_c = refugee_work_gain(iso3, cfg, ng, own=True)["central"]
            own_case = [w * own_c * ex["central"] for w in wb["central"]]
            if sum(own_case) > sum(gain["high"]):
                gain["high"] = own_case
        mid = [g(y, "central") * (1 - sh["central"]) - gain["central"][i] for i, y in enumerate(YEARS)]
        lo = [g(y, "low") * (1 - sh["high"]) - gain["high"][i] for i, y in enumerate(YEARS)]
        hi = [g(y, "high") * (1 - sh["low"]) - gain["low"][i] for i, y in enumerate(YEARS)]
        mid[0] = lo[0] = hi[0] = 0.0
        band = [sorted(t) for t in zip(lo, mid, hi)]
        a["refugee_years"] = [round(t[1], 5) for t in band]
        a["refugee_years_lo"] = [round(t[0], 5) for t in band]
        a["refugee_years_hi"] = [round(t[2], 5) for t in band]
        # the host's gain on refugees' work, kept for the panel and the check (EUR bn per year, central)
        a["refugee_work_gain"] = [round(v, 5) for v in gain["central"]]
        # round 38 (Kiel reconciliation): refugee person-years per year (2026: January to August), for the cost per
        # refugee-year in the panel (why a host with fewer refugees can spend more)
        a["refugee_person_years"] = [0] + [round((d.get("person_years") or {}).get(str(y), 0)) for y in YEARS[1:]]
        # the gross own spending's range (before the gain), the base of the refugee-spending flowback (refsp)
        a["refugee_gross_years_lo"] = [round(g(y, "low") * (1 - sh["high"]), 5) for y in YEARS]
        a["refugee_gross_years_hi"] = [round(g(y, "high") * (1 - sh["low"]), 5) for y in YEARS]
        a["refugee_src"] = list(dict.fromkeys((a.get("refugee_src") or []) + [sid]))


# Round 15 (raised by the owner): refugees hosted on the aggressor side are not support for Ukraine. Russia is not on
# the map at all (a destination; UNHCR's counts there rest on Russian data and include people the ICC and the UN
# Commission of Inquiry found were deported); Belarus, which the UN General Assembly deplored for its involvement in the
# invasion (A/RES/ES-11/1), keeps its hosting cost only as a label (c["ref_excluded"]), out of every total
CO_BELLIGERENT = {"BLR": "co-belligerent: its territory was used for the invasion (UN General Assembly A/RES/ES-11/1)"}


def aggressor_refugees(countries: dict[str, dict], src: Sources) -> None:
    """Round 15 (raised by the owner): Belarus's refugee hosting is shown as a label, not counted as support for
    Ukraine; Russia never has an entry (checked in check_data.py)."""
    sid = src.add(
        "co_belligerent",
        "UN General Assembly resolution ES-11/1 (2 March 2022): deplores the involvement of Belarus in this unlawful use of force against Ukraine",
        "https://documents.un.org/api/symbol/access?s=A/RES/ES-11/1&l=en&t=pdf",
        "2022-03-02",
        "Belarus's refugee hosting is shown as a label, not as support for Ukraine (round 15, raised by the owner)",
    )
    for iso3, why in CO_BELLIGERENT.items():
        a = (countries.get(iso3) or {}).get("aid")
        if not a or not any(a.get("refugee_years") or []):
            continue
        countries[iso3]["ref_excluded"] = {
            "years": a["refugee_years"], "years_lo": a.get("refugee_years_lo"), "years_hi": a.get("refugee_years_hi"),
            "cert": a.get("refugee_cert"), "src": list(a.get("refugee_src") or []) + [sid], "why": why,
        }  # fmt: skip
        for k in ("refugee_years", "refugee_years_lo", "refugee_years_hi"):
            if a.get(k):
                a[k] = [0.0] * len(a[k])
        a.pop("refugee_gross_years", None)


def party_to_war(countries: dict[str, dict], src: Sources) -> None:
    """Round 24b (the owner, 22 October 2026: "party to war, yes, for sure"): Belarus is on Russia's side of the war.
    Russia invaded Ukraine from Belarusian territory in February 2022; the UN General Assembly deplores Belarus's
    involvement (A/RES/ES-11/1) and the EU sanctioned it for it (Council Regulation 2022/355). Its numbers stay in its
    panel; the site gives it its own map category and leaves it out of every ranking and list (index.html PARTY_TO_WAR)."""
    sid = src.add(
        "belarus_party",
        "Belarus's involvement in Russia's invasion: Council Regulation (EU) 2022/355 of 2 March 2022 (restrictive measures in view of Belarus's involvement in the Russian aggression against Ukraine) and UN General Assembly resolution ES-11/1",
        "https://eur-lex.europa.eu/eli/reg/2022/355/oj",
        "2022-03-02",
        "Belarus is shown as a party to the war (round 24b, the owner)",
    )
    src.items[sid]["links"] = [
        {
            "title": "Council Regulation (EU) 2022/355 of 2 March 2022, recitals 1-4: Belarus's involvement in the Russian military aggression against Ukraine, which was launched in part from Belarusian territory",
            "url": "https://eur-lex.europa.eu/eli/reg/2022/355/oj",
            "kind": "primary",
        },
        {
            "title": "UN General Assembly resolution A/RES/ES-11/1 (2 March 2022), paragraph 10: deplores the involvement of Belarus in this unlawful use of force against Ukraine",
            "url": "https://documents.un.org/api/symbol/access?s=A/RES/ES-11/1&l=en&t=pdf",
            "kind": "primary",
        },
    ]
    for iso3 in ("BLR",):
        c = countries.get(iso3)
        if c:
            c["party_to_war"] = {"side": "russia", "src": ["co_belligerent", sid]}
    # Round 29 (owner, 23 October 2026: "I think North Korea is a party to the war. Maybe."): North Korea's troops fought
    # for Russia in the Kursk region from late 2024, confirmed by North Korea itself on 28 April 2025 (KCNA), and it
    # supplied shells and missiles (UN MSMT/2025/1). To undo: remove this block and "PRK" from PARTY_TO_WAR in index.html
    nk = src.add(
        "north_korea_party",
        "North Korea's troops in Russia's war: UN Multilateral Sanctions Monitoring Team report MSMT/2025/1 and North Korea's own confirmation of 28 April 2025",
        "https://msmt.info/api/file/download/18858",
        "2025-04-28",
        "North Korea is shown as a party to the war (round 29, the owner)",
    )
    src.items[nk]["links"] = [
        {
            "title": "MSMT/2025/1 (29 May 2025): Unlawful military cooperation between North Korea and Russia, paragraphs 25-26: over 11,000 troops deployed in late 2024, over 3,000 more in January-March 2025",
            "url": "https://msmt.info/api/file/download/18858",
            "kind": "primary",
        },
        {
            "title": "Kyiv Independent (28 April 2025): North Korea confirms for first time it has deployed troops to fight alongside Russia in Kursk Oblast",
            "url": "https://kyivindependent.com/north-korea-confirms-for-first-time-it-has-deployed-troops-to-fight-alongside-russia-in-kursk-oblast/",
            "kind": "secondary",
        },
        {
            "title": "NBC News (28 April 2025): North Korea confirms it sent troops to Russia, calling them heroes",
            "url": "https://www.nbcnews.com/world/asia/north-korea-confirms-sent-troops-russia-calling-heroes-rcna203245",
            "kind": "secondary",
        },
    ]
    c = countries.get("PRK")
    if c:
        c["party_to_war"] = {"side": "russia", "src": [nk]}


def refugee_common_cost(countries: dict[str, dict]) -> None:
    """Round 16 (review 5, H2; approved by the owner): a method-band alternative that values hosting at one common net
    cost per refugee person-year for every host, instead of what each host actually spent (the map keeps each host's
    actual net cost). Each year's common cost is the hosts' total net cost over their total person-years (refugees.json
    person_years; Belarus, a co-belligerent, left out of both); a host whose costs donors paid keeps that share off
    (refugee_donor_share). Written as aid.refugee_common_years; index.html calc(c, y, {refCommon: true})."""
    py = {i: d.get("person_years") or {} for i, d in load(GAPS / "refugees.json")["countries"].items()}
    hosts = [
        i
        for i, c in countries.items()
        if py.get(i) and i not in CO_BELLIGERENT and (c.get("aid") or {}).get("refugee_years")
    ]
    common = [0.0] * len(YEARS)
    for j, y in enumerate(YEARS):
        if y < 2022:
            continue
        cost = sum(countries[i]["aid"]["refugee_years"][j] for i in hosts)
        people = sum(py[i].get(str(y), 0) for i in hosts)
        common[j] = cost / people if people else 0.0
    META_R16["refugee_common_cost_eur_per_person_year"] = {
        str(y): round(v * 1e9) for y, v in zip(YEARS, common) if y > 2021
    }
    for i in hosts:
        a = countries[i]["aid"]
        sh = (a.get("refugee_donor_share") or {}).get("central", 0.0)
        a["refugee_common_years"] = [round(py[i].get(str(y), 0) * common[j] * (1 - sh), 5) for j, y in enumerate(YEARS)]


def refugee_flowback(countries: dict[str, dict]) -> None:
    """Round 16 (raised by review 5, M3; approved by the owner): refugee hosting money is spent in the host economy
    (rent, food, retail and other services), like weapons bought at home, so its real gain to the host is subtracted
    under the same rule as other money flowing back: the host's net gain per euro (taxes on production plus profit above
    a normal return) x the genuinely extra share of civilian spending (value_kept.json flowback_other; the median where
    missing). Round 16b (check 16, N4; approved by the owner): the net gain is that of the industries refugees' money
    flows through, net_gain_sellers.json group "refugee_spending": retail trade (G47), accommodation and food (I) and
    renting of real estate without owner-occupiers' imputed rent (L less L68A, where STAN publishes L68A); the mean of
    those the host reports, the OECD median where it is not in STAN. Round 16 used the broad services group (I and
    GTNXL), which holds finance and ICT, where refugees spend little (Poland: 0.181 -> 0.161). Stored as
    aid.refugee_back_f (low, central, high); calc() applies it to the hosting cost counted (net of refugees' taxes)."""
    ng, vk = load(GAPS / "net_gain_sellers.json"), load(GAPS / "value_kept.json")["countries"]
    med = statistics.median(v["flowback_other"]["extra"]["central"] for v in vk.values() if v.get("flowback_other"))
    for iso3, c in countries.items():
        a = c.get("aid") or {}
        if not any(a.get("refugee_years") or []):
            continue
        g = ((ng["countries"].get(iso3) or {}).get("groups") or {}).get("refugee_spending") or ng["oecd_median"][
            "refugee_spending"
        ]
        e = ((vk.get(iso3) or {}).get("flowback_other") or {}).get("extra") or {
            "low": med * 0.5,
            "central": med,
            "high": min(1.0, med * 1.5),
        }
        a["refugee_back_f"] = _gain_x_extra(g, e)


# filled during the build, written to data.json meta (round 16)
META_R16: dict = {}

# refugee costs whose figures were checked only against secondary sources (verify_r11_aid-notes.md): letter at most C
REFUGEE_CERT_CAP = {"POL": "C"}
# Round 15 (review 4, M5; approved by the owner): refugee hosting at one definition for every host, the total cost to
# all levels of government minus the taxes and contributions refugees pay. Hosts whose reported figure covers part of
# government only are scaled by the gap between broad all-government estimates and that figure in 2022 (refugees-notes.md
# and refugees_net-notes.md): (median ratio, largest ratio). Germany: federal spending (Drs. 20/13346, KPB 217) against
# the OECD International Migration Outlook 2022 estimate (EUR 6.8bn, 1.24) and Kiel's estimate (1.53). Poland: the Aid
# Fund's refugee spending (PLN 11.3bn in 2022, Ministry of Finance) against OECD (EUR 8.36bn, 3.47), Kiel (3.68) and the
# Council for Cooperation with Ukraine (3.81); the first two as reported in the press, the OECD table itself was not
# reached. Central = reported x sqrt(median), the rule round 5 used for Germany and Switzerland; low = reported only
REFUGEE_SCOPE = {"DEU": (1.385, 1.53), "POL": (3.68, 3.81)}
# Round 16 (review 5, H1; approved by the owner): the years the scope gap applies to. It was measured on 2022 alone (the
# OECD figure is a projection for 2022 with a fixed refugee population; Poland ended most free accommodation and host
# payments in 2023, and Germany moved Ukrainians to federal Bürgergeld from June 2022), so it says nothing about later
# years: 2023-2026 keep the reported figure with its own range (refugees_net.json)
REFUGEE_SCOPE_YEARS = {"2022"}
# Germany's central values in refugees_net.json already carry the same 2022 gap in every year (round 5's rule: the
# geometric mean of federal spending and federal x 1.55), so from 2023 its central is the reported federal figure; the
# high end keeps the gap as the possible Länder and municipal share. Poland's later central values are the Aid Fund's own
# refugee spending (Ministry of Finance) with their own range, and stay
SCOPE_IN_CENTRAL = {"DEU"}


def apply_ua_arms_purchases(countries: dict[str, dict], src: Sources) -> None:
    """Arms Ukraine bought abroad, with its own budget or donors' cash (Czech ammunition initiative, German Patriots from
    the US, Bulgarian and Serbian shells via third countries): money flowing back to the seller, which keeps the
    profit (ua_arms_purchases.json, round 5). Only what is not already in sales to Ukraine (customs) or in donors'
    own-industry shares; stored as gross sales (flowback.arms), the map counts the profit like other flowback."""
    ua = load(GAPS / "ua_arms_purchases.json")
    sid = src.add(
        "ua_arms",
        "Arms Ukraine bought abroad: Czech trade ministry licence reports, Czech ammunition initiative, Bulgarian defence exports, Kiel item coding, press investigations",
        "https://www.mpo.gov.cz/",
        ua.get("generated"),
        "only sales not already in customs trade or donors' own-industry flowback; see research/2026-10/gaps/ua_arms_purchases-notes.md",
    )
    for iso3, d in ua["countries"].items():
        c = countries.get(iso3)
        add = d.get("add_to_map_gross_eur_bn") or {}
        if not c or not add:
            continue
        broker = (d.get("broker_margin_profit") or {}).get("by_year") or {}
        fb = c.setdefault("flowback", {"src": []})
        for k, b in (("arms", "central"), ("arms_lo", "low"), ("arms_hi", "high")):
            # Czech brokers' commission is profit already: stored as the gross that gives it at the 20% margin.
            # SUPERSEDED (round 11 audit): apply_money_ledger() deletes these values. If this path were used again, the
            # /0.2 gross-up would count the commission several times over under the money rule (value kept x extra)
            fb[k] = [
                round((add.get(str(y)) or {}).get(b, 0.0) + (broker.get(str(y)) or {}).get(b, 0.0) / 0.2, 5)
                for y in YEARS
            ]
        fb["arms_cert"] = d.get("certainty") or "C"
        fb["arms_src"] = [sid]


def apply_loans_value(countries: dict[str, dict], src: Sources) -> None:
    """Loans and guarantees at their economic value to Ukraine (loans_value.json, round 5; rates and losses measured in
    round 12 by loan_rates.py): face value minus the present value of Ukraine's repayments at its normal 2021 rate
    (6.7%), times one minus the expected loss of the lender's creditor class; high: the promised war yield of the payout
    year. Stored as yearly changes against face value, for the country's own aid and its share of EU-level aid. The cost
    view uses the lender's cost: the same terms and losses at the lender's own funding rate (round 12, was 26% of face).
    New multilateral lending (IMF, World Bank, EBRD, CEB) is credited by shareholding. site/content/method/loans.md"""
    lv = load(GAPS / "loans_value.json")
    sid = src.add(
        "loans_value",
        "Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding",
        "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx",
        lv.get("generated"),
        "gift = cheaper interest at Ukraine's 2021 rate (6.7%) plus the lender's measured expected loss; high: the war"
        " yield of the payout year (15-40%); see How it works",
    )
    bands = (("c", "central"), ("l", "low"), ("h", "high"))
    for iso3, d in lv["countries"].items():
        c = countries.get(iso3)
        a = (c or {}).get("aid")
        if not a:
            continue
        net = d.get("net_adjustment_vs_face") or {}
        bil = d.get("bilateral") or {}
        face_b, ev_b = bil.get("face_value") or {}, bil.get("economic_value") or {}
        own = {
            k: [0.0 if y < 2022 else (ev_b.get(str(y)) or {}).get(b, 0.0) - face_b.get(str(y), 0.0) for y in YEARS]
            for k, b in bands
        }
        tot = {k: [0.0 if y < 2022 else (net.get(str(y)) or {}).get(b, 0.0) for y in YEARS] for k, b in bands}
        if any(tot["c"]) or any(own["c"]):
            a["loan_adj_own"] = {k: [round(v, 5) for v in own[k]] for k in own}
            a["loan_adj_eu"] = {k: [round(t - o, 5) for t, o in zip(tot[k], own[k])] for k in tot}
            if any(a["loan_adj_eu"]["c"]) and sid not in a.setdefault("eu_src", []):
                a["eu_src"].append(sid)
            face = sum((d.get("loans_guarantees_face_in_map") or {}).values())
            ev = sum((v or {}).get("central", 0.0) for v in (d.get("loans_guarantees_economic_value") or {}).values())
            # the cost view uses the lender's cost (round 12): the same terms and expected losses, discounted at the
            # lender's own funding rate, per loan item; it replaces LOAN_GRANT_ELEMENT (26% of face for every loan)
            lc = d.get("loans_guarantees_lender_cost") or {}
            cost = {b: sum((v or {}).get(b, 0.0) for v in lc.values()) for b in ("low", "central", "high")}
            if face:
                a["loans_face"], a["loans_grant_eq"], a["loans_value_ukraine"] = (
                    round(face, 3),
                    round(cost["central"] if lc else face * LOAN_GRANT_ELEMENT, 3),
                    round(ev, 3),
                )
                if lc:
                    a["loans_grant_eq_lo"], a["loans_grant_eq_hi"] = round(cost["low"], 3), round(cost["high"], 3)
            if sid not in a.setdefault("src", []):
                a["src"].append(sid)
        ml = (d.get("multilateral_new") or {}).get("economic_value") or {}
        if ml:
            out = {
                b: [0.0 if y < 2022 else -(ml.get(str(y)) or {}).get(b, 0.0) for y in YEARS]
                for b in ("low", "central", "high")
            }
            out["low"], out["high"] = out["high"], out["low"]
            if max(abs(v) for v in out["low"]) > 1e-4:
                add_extra(
                    c,
                    "multilat",
                    "Share of new IMF, World Bank and EBRD lending",
                    out,
                    (d.get("certainty") or {}).get("multilateral_new", "C"),
                    sid,
                )


def apply_russian_arms(countries: dict[str, dict], src: Sources) -> None:
    """Payments to Russia for Russian weapons, against what was expected without the war (russian_arms_exports.json,
    round 5). Arms are almost entirely outside customs data; the small part inside it is taken out. Much of the fall
    came from Russia keeping its output for its own army, not from the buyer (not_buyer_choice_share, in the notes)."""
    ra = load(GAPS / "russian_arms_exports.json")
    # round 6: 18 more buyers found for the "rest of world" (arms_r6.json), and Iran's payments partly settled in drones
    # and missiles already counted as weapons sent to Russia: that part is taken off Iran's payments, not off its drones
    r6 = load(GAPS / "arms_r6.json")
    ra["countries"].update({k: v for k, v in r6["countries"].items() if k != "ROW"})
    ov = r6["iran_overlap"]["overlap_eur_bn"]
    irn = ra["countries"].get("IRN")
    if irn:
        for y, v in (irn.get("change_vs_expected") or {}).items():
            o = ov.get(y) or {}
            # the two ranges are independent: combined in quadrature around the middle, not end to end
            oc, mid = o.get("central", 0.0), v["central"] + o.get("central", 0.0)
            irn["change_vs_expected"][y] = {
                "low": mid - math.hypot(v["central"] - v["low"], oc - o.get("low", oc)),
                "central": mid,
                "high": mid + math.hypot(v["high"] - v["central"], o.get("high", oc) - oc),
            }
        ex = irn.get("change_vs_expected_ex_customs") or {}
        for y in ex:
            ex[y] = ex[y] + (ov.get(y) or {}).get("central", 0.0)
    sid = src.add(
        "russian_arms",
        "Russian arms exports by buyer: Rosoboronexport and FSVTS statements, SIPRI fact sheets, contract reporting (S-400, Su-35, Su-57)",
        "https://www.sipri.org/databases/armstransfers",
        ra.get("generated"),
        "change against expected payments, customs part removed; see research/2026-10/gaps/russian_arms_exports-notes.md",
    )
    for iso3, d in ra["countries"].items():
        c = countries.get(iso3)
        ch, ex = d.get("change_vs_expected") or {}, d.get("change_vs_expected_ex_customs") or {}
        if not c or not ch:
            continue
        out = {"low": [], "central": [], "high": []}
        for y in YEARS:
            v = ch.get(str(y)) or {}
            # the customs part moves the whole band; change > 0 = paid less = toward Ukraine
            off = (ex.get(str(y), v.get("central", 0.0)) - v.get("central", 0.0)) if v else 0.0
            for b, nb in (("low", "high"), ("central", "central"), ("high", "low")):
                out[b].append(-(v.get(nb, 0.0) + off) if y >= 2022 else 0.0)
        if max(abs(x) for x in out["low"] + out["high"]) < 1e-4:
            continue
        add_extra(c, "rusarms", "Weapons bought from Russia", out, d.get("certainty") or "D", sid)
        c["extra"][-1]["not_choice"] = (d.get("not_buyer_choice_share") or {}).get("central")


def apply_payment_agents(countries: dict[str, dict], src: Sources) -> None:
    """Fees that payment agents in third countries earn for settling Russia's trade outside normal banking
    (payment_channels.json, round 6): not in customs values or services data. Only the share kept by residents (the
    rest belongs to Russian-owned networks), against 2021. Already a margin: money earned from Russia."""
    pc = load(GAPS / "payment_channels.json")
    sid = src.add(
        "payment_agents",
        "Payment agents settling Russia's trade: Bank of Russia balance of payments, Russian Finance Ministry and customs letters on agent commissions, press and sanctions reporting",
        "https://www.cbr.ru/eng/statistics/macro_itm/svs/",
        pc.get("generated"),
        "fees kept by residents of the agent's country, against 2021; see research/2026-10/gaps/payment_channels-notes.md",
    )
    for iso3, d in pc["countries"].items():
        c, tr = countries.get(iso3), d.get("to_rus") or {}
        if not c or not tr:
            continue
        out = {
            b: [0.0 if y < 2022 else (tr.get(str(y)) or {}).get(b, 0.0) for y in YEARS]
            for b in ("low", "central", "high")
        }
        add_extra(
            c,
            "agents",
            "Fees earned settling Russia's trade (payment agents)",
            out,
            (d.get("certainty") or "D")[0],
            sid,
        )


# Belgian corporate tax on Euroclear's Russian-asset income, pledged to Ukraine and so already in Belgium's aid
# (frozen_assets.json overlaps; 2024 and 2025 from frozen_assets-notes.md item 3; 2026 less than 2025, a guess:
# site/content/changelog.md, constants)
BEL_EUROCLEAR_TAX = {2024: 1.7, 2025: 1.0, 2026: 0.5}
# share of a clearing house's frozen-reserve return credited to its host; the rest goes to all EU members by their
# share of EU-level aid, because the freeze is an EU decision (owner, round 7; judgement, site/content/changelog.md)
HOST_SHARE = 1 / 3


def apply_frozen_reserves(countries: dict[str, dict], src: Sources) -> None:
    """The return Russia's frozen central-bank reserves would have earned without the freeze (frozen_assets.json,
    round 7): per holding country, at the rates each currency paid each year; the frozen amount itself is not counted.
    Money Russia did not get, so it counts toward Ukraine on the Russia balance. Euroclear (Belgium) and Clearstream
    (Luxembourg): a third to the host, two thirds to all EU members; Belgium's tax on that income, already in its aid,
    is taken off first. The low end allows for Russia having spent part of the reserves without a freeze (x0.8; the
    notes guess 10-30%, frozen_assets-notes.md; judgement, site/content/changelog.md).
    Private assets are their own part since round 39 (apply_frozen_private)."""
    fa = load(GAPS / "frozen_assets.json")
    sid = src.add(
        "frozen_reserves",
        "Return denied on Russia's frozen central-bank reserves: Euroclear reports, Swiss SECO, EU Commission, G7 and central bank statements; rates per currency and year",
        "https://www.euroclear.com/newsandinsights/en/press.html",
        fa.get("generated"),
        "per holding country; Euroclear and Clearstream shared with all EU members; see research/2026-10/gaps/frozen_assets-notes.md",
    )
    bands = ("low", "central", "high")
    credit = {i: {b: [0.0] * len(YEARS) for b in bands} for i in countries}
    eu = {i: c["aid"]["eu_share"] for i, c in countries.items() if i in EU27 and (c.get("aid") or {}).get("eu_share")}
    eu_sum = sum(eu.values()) or 1
    cert = {}
    for iso3, d in fa["countries"].items():
        if iso3 not in countries:
            continue
        cert[iso3] = (d.get("certainty") or "C")[0]
        ret = d["return_denied_eur_bn"]
        for i, y in enumerate(YEARS):
            r = ret.get(str(y)) or {}
            tax = BEL_EUROCLEAR_TAX.get(y, 0.0) if iso3 == "BEL" else 0.0
            for b in bands:
                v = max(0.0, r.get(b, 0.0) - tax) * (0.8 if b == "low" else 1.0)
                if iso3 in ("BEL", "LUX"):
                    credit[iso3][b][i] += v * HOST_SHARE
                    for j, sh in eu.items():
                        credit[j][b][i] += v * (1 - HOST_SHARE) * sh / eu_sum
                        cert.setdefault(j, "C")
                else:
                    credit[iso3][b][i] += v
    for iso3, cr in credit.items():
        if not any(cr["high"]):
            continue
        # less money to Russia: negative toward Russia, the low end of the return is the least toward Ukraine
        out = {"low": [-v for v in cr["high"]], "central": [-v for v in cr["central"]], "high": [-v for v in cr["low"]]}
        # round 14 (audit M6, approved by the owner): its own line, "Russian money frozen", not part of "less paid to
        # Russia" in any wording; it stays in the balance with Russia (money Russia did not get), not in payments
        add_extra(
            countries[iso3],
            "frozen",
            "Russian money frozen (return Russia lost on its reserves)",
            out,
            cert.get(iso3, "C"),
            sid,
        )


def apply_frozen_private(countries: dict[str, dict], src: Sources) -> None:
    """Round 39 (owner: "fix it"): the return Russian private owners lost on assets frozen abroad (private_frozen_r39.json):
    sanctioned people's and firms' accounts and holdings, and Russian investors' securities blocked at Euroclear and
    Clearstream through the sanctioned NSD. The same rule as the reserves: money Russia did not get, on the "Russian money
    frozen" line, added to the net only; the low end x0.8; the depository part (csd) a third to its host and two thirds
    to EU members by their share of EU-level aid (the NSD listing is an EU decision), national freezes to the holding
    country. Every national figure used excludes the central bank, so nothing is counted twice with the reserves; the EU
    block that is not split by country is left out. Type-C balances blocked in Russia are not here (a marker at most)."""
    pf = load(GAPS / "private_frozen_r39.json")
    sid = src.add(
        "frozen_private",
        "Return lost on Russian private assets frozen abroad: EU Commission, Belgian Treasury, OFSI, Swiss SECO, national authorities, Bank of Russia statements on securities blocked at Euroclear and Clearstream",
        "https://finance.ec.europa.eu/eu-and-world/sanctions-restrictive-measures/sanctions-adopted-following-russias-military-aggression-against-ukraine_en",
        pf.get("generated"),
        "per holding country; the depository part shared with all EU members; see research/2026-10/gaps/private_frozen_r39-notes.md",
    )
    bands = ("low", "central", "high")
    credit = {i: {b: [0.0] * len(YEARS) for b in bands} for i in countries}
    eu = {i: c["aid"]["eu_share"] for i, c in countries.items() if i in EU27 and (c.get("aid") or {}).get("eu_share")}
    eu_sum = sum(eu.values()) or 1
    cert: dict[str, str] = {}
    worse = lambda a, b: max(a, b)  # noqa: E731  (letters: "D" is the weakest)
    for d in pf["holdings"].values():
        iso3 = d["iso3"]
        if iso3 not in countries:
            continue
        letter = (d.get("certainty") or "C")[0]
        for i, y in enumerate(YEARS):
            r = d["return_lost_eur_bn"].get(str(y)) or {}
            for b in bands:
                v = r.get(b, 0.0) * (0.8 if b == "low" else 1.0)
                if d.get("component") == "csd":
                    credit[iso3][b][i] += v * HOST_SHARE
                    for j, sh in eu.items():
                        credit[j][b][i] += v * (1 - HOST_SHARE) * sh / eu_sum
                        cert[j] = worse(cert.get(j, "C"), letter) if j != iso3 else cert.get(j, letter)
                else:
                    credit[iso3][b][i] += v
        cert[iso3] = worse(cert.get(iso3, letter), letter)
    for iso3, cr in credit.items():
        if not any(cr["high"]):
            continue
        out = {"low": [-v for v in cr["high"]], "central": [-v for v in cr["central"]], "high": [-v for v in cr["low"]]}
        add_extra(
            countries[iso3],
            "frozen_priv",
            "Russian money frozen (return lost on private Russian assets)",
            out,
            cert.get(iso3, "C"),
            sid,
        )


def apply_svc_ukr(countries: dict[str, dict], src: Sources) -> None:
    """Round 39 (owner: "fix it"): extra services sold to Ukraine above the no-war level (svc_ukr_r39.json): transport on
    the solidarity lanes and the like (the exporter's own report, without government services and repair), and
    Ukrainians' own card spending abroad (refugees' spending less the fall in seasonal workers'). Money flowing back to
    the seller, at its real gain: travel at the refugee-spending net gain x genuinely extra, the rest at the services
    net gain x genuinely extra (the shares the file carries, product low/central/high). Stored per year (EUR bn, may be
    negative); calc() sums the years and floors the total at zero, as for extra goods sold to Ukraine. Host
    governments' refugee spending is not here (it flows back as refugee hosting, refsp)."""
    sv = load(GAPS / "svc_ukr_r39.json")
    sid = src.add(
        "svc_ukr",
        "Services sold to Ukraine: Eurostat bop_its6_det (partner UA), OECD-WTO BaTiS, National Bank of Ukraine services imports and card spending abroad",
        "https://ec.europa.eu/eurostat/databrowser/view/bop_its6_det/default/table",
        sv.get("generated"),
        "against the 2021 level; see research/2026-10/gaps/svc_ukr_r39-notes.md",
    )
    keys = {"c": "central", "l": "low", "h": "high"}
    for iso3, d in sv["countries"].items():
        c = countries.get(iso3)
        ex = d.get("extra_eur_bn") or {}
        if not c or not ex:
            continue
        tr, nt, sh = ex.get("travel_ukrainian_money") or {}, ex.get("nontravel") or {}, d.get("shares") or {}
        pt = (sh.get("travel") or {}).get("product_low_central_high") or [0, 0, 0]
        pn = (sh.get("nontravel") or {}).get("product_low_central_high") or [0, 0, 0]
        out = {}
        for k, b in keys.items():
            i = ("low", "central", "high").index(b)
            out[k] = [0.0] + [
                round((tr.get(b) or {}).get(str(y), 0.0) * pt[i] + (nt.get(b) or {}).get(str(y), 0.0) * pn[i], 5)
                for y in YEARS[1:]
            ]
        if not any(abs(v) > 1e-6 for v in out["h"]):
            continue
        c["svc_ukr"] = {**out, "cert": (d.get("certainty") or "C")[0], "src": [sid]}


def apply_remittances(countries: dict[str, dict], src: Sources) -> None:
    """Migrant workers' remittances from Russia (remittances.json, round 7): a marker, not in the totals (round 13b,
    owner's decision after the round-13 audit; site/content/changelog.md). They are individuals' wages, not a country's choice;
    the money flows from Russia to the migrant's home; and the real gain over the migrant's alternatives is small and
    hard to measure. The marker is the change in what migrants sent from Russia against the level expected without the
    war (labour remittances; relocants' transfers stay out), per year, with its range: the reported range of what was
    sent and of the expected level, combined as independent errors. remittances_r13.json (the migrant's net gain) is
    kept as research and is no longer used."""
    rm = load(GAPS / "remittances.json")
    sid = src.add(
        "remittances",
        "Remittances from Russia: receiving central banks' transfers by country of origin (CBU, NBKR, CBA, NBG and others), World Bank; relocants' transfers split out",
        "https://api.worldbank.org/v2/country/TJK;UZB;KGZ/indicator/BX.TRF.PWKR.CD.DT?format=json&date=2017:2025",
        rm.get("generated"),
        "labour remittances against the expected level; a marker, not in the totals; see research/2026-10/gaps/remittances-notes.md",
    )
    for iso3, d in rm["countries"].items():
        c = countries.get(iso3)
        lab, exp = d.get("labour_eur_bn") or {}, d.get("expected_labour_eur_bn") or {}
        if not c or not lab or not exp:
            continue
        out: dict[str, list[float]] = {"years": [], "years_lo": [], "years_hi": [], "sent": []}
        for y in YEARS:
            ly, ey = lab.get(str(y)), exp.get(str(y))
            if not ly or not ey:
                for k in out:
                    out[k].append(0.0)
                continue
            mid = ly["central"] - ey["central"]
            lo = math.hypot(ly["central"] - ly["low"], ey["high"] - ey["central"])
            hi = math.hypot(ly["high"] - ly["central"], ey["central"] - ey["low"])
            out["years"].append(round(mid, 5))
            out["years_lo"].append(round(mid - lo, 5))
            out["years_hi"].append(round(mid + hi, 5))
            out["sent"].append(round(ly["central"], 5))
        if not any(out["sent"]):
            continue
        c["remit"] = out | {"cert": (d.get("certainty") or "C")[0], "src": [sid]}


def apply_chpl(countries: dict[str, dict], src: Sources) -> None:
    """Sales to Russia of goods its weapons need (the EU/US/UK/Japan Common High Priority List, 50 HS-6 codes; chpl.json,
    round 7), per shipping country: shown as a marker, not added to the totals (the money is already in trade)."""
    ch = load(GAPS / "chpl.json")
    sid = src.add(
        "chpl",
        "Sales to Russia of Common High Priority List goods: exporters' customs records (Eurostat, UN Comtrade), adjusted toward Russian dispatch records (KSE)",
        "https://www.bis.gov/articles/russia-export-controls-list-common-high-priority-items",
        ch.get("generated"),
        "per shipping country; a marker, not in the totals; see research/2026-10/gaps/chpl-notes.md",
    )
    for iso3, d in ch["countries"].items():
        c, ex = countries.get(iso3), d.get("exports_to_rus_eur_bn") or {}
        if not c or not ex:
            continue
        c["chpl"] = {k: [round((ex.get(str(y)) or {}).get(b, 0.0), 4) for y in YEARS]
                     for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high"))}  # fmt: skip
        c["chpl"] |= {"cert": (d.get("certainty") or "C")[0], "src": [sid]}


# share of fuel in each country's extra sales to Ukraine, 2021 to 2023, from UN Comtrade (Ukraine's imports by partner,
# HS 27 against the total; value_kept-notes.md section 2); other countries 0.125 (assumed, as there)
UA_FUEL_SHARE = {"GRC": 0.9, "LTU": 0.9, "POL": 0.68, "SVK": 0.68, "ROU": 0.68, "TUR": 0.25, "BGR": 0.17}
UA_FUEL_DEFAULT = 0.125


def _gain_x_extra(g: dict, e: dict) -> list[float]:
    """Net gain share x genuinely extra, (low, central, high): the two ranges combined as independent errors (in
    absolute terms, since a gain share can be 0)."""
    c = g["central"] * e["central"]
    lo = math.hypot(e["central"] * (g["central"] - g["low"]), g["central"] * (e["central"] - e["low"]))
    hi = math.hypot(e["central"] * (g["high"] - g["central"]), g["central"] * (e["high"] - e["central"]))
    return [round(max(0.0, c - lo), 4), round(c, 4), round(min(g["high"] * e["high"], c + hi), 4)]


def apply_value_kept(countries: dict[str, dict], src: Sources) -> None:
    """The money rule for money a country earns. Round 13 (audit, one valuation rule for every seller): a sale counts
    at the seller's net gain, as Russia's and Ukraine's do: taxes on production plus profit above a normal return,
    as a share of the sale, by industry and country (net_gain_sellers.json, from OECD STAN), x how much of it is
    genuinely extra (value_kept.json, round 6). Until round 12 the first factor was the value kept in the economy (OECD
    TiVA domestic value added, which includes wages); those products are kept as vk_old for the method-sensitivity
    band. Stored as factors (low, central, high) per kind of earning; calc() applies them."""
    vk = load(GAPS / "value_kept.json")
    ng = load(GAPS / ("net_gain_sellers_r13.json" if "normal_return" in ALT else "net_gain_sellers.json"))
    sid = src.add(
        "value_kept",
        "Genuinely extra share of money earned: production ramp-ups, trade-redirection studies (value_kept.json); value kept in the economy before round 13: OECD Trade in Value Added (TiVA, 2025 edition)",
        "https://sdmx.oecd.org/sti-public/rest/data/OECD.STI.PIE,DSD_TIVA_MAINSH@DF_MAINSH,1.1/EXGR_DVA..BTE+C+C19+C25+C26+C28+C302T309+GTN+H50+I.W.PT_EXGR.A?startPeriod=2018&format=csv",
        vk.get("generated"),
        "genuinely extra, per country and kind of earning; see research/2026-10/gaps/value_kept-notes.md",
    )
    gid = src.add(
        "net_gain_sellers",
        "Sellers' net gain per euro of sales (taxes on production plus profit above a normal return of 5% a year above inflation after company tax, plus the country's risk premium): OECD STAN database, 2025 edition, by country and industry; Damodaran country risk premiums",
        "https://sdmx.oecd.org/public/rest/data/OECD.STI.PIE,DSD_STAN@DF_STAN_2025,1.0/A..C+C19+C25+C252+C26+C28+C30+C303+C304+H50+I+GTN+K+K65+_T.P1+D29X39+B2A3N+B2A3G+P51C+D1.V.XDC?startPeriod=2017&endPeriod=2024&format=csv",
        ng.get("generated"),
        "economies outside STAN take the OECD median of the industry; services without real estate (STAN GTNXL); round 13's 9% nominal is the method band's old-method bound; see research/2026-10/gaps/net_gain_sellers-notes.md",
    )
    keys = {"fw": ("flowback_weapons", "product"), "fo": ("flowback_other", "product"),
            "rl": ("sales_to_russia_lost", "product"), "rx": ("sales_to_russia_extra", "product"),
            "ux": ("sales_to_ukraine_extra", "product"), "sl": ("services_to_russia", "product"),
            "sx": ("services_to_russia", "product_when_more"), "sh": ("shipping", "product")}  # fmt: skip
    # (kind of earning, the industry group of its net gain, where its genuinely extra share is)
    rule = {"fw": ("weapons", "flowback_weapons", "extra"), "fo": ("goods", "flowback_other", "extra"),
            "rl": ("goods", "sales_to_russia_lost", "extra"), "rx": ("goods", "sales_to_russia_extra", "extra"),
            "ux": (None, "sales_to_ukraine_extra", "extra"), "sl": ("services", "services_to_russia", "extra"),
            "sx": ("services", "services_to_russia", "extra_when_more"), "sh": ("shipping", "shipping", "extra"),
            "ag": ("finance", "services_to_russia", "extra_when_more"), "in": ("insurance", "shipping", "extra")}  # fmt: skip

    def gain(iso3: str, grp: str) -> dict:
        own = ((ng["countries"].get(iso3) or {}).get("groups") or {}).get(grp)
        return own or ng["oecd_median"][grp]

    for iso3, d in vk["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        old, out = {}, {}
        for k, (flow, field) in keys.items():
            v = (d.get(flow) or {}).get(field) or (d.get(flow) or {}).get("product")
            if v:
                old[k] = [round(v["low"], 3), round(v["central"], 3), round(v["high"], 3)]
        for k, (grp, flow, field) in rule.items():
            e = (d.get(flow) or {}).get(field) or (d.get(flow) or {}).get("extra")
            if not e:
                continue
            if grp is None:  # extra sales to Ukraine: fuel at the refiners' gain, the rest at manufacturing's
                f = UA_FUEL_SHARE.get(iso3, UA_FUEL_DEFAULT)
                gf, gg = gain(iso3, "fuel"), gain(iso3, "goods")
                g = {b: f * gf[b] + (1 - f) * gg[b] for b in ("low", "central", "high")}
            else:
                g = gain(iso3, grp)
            out[k] = _gain_x_extra(g, e)
        c["vk"] = out
        # round 16 (review 5, H5; approved by the owner): the superseded pre-round-13 rule (value kept x extra, "old")
        # is no longer a method-band alternative, so it is not written to data.json
        c["ng_own"] = iso3 in ng["countries"] and bool(ng["countries"][iso3].get("groups"))
    # freight earned carrying Russian oil: gross freight x net gain x genuinely extra, in place of its profit share;
    # insurance and finance too (round 13); ship sales (their price premium) and registry fees keep their shares
    pf, pi = SHIPPING_PROFIT["freight"], SHIPPING_PROFIT["insurance_finance"]
    for c in countries.values():
        sh = c.get("shipping")
        fr = sh.pop("_fr", None) if sh else None
        ins = sh.pop("_ins", None) if sh else None
        f, fi = (c.get("vk") or {}).get("sh"), (c.get("vk") or {}).get("in")
        if not fr or not f:
            continue
        for k, n in (("years", 1), ("years_lo", 0), ("years_hi", 2)):
            sh[k] = [
                round(max(0.0, v - g * pf[n] - h * pi[n]) + g * f[n] + h * fi[n], 5)
                for v, g, h in zip(sh[k], fr[k], ins[k] if ins and fi else [0.0] * 6)
            ]
        sh["base"] = round(fr["base"] * f[1], 5)
        sh["base_range"] = [round(fr["base_range"][0] * f[0], 5), round(fr["base_range"][1] * f[2], 5)]
        for x in (sid, gid):
            if x not in sh["src"]:
                sh["src"].append(x)
    for c in countries.values():
        if c.get("shipping"):
            c["shipping"].pop("_fr", None)
            c["shipping"].pop("_ins", None)
    # payment agents' fees are sales of financial services to Russia: at the financial industry's net gain x genuinely
    # extra (round 13; were counted in full as a margin)
    for c in countries.values():
        f = (c.get("vk") or {}).get("ag")
        for x in c.get("extra") or []:
            if x["k"] != "agents" or not f:
                continue
            x["c"] = [round(v * f[1], 5) for v in x["c"]]
            x["l"] = [round(v * f[2], 5) for v in x["l"]]
            x["h"] = [round(v * f[0], 5) for v in x["h"]]
            x["src"] = x["src"] + [gid, sid]
    # every part calc() weights by these factors cites them (round 11 audit): sales to Russia and services sold to it
    # (rl/rx, sl/sx), extra sales to Ukraine (ux) and all money flowing back (fw, fo). Shipping cites it above
    for c in countries.values():
        if not c.get("vk"):
            continue
        for key in ("from_rus", "svc_sold", "sell_ukr"):
            obj = c.get(key)
            if obj is not None:
                for x in (sid, gid):
                    if x not in obj.setdefault("src", []):
                        obj["src"].append(x)
        fb = c.get("flowback")
        if fb:
            for key in ("src", "purl_src", "arms_src"):
                if fb.get(key) is not None:
                    for x in (sid, gid):
                        if x not in fb[key]:
                            fb[key].append(x)
    VALUE_KEPT_SRC.append(sid)
    VALUE_KEPT_SRC.append(gid)


VALUE_KEPT_SRC: list[str] = []


def military_rus_scaled() -> dict:
    """military_rus_r6.json with North Korea revalued (round 24b, north_korea_r24.json; approved by the owner): the arms
    items (artillery ammunition, ballistic missiles, artillery systems) scaled per band so that, with the troops' pay
    unchanged, the full value 2022-Aug 2026 meets INSS's low end (EUR 6.8bn), INSS's midpoint plus 2026 (10.0) and KIDA
    without the technology Russia gave North Korea (18.6); their timing is kept. by_year is rebuilt from the items."""
    mr6 = load(GAPS / "military_rus_r6.json")
    nk = load(GAPS / "north_korea_r24.json")
    p = (mr6.get("countries") or {}).get("PRK")
    if not p or not nk:
        return mr6
    items = p["by_item_eur_bn"]
    arms = [k for k in items if k != "troops"]
    for b in ("low", "central", "high"):
        troops = sum((v or {}).get(b, 0) for v in items.get("troops", {}).values() if isinstance(v, dict))
        now = sum((v or {}).get(b, 0) for k in arms for v in items[k].values() if isinstance(v, dict))
        f = (nk["full_value_eur_bn"][b] - troops) / now if now else 1.0
        for k in arms:
            for v in items[k].values():
                if isinstance(v, dict) and b in v:
                    v[b] = round(v[b] * f, 5)
    p["by_year"] = {
        str(y): {
            b: round(sum((items[k].get(str(y)) or {}).get(b, 0) for k in items), 5) for b in ("low", "central", "high")
        }
        for y in YEARS
    }
    p["total_eur_bn"] = {b: round(sum(v[b] for v in p["by_year"].values()), 3) for b in ("low", "central", "high")}
    return mr6


def apply_military_payment(countries: dict[str, dict], src: Sources) -> None:
    """Round 13 (audit): weapons and troops sent to Russia, split into paid and unpaid (military_payment_r13.json).
    Paid deliveries, including payment in kind (technology, components, fuel, food), are sales: they count at the
    seller's net gain x genuinely extra, like any sale to Russia. Unpaid deliveries are support and count in full.
    North Korea's outdated stock had almost no other use, so most of its price is a gain. Troops' pay counts in full:
    it goes to the North Korean state, not to the soldiers (unlike migrants' remittances, a marker since round 13b), and
    the soldiers' alternative pay is close to nothing. The old full-value series is kept as "alt" for the
    method-sensitivity band."""
    mp = load(GAPS / "military_payment_r13.json")
    ng = load(GAPS / ("net_gain_sellers_r13.json" if "normal_return" in ALT else "net_gain_sellers.json"))
    vk = load(GAPS / "value_kept.json")
    mr6 = military_rus_scaled()
    cm = load(GAPS / "china_military.json")
    nk = load(GAPS / "north_korea_r24.json") or {}
    pid = src.add(
        "military_payment",
        "How Russia paid for weapons and troops: INSS (via Bloomberg and The Insider), NK News, Bloomberg via Militarnyi; outdated North Korean stock: Ukraine's military intelligence via Reuters",
        "https://theins.press/en/news/290450",
        mp.get("generated"),
        "paid deliveries at the seller's net gain, unpaid in full; see research/2026-10/gaps/military_payment_r13-notes.md",
    )
    wg = ng["oecd_median"]["weapons"]
    for iso3, m in mp["countries"].items():
        c = countries.get(iso3)
        mr = (c or {}).get("military_rus")
        if not mr:
            continue
        items = (mr6["countries"].get(iso3) or {}).get("by_item_eur_bn") or {}
        if iso3 == "CHN":
            items = {"uncounted_total": cm["items"]["uncounted_total"]}
        ex = ((vk["countries"].get(iso3) or {}).get("flowback_weapons") or {}).get("extra") or {
            "low": 0.4,
            "central": 0.6,
            "high": 0.8,
        }
        paid = m["paid"]
        # round 24b (method band): Russia paid North Korea only what was observed flowing back (north_korea_r24.json)
        if iso3 == "PRK" and "nk_paid_observed" in ALT and nk.get("method_band_alternative"):
            paid = nk["method_band_alternative"]["paid_share"]
        sg = m.get("stock_gain")

        def gain(kind: str, b: str, sg: dict | None = sg) -> float:
            if kind == "stock" and sg:
                s, go = sg["outdated_share"][b], sg["gain_on_outdated"][b]
                return s * go + (1 - s) * wg[b]
            return wg[b]

        out = {"years": [], "years_lo": [], "years_hi": [], "years_paid": []}
        for y in YEARS:
            mid, lo2, hi2, sold = 0.0, 0.0, 0.0, 0.0
            for name, kind in m["items"].items():
                v = (items.get(name) or {}).get(str(y)) or {}
                vc = v.get("central") or 0.0
                if kind == "pay":
                    mid += vc
                    sold += vc
                    lo2 += (vc - (v.get("low") or vc)) ** 2
                    hi2 += ((v.get("high") or vc) - vc) ** 2
                    continue

                def val(vv: float, pp: float, gg: float, ee: float) -> float:
                    return vv * (pp * gg * ee + (1 - pp))

                f = val(vc, paid["central"], gain(kind, "central"), ex["central"])
                mid += f
                # round 24b: the paid share's gain is the seller's earning from Russia; the unpaid share is a gift to
                # Russia (business with Russia's two lines, years_paid)
                sold += vc * paid["central"] * gain(kind, "central") * ex["central"]
                # inputs moved one at a time, in quadrature: the volume, how much was paid, the gain, the extra share
                for alt in (
                    val(v.get("low") or vc, paid["central"], gain(kind, "central"), ex["central"]),
                    val(v.get("high") or vc, paid["central"], gain(kind, "central"), ex["central"]),
                    val(vc, paid["low"], gain(kind, "central"), ex["central"]),
                    val(vc, paid["high"], gain(kind, "central"), ex["central"]),
                    val(vc, paid["central"], gain(kind, "low"), ex["low"]),
                    val(vc, paid["central"], gain(kind, "high"), ex["high"]),
                ):
                    d = alt - f
                    if d < 0:
                        lo2 += d * d
                    else:
                        hi2 += d * d
            out["years"].append(round(mid, 5))
            out["years_paid"].append(round(sold, 5))
            out["years_lo"].append(round(max(0.0, mid - math.sqrt(lo2)), 5))
            out["years_hi"].append(round(mid + math.sqrt(hi2), 5))
        mr["alt"] = list(mr["years"])
        mr.update(out)
        if iso3 == "PRK" and nk:
            mr["src"] = mr["src"] + [
                src.add(
                    "north_korea_r24",
                    "North Korea's military value to Russia, revalued: INSS (Lim Soo-ho, 16 March 2026) and KIDA (April 2025) estimates read via the press, Friedrich Naumann Foundation (2024, 2025)",
                    "https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/",
                    nk.get("generated"),
                    "full value EUR 6.8 / 10.0 / 18.6bn; see research/2026-10/gaps/north_korea_r24-notes.md",
                )
            ]
        mr["src"] = mr["src"] + [pid, "net_gain_sellers"]


def apply_money_ledger(countries: dict[str, dict], src: Sources) -> None:
    """Where the money for Ukraine was spent (money_ledger.json, round 6): every euro that reached Ukraine (bilateral and
    EU aid, frozen-asset loans, multilateral and private money, Ukraine's own arms purchases abroad) assigned once to the
    economy where it was spent, plus purchases that replaced weapons given to Ukraine (up to the value given). Replaces
    the earlier flowback estimates (own-industry shares, PURL, EU arms slice, arms bought abroad). Gross amounts; calc()
    counts the value kept x genuinely extra. Stock donations earn nothing unless replaced."""
    ml = load(GAPS / "money_ledger.json")
    sid = src.add(
        "money_ledger",
        "Where the money for Ukraine was spent: Kiel Ukraine Support Tracker item coding (release 31), CSIS, DSCA notifications, Ukraine's Ministry of Finance, replacement purchases (DoD Inspector General, NAO, government statements)",
        "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx",
        ml.get("generated"),
        "each euro assigned once to the economy where it was spent; see research/2026-10/gaps/money_ledger-notes.md",
    )
    keys = ("own", "purl_in", "arms", "othsp")
    for c in countries.values():
        fb = c.get("flowback")
        if fb:
            for k in keys:
                for suf in ("", "_lo", "_hi"):
                    fb.pop(k + suf, None)
            # the earlier estimates' sources (CSIS, Kiel item coding, modelled and assumed own-industry shares, PURL, the
            # EU arms split) no longer produce these numbers (round 11 audit)
            fb["src"] = []
            for k in ("purl_src", "arms_src"):
                fb.pop(k, None)
    bands = (("", "central"), ("_lo", "low"), ("_hi", "high"))
    for iso3, d in ml["countries"].items():
        c = countries.get(iso3)
        if not c or iso3 == "UKR":
            continue
        bst = d.get("by_source_and_type") or {}
        rep = d.get("replacement_sales_eur_bn") or {}
        rep_tot = (d.get("replacement_sales_total") or {}).get("central") or 0.0
        self_share = (
            ((d.get("replacement_bought_by_seller_total") or {}).get(iso3) or {}).get("central", 0.0) / rep_tot
            if rep_tot
            else 0.0
        )
        customs = d.get("already_in_customs_trade_eur_bn") or {}

        def ser(names: list[str], y: int, b: str) -> float:
            return sum((bst.get(n) or {}).get(str(y), {}).get(b, 0.0) for n in names)

        fb = c.setdefault("flowback", {"src": []})
        for suf, b in bands:
            own, purl, arms, oth = [0.0], [0.0], [0.0], [0.0]
            for y in YEARS[1:]:
                r = (rep.get(str(y)) or {}).get(b, 0.0)
                own.append(ser(["own_aid|weapons"], y, b) + r * self_share)
                # weapons sales already in customs (counted as extra sales to Ukraine) come off all money that paid for
                # weapons sold to Ukraine (other donors, the EU, ERA loans, private and Ukraine's budget), pro rata
                bought = ser(["other_donors|weapons", "EU|weapons", "ERA|weapons", "private|weapons"], y, b)
                ukr = ser(["UKR_budget|weapons"], y, b)
                net = max(0.0, 1 - (customs.get(str(y)) or 0.0) / (bought + ukr)) if bought + ukr else 0.0
                purl.append(bought * net + r * (1 - self_share))
                arms.append(ukr * net)
                oth.append(ser([k for k in bst if k.endswith("|other")], y, b))
            for k, v in (("own", own), ("purl_in", purl), ("arms", arms), ("othsp", oth)):
                fb[k + suf] = [round(x, 5) for x in v]
        fb["cert_own"] = d.get("certainty") or "C"
        fb["arms_cert"] = d.get("certainty") or "C"
        # separate lists: the round-11 rules source is added to purl_src only (EU-level arms money)
        fb["purl_src"], fb["arms_src"] = [sid], [sid]
        if sid not in fb.setdefault("src", []):
            fb["src"].append(sid)


# Round 24b: Germany's own cash payments for military aid (EUR 15.07bn to 31 March 2025, Federal Ministry of Defence
# via the Bundestag) exceed Kiel's German procurement allocations at that date (EUR 8.32bn), so Kiel's German
# allocations do not run ahead of the money paid and the central lead times likely overstate what is undelivered: the
# smaller (fast) cut is central, the central cut the low end of support (military_delivered-notes.md)
DELIVERED_FAST_CENTRAL = {"DEU"}


def apply_military_delivered(countries: dict[str, dict], src: Sources) -> None:
    """Round 24b (audit 24, D M4; approved by the owner 22 October 2026): military aid counts when delivered, by 31 August
    2026, not when allocated (military_delivered.json, pipeline/military_delivered.py). Each year's correction is minus
    the rise in what was allocated but not yet delivered at that year's end, so the total to any year on the slider is
    the delivered amount; Kiel's full allocation is the high end of support, the slow lead times the low end. The EU's
    own military aid (the EU Support Loan's military part) is spread to members by their EU share like the rest of EU
    aid. Stored as aid.undeliv and aid.undeliv_eu ({c, l, h} per year, EUR bn, <= 0); calc() adds them like weapons_mv.
    The money a donor spends in its own economy (flowback "own") follows delivery: its running total is scaled by the
    share of the donor's procurement delivered by each year's end."""
    md = load(GAPS / "military_delivered.json")
    if not md:
        return
    sid = src.add(
        "military_delivered",
        "Military aid delivered by 31 August 2026: Kiel Ukraine Support Tracker release 31 allocation rows with delivery lead times by channel; US Department of Defense (Lead IG quarterly report Q1 2026) for USAI",
        md.get("url"),
        md.get("generated"),
        "aid counted when delivered; Kiel's full allocation is the high end; see research/2026-10/gaps/military_delivered-notes.md",
    )
    yrs = [str(y) for y in YEARS[1:]]

    def series(d: dict, band: str) -> list[float]:
        cum = [d["asof"][y]["undelivered"][band] if y in d["asof"] else 0.0 for y in yrs]
        return [0.0] + [-(cum[i] - (cum[i - 1] if i else 0.0)) for i in range(len(cum))]

    def trip(d: dict, fast_central: bool) -> dict:
        c = series(d, "low" if fast_central else "central")
        lo = series(d, "central" if fast_central else "high")
        return {"c": [round(v, 5) for v in c], "l": [round(v, 5) for v in lo], "h": [0.0] * len(YEARS)}

    eu = md["donors"].get("EU_INST")
    for iso3, d in md["donors"].items():
        a = (countries.get(iso3) or {}).get("aid")
        if iso3 == "EU_INST" or not a:
            continue
        a["undeliv"] = trip(d, iso3 in DELIVERED_FAST_CENTRAL)
        a["undeliv_src"] = [sid]
    for c in countries.values():
        a = c.get("aid") or {}
        if eu and a.get("eu_share"):
            t = trip(eu, False)
            a["undeliv_eu"] = {k: [round(v * a["eu_share"], 5) for v in vals] for k, vals in t.items()}
            a.setdefault("undeliv_src", [sid])
    # the donor's own procurement spending at home follows delivery
    for iso3, d in md["donors"].items():
        fb = (countries.get(iso3) or {}).get("flowback")
        if iso3 == "EU_INST" or not fb or not fb.get("own"):
            continue
        share = [1.0] + [d["asof"][y]["proc_delivered_share"] if y in d["asof"] else 1.0 for y in yrs]
        scaled_ = {}
        for suf in ("", "_lo", "_hi"):
            ser = fb.get("own" + suf)
            if not ser:
                continue
            run, prev, out = 0.0, 0.0, []
            for i, v in enumerate(ser):
                run += v
                now = run * share[i]
                out.append(now - prev)
                prev = now
            scaled_[suf] = out
        if len(scaled_) == 3:
            # each year's three values kept in order (scaling the running totals can swap them in a year)
            trip = [sorted(t) for t in zip(scaled_["_lo"], scaled_[""], scaled_["_hi"])]
            for n, suf in enumerate(("_lo", "", "_hi")):
                fb["own" + suf] = [round(t[n], 5) for t in trip]
        else:
            for suf, out in scaled_.items():
                fb["own" + suf] = [round(v, 5) for v in out]
        if sid not in fb.setdefault("src", []):
            fb["src"].append(sid)


# Round 26 (the owner, 22 October 2026: "if I don't have any data, we shouldn't put anything there"): a trade part counts
# only where the country has its own observation for the war years. Own observation, per flow:
# - goods trade with Russia or Ukraine: a value the country reports, or its partner reports for it (mirror), in UN
#   Comtrade/Eurostat for at least one of 2022-2025 (trade.json), or a country-specific post-war record from research:
#   non-reporters' trade from tanker tracking and official statements (nonreport), hubs' records of what they bought from
#   the country and sold on to Russia (reexports), national statistics (narrow), gas by country of use (transit_gas), the
#   Power of Siberia, Hong Kong's gold, refinery-specific research (laundered_r6);
# - fuel made from Russian crude (laundered oil): the country's own customs records of fuel imports by origin
#   (laundered_eu), refiners' reported fuel exports to the country (laundered), or refinery-specific research
#   (laundered_r6). Fuel reached only through EU refiners' 2021 export shares is an allocation, not an observation.
# Not an observation: the pre-war trend continued (trend), Russia's import gap split by origin shares (residual), audit
# shares (audit2) and models. A part without its own observation is set to zero in calc() and marked "no data".
NO_DATA_OBS = {
    "to_rus": {"nonreport", "reexports", "narrow", "transit_gas", "power_of_siberia", "hk_gold_r16", "laundered_r6"},
    "from_rus": {"nonreport", "reexports", "narrow"},
    "buy_ukr": set(),
    "sell_ukr": set(),
    "laund": {"laundered", "laundered_r6", "laundered_eu"},
}
NO_DATA_TRADE = {
    "to_rus": "imports_from_RUS",
    "from_rus": "exports_to_RUS",
    "buy_ukr": "imports_from_UKR",
    "sell_ukr": "exports_to_UKR",
}
NO_DATA_PARTS = {
    "to_rus": ["paid", "windfall"],
    "from_rus": ["sold"],
    "buy_ukr": ["buy"],
    "sell_ukr": ["sell"],
    "laund": ["laund"],
}


def mark_no_data(countries: dict[str, dict]) -> None:
    trade = load(RESEARCH / "trade.json")["countries"]
    for iso3, c in countries.items():
        t = trade.get(iso3) or {}
        miss = []
        for flow, obs_src in NO_DATA_OBS.items():
            obj = c.get(flow)
            if not obj:
                continue
            tf = NO_DATA_TRADE.get(flow)
            observed = bool(tf and any(v is not None for y, v in (t.get(tf) or {}).items() if 2022 <= int(y) <= 2025))
            observed = observed or bool(obs_src & set(obj.get("src") or []))
            if not observed:
                miss += NO_DATA_PARTS[flow]
        if miss:
            c["no_data"] = sorted(set(miss))


def apply_captive(countries: dict[str, dict], src: Sources) -> None:
    """Round 24b added a "no real alternative to Russian fuel" label (captive_buyers.json). Round 26 (the owner,
    22 October 2026: "everybody has alternatives ... there's always a way") removed it everywhere; the research file
    stays as background only. What remains is a plain label for Hungary and Slovakia, which kept buying Russian
    pipeline crude under the EU exemption although an alternative existed. No number changes (check_data.py)."""
    cb = load(GAPS / "captive_buyers.json")
    if not cb:
        return
    # Round 26 (the owner, 22 October 2026): no "partly captive". Hungary and Slovakia had an alternative (Adria; Czechia
    # switched via TAL) and kept buying pipeline crude under the EU exemption: a plain label, also with no number change
    ex = cb.get("pipeline_exemption") or {}
    if ex:
        eid = src.add(
            "pipeline_exemption",
            "Russian pipeline crude kept under the EU exemption: Council Regulation (EU) 2022/879 (crude embargo exempting pipeline deliveries); the Adria pipeline tests (JANAF, MOL); Czechia's switch to the TAL/IKL route (OSW, April 2025); UN Comtrade 2021 crude imports",
            cb["sources"]["eu_2022_879"]["url"],
            cb.get("generated"),
            "a label only, no number changes; see research/2026-10/gaps/captive_buyers-notes.md",
        )
        src.items[eid]["links"] = [
            {"title": cb["sources"][k]["title"] + f" ({cb['sources'][k]['publisher']})", "url": cb["sources"][k]["url"],
             "kind": "secondary" if k in ("adria_tests", "adria_euronews") else "primary"}
            for k in ("eu_2022_879", "czech_tal", "adria_euronews", "adria_tests", "comtrade")
        ]  # fmt: skip
        for iso3, lab in ex.items():
            c = countries.get(iso3)
            if c:
                c["pipeline_exempt"] = {"commodity": lab["commodity"], "years": lab["years"],
                                        "why": "; ".join(x for x in (lab.get("c1"), lab.get("c2")) if x), "src": [eid]}  # fmt: skip


def source_documents(src: Sources) -> None:
    """Round 24b: the key documents of the sources added in this round (classify_sources marks the first primary ones)."""
    docs = {
        "refugees_gain": [
            (
                "Bundesagentur fuer Arbeit: Auswirkungen der Fluchtmigration aus der Ukraine auf den Arbeitsmarkt (Arbeitsmarkt kompakt, 30 Jan 2026), p. 4",
                "https://statistik.arbeitsagentur.de/DE/Statischer-Content/Statistiken/Themen-im-Fokus/Migration/Personen-nach-Staatsangehoerigkeiten/Generische-Publikationen/AM-kompakt-Auswirkungen-Fluchtmigration-Ukraine-Arbeitsmarkt.pdf",
                "primary",
            ),
            (
                "CBS: Oekraiense vluchtelingen, 1 november 2025, werknemers, Tabel 4",
                "https://www.cbs.nl/-/media/_excel/2026/06/november2025---oekraensevluchtelingen---werknemers.xlsx",
                "primary",
            ),
            (
                "Bundesregierung: Bilaterale Unterstuetzungsleistungen fuer die Ukraine und Menschen aus der Ukraine, Stand 31.03.2025, pp. 2-7",
                "https://www.bundesregierung.de/resource/blob/975228/2201464/5f307970470d06878af4f84fff956613e84/liste-ukr-bilaterale-hilfe-data.pdf?download=1",
                "primary",
            ),
            (
                "PAP Biznes: Poland sees approx. 78 pct working-age Ukrainians employed",
                "https://biznes.pap.pl/wiadomosci/gospodarka/poland-sees-approx-78-pct-working-age-ukrainians-employed",
                "secondary",
            ),
            (
                "European Commission, migrant integration portal: Czech Republic, employment of people displaced from Ukraine",
                "https://migrant-integration.ec.europa.eu/news/czech-republic-employment-and-perception-people-displaced-ukraine_en",
                "primary",
            ),
            (
                "Boersen-Zeitung: Deutsche Ukrainehilfe weniger generoes als von Berlin deklariert (Kiel Institute analysis, 8 Oct 2026; read via the press)",
                "https://www.boersen-zeitung.de/konjunktur-politik/deutsche-ukrainehilfe-weniger-generoes-als-von-berlin-deklariert",
                "secondary",
            ),
        ],
        "north_korea_r24": [
            (
                "Korea Times: N. Korea estimated to have earned up to $14.4 bil. from Russia-Ukraine war involvement (INSS report, 16 Mar 2026; read via the press)",
                "https://www.koreatimes.co.kr/amp/foreignaffairs/northkorea/20260316/n-korea-estimated-to-have-earned-up-to-144-bil-from-russia-ukraine-war-involvement-report",
                "secondary",
            ),
            (
                "NK News: North Korea likely earned $14.4B from military deals with Russia (INSS)",
                "https://www.nknews.org/2026/03/north-korea-likely-earned-14-4b-from-military-deals-with-russia-report/",
                "secondary",
            ),
            (
                "Kyiv Independent: North Korea earns over $20 billion aiding Russia's war effort (KIDA, Apr 2025; read via the press)",
                "https://kyivindependent.com/north-korea-earns-over-20-billion-aiding-russias-war-effort-report-says/",
                "secondary",
            ),
            (
                "Friedrich Naumann Foundation: New FNF study, partnership between Russia and North Korea (Sep 2025)",
                "https://www.freiheit.org/north-and-south-korea/new-fnf-study-partnership-between-russia-and-north-korea",
                "primary",
            ),
            (
                "Al Jazeera: North Korea getting a 'raw deal' on support for Russia's war (FNF report)",
                "https://www.aljazeera.com/news/2025/9/18/north-korea-getting-a-raw-deal-on-support-for-russias-war-report",
                "secondary",
            ),
        ],
        "military_delivered": [
            (
                "Kiel Institute: Ukraine Support Tracker Release 31 workbook (8 Oct 2026), sheet 'Bilateral Assistance, MAIN DATA', military allocation rows",
                "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx",
                "primary",
            ),
            (
                "Militarnyi: Ukraine received $8.2 billion in U.S. aid under USAI from October through March (Lead IG quarterly report, Q1 2026)",
                "https://militarnyi.com/en/news/ukraine-8-2-billion-usai-october-march/",
                "secondary",
            ),
            (
                "Legis1: Ukraine aid delivery, US committed $68.2B, only 57% delivered (CRS IF12040 and DoD)",
                "https://legis1.com/news/ukraine-aid-delivery-us-committed-682b-to-only-57",
                "secondary",
            ),
            (
                "Bundesregierung: Bilaterale Unterstuetzungsleistungen, Stand 31.03.2025, p. 6 (BMVg cash payments EUR 15.07bn)",
                "https://www.bundesregierung.de/resource/blob/975228/2201464/5f307970470d06878af4f84fff956613e84/liste-ukr-bilaterale-hilfe-data.pdf?download=1",
                "primary",
            ),
        ],
        "windfall_band": [
            (
                "Enel Global Trading: Spanish forward gas update, 21 January 2021 (TTF Cal-22 EUR 16.7/MWh)",
                "https://k4viewnews-globaltrading-qual.enel.com/spanish-forward-gas-update-21-01-2021",
                "primary",
            ),
            (
                "IEA: Gas Market Report Q1 2022 (Gazprom's role in the 2021 tightness)",
                "https://www.iea.org/reports/gas-market-report-q1-2022",
                "primary",
            ),
            (
                "World Bank: Commodity Markets Outlook, October 2021",
                "https://openknowledge.worldbank.org/handle/10986/36350",
                "primary",
            ),
        ],
    }
    for sid, lst in docs.items():
        if sid in src.items:
            src.items[sid]["links"] = [{"title": t, "url": u, "kind": k} for t, u, k in lst]


def apply_weapons_value(countries: dict[str, dict], src: Sources) -> None:
    """Donated weapons at market value, the value to Ukraine (weapons_value.json, round 5): stock donations recorded at
    replacement cost or list price are corrected to what the equipment would fetch on the market. Stored as yearly
    corrections (EUR bn, negative = less aid) used for the shift toward Ukraine; the cost view keeps the recorded values."""
    wv = load(GAPS / "weapons_value.json")
    sid = src.add(
        "weapons_value",
        "Donated weapons at market value: GAO and DoD Inspector General (US drawdown valuation), UK National Audit Office, EU Peace Facility claims, used-equipment and munitions prices",
        "https://www.gao.gov/products/gao-24-106934",
        wv.get("generated"),
        "factor = market value / recorded value per Kiel row; see research/2026-10/gaps/weapons_value-notes.md",
    )
    for iso3, d in wv["countries"].items():
        aid = (countries.get(iso3) or {}).get("aid")
        corr = d.get("correction_by_year") or {}
        if not aid or not corr:
            continue
        get = lambda y, b: (corr.get(str(y)) or {}).get(b, 0.0)  # noqa: E731
        trip = [sorted((get(y, "low"), get(y, "central"), get(y, "high"))) for y in YEARS]
        aid["weapons_mv"] = {k: [round(t[n], 5) for t in trip] for k, n in (("l", 0), ("c", 1), ("h", 2))}
        if sid not in aid.setdefault("src", []):
            aid["src"].append(sid)


def apply_laundered_r6(countries: dict[str, dict], src: Sources) -> None:
    """Two more channels (laundered_r6.json, round 6): fuel from Brunei's Hengyi refinery, which runs on Russian crude
    (Australia, Singapore, Malaysia, Viet Nam), and Russian fuel relabelled in Turkish ports without refineries and sold
    to the EU (mostly Greece, partly resold). Added to the buyers' laundered oil; taken off Türkiye's and Brunei's own
    payments to Russia, which they passed on. Australia's series replaces the one in laundered_eu.json."""
    lr = load(GAPS / "laundered_r6.json")
    sid = src.add(
        "laundered_r6",
        "Brunei's Hengyi refinery and Turkish ports relabelling Russian fuel: CREA, CSD, Eurostat Comext, UN Comtrade, Kpler-based reporting",
        "https://energyandcleanair.org/",
        lr.get("generated"),
        "see research/2026-10/gaps/laundered_r6-notes.md",
    )
    keys = (("years", "central"), ("years_lo", "low"), ("years_hi", "high"))
    for iso3, d in lr["countries"].items():
        c = countries.get(iso3)
        add = d.get("add_total_eur_bn") or {}
        if not c or not add:
            continue
        get = lambda by, y, b: (by.get(str(y)) or {}).get(b, 0.0)  # noqa: E731
        # Brunei's fuel at Hengyi's own crude ratio per year; Australia's other fuel at the measured blended ratio
        nb = (d.get("replacement_for_laundered_eu_non_eu_AUS") or {}).get("non_brunei_part") or {}
        fix = lambda y, b: r6_brunei_change(d, y, b) + get(nb, y, b) * (eu_k_factor(y, b) - 1)  # noqa: E731
        add = {str(y): {b: get(add, y, b) + fix(y, b) for b in ("low", "central", "high")} for y in YEARS}
        if iso3 in ("TUR", "BRN"):
            # passed on: out of the hub's own payments to Russia
            tr = c.get("to_rus")
            if tr and iso3 == "BRN":
                pass  # after apply_narrow(), which replaces Brunei's values: apply_brunei_r6()
            elif tr:
                sub = d.get("subtract_reexported_russian_products_eur_bn") or {
                    y: {b: -v for b, v in x.items()} for y, x in add.items()
                }
                for k, b in (("years", "central"), ("years_lo", "high"), ("years_hi", "low")):
                    tr[k] = [round(max(0.0, v - get(sub, y, b)), 5) for v, y in zip(tr[k], YEARS)]
                if sid not in tr.setdefault("src", []):
                    tr["src"].append(sid)
            continue
        lb = c.setdefault("laund", {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6, "base": 0.0, "base_range": [0.0, 0.0], "cert": "C", "src": []})  # fmt: skip
        repl = (d.get("replacement_for_laundered_eu_non_eu_AUS") or {}).get("new_total")
        if repl:
            repl = {str(y): {b: get(repl, y, b) + fix(y, b) for b in ("low", "central", "high")} for y in YEARS}
        for k, b in keys:
            lb[k] = [round(get(repl, y, b) if repl else lb[k][i] + get(add, y, b), 5) for i, y in enumerate(YEARS)]
        trip = [sorted(t) for t in zip(lb["years_lo"], lb["years"], lb["years_hi"])]
        lb["years_lo"], lb["years"], lb["years_hi"] = ([t[n] for t in trip] for n in range(3))
        # the pre-war part of the Brunei channel raises the pre-war level too
        pre = get(repl or add, 2021, "central")
        if pre > 0 and not repl:
            lb["base"] = round(lb.get("base", 0.0) + pre, 5)
            lb["base_range"] = [
                round(lb["base_range"][0] + get(add, 2021, "low"), 5),
                round(lb["base_range"][1] + get(add, 2021, "high"), 5),
            ]
        if "turkish_ports" in d:
            # Russian products relabelled in Turkish ports: product, not crude, kept apart for Russia's gain on it
            bf = (d.get("brunei") or {}).get("fuel_value_russian_derived_eur_bn") or {}
            a0 = d.get("add_total_eur_bn") or {}
            tp = [max(0.0, get(a0, y, "central") - get(bf, y, "central") * R6_K_OLD[1]) for y in YEARS]
            lb["_prod"] = [x + v for x, v in zip(lb.get("_prod", [0.0] * 6), tp)]
        if sid not in lb.setdefault("src", []):
            lb["src"].append(sid)


def eu_k_factor(year: int, band: str) -> float:
    """From the crude ratio laundered_eu.json used (EU_K_OLD) to the measured one (crude_k, refiners blended)."""
    i = ("low", "central", "high").index(band)
    return crude_k(year)[i] / (EU_K_OLD[year] * (0.88, 1.0, 1.12)[i])


def r6_brunei_change(d: dict, y: int, b: str) -> float:
    """Change to a buyer's Brunei channel: its fuel from Hengyi x (Hengyi's measured ratio - the round-6 ratio)."""
    fuel = ((d.get("brunei") or {}).get("fuel_value_russian_derived_eur_bn") or {}).get(str(y)) or {}
    i = ("low", "central", "high").index(b)
    return fuel.get(b, 0.0) * (crude_k(y, "BRN")[i] - R6_K_OLD[i])


def apply_laundered_eu(countries: dict[str, dict], src: Sources) -> None:
    """Laundered oil of EU members (and the USA, UK and Australia) from customs records of fuel imports by origin x the
    Russian-crude share of each origin's exports (laundered_eu.json, round 5), at the final consumer after the ARA hubs
    resell. Replaces the modelled values, which got the EU total right but the split between members wrong."""
    le = load(GAPS / "laundered_eu.json")
    sid = src.add(
        "laundered_eu",
        "Fuel made from Russian crude per EU member: Eurostat Comext HS 2710 imports by origin, refinery Russian-crude shares, CREA per-country checks",
        "https://ec.europa.eu/eurostat/comext/newxtweb/",
        le.get("generated"),
        "final consumer after Dutch and Belgian resale; see research/2026-10/gaps/laundered_eu-notes.md",
    )
    rows = {
        i: (d["final_consumer_russian_crude_eur_bn"], d.get("base_2019_2021_final_consumer"), d.get("certainty"))
        for i, d in le["countries"].items()
    }
    rows |= {
        i: (d["years"], None, d.get("certainty")) for i, d in (le.get("non_eu") or {}).items() if d and d.get("years")
    }
    for iso3, (ys, base, cert) in rows.items():
        c = countries.get(iso3)
        if not c:
            continue
        lb = c.setdefault("laund", {"base": 0.0, "base_range": [0.0, 0.0], "src": []})
        for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
            lb[k] = [round(ys[str(y)][b] * eu_k_factor(y, b), 5) for y in YEARS]
        if base:
            lb["base"] = round(base["central"] * eu_k_factor(2021, "central"), 5)
            lb["base_range"] = [
                round(base["low"] * eu_k_factor(2021, "low"), 5),
                round(base["high"] * eu_k_factor(2021, "high"), 5),
            ]
        lb["cert"] = (cert or "C")[0]
        lb["src"] = [sid]


def apply_assumptions_r11_laundered(countries: dict[str, dict]) -> None:
    """Round 11 (hubs), after every source of laundered oil is in (reassign, laundered_eu.json, laundered_r6.json):
    Malta's laundered oil comes from laundered_eu.json and Turkish ports, not through the hub step, so half of its
    bunker share comes off its middle value here too; then the per-territory caps (LAUNDERED_CAP_BY) apply to the final
    values, which the later research files had pushed past the cap."""
    for iso3, c in countries.items():
        cap = LAUNDERED_CAP_BY.get(iso3)
        half = HUB_BUNKER_HALF_MID.get(iso3, 0.0)
        if not cap and not half:
            continue
        gdp = c.get("gdp") or 0
        for obj, keys in ((c.get("laund"), ("years", "years_lo", "years_hi")),
                          (c.get("to_rus"), ("laundered", "laundered_lo", "laundered_hi"))):  # fmt: skip
            if not obj or not obj.get(keys[0]):
                continue
            mid, lo, hi = (list(obj[k]) for k in keys)
            if half and obj is c.get("laund"):
                mid = [v * (1 - half) for v in mid]
            if cap and gdp:
                if obj is c.get("laund") and any(v > gdp * cap[0] * f for v, f in list(zip(mid, FRAC))[1:]):
                    obj["_capped"] = True  # round 13b: the cap sets its post-war value (eu_refiner_exports)
                mid = [min(v, gdp * cap[0] * f) for v, f in zip(mid, FRAC)]
                hi = [max(min(v, gdp * cap[1] * f), m) for v, f, m in zip(hi, FRAC, mid)]
            lo = [min(v, m) for v, m in zip(lo, mid)]
            for k, v in zip(keys, (mid, lo, hi)):
                obj[k] = [round(x, 5) for x in v]
        R11_TOUCHED["hubs"].add("laund:" + iso3)


def reassign_laundered_oil(countries: dict[str, dict], laundered: dict[str, dict], src: Sources) -> None:
    """Pass on what trading hubs resell, to their customers by share of fuel exports, then keep only the crude value."""
    hubs = load(GAPS / "hub_exports_2024.json")["shares"]
    # customers of the other fuel hubs (UAE, India, Turkey, Togo, Gibraltar, Panama): fuel export shares 2022-2025
    buyers = load(GAPS / "hub_buyers.json")
    # Togo: buyers traced from African importers' records of fuel from India (ship-to-ship off Lomé)
    hubs["TGO"] = {k: v["central"] for k, v in REFINE["togo_buyers"].items() if isinstance(v, dict) and "central" in v}
    for hub, d in buyers["hubs"].items():
        hubs.setdefault(hub, {k: v["central"] for k, v in d["destination_shares"].items() if k != "other"})

    def pass_on(start: dict[str, dict]) -> dict[str, dict]:
        """Each hub's resold share goes to its customers, through chains of hubs."""
        totals = {iso3: {k: list(v[k]) for k in ("years", "years_lo", "years_hi")} for iso3, v in start.items()}
        # fuel passed from one hub to another (India to the Netherlands, Belgium to the Netherlands) is passed on again:
        # each hub resells what it has not yet processed, until nothing is left in transit (order does not matter)
        keys = ("years", "years_lo", "years_hi")
        pending = {h: {k: list(totals[h][k]) for k in keys} for h in HUB_RESALE if h in totals}
        for _ in range(20):
            if not any(any(v > 1e-6 for v in pk[k]) for pk in pending.values() for k in keys):
                break
            for hub, (lo, mid, hi) in HUB_RESALE.items():
                amount = pending.pop(hub, None)
                if not amount:
                    continue
                shares = {d: w for d, w in hubs.get(hub, {}).items() if d in countries and d != hub}
                norm = sum(shares.values()) or 1
                # the hub keeps least at the high resale share (its low end) and most at the low share (its high end);
                # its customers get the least at the low share and the most at the high share
                bunker = HUB_BUNKER.get(hub, 0.0)
                mid_out = mid + HUB_BUNKER_HALF_MID.get(hub, 0.0)  # round 11: Malta's bunkers, half in the middle case
                for key, out_f, give_f in (
                    ("years", mid_out, mid),
                    ("years_lo", hi + bunker, lo),
                    ("years_hi", lo, hi),
                ):
                    totals[hub][key] = [v - a * min(1.0, out_f) for v, a in zip(totals[hub][key], amount[key])]
                    moved = [a * give_f for a in amount[key]]
                    for dest, w in shares.items():
                        t = totals.setdefault(dest, {k: [0.0] * 6 for k in keys})
                        add = [m * w / norm for m in moved]
                        t[key] = [v + x for v, x in zip(t[key], add)]
                        if dest in HUB_RESALE:
                            pk = pending.setdefault(dest, {k: [0.0] * 6 for k in keys})
                            pk[key] = [v + x for v, x in zip(pk[key], add)]
        return totals

    totals = pass_on(laundered)
    # the pre-war level goes through the same chain (round4a.json gives it before hub pass-on); the EU correction
    # comes first, as for the yearly values
    prewar = {}
    for iso3, pw in LAUNDERED_PREWAR.items():
        b, eu = pw["base_2018_2021"], (0.5, 0.62, 0.8) if iso3 in EU27 else (1, 1, 1)
        prewar[iso3] = {
            k: [b[band] * e] * 6
            for k, band, e in (("years", "central", eu[1]), ("years_lo", "low", eu[0]), ("years_hi", "high", eu[2]))
        }
    passed = pass_on(prewar)
    prewar = {k: (v["years"][0], v["years_lo"][0], v["years_hi"][0]) for k, v in passed.items()}

    lid = src.add(
        "laundered",
        "Laundered oil: fuel made from Russian crude, assigned to the final buyer (trading hubs pass on what they resell), valued at the Russian crude inside it",
        "https://www.russiafossiltracker.com/methodology/",
        "2026-10",
        "hub resale shares are estimates; hub customers from UN Comtrade HS 2710 exports 2024; crude share of the fuel value per refiner and year (crude_content.json)",
    )
    for iso3, t in totals.items():
        tr = (countries.get(iso3) or {}).get("to_rus")
        if not tr or not any(t["years_hi"]):
            continue
        gdp = countries[iso3].get("gdp") or 0
        cap = LAUNDERED_CAP_BY.get(iso3, LAUNDERED_CAP)
        cap_mid = [gdp * cap[0] * f for f in FRAC] if gdp else [float("inf")] * 6
        cap_hi = [gdp * cap[1] * f for f in FRAC] if gdp else [float("inf")] * 6
        ks = [crude_k(y) for y in YEARS]
        mid = [min(v * k[1], m) for v, k, m in zip(t["years"], ks, cap_mid)]
        tr["laundered"] = [round(v, 5) for v in mid]
        tr["laundered_lo"] = [round(min(v * k[0], m), 5) for v, k, m in zip(t["years_lo"], ks, mid)]
        tr["laundered_hi"] = [round(max(min(v * k[2], h), m), 5) for v, k, h, m in zip(t["years_hi"], ks, cap_hi, mid)]
        tr["laundered_src"] = [lid]
        # some fuel refined from Russian crude reached buyers before the war too: only the rise above that level, and
        # its pre-war growth, counts (round4a.json; same crude-content factor and EU correction as the yearly values)
        pw = LAUNDERED_PREWAR.get(iso3) or {}
        lb = {"years": tr["laundered"], "years_lo": tr["laundered_lo"], "years_hi": tr["laundered_hi"], "base": 0.0, "base_range": [0.0, 0.0], "cert": "C", "src": [lid]}  # fmt: skip
        if prewar.get(iso3) and prewar[iso3][0] > 0:
            mid_b, lo, hi = prewar[iso3][0], *sorted(prewar[iso3][1:])
            # before the war: the 2021 ratio (no discount yet)
            k21 = crude_k(2021)
            lb["base"] = round(mid_b * k21[1], 5)
            lb["base_range"] = [round(min(lo * k21[0], lb["base"]), 5), round(max(hi * k21[2], lb["base"]), 5)]
            # growth from the 2018-2021 midpoint; the range always includes no growth
            g = pw.get("g") or {"low": 0, "central": 0, "high": 0}
            lb["bmul"] = [1.0] + [round((1 + g["central"]) ** (y - 2019.5), 4) for y in YEARS[1:]]
            lb["bmul_lo"] = [1.0] + [round(min(1.0, (1 + g["low"]) ** (y - 2019.5)), 4) for y in YEARS[1:]]
            lb["bmul_hi"] = [1.0] + [round(max(1.0, (1 + g["high"]) ** (y - 2019.5)), 4) for y in YEARS[1:]]
        # round 13b: where the cap, not a measurement, sets a war-year value (ship registries, storage points), the
        # post-war route is not measured at the final buyer (eu_refiner_exports)
        lb["_capped"] = any(v * k[1] > m for v, k, m in list(zip(t["years"], ks, cap_mid))[1:])
        countries[iso3]["laund"] = lb
        if iso3 in HUB_RESALE:
            countries[iso3]["hub"] = (
                "fuel trading hub: the share of laundered oil it resells is counted for its customers"
            )


# Hong Kong: share of its Russian imports that is precious metals, and the share of that passed on to mainland China
# share of the rise in Hong Kong's imports from Russia (over 2019-2021) that is precious metals (HS 71), per year.
# Round 12: measured from UN Comtrade (Hong Kong's own import records, raw/comtrade_hkg): the HS 71 rise / the total
# rise, at most 1. HS 71 rose more than the total in every year (other goods fell), so it is 1.0 in 2022-2025; 2026
# takes 2025's. Was a flat 0.98, not traced to a source


def _hk_metals_share() -> list[float]:
    raw = Path(__file__).resolve().parent.parent / "research/2026-10/raw/comtrade_hkg"
    val: dict[int, dict[str, float]] = {}
    for f in sorted(raw.glob("HKG_from_RUS_M_TOTAL_71_*.json")):
        for r in json.loads(f.read_text())["data"]:
            val.setdefault(int(r["period"]), {})[r["cmdCode"]] = r["primaryValue"]
    base = {k: sum(val[y][k] for y in (2019, 2020, 2021)) / 3 for k in ("TOTAL", "71")}
    share = {
        y: min(1.0, max(0.0, (v["71"] - base["71"]) / (v["TOTAL"] - base["TOTAL"])))
        for y, v in val.items()
        if y >= 2022 and v["TOTAL"] > base["TOTAL"]
    }
    last = max(share)
    return [0.0] + [round(share.get(y, share[last]), 4) for y in YEARS[1:]]


HK_METALS_SHARE = _hk_metals_share()
HK_ONWARD = (0.3, 0.55, 0.85)
TRANSIT_HUBS = {"HKG": "gold transit hub: only the Russian gold that stays in Hong Kong counts here; the share passed on to mainland China is counted for China, and the share exported elsewhere for those buyers"}  # fmt: skip


# share of shipping income that is profit (low, middle, high): freight pays for fuel, port fees, crew and the ship itself
# (tanker operating margins in the 2022-23 boom: 30-50%); a ship sale is already counted as its price premium
SHIPPING_PROFIT = {"freight": (0.2, 0.35, 0.5), "insurance_finance": (0.1, 0.25, 0.4), "ship_sales": (0.8, 1.0, 1.0), "registry": (0.3, 0.5, 0.7)}  # fmt: skip
# customs values of imports include freight and insurance (CIF): that part is paid to shippers and insurers, not to Russia,
# and is counted for them (shipping, services); taken out of payments to Russia (low, middle, high share)
# round 11 (people): OECD ITIC margins (CIF over FOB) on imports from Russia. Per importer for the 25 largest buyers
# (mean 2022-2024; low x0.7, high x1.4), else the trade-weighted average 4.5% / 6.5% / 9% (was 3.5% / 5.5% / 7.5%).
# Gold bars travel by air at almost no cost per euro: 0.1% / 0.5% / 2%, from Türkiye's reported margin on Russian gold
_CIF_R11 = {p["item"] + "|" + p["country"]: p["new"] for p in R11["people"]["proposals"] if p["item"] == "CIF_SHARE"}
CIF_SHARE = tuple(_CIF_R11["CIF_SHARE|all importers (constant)"][b] for b in _B3)
CIF_BY_IMPORTER = {
    i: (round(v["avg_share"] * 0.7, 4), v["avg_share"], round(v["avg_share"] * 1.4, 4))
    for i, v in _CIF_R11["CIF_SHARE|per importer (preferred)"]["values_top25"].items()
}
CIF_GOLD = tuple(_CIF_R11["CIF_SHARE|gold imports (HS 7108; HKG, ARE, TUR, CHE, IND)"][b] for b in _B3)


# ---- round 14 (C3, audit): one price basis for fuel, FOB at the Russian port ----
# Customs values and unit values are CIF: they include sea freight and insurance. Before the war that margin was about
# the importer's OECD ITIC share (CIF_BY_IMPORTER; India 7.2%), which remove_freight() takes off. During the war the
# freight on Russian oil rose several-fold (longer routes, war-risk insurance, shadow-fleet charter rates), so CIF unit
# values rose more than the FOB price Russia received, and the windfall counted the freight surge as Russia's income,
# which the shipping part already credits to the tankers' owners. The measured freight is the project's own gross
# freight pool on Russian seaborne crude and products (shipping-notes.md section 1: USD bn per year) over the seaborne
# volumes the same notes use (crude 3.3-3.5 mb/d, products 2.1-2.4 mb/d: midpoints), against the Urals price and the
# Russian product price (energy2.json levels). The importer's freight share each war year is its ITIC share scaled by the
# change in that measured freight share since 2019-2021; the excess comes off the oil part of its payments and off its
# own oil price index, so volumes are unchanged and the windfall compares FOB with the FOB no-war price. Coal and LNG
# keep CIF (no measured freight series); pipeline and other border-priced supplies have no sea freight
FREIGHT_POOL_USD_BN = {"crude": {2019: 3.0, 2020: 3.6, 2021: 2.2, 2022: 8.5, 2023: 11.0, 2024: 8.1, 2025: 7.2, 2026: 9.7},
                       "products": {2019: 2.5, 2020: 2.4, 2021: 2.0, 2022: 5.0, 2023: 5.0, 2024: 4.0, 2025: 3.6, 2026: 3.6}}  # fmt: skip
SEABORNE_MBD = {"crude": 3.4, "products": 2.25}
BBL_PER_T_PRODUCTS = 7.45
FREIGHT_SHARE_CAP = 0.35
# buyers supplied from Russia overland (pipeline, rail, road) with no sea leg from a Russian port: no sea freight surge
# (geography, a judgement; buyers with a measured border-priced share use BORDER_PRICED instead)
OVERLAND_FROM_RUSSIA = {"BLR", "KAZ", "KGZ", "TJK", "UZB", "TKM", "MNG", "ARM", "AZE", "AFG"}


def _freight_share(fuel: str, y: int) -> float:
    """Measured freight as a share of the CIF value of Russian seaborne crude or products in year y (all routes)."""
    days = 365 * (FRAC[YEARS.index(y)] if y in YEARS else 1)
    per_bbl = FREIGHT_POOL_USD_BN[fuel][y] * 1e3 / (SEABORNE_MBD[fuel] * days)
    lv = E2["price_index"]["levels"]
    price = (
        lv["urals_usd_bbl"][str(y)] if fuel == "crude" else lv["russian_products_usd_t"][str(y)] / BBL_PER_T_PRODUCTS
    )
    return per_bbl / (price + per_bbl)


def _freight_share_base(fuel: str) -> float:
    days = {2019: 365, 2020: 366, 2021: 365}
    lv = E2["price_index"]["levels"]
    fr = sum(FREIGHT_POOL_USD_BN[fuel][y] * 1e3 / SEABORNE_MBD[fuel] for y in days)
    val = sum((lv["urals_usd_bbl"][str(y)] if fuel == "crude" else lv["russian_products_usd_t"][str(y)] / BBL_PER_T_PRODUCTS) * d
              for y, d in days.items())  # fmt: skip
    return fr / (val + fr)


def fob_factor(iso3: str, fuel: str, y: int, n: int = 1) -> float:
    """CIF -> FOB factor for one importer's seaborne oil (crude or products) in year y: (1 - war freight share) /
    (1 - pre-war freight share), on the seaborne part only. 1 before 2022, for other fuels and for border-priced trade.
    n picks the ITIC band (0 low, 1 central, 2 high)."""
    if y < 2022 or fuel not in FREIGHT_POOL_USD_BN or iso3 in OVERLAND_FROM_RUSSIA or "freight" in ALT:
        return 1.0
    c = CIF_BY_IMPORTER.get(iso3, CIF_SHARE)[n]
    war = min(FREIGHT_SHARE_CAP, c * _freight_share(fuel, y) / _freight_share_base(fuel))
    sea = 1 - BORDER_PRICED.get(iso3, {}).get(str(y), 0.0)
    return 1 - sea * (1 - (1 - war) / (1 - c))


OIL_PARTS = {"crude": "crude", "crude_gas_hidden": "crude", "products": "products", "other_fossil": "products",
             "diesel": "products", "fuel_oil": "products"}  # fmt: skip


def oil_fob_factor_paid(iso3: str, y: int) -> tuple[float, float]:
    """The CIF -> FOB factor on the whole fuel part of a year's customs payments (prices.json windfall_parts), and that
    fuel part's share of all payments; (1, 0) where customs do not split them."""
    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    paid = {f: (v.get(str(y)) or {}).get("paid") or 0.0 for f, v in parts.items()}
    tot = sum(v for v in paid.values() if v > 0)
    fuel = sum(v for f, v in paid.items() if f != "non_fuel_goods" and v > 0)
    if not tot or not fuel:
        return 1.0, 0.0
    fob = sum(v * fob_factor(iso3, OIL_PARTS[f], y) if f in OIL_PARTS else v for f, v in paid.items()
              if f != "non_fuel_goods" and v > 0)  # fmt: skip
    return fob / fuel, fuel / tot


def payments_fob_factor(iso3: str, y: int, n: int = 1) -> float:
    """Round 14 (C3): factor taking the war-time freight surge out of a year's payments to Russia (after the constant
    ITIC margin): the oil part of payments at FOB. From customs per fuel where measured, else the pre-war split."""
    f, w = oil_fob_factor_paid(iso3, y)
    if n != 1 and w:
        parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
        paid = {k: (v.get(str(y)) or {}).get("paid") or 0.0 for k, v in parts.items() if k != "non_fuel_goods"}
        fuel = sum(v for v in paid.values() if v > 0)
        f = (
            sum(v * fob_factor(iso3, OIL_PARTS[k], y, n) if k in OIL_PARTS else v for k, v in paid.items() if v > 0)
            / fuel
        )
    if not w:
        m = pre_war_fuel_split(iso3)
        tot = sum(m.get(k) or 0.0 for k in ("crude", "products", "gas", "lng", "coal", "other_fossil")) or 1.0
        oil = {"crude": m.get("crude") or 0.0, "products": (m.get("products") or 0.0) + (m.get("other_fossil") or 0.0)}
        w = fossil_share(iso3)
        if not w:
            return 1.0
        f = sum(v / tot * fob_factor(iso3, k, y, n) for k, v in oil.items()) + (1 - sum(oil.values()) / tot)
    return 1 - w * (1 - f)


def move_loan(a: dict, amount: float) -> None:
    """Add (or take out) an amount of loan aid: face value, grant equivalent and the financial category."""
    a["loans_face"] = round(max(0.0, (a.get("loans_face") or 0) + amount), 3)
    a["loans_grant_eq"] = round(max(0.0, (a.get("loans_grant_eq") or 0) + amount * LOAN_GRANT_ELEMENT), 3)
    cats = a.setdefault("cats", {})
    cats["financial"] = round(max(0.0, (cats.get("financial") or 0) + amount), 3)


def fix_artefacts(countries: dict[str, dict]) -> None:
    """Small countries whose headline came from data artefacts (round4b.json): storage terminals, traders' origin labels,
    diamonds bought for resale, front companies, suppressed statistics, a pre-collapse baseline year."""

    def ser(iso3, key):
        return (countries.get(iso3) or {}).get(key)

    # Lebanon: 2019 fuel bought for smuggling into Syria; baseline is the mean of 2018, 2020 and 2021
    if t := ser("LBN", "to_rus"):
        t["base"], t["base_range"] = 0.482 * (1 - CIF_SHARE[1]), [0.42 * (1 - CIF_SHARE[2]), 0.55 * (1 - CIF_SHARE[0])]
        t["_pre_single"] = "researched"  # its own researched pre-war level (round 16b: kept, no small-flow rule)
    # Mauritania: pre-war 'Russian' fuel was traders' origin labels; Russia's own exports x1.1
    if t := ser("MRT", "to_rus"):
        t["base"], t["base_range"] = 0.021, [0.013, 0.035]
        t["years"][0], t["years_lo"][0], t["years_hi"][0] = 0.021, 0.013, 0.035
        t["_pre_single"] = "researched"
    # Saint Lucia and Bonaire: crude and fuel oil to storage terminals, not used there
    for iso3 in ("LCA", "BES"):
        if t := ser(iso3, "to_rus"):
            for k in ("years", "years_lo", "years_hi"):
                t[k] = [0.0] * 6
            t["base"], t["base_range"] = 0.0, [0.0, 0.0]
            t.pop("laundered", None)
    # Gibraltar: fuel bought to sell as bunkers to passing ships; the money comes from shipowners elsewhere. Like the
    # other resellers, it keeps a margin: 10% (5-30%) of its Russian fuel and of the fuel made from Russian crude
    # (judgement, site/content/changelog.md, constants)
    c_gib = countries.get("GIB") or {}
    for key, ks in (("to_rus", ("years", "years_lo", "years_hi")), ("laund", ("years", "years_lo", "years_hi"))):
        if t := c_gib.get(key):
            for k, f in zip(ks, (0.1, 0.05, 0.3)):
                t[k] = [round(v * f, 5) for v in t[k]]
            t["base"] = round(t.get("base", 0) * 0.1, 5)
            if t.get("base_range"):
                t["base_range"] = [round(t["base_range"][0] * 0.05, 5), round(t["base_range"][1] * 0.3, 5)]
            for k, f in (("laundered", 0.1), ("laundered_lo", 0.05), ("laundered_hi", 0.3)):
                if t.get(k):
                    t[k] = [round(v * f, 5) for v in t[k]]
    # Botswana: rough diamonds bought for sorting and resale; only a trading margin stays
    if t := ser("BWA", "to_rus"):
        t["base"], t["base_range"] = 0.006, [0.003, 0.012]
        t["years"][0], t["years_lo"][0], t["years_hi"][0] = 0.006, 0.003, 0.012
        t["_pre_single"] = "researched"
    # Seychelles: shadow-tanker managers registered there are fronts; 20% (5-50%) kept
    if t := ser("SYC", "shipping"):
        for k, f in (("years", 0.2), ("years_lo", 0.05), ("years_hi", 0.5)):
            t[k] = [round(v * f, 5) for v in t[k]]
            if t.get("_fr"):
                t["_fr"][k] = [v * f for v in t["_fr"][k]]
    # Malta: services bought from Russia reported as near zero after 2022 (confidential cells). 2021-2022 are the map's own
    # values and 2023-2026 the fix in round4b.json artefacts.MLT; the +-35% band is a judgement (the width of certainty C)
    if t := ser("MLT", "svc_bought"):
        new = [0.127, 0.133, 0.08, 0.07, 0.06, 0.04]
        t["years"], t["years_lo"], t["years_hi"] = (
            new,
            [round(v * 0.65, 4) for v in new],
            [round(v * 1.35, 4) for v in new],
        )


def apply_audit(countries: dict[str, dict], src: Sources) -> None:
    """Corrections from the audit of 31 major countries against independent sources (research/2026-10/gaps/audit.json)."""
    au = load(GAPS / "audit.json")["countries"]
    aid_src = src.add(
        "audit",
        "Audit of 31 major countries against Kiel, CREA, Eurostat, national statistics and government reports",
        None,
        "2026-10-18",
        "see research/2026-10/gaps/audit-notes.md",
    )
    # the 2026 EU Ukraine Support Loan is guaranteed by 24 members (not Czechia, Hungary, Slovakia): their budget-share
    # slice goes to the other members in proportion to their EU share
    moved = 0.0
    for iso3 in ("CZE", "HUN", "SVK"):
        a, part = (countries.get(iso3) or {}).get("aid"), (au.get(iso3) or {}).get("parts", {}).get("aid", {})
        if not a or not part.get("corrected"):
            continue
        d = max(0.0, part["ours"]["central"] - part["corrected"]["central"])
        d = min(d, (a.get("eu_years") or [0] * 6)[5])
        a["years"][5] = round(a["years"][5] - d, 5)
        a["eu_years"][5] = round(a["eu_years"][5] - d, 5)
        move_loan(a, -d)
        a["src"] = a["src"] + [aid_src]
        if d and aid_src not in a.setdefault("eu_src", []):
            a["eu_src"].append(aid_src)
        moved += d
    others = {i: c["aid"]["eu_share"] for i, c in countries.items() if i in EU27 and i not in ("CZE", "HUN", "SVK") and (c.get("aid") or {}).get("eu_share")}  # fmt: skip
    tot = sum(others.values()) or 1
    for i, sh in others.items():
        a = countries[i]["aid"]
        a["years"][5] = round(a["years"][5] + moved * sh / tot, 5)
        if a.get("eu_years"):
            a["eu_years"][5] = round(a["eu_years"][5] + moved * sh / tot, 5)
            if moved and aid_src not in a.setdefault("eu_src", []):
                a["eu_src"].append(aid_src)
        move_loan(a, moved * sh / tot)
    # Denmark's sales to Russia: between Danish national data and Eurostat
    f = (countries.get("DNK") or {}).get("from_rus")
    if f:
        # the gap between Danish and Eurostat data is not new, so the baseline is scaled the same way
        for k, m in (("years", 1.34), ("years_lo", 0.98), ("years_hi", 1.9)):
            f[k] = [round(v * m, 5) for v in f[k]]
        f["base"] = round(f.get("base", 0) * 1.34, 5)
        if f.get("base_range"):
            f["base_range"] = [round(f["base_range"][0] * 0.98, 5), round(f["base_range"][1] * 1.9, 5)]
        f["src"] = f.get("src", []) + [aid_src]
    # refugee hosting costs from government budgets and audit offices for 27 hosts (round4b.json); Moldova's figures are
    # its own costs, already net of donor funding
    for iso3, d in R4B["refugees"].items():
        a = (countries.get(iso3) or {}).get("aid")
        if not isinstance(d, dict) or "2022" not in d or not a:
            continue
        for k, b in (("refugee_years", "central"), ("refugee_years_lo", "low"), ("refugee_years_hi", "high")):
            a[k] = [0.0] + [round((d.get(str(y)) or {}).get(b, 0), 5) for y in YEARS[1:]]
        a["refugee_cert"] = d.get("certainty") or "B"
        a["refugee_src"] = (a.get("refugee_src") or []) + [aid_src]
    # Poland is now in the list above; the older single correction is kept only if it is missing there
    a = None if "POL" in R4B["refugees"] else (countries.get("POL") or {}).get("aid")
    if a and a.get("refugee_years"):
        tot = sum(a["refugee_years"][1:]) or 1
        a["refugee_years"] = [round(v * 24 / tot, 5) for v in a["refugee_years"]]
        a["refugee_years_lo"] = [max(lo, v * 19 / 24) for lo, v in zip(a["refugee_years_lo"], a["refugee_years"])]
        a["refugee_years_hi"] = [max(hi, v) for hi, v in zip(a["refugee_years_hi"], a["refugee_years"])]
        a["refugee_src"] = (a.get("refugee_src") or []) + [aid_src]


def apply_brunei_r6(countries: dict[str, dict]) -> None:
    """Brunei's customs record only part of the Russian crude its refinery takes in: payments to Russia are the true
    crude intake minus the crude in fuel passed on to its buyers (counted for them as laundered oil), plus any other goods
    from Russia (laundered_r6.json, option B). Runs after apply_narrow(), which sets Brunei's customs values."""
    tr = (countries.get("BRN") or {}).get("to_rus")
    if not tr:
        return
    ref = load(GAPS / "laundered_r6.json")["countries"]["BRN"]["refiner"]
    cus, res = ref["customs_russian_imports_now_in_model_eur_bn"], ref["option_b_residual_kept_by_brunei_eur_bn"]
    # the residual is the true crude intake minus the crude passed on to buyers: at Hengyi's measured ratio (round 9)
    # instead of the round-6 one, a different amount is passed on
    ded = ref["deduct_exported_crude_value_eur_bn"]
    res = {
        y: {
            b: max(0.0, v[b] + ded[y][b] * (1 - crude_k(int(y), "BRN")[i] / R6_K_OLD[i]))
            for i, b in enumerate(("low", "central", "high"))
        }
        for y, v in res.items()
    }
    for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
        tr[k] = [
            round(max(0.0, v - cus.get(str(y), 0.0)) + (res.get(str(y)) or {}).get(b, 0.0), 5)
            for v, y in zip(tr[k], YEARS)
        ]
    r21 = res["2021"]
    tr["base"], tr["base_range"] = round(r21["central"], 5), [round(r21["low"], 5), round(r21["high"], 5)]
    tr["_pre_single"] = "refinery"  # 2021 only: Hengyi started in November 2019 (SMALL_FLOW_EXCLUDE)


BANDS = ("low", "central", "high")

# world gold price level against 2019-2021 (= 1): the customs panel of Russian gold (HS 7108) and, for 2026, the NBP
# gold fixing in euro (prices.json benchmarks, prices-notes.md section 6), rebased from 2018-2021 like own_index()
_GOLD = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/prices.json").read_text())[
    "benchmarks"
]["non_fuel_products_index_vs_2018_2021"]["gold"]
_GOLD_R = sum(_GOLD[str(y)]["central"] for y in (2019, 2020, 2021)) / 3
GOLD_INDEX = {b: [round(_GOLD[str(y)][b] / _GOLD_R, 4) for y in YEARS] for b in BANDS}
# Round 16 (review 5, M1/M6; approved by the owner): a change in the volume of gold is valued at the price a no-war market
# expected, like fuel, not at the war-time gold price. For an asset price the expectation is no change: the 2021 level
# held flat (a judgement; gold futures price only the cost of carry). The rise of the gold price itself is not counted
# as a windfall in the central. Round 16b (check 16, N5): that is a judgement, not a finding. Central banks' gold
# buying after Russia's reserves were frozen in 2022 is widely linked to the war, so some of the rise may be the war's;
# the method band therefore has "gold_actual", gold valued at its actual price
GOLD_NOWAR = [GOLD_INDEX["central"][0]] * len(YEARS)


def gold_in_payments(iso3: str, tr: dict) -> list[float]:
    """Gold inside a country's payments to Russia per year: tagged where the UAE and Hong Kong pass it on, and Hong
    Kong's own rise since before the war (precious metals, almost all gold: HK_METALS_SHARE)."""
    tagged = list(tr.get("_gold") or [0.0] * 6)
    if iso3 == "HKG":
        pidx = tr.get("_pidx_pre") or tr.get("pidx") or [1.0] * 6
        out = tr.get("_refined_out") or [0.0] * 6
        hb = tr.get("base") or tr["years"][0]
        tagged = [
            t + max(0.0, (p or 0.0) + o - hb * FRAC[i] * pidx[i]) * HK_METALS_SHARE[i] if i else t
            for i, (t, p, o) in enumerate(zip(tagged, tr["years"], out))
        ]
    return tagged


def deflate_gold(countries: dict[str, dict]) -> None:
    """Gold in the payments is deflated with the gold price, not the country's pre-war mix (round 13 audit). Hong
    Kong's pre-war imports from Russia were half palladium and platinum, whose price fell after 2022, while what it
    bought since is gold, whose price rose to 2.7 times its 2019-2021 level by 2026: its mix index made the volume of
    gold look 1.3-3 times larger than it was. Each year's index becomes the value-weighted (harmonic) mix of the gold
    index on the gold share and the old index on the rest. The gold price rise itself is not counted, like any other
    non-fuel price rise (site/content/method/prices.md). The gold share is kept for apply_net_gain()."""
    for iso3, c in countries.items():
        tr = c.get("to_rus")
        if not tr:
            continue
        tagged = gold_in_payments(iso3, tr)
        if not any(tagged[1:]):
            continue
        out = tr.get("_refined_out") or [0.0] * 6
        gross = [(p or 0.0) + o for p, o in zip(tr["years"], out)]
        gs = [min(1.0, t / gp) if gp > 0 and i else 0.0 for i, (t, gp) in enumerate(zip(tagged, gross))]
        tr["_gold_a"] = gs
        # round 16: gold's share of the 2022-2026 payments, for the cause named in the "Russia's gain rose" list
        tr["gold_share"] = round(min(1.0, sum(tagged[1:]) / (sum(gross[1:]) or 1)), 3)
        if tr.get("cur") and tr.get("pidx"):
            # round 14 (M5): the gold share is re-inflated by the gold price, the rest as before. Round 16: by the no-war
            # gold price (GOLD_NOWAR), as fuel is valued at no-war prices
            # volumes: the gold share at the actual gold price; valued: at the no-war gold price
            # round 16b (check 16, N5): method-band alternative "gold_actual" values gold at its actual price.
            # Central banks' gold buying after Russia's reserves were frozen (2022) is widely linked to the war, so part
            # of the gold price rise may be the war's; the central keeps the 2021 price, as for other goods
            ga = GOLD_INDEX["central"]
            gn = ga if "gold_actual" in ALT else GOLD_NOWAR
            tr["cur"] = [
                round(((1 - s) / p * k + s / ga[i] * gn[i]) / ((1 - s) / p + s / ga[i]), 4) if s > 0 and p > 0 else k
                for i, (s, p, k) in enumerate(zip(gs, tr["pidx"], tr["cur"]))
            ]
        for key, band in (("pidx", "central"), ("pidx_lo", "low"), ("pidx_hi", "high"), ("_pidx_pre", "central")):
            if not tr.get(key):
                continue
            gi = GOLD_INDEX[band]
            tr[key] = [
                round(1 / ((1 - s) / p + s / gi[i]), 4) if s > 0 and p > 0 else p
                for i, (s, p) in enumerate(zip(gs, tr[key]))
            ]


def apply_net_gain(countries: dict[str, dict], src: Sources) -> None:
    """Trade counts at the seller's net gain, as aid counts at its full value (round 10): a purchase from Russia at
    Russia's gain (taxes plus profit above a normal return, as a share of the price; net_gain_russia.json) and extra
    purchases from Ukraine at Ukraine's (net_gain_ukraine.json). Sales to Russia already count at the seller's profit.
    Stored as weights per year, (low, central, high), for what was expected without the war ("e": the 2019-2021 mix
    of goods bought) and for what was bought ("a": that year's mix); the map applies them (spread() in index.html)."""
    ru = load(GAPS / "net_gain_russia.json")
    ua = load(GAPS / "net_gain_ukraine.json")
    rid = src.add(
        "net_gain_russia",
        "Russia's net gain per euro of exports (taxes plus profit above a normal return): Russian Finance Ministry, company reports, IEA, Rosstat",
        "https://minfin.gov.ru/ru/statistics/fedbud/oil/",
        ru.get("generated"),
        "see research/2026-10/gaps/net_gain_russia-notes.md",
    )
    uid = src.add(
        "net_gain_ukraine",
        "Ukraine's net gain per euro of exports (taxes plus profit above a normal return): Ukrstat, company reports, KSE Institute",
        "https://www.ukrstat.gov.ua/",
        ua.get("generated"),
        "see research/2026-10/gaps/net_gain_ukraine-notes.md",
    )
    g_ru = ru["groups"]
    g = lambda grp, y: tuple((g_ru[grp].get(str(y)) or g_ru[grp]["2025"])[b] for b in BANDS)  # noqa: E731
    fuels = ("crude", "products", "gas", "lng", "coal")

    def mix_gain(fossil: float, shares: dict[str, float], y: int, gold: float = 0.0) -> tuple[float, ...]:
        """Gain share of a mix: fossil share split over the fuels (other fossil as products), gold, the rest other
        goods. Gold is taken out of the non-fuel part (gold passed on by the UAE and Hong Kong is tagged for its buyers;
        Hong Kong's own rise since before the war is gold)."""
        tot = sum(shares.get(f, 0.0) for f in fuels) + shares.get("other_fossil", 0.0) or 1.0
        fuel = [
            sum(shares.get(f, 0.0) * g(f, y)[i] for f in fuels) + shares.get("other_fossil", 0.0) * g("products", y)[i]
            for i in range(3)
        ]
        gold = max(0.0, min(gold, 1 - fossil))
        return tuple(
            fossil * fuel[i] / tot + gold * g("gold", y)[i] + (1 - fossil - gold) * g("non_fuel_average", y)[i]
            for i in range(3)
        )

    energy = load(GAPS / "energy.json")["countries"]
    customs_gas = load(GAPS / "customs_gas.json")["countries"]
    for iso3, c in countries.items():
        tr = c.get("to_rus")
        if not tr:
            continue
        # round 14 (C1, audit): the measured fuel share of pre-war imports, the same fossil_share() the price index and
        # the windfall use; was import_mix()'s fuel share, which for 172 economies outside the 60 largest buyers is the
        # 60-country average (0.574: Yemen's wheat imports were counted as half fuel). The split over fuels is the
        # measured 2018-2021 one too where customs give it (prices.json windfall_parts)
        m = pre_war_fuel_split(iso3)
        fossil0 = fossil_share(iso3)
        # volumes at 2019-2021 prices, as the tracker's fuel volumes below (round 13: not the no-war payments index)
        pidx = tr.get("_pidx_pre") or tr.get("pidx") or [1.0] * 6
        # what the refiner step took off (exported fuel made from Russian crude) counts at the gain on crude, so the mix
        # is measured on the payments before it came off (audit, round 10)
        out = tr.get("_refined_out") or [0.0] * 6
        gross = [(p or 0.0) + o for p, o in zip(tr["years"], out)]
        # gold: tagged where the UAE and Hong Kong pass it on; Hong Kong's own rise since before the war is gold. Its
        # share of each year's payments was measured before the gold price index went in (deflate_gold)
        gold_a = tr.get("_gold_a") or [0.0] * 6
        # fuel per year at constant 2019-2021 prices, by fuel (the tracker's tonnes; Moldova's gas from its customs, as
        # Transnistria's unpaid gas is not counted): the volumes spread() compares, so price changes do not move the mix
        d = energy.get(iso3) or {}
        by_mt = d.get("fossil_from_russia_by_fuel_mt") or {}

        def fuel_val(y: int) -> dict[str, float]:
            val: dict[str, float] = {}
            for f, t in (by_mt.get(str(y)) or {}).items():
                ix = E2["price_index"][FUEL_INDEX.get(f, "products")]["2021"]["central"]
                val[f] = val.get(f, 0.0) + t * EUR_PER_MT_2021.get(f, 0.4) / ix
            if iso3 == "MDA":
                gi = E2["price_index"]["pipeline_gas"]
                val["gas"] = (customs_gas.get("MDA") or {}).get(str(y), 0.0) / gi[str(y)]["central"]
            return val

        v21, q21 = sum(fuel_val(2021).values()), gross[0] / (pidx[0] or 1.0)
        tracker = bool(by_mt) and v21 > 0 and q21 > 0
        copied = tracker_copied_years(by_mt) if tracker else []
        # round 14 (C2, audit): the fuel share of what was bought comes from the country's own customs values per fuel,
        # each deflated by its own price level (prices.json windfall_parts), not from the tracker's tonnes, which for
        # some buyers contradict customs (Uzbekistan's 2024 products 13 times 2021) or repeat the year before. The
        # tracker's tonnes only split the fuel share over fuels, except in copied years. The change is taken in odds
        # against the pooled 2018-2021 customs share, so 2021 behaviour and constant volumes leave the mix unchanged and
        # nothing is capped at 100% fuel
        cv = customs_fuel_volumes(iso3) if "fuelmix" not in ALT else {}
        ref = [sum(v for f, v in cv.get(y, {}).items() if f != "non_fuel_goods") for y in (2018, 2019, 2020, 2021)]
        ref_tot = sum(sum(cv.get(y, {}).values()) for y in (2018, 2019, 2020, 2021))
        s_ref = sum(ref) / ref_tot if ref_tot > 0 else None
        # the pooled 2018-2021 customs split over fuels, against which a year's customs split is compared
        c_ref: dict[str, float] = {}
        for y in (2018, 2019, 2020, 2021):
            for f, v in cv.get(y, {}).items():
                if f != "non_fuel_goods":
                    c_ref[CUSTOMS_FUEL[f]] = c_ref.get(CUSTOMS_FUEL[f], 0.0) + v
        c_ref = {f: v / sum(c_ref.values()) for f, v in c_ref.items()} if sum(c_ref.values()) > 0 else {}
        sh_e = m
        if tracker:
            f21 = fuel_val(2021)
            sh_e = {f: v / v21 for f, v in f21.items()}
        # expected: the measured fossil share with the tracker's 2021 split of fuels (else the pre-war split)
        e = [mix_gain(fossil0, sh_e, y) for y in YEARS]
        a, basis = [], []
        for i, y in enumerate(YEARS):
            val = fuel_val(y) if tracker else {}
            fv = sum(val.values())
            tsplit = {f: v / fv for f, v in val.items()} if fv > 0 and y not in copied else None
            vol = cv.get(y)
            cfuel = sum(v for f, v in (vol or {}).items() if f != "non_fuel_goods")
            if vol and s_ref is not None and 0 < s_ref < 1:
                fossil = _odds_shift(fossil0, cfuel / sum(vol.values()), s_ref)
                csplit: dict[str, float] = {}
                for f, v in vol.items():
                    if f != "non_fuel_goods":
                        csplit[CUSTOMS_FUEL[f]] = csplit.get(CUSTOMS_FUEL[f], 0.0) + v / cfuel
                if not tsplit and csplit:
                    # a copied tracker year, or no tracker: the expected split moved by the customs change per fuel
                    # since 2018-2021 (a fuel customs did not record before the war enters at its own share)
                    w = {f: sh_e.get(f, 0.0) * csplit.get(f, 0.0) / c_ref[f] for f in c_ref if c_ref[f] > 0}
                    w.update({f: v for f, v in csplit.items() if f not in c_ref or c_ref[f] <= 0})
                    wt = sum(w.values())
                    tsplit = {f: v / wt for f, v in w.items()} if wt > 0 else csplit
                a.append(mix_gain(fossil, tsplit or sh_e, y, gold_a[i]))
                basis.append("customs")
            elif tracker:
                # no customs split by fuel: the tracker's change in fuel volume against all payments in volume since
                # 2021 (capped at all fuel: no customs to check it against)
                q = gross[i] / (pidx[i] or 1.0)
                fossil = min(1.0, fossil0 * (fv / q) / (v21 / q21)) if q > 0 else 0.0
                a.append(mix_gain(fossil, tsplit or sh_e, y, gold_a[i]))
                basis.append("tracker" + (" (copied year)" if y in copied else ""))
            else:
                a.append(mix_gain(fossil0, m, y, gold_a[i]))
                basis.append("pre-war mix")
        # back to the payments after the refiner step: what came off counts at the gain on crude
        a = [
            tuple((gp * aa[n] - o * g("crude", y)[n]) / p if p and p > 0 else aa[n] for n in range(3))
            for gp, aa, o, p, y in zip(gross, a, out, tr["years"], YEARS)
        ]
        tr["gain"] = {k: [[round(max(0.0, t[n]), 4) for t in w] for n in range(3)] for k, w in (("e", e), ("a", a))}
        # the fuel share the mix used, published so check_data.py can test it is the price index's (round 14, C1)
        tr["gain"]["fossil_share"] = round(fossil0, 4)
        # how the mix of what was bought was measured each year, and the tracker years that repeat the year before
        tr["gain"]["basis"] = basis
        if copied:
            tr["gain"]["tracker_copied"] = copied
        if rid not in tr.setdefault("src", []):
            tr["src"].append(rid)
        # fuel made from Russian crude elsewhere: Russia's gain on crude; relabelled Russian products at the products gain
        crude = [g("crude", y) for y in YEARS]
        lb = c.get("laund") or {}
        prod = lb.get("_prod") or [0.0] * 6
        la = [
            tuple(cr[n] + (min(1.0, pv / lv) if lv > 0 else 0.0) * (g("products", y)[n] - cr[n]) for n in range(3))
            for cr, pv, lv, y in zip(crude, prod, lb.get("years") or [0.0] * 6, YEARS)
        ]
        tr["laund_gain"] = {
            "e": [[round(cr[n], 4) for cr in crude] for n in range(3)],
            "a": [[round(t[n], 4) for t in la] for n in range(3)],
        }
        # every part weighted by these shares cites them (round 11 audit): fuel made from Russian crude, services,
        # weapons bought from Russia, the state-finance customs correction, gold and hidden payments
        if (tr.get("laundered") or c.get("laund")) and rid not in tr.setdefault("laundered_src", []):
            tr["laundered_src"].append(rid)
        sb = c.get("svc_bought")
        if sb:
            sb["gain"] = [[round(g("services", y)[n], 4) for y in YEARS] for n in range(3)]
            if rid not in sb.setdefault("src", []):
                sb["src"].append(rid)
        # weapons bought from Russia, stored as yearly changes: scaled here; the Rosatom customs correction inside the
        # state-finance part comes out of payments counted at Russia's gain, so it is rescaled to that gain (audit)
        for x in c.get("extra") or []:
            grp = {"rusarms": "arms"}.get(x["k"])
            if grp:
                # stored as the shift toward Ukraine: each end takes whichever gain share moves it furthest
                gs = [g(grp, y) for y in YEARS]
                x["c"] = [round(v * gg[1], 5) for v, gg in zip(x["c"], gs)]
                x["l"] = [round(min(v * gg[0], v * gg[2]), 5) for v, gg in zip(x["l"], gs)]
                x["h"] = [round(max(v * gg[0], v * gg[2]), 5) for v, gg in zip(x["h"], gs)]
            if x.get("_cc"):
                for k in ("c", "l", "h"):
                    x[k] = [round(v - cc * (1 - aa[1]), 5) for v, cc, aa in zip(x[k], x["_cc"], a)]
            if (grp or x.get("_cc")) and rid not in x.setdefault("src", []):
                x["src"].append(rid)
        # gold and hidden payments stay in money (the "To Russia" view); the map weights them at Russia's gain on gold
        hd = c.get("hidden")
        if hd:
            hd["gain"] = [[round(g("gold", y)[n], 4) for y in YEARS] for n in range(3)]
            if rid not in hd.setdefault("src", []):
                hd["src"].append(rid)
    # extra purchases from Ukraine: Ukraine's gain, by the buyer's own mix where known
    g_ua = ua["groups"]
    for iso3, c in countries.items():
        bu = c.get("buy_ukr")
        if not bu:
            continue
        mix = (ua.get("buyer_mix") or {}).get(iso3)
        rows = []
        for y in YEARS:
            if mix:
                tot = sum(mix.values()) or 1
                rows.append(
                    tuple(
                        sum(
                            w * ((g_ua.get(k) or g_ua["average"]).get(str(y)) or g_ua["average"][str(y)])[b]
                            for k, w in mix.items()
                        )
                        / tot
                        for b in BANDS
                    )
                )
            else:
                rows.append(tuple(g_ua["average"][str(y)][b] for b in BANDS))
        bu["gain"] = [[round(t[n], 4) for t in rows] for n in range(3)]
        if uid not in bu.setdefault("src", []):
            bu["src"].append(uid)


def apply_relocants(countries: dict[str, dict]) -> None:
    """Russians who moved abroad after 2022 and spend there count in the host's travel credits from Russia. That is
    money leaving Russia, not income from it, so its share comes out of services sold to Russia (relocants.json,
    round 7; Georgia's central bank applies the one-year residence rule explicitly)."""
    rl = load(GAPS / "relocants.json")
    for iso3, d in rl["countries"].items():
        t = (countries.get(iso3) or {}).get("svc_sold")
        sh = d.get("relocant_share_of_svc_sold") or {}
        if not t:
            continue
        # the low value of what was sold takes the high share, and the other way round
        for k, b in (("years", "central"), ("years_lo", "high"), ("years_hi", "low")):
            t[k] = [round(v * (1 - (sh.get(str(y)) or {}).get(b, 0.0)), 5) for v, y in zip(t[k], YEARS)]
        t["relocants_out"] = True


def apply_narrow(countries: dict[str, dict], src: Sources) -> None:
    """Better data for the countries with the widest ranges (official statistics of Belarus, the EAEU members,
    Uzbekistan, Georgia, Turkey; tourism counts; intelligence estimates for North Korea): research/2026-10/gaps/narrow.json.
    Services there use the 2019-2021 average as the baseline (not COVID-hit 2021)."""
    nw = load(GAPS / "narrow.json")["countries"]
    nid = src.add(
        "narrow",
        "Official trade and services statistics and tourism counts for countries with wide ranges (Belstat, NBG, TÜİK, stat.uz, INSS)",
        None,
        "2026-10-18",
        "see research/2026-10/gaps/narrow-notes.md",
    )
    for iso3, series in nw.items():
        c = countries.get(iso3)
        if not c:
            continue
        for key, d in series.items():
            if key == "military_rus":  # replaced by military_rus_r6.json (round 6)
                continue
            obj = c.setdefault(key, {"cert": d.get("certainty") or "C", "src": []})
            # entries marked as unchanged only bring a better baseline or price index, not new yearly values; entries with
            # customs-level values (trade_layer) already entered at the start
            if not (d.get("reasoning") or "").startswith("Values unchanged") and not d.get("trade_layer"):
                delta = obj.get("_refine_delta") or {}
                for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    old = obj.get(k) or [0.0] * 6
                    new = [(d["years"].get(str(y)) or {}).get(b, old[i]) for i, y in enumerate(YEARS)]
                    # narrow.json used the first re-export shares: the refined shares' extra amount is taken out again
                    dl = delta.get(k) or [0.0] * 6
                    obj[k] = [round(max(0.0, v - x), 5) for v, x in zip(new, dl)]
            if d.get("base"):
                obj["base"] = round(d["base"]["central"], 5)
                obj["base_range"] = [round(d["base"]["low"], 5), round(d["base"]["high"], 5)]
                if key.startswith("svc_"):
                    obj["base_2019_2021"] = True
            for k in ("pidx", "pidx_lo", "pidx_hi"):
                # Türkiye's payments are priced from turkey_prices.json (round 5), not narrow.json's index
                if d.get(k) and not (iso3 == "TUR" and key == "to_rus"):
                    v = d[k]
                    obj[k] = [round(v[str(y)] if isinstance(v, dict) else v[i], 4) for i, y in enumerate(YEARS)]
            if d.get("certainty"):
                obj["cert"] = d["certainty"]
            if nid not in obj.setdefault("src", []):
                obj["src"].append(nid)


R4B = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/round4b.json").read_text())
AUDIT2 = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/audit2.json").read_text())
# share of each country's payments to Russia priced at the border (audit 2, question 7), per year and for 2019-2021
BORDER_PRICED: dict[str, dict] = {}
for _x in AUDIT2["questions"][6]["corrections"]:
    BORDER_PRICED.setdefault(_x["country"], {})[str(_x["year"])] = _x["central"]
# 2021 uses the pre-war share
for _v in BORDER_PRICED.values():
    _v.setdefault("2021", _v.get("2019-2021", 0.0))


def uae_fuel_net(countries: dict[str, dict]) -> None:
    """Fuel CREA tracks to the UAE minus the part UAE customs already record (round4b): lower in 2024-2026."""
    tr = (countries.get("ARE") or {}).get("to_rus")
    if not tr:
        return
    for y, d in ((2024, 0.37), (2025, 0.62), (2026, 0.19)):
        i = YEARS.index(y)
        for k in ("years", "years_lo", "years_hi"):
            tr[k][i] = round(max(0.0, tr[k][i] - d), 5)


def apply_audit2(countries: dict[str, dict], src: Sources, stage: str) -> None:
    """Corrections from the second audit (research/2026-10/gaps/audit2.json). Stage "values": changes to yearly values
    and baselines (UAE gold via Armenia and 2026 hidden gold, Russian fuel delivered to the UAE, France's undisclosed
    aid already in Kiel, the structural pre-war gap in Russia's import statistics). Stage "trends": pre-war trends
    fitted on the full 2012-2021 window where the post-2016 window was only a rebound (Kazakhstan, Montenegro...).
    Baltic and Finnish transit (question 6) is applied separately, in baltic_transit()."""
    aid2 = src.add(
        "audit2",
        "Second audit: UAE gold and fuel, undisclosed aid, Russia's import-statistics gap, trend windows, border-priced imports",
        None,
        "2026-10-18",
        "see research/2026-10/gaps/audit2-notes.md",
    )
    for q in AUDIT2["questions"]:
        for x in q["corrections"]:
            c = countries.get(x["country"])
            if not c:
                continue
            if stage == "values" and x["field"] in ("years", "base") and q["id"] in ("Q1", "Q2", "Q3", "Q4"):
                obj = c.setdefault(x["series"], {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6, "base": 0, "base_range": [0, 0], "cert": "C", "src": []})  # fmt: skip
                if x["field"] == "base":
                    obj["base"] = round(max(0.0, obj.get("base", 0) + x["central"]), 5)
                    br = obj.get("base_range") or [obj["base"], obj["base"]]
                    obj["base_range"] = [round(max(0.0, br[0] + x["low"]), 5), round(max(0.0, br[1] + x["high"]), 5)]
                else:
                    i = YEARS.index(int(x["year"]))
                    # each band's change goes to that band (a cut can be largest at the high end)
                    for k, d in (("years", x["central"]), ("years_lo", x["low"]), ("years_hi", x["high"])):
                        arr = obj.setdefault(k, [0.0] * 6)
                        arr[i] = round(max(0.0, arr[i] + d), 5)
                    band = (obj["years_lo"][i], obj["years"][i], obj["years_hi"][i])
                    obj["years_lo"][i], obj["years_hi"][i] = min(band), max(band)
                if aid2 not in obj.setdefault("src", []):
                    obj["src"].append(aid2)
            elif stage == "trends" and x["field"] == "bmul" and q["id"] == "Q5":
                obj = c.get(x["series"])
                # corrections to the old trends; the back-tested counterfactual replaces them
                if not obj or not obj.get("bmul") or obj.get("cf"):
                    continue
                i = YEARS.index(int(x["year"]))
                obj["bmul"][i], obj["bmul_lo"][i], obj["bmul_hi"][i] = (
                    x["central"],
                    min(x["low"], x["central"]),
                    max(x["high"], x["central"]),
                )


# EU refiners treated as India, Türkiye and China are (round 13 audit): the Russian crude in the fuel they export is
# charged to the buyers, before and after the war alike, and the refiner keeps only what it used itself. Russian crude
# by refiner and year and its export share from round4a.json "eu_refiners"; 2021 crude from the CREA tracker's tonnes
# (energy.json) at 2021 prices; buyers from each refiner's own UN Comtrade HS 2710 exports by partner in 2021
# (raw/comtrade_2710). Fuel exported to Ukraine, to bunkers or to places not on the map stays with the refiner
def _hub_chain(refiner: str, buyers: dict[str, float], band: int) -> dict[str, float]:
    """Round 14 (H3): a refiner's export shares after trading hubs pass on what they resell (hub_exports_2024.json,
    hub_buyers.json), through chains of hubs; band 0/1/2 = the buyers' low, central and high end (low: the hubs resell
    their low share and keep the bunkers; high: they resell their high share)."""
    hubs = load(GAPS / "hub_exports_2024.json")["shares"]
    for hub, d in load(GAPS / "hub_buyers.json")["hubs"].items():
        hubs.setdefault(hub, {k: v["central"] for k, v in d["destination_shares"].items() if k != "other"})
    out = dict(buyers)
    pending = {h: v for h, v in buyers.items() if h in HUB_RESALE and h != refiner}
    for _ in range(30):
        if not any(v > 1e-9 for v in pending.values()):
            break
        for hub in list(pending):
            amount = pending.pop(hub)
            lo, mid, hi = HUB_RESALE[hub]
            keep_out, give = ((hi + HUB_BUNKER.get(hub, 0.0), lo), (mid + HUB_BUNKER_HALF_MID.get(hub, 0.0), mid),
                              (lo, hi))[band]  # fmt: skip
            shares = {d: w for d, w in (hubs.get(hub) or {}).items() if d != hub}
            norm = sum(shares.values())
            if not norm:
                continue
            out[hub] = out.get(hub, 0.0) - amount * min(1.0, keep_out)
            for d, w in shares.items():
                x = amount * give * w / norm
                out[d] = out.get(d, 0.0) + x
                if d in HUB_RESALE and d != refiner:
                    pending[d] = pending.get(d, 0.0) + x
    return {k: max(0.0, v) for k, v in out.items()}


def eu_refiner_exports(countries: dict[str, dict], src: Sources, rid: str) -> None:
    """Round 13 (step 7): the Russian crude in fuel that EU refiners exported is charged to the buyers, as for India and
    Türkiye, split by each refiner's own UN Comtrade HS 2710 exports by partner in 2021.

    Round 13b (owner): a change in this route counts for a buyer only where both the pre-war and the post-war route
    are measured for that buyer. Before the war the route is measured for every buyer (the refiners' 2021 exports by
    partner). After the EU ban (crude from 5 December 2022, fuel from 5 February 2023) fuel made from Russian crude
    reaches buyers through India, Türkiye, the UAE and China instead, and that route is measured at the buyer only
    (covered, below): for EU members, from their own customs records (laundered_eu.json, checked against CREA), and
    for buyers named in the post-war fuel-export records of India, Türkiye and the UAE (hub_buyers.json, their own
    reports for 2022-2025) or among the importers that record fuel via Togo (refine.json togo_buyers) - unless a cap,
    not a measurement, sets their post-war value (Togo, Liberia, Panama, ship registries). For the other buyers the
    route's 2023-2026 values are held at the level expected without the war (no change counted) and labelled "route
    not measured after 2022"; 2022 keeps the EU refiners' own measured exports."""
    if "refiner" in ALT:
        return
    eu = load(GAPS / "round4a.json")["eu_refiners"]["by_country"]
    energy = load(GAPS / "energy.json")["countries"]
    raw = ROOT / "research" / "2026-10" / "raw" / "comtrade_2710"
    num_iso = {iso_numeric(i): i for i in countries}
    eid = src.add(
        "eu_refiners",
        "EU refiners' fuel exports made from Russian crude: refinery export shares (round4a.json), CREA tracker crude volumes, each refiner's UN Comtrade HS 2710 exports by partner (2021)",
        "https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=440&period=2021&cmdCode=2710&flowCode=X",
        "2026-10-19",
        "the Russian crude in exported fuel is charged to the buyers, as for India and Türkiye; see How it works",
    )
    hb = load(GAPS / "hub_buyers.json")["hubs"]
    named = {b for h in ("IND", "TUR", "ARE") for b in hb[h]["destination_shares"] if b != "other"}
    named |= {b for b, v in REFINE["togo_buyers"].items() if isinstance(v, dict) and "central" in v}
    covered = {
        b for b in countries if b in EU27 or (b in named and not (countries[b].get("laund") or {}).get("_capped"))
    }
    if "laund_route" in ALT:
        covered = set(countries)
    ural = idx("urals", "central")
    for r, d in eu.items():
        c = countries.get(r)
        tr = (c or {}).get("to_rus")
        f = raw / f"{r}_2021_X_2710.json"
        if not tr or not f.exists():
            continue
        rows = json.loads(f.read_text())["data"]
        world = sum(x["primaryValue"] for x in rows if x["partnerCode"] == 0) or 1.0
        buyers: dict[str, float] = {}
        for x in rows:
            b = num_iso.get(str(x["partnerCode"]).zfill(3))
            if b and b != r and countries[b].get("to_rus"):
                buyers[b] = buyers.get(b, 0.0) + x["primaryValue"] / world
        moved = sum(buyers.values())  # the share exported to buyers with payments to Russia; the rest stays home
        # round 14 (H3, audit): trading hubs among the buyers (Rotterdam, Antwerp, Malta, Singapore...) pass on what
        # they resell to their own customers, as hubs do for other laundered oil (reassign_laundered_oil); fuel that
        # comes back to the refiner through a hub is its own use and stays with it (the Netherlands-Belgium-Germany
        # circle); bunker fuel sold to ships at a hub is charged to no country
        final = {b3: _hub_chain(r, buyers, b3) for b3 in range(3)}
        back = {b3: final[b3].pop(r, 0.0) for b3 in range(3)}
        for b3 in range(3):  # hub customers with no payments to Russia on the map: stays with the refiner, as before
            for b in [b for b in final[b3] if not (countries.get(b) or {}).get("to_rus")]:
                back[b3] += final[b3].pop(b)
        moved_net = moved - back[1]
        sh = d["product_export_share"]
        crude21 = ((energy.get(r) or {}).get("fossil_from_russia_by_fuel_mt") or {}).get("2021", {}).get("crude", 0.0)
        crude = {2021: {b: crude21 * EUR_PER_MT_2021["crude"] * sh[b] for b in ("low", "central", "high")}}
        for y, v in d["by_year"].items():
            crude[int(y)] = v["exported_crude_value_eur_bn"]
        ex = {
            k: [(crude.get(y) or {}).get(b, 0.0) * moved_net for y in YEARS]
            for k, b in (("years", "central"), ("years_lo", "high"), ("years_hi", "low"))
        }
        if not any(ex["years"]):
            continue
        gross = list(tr["years"])
        # the refiner: its payments before and after the war, at the same share (the pre-war level at 2019-2021 prices)
        for k in ("years", "years_lo", "years_hi"):
            tr[k] = [round(max(0.0, v - x), 5) for v, x in zip(tr[k], ex[k])]
        cut = min(1.0, ex["years"][0] / gross[0]) if gross[0] else 0.0
        tr["base"] = round(tr.get("base", 0.0) * (1 - cut), 5)
        if tr.get("base_range"):
            tr["base_range"] = [round(v * (1 - cut), 5) for v in tr["base_range"]]
        out = tr.get("_refined_out") or [0.0] * 6
        tr["_refined_out"] = [o + g - v for o, g, v in zip(out, gross, tr["years"])]
        tr["src"] = tr.get("src", []) + [eid]
        # the buyers: laundered oil, its pre-war level included; final buyers after the hubs' resale (central weights;
        # each end of the range takes its own resale share)
        for b, w in final[1].items():
            if w <= 0 or b not in countries or not countries[b].get("to_rus"):
                continue
            bc = countries[b]
            lb = bc.get("laund")
            if lb is None:
                t = bc["to_rus"]
                lb = bc["laund"] = {"years": list(t.get("laundered") or [0.0] * 6), "years_lo": list(t.get("laundered_lo") or t.get("laundered") or [0.0] * 6),
                                    "years_hi": list(t.get("laundered_hi") or t.get("laundered") or [0.0] * 6), "base": 0.0, "base_range": [0.0, 0.0], "cert": "C", "src": list(t.get("laundered_src") or [])}  # fmt: skip
            # the buyer's low end takes the low export share (ex holds the refiner's ends, the other way round)
            add = {
                k: [x * final[n].get(b, 0.0) / moved_net for x in ex[kx]]
                for k, kx, n in (("years", "years", 1), ("years_lo", "years_hi", 0), ("years_hi", "years_lo", 2))
            }
            add["years_lo"] = [min(a, m) for a, m in zip(add["years_lo"], add["years"])]
            add["years_hi"] = [max(a, m) for a, m in zip(add["years_hi"], add["years"])]
            w = w * moved / moved_net  # the buyer's share of what the refiner's payments lose (ex)
            # round 14 (H2, audit): the pre-war growth of laundered oil (round4a.json) was measured on the fuel refined
            # in China, India and Türkiye before the war, not on EU refiners' exports: it stays on that base only. The
            # expected path is re-weighted so the EU-refined part added here is flat (its pre-war level x no-war price)
            b_add = ex["years"][0] * w / moved
            b_old = lb.get("base", 0.0)
            if lb.get("bmul") and b_old + b_add > 0:
                for k in ("bmul", "bmul_lo", "bmul_hi"):
                    lb[k] = [round((b_old * v + b_add) / (b_old + b_add), 4) for v in lb.get(k) or lb["bmul"]]
            if b not in covered:
                # route not measured after 2022: 2023-2026 at the expected level, so no change is counted. In money at
                # the Urals price, so that laundered_volumes() turns it into exactly the expected volume (the pre-war
                # level, flat, x the no-war crude price)
                e21 = ex["years"][0] * w / moved
                held = [e21 * FRAC[i] * ural[i] / ural[0] for i in range(6)]
                for k in add:
                    add[k] = add[k][:2] + held[2:]
                lb["eu_route_held"] = True
            for k in add:
                lb[k] = [round(v + x, 5) for v, x in zip(lb[k], add[k])]
            lb["base"] = round(lb.get("base", 0.0) + ex["years"][0] * w / moved, 5)
            br = lb.get("base_range") or [0.0, 0.0]
            lb["base_range"] = [
                round(br[0] + ex["years_hi"][0] * w / moved, 5),
                round(br[1] + ex["years_lo"][0] * w / moved, 5),
            ]
            lb.setdefault("eu_refined", []).append(r)
            for x in (rid, eid):
                if x not in lb["src"]:
                    lb["src"].append(x)
            bc["to_rus"]["laundered"] = lb["years"]
            bc["to_rus"]["laundered_lo"] = lb["years_lo"]
            bc["to_rus"]["laundered_hi"] = lb["years_hi"]


def baltic_transit(countries: dict[str, dict]) -> None:
    """Goods that only passed through the Baltic states and Finland: Russian goods passed on unprocessed to buyers
    elsewhere, and goods made elsewhere re-exported to Russia (audit 2, question 6). Both are taken out of their trade
    with Russia, before and after the war alike; re-exports go to the EU countries that made the goods (7% margin
    stays). Crude refined in Lithuania and Finland is real processing and stays."""
    q6 = [x for x in AUDIT2["questions"][5]["corrections"]]
    makers = {
        i: (countries[i].get("from_rus") or {}).get("base", 0)
        for i in EU27
        if i in countries and i not in ("EST", "LVA", "LTU", "FIN")
    }
    mk_tot = sum(makers.values()) or 1
    for x in q6:
        c = countries.get(x["country"])
        obj = (c or {}).get(x["series"])
        if not obj:
            continue
        keep = 0.07 if x["series"] == "from_rus" else 0.0
        sh = {"years": x["central"], "years_lo": x["high"], "years_hi": x["low"]}
        moved = {}
        for k in ("years", "years_lo", "years_hi"):
            f = sh[k] * (1 - keep)
            moved[k] = [v * f for v in obj[k]]
            obj[k] = [round(v * (1 - f), 5) for v in obj[k]]
        base_moved = obj.get("base", 0) * x["central"] * (1 - keep)
        obj["base"] = round(obj.get("base", 0) - base_moved, 5)
        if obj.get("base_range"):
            br = obj["base_range"]
            obj["base_range"] = [
                round(br[0] * (1 - x["high"] * (1 - keep)), 5),
                round(br[1] * (1 - x["low"] * (1 - keep)), 5),
            ]
        if x["series"] == "from_rus":
            for i, w in makers.items():
                f = countries[i]["from_rus"]
                for k in moved:
                    f[k] = [round(v + m * w / mk_tot, 5) for v, m in zip(f[k], moved[k])]
                f["base"] = round(f.get("base", 0) + base_moved * w / mk_tot, 5)
                if f.get("base_range"):
                    f["base_range"] = [
                        round(f["base_range"][0] + base_moved * w / mk_tot, 5),
                        round(f["base_range"][1] + base_moved * w / mk_tot, 5),
                    ]


def remove_freight(countries: dict[str, dict]) -> None:
    """Payments to Russia at the Russian border (FOB): the freight and insurance inside import values are taken out."""
    for c in countries.values():
        tr = c.get("to_rus")
        if not tr:
            continue
        # pipeline gas and crude, electricity and trade over land are priced at the border: no sea freight to take out
        bp = BORDER_PRICED.get(c["iso3"], {})
        # round 11: the importer's own freight margin (OECD ITIC), and gold at the gold margin. ITIC is mostly a
        # distance model, not split by transport mode, so it still applies only to what is not priced at the border
        cif = CIF_BY_IMPORTER.get(c["iso3"], CIF_SHARE)
        # gold in the payments: passed on by the UAE and Hong Kong (tagged), and Hong Kong's own rise since before the war
        gold = list(tr.get("_gold") or [0.0] * 6)
        if c["iso3"] == "HKG":
            hb = tr.get("base") or tr["years"][0]
            gold = [g + (max(0.0, v - hb * FRAC[i]) * HK_METALS_SHARE[i] if i else 0.0) for i, (g, v) in enumerate(zip(gold, tr["years"]))]  # fmt: skip
        for k, n in (("years", 1), ("years_lo", 2), ("years_hi", 0)):
            out = []
            for i, (v, y) in enumerate(zip(tr[k], YEARS)):
                gl = min(v, gold[i])
                # round 14 (C3): and the war-time rise in sea freight on oil (payments_fob_factor)
                fob = payments_fob_factor(c["iso3"], y, n)
                out.append(round((v - gl) * (1 - cif[n] * (1 - bp.get(str(y), 0.0))) * fob + gl * (1 - CIF_GOLD[n]), 5))
            tr[k] = out
        b0 = 1 - bp.get("2019-2021", 0.0)
        tr["base"] = round(tr.get("base", 0) * (1 - cif[1] * b0), 5)
        if tr.get("base_range"):
            br = tr["base_range"]
            tr["base_range"] = [round(br[0] * (1 - cif[2] * b0), 5), round(br[1] * (1 - cif[0] * b0), 5)]


def apply_shipping(countries: dict[str, dict], src: Sources, note) -> None:
    """Income from carrying, insuring and financing Russian oil and LNG exports, and from selling tankers to the shadow
    fleet, by the country of the company that earns it. The share already inside services trade with Russia is left out."""
    sh = load(GAPS / "shipping.json")
    sid = src.add(
        "shipping",
        "Tanker shipping, insurance and ship sales serving Russian oil and LNG exports: CREA, KSE Institute, S&P Global, Windward, press reports",
        "https://energyandcleanair.org/",
        sh.get("generated"),
        "freight = barrels x freight rates, split by owner or manager country; see research/2026-10/gaps/shipping-notes.md",
    )
    # freight by the country that really controls each tanker (shadow_fleet.json, round 5): replaces shipping.json's
    # freight split; Russian-owned tankers behind UAE, Indian and Hong Kong fronts count for nobody abroad
    sf = load(
        GAPS / "shadow_fleet_r6.json"
    )  # round 6: Russian share of opaque owners from sanctions and investigations
    src.add(
        "shadow_fleet",
        "Tanker control by country: KSE Institute shadow-fleet tracker, Lloyd's List, S&P Global, Kpler and Windward reporting, US/UK/EU sanctions designations",
        "https://kse.ua/russia-will-pay/",
        sf.get("generated"),
        "beneficial owner or commercial controller, not the registered manager; see research/2026-10/gaps/shadow_fleet_r6-notes.md",
    )
    for iso3 in sf["countries"]:
        sh["countries"].setdefault(iso3, {})
    parts = ("freight", "ship_sales", "insurance_finance", "registry")
    for iso3, d in sh["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        f = sf["countries"].get(iso3) or {}
        fs = f.get("freight_scale_vs_shipping_json") or {}
        d = {**d, "freight": f.get("freight") or {}, "certainty": f.get("certainty") or d.get("certainty")}
        # the freight baseline follows the same split; fronts (Seychelles, Marshall Islands) have none
        d["baseline_2019_2021"] = f.get("baseline_2019_2021") or {}
        if d.get("insurance_finance") and fs:
            d["insurance_finance"] = {
                y: {b: (x * (fs.get(y) or 1.0) if isinstance(x, (int, float)) else x) for b, x in v.items()}
                for y, v in d["insurance_finance"].items()
            }
        ov = d.get("overlap_share_with_services_sold_to_rus") or {}
        out = {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6}
        # gross freight kept apart: apply_value_kept() replaces its profit share with the money rule (round 6)
        fr = {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6}
        # and gross insurance and finance: round 13 counts it at the insurers' net gain, like every other seller
        ins = {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6}
        for part in parts:
            for i, y in enumerate(YEARS):
                v = (d.get(part) or {}).get(str(y)) or {}
                o = ov.get(f"{part}_2021_2022" if part == "insurance_finance" and y <= 2022 else part) or {}
                # the low end leaves out the most overlap, the high end the least; only the profit counts
                pr = SHIPPING_PROFIT[part]
                # Russia's own fleet behind fronts and 2026 freight rates are already inside shadow_fleet.json
                sc, f26 = {"low": 1, "central": 1, "high": 1}, 1.0
                out["years"][i] += v.get("central", 0) * (1 - o.get("central", 0)) * pr[1] * sc["central"] * f26
                out["years_lo"][i] += v.get("low", 0) * (1 - o.get("high", 0)) * pr[0] * sc["low"] * f26
                out["years_hi"][i] += v.get("high", 0) * (1 - o.get("low", 0)) * pr[2] * sc["high"] * f26
                if part in ("freight", "insurance_finance"):
                    g = fr if part == "freight" else ins
                    g["years"][i] += v.get("central", 0) * (1 - o.get("central", 0))
                    g["years_lo"][i] += v.get("low", 0) * (1 - o.get("high", 0))
                    g["years_hi"][i] += v.get("high", 0) * (1 - o.get("low", 0))
        if not any(out["years_hi"]):
            continue
        b, ob = d.get("baseline_2019_2021") or {}, ov.get("freight") or {}
        c["shipping"] = {k: [round(v, 5) for v in vals] for k, vals in out.items()} | {
            "base": round(b.get("central", 0) * (1 - ob.get("central", 0)) * SHIPPING_PROFIT["freight"][1], 5),
            "base_range": [
                round(b.get("low", 0) * (1 - ob.get("high", 0)) * SHIPPING_PROFIT["freight"][0], 5),
                round(b.get("high", 0) * (1 - ob.get("low", 0)) * SHIPPING_PROFIT["freight"][2], 5),
            ],
            "cert": d.get("certainty") or "D",
            "src": [sid],
            "_ins": ins,
            "_fr": fr
            | {
                "base": b.get("central", 0) * (1 - ob.get("central", 0)),
                "base_range": [b.get("low", 0) * (1 - ob.get("high", 0)), b.get("high", 0) * (1 - ob.get("low", 0))],
            },
        }
        note(iso3, "Services trade with Russia", "est", "includes shipping and insuring Russian oil (estimate)")


def apply_reexports(countries: dict[str, dict], src: Sources, note) -> None:
    """Goods re-exported to Russia by trade hubs count for the countries that made them; Russian goods the hubs pass on
    (mostly gold and diamonds) count for the final buyer. The hub keeps only its trading margin."""
    rx = load(GAPS / "reexports.json")
    # Belarus: goods from China, the EU and Türkiye sold on to Russia inside its official exports (belarus.json, round 5)
    blr = load(GAPS / "belarus.json")["countries"]["BLR"]["reexports"]
    rx["hubs"]["BLR"] = {k: blr[k] for k in ("reexports_to_RUS", "reexports_to_RUS_baseline_2019_2021", "origin_shares", "origin_other_detail", "hub_margin_share", "certainty") if k in blr}  # fmt: skip
    # UAE 2024-2026: larger re-exports to Russia and more Russian gold passed on, matching its customs totals (round4b)
    are = rx["hubs"].get("ARE")
    if are:
        for y, c in (("2025", 4.78), ("2026_JanAug", 3.27)):
            are["reexports_to_RUS"][y] = {"low": round(c * 0.74, 3), "central": c, "high": round(c * 1.28, 3)}
        for y, c in (("2024", 5.3), ("2025", 9.8), ("2026_JanAug", 4.3)):
            are["reexports_from_RUS"][y] = {"low": round(c * 0.8, 3), "central": c, "high": round(c * 1.2, 3)}
    sid = src.add(
        "reexports",
        "Re-exports through trade hubs (UAE, Armenia, Kazakhstan, Turkey, Kyrgyzstan and others): UN Comtrade re-export flags and matched product trade",
        "https://comtradeapi.un.org/",
        rx.get("retrieved"),
        "UAE and Georgia from their own re-export records; other hubs estimated per product chapter with hub shares; see research/2026-10/gaps/reexports-notes.md",
    )
    eu = [i for i in EU27 if i in countries]

    def zero() -> dict:
        return {"years": [0] * 6, "years_lo": [0] * 6, "years_hi": [0] * 6, "base": 0, "base_range": [0, 0], "cert": "C", "src": []}  # fmt: skip

    def split(shares: dict, other: dict, key: str) -> dict[str, dict]:
        """Shares per country (low, central, high), with "other" and "EU27" spread over named countries."""
        out: dict[str, dict] = {}
        for k, v in shares.items():
            if k == "other":
                parts = {i: w for i, w in other.items() if i in countries}
            elif k == "EU27":
                w_eu = {i: (countries[i].get(key) or {}).get("base", 0) for i in eu}
                parts = {i: w / (sum(w_eu.values()) or 1) for i, w in w_eu.items()}
            else:
                parts = {k: 1.0} if k in countries else {}
            tot = sum(parts.values()) or 1
            for i, w in parts.items():
                o = out.setdefault(i, {"low": 0.0, "central": 0.0, "high": 0.0})
                for b in o:
                    o[b] += v[b] * w / tot
        return out

    def series(by_year: dict) -> dict[str, list[float]]:
        get = lambda y, b: (by_year.get(str(y)) or by_year.get(f"{y}_JanAug") or {}).get(b, 0.0)  # noqa: E731
        return {
            k: [0.0] + [get(y, b) for y in YEARS[1:]]
            for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high"))
        }

    for hub, d in rx["hubs"].items():
        if hub == "ARE":
            # UAE gold: first buyers from importers' records of gold bought from the UAE
            gd = {k: v for k, v in REFINE["are_gold_destinations"].items() if isinstance(v, dict) and "central" in v}
            d = {**d, "destination_shares": gd}
        h = countries.get(hub)
        if not h:
            continue
        m = d["hub_margin_share"]
        cert = d.get("certainty") or "D"
        # goods made elsewhere, sold on to Russia: out of the hub's sales to Russia, into the origin countries'
        goods = series(d.get("reexports_to_RUS") or {})
        # re-export shares measured at product-heading level replace the first guesses (old shares kept in refine.json)
        rs = REFINE["reexport_share"].get(hub) or {}
        goods0 = {k: list(v) for k, v in goods.items()}
        for i, y in enumerate(YEARS):
            sh = rs.get(str(y))
            if sh and sh.get("old"):
                for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    goods[k][i] *= sh[b] / sh["old"]
        pre = d.get("reexports_to_RUS_baseline_2019_2021") or {"low": 0, "central": 0, "high": 0}
        # 2021 carries the pre-war re-exports too: the expected level without the war starts from 2021
        for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
            goods[k][0] = goods0[k][0] = pre[b]
        keep = {"years": 1 - m["central"], "years_lo": 1 - m["high"], "years_hi": 1 - m["low"]}
        if h.get("from_rus") and any(goods["years"]):
            f = h["from_rus"]
            # the hub's low end loses the most (high re-exports), its high end the least
            for k, gk in (("years", "years"), ("years_lo", "years_hi"), ("years_hi", "years_lo")):
                f[k] = [round(max(0.0, v - g * keep[gk]), 5) for v, g in zip(f[k], goods[gk])]
            # kept so that later replacements of the hub's sales (narrow.json, researched with the first shares) can
            # take out the same extra amount
            f["_refine_delta"] = {
                k: [(g - g0) * keep[gk] for g, g0 in zip(goods[gk], goods0[gk])]
                for k, gk in (("years", "years"), ("years_lo", "years_hi"), ("years_hi", "years_lo"))
            }
            f["base"] = round(max(0.0, f.get("base", 0) - pre["central"] * keep["years"]), 5)
            br = f.get("base_range") or [f["base"], f["base"]]
            f["base_range"] = [
                round(max(0.0, br[0] - pre["high"] * keep["years_lo"]), 5),
                round(max(0.0, br[1] - pre["low"] * keep["years_hi"]), 5),
            ]
            f["cert"] = weakest([f.get("cert"), cert])
            f["src"] = f.get("src", []) + [sid]
            for iso3, sh in split(d.get("origin_shares") or {}, d.get("origin_other_detail") or {}, "from_rus").items():
                o = countries[iso3].setdefault("from_rus", zero())
                for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    o[k] = [round(v + g * keep[k] * sh[b], 5) for v, g in zip(o[k], goods[k])]
                o["base"] = round(o.get("base", 0) + pre["central"] * keep["years"] * sh["central"], 5)
                br = o.get("base_range") or [o["base"], o["base"]]
                o["base_range"] = [
                    round(br[0] + pre["low"] * keep["years_lo"] * sh["low"], 5),
                    round(br[1] + pre["high"] * keep["years_hi"] * sh["high"], 5),
                ]
                if sh["central"] * sum(goods["years"]) > 0.05:
                    o["cert"] = weakest([o.get("cert"), "C"])
                if sid not in o.setdefault("src", []):
                    o["src"].append(sid)
        # Russian goods passed on (gold, diamonds, fuel): out of the hub's payments to Russia, to the final buyers
        back = series(d.get("reexports_from_RUS") or {})
        mr = m.get("from_RUS") or m
        keep_r = {"years": 1 - mr["central"], "years_lo": 1 - mr["high"], "years_hi": 1 - mr["low"]}
        if h.get("to_rus") and any(back["years"]):
            t = h["to_rus"]
            for k, gk in (("years", "years"), ("years_lo", "years_hi"), ("years_hi", "years_lo")):
                t[k] = [round(max(0.0, v - g * keep_r[gk]), 5) for v, g in zip(t[k], back[gk])]
            t["src"] = t.get("src", []) + [sid]
            for iso3, sh in split(
                d.get("destination_shares") or {}, d.get("destination_other_detail") or {}, "to_rus"
            ).items():
                if iso3 == hub or not countries[iso3].get("to_rus"):
                    continue
                o = countries[iso3]["to_rus"]
                for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    o[k] = [round(v + g * keep_r[k] * sh[b], 5) for v, g in zip(o[k], back[k])]
                if hub == "ARE":
                    # the UAE passes on Russian gold: tagged so that it counts at Russia's gain on gold (round 10)
                    o["_gold"] = [
                        x + g * keep_r["years"] * sh["central"]
                        for x, g in zip(o.get("_gold", [0.0] * 6), back["years"])
                    ]
                if sid not in o.setdefault("src", []):
                    o["src"].append(sid)
        h["hub"] = (
            "trade hub: goods re-exported to Russia count for the countries that made them, and Russian goods it passes on for the final buyers; it keeps its trading margin"
        )
        note(hub, "Sold to Russia", "est", "re-exports to Russia moved to the countries that made the goods")


def apply_residual(countries: dict[str, dict], src: Sources, note) -> None:
    """GDP for the last countries, the missing sales to Russia by country of origin, Hong Kong gold to China."""
    res = load(GAPS / "residual.json")
    rid = src.add(
        "residual",
        "GDP gaps (UNSD, UN WPP, CEPAL), Russia's import gap by country of origin, Hong Kong gold composition",
        None,
        "2026-10",
        "see research/2026-10/gaps/residual-notes.md",
    )
    for iso3, d in res["population_gdp"].items():
        c = countries.get(iso3)
        if c and not c.get("gdp") and (d.get("gdp_eur_bn") or {}).get("central"):
            c["gdp"], c["pop"] = d["gdp_eur_bn"]["central"], (d.get("pop_m") or {}).get("central")
    # sales to Russia missing from partner data (Russia's own imports by origin are higher): added to the country of origin.
    # Part of the gap is spread by each country's reported sales; for trade hubs, the re-exported share of that part
    # goes on to the countries that made the goods (the hub keeps its margin)
    gaps = {}
    rx = load(GAPS / "reexports.json")["hubs"]
    for iso3, d in res["exports_to_rus_gap"]["countries"].items():
        add = lch(d)
        for k in ("years_lo", "years", "years_hi"):  # 2026: the 2025 rate for eight months
            add[k][5] = round(add[k][4] * FRAC[5], 5)
        gaps[iso3] = add
    for hub, d in rx.items():
        if hub not in gaps:
            continue
        share = d.get("reexport_share_of_exports_to_RUS") or {}
        keep = 1 - d["hub_margin_share"]["central"]
        moved = {k: [0.0] * 6 for k in ("years", "years_lo", "years_hi")}
        for i, y in enumerate(YEARS):
            sh = min(1.0, (share.get(str(y)) or share.get("2025") or {}).get("central", 0)) if y > 2021 else 0
            for k in moved:
                moved[k][i] = gaps[hub][k][i] * sh * keep
                gaps[hub][k][i] -= moved[k][i]
        origins = d.get("origin_shares") or {}
        other = {i: w for i, w in (d.get("origin_other_detail") or {}).items() if i in countries}
        for o, w in origins.items():
            targets = {o: 1.0} if o in countries else {}
            if o == "other":
                tot = sum(other.values()) or 1
                targets = {i: v / tot for i, v in other.items()}
            for t, f in targets.items():
                g = gaps.setdefault(t, {k: [0.0] * 6 for k in moved})
                for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    g[k] = [a + m * w[b] * f for a, m in zip(g[k], moved[k])]
    # Belarus already reports its full trade with Russia (Union State totals), so its pro-rata share of the gap is
    # spread over the other countries instead (round4b.json)
    blr = gaps.pop("BLR", None)
    if blr:
        tot = [sum(g["years"][i] for g in gaps.values()) or 1 for i in range(len(YEARS))]
        for g in gaps.values():
            share = [g["years"][i] / tot[i] for i in range(len(YEARS))]
            for k in ("years", "years_lo", "years_hi"):
                g[k] = [v + b * sh for v, b, sh in zip(g[k], blr[k], share)]
    for iso3, add in gaps.items():
        c = countries.get(iso3)
        if not c:
            continue
        f = c.setdefault(
            "from_rus",
            {
                "years": [0] * 6,
                "years_lo": [0] * 6,
                "years_hi": [0] * 6,
                "base": 0,
                "base_range": [0, 0],
                "cert": "C",
                "src": [],
            },
        )
        for k in ("years", "years_lo", "years_hi"):
            f[k] = [round(a + b, 5) for a, b in zip(f[k], add[k])]
        f["cert"] = weakest([f.get("cert"), "C"])
        f["src"] = f["src"] + [rid]
        f["est26"] = True  # the gap for 2026 is estimated from 2025
        note(
            iso3, "Sold to Russia", "est", "partner data plus an estimate of goods reaching Russia via third countries"
        )
    # Hong Kong's Russian gold: the share passed on to mainland China counts for China
    hk, cn = countries.get("HKG"), countries.get("CHN")
    if hk and cn and hk.get("to_rus") and cn.get("to_rus"):
        base = {k: list(hk["to_rus"][k]) for k in ("years", "years_lo", "years_hi")}
        hk_base = hk["to_rus"].get("base") or base["years"][0]
        # share passed on to the mainland per year, from Hong Kong's own gold trade (falls from 2024)
        on = [None] + [
            REFINE["hk_onward"].get(str(y)) or dict(zip(("low", "central", "high"), HK_ONWARD)) for y in YEARS[1:]
        ]
        for key, keep_b, give_b in (
            ("years", "central", "central"),
            ("years_lo", "high", "low"),
            ("years_hi", "low", "high"),
        ):
            # only the change since before the war is gold in transit; 2021 stays as it was
            rise = [0.0] + [max(0.0, base[key][i] - hk_base * FRAC[i]) for i in range(1, len(YEARS))]
            hk["to_rus"][key] = [
                v if i == 0 else round(v - rise[i] * HK_METALS_SHARE[i] * on[i][keep_b], 5)
                for i, v in enumerate(base[key])
            ]
            cn["to_rus"][key] = [
                v if i == 0 else round(v + rise[i] * HK_METALS_SHARE[i] * on[i][give_b], 5)
                for i, v in enumerate(cn["to_rus"][key])
            ]
            if key == "years":
                g0 = cn["to_rus"].get("_gold", [0.0] * 6)
                cn["to_rus"]["_gold"] = [
                    x + rise[i] * HK_METALS_SHARE[i] * on[i]["central"] if i else x for i, x in enumerate(g0)
                ]
        cn["to_rus"]["src"] = cn["to_rus"]["src"] + [rid]
        # Round 16 (review 5, M1; approved by the owner): only the gold that stays in Hong Kong counts for Hong Kong. The
        # share it exported to other destinations (hk_gold_r16.json, Hong Kong's own HS 7108 exports) goes to those
        # buyers, tagged as gold like the UAE's; China keeps the onward share above, so nothing is counted twice
        hg = load(GAPS / "hk_gold_r16.json")["years"]
        gid = src.add(
            "hk_gold_r16",
            "Hong Kong's gold exports by destination (HS 7108): UN Comtrade, 2022-2025",
            "https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&period=2025&flowCode=X,M,RX&cmdCode=7108",
            "2026-10-20",
            "the Russian gold Hong Kong passed on to buyers other than mainland China, by their share of its gold exports; see research/2026-10/gaps/hk_gold-notes.md",
        )
        es = [0.0] + [
            min((hg.get(str(y)) or hg["2025"])["exported_elsewhere_share"], 1 - on[i]["high"])
            for i, y in enumerate(YEARS)
            if i
        ]
        dest = [None] + [(hg.get(str(y)) or hg["2025"])["destination_shares"] for y in YEARS[1:]]
        rise = {k: [0.0] + [max(0.0, base[k][i] - hk_base * FRAC[i]) for i in range(1, len(YEARS))] for k in base}
        moved = {k: [rise[k][i] * HK_METALS_SHARE[i] * es[i] for i in range(len(YEARS))] for k in base}
        for k, gk in (("years", "years"), ("years_lo", "years_hi"), ("years_hi", "years_lo")):
            hk["to_rus"][k] = [round(v - moved[gk][i], 5) for i, v in enumerate(hk["to_rus"][k])]
        for i in range(1, len(YEARS)):
            buyers = {
                d: w for d, w in dest[i].items() if d in countries and (countries[d].get("to_rus") or {}).get("years")
            }
            wt = sum(buyers.values()) or 1.0
            for d, w in buyers.items():
                o = countries[d]["to_rus"]
                for k in ("years", "years_lo", "years_hi"):
                    o[k][i] = round(o[k][i] + moved[k][i] * w / wt, 5)
                g0 = o.get("_gold", [0.0] * 6)
                o["_gold"] = [x + (moved["years"][i] * w / wt if j == i else 0.0) for j, x in enumerate(g0)]
                if gid not in o.setdefault("src", []):
                    o["src"].append(gid)
        hk["to_rus"]["src"] = hk["to_rus"]["src"] + [gid]
    for iso3, text in TRANSIT_HUBS.items():
        if iso3 in countries:
            countries[iso3]["hub"] = text


PARTS = ["Aid to Ukraine", "Private donations", "Services trade with Russia", "Refugee hosting", "Bought from Russia", "Sold to Russia", "Bought from Ukraine", "Sold to Ukraine",
         "Energy switching cost", "Company taxes in Russia", "Money flowing back"]  # fmt: skip


def coverage(c: dict, notes: dict[str, tuple[str, str]]) -> list[dict]:
    """Per part: ok (reported), est (estimated with a range) or missing."""
    out = []
    for part in PARTS:
        if part in notes:
            status, text = notes[part]
        elif part == "Money flowing back":
            continue  # only relevant for countries that sent military aid
        elif part == "Refugee hosting":
            status, text = "ok", "no refugees from Ukraine recorded"
        else:
            status, text = "missing", "no data and no estimate; counted as zero"
        out.append({"part": part, "status": status, "note": text})
    return out


def spread(total: float, shape: list[float]) -> list[float]:
    s = sum(shape) or 1
    return [round(total * w / s, 5) for w in shape]


def write_gaps_report(data: dict) -> None:
    """research/2026-10/gaps.md: what is reported, estimated or missing, per country."""
    mark = {"ok": "reported", "est": "estimated", "missing": "**missing**"}
    rows = sorted(data["countries"].values(), key=lambda c: -(c.get("gdp") or 0))
    lines = [
        "# Data gaps by country",
        "",
        "Generated by `pipeline/build_data.py`, sorted by GDP. Estimated parts carry a low-high range on the map.",
        "",
        "| country | " + " | ".join(PARTS) + " |",
        "|---|" + "---|" * len(PARTS),
    ]
    for c in rows:
        cov = {p["part"]: p["status"] for p in c["coverage"]}
        lines.append(f"| {c['name']} | " + " | ".join(mark.get(cov.get(p), "n/a") for p in PARTS) + " |")
    (RESEARCH / "gaps.md").write_text("\n".join(lines) + "\n")


def method_alternatives(data: dict) -> dict:
    """Round 14 (audit H4): rebuild with each alternative method choice and keep, per country, the fields it changes
    (two levels deep; None = removed). index.html methodBand() applies them and recomputes the net."""
    out: dict[str, dict] = {}
    base = json.loads(json.dumps(data["countries"]))
    for alt in METHOD_ALTERNATIVES:
        ALT.clear()
        ALT.add(alt)
        _FUEL_OUTLIERS.clear()
        VALUE_KEPT_SRC.clear()
        other = json.loads(json.dumps(build()["countries"]))
        for iso3, c in other.items():
            b = base.get(iso3) or {}
            diff: dict = {}
            # sorted, so detail.json is byte-identical from run to run (set order depends on PYTHONHASHSEED)
            for k in sorted(set(c) | set(b)):
                if k == "coverage" or c.get(k) == b.get(k):
                    continue
                if isinstance(c.get(k), dict) and isinstance(b.get(k), dict):
                    diff[k] = {s: c[k].get(s) for s in sorted(set(c[k]) | set(b[k])) if c[k].get(s) != b[k].get(s)}
                else:
                    diff[k] = c.get(k)
            if diff:
                out.setdefault(iso3, {})[alt] = diff
    ALT.clear()
    _FUEL_OUTLIERS.clear()
    VALUE_KEPT_SRC.clear()
    return out


if __name__ == "__main__":
    data = build()
    write_gaps_report(data)
    # the data-coverage notes (a sixth of the file) load after the map, from detail.json, so phones start faster
    detail = {"coverage": {c["iso3"]: c.pop("coverage") for c in data["countries"].values() if "coverage" in c}}
    # round 14 (H4): the method band's alternatives, also in detail.json (only the panel needs them)
    detail["alts"] = method_alternatives(data)
    detail["alt_labels"] = METHOD_ALTERNATIVES
    OUT.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    (OUT.parent / "detail.json").write_text(json.dumps(detail, separators=(",", ":")) + "\n")
    print(f"wrote {OUT} with {len(data['countries'])} entries and {len(data['sources'])} sources")
