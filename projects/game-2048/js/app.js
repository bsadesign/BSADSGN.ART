/* ============================================================
   Приложение: рендер, ввод, сохранения, жизненный цикл платформы.
   ============================================================ */

/* Видео с вознаграждением за возврат хода.
   Это инвентарь Яндекса, вызываемый через SDK, а не сторонняя
   реклама. Поставьте false, чтобы убрать кнопку полностью. */
const ENABLE_REWARDED_UNDO = true;

const SLIDE_MS = 110;
const MERGE_MS = 190;

const el = {};
const els = new Map();          // id плитки -> DOM-элемент
let game = null;
let cellSize = 70;
let gapSize = 10;
let best = 0;
let discovered = [];
let paused = false;
let busy = false;
let inputLocked = false;
let saveTimer = null;

/* ---------------- Инициализация ---------------- */

function cacheDom() {
  const ids = ['boot', 'app', 'board', 'cells', 'tiles', 'overlay', 'overlayEyebrow',
    'overlayTitle', 'overlaySub', 'overlayActions', 'score', 'best', 'scoreBox',
    'undoBtn', 'undoCount', 'restartBtn', 'soundBtn', 'soundIcon', 'menuBtn',
    'ladder', 'sheet', 'sheetClose', 'sizePicker', 'langPicker', 'toast',
    'toastChip', 'toastIcon', 'toastName', 'hint'];
  ids.forEach(function (id) { el[id] = document.getElementById(id); });
}

async function boot() {
  cacheDom();

  await Platform.init();

  // Язык: сначала платформа, потом сохранённый выбор игрока
  const saved = await Platform.load();
  const platformLang = Lang.normalize(Platform.getLang());
  Lang.set((saved && saved.lang) || platformLang);

  best = (saved && saved.best) || 0;
  discovered = (saved && saved.discovered) || [];
  Sfx.setEnabled(saved ? saved.sound !== false : true);

  const size = (saved && saved.size) || 4;
  game = new Game(size);

  if (saved && saved.board && saved.board.values) {
    game.deserialize(saved.board);
    game.undosLeft = typeof saved.undosLeft === 'number' ? saved.undosLeft : 3;
  } else {
    game.newGame(size);
  }

  bindEvents();
  layout();
  renderCells();
  renderAll();
  syncDiscoveries();
  renderLadder();
  updateHud();
  syncPickers();
  updateSoundIcon();
  updateHint();

  el.boot.hidden = true;
  el.app.hidden = false;

  // Второй проход: теперь элементы измеримы и поле займёт максимум места
  layout();
  renderCells();
  renderAll();

  // Игра готова: ресурсов больше не грузим, экран загрузки убран
  Platform.loadingReady();
  Platform.gameplayStart();

  if (game.over) showGameOver();
}

/* ---------------- Раскладка ---------------- */

function isShortLandscape() {
  return window.innerWidth > window.innerHeight && window.innerHeight <= 560;
}

/** Высота всего, кроме поля: измеряем, чтобы поле занимало максимум места */
function chromeHeight() {
  if (!el.app || el.app.hidden) return isShortLandscape() ? 118 : 286;
  let total = 30;
  const kids = el.app.children;
  for (let i = 0; i < kids.length; i++) {
    const node = kids[i];
    if (node.classList.contains('stage')) continue;
    if (getComputedStyle(node).display === 'none') continue;
    total += node.offsetHeight + 12;
  }
  return total;
}

function layout() {
  const short = isShortLandscape();
  const maxW = Math.min(window.innerWidth - 28, short ? 440 : 470);
  const maxH = window.innerHeight - chromeHeight();
  const board = Math.max(180, Math.min(maxW, maxH));

  const n = game.size;
  gapSize = Math.max(5, Math.round(board / (n * 8)));
  cellSize = Math.floor((board - gapSize * (n + 1)) / n);
  const exact = cellSize * n + gapSize * (n + 1);

  const root = document.documentElement.style;
  root.setProperty('--board', exact + 'px');
  root.setProperty('--cell', cellSize + 'px');
  root.setProperty('--gap', gapSize + 'px');
  root.setProperty('--radius', Math.round(cellSize * 0.2) + 'px');
}

