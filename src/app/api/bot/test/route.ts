import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
    const tokenPrefix = process.env.TELEGRAM_BOT_TOKEN?.substring(0, 10);
    const webhookUrl = process.env.WEBHOOK_URL || process.env.VERCEL_URL;

    return NextResponse.json({
      hasToken,
      tokenPrefix: tokenPrefix ? `${tokenPrefix}...` : 'not set',
      webhookUrl,
      env: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error)
    }, { status: 500 });
  }
}
