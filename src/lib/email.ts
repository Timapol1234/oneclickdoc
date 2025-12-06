/**
 * Утилиты для отправки email через Resend или Nodemailer
 */

import nodemailer from 'nodemailer'

interface EmailResponse {
  id?: string
  error?: {
    message: string
    name: string
  }
}

/**
 * Отправка email через Resend API
 */
/**
 * Отправка email через Nodemailer (для Gmail, Yandex и др.)
 */
async function sendEmailViaNodemailer(params: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER || ''
    const smtpPassword = process.env.SMTP_PASSWORD || ''

    // Определяем провайдера по домену email
    let transportConfig: any = {
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    }

    // Настройки для разных провайдеров
    if (smtpUser.includes('@gmail.com')) {
      transportConfig = {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      }
    } else if (smtpUser.includes('@yandex')) {
      transportConfig = {
        service: 'yandex',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      }
    }

    const transporter = nodemailer.createTransport(transportConfig)

    // Отправляем с красивым именем отправителя
    await transporter.sendMail({
      from: `"МойДокумент Support" <${smtpUser}>`,
      replyTo: 'support@mydocuments.ru', // Ответы пойдут на этот адрес
      to: params.to,
      subject: params.subject,
      html: params.html,
    })

    console.log('✅ Email отправлен через Nodemailer')
    return { success: true }
  } catch (error) {
    console.error('Nodemailer error:', error)
    return {
      success: false,
      error: 'Ошибка отправки email через Nodemailer',
    }
  }
}

export async function sendEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const fromEmail = process.env.EMAIL_FROM || 'noreply@goszayavleniya.ru'
  const isDev = process.env.NODE_ENV === 'development'

  // Если есть SMTP настройки - используем Nodemailer
  if (smtpUser && smtpPassword) {
    return sendEmailViaNodemailer(params)
  }

  // Если нет API ключа - выводим в консоль (для разработки)
  if (!apiKey) {
    console.log('📧 Email (dev mode - no API key):')
    console.log(`   To: ${params.to}`)
    console.log(`   Subject: ${params.subject}`)
    console.log(`   HTML: ${params.html}`)
    return { success: true }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 секунд

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const data: EmailResponse = await response.json()

    if (response.ok && data.id) {
      return { success: true }
    } else {
      console.error('Resend error:', data.error)

      // В dev mode выводим в консоль как fallback
      if (isDev) {
        console.log('📧 Email (dev mode - API error fallback):')
        console.log(`   To: ${params.to}`)
        console.log(`   Subject: ${params.subject}`)
        return { success: true }
      }

      return {
        success: false,
        error: data.error?.message || 'Ошибка отправки email',
      }
    }
  } catch (error) {
    console.error('Email send error:', error)

    // В dev mode выводим в консоль как fallback при ошибке подключения
    if (isDev) {
      const extractedCode = extractCodeFromHtml(params.html)
      console.log('📧 Email (dev mode - connection error fallback):')
      console.log(`   To: ${params.to}`)
      console.log(`   Subject: ${params.subject}`)
      if (extractedCode) {
        console.log(`   Код верификации: ${extractedCode}`)
      }
      return { success: true }
    }

    return {
      success: false,
      error: 'Ошибка при отправке email',
    }
  }
}

/**
 * Извлекает код из HTML письма (для dev mode)
 */
function extractCodeFromHtml(html: string): string | null {
  const match = html.match(/<div[^>]*>([0-9]{6})<\/div>/)
  return match ? match[1] : null
}

/**
 * Отправка кода верификации по email
 */
export async function sendVerificationEmail(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const isDev = process.env.NODE_ENV === 'development'

  // В dev mode сразу выводим код в консоль
  if (isDev) {
    console.log('\n' + '='.repeat(60))
    console.log('📧 КОД ВЕРИФИКАЦИИ (DEV MODE)')
    console.log('='.repeat(60))
    console.log(`Email: ${email}`)
    console.log(`Код: ${code}`)
    console.log('='.repeat(60) + '\n')
  }

  const html = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Код подтверждения</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">МойДокумент</h1>
        </div>

        <div style="padding: 40px 30px;">
          <h2 style="color: #333; margin: 0 0 20px 0; font-size: 20px;">Подтверждение регистрации</h2>

          <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">
            Здравствуйте! Вы получили это письмо, потому что кто-то использовал ваш email для регистрации в сервисе "МойДокумент".
          </p>

          <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">
            Ваш код подтверждения:
          </p>

          <div style="background-color: #f8f9fa; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 0 0 30px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>

          <p style="color: #666; line-height: 1.6; margin: 0 0 10px 0; font-size: 14px;">
            Код действителен в течение <strong>10 минут</strong>.
          </p>

          <p style="color: #999; line-height: 1.6; margin: 30px 0 0 0; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
            Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
          </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #999;">
          <p style="margin: 0;">© 2024 МойДокумент. Все права защищены.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: 'Код подтверждения - МойДокумент',
    html,
  })
}