function stepSize() {
  return cellSize + gapSize;
}

/* ---------------- Рендер ---------------- */

function renderCells() {
  el.cells.innerHTML = '';
  const step = stepSize();
  for (let r = 0; r < game.size; r++) {
    for (let c = 0; c < game.size; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.transform = 'translate(' + (c * step) + 'px,' + (r * step) + 'px)';
      el.cells.appendChild(cell);
    }
  }
}

function setPos(node, r, c) {
  const step = stepSize();
  const pos = 'translate(' + (c * step) + 'px,' + (r * step) + 'px)';
  node.style.setProperty('--pos', pos);
  node.style.transform = pos;
}

function paintTile(node, value) {
  const style = tileStyle(value);
  node.style.setProperty('--tile-bg', style.bg);
  node.style.setProperty('--tile-glow', style.glow);
  node.style.setProperty('--tile-art', style.art);
  node.style.color = style.text;

  const use = node.querySelector('use');
  if (use) use.setAttribute('href', '#' + style.icon);

  const num = node.querySelector('.tile__num');
  if (num) num.textContent = value;

  const digits = String(value).length;
  node.classList.toggle('tile--d3', digits === 3);
  node.classList.toggle('tile--d4', digits === 4);
  node.classList.toggle('tile--d5', digits >= 5);
}

function createTileEl(tile, isNew) {
  const node = document.createElement('div');
  node.className = 'tile';
  node.innerHTML = '<svg class="tile__art" viewBox="0 0 100 100" aria-hidden="true">' +
                   '<use href="#b-dust"></use></svg>' +
                   '<span class="tile__num"></span>';
  paintTile(node, tile.value);
  setPos(node, tile.r, tile.c);
  if (isNew) {
    node.classList.add('tile--new');
    setTimeout(function () { node.classList.remove('tile--new'); }, 200);
  }
  el.tiles.appendChild(node);
  els.set(tile.id, node);
  return node;
}

/** Полная перерисовка без анимации перемещения */
function renderAll() {
  el.tiles.innerHTML = '';
  els.clear();
  game.tiles.forEach(function (tile) { createTileEl(tile, false); });
}

function repositionAll() {
  els.forEach(function (node, id) {
    const tile = game.tiles.get(id);
    if (tile) setPos(node, tile.r, tile.c);
  });
}

/* ---------------- Ход ---------------- */

function doMove(dir) {
  if (busy || paused || inputLocked) return;
  if (!el.overlay.hidden) return;

  const res = game.move(dir);
  if (!res) return;

  busy = true;
  hideHint();
  Sfx.unlock();
  Sfx.slide();

  // 1. Едут все — и выжившие, и те, что сейчас сольются
  res.slides.forEach(function (s) {
    const node = els.get(s.id);
    if (node) setPos(node, s.r, s.c);
  });
  res.ghosts.forEach(function (g) {
    const node = els.get(g.id);
    if (node) {
      node.classList.add('tile--ghost');
      setPos(node, g.r, g.c);
    }
  });

  // 2. По приезде — слияние, новая плитка, обновление счёта
  setTimeout(function () {
    res.ghosts.forEach(function (g) {
      const node = els.get(g.id);
      if (node && node.parentNode) node.parentNode.removeChild(node);
      els.delete(g.id);
    });

    res.merges.forEach(function (m) {
      const node = els.get(m.id);
      if (!node) return;
      paintTile(node, m.value);
      node.classList.remove('tile--merged');
      void node.offsetWidth;
      node.classList.add('tile--merged');
      Sfx.merge(m.value);
      noteDiscovery(m.value);
    });

    if (res.spawned) {
      createTileEl(res.spawned, true);
      noteDiscovery(res.spawned.value, true);
    }

    if (res.gained) showGain(res.gained);
    updateHud();
    scheduleSave();

    setTimeout(function () {
      busy = false;
      // Порядок важен: если 2048 собран последним возможным ходом,
      // «Играть дальше» вело бы на поле без ходов.
      if (game.over) {
        showGameOver();
      } else if (game.won && !game.keepPlaying) {
        showWin();
      }
    }, MERGE_MS);
  }, SLIDE_MS);
}

