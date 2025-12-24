import { NextRequest, NextResponse } from 'next/server';
import { getBot } from '@/bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bot = getBot();

    await bot.handleUpdate(body);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Telegram bot webhook endpoint' });
}
