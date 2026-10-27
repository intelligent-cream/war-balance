"""Round 59: split each donor's support for Ukraine, as the site counts it, into military, financial, humanitarian,
refugee hosting, the share of EU-level aid, other parts and money flowing back; with a reconciliation to the site's own
total per country (uaEur in pipeline/site_numbers.mjs) and Kiel's military allocation beside it.

Research only: reads site/data.json (built by pipeline/build_data.py), the site's own model output
(node pipeline/site_numbers.mjs), research/2026-10/kiel.json, gaps/loans_value.json and an extract of the Kiel
workbook's "Country Summary (EUR)" sheet; writes research/2026-10/gaps/mil_split_r59.json. Nothing in the pipeline
reads it yet.

Run (from the repository root, isolated mode; the workbook is a download and is read as data only):
  python -I research/2026-10/scripts/mil_split_r59.py extract <path to Ukraine_Support_Tracker__Release_31.xlsx>
  python -I research/2026-10/scripts/mil_split_r59.py build
"""

import csv
import hashlib
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
R = ROOT / "research" / "2026-10"
RAW = R / "raw" / "mil_split_r59"
EXTRACT = RAW / "kiel_r31_country_summary_eur.csv"
OUT = R / "gaps" / "mil_split_r59.json"
KIEL_URL = (
    "https://www.kielinstitut.de/fileadmin/Dateiverwaltung/IfW-Publications/fis-import/"
    "bc5059ba-ef38-4f08-988a-746a03905a6c-Ukraine_Support_Tracker__Release_31.xlsx"
)
RETRIEVED = "2026-10-27"
YEAR = 2026  # cumulative 24 Jan 2022 to 31 Aug 2026, the site's default view
# as in pipeline/build_data.py: ERA loans (repaid from immobilised Russian assets) are left out of the category Kiel
# codes them in: financial, except the UK's, which Kiel codes as military
ERA_CATEGORY = {"GBR": "military"}
CATS = ("military", "financial", "humanitarian")
# flowback parts of the site model (index.html calc(): uaBack), with plain names
BACK = {
    "own": "own_aid_spent_at_home",
    "purl": "others_aid_spent_here",
    "sell": "extra_sales_to_ukraine",
    "arms": "arms_ukraine_bought_here",
    "othsp": "aid_spent_here_energy_relief_rebuilding",
    "svcukr": "extra_services_sold_to_ukraine",
    "refsp": "refugee_hosting_spent_at_home",
}
KEEP_COLS = {
    "Country": "country",
    "EU member": "eu_member",
    "Financial allocations": "financial_alloc_eur_bn",
    "Humanitarian allocations": "humanitarian_alloc_eur_bn",
    "Military allocations": "military_alloc_eur_bn",
    "Total bilateral allocations": "total_alloc_eur_bn",
    "Military commitments": "military_commit_eur_bn",
    "Specific weapons and equipment": "weapons_equipment_commit_eur_bn",
    "Financial commitments with military purpose": "fin_military_purpose_commit_eur_bn",
    "Share in EU allocations": "share_in_eu_alloc_eur_bn",
}


def extract(xlsx: Path) -> None:
    import openpyxl  # only needed for the extract step

    wb = openpyxl.load_workbook(xlsx, read_only=True, data_only=True)
    ws = wb["Country Summary (€)"]
    rows = list(ws.iter_rows(values_only=True))
    head = next(i for i, r in enumerate(rows) if r and "Country" in r)
    idx = {}
    for j, name in enumerate(rows[head]):
        if name in KEEP_COLS and KEEP_COLS[name] not in idx.values():
            idx[j] = KEEP_COLS[name]
    out = []
    for r in rows[head + 2 :]:
        name = r[1]
        if not isinstance(name, str) or not name.strip():
            continue
        rec = {}
        for j, k in idx.items():
            v = r[j]
            rec[k] = round(v, 6) if isinstance(v, (int, float)) and not isinstance(v, bool) else v
        out.append(rec)
    RAW.mkdir(parents=True, exist_ok=True)
    sha = hashlib.sha256(xlsx.read_bytes()).hexdigest()
    with EXTRACT.open("w", newline="") as f:
        f.write("# source: Kiel Institute, Ukraine Support Tracker Release 31, sheet 'Country Summary (€)'\n")
        f.write(f"# url: {KIEL_URL}\n# retrieved: {RETRIEVED}\n# workbook sha256: {sha}\n")
        f.write(
            "# EUR billion, bilateral, 24 Jan 2022 to 31 Aug 2026; workbook not kept (13 MB), fetch it again from the url\n"
        )
        w = csv.DictWriter(f, fieldnames=list(idx.values()))
        w.writeheader()
        w.writerows(out)
    print(f"{len(out)} rows -> {EXTRACT.relative_to(ROOT)}")


