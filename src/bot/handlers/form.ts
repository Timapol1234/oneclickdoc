import type { BotContext } from '../index';
import { prisma } from '@/lib/prisma';
import { InlineKeyboard } from 'grammy';
import { sessionManager } from '../session/SessionManager';

export async function handleStartForm(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const templateId = callbackData.replace('start_form_', '');
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.answerCallbackQuery({ text: 'Ошибка аутентификации' });
    return;
  }

  try {
    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      await ctx.answerCallbackQuery({ text: 'Пользователь не найден' });
      return;
    }

    // Получаем шаблон с полями
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
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

    // Создаем новый документ в статусе draft
    const document = await prisma.document.create({
      data: {
        userId: user.id,
        templateId: template.id,
        title: template.title,
        status: 'draft',
        filledData: '{}'
      }
    });

    // Создаем сессию для заполнения формы
    sessionManager.createSession(telegramId, {
      userId: user.id,
      templateId: template.id,
      documentId: document.id,
      fields: template.formFields.map(field => ({
        id: field.id,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        label: field.label,
        placeholder: field.placeholder || undefined,
        isRequired: field.isRequired,
        options: field.options || undefined,
        stepNumber: field.stepNumber
      }))
    });

    const totalSteps = sessionManager.getTotalSteps(telegramId);

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      `✏️ Начинаем заполнение: ${template.title}\n\n` +
      `Всего шагов: ${totalSteps}\n\n` +
      `Отвечайте на вопросы последовательно. Вы можете отменить заполнение командой /cancel`
    );

    // Показываем первый вопрос
    await askNextQuestion(ctx, telegramId);

  } catch (error) {
    console.error('Error in handleStartForm:', error);
    await ctx.answerCallbackQuery({ text: 'Произошла ошибка' });
  }
}

export async function handleFormInput(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();
  const text = ctx.message?.text;

  if (!telegramId || !text) return;

  const session = sessionManager.getSession(telegramId);

  if (!session) {
    return; // Пользователь не в режиме заполнения формы
  }

  const currentField = sessionManager.getCurrentField(telegramId);

  if (!currentField) {
    await ctx.reply('Ошибка: не удалось определить текущее поле');
    return;
  }

  // Валидация ввода
  const validationResult = validateFieldInput(currentField, text);

  if (!validationResult.valid) {
    await ctx.reply(`❌ ${validationResult.error}\n\nПопробуйте еще раз:`);
    return;
  }

  // Сохраняем данные
  sessionManager.saveFieldData(telegramId, currentField.fieldName, validationResult.value);

  // Переходим к следующему полю
  const hasNext = sessionManager.nextField(telegramId);

  if (!hasNext || sessionManager.isFormComplete(telegramId)) {
    // Форма завершена
    await completeForm(ctx, telegramId);
  } else {
    // Показываем следующий вопрос
    await askNextQuestion(ctx, telegramId);
  }
}

async function askNextQuestion(ctx: BotContext, telegramId: string) {
  const session = sessionManager.getSession(telegramId);
  const currentField = sessionManager.getCurrentField(telegramId);

  if (!session || !currentField) {
    await ctx.reply('Ошибка при получении следующего вопроса');
    return;
  }

  const totalSteps = sessionManager.getTotalSteps(telegramId);
  const progress = `[Шаг ${session.currentStep}/${totalSteps}]`;

  let message = `${progress}\n\n❓ ${currentField.label}`;

  if (currentField.isRequired) {
    message += ' *';
  }

  if (currentField.placeholder) {
    message += `\n\n💡 Например: ${currentField.placeholder}`;
  }

  // Если это select поле, показываем опции
  if (currentField.fieldType === 'select' && currentField.options) {
    const options = currentField.options.split(',').map(o => o.trim());
    const keyboard = new InlineKeyboard();

    options.forEach((option, index) => {
      keyboard.text(option, `select_${currentField.fieldName}_${index}`);
      if (index < options.length - 1) {
        keyboard.row();
      }
    });

    keyboard.row().text('❌ Отменить', 'cancel_form');

    await ctx.reply(message, { reply_markup: keyboard });
  } else {
    const keyboard = new InlineKeyboard().text('❌ Отменить', 'cancel_form');
    await ctx.reply(message, { reply_markup: keyboard });
  }
}

