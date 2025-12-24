# Telegram Bot - Быстрый старт

## Что уже сделано

✅ Telegram бот полностью реализован и готов к работе!

### Реализованный функционал:

1. **Регистрация и авторизация** через Telegram ID
2. **Просмотр шаблонов** по категориям
3. **Интерактивное заполнение форм** через чат
4. **Сохранение документов** в базе данных
5. **Просмотр истории** созданных документов

### Структура бота:

```
src/bot/
├── index.ts                    # Инициализация бота
├── handlers/
│   ├── index.ts               # Регистрация обработчиков
│   ├── start.ts               # /start - главное меню
│   ├── help.ts                # /help - справка
│   ├── templates.ts           # /templates - шаблоны
│   ├── documents.ts           # /documents - мои документы
│   ├── callbacks.ts           # Inline кнопки
│   └── form.ts                # Заполнение форм
└── session/
    └── SessionManager.ts      # Управление сессиями

src/app/api/bot/
├── webhook/route.ts           # Вебхук для Telegram
└── setup/route.ts             # Настройка вебхука
```

## Как запустить

### 1. Для локальной разработки

```bash
# Убедитесь, что в .env указан токен бота
TELEGRAM_BOT_TOKEN="8523095619:AAH1KsbBG3PLNQ9i6Z0MIyIzn9FpJwwLHN0"

# Запустите приложение
npm run dev
```

**Важно:** Для локальной разработки нужен публичный URL (ngrok):

```bash
# Установите ngrok
npm install -g ngrok

# Запустите ngrok в отдельном терминале
ngrok http 3000

# Скопируйте HTTPS URL из ngrok (например: https://abc123.ngrok.io)
# Обновите .env:
WEBHOOK_URL="https://abc123.ngrok.io"

# Настройте вебхук через API
curl -X POST https://abc123.ngrok.io/api/bot/setup
```

### 2. Для production (Vercel)

```bash
# 1. Задеплойте на Vercel
vercel --prod

# 2. Добавьте переменные окружения в Vercel Dashboard:
# TELEGRAM_BOT_TOKEN=8523095619:AAH1KsbBG3PLNQ9i6Z0MIyIzn9FpJwwLHN0
# WEBHOOK_URL=https://your-app.vercel.app

# 3. Настройте вебхук
curl -X POST https://your-app.vercel.app/api/bot/setup
```

## Проверка работы бота

### 1. Проверить вебхук

```bash
# Для локальной разработки
curl http://localhost:3000/api/bot/setup

# Для production
curl https://your-app.vercel.app/api/bot/setup
```

**Ожидаемый ответ:**
```json
{
  "ok": true,
  "webhook": {
    "url": "https://your-app.vercel.app/api/bot/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### 2. Протестировать бота

1. Откройте Telegram
2. Найдите вашего бота
3. Отправьте команду `/start`
4. Следуйте инструкциям бота

## Команды бота

- `/start` - Главное меню с приветствием
- `/templates` - Просмотр доступных шаблонов
- `/documents` - Ваши созданные документы
- `/help` - Справка по использованию
- `/cancel` - Отменить текущее заполнение формы

## Процесс создания заявления

1. Пользователь отправляет `/start` или `/templates`
2. Выбирает категорию (МФЦ, Суды, Банки и т.д.)
3. Выбирает конкретный шаблон заявления
4. Нажимает "Начать заполнение"
5. Отвечает на вопросы шаг за шагом
6. Получает подтверждение о сохранении документа

## Что дальше?

### Рекомендуемые улучшения:

1. **PDF генерация** - Автоматическое создание PDF файлов
2. **Отправка документов** - Отправка PDF напрямую в чат
3. **Редактирование** - Возможность исправить введенные данные
4. **Уведомления** - Push-уведомления о статусе документов
5. **Поддержка медиа** - Загрузка фотографий и сканов

### Полезные ссылки:

- Полная документация: `docs/TELEGRAM_BOT.md`
- Grammy документация: https://grammy.dev/
- Telegram Bot API: https://core.telegram.org/bots/api

## Troubleshooting

### Бот не отвечает

1. Проверьте, что `TELEGRAM_BOT_TOKEN` правильно указан в `.env`
2. Убедитесь, что вебхук настроен: `GET /api/bot/setup`
3. Проверьте логи приложения

### Ошибка при заполнении формы

1. Убедитесь, что в базе данных есть шаблоны с полями
2. Проверьте, что поле `telegramId` добавлено в таблицу `users`
3. Посмотрите логи на наличие ошибок

### Вебхук не устанавливается

1. URL должен быть HTTPS (для production)
2. Проверьте доступность вашего URL
3. Убедитесь, что `WEBHOOK_URL` указан корректно в `.env`

## Контакты для поддержки

При возникновении проблем проверьте:
1. Логи в консоли (локально) или Vercel Dashboard (production)
2. Документацию в `docs/TELEGRAM_BOT.md`
3. Официальную документацию Grammy и Telegram Bot API
