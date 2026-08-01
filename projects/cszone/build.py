# -*- coding: utf-8 -*-
"""Сборка статических страниц сайта CS:ZONE из общих шапки/подвала."""
import os, io

OUT = os.path.dirname(os.path.abspath(__file__))

TEL_RAW = "+79180080885"
TEL_H   = "8 918 008-08-85"
TG      = "https://t.me/cszoneclub"
ADDR    = "г. Краснодар, ул. Командорская 3к2"
HOURS   = "Круглосуточно, 24/7"
YMAP    = "https://yandex.ru/maps/org/cs_zone/221049266006/"
YREV    = "https://yandex.ru/maps/org/cs_zone/221049266006/reviews/"
# Официальный бейдж рейтинга Яндекса. Если карточка клуба в Яндекс Бизнесе
# подтверждена, код можно взять там же: карточка → вкладка «Промо».
YBADGE  = "https://yandex.ru/sprav/widget/rating-badge/221049266006?type=rating&amp;theme=dark"
# Официальный формат виджета Яндекс.Карт: id организации подставляется в oid.
YWIDGET = ("https://yandex.ru/map-widget/v1/?ll=39.032451%2C45.090656&amp;z=17"
           "&amp;ol=biz&amp;oid=221049266006")

NAV = [
    ("index.html",    "Главная"),
    ("prices.html",   "Цены"),
    ("hardware.html", "Железо"),
    ("promos.html",   "Акции"),
    ("contacts.html", "Контакты"),
]

def head(page, title, desc):
    links = "\n".join(
        '      <a href="{h}"{c}>{t}</a>'.format(h=h, t=t, c=' aria-current="page"' if h == page else '')
        for h, t in NAV)
    dlinks = "\n".join(
        '    <a href="{h}"{c}>{t}</a>'.format(h=h, t=t, c=' aria-current="page"' if h == page else '')
        for h, t in NAV) + '\n    <a href="rules.html">Правила</a>'
    return """<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="theme-color" content="#0B0B0C">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CS:ZONE">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="assets/img/logo-512.png">
<meta property="og:locale" content="ru_RU">
<link rel="icon" href="assets/img/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tektur:wght@500;700;800;900&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/main.css">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "CS:ZONE",
  "description": "Компьютерный клуб в Краснодаре: 36 машин, два буткемпа, три ТВ-зоны.",
  "image": "assets/img/logo-512.png",
  "telephone": "{tel_raw}",
  "priceRange": "120–1700 ₽",
  "address": {{
    "@type": "PostalAddress",
    "addressCountry": "RU",
    "addressLocality": "Краснодар",
    "streetAddress": "ул. Командорская, 3к2"
  }},
  "geo": {{ "@type": "GeoCoordinates", "latitude": 45.090656, "longitude": 39.032451 }},
  "openingHoursSpecification": [{{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "00:00", "closes": "23:59"
  }}],
  "hasMap": "{ymap}",
  "sameAs": ["{tg}"]
}}
</script>
</head>
<body>

<header class="nav">
  <div class="nav__in">
    <a class="nav__logo" href="index.html" aria-label="CS:ZONE — на главную">
      <img src="assets/img/logo.png" alt="" width="38" height="38">
      <span><b>CS:ZONE</b><span>Краснодар</span></span>
    </a>
    <nav class="nav__links" aria-label="Разделы сайта">
{links}
    </nav>
    <a class="nav__tel" href="tel:{tel_raw}" style="margin-left:26px">{tel_h}</a>
    <a class="btn btn--primary btn--sm nav__cta" href="booking.html" style="margin-left:18px">Забронировать</a>
    <button class="burger" type="button" aria-expanded="false" aria-label="Меню">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 7h20M3 13h20M3 19h20"/></svg>
    </button>
  </div>
</header>

<div class="drawer" id="drawer">
{dlinks}
    <a class="btn btn--primary btn--wide" href="booking.html">Забронировать место</a>
    <a class="btn btn--ghost btn--wide" href="tel:{tel_raw}">{tel_h}</a>
</div>

<main>
""".format(title=title, desc=desc, links=links, dlinks=dlinks, tel_raw=TEL_RAW, tel_h=TEL_H,
           ymap=YMAP, tg=TG)


