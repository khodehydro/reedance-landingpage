const find = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const setIcon = (element, name) => element.querySelector('use').setAttribute('href', `/media/icons.svg#${name}`);

const board = find('.feature-board');
const cells = all('.feature-cell');
const panels = cells.map((cell) => document.getElementById(cell.hash.slice(1)));

function activateFeature(index) {
  cells.forEach((cell, i) => {
    const active = i === index;
    cell.setAttribute('aria-selected', String(active));
    cell.tabIndex = active ? 0 : -1;
    panels[i].hidden = !active;
  });
}

// Without JavaScript the cells are regular links, and all feature descriptions stay visible.
board.setAttribute('role', 'tablist');
const rtl = getComputedStyle(board).direction === 'rtl';
cells.forEach((cell, i) => {
  const panel = panels[i];
  cell.setAttribute('role', 'tab');
  cell.setAttribute('aria-controls', panel.id);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', cell.id);
  panel.tabIndex = 0;

  cell.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    activateFeature(i);
    if (cells.some((item) => item.hash === location.hash)) history.replaceState(null, '', cell.hash);
  });
  cell.addEventListener('keydown', (event) => {
    let next;
    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cells.length - 1;
    else if (event.key === 'ArrowRight') next = i + (rtl ? -1 : 1);
    else if (event.key === 'ArrowLeft') next = i + (rtl ? 1 : -1);
    else if (event.key === ' ') next = i;
    else return;
    event.preventDefault();
    next = (next + cells.length) % cells.length;
    activateFeature(next);
    cells[next].focus();
  });
});

function activateLinkedFeature() {
  const index = cells.findIndex((cell) => cell.hash === location.hash);
  if (index !== -1) activateFeature(index);
}
activateFeature(0);
activateLinkedFeature();
window.addEventListener('hashchange', activateLinkedFeature);

const wordCard = find('.word-card');
wordCard.addEventListener('click', () => {
  const open = wordCard.getAttribute('aria-expanded') === 'false';
  wordCard.setAttribute('aria-expanded', String(open));
  find('#word-meaning').hidden = !open;
  find('.word-prompt').firstChild.textContent = open ? 'پنهان کردن معنی ' : 'نمایش معنی ';
});

const answers = all('[data-answer]');
answers.forEach((button) => button.addEventListener('click', () => {
  const correct = button.dataset.answer === 'true';
  answers.forEach((answer) => answer.classList.remove('correct', 'incorrect'));
  button.classList.add(correct ? 'correct' : 'incorrect');
  find('.feedback').textContent = correct ? 'درسته! «صدا» جواب درست بود.' : 'این یکی نه؛ دوباره امتحان کن.';
}));

const menu = find('.menu-toggle');
const nav = find('#site-nav');
function setMenu(open) {
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'بستن منو' : 'باز کردن منو');
  nav.dataset.open = String(open);
  setIcon(menu, open ? 'x' : 'menu');
}
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.dataset.open === 'true') {
    setMenu(false);
    menu.focus();
  }
});
