import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createVerificationCode } from '@/lib/verification'
import { sendVerificationEmail } from '@/lib/email'
import { sendVerificationSMS } from '@/lib/sms'

const sendCodeSchema = z.object({
  identifier: z.string().min(1, 'Укажите email или телефон'),
  type: z.enum(['email', 'phone'], {
    errorMap: () => ({ message: 'Тип должен быть email или phone' }),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация входных данных
    const validatedData = sendCodeSchema.parse(body)
    const { identifier, type } = validatedData

    // Дополнительная валидация формата
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(identifier)) {
        return NextResponse.json(
          { error: 'Неверный формат email' },
          { status: 400 }
        )
      }
    } else if (type === 'phone') {
      const phoneRegex = /^\+?[0-9]{10,15}$/
      const cleanPhone = identifier.replace(/\D/g, '')
      if (cleanPhone.length < 10 || cleanPhone.length > 15) {
        return NextResponse.json(
          { error: 'Неверный формат номера телефона' },
          { status: 400 }
        )
      }
    }

    // Создаем код верификации
    const code = await createVerificationCode(identifier, type)

    // Отправляем код
    let result: { success: boolean; error?: string }

    if (type === 'email') {
      result = await sendVerificationEmail(identifier, code)
    } else {
      result = await sendVerificationSMS(identifier, code)
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Ошибка при отправке кода' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Код отправлен',
        expiresIn: 600, // 10 минут в секундах
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Send verification code error:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке кода' },
      { status: 500 }
    )
  }
}