def band(h2, sub=""):
    return """
<section class="section section--tight">
  <div class="wrap">
    <div class="band cut-l" data-rise>
      <div>
        <h2>{h2}</h2>
        {sub}
      </div>
      <div class="band__acts">
        <a class="btn btn--primary" href="booking.html">Забронировать место</a>
        <a class="btn btn--ghost" href="tel:{tel_raw}">{tel_h}</a>
      </div>
    </div>
  </div>
</section>
""".format(h2=h2, sub=('<p class="lead" style="margin-top:16px">%s</p>' % sub) if sub else "",
           tel_raw=TEL_RAW, tel_h=TEL_H)


FOOT = """
</main>

<hr class="rule-spectrum">
<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div>
        <a class="foot__logo" href="index.html">
          <img src="assets/img/logo.png" alt="" width="46" height="46">
          <span><b>CS:ZONE</b><span>Gaming club</span></span>
        </a>
        <p>Компьютерный клуб в Краснодаре. 36 машин, два буткемпа и три ТВ-зоны в одном зале.</p>
      </div>
      <div>
        <h4>Разделы</h4>
        <ul>
          <li><a href="index.html">Главная</a></li>
          <li><a href="prices.html">Цены</a></li>
          <li><a href="hardware.html">Железо</a></li>
          <li><a href="promos.html">Акции</a></li>
        </ul>
      </div>
      <div>
        <h4>Клуб</h4>
        <ul>
          <li><a href="contacts.html">Контакты</a></li>
          <li><a href="booking.html">Забронировать</a></li>
          <li><a href="rules.html">Правила клуба</a></li>
          <li><a href="{tg}" target="_blank" rel="noopener">Telegram-канал</a></li>
        </ul>
      </div>
      <div>
        <h4>Связаться</h4>
        <a class="foot__c" href="tel:{tel_raw}">{tel_h}</a>
        <a class="foot__c" href="{ymap}" target="_blank" rel="noopener">{addr}</a>
        <a class="foot__c" href="{tg}" target="_blank" rel="noopener">@cszoneclub</a>
        <span class="foot__c" style="color:var(--ash)">{hours}</span>
      </div>
    </div>
    <div class="foot__bot">
      <span>© <span id="year">2026</span> CS:ZONE</span>
      <a href="rules.html">Правила клуба</a>
    </div>
  </div>
</footer>

<script src="assets/js/main.js"></script>
</body>
</html>
""".format(tg=TG, tel_raw=TEL_RAW, tel_h=TEL_H, ymap=YMAP, addr=ADDR, hours=HOURS)


def reviews(compact=False):
    """Блок отзывов. Бейдж — официальный виджет Яндекса, отзывы живут в Картах."""
    lead = ("Клуб оценивают на Яндекс.Картах. Рейтинг ниже подтягивается оттуда "
            "автоматически — это живые оценки гостей, а не подборка для сайта.")
    if compact:
        lead = "Рейтинг и отзывы гостей подтягиваются с Яндекс.Карт автоматически."
    return """
<section class="section{tight}">
  <div class="wrap">
    <div class="band cut-l" data-rise>
      <div>
        <p class="eyebrow">Отзывы</p>
        <h2 style="font-size:clamp(1.6rem,3.2vw,2.4rem);max-width:24ch;margin-top:16px">Что
          говорят гости</h2>
        <p class="lead" style="margin-top:16px">{lead}</p>
        <div class="ybadge">
          <iframe src="{badge}" width="150" height="50" frameborder="0"
                  title="Рейтинг CS:ZONE на Яндекс.Картах" loading="lazy"></iframe>
        </div>
      </div>
      <div class="band__acts">
        <a class="btn btn--primary" href="{yrev}" target="_blank" rel="noopener">Читать отзывы</a>
        <a class="btn btn--ghost" href="{yrev}" target="_blank" rel="noopener">Оставить отзыв</a>
      </div>
    </div>
    <p class="form__hint" style="margin-top:20px">За отзыв клуб начисляет 100 ₽
      на игровой баланс — <a href="promos.html" style="color:var(--amber)">условия акции</a>.</p>
  </div>
</section>
""".format(tight=" section--tight" if compact else "", lead=lead,
           badge=YBADGE, yrev=YREV)
