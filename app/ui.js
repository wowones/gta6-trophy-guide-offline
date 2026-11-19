// Rendering for the Leonida Legacy dossier: progress header, checklist,
// roadmap and the detail pane beside them. All text is written with textContent.

import { gradeCounts, isRevealed, visibleTrophies } from './state.js';
import { MISSABLE_NOTE, groupByStep, missableCount } from './roadmap.js';

/** Tiny DOM helper. */
function make(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** A grade swatch, styled by CSS rather than an image. */
function medal(trophy) {
  return make('span', `medal ${trophy.grade}`, trophy.grade.slice(0, 3));
}

/** The small flag stack at the right edge of a row. */
function flags(trophy, state) {
  const box = make('div', 'tags');
  if (trophy.missable) box.append(make('span', 'tag miss', 'MISSABLE'));
  if (trophy.hidden) box.append(make('span', 'tag hide', 'HIDDEN'));
  if (state.earned.has(trophy.id)) box.append(make('span', 'tag', 'BANKED'));
  if (!isRevealed(trophy, state) && box.childElementCount === 0) box.append(make('span', 'tag', 'LOCKED'));
  return box;
}

/** One checklist or roadmap line, wired for ticking and selection. */
function trophyRow(trophy, state, handlers, compact) {
  const earned = state.earned.has(trophy.id);
  const row = make('div', `trophy-row${earned ? ' earned' : ''}${state.selected === trophy.id ? ' selected' : ''}`);
  row.dataset.id = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned;
  box.setAttribute('aria-label', `Mark trophy ${trophy.id} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => handlers.onToggle(trophy.id));
  row.append(box, medal(trophy));

  const copy = make('div', 'row-copy');
  if (isRevealed(trophy, state)) {
    copy.append(make('div', 'trophy-name', trophy.name));
    copy.append(make('div', 'trophy-desc', trophy.description));
    if (!compact) copy.append(make('div', 'trophy-hint', trophy.guide.split('. ')[0] + '.'));
  } else {
    copy.append(make('div', 'trophy-name', `ENTRY ${trophy.id} · ${trophy.grade.toUpperCase()}`));
    copy.append(make('div', 'spoiler-line', 'Story spoiler withheld — earn this entry to reveal it. Turn spoilers on to read it now.'));
  }
  row.append(copy, flags(trophy, state));
  row.addEventListener('click', () => handlers.onSelect(trophy.id));
  return row;
}

/** Header count, progress bar and per-grade tally. */
export function renderProgress(state, trophies) {
  document.getElementById('earned-count').textContent = String(state.earned.size);
  const percent = trophies.length ? Math.round((state.earned.size / trophies.length) * 100) : 0;
  document.getElementById('progress-fill').style.width = `${percent}%`;
  document.getElementById('progress-percent').textContent = `${percent}% COMPLETE`;
  document.getElementById('progress-note').textContent = state.demo
    ? 'DEMO CAPTURE — sample ticks seeded; your saved progress is untouched.'
    : `${state.missable ? 'Missable filter active.' : 'Progress saves in this browser.'}`;

  const { totals, banked } = gradeCounts(trophies, state.earned);
  const strip = document.getElementById('grade-strip');
  strip.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    strip.append(make('span', `mini-grade ${grade}`, `${grade.slice(0, 2).toUpperCase()} ${banked[grade]}/${totals[grade]}`));
  }
}

/** Highlight the active view tab. */
export function renderTabs(state) {
  document.getElementById('view-checklist').classList.toggle('active', state.view === 'checklist');
  document.getElementById('view-roadmap').classList.toggle('active', state.view === 'roadmap');
  const spoiler = document.getElementById('spoiler-toggle');
  spoiler.textContent = state.spoilers ? 'SPOILERS: ON' : 'SPOILERS: OFF';
  spoiler.classList.toggle('spoilers-on', state.spoilers);
  spoiler.classList.toggle('spoilers-off', !state.spoilers);
}

/** Build the checklist, or the ordered platinum roadmap when that view is active. */
export function renderList(state, trophies, handlers) {
  const list = document.getElementById('list');
  const shown = visibleTrophies(trophies, state);
  const title = document.getElementById('list-title');
  const intro = document.getElementById('list-intro');
  list.replaceChildren();

  if (state.view === 'checklist') {
    title.textContent = 'THE CHECKLIST';
    intro.textContent = 'Official name, description and grade beside our own cited guidance. Select a row to open its dossier entry.';
    document.getElementById('visible-count').textContent = `${shown.length} shown`;
    if (shown.length === 0) {
      const empty = make('div', 'empty');
      empty.append(make('strong', '', 'NO ENTRIES MATCH'), make('span', '', 'The PS5 list has no online trophies; try another kind or grade.'));
      list.append(empty);
      return;
    }
    for (const trophy of shown) list.append(trophyRow(trophy, state, handlers, false));
    return;
  }

  title.textContent = 'THE PLATINUM ROUTE';
  intro.textContent = `Built from the official descriptions: ${missableCount(trophies)} flagged entries, grouped in nine ordered phases.`;
  document.getElementById('visible-count').textContent = `${shown.length} of ${trophies.length} in route`;
  const groups = groupByStep(shown);
  if (groups.length === 0) {
    list.append(make('div', 'empty', 'No entries match these filters in the route.'));
    return;
  }
  for (const group of groups) {
    const section = make('section', 'step-group');
    const head = make('div', 'step-head');
    const heading = make('div');
    heading.append(make('h3', '', `STEP ${group.step} — ${group.title}`), make('p', '', group.note));
    head.append(heading, make('span', '', `${group.items.length} ENTRIES`));
    const body = make('div', 'step-body');
    for (const trophy of group.items) body.append(trophyRow(trophy, state, handlers, true));
    section.append(head, body);
    list.append(section);
  }
}

/** The right-hand dossier entry: official line, original guide and citations. */
export function renderDetail(state, trophies) {
  const pane = document.getElementById('detail');
  pane.replaceChildren();
  const trophy = trophies.find((item) => item.id === state.selected);

  if (!trophy) {
    const idle = make('div', 'detail-idle');
    const top = make('div', 'detail-top');
    top.append(make('p', 'eyebrow', 'DOSSIER ENTRY'), make('h2', '', 'PICK A TROPHY'));
    const body = make('div', 'detail-body');
    body.append(make('p', '', 'Select any row to read its official description, our own guidance and the sources behind it.'));
    const list = make('ul');
    for (const item of trophies.filter((t) => t.missable).slice(0, 6)) {
      list.append(make('li', '', `${item.name} — flagged for the first pass`));
    }
    body.append(make('p', '', 'Early priorities:'), list);
    idle.append(top, body);
    pane.append(idle);
    return;
  }

  const revealed = isRevealed(trophy, state);
  const top = make('div', 'detail-top');
  const kicker = make('div', 'detail-kicker');
  kicker.append(make('span', '', `ENTRY ${trophy.id} / ${trophies.length}`), make('b', '', `STEP ${trophy.roadmapStep}`));
  top.append(kicker, make('h2', '', revealed ? trophy.name : `ENTRY ${trophy.id} · HIDDEN`));
  if (revealed) top.append(make('p', 'detail-official', trophy.description));
  else top.append(make('p', 'detail-official', 'The official description is spoiler-locked until this trophy is earned.'));
  pane.append(top);

  const body = make('div', 'detail-body');
  const meta = make('div', 'detail-meta');
  meta.append(medal(trophy));
  if (trophy.missable) meta.append(make('span', 'tag miss', 'MISSABLE'));
  if (trophy.hidden) meta.append(make('span', 'tag hide', 'HIDDEN ON PSN'));
  meta.append(make('span', 'tag', trophy.kind.toUpperCase()));
  body.append(meta);

  if (revealed) {
    const guide = make('div', 'guide-block');
    guide.append(make('h3', '', 'FIELD GUIDE'), make('p', '', trophy.guide));
    body.append(guide);

    const sources = make('div', 'sources-block');
    sources.append(make('h3', '', 'SOURCES'));
    const items = make('ul');
    for (const source of trophy.sources) {
      const li = make('li');
      const link = make('a', '', source.title);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      li.append(link, make('span', 'url-host', source.url.replace(/^https?:\/\//, '')));
      items.append(li);
    }
    sources.append(items);
    body.append(sources);

    const miss = make('div', 'miss-block');
    miss.append(make('h3', '', trophy.missable ? 'WHY IT IS FLAGGED' : 'TIMING NOTE'));
    miss.append(make('p', '', trophy.missable ? MISSABLE_NOTE : 'Not tied to one story beat in the published description; it can be finished during clean-up.'));
    body.append(miss);
  } else {
    const locked = make('div', 'guide-block');
    locked.append(make('h3', '', 'SPOILER LOCKED'), make('p', '', 'Earn this trophy or switch spoilers on to read the guide and its sources.'));
    body.append(locked);
  }
  pane.append(body);
}

/** Refresh every region after a state change. */
export function renderAll(state, trophies, handlers) {
  renderProgress(state, trophies);
  renderTabs(state);
  renderList(state, trophies, handlers);
  renderDetail(state, trophies);
}
