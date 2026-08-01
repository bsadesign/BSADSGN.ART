/* ============================================================
   BSA Design — портфолио. Общий скрипт.

   1. Язык RU/EN            5. Фильтры в портфолио
   2. Мобильное меню        6. Бриф
   3. Превью проектов       7. Просмотр графики
   4. Появление при скролле 8. Год в подвале
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================
     1. ЯЗЫК
     Перевод лежит рядом с текстом, прямо в разметке:
       <h1 data-en="I design interfaces">Проектирую интерфейсы</h1>
     Для атрибутов — data-en-<атрибут>:
       <input data-en-placeholder="Name" placeholder="Имя">
       <meta data-en-content="..." content="...">
     Русский вариант — то, что уже написано в HTML, поэтому без JS
     сайт остаётся полностью рабочим русским сайтом.
     ========================================================== */
  var LANG_KEY = 'bsa.lang';
  var ru = new Map();          // элемент → исходный русский текст
  var ruAttr = new Map();      // элемент → { атрибут: исходное значение }

  function nodes() { return document.querySelectorAll('[data-en]'); }

  function attrPairs(el) {
    var out = [];
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-en-') === 0) out.push([a.name.slice(8), a.value]);
    }
    return out;
  }

  function applyLang(lang) {
    var en = lang === 'en';

    nodes().forEach(function (el) {
      if (!ru.has(el)) ru.set(el, el.innerHTML);
      el.innerHTML = en ? el.getAttribute('data-en') : ru.get(el);
    });

    document.querySelectorAll('*').forEach(function (el) {
      var pairs = attrPairs(el);
      if (!pairs.length) return;
      if (!ruAttr.has(el)) {
        var orig = {};
        pairs.forEach(function (p) { orig[p[0]] = el.getAttribute(p[0]) || ''; });
        ruAttr.set(el, orig);
      }
      pairs.forEach(function (p) {
        el.setAttribute(p[0], en ? p[1] : ruAttr.get(el)[p[0]]);
      });
    });

    document.documentElement.lang = en ? 'en' : 'ru';
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function initialLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'en' || q === 'ru') return q;
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === 'en' || saved === 'ru') return saved;
    } catch (e) {}
    var nav = (navigator.language || 'ru').toLowerCase();
    return /^(ru|uk|be|kk|ky|uz|hy|az|ka)/.test(nav) ? 'ru' : 'en';
  }

  var lang = initialLang();
  applyLang(lang);

  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () {
      lang = b.dataset.lang;
      applyLang(lang);
    });
  });

  var T = function (rus, eng) { return lang === 'en' ? eng : rus; };

  /* ==========================================================
     2. МОБИЛЬНОЕ МЕНЮ
     ========================================================== */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  if (burger && mnav) {
    var toggle = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      mnav.classList.toggle('is-open', open);
    };
    burger.addEventListener('click', function () {
      toggle(burger.getAttribute('aria-expanded') !== 'true');
    });
    mnav.addEventListener('click', function (e) {
      if (e.target.closest('a')) toggle(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        toggle(false); burger.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) toggle(false);
    });
  }

  /* ==========================================================
     3. ПРЕВЬЮ ПРОЕКТОВ
     В рамке с классом lacquer--auto лежит настоящий сайт: постер
     показывается, пока фрейм грузится, и убирается, когда тот готов.
     Подключение ленивое — фрейм создаётся, когда карточка подъезжает
     к экрану, чтобы страница не тянула чужие сайты сразу.
     Рамка lacquer--still живой версии не имеет: только постер.
     ========================================================== */
  function mountPreview(box) {
    var src = box.dataset.src;
    var w = parseInt(box.dataset.w || '1440', 10);
    var stage = box.querySelector('.lacquer__stage');
    if (!src || !stage || stage.dataset.mounted) return;
    stage.dataset.mounted = '1';

    box.classList.add('is-loading');
    var play = box.classList.contains('lacquer--play');
    var frame = document.createElement('iframe');
    frame.src = src;
    frame.setAttribute('scrolling', 'no');
    frame.title = box.dataset.title || T('Живая версия проекта', 'Live version of the project');
    if (!play) {
      frame.tabIndex = -1;
      frame.setAttribute('aria-hidden', 'true');
    }
    frame.style.width = w + 'px';
    stage.appendChild(frame);

    function fit() {
      var r = box.getBoundingClientRect();
      if (!r.width) return;
      var k = r.width / w;
      frame.style.height = Math.ceil(r.height / k) + 'px';
      stage.style.transform = 'scale(' + k + ')';
      stage.style.width = w + 'px';
      stage.style.height = Math.ceil(r.height / k) + 'px';
    }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(box);
    else window.addEventListener('resize', fit);

    frame.addEventListener('load', function () {
      box.classList.remove('is-loading');
      box.classList.add('is-live');
      if (play) box.classList.add('is-play');
      fit();
    });
  }

  var frames = document.querySelectorAll('.lacquer--auto[data-src]');
  if (frames.length) {
    if ('IntersectionObserver' in window) {
      var fo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          mountPreview(e.target);
          fo.unobserve(e.target);
        });
      }, { rootMargin: '500px' });
      frames.forEach(function (f) { fo.observe(f); });
    } else {
      frames.forEach(mountPreview);
    }
  }

  /* блик по лаку идёт за курсором */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var box = e.target.closest ? e.target.closest('.lacquer') : null;
      if (!box) return;
      var r = box.getBoundingClientRect();
      box.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      box.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    }, { passive: true });
  }

  /* ==========================================================
     3.1 БЕСКОНЕЧНАЯ БЕГУЩАЯ СТРОКА
     Клонируем набор слов, пока лента не станет шире экрана плюс
     один набор. Тогда сдвиг ровно на ширину набора даёт бесшовный
     цикл на любой ширине монитора — и на 1280, и на 3440.
     ========================================================== */
  var tape = document.querySelector('.ticker__in');
  if (tape && !reduce) {
    var set = tape.querySelector('.ticker__set');
    var rebuild = function () {
      tape.classList.remove('is-run');
      var extra = tape.querySelectorAll('.ticker__set');
      for (var i = 1; i < extra.length; i++) extra[i].remove();

      var w = set.getBoundingClientRect().width;
      if (!w) return;
      var copies = Math.ceil((window.innerWidth + w) / w) + 1;
      for (var j = 1; j < copies; j++) tape.appendChild(set.cloneNode(true));

      tape.style.setProperty('--set', w + 'px');
      tape.style.setProperty('--dur', Math.max(12, Math.round(w / 55)) + 's'); // ~55 px в секунду
      tape.classList.add('is-run');
    };
    rebuild();
    // шрифты приезжают позже разметки и меняют ширину набора
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    var tid;
    window.addEventListener('resize', function () {
      clearTimeout(tid);
      tid = setTimeout(rebuild, 200);
    });
  }

  /* ==========================================================
     4. ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ
     ========================================================== */
  var rises = document.querySelectorAll('.rise');
  if (rises.length && 'IntersectionObserver' in window && !reduce) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-in'); }, i * 70);
        ro.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rises.forEach(function (el) { ro.observe(el); });
  } else {
    rises.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ==========================================================
     5. ФИЛЬТРЫ В ПОРТФОЛИО
     ========================================================== */
  var filters = document.querySelectorAll('[data-filter]');
  if (filters.length) {
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.filter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        document.querySelectorAll('[data-cat]').forEach(function (item) {
          var show = key === 'all' || item.dataset.cat.split(' ').indexOf(key) > -1;
          item.hidden = !show;
        });
      });
    });
  }

  /* ==========================================================
     6. БРИФ: собираем текст, копируем, открываем Telegram
     ========================================================== */
  var brief = document.getElementById('brief');
  if (brief) {
    var toast = document.getElementById('toast');
    var show = function (text) {
      if (!toast) return;
      toast.textContent = text;
      toast.classList.add('is-on');
      setTimeout(function () { toast.classList.remove('is-on'); }, 3200);
    };

    brief.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(brief);
      var lines = [
        T('Заявка с сайта bsa.design', 'Request from bsa.design'),
        '',
        T('Имя: ', 'Name: ') + (d.get('name') || '—'),
        T('Задача: ', 'Task: ') + (d.get('kind') || '—'),
        T('Сроки: ', 'Timeline: ') + (d.get('when') || '—'),
        '',
        T('Описание:', 'Details:'),
        (d.get('about') || '—')
      ].join('\n');

      var open = function () { window.open('https://t.me/bsa_dsgn', '_blank', 'noopener'); };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lines).then(function () {
          show(T('Заявка скопирована — вставьте её в чат', 'Copied — paste it into the chat'));
          open();
        }).catch(open);
      } else {
        open();
      }
    });
  }

  /* ==========================================================
     7. ПРОСМОТР ГРАФИКИ ВО ВЕСЬ ЭКРАН
     Карточка — настоящая кнопка: открывается мышью, Enter и
     пробелом. Пока окно открыто, фокус не уходит за его пределы.
     ========================================================== */
  var shots = document.querySelectorAll('.shot[data-full]');
  if (shots.length) {
    var viewer = document.createElement('div');
    viewer.className = 'viewer';
    viewer.setAttribute('role', 'dialog');
    viewer.setAttribute('aria-modal', 'true');
    viewer.innerHTML =
      '<button class="viewer__close" type="button" aria-label="' + T('Закрыть', 'Close') + '">' +
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button><img class="viewer__img" alt=""><p class="viewer__cap"></p>';
    document.body.appendChild(viewer);

    var vImg = viewer.querySelector('.viewer__img');
    var vCap = viewer.querySelector('.viewer__cap');
    var vClose = viewer.querySelector('.viewer__close');
    var lastFocus = null;

    function openShot(shot) {
      var img = shot.querySelector('img');
      if (!img) return;
      lastFocus = document.activeElement;
      vImg.src = shot.dataset.full || img.src;
      vImg.alt = img.alt || '';
      var cap = shot.querySelector('.shot__cap');
      vCap.textContent = (cap ? cap.textContent.trim() + ' — ' : '') +
        T('Esc или клик — закрыть', 'Esc or click to close');
      viewer.classList.add('is-on');
      document.body.style.overflow = 'hidden';
      vClose.focus();
    }
    function closeShot() {
      viewer.classList.remove('is-on');
      document.body.style.overflow = '';
      vImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    shots.forEach(function (shot) {
      shot.addEventListener('click', function () { openShot(shot); });
      shot.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          openShot(shot);
        }
      });
    });

    viewer.addEventListener('click', function (e) {
      // клик по самой картинке не закрывает — можно рассмотреть
      if (e.target === vImg) return;
      closeShot();
    });
    document.addEventListener('keydown', function (e) {
      if (!viewer.classList.contains('is-on')) return;
      if (e.key === 'Escape') { closeShot(); return; }
      if (e.key === 'Tab') { e.preventDefault(); vClose.focus(); }
    });
  }

  /* ==========================================================
     8. ГОД В ПОДВАЛЕ
     ========================================================== */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
