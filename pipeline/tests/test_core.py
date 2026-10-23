"""Unit tests for a few core rules of build_data.py (round 29, audit 29 item 5). Fast: no full build is run; the
conservation tests read the committed site/data.json, the others run single functions on toy inputs."""

from __future__ import annotations

import pytest

SAMPLE = ["USA", "DEU", "GBR", "FRA", "POL", "JPN", "NOR", "NLD", "ITA", "EST"]


# ---- conservation: parts add up to totals ----


@pytest.mark.parametrize("iso3", SAMPLE)
def test_aid_parts_add_up_to_kiel_total(data, kiel, iso3):
    """A Kiel donor's aid = its own Kiel total less the ERA loans (left out) plus its share of EU-level aid. Amounts
    without a month of up to EUR 0.05bn are not spread over the years (build(): unassigned > 0.05), hence abs=0.06."""
    a = data["countries"][iso3]["aid"]
    own = sum(a["years"]) - sum(a.get("eu_years") or []) + (a.get("era_excluded") or 0)
    assert own == pytest.approx(kiel["donors"][iso3]["total_allocated"], abs=0.06)


def test_eu_aid_split_adds_up_to_eu_total(data, kiel):
    """EU-level aid split over members by their EU budget share loses nothing (Kiel EU institutions less ERA)."""
    eu = kiel["donors"]["EU_INST"]
    split = sum(sum((c.get("aid") or {}).get("eu_years") or []) for c in data["countries"].values())
    assert split == pytest.approx(eu["total_allocated"] - (eu.get("era_allocated") or 0), rel=0.02)
    shares = sum((c.get("aid") or {}).get("eu_share") or 0 for c in data["countries"].values())
    assert shares == pytest.approx(1.0, abs=0.02)


@pytest.mark.parametrize("iso3", SAMPLE)
def test_aid_categories_add_up(data, iso3):
    """Military + financial + humanitarian = the aid total (within Kiel's rounding and its undated amounts)."""
    a = data["countries"][iso3]["aid"]
    assert sum(a["cats"].values()) == pytest.approx(sum(a["years"]), rel=0.05)


@pytest.mark.parametrize("total,shape", [(10.0, [1, 2, 3, 4]), (3.3, [0.5, 0.5]), (7.0, [0, 0, 1])])
def test_spread_conserves_total(bd, total, shape):
    out = bd.spread(total, shape)
    assert sum(out) == pytest.approx(total, abs=1e-4)
    assert len(out) == len(shape)


def test_lch_orders_ranges(bd):
    s = bd.lch({"2022": {"low": 3, "central": 2, "high": 1}, "2023": {"central": 4}})
    for lo, mid, hi in zip(s["years_lo"], s["years"], s["years_hi"]):
        assert lo <= mid <= hi
    assert s["years"][bd.YEARS.index(2023)] == 4


# ---- the no-data rule (round 26): a trade part counts only where the country has its own war-year observation ----


def _no_data(bd, monkeypatch, countries, trade):
    monkeypatch.setattr(bd, "load", lambda path: {"countries": trade})
    bd.mark_no_data(countries)
    return {k: c.get("no_data") for k, c in countries.items()}


def test_no_data_rule(bd, monkeypatch):
    trade = {
        "AAA": {"imports_from_RUS": {"2021": 1.0, "2023": 0.8}, "exports_to_RUS": {"2021": 1.0}},
        "BBB": {"imports_from_RUS": {"2021": 1.0, "2022": None}},
    }
    countries = {
        # reported imports from Russia in 2023: observed; exports only pre-war and from a trend: no data
        "AAA": {"to_rus": {"src": ["trade"]}, "from_rus": {"src": ["trend"]}},
        # no war-year report, but a country-specific record (nonreport) for imports; laundered oil only by allocation
        "BBB": {"to_rus": {"src": ["trend", "nonreport"]}, "laund": {"src": ["eu_refiners"]}},
        # nothing observed at all
        "CCC": {"to_rus": {"src": ["residual"]}, "buy_ukr": {"src": ["trend"]}, "laund": {"src": ["laundered_eu"]}},
        # no trade parts: never marked
        "DDD": {"aid": {"years": [0, 1, 1, 1, 1, 1]}},
    }
    got = _no_data(bd, monkeypatch, countries, trade)
    assert got == {
        "AAA": ["sold"],
        "BBB": ["laund"],
        "CCC": ["buy", "paid", "windfall"],
        "DDD": None,
    }


def test_no_data_parts_cover_every_flow(bd):
    assert set(bd.NO_DATA_OBS) == set(bd.NO_DATA_PARTS)
    assert set(bd.NO_DATA_TRADE) <= set(bd.NO_DATA_OBS)


# ---- the refugee formula (round 16 method-band alternative): one common net cost per person-year ----


def test_refugee_common_cost_toy(bd, monkeypatch):
    years = bd.YEARS  # 2021..2026
    py = {
        "AAA": {"2022": 100_000, "2023": 200_000},
        "BBB": {"2022": 300_000, "2023": 200_000},
        "BLR": {"2022": 1_000_000, "2023": 1_000_000},  # co-belligerent: left out of both sides
    }
    monkeypatch.setattr(bd, "load", lambda path: {"countries": {k: {"person_years": v} for k, v in py.items()}})
    monkeypatch.setattr(bd, "META_R16", {})

    def aid(c22, c23, donor=None):
        a = {"refugee_years": [0.0, c22, c23, 0.0, 0.0, 0.0]}
        if donor is not None:
            a["refugee_donor_share"] = {"low": donor, "central": donor, "high": donor}
        return {"aid": a}

    countries = {"AAA": aid(1.0, 1.0), "BBB": aid(1.0, 3.0, donor=0.5), "BLR": aid(9.0, 9.0), "CCC": aid(5.0, 5.0)}
    bd.refugee_common_cost(countries)
    # common cost per person-year = hosts' total net cost / hosts' total person-years (CCC has no person-years)
    c22, c23 = 2.0 / 400_000, 4.0 / 400_000
    meta = bd.META_R16["refugee_common_cost_eur_per_person_year"]
    assert meta["2022"] == round(c22 * 1e9) and meta["2023"] == round(c23 * 1e9)
    a, b = countries["AAA"]["aid"]["refugee_common_years"], countries["BBB"]["aid"]["refugee_common_years"]
    assert a[years.index(2022)] == pytest.approx(100_000 * c22) and a[years.index(2023)] == pytest.approx(200_000 * c23)
    # the share of hosting paid by donors stays off the host
    assert b[years.index(2022)] == pytest.approx(300_000 * c22 * 0.5)
    # before the war nothing, and the co-belligerent and hosts without person-years get no common cost
    assert a[0] == 0.0
    assert "refugee_common_years" not in countries["BLR"]["aid"]
    assert "refugee_common_years" not in countries["CCC"]["aid"]
    # conservation: without donor shares, the common costs add up to the hosts' actual costs
    assert a[years.index(2023)] + 200_000 * c23 == pytest.approx(1.0 + 3.0)
