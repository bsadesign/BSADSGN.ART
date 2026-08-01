/* ============================================================
   Локализация. Языки: ru, en, tr
   ============================================================ */

const I18N = {
  ru: {
    _htmlLang: 'ru',
    title: '2048 Космооперация',
    score: 'Счёт',
    best: 'Рекорд',
    undo: 'Отмена',
    restart: 'Заново',
    settings: 'Настройки',
    boardSize: 'Размер поля',
    language: 'Язык',
    sizeNote: 'Смена размера поля начинает новую партию.',
    close: 'Закрыть',
    ladderTitle: 'Открытые миры',
    discovery: 'Открыт новый мир',
    hint: 'Соединяй планеты — создавай вселенные',
    hintDesktop: 'Стрелки или WASD — соединяй планеты',
    winEyebrow: 'Сингулярность достигнута',
    winTitle: 'Чёрная дыра!',
    winSub: 'Можно остановиться — или стать создателем вселенной.',
    keepPlaying: 'Играть дальше',
    overEyebrow: 'Ходов больше нет',
    overTitle: 'Коллапс',
    overSub: 'Ваш счёт: {score}',
    overSubBest: 'Новый рекорд: {score}',
    newGame: 'Новая партия',
    undoLast: 'Вернуть ход',
    names: {
      2: 'Пылинка', 4: 'Метеорит', 8: 'Астероид', 16: 'Комета',
      32: 'Луна', 64: 'Планета', 128: 'Газовый гигант', 256: 'Звезда',
      512: 'Красный гигант', 1024: 'Сверхновая', 2048: 'Чёрная дыра',
      4096: 'Квазар', 8192: 'Галактика', 16384: 'Скопление', 32768: 'Вселенная'
    }
  },

  en: {
    _htmlLang: 'en',
    title: '2048 Space Operation',
    score: 'Score',
    best: 'Best',
    undo: 'Undo',
    restart: 'Restart',
    settings: 'Settings',
    boardSize: 'Board size',
    language: 'Language',
    sizeNote: 'Changing the board size starts a new game.',
    close: 'Close',
    ladderTitle: 'Discovered worlds',
    discovery: 'New world discovered',
    hint: 'Merge planets — create universes',
    hintDesktop: 'Arrow keys or WASD to move',
    winEyebrow: 'Singularity reached',
    winTitle: 'Black hole!',
    winSub: 'Stop here — or become the creator of a universe.',
    keepPlaying: 'Keep playing',
    overEyebrow: 'No moves left',
    overTitle: 'Collapse',
    overSub: 'Your score: {score}',
    overSubBest: 'New best: {score}',
    newGame: 'New game',
    undoLast: 'Undo last move',
    names: {
      2: 'Dust', 4: 'Meteorite', 8: 'Asteroid', 16: 'Comet',
      32: 'Moon', 64: 'Planet', 128: 'Gas giant', 256: 'Star',
      512: 'Red giant', 1024: 'Supernova', 2048: 'Black hole',
      4096: 'Quasar', 8192: 'Galaxy', 16384: 'Cluster', 32768: 'Universe'
    }
  },

  tr: {
    _htmlLang: 'tr',
    title: '2048 Uzay Operasyonu',
    score: 'Puan',
    best: 'Rekor',
    undo: 'Geri al',
    restart: 'Yeniden',
    settings: 'Ayarlar',
    boardSize: 'Tahta boyutu',
    language: 'Dil',
    sizeNote: 'Tahta boyutunu değiştirmek yeni bir oyun başlatır.',
    close: 'Kapat',
    ladderTitle: 'Keşfedilen dünyalar',
    discovery: 'Yeni dünya keşfedildi',
    hint: 'Gezegenleri birleştir — evrenler yarat',
    hintDesktop: 'Ok tuşları veya WASD ile hareket',
    winEyebrow: 'Tekillik sağlandı',
    winTitle: 'Kara delik!',
    winSub: 'Burada durabilir ya da kuasara gidebilirsin.',
    keepPlaying: 'Devam et',
    overEyebrow: 'Hamle kalmadı',
    overTitle: 'Çöküş',
    overSub: 'Puanın: {score}',
    overSubBest: 'Yeni rekor: {score}',
    newGame: 'Yeni oyun',
    undoLast: 'Son hamleyi geri al',
    names: {
      2: 'Toz', 4: 'Meteor', 8: 'Asteroit', 16: 'Kuyruklu yıldız',
      32: 'Ay', 64: 'Gezegen', 128: 'Gaz devi', 256: 'Yıldız',
      512: 'Kızıl dev', 1024: 'Süpernova', 2048: 'Kara delik',
      4096: 'Kuasar', 8192: 'Galaksi', 16384: 'Küme', 32768: 'Evren'
    }
  }
};

const Lang = {
  current: 'ru',

  set(code) {
    this.current = I18N[code] ? code : 'ru';
    document.documentElement.lang = I18N[this.current]._htmlLang;
    document.title = I18N[this.current].title;
    this.apply();
  },

  t(key, vars) {
    let str = I18N[this.current][key];
    if (str === undefined) str = I18N.ru[key];
    if (str === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace('{' + k + '}', vars[k]);
      });
    }
    return str;
  },

  name(value) {
    const dict = I18N[this.current].names;
    return dict[value] || String(value);
  },

  /** Проставляет тексты во все элементы с data-i18n */
  apply() {
    const nodes = document.querySelectorAll('[data-i18n]');
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].textContent = this.t(nodes[i].getAttribute('data-i18n'));
    }
  },

  /** Приводит код языка платформы к поддерживаемому */
  normalize(code) {
    if (!code) return 'ru';
    const short = String(code).toLowerCase().slice(0, 2);
    return I18N[short] ? short : 'en';
  }
};
