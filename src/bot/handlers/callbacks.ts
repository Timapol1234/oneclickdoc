import type { BotContext } from '../index';
import { prisma } from '@/lib/prisma';
import { InlineKeyboard } from 'grammy';

export async function handleShowTemplates(ctx: BotContext) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        templates: {
          some: {
            isActive: true
          }
        }
      },
      orderBy: {
        order: 'asc'
      },
      include: {
        _count: {
          select: {
            templates: {
              where: {
                isActive: true
              }
            }
          }
        }
      }
    });

    if (categories.length === 0) {
      await ctx.editMessageText('К сожалению, пока нет доступных шаблонов.');
      return;
    }

    const keyboard = new InlineKeyboard();

    categories.forEach((category, index) => {
      keyboard.text(
        `${category.icon} ${category.name} (${category._count.templates})`,
        `category_${category.slug}`
      );
      if (index < categories.length - 1) {
        keyboard.row();
      }
    });

    await ctx.editMessageText('📋 Выберите категорию заявлений:', {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleShowTemplates:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleShowDocuments(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка аутентификации' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      await ctx.editMessageText('Пользователь не найден. Используйте /start для регистрации.');
      await ctx.answerCallbackQuery();
      return;
    }

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      include: {
        template: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 10
    });

    if (documents.length === 0) {
      await ctx.editMessageText('У вас пока нет созданных документов. Используйте /templates для создания нового.');
      await ctx.answerCallbackQuery();
      return;
    }

    const keyboard = new InlineKeyboard();

    let message = '📄 Ваши документы:\n\n';

    documents.forEach((doc, index) => {
      const status = doc.status === 'generated' ? '✅' : '⏳';
      message += `${index + 1}. ${status} ${doc.title}\n`;

      keyboard.text(
        `${index + 1}. ${doc.title.substring(0, 30)}${doc.title.length > 30 ? '...' : ''}`,
        `document_${doc.id}`
      ).row();
    });

    keyboard.text('◀️ Назад', 'back_to_main');

    await ctx.editMessageText(message, {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleShowDocuments:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleShowHelp(ctx: BotContext) {
  const helpMessage = `📖 Справка по командам:

/start - Главное меню
/templates - Просмотр шаблонов заявлений
/documents - Мои документы
/help - Эта справка

🔍 Как создать заявление:
1. Выберите шаблон из списка (/templates)
2. Заполните пошаговую форму
3. Проверьте данные
4. Получите готовый PDF документ

💡 Подсказки:
• Все ваши документы сохраняются
• Вы можете вернуться к незаконченным документам
• PDF документы можно скачать в любое время`;

  const keyboard = new InlineKeyboard().text('◀️ Назад', 'back_to_main');

  try {
    await ctx.editMessageText(helpMessage, {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleShowHelp:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleCategoryCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const categorySlug = callbackData.replace('category_', '');

  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        templates: {
          where: {
            isActive: true
          },
          orderBy: {
            popularityScore: 'desc'
          }
        }
      }
    });

    if (!category || category.templates.length === 0) {
      await ctx.answerCallbackQuery({ text: 'Шаблоны не найдены' });
      return;
    }

    const keyboard = new InlineKeyboard();

    category.templates.forEach((template, index) => {
      keyboard.text(
        template.title.substring(0, 60),
        `template_${template.id}`
      );
      if (index < category.templates.length - 1) {
        keyboard.row();
      }
    });

    keyboard.row().text('◀️ Назад к категориям', 'show_templates');

    let message = `${category.icon} ${category.name}\n\n`;
    if (category.description) {
      message += `${category.description}\n\n`;
    }
    message += 'Выберите шаблон:';

    await ctx.editMessageText(message, {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleCategoryCallback:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleTemplateCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const templateId = callbackData.replace('template_', '');
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка аутентификации' });
    return;
  }

  try {
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        category: true,
        formFields: {
          orderBy: [
            { stepNumber: 'asc' },
            { order: 'asc' }
          ]
        }
      }
    });

    if (!template) {
      await ctx.answerCallbackQuery({ text: 'Шаблон не найден' });
      return;
    }

    const keyboard = new InlineKeyboard()
      .text('✏️ Начать заполнение', `start_form_${templateId}`)
      .row()
      .text('◀️ Назад', `category_${template.category.slug}`);

    let message = `📄 ${template.title}\n\n`;
    message += `${template.description}\n\n`;
    message += `📋 Категория: ${template.category.name}\n`;
    message += `📝 Шагов для заполнения: ${Math.max(...template.formFields.map(f => f.stepNumber), 0)}\n`;

    await ctx.editMessageText(message, {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleTemplateCallback:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleBackToMain(ctx: BotContext) {
  const keyboard = new InlineKeyboard()
    .text('📋 Шаблоны заявлений', 'show_templates')
    .row()
    .text('📄 Мои документы', 'show_documents')
    .row()
    .text('ℹ️ Помощь', 'show_help');

  const welcomeMessage = `Добро пожаловать в конструктор заявлений! 👋

Я помогу вам создать юридически корректные заявления для:
• МФЦ и государственных органов
• Судов
• Банков
• ФНС
• И других организаций

Выберите действие:`;

  try {
    await ctx.editMessageText(welcomeMessage, {
      reply_markup: keyboard
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error('Error in handleBackToMain:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}
