'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  transparent?: boolean
}

export default function Header({ transparent = false }: HeaderProps) {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Отслеживание скролла
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Шаблоны', href: '/templates' },
    ...(session ? [{ name: 'Документы', href: '/dashboard' }] : []),
  ]

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header
      className={cn(
        'fixed left-0 right-0 top-0 z-40 px-4 transition-all duration-300 sm:px-6 lg:px-8',
        transparent && !scrolled
          ? 'bg-transparent py-4'
          : scrolled
          ? 'border-b border-border-light bg-white/95 py-3 shadow-md backdrop-blur-lg'
          : 'border-b-2 border-border-light bg-white py-4'
      )}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="oneclickdoc logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-text-primary">
            oneclickdoc
          </h2>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden flex-1 items-center justify-end gap-6 md:flex">
          <nav className="flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium leading-normal transition-all duration-200',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-slideUp"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex gap-2">
            {status === 'loading' ? (
              <div className="h-10 w-20 animate-pulse rounded-full bg-gray-200"></div>
            ) : session ? (
              <>
                <div className="flex items-center gap-2 px-4 text-sm text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    account_circle
                  </span>
                  <span>{session.user?.name || session.user?.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-primary bg-transparent px-4 text-sm font-bold leading-normal tracking-[0.015em] text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="truncate">Выйти</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/register">
                  <button className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary-accent px-4 text-sm font-bold leading-normal tracking-[0.015em] text-white transition-colors hover:bg-primary">
                    <span className="truncate">Регистрация</span>
                  </button>
                </Link>
                <Link href="/login">
                  <button className="flex h-10 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-primary bg-transparent px-4 text-sm font-bold leading-normal tracking-[0.015em] text-primary transition-colors hover:bg-primary/10">
                    <span className="truncate">Войти</span>
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined text-text-primary">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full border-b border-border-light bg-white shadow-lg">
          <nav className="flex flex-col p-4">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 text-base font-medium transition-colors rounded-lg',
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile actions */}
            <div className="mt-4 flex flex-col gap-2 border-t border-border-light pt-4">
              {status === 'loading' ? (
                <div className="h-10 animate-pulse rounded-full bg-gray-200"></div>
              ) : session ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary">
                    <span className="material-symbols-outlined text-primary">
                      account_circle
                    </span>
                    <span className="truncate">{session.user?.name || session.user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="w-full rounded-full border border-primary bg-transparent px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-full bg-primary-accent px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary">
                      Регистрация
                    </button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full rounded-full border border-primary bg-transparent px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10">
                      Войти
                    </button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
