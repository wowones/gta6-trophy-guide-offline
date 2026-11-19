// Progress storage, demo seeding, export/import and URL query state for the Ledger.
// Nothing here talks to a server: progress lives in localStorage and in files the reader chooses.

const PROGRESS_KEY = 'leonida-ledger/progress/v1';
const SETTINGS_KEY = 'leonida-ledger/settings/v1';
const DEMO_EARNED = [2, 3, 4, 5, 8, 9, 15, 17, 18, 21, 30, 35, 42];

/** Read the saved ids as a Set. Bad or stale storage simply starts the tracker empty. */
export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.map(String) : []);
  } catch {
    return new Set();
  }
}

/** Persist the earned ids. */
export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned]));
}

/** Read the last-used filter and view choices. */
export function loadSettings() {
  const fallback = { grade: 'all', kind: 'all', missableOnly: false, spoilers: false, view: 'checklist', selected: null };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return fallback;
  }
}

/** Persist filter and view choices. */
export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/** A small, fixed set of completions so a screenshot shows a working progress bar. */
export function demoEarned() {
  return new Set(DEMO_EARNED.map(String));
}

/** Read the shareable view parameters the screenshot URLs use. */
export function readQuery() {
  const q = new URLSearchParams(location.search);
  return {
    grade: q.get('grade'),
    kind: q.get('kind'),
    filter: q.get('filter'),
    view: q.get('view'),
    trophy: q.get('trophy'),
    scroll: Number.parseInt(q.get('scroll') ?? '', 10),
    demo: q.get('demo') === '1',
  };
}

/** Turn a downloaded or imported JSON payload into a clean Set of trophy ids. */
export function parseImported(text) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : (Array.isArray(data?.earned) ? data.earned : (Array.isArray(data?.trophies) ? data.trophies : []));
  const ids = list.map((item) => (typeof item === 'object' && item !== null ? item.id : item)).filter((v) => v !== undefined && v !== null);
  return new Set(ids.map(String));
}

/** Download the current ticks as a JSON file without any network activity. */
export function downloadProgress(earned) {
  const payload = JSON.stringify({ app: 'Leonida Ledger', earned: [...earned].map(Number).sort((a, b) => a - b) }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
