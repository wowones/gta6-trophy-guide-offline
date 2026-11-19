# GTA VI Trophy Guide — Offline Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/wowones/gta6-trophy-guide-offline/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline trophy tracker and walkthrough companion for Grand Theft Auto VI. It covers the full set of 55 trophies, lets you record your progress as you play, and keeps every hint, step, and roadmap note available without needing a connection. This project is an entry in make.fun's `gta6-trophy-guide-01` bounty.

## What you get

- A browsable list of all 55 trophies with their official names, descriptions, and grades.
- Original written guidance for each trophy, with sources cited rather than copied.
- A roadmap view that groups trophies into a sensible order for a first playthrough.
- Local, in-browser progress tracking that persists between visits.
- A completely offline experience: no network requests and no Rockstar artwork are bundled with the app.

## Opening the app

The tracker is a static site, so there is nothing to install or serve. Open `app/index.html` directly in any modern browser. All scripts, styles, and data load from relative paths, and your progress is stored locally in the browser.

## Building the dossier

A small Node script assembles the printed dossier from the trophy data. With Node.js installed, run the following from the repository root:

```sh
node main.ts
```

This builds the dossier output used alongside the interactive guide. The script works offline and only reads the files in this repository.

## Project layout

```
app/
  index.html          Page shell and markup for the tracker
  style.css           Styling for the interface
  app.js              Entry point that wires everything together
  state.js            Progress state and local persistence
  ui.js               Rendering and user interaction helpers
  roadmap.js          Ordered roadmap and trophy grouping logic
  data/
    trophies.json     Trophy names, descriptions, grades, and guide text
main.ts               Dossier build script
screenshots/          Reference screenshots used during development
vendor/               Bundled third-party assets
```

## Content and sources

Trophy names, descriptions, and grades come from the game's official trophy list. Every piece of guide text — hints, walkthrough steps, and roadmap commentary — is original writing produced for this project, with the sources consulted cited in the guide. No copyrighted Rockstar artwork is included; the interface uses its own styling and text-based presentation.

## Privacy

The application makes no network requests. It does not phone home, fetch remote assets, or send your progress anywhere — everything happens locally in your browser.

## License

Released under the MIT License. You are free to use, modify, and redistribute it subject to the terms of that license.
