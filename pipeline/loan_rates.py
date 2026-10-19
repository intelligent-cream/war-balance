"""Round 12 (data precision): value every loan and guarantee in loans_value.json from measured rates and measured
expected losses, and write the result back into research/2026-10/gaps/loans_value.json. Run it after changing an input
in research/2026-10/raw/loan_rates/ or a constant below, then rebuild: `uv run loan_rates.py && uv run build_data.py`.

The gift in a loan has two parts (docs/method/loans.md):
  A. cheaper interest: Ukraine's repayments are worth less than the face value at the rate Ukraine normally pays;
  B. default risk the lender really carries: the expected loss of its creditor class.
Ukraine's gain = 1 - PV(repayments at the normal rate) x (1 - expected loss), per loan item.
  low     = the normal rate, no expected loss for any official lender
  central = the normal rate, the measured expected loss of the creditor class
  high    = the promised war yield of the year the loan was paid out (it already prices default, so no extra loss)
The lender's cost (cost view) = 1 - PV(repayments at the lender's own funding rate) x (1 - expected loss): the same
terms and losses, discounted at what the money cost the lender.

The loan terms (maturity, grace, interest, EU interest subsidy) are the existing ones in meta.loan_classes. Each item
keeps its round-5 grant element (10% central rate) as ge_round5. The script is idempotent: it never reads its own output
values, only the terms, the raw files and the round-5 multilateral values (kept as value_by_year_round5)."""

import csv
import datetime as dt
import json
import statistics
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "2026-10" / "raw" / "loan_rates"
OUT = ROOT / "research" / "2026-10" / "gaps" / "loans_value.json"
YEARS = [str(y) for y in range(2022, 2027)]
BANDS = ("low", "central", "high")

# A. Ukraine's normal rate: its 2021 USD Eurobonds, before the war. 6.875% for the new 8-year issue (Ukrinform,
# 27 Apr 2021) and 6.30% for the July tap of the same bond (Interfax-Ukraine, 22 Jul 2021); the mean, as a semi-annual
# bond yield. No 2021 market yield of Ukraine's EUR bond (4.375% 2030, issued Jan 2020) could be found, so the USD
# rate is used for loans in every currency (it overstates the gift on yen and euro loans a little).
NORMAL_2021 = (0.06875, 0.0630)

# the long pre-war Eurobond that turns ICU's weekly prices into yields: 6.75% semi-annual coupon, due 15 Mar 2033.
# Fitted to ICU's own price-yield statements (calibration_pairs in icu_weekly_eurobond_prices.json); it reproduces
# them within about 1.5 points of yield (37% -> 35.8%, 24% -> 23.5%, 26% -> 24.7%)
BOND_COUPON, BOND_MATURITY = 0.0675, dt.date(2033, 3, 15)
# restructured Series A bonds whose yields stand for Ukraine's long-term rate after September 2024
LONG_BONDS = ("2034", "2035", "2036")