def page_head(eyebrow, h1, lead=""):
    """Компактная шапка для внутренних страниц."""
    return """
<section class="section" style="padding-bottom:0">
  <div class="wrap">
    <div class="hero__anim">
      <p class="eyebrow">{eyebrow}</p>
      <h1 style="font-size:clamp(2.2rem,6vw,4.4rem);margin-top:20px;letter-spacing:-.03em">{h1}</h1>
      {lead}
    </div>
  </div>
</section>
""".format(eyebrow=eyebrow, h1=h1,
           lead=('<p class="lead" style="margin-top:24px">%s</p>' % lead) if lead else "")


def soon(num, h3, text, extra=""):
    return """
      <div class="soon cut-l" data-soon data-rise>
        <div class="soon__n">{num}</div>
        <h3>{h3}</h3>
        <p>{text}</p>
        <div class="soon__acts">
          <a class="btn btn--primary" href="tel:{tel_raw}">Позвонить · {tel_h}</a>
          <a class="btn btn--ghost" href="{tg}" target="_blank" rel="noopener">Написать в Telegram</a>
        </div>
        {extra}
      </div>
""".format(num=num, h3=h3, text=text, extra=extra, tel_raw=TEL_RAW, tel_h=TEL_H, tg=TG)


# ============================================================== ГЛАВНАЯ ====
index = head("index.html", "CS:ZONE — компьютерный клуб в Краснодаре",
             "Компьютерный клуб CS:ZONE на Командорской 3к2 в Краснодаре: 36 машин, "
             "два буткемпа, три ТВ-зоны. Бронь места по телефону " + TEL_H + ".") + """
<section class="hero">
  <div class="wrap">
    <div class="hero__grid">
      <div class="hero__anim">
        <p class="eyebrow">Краснодар · Командорская 3к2 · круглосуточно</p>
        <h1 class="hero__title">Игра<em>навсегда</em></h1>
        <p class="hero__lead">Компьютерный клуб на 36 машин: основной зал, два буткемпа
          под команду и три ТВ-зоны. Выберите место на карте зала — или просто позвоните.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="booking.html">Забронировать место</a>
          <a class="btn btn--ghost" href="tel:""" + TEL_RAW + '">' + TEL_H + """</a>
        </div>
      </div>

      <div class="hero__frame">
        <div class="hero__frameIn">
          <video src="assets/video/intro.mp4" poster="assets/img/intro-poster.jpg"
                 autoplay muted loop playsinline preload="metadata"
                 aria-label="Анимация логотипа CS:ZONE"></video>
          <span class="hero__badge">CS:ZONE · Gaming club</span>
        </div>
      </div>
    </div>

    <dl class="facts" data-rise>
      <div><dt>Мест всего</dt><dd>36</dd></div>
      <div><dt>Зал STANDART</dt><dd>25<small>№06–30</small></dd></div>
      <div><dt>Буткемпы</dt><dd>2<small>5 + 6 мест</small></dd></div>
      <div><dt>Работаем</dt><dd>24/7<small>круглосуточно</small></dd></div>
    </dl>
  </div>
</section>

<hr class="rule-spectrum" style="margin-top:clamp(48px,6vw,84px)">

<!-- ЗОНЫ -->
<section class="section" id="zones">
  <div class="wrap">
    <div data-rise>
      <p class="eyebrow">Зоны клуба</p>
      <h2 class="h-sec">Выбирайте под задачу</h2>
    </div>

    <div class="cards">
      <article class="zone cut" data-rise="0">
        <div class="zone__ph">
          <img src="assets/img/hall-01.jpg" alt="Ряд игровых мест в зале STANDART" loading="lazy">
          <div class="zone__n">25<span>мест</span></div>
        </div>
        <div class="zone__b">
          <h3>Зал STANDART</h3>
          <p>Основной зал клуба, места №06–30. RTX 2060 SUPER и мониторы на 165 Гц.
             Садитесь за любое свободное и играйте.</p>
          <ul class="zone__list">
            <li>25 мест, №06–30</li>
            <li>RTX 2060 SUPER, монитор 165 Гц</li>
            <li>ASUS TUF Gaming K3, Logitech G102</li>
          </ul>
        </div>
      </article>

      <article class="zone cut" data-rise="90">
        <div class="zone__ph">
          <img src="assets/img/hall-02.jpg" alt="Буткемп: ряд машин для командной игры" loading="lazy">
          <div class="zone__n">11<span>мест</span></div>
        </div>
        <div class="zone__b">
          <h3>Буткемпы I и II</h3>
          <p>Два отдельных буткемпа: №01–05 и №31–36. Здесь RTX 3060 и мониторы
             на 280 Гц — под состав 5×5, тренировку или турнир.</p>
          <ul class="zone__list">
            <li>Буткемп I — 5 мест, Буткемп II — 6 мест</li>
            <li>RTX 3060, монитор 280 Гц</li>
            <li>HyperX Cloud II, ASUS ROG Strix NX</li>
          </ul>
        </div>
      </article>

      <article class="zone cut" data-rise="180">
        <div class="zone__ph">
          <img src="assets/img/hall-04.jpg" alt="Игровое место с подсветкой клавиатуры" loading="lazy">
          <div class="zone__n">3<span>ТВ-зоны</span></div>
        </div>
        <div class="zone__b">
          <h3>ТВ-зоны и VIP</h3>
          <p>Два Standart TV и отдельный TV VIP. Телевизор 65″ — для компании,
             файтингов и всего, во что играют вместе.</p>
          <ul class="zone__list">
            <li>2 × Standart TV</li>
            <li>1 × TV VIP</li>
            <li>Экран 65″, компанией — по брони</li>
          </ul>
        </div>
      </article>
    </div>
  </div>
</section>

<!-- ПОДПИСЬ САЙТА: КАРТА ЗАЛА -->
<section class="section" id="hall" style="padding-top:0">
  <div class="wrap">
    <div class="hall cut-l" data-rise>
      <div class="hall__head">
        <div>
          <p class="eyebrow">Карта зала</p>
          <h2 class="h-sec" style="font-size:clamp(1.7rem,3.2vw,2.6rem)">36 мест.<br>Выберите своё.</h2>
        </div>
        <div class="hall__legend">
          <span><i style="background:var(--live);border-radius:50%"></i>Свободно</span>
          <span><i style="background:#1B1417"></i>Занято</span>
          <span><i style="background:var(--amber)"></i>Ваш выбор</span>
        </div>
      </div>

      <p class="live" data-live hidden></p>
      <div data-hall="link"></div>

      <p class="hall__note">Наведите на номер — покажем, какое железо стоит на этой машине.
        Нажмите — номер подставится в заявку на бронь.
        Занятость мест подтверждает администратор: после заявки вам перезвонят
        или ответят в Telegram.</p>
    </div>
  </div>
</section>

<!-- ЦЕНЫ (данные берутся из main.js, чтобы не расходились с прайсом) -->
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="hall cut-l" data-rise>
      <div class="hall__head" style="margin-bottom:26px">
        <div>
          <p class="eyebrow">Цены</p>
          <h2 class="h-sec" style="font-size:clamp(1.7rem,3.2vw,2.6rem)">От 120 ₽ за час</h2>
        </div>
        <a class="btn btn--ghost btn--sm" href="prices.html">Весь прайс</a>
      </div>
      <div data-price-teaser></div>
    </div>
  </div>
</section>

<!-- ГАЛЕРЕЯ -->
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div data-rise>
      <p class="eyebrow">Зал</p>
      <h2 class="h-sec">Как это выглядит вживую</h2>
    </div>
    <div class="strip">
      <figure data-rise="0"><img src="assets/img/hall-01.jpg" alt="Ряд игровых мест, место 04" loading="lazy"><figcaption>Ряд · 04</figcaption></figure>
      <figure data-rise="70"><img src="assets/img/hall-02.jpg" alt="Ряд игровых мест, место 32" loading="lazy"><figcaption>Ряд · 32</figcaption></figure>
      <figure data-rise="140"><img src="assets/img/hall-03.jpg" alt="Игровое место 35" loading="lazy"><figcaption>Место · 35</figcaption></figure>
      <figure data-rise="210"><img src="assets/img/hall-04.jpg" alt="Игровое место 06" loading="lazy"><figcaption>Место · 06</figcaption></figure>
    </div>
  </div>
</section>

<!-- ПРАВИЛА (кратко) -->
<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="split split--wide">
      <div data-rise>
        <p class="eyebrow">Правила зала</p>
        <h2 class="h-sec">Коротко о главном</h2>
        <p class="lead" style="margin-top:22px">Правила простые и нужны для того, чтобы
          в зале было комфортно всем. Полный текст — на отдельной странице.</p>
        <a class="btn btn--ghost" href="rules.html" style="margin-top:26px">Все правила клуба</a>
      </div>
      <ul class="rules" style="grid-template-columns:1fr;margin-top:0" data-rise="90">
        <li><b>01</b><span>Алкоголь в зал не проносим, вход в состоянии опьянения закрыт.</span></li>
        <li><b>02</b><span>Курение запрещено на всей территории комплекса.</span></li>
        <li><b>03</b><span>Системный блок не трогаем, свои девайсы сами не подключаем.</span></li>
        <li><b>04</b><span>Агрессия к гостям и персоналу — причина покинуть клуб.</span></li>
      </ul>
    </div>
  </div>
</section>
""" + reviews(compact=True) + band("Место ждёт. Осталось его занять.",
           "Заявка занимает минуту: выберите зону и номер, укажите время — администратор подтвердит бронь.") + FOOT

