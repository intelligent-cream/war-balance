"""Round 16 (review 5, M1; approved by the owner): where Hong Kong's Russian gold goes. Russian gold is fungible inside
Hong Kong's gold trade, so its onward shares are Hong Kong's own: of all gold Hong Kong imported in a year (HS 7108),
the share it exported to mainland China (already charged to China through refine.json hk_onward), the share it exported
to every other destination (charged here to those destinations by their share of Hong Kong's non-China gold exports),
and the rest, which stayed in Hong Kong. Switzerland bars Russian-origin gold and its refiners screen for it, so its
central share is halved, as in the UAE rule (refine.json are_gold_destinations); the freed share goes pro rata to the
others. The same holds for every destination that bans Russian-origin gold (the EU from July 2022 and the UK, US, Japan
and Canada from June-August 2022, all with LBMA refinery screening), so each of these has its central share halved.

Input: UN Comtrade public preview, Hong Kong (reporter 344), HS 7108, flows M and X, all partners, 2022-2025
(raw/comtrade_hkg/HKG_7108_XMRX_<year>.json, fetched 2026-10-20). 2026 carries 2025 forward.

Run from the repository root: python3 research/2026-10/scripts/hk_gold_r16.py
Writes research/2026-10/gaps/hk_gold_r16.json.
"""

import json
from pathlib import Path

import pycountry

R = Path(__file__).resolve().parent.parent
# Comtrade's own codes where they differ from ISO 3166 numeric
M49 = {699: "IND", 757: "CHE", 842: "USA", 490: "TWN", 251: "FRA", 579: "NOR", 711: "ZAF", 381: "ITA", 58: "BEL"}
CHINA, WORLD = 156, 0
BANNED_CENTRAL = 0.5
# destinations that ban imports of Russian-origin gold
EU27 = set(
    "AUT BEL BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN IRL ITA LVA LTU LUX MLT NLD POL PRT ROU SVK SVN ESP SWE".split()
)
BANNED = EU27 | {"CHE", "GBR", "USA", "JPN", "CAN", "AUS", "NZL", "NOR"}


def iso3(code: int) -> str | None:
    if code in M49:
        return M49[code]
    c = pycountry.countries.get(numeric=f"{code:03d}")
    return c.alpha_3 if c else None


out: dict = {"generated": "2026-10-20", "unit": "shares of Hong Kong's gold imports (HS 7108) in the year", "years": {}}
for y in (2022, 2023, 2024, 2025):
    rows = json.loads((R / "raw" / "comtrade_hkg" / f"HKG_7108_XMRX_{y}.json").read_text())["data"]
    m = {r["partnerCode"]: r["primaryValue"] for r in rows if r["flowCode"] == "M"}
    x = {r["partnerCode"]: r["primaryValue"] for r in rows if r["flowCode"] == "X"}
    imp, exp, to_cn = m[WORLD], x[WORLD], x.get(CHINA, 0.0)
    others = {iso3(p): v for p, v in x.items() if p not in (WORLD, CHINA) and iso3(p)}
    tot = sum(others.values()) or 1.0
    dest = {k: v / tot for k, v in others.items()}
    # destinations that ban Russian-origin gold: central share halved, the freed share pro rata to the others
    freed = sum(v * (1 - BANNED_CENTRAL) for k, v in dest.items() if k in BANNED)
    rest = sum(v for k, v in dest.items() if k not in BANNED) or 1.0
    dest = {k: (v * BANNED_CENTRAL if k in BANNED else v + freed * v / rest) for k, v in dest.items()}
    dest = {k: round(v, 4) for k, v in sorted(dest.items(), key=lambda kv: -kv[1]) if v >= 0.001}
    out["years"][str(y)] = {
        "imports_usd_bn": round(imp / 1e9, 2),
        "exports_usd_bn": round(exp / 1e9, 2),
        "exports_to_china_usd_bn": round(to_cn / 1e9, 2),
        "exported_elsewhere_share": round((exp - to_cn) / imp, 4),
        "retained_share_gross": round(1 - exp / imp, 4),
        "destination_shares": dest,
    }
out["years"]["2026"] = {**out["years"]["2025"], "note": "2025 carried forward"}
out["sources"] = [
    {
        "name": "UN Comtrade public preview: Hong Kong HS 7108 imports and exports by partner, 2022-2025",
        "url": "https://comtradeapi.un.org/public/v1/preview/C/A/HS?reporterCode=344&period=2025&flowCode=X,M,RX&cmdCode=7108",
        "date": "2026-10-20",
    }
]
(R / "gaps" / "hk_gold_r16.json").write_text(json.dumps(out, indent=1) + "\n")
print(
    json.dumps(
        {y: {k: v for k, v in d.items() if k != "destination_shares"} for y, d in out["years"].items()}, indent=0
    )
)
