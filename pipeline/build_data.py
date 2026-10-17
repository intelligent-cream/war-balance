"""Build site/data.json for the map from the research files in research/2026-10/.

Run: uv run python pipeline/build_data.py

All amounts are EUR billions, per year 2021..2026 (2026 = January to August).
Every series carries a middle value and a low/high range (about 90%), a certainty letter (A-D) and source ids.
No country is left at zero because data is missing: gaps are filled with estimates from research/2026-10/gaps/.
"""

from __future__ import annotations

import json
from pathlib import Path

import pycountry

ROOT = Path(__file__).resolve().parent.parent
RESEARCH = ROOT / "research" / "2026-10"
GAPS = RESEARCH / "gaps"
OUT = ROOT / "site" / "data.json"

YEARS = [2021, 2022, 2023, 2024, 2025, 2026]
# 2026 is counted through August, the cut-off of the Kiel aid data; all 2026 inputs are January-August values
FRAC = [1, 1, 1, 1, 1, round(8 / 12, 4)]
EU27 = set(
    "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split()
)
TARIFF_WAIVER = EU27 | {"GBR", "CAN"}
# own-industry share of military aid where no evidence exists (certainty D): low, middle, high
OWN_SHARE_DEFAULT = (0.2, 0.4, 0.7)
# each member's share of EU/EEA arms production (SIPRI Top 100, 2024): where EU-level military aid is spent
EU_ARMS_SLICE = {"FRA": 0.39, "DEU": 0.24, "ITA": 0.19, "SWE": 0.06, "CZE": 0.04, "ESP": 0.035, "POL": 0.03}
LOAN_GRANT_ELEMENT = 0.3
# energy research: transit gas, price indices, fuel mix before the war, hub resale shares
E2 = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/energy2.json").read_text())
# laundered oil (fuel refined from Russian crude in India, Turkey, China...): trading hubs resell part of what they buy,
# so that share is passed on to their customers (low, middle, high share resold) ...
# (shares from research/2026-10/gaps/energy2.json; only hubs whose fuel customers are known are passed on)
HUB_RESALE = {
    hub: (d["low"], d["central"], d["high"])
    for hub, d in E2["hub_resale"].items()
    if hub in ("SGP", "NLD", "BEL", "GRC", "MLT")
}
# fuel sold to ships in port (bunkers) has no known buyer country: it stays with the hub, except at the hub's low end
# EUR bn per million tonnes of Russian fuel in 2021 (CREA, Germany): turns fuel tonnes into a value split per year
EUR_PER_MT_2021 = {"crude": 0.414, "products": 0.549, "gas": 0.583, "lng": 0.583, "coal": 0.130}
FUEL_INDEX = {"crude": "urals", "products": "products", "gas": "pipeline_gas", "lng": "lng", "coal": "coal"}
# ... and only the Russian crude inside the fuel is money for Russia, bought at a discount (low, middle, high share)
CRUDE_CONTENT = (0.6, 0.68, 0.75)
# laundered oil can not exceed what an economy can use: capped at a share of GDP per year (middle, high); the fuel model
# otherwise assigns fuel to ship registries and storage points (Marshall Islands, Liberia)
LAUNDERED_CAP = (0.01, 0.02)
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
}  # grant equivalent of ordinary loans, cost-to-lender view (certainty C)
CERT_ORDER = "ABCD"
# the latest month in the data (2026 runs January to August) and the date of this build
DATA_TO, DATA_TO_TEXT = "2026-08-31", "31 August 2026"
UPDATED, UPDATED_TEXT = "2026-10-18", "18 October 2026"
# territories whose trade and aid statistics are reported by another country (customs unions, dependencies)
INCLUDED_IN = {"LIE": "CHE", "MCO": "FRA", "IMN": "GBR", "PRI": "USA", "VIR": "USA", "MAF": "FRA"}

NAMES = {
    "USA": "United States", "GBR": "United Kingdom", "KOR": "South Korea", "PRK": "North Korea", "RUS": "Russia",
    "IRN": "Iran", "VNM": "Vietnam", "TWN": "Taiwan", "MDA": "Moldova", "BOL": "Bolivia", "VEN": "Venezuela",
    "TZA": "Tanzania", "SYR": "Syria", "LAO": "Laos", "COD": "DR Congo", "COG": "Congo", "CZE": "Czechia",
    "TUR": "Turkey", "MKD": "North Macedonia", "CIV": "Côte d'Ivoire", "BRN": "Brunei", "PSE": "Palestine",
    "FSM": "Micronesia", "HKG": "Hong Kong", "MAC": "Macao",
}  # fmt: skip


