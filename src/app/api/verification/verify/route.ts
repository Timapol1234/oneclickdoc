import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyCode } from '@/lib/verification'

const verifyCodeSchema = z.object({
  identifier: z.string().min(1, 'Укажите email или телефон'),
  code: z
    .string()
    .length(6, 'Код должен состоять из 6 цифр')
    .regex(/^\d{6}$/, 'Код должен содержать только цифры'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация входных данных
    const validatedData = verifyCodeSchema.parse(body)
    const { identifier, code } = validatedData

    // Проверяем код
    const result = await verifyCode(identifier, code)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      {
        message: 'Код подтвержден',
        type: result.type,
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

    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке кода' },
      { status: 500 }
    )
  }
}