def read_extract() -> dict[str, dict]:
    if not EXTRACT.exists():
        return {}
    lines = [ln for ln in EXTRACT.read_text().splitlines() if not ln.startswith("#")]
    return {r["country"]: r for r in csv.DictReader(lines)}


def s(arr: list | None, i0: int = 1, i1: int = 6) -> float:
    return sum((arr or [])[i0:i1]) if arr else 0.0


def loan_adj_by_cat(items: list[dict], band: str) -> dict[str, float]:
    """Gift value minus face value per Kiel category, summed over loan and guarantee items 2022-2026 (ge is the gift
    per unit of face value, gaps/loans_value.json)."""
    r = {"military": 0.0, "financial": 0.0}
    for it in items:
        if 2022 <= it.get("year", 0) <= YEAR:
            k = "military" if (it.get("cat") or "").lower() == "military" else "financial"
            r[k] += it["face"] * ((it.get("ge") or {}).get(band, 1.0) - 1.0)
    return r


def r3(v: float) -> float:
    return round(v + 0.0, 3)


def build() -> None:
    data = json.loads((ROOT / "site" / "data.json").read_text())
    countries = data["countries"]
    sn = json.loads(
        subprocess.run(
            ["node", str(ROOT / "pipeline" / "site_numbers.mjs"), str(YEAR)],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        ).stdout
    )["countries"]
    kiel = json.loads((R / "kiel.json").read_text())["donors"]
    lv = json.loads((R / "gaps" / "loans_value.json").read_text())
    ext = read_extract()

    # EU-level loans: share of the 2026 gift adjustment that is on military items (the Ukraine Support Loan's military
    # window and military guarantees); every EU-level military item is dated 2026 by Kiel
    eu_items = lv["eu_institutions"]["items"]
    eu26 = [it for it in eu_items if it.get("year") == 2026]
    adj26 = loan_adj_by_cat(eu26, "central")
    eu_mil_frac26 = adj26["military"] / ((adj26["military"] + adj26["financial"]) or 1)

    # cross-check: kiel.json against the workbook extract (military, financial, humanitarian allocations)
    xcheck = []
    for iso, d in kiel.items():
        e = ext.get(d.get("kiel_name") or "")
        if not e:
            continue
        for k in CATS:
            a, b = d.get(f"{k}_allocated") or 0.0, float(e.get(f"{k}_alloc_eur_bn") or 0)
            if abs(a - b) > 0.001:
                xcheck.append({"iso3": iso, "category": k, "kiel_json": a, "workbook": b})

    out: dict[str, dict] = {}
    for iso, c in countries.items():
        a = c.get("aid") or {}
        o = sn.get(iso)
        if not o:
            continue
        part = {k[5:]: v for k, v in o.items() if k.startswith("part_") and not k.endswith(("Lo", "Hi"))}
        lo = {k[5:-2]: v for k, v in o.items() if k.startswith("part_") and k.endswith("Lo")}
        hi = {k[5:-2]: v for k, v in o.items() if k.startswith("part_") and k.endswith("Hi")}
        total = o.get("uaEur") or 0.0
        if not any(abs(part.get(k, 0)) > 1e-6 for k in ("aid", "euaid", "ref", "undisc", "priv", "multilat", "buy")):
            continue
        cats = a.get("cats") or {}
        kd = kiel.get(iso) if iso != "EU_INST" else None
        era = (kd or {}).get("era_allocated") or 0.0
        if kd and kd.get("total_allocated"):
            bil = {
                k: max(
                    0.0, (kd.get(f"{k}_allocated") or 0.0) - (era if k == ERA_CATEGORY.get(iso, "financial") else 0.0)
                )
                for k in CATS
            }
            basis = "kiel"
        else:
            bil = {k: cats.get(k) or 0.0 for k in CATS}
            basis = "aid_gaps" if any(bil.values()) else "none"
        eu_cats = (
            {k: max(0.0, (cats.get(k) or 0.0) - bil[k]) for k in CATS}
            if a.get("eu_share")
            else dict.fromkeys(CATS, 0.0)
        )

        # the site's yearly amounts (2022 to Aug 2026) are the base; categories give the mix
        raw_all, raw_eu = s(a.get("years")), s(a.get("eu_years"))
        raw_bil = raw_all - raw_eu

        def scaled(cat: dict[str, float], target: float) -> tuple[dict[str, float], float]:
            t = sum(cat.values())
            if t <= 0:
                return (
                    ({"military": 0.0, "financial": 0.0, "humanitarian": target}, target)
                    if target
                    else (dict.fromkeys(CATS, 0.0), 0.0)
                )
            return {k: v * target / t for k, v in cat.items()}, target - t

        bil_s, bil_res = scaled(bil, raw_bil)
        eu_s, eu_res = scaled(eu_cats, raw_eu)

        wmv = a.get("weapons_mv") or {}
        und = a.get("undeliv") or {}
        und_eu = a.get("undeliv_eu") or {}
        items = ((lv["countries"].get(iso) or {}).get("bilateral") or {}).get("items") or []
        loan_own_c = s((a.get("loan_adj_own") or {}).get("c"))
        lm = {b: loan_adj_by_cat(items, b)["military"] for b in ("low", "central", "high")}
        loan_eu = a.get("loan_adj_eu") or {}
        loan_eu_c = s(loan_eu.get("c"))
        loan_eu_mil = ((loan_eu.get("c") or [0] * 6)[5]) * eu_mil_frac26

        mil_parts = {
            "kiel_allocated_less_era": r3(bil_s["military"]),
            "weapons_at_market_value": r3(s(wmv.get("c"))),
            "not_yet_delivered": r3(s(und.get("c"))),
            "loans_guarantees_at_gift_value": r3(lm["central"]),
            "undisclosed_estimate": r3(part.get("undisc", 0.0)),
        }
        military = sum(mil_parts.values())
        mil_lo = bil_s["military"] + s(wmv.get("l")) + s(und.get("l")) + lm["low"] + lo.get("undisc", 0.0)
        mil_hi = bil_s["military"] + s(wmv.get("h")) + s(und.get("h")) + lm["high"] + hi.get("undisc", 0.0)
        fin_parts = {
            "kiel_allocated_less_era": r3(bil_s["financial"]),
            "loans_at_gift_value": r3(loan_own_c - lm["central"]),
            "imf_world_bank_ebrd_share": r3(part.get("multilat", 0.0)),
        }
        financial = sum(fin_parts.values())
        humanitarian = bil_s["humanitarian"]
        eu_split = {
            "military": r3(eu_s["military"] + loan_eu_mil + s(und_eu.get("c"))),
            "financial": r3(eu_s["financial"] + loan_eu_c - loan_eu_mil),
            "humanitarian": r3(eu_s["humanitarian"]),
        }
        back = {v: r3(part.get(k, 0.0)) for k, v in BACK.items()}
        flowback = sum(part.get(k, 0.0) for k in BACK)
        other = {
            "private_donations": r3(part.get("priv", 0.0)),
            "extra_purchases_from_ukraine": r3(part.get("buy", 0.0)),
        }
        parts_sum = (
            military
            + financial
            + humanitarian
            + part.get("ref", 0.0)
            + part.get("euaid", 0.0)
            + sum(other.values())
            + flowback
        )
        # the bilateral split must rebuild the site's own aid part, and the EU split its EU part
        aid_check = (
            bil_s["military"] + bil_s["financial"] + humanitarian + s(wmv.get("c")) + s(und.get("c")) + loan_own_c
        )
        eu_check = sum(eu_split.values())

        kmil = (kd or {}).get("military_allocated") or 0.0 if basis == "kiel" else None
        kiel_eu_mil = (a.get("eu_share") or 0.0) * (kiel.get("EU_INST", {}).get("military_allocated") or 0.0)
        gdp = c.get("gdp") or 0.0
        adj = (
            abs(mil_parts["weapons_at_market_value"])
            + abs(mil_parts["not_yet_delivered"])
            + abs(mil_parts["loans_guarantees_at_gift_value"])
        )
        if basis == "kiel":
            q = "A" if adj < 0.05 * (abs(military) or 1) else "B" if adj < 0.25 * (abs(military) or 1) else "C"
            if part.get("undisc", 0.0) > 0.25 * (military or 1):
                q = "C"
        elif basis == "aid_gaps":
            q = a.get("cert") or "D"  # the record's own letter in gaps/aid_gaps.json (government reports, UN FTS)
        else:
            q = "D"
        out[iso] = {
            "name": c.get("name"),
            "military": r3(military),
            "military_range": [r3(mil_lo), r3(mil_hi)],
            "military_parts": mil_parts,
            "financial": r3(financial),
            "financial_parts": fin_parts,
            "humanitarian": r3(humanitarian),
            "refugees": r3(part.get("ref", 0.0)),
            "eu_share": r3(part.get("euaid", 0.0)),
            "eu_share_split": eu_split,
            "other": other,
            "flowback": r3(flowback),
            "flowback_parts": back,
            "total_site": r3(total),
            "reconciliation": {
                "sum_of_parts": r3(parts_sum),
                "difference": round(parts_sum - total, 4),
                "aid_part_site": r3(part.get("aid", 0.0)),
                "aid_part_rebuilt": r3(aid_check),
                "eu_part_site": r3(part.get("euaid", 0.0)),
                "eu_part_rebuilt": r3(eu_check),
                "years_vs_categories_residual_bilateral": round(bil_res, 4),
                "years_vs_categories_residual_eu": round(eu_res, 4),
            },
            "military_incl_eu_share": r3(military + eu_split["military"]),
            "military_pct_gdp": round(100 * military / gdp, 4) if gdp else None,
            "military_incl_eu_pct_gdp": round(100 * (military + eu_split["military"]) / gdp, 4) if gdp else None,
            "military_share_of_total": round(military / total, 4) if total > 0 else None,
            "kiel_military": None if kmil is None else r3(kmil),
            "kiel_military_eu_share": r3(kiel_eu_mil) if a.get("eu_share") else None,
            "gdp_eur_bn": gdp,
            "basis": basis,
            "sources": sorted(
                set(
                    (["kiel"] if basis == "kiel" else ["aid_gaps"] if basis == "aid_gaps" else [])
                    + (["weapons_value"] if wmv else [])
                    + (["military_delivered"] if und or und_eu else [])
                    + (["loans_value"] if a.get("loan_adj_own") or a.get("loan_adj_eu") or part.get("multilat") else [])
                    + (["undisclosed"] if part.get("undisc") else [])
                    + (["kiel_eu_share"] if a.get("eu_share") else [])
                    + (a.get("refugee_src") or [])
                    + ((c.get("flowback") or {}).get("src") or [])
                )
            ),
            "quality": q,
        }

    def tot(k: str) -> float:
        return r3(sum(v[k] for v in out.values()))

    totals = {
        k: tot(k)
        for k in (
            "military",
            "financial",
            "humanitarian",
            "refugees",
            "eu_share",
            "flowback",
            "total_site",
            "military_incl_eu_share",
        )
    }
    totals["other"] = r3(sum(sum(v["other"].values()) for v in out.values()))
    totals["kiel_military"] = r3(sum(v["kiel_military"] or 0 for v in out.values()))
    totals["eu_share_split"] = {k: r3(sum(v["eu_share_split"][k] for v in out.values())) for k in CATS}
    totals["military_parts"] = {
        k: r3(sum(v["military_parts"][k] for v in out.values())) for k in next(iter(out.values()))["military_parts"]
    }
    worst = max(out.items(), key=lambda kv: abs(kv[1]["reconciliation"]["difference"]))
    cov = {
        "countries_with_support": len(out),
        "with_military_over_1m": sum(1 for v in out.values() if v["military"] > 0.001),
        "basis": {b: sum(1 for v in out.values() if v["basis"] == b) for b in ("kiel", "aid_gaps", "none")},
        "quality": {q: sum(1 for v in out.values() if v["quality"] == q) for q in "ABCD"},
        "max_abs_reconciliation_difference_eur_bn": [worst[0], worst[1]["reconciliation"]["difference"]],
    }
    doc = {
        "generated": RETRIEVED,
        "round": "59",
        "period": "24 Jan 2022 to 31 Aug 2026, cumulative, EUR bn (nominal), site's central values",
        "status": "research only; not read by the pipeline",
        "definitions": {
            "military": "bilateral military aid as the site counts it: Kiel allocations (ERA loan left out) at the site's yearly totals, donated weapons at market value, minus not yet delivered by Aug 2026, military guarantees at gift value, plus the undisclosed-aid estimate",
            "financial": "bilateral budget support, loans and guarantees at gift value to Ukraine (ERA loans repaid from Russian assets left out), plus the shareholding share of new IMF, World Bank and EBRD lending",
            "humanitarian": "bilateral humanitarian aid (Kiel; UN OCHA FTS and government reports outside Kiel)",
            "refugees": "refugee hosting net of reimbursements and the host's gain on refugees' work (site part 'ref')",
            "eu_share": "the member's share of EU-level aid (site part 'euaid'), split in eu_share_split",
            "other": "private donations and extra purchases from Ukraine, which the site's total also counts",
            "flowback": "money flowing back to the donor's economy, negative (site uaBack)",
            "total_site": "site's support for Ukraine (pipeline/site_numbers.mjs uaEur); military + financial + humanitarian + refugees + eu_share + other + flowback = total_site",
            "kiel_military": "Kiel Release 31 bilateral military allocations as published (incl. the UK's ERA loan, which Kiel codes as military); EU members' imputed share of EU-level military aid in kiel_military_eu_share",
            "military_pct_gdp": "cumulative 2022 to Aug 2026 military aid as % of one year's GDP (the site's gdp field), the site's convention",
            "quality": "A: Kiel with model adjustments under 5% of the military figure; B: under 25%; C: more, or undisclosed estimate over 25%; outside Kiel: the letter of the record in gaps/aid_gaps.json; D where no aid record exists (only refugees or other parts)",
        },
        "eu_military_loan_fraction_2026": round(eu_mil_frac26, 4),
        "kiel_extract_crosscheck_differences": xcheck,
        "coverage": cov,
        "totals": totals,
        "sources": {
            "kiel": KIEL_URL,
            "kiel_extract": str(EXTRACT.relative_to(ROOT)),
            "site_model": "pipeline/site_numbers.mjs on site/data.json (built " + str(data.get("generated")) + ")",
            "weapons_value": "research/2026-10/gaps/weapons_value.json",
            "military_delivered": "research/2026-10/gaps/military_delivered.json",
            "loans_value": "research/2026-10/gaps/loans_value.json",
            "aid_gaps": "research/2026-10/gaps/aid_gaps.json",
            "undisclosed": "research/2026-10/gaps/uncovered.json, audit2.json",
        },
        "countries": dict(sorted(out.items(), key=lambda kv: -kv[1]["military"])),
    }
    OUT.write_text(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    print(json.dumps({"coverage": cov, "totals": totals, "xcheck": xcheck[:5]}, indent=1))
    print("\nTop military (own bilateral), EUR bn | % GDP | incl. EU share | Kiel military | total_site")
    for iso, v in list(doc["countries"].items())[:25]:
        print(
            f"{iso} {v['military']:8.2f} {v['military_pct_gdp'] or 0:7.3f} {v['military_incl_eu_share']:8.2f} "
            f"{v['kiel_military'] if v['kiel_military'] is not None else '-':>8} {v['total_site']:8.2f} {v['quality']} "
            f"diff={v['reconciliation']['difference']} aid={v['reconciliation']['aid_part_site']}/{v['reconciliation']['aid_part_rebuilt']} "
            f"eu={v['reconciliation']['eu_part_site']}/{v['reconciliation']['eu_part_rebuilt']}"
        )


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "extract":
        extract(Path(sys.argv[2]))
    elif len(sys.argv) >= 2 and sys.argv[1] == "build":
        build()
    else:
        sys.exit(__doc__)
