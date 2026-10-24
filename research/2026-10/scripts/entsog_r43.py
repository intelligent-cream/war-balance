"""Round 43: physical gas flows on TurkStream's European leg and at Baumgarten (ENTSOG Transparency Platform), as a
second official measurement next to the origin-reported (Eurostat) and customs (Comtrade) figures that the site uses
for Russian gas by country of final use (gaps/energy2.json transit_gas).

Inputs: raw/entsog/entsog_physical_flow_monthly_*.json (pipeline/fetch/epdk_entsog.py), raw/epdk/tur_context_*.json
(Eurostat's GCV of Russian gas, for kWh -> m3), gaps/energy2.json (the site's figures).

Run from the repository root: python3 -I research/2026-10/scripts/entsog_r43.py
Writes research/2026-10/gaps/entsog_r43.json.
"""

import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent
RAW = R / "raw"
GAPS = R / "gaps"

src = max((RAW / "entsog").glob("entsog_physical_flow_monthly_*.json"))
ent = json.loads(src.read_text())
ctx = json.loads(max((RAW / "epdk").glob("tur_context_*.json")).read_text())
tg = json.loads((GAPS / "energy2.json").read_text())["transit_gas"]["countries"]

# kWh per m3 (15 C): Eurostat's TJ GCV / million m3 of Russian gas reported by Türkiye, 2021-2024 mean
es = {(r[2], r[3], int(r[5])): r[6] for r in ctx["eurostat"]["nrg_ti_gas"]["rows"]}
gcv = [es[("RU", "TJ_GCV", y)] / es[("RU", "MIO_M3", y)] for y in (2021, 2022, 2023, 2024)]
KWH_PER_M3 = round(sum(gcv) / len(gcv) / 3.6, 3)  # MJ/m3 -> kWh/m3

PERIODS = {"2022": ("2022-01", "2022-12"), "2023": ("2023-01", "2023-12"), "2024": ("2024-01", "2024-12"),
           "2025": ("2025-01", "2025-12"), "2026_jan_aug": ("2026-01", "2026-08")}  # fmt: skip


def twh(name: str, per: str) -> float:
    a, b = PERIODS[per]
    mk = ent["points"][name]["monthly_kwh"]
    return sum(v for m, v in mk.items() if a <= m <= b) / 1e9


def bcm(x_twh: float) -> float:
    return x_twh / KWH_PER_M3


points = {}
for name, e in ent["points"].items():
    if not e["key"]:
        points[name] = {
            "what": e["what"],
            "key": None,
            "note": "no data from the platform for " + ", ".join(e["tried"]),
        }
        continue
    points[name] = {
        "what": e["what"], "key": e["key"], "point": e.get("point"), "operator": e.get("operator"),
        "twh": {p: round(twh(name, p), 2) for p in PERIODS},
        "bcm": {p: round(bcm(twh(name, p)), 3) for p in PERIODS},
        "days_reported": {p: sum(v for m, v in e["days"].items() if PERIODS[p][0] <= m <= PERIODS[p][1]) for p in PERIODS},
        "flow_status": e["flow_status"],
    }  # fmt: skip


def site(iso: str, per: str):
    y = "2026" if per.startswith("2026") else per
    v = (tg.get(iso) or {}).get("gas_from_rus_bcm", {}).get(y)
    return v


def S(*names):
    return lambda p: sum(twh(n, p) for n in names)


derived = {}
# Bulgaria: full transmission balance (all cross-border points + Chiren storage + IGB at Stara Zagora)
bg_in = S("strandzha2_tr_bg", "strandzha1_tr_bg", "kulata_gr_bg", "negruvoda1_ro_bg", "negruvoda23_ro_bg", "ruse_ro_bg",
          "stara_zagora_igb_bg", "chiren_withdrawal")  # fmt: skip
bg_out = S("kireevo_bg_rs", "kalotina_bg_rs", "kulata_bg_gr", "kyustendil_bg_mk", "negruvoda1_bg_ro", "negruvoda23_bg_ro",
           "ruse_bg_ro", "strandzha1_bg_tr", "stara_zagora_bg_igb", "chiren_injection")  # fmt: skip