# ============================================================== КОНТАКТЫ ===
contacts = head("contacts.html", "Контакты — CS:ZONE, Краснодар",
                "Адрес: " + ADDR + ". Телефон " + TEL_H + ", Telegram @cszoneclub. "
                "Клуб на карте Краснодара.") \
    + page_head("Контакты", "Как нас найти",
                "Клуб на Командорской 3к2. Позвоните или напишите в Telegram — "
                "подскажем по свободным местам и брони.") + """
<section class="section">
  <div class="wrap">
    <div class="split" style="align-items:stretch">
      <div data-rise>
        <div class="info">
          <div class="info__row">
            <span class="info__k">Адрес</span>
            <span class="info__v"><a href='""" + YMAP + """' target="_blank" rel="noopener">""" + ADDR + """</a></span>
          </div>
          <div class="info__row">
            <span class="info__k">Телефон</span>
            <span class="info__v"><a href="tel:""" + TEL_RAW + '">' + TEL_H + """</a></span>
          </div>
          <div class="info__row">
            <span class="info__k">Telegram</span>
            <span class="info__v"><a href='""" + TG + """' target="_blank" rel="noopener">@cszoneclub</a></span>
          </div>
          <div class="info__row">
            <span class="info__k">Режим работы</span>
            <span class="info__v">""" + HOURS + """</span>
          </div>
          <div class="info__row">
            <span class="info__k">В клубе</span>
            <span class="info__v">36 ПК · 2 буткемпа · 3 ТВ-зоны</span>
          </div>
        </div>

        <div class="soon__acts" style="margin-top:26px">
          <a class="btn btn--primary" href="booking.html">Забронировать место</a>
          <a class="btn btn--ghost" href='""" + YMAP + """' target="_blank" rel="noopener">Открыть в Яндекс.Картах</a>
        </div>

        <p class="form__hint" style="margin-top:26px">Приехали и не нашли вход — позвоните,
          встретим и проводим.</p>
      </div>

      <div class="map cut-l" data-rise="90">
        <iframe src='""" + YWIDGET + """'
                title="CS:ZONE на карте Краснодара" loading="lazy"
                referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        <noscript><p style="padding:24px;position:relative;z-index:2">Карта не загрузилась.
          <a href='""" + YMAP + """' target="_blank" rel="noopener"
             style="color:var(--amber)">Открыть в Яндекс.Картах</a></p></noscript>
      </div>
    </div>
  </div>
</section>
""" + reviews() + band("Ехать проще, когда место уже за вами.") + FOOT

