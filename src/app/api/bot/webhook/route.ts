import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/bot';

export async function POST(request: NextRequest) {
  try {
    console.log('[Webhook] Received request from Telegram');
    const body = await request.json();
    console.log('[Webhook] Update:', JSON.stringify(body, null, 2));

    const bot = await getBot();
    console.log('[Webhook] Bot initialized, processing update...');

    await bot.handleUpdate(body);
    console.log('[Webhook] Update processed successfully');

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    console.error('[Webhook] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Telegram bot webhook endpoint' });
}
