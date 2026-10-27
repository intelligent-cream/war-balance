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

Round 57: the wording guard (wording_problems, check_wording): the hand-written words of the pages (seo_topics.json,
seo_families.json and the one translation table seo_i18n.mjs, in all seven languages) hold no claim that can go stale
outside a placeholder or condition. Its rules and its allowlist are documented at ALLOW below.
"""

from __future__ import annotations

import html
import json
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
    i = {"ua": 0, "rus": 1, "net": 2, "frozen": 3}[q]
    if str(y) not in ys or len(ys[str(y)]) <= i:
        return None
    prev = ys.get(str(y - 1))
    return ys[str(y)][i] - (prev[i] if prev else 0)


CELL = re.compile(
    r'<td class="m" data-q="([\w:]+)"(?: data-iso="([A-Z]{3})")?(?: data-year="(\d+)")?(?: data-level="(\w*)")?[^>]*>(.*?)</td>',
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


# ----- round 57b (richer country pages): every figure a country page's sections write, against the model -----
# seo_country.mjs marks each figure it writes with its format (data-f) and the model quantity it shows (data-k, from
# site_numbers.mjs: a headline amount, a part, a cost, a year's own amount, its trade before and after, loans, money
# flowing back, a rank by the map's rule); here each is worked out again from the model and written the way the page's
# language writes it. The neighbours' and similar countries' tables use the topic tables' cells (check_cells), the
# visible questions must be the JSON-LD FAQPage word for word, and every source (and every link in an answer) must be
# a working link: a well-formed http(s) address, or a place on the page or the site that exists.
FIG = re.compile(r'<span data-f="(\w+)" data-k="([\w:.\-]+)"(?: data-iso="([A-Z]{3})")?>(.*?)</span>')


def fmt_pct_int(x: float, lang: str = "en") -> str:
    return str(_round(abs(x))) + (NB + "%" if lang in ("de", "fr", "es") else "%")


def fmt_int(n: float, lang: str = "en") -> str:
    return _group(_round(abs(n)), lang)


def map_ranks(model: dict, members: set[str] | None = None) -> dict[str, tuple[int, int]]:
    """The map's ranking rule (views.js renderRanking): a number only for a very likely country, among economies of
    €5bn and more that are not a party to the war and have data; toward Ukraine from the top, toward Russia from the
    bottom. members: a group's countries (None: every country)."""
    rows = [
        (iso, c)
        for iso, c in model["countries"].items()
        if (members is None or iso in members)
        and not c.get("party")
        and not c.get("noData")
        and c["gdp"] >= 5
        and level(c) == "sure"
    ]
    out = {}
    for side in (1, -1):
        same = sorted((r for r in rows if (r[1]["net"] >= 0) == (side == 1)), key=lambda r: -r[1]["net"])
        for i, (iso, _) in enumerate(same):
            out[iso] = (i + 1 if side == 1 else len(same) - i, len(same))
    return out


def _sg(v: float) -> str:
    return "+" if v >= 0 else "\u2212"


def fig_allowed(f: str, k: str, c: dict, lang: str, ranks: dict, iso: str) -> set[str] | None:
    """The ways a marked figure may be written (None: the model has no such quantity)."""
    dyn = c.get("dyn") or {}
    if k.startswith(("rank:", "of:")):
        r = ranks.get(k.split(":", 1)[1], {}).get(iso)
        return {str(r[0] if k.startswith("rank:") else r[1])} if r else set()
    tol = 5e-5
    if k in ("tbc", "tsc"):
        a, b = dyn.get(k[:2] + "0"), dyn.get(k[:2] + "1")
        if not a or b is None:
            return None
        tol = 1e-9  # unrounded, as in data.json
        vals = [100 * ((b + db) / (a + da) - 1) for da in (-tol, 0, tol) for db in (-tol, 0, tol)]
        return {_sg(v) + fmt_pct_int(v, lang) for v in vals}
    m = re.fullmatch(r"y(\d{4}):(ua|rus|net)", k)
    if m:
        v, tol = year_amount(c, int(m.group(1)), m.group(2)), 1.1e-4
    elif k in c:
        v = c[k]
    elif k in dyn:
        v = dyn[k]
    else:
        return None
    if v is None:
        return None
    vals = [v + tol * i / 10 for i in range(-10, 11)]  # the model's figures are rounded: every value they may stand for
    gdp = c["gdp"]
    fmt = {
        "e": lambda x: fmt_eur(x, lang),
        "s": lambda x: _sg(x) + fmt_eur(x, lang),
        "m": lambda x: ("\u2212" if x < 0 else "") + fmt_eur(x, lang),
        "p": lambda x: fmt_pct(100 * x / gdp, lang),
        "ps": lambda x: _sg(x) + fmt_pct(100 * x / gdp, lang),
        "q": lambda x: fmt_pct(100 * x, lang),
        "n": lambda x: fmt_int(x, lang),
    }.get(f)
    if fmt is None:
        return set()
    out = {fmt(x) for x in vals}
    if f in ("p", "ps") and k.endswith("Eur") and k[:-3] in c:  # the model's own share of GDP, too
        out |= {(_sg(c[k[:-3]]) if f == "ps" else "") + fmt_pct(c[k[:-3]] + d, lang) for d in (-tol, 0, tol)}
    return out


def _plain(h: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", h))).strip()


def link_ok(href: str, text: str, site: Path) -> bool:
    """A link that works: a well-formed http(s) address, a place on this page, or a page of this site."""
    h = html.unescape(href)
    if h.startswith("#"):
        return f'id="{h[1:]}"' in text
    if h.startswith("/"):
        path = h.split("#")[0].split("?")[0]
        f = site / path.lstrip("/")
        return (f / "index.html").exists() if path.endswith("/") else f.exists()
    u = urlparse(h)
    return u.scheme in ("http", "https") and bool(u.netloc) and " " not in h


def check_dyn(text: str, name: str, iso: str, model: dict, lang: str, ranks: dict, site: Path) -> list[str]:
    """A country page's sections and questions (round 57b): figures, questions against the JSON-LD, and links."""
    out = []
    for f, k, fi, txt in FIG.findall(text):
        c = model["countries"].get(fi or iso)
        allowed = fig_allowed(f, k, c, lang, ranks, fi or iso) if c else None
        if allowed is None:
            out.append(f"{name}: {k} is not in the model")
        elif html.unescape(txt) not in allowed:
            out.append(f"{name}: {k} written {html.unescape(txt)!r}, the model says {sorted(allowed)[:2]}")
    sec = re.search(r'<section class="faq" id="faq"><h2>[^<]*</h2>(.*?)</section>', text, re.DOTALL)
    seen = (
        [(_plain(q), _plain(a)) for q, a in re.findall(r"<h3>(.*?)</h3><p>(.*?)</p>", sec.group(1), re.DOTALL)]
        if sec
        else []
    )
    ld = []
    for blk in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.DOTALL):
        if '"FAQPage"' in blk:
            j = json.loads(blk)
            ld = [(x["name"], re.sub(r"\s+", " ", x["acceptedAnswer"]["text"]).strip()) for x in j["mainEntity"]]
    if seen != ld:
        out.append(f"{name}: the questions on the page and in the JSON-LD differ")
    for ul in re.findall(r'<ul class="src">(.*?)</ul>', text, re.DOTALL):
        for li in re.findall(r"<li[^>]*>(.*?)</li>", ul, re.DOTALL):
            a = re.search(r'<a href="([^"]*)"', li)
            if not a:
                out.append(f"{name}: a source without a link: {_plain(li)[:60]}")
            elif not link_ok(a.group(1), text, site):
                out.append(f"{name}: a source link that does not work: {a.group(1)[:80]}")
    if sec:
        for href in re.findall(r'<a href="([^"]*)"', sec.group(1)):
            if not link_ok(href, text, site):
                out.append(f"{name}: a link in its questions that does not work: {href[:80]}")
    return out