ts_onward = S(
    "kireevo_bg_rs", "kulata_bg_gr", "kyustendil_bg_mk", "negruvoda1_bg_ro", "negruvoda23_bg_ro", "ruse_bg_ro"
)
for p in PERIODS:
    derived.setdefault("BGR", {})[p] = {
        "turkstream_entry_strandzha2_bcm": round(bcm(twh("strandzha2_tr_bg", p)), 3),
        "botas_entry_strandzha1_bcm": round(bcm(twh("strandzha1_tr_bg", p)), 3),
        "igb_into_grid_bcm": round(bcm(twh("stara_zagora_igb_bg", p)), 3),
        "apparent_use_bcm": round(bcm(bg_in(p) - bg_out(p)), 3),
        "strandzha2_minus_onward_exits_bcm": round(bcm(twh("strandzha2_tr_bg", p) - ts_onward(p)), 3),
        "site_final_use_russian_bcm": site("BGR", p),
    }
# Serbia + Bosnia: TurkStream gas entering Serbia (Kireevo) minus what Serbia passes to Hungary (Horgoš), plus the old
# Hungary-Serbia point (Kiskundorozsma); Kalotina (the Bulgaria-Serbia interconnector, Azeri gas) kept apart
for p in PERIODS:
    srb_bih = twh("kireevo_bg_rs", p) - twh("horgos_rs_hu", p) + twh("horgos_hu_rs", p) + twh("kiskundorozsma_hu_rs", p)
    s_srb, s_bih = site("SRB", p), site("BIH", p)
    derived.setdefault("SRB_BIH", {})[p] = {
        "kireevo_entry_bcm": round(bcm(twh("kireevo_bg_rs", p)), 3),
        "onward_to_hungary_horgos_bcm": round(bcm(twh("horgos_rs_hu", p)), 3),
        "net_turkstream_intake_bcm": round(bcm(srb_bih), 3),
        "kalotina_azeri_route_bcm": round(bcm(twh("kalotina_bg_rs", p)), 3),
        "site_srb_bcm": s_srb, "site_bih_bcm": s_bih,
        "site_srb_plus_bih_central_bcm": round(s_srb["central"] + s_bih["central"], 3) if s_srb and s_bih else None,
        "ratio_entsog_to_site": round(bcm(srb_bih) / (s_srb["central"] + s_bih["central"]), 3) if s_srb and s_bih else None,
    }  # fmt: skip
# Hungary: Russian gas arriving from Serbia (Horgoš) and Ukraine (Bereg) minus what it passes to Slovakia; exports to
# Ukraine shown apart (legally non-Russian; physically from the same grid)
for p in PERIODS:
    ru_in = twh("horgos_rs_hu", p) + twh("bereg_ua_hu", p)
    s = site("HUN", p)
    derived.setdefault("HUN", {})[p] = {
        "horgos_entry_bcm": round(bcm(twh("horgos_rs_hu", p)), 3),
        "bereg_entry_bcm": round(bcm(twh("bereg_ua_hu", p)), 3),
        "to_slovakia_bcm": round(bcm(twh("balassagyarmat_hu_sk", p)), 3),
        "to_ukraine_bcm": round(bcm(twh("bereg_hu_ua", p)), 3),
        "russian_entry_minus_slovakia_bcm": round(bcm(ru_in - twh("balassagyarmat_hu_sk", p)), 3),
        "russian_entry_minus_slovakia_and_ukraine_bcm": round(bcm(ru_in - twh("balassagyarmat_hu_sk", p) - twh("bereg_hu_ua", p)), 3),
        "austria_entry_bcm": round(bcm(twh("mosonmagyarovar_at_hu", p)), 3),
        "slovakia_entry_bcm": round(bcm(twh("balassagyarmat_sk_hu", p)), 3),
        "incl_austria_slovakia_entries_while_baumgarten_russian_bcm": round(bcm(ru_in - twh("balassagyarmat_hu_sk", p) + twh("mosonmagyarovar_at_hu", p) + twh("balassagyarmat_sk_hu", p)), 3) if p in ("2022", "2023", "2024") else None,
        "site_final_use_russian_bcm": s,
        "ratio_entsog_to_site": round(bcm(ru_in - twh("balassagyarmat_hu_sk", p)) / s["central"], 3) if s else None,
    }  # fmt: skip
# Greece: net flow at Kulata/Sidirokastro (TurkStream gas through Bulgaria); LNG and TAP not included
for p in PERIODS:
    net = twh("kulata_bg_gr", p) - twh("kulata_gr_bg", p)
    s = site("GRC", p)
    derived.setdefault("GRC", {})[p] = {
        "sidirokastro_net_entry_bcm": round(bcm(net), 3),
        "site_final_use_russian_bcm": s,
        "ratio_entsog_to_site": round(bcm(net) / s["central"], 3) if s and s["central"] else None,
    }
