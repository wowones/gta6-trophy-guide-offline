# GTA VI Trophy Guide — all 55 trophies, offline and open source

A complete, offline-capable trophy tracker and guide for **Grand Theft Auto VI**: every one of the
55 official trophies with its name, description and grade, a guide to each in the author's own words
with cited sources, a roadmap to the platinum, and the missable trophies flagged.

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An entry in make.fun's **Build the best GTA 6 trophy guide** bounty
([gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01)).

## What it is

A static web app that works from its own files with no network at runtime:

- **Tracker** — a checkbox per trophy, saved in the browser's localStorage, with JSON export/import so
  progress moves between machines.
- **Filters** — by grade (bronze, silver, gold, platinum) and by kind (story, collectible, activity,
  online, hidden, missable).
- **Spoiler mode** — hides story and hidden trophies until they are earned.
- **Roadmap** — the ordered path to the platinum, with every missable trophy called out at the step it
  can be lost.
- **Guides** — a short guide per trophy (what to do, where, and when it can be missed) in the author's
  own words, each citing its sources.
- **Progress** — a bar and per-grade counts.

## Running it

Open `app/index.html` in a desktop browser. No server, no build step, no network.

To build the competition dossier:

```sh
node main.ts
```

`main.ts` copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with
`vendor/makefun-frontend.ts`'s `buildDossier`. Two runs produce a byte-identical dossier.

## Layout

```
app/index.html          the guide UI
app/style.css           neon Vice City theme
app/app.js              entry module
app/state.js            progress state, localStorage, import/export
app/ui.js               rendering, filters, spoiler mode, detail pane
app/roadmap.js          roadmap ordering and missable flags
app/data/trophies.json  all 55 trophies: official name/description/grade, own guide, sources
main.ts                 dossier entrypoint (Node 22)
screenshots/            four 1280x800 JPEGs of the running app
vendor/                 make.fun's dossier library, unmodified
```

## Credits and rights

Trophy **names, descriptions and grades** are the game's own official list. Every **guide text** is
original writing by this entry's author, with sources cited per trophy. No Rockstar artwork, logos or
game assets are included. The app makes no network requests.

Licensed under the MIT License — see [LICENSE](LICENSE).