# ================================================================= БРОНЬ ===
booking = head("booking.html", "Забронировать место — CS:ZONE",
               "Бронь игрового места в клубе CS:ZONE: выберите зону и номер ПК, "
               "укажите дату и время. Подтверждение — от администратора.") \
    + page_head("Бронь", "Забронировать место",
                "Два шага: выбираете место на карте зала, потом заполняете заявку. "
                "Бронь подтверждает администратор — по телефону или в Telegram.") + """
<section class="section">
  <div class="wrap">
    <div class="hall cut-l" data-rise>
      <div class="hall__head">
        <div>
          <p class="eyebrow">Шаг 1</p>
          <h2 class="h-sec" style="font-size:clamp(1.5rem,2.8vw,2.1rem)">Выберите место</h2>
        </div>
        <div class="hall__legend">
          <span><i style="background:var(--live);border-radius:50%"></i>Свободно</span>
          <span><i style="background:#1B1417"></i>Занято</span>
          <span><i style="background:var(--amber)"></i>Выбрано</span>
        </div>
      </div>
      <p class="live" data-live hidden></p>
      <div data-hall="pick"></div>
      <p class="hall__note">Наведите на номер — покажем железо этой машины.
        Выбрано: <b id="pick-live" style="color:var(--amber)">пока ничего</b>.
        Номер подставится в заявку. Если конкретное место не важно — просто выберите зону в форме ниже.</p>
      <div class="toast" id="booking-toast" role="status" aria-live="polite"
           style="margin-top:18px"></div>
      <div class="spec-panel" id="spec-panel" hidden></div>
    </div>
  </div>
</section>

<section class="section" style="padding-top:0">
  <div class="wrap">
    <div class="split split--wide" style="align-items:start">
      <div class="panel cut-l" data-rise>
        <p class="eyebrow">Шаг 2</p>
        <h2 class="h-sec" style="font-size:clamp(1.5rem,2.8vw,2.1rem);margin-bottom:30px">Заявка</h2>

        <form class="form" id="booking-form" novalidate>
          <div class="field">
            <label for="f-name">Имя</label>
            <input id="f-name" name="name" type="text" placeholder="Как к вам обращаться" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="f-phone">Телефон</label>
            <input id="f-phone" name="phone" type="tel" placeholder="+7 ___ ___-__-__" autocomplete="tel" required>
          </div>
          <div class="field">
            <label for="f-date">Дата</label>
            <input id="f-date" name="date" type="date" required>
          </div>
          <div class="field">
            <label for="f-time">Время</label>
            <input id="f-time" name="time" type="time" required>
          </div>
          <div class="field">
            <label for="f-hours">Сколько часов</label>
            <select id="f-hours" name="hours">
              <option>1</option><option>2</option><option selected>3</option>
              <option>4</option><option>5</option><option>6</option><option>Ночь</option>
            </select>
          </div>
          <div class="field">
            <label for="f-people">Гостей</label>
            <select id="f-people" name="people">
              <option selected>1</option><option>2</option><option>3</option><option>4</option>
              <option>5</option><option>6–10</option><option>Больше 10</option>
            </select>
          </div>
          <div class="field">
            <label for="f-zone">Зона</label>
            <select id="f-zone" name="zone">
              <option value="standart">Зал STANDART — №06–30</option>
              <option value="bootcamp1">Буткемп I — №01–05</option>
              <option value="bootcamp2">Буткемп II — №31–36</option>
              <option value="tv">Standart TV</option>
              <option value="vip">TV VIP</option>
            </select>
          </div>
          <div class="field">
            <label for="f-pc">Номер места</label>
            <input id="f-pc" name="pc" type="text" placeholder="Любое свободное">
          </div>
          <div class="field field--full">
            <label for="f-note">Комментарий</label>
            <textarea id="f-note" name="note" placeholder="Игра, состав, пожелания по месту"></textarea>
          </div>

          <div class="form__foot">
            <button class="btn btn--primary" type="button" id="btn-send">Отправить в Telegram</button>
            <button class="btn btn--ghost" type="button" id="btn-copy">Скопировать заявку</button>
            <a class="btn btn--ghost" href="tel:""" + TEL_RAW + """">Позвонить</a>
          </div>
          <p class="form__hint" style="grid-column:1/-1">Кнопка копирует заявку и открывает чат клуба —
            останется вставить текст и отправить. Бронь считается подтверждённой после ответа администратора.</p>
        </form>
      </div>

      <div data-rise="90">
        <div class="panel cut-l">
          <p class="eyebrow">Как это работает</p>
          <ul class="rules" style="grid-template-columns:1fr;margin-top:24px">
            <li><b>01</b><span>Выбираете место и заполняете заявку.</span></li>
            <li><b>02</b><span>Заявка уходит в Telegram клуба или диктуется по телефону.</span></li>
            <li><b>03</b><span>Администратор подтверждает бронь и держит место к вашему времени.</span></li>
          </ul>
        </div>

        <div class="panel cut-l" style="margin-top:20px">
          <p class="eyebrow">Быстрее — голосом</p>
          <p style="color:var(--ash);margin-top:16px">Если играете сегодня и время поджимает,
            звонок надёжнее: администратор сразу скажет, что свободно.</p>
          <a class="btn btn--primary btn--wide" href="tel:""" + TEL_RAW + '" style="margin-top:22px">' + TEL_H + """</a>
          <a class="btn btn--ghost btn--wide" href='""" + TG + """' target="_blank" rel="noopener" style="margin-top:12px">Telegram клуба</a>
        </div>

        <p class="form__hint" style="margin-top:22px">Бронируя место, вы соглашаетесь с
          <a href="rules.html" style="color:var(--amber)">правилами клуба</a>.</p>
      </div>
    </div>
  </div>
</section>
""" + FOOT

