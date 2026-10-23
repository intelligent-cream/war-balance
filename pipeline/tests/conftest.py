"""Shared set-up for the pipeline tests: import build_data from pipeline/ and load the committed site/data.json once."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import pytest

PIPELINE = Path(__file__).resolve().parent.parent
ROOT = PIPELINE.parent
sys.path.insert(0, str(PIPELINE))


@pytest.fixture(scope="session")
def bd():
    import build_data

    return build_data


@pytest.fixture(scope="session")
def data():
    return json.loads((ROOT / "site" / "data.json").read_text())


@pytest.fixture(scope="session")
def kiel():
    return json.loads((ROOT / "research" / "2026-10" / "kiel.json").read_text())
