'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import TemplateCard from '@/components/templates/TemplateCard'
import TemplateFilter from '@/components/templates/TemplateFilter'
import Input from '@/components/ui/Input'
import Pagination from '@/components/ui/Pagination'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { TemplateCardSkeleton } from '@/components/ui/Skeleton'
import { CATEGORIES } from '@/constants/categories'
import { debounce } from '@/lib/utils'
import type { Template } from '@/types/template'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

function TemplatesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [templates, setTemplates] = useState<Template[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  )
  const [selectedType, setSelectedType] = useState(
    searchParams.get('type') || 'both'
  )
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity')
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get('page') || '1')
  )
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType !== 'both') params.append('type', selectedType)
      params.append('sort', sortBy)
      if (searchQuery) params.append('search', searchQuery)
      params.append('page', currentPage.toString())

      const response = await fetch(`/api/templates?${params.toString()}`)
      const data = await response.json()

      setTemplates(data.templates)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage])

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.append('category', selectedCategory)
    if (selectedType !== 'both') params.append('type', selectedType)
    if (sortBy !== 'popularity') params.append('sort', sortBy)
    if (searchQuery) params.append('search', searchQuery)
    if (currentPage > 1) params.append('page', currentPage.toString())

    router.push(`/templates?${params.toString()}`, { scroll: false })
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage, router])

  // Debounced search
  const debouncedFetch = useCallback(
    debounce(() => {
      fetchTemplates()
    }, 500),
    [fetchTemplates]
  )

  useEffect(() => {
    updateURL()
    debouncedFetch()
  }, [selectedCategory, selectedType, sortBy, searchQuery, currentPage])

  // Filter handlers
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleSortChange = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Определяем текущую категорию для breadcrumbs
  const currentCategory = CATEGORIES.find((c) => c.slug === selectedCategory)

  return (
    <MainLayout>
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <div className="mb-6 animate-fadeIn">
          <Breadcrumbs
            items={[
              { label: 'Шаблоны', href: currentCategory ? '/templates' : undefined },
              ...(currentCategory ? [{ label: currentCategory.name }] : []),
            ]}
          />
        </div>

        {/* Header */}
        <div className="mb-8 animate-slideUp">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-4xl text-primary">
              article
            </span>
            <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
              {currentCategory ? currentCategory.name : 'Все шаблоны'}
            </h1>
          </div>
          <p className="text-text-secondary text-lg">
            {currentCategory
              ? currentCategory.description
              : 'Выберите подходящий шаблон из нашей коллекции'}
          </p>
        </div>

        {/* Search and Mobile Filters Button */}
        <div className="mb-6 flex gap-3 animate-scaleIn animate-delay-100">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              icon="search"
            />
          </div>
          {/* Мобильная кнопка фильтров */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="flex items-center gap-2 rounded-lg border-2 border-border-light bg-white px-4 py-2 text-sm font-medium text-text-primary transition-all hover:border-primary hover:text-primary lg:hidden"
          >
            <span className="material-symbols-outlined text-xl">tune</span>
            <span className="hidden sm:inline">Фильтры</span>
          </button>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters sidebar */}
          <aside className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24 animate-slideDown">
              {/* Заголовок для мобильных */}
              <div className="mb-4 flex items-center justify-between lg:hidden">
                <h3 className="text-lg font-bold text-text-primary">Фильтры</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <TemplateFilter
                selectedCategory={selectedCategory}
                selectedType={selectedType}
                sortBy={sortBy}
                onCategoryChange={handleCategoryChange}
                onTypeChange={handleTypeChange}
                onSortChange={handleSortChange}
              />
            </div>
          </aside>

          {/* Templates grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TemplateCardSkeleton />
                  </div>
                ))}
              </div>
            ) : templates.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border-light bg-background-light py-20 px-6 animate-fadeIn">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <span className="material-symbols-outlined text-5xl text-primary">
                    search_off
                  </span>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-text-primary">
                  Шаблоны не найдены
                </h3>
                <p className="mb-6 max-w-md text-center text-text-secondary">
                  Попробуйте изменить фильтры или поисковый запрос, чтобы найти
                  подходящий шаблон
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => {
                      handleCategoryChange(null)
                      handleTypeChange('both')
                      handleSortChange('popularity')
                      handleSearchChange('')
                    }}
                    className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg"
                  >
                    <span className="material-symbols-outlined text-base">
                      restart_alt
                    </span>
                    <span>Сбросить все фильтры</span>
                  </button>
                  <button
                    onClick={() => (window.location.href = '/templates')}
                    className="flex items-center gap-2 rounded-full border-2 border-primary bg-white px-6 py-3 text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/5"
                  >
                    <span className="material-symbols-outlined text-base">
                      arrow_back
                    </span>
                    <span>Все шаблоны</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-text-secondary">
                  Найдено шаблонов: {pagination.total}
                </div>

                {/* Templates grid */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template, index) => (
                    <div
                      key={template.id}
                      className="animate-slideUp"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TemplateCard template={template} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="container-custom py-8">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-text-secondary">Загрузка...</p>
              </div>
            </div>
          </div>
        </MainLayout>
      }
    >
      <TemplatesContent />
    </Suspense>
  )
}
