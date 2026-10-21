"""Round 15 (review 4, H4; approved by the owner): flag headline figures in the documentation that no longer match
site/data.json, so the docs cannot drift from the map again.

A figure in the site's long-form text (site/content/, round 23; docs/ and README.md until then) is checked when a tag
follows it:

    Germany's support for Ukraine is +1.7%<!-- n:DEU.ua -->

The tag names a country (ISO3) and a quantity, computed with the map's own model (pipeline/site_numbers.mjs):

    ua, rus, net                   support for Ukraine, change in payments to Russia, net: % of GDP, 2022-August 2026
    uaLo, uaHi, rusLo, ... netHi   the likely range
    uaBandLo, ..., netBandHi       the method band
    ua2025, rus2025, net2025       2022-2025 only
    uaEur, rusEur, netEur          EUR bn
    alt_<name>.ua|rus|net          one method-band alternative (alt_p26.rus = 2026 at 2025 prices)
    WORLD.less, WORLD.more, WORLD.net, WORLD.ratio   the world's payments to Russia (EUR bn; ratio)

The figure is the number written just before the tag (a minus sign or "−" is read as negative); it must match the model
to the precision it is written with (half a unit of its last digit, at least 0.006). Run:

    uv run python pipeline/check_docs_numbers.py      (check_data.py runs it too)

Exit code 1 when a tagged figure differs, or when no tag is found.
"""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAG = re.compile(r"([+\-−]?\d[\d,]*(?:\.\d+)?)\s*(?:%|bn|pp)?\)?\s*<!-- n:([A-Z]{3}|WORLD)\.([\w.]+) -->")


def model() -> dict | None:
    node = shutil.which("node")
    if not node:
        return None
    out = subprocess.run(
        [node, str(ROOT / "pipeline" / "site_numbers.mjs")], capture_output=True, text=True, check=True
    )
    return json.loads(out.stdout)


def value(m: dict, who: str, what: str) -> float | None:
    if who == "WORLD":
        return m["world"].get(what)
    c = m["countries"].get(who)
    if not c:
        return None
    if what.startswith("alt_"):
        name, q = what.rsplit(".", 1)
        return (c.get(name) or {}).get(q)
    return c.get(what)


def check(m: dict) -> tuple[list[str], int]:
    bad, n = [], 0
    files = (
        sorted((ROOT / "site" / "content").rglob("*.md")) + sorted((ROOT / "docs").rglob("*.md")) + [ROOT / "README.md"]
    )
    for f in files:
        for i, line in enumerate(f.read_text().splitlines(), 1):
            for mt in TAG.finditer(line):
                n += 1
                raw, who, what = mt.groups()
                num = float(raw.replace("−", "-").replace(",", ""))
                want = value(m, who, what)
                dec = len(raw.split(".")[1]) if "." in raw else 0
                tol = max(0.5 * 10**-dec, 0.006)
                if want is None or abs(num - want) > tol + 1e-9:
                    bad.append(f"{f.relative_to(ROOT)}:{i} {who}.{what} says {raw}, data {want}")
    return bad, n


def main() -> int:
    m = model()
    if m is None:
        print("WARN  node not found: docs figures not checked")
        return 0
    bad, n = check(m)
    for b in bad:
        print("FAIL ", b)
    print(f"{'PASS' if not bad and n else 'FAIL'}  {n} tagged figures in the docs, {len(bad)} differ from data.json")
    return 1 if bad or not n else 0


if __name__ == "__main__":
    sys.exit(main())
