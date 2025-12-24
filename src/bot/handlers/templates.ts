import type { BotContext } from '../index';
import { prisma } from '@/lib/prisma';
import { InlineKeyboard } from 'grammy';

export async function handleTemplates(ctx: BotContext) {
  try {
    // Получаем все активные категории с шаблонами
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
      await ctx.reply('К сожалению, пока нет доступных шаблонов.');
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

    await ctx.reply(
      '📋 Выберите категорию заявлений:',
      { reply_markup: keyboard }
    );

  } catch (error) {
    console.error('Error in handleTemplates:', error);
    await ctx.reply('Произошла ошибка при загрузке шаблонов.');
  }
}
