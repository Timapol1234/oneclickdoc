import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/bot';

export async function POST(request: NextRequest) {
  try {
    const bot = await getBot();
    const webhookUrl = process.env.WEBHOOK_URL || process.env.VERCEL_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'WEBHOOK_URL or VERCEL_URL environment variable is not set' },
        { status: 400 }
      );
    }

    const fullWebhookUrl = webhookUrl.startsWith('http')
      ? `${webhookUrl}/api/bot/webhook`
      : `https://${webhookUrl}/api/bot/webhook`;

    await bot.api.setWebhook(fullWebhookUrl);

    return NextResponse.json({
      ok: true,
      message: 'Webhook set successfully',
      url: fullWebhookUrl
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to set webhook' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bot = await getBot();
    const info = await bot.api.getWebhookInfo();

    return NextResponse.json({
      ok: true,
      webhook: info
    });
  } catch (error) {
    console.error('Error getting webhook info:', error);
    return NextResponse.json(
      { error: 'Failed to get webhook info' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const bot = await getBot();
    await bot.api.deleteWebhook();

    return NextResponse.json({
      ok: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return NextResponse.json(
      { error: 'Failed to delete webhook' },
      { status: 500 }
    );
  }
}
