import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
  name: z.string().min(2, 'Имя должно быть не менее 2 символов').optional(),
  verificationCode: z
    .string()
    .length(6, 'Код должен состоять из 6 цифр')
    .regex(/^\d{6}$/, 'Код должен содержать только цифры'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = registerSchema.parse(body)
    const { email, password, name, verificationCode } = validatedData

    // Проверяем код верификации
    const verification = await prisma.verificationCode.findFirst({
      where: {
        identifier: email,
        code: verificationCode,
        verified: true,
        type: 'email',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!verification) {
      return NextResponse.json(
        { error: 'Неверный или неподтвержденный код' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
      },
    })

    // Удаляем использованный код верификации
    await prisma.verificationCode.deleteMany({
      where: {
        identifier: email,
      },
    })

    return NextResponse.json(
      {
        message: 'Регистрация успешна',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    )
  }
}
