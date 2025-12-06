import { prisma } from '@/lib/prisma'

/**
 * Генерирует случайный 6-значный код
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Создает код верификации в базе данных
 */
export async function createVerificationCode(
  identifier: string,
  type: 'email' | 'phone'
): Promise<string> {
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 минут

  // Удаляем старые неиспользованные коды для этого identifier
  await prisma.verificationCode.deleteMany({
    where: {
      identifier,
      verified: false,
    },
  })

  // Создаем новый код
  await prisma.verificationCode.create({
    data: {
      identifier,
      code,
      type,
      expiresAt,
      verified: false,
    },
  })

  return code
}

/**
 * Проверяет код верификации
 */
export async function verifyCode(
  identifier: string,
  code: string
): Promise<{
  success: boolean
  error?: string
  type?: 'email' | 'phone'
}> {
  const verificationCode = await prisma.verificationCode.findFirst({
    where: {
      identifier,
      code,
      verified: false,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!verificationCode) {
    return {
      success: false,
      error: 'Неверный код подтверждения',
    }
  }

  // Проверяем, не истек ли срок действия кода
  if (verificationCode.expiresAt < new Date()) {
    return {
      success: false,
      error: 'Срок действия кода истек',
    }
  }

  // Помечаем код как использованный
  await prisma.verificationCode.update({
    where: { id: verificationCode.id },
    data: { verified: true },
  })

  return {
    success: true,
    type: verificationCode.type as 'email' | 'phone',
  }
}

/**
 * Очищает истекшие коды верификации (можно вызывать по крону)
 */
export async function cleanupExpiredCodes(): Promise<number> {
  const result = await prisma.verificationCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })

  return result.count
}
