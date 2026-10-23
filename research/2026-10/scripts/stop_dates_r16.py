"""Round 16 (review 5, M4; approved by the owner): "required by sanctions" follows the date each country actually
stopped. Re-runs the required (mandated) part of the fall in purchases from Russia (sanctions_share.json, method in
sanctions_share-notes.md) for EU members whose imports of a banned fuel stopped before the ban took effect: such a
product counts as the country's own choice in every year, and pipeline crude that stopped before the exemption ended
(23 June 2023) is not required either. Writes the amount moved from "required" to "own choice" per country and year.

Needs the sanctions research directory (compute_goods.py, rules.py, annex_codes.json and the Eurostat Comext
downloads), which is not in the repository, as for sanctions_share.json: stop_dates_r16.json was produced by the
project's research step and is kept as a data input, so this script documents how it was made but cannot be rerun from
the repository alone. Without that directory it stops with a message (exit code 1) instead of a traceback. Usage:
    python3 -I research/2026-10/scripts/stop_dates_r16.py <sanctions workdir> research/2026-10/gaps <out json>
Evidence for each date: research/2026-10/gaps/stop_dates_r16-notes.md.
"""

import importlib.util
import json
import os
import sys

if len(sys.argv) != 4 or not os.path.isfile(os.path.join(sys.argv[1], "compute_goods.py")):
    sys.exit(
        "usage: stop_dates_r16.py <sanctions research dir with compute_goods.py> research/2026-10/gaps <out json>\n"
        "The sanctions research directory is not in the repository; gaps/stop_dates_r16.json is kept as a data input."
    )
W, RES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
sys.argv = [sys.argv[0], W, RES, "/dev/null"]
spec = importlib.util.spec_from_file_location("cg", os.path.join(W, "compute_goods.py"))
cg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cg)
# country -> list of (HS prefixes, date the country's imports actually stopped, why)
STOPS = {
    "LTU": [
        (
            ("2709",),
            "2022-04-01",
            "Orlen Lietuva (Mazeikiai) stopped taking Russian crude cargoes at the end of March 2022",
        )
    ],
    "FIN": [
        (("2709",), "2022-07-20", "Neste's Russian crude contracts ended in July 2022 (85% replaced from early April)")
    ],
    "POL": [
        (("2701", "2704"), "2022-04-16", "Poland's national coal embargo (Act of 13 April 2022) in force 16 April 2022")
    ],
}
# pipeline crude that stopped before the exemption ended (23 June 2023): not required by the ban. Round 16b (check 16,
# N6): who stopped it. Germany's refineries stopped ordering (own choice); Russia (Transneft) halted Druzhba deliveries
# to Poland (Orlen, 25 February 2023), so Poland's part is written apart as stopped by Russia, like the gas Russia cut off
PIPE_STOP = {"DEU": "2023-01-01", "POL": "2023-02-25"}
PIPE_STOPPED_BY_RUSSIA = {"POL"}
rules_imp, quota = cg.eu_import_rules(os.path.join(W, "annex_codes.json"))
qb = cg.eu_quota_base("1")
cov = cg.Coverage(rules_imp + [cg.LNG_RULE], quota, qb)


def cov_stop(iso, c, y, s, pipe=True):
    for pref, d, _ in STOPS.get(iso, []):
        if c.startswith(pref):
            # stopped before every applicable ban date: the whole fall is the country's own choice
            if all(cg.D(cg.rule_date(r, s)) > cg.D(d) for r in cov.matches(c)):
                return 0.0
    if pipe and iso in PIPE_STOP and c.startswith("2709"):
        pipe, end = cg.PIPELINE[iso]
        cg.PIPELINE[iso] = (pipe, None)
        try:
            return cov.cov(c, y, s, iso=iso)
        finally:
            cg.PIPELINE[iso] = (pipe, end)
    return cov.cov(c, y, s, iso=iso)


EU = {v: k for k, v in cg.EU2ISO.items()}
out = {
    "stops": {k: [{"hs": list(p), "stopped": d, "why": w} for p, d, w in v] for k, v in STOPS.items()},
    "pipeline_stopped": PIPE_STOP,
    "pipeline_stopped_by_russia": sorted(PIPE_STOPPED_BY_RUSSIA),
    "countries": {},
}
for iso in sorted(set(STOPS) | set(PIPE_STOP)):
    data = cg.load_comext(EU[iso], "1")
    base = cg.compute(data, lambda c, y, s: cov.cov(c, y, s, iso=iso), iso=iso)
    new = cg.compute(data, lambda c, y, s: cov_stop(iso, c, y, s), iso=iso)
    # without the pipeline stop: what moves for the other stops only; the rest is the pipeline crude
    nop = (
        cg.compute(data, lambda c, y, s: cov_stop(iso, c, y, s, pipe=False), iso=iso)
        if iso in PIPE_STOPPED_BY_RUSSIA
        else new
    )
    out["countries"][iso] = {
        str(y): {
            "fall_eurbn": round(base[y]["fall"] / 1e9, 4),
            "mandated_before": [round(v / 1e9, 4) for v in base[y]["m"]],
            "mandated_after": [round(v / 1e9, 4) for v in new[y]["m"]],
            "moved_to_own_choice": [round((a - b) / 1e9, 4) for a, b in zip(base[y]["m"], new[y]["m"])],
            # round 16b: the part of moved_to_own_choice that Russia stopped (pipeline crude), not the country's choice
            "moved_stopped_by_russia": [round((a - b) / 1e9, 4) for a, b in zip(nop[y]["m"], new[y]["m"])],
        }
        for y in cg.YEARS
    }
    print(iso, {y: out["countries"][iso][str(y)]["moved_to_own_choice"][1] for y in cg.YEARS})
json.dump(out, open(OUT, "w"), indent=1)
