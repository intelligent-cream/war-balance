"""Round 54: the findable-pages checks (seo_check.py) catch what they are for, on a small made-up site."""

from __future__ import annotations

from pathlib import Path

import seo_check as sc

U = "https://example.org/"


def page(
    path: str, title: str, desc: str = "A description.", canonical: str | None = None, alts=(), iso=None, refresh=False
):
    links = "".join(f'<link rel="alternate" hreflang="{lang}" href="{u}">' for lang, u in alts)
    return (
        f'<!doctype html><html><head><title>{title}</title><meta name="description" content="{desc}">'
        f'<link rel="canonical" href="{canonical or U + path}">{links}'
        + ('<meta http-equiv="refresh" content="0; url=/">' if refresh else "")
        + f"</head><body{f' data-iso={chr(34)}{iso}{chr(34)}' if iso else ''}></body></html>"
    )


def site(tmp: Path, pages: dict[str, str], az=("slovakia",)) -> Path:
    for path, html in pages.items():
        f = tmp / path / "index.html"
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(html)
    if "" not in pages:
        (tmp / "index.html").write_text("".join(f'<a href="/country/{s}/">' for s in az))
    locs = "".join(f"<url><loc>{U}{p}</loc></url>" for p in pages)
    (tmp / "sitemap.xml").write_text(f"<urlset>{locs}</urlset>")
    return tmp


# Slovakia as the model has it: too close to call, 0.14% of GDP toward Ukraine
SVK = {
    "slug": "slovakia",
    "gdp": 121.2,
    "net": 0.1394,
    "netEur": 0.1689,
    "ua": 0.7820,
    "uaEur": 0.9483,
    "rus": -0.7519,
    "rusEur": -0.9116,
    "netUnc": True,
    "netNear": False,
    "netChance": 0.575,
    "party": False,
    "noData": False,
}
MODEL = {"countries": {"SVK": SVK}}


def test_a_good_site_passes(tmp_path):
    s = site(
        tmp_path,
        {
            "country/slovakia/": page(
                "country/slovakia/", "Is Slovakia helping Ukraine or Russia? Too close to call", iso="SVK"
            )
        },
    )
    assert not any(sc.check_site(s, U, MODEL).values())


def test_title_without_the_chance_word_fails(tmp_path):
    # the old share page's mistake: a "too close to call" country titled as if the direction were known
    s = site(
        tmp_path,
        {"country/slovakia/": page("country/slovakia/", "Slovakia: toward Ukraine by 0.14% of GDP", iso="SVK")},
    )
    assert any("too close to call" in x for x in sc.check_site(s, U, MODEL)["title"])


def test_title_number_must_be_the_models(tmp_path):
    s = site(
        tmp_path,
        {"country/slovakia/": page("country/slovakia/", "Slovakia: 0.48% of GDP, too close to call", iso="SVK")},
    )
    assert sc.check_site(s, U, MODEL)["title"] == ["/country/slovakia/: number 0.48%"]


def test_missing_page_long_title_refresh_and_canonical(tmp_path):
    s = site(
        tmp_path,
        {
            "ranking/": page("ranking/", "x" * 61, refresh=True),
            "changelog/": page("changelog/", "Changelog", desc="y" * 156, canonical=U + "ranking/"),
        },
    )
    p = sc.check_site(s, U, MODEL)
    assert "country/slovakia/ (SVK)" in p["missing"]
    assert p["length"] == ["/ranking/ title 61", "/changelog/ description 156"]
    assert p["refresh"] == ["/ranking/"]
    assert p["canonical"] == [f"/changelog/ -> {U}ranking/"]


def test_hreflang_must_be_reciprocal(tmp_path):
    both = [("en", U + "a/"), ("de", U + "de/a/"), ("x-default", U + "a/")]
    s = site(
        tmp_path,
        {
            "a/": page("a/", "A", alts=both),
            "de/a/": page("de/a/", "A de", alts=[("de", U + "de/a/"), ("x-default", U + "a/")]),
        },
    )
    assert any("not reciprocal" in x for x in sc.check_site(s, U, None)["hreflang"])


def test_number_formats_match_the_copy():
    assert [sc.fmt_pct(x) for x in (3.651, 0.1394, 0.004)] == ["3.7%", "0.14%", "<0.01%"]
    assert [sc.fmt_eur(x) for x in (127.6, 74.67, 0.948, 0.0912)] == ["€128bn", "€74.7bn", "€0.95bn", "€91m"]
    assert sc.level(SVK) == "unc"
