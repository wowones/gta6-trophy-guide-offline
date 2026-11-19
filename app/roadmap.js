// The platinum route. Stages are a reading order built from the official descriptions:
// fixed story beats first, then the windows that can close, then the long collectible and skill grinds.

export const STAGES = [
  { step: 1, title: 'Story spine', blurb: 'Let the campaign carry you through the chapters and named missions. These trophies unlock on completion screens.' },
  { step: 2, title: 'Windows that close', blurb: 'While each chapter is current, clear stranger strands, one-off requests and the cryptic moments flagged amber. This is where a platinum run is usually lost.' },
  { step: 3, title: 'Map sweep', blurb: 'With the world open, work through collectibles, exploration, discovery and repeatable side activities region by region.' },
  { step: 4, title: 'The long grind', blurb: 'Medals, challenges, spending and 100% completion. These only count when the game registers each final entry.' },
  { step: 5, title: 'Platinum', blurb: 'Nothing to do but watch the last trophy pop. If something is still missing, the checklist and missable filter will show it.' },
];

/** Group the trophy list by roadmapStep, preserving the file's order within a stage. */
export function groupByStage(trophies) {
  return STAGES.map((stage) => ({
    ...stage,
    trophies: trophies.filter((trophy) => trophy.roadmapStep === stage.step),
  }));
}

/** Build the staged roadmap cards; chips are buttons that jump the checklist to a trophy. */
export function renderRoadmap(container, trophies, earned, onPick) {
  container.replaceChildren();
  for (const stage of groupByStage(trophies)) {
    const card = document.createElement('article');
    card.className = 'stage';

    const number = document.createElement('div');
    number.className = 'stage-num';
    number.textContent = String(stage.step).padStart(2, '0');

    const body = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = `Stage ${stage.step} — ${stage.title}`;
    const blurb = document.createElement('p');
    blurb.textContent = stage.blurb;
    const chips = document.createElement('div');
    chips.className = 'stage-trophies';

    for (const trophy of stage.trophies) {
      const chip = document.createElement('button');
      chip.type = 'button';
      const classes = ['stage-chip'];
      if (trophy.missable) classes.push('miss');
      if (earned.has(String(trophy.id))) classes.push('done');
      chip.className = classes.join(' ');
      chip.textContent = `${trophy.missable ? '◆ ' : ''}${trophy.name}`;
      chip.title = trophy.description;
      chip.addEventListener('click', () => onPick(trophy));
      chips.append(chip);
    }

    body.append(heading, blurb, chips);
    card.append(number, body);
    container.append(card);
  }
}
