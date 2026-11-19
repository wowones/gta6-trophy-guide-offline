// Boot module: load the local trophy data, apply URL state, and wire the controls.
// The only fetch in the whole app is the JSON file beside this page.

import { loadEarned, saveEarned, loadSettings, saveSettings, demoEarned, readQuery, parseImported, downloadProgress } from './state.js';
import { renderProgress, renderFilterSummary, renderList, renderDetail, filterTrophies } from './ui.js';
import { renderRoadmap } from './roadmap.js';

const byId = (id) => document.getElementById(id);
const query = readQuery();
const settings = loadSettings();
let trophies = [];
let earned = query.demo ? demoEarned() : loadEarned();

// URL parameters win over stored choices so a single link opens the exact view wanted.
if (query.grade) settings.grade = query.grade;
if (query.kind) settings.kind = query.kind;
if (query.filter === 'missable') settings.missableOnly = true;
if (query.trophy) {
  settings.selected = Number.parseInt(query.trophy, 10);
  if (query.view !== 'roadmap') settings.view = 'checklist';
}
if (query.view === 'roadmap' || query.view === 'checklist') settings.view = query.view;
if (query.demo && settings.selected === null) settings.selected = 17;

const controls = {
  grade: byId('grade-filter'),
  kind: byId('kind-filter'),
  search: byId('search'),
  missable: byId('missable-only'),
  spoilers: byId('spoilers'),
  list: byId('trophy-list'),
  detail: byId('detail'),
  roadmap: byId('roadmap'),
};

controls.grade.value = settings.grade;
controls.kind.value = settings.kind;
controls.missable.checked = Boolean(settings.missableOnly);
controls.spoilers.checked = Boolean(settings.spoilers);
controls.search.value = query.search ?? '';

function currentQuery() {
  return { filter: query.filter, kind: query.kind, search: controls.search.value.trim() };
}

/** Draw every region of the page from the current state. */
function render() {
  if (!trophies.length) return;
  renderProgress(byId('progress-label'), byId('progress-percent'), byId('progress-fill'), byId('grade-counts'), trophies, earned);

  const shown = filterTrophies(trophies, settings, currentQuery());
  renderFilterSummary(byId('filter-summary'), shown.length, trophies.length, settings);
  renderList(controls.list, shown, earned, settings, toggleTrophy, selectTrophy);

  const selected = trophies.find((t) => t.id === settings.selected);
  renderDetail(controls.detail, selected, earned, settings.spoilers, toggleTrophy);
  renderRoadmap(controls.roadmap, trophies, earned, (trophy) => {
    settings.selected = trophy.id;
    settings.view = 'checklist';
    saveSettings(settings);
    render();
  });

  byId('checklist-view').hidden = settings.view !== 'checklist';
  byId('roadmap-view').hidden = settings.view !== 'roadmap';
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('is-active', tab.dataset.view === settings.view);
  }
}

/** Tick or untick one trophy and persist it. */
function toggleTrophy(trophy, checked) {
  const key = String(trophy.id);
  if (checked) earned.add(key);
  else earned.delete(key);
  saveEarned(earned);
  render();
}

/** Open a trophy in the detail pane. */
function selectTrophy(trophy) {
  settings.selected = trophy.id;
  saveSettings(settings);
  render();
}

/** Switch between checklist and roadmap. */
function switchView(view) {
  settings.view = view;
  saveSettings(settings);
  render();
}

controls.grade.addEventListener('change', () => {
  settings.grade = controls.grade.value;
  saveSettings(settings);
  render();
});
controls.kind.addEventListener('change', () => {
  settings.kind = controls.kind.value;
  saveSettings(settings);
  render();
});
controls.search.addEventListener('input', render);
controls.missable.addEventListener('change', () => {
  settings.missableOnly = controls.missable.checked;
  saveSettings(settings);
  render();
});
controls.spoilers.addEventListener('change', () => {
  settings.spoilers = controls.spoilers.checked;
  saveSettings(settings);
  render();
});

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => switchView(tab.dataset.view));
}

byId('export').addEventListener('click', () => downloadProgress(earned));
byId('import').addEventListener('change', async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    earned = parseImported(await file.text());
    saveEarned(earned);
    render();
  } catch {
    window.alert('That file could not be read as trophy progress. Import a JSON file exported from this tracker.');
  }
  event.target.value = '';
});

const response = await fetch('./data/trophies.json');
if (!response.ok) throw new Error('Could not read the local trophy data');
const documentData = await response.json();
trophies = documentData.trophies ?? [];
render();

// Screenshot links can request a scroll position; otherwise reveal the chosen trophy.
requestAnimationFrame(() => {
  if (Number.isFinite(query.scroll)) controls.list.scrollTop = query.scroll;
  else if (settings.selected !== null) {
    const row = controls.list.querySelector(`[data-id="${settings.selected}"]`);
    if (row) row.scrollIntoView({ block: 'nearest' });
  }
});
