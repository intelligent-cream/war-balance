"""Round 54: the findable-pages checks (seo_check.py) catch what they are for, on a small made-up site."""

from __future__ import annotations

import json
import re
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
        f'<link rel="canonical" href="{canonical or U + path}">'
        f'<link rel="alternate" type="text/markdown" href="/{path}index.md">{links}'
        + ('<meta http-equiv="refresh" content="0; url=/">' if refresh else "")
        + f"</head><body{f' data-iso={chr(34)}{iso}{chr(34)}' if iso else ''}>"
        + f'<main><p>Net 0.14%.</p><p class="cite">Cite as: War Balance, figures to August 2026, {U + path}</p></main></body></html>'
    )


def site(tmp: Path, pages: dict[str, str], az=("slovakia",)) -> Path:
    for path, html in pages.items():
        f = tmp / path / "index.html"
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(html)
        # round 58: its Markdown version (the same words and figures)
        (f.parent / "index.md").write_text(f"Net 0.14%.\n\nCite as: War Balance, figures to August 2026, {U + path}\n")
    # round 58: llms.txt, llms-full.txt and the downloads, with Slovakia's figures as the model has them
    (tmp / "llms.txt").write_text(f"# War Balance\n\n- [Map]({U}): the map\n")
    (tmp / "llms-full.txt").write_text(
        f"- Slovakia: net +0.14% of a year's GDP (too close to call) | support for Ukraine €0.95bn | x | {U}country/slovakia/\n"
    )
    (tmp / "downloads").mkdir(exist_ok=True)
    (tmp / "downloads" / "index.html").write_text('<a href="/downloads/war-balance-countries.csv">csv</a>')
    (tmp / "downloads" / "war-balance-countries.csv").write_text(
        "\ufeffiso3,net_shift_eur_bn,support_ukraine_eur_bn,trade_with_russia_toward_ukraine_eur_bn\nSVK,0.1689,0.9483,-0.9116\n"
    )
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


# ----- round 57b: the comparative words, and the country pages' sections and questions -----
def test_wording_guard_catches_comparative_and_positional_words():
    for t in (
        "Its aid was far more than Poland's.",
        "A smaller share.",
        "A bigger part.",
        "Higher prices.",
        "Lower now.",
        "It sits below zero.",
        "It is above the line.",
        "Its aid exceeds its trade.",
    ):
        assert any("comparison" in x for x in w(t)), t
    assert any("comparison 'kleiner'" in x for x in w("Ein kleiner Teil.", "de"))
    assert any("comparison 'poniżej'" in x for x in w("Saldo poniżej zera.", "pl"))
    # chosen by the data, inside a condition, they are allowed; and the method's defined terms
    assert w("Support {if:a>b|rose|fell}; a {if:a>b|bigger|smaller} share.") == []
    assert w("taxes and profit above a normal return") == []


DYN_SVK = dict(SVK, part_ref=0.3639, dyn={"tb0": 2.95903, "tb1": 2.01306})


def dyn_page(
    figs: str, faq_visible=(("Q?", "A <b>1</b>."),), faq_ld=(("Q?", "A 1."),), src='<a href="https://ex.org/a">S</a>'
) -> str:
    vis = "".join(f"<h3>{q}</h3><p>{a}</p>" for q, a in faq_visible)
    ld = json.dumps(
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq_ld
            ],
        }
    )
    return (
        f'<html><head><script type="application/ld+json">{ld}</script></head><body><p>{figs}</p>'
        f'<ul class="src"><li id="src-x"><span class="tier">official</span> {src}</li></ul>'
        f'<section class="faq" id="faq"><h2>Questions</h2>{vis}</section></body></html>'
    )


def test_a_country_pages_figures_must_be_the_models(tmp_path):
    ok = (
        '<span data-f="e" data-k="uaEur">€0.95bn</span> <span data-f="p" data-k="part_ref">0.30%</span> '
        '<span data-f="e" data-k="tb0">€3bn</span> <span data-f="c" data-k="tbc">−32%</span>'
    )
    assert sc.check_dyn(dyn_page(ok), "/x/", "SVK", {"countries": {"SVK": DYN_SVK}}, "en", {}, tmp_path) == []
    bad = '<span data-f="e" data-k="uaEur">€1.2bn</span> <span data-f="c" data-k="tbc">+32%</span> <span data-f="e" data-k="nope">€1bn</span>'
    p = sc.check_dyn(dyn_page(bad), "/x/", "SVK", {"countries": {"SVK": DYN_SVK}}, "en", {}, tmp_path)
    assert (
        len(p) == 3
        and any("uaEur" in x for x in p)
        and any("tbc" in x for x in p)
        and any("not in the model" in x for x in p)
    )
    # a rank by the map's rule: a too-close-to-call country gets no number
    assert sc.check_dyn(
        dyn_page('<span data-f="k" data-k="rank:all">3</span>'),
        "/x/",
        "SVK",
        {"countries": {"SVK": DYN_SVK}},
        "en",
        {"all": sc.map_ranks({"countries": {"SVK": DYN_SVK}})},
        tmp_path,
    )


