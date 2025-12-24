import type { BotContext } from '../index';
import { prisma } from '@/lib/prisma';
import { InlineKeyboard } from 'grammy';

export async function handleStart(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  if (!telegramId) {
    await ctx.reply('Ошибка: не удалось определить ваш Telegram ID');
    return;
  }

  try {
    // Проверяем, существует ли пользователь
    let user = await prisma.user.findUnique({
      where: { telegramId }
    });

    // Если пользователя нет, создаем
    if (!user) {
      const name = [firstName, lastName].filter(Boolean).join(' ') || username || 'Пользователь';

      user = await prisma.user.create({
        data: {
          telegramId,
          name: name,
        }
      });
    }

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

    await ctx.reply(welcomeMessage, {
      reply_markup: keyboard
    });

  } catch (error) {
    console.error('Error in handleStart:', error);
    await ctx.reply('Произошла ошибка. Попробуйте позже.');
  }
}
