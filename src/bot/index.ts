import { Bot, webhookCallback } from 'grammy';
import type { Context } from 'grammy';
import { registerHandlers } from './handlers';

export interface BotContext extends Context {
  session?: {
    userId?: string;
    currentTemplate?: string;
    formData?: Record<string, any>;
    currentStep?: number;
  };
}

let bot: Bot<BotContext> | null = null;

export function getBot(): Bot<BotContext> {
  if (!bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    bot = new Bot<BotContext>(token);

    // Регистрируем обработчики синхронно
    registerHandlers(bot);
  }

  return bot;
}

export function getBotWebhook() {
  return webhookCallback(getBot(), 'std/http');
}
