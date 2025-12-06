import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Вход в личный кабинет | МойДокумент',
  description:
    'Войдите в личный кабинет для доступа к вашим сохраненным заявлениям и документам. Быстрый и безопасный вход.',
  openGraph: {
    title: 'Вход в личный кабинет',
    description: 'Войдите в личный кабинет конструктора заявлений',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru/login',
  },
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
