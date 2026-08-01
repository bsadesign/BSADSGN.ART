#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Сборка сайта BSA Design.

Шапка, подвал, контакты и мета-теги лежат здесь — в одном месте.
Тело каждой страницы — в src/<имя>.html.
Запустить:  python3 build.py
Результат:  index.html, work.html, about.html, case-*.html в корне.

Английские версии текстов живут прямо в разметке, в атрибутах
data-en="...". Отдельных EN-страниц нет: переключатель в шапке
подменяет текст. Без JS сайт остаётся рабочим русским сайтом.
"""

import pathlib
import re

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"

# ------------------------------------------------------------------
# ЗАПОЛНИТЬ: контакты и домен. Меняются только здесь.
# ------------------------------------------------------------------
SITE = "https://bsadsgn.art"                     # домен без слэша на конце
TELEGRAM = "https://t.me/bsa_dsgn"               # основная связь
TG_HANDLE = "@bsa_dsgn"
TG_CHANNEL = "https://t.me/bsadsgn"              # канал
INSTAGRAM = "https://www.instagram.com/bsa_dsgn?igsh=MWdlcW95cTdrc2F0dQ%3D%3D&utm_source=qr"
BEHANCE = "https://www.behance.net/qqye2"
INSTAGRAM_HTML = INSTAGRAM.replace("&", "&amp;")

TG_ICON = (
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">'
    '<path d="M21.9 4.3 18.7 19.4c-.24 1.07-.88 1.33-1.78.83l-4.92-3.63-2.37 2.29c-.26.26-.48.48-.99.48'
    'l.35-5.02 9.13-8.25c.4-.35-.09-.55-.62-.2L6.24 13.01l-4.86-1.52c-1.06-.33-1.08-1.05.22-1.56'
    'L20.53 2.7c.88-.33 1.65.2 1.37 1.6Z"/></svg>'
)

IG_ICON = (
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">'
    '<rect x="2.5" y="2.5" width="19" height="19" rx="5"/>'
    '<circle cx="12" cy="12" r="4.2"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>'
)

NAV = [
    ("index.html", "Главная", "Home"),
    ("about.html", "О себе", "About"),
]


def head(page):
    """<head> страницы. page — словарь из PAGES."""
    canonical = f"{SITE}/{page['file']}" if page["file"] != "index.html" else f"{SITE}/"
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title data-en="{page['title_en']}">{page['title']}</title>
<meta name="description" data-en-content="{page['desc_en']}" content="{page['desc']}">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="ru" href="{canonical}">
<link rel="alternate" hreflang="en" href="{canonical}?lang=en">
<link rel="icon" href="assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="assets/img/icon-192.png" sizes="192x192" type="image/png">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/img/apple-touch-icon.png">
<meta name="theme-color" content="#0E0A09">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="assets/css/main.css">
<script>document.documentElement.className += ' js';</script>
<meta property="og:title" data-en-content="{page['title_en']}" content="{page['title']}">
<meta property="og:description" data-en-content="{page['desc_en']}" content="{page['desc']}">
<meta property="og:type" content="website">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{SITE}/assets/img/og-cover.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Sergey",
  "alternateName": "BSA Design",
  "jobTitle": "Web designer and frontend developer",
  "url": "{SITE}/",
  "sameAs": ["{TELEGRAM}", "{TG_CHANNEL}", "{INSTAGRAM}", "{BEHANCE}"],
  "knowsLanguage": ["ru", "en"],
  "worksFor": {{ "@type": "Organization", "name": "BSA Design" }}
}}
</script>
</head>
<body>

<a class="skip" href="#main" data-en="Skip to content">К содержимому</a>
"""


