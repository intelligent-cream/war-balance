"""Round 54: the findable-pages checks (seo_check.py) catch what they are for, on a small made-up site."""

from __future__ import annotations

import json
import shutil
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


# ----- round 55: the topic and group pages -----
TOPICS = [{"slug": "svk-group", "kind": "group", "members": ["SVK"]}]


def topic_page(cell: str, total: str = "+0.14%") -> str:
    return page("group/svk-group/", "Slovakia group").replace(
        "</body>",
        f'<div data-total="net"><span>Net</span><b>{total}</b></div>'
        f'<table><tr data-iso="SVK"><td>Slovakia</td>{cell}</tr></table></body>',
    )


GOOD_CELL = (
    '<td class="m" data-q="net" data-level="unc"><b>+0.14%</b><span class="s">+€0.17bn of GDP</span>'
    '<span class="s">likely 4.1% toward Russia to 4.7% toward Ukraine · too close to call · 57% toward Ukraine</span></td>'
)


def test_a_good_topic_page_passes(tmp_path):
    s = site(tmp_path, {"group/svk-group/": topic_page(GOOD_CELL)})
    assert sc.check_site(s, U, MODEL, TOPICS)["topics"] == []


def test_topic_figures_chance_and_totals_must_be_the_models(tmp_path):
    cell = GOOD_CELL.replace("+0.14%", "+0.24%").replace('data-level="unc"', 'data-level="sure"')
    s = site(tmp_path, {"group/svk-group/": topic_page(cell, total="+0.31%")})
    p = sc.check_site(s, U, MODEL, TOPICS)["topics"]
    assert "/group/svk-group/ SVK net: ['0.24%']" in p
    assert "/group/svk-group/ SVK net: chance 'sure', the map says unc" in p
    assert "/group/svk-group/ total net: ['0.31%']" in p


def test_every_topic_entry_must_be_written(tmp_path):
    s = site(tmp_path, {"group/svk-group/": topic_page(GOOD_CELL)})
    p = sc.check_site(s, U, MODEL, TOPICS + [{"slug": "missing-topic", "kind": "topic"}])["topics"]
    assert p == ["/missing-topic/ not written or not in the sitemap"]


# ----- round 56: the sitemap index, every language, the families -----
def test_number_formats_in_every_language():
    assert sc.fmt_eur(74.666, "de") == "74,7 Mrd. €"
    assert sc.fmt_eur(1234.4, "fr") == "1 234 Md€"
    assert sc.fmt_eur(74.666, "es") == "74.700 M€"
    assert sc.fmt_eur(0.05, "nl") == "€50 mln"
    assert sc.fmt_pct(0.1394, "de") == "0,14 %"
    assert sc.fmt_pct(3.651, "uk") == "3,7%"
    assert sc.numbers("Schweiz: 8,3 Mrd. € und 1,0 %", "de") == ["8,3 Mrd. €", "1,0 %"]


def test_sitemap_index_is_read(tmp_path):
    s = site(
        tmp_path,
        {
            "country/slovakia/": page(
                "country/slovakia/", "Is Slovakia helping Ukraine or Russia? Too close to call", iso="SVK"
            )
        },
    )
    (s / "sitemap-en.xml").write_text((s / "sitemap.xml").read_text())
    (s / "sitemap.xml").write_text(f"<sitemapindex><sitemap><loc>{U}sitemap-en.xml</loc></sitemap></sitemapindex>")
    assert sc.site_urls(s, U) == [U + "country/slovakia/"]
    assert not any(sc.check_site(s, U, MODEL).values())


WORDS_DE = sc.lang_words(
    {
        "too close to call": "zu knapp für eine Aussage",
        "Leaning toward Ukraine": "Tendenz Richtung Ukraine",
        "Leaning toward Russia": "Tendenz Richtung Russland",
        "near zero": "nahe null",
        "essentially zero": "praktisch null",
        "Party to the war": "Kriegspartei",
        "very likely · {p}": "sehr wahrscheinlich · {p}",
    }
)


def test_a_title_in_another_language_says_the_maps_chance_words():
    good = "Slowakei: Ukraine oder Russland? Zu knapp für eine Aussage"
    assert sc.title_problems_lang(good, SVK, "de", WORDS_DE) == []
    bad = "Slowakei: Tendenz Richtung Ukraine, 0,48 %"
    assert sc.title_problems_lang(bad, SVK, "de", WORDS_DE) == [
        "number 0,48 %",
        "says lean words, the map says unc",
        "does not say the unc words",
    ]


