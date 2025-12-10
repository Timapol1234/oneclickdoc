'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import axios from 'axios'
import { DocumentCard } from '@/components/documents/DocumentCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import MainLayout from '@/components/layout/MainLayout'

interface Document {
  id: string
  title: string
  status: 'draft' | 'generated'
  createdAt: string
  updatedAt: string
  template: {
    id: number
    title: string
    category: {
      name: string
    }
  }
  pdfUrl?: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date')

  // Редирект на логин если не авторизован
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // Загрузка документов
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!session) return

      try {
        const response = await axios.get('/api/documents')
        setDocuments(response.data)
        setFilteredDocuments(response.data)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching documents:', error)
        setIsLoading(false)
      }
    }

    if (session) {
      fetchDocuments()
    }
  }, [session])

  // Фильтрация и сортировка
  useEffect(() => {
    let result = [...documents]

    // Поиск
    if (searchQuery) {
      result = result.filter((doc) =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      result = result.filter((doc) => doc.status === statusFilter)
    }

    // Сортировка
    if (sortBy === 'date') {
      result.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
    }

    setFilteredDocuments(result)
  }, [documents, searchQuery, statusFilter, sortBy])

  const handleDocumentDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const handleCreateNew = () => {
    router.push('/templates')
  }

  if (status === 'loading' || isLoading) {
    return (
      <MainLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-primary">
              progress_activity
            </span>
            <p className="mt-4 text-gray-600">Загрузка документов...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Заголовок */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Документы
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Всего документов: {documents.length}
            </p>
          </div>
          <Button onClick={handleCreateNew} className="w-full sm:w-auto">
            <span className="material-symbols-outlined mr-2">add</span>
            Создать документ
          </Button>
        </div>

        {/* Фильтры и поиск */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
          {/* Поиск */}
          <Input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon="search"
          />

          {/* Фильтр по статусу */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Все статусы' },
              { value: 'draft', label: 'Черновики' },
              { value: 'generated', label: 'Сгенерированные' },
            ]}
          />

          {/* Сортировка */}
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={[
              { value: 'date', label: 'По дате изменения' },
              { value: 'name', label: 'По названию' },
            ]}
          />
        </div>

        {/* Список документов */}
        {filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 py-12 sm:py-16 px-4">
            <span className="material-symbols-outlined text-5xl sm:text-6xl text-gray-300">
              description
            </span>
            <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900 text-center">
              {searchQuery || statusFilter !== 'all'
                ? 'Документы не найдены'
                : 'У вас пока нет документов'}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-gray-500 text-center max-w-md">
              {searchQuery || statusFilter !== 'all'
                ? 'Попробуйте изменить параметры поиска'
                : 'Начните создание документа из готового шаблона'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button className="mt-6 w-full sm:w-auto" onClick={handleCreateNew}>
                <span className="material-symbols-outlined mr-2">add</span>
                Создать первый документ
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDocumentDelete}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
