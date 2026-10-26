"""Round 54 (findable pages): checks of the static pages written by pipeline/seo_pages.mjs, run by check_data.py (check 48).

Round 55: and of the topic and group pages (pipeline/seo_topics.json): every entry is written and in the sitemap, the
home page's Topics list links it, and each table's net, support and trade figures, chance words and group totals are the
model's.

Every page in sitemap.xml must exist, name itself as canonical, carry no meta refresh, keep its title to 60 characters
and its description to 155, and list hreflang alternates that list it back. Every country page must exist, and the
number and the chance word in an English country page's title must be the model's (site_numbers.mjs): a title says
"Too close to call" or "Leaning" exactly where the map does.

Round 56 (more findable pages): sitemap.xml is an index of one sitemap per language. Every country page and every
topic, group, part, year and comparison page (pipeline/seo_families.json, by the same rules as seo_families.mjs) and
the Topics page exist in every language; a country page's title in another language has the model's numbers in that
language's format and the map's own chance words in it (site/i18n/<lang>.js); in every table the net, support and trade
figures and chance words, each year's amounts and each part's amounts are the model's.
"""

from __future__ import annotations

import html
import re
from pathlib import Path
from urllib.parse import urlparse

TITLE_MAX, DESC_MAX = 60, 155
LEAN_P = 0.65  # the map's LEAN.p: at least a 65% chance is "leaning"
ESSENTIALLY_ZERO = 0.001  # the map's ESSENTIALLY_ZERO: under 0.1% of a year's GDP


def head(text: str) -> dict:
    """The parts of a page's head these checks read."""

    def meta(attr: str, name: str) -> str | None:
        m = re.search(rf'<meta {attr}="{re.escape(name)}" content="([^"]*)"', text)
        return html.unescape(m.group(1)) if m else None

    t = re.search(r"<title>([^<]*)</title>", text)
    c = re.search(r'<link rel="canonical" href="([^"]*)"', text)
    iso = re.search(r'<body data-iso="([A-Z]{3})"', text)
    return {
        "title": html.unescape(t.group(1)) if t else None,
        "description": meta("name", "description"),
        "canonical": c.group(1) if c else None,
        "alternates": dict(re.findall(r'<link rel="alternate" hreflang="([\w-]+)" href="([^"]*)"', text)),
        "refresh": bool(re.search(r'<meta http-equiv="refresh"', text, re.IGNORECASE)),
        "iso": iso.group(1) if iso else None,
    }


def sitemap_urls(text: str) -> list[str]:
    return re.findall(r"<loc>([^<]+)</loc>", text)


def site_urls(site: Path, site_url: str) -> list[str]:
    """Every page in the sitemap: sitemap.xml itself, or (round 56) the sitemaps its index lists."""
    text = (site / "sitemap.xml").read_text()
    if "<sitemapindex" not in text:
        return sitemap_urls(text)
    out = []
    for u in sitemap_urls(text):
        f = site / urlparse(u).path[len(urlparse(site_url).path) :]
        out += sitemap_urls(f.read_text()) if f.exists() else []
    return out


def file_for(site: Path, site_url: str, url: str) -> Path:
    path = urlparse(url).path
    base = urlparse(site_url).path
    rel = path[len(base) :] if path.startswith(base) else path.lstrip("/")
    return site / rel / "index.html" if rel == "" or rel.endswith("/") else site / rel


# ----- the copy's number formats (seo_i18n.mjs P and E, in every language) -----
LANGS = ["en", "uk", "de", "fr", "pl", "nl", "es"]
SEP = {"en": ",", "de": ".", "es": ".", "nl": ".", "fr": "\u202f", "pl": "\u00a0", "uk": "\u00a0"}
NB = "\u00a0"


def _round(x: float) -> int:
    return int(x + 0.5)  # as JavaScript's Math.round, for the positive amounts written here


def _group(n: int, lang: str) -> str:
    return f"{n:,}".replace(",", SEP[lang])


def fmt_pct(x: float, lang: str = "en") -> str:
    a = abs(x)
    s = f"{a:.1f}" if a >= 1 else f"{a:.2f}" if a >= 0.01 else "<0.01"
    if lang != "en":
        s = s.replace(".", ",")
    return s + (NB + "%" if lang in ("de", "fr", "es") else "%")