function showGain(amount) {
  const gain = document.createElement('span');
  gain.className = 'score__gain';
  gain.textContent = '+' + amount;
  el.scoreBox.style.position = 'relative';
  el.scoreBox.appendChild(gain);
  el.scoreBox.classList.add('is-bumped');
  setTimeout(function () {
    el.scoreBox.classList.remove('is-bumped');
    if (gain.parentNode) gain.parentNode.removeChild(gain);
  }, 700);
}

/* ---------------- Шкала эволюции ---------------- */

function renderLadder() {
  el.ladder.innerHTML = '';
  LADDER_VALUES.forEach(function (value) {
    const known = discovered.indexOf(value) >= 0;
    const style = tileStyle(value);

    const rung = document.createElement('div');
    rung.className = 'rung' + (known ? ' is-unlocked' : '');
    rung.dataset.value = value;

    const dot = document.createElement('span');
    dot.className = 'rung__dot';
    dot.style.setProperty('--tile-bg', style.bg);
    dot.style.setProperty('--tile-glow', style.glow);
    dot.style.color = style.art;
    dot.innerHTML = '<svg class="rung__icon" viewBox="0 0 100 100" aria-hidden="true">' +
                    '<use href="#' + style.icon + '"></use></svg>';

    const name = document.createElement('span');
    name.className = 'rung__name';
    name.textContent = known ? Lang.name(value) : '?';

    rung.appendChild(dot);
    rung.appendChild(name);
    el.ladder.appendChild(rung);
  });
}

function noteDiscovery(value, silent) {
  if (discovered.indexOf(value) >= 0) return;
  discovered.push(value);

  const rung = el.ladder.querySelector('[data-value="' + value + '"]');
  if (rung) {
    rung.classList.add('is-unlocked');
    const name = rung.querySelector('.rung__name');
    if (name) name.textContent = Lang.name(value);
    if (!silent) {
      rung.classList.add('is-fresh');
      rung.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }

  if (!silent && value >= 32) {
    Sfx.discovery();
    showToast(value);
  }
}

/** Плитки 2 и 4 приходят из спавна, а не из слияний — учитываем их отдельно */
function syncDiscoveries() {
  game.tiles.forEach(function (tile) {
    if (discovered.indexOf(tile.value) < 0) discovered.push(tile.value);
  });
}

let toastTimer = null;

function showToast(value) {
  const style = tileStyle(value);
  el.toastChip.style.setProperty('--tile-bg', style.bg);
  el.toastChip.style.setProperty('--tile-glow', style.glow);
  el.toastChip.style.color = style.art;
  el.toastIcon.querySelector('use').setAttribute('href', '#' + style.icon);
  el.toastName.textContent = Lang.name(value);
  el.toast.classList.remove('is-leaving');
  el.toast.hidden = false;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.toast.classList.add('is-leaving');
    setTimeout(function () { el.toast.hidden = true; }, 260);
  }, 2200);
}

/* ---------------- HUD ---------------- */

function updateHud() {
  el.score.textContent = game.score;
  if (game.score > best) best = game.score;
  el.best.textContent = best;
  el.undoCount.textContent = game.undosLeft;
  el.undoBtn.disabled = !game.canUndo();
}

function updateHint() {
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  el.hint.textContent = Lang.t(touch ? 'hint' : 'hintDesktop');
}

function hideHint() {
  el.hint.classList.add('is-hidden');
}

function updateSoundIcon() {
  el.soundIcon.querySelector('use')
    .setAttribute('href', Sfx.enabled ? '#i-sound-on' : '#i-sound-off');
  el.soundBtn.setAttribute('aria-pressed', String(Sfx.enabled));
}

