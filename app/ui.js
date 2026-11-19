// Rendering layer for the checklist, the progress bar and the cited detail pane.
// All text is inserted with textContent; the only anchors are the citation links in the data.

/** Story and hidden entries stay masked until earned, unless spoilers are switched on. */
export function isMasked(trophy, spoilers, earned) {
  if (spoilers || earned.has(String(trophy.id))) return false;
  return trophy.kind === 'story' || trophy.kind === 'hidden';
}

/** Apply grade, kind, missable, spoiler-visibility and text filters. */
export function filterTrophies(trophies, settings, query) {
  return trophies.filter((trophy) => {
    if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
    if (settings.kind !== 'all' && trophy.kind !== settings.kind) return false;
    if (settings.missableOnly && !trophy.missable) return false;
    if (query.filter === 'missable' && !trophy.missable) return false;
    if (query.kind && trophy.kind !== query.kind) return false;
    if (query.search) {
      const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
      if (!haystack.includes(query.search.toLowerCase())) return false;
    }
    return true;
  });
}

/** Update the big counter, the gradient bar and the per-grade chips. */
export function renderProgress(label, percent, fill, countsEl, trophies, earned) {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(String(t.id))).length;
  label.textContent = `${done} / ${total} earned`;
  percent.textContent = `${Math.round((done / total) * 100)}%`;
  fill.style.width = `${(done / total) * 100}%`;
  countsEl.replaceChildren();
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = trophies.filter((t) => t.grade === grade);
    if (!all.length) continue;
    const got = all.filter((t) => earned.has(String(t.id))).length;
    const pill = document.createElement('span');
    pill.className = `count-pill ${grade}`;
    pill.textContent = `${grade} `;
    const value = document.createElement('b');
    value.textContent = `${got}/${all.length}`;
    pill.append(value);
    countsEl.append(pill);
  }
}

/** One line of small text under the toolbar. */
export function renderFilterSummary(el, shown, total, settings) {
  const bits = [];
  if (settings.grade !== 'all') bits.push(`grade ${settings.grade}`);
  if (settings.kind !== 'all') bits.push(`kind ${settings.kind}`);
  if (settings.missableOnly) bits.push('missables only');
  if (!settings.spoilers) bits.push('story spoilers hidden');
  el.replaceChildren();
  const lead = document.createElement('b');
  lead.textContent = `Showing ${shown} of ${total} trophies`;
  el.append(lead);
  if (bits.length) el.append(document.createTextNode(` · ${bits.join(' · ')}`));
}

/** Build a grade pill. */
function gradePill(grade) {
  const el = document.createElement('span');
  el.className = `grade ${grade}`;
  el.textContent = grade;
  return el;
}

/** Render the scrollable checklist. */
export function renderList(container, trophies, earned, settings, onToggle, onSelect) {
  container.replaceChildren();
  for (const trophy of trophies) {
    const masked = isMasked(trophy, settings.spoilers, earned);
    const row = document.createElement('div');
    row.className = 'row';
    row.dataset.id = String(trophy.id);
    if (earned.has(String(trophy.id))) row.classList.add('is-earned');
    if (settings.selected === trophy.id) row.classList.add('is-selected');

    const checkCell = document.createElement('div');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(String(trophy.id));
    box.setAttribute('aria-label', `Mark ${masked ? `trophy ${trophy.id}` : trophy.name} as earned`);
    box.addEventListener('change', () => onToggle(trophy, box.checked));
    box.addEventListener('click', (event) => event.stopPropagation());
    checkCell.append(box);

    const main = document.createElement('div');
    const name = document.createElement('div');
    name.className = `row-name${masked ? ' spoiled' : ''}`;
    name.textContent = masked ? `Story entry #${trophy.id} — spoiler hidden` : trophy.name;
    const desc = document.createElement('div');
    desc.className = 'row-desc';
    desc.textContent = masked ? 'Earn it, or switch spoilers on, to reveal the name and description.' : trophy.description;
    const meta = document.createElement('div');
    meta.className = 'row-meta';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = masked ? 'hidden' : trophy.kind;
    meta.append(kindTag);
    if (trophy.missable && !masked) {
      const miss = document.createElement('span');
      miss.className = 'tag missable';
      miss.textContent = 'missable';
      meta.append(miss);
    }
    main.append(name, desc, meta);

    row.append(checkCell, main, gradePill(trophy.grade));
    row.addEventListener('click', () => onSelect(trophy));
    container.append(row);
  }
}

/** Render the right-hand pane: official text, original advice, missable note and citations. */
export function renderDetail(container, trophy, earned, spoilers, onToggle) {
  container.replaceChildren();
  if (!trophy) {
    const empty = document.createElement('div');
    empty.className = 'detail-empty';
    const title = document.createElement('h2');
    title.textContent = 'Field notes';
    const text = document.createElement('p');
    text.textContent = 'Pick a trophy from the list to read its guide, its missable warning and the sources behind the advice. Use the grade and kind filters, or the missables switch, to plan a route.';
    const tip = document.createElement('p');
    tip.textContent = 'Tip: the spoiler switch masks story and hidden names until you have earned them.';
    empty.append(title, text, tip);
    container.append(empty);
    return;
  }

  const masked = isMasked(trophy, spoilers, earned);
  const id = document.createElement('div');
  id.className = 'detail-id';
  id.textContent = `Trophy ${String(trophy.id).padStart(2, '0')} / 55`;
  const title = document.createElement('h2');
  title.textContent = masked ? `Story entry #${trophy.id}` : trophy.name;

  const chips = document.createElement('div');
  chips.className = 'detail-chips';
  chips.append(gradePill(trophy.grade));
  for (const label of [masked ? 'hidden' : trophy.kind, ...(trophy.missable ? ['missable'] : [])]) {
    const tag = document.createElement('span');
    tag.className = `tag${label === 'missable' ? ' missable' : ''}`;
    tag.textContent = label;
    chips.append(tag);
  }

  const officialLabel = document.createElement('div');
  officialLabel.className = 'detail-label';
  officialLabel.textContent = 'Official description';
  const official = document.createElement('div');
  official.className = 'detail-official';
  official.textContent = masked ? 'Hidden until earned — enable spoilers to read it.' : trophy.description;

  const guideLabel = document.createElement('div');
  guideLabel.className = 'detail-label';
  guideLabel.textContent = 'Field guide (original)';
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = masked ? 'This entry is still under the spoiler mask. Earn it or enable spoilers to read its guide.' : trophy.guide;

  container.append(id, title, chips, officialLabel, official, guideLabel, guide);

  if (trophy.missable && !masked) {
    const warn = document.createElement('div');
    warn.className = 'detail-warning';
    warn.textContent = 'Missable flag: the official wording points to a one-time moment, a closing window or a choice. Deal with it before you move past that chapter or opportunity.';
    container.append(warn);
  }

  const sourceLabel = document.createElement('div');
  sourceLabel.className = 'detail-label';
  sourceLabel.textContent = 'Where this comes from';
  const list = document.createElement('ul');
  list.className = 'source-list';
  for (const source of trophy.sources ?? []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `${source.title} ↗`;
    item.append(link);
    list.append(item);
  }
  container.append(sourceLabel, list);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'btn btn-primary';
  toggle.style.marginTop = '14px';
  toggle.textContent = earned.has(String(trophy.id)) ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggle(trophy, !earned.has(String(trophy.id))));
  container.append(toggle);
}
