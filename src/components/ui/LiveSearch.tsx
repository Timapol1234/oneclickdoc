'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Template {
  id: string
  title: string
  description: string
  categoryId: string
}

export default function LiveSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Template[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchTemplates = async () => {
      if (query.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      try {
        // Для SQLite преобразуем запрос в нижний регистр
        const searchQuery = query.toLowerCase()
        const response = await fetch(`/api/templates?search=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()

        // Фильтруем результаты на клиенте без учета регистра
        const filteredResults = (data.templates || []).filter((template: Template) =>
          template.title.toLowerCase().includes(searchQuery) ||
          template.description.toLowerCase().includes(searchQuery)
        )

        setResults(filteredResults.slice(0, 5)) // Показываем только первые 5 результатов
        setIsOpen(true)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(searchTemplates, 300)
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/templates?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Gradient blur effect */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary/20 to-primary-accent/20 blur-xl"></div>

      <form onSubmit={handleSubmit} className="relative">
        <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl text-text-secondary">
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="placeholder:text-text-secondary focus:ring-primary focus:border-primary h-12 sm:h-16 w-full rounded-xl border-2 border-border-light bg-content-light pl-11 sm:pl-14 pr-12 sm:pr-4 text-sm sm:text-lg shadow-xl transition-all focus:ring-2"
          placeholder="Найти шаблон..."
        />
        {isLoading && (
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        )}
      </form>

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full rounded-xl border-2 border-border-light bg-white shadow-2xl z-50">
          <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
            {results.map((template, index) => (
              <Link
                key={template.id}
                href={`/create/${template.id}`}
                onClick={() => {
                  setIsOpen(false)
                  setQuery('')
                }}
                className={`block border-b border-border-light p-3 sm:p-4 transition-colors hover:bg-primary/5 ${
                  index === results.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="material-symbols-outlined mt-0.5 sm:mt-1 text-lg sm:text-xl text-primary">description</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base text-text-primary">{template.title}</h3>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-text-secondary line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-base sm:text-xl text-text-secondary flex-shrink-0">arrow_forward</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-border-light bg-gray-50 px-3 sm:px-4 py-2 sm:py-3">
            <Link
              href={`/templates?search=${encodeURIComponent(query)}`}
              onClick={() => setIsOpen(false)}
              className="text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Показать все результаты →
            </Link>
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && query.length >= 2 && results.length === 0 && (
        <div className="absolute mt-2 w-full rounded-xl border-2 border-border-light bg-white p-4 sm:p-6 text-center shadow-2xl z-50">
          <span className="material-symbols-outlined mb-2 text-3xl sm:text-4xl text-text-secondary">search_off</span>
          <p className="text-sm sm:text-base text-text-secondary">Ничего не найдено</p>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Попробуйте изменить запрос или{' '}
            <Link href="/templates" className="text-primary hover:underline">
              просмотреть все шаблоны
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