/* ---------------- Оверлеи ---------------- */

function clearOverlayActions() {
  el.overlayActions.innerHTML = '';
}

function addAction(labelKey, primary, handler) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--wide' + (primary ? ' btn--primary' : '');
  btn.textContent = Lang.t(labelKey);
  btn.addEventListener('click', handler);
  el.overlayActions.appendChild(btn);
  return btn;
}

function showWin() {
  Platform.gameplayStop();
  el.overlayEyebrow.textContent = Lang.t('winEyebrow');
  el.overlayTitle.textContent = Lang.t('winTitle');
  el.overlaySub.textContent = Lang.t('winSub');
  clearOverlayActions();
  addAction('keepPlaying', true, function () {
    game.keepPlaying = true;
    hideOverlay();
    Platform.gameplayStart();
    scheduleSave();
  });
  addAction('newGame', false, function () { restartWithAd(); });
  el.overlay.hidden = false;
}

function showGameOver() {
  Platform.gameplayStop();
  Sfx.gameOver();

  const isBest = game.score >= best && game.score > 0;
  el.overlayEyebrow.textContent = Lang.t('overEyebrow');
  el.overlayTitle.textContent = Lang.t('overTitle');
  el.overlaySub.textContent = Lang.t(isBest ? 'overSubBest' : 'overSub', { score: game.score });

  clearOverlayActions();
  addAction('newGame', true, function () { restartWithAd(); });

  if (ENABLE_REWARDED_UNDO && Platform.ready && game.history.length) {
    addAction('undoLast', false, function () {
      inputLocked = true;
      Platform.showRewarded(
        function () {
          game.grantUndo(1);
        },
        function (rewarded) {
          inputLocked = false;
          Platform.gameplayStart();
          if (rewarded) {
            hideOverlay();
            performUndo(true);
          }
        }
      );
    });
  }

  el.overlay.hidden = false;
  Platform.submitScore(best);
  saveAndFlush();
}

function hideOverlay() {
  el.overlay.hidden = true;
}

/* ---------------- Действия ---------------- */

function performUndo(force) {
  if (busy || paused) return;
  if (!force && !game.canUndo()) return;
  if (force && game.undosLeft <= 0) game.grantUndo(1);
  if (!game.undo()) return;
  Sfx.undo();
  renderAll();
  updateHud();
  scheduleSave();
}

function restart() {
  hideOverlay();
  game.newGame(game.size);
  layout();
  renderCells();
  renderAll();
  updateHud();
  el.hint.classList.remove('is-hidden');
  Platform.gameplayStart();
  scheduleSave();
}

/**
 * Полноэкранный блок вызывается после явного действия игрока —
 * нажатия «Новая партия». Частоту показа регулирует платформа.
 */
function restartWithAd() {
  inputLocked = true;
  Platform.showFullscreen(function () {
    inputLocked = false;
    restart();
  });
}

/* ---------------- Сохранение ---------------- */

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 400);
}

/** Сохранить и сразу протолкнуть в облако */
function saveAndFlush() {
  saveNow();
  Platform.flush();
}

function saveNow() {
  Platform.save({
    board: game.serialize(),
    size: game.size,
    score: game.score,
    best: best,
    discovered: discovered,
    undosLeft: game.undosLeft,
    lang: Lang.current,
    sound: Sfx.enabled
  });
}

/* ---------------- Ввод ---------------- */

const KEYS = {
  ArrowUp: 'up', ArrowRight: 'right', ArrowDown: 'down', ArrowLeft: 'left',
  KeyW: 'up', KeyD: 'right', KeyS: 'down', KeyA: 'left',
  Numpad8: 'up', Numpad6: 'right', Numpad2: 'down', Numpad4: 'left'
};

