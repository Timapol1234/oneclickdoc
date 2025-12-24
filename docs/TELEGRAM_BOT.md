# Telegram Bot - Документация

## Описание

Telegram бот для сервиса создания заявлений позволяет пользователям:
- Регистрироваться и авторизоваться через Telegram
- Просматривать доступные шаблоны заявлений
- Заполнять формы в интерактивном чате
- Сохранять и просматривать созданные документы
- Получать готовые PDF документы

## Структура файлов

```
src/bot/
├── index.ts                 # Главный файл бота, инициализация
├── handlers/                # Обработчики команд и событий
│   ├── index.ts            # Регистрация всех обработчиков
│   ├── start.ts            # Команда /start
│   ├── help.ts             # Команда /help
│   ├── templates.ts        # Команда /templates
│   ├── documents.ts        # Команда /documents
│   ├── callbacks.ts        # Обработчики inline кнопок
│   └── form.ts             # Логика заполнения форм
└── session/
    └── SessionManager.ts   # Управление сессиями пользователей

src/app/api/bot/
├── webhook/
│   └── route.ts            # Эндпоинт для вебхука Telegram
└── setup/
    └── route.ts            # API для настройки вебхука
```

## Установка и настройка

### 1. Создание бота в Telegram

1. Откройте Telegram и найдите @BotFather
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Скопируйте полученный токен

### 2. Настройка переменных окружения

Добавьте в файл `.env`:

```env
TELEGRAM_BOT_TOKEN=8523095619:AAH1KsbBG3PLNQ9i6Z0MIyIzn9FpJwwLHN0
WEBHOOK_URL=https://your-app.vercel.app
```

### 3. Миграция базы данных

Обновите схему базы данных для поддержки Telegram:

```bash
npx prisma migrate dev --name add_telegram_support
```

### 4. Настройка вебхука

После деплоя приложения, настройте вебхук:

```bash
# POST запрос к вашему API
curl -X POST https://your-app.vercel.app/api/bot/setup

# Проверить текущий вебхук
curl https://your-app.vercel.app/api/bot/setup

# Удалить вебхук
curl -X DELETE https://your-app.vercel.app/api/bot/setup
```

## Локальная разработка

Для локальной разработки используйте ngrok для создания публичного URL:

```bash
# Установите ngrok
npm install -g ngrok

# Запустите Next.js приложение
npm run dev

# В другом терминале запустите ngrok
ngrok http 3000

# Скопируйте HTTPS URL из ngrok и установите в .env
WEBHOOK_URL=https://abc123.ngrok.io
```

Затем настройте вебхук через API или используя curl:

```bash
curl -X POST https://abc123.ngrok.io/api/bot/setup
```

## Команды бота

### Основные команды

- `/start` - Главное меню, регистрация пользователя
- `/templates` - Просмотр доступных шаблонов заявлений
- `/documents` - Список созданных документов
- `/help` - Справочная информация
- `/cancel` - Отмена текущего заполнения формы

### Процесс создания заявления

1. Пользователь выбирает `/start` или `/templates`
2. Выбирает категорию заявлений
3. Выбирает конкретный шаблон
4. Нажимает "Начать заполнение"
5. Отвечает на вопросы шаг за шагом
6. Получает готовый документ

## API Эндпоинты

### POST /api/bot/webhook

Основной эндпоинт для получения обновлений от Telegram.

**Обработка:**
- Команды (/start, /help и т.д.)
- Callback queries (нажатия на inline кнопки)
- Текстовые сообщения (ответы на вопросы формы)

### POST /api/bot/setup

Настройка вебхука Telegram.

**Response:**
```json
{
  "ok": true,
  "message": "Webhook set successfully",
  "url": "https://your-app.vercel.app/api/bot/webhook"
}
```

### GET /api/bot/setup

Получение информации о текущем вебхуке.

**Response:**
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

### DELETE /api/bot/setup

Удаление вебхука.

## Управление сессиями

SessionManager управляет состоянием заполнения форм для каждого пользователя.

### Методы:

- `createSession(telegramId, data)` - Создать новую сессию
- `getSession(telegramId)` - Получить текущую сессию
- `updateSession(telegramId, updates)` - Обновить сессию
- `saveFieldData(telegramId, fieldName, value)` - Сохранить данные поля
- `nextField(telegramId)` - Перейти к следующему полю
- `getCurrentField(telegramId)` - Получить текущее поле
- `isFormComplete(telegramId)` - Проверить завершение формы
- `deleteSession(telegramId)` - Удалить сессию

### Структура сессии:

```typescript
interface SessionData {
  userId: string;
  templateId: string;
  documentId: string;
  currentStep: number;
  currentFieldIndex: number;
  formData: Record<string, any>;
  fields: Array<FormField>;
}
```

## Обработка ошибок

Все обработчики включают try-catch блоки для корректной обработки ошибок:

```typescript
try {
  // Логика обработки
} catch (error) {
  console.error('Error:', error);
  await ctx.reply('Произошла ошибка. Попробуйте позже.');
}
```

## Безопасность

1. **Валидация токена**: Telegram автоматически проверяет подлинность запросов
2. **Валидация ввода**: Все пользовательские данные валидируются перед сохранением
3. **Аутентификация**: Каждый пользователь идентифицируется по Telegram ID
4. **Приватность**: Данные пользователей хранятся отдельно от Telegram

## Мониторинг

Логи бота можно просматривать:
- В консоли при локальной разработке
- В Vercel Dashboard → Logs (в production)
- Интегрировать с Sentry для отслеживания ошибок

## Troubleshooting

### Бот не отвечает

1. Проверьте TELEGRAM_BOT_TOKEN в .env
2. Убедитесь, что вебхук настроен: `GET /api/bot/setup`
3. Проверьте логи в Vercel Dashboard

### Вебхук не устанавливается

1. URL должен быть HTTPS (кроме localhost для разработки)
2. Проверьте доступность URL
3. Убедитесь, что WEBHOOK_URL указан корректно

### Формы не сохраняются

1. Проверьте подключение к базе данных
2. Убедитесь, что миграция Prisma выполнена
3. Проверьте логи на ошибки

## Дальнейшее развитие

### Планируемые функции:

1. **PDF генерация** - Автоматическая генерация PDF при завершении формы
2. **Отправка документов** - Отправка PDF файлов напрямую в чат
3. **История действий** - Просмотр истории заполнения форм
4. **Уведомления** - Push-уведомления о статусе документов
5. **Поддержка медиа** - Загрузка фотографий и документов
6. **Оплата** - Интеграция Telegram Payments для премиум функций

### Улучшения UX:

1. Inline клавиатуры для быстрого выбора
2. Предпросмотр документа перед сохранением
3. Редактирование уже заполненных данных
4. Шаблоны быстрых ответов
5. Поддержка голосовых сообщений

## Полезные ссылки

- [Grammy Documentation](https://grammy.dev/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [BotFather](https://t.me/BotFather)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
