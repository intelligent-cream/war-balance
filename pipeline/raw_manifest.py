"""List every raw download under research/2026-10/raw/ with its size and SHA-256 checksum, and whether the file itself
is kept in the repository (small open-data API responses) or only listed (large files and third-party documents, to
be fetched again from the address given in the verification notes). Run after adding downloads."""

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "research" / "2026-10" / "raw"


def ignored(path: Path) -> bool:
    return subprocess.run(["git", "check-ignore", "-q", str(path)], cwd=ROOT).returncode == 0


def main() -> None:
    files = []
    for p in sorted(RAW.rglob("*")):
        if p.is_file() and p.name != "MANIFEST.json":
            files.append(
                {
                    "path": str(p.relative_to(RAW)),
                    "bytes": p.stat().st_size,
                    "sha256": hashlib.sha256(p.read_bytes()).hexdigest(),
                    "in_repository": not ignored(p),
                }
            )
    (RAW / "MANIFEST.json").write_text(json.dumps({"files": files}, indent=1) + "\n")
    print(f"{len(files)} files, {sum(not f['in_repository'] for f in files)} listed only")


if __name__ == "__main__":
    main()
