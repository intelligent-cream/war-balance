"""Compare a fresh build with the committed site/data.json and site/detail.json (round 29, audit 29: the CI gate).

    uv run python pipeline/compare_built.py <dir with the committed data.json and detail.json> site

The build date is left out: data.json "generated" and the "updated <date>" in status_html (both follow the newest date
in site/content/changelog.md). Everything else must be identical, key order included, because build_data.py writes the
same bytes on every run. Prints the first differing paths and exits 1 on any difference.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

FILES = ("data.json", "detail.json")
DATE = re.compile(r"updated \d{1,2} [A-Z][a-z]+ \d{4}")


def normalise(name: str, obj: dict) -> dict:
    if name == "data.json":
        obj = dict(obj)
        obj.pop("generated", None)
        if isinstance(obj.get("status_html"), str):
            obj["status_html"] = DATE.sub("updated <date>", obj["status_html"])
    return obj


def diff(a, b, path: str, out: list[str], limit: int = 20) -> None:
    if len(out) >= limit:
        return
    if type(a) is not type(b):
        out.append(f"{path}: {type(a).__name__} vs {type(b).__name__}")
    elif isinstance(a, dict):
        if list(a) != list(b):
            extra = sorted(set(a) ^ set(b))
            out.append(f"{path}: keys differ {extra[:6]}" if extra else f"{path}: key order differs")
        for k in a:
            if k in b:
                diff(a[k], b[k], f"{path}/{k}", out, limit)
    elif isinstance(a, list):
        if len(a) != len(b):
            out.append(f"{path}: length {len(a)} vs {len(b)}")
        for i, (x, y) in enumerate(zip(a, b)):
            diff(x, y, f"{path}[{i}]", out, limit)
    elif a != b:
        out.append(f"{path}: {str(a)[:60]!r} vs {str(b)[:60]!r}")


def main(committed: Path, built: Path) -> int:
    bad = False
    for name in FILES:
        a = normalise(name, json.loads((committed / name).read_text()))
        b = normalise(name, json.loads((built / name).read_text()))
        out: list[str] = []
        diff(a, b, "", out)
        if out:
            bad = True
            print(f"FAIL  {name} differs from the committed file (rebuild and commit it):")
            for line in out:
                print(f"      {line}")
        else:
            print(f"PASS  {name} matches the committed file (build date left out)")
    return 1 if bad else 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    sys.exit(main(Path(sys.argv[1]), Path(sys.argv[2])))
