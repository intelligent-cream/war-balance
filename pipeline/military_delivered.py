# /// script
# dependencies = ["openpyxl>=3.1", "pycountry>=24.6"]
# ///
"""Round 24b (audit 24, D M4; approved by the owner 22 October 2026): military aid counted as delivered, not as
allocated. Writes research/2026-10/gaps/military_delivered.json from the Kiel Ukraine Support Tracker workbook in
research/2026-10/raw/kiel/. Run it after the workbook changes, then rebuild: `uv run military_delivered.py && uv run
build_data.py`.

Each Kiel military allocation row is delivered evenly over a lead time L from its start date (the announcement date, or
1 January of its first earmarked year if later). L by channel, in years (low, central, high):
  stock (donor stocks, or no source given: mostly 2022-23 stock deliveries)   0.1, 0.25, 0.5
  purl (NATO's PURL channel)                                                  0.25, 0.5, 1
  ua (procurement in Ukraine, the "Danish model")                             0.5, 1, 2
  usai (US Ukraine Security Assistance Initiative)                            3.75, 4.5, 5.5
  proc (other procurement)                                                    2, 3, 4.5
The USAI time is calibrated to the Department of Defense: 57% of USAI delivered by March 2026 (Lead IG quarterly report,
Q1 2026, as reported by Militarnyi); the model gives 57.6%. Delivered by date T = sum of value x clip((T - start) / L).

For each donor and each year-end (31 Aug for 2026) the file gives the allocation to date and the undelivered amount,
low / central / high (central = the central lead time; low undelivered = the fast times, high = the slow ones), and
the procurement share delivered (for the money spent in the donor's own economy)."""

import datetime as dt
import json
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "2026-10" / "raw" / "kiel"
OUT = ROOT / "research" / "2026-10" / "gaps" / "military_delivered.json"
LEAD = {
    "stock": (0.1, 0.25, 0.5),
    "purl": (0.25, 0.5, 1.0),
    "ua": (0.5, 1.0, 2.0),
    "usai": (3.75, 4.5, 5.5),
    "proc": (2.0, 3.0, 4.5),
}
ASOF = {"2022": dt.date(2022, 12, 31), "2023": dt.date(2023, 12, 31), "2024": dt.date(2024, 12, 31),
        "2025": dt.date(2025, 12, 31), "2026": dt.date(2026, 8, 31)}  # fmt: skip
# Kiel donor names that pycountry does not resolve
NAMES = {"United States": "USA", "United Kingdom": "GBR", "South Korea": "KOR", "Turkiye": "TUR", "Czechia": "CZE",
         "EU (Commission and Council)": "EU_INST", "Netherlands": "NLD", "New Zealand": "NZL"}  # fmt: skip


def iso(name: str) -> str | None:
    if name in NAMES:
        return NAMES[name]
    try:
        import pycountry

        return pycountry.countries.lookup(name).alpha_3
    except LookupError:
        return None


def kind(r: dict) -> str:
    src = r.get("source_of_weapon") or "unknown"
    ch, e = str(r.get("channel") or ""), str(r.get("explanation") or "")
    if "PURL" in ch or "PURL" in e:
        return "purl"
    if r["donor"] == "United States" and ("USAI" in e or "Security Assistance Initiative" in e):
        return "usai"
    if not str(src).startswith("proc"):
        return "stock"
    loc = str(r.get("procurement_location") or "")
    if loc.startswith("Ukraine") or loc == "EEA; EFTA; Ukraine":
        return "ua"
    return "usai" if r["donor"] == "United States" else "proc"


def frac(start: dt.date, years: float, asof: dt.date) -> float:
    t = (asof - start).days / 365.25
    return max(0.0, min(1.0, t / years))