def test_every_family_page_is_expected():
    model = {
        "countries": {
            "SVK": {**SVK, "uaEur": 1.0, "part_aid": 0.6},
            "POL": {**SVK, "slug": "poland", "uaEur": 9.0, "part_aid": 0.3},
        }
    }
    fam = {
        "parts": {"minCountries": 2, "minTotal": 0.5, "list": [{"key": "aid", "slug": "gov-aid", "side": "ua"}]},
        "years": [2025],
        "compare": {"pairwiseTop": 2, "pairs": [["SVK", "POL"], ["SVK", "XXX"]]},
    }
    assert sc.family_pages(model, TOPICS, fam) == [
        "group/svk-group/",
        "gov-aid/",
        "ukraine-aid-2025/",
        "trade-with-russia-2025/",
        "compare/slovakia-vs-poland/",
        "topics/",
    ]


# ----- round 57: the wording guard -----
ROOT = Path(__file__).resolve().parents[2]
CW = {"de": ["sehr wahrscheinlich", "wahrscheinlich", "zu knapp für eine Aussage", "Tendenz"]}


def w(text: str, lang: str = "en") -> list[str]:
    return sc.wording_problems([{"file": "f", "key": "k", "lang": lang, "text": text}], CW)


def test_wording_guard_catches_each_kind_of_stale_claim():
    assert w("Germany gave the most") == ["f k [en]: ranking 'most' in “Germany gave the most”"]
    assert any("number '27'" in x for x in w("The 27 EU members"))
    assert any("number 'half'" in x for x in w("about half of it"))
    assert any("comparison 'more than'" in x for x in w("Europe paid Russia more than it gave Ukraine."))
    assert any("direction 'toward Russia'" in x for x in w("Hungary: 6% of GDP toward Russia"))
    assert any("direction 'supported'" in x for x in w("Germany supported Ukraine with €70bn."))
    assert any("certainty 'very likely'" in x for x in w("very likely toward Ukraine or Russia"))
    assert any("trend 'rose'" in x for x in w("Fuel prices rose with the war."))
    assert any("absolute 'never'" in x for x in w("It never changes."))
    # in every language, with the map's own chance words
    assert any("certainty 'wahrscheinlich'" in x for x in w("Ungarn: wahrscheinlich Richtung Russland", "de"))
    assert any("direction 'hilft'" in x for x in w("Ungarn hilft Russland.", "de"))
    assert any("ranking 'am meisten'" in x for x in w("Deutschland gab am meisten.", "de"))
    assert any("ranking 'na czele'" in x for x in w("Na czele: Polska.", "pl"))
    assert any("direction 'на бік Росії'" in x for x in w("Угорщина: 6% ВВП на бік Росії", "uk"))


def test_wording_guard_allows_questions_conditions_placeholders_and_dates():
    # a neutral question, or a sentence that names both sides, states no result
    assert w("Is Germany helping Russia? Which countries give the most to Ukraine?") == []
    assert w("Where did each country's money move: toward Ukraine or toward Russia?") == []
    assert w("+ toward Ukraine, − toward Russia") == []
    assert w("{q:Countries helping Russia}, in money terms") == []
    # words chosen by the data, and the data itself
    assert w("Russia kept {rus} {if:rusX<0|more|less} than without the war; {top1} {top1_eur}.") == []
    assert w("{if:sum:net>=0|toward Ukraine|toward Russia}") == []
    # but a condition's words may not hold a number or a chance word
    assert any("number" in x for x in w("{if:n>1|27 members|}"))
    assert any("certainty" in x for x in w("{if:n>1|very likely|}"))
    # years, the war's start and the named facts in ALLOW
    assert w("From February 2022 to {dataTo}; the fuel share before the war (2018 to 2021); the G7.") == []
    assert w("until the EU's ban of 21 January 2026") == []
    assert any("date 'August 2026'" in x for x in w("from February 2022 to August 2026"))
    # a phrase that the engine could not read
    assert any("unclosed" in x for x in w("{if:n>1|a"))


def test_wording_guard_names_file_entry_language_and_word_when_the_config_is_tampered_with():
    topics = json.loads((ROOT / "pipeline" / "seo_topics.json").read_text())
    fam = json.loads((ROOT / "pipeline" / "seo_families.json").read_text())
    assert sc.wording_problems(sc.config_items(topics, fam)) == []
    topics["pages"][0]["intro"] += " Germany gave the most."
    p = sc.wording_problems(sc.config_items(topics, fam))
    assert len(p) == 1 and p[0].startswith(
        "pipeline/seo_topics.json ukraine-support-tracker.intro [en]: ranking 'most'"
    )


def test_the_real_phrases_pass_the_wording_guard():
    p, n = sc.check_wording(ROOT, shutil.which("node"))
    assert p == [] and n > 100