def test_the_visible_questions_must_be_the_json_ld_and_every_source_a_working_link(tmp_path):
    m = {"countries": {"SVK": DYN_SVK}}
    assert any(
        "questions" in x
        for x in sc.check_dyn(dyn_page("", faq_ld=(("Q?", "Another answer."),)), "/x/", "SVK", m, "en", {}, tmp_path)
    )
    assert any(
        "without a link" in x
        for x in sc.check_dyn(dyn_page("", src="Just a name"), "/x/", "SVK", m, "en", {}, tmp_path)
    )
    assert any(
        "does not work" in x
        for x in sc.check_dyn(dyn_page("", src='<a href="htp:/broken">S</a>'), "/x/", "SVK", m, "en", {}, tmp_path)
    )
    assert any(
        "does not work" in x
        for x in sc.check_dyn(dyn_page("", src='<a href="#src-missing">S</a>'), "/x/", "SVK", m, "en", {}, tmp_path)
    )
    assert sc.check_dyn(dyn_page("", src='<a href="#src-x">S</a>'), "/x/", "SVK", m, "en", {}, tmp_path) == []
    # "<0.01%" is escaped on the page and plain in the JSON-LD
    assert (
        sc.check_dyn(
            dyn_page("", faq_visible=(("Q?", "&lt;0.01% of GDP"),), faq_ld=(("Q?", "<0.01% of GDP"),)),
            "/x/",
            "SVK",
            m,
            "en",
            {},
            tmp_path,
        )
        == []
    )


# ----- round 58: the cite line, the Markdown versions, llms-full.txt and the downloads -----
GOOD = {
    "country/slovakia/": page(
        "country/slovakia/", "Is Slovakia helping Ukraine or Russia? Too close to call", iso="SVK"
    )
}


def test_a_page_without_its_cite_line_or_markdown_fails(tmp_path):
    s = site(tmp_path, {"country/slovakia/": GOOD["country/slovakia/"].replace('<p class="cite">', "<p>")})
    assert sc.check_site(s, U, MODEL)["cite"] == ["/country/slovakia/"]
    (s / "country" / "slovakia" / "index.md").unlink()
    assert any("no Markdown version" in x for x in sc.check_site(s, U, MODEL)["markdown"])


def test_markdown_may_not_write_a_figure_the_page_does_not(tmp_path):
    s = site(tmp_path, GOOD)
    (s / "country" / "slovakia" / "index.md").write_text(
        f"Net 0.48%.\n\nCite as: War Balance, figures to August 2026, {U}country/slovakia/\n"
    )
    assert any("048" in x for x in sc.check_site(s, U, MODEL)["markdown"])


def test_llms_and_csv_figures_must_be_the_models(tmp_path):
    s = site(tmp_path, GOOD)
    (s / "llms-full.txt").write_text((s / "llms-full.txt").read_text().replace("+0.14%", "+0.48%"))
    assert any("net is not the model's" in x for x in sc.check_site(s, U, MODEL)["llms"])
    f = s / "downloads" / "war-balance-countries.csv"
    f.write_text(f.read_text().replace("0.9483", "0.9999"))
    assert any("support_ukraine_eur_bn" in x for x in sc.check_site(s, U, MODEL)["downloads"])
    (s / "downloads" / "index.html").write_text('<a href="/downloads/missing.csv">x</a>')
    assert any("does not resolve" in x for x in sc.check_site(s, U, MODEL)["downloads"])


def test_explainer_dates_are_allowed_by_name_only():
    ok = sc.wording_problems(
        [{"file": "f", "key": "k", "lang": "en", "text": "Since February 2023 and from September 2025."}]
    )
    assert ok == []
    bad = sc.wording_problems([{"file": "f", "key": "k", "lang": "en", "text": "Since March 2024 the cap applies."}])
    assert any("date" in x for x in bad)
    bad_de = sc.wording_problems([{"file": "f", "key": "k", "lang": "de", "text": "Seit Februar 2024 gilt er."}])
    assert any("date" in x for x in bad_de)


