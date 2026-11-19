// The platinum route. Phases are ordered from the published descriptions:
// story chapters and named missions first, then stranger finales and hidden
// moments, then collectibles, activities, crime, 100% and finally platinum.

export const ROADMAP_PHASES = [
  { step: 1, title: 'PROLOGUE & CHAPTERS', note: 'Bank each chapter-named trophy on the first pass.' },
  { step: 2, title: 'CHAPTER MISSIONS & ENDING', note: 'Named missions, then the gold finale.' },
  { step: 3, title: 'STRANGERS & FREAKS', note: 'Eight strands, including the named finales.' },
  { step: 4, title: 'HIDDEN STORY MOMENTS', note: 'Cryptic descriptions — verify the trigger in game.' },
  { step: 5, title: 'COLLECTIBLES & EXPLORATION', note: 'Sweep the state, card sets and property listings.' },
  { step: 6, title: 'ACTIVITIES & CLEAN-UP', note: 'Counters, sports, ranges and vehicle lists.' },
  { step: 7, title: 'CRIME & LAUNDERING', note: 'Robberies, operations and Marked Bills.' },
  { step: 8, title: '100% COMPLETION', note: 'The last big clean-up before the ending sweep.' },
  { step: 9, title: 'PLATINUM', note: 'Awarded once the other 54 are in the bank.' },
];

export const MISSABLE_NOTE = 'Flagged from the official description: it belongs to one chapter, mission or moment. Clear it on the first pass or use chapter select before the ending.';

/** Group trophies into roadmap phases in step order, then id order. */
export function groupByStep(trophies) {
  return ROADMAP_PHASES.map((phase) => ({
    ...phase,
    items: trophies.filter((trophy) => trophy.roadmapStep === phase.step).sort((a, b) => a.id - b.id),
  })).filter((phase) => phase.items.length > 0);
}

/** A short headline count of the flagged entries for the roadmap header. */
export function missableCount(trophies) {
  return trophies.reduce((n, trophy) => n + (trophy.missable ? 1 : 0), 0);
}
