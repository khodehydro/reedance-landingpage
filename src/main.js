const find = (selector) => document.querySelector(selector);
const setIcon = (element, name) => element.querySelector('use').setAttribute('href', `/media/icons.svg#${name}`);

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