# ----- round 58 (owner: "the ranking does not work and the numbers make no sense"): the tables' own sanity -----
ORDER_EN = {
    "hiLo": "high to low",
    "loHi": "low to high",
    "bySize": "by size, either way",
    "uaRu": "from the Ukraine side to the Russia side",
    "ruUa": "from the Russia side to the Ukraine side",
    "back": "by the amount subtracted, high to low",
}
WORDS_EN = ["likely", "about 0", "very likely", "too close to call", "near zero", "essentially zero"]


def part_row(iso, name, gdp, pop, v, lo, hi, b, pct, pp, rg, extra=""):
    lohi = f' data-lo="{lo}" data-hi="{hi}"' if lo is not None else ""
    return (
        f'<tr data-iso="{iso}" data-gdp="{gdp}" data-pop="{pop}"><td class="r">1</td><td><a href="/country/x/">{name}</a></td>'
        f'<td class="m" data-q="part:purl" data-st="signed" data-v="{v}"{lohi}><b class="neg">{b}</b>'
        f'<span class="s"><i>{pct} of GDP</i> · <i>{pp} per person</i></span>'
        + (f'<span class="s rg">{rg}</span>' if rg else "")
        + f"{extra}</td></tr>"
    )


def part_table(rows, order="asc", note="by the amount subtracted, high to low"):
    return (
        f'<p class="sub" data-note="order">Sorted by “X” in euros, {note}, February 2022 to August 2026.</p>'
        f'<div class="tbl"><table class="topic" data-order="{order}" data-sort="eur" data-key="part:purl" data-side="back">'
        f"<thead><tr><th>#</th></tr></thead><tbody>{''.join(rows)}</tbody></table></div>"
    )


GOOD_ROWS = [
    part_row(
        "USA",
        "United States",
        25843.769,
        335,
        -0.7024,
        -1.409,
        -0.3178,
        "−€0.70bn",
        "&lt;0.01%",
        "−€2",
        "range −€1.4bn to −€0.32bn",
    ),
    part_row(
        "SWE", "Sweden", 546.789, 10.5, -0.301, -0.639, -0.0026, "−€0.30bn", "−0.06%", "−€29", "range −€0.64bn to −€3m"
    ),
    part_row(
        "CZE",
        "Czechia",
        308.805,
        10.9,
        -0.1657,
        -0.4874,
        -0.0212,
        "−€0.17bn",
        "−0.05%",
        "−€15",
        "range −€0.49bn to −€21m",
    ),
]


def test_sanity_a_good_part_table_passes():
    probs, seen = sc.check_tables(part_table(GOOD_ROWS), "/p/", "en", WORDS_EN, ORDER_EN)
    assert probs == []
    assert seen[("SWE", "part:purl", 0)][0][:2] == ("eur", -0.3)


def test_sanity_catches_the_part_page_the_owner_reported():
    # Sweden as the page had it: "−0.06% … likely <0.01% to 0.12%", the name repeated in every row, the side's order in
    # the words of the net ("from the Russia side to the Ukraine side")
    bad = [
        r.replace("range −€0.64bn to −€3m", "likely &lt;0.01% to 0.12%").replace(
            "</td></tr>", f'<span class="s">{n} kept part of others\' aid, spent here</span></td></tr>'
        )
        for r, n in zip(GOOD_ROWS, ["United States", "Sweden", "Czechia"])
    ]
    probs, _ = sc.check_tables(
        part_table(bad, note="from the Russia side to the Ukraine side"), "/p/", "en", WORDS_EN, ORDER_EN
    )
    text = "\n".join(probs)
    assert "SWE part:purl: range 'likely" in text and "not in the unit of the value" in text
    assert "chance or likely-range words ['likely']" in text
    assert "repeats '◊ kept part of others' aid, spent here' in every row" in text
    probs, _ = sc.check_tables(part_table(GOOD_ROWS, note="by size, either way"), "/p/", "en", WORDS_EN, ORDER_EN)
    assert any("the note says 'abs', the table is sorted 'asc'" in p for p in probs)


