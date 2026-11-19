const find = (selector) => document.querySelector(selector);
const all = (selector) => [...document.querySelectorAll(selector)];
const setIcon = (element, name) => element.querySelector('use').setAttribute('href', `/media/icons.svg#${name}`);

// The preview is separate from the Android app and never autoplays.
const audio = find('#preview-audio');
const seek = find('#seek');
const play = find('#play');
const mute = find('#mute');
const repeat = find('#repeat');
const stage = find('#demo');
const error = find('#player-error');
const lines = all('.lyric');
const marks = lines.map((line) => Number(line.dataset.at));
const duration = () => Number.isFinite(audio.duration) ? audio.duration : 16;
const formatTime = (time) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;
let currentLine = -1;

function updateProgress() {
  const time = audio.currentTime;
  seek.max = duration();
  seek.value = time;
  seek.setAttribute('aria-valuetext', `${formatTime(time)} از ${formatTime(duration())}`);
  find('#elapsed').textContent = formatTime(time);
  find('#duration').textContent = formatTime(duration());

  const nextLine = marks.findLastIndex((start) => time >= start);
  if (nextLine === currentLine || nextLine < 0) return;
  lines[currentLine]?.classList.remove('active');
  lines[nextLine].classList.add('active');
  find('.float-en').textContent = lines[nextLine].querySelector('span').textContent;
  find('.float-fa').textContent = lines[nextLine].querySelector('small').textContent;
  currentLine = nextLine;
}

function updatePlayState() {
  const playing = !audio.paused && !audio.ended;
  stage.dataset.playing = String(playing);
  play.setAttribute('aria-label', playing ? 'مکث پخش' : 'پخش نمونهٔ بی‌کلام');
  setIcon(play, playing ? 'pause' : 'play');
}

function showError() {
  error.hidden = false;
  error.textContent = 'پخش نمونه ممکن نشد. دوباره امتحان کن.';
}

play.addEventListener('click', async () => {
  if (!audio.paused) {
    audio.pause();
    return;
  }
  error.hidden = true;
  if (audio.error) audio.load();
  try {
    await audio.play();
  } catch (failure) {
    if (failure.name !== 'AbortError') showError();
  }
});
for (const event of ['loadedmetadata', 'timeupdate', 'seeking', 'ended']) audio.addEventListener(event, updateProgress);
for (const event of ['play', 'pause', 'ended', 'emptied']) audio.addEventListener(event, updatePlayState);
audio.addEventListener('error', showError);

function jump(time) {
  audio.currentTime = Math.min(duration(), Math.max(0, time));
  updateProgress();
}
seek.addEventListener('input', () => jump(Number(seek.value)));
find('#back').addEventListener('click', () => jump(audio.currentTime - 5));
find('#forward').addEventListener('click', () => jump(audio.currentTime + 5));
mute.addEventListener('click', () => {
  audio.muted = !audio.muted;
  mute.setAttribute('aria-pressed', String(audio.muted));
  setIcon(mute, audio.muted ? 'volume-x' : 'volume-2');
});
repeat.addEventListener('click', () => {
  audio.loop = !audio.loop;
  repeat.setAttribute('aria-pressed', String(audio.loop));
});
updateProgress();

function select(buttons, selected) {
  buttons.forEach((button) => button.setAttribute('aria-pressed', String(button === selected)));
}
const modes = all('[data-mode][type=button]');
modes.forEach((button) => button.addEventListener('click', () => {
  select(modes, button);
  find('.lyrics').dataset.mode = button.dataset.mode;
}));

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
