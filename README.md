# Leonida Ledger — an offline GTA VI trophy guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

A free, offline trophy tracker and guide for all 55 trophies in Grand Theft Auto VI on PlayStation 5. This repository is my entry in make.fun's **gta6-trophy-guide-01** bounty ("Build the best GTA 6 trophy guide").

The app shows the official name, description and grade for every trophy, a checklist that saves to `localStorage`, progress totals by grade, grade and kind filters, a missable-only filter, a spoiler setting that masks story and hidden trophies until you earn them, a detail pane with original guidance and cited sources, and a staged roadmap to the platinum. Progress can be downloaded as a JSON file and imported back. Everything runs from local files with no build step and no network connection.

## Open the guide

No server, install or build is required. Open `app/index.html` in a desktop browser (Chrome works well). The page loads its own CSS, JavaScript modules and `app/data/trophies.json` from the folder beside it. If your browser restricts local module loads from `file://`, serve the `app/` folder as the web root with any static server and open `index.html` there — nothing else changes.

The cover screenshot and the other captures in `screenshots/` are real renders of this app. Query parameters make particular views easy to capture or share:

| Parameter | Effect |
| --- | --- |
| `?grade=silver` | Start with the silver grade filter applied |
| `?filter=missable` | Start with only missable trophies shown |
| `?view=roadmap` | Open on the platinum roadmap |
| `?trophy=17` | Open the detail pane on a specific trophy id |
| `?scroll=600` | Scroll the list by a number of pixels |
| `?demo=1` | Seed a few completed trophies so the progress bar and counts are visible |

Parameters can be combined, for example `?view=roadmap&demo=1`.

## Build the dossier

`main.ts` is the Node 22 submission program. It copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the kit's `buildDossier` library:

```sh
node main.ts
```

Inside the grader the destination is `/output`; locally, `MAKEFUN_OUTPUT_DIR` stands in for it:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It checks the screenshot set first (3 or 4 images, each at most 256 KiB), then prints the number of bytes written to `dossier.json`. Two runs produce byte-identical output.

## Layout

```
main.ts                       Node 22 entrypoint; copies files and writes dossier.json
vendor/makefun-frontend.ts     the kit's dossier library, used unchanged
LICENSE                        MIT
README.md                      this file
app/
  index.html                   page shell and controls
  style.css                    neon Vice City theme, system fonts only
  app.js                       boot, data load and event wiring
  state.js                     progress store, demo seed, export/import, URL state
  ui.js                        checklist, detail pane, progress and filters
  roadmap.js                   platinum stages and the roadmap view
  data/trophies.json           the 55 trophies, guides and citations
screenshots/                   four JPEG renders of the running app
```

## Data, sources and originality

Trophy names, descriptions and grades in `app/data/trophies.json` are the game's official PlayStation list and are reproduced as published. Every guide sentence, the kind and missable classifications, the roadmap stages and all interface code are written for this project. Each trophy carries a `sources` array with a real, relevant link; the detail pane shows those links beside the advice so a reader can check where a claim comes from. Following a link only happens if the reader clicks it — the app itself never fetches a URL. It contains no Rockstar Games logo, official artwork, box art or game screenshots; the visual design is original CSS.

## License

MIT. See [LICENSE](LICENSE).
