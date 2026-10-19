# ruff: noqa
import json, sys

d = json.load(open(str(__import__("pathlib").Path(__file__).resolve().parents[4] / "site/data.json")))
F = d["frac"]
C = d["countries"]


def delta(o, above=False):
    if not o:
        return 0
    y = o["years"]
    m = o.get("base", y[0])
    p = o.get("pidx", [1] * 6)
    q = o.get("bmul", [1] * 6)
    s = 0
    for i in range(1, 6):
        e = m * F[i] * q[i]
        a = y[i] / p[i]
        s += max(0, a - e) if above else (e - a)
    return s


def s(o, k):
    return sum(o.get(k, [0] * 6)[1:]) if o else 0


rows = []
for k, c in C.items():
    fb = c.get("flowback")
    r = dict(
        iso=k,
        name=c["name"],
        gdp=c.get("gdp") or 0,
        own=s(fb, "own"),
        purl=s(fb, "purl_in"),
        arms=s(fb, "arms"),
        sell=delta(c.get("sell_ukr"), True),
        sold=delta(c.get("from_rus")),
        svc=delta(c.get("svc_sold")),
        ship=-delta(c.get("shipping")),
    )
    r["prof20"] = (
        0.2 * (r["own"] + r["purl"] + r["arms"] + r["sell"])
        + 0.2 * abs(r["sold"])
        + 0.2 * abs(r["svc"])
        + abs(r["ship"])
    )
    rows.append(r)
json.dump(rows, open(str(__import__("pathlib").Path(__file__).resolve().parent / "exposure.json"), "w"))
rows.sort(key=lambda r: -r["prof20"] / r["gdp"] if r["gdp"] else 0)
print("by pct gdp")
[
    print(
        r["iso"],
        round(r["prof20"] / r["gdp"] * 100, 2),
        {k: round(v, 2) for k, v in r.items() if k not in ("iso", "name", "gdp")},
    )
    for r in rows[:25]
]
rows.sort(key=lambda r: -r["prof20"])
print("by eur")
[
    print(r["iso"], round(r["prof20"], 2), {k: round(v, 2) for k, v in r.items() if k not in ("iso", "name", "gdp")})
    for r in rows[:25]
]