function bindEvents() {
  window.addEventListener('keydown', function (e) {
    const dir = KEYS[e.code];
    if (!dir) return;
    e.preventDefault();
    doMove(dir);
  });

  // Свайпы
  let startX = 0, startY = 0, tracking = false;

  function onStart(x, y) {
    startX = x; startY = y; tracking = true;
    Sfx.unlock();
  }

  function onEnd(x, y) {
    if (!tracking) return;
    tracking = false;
    const dx = x - startX;
    const dy = y - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const threshold = Math.max(18, cellSize * 0.25);
    if (Math.max(absX, absY) < threshold) return;
    if (absX > absY) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
  }

  el.board.addEventListener('touchstart', function (e) {
    const t = e.changedTouches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });

  el.board.addEventListener('touchmove', function (e) {
    if (tracking) e.preventDefault();
  }, { passive: false });

  el.board.addEventListener('touchend', function (e) {
    const t = e.changedTouches[0];
    onEnd(t.clientX, t.clientY);
  }, { passive: true });

  el.board.addEventListener('mousedown', function (e) { onStart(e.clientX, e.clientY); });
  window.addEventListener('mouseup', function (e) { onEnd(e.clientX, e.clientY); });

  // Кнопки
  el.undoBtn.addEventListener('click', function () { performUndo(false); });
  el.restartBtn.addEventListener('click', function () { restart(); });

  el.soundBtn.addEventListener('click', function () {
    Sfx.unlock();
    Sfx.setEnabled(!Sfx.enabled);
    updateSoundIcon();
    scheduleSave();
  });

  el.menuBtn.addEventListener('click', function () { el.sheet.hidden = false; });
  el.sheetClose.addEventListener('click', function () { el.sheet.hidden = true; });
  el.sheet.addEventListener('click', function (e) {
    if (e.target === el.sheet) el.sheet.hidden = true;
  });

  el.sizePicker.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-size]');
    if (!btn) return;
    const size = parseInt(btn.dataset.size, 10);
    if (size === game.size) return;
    game.size = size;
    restart();
    syncPickers();
  });

  el.langPicker.addEventListener('click', function (e) {
    const btn = e.target.closest('[data-lang]');
    if (!btn) return;
    Lang.set(btn.dataset.lang);
    syncPickers();
    renderLadder();
    updateHint();
    scheduleSave();
  });

  window.addEventListener('resize', function () {
    layout();
    renderCells();
    repositionAll();
  });

  // Пауза от платформы
  Platform.callbacks.onPause = function () {
    paused = true;
    Platform.gameplayStop();
  };
  Platform.callbacks.onResume = function () {
    paused = false;
    if (el.overlay.hidden) Platform.gameplayStart();
  };

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      Platform.gameplayStop();
      saveAndFlush();
    } else if (el.overlay.hidden) {
      Platform.gameplayStart();
    }
  });

  window.addEventListener('beforeunload', saveAndFlush);
}

function syncPickers() {
  const sizeBtns = el.sizePicker.querySelectorAll('[data-size]');
  for (let i = 0; i < sizeBtns.length; i++) {
    sizeBtns[i].classList.toggle('is-active', parseInt(sizeBtns[i].dataset.size, 10) === game.size);
  }
  const langBtns = el.langPicker.querySelectorAll('[data-lang]');
  for (let i = 0; i < langBtns.length; i++) {
    langBtns[i].classList.toggle('is-active', langBtns[i].dataset.lang === Lang.current);
  }
}

/* ---------------- Точка входа ---------------- */

let booted = false;

function startOnce() {
  if (booted) return;
  booted = true;
  boot().catch(function (e) {
    console.error(e);
    if (el.boot) el.boot.hidden = true;
    if (el.app) el.app.hidden = false;
  });
}

// Стаб initSDK объявлен в <head> и дёргает __startApp,
// когда тег /sdk.js отработал (успешно или с ошибкой).
window.__startApp = startOnce;
if (window.__sdkSettled) startOnce();

// Страховка: если тег вообще не ответил, стартуем сами
window.addEventListener('load', function () {
  setTimeout(startOnce, 1500);
});
