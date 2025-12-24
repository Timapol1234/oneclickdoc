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
let botInitPromise: Promise<Bot<BotContext>> | null = null;

export async function getBot(): Promise<Bot<BotContext>> {
  if (!bot) {
    if (!botInitPromise) {
      botInitPromise = (async () => {
        console.log('[Bot] Initializing bot...');
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) {
          console.error('[Bot] TELEGRAM_BOT_TOKEN is not defined!');
          throw new Error('TELEGRAM_BOT_TOKEN is not defined');
        }

        console.log('[Bot] Token found, creating bot instance...');
        const newBot = new Bot<BotContext>(token);

        console.log('[Bot] Calling bot.init()...');
        await newBot.init();

        console.log('[Bot] Registering handlers...');
        registerHandlers(newBot);
        console.log('[Bot] Bot initialized successfully');

        bot = newBot;
        return newBot;
      })();
    }
    return botInitPromise;
  }

  return bot;
}

export async function getBotWebhook() {
  const bot = await getBot();
  return webhookCallback(bot, 'std/http');
}