def fmt_eur(bn: float, lang: str = "en") -> str:
    a = abs(bn)
    if lang == "es":
        return (_group(_round(a * 10) * 100, lang) if a >= 0.1 else str(_round(a * 1000))) + NB + "M€"
    big = a >= 0.1
    if not big:
        s = str(_round(a * 1000))
    elif a >= 100:
        s = _group(_round(a), lang)
    else:
        s = (f"{a:.1f}" if a >= 1 else f"{a:.2f}").removesuffix(".0")
        if lang != "en":
            s = s.replace(".", ",")
    unit = {
        "en": ("€", "bn" if big else "m"),
        "de": ("", NB + ("Mrd." if big else "Mio.") + NB + "€"),
        "fr": ("", NB + ("Md€" if big else "M€")),
        "pl": ("", NB + ("mld" if big else "mln") + NB + "€"),
        "nl": ("€", NB + ("mld" if big else "mln")),
        "uk": ("", NB + ("млрд" if big else "млн") + NB + "€"),
    }[lang]
    return unit[0] + s + unit[1]


def level(c: dict, q: str = "net") -> str:
    """A headline number's chance level (net, ua or rus), as chanceInfo() in index.html: sure, zero, near, lean or unc."""
    if not c.get(q + "Unc"):
        return "sure"
    if abs(c[q + "Eur"]) < ESSENTIALLY_ZERO * c["gdp"]:
        return "zero"
    if c.get(q + "Near"):
        return "near"
    p = max(c[q + "Chance"], 1 - c[q + "Chance"])
    return "lean" if p >= LEAN_P else "unc"


def allowed_numbers(c: dict, lang: str = "en") -> set[str]:
    """Every way the copy may write this country's numbers (the model's are rounded to 4 places: both neighbours too)."""
    out = set()
    for k in ("net", "ua", "rus"):
        for d in (-5e-5, 0, 5e-5):
            out.add(fmt_pct(c[k] + d, lang))
            out.add(fmt_eur(c[k + "Eur"] + d, lang))
    return out


NUM = re.compile(r"€\d+(?:,\d{3})*(?:\.\d+)?(?:bn|m)|<?\d+(?:\.\d+)?%")
# round 56: the same numbers as the other languages write them (seo_i18n.mjs)
_G = r"\d+(?:[.\u202f\u00a0]\d{3})*(?:,\d+)?"
NUM_L = {
    "de": re.compile(rf"{_G}\u00a0(?:Mrd\.|Mio\.)\u00a0€|<?\d+(?:,\d+)?\u00a0%"),
    "fr": re.compile(rf"{_G}\u00a0M[d]?€|<?\d+(?:,\d+)?\u00a0%"),
    "es": re.compile(rf"{_G}\u00a0M€|<?\d+(?:,\d+)?\u00a0%"),
    "pl": re.compile(rf"{_G}\u00a0(?:mld|mln)\u00a0€|<?\d+(?:,\d+)?%"),
    "nl": re.compile(rf"€{_G}\u00a0(?:mld|mln)|<?\d+(?:,\d+)?%"),
    "uk": re.compile(rf"{_G}\u00a0(?:млрд|млн)\u00a0€|<?\d+(?:,\d+)?%"),
}


def numbers(text: str, lang: str = "en") -> list[str]:
    return (NUM if lang == "en" else NUM_L[lang]).findall(text)


def i18n_words(site: Path) -> dict[str, dict[str, str]]:
    """The map's own words in each language (site/i18n/<lang>.js), for the chance words a page must use."""
    out = {}
    for lang in LANGS:
        f = site / "i18n" / f"{lang}.js"
        if lang == "en" or not f.exists():
            continue
        d = dict(re.findall(r'^  "((?:[^"\\]|\\.)*)": "((?:[^"\\]|\\.)*)",?$', f.read_text(), re.MULTILINE))
        out[lang] = d
    return out


