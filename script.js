const body = document.body;
const chooserView = document.getElementById('chooserView');
const coinView = document.getElementById('coinView');
const diceView = document.getElementById('diceView');
const themeToggle = document.getElementById('themeToggle');
const chooseCoin = document.getElementById('chooseCoin');
const chooseDice = document.getElementById('chooseDice');
const backFromCoin = document.getElementById('backFromCoin');
const backFromDice = document.getElementById('backFromDice');
const coinVisual = document.getElementById('coinVisual');
const diceDisplay = document.getElementById('diceDisplay');
const diceShadow = document.getElementById('diceShadow');
const coinBtn = document.getElementById('coinBtn');
const diceBtn = document.getElementById('diceBtn');

function setTheme(mode) {
  body.classList.toggle('dark', mode === 'dark');
  localStorage.setItem('flip-coin-theme', mode);
}

function initTheme() {
  const saved = localStorage.getItem('flip-coin-theme');
  setTheme(saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
}

function swapView(nextView, currentView) {
  currentView.classList.remove('is-entering');
  currentView.classList.add('is-leaving');
  currentView.hidden = false;
  nextView.hidden = false;
  nextView.classList.remove('is-leaving');
  nextView.classList.add('is-entering');
  setTimeout(() => {
    currentView.hidden = true;
    currentView.classList.remove('is-leaving');
    nextView.classList.remove('is-entering');
  }, 300);
}

function openView(view) {
  const current = chooserView.hidden ? (coinView.hidden ? diceView : coinView) : chooserView;
  if (view === 'chooser') return swapView(chooserView, current);
  if (view === 'coin') {
    swapView(coinView, current);
    coinVisual.style.transform = 'rotateY(0deg)';
    return;
  }
  if (view === 'dice') {
    swapView(diceView, current);
    diceDisplay.style.transform = 'translateY(0) scale(1) rotate(0deg)';
  }
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function animateCoin() {
  const result = Math.random() < 0.5 ? '正面' : '反面';
  const finalRotation = 1620 + randomInt(0, 4) * 180 + (result === '正面' ? 0 : 180);
  coinVisual.style.setProperty('--final-rotation', `${finalRotation}deg`);
  coinVisual.classList.remove('flip');
  void coinVisual.offsetWidth;
  coinVisual.classList.add('flip');
  coinBtn.disabled = true;
  setTimeout(() => {
    coinVisual.style.transform = `rotateY(${result === '正面' ? 0 : 180}deg)`;
    coinBtn.disabled = false;
  }, 1180);
}

function faceRotation(value) { return (value - 1) * 90; }

function animateDice() {
  const value = randomInt(1, 6);
  const finalRotation = faceRotation(value);
  const spin = randomInt(3, 5) * 360 + finalRotation;
  diceDisplay.style.setProperty('--final-rotation', `${spin}deg`);
  diceDisplay.classList.remove('roll');
  void diceDisplay.offsetWidth;
  diceDisplay.classList.add('roll');
  diceBtn.disabled = true;
  diceShadow.style.transform = 'scale(1.22) translateY(8px)';
  setTimeout(() => {
    diceDisplay.style.transform = `translateY(0) scale(1) rotate(${finalRotation}deg)`;
    diceDisplay.dataset.value = String(value);
    diceShadow.style.transform = 'scale(0.94) translateY(0)';
    diceBtn.disabled = false;
  }, 1180);
}

themeToggle.addEventListener('click', () => setTheme(body.classList.contains('dark') ? 'light' : 'dark'));
chooseCoin.addEventListener('click', () => openView('coin'));
chooseDice.addEventListener('click', () => openView('dice'));
backFromCoin.addEventListener('click', () => openView('chooser'));
backFromDice.addEventListener('click', () => openView('chooser'));
coinBtn.addEventListener('click', animateCoin);
diceBtn.addEventListener('click', animateDice);

initTheme();
chooserView.hidden = false;
coinView.hidden = true;
diceView.hidden = true;