function validateFieldInput(field: any, input: string): { valid: boolean; value?: any; error?: string } {
  // Проверка обязательности
  if (field.isRequired && !input.trim()) {
    return { valid: false, error: 'Это поле обязательно для заполнения' };
  }

  switch (field.fieldType) {
    case 'number':
      const num = parseFloat(input);
      if (isNaN(num)) {
        return { valid: false, error: 'Пожалуйста, введите число' };
      }
      return { valid: true, value: num };

    case 'date':
      // Простая валидация даты (можно улучшить)
      const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
      if (!dateRegex.test(input)) {
        return { valid: false, error: 'Пожалуйста, введите дату в формате ДД.ММ.ГГГГ' };
      }
      return { valid: true, value: input };

    case 'text':
    case 'textarea':
    default:
      return { valid: true, value: input };
  }
}

async function completeForm(ctx: BotContext, telegramId: string) {
  const session = sessionManager.getSession(telegramId);

  if (!session) {
    await ctx.reply('Ошибка: сессия не найдена');
    return;
  }

  try {
    // Сохраняем заполненные данные в документ
    await prisma.document.update({
      where: { id: session.documentId },
      data: {
        filledData: JSON.stringify(session.formData),
        status: 'generated'
      }
    });

    sessionManager.deleteSession(telegramId);

    const keyboard = new InlineKeyboard()
      .text('📄 Мои документы', 'show_documents')
      .row()
      .text('🏠 Главное меню', 'back_to_main');

    await ctx.reply(
      '✅ Отлично! Форма заполнена.\n\n' +
      'Ваш документ сохранен. Генерация PDF будет доступна в ближайшее время.',
      { reply_markup: keyboard }
    );

  } catch (error) {
    console.error('Error completing form:', error);
    await ctx.reply('Произошла ошибка при сохранении данных');
  }
}

export async function handleCancelForm(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) return;

  const session = sessionManager.getSession(telegramId);

  if (session) {
    // Удаляем черновик документа
    try {
      await prisma.document.delete({
        where: { id: session.documentId }
      });
    } catch (error) {
      console.error('Error deleting draft document:', error);
    }

    sessionManager.deleteSession(telegramId);
  }

  const keyboard = new InlineKeyboard()
    .text('📋 Шаблоны заявлений', 'show_templates')
    .row()
    .text('🏠 Главное меню', 'back_to_main');

  await ctx.answerCallbackQuery();
  await ctx.editMessageText('❌ Заполнение формы отменено', { reply_markup: keyboard });
}

export async function handleSelectOption(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data;
  const telegramId = ctx.from?.id.toString();

  if (!callbackData || !telegramId) return;

  const session = sessionManager.getSession(telegramId);

  if (!session) {
    await ctx.answerCallbackQuery({ text: 'Сессия не найдена' });
    return;
  }

  const currentField = sessionManager.getCurrentField(telegramId);

  if (!currentField || !currentField.options) {
    await ctx.answerCallbackQuery({ text: 'Ошибка при обработке выбора' });
    return;
  }

  // Парсим callback data: select_{fieldName}_{index}
  const parts = callbackData.split('_');
  const optionIndex = parseInt(parts[parts.length - 1]);

  const options = currentField.options.split(',').map(o => o.trim());
  const selectedValue = options[optionIndex];

  if (!selectedValue) {
    await ctx.answerCallbackQuery({ text: 'Неверный выбор' });
    return;
  }

  // Сохраняем выбранное значение
  sessionManager.saveFieldData(telegramId, currentField.fieldName, selectedValue);

  await ctx.answerCallbackQuery({ text: `Выбрано: ${selectedValue}` });

  // Переходим к следующему полю
  const hasNext = sessionManager.nextField(telegramId);

  if (!hasNext || sessionManager.isFormComplete(telegramId)) {
    await completeForm(ctx, telegramId);
  } else {
    await askNextQuestion(ctx, telegramId);
  }
}
