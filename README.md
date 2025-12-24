# Конструктор заявлений

Веб-сервис для создания юридически корректных заявлений через пошаговый конструктор с готовыми шаблонами для МФЦ, судов, банков, ФНС и других организаций.

## Технологический стек

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **База данных:** PostgreSQL (Neon.tech)
- **Аутентификация:** NextAuth.js
- **Валидация:** Zod, React Hook Form
- **Управление состоянием:** Zustand
- **Telegram Bot:** Grammy
- **Email:** Nodemailer

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Настройка базы данных

1. Скопируйте `.env.example` в `.env`:
```bash
cp .env.example .env
```

2. DATABASE_URL уже настроен для SQLite: `file:./prisma/dev.db`

3. Запустите миграции Prisma (автоматически выполнит seed):
```bash
npx prisma migrate dev --name init
```

### Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
gosZayavleniya/
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React компоненты
│   ├── lib/             # Утилиты и хелперы
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript типы
│   └── constants/       # Константы
├── prisma/              # Prisma схема и миграции
└── public/              # Статические файлы
```

## Команды

- `npm run dev` - Запуск в режиме разработки
- `npm run build` - Сборка для production
- `npm run start` - Запуск production сборки
- `npm run lint` - Проверка кода ESLint
- `npm run format` - Форматирование кода Prettier
- `npm run type-check` - Проверка типов TypeScript

### База данных

- `npx prisma migrate dev` - Создать и применить миграцию
- `npx prisma db push` - Применить изменения схемы (разработка)
- `npx prisma studio` - Открыть Prisma Studio
- `npx prisma db seed` - Заполнить БД начальными данными

## Telegram Bot

Проект включает полнофункционального Telegram бота для создания заявлений через мессенджер.

### Возможности бота:

- Регистрация и авторизация через Telegram
- Просмотр доступных шаблонов заявлений
- Интерактивное заполнение форм в чате
- Сохранение и просмотр документов
- Пошаговая система с валидацией

### Быстрый старт:

```bash
# 1. Добавьте в .env токен бота
TELEGRAM_BOT_TOKEN="your-bot-token"
WEBHOOK_URL="https://your-app.vercel.app"

# 2. Настройте вебхук (после деплоя)
curl -X POST https://your-app.vercel.app/api/bot/setup
```

### Документация:

- [Полная документация бота](docs/TELEGRAM_BOT.md)
- [Быстрый старт](docs/TELEGRAM_BOT_QUICKSTART.md)

## Документация

- [CLAUDE.md](CLAUDE.md) - Руководство для разработки
- [Telegram Bot](docs/TELEGRAM_BOT.md) - Документация бота
- [Быстрый старт бота](docs/TELEGRAM_BOT_QUICKSTART.md)

## Лицензия

MIT