def load(path: Path) -> dict | None:
    return json.loads(path.read_text()) if path.exists() else None


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


def build() -> dict:
    src = Sources()
    kiel, flowback, other = (
        load(RESEARCH / "kiel.json"),
        load(RESEARCH / "flowback.json"),
        load(RESEARCH / "other.json"),
    )
    trade = load(GAPS / "trade_full.json")
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
        "https://comtradeplus.un.org/",
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
                for x in (base.get("avg_2019_2021"), base.get("trend_2022"), base.get("low"), base.get("high"))
                if x is not None
            ]
            series["base_range"] = [
                round(min(alts + [series["years_lo"][0]]), 5),
                round(max(alts + [series["years_hi"][0]]), 5),
            ]
            # pre-war level: the 2019-2021 average, so a one-off spike in a single year does not count as a cut;
            # 2021 alone and the 2019-2021 trend widen the range (base_range)
            avg = base.get("avg_2019_2021")
            series["base"] = round(avg, 5) if avg is not None else series["years"][0]
            bases = [(f.get(str(y)) or {}).get("basis", "estimated") for y in YEARS]
            cert = weakest(basis_cert.get(b, "C") for b in bases[:5])
            c[key] = {**series, "cert": cert, "src": [tid]}
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
            if (
                key == "to_rus"
            ):  # unpaid supplies are not money to Russia (all years, so the comparison stays like for like)
                for k, sh in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
                    ser[k] = [round(v * ps[sh], 5) for v in ser[k]]
                ser["base"] = round(ser["base"] * ps["central"], 5)
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
        s.get("page") or s.get("url"),
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
        if unassigned > 0.05:  # amounts without a month: spread over the years in proportion
            tot = sum(years) or 1
            years = [round(v + unassigned * v / tot, 4) for v in years]
        loans, era = d.get("loans_face_value") or 0, d.get("era_allocated") or 0
        aid = {
            "years": years,
            "cats": {k: round(d.get(f"{k}_allocated") or 0, 3) for k in ("military", "financial", "humanitarian")},
            "loans_face": round(loans, 3) or None,
            # loans repaid from frozen Russian assets (ERA) cost the lender almost nothing
            "loans_grant_eq": round(max(0, loans - era) * LOAN_GRANT_ELEMENT, 3) if loans else None,
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
        s.get("page"),
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
            share = non_gas_share(d.get("fossil_from_russia_by_fuel_mt") or {}, e2["price_index"])
            for k in ("years", "years_lo", "years_hi"):
                fossil[k] = [round(f * s + g, 5) for f, s, g in zip(fossil[k], share, gas[k])]
            if tr:
                # customs data record gas where it crosses the border too: that gas is swapped for final-use gas
                cg = customs_gas.get(iso3, {})
                cyears = [cg.get(str(y), 0.0) for y in YEARS]
                g25 = tg["gas_from_rus_eur_bn"]["2025"]["central"]
                cyears[5] = cyears[4] * (gas["years"][5] / g25 if g25 else FRAC[5])
                for k in ("years", "years_lo", "years_hi"):
                    tr[k] = [round(max(0.0, t - cgv) + g, 5) for t, cgv, g in zip(tr[k], cyears, gas[k])]
                pre = {
                    b: sum(tg["gas_from_rus_eur_bn"][str(y)][b] for y in (2019, 2020, 2021)) / 3
                    for b in ("low", "central", "high")
                }
                cpre = sum(cg.get(str(y), 0.0) for y in (2019, 2020, 2021)) / 3
                tr["base"] = round(max(0.0, tr["base"] - cpre) + pre["central"], 5)
                tr["base_range"] = [
                    round(max(0.0, tr["base_range"][0] - cpre) + pre["low"], 5),
                    round(max(0.0, tr["base_range"][1] - cpre) + pre["high"], 5),
                ]
                tr["src"] = tr.get("src", []) + ["transit_gas"]
        if tr and iso3 in PIPELINE_GAS:
            # customs data miss some fossil fuel (pipeline gas is not always recorded as Russian),
            # so payments to Russia use whichever is larger each year: all imports from Russia, or the fossil fuel value
            for k in ("years", "years_lo", "years_hi"):
                tr[k] = [round(max(a, b), 5) for a, b in zip(tr[k], fossil[k])]
            # the fossil value is known from 2021 only: brought to 2019-2021 prices to compare with the baseline
            f21 = {b: fuel_index(iso3, b)[0] for b in ("low", "central", "high")}
            tr["base_range"] = [
                min(tr["base_range"][0], fossil["years_lo"][0] / f21["high"]),
                max(tr["base_range"][1], fossil["years_hi"][0] / f21["low"]),
            ]
            tr["base"] = round(max(tr.get("base", 0), fossil["years"][0] / f21["central"]), 5)
        if tr:
            laundered[iso3] = laund
        note(iso3, "Energy switching cost", "est", "modelled per fuel and month")
    reassign_laundered_oil(countries, laundered, src)

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
            "cert": d.get("certainty") or "C", "src": [kse],
        }  # fmt: skip
        note(
            iso3,
            "Company taxes in Russia",
            "ok" if d.get("basis") == "reported" else "est",
            "KSE country figures" if d.get("basis") == "reported" else "allocated by company counts and investment",
        )

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
    for iso3 in countries:
        if countries[iso3].get("private"):
            note(iso3, "Private donations", "est", "national totals or a GDP-based estimate")

    # ---- money flowing back: own-industry share of military aid, NATO PURL ----
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
        "Assumed own-industry share 20-70% (middle 40%) where no evidence was found",
        None,
        None,
        "certainty D",
    )
    fb2 = load(GAPS / "flowback2.json")["own_industry"]
    kiel_item = src.add(
        "flowback_kiel",
        "Own-industry share of military aid from Kiel's item-level coding (own stocks, domestic purchases, purchases abroad)",
        "https://www.kielinstitut.de/research/topics/war-against-ukraine/ukraine-support-tracker/",
        "2026-10",
        "stocks refilled at home and items with no coded source are estimated per donor; see research/2026-10/gaps/flowback2-notes.md",
    )
    # EU-level military aid is spent mostly with EU/EEA industry, by where arms are made (SIPRI), not by budget share
    eu_ind = fb2.get("EU_INST", {}).get("own_share_eu_eea_industry", {"low": 0.7, "central": 0.78, "high": 0.88})
    eu_mil_share = (eu_aid["cats"]["military"] / sum(eu_aid["years"])) if eu_aid and sum(eu_aid["years"]) else 0
    eu_mil_years = [v * eu_mil_share for v in eu_aid["years"]] if eu_aid else [0] * 6
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
        note(
            iso3,
            "Money flowing back",
            "ok" if iso3 == "USA" else "est",
            "documented (CSIS)"
            if iso3 == "USA"
            else "modelled share"
            if known
            else "assumed share 20-70%, no evidence",
        )
    eu_src = src.add(
        "eu_industry",
        "EU-level military aid spent with each member's arms industry: Kiel item coding and SIPRI Top 100 production shares",
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
    for iso3, d in fb2all["military_to_russia"].items():
        c = countries.get(iso3)
        if iso3 == "CHN" or not c or not d.get("by_year"):
            continue
        ser = lch(d["by_year"])
        c["military_rus"] = {**ser, "src": [oid2]}
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
    price_indices(countries)
    for iso3, c in countries.items():
        c["coverage"] = coverage(c, notes.get(iso3, {}))
    status = (
        f"<b>Research preview</b> · figures to {DATA_TO_TEXT}, updated {UPDATED_TEXT}. "
        "Real figures and estimates from public sources, not yet reviewed by a person. "
        "Every number has a likely range and a source; gaps are filled with estimates, never left at zero. "
        'Method and data: <a href="https://github.com/intelligent-cream/follow-the-money-ukraine">GitHub</a>. Corrections: <a href="https://www.reddit.com/user/Intelligent-Cream-14/">Reddit</a> or a GitHub issue.'
    )
    return {
        "generated": UPDATED,
        "data_to": DATA_TO,
        "years": YEARS,
        "frac": FRAC,
        "meta": {"tariff_rate": 0.04, "lost_margin": 0.2},
        "status_html": status,
        "sources": src.items,
        "countries": {k: v for k, v in sorted(countries.items())},
        # map shapes of these territories show the figures of the country that reports for them
        "included_in": {
            iso_numeric(t): countries[p]["n"] for t, p in INCLUDED_IN.items() if iso_numeric(t) and p in countries
        },
    }


HUB_BUNKER = {hub: d["bunker_share"]["low"] for hub, d in E2["hub_resale"].items() if hub in HUB_RESALE}


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


def fuel_index(iso3: str, band: str) -> list[float]:
    """Price level of the fossil fuels a country bought from Russia before the war, per year (2019-2021 = 1)."""
    m = import_mix(iso3)
    gas_ix = "pipeline_gas" if iso3 in PIPELINE_GAS else "lng"
    fuels = ("crude", "products", "gas", "coal", "other_fossil")
    total = sum(m.get(f) or 0 for f in fuels) or 1
    return [
        sum((m.get(f) or 0) * v for f, v in zip(fuels, vals)) / total
        for vals in zip(idx("urals", band), idx("products", band), idx(gas_ix, band), idx("coal", band),
                        idx("products", band))
    ]  # fmt: skip


def price_indices(countries: dict[str, dict]) -> None:
    """Price level of each flow per year against 2019-2021 (= 1), so changes compare volumes, not price swings."""
    for iso3, c in countries.items():
        m = import_mix(iso3)
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
            for band, suffix in (("central", ""), ("low", "_lo"), ("high", "_hi")):
                if names:
                    series = idx(names, band)
                else:
                    fuel = fuel_index(iso3, band)
                    fs = m.get("fossil_share") or 0
                    series = [fs * f + (1 - fs) * g for f, g in zip(fuel, idx("non_fuel_goods", band))]
                obj["pidx" + suffix] = [round(v, 4) for v in series]


def reassign_laundered_oil(countries: dict[str, dict], laundered: dict[str, dict], src: Sources) -> None:
    """Pass on what trading hubs resell, to their customers by share of fuel exports, then keep only the crude value."""
    hubs = load(GAPS / "hub_exports_2024.json")["shares"]
    totals = {iso3: {k: list(v[k]) for k in ("years", "years_lo", "years_hi")} for iso3, v in laundered.items()}
    for hub, (lo, mid, hi) in HUB_RESALE.items():
        if hub not in totals:
            continue
        shares = {d: w for d, w in hubs.get(hub, {}).items() if d in countries and d != hub}
        norm = sum(shares.values()) or 1
        base = {k: list(totals[hub][k]) for k in ("years", "years_lo", "years_hi")}
        # the hub keeps least at the high resale share (its low end) and most at the low share (its high end);
        # its customers get the least at the low share and the most at the high share
        bunker = HUB_BUNKER.get(hub, 0.0)
        for key, keep_f, give_f in (("years", mid, mid), ("years_lo", hi + bunker, lo), ("years_hi", lo, hi)):
            totals[hub][key] = [v * max(0.0, 1 - keep_f) for v in base[key]]
            moved = [v * give_f for v in base[key]]
            for dest, w in shares.items():
                t = totals.setdefault(dest, {k: [0.0] * 6 for k in ("years", "years_lo", "years_hi")})
                t[key] = [v + m * w / norm for v, m in zip(t[key], moved)]
    lid = src.add(
        "laundered",
        "Laundered oil: fuel made from Russian crude, assigned to the final buyer (trading hubs pass on what they resell), valued at the Russian crude inside it",
        "https://www.russiafossiltracker.com/methodology/",
        "2026-10",
        "hub resale shares are estimates; hub customers from UN Comtrade HS 2710 exports 2024; crude content 60-75% of the fuel value",
    )
    for iso3, t in totals.items():
        tr = (countries.get(iso3) or {}).get("to_rus")
        if not tr or not any(t["years_hi"]):
            continue
        gdp = countries[iso3].get("gdp") or 0
        cap_mid = [gdp * LAUNDERED_CAP[0] * f for f in FRAC] if gdp else [float("inf")] * 6
        cap_hi = [gdp * LAUNDERED_CAP[1] * f for f in FRAC] if gdp else [float("inf")] * 6
        mid = [min(v * CRUDE_CONTENT[1], m) for v, m in zip(t["years"], cap_mid)]
        tr["laundered"] = [round(v, 5) for v in mid]
        tr["laundered_lo"] = [round(min(v * CRUDE_CONTENT[0], m), 5) for v, m in zip(t["years_lo"], mid)]
        tr["laundered_hi"] = [
            round(max(min(v * CRUDE_CONTENT[2], h), m), 5) for v, h, m in zip(t["years_hi"], cap_hi, mid)
        ]
        tr["laundered_src"] = [lid]
        if iso3 in HUB_RESALE:
            countries[iso3]["hub"] = (
                "fuel trading hub: the share of laundered oil it resells is counted for its customers"
            )


# Hong Kong: share of its Russian imports that is precious metals, and the share of that passed on to mainland China
HK_METALS_SHARE = 0.98
HK_ONWARD = (0.3, 0.55, 0.85)
TRANSIT_HUBS = {"HKG": "gold transit hub: the share of Russian gold passed on to mainland China is counted for China"}  # fmt: skip


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
    parts = ("freight", "ship_sales", "insurance_finance", "registry")
    for iso3, d in sh["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        ov = d.get("overlap_share_with_services_sold_to_rus") or {}
        out = {"years": [0.0] * 6, "years_lo": [0.0] * 6, "years_hi": [0.0] * 6}
        for part in parts:
            for i, y in enumerate(YEARS):
                v = (d.get(part) or {}).get(str(y)) or {}
                o = ov.get(f"{part}_2021_2022" if part == "insurance_finance" and y <= 2022 else part) or {}
                # the low end leaves out the most overlap, the high end the least
                out["years"][i] += v.get("central", 0) * (1 - o.get("central", 0))
                out["years_lo"][i] += v.get("low", 0) * (1 - o.get("high", 0))
                out["years_hi"][i] += v.get("high", 0) * (1 - o.get("low", 0))
        if not any(out["years_hi"]):
            continue
        b, ob = d.get("baseline_2019_2021") or {}, ov.get("freight") or {}
        c["shipping"] = {k: [round(v, 5) for v in vals] for k, vals in out.items()} | {
            "base": round(b.get("central", 0) * (1 - ob.get("central", 0)), 5),
            "base_range": [
                round(b.get("low", 0) * (1 - ob.get("high", 0)), 5),
                round(b.get("high", 0) * (1 - ob.get("low", 0)), 5),
            ],
            "cert": d.get("certainty") or "D",
            "src": [sid],
        }
        note(iso3, "Services trade with Russia", "est", "includes shipping and insuring Russian oil (estimate)")


def apply_reexports(countries: dict[str, dict], src: Sources, note) -> None:
    """Goods re-exported to Russia by trade hubs count for the countries that made them; Russian goods the hubs pass on
    (mostly gold and diamonds) count for the final buyer. The hub keeps only its trading margin."""
    rx = load(GAPS / "reexports.json")
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
        h = countries.get(hub)
        if not h:
            continue
        m = d["hub_margin_share"]
        cert = d.get("certainty") or "D"
        # goods made elsewhere, sold on to Russia: out of the hub's sales to Russia, into the origin countries'
        goods = series(d.get("reexports_to_RUS") or {})
        pre = d.get("reexports_to_RUS_baseline_2019_2021") or {"low": 0, "central": 0, "high": 0}
        keep = {"years": 1 - m["central"], "years_lo": 1 - m["high"], "years_hi": 1 - m["low"]}
        if h.get("from_rus") and any(goods["years"]):
            f = h["from_rus"]
            # the hub's low end loses the most (high re-exports), its high end the least
            for k, gk in (("years", "years"), ("years_lo", "years_hi"), ("years_hi", "years_lo")):
                f[k] = [round(max(0.0, v - g * keep[gk]), 5) for v, g in zip(f[k], goods[gk])]
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
        note(
            iso3, "Sold to Russia", "est", "partner data plus an estimate of goods reaching Russia via third countries"
        )
    # Hong Kong's Russian gold: the share passed on to mainland China counts for China
    hk, cn = countries.get("HKG"), countries.get("CHN")
    if hk and cn and hk.get("to_rus") and cn.get("to_rus"):
        base = {k: list(hk["to_rus"][k]) for k in ("years", "years_lo", "years_hi")}
        lo, mid, hi = HK_ONWARD
        for key, keep_f, give_f in (("years", mid, mid), ("years_lo", hi, lo), ("years_hi", lo, hi)):
            # only the change since before the war is gold in transit; 2021 stays as it was
            hk["to_rus"][key] = [
                v if i == 0 else round(v * (1 - HK_METALS_SHARE * keep_f), 5) for i, v in enumerate(base[key])
            ]
            cn["to_rus"][key] = [
                v if i == 0 else round(v + base[key][i] * HK_METALS_SHARE * give_f, 5)
                for i, v in enumerate(cn["to_rus"][key])
            ]
        cn["to_rus"]["src"] = cn["to_rus"]["src"] + [rid]
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


if __name__ == "__main__":
    data = build()
    OUT.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    write_gaps_report(data)
    print(f"wrote {OUT} with {len(data['countries'])} entries and {len(data['sources'])} sources")