def test_sanity_catches_ranges_signs_shares_and_order():
    # a range that does not hold the value, or runs high to low, or has no signs
    r = GOOD_ROWS[1]
    for rg, want in [
        ("range −€0.64bn to −€0.40bn", "outside its range"),
        ("range −€3m to −€0.64bn", "runs high to low"),
        ("range €0.64bn to €3m", "without signs"),
    ]:
        probs, _ = sc.check_tables(
            part_table([r.replace("range −€0.64bn to −€3m", rg)]), "/p/", "en", WORDS_EN, ORDER_EN
        )
        assert any(want in p for p in probs), (rg, probs)
    # "0.01%" written without its sign, a share that is not the euros over GDP, a figure per person that is not over the
    # population, the euros not the cell's own value
    for old, new, want in [
        ("−0.06%", "0.06%", "sign of '0.06% of GDP'"),
        ("−0.06%", "−0.6%", "of GDP is not"),
        ("−€29", "−€290", "per person is not"),
        ("−€0.30bn</b>", "−€0.40bn</b>", "€ bn written"),
    ]:
        probs, _ = sc.check_tables(part_table([r.replace(old, new)]), "/p/", "en", WORDS_EN, ORDER_EN)
        assert any(want in p for p in probs), (new, probs)
    # rows out of the stated order
    probs, _ = sc.check_tables(part_table([GOOD_ROWS[1], GOOD_ROWS[0], GOOD_ROWS[2]]), "/p/", "en", WORDS_EN, ORDER_EN)
    assert any("break the order 'asc'" in p for p in probs)


def year_row(iso, ua, rus, frozen, net):
    def cell(q, st, v, b):
        return f'<td class="m" data-q="{q}" data-year="2024" data-st="{st}" data-v="{v}"><b>{b}</b><span class="s"></span></td>'

    return (
        f'<tr data-iso="{iso}" data-gdp="1000"><td class="r">1</td><td><a href="/">{iso}</a></td>'
        + cell("ua", "signed", ua[0], ua[1])
        + cell("rus", "kept", rus[0], rus[1])
        + cell("frozen", "amount", frozen[0], frozen[1])
        + cell("net", "signed", net[0], net[1])
        + "</tr>"
    )


def test_sanity_a_page_by_year_adds_up():
    good = year_row("USA", (19.52, "+€19.5bn"), (9.98, "€10bn less"), (2.0, "€2bn"), (31.5, "+€31.5bn"))
    t = f'<p class="sub" data-note="order">Sorted, high to low.</p><table class="topic" data-order="desc" data-sort="eur">{good}</table>'
    assert sc.check_tables(t, "/y/", "en", WORDS_EN, ORDER_EN)[0] == []
    # without frozen money's column the row does not add up to its net (the pages by year before round 58)
    bad = re.sub(r'<td class="m" data-q="frozen".*?</td>', "", t)
    assert any(
        "support + trade + frozen = +29.500 bn, the net says +31.500" in p
        for p in sc.check_tables(bad, "/y/", "en", WORDS_EN, ORDER_EN)[0]
    )


def test_sanity_languages_compare_and_ranking_lists():
    en = sc.check_tables(part_table(GOOD_ROWS), "/p/", "en", WORDS_EN, ORDER_EN)[1]
    nl_rows = [
        r.replace("−€0.30bn", "−€0,30 mld")
        .replace("−0.06%", "−0,06%")
        .replace("range −€0.64bn to −€3m", "bandbreedte −€0,64 mld tot −€3 mln")
        for r in GOOD_ROWS[1:2]
    ]
    nl = sc.check_tables(part_table(nl_rows), "/nl/p/", "nl", ["waarschijnlijk"], None)[1]
    assert sc.compare_languages("/p/", {k: v for k, v in en.items() if k[0] == "SWE"}, nl, "nl") == []
    nl2 = {k: [(a, b * 2, c, d) for a, b, c, d in v] for k, v in nl.items()}
    assert sc.compare_languages("/p/", {k: v for k, v in en.items() if k[0] == "SWE"}, nl2, "nl")
    # a comparison's rows and parts follow its address
    cmp = '<table class="topic"><tr data-iso="FRA"></tr><tr data-iso="DEU"></tr></table><td class="m" data-q="part:aid" data-iso="DEU"></td>'
    assert sc.check_compare_order(cmp, "/compare/germany-vs-france/", "DEU", "FRA")
    ok = '<table class="topic"><tr data-iso="DEU"></tr><tr data-iso="FRA"></tr></table><td class="m" data-q="part:aid" data-iso="DEU"></td><td class="m" data-q="part:aid" data-iso="FRA"></td>'
    assert sc.check_compare_order(ok, "/compare/germany-vs-france/", "DEU", "FRA") == []

    # the ranking pages: high to low in each group, the share and the euros with one sign
    def li(v, e):
        return f'<li><span class="r"></span><a href="/">x</a><span class="v">{v}</span><span class="e">{e}</span></li>'

    good = f'<h2 id="toward-ukraine">T · 2</h2><ol class="rk">{li("+3.7%", "+€153bn")}{li("+1.6%", "+€43.6bn")}</ol>'
    assert sc.check_rank_lists(good, "/ranking/") == []
    assert sc.check_rank_lists(good.replace("+1.6%", "+4.6%"), "/ranking/")
    assert sc.check_rank_lists(good.replace("+€43.6bn", "−€43.6bn"), "/ranking/")


