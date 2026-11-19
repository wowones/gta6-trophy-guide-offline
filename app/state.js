// State for the Leonida Legacy tracker: URL deep links, local progress,
// filtering and the spoiler rule. No networking lives in this file.

export const STORAGE_KEY = 'leonida-legacy-progress-v1';

// A few banked entries for screenshot captures; this mode never writes storage.
export const DEMO_EARNED = [2, 3, 4, 5, 8, 15, 17, 30, 42, 54];

const GRADES = new Set(['all', 'platinum', 'gold', 'silver', 'bronze']);
const KINDS = new Set(['all', 'story', 'collectible', 'activity', 'online', 'hidden', 'missable']);

/** Read the deep-link state from the address bar. */
export function readParams() {
  const q = new URLSearchParams(window.location.search);
  const grade = q.get('grade') ?? 'all';
  const kind = q.get('kind') ?? q.get('filter') ?? 'all';
  const trophy = Number.parseInt(q.get('trophy') ?? '', 10);
  const scroll = Number.parseInt(q.get('scroll') ?? '', 10);
  const spoiler = q.get('spoiler');
  return {
    grade: GRADES.has(grade) ? grade : 'all',
    kind: KINDS.has(kind) ? kind : 'all',
    view: q.get('view') === 'roadmap' ? 'roadmap' : 'checklist',
    trophy: Number.isFinite(trophy) ? trophy : null,
    scroll: Number.isFinite(scroll) ? scroll : 0,
    demo: q.get('demo') === '1',
    spoilerOverride: spoiler === 'off' ? false : spoiler === 'on' ? true : null,
  };
}

/** Load the saved tick list, tolerating a missing or broken storage value. */
export function loadSaved() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Build the live state object from a deep link and any saved progress. */
export function createState(params, saved) {
  const savedIds = saved ? saved.earned.map(Number).filter(Number.isFinite) : [];
  const earned = new Set(params.demo ? DEMO_EARNED : savedIds);
  const spoilers = params.spoilerOverride ?? (typeof saved?.spoilers === 'boolean' ? saved.spoilers : true);
  return {
    earned,
    grade: params.grade,
    kind: params.kind,
    view: params.view,
    query: '',
    spoilers,
    demo: params.demo,
    selected: params.trophy ?? (params.demo ? 30 : null),
    scroll: params.scroll,
  };
}

/** Persist only in normal mode; screenshot captures must not touch a real save. */
export function persist(state) {
  if (state.demo) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(exportPayload(state)));
  } catch {
    /* Private browsing can refuse storage; the in-memory tracker still works. */
  }
}

/** The portable JSON shape written by Export and accepted by Import. */
export function exportPayload(state) {
  return {
    app: 'leonida-legacy',
    version: 1,
    earned: [...state.earned].sort((a, b) => a - b),
    spoilers: state.spoilers,
  };
}

/** Replace progress from an imported payload, ignoring anything malformed. */
export function applyPayload(state, payload) {
  if (!payload || !Array.isArray(payload.earned)) throw new Error('That file is not a Leonida Legacy progress export.');
  state.earned = new Set(payload.earned.map(Number).filter(Number.isFinite));
  if (typeof payload.spoilers === 'boolean') state.spoilers = payload.spoilers;
}

/** Count earned entries per grade for the header strip. */
export function gradeCounts(trophies, earned) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const banked = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    totals[trophy.grade] += 1;
    if (earned.has(trophy.id)) banked[trophy.grade] += 1;
  }
  return { totals, banked };
}

/** The kind filter reads both the primary kind and the secondary flags. */
export function kindMatches(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'hidden') return trophy.hidden === true;
  return trophy.kind === kind;
}

/** Apply grade, kind and free-text filters in list order. */
export function visibleTrophies(trophies, state) {
  const needle = state.query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (!kindMatches(trophy, state.kind)) return false;
    if (!needle) return true;
    return `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase().includes(needle);
  });
}

/** A story or hidden entry stays masked until it is earned and spoilers are off. */
export function isRevealed(trophy, state) {
  if (state.spoilers) return true;
  if (state.earned.has(trophy.id)) return true;
  return trophy.kind !== 'story' && !trophy.hidden;
}

/** Keep the address bar in step with the controls, where the browser allows it. */
export function syncUrl(state) {
  try {
    const q = new URLSearchParams(window.location.search);
    q.set('grade', state.grade);
    q.set('kind', state.kind);
    q.set('view', state.view);
    if (state.selected !== null) q.set('trophy', String(state.selected));
    else q.delete('trophy');
    q.set('spoiler', state.spoilers ? 'on' : 'off');
    if (state.demo) q.set('demo', '1');
    window.history.replaceState(null, '', `${window.location.pathname}?${q.toString()}`);
  } catch {
    /* file:// pages may refuse history writes; deep links still work on load. */
  }
}