def lang_words(d: dict[str, str]) -> dict[str, list[str]]:
    """A level's words in a title (lean: either side), and the start of a table cell's chance words."""

    def head(k: str) -> str:
        return d.get(k, "").split("{")[0].split(" ·")[0].strip()

    return {
        "title": {
            "unc": [d.get("too close to call", "")],
            "lean": [d.get("Leaning toward Ukraine", ""), d.get("Leaning toward Russia", "")],
            "near": [d.get("near zero", "")],
            "zero": [d.get("essentially zero", "")],
            "party": [d.get("Party to the war", "")],
        },
        "cell": {
            "sure": head("very likely · {p}"),
            "lean": head("likely {side} · {p}"),
            "unc": head("too close to call · {p} {side}"),
            "near": head("near zero · {p} {side}"),
            "zero": d.get("essentially zero", ""),
        },
    }


WORDS = {
    "unc": "too close to call",
    "lean": "leaning",
    "zero": "essentially zero",
    "near": "near zero",
    "party": "party to the war",
}


def title_problems(title: str, c: dict) -> list[str]:
    """The title of an English country page against the model: its numbers, and its chance word."""
    out = [f"number {n}" for n in NUM.findall(title) if n not in allowed_numbers(c)]
    lv = "party" if c.get("party") else level(c)
    low = title.lower()
    for k, w in WORDS.items():
        if w in low and k != lv:
            out.append(f"says '{w}', the map says {lv}")
    if lv in ("unc", "lean", "party") and WORDS[lv] not in low:
        out.append(f"does not say '{WORDS[lv]}'")
    return out


# round 55: the chance words of a topic table's cell, by the model's level (chanceText() in index.html)
CHANCE_WORDS = {
    "sure": "very likely",
    "lean": "likely ",
    "unc": "too close to call",
    "near": "near zero",
    "zero": "essentially zero",
}


def title_problems_lang(title: str, c: dict, lang: str, words: dict) -> list[str]:
    """Round 56: a country page's title in another language: the model's numbers in that language's format, and the
    map's chance words in it exactly where the map says them."""
    out = [f"number {n}" for n in numbers(title, lang) if n not in allowed_numbers(c, lang)]
    lv = "party" if c.get("party") else level(c)
    low = title.lower()
    for k, ws in words["title"].items():
        if k != lv and any(w and w.lower() in low for w in ws):
            out.append(f"says {k} words, the map says {lv}")
    if lv in words["title"] and not any(w and w.lower() in low for w in words["title"][lv]):
        out.append(f"does not say the {lv} words")
    return out


def topic_path(e: dict) -> str:
    kind = e.get("kind")
    return (
        f"group/{e['slug']}/" if kind == "group" else f"compare/{e['slug']}/" if kind == "compare" else f"{e['slug']}/"
    )


def eur_pct_numbers(eur: float, gdp: float, lang: str, tol: float = 5e-5) -> set[str]:
    out = set()
    for d in (-tol, 0, tol):
        out.add(fmt_eur(eur + d, lang))
        out.add(fmt_pct(100 * (eur + d) / gdp, lang))
    return out


def numbers_for(c: dict, q: str, extra: float = 0.0, lang: str = "en") -> set[str]:
    """The ways the pages may write one of a country's headline numbers (q: net, ua or rus)."""
    out = set()
    for d in (-5e-5 - extra, 0, 5e-5 + extra):
        out.add(fmt_pct(c[q] + d, lang))
        out.add(fmt_eur(c[q + "Eur"] + d, lang))
    return out


def family_pages(model: dict, topics: list[dict], fam: dict) -> list[str]:
    """Round 56: the paths of every generated page, by the rules of seo_families.mjs, from the model."""
    cs = model["countries"]
    ranked = {e["rank"][5:] for e in topics if str(e.get("rank", "")).startswith("part:")}
    out = [topic_path(e) for e in topics]
    for p in fam["parts"]["list"]:
        if p["key"] in ranked:
            continue
        vs = [c.get("part_" + p["key"], c.get("cost_" + p["key"])) or 0 for c in cs.values()]
        vs = [v for v in vs if abs(v) >= 0.0005]
        if len(vs) >= fam["parts"]["minCountries"] and sum(abs(v) for v in vs) >= fam["parts"]["minTotal"]:
            out.append(p["slug"] + "/")
    for y in fam["years"]:
        out += [f"ukraine-aid-{y}/", f"trade-with-russia-{y}/"]
    donors = sorted(
        (i for i, c in cs.items() if not c.get("party") and not c.get("noData")), key=lambda i: -cs[i]["uaEur"]
    )
    donors = donors[: fam["compare"]["pairwiseTop"]]
    pairs = [(a, b) for a, b in fam["compare"]["pairs"] if a in cs and b in cs and a != b]
    pairs += [(donors[i], donors[j]) for i in range(len(donors)) for j in range(i + 1, len(donors))]
    seen = set()
    for a, b in pairs:
        if frozenset((a, b)) in seen:
            continue
        seen.add(frozenset((a, b)))
        out.append(f"compare/{cs[a]['slug']}-vs-{cs[b]['slug']}/")
    return out + ["topics/"]