def test_sanity_group_totals_are_the_rows_added_up():
    rows = "".join(
        f'<tr data-iso="{i}" data-gdp="100"><td class="m" data-q="ua" data-st="signed" data-v="{v}"><b>+{v}%</b></td></tr>'
        for i, v in (("AAA", 2.0), ("BBB", 1.0))
    )
    t = f'<div data-total="ua"><b>+1.5%</b><span>of the members\' combined GDP · <i>€3bn in support</i></span></div><table class="topic">{rows}</table>'
    assert sc.check_tables(t, "/group/g/", "en", WORDS_EN)[0] == []
    assert any("total ua" in p for p in sc.check_tables(t.replace("€3bn", "€4bn"), "/group/g/", "en", WORDS_EN)[0])


# ----- round 58b: the research files' figures, the years file and the Markdown rows -----
RESEARCH = {"revenue": {"yearly": {"2019": {"og_rev_rub": 7924.3, "share": 0.3925}}}, "frozen": {"countries": {}}}


def test_a_research_figure_must_be_the_files_value_and_written_as_it():
    ok = '<td class="n" data-rv="revenue:yearly.2019.og_rev_rub" data-v="7924.3" data-u="rub">RUB 7,924bn</td>'
    assert sc.check_research_marks(ok, "/p/", "en", RESEARCH) == []
    de = '<td class="n" data-rv="revenue:yearly.2019.og_rev_rub" data-v="7924.3" data-u="rub">7.924 Mrd. RUB</td>'
    assert sc.check_research_marks(de, "/de/p/", "de", RESEARCH) == []
    wrong_text = ok.replace("7,924", "7,294")
    assert any("written" in x for x in sc.check_research_marks(wrong_text, "/p/", "en", RESEARCH))
    wrong_value = ok.replace('data-v="7924.3"', 'data-v="7000"')
    assert any("the file says 7924.3" in x for x in sc.check_research_marks(wrong_value, "/p/", "en", RESEARCH))
    share = '<td data-rv="revenue:yearly.2019.share" data-v="0.3925" data-u="share">39,3 %</td>'
    assert sc.check_research_marks(share, "/fr/p/", "fr", RESEARCH) == []
    # no figure in the file: the page may not write one (no zero for "no public figure")
    none = '<td class="k" data-rv="frozen:countries.JPN.cbr_eur.v" data-v="null" data-u="eur">€0m</td>'
    assert any("writes one" in x for x in sc.check_research_marks(none, "/p/", "en", RESEARCH))
    ok_none = '<td class="k" data-rv="frozen:countries.JPN.cbr_eur.v" data-v="null" data-u="eur">no public figure<span class="s">estimate: about €28bn</span></td>'
    assert sc.check_research_marks(ok_none, "/p/", "en", RESEARCH) == []


def test_the_years_file_must_add_up_and_be_the_models(tmp_path):
    s = site(tmp_path, GOOD)
    m = {"countries": {"SVK": {**SVK, "yearsEur": {"2022": [0.1, -0.2, -0.05, 0.05]}}}}
    head = "iso3,country,year,year_to_date,support_ukraine_eur_bn,trade_with_russia_toward_ukraine_eur_bn,frozen_return_lost_eur_bn,net_shift_eur_bn\n"
    f = s / "downloads" / "war-balance-years.csv"
    f.write_text("﻿" + head + "SVK,Slovakia,2022,false,0.1,-0.2,0.05,-0.05\n")
    assert sc.check_downloads(s, m) == []
    f.write_text("﻿" + head + "SVK,Slovakia,2022,false,0.1,-0.2,0.05,0.3\n")
    assert any("support + trade + frozen" in x for x in sc.check_downloads(s, m))


def test_a_table_row_of_the_page_must_be_in_its_markdown(tmp_path):
    table = "<table><tr><th>Year</th><th>RUB</th></tr><tr><td>2019</td><td>RUB 7,924bn</td></tr></table>"
    s = site(tmp_path, {"country/slovakia/": GOOD["country/slovakia/"].replace("<main>", "<main>" + table)})
    md = s / "country" / "slovakia" / "index.md"
    md.write_text(md.read_text() + "\n| Year | RUB |\n| --- | --- |\n| 2019 | RUB 7,924bn |\n")
    assert sc.check_site(s, U, MODEL)["markdown"] == []
    md.write_text(md.read_text().replace("| 2019 | RUB 7,924bn |", "| 2019 | RUB 7,294bn |"))
    assert any("table row" in x or "not on the page" in x for x in sc.check_site(s, U, MODEL)["markdown"])
