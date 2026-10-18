"""Build site/data.json for the map from the research files in research/2026-10/.

Run: uv run python pipeline/build_data.py

All amounts are EUR billions, per year 2021..2026 (2026 = January to August).
Every series carries a middle value and a low/high range (about 90%), a certainty letter (A-D) and source ids.
No country is left at zero because data is missing: gaps are filled with estimates from research/2026-10/gaps/.
"""

from __future__ import annotations

import json
import math
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
# when each lender paid out its ERA loan (None = the rest), and Kiel's category for it where not financial
ERA_YEARS = {"USA": {2024: None}, "JPN": {2026: None}, "GBR": {2025: 1.78, 2026: None}}
ERA_CATEGORY = {"GBR": "military"}
# better data for the biggest guesses: shadow fleet ownership, re-export shares, Togo's buyers, gold routes
REFINE = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/refine.json").read_text())
# energy research: transit gas, price indices, fuel mix before the war, hub resale shares
E2 = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/energy2.json").read_text())
# laundered oil (fuel refined from Russian crude in India, Turkey, China...): trading hubs resell part of what they buy,
# so that share is passed on to their customers (low, middle, high share resold) ...
# (shares from research/2026-10/gaps/energy2.json; only hubs whose fuel customers are known are passed on)
HUB_RESALE = {hub: (d["low"], d["central"], d["high"]) for hub, d in E2["hub_resale"].items()}
# fuel sold to ships in port (bunkers) has no known buyer country: it stays with the hub, except at the hub's low end
# EUR bn per million tonnes of Russian fuel in 2021 (CREA, Germany): turns fuel tonnes into a value split per year
EUR_PER_MT_2021 = {"crude": 0.414, "products": 0.549, "gas": 0.583, "lng": 0.583, "coal": 0.130}
FUEL_INDEX = {"crude": "urals", "products": "products", "gas": "pipeline_gas", "lng": "lng", "coal": "coal"}
# ... and only the Russian crude inside the fuel is money for Russia, bought at a discount (low, middle, high share)
CRUDE_CONTENT = (0.42, 0.5, 0.6)  # Russian crude per euro of fuel made from it (CREA: 4.2 of 8.5bn; laundered_eu.json)
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
    return _actuals_r7(path.name, json.loads(path.read_text())) if path.exists() else None


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
                # the 2022 trend projection is left out: the map applies the pre-war trend itself (bmul)
                for x in (base.get("avg_2019_2021"), base.get("low"), base.get("high"))
                if x is not None
            ]
            series["base_range"] = [round(min(alts), 5), round(max(alts), 5)] if alts else [series["years"][0]] * 2
            # pre-war level: the 2019-2021 average, so a one-off spike in a single year does not count as a cut;
            # 2021 alone and the 2019-2021 trend widen the range (base_range)
            avg = base.get("avg_2019_2021")
            series["base"] = round(avg, 5) if avg is not None else series["years"][0]
            bases = [(f.get(str(y)) or {}).get("basis", "estimated") for y in YEARS]
            cert = weakest(basis_cert.get(b, "C") for b in bases[:5])
            c[key] = {**series, "cert": cert, "src": [tid]}
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
                if iso3 in GAS_IN_CUSTOMS:
                    # customs already hold this gas under another heading (Turkey, Poland; part of it for Germany)
                    cyears = [max(cv, g * GAS_IN_CUSTOMS[iso3]) for cv, g in zip(cyears, gas["years"])]
                for k in ("years", "years_lo", "years_hi"):
                    tr[k] = [round(max(0.0, t - cgv) + g, 5) for t, cgv, g in zip(tr[k], cyears, gas[k])]
                pre = {
                    b: sum(tg["gas_from_rus_eur_bn"][str(y)][b] for y in (2019, 2020, 2021)) / 3
                    for b in ("low", "central", "high")
                }
                cpre = sum(cg.get(str(y), 0.0) for y in (2019, 2020, 2021)) / 3
                if iso3 in GAS_IN_CUSTOMS:
                    cpre = max(cpre, pre["central"] * GAS_IN_CUSTOMS[iso3])
                tr["base"] = round(max(0.0, tr["base"] - cpre) + pre["central"], 5)
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
            tr["base"] = round(max(tr.get("base", 0), fossil["years"][0] / f21["central"]), 5)
        if tr:
            if iso3 in EU27:
                # the model's laundered oil for EU members is about 1.6 times the Russian crude Global Witness finds in
                # EU imports (audit); corrected before resale, so what EU hubs pass on is corrected too
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
    # refiners: the Russian crude in the fuel Turkey and India export is counted at the buyers (laundered oil),
    # so it is taken out of the refiner's own payments to Russia; they keep what they use themselves
    hb = load(GAPS / "hub_buyers.json")
    # what is taken off the refiner must equal what its buyers are charged: the exported fuel x CRUDE_CONTENT, the same
    # ratio reassign_laundered_oil() uses (round 5 review: the measured crude values, about 0.67 of the fuel, left
    # EUR 14bn uncounted after CRUDE_CONTENT was lowered to 0.5)
    bands = {"low": 0, "central": 1, "high": 2}

    def as_crude(by_year: dict, key: str, scale: float = 1.0) -> dict:
        return {
            y: {b: (v.get(key) or {}).get(b, 0.0) * CRUDE_CONTENT[i] * scale for b, i in bands.items()}
            for y, v in by_year.items()
        }

    china = load(GAPS / "round4a.json")["china_refining"]["exported_crude_value"]
    exported = {
        "TUR": as_crude(hb["turkey_refining"]["by_year"], "exported_product_value_eur_bn"),
        "IND": as_crude(hb["india_refining"], "exported_product_value_eur_bn"),
        # China reports crude values only: fuel = crude / 0.70 (India's measured crude-to-fuel ratio, 2022-2026)
        "CHN": {y: {b: v.get(b, 0.0) / 0.70 * CRUDE_CONTENT[i] for b, i in bands.items()} for y, v in china.items()},
    }
    rid = src.add(
        "refining",
        "Russian crude refined in Turkey and India and exported as fuel: refinery reports, UN Comtrade, CREA, Global Witness",
        "https://energyandcleanair.org/",
        hb.get("generated"),
        "the exported part is counted at the buyers as laundered oil; see research/2026-10/gaps/hub_buyers-notes.md",
    )
    for iso3, by_year in exported.items():
        tr = (countries.get(iso3) or {}).get("to_rus")
        if not tr:
            continue
        for k, b in (("years", "central"), ("years_lo", "high"), ("years_hi", "low")):
            tr[k] = [round(max(0.0, v - (by_year.get(str(y)) or {}).get(b, 0)), 5) for v, y in zip(tr[k], YEARS)]
        tr["src"] = tr.get("src", []) + [rid]

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
    # round 6: North Korea, Iran and Belarus revalued with more sources (military_rus_r6.json); China below
    mr6 = load(GAPS / "military_rus_r6.json")
    mid6 = src.add(
        "military_rus_r6",
        "Military support to Russia: Ukrainian and South Korean intelligence, Open Source Centre, the Multilateral Sanctions Monitoring Team, INSS, leaked Alabuga contracts, Russian procurement prices",
        None,
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
    # AI guesses, no real data: how far each country's direction is from Russia's and how threatened it feels;
    # shown separately to compare what a country did with what its incentives would predict
    inc = load(GAPS / "incentives.json")
    for iso3, d in inc["countries"].items():
        if iso3 in countries:
            countries[iso3]["incentive"] = {
                k: d.get(k) for k in ("direction", "threat", "confidence", "why", "capacity_note")
            }
    # label only, the totals do not change: which part of each cut was required by sanctions, and which part of the fall
    # in purchases was gas that Russia cut off or that stopped with Ukrainian transit (sanctions_share.json)
    for iso3, d in load(GAPS / "sanctions_share.json")["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        lab = {}
        for flow in ("to_rus", "from_rus", "svc_bought", "svc_sold"):
            ys = [v for y, v in (d.get(flow) or {}).items() if y.isdigit() and v.get("mandated_share_map")]
            mand = sum(v["mandated_eurbn"]["central"] for v in ys)
            fall = sum(
                v["mandated_eurbn"]["central"] / v["mandated_share_map"]["central"]
                for v in ys
                if v["mandated_share_map"]["central"]
            )
            if fall > 0:
                gas = sum(
                    (v.get("gas_part") or 0) * v["mandated_eurbn"]["central"] / v["mandated_share_map"]["central"]
                    for v in ys
                    if v["mandated_share_map"]["central"]
                )
                lab[flow] = {"mandated": round(min(1.0, mand / fall), 3), "gas": round(min(1.0, gas / fall), 3)}
        if lab:
            c["sanctions"] = lab
    remove_freight(countries)
    price_indices(countries)
    apply_narrow(countries, src)
    apply_brunei_r6(countries)
    apply_audit2(countries, src, "values")
    uae_fuel_net(countries)
    war_windfall(countries, src)
    pre_war_trends(countries, src)
    counterfactual(countries, src)
    apply_weapons_value(countries, src)
    apply_state_finance(countries, src)
    apply_company_flows(countries, src)
    apply_refugees_net(countries, src)
    apply_ua_arms_purchases(countries, src)
    apply_loans_value(countries, src)
    apply_money_ledger(countries, src)
    apply_russian_arms(countries, src)
    apply_payment_agents(countries, src)
    apply_frozen_reserves(countries, src)
    apply_value_kept(countries, src)
    apply_audit2(countries, src, "trends")
    apply_nowar_prices(countries, src)
    for c in countries.values():
        for obj in c.values():
            if isinstance(obj, dict):
                obj.pop("_refine_delta", None)
                # the baseline always lies inside its own range
                if obj.get("base_range") and obj.get("base") is not None:
                    br = obj["base_range"]
                    obj["base_range"] = [round(min(br[0], obj["base"]), 5), round(max(br[1], obj["base"]), 5)]
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


GAS_PRICES = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/gas_prices.json").read_text())


# energy content of natural gas: MWh per bcm (gross calorific value)
MWH_PER_BCM = 10.55e6
# share of final-use Russian gas that customs already record as imports from Russia under another heading (audit):
# Turkey and Poland book it under confidential or general fuel codes; Germany part of it
GAS_IN_CUSTOMS = {"TUR": 1.0, "POL": 1.0, "DEU": 0.07}


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
# Belarus: fixed dollar contract price, so only the exchange rate moves it (round 7)
for _v in GAS_PRICES["countries"]["BLR"]["index_vs_2019_2021"]["pipeline"].values():
    _v["low"], _v["high"] = round(_v["central"] * 0.98, 4), round(_v["central"] * 1.02, 4)
PRICES_SKIP: set[str] = set()


def fossil_share(iso3: str) -> float:
    """Fuel's share of a country's pre-war imports from Russia: measured 2018-2021 mix where available."""
    mx = (PRICES.get(iso3) or {}).get("mix_2018_2021") if iso3 not in PRICES_SKIP else None
    if mx and mx.get("non_fuel_goods") is not None:
        return 1 - mx["non_fuel_goods"]
    return import_mix(iso3).get("fossil_share") or 0


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
    if iso3 == "TJK" and name == "fossil_all" and band != "central":
        # its 2021 band came from a fixed own-price ratio that cancels in the 2021 index (actuals_r7.json)
        out[0] = s["2021"]["central"] / r * (0.97 if band == "low" else 1.03)
    return out


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
        out.append(round(min(1.0, fuel / tot), 4) if tot and fuel and y >= 2022 else None)
    return out


def price_indices(countries: dict[str, dict]) -> None:
    """Price level of each flow per year against 2019-2021 (= 1), so changes compare volumes, not price swings."""
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


# ---- round 7: prices a no-war market expected (energy_nowar.json) ----
NOWAR = json.loads((Path(__file__).resolve().parent.parent / "research/2026-10/gaps/energy_nowar.json").read_text())
NW_IDX = NOWAR["nowar_index"]
# 2026: the Strait of Hormuz closure was not caused by this war, so the no-war price is the actual world price
NW_WORLD_2026 = {"urals": "brent", "diesel_gasoil_products": "diesel_gasoil_products", "russian_coal": "newcastle",
                 "ttf": "ttf", "jkm": "jkm", "oil_formula_9m": "oil_formula_9m"}  # fmt: skip
# gas contract formulas (weights on hub TTF, a 9-month oil formula and spot JKM); empty = fixed price, no windfall
GAS_FORMULA = {**{i: {"ttf": 1.0} for i in ("HUN", "SVK", "AUT", "DEU", "ITA", "CZE", "FRA", "NLD", "BEL", "CHE", "FIN",
                                            "POL", "SVN", "HRV", "ROU", "LVA", "LTU", "EST", "LUX", "GBR", "ESP", "PRT",
                                            "SWE")},
               "TUR": {"ttf": 0.7, "oil9": 0.3}, **{i: {"ttf": 0.5, "oil9": 0.5} for i in ("GRC", "BGR", "MKD", "MDA")},
               **{i: {"oil9": 1.0} for i in ("SRB", "BIH", "CHN")}, **{i: {} for i in ("BLR", "ARM", "KGZ", "UZB",
                                                                                      "KAZ", "AZE", "GEO")}}  # fmt: skip
LNG_FORMULA = {"JPN": {"oil9": 1.0}, "KOR": {"oil9": 1.0}, "TWN": {"oil9": 0.5, "jkm": 0.5}, "CHN": {"oil9": 0.5, "jkm": 0.5},
               **{i: {"jkm": 1.0} for i in ("IND", "SGP", "THA", "BGD", "PAK", "IDN", "VNM", "KWT", "BRA")}}  # fmt: skip


def nw(name: str, y: int, band: str) -> float:
    """No-war price level of one benchmark (2019-2021 = 1); the actual world price in 2026."""
    if y >= 2026:
        return NW_IDX[NW_WORLD_2026[name]][str(y)]["actual"]
    return NW_IDX[name][str(y)][band]


def formula_ratio(f: dict, y: int, band: str) -> float:
    """No-war over actual value of a gas price formula (1 for a fixed price)."""
    if not f:
        return 1.0
    key = {"ttf": "ttf", "oil9": "oil_formula_9m", "jkm": "jkm"}
    num = sum(w * nw(key[k], y, band) for k, w in f.items())
    return num / sum(w * NW_IDX[key[k]][str(y)]["actual"] for k, w in f.items())


def nowar_ratio(iso3: str, i: int, band_nw: str, band_p: str) -> float:
    """No-war price over actual price of the fuel a country bought from Russia in year i: per fuel paid where its
    customs measure it (prices.json), else its pre-war fuel mix."""
    y = YEARS[i]
    if y < 2022:
        return 1.0
    pipe = GAS_FORMULA.get(iso3, {"ttf": 0.75, "oil9": 0.25})
    lng = LNG_FORMULA.get(iso3, {"ttf": 1.0})
    parts = ((PRICES.get(iso3) or {}).get("windfall_parts") or {}) if iso3 not in PRICES_SKIP else {}
    paid = {f: (v.get(str(y)) or {}).get("paid") or 0 for f, v in parts.items() if f != "non_fuel_goods"}
    tot = sum(v for v in paid.values() if v > 0)
    bench = {"crude": ("urals", "urals"), "products": ("diesel_gasoil_products", "products"),
             "coal": ("russian_coal", "coal"), "other_fossil": ("diesel_gasoil_products", "products")}  # fmt: skip
    if tot > 0:
        acc = 0.0
        for f, v in paid.items():
            if v <= 0:
                continue
            if f in ("pipeline_gas", "lng"):
                acc += v / tot * formula_ratio(pipe if f == "pipeline_gas" else lng, y, band_nw)
                continue
            nwk, ik = bench.get(f, bench["products"])
            own = own_index(iso3, f, band_p) if f in ("crude", "products", "coal") else None
            acc += v / tot * nw(nwk, y, band_nw) / (own[i] if own else idx(ik, band_p)[i])
        return acc
    m = import_mix(iso3)
    fuels = ("crude", "products", "gas", "coal", "other_fossil")
    total = sum(m.get(f) or 0 for f in fuels) or 1
    gas_n = gas_index(iso3, band_p)[i] * formula_ratio(pipe if iso3 in PIPELINE_GAS else lng, y, band_nw)
    nmap = {"crude": nw("urals", y, band_nw), "products": nw("diesel_gasoil_products", y, band_nw), "gas": gas_n,
            "coal": nw("russian_coal", y, band_nw), "other_fossil": nw("diesel_gasoil_products", y, band_nw)}  # fmt: skip
    return sum((m.get(f) or 0) * nmap[f] for f in fuels) / total / fuel_index(iso3, band_p)[i]


def war_windfall(countries: dict[str, dict], src: Sources) -> None:
    """Extra money Russia earned because fuel prices were higher during the war: what a country paid for Russian fuel
    minus what the same fuel would have cost at the prices a no-war market expected (round 7: pre-invasion forecasts
    and futures, energy_nowar.json; 2019-2021 prices before). Negative where Russia sold below that price (the
    sanctions discount): less money to Russia. Non-fuel goods are left out (their price rise is general inflation)."""
    wid = src.add(
        "windfall",
        "War-time price windfall on Russian fuel: payments minus the same volume at the prices a no-war market expected (pre-invasion forecasts and futures: IMF, World Bank, EIA, ECB, ICE)",
        None,
        "2026-10-18",
        "fuel share of payments per year from own customs where measured (prices.json), else the pre-war import mix; fuel price indices (prices.json, energy2.json, gas_prices.json)",
    )
    for iso3, c in countries.items():
        tr = c.get("to_rus")
        if not tr:
            continue
        fs, fsy_own = fossil_share(iso3), fuel_share_year(iso3)
        if not fs and not any(fsy_own):
            continue
        out = {}
        # the low end takes the low fuel price level and the high no-war price (less windfall), the high end the reverse
        for k, band, band_nw in (
            ("years", "central", "central"),
            ("years_lo", "low", "high"),
            ("years_hi", "high", "low"),
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
        c["windfall"] = {**out, "cert": "C", "src": [wid]}


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
        for k in ("bmul", "bmul_lo", "bmul_hi"):
            if tr.get(k):
                tr[k] = [round(b * m, 4) for b, m in zip(tr[k], mul)]
        if not tr.get("bmul"):
            tr["bmul"] = tr["bmul_lo"] = tr["bmul_hi"] = [round(m, 4) for m in mul]
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
        tr["nowar_prices"] = True


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
                # tiny or noisy series can give extreme fitted bounds: kept within 2.5 times the middle value
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
        # the company series starts in 2021; the trend is against 2019-2021 (or about that level, for a 2018-2021 base)
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
            obj["base_2019_2021_avg"] = obj["base"]
            obj["base"] = round(obj["years"][0] / p[0], 5)
            obj["base_range"] = [
                round(min(obj["years_lo"][0] / ph[0], obj["base"]), 5),
                round(max(obj["years_hi"][0] / pl[0], obj["base"]), 5),
            ]
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
        # repayments stopped because sanctions blocked the payment channels, not by the borrower's choice
        if iso3 in SANCTION_BLOCKED_LOANS:
            c["extra"][-1]["blocked"] = True


def apply_company_flows(countries: dict[str, dict], src: Sources) -> None:
    """Company money to Russia (company_flows.json, round 5), by the company's home country: the exit contribution to
    Russia's budget and the forced discount to Russian buyers when foreign companies sell out, and the profits that
    Russian-owned companies abroad send home, against the pre-war level (trusteeships that stopped them count the other
    way). Seizures without payment are recorded in the research file but not counted: they were not a choice."""
    cf = load(GAPS / "company_flows.json")
    sid = src.add(
        "company_flows",
        "Company exits from Russia and Russian-owned companies abroad: Russian budget data, KSE and Yale exit lists, company reports, Bank of Russia balance of payments",
        "https://leave-russia.org/",
        cf.get("generated"),
        "exit contribution and forced discount by home country; profits of Russian-owned firms by host country; see research/2026-10/gaps/company_flows-notes.md",
    )
    # holdings whose owners were mostly international: their 2024 discount is not the home country's (central, EUR bn)
    conduit = {"NLD": 4.7, "KAZ": 3.5}
    for iso3, d in cf["countries"].items():
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
        if any(ex["high"]):
            cert = weakest([d.get("exit_contribution_certainty"), d.get("discount_transfer_certainty")])
            add_extra(c, "exits", "Paid to Russia by companies leaving it", ex, cert or "C", sid)
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
        g = lambda y, b: (d["gross"].get(str(y)) or {}).get(b, 0.0)  # noqa: E731
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
        a["refugee_cert"] = weakest([(d.get("gross_certainty") or "C")[0], (d.get("revenue_certainty") or "C")[0]])
        a["refugee_src"] = list(dict.fromkeys((a.get("refugee_src") or []) + [sid]))


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
            # Czech brokers' commission is profit already: stored as the gross that gives it at the 20% margin
            fb[k] = [
                round((add.get(str(y)) or {}).get(b, 0.0) + (broker.get(str(y)) or {}).get(b, 0.0) / 0.2, 5)
                for y in YEARS
            ]
        fb["arms_cert"] = d.get("certainty") or "C"
        fb["arms_src"] = [sid]


def apply_loans_value(countries: dict[str, dict], src: Sources) -> None:
    """Loans and guarantees at their economic value to Ukraine (loans_value.json, round 5): the grant element, face value
    minus the present value of Ukraine's repayments at the rate it would otherwise pay (10%, range 6-7% to 13-15%).
    Stored as yearly changes against face value, for the country's own aid and its share of EU-level aid; the cost view
    uses the same economic value. New multilateral lending (IMF, World Bank, EBRD, CEB) is credited by shareholding."""
    lv = load(GAPS / "loans_value.json")
    sid = src.add(
        "loans_value",
        "Loans at economic value: Kiel loan terms (maturity, interest, grace), EU regulations, Ukraine's Eurobond yields; IMF, World Bank, EBRD and CEB lending by shareholding",
        "https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/",
        lv.get("generated"),
        "grant element at a 10% discount rate (6-15%); see research/2026-10/gaps/loans_value-notes.md",
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
            face = sum((d.get("loans_guarantees_face_in_map") or {}).values())
            ev = sum((v or {}).get("central", 0.0) for v in (d.get("loans_guarantees_economic_value") or {}).values())
            # the cost view keeps the lender's cost (30% of face): the economic value is Ukraine's gain, discounted at
            # Ukraine's borrowing rate, not what the lender gave up
            if face:
                a["loans_face"], a["loans_grant_eq"], a["loans_value_ukraine"] = (
                    round(face, 3),
                    round(face * LOAN_GRANT_ELEMENT, 3),
                    round(ev, 3),
                )
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
# (frozen_assets.json overlaps; 2026 less than 2025, a guess)
BEL_EUROCLEAR_TAX = {2024: 1.7, 2025: 1.0, 2026: 0.5}
# share of a clearing house's frozen-reserve return credited to its host; the rest goes to all EU members by their
# share of EU-level aid, because the freeze is an EU decision (owner, round 7)
HOST_SHARE = 1 / 3


def apply_frozen_reserves(countries: dict[str, dict], src: Sources) -> None:
    """The return Russia's frozen central-bank reserves would have earned without the freeze (frozen_assets.json,
    round 7): per holding country, at the rates each currency paid each year; the frozen amount itself is not counted.
    Money Russia did not get, so it counts toward Ukraine on the Russia balance. Euroclear (Belgium) and Clearstream
    (Luxembourg): a third to the host, two thirds to all EU members; Belgium's tax on that income, already in its aid,
    is taken off first. The low end allows for Russia having spent part of the reserves without a freeze (x0.8).
    Private sanctioned assets are left out (private money, much of it earning nothing)."""
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
        add_extra(
            countries[iso3], "frozen", "Return denied to Russia on its frozen reserves", out, cert.get(iso3, "C"), sid
        )


def apply_value_kept(countries: dict[str, dict], src: Sources) -> None:
    """The money rule for money a country earns (value_kept.json, round 6): the value kept in its economy (domestic
    value-added share, OECD TiVA; defence-industry evidence for weapons) x how much of it is genuinely extra. Stored as
    factors (low, central, high) per kind of earning; calc() applies them instead of the flat 20% profit margin."""
    vk = load(GAPS / "value_kept.json")
    sid = src.add(
        "value_kept",
        "Value kept in the economy: OECD Trade in Value Added (TiVA, 2025 edition), defence-industry content studies; genuinely extra: production ramp-ups, trade-redirection studies",
        "https://www.oecd.org/en/topics/sub-issues/trade-in-value-added.html",
        vk.get("generated"),
        "value kept x genuinely extra, per country and kind of earning; see research/2026-10/gaps/value_kept-notes.md",
    )
    keys = {"fw": ("flowback_weapons", "product"), "fo": ("flowback_other", "product"),
            "rl": ("sales_to_russia_lost", "product"), "rx": ("sales_to_russia_extra", "product"),
            "ux": ("sales_to_ukraine_extra", "product"), "sl": ("services_to_russia", "product"),
            "sx": ("services_to_russia", "product_when_more"), "sh": ("shipping", "product")}  # fmt: skip
    for iso3, d in vk["countries"].items():
        c = countries.get(iso3)
        if not c:
            continue
        out = {}
        for k, (flow, field) in keys.items():
            v = (d.get(flow) or {}).get(field) or (d.get(flow) or {}).get("product")
            if v:
                out[k] = [round(v["low"], 3), round(v["central"], 3), round(v["high"], 3)]
        c["vk"] = out
    # freight earned carrying Russian oil: gross freight x value kept x genuinely extra, in place of its profit share;
    # insurance, ship sales and registry fees keep their profit shares (SHIPPING_PROFIT)
    pf = SHIPPING_PROFIT["freight"]
    for c in countries.values():
        sh = c.get("shipping")
        fr = sh.pop("_fr", None) if sh else None
        f = (c.get("vk") or {}).get("sh")
        if not fr or not f:
            continue
        for k, n in (("years", 1), ("years_lo", 0), ("years_hi", 2)):
            sh[k] = [round(max(0.0, v - g * pf[n]) + g * f[n], 5) for v, g in zip(sh[k], fr[k])]
        sh["base"] = round(fr["base"] * f[1], 5)
        sh["base_range"] = [round(fr["base_range"][0] * f[0], 5), round(fr["base_range"][1] * f[2], 5)]
        if sid not in sh["src"]:
            sh["src"].append(sid)
    for c in countries.values():
        if c.get("shipping"):
            c["shipping"].pop("_fr", None)
    VALUE_KEPT_SRC.append(sid)


VALUE_KEPT_SRC: list[str] = []


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
        "https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/",
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
        fb["purl_src"] = fb["arms_src"] = [sid]
        if sid not in fb.setdefault("src", []):
            fb["src"].append(sid)


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
        if sid not in lb.setdefault("src", []):
            lb["src"].append(sid)


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
            lb[k] = [round(ys[str(y)][b], 5) for y in YEARS]
        if base:
            lb["base"], lb["base_range"] = base["central"], [base["low"], base["high"]]
        lb["cert"] = (cert or "C")[0]
        lb["src"] = [sid]


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
                for key, out_f, give_f in (("years", mid, mid), ("years_lo", hi + bunker, lo), ("years_hi", lo, hi)):
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
        "hub resale shares are estimates; hub customers from UN Comtrade HS 2710 exports 2024; crude content 42-60% of the fuel value (CREA)",
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
        # some fuel refined from Russian crude reached buyers before the war too: only the rise above that level, and
        # its pre-war growth, counts (round4a.json; same crude-content factor and EU correction as the yearly values)
        pw = LAUNDERED_PREWAR.get(iso3) or {}
        lb = {"years": tr["laundered"], "years_lo": tr["laundered_lo"], "years_hi": tr["laundered_hi"], "base": 0.0, "base_range": [0.0, 0.0], "cert": "C", "src": [lid]}  # fmt: skip
        if prewar.get(iso3) and prewar[iso3][0] > 0:
            mid_b, lo, hi = prewar[iso3][0], *sorted(prewar[iso3][1:])
            lb["base"] = round(mid_b * CRUDE_CONTENT[1], 5)
            lb["base_range"] = [
                round(min(lo * CRUDE_CONTENT[0], lb["base"]), 5),
                round(max(hi * CRUDE_CONTENT[2], lb["base"]), 5),
            ]
            # growth from the 2018-2021 midpoint; the range always includes no growth
            g = pw.get("g") or {"low": 0, "central": 0, "high": 0}
            lb["bmul"] = [1.0] + [round((1 + g["central"]) ** (y - 2019.5), 4) for y in YEARS[1:]]
            lb["bmul_lo"] = [1.0] + [round(min(1.0, (1 + g["low"]) ** (y - 2019.5)), 4) for y in YEARS[1:]]
            lb["bmul_hi"] = [1.0] + [round(max(1.0, (1 + g["high"]) ** (y - 2019.5)), 4) for y in YEARS[1:]]
        countries[iso3]["laund"] = lb
        if iso3 in HUB_RESALE:
            countries[iso3]["hub"] = (
                "fuel trading hub: the share of laundered oil it resells is counted for its customers"
            )


# Hong Kong: share of its Russian imports that is precious metals, and the share of that passed on to mainland China
HK_METALS_SHARE = 0.98
HK_ONWARD = (0.3, 0.55, 0.85)
TRANSIT_HUBS = {"HKG": "gold transit hub: the share of Russian gold passed on to mainland China is counted for China"}  # fmt: skip


# share of shipping income that is profit (low, middle, high): freight pays for fuel, port fees, crew and the ship itself
# (tanker operating margins in the 2022-23 boom: 30-50%); a ship sale is already counted as its price premium
SHIPPING_PROFIT = {"freight": (0.2, 0.35, 0.5), "insurance_finance": (0.1, 0.25, 0.4), "ship_sales": (0.8, 1.0, 1.0), "registry": (0.3, 0.5, 0.7)}  # fmt: skip
# customs values of imports include freight and insurance (CIF): that part is paid to shippers and insurers, not to Russia,
# and is counted for them (shipping, services); taken out of payments to Russia (low, middle, high share)
CIF_SHARE = (0.035, 0.055, 0.075)


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
    # Mauritania: pre-war 'Russian' fuel was traders' origin labels; Russia's own exports x1.1
    if t := ser("MRT", "to_rus"):
        t["base"], t["base_range"] = 0.021, [0.013, 0.035]
        t["years"][0], t["years_lo"][0], t["years_hi"][0] = 0.021, 0.013, 0.035
    # Saint Lucia and Bonaire: crude and fuel oil to storage terminals, not used there
    for iso3 in ("LCA", "BES"):
        if t := ser(iso3, "to_rus"):
            for k in ("years", "years_lo", "years_hi"):
                t[k] = [0.0] * 6
            t["base"], t["base_range"] = 0.0, [0.0, 0.0]
            t.pop("laundered", None)
    # Gibraltar: fuel bought to sell as bunkers to passing ships; the money comes from shipowners elsewhere. Like the
    # other resellers, it keeps a margin: 10% (5-30%) of its Russian fuel and of the fuel made from Russian crude
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
    # Seychelles: shadow-tanker managers registered there are fronts; 20% (5-50%) kept
    if t := ser("SYC", "shipping"):
        for k, f in (("years", 0.2), ("years_lo", 0.05), ("years_hi", 0.5)):
            t[k] = [round(v * f, 5) for v in t[k]]
            if t.get("_fr"):
                t["_fr"][k] = [v * f for v in t["_fr"][k]]
    # Malta: services bought from Russia reported as near zero after 2022 (confidential cells)
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
        moved += d
    others = {i: c["aid"]["eu_share"] for i, c in countries.items() if i in EU27 and i not in ("CZE", "HUN", "SVK") and (c.get("aid") or {}).get("eu_share")}  # fmt: skip
    tot = sum(others.values()) or 1
    for i, sh in others.items():
        a = countries[i]["aid"]
        a["years"][5] = round(a["years"][5] + moved * sh / tot, 5)
        if a.get("eu_years"):
            a["eu_years"][5] = round(a["eu_years"][5] + moved * sh / tot, 5)
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
    for k, b in (("years", "central"), ("years_lo", "low"), ("years_hi", "high")):
        tr[k] = [
            round(max(0.0, v - cus.get(str(y), 0.0)) + (res.get(str(y)) or {}).get(b, 0.0), 5)
            for v, y in zip(tr[k], YEARS)
        ]
    r21 = res["2021"]
    tr["base"], tr["base_range"] = round(r21["central"], 5), [round(r21["low"], 5), round(r21["high"], 5)]


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
        for k, f in (("years", CIF_SHARE[1]), ("years_lo", CIF_SHARE[2]), ("years_hi", CIF_SHARE[0])):
            tr[k] = [round(v * (1 - f * (1 - bp.get(str(y), 0.0))), 5) for v, y in zip(tr[k], YEARS)]
        b0 = 1 - bp.get("2019-2021", 0.0)
        tr["base"] = round(tr.get("base", 0) * (1 - CIF_SHARE[1] * b0), 5)
        if tr.get("base_range"):
            br = tr["base_range"]
            tr["base_range"] = [round(br[0] * (1 - CIF_SHARE[2] * b0), 5), round(br[1] * (1 - CIF_SHARE[0] * b0), 5)]


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
                if part == "freight":
                    fr["years"][i] += v.get("central", 0) * (1 - o.get("central", 0))
                    fr["years_lo"][i] += v.get("low", 0) * (1 - o.get("high", 0))
                    fr["years_hi"][i] += v.get("high", 0) * (1 - o.get("low", 0))
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
                v if i == 0 else round(v - rise[i] * HK_METALS_SHARE * on[i][keep_b], 5)
                for i, v in enumerate(base[key])
            ]
            cn["to_rus"][key] = [
                v if i == 0 else round(v + rise[i] * HK_METALS_SHARE * on[i][give_b], 5)
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
    write_gaps_report(data)
    # the data-coverage notes (a sixth of the file) load after the map, from detail.json, so phones start faster
    detail = {"coverage": {c["iso3"]: c.pop("coverage") for c in data["countries"].values() if "coverage" in c}}
    OUT.write_text(json.dumps(data, separators=(",", ":")) + "\n")
    (OUT.parent / "detail.json").write_text(json.dumps(detail, separators=(",", ":")) + "\n")
    print(f"wrote {OUT} with {len(data['countries'])} entries and {len(data['sources'])} sources")