# B. expected loss by creditor class: low / central / high (high is used in the cost view only; the high gain uses
# the war yield instead). Evidence in loans_value-notes.md and docs/method/loans.md.
EXPECTED_LOSS = {
    # IMF and World Bank are senior creditors (Schlegl, Trebesch and Wright, NBER w25793); Ukraine kept paying the IMF
    # through the war (Interfax, 6 Mar 2026: USD 279.7m repaid in February 2026). Canada's and the Netherlands'
    # loans through the IMF Administered Account are treated like IMF loans, and IBRD loans backed by a donor's
    # guarantee only cost the guarantor if Ukraine stops paying the IBRD
    "imf": (0.0, 0.0, 0.0),
    "ibrd": (0.0, 0.0, 0.0),
    # EU loans were left out of the 2024 bond restructuring and of the bilateral standstill, and are serviced. The
    # central value is the provisioning rate the EU normally sets aside for MFA loans to countries in a balance-of-
    # payments crisis (9%); the high is the 70% the Commission chose for Ukraine's EUR 1bn exceptional MFA in 2022,
    # because 9% was "not adequate in this case" (Legislative Observatory, 2022/0213(COD), 7 Jul 2022)
    "eu": (0.0, 0.09, 0.70),
    # bilateral official lenders (Group of Creditors of Ukraine): the measured loss is the debt-service suspension
    # (GCU below), modelled in the cash flows. A final debt treatment is still to come (IMF press release 26/66,
    # 26 Feb 2026); the high takes a loss like the bondholders' 2024 present-value haircut, about 60% at 14%
    # (Government of Ukraine, 4 Sep 2024), which the GCU's comparability principle points to
    "bilateral": (0.0, 0.0, 0.60),
}
CREDITOR = {
    "eu_mfa_2022_emergency": "eu",
    "eu_mfa_2022_exc1": "eu",
    "eu_mfa_2022_exc5": "eu",
    "eu_mfa_plus": "eu",
    "eu_ukraine_facility": "eu",
    "eib": "eu",
    "ibrd_guaranteed": "ibrd",
    "imf_admin_account": "imf",
    "can_2023": "imf",
    "can_sovereignty_bond": "bilateral",
    "nld_imf": "bilateral",
    "jica": "bilateral",
    "fra_treasury": "bilateral",
    "deu_kfw": "bilateral",
    "ita_zero": "bilateral",
    "ita_home": "bilateral",
    "concessional_default": "bilateral",
    "kor_exim": "bilateral",
    "fin_wb": "bilateral",
    "tied_export_credit": "bilateral",
    "exim_commercial": "bilateral",
}
# the Group of Creditors of Ukraine standstill (MoU of 16 Apr 2026, Government of Ukraine 17 Apr 2026; French Treasury
# 17 Apr 2026): payments due from August 2022 to February 2030 on debt paid out before 26 Nov 2025 are deferred, with
# the deferred interest capitalised, and repaid in equal instalments over 2035-2039. Members only.
GCU_MEMBERS = {"CAN", "FRA", "DEU", "ITA", "JPN", "KOR", "NLD", "GBR", "USA"}
GCU_LAST_LOAN_YEAR, GCU_DEFERRED_TO, GCU_REPAY = 2025, 2029, (2035, 2039)

# the lender's funding rate (cost view). EU: the Commission's reported cost of funding at end-2025 (Council doc
# 8202/26): Ukraine Facility 2.76%, MFA+ 3.15%, other MFA 2.54% (round 11). National lenders: the OECD 10-year
# government bond yield, yearly mean (FRED series IRLTLT01xxM156N, in raw/loan_rates/fred); Latvia, which has no
# series, uses the euro area's
# round 5's discount rates (6-7% low, 10% central, 13-15% high), to move the multilateral values from them
ROUND5_RATES = {
    "low": {"2022": 0.07, "2023": 0.07, "2024": 0.06, "2025": 0.06, "2026": 0.06},
    "central": {y: 0.10 for y in YEARS},
    "high": {"2022": 0.15, "2023": 0.15, "2024": 0.14, "2025": 0.13, "2026": 0.13},
}
EU_FUNDING = {"eu_ukraine_facility": 0.0276, "eu_mfa_plus": 0.0315}
EU_FUNDING_OTHER = 0.0254
FRED = {
    "CAN": "CA",
    "DEU": "DE",
    "FRA": "FR",
    "ITA": "IT",
    "JPN": "JP",
    "KOR": "KR",
    "NLD": "NL",
    "ESP": "ES",
    "FIN": "FI",
    "SVK": "SK",
    "GBR": "GB",
    "USA": "US",
    "LVA": "EZ",
}


