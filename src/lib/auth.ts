import { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        identifier: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Неверные данные')
        }

        // Определяем, является ли идентификатор email или телефоном
        const isEmail = credentials.identifier.includes('@')

        // Ищем пользователя по email или телефону
        const user = await prisma.user.findFirst({
          where: isEmail
            ? { email: credentials.identifier }
            : { phone: credentials.identifier },
        })

        if (!user || !user.passwordHash) {
          throw new Error('Пользователь не найден')
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        if (!isValid) {
          throw new Error('Неверный пароль')
        }

        return {
          id: user.id,
          email: user.email || undefined,
          phone: user.phone || undefined,
          name: user.name,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as any).id = token.id
        ;(session.user as any).phone = token.phone
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
