import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LiveSearch from '@/components/ui/LiveSearch'

export const metadata: Metadata = {
  title: 'Мои документы | Создайте заявление за 5 минут бесплатно',
  description:
    'Простой конструктор для создания юридически верных заявлений в МФЦ, суды, банки, ФНС. Более 50 готовых шаблонов документов. Бесплатно и без регистрации.',
  keywords:
    'заявление онлайн, конструктор заявлений, шаблоны заявлений, МФЦ заявление, исковое заявление, налоговый вычет, претензия в банк, документы онлайн',
  openGraph: {
    title: 'Мои документы | Создайте документ за 5 минут',
    description:
      'Создавайте юридически корректные заявления для МФЦ, судов, банков и других организаций. Просто, быстро, бесплатно.',
    type: 'website',
    locale: 'ru_RU',
    url: 'https://goszayavleniya.ru',
    siteName: 'Мои документы',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Мои документы | Создайте документ за 5 минут',
    description:
      'Создавайте юридически корректные заявления для МФЦ, судов, банков. Бесплатно.',
  },
  alternates: {
    canonical: 'https://goszayavleniya.ru',
  },
}

export default function HomePage() {
  const popularCategories = [
    { label: 'В МФЦ', href: '/templates?category=mfc-gosuslugi' },
    { label: 'В Суд', href: '/templates?category=courts' },
    { label: 'В Банк', href: '/templates?category=banks' },
    { label: 'Претензия', href: '/templates' },
  ]

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-primary/30 to-primary-accent/20 blur-3xl"></div>
        <div className="absolute -right-20 bottom-20 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-primary-accent/25 to-primary/15 blur-3xl"></div>
        <div className="absolute left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl"></div>
        <div className="absolute right-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-primary-accent/20 blur-2xl"></div>
      </div>

      <div className="relative z-10 flex h-full grow flex-col">
        <Header transparent />

        <main className="flex flex-grow items-center justify-center px-4 pt-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl text-center">
            {/* Title with decorative element */}
            <div className="mb-8">
              <div className="mb-4 inline-flex animate-slideDown items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm">
                <span className="material-symbols-outlined text-base">verified</span>
                <span>Юридически верные документы</span>
              </div>
              <h1 className="animate-slideUp font-display text-4xl font-bold leading-tight tracking-tight text-text-primary sm:text-5xl">
                Ваши документы. Просто и быстро.
              </h1>
            </div>

            {/* Live search with autocomplete */}
            <div className="animate-scaleIn animate-delay-200">
              <LiveSearch />
            </div>

            {/* Popular categories with icons */}
            <div className="animate-fadeIn animate-delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
              <span className="mr-2 text-sm font-medium text-text-secondary">
                Популярное:
              </span>
              {popularCategories.map((category, index) => (
                <Link key={category.label} href={category.href}>
                  <button
                    className="group rounded-full border-2 border-border-light bg-content-light px-4 py-2 text-sm font-medium leading-normal shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md hover:scale-105"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    {category.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Stats or features */}
            <div className="animate-fadeIn animate-delay-400 mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">check_circle</span>
                <span>Более 50 шаблонов</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">schedule</span>
                <span>5-10 минут</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                <span>100% бесплатно</span>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
