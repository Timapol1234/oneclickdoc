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
    console.log('[Bot] Initializing bot...');
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      console.error('[Bot] TELEGRAM_BOT_TOKEN is not defined!');
      throw new Error('TELEGRAM_BOT_TOKEN is not defined');
    }

    console.log('[Bot] Token found, creating bot instance...');
    bot = new Bot<BotContext>(token);

    console.log('[Bot] Registering handlers...');
    // Регистрируем обработчики синхронно
    registerHandlers(bot);
    console.log('[Bot] Bot initialized successfully');
  }

  return bot;
}

export function getBotWebhook() {
  return webhookCallback(getBot(), 'std/http');
}
