"""Round 44: Hong Kong's January-August 2026 imports of Russian gold, measured. The owner downloaded C&SD Trade-IDDS
(Hong Kong imports of HS 7108 of Russian origin, monthly, HK$ '000) on 2026-10-25; this replaces the gold part of the
site's estimate for Hong Kong's 2026 imports from Russia (Comtrade January-July plus an August estimate from seasonal
ratios). Gold is about 93% of Hong Kong's imports from Russia; the non-gold remainder stays an estimate: UN Comtrade
TOTAL minus HS 7108 for January-July (C&SD's own records), and August's non-gold at the January-July monthly mean, with
the lowest and highest January-July month as its range.

Input: raw/hk_tradeidds_r44/imports_origin_RUS_7108_monthly_2018-2026.csv (C&SD), raw/uae_hkg_r43/
comtrade_hkg_7108_monthly.csv (Comtrade monthly HS 7108 and TOTAL, 2026), raw/comtrade_hkg/HKG_7108_XMRX_<year>.json
(Comtrade annual HS 7108, 2022-2025), raw/ecb/EXR_2026-10-23.json (ECB monthly USD per EUR). HK$ to USD at the peg, 7.8.

Run from the repository root: python3 research/2026-10/scripts/hk_csd_r44.py
Writes research/2026-10/gaps/hk_csd_r44.json.
"""

import csv
import json
from pathlib import Path

R = Path(__file__).resolve().parent.parent
HKD_PER_USD = 7.8
MONTHS = {
    m: i + 1 for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])
}


def main() -> None:
    # C&SD: Russian-origin HS 7108 imports by month (all 6-digit lines; "-" is a nil record)
    hkd: dict[tuple[int, int], float] = {}
    with open(R / "raw/hk_tradeidds_r44/imports_origin_RUS_7108_monthly_2018-2026.csv", encoding="utf-8-sig") as fh:
        for row in csv.reader(fh):
            if len(row) < 8 or not row[0].isdigit() or row[6] in ("-", ""):
                continue
            k = (int(row[0]), MONTHS[row[1]])
            hkd[k] = hkd.get(k, 0.0) + float(row[6].replace(",", ""))
    usd_m = {k: v / HKD_PER_USD / 1e3 for k, v in hkd.items()}
    fx = json.loads((R / "raw/ecb/EXR_2026-10-23.json").read_text())["monthly"]["USD"]

    def eur(y: int, m: int, v: float) -> float:  # USD m -> EUR bn at the month's rate
        return v / fx[f"{y}-{m:02d}"] / 1e3

    annual_csd = {y: round(sum(v for (yy, _), v in usd_m.items() if yy == y), 1) for y in range(2018, 2027)}
    annual_ct = {}
    for y in (2022, 2023, 2024, 2025):
        d = json.loads((R / f"raw/comtrade_hkg/HKG_7108_XMRX_{y}.json").read_text())["data"]
        annual_ct[y] = round(
            sum(r["primaryValue"] for r in d if r["partnerCode"] == 643 and r["flowCode"] == "M") / 1e6, 1
        )

    ct_m = {}
    with open(R / "raw/uae_hkg_r43/comtrade_hkg_7108_monthly.csv") as fh:
        for r in csv.DictReader(fh):
            ct_m[int(r["period"][4:])] = (float(r["hs7108_usd_m"]), float(r["total_usd_m"]))

    gold_m = {m: usd_m.get((2026, m), 0.0) for m in range(1, 9)}
    gold_eur = sum(eur(2026, m, v) for m, v in gold_m.items())
    nongold_m = {m: t - g for m, (g, t) in ct_m.items() if m <= 7}
    ng_eur = sum(eur(2026, m, v) for m, v in nongold_m.items())
    aug = {
        "low": eur(2026, 8, min(nongold_m.values())),
        "central": eur(2026, 8, sum(nongold_m.values()) / len(nongold_m)),
        "high": eur(2026, 8, max(nongold_m.values())),
    }
    total = {b: round(gold_eur + ng_eur + aug[b], 6) for b in ("low", "central", "high")}
    out = {
        "generated": "2026-10-25",
        "round": 44,
        "units": "EUR bn unless stated; USD m from HK$ at the 7.8 peg; EUR at ECB monthly USD per EUR",
        "source": {
            "id": "hk_csd_r44",
            "name": "C&SD Trade-IDDS, Hong Kong imports of HS 7108 by origin, downloaded by the owner 2026-10-25",
            "url": "https://tradeidds.censtatd.gov.hk/",
            "file": "research/2026-10/raw/hk_tradeidds_r44/imports_origin_RUS_7108_monthly_2018-2026.csv",
            "basis": "country of origin (Russian-origin gold, whatever country it was consigned from)",
        },
        "gold_usd_m_monthly_2026": {str(m): round(v, 1) for m, v in gold_m.items()},
        "gold_usd_m_annual_csd_origin": {str(y): v for y, v in annual_csd.items()},
        "gold_usd_m_annual_comtrade": {str(y): v for y, v in annual_ct.items()},
        "gold_usd_m_jan_jul_2026": {
            "csd_origin": round(sum(gold_m[m] for m in range(1, 8)), 1),
            "comtrade": round(sum(ct_m[m][0] for m in range(1, 8)), 1),
        },
        "gold_jan_aug_2026_eur_bn": round(gold_eur, 6),
        "nongold_jan_jul_2026_eur_bn": round(ng_eur, 6),
        "nongold_aug_2026_eur_bn": {b: round(v, 6) for b, v in aug.items()},
        "gold_share_jan_jul_2026": round(sum(g for g, _ in ct_m.values()) / sum(t for _, t in ct_m.values()), 4),
        "imports_from_RUS_2026": {
            **total,
            "basis": "reported",
            "period": "2026-01..2026-08",
            "src": "C&SD Trade-IDDS HS 7108 of Russian origin, January-August 2026 (measured), plus non-gold: UN Comtrade "
            "TOTAL minus HS 7108 January-July (C&SD records) and August at the January-July monthly mean (range: lowest "
            "and highest month)",
        },
        "replaces": "trade_full.json HKG imports_from_RUS 2026 as overlaid by refresh_2026.json (Comtrade TOTAL January-July "
        "plus an August estimate from seasonal ratios): 19.002 (17.448-20.611)",
    }
    (R / "gaps/hk_csd_r44.json").write_text(json.dumps(out, indent=1) + "\n")
    print(
        json.dumps(
            {
                k: out[k]
                for k in (
                    "gold_usd_m_annual_csd_origin",
                    "gold_usd_m_annual_comtrade",
                    "gold_usd_m_jan_jul_2026",
                    "gold_jan_aug_2026_eur_bn",
                    "nongold_jan_jul_2026_eur_bn",
                    "nongold_aug_2026_eur_bn",
                    "gold_share_jan_jul_2026",
                    "imports_from_RUS_2026",
                )
            },
            indent=1,
        )
    )


if __name__ == "__main__":
    main()