# the round-12 sources, added to loans_value.json's list (also under loans_value in sources_r11.json)
ROUND12_SOURCES = [
    {
        "name": "Ukrinform: Ukraine prices USD 1.25bn 8-year Eurobond at 6.875% (normal rate)",
        "url": "https://www.ukrinform.net/rubric-economy/3235891-ukraine-to-issue-eurobonds-worth-125b-finance-ministry.html",
        "date": "2021-04-27",
    },
    {
        "name": "ICU Weekly Insight: weekly Eurobond price ranges 2022-2024 (72 issues; example 28 Mar 2022)",
        "url": "https://icu.ua/download/4058/ICUWeeklyInsight-20220328-Eng.pdf",
        "date": "2022-03-28",
    },
    {
        "name": "Eavex Capital Fixed Income Weekly: yields of the restructured Eurobonds (106 issues; example 22 Dec 2025)",
        "url": "https://www.eavex.com.ua/wp-content/uploads/2025/12/eavex-fi-weekly-dec-22.pdf",
        "date": "2025-12-22",
    },
    {
        "name": "Government of Ukraine: Eurobond restructuring completed (37% face cut, ~60% PV cut at 14%)",
        "url": "https://www.kmu.gov.ua/en/news/ukraina-zavershyla-restrukturyzatsiiu-derzhavnykh-oblihatsii-ta-harantovanykh-derzhavoiu-ievrooblihatsii-na-sumu-205-mlrd-dolariv-ssha",
        "date": "2024-09-04",
    },
    {
        "name": "Government of Ukraine: GCU memorandum, debt service suspended to Feb 2030, repaid 2035-2039",
        "url": "https://www.kmu.gov.ua/en/news/serhii-marchenko-ta-hrupa-ofitsiinykh-kredytoriv-z-krain-g7-ta-paryzkoho-klubu-pidpysaly-memorandum-pro-vidterminuvannia-platezhiv-z-pohashennia-i-obsluhovuvannia-borhu-ukrainy",
        "date": "2026-04-17",
    },
    {
        "name": "French Treasury: Group of Creditors of Ukraine statement (debt covered, members)",
        "url": "https://www.tresor.economie.gouv.fr/Articles/2026/04/17/group-of-creditors-of-ukraine-statement",
        "date": "2026-04-17",
    },
    {
        "name": "Legislative Observatory 2022/0213(COD): MFA provisioning 9% usual, 70% for Ukraine",
        "url": "https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1710888",
        "date": "2022-07-07",
    },
    {
        "name": "Schlegl, Trebesch and Wright: The Seniority Structure of Sovereign Debt (NBER w25793)",
        "url": "https://www.nber.org/papers/w25793",
        "date": "2019-05",
    },
    {
        "name": "Interfax: Ukraine repaid USD 279.7m to the IMF in February 2026",
        "url": "https://interfax.com/newsroom/top-stories/116503/",
        "date": "2026-03-06",
    },
    {
        "name": "FRED (OECD): 10-year government bond yields, series IRLTLT01xxM156N (lenders' funding rates)",
        "url": "https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01DEM156N&cosd=2021-01-01",
        "date": "2026-10-19",
    },
]


def eff(y: float) -> float:
    """A semi-annual bond yield as an annual rate (the grant element discounts once a year)."""
    return (1 + y / 2) ** 2 - 1


def bond_price(y: float, settle: dt.date) -> float:
    """Clean price per 1 of face of the stylised long Eurobond at a semi-annual yield y."""
    dates, d = [], BOND_MATURITY
    while d > settle:
        dates.append(d)
        d = dt.date(d.year - (1 if d.month <= 6 else 0), (d.month - 7) % 12 + 1, d.day)
    accrued = BOND_COUPON / 2 * (settle - d).days / (dates[-1] - d).days
    dirty = sum(
        (BOND_COUPON / 2 + (1 if c == BOND_MATURITY else 0)) / (1 + y / 2) ** (2 * (c - settle).days / 365.25)
        for c in dates
    )
    return dirty - accrued


def bond_yield(price: float, settle: dt.date) -> float:
    lo, hi = 0.0, 5.0
    for _ in range(80):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if bond_price(mid, settle) > price else (lo, mid)
    return mid


def measured_rates() -> dict:
    """Normal rate, promised war yield by year, and the post-restructuring yields (for the notes)."""
    icu = json.loads((RAW / "icu_weekly_eurobond_prices.json").read_text())
    eavex = json.loads((RAW / "eavex_weekly_eurobond_ytm.json").read_text())
    war: dict[str, list[float]] = {}
    for w in icu["weeks"]:
        d = dt.date.fromisoformat(w["price_date"])
        war.setdefault(str(d.year), []).append(eff(bond_yield(w["low"] / 100, d)))
    post: dict[str, list[float]] = {}
    for w in eavex["weeks"]:
        ys = [w["bonds"][b]["ytm_pct"] / 100 for b in LONG_BONDS if b in w["bonds"]]
        war.setdefault(w["date"][:4], []).append(eff(max(ys)))
        post.setdefault(w["date"][:4], []).append(eff(statistics.mean(ys)))
    cal = [
        (p["ytm"], bond_yield(p["price"], dt.date.fromisoformat(p.get("price_date") or p["report"])))
        for p in icu["calibration_pairs"]
    ]
    return {
        "normal": round(eff(statistics.mean(NORMAL_2021)), 4),
        "war": {y: round(statistics.mean(war[y]), 4) for y in YEARS},
        "war_weeks": {y: len(war[y]) for y in YEARS},
        "post_restructuring": {y: round(statistics.mean(v), 4) for y, v in post.items()},
        "calibration": [{"icu": a, "model": round(b, 3)} for a, b in cal],
    }


