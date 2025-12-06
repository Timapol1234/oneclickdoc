import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { Template } from '@/types/template'

interface TemplateCardProps {
  template: Template
}

export default function TemplateCard({ template }: TemplateCardProps) {
  // Вычисляем метрики
  const fieldCount = template.formFields?.length || 0
  const stepCount = template.formFields
    ? Math.max(...template.formFields.map((f) => f.stepNumber), 0)
    : 0

  // Примерное время: 1 минута на поле + 2 минуты базовое
  const estimatedMinutes = Math.max(3, Math.ceil(fieldCount * 0.8 + 2))

  return (
    <Link href={`/create/${template.id}`}>
      <Card hoverable className="group h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="flex flex-col gap-3">
          {/* Header with category icon */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {template.category && (
                <span className="material-symbols-outlined text-2xl text-primary">
                  {template.category.icon}
                </span>
              )}
              <Badge variant="secondary" className="text-xs">
                {template.category?.name}
              </Badge>
            </div>

            {/* Applicant type badge */}
            <Badge
              variant={template.applicantType === 'physical' ? 'primary' : 'secondary'}
              className="text-xs"
            >
              {template.applicantType === 'physical'
                ? 'Физ. лицо'
                : template.applicantType === 'legal'
                ? 'Юр. лицо'
                : 'Оба'}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
            {template.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-text-secondary line-clamp-3 flex-grow">
            {template.description}
          </p>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-background-light px-2 py-1 text-xs text-text-secondary"
                >
                  {tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="rounded-full bg-background-light px-2 py-1 text-xs text-text-secondary">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Метрики */}
          <div className="flex items-center justify-between border-t border-border-light pt-3 text-xs text-text-secondary">
            <div className="flex items-center gap-4">
              {/* Время */}
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-base text-primary">
                  schedule
                </span>
                <span className="font-medium">{estimatedMinutes} мин</span>
              </div>

              {/* Количество полей */}
              {fieldCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">
                    article
                  </span>
                  <span className="font-medium">{fieldCount} полей</span>
                </div>
              )}

              {/* Количество шагов */}
              {stepCount > 0 && (
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-base text-primary">
                    steps
                  </span>
                  <span className="font-medium">{stepCount} шагов</span>
                </div>
              )}
            </div>

            {/* Индикатор популярности */}
            {template.popularityScore > 50 && (
              <div className="flex items-center gap-1 text-warning">
                <span className="material-symbols-outlined text-base">
                  local_fire_department
                </span>
                <span className="font-semibold">Топ</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}
