"""Round 54 (findable pages): checks of the static pages written by pipeline/seo_pages.mjs, run by check_data.py (check 48).

Round 55: and of the topic and group pages (pipeline/seo_topics.json): every entry is written and in the sitemap, the
home page's Topics list links it, and each table's net, support and trade figures, chance words and group totals are the
model's.

Every page in sitemap.xml must exist, name itself as canonical, carry no meta refresh, keep its title to 60 characters
and its description to 155, and list hreflang alternates that list it back. Every country page must exist, and the
number and the chance word in an English country page's title must be the model's (site_numbers.mjs): a title says
"Too close to call" or "Leaning" exactly where the map does.
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


def file_for(site: Path, site_url: str, url: str) -> Path:
    path = urlparse(url).path
    base = urlparse(site_url).path
    rel = path[len(base) :] if path.startswith(base) else path.lstrip("/")
    return site / rel / "index.html" if rel == "" or rel.endswith("/") else site / rel


# ----- the copy's number formats (seo_templates.mjs P and E) -----
def fmt_pct(x: float) -> str:
    a = abs(x)
    return (f"{a:.1f}" if a >= 1 else f"{a:.2f}" if a >= 0.01 else "<0.01") + "%"


def fmt_eur(bn: float) -> str:
    a = abs(bn)
    s = f"{round(a):,}" if a >= 100 else f"{a:.1f}" if a >= 1 else f"{a:.2f}" if a >= 0.1 else f"{round(a * 1000)}m"
    s = s.removesuffix(".0")
    return "€" + s + ("bn" if a >= 0.1 else "")


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


def allowed_numbers(c: dict) -> set[str]:
    """Every way the copy may write this country's numbers (the model's are rounded to 4 places: both neighbours too)."""
    out = set()
    for k in ("net", "ua", "rus"):
        for d in (-5e-5, 0, 5e-5):
            out.add(fmt_pct(c[k] + d))
            out.add(fmt_eur(c[k + "Eur"] + d))
    return out


NUM = re.compile(r"€\d+(?:,\d{3})*(?:\.\d+)?(?:bn|m)|<?\d+(?:\.\d+)?%")
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


def topic_path(e: dict) -> str:
    return f"group/{e['slug']}/" if e.get("kind") == "group" else f"{e['slug']}/"


def numbers_for(c: dict, q: str, extra: float = 0.0) -> set[str]:
    """The ways the pages may write one of a country's headline numbers (q: net, ua or rus)."""
    out = set()
    for d in (-5e-5 - extra, 0, 5e-5 + extra):
        out.add(fmt_pct(c[q] + d))
        out.add(fmt_eur(c[q + "Eur"] + d))
    return out


def check_topics(site: Path, site_url: str, model: dict | None, topics: list[dict], in_sitemap: set[str]) -> list[str]:
    """Round 55: every topic and group page of seo_topics.json is written and in the sitemap; in its tables each
    country's net, support and trade figures and their chance words are the model's, and a group's totals add up."""
    out = []
    for e in topics:
        path = topic_path(e)
        f = site / path / "index.html"
        if not f.exists() or site_url + path not in in_sitemap:
            out.append(f"/{path} not written or not in the sitemap")
            continue
        if not model:
            continue
        text = f.read_text()
        for iso, tr in re.findall(r'<tr data-iso="([A-Z]{3})">(.*?)</tr>', text, re.DOTALL):
            c = model["countries"].get(iso)
            if c is None:
                out.append(f"/{path} {iso}: not in the model")
                continue
            for q, lv, td in re.findall(
                r'<td class="m" data-q="(net|ua|rus)"(?: data-level="(\w*)")?>(.*?)</td>', tr, re.DOTALL
            ):
                parts = re.findall(r"<(?:b|span)[^>]*>(.*?)</(?:b|span)>", td, re.DOTALL)
                figs = " ".join(parts[:2])  # the figure and its other units (the range words come after)
                bad = [n for n in NUM.findall(html.unescape(figs)) if n not in numbers_for(c, q)]
                if bad:
                    out.append(f"/{path} {iso} {q}: {bad}")
                if c.get("party") or c.get("noData"):
                    continue
                want = level(c, q)
                if lv != want or CHANCE_WORDS[want] not in html.unescape(td):
                    out.append(f"/{path} {iso} {q}: chance '{lv}', the map says {want}")
        if e.get("kind") == "group":
            members = [model["countries"][i] for i in e.get("members", []) if i in model["countries"]]
            ranked = [c for c in members if not c.get("party") and not c.get("noData")]
            for q, td in re.findall(r'<div data-total="(net|ua|rus)">(.*?)</div>', text, re.DOTALL):
                eur = sum(c[q + "Eur"] for c in ranked)
                gdp = sum(c["gdp"] for c in ranked)
                tol = 5e-5 * len(ranked)
                allowed = {fmt_pct(100 * (eur + d) / gdp) for d in (-tol, 0, tol)} | {
                    fmt_eur(eur + d) for d in (-tol, 0, tol)
                }
                bad = [n for n in NUM.findall(html.unescape(td)) if n not in allowed]
                if bad:
                    out.append(f"/{path} total {q}: {bad}")
    return out


def check_site(site: Path, site_url: str, model: dict | None, topics: list[dict] | None = None) -> dict[str, list[str]]:
    """All problems, by check. model: site_numbers.mjs output (None: the title numbers are not checked); topics: the
    entries of seo_topics.json (round 55; None: not checked)."""
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
    urls = sitemap_urls(smap.read_text())
    heads: dict[str, dict] = {}
    for u in urls:
        f = file_for(site, site_url, u)
        if not f.exists():
            p["missing"].append(urlparse(u).path)
            continue
        heads[u] = head(f.read_text())
    if model:
        for iso, c in model["countries"].items():
            u = f"{site_url}country/{c['slug']}/"
            if u not in heads:
                p["missing"].append(f"country/{c['slug']}/ ({iso})")
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
        if model and h["iso"] and "/country/" in name and not re.match(r"^/\w\w/country/", name):
            c = model["countries"].get(h["iso"])
            if c and not c.get("noData"):
                p["title"] += [f"{name}: {x}" for x in title_problems(h["title"] or "", c)]
    if topics is not None:
        p["topics"] = check_topics(site, site_url, model, topics, set(urls))
    idx = (site / "index.html").read_text()
    if model:
        p["az"] = [c["slug"] for c in model["countries"].values() if f'href="/country/{c["slug"]}/"' not in idx]
    if topics:
        p["az"] += [f"topic {topic_path(e)}" for e in topics if f'href="/{topic_path(e)}"' not in idx]
    return p