# North Macedonia: its only pipeline entry (Kyustendil/Zidilovo)
for p in PERIODS:
    s = site("MKD", p)
    derived.setdefault("MKD", {})[p] = {
        "kyustendil_entry_bcm": round(bcm(twh("kyustendil_bg_mk", p)), 3),
        "site_final_use_russian_bcm": s,
        "ratio_entsog_to_site": round(bcm(twh("kyustendil_bg_mk", p)) / s["central"], 3)
        if s and s["central"]
        else None,
    }
# Austria: Baumgarten (Russian gas via Ukraine and Slovakia until 2024) minus all exits; the upper bound adds the other
# entries (Germany, Italy, Slovenia, Hungary). Storage connected only to the German grid (Haidach, 7Fields) is not seen
at_exits = S(
    "oberkappel_at_de",
    "ueberackern_at_de",
    "ueberackern2_at_de",
    "arnoldstein_at_it",
    "murfeld_at_si",
    "mosonmagyarovar_at_hu",
)
at_other_in = S(
    "oberkappel_de_at",
    "ueberackern_de_at",
    "ueberackern2_de_at",
    "arnoldstein_it_at",
    "murfeld_si_at",
    "mosonmagyarovar_hu_at",
)
for p in PERIODS:
    s = site("AUT", p)
    lo = bcm(twh("baumgarten_sk_at", p) - at_exits(p))
    hi = bcm(twh("baumgarten_sk_at", p) - at_exits(p) + at_other_in(p))
    derived.setdefault("AUT", {})[p] = {
        "baumgarten_entry_bcm": round(bcm(twh("baumgarten_sk_at", p)), 3),
        "exits_bcm": round(bcm(at_exits(p)), 3),
        "other_entries_bcm": round(bcm(at_other_in(p)), 3),
        "russian_kept_if_exits_russian_first_bcm": round(max(lo, 0), 3),
        "net_imports_all_points_bcm": round(hi, 3),
        "site_final_use_russian_bcm": s,
        "site_central_within_bounds": (max(lo, 0) * 0.97 <= s["central"] <= hi * 1.03) if s else None,
    }  # fmt: skip
# Romania / Moldova route (Trans-Balkan, reverse): Bulgaria to Romania at Negru Voda I
for p in PERIODS:
    derived.setdefault("TRANS_BALKAN", {})[p] = {"negru_voda_bg_ro_bcm": round(bcm(twh("negruvoda1_bg_ro", p)), 3)}


def verdict(x: float, rng: dict | None, tol: float = 0.10) -> str:
    if not rng:
        return "no site figure"
    c, lo, hi = rng["central"], rng["low"], rng["high"]
    if c and abs(x / c - 1) <= tol:
        return "confirms (within 10% of the central)"
    if lo <= x <= hi:
        return "inside the site's range, away from the central"
    return "below the site's range" if x < lo else "above the site's range"