def year_amount(c: dict, y: int, q: str) -> float | None:
    ys = c.get("yearsEur") or {}
    i = {"ua": 0, "rus": 1, "net": 2}[q]
    if str(y) not in ys:
        return None
    prev = ys.get(str(y - 1))
    return ys[str(y)][i] - (prev[i] if prev else 0)


CELL = re.compile(
    r'<td class="m" data-q="([\w:]+)"(?: data-iso="([A-Z]{3})")?(?: data-year="(\d+)")?(?: data-level="(\w*)")?>(.*?)</td>',
    re.DOTALL,
)


def check_cells(text: str, name: str, model: dict, lang: str, words: dict | None) -> list[str]:
    """Every figure cell of a page's tables against the model: headline numbers and their chance words, a year's own
    amounts, and the parts."""
    out = []
    for row_iso, tr in re.findall(r'<tr(?: data-iso="([A-Z]{3})")?>(.*?)</tr>', text, re.DOTALL):
        for q, td_iso, year, lv, td in CELL.findall(tr):
            iso = td_iso or row_iso
            c = model["countries"].get(iso) if iso else None
            if c is None:
                if iso:
                    out.append(f"{name} {iso}: not in the model")
                continue
            parts = re.findall(r"<(?:b|span)[^>]*>(.*?)</(?:b|span)>", td, re.DOTALL)
            figs = html.unescape(" ".join(parts[:2]))  # the figure and its other units (the range words come after)
            if year and q in ("net", "ua", "rus"):
                v = year_amount(c, int(year), q)
                allowed = eur_pct_numbers(v, c["gdp"], lang, 1.1e-4) if v is not None else set()
            elif q in ("net", "ua", "rus"):
                allowed = numbers_for(c, q, lang=lang)
            elif q.startswith("part:"):
                v = c.get("part_" + q[5:], c.get("cost_" + q[5:]))
                allowed = eur_pct_numbers(v, c["gdp"], lang) if v is not None else set()
            else:
                continue
            bad = [n for n in numbers(figs, lang) if n not in allowed and not n.startswith("<")]
            if bad:
                out.append(f"{name} {iso} {q}{'@' + year if year else ''}: {bad}")
            if year or q not in ("net", "ua", "rus") or c.get("party") or c.get("noData"):
                continue
            want = level(c, q)
            cw = CHANCE_WORDS[want] if lang == "en" else (words or {}).get("cell", {}).get(want)
            if lv != want or (cw and cw.lower() not in html.unescape(td).lower()):
                out.append(f"{name} {iso} {q}: chance '{lv}', the map says {want}")
    return out


def check_topics(
    site: Path,
    site_url: str,
    model: dict | None,
    topics: list[dict],
    in_sitemap: set[str],
    paths: list[str] | None = None,
    langs: list[str] = ("en",),
    words: dict | None = None,
) -> list[str]:
    """Round 55: every topic and group page of seo_topics.json is written and in the sitemap; in its tables each
    country's net, support and trade figures and their chance words are the model's, and a group's totals add up.
    Round 56: and every generated family page (paths), in every language (langs)."""
    out = []
    groups = {topic_path(e): e for e in topics if e.get("kind") == "group"}
    for path0 in paths if paths is not None else [topic_path(e) for e in topics]:
        for lang in langs:
            path = path0 if lang == "en" else f"{lang}/{path0}"
            f = site / path / "index.html"
            if not f.exists() or site_url + path not in in_sitemap:
                out.append(f"/{path} not written or not in the sitemap")
                continue
            if not model:
                continue
            text = f.read_text()
            lw = (words or {}).get(lang) if lang != "en" else None
            out += check_cells(text, "/" + path, model, lang, lw)
            e = groups.get(path0)
            if not e:
                continue
            members = [model["countries"][i] for i in e.get("members", []) if i in model["countries"]]
            ranked = [c for c in members if not c.get("party") and not c.get("noData")]
            for q, td in re.findall(r'<div data-total="(net|ua|rus)">(.*?)</div>', text, re.DOTALL):
                eur = sum(c[q + "Eur"] for c in ranked)
                gdp = sum(c["gdp"] for c in ranked)
                tol = 5e-5 * len(ranked)
                allowed = {fmt_pct(100 * (eur + d) / gdp, lang) for d in (-tol, 0, tol)} | {
                    fmt_eur(eur + d, lang) for d in (-tol, 0, tol)
                }
                bad = [n for n in numbers(html.unescape(td), lang) if n not in allowed]
                if bad:
                    out.append(f"/{path} total {q}: {bad}")
    return out