def lender_funding() -> dict[str, dict[str, float]]:
    out = {}
    for iso3, code in FRED.items():
        rows = list(csv.reader((RAW / "fred" / f"IRLTLT01{code}M156N.csv").open()))[1:]
        out[iso3] = {
            y: round(statistics.mean(float(v) for d, v in rows if d.startswith(y) and v not in ("", ".")) / 100, 4)
            for y in YEARS
        }
    return out


def flows(c: dict, year: int, sub_last: int, gcu: bool) -> list[tuple[int, float]]:
    """Ukraine's payments per 1 lent: (years after payout, amount). Equal principal instalments after the grace period,
    interest on the balance; interest paid by the EU budget or member states is left out up to sub_last. Under the GCU
    standstill, payments due to 2029 are deferred with interest at the loan's rate and repaid over 2035-2039."""
    m, g, r, sub = c["M"], c["G"], c["r"], c.get("sub", False)
    n = m - g
    out = []
    for t in range(1, m + 1):
        bal = 1.0 if t <= g else 1.0 - (t - g - 1) / n
        pay = (0.0 if sub and year + t <= sub_last else r * bal) + (1 / n if t > g else 0.0)
        out.append((t, pay))
    if not gcu:
        return out
    first, last = GCU_REPAY
    deferred = sum(p * (1 + r) ** (first - 1 - (year + t)) for t, p in out if year + t <= GCU_DEFERRED_TO)
    kept = [(t, p) for t, p in out if year + t > GCU_DEFERRED_TO]
    k = last - first + 1
    for i in range(k):
        bal = deferred * (1 - i / k)
        kept.append((first + i - year, deferred / k + r * bal))
    return sorted(kept)


def pv(fl: list[tuple[int, float]], rate: float) -> float:
    return sum(p / (1 + rate) ** t for t, p in fl)


def values(cls: str, c: dict, year: int, lender: str | None, rates: dict, funding: dict, sub: dict) -> dict:
    """Ukraine's gain (ge) and the lender's cost (cost), low / central / high, for 1 lent."""
    if "fixed" in c:
        f = c["fixed"]
        return {"ge": dict(f), "cost": dict(f), "el": None}
    group = CREDITOR[cls]
    el = EXPECTED_LOSS[group]
    gcu = group == "bilateral" and lender in GCU_MEMBERS and year <= GCU_LAST_LOAN_YEAR
    y, normal = str(year), rates["normal"]
    sl = {b: sub[b] for b in BANDS}
    plain = {b: flows(c, year, sl[b], False) for b in BANDS}
    real = {b: flows(c, year, sl[b], gcu) for b in BANDS}
    ge = {
        "low": 1 - pv(plain["low"], normal),
        "central": 1 - pv(real["central"], normal) * (1 - el[1]),
    }
    ge["high"] = max(ge["central"], 1 - pv(plain["high"], rates["war"][y]))
    if group == "ibrd":
        cost = dict(zip(BANDS, el))  # the guarantor pays only if Ukraine defaults on the IBRD
    else:
        fund = EU_FUNDING.get(cls, EU_FUNDING_OTHER) if group == "eu" else funding.get(lender, funding["USA"])[y]
        cost = {
            "low": 1 - pv(plain["low"], fund),
            "central": 1 - pv(real["central"], fund) * (1 - el[1]),
            "high": 1 - pv(real["high"], fund) * (1 - el[2]),
        }
    gcu_loss = 1 - pv(real["central"], normal) / pv(plain["central"], normal) if gcu else 0.0
    return {"ge": clip(ge), "cost": clip(cost), "el": group, "gcu_npv_loss": round(gcu_loss, 3)}


