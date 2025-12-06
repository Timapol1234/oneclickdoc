import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      <Link
        href="/"
        className="flex items-center text-text-secondary transition-colors hover:text-primary"
      >
        <span className="material-symbols-outlined text-base">home</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-text-secondary">
            chevron_right
          </span>
          {item.href ? (
            <Link
              href={item.href}
              className="text-text-secondary transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-text-primary">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
