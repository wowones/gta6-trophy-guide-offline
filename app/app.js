// Boot the offline dossier: load the local trophy file, wire the controls and
// render the tracker. The only request made here is for app/data/trophies.json.

import { applyPayload, createState, exportPayload, loadSaved, persist, readParams, syncUrl } from './state.js';
import { renderAll } from './ui.js';

const params = readParams();
const state = createState(params, loadSaved());

const handlers = {
  onToggle(id) {
    if (state.earned.has(id)) state.earned.delete(id);
    else state.earned.add(id);
    persist(state);
    syncUrl(state);
    renderAll(state, trophies, handlers);
  },
  onSelect(id) {
    state.selected = id;
    syncUrl(state);
    renderAll(state, trophies, handlers);
  },
};

let trophies = [];

/** Rebuild every region of the page from the live state. */
function refresh() {
  renderAll(state, trophies, handlers);
}

/** Read the trophy list from the file beside this script. */
async function loadTrophies() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Local trophy file returned ${response.status}.`);
  const doc = await response.json();
  return Array.isArray(doc.trophies) ? doc.trophies : [];
}

/** Attach all toolbar listeners once the data is ready. */
function wireControls() {
  const grade = document.getElementById('grade-filter');
  const kind = document.getElementById('kind-filter');
  const search = document.getElementById('search');

  grade.value = state.grade;
  kind.value = state.kind;
  grade.addEventListener('change', () => {
    state.grade = grade.value;
    syncUrl(state);
    refresh();
  });
  kind.addEventListener('change', () => {
    state.kind = kind.value;
    syncUrl(state);
    refresh();
  });
  search.addEventListener('input', () => {
    state.query = search.value;
    refresh();
  });

  document.getElementById('view-checklist').addEventListener('click', () => {
    state.view = 'checklist';
    syncUrl(state);
    refresh();
  });
  document.getElementById('view-roadmap').addEventListener('click', () => {
    state.view = 'roadmap';
    syncUrl(state);
    refresh();
  });
  document.getElementById('spoiler-toggle').addEventListener('click', () => {
    state.spoilers = !state.spoilers;
    persist(state);
    syncUrl(state);
    refresh();
  });

  document.getElementById('export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(exportPayload(state), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leonida-legacy-progress.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      applyPayload(state, JSON.parse(await file.text()));
      persist(state);
      refresh();
    } catch (error) {
      document.getElementById('progress-note').textContent = `Import failed: ${error.message}`;
    }
    event.target.value = '';
  });
}

try {
  trophies = await loadTrophies();
  wireControls();
  refresh();
  if (state.scroll > 0) window.requestAnimationFrame(() => window.scrollTo(0, state.scroll));
} catch (error) {
  document.getElementById('list').replaceChildren();
  const message = document.createElement('p');
  message.className = 'empty';
  message.textContent = `The local trophy file could not be read: ${error.message}`;
  document.getElementById('list').append(message);
}