def check_site(
    site: Path, site_url: str, model: dict | None, topics: list[dict] | None = None, families: dict | None = None
) -> dict[str, list[str]]:
    """All problems, by check. model: site_numbers.mjs output (None: the title numbers are not checked); topics: the
    entries of seo_topics.json (round 55; None: not checked); families: pipeline/seo_families.json (round 56: every
    family page and every country page in every language; None: English only)."""
    p: dict[str, list[str]] = {
        "missing": [],
        "length": [],
        "title": [],
        "refresh": [],
        "canonical": [],
        "hreflang": [],
        "az": [],
        "topics": [],
    }
    smap = site / "sitemap.xml"
    if not smap.exists():
        p["missing"].append("sitemap.xml")
        return p
    urls = site_urls(site, site_url)
    langs = LANGS if families is not None else ["en"]
    words = {lang: lang_words(d) for lang, d in i18n_words(site).items()}
    heads: dict[str, dict] = {}
    for u in urls:
        f = file_for(site, site_url, u)
        if not f.exists():
            p["missing"].append(urlparse(u).path)
            continue
        heads[u] = head(f.read_text())
    if model:
        for iso, c in model["countries"].items():
            for lang in langs:
                pre = "" if lang == "en" else lang + "/"
                u = f"{site_url}{pre}country/{c['slug']}/"
                if u not in heads:
                    p["missing"].append(f"{pre}country/{c['slug']}/ ({iso})")
    for u, h in heads.items():
        name = urlparse(u).path
        if not h["title"] or len(h["title"]) > TITLE_MAX:
            p["length"].append(f"{name} title {len(h['title'] or '')}")
        if not h["description"] or len(h["description"]) > DESC_MAX:
            p["length"].append(f"{name} description {len(h['description'] or '')}")
        if h["refresh"]:
            p["refresh"].append(name)
        if h["canonical"] != u:
            p["canonical"].append(f"{name} -> {h['canonical']}")
        alts = h["alternates"]
        if alts:
            if "x-default" not in alts or u not in alts.values():
                p["hreflang"].append(f"{name}: no x-default or no self")
            for lang, v in alts.items():
                if lang == "x-default":
                    continue
                other = heads.get(v)
                if other is None:
                    p["hreflang"].append(f"{name} -> {lang} {urlparse(v).path} not in the sitemap")
                elif other["alternates"] != alts:
                    p["hreflang"].append(f"{name} <-> {urlparse(v).path} not reciprocal")
        if model and h["iso"] and "/country/" in name:
            c = model["countries"].get(h["iso"])
            lm = re.match(r"^/(\w\w)/country/", name)
            if c and not c.get("noData") and not lm:
                p["title"] += [f"{name}: {x}" for x in title_problems(h["title"] or "", c)]
            elif c and not c.get("noData") and lm and lm.group(1) in words:
                p["title"] += [
                    f"{name}: {x}" for x in title_problems_lang(h["title"] or "", c, lm.group(1), words[lm.group(1)])
                ]
    if topics is not None:
        paths = family_pages(model, topics, families) if (families is not None and model) else None
        p["topics"] = check_topics(site, site_url, model, topics, set(urls), paths, langs, words)
    idx = (site / "index.html").read_text()
    if model:
        p["az"] = [c["slug"] for c in model["countries"].values() if f'href="/country/{c["slug"]}/"' not in idx]
    if topics:
        p["az"] += [f"topic {topic_path(e)}" for e in topics if f'href="/{topic_path(e)}"' not in idx]
    return p