findings = {}
for p in PERIODS:
    h = derived["HUN"][p]
    x = h["russian_entry_minus_slovakia_bcm"]
    if p in ("2022", "2023"):
        b2 = h["incl_austria_slovakia_entries_while_baumgarten_russian_bcm"]
        sc = h["site_final_use_russian_bcm"]["central"]
        findings.setdefault("HUN", {})[p] = {"entsog_bounds_bcm": [x, b2], "site_bcm": h["site_final_use_russian_bcm"],
                                             "verdict": ("inside" if x <= sc <= b2 else "outside") + " the ENTSOG bounds (low: Serbian and Ukrainian entries minus Slovakia; high: plus the entries from Austria and Slovakia, which carried Russian gas through Baumgarten but also hub gas)"}  # fmt: skip
        continue
    findings.setdefault("HUN", {})[p] = {
        "entsog_bcm": x,
        "site_bcm": h["site_final_use_russian_bcm"],
        "verdict": verdict(x, h["site_final_use_russian_bcm"]),
    }
    sb = derived["SRB_BIH"][p]
    rng = {k: sb["site_srb_bcm"][k] + sb["site_bih_bcm"][k] for k in ("low", "central", "high")}
    findings.setdefault("SRB_BIH", {})[p] = {
        "entsog_bcm": sb["net_turkstream_intake_bcm"],
        "site_bcm": rng,
        "verdict": verdict(sb["net_turkstream_intake_bcm"], rng),
    }
    g = derived["GRC"][p]
    v = verdict(g["sidirokastro_net_entry_bcm"], g["site_final_use_russian_bcm"])
    if p in ("2022", "2023") and g["sidirokastro_net_entry_bcm"] < g["site_final_use_russian_bcm"]["central"]:
        v = "pipeline part only: the rest of the site's (Eurostat, origin-reported) figure is Russian LNG at Revithoussa, which ENTSOG cannot attribute"
    findings.setdefault("GRC", {})[p] = {
        "entsog_bcm": g["sidirokastro_net_entry_bcm"],
        "site_bcm": g["site_final_use_russian_bcm"],
        "verdict": v,
    }
    m = derived["MKD"][p]
    findings.setdefault("MKD", {})[p] = {"entsog_bcm": m["kyustendil_entry_bcm"], "site_bcm": m["site_final_use_russian_bcm"],
                                         "verdict": verdict(m["kyustendil_entry_bcm"], m["site_final_use_russian_bcm"]) + "; all of North Macedonia's pipeline gas, origin not separable (TurkStream, BOTAŞ or IGB gas through Bulgaria)"}  # fmt: skip
    a = derived["AUT"][p]
    lo, hi, sc = (
        a["russian_kept_if_exits_russian_first_bcm"],
        a["net_imports_all_points_bcm"],
        a["site_final_use_russian_bcm"],
    )
    findings.setdefault("AUT", {})[p] = {"entsog_bounds_bcm": [lo, round(min(hi, a["baumgarten_entry_bcm"]), 3)], "site_bcm": sc,
                                         "verdict": "inside the physical bounds" if a["site_central_within_bounds"] else "site central above the physical upper bound (all Russian entry minus exits plus every other entry); only a net withdrawal from storage could close it"}  # fmt: skip
    b = derived["BGR"][p]
    findings.setdefault("BGR", {})[p] = {
        "entsog_strandzha2_residual_bcm": b["strandzha2_minus_onward_exits_bcm"], "botas_strandzha1_bcm": b["botas_entry_strandzha1_bcm"],
        "apparent_use_bcm": b["apparent_use_bcm"], "site_bcm": b["site_final_use_russian_bcm"],
        "verdict": "cannot separate Russian from other gas: TurkStream gas left in Bulgaria (Strandzha 2 minus onward exits) plus BOTAŞ deliveries at Strandzha 1 (BOTAŞ's portfolio was 41% Russian in 2024, EPDK) give a physical upper bound; the contractual origin (Gazprom contract ended 2022) gives 0",
        "upper_bound_bcm": round(max(b["strandzha2_minus_onward_exits_bcm"], 0) + b["botas_entry_strandzha1_bcm"], 3),
    }  # fmt: skip

ts = {p: round(bcm(twh("strandzha2_tr_bg", p)), 3) for p in PERIODS}
out = {
    "generated": "2026-10-24",
    "round": 43,
    "status": "cross-check (second official measurement); nothing here is read by the build",
    "units": {
        "twh": "TWh GCV, sum of daily physical flows (gas days 06:00-06:00 CET, by the gas day's start date)",
        "bcm": f"billion m3 at {KWH_PER_M3} kWh/m3 (Eurostat's GCV of Russian gas reported by Türkiye, 2021-2024 mean); ENTSOG's own convention (10.55 kWh/m3) gives volumes about {round((KWH_PER_M3 / 10.55 - 1) * 100, 1)}% higher",
        "periods": "calendar years; 2026_jan_aug = January-August, the site's 2026 period",
    },
    "kwh_per_m3": KWH_PER_M3,
    "coverage_note": "The platform keeps a rolling five years: daily data start on 2021-11-01, earlier dates answer 'archived'. No pre-war year can be built from the API. Points with no data: Zvornik (Serbia-Bosnia), the Austrian side of Baumgarten, the Serbian side of Kireevo and Horgoš (the counterpart side is used instead).",
    "turkstream_european_leg_bcm": ts,
    "points": points,
    "derived": derived,
    "findings": findings,
    "source": {
        "name": "ENTSOG Transparency Platform API, operationalData, indicator Physical Flow, periodType day",
        "url": "https://transparency.entsog.eu/api/v1/operationalData",
        "retrieved": ent["retrieved"],
        "raw_file": str(src.relative_to(R)),
    },
}
(GAPS / "entsog_r43.json").write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print("kWh/m3", KWH_PER_M3, "TurkStream EU leg bcm", ts)
for k, v in findings.items():
    print("==", k)
    for p, d in v.items():
        print(
            "  ", p, {kk: (vv["central"] if isinstance(vv, dict) and "central" in vv else vv) for kk, vv in d.items()}
        )
