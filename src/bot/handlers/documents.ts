import type { BotContext } from '../index';
import { prisma } from '@/lib/prisma';
import { InlineKeyboard } from 'grammy';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export async function handleDocuments(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.reply('Ошибка: не удалось определить ваш Telegram ID');
    return;
  }

  try {
    // Находим пользователя
    const user = await prisma.user.findUnique({
      where: { telegramId }
    });

    if (!user) {
      await ctx.reply('Пользователь не найден. Используйте /start для регистрации.');
      return;
    }

    // Получаем документы пользователя
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
      await ctx.reply('У вас пока нет созданных документов. Используйте /templates для создания нового.');
      return;
    }

    const keyboard = new InlineKeyboard();

    let message = '📄 Ваши документы:\n\n';

    documents.forEach((doc, index) => {
      const date = format(new Date(doc.updatedAt), 'dd.MM.yyyy', { locale: ru });
      const status = doc.status === 'generated' ? '✅' : '⏳';

      message += `${index + 1}. ${status} ${doc.title}\n`;
      message += `   Создан: ${date}\n\n`;

      keyboard.text(
        `${index + 1}. ${doc.title}`,
        `document_${doc.id}`
      ).row();
    });

    await ctx.reply(message, {
      reply_markup: keyboard
    });

  } catch (error) {
    console.error('Error in handleDocuments:', error);
    await ctx.reply('Произошла ошибка при загрузке документов.');
  }
}
