/* ============================================================
   Обёртка над SDK Яндекс Игр.
   Всё безопасно деградирует: если SDK недоступен (локальный
   запуск, ошибка сети), игра продолжает работать на localStorage.
   ============================================================ */

const Platform = {
  sdk: null,
  player: null,
  ready: false,
  storageKey: 'kosmos2048.save',

  // Название лидерборда из Консоли разработчика.
  // Создайте лидерборд с таким же техническим именем — иначе
  // отправка результата просто молча пропускается.
  leaderboardName: 'best_score',

  callbacks: {
    onPause: null,
    onResume: null
  },

  async init() {
    if (typeof YaGames === 'undefined') {
      console.info('[platform] SDK недоступен, работаем автономно');
      return null;
    }
    try {
      this.sdk = await YaGames.init();
      this.ready = true;
      this._bindPlatformEvents();
      try {
        this.player = await this.sdk.getPlayer({ scopes: false });
      } catch (e) {
        this.player = null;
      }
      return this.sdk;
    } catch (e) {
      console.warn('[platform] init failed', e);
      return null;
    }
  },

  /** Платформа сама просит поставить игру на паузу (пп. 1.3 и 4.7) */
  _bindPlatformEvents() {
    const self = this;
    try {
      this.sdk.on('game_api_pause', function () {
        if (self.callbacks.onPause) self.callbacks.onPause();
      });
      this.sdk.on('game_api_resume', function () {
        if (self.callbacks.onResume) self.callbacks.onResume();
      });
    } catch (e) {
      /* старые версии SDK без событий */
    }
  },

  /** Игра загрузилась, экранов загрузки больше нет */
  loadingReady() {
    try {
      if (this.sdk && this.sdk.features.LoadingAPI) {
        this.sdk.features.LoadingAPI.ready();
      }
    } catch (e) { /* no-op */ }
  },

  gameplayStart() {
    try {
      if (this.sdk && this.sdk.features.GameplayAPI) {
        this.sdk.features.GameplayAPI.start();
      }
    } catch (e) { /* no-op */ }
  },

  gameplayStop() {
    try {
      if (this.sdk && this.sdk.features.GameplayAPI) {
        this.sdk.features.GameplayAPI.stop();
      }
    } catch (e) { /* no-op */ }
  },

  /** Язык интерфейса платформы */
  getLang() {
    try {
      const env = this.sdk && this.sdk.environment;
      return env && env.i18n ? env.i18n.lang : null;
    } catch (e) {
      return null;
    }
  },

  // ---------- Сохранения ----------

  // Платформа ограничивает частоту запросов к данным игрока,
  // поэтому локально пишем всегда, а в облако — не чаще раза в 15 с.
  cloudMinInterval: 15000,
  _cloudTimer: null,
  _cloudPending: null,
  _lastCloud: 0,

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) { /* приватный режим */ }

    if (!this.player || !this.player.setData) return;

    this._cloudPending = data;
    if (this._cloudTimer) return;

    const self = this;
    const wait = Math.max(0, this.cloudMinInterval - (Date.now() - this._lastCloud));
    this._cloudTimer = setTimeout(function () {
      self._cloudTimer = null;
      self._flushCloud();
    }, wait);
  },

  _flushCloud() {
    if (!this._cloudPending || !this.player || !this.player.setData) return;
    const payload = this._cloudPending;
    this._cloudPending = null;
    this._lastCloud = Date.now();
    try {
      const p = this.player.setData({ save: payload }, false);
      if (p && p.catch) p.catch(function () { /* локальная копия уже есть */ });
    } catch (e) { /* no-op */ }
  },

  /** Немедленная отправка: конец партии, сворачивание вкладки, выход */
  flush() {
    if (this._cloudTimer) {
      clearTimeout(this._cloudTimer);
      this._cloudTimer = null;
    }
    this._flushCloud();
  },

  async load() {
    let cloud = null;
    if (this.player && this.player.getData) {
      try {
        const res = await this.player.getData(['save']);
        if (res && res.save) cloud = res.save;
      } catch (e) { cloud = null; }
    }

    let local = null;
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) local = JSON.parse(raw);
    } catch (e) { local = null; }

    // Прогресс с сервера приоритетнее, если он не хуже локального
    if (cloud && local) {
      return (cloud.best || 0) >= (local.best || 0) ? cloud : local;
    }
    return cloud || local;
  },

  // ---------- Реклама ----------

  /**
   * Полноэкранный блок. Частоту показа регулирует сама платформа,
   * поэтому вызывать можно на каждом рестарте — лишнего не покажет.
   */
  showFullscreen(onDone) {
    const finish = function () { if (onDone) onDone(); };
    if (!this.sdk || !this.sdk.adv) { finish(); return; }

    const self = this;
    try {
      this.sdk.adv.showFullscreenAdv({
        callbacks: {
          onOpen: function () { self.gameplayStop(); },
          onClose: function () { finish(); },
          onError: function () { finish(); }
        }
      });
    } catch (e) {
      finish();
    }
  },

  /**
   * Видео с вознаграждением. Частота не ограничена платформой,
   * но вызываем только по явному нажатию игрока.
   */
  showRewarded(onReward, onDone) {
    if (!this.sdk || !this.sdk.adv) { if (onDone) onDone(false); return; }

    const self = this;
    let rewarded = false;
    try {
      this.sdk.adv.showRewardedVideo({
        callbacks: {
          onOpen: function () { self.gameplayStop(); },
          onRewarded: function () { rewarded = true; if (onReward) onReward(); },
          onClose: function () { if (onDone) onDone(rewarded); },
          onError: function () { if (onDone) onDone(rewarded); }
        }
      });
    } catch (e) {
      if (onDone) onDone(false);
    }
  },

  // ---------- Лидерборд ----------

  async submitScore(score) {
    if (!this.sdk || !score) return;
    try {
      const lb = await this.sdk.getLeaderboards();
      await lb.setLeaderboardScore(this.leaderboardName, score);
    } catch (e) {
      /* лидерборд не создан в Консоли или игрок анонимный */
    }
  }
};