def check_site(
    site: Path,
    site_url: str,
    model: dict | None,
    topics: list[dict] | None = None,
    families: dict | None = None,
    phrases: dict[str, dict[str, str]] | None = None,
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
        "dyn": [],
        "cite": [],
        "markdown": [],
        "llms": [],
        "downloads": [],
        "sanity": [],
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
    # round 57b: every country page's sections and questions, in every language
    if model:
        ranks = {"all": map_ranks(model)}
        for e in topics or []:
            if e.get("kind") == "group" and e.get("members"):
                ranks[e["slug"]] = map_ranks(model, set(e["members"]))
        for iso, c in model["countries"].items():
            for lang in langs:
                pre = "" if lang == "en" else lang + "/"
                f = site / pre / "country" / c["slug"] / "index.html"
                if not f.exists():
                    continue
                text = f.read_text()
                name = f"/{pre}country/{c['slug']}/"
                p["dyn"] += check_dyn(text, name, iso, model, lang, ranks, site)
                p["dyn"] += check_cells(text, name, model, lang, None if lang == "en" else words.get(lang))
    if topics is not None:
        paths = family_pages(model, topics, families) if (families is not None and model) else None
        p["topics"] = check_topics(site, site_url, model, topics, set(urls), paths, langs, words)
        # round 58: every table's own sanity, in every language (phrases: the order words, seo_i18n.mjs)
        p["sanity"] = check_sanity(
            site, model, paths if paths is not None else [topic_path(e) for e in topics], phrases
        )
        # round 58b: and the figures and pages from the research files (seo_families.json research)
        if families is not None and families.get("research"):
            p["sanity"] += check_research(site, site.parent, families["research"], model, langs)
    # round 58: every page's cite line and Markdown version; llms.txt; the downloads
    p["cite"], p["markdown"] = check_cite_markdown(site, site_url, urls)
    p["llms"] = check_llms(site, site_url, model) if model else []
    p["downloads"] = check_downloads(site, model)
    idx = (site / "index.html").read_text()
    if model:
        p["az"] = [c["slug"] for c in model["countries"].values() if f'href="/country/{c["slug"]}/"' not in idx]
    if topics:
        p["az"] += [f"topic {topic_path(e)}" for e in topics if f'href="/{topic_path(e)}"' not in idx]
    return p


# ----- round 58: the cite line, the Markdown versions, llms.txt and the downloads -----
_MAIN = re.compile(r"<main[^>]*>([\s\S]*?)</main>")
_DIGITS = re.compile(r"\d(?:[\d.,\u00a0\u202f]*\d)?")


def _figs(text: str) -> set[str]:
    """The digit groups a text writes, with their separators taken out ("€1,234.5bn" -> "12345")."""
    return {re.sub(r"\D", "", x) for x in _DIGITS.findall(text)}


def check_cite_markdown(site: Path, site_url: str, urls: list[str]) -> tuple[list[str], list[str]]:
    """Every page in the sitemap has its cite line (with its own address) and links its Markdown version, which exists,
    has the same cite line and writes no figure the page does not (seo_markdown.mjs)."""
    cite, md = [], []
    for u in urls:
        f = file_for(site, site_url, u)
        name = urlparse(u).path
        # the map's own home pages (one per language) are the app, not generated pages
        if not f.exists() or f.name != "index.html" or re.fullmatch(r"/(\w\w/)?", name):
            continue
        text = f.read_text()
        m = re.search(r'<p class="cite">([^<]*)</p>', text)
        if not m or html.unescape(m.group(1)).split(", ")[-1] != u:
            cite.append(name)
        href = re.search(r'<link rel="alternate" type="text/markdown" href="([^"]+)">', text)
        mf = f.parent / "index.md"
        if not href or href.group(1) != name + "index.md" or not mf.exists():
            md.append(f"{name}: no Markdown version")
            continue
        mtext = mf.read_text()
        if m and html.unescape(m.group(1)) not in mtext.replace("\\", ""):
            md.append(f"{name}index.md: no cite line")
        main = _MAIN.search(text)
        page_figs = _figs(html.unescape(re.sub(r"<[^>]+>", " ", main.group(1) if main else text)))
        md_plain = re.sub(r"(?m)^\d+\. ", "", re.sub(r"\]\([^)]*\)", "]", mtext)).replace("\\", "")
        extra = sorted(_figs(md_plain) - page_figs)
        if extra:
            md.append(f"{name}index.md: figures not on the page {extra[:3]}")
        # round 58b: and every table row of the page is a row of the Markdown version, with the same figures in the
        # same order (a row's digit groups: the Markdown cannot contradict the page row by row)
        if main and "<table" in main.group(1):
            md_rows = {tuple(_DIGITS.findall(ln)) for ln in md_plain.splitlines() if ln.startswith("|")}
            for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", main.group(1), re.DOTALL):
                cells = re.sub(r"<(td|th)[^>]*>", " ", re.sub(r"</t[dh]>", " | ", tr))
                row = tuple(_DIGITS.findall(html.unescape(re.sub(r"<[^>]+>", " ", cells))))
                if row and row not in md_rows:
                    md.append(f"{name}index.md: a table row of the page is not in it {list(row)[:4]}")
                    break
    return cite, md


def check_llms(site: Path, site_url: str, model: dict) -> list[str]:
    """llms.txt and llms-full.txt exist; each country's line in llms-full.txt has the model's net (% of GDP) and
    support for Ukraine (EUR) and links its page."""
    out = []
    short, full = site / "llms.txt", site / "llms-full.txt"
    if not short.exists() or not full.exists():
        return ["llms.txt or llms-full.txt missing"]
    if "(https://" not in short.read_text():
        out.append("llms.txt: no links")
    lines = {}
    for ln in full.read_text().splitlines():
        m = re.search(r"\| (https://\S+/country/([\w-]+)/)$", ln)
        if m:
            lines[m.group(2)] = ln
    for iso, c in model["countries"].items():
        ln = lines.get(c["slug"])
        if ln is None:
            out.append(f"llms-full.txt: no line for {iso}")
            continue
        if c.get("noData"):
            continue
        sg = "+" if c["netEur"] >= 0 else "−"
        nets = {sg + fmt_pct(c["net"] + d) for d in (-5e-5, 0, 5e-5)}
        uas = {fmt_eur(c["uaEur"] + d) for d in (-5e-5, 0, 5e-5)}
        if not any(f"net {n} " in ln for n in nets):
            out.append(f"llms-full.txt {iso}: net is not the model's {min(nets)}")
        if not any(f"support for Ukraine {x} " in ln for x in uas):
            out.append(f"llms-full.txt {iso}: support is not the model's {min(uas)}")
    return out


def check_downloads(site: Path, model: dict | None) -> list[str]:
    """The downloads page's links resolve, and the countries CSV (the map's own export) has the model's net, support
    and trade figures for every country."""
    import csv
    import io

    out = []
    page = site / "downloads" / "index.html"
    if not page.exists():
        return ["downloads/ missing"]
    for href in re.findall(r'href="(/(?:downloads/[\w.-]+|data\.json))"', page.read_text()):
        if not (site / href.lstrip("/")).exists():
            out.append(f"downloads: {href} does not resolve")
    f = site / "downloads" / "war-balance-countries.csv"
    if not f.exists() or not model:
        return out + ([] if f.exists() else ["war-balance-countries.csv missing"])
    rows = {r["iso3"]: r for r in csv.DictReader(io.StringIO(f.read_text().lstrip("\ufeff")))}
    cols = {
        "netEur": "net_shift_eur_bn",
        "uaEur": "support_ukraine_eur_bn",
        "rusEur": "trade_with_russia_toward_ukraine_eur_bn",
    }
    for iso, c in model["countries"].items():
        r = rows.get(iso)
        if r is None:
            out.append(f"countries CSV: no row for {iso}")
            continue
        for k, col in cols.items():
            v = float(r[col] or 0)
            if abs(v - c[k]) > 2e-4 + 1e-6 * abs(c[k]):
                out.append(f"countries CSV {iso} {col}: {v}, the model says {c[k]}")
    # round 58b: the years file: each row adds up (support + trade + the frozen-money return = the net), and each year's
    # own amounts are the model's
    fy = site / "downloads" / "war-balance-years.csv"
    if fy.exists():
        cols = {
            "ua": "support_ukraine_eur_bn",
            "rus": "trade_with_russia_toward_ukraine_eur_bn",
            "frozen": "frozen_return_lost_eur_bn",
            "net": "net_shift_eur_bn",
        }
        for r in csv.DictReader(io.StringIO(fy.read_text().lstrip("\ufeff"))):
            if not all(col in r for col in cols.values()):
                out.append("years CSV: a column is missing")
                break
            v = {q: float(r[col] or 0) for q, col in cols.items()}
            if abs(v["ua"] + v["rus"] + v["frozen"] - v["net"]) > 5e-4:
                out.append(
                    f"years CSV {r['iso3']} {r['year']}: support + trade + frozen = {v['ua'] + v['rus'] + v['frozen']:+.4f}, the net {v['net']:+.4f}"
                )
            c = model["countries"].get(r["iso3"])
            for q in ("ua", "rus", "net", "frozen"):
                want = year_amount(c, int(r["year"]), q) if c else None
                if want is not None and abs(v[q] - want) > 2e-4:
                    out.append(f"years CSV {r['iso3']} {r['year']} {q}: {v[q]}, the model says {want:.4f}")
    return out


# ----- round 57: the wording guard (owner: "fail if any hand-written text ... contains a claim that can go stale") -----
# Every text field of every entry of pipeline/seo_topics.json and pipeline/seo_families.json, and every phrase of the one
# translation table pipeline/seo_i18n.mjs (and any left in seo_templates.mjs), in all seven languages, is read here.
# Outside a placeholder or condition it may not hold:
#   number      a digit or a number word (two, half, twice, million ...)
#   ranking     most, largest, first, top, only, leading ... (a question may ask it: "Who gives the most?")
#   comparison  more than, less than, fewer, exceeds, overtook, and (round 57b) smaller, bigger, higher, lower,
#               below, above, exceed, far more ... (a question may ask it; inside a condition's words they are chosen by
#               the data)
#   direction   toward Ukraine / Russia, helps, supported, sides with ... where it states a result. Allowed in a
#               question (a sentence ending in "?"), inside {q:...}, or where the sentence names both sides ("toward
#               Ukraine or Russia", "+ toward Ukraine, − toward Russia")
#   certainty   very likely, likely, too close to call, essentially zero, clearly ... and the map's own chance words in
#               every language (site/i18n/<lang>.js): those come from the map, as {word:...} or a figure's words
#   trend       rose, fell, grew, increased, doubled, surged ... (a question may ask it)
#   absolute    always, never, no country, all countries, none
# A question (or {q:...}) states no result: in it the direction, comparison, ranking and trend rules are not read.
# Words that depend on the data are written as {if:COND|...|...} (seo_i18n.mjs fmt): inside a condition's words the
# number, certainty and absolute rules still hold (the direction, comparison, ranking and trend words are the point of
# the condition, chosen by the data); a {placeholder} is the data itself and is not read.
# The allowlist is ALLOW (named terms, each with its reason) and years: a year (2014 ... 2029) on its own is a date, and
# a month with its year only for the war's start (February 2022, March 2022) or a named fixed fact in ALLOW. Group sizes
# ("27 members") are placeholders ({members}, {n}); sort phrases are neutral ("sorted by euros", "high to low").
ALLOW = {
    "G7": "the group's name",
    "CC BY 4.0": "the data's licence",
    "21 January 2026": "the date the EU ban on fuel refined from Russian crude took effect: a fixed historical fact",
    # round 57b: defined terms of the method that hold a positional word, not a comparison of countries
    "above a normal return": "the method's definition of what Russia keeps: taxes and profit beyond a normal return",
    "above a no-war normal": "the same definition, against the world without the war",
    "below Brent": "the definition of the discount on Russian crude since March 2022: a fixed historical fact",
    # round 58 (explainers): the dates of the price cap's rules, fixed historical facts. The cap on oil products took
    # effect in February 2023 (with the EU embargo on them); the EU, the UK and others cut the cap on crude from
    # September 2025 (the cap on crude since December 2022 needs no entry: the war's first year is allowed)
    **{
        t: "the price cap's own dates (round 58 explainer): fixed historical facts"
        for t in (
            "February 2023 September 2025 Februar 2023 September 2025 février 2023 septembre 2025 "
            "febrero de 2023|septiembre de 2025|lutego 2023|września 2025|februari 2023|september 2025|"
            "лютого 2023|вересня 2025"
        )
        .replace("2023 ", "2023|")
        .replace("2025 ", "2025|")
        .split("|")
    },
}
YEAR = r"(?<!\d)(?:201[4-9]|202\d)(?!\d)"
WAR_START_YEAR = "2022"
MONTHS = {
    "en": "january february march april may june july august september october november december",
    "de": "januar februar märz april mai juni juli august september oktober november dezember",
    "fr": "janvier février mars avril mai juin juillet août septembre octobre novembre décembre",
    "es": "enero febrero marzo abril mayo junio julio agosto septiembre octubre noviembre diciembre",
    "pl": "stycznia lutego marca kwietnia maja czerwca lipca sierpnia września października listopada grudnia "
    "styczeń luty marzec kwiecień maj czerwiec lipiec sierpień wrzesień październik listopad grudzień",
    "nl": "januari februari maart april mei juni juli augustus september oktober november december",
    "uk": "січня лютого березня квітня травня червня липня серпня вересня жовтня листопада грудня "
    "січень лютий березень квітень травень червень липень серпень вересень жовтень листопад грудень",
}
_W = {  # the words of each rule, by language (the map's own chance words are added from site/i18n)
    "number": {
        "en": "two three four five six seven eight nine ten eleven twelve twenty thirty forty fifty hundred hundreds "
        "thousand thousands million millions billion billions trillion dozen dozens half twice double triple quadruple "
        "|three times|four times|ten times",
        "de": "zwei drei vier fünf sechs sieben acht neun zehn elf zwölf zwanzig dreißig fünfzig hundert tausend "
        "Million Millionen Milliarde Milliarden Hälfte halb doppelt dreifach zweimal dreimal",
        "fr": "deux trois quatre cinq six sept huit neuf dix onze douze vingt trente cinquante cent mille million "
        "millions milliard milliards moitié double triple |deux fois|trois fois",
        "es": "dos tres cuatro cinco seis siete ocho nueve diez once doce veinte treinta cincuenta cien mil millón "
        "millones mitad doble triple |dos veces|tres veces",
        "pl": "dwa dwie dwóch trzy trzech cztery czterech pięć sześć siedem osiem dziewięć dziesięć dwadzieścia sto "
        "tysiąc tysiące milion miliony miliard miliardy połowa połowę dwukrotnie trzykrotnie podwójnie",
        "nl": "twee drie vier vijf zes zeven acht negen tien elf twaalf twintig dertig vijftig honderd duizend miljoen "
        "miljard helft dubbel drievoudig tweemaal driemaal",
        "uk": "два дві три чотири п'ять шість сім вісім дев'ять десять двадцять сто тисяча тисячі мільйон мільйони "
        "мільярд мільярди половина половину вдвічі втричі двічі",
    },
    "ranking": {
        "en": "most least largest biggest smallest highest lowest top first last leading lead leads only ahead behind "
        "|followed by",
        "de": "meisten größte größten größter kleinste kleinsten höchste höchsten niedrigste erste ersten erster zuerst "
        "letzte letzten führend führt nur vorn vorne Spitze |am meisten|an der Spitze",
        "fr": "premier première premiers d'abord dernier dernière seul seule seuls seulement devant derrière "
        "|le plus|la plus|les plus|le moins|en tête|plus grand|plus grands",
        "es": "mayor mayores menor menores primero primera primeros último última últimos solo sólo únicamente "
        "encabeza encabezan delante detrás |el más|la más|los más|más grande",
        "pl": "najwięcej najmniej największy największa największe największych najmniejszy najwyższy najniższy "
        "pierwszy pierwsza pierwsze najpierw ostatni ostatnia tylko jedynie |na czele",
        "nl": "meest meeste minst minste grootste kleinste hoogste laagste eerste eerst laatste bovenaan alleen enkel "
        "voorop |het meest",
        "uk": "найбільше найбільш найменше найбільший найбільша найбільші найменший найвищий найнижчий перший перша "
        "перше спершу останній остання лише тільки попереду позаду",
    },
    # round 57b: and the comparative and positional words (smaller, higher, below, above, exceed, far more ...)
    "comparison": {
        "en": "fewer exceeds exceeded outpaced outpaces overtook overtaken smaller bigger larger higher lower below above "
        "exceed exceeding |more than|less than|far more|far less",
        "de": "übertrifft übertraf überholte überholt kleiner kleinere kleineren größer größere größeren höher höhere "
        "höheren niedriger niedrigere niedrigeren übersteigt überstieg überschreitet unterhalb oberhalb "
        "|mehr als|weniger als|weit mehr|weit weniger|unter null|über null",
        "fr": "dépasse dépassé dépassent devancé excède excèdent inférieur inférieure inférieurs supérieur supérieure "
        "supérieurs au-dessus au-dessous |plus que|moins que|bien plus|beaucoup plus|bien moins|plus petit|plus petite"
        "|plus élevé|plus élevée|plus bas|plus basse|en dessous|en deçà",
        "es": "supera superó adelantó excede exceden inferior inferiores superior superiores "
        "|más que|menos que|más de lo que|menos de lo que|mucho más|mucho menos|más pequeño|más pequeña|más alto"
        "|más alta|más bajo|más baja|por encima|por debajo",
        "pl": "przewyższa przewyższył wyprzedził wyprzedziła prześcignął przekracza przekroczył przekroczyła mniejszy "
        "mniejsza mniejsze większy większa większe wyższy wyższa wyższe niższy niższa niższe powyżej poniżej "
        "|więcej niż|mniej niż|znacznie więcej|dużo więcej|znacznie mniej",
        "nl": "overtreft overtrof ingehaald overschrijdt overschreed kleiner groter hoger lager "
        "|meer dan|minder dan|veel meer|veel minder|boven nul|onder nul",
        "uk": "перевищує перевищила перевищив випередив випередила менший менша більший більша вищий вища нижчий нижча "
        "|більше ніж|більше, ніж|менше ніж|менше, ніж|набагато більше|значно більше|набагато менше|значно менше"
        "|вище нуля|нижче нуля",
    },
    # direction: U and R name a side, V is a verb; a sentence naming both sides (or asking) is neutral
    "dirU": {
        "en": "|toward Ukraine|towards Ukraine|on Ukraine's side",
        "de": "|Richtung Ukraine|zugunsten der Ukraine|auf der Seite der Ukraine",
        "fr": "|vers l'Ukraine|du côté de l'Ukraine|aux côtés de l'Ukraine",
        "es": "|hacia Ucrania|del lado de Ucrania",
        "pl": "|na rzecz Ukrainy|w stronę Ukrainy|po stronie Ukrainy",
        "nl": "|richting Oekraïne|aan de kant van Oekraïne",
        "uk": "|на користь України|на бік України|на боці України",
    },
    "dirR": {
        "en": "|toward Russia|towards Russia|on Russia's side",
        "de": "|Richtung Russland|zugunsten Russlands|auf Russlands Seite|auf der Seite Russlands",
        "fr": "|vers la Russie|du côté de la Russie|aux côtés de la Russie",
        "es": "|hacia Rusia|del lado de Rusia",
        "pl": "|na rzecz Rosji|w stronę Rosji|po stronie Rosji",
        "nl": "|richting Rusland|aan de kant van Rusland",
        "uk": "|на користь Росії|на бік Росії|на боці Росії",
    },
    "dirV": {
        "en": "helps helped helping supports supported |help Russia|help Ukraine|sides with|sided with",
        "de": "hilft helfen half halfen unterstützt unterstützte unterstützten",
        "fr": "soutient soutiennent |a soutenu|ont soutenu|aide la Russie|aident la Russie|aide l'Ukraine|aident l'Ukraine",
        "es": "apoya apoyan apoyó apoyaron |ayuda a Rusia|ayudan a Rusia",
        "pl": "pomaga pomagają pomógł pomogła wsparł wsparła wsparły wsparli wspiera",
        "nl": "helpt helpen hielp steunt steunde steunden",
        "uk": "допомагає допомагають допомогла допоміг підтримала підтримали підтримав підтримує",
    },
    "certainty": {
        "en": "certain certainly likely unlikely clearly definitely surely probably undoubtedly leaning "
        "|very likely|too close to call|essentially zero|near zero",
        "de": "eindeutig sicherlich zweifellos vermutlich",
        "fr": "clairement certainement probablement |sans doute",
        "es": "claramente seguramente probablemente |sin duda",
        "pl": "wyraźnie zapewne |na pewno|bez wątpienia",
        "nl": "duidelijk zeker waarschijnlijk vermoedelijk",
        "uk": "очевидно напевно безумовно ймовірно",
    },
    "trend": {
        "en": "rose risen fell fallen grew grown dropped increased decreased doubled tripled surged soared plunged declined",
        "de": "stieg gestiegen fiel gefallen wuchs gewachsen sank gesunken verdoppelt verdreifacht |nahm zu|nahm ab",
        "fr": "augmenté baissé chuté grimpé doublé triplé hausse hausses",
        "es": "subió subieron cayó cayeron creció crecieron aumentó aumentaron disminuyó |se duplicó",
        "pl": "wzrósł wzrosła wzrosły wzrosło spadł spadła spadły spadło podwoił podwoiła",
        "nl": "steeg stegen gestegen daalde daalden gedaald groeide verdubbeld stijging",
        "uk": "зріс зросла зросли зросло впав впала впали знизився знизилася подвоївся подвоїлася",
    },
    "absolute": {
        "en": "always never none |no country|all countries",
        "de": "immer nie niemals |kein Land|alle Länder",
        "fr": "toujours jamais |aucun pays|tous les pays",
        "es": "siempre nunca ninguno |ningún país|todos los países",
        "pl": "zawsze nigdy |żaden kraj|wszystkie kraje|wszystkich krajów",
        "nl": "altijd nooit |geen land|alle landen",
        "uk": "завжди ніколи |жодна країна|усі країни|всі країни",
    },
}
# "Ukraine or Russia": a sentence that names both sides as a choice is neutral
EITHER = {
    "en": r"ukraine\s+or\s+(?:toward\s+)?russia|russia\s+or\s+ukraine",
    "de": r"ukraine\s+oder\s+russland|russland\s+oder\s+(?:der\s+)?ukraine",
    "fr": r"ukraine\s+ou\s+(?:vers\s+)?la\s+russie|russie\s+ou\s+l'ukraine",
    "es": r"ucrania\s+o\s+(?:hacia\s+)?rusia|rusia\s+o\s+ucrania",
    "pl": r"ukrain\w*\s+(?:czy|lub)\s+(?:do\s+)?ros\w*|ros\w*\s+(?:czy|lub)\s+ukrain\w*",
    "nl": r"oekraïne\s+of\s+rusland|rusland\s+of\s+oekraïne",
    "uk": r"україн\w*\s+(?:чи|або)\s+(?:до\s+)?рос\w*|рос\w*\s+(?:чи|або)\s+україн\w*",
}
# the map's chance words (site/i18n/<lang>.js), by their English keys; the words of a few mean something else too
SITE_CHANCE_KEYS = [
    "very likely · {p}",
    "likely {side} · {p}",
    "too close to call",
    "near zero",
    "essentially zero",
    "leaning",
    "Leaning",
    "Leaning toward Ukraine",
    "Leaning toward Russia",
    "certain",
    "Certain",
]
HOMOGRAPHS = {
    "es": {"seguro", "segura"}
}  # Spanish "seguro" is also "insurance" ("Transporte y seguro del petróleo ruso")
RELAXED = {
    "direction",
    "comparison",
    "ranking",
    "trend",
}  # not read in a question, in {q:...} or in a condition's words


def _terms(spec: str) -> list[str]:
    words, _, phrases = spec.partition("|")
    return (
        [w for w in words.split()] + [p for p in ("|" + phrases).split("|") if p.strip()] if phrases else spec.split()
    )


def _rx(term: str, inflect: bool = False) -> re.Pattern:
    body = r"\s+".join(re.escape(w) for w in term.split())
    return re.compile(rf"(?<![\w'-]){body}{r'\w{0,2}' if inflect else ''}(?![\w'-])", re.IGNORECASE)


def chance_words(site: Path) -> dict[str, list[str]]:
    """The map's own chance words in each language (site/i18n/<lang>.js), with English's keys."""
    out = {"en": []}
    for lang, d in i18n_words(site).items():
        ws = []
        for k in SITE_CHANCE_KEYS:
            w = re.sub(r"\{\w+\}", "", d.get(k, "")).split("·")[0].replace("’", "'").strip(" ,")
            if w and w.lower() not in HOMOGRAPHS.get(lang, set()):
                ws.append(w)
        out[lang] = sorted(set(ws))
    return out


def _rules(lang: str, site_words: list[str]) -> dict[str, list[tuple[str, re.Pattern]]]:
    out = {}
    for group, by in _W.items():
        out[group] = [(t, _rx(t)) for t in _terms(by.get(lang, ""))]
    out["certainty"] += [(w, _rx(w, inflect=len(w) >= 6)) for w in site_words]
    return out


def segments(text: str, mode: str = "plain") -> list[tuple[str, str]]:
    """A phrase's words outside placeholders ('plain', a placeholder standing as ◊), inside {q:...} ('q') and inside a
    condition's words ('branch'), as seo_i18n.mjs parseTpl reads it. Bad syntax raises ValueError."""
    out, buf, i = [], "", 0
    while i < len(text):
        ch = text[i]
        if ch == "}":
            raise ValueError(f"stray '}}' in “{text}”")
        if ch != "{":
            buf += ch
            i += 1
            continue
        depth, j = 0, i
        while j < len(text):
            depth += {"{": 1, "}": -1}.get(text[j], 0)
            if depth == 0:
                break
            j += 1
        if depth:
            raise ValueError(f"unclosed '{{' in “{text}”")
        body = text[i + 1 : j]
        buf += " ◊ "
        if body.startswith("if:"):
            parts, d, cur = [], 0, ""
            for c in body[3:]:
                d += {"{": 1, "}": -1}.get(c, 0)
                if c == "|" and d == 0:
                    parts.append(cur)
                    cur = ""
                else:
                    cur += c
            parts.append(cur)
            if not 2 <= len(parts) <= 3:
                raise ValueError(f"{{if:...}} needs a condition and one or two branches in “{text}”")
            for p in parts[1:]:
                out += segments(p, "branch")
        elif body.startswith("q:"):
            out += segments(body[2:], "branch" if mode == "branch" else "q")
        elif not re.fullmatch(r"[A-Za-z][\w:.\-]*", body):
            raise ValueError(f"bad placeholder {{{body}}} in “{text}”")
        i = j + 1
    out.insert(0, (mode, buf))
    return out


def wording_problems(items: list[dict], site_words: dict[str, list[str]] | None = None) -> list[str]:
    """Round 57: every hand-written phrase against the rules above. items: {file, key, lang, text}."""
    rules = {lang: _rules(lang, (site_words or {}).get(lang, [])) for lang in LANGS}
    months = {lang: "|".join(MONTHS[lang].split()) for lang in LANGS}
    out = []
    for it in items:
        lang, where = it["lang"], f"{it['file']} {it['key']} [{it['lang']}]"
        try:
            segs = segments(it["text"].replace("’", "'"))
        except ValueError as e:
            out.append(f"{where}: {e}")
            continue
        found = []
        for mode, txt in segs:
            for term in ALLOW:
                txt = txt.replace(term, " ")
            for m in re.finditer(rf"\b({months[lang]})\s+(?:de\s+)?(\d{{4}})\b", txt, re.IGNORECASE):
                if m.group(2) != WAR_START_YEAR:
                    found.append(("date", m.group(0)))
            txt = re.sub(YEAR, " ", txt)
            found += [("number", d) for d in re.findall(r"\d+", txt)]
            for sent in re.split(r"(?<=[.!?;؟])\s+", txt):
                asks = mode != "plain" or sent.rstrip(" ◊\"”»)'").endswith(("?", "؟"))
                hit = {g: [t for t, rx in rules[lang][g] if rx.search(sent)] for g in rules[lang]}
                for g in ("number", "certainty", "absolute"):
                    found += [(g, t) for t in hit[g]]
                if asks:
                    continue
                found += [(g, t) for g in ("ranking", "comparison", "trend") for t in hit[g]]
                both = (hit["dirU"] and hit["dirR"]) or re.search(EITHER[lang], sent, re.IGNORECASE)
                if not both:
                    found += [("direction", t) for t in hit["dirU"] + hit["dirR"] + hit["dirV"]]
        for g, w in dict.fromkeys(found):
            out.append(f"{where}: {g} '{w}' in “{it['text'][:90]}”")
    return out


TOPIC_TEXT = ("label", "title", "description", "h1", "intro", "faq", "sections", "notes")
NOT_TEXT = {
    "_note",
    "slug",
    "key",
    "side",
    "kind",
    "rank",
    "order",
    "sort",
    "map",
    "members",
    "regions",
    "exclude",
    "related",
    "subtotals",
    "extraRows",
    "onlySide",
    "moneyNote",
    "columns",
    "pairs",
    # round 58: keys and config values, not words (seo_families.json explain, armedItems, country.relations)
    "cluster",
    "clusters",
    "items",
    "src",
    "explain",
    # round 58b: the research files' paths and the pages they feed (seo_families.json research)
    "file",
    "topic",
    "warIncome",
}


def _strings(x, key: str):
    if isinstance(x, str):
        yield key, x
    elif isinstance(x, list):
        for i, y in enumerate(x):
            yield from _strings(y, f"{key}[{i}]")
    elif isinstance(x, dict):
        for k, y in x.items():
            if k not in NOT_TEXT:
                yield from _strings(y, f"{key}.{k}")


def config_items(topics: dict, families: dict) -> list[dict]:
    """Every text field of every entry of seo_topics.json and seo_families.json (English): the editors' own words."""
    out = []
    for e in topics.get("pages", []):
        for f in TOPIC_TEXT:
            for key, text in _strings(e.get(f), f"{e.get('slug')}.{f}"):
                out.append({"file": "pipeline/seo_topics.json", "key": key, "lang": "en", "text": text})
    for key, text in _strings({k: v for k, v in families.items() if k != "_note"}, "families"):
        out.append({"file": "pipeline/seo_families.json", "key": key, "lang": "en", "text": text})
    return out


def phrase_items(pipeline: Path, node: str = "node") -> list[dict]:
    """Every phrase of seo_i18n.mjs and seo_templates.mjs, as their phraseList() gives them (needs Node)."""
    import json
    import subprocess

    js = (
        "Promise.all([import('./seo_i18n.mjs'), import('./seo_templates.mjs')]).then(ms => "
        "process.stdout.write(JSON.stringify(ms.flatMap(m => (m.phraseList ? m.phraseList() : [])))))"
    )
    r = subprocess.run(
        [node, "--input-type=module", "-e", js], cwd=pipeline, capture_output=True, text=True, check=False
    )
    if r.returncode:
        raise RuntimeError(r.stderr.strip()[:400])
    return json.loads(r.stdout)


def check_wording(root: Path, node: str | None = "node") -> tuple[list[str], int]:
    """The wording guard over the config and the translation table: (problems, phrases read)."""
    import json

    items = config_items(
        json.loads((root / "pipeline" / "seo_topics.json").read_text()),
        json.loads((root / "pipeline" / "seo_families.json").read_text()),
    )
    if node:
        items += phrase_items(root / "pipeline", node)
    return wording_problems(items, chance_words(root / "site")), len(items)


# ----- round 58 (owner: "the ranking does not work and the numbers make no sense ... check and fix this type of stuff
# for all pages"): the tables' own sanity, read from what a reader sees. Every figure of every table cell is read back
# from its text in the page's language (parse_fig) and checked against the cell's own value (data-v, the model's),
# against the other figures of the cell, against its range and against the table's stated order:
#   range      the value lies inside its own range, and the range runs low to high in the value's own sign
#   sign       every figure of a cell is signed by the measure's convention (data-st: "signed" + or −, "amount" − only
#              below zero, "kept" neither; a size under the smallest step, "<0.01%", has none)
#   share      a share of GDP is the euros over GDP, and a figure per person the euros over the population (rounding)
#   chance     a chance or likely-range word only on a measure the map gives a chance (net, support, trade)
#   constant   no column repeats the same words in every row (a label belongs above the table, once)
#   order      the rows follow the order the note above the table states
#   totals     a group's totals are its rows added up
#   years      on a page by year, support + trade + frozen money = the net, row by row
#   languages  every language's page has the same figures as the English one (within each format's rounding)
#   compare    a comparison's two countries are in the order of its address, in every table
#   ranking    the ranking pages' groups run high to low, and each row's share and euros have the same sign
SPACES = re.compile(r"[    ]+")
PCT_RX = re.compile(r"^(?P<n>\d[\d.,]*) ?%")
EUR_RX = {
    "en": re.compile(r"^€(?P<n>\d[\d.,]*)(?P<u>bn|m)(?![\w])"),
    "nl": re.compile(r"^€(?P<n>\d[\d.,]*) (?P<u>mld|mln)(?![\w])"),
    "de": re.compile(r"^(?P<n>\d[\d.,]*) (?P<u>Mrd\.|Mio\.) €"),
    "fr": re.compile(r"^(?P<n>\d[\d., ]*?) (?P<u>Md€|M€)"),
    "es": re.compile(r"^(?P<n>\d[\d.,]*) (?P<u>M€)"),
    "pl": re.compile(r"^(?P<n>\d[\d., ]*?) (?P<u>mld|mln) €"),
    "uk": re.compile(r"^(?P<n>\d[\d., ]*?) (?P<u>млрд|млн) €"),
}
PP_RX = {"en": re.compile(r"^€(?P<n>\d[\d.,]*)"), "nl": re.compile(r"^€(?P<n>\d[\d.,]*)")}
PP_RX_OTHER = re.compile(r"^(?P<n>\d[\d., ]*?) €")
BIG_UNITS = {"bn", "mld", "Mrd.", "Md€", "млрд"}
CHANCE_Q = {"net", "ua", "rus"}
# the cost view's parts below zero by construction (a gain that lowers the cost), shown on their pages as the gain
GAIN_PARTS = {"disc"}


def _num(n: str, lang: str) -> tuple[float, int]:
    """A number as a language writes it, and its count of decimals."""
    n = n.strip()
    if lang == "en":
        n = n.replace(",", "")
        d = len(n.split(".")[1]) if "." in n else 0
        return float(n), d
    n = n.replace(".", "").replace(" ", "")
    d = len(n.split(",")[1]) if "," in n else 0
    return float(n.replace(",", ".")), d


def parse_fig(piece: str, lang: str) -> dict | None:
    """The figure a piece of a cell starts with ("+€1.2bn", "−0.06% of GDP", "<€1 per person", "€5bn more"): its kind
    (pct, eur in € bn, pp), its size, its rounding step, its sign as written (+1, −1, 0) and whether it is a size under
    the smallest step ("<0.01%"); None when the piece holds no figure."""
    t = SPACES.sub(" ", html.unescape(re.sub(r"<[^>]+>", "", piece))).strip()
    sign = 0
    if t[:1] in "+−-" and t[:1]:
        sign = 1 if t[0] == "+" else -1
        t = t[1:]
    tiny = t.startswith("<")
    if tiny:
        t = t[1:]
    m = EUR_RX[lang].match(t)
    if m:
        v, d = _num(m.group("n"), lang)
        if m.group("u") in BIG_UNITS:
            return {"kind": "eur", "v": v, "step": 10.0**-d, "sign": sign, "tiny": tiny, "rest": t[m.end() :]}
        step = 0.1 if lang == "es" and v >= 100 else 0.001
        return {"kind": "eur", "v": v / 1000, "step": step, "sign": sign, "tiny": tiny, "rest": t[m.end() :]}
    m = PCT_RX.match(t)
    if m:
        v, d = _num(m.group("n"), lang)
        return {"kind": "pct", "v": v, "step": 10.0**-d, "sign": sign, "tiny": tiny, "rest": t[m.end() :]}
    m = PP_RX.get(lang, PP_RX_OTHER).match(t)
    if m:
        v, _ = _num(m.group("n"), lang)
        return {"kind": "pp", "v": v, "step": 1.0, "sign": sign, "tiny": tiny, "rest": t[m.end() :]}
    return None


def figs_in(text: str, lang: str) -> list[dict]:
    """Every figure in a run of text (a range: "range −€1.4bn to −€0.32bn"), in order."""
    t = SPACES.sub(" ", html.unescape(re.sub(r"<[^>]+>", "", text)))
    out, i = [], 0
    while i < len(t):
        if (
            t[i] in "+−-<€0123456789"
            and (i == 0 or not t[i - 1].isalnum())
            and not (t[i] == "-" and i and t[i - 1] != " ")
        ):
            f = parse_fig(t[i:], lang)
            if f:
                out.append(f)
                i += len(t[i:]) - len(f["rest"]) or 1
                continue
        i += 1
    return out


def _signed(f: dict, v_sign: int) -> float:
    """A figure's value with its sign (a figure written without one takes the cell's own, as "€5bn more" does)."""
    return f["v"] * (f["sign"] or v_sign or 1)


def _attrs(tag: str) -> dict[str, str]:
    return dict(re.findall(r'data-([\w-]+)="([^"]*)"', tag))


TD_M = re.compile(r'<td class="m"([^>]*)>(.*?)</td>', re.DOTALL)
TR = re.compile(r"<tr([^>]*)>(.*?)</tr>", re.DOTALL)
TABLE = re.compile(r"<table([^>]*)>(.*?)</table>", re.DOTALL)


def cell_parts(td: str) -> dict:
    """A cell's pieces: the figure (b), the other figures (s), the range (rg) and the chance (ch)."""
    b = re.search(r"<b[^>]*>(.*?)</b>", td, re.DOTALL)
    rest = re.search(r'<span class="s">(.*?)</span>', td, re.DOTALL)
    rg = re.search(r'<span class="s rg">(.*?)</span>', td, re.DOTALL)
    ch = re.search(r'<span class="s ch">(.*?)</span>', td, re.DOTALL)
    pieces = [b.group(1)] if b else []
    if rest:
        pieces += [x for x in re.sub(r"</?i>", "", rest.group(1)).split(" · ") if x.strip()]
    return {"pieces": pieces, "rg": rg.group(1) if rg else "", "ch": ch.group(1) if ch else "", "text": td}


def range_words(site: Path) -> dict[str, list[str]]:
    """The map's own range and chance words in each language: none may stand in a cell of a measure without a chance."""
    out = {"en": ["likely", "about 0", "very likely", "too close to call", "near zero", "essentially zero"]}
    for lang, d in i18n_words(site).items():
        ws = [d.get("about 0", "")]
        for k in (
            "likely {lo} to {hi}",
            "very likely · {p}",
            "likely {side} · {p}",
            "too close to call",
            "near zero",
            "essentially zero",
        ):
            ws.append(d.get(k, "").split("{")[0].split("·")[0].strip())
        out[lang] = sorted({w for w in ws if len(w) >= 3})
    return out


def check_cell_figs(
    td_attrs: dict, cp: dict, row: dict, lang: str, main_unit: str | None, where: str, words: list[str]
) -> list[str]:
    """One cell: signs, shares, per person, range, chance words."""
    out = []
    q, st = td_attrs.get("q", ""), td_attrs.get("st")
    if "v" not in td_attrs or not st:
        return out
    v = float(td_attrs["v"])
    vs = 1 if v > 0 else -1 if v < 0 else 0
    figs = [f for f in (parse_fig(x, lang) for x in cp["pieces"]) if f]
    if not figs:
        return [f"{where} {q}: no figure read in {cp['pieces'][:1]}"]
    gdp, pop = row.get("gdp"), row.get("pop")
    for f in figs:
        zero = f["tiny"] or f["v"] == 0
        want = 0 if st == "kept" else (vs if st == "signed" else -1 if vs < 0 else 0)
        if not zero and abs(v) >= 0.0005 and f["sign"] != want:
            out.append(
                f"{where} {q}: sign of '{SPACES.sub(' ', html.unescape(re.sub('<[^>]+>', '', cp['pieces'][figs.index(f)] if figs.index(f) < len(cp['pieces']) else '')))}' is not the {st} convention for {v:+.4f}"
            )
    eur = next((f for f in figs if f["kind"] == "eur"), None)
    if eur and abs(_signed(eur, vs) - v) > eur["step"] / 2 + 1e-6 and not (eur["tiny"]):
        out.append(f"{where} {q}: {eur['v']} € bn written for {v:+.4f}")
    for f in figs:
        if f["kind"] == "pct" and gdp:
            want_p = 100 * v / gdp
            got = 0.0 if f["tiny"] else _signed(f, vs)
            tol = (f["step"] if f["tiny"] else f["step"] / 2) + 1e-6
            if abs(got - want_p) > tol:
                out.append(f"{where} {q}: {got:+.4f}% of GDP is not {v:+.4f} bn / GDP {gdp} ({want_p:+.4f}%)")
        if f["kind"] == "pp" and pop:
            want_pp = v * 1000 / pop
            got = 0.0 if f["tiny"] else _signed(f, vs)
            if abs(got - want_pp) > (1.0 if f["tiny"] else 0.5) + 1e-6:
                out.append(f"{where} {q}: {got:+.1f} per person is not {v:+.4f} bn / {pop} m people ({want_pp:+.2f})")
    # the range: low to high in the value's own sign, holding the value
    if "lo" in td_attrs and "hi" in td_attrs:
        lo, hi = float(td_attrs["lo"]), float(td_attrs["hi"])
        if not lo - 1e-6 <= v <= hi + 1e-6:
            out.append(f"{where} {q}: value {v:+.4f} outside its range {lo:+.4f} to {hi:+.4f}")
    if cp["rg"] and q not in CHANCE_Q:
        rf = figs_in(cp["rg"], lang)
        main = figs[0]
        if len(rf) != 2:
            out.append(f"{where} {q}: range '{cp['rg']}' has {len(rf)} figures")
        elif st != "kept":
            a, b = (0.0 if x["tiny"] else x["v"] * (x["sign"] or (1 if st == "amount" else 0) or 1) for x in rf)
            m0 = 0.0 if main["tiny"] else _signed(main, vs)
            tol = max(x["step"] for x in rf + [main]) / 2 + (0.01 if any(x["tiny"] for x in rf + [main]) else 0) + 1e-6
            if rf[0]["kind"] != main["kind"]:
                out.append(f"{where} {q}: range '{cp['rg']}' not in the unit of the value")
            elif st == "signed" and any(not x["tiny"] and x["v"] and not x["sign"] for x in rf):
                out.append(f"{where} {q}: range '{cp['rg']}' without signs")
            elif a > b + tol:
                out.append(f"{where} {q}: range '{cp['rg']}' runs high to low")
            elif not a - tol <= m0 <= b + tol:
                out.append(f"{where} {q}: value {m0:+} outside its range '{cp['rg']}'")
    if q not in CHANCE_Q:
        txt = html.unescape(re.sub(r"<[^>]+>", " ", cp["rg"] + " " + cp["ch"])).lower()
        hit = [w for w in words if re.search(rf"(?<!\w){re.escape(w.lower())}(?!\w)", txt)]
        if hit or cp["ch"]:
            out.append(f"{where} {q}: chance or likely-range words {hit or [cp['ch']]} on a measure without a chance")
    return out


def _order_kind(note: str, phrases: dict[str, str] | None) -> str | None:
    """Which order the note above a table states: desc, asc or abs (None: none read)."""
    if not phrases:
        return None
    n = SPACES.sub(" ", html.unescape(note))
    for k in sorted(phrases, key=lambda k: -len(phrases[k])):
        if SPACES.sub(" ", phrases[k]) in n:
            return {
                "hiLo": "desc",
                "uaRu": "desc",
                "keptLessMore": "desc",
                "back": "asc",
                "loHi": "asc",
                "ruUa": "asc",
                "keptMoreLess": "asc",
                "bySize": "abs",
            }.get(k)
    return None


def check_tables(
    text: str, name: str, lang: str, words: list[str], phrases: dict[str, str] | None = None
) -> tuple[list[str], dict]:
    """Every topic, part, year, group and comparison table of a page (table.topic): its cells, its order, its constant
    columns, its group totals and (on a page by year) its rows adding up. Returns the problems and the figures read,
    by (row, measure), for the comparison between languages."""
    out, seen = [], {}
    for tattrs, table in TABLE.findall(text):
        if 'class="topic"' not in tattrs:
            continue
        ta = _attrs(tattrs)
        rows, labels = [], {}
        for trattrs, tr in TR.findall(table):
            ra = _attrs(trattrs)
            if "iso" not in ra:
                continue
            row = {
                "iso": ra["iso"],
                "gdp": float(ra["gdp"]) if "gdp" in ra else None,
                "pop": float(ra["pop"]) if "pop" in ra else None,
            }
            names = [html.unescape(x) for x in re.findall(r"<a [^>]*>(.*?)</a>", tr)]
            cells = TD_M.findall(tr)
            row["cells"] = []
            for i, (tda, td) in enumerate(cells):
                a = _attrs(tda)
                cp = cell_parts(td)
                where = f"{name} {ra['iso']}" + (f"@{a['year']}" if "year" in a else "")
                out += check_cell_figs(a, cp, row, lang, ta.get("sort") if i == 0 else "eur", where, words)
                figs = [f for f in (parse_fig(x, lang) for x in cp["pieces"]) if f]
                row["cells"].append((a, figs))
                seen[(ra["iso"], a.get("q"), i)] = [
                    (
                        f["kind"],
                        f["v"] * (f["sign"] or 1) if f["sign"] or a.get("st") != "kept" else f["v"],
                        f["step"],
                        f["tiny"],
                    )
                    for f in figs
                ]
                # the words of the cell without its figures or the country's name: a label every row repeats
                for span in re.findall(r"<span[^>]*>(.*?)</span>", td, re.DOTALL):
                    w = html.unescape(re.sub(r"<[^>]+>", "", span))
                    for nm in names:
                        w = w.replace(nm, "◊")
                    if w.strip() and not re.search(r"\d", w):
                        labels.setdefault(i, []).append(w.strip())
            rows.append(row)
        for i, ws in labels.items():
            if len(rows) >= 3 and len(ws) == len(rows) and len(set(ws)) == 1:
                out.append(f"{name}: column {i + 1} repeats '{ws[0][:60]}' in every row")
        # the order: the main figure, in the table's unit, with the sign of the value
        order = ta.get("order")
        vals = []
        for r in rows:
            if not r["cells"] or "v" not in r["cells"][0][0]:
                continue
            a, figs = r["cells"][0]
            v = float(a["v"])
            unit = {"gdp": "pct", "eur": "eur", "pp": "pp"}.get(ta.get("sort", ""), "eur")
            f = next((x for x in figs if x["kind"] == unit), None)
            if f:
                vals.append(
                    (
                        r["iso"],
                        0.0 if f["tiny"] else f["v"] * (1 if v >= 0 else -1),
                        f["step"] + (0.01 if f["tiny"] else 0),
                    )
                )
        if order and len(vals) > 1 and name.split("/")[-2:-1] != ["compare"] and "/compare/" not in name:
            for (i1, a, sa), (i2, b, sb) in zip(vals, vals[1:]):
                tol = (sa + sb) / 2 + 1e-9
                bad = (
                    (order == "desc" and a < b - tol)
                    or (order == "asc" and a > b + tol)
                    or (order == "abs" and abs(a) < abs(b) - tol)
                )
                if bad:
                    out.append(f"{name}: rows {i1} ({a:+}) then {i2} ({b:+}) break the order '{order}'")
                    break
            note = text[: text.find(tattrs)]
            note = note[note.rfind('<p class="sub" data-note="order">') :]
            stated = _order_kind(note, phrases)
            if phrases is not None and stated != order:
                out.append(f"{name}: the note says '{stated}', the table is sorted '{order}'")
        # a page by year: support + trade + frozen money = the net, row by row (in euros)
        if "data-year" in table:
            for r in rows:
                by = {a.get("q"): (a, figs) for a, figs in r["cells"]}
                if not {"ua", "rus", "net"} <= set(by):
                    continue
                tot, tol = 0.0, 0.0
                for q in ("ua", "rus", "frozen"):
                    if q not in by:
                        continue
                    a, figs = by[q]
                    e = next((x for x in figs if x["kind"] == "eur"), None)
                    if e:
                        tot += _signed(e, 1 if float(a.get("v", 0)) >= 0 else -1)
                        tol += e["step"] / 2
                a, figs = by["net"]
                e = next((x for x in figs if x["kind"] == "eur"), None)
                if e and abs(tot - _signed(e, 1 if float(a.get("v", 0)) >= 0 else -1)) > tol + e["step"] / 2 + 0.002:
                    out.append(
                        f"{name} {r['iso']}: support + trade + frozen = {tot:+.3f} bn, the net says {_signed(e, 1):+.3f}"
                    )
        # a group's totals: its rows added up (each total is in euros and as a share of the members' combined GDP)
        for q, td in re.findall(r'<div data-total="(\w+)">(.*?)</div>', text, re.DOTALL):
            col = [r for r in rows for a, figs in r["cells"] if a.get("q") == q and "v" in a]
            if not col:
                continue
            got = [f for f in figs_in(td, lang) if f["kind"] == "eur"]
            vsum = sum(float(a["v"]) for r in rows for a, figs in r["cells"] if a.get("q") == q and "v" in a)
            if got and abs(got[0]["v"] - abs(vsum)) > got[0]["step"] / 2 + 0.0005 * len(col):
                out.append(f"{name} total {q}: {got[0]['v']} € bn, its {len(col)} rows add up to {vsum:+.3f}")
    return out, seen


def check_values(text: str, name: str, model: dict) -> list[str]:
    """Each cell's own value (data-v, data-lo, data-hi), which the checks above read the figures against, is the
    model's (site_numbers.mjs): a headline amount, a part or a cost, or a year's own amount."""
    out = []
    for iso, tr in re.findall(r'<tr data-iso="([A-Z]{3})"[^>]*>(.*?)</tr>', text, re.DOTALL):
        c = model["countries"].get(iso)
        if not c:
            continue
        for tda in re.findall(r'<td class="m"([^>]*)>', tr):
            a = _attrs(tda)
            q = a.get("q", "")
            if "v" not in a:
                continue
            want, lo, hi = None, None, None
            if "year" in a and q in ("net", "ua", "rus", "frozen"):
                want = year_amount(c, int(a["year"]), q)
            elif "year" in a:
                continue
            elif q in ("net", "ua", "rus"):
                want = c[q + "Eur"]
            elif q == "frozen":
                want = c.get("frozenEur")
            elif q.startswith("part:"):
                k = q[5:]
                want = c.get("part_" + k, c.get("cost_" + k))
                lo, hi = c.get("part_" + k + "Lo"), c.get("part_" + k + "Hi")
                if k in GAIN_PARTS and want is not None:
                    want = -want  # shown as the gain (seo_extract.mjs GAIN)
            if want is not None and abs(float(a["v"]) - want) > 2e-4:
                out.append(f"{name} {iso} {q}: value {a['v']}, the model {want}")
            if (
                lo is not None
                and "lo" in a
                and (abs(float(a["lo"]) - min(lo, hi)) > 2e-4 or abs(float(a["hi"]) - max(lo, hi)) > 2e-4)
            ):
                out.append(f"{name} {iso} {q}: range {a['lo']} to {a['hi']}, the model {lo} to {hi}")
    return out


def compare_languages(name: str, en: dict, other: dict, lang: str) -> list[str]:
    """The same page in another language has the same figures as the English one, each within its formats' rounding."""
    out = []
    for k, fe in en.items():
        fo = other.get(k)
        if fo is None:
            out.append(f"{name} [{lang}] {k[0]} {k[1]}: missing")
            continue
        for (ke, ve, se, te), (ko, vo, so, to) in zip(fe, fo):
            if ke != ko or (not te and not to and abs(ve - vo) > (se + so) / 2 + 1e-6):
                out.append(f"{name} [{lang}] {k[0]} {k[1]}: {ke} {ve} in English, {ko} {vo}")
                break
        if len(fe) != len(fo):
            out.append(f"{name} [{lang}] {k[0]} {k[1]}: {len(fe)} figures in English, {len(fo)}")
    return out


def check_compare_order(text: str, name: str, a: str, b: str) -> list[str]:
    """A comparison /compare/<a>-vs-<b>/: its rows, the parts' cells and the columns are a then b."""
    out = []
    t = re.search(r'<table class="topic"[^>]*>(.*?)</table>', text, re.DOTALL)
    isos = re.findall(r'<tr data-iso="([A-Z]{3})"', t.group(1)) if t else []
    if isos[:2] != [a, b]:
        out.append(f"{name}: rows {isos[:2]}, the address says {[a, b]}")
    cells = re.findall(r'data-q="part:\w+" data-iso="([A-Z]{3})"', text)
    if cells and any(x != [a, b][i % 2] for i, x in enumerate(cells)):
        out.append(f"{name}: the parts' columns are not {a} then {b}")
    return out


def check_rank_lists(text: str, name: str, lang: str = "en") -> list[str]:
    """The ranking pages: in each group the rows run high to low, numbered in order, and a row's share of GDP and its
    euros have the same sign."""
    out = []
    for gid, ol in re.findall(r'<h2 id="([\w-]+)">[^<]*</h2><ol class="rk">(.*?)</ol>', text, re.DOTALL):
        prev = None
        for v, e in re.findall(r'<span class="v">(.*?)</span><span class="e">(.*?)(?: · |</span>)', ol):
            fv, fe = parse_fig(v, lang), parse_fig(e, lang)
            if not fv or not fe:
                continue
            sv = 0.0 if fv["tiny"] else fv["v"] * (fv["sign"] or 1)
            if (
                not fv["tiny"]
                and not fe["tiny"]
                and fv["v"]
                and fe["v"]
                and fv["sign"]
                and fe["sign"]
                and fv["sign"] != fe["sign"]
            ):
                out.append(f"{name} #{gid}: '{v}' and '{e}' have different signs")
            if prev is not None and sv > prev + fv["step"] + 1e-9:
                out.append(f"{name} #{gid}: '{v}' after {prev:+} (not high to low)")
            prev = sv
    return out


def order_phrases(pipeline: Path, node: str = "node") -> dict[str, dict[str, str]]:
    """Each language's order phrases (seo_i18n.mjs S[l].order), to read which order a table's note states."""
    import subprocess

    js = "import('./seo_i18n.mjs').then(m => process.stdout.write(JSON.stringify(Object.fromEntries(m.LANGS.map(l => [l, m.s(l, 'order')])))))"
    r = subprocess.run(
        [node, "--input-type=module", "-e", js], cwd=pipeline, capture_output=True, text=True, check=False
    )
    if r.returncode:
        raise RuntimeError(r.stderr.strip()[:400])
    return json.loads(r.stdout)


def check_sanity(
    site: Path, model: dict | None, paths: list[str], phrases: dict[str, dict[str, str]] | None = None
) -> list[str]:
    """Round 58: every table of every topic, group, part, year and comparison page in every language (check_tables),
    the same figures in every language (compare_languages), the comparisons' order and the ranking pages' lists."""
    out = []
    words = range_words(site)
    slug_iso = {c["slug"]: i for i, c in (model or {}).get("countries", {}).items()}
    for path0 in paths:
        if path0 == "topics/":
            continue
        en = None
        for lang in LANGS:
            path = path0 if lang == "en" else f"{lang}/{path0}"
            f = site / path / "index.html"
            if not f.exists():
                continue
            text = f.read_text()
            if model:
                out += check_values(text, "/" + path, model)
            probs, seen = check_tables(
                text, "/" + path, lang, words.get(lang, []), (phrases or {}).get(lang) if phrases is not None else None
            )
            out += probs
            if lang == "en":
                en = seen
            elif en is not None:
                out += compare_languages("/" + path0, en, seen, lang)
            m = re.match(r"compare/([\w-]+)-vs-([\w-]+)/$", path0)
            if m and slug_iso:
                # a slug may hold "-vs-"-free hyphens: find the split that names two countries
                parts = path0[len("compare/") : -1].split("-vs-")
                if len(parts) == 2 and parts[0] in slug_iso and parts[1] in slug_iso:
                    out += check_compare_order(text, "/" + path, slug_iso[parts[0]], slug_iso[parts[1]])
    for path in ("ranking/", "support-for-ukraine/", "trade-with-russia/"):
        f = site / path / "index.html"
        if f.exists():
            out += check_rank_lists(f.read_text(), "/" + path)
    return out


# ----- round 58b (owner approved: the three research results wired in, seo_research.mjs) -----
# Every figure a page writes from a research file carries the file, its path in it and its value (data-rv, data-v; data-u
# its unit: eur, rub in bn, share as a fraction). Here each is read back: the value is the file's, and the text the
# reader sees is that value in the page's language (within the shown rounding; "<€1m" for an official figure under a
# million; no figure where the file has none). And the pages are complete: every country page in every language has its
# sanctions section, the page of every country's sanctions lists every entry, the revenue page every year and the months
# the config names to the file's latest, the frozen-assets topic page an amount for every row; the revenue CSV files in
# the downloads and the revenue lines of llms-full.txt are the file's.
RV = re.compile(r'<(td|span|tr|div)\b([^>]*\bdata-rv="(\w+):([^"]+)"[^>]*)>')
_UNIT_BIG = r"bn|Mrd\.|Md|mld|млрд"
_UNIT_SMALL = r"m|Mio\.|M|mln|млн"


def research_files(root: Path, cfg: dict) -> dict[str, dict]:
    """The research files of seo_families.json research, by the name the pages mark them with."""
    out = {}
    for name in ("sanctions", "frozen", "revenue"):
        f = (cfg.get(name) or {}).get("file")
        if f and (root / f).exists():
            out[name] = json.loads((root / f).read_text())
    return out


def research_value(doc: dict, path: str):
    """A value of a research file by its path ("countries.BEL.cbr_eur.v", "monthly@2026-09.share"); None if absent."""
    x = doc
    for seg in path.split("."):
        if "@" in seg:
            name, key = seg.split("@", 1)
            lst = x.get(name) if isinstance(x, dict) else None
            x = next((i for i in lst or [] if key in (i.get("ym"), i.get("date"), i.get("y"))), None)
        elif isinstance(x, dict):
            x = x.get(seg)
        else:
            return None
        if x is None:
            return None
    return x


def _research_num(text: str, unit: str, lang: str) -> tuple[float, float] | None:
    """The figure a research cell shows, in the file's unit (bn, or percent for a share), and half its last step."""
    t = SPACES.sub(" ", html.unescape(re.sub(r"<[^>]+>", "", text))).strip()
    if unit == "eur":
        f = parse_fig(t, lang)
        if not f or f["kind"] != "eur":
            return None
        return (0.0 if f["tiny"] else f["v"]), (0.001 if f["tiny"] else f["step"] / 2)
    if unit == "share":
        m = re.search(r"(\d[\d.,]*) ?%", t)
        if not m:
            return None
        v, d = _num(m.group(1), lang)
        return v, 10.0**-d / 2
    m = re.search(rf"(\d[\d., ]*?)(?: )?({_UNIT_BIG}|{_UNIT_SMALL})(?![\w])", t.replace("RUB ", ""))
    if not m:
        return None
    v, d = _num(m.group(1), lang)
    if re.fullmatch(_UNIT_SMALL, m.group(2)):
        return v / 1000, 10.0**-d / 2000
    return v, 10.0**-d / 2


def check_research_marks(text: str, name: str, lang: str, files: dict[str, dict]) -> list[str]:
    """Every marked research figure of a page: its value is the file's, and its text that value."""
    out = []
    for m in RV.finditer(text):
        tag, attrs, fname, path = m.groups()
        # a cell's or a span's own text (a row or a block is marked with a word, its cells are read on their own)
        inner = text[m.end() : text.find(f"</{tag}>", m.end())] if tag in ("td", "span") else ""
        a = _attrs(attrs)
        doc = files.get(fname)
        if doc is None:
            out.append(f"{name}: {fname}:{path} marked, but the file is not configured")
            continue
        want = research_value(doc, path)
        got = a.get("v", "")
        if isinstance(want, bool) or want is None or isinstance(want, str):
            w = "true" if want is True else "false" if want is False else "null" if want is None else want
            if got != w:
                out.append(f"{name}: {fname}:{path} is {got!r}, the file says {w!r}")
            if want is None and a.get("u") and re.search(r"\d", re.split(r'<span class="s">', inner)[0]):
                out.append(f"{name}: {fname}:{path} has no figure in the file, the page writes one")
            continue
        if got == "null" or abs(float(got) - float(want)) > 1e-9 + 1e-9 * abs(float(want)):
            out.append(f"{name}: {fname}:{path} is {got}, the file says {want}")
            continue
        unit = a.get("u")
        if not unit:
            continue
        shown = _research_num(re.split(r'<span class="s">', inner)[0], unit, lang)
        v = float(want) * (100 if unit == "share" else 1)
        if shown is None:
            out.append(f"{name}: {fname}:{path} figure not read in {_plain(inner)[:40]!r}")
        elif not (unit == "eur" and 0 < v < 0.0005 and shown[0] == 0.0) and abs(shown[0] - v) > shown[1] + 1e-6:
            out.append(f"{name}: {fname}:{path} written {_plain(inner)[:30]!r}, the file says {want}")
    return out


def check_research(site: Path, root: Path, cfg: dict, model: dict | None, langs: list[str]) -> list[str]:
    """Round 58b: the pages fed by the research files (seo_families.json research), in every language."""
    import csv
    import io

    files = research_files(root, cfg)
    out = []

    def pre(lang):
        return "" if lang == "en" else lang + "/"

    sanc, froz, rev = files.get("sanctions"), files.get("frozen"), files.get("revenue")
    # every country page: its marked figures, and its sanctions section
    for iso, c in (model or {}).get("countries", {}).items():
        for lang in langs:
            f = site / pre(lang) / "country" / c["slug"] / "index.html"
            if not f.exists():
                continue
            text = f.read_text()
            name = f"/{pre(lang)}country/{c['slug']}/"
            out += check_research_marks(text, name, lang, files)
            if sanc and iso in sanc["countries"] and f'data-rv="sanctions:countries.{iso}.category"' not in text:
                out.append(f"{name}: no sanctions section")
    # the page of every country's sanctions: every entry, by its category
    if sanc and cfg.get("sanctions", {}).get("slug"):
        for lang in langs:
            f = site / pre(lang) / cfg["sanctions"]["slug"] / "index.html"
            if not f.exists():
                out.append(f"/{pre(lang)}{cfg['sanctions']['slug']}/ not written")
                continue
            text = f.read_text()
            out += check_research_marks(text, f"/{pre(lang)}{cfg['sanctions']['slug']}/", lang, files)
            rows = set(re.findall(r'<tr id="([A-Z]{3})" data-rv="sanctions:countries\.\1\.category"', text))
            if rows != set(sanc["countries"]):
                out.append(
                    f"/{pre(lang)}{cfg['sanctions']['slug']}/: entries {sorted(set(sanc['countries']) ^ rows)[:5]} missing or extra"
                )
    # the revenue page: every year, and the months the config names to the file's latest
    if rev and cfg.get("revenue", {}).get("slug"):
        n = cfg["revenue"].get("months", 24)
        months = [m["ym"] for m in rev["monthly"]][-n:]
        for lang in langs:
            slug = cfg["revenue"]["slug"]
            f = site / pre(lang) / slug / "index.html"
            if not f.exists():
                out.append(f"/{pre(lang)}{slug}/ not written")
                continue
            text = f.read_text()
            out += check_research_marks(text, f"/{pre(lang)}{slug}/", lang, files)
            ys = set(re.findall(r'data-rv="revenue:yearly\.(\d{4})\.og_rev_rub"', text))
            if ys != set(rev["yearly"]):
                out.append(f"/{pre(lang)}{slug}/: years {sorted(ys)} are not the file's {sorted(rev['yearly'])}")
            ms = re.findall(r'data-rv="revenue:monthly@([\d-]+)\.og_rev_rub"', text)
            if sorted(ms) != months:
                out.append(f"/{pre(lang)}{slug}/: months {ms[:2]}… are not the file's last {n}")
    # the frozen-assets topic page: an amount of each kind for every row
    if froz and cfg.get("frozen", {}).get("topic"):
        for lang in langs:
            path = f"{pre(lang)}{cfg['frozen']['topic']}/"
            f = site / path / "index.html"
            if not f.exists():
                continue
            text = f.read_text()
            out += check_research_marks(text, "/" + path, lang, files)
            t = re.search(r'<table class="topic"[^>]*>(.*?)</table>', text, re.DOTALL)
            for iso, tr in re.findall(r'<tr data-iso="([A-Z]{3})"[^>]*>(.*?)</tr>', t.group(1) if t else "", re.DOTALL):
                for k in ("cbr_eur", "private_eur"):
                    if f'data-rv="frozen:countries.{iso}.{k}.v"' not in tr:
                        out.append(f"/{path}: {iso} has no {k} amount")
    # the downloads: the revenue series as the file has them
    if rev:
        fm = site / "downloads" / "russia-oil-gas-revenue-monthly.csv"
        fy = site / "downloads" / "russia-oil-gas-revenue-yearly.csv"
        if not fm.exists() or not fy.exists():
            out.append("downloads: the revenue CSV files are missing")
        else:
            rows = list(csv.DictReader(io.StringIO(fm.read_text().lstrip("﻿"))))
            if [r["month"] for r in rows] != [m["ym"] for m in rev["monthly"]]:
                out.append("russia-oil-gas-revenue-monthly.csv: months are not the file's")
            for r, m in zip(rows, rev["monthly"]):
                for col, k in (
                    ("oil_gas_revenue_rub_bn", "og_rev_rub"),
                    ("oil_gas_revenue_eur_bn", "og_rev_eur"),
                    ("oil_gas_share", "share"),
                ):
                    if abs(float(r[col]) - m[k]) > 1e-9:
                        out.append(f"russia-oil-gas-revenue-monthly.csv {m['ym']} {col}: {r[col]}, the file {m[k]}")
            for r in csv.DictReader(io.StringIO(fy.read_text().lstrip("﻿"))):
                y = rev["yearly"].get(r["year"])
                if y and abs(float(r["oil_gas_revenue_rub_bn"]) - y["og_rev_rub"]) > 1e-9:
                    out.append(
                        f"russia-oil-gas-revenue-yearly.csv {r['year']}: {r['oil_gas_revenue_rub_bn']}, the file {y['og_rev_rub']}"
                    )
        # llms-full.txt: a line per year, its figures the file's
        full = site / "llms-full.txt"
        lines = (
            re.findall(r"(?m)^- (\d{4})\b[^:]*: (RUB [\d,.]+bn) \((€[\d,.]+(?:bn|m))\), ([\d.]+%)", full.read_text())
            if full.exists()
            else []
        )
        if {y for y, *_ in lines} != set(rev["yearly"]):
            out.append("llms-full.txt: the revenue lines are not one per year of the file")
        for y, rub, eur, share in lines:
            x = rev["yearly"][y]
            for txt, unit, v in (
                (rub, "rub", x["og_rev_rub"]),
                (eur, "eur", x["og_rev_eur"]),
                (share, "share", 100 * x["share"]),
            ):
                got = _research_num(txt, unit, "en")
                if not got or abs(got[0] - v) > got[1] + 1e-6:
                    out.append(f"llms-full.txt {y}: {txt}, the file says {v}")
    return out
