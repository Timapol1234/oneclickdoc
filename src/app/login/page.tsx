'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MainLayout from '@/components/layout/MainLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        identifier: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="container-custom py-16">
        <div className="mx-auto max-w-md">
          <Card>
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-2xl font-bold text-text-primary">
                Вход в систему
              </h1>
              <p className="text-sm text-text-secondary">
                Войдите в свой аккаунт, чтобы продолжить
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  icon="mail"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Пароль
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  icon="lock"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-text-secondary">
              Нет аккаунта?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline"
              >
                Зарегистрироваться
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