def main() -> None:
    xlsx = next(RAW.glob("*Ukraine_Support_Tracker*Release_31*.xlsx"))
    ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)["Bilateral Assistance, MAIN DATA"]
    rows = ws.iter_rows(values_only=True)
    hdr = next(rows)
    out: dict = {}
    usai = [0.0, 0.0]
    for raw in rows:
        if not raw[0]:
            continue
        r = dict(zip(hdr, raw))
        if r.get("aid_type_general") != "Military" or r.get("measure") != "Allocation" or r.get("before_war") == 1:
            continue
        # round 38 (Kiel reconciliation): the UK's G7 ERA loan tranches (channel "ERA Loans Mechanism") are left out of
        # the aid altogether (build_data.py ERA_YEARS: Russia's frozen assets repay them), so they are not "undelivered"
        if "ERA" in str(r.get("channel") or ""):
            continue
        v = r.get("tot_sub_activity_value_EUR_redistr")
        if not isinstance(v, (int, float)):
            continue
        v /= 1e9
        a = r.get("announcement_date")
        a = a.date() if hasattr(a, "date") else dt.date(2022, 6, 1)
        ey = str(r.get("earmarked_year") or "")
        try:
            first = min(int(float(x)) for x in ey.replace("-", " ").split())
        except ValueError:
            first = a.year
        start = max(a, dt.date(first, 1, 1))
        k, code = kind(r), iso(r["donor"])
        if not code:
            continue
        d = out.setdefault(code, {"kiel_name": r["donor"], "by_channel": {}, "asof": {}})
        d["by_channel"][k] = d["by_channel"].get(k, 0.0) + v
        for y, t in ASOF.items():
            e = d["asof"].setdefault(y, {"allocated": 0.0, "undelivered": {"low": 0.0, "central": 0.0, "high": 0.0},
                                         "proc_allocated": 0.0, "proc_delivered": 0.0})  # fmt: skip
            if start > t:
                continue
            e["allocated"] += v
            for b, j in (("low", 0), ("central", 1), ("high", 2)):
                e["undelivered"][b] += v * (1 - frac(start, LEAD[k][j], t))
            if k in ("proc", "usai", "ua"):
                e["proc_allocated"] += v
                e["proc_delivered"] += v * frac(start, LEAD[k][1], t)
        if k == "usai":
            usai[0] += v
            usai[1] += v * frac(start, LEAD["usai"][1], dt.date(2026, 3, 31))
    for d in out.values():
        d["by_channel"] = {k: round(v, 4) for k, v in d["by_channel"].items()}
        for e in d["asof"].values():
            e["allocated"] = round(e["allocated"], 4)
            e["undelivered"] = {b: round(v, 4) for b, v in e["undelivered"].items()}
            e["proc_delivered_share"] = (
                round(e["proc_delivered"] / e["proc_allocated"], 4) if e["proc_allocated"] else 1.0
            )
            e["proc_allocated"], e["proc_delivered"] = round(e["proc_allocated"], 4), round(e["proc_delivered"], 4)
    doc = {
        "generated": dt.date.today().isoformat(),
        "round": "24b (audit 24, D M4; approved by the owner 22 October 2026)",
        "source": "Kiel Institute, Ukraine Support Tracker Release 31 (8 October 2026), sheet 'Bilateral Assistance, MAIN DATA': military allocation rows (measure, aid_type_general, tot_sub_activity_value_EUR_redistr, source_of_weapon, procurement_location, channel, earmarked_year, announcement_date)",
        "url": "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx",
        "lead_times_years": {k: {"low": a, "central": b, "high": c} for k, (a, b, c) in LEAD.items()},
        "usai_calibration": {
            "model_delivered_by_2026_03_31": round(usai[1] / usai[0], 4) if usai[0] else None,
            "dod": 0.57,
            "source": "Lead IG quarterly report 'Operation Atlantic Resolve', Q1 2026 (18 May 2026), as reported by Militarnyi: USD 19.21bn of USD 33.51bn USAI transferred by March 2026; Legis1 (CRS IF12040): 57.3% by August 2026",
        },  # fmt: skip
        "bands": "undelivered low = the fast lead times, central = the central ones, high = the slow ones; the build counts aid at delivered (central), with Kiel's full allocation as the high end of support and the slow lead times as the low end",
        "donors": dict(sorted(out.items())),
    }
    OUT.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print(
        f"wrote {OUT}: {len(out)} donors; USAI delivered by 31 Mar 2026: {doc['usai_calibration']['model_delivered_by_2026_03_31']}"
    )
    for code, d in sorted(out.items(), key=lambda x: -x[1]["asof"]["2026"]["allocated"])[:12]:
        e = d["asof"]["2026"]
        print(code, e["allocated"], e["undelivered"], e["proc_delivered_share"])


if __name__ == "__main__":
    main()
