"""The placebo test of the likely ranges (round 42, pipeline/placebo.py): with the war moved to 2018, where the true war
effect is zero, the trade ranges of the ranked countries must still contain zero for at least 80% of them. Reads the
committed research/2026-10/gaps/placebo_r42.json; rerun `cd pipeline && uv run placebo.py` after changing the bands."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

PLACEBO = Path(__file__).resolve().parents[2] / "research" / "2026-10" / "gaps" / "placebo_r42.json"


@pytest.fixture(scope="module")
def placebo():
    return json.loads(PLACEBO.read_text())


def test_placebo_2018_coverage_at_least_80pct(placebo):
    s = placebo["placebos"]["2018"]["summary"]["ranked"]["trade"]
    assert s["n"] >= 100
    assert s["coverage"] >= 0.80


def test_placebo_summary_matches_rows(placebo):
    for key, p in placebo["placebos"].items():
        rows = [r for r in p["countries"] if r["ranked"] and "trade" in r]
        hit = sum(r["trade"]["contains_zero"] for r in rows)
        assert p["summary"]["ranked"]["trade"]["coverage"] == pytest.approx(hit / len(rows), abs=0.001), key
        for r in rows:
            t = r["trade"]
            assert t["lo"] <= t["pct_gdp"] <= t["hi"]
