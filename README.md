# Think-asta

Сайт агентства и админка. Next.js 15, Postgres, Prisma, Tailwind 4.

## Запуск

```bash
cp .env.example .env          # задайте SESSION_SECRET и ADMIN_PASSWORD
docker compose up -d db
npm install
npx prisma db push
npm run db:seed               # создаёт админа и стартовые тексты
npm run dev
```

Админка: `/admin`. Вход по `ADMIN_EMAIL` и `ADMIN_PASSWORD` из `.env`.

## Устройство

- Дизайн-система (вариант E: белый, чёрный, коралл #FF5A4E; Unbounded + Manrope): токены и компоненты в `src/app/globals.css` (`.wordmark`, `.marquee`, `.btn`, `.card`, `.tile`, `.field`, `.chip`, карусель). Админка использует те же токены в более спокойном виде (`.admin`).
- Тексты, услуги, процесс, FAQ, проекты, блог, заявки и контакты правятся в админке.
- Заявки уходят в Битрикс24 (`BITRIX_WEBHOOK_URL`) и Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), если переменные заданы.
- Загруженные картинки лежат в `uploads/` (или `UPLOAD_DIR`), смонтируйте эту папку как volume.

## SEO (Google и Яндекс)

- Задайте в `.env`: `SITE_URL` (боевой домен с https), `GOOGLE_VERIFICATION` и `YANDEX_VERIFICATION` (коды из Search Console и Яндекс Вебмастера), `YM_ID` (счётчик Метрики), `GA_ID` (Google Analytics 4).
- `/sitemap.xml` и `/robots.txt` строятся сами из базы, в карту попадают только опубликованные проекты и статьи. Отдельные правила для Yandex и Googlebot, `/admin` и `/api` закрыты.
- У каждой страницы свои title, description, canonical и Open Graph. Заголовок и описание главной правятся в админке («Тексты и контакты»), у статей есть поля SEO title и description.
- Структурированные данные (JSON-LD): ProfessionalService и WebSite на всех страницах, ItemList услуг и FAQPage на главной, Article и BreadcrumbList у статей, CreativeWork и BreadcrumbList у проектов.
- После выкладки: добавьте сайт в Яндекс Вебмастер и Google Search Console, отправьте `/sitemap.xml`, в Вебмастере укажите регион (раздел «Региональность») и подключите Яндекс Бизнес.

## Deploy

On a fresh Debian/Ubuntu/Fedora server, as root or a sudo user:

```bash
curl -fsSL https://raw.githubusercontent.com/sudxxt-afk/think-asta/main/deploy/install.sh | bash
```

Installs Docker, replaces nginx/apache with Caddy (automatic HTTPS on `<ip>.sslip.io`), starts Postgres + app, prints the admin login. Re-run it to update. Options: `--domain example.com`, `--pubkey "ssh-ed25519 ..."`.
