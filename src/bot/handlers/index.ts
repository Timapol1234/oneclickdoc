import type { Bot } from 'grammy';
import type { BotContext } from '../index';
import { handleStart } from './start';
import { handleTemplates } from './templates';
import { handleDocuments } from './documents';
import { handleHelp } from './help';
import {
  handleShowTemplates,
  handleShowDocuments,
  handleShowHelp,
  handleCategoryCallback,
  handleTemplateCallback,
  handleBackToMain
} from './callbacks';
import {
  handleStartForm,
  handleFormInput,
  handleCancelForm,
  handleSelectOption
} from './form';
import { sessionManager } from '../session/SessionManager';

export function registerHandlers(bot: Bot<BotContext>) {
  // Команды
  bot.command('start', handleStart);
  bot.command('help', handleHelp);
  bot.command('templates', handleTemplates);
  bot.command('documents', handleDocuments);
  bot.command('cancel', handleCancelFormCommand);

  // Callback query обработчики (для inline кнопок)
  bot.callbackQuery('show_templates', handleShowTemplates);
  bot.callbackQuery('show_documents', handleShowDocuments);
  bot.callbackQuery('show_help', handleShowHelp);
  bot.callbackQuery('back_to_main', handleBackToMain);
  bot.callbackQuery('cancel_form', handleCancelForm);
  bot.callbackQuery(/^category_/, handleCategoryCallback);
  bot.callbackQuery(/^template_/, handleTemplateCallback);
  bot.callbackQuery(/^document_/, handleDocumentCallback);
  bot.callbackQuery(/^start_form_/, handleStartForm);
  bot.callbackQuery(/^select_/, handleSelectOption);

  // Обработка текстовых сообщений (для заполнения форм)
  bot.on('message:text', handleTextMessage);
}

async function handleDocumentCallback(ctx: BotContext) {
  const callbackData = ctx.callbackQuery?.data;
  if (!callbackData) return;

  const documentId = callbackData.replace('document_', '');

  await ctx.answerCallbackQuery();
  await ctx.reply('Функция в разработке: показ документа ' + documentId);
}

async function handleCancelFormCommand(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) return;

  const session = sessionManager.getSession(telegramId);

  if (!session) {
    await ctx.reply('Вы не находитесь в процессе заполнения формы.');
    return;
  }

  try {
    await ctx.reply('Отменяю заполнение формы...');
    await handleCancelForm(ctx);
  } catch (error) {
    console.error('Error in handleCancelFormCommand:', error);
  }
}

async function handleTextMessage(ctx: BotContext) {
  const text = ctx.message?.text;
  const telegramId = ctx.from?.id.toString();

  if (!text || !telegramId) return;

  // Проверяем, находится ли пользователь в процессе заполнения формы
  const session = sessionManager.getSession(telegramId);

  if (session) {
    // Обрабатываем ввод формы
    await handleFormInput(ctx);
  } else {
    // Обычное сообщение вне контекста формы
    await ctx.reply('Текстовое сообщение получено. Используйте /help для просмотра доступных команд.');
  }
}
