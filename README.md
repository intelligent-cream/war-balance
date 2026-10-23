# Follow the Money: Ukraine

Where did each country's money move since the full-scale invasion: toward Ukraine or toward Russia? An interactive
map of every country's support for Ukraine and Russia's earnings from trade with it (how much less, or more, Russia
earned: taxes and profit above a normal return, not the full price, war-time prices included), each against what it
would have done without the war, with sources, ranges and certainty for every number.

**Website: https://followthemoneyukraine.org/**

Status: **research preview**. The figures were compiled with AI assistance from public sources and have not yet been
checked line by line by a person. Treat them as estimates and check the sources before quoting one.

## Documentation

Everything a reader needs is on the website, under **How it works**, written once and kept there:

- [How it works](https://followthemoneyukraine.org/#view=how): how to trace a number, the
  method, every money flow with its sources, and [the method in full](https://followthemoneyukraine.org/#view=how&sec=method-full)
- [Limitations](https://followthemoneyukraine.org/#view=how&sec=limitations)
- [Changelog](https://followthemoneyukraine.org/#view=how&sec=changelog): every update,
  what it changed and every decision behind it
- [Download the data](https://followthemoneyukraine.org/#view=how&sec=data): CSV and JSON

The text behind those pages is in [`site/content/`](site/content/) (Markdown, rendered by the site). Edit it there;
nothing else in the repository repeats it.

## Repository

| Folder | What it holds |
|---|---|
| `site/` | the website: `index.html`, `views.js`, `views2.js`, `i18n/`, the data (`data.json`, `detail.json`) and `content/` (How it works) |
| `pipeline/` | `build_data.py` turns the research files into `site/data.json` and `site/detail.json`; `check_data.py` runs the 44 checks; `tests/` holds the unit tests |
| `research/2026-10/` | every input (JSON) with a notes file beside it: sources, retrieval dates and the reasoning behind each estimate |
| `docs/reference/` | developer notes: [the pipeline](docs/reference/pipeline.md), [the research files](docs/reference/research-files.md), [the site](docs/reference/site.md) |

Run it yourself:

```sh
./setup.sh                                  # dependencies and pre-commit hooks
cd pipeline && uv run build_data.py         # rebuild site/data.json and site/detail.json from research/ (~30 s)
uv run check_data.py                        # the 44 checks (node and Playwright for the browser checks)
uv run pytest -q                            # unit tests (pipeline/tests/)
cd ../site && python3 -m http.server 8000   # open http://localhost:8000
```

CI (`.github/workflows/checks.yml`) does the same on every push to `develop`, on pull requests and before every deploy:
it fails if a fresh build differs from the committed `data.json` and `detail.json` (the build date aside), if any check
fails or if a unit test fails, so commit the rebuilt files with any change to the research files or the pipeline. Details:
[docs/reference/pipeline.md](docs/reference/pipeline.md).

## Corrections

Found a wrong number, a better source or a missing flow? Open an issue with the country, the figure and a link to the
source, or send a message to [u/Intelligent-Cream-14 on Reddit](https://www.reddit.com/user/Intelligent-Cream-14/).

## Licence

- Code: MIT, see [`LICENSE`](LICENSE).
- Data and text (`site/data.json`, `site/content/`, `research/`): CC BY 4.0, see [`LICENSE-DATA.md`](LICENSE-DATA.md).
  The original sources keep their own terms; see the source list in each research file.
- Country shapes: [world-atlas](https://github.com/topojson/world-atlas) (ISC licence), from Natural Earth (public domain).
