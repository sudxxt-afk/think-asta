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

- Дизайн-система: токены и компоненты в `src/app/globals.css` (цвета, шрифты, `.btn`, `.card`, `.field`, `.chip`, карусель).
- Тексты, услуги, процесс, FAQ, проекты, блог, заявки и контакты правятся в админке.
- Заявки уходят в Битрикс24 (`BITRIX_WEBHOOK_URL`) и Telegram (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), если переменные заданы.
- Загруженные картинки лежат в `uploads/` (или `UPLOAD_DIR`), смонтируйте эту папку как volume.
