# ruff: noqa
import json

B = str(__import__("pathlib").Path(__file__).resolve().parent) + "/"
T = json.load(open(B + "table.json"))
E = {r["iso"]: r for r in json.load(open(B + "exposure.json"))}
rows = []
for iso, r in E.items():
    t = T[iso]
    P = lambda f, k="product": t[f][k]["central"]
    fb = r["own"] + r["purl"] + r["arms"]
    old = 0.2 * fb + 0.2 * r["sell"] + 0.2 * abs(r["sold"]) + 0.2 * abs(r["svc"]) + abs(r["ship"])
    new = (
        P("flowback_weapons") * fb
        + P("sales_to_ukraine_extra") * r["sell"]
        + (P("sales_to_russia_lost") if r["sold"] > 0 else P("sales_to_russia_extra")) * abs(r["sold"])
        + (P("services_to_russia") if r["svc"] > 0 else P("services_to_russia", "product_when_more")) * abs(r["svc"])
        + P("shipping") * abs(r["ship"]) / 0.35
    )
    # signed: toward Ukraine positive. flowback/sell reduce Ukraine balance; lost sales count toward Ukraine (cost), extra toward Russia
    rows.append(
        dict(
            iso=iso, gdp=r["gdp"], fb=fb, sell=r["sell"], sold=r["sold"], svc=r["svc"], ship=r["ship"], old=old, new=new
        )
    )
rows.sort(key=lambda x: -x["old"])
json.dump(rows, open(B + "compare.json", "w"))
print("iso fb sell sold svc shipProfit | old new ratio | newpctGDP-oldpctGDP")
for x in rows[:20]:
    print(
        x["iso"],
        *[round(x[k], 1) for k in ("fb", "sell", "sold", "svc", "ship")],
        "|",
        round(x["old"], 2),
        round(x["new"], 2),
        round(x["new"] / x["old"], 2),
        "|",
        round((x["new"] - x["old"]) / x["gdp"] * 100, 2) if x["gdp"] else "",
    )
