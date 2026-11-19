const find = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const setIcon = (element, name) => element.querySelector('use').setAttribute('href', `/media/icons.svg#${name}`);

function select(buttons, selected) {
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
}

const filters = all('[data-filter]');
const features = all('[data-category]');
filters.forEach((button) => button.addEventListener('click', () => {
  select(filters, button);
  features.forEach((feature) => {
    feature.hidden = button.dataset.filter !== 'all' && feature.dataset.category !== button.dataset.filter;
  });
}));

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