# ================================================================== ЦЕНЫ ===
prices = head("prices.html", "Цены — CS:ZONE, Краснодар",
              "Прайс компьютерного клуба CS:ZONE: час в зале STANDART от 120 ₽, буткемпы "
              "от 130 ₽, аренда TV от 230 ₽. Ночь от 550 ₽, марафон 24 часа от 1500 ₽.") \
    + page_head("Цены", "Стоимость игры",
                "Час, пакет на 3 или 5 часов, ночь или сутки. Цена зависит от зоны, "
                "времени суток и дня недели — переключите будни и выходные.") + """
<section class="section">
  <div class="wrap">
    <div data-prices></div>
""" + soon("₽", "Прайс обновляется",
           "Стоимость на сегодня быстрее узнать у администратора — по телефону "
           "или в Telegram.") + """
    <p class="form__hint" style="margin-top:30px">Пакет считается от начала игры.
      Цена за час рядом с пакетом — справочная, посчитана делением стоимости пакета
      на его длительность. Актуальность цен подтверждает администратор:
      <a href="tel:""" + TEL_RAW + '" style="color:var(--amber)">' + TEL_H + """</a>.</p>
  </div>
</section>
""" + band("Цену знаете — осталось занять место.") + FOOT

# ================================================================ ЖЕЛЕЗО ===
hardware = head("hardware.html", "Железо клуба — CS:ZONE, Краснодар",
                "Конфигурации игровых машин CS:ZONE: зал STANDART (RTX 2060 SUPER, 165 Гц) "
                "и буткемпы (RTX 3060, 280 Гц). 36 ПК и три ТВ-зоны.") \
    + page_head("Железо", "На чём вы играете",
                "36 машин в трёх зонах. В буткемпах железо мощнее, а мониторы быстрее — "
                "разница в таблице ниже.") + """
<section class="section">
  <div class="wrap">
    <dl class="facts" data-rise style="margin-top:0">
      <div><dt>Машин в клубе</dt><dd>36</dd></div>
      <div><dt>Зал STANDART</dt><dd>25<small>№06–30</small></dd></div>
      <div><dt>Буткемпы</dt><dd>2<small>5 + 6 мест</small></dd></div>
      <div><dt>ТВ-зоны</dt><dd>3<small>65″</small></dd></div>
    </dl>

    <div data-hardware style="display:grid;gap:20px;margin-top:44px"></div>

    <p class="form__hint" style="margin-top:26px">Не уверены, пойдёт ли конкретная игра
      на нужных настройках — спросите администратора, проверит на месте:
      <a href="tel:""" + TEL_RAW + '" style="color:var(--amber)">' + TEL_H + """</a>.</p>
  </div>
</section>
""" + band("Проверьте железо в деле.") + FOOT