def clip(v: dict) -> dict:
    return {b: round(min(1.0, max(0.0, v[b])), 3) for b in BANDS}


def proxy_ge(c: dict, year: int, rate: float) -> float:
    return max(0.0, 1 - pv(flows(c, year, 0, False), rate))


def eu_part(tot: dict, usl: dict, s: float, s24: float) -> dict:
    """A member's share of EU-level loans: its EU budget share, and its guarantor share for the Ukraine Support Loan."""
    return {y: {b: s * (tot[y][b] - usl[y][b]) + s24 * usl[y][b] for b in BANDS} for y in YEARS}


def fit_imf_proxy(sens: dict) -> dict:
    """The IMF loan behind the round-5 sensitivity row (about 5%, 10 years), fitted to its grant elements, so the IMF
    part can be moved to the new rates the same way as a loan item."""
    target = {float(k[:-1]) / 100: v for k, v in sens.items()}
    best = None
    for m in range(4, 16):
        for g in range(m):
            for r10 in range(30, 70):
                c = {"M": m, "G": g, "r": r10 / 1000}
                err = sum((max(0, 1 - pv(flows(c, 2023, 0, False), d)) - v) ** 2 for d, v in target.items())
                if best is None or err < best[0]:
                    best = (err, c)
    return best[1]


