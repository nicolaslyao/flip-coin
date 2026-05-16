const body = document.body;
const themeMeta = document.querySelector('meta[name="theme-color"]');
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
const resetStatsBtn = document.getElementById('resetStatsBtn');
const keepStatsToggle = document.getElementById('keepStatsToggle');
const headsCountEl = document.getElementById('headsCount');
const tailsCountEl = document.getElementById('tailsCount');
const diceCountEls = [1, 2, 3, 4, 5, 6].map((value) => document.getElementById(`diceCount${value}`));
const statsKey = 'flip-coin-stats-v2';
const keepStatsKey = 'flip-coin-keep-stats';
let audioContext;
let sessionStats = createEmptyStats();

function createEmptyStats() {
  return { coin: { heads: 0, tails: 0 }, dice: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 } };
}

function normalizeStats(stats) {
  const empty = createEmptyStats();
  return {
    coin: {
      heads: Number(stats?.coin?.heads ?? stats?.heads ?? empty.coin.heads),
      tails: Number(stats?.coin?.tails ?? stats?.tails ?? empty.coin.tails),
    },
    dice: {
      1: Number(stats?.dice?.[1] ?? empty.dice[1]),
      2: Number(stats?.dice?.[2] ?? empty.dice[2]),
      3: Number(stats?.dice?.[3] ?? empty.dice[3]),
      4: Number(stats?.dice?.[4] ?? empty.dice[4]),
      5: Number(stats?.dice?.[5] ?? empty.dice[5]),
      6: Number(stats?.dice?.[6] ?? empty.dice[6]),
    },
  };
}

function setTheme(mode) {
  const isDark = mode === 'dark';
  body.classList.toggle('dark', isDark);
  if (themeMeta) themeMeta.setAttribute('content', isDark ? '#08111f' : '#f8fbff');
  localStorage.setItem('flip-coin-theme', mode);
}

function initTheme() {
  const saved = localStorage.getItem('flip-coin-theme');
  setTheme(saved || 'dark');
}

function getKeepStats() {
  return localStorage.getItem(keepStatsKey) !== 'false';
}

function setKeepStats(keep) {
  localStorage.setItem(keepStatsKey, String(keep));
  if (keep) {
    localStorage.setItem(statsKey, JSON.stringify(sessionStats));
  } else {
    localStorage.removeItem(statsKey);
    sessionStats = createEmptyStats();
  }
  updateStatsUI();
}

function loadStats() {
  if (!getKeepStats()) return sessionStats;
  try {
    return normalizeStats(JSON.parse(localStorage.getItem(statsKey)) || createEmptyStats());
  } catch (_) {
    return createEmptyStats();
  }
}

function saveStats(stats) {
  const normalized = normalizeStats(stats);
  sessionStats = normalized;
  if (getKeepStats()) localStorage.setItem(statsKey, JSON.stringify(normalized));
  updateStatsUI();
}

function updateStatsUI() {
  const stats = loadStats();
  headsCountEl.textContent = String(stats.coin.heads);
  tailsCountEl.textContent = String(stats.coin.tails);
  diceCountEls.forEach((el, index) => {
    el.textContent = String(stats.dice[index + 1]);
  });
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
    coinVisual.style.transform = 'rotateX(10deg) rotateY(0deg) rotateZ(0deg)';
    return;
  }
  if (view === 'dice') {
    swapView(diceView, current);
    diceDisplay.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
  }
}

function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getAudioContext() {
  const AudioContextClass = window.AudioContext;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playDropSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    gain.connect(ctx.destination);
    [720, 420, 260].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      osc.type = index === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(frequency, now + index * 0.035);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.55, now + 0.22 + index * 0.02);
      osc.connect(gain);
      osc.start(now + index * 0.035);
      osc.stop(now + 0.28 + index * 0.02);
    });
  } catch (_) {}
}

function vibrate(duration = 50) {
  if (window.navigator && typeof window.navigator.vibrate === 'function') {
    window.navigator.vibrate(duration);
  }
}

function animateCoin() {
  vibrate(50);
  const isHeads = Math.random() < 0.5;
  const finalRotation = 1620 + randomInt(0, 4) * 180 + (isHeads ? 0 : 180);
  coinVisual.style.setProperty('--final-rotation', `${finalRotation}deg`);
  coinVisual.classList.remove('flip');
  void coinVisual.offsetWidth;
  coinVisual.classList.add('flip');
  coinBtn.disabled = true;
  setTimeout(() => {
    coinVisual.style.transform = `rotateX(10deg) rotateY(${isHeads ? 0 : 180}deg) rotateZ(0deg)`;
    const stats = loadStats();
    if (isHeads) stats.coin.heads += 1;
    else stats.coin.tails += 1;
    saveStats(stats);
    playDropSound();
    coinBtn.disabled = false;
  }, 1200);
}

function getDiceRotation(value) {
  const rotations = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: 180, z: 0 },
    3: { x: 0, y: -90, z: 0 },
    4: { x: 0, y: 90, z: 0 },
    5: { x: -90, y: 0, z: 0 },
    6: { x: 90, y: 0, z: 0 },
  };
  return rotations[value];
}

function animateDice() {
  vibrate(35);
  const value = randomInt(1, 6);
  const { x, y, z } = getDiceRotation(value);
  diceDisplay.style.setProperty('--final-x', `${x}deg`);
  diceDisplay.style.setProperty('--final-y', `${y}deg`);
  diceDisplay.style.setProperty('--final-z', `${z}deg`);
  diceDisplay.classList.remove('roll');
  void diceDisplay.offsetWidth;
  diceDisplay.classList.add('roll');
  diceBtn.disabled = true;
  diceShadow.style.transform = 'scale(1.22) translateY(8px)';
  setTimeout(() => {
    diceDisplay.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
    diceDisplay.dataset.value = String(value);
    const stats = loadStats();
    stats.dice[value] += 1;
    saveStats(stats);
    diceShadow.style.transform = 'scale(0.94) translateY(0)';
    playDropSound();
    diceBtn.disabled = false;
  }, 1350);
}

function resetStats() {
  sessionStats = createEmptyStats();
  localStorage.setItem(statsKey, JSON.stringify(sessionStats));
  updateStatsUI();
}

themeToggle.addEventListener('click', () => setTheme(body.classList.contains('dark') ? 'light' : 'dark'));
chooseCoin.addEventListener('click', () => openView('coin'));
chooseDice.addEventListener('click', () => openView('dice'));
backFromCoin.addEventListener('click', () => openView('chooser'));
backFromDice.addEventListener('click', () => openView('chooser'));
coinBtn.addEventListener('click', animateCoin);
diceBtn.addEventListener('click', animateDice);
resetStatsBtn.addEventListener('click', resetStats);
keepStatsToggle.addEventListener('change', () => setKeepStats(keepStatsToggle.checked));

initTheme();
sessionStats = loadStats();
keepStatsToggle.checked = getKeepStats();
updateStatsUI();
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}
chooserView.hidden = false;
coinView.hidden = true;
diceView.hidden = true;