# ================================================================= АКЦИИ ===
promos = head("promos.html", "Акции — CS:ZONE, Краснодар",
              "Акции клуба CS:ZONE: энергетик в подарок к тарифу «Ночь», команда из пяти "
              "платит за четырёх на буткемпе, 100 ₽ на баланс за отзыв.") \
    + page_head("Акции", "Предложения клуба",
                "Что действует прямо сейчас. Новые акции и турниры анонсируются "
                "в Telegram-канале первыми.") + """
<section class="section">
  <div class="wrap">
    <div data-promos class="cards" style="margin-top:0"></div>
""" + soon("%", "Пока без активных акций",
           "Новое предложение появится на этой странице.",
           extra='<a class="btn btn--primary" href="' + TG + '" target="_blank" rel="noopener" '
                 'style="margin-top:4px">Подписаться на канал</a>') + """
    <div class="band cut-l" data-rise style="margin-top:38px">
      <div>
        <p class="eyebrow">Не пропустить следующую</p>
        <h2 style="font-size:clamp(1.5rem,3vw,2.3rem);max-width:26ch;margin-top:16px">Акции
          и турниры выходят в Telegram</h2>
      </div>
      <div class="band__acts">
        <a class="btn btn--primary" href='""" + TG + """' target="_blank" rel="noopener">Подписаться на канал</a>
        <a class="btn btn--ghost" href="booking.html">Забронировать</a>
      </div>
    </div>
  </div>
</section>
""" + FOOT

