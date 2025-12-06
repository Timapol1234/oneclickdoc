'use client'

import { CATEGORIES } from '@/constants/categories'
import Card from '@/components/ui/Card'
import Checkbox from '@/components/ui/Checkbox'

interface TemplateFilterProps {
  selectedCategory: string | null
  selectedType: string
  sortBy: string
  onCategoryChange: (category: string | null) => void
  onTypeChange: (type: string) => void
  onSortChange: (sort: string) => void
}

export default function TemplateFilter({
  selectedCategory,
  selectedType,
  sortBy,
  onCategoryChange,
  onTypeChange,
  onSortChange,
}: TemplateFilterProps) {
  // Проверяем, есть ли активные фильтры
  const hasActiveFilters =
    selectedCategory !== null || selectedType !== 'both' || sortBy !== 'popularity'

  const handleResetFilters = () => {
    onCategoryChange(null)
    onTypeChange('both')
    onSortChange('popularity')
  }

  return (
    <div className="space-y-4">
      {/* Заголовок с кнопкой сброса */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Фильтры</h3>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary-dark"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            <span>Сбросить</span>
          </button>
        )}
      </div>
      {/* Categories Filter */}
      <Card>
        <h3 className="mb-4 text-base font-semibold text-text-primary">
          Категории
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
              selectedCategory === null
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-background-light hover:text-text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-110">
              select_all
            </span>
            <span className="text-sm font-medium">Все категории</span>
          </button>

          {CATEGORIES.map((category) => (
            <button
              key={category.slug}
              onClick={() => onCategoryChange(category.slug)}
              className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-all duration-200 ${
                selectedCategory === category.slug
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-background-light hover:text-text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-110">
                {category.icon}
              </span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Applicant Type Filter */}
      <Card>
        <h3 className="mb-4 text-base font-semibold text-text-primary">
          Тип заявителя
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedType === 'both'}
              onChange={() => onTypeChange('both')}
            />
            <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
              Все
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedType === 'physical'}
              onChange={() => onTypeChange('physical')}
            />
            <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
              Физическое лицо
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={selectedType === 'legal'}
              onChange={() => onTypeChange('legal')}
            />
            <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
              Юридическое лицо
            </span>
          </label>
        </div>
      </Card>

      {/* Sort Filter */}
      <Card>
        <h3 className="mb-4 text-base font-semibold text-text-primary">
          Сортировка
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={sortBy === 'popularity'}
              onChange={() => onSortChange('popularity')}
            />
            <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
              По популярности
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={sortBy === 'name'}
              onChange={() => onSortChange('name')}
            />
            <span className="text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
              По алфавиту
            </span>
          </label>
        </div>
      </Card>
    </div>
  )
}