def main() -> None:
    lv = json.loads(OUT.read_text())
    meta = lv["meta"]
    classes, sub = meta["loan_classes"], meta["eu_interest_subsidy_last_year"]
    rates, funding = measured_rates(), lender_funding()

    def revalue(items: list, lender: str | None) -> None:
        for it in items:
            v = values(it["class"], classes[it["class"]], it["year"], lender, rates, funding, sub)
            it.setdefault("ge_round5", it["ge"])
            it["ge"], it["cost"] = v["ge"], v["cost"]
            if v.get("gcu_npv_loss"):
                it["gcu_npv_loss"] = v["gcu_npv_loss"]

    def total(items: list, key: str, cat: str | None = None, cls: str | None = None) -> dict:
        out = {y: {b: 0.0 for b in BANDS} for y in YEARS}
        for it in items:
            if (cat and it["cat"] != cat) or (cls and it["class"] != cls):
                continue
            for b in BANDS:
                out[str(it["year"])][b] += it["face"] * it[key][b]
        return out

    eu = lv["eu_institutions"]
    revalue(eu["items"], None)
    eu_ev, eu_cost = total(eu["items"], "ge"), total(eu["items"], "cost")
    usl_face = {
        y: sum(it["face"] for it in eu["items"] if it["class"] == "eu_usl" and str(it["year"]) == y) for y in YEARS
    }
    usl_ev, usl_cost = total(eu["items"], "ge", cls="eu_usl"), total(eu["items"], "cost", cls="eu_usl")
    eu["economic_value"] = {y: {b: round(eu_ev[y][b], 4) for b in BANDS} for y in YEARS}
    eu["lender_cost"] = {y: {b: round(eu_cost[y][b], 4) for b in BANDS} for y in YEARS}
    eu["total_value"] = {b: round(sum(eu_ev[y][b] for y in YEARS), 3) for b in BANDS}
    eu["total_lender_cost"] = {b: round(sum(eu_cost[y][b] for y in YEARS), 3) for b in BANDS}

    # new multilateral lending: the IMF and World Bank parts move with their grant element, each band from its own
    # round-5 value (which also carries that band's volume): new = old x grant element at the new rate / at the round-5
    # rate, for an IMF proxy loan and the IBRD terms. EBRD and CEB use fixed judged factors that do not depend on the rate
    proxy = {"IMF": fit_imf_proxy(meta["sensitivity_grant_element_2023"]["imf_eff"]), "WB": classes["ibrd_guaranteed"]}
    new_rate = {b: {y: rates["war"][y] if b == "high" else rates["normal"] for y in YEARS} for b in BANDS}
    for k, c in proxy.items():
        inst = lv["multilateral"][k]
        old = inst.setdefault("value_by_year_round5", inst["value_by_year"])
        new = {}
        for y in YEARS:
            g_new = {b: proxy_ge(c, int(y), new_rate[b][y]) for b in BANDS}
            g_old = {b: proxy_ge(c, int(y), ROUND5_RATES[b][y]) for b in BANDS}
            new[y] = {b: round(old[y][b] * g_new[b] / g_old[b], 4) if g_old[b] else 0.0 for b in BANDS}
            # the round-5 bands also differ in volume; keep them in order
            new[y]["high"] = max(new[y]["high"], new[y]["central"])
            new[y]["low"] = min(new[y]["low"], new[y]["central"])
        inst["value_by_year"], inst["proxy_terms"] = new, c
        inst["total"] = {b: round(sum(new[y][b] for y in YEARS), 3) for b in BANDS}

    for iso3, d in lv["countries"].items():
        bil = d.get("bilateral")
        bev = bcost = {y: {b: 0.0 for b in BANDS} for y in YEARS}
        if bil:
            revalue(bil["items"], iso3)
            bev, bcost = total(bil["items"], "ge"), total(bil["items"], "cost")
            bil["economic_value"] = {y: {b: round(bev[y][b], 4) for b in BANDS} for y in YEARS}
            bil["lender_cost"] = {y: {b: round(bcost[y][b], 4) for b in BANDS} for y in YEARS}
        el = d.get("eu_level_share")
        sev = scost = {y: {b: 0.0 for b in BANDS} for y in YEARS}
        if el:
            s = el["share"]
            # the Ukraine Support Loan is split over its 24 guarantors only: that share is read back from the face value
            s24 = s + (
                (el["face_value"]["2026"] - s * eu["face_value"]["2026"]) / usl_face["2026"] if usl_face["2026"] else 0
            )
            sev, scost = eu_part(eu_ev, usl_ev, s, s24), eu_part(eu_cost, usl_cost, s, s24)
            el["economic_value"] = {y: {b: round(sev[y][b], 4) for b in BANDS} for y in YEARS}
            el["lender_cost"] = {y: {b: round(scost[y][b], 4) for b in BANDS} for y in YEARS}
        if "loans_guarantees_face_in_map" in d:
            face = d["loans_guarantees_face_in_map"]
            d["loans_guarantees_economic_value"] = {
                y: {b: round(bev[y][b] + sev[y][b], 4) for b in BANDS} for y in YEARS
            }
            d["loans_guarantees_lender_cost"] = {
                y: {b: round(bcost[y][b] + scost[y][b], 4) for b in BANDS} for y in YEARS
            }
            d["net_adjustment_vs_face"] = {
                y: {b: round(bev[y][b] + sev[y][b] - face.get(y, 0.0), 4) for b in BANDS} for y in YEARS
            }
        ml = d.get("multilateral_new")
        if ml:
            ev = {
                y: {
                    b: round(
                        sum(
                            lv["multilateral"][k]["shares_used"].get(iso3, 0)
                            * lv["multilateral"][k]["value_by_year"][y][b]
                            for k in lv["multilateral"]
                        ),
                        4,
                    )
                    for b in BANDS
                }
                for y in YEARS
            }
            ml["economic_value"] = ev
            ml["by_institution"] = {
                k: {
                    b: round(sum(inst["value_by_year"][y][b] for y in YEARS) * inst["shares_used"][iso3], 4)
                    for b in BANDS
                }
                for k, inst in lv["multilateral"].items()
                if iso3 in inst["shares_used"]
            }
        loans = d.get("loans_guarantees_economic_value") or {}
        mle = (d.get("multilateral_new") or {}).get("economic_value") or {}
        d["total_economic_value_2022_2026"] = {
            b: round(sum((loans.get(y) or {}).get(b, 0) + (mle.get(y) or {}).get(b, 0) for y in YEARS), 3)
            for b in BANDS
        }

    meta["discount_rates"] = {
        "normal_all_years": rates["normal"],
        "war_promised_yield": rates["war"],
        "war_weeks_measured": rates["war_weeks"],
        "post_restructuring_long_bonds": rates["post_restructuring"],
        "price_to_yield_calibration": rates["calibration"],
        "lender_funding": {"EU": {**EU_FUNDING, "other": EU_FUNDING_OTHER}, **funding},
        "note": "Round 12. low and central: Ukraine's 2021 USD Eurobond yield (mean of 6.875% and 6.30%, as an annual rate), "
        "all years and currencies. high: the promised yield of Ukraine's longest Eurobonds in the year of payout "
        "(2022-23 from ICU's weekly prices; 2024 from ICU's prices to March and Eavex's yields from October; 2025-26 "
        "from Eavex's yields, the highest of the 2034-36 bonds each week), yearly mean. Yields are semi-annual bond "
        "yields turned into annual rates. lender_funding: the lender's own rate for the cost view.",
    }
    meta["expected_loss"] = {
        "by_creditor_class_low_central_high": {k: list(v) for k, v in EXPECTED_LOSS.items()},
        "class_of_each_loan_class": CREDITOR,
        "fixed_classes": "eu_usl (repaid only from Russian reparations), guarantee_private, dfi_commercial, contribution "
        "and swap_line keep fixed values (meta.loan_classes)",
        "gcu": {
            "members": sorted(GCU_MEMBERS),
            "covered_loans_paid_out_to": GCU_LAST_LOAN_YEAR,
            "payments_deferred_to": GCU_DEFERRED_TO,
            "repaid": list(GCU_REPAY),
        },
    }
    meta["grant_element_by_class_and_year"] = {
        k: {y: values(k, c, int(y), None, rates, funding, sub)["ge"] for y in YEARS} for k, c in classes.items()
    }
    meta["method"] = (
        "Round 12. Ukraine's gain per loan item = 1 - PV of Ukraine's repayments under the loan's terms x (1 - expected "
        "loss of the creditor class). low: discounted at Ukraine's normal (2021) rate, no expected loss for official "
        "lenders. central: the normal rate and the measured expected loss (IMF and IBRD 0; EU 9%; bilateral lenders of "
        "the Group of Creditors of Ukraine: the debt-service suspension in the cash flows). high: the promised war "
        "yield of the payout year. Fixed classes (Ukraine Support Loan, guarantees for firms, swap line) keep their "
        "values. Lender's cost (cost view): the same terms and losses discounted at the lender's own funding rate. See "
        "docs/method/loans.md and loans_value-notes.md. Round 5 used 10% (6-7% low, 13-15% high) for all loans; each "
        "item keeps that value as ge_round5."
    )
    meta["how_to_use"] = (
        "Ukraine's gain: replace the face value of loans and guarantees in the net shift by "
        "loans_guarantees_economic_value (the change is net_adjustment_vs_face). Cost view: "
        "loans_guarantees_lender_cost replaces the face value. multilateral_new is a separate part toward Ukraine."
    )
    tot = {b: eu["total_value"][b] for b in BANDS}
    cost = {b: eu["total_lender_cost"][b] for b in BANDS}
    for d in lv["countries"].values():
        for b in BANDS:
            tot[b] += sum((v or {}).get(b, 0.0) for v in (d.get("bilateral") or {}).get("economic_value", {}).values())
            cost[b] += sum((v or {}).get(b, 0.0) for v in (d.get("bilateral") or {}).get("lender_cost", {}).values())
    lv["notes"] = (
        "Round 12 totals 2022-2026 (EUR bn, face -> Ukraine's gain low/central/high; lender's cost): all bilateral+EU "
        f"96.5 -> {tot['low']:.0f}/{tot['central']:.0f}/{tot['high']:.0f}; lender's cost "
        f"{cost['low']:.0f}/{cost['central']:.0f}/{cost['high']:.0f}. EU institutions 72.7 -> "
        f"{eu['total_value']['low']:.1f}/{eu['total_value']['central']:.1f}/{eu['total_value']['high']:.1f}. New "
        "multilateral: "
        + ", ".join(
            f"{k} {v['total']['low']}/{v['total']['central']}/{v['total']['high']}"
            for k, v in lv["multilateral"].items()
        )
        + ". Round 5 (10% for every loan): 40/64/77. See loans_value-notes.md and docs/method/loans.md."
    )
    have = {s["url"] for s in lv["sources"]}
    lv["sources"] += [s for s in ROUND12_SOURCES if s["url"] not in have]
    lv["generated"] = "2026-10-19"
    OUT.write_text(json.dumps(lv, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({k: v for k, v in rates.items()}, indent=1))
    print("IMF proxy", proxy["IMF"])


if __name__ == "__main__":
    main()