# ================================================================ ПРАВИЛА ==
RULES = [
    "Запрещается проносить алкогольные напитки в зал.",
    "Запрещается спать в зале.",
    "Запрещён доступ в зал с животными.",
    "Запрещён доступ в зал лицам в состоянии алкогольного или наркотического опьянения, "
    "степень которого администрация клуба определяет по своему усмотрению.",
    "Запрещается курение на всей территории комплекса.",
    "Запрещается пользоваться симуляторами интернет-казино.",
    "Запрещается кричать и нецензурно выражаться.",
    "Запрещается находиться в зале без арендуемого места.",
    "Не допускается вход и нахождение в зале в верхней одежде, с большими сумками и без обуви.",
    "Запрещается класть ноги на стол.",
    "Запрещается наносить ущерб имуществу клуба или стучать по нему.",
    "Запрещается трогать системный блок и самостоятельно подключать любые девайсы, "
    "в том числе зарядные устройства.",
    "Вам придётся покинуть клуб, если вы будете агрессивно себя вести по отношению к другим "
    "гостям и (или) персоналу, а также нарушать правила клуба.",
    "Посетители несут ответственность за соблюдение правопорядка, правил и условий нахождения в клубе.",
    "Администрация не несёт ответственности за сохранность личных вещей и ценностей "
    "в помещениях клуба.",
    "Оплачивая игровое время, посетитель автоматически соглашается с изложенными "
    "в данном документе правилами.",
]
rules_li = "\n".join(
    '        <li data-rise="{d}"><b>{n:02d}</b><span>{t}</span></li>'.format(d=min(i * 25, 300), n=i + 1, t=t)
    for i, t in enumerate(RULES))

rules = head("rules.html", "Правила клуба — CS:ZONE, Краснодар",
             "Правила посещения компьютерного клуба CS:ZONE: что можно и что нельзя в зале.") \
    + page_head("Правила", "Правила клуба",
                "Оплачивая игровое время, посетитель соглашается с правилами ниже. "
                "Они нужны, чтобы в зале было комфортно всем.") + """
<section class="section">
  <div class="wrap">
    <div class="panel cut-l" data-rise style="margin-bottom:34px">
      <p class="eyebrow">Важно</p>
      <p style="margin-top:16px;font-size:1.06rem">Администрация клуба не несёт ответственности
        за сохранность игровых аккаунтов посетителей.</p>
    </div>

    <ul class="rules">
""" + rules_li + """
    </ul>

    <div class="panel cut-l" data-rise style="margin-top:34px">
      <div class="prose">
        <p>При нарушении настоящих правил, общепринятых правил и норм поведения сотрудники
          компьютерного клуба имеют право вывести такого посетителя из компьютерного клуба
          без компенсации стоимости услуг.</p>
        <p>Клуб оставляет за собой право ограничить доступ в соответствии с требованиями
          служб правопорядка и органов полиции, прописанными в законе о местах массового
          пребывания людей.</p>
      </div>
    </div>
  </div>
</section>
""" + band("Вопросы по правилам — задайте администратору.") + FOOT


PAGES = {
    "index.html": index, "contacts.html": contacts, "booking.html": booking,
    "prices.html": prices, "hardware.html": hardware, "promos.html": promos,
    "rules.html": rules,
}

for name, html in PAGES.items():
    with io.open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(html)
    print(name, len(html), "bytes")
