import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Личный кабинет | oneclickdoc',
  description:
    'Управляйте своими заявлениями и документами в личном кабинете. Просматривайте, редактируйте и скачивайте созданные документы.',
  openGraph: {
    title: 'Личный кабинет | oneclickdoc',
    description: 'Управление заявлениями и документами',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://oneclickdoc.ru/dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
