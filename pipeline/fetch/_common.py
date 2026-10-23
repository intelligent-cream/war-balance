"""Shared helpers for the fetch scripts in pipeline/fetch/ (imported by each script; not run on its own).

Every fetch script writes into research/2026-10/raw/<source>/ with the retrieval date in the file name, so a new run
never overwrites an earlier one, and prints a one-screen summary. Large responses are written as gzipped JSON
(`.json.gz`; note that `*.csv.gz`, `*.pdf`, `*.html` and `*.xlsx` under raw/ are git-ignored and only listed in
MANIFEST.json). Outbound HTTPS honours HTTPS_PROXY and REQUESTS_CA_BUNDLE / SSL_CERT_FILE, as set in CI and in the
sandbox."""

from __future__ import annotations

import datetime as dt
import gzip
import hashlib
import json
import os
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent.parent
RAW = ROOT / "research" / "2026-10" / "raw"
TODAY = os.environ.get("FETCH_DATE") or dt.date.today().isoformat()
UA = "war-balance-fetch/1.0 (+https://github.com; open-data research)"

_session = requests.Session()
_session.headers["User-Agent"] = UA


def out_dir(source: str) -> Path:
    d = RAW / source
    d.mkdir(parents=True, exist_ok=True)
    return d


def get(url: str, params=None, *, headers=None, tries: int = 6, timeout: int = 180, pause: float = 0.0,
        ok=(200,)) -> requests.Response:  # fmt: skip
    """GET with retries and exponential back-off on 429 / 5xx / network errors. Returns the last response (the caller
    checks .status_code) or raises the last network error."""
    wait = 5.0
    last_exc: Exception | None = None
    for attempt in range(tries):
        try:
            r = _session.get(url, params=params, headers=headers, timeout=timeout)
            if r.status_code in ok:
                if pause:
                    time.sleep(pause)
                return r
            if r.status_code not in (429, 500, 502, 503, 504) or attempt == tries - 1:
                return r
            ra = r.headers.get("Retry-After")
            time.sleep(float(ra) if ra and ra.isdigit() else wait)
        except requests.RequestException as e:  # network error: retry
            last_exc = e
            if attempt == tries - 1:
                raise
            time.sleep(wait)
        wait = min(wait * 2, 120)
    if last_exc:
        raise last_exc
    raise RuntimeError("unreachable")


def write_json(path: Path, obj, *, gz: bool | None = None) -> Path:
    """Compact JSON; gzip when the name ends in .gz (or gz=True). Returns the path."""
    data = json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode()
    if gz or (gz is None and path.suffix == ".gz"):
        if path.suffix != ".gz":
            path = path.with_name(path.name + ".gz")
        # mtime=0 keeps the gzip bytes identical for identical content (stable checksums)
        path.write_bytes(gzip.compress(data, 9, mtime=0))
    else:
        path.write_bytes(data)
    return path


def write_bytes(path: Path, data: bytes) -> Path:
    path.write_bytes(data)
    return path


def read_json(path: Path):
    raw = path.read_bytes()
    if path.suffix == ".gz":
        raw = gzip.decompress(raw)
    return json.loads(raw)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024:
            return f"{n:.0f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def report(path: Path, note: str = "") -> None:
    print(f"  wrote {path.relative_to(ROOT)}  ({human(path.stat().st_size)}){'  ' + note if note else ''}")


def jsonstat_rows(d: dict) -> tuple[list[str], list[list]]:
    """Flatten a Eurostat JSON-stat 2.0 dataset (sparse `value` dict) to (columns, rows), one row per non-empty cell,
    dimension codes first and the value last."""
    ids, sizes = d["id"], d["size"]
    codes = []
    for dim in ids:
        idx = d["dimension"][dim]["category"]["index"]
        inv = [None] * len(idx)
        for code, i in idx.items():
            inv[i] = code
        codes.append(inv)
    status = d.get("status") or {}
    rows = []
    for key, v in (d.get("value") or {}).items():
        k = int(key)
        pos = []
        for s in reversed(sizes):
            pos.append(k % s)
            k //= s
        pos.reverse()
        row = [codes[j][p] for j, p in enumerate(pos)] + [v]
        if status:
            row.append(status.get(key))
        rows.append(row)
    cols = list(ids) + ["value"] + (["status"] if status else [])
    return cols, rows
