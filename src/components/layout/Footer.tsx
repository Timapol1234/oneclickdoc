import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border-light bg-transparent">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-sm text-text-secondary">
            © {currentYear} oneclickdoc. Все права защищены.
          </div>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-text-secondary transition-colors hover:text-primary"
            >
              Политика конфиденциальности
            </Link>
            <Link
              href="/terms"
              className="text-sm text-text-secondary transition-colors hover:text-primary"
            >
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