def header(page):
    """Шапка: логотип, навигация, язык, бургер."""
    file = page["file"]
    active = file

    def links():
        out = []
        for href, ru, en in NAV:
            cur = ' aria-current="page"' if href == active else ""
            out.append('      <a href="%s"%s data-en="%s">%s</a>' % (href, cur, en, ru))
        return "\n".join(out)

    desk = links()
    mob = links()

    return f"""<header class="topbar">
  <div class="wrap topbar__in">
    <a class="mark" href="index.html" aria-label="BSA Design — на главную" data-en-aria-label="BSA Design — home">
      <svg class="mark__sign" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1.5" y="1.5" width="29" height="29" rx="2" fill="none" stroke="#C79A3E" stroke-width="1.2"/>
        <rect x="5" y="5" width="22" height="22" rx="1" fill="none" stroke="#C79A3E" stroke-opacity=".35" stroke-width="1"/>
        <text x="16" y="22.5" text-anchor="middle" font-family="Prata, Georgia, serif" font-size="16" fill="#F6DFA0">B</text>
      </svg>
      <span class="mark__word">
        <span class="mark__bsa">BSA</span>
        <i class="mark__rule"></i>
        <span class="mark__sub">Design</span>
      </span>
    </a>
    <nav class="nav" aria-label="Основная навигация" data-en-aria-label="Main navigation">
{desk}
    </nav>
    <div class="langs" role="group" aria-label="Язык сайта" data-en-aria-label="Site language">
      <button type="button" data-lang="ru" aria-pressed="true">RU</button>
      <button type="button" data-lang="en" aria-pressed="false">EN</button>
    </div>
    <a class="btn btn--gold btn--sm" href="{TELEGRAM}" target="_blank" rel="noopener">{TG_ICON}<span data-en="Message me">Написать</span></a>
    <button class="burger" type="button" aria-expanded="false" aria-controls="mnav"
            aria-label="Меню" data-en-aria-label="Menu"><span></span></button>
  </div>
  <nav class="mnav" id="mnav" aria-label="Меню" data-en-aria-label="Menu">
    <div class="wrap mnav__in">
{mob}
      <a class="btn btn--gold" href="{TELEGRAM}" target="_blank" rel="noopener">{TG_ICON}<span data-en="Message me">Написать</span></a>
    </div>
  </nav>
</header>

<main id="main">
"""


def footer():
    return f"""</main>

<footer class="foot">
  <div class="wrap foot__in">
    <span>© <span data-year>2026</span> BSA Design</span>
    <a class="tg tg--plain" href="{TELEGRAM}" target="_blank" rel="noopener"
       aria-label="Написать в Telegram" data-en-aria-label="Message on Telegram">{TG_ICON}<span>{TG_HANDLE}</span></a>
    <a href="{INSTAGRAM_HTML}" target="_blank" rel="noopener">Instagram</a>
    <a href="{TG_CHANNEL}" target="_blank" rel="noopener" data-en="Telegram channel">Канал</a>
    <a href="{BEHANCE}" target="_blank" rel="noopener">Behance</a>
    <span class="sp" data-en="Remote · Russian and English">Удалённо · русский и английский</span>
  </div>
</footer>

<script src="assets/js/main.js"></script>
</body>
</html>
"""


PAGES = [
    dict(
        file="index.html",
        src="index.html",
        title="BSA Design — сайты под ключ для малого бизнеса",
        title_en="BSA Design — websites built end to end for small business",
        desc="Делаю сайты под ключ для малого бизнеса: от структуры и дизайна до готовой версии в браузере. Лендинг — от 3000 ₽, срок — от одного дня.",
        desc_en="Websites built end to end for small businesses: structure, design and a finished version running in the browser. Landing pages from $40, turnaround from one day.",
    ),
    dict(
        file="about.html",
        src="about.html",
        title="О себе и контакты — BSA Design",
        title_en="About and contacts — BSA Design",
        desc="Sergey, веб-дизайнер и фронтенд-разработчик из России. Работаю удалённо на русском и английском, готовлюсь к переезду во Вьетнам.",
        desc_en="Sergey, web designer and frontend developer from Russia. Working remotely in Russian and English, preparing to move to Vietnam.",
    ),
]

# подстановки, доступные в телах страниц
VARS = {
    "TELEGRAM": TELEGRAM,
    "TG_HANDLE": TG_HANDLE,
    "TG_CHANNEL": TG_CHANNEL,
    "INSTAGRAM": INSTAGRAM.replace("&", "&amp;"),  # в HTML амперсанд экранируется
    "BEHANCE": BEHANCE,
    "SITE": SITE,
    "TG_ICON": TG_ICON,
    "IG_ICON": IG_ICON,
}


def build():
    for page in PAGES:
        body = (SRC / page["src"]).read_text(encoding="utf-8")
        for key, val in VARS.items():
            body = body.replace("{{" + key + "}}", val)
        html = head(page) + header(page) + body + footer()
        (ROOT / page["file"]).write_text(html, encoding="utf-8")
        print("собрано:", page["file"])

    # sitemap
    urls = "\n".join(
        f"  <url><loc>{SITE}/{p['file'] if p['file'] != 'index.html' else ''}</loc></url>"
        for p in PAGES
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n</urlset>\n",
        encoding="utf-8",
    )
    # «Версаль» не запущен: живую версию не показываем и не отдаём поисковикам
    (ROOT / "robots.txt").write_text(
        "User-agent: *\nAllow: /\nDisallow: /projects/versal/\n\n"
        f"Sitemap: {SITE}/sitemap.xml\n", encoding="utf-8"
    )
    print("собрано: sitemap.xml, robots.txt")


if __name__ == "__main__":
    build()
